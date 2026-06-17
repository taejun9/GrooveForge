import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from "electron";
import type { MenuItemConstructorOptions, OpenDialogOptions, SaveDialogOptions } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
const menuCommandChannel = "grooveforge:menu-command";

type NativeMenuCommand =
  | "open-project"
  | "save-project"
  | "undo"
  | "redo"
  | "quick-actions"
  | "toggle-playback"
  | "delete-selected-event";

type SaveProjectPayload = {
  contents: string;
  defaultName: string;
};

const projectFilters = [{ name: "GrooveForge Project", extensions: ["json"] }];

function isSaveProjectPayload(value: unknown): value is SaveProjectPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "contents" in value &&
    "defaultName" in value &&
    typeof value.contents === "string" &&
    typeof value.defaultName === "string"
  );
}

function sendMenuCommand(command: NativeMenuCommand): void {
  const targetWindow = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
  targetWindow?.webContents.send(menuCommandChannel, command);
}

function createRendererCommandMenuItem(label: string, accelerator: string, command: NativeMenuCommand): MenuItemConstructorOptions {
  return {
    label,
    accelerator,
    // Renderer keydown handling owns focused-input guards; Electron only displays the shortcut here.
    registerAccelerator: false,
    click: () => sendMenuCommand(command)
  };
}

function createNativeCommandMenu(): Menu {
  const isMac = process.platform === "darwin";
  const fileSubmenu: MenuItemConstructorOptions[] = [
    createRendererCommandMenuItem("Open Project...", "CmdOrCtrl+O", "open-project"),
    createRendererCommandMenuItem("Save Project", "CmdOrCtrl+S", "save-project"),
    { type: "separator" }
  ];
  const viewSubmenu: MenuItemConstructorOptions[] = [
    { role: "reload" },
    { role: "forceReload" },
    { type: "separator" },
    { role: "resetZoom" },
    { role: "zoomIn" },
    { role: "zoomOut" },
    { type: "separator" },
    { role: "togglefullscreen" }
  ];

  if (!isMac) {
    fileSubmenu.push({ role: "quit" });
  }
  if (isDev) {
    viewSubmenu.splice(2, 0, { role: "toggleDevTools" });
  }

  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: "GrooveForge",
            submenu: [
              { role: "about" },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" }
            ]
          } satisfies MenuItemConstructorOptions
        ]
      : []),
    {
      label: "File",
      submenu: fileSubmenu
    },
    {
      label: "Edit",
      submenu: [
        createRendererCommandMenuItem("Undo", "CmdOrCtrl+Z", "undo"),
        createRendererCommandMenuItem("Redo", "Shift+CmdOrCtrl+Z", "redo"),
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { type: "separator" },
        createRendererCommandMenuItem("Delete Selected Event", "Backspace", "delete-selected-event")
      ]
    },
    {
      label: "Transport",
      submenu: [
        createRendererCommandMenuItem("Play / Stop", "Space", "toggle-playback"),
        createRendererCommandMenuItem("Quick Actions", "CmdOrCtrl+K", "quick-actions")
      ]
    },
    {
      label: "View",
      submenu: viewSubmenu
    },
    {
      role: "window",
      submenu: [
        { role: "minimize" },
        { role: "zoom" },
        ...(isMac ? [{ type: "separator" as const }, { role: "front" as const }] : [])
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "GrooveForge Local Workstation",
          click: () => {
            void shell.openExternal("https://github.com/taejun9/GrooveForge");
          }
        }
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
}

function registerProjectFileHandlers(): void {
  ipcMain.handle("grooveforge:save-project", async (event, payload: unknown) => {
    if (!isSaveProjectPayload(payload)) {
      throw new Error("Invalid save project payload.");
    }

    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    const options: SaveDialogOptions = {
      title: "Save GrooveForge Project",
      defaultPath: payload.defaultName,
      filters: projectFilters
    };
    const result = browserWindow ? await dialog.showSaveDialog(browserWindow, options) : await dialog.showSaveDialog(options);
    if (result.canceled || !result.filePath) {
      return { canceled: true };
    }

    await writeFile(result.filePath, payload.contents, "utf8");
    return { canceled: false, filePath: result.filePath };
  });

  ipcMain.handle("grooveforge:open-project", async (event) => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender);
    const options: OpenDialogOptions = {
      title: "Open GrooveForge Project",
      filters: projectFilters,
      properties: ["openFile"]
    };
    const result = browserWindow ? await dialog.showOpenDialog(browserWindow, options) : await dialog.showOpenDialog(options);
    const filePath = result.filePaths[0];
    if (result.canceled || !filePath) {
      return { canceled: true };
    }

    const contents = await readFile(filePath, "utf8");
    return { canceled: false, filePath, contents };
  });
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1180,
    minHeight: 760,
    title: "GrooveForge",
    backgroundColor: "#0f1115",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL as string);
  } else {
    void win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  registerProjectFileHandlers();
  Menu.setApplicationMenu(createNativeCommandMenu());
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
