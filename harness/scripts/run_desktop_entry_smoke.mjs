#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isMacAppKitAbort, isMacDyldFrameworkAbort, macGuiLaunchAbortDetails, macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];
const expectedNativeMenuCommands = [
  "open-project",
  "save-project",
  "undo",
  "redo",
  "quick-actions",
  "command-reference",
  "toggle-playback",
  "delete-selected-event"
];
const expectedRendererMenuHandlers = {
  "open-project": "void handleOpenProject();",
  "save-project": "void handleSaveProject();",
  undo: "undoProject();",
  redo: "redoProject();",
  "quick-actions": "openQuickActions();",
  "command-reference": "openCommandReference();",
  "toggle-playback": "togglePlayback();",
  "delete-selected-event": "deleteSelectedEvent();"
};

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

function textBetween(text, startNeedle, endNeedle, label) {
  const start = text.indexOf(startNeedle);
  if (start < 0) {
    failures.push(`${label} should include ${startNeedle}`);
    return "";
  }

  const end = text.indexOf(endNeedle, start);
  if (end < 0) {
    failures.push(`${label} should include ${endNeedle} after ${startNeedle}`);
    return text.slice(start);
  }

  return text.slice(start, end);
}

function checkBuiltArtifacts() {
  check(existsSync(path.join(root, "dist/index.html")), "dist/index.html is missing; run npm run build before desktop smoke");
  check(
    existsSync(path.join(root, "dist-electron/main.js")),
    "dist-electron/main.js is missing; run npm run build before desktop smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron/updateFeedConfig.js")),
    "dist-electron/updateFeedConfig.js is missing; run npm run build before desktop smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron/preload.cjs")),
    "dist-electron/preload.cjs is missing; run npm run build before desktop smoke"
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
  checkIncludes(packageJson.scripts?.desktop ?? "", "run_desktop_app.mjs", "package.json desktop script");
  checkIncludes(packageJson.scripts?.["desktop:smoke"] ?? "", "run_desktop_entry_smoke.mjs", "package.json desktop:smoke script");
  checkIncludes(
    packageJson.scripts?.["desktop:project-io-smoke"] ?? "",
    "run_desktop_project_io_smoke.mjs",
    "package.json desktop:project-io-smoke script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:packaged-project-io-smoke"] ?? "",
    "run_desktop_packaged_project_io_smoke.mjs",
    "package.json desktop:packaged-project-io-smoke script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:installed-project-io-smoke"] ?? "",
    "run_desktop_installed_project_io_smoke.mjs",
    "package.json desktop:installed-project-io-smoke script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:pkg-payload-smoke"] ?? "",
    "run_desktop_pkg_payload_smoke.mjs",
    "package.json desktop:pkg-payload-smoke script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:pkg-payload-project-io-smoke"] ?? "",
    "run_desktop_pkg_payload_project_io_smoke.mjs",
    "package.json desktop:pkg-payload-project-io-smoke script"
  );
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run build", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:project-io-smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:packaged-project-io-smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:pkg-payload-smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:pkg-payload-project-io-smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:installed-project-io-smoke", "package.json verify script");
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run build") < (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:smoke"),
    "package.json verify should run desktop:smoke after npm run build"
  );
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:launch-smoke") <
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:project-io-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:project-io-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:package-smoke"),
    "package.json verify should run desktop:project-io-smoke after launch smoke and before package smoke"
  );
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:package-smoke") <
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:packaged-project-io-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:packaged-project-io-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:adhoc-sign-smoke"),
    "package.json verify should run desktop:packaged-project-io-smoke after package smoke and before the dedicated hardened-runtime ad-hoc signing smoke"
  );
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:pkg-smoke") <
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:pkg-payload-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:pkg-payload-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:pkg-payload-project-io-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:pkg-payload-project-io-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:install-smoke"),
    "package.json verify should run desktop:pkg-payload-smoke and desktop:pkg-payload-project-io-smoke after pkg smoke and before install smoke"
  );
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:install-smoke") <
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:installed-project-io-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:installed-project-io-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:gatekeeper-readiness-smoke"),
    "package.json verify should run desktop:installed-project-io-smoke after install smoke and before Gatekeeper readiness"
  );
}

