import { app, autoUpdater, BrowserWindow, dialog, ipcMain, Menu, shell } from "electron";
import type { MenuItemConstructorOptions, OpenDialogOptions, SaveDialogOptions } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveUpdateFeedConfig } from "./updateFeedConfig.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
const menuCommandChannel = "grooveforge:menu-command";
const isLaunchSmoke = process.env.GROOVEFORGE_DESKTOP_LAUNCH_SMOKE === "1";
const isProjectIoSmoke = process.env.GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE === "1";
const launchSmokeResultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
const projectIoSmokeResultPrefix = "GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE_RESULT ";
const launchSmokeTimeoutMs = 180000;
const projectIoSmokeTimeoutMs = launchSmokeTimeoutMs;

type NativeMenuCommand =
  | "open-project"
  | "save-project"
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
  hasOpenProject: boolean;
  hasPreloadBridge: boolean;
  hasRoot: boolean;
  hasSaveProject: boolean;
  location: string;
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

type LaunchSmokePaletteEvidence = {
  dualBeginner: LaunchSmokePaletteRouteEvidence;
  dualProducer: LaunchSmokePaletteRouteEvidence;
  dualReadout: LaunchSmokePaletteRouteEvidence;
  guided: LaunchSmokePaletteRouteEvidence;
  opened: boolean;
  producer: LaunchSmokePaletteRouteEvidence;
  resultPresent: boolean;
  searchPresent: boolean;
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
  hasSaveProject: boolean;
  location: string;
  openResult: {
    canceled: boolean;
    contentsLength?: number;
    contentsMatched?: boolean;
    filePath?: string;
  };
  readyState: string;
  samplingTextPresent: boolean;
  saveResult: {
    canceled: boolean;
    filePath?: string;
  };
  sourceLength: number;
  targetPath: string;
  title: string;
};

const projectFilters = [{ name: "GrooveForge Project", extensions: ["json"] }];
let updateHandlersRegistered = false;
let updateCheckInProgress = false;

function isSaveProjectPayload(value: unknown): value is SaveProjectPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "contents" in value &&
    "defaultName" in value &&
    typeof value.contents === "string" &&
    typeof value.defaultName === "string"
  );
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
    label,
    accelerator,
    // Renderer keydown handling owns focused-input guards; Electron only displays the shortcut here.
    registerAccelerator: false,
    click: () => sendMenuCommand(command)
  };
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
  ipcMain.handle("grooveforge:save-project", async (event, payload: unknown) => {
    if (!isSaveProjectPayload(payload)) {
      throw new Error("Invalid save project payload.");
    }

    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    const options: SaveDialogOptions = {
      title: "Save GrooveForge Project",
      defaultPath: payload.defaultName,
      filters: projectFilters
    };
    const smokeFilePath = projectIoSmokePath();
    const result = smokeFilePath
      ? { canceled: false, filePath: smokeFilePath }
      : browserWindow
        ? await dialog.showSaveDialog(browserWindow, options)
        : await dialog.showSaveDialog(options);
    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    await writeFile(result.filePath, payload.contents, "utf8");
    return { canceled: false, filePath: result.filePath };
  });

  ipcMain.handle("grooveforge:open-project", async (event) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    const options: OpenDialogOptions = {
      title: "Open GrooveForge Project",
      filters: projectFilters,
      properties: ["openFile"]
    };
    const smokeFilePath = projectIoSmokePath();
    const result = smokeFilePath
      ? { canceled: false, filePaths: [smokeFilePath] }
      : browserWindow
        ? await dialog.showOpenDialog(browserWindow, options)
        : await dialog.showOpenDialog(options);
    const filePath = result.filePaths[0];
    if (result.canceled || !filePath) {
      return { canceled: true };
    }

    const contents = await readFile(filePath, "utf8");
    return { canceled: false, filePath, contents };
  });
}

function projectIoSmokePath(): string | null {
  const filePath = process.env.GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE_PATH;
  return isProjectIoSmoke && filePath ? filePath : null;
}

function launchSmokeFailure(message: string, details: Record<string, unknown> = {}): void {
  console.error(`${launchSmokeResultPrefix}${JSON.stringify({ ok: false, message, ...details })}`);
  app.exit(1);
}

function projectIoSmokeFailure(message: string, details: Record<string, unknown> = {}): void {
  console.error(`${projectIoSmokeResultPrefix}${JSON.stringify({ ok: false, message, ...details })}`);
  app.exit(1);
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

  return failures;
}

