import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import type { OpenDialogOptions, SaveDialogOptions } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;

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
