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
const launchSmokeTimeoutMs = 240000;
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
  commandReference: LaunchSmokeCommandReferenceEvidence;
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

type LaunchSmokeLayoutEvidence = {
  arrangementEssentialBeforeBlockMoves: boolean;
  arrangementPlaybackBeforeTimeline: boolean;
  arrangementPlaybackPresent: boolean;
  arrangementTimelineBeforeEditor: boolean;
  arrangementTimelinePresent: boolean;
  arrangementToolsOpen: boolean;
  arrangementToolsToggleVisible: boolean;
  blockMovesBeforeArrangementTools: boolean;
  blockMovesOpen: boolean;
  blockMovesToggleVisible: boolean;
  chordEventsBeforeHarmonyMoves: boolean;
  chordsBeforeSoundDesign: boolean;
  captureIdeasOpen: boolean;
  captureIdeasToggleVisible: boolean;
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
  harmonyMovesOpen: boolean;
  harmonyMovesToggleVisible: boolean;
  instrumentDirectChordsPresent: boolean;
  mixerBasicBalanceBeforeProcessing: boolean;
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
  masterReviewOpen: boolean;
  masterReviewToggleVisible: boolean;
  masterRoleBeforeControls: boolean;
  patternLabOpen: boolean;
  patternLabToggleVisible: boolean;
  noteLanesAfterCaptureIdeas: boolean;
  noteLanesPresent: boolean;
  soundDesignOpen: boolean;
  soundDesignToggleVisible: boolean;
  selectedBlockEditorPresent: boolean;
  stepGridAfterPatternLab: boolean;
  stepGridPresent: boolean;
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
  deliveryTools: LaunchSmokeDeliveryToolsEvidence;
  opened: boolean;
  producer: LaunchSmokePaletteRouteEvidence;
  routeBridge: LaunchSmokePaletteRouteEvidence;
  routeBridgeCompletion: LaunchSmokePaletteRouteEvidence;
  routeBridgeReadiness: LaunchSmokePaletteRouteEvidence;
  sessionProofBeginner: LaunchSmokePaletteRouteEvidence;
  sessionProofProducer: LaunchSmokePaletteRouteEvidence;
  sessionProofReadout: LaunchSmokePaletteRouteEvidence;
  starterBeginner: LaunchSmokeAudienceStarterEvidence;
  starterProducer: LaunchSmokeAudienceStarterEvidence;
  resultPresent: boolean;
  searchPresent: boolean;
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
  guidedMasterPolishOpen: boolean;
  guidedMasterReviewOpen: boolean;
  resetMasterPolishOpen: boolean;
  resetMasterReviewOpen: boolean;
  studioMasterPolishOpen: boolean;
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
  if (
    !evidence.layout.captureIdeasToggleVisible ||
    !evidence.layout.noteLanesPresent ||
    !evidence.layout.noteLanesAfterCaptureIdeas
  ) {
    failures.push("note editor should expose a visible Capture & Ideas toggle followed by direct 808 and Synth grids");
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
        "style-select",
        "pattern-tab-A",
        "pattern-lab",
        "workspace-feedback-anchor",
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
      const testIds = Object.fromEntries(
        expectedTestIds.map((testId) => [testId, document.querySelector(\`[data-testid="\${testId}"]\`) !== null])
      );
      const guidanceCenter = document.querySelector('[data-testid="guidance-center"]');
      const feedbackAnchor = document.querySelector('[data-testid="workspace-feedback-anchor"]');
      const patternLab = document.querySelector('[data-testid="pattern-lab"]');
      const patternLabToggle = document.querySelector('[data-testid="pattern-lab-toggle"]');
      const stepGrid = document.querySelector('.step-grid');
      const captureIdeas = document.querySelector('[data-testid="capture-ideas"]');
      const captureIdeasToggle = document.querySelector('[data-testid="capture-ideas-toggle"]');
      const noteLanes = document.querySelector('.note-lanes');
      const instrumentDirectChords = document.querySelector('[data-testid="instrument-direct-chords"]');
      const chordEventGrid = document.querySelector('[data-testid="chord-event-grid"]');
      const harmonyMoves = document.querySelector('[data-testid="harmony-moves"]');
      const harmonyMovesToggle = document.querySelector('[data-testid="harmony-moves-toggle"]');
      const soundDesign = document.querySelector('[data-testid="sound-design-tools"]');
      const soundDesignToggle = document.querySelector('[data-testid="sound-design-toggle"]');
      const arrangementPlayback = document.querySelector('[data-testid="arrangement-playback-readout"]');
      const arrangementTimeline = document.querySelector('[data-testid="arrangement-timeline"]');
      const selectedBlockEditor = document.querySelector('[data-testid="selected-block-editor"]');
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
      const deliveryRoute = document.querySelector('[data-testid="handoff-pack-route-readout"]');
      const deliveryDirect = document.querySelector('[data-testid="handoff-pack-direct"]');
      const deliveryStatus = document.querySelector('[data-testid="handoff-status-tools"]');
      const deliveryStatusToggle = document.querySelector('[data-testid="handoff-status-toggle"]');
      const deliveryAudit = document.querySelector('[data-testid="handoff-audit-tools"]');
      const deliveryAuditToggle = document.querySelector('[data-testid="handoff-audit-toggle"]');
      const follows = (before, after) =>
        Boolean(before && after && (before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING));
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
          arrangementTimelineBeforeEditor: follows(arrangementTimeline, selectedBlockEditor),
          arrangementTimelinePresent: Boolean(arrangementTimeline),
          arrangementToolsOpen: Boolean(arrangementTools?.open),
          arrangementToolsToggleVisible: Boolean(arrangementToolsToggle && arrangementToolsToggle.getBoundingClientRect().height > 0),
          blockMovesBeforeArrangementTools: follows(blockMoves, arrangementTools),
          blockMovesOpen: Boolean(blockMoves?.open),
          blockMovesToggleVisible: Boolean(blockMovesToggle && blockMovesToggle.getBoundingClientRect().height > 0),
          chordEventsBeforeHarmonyMoves: follows(chordEventGrid, harmonyMoves),
          chordsBeforeSoundDesign: follows(instrumentDirectChords, soundDesign),
          captureIdeasOpen: Boolean(captureIdeas?.open),
          captureIdeasToggleVisible: Boolean(captureIdeasToggle && captureIdeasToggle.getBoundingClientRect().height > 0),
          deliveryAuditOpen: Boolean(deliveryAudit?.open),
          deliveryAuditToggleVisible: Boolean(deliveryAuditToggle && deliveryAuditToggle.getBoundingClientRect().height > 0),
          deliveryDirectBeforeStatus: follows(deliveryDirect, deliveryStatus),
          deliveryDirectVisible: Boolean(
            deliveryDirect &&
            deliveryDirect.getBoundingClientRect().height > 0 &&
            deliveryDirect.closest('details:not([open])') === null
          ),
          deliveryDirectPresent: Boolean(deliveryDirect),
          deliveryOutsideGuidance: Boolean(deliveryDirect && guidanceCenter && !guidanceCenter.contains(deliveryDirect)),
          deliveryStatusBeforeAudit: follows(deliveryStatus, deliveryAudit),
          deliveryStatusOpen: Boolean(deliveryStatus?.open),
          deliveryStatusToggleVisible: Boolean(deliveryStatusToggle && deliveryStatusToggle.getBoundingClientRect().height > 0),
          deliveryRouteBeforeDirect: follows(deliveryRoute, deliveryDirect),
          feedbackAfterGuidance: follows(guidanceCenter, feedbackAnchor),
          feedbackOutsideGuidance: Boolean(guidanceCenter && feedbackAnchor && !guidanceCenter.contains(feedbackAnchor)),
          guidanceCenterOpen: Boolean(guidanceCenter?.open),
          harmonyMovesOpen: Boolean(harmonyMoves?.open),
          harmonyMovesToggleVisible: Boolean(harmonyMovesToggle && harmonyMovesToggle.getBoundingClientRect().height > 0),
          instrumentDirectChordsPresent: Boolean(instrumentDirectChords),
          mixerBasicBalanceBeforeProcessing: follows(mixerVolume, mixerProcessing),
          mixerProcessingOpen: Boolean(mixerProcessing?.open),
          mixerProcessingToggleVisible: Boolean(mixerProcessingToggle && mixerProcessingToggle.getBoundingClientRect().height > 0),
          mixerStripsBeforeMixMoves: follows(mixerStrips, mixMoves),
          mixerStripsPresent: Boolean(mixerStrips),
          mixMovesBeforeReview: follows(mixMoves, mixReview),
          mixMovesOpen: Boolean(mixMoves?.open),
          mixMovesToggleVisible: Boolean(mixMovesToggle && mixMovesToggle.getBoundingClientRect().height > 0),
          mixReviewOpen: Boolean(mixReview?.open),
          mixReviewToggleVisible: Boolean(mixReviewToggle && mixReviewToggle.getBoundingClientRect().height > 0),
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
          masterPolishToggleVisible: Boolean(masterPolishToggle && masterPolishToggle.getBoundingClientRect().height > 0),
          masterReviewOpen: Boolean(masterReview?.open),
          masterReviewToggleVisible: Boolean(masterReviewToggle && masterReviewToggle.getBoundingClientRect().height > 0),
          masterRoleBeforeControls: follows(masterRole, masterOutputControls),
          patternLabOpen: Boolean(patternLab?.open),
          patternLabToggleVisible: Boolean(patternLabToggle && patternLabToggle.getBoundingClientRect().height > 0),
          noteLanesAfterCaptureIdeas: follows(captureIdeas, noteLanes),
          noteLanesPresent: Boolean(noteLanes),
          soundDesignOpen: Boolean(soundDesign?.open),
          soundDesignToggleVisible: Boolean(soundDesignToggle && soundDesignToggle.getBoundingClientRect().height > 0),
          selectedBlockEditorPresent: Boolean(selectedBlockEditor),
          stepGridAfterPatternLab: follows(patternLab, stepGrid),
          stepGridPresent: Boolean(stepGrid)
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
            guidedMasterPolishOpen: true,
            guidedMasterReviewOpen: true,
            resetMasterPolishOpen: true,
            resetMasterReviewOpen: true,
            studioMasterPolishOpen: false,
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
    (async () => {
      const collector = window.__grooveforgeLaunchSmoke?.collectAudienceSessionQuickActionEvidence;
      if (window.grooveforge?.launchSmoke !== true || typeof collector !== "function") {
        return { ready: false, evidence: null };
      }
      const evidence = await collector();
      return { ready: true, evidence };
    })();
  `);
  if (!result || result.ready !== true || !result.evidence) {
    throw new Error("Launch smoke Quick Actions hook was not ready.");
  }
  return result.evidence as LaunchSmokePaletteEvidence;
}

function collectLaunchSmokePaletteEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokePaletteEvidence> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      void win.webContents
        .executeJavaScript(`window.__grooveforgeLaunchSmokePaletteStep ?? "unknown"`)
        .then((step: unknown) => reject(new Error(`Timed out collecting live Quick Actions palette evidence at ${String(step)}.`)))
        .catch(() => reject(new Error("Timed out collecting live Quick Actions palette evidence.")));
    }, 150000);
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

async function clickLaunchSmokeBridgeDirectTarget(
  win: BrowserWindow,
  testId: string,
  setStep: (step: string) => void
): Promise<LaunchSmokeBridgeDirectEvidence> {
  setStep(`${testId}:clicking-dom-button`);
  const result = await win.webContents.executeJavaScript(`
    (async () => {
      const text = (textTestId) => document.querySelector('[data-testid="' + textTestId + '"]')?.textContent?.trim() ?? "";
      const readResult = (buttonPresent) => ({
        buttonPresent,
        resultDestination: text("audience-route-bridge-result-destination"),
        resultFollowup: text("audience-route-bridge-result-followup"),
        resultMetric: text("audience-route-bridge-result-metric"),
        resultPresent: document.querySelector('[data-testid="audience-route-bridge-result"]') !== null,
        resultTitle: text("audience-route-bridge-result-title")
      });
      const button = document.querySelector('[data-testid="${testId}"]');
      if (!button) {
        return readResult(false);
      }
      button.scrollIntoView({ block: "center", inline: "center" });
      if (button.disabled === true) {
        return readResult(true);
      }
      button.click();
      await Promise.resolve();
      await Promise.resolve();
      return readResult(true);
    })();
  `);
  return result as LaunchSmokeBridgeDirectEvidence;
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

async function collectLaunchSmokeBridgeDirectEvidence(
  win: BrowserWindow,
  setStep: (step: string) => void = () => undefined
): Promise<LaunchSmokeBridgeDirectEvidenceBundle> {
  setStep("collecting-react-direct-hook");
  const hookEvidence = await collectLaunchSmokeBridgeDirectHookEvidence(win);
  if (hookEvidence) {
    return hookEvidence;
  }

  const readiness = await clickLaunchSmokeBridgeDirectTarget(win, "audience-route-bridge-readiness-action", setStep);
  const completion = await clickLaunchSmokeBridgeDirectTarget(win, "audience-route-bridge-completion-action", setStep);

  const result = {
    completion,
    readiness
  };
  return result as LaunchSmokeBridgeDirectEvidenceBundle;
}

function collectLaunchSmokeBridgeDirectEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokeBridgeDirectEvidenceBundle> {
  return new Promise((resolve, reject) => {
    let step = "starting";
    const timeout = setTimeout(
      () => reject(new Error(`Timed out collecting live Audience Route Bridge direct button evidence at ${step}.`)),
      10000
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
          if (Date.now() - started > 15000) {
            resolve({ ready: false, evidence });
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      });
    `,
    20000
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
          if (Date.now() - started > 20000) {
            resolve({ ready: false, evidence });
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      });
    `,
    25000
  );
  if (!searchReady.ready) {
    throw new Error("Launch smoke Command Reference Audience Starter result was not ready.");
  }

  await runCommandReferenceStep<boolean>(
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
          if (Date.now() - started > 10000) {
            resolve({ ready: false, evidence });
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      });
    `,
    15000
  );

  return {
    ...searchReady.evidence,
    quickActionsOpenedAfterHandoff: handoffReady.evidence.quickActionsOpenedAfterHandoff
  } as LaunchSmokeCommandReferenceEvidence;
}

function collectLaunchSmokeCommandReferenceEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokeCommandReferenceEvidence> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timed out collecting live Command Reference evidence.")), 120000);
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
          lastProgress = { phase: "collecting-bridge-direct", evidence };
          return collectLaunchSmokeBridgeDirectEvidenceWithTimeout(win)
            .then((bridgeDirectEvidence) => {
              if (finished) {
                return;
              }

              const bridgeDirectFailures = launchSmokeBridgeDirectFailures(bridgeDirectEvidence);
              const evidenceWithBridgeDirect = { ...evidence, bridgeDirect: bridgeDirectEvidence };
              lastProgress = { phase: "bridge-direct-collected", evidence: evidenceWithBridgeDirect, failures: bridgeDirectFailures };
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

              lastProgress = { phase: "collecting-palette", evidence: evidenceWithBridgeDirect };
              return collectLaunchSmokePaletteEvidenceWithTimeout(win)
                .then((paletteEvidence) => {
                  if (finished) {
                    return;
                  }

                  const paletteFailures = launchSmokePaletteFailures(paletteEvidence);
                  const evidenceWithPalette = { ...evidenceWithBridgeDirect, palette: paletteEvidence };
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

                  lastProgress = { phase: "collecting-command-reference", evidence: evidenceWithPalette };
                  return collectLaunchSmokeCommandReferenceEvidenceWithTimeout(win)
                    .then((commandReferenceEvidence) => {
                      if (finished) {
                        return;
                      }

                      const commandReferenceFailures = launchSmokeCommandReferenceFailures(commandReferenceEvidence);
                      const evidenceWithCommandReference = { ...evidenceWithPalette, commandReference: commandReferenceEvidence };
                      lastProgress = {
                        phase: "command-reference-collected",
                        evidence: evidenceWithCommandReference,
                        failures: commandReferenceFailures
                      };
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

                      lastProgress = { phase: "collecting-visual", evidence: evidenceWithCommandReference };
                      return collectLaunchSmokeVisualEvidenceWithTimeout(win)
                        .then((visualEvidence) => {
                          if (finished) {
                            return;
                          }

                          const visualFailures = launchSmokeVisualFailures(visualEvidence);
                          lastProgress = {
                            phase: "visual-collected",
                            evidence: evidenceWithCommandReference,
                            visualEvidence,
                            failures: visualFailures
                          };
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
                          app.exit(0);
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

              lastProgress = {
                phase: "bridge-direct-retrying",
                evidence,
                error: error instanceof Error ? error.message : String(error)
              };
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
