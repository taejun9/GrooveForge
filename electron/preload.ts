import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("grooveforge", {
  platform: process.platform,
  appKind: "desktop"
});
