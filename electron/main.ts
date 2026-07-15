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
const launchSmokeDrumGridSnapshotChannel = "grooveforge:launch-smoke-drum-grid-snapshot";
const launchSmokeNoteGridSnapshotChannel = "grooveforge:launch-smoke-note-grid-snapshot";
const launchSmokeResultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
const projectIoSmokeResultPrefix = "GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE_RESULT ";
const launchSmokeTimeoutMs = 1800000;
const projectIoSmokeTimeoutMs = 640000;

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
  producer: LaunchSmokeStarterLandingRouteEvidence;
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
  dockPositionMirrorsHeader: boolean;
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
  hasSaveProject: boolean;
  location: string;
  launchpadCollapsedAfterUiOpen: boolean;
  openResult: {
    canceled: boolean;
    contentsLength?: number;
    contentsMatched?: boolean;
    filePath?: string;
  };
  readyState: string;
  projectOpenButtonPresent: boolean;
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
  if (!evidence.layout.quickActionGraphReady) {
    failures.push("Quick Actions graph should finish its on-demand load before launch evidence is accepted");
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
  if (!evidence.dockSharedPlayReady) {
    failures.push("workspace command dock native pointer input should reuse the full transport Play/Stop state");
  }
  if (!evidence.dockActionsOpened || !evidence.dockActionsFocusRestored) {
    failures.push("workspace command dock native pointer/Escape input should open Quick Actions and restore dock focus");
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
  await new Promise((resolve) => setTimeout(resolve, 180));
  try {
    const responsiveStudio = await win.webContents.executeJavaScript(`
      (async () => {
        const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        const header = document.querySelector('[data-testid="workflow-target-transport"]');
        const session = document.querySelector('[data-testid="transport-session-tools"]');
        const exports = document.querySelector('[data-testid="transport-export-tools"]');
        const sessionToggle = document.querySelector('[data-testid="transport-session-toggle"]');
        const exportToggle = document.querySelector('[data-testid="transport-export-toggle"]');
        const resizeCollapseReady = Boolean(session && exports && !session.open && !exports.open);

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
          resizeCollapseReady
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
      const workflowNavigatorJumpEvidence = (() => {
        const deliverButton = document.querySelector('[data-testid="workflow-jump-deliver"]');
        const deliverTarget = document.querySelector('[data-testid="handoff-pack"]');
        const composeButton = document.querySelector('[data-testid="workflow-jump-compose"]');
        const composeTarget = document.querySelector('[data-testid="workflow-target-compose"]');
        const workflowNavigator = document.querySelector('[data-testid="workflow-navigator"]');
        deliverButton?.click();
        const deliverRect = deliverTarget?.getBoundingClientRect() ?? null;
        composeButton?.click();
        const composeRect = composeTarget?.getBoundingClientRect() ?? null;
        const workflowNavigatorRect = workflowNavigator?.getBoundingClientRect() ?? null;
        return {
          composeReady: Boolean(
            composeRect &&
            workflowNavigatorRect &&
            composeRect.top >= workflowNavigatorRect.bottom + 8 &&
            composeRect.top < window.innerHeight &&
            composeRect.bottom > 0
          ),
          deliverReady: Boolean(deliverRect && deliverRect.top < window.innerHeight && deliverRect.bottom > 0)
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
          arrangementPatternControlsVisible: Boolean(
            arrangementPatternControls && arrangementPatternControls.getBoundingClientRect().height > 0
          ),
          arrangementShapeControlsVisible: Boolean(
            arrangementShapeControls && arrangementShapeControls.getBoundingClientRect().height > 0
          ),
          arrangementTrackStateControlsVisible: Boolean(
            arrangementTrackStateControls && arrangementTrackStateControls.getBoundingClientRect().height > 0
          ),
          arrangementTimelineBeforeEditor: follows(arrangementTimeline, selectedBlockEditor),
          arrangementTimelinePresent: Boolean(arrangementTimeline),
          arrangementToolsOpen: Boolean(arrangementTools?.open),
          arrangementToolsToggleVisible: Boolean(arrangementToolsToggle && arrangementToolsToggle.getBoundingClientRect().height > 0),
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
          blockMovesToggleVisible: Boolean(blockMovesToggle && blockMovesToggle.getBoundingClientRect().height > 0),
          chordCardCount: chordCards.length,
          chordCompactCardCount: compactChordCards.length,
          chordCompactEditorsHidden: chordEditors
            .filter((_editor, index) => chordCards[index]?.dataset.editorOpen === "false")
            .every((editor) => editor.getBoundingClientRect().height === 0),
          chordEventsBeforeHarmonyMoves: follows(chordEventGrid, harmonyMoves),
          chordExpandedCardCount: expandedChordCards.length,
          chordSelectedEditorVisible: chordEditors.some(
            (editor, index) => chordCards[index]?.dataset.editorOpen === "true" && editor.getBoundingClientRect().height > 0
          ),
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
          harmonyMovesToggleVisible: Boolean(harmonyMovesToggle && harmonyMovesToggle.getBoundingClientRect().height > 0),
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
          masterMixCoachPresent: Boolean(masterMixCoach),
          masterMixCoachOpen: Boolean(masterMixCoach?.open),
          masterReviewOpen: Boolean(masterReview?.open),
          masterReviewQueuePresent: Boolean(masterReviewQueue),
          masterReviewQueueOpen: Boolean(masterReviewQueue?.open),
          masterReviewToggleVisible: Boolean(masterReviewToggle && masterReviewToggle.getBoundingClientRect().height > 0),
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
          soundDesignToggleVisible: Boolean(soundDesignToggle && soundDesignToggle.getBoundingClientRect().height > 0),
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
  return result.evidence as LaunchSmokeStarterLandingEvidence;
}

function collectLaunchSmokeStarterLandingEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokeStarterLandingEvidence> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      void win.webContents
        .executeJavaScript(`window.__grooveforgeLaunchSmokeStarterLandingStep ?? "unknown"`)
        .then((step: unknown) => reject(new Error(`Timed out collecting Audience Starter landing evidence at ${String(step)}.`)))
        .catch(() => reject(new Error("Timed out collecting Audience Starter landing evidence.")));
    }, 150000);
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
    while (Date.now() < deadline && snapshot.targetOpen !== expectedOpen) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      snapshot = await readSnapshot(targetTestId);
    }
    if (snapshot.targetOpen !== expectedOpen) {
      throw new Error(`Native Enter did not set ${targetTestId} open=${expectedOpen}.`);
    }
    return snapshot;
  };

  onStep("reading initial closed disclosures");
  const initial = await readSnapshot("guidance-center");
  onStep("opening and closing Guide & Review Center");
  const guideOpen = await toggleWithNativeEnter("guidance-center", true);
  const guideClosed = await toggleWithNativeEnter("guidance-center", false);
  onStep("opening and closing Pattern Lab");
  const patternOpen = await toggleWithNativeEnter("pattern-lab", true);
  const patternClosed = await toggleWithNativeEnter("pattern-lab", false);
  onStep("opening and closing nested mixer processing");
  const mixerOpen = await toggleWithNativeEnter("mixer-processing-drum_rack", true);
  const mixerClosed = await toggleWithNativeEnter("mixer-processing-drum_rack", false);
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
    await runStep(`document.querySelector('[data-testid="chord-slot-0"]')?.focus();`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return evidence;
  } finally {
    ipcMain.removeListener(launchSmokeNoteGridSnapshotChannel, handleRecorderSnapshot);
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
  const waitFor = async (condition: string, timeoutMs = 10000): Promise<void> => {
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
    win.webContents.sendInputEvent({ type: "mouseMove", x: point.x, y: point.y });
    win.webContents.sendInputEvent({ type: "mouseDown", x: point.x, y: point.y, button: "left", clickCount: 1 });
    win.webContents.sendInputEvent({ type: "mouseUp", x: point.x, y: point.y, button: "left", clickCount: 1 });
    await new Promise((resolve) => setTimeout(resolve, 80));
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
  await sendClick("workspace-command-dock-play");
  await waitFor(
    `document.querySelector('[data-testid="workspace-command-dock-play"]')?.getAttribute('aria-pressed') === 'true' && document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'true'`
  );
  const dockSharedPlayReady = await runStep<boolean>(`
    document.querySelector('[data-testid="workspace-command-dock-play"]')?.textContent?.trim() === 'Stop' &&
      document.querySelector('[data-testid="transport-play"] strong')?.textContent?.trim() === 'Stop'
  `);
  await sendClick("workspace-command-dock-play");
  await waitFor(
    `document.querySelector('[data-testid="workspace-command-dock-play"]')?.getAttribute('aria-pressed') === 'false' && document.querySelector('[data-testid="transport-play"]')?.getAttribute('aria-pressed') === 'false'`
  );
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
    dockPositionMirrorsHeader: dockSnapshot.positionMirrorsHeader,
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

function collectLaunchSmokeModalFocusEvidenceWithTimeout(win: BrowserWindow): Promise<LaunchSmokeModalFocusCoreEvidence> {
  return new Promise((resolve, reject) => {
    let step = "starting";
    const timeout = setTimeout(() => reject(new Error(`Timed out collecting live modal focus evidence at ${step}.`)), 280000);
    void collectLaunchSmokeModalFocusEvidence(win, (nextStep) => {
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
      const projectOpenButton = document.querySelector('[data-testid="project-open"]');
      projectOpenButton?.click();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return {
        appKind: bridge?.appKind ?? null,
        defaultName,
        hasOpenProject: typeof bridge?.openProject === "function",
        hasPreloadBridge: Boolean(bridge),
        hasSaveProject: typeof bridge?.saveProject === "function",
        location: window.location.href,
        launchpadCollapsedAfterUiOpen:
          document.querySelector('[data-testid="first-run-launchpad"]')?.open === false,
        openResult: {
          canceled: openResult?.canceled === true,
          contentsLength: typeof openResult?.contents === "string" ? openResult.contents.length : undefined,
          contentsMatched: openResult?.contents === sourceContents,
          filePath: openResult?.filePath
        },
        readyState: document.readyState,
        projectOpenButtonPresent: projectOpenButton !== null,
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
  if (!evidence.projectOpenButtonPresent || !evidence.launchpadCollapsedAfterUiOpen) {
    failures.push("project Open UI should load the configured project and collapse the first-run launchpad");
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
  let closedDetailsEvidence: LaunchSmokeClosedDetailsEvidence | null = null;
  let drumGridKeyboardEvidence: LaunchSmokeDrumGridKeyboardEvidence | null = null;
  let noteGridKeyboardEvidence: LaunchSmokeNoteGridKeyboardEvidence | null = null;
  let minimumWindowEvidence: LaunchSmokeMinimumWindowEvidence | null = null;
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
        if (minimumWindowEvidence) {
          evidence = {
            ...evidence,
            layout: {
              ...evidence.layout,
              ...minimumWindowEvidence
            }
          };
        }
        if (finished) {
          return;
        }

        const failures = launchSmokeFailures(evidence);
        lastProgress = { phase: "dom-collected", evidence, failures };
        if (failures.length === 0) {
          if (!closedDetailsEvidence) {
            lastProgress = { phase: "collecting-closed-details", evidence };
            return collectLaunchSmokeClosedDetailsEvidenceWithTimeout(win)
              .then((collectedEvidence) => {
                if (finished) {
                  return;
                }
                closedDetailsEvidence = collectedEvidence;
                lastProgress = {
                  phase: "closed-details-collected",
                  evidence: { ...evidence, closedDetails: collectedEvidence }
                };
                setTimeout(() => poll(deadline), 100);
              })
              .catch((error: unknown) => {
                fail("Production desktop closed disclosure JavaScript failed.", {
                  error: error instanceof Error ? error.message : String(error)
                });
              });
          }
          if (!drumGridKeyboardEvidence) {
            lastProgress = { phase: "collecting-drum-grid-keyboard", evidence };
            return collectLaunchSmokeDrumGridKeyboardEvidenceWithTimeout(win)
              .then((collectedEvidence) => {
                if (finished) {
                  return;
                }
                drumGridKeyboardEvidence = collectedEvidence;
                lastProgress = {
                  phase: "drum-grid-keyboard-collected",
                  evidence: { ...evidence, drumGrid: collectedEvidence }
                };
                setTimeout(() => poll(deadline), 100);
              })
              .catch((error: unknown) => {
                fail("Production desktop drum grid keyboard JavaScript failed.", {
                  error: error instanceof Error ? error.message : String(error)
                });
              });
          }
          if (!noteGridKeyboardEvidence) {
            lastProgress = { phase: "collecting-note-grid-keyboard", evidence };
            return collectLaunchSmokeNoteGridKeyboardEvidenceWithTimeout(win)
              .then((collectedEvidence) => {
                if (finished) {
                  return;
                }
                noteGridKeyboardEvidence = collectedEvidence;
                lastProgress = {
                  phase: "note-grid-keyboard-collected",
                  evidence: { ...evidence, drumGrid: drumGridKeyboardEvidence, noteGrid: collectedEvidence }
                };
                setTimeout(() => poll(deadline), 100);
              })
              .catch((error: unknown) => {
                fail("Production desktop note-grid keyboard JavaScript failed.", {
                  error: error instanceof Error ? error.message : String(error)
                });
              });
          }
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

                  lastProgress = { phase: "collecting-starter-landing", evidence: evidenceWithPalette };
                  return collectLaunchSmokeStarterLandingEvidenceWithTimeout(win)
                    .then((starterLandingEvidence) => {
                      const evidenceWithStarterLanding = { ...evidenceWithPalette, starterLanding: starterLandingEvidence };
                      lastProgress = { phase: "starter-landing-collected", evidence: evidenceWithStarterLanding };
                      lastProgress = { phase: "collecting-modal-focus", evidence: evidenceWithStarterLanding };
                      return collectLaunchSmokeModalFocusEvidenceWithTimeout(win)
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
                          lastProgress = {
                            phase: "modal-focus-collected",
                            evidence: evidenceWithModalFocus,
                            failures: modalFocusFailures
                          };
                          if (modalFocusFailures.length > 0) {
                            fail("Production desktop modal focus lifecycle smoke failed.", {
                              evidence: evidenceWithModalFocus,
                              failures: modalFocusFailures
                            });
                            return;
                          }

                          lastProgress = { phase: "collecting-command-reference", evidence: evidenceWithModalFocus };
                          return collectLaunchSmokeCommandReferenceEvidenceWithTimeout(win)
                        .then((commandReferenceEvidence) => {
                      if (finished) {
                        return;
                      }

                      const commandReferenceFailures = launchSmokeCommandReferenceFailures(commandReferenceEvidence);
                      const evidenceWithCommandReference = { ...evidenceWithModalFocus, commandReference: commandReferenceEvidence };
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
    lastProgress = { phase: "collecting-minimum-window" };
    void collectLaunchSmokeMinimumWindowEvidence(win)
      .then((evidence) => {
        minimumWindowEvidence = evidence;
        lastProgress = { phase: "minimum-window-collected", evidence };
        poll(Date.now() + launchSmokeTimeoutMs - 35000);
      })
      .catch((error: unknown) => {
        fail("Production minimum-window smoke JavaScript failed.", {
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
      partition: isLaunchSmoke ? `grooveforge-launch-smoke-${process.pid}` : undefined,
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