function checkDesktopGuiLaunchGuardContract() {
  const guardSource = readText("harness/scripts/desktop_gui_launch_guard.mjs");
  const bundleDependencyGuardSource = readText("harness/scripts/desktop_bundle_dependency_guard.mjs");
  const desktopAppSource = readText("harness/scripts/run_desktop_app.mjs");
  const launchSmokeSource = readText("harness/scripts/run_desktop_launch_smoke.mjs");
  const projectIoSmokeSource = readText("harness/scripts/run_desktop_project_io_smoke.mjs");
  const packageSmokeSource = readText("harness/scripts/run_desktop_package_smoke.mjs");
  const packagedProjectIoSmokeSource = readText("harness/scripts/run_desktop_packaged_project_io_smoke.mjs");
  const adhocSignSmokeSource = readText("harness/scripts/run_desktop_adhoc_sign_smoke.mjs");
  const dmgSmokeSource = readText("harness/scripts/run_desktop_dmg_smoke.mjs");
  const pkgPayloadSmokeSource = readText("harness/scripts/run_desktop_pkg_payload_smoke.mjs");
  const pkgPayloadProjectIoSmokeSource = readText("harness/scripts/run_desktop_pkg_payload_project_io_smoke.mjs");
  const installSmokeSource = readText("harness/scripts/run_desktop_install_smoke.mjs");
  const installedProjectIoSmokeSource = readText("harness/scripts/run_desktop_installed_project_io_smoke.mjs");

  checkIncludes(guardSource, "CODEX_SANDBOX", "desktop GUI launch guard");
  checkIncludes(guardSource, "isMacAppKitAbort", "desktop GUI launch guard");
  checkIncludes(guardSource, "macGuiLaunchAbortDetails", "desktop GUI launch guard");
  checkIncludes(guardSource, "Electron GUI launch blocked before macOS AppKit registration.", "desktop GUI launch guard");
  checkIncludes(guardSource, "macOS Crash Reporter logs", "desktop GUI launch guard");
  checkIncludes(guardSource, "GROOVEFORGE_ALLOW_RESTRICTED_GUI_ELECTRON", "desktop GUI launch guard");
  checkIncludes(guardSource, "com\\.openai\\.codex", "desktop GUI launch guard");
  checkIncludes(guardSource, "Namespace SIGNAL,\\s*Code 6", "desktop GUI launch guard");
  checkIncludes(guardSource, "code === 6", "desktop GUI launch guard");
  checkIncludes(bundleDependencyGuardSource, "parseOtoolRpaths", "desktop bundle dependency guard");
  checkIncludes(bundleDependencyGuardSource, "dyldCandidateRows", "desktop bundle dependency guard");
  checkIncludes(bundleDependencyGuardSource, "appExecutableLoadCommandsReady", "desktop bundle dependency guard");
  checkIncludes(bundleDependencyGuardSource, "signatureCompatibilityEvidence", "desktop bundle dependency guard");
  checkIncludes(bundleDependencyGuardSource, "allRequiredDependenciesSignatureCompatible", "desktop bundle dependency guard");
  checkIncludes(bundleDependencyGuardSource, "allRequiredDependenciesDyldLoadable", "desktop bundle dependency guard");
  checkIncludes(desktopAppSource, "isMacAppKitAbort({ code, signal })", "harness/scripts/run_desktop_app.mjs");
  checkIncludes(desktopAppSource, "macGuiLaunchAbortDetails(\"npm run desktop\"", "harness/scripts/run_desktop_app.mjs");
  checkIncludes(desktopAppSource, "macGuiLaunchBlockDetails(\"npm run desktop\")", "harness/scripts/run_desktop_app.mjs");
  checkIncludes(launchSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:launch-smoke\")", "harness/scripts/run_desktop_launch_smoke.mjs");
  checkIncludes(launchSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:launch-smoke\"", "harness/scripts/run_desktop_launch_smoke.mjs");
  checkIncludes(projectIoSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:project-io-smoke\")", "harness/scripts/run_desktop_project_io_smoke.mjs");
  checkIncludes(projectIoSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:project-io-smoke\"", "harness/scripts/run_desktop_project_io_smoke.mjs");
  checkIncludes(packageSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:package-smoke\")", "harness/scripts/run_desktop_package_smoke.mjs");
  checkIncludes(packageSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:package-smoke\"", "harness/scripts/run_desktop_package_smoke.mjs");
  checkIncludes(packageSmokeSource, "allRequiredDependenciesSignatureCompatible", "harness/scripts/run_desktop_package_smoke.mjs");
  checkIncludes(packageSmokeSource, "allRequiredDependenciesDyldLoadable", "harness/scripts/run_desktop_package_smoke.mjs");
  checkIncludes(
    packagedProjectIoSmokeSource,
    "macGuiLaunchBlockDetails(\"npm run desktop:packaged-project-io-smoke\")",
    "harness/scripts/run_desktop_packaged_project_io_smoke.mjs"
  );
  checkIncludes(
    packagedProjectIoSmokeSource,
    "macGuiLaunchAbortDetails(\"npm run desktop:packaged-project-io-smoke\"",
    "harness/scripts/run_desktop_packaged_project_io_smoke.mjs"
  );
  checkIncludes(
    packagedProjectIoSmokeSource,
    "allRequiredDependenciesSignatureCompatible",
    "harness/scripts/run_desktop_packaged_project_io_smoke.mjs"
  );
  checkIncludes(adhocSignSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:adhoc-sign-smoke\")", "harness/scripts/run_desktop_adhoc_sign_smoke.mjs");
  checkIncludes(adhocSignSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:adhoc-sign-smoke\"", "harness/scripts/run_desktop_adhoc_sign_smoke.mjs");
  checkIncludes(adhocSignSmokeSource, "allRequiredDependenciesSignatureCompatible", "harness/scripts/run_desktop_adhoc_sign_smoke.mjs");
  checkIncludes(dmgSmokeSource, "electronFrameworkDependencyReport", "harness/scripts/run_desktop_dmg_smoke.mjs");
  checkIncludes(dmgSmokeSource, "allRequiredDependenciesSignatureCompatible", "harness/scripts/run_desktop_dmg_smoke.mjs");
  checkIncludes(pkgPayloadSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:pkg-payload-smoke\")", "harness/scripts/run_desktop_pkg_payload_smoke.mjs");
  checkIncludes(pkgPayloadSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:pkg-payload-smoke\"", "harness/scripts/run_desktop_pkg_payload_smoke.mjs");
  checkIncludes(pkgPayloadSmokeSource, "allRequiredDependenciesSignatureCompatible", "harness/scripts/run_desktop_pkg_payload_smoke.mjs");
  checkIncludes(pkgPayloadSmokeSource, "allRequiredDependenciesDyldLoadable", "harness/scripts/run_desktop_pkg_payload_smoke.mjs");
  checkIncludes(
    pkgPayloadProjectIoSmokeSource,
    "macGuiLaunchBlockDetails(\"npm run desktop:pkg-payload-project-io-smoke\")",
    "harness/scripts/run_desktop_pkg_payload_project_io_smoke.mjs"
  );
  checkIncludes(
    pkgPayloadProjectIoSmokeSource,
    "macGuiLaunchAbortDetails(\"npm run desktop:pkg-payload-project-io-smoke\"",
    "harness/scripts/run_desktop_pkg_payload_project_io_smoke.mjs"
  );
  checkIncludes(installSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:install-smoke\")", "harness/scripts/run_desktop_install_smoke.mjs");
  checkIncludes(installSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:install-smoke\"", "harness/scripts/run_desktop_install_smoke.mjs");
  checkIncludes(installSmokeSource, "allRequiredDependenciesSignatureCompatible", "harness/scripts/run_desktop_install_smoke.mjs");
  checkIncludes(installSmokeSource, "allRequiredDependenciesDyldLoadable", "harness/scripts/run_desktop_install_smoke.mjs");
  checkIncludes(
    installedProjectIoSmokeSource,
    "macGuiLaunchBlockDetails(\"npm run desktop:installed-project-io-smoke\")",
    "harness/scripts/run_desktop_installed_project_io_smoke.mjs"
  );
  checkIncludes(
    installedProjectIoSmokeSource,
    "macGuiLaunchAbortDetails(\"npm run desktop:installed-project-io-smoke\"",
    "harness/scripts/run_desktop_installed_project_io_smoke.mjs"
  );
  checkIncludes(
    installedProjectIoSmokeSource,
    "allRequiredDependenciesSignatureCompatible",
    "harness/scripts/run_desktop_installed_project_io_smoke.mjs"
  );

  const blocked = macGuiLaunchBlockDetails("npm run desktop:launch-smoke", { CODEX_SANDBOX: "seatbelt" }, "darwin");
  check(Boolean(blocked), "desktop GUI launch guard should block Electron under macOS CODEX_SANDBOX");
  checkIncludes(blocked ?? "", "CODEX_SANDBOX=seatbelt", "desktop GUI launch guard blocked details");
  checkIncludes(blocked ?? "", "Electron SIGABRT / exit code 6 / Abort trap: 6", "desktop GUI launch guard blocked details");
  check(
    isMacAppKitAbort({ signal: "SIGABRT" }) === true,
    "desktop GUI launch abort classifier should recognize macOS SIGABRT launch reports"
  );
  check(
    isMacAppKitAbort({ signal: null, output: "Thread 0 Crashed:: _RegisterApplication com.openai.codex" }) === true,
    "desktop GUI launch abort classifier should recognize AppKit crash report text"
  );
  const attachedCrashReportShape = [
    "Process: Electron [3070]",
    "Identifier: com.github.Electron",
    "Exception Type: EXC_CRASH (SIGABRT)",
    "Termination Reason: Namespace SIGNAL, Code 6, Abort trap: 6",
    "Application Specific Information:",
    "abort() called",
    "Thread 0 Crashed:: Dispatch queue: com.apple.main-thread",
    "___RegisterApplication_block_invoke",
    "_RegisterApplication",
    "GetCurrentProcess",
    "-[NSApplication init]",
    "Responsible Process: Codex",
    "Coalition: com.openai.codex"
  ].join("\n");
  check(
    isMacAppKitAbort({ code: 6, signal: null, output: attachedCrashReportShape }) === true,
    "desktop GUI launch abort classifier should recognize attached exit-code-6 Crash Reporter shape"
  );
  check(
    isMacAppKitAbort({ code: 0, signal: null, output: "AppKit loaded normally" }) === false,
    "desktop GUI launch abort classifier should not treat non-abort AppKit output as a crash"
  );
  const attachedSquirrelDyldReportShape = [
    "Process: GrooveForge [15208]",
    "Identifier: app.grooveforge.desktop",
    "Exception Type: EXC_CRASH (SIGABRT)",
    "Termination Reason: Namespace DYLD, Code 1, Library missing",
    "Library not loaded: @rpath/Squirrel.framework/Squirrel",
    "Referenced from: /Users/USER/*/GrooveForge.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Electron Framework",
    "Reason: tried: '/Users/USER/GrooveForge.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Libraries/Squirrel.framework/Squirrel' (no such file), '/Users/USER/GrooveForge.app/Contents/Frameworks/Squirrel.framework/Squirrel' (code signature invalid)",
    "fatalDyldError: 1"
  ].join("\n");
  check(
    isMacDyldFrameworkAbort({ output: attachedSquirrelDyldReportShape }) === true,
    "desktop GUI launch abort classifier should recognize attached Squirrel dyld framework report shape"
  );
  check(
    isMacDyldFrameworkAbort({ output: "Library not loaded: @rpath/Other.framework/Other" }) === false,
    "desktop GUI launch abort classifier should not treat unrelated dyld output as an Electron runtime framework crash"
  );
  const abortDetails = macGuiLaunchAbortDetails("npm run desktop:launch-smoke", {
    code: 6,
    signal: null,
    output: attachedCrashReportShape
  });
  checkIncludes(abortDetails, "Diagnostic: Electron aborted before GrooveForge emitted launch evidence.", "desktop GUI launch abort details");
  checkIncludes(abortDetails, "Crash signature: Electron SIGABRT / exit code 6 / Abort trap: 6", "desktop GUI launch abort details");
  checkIncludes(abortDetails, "approved unsandboxed GUI/AppKit process access", "desktop GUI launch abort details");
  const signalAbortDetails = macGuiLaunchAbortDetails("npm run desktop:launch-smoke", {
    signal: "SIGABRT",
    output: "Application Specific Information: abort() called"
  });
  checkIncludes(signalAbortDetails, "Crash signature: Electron SIGABRT / exit code 6 / Abort trap: 6", "desktop GUI launch signal abort details");
  const squirrelDyldDetails = macGuiLaunchAbortDetails("npm run desktop:package-smoke", {
    code: 1,
    signal: null,
    output: attachedSquirrelDyldReportShape
  });
  checkIncludes(squirrelDyldDetails, "Diagnostic: Electron failed during macOS dyld framework loading", "desktop GUI launch dyld abort details");
  checkIncludes(squirrelDyldDetails, "@rpath/Squirrel.framework/Squirrel", "desktop GUI launch dyld abort details");
  checkIncludes(squirrelDyldDetails, "strict code signatures", "desktop GUI launch dyld abort details");
  check(
    macGuiLaunchBlockDetails("npm run desktop:launch-smoke", {}, "darwin") === null,
    "desktop GUI launch guard should allow normal macOS GUI launches"
  );
  check(
    macGuiLaunchBlockDetails("npm run desktop:launch-smoke", { CODEX_SANDBOX: "seatbelt" }, "linux") === null,
    "desktop GUI launch guard should not block non-macOS launches"
  );
  check(
    macGuiLaunchBlockDetails(
      "npm run desktop:launch-smoke",
      { CODEX_SANDBOX: "seatbelt", GROOVEFORGE_ALLOW_RESTRICTED_GUI_ELECTRON: "1" },
      "darwin"
    ) === null,
    "desktop GUI launch guard should allow explicit restricted-launch reproduction override"
  );
}

