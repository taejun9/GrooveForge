#!/usr/bin/env node

import { spawn } from "node:child_process";
import { constants, existsSync, readdirSync, readFileSync } from "node:fs";
import { access, cp, lstat, mkdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { macGuiLaunchAbortDetails, macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";
import { electronFrameworkDependencyReport } from "./desktop_bundle_dependency_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const dmgPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}.dmg`);
const dmgMount = path.join(packageRoot, "install-smoke-mount");
const installRoot = path.join(packageRoot, "install-smoke", "Applications");
const installedApp = path.join(installRoot, `${appName}.app`);
const installedExecutable = path.join(installedApp, "Contents", "MacOS", appName);
const installedAppRoot = path.join(installedApp, "Contents", "Resources", "app");
const resultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
// Keep the parent harness alive beyond the app's 640-second launch-smoke timeout.
const timeoutMs = 660000;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop install smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      ...options
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`${command} timed out after ${timeoutMs}ms\n${stdout}\n${stderr}`));
    }, timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      reject(error);
    });
    child.on("exit", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} failed with code ${code ?? "null"} signal ${signal ?? "null"}\n${stdout}\n${stderr}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function parseSmokeResult(output) {
  const line = output
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(resultPrefix));

  if (!line) {
    return null;
  }

  try {
    return JSON.parse(line.slice(resultPrefix.length));
  } catch (error) {
    fail(`Could not parse installed app launch smoke result JSON: ${error instanceof Error ? error.message : String(error)}`, line);
  }
}

async function detachMountIfNeeded() {
  if (!existsSync(dmgMount)) {
    return;
  }

  await runCommand("hdiutil", ["detach", dmgMount, "-force"]).catch(() => undefined);
}

async function readCodeSignatureDetails(appPath) {
  const display = await runCommand("codesign", ["--display", "--verbose=4", appPath]);
  return `${display.stdout}\n${display.stderr}`;
}

async function installFromDmg() {
  check(existsSync(dmgPath), "local GrooveForge DMG should exist; run npm run desktop:dmg-smoke first");
  if (existsSync(dmgPath)) {
    const dmgStats = await stat(dmgPath);
    check(dmgStats.size > 10000000, `local GrooveForge DMG should be substantial, got ${dmgStats.size} bytes`);
  }
  if (failures.length > 0) {
    fail("Install smoke preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  await detachMountIfNeeded();
  await rm(path.join(packageRoot, "install-smoke"), { force: true, recursive: true });
  await rm(dmgMount, { force: true, recursive: true });
  await mkdir(dmgMount, { recursive: true });
  await mkdir(installRoot, { recursive: true });
  await runCommand("hdiutil", ["attach", dmgPath, "-readonly", "-nobrowse", "-mountpoint", dmgMount]);

  try {
    const entries = readdirSync(dmgMount).filter((entry) => !entry.startsWith(".")).sort();
    check(entries.includes(`${appName}.app`), "mounted install DMG should contain GrooveForge.app");
    check(entries.includes("Applications"), "mounted install DMG should contain an Applications shortcut");
    const mountedApp = path.join(dmgMount, `${appName}.app`);
    const mountedStats = await lstat(mountedApp);
    check(mountedStats.isDirectory(), "mounted GrooveForge.app should be an app directory before install copy");
    await cp(mountedApp, installedApp, { recursive: true, verbatimSymlinks: true });
  } finally {
    await detachMountIfNeeded();
  }
}

async function checkInstalledApp() {
  const appStats = await lstat(installedApp).catch(() => null);
  check(appStats?.isDirectory(), "installed GrooveForge.app should exist in simulated Applications directory");
  await access(installedExecutable, constants.X_OK).catch(() => failures.push("installed GrooveForge executable should be executable"));

  const plist = existsSync(path.join(installedApp, "Contents", "Info.plist"))
    ? await readFile(path.join(installedApp, "Contents", "Info.plist"), "utf8")
    : "";
  check(plist.includes(`<string>${appName}</string>`), "installed app Info.plist should brand the app as GrooveForge");
  check(plist.includes(`<string>${bundleId}</string>`), `installed app Info.plist should use ${bundleId}`);
  check(plist.includes("<string>GrooveForge.icns</string>"), "installed app Info.plist should use GrooveForge.icns");
  check(existsSync(path.join(installedApp, "Contents", "Resources", "GrooveForge.icns")), "installed app should include GrooveForge.icns");
  check(!existsSync(path.join(installedApp, "Contents", "Resources", "electron.icns")), "installed app should not contain electron.icns");
  check(existsSync(path.join(installedAppRoot, "dist", "index.html")), "installed app should include packaged dist/index.html");
  check(existsSync(path.join(installedAppRoot, "dist-electron", "main.js")), "installed app should include packaged dist-electron/main.js");
  check(existsSync(path.join(installedAppRoot, "dist-electron", "preload.cjs")), "installed app should include packaged dist-electron/preload.cjs");
  check(
    existsSync(path.join(installedApp, "Contents", "Frameworks", "Squirrel.framework", "Squirrel")),
    "installed app should include Squirrel.framework/Squirrel for Electron @rpath loading"
  );

  const signatureDetails = await readCodeSignatureDetails(installedApp);
  check(signatureDetails.includes(`Identifier=${bundleId}`), `installed app ad-hoc signature should preserve ${bundleId}`);
  check(signatureDetails.includes("Signature=adhoc"), "installed app should retain ad-hoc signature");
  check(!signatureDetails.includes("Authority=Developer ID"), "installed app should not claim Developer ID authority");

  const frameworkDependencies = await electronFrameworkDependencyReport(installedApp, { root, timeoutMs });
  check(frameworkDependencies.otoolReady, "installed app Electron Framework dependency scan should run");
  check(frameworkDependencies.otoolLoadCommandsReady, "installed app Electron Framework rpath scan should run");
  check(frameworkDependencies.appExecutableLoadCommandsReady, "installed app executable rpath scan should run");
  check(frameworkDependencies.rpathScansReady, "installed app Electron dyld rpath scans should run");
  check(
    frameworkDependencies.allRequiredDependenciesReferenced,
    "installed app Electron Framework should reference Squirrel, ReactiveObjC, and Mantle through @rpath"
  );
  check(
    frameworkDependencies.allRequiredDependenciesPresent,
    "installed app should include every @rpath Electron runtime framework dependency, including Squirrel.framework/Squirrel"
  );
  check(
    frameworkDependencies.allRequiredDependenciesCodeSigned,
    "installed app Electron runtime framework dependencies should pass codesign --verify --strict before launch"
  );
  check(
    frameworkDependencies.allRequiredDependenciesSignatureCompatible,
    "installed app Electron runtime framework dependencies should be signature-compatible with the app bundle before launch"
  );
  check(
    frameworkDependencies.allRequiredDependenciesDyldLoadable,
    "installed app Electron runtime framework dependencies should be dyld-loadable through @rpath before launch"
  );
  return frameworkDependencies;
}

async function launchInstalledApp() {
  const blockDetails = macGuiLaunchBlockDetails("npm run desktop:install-smoke");
  if (blockDetails) {
    fail("Refusing to start installed Electron in a restricted macOS GUI context.", blockDetails);
  }

  const env = {
    ...process.env,
    GROOVEFORGE_DESKTOP_LAUNCH_SMOKE: "1",
    NO_COLOR: "1"
  };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.VITE_DEV_SERVER_URL;

  return await new Promise((resolve) => {
    const child = spawn(installedExecutable, [], {
      cwd: installedAppRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill("SIGTERM");
      fail("Timed out waiting for installed Electron app launch smoke to exit.", `${stdout}\n${stderr}`);
    }, timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      fail(`Could not start installed Electron app: ${error.message}`);
    });
    child.on("exit", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      const combinedOutput = `${stdout}\n${stderr}`;
      const result = parseSmokeResult(combinedOutput);
      if (!result) {
        fail(
          `Installed app exited without a launch smoke result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
          macGuiLaunchAbortDetails("npm run desktop:install-smoke", { code, signal, output: combinedOutput })
        );
      }
      if (code !== 0 || result.ok !== true) {
        fail(
          `installed app launch smoke returned a failing result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
          JSON.stringify(result, null, 2)
        );
      }
      resolve(result);
    });
  });
}

