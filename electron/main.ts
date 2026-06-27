import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from "electron";
import type { MenuItemConstructorOptions, OpenDialogOptions, SaveDialogOptions } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.VITE_DEV_SERVER_URL !== undefined;
const menuCommandChannel = "grooveforge:menu-command";
const isLaunchSmoke = process.env.GROOVEFORGE_DESKTOP_LAUNCH_SMOKE === "1";
const launchSmokeResultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
const launchSmokeTimeoutMs = 60000;

type NativeMenuCommand =
  | "open-project"
  | "save-project"
  | "undo"
  | "redo"
  | "quick-actions"
  | "command-reference"
  | "toggle-playback"
  | "delete-selected-event";

type SaveProjectPayload = {
  contents: string;
  defaultName: string;
};

type LaunchSmokeEvidence = {
  appKind: unknown;
  bodyTextLength: number;
  hasOpenProject: boolean;
  hasPreloadBridge: boolean;
  hasRoot: boolean;
  hasSaveProject: boolean;
  location: string;
  missingText: string[];
  platform: unknown;
  readyState: string;
  rootChildCount: number;
  samplingTextPresent: boolean;
  testIds: Record<string, boolean>;
  title: string;
  viewport: {
    height: number;
    width: number;
  };
};

type LaunchSmokeVisualEvidence = {
  bitmapBytes: number;
  brightSamples: number;
  darkSamples: number;
  height: number;
  maxColorDelta: number;
  nonBackgroundSamples: number;
  opaqueSamples: number;
  pngBytes: number;
  sampledPixels: number;
  uniqueSampledColors: number;
  width: number;
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
        createRendererCommandMenuItem("Command Reference", "CmdOrCtrl+/", "command-reference"),
        { type: "separator" },
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

function launchSmokeFailure(message: string, details: Record<string, unknown> = {}): void {
  console.error(`${launchSmokeResultPrefix}${JSON.stringify({ ok: false, message, ...details })}`);
  app.exit(1);
}

function launchSmokeFailures(evidence: LaunchSmokeEvidence): string[] {
  const failures: string[] = [];
  const missingTestIds = Object.entries(evidence.testIds)
    .filter(([, present]) => !present)
    .map(([testId]) => testId);

  if (evidence.title !== "GrooveForge") {
    failures.push(`document title should be GrooveForge, got ${evidence.title}`);
  }
  if (!evidence.location.startsWith("file:")) {
    failures.push(`production renderer should load from file:, got ${evidence.location}`);
  }
  if (evidence.readyState !== "interactive" && evidence.readyState !== "complete") {
    failures.push(`document readyState should be interactive or complete, got ${evidence.readyState}`);
  }
  if (evidence.appKind !== "desktop") {
    failures.push(`preload appKind should be desktop, got ${String(evidence.appKind)}`);
  }
  if (!evidence.hasPreloadBridge || !evidence.hasSaveProject || !evidence.hasOpenProject) {
    failures.push("preload bridge should expose appKind, saveProject, and openProject");
  }
  if (!evidence.hasRoot || evidence.rootChildCount < 1) {
    failures.push("renderer root should be mounted");
  }
  if (evidence.bodyTextLength < 20000) {
    failures.push(`renderer text should be substantial, got ${evidence.bodyTextLength} characters`);
  }
  if (evidence.missingText.length > 0) {
    failures.push(`renderer is missing text: ${evidence.missingText.join(", ")}`);
  }
  if (missingTestIds.length > 0) {
    failures.push(`renderer is missing test ids: ${missingTestIds.join(", ")}`);
  }
  if (evidence.samplingTextPresent) {
    failures.push("renderer should not expose sampling-first language in first-run live desktop smoke");
  }
  if (evidence.viewport.width < 1180 || evidence.viewport.height < 760) {
    failures.push(`viewport should respect desktop minimums, got ${evidence.viewport.width}x${evidence.viewport.height}`);
  }

  return failures;
}

function launchSmokeVisualFailures(evidence: LaunchSmokeVisualEvidence): string[] {
  const failures: string[] = [];
  const opaqueRatio = evidence.sampledPixels > 0 ? evidence.opaqueSamples / evidence.sampledPixels : 0;
  const nonBackgroundRatio = evidence.sampledPixels > 0 ? evidence.nonBackgroundSamples / evidence.sampledPixels : 0;

  if (evidence.width < 1180 || evidence.height < 760) {
    failures.push(`screenshot should respect desktop minimums, got ${evidence.width}x${evidence.height}`);
  }
  if (evidence.pngBytes < 50000) {
    failures.push(`screenshot PNG should be substantial, got ${evidence.pngBytes} bytes`);
  }
  if (evidence.bitmapBytes < evidence.width * evidence.height * 4) {
    failures.push(`screenshot bitmap should include RGBA pixels, got ${evidence.bitmapBytes} bytes`);
  }
  if (evidence.sampledPixels < 1000) {
    failures.push(`screenshot should sample at least 1000 pixels, got ${evidence.sampledPixels}`);
  }
  if (opaqueRatio < 0.95) {
    failures.push(`screenshot should be mostly opaque, got ${(opaqueRatio * 100).toFixed(1)}% opaque samples`);
  }
  if (evidence.uniqueSampledColors < 24) {
    failures.push(`screenshot should have visible color diversity, got ${evidence.uniqueSampledColors} sampled colors`);
  }
  if (nonBackgroundRatio < 0.04) {
    failures.push(`screenshot should contain non-background UI pixels, got ${(nonBackgroundRatio * 100).toFixed(1)}%`);
  }
  if (evidence.maxColorDelta < 48) {
    failures.push(`screenshot should have visible contrast, got max color delta ${evidence.maxColorDelta}`);
  }
  if (evidence.brightSamples < 20 || evidence.darkSamples < 20) {
    failures.push(`screenshot should contain both bright and dark UI samples, got ${evidence.brightSamples} bright and ${evidence.darkSamples} dark`);
  }

  return failures;
}

async function collectLaunchSmokeVisualEvidence(win: BrowserWindow): Promise<LaunchSmokeVisualEvidence> {
  const screenshot = await win.webContents.capturePage();
  const { width, height } = screenshot.getSize();
  const pngBytes = screenshot.toPNG().byteLength;
  const bitmap = screenshot.toBitmap();
  const totalPixels = Math.floor(bitmap.byteLength / 4);
  const targetSamples = Math.min(12000, totalPixels);
  const stride = Math.max(1, Math.floor(totalPixels / Math.max(1, targetSamples)));
  const base0 = bitmap[0] ?? 0;
  const base1 = bitmap[1] ?? 0;
  const base2 = bitmap[2] ?? 0;
  const sampledColors = new Set<string>();
  let sampledPixels = 0;
  let opaqueSamples = 0;
  let nonBackgroundSamples = 0;
  let brightSamples = 0;
  let darkSamples = 0;
  let maxColorDelta = 0;

  for (let pixel = 0; pixel < totalPixels; pixel += stride) {
    const offset = pixel * 4;
    const c0 = bitmap[offset] ?? 0;
    const c1 = bitmap[offset + 1] ?? 0;
    const c2 = bitmap[offset + 2] ?? 0;
    const alpha = bitmap[offset + 3] ?? 255;
    const colorDelta = Math.abs(c0 - base0) + Math.abs(c1 - base1) + Math.abs(c2 - base2);
    const colorSum = c0 + c1 + c2;

    sampledPixels += 1;
    if (alpha >= 240) {
      opaqueSamples += 1;
    }
    if (colorDelta > 24) {
      nonBackgroundSamples += 1;
    }
    if (colorSum > 420) {
      brightSamples += 1;
    }
    if (colorSum < 120) {
      darkSamples += 1;
    }
    if (colorDelta > maxColorDelta) {
      maxColorDelta = colorDelta;
    }
    sampledColors.add(`${c0 >> 4}:${c1 >> 4}:${c2 >> 4}`);
  }

  return {
    bitmapBytes: bitmap.byteLength,
    brightSamples,
    darkSamples,
    height,
    maxColorDelta,
    nonBackgroundSamples,
    opaqueSamples,
    pngBytes,
    sampledPixels,
    uniqueSampledColors: sampledColors.size,
    width
  };
}

async function collectLaunchSmokeEvidence(win: BrowserWindow): Promise<LaunchSmokeEvidence> {
  const evidence = await win.webContents.executeJavaScript(`
    (() => {
      const expectedTestIds = [
        "workflow-target-transport",
        "workflow-target-compose",
        "workflow-target-sound",
        "workflow-target-arrange",
        "workflow-target-mix",
        "workflow-target-master",
        "guide-quick-start",
        "guide-quick-start-headline",
        "mode-guided",
        "mode-studio",
        "quick-actions-open",
        "command-reference-open",
        "style-select",
        "pattern-tab-A",
        "export-stems",
        "export-midi",
        "export-handoff-sheet",
        "pattern-chain-current",
        "master-ceiling"
      ];
      const expectedText = [
        "GrooveForge",
        "desktop workstation",
        "Guide Quick Start",
        "First Beat Path",
        "Beat Spine",
        "Composer Guide",
        "Workflow Navigator",
        "Guided Focus",
        "Guided Session Pass",
        "Studio",
        "Review Queue",
        "Production Snapshot",
        "Mix Coach",
        "Sound Snapshot",
        "Mix Snapshot",
        "Pattern A",
        "Drums",
        "808",
        "Synth",
        "Melody",
        "Chords",
        "Arrangement",
        "Mixer",
        "Master",
        "Export meter",
        "Export Preflight",
        "Handoff Pack"
      ];

      const bodyText = document.body?.textContent ?? "";
      const bridge = window.grooveforge;
      return {
        appKind: bridge?.appKind ?? null,
        bodyTextLength: bodyText.length,
        hasOpenProject: typeof bridge?.openProject === "function",
        hasPreloadBridge: Boolean(bridge),
        hasRoot: Boolean(document.querySelector("#root")),
        hasSaveProject: typeof bridge?.saveProject === "function",
        location: window.location.href,
        missingText: expectedText.filter((text) => !bodyText.includes(text)),
        platform: bridge?.platform ?? null,
        readyState: document.readyState,
        rootChildCount: document.querySelector("#root")?.childElementCount ?? 0,
        samplingTextPresent: /AudioClipEvent|sample import|sample browser|chop pads|sampler track|audio clip/i.test(bodyText),
        testIds: Object.fromEntries(
          expectedTestIds.map((testId) => [testId, document.querySelector(\`[data-testid="\${testId}"]\`) !== null])
        ),
        title: document.title,
        viewport: {
          height: window.innerHeight,
          width: window.innerWidth
        }
      };
    })();
  `);
  return evidence as LaunchSmokeEvidence;
}

function installLaunchSmoke(win: BrowserWindow): void {
  let finished = false;
  const timeout = setTimeout(() => {
    if (!finished) {
      finished = true;
      launchSmokeFailure("Timed out before the production desktop renderer completed the launch smoke.");
    }
  }, launchSmokeTimeoutMs);

  const fail = (message: string, details: Record<string, unknown> = {}): void => {
    if (finished) {
      return;
    }
    finished = true;
    clearTimeout(timeout);
    launchSmokeFailure(message, details);
  };

  win.webContents.once("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    fail("Production renderer failed to load.", { errorCode, errorDescription, validatedURL });
  });

  win.webContents.once("render-process-gone", (_event, details) => {
    fail("Production renderer process exited before smoke completed.", { reason: details.reason });
  });

  const poll = (deadline: number): void => {
    void collectLaunchSmokeEvidence(win)
      .then((evidence) => {
        if (finished) {
          return;
        }

        const failures = launchSmokeFailures(evidence);
        if (failures.length === 0) {
          return collectLaunchSmokeVisualEvidence(win)
            .then((visualEvidence) => {
              if (finished) {
                return;
              }

              const visualFailures = launchSmokeVisualFailures(visualEvidence);
              if (visualFailures.length > 0) {
                fail("Production desktop visual launch smoke failed.", {
                  evidence,
                  visualEvidence,
                  failures: visualFailures
                });
                return;
              }

              finished = true;
              clearTimeout(timeout);
              console.log(`${launchSmokeResultPrefix}${JSON.stringify({ ok: true, evidence: { ...evidence, visual: visualEvidence } })}`);
              app.exit(0);
            })
            .catch((error: unknown) => {
              fail("Production desktop screenshot capture failed.", {
                error: error instanceof Error ? error.message : String(error)
              });
            });
        }

        if (Date.now() >= deadline) {
          fail("Production desktop renderer launch smoke failed.", { evidence, failures });
          return;
        }

        setTimeout(() => poll(deadline), 100);
      })
      .catch((error: unknown) => {
        fail("Production renderer smoke JavaScript failed.", {
          error: error instanceof Error ? error.message : String(error)
        });
      });
  };

  win.webContents.once("dom-ready", () => {
    poll(Date.now() + launchSmokeTimeoutMs - 1000);
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
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      backgroundThrottling: !isLaunchSmoke
    }
  });

  if (isLaunchSmoke) {
    installLaunchSmoke(win);
  } else {
    win.once("ready-to-show", () => {
      win.show();
    });
  }

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