function checkElectronMainContract() {
  const source = readText("electron/main.ts");
  const updateFeedConfigSource = readText("electron/updateFeedConfig.ts");
  const updateFeedConfigBuilt = readText("dist-electron/updateFeedConfig.js");
  const built = readText("dist-electron/main.js");
  const label = "electron/main.ts";

  checkIncludes(source, "const isDev = process.env.VITE_DEV_SERVER_URL !== undefined", label);
  checkIncludes(source, 'preload: path.join(__dirname, "preload.cjs")', label);
  checkIncludes(source, "nodeIntegration: false", label);
  checkIncludes(source, "contextIsolation: true", label);
  checkIncludes(source, "sandbox: true", label);
  checkIncludes(source, "backgroundThrottling: !(isLaunchSmoke || isProjectIoSmoke)", label);
  checkIncludes(source, "paintWhenInitiallyHidden: true", label);
  checkIncludes(source, 'void win.loadFile(path.join(__dirname, "../dist/index.html"))', label);
  checkIncludes(source, "win.webContents.setWindowOpenHandler", label);
  checkIncludes(source, 'return { action: "deny" }', label);
  checkIncludes(source, "registerProjectFileHandlers();", label);
  checkIncludes(source, "Menu.setApplicationMenu(createNativeCommandMenu())", label);
  checkIncludes(source, "createWindow();", label);
  checkIncludes(source, "autoUpdater", label);
  checkIncludes(source, "resolveUpdateFeedConfig", label);
  checkIncludes(source, 'label: "Check for Updates..."', label);
  checkIncludes(source, "GROOVEFORGE_UPDATE_FEED_URL", label);
  checkIncludes(source, "GROOVEFORGE_UPDATE_CHANNEL", label);
  checkIncludes(source, "autoUpdater.setFeedURL", label);
  checkIncludes(source, "autoUpdater.checkForUpdates()", label);
  checkIncludes(source, 'autoUpdater.on("update-downloaded"', label);
  checkIncludes(source, "autoUpdater.quitAndInstall()", label);
  checkIncludes(source, "No update feed was contacted.", label);
  checkIncludes(updateFeedConfigSource, "updateFeedUrlKeys", "electron/updateFeedConfig.ts");
  checkIncludes(updateFeedConfigSource, "redactUpdateFeedConfig", "electron/updateFeedConfig.ts");
  checkIncludes(updateFeedConfigSource, "Update feed URL must use HTTPS for release checks.", "electron/updateFeedConfig.ts");
  checkIncludes(updateFeedConfigSource, "Update feed URL must not include credentials.", "electron/updateFeedConfig.ts");
  checkIncludes(updateFeedConfigSource, "Update release channel must use 1-32 lowercase letters", "electron/updateFeedConfig.ts");
  checkIncludes(updateFeedConfigBuilt, "updateFeedUrlKeys", "dist-electron/updateFeedConfig.js");
  checkIncludes(updateFeedConfigBuilt, "redactUpdateFeedConfig", "dist-electron/updateFeedConfig.js");
  checkIncludes(source, 'label: "GrooveForge Local Workstation"', label);
  checkIncludes(source, 'filters: projectFilters', label);
  checkIncludes(source, 'properties: ["openFile"]', label);
  for (const command of expectedNativeMenuCommands) {
    checkIncludes(source, `"${command}"`, label);
  }
  checkIncludes(built, "../dist/index.html", "dist-electron/main.js");
  checkIncludes(built, "preload.cjs", "dist-electron/main.js");
}

