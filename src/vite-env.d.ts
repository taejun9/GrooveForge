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

type GrooveforgeLaunchSmokePaletteEvidence = {
  completionBeginner: GrooveforgeLaunchSmokeRouteEvidence;
  completionProducer: GrooveforgeLaunchSmokeRouteEvidence;
  completionReadout: GrooveforgeLaunchSmokeRouteEvidence;
  dualBeginner: GrooveforgeLaunchSmokeRouteEvidence;
  dualProducer: GrooveforgeLaunchSmokeRouteEvidence;
  dualReadout: GrooveforgeLaunchSmokeRouteEvidence;
  guided: GrooveforgeLaunchSmokeRouteEvidence;
  opened: boolean;
  producer: GrooveforgeLaunchSmokeRouteEvidence;
  routeBridge: GrooveforgeLaunchSmokeRouteEvidence;
  routeBridgeCompletion: GrooveforgeLaunchSmokeRouteEvidence;
  routeBridgeReadiness: GrooveforgeLaunchSmokeRouteEvidence;
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

interface Window {
  grooveforge?: {
    platform: NodeJS.Platform;
    appKind: "desktop";
    launchSmoke?: boolean;
    saveProject?: (contents: string, defaultName: string) => Promise<{ canceled: boolean; filePath?: string }>;
    openProject?: () => Promise<{ canceled: boolean; filePath?: string; contents?: string }>;
    onMenuCommand?: (callback: (command: NativeMenuCommand) => void) => () => void;
  };
  __grooveforgeLaunchSmoke?: {
    collectAudienceRouteBridgeDirectEvidence?: () =>
      | GrooveforgeLaunchSmokeBridgeDirectEvidenceBundle
      | Promise<GrooveforgeLaunchSmokeBridgeDirectEvidenceBundle>;
    collectAudienceSessionQuickActionEvidence?: () => GrooveforgeLaunchSmokePaletteEvidence | Promise<GrooveforgeLaunchSmokePaletteEvidence>;
  };
  webkitAudioContext?: typeof AudioContext;
}

interface Navigator {
  requestMIDIAccess?: (options?: MIDIOptions) => Promise<MIDIAccess>;
}
