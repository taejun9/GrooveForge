/// <reference types="vite/client" />

interface Window {
  grooveforge?: {
    platform: NodeJS.Platform;
    appKind: "desktop";
    saveProject?: (contents: string, defaultName: string) => Promise<{ canceled: boolean; filePath?: string }>;
    openProject?: () => Promise<{ canceled: boolean; filePath?: string; contents?: string }>;
  };
  webkitAudioContext?: typeof AudioContext;
}
