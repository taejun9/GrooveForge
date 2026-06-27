#!/usr/bin/env node

import { spawn } from "node:child_process";
import { constants, existsSync } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const resultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
const packageRoot = path.join(root, "build", "desktop", `${appName}-${process.platform}-${process.arch}`);
const packagedApp = path.join(packageRoot, `${appName}.app`);
const executable = path.join(packagedApp, "Contents", "MacOS", appName);
const appRoot = path.join(packagedApp, "Contents", "Resources", "app");
const timeoutMs = 120000;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop ad-hoc signing smoke failed:");
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
    fail(`Could not parse signed app launch smoke result JSON: ${error instanceof Error ? error.message : String(error)}`, line);
  }
}

async function checkPackagedAppPreflight() {
  check(existsSync(packagedApp), "packaged GrooveForge.app should exist; run npm run desktop:package-smoke first");
  check(existsSync(executable), "packaged GrooveForge executable should exist");
  check(existsSync(path.join(appRoot, "dist", "index.html")), "packaged app should include dist/index.html");
  check(existsSync(path.join(appRoot, "dist-electron", "main.js")), "packaged app should include dist-electron/main.js");
  check(existsSync(path.join(packagedApp, "Contents", "Resources", "GrooveForge.icns")), "packaged app should include GrooveForge.icns");
  check(!existsSync(path.join(packagedApp, "Contents", "Resources", "electron.icns")), "packaged app should not include electron.icns");
  await access(executable, constants.X_OK).catch(() => failures.push("packaged GrooveForge executable should be executable"));

  const plist = existsSync(path.join(packagedApp, "Contents", "Info.plist"))
    ? await readFile(path.join(packagedApp, "Contents", "Info.plist"), "utf8")
    : "";
  check(plist.includes(`<string>${bundleId}</string>`), `packaged app Info.plist should use ${bundleId}`);
}

async function adHocSignApp() {
  await runCommand("codesign", ["--force", "--deep", "--sign", "-", packagedApp]);
  await runCommand("codesign", ["--verify", "--deep", "--strict", "--verbose=2", packagedApp]);
  const display = await runCommand("codesign", ["--display", "--verbose=4", packagedApp]);
  const details = `${display.stdout}\n${display.stderr}`;
  check(details.includes(`Identifier=${bundleId}`), `ad-hoc signature should preserve ${bundleId}`);
  check(details.includes("Signature=adhoc"), "ad-hoc signature details should report Signature=adhoc");
  check(!details.includes("Authority=Developer ID"), "ad-hoc signature should not claim Developer ID authority");
  return details;
}

async function launchSignedApp() {
  const env = {
    ...process.env,
    GROOVEFORGE_DESKTOP_LAUNCH_SMOKE: "1",
    NO_COLOR: "1"
  };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.VITE_DEV_SERVER_URL;

  return await new Promise((resolve) => {
    const child = spawn(executable, [], {
      cwd: appRoot,
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
      fail("Timed out waiting for ad-hoc signed Electron app launch smoke to exit.", `${stdout}\n${stderr}`);
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
      fail(`Could not start ad-hoc signed Electron app: ${error.message}`);
    });
    child.on("exit", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      const result = parseSmokeResult(`${stdout}\n${stderr}`);
      if (!result) {
        fail(`Ad-hoc signed app exited without a launch smoke result (code ${code ?? "null"}, signal ${signal ?? "null"}).`, `${stdout}\n${stderr}`);
      }
      if (code !== 0 || result.ok !== true) {
        fail(
          `ad-hoc signed app launch smoke returned a failing result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
          JSON.stringify(result, null, 2)
        );
      }
      resolve(result);
    });
  });
}

function checkLaunchResult(result) {
  check(result?.evidence?.title === appName, "ad-hoc signed app document title should be GrooveForge");
  check(result?.evidence?.appKind === "desktop", "ad-hoc signed app preload bridge should expose appKind desktop");
  check(result?.evidence?.hasSaveProject === true, "ad-hoc signed app preload bridge should expose saveProject");
  check(result?.evidence?.hasOpenProject === true, "ad-hoc signed app preload bridge should expose openProject");
  check(result?.evidence?.rootChildCount > 0, "ad-hoc signed app should mount React under #root");
  check(result?.evidence?.samplingTextPresent === false, "ad-hoc signed app first-run surface should not expose sampling-first language");
  check(result?.evidence?.visual?.pngBytes > 50000, "ad-hoc signed app screenshot PNG should be substantial");
  check(result?.evidence?.visual?.uniqueSampledColors >= 24, "ad-hoc signed app screenshot should have visible color diversity");
}

if (process.platform !== "darwin") {
  console.log("GrooveForge desktop ad-hoc signing smoke skipped.");
  console.log(`- Scope: macOS ad-hoc signing smoke is not available on ${process.platform}`);
  process.exit(0);
}

await checkPackagedAppPreflight();
if (failures.length > 0) {
  fail("Packaged app preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await adHocSignApp();
if (failures.length > 0) {
  fail("Ad-hoc signature validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const result = await launchSignedApp();
checkLaunchResult(result);
if (failures.length > 0) {
  fail("Ad-hoc signed app launch evidence validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge desktop ad-hoc signing smoke passed.");
console.log("- Scope: local macOS ad-hoc app signing, codesign verification, and signed app production launch smoke");
console.log(`- App: ${path.relative(root, packagedApp)}`);
console.log("- Signature: ad-hoc, Developer ID signing not claimed");
console.log(`- Visual: ${result.evidence.visual.width}x${result.evidence.visual.height}, ${result.evidence.visual.pngBytes} PNG bytes, ${result.evidence.visual.uniqueSampledColors} sampled colors`);
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
