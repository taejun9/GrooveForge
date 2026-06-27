#!/usr/bin/env node

import { spawn } from "node:child_process";
import { constants, existsSync, readFileSync, readdirSync } from "node:fs";
import { access, cp, mkdir, readFile, rm, rename, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const resultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
const timeoutMs = 90000;
const outputRoot = path.join(root, "build", "desktop", `${appName}-${process.platform}-${process.arch}`);
const packagedApp = path.join(outputRoot, `${appName}.app`);
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop package smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function readJson(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${relativePath} is missing`);
    return null;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
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
    fail(`Could not parse packaged launch smoke result JSON: ${error instanceof Error ? error.message : String(error)}`, line);
  }
}

function findAncestorApp(candidate) {
  let current = path.resolve(candidate);
  while (current !== path.dirname(current)) {
    if (current.endsWith(".app") && existsSync(path.join(current, "Contents", "Info.plist"))) {
      return current;
    }
    current = path.dirname(current);
  }
  return null;
}

function resolveElectronAppTemplate() {
  const candidates = [];

  try {
    const electronBinary = require("electron");
    if (typeof electronBinary === "string") {
      candidates.push(electronBinary);
    }
  } catch {
    // Fall through to package-root resolution.
  }

  try {
    const electronPackage = require.resolve("electron/package.json");
    candidates.push(path.join(path.dirname(electronPackage), "dist", "Electron.app"));
  } catch {
    // Fall through to local path candidates.
  }

  candidates.push(path.join(root, "node_modules", "electron", "dist", "Electron.app"));
  candidates.push(path.join(root, "..", "node_modules", "electron", "dist", "Electron.app"));

  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, "Contents", "Info.plist"))) {
      return candidate;
    }

    const appPath = findAncestorApp(candidate);
    if (appPath) {
      return appPath;
    }
  }

  return null;
}

function checkBuiltArtifacts() {
  check(existsSync(path.join(root, "dist", "index.html")), "dist/index.html is missing; run npm run build before desktop package smoke");
  check(
    existsSync(path.join(root, "dist-electron", "main.js")),
    "dist-electron/main.js is missing; run npm run build before desktop package smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron", "preload.cjs")),
    "dist-electron/preload.cjs is missing; run npm run build before desktop package smoke"
  );

  const assetDir = path.join(root, "dist", "assets");
  if (!existsSync(assetDir)) {
    failures.push("dist/assets is missing; renderer assets were not built");
    return;
  }

  const assets = readdirSync(assetDir);
  check(assets.some((asset) => asset.endsWith(".js")), "dist/assets should contain renderer JavaScript chunks");
  check(assets.some((asset) => asset.endsWith(".css")), "dist/assets should contain renderer CSS");
}

function setPlistString(plist, key, value) {
  const pattern = new RegExp(`(<key>${key}</key>\\s*<string>)([^<]*)(</string>)`);
  if (!pattern.test(plist)) {
    failures.push(`Info.plist should include ${key}`);
    return plist;
  }
  return plist.replace(pattern, `$1${value}$3`);
}

function removePlistStringKey(plist, key) {
  return plist.replace(new RegExp(`\\s*<key>${key}</key>\\s*<string>[\\s\\S]*?</string>`, "g"), "");
}

function removePlistDictKey(plist, key) {
  return plist.replace(new RegExp(`\\s*<key>${key}</key>\\s*<dict>[\\s\\S]*?\\s*</dict>`, "g"), "");
}

async function writeGrooveForgePlist(infoPlistPath, version) {
  let plist = await readFile(infoPlistPath, "utf8");
  plist = setPlistString(plist, "CFBundleDisplayName", appName);
  plist = setPlistString(plist, "CFBundleExecutable", appName);
  plist = setPlistString(plist, "CFBundleIdentifier", bundleId);
  plist = setPlistString(plist, "CFBundleName", appName);
  plist = setPlistString(plist, "CFBundleShortVersionString", version);
  plist = setPlistString(plist, "CFBundleVersion", version);
  plist = setPlistString(plist, "LSApplicationCategoryType", "public.app-category.music");

  for (const key of [
    "NSAudioCaptureUsageDescription",
    "NSBluetoothAlwaysUsageDescription",
    "NSBluetoothPeripheralUsageDescription",
    "NSCameraUsageDescription",
    "NSMicrophoneUsageDescription"
  ]) {
    plist = removePlistStringKey(plist, key);
  }
  plist = removePlistDictKey(plist, "NSAppTransportSecurity");

  await writeFile(infoPlistPath, plist, "utf8");
}

async function writePackagedPackageJson(appRoot, packageJson) {
  const minimalPackageJson = {
    name: packageJson.name,
    productName: appName,
    version: packageJson.version,
    private: true,
    description: packageJson.description,
    main: packageJson.main,
    type: packageJson.type
  };

  await writeFile(path.join(appRoot, "package.json"), `${JSON.stringify(minimalPackageJson, null, 2)}\n`, "utf8");
}

async function packageMacApp() {
  const packageJson = readJson("package.json");
  if (!packageJson) {
    return null;
  }

  const electronApp = resolveElectronAppTemplate();
  if (!electronApp) {
    failures.push("Electron.app template is missing; run npm install first");
    return null;
  }

  await rm(outputRoot, { force: true, recursive: true });
  await mkdir(outputRoot, { recursive: true });
  await cp(electronApp, packagedApp, { recursive: true, verbatimSymlinks: true });

  const contentsDir = path.join(packagedApp, "Contents");
  const resourcesDir = path.join(contentsDir, "Resources");
  const macOsDir = path.join(contentsDir, "MacOS");
  const electronExecutable = path.join(macOsDir, "Electron");
  const grooveForgeExecutable = path.join(macOsDir, appName);
  const appRoot = path.join(resourcesDir, "app");

  if (existsSync(electronExecutable)) {
    await rename(electronExecutable, grooveForgeExecutable);
  }

  await writeGrooveForgePlist(path.join(contentsDir, "Info.plist"), packageJson.version);
  await rm(appRoot, { force: true, recursive: true });
  await mkdir(appRoot, { recursive: true });
  await cp(path.join(root, "dist"), path.join(appRoot, "dist"), { recursive: true });
  await cp(path.join(root, "dist-electron"), path.join(appRoot, "dist-electron"), { recursive: true });
  await writePackagedPackageJson(appRoot, packageJson);

  return {
    appRoot,
    executable: grooveForgeExecutable,
    infoPlist: path.join(contentsDir, "Info.plist"),
    packagedApp
  };
}

async function checkPackagedApp(paths) {
  check(existsSync(paths.packagedApp), "packaged GrooveForge.app should exist");
  check(existsSync(paths.executable), "packaged app executable should be renamed to GrooveForge");
  await access(paths.executable, constants.X_OK).catch(() => failures.push("packaged GrooveForge executable should be executable"));
  check(existsSync(path.join(paths.appRoot, "dist", "index.html")), "packaged app should include dist/index.html");
  check(existsSync(path.join(paths.appRoot, "dist-electron", "main.js")), "packaged app should include dist-electron/main.js");
  check(existsSync(path.join(paths.appRoot, "dist-electron", "preload.cjs")), "packaged app should include dist-electron/preload.cjs");

  const packagedPackageJson = JSON.parse(await readFile(path.join(paths.appRoot, "package.json"), "utf8"));
  check(packagedPackageJson.productName === appName, "packaged package.json should set productName GrooveForge");
  check(packagedPackageJson.main === "dist-electron/main.js", "packaged package.json should keep the Electron main entry");
  check(packagedPackageJson.type === "module", "packaged package.json should preserve ESM module type");
  check(!("scripts" in packagedPackageJson), "packaged package.json should not include development scripts");
  check(!("devDependencies" in packagedPackageJson), "packaged package.json should not include development dependencies");

  const plist = await readFile(paths.infoPlist, "utf8");
  check(plist.includes("<string>GrooveForge</string>"), "Info.plist should brand the app as GrooveForge");
  check(plist.includes(`<string>${bundleId}</string>`), `Info.plist should use ${bundleId}`);
  check(plist.includes("<key>CFBundleExecutable</key>"), "Info.plist should include CFBundleExecutable");
  check(plist.includes("<string>public.app-category.music</string>"), "Info.plist should use the music app category");
  for (const forbidden of [
    "NSAudioCaptureUsageDescription",
    "NSBluetoothAlwaysUsageDescription",
    "NSBluetoothPeripheralUsageDescription",
    "NSCameraUsageDescription",
    "NSMicrophoneUsageDescription",
    "NSAllowsArbitraryLoads"
  ]) {
    check(!plist.includes(forbidden), `Info.plist should not include ${forbidden}`);
  }
}

function checkLaunchResult(result) {
  check(result && typeof result === "object", "packaged app should return a structured launch smoke result");
  check(result?.ok === true, "packaged app launch smoke result should be ok");

  const evidence = result?.evidence;
  check(evidence?.title === appName, "packaged app document title should be GrooveForge");
  check(String(evidence?.location ?? "").startsWith("file:"), "packaged app renderer should load file assets");
  check(evidence?.appKind === "desktop", "packaged app preload bridge should expose appKind desktop");
  check(evidence?.hasSaveProject === true, "packaged app preload bridge should expose saveProject");
  check(evidence?.hasOpenProject === true, "packaged app preload bridge should expose openProject");
  check(evidence?.rootChildCount > 0, "packaged app should mount React under #root");
  check(evidence?.bodyTextLength > 20000, "packaged app should expose a substantial workstation surface");
  check(Array.isArray(evidence?.missingText) && evidence.missingText.length === 0, "packaged app should contain all expected beginner/pro text");
  check(evidence?.samplingTextPresent === false, "packaged app first-run surface should not expose sampling-first language");

  const visual = evidence?.visual;
  check(visual?.width >= 1180 && visual?.height >= 760, "packaged app screenshot should respect desktop minimums");
  check(visual?.pngBytes > 50000, "packaged app screenshot PNG should be substantial");
  check(visual?.sampledPixels >= 1000, "packaged app screenshot should sample enough pixels");
  check(visual?.uniqueSampledColors >= 24, "packaged app screenshot should have visible color diversity");
  check(visual?.nonBackgroundSamples / visual?.sampledPixels >= 0.04, "packaged app screenshot should contain non-background UI pixels");
  check(visual?.maxColorDelta >= 48, "packaged app screenshot should have visible contrast");
}

async function launchPackagedApp(paths) {
  const env = {
    ...process.env,
    GROOVEFORGE_DESKTOP_LAUNCH_SMOKE: "1",
    NO_COLOR: "1"
  };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.VITE_DEV_SERVER_URL;

  return await new Promise((resolve) => {
    const child = spawn(paths.executable, [], {
      cwd: paths.appRoot,
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
      fail("Timed out waiting for packaged Electron app launch smoke to exit.", `${stdout}\n${stderr}`);
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
      fail(`Could not start packaged Electron app: ${error.message}`);
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
        fail(`Packaged app exited without a launch smoke result (code ${code ?? "null"}, signal ${signal ?? "null"}).`, combinedOutput);
      }
      if (code !== 0 || result.ok !== true) {
        fail(
          `Packaged app launch smoke returned a failing result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
          JSON.stringify(result, null, 2)
        );
      }
      resolve(result);
    });
  });
}

if (process.platform !== "darwin") {
  console.log("GrooveForge desktop package smoke skipped.");
  console.log(`- Scope: macOS portable app bundle smoke is not available on ${process.platform}`);
  process.exit(0);
}

checkBuiltArtifacts();
if (failures.length > 0) {
  fail("Built artifact preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const paths = await packageMacApp();
if (!paths || failures.length > 0) {
  fail("Packaged app assembly failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await checkPackagedApp(paths);
if (failures.length > 0) {
  fail("Packaged app structure validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const result = await launchPackagedApp(paths);
checkLaunchResult(result);
if (failures.length > 0) {
  fail("Packaged app launch evidence validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge desktop package smoke passed.");
console.log("- Scope: macOS portable GrooveForge.app assembly, bundle contract, privacy posture, and packaged production launch");
console.log(`- App: ${path.relative(root, paths.packagedApp)}`);
console.log(`- Entry: ${path.relative(root, path.join(paths.appRoot, "dist-electron", "main.js"))} -> packaged dist/index.html`);
console.log(
  `- Visual: ${result.evidence.visual.width}x${result.evidence.visual.height}, ${result.evidence.visual.pngBytes} PNG bytes, ${result.evidence.visual.uniqueSampledColors} sampled colors`
);
