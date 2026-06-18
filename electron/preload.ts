import { contextBridge, ipcRenderer } from "electron";
import type { IpcRendererEvent } from "electron";

type NativeMenuCommand =
  | "open-project"
  | "save-project"
  | "undo"
  | "redo"
  | "quick-actions"
  | "command-reference"
  | "toggle-playback"
  | "delete-selected-event";

const nativeMenuCommands = new Set<NativeMenuCommand>([
  "open-project",
  "save-project",
  "undo",
  "redo",
  "quick-actions",
  "command-reference",
  "toggle-playback",
  "delete-selected-event"
]);

function isNativeMenuCommand(value: unknown): value is NativeMenuCommand {
  return typeof value === "string" && nativeMenuCommands.has(value as NativeMenuCommand);
}

contextBridge.exposeInMainWorld("grooveforge", {
  platform: process.platform,
  appKind: "desktop",
  saveProject: (contents: string, defaultName: string) =>
    ipcRenderer.invoke("grooveforge:save-project", { contents, defaultName }) as Promise<{ canceled: boolean; filePath?: string }>,
  openProject: () =>
    ipcRenderer.invoke("grooveforge:open-project") as Promise<{ canceled: boolean; filePath?: string; contents?: string }>,
  onMenuCommand: (callback: (command: NativeMenuCommand) => void) => {
    const listener = (_event: IpcRendererEvent, command: unknown): void => {
      if (isNativeMenuCommand(command)) {
        callback(command);
      }
    };

    ipcRenderer.on("grooveforge:menu-command", listener);
    return () => ipcRenderer.removeListener("grooveforge:menu-command", listener);
  }
});
