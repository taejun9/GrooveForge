/// <reference types="vite/client" />

type NativeMenuCommand =
  | "open-project"
  | "save-project"
  | "undo"
  | "redo"
  | "quick-actions"
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

interface Window {
  grooveforge?: {
    platform: NodeJS.Platform;
    appKind: "desktop";
    saveProject?: (contents: string, defaultName: string) => Promise<{ canceled: boolean; filePath?: string }>;
    openProject?: () => Promise<{ canceled: boolean; filePath?: string; contents?: string }>;
    onMenuCommand?: (callback: (command: NativeMenuCommand) => void) => () => void;
  };
  webkitAudioContext?: typeof AudioContext;
}

interface Navigator {
  requestMIDIAccess?: (options?: MIDIOptions) => Promise<MIDIAccess>;
}
