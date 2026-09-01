/**
 * 격리된 Electron 렌더러에 허용된 데스크톱 기능만 `window.grooveforge`로 노출하는 보안 경계다.
 * 렌더러 요청은 이름이 고정된 IPC 채널로 전달하고, 네이티브 메뉴 이벤트는 허용 목록을 통과한 명령만 콜백에 전달한다.
 * 파일 경로와 저장 동작은 권한이 더 큰 main 프로세스가 검증하며 Node/Electron 객체 자체는 웹 페이지에 넘기지 않는다.
 */
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
  manualQa: process.env.GROOVEFORGE_DESKTOP_MANUAL_QA === "1",
  reportLaunchSmokeDrumGridSnapshot: (payload: unknown) => {
    // 테스트 전용 IPC는 명시적인 smoke 환경에서만 열어 일반 앱이 임의 진단 데이터를 전송하지 않게 한다.
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
      // main에서 온 값도 신뢰하지 않고 공개 계약의 명령 집합으로 좁힌 뒤 렌더러에 전달한다.
      if (isNativeMenuCommand(command)) {
        callback(command);
      }
    };

    ipcRenderer.on("grooveforge:menu-command", listener);
    return () => ipcRenderer.removeListener("grooveforge:menu-command", listener);
  }
});
