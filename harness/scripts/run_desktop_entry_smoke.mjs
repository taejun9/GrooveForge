#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function readText(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${relativePath} is missing`);
    return "";
  }
  return readFileSync(filePath, "utf8");
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function checkIncludes(text, needle, label) {
  check(text.includes(needle), `${label} should include ${needle}`);
}

function checkBuiltArtifacts() {
  check(existsSync(path.join(root, "dist/index.html")), "dist/index.html is missing; run npm run build before desktop smoke");
  check(
    existsSync(path.join(root, "dist-electron/main.js")),
    "dist-electron/main.js is missing; run npm run build before desktop smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron/preload.js")),
    "dist-electron/preload.js is missing; run npm run build before desktop smoke"
  );

  const assetDir = path.join(root, "dist/assets");
  if (!existsSync(assetDir)) {
    failures.push("dist/assets is missing; renderer assets were not built");
    return;
  }

  const assets = readdirSync(assetDir);
  check(assets.some((asset) => asset.endsWith(".js")), "dist/assets should contain renderer JavaScript chunks");
  check(assets.some((asset) => asset.endsWith(".css")), "dist/assets should contain renderer CSS");
  check(
    assets.some((asset) => asset.includes("workstation-app-quick-actions")),
    "dist/assets should contain the workstation Quick Actions chunk"
  );
}

function checkPackageScripts() {
  const packageJson = readJson("package.json");
  if (!packageJson) {
    return;
  }

  check(packageJson.main === "dist-electron/main.js", "package.json main should point at dist-electron/main.js");
  checkIncludes(packageJson.description ?? "", "desktop beat workstation", "package.json description");
  checkIncludes(packageJson.scripts?.build ?? "", "tsc -p tsconfig.electron.json", "package.json build script");
  checkIncludes(packageJson.scripts?.desktop ?? "", "electron .", "package.json desktop script");
  checkIncludes(packageJson.scripts?.["desktop:smoke"] ?? "", "run_desktop_entry_smoke.mjs", "package.json desktop:smoke script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run build", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:smoke", "package.json verify script");
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run build") < (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:smoke"),
    "package.json verify should run desktop:smoke after npm run build"
  );
}

function checkElectronMainContract() {
  const source = readText("electron/main.ts");
  const built = readText("dist-electron/main.js");
  const label = "electron/main.ts";

  checkIncludes(source, "const isDev = process.env.VITE_DEV_SERVER_URL !== undefined", label);
  checkIncludes(source, 'preload: path.join(__dirname, "preload.js")', label);
  checkIncludes(source, "nodeIntegration: false", label);
  checkIncludes(source, "contextIsolation: true", label);
  checkIncludes(source, "sandbox: true", label);
  checkIncludes(source, 'void win.loadFile(path.join(__dirname, "../dist/index.html"))', label);
  checkIncludes(source, "win.webContents.setWindowOpenHandler", label);
  checkIncludes(source, 'return { action: "deny" }', label);
  checkIncludes(source, "registerProjectFileHandlers();", label);
  checkIncludes(source, "Menu.setApplicationMenu(createNativeCommandMenu())", label);
  checkIncludes(source, "createWindow();", label);
  checkIncludes(source, 'label: "GrooveForge Local Workstation"', label);
  checkIncludes(source, 'filters: projectFilters', label);
  checkIncludes(source, 'properties: ["openFile"]', label);
  checkIncludes(built, "../dist/index.html", "dist-electron/main.js");
  checkIncludes(built, "preload.js", "dist-electron/main.js");
}

function checkPreloadContract() {
  const source = readText("electron/preload.ts");
  const built = readText("dist-electron/preload.js");
  const label = "electron/preload.ts";
  const expectedCommands = [
    "open-project",
    "save-project",
    "undo",
    "redo",
    "quick-actions",
    "command-reference",
    "toggle-playback",
    "delete-selected-event"
  ];

  checkIncludes(source, 'contextBridge.exposeInMainWorld("grooveforge"', label);
  checkIncludes(source, 'appKind: "desktop"', label);
  checkIncludes(source, 'ipcRenderer.invoke("grooveforge:save-project"', label);
  checkIncludes(source, 'ipcRenderer.invoke("grooveforge:open-project")', label);
  checkIncludes(source, 'ipcRenderer.on("grooveforge:menu-command"', label);
  checkIncludes(source, "isNativeMenuCommand(command)", label);
  checkIncludes(source, 'ipcRenderer.removeListener("grooveforge:menu-command", listener)', label);

  for (const command of expectedCommands) {
    checkIncludes(source, `"${command}"`, label);
  }

  checkIncludes(built, "grooveforge", "dist-electron/preload.js");
  checkIncludes(built, "desktop", "dist-electron/preload.js");
  checkIncludes(built, "grooveforge:save-project", "dist-electron/preload.js");
  checkIncludes(built, "grooveforge:open-project", "dist-electron/preload.js");
  checkIncludes(built, "grooveforge:menu-command", "dist-electron/preload.js");
}

function checkRendererEntryContract() {
  const index = readText("dist/index.html");
  checkIncludes(index, '<div id="root"></div>', "dist/index.html");
  check(index.includes("/assets/") || index.includes("./assets/"), "dist/index.html should reference built renderer assets");
}

checkBuiltArtifacts();
checkPackageScripts();
checkElectronMainContract();
checkPreloadContract();
checkRendererEntryContract();

if (failures.length > 0) {
  console.error("GrooveForge desktop entry smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GrooveForge desktop entry smoke passed.");
console.log("- Scope: Electron production entry, preload bridge, renderer artifact contract");
console.log("- Entry: dist-electron/main.js -> dist/index.html");
console.log("- Bridge: context-isolated GrooveForge desktop API with validated native menu commands");
