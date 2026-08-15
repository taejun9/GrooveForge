#!/usr/bin/env node

import { createHash, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir, tmpdir } from "node:os";
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, stat, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { macGuiLaunchAbortDetails, macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const argumentList = process.argv.slice(2);
const args = new Set(argumentList);
const prepareOnly = args.has("--prepare-only");
const autoSongQa = args.has("--auto-song-qa");
const autoMovementQa = args.has("--auto-movement-qa");
const autoQa = autoSongQa || autoMovementQa;
const safetySelfTest = args.has("--safety-self-test");
const movementSpecArgumentIndex = argumentList.indexOf("--movement-spec");
const configuredMovementSpecPath =
  (movementSpecArgumentIndex >= 0 ? argumentList[movementSpecArgumentIndex + 1] : undefined) ||
  process.env.GROOVEFORGE_DESKTOP_MANUAL_QA_MOVEMENT_SPEC_PATH;
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const repositoryQaBase = path.join(root, "build", "desktop");
const temporaryQaBase = path.resolve(tmpdir());
const manualQaSentinelName = ".grooveforge-manual-qa-owned.json";
const manualQaSentinelOwner = "GrooveForge desktop manual QA";
const manualQaProvenanceMarker = "grooveforge-manual-qa-provenance-v2";
const provenanceSourceEntries = [
  "electron",
  "harness/scripts/run_desktop_manual_qa.mjs",
  "src",
  "index.html",
  "package.json",
  "package-lock.json",
  "tsconfig.electron.json",
  "tsconfig.json",
  "vite.config.ts"
];
const provenanceBuildRoots = ["dist", "dist-electron"];
const provenanceElectronMainPath = "dist-electron/main.js";
const provenanceRequiredBuildFiles = [
  "dist/index.html",
  provenanceElectronMainPath,
  "dist-electron/preload.cjs"
];
const defaultWorkspaceRoot = path.join(
  repositoryQaBase,
  `plan-1525-manual-qa-${process.pid}-${Date.now().toString(36)}`
);
const workspaceRoot = path.resolve(process.env.GROOVEFORGE_DESKTOP_WORKSPACE_ROOT || defaultWorkspaceRoot);
const fixturesDirectory = path.join(workspaceRoot, "fixtures");
const projectsDirectory = path.join(workspaceRoot, "Projects");
const dataDirectory = path.join(workspaceRoot, "Data");
const evidenceDirectory = path.join(workspaceRoot, "evidence");
const exportsDirectory = path.join(workspaceRoot, "exports");
const electronUserDataDirectory = path.join(workspaceRoot, "ElectronUserData");
const movementSpecPath = path.join(fixturesDirectory, "movement-spec.json");
const openPath = path.resolve(
  autoMovementQa
    ? path.join(fixturesDirectory, "movement-source.grooveforge.json")
    : process.env.GROOVEFORGE_DESKTOP_MANUAL_QA_OPEN_PATH || path.join(fixturesDirectory, "manual-start.grooveforge.json")
);

function pathIsInsideRoot(rootPath, candidate) {
  const relativePath = path.relative(rootPath, candidate);
  return relativePath !== "" && relativePath !== ".." && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
}

function pathIsInsideOrEqual(rootPath, candidate) {
  return path.resolve(rootPath) === path.resolve(candidate) || pathIsInsideRoot(rootPath, candidate);
}

async function lstatOrNull(filePath) {
  try {
    return await lstat(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function manualQaAllowedBase(candidate) {
  const resolved = path.resolve(candidate);
  for (const base of [repositoryQaBase, temporaryQaBase]) {
    if (pathIsInsideRoot(base, resolved)) {
      return base;
    }
  }
  throw new Error(
    "GROOVEFORGE_DESKTOP_WORKSPACE_ROOT must be a child of the repository build/desktop directory or the operating-system temp directory."
  );
}

async function assertExistingComponentsDoNotSymlink(basePath, candidate, label) {
  if (!pathIsInsideOrEqual(basePath, candidate)) {
    throw new Error(`${label} escaped its allowed base.`);
  }
  const relative = path.relative(basePath, candidate);
  let current = basePath;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    const stats = await lstatOrNull(current);
    if (!stats) {
      break;
    }
    if (stats.isSymbolicLink()) {
      throw new Error(`${label} rejected symbolic-link path component: ${current}`);
    }
  }
}

async function assertSafeWorkspaceTarget(
  candidate,
  { expectedType = null, mustExist = false } = {},
  targetWorkspaceRoot = workspaceRoot
) {
  const resolved = path.resolve(candidate);
  if (!pathIsInsideRoot(targetWorkspaceRoot, resolved)) {
    throw new Error(`Manual QA target escaped its workspace root: ${resolved}`);
  }
  const rootStats = await lstatOrNull(targetWorkspaceRoot);
  if (!rootStats || rootStats.isSymbolicLink() || !rootStats.isDirectory()) {
    throw new Error("Manual QA workspace root must be an existing non-symbolic-link directory.");
  }
  await assertExistingComponentsDoNotSymlink(targetWorkspaceRoot, resolved, "Manual QA target");
  const relative = path.relative(targetWorkspaceRoot, resolved);
  const segments = relative.split(path.sep).filter(Boolean);
  let current = targetWorkspaceRoot;
  let missing = false;
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    const stats = await lstatOrNull(current);
    const final = index === segments.length - 1;
    if (!stats) {
      missing = true;
      if (mustExist) {
        throw new Error(`Manual QA target must already exist: ${resolved}`);
      }
      break;
    }
    if (stats.isSymbolicLink()) {
      throw new Error(`Manual QA target rejected symbolic link: ${current}`);
    }
    if (!final && !stats.isDirectory()) {
      throw new Error(`Manual QA target parent is not a directory: ${current}`);
    }
    if (final && expectedType === "file" && !stats.isFile()) {
      throw new Error(`Manual QA target must be a regular file: ${resolved}`);
    }
    if (final && expectedType === "directory" && !stats.isDirectory()) {
      throw new Error(`Manual QA target must be a directory: ${resolved}`);
    }
  }
  const workspaceRealPath = await realpath(targetWorkspaceRoot);
  let nearestExisting = missing ? path.dirname(current) : resolved;
  while (!(await lstatOrNull(nearestExisting))) {
    const parent = path.dirname(nearestExisting);
    if (parent === nearestExisting) {
      throw new Error(`Manual QA target has no existing workspace parent: ${resolved}`);
    }
    nearestExisting = parent;
  }
  const nearestRealPath = await realpath(nearestExisting);
  if (!pathIsInsideOrEqual(workspaceRealPath, nearestRealPath)) {
    throw new Error(`Manual QA target escaped the real workspace root: ${resolved}`);
  }
  return resolved;
}

async function ensureSafeWorkspaceDirectory(directory, targetWorkspaceRoot = workspaceRoot) {
  await assertSafeWorkspaceTarget(directory, { expectedType: "directory" }, targetWorkspaceRoot);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await assertSafeWorkspaceTarget(
    directory,
    { expectedType: "directory", mustExist: true },
    targetWorkspaceRoot
  );
}

async function prepareOwnedWorkspace(candidate) {
  const resolved = path.resolve(candidate);
  if ([path.resolve(root), path.resolve(homedir()), path.resolve(repositoryQaBase), temporaryQaBase].includes(resolved)) {
    throw new Error("Manual QA workspace root must not be HOME, the repository root, build/desktop itself, or the temp root.");
  }
  const allowedBase = manualQaAllowedBase(resolved);
  if (allowedBase === repositoryQaBase) {
    await assertExistingComponentsDoNotSymlink(root, repositoryQaBase, "Manual QA repository base");
    if (!(await lstatOrNull(repositoryQaBase))) {
      await mkdir(repositoryQaBase, { recursive: true, mode: 0o700 });
    }
    await assertExistingComponentsDoNotSymlink(root, repositoryQaBase, "Manual QA repository base");
  }
  const baseStats = await lstatOrNull(allowedBase);
  if (!baseStats || baseStats.isSymbolicLink() || !baseStats.isDirectory()) {
    throw new Error(`Manual QA allowed base must be a real directory: ${allowedBase}`);
  }
  await assertExistingComponentsDoNotSymlink(allowedBase, resolved, "Manual QA workspace root");
  let rootStats = await lstatOrNull(resolved);
  let fresh = false;
  if (!rootStats) {
    await mkdir(resolved, { recursive: true, mode: 0o700 });
    fresh = true;
    rootStats = await lstat(resolved);
  }
  if (rootStats.isSymbolicLink() || !rootStats.isDirectory()) {
    throw new Error("Manual QA workspace root must be a non-symbolic-link directory.");
  }
  await assertExistingComponentsDoNotSymlink(allowedBase, resolved, "Manual QA workspace root");
  const allowedBaseRealPath = await realpath(allowedBase);
  const workspaceRealPath = await realpath(resolved);
  if (!pathIsInsideRoot(allowedBaseRealPath, workspaceRealPath)) {
    throw new Error("Manual QA workspace real path escaped its allowed base.");
  }

  const sentinelPath = path.join(resolved, manualQaSentinelName);
  let ownershipToken;
  if (fresh) {
    ownershipToken = randomBytes(32).toString("hex");
    await assertSafeWorkspaceTarget(sentinelPath, {}, resolved);
    await writeFile(
      sentinelPath,
      `${JSON.stringify({ owner: manualQaSentinelOwner, ownershipToken, schemaVersion: 1, workspaceRealPath }, null, 2)}\n`,
      { encoding: "utf8", flag: "wx", mode: 0o600 }
    );
  } else {
    await assertSafeWorkspaceTarget(sentinelPath, { expectedType: "file", mustExist: true }, resolved);
    const sentinel = JSON.parse(await readFile(sentinelPath, "utf8"));
    if (
      sentinel?.owner !== manualQaSentinelOwner ||
      sentinel?.schemaVersion !== 1 ||
      sentinel?.workspaceRealPath !== workspaceRealPath ||
      typeof sentinel?.ownershipToken !== "string" ||
      !/^[a-f0-9]{64}$/u.test(sentinel.ownershipToken)
    ) {
      throw new Error("Existing Manual QA workspace has an invalid ownership sentinel.");
    }
    ownershipToken = sentinel.ownershipToken;
  }
  return { ownershipToken, sentinelPath, workspaceRealPath };
}

async function nextDefaultSavePath() {
  const basePath = path.join(projectsDirectory, "문-없는-방.grooveforge.json");
  if (!(await lstatOrNull(basePath))) {
    return basePath;
  }
  await assertSafeWorkspaceTarget(basePath, { expectedType: "file", mustExist: true });
  let suffix = 2;
  while (await lstatOrNull(path.join(projectsDirectory, `문-없는-방-${suffix}.grooveforge.json`))) {
    await assertSafeWorkspaceTarget(path.join(projectsDirectory, `문-없는-방-${suffix}.grooveforge.json`), {
      expectedType: "file",
      mustExist: true
    });
    suffix += 1;
  }
  return path.join(projectsDirectory, `문-없는-방-${suffix}.grooveforge.json`);
}

function fail(message, details = "") {
  console.error(`GrooveForge desktop manual QA failed: ${message}`);
  if (details.trim()) {
    console.error(details.trim());
  }
  process.exit(1);
}

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function objectValue(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
}

function movementPreservedCore(project) {
  const core = JSON.parse(JSON.stringify(project));
  for (const key of ["arrangement", "automation", "selectedPattern", "sessionBrief", "title"]) {
    delete core[key];
  }
  return core;
}

function assertExactObjectKeys(value, expectedKeys, label) {
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  if (canonicalJson(actualKeys) !== canonicalJson(sortedExpectedKeys)) {
    throw new Error(`${label} keys must be exactly: ${sortedExpectedKeys.join(", ")}.`);
  }
}

function parseMovementSpec(value, workstation) {
  const spec = objectValue(value);
  if (!spec) {
    throw new Error("Movement spec must be a JSON object.");
  }
  assertExactObjectKeys(
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
    "Movement spec"
  );
  if (spec.schemaVersion !== 1) {
    throw new Error("Movement spec schemaVersion must be 1.");
  }
  if (typeof spec.sourceProjectPath !== "string" || !path.isAbsolute(spec.sourceProjectPath)) {
    throw new Error("Movement spec sourceProjectPath must be an absolute path.");
  }
  const sourceProjectPath = path.resolve(spec.sourceProjectPath);
  if (!sourceProjectPath.endsWith(".grooveforge.json")) {
    throw new Error("Movement spec sourceProjectPath must end with .grooveforge.json.");
  }
  if (
    typeof spec.outputProjectFileName !== "string" ||
    path.basename(spec.outputProjectFileName) !== spec.outputProjectFileName ||
    !spec.outputProjectFileName.endsWith(".grooveforge.json") ||
    spec.outputProjectFileName === ".grooveforge.json"
  ) {
    throw new Error("Movement spec outputProjectFileName must be a safe .grooveforge.json basename.");
  }
  if (typeof spec.title !== "string" || workstation.normalizeProjectTitle(spec.title) !== spec.title) {
    throw new Error("Movement spec title must already satisfy the durable project-title contract.");
  }
  const sessionBrief = objectValue(spec.sessionBrief);
  if (!sessionBrief) {
    throw new Error("Movement spec sessionBrief must be an object.");
  }
  assertExactObjectKeys(sessionBrief, ["artist", "notes", "reference", "vibe"], "Movement spec sessionBrief");
  for (const field of ["artist", "vibe", "reference", "notes"]) {
    if (typeof sessionBrief[field] !== "string") {
      throw new Error(`Movement spec sessionBrief.${field} must be a string.`);
    }
  }
  const normalizedSessionBrief = workstation.projectSessionBrief({ sessionBrief });
  if (canonicalJson(normalizedSessionBrief) !== canonicalJson(sessionBrief)) {
    throw new Error("Movement spec sessionBrief fields must already satisfy durable whitespace and length bounds.");
  }
  if (!workstation.masterAutomationPresetIds.includes(spec.masterAutomation)) {
    throw new Error("Movement spec masterAutomation must be none, fade_in, fade_out, or intro_outro.");
  }
  if (!Array.isArray(spec.arrangement) || spec.arrangement.length < 1 || spec.arrangement.length > workstation.maxProjectArrangementBars) {
    throw new Error(`Movement spec arrangement must contain 1-${workstation.maxProjectArrangementBars} blocks.`);
  }
  let totalBars = 0;
  const arrangement = spec.arrangement.map((candidate, index) => {
    const block = objectValue(candidate);
    if (!block) {
      throw new Error(`Movement spec arrangement[${index}] must be an object.`);
    }
    assertExactObjectKeys(block, ["bars", "energy", "mutedTracks", "pattern", "section"], `Movement spec arrangement[${index}]`);
    if (!workstation.arrangementSections.includes(block.section)) {
      throw new Error(`Movement spec arrangement[${index}].section is invalid.`);
    }
    if (!workstation.patternSlots.includes(block.pattern)) {
      throw new Error(`Movement spec arrangement[${index}].pattern is invalid.`);
    }
    if (!Number.isInteger(block.bars) || block.bars < workstation.minArrangementBars || block.bars > workstation.maxArrangementBars) {
      throw new Error(
        `Movement spec arrangement[${index}].bars must be an integer from ${workstation.minArrangementBars}-${workstation.maxArrangementBars}.`
      );
    }
    if (
      typeof block.energy !== "number" ||
      !Number.isFinite(block.energy) ||
      block.energy < 0 ||
      block.energy > 1 ||
      Math.abs(block.energy * 100 - Math.round(block.energy * 100)) > 1e-9
    ) {
      throw new Error(`Movement spec arrangement[${index}].energy must use an exact 0.01 step from 0-1.`);
    }
    if (
      !Array.isArray(block.mutedTracks) ||
      new Set(block.mutedTracks).size !== block.mutedTracks.length ||
      !block.mutedTracks.every((track) => workstation.arrangementMuteTrackIds.includes(track))
    ) {
      throw new Error(`Movement spec arrangement[${index}].mutedTracks must contain unique supported track ids.`);
    }
    totalBars += block.bars;
    return {
      bars: block.bars,
      energy: block.energy,
      mutedTracks: workstation.arrangementMuteTrackIds.filter((track) => block.mutedTracks.includes(track)),
      pattern: block.pattern,
      section: block.section
    };
  });
  if (totalBars > workstation.maxProjectArrangementBars) {
    throw new Error(`Movement spec arrangement totals ${totalBars} bars; the product limit is ${workstation.maxProjectArrangementBars}.`);
  }
  return {
    arrangement,
    masterAutomation: spec.masterAutomation,
    outputProjectFileName: spec.outputProjectFileName,
    schemaVersion: 1,
    sessionBrief: normalizedSessionBrief,
    sourceProjectPath,
    title: spec.title
  };
}

async function readExternalRegularFile(filePath, { label, maxBytes }) {
  if (typeof filePath !== "string" || !path.isAbsolute(filePath)) {
    throw new Error(`${label} path must be absolute.`);
  }
  const resolved = path.resolve(filePath);
  const stats = await lstatOrNull(resolved);
  if (!stats || stats.isSymbolicLink() || !stats.isFile()) {
    throw new Error(`${label} must be an existing regular non-symbolic-link file: ${resolved}`);
  }
  if (stats.size > maxBytes) {
    throw new Error(`${label} exceeds the ${maxBytes}-byte safety limit.`);
  }
  return { contents: await readFile(resolved), path: resolved, stats };
}

async function collectExternalSourcePostflight(initialEvidence) {
  try {
    const finalFile = await readExternalRegularFile(initialEvidence.externalSourcePath, {
      label: "Movement source project postflight",
      maxBytes: initialEvidence.maxBytes
    });
    const externalSourceFinalBytes = finalFile.contents.byteLength;
    const externalSourceFinalSha256 = sha256(finalFile.contents);
    return {
      externalSourceFinalBytes,
      externalSourceFinalSha256,
      externalSourceVerifiedAt: new Date().toISOString(),
      sourceUnchanged:
        externalSourceFinalBytes === initialEvidence.externalSourceBytes &&
        externalSourceFinalSha256 === initialEvidence.externalSourceSha256
    };
  } catch (error) {
    return {
      externalSourcePostflightError: error instanceof Error ? error.message : String(error),
      externalSourceVerifiedAt: new Date().toISOString(),
      sourceUnchanged: false
    };
  }
}

async function persistMovementExternalSourcePostflight(reportPath, initialEvidence, postflight) {
  await assertSafeWorkspaceTarget(reportPath, { expectedType: "file", mustExist: true });
  const report = objectValue(JSON.parse(await readFile(reportPath, "utf8")));
  if (
    !report ||
    report.mode !== "visible-native-auto-movement-qa" ||
    !Array.isArray(report.failures) ||
    !objectValue(report.safety)
  ) {
    throw new Error("Movement QA report is missing its required mode, failures, or safety contract.");
  }
  const safety = report.safety;
  safety.externalSourceBytes = initialEvidence.externalSourceBytes;
  safety.externalSourcePath = initialEvidence.externalSourcePath;
  safety.externalSourceSha256 = initialEvidence.externalSourceSha256;
  safety.externalSourceVerifiedAt = postflight.externalSourceVerifiedAt;
  safety.sourceUnchanged = postflight.sourceUnchanged;
  if (typeof postflight.externalSourceFinalBytes === "number") {
    safety.externalSourceFinalBytes = postflight.externalSourceFinalBytes;
  }
  if (typeof postflight.externalSourceFinalSha256 === "string") {
    safety.externalSourceFinalSha256 = postflight.externalSourceFinalSha256;
  }
  if (typeof postflight.externalSourcePostflightError === "string") {
    safety.externalSourcePostflightError = postflight.externalSourcePostflightError;
  }
  if (!postflight.sourceUnchanged) {
    const failure = `External movement source was changed or became unsafe after launch: ${
      postflight.externalSourcePostflightError ??
      JSON.stringify({
        actualBytes: postflight.externalSourceFinalBytes,
        actualSha256: postflight.externalSourceFinalSha256,
        expectedBytes: initialEvidence.externalSourceBytes,
        expectedSha256: initialEvidence.externalSourceSha256
      })
    }.`;
    if (!report.failures.includes(failure)) {
      report.failures.push(failure);
    }
    report.ok = false;
  }
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await assertSafeWorkspaceTarget(reportPath, { expectedType: "file", mustExist: true });
}

async function writeOwnedFixtureOrVerify(filePath, contents, label) {
  const existing = await lstatOrNull(filePath);
  if (existing) {
    await assertSafeWorkspaceTarget(filePath, { expectedType: "file", mustExist: true });
    const existingContents = await readFile(filePath);
    if (!existingContents.equals(contents)) {
      throw new Error(`${label} already exists with different contents; choose a fresh movement workspace.`);
    }
    return;
  }
  await assertSafeWorkspaceTarget(filePath);
  await writeFile(filePath, contents, { flag: "wx", mode: 0o600 });
  await assertSafeWorkspaceTarget(filePath, { expectedType: "file", mustExist: true });
}

function resolveElectronBinary() {
  try {
    const resolvedElectron = require("electron");
    if (typeof resolvedElectron === "string" && existsSync(resolvedElectron)) {
      return resolvedElectron;
    }
  } catch {
    // Fall through to the local binary below.
  }
  const localBinary = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "electron.cmd" : "electron");
  return existsSync(localBinary) ? localBinary : null;
}

async function collectProvenanceSourceFiles(entryPath, collected) {
  const stats = await lstat(entryPath);
  if (stats.isSymbolicLink()) {
    throw new Error(`Manual QA provenance rejects symbolic-link source entries: ${entryPath}`);
  }
  if (stats.isDirectory()) {
    for (const name of (await readdir(entryPath)).sort()) {
      await collectProvenanceSourceFiles(path.join(entryPath, name), collected);
    }
    return;
  }
  if (!stats.isFile()) {
    throw new Error(`Manual QA provenance requires regular source files: ${entryPath}`);
  }
  collected.push({ filePath: entryPath, modifiedAtMs: stats.mtimeMs });
}

async function buildProvenanceFileManifest(baseRoot, rootEntries) {
  const files = [];
  for (const entry of rootEntries) {
    await collectProvenanceSourceFiles(path.join(baseRoot, entry), files);
  }
  files.sort((left, right) => (left.filePath < right.filePath ? -1 : left.filePath > right.filePath ? 1 : 0));
  const digest = createHash("sha256");
  digest.update(`${manualQaProvenanceMarker}\0built-bundle\0`);
  const manifestFiles = [];
  let latestMtimeMs = 0;
  for (const file of files) {
    const contents = await readFile(file.filePath);
    const relativePath = path.relative(baseRoot, file.filePath).split(path.sep).join("/");
    const entry = {
      bytes: contents.byteLength,
      modifiedAtMs: file.modifiedAtMs,
      relativePath,
      sha256: sha256(contents)
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

async function buildManualQaProvenance() {
  const sourceFiles = [];
  for (const entry of provenanceSourceEntries) {
    await collectProvenanceSourceFiles(path.join(root, entry), sourceFiles);
  }
  sourceFiles.sort((left, right) => (left.filePath < right.filePath ? -1 : left.filePath > right.filePath ? 1 : 0));
  const sourceDigest = createHash("sha256");
  sourceDigest.update(`${manualQaProvenanceMarker}\0`);
  let latestSourceMtimeMs = 0;
  for (const sourceFile of sourceFiles) {
    const contents = await readFile(sourceFile.filePath);
    const relativePath = path.relative(root, sourceFile.filePath).split(path.sep).join("/");
    sourceDigest.update(`${relativePath}\0${contents.byteLength}\0`);
    sourceDigest.update(contents);
    latestSourceMtimeMs = Math.max(latestSourceMtimeMs, sourceFile.modifiedAtMs);
  }
  let builtBundle;
  try {
    builtBundle = await buildProvenanceFileManifest(root, provenanceBuildRoots);
  } catch (error) {
    throw new Error(
      `Production bundle is missing or unsafe; run npm run build before desktop:manual-qa. ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
  if (builtBundle.fileCount === 0) {
    throw new Error("Production bundle manifest must contain regular files.");
  }
  const builtPaths = new Set(builtBundle.files.map((entry) => entry.relativePath));
  for (const requiredPath of provenanceRequiredBuildFiles) {
    if (!builtPaths.has(requiredPath)) {
      throw new Error(`Production bundle manifest is missing ${requiredPath}.`);
    }
  }
  return {
    builtBundle,
    marker: manualQaProvenanceMarker,
    sourceTree: {
      fileCount: sourceFiles.length,
      latestMtimeMs: latestSourceMtimeMs,
      sha256: sourceDigest.digest("hex")
    }
  };
}

function manualQaBuiltBundleFailures(expected, actual) {
  const failures = [];
  if (canonicalJson(actual.roots) !== canonicalJson(expected.roots)) {
    failures.push("production bundle roots changed");
  }
  if (actual.fileCount !== expected.fileCount || actual.files.length !== expected.files.length) {
    failures.push("production bundle file inventory changed");
  }
  const comparedFileCount = Math.min(actual.files.length, expected.files.length);
  for (let index = 0; index < comparedFileCount; index += 1) {
    const actualFile = actual.files[index];
    const expectedFile = expected.files[index];
    if (
      actualFile.relativePath !== expectedFile.relativePath ||
      actualFile.bytes !== expectedFile.bytes ||
      actualFile.modifiedAtMs !== expectedFile.modifiedAtMs ||
      actualFile.sha256 !== expectedFile.sha256
    ) {
      failures.push(`production bundle entry changed at ${expectedFile.relativePath}`);
    }
  }
  if (actual.sha256 !== expected.sha256) {
    failures.push("production bundle manifest digest changed");
  }
  return failures;
}

function manualQaBuildFreshnessFailures(provenance, compiledMainContents) {
  const failures = [];
  for (const artifact of provenance.builtBundle.files) {
    if (artifact.modifiedAtMs + 1 < provenance.sourceTree.latestMtimeMs) {
      failures.push(`${artifact.relativePath} predates the current source tree`);
    }
  }
  if (!compiledMainContents.includes(manualQaProvenanceMarker)) {
    failures.push("dist-electron/main.js does not contain the current manual-QA provenance validator");
  }
  return failures;
}

async function expectSafetyRejection(label, operation) {
  try {
    await operation();
  } catch {
    return;
  }
  throw new Error(`Manual QA safety self-test expected rejection: ${label}`);
}

async function runSafetySelfTest() {
  const testRoot = await mkdtemp(path.join(temporaryQaBase, "grooveforge-manual-qa-safety-"));
  try {
    await expectSafetyRejection("HOME workspace", () => prepareOwnedWorkspace(homedir()));
    await expectSafetyRejection("repository workspace", () => prepareOwnedWorkspace(root));
    await expectSafetyRejection("build/desktop boundary", () => prepareOwnedWorkspace(repositoryQaBase));

    const nonOwned = path.join(testRoot, "existing-non-owned");
    await mkdir(nonOwned, { mode: 0o700 });
    await writeFile(path.join(nonOwned, "unrelated.txt"), "not owned\n", "utf8");
    await expectSafetyRejection("existing non-owned workspace", () => prepareOwnedWorkspace(nonOwned));
    const emptyNonOwned = path.join(testRoot, "existing-empty-non-owned");
    await mkdir(emptyNonOwned, { mode: 0o700 });
    await expectSafetyRejection("existing empty non-owned workspace", () => prepareOwnedWorkspace(emptyNonOwned));

    const owned = path.join(testRoot, "owned");
    const ownership = await prepareOwnedWorkspace(owned);
    const ownedExports = path.join(owned, "exports");
    await ensureSafeWorkspaceDirectory(ownedExports, owned);
    const outside = path.join(testRoot, "outside");
    await mkdir(outside, { mode: 0o700 });
    await symlink(outside, path.join(ownedExports, "escape"));
    await expectSafetyRejection("intermediate symbolic-link escape", () =>
      assertSafeWorkspaceTarget(path.join(ownedExports, "escape", "song.wav"), {}, owned)
    );
    await symlink(path.join(outside, "fixture.grooveforge.json"), path.join(owned, "fixture-link.grooveforge.json"));
    await expectSafetyRejection("final symbolic-link target", () =>
      assertSafeWorkspaceTarget(
        path.join(owned, "fixture-link.grooveforge.json"),
        { expectedType: "file", mustExist: true },
        owned
      )
    );

    await writeFile(
      ownership.sentinelPath,
      `${JSON.stringify({ owner: "tampered", ownershipToken: ownership.ownershipToken, schemaVersion: 1, workspaceRealPath: ownership.workspaceRealPath })}\n`,
      "utf8"
    );
    await expectSafetyRejection("tampered ownership sentinel", () => prepareOwnedWorkspace(owned));

    const fakeProvenance = {
      builtBundle: {
        files: [
          { modifiedAtMs: 1, relativePath: "dist/index.html" },
          { modifiedAtMs: 1, relativePath: "dist-electron/main.js" },
          { modifiedAtMs: 1, relativePath: "dist-electron/preload.cjs" }
        ]
      },
      sourceTree: { latestMtimeMs: 3 }
    };
    if (manualQaBuildFreshnessFailures(fakeProvenance, "tampered").length !== 4) {
      throw new Error("Manual QA safety self-test did not reject stale/tampered build provenance.");
    }

    const fakeBuildRoot = path.join(testRoot, "production-bundle");
    await mkdir(path.join(fakeBuildRoot, "dist", "assets"), { recursive: true });
    await mkdir(path.join(fakeBuildRoot, "dist-electron"), { recursive: true });
    const rendererChunkPath = path.join(fakeBuildRoot, "dist", "assets", "renderer.js");
    const rendererCssPath = path.join(fakeBuildRoot, "dist", "assets", "renderer.css");
    const mainPath = path.join(fakeBuildRoot, "dist-electron", "main.js");
    await writeFile(rendererChunkPath, "renderer-v1\n", "utf8");
    await writeFile(rendererCssPath, "css-v1\n", "utf8");
    await writeFile(mainPath, "main-v1\n", "utf8");
    const baselineBundle = await buildProvenanceFileManifest(fakeBuildRoot, provenanceBuildRoots);
    if (baselineBundle.fileCount !== 3 || manualQaBuiltBundleFailures(baselineBundle, baselineBundle).length !== 0) {
      throw new Error("Manual QA safety self-test could not establish a closed production bundle manifest.");
    }

    await writeFile(rendererChunkPath, "renderer-tampered\n", "utf8");
    const tamperedBundle = await buildProvenanceFileManifest(fakeBuildRoot, provenanceBuildRoots);
    if (manualQaBuiltBundleFailures(baselineBundle, tamperedBundle).length === 0) {
      throw new Error("Manual QA safety self-test did not reject a modified renderer chunk.");
    }
    await writeFile(rendererChunkPath, "renderer-v1\n", "utf8");
    const restoredBundle = await buildProvenanceFileManifest(fakeBuildRoot, provenanceBuildRoots);
    await writeFile(path.join(fakeBuildRoot, "dist", "assets", "unexpected.js"), "unexpected\n", "utf8");
    const addedBundle = await buildProvenanceFileManifest(fakeBuildRoot, provenanceBuildRoots);
    if (manualQaBuiltBundleFailures(restoredBundle, addedBundle).length === 0) {
      throw new Error("Manual QA safety self-test did not reject an added production bundle file.");
    }
    await rm(path.join(fakeBuildRoot, "dist", "assets", "unexpected.js"));
    await rm(rendererCssPath);
    const deletedBundle = await buildProvenanceFileManifest(fakeBuildRoot, provenanceBuildRoots);
    if (manualQaBuiltBundleFailures(restoredBundle, deletedBundle).length === 0) {
      throw new Error("Manual QA safety self-test did not reject a deleted production bundle file.");
    }
    await symlink(path.join(fakeBuildRoot, "dist-electron", "main.js"), rendererCssPath);
    await expectSafetyRejection("production bundle symbolic-link entry", () =>
      buildProvenanceFileManifest(fakeBuildRoot, provenanceBuildRoots)
    );

    const externalSourcePath = path.join(testRoot, "movement-source.grooveforge.json");
    await writeFile(externalSourcePath, "source-v1\n", "utf8");
    const externalSource = await readExternalRegularFile(externalSourcePath, {
      label: "Safety self-test movement source",
      maxBytes: 1024
    });
    const initialExternalSourceEvidence = {
      externalSourceBytes: externalSource.contents.byteLength,
      externalSourcePath: externalSource.path,
      externalSourceSha256: sha256(externalSource.contents),
      maxBytes: 1024
    };
    const unchangedPostflight = await collectExternalSourcePostflight(initialExternalSourceEvidence);
    if (!unchangedPostflight.sourceUnchanged) {
      throw new Error("Manual QA safety self-test could not prove an unchanged external source.");
    }
    await writeFile(externalSourcePath, "source-v2\n", "utf8");
    const changedPostflight = await collectExternalSourcePostflight(initialExternalSourceEvidence);
    if (changedPostflight.sourceUnchanged) {
      throw new Error("Manual QA safety self-test did not detect a changed external source hash.");
    }
    console.log("GrooveForge desktop manual QA safety self-test passed.");
  } finally {
    await rm(testRoot, { recursive: true, force: true });
  }
}

if (safetySelfTest) {
  await runSafetySelfTest();
  process.exit(0);
}

if (autoSongQa && autoMovementQa) {
  fail("Choose only one automated Manual QA mode: --auto-song-qa or --auto-movement-qa.");
}
if (autoMovementQa && !configuredMovementSpecPath) {
  fail("--auto-movement-qa requires --movement-spec <absolute JSON path>.");
}
if (movementSpecArgumentIndex >= 0 && (!argumentList[movementSpecArgumentIndex + 1] || argumentList[movementSpecArgumentIndex + 1].startsWith("--"))) {
  fail("--movement-spec requires a following path value.");
}
if (configuredMovementSpecPath && !path.isAbsolute(configuredMovementSpecPath)) {
  fail("Movement spec path must be absolute.");
}

let workspaceOwnership;
try {
  workspaceOwnership = await prepareOwnedWorkspace(workspaceRoot);
  for (const directory of [
    fixturesDirectory,
    projectsDirectory,
    dataDirectory,
    evidenceDirectory,
    exportsDirectory,
    electronUserDataDirectory
  ]) {
    await ensureSafeWorkspaceDirectory(directory);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

const workstation = await import("../../src/domain/workstation.ts");
const expectedStarterProject = {
  ...workstation.starterProject,
  snapshots: []
};
const starterContents = workstation.serializeProjectFile(expectedStarterProject);
let movementSpec = null;
let movementSpecContents = null;
let externalSourceEvidence = null;
let openContents = starterContents;
let openProject = expectedStarterProject;
let savePath;

if (autoMovementQa) {
  try {
    const externalSpecFile = await readExternalRegularFile(configuredMovementSpecPath, {
      label: "Movement spec",
      maxBytes: 262_144
    });
    movementSpec = parseMovementSpec(JSON.parse(externalSpecFile.contents.toString("utf8")), workstation);
    const externalSourceFile = await readExternalRegularFile(movementSpec.sourceProjectPath, {
      label: "Movement source project",
      maxBytes: workstation.maxProjectFileBytes
    });
    externalSourceEvidence = {
      externalSourceBytes: externalSourceFile.contents.byteLength,
      externalSourcePath: externalSourceFile.path,
      externalSourceSha256: sha256(externalSourceFile.contents),
      maxBytes: workstation.maxProjectFileBytes
    };
    openContents = externalSourceFile.contents.toString("utf8");
    openProject = workstation.parseProjectFile(openContents);
    movementSpecContents = Buffer.from(`${JSON.stringify(movementSpec, null, 2)}\n`, "utf8");
    await writeOwnedFixtureOrVerify(openPath, externalSourceFile.contents, "Movement source fixture");
    await writeOwnedFixtureOrVerify(movementSpecPath, movementSpecContents, "Movement spec fixture");
    savePath = path.join(projectsDirectory, movementSpec.outputProjectFileName);
  } catch (error) {
    fail(`Could not prepare Movement QA inputs: ${error instanceof Error ? error.message : String(error)}`);
  }
} else {
  savePath = path.resolve(
    process.env.GROOVEFORGE_DESKTOP_MANUAL_QA_SAVE_PATH || (await nextDefaultSavePath())
  );
  if (await lstatOrNull(openPath)) {
    try {
      await assertSafeWorkspaceTarget(openPath, { expectedType: "file", mustExist: true });
      openContents = await readFile(openPath, "utf8");
      openProject = workstation.parseProjectFile(openContents);
    } catch (error) {
      fail(`Manual QA Open fixture is not a valid GrooveForge project: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (
      sha256(canonicalJson(openProject)) !== sha256(canonicalJson(expectedStarterProject)) &&
      !process.env.GROOVEFORGE_DESKTOP_MANUAL_QA_OPEN_PATH
    ) {
      fail("Default manual-start fixture already exists with different contents; choose a fresh workspace root.");
    }
  } else {
    await assertSafeWorkspaceTarget(openPath);
    await writeFile(openPath, starterContents, { encoding: "utf8", flag: "wx", mode: 0o600 });
    await assertSafeWorkspaceTarget(openPath, { expectedType: "file", mustExist: true });
  }
}

savePath = path.resolve(savePath);
if (!pathIsInsideRoot(workspaceRoot, openPath) || !pathIsInsideRoot(workspaceRoot, savePath)) {
  fail("Open and Save paths must remain inside GROOVEFORGE_DESKTOP_WORKSPACE_ROOT.");
}
if (!openPath.endsWith(".grooveforge.json") || !savePath.endsWith(".grooveforge.json")) {
  fail("Open and Save paths must end with .grooveforge.json.");
}
if (openPath === savePath) {
  fail("Open and Save paths must differ so the initial fixture cannot be overwritten.");
}
if (autoMovementQa && (await lstatOrNull(savePath))) {
  fail("Movement QA Save target already exists; choose a fresh movement workspace.");
}
try {
  await assertSafeWorkspaceTarget(openPath);
  await assertSafeWorkspaceTarget(savePath);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

let provenance;
try {
  provenance = await buildManualQaProvenance();
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
const electronUserDataRealPath = await realpath(electronUserDataDirectory);
const launcherUserDataIsolated =
  pathIsInsideRoot(workspaceOwnership.workspaceRealPath, electronUserDataRealPath) &&
  electronUserDataRealPath === path.join(workspaceOwnership.workspaceRealPath, "ElectronUserData");
if (!launcherUserDataIsolated) {
  fail("Manual QA ElectronUserData real path escaped its owned workspace.");
}

const launcherManifest = {
  app: "GrooveForge",
  autoExit: autoQa,
  generatedAt: new Date().toISOString(),
  mode: autoMovementQa
    ? "visible-native-auto-movement-qa"
    : autoSongQa
      ? "visible-native-auto-song-qa"
      : "visible-stable-manual-qa",
  ...(externalSourceEvidence
    ? {
        externalSource: {
          bytes: externalSourceEvidence.externalSourceBytes,
          path: externalSourceEvidence.externalSourcePath,
          sha256: externalSourceEvidence.externalSourceSha256
        }
      }
    : {}),
  ...(movementSpec && movementSpecContents
    ? {
        movementSpec: {
          arrangementBars: movementSpec.arrangement.reduce((total, block) => total + block.bars, 0),
          arrangementBlocks: movementSpec.arrangement.length,
          bytes: movementSpecContents.byteLength,
          masterAutomation: movementSpec.masterAutomation,
          path: movementSpecPath,
          sha256: sha256(movementSpecContents),
          sourceProjectPath: movementSpec.sourceProjectPath,
          targetTitle: movementSpec.title
        }
      }
    : {}),
  openFixture: {
    bytes: Buffer.byteLength(openContents, "utf8"),
    path: openPath,
    ...(movementSpec
      ? { preservedCoreSha256: sha256(canonicalJson(movementPreservedCore(openProject))) }
      : {}),
    sha256: sha256(openContents),
    title: openProject.title
  },
  outputs: {
    dataDirectory,
    evidenceDirectory,
    electronUserDataDirectory,
    exportsDirectory,
    projectsDirectory,
    savePath
  },
  provenance,
  safety: {
    isolatedWorkspace: true,
    networkAttempted: false,
    nonpersistentElectronPartition: true,
    sourceAndTargetDiffer: openPath !== savePath,
    userDataIsolated: launcherUserDataIsolated,
    userDataPath: electronUserDataDirectory,
    workspaceOwnershipSentinel: path.basename(workspaceOwnership.sentinelPath),
    workspaceOwnershipSha256: sha256(workspaceOwnership.ownershipToken)
  },
  version: packageJson.version,
  workspaceRoot
};
const manifestPath = path.join(evidenceDirectory, "manual-qa-launcher.json");
const manifestContents = `${JSON.stringify(launcherManifest, null, 2)}\n`;
await assertSafeWorkspaceTarget(manifestPath);
await writeFile(manifestPath, manifestContents, { encoding: "utf8", mode: 0o600 });
await assertSafeWorkspaceTarget(manifestPath, { expectedType: "file", mustExist: true });
const manifestSha256 = sha256(manifestContents);

console.log("GrooveForge visible manual QA workspace is ready.");
console.log(`- Workspace: ${workspaceRoot}`);
console.log(`- Initial fixture: ${openPath}`);
console.log(`- Save target: ${savePath}`);
console.log(`- Binary exports: ${exportsDirectory}`);
console.log(`- Launcher manifest: ${manifestPath}`);
console.log(
  autoMovementQa
    ? "- The movement source will be opened, edited, saved, exported, and reopened through visible native UI interactions."
    : "- The initial fixture is intentionally Untitled Beat; create the test song through the visible UI."
);

if (prepareOnly) {
  process.exit(0);
}

const freshnessFailures = manualQaBuildFreshnessFailures(
  provenance,
  await readFile(path.join(root, provenanceElectronMainPath), "utf8")
);
if (freshnessFailures.length > 0) {
  fail("Manual QA build provenance is stale or incomplete; run npm run build.", freshnessFailures.join("\n"));
}
const electronBinary = resolveElectronBinary();
if (!electronBinary) {
  fail("Electron binary is missing; run npm install first.");
}
const blockDetails = macGuiLaunchBlockDetails("npm run desktop:manual-qa");
if (blockDetails) {
  fail("Refusing to start Electron in a restricted macOS GUI context.", blockDetails);
}

const env = {
  ...process.env,
  GROOVEFORGE_DESKTOP_MANUAL_QA: "1",
  ...(autoQa
    ? {
        GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_EXIT: "1"
      }
    : {}),
  ...(autoSongQa
    ? {
        GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_SONG: "1"
      }
    : {}),
  ...(autoMovementQa
    ? {
        GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_MOVEMENT: "1",
        GROOVEFORGE_DESKTOP_MANUAL_QA_MOVEMENT_SPEC_PATH: movementSpecPath
      }
    : {}),
  GROOVEFORGE_DESKTOP_MANUAL_QA_OPEN_PATH: openPath,
  GROOVEFORGE_DESKTOP_MANUAL_QA_SAVE_PATH: savePath,
  GROOVEFORGE_DESKTOP_MANUAL_QA_MANIFEST_PATH: manifestPath,
  GROOVEFORGE_DESKTOP_MANUAL_QA_MANIFEST_SHA256: manifestSha256,
  GROOVEFORGE_DESKTOP_MANUAL_QA_OWNERSHIP_TOKEN: workspaceOwnership.ownershipToken,
  GROOVEFORGE_DESKTOP_WORKSPACE_ROOT: workspaceRoot,
  NO_COLOR: "1"
};
delete env.ELECTRON_RUN_AS_NODE;
if (!autoQa) {
  delete env.GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_EXIT;
}
if (!autoSongQa) {
  delete env.GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_SONG;
}
if (!autoMovementQa) {
  delete env.GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_MOVEMENT;
  delete env.GROOVEFORGE_DESKTOP_MANUAL_QA_MOVEMENT_SPEC_PATH;
}
delete env.VITE_DEV_SERVER_URL;

const electronArgs = autoMovementQa ? [".", "--auto-movement-qa"] : autoSongQa ? [".", "--auto-song-qa"] : ["."];
const child = spawn(electronBinary, electronArgs, { cwd: root, env, stdio: "inherit" });
const autoQaParentTimeout = autoQa
  ? setTimeout(() => {
      console.error("GrooveForge desktop manual QA failed: automated child exceeded the 24-minute parent watchdog.");
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 2000).unref();
    }, 1_440_000)
  : null;
autoQaParentTimeout?.unref();
child.on("error", (error) => fail(`Could not start Electron: ${error.message}`));
child.on("exit", async (code, signal) => {
  if (autoQaParentTimeout) {
    clearTimeout(autoQaParentTimeout);
  }
  let postflightFailure = "";
  if (autoMovementQa) {
    if (!externalSourceEvidence) {
      postflightFailure = "Movement external source launch evidence was unavailable.";
    } else {
      const postflight = await collectExternalSourcePostflight(externalSourceEvidence);
      try {
        await persistMovementExternalSourcePostflight(
          path.join(evidenceDirectory, "auto-movement-qa-report.json"),
          externalSourceEvidence,
          postflight
        );
      } catch (error) {
        postflightFailure = `Could not persist Movement external source postflight: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
      if (!postflight.sourceUnchanged && !postflightFailure) {
        postflightFailure = postflight.externalSourcePostflightError
          ? `Movement external source postflight failed: ${postflight.externalSourcePostflightError}`
          : "Movement external source size or SHA-256 changed after launch.";
      }
    }
  }
  const childFailed = code !== 0 || signal !== null;
  if (childFailed || postflightFailure) {
    const details = [];
    if (childFailed) {
      details.push(macGuiLaunchAbortDetails("npm run desktop:manual-qa", { code, signal, output: "" }));
    }
    if (postflightFailure) {
      details.push(postflightFailure);
    }
    fail(
      childFailed
        ? `Electron manual QA exited with code ${code ?? "none"}${signal ? ` / signal ${signal}` : ""}.`
        : "Movement external source postflight failed.",
      details.filter(Boolean).join("\n")
    );
  }
  process.exit(0);
});
