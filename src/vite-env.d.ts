/// <reference types="vite/client" />

interface Window {
  grooveforge?: {
    platform: NodeJS.Platform;
    appKind: "desktop";
  };
  webkitAudioContext?: typeof AudioContext;
}