function checkPreloadContract() {
  const source = readText("electron/preload.cts");
  const built = readText("dist-electron/preload.cjs");
  const label = "electron/preload.cts";

  checkIncludes(source, 'contextBridge.exposeInMainWorld("grooveforge"', label);
  checkIncludes(source, 'appKind: "desktop"', label);
  checkIncludes(source, 'ipcRenderer.invoke("grooveforge:save-project"', label);
  checkIncludes(source, 'ipcRenderer.invoke("grooveforge:open-project")', label);
  checkIncludes(source, 'ipcRenderer.on("grooveforge:menu-command"', label);
  checkIncludes(source, "isNativeMenuCommand(command)", label);
  checkIncludes(source, 'ipcRenderer.removeListener("grooveforge:menu-command", listener)', label);

  for (const command of expectedNativeMenuCommands) {
    checkIncludes(source, `"${command}"`, label);
  }

  checkIncludes(built, "grooveforge", "dist-electron/preload.cjs");
  checkIncludes(built, "desktop", "dist-electron/preload.cjs");
  checkIncludes(built, "grooveforge:save-project", "dist-electron/preload.cjs");
  checkIncludes(built, "grooveforge:open-project", "dist-electron/preload.cjs");
  checkIncludes(built, "grooveforge:menu-command", "dist-electron/preload.cjs");
}

