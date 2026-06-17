/// <reference types="vite/client" />

type NativeMenuCommand =
  | "open-project"
  | "save-project"
  | "undo"
  | "redo"
  | "quick-actions"
  | "toggle-playback"
  | "delete-selected-event";

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
