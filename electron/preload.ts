import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("grooveforge", {
  platform: process.platform,
  appKind: "desktop",
  saveProject: (contents: string, defaultName: string) =>
    ipcRenderer.invoke("grooveforge:save-project", { contents, defaultName }) as Promise<{ canceled: boolean; filePath?: string }>,
  openProject: () =>
    ipcRenderer.invoke("grooveforge:open-project") as Promise<{ canceled: boolean; filePath?: string; contents?: string }>
});