function checkRendererNativeMenuContract() {
  const declarations = readText("src/vite-env.d.ts");
  const appSource = readText("src/ui/App.tsx");
  const typeLabel = "src/vite-env.d.ts";
  const appLabel = "src/ui/App.tsx";
  const nativeMenuHandler = textBetween(
    appSource,
    "function handleNativeMenuCommand(command: NativeMenuCommand): void {",
    "function updateProject",
    appLabel
  );

  checkIncludes(declarations, "type NativeMenuCommand =", typeLabel);
  checkIncludes(declarations, "onMenuCommand?: (callback: (command: NativeMenuCommand) => void) => () => void;", typeLabel);
  checkIncludes(appSource, "window.grooveforge?.onMenuCommand?.(handleNativeMenuCommand)", appLabel);

  for (const command of expectedNativeMenuCommands) {
    checkIncludes(declarations, `| "${command}"`, typeLabel);
    checkIncludes(nativeMenuHandler, `case "${command}":`, `${appLabel} handleNativeMenuCommand`);
    checkIncludes(nativeMenuHandler, expectedRendererMenuHandlers[command], `${appLabel} handleNativeMenuCommand`);
  }
}

function checkRendererEntryContract() {
  const index = readText("dist/index.html");
  checkIncludes(index, '<div id="root"></div>', "dist/index.html");
  check(index.includes("./assets/"), "dist/index.html should reference built renderer assets with file-load-safe relative paths");
  check(!index.includes('src="/assets/') && !index.includes('href="/assets/'), "dist/index.html should not use root-relative asset paths");
}

checkBuiltArtifacts();
checkPackageScripts();
checkDesktopGuiLaunchGuardContract();
checkElectronMainContract();
checkPreloadContract();
checkRendererNativeMenuContract();
checkRendererEntryContract();

if (failures.length > 0) {
  console.error("GrooveForge desktop entry smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GrooveForge desktop entry smoke passed.");
console.log("- Scope: Electron production entry, preload bridge, renderer menu handler, renderer artifact contract, and restricted GUI launch guard");
console.log("- Entry: dist-electron/main.js -> dist/index.html");
console.log("- Bridge: context-isolated GrooveForge desktop API with validated native menu commands");