function launchSmokePaletteFailures(evidence: LaunchSmokePaletteEvidence): string[] {
  const failures: string[] = [];
  if (!evidence.opened || !evidence.searchPresent || !evidence.resultPresent) {
    failures.push("live Quick Actions palette should open, accept Audience Session and Dual Audience Readiness searches, and leave an execution result");
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

async function collectLaunchSmokeEvidence(win: BrowserWindow): Promise<LaunchSmokeEvidence> {
  const evidence = await win.webContents.executeJavaScript(`
    (() => {
      const expectedTestIds = [
        "workflow-target-transport",
        "workflow-target-compose",
        "workflow-target-sound",
        "workflow-target-arrange",
        "workflow-target-mix",
        "workflow-target-master",
        "guide-quick-start",
        "guide-quick-start-headline",
        "audience-session-readout",
        "audience-session-action-beginner",
        "audience-session-action-producer",
        "dual-audience-readiness",
        "dual-audience-readiness-beginner",
        "dual-audience-readiness-producer",
        "mode-guided",
        "mode-studio",
        "quick-actions-open",
        "command-reference-open",
        "style-select",
        "pattern-tab-A",
        "export-stems",
        "export-midi",
        "export-handoff-sheet",
        "pattern-chain-current",
        "master-ceiling"
      ];
      const expectedText = [
        "GrooveForge",
        "desktop workstation",
        "Guide Quick Start",
        "Audience session",
        "Dual Audience Readiness",
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
        "Guided Focus",
        "Guided Session Pass",
        "Studio",
        "Review Queue",
        "Production Snapshot",
        "Mix Coach",
        "Sound Snapshot",
        "Mix Snapshot",
        "Pattern A",
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
      const testIds = Object.fromEntries(
        expectedTestIds.map((testId) => [testId, document.querySelector(\`[data-testid="\${testId}"]\`) !== null])
      );
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
      const bridge = window.grooveforge;
      return {
        appKind: bridge?.appKind ?? null,
        bodyTextLength: bodyText.length,
        hasOpenProject: typeof bridge?.openProject === "function",
        hasPreloadBridge: Boolean(bridge),
        hasRoot: Boolean(document.querySelector("#root")),
        hasSaveProject: typeof bridge?.saveProject === "function",
        location: window.location.href,
        missingText: expectedText.filter((text) => !bodyText.includes(text)),
        palette: {
          dualBeginner: emptyRoute,
          dualProducer: emptyRoute,
          dualReadout: emptyRoute,
          guided: emptyRoute,
          opened: false,
          producer: emptyRoute,
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

function collectLaunchSmokeEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokeEvidence> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out collecting launch smoke DOM evidence.")), 30000);
    void collectLaunchSmokeEvidence(win)
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

async function collectLaunchSmokePaletteEvidence(win: BrowserWindow): Promise<LaunchSmokePaletteEvidence> {
  const result = await win.webContents.executeJavaScript(`
    (() => {
      const collector = window.__grooveforgeLaunchSmoke?.collectAudienceSessionQuickActionEvidence;
      if (window.grooveforge?.launchSmoke !== true || typeof collector !== "function") {
        return { ready: false, evidence: null };
      }
      return { ready: true, evidence: collector() };
    })();
  `);
  if (!result || result.ready !== true || !result.evidence) {
    throw new Error("Launch smoke Quick Actions hook was not ready.");
  }
  return result.evidence as LaunchSmokePaletteEvidence;
}

function collectLaunchSmokePaletteEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokePaletteEvidence> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out collecting live Quick Actions palette evidence.")), 30000);
    void collectLaunchSmokePaletteEvidence(win)
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

async function collectProjectIoSmokeEvidence(win: BrowserWindow): Promise<ProjectIoSmokeEvidence> {
  const sourcePath = process.env.GROOVEFORGE_DESKTOP_PROJECT_IO_SOURCE_PATH;
  const targetPath = projectIoSmokePath();
  if (!sourcePath || !targetPath) {
    throw new Error("Project IO smoke requires source and target path environment variables.");
  }

  const sourceContents = await readFile(sourcePath, "utf8");
  const defaultName = path.basename(targetPath);
  const evidence = await win.webContents.executeJavaScript(`
    (async () => {
      const sourceContents = ${JSON.stringify(sourceContents)};
      const defaultName = ${JSON.stringify(defaultName)};
      const targetPath = ${JSON.stringify(targetPath)};
      const bridge = window.grooveforge;
      const bodyText = document.body?.textContent ?? "";
      const saveResult = await bridge?.saveProject?.(sourceContents, defaultName);
      const openResult = await bridge?.openProject?.();
      return {
        appKind: bridge?.appKind ?? null,
        defaultName,
        hasOpenProject: typeof bridge?.openProject === "function",
        hasPreloadBridge: Boolean(bridge),
        hasSaveProject: typeof bridge?.saveProject === "function",
        location: window.location.href,
        openResult: {
          canceled: openResult?.canceled === true,
          contentsLength: typeof openResult?.contents === "string" ? openResult.contents.length : undefined,
          contentsMatched: openResult?.contents === sourceContents,
          filePath: openResult?.filePath
        },
        readyState: document.readyState,
        samplingTextPresent: /AudioClipEvent|sample import|sample browser|chop pads|sampler track|audio clip/i.test(bodyText),
        saveResult: {
          canceled: saveResult?.canceled === true,
          filePath: saveResult?.filePath
        },
        sourceLength: sourceContents.length,
        targetPath,
        title: document.title
      };
    })();
  `);
  return evidence as ProjectIoSmokeEvidence;
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
  if (!evidence.hasPreloadBridge || !evidence.hasSaveProject || !evidence.hasOpenProject) {
    failures.push("preload bridge should expose appKind, saveProject, and openProject");
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
  if (evidence.samplingTextPresent) {
    failures.push("renderer should not expose sampling-first language in project IO smoke");
  }
  return failures;
}

function installLaunchSmoke(win: BrowserWindow): void {
  let finished = false;
  let lastProgress: Record<string, unknown> = { phase: "waiting-ready-to-show" };
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
    lastProgress = { phase: "collecting-dom" };
    void collectLaunchSmokeEvidenceWithTimeout(win)
      .then((evidence) => {
        if (finished) {
          return;
        }

        const failures = launchSmokeFailures(evidence);
        lastProgress = { phase: "dom-collected", evidence, failures };
        if (failures.length === 0) {
          lastProgress = { phase: "collecting-palette", evidence };
          return collectLaunchSmokePaletteEvidenceWithTimeout(win)
            .then((paletteEvidence) => {
              if (finished) {
                return;
              }

              const paletteFailures = launchSmokePaletteFailures(paletteEvidence);
              const evidenceWithPalette = { ...evidence, palette: paletteEvidence };
              lastProgress = { phase: "palette-collected", evidence: evidenceWithPalette, failures: paletteFailures };
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

              lastProgress = { phase: "collecting-visual", evidence: evidenceWithPalette };
              return collectLaunchSmokeVisualEvidenceWithTimeout(win)
                .then((visualEvidence) => {
                  if (finished) {
                    return;
                  }

                  const visualFailures = launchSmokeVisualFailures(visualEvidence);
                  lastProgress = {
                    phase: "visual-collected",
                    evidence: evidenceWithPalette,
                    visualEvidence,
                    failures: visualFailures
                  };
                  if (visualFailures.length > 0) {
                    if (Date.now() >= deadline) {
                      fail("Production desktop visual launch smoke failed.", {
                        evidence: evidenceWithPalette,
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
                  console.log(`${launchSmokeResultPrefix}${JSON.stringify({ ok: true, evidence: { ...evidenceWithPalette, visual: visualEvidence } })}`);
                  app.exit(0);
                })
                .catch((error: unknown) => {
                  fail("Production desktop screenshot capture failed.", {
                    error: error instanceof Error ? error.message : String(error)
                  });
                });
            })
            .catch((error: unknown) => {
              fail("Production desktop live Quick Actions palette JavaScript failed.", {
                error: error instanceof Error ? error.message : String(error)
              });
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
    lastProgress = { phase: "ready-to-show" };
    poll(Date.now() + launchSmokeTimeoutMs - 35000);
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
        app.exit(0);
      })
      .catch((error: unknown) => {
        fail("Production project IO smoke JavaScript failed.", {
          error: error instanceof Error ? error.message : String(error)
        });
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
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      backgroundThrottling: !(isLaunchSmoke || isProjectIoSmoke)
    }
  });

  if (isLaunchSmoke) {
    installLaunchSmoke(win);
  } else if (isProjectIoSmoke) {
    installProjectIoSmoke(win);
  } else {
    win.once("ready-to-show", () => {
      win.show();
    });
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL as string);
  } else {
    void win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  registerProjectFileHandlers();
  Menu.setApplicationMenu(createNativeCommandMenu());
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
