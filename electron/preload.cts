import { contextBridge, ipcRenderer } from "electron";
import type { IpcRendererEvent } from "electron";

type NativeMenuCommand =
  | "open-project"
  | "save-project"
  | "save-project-and-close"
  | "undo"
  | "redo"
  | "quick-actions"
  | "command-reference"
  | "toggle-playback"
  | "delete-selected-event";

const nativeMenuCommands = new Set<NativeMenuCommand>([
  "open-project",
  "save-project",
  "save-project-and-close",
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
  launchSmoke: process.env.GROOVEFORGE_DESKTOP_LAUNCH_SMOKE === "1",
  reportLaunchSmokeDrumGridSnapshot: (payload: unknown) => {
    if (process.env.GROOVEFORGE_DESKTOP_LAUNCH_SMOKE === "1") {
      ipcRenderer.send("grooveforge:launch-smoke-drum-grid-snapshot", payload);
    }
  },
  reportLaunchSmokeNoteGridSnapshot: (payload: unknown) => {
    if (process.env.GROOVEFORGE_DESKTOP_LAUNCH_SMOKE === "1") {
      ipcRenderer.send("grooveforge:launch-smoke-note-grid-snapshot", payload);
    }
  },
  saveProject: (contents: string, defaultName: string) =>
    ipcRenderer.invoke("grooveforge:save-project", { contents, defaultName }) as Promise<{
      canceled: boolean;
      filePath?: string;
      databaseStored?: boolean;
    }>,
  saveProjectRecovery: (contents: string) =>
    ipcRenderer.invoke("grooveforge:save-project-recovery", contents) as Promise<{ savedAt: string }>,
  loadProjectRecovery: () =>
    ipcRenderer.invoke("grooveforge:load-project-recovery") as Promise<
      { contents: string; savedAt: string } | null
    >,
  clearProjectRecovery: () =>
    ipcRenderer.invoke("grooveforge:clear-project-recovery") as Promise<{ cleared: boolean }>,
  closeWindow: () => ipcRenderer.send("grooveforge:close-window"),
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