function checkLaunchResult(result) {
  check(result?.evidence?.title === appName, "installed app document title should be GrooveForge");
  check(result?.evidence?.appKind === "desktop", "installed app preload bridge should expose appKind desktop");
  check(result?.evidence?.hasSaveProject === true, "installed app preload bridge should expose saveProject");
  check(result?.evidence?.hasOpenProject === true, "installed app preload bridge should expose openProject");
  check(result?.evidence?.rootChildCount > 0, "installed app should mount React under #root");
  check(result?.evidence?.samplingTextPresent === false, "installed app first-run surface should not expose sampling-first language");
  check(result?.evidence?.visual?.pngBytes > 50000, "installed app screenshot PNG should be substantial");
  check(result?.evidence?.visual?.uniqueSampledColors >= 24, "installed app screenshot should have visible color diversity");
}

if (process.platform !== "darwin") {
  console.log("GrooveForge desktop install smoke skipped.");
  console.log(`- Scope: macOS DMG install-path smoke is not available on ${process.platform}`);
  process.exit(0);
}

await installFromDmg();
const frameworkDependencies = await checkInstalledApp();
if (failures.length > 0) {
  fail("Installed app validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const result = await launchInstalledApp();
checkLaunchResult(result);
if (failures.length > 0) {
  fail("Installed app launch evidence validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge desktop install smoke passed.");
console.log("- Scope: local DMG mount, simulated Applications copy, ad-hoc signature retention, and installed app launch smoke");
console.log(`- Installed app: ${path.relative(root, installedApp)}`);
console.log(
  `- Framework dependencies: ${frameworkDependencies.presentDependencyCount}/${frameworkDependencies.requiredDependencyCount} present, ${frameworkDependencies.signatureVerifiedDependencyCount}/${frameworkDependencies.requiredDependencyCount} code-signed, ${frameworkDependencies.signatureCompatibleDependencyCount}/${frameworkDependencies.requiredDependencyCount} signature-compatible`
);
console.log(
  `- Dyld framework loadability: ${frameworkDependencies.dyldLoadableDependencyCount}/${frameworkDependencies.requiredDependencyCount} loadable via ${frameworkDependencies.rpathCount} dyld rpaths`
);
console.log(`- Visual: ${result.evidence.visual.width}x${result.evidence.visual.height}, ${result.evidence.visual.pngBytes} PNG bytes, ${result.evidence.visual.uniqueSampledColors} sampled colors`);
console.log("- Not claimed: real /Applications install, Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
