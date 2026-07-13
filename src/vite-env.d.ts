/// <reference types="vite/client" />

type NativeMenuCommand =
  | "open-project"
  | "save-project"
  | "undo"
  | "redo"
  | "quick-actions"
  | "command-reference"
  | "toggle-playback"
  | "delete-selected-event";

type MIDIPortDeviceState = "disconnected" | "connected";
type MIDIPortConnectionState = "open" | "closed" | "pending";

interface MIDIMessageEvent extends Event {
  readonly data: Uint8Array;
}

interface MIDIConnectionEvent extends Event {
  readonly port: MIDIInput | null;
}

interface MIDIInput {
  readonly id: string;
  readonly manufacturer: string | null;
  readonly name: string | null;
  readonly state: MIDIPortDeviceState;
  readonly connection: MIDIPortConnectionState;
  onmidimessage: ((event: MIDIMessageEvent) => void) | null;
}

interface MIDIInputMap {
  values(): IterableIterator<MIDIInput>;
}

interface MIDIAccess {
  readonly inputs: MIDIInputMap;
  onstatechange: ((event: MIDIConnectionEvent) => void) | null;
}

type MIDIOptions = {
  sysex?: boolean;
  software?: boolean;
};

type GrooveforgeLaunchSmokeRouteEvidence = {
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

type GrooveforgeLaunchSmokeAudienceStarterEvidence = GrooveforgeLaunchSmokeRouteEvidence & {
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

type GrooveforgeLaunchSmokeStarterLandingRouteEvidence = {
  chordToolColumnCount: number;
  chordToolCount: number;
  chordToolInternalOverflow: number;
  chordToolReadableLabelCount: number;
  chordToolRowCount: number;
  chordToolUniqueAccessibleNameCount: number;
  clearOfNavigator: boolean;
  focusTestId: string;
  inViewport: boolean;
  producerQueueOpen: boolean;
  producerReviewOpen: boolean;
  projectTitle: string;
  reviewQueueContained: boolean;
  reviewQueueFieldCount: number;
  reviewQueueInternalOverflow: number;
  reviewQueueReadableFieldCount: number;
  reviewQueueStackedRowCount: number;
};

type GrooveforgeLaunchSmokeStarterLandingEvidence = {
  beginner: GrooveforgeLaunchSmokeStarterLandingRouteEvidence;
  producer: GrooveforgeLaunchSmokeStarterLandingRouteEvidence;
};

type GrooveforgeLaunchSmokeAudienceNextStepRailEvidence = {
  activeAudience: string;
  beginnerAction: string;
  beginnerButtonPresent: boolean;
  beginnerFollowup: string;
  beginnerReadiness: string;
  beginnerRoute: string;
  present: boolean;
  producerAction: string;
  producerButtonPresent: boolean;
  producerFollowup: string;
  producerReadiness: string;
  producerRoute: string;
  rowCount: number;
};

type GrooveforgeLaunchSmokeAudienceCompletionCheckpointEvidence = {
  activeAudience: string;
  beginnerDelivery: string;
  beginnerLane: string;
  beginnerMode: string;
  beginnerNext: string;
  beginnerReadiness: string;
  beginnerStarter: string;
  present: boolean;
  producerDelivery: string;
  producerLane: string;
  producerMode: string;
  producerNext: string;
  producerReadiness: string;
  producerStarter: string;
  rowCount: number;
};

type GrooveforgeLaunchSmokeAudienceSessionProofHandoffEvidence = {
  activeAudience: string;
  beginnerArtifact: string;
  beginnerLane: string;
  beginnerNext: string;
  beginnerProof: string;
  beginnerRoute: string;
  present: boolean;
  producerArtifact: string;
  producerLane: string;
  producerNext: string;
  producerProof: string;
  producerRoute: string;
  rowCount: number;
};

type GrooveforgeLaunchSmokeAudienceSessionAcceptanceEvidence = {
  activeAudience: string;
  beginnerEvidence: string;
  beginnerLane: string;
  beginnerNext: string;
  beginnerProof: string;
  beginnerTarget: string;
  present: boolean;
  producerEvidence: string;
  producerLane: string;
  producerNext: string;
  producerProof: string;
  producerTarget: string;
  rowCount: number;
};

type GrooveforgeLaunchSmokeAudienceDeliverySnapshotEvidence = {
  activeAudience: string;
  beginnerDeliverables: string;
  beginnerFocus: string;
  beginnerHandoff: string;
  beginnerLane: string;
  beginnerProof: string;
  present: boolean;
  producerDeliverables: string;
  producerFocus: string;
  producerHandoff: string;
  producerLane: string;
  producerProof: string;
  rowCount: number;
};

type GrooveforgeLaunchSmokeAudienceDeliveryProofBridgeEvidence = {
  activeAudience: string;
  beginnerLane: string;
  beginnerNext: string;
  beginnerPackage: string;
  beginnerRoute: string;
  beginnerStatus: string;
  present: boolean;
  producerLane: string;
  producerNext: string;
  producerPackage: string;
  producerRoute: string;
  producerStatus: string;
  rowCount: number;
};

type GrooveforgeLaunchSmokePaletteEvidence = {
  arrangementTools: GrooveforgeLaunchSmokeArrangementToolsEvidence;
  captureIdeas: GrooveforgeLaunchSmokeCaptureIdeasEvidence;
  chordCards: GrooveforgeLaunchSmokeChordCardEvidence;
  completionCheckpoints: GrooveforgeLaunchSmokeAudienceCompletionCheckpointEvidence;
  completionBeginner: GrooveforgeLaunchSmokeRouteEvidence;
  completionProducer: GrooveforgeLaunchSmokeRouteEvidence;
  completionReadout: GrooveforgeLaunchSmokeRouteEvidence;
  deliveryProofBeginner: GrooveforgeLaunchSmokeRouteEvidence;
  deliveryProofBridge: GrooveforgeLaunchSmokeAudienceDeliveryProofBridgeEvidence;
  deliveryProofProducer: GrooveforgeLaunchSmokeRouteEvidence;
  deliveryProofReadout: GrooveforgeLaunchSmokeRouteEvidence;
  deliverySnapshot: GrooveforgeLaunchSmokeAudienceDeliverySnapshotEvidence;
  deliveryTools: GrooveforgeLaunchSmokeDeliveryToolsEvidence;
  dualBeginner: GrooveforgeLaunchSmokeRouteEvidence;
  dualProducer: GrooveforgeLaunchSmokeRouteEvidence;
  dualReadout: GrooveforgeLaunchSmokeRouteEvidence;
  guided: GrooveforgeLaunchSmokeRouteEvidence;
  instrumentTools: GrooveforgeLaunchSmokeInstrumentToolsEvidence;
  mixerTools: GrooveforgeLaunchSmokeMixerToolsEvidence;
  masterTools: GrooveforgeLaunchSmokeMasterToolsEvidence;
  launchpad: GrooveforgeLaunchSmokeLaunchpadEvidence;
  transportTools: GrooveforgeLaunchSmokeTransportToolsEvidence;
  nextStepRail: GrooveforgeLaunchSmokeAudienceNextStepRailEvidence;
  opened: boolean;
  producer: GrooveforgeLaunchSmokeRouteEvidence;
  routeBridge: GrooveforgeLaunchSmokeRouteEvidence;
  routeBridgeCompletion: GrooveforgeLaunchSmokeRouteEvidence;
  routeBridgeReadiness: GrooveforgeLaunchSmokeRouteEvidence;
  sessionAcceptanceBeginner: GrooveforgeLaunchSmokeRouteEvidence;
  sessionAcceptance: GrooveforgeLaunchSmokeAudienceSessionAcceptanceEvidence;
  sessionAcceptanceProducer: GrooveforgeLaunchSmokeRouteEvidence;
  sessionAcceptanceReadout: GrooveforgeLaunchSmokeRouteEvidence;
  sessionProofBeginner: GrooveforgeLaunchSmokeRouteEvidence;
  sessionProofHandoff: GrooveforgeLaunchSmokeAudienceSessionProofHandoffEvidence;
  sessionProofProducer: GrooveforgeLaunchSmokeRouteEvidence;
  sessionProofReadout: GrooveforgeLaunchSmokeRouteEvidence;
  starterBeginner: GrooveforgeLaunchSmokeAudienceStarterEvidence;
  starterProducer: GrooveforgeLaunchSmokeAudienceStarterEvidence;
  resultPresent: boolean;
  searchPresent: boolean;
};

type GrooveforgeLaunchSmokeBridgeDirectEvidence = {
  buttonPresent: boolean;
  resultDestination: string;
  resultFollowup: string;
  resultMetric: string;
  resultPresent: boolean;
  resultTitle: string;
};

type GrooveforgeLaunchSmokeBridgeDirectEvidenceBundle = {
  completion: GrooveforgeLaunchSmokeBridgeDirectEvidence;
  readiness: GrooveforgeLaunchSmokeBridgeDirectEvidence;
};

type GrooveforgeLaunchSmokeCaptureIdeasEvidence = {
  autoReveal: boolean;
  initialOpen: boolean;
  resetOpen: boolean;
};

type GrooveforgeLaunchSmokeInstrumentToolsEvidence = {
  guidedHarmonyOpen: boolean;
  guidedSoundOpen: boolean;
  resetHarmonyOpen: boolean;
  resetSoundOpen: boolean;
  studioHarmonyOpen: boolean;
  studioSoundOpen: boolean;
};

type GrooveforgeLaunchSmokeArrangementToolsEvidence = {
  guidedArrangementOpen: boolean;
  guidedBlockMovesOpen: boolean;
  resetArrangementOpen: boolean;
  resetBlockMovesOpen: boolean;
  studioArrangementOpen: boolean;
  studioBlockMovesFullWidth: boolean;
  studioBlockMovesOpen: boolean;
};

type GrooveforgeLaunchSmokeMixerToolsEvidence = {
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

type GrooveforgeLaunchSmokeMasterToolsEvidence = {
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

type GrooveforgeLaunchSmokeDeliveryToolsEvidence = {
  guidedAuditOpen: boolean;
  guidedStatusOpen: boolean;
  resetAuditOpen: boolean;
  resetStatusOpen: boolean;
  studioAuditOpen: boolean;
  studioStatusOpen: boolean;
};

type GrooveforgeLaunchSmokeTransportToolsEvidence = {
  guidedExportsOpen: boolean;
  guidedSessionOpen: boolean;
  resetExportsOpen: boolean;
  resetSessionOpen: boolean;
  studioExportsOpen: boolean;
  studioSessionOpen: boolean;
};

type GrooveforgeLaunchSmokeLaunchpadEvidence = {
  collapsedAfterStarter: boolean;
  initialOpen: boolean;
  manualClose: boolean;
  manualReopen: boolean;
  sameStarterCollapse: boolean;
};

type GrooveforgeLaunchSmokeChordCardEvidence = {
  restoreReady: boolean;
  selectionReady: boolean;
};

interface Window {
  grooveforge?: {
    platform: NodeJS.Platform;
    appKind: "desktop";
    launchSmoke?: boolean;
    reportLaunchSmokeDrumGridSnapshot?: (payload: unknown) => void;
    reportLaunchSmokeNoteGridSnapshot?: (payload: unknown) => void;
    saveProject?: (contents: string, defaultName: string) => Promise<{ canceled: boolean; filePath?: string }>;
    openProject?: () => Promise<{ canceled: boolean; filePath?: string; contents?: string }>;
    onMenuCommand?: (callback: (command: NativeMenuCommand) => void) => () => void;
  };
  __grooveforgeLaunchSmoke?: {
    collectAudienceRouteBridgeDirectEvidence?: () =>
      | GrooveforgeLaunchSmokeBridgeDirectEvidenceBundle
      | Promise<GrooveforgeLaunchSmokeBridgeDirectEvidenceBundle>;
    collectAudienceStarterLandingEvidence?: () =>
      | GrooveforgeLaunchSmokeStarterLandingEvidence
      | Promise<GrooveforgeLaunchSmokeStarterLandingEvidence>;
    collectAudienceSessionQuickActionEvidence?: () => GrooveforgeLaunchSmokePaletteEvidence | Promise<GrooveforgeLaunchSmokePaletteEvidence>;
    collectChordCardKeyboardEvidence?: () => GrooveforgeLaunchSmokeChordCardEvidence;
    setModeAwareToolPanels?: (mode: "guided" | "studio") => void;
  };
  __grooveforgeLaunchSmokePaletteStep?: string;
  webkitAudioContext?: typeof AudioContext;
}

interface Navigator {
  requestMIDIAccess?: (options?: MIDIOptions) => Promise<MIDIAccess>;
}
