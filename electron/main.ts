import { app, autoUpdater, BrowserWindow, dialog, ipcMain, Menu, shell } from "electron";
import type { DownloadItem, MenuItemConstructorOptions, OpenDialogOptions, SaveDialogOptions, Session } from "electron";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ProjectLibrary } from "./projectLibrary.js";
import {
  atomicWriteUtf8File,
  ensureProjectWorkspace,
  resolveProjectWorkspacePaths,
  type ProjectWorkspacePaths
} from "./projectWorkspace.js";
import {
  keepEditingChoiceId,
  resolveUnsavedCloseAction,
  saveAndCloseChoiceId
} from "./unsavedCloseDialog.js";
import { resolveUpdateFeedConfig } from "./updateFeedConfig.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
const menuCommandChannel = "grooveforge:menu-command";
const closeWindowChannel = "grooveforge:close-window";
const isLaunchSmoke = process.env.GROOVEFORGE_DESKTOP_LAUNCH_SMOKE === "1";
const isProjectIoSmoke = process.env.GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE === "1";
const isCloseFlowSmoke = process.env.GROOVEFORGE_DESKTOP_CLOSE_FLOW_SMOKE === "1";
const isManualQa = process.env.GROOVEFORGE_DESKTOP_MANUAL_QA === "1";
const isManualQaAutoSong =
  isManualQa &&
  (process.env.GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_SONG === "1" || process.argv.includes("--auto-song-qa"));
const isManualQaAutoMovement =
  isManualQa &&
  (process.env.GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_MOVEMENT === "1" || process.argv.includes("--auto-movement-qa"));
const isManualQaAutoExit =
  isManualQa &&
  (process.env.GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_EXIT === "1" || isManualQaAutoSong || isManualQaAutoMovement);
const isDesktopSmoke = isLaunchSmoke || isProjectIoSmoke || isCloseFlowSmoke || isManualQa;
const ownsSingleInstanceLock = isDesktopSmoke || app.requestSingleInstanceLock();
if (!ownsSingleInstanceLock) {
  app.quit();
}
const launchSmokeDrumGridSnapshotChannel = "grooveforge:launch-smoke-drum-grid-snapshot";
const launchSmokeNoteGridSnapshotChannel = "grooveforge:launch-smoke-note-grid-snapshot";
const launchSmokeResultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
const launchSmokeProgressPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_PROGRESS ";
const projectIoSmokeResultPrefix = "GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE_RESULT ";
const closeFlowSmokeResultPrefix = "GROOVEFORGE_DESKTOP_CLOSE_FLOW_SMOKE_RESULT ";
const manualQaResultPrefix = "GROOVEFORGE_DESKTOP_MANUAL_QA_RESULT ";
const launchSmokeTimeoutMs = 1800000;
const launchSmokePaletteUiSettleTimeoutMs = 10_000;
// Sequential upper bound after skipping the hook's duplicate starter routes:
// mode-tool settles 250 s, two native starter analysis/result/follow-up paths
// 270 s, chord/palette settles 40 s, and hook/IPC/native-click margin 140 s.
// Keep the parent strictly above 700 s and below the global 30 minute budget.
const launchSmokePaletteBoundedChildBudgetMs = 700_000;
const launchSmokePaletteTimeoutMs = 900_000;
const projectIoSmokeTimeoutMs = 180000;
const closeFlowSmokeTimeoutMs = 240000;
const closeFlowSmokeExpectedTitle = "Close Flow Smoke Beat";
// Mirrors the renderer/domain 1,500,000-character contract at the native IPC boundary.
const maxNativeProjectFileCharacters = 1_500_000;
const maxNativeProjectFileBytes = maxNativeProjectFileCharacters * 4;
const manualQaSentinelName = ".grooveforge-manual-qa-owned.json";
const manualQaSentinelOwner = "GrooveForge desktop manual QA";
const manualQaProvenanceMarker = "grooveforge-manual-qa-provenance-v2";
const manualQaProvenanceSourceEntries = [
  "electron",
  "harness/scripts/run_desktop_manual_qa.mjs",
  "src",
  "index.html",
  "package.json",
  "package-lock.json",
  "tsconfig.electron.json",
  "tsconfig.json",
  "vite.config.ts"
] as const;
const manualQaProvenanceBuildRoots = ["dist", "dist-electron"] as const;
const manualQaProvenanceElectronMainPath = "dist-electron/main.js";
const manualQaProvenanceRequiredBuildFiles = [
  "dist/index.html",
  manualQaProvenanceElectronMainPath,
  "dist-electron/preload.cjs"
] as const;

type ManualQaArtifactProvenance = {
  bytes: number;
  modifiedAtMs: number;
  relativePath: string;
  sha256: string;
};

type ManualQaProvenance = {
  builtBundle: {
    fileCount: number;
    files: ManualQaArtifactProvenance[];
    latestMtimeMs: number;
    roots: string[];
    sha256: string;
  };
  marker: typeof manualQaProvenanceMarker;
  sourceTree: {
    fileCount: number;
    latestMtimeMs: number;
    sha256: string;
  };
};

type ManualQaMovementSection = "Intro" | "Verse" | "Hook" | "Bridge" | "Outro";
type ManualQaMovementPattern = "A" | "B" | "C";
type ManualQaMovementMuteTrack = "drum_rack" | "bass_808" | "synth" | "chord";
type ManualQaMovementAutomation = "none" | "fade_in" | "fade_out" | "intro_outro";

type ManualQaMovementBlock = {
  bars: number;
  energy: number;
  mutedTracks: ManualQaMovementMuteTrack[];
  pattern: ManualQaMovementPattern;
  section: ManualQaMovementSection;
};

type ManualQaMovementSpec = {
  arrangement: ManualQaMovementBlock[];
  masterAutomation: ManualQaMovementAutomation;
  outputProjectFileName: string;
  schemaVersion: 1;
  sessionBrief: {
    artist: string;
    notes: string;
    reference: string;
    vibe: string;
  };
  sourceProjectPath: string;
  title: string;
};

type ManualQaConfiguration = {
  autoMovement: boolean;
  autoSong: boolean;
  autoExit: boolean;
  dataDirectory: string;
  electronUserDataDirectory: string;
  evidenceDirectory: string;
  exportsDirectory: string;
  fixturesDirectory: string;
  launcherManifestPath: string;
  movementSpec: ManualQaMovementSpec | null;
  movementSpecPath: string | null;
  movementSourceCoreSha256: string | null;
  openPath: string;
  ownershipSentinelPath: string;
  ownershipToken: string;
  projectsDirectory: string;
  provenance: ManualQaProvenance;
  savePath: string;
  workspaceRealPath: string;
  workspaceRoot: string;
};

type ManualQaDownloadEvidence = {
  bytes?: number;
  fileName: string;
  filePath: string;
  mimeType: string;
  state: "cancelled" | "completed" | "interrupted" | "started";
};

type ManualQaUiObservation = {
  activeZone: string;
  activeZoneCount: number;
  capturedAt: string;
  documentHorizontalOverflow: number;
  projectStatus: string;
  projectTitle: string;
  selectedTabCount: number;
  selectedTabLabels: string[];
  tabCount: number;
  tabPanelCount: number;
  tabStopCount: number;
  transportPlaying: boolean;
  visiblePanelCount: number;
};

type ManualQaPassiveEvidence = {
  downloads: ManualQaDownloadEvidence[];
  lastObservedAt: string;
  openObserved: boolean;
  playbackObserved: boolean;
  provenanceValidatedAtLaunch: true;
  saveObserved: boolean;
  sourceFixture: string;
  targetProject: string;
  provenance: ManualQaProvenance;
  userDataIsolated: boolean;
  userDataPath: string;
  workspaceRoot: string;
  zones: Partial<Record<"arrange" | "compose" | "deliver" | "mix", ManualQaUiObservation & {
    screenshot: string;
    screenshotBytes: number;
    screenshotSha256: string;
  }>>;
};

type ManualQaAutoSongStep = {
  completedAt?: string;
  detail?: string;
  id: string;
  startedAt: string;
  status: "failed" | "passed" | "running";
};

type ManualQaNativeInteraction = {
  after: Record<string, unknown>;
  before: Record<string, unknown>;
  budgetMs: number;
  category: "general-ui" | "slow-operation";
  completedAt: string;
  durationMs: number;
  hitTestId: string;
  testId: string;
  withinBudget: boolean;
  x: number;
  y: number;
};

type ManualQaOverflowOffender = {
  className: string;
  clientWidth: number;
  elementKey: string;
  hitTestId: string;
  interactive: boolean;
  left: number;
  phase: "active-start" | "deep" | "top-shell";
  reason: string;
  right: number;
  scrollWidth: number;
  tagName: string;
  testId: string;
  width: number;
};

type ManualQaActiveAccessibility = {
  accessibleInteractiveCount: number;
  checkedElementCount: number;
  checkedInteractiveCount: number;
  inaccessibleCount: number;
  inaccessibleElements: ManualQaOverflowOffender[];
  intentionalScrollerExclusions: number;
  renderedInteractiveCount: number;
  uncheckedInteractiveCount: number;
};

type ManualQaViewportAccessibilitySample = ManualQaActiveAccessibility & {
  accessibleInteractiveKeys: string[];
  checkedInteractiveKeys: string[];
  renderedInteractiveKeys: string[];
};

type ManualQaTargetedAccessibilityPosture = {
  afterRendered: boolean;
  beforeRendered: boolean;
  className: string;
  clientWidth: number;
  elementKey: string;
  hitTestAccessible: boolean;
  hitTestId: string;
  left: number;
  phase: "deep" | "top-shell";
  right: number;
  scrollWidth: number;
  tagName: string;
  testId: string;
  width: number;
};

type ManualQaAutoSongZoneEvidence = ManualQaUiObservation & {
  activeAccessibility: ManualQaActiveAccessibility;
  audioAnalysisState: string;
  audioAnalysisStatus: string;
  clientWidth: number;
  deepScreenshot: string;
  deepScreenshotBytes: number;
  deepScreenshotSha256: string;
  deepScrollTop: number;
  documentScrollWidth: number;
  overflowOffenders: ManualQaOverflowOffender[];
  screenshot: string;
  screenshotBytes: number;
  screenshotSha256: string;
  scrollX: number;
};

type ManualQaAutoSongReport = {
  completedAt?: string;
  downloads: ManualQaDownloadEvidence[];
  failures: string[];
  generatedAt: string;
  interactions: ManualQaNativeInteraction[];
  mode: "visible-native-auto-song-qa";
  ok: boolean;
  performance: {
    generalBudgetMs: 5000;
    generalViolations: Array<{ durationMs: number; testId: string }>;
    maxGeneralInteractionMs: number;
    maxSlowOperationMs: number;
    passed: boolean;
    slowOperationBudgetMs: 120000;
    slowOperationViolations: Array<{ durationMs: number; testId: string }>;
  };
  playback: {
    arrangement: boolean;
    patternAuditions: Array<"A" | "B" | "C">;
    wavPreview: boolean;
  };
  project?: {
    arrangementBars: number;
    arrangementBlocks: number;
    bpm: unknown;
    key: unknown;
    mode: unknown;
    path: string;
    sessionBrief: unknown;
    sha256: string;
    styleId: unknown;
    title: unknown;
  };
  provenance: ManualQaProvenance;
  provenanceValidatedAtLaunch: true;
  safety: {
    isolatedWorkspace: true;
    nativePointerAndKeyboard: true;
    sourceFixtureUnchanged: boolean;
    sourceFixtureSha256: string;
    userDataIsolated: boolean;
    userDataPath: string;
  };
  steps: ManualQaAutoSongStep[];
  wav?: {
    bytes: number;
    path: string;
    sha256: string;
  };
  workspaceRoot: string;
  zones: Partial<Record<"arrange" | "compose" | "deliver" | "mix", ManualQaAutoSongZoneEvidence>>;
};

type ManualQaMovementZoneEvidence = ManualQaUiObservation & {
  audioAnalysisState: string;
  audioAnalysisStatus: string;
  screenshot: string;
  screenshotBytes: number;
  screenshotSha256: string;
};

type ManualQaMovementReport = {
  completedAt?: string;
  downloads: ManualQaDownloadEvidence[];
  failures: string[];
  generatedAt: string;
  interactions: ManualQaNativeInteraction[];
  mode: "visible-native-auto-movement-qa";
  ok: boolean;
  performance: ManualQaAutoSongReport["performance"];
  project?: ManualQaAutoSongReport["project"] & {
    automation: unknown;
    preservedSourceCore: boolean;
  };
  provenance: ManualQaProvenance;
  provenanceValidatedAtLaunch: true;
  reopenedProject?: {
    arrangement: unknown;
    arrangementMatches: boolean;
    automation: unknown;
    automationMatches: boolean;
    observedAt: string;
    projectStatus: string;
    title: string;
  };
  safety: ManualQaAutoSongReport["safety"] & {
    externalSourceBytes?: number;
    externalSourceFinalBytes?: number;
    externalSourceFinalSha256?: string;
    externalSourcePath?: string;
    externalSourcePostflightError?: string;
    externalSourceSha256?: string;
    externalSourceVerifiedAt?: string;
    sourceUnchanged?: boolean;
  };
  source: {
    bpm: unknown;
    key: unknown;
    mode: unknown;
    path: string;
    sha256: string;
    styleId: unknown;
    title: unknown;
  };
  spec: {
    arrangementBars: number;
    arrangementBlocks: number;
    masterAutomation: ManualQaMovementAutomation;
    path: string;
    sha256: string;
    title: string;
  };
  steps: ManualQaAutoSongStep[];
  wav?: {
    bitDepth: number;
    bytes: number;
    channels: number;
    durationSeconds: number;
    path: string;
    sampleRate: number;
    sha256: string;
  };
  workspaceRoot: string;
  zones: Partial<Record<"arrange" | "deliver" | "mix", ManualQaMovementZoneEvidence>>;
};

const manualQaAutoSongInteractions: ManualQaNativeInteraction[] = [];
const manualQaSlowOperationTestIds = new Set([
  "handoff-pack-action-wav",
  "handoff-pack-preview-wav",
  "project-open",
  "project-save",
  "workflow-jump-deliver"
]);

function pathIsInsideRoot(root: string, candidate: string): boolean {
  const relativePath = path.relative(root, candidate);
  return relativePath !== "" && !relativePath.startsWith(`..${path.sep}`) && relativePath !== ".." && !path.isAbsolute(relativePath);
}

function pathIsInsideOrEqual(root: string, candidate: string): boolean {
  return path.resolve(root) === path.resolve(candidate) || pathIsInsideRoot(root, candidate);
}

function lstatOrNullSync(filePath: string): ReturnType<typeof lstatSync> | null {
  try {
    return lstatSync(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function requiredManualQaEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required when GROOVEFORGE_DESKTOP_MANUAL_QA=1.`);
  }
  return value;
}

function manualQaAllowedWorkspaceBase(workspaceRoot: string): string {
  const repositoryQaBase = path.join(projectRoot, "build", "desktop");
  const temporaryQaBase = path.resolve(tmpdir());
  for (const base of [repositoryQaBase, temporaryQaBase]) {
    if (pathIsInsideRoot(base, workspaceRoot)) {
      return base;
    }
  }
  throw new Error(
    "GROOVEFORGE_DESKTOP_WORKSPACE_ROOT must be a child of the repository build/desktop directory or the operating-system temp directory."
  );
}

function assertManualQaNoSymlinkComponentsSync(root: string, candidate: string, label: string): void {
  if (!pathIsInsideOrEqual(root, candidate)) {
    throw new Error(`${label} escaped its workspace root.`);
  }
  const segments = path.relative(root, candidate).split(path.sep).filter(Boolean);
  let current = root;
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    const stats = lstatOrNullSync(current);
    if (!stats) {
      break;
    }
    if (stats.isSymbolicLink()) {
      throw new Error(`${label} rejected symbolic link: ${current}`);
    }
    if (index < segments.length - 1 && !stats.isDirectory()) {
      throw new Error(`${label} parent must be a directory: ${current}`);
    }
  }
}

function assertManualQaWorkspaceTargetSync(
  workspaceRoot: string,
  candidate: string,
  options: { expectedType?: "directory" | "file"; mustExist?: boolean } = {}
): string {
  const resolved = path.resolve(candidate);
  if (!pathIsInsideRoot(workspaceRoot, resolved)) {
    throw new Error(`Manual QA target escaped its workspace root: ${resolved}`);
  }
  const rootStats = lstatOrNullSync(workspaceRoot);
  if (!rootStats || rootStats.isSymbolicLink() || !rootStats.isDirectory()) {
    throw new Error("Manual QA workspace root must be an existing non-symbolic-link directory.");
  }
  assertManualQaNoSymlinkComponentsSync(workspaceRoot, resolved, "Manual QA target");
  const targetStats = lstatOrNullSync(resolved);
  if (options.mustExist && !targetStats) {
    throw new Error(`Manual QA target must already exist: ${resolved}`);
  }
  if (targetStats?.isSymbolicLink()) {
    throw new Error(`Manual QA target rejected symbolic link: ${resolved}`);
  }
  if (targetStats && options.expectedType === "file" && !targetStats.isFile()) {
    throw new Error(`Manual QA target must be a regular file: ${resolved}`);
  }
  if (targetStats && options.expectedType === "directory" && !targetStats.isDirectory()) {
    throw new Error(`Manual QA target must be a directory: ${resolved}`);
  }
  let nearestExisting = targetStats ? resolved : path.dirname(resolved);
  while (!lstatOrNullSync(nearestExisting)) {
    const parent = path.dirname(nearestExisting);
    if (parent === nearestExisting) {
      throw new Error(`Manual QA target has no existing workspace parent: ${resolved}`);
    }
    nearestExisting = parent;
  }
  const workspaceRealPath = realpathSync(workspaceRoot);
  const nearestRealPath = realpathSync(nearestExisting);
  if (!pathIsInsideOrEqual(workspaceRealPath, nearestRealPath)) {
    throw new Error(`Manual QA target escaped the real workspace root: ${resolved}`);
  }
  return resolved;
}

function collectManualQaProvenanceSourceFiles(
  entryPath: string,
  collected: Array<{ filePath: string; modifiedAtMs: number }>
): void {
  const stats = lstatSync(entryPath);
  if (stats.isSymbolicLink()) {
    throw new Error(`Manual QA provenance rejects symbolic-link source entries: ${entryPath}`);
  }
  if (stats.isDirectory()) {
    for (const name of readdirSync(entryPath).sort()) {
      collectManualQaProvenanceSourceFiles(path.join(entryPath, name), collected);
    }
    return;
  }
  if (!stats.isFile()) {
    throw new Error(`Manual QA provenance requires regular source files: ${entryPath}`);
  }
  collected.push({ filePath: entryPath, modifiedAtMs: stats.mtimeMs });
}

function buildManualQaProvenanceFileManifestSync(
  baseRoot: string,
  rootEntries: readonly string[]
): ManualQaProvenance["builtBundle"] {
  const files: Array<{ filePath: string; modifiedAtMs: number }> = [];
  for (const entry of rootEntries) {
    collectManualQaProvenanceSourceFiles(path.join(baseRoot, entry), files);
  }
  files.sort((left, right) => (left.filePath < right.filePath ? -1 : left.filePath > right.filePath ? 1 : 0));
  const digest = createHash("sha256");
  digest.update(`${manualQaProvenanceMarker}\0built-bundle\0`);
  const manifestFiles: ManualQaArtifactProvenance[] = [];
  let latestMtimeMs = 0;
  for (const file of files) {
    const contents = readFileSync(file.filePath);
    const relativePath = path.relative(baseRoot, file.filePath).split(path.sep).join("/");
    const entry = {
      bytes: contents.byteLength,
      modifiedAtMs: file.modifiedAtMs,
      relativePath,
      sha256: createHash("sha256").update(contents).digest("hex")
    };
    digest.update(
      `${entry.relativePath}\0${entry.bytes}\0${entry.modifiedAtMs}\0${entry.sha256}\0`
    );
    manifestFiles.push(entry);
    latestMtimeMs = Math.max(latestMtimeMs, entry.modifiedAtMs);
  }
  return {
    fileCount: manifestFiles.length,
    files: manifestFiles,
    latestMtimeMs,
    roots: [...rootEntries],
    sha256: digest.digest("hex")
  };
}

function buildManualQaProvenanceSync(): ManualQaProvenance {
  const sourceFiles: Array<{ filePath: string; modifiedAtMs: number }> = [];
  for (const entry of manualQaProvenanceSourceEntries) {
    collectManualQaProvenanceSourceFiles(path.join(projectRoot, entry), sourceFiles);
  }
  sourceFiles.sort((left, right) => (left.filePath < right.filePath ? -1 : left.filePath > right.filePath ? 1 : 0));
  const sourceDigest = createHash("sha256");
  sourceDigest.update(`${manualQaProvenanceMarker}\0`);
  let latestSourceMtimeMs = 0;
  for (const sourceFile of sourceFiles) {
    const contents = readFileSync(sourceFile.filePath);
    const relativePath = path.relative(projectRoot, sourceFile.filePath).split(path.sep).join("/");
    sourceDigest.update(`${relativePath}\0${contents.byteLength}\0`);
    sourceDigest.update(contents);
    latestSourceMtimeMs = Math.max(latestSourceMtimeMs, sourceFile.modifiedAtMs);
  }
  return {
    builtBundle: buildManualQaProvenanceFileManifestSync(projectRoot, manualQaProvenanceBuildRoots),
    marker: manualQaProvenanceMarker,
    sourceTree: {
      fileCount: sourceFiles.length,
      latestMtimeMs: latestSourceMtimeMs,
      sha256: sourceDigest.digest("hex")
    }
  };
}

function parseManualQaProvenance(value: unknown): ManualQaProvenance {
  const provenance = value as Partial<ManualQaProvenance> | null;
  if (
    !provenance ||
    provenance.marker !== manualQaProvenanceMarker ||
    !provenance.sourceTree ||
    !Number.isInteger(provenance.sourceTree.fileCount) ||
    provenance.sourceTree.fileCount <= 0 ||
    typeof provenance.sourceTree.latestMtimeMs !== "number" ||
    !/^[a-f0-9]{64}$/u.test(provenance.sourceTree.sha256 ?? "") ||
    !provenance.builtBundle ||
    !Number.isInteger(provenance.builtBundle.fileCount) ||
    provenance.builtBundle.fileCount <= 0 ||
    provenance.builtBundle.fileCount !== provenance.builtBundle.files?.length ||
    typeof provenance.builtBundle.latestMtimeMs !== "number" ||
    !Number.isFinite(provenance.builtBundle.latestMtimeMs) ||
    JSON.stringify(provenance.builtBundle.roots) !== JSON.stringify(manualQaProvenanceBuildRoots) ||
    !/^[a-f0-9]{64}$/u.test(provenance.builtBundle.sha256 ?? "")
  ) {
    throw new Error("Manual QA launcher manifest has invalid source provenance.");
  }
  let previousRelativePath = "";
  const builtPaths = new Set<string>();
  for (const artifact of provenance.builtBundle.files ?? []) {
    const normalizedRelativePath = path.posix.normalize(artifact?.relativePath ?? "");
    const belongsToBuildRoot = manualQaProvenanceBuildRoots.some((rootEntry) =>
      normalizedRelativePath.startsWith(`${rootEntry}/`)
    );
    if (
      !artifact ||
      artifact.relativePath !== normalizedRelativePath ||
      path.posix.isAbsolute(artifact.relativePath) ||
      artifact.relativePath <= previousRelativePath ||
      !belongsToBuildRoot ||
      !Number.isInteger(artifact.bytes) ||
      artifact.bytes < 0 ||
      typeof artifact.modifiedAtMs !== "number" ||
      !Number.isFinite(artifact.modifiedAtMs) ||
      !/^[a-f0-9]{64}$/u.test(artifact.sha256)
    ) {
      throw new Error("Manual QA launcher manifest has an invalid production bundle inventory.");
    }
    builtPaths.add(artifact.relativePath);
    previousRelativePath = artifact.relativePath;
  }
  for (const requiredPath of manualQaProvenanceRequiredBuildFiles) {
    if (!builtPaths.has(requiredPath)) {
      throw new Error(`Manual QA launcher manifest is missing required production artifact ${requiredPath}.`);
    }
  }
  return provenance as ManualQaProvenance;
}

function validateManualQaProvenance(expected: ManualQaProvenance): void {
  const actual = buildManualQaProvenanceSync();
  if (
    actual.sourceTree.sha256 !== expected.sourceTree.sha256 ||
    actual.sourceTree.fileCount !== expected.sourceTree.fileCount
  ) {
    throw new Error("Manual QA source tree changed after launcher provenance capture.");
  }
  if (
    JSON.stringify(actual.builtBundle.roots) !== JSON.stringify(expected.builtBundle.roots) ||
    actual.builtBundle.fileCount !== expected.builtBundle.fileCount ||
    actual.builtBundle.files.length !== expected.builtBundle.files.length ||
    actual.builtBundle.latestMtimeMs !== expected.builtBundle.latestMtimeMs ||
    actual.builtBundle.sha256 !== expected.builtBundle.sha256
  ) {
    throw new Error("Manual QA production bundle inventory changed after launcher provenance capture.");
  }
  for (const [index, expectedArtifact] of expected.builtBundle.files.entries()) {
    const actualArtifact = actual.builtBundle.files[index];
    if (
      actualArtifact.relativePath !== expectedArtifact.relativePath ||
      actualArtifact.bytes !== expectedArtifact.bytes ||
      actualArtifact.modifiedAtMs !== expectedArtifact.modifiedAtMs ||
      actualArtifact.sha256 !== expectedArtifact.sha256
    ) {
      throw new Error(`Manual QA built artifact changed after launcher provenance capture: ${expectedArtifact.relativePath}`);
    }
    if (actualArtifact.modifiedAtMs + 1 < actual.sourceTree.latestMtimeMs) {
      throw new Error(`Manual QA built artifact is stale: ${actualArtifact.relativePath}`);
    }
  }
  if (!readFileSync(path.join(projectRoot, manualQaProvenanceElectronMainPath), "utf8").includes(manualQaProvenanceMarker)) {
    throw new Error("Manual QA Electron main bundle does not contain the current provenance validator.");
  }
}

function requiredManualQaPath(name: string, workspaceRoot: string): string {
  const configured = requiredManualQaEnvironment(name);
  const resolved = path.resolve(configured);
  if (!pathIsInsideRoot(workspaceRoot, resolved)) {
    throw new Error(`${name} must resolve inside GROOVEFORGE_DESKTOP_WORKSPACE_ROOT.`);
  }
  if (!resolved.endsWith(".grooveforge.json")) {
    throw new Error(`${name} must end with .grooveforge.json.`);
  }
  return resolved;
}

function manualQaExactKeys(value: Record<string, unknown>, expected: string[], label: string): void {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  if (JSON.stringify(actual) !== JSON.stringify(sortedExpected)) {
    throw new Error(`${label} keys must be exactly: ${sortedExpected.join(", ")}.`);
  }
}

function manualQaRequiredString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string.`);
  }
  return value;
}

function parseManualQaMovementSpec(value: unknown): ManualQaMovementSpec {
  const spec = manualQaObject(value);
  manualQaExactKeys(
    spec,
    [
      "arrangement",
      "masterAutomation",
      "outputProjectFileName",
      "schemaVersion",
      "sessionBrief",
      "sourceProjectPath",
      "title"
    ],
    "Manual QA movement spec"
  );
  if (spec.schemaVersion !== 1) {
    throw new Error("Manual QA movement spec schemaVersion must be 1.");
  }
  const sourceProjectPath = manualQaRequiredString(spec.sourceProjectPath, "Manual QA movement sourceProjectPath");
  if (!path.isAbsolute(sourceProjectPath) || !sourceProjectPath.endsWith(".grooveforge.json")) {
    throw new Error("Manual QA movement sourceProjectPath must be an absolute .grooveforge.json path.");
  }
  const outputProjectFileName = manualQaRequiredString(
    spec.outputProjectFileName,
    "Manual QA movement outputProjectFileName"
  );
  if (
    path.basename(outputProjectFileName) !== outputProjectFileName ||
    !outputProjectFileName.endsWith(".grooveforge.json") ||
    outputProjectFileName === ".grooveforge.json"
  ) {
    throw new Error("Manual QA movement outputProjectFileName must be a safe .grooveforge.json basename.");
  }
  const title = manualQaRequiredString(spec.title, "Manual QA movement title");
  if (!title || title.length > 160 || /[\u0000-\u001f\u007f-\u009f]/u.test(title)) {
    throw new Error("Manual QA movement title must be non-empty, bounded, and free of control characters.");
  }
  const sessionBriefValue = manualQaObject(spec.sessionBrief);
  manualQaExactKeys(sessionBriefValue, ["artist", "notes", "reference", "vibe"], "Manual QA movement sessionBrief");
  const sessionBrief = {
    artist: manualQaRequiredString(sessionBriefValue.artist, "Manual QA movement sessionBrief.artist"),
    notes: manualQaRequiredString(sessionBriefValue.notes, "Manual QA movement sessionBrief.notes"),
    reference: manualQaRequiredString(sessionBriefValue.reference, "Manual QA movement sessionBrief.reference"),
    vibe: manualQaRequiredString(sessionBriefValue.vibe, "Manual QA movement sessionBrief.vibe")
  };
  if (
    sessionBrief.artist.length > 64 ||
    sessionBrief.vibe.length > 64 ||
    sessionBrief.reference.length > 64 ||
    sessionBrief.notes.length > 240
  ) {
    throw new Error("Manual QA movement sessionBrief exceeds the renderer field limits.");
  }
  const automationIds: ManualQaMovementAutomation[] = ["none", "fade_in", "fade_out", "intro_outro"];
  if (!automationIds.includes(spec.masterAutomation as ManualQaMovementAutomation)) {
    throw new Error("Manual QA movement masterAutomation is invalid.");
  }
  if (!Array.isArray(spec.arrangement) || spec.arrangement.length < 1 || spec.arrangement.length > 64) {
    throw new Error("Manual QA movement arrangement must contain 1-64 blocks.");
  }
  const sections: ManualQaMovementSection[] = ["Intro", "Verse", "Hook", "Bridge", "Outro"];
  const patterns: ManualQaMovementPattern[] = ["A", "B", "C"];
  const muteTracks: ManualQaMovementMuteTrack[] = ["drum_rack", "bass_808", "synth", "chord"];
  let arrangementBars = 0;
  const arrangement = spec.arrangement.map((candidate, index): ManualQaMovementBlock => {
    const block = manualQaObject(candidate);
    manualQaExactKeys(
      block,
      ["bars", "energy", "mutedTracks", "pattern", "section"],
      `Manual QA movement arrangement[${index}]`
    );
    if (!sections.includes(block.section as ManualQaMovementSection)) {
      throw new Error(`Manual QA movement arrangement[${index}].section is invalid.`);
    }
    if (!patterns.includes(block.pattern as ManualQaMovementPattern)) {
      throw new Error(`Manual QA movement arrangement[${index}].pattern is invalid.`);
    }
    if (!Number.isInteger(block.bars) || (block.bars as number) < 1 || (block.bars as number) > 16) {
      throw new Error(`Manual QA movement arrangement[${index}].bars must be an integer from 1-16.`);
    }
    if (
      typeof block.energy !== "number" ||
      !Number.isFinite(block.energy) ||
      block.energy < 0 ||
      block.energy > 1 ||
      Math.abs(block.energy * 100 - Math.round(block.energy * 100)) > 1e-9
    ) {
      throw new Error(`Manual QA movement arrangement[${index}].energy must use a 0.01 step from 0-1.`);
    }
    if (
      !Array.isArray(block.mutedTracks) ||
      new Set(block.mutedTracks).size !== block.mutedTracks.length ||
      !block.mutedTracks.every((track) => muteTracks.includes(track as ManualQaMovementMuteTrack))
    ) {
      throw new Error(`Manual QA movement arrangement[${index}].mutedTracks is invalid.`);
    }
    const blockMutedTracks = block.mutedTracks as ManualQaMovementMuteTrack[];
    arrangementBars += block.bars as number;
    return {
      bars: block.bars as number,
      energy: block.energy,
      mutedTracks: muteTracks.filter((track) => blockMutedTracks.includes(track)),
      pattern: block.pattern as ManualQaMovementPattern,
      section: block.section as ManualQaMovementSection
    };
  });
  if (arrangementBars > 64) {
    throw new Error(`Manual QA movement arrangement totals ${arrangementBars} bars; the limit is 64.`);
  }
  return {
    arrangement,
    masterAutomation: spec.masterAutomation as ManualQaMovementAutomation,
    outputProjectFileName,
    schemaVersion: 1,
    sessionBrief,
    sourceProjectPath,
    title
  };
}

function resolveManualQaConfiguration(): ManualQaConfiguration | null {
  if (!isManualQa) {
    return null;
  }
  if (isManualQaAutoSong && isManualQaAutoMovement) {
    throw new Error("Manual QA auto-song and auto-movement modes are mutually exclusive.");
  }
  const configuredWorkspaceRoot = requiredManualQaEnvironment("GROOVEFORGE_DESKTOP_WORKSPACE_ROOT");
  const workspaceRoot = path.resolve(configuredWorkspaceRoot);
  const repositoryQaBase = path.join(projectRoot, "build", "desktop");
  const temporaryQaBase = path.resolve(tmpdir());
  if ([projectRoot, path.resolve(homedir()), repositoryQaBase, temporaryQaBase].includes(workspaceRoot)) {
    throw new Error("Manual QA workspace root must not be HOME, the repository root, build/desktop itself, or the temp root.");
  }
  const allowedBase = manualQaAllowedWorkspaceBase(workspaceRoot);
  if (allowedBase === repositoryQaBase) {
    assertManualQaNoSymlinkComponentsSync(projectRoot, repositoryQaBase, "Manual QA repository base");
  }
  const allowedBaseStats = lstatOrNullSync(allowedBase);
  if (!allowedBaseStats || allowedBaseStats.isSymbolicLink() || !allowedBaseStats.isDirectory()) {
    throw new Error(`Manual QA allowed base must be a real directory: ${allowedBase}`);
  }
  assertManualQaNoSymlinkComponentsSync(allowedBase, workspaceRoot, "Manual QA workspace root");
  const workspaceStats = lstatOrNullSync(workspaceRoot);
  if (!workspaceStats || workspaceStats.isSymbolicLink() || !workspaceStats.isDirectory()) {
    throw new Error("Manual QA workspace root must be a prepared non-symbolic-link directory.");
  }
  const allowedBaseRealPath = realpathSync(allowedBase);
  const workspaceRealPath = realpathSync(workspaceRoot);
  if (!pathIsInsideRoot(allowedBaseRealPath, workspaceRealPath)) {
    throw new Error("Manual QA workspace real path escaped its allowed base.");
  }

  const fixturesDirectory = assertManualQaWorkspaceTargetSync(workspaceRoot, path.join(workspaceRoot, "fixtures"), {
    expectedType: "directory",
    mustExist: true
  });
  const projectsDirectory = assertManualQaWorkspaceTargetSync(workspaceRoot, path.join(workspaceRoot, "Projects"), {
    expectedType: "directory",
    mustExist: true
  });
  const dataDirectory = assertManualQaWorkspaceTargetSync(workspaceRoot, path.join(workspaceRoot, "Data"), {
    expectedType: "directory",
    mustExist: true
  });
  const evidenceDirectory = assertManualQaWorkspaceTargetSync(workspaceRoot, path.join(workspaceRoot, "evidence"), {
    expectedType: "directory",
    mustExist: true
  });
  const exportsDirectory = assertManualQaWorkspaceTargetSync(workspaceRoot, path.join(workspaceRoot, "exports"), {
    expectedType: "directory",
    mustExist: true
  });
  const electronUserDataDirectory = assertManualQaWorkspaceTargetSync(
    workspaceRoot,
    path.join(workspaceRoot, "ElectronUserData"),
    { expectedType: "directory", mustExist: true }
  );
  const openPath = requiredManualQaPath("GROOVEFORGE_DESKTOP_MANUAL_QA_OPEN_PATH", workspaceRoot);
  const savePath = requiredManualQaPath("GROOVEFORGE_DESKTOP_MANUAL_QA_SAVE_PATH", workspaceRoot);
  if (openPath === savePath) {
    throw new Error("Manual QA Open and Save paths must differ so the source fixture cannot be overwritten.");
  }
  assertManualQaWorkspaceTargetSync(workspaceRoot, openPath, { expectedType: "file", mustExist: true });
  assertManualQaWorkspaceTargetSync(workspaceRoot, savePath, { expectedType: "file" });

  const ownershipSentinelPath = assertManualQaWorkspaceTargetSync(
    workspaceRoot,
    path.join(workspaceRoot, manualQaSentinelName),
    { expectedType: "file", mustExist: true }
  );
  const ownershipToken = requiredManualQaEnvironment("GROOVEFORGE_DESKTOP_MANUAL_QA_OWNERSHIP_TOKEN");
  const sentinel = JSON.parse(readFileSync(ownershipSentinelPath, "utf8")) as Record<string, unknown>;
  if (
    sentinel.owner !== manualQaSentinelOwner ||
    sentinel.schemaVersion !== 1 ||
    sentinel.workspaceRealPath !== workspaceRealPath ||
    sentinel.ownershipToken !== ownershipToken ||
    !/^[a-f0-9]{64}$/u.test(ownershipToken)
  ) {
    throw new Error("Manual QA workspace ownership sentinel did not match the launcher token.");
  }

  const launcherManifestPath = assertManualQaWorkspaceTargetSync(
    workspaceRoot,
    path.resolve(requiredManualQaEnvironment("GROOVEFORGE_DESKTOP_MANUAL_QA_MANIFEST_PATH")),
    { expectedType: "file", mustExist: true }
  );
  if (launcherManifestPath !== path.join(evidenceDirectory, "manual-qa-launcher.json")) {
    throw new Error("Manual QA launcher manifest must use the owned evidence directory.");
  }
  const launcherManifestContents = readFileSync(launcherManifestPath);
  const expectedManifestSha256 = requiredManualQaEnvironment("GROOVEFORGE_DESKTOP_MANUAL_QA_MANIFEST_SHA256");
  if (createHash("sha256").update(launcherManifestContents).digest("hex") !== expectedManifestSha256) {
    throw new Error("Manual QA launcher manifest changed after the harness wrote it.");
  }
  const launcherManifest = JSON.parse(launcherManifestContents.toString("utf8")) as Record<string, unknown>;
  const manifestOutputs = launcherManifest.outputs as Record<string, unknown> | undefined;
  const expectedMode = isManualQaAutoMovement
    ? "visible-native-auto-movement-qa"
    : isManualQaAutoSong
      ? "visible-native-auto-song-qa"
      : "visible-stable-manual-qa";
  if (
    launcherManifest.workspaceRoot !== workspaceRoot ||
    launcherManifest.mode !== expectedMode ||
    (launcherManifest.openFixture as Record<string, unknown> | undefined)?.path !== openPath ||
    manifestOutputs?.savePath !== savePath ||
    manifestOutputs?.dataDirectory !== dataDirectory ||
    manifestOutputs?.evidenceDirectory !== evidenceDirectory ||
    manifestOutputs?.electronUserDataDirectory !== electronUserDataDirectory ||
    manifestOutputs?.exportsDirectory !== exportsDirectory ||
    manifestOutputs?.projectsDirectory !== projectsDirectory
  ) {
    throw new Error("Manual QA launcher manifest paths did not match the validated workspace configuration.");
  }
  const openFixtureManifest = manualQaObject(launcherManifest.openFixture);
  const openFixtureContents = readFileSync(openPath);
  if (
    openFixtureManifest.bytes !== openFixtureContents.byteLength ||
    openFixtureManifest.sha256 !== createHash("sha256").update(openFixtureContents).digest("hex")
  ) {
    throw new Error("Manual QA Open fixture changed after the launcher manifest was written.");
  }
  let movementSpec: ManualQaMovementSpec | null = null;
  let movementSpecPath: string | null = null;
  let movementSourceCoreSha256: string | null = null;
  if (isManualQaAutoMovement) {
    const movementManifest = manualQaObject(launcherManifest.movementSpec);
    movementSpecPath = assertManualQaWorkspaceTargetSync(
      workspaceRoot,
      path.resolve(requiredManualQaEnvironment("GROOVEFORGE_DESKTOP_MANUAL_QA_MOVEMENT_SPEC_PATH")),
      { expectedType: "file", mustExist: true }
    );
    if (movementSpecPath !== path.join(fixturesDirectory, "movement-spec.json") || movementManifest.path !== movementSpecPath) {
      throw new Error("Manual QA movement spec must use the owned fixtures directory.");
    }
    const movementSpecContents = readFileSync(movementSpecPath);
    if (
      movementManifest.bytes !== movementSpecContents.byteLength ||
      movementManifest.sha256 !== createHash("sha256").update(movementSpecContents).digest("hex")
    ) {
      throw new Error("Manual QA movement spec changed after the launcher manifest was written.");
    }
    movementSpec = parseManualQaMovementSpec(JSON.parse(movementSpecContents.toString("utf8")));
    movementSourceCoreSha256 =
      typeof openFixtureManifest.preservedCoreSha256 === "string" ? openFixtureManifest.preservedCoreSha256 : null;
    if (!movementSourceCoreSha256 || !/^[a-f0-9]{64}$/u.test(movementSourceCoreSha256)) {
      throw new Error("Manual QA movement source preserved-core digest is missing or invalid.");
    }
    const arrangementBars = movementSpec.arrangement.reduce((total, block) => total + block.bars, 0);
    if (
      movementManifest.arrangementBars !== arrangementBars ||
      movementManifest.arrangementBlocks !== movementSpec.arrangement.length ||
      movementManifest.masterAutomation !== movementSpec.masterAutomation ||
      movementManifest.targetTitle !== movementSpec.title ||
      savePath !== path.join(projectsDirectory, movementSpec.outputProjectFileName)
    ) {
      throw new Error("Manual QA movement spec did not match its launcher manifest or Save target.");
    }
  } else if (launcherManifest.movementSpec !== undefined) {
    throw new Error("Manual QA movement spec is only allowed in auto-movement mode.");
  }
  const provenance = parseManualQaProvenance(launcherManifest.provenance);
  validateManualQaProvenance(provenance);

  return {
    autoMovement: isManualQaAutoMovement,
    autoSong: isManualQaAutoSong,
    autoExit: isManualQaAutoExit,
    dataDirectory,
    electronUserDataDirectory,
    evidenceDirectory,
    exportsDirectory,
    fixturesDirectory,
    launcherManifestPath,
    movementSpec,
    movementSpecPath,
    movementSourceCoreSha256,
    openPath,
    ownershipSentinelPath,
    ownershipToken,
    projectsDirectory,
    provenance,
    savePath,
    workspaceRealPath,
    workspaceRoot
  };
}

const manualQaConfiguration = resolveManualQaConfiguration();
if (manualQaConfiguration) {
  app.setPath("userData", manualQaConfiguration.electronUserDataDirectory);
  if (realpathSync(app.getPath("userData")) !== realpathSync(manualQaConfiguration.electronUserDataDirectory)) {
    throw new Error("Manual QA Electron userData path was not isolated before app readiness.");
  }
}
const manualQaDownloadSessions = new WeakSet<Session>();
const manualQaReservedDownloadPaths = new Set<string>();
const manualQaDownloads: ManualQaDownloadEvidence[] = [];
let manualQaOpenPathOverride: string | null = null;

function functionalTabsLaunchSmokeEvidenceDirectory(): string {
  const configuredDirectory = process.env.GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_EVIDENCE_DIR;
  return configuredDirectory
    ? path.resolve(configuredDirectory)
    : path.join(app.getPath("temp"), `GrooveForge-${process.pid}-functional-tabs-launch-smoke`);
}

type NativeMenuCommand =
  | "open-project"
  | "save-project"
  | "save-project-and-close"
  | "undo"
  | "redo"
  | "quick-actions"
  | "command-reference"
  | "toggle-playback"
  | "delete-selected-event";

type SaveProjectPayload = {
  contents: string;
  defaultName: string;
};

type LaunchSmokeEvidence = {
  appKind: unknown;
  bodyTextLength: number;
  commandReference: LaunchSmokeCommandReferenceEvidence;
  functionalTabs?: LaunchSmokeFunctionalTabsEvidence;
  hasOpenProject: boolean;
  hasPreloadBridge: boolean;
  hasRoot: boolean;
  hasSaveProject: boolean;
  location: string;
  layout: LaunchSmokeLayoutEvidence;
  bridgeDirect: LaunchSmokeBridgeDirectEvidenceBundle;
  palette: LaunchSmokePaletteEvidence;
  missingText: string[];
  platform: unknown;
  readyState: string;
  rootChildCount: number;
  samplingTextPresent: boolean;
  testIds: Record<string, boolean>;
  title: string;
  viewport: {
    height: number;
    width: number;
  };
};

type LaunchSmokeFunctionalTabZone = "compose" | "arrange" | "mix" | "deliver";

type LaunchSmokeWorkspacePageGroup = "compose" | "mix";
type LaunchSmokeComposeWorkspacePage = "drums" | "notes" | "instruments";
type LaunchSmokeMixWorkspacePage = "mixer" | "master";
type LaunchSmokeWorkspacePageId = LaunchSmokeComposeWorkspacePage | LaunchSmokeMixWorkspacePage;

type LaunchSmokeWorkspacePageStateEvidence = {
  activePage: string;
  activePanelHorizontalOverflow: number;
  activePanelWidth: number;
  ariaConnectionsReady: boolean;
  fullWidthReady: boolean;
  inactiveFocusableControlCount: number;
  inactiveHiddenPanelCount: number;
  inactiveZeroRectPanelCount: number;
  selectedTabCount: number;
  tabCount: number;
  tabListHorizontalOverflow: number;
  tabPanelCount: number;
  tabStopCount: number;
  visiblePanelCount: number;
  zonePanelWidth: number;
};

type LaunchSmokeWorkspacePagesEvidence = {
  composeInitial: LaunchSmokeWorkspacePageStateEvidence;
  composeStates: Record<LaunchSmokeComposeWorkspacePage, LaunchSmokeWorkspacePageStateEvidence>;
  composeTraversal: Array<{ input: string; page: string }>;
  mixInitial: LaunchSmokeWorkspacePageStateEvidence;
  mixStates: Record<LaunchSmokeMixWorkspacePage, LaunchSmokeWorkspacePageStateEvidence>;
  mixTraversal: Array<{ input: string; page: string }>;
  pageStatePreservedAcrossOuterTabs: {
    compose: boolean;
    mix: boolean;
  };
};

type LaunchSmokeFunctionalTabStateEvidence = {
  activePanelHorizontalOverflow: number;
  activeZone: string;
  ariaConnectionsReady: boolean;
  documentHorizontalOverflow: number;
  inactiveFocusableControlCount: number;
  inactiveHiddenPanelCount: number;
  inactiveZeroRectPanelCount: number;
  mixMasterVisible: boolean;
  mixMixerVisible: boolean;
  selectedTabCount: number;
  tabCount: number;
  tabListHorizontalOverflow: number;
  tabPanelCount: number;
  tabStopCount: number;
  visiblePanelCount: number;
  deliverHandoffVisible: boolean;
};

type LaunchSmokeFunctionalTabCaptureEvidence = {
  artifact: string;
  bitmapBytes: number;
  height: number;
  nonBackgroundSamples: number;
  pixelDigest: string;
  pngBytes: number;
  pngDigest: string;
  sampledPixels: number;
  width: number;
};

type LaunchSmokeStickyNavigatorEvidence = {
  activeTabFullyVisible: boolean;
  activeZone: string;
  configuredTop: number;
  deepScrollReached: boolean;
  documentScrollable: boolean;
  maximumScrollY: number;
  navigatorFullyVisible: boolean;
  navigatorPosition: string;
  navigatorTop: number;
  scrollY: number;
  stickyTopAligned: boolean;
  tabListFullyVisible: boolean;
  viewportHeight: number;
  viewportWidth: number;
};

type LaunchSmokeFunctionalTabsEvidence = {
  captures: Record<LaunchSmokeFunctionalTabZone, LaunchSmokeFunctionalTabCaptureEvidence>;
  composeRoundTrip: {
    dirtyPosturePreserved: boolean;
    disclosurePosturePreserved: boolean;
    editFingerprintPreserved: boolean;
    keyboardCapturePosturePreserved: boolean;
    playbackPosturePreserved: boolean;
    selectedPatternPreserved: boolean;
    undoRedoPosturePreserved: boolean;
  };
  crossTabFocusTransfer: {
    activeElementInViewport: boolean;
    activeElementTestId: string;
    activeElementVisible: boolean;
    activeElementWithinActivePanel: boolean;
    destinationZone: string;
    sourcePanelHidden: boolean;
    sourceZone: string;
    triggerTestId: string;
  };
  finishChecklistQuickActionReveal: {
    activeElementTestId: string;
    activeElementVisible: boolean;
    activeElementWithinActivePanel: boolean;
    actionVisible: boolean;
    destinationZone: string;
    finishChecklistClearOfNavigator: boolean;
    finishChecklistHeight: number;
    finishChecklistInViewport: boolean;
    finishChecklistVisible: boolean;
    finishChecklistWidth: number;
    masterReviewOpen: boolean;
    modalClosed: boolean;
    projectFingerprintPreserved: boolean;
    sourceZone: string;
    viewportHeight: number;
    visibleHeight: number;
  };
  guidanceBeatPassportQuickActionReveal: {
    activeElementTestId: string;
    activeElementVisible: boolean;
    actionVisible: boolean;
    destinationZone: string;
    guidanceCenterInitiallyClosed: boolean;
    guidanceCenterOpen: boolean;
    guidancePostureRestored: boolean;
    modalClosed: boolean;
    nativeShortcutOpened: boolean;
    originalGuidanceCenterOpen: boolean;
    passportClearOfNavigator: boolean;
    passportHeight: number;
    passportInViewport: boolean;
    passportVisible: boolean;
    passportWidth: number;
    passportWithinGuidance: boolean;
    projectFingerprintPreserved: boolean;
    selectedActionId: string;
    sourceZone: string;
    statusText: string;
    viewportHeight: number;
    visibleHeight: number;
  };
  firstBeatPathTransportQuickActionReveal: {
    activeElementTestId: string;
    activeElementVisible: boolean;
    actionVisible: boolean;
    destinationZone: string;
    guidanceCenterOpenAfterRoute: boolean;
    guidancePostureRestored: boolean;
    modalClosed: boolean;
    nativeShortcutOpened: boolean;
    originalGuidanceCenterOpen: boolean;
    projectFingerprintPreserved: boolean;
    selectedActionId: string;
    sourceZone: string;
    statusText: string;
    transportHeight: number;
    transportInViewport: boolean;
    transportVisible: boolean;
    transportWidth: number;
    viewportHeight: number;
    visibleHeight: number;
  };
  reviewQueueQuickActionReveal: {
    activeElementTestId: string;
    activeElementVisible: boolean;
    activeElementWithinActivePanel: boolean;
    actionVisible: boolean;
    destinationZone: string;
    disclosurePostureRestored: boolean;
    masterReviewInitiallyClosed: boolean;
    masterReviewOpen: boolean;
    masterReviewQueueInitiallyClosed: boolean;
    masterReviewQueueOpen: boolean;
    modalClosed: boolean;
    nativeShortcutOpened: boolean;
    projectFingerprintPreserved: boolean;
    reviewQueueClearOfNavigator: boolean;
    reviewQueueHeight: number;
    reviewQueueInViewport: boolean;
    reviewQueueVisible: boolean;
    reviewQueueWidth: number;
    selectedActionId: string;
    sourceZone: string;
    statusText: string;
    viewportHeight: number;
    visibleHeight: number;
  };
  hiddenComposeGuards: Record<
    Exclude<LaunchSmokeFunctionalTabZone, "compose">,
    Record<"1" | "2" | "3" | "Delete" | "A", boolean>
  >;
  nativeMenuDeleteGuards: Record<"mix" | "deliver", boolean>;
  initial: LaunchSmokeFunctionalTabStateEvidence;
  minimumWindow: {
    maximumActivePanelHorizontalOverflow: number;
    maximumDocumentHorizontalOverflow: number;
    maximumTabListHorizontalOverflow: number;
    viewportWidth: number;
  };
  restoredCompose: boolean;
  states: Record<LaunchSmokeFunctionalTabZone, LaunchSmokeFunctionalTabStateEvidence>;
  stickyNavigatorAfterDeepScroll: Record<
    Exclude<LaunchSmokeFunctionalTabZone, "compose">,
    LaunchSmokeStickyNavigatorEvidence
  >;
  traversal: Array<{ input: string; zone: string }>;
  workspacePages: LaunchSmokeWorkspacePagesEvidence;
};

type LaunchSmokeFunctionalTabInternalSnapshot = LaunchSmokeFunctionalTabStateEvidence & {
  activeComposePage: string;
  activeMixPage: string;
  composeDataFingerprint: string;
  dirtyPosture: string;
  disclosurePosture: string;
  keyboardCapturePosture: string;
  playbackPosture: string;
  selectedPattern: string;
  undoRedoPosture: string;
};

type LaunchSmokeLayoutEvidence = {
  audioAnalysisPrewarm?: LaunchSmokeAudioAnalysisPrewarmEvidence;
  arrangementEssentialBeforeBlockMoves: boolean;
  arrangementPlaybackBeforeTimeline: boolean;
  arrangementPlaybackPresent: boolean;
  arrangementPatternControlsVisible: boolean;
  arrangementShapeControlsVisible: boolean;
  arrangementTrackStateControlsVisible: boolean;
  arrangementTimelineBeforeEditor: boolean;
  arrangementTimelinePresent: boolean;
  arrangementToolsOpen: boolean;
  arrangementToolsToggleVisible: boolean;
  audienceSessionActionsDirectVisible: boolean;
  audienceSessionProofContentHidden: boolean;
  audienceSessionProofInteractionReady: boolean;
  audienceSessionProofOpen: boolean;
  audienceSessionProofRowsPreserved: boolean;
  audienceSessionProofToggleVisible: boolean;
  blockMovesBeforeArrangementTools: boolean;
  blockMovesOpen: boolean;
  blockMovesToggleVisible: boolean;
  chordCardCount: number;
  chordCompactCardCount: number;
  chordCompactEditorsHidden: boolean;
  chordEventsBeforeHarmonyMoves: boolean;
  chordExpandedCardCount: number;
  chordSelectedEditorVisible: boolean;
  chordsBeforeSoundDesign: boolean;
  captureIdeasOpen: boolean;
  captureIdeasTogglePresent: boolean;
  deliveryAuditOpen: boolean;
  deliveryAuditToggleVisible: boolean;
  deliveryDirectBeforeStatus: boolean;
  deliveryDirectVisible: boolean;
  deliveryDirectPresent: boolean;
  deliveryOutsideGuidance: boolean;
  deliveryStatusBeforeAudit: boolean;
  deliveryStatusOpen: boolean;
  deliveryStatusToggleVisible: boolean;
  deliveryRouteBeforeDirect: boolean;
  feedbackAfterGuidance: boolean;
  feedbackOutsideGuidance: boolean;
  guidanceCenterOpen: boolean;
  guideQuickStartDecisionVisible: boolean;
  guideQuickStartDetailsContentHidden: boolean;
  guideQuickStartDetailsInteractionReady: boolean;
  guideQuickStartDetailsOpen: boolean;
  guideQuickStartDetailsToggleVisible: boolean;
  harmonyMovesOpen: boolean;
  harmonyMovesToggleVisible: boolean;
  instrumentDirectChordsPresent: boolean;
  launchpadActionCount: number;
  launchpadContentVisible: boolean;
  launchpadOpen: boolean;
  launchpadToggleVisible: boolean;
  compactTransportDirectActionsReady: boolean;
  compactTransportHeight: number;
  compactTransportReady: boolean;
  initialNavigatorStartsInViewport: boolean;
  initialNavigatorTop: number;
  launchpadHorizontalReady: boolean;
  transportSetupTopAligned: boolean;
  mixerBasicBalanceBeforeProcessing: boolean;
  minimumWindowDirectActionsReady: boolean;
  minimumWindowHorizontalOverflow: number;
  minimumWindowLaunchpadHorizontalReady: boolean;
  minimumWindowSetupReady: boolean;
  minimumWindowStudioCompactEntryReady: boolean;
  minimumWindowStudioCompactHeight: number;
  minimumWindowStudioExpandedHeight: number;
  minimumWindowStudioHorizontalOverflow: number;
  minimumWindowStudioManualReopenReady: boolean;
  minimumWindowStudioResizeCollapseReady: boolean;
  minimumWindowTransportHeight: number;
  minimumWindowTransportPlaybackContained: boolean;
  minimumWindowTransportPlaybackHeight: number;
  minimumWindowTransportPlaybackInternalOverflow: number;
  minimumWindowTransportPlaybackReadable: boolean;
  minimumWindowTransportPlaybackWidth: number;
  minimumWindowTransportReady: boolean;
  minimumWindowViewportWidth: number;
  minimumWindowWideStudioAutoExpandReady: boolean;
  mixerProcessingOpen: boolean;
  mixerProcessingToggleVisible: boolean;
  mixerStripsBeforeMixMoves: boolean;
  mixerStripsPresent: boolean;
  mixMovesBeforeReview: boolean;
  mixMovesOpen: boolean;
  mixMovesToggleVisible: boolean;
  mixReviewOpen: boolean;
  mixReviewToggleVisible: boolean;
  masterCeilingBoundsReady: boolean;
  masterControlsBeforePolish: boolean;
  masterOutputControlsPresent: boolean;
  masterPolishBeforeReview: boolean;
  masterPolishOpen: boolean;
  masterPolishToggleVisible: boolean;
  masterMixCoachPresent: boolean;
  masterMixCoachOpen: boolean;
  masterReviewOpen: boolean;
  masterReviewQueuePresent: boolean;
  masterReviewQueueOpen: boolean;
  masterReviewToggleVisible: boolean;
  masterRoleBeforeControls: boolean;
  patternLabOpen: boolean;
  patternLabToggleVisible: boolean;
  projectOwnershipReady: boolean;
  projectSafetyDetail: string;
  projectSafetyLabel: string;
  projectSafetyStatus: string;
  projectStatus: string;
  quickActionGraphReady: boolean;
  noteLanesAfterCaptureIdeas: boolean;
  noteLanesPresent: boolean;
  soundDesignOpen: boolean;
  soundDesignToggleVisible: boolean;
  selectedBlockEditorPresent: boolean;
  stepGridAfterPatternLab: boolean;
  stepGridPresent: boolean;
  swingFeelDarkThemeReady: boolean;
  swingFeelPressedSemanticsReady: boolean;
  swingFeelSelectedCount: number;
  buttonThemeDisabledReady: boolean;
  buttonThemeFoundationReady: boolean;
  buttonThemeNativeSurfaceCount: number;
  buttonThemeRepresentativeCount: number;
  buttonThemeSpecialistStateReady: boolean;
  transportEssentialsBeforeProject: boolean;
  essentialShortcutMetadataReady: boolean;
  essentialShortcutTitlesReady: boolean;
  patternShortcutMetadataReady: boolean;
  playPressedStateReady: boolean;
  transportExportsContainWav: boolean;
  transportExportsOpen: boolean;
  transportExportsToggleVisible: boolean;
  transportPlayDirectVisible: boolean;
  transportProjectBeforeSession: boolean;
  transportSaveDirectVisible: boolean;
  transportSessionBeforeExports: boolean;
  transportSessionOpen: boolean;
  transportSessionToggleVisible: boolean;
  transportStatusBeforeEssentials: boolean;
  workflowNavigatorBeforeWorkspace: boolean;
  workflowNavigatorComposeJumpReady: boolean;
  workflowNavigatorDeliverJumpReady: boolean;
  workflowNavigatorOutsideGuidance: boolean;
  workflowNavigatorPresent: boolean;
  workflowNavigatorStageCount: number;
  workflowNavigatorSticky: boolean;
  workflowNavigatorVisible: boolean;
};

type LaunchSmokeMinimumWindowEvidence = Pick<
  LaunchSmokeLayoutEvidence,
  | "minimumWindowDirectActionsReady"
  | "minimumWindowHorizontalOverflow"
  | "minimumWindowLaunchpadHorizontalReady"
  | "minimumWindowSetupReady"
  | "minimumWindowStudioCompactEntryReady"
  | "minimumWindowStudioCompactHeight"
  | "minimumWindowStudioExpandedHeight"
  | "minimumWindowStudioHorizontalOverflow"
  | "minimumWindowStudioManualReopenReady"
  | "minimumWindowStudioResizeCollapseReady"
  | "minimumWindowTransportHeight"
  | "minimumWindowTransportPlaybackContained"
  | "minimumWindowTransportPlaybackHeight"
  | "minimumWindowTransportPlaybackInternalOverflow"
  | "minimumWindowTransportPlaybackReadable"
  | "minimumWindowTransportPlaybackWidth"
  | "minimumWindowTransportReady"
  | "minimumWindowViewportWidth"
  | "minimumWindowWideStudioAutoExpandReady"
>;

type LaunchSmokeAudienceSessionLayoutEvidence = Pick<
  LaunchSmokeLayoutEvidence,
  | "audienceSessionActionsDirectVisible"
  | "audienceSessionProofContentHidden"
  | "audienceSessionProofInteractionReady"
  | "audienceSessionProofOpen"
  | "audienceSessionProofRowsPreserved"
  | "audienceSessionProofToggleVisible"
> & {
  audioAnalysisPrewarm: LaunchSmokeAudioAnalysisPrewarmEvidence;
};

type LaunchSmokePaletteRouteEvidence = {
  actionPresent: boolean;
  countText: string;
  resultMetricValue: string;
  resultNextCheck: string;
  resultStatus: string;
  resultTitle: string;
  scopeCountText: string;
  searchMetricValue: string;
  searchNextCheck: string;
  spotlightAction: string;
  spotlightTitle: string;
};

type LaunchSmokeAudienceStarterEvidence = LaunchSmokePaletteRouteEvidence & {
  buttonPresent: boolean;
  followupPresent: boolean;
  followupText: string;
  visibleFollowupActionCount: number;
  visibleFollowupActionLabels: string;
  visibleFollowupCompletionPresent: boolean;
  visibleFollowupCompletionResult: string;
  visibleFollowupPrimaryPresent: boolean;
  visibleFollowupPrimaryResult: string;
  visibleFollowupReadinessPresent: boolean;
  visibleFollowupReadinessResult: string;
  visibleResultAudition: string;
  visibleResultMetricValue: string;
  visibleResultNextCheck: string;
  visibleResultPresent: boolean;
  visibleResultStatus: string;
  visibleResultTitle: string;
};

type LaunchSmokeStarterLandingRouteEvidence = {
  arrangementMoveContainedCount: number;
  arrangementMoveControlCount: number;
  arrangementMoveInternalOverflow: number;
  arrangementMoveReadableLabelCount: number;
  arrangementMoveUniqueAccessibleNameCount: number;
  chordToolColumnCount: number;
  chordToolCount: number;
  chordToolInternalOverflow: number;
  chordToolReadableLabelCount: number;
  chordToolRowCount: number;
  chordToolUniqueAccessibleNameCount: number;
  clearOfNavigator: boolean;
  focusTestId: string;
  inViewport: boolean;
  mixerNarrowStripCount: number;
  mixerToggleContainedCount: number;
  mixerToggleCount: number;
  mixerToggleInternalOverflow: number;
  mixerTogglePressedStateCount: number;
  mixerToggleReadableLabelCount: number;
  mixerToggleTitleCount: number;
  mixerToggleUniqueAccessibleNameCount: number;
  noteToolColumnCount: number;
  noteToolContainedCount: number;
  noteToolControlCount: number;
  noteToolInternalOverflow: number;
  noteToolReadableLabelCount: number;
  noteToolRowCount: number;
  noteToolUniqueAccessibleNameCount: number;
  producerQueueOpen: boolean;
  producerReviewOpen: boolean;
  projectTitle: string;
  reviewQueueContained: boolean;
  reviewQueueFieldCount: number;
  reviewQueueInternalOverflow: number;
  reviewQueueReadableFieldCount: number;
  reviewQueueStackedRowCount: number;
};

type LaunchSmokeStarterLandingEvidence = {
  beginner: LaunchSmokeStarterLandingRouteEvidence;
  projectChangeSafety: LaunchSmokeProjectChangeSafetyEvidence;
  producer: LaunchSmokeStarterLandingRouteEvidence;
};

type LaunchSmokeProjectChangeSafetyEvidence = {
  applyChangedStyle: boolean;
  applyDialogClosed: boolean;
  applyOutcome: string;
  applySelectedPatternA: boolean;
  backwardFocusWrap: boolean;
  cancelFocusRestored: boolean;
  cancelInitialFocus: string;
  cancelOutcome: string;
  cancelProjectUnchanged: boolean;
  dialogOpened: boolean;
  dirtyGuardActive: boolean;
  dockCoveredDuringDialog: boolean;
  dockVisibleDuringDialog: boolean;
  escapeClosed: boolean;
  forwardFocusWrap: boolean;
  previewPatternCount: number;
  starterCancelOutcome: boolean;
  starterCancelProjectUnchanged: boolean;
  starterConfirmCalled: boolean;
  starterUndoPostureUnchanged: boolean;
  undoRestoredProject: boolean;
};

type LaunchSmokeCommandReferenceEvidence = {
  contextHasDirectComposition: boolean;
  contextHasFollowupRoutes: boolean;
  contextHasResultMetric: boolean;
  contextHasStarterCommands: boolean;
  contextText: string;
  handoffButtonPresent: boolean;
  itemPresent: boolean;
  opened: boolean;
  quickActionsOpenedAfterHandoff: boolean;
  searchCountText: string;
  searchInputPresent: boolean;
  searchQuery: string;
  spotlightContext: string;
  spotlightDetail: string;
  spotlightId: string;
  spotlightLabel: string;
  targetHasAudienceTargets: boolean;
  targetText: string;
};

type LaunchSmokeDrumGridKeyboardEvidence = {
  activationSingleToggleReady: boolean;
  buttonCount: number;
  enterToggleReady: boolean;
  nativeArrowReady: boolean;
  navigationEventCountUnchanged: boolean;
  navigationSelectionReady: boolean;
  playbackStayedStopped: boolean;
  pressedSemanticsReady: boolean;
  rovingTabReady: boolean;
  spaceToggleReady: boolean;
  undoRestored: boolean;
};

type LaunchSmokeNoteGridKeyboardEvidence = {
  activationSingleToggleReady: boolean;
  bassButtonCount: number;
  enterToggleReady: boolean;
  melodyButtonCount: number;
  nativeArrowReady: boolean;
  navigationEventCountUnchanged: boolean;
  navigationSelectionReady: boolean;
  playbackStayedStopped: boolean;
  pressedSemanticsReady: boolean;
  rovingTabReady: boolean;
  spaceToggleReady: boolean;
  undoRestored: boolean;
};

type LaunchSmokeClosedDetailsEvidence = {
  closedCount: number;
  guideOpenReady: boolean;
  guideReclosedReady: boolean;
  initiallyOpenCount: number;
  leakedControlCount: number;
  leakedContentCount: number;
  mixerOpenReady: boolean;
  mixerReclosedReady: boolean;
  patternLabOpenReady: boolean;
  patternLabReclosedReady: boolean;
  playbackStayedStopped: boolean;
  projectStayedUnchanged: boolean;
  totalCount: number;
  undoPostureUnchanged: boolean;
};

type LaunchSmokeModalFocusEvidence = {
  closedDetails: LaunchSmokeClosedDetailsEvidence;
  commandShortcutFromEditable: boolean;
  commandBackwardWrap: boolean;
  commandEscapeClosed: boolean;
  commandFocusRestored: boolean;
  commandForwardWrap: boolean;
  commandInitialFocus: string;
  dockActionsOpened: boolean;
  dockActionsFocusRestored: boolean;
  dockControlCount: number;
  dockFocusReady: boolean;
  dockInitialHidden: boolean;
  dockOriginalPlaybackRestored: boolean;
  dockPlayAfterStart: LaunchSmokeDockPlayPostureEvidence;
  dockPlayAfterStop: LaunchSmokeDockPlayPostureEvidence;
  dockPlayBefore: LaunchSmokeDockPlayPostureEvidence;
  dockPlayHitTargetReady: boolean;
  dockPlayOriginal: LaunchSmokeDockPlayPostureEvidence;
  dockPositionMirrorsHeader: boolean;
  dockPostureRestored: boolean;
  dockReturnedHidden: boolean;
  dockSharedPlayReady: boolean;
  dockShortcutMetadataReady: boolean;
  dockUndoRedoParity: boolean;
  dockViewportReady: boolean;
  dockVisible: boolean;
  drumGrid: LaunchSmokeDrumGridKeyboardEvidence;
  noteGrid: LaunchSmokeNoteGridKeyboardEvidence;
  editableFocusRestored: boolean;
  editableQuestionTyped: boolean;
  editableValuePreserved: boolean;
  modifiedShortcutHandoff: boolean;
  quickBackwardWrap: boolean;
  quickEscapeClosed: boolean;
  quickFocusRestored: boolean;
  quickForwardWrap: boolean;
  quickInitialFocus: string;
  quickKeyboardArrowDownMoved: boolean;
  quickKeyboardArrowUpReturned: boolean;
  quickKeyboardEndMovedLast: boolean;
  quickKeyboardEnterRanSelected: boolean;
  quickKeyboardFocusRetained: boolean;
  quickKeyboardHomeReturnedFirst: boolean;
  quickKeyboardInitialAction: string;
  quickKeyboardResultTitle: string;
  quickKeyboardSelectedTitle: string;
  quickShortcutFromEditable: boolean;
  switchFocusRestored: boolean;
  switchInitialFocus: string;
};

type LaunchSmokeDockPlayPostureEvidence = {
  activeTestId: string;
  activeZone: string;
  disabled: boolean;
  dockPressed: string;
  dockText: string;
  height: number;
  hitTargetTestId: string;
  left: number;
  playbackScope: string;
  projectStatus: string;
  top: number;
  transportPressed: string;
  transportText: string;
  visible: boolean;
  width: number;
};

type LaunchSmokeModalFocusCoreEvidence = Omit<LaunchSmokeModalFocusEvidence, "closedDetails" | "drumGrid" | "noteGrid">;

type LaunchSmokeBridgeDirectEvidence = {
  buttonPresent: boolean;
  resultDestination: string;
  resultFollowup: string;
  resultMetric: string;
  resultPresent: boolean;
  resultTitle: string;
};

type LaunchSmokeBridgeDirectEvidenceBundle = {
  completion: LaunchSmokeBridgeDirectEvidence;
  readiness: LaunchSmokeBridgeDirectEvidence;
};

type LaunchSmokePaletteEvidence = {
  arrangementTools: LaunchSmokeArrangementToolsEvidence;
  captureIdeas: LaunchSmokeCaptureIdeasEvidence;
  chordCards: LaunchSmokeChordCardEvidence;
  completionBeginner: LaunchSmokePaletteRouteEvidence;
  completionProducer: LaunchSmokePaletteRouteEvidence;
  completionReadout: LaunchSmokePaletteRouteEvidence;
  dualBeginner: LaunchSmokePaletteRouteEvidence;
  dualProducer: LaunchSmokePaletteRouteEvidence;
  dualReadout: LaunchSmokePaletteRouteEvidence;
  guided: LaunchSmokePaletteRouteEvidence;
  instrumentTools: LaunchSmokeInstrumentToolsEvidence;
  mixerTools: LaunchSmokeMixerToolsEvidence;
  masterTools: LaunchSmokeMasterToolsEvidence;
  launchpad: LaunchSmokeLaunchpadEvidence;
  transportTools: LaunchSmokeTransportToolsEvidence;
  deliveryTools: LaunchSmokeDeliveryToolsEvidence;
  opened: boolean;
  producer: LaunchSmokePaletteRouteEvidence;
  stageTimings: LaunchSmokePaletteStageTiming[];
  routeBridge: LaunchSmokePaletteRouteEvidence;
  routeBridgeCompletion: LaunchSmokePaletteRouteEvidence;
  routeBridgeReadiness: LaunchSmokePaletteRouteEvidence;
  sessionProofBeginner: LaunchSmokePaletteRouteEvidence;
  sessionProofProducer: LaunchSmokePaletteRouteEvidence;
  sessionProofReadout: LaunchSmokePaletteRouteEvidence;
  starterBeginner: LaunchSmokeAudienceStarterEvidence;
  starterBeginnerAudioRefresh: LaunchSmokeAudienceStarterAudioRefreshEvidence;
  starterProducer: LaunchSmokeAudienceStarterEvidence;
  starterProducerAudioRefresh: LaunchSmokeAudienceStarterAudioRefreshEvidence;
  resultPresent: boolean;
  searchPresent: boolean;
};

type LaunchSmokePaletteStageTiming = {
  durationMs: number;
  id: string;
};

type LaunchSmokeAudienceStarterAudioRefreshEvidence = {
  exactState: "ready";
  guideOpen: boolean;
  projectMode: "guided" | "studio";
  projectTitle: string;
  restored: LaunchSmokeAudioAnalysisTabPosture;
  retryRequested: boolean;
  starterActionsVisible: boolean;
};

type LaunchSmokeAudienceStarterVisibleEvidence = Pick<
  LaunchSmokeAudienceStarterEvidence,
  | "buttonPresent"
  | "followupPresent"
  | "followupText"
  | "visibleFollowupActionCount"
  | "visibleFollowupActionLabels"
  | "visibleFollowupCompletionPresent"
  | "visibleFollowupCompletionResult"
  | "visibleFollowupPrimaryPresent"
  | "visibleFollowupPrimaryResult"
  | "visibleFollowupReadinessPresent"
  | "visibleFollowupReadinessResult"
  | "visibleResultAudition"
  | "visibleResultMetricValue"
  | "visibleResultNextCheck"
  | "visibleResultPresent"
  | "visibleResultStatus"
  | "visibleResultTitle"
>;

type LaunchSmokeChordCardEvidence = {
  restoreReady: boolean;
  selectionReady: boolean;
};

type LaunchSmokeCaptureIdeasEvidence = {
  autoReveal: boolean;
  initialOpen: boolean;
  resetOpen: boolean;
};

type LaunchSmokeInstrumentToolsEvidence = {
  guidedHarmonyOpen: boolean;
  guidedSoundOpen: boolean;
  resetHarmonyOpen: boolean;
  resetSoundOpen: boolean;
  studioHarmonyOpen: boolean;
  studioSoundOpen: boolean;
};

type LaunchSmokeArrangementToolsEvidence = {
  guidedArrangementOpen: boolean;
  guidedBlockMovesOpen: boolean;
  resetArrangementOpen: boolean;
  resetBlockMovesOpen: boolean;
  studioArrangementOpen: boolean;
  studioBlockMovesFullWidth: boolean;
  studioBlockMovesOpen: boolean;
};

type LaunchSmokeMixerToolsEvidence = {
  guidedMixMovesOpen: boolean;
  guidedMixReviewOpen: boolean;
  guidedProcessingOpen: boolean;
  resetMixMovesOpen: boolean;
  resetMixReviewOpen: boolean;
  resetProcessingOpen: boolean;
  studioMixMovesOpen: boolean;
  studioMixReviewOpen: boolean;
  studioProcessingOpen: boolean;
};

type LaunchSmokeMasterToolsEvidence = {
  guidedMasterMixCoachOpen: boolean;
  guidedMasterPolishOpen: boolean;
  guidedMasterReviewQueueOpen: boolean;
  guidedMasterReviewOpen: boolean;
  resetMasterMixCoachOpen: boolean;
  resetMasterPolishOpen: boolean;
  resetMasterReviewQueueOpen: boolean;
  resetMasterReviewOpen: boolean;
  routedMasterMixCoachOpen: boolean;
  routedMasterReviewQueueOpen: boolean;
  studioMasterMixCoachOpen: boolean;
  studioMasterPolishOpen: boolean;
  studioMasterReviewQueueOpen: boolean;
  studioMasterReviewOpen: boolean;
};

type LaunchSmokeDeliveryToolsEvidence = {
  guidedAuditOpen: boolean;
  guidedStatusOpen: boolean;
  resetAuditOpen: boolean;
  resetStatusOpen: boolean;
  studioAuditOpen: boolean;
  studioStatusOpen: boolean;
};

type LaunchSmokeTransportToolsEvidence = {
  guidedExportsOpen: boolean;
  guidedSessionOpen: boolean;
  resetExportsOpen: boolean;
  resetSessionOpen: boolean;
  studioExportsOpen: boolean;
  studioSessionOpen: boolean;
};

type LaunchSmokeLaunchpadEvidence = {
  collapsedAfterStarter: boolean;
  initialOpen: boolean;
  manualClose: boolean;
  manualReopen: boolean;
  sameStarterCollapse: boolean;
};

type LaunchSmokeVisualEvidence = {
  bitmapBytes: number;
  brightSamples: number;
  darkSamples: number;
  height: number;
  maxColorDelta: number;
  nonBackgroundSamples: number;
  opaqueSamples: number;
  pngBytes: number;
  sampledPixels: number;
  uniqueSampledColors: number;
  width: number;
};

type ProjectIoSmokeEvidence = {
  appKind: unknown;
  defaultName: string;
  hasOpenProject: boolean;
  hasPreloadBridge: boolean;
  hasRecoveryBridge: boolean;
  hasSaveProject: boolean;
  location: string;
  launchpadCollapsedAfterUiOpen: boolean;
  openResult: {
    canceled: boolean;
    contentsLength?: number;
    contentsMatched?: boolean;
    filePath?: string;
  };
  nativeOpenActivation: ProjectIoSmokeNativeOpenActivationEvidence;
  preOpenRecoveryPresent: boolean;
  readyState: string;
  recoveryResult: {
    cleared: boolean;
    contentsMatched: boolean;
    emptyAfterClear: boolean;
    narrowSaveResponse: boolean;
    savedAtReady: boolean;
  };
  replacementConfirmCallCount: number;
  projectOpenButtonPresent: boolean;
  samplingTextPresent: boolean;
  saveResult: {
    canceled: boolean;
    databaseStored?: boolean;
    filePath?: string;
  };
  sourceLength: number;
  targetPath: string;
  title: string;
  uiFingerprint: {
    matched: boolean;
    rendered: ProjectIoSmokeUiFingerprint;
    renderedDigest: string;
    source: ProjectIoSmokeUiFingerprint;
    sourceDigest: string;
  };
};

type ProjectIoSmokeUiFingerprint = {
  bpm: number;
  key: string;
  mode: string;
  selectedPattern: string;
  styleId: string;
  title: string;
};

type ProjectIoSmokeNativeOpenActivationEvidence = {
  hitTestMatched: boolean;
  point: { x: number; y: number } | null;
  targetPresent: boolean;
  targetVisible: boolean;
  testId: "project-open";
};

type CloseFlowSmokeLiveEditEvidence = {
  activeTestId: string;
  blurredBeforeClose: boolean;
  focusedDraft: boolean;
  height: number;
  hitTargetMatched: boolean;
  hitTargetTestId: string;
  initialTitle: string;
  inputPresent: boolean;
  nativeInputApplied: boolean;
  nativeSelectAllFallbackUsed: boolean;
  projectStatusBeforeClose: string;
  selectionEndBeforeInput: number;
  selectionLengthBeforeInput: number;
  selectionStartBeforeInput: number;
  title: string;
  valueExact: boolean;
  width: number;
};

type CloseFlowSmokeState = {
  closeRequestCount: number;
  events: string[];
  liveEdit: CloseFlowSmokeLiveEditEvidence | null;
  nativeSaveCount: number;
  nativeSaveDefaultName: string | null;
  nativeSavePath: string | null;
  smokeChoiceSubstituted: boolean;
  willPreventUnloadCount: number;
};

const closeFlowSmokeState: CloseFlowSmokeState = {
  closeRequestCount: 0,
  events: [],
  liveEdit: null,
  nativeSaveCount: 0,
  nativeSaveDefaultName: null,
  nativeSavePath: null,
  smokeChoiceSubstituted: false,
  willPreventUnloadCount: 0
};

const projectFilters = [{ name: "GrooveForge Project", extensions: ["json"] }];
let updateHandlersRegistered = false;
let updateCheckInProgress = false;
let recoveryOperationQueue: Promise<void> = Promise.resolve();
let projectLibraryInstance: ProjectLibrary | null = null;
let generatedSmokeWorkspaceRoot: string | null = null;

function closeProjectStorage(): void {
  projectLibraryInstance?.close();
  projectLibraryInstance = null;
  if (!generatedSmokeWorkspaceRoot) {
    return;
  }
  try {
    rmSync(generatedSmokeWorkspaceRoot, { recursive: true, force: true });
  } catch {
    console.warn("Unable to remove generated desktop smoke workspace.");
  }
  generatedSmokeWorkspaceRoot = null;
}

function exitDesktopSmoke(exitCode: number): void {
  closeProjectStorage();
  app.exit(exitCode);
}

function isSaveProjectPayload(value: unknown): value is SaveProjectPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "contents" in value &&
    "defaultName" in value &&
    typeof value.contents === "string" &&
    value.contents.length <= maxNativeProjectFileCharacters &&
    typeof value.defaultName === "string" &&
    value.defaultName.length > 0 &&
    value.defaultName.length <= 512 &&
    value.defaultName !== "." &&
    value.defaultName !== ".." &&
    !/[\\/]/u.test(value.defaultName)
  );
}

function isRecoveryProjectPayload(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxNativeProjectFileCharacters &&
    Buffer.byteLength(value, "utf8") <= maxNativeProjectFileBytes
  );
}

async function assertManualQaPathSafety(filePath: string, existingFile: boolean): Promise<void> {
  const configuration = manualQaConfiguration;
  if (!configuration) {
    return;
  }
  assertManualQaWorkspaceTargetSync(configuration.workspaceRoot, filePath, {
    expectedType: "file",
    mustExist: existingFile
  });
}

async function writeManualQaFile(
  filePath: string,
  contents: string | Uint8Array,
  options: { encoding?: BufferEncoding; mode?: number } = {}
): Promise<void> {
  await assertManualQaPathSafety(filePath, false);
  await writeFile(filePath, contents, options);
  await assertManualQaPathSafety(filePath, true);
}

function manualQaUserDataPosture(configuration: ManualQaConfiguration): {
  userDataIsolated: boolean;
  userDataPath: string;
} {
  const userDataPath = path.resolve(app.getPath("userData"));
  let userDataIsolated = false;
  try {
    userDataIsolated =
      realpathSync(userDataPath) === realpathSync(configuration.electronUserDataDirectory) &&
      pathIsInsideRoot(configuration.workspaceRealPath, realpathSync(userDataPath));
  } catch {
    userDataIsolated = false;
  }
  return { userDataIsolated, userDataPath };
}

async function ensureDesktopProjectWorkspace(workspace: ProjectWorkspacePaths): Promise<void> {
  const configuration = manualQaConfiguration;
  if (configuration) {
    assertManualQaWorkspaceTargetSync(configuration.workspaceRoot, workspace.projects, {
      expectedType: "directory",
      mustExist: true
    });
    assertManualQaWorkspaceTargetSync(configuration.workspaceRoot, workspace.data, {
      expectedType: "directory",
      mustExist: true
    });
    assertManualQaWorkspaceTargetSync(configuration.workspaceRoot, workspace.databaseFile, {
      expectedType: "file"
    });
  }
  await ensureProjectWorkspace(workspace);
  if (configuration) {
    assertManualQaWorkspaceTargetSync(configuration.workspaceRoot, workspace.projects, {
      expectedType: "directory",
      mustExist: true
    });
    assertManualQaWorkspaceTargetSync(configuration.workspaceRoot, workspace.data, {
      expectedType: "directory",
      mustExist: true
    });
    assertManualQaWorkspaceTargetSync(configuration.workspaceRoot, workspace.databaseFile, {
      expectedType: "file"
    });
  }
}

function desktopProjectWorkspace(): ProjectWorkspacePaths {
  const isWorkspaceSmoke = isLaunchSmoke || isProjectIoSmoke || isCloseFlowSmoke || isManualQa;
  const configuredSmokeRoot = process.env.GROOVEFORGE_DESKTOP_WORKSPACE_ROOT;
  const smokeRoot = isManualQa
    ? manualQaConfiguration?.workspaceRoot
    : isWorkspaceSmoke
      ? configuredSmokeRoot ?? path.join(app.getPath("temp"), `GrooveForge-${process.pid}-smoke`)
      : undefined;
  if (isWorkspaceSmoke && !isManualQa && !configuredSmokeRoot && smokeRoot) {
    generatedSmokeWorkspaceRoot = smokeRoot;
  }
  return resolveProjectWorkspacePaths(app.getPath("home"), smokeRoot);
}

async function projectLibrary(workspace: ProjectWorkspacePaths): Promise<ProjectLibrary> {
  await ensureDesktopProjectWorkspace(workspace);
  projectLibraryInstance ??= new ProjectLibrary(workspace.databaseFile);
  return projectLibraryInstance;
}

async function existingProjectLibrary(workspace: ProjectWorkspacePaths): Promise<ProjectLibrary | null> {
  if (projectLibraryInstance) {
    return projectLibraryInstance;
  }
  try {
    const databaseStats = await stat(workspace.databaseFile);
    if (!databaseStats.isFile()) {
      throw new Error("GrooveForge SQLite project library path is not a regular file.");
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
  return projectLibrary(workspace);
}

function runRecoveryOperation<T>(operation: () => Promise<T>): Promise<T> {
  const result = recoveryOperationQueue.then(operation, operation);
  recoveryOperationQueue = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

function sendMenuCommand(command: NativeMenuCommand): void {
  const targetWindow = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  targetWindow?.webContents.send(menuCommandChannel, command);
}

function updateDialogWindow(): BrowserWindow | undefined {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
}

function showUpdateStatus(message: string, detail: string, buttons = ["OK"]): Promise<Electron.MessageBoxReturnValue> {
  const options: Electron.MessageBoxOptions = {
    type: "info",
    buttons,
    defaultId: 0,
    cancelId: buttons.length - 1,
    message,
    detail
  };
  const targetWindow = updateDialogWindow();
  return targetWindow ? dialog.showMessageBox(targetWindow, options) : dialog.showMessageBox(options);
}

function registerAutoUpdateHandlers(): void {
  if (updateHandlersRegistered) {
    return;
  }

  updateHandlersRegistered = true;

  autoUpdater.on("checking-for-update", () => {
    updateCheckInProgress = true;
    void showUpdateStatus("Checking for Updates", "GrooveForge is checking the configured update feed.");
  });

  autoUpdater.on("update-available", () => {
    void showUpdateStatus("Update Available", "GrooveForge found an update and will download it from the configured release feed.");
  });

  autoUpdater.on("update-not-available", () => {
    updateCheckInProgress = false;
    void showUpdateStatus("GrooveForge Is Up to Date", "No update is available on the configured release feed.");
  });

  autoUpdater.on("error", (error) => {
    updateCheckInProgress = false;
    void error;
    void showUpdateStatus(
      "Auto-Update Check Failed",
      "GrooveForge could not complete the update check. Check the release feed configuration and signed update artifacts."
    );
  });

  autoUpdater.on("update-downloaded", () => {
    updateCheckInProgress = false;
    void showUpdateStatus("Update Downloaded", "Install update now or keep working and install it after restart.", ["Install Update", "Later"]).then(
      ({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall();
        }
      }
    );
  });
}

function checkForUpdates(): void {
  if (isLaunchSmoke) {
    void showUpdateStatus("Check for Updates", "Launch smoke mode keeps auto-update checks offline.");
    return;
  }

  if (process.platform !== "darwin" && process.platform !== "win32") {
    void showUpdateStatus("Auto-Update Not Supported", "GrooveForge automatic update checks currently target signed macOS or Windows desktop releases.");
    return;
  }

  const updateFeed = resolveUpdateFeedConfig();
  if (!updateFeed.ready) {
    void showUpdateStatus(
      "Auto-Update Not Configured",
      `${updateFeed.blockers.join(" ")} Set GROOVEFORGE_UPDATE_FEED_URL and GROOVEFORGE_UPDATE_CHANNEL after a signed release provider is selected. No update feed was contacted.`
    );
    return;
  }

  if (updateCheckInProgress) {
    void showUpdateStatus("Update Check Already Running", "GrooveForge is already checking for updates.");
    return;
  }

  registerAutoUpdateHandlers();
  autoUpdater.setFeedURL({ url: updateFeed.feedUrl });
  updateCheckInProgress = true;

  try {
    autoUpdater.checkForUpdates();
  } catch (error) {
    updateCheckInProgress = false;
    void error;
    void showUpdateStatus(
      "Auto-Update Check Failed",
      "GrooveForge could not start the update check. Check the release feed configuration and signed update artifacts."
    );
  }
}

function createRendererCommandMenuItem(label: string, accelerator: string, command: NativeMenuCommand): MenuItemConstructorOptions {
  return {
    id: `renderer-command-${command}`,
    label,
    accelerator,
    // Renderer keydown handling owns focused-input guards; Electron only displays the shortcut here.
    registerAccelerator: false,
    click: () => sendMenuCommand(command)
  };
}

function activateNativeMenuCommandForSmoke(win: BrowserWindow, command: NativeMenuCommand): void {
  const menuItem = Menu.getApplicationMenu()?.getMenuItemById(`renderer-command-${command}`);
  if (!menuItem) {
    throw new Error(`Could not locate native menu item for ${command}.`);
  }
  win.show();
  win.focus();
  menuItem.click({}, win, win.webContents);
}

function createNativeCommandMenu(): Menu {
  const isMac = process.platform === "darwin";
  const fileSubmenu: MenuItemConstructorOptions[] = [
    createRendererCommandMenuItem("Open Project...", "CmdOrCtrl+O", "open-project"),
    createRendererCommandMenuItem("Save Project", "CmdOrCtrl+S", "save-project"),
    { type: "separator" }
  ];
  const viewSubmenu: MenuItemConstructorOptions[] = [
    { role: "reload" },
    { role: "forceReload" },
    { type: "separator" },
    { role: "resetZoom" },
    { role: "zoomIn" },
    { role: "zoomOut" },
    { type: "separator" },
    { role: "togglefullscreen" }
  ];

  if (!isMac) {
    fileSubmenu.push({ role: "quit" });
  }
  if (isDev) {
    viewSubmenu.splice(2, 0, { role: "toggleDevTools" });
  }

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: "GrooveForge",
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" }
            ]
          } satisfies MenuItemConstructorOptions
        ]
      : []),
    {
      label: "File",
      submenu: fileSubmenu
    },
    {
      label: "Edit",
      submenu: [
        createRendererCommandMenuItem("Undo", "CmdOrCtrl+Z", "undo"),
        createRendererCommandMenuItem("Redo", "Shift+CmdOrCtrl+Z", "redo"),
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { type: "separator" },
        createRendererCommandMenuItem("Delete Selected Event", "Backspace", "delete-selected-event")
      ]
    },
    {
      label: "Transport",
      submenu: [
        createRendererCommandMenuItem("Play / Stop", "Space", "toggle-playback"),
        createRendererCommandMenuItem("Quick Actions", "CmdOrCtrl+K", "quick-actions")
      ]
    },
    {
      label: "View",
      submenu: viewSubmenu
    },
    {
      role: "window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac ? [{ type: "separator" as const }, { role: "front" as const }] : [])
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Check for Updates...",
          click: () => checkForUpdates()
        },
        { type: "separator" },
        createRendererCommandMenuItem("Command Reference", "CmdOrCtrl+/", "command-reference"),
        { type: "separator" },
        {
          label: "GrooveForge Local Workstation",
          click: () => {
            void shell.openExternal("https://github.com/taejun9/GrooveForge");
          }
        }
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
}

function registerProjectFileHandlers(): void {
  const workspace = desktopProjectWorkspace();

  ipcMain.on(closeWindowChannel, (event) => {
    if (isCloseFlowSmoke) {
      closeFlowSmokeState.closeRequestCount += 1;
      closeFlowSmokeState.events.push("renderer-close-request");
    }
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  ipcMain.handle("grooveforge:save-project", async (event, payload: unknown) => {
    if (!isSaveProjectPayload(payload)) {
      throw new Error("Invalid save project payload.");
    }

    await ensureDesktopProjectWorkspace(workspace);
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    const options: SaveDialogOptions = {
      title: "Save GrooveForge Project",
      defaultPath: path.join(workspace.projects, payload.defaultName),
      filters: projectFilters
    };
    const smokeFilePath = projectIoSmokePath() ?? closeFlowSmokePath() ?? manualQaSavePath();
    if (isManualQa && smokeFilePath) {
      await assertManualQaPathSafety(smokeFilePath, false);
    }
    const result = smokeFilePath
      ? { canceled: false, filePath: smokeFilePath }
      : browserWindow
        ? await dialog.showSaveDialog(browserWindow, options)
        : await dialog.showSaveDialog(options);
    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    if (isManualQa) {
      await assertManualQaPathSafety(result.filePath, false);
    }

    if (isCloseFlowSmoke) {
      closeFlowSmokeState.nativeSaveCount += 1;
      closeFlowSmokeState.nativeSaveDefaultName = payload.defaultName;
      closeFlowSmokeState.nativeSavePath = result.filePath;
      closeFlowSmokeState.events.push("native-save-started");
    }
    await atomicWriteUtf8File(result.filePath, payload.contents, maxNativeProjectFileCharacters);
    if (isManualQa) {
      await assertManualQaPathSafety(result.filePath, true);
    }
    let databaseStored = true;
    try {
      const library = await projectLibrary(workspace);
      const storageKey = createHash("sha256").update(path.resolve(result.filePath)).digest("hex");
      library.recordSavedProject(storageKey, path.basename(result.filePath), payload.contents);
    } catch {
      databaseStored = false;
      console.warn("SQLite project library update failed after the project file was saved.");
    }
    if (isCloseFlowSmoke) {
      closeFlowSmokeState.events.push("native-save-completed");
    }
    return { canceled: false, filePath: result.filePath, databaseStored };
  });

  ipcMain.handle("grooveforge:open-project", async (event) => {
    await ensureDesktopProjectWorkspace(workspace);
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    const options: OpenDialogOptions = {
      title: "Open GrooveForge Project",
      defaultPath: workspace.projects,
      filters: projectFilters,
      properties: ["openFile"]
    };
    const smokeFilePath = projectIoSmokePath() ?? manualQaOpenPath();
    if (isManualQa && smokeFilePath) {
      await assertManualQaPathSafety(smokeFilePath, true);
    }
    const result = smokeFilePath
      ? { canceled: false, filePaths: [smokeFilePath] }
      : browserWindow
        ? await dialog.showOpenDialog(browserWindow, options)
        : await dialog.showOpenDialog(options);
    const filePath = result.filePaths[0];
    if (result.canceled || !filePath) {
      return { canceled: true };
    }

    const fileStats = await stat(filePath);
    if (fileStats.size > maxNativeProjectFileBytes) {
      throw new Error(`GrooveForge project file exceeds the ${maxNativeProjectFileBytes.toLocaleString("en-US")} byte native read safety limit.`);
    }
    const contents = await readFile(filePath, "utf8");
    return { canceled: false, filePath, contents };
  });

  ipcMain.handle("grooveforge:save-project-recovery", (_event, payload: unknown) => {
    if (!isRecoveryProjectPayload(payload)) {
      throw new Error("Invalid project recovery payload.");
    }
    return runRecoveryOperation(async () => {
      const library = await projectLibrary(workspace);
      return { savedAt: library.saveRecovery(payload).savedAt };
    });
  });

  ipcMain.handle("grooveforge:load-project-recovery", () =>
    runRecoveryOperation(async () => {
      const library = await existingProjectLibrary(workspace);
      return library?.loadRecovery() ?? null;
    })
  );

  ipcMain.handle("grooveforge:clear-project-recovery", () =>
    runRecoveryOperation(async () => {
      const library = await existingProjectLibrary(workspace);
      library?.clearRecovery();
      return { cleared: true };
    })
  );
}

function projectIoSmokePath(): string | null {
  const filePath = process.env.GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE_PATH;
  return isProjectIoSmoke && filePath ? filePath : null;
}

function closeFlowSmokePath(): string | null {
  const filePath = process.env.GROOVEFORGE_DESKTOP_CLOSE_FLOW_SMOKE_PATH;
  return isCloseFlowSmoke && filePath ? filePath : null;
}

function manualQaOpenPath(): string | null {
  return manualQaOpenPathOverride ?? manualQaConfiguration?.openPath ?? null;
}

function manualQaSavePath(): string | null {
  return manualQaConfiguration?.savePath ?? null;
}

function launchSmokeFailure(message: string, details: Record<string, unknown> = {}): void {
  console.error(`${launchSmokeResultPrefix}${JSON.stringify({ ok: false, message, ...details })}`);
  exitDesktopSmoke(1);
}

function projectIoSmokeFailure(message: string, details: Record<string, unknown> = {}): void {
  console.error(`${projectIoSmokeResultPrefix}${JSON.stringify({ ok: false, message, ...details })}`);
  exitDesktopSmoke(1);
}

function closeFlowSmokeFailure(message: string, details: Record<string, unknown> = {}): void {
  console.error(`${closeFlowSmokeResultPrefix}${JSON.stringify({ ok: false, message, ...details })}`);
  exitDesktopSmoke(1);
}

function launchSmokeFailures(evidence: LaunchSmokeEvidence): string[] {
  const failures: string[] = [];
  const missingTestIds = Object.entries(evidence.testIds)
    .filter(([, present]) => !present)
    .map(([testId]) => testId);

  if (evidence.title !== "GrooveForge") {
    failures.push(`document title should be GrooveForge, got ${evidence.title}`);
  }
  if (!evidence.location.startsWith("file:")) {
    failures.push(`production renderer should load from file:, got ${evidence.location}`);
  }
  if (evidence.readyState !== "interactive" && evidence.readyState !== "complete") {
    failures.push(`document readyState should be interactive or complete, got ${evidence.readyState}`);
  }
  if (evidence.appKind !== "desktop") {
    failures.push(`preload appKind should be desktop, got ${String(evidence.appKind)}`);
  }
  if (!evidence.hasPreloadBridge || !evidence.hasSaveProject || !evidence.hasOpenProject) {
    failures.push("preload bridge should expose appKind, saveProject, and openProject");
  }
  if (!evidence.hasRoot || evidence.rootChildCount < 1) {
    failures.push("renderer root should be mounted");
  }
  if (evidence.bodyTextLength < 20000) {
    failures.push(`renderer text should be substantial, got ${evidence.bodyTextLength} characters`);
  }
  if (evidence.missingText.length > 0) {
    failures.push(`renderer is missing text: ${evidence.missingText.join(", ")}`);
  }
  if (missingTestIds.length > 0) {
    failures.push(`renderer is missing test ids: ${missingTestIds.join(", ")}`);
  }
  if (evidence.samplingTextPresent) {
    failures.push("renderer should not expose sampling-first language in first-run live desktop smoke");
  }
  if (evidence.viewport.width < 1180 || evidence.viewport.height < 760) {
    failures.push(`viewport should respect desktop minimums, got ${evidence.viewport.width}x${evidence.viewport.height}`);
  }
  if (evidence.layout.guidanceCenterOpen) {
    failures.push("Guide & Review Center should be collapsed on first-run desktop launch");
  }
  if (evidence.layout.patternLabOpen) {
    failures.push("Pattern Lab should be collapsed on first-run desktop launch");
  }
  if (!evidence.layout.feedbackOutsideGuidance || !evidence.layout.feedbackAfterGuidance) {
    failures.push("global command feedback should remain outside and after the optional guidance center");
  }
  if (!evidence.layout.patternLabToggleVisible || !evidence.layout.stepGridPresent || !evidence.layout.stepGridAfterPatternLab) {
    failures.push("drum editor should expose a visible Pattern Lab toggle followed by the direct 16-step grid");
  }
  if (evidence.layout.captureIdeasOpen) {
    failures.push("Capture & Ideas should be collapsed on first-run desktop launch");
  }
  if (!evidence.layout.quickActionGraphReady) {
    failures.push("Quick Actions graph should finish its on-demand load before launch evidence is accepted");
  }
  if (
    !evidence.layout.captureIdeasTogglePresent ||
    !evidence.layout.noteLanesPresent ||
    !evidence.layout.noteLanesAfterCaptureIdeas
  ) {
    failures.push(
      `note editor should keep a Capture & Ideas toggle structurally before direct 808 and Synth grids (toggle ${evidence.layout.captureIdeasTogglePresent}, lanes ${evidence.layout.noteLanesPresent}, order ${evidence.layout.noteLanesAfterCaptureIdeas})`
    );
  }
  return failures;
}

function launchSmokePaletteFailures(evidence: LaunchSmokePaletteEvidence): string[] {
  const failures: string[] = [];
  if (evidence.captureIdeas.initialOpen || !evidence.captureIdeas.autoReveal || evidence.captureIdeas.resetOpen) {
    failures.push("Capture & Ideas should start closed, reveal on keyboard arm, and reset closed after the live check");
  }
  if (!evidence.opened || !evidence.searchPresent || !evidence.resultPresent) {
    failures.push(
      "live Quick Actions palette should open, accept Audience Session, Audience Route Bridge, Dual Audience Readiness, and Audience Completion Route searches, and leave an execution result"
    );
  }
  if (!evidence.guided.actionPresent) {
    failures.push("live Quick Actions palette should show Enter Guided after first-time composer search");
  }
  if (evidence.guided.spotlightAction !== "audience-session-enter-beginner") {
    failures.push(`live Quick Actions Guided spotlight should target audience-session-enter-beginner, got ${evidence.guided.spotlightAction}`);
  }
  if (evidence.guided.spotlightTitle !== "Enter Guided: First-time composer") {
    failures.push(`live Quick Actions Guided spotlight should name Enter Guided, got ${evidence.guided.spotlightTitle}`);
  }
  if (!evidence.guided.searchMetricValue.includes("Enter Guided: First-time composer")) {
    failures.push("live Quick Actions Guided search result should target Enter Guided");
  }
  const guidedResultTitleReady =
    evidence.guided.resultTitle === "Enter Guided: First-time composer" ||
    evidence.guided.resultTitle === "First-time composer route selected";
  const guidedResultStatusReady =
    evidence.guided.resultStatus === "Entered" || evidence.guided.resultStatus.includes("Guided");
  if (!guidedResultStatusReady || !guidedResultTitleReady) {
    failures.push("live Quick Actions Guided command should execute with Entered result");
  }
  const guidedResultMetricReady =
    (evidence.guided.resultMetricValue.includes("Enter Guided for first-time composer") &&
      evidence.guided.resultMetricValue.includes("target Guided")) ||
    evidence.guided.resultMetricValue.includes("Guided first-beat workflow");
  if (!guidedResultMetricReady) {
    failures.push("live Quick Actions Guided result metric should include first-time composer route and target Guided mode");
  }
  if (!evidence.guided.resultNextCheck.includes("First Beat Path")) {
    failures.push("live Quick Actions Guided result should guide the next First Beat Path check");
  }
  if (!evidence.producer.actionPresent) {
    failures.push("live Quick Actions palette should show Enter Studio after professional producer search");
  }
  if (evidence.producer.spotlightAction !== "audience-session-enter-producer") {
    failures.push(`live Quick Actions producer spotlight should target audience-session-enter-producer, got ${evidence.producer.spotlightAction}`);
  }
  if (evidence.producer.spotlightTitle !== "Enter Studio: Professional producer") {
    failures.push(`live Quick Actions producer spotlight should name Enter Studio, got ${evidence.producer.spotlightTitle}`);
  }
  if (!evidence.producer.searchMetricValue.includes("Enter Studio: Professional producer")) {
    failures.push("live Quick Actions producer search result should target Enter Studio");
  }
  const producerResultTitleReady =
    evidence.producer.resultTitle === "Enter Studio: Professional producer" ||
    evidence.producer.resultTitle === "Professional producer route selected";
  const producerResultStatusReady =
    evidence.producer.resultStatus === "Entered" || evidence.producer.resultStatus.includes("Studio");
  if (!producerResultStatusReady || !producerResultTitleReady) {
    failures.push("live Quick Actions producer command should execute with Entered result");
  }
  const producerResultMetricReady =
    (evidence.producer.resultMetricValue.includes("Enter Studio for professional producer") &&
      evidence.producer.resultMetricValue.includes("target Studio")) ||
    evidence.producer.resultMetricValue.includes("Studio producer scan workflow");
  if (!producerResultMetricReady) {
    failures.push("live Quick Actions producer result metric should include professional producer route and target Studio mode");
  }
  if (!evidence.producer.resultNextCheck.includes("Review Queue") || !evidence.producer.resultNextCheck.includes("Export Preflight")) {
    failures.push("live Quick Actions producer result should guide the next Review Queue / Export Preflight check");
  }
  if (!evidence.routeBridge.actionPresent) {
    failures.push("live Quick Actions palette should show Audience Route Bridge Readout");
  }
  if (evidence.routeBridge.spotlightAction !== "audience-route-bridge-readout-action") {
    failures.push(
      `live Quick Actions Audience Route Bridge spotlight should target audience-route-bridge-readout-action, got ${evidence.routeBridge.spotlightAction}`
    );
  }
  if (!evidence.routeBridge.spotlightTitle.includes("Review Audience Route Bridge")) {
    failures.push(`live Quick Actions Audience Route Bridge spotlight should name Audience Route Bridge, got ${evidence.routeBridge.spotlightTitle}`);
  }
  if (!evidence.routeBridge.resultMetricValue.includes("Audience Route Bridge Readout")) {
    failures.push("live Quick Actions Audience Route Bridge readout result metric should include the bridge readout");
  }
  if (!evidence.routeBridgeReadiness.actionPresent || !evidence.routeBridgeReadiness.resultMetricValue.includes("Bridge readiness lane")) {
    failures.push("live Quick Actions Audience Route Bridge readiness should execute with readiness lane evidence");
  }
  if (
    !evidence.routeBridgeReadiness.resultNextCheck.includes("First Beat Path") &&
    !evidence.routeBridgeReadiness.resultNextCheck.includes("Export Preflight") &&
    !evidence.routeBridgeReadiness.resultNextCheck.includes("Production Snapshot")
  ) {
    failures.push("live Quick Actions Audience Route Bridge readiness should guide the next active readiness check");
  }
  if (!evidence.routeBridgeCompletion.actionPresent || !evidence.routeBridgeCompletion.resultMetricValue.includes("Bridge completion lane")) {
    failures.push("live Quick Actions Audience Route Bridge completion should execute with completion lane evidence");
  }
  if (
    !evidence.routeBridgeCompletion.resultNextCheck.includes("First Beat Path") &&
    !evidence.routeBridgeCompletion.resultNextCheck.includes("Export Preflight") &&
    !evidence.routeBridgeCompletion.resultNextCheck.includes("Production Snapshot") &&
    !evidence.routeBridgeCompletion.resultNextCheck.includes("Handoff Package Check")
  ) {
    failures.push("live Quick Actions Audience Route Bridge completion should guide the next active completion check");
  }
  if (!evidence.dualReadout.actionPresent) {
    failures.push("live Quick Actions palette should show Dual Audience Readiness Route Readout");
  }
  if (evidence.dualReadout.spotlightAction !== "dual-audience-readiness-route-readout-action") {
    failures.push(
      `live Quick Actions Dual Audience spotlight should target dual-audience-readiness-route-readout-action, got ${evidence.dualReadout.spotlightAction}`
    );
  }
  if (!evidence.dualReadout.spotlightTitle.includes("Review Dual Audience Readiness")) {
    failures.push(`live Quick Actions Dual Audience spotlight should name Dual Audience Readiness, got ${evidence.dualReadout.spotlightTitle}`);
  }
  if (!evidence.dualReadout.resultMetricValue.includes("Dual Audience Readiness Route Readout")) {
    failures.push("live Quick Actions Dual Audience readout result metric should include the route readout");
  }
  if (!evidence.dualBeginner.actionPresent || !evidence.dualBeginner.resultMetricValue.includes("First-time composer lane")) {
    failures.push("live Quick Actions Dual Audience beginner lane should execute with first-time composer lane evidence");
  }
  if (!evidence.dualBeginner.resultNextCheck.includes("First Beat Path")) {
    failures.push("live Quick Actions Dual Audience beginner lane should guide the next First Beat Path check");
  }
  if (!evidence.dualProducer.actionPresent || !evidence.dualProducer.resultMetricValue.includes("Professional producer lane")) {
    failures.push("live Quick Actions Dual Audience producer lane should execute with professional producer lane evidence");
  }
  if (!evidence.dualProducer.resultNextCheck.includes("Export Preflight") && !evidence.dualProducer.resultNextCheck.includes("Production Snapshot")) {
    failures.push("live Quick Actions Dual Audience producer lane should guide the next producer delivery check");
  }
  if (!evidence.completionReadout.actionPresent) {
    failures.push("live Quick Actions palette should show Audience Completion Route Readout");
  }
  if (evidence.completionReadout.spotlightAction !== "audience-completion-route-readout-action") {
    failures.push(
      `live Quick Actions Audience Completion spotlight should target audience-completion-route-readout-action, got ${evidence.completionReadout.spotlightAction}`
    );
  }
  if (!evidence.completionReadout.spotlightTitle.includes("Review Audience Completion Route")) {
    failures.push(`live Quick Actions Audience Completion spotlight should name Audience Completion Route, got ${evidence.completionReadout.spotlightTitle}`);
  }
  if (!evidence.completionReadout.resultMetricValue.includes("Audience Completion Route Readout")) {
    failures.push("live Quick Actions Audience Completion readout result metric should include the route readout");
  }
  if (!evidence.completionBeginner.actionPresent || !evidence.completionBeginner.resultMetricValue.includes("First-time composer completion")) {
    failures.push("live Quick Actions Audience Completion beginner lane should execute with first-time composer completion evidence");
  }
  if (
    !evidence.completionBeginner.resultNextCheck.includes("First Beat Path") &&
    !evidence.completionBeginner.resultNextCheck.includes("Export Preflight") &&
    !evidence.completionBeginner.resultNextCheck.includes("Handoff Package Check")
  ) {
    failures.push("live Quick Actions Audience Completion beginner lane should guide the next beginner completion check");
  }
  if (!evidence.completionProducer.actionPresent || !evidence.completionProducer.resultMetricValue.includes("Professional producer completion")) {
    failures.push("live Quick Actions Audience Completion producer lane should execute with professional producer completion evidence");
  }
  if (
    !evidence.completionProducer.resultNextCheck.includes("Production Snapshot") &&
    !evidence.completionProducer.resultNextCheck.includes("Export Preflight") &&
    !evidence.completionProducer.resultNextCheck.includes("Handoff Package Check")
  ) {
    failures.push("live Quick Actions Audience Completion producer lane should guide the next producer completion check");
  }
  if (!evidence.starterBeginner.buttonPresent || !evidence.starterBeginner.followupPresent || !evidence.starterBeginner.actionPresent) {
    failures.push("live Audience Starter beginner visible button and Quick Action should be available");
  }
  if (
    !evidence.starterBeginner.visibleResultMetricValue.includes("starter project") ||
    !evidence.starterBeginner.visibleResultMetricValue.includes("First-time composer")
  ) {
    failures.push("live Audience Starter beginner visible result should expose starter project metric feedback");
  }
  if (
    evidence.starterBeginner.visibleFollowupActionCount < 2 ||
    !evidence.starterBeginner.visibleFollowupPrimaryPresent ||
    !evidence.starterBeginner.visibleFollowupReadinessPresent ||
    !evidence.starterBeginner.visibleFollowupActionLabels.includes("First Beat Path") ||
    !evidence.starterBeginner.visibleFollowupActionLabels.includes("Dual Audience Readiness")
  ) {
    failures.push("live Audience Starter beginner visible result should expose First Beat Path and Dual Audience Readiness follow-up buttons");
  }
  if (
    !evidence.starterBeginner.visibleFollowupPrimaryResult.includes("First Beat Path") ||
    !evidence.starterBeginner.visibleFollowupReadinessResult.includes("Dual Audience Readiness")
  ) {
    failures.push("live Audience Starter beginner follow-up buttons should route to First Beat Path and Dual Audience Readiness surfaces");
  }
  if (!evidence.starterProducer.buttonPresent || !evidence.starterProducer.followupPresent || !evidence.starterProducer.actionPresent) {
    failures.push("live Audience Starter producer visible button and Quick Action should be available");
  }
  if (
    !evidence.starterProducer.visibleResultPresent ||
    !evidence.starterProducer.visibleResultStatus.includes("Applied") ||
    !evidence.starterProducer.visibleResultTitle.includes("Professional producer") ||
    !evidence.starterProducer.visibleResultMetricValue.includes("starter project") ||
    !evidence.starterProducer.visibleResultMetricValue.includes("Professional producer") ||
    !evidence.starterProducer.visibleResultMetricValue.includes("Studio")
  ) {
    failures.push("live Audience Starter producer visible result should expose studio starter project metric feedback");
  }
  if (
    evidence.starterProducer.visibleFollowupActionCount < 3 ||
    !evidence.starterProducer.visibleFollowupPrimaryPresent ||
    !evidence.starterProducer.visibleFollowupReadinessPresent ||
    !evidence.starterProducer.visibleFollowupCompletionPresent ||
    !evidence.starterProducer.visibleFollowupActionLabels.includes("Review Queue") ||
    !evidence.starterProducer.visibleFollowupActionLabels.includes("Export Preflight") ||
    !evidence.starterProducer.visibleFollowupActionLabels.includes("Handoff Package Check")
  ) {
    failures.push("live Audience Starter producer visible result should expose Review Queue, Export Preflight, and Handoff Package Check follow-up buttons");
  }
  if (
    !evidence.starterProducer.visibleFollowupPrimaryResult.includes("Review Queue") ||
    !evidence.starterProducer.visibleFollowupReadinessResult.includes("Export Preflight") ||
    !evidence.starterProducer.visibleFollowupCompletionResult.includes("Package")
  ) {
    failures.push("live Audience Starter producer follow-up buttons should route to Review Queue, Export Preflight, and Handoff Package Check surfaces");
  }
  return failures;
}

function launchSmokeBridgeDirectFailures(evidence: LaunchSmokeBridgeDirectEvidenceBundle): string[] {
  const failures: string[] = [];
  if (!evidence.readiness.buttonPresent || !evidence.readiness.resultPresent) {
    failures.push("live Audience Route Bridge readiness button should show a direct result strip");
  }
  if (!evidence.readiness.resultTitle.includes("Opened readiness") || !evidence.readiness.resultMetric.includes("Bridge Readiness Result")) {
    failures.push("live Audience Route Bridge readiness direct result should name the readiness action");
  }
  if (
    !evidence.readiness.resultDestination.includes("First Beat Path") &&
    !evidence.readiness.resultDestination.includes("Export Preflight") &&
    !evidence.readiness.resultDestination.includes("Production Snapshot")
  ) {
    failures.push("live Audience Route Bridge readiness direct result should name the active readiness destination");
  }
  if (!evidence.completion.buttonPresent || !evidence.completion.resultPresent) {
    failures.push("live Audience Route Bridge completion button should show a direct result strip");
  }
  if (!evidence.completion.resultTitle.includes("Opened completion") || !evidence.completion.resultMetric.includes("Bridge Completion Result")) {
    failures.push("live Audience Route Bridge completion direct result should name the completion action");
  }
  if (
    !evidence.completion.resultDestination.includes("First Beat Path") &&
    !evidence.completion.resultDestination.includes("Export Preflight") &&
    !evidence.completion.resultDestination.includes("Production Snapshot") &&
    !evidence.completion.resultDestination.includes("Handoff Package Check")
  ) {
    failures.push("live Audience Route Bridge completion direct result should name the active completion destination");
  }

  return failures;
}

function launchSmokeCommandReferenceFailures(evidence: LaunchSmokeCommandReferenceEvidence): string[] {
  const failures: string[] = [];
  if (!evidence.opened || !evidence.searchInputPresent || evidence.searchQuery !== "audience starter") {
    failures.push("live Command Reference should open and search for Audience Starter");
  }
  if (!evidence.itemPresent || evidence.spotlightId !== "command-audience-starter" || evidence.spotlightLabel !== "Audience Starter") {
    failures.push("live Command Reference search should spotlight the Audience Starter command-map row");
  }
  if (!evidence.targetHasAudienceTargets || !evidence.targetText.includes("Build")) {
    failures.push("live Audience Starter Command Reference target should name both starter audiences");
  }
  if (!evidence.contextHasStarterCommands || !evidence.contextHasFollowupRoutes) {
    failures.push("live Audience Starter Command Reference context should expose starter commands and follow-up routes");
  }
  if (!evidence.contextHasResultMetric || !evidence.contextHasDirectComposition) {
    failures.push("live Audience Starter Command Reference context should expose result metrics and direct-composition posture");
  }
  if (!evidence.handoffButtonPresent || !evidence.quickActionsOpenedAfterHandoff) {
    failures.push("live Audience Starter Command Reference spotlight should hand off to Quick Actions");
  }
  if (
    !evidence.contextText.includes("First Beat Path") ||
    !evidence.contextText.includes("Review Queue") ||
    !evidence.contextText.includes("Handoff Package Check")
  ) {
    failures.push("live Audience Starter Command Reference context should name beginner and producer next checks");
  }

  return failures;
}

function launchSmokeModalFocusFailures(evidence: LaunchSmokeModalFocusEvidence): string[] {
  const failures: string[] = [];
  if (
    evidence.closedDetails.totalCount !== 24 ||
    evidence.closedDetails.initiallyOpenCount !== 1 ||
    evidence.closedDetails.closedCount !== 23 ||
    evidence.closedDetails.leakedContentCount !== 0 ||
    evidence.closedDetails.leakedControlCount !== 0
  ) {
    failures.push("all 24 native disclosures should honor their initial state with zero visible or reachable content beneath the 23 closed summaries");
  }
  if (
    !evidence.closedDetails.guideOpenReady ||
    !evidence.closedDetails.guideReclosedReady ||
    !evidence.closedDetails.patternLabOpenReady ||
    !evidence.closedDetails.patternLabReclosedReady ||
    !evidence.closedDetails.mixerOpenReady ||
    !evidence.closedDetails.mixerReclosedReady
  ) {
    failures.push("native Enter should reopen and recontain Guide & Review Center, Pattern Lab, and nested mixer Tone & Space disclosures");
  }
  if (
    !evidence.closedDetails.projectStayedUnchanged ||
    !evidence.closedDetails.undoPostureUnchanged ||
    !evidence.closedDetails.playbackStayedStopped
  ) {
    failures.push("disclosure-only keyboard toggles should leave project, undo, and playback posture unchanged");
  }
  if (
    evidence.drumGrid.buttonCount !== 64 ||
    !evidence.drumGrid.pressedSemanticsReady ||
    !evidence.drumGrid.rovingTabReady ||
    !evidence.drumGrid.nativeArrowReady ||
    !evidence.drumGrid.navigationSelectionReady ||
    !evidence.drumGrid.navigationEventCountUnchanged
  ) {
    failures.push("drum grid should expose 64 pressed-state buttons with one roving Tab stop and representative non-mutating native arrow navigation");
  }
  if (
    !evidence.drumGrid.enterToggleReady ||
    !evidence.drumGrid.spaceToggleReady ||
    !evidence.drumGrid.activationSingleToggleReady ||
    !evidence.drumGrid.playbackStayedStopped ||
    !evidence.drumGrid.undoRestored
  ) {
    failures.push("drum grid Enter and Space should toggle exactly one selected hit through undo while leaving playback stopped");
  }
  if (
    evidence.noteGrid.bassButtonCount !== 144 ||
    evidence.noteGrid.melodyButtonCount !== 160 ||
    !evidence.noteGrid.pressedSemanticsReady ||
    !evidence.noteGrid.rovingTabReady ||
    !evidence.noteGrid.nativeArrowReady ||
    !evidence.noteGrid.navigationSelectionReady ||
    !evidence.noteGrid.navigationEventCountUnchanged
  ) {
    failures.push("808 and Synth grids should expose one Tab stop each with pressed-state parity and representative non-mutating native spatial navigation");
  }
  if (
    !evidence.noteGrid.enterToggleReady ||
    !evidence.noteGrid.spaceToggleReady ||
    !evidence.noteGrid.activationSingleToggleReady ||
    !evidence.noteGrid.playbackStayedStopped ||
    !evidence.noteGrid.undoRestored
  ) {
    failures.push("note-grid Enter and Space should toggle exactly one selected note through undo while leaving playback stopped");
  }
  if (!evidence.quickShortcutFromEditable || !evidence.commandShortcutFromEditable) {
    failures.push("modified Quick Actions and Command Reference shortcuts should open from an editable workstation field");
  }
  if (!evidence.editableQuestionTyped) {
    failures.push("unmodified question mark should remain typable inside a modal search field");
  }
  if (!evidence.modifiedShortcutHandoff) {
    failures.push("modified command shortcuts should hand off directly between Command Reference and Quick Actions search fields");
  }
  if (!evidence.editableValuePreserved || !evidence.editableFocusRestored) {
    failures.push("editable-field command shortcut opening and handoff should preserve the field value and restore its focus after Escape");
  }
  if (evidence.quickInitialFocus !== "quick-actions-search") {
    failures.push("Quick Actions should place initial focus in command search");
  }
  if (!evidence.quickForwardWrap || !evidence.quickBackwardWrap) {
    failures.push("Quick Actions should wrap real Tab and Shift+Tab inside the modal");
  }
  if (!evidence.quickEscapeClosed || !evidence.quickFocusRestored) {
    failures.push("Quick Actions Escape should close the modal and restore its opener");
  }
  if (
    !evidence.quickKeyboardArrowDownMoved ||
    !evidence.quickKeyboardArrowUpReturned ||
    !evidence.quickKeyboardEndMovedLast ||
    !evidence.quickKeyboardHomeReturnedFirst ||
    !evidence.quickKeyboardFocusRetained
  ) {
    failures.push("Quick Actions search should retain focus while native ArrowUp/ArrowDown/Home/End move the visible runnable selection");
  }
  if (!evidence.quickKeyboardEnterRanSelected || evidence.quickKeyboardSelectedTitle !== evidence.quickKeyboardResultTitle) {
    failures.push("Quick Actions native Enter should run the explicitly selected result instead of the first result");
  }
  if (evidence.commandInitialFocus !== "command-reference-search-input") {
    failures.push("Command Reference should place initial focus in reference search");
  }
  if (!evidence.commandForwardWrap || !evidence.commandBackwardWrap) {
    failures.push("Command Reference should wrap real Tab and Shift+Tab inside the modal");
  }
  if (!evidence.commandEscapeClosed || !evidence.commandFocusRestored) {
    failures.push("Command Reference Escape should close the modal and restore its opener");
  }
  if (evidence.switchInitialFocus !== "command-reference-search-input" || !evidence.switchFocusRestored) {
    failures.push("Switching Quick Actions to Command Reference should preserve the original opener and focus lifecycle");
  }
  if (!evidence.dockInitialHidden || !evidence.dockVisible || !evidence.dockReturnedHidden) {
    failures.push("workspace command dock should appear only after the full transport leaves view and hide again on return");
  }
  if (!evidence.dockViewportReady || evidence.dockControlCount !== 5) {
    failures.push("workspace command dock should stay fully inside the desktop viewport with five essential controls");
  }
  if (
    !evidence.dockPositionMirrorsHeader ||
    !evidence.dockUndoRedoParity ||
    !evidence.dockShortcutMetadataReady ||
    !evidence.dockFocusReady
  ) {
    failures.push("workspace command dock should mirror transport posture, Undo/Redo availability, and shortcut metadata");
  }
  if (
    !evidence.dockSharedPlayReady ||
    !evidence.dockPlayHitTargetReady ||
    !evidence.dockOriginalPlaybackRestored ||
    !evidence.dockPostureRestored
  ) {
    failures.push(
      "workspace command dock native pointer input should hit the visible enabled Play target, reuse the full transport Play/Stop state, and restore the original playback, zone, and scope posture"
    );
  }
  if (!evidence.dockActionsOpened || !evidence.dockActionsFocusRestored) {
    failures.push("workspace command dock native pointer/Escape input should open Quick Actions and restore dock focus");
  }
  return failures;
}

function launchSmokeFunctionalTabsFailures(evidence: LaunchSmokeFunctionalTabsEvidence): string[] {
  const failures: string[] = [];
  const zones: LaunchSmokeFunctionalTabZone[] = ["compose", "arrange", "mix", "deliver"];
  const expectedTraversal = [
    "initial:compose",
    "native-click:arrange",
    "ArrowRight:mix",
    "End:deliver",
    "Home:compose",
    "ArrowLeft:deliver",
    "ArrowRight:compose"
  ];
  const actualTraversal = evidence.traversal.map((entry) => `${entry.input}:${entry.zone}`);

  if (
    evidence.initial.activeZone !== "compose" ||
    evidence.initial.selectedTabCount !== 1 ||
    evidence.initial.tabStopCount !== 1 ||
    evidence.initial.visiblePanelCount !== 1
  ) {
    failures.push("functional tabs should launch with only Compose selected, tabbable, and visible");
  }
  if (actualTraversal.join("|") !== expectedTraversal.join("|")) {
    failures.push(`functional tabs should follow native click and Arrow/Home/End traversal, got ${actualTraversal.join(", ")}`);
  }
  for (const zone of zones) {
    const state = evidence.states[zone];
    if (
      state.activeZone !== zone ||
      state.tabCount !== 4 ||
      state.tabPanelCount !== 4 ||
      state.selectedTabCount !== 1 ||
      state.tabStopCount !== 1 ||
      state.visiblePanelCount !== 1 ||
      !state.ariaConnectionsReady ||
      state.inactiveHiddenPanelCount !== 3 ||
      state.inactiveZeroRectPanelCount !== 3 ||
      state.inactiveFocusableControlCount !== 0
    ) {
      failures.push(`functional tab ${zone} should expose one ARIA-connected active surface and fully contain three inactive panels`);
    }
  }
  if (evidence.states.mix.mixMixerVisible === evidence.states.mix.mixMasterVisible) {
    failures.push("Mix functional tab should visibly contain exactly one selected Mixer or Master page");
  }
  if (!evidence.states.deliver.deliverHandoffVisible) {
    failures.push("Deliver functional tab should visibly contain Handoff Pack");
  }
  const workspacePages = evidence.workspacePages;
  const expectedComposeTraversal = [
    "initial:drums",
    "native-click:notes",
    "ArrowRight:instruments",
    "Home:drums",
    "ArrowLeft:instruments",
    "ArrowRight:drums"
  ];
  const expectedMixTraversal = [
    "initial:mixer",
    "native-click:master",
    "ArrowLeft:mixer",
    "End:master",
    "Home:mixer",
    "ArrowRight:master"
  ];
  if (
    workspacePages.composeTraversal.map((entry) => `${entry.input}:${entry.page}`).join("|") !==
      expectedComposeTraversal.join("|") ||
    workspacePages.mixTraversal.map((entry) => `${entry.input}:${entry.page}`).join("|") !==
      expectedMixTraversal.join("|")
  ) {
    failures.push("nested Compose and Mix pages should follow native click plus Arrow/Home/End traversal");
  }
  for (const [group, pageIds] of [
    ["compose", ["drums", "notes", "instruments"]],
    ["mix", ["mixer", "master"]]
  ] as const) {
    const states = group === "compose" ? workspacePages.composeStates : workspacePages.mixStates;
    for (const page of pageIds) {
      const state = states[page as keyof typeof states] as LaunchSmokeWorkspacePageStateEvidence;
      const pageCount = pageIds.length;
      if (
        state.activePage !== page ||
        state.tabCount !== pageCount ||
        state.tabPanelCount !== pageCount ||
        state.selectedTabCount !== 1 ||
        state.tabStopCount !== 1 ||
        state.visiblePanelCount !== 1 ||
        !state.ariaConnectionsReady ||
        !state.fullWidthReady ||
        state.activePanelHorizontalOverflow > 1 ||
        state.inactiveHiddenPanelCount !== pageCount - 1 ||
        state.inactiveZeroRectPanelCount !== pageCount - 1 ||
        state.inactiveFocusableControlCount !== 0
      ) {
        failures.push(
          `workspace page ${group}/${page} should expose one full-width ARIA-connected surface and fully hide its peer pages`
        );
      }
    }
  }
  if (
    !workspacePages.pageStatePreservedAcrossOuterTabs.compose ||
    !workspacePages.pageStatePreservedAcrossOuterTabs.mix
  ) {
    failures.push("selected nested Compose and Mix pages should survive outer workspace tab round trips");
  }
  if (
    !evidence.composeRoundTrip.editFingerprintPreserved ||
    !evidence.composeRoundTrip.selectedPatternPreserved ||
    !evidence.composeRoundTrip.disclosurePosturePreserved ||
    !evidence.composeRoundTrip.undoRedoPosturePreserved ||
    !evidence.composeRoundTrip.dirtyPosturePreserved ||
    !evidence.composeRoundTrip.playbackPosturePreserved ||
    !evidence.composeRoundTrip.keyboardCapturePosturePreserved
  ) {
    failures.push("Compose edit, Pattern, disclosure, history, dirty, playback, and keyboard-capture posture should survive a tab round trip");
  }
  const hiddenComposeGuardKeys = ["1", "2", "3", "Delete", "A"] as const;
  if (
    !(["arrange", "mix", "deliver"] as const).every((zone) =>
      hiddenComposeGuardKeys.every((key) => evidence.hiddenComposeGuards[zone][key])
    )
  ) {
    failures.push("each 1/2/3/Delete and keyboard-capture key outside Compose should immediately leave the hidden Pattern and Compose data unchanged");
  }
  if (!evidence.nativeMenuDeleteGuards.mix || !evidence.nativeMenuDeleteGuards.deliver) {
    failures.push("native Delete Selected Event menu activation should leave hidden Compose data unchanged from Mix and Deliver");
  }
  if (
    evidence.crossTabFocusTransfer.sourceZone !== "mix" ||
    evidence.crossTabFocusTransfer.destinationZone !== "compose" ||
    !evidence.crossTabFocusTransfer.triggerTestId.startsWith("finish-checklist-focus-") ||
    !["workflow-target-compose", "workspace-panel-compose"].includes(
      evidence.crossTabFocusTransfer.activeElementTestId
    ) ||
    !evidence.crossTabFocusTransfer.activeElementInViewport ||
    !evidence.crossTabFocusTransfer.activeElementVisible ||
    !evidence.crossTabFocusTransfer.activeElementWithinActivePanel ||
    !evidence.crossTabFocusTransfer.sourcePanelHidden
  ) {
    failures.push("a visible Mix Focus action should activate Compose and transfer focus out of the hidden source panel");
  }
  if (
    evidence.finishChecklistQuickActionReveal.sourceZone !== "deliver" ||
    evidence.finishChecklistQuickActionReveal.destinationZone !== "mix" ||
    evidence.finishChecklistQuickActionReveal.activeElementTestId !== "finish-checklist" ||
    !evidence.finishChecklistQuickActionReveal.activeElementVisible ||
    !evidence.finishChecklistQuickActionReveal.activeElementWithinActivePanel ||
    !evidence.finishChecklistQuickActionReveal.actionVisible ||
    !evidence.finishChecklistQuickActionReveal.modalClosed ||
    !evidence.finishChecklistQuickActionReveal.masterReviewOpen ||
    !evidence.finishChecklistQuickActionReveal.finishChecklistClearOfNavigator ||
    evidence.finishChecklistQuickActionReveal.finishChecklistWidth <= 0 ||
    evidence.finishChecklistQuickActionReveal.finishChecklistHeight <= 0 ||
    !evidence.finishChecklistQuickActionReveal.finishChecklistInViewport ||
    !evidence.finishChecklistQuickActionReveal.finishChecklistVisible ||
    evidence.finishChecklistQuickActionReveal.visibleHeight <= 0 ||
    evidence.finishChecklistQuickActionReveal.viewportHeight < 760 ||
    !evidence.finishChecklistQuickActionReveal.projectFingerprintPreserved
  ) {
    failures.push("the live Finish Checklist Route Quick Action should reveal the visible Mix checklist below the sticky navigator from Deliver without editing Compose");
  }
  if (
    evidence.guidanceBeatPassportQuickActionReveal.sourceZone !== "compose" ||
    evidence.guidanceBeatPassportQuickActionReveal.destinationZone !== "compose" ||
    evidence.guidanceBeatPassportQuickActionReveal.activeElementTestId !== "beat-passport" ||
    !evidence.guidanceBeatPassportQuickActionReveal.activeElementVisible ||
    evidence.guidanceBeatPassportQuickActionReveal.originalGuidanceCenterOpen ||
    !evidence.guidanceBeatPassportQuickActionReveal.guidanceCenterInitiallyClosed ||
    !evidence.guidanceBeatPassportQuickActionReveal.nativeShortcutOpened ||
    !evidence.guidanceBeatPassportQuickActionReveal.actionVisible ||
    evidence.guidanceBeatPassportQuickActionReveal.selectedActionId !== "beat-passport-route-readout-action" ||
    !evidence.guidanceBeatPassportQuickActionReveal.modalClosed ||
    !evidence.guidanceBeatPassportQuickActionReveal.guidanceCenterOpen ||
    !evidence.guidanceBeatPassportQuickActionReveal.passportWithinGuidance ||
    !evidence.guidanceBeatPassportQuickActionReveal.passportVisible ||
    evidence.guidanceBeatPassportQuickActionReveal.passportWidth <= 0 ||
    evidence.guidanceBeatPassportQuickActionReveal.passportHeight <= 0 ||
    !evidence.guidanceBeatPassportQuickActionReveal.passportInViewport ||
    !evidence.guidanceBeatPassportQuickActionReveal.passportClearOfNavigator ||
    evidence.guidanceBeatPassportQuickActionReveal.visibleHeight <= 0 ||
    evidence.guidanceBeatPassportQuickActionReveal.viewportHeight < 760 ||
    !evidence.guidanceBeatPassportQuickActionReveal.statusText.startsWith("Beat Passport Route Readout Pattern ") ||
    !evidence.guidanceBeatPassportQuickActionReveal.projectFingerprintPreserved ||
    !evidence.guidanceBeatPassportQuickActionReveal.guidancePostureRestored
  ) {
    failures.push(
      `the native Quick Actions Beat Passport route should reveal and focus the Guide target in the Compose viewport, clear the sticky navigator, preserve Compose, and restore Guide posture, got ${JSON.stringify(evidence.guidanceBeatPassportQuickActionReveal)}`
    );
  }
  if (
    evidence.firstBeatPathTransportQuickActionReveal.sourceZone !== "compose" ||
    evidence.firstBeatPathTransportQuickActionReveal.destinationZone !== "compose" ||
    evidence.firstBeatPathTransportQuickActionReveal.activeElementTestId !== "workflow-target-transport" ||
    !evidence.firstBeatPathTransportQuickActionReveal.activeElementVisible ||
    !evidence.firstBeatPathTransportQuickActionReveal.nativeShortcutOpened ||
    !evidence.firstBeatPathTransportQuickActionReveal.actionVisible ||
    evidence.firstBeatPathTransportQuickActionReveal.selectedActionId !== "first-beat-path-step-setup" ||
    !evidence.firstBeatPathTransportQuickActionReveal.modalClosed ||
    !evidence.firstBeatPathTransportQuickActionReveal.transportVisible ||
    evidence.firstBeatPathTransportQuickActionReveal.transportWidth <= 0 ||
    evidence.firstBeatPathTransportQuickActionReveal.transportHeight <= 0 ||
    !evidence.firstBeatPathTransportQuickActionReveal.transportInViewport ||
    evidence.firstBeatPathTransportQuickActionReveal.visibleHeight <= 0 ||
    evidence.firstBeatPathTransportQuickActionReveal.viewportHeight < 760 ||
    !evidence.firstBeatPathTransportQuickActionReveal.statusText.startsWith("First Beat Path Setup:") ||
    !evidence.firstBeatPathTransportQuickActionReveal.projectFingerprintPreserved ||
    !evidence.firstBeatPathTransportQuickActionReveal.guidancePostureRestored
  ) {
    failures.push(
      `the native Quick Actions First Beat Path Setup route should focus the visible Transport outside functional tabs, preserve active Compose and project data, close the modal, and restore Guide posture, got ${JSON.stringify(evidence.firstBeatPathTransportQuickActionReveal)}`
    );
  }
  if (
    evidence.reviewQueueQuickActionReveal.sourceZone !== "mix" ||
    evidence.reviewQueueQuickActionReveal.destinationZone !== "mix" ||
    evidence.reviewQueueQuickActionReveal.activeElementTestId !== "review-queue" ||
    !evidence.reviewQueueQuickActionReveal.activeElementVisible ||
    !evidence.reviewQueueQuickActionReveal.activeElementWithinActivePanel ||
    !evidence.reviewQueueQuickActionReveal.masterReviewInitiallyClosed ||
    !evidence.reviewQueueQuickActionReveal.masterReviewQueueInitiallyClosed ||
    !evidence.reviewQueueQuickActionReveal.nativeShortcutOpened ||
    !evidence.reviewQueueQuickActionReveal.actionVisible ||
    evidence.reviewQueueQuickActionReveal.selectedActionId !== "review-queue-route-readout-action" ||
    !evidence.reviewQueueQuickActionReveal.modalClosed ||
    !evidence.reviewQueueQuickActionReveal.masterReviewOpen ||
    !evidence.reviewQueueQuickActionReveal.masterReviewQueueOpen ||
    !evidence.reviewQueueQuickActionReveal.reviewQueueVisible ||
    evidence.reviewQueueQuickActionReveal.reviewQueueWidth <= 0 ||
    evidence.reviewQueueQuickActionReveal.reviewQueueHeight <= 0 ||
    !evidence.reviewQueueQuickActionReveal.reviewQueueInViewport ||
    !evidence.reviewQueueQuickActionReveal.reviewQueueClearOfNavigator ||
    evidence.reviewQueueQuickActionReveal.visibleHeight <= 0 ||
    evidence.reviewQueueQuickActionReveal.viewportHeight < 760 ||
    !evidence.reviewQueueQuickActionReveal.statusText.startsWith("Review Queue Route Readout Pattern ") ||
    !evidence.reviewQueueQuickActionReveal.projectFingerprintPreserved ||
    !evidence.reviewQueueQuickActionReveal.disclosurePostureRestored
  ) {
    failures.push(
      `the native Quick Actions Review Queue route should synchronously reveal both closed disclosures in the same Mix viewport, clear the sticky navigator, preserve Compose, and restore disclosure posture, got ${JSON.stringify(evidence.reviewQueueQuickActionReveal)}`
    );
  }
  if (
    evidence.minimumWindow.viewportWidth > 1180 ||
    evidence.minimumWindow.viewportWidth < 1000 ||
    evidence.minimumWindow.maximumDocumentHorizontalOverflow !== 0 ||
    evidence.minimumWindow.maximumTabListHorizontalOverflow !== 0 ||
    evidence.minimumWindow.maximumActivePanelHorizontalOverflow !== 0
  ) {
    failures.push(
      `functional tabs should remain horizontally contained at the 1180 minimum window, got viewport ${evidence.minimumWindow.viewportWidth} and overflow ${evidence.minimumWindow.maximumDocumentHorizontalOverflow}/${evidence.minimumWindow.maximumTabListHorizontalOverflow}/${evidence.minimumWindow.maximumActivePanelHorizontalOverflow}`
    );
  }
  for (const zone of ["arrange", "mix", "deliver"] as const) {
    const sticky = evidence.stickyNavigatorAfterDeepScroll[zone];
    if (
      sticky.activeZone !== zone ||
      sticky.viewportWidth < 1000 ||
      sticky.viewportWidth > 1180 ||
      !sticky.documentScrollable ||
      sticky.maximumScrollY < 240 ||
      sticky.scrollY < 240 ||
      !sticky.deepScrollReached ||
      sticky.navigatorPosition !== "sticky" ||
      sticky.configuredTop !== 8 ||
      !sticky.stickyTopAligned ||
      !sticky.navigatorFullyVisible ||
      !sticky.tabListFullyVisible ||
      !sticky.activeTabFullyVisible
    ) {
      failures.push(
        `functional tab ${zone} should keep the sticky navigator and active tab fully visible after a deep 1180px-window scroll, got ${JSON.stringify(sticky)}`
      );
    }
  }
  const captureDigests = new Set<string>();
  for (const zone of zones) {
    const capture = evidence.captures[zone];
    if (
      capture.pngBytes < 20000 ||
      capture.bitmapBytes < capture.width * capture.height * 4 ||
      capture.sampledPixels < 1000 ||
      capture.nonBackgroundSamples < 100 ||
      !/^[a-f0-9]{64}$/u.test(capture.pixelDigest) ||
      !/^[a-f0-9]{64}$/u.test(capture.pngDigest) ||
      capture.artifact !== `build/desktop/functional-tabs-launch-smoke/${zone}.png`
    ) {
      failures.push(`functional tab ${zone} should return a substantial persisted PNG and non-empty pixel digest`);
    }
    captureDigests.add(capture.pixelDigest);
  }
  if (captureDigests.size !== zones.length) {
    failures.push("each functional tab screenshot should have a distinct pixel digest");
  }
  if (!evidence.restoredCompose) {
    failures.push("functional tab smoke should restore Compose and its original local interaction posture");
  }
  return failures;
}

function launchSmokeVisualFailures(evidence: LaunchSmokeVisualEvidence): string[] {
  const failures: string[] = [];
  const opaqueRatio = evidence.sampledPixels > 0 ? evidence.opaqueSamples / evidence.sampledPixels : 0;
  const nonBackgroundRatio = evidence.sampledPixels > 0 ? evidence.nonBackgroundSamples / evidence.sampledPixels : 0;

  if (evidence.width < 1180 || evidence.height < 760) {
    failures.push(`screenshot should respect desktop minimums, got ${evidence.width}x${evidence.height}`);
  }
  if (evidence.pngBytes < 50000) {
    failures.push(`screenshot PNG should be substantial, got ${evidence.pngBytes} bytes`);
  }
  if (evidence.bitmapBytes < evidence.width * evidence.height * 4) {
    failures.push(`screenshot bitmap should include RGBA pixels, got ${evidence.bitmapBytes} bytes`);
  }
  if (evidence.sampledPixels < 1000) {
    failures.push(`screenshot should sample at least 1000 pixels, got ${evidence.sampledPixels}`);
  }
  if (opaqueRatio < 0.95) {
    failures.push(`screenshot should be mostly opaque, got ${(opaqueRatio * 100).toFixed(1)}% opaque samples`);
  }
  if (evidence.uniqueSampledColors < 24) {
    failures.push(`screenshot should have visible color diversity, got ${evidence.uniqueSampledColors} sampled colors`);
  }
  if (nonBackgroundRatio < 0.04) {
    failures.push(`screenshot should contain non-background UI pixels, got ${(nonBackgroundRatio * 100).toFixed(1)}%`);
  }
  if (evidence.maxColorDelta < 48) {
    failures.push(`screenshot should have visible contrast, got max color delta ${evidence.maxColorDelta}`);
  }
  if (evidence.brightSamples < 20 || evidence.darkSamples < 20) {
    failures.push(`screenshot should contain both bright and dark UI samples, got ${evidence.brightSamples} bright and ${evidence.darkSamples} dark`);
  }

  return failures;
}

async function waitForLaunchSmokePaint(): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
}

async function collectLaunchSmokeVisualEvidence(win: BrowserWindow): Promise<LaunchSmokeVisualEvidence> {
  await waitForLaunchSmokePaint();
  const screenshot = await win.webContents.capturePage();
  const { width, height } = screenshot.getSize();
  const pngBytes = screenshot.toPNG().byteLength;
  const bitmap = screenshot.toBitmap();
  const totalPixels = Math.floor(bitmap.byteLength / 4);
  const targetSamples = Math.min(12000, totalPixels);
  const stride = Math.max(1, Math.floor(totalPixels / Math.max(1, targetSamples)));
  const base0 = bitmap[0] ?? 0;
  const base1 = bitmap[1] ?? 0;
  const base2 = bitmap[2] ?? 0;
  const sampledColors = new Set<string>();
  let sampledPixels = 0;
  let opaqueSamples = 0;
  let nonBackgroundSamples = 0;
  let brightSamples = 0;
  let darkSamples = 0;
  let maxColorDelta = 0;

  for (let pixel = 0; pixel < totalPixels; pixel += stride) {
    const offset = pixel * 4;
    const c0 = bitmap[offset] ?? 0;
    const c1 = bitmap[offset + 1] ?? 0;
    const c2 = bitmap[offset + 2] ?? 0;
    const alpha = bitmap[offset + 3] ?? 255;
    const colorDelta = Math.abs(c0 - base0) + Math.abs(c1 - base1) + Math.abs(c2 - base2);
    const colorSum = c0 + c1 + c2;

    sampledPixels += 1;
    if (alpha >= 240) {
      opaqueSamples += 1;
    }
    if (colorDelta > 24) {
      nonBackgroundSamples += 1;
    }
    if (colorSum > 420) {
      brightSamples += 1;
    }
    if (colorSum < 120) {
      darkSamples += 1;
    }
    if (colorDelta > maxColorDelta) {
      maxColorDelta = colorDelta;
    }
    sampledColors.add(`${c0 >> 4}:${c1 >> 4}:${c2 >> 4}`);
  }

  return {
    bitmapBytes: bitmap.byteLength,
    brightSamples,
    darkSamples,
    height,
    maxColorDelta,
    nonBackgroundSamples,
    opaqueSamples,
    pngBytes,
    sampledPixels,
    uniqueSampledColors: sampledColors.size,
    width
  };
}

function collectLaunchSmokeVisualEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokeVisualEvidence> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out collecting live screenshot visual evidence.")), 30000);
    void collectLaunchSmokeVisualEvidence(win)
      .then((evidence) => {
        clearTimeout(timeout);
        resolve(evidence);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

function publicFunctionalTabState(
  snapshot: LaunchSmokeFunctionalTabInternalSnapshot
): LaunchSmokeFunctionalTabStateEvidence {
  return {
    activePanelHorizontalOverflow: snapshot.activePanelHorizontalOverflow,
    activeZone: snapshot.activeZone,
    ariaConnectionsReady: snapshot.ariaConnectionsReady,
    deliverHandoffVisible: snapshot.deliverHandoffVisible,
    documentHorizontalOverflow: snapshot.documentHorizontalOverflow,
    inactiveFocusableControlCount: snapshot.inactiveFocusableControlCount,
    inactiveHiddenPanelCount: snapshot.inactiveHiddenPanelCount,
    inactiveZeroRectPanelCount: snapshot.inactiveZeroRectPanelCount,
    mixMasterVisible: snapshot.mixMasterVisible,
    mixMixerVisible: snapshot.mixMixerVisible,
    selectedTabCount: snapshot.selectedTabCount,
    tabCount: snapshot.tabCount,
    tabListHorizontalOverflow: snapshot.tabListHorizontalOverflow,
    tabPanelCount: snapshot.tabPanelCount,
    tabStopCount: snapshot.tabStopCount,
    visiblePanelCount: snapshot.visiblePanelCount
  };
}

async function readLaunchSmokeFunctionalTabState(win: BrowserWindow): Promise<LaunchSmokeFunctionalTabInternalSnapshot> {
  return (await win.webContents.executeJavaScript(`
    (() => {
      const tabList = document.querySelector('[role="tablist"][aria-label="Workstation function tabs"]');
      const tabs = tabList ? Array.from(tabList.querySelectorAll('[role="tab"]')) : [];
      const panels = ["compose", "arrange", "mix", "deliver"]
        .map((zone) => document.getElementById("workspace-panel-" + zone))
        .filter(Boolean);
      const selectedTabs = tabs.filter((tab) => tab.getAttribute("aria-selected") === "true");
      const tabStops = tabs.filter((tab) => tab.tabIndex === 0);
      const activeTab = selectedTabs[0] ?? null;
      const activeZone = activeTab?.id?.replace("workspace-tab-", "") ?? "";
      const activePanel = activeTab ? document.getElementById(activeTab.getAttribute("aria-controls") ?? "") : null;
      const rendered = (element) => {
        if (!(element instanceof HTMLElement)) return false;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      const visiblePanels = panels.filter((panel) => !panel.hidden && rendered(panel));
      const inactivePanels = panels.filter((panel) => panel !== activePanel);
      const focusableSelector = 'a[href], button, input, select, textarea, [tabindex]';
      const inactiveFocusableControlCount = inactivePanels.reduce(
        (count, panel) =>
          count +
          Array.from(panel.querySelectorAll(focusableSelector)).filter(
            (control) => !control.disabled && control.tabIndex >= 0 && rendered(control)
          ).length,
        0
      );
      const ariaConnectionsReady =
        tabs.length === 4 &&
        panels.length === 4 &&
        tabs.every((tab) => {
          const controlled = document.getElementById(tab.getAttribute("aria-controls") ?? "");
          return Boolean(
            controlled &&
            controlled.getAttribute("role") === "tabpanel" &&
            controlled.getAttribute("aria-labelledby") === tab.id
          );
        });
      const activePressedIds = (selector) =>
        Array.from(document.querySelectorAll(selector))
          .filter((control) => control.getAttribute("aria-pressed") === "true")
          .map((control) => control.getAttribute("data-testid") ?? "")
          .sort();
      const selectedPattern =
        document.querySelector('[data-testid^="pattern-tab-"][aria-selected="true"]')?.getAttribute("data-testid")?.replace("pattern-tab-", "") ?? "";
      const composeDataFingerprint = JSON.stringify({
        selectedPattern,
        title: document.querySelector('[data-testid="project-title-input"]')?.value ?? "",
        bpm: document.querySelector('[data-testid="project-bpm-input"]')?.value ?? "",
        key: document.querySelector('[data-testid="project-key-select"]')?.value ?? "",
        style: document.querySelector('[data-testid="style-select"]')?.value ?? "",
        drums: activePressedIds('button[data-testid^="drum-step-"]'),
        bass: activePressedIds('button[data-testid^="note-step-bass-"]'),
        melody: activePressedIds('button[data-testid^="note-step-melody-"]'),
        chords: Array.from(document.querySelectorAll('[data-testid^="chord-slot-"]')).map((card) => ({
          open: card.getAttribute("data-editor-open") ?? "",
          text: card.textContent?.trim().replace(/\\s+/g, " ") ?? ""
        }))
      });
      const disclosurePosture = JSON.stringify(
        ["pattern-lab", "capture-ideas", "harmony-moves", "sound-design-tools"].map((testId) => ({
          open: document.querySelector('[data-testid="' + testId + '"]')?.open === true,
          testId
        }))
      );
      const undoRedoPosture = JSON.stringify({
        redoDisabled: document.querySelector('[data-testid="redo-button"]')?.disabled === true,
        redoTitle: document.querySelector('[data-testid="redo-button"]')?.getAttribute("title") ?? "",
        undoDisabled: document.querySelector('[data-testid="undo-button"]')?.disabled === true,
        undoTitle: document.querySelector('[data-testid="undo-button"]')?.getAttribute("title") ?? ""
      });
      const dirtyPosture = JSON.stringify({
        detail: document.querySelector('[data-testid="project-safety-detail"]')?.textContent?.trim() ?? "",
        label: document.querySelector('[data-testid="project-safety-label"]')?.textContent?.trim() ?? "",
        localDraft: document.querySelector('[data-testid="local-draft-status"]')?.textContent?.trim() ?? "",
        status: document.querySelector('[data-testid="project-safety-status"]')?.textContent?.trim() ?? ""
      });
      const keyboardCapturePosture = JSON.stringify({
        pressed: document.querySelector('[data-testid="keyboard-capture-toggle"]')?.getAttribute("aria-pressed") ?? "missing",
        status: document.querySelector('[data-testid="keyboard-capture-posture-status"]')?.textContent?.trim() ?? ""
      });
      const playbackPosture = JSON.stringify({
        pressed: document.querySelector('[data-testid="transport-play"]')?.getAttribute("aria-pressed") ?? "missing",
        title: document.querySelector('[data-testid="transport-play"]')?.getAttribute("title") ?? ""
      });
      const mixer = document.querySelector('[data-testid="workflow-target-mix"]');
      const master = document.querySelector('[data-testid="workflow-target-master"]');
      const handoff = document.querySelector('[data-testid="handoff-pack"]');
      return {
        activeComposePage:
          document.querySelector('[role="tablist"][aria-label="Compose editor pages"] [role="tab"][aria-selected="true"]')
            ?.id?.replace("compose-page-tab-", "") ?? "",
        activeMixPage:
          document.querySelector('[role="tablist"][aria-label="Mix editor pages"] [role="tab"][aria-selected="true"]')
            ?.id?.replace("mix-page-tab-", "") ?? "",
        activePanelHorizontalOverflow: activePanel
          ? Math.max(0, activePanel.scrollWidth - activePanel.clientWidth)
          : -1,
        activeZone,
        ariaConnectionsReady,
        composeDataFingerprint,
        deliverHandoffVisible: activeZone === "deliver" && rendered(handoff),
        dirtyPosture,
        disclosurePosture,
        documentHorizontalOverflow: Math.max(
          0,
          document.documentElement.scrollWidth - document.documentElement.clientWidth
        ),
        inactiveFocusableControlCount,
        inactiveHiddenPanelCount: inactivePanels.filter((panel) => panel.hidden).length,
        inactiveZeroRectPanelCount: inactivePanels.filter((panel) => {
          const rect = panel.getBoundingClientRect();
          return rect.width === 0 && rect.height === 0 && panel.getClientRects().length === 0;
        }).length,
        keyboardCapturePosture,
        mixMasterVisible: activeZone === "mix" && rendered(master),
        mixMixerVisible: activeZone === "mix" && rendered(mixer),
        playbackPosture,
        selectedPattern,
        selectedTabCount: selectedTabs.length,
        tabCount: tabs.length,
        tabListHorizontalOverflow: tabList ? Math.max(0, tabList.scrollWidth - tabList.clientWidth) : -1,
        tabPanelCount: panels.length,
        tabStopCount: tabStops.length,
        undoRedoPosture,
        visiblePanelCount: visiblePanels.length
      };
    })();
  `)) as LaunchSmokeFunctionalTabInternalSnapshot;
}

async function sendLaunchSmokeFunctionalTabNativeKey(
  win: BrowserWindow,
  keyCode: string,
  modifiers: Electron.InputEvent["modifiers"] = []
): Promise<void> {
  win.webContents.focus();
  await new Promise((resolve) => setTimeout(resolve, 50));
  win.webContents.sendInputEvent({ type: "keyDown", keyCode, modifiers });
  win.webContents.sendInputEvent({ type: "keyUp", keyCode, modifiers });
  await new Promise((resolve) => setTimeout(resolve, 100));
}

async function clickLaunchSmokeFunctionalTabNativeTarget(win: BrowserWindow, testId: string): Promise<void> {
  const point = (await win.webContents.executeJavaScript(`
    (() => {
      const testId = ${JSON.stringify(testId)};
      const target = document.querySelector('[data-testid="' + testId + '"]');
      if (!(target instanceof HTMLElement)) return null;
      target.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
      const rect = target.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      return { x: Math.round(rect.left + rect.width / 2), y: Math.round(rect.top + rect.height / 2) };
    })();
  `)) as { x: number; y: number } | null;
  if (!point) {
    throw new Error(`Could not locate native functional-tab target ${testId}.`);
  }
  win.webContents.focus();
  win.webContents.sendInputEvent({ type: "mouseMove", x: point.x, y: point.y });
  win.webContents.sendInputEvent({ type: "mouseDown", x: point.x, y: point.y, button: "left", clickCount: 1 });
  win.webContents.sendInputEvent({ type: "mouseUp", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await new Promise((resolve) => setTimeout(resolve, 140));
}

async function readLaunchSmokeWorkspacePageState(
  win: BrowserWindow,
  group: LaunchSmokeWorkspacePageGroup
): Promise<LaunchSmokeWorkspacePageStateEvidence> {
  return (await win.webContents.executeJavaScript(`
    (() => {
      const group = ${JSON.stringify(group)};
      const pageIds = group === "compose" ? ["drums", "notes", "instruments"] : ["mixer", "master"];
      const tabList = document.querySelector('[role="tablist"][aria-label="' +
        (group === "compose" ? "Compose editor pages" : "Mix editor pages") + '"]');
      const tabs = tabList ? Array.from(tabList.querySelectorAll('[role="tab"]')) : [];
      const panels = pageIds.map((page) => document.getElementById(group + "-page-panel-" + page)).filter(Boolean);
      const selectedTabs = tabs.filter((tab) => tab.getAttribute("aria-selected") === "true");
      const tabStops = tabs.filter((tab) => tab.tabIndex === 0);
      const activeTab = selectedTabs[0] ?? null;
      const activePage = activeTab?.id?.replace(group + "-page-tab-", "") ?? "";
      const activePanel = activeTab ? document.getElementById(activeTab.getAttribute("aria-controls") ?? "") : null;
      const zonePanel = document.getElementById("workspace-panel-" + group);
      const rendered = (element) => {
        if (!(element instanceof HTMLElement)) return false;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      const visiblePanels = panels.filter((panel) => !panel.hidden && rendered(panel));
      const inactivePanels = panels.filter((panel) => panel !== activePanel);
      const focusableSelector = 'a[href], button, input, select, textarea, [tabindex]';
      const inactiveFocusableControlCount = inactivePanels.reduce(
        (count, panel) =>
          count +
          Array.from(panel.querySelectorAll(focusableSelector)).filter(
            (control) => !control.disabled && control.tabIndex >= 0 && rendered(control)
          ).length,
        0
      );
      const ariaConnectionsReady =
        tabs.length === pageIds.length &&
        panels.length === pageIds.length &&
        tabs.every((tab) => {
          const controlled = document.getElementById(tab.getAttribute("aria-controls") ?? "");
          return Boolean(
            controlled &&
            controlled.getAttribute("role") === "tabpanel" &&
            controlled.getAttribute("aria-labelledby") === tab.id
          );
        });
      const activeRect = activePanel?.getBoundingClientRect() ?? null;
      const zoneRect = zonePanel?.getBoundingClientRect() ?? null;
      return {
        activePage,
        activePanelHorizontalOverflow: activePanel
          ? Math.max(0, activePanel.scrollWidth - activePanel.clientWidth)
          : -1,
        activePanelWidth: activeRect?.width ?? 0,
        ariaConnectionsReady,
        fullWidthReady: Boolean(
          activeRect &&
          zoneRect &&
          activeRect.width > 0 &&
          zoneRect.width > 0 &&
          activeRect.width >= zoneRect.width * 0.9
        ),
        inactiveFocusableControlCount,
        inactiveHiddenPanelCount: inactivePanels.filter((panel) => panel.hidden).length,
        inactiveZeroRectPanelCount: inactivePanels.filter((panel) => {
          const rect = panel.getBoundingClientRect();
          return rect.width === 0 && rect.height === 0 && panel.getClientRects().length === 0;
        }).length,
        selectedTabCount: selectedTabs.length,
        tabCount: tabs.length,
        tabListHorizontalOverflow: tabList ? Math.max(0, tabList.scrollWidth - tabList.clientWidth) : -1,
        tabPanelCount: panels.length,
        tabStopCount: tabStops.length,
        visiblePanelCount: visiblePanels.length,
        zonePanelWidth: zoneRect?.width ?? 0
      };
    })();
  `)) as LaunchSmokeWorkspacePageStateEvidence;
}

async function activateLaunchSmokeWorkspacePage(
  win: BrowserWindow,
  group: LaunchSmokeWorkspacePageGroup,
  page: LaunchSmokeWorkspacePageId
): Promise<LaunchSmokeWorkspacePageStateEvidence> {
  const outerZone = (await win.webContents.executeJavaScript(
    `document.querySelector('[role="tablist"][aria-label="Workstation function tabs"] [role="tab"][aria-selected="true"]')?.id?.replace("workspace-tab-", "") ?? ""`
  )) as string;
  if (outerZone !== group) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, `workflow-jump-${group}`);
  }
  let state = await readLaunchSmokeWorkspacePageState(win, group);
  if (state.activePage !== page) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, `${group}-page-tab-${page}`);
  }
  const deadline = Date.now() + 30000;
  state = await readLaunchSmokeWorkspacePageState(win, group);
  while (
    Date.now() < deadline &&
    !(
      state.activePage === page &&
      state.selectedTabCount === 1 &&
      state.tabStopCount === 1 &&
      state.visiblePanelCount === 1
    )
  ) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    state = await readLaunchSmokeWorkspacePageState(win, group);
  }
  if (
    state.activePage !== page ||
    state.selectedTabCount !== 1 ||
    state.tabStopCount !== 1 ||
    state.visiblePanelCount !== 1
  ) {
    throw new Error(`Workspace ${group}/${page} page did not settle: ${JSON.stringify(state)}`);
  }
  return state;
}

async function collectLaunchSmokeStickyNavigatorAfterDeepScroll(
  win: BrowserWindow,
  zone: Exclude<LaunchSmokeFunctionalTabZone, "compose">
): Promise<LaunchSmokeStickyNavigatorEvidence> {
  await win.webContents.executeJavaScript(`
    (() => {
      const scrollingElement = document.scrollingElement ?? document.documentElement;
      const maximumScrollY = Math.max(0, scrollingElement.scrollHeight - window.innerHeight);
      window.scrollTo({ behavior: "auto", left: 0, top: maximumScrollY });
    })();
  `);
  await new Promise((resolve) => setTimeout(resolve, 180));
  return (await win.webContents.executeJavaScript(`
    (() => {
      const expectedZone = ${JSON.stringify(zone)};
      const navigator = document.querySelector('[data-testid="workflow-navigator"]');
      const tabList = navigator?.querySelector('[role="tablist"]') ?? null;
      const activeTab = navigator?.querySelector('[role="tab"][aria-selected="true"]') ?? null;
      const scrollingElement = document.scrollingElement ?? document.documentElement;
      const maximumScrollY = Math.max(0, scrollingElement.scrollHeight - window.innerHeight);
      const navigatorRect = navigator?.getBoundingClientRect() ?? null;
      const tabListRect = tabList?.getBoundingClientRect() ?? null;
      const activeTabRect = activeTab?.getBoundingClientRect() ?? null;
      const navigatorStyle = navigator ? getComputedStyle(navigator) : null;
      const configuredTop = Number.parseFloat(navigatorStyle?.top ?? "NaN");
      const fullyVisible = (rect) => Boolean(
        rect &&
        rect.width > 0 &&
        rect.height > 0 &&
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight + 1 &&
        rect.right <= window.innerWidth + 1
      );
      return {
        activeTabFullyVisible: fullyVisible(activeTabRect),
        activeZone: activeTab?.id?.replace("workspace-tab-", "") ?? "",
        configuredTop,
        deepScrollReached: maximumScrollY >= 240 && window.scrollY >= maximumScrollY - 1,
        documentScrollable: maximumScrollY > 0,
        maximumScrollY,
        navigatorFullyVisible: fullyVisible(navigatorRect),
        navigatorPosition: navigatorStyle?.position ?? "",
        navigatorTop: navigatorRect?.top ?? -1,
        scrollY: window.scrollY,
        stickyTopAligned: Boolean(
          navigatorRect &&
          Number.isFinite(configuredTop) &&
          Math.abs(navigatorRect.top - configuredTop) <= 1.5
        ),
        tabListFullyVisible: fullyVisible(tabListRect),
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth
      };
    })();
  `)) as LaunchSmokeStickyNavigatorEvidence;
}

async function captureLaunchSmokeFunctionalTab(
  win: BrowserWindow,
  zone: LaunchSmokeFunctionalTabZone,
  evidenceDirectory: string
): Promise<LaunchSmokeFunctionalTabCaptureEvidence> {
  await waitForLaunchSmokePaint();
  const screenshot = await win.webContents.capturePage();
  const png = screenshot.toPNG();
  const bitmap = screenshot.toBitmap();
  const { height, width } = screenshot.getSize();
  const totalPixels = Math.floor(bitmap.byteLength / 4);
  const stride = Math.max(1, Math.floor(totalPixels / Math.max(1, Math.min(12000, totalPixels))));
  const base0 = bitmap[0] ?? 0;
  const base1 = bitmap[1] ?? 0;
  const base2 = bitmap[2] ?? 0;
  let nonBackgroundSamples = 0;
  let sampledPixels = 0;
  for (let pixel = 0; pixel < totalPixels; pixel += stride) {
    const offset = pixel * 4;
    const delta =
      Math.abs((bitmap[offset] ?? 0) - base0) +
      Math.abs((bitmap[offset + 1] ?? 0) - base1) +
      Math.abs((bitmap[offset + 2] ?? 0) - base2);
    sampledPixels += 1;
    if (delta > 24) {
      nonBackgroundSamples += 1;
    }
  }
  const artifact = `build/desktop/functional-tabs-launch-smoke/${zone}.png`;
  await writeFile(path.join(evidenceDirectory, `${zone}.png`), png, { mode: 0o600 });
  return {
    artifact,
    bitmapBytes: bitmap.byteLength,
    height,
    nonBackgroundSamples,
    pixelDigest: createHash("sha256").update(bitmap).digest("hex"),
    pngBytes: png.byteLength,
    pngDigest: createHash("sha256").update(png).digest("hex"),
    sampledPixels,
    width
  };
}

async function restoreLaunchSmokeFunctionalTabPosture(
  win: BrowserWindow,
  initial: LaunchSmokeFunctionalTabInternalSnapshot
): Promise<void> {
  const composePage = (
    ["drums", "notes", "instruments"].includes(initial.activeComposePage)
      ? initial.activeComposePage
      : "drums"
  ) as LaunchSmokeComposeWorkspacePage;
  const mixPage = (["mixer", "master"].includes(initial.activeMixPage)
    ? initial.activeMixPage
    : "mixer") as LaunchSmokeMixWorkspacePage;
  await activateLaunchSmokeWorkspacePage(win, "mix", mixPage);
  await activateLaunchSmokeWorkspacePage(win, "compose", "drums");
  const selectedPattern = (await win.webContents.executeJavaScript(
    `document.querySelector('[data-testid^="pattern-tab-"][aria-selected="true"]')?.getAttribute("data-testid")?.replace("pattern-tab-", "") ?? ""`
  )) as string;
  if (selectedPattern !== initial.selectedPattern) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, `pattern-tab-${initial.selectedPattern}`);
  }

  const expectedKeyboardCapture = JSON.parse(initial.keyboardCapturePosture) as { pressed?: string };
  await activateLaunchSmokeWorkspacePage(win, "compose", "notes");
  const keyboardCapturePressed = (await win.webContents.executeJavaScript(
    `document.querySelector('[data-testid="keyboard-capture-toggle"]')?.getAttribute("aria-pressed") ?? "missing"`
  )) as string;
  if (keyboardCapturePressed !== expectedKeyboardCapture.pressed) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "keyboard-capture-toggle");
  }

  const disclosurePageAndToggle: Record<
    string,
    { page: LaunchSmokeComposeWorkspacePage; toggle: string }
  > = {
    "pattern-lab": { page: "drums", toggle: "pattern-lab-toggle" },
    "capture-ideas": { page: "notes", toggle: "capture-ideas-toggle" },
    "harmony-moves": { page: "instruments", toggle: "harmony-moves-toggle" },
    "sound-design-tools": { page: "instruments", toggle: "sound-design-toggle" }
  };
  const disclosures = JSON.parse(initial.disclosurePosture) as Array<{ open: boolean; testId: string }>;
  for (const disclosure of disclosures) {
    const target = disclosurePageAndToggle[disclosure.testId];
    if (!target) continue;
    await activateLaunchSmokeWorkspacePage(win, "compose", target.page);
    const isOpen = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid=${JSON.stringify(disclosure.testId)}]')?.open === true`
    )) as boolean;
    if (isOpen !== disclosure.open) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, target.toggle);
    }
  }

  await activateLaunchSmokeWorkspacePage(win, "compose", composePage);
  await win.webContents.executeJavaScript(
    `document.querySelector('[data-testid="workflow-jump-compose"]')?.focus({ preventScroll: true })`
  );
  await new Promise((resolve) => setTimeout(resolve, 140));
}

async function collectLaunchSmokeFunctionalTabsEvidence(
  win: BrowserWindow,
  onStep: (step: string) => void = () => {}
): Promise<LaunchSmokeFunctionalTabsEvidence> {
  const originalSize = win.getSize();
  const evidenceDirectory = functionalTabsLaunchSmokeEvidenceDirectory();
  let initial: LaunchSmokeFunctionalTabInternalSnapshot | null = null;
  let cleanupComplete = false;
  win.setSize(1180, 800);
  await new Promise((resolve) => setTimeout(resolve, 220));
  try {
    onStep("reading initial Compose tab contract");
    initial = await readLaunchSmokeFunctionalTabState(win);
    if (initial.activeZone !== "compose") {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-compose");
    }
    const originalGuidanceCenterOpen = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="guidance-center"]')?.open === true`
    )) as boolean;
    await mkdir(evidenceDirectory, { recursive: true, mode: 0o700 });

    onStep("traversing full-width Compose editor pages with native input");
    const composeInitial = await readLaunchSmokeWorkspacePageState(win, "compose");
    if (composeInitial.activePage !== "drums") {
      await activateLaunchSmokeWorkspacePage(win, "compose", "drums");
    }
    const composeStates = {} as Record<LaunchSmokeComposeWorkspacePage, LaunchSmokeWorkspacePageStateEvidence>;
    const composeTraversal: Array<{ input: string; page: string }> = [{
      input: "initial",
      page: composeInitial.activePage
    }];
    composeStates.drums = await readLaunchSmokeWorkspacePageState(win, "compose");
    composeStates.notes = await activateLaunchSmokeWorkspacePage(win, "compose", "notes");
    composeTraversal.push({ input: "native-click", page: composeStates.notes.activePage });
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Right");
    composeStates.instruments = await readLaunchSmokeWorkspacePageState(win, "compose");
    composeTraversal.push({ input: "ArrowRight", page: composeStates.instruments.activePage });
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Home");
    let composePageState = await readLaunchSmokeWorkspacePageState(win, "compose");
    composeTraversal.push({ input: "Home", page: composePageState.activePage });
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Left");
    composePageState = await readLaunchSmokeWorkspacePageState(win, "compose");
    composeTraversal.push({ input: "ArrowLeft", page: composePageState.activePage });
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Right");
    composePageState = await readLaunchSmokeWorkspacePageState(win, "compose");
    composeTraversal.push({ input: "ArrowRight", page: composePageState.activePage });

    onStep("preparing Compose Pattern and disclosure posture");
    const preservedPattern = initial.selectedPattern === "B" ? "C" : "B";
    await clickLaunchSmokeFunctionalTabNativeTarget(win, `pattern-tab-${preservedPattern}`);
    const patternLabOpen = await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="pattern-lab"]')?.open === true`
    );
    if (!patternLabOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "pattern-lab-toggle");
    }
    await activateLaunchSmokeWorkspacePage(win, "compose", "notes");
    const captureIdeasOpen = await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="capture-ideas"]')?.open === true`
    );
    if (!captureIdeasOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "capture-ideas-toggle");
    }
    const keyboardCaptureEnabled = await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="keyboard-capture-toggle"]')?.getAttribute('aria-pressed') === 'true'`
    );
    if (!keyboardCaptureEnabled) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "keyboard-capture-toggle");
    }
    await activateLaunchSmokeWorkspacePage(win, "compose", "drums");
    onStep("selecting an existing Compose drum without mutating it");
    const selectedDrumPreparation = (await win.webContents.executeJavaScript(`
      (() => {
        const target = Array.from(document.querySelectorAll('button[data-testid^="drum-step-"]'))
          .find((button) => button.getAttribute("aria-pressed") === "true");
        if (!(target instanceof HTMLButtonElement)) return null;
        const match = target.getAttribute("data-testid")?.match(/^drum-step-(kick|snare|hat|perc)-(\\d+)$/);
        if (!match) return null;
        const targetStep = Number(match[2]);
        const sourceStep = targetStep === 0 ? 1 : targetStep - 1;
        const source = document.querySelector('[data-testid="drum-step-' + match[1] + '-' + sourceStep + '"]');
        if (!(source instanceof HTMLButtonElement)) return null;
        source.focus({ preventScroll: true });
        return {
          keyCode: targetStep === 0 ? "Left" : "Right",
          targetId: target.getAttribute("data-testid") ?? ""
        };
      })();
    `)) as { keyCode: string; targetId: string } | null;
    if (!selectedDrumPreparation) {
      throw new Error("Could not prepare an existing Compose drum selection for native-menu guarding.");
    }
    await sendLaunchSmokeFunctionalTabNativeKey(win, selectedDrumPreparation.keyCode);
    const selectedDrumReady = (await win.webContents.executeJavaScript(`
      document.activeElement?.getAttribute("data-testid") === ${JSON.stringify(selectedDrumPreparation.targetId)}
    `)) as boolean;
    if (!selectedDrumReady) {
      throw new Error(`Could not select ${selectedDrumPreparation.targetId} without mutating it.`);
    }
    const preparedCompose = await readLaunchSmokeFunctionalTabState(win);
    const states = {} as Record<LaunchSmokeFunctionalTabZone, LaunchSmokeFunctionalTabStateEvidence>;
    const captures = {} as Record<LaunchSmokeFunctionalTabZone, LaunchSmokeFunctionalTabCaptureEvidence>;
    const hiddenComposeGuards = {} as LaunchSmokeFunctionalTabsEvidence["hiddenComposeGuards"];
    const nativeMenuDeleteGuards = {} as Record<"mix" | "deliver", boolean>;
    let mixInitial = {} as LaunchSmokeWorkspacePageStateEvidence;
    const mixStates = {} as Record<LaunchSmokeMixWorkspacePage, LaunchSmokeWorkspacePageStateEvidence>;
    const mixTraversal: Array<{ input: string; page: string }> = [];
    const stickyNavigatorAfterDeepScroll = {} as Record<
      Exclude<LaunchSmokeFunctionalTabZone, "compose">,
      LaunchSmokeStickyNavigatorEvidence
    >;
    const traversal: Array<{ input: string; zone: string }> = [{ input: "initial", zone: initial.activeZone }];
    states.compose = publicFunctionalTabState(preparedCompose);
    captures.compose = await captureLaunchSmokeFunctionalTab(win, "compose", evidenceDirectory);

    const sendHiddenComposeGuardKeys = async (zone: Exclude<LaunchSmokeFunctionalTabZone, "compose">): Promise<void> => {
      const keyResults = {} as LaunchSmokeFunctionalTabsEvidence["hiddenComposeGuards"][typeof zone];
      for (const keyCode of ["1", "2", "3", "Delete", "A"] as const) {
        await sendLaunchSmokeFunctionalTabNativeKey(win, keyCode);
        const afterKey = await readLaunchSmokeFunctionalTabState(win);
        keyResults[keyCode] =
          afterKey.composeDataFingerprint === preparedCompose.composeDataFingerprint &&
          afterKey.selectedPattern === preparedCompose.selectedPattern;
      }
      const afterKeys = await readLaunchSmokeFunctionalTabState(win);
      hiddenComposeGuards[zone] = keyResults;
      states[zone] = publicFunctionalTabState(afterKeys);
    };

    onStep("native clicking Arrange and guarding hidden Compose shortcuts");
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-arrange");
    let current = await readLaunchSmokeFunctionalTabState(win);
    traversal.push({ input: "native-click", zone: current.activeZone });
    await sendHiddenComposeGuardKeys("arrange");
    onStep("deep scrolling Arrange while keeping the functional tablist visible");
    stickyNavigatorAfterDeepScroll.arrange = await collectLaunchSmokeStickyNavigatorAfterDeepScroll(win, "arrange");
    captures.arrange = await captureLaunchSmokeFunctionalTab(win, "arrange", evidenceDirectory);

    onStep("using ArrowRight for Mix and guarding hidden Compose shortcuts");
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Right");
    current = await readLaunchSmokeFunctionalTabState(win);
    traversal.push({ input: "ArrowRight", zone: current.activeZone });
    onStep("traversing full-width Mix editor pages with native input");
    mixInitial = await readLaunchSmokeWorkspacePageState(win, "mix");
    if (mixInitial.activePage !== "mixer") {
      await activateLaunchSmokeWorkspacePage(win, "mix", "mixer");
    }
    mixTraversal.push({ input: "initial", page: mixInitial.activePage });
    mixStates.mixer = await readLaunchSmokeWorkspacePageState(win, "mix");
    mixStates.master = await activateLaunchSmokeWorkspacePage(win, "mix", "master");
    mixTraversal.push({ input: "native-click", page: mixStates.master.activePage });
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Left");
    let mixPageState = await readLaunchSmokeWorkspacePageState(win, "mix");
    mixTraversal.push({ input: "ArrowLeft", page: mixPageState.activePage });
    await sendLaunchSmokeFunctionalTabNativeKey(win, "End");
    mixPageState = await readLaunchSmokeWorkspacePageState(win, "mix");
    mixTraversal.push({ input: "End", page: mixPageState.activePage });
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Home");
    mixPageState = await readLaunchSmokeWorkspacePageState(win, "mix");
    mixTraversal.push({ input: "Home", page: mixPageState.activePage });
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Right");
    mixPageState = await readLaunchSmokeWorkspacePageState(win, "mix");
    mixTraversal.push({ input: "ArrowRight", page: mixPageState.activePage });
    await sendHiddenComposeGuardKeys("mix");
    onStep("activating native Delete Selected Event menu command from Mix");
    activateNativeMenuCommandForSmoke(win, "delete-selected-event");
    await new Promise((resolve) => setTimeout(resolve, 140));
    nativeMenuDeleteGuards.mix =
      (await readLaunchSmokeFunctionalTabState(win)).composeDataFingerprint === preparedCompose.composeDataFingerprint;
    onStep("deep scrolling Mix while keeping the functional tablist visible");
    stickyNavigatorAfterDeepScroll.mix = await collectLaunchSmokeStickyNavigatorAfterDeepScroll(win, "mix");
    captures.mix = await captureLaunchSmokeFunctionalTab(win, "mix", evidenceDirectory);
    await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="workflow-jump-mix"]')?.focus({ preventScroll: true })`
    );

    onStep("using End for Deliver and guarding hidden Compose shortcuts");
    await sendLaunchSmokeFunctionalTabNativeKey(win, "End");
    current = await readLaunchSmokeFunctionalTabState(win);
    traversal.push({ input: "End", zone: current.activeZone });
    await sendHiddenComposeGuardKeys("deliver");
    onStep("activating native Delete Selected Event menu command from Deliver");
    activateNativeMenuCommandForSmoke(win, "delete-selected-event");
    await new Promise((resolve) => setTimeout(resolve, 140));
    nativeMenuDeleteGuards.deliver =
      (await readLaunchSmokeFunctionalTabState(win)).composeDataFingerprint === preparedCompose.composeDataFingerprint;
    onStep("deep scrolling Deliver while keeping the functional tablist visible");
    stickyNavigatorAfterDeepScroll.deliver = await collectLaunchSmokeStickyNavigatorAfterDeepScroll(win, "deliver");
    captures.deliver = await captureLaunchSmokeFunctionalTab(win, "deliver", evidenceDirectory);

    onStep("using Home and wrapped arrows to return to Compose");
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Home");
    current = await readLaunchSmokeFunctionalTabState(win);
    traversal.push({ input: "Home", zone: current.activeZone });
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Left");
    current = await readLaunchSmokeFunctionalTabState(win);
    traversal.push({ input: "ArrowLeft", zone: current.activeZone });
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Right");
    const returnedCompose = await readLaunchSmokeFunctionalTabState(win);
    traversal.push({ input: "ArrowRight", zone: returnedCompose.activeZone });

    onStep("transferring visible focus from a Mix Finish Checklist action to Compose");
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-mix");
    const mixPagePreservedAcrossOuterTabs =
      (await readLaunchSmokeWorkspacePageState(win, "mix")).activePage === mixPageState.activePage;
    await activateLaunchSmokeWorkspacePage(win, "mix", "master");
    const masterReviewWasOpen = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="master-review-tools"]')?.open === true`
    )) as boolean;
    const masterReviewQueueWasOpen = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="master-review-queue-tools"]')?.open === true`
    )) as boolean;
    if (!masterReviewWasOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "master-review-toggle");
    }
    const focusTriggerTestId = "finish-checklist-focus-compose";
    await clickLaunchSmokeFunctionalTabNativeTarget(win, focusTriggerTestId);
    const crossTabFocusTransfer = (await win.webContents.executeJavaScript(`
      (() => {
        const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
        const activePanel = activeTab
          ? document.getElementById(activeTab.getAttribute("aria-controls") ?? "")
          : null;
        const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const activeRect = activeElement?.getBoundingClientRect();
        const activeStyle = activeElement ? getComputedStyle(activeElement) : null;
        return {
          activeElementInViewport: Boolean(
            activeRect &&
              activeRect.left < window.innerWidth &&
              activeRect.right > 0 &&
              activeRect.top < window.innerHeight &&
              activeRect.bottom > 0
          ),
          activeElementTestId: activeElement?.getAttribute("data-testid") ?? activeElement?.id ?? "",
          activeElementVisible: Boolean(
            activeRect &&
              activeRect.width > 0 &&
              activeRect.height > 0 &&
              activeStyle?.display !== "none" &&
              activeStyle?.visibility !== "hidden"
          ),
          activeElementWithinActivePanel: Boolean(activeElement && activePanel?.contains(activeElement)),
          destinationZone: activeTab?.id?.replace("workspace-tab-", "") ?? "",
          sourcePanelHidden: document.getElementById("workspace-panel-mix")?.hidden === true,
          sourceZone: "mix",
          triggerTestId: ${JSON.stringify(focusTriggerTestId)}
        };
      })();
    `)) as LaunchSmokeFunctionalTabsEvidence["crossTabFocusTransfer"];
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-mix");
    await activateLaunchSmokeWorkspacePage(win, "mix", "master");
    if (!masterReviewWasOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "master-review-toggle");
    }

    onStep("running Finish Checklist Route Quick Action from Deliver");
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-deliver");
    activateNativeMenuCommandForSmoke(win, "quick-actions");
    await new Promise((resolve) => setTimeout(resolve, 220));
    await win.webContents.executeJavaScript(`
      (() => {
        const input = document.querySelector('[data-testid="quick-actions-search"]');
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        valueSetter?.call(input, "review finish checklist route");
        input?.dispatchEvent(new Event("input", { bubbles: true }));
      })();
    `);
    let finishChecklistActionVisible = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      finishChecklistActionVisible = (await win.webContents.executeJavaScript(`
        (() => {
          const target = document.querySelector('[data-testid="quick-action-finish-checklist-route-readout-action"]');
          return Boolean(target);
        })();
      `)) as boolean;
      if (finishChecklistActionVisible) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!finishChecklistActionVisible) {
      throw new Error("Finish Checklist Route Quick Action did not become visible from Deliver.");
    }
    const finishChecklistSearchFocused = (await win.webContents.executeJavaScript(`
      (() => {
        const input = document.querySelector('[data-testid="quick-actions-search"]');
        input?.focus();
        return document.activeElement === input;
      })();
    `)) as boolean;
    if (!finishChecklistSearchFocused) {
      throw new Error("Could not focus the live Quick Actions search before native Enter.");
    }
    const finishChecklistTargetIndex = (await win.webContents.executeJavaScript(`
      (() => {
        const ids = Array.from(document.querySelectorAll('.quick-action-row'))
          .filter((row) => {
            const button = row.querySelector('.quick-action-run');
            return button instanceof HTMLButtonElement && !button.disabled;
          })
          .map((row) => row.id.replace('quick-action-option-', ''));
        return ids.indexOf('finish-checklist-route-readout-action');
      })();
    `)) as number;
    if (finishChecklistTargetIndex < 0) {
      throw new Error("Finish Checklist Route Quick Action was not in the runnable keyboard result list.");
    }
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Home");
    for (let index = 0; index < finishChecklistTargetIndex; index += 1) {
      await sendLaunchSmokeFunctionalTabNativeKey(win, "Down");
    }
    const finishChecklistActionSelected = (await win.webContents.executeJavaScript(`
      document.querySelector('[data-testid="quick-actions-keyboard-selection"]')?.getAttribute("data-keyboard-action") ===
        "finish-checklist-route-readout-action"
    `)) as boolean;
    if (!finishChecklistActionSelected) {
      throw new Error("Native Home/ArrowDown did not select the Finish Checklist Route Quick Action.");
    }
    win.webContents.sendInputEvent({ type: "keyDown", keyCode: "Enter" });
    win.webContents.sendInputEvent({ type: "keyUp", keyCode: "Enter" });
    await new Promise((resolve) => setTimeout(resolve, 140));
    let finishChecklistQuickActionSettled = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      finishChecklistQuickActionSettled = (await win.webContents.executeJavaScript(`
        (() => {
          const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
          return (
            document.querySelector('[data-testid="quick-actions"]') === null &&
            activeTab?.id === "workspace-tab-mix" &&
            document.querySelector('[data-testid="master-review-tools"]')?.open === true
          );
        })();
      `)) as boolean;
      if (finishChecklistQuickActionSettled) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!finishChecklistQuickActionSettled) {
      throw new Error("Native Enter did not settle the Finish Checklist Route Quick Action on the Mix checklist.");
    }
    const finishChecklistQuickActionReveal = (await win.webContents.executeJavaScript(`
      (() => {
        const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
        const activePanel = activeTab ? document.getElementById(activeTab.getAttribute('aria-controls') ?? '') : null;
        const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const activeElementRect = activeElement?.getBoundingClientRect() ?? null;
        const activeElementStyle = activeElement ? getComputedStyle(activeElement) : null;
        const navigator = document.querySelector('[data-testid="workflow-navigator"]');
        const checklist = document.querySelector('[data-testid="finish-checklist"]');
        const navigatorRect = navigator?.getBoundingClientRect() ?? null;
        const rect = checklist?.getBoundingClientRect();
        const style = checklist instanceof HTMLElement ? getComputedStyle(checklist) : null;
        const visibleHeight = rect
          ? Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0))
          : 0;
        return {
          activeElementTestId: activeElement?.getAttribute('data-testid') ?? activeElement?.id ?? '',
          activeElementVisible: Boolean(
            activeElementRect &&
              activeElementRect.width > 0 &&
              activeElementRect.height > 0 &&
              activeElementStyle?.display !== 'none' &&
              activeElementStyle?.visibility !== 'hidden'
          ),
          activeElementWithinActivePanel: Boolean(activeElement && activePanel?.contains(activeElement)),
          actionVisible: ${JSON.stringify(true)},
          destinationZone: activeTab?.id?.replace("workspace-tab-", "") ?? "",
          finishChecklistClearOfNavigator: Boolean(rect && navigatorRect && rect.top >= navigatorRect.bottom - 1),
          finishChecklistHeight: rect?.height ?? 0,
          finishChecklistInViewport: Boolean(rect && rect.top >= 0 && rect.top < window.innerHeight && rect.bottom > 0),
          finishChecklistVisible: Boolean(
            rect &&
              rect.width > 0 &&
              rect.height > 0 &&
              style?.display !== "none" &&
              style?.visibility !== "hidden"
          ),
          finishChecklistWidth: rect?.width ?? 0,
          masterReviewOpen: document.querySelector('[data-testid="master-review-tools"]')?.open === true,
          modalClosed: document.querySelector('[data-testid="quick-actions"]') === null,
          sourceZone: "deliver",
          viewportHeight: window.innerHeight,
          visibleHeight
        };
      })();
    `)) as Omit<LaunchSmokeFunctionalTabsEvidence["finishChecklistQuickActionReveal"], "projectFingerprintPreserved">;
    const afterFinishChecklistQuickAction = await readLaunchSmokeFunctionalTabState(win);
    const finishChecklistQuickActionEvidence: LaunchSmokeFunctionalTabsEvidence["finishChecklistQuickActionReveal"] = {
      ...finishChecklistQuickActionReveal,
      projectFingerprintPreserved:
        afterFinishChecklistQuickAction.composeDataFingerprint === preparedCompose.composeDataFingerprint
    };

    onStep("closing both Mix Review Queue disclosures before native Quick Actions routing");
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-mix");
    await activateLaunchSmokeWorkspacePage(win, "mix", "master");
    const reviewQueueWasOpenBeforeClose = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="master-review-queue-tools"]')?.open === true`
    )) as boolean;
    if (reviewQueueWasOpenBeforeClose) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "master-review-queue-toggle");
    }
    const reviewWasOpenBeforeClose = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="master-review-tools"]')?.open === true`
    )) as boolean;
    if (reviewWasOpenBeforeClose) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "master-review-toggle");
    }
    const reviewQueueClosedPosture = (await win.webContents.executeJavaScript(`
      (() => ({
        activeZone: document.querySelector('[role="tab"][aria-selected="true"]')?.id?.replace('workspace-tab-', '') ?? '',
        masterReviewClosed: document.querySelector('[data-testid="master-review-tools"]')?.open === false,
        masterReviewQueueClosed: document.querySelector('[data-testid="master-review-queue-tools"]')?.open === false
      }))();
    `)) as { activeZone: string; masterReviewClosed: boolean; masterReviewQueueClosed: boolean };
    if (
      reviewQueueClosedPosture.activeZone !== "mix" ||
      !reviewQueueClosedPosture.masterReviewClosed ||
      !reviewQueueClosedPosture.masterReviewQueueClosed
    ) {
      throw new Error(
        `Could not prepare the closed same-Mix Review Queue route posture (${JSON.stringify(reviewQueueClosedPosture)}).`
      );
    }

    onStep("opening Quick Actions with the native shortcut from closed same-Mix Review Queue disclosures");
    const commandModifier: Electron.InputEvent["modifiers"] = process.platform === "darwin" ? ["meta"] : ["control"];
    await sendLaunchSmokeFunctionalTabNativeKey(win, "K", commandModifier);
    let reviewQueueNativeShortcutOpened = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      reviewQueueNativeShortcutOpened = (await win.webContents.executeJavaScript(`
        document.querySelector('[data-testid="quick-actions"]') !== null &&
          document.activeElement?.getAttribute('data-testid') === 'quick-actions-search'
      `)) as boolean;
      if (reviewQueueNativeShortcutOpened) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!reviewQueueNativeShortcutOpened) {
      throw new Error("Native Quick Actions shortcut did not focus the search from the closed same-Mix route posture.");
    }

    await win.webContents.insertText("review queue route");
    let reviewQueueActionVisible = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      reviewQueueActionVisible = (await win.webContents.executeJavaScript(`
        document.querySelector('[data-testid="quick-actions-search"]')?.value === 'review queue route' &&
          document.querySelector('[data-testid="quick-action-review-queue-route-readout-action"]') !== null
      `)) as boolean;
      if (reviewQueueActionVisible) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!reviewQueueActionVisible) {
      throw new Error("Review Queue Route Quick Action did not become visible after native text entry.");
    }

    const reviewQueueTargetIndex = (await win.webContents.executeJavaScript(`
      (() => {
        const ids = Array.from(document.querySelectorAll('.quick-action-row'))
          .filter((row) => {
            const button = row.querySelector('.quick-action-run');
            return button instanceof HTMLButtonElement && !button.disabled;
          })
          .map((row) => row.id.replace('quick-action-option-', ''));
        return ids.indexOf('review-queue-route-readout-action');
      })();
    `)) as number;
    if (reviewQueueTargetIndex < 0) {
      throw new Error("Review Queue Route Quick Action was not in the runnable keyboard result list.");
    }
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Home");
    for (let index = 0; index < reviewQueueTargetIndex; index += 1) {
      await sendLaunchSmokeFunctionalTabNativeKey(win, "Down");
    }
    const reviewQueueSelectedActionId = (await win.webContents.executeJavaScript(`
      document.querySelector('[data-testid="quick-actions-keyboard-selection"]')?.getAttribute('data-keyboard-action') ?? ''
    `)) as string;
    if (reviewQueueSelectedActionId !== "review-queue-route-readout-action") {
      throw new Error(
        `Native Home/ArrowDown selected ${reviewQueueSelectedActionId || "no action"} instead of Review Queue Route.`
      );
    }

    onStep("running the selected Review Queue Route action with native Enter");
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Enter");
    let reviewQueueQuickActionSettled = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      reviewQueueQuickActionSettled = (await win.webContents.executeJavaScript(`
        (() => {
          const queue = document.querySelector('[data-testid="review-queue"]');
          const rect = queue?.getBoundingClientRect();
          return (
            document.querySelector('[data-testid="quick-actions"]') === null &&
            document.querySelector('[role="tab"][aria-selected="true"]')?.id === 'workspace-tab-mix' &&
            document.querySelector('[data-testid="master-review-tools"]')?.open === true &&
            document.querySelector('[data-testid="master-review-queue-tools"]')?.open === true &&
            Boolean(rect && rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0)
          );
        })();
      `)) as boolean;
      if (reviewQueueQuickActionSettled) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!reviewQueueQuickActionSettled) {
      throw new Error("Native Enter did not reveal the closed Review Queue disclosures in the active Mix viewport.");
    }

    const reviewQueueQuickActionReveal = (await win.webContents.executeJavaScript(`
      (() => {
        const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
        const activePanel = activeTab ? document.getElementById(activeTab.getAttribute('aria-controls') ?? '') : null;
        const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const activeElementRect = activeElement?.getBoundingClientRect() ?? null;
        const activeElementStyle = activeElement ? getComputedStyle(activeElement) : null;
        const navigator = document.querySelector('[data-testid="workflow-navigator"]');
        const queue = document.querySelector('[data-testid="review-queue"]');
        const navigatorRect = navigator?.getBoundingClientRect() ?? null;
        const rect = queue?.getBoundingClientRect() ?? null;
        const style = queue instanceof HTMLElement ? getComputedStyle(queue) : null;
        const visibleHeight = rect
          ? Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0))
          : 0;
        return {
          activeElementTestId: activeElement?.getAttribute('data-testid') ?? activeElement?.id ?? '',
          activeElementVisible: Boolean(
            activeElementRect &&
              activeElementRect.width > 0 &&
              activeElementRect.height > 0 &&
              activeElementStyle?.display !== 'none' &&
              activeElementStyle?.visibility !== 'hidden'
          ),
          activeElementWithinActivePanel: Boolean(activeElement && activePanel?.contains(activeElement)),
          actionVisible: ${JSON.stringify(true)},
          destinationZone: activeTab?.id?.replace('workspace-tab-', '') ?? '',
          masterReviewInitiallyClosed: ${JSON.stringify(reviewQueueClosedPosture.masterReviewClosed)},
          masterReviewOpen: document.querySelector('[data-testid="master-review-tools"]')?.open === true,
          masterReviewQueueInitiallyClosed: ${JSON.stringify(reviewQueueClosedPosture.masterReviewQueueClosed)},
          masterReviewQueueOpen: document.querySelector('[data-testid="master-review-queue-tools"]')?.open === true,
          modalClosed: document.querySelector('[data-testid="quick-actions"]') === null,
          nativeShortcutOpened: ${JSON.stringify(reviewQueueNativeShortcutOpened)},
          reviewQueueClearOfNavigator: Boolean(rect && navigatorRect && rect.top >= navigatorRect.bottom - 1),
          reviewQueueHeight: rect?.height ?? 0,
          reviewQueueInViewport: Boolean(rect && rect.top >= 0 && rect.top < window.innerHeight && rect.bottom > 0),
          reviewQueueVisible: Boolean(
            queue &&
              activePanel?.contains(queue) &&
              rect &&
              rect.width > 0 &&
              rect.height > 0 &&
              style?.display !== 'none' &&
              style?.visibility !== 'hidden'
          ),
          reviewQueueWidth: rect?.width ?? 0,
          selectedActionId: ${JSON.stringify(reviewQueueSelectedActionId)},
          sourceZone: 'mix',
          statusText: document.querySelector('[data-testid="project-status"]')?.textContent?.trim() ?? '',
          viewportHeight: window.innerHeight,
          visibleHeight
        };
      })();
    `)) as Omit<
      LaunchSmokeFunctionalTabsEvidence["reviewQueueQuickActionReveal"],
      "disclosurePostureRestored" | "projectFingerprintPreserved"
    >;
    const afterReviewQueueQuickAction = await readLaunchSmokeFunctionalTabState(win);
    const reviewQueueQuickActionEvidence: LaunchSmokeFunctionalTabsEvidence["reviewQueueQuickActionReveal"] = {
      ...reviewQueueQuickActionReveal,
      disclosurePostureRestored: false,
      projectFingerprintPreserved:
        afterReviewQueueQuickAction.composeDataFingerprint === preparedCompose.composeDataFingerprint
    };

    await win.webContents.executeJavaScript(`
      (() => {
        const guidance = document.querySelector('[data-testid="guidance-center"]');
        if (guidance instanceof HTMLDetailsElement && guidance.open) {
          guidance.querySelector(':scope > summary')?.click();
        }
      })();
    `);
    await new Promise((resolve) => setTimeout(resolve, 140));
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-mix");
    await activateLaunchSmokeWorkspacePage(win, "mix", "master");
    const masterReviewQueueIsOpen = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="master-review-queue-tools"]')?.open === true`
    )) as boolean;
    if (masterReviewQueueIsOpen !== masterReviewQueueWasOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "master-review-queue-toggle");
    }
    const masterReviewIsOpen = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="master-review-tools"]')?.open === true`
    )) as boolean;
    if (masterReviewIsOpen !== masterReviewWasOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "master-review-toggle");
    }
    reviewQueueQuickActionEvidence.disclosurePostureRestored = (await win.webContents.executeJavaScript(`
      document.querySelector('[data-testid="master-review-tools"]')?.open === ${JSON.stringify(masterReviewWasOpen)} &&
        document.querySelector('[data-testid="master-review-queue-tools"]')?.open === ${JSON.stringify(masterReviewQueueWasOpen)}
    `)) as boolean;
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-compose");

    onStep("preparing closed Guide and Compose for native Beat Passport Quick Actions routing");
    const guidanceCenterOpenBeforePreparation = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="guidance-center"]')?.open === true`
    )) as boolean;
    if (guidanceCenterOpenBeforePreparation) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
    }
    const guidanceBeatPassportClosedPosture = (await win.webContents.executeJavaScript(`
      (() => ({
        activeZone: document.querySelector('[role="tab"][aria-selected="true"]')?.id?.replace('workspace-tab-', '') ?? '',
        guidanceCenterClosed: document.querySelector('[data-testid="guidance-center"]')?.open === false
      }))();
    `)) as { activeZone: string; guidanceCenterClosed: boolean };
    if (
      guidanceBeatPassportClosedPosture.activeZone !== "compose" ||
      !guidanceBeatPassportClosedPosture.guidanceCenterClosed
    ) {
      throw new Error(
        `Could not prepare the closed Guide Beat Passport route posture (${JSON.stringify(guidanceBeatPassportClosedPosture)}).`
      );
    }

    onStep("opening Quick Actions with the native shortcut from closed Guide on Compose");
    await sendLaunchSmokeFunctionalTabNativeKey(win, "K", commandModifier);
    let guidanceBeatPassportNativeShortcutOpened = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      guidanceBeatPassportNativeShortcutOpened = (await win.webContents.executeJavaScript(`
        document.querySelector('[data-testid="quick-actions"]') !== null &&
          document.activeElement?.getAttribute('data-testid') === 'quick-actions-search'
      `)) as boolean;
      if (guidanceBeatPassportNativeShortcutOpened) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!guidanceBeatPassportNativeShortcutOpened) {
      throw new Error("Native Quick Actions shortcut did not focus search from the closed Guide Compose posture.");
    }

    await win.webContents.insertText("beat passport route");
    let guidanceBeatPassportActionVisible = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      guidanceBeatPassportActionVisible = (await win.webContents.executeJavaScript(`
        document.querySelector('[data-testid="quick-actions-search"]')?.value === 'beat passport route' &&
          document.querySelector('[data-testid="quick-action-beat-passport-route-readout-action"]') !== null
      `)) as boolean;
      if (guidanceBeatPassportActionVisible) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!guidanceBeatPassportActionVisible) {
      throw new Error("Beat Passport Route Quick Action did not become visible after native text entry.");
    }

    const guidanceBeatPassportTargetIndex = (await win.webContents.executeJavaScript(`
      (() => {
        const ids = Array.from(document.querySelectorAll('.quick-action-row'))
          .filter((row) => {
            const button = row.querySelector('.quick-action-run');
            return button instanceof HTMLButtonElement && !button.disabled;
          })
          .map((row) => row.id.replace('quick-action-option-', ''));
        return ids.indexOf('beat-passport-route-readout-action');
      })();
    `)) as number;
    if (guidanceBeatPassportTargetIndex < 0) {
      throw new Error("Beat Passport Route Quick Action was not in the runnable keyboard result list.");
    }
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Home");
    for (let index = 0; index < guidanceBeatPassportTargetIndex; index += 1) {
      await sendLaunchSmokeFunctionalTabNativeKey(win, "Down");
    }
    const guidanceBeatPassportSelectedActionId = (await win.webContents.executeJavaScript(`
      document.querySelector('[data-testid="quick-actions-keyboard-selection"]')?.getAttribute('data-keyboard-action') ?? ''
    `)) as string;
    if (guidanceBeatPassportSelectedActionId !== "beat-passport-route-readout-action") {
      throw new Error(
        `Native Home/ArrowDown selected ${guidanceBeatPassportSelectedActionId || "no action"} instead of Beat Passport Route.`
      );
    }

    onStep("running the selected Beat Passport Route action with native Enter");
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Enter");
    let guidanceBeatPassportQuickActionSettled = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      guidanceBeatPassportQuickActionSettled = (await win.webContents.executeJavaScript(`
        (() => {
          const passport = document.querySelector('[data-testid="beat-passport"]');
          const rect = passport?.getBoundingClientRect();
          return (
            document.querySelector('[data-testid="quick-actions"]') === null &&
            document.querySelector('[role="tab"][aria-selected="true"]')?.id === 'workspace-tab-compose' &&
            document.querySelector('[data-testid="guidance-center"]')?.open === true &&
            document.activeElement === passport &&
            Boolean(rect && rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0)
          );
        })();
      `)) as boolean;
      if (guidanceBeatPassportQuickActionSettled) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!guidanceBeatPassportQuickActionSettled) {
      throw new Error("Native Enter did not reveal and focus Beat Passport inside the Guide on Compose.");
    }

    const guidanceBeatPassportQuickActionReveal = (await win.webContents.executeJavaScript(`
      (() => {
        const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
        const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const activeElementRect = activeElement?.getBoundingClientRect() ?? null;
        const activeElementStyle = activeElement ? getComputedStyle(activeElement) : null;
        const guidance = document.querySelector('[data-testid="guidance-center"]');
        const navigator = document.querySelector('[data-testid="workflow-navigator"]');
        const passport = document.querySelector('[data-testid="beat-passport"]');
        const navigatorRect = navigator?.getBoundingClientRect() ?? null;
        const rect = passport?.getBoundingClientRect() ?? null;
        const style = passport instanceof HTMLElement ? getComputedStyle(passport) : null;
        const visibleHeight = rect
          ? Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0))
          : 0;
        return {
          activeElementTestId: activeElement?.getAttribute('data-testid') ?? activeElement?.id ?? '',
          activeElementVisible: Boolean(
            activeElementRect &&
              activeElementRect.width > 0 &&
              activeElementRect.height > 0 &&
              activeElementStyle?.display !== 'none' &&
              activeElementStyle?.visibility !== 'hidden'
          ),
          actionVisible: ${JSON.stringify(true)},
          destinationZone: activeTab?.id?.replace('workspace-tab-', '') ?? '',
          guidanceCenterInitiallyClosed: ${JSON.stringify(guidanceBeatPassportClosedPosture.guidanceCenterClosed)},
          guidanceCenterOpen: guidance?.open === true,
          modalClosed: document.querySelector('[data-testid="quick-actions"]') === null,
          nativeShortcutOpened: ${JSON.stringify(guidanceBeatPassportNativeShortcutOpened)},
          originalGuidanceCenterOpen: ${JSON.stringify(originalGuidanceCenterOpen)},
          passportClearOfNavigator: Boolean(rect && navigatorRect && rect.top >= navigatorRect.bottom - 1),
          passportHeight: rect?.height ?? 0,
          passportInViewport: Boolean(rect && rect.top >= 0 && rect.top < window.innerHeight && rect.bottom > 0),
          passportVisible: Boolean(
            passport &&
              rect &&
              rect.width > 0 &&
              rect.height > 0 &&
              style?.display !== 'none' &&
              style?.visibility !== 'hidden'
          ),
          passportWidth: rect?.width ?? 0,
          passportWithinGuidance: Boolean(passport && guidance?.contains(passport)),
          selectedActionId: ${JSON.stringify(guidanceBeatPassportSelectedActionId)},
          sourceZone: 'compose',
          statusText: document.querySelector('[data-testid="project-status"]')?.textContent?.trim() ?? '',
          viewportHeight: window.innerHeight,
          visibleHeight
        };
      })();
    `)) as Omit<
      LaunchSmokeFunctionalTabsEvidence["guidanceBeatPassportQuickActionReveal"],
      "guidancePostureRestored" | "projectFingerprintPreserved"
    >;
    const afterGuidanceBeatPassportQuickAction = await readLaunchSmokeFunctionalTabState(win);
    const guidanceBeatPassportQuickActionEvidence: LaunchSmokeFunctionalTabsEvidence["guidanceBeatPassportQuickActionReveal"] = {
      ...guidanceBeatPassportQuickActionReveal,
      guidancePostureRestored: false,
      projectFingerprintPreserved:
        afterGuidanceBeatPassportQuickAction.composeDataFingerprint === preparedCompose.composeDataFingerprint
    };

    const guidanceCenterOpenAfterRoute = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="guidance-center"]')?.open === true`
    )) as boolean;
    if (guidanceCenterOpenAfterRoute !== originalGuidanceCenterOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
    }
    guidanceBeatPassportQuickActionEvidence.guidancePostureRestored = (await win.webContents.executeJavaScript(`
      document.querySelector('[data-testid="guidance-center"]')?.open === ${JSON.stringify(originalGuidanceCenterOpen)}
    `)) as boolean;

    onStep("running native First Beat Path Setup Quick Action from Compose to Transport");
    await sendLaunchSmokeFunctionalTabNativeKey(win, "K", commandModifier);
    let firstBeatPathTransportNativeShortcutOpened = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      firstBeatPathTransportNativeShortcutOpened = (await win.webContents.executeJavaScript(`
        document.querySelector('[data-testid="quick-actions"]') !== null &&
          document.activeElement?.getAttribute('data-testid') === 'quick-actions-search'
      `)) as boolean;
      if (firstBeatPathTransportNativeShortcutOpened) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!firstBeatPathTransportNativeShortcutOpened) {
      throw new Error("Native Quick Actions shortcut did not focus search before First Beat Path Setup routing.");
    }

    await win.webContents.insertText("first beat path setup");
    let firstBeatPathTransportActionVisible = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      firstBeatPathTransportActionVisible = (await win.webContents.executeJavaScript(`
        document.querySelector('[data-testid="quick-actions-search"]')?.value === 'first beat path setup' &&
          document.querySelector('[data-testid="quick-action-first-beat-path-step-setup"]') !== null
      `)) as boolean;
      if (firstBeatPathTransportActionVisible) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!firstBeatPathTransportActionVisible) {
      throw new Error("First Beat Path Setup Quick Action did not become visible after native text entry.");
    }

    const firstBeatPathTransportTargetIndex = (await win.webContents.executeJavaScript(`
      (() => {
        const ids = Array.from(document.querySelectorAll('.quick-action-row'))
          .filter((row) => {
            const button = row.querySelector('.quick-action-run');
            return button instanceof HTMLButtonElement && !button.disabled;
          })
          .map((row) => row.id.replace('quick-action-option-', ''));
        return ids.indexOf('first-beat-path-step-setup');
      })();
    `)) as number;
    if (firstBeatPathTransportTargetIndex < 0) {
      throw new Error("First Beat Path Setup Quick Action was not in the runnable keyboard result list.");
    }
    await sendLaunchSmokeFunctionalTabNativeKey(win, "Home");
    for (let index = 0; index < firstBeatPathTransportTargetIndex; index += 1) {
      await sendLaunchSmokeFunctionalTabNativeKey(win, "Down");
    }
    const firstBeatPathTransportSelectedActionId = (await win.webContents.executeJavaScript(`
      document.querySelector('[data-testid="quick-actions-keyboard-selection"]')?.getAttribute('data-keyboard-action') ?? ''
    `)) as string;
    if (firstBeatPathTransportSelectedActionId !== "first-beat-path-step-setup") {
      throw new Error(
        `Native Home/ArrowDown selected ${firstBeatPathTransportSelectedActionId || "no action"} instead of First Beat Path Setup.`
      );
    }

    await sendLaunchSmokeFunctionalTabNativeKey(win, "Enter");
    let firstBeatPathTransportQuickActionSettled = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      firstBeatPathTransportQuickActionSettled = (await win.webContents.executeJavaScript(`
        (() => {
          const transport = document.querySelector('[data-testid="workflow-target-transport"]');
          const rect = transport?.getBoundingClientRect();
          return (
            document.querySelector('[data-testid="quick-actions"]') === null &&
            document.querySelector('[role="tab"][aria-selected="true"]')?.id === 'workspace-tab-compose' &&
            document.activeElement === transport &&
            Boolean(rect && rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0)
          );
        })();
      `)) as boolean;
      if (firstBeatPathTransportQuickActionSettled) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!firstBeatPathTransportQuickActionSettled) {
      throw new Error("Native Enter did not focus visible Transport from the active Compose tab.");
    }

    const firstBeatPathTransportQuickActionReveal = (await win.webContents.executeJavaScript(`
      (() => {
        const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
        const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const activeElementRect = activeElement?.getBoundingClientRect() ?? null;
        const activeElementStyle = activeElement ? getComputedStyle(activeElement) : null;
        const guidance = document.querySelector('[data-testid="guidance-center"]');
        const transport = document.querySelector('[data-testid="workflow-target-transport"]');
        const rect = transport?.getBoundingClientRect() ?? null;
        const style = transport instanceof HTMLElement ? getComputedStyle(transport) : null;
        const visibleHeight = rect
          ? Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0))
          : 0;
        return {
          activeElementTestId: activeElement?.getAttribute('data-testid') ?? activeElement?.id ?? '',
          activeElementVisible: Boolean(
            activeElementRect &&
              activeElementRect.width > 0 &&
              activeElementRect.height > 0 &&
              activeElementStyle?.display !== 'none' &&
              activeElementStyle?.visibility !== 'hidden'
          ),
          actionVisible: ${JSON.stringify(true)},
          destinationZone: activeTab?.id?.replace('workspace-tab-', '') ?? '',
          guidanceCenterOpenAfterRoute: guidance?.open === true,
          modalClosed: document.querySelector('[data-testid="quick-actions"]') === null,
          nativeShortcutOpened: ${JSON.stringify(firstBeatPathTransportNativeShortcutOpened)},
          originalGuidanceCenterOpen: ${JSON.stringify(originalGuidanceCenterOpen)},
          selectedActionId: ${JSON.stringify(firstBeatPathTransportSelectedActionId)},
          sourceZone: 'compose',
          statusText: document.querySelector('[data-testid="project-status"]')?.textContent?.trim() ?? '',
          transportHeight: rect?.height ?? 0,
          transportInViewport: Boolean(rect && rect.top >= 0 && rect.top < window.innerHeight && rect.bottom > 0),
          transportVisible: Boolean(
            transport &&
              rect &&
              rect.width > 0 &&
              rect.height > 0 &&
              style?.display !== 'none' &&
              style?.visibility !== 'hidden'
          ),
          transportWidth: rect?.width ?? 0,
          viewportHeight: window.innerHeight,
          visibleHeight
        };
      })();
    `)) as Omit<
      LaunchSmokeFunctionalTabsEvidence["firstBeatPathTransportQuickActionReveal"],
      "guidancePostureRestored" | "projectFingerprintPreserved"
    >;
    const afterFirstBeatPathTransportQuickAction = await readLaunchSmokeFunctionalTabState(win);
    const firstBeatPathTransportQuickActionEvidence: LaunchSmokeFunctionalTabsEvidence["firstBeatPathTransportQuickActionReveal"] = {
      ...firstBeatPathTransportQuickActionReveal,
      guidancePostureRestored: false,
      projectFingerprintPreserved:
        afterFirstBeatPathTransportQuickAction.composeDataFingerprint === preparedCompose.composeDataFingerprint
    };
    const guidanceCenterOpenAfterTransportRoute = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="guidance-center"]')?.open === true`
    )) as boolean;
    if (guidanceCenterOpenAfterTransportRoute !== originalGuidanceCenterOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
    }
    firstBeatPathTransportQuickActionEvidence.guidancePostureRestored = (await win.webContents.executeJavaScript(`
      document.querySelector('[data-testid="guidance-center"]')?.open === ${JSON.stringify(originalGuidanceCenterOpen)}
    `)) as boolean;

    const viewportWidth = (await win.webContents.executeJavaScript(`window.innerWidth`)) as number;
    const stateValues = Object.values(states);
    const evidence: LaunchSmokeFunctionalTabsEvidence = {
      captures,
      composeRoundTrip: {
        dirtyPosturePreserved: returnedCompose.dirtyPosture === preparedCompose.dirtyPosture,
        disclosurePosturePreserved: returnedCompose.disclosurePosture === preparedCompose.disclosurePosture,
        editFingerprintPreserved: returnedCompose.composeDataFingerprint === preparedCompose.composeDataFingerprint,
        keyboardCapturePosturePreserved:
          returnedCompose.keyboardCapturePosture === preparedCompose.keyboardCapturePosture,
        playbackPosturePreserved: returnedCompose.playbackPosture === preparedCompose.playbackPosture,
        selectedPatternPreserved: returnedCompose.selectedPattern === preparedCompose.selectedPattern,
        undoRedoPosturePreserved: returnedCompose.undoRedoPosture === preparedCompose.undoRedoPosture
      },
      crossTabFocusTransfer,
      firstBeatPathTransportQuickActionReveal: firstBeatPathTransportQuickActionEvidence,
      finishChecklistQuickActionReveal: finishChecklistQuickActionEvidence,
      guidanceBeatPassportQuickActionReveal: guidanceBeatPassportQuickActionEvidence,
      reviewQueueQuickActionReveal: reviewQueueQuickActionEvidence,
      hiddenComposeGuards,
      initial: publicFunctionalTabState(initial),
      minimumWindow: {
        maximumActivePanelHorizontalOverflow: Math.max(
          0,
          ...stateValues.map((state) => state.activePanelHorizontalOverflow)
        ),
        maximumDocumentHorizontalOverflow: Math.max(0, ...stateValues.map((state) => state.documentHorizontalOverflow)),
        maximumTabListHorizontalOverflow: Math.max(0, ...stateValues.map((state) => state.tabListHorizontalOverflow)),
        viewportWidth
      },
      nativeMenuDeleteGuards,
      restoredCompose: false,
      states,
      stickyNavigatorAfterDeepScroll,
      traversal,
      workspacePages: {
        composeInitial,
        composeStates,
        composeTraversal,
        mixInitial,
        mixStates,
        mixTraversal,
        pageStatePreservedAcrossOuterTabs: {
          compose: returnedCompose.activeComposePage === preparedCompose.activeComposePage,
          mix: mixPagePreservedAcrossOuterTabs
        }
      }
    };

    onStep("restoring Compose local posture");
    await restoreLaunchSmokeFunctionalTabPosture(win, initial);
    const restored = await readLaunchSmokeFunctionalTabState(win);
    cleanupComplete = true;
    evidence.restoredCompose =
      restored.activeZone === "compose" &&
      restored.selectedPattern === initial.selectedPattern &&
      restored.disclosurePosture === initial.disclosurePosture &&
      restored.keyboardCapturePosture === initial.keyboardCapturePosture &&
      restored.undoRedoPosture === initial.undoRedoPosture &&
      restored.dirtyPosture === initial.dirtyPosture &&
      restored.playbackPosture === initial.playbackPosture &&
      restored.activeComposePage === initial.activeComposePage &&
      restored.activeMixPage === initial.activeMixPage;
    return evidence;
  } finally {
    if (initial && !cleanupComplete) {
      await restoreLaunchSmokeFunctionalTabPosture(win, initial).catch(() => undefined);
    }
    win.setSize(originalSize[0], originalSize[1]);
    await new Promise((resolve) => setTimeout(resolve, 160));
  }
}

function collectLaunchSmokeFunctionalTabsEvidenceWithTimeout(
  win: BrowserWindow,
  onStep: (step: string) => void = () => {}
): Promise<LaunchSmokeFunctionalTabsEvidence> {
  return new Promise((resolve, reject) => {
    let step = "starting";
    const timeout = setTimeout(
      () => reject(new Error(`Timed out collecting functional tab screen evidence at ${step}.`)),
      480000
    );
    void collectLaunchSmokeFunctionalTabsEvidence(win, (nextStep) => {
      step = nextStep;
      onStep(nextStep);
    })
      .then((evidence) => {
        clearTimeout(timeout);
        resolve(evidence);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

async function collectLaunchSmokeMinimumWindowEvidence(
  win: BrowserWindow
): Promise<LaunchSmokeMinimumWindowEvidence> {
  const minimumWindowWideStudioAutoExpandReady = await win.webContents.executeJavaScript(`
    (() => {
      window.__grooveforgeLaunchSmoke?.setModeAwareToolPanels?.('studio');
      const session = document.querySelector('[data-testid="transport-session-tools"]');
      const exports = document.querySelector('[data-testid="transport-export-tools"]');
      return Boolean(session?.open && exports?.open);
    })();
  `);
  win.setSize(1180, 800);
  try {
    const responsiveStudio = await win.webContents.executeJavaScript(`
      (async () => {
        const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const compactMedia = window.matchMedia("(max-width: 1220px)");
        const header = document.querySelector('[data-testid="workflow-target-transport"]');
        const session = document.querySelector('[data-testid="transport-session-tools"]');
        const exports = document.querySelector('[data-testid="transport-export-tools"]');
        const sessionToggle = document.querySelector('[data-testid="transport-session-toggle"]');
        const exportToggle = document.querySelector('[data-testid="transport-export-toggle"]');
        const resizeDeadline = performance.now() + 30000;
        while (
          performance.now() < resizeDeadline &&
          !(
            compactMedia.matches &&
            window.innerWidth <= 1220 &&
            session instanceof HTMLDetailsElement &&
            exports instanceof HTMLDetailsElement &&
            !session.open &&
            !exports.open
          )
        ) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        await settle();
        const resizeCollapseReady = Boolean(session && exports && !session.open && !exports.open);
        const resizeMediaMatches = compactMedia.matches;
        const resizeViewportWidth = window.innerWidth;

        window.__grooveforgeLaunchSmoke?.setModeAwareToolPanels?.('studio');
        await settle();
        const compactEntryReady = Boolean(session && exports && !session.open && !exports.open);
        const compactHeight = header?.getBoundingClientRect().height ?? 0;
        const compactHorizontalOverflow = Math.max(
          0,
          document.documentElement.scrollWidth - document.documentElement.clientWidth
        );

        sessionToggle?.click();
        await settle();
        const sessionManualReady = Boolean(session?.open && !exports?.open);
        sessionToggle?.click();
        await settle();
        exportToggle?.click();
        await settle();
        const exportsManualReady = Boolean(!session?.open && exports?.open);
        const expandedHeight = header?.getBoundingClientRect().height ?? 0;

        window.__grooveforgeLaunchSmoke?.setModeAwareToolPanels?.('guided');
        await settle();
        return {
          compactEntryReady,
          compactHeight,
          compactHorizontalOverflow,
          expandedHeight,
          manualReopenReady: sessionManualReady && exportsManualReady,
          resizeCollapseReady,
          resizeMediaMatches,
          resizeViewportWidth
        };
      })();
    `);
    const evidence = await win.webContents.executeJavaScript(`
      (() => {
        window.scrollTo(0, 0);
        const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect() ?? null;
        const transport = rect('[data-testid="workflow-target-transport"]');
        const launchpad = rect('[data-testid="first-run-launchpad"]');
        const controls = rect('.transport-controls');
        const beginner = rect('[data-testid="first-run-start-beat"]');
        const producer = rect('[data-testid="first-run-producer-pass"]');
        const requiredIds = [
          'first-run-start-beat',
          'first-run-producer-pass',
          'first-run-open-project',
          'project-bpm-input',
          'project-key-select',
          'project-time-signature',
          'transport-play',
          'quick-actions-open',
          'command-reference-open',
          'undo-button',
          'redo-button',
          'project-open',
          'project-save',
          'transport-session-toggle',
          'transport-export-toggle'
        ];
        const withinViewport = (testId) => {
          const target = document.querySelector('[data-testid="' + testId + '"]');
          if (!target) return false;
          const targetRect = target.getBoundingClientRect();
          return (
            targetRect.width > 0 &&
            targetRect.height > 0 &&
            targetRect.left >= 0 &&
            targetRect.right <= innerWidth &&
            targetRect.top >= 0 &&
            targetRect.bottom <= innerHeight
          );
        };
        const horizontalOverflow = Math.max(
          0,
          document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        const transportPlayback = document.querySelector('[data-testid="transport-play"]');
        const transportPlaybackRect = transportPlayback?.getBoundingClientRect() ?? null;
        const transportPlaybackLabel = transportPlayback?.querySelector(':scope strong') ?? null;
        const transportPlaybackDetail = transportPlayback?.querySelector(':scope small') ?? null;
        return {
          minimumWindowDirectActionsReady: requiredIds.every(withinViewport),
          minimumWindowHorizontalOverflow: horizontalOverflow,
          minimumWindowLaunchpadHorizontalReady: Boolean(
            beginner &&
            producer &&
            Math.abs(beginner.top - producer.top) < 1 &&
            beginner.right < producer.left
          ),
          minimumWindowSetupReady: Boolean(
            controls && controls.left >= 0 && controls.right <= innerWidth && controls.width > 0
          ),
          minimumWindowStudioCompactEntryReady: ${JSON.stringify(responsiveStudio.compactEntryReady)},
          minimumWindowStudioCompactHeight: ${JSON.stringify(responsiveStudio.compactHeight)},
          minimumWindowStudioExpandedHeight: ${JSON.stringify(responsiveStudio.expandedHeight)},
          minimumWindowStudioHorizontalOverflow: ${JSON.stringify(responsiveStudio.compactHorizontalOverflow)},
          minimumWindowStudioManualReopenReady: ${JSON.stringify(responsiveStudio.manualReopenReady)},
          minimumWindowStudioResizeCollapseReady: ${JSON.stringify(responsiveStudio.resizeCollapseReady)},
          minimumWindowStudioResizeMediaMatches: ${JSON.stringify(responsiveStudio.resizeMediaMatches)},
          minimumWindowStudioResizeViewportWidth: ${JSON.stringify(responsiveStudio.resizeViewportWidth)},
          minimumWindowTransportHeight: transport?.height ?? 0,
          minimumWindowTransportPlaybackContained: Boolean(
            transportPlaybackRect &&
            transportPlaybackRect.height >= 38 &&
            transportPlaybackRect.left >= 0 &&
            transportPlaybackRect.right <= innerWidth &&
            transportPlaybackRect.top >= 0 &&
            transportPlaybackRect.bottom <= innerHeight
          ),
          minimumWindowTransportPlaybackHeight: transportPlaybackRect?.height ?? 0,
          minimumWindowTransportPlaybackInternalOverflow: transportPlayback
            ? Math.max(0, transportPlayback.scrollWidth - transportPlayback.clientWidth)
            : 0,
          minimumWindowTransportPlaybackReadable: Boolean(
            transportPlaybackLabel &&
            transportPlaybackDetail &&
            transportPlaybackLabel.clientWidth > 0 &&
            transportPlaybackLabel.scrollWidth <= transportPlaybackLabel.clientWidth + 1 &&
            transportPlaybackDetail.clientWidth > 0 &&
            transportPlaybackDetail.scrollWidth <= transportPlaybackDetail.clientWidth + 1
          ),
          minimumWindowTransportPlaybackWidth: transportPlaybackRect?.width ?? 0,
          minimumWindowTransportReady: Boolean(
            transport &&
            launchpad &&
            horizontalOverflow === 0 &&
            transport.left >= 0 &&
            transport.right <= innerWidth &&
            launchpad.left >= 0 &&
            launchpad.right <= innerWidth
          ),
          minimumWindowViewportWidth: innerWidth,
          minimumWindowWideStudioAutoExpandReady: ${JSON.stringify(minimumWindowWideStudioAutoExpandReady)}
        };
      })();
    `);
    return evidence as LaunchSmokeMinimumWindowEvidence;
  } finally {
    await win.webContents.executeJavaScript(`window.__grooveforgeLaunchSmoke?.setModeAwareToolPanels?.('guided');`);
    win.setSize(1440, 960);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
}

type LaunchSmokeAudioAnalysisState = "error" | "pending" | "ready" | "unknown";

type LaunchSmokeAudioAnalysisTabPosture = {
  activeZone: string;
  focusOnSelectedTab: boolean;
  focusedTestId: string;
  routeTestId: string;
  selectedTabCount: number;
  selectedTabTestId: string;
  visiblePanelCount: number;
  visiblePanelZones: string[];
};

type LaunchSmokeAudioAnalysisPrewarmEvidence = {
  exactState: "ready";
  initial: LaunchSmokeAudioAnalysisTabPosture;
  mix: LaunchSmokeAudioAnalysisTabPosture;
  nativeRouteSequence: ["workflow-jump-mix", "workflow-jump-compose"];
  restored: LaunchSmokeAudioAnalysisTabPosture;
  retryRequested: boolean;
};

async function readLaunchSmokeAudioAnalysisState(win: BrowserWindow): Promise<LaunchSmokeAudioAnalysisState> {
  return (await win.webContents.executeJavaScript(`
    (() => {
      const text = document.querySelector('[data-testid="audio-analysis-status"]')?.textContent?.trim() ?? "";
      if (text === "Audio meters ready") return "ready";
      if (text === "Audio meters updating") return "pending";
      if (text === "Audio meters unavailable") return "error";
      return "unknown";
    })();
  `)) as LaunchSmokeAudioAnalysisState;
}

async function waitForLaunchSmokeExactAudioAnalysis(
  win: BrowserWindow
): Promise<{ retryRequested: boolean; state: "ready" }> {
  const deadline = Date.now() + 60000;
  let retryRequested = false;
  let state = await readLaunchSmokeAudioAnalysisState(win);
  while (Date.now() < deadline && state !== "ready") {
    if (state === "error" && !retryRequested) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "audio-analysis-retry");
      retryRequested = true;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
    state = await readLaunchSmokeAudioAnalysisState(win);
  }
  if (state !== "ready") {
    throw new Error(
      `Exact audio analysis did not become ready before Guide lazy-surface preparation: ${state}; retry requested: ${retryRequested}.`
    );
  }
  return { retryRequested, state };
}

async function readLaunchSmokeAudioAnalysisTabPosture(
  win: BrowserWindow
): Promise<LaunchSmokeAudioAnalysisTabPosture> {
  return (await win.webContents.executeJavaScript(`
    (() => {
      const visible = (target) => {
        if (!(target instanceof HTMLElement)) return false;
        const rect = target.getBoundingClientRect();
        const style = getComputedStyle(target);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      const tabs = Array.from(
        document.querySelectorAll('[role="tablist"][aria-label="Workstation function tabs"] [role="tab"]')
      );
      const selectedTabs = tabs.filter((tab) => tab.getAttribute("aria-selected") === "true");
      const selectedTab = selectedTabs[0] ?? null;
      const activeZone = selectedTab?.id?.replace("workspace-tab-", "") ?? "";
      const routeTestId = selectedTab instanceof HTMLElement ? selectedTab.dataset.testid ?? "" : "";
      const panels = ["compose", "arrange", "mix", "deliver"]
        .map((zone) => document.getElementById("workspace-panel-" + zone))
        .filter(Boolean);
      const visiblePanelZones = panels
        .filter((panel) => !panel.hidden && visible(panel))
        .map((panel) => panel.getAttribute("data-workspace-zone") ?? "");
      const active = document.activeElement;
      return {
        activeZone,
        focusOnSelectedTab: active === selectedTab,
        focusedTestId: active instanceof HTMLElement ? active.dataset.testid ?? "" : "",
        routeTestId,
        selectedTabCount: selectedTabs.length,
        selectedTabTestId: routeTestId,
        visiblePanelCount: visiblePanelZones.length,
        visiblePanelZones
      };
    })();
  `)) as LaunchSmokeAudioAnalysisTabPosture;
}

async function waitForLaunchSmokeAudioAnalysisTabPosture(
  win: BrowserWindow,
  zone: "compose" | "mix"
): Promise<LaunchSmokeAudioAnalysisTabPosture> {
  const routeTestId = `workflow-jump-${zone}`;
  const deadline = Date.now() + launchSmokePaletteUiSettleTimeoutMs;
  let posture = await readLaunchSmokeAudioAnalysisTabPosture(win);
  const ready = (current: LaunchSmokeAudioAnalysisTabPosture): boolean =>
    current.activeZone === zone &&
    current.routeTestId === routeTestId &&
    current.selectedTabCount === 1 &&
    current.selectedTabTestId === routeTestId &&
    current.visiblePanelCount === 1 &&
    current.visiblePanelZones.length === 1 &&
    current.visiblePanelZones[0] === zone &&
    current.focusOnSelectedTab &&
    current.focusedTestId === routeTestId;
  while (Date.now() < deadline && !ready(posture)) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    posture = await readLaunchSmokeAudioAnalysisTabPosture(win);
  }
  if (!ready(posture)) {
    throw new Error(`Audio analysis ${zone} tab posture did not settle: ${JSON.stringify(posture)}`);
  }
  return posture;
}

async function prewarmLaunchSmokeExactAudioAnalysis(
  win: BrowserWindow
): Promise<LaunchSmokeAudioAnalysisPrewarmEvidence> {
  const initial = await readLaunchSmokeAudioAnalysisTabPosture(win);
  if (
    initial.activeZone !== "compose" ||
    initial.selectedTabCount !== 1 ||
    initial.selectedTabTestId !== "workflow-jump-compose" ||
    initial.visiblePanelCount !== 1 ||
    initial.visiblePanelZones.length !== 1 ||
    initial.visiblePanelZones[0] !== "compose"
  ) {
    throw new Error(`Audio analysis prewarm must start from the visible selected Compose route: ${JSON.stringify(initial)}`);
  }

  let mix: LaunchSmokeAudioAnalysisTabPosture | null = null;
  let exact: { retryRequested: boolean; state: "ready" } | null = null;
  let restored: LaunchSmokeAudioAnalysisTabPosture | null = null;
  try {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-mix");
    mix = await waitForLaunchSmokeAudioAnalysisTabPosture(win, "mix");
    exact = await waitForLaunchSmokeExactAudioAnalysis(win);
  } finally {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-compose").catch(() => undefined);
    restored = await waitForLaunchSmokeAudioAnalysisTabPosture(win, "compose").catch(() => null);
  }

  if (!mix || !exact || !restored) {
    throw new Error(
      `Audio analysis prewarm did not complete its native Mix-to-Compose route: ${JSON.stringify({ exact, initial, mix, restored })}`
    );
  }
  return {
    exactState: exact.state,
    initial,
    mix,
    nativeRouteSequence: ["workflow-jump-mix", "workflow-jump-compose"],
    restored,
    retryRequested: exact.retryRequested
  };
}

type LaunchSmokeLazySurfaceState = {
  actionsVisible: boolean;
  guideOpen: boolean;
  proofContentHidden: boolean;
  proofContentVisible: boolean;
  proofOpen: boolean;
  proofRowsPresent: number;
  proofRowsVisible: number;
  proofToggleVisible: boolean;
  readoutVisible: boolean;
};

async function readLaunchSmokeLazySurfaceState(win: BrowserWindow): Promise<LaunchSmokeLazySurfaceState> {
  return (await win.webContents.executeJavaScript(`
    (() => {
      const visible = (target) => {
        if (!(target instanceof HTMLElement)) return false;
        const rect = target.getBoundingClientRect();
        const style = getComputedStyle(target);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      const guide = document.querySelector('[data-testid="guidance-center"]');
      const proof = document.querySelector('[data-testid="audience-session-proof-details"]');
      const proofContent = document.querySelector('[data-testid="audience-session-proof-content"]');
      const proofRows = Array.from(document.querySelectorAll(
        '[data-audience-session-acceptance-row], [data-audience-session-proof-handoff-row], [data-audience-completion-checkpoint-row], [data-audience-delivery-snapshot-row], [data-audience-delivery-proof-bridge-row]'
      ));
      return {
        actionsVisible:
          visible(document.querySelector('[data-testid="audience-next-step-rail"]')) &&
          visible(document.querySelector('[data-testid="audience-session-grid"]')),
        guideOpen: guide instanceof HTMLDetailsElement && guide.open,
        proofContentHidden: proofContent instanceof HTMLElement && proofContent.getBoundingClientRect().height === 0,
        proofContentVisible: visible(proofContent),
        proofOpen: proof instanceof HTMLDetailsElement && proof.open,
        proofRowsPresent: proofRows.length,
        proofRowsVisible: proofRows.filter(visible).length,
        proofToggleVisible: visible(document.querySelector('[data-testid="audience-session-proof-toggle"]')),
        readoutVisible: visible(document.querySelector('[data-testid="audience-session-readout"]'))
      };
    })();
  `)) as LaunchSmokeLazySurfaceState;
}

async function waitForLaunchSmokeLazySurfaceState(
  win: BrowserWindow,
  predicate: (state: LaunchSmokeLazySurfaceState) => boolean,
  expectedState: string
): Promise<LaunchSmokeLazySurfaceState> {
  const deadline = Date.now() + 30000;
  let state = await readLaunchSmokeLazySurfaceState(win);
  while (Date.now() < deadline && !predicate(state)) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    state = await readLaunchSmokeLazySurfaceState(win);
  }
  if (!predicate(state)) {
    throw new Error(`Guide lazy surfaces did not reach ${expectedState}: ${JSON.stringify(state)}`);
  }
  return state;
}

async function prepareLaunchSmokeLazySurfaces(
  win: BrowserWindow
): Promise<LaunchSmokeAudienceSessionLayoutEvidence> {
  const initialState = await readLaunchSmokeLazySurfaceState(win);
  if (initialState.guideOpen) {
    throw new Error("Guide should start collapsed before lazy-surface preparation.");
  }
  await win.webContents.executeJavaScript(`
    (() => {
      const text = (testId) => document.querySelector('[data-testid="' + testId + '"]')?.textContent?.trim() ?? "";
      window.__grooveforgeLaunchProjectOwnership ??= {
        projectStatus: text("project-status"),
        safetyStatus: text("project-safety-status"),
        safetyLabel: text("project-safety-label"),
        safetyDetail: text("project-safety-detail")
      };
    })();
  `);
  const audioAnalysisPrewarm = await prewarmLaunchSmokeExactAudioAnalysis(win);

  let proofInitiallyOpen = false;
  let openedState: LaunchSmokeLazySurfaceState | null = null;
  let closedState: LaunchSmokeLazySurfaceState | null = null;
  try {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
    const mountedState = await waitForLaunchSmokeLazySurfaceState(
      win,
      (state) =>
        state.guideOpen &&
        state.readoutVisible &&
        state.actionsVisible &&
        state.proofToggleVisible &&
        state.proofRowsPresent === 10,
      "an open Guide with visible Audience Session actions and mounted proof rows"
    );
    proofInitiallyOpen = mountedState.proofOpen;
    if (mountedState.proofOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "audience-session-proof-toggle");
      await waitForLaunchSmokeLazySurfaceState(
        win,
        (state) => !state.proofOpen && state.proofContentHidden,
        "a collapsed Audience Session proof baseline"
      );
    }

    await clickLaunchSmokeFunctionalTabNativeTarget(win, "audience-session-proof-toggle");
    openedState = await waitForLaunchSmokeLazySurfaceState(
      win,
      (state) => state.proofOpen && state.proofContentVisible && state.proofRowsVisible === 10,
      "an expanded Audience Session proof with ten visible rows"
    );
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "audience-session-proof-toggle");
    closedState = await waitForLaunchSmokeLazySurfaceState(
      win,
      (state) => !state.proofOpen && state.proofContentHidden && state.proofRowsVisible === 0,
      "a re-collapsed Audience Session proof with hidden content"
    );

    return {
      audioAnalysisPrewarm,
      audienceSessionActionsDirectVisible: mountedState.actionsVisible,
      audienceSessionProofContentHidden: closedState.proofContentHidden,
      audienceSessionProofInteractionReady:
        !proofInitiallyOpen && openedState.proofOpen && openedState.proofContentVisible && !closedState.proofOpen,
      audienceSessionProofOpen: closedState.proofOpen,
      audienceSessionProofRowsPreserved: openedState.proofRowsPresent === 10 && openedState.proofRowsVisible === 10,
      audienceSessionProofToggleVisible: mountedState.proofToggleVisible
    };
  } finally {
    const proofState = await readLaunchSmokeLazySurfaceState(win).catch(() => null);
    if (proofState?.guideOpen && proofState.proofOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "audience-session-proof-toggle").catch(() => undefined);
      await waitForLaunchSmokeLazySurfaceState(
        win,
        (state) => !state.proofOpen && state.proofContentHidden,
        "the collapsed Audience Session proof cleanup posture"
      ).catch(() => undefined);
    }
    const guideState = await readLaunchSmokeLazySurfaceState(win).catch(() => null);
    if (guideState?.guideOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle").catch(() => undefined);
      await waitForLaunchSmokeLazySurfaceState(
        win,
        (state) => !state.guideOpen,
        "the original collapsed Guide posture"
      ).catch(() => undefined);
    }
  }
}

async function collectLaunchSmokeEvidence(win: BrowserWindow): Promise<LaunchSmokeEvidence> {
  const evidence = await win.webContents.executeJavaScript(`
    (async () => {
      const expectedTestIds = [
        "workflow-target-transport",
        "workflow-target-compose",
        "workflow-target-sound",
        "workflow-target-arrange",
        "workflow-target-mix",
        "workflow-target-master",
        "guide-quick-start",
        "first-run-launchpad",
        "first-run-launchpad-toggle",
        "first-run-launchpad-content",
        "first-run-start-beat",
        "first-run-producer-pass",
        "first-run-open-project",
        "guide-quick-start-headline",
        "audience-session-readout",
        "audience-session-action-beginner",
        "audience-session-action-producer",
        "audience-next-step-rail",
        "audience-next-step-beginner",
        "audience-next-step-producer",
        "audience-completion-checkpoints",
        "audience-completion-checkpoint-beginner",
        "audience-completion-checkpoint-producer",
        "audience-session-acceptance",
        "audience-session-acceptance-beginner",
        "audience-session-acceptance-producer",
        "audience-session-proof-handoff",
        "audience-session-proof-handoff-beginner",
        "audience-session-proof-handoff-producer",
        "audience-delivery-snapshot",
        "audience-delivery-snapshot-beginner",
        "audience-delivery-snapshot-producer",
        "audience-delivery-proof-bridge",
        "audience-delivery-proof-bridge-beginner",
        "audience-delivery-proof-bridge-producer",
        "audience-starter-action-beginner",
        "audience-starter-action-producer",
        "audience-route-bridge",
        "audience-route-bridge-readiness-action",
        "audience-route-bridge-completion-action",
        "dual-audience-readiness",
        "dual-audience-readiness-beginner",
        "dual-audience-readiness-producer",
        "audience-completion-route",
        "audience-completion-route-beginner",
        "audience-completion-route-producer",
        "mode-focus",
        "mode-focus-mode",
        "session-pass",
        "session-pass-mode",
        "mode-guided",
        "mode-studio",
        "quick-actions-open",
        "command-reference-open",
        "project-bpm-input",
        "project-key-select",
        "project-time-signature",
        "style-select",
        "pattern-tab-A",
        "pattern-lab",
        "workspace-feedback-anchor",
        "transport-status-controls",
        "transport-essential-controls",
        "transport-play",
        "project-essential-controls",
        "project-open",
        "project-save",
        "transport-session-tools",
        "transport-session-toggle",
        "transport-export-tools",
        "transport-export-toggle",
        "export-wav",
        "workflow-navigator",
        "workflow-jump-compose",
        "workflow-jump-arrange",
        "workflow-jump-mix",
        "workflow-jump-deliver",
        "note-editor-panel",
        "capture-ideas",
        "instrument-direct-chords",
        "chord-event-grid",
        "harmony-moves",
        "sound-design-tools",
        "arrangement-playback-readout",
        "arrangement-timeline",
        "selected-block-editor",
        "block-moves",
        "arrangement-tools",
        "mixer-channel-strips",
        "mixer-processing-drum_rack",
        "mix-moves",
        "mix-review-tools",
        "master-output-controls",
        "master-ceiling-input",
        "master-polish-tools",
        "master-review-tools",
        "handoff-pack-direct",
        "handoff-pack-grid",
        "handoff-status-tools",
        "handoff-status-toggle",
        "handoff-audit-tools",
        "handoff-audit-toggle",
        "export-stems",
        "export-midi",
        "export-handoff-sheet",
        "pattern-chain-current",
        "master-ceiling"
      ];
      const expectedText = [
        "GrooveForge",
        "desktop workstation",
        "Time signature",
        "4/4",
        "Fixed grid",
        "Guide Quick Start",
        "Audience session",
        "Audience Route Bridge",
        "Dual Audience Readiness",
        "Audience Session Acceptance",
        "Audience Session Proof Handoff",
        "Audience Delivery Proof Bridge",
        "First-time composer",
        "First-time composer lane",
        "Professional producer",
        "Professional producer lane",
        "Enter Guided",
        "Enter Studio",
        "First Beat Path",
        "Beat Spine",
        "Composer Guide",
        "Workflow Navigator",
        "Studio",
        "Review Queue",
        "Production Snapshot",
        "Mix Coach",
        "Sound Snapshot",
        "Mix Snapshot",
        "Pattern A",
        "Pattern Lab",
        "Capture & Ideas",
        "Harmony Moves",
        "Sound Design",
        "Block Moves",
        "Arrangement Tools",
        "Tone & Space",
        "Mix Moves",
        "Audition & Compare",
        "Limiter ceiling",
        "Polish & Automation",
        "Review & Export",
        "Drums",
        "808",
        "Synth",
        "Melody",
        "Chords",
        "Arrangement",
        "Mixer",
        "Master",
        "Export meter",
        "Export Preflight",
        "Handoff Pack"
      ];
      const bodyText = document.body?.textContent ?? "";
      const appShell = document.querySelector('.app-shell');
      const testIds = Object.fromEntries(
        expectedTestIds.map((testId) => [testId, document.querySelector(\`[data-testid="\${testId}"]\`) !== null])
      );
      const guidanceCenter = document.querySelector('[data-testid="guidance-center"]');
      const guideQuickStartDecision = document.querySelector('[data-testid="guide-quick-start-decision"]');
      const guideQuickStartDetails = document.querySelector('[data-testid="guide-quick-start-details"]');
      const guideQuickStartDetailsToggle = document.querySelector('[data-testid="guide-quick-start-details-toggle"]');
      const guideQuickStartDetailsContent = document.querySelector('[data-testid="guide-quick-start-details-content"]');
      const audienceNextStepRail = document.querySelector('[data-testid="audience-next-step-rail"]');
      const audienceSessionGrid = document.querySelector('[data-testid="audience-session-grid"]');
      const audienceSessionProofDetails = document.querySelector('[data-testid="audience-session-proof-details"]');
      const audienceSessionProofToggle = document.querySelector('[data-testid="audience-session-proof-toggle"]');
      const audienceSessionProofContent = document.querySelector('[data-testid="audience-session-proof-content"]');
      const feedbackAnchor = document.querySelector('[data-testid="workspace-feedback-anchor"]');
      const patternLab = document.querySelector('[data-testid="pattern-lab"]');
      const patternLabToggle = document.querySelector('[data-testid="pattern-lab-toggle"]');
      const stepGrid = document.querySelector('.step-grid');
      const swingFeelButtons = Array.from(
        document.querySelectorAll('[data-testid="swing-feel-pads"] button[data-testid^="swing-feel-"]')
      );
      const swingFeelSelectedButtons = swingFeelButtons.filter((button) => button.getAttribute('aria-pressed') === 'true');
      const allButtons = Array.from(document.querySelectorAll('button'));
      const buttonThemeRepresentativeIds = [
        'groove-preset-tight',
        'chord-copy',
        'arrangement-copy',
        'stem-audition-drum_rack',
        'mix-snapshot-capture-a',
        'session-brief-starter-starter'
      ];
      const buttonThemeRepresentatives = buttonThemeRepresentativeIds
        .map((testId) => document.querySelector('[data-testid="' + testId + '"]'))
        .filter(Boolean);
      const chordPasteButton = document.querySelector('[data-testid="chord-paste"]');
      const captureIdeas = document.querySelector('[data-testid="capture-ideas"]');
      const captureIdeasToggle = document.querySelector('[data-testid="capture-ideas-toggle"]');
      const noteLanes = document.querySelector('.note-lanes');
      const instrumentDirectChords = document.querySelector('[data-testid="instrument-direct-chords"]');
      const chordEventGrid = document.querySelector('[data-testid="chord-event-grid"]');
      const chordCards = [...document.querySelectorAll('[data-testid^="chord-slot-"]')];
      const chordEditors = [...document.querySelectorAll('[data-testid^="chord-event-editor-"]')];
      const expandedChordCards = chordCards.filter((card) => card.dataset.editorOpen === "true");
      const compactChordCards = chordCards.filter((card) => card.dataset.editorOpen === "false");
      const harmonyMoves = document.querySelector('[data-testid="harmony-moves"]');
      const harmonyMovesToggle = document.querySelector('[data-testid="harmony-moves-toggle"]');
      const soundDesign = document.querySelector('[data-testid="sound-design-tools"]');
      const soundDesignToggle = document.querySelector('[data-testid="sound-design-toggle"]');
      const arrangementPlayback = document.querySelector('[data-testid="arrangement-playback-readout"]');
      const arrangementTimeline = document.querySelector('[data-testid="arrangement-timeline"]');
      const selectedBlockEditor = document.querySelector('[data-testid="selected-block-editor"]');
      const arrangementPatternControls = document.querySelector('[data-testid="arrangement-pattern-controls"]');
      const arrangementTrackStateControls = document.querySelector('[data-testid="arrangement-track-state-controls"]');
      const arrangementShapeControls = document.querySelector('[data-testid="arrangement-shape-controls"]');
      const arrangementBars = document.querySelector('[data-testid="arrangement-bars-input"]');
      const blockMoves = document.querySelector('[data-testid="block-moves"]');
      const blockMovesToggle = document.querySelector('[data-testid="block-moves-toggle"]');
      const arrangementTools = document.querySelector('[data-testid="arrangement-tools"]');
      const arrangementToolsToggle = document.querySelector('[data-testid="arrangement-tools-toggle"]');
      const mixerStrips = document.querySelector('[data-testid="mixer-channel-strips"]');
      const mixerVolume = document.querySelector('[data-testid="mixer-volume-drum_rack"]');
      const mixerProcessing = document.querySelector('[data-testid="mixer-processing-drum_rack"]');
      const mixerProcessingToggle = document.querySelector('[data-testid="mixer-processing-toggle-drum_rack"]');
      const mixMoves = document.querySelector('[data-testid="mix-moves"]');
      const mixMovesToggle = document.querySelector('[data-testid="mix-moves-toggle"]');
      const mixReview = document.querySelector('[data-testid="mix-review-tools"]');
      const mixReviewToggle = document.querySelector('[data-testid="mix-review-toggle"]');
      const masterRole = document.querySelector('[data-testid="master-output-role-readout"]');
      const masterOutputControls = document.querySelector('[data-testid="master-output-controls"]');
      const masterCeilingInput = document.querySelector('[data-testid="master-ceiling-input"]');
      const masterPolish = document.querySelector('[data-testid="master-polish-tools"]');
      const masterPolishToggle = document.querySelector('[data-testid="master-polish-toggle"]');
      const masterReview = document.querySelector('[data-testid="master-review-tools"]');
      const masterReviewToggle = document.querySelector('[data-testid="master-review-toggle"]');
      const masterReviewQueue = document.querySelector('[data-testid="master-review-queue-tools"]');
      const masterMixCoach = document.querySelector('[data-testid="master-mix-coach-tools"]');
      const deliveryRoute = document.querySelector('[data-testid="handoff-pack-route-readout"]');
      const deliveryDirect = document.querySelector('[data-testid="handoff-pack-direct"]');
      const deliveryStatus = document.querySelector('[data-testid="handoff-status-tools"]');
      const deliveryStatusToggle = document.querySelector('[data-testid="handoff-status-toggle"]');
      const deliveryAudit = document.querySelector('[data-testid="handoff-audit-tools"]');
      const deliveryAuditToggle = document.querySelector('[data-testid="handoff-audit-toggle"]');
      const workflowNavigator = document.querySelector('[data-testid="workflow-navigator"]');
      const workspaceGrid = document.querySelector('.workspace-grid');
      const workflowNavigatorStyle = workflowNavigator ? getComputedStyle(workflowNavigator) : null;
      const launchpad = document.querySelector('[data-testid="first-run-launchpad"]');
      const launchpadToggle = document.querySelector('[data-testid="first-run-launchpad-toggle"]');
      const launchpadContent = document.querySelector('[data-testid="first-run-launchpad-content"]');
      const transportBand = document.querySelector('[data-testid="workflow-target-transport"]');
      const brandLockup = document.querySelector('.brand-lockup');
      const transportControls = document.querySelector('.transport-controls');
      const beginnerStarter = document.querySelector('[data-testid="first-run-start-beat"]');
      const producerStarter = document.querySelector('[data-testid="first-run-producer-pass"]');
      const firstRunOpenProject = document.querySelector('[data-testid="first-run-open-project"]');
      window.scrollTo(0, 0);
      const initialTransportBandRect = transportBand?.getBoundingClientRect();
      const initialWorkflowNavigatorRect = workflowNavigator?.getBoundingClientRect();
      const initialLaunchpadContentRect = launchpadContent?.getBoundingClientRect();
      const initialBrandLockupRect = brandLockup?.getBoundingClientRect();
      const initialTransportControlsRect = transportControls?.getBoundingClientRect();
      const initialBeginnerStarterRect = beginnerStarter?.getBoundingClientRect();
      const initialProducerStarterRect = producerStarter?.getBoundingClientRect();
      const initialViewportHeight = innerHeight;
      const transportStatusControls = document.querySelector('[data-testid="transport-status-controls"]');
      const transportEssentialControls = document.querySelector('[data-testid="transport-essential-controls"]');
      const transportPlay = document.querySelector('[data-testid="transport-play"]');
      const quickActionsOpen = document.querySelector('[data-testid="quick-actions-open"]');
      const commandReferenceOpen = document.querySelector('[data-testid="command-reference-open"]');
      const undoButton = document.querySelector('[data-testid="undo-button"]');
      const redoButton = document.querySelector('[data-testid="redo-button"]');
      const projectOpen = document.querySelector('[data-testid="project-open"]');
      const projectEssentialControls = document.querySelector('[data-testid="project-essential-controls"]');
      const projectSave = document.querySelector('[data-testid="project-save"]');
      const projectStatus = document.querySelector('[data-testid="project-status"]');
      const projectSafetyStatus = document.querySelector('[data-testid="project-safety-status"]');
      const projectSafetyLabel = document.querySelector('[data-testid="project-safety-label"]');
      const projectSafetyDetail = document.querySelector('[data-testid="project-safety-detail"]');
      const initialProjectStatus = projectStatus?.textContent?.trim() ?? "";
      const initialProjectSafetyStatus = projectSafetyStatus?.textContent?.trim() ?? "";
      const initialProjectSafetyLabel = projectSafetyLabel?.textContent?.trim() ?? "";
      const initialProjectSafetyDetail = projectSafetyDetail?.textContent?.trim() ?? "";
      const initialProjectOwnership = window.__grooveforgeLaunchProjectOwnership ?? {
        projectStatus: initialProjectStatus,
        safetyStatus: initialProjectSafetyStatus,
        safetyLabel: initialProjectSafetyLabel,
        safetyDetail: initialProjectSafetyDetail
      };
      window.__grooveforgeLaunchProjectOwnership = initialProjectOwnership;
      const patternTabs = ["A", "B", "C"].map((pattern) =>
        document.querySelector('[data-testid="pattern-tab-' + pattern + '"]')
      );
      const transportSession = document.querySelector('[data-testid="transport-session-tools"]');
      const transportSessionToggle = document.querySelector('[data-testid="transport-session-toggle"]');
      const transportExports = document.querySelector('[data-testid="transport-export-tools"]');
      const transportExportToggle = document.querySelector('[data-testid="transport-export-toggle"]');
      const exportWav = document.querySelector('[data-testid="export-wav"]');
      const follows = (before, after) =>
        Boolean(before && after && (before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING));
      const guideQuickStartDetailsInitiallyOpen = Boolean(guideQuickStartDetails?.open);
      guideQuickStartDetailsToggle?.click();
      const guideQuickStartDetailsOpened = Boolean(guideQuickStartDetails?.open);
      guideQuickStartDetailsToggle?.click();
      const guideQuickStartDetailsClosedAgain = !Boolean(guideQuickStartDetails?.open);
      const guidanceCenterInitiallyOpen = Boolean(guidanceCenter?.open);
      if (guidanceCenter && !guidanceCenter.open) {
        guidanceCenter.open = true;
      }
      const audienceSessionProofInitiallyOpen = Boolean(audienceSessionProofDetails?.open);
      const audienceSessionProofToggleVisible = Boolean(
        audienceSessionProofToggle && audienceSessionProofToggle.getBoundingClientRect().height > 0
      );
      const audienceSessionActionsDirectVisible = Boolean(
        audienceNextStepRail &&
        audienceNextStepRail.getBoundingClientRect().height > 0 &&
        audienceSessionGrid &&
        audienceSessionGrid.getBoundingClientRect().height > 0
      );
      const audienceSessionProofInitiallyHidden = Boolean(
        audienceSessionProofContent && audienceSessionProofContent.getBoundingClientRect().height === 0
      );
      audienceSessionProofToggle?.click();
      const audienceSessionProofOpened = Boolean(audienceSessionProofDetails?.open);
      const audienceSessionProofContentVisible = Boolean(
        audienceSessionProofContent && audienceSessionProofContent.getBoundingClientRect().height > 0
      );
      const audienceSessionProofRows = Array.from(document.querySelectorAll(
        '[data-audience-session-acceptance-row], [data-audience-session-proof-handoff-row], [data-audience-completion-checkpoint-row], [data-audience-delivery-snapshot-row], [data-audience-delivery-proof-bridge-row]'
      ));
      const audienceSessionProofRowsPreserved =
        audienceSessionProofRows.length === 10 &&
        audienceSessionProofRows.every((row) => row.getBoundingClientRect().height > 0);
      audienceSessionProofToggle?.click();
      const audienceSessionProofClosedAgain = !Boolean(audienceSessionProofDetails?.open);
      const audienceSessionProofHiddenAgain = Boolean(
        audienceSessionProofContent && audienceSessionProofContent.getBoundingClientRect().height === 0
      );
      if (guidanceCenter && !guidanceCenterInitiallyOpen) {
        guidanceCenter.open = false;
      }
      const emptyRoute = {
        actionPresent: false,
        countText: "",
        resultMetricValue: "",
        resultNextCheck: "",
        resultStatus: "",
        resultTitle: "",
        scopeCountText: "",
        searchMetricValue: "",
        searchNextCheck: "",
        spotlightAction: "",
        spotlightTitle: ""
      };
      const emptyStarter = {
        ...emptyRoute,
        buttonPresent: false,
        followupPresent: false,
        followupText: "",
        visibleFollowupActionCount: 0,
        visibleFollowupActionLabels: "",
        visibleFollowupCompletionPresent: false,
        visibleFollowupCompletionResult: "",
        visibleFollowupPrimaryPresent: false,
        visibleFollowupPrimaryResult: "",
        visibleFollowupReadinessPresent: false,
        visibleFollowupReadinessResult: "",
        visibleResultAudition: "",
        visibleResultMetricValue: "",
        visibleResultNextCheck: "",
        visibleResultPresent: false,
        visibleResultStatus: "",
        visibleResultTitle: ""
      };
      const emptyBridgeDirect = {
        buttonPresent: false,
        resultDestination: "",
        resultFollowup: "",
        resultMetric: "",
        resultPresent: false,
        resultTitle: ""
      };
      const emptyCommandReference = {
        contextHasDirectComposition: false,
        contextHasFollowupRoutes: false,
        contextHasResultMetric: false,
        contextHasStarterCommands: false,
        contextText: "",
        handoffButtonPresent: false,
        itemPresent: false,
        opened: false,
        quickActionsOpenedAfterHandoff: false,
        searchCountText: "",
        searchInputPresent: false,
        searchQuery: "",
        spotlightContext: "",
        spotlightDetail: "",
        spotlightId: "",
        spotlightLabel: "",
        targetHasAudienceTargets: false,
        targetText: ""
      };
      const workflowNavigatorJumpEvidence = await (async () => {
        const arrangeButton = document.querySelector('[data-testid="workflow-jump-arrange"]');
        const mixButton = document.querySelector('[data-testid="workflow-jump-mix"]');
        const deliverButton = document.querySelector('[data-testid="workflow-jump-deliver"]');
        const deliverTarget = document.querySelector('[data-testid="handoff-pack"]');
        const composeButton = document.querySelector('[data-testid="workflow-jump-compose"]');
        const composeTarget = document.querySelector('[data-testid="workflow-target-compose"]');
        const composeDrumsButton = document.querySelector('[data-testid="compose-page-tab-drums"]');
        const composeNotesButton = document.querySelector('[data-testid="compose-page-tab-notes"]');
        const composeInstrumentsButton = document.querySelector('[data-testid="compose-page-tab-instruments"]');
        const mixMixerButton = document.querySelector('[data-testid="mix-page-tab-mixer"]');
        const mixMasterButton = document.querySelector('[data-testid="mix-page-tab-master"]');
        const workflowNavigator = document.querySelector('[data-testid="workflow-navigator"]');
        const visible = (element) => Boolean(
          element &&
          element.getBoundingClientRect().width > 0 &&
          element.getBoundingClientRect().height > 0 &&
          element.closest('[hidden]') === null
        );
        const settle = () => new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
        arrangeButton?.click();
        await settle();
        const arrangeVisibility = {
          arrangementPatternControlsVisible: visible(arrangementPatternControls),
          arrangementShapeControlsVisible: visible(arrangementShapeControls),
          arrangementToolsToggleVisible: visible(arrangementToolsToggle),
          arrangementTrackStateControlsVisible: visible(arrangementTrackStateControls),
          blockMovesToggleVisible: visible(blockMovesToggle)
        };
        mixButton?.click();
        await settle();
        mixMixerButton?.click();
        await settle();
        const mixerVisibility = {
          mixerProcessingToggleVisible: visible(mixerProcessingToggle),
          mixMovesToggleVisible: visible(mixMovesToggle),
          mixReviewToggleVisible: visible(mixReviewToggle)
        };
        mixMasterButton?.click();
        await settle();
        const masterVisibility = {
          masterPolishToggleVisible: visible(masterPolishToggle),
          masterReviewToggleVisible: visible(masterReviewToggle)
        };
        mixMixerButton?.click();
        await settle();
        deliverButton?.click();
        await settle();
        const deliverRect = deliverTarget?.getBoundingClientRect() ?? null;
        const deliverVisibility = {
          deliveryAuditToggleVisible: visible(deliveryAuditToggle),
          deliveryDirectVisible: visible(deliveryDirect) && deliveryDirect?.closest('details:not([open])') === null,
          deliveryStatusToggleVisible: visible(deliveryStatusToggle)
        };
        composeButton?.click();
        await settle();
        composeNotesButton?.click();
        await settle();
        const notesVisibility = {
          captureIdeasTogglePresent: Boolean(captureIdeasToggle)
        };
        composeInstrumentsButton?.click();
        await settle();
        if (!chordCards.some((card) => card.dataset.editorOpen === "true")) {
          chordCards[0]?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));
          await settle();
        }
        const instrumentsVisibility = {
          chordSelectedEditorVisible: chordEditors.some(
            (editor, index) => chordCards[index]?.dataset.editorOpen === "true" && visible(editor)
          ),
          harmonyMovesToggleVisible: visible(harmonyMovesToggle),
          soundDesignToggleVisible: visible(soundDesignToggle)
        };
        composeDrumsButton?.click();
        await settle();
        const composeRect = composeTarget?.getBoundingClientRect() ?? null;
        const workflowNavigatorRect = workflowNavigator?.getBoundingClientRect() ?? null;
        return {
          ...arrangeVisibility,
          composeReady: Boolean(
            composeRect &&
            workflowNavigatorRect &&
            composeRect.top >= workflowNavigatorRect.bottom + 8 &&
            composeRect.top < window.innerHeight &&
            composeRect.bottom > 0
          ),
          deliverReady: Boolean(deliverRect && deliverRect.top < window.innerHeight && deliverRect.bottom > 0),
          ...deliverVisibility,
          ...instrumentsVisibility,
          ...masterVisibility,
          ...mixerVisibility,
          ...notesVisibility
        };
      })();
      const bridge = window.grooveforge;
      return {
        appKind: bridge?.appKind ?? null,
        bodyTextLength: bodyText.length,
        commandReference: emptyCommandReference,
        hasOpenProject: typeof bridge?.openProject === "function",
        hasPreloadBridge: Boolean(bridge),
        hasRoot: Boolean(document.querySelector("#root")),
        hasSaveProject: typeof bridge?.saveProject === "function",
        location: window.location.href,
        layout: {
          arrangementEssentialBeforeBlockMoves: follows(arrangementBars, blockMoves),
          arrangementPlaybackBeforeTimeline: follows(arrangementPlayback, arrangementTimeline),
          arrangementPlaybackPresent: Boolean(arrangementPlayback),
          arrangementPatternControlsVisible: workflowNavigatorJumpEvidence.arrangementPatternControlsVisible,
          arrangementShapeControlsVisible: workflowNavigatorJumpEvidence.arrangementShapeControlsVisible,
          arrangementTrackStateControlsVisible: workflowNavigatorJumpEvidence.arrangementTrackStateControlsVisible,
          arrangementTimelineBeforeEditor: follows(arrangementTimeline, selectedBlockEditor),
          arrangementTimelinePresent: Boolean(arrangementTimeline),
          arrangementToolsOpen: Boolean(arrangementTools?.open),
          arrangementToolsToggleVisible: workflowNavigatorJumpEvidence.arrangementToolsToggleVisible,
          audienceSessionActionsDirectVisible,
          audienceSessionProofContentHidden: audienceSessionProofInitiallyHidden && audienceSessionProofHiddenAgain,
          audienceSessionProofInteractionReady:
            !audienceSessionProofInitiallyOpen &&
            audienceSessionProofOpened &&
            audienceSessionProofContentVisible &&
            audienceSessionProofClosedAgain,
          audienceSessionProofOpen: Boolean(audienceSessionProofDetails?.open),
          audienceSessionProofRowsPreserved,
          audienceSessionProofToggleVisible,
          blockMovesBeforeArrangementTools: follows(blockMoves, arrangementTools),
          blockMovesOpen: Boolean(blockMoves?.open),
          blockMovesToggleVisible: workflowNavigatorJumpEvidence.blockMovesToggleVisible,
          chordCardCount: chordCards.length,
          chordCompactCardCount: chordCards.filter((card) => card.dataset.editorOpen === "false").length,
          chordCompactEditorsHidden: chordEditors
            .filter((_editor, index) => chordCards[index]?.dataset.editorOpen === "false")
            .every((editor) => editor.getBoundingClientRect().height === 0),
          chordEventsBeforeHarmonyMoves: follows(chordEventGrid, harmonyMoves),
          chordExpandedCardCount: chordCards.filter((card) => card.dataset.editorOpen === "true").length,
          chordSelectedEditorVisible: workflowNavigatorJumpEvidence.chordSelectedEditorVisible,
          chordsBeforeSoundDesign: follows(instrumentDirectChords, soundDesign),
          captureIdeasOpen: Boolean(captureIdeas?.open),
          captureIdeasTogglePresent: workflowNavigatorJumpEvidence.captureIdeasTogglePresent,
          deliveryAuditOpen: Boolean(deliveryAudit?.open),
          deliveryAuditToggleVisible: workflowNavigatorJumpEvidence.deliveryAuditToggleVisible,
          deliveryDirectBeforeStatus: follows(deliveryDirect, deliveryStatus),
          deliveryDirectVisible: workflowNavigatorJumpEvidence.deliveryDirectVisible,
          deliveryDirectPresent: Boolean(deliveryDirect),
          deliveryOutsideGuidance: Boolean(deliveryDirect && guidanceCenter && !guidanceCenter.contains(deliveryDirect)),
          deliveryStatusBeforeAudit: follows(deliveryStatus, deliveryAudit),
          deliveryStatusOpen: Boolean(deliveryStatus?.open),
          deliveryStatusToggleVisible: workflowNavigatorJumpEvidence.deliveryStatusToggleVisible,
          deliveryRouteBeforeDirect: follows(deliveryRoute, deliveryDirect),
          feedbackAfterGuidance: follows(guidanceCenter, feedbackAnchor),
          feedbackOutsideGuidance: Boolean(guidanceCenter && feedbackAnchor && !guidanceCenter.contains(feedbackAnchor)),
          guidanceCenterOpen: Boolean(guidanceCenter?.open),
          guideQuickStartDecisionVisible: Boolean(
            guideQuickStartDecision && guideQuickStartDecision.getBoundingClientRect().height > 0
          ),
          guideQuickStartDetailsContentHidden: Boolean(
            guideQuickStartDetailsContent && guideQuickStartDetailsContent.getBoundingClientRect().height === 0
          ),
          guideQuickStartDetailsInteractionReady:
            !guideQuickStartDetailsInitiallyOpen && guideQuickStartDetailsOpened && guideQuickStartDetailsClosedAgain,
          guideQuickStartDetailsOpen: Boolean(guideQuickStartDetails?.open),
          guideQuickStartDetailsToggleVisible: Boolean(
            guideQuickStartDetailsToggle && guideQuickStartDetailsToggle.getBoundingClientRect().height > 0
          ),
          harmonyMovesOpen: Boolean(harmonyMoves?.open),
          harmonyMovesToggleVisible: workflowNavigatorJumpEvidence.harmonyMovesToggleVisible,
          instrumentDirectChordsPresent: Boolean(instrumentDirectChords),
          launchpadActionCount: document.querySelectorAll(
            '[data-testid="first-run-start-beat"], [data-testid="first-run-producer-pass"], [data-testid="first-run-open-project"]'
          ).length,
          launchpadContentVisible: Boolean(launchpadContent && launchpadContent.getBoundingClientRect().height > 0),
          launchpadOpen: Boolean(launchpad?.open),
          launchpadToggleVisible: Boolean(launchpadToggle && launchpadToggle.getBoundingClientRect().height > 0),
          compactTransportDirectActionsReady: [
            beginnerStarter,
            producerStarter,
            firstRunOpenProject,
            transportPlay,
            quickActionsOpen,
            commandReferenceOpen,
            undoButton,
            redoButton,
            projectOpen,
            projectSave
          ].every((element) => Boolean(element && element.getBoundingClientRect().height > 0)),
          compactTransportHeight: initialTransportBandRect?.height ?? 0,
          compactTransportReady: Boolean(
            initialTransportBandRect &&
            initialTransportBandRect.height <= 300 &&
            initialLaunchpadContentRect &&
            initialLaunchpadContentRect.width > initialLaunchpadContentRect.height
          ),
          initialNavigatorStartsInViewport: Boolean(
            initialWorkflowNavigatorRect &&
            initialWorkflowNavigatorRect.top >= 0 &&
            initialWorkflowNavigatorRect.top < initialViewportHeight
          ),
          initialNavigatorTop: initialWorkflowNavigatorRect?.top ?? 0,
          launchpadHorizontalReady: Boolean(
            initialBeginnerStarterRect &&
            initialProducerStarterRect &&
            Math.abs(initialBeginnerStarterRect.top - initialProducerStarterRect.top) < 1 &&
            initialBeginnerStarterRect.right < initialProducerStarterRect.left
          ),
          transportSetupTopAligned: Boolean(
            initialBrandLockupRect &&
            initialTransportControlsRect &&
            Math.abs(initialBrandLockupRect.top - initialTransportControlsRect.top) < 1
          ),
          mixerBasicBalanceBeforeProcessing: follows(mixerVolume, mixerProcessing),
          mixerProcessingOpen: Boolean(mixerProcessing?.open),
          mixerProcessingToggleVisible: workflowNavigatorJumpEvidence.mixerProcessingToggleVisible,
          mixerStripsBeforeMixMoves: follows(mixerStrips, mixMoves),
          mixerStripsPresent: Boolean(mixerStrips),
          mixMovesBeforeReview: follows(mixMoves, mixReview),
          mixMovesOpen: Boolean(mixMoves?.open),
          mixMovesToggleVisible: workflowNavigatorJumpEvidence.mixMovesToggleVisible,
          mixReviewOpen: Boolean(mixReview?.open),
          mixReviewToggleVisible: workflowNavigatorJumpEvidence.mixReviewToggleVisible,
          masterCeilingBoundsReady: Boolean(
            masterCeilingInput &&
            masterCeilingInput.getAttribute("type") === "number" &&
            masterCeilingInput.getAttribute("min") === "-6" &&
            masterCeilingInput.getAttribute("max") === "0" &&
            masterCeilingInput.getAttribute("step") === "0.1"
          ),
          masterControlsBeforePolish: follows(masterOutputControls, masterPolish),
          masterOutputControlsPresent: Boolean(masterOutputControls),
          masterPolishBeforeReview: follows(masterPolish, masterReview),
          masterPolishOpen: Boolean(masterPolish?.open),
          masterPolishToggleVisible: workflowNavigatorJumpEvidence.masterPolishToggleVisible,
          masterMixCoachPresent: Boolean(masterMixCoach),
          masterMixCoachOpen: Boolean(masterMixCoach?.open),
          masterReviewOpen: Boolean(masterReview?.open),
          masterReviewQueuePresent: Boolean(masterReviewQueue),
          masterReviewQueueOpen: Boolean(masterReviewQueue?.open),
          masterReviewToggleVisible: workflowNavigatorJumpEvidence.masterReviewToggleVisible,
          masterRoleBeforeControls: follows(masterRole, masterOutputControls),
          patternLabOpen: Boolean(patternLab?.open),
          patternLabToggleVisible: Boolean(patternLabToggle && patternLabToggle.getBoundingClientRect().height > 0),
          projectOwnershipReady:
            initialProjectOwnership.projectStatus === "Editable 8-bar foundation" &&
            initialProjectOwnership.safetyStatus === "Editable now" &&
            initialProjectOwnership.safetyLabel === "Save to keep" &&
            initialProjectOwnership.safetyDetail === "Local project only",
          projectSafetyDetail: initialProjectOwnership.safetyDetail,
          projectSafetyLabel: initialProjectOwnership.safetyLabel,
          projectSafetyStatus: initialProjectOwnership.safetyStatus,
          projectStatus: initialProjectOwnership.projectStatus,
          quickActionGraphReady: appShell?.getAttribute('data-quick-actions-graph-state') === 'ready',
          noteLanesAfterCaptureIdeas: follows(captureIdeas, noteLanes),
          noteLanesPresent: Boolean(noteLanes),
          soundDesignOpen: Boolean(soundDesign?.open),
          soundDesignToggleVisible: workflowNavigatorJumpEvidence.soundDesignToggleVisible,
          selectedBlockEditorPresent: Boolean(selectedBlockEditor),
          stepGridAfterPatternLab: follows(patternLab, stepGrid),
          stepGridPresent: Boolean(stepGrid),
          swingFeelDarkThemeReady:
            swingFeelButtons.length === 5 &&
            swingFeelButtons.every((button) => {
              const style = getComputedStyle(button);
              return (
                style.appearance === 'none' &&
                style.backgroundColor !== 'rgb(239, 239, 239)' &&
                style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                style.borderRadius === '5px'
              );
            }),
          swingFeelPressedSemanticsReady:
            swingFeelButtons.length === 5 &&
            swingFeelButtons.every((button) => ['true', 'false'].includes(button.getAttribute('aria-pressed') ?? '')) &&
            swingFeelSelectedButtons[0]?.getAttribute('data-testid') === 'swing-feel-style' &&
            swingFeelSelectedButtons[0]?.classList.contains('selected') === true,
          swingFeelSelectedCount: swingFeelSelectedButtons.length,
          buttonThemeDisabledReady: (() => {
            if (!(chordPasteButton instanceof HTMLButtonElement) || !chordPasteButton.disabled) return false;
            const style = getComputedStyle(chordPasteButton);
            return style.appearance === 'none' && style.cursor === 'not-allowed' && Number(style.opacity) <= 0.48;
          })(),
          buttonThemeFoundationReady:
            buttonThemeRepresentatives.length === buttonThemeRepresentativeIds.length &&
            buttonThemeRepresentatives.every((button) => {
              const style = getComputedStyle(button);
              return (
                style.appearance === 'none' &&
                style.backgroundColor !== 'rgb(239, 239, 239)' &&
                style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                style.borderRadius === '5px' &&
                style.color !== 'rgb(0, 0, 0)'
              );
            }),
          buttonThemeNativeSurfaceCount: allButtons.filter((button) => {
            const style = getComputedStyle(button);
            return style.appearance !== 'none' || style.backgroundColor === 'rgb(239, 239, 239)';
          }).length,
          buttonThemeRepresentativeCount: buttonThemeRepresentatives.length,
          buttonThemeSpecialistStateReady: (() => {
            const selectedSwingStyle = swingFeelSelectedButtons[0] ? getComputedStyle(swingFeelSelectedButtons[0]) : null;
            const playStyle = transportPlay ? getComputedStyle(transportPlay) : null;
            return (
              selectedSwingStyle?.backgroundColor === 'rgba(120, 240, 200, 0.14)' &&
              playStyle?.backgroundColor === 'rgb(120, 240, 200)'
            );
          })(),
          essentialShortcutMetadataReady:
            quickActionsOpen?.getAttribute("aria-keyshortcuts") === "Control+K Meta+K" &&
            commandReferenceOpen?.getAttribute("aria-keyshortcuts") === "? Control+/ Meta+/" &&
            transportPlay?.getAttribute("aria-keyshortcuts") === "Space" &&
            undoButton?.getAttribute("aria-keyshortcuts") === "Control+Z Meta+Z" &&
            redoButton?.getAttribute("aria-keyshortcuts") === "Control+Y Meta+Y Control+Shift+Z Meta+Shift+Z" &&
            projectOpen?.getAttribute("aria-keyshortcuts") === "Control+O Meta+O" &&
            projectSave?.getAttribute("aria-keyshortcuts") === "Control+S Meta+S",
          essentialShortcutTitlesReady:
            quickActionsOpen?.getAttribute("title") === "Open Quick Actions (Ctrl/Cmd+K)" &&
            commandReferenceOpen?.getAttribute("title") === "Open Command Reference (? or Ctrl/Cmd+/)" &&
            transportPlay?.getAttribute("title") === "Play Song loop · 8 bars timeline · 82 BPM · Space" &&
            undoButton?.getAttribute("title") === "Undo last edit (Ctrl/Cmd+Z)" &&
            redoButton?.getAttribute("title") === "Redo last undone edit (Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y)" &&
            projectOpen?.getAttribute("title") === "Open project (Ctrl/Cmd+O)" &&
            projectSave?.getAttribute("title") === "Save project (Ctrl/Cmd+S)",
          patternShortcutMetadataReady: patternTabs.every(
            (tab, index) =>
              tab?.getAttribute("aria-keyshortcuts") === String(index + 1) &&
              tab?.getAttribute("title") ===
                "Edit Pattern " + ["A", "B", "C"][index] + " (" + String(index + 1) + ")"
          ),
          playPressedStateReady: transportPlay?.getAttribute("aria-pressed") === "false",
          transportEssentialsBeforeProject: follows(transportEssentialControls, projectEssentialControls),
          transportExportsContainWav: Boolean(transportExports && exportWav && transportExports.contains(exportWav)),
          transportExportsOpen: Boolean(transportExports?.open),
          transportExportsToggleVisible: Boolean(transportExportToggle && transportExportToggle.getBoundingClientRect().height > 0),
          transportPlayDirectVisible: Boolean(
            transportPlay &&
            transportPlay.getBoundingClientRect().height > 0 &&
            transportPlay.closest('details:not([open])') === null
          ),
          transportProjectBeforeSession: follows(projectEssentialControls, transportSession),
          transportSaveDirectVisible: Boolean(
            projectSave &&
            projectSave.getBoundingClientRect().height > 0 &&
            projectSave.closest('details:not([open])') === null
          ),
          transportSessionBeforeExports: follows(transportSession, transportExports),
          transportSessionOpen: Boolean(transportSession?.open),
          transportSessionToggleVisible: Boolean(transportSessionToggle && transportSessionToggle.getBoundingClientRect().height > 0),
          transportStatusBeforeEssentials: follows(transportStatusControls, transportEssentialControls),
          workflowNavigatorBeforeWorkspace: follows(workflowNavigator, workspaceGrid),
          workflowNavigatorComposeJumpReady: workflowNavigatorJumpEvidence.composeReady,
          workflowNavigatorDeliverJumpReady: workflowNavigatorJumpEvidence.deliverReady,
          workflowNavigatorOutsideGuidance: Boolean(
            workflowNavigator && guidanceCenter && !guidanceCenter.contains(workflowNavigator)
          ),
          workflowNavigatorPresent: Boolean(workflowNavigator),
          workflowNavigatorStageCount: document.querySelectorAll('[data-testid^="workflow-jump-"]').length,
          workflowNavigatorSticky: workflowNavigatorStyle?.position === "sticky" && workflowNavigatorStyle.top === "12px",
          workflowNavigatorVisible: Boolean(
            workflowNavigator &&
            workflowNavigator.getBoundingClientRect().height > 0 &&
            workflowNavigator.closest('details:not([open])') === null
          )
        },
        missingText: expectedText.filter((text) => !bodyText.includes(text)),
        bridgeDirect: {
          completion: emptyBridgeDirect,
          readiness: emptyBridgeDirect
        },
        palette: {
          arrangementTools: {
            guidedArrangementOpen: true,
            guidedBlockMovesOpen: true,
            resetArrangementOpen: true,
            resetBlockMovesOpen: true,
            studioArrangementOpen: false,
            studioBlockMovesFullWidth: false,
            studioBlockMovesOpen: false
          },
          captureIdeas: {
            autoReveal: false,
            initialOpen: true,
            resetOpen: true
          },
          chordCards: {
            restoreReady: false,
            selectionReady: false
          },
          instrumentTools: {
            guidedHarmonyOpen: true,
            guidedSoundOpen: true,
            resetHarmonyOpen: true,
            resetSoundOpen: true,
            studioHarmonyOpen: false,
            studioSoundOpen: false
          },
          mixerTools: {
            guidedMixMovesOpen: true,
            guidedMixReviewOpen: true,
            guidedProcessingOpen: true,
            resetMixMovesOpen: true,
            resetMixReviewOpen: true,
            resetProcessingOpen: true,
            studioMixMovesOpen: false,
            studioMixReviewOpen: false,
            studioProcessingOpen: false
          },
          masterTools: {
            guidedMasterMixCoachOpen: true,
            guidedMasterPolishOpen: true,
            guidedMasterReviewQueueOpen: true,
            guidedMasterReviewOpen: true,
            resetMasterMixCoachOpen: true,
            resetMasterPolishOpen: true,
            resetMasterReviewQueueOpen: true,
            resetMasterReviewOpen: true,
            routedMasterMixCoachOpen: false,
            routedMasterReviewQueueOpen: false,
            studioMasterMixCoachOpen: true,
            studioMasterPolishOpen: false,
            studioMasterReviewQueueOpen: true,
            studioMasterReviewOpen: false
          },
          deliveryTools: {
            guidedAuditOpen: true,
            guidedStatusOpen: true,
            resetAuditOpen: true,
            resetStatusOpen: true,
            studioAuditOpen: false,
            studioStatusOpen: false
          },
          transportTools: {
            guidedExportsOpen: true,
            guidedSessionOpen: true,
            resetExportsOpen: true,
            resetSessionOpen: true,
            studioExportsOpen: false,
            studioSessionOpen: false
          },
          launchpad: {
            collapsedAfterStarter: false,
            initialOpen: false,
            manualClose: false,
            manualReopen: false,
            sameStarterCollapse: false
          },
          completionBeginner: emptyRoute,
          completionProducer: emptyRoute,
          completionReadout: emptyRoute,
          dualBeginner: emptyRoute,
          dualProducer: emptyRoute,
          dualReadout: emptyRoute,
          guided: emptyRoute,
          opened: false,
          producer: emptyRoute,
          routeBridge: emptyRoute,
          routeBridgeCompletion: emptyRoute,
          routeBridgeReadiness: emptyRoute,
          starterBeginner: emptyStarter,
          starterProducer: emptyStarter,
          resultPresent: false,
          searchPresent: false
        },
        platform: bridge?.platform ?? null,
        readyState: document.readyState,
        rootChildCount: document.querySelector("#root")?.childElementCount ?? 0,
        samplingTextPresent: /AudioClipEvent|sample import|sample browser|chop pads|sampler track|audio clip/i.test(bodyText),
        testIds,
        title: document.title,
        viewport: {
          height: window.innerHeight,
          width: window.innerWidth
        }
      };
    })();
  `);
  return evidence as LaunchSmokeEvidence;
}

async function prepareLaunchSmokeBaseDomReadyPosture(win: BrowserWindow): Promise<void> {
  await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-mix");
  await waitForLaunchSmokeAudioAnalysisTabPosture(win, "mix");
  await waitForLaunchSmokeExactAudioAnalysis(win);
  await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-compose");
  await waitForLaunchSmokeAudioAnalysisTabPosture(win, "compose");
  const launchpadOpen = (await win.webContents.executeJavaScript(
    `document.querySelector('[data-testid="first-run-launchpad"]')?.open === true`
  )) as boolean;
  if (!launchpadOpen) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "first-run-launchpad-toggle");
  }
  const guideOpen = (await win.webContents.executeJavaScript(
    `document.querySelector('[data-testid="guidance-center"]')?.open === true`
  )) as boolean;
  if (!guideOpen) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
  }
  await waitForLaunchSmokePaletteSurfaceState(
    win,
    (surface) =>
      surface.activeZone === "compose" &&
      surface.guideOpen &&
      surface.audienceStarterActionsVisible &&
      surface.hookReady,
    "an exact-ready materialized Guide before base DOM collection"
  );
  await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
  const deadline = Date.now() + 30000;
  let state = { activeZone: "", analysis: "", guideOpen: true, launchpadOpen: false, selectedTabs: 0, visiblePanels: 0 };
  while (Date.now() < deadline) {
    state = (await win.webContents.executeJavaScript(`
      (() => {
        const visible = (target) => {
          if (!(target instanceof HTMLElement)) return false;
          const rect = target.getBoundingClientRect();
          const style = getComputedStyle(target);
          return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
        };
        const tabs = Array.from(document.querySelectorAll(
          '[role="tablist"][aria-label="Workstation function tabs"] [role="tab"]'
        ));
        const panels = ["compose", "arrange", "mix", "deliver"]
          .map((zone) => document.getElementById("workspace-panel-" + zone))
          .filter(Boolean);
        return {
          activeZone: tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.id?.replace("workspace-tab-", "") ?? "",
          analysis: document.querySelector("main.app-shell")?.getAttribute("data-audio-analysis-state") ?? "",
          guideOpen: document.querySelector('[data-testid="guidance-center"]')?.open === true,
          launchpadOpen: document.querySelector('[data-testid="first-run-launchpad"]')?.open === true,
          selectedTabs: tabs.filter((tab) => tab.getAttribute("aria-selected") === "true").length,
          visiblePanels: panels.filter((panel) => !panel.hidden && visible(panel)).length
        };
      })();
    `)) as typeof state;
    if (
      state.activeZone === "compose" &&
      state.analysis === "ready" &&
      !state.guideOpen &&
      state.launchpadOpen &&
      state.selectedTabs === 1 &&
      state.visiblePanels === 1
    ) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Base DOM exact-ready Compose posture did not settle: ${JSON.stringify(state)}`);
}

function collectLaunchSmokeEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokeEvidence> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out preparing and collecting launch smoke DOM evidence.")), 120000);
    void prepareLaunchSmokeBaseDomReadyPosture(win)
      .then(() => collectLaunchSmokeEvidence(win))
      .then((evidence) => {
        clearTimeout(timeout);
        resolve(evidence);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

type LaunchSmokeVisibleModeToolEvidence = {
  arrangementTools: LaunchSmokeArrangementToolsEvidence;
  deliveryTools: LaunchSmokeDeliveryToolsEvidence;
  instrumentTools: LaunchSmokeInstrumentToolsEvidence;
  masterTools: Omit<LaunchSmokeMasterToolsEvidence, "routedMasterMixCoachOpen" | "routedMasterReviewQueueOpen">;
  mixerTools: LaunchSmokeMixerToolsEvidence;
  transportTools: LaunchSmokeTransportToolsEvidence;
};

type LaunchSmokeModeToolZoneState = {
  activePage: string;
  activeZone: LaunchSmokeFunctionalTabZone | "";
  arrangementOpen: boolean;
  auditOpen: boolean;
  blockMovesFullWidth: boolean;
  blockMovesOpen: boolean;
  exportsOpen: boolean;
  harmonyOpen: boolean;
  masterMixCoachOpen: boolean;
  masterPolishOpen: boolean;
  masterReviewOpen: boolean;
  masterReviewQueueOpen: boolean;
  mixMovesOpen: boolean;
  mixReviewOpen: boolean;
  processingOpen: boolean;
  sessionOpen: boolean;
  soundOpen: boolean;
  statusOpen: boolean;
  surfaceVisible: boolean;
  visibleControlCount: number;
};

async function setLaunchSmokeVisibleModeToolPosture(win: BrowserWindow, mode: "guided" | "studio"): Promise<void> {
  const ready = (await win.webContents.executeJavaScript(`
    (async () => {
      const setter = window.__grooveforgeLaunchSmoke?.setModeAwareToolPanels;
      if (typeof setter !== "function") return false;
      setter(${JSON.stringify(mode)});
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return true;
    })();
  `)) as boolean;
  if (!ready) {
    throw new Error(`Mode-aware tool handler was unavailable while selecting ${mode}.`);
  }
}

async function readLaunchSmokeModeToolZoneState(win: BrowserWindow): Promise<LaunchSmokeModeToolZoneState> {
  return (await win.webContents.executeJavaScript(`
    (() => {
      const activeZone =
        document.querySelector('[role="tab"][aria-selected="true"]')?.id?.replace("workspace-tab-", "") ?? "";
      const visible = (target) => {
        if (!(target instanceof HTMLElement)) return false;
        const rect = target.getBoundingClientRect();
        const style = getComputedStyle(target);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      const details = (testId) => document.querySelector('[data-testid="' + testId + '"]');
      const open = (testId) => details(testId) instanceof HTMLDetailsElement && details(testId).open;
      const zoneSurfaceIds = {
        arrange: "workflow-target-arrange",
        compose: "workflow-target-sound",
        deliver: "handoff-pack",
        mix: document.querySelector('[data-testid="mix-page-tab-master"]')?.getAttribute("aria-selected") === "true"
          ? "workflow-target-master"
          : "workflow-target-mix"
      };
      const zoneControlIds = {
        arrange: ["block-moves-toggle", "arrangement-tools-toggle"],
        compose: ["harmony-moves-toggle", "sound-design-toggle"],
        deliver: ["handoff-status-toggle", "handoff-audit-toggle"],
        mix: document.querySelector('[data-testid="mix-page-tab-master"]')?.getAttribute("aria-selected") === "true"
          ? ["master-polish-toggle", "master-review-toggle"]
          : ["mixer-processing-toggle-drum_rack", "mix-moves-toggle", "mix-review-toggle"]
      };
      const blockMoves = details("block-moves");
      const blockMovesStyle = blockMoves instanceof HTMLElement ? getComputedStyle(blockMoves) : null;
      return {
        activePage:
          activeZone === "compose"
            ? document.querySelector('[role="tablist"][aria-label="Compose editor pages"] [role="tab"][aria-selected="true"]')
                ?.id?.replace("compose-page-tab-", "") ?? ""
            : activeZone === "mix"
              ? document.querySelector('[role="tablist"][aria-label="Mix editor pages"] [role="tab"][aria-selected="true"]')
                  ?.id?.replace("mix-page-tab-", "") ?? ""
              : "",
        activeZone,
        arrangementOpen: open("arrangement-tools"),
        auditOpen: open("handoff-audit-tools"),
        blockMovesFullWidth:
          blockMovesStyle?.gridColumnStart === "1" && blockMovesStyle.gridColumnEnd === "-1",
        blockMovesOpen: open("block-moves"),
        exportsOpen: open("transport-export-tools"),
        harmonyOpen: open("harmony-moves"),
        masterMixCoachOpen: open("master-mix-coach-tools"),
        masterPolishOpen: open("master-polish-tools"),
        masterReviewOpen: open("master-review-tools"),
        masterReviewQueueOpen: open("master-review-queue-tools"),
        mixMovesOpen: open("mix-moves"),
        mixReviewOpen: open("mix-review-tools"),
        processingOpen: open("mixer-processing-drum_rack"),
        sessionOpen: open("transport-session-tools"),
        soundOpen: open("sound-design-tools"),
        statusOpen: open("handoff-status-tools"),
        surfaceVisible: visible(details(zoneSurfaceIds[activeZone])),
        visibleControlCount: (zoneControlIds[activeZone] ?? []).filter((testId) => visible(details(testId))).length
      };
    })();
  `)) as LaunchSmokeModeToolZoneState;
}

async function waitForLaunchSmokeModeToolZoneState(
  win: BrowserWindow,
  zone: LaunchSmokeFunctionalTabZone,
  predicate: (state: LaunchSmokeModeToolZoneState) => boolean,
  expectedState: string
): Promise<LaunchSmokeModeToolZoneState> {
  const deadline = Date.now() + launchSmokePaletteUiSettleTimeoutMs;
  let state = await readLaunchSmokeModeToolZoneState(win);
  const expectedControlCount = (current: LaunchSmokeModeToolZoneState): number =>
    zone === "mix" ? (current.activePage === "master" ? 2 : 3) : 2;
  while (
    Date.now() < deadline &&
    !(
      state.activeZone === zone &&
      state.surfaceVisible &&
      state.visibleControlCount >= expectedControlCount(state) &&
      predicate(state)
    )
  ) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    state = await readLaunchSmokeModeToolZoneState(win);
  }
  if (
    !(
      state.activeZone === zone &&
      state.surfaceVisible &&
      state.visibleControlCount >= expectedControlCount(state) &&
      predicate(state)
    )
  ) {
    throw new Error(`Mode-aware ${zone} surface did not reach ${expectedState}: ${JSON.stringify(state)}`);
  }
  return state;
}

async function activateLaunchSmokeModeToolZone(
  win: BrowserWindow,
  zone: LaunchSmokeFunctionalTabZone
): Promise<LaunchSmokeModeToolZoneState> {
  const state = await readLaunchSmokeModeToolZoneState(win);
  if (state.activeZone !== zone) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, `workflow-jump-${zone}`);
  }
  if (zone === "compose") {
    await activateLaunchSmokeWorkspacePage(win, "compose", "instruments");
  } else if (zone === "mix") {
    await activateLaunchSmokeWorkspacePage(win, "mix", "mixer");
  }
  return waitForLaunchSmokeModeToolZoneState(win, zone, () => true, "an active visible surface with its controls");
}

async function collectLaunchSmokeVisibleModeToolEvidence(
  win: BrowserWindow
): Promise<LaunchSmokeVisibleModeToolEvidence> {
  const initialState = await readLaunchSmokeModeToolZoneState(win);
  const originalZone = initialState.activeZone || "compose";
  const originalComposePage = (await readLaunchSmokeWorkspacePageState(win, "compose")).activePage;
  const originalMixPage = (await readLaunchSmokeWorkspacePageState(win, "mix")).activePage;
  try {
    await setLaunchSmokeVisibleModeToolPosture(win, "guided");
    await activateLaunchSmokeModeToolZone(win, "compose");
    const guidedCompose = await waitForLaunchSmokeModeToolZoneState(
      win,
      "compose",
      (state) => !state.harmonyOpen && !state.soundOpen,
      "collapsed Guided instrument tools"
    );
    await activateLaunchSmokeModeToolZone(win, "arrange");
    const guidedArrange = await waitForLaunchSmokeModeToolZoneState(
      win,
      "arrange",
      (state) => !state.arrangementOpen && !state.blockMovesOpen,
      "collapsed Guided arrangement tools"
    );
    await activateLaunchSmokeModeToolZone(win, "mix");
    const guidedMix = await waitForLaunchSmokeModeToolZoneState(
      win,
      "mix",
      (state) =>
        !state.processingOpen &&
        !state.mixMovesOpen &&
        !state.mixReviewOpen &&
        !state.masterPolishOpen &&
        !state.masterReviewOpen &&
        !state.masterReviewQueueOpen &&
        !state.masterMixCoachOpen,
      "collapsed Guided mixer and master tools"
    );
    await activateLaunchSmokeWorkspacePage(win, "mix", "master");
    const guidedMaster = await waitForLaunchSmokeModeToolZoneState(
      win,
      "mix",
      (state) =>
        state.activePage === "master" &&
        !state.masterPolishOpen &&
        !state.masterReviewOpen &&
        !state.masterReviewQueueOpen &&
        !state.masterMixCoachOpen,
      "collapsed Guided master tools on the visible Master page"
    );
    await activateLaunchSmokeModeToolZone(win, "deliver");
    const guidedDeliver = await waitForLaunchSmokeModeToolZoneState(
      win,
      "deliver",
      (state) => !state.statusOpen && !state.auditOpen,
      "collapsed Guided delivery tools"
    );

    await setLaunchSmokeVisibleModeToolPosture(win, "guided");
    await activateLaunchSmokeModeToolZone(win, "compose");
    await setLaunchSmokeVisibleModeToolPosture(win, "studio");
    const studioCompose = await waitForLaunchSmokeModeToolZoneState(
      win,
      "compose",
      (state) => state.harmonyOpen && state.soundOpen,
      "expanded Studio instrument tools"
    );
    await setLaunchSmokeVisibleModeToolPosture(win, "guided");
    await activateLaunchSmokeModeToolZone(win, "arrange");
    await setLaunchSmokeVisibleModeToolPosture(win, "studio");
    const studioArrange = await waitForLaunchSmokeModeToolZoneState(
      win,
      "arrange",
      (state) => state.arrangementOpen && state.blockMovesOpen && state.blockMovesFullWidth,
      "expanded Studio arrangement tools"
    );
    await setLaunchSmokeVisibleModeToolPosture(win, "guided");
    await activateLaunchSmokeModeToolZone(win, "mix");
    await setLaunchSmokeVisibleModeToolPosture(win, "studio");
    const studioMix = await waitForLaunchSmokeModeToolZoneState(
      win,
      "mix",
      (state) =>
        state.processingOpen &&
        state.mixMovesOpen &&
        state.mixReviewOpen &&
        state.masterPolishOpen &&
        state.masterReviewOpen &&
        !state.masterReviewQueueOpen &&
        !state.masterMixCoachOpen,
      "expanded Studio mixer and master tools with compact nested diagnostics"
    );
    await activateLaunchSmokeWorkspacePage(win, "mix", "master");
    const studioMaster = await waitForLaunchSmokeModeToolZoneState(
      win,
      "mix",
      (state) =>
        state.activePage === "master" &&
        state.masterPolishOpen &&
        state.masterReviewOpen &&
        !state.masterReviewQueueOpen &&
        !state.masterMixCoachOpen,
      "expanded Studio master tools with compact nested diagnostics on the visible Master page"
    );
    await setLaunchSmokeVisibleModeToolPosture(win, "guided");
    await activateLaunchSmokeModeToolZone(win, "deliver");
    await setLaunchSmokeVisibleModeToolPosture(win, "studio");
    const studioDeliver = await waitForLaunchSmokeModeToolZoneState(
      win,
      "deliver",
      (state) => state.statusOpen && state.auditOpen,
      "expanded Studio delivery tools"
    );

    await setLaunchSmokeVisibleModeToolPosture(win, "guided");
    await activateLaunchSmokeModeToolZone(win, "compose");
    const resetCompose = await waitForLaunchSmokeModeToolZoneState(
      win,
      "compose",
      (state) => !state.harmonyOpen && !state.soundOpen,
      "reset Guided instrument tools"
    );
    await activateLaunchSmokeModeToolZone(win, "arrange");
    const resetArrange = await waitForLaunchSmokeModeToolZoneState(
      win,
      "arrange",
      (state) => !state.arrangementOpen && !state.blockMovesOpen,
      "reset Guided arrangement tools"
    );
    await activateLaunchSmokeModeToolZone(win, "mix");
    const resetMix = await waitForLaunchSmokeModeToolZoneState(
      win,
      "mix",
      (state) =>
        !state.processingOpen &&
        !state.mixMovesOpen &&
        !state.mixReviewOpen &&
        !state.masterPolishOpen &&
        !state.masterReviewOpen &&
        !state.masterReviewQueueOpen &&
        !state.masterMixCoachOpen,
      "reset Guided mixer and master tools"
    );
    await activateLaunchSmokeWorkspacePage(win, "mix", "master");
    const resetMaster = await waitForLaunchSmokeModeToolZoneState(
      win,
      "mix",
      (state) =>
        state.activePage === "master" &&
        !state.masterPolishOpen &&
        !state.masterReviewOpen &&
        !state.masterReviewQueueOpen &&
        !state.masterMixCoachOpen,
      "reset Guided master tools on the visible Master page"
    );
    await activateLaunchSmokeModeToolZone(win, "deliver");
    const resetDeliver = await waitForLaunchSmokeModeToolZoneState(
      win,
      "deliver",
      (state) => !state.statusOpen && !state.auditOpen,
      "reset Guided delivery tools"
    );

    return {
      arrangementTools: {
        guidedArrangementOpen: guidedArrange.arrangementOpen,
        guidedBlockMovesOpen: guidedArrange.blockMovesOpen,
        resetArrangementOpen: resetArrange.arrangementOpen,
        resetBlockMovesOpen: resetArrange.blockMovesOpen,
        studioArrangementOpen: studioArrange.arrangementOpen,
        studioBlockMovesFullWidth: studioArrange.blockMovesFullWidth,
        studioBlockMovesOpen: studioArrange.blockMovesOpen
      },
      deliveryTools: {
        guidedAuditOpen: guidedDeliver.auditOpen,
        guidedStatusOpen: guidedDeliver.statusOpen,
        resetAuditOpen: resetDeliver.auditOpen,
        resetStatusOpen: resetDeliver.statusOpen,
        studioAuditOpen: studioDeliver.auditOpen,
        studioStatusOpen: studioDeliver.statusOpen
      },
      instrumentTools: {
        guidedHarmonyOpen: guidedCompose.harmonyOpen,
        guidedSoundOpen: guidedCompose.soundOpen,
        resetHarmonyOpen: resetCompose.harmonyOpen,
        resetSoundOpen: resetCompose.soundOpen,
        studioHarmonyOpen: studioCompose.harmonyOpen,
        studioSoundOpen: studioCompose.soundOpen
      },
      masterTools: {
        guidedMasterMixCoachOpen: guidedMaster.masterMixCoachOpen,
        guidedMasterPolishOpen: guidedMaster.masterPolishOpen,
        guidedMasterReviewOpen: guidedMaster.masterReviewOpen,
        guidedMasterReviewQueueOpen: guidedMaster.masterReviewQueueOpen,
        resetMasterMixCoachOpen: resetMaster.masterMixCoachOpen,
        resetMasterPolishOpen: resetMaster.masterPolishOpen,
        resetMasterReviewOpen: resetMaster.masterReviewOpen,
        resetMasterReviewQueueOpen: resetMaster.masterReviewQueueOpen,
        studioMasterMixCoachOpen: studioMaster.masterMixCoachOpen,
        studioMasterPolishOpen: studioMaster.masterPolishOpen,
        studioMasterReviewOpen: studioMaster.masterReviewOpen,
        studioMasterReviewQueueOpen: studioMaster.masterReviewQueueOpen
      },
      mixerTools: {
        guidedMixMovesOpen: guidedMix.mixMovesOpen,
        guidedMixReviewOpen: guidedMix.mixReviewOpen,
        guidedProcessingOpen: guidedMix.processingOpen,
        resetMixMovesOpen: resetMix.mixMovesOpen,
        resetMixReviewOpen: resetMix.mixReviewOpen,
        resetProcessingOpen: resetMix.processingOpen,
        studioMixMovesOpen: studioMix.mixMovesOpen,
        studioMixReviewOpen: studioMix.mixReviewOpen,
        studioProcessingOpen: studioMix.processingOpen
      },
      transportTools: {
        guidedExportsOpen: guidedDeliver.exportsOpen,
        guidedSessionOpen: guidedDeliver.sessionOpen,
        resetExportsOpen: resetDeliver.exportsOpen,
        resetSessionOpen: resetDeliver.sessionOpen,
        studioExportsOpen: studioDeliver.exportsOpen,
        studioSessionOpen: studioDeliver.sessionOpen
      }
    };
  } finally {
    await setLaunchSmokeVisibleModeToolPosture(win, "guided").catch(() => undefined);
    if (originalComposePage) {
      await activateLaunchSmokeWorkspacePage(
        win,
        "compose",
        originalComposePage as LaunchSmokeComposeWorkspacePage
      ).catch(() => undefined);
    }
    if (originalMixPage) {
      await activateLaunchSmokeWorkspacePage(win, "mix", originalMixPage as LaunchSmokeMixWorkspacePage).catch(
        () => undefined
      );
    }
    const state = await readLaunchSmokeModeToolZoneState(win).catch(() => null);
    if (state && state.activeZone !== originalZone) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, `workflow-jump-${originalZone}`).catch(() => undefined);
    }
  }
}

async function collectLaunchSmokeNativeChordCardEvidence(win: BrowserWindow): Promise<LaunchSmokeChordCardEvidence> {
  const originalZone = (await win.webContents.executeJavaScript(
    `document.querySelector('[role="tablist"][aria-label="Workstation function tabs"] [role="tab"][aria-selected="true"]')?.id?.replace("workspace-tab-", "") ?? "compose"`
  )) as LaunchSmokeFunctionalTabZone;
  const originalComposePage = (await readLaunchSmokeWorkspacePageState(win, "compose")).activePage;
  await activateLaunchSmokeWorkspacePage(win, "compose", "instruments");
  try {
  const chordTargets = (await win.webContents.executeJavaScript(`
    (() => {
      const cards = Array.from(document.querySelectorAll('[data-testid^="chord-slot-"]'));
      const initial = cards.find((card) => card instanceof HTMLElement && card.dataset.editorOpen === "true");
      const target = cards.find((card) => card instanceof HTMLElement && card.dataset.editorOpen === "false");
      return {
        initialTestId: initial instanceof HTMLElement ? initial.dataset.testid ?? "" : "",
        targetTestId: target instanceof HTMLElement ? target.dataset.testid ?? "" : ""
      };
    })();
  `)) as { initialTestId: string; targetTestId: string };
  if (!chordTargets.initialTestId || !chordTargets.targetTestId) {
    return { restoreReady: false, selectionReady: false };
  }

  const focusChordCard = async (testId: string): Promise<boolean> =>
    (await win.webContents.executeJavaScript(`
      (() => {
        const target = document.querySelector('[data-testid=${JSON.stringify(testId)}]');
        if (!(target instanceof HTMLElement)) return false;
        target.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
        const rect = target.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        target.focus({ preventScroll: true });
        return document.activeElement === target;
      })();
    `)) as boolean;
  const waitForChordSelection = async (testId: string): Promise<boolean> => {
    const editorTestId = testId.replace("chord-slot-", "chord-event-editor-");
    const deadline = Date.now() + launchSmokePaletteUiSettleTimeoutMs;
    let ready = false;
    while (Date.now() < deadline && !ready) {
      ready = (await win.webContents.executeJavaScript(`
        (() => {
          const card = document.querySelector('[data-testid=${JSON.stringify(testId)}]');
          const editor = document.querySelector('[data-testid=${JSON.stringify(editorTestId)}]');
          const rect = editor?.getBoundingClientRect() ?? null;
          return card instanceof HTMLElement && card.dataset.editorOpen === "true" && Boolean(rect && rect.width > 0 && rect.height > 0);
        })();
      `)) as boolean;
      if (!ready) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
    return ready;
  };

  if (!(await focusChordCard(chordTargets.targetTestId))) {
    return { restoreReady: false, selectionReady: false };
  }
  await sendLaunchSmokeFunctionalTabNativeKey(win, "Enter");
  const selectionReady = await waitForChordSelection(chordTargets.targetTestId);
  if (!(await focusChordCard(chordTargets.initialTestId))) {
    return { restoreReady: false, selectionReady };
  }
  await sendLaunchSmokeFunctionalTabNativeKey(win, "Space");
  const restoreReady = await waitForChordSelection(chordTargets.initialTestId);
  return { restoreReady, selectionReady };
  } finally {
    if (originalComposePage) {
      await activateLaunchSmokeWorkspacePage(
        win,
        "compose",
        originalComposePage as LaunchSmokeComposeWorkspacePage
      ).catch(() => undefined);
    }
    const activeZone = (await win.webContents.executeJavaScript(
      `document.querySelector('[role="tablist"][aria-label="Workstation function tabs"] [role="tab"][aria-selected="true"]')?.id?.replace("workspace-tab-", "") ?? ""`
    ).catch(() => "")) as string;
    if (activeZone !== originalZone) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, `workflow-jump-${originalZone}`).catch(() => undefined);
    }
  }
}

async function readLaunchSmokePaletteSurfaceState(win: BrowserWindow): Promise<{
  activeComposePage: string;
  activeMixPage: string;
  activeZone: LaunchSmokeFunctionalTabZone | "";
  audienceStarterActionsVisible: boolean;
  captureIdeasVisible: boolean;
  guideOpen: boolean;
  hookReady: boolean;
}> {
  return (await win.webContents.executeJavaScript(`
    (() => {
      const visible = (target) => {
        if (!(target instanceof HTMLElement)) return false;
        const rect = target.getBoundingClientRect();
        const style = getComputedStyle(target);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      const activeTab = document.querySelector('[role="tab"][aria-selected="true"]');
      const guide = document.querySelector('[data-testid="guidance-center"]');
      return {
        activeComposePage:
          document.querySelector('[role="tablist"][aria-label="Compose editor pages"] [role="tab"][aria-selected="true"]')
            ?.id?.replace("compose-page-tab-", "") ?? "",
        activeMixPage:
          document.querySelector('[role="tablist"][aria-label="Mix editor pages"] [role="tab"][aria-selected="true"]')
            ?.id?.replace("mix-page-tab-", "") ?? "",
        activeZone: activeTab?.id?.replace("workspace-tab-", "") ?? "",
        audienceStarterActionsVisible:
          visible(document.querySelector('[data-testid="audience-starter-action-beginner"]')) &&
          visible(document.querySelector('[data-testid="audience-starter-action-producer"]')),
        captureIdeasVisible: visible(document.querySelector('[data-testid="capture-ideas"]')),
        guideOpen: guide instanceof HTMLDetailsElement && guide.open,
        hookReady: typeof window.__grooveforgeLaunchSmoke?.collectAudienceSessionQuickActionEvidence === "function"
      };
    })();
  `)) as {
    activeComposePage: string;
    activeMixPage: string;
    activeZone: LaunchSmokeFunctionalTabZone | "";
    audienceStarterActionsVisible: boolean;
    captureIdeasVisible: boolean;
    guideOpen: boolean;
    hookReady: boolean;
  };
}

async function waitForLaunchSmokePaletteSurfaceState(
  win: BrowserWindow,
  predicate: (state: Awaited<ReturnType<typeof readLaunchSmokePaletteSurfaceState>>) => boolean,
  expectedState: string
): Promise<void> {
  const deadline = Date.now() + launchSmokePaletteUiSettleTimeoutMs;
  let state = await readLaunchSmokePaletteSurfaceState(win);
  while (Date.now() < deadline && !predicate(state)) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    state = await readLaunchSmokePaletteSurfaceState(win);
  }
  if (!predicate(state)) {
    throw new Error(`Quick Actions palette surfaces did not reach ${expectedState}: ${JSON.stringify(state)}`);
  }
}

async function runLaunchSmokePaletteStage<T>(
  win: BrowserWindow,
  timings: LaunchSmokePaletteStageTiming[],
  id: string,
  action: () => Promise<T>,
  onStage: (stage: string) => void
): Promise<T> {
  onStage(id);
  await win.webContents.executeJavaScript(
    `window.__grooveforgeLaunchSmokePaletteStep = ${JSON.stringify(id)}`
  );
  const startedAt = Date.now();
  try {
    return await action();
  } finally {
    timings.push({ durationMs: Date.now() - startedAt, id });
  }
}

async function refreshLaunchSmokeAudienceStarterAudio(
  win: BrowserWindow,
  starterId: "beginner" | "producer"
): Promise<LaunchSmokeAudienceStarterAudioRefreshEvidence> {
  const expectedTitle = starterId === "beginner" ? "First Guided Beat" : "Producer Fast Pass";
  const expectedMode = starterId === "beginner" ? "guided" : "studio";
  const projectDeadline = Date.now() + launchSmokePaletteUiSettleTimeoutMs;
  let projectState = { modeSelected: false, title: "" };
  while (Date.now() < projectDeadline) {
    projectState = (await win.webContents.executeJavaScript(`
      (() => ({
        modeSelected: document.querySelector('[data-testid="mode-${expectedMode}"]')?.classList.contains("selected") === true,
        title: document.querySelector('[data-testid="project-title-input"]')?.value ?? ""
      }))();
    `)) as typeof projectState;
    if (projectState.title === expectedTitle && projectState.modeSelected) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (projectState.title !== expectedTitle || !projectState.modeSelected) {
    throw new Error(`Audience Starter ${starterId} project did not settle before exact audio refresh: ${JSON.stringify(projectState)}`);
  }

  await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-mix");
  await waitForLaunchSmokeAudioAnalysisTabPosture(win, "mix");
  const exact = await waitForLaunchSmokeExactAudioAnalysis(win);
  await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-compose");
  const restored = await waitForLaunchSmokeAudioAnalysisTabPosture(win, "compose");
  await activateLaunchSmokeWorkspacePage(win, "compose", "notes");
  const composeState = await readLaunchSmokePaletteSurfaceState(win);
  if (!composeState.guideOpen) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
  }
  await waitForLaunchSmokePaletteSurfaceState(
    win,
    (state) =>
      state.activeZone === "compose" &&
      state.guideOpen &&
      state.captureIdeasVisible &&
      state.audienceStarterActionsVisible &&
      state.hookReady,
    `the exact-ready ${starterId} Audience Starter result on visible Compose and Guide surfaces`
  );
  return {
    exactState: exact.state,
    guideOpen: true,
    projectMode: expectedMode,
    projectTitle: projectState.title,
    restored,
    retryRequested: exact.retryRequested,
    starterActionsVisible: true
  };
}

async function waitForLaunchSmokeAudienceStarterVisibleResult(
  win: BrowserWindow,
  starterId: "beginner" | "producer"
): Promise<void> {
  const expectedAction = `audience-starter-${starterId}`;
  const expectedFollowups = starterId === "beginner" ? 2 : 3;
  const deadline = Date.now() + launchSmokePaletteUiSettleTimeoutMs;
  let state = { action: "", followups: 0, resultVisible: false };
  while (Date.now() < deadline) {
    state = (await win.webContents.executeJavaScript(`
      (() => {
        const result = document.querySelector('[data-testid="audience-starter-result"]');
        const rect = result?.getBoundingClientRect() ?? null;
        return {
          action: result?.getAttribute("data-audience-starter-result") ?? "",
          followups: document.querySelectorAll('[data-testid^="audience-starter-result-followup-"]').length,
          resultVisible: Boolean(rect && rect.width > 0 && rect.height > 0)
        };
      })();
    `)) as typeof state;
    if (state.action === expectedAction && state.followups === expectedFollowups && state.resultVisible) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Audience Starter ${starterId} visible result did not settle: ${JSON.stringify(state)}`);
}

async function readLaunchSmokeAudienceStarterVisibleEvidence(
  win: BrowserWindow,
  starterId: "beginner" | "producer"
): Promise<Omit<LaunchSmokeAudienceStarterVisibleEvidence, "visibleFollowupCompletionResult" | "visibleFollowupPrimaryResult" | "visibleFollowupReadinessResult">> {
  return (await win.webContents.executeJavaScript(`
    (() => {
      const text = (selector) => document.querySelector(selector)?.textContent?.trim() ?? "";
      const visible = (target) => {
        if (!(target instanceof HTMLElement)) return false;
        const rect = target.getBoundingClientRect();
        const style = getComputedStyle(target);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      const starterId = ${JSON.stringify(starterId)};
      const action = document.querySelector('[data-testid="audience-starter-action-' + starterId + '"]');
      const followupText = text('[data-testid="audience-starter-followup-' + starterId + '"]');
      const buttons = Array.from(document.querySelectorAll('[data-testid^="audience-starter-result-followup-"]'));
      const routes = new Set(buttons.map((button) => button.getAttribute("data-audience-starter-followup-route") ?? ""));
      return {
        buttonPresent: visible(action),
        followupPresent: followupText.length > 0,
        followupText,
        visibleFollowupActionCount: buttons.filter(visible).length,
        visibleFollowupActionLabels: buttons.map((button) => button.textContent?.trim() ?? "").filter(Boolean).join(" / "),
        visibleFollowupCompletionPresent: routes.has("completion"),
        visibleFollowupPrimaryPresent: routes.has("primary"),
        visibleFollowupReadinessPresent: routes.has("readiness"),
        visibleResultAudition: text('[data-testid="audience-starter-result-audition"]'),
        visibleResultMetricValue: text('[data-testid="audience-starter-result-metric-value"]'),
        visibleResultNextCheck: text('[data-testid="audience-starter-result-next-check"]'),
        visibleResultPresent: visible(document.querySelector('[data-testid="audience-starter-result"]')),
        visibleResultStatus: text('[data-testid="audience-starter-result-status"]'),
        visibleResultTitle: text('[data-testid="audience-starter-result-title"]')
      };
    })();
  `)) as Omit<
    LaunchSmokeAudienceStarterVisibleEvidence,
    "visibleFollowupCompletionResult" | "visibleFollowupPrimaryResult" | "visibleFollowupReadinessResult"
  >;
}

async function clickLaunchSmokeAudienceStarterFollowup(
  win: BrowserWindow,
  starterId: "beginner" | "producer",
  route: "completion" | "primary" | "readiness"
): Promise<string> {
  const target =
    starterId === "beginner"
      ? route === "primary"
        ? { label: "First Beat Path", testId: "first-beat-path", textId: "first-beat-path-headline" }
        : { label: "Dual Audience Readiness", testId: "dual-audience-readiness", textId: "dual-audience-readiness-headline" }
      : route === "primary"
        ? { label: "Review Queue", testId: "review-queue", textId: "review-queue-headline" }
        : route === "readiness"
          ? { label: "Export Preflight", testId: "export-preflight", textId: "export-preflight-headline" }
          : { label: "Handoff Package Check", testId: "handoff-package-check", textId: "handoff-package-check-headline" };
  await clickLaunchSmokeFunctionalTabNativeTarget(win, `audience-starter-result-followup-${route}`);
  const deadline = Date.now() + launchSmokePaletteUiSettleTimeoutMs;
  let state = { text: "", visible: false };
  while (Date.now() < deadline) {
    state = (await win.webContents.executeJavaScript(`
      (() => {
        const target = document.querySelector('[data-testid=${JSON.stringify(target.testId)}]');
        const rect = target?.getBoundingClientRect() ?? null;
        const style = target instanceof HTMLElement ? getComputedStyle(target) : null;
        return {
          text: document.querySelector('[data-testid=${JSON.stringify(target.textId)}]')?.textContent?.trim() ?? "",
          visible: Boolean(
            rect && rect.width > 0 && rect.height > 0 && style?.display !== "none" && style?.visibility !== "hidden"
          )
        };
      })();
    `)) as typeof state;
    if (state.visible && state.text.length > 0) {
      return `${target.label} / ${state.text}`;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Audience Starter ${starterId} ${route} follow-up did not reveal ${target.label}: ${JSON.stringify(state)}`);
}

async function readLaunchSmokeLaunchpadOpen(win: BrowserWindow): Promise<boolean> {
  return (await win.webContents.executeJavaScript(
    `document.querySelector('[data-testid="first-run-launchpad"]')?.open === true`
  )) as boolean;
}

async function waitForLaunchSmokeLaunchpadOpen(
  win: BrowserWindow,
  expectedOpen: boolean,
  expectedState: string
): Promise<void> {
  const deadline = Date.now() + launchSmokePaletteUiSettleTimeoutMs;
  let open = await readLaunchSmokeLaunchpadOpen(win);
  while (Date.now() < deadline && open !== expectedOpen) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    open = await readLaunchSmokeLaunchpadOpen(win);
  }
  if (open !== expectedOpen) {
    throw new Error(`First-run launchpad did not reach ${expectedState}: ${JSON.stringify({ open })}`);
  }
}

async function setLaunchSmokeLaunchpadOpen(win: BrowserWindow, expectedOpen: boolean): Promise<void> {
  if ((await readLaunchSmokeLaunchpadOpen(win)) !== expectedOpen) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "first-run-launchpad-toggle");
  }
  await waitForLaunchSmokeLaunchpadOpen(win, expectedOpen, expectedOpen ? "open" : "collapsed");
}

async function collectLaunchSmokeNativeAudienceStarterEvidence(
  win: BrowserWindow,
  starterId: "beginner" | "producer"
): Promise<{
  audioRefresh: LaunchSmokeAudienceStarterAudioRefreshEvidence;
  launchpadCollapsedAfterSelection: boolean;
  visible: LaunchSmokeAudienceStarterVisibleEvidence;
}> {
  await clickLaunchSmokeFunctionalTabNativeTarget(win, `audience-starter-action-${starterId}`);
  await waitForLaunchSmokeLaunchpadOpen(win, false, `collapsed after ${starterId} starter selection`);
  const launchpadCollapsedAfterSelection = !(await readLaunchSmokeLaunchpadOpen(win));
  const audioRefresh = await refreshLaunchSmokeAudienceStarterAudio(win, starterId);
  await waitForLaunchSmokeAudienceStarterVisibleResult(win, starterId);
  const visible = await readLaunchSmokeAudienceStarterVisibleEvidence(win, starterId);
  const visibleFollowupPrimaryResult = await clickLaunchSmokeAudienceStarterFollowup(win, starterId, "primary");
  const visibleFollowupReadinessResult = await clickLaunchSmokeAudienceStarterFollowup(win, starterId, "readiness");
  const visibleFollowupCompletionResult =
    starterId === "producer"
      ? await clickLaunchSmokeAudienceStarterFollowup(win, starterId, "completion")
      : "";
  return {
    audioRefresh,
    launchpadCollapsedAfterSelection,
    visible: {
      ...visible,
      visibleFollowupCompletionResult,
      visibleFollowupPrimaryResult,
      visibleFollowupReadinessResult
    }
  };
}

async function collectLaunchSmokePaletteEvidence(
  win: BrowserWindow,
  onStage: (stage: string) => void = () => {}
): Promise<LaunchSmokePaletteEvidence> {
  const initialState = await readLaunchSmokePaletteSurfaceState(win);
  const stageTimings: LaunchSmokePaletteStageTiming[] = [];
  try {
    if (initialState.activeZone !== "compose") {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-compose");
    }
    await activateLaunchSmokeWorkspacePage(win, "compose", "notes");
    await waitForLaunchSmokePaletteSurfaceState(
      win,
      (state) => state.activeZone === "compose" && state.captureIdeasVisible,
      "an active Compose tab with visible Capture & Ideas controls"
    );

    const composeState = await readLaunchSmokePaletteSurfaceState(win);
    if (!composeState.guideOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
    }
    await waitForLaunchSmokePaletteSurfaceState(
      win,
      (state) =>
        state.activeZone === "compose" &&
        state.guideOpen &&
        state.captureIdeasVisible &&
        state.audienceStarterActionsVisible &&
        state.hookReady,
      "visible Compose, Guide, Capture & Ideas, Audience Starter actions, and a ready palette hook"
    );
    const initialLaunchpadOpen = await readLaunchSmokeLaunchpadOpen(win);
    if (!initialLaunchpadOpen) {
      throw new Error("First-run launchpad should be open before native Audience Starter lifecycle evidence.");
    }

    const visibleModeToolEvidence = await runLaunchSmokePaletteStage(
      win,
      stageTimings,
      "mode-tools",
      () => collectLaunchSmokeVisibleModeToolEvidence(win),
      onStage
    );
    const modeRestoredState = await readLaunchSmokePaletteSurfaceState(win);
    if (!modeRestoredState.guideOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
    }
    await waitForLaunchSmokePaletteSurfaceState(
      win,
      (state) =>
        state.activeZone === "compose" &&
        state.guideOpen &&
        state.captureIdeasVisible &&
        state.audienceStarterActionsVisible &&
        state.hookReady,
      "the restored visible Compose and Guide posture after mode-aware tool measurement"
    );
    const chordCards = await runLaunchSmokePaletteStage(
      win,
      stageTimings,
      "native-chord-cards",
      () => collectLaunchSmokeNativeChordCardEvidence(win),
      onStage
    );

    const result = await runLaunchSmokePaletteStage(
      win,
      stageTimings,
      "quick-actions-hook-without-starters",
      () => win.webContents.executeJavaScript(`
        (async () => {
          const collector = window.__grooveforgeLaunchSmoke?.collectAudienceSessionQuickActionEvidence;
          if (window.grooveforge?.launchSmoke !== true || typeof collector !== "function") {
            return { ready: false, evidence: null };
          }
          const evidence = await collector({ skipStarterRoutes: true });
          return { ready: true, evidence };
        })();
      `),
      onStage
    );
    if (!result || result.ready !== true || !result.evidence) {
      throw new Error("Launch smoke Quick Actions hook was not ready.");
    }
    await waitForLaunchSmokeLaunchpadOpen(win, true, "open before changed beginner starter selection");
    const nativeStarterBeginner = await runLaunchSmokePaletteStage(
      win,
      stageTimings,
      "native-beginner-starter",
      () => collectLaunchSmokeNativeAudienceStarterEvidence(win, "beginner"),
      onStage
    );
    const changedStarterLaunchpad = await runLaunchSmokePaletteStage(
      win,
      stageTimings,
      "native-launchpad-changed-and-manual",
      async () => {
        const collapsedAfterStarter = nativeStarterBeginner.launchpadCollapsedAfterSelection;
        await setLaunchSmokeLaunchpadOpen(win, true);
        const manualReopen = await readLaunchSmokeLaunchpadOpen(win);
        await setLaunchSmokeLaunchpadOpen(win, false);
        const manualClose = !(await readLaunchSmokeLaunchpadOpen(win));
        return { collapsedAfterStarter, manualClose, manualReopen };
      },
      onStage
    );
    const nativeStarterProducer = await runLaunchSmokePaletteStage(
      win,
      stageTimings,
      "native-producer-starter",
      () => collectLaunchSmokeNativeAudienceStarterEvidence(win, "producer"),
      onStage
    );
    const sameStarterCollapse = await runLaunchSmokePaletteStage(
      win,
      stageTimings,
      "native-launchpad-identical-starter",
      async () => {
        await setLaunchSmokeLaunchpadOpen(win, true);
        await clickLaunchSmokeFunctionalTabNativeTarget(win, "audience-starter-action-producer");
        await waitForLaunchSmokeLaunchpadOpen(win, false, "collapsed after identical Producer starter selection");
        return !(await readLaunchSmokeLaunchpadOpen(win));
      },
      onStage
    );
    onStage("returning-evidence");
    await win.webContents.executeJavaScript(`window.__grooveforgeLaunchSmokePaletteStep = "returning-evidence"`);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const evidence = result.evidence as LaunchSmokePaletteEvidence;
    return {
      ...evidence,
      arrangementTools: visibleModeToolEvidence.arrangementTools,
      chordCards,
      deliveryTools: visibleModeToolEvidence.deliveryTools,
      instrumentTools: visibleModeToolEvidence.instrumentTools,
      launchpad: {
        ...changedStarterLaunchpad,
        initialOpen: initialLaunchpadOpen,
        sameStarterCollapse
      },
      masterTools: {
        ...evidence.masterTools,
        ...visibleModeToolEvidence.masterTools
      },
      mixerTools: visibleModeToolEvidence.mixerTools,
      stageTimings,
      starterBeginner: {
        ...evidence.starterBeginner,
        ...nativeStarterBeginner.visible,
        resultMetricValue: nativeStarterBeginner.visible.visibleResultMetricValue,
        resultNextCheck: nativeStarterBeginner.visible.visibleResultNextCheck,
        resultStatus: nativeStarterBeginner.visible.visibleResultStatus,
        resultTitle: nativeStarterBeginner.visible.visibleResultTitle
      },
      starterBeginnerAudioRefresh: nativeStarterBeginner.audioRefresh,
      starterProducer: {
        ...evidence.starterProducer,
        ...nativeStarterProducer.visible,
        resultMetricValue: nativeStarterProducer.visible.visibleResultMetricValue,
        resultNextCheck: nativeStarterProducer.visible.visibleResultNextCheck,
        resultStatus: nativeStarterProducer.visible.visibleResultStatus,
        resultTitle: nativeStarterProducer.visible.visibleResultTitle
      },
      starterProducerAudioRefresh: nativeStarterProducer.audioRefresh,
      transportTools: visibleModeToolEvidence.transportTools
    };
  } finally {
    const activeState = await readLaunchSmokePaletteSurfaceState(win);
    if (initialState.activeZone && activeState.activeZone !== initialState.activeZone) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, `workflow-jump-${initialState.activeZone}`);
      await waitForLaunchSmokePaletteSurfaceState(
        win,
        (state) => state.activeZone === initialState.activeZone,
        `the original ${initialState.activeZone} tab posture`
      );
    }

    if (initialState.activeComposePage) {
      await activateLaunchSmokeWorkspacePage(
        win,
        "compose",
        initialState.activeComposePage as LaunchSmokeComposeWorkspacePage
      ).catch(() => undefined);
    }
    if (initialState.activeMixPage) {
      await activateLaunchSmokeWorkspacePage(
        win,
        "mix",
        initialState.activeMixPage as LaunchSmokeMixWorkspacePage
      ).catch(() => undefined);
    }
    if (initialState.activeZone) {
      const restoredOuter = await readLaunchSmokePaletteSurfaceState(win);
      if (restoredOuter.activeZone !== initialState.activeZone) {
        await clickLaunchSmokeFunctionalTabNativeTarget(win, `workflow-jump-${initialState.activeZone}`).catch(
          () => undefined
        );
      }
    }

    const zoneRestoredState = await readLaunchSmokePaletteSurfaceState(win);
    if (zoneRestoredState.guideOpen !== initialState.guideOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
      await waitForLaunchSmokePaletteSurfaceState(
        win,
        (state) => state.guideOpen === initialState.guideOpen,
        `the original ${initialState.guideOpen ? "open" : "collapsed"} Guide posture`
      );
    }
  }
}

function collectLaunchSmokePaletteEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokePaletteEvidence> {
  if (launchSmokePaletteTimeoutMs <= launchSmokePaletteBoundedChildBudgetMs) {
    throw new Error("Quick Actions palette timeout must exceed its bounded child-operation budget.");
  }
  return new Promise((resolve, reject) => {
    let currentStage = "starting";
    const timeout = setTimeout(() => {
      reject(new Error(
        `Timed out collecting live Quick Actions palette evidence at ${currentStage} after ${launchSmokePaletteTimeoutMs} ms.`
      ));
    }, launchSmokePaletteTimeoutMs);
    void collectLaunchSmokePaletteEvidence(win, (stage) => {
      currentStage = stage;
    })
      .then((evidence) => {
        clearTimeout(timeout);
        resolve(evidence);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

async function waitForLaunchSmokeStarterZoneSurface(
  win: BrowserWindow,
  zone: LaunchSmokeFunctionalTabZone,
  selectors: string[],
  expectedState: string
): Promise<void> {
  const deadline = Date.now() + 30000;
  let state: { activeZone: string; visibleTargetCount: number } = { activeZone: "", visibleTargetCount: 0 };
  while (Date.now() < deadline) {
    state = (await win.webContents.executeJavaScript(`
      (() => {
        const visible = (target) => {
          if (!(target instanceof HTMLElement)) return false;
          const rect = target.getBoundingClientRect();
          const style = getComputedStyle(target);
          return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
        };
        const selectors = ${JSON.stringify(selectors)};
        return {
          activeZone:
            document.querySelector('[role="tab"][aria-selected="true"]')?.id?.replace("workspace-tab-", "") ?? "",
          visibleTargetCount: selectors.filter((selector) => visible(document.querySelector(selector))).length
        };
      })();
    `)) as { activeZone: string; visibleTargetCount: number };
    if (state.activeZone === zone && state.visibleTargetCount === selectors.length) {
      await win.webContents.executeJavaScript(
        `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`
      );
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Audience Starter ${zone} surface did not reach ${expectedState}: ${JSON.stringify(state)}`);
}

async function activateLaunchSmokeStarterZoneSurface(
  win: BrowserWindow,
  zone: LaunchSmokeFunctionalTabZone,
  selectors: string[],
  expectedState: string
): Promise<void> {
  const activeZone = (await win.webContents.executeJavaScript(
    `document.querySelector('[role="tab"][aria-selected="true"]')?.id?.replace("workspace-tab-", "") ?? ""`
  )) as string;
  if (activeZone !== zone) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, `workflow-jump-${zone}`);
  }
  if (zone === "compose") {
    const composePage = selectors.some((selector) => selector.includes("note-"))
      ? "notes"
      : selectors.some(
            (selector) =>
              selector.includes("chord-") ||
              selector.includes("harmony-") ||
              selector.includes("sound-") ||
              selector.includes("workflow-target-sound")
          )
        ? "instruments"
        : "drums";
    await activateLaunchSmokeWorkspacePage(
      win,
      "compose",
      composePage
    );
  } else if (zone === "mix") {
    await activateLaunchSmokeWorkspacePage(
      win,
      "mix",
      selectors.some((selector) => selector.includes("master-") || selector.includes("review-queue"))
        ? "master"
        : "mixer"
    );
  }
  await waitForLaunchSmokeStarterZoneSurface(win, zone, selectors, expectedState);
}

type LaunchSmokeStarterMixDisclosurePosture = {
  masterReviewOpen: boolean;
  masterReviewQueueOpen: boolean;
};

async function readLaunchSmokeStarterMixDisclosurePosture(
  win: BrowserWindow
): Promise<LaunchSmokeStarterMixDisclosurePosture> {
  return (await win.webContents.executeJavaScript(`
    (() => ({
      masterReviewOpen: document.querySelector('[data-testid="master-review-tools"]')?.open === true,
      masterReviewQueueOpen: document.querySelector('[data-testid="master-review-queue-tools"]')?.open === true
    }))();
  `)) as LaunchSmokeStarterMixDisclosurePosture;
}

async function waitForLaunchSmokeStarterViewport(
  win: BrowserWindow,
  expected: { minimumWidth?: number; width?: number },
  expectedState: string
): Promise<void> {
  const deadline = Date.now() + 30000;
  let state = { innerWidth: 0, wideMediaMatches: false };
  while (Date.now() < deadline) {
    state = (await win.webContents.executeJavaScript(`
      (() => ({
        innerWidth: window.innerWidth,
        wideMediaMatches: window.matchMedia("(min-width: 1601px)").matches
      }))();
    `)) as typeof state;
    const minimumWidthReady = expected.minimumWidth === undefined || state.innerWidth >= expected.minimumWidth;
    const exactWidthReady = expected.width === undefined || Math.abs(state.innerWidth - expected.width) <= 1;
    const mediaReady = expected.minimumWidth === undefined || state.wideMediaMatches;
    if (minimumWidthReady && exactWidthReady && mediaReady) {
      await win.webContents.executeJavaScript(
        `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`
      );
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Audience Starter viewport did not reach ${expectedState}: ${JSON.stringify(state)}`);
}

async function waitForLaunchSmokeStarterResponsiveMixSurface(win: BrowserWindow): Promise<void> {
  const deadline = Date.now() + 30000;
  let state: Record<string, unknown> = {};
  while (Date.now() < deadline) {
    state = (await win.webContents.executeJavaScript(`
      (() => {
        const visible = (target) => {
          if (!(target instanceof HTMLElement)) return false;
          const rect = target.getBoundingClientRect();
          const style = getComputedStyle(target);
          return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
        };
        const mixerStrips = Array.from(document.querySelectorAll('[data-testid^="mixer-strip-"]'));
        const mixerNarrowStripCount = mixerStrips.filter((strip) => {
          const stripTop = strip.querySelector(".strip-top");
          const trackName = stripTop?.querySelector(":scope > span");
          const toggles = stripTop?.querySelector(".strip-toggles");
          const trackRect = trackName?.getBoundingClientRect() ?? null;
          const togglesRect = toggles?.getBoundingClientRect() ?? null;
          return Boolean(
            visible(strip) &&
            stripTop &&
            trackRect &&
            togglesRect &&
            getComputedStyle(stripTop).gridTemplateColumns.trim().split(/\\s+/).length === 1 &&
            togglesRect.top >= trackRect.bottom
          );
        }).length;
        const reviewQueue = document.querySelector('[data-testid="review-queue"]');
        const reviewQueueRect = reviewQueue?.getBoundingClientRect() ?? null;
        const reviewQueueFields = [
          "review-queue-focus-status",
          "review-queue-focus-label",
          "review-queue-focus-detail",
          "review-queue-priority-status",
          "review-queue-priority-label",
          "review-queue-priority-item",
          "review-queue-priority-next-check",
          "review-fix-preview-title",
          "review-fix-preview-detail",
          "review-fix-preview-audition",
          "review-fix-preview-next-check"
        ]
          .map((testId) => document.querySelector('[data-testid="' + testId + '"]'))
          .filter((field) => field instanceof HTMLElement);
        const reviewQueueReadableFieldCount = reviewQueueFields.filter((field) => {
          const fieldRect = field.getBoundingClientRect();
          const fieldStyle = getComputedStyle(field);
          return Boolean(
            reviewQueueRect &&
            fieldRect.width > 0 &&
            fieldRect.left >= reviewQueueRect.left - 1 &&
            fieldRect.right <= reviewQueueRect.right + 1 &&
            fieldStyle.whiteSpace !== "nowrap" &&
            fieldStyle.overflowWrap === "anywhere"
          );
        }).length;
        const reviewQueueStackedRowCount = [
          "review-queue-focus-readout",
          "review-queue-priority",
          "review-fix-preview"
        ].filter((testId) => {
          const row = document.querySelector('[data-testid="' + testId + '"]');
          return row instanceof HTMLElement && getComputedStyle(row).gridTemplateColumns.trim().split(/\\s+/).length === 1;
        }).length;
        return {
          activeZone:
            document.querySelector('[role="tab"][aria-selected="true"]')?.id?.replace("workspace-tab-", "") ?? "",
          innerWidth: window.innerWidth,
          masterReviewContentVisible: visible(document.querySelector('[data-testid="master-review-content"]')),
          masterReviewOpen: document.querySelector('[data-testid="master-review-tools"]')?.open === true,
          masterReviewQueueContentVisible: visible(document.querySelector('[data-testid="master-review-queue-content"]')),
          masterReviewQueueOpen: document.querySelector('[data-testid="master-review-queue-tools"]')?.open === true,
          reviewQueueFieldCount: reviewQueueFields.length,
          reviewQueueReadableFieldCount,
          reviewQueueStackedRowCount,
          reviewQueueVisible: visible(reviewQueue),
          wideMediaMatches: window.matchMedia("(min-width: 1601px)").matches
        };
      })();
    `)) as Record<string, unknown>;
    if (
      state.activeZone === "mix" &&
      Number(state.innerWidth) > 1600 &&
      state.wideMediaMatches === true &&
      state.masterReviewOpen === true &&
      state.masterReviewQueueOpen === true &&
      state.masterReviewContentVisible === true &&
      state.masterReviewQueueContentVisible === true &&
      state.reviewQueueVisible === true &&
      state.reviewQueueFieldCount === 11 &&
      state.reviewQueueReadableFieldCount === 11 &&
      state.reviewQueueStackedRowCount === 0
    ) {
      await win.webContents.executeJavaScript(
        `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`
      );
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Audience Starter responsive Mix surface did not settle: ${JSON.stringify(state)}`);
}

async function openLaunchSmokeStarterMixDisclosures(win: BrowserWindow): Promise<void> {
  let posture = await readLaunchSmokeStarterMixDisclosurePosture(win);
  if (!posture.masterReviewOpen) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "master-review-toggle");
    await waitForLaunchSmokeStarterZoneSurface(
      win,
      "mix",
      ['[data-testid="master-review-content"]', '[data-testid="master-review-queue-toggle"]'],
      "the open Master Review disclosure"
    );
  }
  posture = await readLaunchSmokeStarterMixDisclosurePosture(win);
  if (!posture.masterReviewQueueOpen) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "master-review-queue-toggle");
  }
}

async function restoreLaunchSmokeStarterMixDisclosurePosture(
  win: BrowserWindow,
  expected: LaunchSmokeStarterMixDisclosurePosture
): Promise<void> {
  await activateLaunchSmokeStarterZoneSurface(
    win,
    "mix",
    ['[data-testid="workflow-target-master"]', '[data-testid="master-review-toggle"]'],
    "the visible Master disclosure controls"
  );
  let posture = await readLaunchSmokeStarterMixDisclosurePosture(win);
  if (posture.masterReviewQueueOpen !== expected.masterReviewQueueOpen) {
    if (!posture.masterReviewOpen) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "master-review-toggle");
      await waitForLaunchSmokeStarterZoneSurface(
        win,
        "mix",
        ['[data-testid="master-review-content"]', '[data-testid="master-review-queue-toggle"]'],
        "the temporarily open Master Review disclosure"
      );
    }
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "master-review-queue-toggle");
  }
  posture = await readLaunchSmokeStarterMixDisclosurePosture(win);
  if (posture.masterReviewOpen !== expected.masterReviewOpen) {
    await clickLaunchSmokeFunctionalTabNativeTarget(win, "master-review-toggle");
  }
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    posture = await readLaunchSmokeStarterMixDisclosurePosture(win);
    if (
      posture.masterReviewOpen === expected.masterReviewOpen &&
      posture.masterReviewQueueOpen === expected.masterReviewQueueOpen
    ) {
      await win.webContents.executeJavaScript(
        `new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))`
      );
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Audience Starter Mix disclosure posture was not restored: ${JSON.stringify(posture)}`);
}

async function collectLaunchSmokeStarterLandingEvidence(win: BrowserWindow): Promise<LaunchSmokeStarterLandingEvidence> {
  const result = await win.webContents.executeJavaScript(`
    (async () => {
      const collector = window.__grooveforgeLaunchSmoke?.collectAudienceStarterLandingEvidence;
      if (window.grooveforge?.launchSmoke !== true || typeof collector !== "function") {
        return { ready: false, evidence: null };
      }
      const evidence = await collector();
      return { ready: true, evidence };
    })();
  `);
  if (!result || result.ready !== true || !result.evidence) {
    throw new Error("Launch smoke Audience Starter landing hook was not ready.");
  }
  const originalSize = win.getSize();
  const originalViewportWidth = (await win.webContents.executeJavaScript(`window.innerWidth`)) as number;
  const originalZone = (await win.webContents.executeJavaScript(
    `document.querySelector('[role="tab"][aria-selected="true"]')?.id?.replace("workspace-tab-", "") ?? "compose"`
  )) as LaunchSmokeFunctionalTabZone;
  const originalComposePage = (await readLaunchSmokeWorkspacePageState(win, "compose")).activePage;
  const originalMixPage = (await readLaunchSmokeWorkspacePageState(win, "mix")).activePage;
  const originalMixDisclosurePosture = await readLaunchSmokeStarterMixDisclosurePosture(win);
  let arrangement: Record<string, number>;
  let chordTools: Record<string, number>;
  let mixerAndReview: Record<string, number | boolean>;
  let noteTools: Record<string, number>;
  let mixDisclosurePostureRestored = false;
  let viewportRestored = false;
  try {
    await activateLaunchSmokeStarterZoneSurface(
      win,
      "arrange",
      ['[data-testid="workflow-target-arrange"]', ".arrangement-actions", '[data-testid="arrangement-move-left"]'],
      "a visible arrangement action layout"
    );
    arrangement = (await win.webContents.executeJavaScript(`
    (() => {
      const arrangementMoveGroup = document.querySelector(".arrangement-actions");
      const arrangementMoveButtons = Array.from(
        document.querySelectorAll('[data-testid="arrangement-move-left"], [data-testid="arrangement-move-right"]')
      );
      const arrangementMoveAccessibleNames = arrangementMoveButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const arrangementMoveReadableLabels = arrangementMoveButtons.filter((button) => {
        const label = button.querySelector("span");
        return Boolean(label && label.clientWidth > 0 && label.scrollWidth <= label.clientWidth + 1);
      });
      const arrangementMoveContainedButtons = arrangementMoveButtons.filter((button) => {
        const groupRect = arrangementMoveGroup?.getBoundingClientRect() ?? null;
        const buttonRect = button.getBoundingClientRect();
        return Boolean(
          groupRect && buttonRect.left >= groupRect.left - 1 && buttonRect.right <= groupRect.right + 1
        );
      });
      return {
        arrangementMoveContainedCount: arrangementMoveContainedButtons.length,
        arrangementMoveControlCount: arrangementMoveButtons.length,
        arrangementMoveInternalOverflow: arrangementMoveGroup
          ? Math.max(0, arrangementMoveGroup.scrollWidth - arrangementMoveGroup.clientWidth)
          : 0,
        arrangementMoveReadableLabelCount: arrangementMoveReadableLabels.length,
        arrangementMoveUniqueAccessibleNameCount: new Set(arrangementMoveAccessibleNames).size
      };
    })();
  `)) as Record<string, number>;

    win.setSize(1680, 960);
    await waitForLaunchSmokeStarterViewport(
      win,
      { minimumWidth: 1601 },
      "the native 1680px responsive Mix posture"
    );
    await activateLaunchSmokeStarterZoneSurface(
      win,
      "mix",
      ['[data-testid="workflow-target-mix"]', '[data-testid^="mixer-strip-"]'],
      "visible full-width mixer strips"
    );
    const mixerPageMeasurements = (await win.webContents.executeJavaScript(`
      (() => {
        const mixerToggleButtons = Array.from(
          document.querySelectorAll('[data-testid^="mixer-mute-"], [data-testid^="mixer-solo-"]')
        );
        const mixerToggleAccessibleNames = mixerToggleButtons
          .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
          .filter((label) => label.length > 0);
        const mixerToggleReadableLabels = mixerToggleButtons.filter((button) => {
          const label = button.querySelector("span");
          return Boolean(label && label.clientWidth > 0 && label.scrollWidth <= label.clientWidth + 1);
        });
        const mixerToggleContainedButtons = mixerToggleButtons.filter((button) => {
          const strip = button.closest('[data-testid^="mixer-strip-"]');
          const stripRect = strip?.getBoundingClientRect() ?? null;
          const buttonRect = button.getBoundingClientRect();
          return Boolean(
            stripRect &&
            buttonRect.width >= 48 &&
            buttonRect.left >= stripRect.left - 1 &&
            buttonRect.right <= stripRect.right + 1
          );
        });
        const mixerStrips = Array.from(document.querySelectorAll('[data-testid^="mixer-strip-"]'));
        const mixerNarrowStrips = mixerStrips.filter((strip) => {
          const stripTop = strip.querySelector(".strip-top");
          const trackName = stripTop?.querySelector(":scope > span");
          const toggles = stripTop?.querySelector(".strip-toggles");
          const trackRect = trackName?.getBoundingClientRect() ?? null;
          const togglesRect = toggles?.getBoundingClientRect() ?? null;
          return Boolean(
            stripTop &&
            trackRect &&
            togglesRect &&
            getComputedStyle(stripTop).gridTemplateColumns.trim().split(/\\s+/).length === 1 &&
            togglesRect.top >= trackRect.bottom
          );
        });
        return {
          mixerNarrowStripCount: mixerNarrowStrips.length,
          mixerToggleContainedCount: mixerToggleContainedButtons.length,
          mixerToggleCount: mixerToggleButtons.length,
          mixerToggleInternalOverflow: mixerStrips.reduce(
            (maximum, strip) => Math.max(maximum, strip.scrollWidth - strip.clientWidth),
            0
          ),
          mixerTogglePressedStateCount: mixerToggleButtons.filter((button) => button.hasAttribute("aria-pressed")).length,
          mixerToggleReadableLabelCount: mixerToggleReadableLabels.length,
          mixerToggleTitleCount: mixerToggleButtons.filter(
            (button) => (button.getAttribute("title")?.trim().length ?? 0) > 0
          ).length,
          mixerToggleUniqueAccessibleNameCount: new Set(mixerToggleAccessibleNames).size
        };
      })();
    `)) as Record<string, number>;
    await activateLaunchSmokeStarterZoneSurface(
      win,
      "mix",
      ['[data-testid="workflow-target-master"]', '[data-testid="master-review-toggle"]'],
      "visible full-width Master Review controls"
    );
    await openLaunchSmokeStarterMixDisclosures(win);
    await waitForLaunchSmokeStarterResponsiveMixSurface(win);
    mixerAndReview = (await win.webContents.executeJavaScript(`
    (() => {
      const mixerToggleButtons = Array.from(
        document.querySelectorAll('[data-testid^="mixer-mute-"], [data-testid^="mixer-solo-"]')
      );
      const mixerToggleAccessibleNames = mixerToggleButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const mixerToggleReadableLabels = mixerToggleButtons.filter((button) => {
        const label = button.querySelector("span");
        return Boolean(label && label.clientWidth > 0 && label.scrollWidth <= label.clientWidth + 1);
      });
      const mixerToggleContainedButtons = mixerToggleButtons.filter((button) => {
        const strip = button.closest('[data-testid^="mixer-strip-"]');
        const stripRect = strip?.getBoundingClientRect() ?? null;
        const buttonRect = button.getBoundingClientRect();
        return Boolean(
          stripRect &&
          buttonRect.width >= 48 &&
          buttonRect.left >= stripRect.left - 1 &&
          buttonRect.right <= stripRect.right + 1
        );
      });
      const mixerStrips = Array.from(document.querySelectorAll('[data-testid^="mixer-strip-"]'));
      const mixerNarrowStrips = mixerStrips.filter((strip) => {
        const stripTop = strip.querySelector(".strip-top");
        const trackName = stripTop?.querySelector(":scope > span");
        const toggles = stripTop?.querySelector(".strip-toggles");
        const trackRect = trackName?.getBoundingClientRect() ?? null;
        const togglesRect = toggles?.getBoundingClientRect() ?? null;
        return Boolean(
          stripTop &&
          trackRect &&
          togglesRect &&
          getComputedStyle(stripTop).gridTemplateColumns.trim().split(/\\s+/).length === 1 &&
          togglesRect.top >= trackRect.bottom
        );
      });
      const reviewQueue = document.querySelector('[data-testid="review-queue"]');
      const reviewQueueRect = reviewQueue?.getBoundingClientRect() ?? null;
      const reviewQueueFields = [
        "review-queue-focus-status",
        "review-queue-focus-label",
        "review-queue-focus-detail",
        "review-queue-priority-status",
        "review-queue-priority-label",
        "review-queue-priority-item",
        "review-queue-priority-next-check",
        "review-fix-preview-title",
        "review-fix-preview-detail",
        "review-fix-preview-audition",
        "review-fix-preview-next-check"
      ]
        .map((testId) => document.querySelector('[data-testid="' + testId + '"]'))
        .filter((field) => field instanceof HTMLElement);
      const reviewQueueReadableFields = reviewQueueFields.filter((field) => {
        const fieldRect = field.getBoundingClientRect();
        const fieldStyle = getComputedStyle(field);
        return Boolean(
          reviewQueueRect &&
          fieldRect.width > 0 &&
          fieldRect.left >= reviewQueueRect.left - 1 &&
          fieldRect.right <= reviewQueueRect.right + 1 &&
          fieldStyle.whiteSpace !== "nowrap" &&
          fieldStyle.overflowWrap === "anywhere"
        );
      });
      const reviewQueueStackedRows = [
        "review-queue-focus-readout",
        "review-queue-priority",
        "review-fix-preview"
      ].filter((testId) => {
        const row = document.querySelector('[data-testid="' + testId + '"]');
        return row instanceof HTMLElement && getComputedStyle(row).gridTemplateColumns.trim().split(/\\s+/).length === 1;
      });
      return {
        mixerNarrowStripCount: mixerNarrowStrips.length,
        mixerToggleContainedCount: mixerToggleContainedButtons.length,
        mixerToggleCount: mixerToggleButtons.length,
        mixerToggleInternalOverflow: mixerStrips.reduce(
          (maximum, strip) => Math.max(maximum, strip.scrollWidth - strip.clientWidth),
          0
        ),
        mixerTogglePressedStateCount: mixerToggleButtons.filter((button) => button.hasAttribute("aria-pressed")).length,
        mixerToggleReadableLabelCount: mixerToggleReadableLabels.length,
        mixerToggleTitleCount: mixerToggleButtons.filter(
          (button) => (button.getAttribute("title")?.trim().length ?? 0) > 0
        ).length,
        mixerToggleUniqueAccessibleNameCount: new Set(mixerToggleAccessibleNames).size,
        producerQueueOpen:
          document.querySelector('[data-testid="master-review-queue-tools"]')?.open === true,
        producerReviewOpen:
          document.querySelector('[data-testid="master-review-tools"]')?.open === true,
        reviewQueueContained: Boolean(
          reviewQueue &&
          reviewQueueRect &&
          reviewQueueRect.left >= 0 &&
          reviewQueueRect.right <= window.innerWidth &&
          reviewQueue.scrollWidth <= reviewQueue.clientWidth + 1
        ),
        reviewQueueFieldCount: reviewQueueFields.length,
        reviewQueueInternalOverflow: reviewQueue
          ? Math.max(0, reviewQueue.scrollWidth - reviewQueue.clientWidth)
          : 0,
        reviewQueueReadableFieldCount: reviewQueueReadableFields.length,
        reviewQueueStackedRowCount: reviewQueueStackedRows.length
      };
    })();
  `)) as Record<string, number | boolean>;
    mixerAndReview = { ...mixerAndReview, ...mixerPageMeasurements };

    await restoreLaunchSmokeStarterMixDisclosurePosture(win, originalMixDisclosurePosture);
    mixDisclosurePostureRestored = true;
    win.setSize(originalSize[0], originalSize[1]);
    await waitForLaunchSmokeStarterViewport(
      win,
      { width: originalViewportWidth },
      `the original ${originalViewportWidth}px viewport posture`
    );
    viewportRestored = true;

    await activateLaunchSmokeStarterZoneSurface(
      win,
      "compose",
      ['[data-testid="workflow-target-sound"]', '[data-testid="chord-edit-tools"]', '[data-testid="chord-edit-tools"] button'],
      "a visible selected-chord tool layout"
    );
    chordTools = (await win.webContents.executeJavaScript(`
      (() => {
        const chordToolGroup = document.querySelector('[data-testid="chord-edit-tools"]');
        const chordToolButtons = chordToolGroup ? Array.from(chordToolGroup.querySelectorAll("button")) : [];
        const chordToolGroupRect = chordToolGroup?.getBoundingClientRect() ?? null;
        const chordToolAccessibleNames = chordToolButtons
          .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
          .filter((label) => label.length > 0);
        const chordToolReadableLabels = chordToolButtons.filter((button) => {
          const buttonRect = button.getBoundingClientRect();
          const label = button.querySelector("span");
          const labelStyle = label ? getComputedStyle(label) : null;
          return Boolean(
            chordToolGroupRect &&
            label &&
            labelStyle &&
            buttonRect.height >= 48 &&
            buttonRect.left >= chordToolGroupRect.left - 1 &&
            buttonRect.right <= chordToolGroupRect.right + 1 &&
            label.clientWidth > 0 &&
            label.clientHeight > 0 &&
            label.scrollWidth <= label.clientWidth + 1 &&
            label.scrollHeight <= label.clientHeight + 1 &&
            labelStyle.whiteSpace !== "nowrap" &&
            labelStyle.textOverflow === "clip"
          );
        });
        return {
          chordToolColumnCount: chordToolGroup
            ? getComputedStyle(chordToolGroup).gridTemplateColumns.trim().split(/\\s+/).length
            : 0,
          chordToolCount: chordToolButtons.length,
          chordToolInternalOverflow: chordToolGroup
            ? Math.max(0, chordToolGroup.scrollWidth - chordToolGroup.clientWidth)
            : 0,
          chordToolReadableLabelCount: chordToolReadableLabels.length,
          chordToolRowCount: new Set(chordToolButtons.map((button) => Math.round(button.getBoundingClientRect().top))).size,
          chordToolUniqueAccessibleNameCount: new Set(chordToolAccessibleNames).size
        };
      })();
    `)) as Record<string, number>;

    await activateLaunchSmokeStarterZoneSurface(
      win,
      "compose",
      ['[data-testid="note-editor-panel"]', ".note-action-row", ".note-action-row button"],
      "a visible selected-note tool layout"
    );
    noteTools = (await win.webContents.executeJavaScript(`
    (() => {
      const noteToolGroup = document.querySelector(".note-action-row");
      const noteToolButtons = noteToolGroup ? Array.from(noteToolGroup.querySelectorAll("button")) : [];
      const noteToolGroupRect = noteToolGroup?.getBoundingClientRect() ?? null;
      const noteToolAccessibleNames = noteToolButtons
        .map((button) => button.getAttribute("aria-label")?.trim() ?? "")
        .filter((label) => label.length > 0);
      const noteToolReadableLabels = noteToolButtons.filter((button) => {
        const label = button.querySelector("span");
        const labelStyle = label ? getComputedStyle(label) : null;
        return Boolean(
          label &&
          labelStyle &&
          label.clientWidth > 0 &&
          label.clientHeight > 0 &&
          label.scrollWidth <= label.clientWidth + 1 &&
          label.scrollHeight <= label.clientHeight + 1 &&
          labelStyle.whiteSpace !== "nowrap" &&
          labelStyle.textOverflow === "clip"
        );
      });
      const noteToolContainedButtons = noteToolButtons.filter((button) => {
        const buttonRect = button.getBoundingClientRect();
        return Boolean(
          noteToolGroupRect &&
          buttonRect.height >= 48 &&
          buttonRect.left >= noteToolGroupRect.left - 1 &&
          buttonRect.right <= noteToolGroupRect.right + 1
        );
      });
      return {
        noteToolColumnCount: noteToolGroup
          ? getComputedStyle(noteToolGroup).gridTemplateColumns.trim().split(/\\s+/).length
          : 0,
        noteToolContainedCount: noteToolContainedButtons.length,
        noteToolControlCount: noteToolButtons.length,
        noteToolInternalOverflow: noteToolGroup
          ? Math.max(0, noteToolGroup.scrollWidth - noteToolGroup.clientWidth)
          : 0,
        noteToolReadableLabelCount: noteToolReadableLabels.length,
        noteToolRowCount: new Set(noteToolButtons.map((button) => Math.round(button.getBoundingClientRect().top))).size,
        noteToolUniqueAccessibleNameCount: new Set(noteToolAccessibleNames).size
      };
    })();
  `)) as Record<string, number>;
  } finally {
    if (!viewportRestored) {
      win.setSize(originalSize[0], originalSize[1]);
      await waitForLaunchSmokeStarterViewport(
        win,
        { width: originalViewportWidth },
        `the original ${originalViewportWidth}px viewport cleanup posture`
      ).catch(() => undefined);
    }
    if (!mixDisclosurePostureRestored) {
      await restoreLaunchSmokeStarterMixDisclosurePosture(win, originalMixDisclosurePosture).catch(() => undefined);
    }
    if (originalComposePage) {
      await activateLaunchSmokeWorkspacePage(
        win,
        "compose",
        originalComposePage as LaunchSmokeComposeWorkspacePage
      ).catch(() => undefined);
    }
    if (originalMixPage) {
      await activateLaunchSmokeWorkspacePage(win, "mix", originalMixPage as LaunchSmokeMixWorkspacePage).catch(
        () => undefined
      );
    }
    const activeZone = (await win.webContents.executeJavaScript(
      `document.querySelector('[role="tab"][aria-selected="true"]')?.id?.replace("workspace-tab-", "") ?? ""`
    ).catch(() => "")) as string;
    if (activeZone !== originalZone) {
      await clickLaunchSmokeFunctionalTabNativeTarget(win, `workflow-jump-${originalZone}`).catch(() => undefined);
      await waitForLaunchSmokeStarterZoneSurface(
        win,
        originalZone,
        [`#workspace-panel-${originalZone}`],
        `the original ${originalZone} landing posture`
      ).catch(() => undefined);
    }
  }
  const evidence = result.evidence as LaunchSmokeStarterLandingEvidence;
  const mixerMeasurements = {
    mixerNarrowStripCount: Number(mixerAndReview.mixerNarrowStripCount),
    mixerToggleContainedCount: Number(mixerAndReview.mixerToggleContainedCount),
    mixerToggleCount: Number(mixerAndReview.mixerToggleCount),
    mixerToggleInternalOverflow: Number(mixerAndReview.mixerToggleInternalOverflow),
    mixerTogglePressedStateCount: Number(mixerAndReview.mixerTogglePressedStateCount),
    mixerToggleReadableLabelCount: Number(mixerAndReview.mixerToggleReadableLabelCount),
    mixerToggleTitleCount: Number(mixerAndReview.mixerToggleTitleCount),
    mixerToggleUniqueAccessibleNameCount: Number(mixerAndReview.mixerToggleUniqueAccessibleNameCount)
  };
  const reviewMeasurements = {
    producerQueueOpen: Boolean(mixerAndReview.producerQueueOpen),
    producerReviewOpen: Boolean(mixerAndReview.producerReviewOpen),
    reviewQueueContained: Boolean(mixerAndReview.reviewQueueContained),
    reviewQueueFieldCount: Number(mixerAndReview.reviewQueueFieldCount),
    reviewQueueInternalOverflow: Number(mixerAndReview.reviewQueueInternalOverflow),
    reviewQueueReadableFieldCount: Number(mixerAndReview.reviewQueueReadableFieldCount),
    reviewQueueStackedRowCount: Number(mixerAndReview.reviewQueueStackedRowCount)
  };
  return {
    ...evidence,
    beginner: {
      ...evidence.beginner,
      ...arrangement,
      ...chordTools,
      ...mixerMeasurements
    },
    producer: {
      ...evidence.producer,
      ...reviewMeasurements,
      ...noteTools
    }
  };
}

function collectLaunchSmokeStarterLandingEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokeStarterLandingEvidence> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      void win.webContents
        .executeJavaScript(`window.__grooveforgeLaunchSmokeStarterLandingStep ?? "unknown"`)
        .then((step: unknown) => reject(new Error(`Timed out collecting Audience Starter landing evidence at ${String(step)}.`)))
        .catch(() => reject(new Error("Timed out collecting Audience Starter landing evidence.")));
    }, 280000);
    void collectLaunchSmokeStarterLandingEvidence(win)
      .then((evidence) => {
        clearTimeout(timeout);
        resolve(evidence);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

async function collectLaunchSmokeBridgeDirectHookEvidence(win: BrowserWindow): Promise<LaunchSmokeBridgeDirectEvidenceBundle | null> {
  const result = await win.webContents.executeJavaScript(`
    (async () => {
      const collector = window.__grooveforgeLaunchSmoke?.collectAudienceRouteBridgeDirectEvidence;
      if (window.grooveforge?.launchSmoke !== true || typeof collector !== "function") {
        return { ready: false, evidence: null };
      }
      const evidence = await collector();
      return { ready: true, evidence };
    })();
  `);
  return result && result.ready === true && result.evidence ? (result.evidence as LaunchSmokeBridgeDirectEvidenceBundle) : null;
}

async function readLaunchSmokeBridgeGuideState(win: BrowserWindow): Promise<{
  actionTargetsVisible: boolean;
  guideOpen: boolean;
  hookReady: boolean;
}> {
  return (await win.webContents.executeJavaScript(`
    (() => {
      const guide = document.querySelector('[data-testid="guidance-center"]');
      const readiness = document.querySelector('[data-testid="audience-route-bridge-readiness-action"]');
      const completion = document.querySelector('[data-testid="audience-route-bridge-completion-action"]');
      const visible = (target) => {
        if (!(target instanceof HTMLElement)) return false;
        const rect = target.getBoundingClientRect();
        const style = getComputedStyle(target);
        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      };
      return {
        actionTargetsVisible: visible(readiness) && visible(completion),
        guideOpen: guide instanceof HTMLDetailsElement && guide.open,
        hookReady: typeof window.__grooveforgeLaunchSmoke?.collectAudienceRouteBridgeDirectEvidence === "function"
      };
    })();
  `)) as { actionTargetsVisible: boolean; guideOpen: boolean; hookReady: boolean };
}

async function waitForLaunchSmokeBridgeGuideState(
  win: BrowserWindow,
  predicate: (state: Awaited<ReturnType<typeof readLaunchSmokeBridgeGuideState>>) => boolean,
  expectedState: string
): Promise<void> {
  const deadline = Date.now() + 30000;
  let state = await readLaunchSmokeBridgeGuideState(win);
  while (Date.now() < deadline && !predicate(state)) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    state = await readLaunchSmokeBridgeGuideState(win);
  }
  if (!predicate(state)) {
    throw new Error(`Audience Route Bridge Guide did not reach ${expectedState}: ${JSON.stringify(state)}`);
  }
}

async function collectLaunchSmokeBridgeDirectEvidence(
  win: BrowserWindow,
  setStep: (step: string) => void = () => undefined
): Promise<LaunchSmokeBridgeDirectEvidenceBundle> {
  const initialState = await readLaunchSmokeBridgeGuideState(win);
  try {
    if (!initialState.guideOpen) {
      setStep("opening-visible-guide-with-native-pointer");
      await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
    }
    setStep("awaiting-visible-bridge-actions-and-react-hook");
    await waitForLaunchSmokeBridgeGuideState(
      win,
      (state) => state.guideOpen && state.actionTargetsVisible && state.hookReady,
      "an open Guide with visible direct actions and an active React evidence hook"
    );

    setStep("collecting-visible-react-direct-hook");
    const hookEvidence = await collectLaunchSmokeBridgeDirectHookEvidence(win);
    if (!hookEvidence) {
      throw new Error("Audience Route Bridge direct evidence hook disappeared while its visible Guide actions were active.");
    }
    await new Promise((resolve) => setTimeout(resolve, 320));
    return hookEvidence;
  } finally {
    if (!initialState.guideOpen) {
      const currentState = await readLaunchSmokeBridgeGuideState(win);
      if (currentState.guideOpen) {
        setStep("restoring-collapsed-guide-with-native-pointer");
        await clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle");
      }
      await waitForLaunchSmokeBridgeGuideState(win, (state) => !state.guideOpen, "its original collapsed posture");
    }
  }
}

function collectLaunchSmokeBridgeDirectEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokeBridgeDirectEvidenceBundle> {
  return new Promise((resolve, reject) => {
    let step = "starting";
    const timeout = setTimeout(
      () => reject(new Error(`Timed out collecting live Audience Route Bridge direct button evidence at ${step}.`)),
      60000
    );
    void collectLaunchSmokeBridgeDirectEvidence(win, (nextStep) => {
      step = nextStep;
    })
      .then((evidence) => {
        clearTimeout(timeout);
        resolve(evidence);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

async function collectLaunchSmokeClosedDetailsEvidence(
  win: BrowserWindow,
  onStep: (step: string) => void = () => {}
): Promise<LaunchSmokeClosedDetailsEvidence> {
  type DisclosureSnapshot = {
    closedCount: number;
    leakedControlCount: number;
    leakedContentCount: number;
    openCount: number;
    playing: boolean;
    projectFingerprint: string;
    targetContentCount: number;
    targetControlCount: number;
    targetOpen: boolean;
    totalCount: number;
    undoDisabled: boolean;
  };

  const readSnapshot = async (targetTestId: string): Promise<DisclosureSnapshot> =>
    (await win.webContents.executeJavaScript(`
      (() => {
        const target = document.querySelector('[data-testid=${JSON.stringify(targetTestId)}]');
        const closedContent = Array.from(document.querySelectorAll('details:not([open]) > :not(summary)'));
        const closedControls = Array.from(
          document.querySelectorAll(
            'details:not([open]) button, details:not([open]) input, details:not([open]) select, ' +
              'details:not([open]) textarea, details:not([open]) [tabindex]'
          )
        );
        const visible = (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
        const targetControls = target
          ? Array.from(target.querySelectorAll('button, input, select, textarea, [tabindex]')).filter(
              (element) => !element.disabled && element.tabIndex >= 0 && visible(element)
            )
          : [];
        const projectFingerprint = JSON.stringify({
          title: document.querySelector('[data-testid="project-title-input"]')?.value ?? '',
          bpm: document.querySelector('[data-testid="transport-bpm-input"]')?.value ?? '',
          drums: document.querySelectorAll('[data-testid^="drum-step-"][aria-pressed="true"]').length,
          bass: document.querySelectorAll('[data-testid^="note-step-bass-"][aria-pressed="true"]').length,
          melody: document.querySelectorAll('[data-testid^="note-step-melody-"][aria-pressed="true"]').length,
          blocks: Array.from(document.querySelectorAll('button[data-testid^="arrangement-block-"]')).map(
            (element) => element.textContent?.trim().replace(/\\s+/g, ' ') ?? ''
          ),
          mixer: Array.from(document.querySelectorAll('[data-testid^="mixer-volume-"]')).map(
            (element) => element.value
          )
        });
        return {
          closedCount: document.querySelectorAll('details:not([open])').length,
          leakedControlCount: closedControls.filter(
            (element) => !element.disabled && element.tabIndex >= 0 && visible(element)
          ).length,
          leakedContentCount: closedContent.filter(visible).length,
          openCount: document.querySelectorAll('details[open]').length,
          playing: document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'true',
          projectFingerprint,
          targetContentCount: target
            ? Array.from(target.children).filter((element) => element.tagName !== 'SUMMARY' && visible(element)).length
            : 0,
          targetControlCount: targetControls.length,
          targetOpen: target instanceof HTMLDetailsElement && target.open,
          totalCount: document.querySelectorAll('details').length,
          undoDisabled: document.querySelector('[data-testid="undo-button"]')?.disabled === true
        };
      })();
    `)) as DisclosureSnapshot;

  const activateWorkspaceZone = async (zone: LaunchSmokeFunctionalTabZone): Promise<void> => {
    const activated = (await win.webContents.executeJavaScript(`
      (() => {
        document.querySelector('[data-testid="workflow-jump-${zone}"]')?.click();
        const panel = document.getElementById("workspace-panel-${zone}");
        return Boolean(panel && !panel.hidden && panel.getBoundingClientRect().height > 0);
      })();
    `)) as boolean;
    if (!activated) {
      throw new Error(`Could not activate ${zone} before disclosure evidence.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const toggleWithNativeEnter = async (targetTestId: string, expectedOpen: boolean): Promise<DisclosureSnapshot> => {
    const focused = (await win.webContents.executeJavaScript(`
      (() => {
        const target = document.querySelector('[data-testid=${JSON.stringify(targetTestId)}]');
        const summary = target?.querySelector(':scope > summary');
        if (!(summary instanceof HTMLElement)) {
          return false;
        }
        summary.focus();
        return document.activeElement === summary;
      })();
    `)) as boolean;
    if (!focused) {
      throw new Error(`Could not focus disclosure summary ${targetTestId}.`);
    }
    win.webContents.focus();
    win.webContents.sendInputEvent({ type: "keyDown", keyCode: "Enter" });
    win.webContents.sendInputEvent({ type: "keyUp", keyCode: "Enter" });
    const deadline = Date.now() + 30000;
    let snapshot = await readSnapshot(targetTestId);
    const settled = (current: DisclosureSnapshot): boolean =>
      expectedOpen
        ? current.targetOpen && current.targetContentCount > 0 && current.targetControlCount > 0
        : !current.targetOpen && current.targetContentCount === 0 && current.targetControlCount === 0;
    while (Date.now() < deadline && !settled(snapshot)) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      snapshot = await readSnapshot(targetTestId);
    }
    if (!settled(snapshot)) {
      throw new Error(
        `Native Enter did not settle ${targetTestId} open=${expectedOpen} with contained content and controls: ${JSON.stringify(snapshot)}`
      );
    }
    return snapshot;
  };

  onStep("reading initial closed disclosures");
  const initial = await readSnapshot("guidance-center");
  onStep("opening and closing Guide & Review Center");
  const guideOpen = await toggleWithNativeEnter("guidance-center", true);
  const guideClosed = await toggleWithNativeEnter("guidance-center", false);
  onStep("opening and closing Pattern Lab");
  await activateWorkspaceZone("compose");
  await activateLaunchSmokeWorkspacePage(win, "compose", "drums");
  const patternOpen = await toggleWithNativeEnter("pattern-lab", true);
  const patternClosed = await toggleWithNativeEnter("pattern-lab", false);
  onStep("opening and closing nested mixer processing");
  await activateWorkspaceZone("mix");
  await activateLaunchSmokeWorkspacePage(win, "mix", "mixer");
  const mixerOpen = await toggleWithNativeEnter("mixer-processing-drum_rack", true);
  const mixerClosed = await toggleWithNativeEnter("mixer-processing-drum_rack", false);
  await activateWorkspaceZone("compose");
  await activateLaunchSmokeWorkspacePage(win, "compose", "drums");
  const snapshots = [initial, guideOpen, guideClosed, patternOpen, patternClosed, mixerOpen, mixerClosed];
  const reclosedSnapshots = [guideClosed, patternClosed, mixerClosed];

  return {
    closedCount: initial.closedCount,
    guideOpenReady: guideOpen.targetOpen && guideOpen.targetContentCount > 0 && guideOpen.targetControlCount >= 150,
    guideReclosedReady:
      !guideClosed.targetOpen && guideClosed.targetContentCount === 0 && guideClosed.targetControlCount === 0,
    initiallyOpenCount: initial.openCount,
    leakedControlCount: Math.max(initial.leakedControlCount, ...reclosedSnapshots.map((item) => item.leakedControlCount)),
    leakedContentCount: Math.max(initial.leakedContentCount, ...reclosedSnapshots.map((item) => item.leakedContentCount)),
    mixerOpenReady: mixerOpen.targetOpen && mixerOpen.targetContentCount > 0 && mixerOpen.targetControlCount >= 10,
    mixerReclosedReady:
      !mixerClosed.targetOpen && mixerClosed.targetContentCount === 0 && mixerClosed.targetControlCount === 0,
    patternLabOpenReady:
      patternOpen.targetOpen && patternOpen.targetContentCount > 0 && patternOpen.targetControlCount >= 40,
    patternLabReclosedReady:
      !patternClosed.targetOpen && patternClosed.targetContentCount === 0 && patternClosed.targetControlCount === 0,
    playbackStayedStopped: snapshots.every((item) => !item.playing),
    projectStayedUnchanged: snapshots.every((item) => item.projectFingerprint === initial.projectFingerprint),
    totalCount: initial.totalCount,
    undoPostureUnchanged: snapshots.every((item) => item.undoDisabled === initial.undoDisabled)
  };
}

function collectLaunchSmokeClosedDetailsEvidenceWithTimeout(
  win: BrowserWindow
): Promise<LaunchSmokeClosedDetailsEvidence> {
  return new Promise((resolve, reject) => {
    let step = "starting";
    const timeout = setTimeout(
      () => reject(new Error(`Timed out collecting native closed disclosure evidence at ${step}.`)),
      120000
    );
    void collectLaunchSmokeClosedDetailsEvidence(win, (nextStep) => {
      step = nextStep;
    })
      .then((evidence) => {
        clearTimeout(timeout);
        resolve(evidence);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

async function collectLaunchSmokeDrumGridKeyboardEvidence(
  win: BrowserWindow,
  onStep: (step: string) => void = () => {}
): Promise<LaunchSmokeDrumGridKeyboardEvidence> {
  type DrumGridSnapshot = {
    activeCount: number;
    activeTestId: string;
    buttonCount: number;
    playing: boolean;
    pressedSemanticsReady: boolean;
    selectedTestId: string;
    tabStopTestIds: string[];
    targetPressed: boolean;
  };

  const runStep = async <T,>(script: string): Promise<T> => (await win.webContents.executeJavaScript(script)) as T;
  const recordedSteps: DrumGridSnapshot[] = [];
  let recorderBridgeReady = false;
  const handleRecorderSnapshot = (event: Electron.IpcMainEvent, payload: unknown): void => {
    if (event.sender !== win.webContents || typeof payload !== "object" || payload === null) {
      return;
    }
    const candidate = payload as { snapshot?: unknown; step?: unknown };
    if (candidate.step === 0) {
      recorderBridgeReady = true;
      return;
    }
    if (
      typeof candidate.step === "number" &&
      Number.isInteger(candidate.step) &&
      candidate.step >= 1 &&
      candidate.step <= 5 &&
      typeof candidate.snapshot === "object" &&
      candidate.snapshot !== null
    ) {
      recordedSteps[candidate.step - 1] = candidate.snapshot as DrumGridSnapshot;
    }
  };
  ipcMain.on(launchSmokeDrumGridSnapshotChannel, handleRecorderSnapshot);
  await activateLaunchSmokeWorkspacePage(win, "compose", "drums");
  win.webContents.focus();
  onStep("installing renderer recorder");
  const initial = await runStep<DrumGridSnapshot>(`
      (() => {
        const snapshot = () => {
          const buttons = Array.from(document.querySelectorAll('button[data-testid^="drum-step-"]'));
          const selected = buttons.filter((button) => button.classList.contains('selected'));
          return {
            activeCount: buttons.filter((button) => button.getAttribute('aria-pressed') === 'true').length,
            activeTestId: document.activeElement instanceof HTMLElement ? document.activeElement.dataset.testid ?? '' : '',
            buttonCount: buttons.length,
            playing: document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'true',
            pressedSemanticsReady: buttons.every(
              (button) =>
                (button.getAttribute('aria-pressed') === 'true') === button.classList.contains('active')
            ),
            selectedTestId: selected.length === 1 ? selected[0]?.dataset.testid ?? '' : '',
            tabStopTestIds: buttons.filter((button) => button.tabIndex === 0).map((button) => button.dataset.testid ?? ''),
            targetPressed: document.querySelector('[data-testid="drum-step-kick-1"]')?.getAttribute('aria-pressed') === 'true'
          };
        };
        const recorder = { steps: [], listener: null, capture: null };
        recorder.capture = () => {
          const nextSnapshot = snapshot();
          recorder.steps.push(nextSnapshot);
          window.grooveforge?.reportLaunchSmokeDrumGridSnapshot?.({
            step: recorder.steps.length,
            snapshot: nextSnapshot
          });
          if (recorder.steps.length >= 5) {
            document.removeEventListener('keydown', recorder.listener, true);
          }
        };
        recorder.listener = (event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
            return;
          }
          setTimeout(recorder.capture, 0);
        };
        window.__grooveforgeDrumGridKeyboardSmoke = recorder;
        document.addEventListener('keydown', recorder.listener, true);
        document.querySelector('[data-testid="drum-step-kick-0"]')?.focus();
        const initialSnapshot = snapshot();
        window.grooveforge?.reportLaunchSmokeDrumGridSnapshot?.({ step: 0, snapshot: initialSnapshot });
        return initialSnapshot;
      })();
    `);
  const sendKey = async (
    keyCode: string,
    expectedStep: number,
    modifiers: Electron.InputEvent["modifiers"] = []
  ): Promise<void> => {
    win.webContents.focus();
    await new Promise((resolve) => setTimeout(resolve, 50));
    win.webContents.sendInputEvent({ type: "keyDown", keyCode, modifiers });
    win.webContents.sendInputEvent({ type: "keyUp", keyCode, modifiers });
    const stepDeadline = Date.now() + 30000;
    while (Date.now() < stepDeadline && !recordedSteps[expectedStep - 1]) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (!recordedSteps[expectedStep - 1]) {
      throw new Error(`Native drum grid keyboard recorder did not receive step ${expectedStep} (${keyCode}).`);
    }
  };
  const sendCommandKey = async (
    keyCode: string,
    modifiers: Electron.InputEvent["modifiers"]
  ): Promise<void> => {
    win.webContents.focus();
    await new Promise((resolve) => setTimeout(resolve, 50));
    win.webContents.sendInputEvent({ type: "keyDown", keyCode, modifiers });
    win.webContents.sendInputEvent({ type: "keyUp", keyCode, modifiers });
    await new Promise((resolve) => setTimeout(resolve, 500));
  };
  const captureCommandResult = async (expectedStep: number): Promise<void> => {
    await win.webContents.executeJavaScript(`window.__grooveforgeDrumGridKeyboardSmoke?.capture?.()`);
    const stepDeadline = Date.now() + 30000;
    while (Date.now() < stepDeadline && !recordedSteps[expectedStep - 1]) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (!recordedSteps[expectedStep - 1]) {
      throw new Error(`Native drum grid keyboard recorder did not capture command result step ${expectedStep}.`);
    }
  };
  const commandModifier: Electron.InputEvent["modifiers"] = process.platform === "darwin" ? ["meta"] : ["control"];

  onStep("sending native navigation and activation keys");
  await sendKey("Right", 1);
  await sendKey("Enter", 2);
  await sendCommandKey("Z", commandModifier);
  await captureCommandResult(3);
  await sendKey("Space", 4);
  await sendCommandKey("Z", commandModifier);
  await captureCommandResult(5);
  onStep("collecting renderer snapshots");
  const recorderDeadline = Date.now() + 20000;
  while (Date.now() < recorderDeadline && recordedSteps.filter(Boolean).length < 5) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  ipcMain.removeListener(launchSmokeDrumGridSnapshotChannel, handleRecorderSnapshot);
  const [afterRight, afterEnter, afterEnterUndo, afterSpace, afterSpaceUndo] = recordedSteps;
  if (!afterRight || !afterEnter || !afterEnterUndo || !afterSpace || !afterSpaceUndo) {
    throw new Error(
      `Native drum grid keyboard recorder returned ${recordedSteps.filter(Boolean).length}/5 snapshots ` +
        `(bridge ${recorderBridgeReady ? "ready" : "missing"}, initial focus ${initial.activeTestId || "none"}).`
    );
  }
  onStep("validating renderer snapshots");
  const navigationSnapshots = [afterRight];

  const evidence: LaunchSmokeDrumGridKeyboardEvidence = {
    activationSingleToggleReady:
      afterEnter.activeCount === afterRight.activeCount + 1 &&
      afterSpace.activeCount === afterRight.activeCount + 1,
    buttonCount: initial.buttonCount,
    enterToggleReady: afterEnter.activeTestId === "drum-step-kick-1" && afterEnter.targetPressed,
    nativeArrowReady: initial.activeTestId === "drum-step-kick-0" && afterRight.activeTestId === "drum-step-kick-1",
    navigationEventCountUnchanged: navigationSnapshots.every((item) => item.activeCount === initial.activeCount),
    navigationSelectionReady: navigationSnapshots.every(
      (item) =>
        item.selectedTestId === item.activeTestId &&
        item.tabStopTestIds.length === 1 &&
        item.tabStopTestIds[0] === item.activeTestId
    ),
    playbackStayedStopped: [
      initial,
      ...navigationSnapshots,
      afterEnter,
      afterEnterUndo,
      afterSpace,
      afterSpaceUndo
    ].every((item) => !item.playing),
    pressedSemanticsReady: initial.pressedSemanticsReady,
    rovingTabReady:
      initial.tabStopTestIds.length === 1 &&
      initial.tabStopTestIds[0] === "drum-step-kick-0" &&
      navigationSnapshots.every((item) => item.tabStopTestIds.length === 1),
    spaceToggleReady: afterSpace.activeTestId === "drum-step-kick-1" && afterSpace.targetPressed,
    undoRestored:
      !afterEnterUndo.targetPressed &&
      !afterSpaceUndo.targetPressed &&
      afterEnterUndo.activeCount === initial.activeCount &&
      afterSpaceUndo.activeCount === initial.activeCount
  };
  onStep("restoring initial editor selection");
  await runStep(`document.querySelector('[data-testid="chord-slot-0"]')?.focus();`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  return evidence;
}

function collectLaunchSmokeDrumGridKeyboardEvidenceWithTimeout(
  win: BrowserWindow
): Promise<LaunchSmokeDrumGridKeyboardEvidence> {
  return new Promise((resolve, reject) => {
    let step = "starting";
    const timeout = setTimeout(
      () => reject(new Error(`Timed out collecting native drum grid keyboard evidence at ${step}.`)),
      120000
    );
    void collectLaunchSmokeDrumGridKeyboardEvidence(win, (nextStep) => {
      step = nextStep;
    })
      .then((evidence) => {
        clearTimeout(timeout);
        resolve(evidence);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

async function collectLaunchSmokeNoteGridKeyboardEvidence(
  win: BrowserWindow,
  onStep: (step: string) => void = () => {}
): Promise<LaunchSmokeNoteGridKeyboardEvidence> {
  type NoteGridSnapshot = {
    activePitch: string;
    activeStep: number;
    activeTestId: string;
    activeTrack: string;
    bassActiveCount: number;
    bassButtonCount: number;
    bassTabStopTestIds: string[];
    melodyActiveCount: number;
    melodyButtonCount: number;
    melodyTabStopTestIds: string[];
    playing: boolean;
    pressedSemanticsReady: boolean;
    selectedTestId: string;
    targetPressed: boolean;
  };

  const runStep = async <T,>(script: string): Promise<T> => (await win.webContents.executeJavaScript(script)) as T;
  const recordedSteps: NoteGridSnapshot[] = [];
  const originalComposePage = (await readLaunchSmokeWorkspacePageState(win, "compose")).activePage;
  let recorderBridgeReady = false;
  const handleRecorderSnapshot = (event: Electron.IpcMainEvent, payload: unknown): void => {
    if (event.sender !== win.webContents || typeof payload !== "object" || payload === null) {
      return;
    }
    const candidate = payload as { snapshot?: unknown; step?: unknown };
    if (candidate.step === 0) {
      recorderBridgeReady = true;
      return;
    }
    if (
      typeof candidate.step === "number" &&
      Number.isInteger(candidate.step) &&
      candidate.step >= 1 &&
      candidate.step <= 6 &&
      typeof candidate.snapshot === "object" &&
      candidate.snapshot !== null
    ) {
      recordedSteps[candidate.step - 1] = candidate.snapshot as NoteGridSnapshot;
    }
  };
  ipcMain.on(launchSmokeNoteGridSnapshotChannel, handleRecorderSnapshot);

  try {
    await activateLaunchSmokeWorkspacePage(win, "compose", "notes");
    win.webContents.focus();
    onStep("installing renderer recorder");
    const initial = await runStep<NoteGridSnapshot>(`
      (() => {
        const snapshot = () => {
          const bassButtons = Array.from(document.querySelectorAll('[data-testid="note-grid-bass"] button'));
          const melodyButtons = Array.from(document.querySelectorAll('[data-testid="note-grid-melody"] button'));
          const buttons = [...bassButtons, ...melodyButtons];
          const selected = buttons.filter((button) => button.classList.contains('selected'));
          const active = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
          return {
            activePitch: active?.dataset.notePitch ?? '',
            activeStep: Number(active?.dataset.noteStep ?? -1),
            activeTestId: active?.dataset.testid ?? '',
            activeTrack: active?.dataset.noteTrack ?? '',
            bassActiveCount: bassButtons.filter((button) => button.getAttribute('aria-pressed') === 'true').length,
            bassButtonCount: bassButtons.length,
            bassTabStopTestIds: bassButtons.filter((button) => button.tabIndex === 0).map((button) => button.dataset.testid ?? ''),
            melodyActiveCount: melodyButtons.filter((button) => button.getAttribute('aria-pressed') === 'true').length,
            melodyButtonCount: melodyButtons.length,
            melodyTabStopTestIds: melodyButtons.filter((button) => button.tabIndex === 0).map((button) => button.dataset.testid ?? ''),
            playing: document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'true',
            pressedSemanticsReady: buttons.every(
              (button) => (button.getAttribute('aria-pressed') === 'true') === button.classList.contains('active')
            ),
            selectedTestId: selected.length === 1 ? selected[0]?.dataset.testid ?? '' : '',
            targetPressed: selected.length === 1 && selected[0]?.getAttribute('aria-pressed') === 'true'
          };
        };
        const recorder = { steps: [], listener: null, capture: null };
        recorder.capture = () => {
          const nextSnapshot = snapshot();
          recorder.steps.push(nextSnapshot);
          window.grooveforge?.reportLaunchSmokeNoteGridSnapshot?.({
            step: recorder.steps.length,
            snapshot: nextSnapshot
          });
          if (recorder.steps.length >= 6) {
            document.removeEventListener('keydown', recorder.listener, true);
          }
        };
        recorder.listener = (event) => {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
            return;
          }
          setTimeout(recorder.capture, 0);
        };
        window.__grooveforgeNoteGridKeyboardSmoke = recorder;
        document.addEventListener('keydown', recorder.listener, true);
        document.querySelector('[data-testid="note-grid-bass"] button[tabindex="0"]')?.focus();
        const initialSnapshot = snapshot();
        window.grooveforge?.reportLaunchSmokeNoteGridSnapshot?.({ step: 0, snapshot: initialSnapshot });
        return initialSnapshot;
      })();
    `);
    const sendKey = async (
      keyCode: string,
      expectedStep: number,
      modifiers: Electron.InputEvent["modifiers"] = []
    ): Promise<void> => {
      win.webContents.focus();
      await new Promise((resolve) => setTimeout(resolve, 50));
      win.webContents.sendInputEvent({ type: "keyDown", keyCode, modifiers });
      win.webContents.sendInputEvent({ type: "keyUp", keyCode, modifiers });
      const stepDeadline = Date.now() + 30000;
      while (Date.now() < stepDeadline && !recordedSteps[expectedStep - 1]) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (!recordedSteps[expectedStep - 1]) {
        throw new Error(`Native note-grid keyboard recorder did not receive step ${expectedStep} (${keyCode}).`);
      }
    };
    const sendCommandKey = async (
      keyCode: string,
      modifiers: Electron.InputEvent["modifiers"]
    ): Promise<void> => {
      win.webContents.focus();
      await new Promise((resolve) => setTimeout(resolve, 50));
      win.webContents.sendInputEvent({ type: "keyDown", keyCode, modifiers });
      win.webContents.sendInputEvent({ type: "keyUp", keyCode, modifiers });
      await new Promise((resolve) => setTimeout(resolve, 500));
    };
    const captureCommandResult = async (expectedStep: number): Promise<void> => {
      await win.webContents.executeJavaScript(`window.__grooveforgeNoteGridKeyboardSmoke?.capture?.()`);
      const stepDeadline = Date.now() + 30000;
      while (Date.now() < stepDeadline && !recordedSteps[expectedStep - 1]) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (!recordedSteps[expectedStep - 1]) {
        throw new Error(`Native note-grid keyboard recorder did not capture command result step ${expectedStep}.`);
      }
    };
    const commandModifier: Electron.InputEvent["modifiers"] = process.platform === "darwin" ? ["meta"] : ["control"];

    onStep("sending native spatial navigation and activation keys");
    await sendKey("Right", 1);
    await sendKey("Down", 2);
    await sendKey("Enter", 3);
    await sendCommandKey("Z", commandModifier);
    await captureCommandResult(4);
    await sendKey("Space", 5);
    await sendCommandKey("Z", commandModifier);
    await captureCommandResult(6);
    onStep("collecting renderer snapshots");
    const recorderDeadline = Date.now() + 20000;
    while (Date.now() < recorderDeadline && recordedSteps.filter(Boolean).length < 6) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const [afterRight, afterDown, afterEnter, afterEnterUndo, afterSpace, afterSpaceUndo] = recordedSteps;
    if (!afterRight || !afterDown || !afterEnter || !afterEnterUndo || !afterSpace || !afterSpaceUndo) {
      throw new Error(
        `Native note-grid keyboard recorder returned ${recordedSteps.filter(Boolean).length}/6 snapshots ` +
          `(bridge ${recorderBridgeReady ? "ready" : "missing"}, initial focus ${initial.activeTestId || "none"}).`
      );
    }
    onStep("validating renderer snapshots");
    const navigationSnapshots = [afterRight, afterDown];
    const allSnapshots = [initial, ...navigationSnapshots, afterEnter, afterEnterUndo, afterSpace, afterSpaceUndo];
    const evidence: LaunchSmokeNoteGridKeyboardEvidence = {
      activationSingleToggleReady:
        afterEnter.bassActiveCount === afterDown.bassActiveCount + 1 &&
        afterSpace.bassActiveCount === afterDown.bassActiveCount + 1,
      bassButtonCount: initial.bassButtonCount,
      enterToggleReady:
        afterEnter.activeTestId === afterDown.activeTestId &&
        afterEnter.selectedTestId === afterDown.selectedTestId &&
        afterEnter.targetPressed,
      melodyButtonCount: initial.melodyButtonCount,
      nativeArrowReady:
        initial.activeTrack === "bass" &&
        initial.activeStep === 0 &&
        afterRight.activeTrack === "bass" &&
        afterRight.activePitch === initial.activePitch &&
        afterRight.activeStep === 1 &&
        afterDown.activeTrack === "bass" &&
        afterDown.activePitch !== afterRight.activePitch &&
        afterDown.activeStep === afterRight.activeStep,
      navigationEventCountUnchanged: navigationSnapshots.every(
        (item) => item.bassActiveCount === initial.bassActiveCount && item.melodyActiveCount === initial.melodyActiveCount
      ),
      navigationSelectionReady: navigationSnapshots.every(
        (item) =>
          item.selectedTestId === item.activeTestId &&
          item.bassTabStopTestIds.length === 1 &&
          item.bassTabStopTestIds[0] === item.activeTestId &&
          item.melodyTabStopTestIds.length === 1
      ),
      playbackStayedStopped: allSnapshots.every((item) => !item.playing),
      pressedSemanticsReady: allSnapshots.every((item) => item.pressedSemanticsReady),
      rovingTabReady:
        initial.bassTabStopTestIds.length === 1 &&
        initial.bassTabStopTestIds[0] === initial.activeTestId &&
        initial.melodyTabStopTestIds.length === 1 &&
        navigationSnapshots.every(
          (item) => item.bassTabStopTestIds.length === 1 && item.melodyTabStopTestIds.length === 1
        ),
      spaceToggleReady:
        afterSpace.activeTestId === afterDown.activeTestId &&
        afterSpace.selectedTestId === afterDown.selectedTestId &&
        afterSpace.targetPressed,
      undoRestored:
        !afterEnterUndo.targetPressed &&
        !afterSpaceUndo.targetPressed &&
        afterEnterUndo.bassActiveCount === initial.bassActiveCount &&
        afterSpaceUndo.bassActiveCount === initial.bassActiveCount &&
        afterEnterUndo.melodyActiveCount === initial.melodyActiveCount &&
        afterSpaceUndo.melodyActiveCount === initial.melodyActiveCount
    };
    onStep("restoring initial editor selection");
    await runStep(`document.querySelector('[data-testid="compose-page-tab-notes"]')?.focus();`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return evidence;
  } finally {
    ipcMain.removeListener(launchSmokeNoteGridSnapshotChannel, handleRecorderSnapshot);
    if (originalComposePage) {
      await activateLaunchSmokeWorkspacePage(
        win,
        "compose",
        originalComposePage as LaunchSmokeComposeWorkspacePage
      ).catch(() => undefined);
    }
  }
}

function collectLaunchSmokeNoteGridKeyboardEvidenceWithTimeout(
  win: BrowserWindow
): Promise<LaunchSmokeNoteGridKeyboardEvidence> {
  return new Promise((resolve, reject) => {
    let step = "starting";
    const timeout = setTimeout(
      () => reject(new Error(`Timed out collecting native note-grid keyboard evidence at ${step}.`)),
      120000
    );
    void collectLaunchSmokeNoteGridKeyboardEvidence(win, (nextStep) => {
      step = nextStep;
    })
      .then((evidence) => {
        clearTimeout(timeout);
        resolve(evidence);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

async function collectLaunchSmokeModalFocusEvidence(
  win: BrowserWindow,
  onStep: (step: string) => void = () => {}
): Promise<LaunchSmokeModalFocusCoreEvidence> {
  type FocusSnapshot = {
    activeTestId: string;
    dialogOpen: boolean;
    firstTestId: string;
    focusInside: boolean;
    lastTestId: string;
  };
  type KeyboardSelectionSnapshot = {
    actionId: string;
    firstActionId: string;
    lastActionId: string;
    position: string;
    resultTitle: string;
    searchFocused: boolean;
    title: string;
  };

  const runStep = async <T,>(script: string): Promise<T> => (await win.webContents.executeJavaScript(script)) as T;
  const snapshot = (dialogTestId: string): Promise<FocusSnapshot> =>
    runStep<FocusSnapshot>(`
      (() => {
        const dialog = document.querySelector('[data-testid="${dialogTestId}"]');
        const elements = dialog
          ? Array.from(dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
              .filter((element) => element instanceof HTMLElement && element.getClientRects().length > 0 && element.getAttribute('aria-hidden') !== 'true')
          : [];
        const active = document.activeElement;
        return {
          activeTestId: active instanceof HTMLElement ? active.dataset.testid ?? '' : '',
          dialogOpen: dialog !== null,
          firstTestId: elements[0]?.dataset.testid ?? '',
          focusInside: Boolean(dialog && active && dialog.contains(active)),
          lastTestId: elements[elements.length - 1]?.dataset.testid ?? ''
        };
      })();
    `);
  const keyboardSelectionSnapshot = (): Promise<KeyboardSelectionSnapshot> =>
    runStep<KeyboardSelectionSnapshot>(`
      (() => {
        const status = document.querySelector('[data-testid="quick-actions-keyboard-selection"]');
        const rows = Array.from(document.querySelectorAll('.quick-action-row')).filter((row) => {
          const button = row.querySelector('.quick-action-run');
          return button instanceof HTMLButtonElement && !button.disabled;
        });
        return {
          actionId: status?.dataset.keyboardAction ?? '',
          firstActionId: rows[0]?.id?.replace('quick-action-option-', '') ?? '',
          lastActionId: rows[rows.length - 1]?.id?.replace('quick-action-option-', '') ?? '',
          position: document.querySelector('[data-testid="quick-actions-keyboard-selection-position"]')?.textContent?.trim() ?? '',
          resultTitle: document.querySelector('[data-testid="quick-action-result-title"]')?.textContent?.trim() ?? '',
          searchFocused: document.activeElement?.dataset?.testid === 'quick-actions-search',
          title: document.querySelector('[data-testid="quick-actions-keyboard-selection-title"]')?.textContent?.trim() ?? ''
        };
      })();
    `);
  const waitFor = async (condition: string, timeoutMs = 30000): Promise<void> => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() <= deadline) {
      if (await runStep<boolean>(`Boolean(${condition})`)) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Timed out waiting for modal focus condition: ${condition}`);
  };
  const focusBoundary = (dialogTestId: string, boundary: "first" | "last"): Promise<boolean> =>
    runStep<boolean>(`
      (() => {
        const dialog = document.querySelector('[data-testid="${dialogTestId}"]');
        if (!dialog) return false;
        const elements = Array.from(dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
          .filter((element) => element instanceof HTMLElement && element.getClientRects().length > 0 && element.getAttribute('aria-hidden') !== 'true');
        const target = elements[${boundary === "first" ? "0" : "elements.length - 1"}];
        target?.focus();
        return document.activeElement === target;
      })();
    `);
  const sendKey = async (keyCode: string, modifiers: Electron.InputEvent["modifiers"] = []): Promise<void> => {
    win.webContents.focus();
    await new Promise((resolve) => setTimeout(resolve, 50));
    win.webContents.sendInputEvent({ type: "keyDown", keyCode, modifiers });
    win.webContents.sendInputEvent({ type: "keyUp", keyCode, modifiers });
    await new Promise((resolve) => setTimeout(resolve, 80));
  };
  const sendClick = async (testId: string): Promise<void> => {
    const point = await runStep<{ x: number; y: number }>(`
      (() => {
        const target = document.querySelector('[data-testid="${testId}"]');
        const rect = target?.getBoundingClientRect();
        return { x: rect ? Math.round(rect.left + rect.width / 2) : -1, y: rect ? Math.round(rect.top + rect.height / 2) : -1 };
      })();
    `);
    if (point.x < 0 || point.y < 0) {
      throw new Error(`Could not locate native click target ${testId}.`);
    }
    win.webContents.focus();
    await new Promise((resolve) => setTimeout(resolve, 50));
    win.webContents.sendInputEvent({ type: "mouseMove", x: point.x, y: point.y });
    win.webContents.sendInputEvent({ type: "mouseDown", x: point.x, y: point.y, button: "left", clickCount: 1 });
    win.webContents.sendInputEvent({ type: "mouseUp", x: point.x, y: point.y, button: "left", clickCount: 1 });
    await new Promise((resolve) => setTimeout(resolve, 80));
  };
  const readDockPlayPosture = (): Promise<LaunchSmokeDockPlayPostureEvidence> =>
    runStep<LaunchSmokeDockPlayPostureEvidence>(`
      (() => {
        const dockPlay = document.querySelector('[data-testid="workspace-command-dock-play"]');
        const transportPlay = document.querySelector('[data-testid="transport-play"]');
        const rect = dockPlay?.getBoundingClientRect() ?? null;
        const hitTarget = rect
          ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
          : null;
        const playbackScope = [
          "playback-mode-arrangement",
          "transport-loop-block",
          "transport-loop-transition",
          "playback-mode-pattern"
        ].find((testId) =>
          document.querySelector('[data-testid="' + testId + '"]')?.getAttribute("aria-pressed") === "true"
        ) ?? "";
        return {
          activeTestId: document.activeElement instanceof HTMLElement ? document.activeElement.dataset.testid ?? "" : "",
          activeZone:
            document.querySelector('[role="tab"][aria-selected="true"]')?.id?.replace("workspace-tab-", "") ?? "",
          disabled: dockPlay instanceof HTMLButtonElement ? dockPlay.disabled : true,
          dockPressed: dockPlay?.getAttribute("aria-pressed") ?? "missing",
          dockText: dockPlay?.textContent?.trim() ?? "",
          height: rect?.height ?? 0,
          hitTargetTestId:
            hitTarget instanceof HTMLElement ? hitTarget.closest('[data-testid]')?.getAttribute("data-testid") ?? "" : "",
          left: rect?.left ?? -1,
          playbackScope,
          projectStatus: document.querySelector('[data-testid="project-status"]')?.textContent?.trim() ?? "",
          top: rect?.top ?? -1,
          transportPressed: transportPlay?.getAttribute("aria-pressed") ?? "missing",
          transportText: transportPlay?.textContent?.trim() ?? "",
          visible: Boolean(
            dockPlay &&
            rect &&
            rect.width > 0 &&
            rect.height > 0 &&
            rect.left >= 0 &&
            rect.right <= innerWidth &&
            rect.top >= 0 &&
            rect.bottom <= innerHeight
          ),
          width: rect?.width ?? 0
        };
      })();
    `);
  const sendDockPlayClick = async (): Promise<LaunchSmokeDockPlayPostureEvidence> => {
    const posture = await readDockPlayPosture();
    if (
      !posture.visible ||
      posture.disabled ||
      posture.hitTargetTestId !== "workspace-command-dock-play"
    ) {
      throw new Error(`Workspace command dock Play target is not visibly native-clickable: ${JSON.stringify(posture)}`);
    }
    await sendClick("workspace-command-dock-play");
    return posture;
  };

  const commandModifier: Electron.InputEvent["modifiers"] = process.platform === "darwin" ? ["meta"] : ["control"];
  const editableTitleBefore = await runStep<string>(`
    (() => {
      const input = document.querySelector('[data-testid="project-title-input"]');
      input?.focus();
      return input instanceof HTMLInputElement ? input.value : '';
    })();
  `);
  onStep("opening Quick Actions from editable title field");
  await sendKey("K", commandModifier);
  await waitFor(`document.activeElement?.dataset?.testid === 'quick-actions-search'`);
  const quickShortcutFromEditable = await runStep<boolean>(
    `document.querySelector('[data-testid="quick-actions"]') !== null`
  );
  const quickInitial = await snapshot("quick-actions-dialog");
  onStep("entering broad keyboard-selection query");
  await runStep(`
    (() => {
      const input = document.querySelector('[data-testid="quick-actions-search"]');
      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      valueSetter?.call(input, 'audience session enter');
      input?.dispatchEvent(new Event('input', { bubbles: true }));
    })();
  `);
  await waitFor(
    `document.querySelector('[data-testid="quick-actions-search"]')?.value === 'audience session enter' && document.querySelector('[data-testid="quick-actions-keyboard-selection"]')?.dataset?.keyboardAction !== 'none'`
  );
  const keyboardInitial = await keyboardSelectionSnapshot();
  onStep("moving broad keyboard selection");
  await sendKey("Down");
  const keyboardAfterDown = await keyboardSelectionSnapshot();
  await sendKey("Up");
  const keyboardAfterUp = await keyboardSelectionSnapshot();
  await sendKey("End");
  const keyboardAfterEnd = await keyboardSelectionSnapshot();
  await sendKey("Home");
  const keyboardAfterHome = await keyboardSelectionSnapshot();
  onStep("entering narrow Enter Studio query");
  await runStep(`
    (() => {
      const input = document.querySelector('[data-testid="quick-actions-search"]');
      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      valueSetter?.call(input, 'enter studio professional producer');
      input?.dispatchEvent(new Event('input', { bubbles: true }));
    })();
  `);
  await waitFor(
    `document.querySelector('[data-testid="quick-actions-search"]')?.value === 'enter studio professional producer' && document.querySelector('[data-testid="quick-action-audience-session-enter-producer"]') !== null`
  );
  let keyboardBeforeEnter = await keyboardSelectionSnapshot();
  const enterStudioMoveCount = await runStep<number>(`
    (() => {
      const selectedId = document.querySelector('[data-testid="quick-actions-keyboard-selection"]')?.dataset?.keyboardAction ?? '';
      const ids = Array.from(document.querySelectorAll('.quick-action-row'))
        .filter((row) => {
          const button = row.querySelector('.quick-action-run');
          return button instanceof HTMLButtonElement && !button.disabled;
        })
        .map((row) => row.id.replace('quick-action-option-', ''));
      const currentIndex = Math.max(0, ids.indexOf(selectedId));
      const targetIndex = ids.indexOf('audience-session-enter-producer');
      return targetIndex < 0 ? -1 : (targetIndex - currentIndex + ids.length) % ids.length;
    })();
  `);
  if (enterStudioMoveCount < 0) {
    throw new Error("Visible Enter Studio Quick Action was not part of the runnable keyboard selection set.");
  }
  onStep("moving to Enter Studio action");
  for (let index = 0; index < enterStudioMoveCount; index += 1) {
    await sendKey("Down");
  }
  keyboardBeforeEnter = await keyboardSelectionSnapshot();
  if (keyboardBeforeEnter.actionId !== "audience-session-enter-producer") {
    throw new Error("Native ArrowDown could not reach the visible Enter Studio Quick Action.");
  }
  onStep("running selected Enter Studio action");
  await sendKey("Enter");
  await waitFor(
    `document.querySelector('[data-testid="quick-actions"]') === null && document.querySelector('[data-testid="quick-action-result-title"]')?.textContent?.trim() === ${JSON.stringify(keyboardBeforeEnter.title)} && document.querySelector('[data-testid="mode-studio"]')?.classList.contains('selected') === true`
  );
  const keyboardAfterEnter = await keyboardSelectionSnapshot();
  onStep("restoring Guided mode after keyboard execution");
  await runStep(`document.querySelector('[data-testid="mode-guided"]')?.click();`);
  await waitFor(`document.querySelector('[data-testid="mode-guided"]')?.classList.contains('selected') === true`);
  await runStep(`document.querySelector('[data-testid="project-title-input"]')?.focus();`);
  await sendKey("K", commandModifier);
  await waitFor(`document.activeElement?.dataset?.testid === 'quick-actions-search'`);
  onStep("checking Quick Actions focus wrap");
  await focusBoundary("quick-actions-dialog", "last");
  const quickBeforeForward = await snapshot("quick-actions-dialog");
  await sendKey("Tab");
  const quickAfterForward = await snapshot("quick-actions-dialog");
  await focusBoundary("quick-actions-dialog", "first");
  const quickBeforeBackward = await snapshot("quick-actions-dialog");
  await sendKey("Tab", ["shift"]);
  const quickAfterBackward = await snapshot("quick-actions-dialog");
  await sendKey("Escape");
  await waitFor(`document.querySelector('[data-testid="quick-actions"]') === null && document.activeElement?.dataset?.testid === 'project-title-input'`);
  const quickClosed = await runStep<{ activeTestId: string; open: boolean }>(`(() => ({ activeTestId: document.activeElement?.dataset?.testid ?? '', open: document.querySelector('[data-testid="quick-actions"]') !== null }))();`);

  onStep("checking Command Reference focus wrap");
  await sendKey("/", commandModifier);
  await waitFor(`document.activeElement?.dataset?.testid === 'command-reference-search-input'`);
  const commandShortcutFromEditable = await runStep<boolean>(
    `document.querySelector('[data-testid="command-reference"]') !== null`
  );
  await sendKey("/", ["shift"]);
  win.webContents.sendInputEvent({ type: "char", keyCode: "?" });
  await waitFor(`document.querySelector('[data-testid="command-reference-search-input"]')?.value?.includes('?') === true`);
  const editableQuestionTyped = await runStep<boolean>(`
    document.querySelector('[data-testid="command-reference-search-input"]')?.value?.includes('?') === true &&
      document.querySelector('[data-testid="quick-actions"]') === null
  `);
  const commandInitial = await snapshot("command-reference-dialog");
  await focusBoundary("command-reference-dialog", "last");
  const commandBeforeForward = await snapshot("command-reference-dialog");
  await sendKey("Tab");
  const commandAfterForward = await snapshot("command-reference-dialog");
  await focusBoundary("command-reference-dialog", "first");
  const commandBeforeBackward = await snapshot("command-reference-dialog");
  await sendKey("Tab", ["shift"]);
  const commandAfterBackward = await snapshot("command-reference-dialog");
  await sendKey("Escape");
  await waitFor(`document.querySelector('[data-testid="command-reference"]') === null && document.activeElement?.dataset?.testid === 'project-title-input'`);
  const commandClosed = await runStep<{ activeTestId: string; open: boolean }>(`(() => ({ activeTestId: document.activeElement?.dataset?.testid ?? '', open: document.querySelector('[data-testid="command-reference"]') !== null }))();`);

  onStep("checking cross-dialog focus restore");
  await sendKey("K", commandModifier);
  await waitFor(`document.activeElement?.dataset?.testid === 'quick-actions-search'`);
  await sendKey("/", commandModifier);
  await waitFor(`document.activeElement?.dataset?.testid === 'command-reference-search-input'`);
  const switchInitial = await snapshot("command-reference-dialog");
  const quickToCommandShortcut = await runStep<boolean>(
    `document.querySelector('[data-testid="command-reference"]') !== null && document.querySelector('[data-testid="quick-actions"]') === null`
  );
  await sendKey("K", commandModifier);
  await waitFor(`document.activeElement?.dataset?.testid === 'quick-actions-search'`);
  const commandToQuickShortcut = await runStep<boolean>(
    `document.querySelector('[data-testid="quick-actions"]') !== null && document.querySelector('[data-testid="command-reference"]') === null`
  );
  await sendKey("Escape");
  await waitFor(`document.querySelector('[data-testid="quick-actions"]') === null && document.activeElement?.dataset?.testid === 'project-title-input'`);
  const switchClosed = await runStep<{ activeTestId: string; open: boolean }>(`(() => ({ activeTestId: document.activeElement?.dataset?.testid ?? '', open: document.querySelector('[data-testid="quick-actions"]') !== null }))();`);
  const editableFinal = await runStep<{ activeTestId: string; title: string }>(`
    (() => ({
      activeTestId: document.activeElement?.dataset?.testid ?? '',
      title: document.querySelector('[data-testid="project-title-input"]')?.value ?? ''
    }))();
  `);

  onStep("checking persistent workspace command dock");
  const dockInitialHidden = await runStep<boolean>(
    `document.querySelector('[data-testid="workspace-command-dock"]') === null`
  );
  await runStep(`
    new Promise((resolve) => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  `);
  await waitFor(`document.querySelector('[data-testid="workspace-command-dock"]') !== null`);
  const dockPlayOriginal = await readDockPlayPosture();
  const dockOriginalPlaybackRunning =
    dockPlayOriginal.dockPressed === "true" && dockPlayOriginal.transportPressed === "true";
  if (dockOriginalPlaybackRunning) {
    await sendDockPlayClick();
    await waitFor(
      `document.querySelector('[data-testid="workspace-command-dock-play"]')?.getAttribute('aria-pressed') === 'false' && document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'false'`
    );
  }
  const dockPlayBefore = await readDockPlayPosture();
  const dockSnapshot = await runStep<{
    controlCount: number;
    positionMirrorsHeader: boolean;
    shortcutMetadataReady: boolean;
    undoRedoParity: boolean;
    viewportReady: boolean;
    visible: boolean;
  }>(`
    (() => {
      const dock = document.querySelector('[data-testid="workspace-command-dock"]');
      const dockPosition = document.querySelector('[data-testid="workspace-command-dock-position"]');
      const headerPosition = document.querySelector('[data-testid="transport-position-readout"]');
      const dockUndo = document.querySelector('[data-testid="workspace-command-dock-undo"]');
      const dockRedo = document.querySelector('[data-testid="workspace-command-dock-redo"]');
      const headerUndo = document.querySelector('[data-testid="undo-button"]');
      const headerRedo = document.querySelector('[data-testid="redo-button"]');
      const controls = dock ? Array.from(dock.querySelectorAll('button')) : [];
      const rect = dock?.getBoundingClientRect() ?? null;
      return {
        controlCount: controls.length,
        positionMirrorsHeader: Boolean(
          dockPosition && headerPosition && dockPosition.textContent?.trim() === headerPosition.textContent?.trim()
        ),
        shortcutMetadataReady: controls.every((control) => (control.getAttribute('aria-keyshortcuts') ?? '').length > 0),
        undoRedoParity: Boolean(
          dockUndo instanceof HTMLButtonElement &&
          dockRedo instanceof HTMLButtonElement &&
          headerUndo instanceof HTMLButtonElement &&
          headerRedo instanceof HTMLButtonElement &&
          dockUndo.disabled === headerUndo.disabled &&
          dockRedo.disabled === headerRedo.disabled
        ),
        viewportReady: Boolean(
          rect && rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.right <= innerWidth &&
          rect.top >= 0 && rect.bottom <= innerHeight
        ),
        visible: Boolean(dock && rect && rect.width > 0 && rect.height > 0)
      };
    })();
  `);
  const dockFocusReady = await runStep<boolean>(`
    (() => {
      const target = document.querySelector('[data-testid="workspace-command-dock-play"]');
      target?.focus();
      return document.activeElement === target;
    })();
  `);
  await sendDockPlayClick();
  await waitFor(
    `document.querySelector('[data-testid="workspace-command-dock-play"]')?.getAttribute('aria-pressed') === 'true' && document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'true'`
  );
  const dockPlayAfterStart = await readDockPlayPosture();
  const dockSharedPlayReady = await runStep<boolean>(`
    document.querySelector('[data-testid="workspace-command-dock-play"]')?.textContent?.trim() === 'Stop' &&
      document.querySelector('[data-testid="transport-play"] strong')?.textContent?.trim() === 'Stop'
  `);
  await sendDockPlayClick();
  await waitFor(
    `document.querySelector('[data-testid="workspace-command-dock-play"]')?.getAttribute('aria-pressed') === 'false' && document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'false'`
  );
  const dockPlayAfterStop = await readDockPlayPosture();
  await sendClick("workspace-command-dock-actions");
  await waitFor(`document.activeElement?.dataset?.testid === 'quick-actions-search'`);
  const dockActionsOpened = await runStep<boolean>(
    `document.querySelector('[data-testid="quick-actions"]') !== null`
  );
  await sendKey("Escape");
  await waitFor(
    `document.querySelector('[data-testid="quick-actions"]') === null && document.activeElement?.dataset?.testid === 'workspace-command-dock-actions'`
  );
  const dockActionsFocusRestored = await runStep<boolean>(
    `document.activeElement?.dataset?.testid === 'workspace-command-dock-actions'`
  );
  if (dockOriginalPlaybackRunning) {
    await sendDockPlayClick();
    await waitFor(
      `document.querySelector('[data-testid="workspace-command-dock-play"]')?.getAttribute('aria-pressed') === 'true' && document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'true'`
    );
  }
  const dockRestoredPlaybackPosture = await readDockPlayPosture();
  const dockOriginalPlaybackRestored =
    dockRestoredPlaybackPosture.dockPressed === dockPlayOriginal.dockPressed &&
    dockRestoredPlaybackPosture.transportPressed === dockPlayOriginal.transportPressed;
  const dockPostureRestored =
    dockRestoredPlaybackPosture.activeZone === dockPlayOriginal.activeZone &&
    dockRestoredPlaybackPosture.playbackScope === dockPlayOriginal.playbackScope;
  await runStep(`
    new Promise((resolve) => {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
  `);
  await waitFor(`document.querySelector('[data-testid="workspace-command-dock"]') === null`);
  const dockReturnedHidden = await runStep<boolean>(
    `document.querySelector('[data-testid="workspace-command-dock"]') === null`
  );
  if (dockPlayOriginal.activeTestId) {
    await sendClick(dockPlayOriginal.activeTestId);
    await waitFor(`document.activeElement?.dataset?.testid === ${JSON.stringify(dockPlayOriginal.activeTestId)}`);
  }

  onStep("modal focus evidence complete");
  return {
    commandShortcutFromEditable,
    commandBackwardWrap:
      commandBeforeBackward.activeTestId === commandBeforeBackward.firstTestId &&
      commandAfterBackward.activeTestId === commandBeforeBackward.lastTestId &&
      commandAfterBackward.focusInside,
    commandEscapeClosed: !commandClosed.open,
    commandFocusRestored: commandClosed.activeTestId === "project-title-input",
    commandForwardWrap:
      commandBeforeForward.activeTestId === commandBeforeForward.lastTestId &&
      commandAfterForward.activeTestId === commandBeforeForward.firstTestId &&
      commandAfterForward.focusInside,
    commandInitialFocus: commandInitial.activeTestId,
    dockActionsOpened,
    dockActionsFocusRestored,
    dockControlCount: dockSnapshot.controlCount,
    dockFocusReady,
    dockInitialHidden,
    dockOriginalPlaybackRestored,
    dockPlayAfterStart,
    dockPlayAfterStop,
    dockPlayBefore,
    dockPlayHitTargetReady: [dockPlayOriginal, dockPlayBefore, dockPlayAfterStart, dockPlayAfterStop].every(
      (posture) =>
        posture.visible &&
        !posture.disabled &&
        posture.hitTargetTestId === "workspace-command-dock-play"
    ),
    dockPlayOriginal,
    dockPositionMirrorsHeader: dockSnapshot.positionMirrorsHeader,
    dockPostureRestored,
    dockReturnedHidden,
    dockSharedPlayReady,
    dockShortcutMetadataReady: dockSnapshot.shortcutMetadataReady,
    dockUndoRedoParity: dockSnapshot.undoRedoParity,
    dockViewportReady: dockSnapshot.viewportReady,
    dockVisible: dockSnapshot.visible,
    editableFocusRestored: editableFinal.activeTestId === "project-title-input",
    editableQuestionTyped,
    editableValuePreserved: editableFinal.title === editableTitleBefore,
    modifiedShortcutHandoff: commandToQuickShortcut && quickToCommandShortcut,
    quickBackwardWrap:
      quickBeforeBackward.activeTestId === quickBeforeBackward.firstTestId &&
      quickAfterBackward.activeTestId === quickBeforeBackward.lastTestId &&
      quickAfterBackward.focusInside,
    quickEscapeClosed: !quickClosed.open,
    quickFocusRestored: quickClosed.activeTestId === "project-title-input",
    quickForwardWrap:
      quickBeforeForward.activeTestId === quickBeforeForward.lastTestId &&
      quickAfterForward.activeTestId === quickBeforeForward.firstTestId &&
      quickAfterForward.focusInside,
    quickInitialFocus: quickInitial.activeTestId,
    quickKeyboardArrowDownMoved:
      keyboardAfterDown.actionId !== keyboardInitial.actionId && keyboardAfterDown.actionId !== "",
    quickKeyboardArrowUpReturned: keyboardAfterUp.actionId === keyboardInitial.actionId,
    quickKeyboardEndMovedLast:
      keyboardAfterEnd.actionId === keyboardInitial.lastActionId && keyboardAfterEnd.actionId !== keyboardInitial.actionId,
    quickKeyboardEnterRanSelected:
      keyboardBeforeEnter.title.length > 0 && keyboardAfterEnter.resultTitle === keyboardBeforeEnter.title,
    quickKeyboardFocusRetained: [
      keyboardInitial,
      keyboardAfterDown,
      keyboardAfterUp,
      keyboardAfterEnd,
      keyboardAfterHome,
      keyboardBeforeEnter
    ].every((snapshot) => snapshot.searchFocused),
    quickKeyboardHomeReturnedFirst: keyboardAfterHome.actionId === keyboardInitial.firstActionId,
    quickKeyboardInitialAction: keyboardInitial.actionId,
    quickKeyboardResultTitle: keyboardAfterEnter.resultTitle,
    quickKeyboardSelectedTitle: keyboardBeforeEnter.title,
    quickShortcutFromEditable,
    switchFocusRestored: !switchClosed.open && switchClosed.activeTestId === "project-title-input",
    switchInitialFocus: switchInitial.activeTestId
  };
}

function collectLaunchSmokeModalFocusEvidenceWithTimeout(
  win: BrowserWindow,
  onStep: (step: string) => void = () => {}
): Promise<LaunchSmokeModalFocusCoreEvidence> {
  return new Promise((resolve, reject) => {
    let step = "starting";
    const timeout = setTimeout(() => reject(new Error(`Timed out collecting live modal focus evidence at ${step}.`)), 600000);
    void collectLaunchSmokeModalFocusEvidence(win, (nextStep) => {
      step = nextStep;
      onStep(nextStep);
    })
      .then((evidence) => {
        clearTimeout(timeout);
        resolve(evidence);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

async function collectLaunchSmokeCommandReferenceEvidence(win: BrowserWindow): Promise<LaunchSmokeCommandReferenceEvidence> {
  const readEvidenceScript = `
    (() => {
      const readText = (testId) => document.querySelector('[data-testid="' + testId + '"]')?.textContent?.trim() ?? "";
      const contextText = readText("command-reference-item-audience-starter-context");
      const targetText = readText("command-reference-item-audience-starter-target");
      return {
        contextHasDirectComposition: /direct composition posture/i.test(contextText),
        contextHasFollowupRoutes:
          contextText.includes("First Beat Path") &&
          contextText.includes("Dual Audience Readiness") &&
          contextText.includes("Review Queue") &&
          contextText.includes("Export Preflight") &&
          contextText.includes("Handoff Package Check"),
        contextHasResultMetric: contextText.includes("Audience Starter result metric"),
        contextHasStarterCommands: contextText.includes("Build Starter Project commands"),
        contextText,
        handoffButtonPresent: document.querySelector('[data-testid="command-reference-spotlight-open-quick-actions"]') !== null,
        itemPresent: document.querySelector('[data-testid="command-reference-item-audience-starter"]') !== null,
        opened: document.querySelector('[data-testid="command-reference"]') !== null,
        quickActionsOpenedAfterHandoff: document.querySelector('[data-testid="quick-actions"]') !== null,
        searchCountText: readText("command-reference-search-count"),
        searchInputPresent: document.querySelector('[data-testid="command-reference-search-input"]') !== null,
        searchQuery: document.querySelector('[data-testid="command-reference-search-input"]')?.value ?? "",
        spotlightContext: readText("command-reference-spotlight-context"),
        spotlightDetail: readText("command-reference-spotlight-detail"),
        spotlightId: document.querySelector('[data-testid="command-reference-spotlight"]')?.dataset.commandReferenceSpotlight ?? "",
        spotlightLabel: readText("command-reference-spotlight-label"),
        targetHasAudienceTargets: targetText.includes("first-time composer") && targetText.includes("professional producer"),
        targetText
      };
    })();
  `;

  const runCommandReferenceStep = async <T,>(step: string, script: string, timeoutMs: number): Promise<T> =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Timed out during Command Reference ${step}.`)), timeoutMs);
      void win.webContents
        .executeJavaScript(script)
        .then((result) => {
          clearTimeout(timeout);
          resolve(result as T);
        })
        .catch((error: unknown) => {
          clearTimeout(timeout);
          reject(error);
        });
    });

  const initial = await runCommandReferenceStep<{ launchSmokeReady: boolean; openButtonPresent: boolean }>(
    "readiness check",
    `
      (() => ({
        launchSmokeReady: window.grooveforge?.launchSmoke === true,
        openButtonPresent: document.querySelector('[data-testid="command-reference-open"]') !== null
      }))();
    `,
    30000
  );
  if (!initial.launchSmokeReady || !initial.openButtonPresent) {
    throw new Error("Launch smoke Command Reference DOM was not ready.");
  }

  const opened = await runCommandReferenceStep<boolean>(
    "open button click",
    `
      (() => {
        const openButton = document.querySelector('[data-testid="command-reference-open"]');
        if (!openButton) {
          return false;
        }
        openButton.click();
        return true;
      })();
    `,
    45000
  );
  if (!opened) {
    throw new Error("Launch smoke Command Reference open button was missing.");
  }

  const inputReady = await runCommandReferenceStep<{ ready: boolean; evidence: LaunchSmokeCommandReferenceEvidence }>(
    "search input readiness",
    `
      new Promise((resolve) => {
        const started = Date.now();
        const readEvidence = () => ${readEvidenceScript};
        const tick = () => {
          const evidence = readEvidence();
          if (evidence.opened === true && evidence.searchInputPresent === true) {
            resolve({ ready: true, evidence });
            return;
          }
          if (Date.now() - started > 30000) {
            resolve({ ready: false, evidence });
            return;
          }
          setTimeout(tick, 50);
        };
        tick();
      });
    `,
    45000
  );
  if (!inputReady.ready) {
    throw new Error("Launch smoke Command Reference search input was not ready.");
  }

  const searched = await runCommandReferenceStep<boolean>(
    "search query entry",
    `
      (() => {
        const input = document.querySelector('[data-testid="command-reference-search-input"]');
        if (!input) {
          return false;
        }
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        valueSetter?.call(input, "audience starter");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        return true;
      })();
    `,
    10000
  );
  if (!searched) {
    throw new Error("Launch smoke Command Reference search input disappeared.");
  }

  const searchReady = await runCommandReferenceStep<{ ready: boolean; evidence: LaunchSmokeCommandReferenceEvidence }>(
    "Audience Starter search result readiness",
    `
      new Promise((resolve) => {
        const started = Date.now();
        const readEvidence = () => ${readEvidenceScript};
        const tick = () => {
          const evidence = readEvidence();
          if (
            evidence.searchQuery === "audience starter" &&
            evidence.itemPresent === true &&
            evidence.spotlightId === "command-audience-starter"
          ) {
            resolve({ ready: true, evidence });
            return;
          }
          if (Date.now() - started > 45000) {
            resolve({ ready: false, evidence });
            return;
          }
          setTimeout(tick, 50);
        };
        tick();
      });
    `,
    60000
  );
  if (!searchReady.ready) {
    throw new Error("Launch smoke Command Reference Audience Starter result was not ready.");
  }

  const handoffClicked = await runCommandReferenceStep<boolean>(
    "Quick Actions handoff",
    `
      (() => {
        const handoffButton = document.querySelector('[data-testid="command-reference-spotlight-open-quick-actions"]');
        if (!handoffButton) {
          return false;
        }
        handoffButton.click();
        return true;
      })();
    `,
    10000
  );
  if (!handoffClicked) {
    throw new Error("Launch smoke Command Reference Quick Actions handoff button disappeared.");
  }

  const handoffReady = await runCommandReferenceStep<{ ready: boolean; evidence: LaunchSmokeCommandReferenceEvidence }>(
    "Quick Actions handoff readiness",
    `
      new Promise((resolve) => {
        const started = Date.now();
        const readEvidence = () => ${readEvidenceScript};
        const tick = () => {
          const evidence = readEvidence();
          if (evidence.quickActionsOpenedAfterHandoff === true) {
            resolve({ ready: true, evidence });
            return;
          }
          if (Date.now() - started > 30000) {
            resolve({ ready: false, evidence });
            return;
          }
          setTimeout(tick, 50);
        };
        tick();
      });
    `,
    45000
  );

  return {
    ...searchReady.evidence,
    quickActionsOpenedAfterHandoff: handoffReady.evidence.quickActionsOpenedAfterHandoff
  } as LaunchSmokeCommandReferenceEvidence;
}

function collectLaunchSmokeCommandReferenceEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokeCommandReferenceEvidence> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out collecting live Command Reference evidence.")), 240000);
    void collectLaunchSmokeCommandReferenceEvidence(win)
      .then((evidence) => {
        clearTimeout(timeout);
        resolve(evidence);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

function runProjectIoSmokeRendererStep<T>(
  win: BrowserWindow,
  label: string,
  script: string,
  timeoutMs = 30000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out during project IO smoke ${label}.`)), timeoutMs);
    void win.webContents
      .executeJavaScript(script)
      .then((result: T) => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch((error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

function projectIoSmokeUiFingerprintFromSource(sourceContents: string): ProjectIoSmokeUiFingerprint {
  const parsed: unknown = JSON.parse(sourceContents);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Project IO smoke source should contain a JSON object.");
  }
  const wrapper = parsed as Record<string, unknown>;
  const candidate = wrapper.app === "GrooveForge" ? wrapper.project : wrapper;
  if (typeof candidate !== "object" || candidate === null) {
    throw new Error("Project IO smoke source should contain a GrooveForge project object.");
  }
  const project = candidate as Record<string, unknown>;
  if (
    typeof project.title !== "string" ||
    typeof project.bpm !== "number" ||
    !Number.isFinite(project.bpm) ||
    typeof project.key !== "string" ||
    typeof project.styleId !== "string" ||
    typeof project.mode !== "string" ||
    typeof project.selectedPattern !== "string"
  ) {
    throw new Error("Project IO smoke source is missing the title, BPM, key, style, mode, or selected Pattern UI fingerprint.");
  }
  return {
    bpm: project.bpm,
    key: project.key,
    mode: project.mode,
    selectedPattern: project.selectedPattern,
    styleId: project.styleId,
    title: project.title
  };
}

function projectIoSmokeUiFingerprintDigest(fingerprint: ProjectIoSmokeUiFingerprint): string {
  return createHash("sha256").update(JSON.stringify(fingerprint)).digest("hex");
}

async function readProjectIoSmokeUiFingerprint(win: BrowserWindow): Promise<ProjectIoSmokeUiFingerprint> {
  return runProjectIoSmokeRendererStep<ProjectIoSmokeUiFingerprint>(
    win,
    "rendered project fingerprint",
    `(() => {
      const titleInput = document.querySelector('[data-testid="project-title-input"]');
      const bpmInput = document.querySelector('[data-testid="project-bpm-input"]');
      const keySelect = document.querySelector('[data-testid="project-key-select"]');
      const styleSelect = document.querySelector('[data-testid="style-select"]');
      const selectedMode = ["guided", "studio"].find((mode) =>
        document.querySelector('[data-testid="mode-' + mode + '"]')?.classList.contains("selected")
      ) ?? "";
      const selectedPattern =
        document.querySelector('[data-testid^="pattern-tab-"][aria-selected="true"]')
          ?.getAttribute("data-testid")
          ?.replace("pattern-tab-", "") ?? "";
      return {
        bpm: bpmInput instanceof HTMLInputElement && bpmInput.value !== "" ? Number(bpmInput.value) : -1,
        key: keySelect instanceof HTMLSelectElement ? keySelect.value : "",
        mode: selectedMode,
        selectedPattern,
        styleId: styleSelect instanceof HTMLSelectElement ? styleSelect.value : "",
        title: titleInput instanceof HTMLInputElement ? titleInput.value : ""
      };
    })()`
  );
}

function projectIoSmokeUiFingerprintsMatch(
  source: ProjectIoSmokeUiFingerprint,
  rendered: ProjectIoSmokeUiFingerprint
): boolean {
  return projectIoSmokeUiFingerprintDigest(source) === projectIoSmokeUiFingerprintDigest(rendered);
}

async function clickProjectIoSmokeNativeOpen(win: BrowserWindow): Promise<ProjectIoSmokeNativeOpenActivationEvidence> {
  const activation = await runProjectIoSmokeRendererStep<ProjectIoSmokeNativeOpenActivationEvidence>(
    win,
    "native Open hit test",
    `(() => {
      const testId = "project-open";
      const target = document.querySelector('[data-testid="' + testId + '"]');
      if (!(target instanceof HTMLElement)) {
        return { hitTestMatched: false, point: null, targetPresent: false, targetVisible: false, testId };
      }
      target.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
      const rect = target.getBoundingClientRect();
      const style = getComputedStyle(target);
      const targetVisible =
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden";
      if (!targetVisible) {
        return { hitTestMatched: false, point: null, targetPresent: true, targetVisible, testId };
      }
      const point = {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2)
      };
      const hit = document.elementFromPoint(point.x, point.y);
      return {
        hitTestMatched: hit === target || (hit instanceof Node && target.contains(hit)),
        point,
        targetPresent: true,
        targetVisible,
        testId
      };
    })()`
  );
  if (!activation.targetPresent || !activation.targetVisible || !activation.hitTestMatched || !activation.point) {
    throw new Error("Could not hit-test the visible project Open button for native pointer activation.");
  }

  win.show();
  win.focus();
  win.webContents.focus();
  win.webContents.sendInputEvent({ type: "mouseMove", x: activation.point.x, y: activation.point.y });
  win.webContents.sendInputEvent({
    type: "mouseDown",
    x: activation.point.x,
    y: activation.point.y,
    button: "left",
    clickCount: 1
  });
  win.webContents.sendInputEvent({
    type: "mouseUp",
    x: activation.point.x,
    y: activation.point.y,
    button: "left",
    clickCount: 1
  });
  await new Promise((resolve) => setTimeout(resolve, 140));
  return activation;
}

async function collectProjectIoSmokeEvidence(win: BrowserWindow): Promise<ProjectIoSmokeEvidence> {
  const sourcePath = process.env.GROOVEFORGE_DESKTOP_PROJECT_IO_SOURCE_PATH;
  const targetPath = projectIoSmokePath();
  if (!sourcePath || !targetPath) {
    throw new Error("Project IO smoke requires source and target path environment variables.");
  }

  const sourceContents = await readFile(sourcePath, "utf8");
  const sourceUiFingerprint = projectIoSmokeUiFingerprintFromSource(sourceContents);
  const defaultName = path.basename(targetPath);
  const metadata = await runProjectIoSmokeRendererStep<
    Pick<
      ProjectIoSmokeEvidence,
      | "appKind"
      | "hasOpenProject"
      | "hasPreloadBridge"
      | "hasRecoveryBridge"
      | "hasSaveProject"
      | "location"
      | "readyState"
      | "samplingTextPresent"
      | "title"
    >
  >(
    win,
    "bridge readiness",
    `(() => {
      const bridge = window.grooveforge;
      const bodyText = document.body?.textContent ?? "";
      return {
        appKind: bridge?.appKind ?? null,
        hasOpenProject: typeof bridge?.openProject === "function",
        hasPreloadBridge: Boolean(bridge),
        hasRecoveryBridge:
          typeof bridge?.saveProjectRecovery === "function" &&
          typeof bridge?.loadProjectRecovery === "function" &&
          typeof bridge?.clearProjectRecovery === "function",
        hasSaveProject: typeof bridge?.saveProject === "function",
        location: window.location.href,
        readyState: document.readyState,
        samplingTextPresent: /AudioClipEvent|sample import|sample browser|chop pads|sampler track|audio clip/i.test(bodyText),
        title: document.title
      };
    })()`
  );
  const saveResult = await runProjectIoSmokeRendererStep<{
    canceled?: boolean;
    databaseStored?: boolean;
    filePath?: string;
  }>(
    win,
    "native save",
    `(async () => window.grooveforge?.saveProject?.(${JSON.stringify(sourceContents)}, ${JSON.stringify(defaultName)}))()`
  );
  const openResult = await runProjectIoSmokeRendererStep<{
    canceled?: boolean;
    contents?: string;
    filePath?: string;
  }>(win, "native open", `(async () => window.grooveforge?.openProject?.())()`);
  const preOpenState = await runProjectIoSmokeRendererStep<{
    projectOpenButtonPresent: boolean;
    recoveryPresent: boolean;
  }>(
    win,
    "Open button preparation",
    `(() => {
      const button = document.querySelector('[data-testid="project-open"]');
      window.__grooveforgeProjectIoSmokeOriginalConfirm = window.confirm;
      window.__grooveforgeProjectIoSmokeConfirmMessages = [];
      window.confirm = (message) => {
        window.__grooveforgeProjectIoSmokeConfirmMessages.push(String(message));
        return true;
      };
      return {
        projectOpenButtonPresent: button !== null,
        recoveryPresent: document.querySelector('[data-testid="local-draft-recovery"]') !== null
      };
    })()`
  );
  const nativeOpenActivation = await clickProjectIoSmokeNativeOpen(win);

  let launchpadCollapsedAfterUiOpen = false;
  let renderedUiFingerprint = await readProjectIoSmokeUiFingerprint(win);
  let uiFingerprintMatched = projectIoSmokeUiFingerprintsMatch(sourceUiFingerprint, renderedUiFingerprint);
  const uiOpenDeadline = Date.now() + 15000;
  while ((!launchpadCollapsedAfterUiOpen || !uiFingerprintMatched) && Date.now() < uiOpenDeadline) {
    const uiOpenState = await runProjectIoSmokeRendererStep<{
      fingerprint: ProjectIoSmokeUiFingerprint;
      launchpadCollapsed: boolean;
    }>(
      win,
      "Open button result",
      `(() => {
        const titleInput = document.querySelector('[data-testid="project-title-input"]');
        const bpmInput = document.querySelector('[data-testid="project-bpm-input"]');
        const keySelect = document.querySelector('[data-testid="project-key-select"]');
        const styleSelect = document.querySelector('[data-testid="style-select"]');
        return {
          fingerprint: {
            bpm: bpmInput instanceof HTMLInputElement && bpmInput.value !== "" ? Number(bpmInput.value) : -1,
            key: keySelect instanceof HTMLSelectElement ? keySelect.value : "",
            mode: ["guided", "studio"].find((mode) =>
              document.querySelector('[data-testid="mode-' + mode + '"]')?.classList.contains("selected")
            ) ?? "",
            selectedPattern:
              document.querySelector('[data-testid^="pattern-tab-"][aria-selected="true"]')
                ?.getAttribute("data-testid")
                ?.replace("pattern-tab-", "") ?? "",
            styleId: styleSelect instanceof HTMLSelectElement ? styleSelect.value : "",
            title: titleInput instanceof HTMLInputElement ? titleInput.value : ""
          },
          launchpadCollapsed: document.querySelector('[data-testid="first-run-launchpad"]')?.open === false
        };
      })()`,
      60000
    );
    launchpadCollapsedAfterUiOpen = uiOpenState.launchpadCollapsed;
    renderedUiFingerprint = uiOpenState.fingerprint;
    uiFingerprintMatched = projectIoSmokeUiFingerprintsMatch(sourceUiFingerprint, renderedUiFingerprint);
    if (!launchpadCollapsedAfterUiOpen || !uiFingerprintMatched) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  const replacementConfirmCallCount = await runProjectIoSmokeRendererStep<number>(
    win,
    "replacement confirmation cleanup",
    `(() => {
      const messages = window.__grooveforgeProjectIoSmokeConfirmMessages ?? [];
      window.confirm = window.__grooveforgeProjectIoSmokeOriginalConfirm;
      delete window.__grooveforgeProjectIoSmokeOriginalConfirm;
      delete window.__grooveforgeProjectIoSmokeConfirmMessages;
      return messages.length;
    })()`
  );
  const recoverySaveResult = await runProjectIoSmokeRendererStep<{ savedAt?: string }>(
    win,
    "recovery save",
    `(async () => window.grooveforge?.saveProjectRecovery?.(${JSON.stringify(sourceContents)}))()`
  );
  const recoveryLoadResult = await runProjectIoSmokeRendererStep<{ contents?: string; savedAt?: string } | null>(
    win,
    "recovery load",
    `(async () => window.grooveforge?.loadProjectRecovery?.())()`
  );
  const recoveryClearResult = await runProjectIoSmokeRendererStep<{ cleared?: boolean }>(
    win,
    "recovery clear",
    `(async () => window.grooveforge?.clearProjectRecovery?.())()`
  );
  const recoveryAfterClear = await runProjectIoSmokeRendererStep<unknown>(
    win,
    "recovery verification",
    `(async () => window.grooveforge?.loadProjectRecovery?.())()`
  );

  return {
    ...metadata,
    defaultName,
    launchpadCollapsedAfterUiOpen,
    nativeOpenActivation,
    openResult: {
      canceled: openResult?.canceled === true,
      contentsLength: typeof openResult?.contents === "string" ? openResult.contents.length : undefined,
      contentsMatched: openResult?.contents === sourceContents,
      filePath: openResult?.filePath
    },
    preOpenRecoveryPresent: preOpenState.recoveryPresent,
    projectOpenButtonPresent: preOpenState.projectOpenButtonPresent,
    recoveryResult: {
      cleared: recoveryClearResult?.cleared === true,
      contentsMatched: recoveryLoadResult?.contents === sourceContents,
      emptyAfterClear: recoveryAfterClear === null,
      narrowSaveResponse:
        recoverySaveResult !== null &&
        typeof recoverySaveResult === "object" &&
        !("contents" in recoverySaveResult),
      savedAtReady:
        typeof recoverySaveResult?.savedAt === "string" &&
        recoverySaveResult.savedAt === recoveryLoadResult?.savedAt
    },
    saveResult: {
      canceled: saveResult?.canceled === true,
      databaseStored: saveResult?.databaseStored,
      filePath: saveResult?.filePath
    },
    replacementConfirmCallCount,
    sourceLength: sourceContents.length,
    targetPath,
    uiFingerprint: {
      matched: uiFingerprintMatched,
      rendered: renderedUiFingerprint,
      renderedDigest: projectIoSmokeUiFingerprintDigest(renderedUiFingerprint),
      source: sourceUiFingerprint,
      sourceDigest: projectIoSmokeUiFingerprintDigest(sourceUiFingerprint)
    }
  };
}

function projectIoSmokeFailures(evidence: ProjectIoSmokeEvidence): string[] {
  const failures: string[] = [];
  if (evidence.title !== "GrooveForge") {
    failures.push(`document title should be GrooveForge, got ${evidence.title}`);
  }
  if (!evidence.location.startsWith("file:")) {
    failures.push(`production renderer should load from file:, got ${evidence.location}`);
  }
  if (evidence.readyState !== "interactive" && evidence.readyState !== "complete") {
    failures.push(`document readyState should be interactive or complete, got ${evidence.readyState}`);
  }
  if (evidence.appKind !== "desktop") {
    failures.push(`preload appKind should be desktop, got ${String(evidence.appKind)}`);
  }
  if (!evidence.hasPreloadBridge || !evidence.hasSaveProject || !evidence.hasOpenProject || !evidence.hasRecoveryBridge) {
    failures.push("preload bridge should expose project file and recovery operations");
  }
  if (!evidence.projectOpenButtonPresent || !evidence.launchpadCollapsedAfterUiOpen) {
    failures.push("project Open UI should load the configured project and collapse the first-run launchpad");
  }
  if (
    !evidence.nativeOpenActivation.targetPresent ||
    !evidence.nativeOpenActivation.targetVisible ||
    !evidence.nativeOpenActivation.hitTestMatched ||
    evidence.nativeOpenActivation.point === null
  ) {
    failures.push("project Open UI should be visibly hit-tested and activated through native pointer input");
  }
  if (
    !evidence.uiFingerprint.matched ||
    evidence.uiFingerprint.sourceDigest !== evidence.uiFingerprint.renderedDigest
  ) {
    failures.push(
      `project Open UI should render the source title, BPM, key, style, mode, and selected Pattern fingerprint; expected ${JSON.stringify(evidence.uiFingerprint.source)}, got ${JSON.stringify(evidence.uiFingerprint.rendered)}`
    );
  }
  if (evidence.preOpenRecoveryPresent || evidence.replacementConfirmCallCount !== 0) {
    failures.push("isolated project IO smoke should open without a recovery banner or replacement confirmation");
  }
  if (evidence.saveResult.canceled) {
    failures.push("native saveProject should not be canceled in project IO smoke");
  }
  if (evidence.saveResult.filePath !== evidence.targetPath) {
    failures.push("native saveProject should write to the smoke target path");
  }
  if (evidence.openResult.canceled) {
    failures.push("native openProject should not be canceled in project IO smoke");
  }
  if (evidence.openResult.filePath !== evidence.targetPath) {
    failures.push("native openProject should read from the smoke target path");
  }
  if (evidence.openResult.contentsLength !== evidence.sourceLength) {
    failures.push("native openProject should return the same content length saved by saveProject");
  }
  if (evidence.openResult.contentsMatched !== true) {
    failures.push("native openProject should return the exact saved project contents");
  }
  if (
    !evidence.recoveryResult.contentsMatched ||
    !evidence.recoveryResult.savedAtReady ||
    !evidence.recoveryResult.cleared ||
    !evidence.recoveryResult.emptyAfterClear ||
    !evidence.recoveryResult.narrowSaveResponse
  ) {
    failures.push("native SQLite recovery should save, load, and clear the exact project contents");
  }
  if (evidence.samplingTextPresent) {
    failures.push("renderer should not expose sampling-first language in project IO smoke");
  }
  return failures;
}

function installLaunchSmoke(win: BrowserWindow): void {
  let finished = false;
  let audienceSessionLayoutEvidence: LaunchSmokeAudienceSessionLayoutEvidence | null = null;
  let closedDetailsEvidence: LaunchSmokeClosedDetailsEvidence | null = null;
  let drumGridKeyboardEvidence: LaunchSmokeDrumGridKeyboardEvidence | null = null;
  let functionalTabsEvidence: LaunchSmokeFunctionalTabsEvidence | null = null;
  let noteGridKeyboardEvidence: LaunchSmokeNoteGridKeyboardEvidence | null = null;
  let minimumWindowEvidence: LaunchSmokeMinimumWindowEvidence | null = null;
  let lastProgress: Record<string, unknown> = { phase: "waiting-ready-to-show" };
  let lastReportedProgress = "";
  const updateProgress = (progress: Record<string, unknown>): void => {
    lastProgress = progress;
    const progressFailures = Array.isArray(progress.failures)
      ? progress.failures
          .slice(0, 8)
          .map((failure) => String(failure).slice(0, 320))
      : [];
    const publicProgress = {
      phase: typeof progress.phase === "string" ? progress.phase : "unknown",
      ...(typeof progress.step === "string" ? { step: progress.step } : {}),
      ...(progressFailures.length > 0
        ? {
            failureCount: Array.isArray(progress.failures) ? progress.failures.length : 0,
            failures: progressFailures
          }
        : {})
    };
    const serialized = JSON.stringify(publicProgress);
    if (serialized !== lastReportedProgress) {
      lastReportedProgress = serialized;
      console.log(`${launchSmokeProgressPrefix}${serialized}`);
    }
  };
  updateProgress(lastProgress);
  const timeout = setTimeout(() => {
    if (!finished) {
      finished = true;
      launchSmokeFailure("Timed out before the production desktop renderer completed the launch smoke.", { lastProgress });
    }
  }, launchSmokeTimeoutMs);

  const fail = (message: string, details: Record<string, unknown> = {}): void => {
    if (finished) {
      return;
    }
    finished = true;
    clearTimeout(timeout);
    launchSmokeFailure(message, details);
  };

  win.webContents.once("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    fail("Production renderer failed to load.", { errorCode, errorDescription, validatedURL });
  });

  win.webContents.once("render-process-gone", (_event, details) => {
    fail("Production renderer process exited before smoke completed.", { reason: details.reason });
  });

  const poll = (deadline: number): void => {
    updateProgress({ phase: "collecting-dom" });
    void collectLaunchSmokeEvidenceWithTimeout(win)
      .then((evidence) => {
        if (audienceSessionLayoutEvidence) {
          evidence = {
            ...evidence,
            layout: {
              ...evidence.layout,
              ...audienceSessionLayoutEvidence
            }
          };
        }
        if (minimumWindowEvidence) {
          evidence = {
            ...evidence,
            layout: {
              ...evidence.layout,
              ...minimumWindowEvidence
            }
          };
        }
        if (functionalTabsEvidence) {
          evidence = { ...evidence, functionalTabs: functionalTabsEvidence };
        }
        if (finished) {
          return;
        }

        const failures = launchSmokeFailures(evidence);
        updateProgress({ phase: "dom-collected", evidence, failures });
        if (failures.length === 0) {
          if (!functionalTabsEvidence) {
            updateProgress({ phase: "collecting-functional-tabs", evidence });
            return collectLaunchSmokeFunctionalTabsEvidenceWithTimeout(win, (step) => {
              updateProgress({ phase: "collecting-functional-tabs", step, evidence });
            })
              .then((collectedEvidence) => {
                if (finished) {
                  return;
                }
                const functionalTabFailures = launchSmokeFunctionalTabsFailures(collectedEvidence);
                functionalTabsEvidence = collectedEvidence;
                updateProgress({
                  phase: "functional-tabs-collected",
                  evidence: { ...evidence, functionalTabs: collectedEvidence },
                  failures: functionalTabFailures
                });
                if (functionalTabFailures.length > 0) {
                  fail("Production desktop functional tab screen smoke failed.", {
                    evidence: collectedEvidence,
                    failures: functionalTabFailures
                  });
                  return;
                }
                setTimeout(() => poll(deadline), 100);
              })
              .catch((error: unknown) => {
                fail("Production desktop functional tab screen evidence failed.", {
                  error: error instanceof Error ? error.message : String(error)
                });
              });
          }
          if (!closedDetailsEvidence) {
            updateProgress({ phase: "collecting-closed-details", evidence });
            return collectLaunchSmokeClosedDetailsEvidenceWithTimeout(win)
              .then((collectedEvidence) => {
                if (finished) {
                  return;
                }
                closedDetailsEvidence = collectedEvidence;
                updateProgress({
                  phase: "closed-details-collected",
                  evidence: { ...evidence, closedDetails: collectedEvidence }
                });
                setTimeout(() => poll(deadline), 100);
              })
              .catch((error: unknown) => {
                fail("Production desktop closed disclosure JavaScript failed.", {
                  error: error instanceof Error ? error.message : String(error)
                });
              });
          }
          if (!drumGridKeyboardEvidence) {
            updateProgress({ phase: "collecting-drum-grid-keyboard", evidence });
            return collectLaunchSmokeDrumGridKeyboardEvidenceWithTimeout(win)
              .then((collectedEvidence) => {
                if (finished) {
                  return;
                }
                drumGridKeyboardEvidence = collectedEvidence;
                updateProgress({
                  phase: "drum-grid-keyboard-collected",
                  evidence: { ...evidence, drumGrid: collectedEvidence }
                });
                setTimeout(() => poll(deadline), 100);
              })
              .catch((error: unknown) => {
                fail("Production desktop drum grid keyboard JavaScript failed.", {
                  error: error instanceof Error ? error.message : String(error)
                });
              });
          }
          if (!noteGridKeyboardEvidence) {
            updateProgress({ phase: "collecting-note-grid-keyboard", evidence });
            return collectLaunchSmokeNoteGridKeyboardEvidenceWithTimeout(win)
              .then((collectedEvidence) => {
                if (finished) {
                  return;
                }
                noteGridKeyboardEvidence = collectedEvidence;
                updateProgress({
                  phase: "note-grid-keyboard-collected",
                  evidence: { ...evidence, drumGrid: drumGridKeyboardEvidence, noteGrid: collectedEvidence }
                });
                setTimeout(() => poll(deadline), 100);
              })
              .catch((error: unknown) => {
                fail("Production desktop note-grid keyboard JavaScript failed.", {
                  error: error instanceof Error ? error.message : String(error)
                });
              });
          }
          updateProgress({ phase: "collecting-bridge-direct", evidence });
          return collectLaunchSmokeBridgeDirectEvidenceWithTimeout(win)
            .then((bridgeDirectEvidence) => {
              if (finished) {
                return;
              }

              const bridgeDirectFailures = launchSmokeBridgeDirectFailures(bridgeDirectEvidence);
              const evidenceWithBridgeDirect = { ...evidence, bridgeDirect: bridgeDirectEvidence };
              updateProgress({ phase: "bridge-direct-collected", evidence: evidenceWithBridgeDirect, failures: bridgeDirectFailures });
              if (bridgeDirectFailures.length > 0) {
                if (Date.now() >= deadline) {
                  fail("Production desktop Audience Route Bridge direct button smoke failed.", {
                    evidence: evidenceWithBridgeDirect,
                    failures: bridgeDirectFailures
                  });
                } else {
                  setTimeout(() => poll(deadline), 100);
                }
                return;
              }

              updateProgress({ phase: "collecting-palette", evidence: evidenceWithBridgeDirect });
              return collectLaunchSmokePaletteEvidenceWithTimeout(win)
                .then((paletteEvidence) => {
                  if (finished) {
                    return;
                  }

                  const paletteFailures = launchSmokePaletteFailures(paletteEvidence);
                  const evidenceWithPalette = { ...evidenceWithBridgeDirect, palette: paletteEvidence };
                  updateProgress({ phase: "palette-collected", evidence: evidenceWithPalette, failures: paletteFailures });
                  if (paletteFailures.length > 0) {
                    if (Date.now() >= deadline) {
                      fail("Production desktop live Quick Actions palette smoke failed.", {
                        evidence: evidenceWithPalette,
                        failures: paletteFailures
                      });
                    } else {
                      setTimeout(() => poll(deadline), 100);
                    }
                    return;
                  }

                  updateProgress({ phase: "collecting-starter-landing", evidence: evidenceWithPalette });
                  return collectLaunchSmokeStarterLandingEvidenceWithTimeout(win)
                    .then((starterLandingEvidence) => {
                      const evidenceWithStarterLanding = { ...evidenceWithPalette, starterLanding: starterLandingEvidence };
                      updateProgress({ phase: "starter-landing-collected", evidence: evidenceWithStarterLanding });
                      updateProgress({ phase: "collecting-modal-focus", evidence: evidenceWithStarterLanding });
                      return collectLaunchSmokeModalFocusEvidenceWithTimeout(win, (step) => {
                        updateProgress({ phase: "collecting-modal-focus", step, evidence: evidenceWithStarterLanding });
                      })
                        .then(
                          (modalFocusCoreEvidence): LaunchSmokeModalFocusEvidence => ({
                            ...modalFocusCoreEvidence,
                            closedDetails: closedDetailsEvidence as LaunchSmokeClosedDetailsEvidence,
                            drumGrid: drumGridKeyboardEvidence as LaunchSmokeDrumGridKeyboardEvidence,
                            noteGrid: noteGridKeyboardEvidence as LaunchSmokeNoteGridKeyboardEvidence
                          })
                        )
                        .then((modalFocusEvidence) => {
                          if (finished) {
                            return;
                          }
                          const modalFocusFailures = launchSmokeModalFocusFailures(modalFocusEvidence);
                          const evidenceWithModalFocus = { ...evidenceWithStarterLanding, modalFocus: modalFocusEvidence };
                          updateProgress({
                            phase: "modal-focus-collected",
                            evidence: evidenceWithModalFocus,
                            failures: modalFocusFailures
                          });
                          if (modalFocusFailures.length > 0) {
                            fail("Production desktop modal focus lifecycle smoke failed.", {
                              evidence: evidenceWithModalFocus,
                              failures: modalFocusFailures
                            });
                            return;
                          }

                          updateProgress({ phase: "collecting-command-reference", evidence: evidenceWithModalFocus });
                          return collectLaunchSmokeCommandReferenceEvidenceWithTimeout(win)
                        .then((commandReferenceEvidence) => {
                      if (finished) {
                        return;
                      }

                      const commandReferenceFailures = launchSmokeCommandReferenceFailures(commandReferenceEvidence);
                      const evidenceWithCommandReference = { ...evidenceWithModalFocus, commandReference: commandReferenceEvidence };
                      updateProgress({
                        phase: "command-reference-collected",
                        evidence: evidenceWithCommandReference,
                        failures: commandReferenceFailures
                      });
                      if (commandReferenceFailures.length > 0) {
                        if (Date.now() >= deadline) {
                          fail("Production desktop Command Reference launch smoke failed.", {
                            evidence: evidenceWithCommandReference,
                            failures: commandReferenceFailures
                          });
                        } else {
                          setTimeout(() => poll(deadline), 100);
                        }
                        return;
                      }

                      updateProgress({ phase: "collecting-visual", evidence: evidenceWithCommandReference });
                      return collectLaunchSmokeVisualEvidenceWithTimeout(win)
                        .then((visualEvidence) => {
                          if (finished) {
                            return;
                          }

                          const visualFailures = launchSmokeVisualFailures(visualEvidence);
                          updateProgress({
                            phase: "visual-collected",
                            evidence: evidenceWithCommandReference,
                            visualEvidence,
                            failures: visualFailures
                          });
                          if (visualFailures.length > 0) {
                            if (Date.now() >= deadline) {
                              fail("Production desktop visual launch smoke failed.", {
                                evidence: evidenceWithCommandReference,
                                visualEvidence,
                                failures: visualFailures
                              });
                            } else {
                              setTimeout(() => poll(deadline), 100);
                            }
                            return;
                          }

                          finished = true;
                          clearTimeout(timeout);
                          console.log(
                            `${launchSmokeResultPrefix}${JSON.stringify({ ok: true, evidence: { ...evidenceWithCommandReference, visual: visualEvidence } })}`
                          );
                          exitDesktopSmoke(0);
                        })
                        .catch((error: unknown) => {
                          fail("Production desktop screenshot capture failed.", {
                            error: error instanceof Error ? error.message : String(error)
                          });
                        });
                        })
                        .catch((error: unknown) => {
                          fail("Production desktop Command Reference JavaScript failed.", {
                            error: error instanceof Error ? error.message : String(error)
                          });
                        });
                        })
                        .catch((error: unknown) => {
                          fail("Production desktop modal focus lifecycle JavaScript failed.", {
                            error: error instanceof Error ? error.message : String(error)
                          });
                        });
                    })
                    .catch((error: unknown) => {
                      fail("Production desktop Audience Starter landing JavaScript failed.", {
                        error: error instanceof Error ? error.message : String(error)
                      });
                    });
                })
                .catch((error: unknown) => {
                  fail("Production desktop live Quick Actions palette JavaScript failed.", {
                    error: error instanceof Error ? error.message : String(error)
                  });
                });
            })
            .catch((error: unknown) => {
              if (Date.now() >= deadline) {
                fail("Production desktop Audience Route Bridge direct button JavaScript failed.", {
                  error: error instanceof Error ? error.message : String(error)
                });
                return;
              }

              updateProgress({
                phase: "bridge-direct-retrying",
                evidence,
                error: error instanceof Error ? error.message : String(error)
              });
              setTimeout(() => poll(deadline), 250);
            });
        }

        if (Date.now() >= deadline) {
          fail("Production desktop renderer launch smoke failed.", { evidence, failures });
          return;
        }

        setTimeout(() => poll(deadline), 100);
      })
      .catch((error: unknown) => {
        if (Date.now() >= deadline) {
          fail("Production renderer smoke JavaScript failed.", {
            error: error instanceof Error ? error.message : String(error)
          });
          return;
        }

        setTimeout(() => poll(deadline), 250);
      });
  };

  win.once("ready-to-show", () => {
    updateProgress({ phase: "collecting-minimum-window" });
    void collectLaunchSmokeMinimumWindowEvidence(win)
      .then(async (evidence) => {
        minimumWindowEvidence = evidence;
        updateProgress({ phase: "minimum-window-collected", evidence });
        updateProgress({ phase: "preparing-lazy-surfaces" });
        audienceSessionLayoutEvidence = await prepareLaunchSmokeLazySurfaces(win);
        updateProgress({ phase: "lazy-surfaces-prepared" });
        poll(Date.now() + launchSmokeTimeoutMs - 35000);
      })
      .catch((error: unknown) => {
        fail("Production minimum-window or lazy-surface preparation JavaScript failed.", {
          error: error instanceof Error ? error.message : String(error)
        });
      });
  });
}

function installProjectIoSmoke(win: BrowserWindow): void {
  let finished = false;
  const timeout = setTimeout(() => {
    if (!finished) {
      finished = true;
      projectIoSmokeFailure("Timed out before the production desktop renderer completed the project IO smoke.");
    }
  }, projectIoSmokeTimeoutMs);

  const fail = (message: string, details: Record<string, unknown> = {}): void => {
    if (finished) {
      return;
    }
    finished = true;
    clearTimeout(timeout);
    projectIoSmokeFailure(message, details);
  };

  win.webContents.once("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    fail("Production renderer failed to load for project IO smoke.", { errorCode, errorDescription, validatedURL });
  });

  win.webContents.once("render-process-gone", (_event, details) => {
    fail("Production renderer process exited before project IO smoke completed.", { reason: details.reason });
  });

  win.once("ready-to-show", () => {
    void collectProjectIoSmokeEvidence(win)
      .then((evidence) => {
        if (finished) {
          return;
        }

        const failures = projectIoSmokeFailures(evidence);
        if (failures.length > 0) {
          fail("Production desktop project IO smoke failed.", { evidence, failures });
          return;
        }

        finished = true;
        clearTimeout(timeout);
        console.log(`${projectIoSmokeResultPrefix}${JSON.stringify({ ok: true, evidence })}`);
        exitDesktopSmoke(0);
      })
      .catch((error: unknown) => {
        fail("Production project IO smoke JavaScript failed.", {
          error: error instanceof Error ? error.message : String(error)
        });
      });
  });
}

function closeFlowSmokeFailures(savedContents: string): string[] {
  const failures: string[] = [];
  let savedTitle: unknown = null;
  try {
    const savedFile = JSON.parse(savedContents) as { project?: { title?: unknown } };
    savedTitle = savedFile.project?.title;
  } catch {
    failures.push("saved close-flow project should be valid JSON");
  }

  if (!closeFlowSmokeState.liveEdit?.inputPresent) {
    failures.push("production project title input should be present");
  }
  if (closeFlowSmokeState.liveEdit?.initialTitle === closeFlowSmokeExpectedTitle) {
    failures.push("live close-flow edit should change the starter title");
  }
  if (closeFlowSmokeState.liveEdit?.title !== closeFlowSmokeExpectedTitle) {
    failures.push("live renderer edit should reach the expected title");
  }
  if (!closeFlowSmokeState.liveEdit?.nativeInputApplied) {
    failures.push("live renderer edit should use native focused text input");
  }
  if (!closeFlowSmokeState.liveEdit?.focusedDraft) {
    failures.push("live renderer edit should remain focused as an unblurred metadata draft before close");
  }
  if (closeFlowSmokeState.liveEdit?.blurredBeforeClose) {
    failures.push("live renderer edit should exercise the focused-draft close boundary before blur");
  }
  if (!closeFlowSmokeState.liveEdit?.hitTargetMatched || !closeFlowSmokeState.liveEdit?.valueExact) {
    failures.push("live renderer title input should be visible, hit-testable, and contain the exact native value");
  }
  if (
    closeFlowSmokeState.liveEdit?.selectionStartBeforeInput !== 0 ||
    closeFlowSmokeState.liveEdit?.selectionEndBeforeInput !== closeFlowSmokeState.liveEdit?.selectionLengthBeforeInput
  ) {
    failures.push("live renderer title input should prove native select-all before replacement text");
  }
  if (closeFlowSmokeState.willPreventUnloadCount !== 1) {
    failures.push(`first close should be prevented exactly once, got ${closeFlowSmokeState.willPreventUnloadCount}`);
  }
  if (!closeFlowSmokeState.smokeChoiceSubstituted) {
    failures.push("smoke-only Save and close choice should be selected");
  }
  if (closeFlowSmokeState.nativeSaveCount !== 1) {
    failures.push(`native project writer should run exactly once, got ${closeFlowSmokeState.nativeSaveCount}`);
  }
  if (closeFlowSmokeState.closeRequestCount !== 1) {
    failures.push(`renderer should request the second guarded close exactly once, got ${closeFlowSmokeState.closeRequestCount}`);
  }
  if (closeFlowSmokeState.nativeSavePath !== closeFlowSmokePath()) {
    failures.push("native project writer should use the ignored close-flow target path");
  }
  if (closeFlowSmokeState.nativeSaveDefaultName !== "close-flow-smoke-beat.grooveforge.json") {
    failures.push("renderer Save should derive the project file name from the exact live edit");
  }
  if (savedTitle !== closeFlowSmokeExpectedTitle) {
    failures.push("saved project should contain the exact live renderer edit");
  }

  const expectedEvents = [
    "live-edit-ready",
    "first-close-requested",
    "first-close-prevented",
    "smoke-save-choice",
    "native-save-started",
    "native-save-completed",
    "renderer-close-request",
    "window-closed"
  ];
  if (JSON.stringify(closeFlowSmokeState.events) !== JSON.stringify(expectedEvents)) {
    failures.push(`close-flow event order should be ${expectedEvents.join(" -> ")}`);
  }
  return failures;
}

async function prepareCloseFlowSmokeNativeTitleEdit(win: BrowserWindow): Promise<CloseFlowSmokeLiveEditEvidence> {
  const expectedTitle = closeFlowSmokeExpectedTitle;
  const deadline = Date.now() + 120000;
  let target: {
    height: number;
    hitTargetMatched: boolean;
    hitTargetTestId: string;
    initialTitle: string;
    inputPresent: boolean;
    width: number;
    x: number;
    y: number;
  } = {
    height: 0,
    hitTargetMatched: false,
    hitTargetTestId: "",
    initialTitle: "",
    inputPresent: false,
    width: 0,
    x: -1,
    y: -1
  };
  while (Date.now() < deadline) {
    target = (await win.webContents.executeJavaScript(`
      (() => {
        const input = document.querySelector('[data-testid="project-title-input"]');
        if (!(input instanceof HTMLInputElement)) {
          return {
            height: 0,
            hitTargetMatched: false,
            hitTargetTestId: "",
            initialTitle: "",
            inputPresent: false,
            width: 0,
            x: -1,
            y: -1
          };
        }
        input.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
        const rect = input.getBoundingClientRect();
        const x = Math.round(rect.left + rect.width / 2);
        const y = Math.round(rect.top + rect.height / 2);
        const hitTarget = document.elementFromPoint(x, y);
        if (input.dataset.closeFlowDraftObserver !== "installed") {
          input.dataset.closeFlowDraftObserver = "installed";
          input.dataset.closeFlowBlurred = "false";
          input.dataset.closeFlowNativeInput = "false";
          input.addEventListener("blur", () => {
            input.dataset.closeFlowBlurred = "true";
          }, { once: true });
          input.addEventListener("input", (event) => {
            input.dataset.closeFlowNativeInput = event.isTrusted ? "true" : "false";
          });
        }
        return {
          height: rect.height,
          hitTargetMatched: input === hitTarget || Boolean(hitTarget && input.contains(hitTarget)),
          hitTargetTestId:
            hitTarget instanceof HTMLElement ? hitTarget.closest('[data-testid]')?.getAttribute("data-testid") ?? "" : "",
          initialTitle: input.value,
          inputPresent: true,
          width: rect.width,
          x,
          y
        };
      })();
    `)) as typeof target;
    if (
      target.inputPresent &&
      target.width > 0 &&
      target.height > 0 &&
      target.hitTargetMatched &&
      target.x >= 0 &&
      target.y >= 0
    ) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (
    !target.inputPresent ||
    target.width <= 0 ||
    target.height <= 0 ||
    !target.hitTargetMatched ||
    target.x < 0 ||
    target.y < 0
  ) {
    throw new Error(`Could not hit-test the visible production title input: ${JSON.stringify(target)}`);
  }

  win.webContents.focus();
  win.webContents.sendInputEvent({ type: "mouseMove", x: target.x, y: target.y });
  win.webContents.sendInputEvent({
    type: "mouseDown",
    x: target.x,
    y: target.y,
    button: "left",
    clickCount: 1
  });
  win.webContents.sendInputEvent({
    type: "mouseUp",
    x: target.x,
    y: target.y,
    button: "left",
    clickCount: 1
  });

  let focused = false;
  while (Date.now() < deadline) {
    focused = (await win.webContents.executeJavaScript(
      `document.activeElement?.getAttribute("data-testid") === "project-title-input"`
    )) as boolean;
    if (focused) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (!focused) {
    throw new Error("Native pointer input did not focus the production title field.");
  }

  const commandModifier: Electron.InputEvent["modifiers"] = process.platform === "darwin" ? ["meta"] : ["control"];
  win.webContents.sendInputEvent({ type: "keyDown", keyCode: "A", modifiers: commandModifier });
  win.webContents.sendInputEvent({ type: "keyUp", keyCode: "A", modifiers: commandModifier });
  await new Promise((resolve) => setTimeout(resolve, 120));
  const selection = (await win.webContents.executeJavaScript(`
    (() => {
      const input = document.querySelector('[data-testid="project-title-input"]');
      return input instanceof HTMLInputElement
        ? {
            end: input.selectionEnd ?? -1,
            length: input.value.length,
            start: input.selectionStart ?? -1
          }
        : { end: -1, length: -1, start: -1 };
    })();
  `)) as { end: number; length: number; start: number };
  let nativeSelectAllFallbackUsed = false;
  if (selection.start !== 0 || selection.end !== selection.length) {
    nativeSelectAllFallbackUsed = true;
    win.webContents.sendInputEvent({ type: "keyDown", keyCode: "Home" });
    win.webContents.sendInputEvent({ type: "keyUp", keyCode: "Home" });
    await new Promise((resolve) => setTimeout(resolve, 80));
    win.webContents.sendInputEvent({ type: "keyDown", keyCode: "End", modifiers: ["shift"] });
    win.webContents.sendInputEvent({ type: "keyUp", keyCode: "End", modifiers: ["shift"] });
    await new Promise((resolve) => setTimeout(resolve, 120));
    Object.assign(selection, (await win.webContents.executeJavaScript(`
      (() => {
        const input = document.querySelector('[data-testid="project-title-input"]');
        return input instanceof HTMLInputElement
          ? {
              end: input.selectionEnd ?? -1,
              length: input.value.length,
              start: input.selectionStart ?? -1
            }
          : { end: -1, length: -1, start: -1 };
      })();
    `)) as { end: number; length: number; start: number });
  }
  if (selection.start !== 0 || selection.end !== selection.length) {
    throw new Error(`Native select-all failed for the production title field: ${JSON.stringify(selection)}`);
  }

  await win.webContents.insertText(expectedTitle);
  let evidence: CloseFlowSmokeLiveEditEvidence = {
    activeTestId: "",
    blurredBeforeClose: true,
    focusedDraft: false,
    height: 0,
    hitTargetMatched: false,
    hitTargetTestId: "",
    initialTitle: target.initialTitle,
    inputPresent: false,
    nativeInputApplied: false,
    nativeSelectAllFallbackUsed,
    projectStatusBeforeClose: "",
    selectionEndBeforeInput: selection.end,
    selectionLengthBeforeInput: selection.length,
    selectionStartBeforeInput: selection.start,
    title: "",
    valueExact: false,
    width: 0
  };
  while (Date.now() < deadline) {
    evidence = (await win.webContents.executeJavaScript(`
      (() => {
        const input = document.querySelector('[data-testid="project-title-input"]');
        const status = document.querySelector('[data-testid="project-status"]');
        const rect = input?.getBoundingClientRect() ?? null;
        const hitTarget = rect
          ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
          : null;
        const title = input instanceof HTMLInputElement ? input.value : "";
        const blurredBeforeClose = input?.dataset.closeFlowBlurred === "true";
        const activeTestId =
          document.activeElement instanceof HTMLElement
            ? document.activeElement.closest('[data-testid]')?.getAttribute("data-testid") ?? ""
            : "";
        return {
          activeTestId,
          blurredBeforeClose,
          focusedDraft:
            input instanceof HTMLInputElement &&
            document.activeElement === input &&
            title === ${JSON.stringify(expectedTitle)} &&
            !blurredBeforeClose,
          height: rect?.height ?? 0,
          hitTargetMatched: input === hitTarget || Boolean(hitTarget && input?.contains(hitTarget)),
          hitTargetTestId:
            hitTarget instanceof HTMLElement ? hitTarget.closest('[data-testid]')?.getAttribute("data-testid") ?? "" : "",
          initialTitle: ${JSON.stringify(target.initialTitle)},
          inputPresent: input instanceof HTMLInputElement,
          nativeInputApplied: input?.dataset.closeFlowNativeInput === "true",
          nativeSelectAllFallbackUsed: ${JSON.stringify(nativeSelectAllFallbackUsed)},
          projectStatusBeforeClose: status?.textContent?.trim() ?? "",
          selectionEndBeforeInput: ${JSON.stringify(selection.end)},
          selectionLengthBeforeInput: ${JSON.stringify(selection.length)},
          selectionStartBeforeInput: ${JSON.stringify(selection.start)},
          title,
          valueExact: title === ${JSON.stringify(expectedTitle)},
          width: rect?.width ?? 0
        };
      })();
    `)) as CloseFlowSmokeLiveEditEvidence;
    if (
      evidence.inputPresent &&
      evidence.nativeInputApplied &&
      evidence.focusedDraft &&
      !evidence.blurredBeforeClose &&
      evidence.hitTargetMatched &&
      evidence.valueExact &&
      evidence.width > 0 &&
      evidence.height > 0
    ) {
      return evidence;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Native production title draft did not settle before close: ${JSON.stringify(evidence)}`);
}

function installCloseFlowSmoke(win: BrowserWindow): void {
  let finished = false;
  const targetPath = closeFlowSmokePath();
  if (!targetPath) {
    closeFlowSmokeFailure("Close-flow smoke requires a target path environment variable.");
    return;
  }

  const timeout = setTimeout(() => {
    if (!finished) {
      finished = true;
      closeFlowSmokeFailure("Timed out before the production desktop renderer completed the guarded close flow.", {
        state: closeFlowSmokeState
      });
    }
  }, closeFlowSmokeTimeoutMs);

  const fail = (message: string, details: Record<string, unknown> = {}): void => {
    if (finished) {
      return;
    }
    finished = true;
    clearTimeout(timeout);
    closeFlowSmokeFailure(message, details);
  };

  win.webContents.once("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    fail("Production renderer failed to load for guarded close-flow smoke.", {
      errorCode,
      errorDescription,
      validatedURL
    });
  });

  win.webContents.once("render-process-gone", (_event, details) => {
    fail("Production renderer process exited before guarded close-flow smoke completed.", { reason: details.reason });
  });

  win.once("closed", () => {
    closeFlowSmokeState.events.push("window-closed");
    void readFile(targetPath, "utf8")
      .then((savedContents) => {
        if (finished) {
          return;
        }
        const failures = closeFlowSmokeFailures(savedContents);
        if (failures.length > 0) {
          fail("Production desktop guarded close-flow smoke failed.", {
            failures,
            savedBytes: Buffer.byteLength(savedContents, "utf8"),
            state: closeFlowSmokeState
          });
          return;
        }

        finished = true;
        clearTimeout(timeout);
        console.log(
          `${closeFlowSmokeResultPrefix}${JSON.stringify({
            ok: true,
            evidence: {
              ...closeFlowSmokeState,
              expectedTitle: closeFlowSmokeExpectedTitle,
              firstClosePrevented: closeFlowSmokeState.willPreventUnloadCount === 1,
              productionRenderer: true,
              savedBytes: Buffer.byteLength(savedContents, "utf8"),
              savedExactLiveEdit: true,
              secondGuardedCloseCompleted: true,
              targetPath
            }
          })}`
        );
        exitDesktopSmoke(0);
      })
      .catch((error: unknown) => {
        fail("Could not read the project written by guarded close-flow smoke.", {
          error: error instanceof Error ? error.message : String(error),
          state: closeFlowSmokeState
        });
      });
  });

  win.once("ready-to-show", () => {
    void prepareCloseFlowSmokeNativeTitleEdit(win)
      .then((evidence: CloseFlowSmokeLiveEditEvidence) => {
        if (finished) {
          return;
        }
        closeFlowSmokeState.liveEdit = evidence;
        closeFlowSmokeState.events.push("live-edit-ready");
        closeFlowSmokeState.events.push("first-close-requested");
        win.close();
      })
      .catch((error: unknown) => {
        fail("Production close-flow live-edit JavaScript failed.", {
          error: error instanceof Error ? error.message : String(error)
        });
      });
  });
}

const manualQaDownloadExtensions = new Set([".mid", ".midi", ".txt", ".wav", ".zip"]);

function uniqueManualQaDownloadPath(item: DownloadItem, configuration: ManualQaConfiguration): string {
  const fileName = path.basename(item.getFilename());
  const extension = path.extname(fileName).toLowerCase();
  if (!fileName || fileName === "." || fileName === ".." || !manualQaDownloadExtensions.has(extension)) {
    throw new Error(`Manual QA download rejected unsupported file name: ${fileName || "(empty)"}.`);
  }
  const stem = fileName.slice(0, -extension.length);
  assertManualQaWorkspaceTargetSync(configuration.workspaceRoot, configuration.exportsDirectory, {
    expectedType: "directory",
    mustExist: true
  });
  let candidate = path.join(configuration.exportsDirectory, fileName);
  let suffix = 2;
  while (lstatOrNullSync(candidate) || manualQaReservedDownloadPaths.has(candidate)) {
    const candidateStats = lstatOrNullSync(candidate);
    if (candidateStats?.isSymbolicLink()) {
      throw new Error(`Manual QA export target rejected symbolic link: ${candidate}`);
    }
    if (candidateStats && !candidateStats.isFile()) {
      throw new Error(`Manual QA export target must be a regular file: ${candidate}`);
    }
    candidate = path.join(configuration.exportsDirectory, `${stem}-${suffix}${extension}`);
    suffix += 1;
  }
  assertManualQaWorkspaceTargetSync(configuration.workspaceRoot, candidate, { expectedType: "file" });
  manualQaReservedDownloadPaths.add(candidate);
  return candidate;
}

function installManualQaDownloadRouting(win: BrowserWindow): void {
  const configuration = manualQaConfiguration;
  if (!configuration || manualQaDownloadSessions.has(win.webContents.session)) {
    return;
  }
  const downloadSession = win.webContents.session;
  manualQaDownloadSessions.add(downloadSession);
  downloadSession.on("will-download", (_event, item) => {
    let filePath: string;
    try {
      filePath = uniqueManualQaDownloadPath(item, configuration);
    } catch (error) {
      item.cancel();
      console.error(error);
      return;
    }
    const evidence: ManualQaDownloadEvidence = {
      fileName: path.basename(filePath),
      filePath,
      mimeType: item.getMimeType(),
      state: "started"
    };
    manualQaDownloads.push(evidence);
    try {
      assertManualQaWorkspaceTargetSync(configuration.workspaceRoot, filePath, { expectedType: "file" });
    } catch (error) {
      evidence.state = "cancelled";
      item.cancel();
      console.error(error);
      return;
    }
    item.setSavePath(filePath);
    item.once("done", (_doneEvent, state) => {
      evidence.state = state;
      if (state === "completed") {
        void assertManualQaPathSafety(filePath, true)
          .then(() => stat(filePath))
          .then((fileStats) => {
            evidence.bytes = fileStats.size;
            console.log(`${manualQaResultPrefix}${JSON.stringify({ download: evidence, ok: true, phase: "download" })}`);
          })
          .catch((error: unknown) => {
            evidence.state = "interrupted";
            console.error(
              `${manualQaResultPrefix}${JSON.stringify({
                download: evidence,
                error: error instanceof Error ? error.message : String(error),
                ok: false,
                phase: "download"
              })}`
            );
          });
      } else {
        console.error(`${manualQaResultPrefix}${JSON.stringify({ download: evidence, ok: false, phase: "download" })}`);
      }
    });
  });
}

const manualQaZoneIds = new Set(["arrange", "compose", "deliver", "mix"]);

function installManualQaPassiveEvidence(win: BrowserWindow): void {
  const configuration = manualQaConfiguration;
  if (!configuration || configuration.autoExit) {
    return;
  }
  const activeConfiguration: ManualQaConfiguration = configuration;
  const userDataPosture = manualQaUserDataPosture(activeConfiguration);
  const reportPath = path.join(activeConfiguration.evidenceDirectory, "manual-ui-observations.json");
  const report: ManualQaPassiveEvidence = {
    downloads: manualQaDownloads,
    lastObservedAt: new Date().toISOString(),
    openObserved: false,
    playbackObserved: false,
    provenance: activeConfiguration.provenance,
    provenanceValidatedAtLaunch: true,
    saveObserved: false,
    sourceFixture: activeConfiguration.openPath,
    targetProject: activeConfiguration.savePath,
    ...userDataPosture,
    workspaceRoot: activeConfiguration.workspaceRoot,
    zones: {}
  };
  let observationRunning = false;
  let lastReportFingerprint = "";

  async function persistReport(): Promise<void> {
    const contents = `${JSON.stringify(report, null, 2)}\n`;
    const fingerprint = createHash("sha256").update(contents.replace(report.lastObservedAt, "<time>")).digest("hex");
    if (fingerprint === lastReportFingerprint) {
      return;
    }
    lastReportFingerprint = fingerprint;
    await writeManualQaFile(reportPath, contents, { encoding: "utf8", mode: 0o600 });
  }

  async function observe(): Promise<void> {
    if (observationRunning || win.isDestroyed() || win.webContents.isDestroyed()) {
      return;
    }
    observationRunning = true;
    try {
      const observation = await win.webContents.executeJavaScript(`(() => {
        const navigator = document.querySelector('[data-testid="workflow-navigator"]');
        const tabs = Array.from(navigator?.querySelectorAll('[role="tab"]') ?? []);
        const panels = Array.from(document.querySelectorAll('.workspace-tabpanels > [role="tabpanel"]'));
        const workspace = document.querySelector('.workspace-tabpanels');
        const activeZone = workspace?.getAttribute('data-active-workspace-zone') ?? '';
        const projectTitle = document.querySelector('[data-testid="project-title-input"]');
        const transport = document.querySelector('[data-testid="transport-play"]');
        return {
          activeZone,
          activeZoneCount: panels.filter((panel) => panel.getAttribute('data-workspace-zone') === activeZone).length,
          capturedAt: new Date().toISOString(),
          documentHorizontalOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
          projectStatus: document.querySelector('[data-testid="project-status"]')?.textContent?.trim() ?? '',
          projectTitle: projectTitle instanceof HTMLInputElement ? projectTitle.value : '',
          selectedTabCount: tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').length,
          selectedTabLabels: tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').map((tab) => tab.textContent?.trim() ?? ''),
          tabCount: tabs.length,
          tabPanelCount: panels.length,
          tabStopCount: tabs.filter((tab) => tab.getAttribute('tabindex') === '0').length,
          transportPlaying: transport?.getAttribute('aria-pressed') === 'true',
          visiblePanelCount: panels.filter((panel) => !panel.hasAttribute('hidden')).length
        };
      })()`) as ManualQaUiObservation;
      report.lastObservedAt = new Date().toISOString();
      report.openObserved ||= /loaded|opened/i.test(observation.projectStatus);
      report.saveObserved ||= /saved/i.test(observation.projectStatus);
      report.playbackObserved ||= observation.transportPlaying;
      if (
        observation.projectTitle !== "" &&
        observation.projectTitle !== "Untitled Beat" &&
        manualQaZoneIds.has(observation.activeZone) &&
        !(observation.activeZone in report.zones)
      ) {
        const zone = observation.activeZone as "arrange" | "compose" | "deliver" | "mix";
        const screenshot = await win.webContents.capturePage();
        const png = screenshot.toPNG();
        const screenshotPath = path.join(activeConfiguration.evidenceDirectory, `manual-${zone}.png`);
        await writeManualQaFile(screenshotPath, png, { mode: 0o600 });
        report.zones[zone] = {
          ...observation,
          screenshot: screenshotPath,
          screenshotBytes: png.byteLength,
          screenshotSha256: createHash("sha256").update(png).digest("hex")
        };
      }
      await persistReport();
    } catch (error) {
      if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
        console.warn(`Manual QA passive evidence observation skipped: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      observationRunning = false;
    }
  }

  win.webContents.once("did-finish-load", () => {
    void observe();
    const interval = setInterval(() => void observe(), 500);
    win.once("closed", () => clearInterval(interval));
  });
}

function waitForManualQaDelay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function withManualQaTimeout<T>(operation: Promise<T>, description: string, timeoutMs = 90000): Promise<T> {
  return await Promise.race([
    operation,
    new Promise<T>((_resolve, reject) => {
      setTimeout(() => reject(new Error(`Timed out during ${description}.`)), timeoutMs);
    })
  ]);
}

async function waitForManualQaCondition(
  win: BrowserWindow,
  description: string,
  expression: string,
  timeoutMs = 90000
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (win.isDestroyed() || win.webContents.isDestroyed()) {
      throw new Error(`Window closed while waiting for ${description}.`);
    }
    const ready = (await win.webContents.executeJavaScript(`Boolean(${expression})`)) as boolean;
    if (ready) {
      return;
    }
    await waitForManualQaDelay(100);
  }
  throw new Error(`Timed out waiting for ${description}.`);
}

async function clickManualQaNativeTarget(win: BrowserWindow, testId: string): Promise<void> {
  const interactionStartedAt = Date.now();
  const category = manualQaSlowOperationTestIds.has(testId) ? "slow-operation" : "general-ui";
  const budgetMs = category === "slow-operation" ? 120000 : 5000;
  console.log(`${manualQaResultPrefix}${JSON.stringify({ ok: true, phase: "auto-song-interaction", state: "focus", testId })}`);
  win.show();
  win.focus();
  win.webContents.focus();
  await waitForManualQaDelay(120);
  console.log(`${manualQaResultPrefix}${JSON.stringify({ ok: true, phase: "auto-song-interaction", state: "hit-test", testId })}`);
  const hitTest = (await withManualQaTimeout(win.webContents.executeJavaScript(`(() => {
    const target = document.querySelector('[data-testid=${JSON.stringify(testId)}]');
    if (!(target instanceof HTMLElement)) return { error: 'missing' };
    target.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
    const rect = target.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return { error: 'not-rendered' };
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);
    const hit = document.elementFromPoint(x, y);
    return {
      error: target === hit || (hit instanceof Node && target.contains(hit)) ? '' : 'occluded',
      hitTestId: hit instanceof HTMLElement ? hit.closest('[data-testid]')?.getAttribute('data-testid') ?? '' : '',
      before: {
        ariaPressed: target.getAttribute('aria-pressed'),
        ariaSelected: target.getAttribute('aria-selected'),
        className: target.className,
        disabled: 'disabled' in target ? Boolean(target.disabled) : false,
        text: target.textContent?.trim().replace(/\\s+/g, ' ').slice(0, 180) ?? '',
        value: 'value' in target ? String(target.value) : ''
      },
      x,
      y
    };
  })()`), `${testId} hit-test`)) as { before?: Record<string, unknown>; error: string; hitTestId?: string; x?: number; y?: number };
  if (hitTest.error || !Number.isFinite(hitTest.x) || !Number.isFinite(hitTest.y)) {
    throw new Error(
      `Could not hit-test ${testId} for native pointer input (${hitTest.error || "invalid-point"}; hit ${hitTest.hitTestId || "none"}).`
    );
  }
  win.webContents.sendInputEvent({ type: "mouseMove", x: hitTest.x as number, y: hitTest.y as number });
  win.webContents.sendInputEvent({
    type: "mouseDown",
    x: hitTest.x as number,
    y: hitTest.y as number,
    button: "left",
    clickCount: 1
  });
  await waitForManualQaDelay(50);
  win.webContents.sendInputEvent({
    type: "mouseUp",
    x: hitTest.x as number,
    y: hitTest.y as number,
    button: "left",
    clickCount: 1
  });
  await waitForManualQaDelay(240);
  console.log(`${manualQaResultPrefix}${JSON.stringify({ ok: true, phase: "auto-song-interaction", state: "read-after", testId })}`);
  const after = (await withManualQaTimeout(win.webContents.executeJavaScript(`(() => {
    const target = document.querySelector('[data-testid=${JSON.stringify(testId)}]');
    if (!(target instanceof HTMLElement)) return { missing: true };
    return {
      ariaPressed: target.getAttribute('aria-pressed'),
      ariaSelected: target.getAttribute('aria-selected'),
      activeElementTestId: document.activeElement instanceof HTMLElement ? document.activeElement.closest('[data-testid]')?.getAttribute('data-testid') ?? '' : '',
      className: target.className,
      disabled: 'disabled' in target ? Boolean(target.disabled) : false,
      modeResult: document.querySelector('[data-testid="mode-switch-result"]')?.getAttribute('data-mode-switch-result') ?? '',
      projectStatus: document.querySelector('[data-testid="project-status"]')?.textContent?.trim() ?? '',
      text: target.textContent?.trim().replace(/\\s+/g, ' ').slice(0, 180) ?? '',
      value: 'value' in target ? String(target.value) : ''
    };
  })()`), `${testId} after-state`)) as Record<string, unknown>;
  const durationMs = Date.now() - interactionStartedAt;
  const interaction: ManualQaNativeInteraction = {
    after: { ...after, windowFocused: win.isFocused(), webContentsFocused: win.webContents.isFocused() },
    before: hitTest.before ?? {},
    budgetMs,
    category,
    completedAt: new Date().toISOString(),
    durationMs,
    hitTestId: hitTest.hitTestId ?? "",
    testId,
    withinBudget: durationMs <= budgetMs,
    x: hitTest.x as number,
    y: hitTest.y as number
  };
  manualQaAutoSongInteractions.push(interaction);
  console.log(`${manualQaResultPrefix}${JSON.stringify({ after, budgetMs, category, durationMs, ok: interaction.withinBudget, phase: "auto-song-interaction", state: "complete", testId })}`);
  if (!interaction.withinBudget) {
    throw new Error(`${testId} ${category} interaction took ${durationMs}ms, exceeding the ${budgetMs}ms hard gate.`);
  }
}

function finalizeManualQaNativeInteraction(testId: string, startedAt: number): void {
  const interaction = [...manualQaAutoSongInteractions].reverse().find((candidate) => candidate.testId === testId);
  if (!interaction) {
    throw new Error(`Missing native interaction evidence for ${testId}.`);
  }
  interaction.durationMs = Date.now() - startedAt;
  interaction.completedAt = new Date().toISOString();
  interaction.withinBudget = interaction.durationMs <= interaction.budgetMs;
  if (!interaction.withinBudget) {
    throw new Error(
      `${testId} ${interaction.category} interaction took ${interaction.durationMs}ms, exceeding the ${interaction.budgetMs}ms hard gate.`
    );
  }
}

async function replaceManualQaNativeText(win: BrowserWindow, testId: string, value: string): Promise<void> {
  const interactionStartedAt = Date.now();
  await clickManualQaNativeTarget(win, testId);
  const commandModifier: Electron.InputEvent["modifiers"] = process.platform === "darwin" ? ["meta"] : ["control"];
  win.webContents.sendInputEvent({ type: "keyDown", keyCode: "A", modifiers: commandModifier });
  win.webContents.sendInputEvent({ type: "keyUp", keyCode: "A", modifiers: commandModifier });
  await waitForManualQaDelay(150);
  const readSelection = async (): Promise<{ end: number; length: number; start: number; value: string }> =>
    (await withManualQaTimeout(win.webContents.executeJavaScript(`(() => {
      const target = document.querySelector('[data-testid=${JSON.stringify(testId)}]');
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
        return { end: -1, length: -1, start: -1, value: '' };
      }
      return {
        end: target.selectionEnd ?? -1,
        length: target.value.length,
        start: target.selectionStart ?? -1,
        value: target.value
      };
    })()`), `${testId} native selection evidence`)) as { end: number; length: number; start: number; value: string };
  let selection = await readSelection();
  if (selection.start !== 0 || selection.end !== selection.length) {
    win.webContents.sendInputEvent({ type: "keyDown", keyCode: "Home" });
    win.webContents.sendInputEvent({ type: "keyUp", keyCode: "Home" });
    await waitForManualQaDelay(80);
    win.webContents.sendInputEvent({ type: "keyDown", keyCode: "End", modifiers: ["shift"] });
    win.webContents.sendInputEvent({ type: "keyUp", keyCode: "End", modifiers: ["shift"] });
    await waitForManualQaDelay(150);
    selection = await readSelection();
  }
  let clearedByNativeDeletion = false;
  if (selection.start !== 0 || selection.end !== selection.length) {
    const targetIsTextArea = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid=${JSON.stringify(testId)}]') instanceof HTMLTextAreaElement`
    )) as boolean;
    if (targetIsTextArea) {
      const startKey = process.platform === "darwin" ? "Up" : "Home";
      const endKey = process.platform === "darwin" ? "Down" : "End";
      const documentModifier: Electron.InputEvent["modifiers"] = process.platform === "darwin" ? ["meta"] : ["control"];
      await sendManualQaNativeKey(win, startKey, documentModifier, 100);
      await sendManualQaNativeKey(win, endKey, [...documentModifier, "shift"], 150);
      selection = await readSelection();
    }
    if (targetIsTextArea && (selection.start !== 0 || selection.end !== selection.length)) {
      const boundedDeletionCount = Math.min(selection.length + 1, 241);
      for (const keyCode of ["Backspace", "Delete"]) {
        for (let index = 0; index < boundedDeletionCount; index += 1) {
          win.webContents.sendInputEvent({ type: "keyDown", keyCode });
          win.webContents.sendInputEvent({ type: "keyUp", keyCode });
        }
      }
      await waitForManualQaDelay(250);
      selection = await readSelection();
      clearedByNativeDeletion = selection.value === "";
    }
  }
  const interaction = [...manualQaAutoSongInteractions].reverse().find((candidate) => candidate.testId === testId);
  if (interaction) {
    interaction.after = { ...interaction.after, nativeSelection: selection };
  }
  if (!clearedByNativeDeletion && (selection.start !== 0 || selection.end !== selection.length)) {
    throw new Error(`Native select-all failed for ${testId}: ${JSON.stringify(selection)}.`);
  }
  await win.webContents.insertText(value);
  await waitForManualQaCondition(
    win,
    `${testId} native text value`,
    `document.querySelector('[data-testid=${JSON.stringify(testId)}]')?.value === ${JSON.stringify(value)}`
  );
  finalizeManualQaNativeInteraction(testId, interactionStartedAt);
}

async function sendManualQaNativeKey(
  win: BrowserWindow,
  keyCode: string,
  modifiers: Electron.InputEvent["modifiers"] = [],
  settleMs = 80
): Promise<void> {
  win.webContents.sendInputEvent({ type: "keyDown", keyCode, modifiers });
  win.webContents.sendInputEvent({ type: "keyUp", keyCode, modifiers });
  await waitForManualQaDelay(settleMs);
}

async function replaceManualQaNativeNumber(win: BrowserWindow, testId: string, value: number): Promise<void> {
  const expectedValue = String(value);
  const currentValue = (await win.webContents.executeJavaScript(`(() => {
    const target = document.querySelector('[data-testid=${JSON.stringify(testId)}]');
    return target instanceof HTMLInputElement && target.type === 'number' ? target.value : null;
  })()`)) as string | null;
  if (currentValue === null) {
    throw new Error(`${testId} is not a rendered number input.`);
  }
  if (currentValue === expectedValue) {
    return;
  }
  const currentNumber = Number(currentValue);
  if (!Number.isInteger(currentNumber) || !Number.isInteger(value)) {
    throw new Error(`${testId} native number replacement requires finite integer values.`);
  }
  const stepCount = Math.abs(value - currentNumber);
  if (stepCount > 100) {
    throw new Error(`${testId} native number replacement exceeds the 100-step safety bound.`);
  }
  const interactionStartedAt = Date.now();
  await clickManualQaNativeTarget(win, testId);
  const keyCode = value > currentNumber ? "Up" : "Down";
  for (let index = 0; index < stepCount; index += 1) {
    await sendManualQaNativeKey(win, keyCode, [], 15);
  }
  await waitForManualQaCondition(
    win,
    `${testId} native number value`,
    `document.querySelector('[data-testid=${JSON.stringify(testId)}]')?.value === ${JSON.stringify(expectedValue)}`
  );
  const interaction = [...manualQaAutoSongInteractions].reverse().find((candidate) => candidate.testId === testId);
  if (interaction) {
    interaction.after = { ...interaction.after, nativeNumberReplacement: { before: currentValue, value: expectedValue } };
  }
  finalizeManualQaNativeInteraction(testId, interactionStartedAt);
}

async function selectManualQaNativeOption(win: BrowserWindow, testId: string, value: string): Promise<void> {
  const optionState = (await win.webContents.executeJavaScript(`(() => {
    const target = document.querySelector('[data-testid=${JSON.stringify(testId)}]');
    if (!(target instanceof HTMLSelectElement)) return null;
    return {
      current: target.value,
      currentIndex: target.selectedIndex,
      optionIndex: Array.from(target.options).findIndex((option) => option.value === ${JSON.stringify(value)}),
      options: Array.from(target.options).map((option) => ({
        disabled: option.disabled,
        label: option.label || option.textContent || option.value,
        value: option.value
      }))
    };
  })()`)) as {
    current: string;
    currentIndex: number;
    optionIndex: number;
    options: Array<{ disabled: boolean; label: string; value: string }>;
  } | null;
  if (!optionState || optionState.optionIndex < 0) {
    throw new Error(`${testId} does not expose option ${value}.`);
  }
  if (optionState.current === value) {
    return;
  }
  const interactionStartedAt = Date.now();
  await clickManualQaNativeTarget(win, testId);
  // Electron 43 routes an open macOS native select popup outside webContents.
  // Close that popup, then leave and re-enter the control through native Tab
  // navigation. A unique printable type-ahead prefix changes the focused
  // select without reopening AppKit's popup, producing trusted input/change
  // events that React receives through the real user-input path.
  await sendManualQaNativeKey(win, "Escape", [], 140);
  await sendManualQaNativeKey(win, "Tab", [], 100);
  await sendManualQaNativeKey(win, "Tab", ["shift"], 140);
  const retainedFocus = (await win.webContents.executeJavaScript(
    `document.activeElement === document.querySelector('[data-testid=${JSON.stringify(testId)}]')`
  )) as boolean;
  if (!retainedFocus) {
    throw new Error(`${testId} did not regain native keyboard focus after closing its option popup.`);
  }
  const normalizeLabel = (label: string): string => label.normalize("NFC").trim().toLocaleLowerCase();
  const targetLabel = normalizeLabel(optionState.options[optionState.optionIndex]?.label ?? "");
  const enabledLabels = optionState.options.filter((option) => !option.disabled).map((option) => normalizeLabel(option.label));
  let uniquePrefix = "";
  for (let length = 1; length <= targetLabel.length; length += 1) {
    const candidate = targetLabel.slice(0, length);
    if (enabledLabels.filter((label) => label.startsWith(candidate)).length === 1) {
      uniquePrefix = candidate;
      break;
    }
  }
  if (!uniquePrefix) {
    throw new Error(`${testId} option ${value} does not expose a unique native type-ahead prefix.`);
  }
  // Blink keeps a select type-ahead buffer for roughly one second. Separate
  // consecutive selections so the next prefix cannot be appended to the last.
  await waitForManualQaDelay(1050);
  for (const character of uniquePrefix) {
    win.webContents.sendInputEvent({ type: "char", keyCode: character });
    await waitForManualQaDelay(40);
  }
  await waitForManualQaCondition(
    win,
    `${testId} native option ${value}`,
    `document.querySelector('[data-testid=${JSON.stringify(testId)}]')?.value === ${JSON.stringify(value)}`,
    5000
  );
  const interaction = [...manualQaAutoSongInteractions].reverse().find((candidate) => candidate.testId === testId);
  if (interaction) {
    interaction.after = {
      ...interaction.after,
      nativeOptionSelection: { before: optionState.current, method: "typeahead-char", prefix: uniquePrefix, value }
    };
  }
  finalizeManualQaNativeInteraction(testId, interactionStartedAt);
}

async function ensureManualQaDetailsOpen(win: BrowserWindow, detailsTestId: string, toggleTestId: string): Promise<void> {
  const interactionStartedAt = Date.now();
  const openExpression = `document.querySelector('[data-testid=${JSON.stringify(detailsTestId)}]')?.open === true`;
  const alreadyOpen = (await win.webContents.executeJavaScript(openExpression)) as boolean;
  if (!alreadyOpen) {
    await clickManualQaNativeTarget(win, toggleTestId);
    const pointerSettleDeadline = Date.now() + 1000;
    let openedByPointer = false;
    while (Date.now() < pointerSettleDeadline) {
      openedByPointer = (await win.webContents.executeJavaScript(openExpression)) as boolean;
      if (openedByPointer) {
        break;
      }
      await waitForManualQaDelay(100);
    }
    if (!openedByPointer) {
      const toggleFocused = (await win.webContents.executeJavaScript(
        `document.activeElement?.closest('[data-testid]')?.getAttribute('data-testid') === ${JSON.stringify(toggleTestId)}`
      )) as boolean;
      if (!toggleFocused) {
        throw new Error(`${toggleTestId} did not retain native focus for keyboard disclosure activation.`);
      }
      await sendManualQaNativeKey(win, "Enter", [], 180);
    }
  }
  await waitForManualQaCondition(
    win,
    `${detailsTestId} disclosure open`,
    openExpression,
    5000
  );
  if (!alreadyOpen) {
    finalizeManualQaNativeInteraction(toggleTestId, interactionStartedAt);
  }
}

async function collectManualQaViewportAccessibility(
  win: BrowserWindow,
  phase: "active-start" | "deep" | "top-shell"
): Promise<ManualQaViewportAccessibilitySample> {
  return (await win.webContents.executeJavaScript(`(() => {
    const phase = ${JSON.stringify(phase)};
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    const stickyNavigator = document.querySelector('[data-testid="workflow-navigator"]');
    const stickyNavigatorRect = stickyNavigator?.getBoundingClientRect();
    const viewportTop = phase !== 'top-shell' && stickyNavigator instanceof HTMLElement &&
      getComputedStyle(stickyNavigator).position === 'sticky' && stickyNavigatorRect && stickyNavigatorRect.top <= 9
      ? Math.min(viewportHeight - 1, stickyNavigatorRect.bottom + 1)
      : 1;
    const activePanel = document.querySelector('.workspace-tabpanels > [role="tabpanel"]:not([hidden])');
    const roots = phase === 'top-shell'
      ? Array.from(document.querySelectorAll(
          '.transport-band, .mode-row, [data-testid="workflow-navigator"], [data-testid="workspace-command-dock"]'
        ))
      : activePanel instanceof HTMLElement ? [activePanel] : [];
    const candidates = Array.from(new Set(roots.flatMap((root) => [root, ...root.querySelectorAll('*')])));
    const interactiveSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'summary',
      'textarea:not([disabled])',
      '[role="button"]',
      '[role="tab"]',
      '[tabindex]:not([tabindex="-1"]):not([role="tabpanel"])'
    ].join(',');
    let checkedElementCount = 0;
    let checkedInteractiveCount = 0;
    let intentionalScrollerExclusions = 0;
    const accessibleInteractiveKeys = [];
    const checkedInteractiveKeys = [];
    const renderedInteractiveKeys = [];
    const inaccessibleElements = [];
    const horizontalContainment = (element, rect) => {
      let ancestor = element.parentElement;
      let intentionalScroller = false;
      let clippedByAncestor = '';
      while (ancestor && !roots.includes(ancestor)) {
        const style = getComputedStyle(ancestor);
        const ancestorRect = ancestor.getBoundingClientRect();
        if (
          (style.overflowX === 'hidden' || style.overflowX === 'clip') &&
          (rect.left < ancestorRect.left - 1 || rect.right > ancestorRect.right + 1)
        ) {
          clippedByAncestor = nearestTestId(ancestor) ||
            (typeof ancestor.className === 'string' ? ancestor.className.split(/\\s+/u).filter(Boolean)[0] ?? '' : '') ||
            ancestor.tagName.toLowerCase();
          break;
        }
        if ((style.overflowX === 'auto' || style.overflowX === 'scroll') && ancestor.scrollWidth > ancestor.clientWidth + 1) {
          const relativeLeft = rect.left - ancestorRect.left + ancestor.scrollLeft;
          const relativeRight = relativeLeft + rect.width;
          if (relativeRight >= -1 && relativeLeft <= ancestor.scrollWidth + 1) {
            intentionalScroller = true;
          }
        }
        ancestor = ancestor.parentElement;
      }
      return { clippedByAncestor, intentionalScroller };
    };
    const nearestTestId = (element) => element instanceof Element
      ? element.closest('[data-testid]')?.getAttribute('data-testid') ?? ''
      : '';
    const hasHiddenPosture = (element) => {
      if (element.closest('[hidden], [inert], [aria-hidden="true"]')) return true;
      let ancestor = element;
      while (ancestor instanceof HTMLElement) {
        if (ancestor instanceof HTMLDetailsElement && !ancestor.open) {
          const summary = ancestor.querySelector(':scope > summary');
          if (!(summary instanceof HTMLElement) || !(summary === element || summary.contains(element))) {
            return true;
          }
        }
        const ancestorStyle = getComputedStyle(ancestor);
        if (
          ancestorStyle.display === 'none' ||
          ancestorStyle.visibility === 'hidden' ||
          ancestorStyle.visibility === 'collapse' ||
          Number(ancestorStyle.opacity) === 0
        ) return true;
        if (roots.includes(ancestor)) break;
        ancestor = ancestor.parentElement;
      }
      return false;
    };
    const elementKey = (element) => {
      const testId = element.getAttribute('data-testid');
      if (testId) return 'testid:' + testId;
      if (element.id) return 'id:' + element.id;
      const parts = [];
      let current = element;
      while (current instanceof HTMLElement && !roots.includes(current)) {
        const siblings = current.parentElement
          ? Array.from(current.parentElement.children).filter((candidate) => candidate.tagName === current.tagName)
          : [];
        parts.unshift(current.tagName.toLowerCase() + ':' + (siblings.indexOf(current) + 1));
        current = current.parentElement;
      }
      return 'path:' + parts.join('>');
    };
    for (const element of candidates) {
      if (!(element instanceof HTMLElement) || hasHiddenPosture(element)) continue;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (
        rect.width <= 0 ||
        rect.height <= 0 ||
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        Number(style.opacity) === 0
      ) continue;
      const containment = horizontalContainment(element, rect);
      if (containment.intentionalScroller && !containment.clippedByAncestor) {
        intentionalScrollerExclusions += 1;
        continue;
      }
      const interactive = element.matches(interactiveSelector);
      const key = elementKey(element);
      if (interactive) renderedInteractiveKeys.push(key);
      if (rect.bottom <= viewportTop || rect.top >= viewportHeight - 1) continue;
      checkedElementCount += 1;
      const reasons = [];
      if (rect.left < -1) reasons.push('outside-left');
      if (rect.right > viewportWidth + 1) reasons.push('outside-right');
      if (rect.width > viewportWidth + 1) reasons.push('wider-than-viewport');
      if (containment.clippedByAncestor) reasons.push('clipped-by-' + containment.clippedByAncestor);
      const centerX = Math.min(viewportWidth - 2, Math.max(2, rect.left + rect.width / 2));
      const centerY = Math.min(viewportHeight - 2, Math.max(viewportTop + 1, rect.top + rect.height / 2));
      const fullyVerticallyVisible = rect.top >= viewportTop && rect.bottom <= viewportHeight - 1;
      if (interactive && fullyVerticallyVisible) {
        checkedInteractiveCount += 1;
        checkedInteractiveKeys.push(key);
      }
      const hit = interactive && reasons.length === 0 && fullyVerticallyVisible
        ? document.elementFromPoint(centerX, centerY)
        : null;
      if (
        interactive &&
        reasons.length === 0 &&
        fullyVerticallyVisible &&
        !(hit === element || (hit instanceof Node && element.contains(hit)))
      ) {
        reasons.push('native-hit-test-blocked');
      }
      if (
        interactive &&
        fullyVerticallyVisible &&
        reasons.length === 0 &&
        (hit === element || (hit instanceof Node && element.contains(hit)))
      ) {
        accessibleInteractiveKeys.push(key);
      }
      if (reasons.length === 0) continue;
      inaccessibleElements.push({
        className: typeof element.className === 'string' ? element.className : '',
        clientWidth: element.clientWidth,
        elementKey: key,
        hitTestId: nearestTestId(hit),
        interactive,
        left: Number(rect.left.toFixed(2)),
        phase,
        reason: reasons.join(','),
        right: Number(rect.right.toFixed(2)),
        scrollWidth: element.scrollWidth,
        tagName: element.tagName.toLowerCase(),
        testId: element.getAttribute('data-testid') ?? '',
        width: Number(rect.width.toFixed(2))
      });
    }
    return {
      accessibleInteractiveCount: new Set(accessibleInteractiveKeys).size,
      accessibleInteractiveKeys: [...new Set(accessibleInteractiveKeys)],
      checkedElementCount,
      checkedInteractiveCount,
      checkedInteractiveKeys: [...new Set(checkedInteractiveKeys)],
      inaccessibleCount: inaccessibleElements.length,
      inaccessibleElements: inaccessibleElements
        .sort((left, right) => (right.right - viewportWidth) - (left.right - viewportWidth) || right.width - left.width)
        .slice(0, 24),
      intentionalScrollerExclusions,
      renderedInteractiveCount: new Set(renderedInteractiveKeys).size,
      renderedInteractiveKeys: [...new Set(renderedInteractiveKeys)],
      uncheckedInteractiveCount: 0
    };
  })()`)) as ManualQaViewportAccessibilitySample;
}

async function centerManualQaTargetedAccessibility(
  win: BrowserWindow,
  elementKey: string
): Promise<ManualQaTargetedAccessibilityPosture> {
  return (await win.webContents.executeJavaScript(`new Promise((resolve) => {
    const elementKey = ${JSON.stringify(elementKey)};
    const activePanel = document.querySelector('.workspace-tabpanels > [role="tabpanel"]:not([hidden])');
    const shellRoots = Array.from(document.querySelectorAll(
      '.transport-band, .mode-row, [data-testid="workflow-navigator"], [data-testid="workspace-command-dock"]'
    ));
    const roots = [...(activePanel instanceof HTMLElement ? [activePanel] : []), ...shellRoots];
    const resolveElement = () => {
      if (elementKey.startsWith('testid:')) {
        const testId = elementKey.slice('testid:'.length);
        return Array.from(document.querySelectorAll('[data-testid]')).find(
          (candidate) => candidate.getAttribute('data-testid') === testId && roots.some((root) => root.contains(candidate))
        ) ?? null;
      }
      if (elementKey.startsWith('id:')) {
        const candidate = document.getElementById(elementKey.slice('id:'.length));
        return candidate && roots.some((root) => root.contains(candidate)) ? candidate : null;
      }
      if (!elementKey.startsWith('path:')) return null;
      const segments = elementKey.slice('path:'.length).split('>').filter(Boolean);
      for (const root of roots) {
        let candidate = root;
        let matched = true;
        for (const segment of segments) {
          const match = /^([a-z][a-z0-9-]*):(\\d+)$/u.exec(segment);
          if (!match || !(candidate instanceof Element)) {
            matched = false;
            break;
          }
          const tagName = match[1];
          const position = Number(match[2]);
          candidate = Array.from(candidate.children).filter(
            (child) => child.tagName.toLowerCase() === tagName
          )[position - 1] ?? null;
          if (!candidate) {
            matched = false;
            break;
          }
        }
        if (matched && candidate instanceof HTMLElement) return candidate;
      }
      return null;
    };
    const hiddenPosture = (element) => {
      if (!(element instanceof HTMLElement) || element.closest('[hidden], [inert], [aria-hidden="true"]')) return true;
      let ancestor = element;
      while (ancestor instanceof HTMLElement) {
        if (ancestor instanceof HTMLDetailsElement && !ancestor.open) {
          const summary = ancestor.querySelector(':scope > summary');
          if (!(summary instanceof HTMLElement) || !(summary === element || summary.contains(element))) {
            return true;
          }
        }
        const style = getComputedStyle(ancestor);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.visibility === 'collapse' ||
          Number(style.opacity) === 0
        ) return true;
        if (roots.includes(ancestor)) break;
        ancestor = ancestor.parentElement;
      }
      return false;
    };
    const rendered = (element) => {
      if (!(element instanceof HTMLElement) || hiddenPosture(element)) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const before = resolveElement();
    const beforeRendered = rendered(before);
    const phase = before instanceof Element && shellRoots.some((root) => root.contains(before)) ? 'top-shell' : 'deep';
    if (!beforeRendered || !(before instanceof HTMLElement)) {
      resolve({
        afterRendered: false,
        beforeRendered,
        className: '',
        clientWidth: 0,
        elementKey,
        hitTestAccessible: false,
        hitTestId: '',
        left: 0,
        phase,
        right: 0,
        scrollWidth: 0,
        tagName: '',
        testId: elementKey.startsWith('testid:') ? elementKey.slice('testid:'.length) : '',
        width: 0
      });
      return;
    }
    before.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const after = resolveElement();
      const afterRendered = rendered(after);
      if (!afterRendered || !(after instanceof HTMLElement)) {
        resolve({
          afterRendered: false,
          beforeRendered,
          className: '',
          clientWidth: 0,
          elementKey,
          hitTestAccessible: false,
          hitTestId: '',
          left: 0,
          phase,
          right: 0,
          scrollWidth: 0,
          tagName: '',
          testId: elementKey.startsWith('testid:') ? elementKey.slice('testid:'.length) : '',
          width: 0
        });
        return;
      }
      const rect = after.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const navigator = document.querySelector('[data-testid="workflow-navigator"]');
      const navigatorRect = navigator?.getBoundingClientRect();
      const viewportTop = phase !== 'top-shell' && navigator instanceof HTMLElement &&
        getComputedStyle(navigator).position === 'sticky' && navigatorRect && navigatorRect.top <= 9
        ? Math.min(viewportHeight - 1, navigatorRect.bottom + 1)
        : 1;
      const fullyVisible = rect.left >= -1 && rect.right <= viewportWidth + 1 &&
        rect.top >= viewportTop && rect.bottom <= viewportHeight - 1;
      const hit = fullyVisible
        ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
        : null;
      resolve({
        afterRendered,
        beforeRendered,
        className: typeof after.className === 'string' ? after.className : '',
        clientWidth: after.clientWidth,
        elementKey,
        hitTestAccessible: Boolean(hit === after || (hit instanceof Node && after.contains(hit))),
        hitTestId: hit instanceof Element ? hit.closest('[data-testid]')?.getAttribute('data-testid') ?? '' : '',
        left: Number(rect.left.toFixed(2)),
        phase,
        right: Number(rect.right.toFixed(2)),
        scrollWidth: after.scrollWidth,
        tagName: after.tagName.toLowerCase(),
        testId: after.getAttribute('data-testid') ?? '',
        width: Number(rect.width.toFixed(2))
      });
    }));
  })`)) as ManualQaTargetedAccessibilityPosture;
}

async function captureManualQaAutoSongZone(
  win: BrowserWindow,
  zone: "arrange" | "compose" | "deliver" | "mix",
  evidenceDirectory: string
): Promise<ManualQaAutoSongZoneEvidence> {
  await win.webContents.executeJavaScript(`window.scrollTo({ behavior: 'auto', left: 0, top: 0 })`);
  await waitForManualQaDelay(300);
  const observation = (await win.webContents.executeJavaScript(`(() => {
    const navigator = document.querySelector('[data-testid="workflow-navigator"]');
    const tabs = Array.from(navigator?.querySelectorAll('[role="tab"]') ?? []);
    const panels = Array.from(document.querySelectorAll('.workspace-tabpanels > [role="tabpanel"]'));
    const workspace = document.querySelector('.workspace-tabpanels');
    const activeZone = workspace?.getAttribute('data-active-workspace-zone') ?? '';
    const clientWidth = document.documentElement.clientWidth;
    const title = document.querySelector('[data-testid="project-title-input"]');
    const transport = document.querySelector('[data-testid="transport-play"]');
    const appShell = document.querySelector('main[data-audio-analysis-state]');
    return {
      activeZone,
      activeZoneCount: panels.filter((panel) => panel.getAttribute('data-workspace-zone') === activeZone).length,
      audioAnalysisState: appShell?.getAttribute('data-audio-analysis-state') ?? '',
      audioAnalysisStatus: document.querySelector('[data-testid="audio-analysis-status"]')?.textContent?.trim() ?? '',
      capturedAt: new Date().toISOString(),
      clientWidth,
      documentHorizontalOverflow: Math.max(0, document.documentElement.scrollWidth - clientWidth),
      documentScrollWidth: document.documentElement.scrollWidth,
      projectStatus: document.querySelector('[data-testid="project-status"]')?.textContent?.trim() ?? '',
      projectTitle: title instanceof HTMLInputElement ? title.value : '',
      scrollX: window.scrollX,
      selectedTabCount: tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').length,
      selectedTabLabels: tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').map((tab) => tab.textContent?.trim() ?? ''),
      tabCount: tabs.length,
      tabPanelCount: panels.length,
      tabStopCount: tabs.filter((tab) => tab.getAttribute('tabindex') === '0').length,
      transportPlaying: transport?.getAttribute('aria-pressed') === 'true',
      visiblePanelCount: panels.filter((panel) => !panel.hasAttribute('hidden')).length
    };
  })()`)) as Omit<
    ManualQaAutoSongZoneEvidence,
    | "activeAccessibility"
    | "deepScreenshot"
    | "deepScreenshotBytes"
    | "deepScreenshotSha256"
    | "deepScrollTop"
    | "overflowOffenders"
    | "screenshot"
    | "screenshotBytes"
    | "screenshotSha256"
  >;
  if (observation.activeZone !== zone) {
    throw new Error(`Expected ${zone} before screenshot, got ${observation.activeZone || "none"}.`);
  }
  if (
    observation.tabCount !== 4 ||
    observation.selectedTabCount !== 1 ||
    observation.tabStopCount !== 1 ||
    observation.tabPanelCount !== 4 ||
    observation.visiblePanelCount !== 1
  ) {
    throw new Error(`Functional tab contract failed in ${zone}: ${JSON.stringify(observation)}.`);
  }
  const screenshot = await win.webContents.capturePage();
  const png = screenshot.toPNG();
  const screenshotPath = path.join(evidenceDirectory, `auto-song-${zone}.png`);
  await writeManualQaFile(screenshotPath, png, { mode: 0o600 });
  const accessibilitySamples: ManualQaViewportAccessibilitySample[] = [];
  accessibilitySamples.push(await collectManualQaViewportAccessibility(win, "top-shell"));
  for (const selector of [".transport-band", ".mode-row", '[data-testid="workflow-navigator"]']) {
    await win.webContents.executeJavaScript(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'nearest'
    })`);
    await waitForManualQaDelay(120);
    accessibilitySamples.push(await collectManualQaViewportAccessibility(win, "top-shell"));
  }
  const scrollRange = (await win.webContents.executeJavaScript(`(() => {
    const panel = document.querySelector('.workspace-tabpanels > [role="tabpanel"]:not([hidden])');
    if (!(panel instanceof HTMLElement)) return { end: 0, start: 0, step: Math.max(320, window.innerHeight - 240) };
    const start = Math.max(0, panel.getBoundingClientRect().top + window.scrollY - 188);
    const end = Math.max(start, panel.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 24);
    const navigator = document.querySelector('[data-testid="workflow-navigator"]');
    const navigatorHeight = navigator instanceof HTMLElement ? navigator.getBoundingClientRect().height : 0;
    return { end, start, step: Math.max(320, window.innerHeight - navigatorHeight - 120) };
  })()`)) as { end: number; start: number; step: number };
  const scrollPositions: number[] = [];
  for (let top = scrollRange.start; top < scrollRange.end; top += scrollRange.step) {
    scrollPositions.push(Math.round(top));
  }
  scrollPositions.push(Math.round(scrollRange.end));
  for (const [index, top] of [...new Set(scrollPositions)].entries()) {
    await win.webContents.executeJavaScript(`window.scrollTo({ behavior: 'auto', left: 0, top: ${top} })`);
    await waitForManualQaDelay(90);
    accessibilitySamples.push(await collectManualQaViewportAccessibility(win, index === 0 ? "active-start" : "deep"));
    accessibilitySamples.push(await collectManualQaViewportAccessibility(win, "top-shell"));
  }
  const initiallyAccessibleInteractiveKeys = new Set(
    accessibilitySamples.flatMap((sample) => sample.accessibleInteractiveKeys)
  );
  const initiallyRenderedInteractiveKeys = new Set(
    accessibilitySamples.flatMap((sample) => sample.renderedInteractiveKeys)
  );
  const postureChangedInteractiveKeys = new Set<string>();
  const targetedPostures = new Map<string, ManualQaTargetedAccessibilityPosture>();
  const targetedKeys = new Set<string>();
  const targetQueue = [...initiallyRenderedInteractiveKeys].filter(
    (elementKey) => !initiallyAccessibleInteractiveKeys.has(elementKey)
  );
  while (targetQueue.length > 0 && targetedKeys.size < 1024) {
    const elementKey = targetQueue.shift();
    if (!elementKey || targetedKeys.has(elementKey)) continue;
    targetedKeys.add(elementKey);
    if (accessibilitySamples.some((sample) => sample.accessibleInteractiveKeys.includes(elementKey))) continue;
    const posture = await centerManualQaTargetedAccessibility(win, elementKey);
    targetedPostures.set(elementKey, posture);
    if (!posture.beforeRendered || !posture.afterRendered) {
      postureChangedInteractiveKeys.add(elementKey);
      continue;
    }
    await waitForManualQaDelay(60);
    const targetedSample = await collectManualQaViewportAccessibility(win, posture.phase);
    accessibilitySamples.push(targetedSample);
    for (const renderedKey of targetedSample.renderedInteractiveKeys) {
      if (
        !targetedKeys.has(renderedKey) &&
        !targetedSample.accessibleInteractiveKeys.includes(renderedKey) &&
        !accessibilitySamples.some((sample) => sample.accessibleInteractiveKeys.includes(renderedKey))
      ) {
        targetQueue.push(renderedKey);
      }
    }
  }
  const accessibleInteractiveKeys = new Set(
    accessibilitySamples.flatMap((sample) => sample.accessibleInteractiveKeys)
  );
  const checkedInteractiveKeys = new Set(
    accessibilitySamples.flatMap((sample) => sample.checkedInteractiveKeys)
  );
  const renderedInteractiveKeys = new Set(
    accessibilitySamples
      .flatMap((sample) => sample.renderedInteractiveKeys)
      .filter((elementKey) => !postureChangedInteractiveKeys.has(elementKey))
  );
  const inaccessibleByKey = new Map<string, ManualQaOverflowOffender>();
  for (const offender of accessibilitySamples.flatMap((sample) => sample.inaccessibleElements)) {
    const transientHitTestBlock = offender.reason === "native-hit-test-blocked";
    if (transientHitTestBlock && accessibleInteractiveKeys.has(offender.elementKey)) {
      continue;
    }
    inaccessibleByKey.set(`${offender.elementKey}:${offender.reason}`, offender);
  }
  const uncheckedInteractiveKeys = [...renderedInteractiveKeys].filter(
    (elementKey) => !accessibleInteractiveKeys.has(elementKey)
  );
  for (const elementKey of uncheckedInteractiveKeys) {
    const targetedPosture = targetedPostures.get(elementKey);
    inaccessibleByKey.set(`${elementKey}:not-hit-tested-after-target-scroll`, {
      className: targetedPosture?.className ?? "",
      clientWidth: targetedPosture?.clientWidth ?? 0,
      elementKey,
      hitTestId: targetedPosture?.hitTestId ?? "",
      interactive: true,
      left: targetedPosture?.left ?? 0,
      phase: targetedPosture?.phase ?? "deep",
      reason: "not-hit-tested-after-target-scroll",
      right: targetedPosture?.right ?? 0,
      scrollWidth: targetedPosture?.scrollWidth ?? 0,
      tagName: targetedPosture?.tagName ?? "",
      testId: targetedPosture?.testId ?? (elementKey.startsWith("testid:") ? elementKey.slice("testid:".length) : ""),
      width: targetedPosture?.width ?? 0
    });
  }
  const inaccessibleElements = [...inaccessibleByKey.values()];
  const activeAccessibility: ManualQaActiveAccessibility = {
    accessibleInteractiveCount: accessibleInteractiveKeys.size,
    checkedElementCount: accessibilitySamples.reduce((total, sample) => total + sample.checkedElementCount, 0),
    checkedInteractiveCount: checkedInteractiveKeys.size,
    inaccessibleCount: inaccessibleElements.length,
    inaccessibleElements: inaccessibleElements.slice(0, 24),
    intentionalScrollerExclusions: accessibilitySamples.reduce(
      (total, sample) => total + sample.intentionalScrollerExclusions,
      0
    ),
    renderedInteractiveCount: renderedInteractiveKeys.size,
    uncheckedInteractiveCount: uncheckedInteractiveKeys.length
  };
  const deepScrollTop = (await win.webContents.executeJavaScript(`window.scrollY`)) as number;
  const deepPng = (await win.webContents.capturePage()).toPNG();
  const deepScreenshotPath = path.join(evidenceDirectory, `auto-song-${zone}-deep.png`);
  await writeManualQaFile(deepScreenshotPath, deepPng, { mode: 0o600 });
  await win.webContents.executeJavaScript(`window.scrollTo({ behavior: 'auto', left: 0, top: 0 })`);
  await waitForManualQaDelay(120);
  return {
    ...observation,
    activeAccessibility,
    deepScreenshot: deepScreenshotPath,
    deepScreenshotBytes: deepPng.byteLength,
    deepScreenshotSha256: createHash("sha256").update(deepPng).digest("hex"),
    deepScrollTop,
    overflowOffenders: activeAccessibility.inaccessibleElements,
    screenshot: screenshotPath,
    screenshotBytes: png.byteLength,
    screenshotSha256: createHash("sha256").update(png).digest("hex")
  };
}

function manualQaObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function manualQaCanonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => manualQaCanonicalJson(entry)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${manualQaCanonicalJson(object[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

function manualQaProjectPayload(contents: string | Buffer): Record<string, unknown> {
  const file = manualQaObject(JSON.parse(contents.toString()));
  const wrappedProject = manualQaObject(file.project);
  return Object.keys(wrappedProject).length > 0 ? wrappedProject : file;
}

async function readManualQaLiveProjectContract(win: BrowserWindow): Promise<{
  arrangement: unknown;
  automation: unknown;
  observedAt: string;
  projectStatus: string;
  title: string;
}> {
  const snapshot = manualQaObject(
    await win.webContents.executeJavaScript(`(() => {
      const shell = document.querySelector('main[data-manual-qa-arrangement-json][data-manual-qa-automation-json]');
      return {
        arrangementJson: shell?.getAttribute('data-manual-qa-arrangement-json') ?? null,
        automationJson: shell?.getAttribute('data-manual-qa-automation-json') ?? null,
        projectStatus: document.querySelector('[data-testid="project-status"]')?.textContent?.trim() ?? '',
        title: document.querySelector('[data-testid="project-title-input"]')?.value ?? ''
      };
    })()`)
  );
  if (typeof snapshot.arrangementJson !== "string" || typeof snapshot.automationJson !== "string") {
    throw new Error("Movement reopened-project live contract attributes are unavailable.");
  }
  try {
    return {
      arrangement: JSON.parse(snapshot.arrangementJson),
      automation: JSON.parse(snapshot.automationJson),
      observedAt: new Date().toISOString(),
      projectStatus: typeof snapshot.projectStatus === "string" ? snapshot.projectStatus : "",
      title: typeof snapshot.title === "string" ? snapshot.title : ""
    };
  } catch (error) {
    throw new Error(
      `Movement reopened-project live contract is not valid JSON: ${error instanceof Error ? error.message : String(error)}.`
    );
  }
}

function manualQaMovementPreservedCoreSha256(project: Record<string, unknown>): string {
  const preserved = { ...project };
  for (const key of ["arrangement", "automation", "selectedPattern", "sessionBrief", "title"]) {
    delete preserved[key];
  }
  return createHash("sha256").update(manualQaCanonicalJson(preserved)).digest("hex");
}

function manualQaExpectedMovementAutomation(
  preset: ManualQaMovementAutomation,
  arrangementBars: number
): Array<Record<string, unknown>> {
  if (preset === "none") {
    return [];
  }
  const totalSteps = arrangementBars * 16;
  const fadeSteps = Math.min(16, totalSteps);
  const fadeIn = {
    curve: "linear",
    endStep: fadeSteps,
    endValue: 1,
    startStep: 0,
    startValue: 0,
    target: "master_volume"
  };
  const fadeOut = {
    curve: "linear",
    endStep: totalSteps,
    endValue: 0,
    startStep: Math.max(0, totalSteps - fadeSteps),
    startValue: 1,
    target: "master_volume"
  };
  return preset === "fade_in" ? [fadeIn] : preset === "fade_out" ? [fadeOut] : [fadeIn, fadeOut];
}

function parseManualQaPcmWav(contents: Buffer): {
  bitDepth: number;
  channels: number;
  durationSeconds: number;
  frameCount: number;
  sampleRate: number;
} {
  if (contents.byteLength < 44 || contents.toString("ascii", 0, 4) !== "RIFF" || contents.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("Movement WAV is not a complete RIFF/WAVE file.");
  }
  if (contents.toString("ascii", 12, 16) !== "fmt " || contents.toString("ascii", 36, 40) !== "data") {
    throw new Error("Movement WAV does not use the expected PCM fmt/data layout.");
  }
  const riffSize = contents.readUInt32LE(4);
  const formatSize = contents.readUInt32LE(16);
  const audioFormat = contents.readUInt16LE(20);
  const channels = contents.readUInt16LE(22);
  const sampleRate = contents.readUInt32LE(24);
  const byteRate = contents.readUInt32LE(28);
  const blockAlign = contents.readUInt16LE(32);
  const bitDepth = contents.readUInt16LE(34);
  const dataSize = contents.readUInt32LE(40);
  const expectedBlockAlign = channels * (bitDepth / 8);
  if (
    formatSize !== 16 ||
    audioFormat !== 1 ||
    channels !== 2 ||
    sampleRate !== 44_100 ||
    bitDepth !== 24 ||
    blockAlign !== expectedBlockAlign ||
    byteRate !== sampleRate * blockAlign ||
    riffSize + 8 !== contents.byteLength ||
    dataSize + 44 !== contents.byteLength ||
    dataSize === 0 ||
    dataSize % blockAlign !== 0
  ) {
    throw new Error(
      `Movement WAV PCM contract mismatch: ${JSON.stringify({ audioFormat, bitDepth, blockAlign, byteRate, channels, dataSize, riffSize, sampleRate })}.`
    );
  }
  const frameCount = dataSize / blockAlign;
  return { bitDepth, channels, durationSeconds: frameCount / sampleRate, frameCount, sampleRate };
}

async function captureManualQaMovementZone(
  win: BrowserWindow,
  zone: "arrange" | "deliver" | "mix",
  evidenceDirectory: string
): Promise<ManualQaMovementZoneEvidence> {
  await win.webContents.executeJavaScript(`window.scrollTo({ behavior: 'auto', left: 0, top: 0 })`);
  await waitForManualQaDelay(150);
  const observation = (await win.webContents.executeJavaScript(`(() => {
    const navigator = document.querySelector('[data-testid="workflow-navigator"]');
    const tabs = Array.from(navigator?.querySelectorAll('[role="tab"]') ?? []);
    const panels = Array.from(document.querySelectorAll('.workspace-tabpanels > [role="tabpanel"]'));
    const workspace = document.querySelector('.workspace-tabpanels');
    const activeZone = workspace?.getAttribute('data-active-workspace-zone') ?? '';
    const projectTitle = document.querySelector('[data-testid="project-title-input"]');
    const transport = document.querySelector('[data-testid="transport-play"]');
    return {
      activeZone,
      activeZoneCount: panels.filter((panel) => panel.getAttribute('data-workspace-zone') === activeZone).length,
      audioAnalysisState: document.querySelector('main[data-audio-analysis-state]')?.getAttribute('data-audio-analysis-state') ?? '',
      audioAnalysisStatus: document.querySelector('[data-testid="audio-analysis-status"]')?.textContent?.trim() ?? '',
      capturedAt: new Date().toISOString(),
      documentHorizontalOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      projectStatus: document.querySelector('[data-testid="project-status"]')?.textContent?.trim() ?? '',
      projectTitle: projectTitle instanceof HTMLInputElement ? projectTitle.value : '',
      selectedTabCount: tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').length,
      selectedTabLabels: tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true').map((tab) => tab.textContent?.trim() ?? ''),
      tabCount: tabs.length,
      tabPanelCount: panels.length,
      tabStopCount: tabs.filter((tab) => tab.getAttribute('tabindex') === '0').length,
      transportPlaying: transport?.getAttribute('aria-pressed') === 'true',
      visiblePanelCount: panels.filter((panel) => !panel.hasAttribute('hidden')).length
    };
  })()`)) as Omit<ManualQaMovementZoneEvidence, "screenshot" | "screenshotBytes" | "screenshotSha256">;
  if (
    observation.activeZone !== zone ||
    observation.tabCount !== 4 ||
    observation.selectedTabCount !== 1 ||
    observation.tabStopCount !== 1 ||
    observation.tabPanelCount !== 4 ||
    observation.visiblePanelCount !== 1 ||
    observation.documentHorizontalOverflow !== 0
  ) {
    throw new Error(`Movement ${zone} visible-tab contract failed: ${JSON.stringify(observation)}.`);
  }
  const png = (await win.webContents.capturePage()).toPNG();
  const screenshotPath = path.join(evidenceDirectory, `auto-movement-${zone}.png`);
  await writeManualQaFile(screenshotPath, png, { mode: 0o600 });
  return {
    ...observation,
    screenshot: screenshotPath,
    screenshotBytes: png.byteLength,
    screenshotSha256: createHash("sha256").update(png).digest("hex")
  };
}

function installManualQaAutoSong(win: BrowserWindow): void {
  const configuration = manualQaConfiguration;
  if (!configuration?.autoSong) {
    return;
  }
  const activeConfiguration: ManualQaConfiguration = configuration;
  const expectedSessionBrief = {
    artist: "GrooveForge Original",
    vibe: "신비롭고 사색적인 한국어 얼터너티브 팝",
    reference: "새벽의 무중력, 여백과 질문",
    notes:
      "특정 아티스트를 직접 모사하지 않고 공기감 있는 신스, 열린 화음, 절제된 하프타임 리듬, 질문형 서사를 위한 오리지널 테스트 곡."
  };
  const userDataPosture = manualQaUserDataPosture(activeConfiguration);
  const report: ManualQaAutoSongReport = {
    downloads: manualQaDownloads,
    failures: [],
    generatedAt: new Date().toISOString(),
    interactions: manualQaAutoSongInteractions,
    mode: "visible-native-auto-song-qa",
    ok: false,
    performance: {
      generalBudgetMs: 5000,
      generalViolations: [],
      maxGeneralInteractionMs: 0,
      maxSlowOperationMs: 0,
      passed: true,
      slowOperationBudgetMs: 120000,
      slowOperationViolations: []
    },
    playback: {
      arrangement: false,
      patternAuditions: [],
      wavPreview: false
    },
    provenance: activeConfiguration.provenance,
    provenanceValidatedAtLaunch: true,
    safety: {
      isolatedWorkspace: true,
      nativePointerAndKeyboard: true,
      sourceFixtureUnchanged: false,
      sourceFixtureSha256: "",
      ...userDataPosture
    },
    steps: [],
    workspaceRoot: activeConfiguration.workspaceRoot,
    zones: {}
  };
  const reportPath = path.join(activeConfiguration.evidenceDirectory, "auto-song-qa-report.json");
  let finished = false;

  async function persistReport(): Promise<void> {
    const generalInteractions = report.interactions.filter((interaction) => interaction.category === "general-ui");
    const slowInteractions = report.interactions.filter((interaction) => interaction.category === "slow-operation");
    report.performance.generalViolations = generalInteractions
      .filter((interaction) => !interaction.withinBudget)
      .map(({ durationMs, testId }) => ({ durationMs, testId }));
    report.performance.slowOperationViolations = slowInteractions
      .filter((interaction) => !interaction.withinBudget)
      .map(({ durationMs, testId }) => ({ durationMs, testId }));
    report.performance.maxGeneralInteractionMs = Math.max(0, ...generalInteractions.map(({ durationMs }) => durationMs));
    report.performance.maxSlowOperationMs = Math.max(0, ...slowInteractions.map(({ durationMs }) => durationMs));
    report.performance.passed =
      report.performance.generalViolations.length === 0 && report.performance.slowOperationViolations.length === 0;
    await writeManualQaFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  }

  async function runStep(id: string, action: () => Promise<void>): Promise<void> {
    const step: ManualQaAutoSongStep = { id, startedAt: new Date().toISOString(), status: "running" };
    report.steps.push(step);
    await persistReport();
    try {
      await withManualQaTimeout(action(), `auto-song step ${id}`, 720000);
      step.status = "passed";
    } catch (error) {
      step.status = "failed";
      step.detail = error instanceof Error ? error.message : String(error);
      if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
        const failurePng = (await win.webContents.capturePage()).toPNG();
        const failureScreenshot = path.join(activeConfiguration.evidenceDirectory, `auto-song-failure-${id}.png`);
        await writeManualQaFile(failureScreenshot, failurePng, { mode: 0o600 });
        step.detail += ` / screenshot ${failureScreenshot}`;
      }
      report.failures.push(`${id}: ${step.detail}`);
      throw error;
    } finally {
      step.completedAt = new Date().toISOString();
      await persistReport();
    }
  }

  async function clickAndWait(testId: string, description: string, expression: string, timeoutMs = 15000): Promise<void> {
    const interactionStartedAt = Date.now();
    await clickManualQaNativeTarget(win, testId);
    try {
      await waitForManualQaCondition(win, description, expression, timeoutMs);
      finalizeManualQaNativeInteraction(testId, interactionStartedAt);
    } catch (error) {
      const interaction = [...manualQaAutoSongInteractions].reverse().find((candidate) => candidate.testId === testId);
      throw new Error(
        `${error instanceof Error ? error.message : String(error)} Native interaction: ${JSON.stringify(interaction ?? null)}.`
      );
    }
  }

  async function captureZone(zone: "arrange" | "compose" | "deliver" | "mix"): Promise<void> {
    if (zone === "mix" || zone === "deliver") {
      await waitForManualQaCondition(
        win,
        `${zone} audio analysis ready before final capture`,
        `document.querySelector('main[data-audio-analysis-state]')?.getAttribute('data-audio-analysis-state') === 'ready' &&
          document.querySelector('[data-testid="audio-analysis-status"]')?.textContent?.trim() === 'Audio meters ready'`,
        120000
      );
    }
    const evidence = await captureManualQaAutoSongZone(win, zone, activeConfiguration.evidenceDirectory);
    report.zones[zone] = evidence;
    const layoutFailures: string[] = [];
    if (evidence.documentHorizontalOverflow !== 0 || evidence.scrollX !== 0) {
      layoutFailures.push(
        `${evidence.documentHorizontalOverflow}px document overflow at ${evidence.clientWidth}px viewport with scrollX ${evidence.scrollX}`
      );
    }
    if (evidence.activeAccessibility.inaccessibleCount !== 0) {
      layoutFailures.push(
        `${evidence.activeAccessibility.inaccessibleCount} inaccessible active or shell elements: ${JSON.stringify(evidence.overflowOffenders)}`
      );
    }
    if (layoutFailures.length > 0) {
      const failure = `${zone} layout accessibility failed: ${layoutFailures.join("; ")}`;
      report.failures.push(failure);
      await persistReport();
      throw new Error(failure);
    }
    if ((zone === "mix" || zone === "deliver") && evidence.audioAnalysisState !== "ready") {
      report.failures.push(`${zone} audio analysis was not ready at final capture: ${JSON.stringify(evidence)}.`);
    }
    await persistReport();
  }

  async function auditionPattern(pattern: "A" | "B" | "C"): Promise<void> {
    await clickAndWait(
      `pattern-tab-${pattern}`,
      `Pattern ${pattern} selected`,
      `document.querySelector('[data-testid="pattern-tab-${pattern}"]')?.getAttribute('aria-selected') === 'true'`
    );
    await clickAndWait(
      "playback-mode-pattern",
      `Pattern ${pattern} loop scope`,
      `document.querySelector('[data-testid="playback-mode-pattern"]')?.getAttribute('aria-pressed') === 'true'`
    );
    await clickAndWait(
      "transport-play",
      `Pattern ${pattern} playback started`,
      `document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'true'`
    );
    await waitForManualQaDelay(650);
    await clickAndWait(
      "transport-play",
      `Pattern ${pattern} playback stopped`,
      `document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'false'`
    );
    report.playback.patternAuditions.push(pattern);
  }

  async function run(): Promise<void> {
    Object.assign(report.safety, manualQaUserDataPosture(activeConfiguration));
    if (!report.safety.userDataIsolated) {
      throw new Error(`Electron userData was not isolated inside the Manual QA workspace: ${report.safety.userDataPath}`);
    }
    const sourceContents = await readFile(activeConfiguration.openPath);
    report.safety.sourceFixtureSha256 = createHash("sha256").update(sourceContents).digest("hex");
    await waitForManualQaCondition(win, "production renderer controls", `document.querySelector('[data-testid="mode-studio"]') !== null`, 120000);
    win.setTitle("GrooveForge — Auto Song QA");
    win.show();
    win.focus();

    await runStep("studio-blueprint-and-original-brief", async () => {
      await clickAndWait(
        "mode-studio",
        "Studio mode",
        `document.querySelector('[data-testid="mode-studio"]')?.classList.contains('selected') === true`
      );
      await ensureManualQaDetailsOpen(win, "guidance-center", "guidance-center-toggle");
      await clickAndWait(
        "beat-blueprint-experimental_pulse",
        "Experimental Pulse blueprint",
        `document.querySelector('[data-testid="beat-blueprint-result"]')?.getAttribute('data-result-blueprint') === 'experimental_pulse' &&
          document.querySelector('[data-testid="project-bpm-input"]')?.value === '110' &&
          document.querySelector('[data-testid="project-key-select"]')?.value === 'D minor' &&
          document.querySelector('[data-testid="style-select"]')?.value === 'experimental'`
      );
      await replaceManualQaNativeText(win, "project-title-input", "문 없는 방");
      await replaceManualQaNativeText(win, "session-brief-artist", expectedSessionBrief.artist);
      await replaceManualQaNativeText(win, "session-brief-vibe", expectedSessionBrief.vibe);
      await replaceManualQaNativeText(win, "session-brief-reference", expectedSessionBrief.reference);
      await replaceManualQaNativeText(win, "session-brief-notes", expectedSessionBrief.notes);
    });

    await runStep("compose-pattern-a-b-c-and-sound", async () => {
      await clickAndWait(
        "workflow-jump-compose",
        "Compose functional tab",
        `document.querySelector('[data-testid="workflow-jump-compose"]')?.getAttribute('aria-selected') === 'true'`
      );
      await ensureManualQaDetailsOpen(win, "pattern-lab", "pattern-lab-toggle");

      await clickAndWait("pattern-tab-A", "Pattern A selected", `document.querySelector('[data-testid="pattern-tab-A"]')?.getAttribute('aria-selected') === 'true'`);
      await clickAndWait("pattern-stack-pocket", "Pattern A Pocket stack", `document.querySelector('[data-testid="pattern-stack-result"]')?.getAttribute('data-result-pattern-stack') === 'pocket'`);
      await clickAndWait("drum-foundation-half", "Pattern A Half foundation", `document.querySelector('[data-testid="drum-move-result"]')?.getAttribute('data-result-drum-move') === 'foundation-half'`);
      await clickAndWait("groove-feel-lazy", "Pattern A Lazy feel", `document.querySelector('[data-testid="drum-move-result"]')?.getAttribute('data-result-drum-move') === 'feel-lazy'`);
      await clickAndWait("drum-accent-ghost", "Pattern A Ghost accent", `document.querySelector('[data-testid="drum-move-result"]')?.getAttribute('data-result-drum-move') === 'accent-ghost'`);

      await clickAndWait("pattern-tab-B", "Pattern B selected", `document.querySelector('[data-testid="pattern-tab-B"]')?.getAttribute('aria-selected') === 'true'`);
      await clickAndWait("pattern-stack-hook", "Pattern B Hook stack", `document.querySelector('[data-testid="pattern-stack-result"]')?.getAttribute('data-result-pattern-stack') === 'hook'`);
      await clickAndWait("drum-foundation-bounce", "Pattern B Bounce foundation", `document.querySelector('[data-testid="drum-move-result"]')?.getAttribute('data-result-drum-move') === 'foundation-bounce'`);
      await clickAndWait("groove-feel-pocket", "Pattern B Pocket feel", `document.querySelector('[data-testid="drum-move-result"]')?.getAttribute('data-result-drum-move') === 'feel-pocket'`);
      await clickAndWait("drum-accent-lift", "Pattern B Lift accent", `document.querySelector('[data-testid="drum-move-result"]')?.getAttribute('data-result-drum-move') === 'accent-lift'`);
      await clickAndWait("pattern-fill-melody_turn", "Pattern B Melody Turn fill", `document.querySelector('[data-testid="pattern-fill-result"]')?.getAttribute('data-result-pattern-fill') === 'B-melody_turn'`);

      await clickAndWait("pattern-tab-C", "Pattern C selected", `document.querySelector('[data-testid="pattern-tab-C"]')?.getAttribute('aria-selected') === 'true'`);
      await clickAndWait("pattern-stack-break", "Pattern C Break stack", `document.querySelector('[data-testid="pattern-stack-result"]')?.getAttribute('data-result-pattern-stack') === 'break'`);
      await clickAndWait("drum-foundation-half", "Pattern C Half foundation", `document.querySelector('[data-testid="drum-move-result"]')?.getAttribute('data-result-drum-move') === 'foundation-half'`);
      await clickAndWait("groove-feel-lazy", "Pattern C Lazy feel", `document.querySelector('[data-testid="drum-move-result"]')?.getAttribute('data-result-drum-move') === 'feel-lazy'`);
      await clickAndWait("drum-accent-soft", "Pattern C Soft accent", `document.querySelector('[data-testid="drum-move-result"]')?.getAttribute('data-result-drum-move') === 'accent-soft'`);
      await clickAndWait("pattern-fill-clear_tail", "Pattern C Clear Tail fill", `document.querySelector('[data-testid="pattern-fill-result"]')?.getAttribute('data-result-pattern-fill') === 'C-clear_tail'`);

      await auditionPattern("A");
      await auditionPattern("B");
      await auditionPattern("C");
      await ensureManualQaDetailsOpen(win, "sound-design-tools", "sound-design-toggle");
      await clickAndWait("sound-focus-space", "Space sound focus", `document.querySelector('[data-testid="sound-focus-result"]')?.getAttribute('data-result-sound-focus') === 'space'`);
      await clickAndWait("drum-kit-air", "Air drum kit", `document.querySelector('[data-testid="drum-kit-result"]')?.getAttribute('data-result-drum-kit') === 'air'`);
      await captureZone("compose");
    });

    await runStep("arrange-breakdown-and-song-playback", async () => {
      await clickAndWait(
        "workflow-jump-arrange",
        "Arrange functional tab",
        `document.querySelector('[data-testid="workflow-jump-arrange"]')?.getAttribute('aria-selected') === 'true'`
      );
      const mute = async (block: number, track: "bass_808" | "drum_rack" | "synth") => {
        await clickAndWait(
          `arrangement-block-${block}`,
          `Arrangement block ${block + 1} selected`,
          `document.querySelector('[data-testid="arrangement-block-${block}"]')?.getAttribute('aria-pressed') === 'true'`
        );
        await clickAndWait(
          `arrangement-track-mute-${track}`,
          `Arrangement block ${block + 1} ${track} muted`,
          `document.querySelector('[data-testid="arrangement-track-mute-${track}"]')?.getAttribute('aria-pressed') === 'true'`
        );
      };
      await mute(0, "bass_808");
      await mute(2, "drum_rack");
      await mute(2, "bass_808");
      await mute(6, "drum_rack");
      await mute(6, "bass_808");
      await mute(6, "synth");
      await clickAndWait("playback-mode-arrangement", "Song loop selected", `document.querySelector('[data-testid="playback-mode-arrangement"]')?.getAttribute('aria-pressed') === 'true'`);
      await clickAndWait("transport-play", "Song playback started", `document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'true'`);
      await waitForManualQaDelay(800);
      await clickAndWait("transport-play", "Song playback stopped", `document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'false'`);
      report.playback.arrangement = true;
      await captureZone("arrange");
    });

    await runStep("mix-wide-space-vocal-fades", async () => {
      await clickAndWait(
        "workflow-jump-mix",
        "Mix functional tab",
        `document.querySelector('[data-testid="workflow-jump-mix"]')?.getAttribute('aria-selected') === 'true'`
      );
      await ensureManualQaDetailsOpen(win, "mix-moves", "mix-moves-toggle");
      await clickAndWait("space-fx-wide", "Wide space FX", `document.querySelector('[data-testid="space-fx-result"]')?.getAttribute('data-result-space-fx') === 'wide'`);
      await clickAndWait("mix-balance-wide", "Wide mix balance", `document.querySelector('[data-testid="mix-balance-result"]')?.getAttribute('data-result-mix-balance') === 'wide'`);
      await ensureManualQaDetailsOpen(win, "master-polish-tools", "master-polish-toggle");
      await clickAndWait("master-finish-vocal", "Vocal master finish", `document.querySelector('[data-testid="master-finish-result"]')?.getAttribute('data-result-master-finish') === 'vocal'`);
      await clickAndWait("master-automation-intro_outro", "Intro/Outro master automation", `document.querySelector('[data-testid="master-automation-result"]')?.getAttribute('data-result-master-automation') === 'intro_outro'`);
      await captureZone("mix");
    });

    await runStep("deliver-preview-export-save-and-open", async () => {
      await clickAndWait(
        "workflow-jump-deliver",
        "Deliver functional tab",
        `document.querySelector('[data-testid="workflow-jump-deliver"]')?.getAttribute('aria-selected') === 'true'`
      );
      await clickAndWait("handoff-pack-preview-wav", "Rendered WAV preview started", `document.querySelector('[data-testid="handoff-pack-preview-wav"]')?.getAttribute('aria-pressed') === 'true'`, 120000);
      await waitForManualQaDelay(900);
      await clickAndWait("handoff-pack-preview-wav", "Rendered WAV preview stopped", `document.querySelector('[data-testid="handoff-pack-preview-wav"]')?.getAttribute('aria-pressed') === 'false'`);
      report.playback.wavPreview = true;
      const exportInteractionStartedAt = Date.now();
      await clickManualQaNativeTarget(win, "handoff-pack-action-wav");
      const downloadDeadline = Date.now() + 120000;
      while (Date.now() < downloadDeadline && !manualQaDownloads.some((download) => download.state === "completed" && download.filePath.endsWith(".wav"))) {
        await waitForManualQaDelay(100);
      }
      const wavDownload = manualQaDownloads.find((download) => download.state === "completed" && download.filePath.endsWith(".wav"));
      if (!wavDownload) {
        throw new Error(`WAV download did not complete: ${JSON.stringify(manualQaDownloads)}.`);
      }
      finalizeManualQaNativeInteraction("handoff-pack-action-wav", exportInteractionStartedAt);
      const saveInteractionStartedAt = Date.now();
      await clickManualQaNativeTarget(win, "project-save");
      await waitForManualQaCondition(win, "UI Save completion", `document.querySelector('[data-testid="project-status"]')?.textContent?.includes('Saved') === true`, 120000);
      const saveDeadline = Date.now() + 120000;
      while (Date.now() < saveDeadline && !existsSync(activeConfiguration.savePath)) {
        await waitForManualQaDelay(100);
      }
      if (!existsSync(activeConfiguration.savePath)) {
        throw new Error("UI Save did not create the isolated target project.");
      }
      finalizeManualQaNativeInteraction("project-save", saveInteractionStartedAt);
      manualQaOpenPathOverride = activeConfiguration.savePath;
      const openInteractionStartedAt = Date.now();
      await clickManualQaNativeTarget(win, "project-open");
      await waitForManualQaCondition(
        win,
        "UI Open completion",
        `document.querySelector('[data-testid="project-title-input"]')?.value === '문 없는 방' &&
          document.querySelector('[data-testid="project-status"]')?.textContent?.includes('Loaded') === true`,
        120000
      );
      finalizeManualQaNativeInteraction("project-open", openInteractionStartedAt);
      await captureZone("deliver");

      const savedContents = await readFile(activeConfiguration.savePath, "utf8");
      const savedFile = manualQaObject(JSON.parse(savedContents));
      const savedProject = manualQaObject(savedFile.project);
      const savedSessionBrief = manualQaObject(savedProject.sessionBrief);
      const arrangement = Array.isArray(savedProject.arrangement) ? savedProject.arrangement : [];
      const arrangementBars = arrangement.reduce((total, block) => {
        const bars = manualQaObject(block).bars;
        return total + (typeof bars === "number" ? bars : 0);
      }, 0);
      if (
        savedProject.title !== "문 없는 방" ||
        savedProject.mode !== "studio" ||
        savedProject.bpm !== 110 ||
        savedProject.key !== "D minor" ||
        savedProject.styleId !== "experimental" ||
        arrangement.length !== 7 ||
        arrangementBars !== 20 ||
        savedSessionBrief.artist !== expectedSessionBrief.artist ||
        savedSessionBrief.vibe !== expectedSessionBrief.vibe ||
        savedSessionBrief.reference !== expectedSessionBrief.reference ||
        savedSessionBrief.notes !== expectedSessionBrief.notes
      ) {
        throw new Error(`Saved project contract mismatch: ${JSON.stringify({ arrangementBars, blocks: arrangement.length, title: savedProject.title, mode: savedProject.mode, bpm: savedProject.bpm, key: savedProject.key, styleId: savedProject.styleId, sessionBrief: savedSessionBrief })}.`);
      }
      const wavContents = await readFile(wavDownload.filePath);
      report.project = {
        arrangementBars,
        arrangementBlocks: arrangement.length,
        bpm: savedProject.bpm,
        key: savedProject.key,
        mode: savedProject.mode,
        path: activeConfiguration.savePath,
        sessionBrief: savedSessionBrief,
        sha256: createHash("sha256").update(savedContents).digest("hex"),
        styleId: savedProject.styleId,
        title: savedProject.title
      };
      report.wav = {
        bytes: wavContents.byteLength,
        path: wavDownload.filePath,
        sha256: createHash("sha256").update(wavContents).digest("hex")
      };
    });

    const finalSourceContents = await readFile(activeConfiguration.openPath);
    report.safety.sourceFixtureUnchanged =
      createHash("sha256").update(finalSourceContents).digest("hex") === report.safety.sourceFixtureSha256;
    if (!report.safety.sourceFixtureUnchanged) {
      report.failures.push("The isolated source fixture changed during auto-song QA.");
    }
    Object.assign(report.safety, manualQaUserDataPosture(activeConfiguration));
    if (!report.safety.userDataIsolated) {
      report.failures.push(`Electron userData isolation changed during auto-song QA: ${report.safety.userDataPath}.`);
    }
    if (
      report.playback.patternAuditions.join(",") !== "A,B,C" ||
      !report.playback.arrangement ||
      !report.playback.wavPreview
    ) {
      report.failures.push(`Playback coverage was incomplete: ${JSON.stringify(report.playback)}.`);
    }
    report.ok = report.failures.length === 0 && report.performance.passed;
    report.completedAt = new Date().toISOString();
    await persistReport();
    console.log(`${manualQaResultPrefix}${JSON.stringify({ ok: report.ok, phase: "auto-song", reportPath, report })}`);
    finished = true;
    if (activeConfiguration.autoExit) {
      await waitForManualQaDelay(250);
      exitDesktopSmoke(report.ok ? 0 : 1);
    }
  }

  const timeout = setTimeout(() => {
    if (!finished) {
      report.failures.push("Auto-song QA timed out before completion.");
      report.completedAt = new Date().toISOString();
      void persistReport().finally(() => exitDesktopSmoke(1));
    }
  }, 900000);
  win.once("closed", () => clearTimeout(timeout));
  win.webContents.once("did-finish-load", () => {
    void run().catch(async (error: unknown) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);
      const message = error instanceof Error ? error.message : String(error);
      try {
        const finalSourceContents = await readFile(activeConfiguration.openPath);
        report.safety.sourceFixtureUnchanged =
          createHash("sha256").update(finalSourceContents).digest("hex") === report.safety.sourceFixtureSha256;
      } catch {
        report.safety.sourceFixtureUnchanged = false;
      }
      if (!report.failures.some((failure) => failure.includes(message))) {
        report.failures.push(message);
      }
      report.completedAt = new Date().toISOString();
      report.ok = false;
      await persistReport();
      console.error(`${manualQaResultPrefix}${JSON.stringify({ ok: false, phase: "auto-song", reportPath, report })}`);
      if (activeConfiguration.autoExit) {
        await waitForManualQaDelay(250);
        exitDesktopSmoke(1);
      }
    });
  });
}

function installManualQaAutoMovement(win: BrowserWindow): void {
  const configuration = manualQaConfiguration;
  if (!configuration?.autoMovement || !configuration.movementSpec || !configuration.movementSpecPath) {
    return;
  }
  const activeConfiguration: ManualQaConfiguration = configuration;
  const spec = configuration.movementSpec;
  const specPath = configuration.movementSpecPath;
  const expectedArrangementBars = spec.arrangement.reduce((total, block) => total + block.bars, 0);
  const expectedAutomation = manualQaExpectedMovementAutomation(spec.masterAutomation, expectedArrangementBars);
  const specContents = readFileSync(specPath);
  const sourceContents = readFileSync(activeConfiguration.openPath);
  const sourceProject = manualQaProjectPayload(sourceContents);
  const userDataPosture = manualQaUserDataPosture(activeConfiguration);
  const report: ManualQaMovementReport = {
    downloads: manualQaDownloads,
    failures: [],
    generatedAt: new Date().toISOString(),
    interactions: manualQaAutoSongInteractions,
    mode: "visible-native-auto-movement-qa",
    ok: false,
    performance: {
      generalBudgetMs: 5000,
      generalViolations: [],
      maxGeneralInteractionMs: 0,
      maxSlowOperationMs: 0,
      passed: true,
      slowOperationBudgetMs: 120000,
      slowOperationViolations: []
    },
    provenance: activeConfiguration.provenance,
    provenanceValidatedAtLaunch: true,
    safety: {
      isolatedWorkspace: true,
      nativePointerAndKeyboard: true,
      sourceFixtureSha256: createHash("sha256").update(sourceContents).digest("hex"),
      sourceFixtureUnchanged: false,
      ...userDataPosture
    },
    source: {
      bpm: sourceProject.bpm,
      key: sourceProject.key,
      mode: sourceProject.mode,
      path: activeConfiguration.openPath,
      sha256: createHash("sha256").update(sourceContents).digest("hex"),
      styleId: sourceProject.styleId,
      title: sourceProject.title
    },
    spec: {
      arrangementBars: expectedArrangementBars,
      arrangementBlocks: spec.arrangement.length,
      masterAutomation: spec.masterAutomation,
      path: specPath,
      sha256: createHash("sha256").update(specContents).digest("hex"),
      title: spec.title
    },
    steps: [],
    workspaceRoot: activeConfiguration.workspaceRoot,
    zones: {}
  };
  const reportPath = path.join(activeConfiguration.evidenceDirectory, "auto-movement-qa-report.json");
  let finished = false;

  async function persistReport(): Promise<void> {
    const generalInteractions = report.interactions.filter((interaction) => interaction.category === "general-ui");
    const slowInteractions = report.interactions.filter((interaction) => interaction.category === "slow-operation");
    report.performance.generalViolations = generalInteractions
      .filter((interaction) => !interaction.withinBudget)
      .map(({ durationMs, testId }) => ({ durationMs, testId }));
    report.performance.slowOperationViolations = slowInteractions
      .filter((interaction) => !interaction.withinBudget)
      .map(({ durationMs, testId }) => ({ durationMs, testId }));
    report.performance.maxGeneralInteractionMs = Math.max(0, ...generalInteractions.map(({ durationMs }) => durationMs));
    report.performance.maxSlowOperationMs = Math.max(0, ...slowInteractions.map(({ durationMs }) => durationMs));
    report.performance.passed =
      report.performance.generalViolations.length === 0 && report.performance.slowOperationViolations.length === 0;
    await writeManualQaFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  }

  async function runStep(id: string, action: () => Promise<void>): Promise<void> {
    const step: ManualQaAutoSongStep = { id, startedAt: new Date().toISOString(), status: "running" };
    report.steps.push(step);
    await persistReport();
    try {
      await withManualQaTimeout(action(), `auto-movement step ${id}`, 900000);
      step.status = "passed";
    } catch (error) {
      step.status = "failed";
      step.detail = error instanceof Error ? error.message : String(error);
      if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
        const failurePng = (await win.webContents.capturePage()).toPNG();
        const failureScreenshot = path.join(activeConfiguration.evidenceDirectory, `auto-movement-failure-${id}.png`);
        await writeManualQaFile(failureScreenshot, failurePng, { mode: 0o600 });
        step.detail += ` / screenshot ${failureScreenshot}`;
      }
      report.failures.push(`${id}: ${step.detail}`);
      throw error;
    } finally {
      step.completedAt = new Date().toISOString();
      await persistReport();
    }
  }

  async function clickAndWait(testId: string, description: string, expression: string, timeoutMs = 15000): Promise<void> {
    const interactionStartedAt = Date.now();
    await clickManualQaNativeTarget(win, testId);
    try {
      await waitForManualQaCondition(win, description, expression, timeoutMs);
      finalizeManualQaNativeInteraction(testId, interactionStartedAt);
    } catch (error) {
      const interaction = [...manualQaAutoSongInteractions].reverse().find((candidate) => candidate.testId === testId);
      throw new Error(
        `${error instanceof Error ? error.message : String(error)} Native interaction: ${JSON.stringify(interaction ?? null)}.`
      );
    }
  }

  async function arrangementBlockCount(): Promise<number> {
    return (await win.webContents.executeJavaScript(
      `document.querySelectorAll('[data-testid="arrangement-timeline"] > [data-testid^="arrangement-block-"]').length`
    )) as number;
  }

  async function selectArrangementBlock(index: number): Promise<void> {
    const selected = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="arrangement-block-${index}"]')?.getAttribute('aria-pressed') === 'true'`
    )) as boolean;
    if (selected) {
      return;
    }
    await clickAndWait(
      `arrangement-block-${index}`,
      `Arrangement block ${index + 1} selected`,
      `document.querySelector('[data-testid="arrangement-block-${index}"]')?.getAttribute('aria-pressed') === 'true'`
    );
  }

  async function resizeArrangement(): Promise<void> {
    let currentCount = await arrangementBlockCount();
    while (currentCount > spec.arrangement.length) {
      const deleteIndex = currentCount - 1;
      await selectArrangementBlock(deleteIndex);
      const expectedCount = currentCount - 1;
      await clickAndWait(
        "arrangement-delete",
        `Arrangement reduced to ${expectedCount} blocks`,
        `document.querySelectorAll('[data-testid="arrangement-timeline"] > [data-testid^="arrangement-block-"]').length === ${expectedCount}`
      );
      currentCount = expectedCount;
    }
    for (let index = 0; index < currentCount; index += 1) {
      await selectArrangementBlock(index);
      await replaceManualQaNativeNumber(win, "arrangement-bars-input", 1);
    }
    while (currentCount < spec.arrangement.length) {
      await selectArrangementBlock(currentCount - 1);
      const expectedCount = currentCount + 1;
      await clickAndWait(
        "arrangement-duplicate",
        `Arrangement expanded to ${expectedCount} blocks`,
        `document.querySelectorAll('[data-testid="arrangement-timeline"] > [data-testid^="arrangement-block-"]').length === ${expectedCount}`
      );
      currentCount = expectedCount;
    }
  }

  async function applyArrangementBlock(index: number, block: ManualQaMovementBlock): Promise<void> {
    await selectArrangementBlock(index);
    await selectManualQaNativeOption(win, "arrangement-section-select", block.section);
    const patternSelected = (await win.webContents.executeJavaScript(
      `document.querySelector('[data-testid="arrangement-pattern-${block.pattern}"]')?.classList.contains('selected') === true`
    )) as boolean;
    if (!patternSelected) {
      await clickAndWait(
        `arrangement-pattern-${block.pattern}`,
        `Arrangement block ${index + 1} Pattern ${block.pattern}`,
        `document.querySelector('[data-testid="arrangement-pattern-${block.pattern}"]')?.classList.contains('selected') === true`
      );
    }
    await replaceManualQaNativeNumber(win, "arrangement-energy-input", Math.round(block.energy * 100));
    for (const track of ["drum_rack", "bass_808", "synth", "chord"] as const) {
      const expectedMuted = block.mutedTracks.includes(track);
      const muted = (await win.webContents.executeJavaScript(
        `document.querySelector('[data-testid="arrangement-track-mute-${track}"]')?.getAttribute('aria-pressed') === 'true'`
      )) as boolean;
      if (muted !== expectedMuted) {
        await clickAndWait(
          `arrangement-track-mute-${track}`,
          `Arrangement block ${index + 1} ${track} mute ${expectedMuted ? "on" : "off"}`,
          `document.querySelector('[data-testid="arrangement-track-mute-${track}"]')?.getAttribute('aria-pressed') === '${expectedMuted}'`
        );
      }
    }
    await replaceManualQaNativeNumber(win, "arrangement-bars-input", block.bars);
  }

  async function captureZone(zone: "arrange" | "deliver" | "mix"): Promise<void> {
    if (zone === "mix" || zone === "deliver") {
      await waitForManualQaCondition(
        win,
        `${zone} exact audio analysis`,
        `document.querySelector('main[data-audio-analysis-state]')?.getAttribute('data-audio-analysis-state') === 'ready' &&
          document.querySelector('[data-testid="audio-analysis-status"]')?.textContent?.trim() === 'Audio meters ready'`,
        180000
      );
    }
    report.zones[zone] = await captureManualQaMovementZone(win, zone, activeConfiguration.evidenceDirectory);
    await persistReport();
  }

  async function run(): Promise<void> {
    Object.assign(report.safety, manualQaUserDataPosture(activeConfiguration));
    if (!report.safety.userDataIsolated) {
      throw new Error(`Electron userData was not isolated inside the Movement QA workspace: ${report.safety.userDataPath}`);
    }
    await waitForManualQaCondition(
      win,
      "production renderer movement controls",
      `document.querySelector('[data-testid="project-open"]') !== null &&
        document.querySelector('[data-testid="workflow-jump-arrange"]') !== null`,
      120000
    );
    win.setTitle("GrooveForge — Auto Movement QA");
    win.show();
    win.focus();

    await runStep("open-source-and-edit-metadata", async () => {
      const openInteractionStartedAt = Date.now();
      await clickManualQaNativeTarget(win, "project-open");
      await waitForManualQaCondition(
        win,
        "Movement source Open completion",
        `document.querySelector('[data-testid="project-title-input"]')?.value === ${JSON.stringify(String(sourceProject.title ?? ""))} &&
          document.querySelector('[data-testid="project-status"]')?.textContent?.includes('Loaded') === true`,
        120000
      );
      finalizeManualQaNativeInteraction("project-open", openInteractionStartedAt);
      await replaceManualQaNativeText(win, "project-title-input", spec.title);
      await ensureManualQaDetailsOpen(win, "guidance-center", "guidance-center-toggle");
      await replaceManualQaNativeText(win, "session-brief-artist", spec.sessionBrief.artist);
      await replaceManualQaNativeText(win, "session-brief-vibe", spec.sessionBrief.vibe);
      await replaceManualQaNativeText(win, "session-brief-reference", spec.sessionBrief.reference);
      await replaceManualQaNativeText(win, "session-brief-notes", spec.sessionBrief.notes);
    });

    await runStep("apply-arrangement", async () => {
      await clickAndWait(
        "workflow-jump-arrange",
        "Arrange functional tab",
        `document.querySelector('[data-testid="workflow-jump-arrange"]')?.getAttribute('aria-selected') === 'true'`
      );
      await resizeArrangement();
      for (const [index, block] of spec.arrangement.entries()) {
        await applyArrangementBlock(index, block);
      }
      await waitForManualQaCondition(
        win,
        "Movement arrangement block and bar totals",
        `(() => {
          const blocks = Array.from(document.querySelectorAll('[data-testid="arrangement-timeline"] > [data-testid^="arrangement-block-"]'));
          const bars = blocks.reduce((total, block) => {
            const match = /([0-9]+) bars?/.exec(block.textContent ?? '');
            return total + Number(match?.[1] ?? 0);
          }, 0);
          return blocks.length === ${spec.arrangement.length} && bars === ${expectedArrangementBars};
        })()`
      );
      await captureZone("arrange");
    });

    await runStep("apply-length-bound-master-automation", async () => {
      await clickAndWait(
        "workflow-jump-mix",
        "Mix functional tab",
        `document.querySelector('[data-testid="workflow-jump-mix"]')?.getAttribute('aria-selected') === 'true'`
      );
      await clickAndWait(
        "mix-page-tab-master",
        "Master & Review workspace page",
        `document.querySelector('[data-testid="mix-page-tab-master"]')?.getAttribute('aria-selected') === 'true' &&
          document.getElementById('mix-page-panel-master')?.hidden === false`
      );
      await ensureManualQaDetailsOpen(win, "master-polish-tools", "master-polish-toggle");
      const automationActive = (await win.webContents.executeJavaScript(
        `document.querySelector('[data-testid="master-automation-${spec.masterAutomation}"]')?.classList.contains('active') === true`
      )) as boolean;
      if (!automationActive) {
        await clickAndWait(
          `master-automation-${spec.masterAutomation}`,
          `Master automation ${spec.masterAutomation}`,
          `document.querySelector('[data-testid="master-automation-${spec.masterAutomation}"]')?.classList.contains('active') === true`
        );
      }
      await captureZone("mix");
    });

    let wavDownload: ManualQaDownloadEvidence | undefined;
    await runStep("deliver-export-save-and-reopen", async () => {
      await clickAndWait(
        "workflow-jump-deliver",
        "Deliver functional tab",
        `document.querySelector('[data-testid="workflow-jump-deliver"]')?.getAttribute('aria-selected') === 'true'`
      );
      await waitForManualQaCondition(
        win,
        "Deliver exact audio analysis",
        `document.querySelector('main[data-audio-analysis-state]')?.getAttribute('data-audio-analysis-state') === 'ready' &&
          document.querySelector('[data-testid="audio-analysis-status"]')?.textContent?.trim() === 'Audio meters ready'`,
        180000
      );
      const downloadStartIndex = manualQaDownloads.length;
      const exportInteractionStartedAt = Date.now();
      await clickManualQaNativeTarget(win, "handoff-pack-action-wav");
      const downloadDeadline = Date.now() + 180000;
      while (
        Date.now() < downloadDeadline &&
        !manualQaDownloads.slice(downloadStartIndex).some((download) => download.state === "completed" && download.filePath.endsWith(".wav"))
      ) {
        await waitForManualQaDelay(100);
      }
      wavDownload = manualQaDownloads
        .slice(downloadStartIndex)
        .find((download) => download.state === "completed" && download.filePath.endsWith(".wav"));
      if (!wavDownload) {
        throw new Error(`Movement WAV download did not complete: ${JSON.stringify(manualQaDownloads.slice(downloadStartIndex))}.`);
      }
      finalizeManualQaNativeInteraction("handoff-pack-action-wav", exportInteractionStartedAt);

      const saveInteractionStartedAt = Date.now();
      await clickManualQaNativeTarget(win, "project-save");
      await waitForManualQaCondition(
        win,
        "Movement Save completion",
        `document.querySelector('[data-testid="project-status"]')?.textContent?.includes('Saved') === true`,
        120000
      );
      const saveDeadline = Date.now() + 120000;
      while (Date.now() < saveDeadline && !existsSync(activeConfiguration.savePath)) {
        await waitForManualQaDelay(100);
      }
      if (!existsSync(activeConfiguration.savePath)) {
        throw new Error("Movement Save did not create the isolated target project.");
      }
      finalizeManualQaNativeInteraction("project-save", saveInteractionStartedAt);

      manualQaOpenPathOverride = activeConfiguration.savePath;
      const reopenInteractionStartedAt = Date.now();
      await clickManualQaNativeTarget(win, "project-open");
      await waitForManualQaCondition(
        win,
        "Movement saved-project reopen completion",
        `document.querySelector('[data-testid="project-title-input"]')?.value === ${JSON.stringify(spec.title)} &&
          document.querySelector('[data-testid="project-status"]')?.textContent?.includes('Loaded') === true`,
        120000
      );
      finalizeManualQaNativeInteraction("project-open", reopenInteractionStartedAt);
      const reopenedProject = await readManualQaLiveProjectContract(win);
      report.reopenedProject = {
        ...reopenedProject,
        arrangementMatches:
          manualQaCanonicalJson(reopenedProject.arrangement) === manualQaCanonicalJson(spec.arrangement),
        automationMatches:
          manualQaCanonicalJson(reopenedProject.automation) === manualQaCanonicalJson(expectedAutomation)
      };
      await persistReport();
      if (!report.reopenedProject.arrangementMatches || !report.reopenedProject.automationMatches) {
        throw new Error(
          `Movement reopened-project live contract mismatch: ${JSON.stringify(report.reopenedProject)}.`
        );
      }
      await captureZone("deliver");
    });

    const savedContents = await readFile(activeConfiguration.savePath, "utf8");
    const savedProject = manualQaProjectPayload(savedContents);
    const savedSessionBrief = manualQaObject(savedProject.sessionBrief);
    const savedArrangement = Array.isArray(savedProject.arrangement) ? savedProject.arrangement : [];
    const savedArrangementBars = savedArrangement.reduce((total, block) => {
      const bars = manualQaObject(block).bars;
      return total + (typeof bars === "number" ? bars : 0);
    }, 0);
    const preservedSourceCore =
      manualQaMovementPreservedCoreSha256(savedProject) === activeConfiguration.movementSourceCoreSha256;
    const contractMatches =
      savedProject.title === spec.title &&
      manualQaCanonicalJson(savedSessionBrief) === manualQaCanonicalJson(spec.sessionBrief) &&
      manualQaCanonicalJson(savedArrangement) === manualQaCanonicalJson(spec.arrangement) &&
      savedArrangementBars === expectedArrangementBars &&
      manualQaCanonicalJson(savedProject.automation) === manualQaCanonicalJson(expectedAutomation) &&
      preservedSourceCore;
    if (!contractMatches) {
      throw new Error(
        `Saved movement contract mismatch: ${JSON.stringify({
          arrangementBars: savedArrangementBars,
          arrangementBlocks: savedArrangement.length,
          automation: savedProject.automation,
          preservedSourceCore,
          sessionBrief: savedSessionBrief,
          title: savedProject.title
        })}.`
      );
    }
    if (!wavDownload) {
      throw new Error("Movement WAV evidence was unavailable after the deliver step.");
    }
    const wavContents = await readFile(wavDownload.filePath);
    const wav = parseManualQaPcmWav(wavContents);
    const savedBpm = typeof savedProject.bpm === "number" ? savedProject.bpm : Number.NaN;
    if (!Number.isFinite(savedBpm) || savedBpm <= 0) {
      throw new Error(`Saved movement BPM is invalid for WAV duration verification: ${String(savedProject.bpm)}.`);
    }
    const stepDurationSeconds = 60 / savedBpm / 4;
    const expectedDurationSeconds =
      expectedArrangementBars * 16 * stepDurationSeconds + Math.max(0.75, stepDurationSeconds * 6);
    const expectedFrameCount = Math.ceil(expectedDurationSeconds * wav.sampleRate);
    if (wav.frameCount !== expectedFrameCount) {
      throw new Error(
        `Movement WAV duration mismatch: ${JSON.stringify({ actualFrames: wav.frameCount, expectedFrames: expectedFrameCount, savedBpm })}.`
      );
    }
    report.project = {
      arrangementBars: savedArrangementBars,
      arrangementBlocks: savedArrangement.length,
      automation: savedProject.automation,
      bpm: savedProject.bpm,
      key: savedProject.key,
      mode: savedProject.mode,
      path: activeConfiguration.savePath,
      preservedSourceCore,
      sessionBrief: savedSessionBrief,
      sha256: createHash("sha256").update(savedContents).digest("hex"),
      styleId: savedProject.styleId,
      title: savedProject.title
    };
    report.wav = {
      bitDepth: wav.bitDepth,
      bytes: wavContents.byteLength,
      channels: wav.channels,
      durationSeconds: wav.durationSeconds,
      path: wavDownload.filePath,
      sampleRate: wav.sampleRate,
      sha256: createHash("sha256").update(wavContents).digest("hex")
    };

    const finalSourceContents = await readFile(activeConfiguration.openPath);
    report.safety.sourceFixtureUnchanged =
      createHash("sha256").update(finalSourceContents).digest("hex") === report.safety.sourceFixtureSha256;
    if (!report.safety.sourceFixtureUnchanged) {
      report.failures.push("The isolated movement source fixture changed during actual-app QA.");
    }
    Object.assign(report.safety, manualQaUserDataPosture(activeConfiguration));
    if (!report.safety.userDataIsolated) {
      report.failures.push(`Electron userData isolation changed during Movement QA: ${report.safety.userDataPath}.`);
    }
    report.ok = report.failures.length === 0 && report.performance.passed;
    report.completedAt = new Date().toISOString();
    await persistReport();
    console.log(`${manualQaResultPrefix}${JSON.stringify({ ok: report.ok, phase: "auto-movement", reportPath, report })}`);
    finished = true;
    if (activeConfiguration.autoExit) {
      await waitForManualQaDelay(250);
      exitDesktopSmoke(report.ok ? 0 : 1);
    }
  }

  const timeout = setTimeout(() => {
    if (!finished) {
      report.failures.push("Auto-movement QA timed out before completion.");
      report.completedAt = new Date().toISOString();
      void persistReport().finally(() => exitDesktopSmoke(1));
    }
  }, 1_200_000);
  win.once("closed", () => clearTimeout(timeout));
  win.webContents.once("did-finish-load", () => {
    void run().catch(async (error: unknown) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);
      const message = error instanceof Error ? error.message : String(error);
      try {
        const finalSourceContents = await readFile(activeConfiguration.openPath);
        report.safety.sourceFixtureUnchanged =
          createHash("sha256").update(finalSourceContents).digest("hex") === report.safety.sourceFixtureSha256;
      } catch {
        report.safety.sourceFixtureUnchanged = false;
      }
      if (!report.failures.some((failure) => failure.includes(message))) {
        report.failures.push(message);
      }
      report.completedAt = new Date().toISOString();
      report.ok = false;
      await persistReport();
      console.error(`${manualQaResultPrefix}${JSON.stringify({ ok: false, phase: "auto-movement", reportPath, report })}`);
      if (activeConfiguration.autoExit) {
        await waitForManualQaDelay(250);
        exitDesktopSmoke(1);
      }
    });
  });
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1180,
    minHeight: 760,
    title: "GrooveForge",
    backgroundColor: "#0f1115",
    paintWhenInitiallyHidden: true,
    show: isProjectIoSmoke || isManualQa,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      partition: isLaunchSmoke
        ? `grooveforge-launch-smoke-${process.pid}`
        : isProjectIoSmoke
          ? `grooveforge-project-io-smoke-${process.pid}`
        : isCloseFlowSmoke
          ? `grooveforge-close-flow-smoke-${process.pid}`
        : isManualQa
          ? `grooveforge-manual-qa-${isManualQaAutoMovement ? "auto-movement" : isManualQaAutoSong ? "auto-song" : isManualQaAutoExit ? "auto" : "visible"}-${process.pid}`
          : undefined,
      backgroundThrottling: !(isLaunchSmoke || isProjectIoSmoke || isCloseFlowSmoke || isManualQa)
    }
  });

  installManualQaDownloadRouting(win);
  installManualQaPassiveEvidence(win);
  installManualQaAutoSong(win);
  installManualQaAutoMovement(win);

  if (isLaunchSmoke) {
    installLaunchSmoke(win);
  } else if (isProjectIoSmoke) {
    installProjectIoSmoke(win);
  } else if (isCloseFlowSmoke) {
    installCloseFlowSmoke(win);
  } else {
    win.once("ready-to-show", () => {
      win.show();
    });
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-prevent-unload", (event) => {
    if (isCloseFlowSmoke) {
      closeFlowSmokeState.willPreventUnloadCount += 1;
      closeFlowSmokeState.events.push("first-close-prevented");
    }
    const choice = isCloseFlowSmoke
      ? saveAndCloseChoiceId
      : dialog.showMessageBoxSync(win, {
          type: "warning",
          buttons: ["Save and close", "Close without a project file", "Keep editing"],
          defaultId: saveAndCloseChoiceId,
          cancelId: keepEditingChoiceId,
          title: "Unsaved GrooveForge work",
          message: "Save this project before closing GrooveForge?",
          detail:
            "Save and close creates a durable .grooveforge.json project file. Newer edits or a recovery draft that has not been restored keep GrooveForge open for review.",
          noLink: true
        });
    if (isCloseFlowSmoke) {
      closeFlowSmokeState.smokeChoiceSubstituted = true;
      closeFlowSmokeState.events.push("smoke-save-choice");
    }
    const action = resolveUnsavedCloseAction(choice);
    if (action === "close-without-project-file") {
      event.preventDefault();
      return;
    }
    if (action === "save-and-close") {
      win.webContents.send(menuCommandChannel, "save-project-and-close");
    }
  });

  if (isDev) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL as string);
  } else {
    void win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

if (ownsSingleInstanceLock) {
  if (!isDesktopSmoke) {
    app.on("second-instance", () => {
      const existingWindow = BrowserWindow.getAllWindows()[0];
      if (!existingWindow) {
        if (app.isReady()) {
          createWindow();
        }
        return;
      }
      if (existingWindow.isMinimized()) {
        existingWindow.restore();
      }
      existingWindow.show();
      existingWindow.focus();
    });
  }

  void app.whenReady().then(async () => {
    if (manualQaConfiguration) {
      await ensureDesktopProjectWorkspace(desktopProjectWorkspace());
      assertManualQaWorkspaceTargetSync(
        manualQaConfiguration.workspaceRoot,
        manualQaConfiguration.evidenceDirectory,
        { expectedType: "directory", mustExist: true }
      );
      assertManualQaWorkspaceTargetSync(
        manualQaConfiguration.workspaceRoot,
        manualQaConfiguration.exportsDirectory,
        { expectedType: "directory", mustExist: true }
      );
      await assertManualQaPathSafety(manualQaConfiguration.openPath, true);
      await assertManualQaPathSafety(manualQaConfiguration.savePath, false);
    }
    registerProjectFileHandlers();
    Menu.setApplicationMenu(createNativeCommandMenu());
    createWindow();

    app.on("activate", () => {
      if (!isCloseFlowSmoke && BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on("window-all-closed", () => {
  if ((process.platform !== "darwin" || isManualQa) && !isCloseFlowSmoke) {
    app.quit();
  }
});

app.on("will-quit", () => {
  closeProjectStorage();
});
