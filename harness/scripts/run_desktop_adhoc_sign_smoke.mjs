#!/usr/bin/env node

import { spawn } from "node:child_process";
import { constants, existsSync } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { macGuiLaunchAbortDetails, macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";
import { electronFrameworkDependencyReport } from "./desktop_bundle_dependency_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const resultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
const packageRoot = path.join(root, "build", "desktop", `${appName}-${process.platform}-${process.arch}`);
const packagedApp = path.join(packageRoot, `${appName}.app`);
const executable = path.join(packagedApp, "Contents", "MacOS", appName);
const appRoot = path.join(packagedApp, "Contents", "Resources", "app");
const entitlementsPath = path.join(root, "harness", "fixtures", "macos-hardened-runtime-entitlements.plist");
const requiredEntitlements = [
  "com.apple.security.cs.allow-jit",
  "com.apple.security.cs.allow-unsigned-executable-memory",
  "com.apple.security.cs.disable-library-validation"
];
// Keep the parent harness alive beyond the app's 1,800-second launch-smoke timeout.
const timeoutMs = 1820000;
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

function signatureEvidence(details) {
  const flagsLine = details
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("CodeDirectory") && line.includes("flags="));

  return {
    identifier: details.match(/Identifier=([^\n]+)/)?.[1] ?? null,
    flagsLine: flagsLine ?? null,
    hasRuntimeFlag: /\bflags=[^\n]*\bruntime\b/.test(flagsLine ?? ""),
    isAdHoc: details.includes("Signature=adhoc") || /\bflags=[^\n]*\badhoc\b/.test(flagsLine ?? ""),
    hasDeveloperIdAuthority: details.includes("Authority=Developer ID")
  };
}

async function checkPackagedAppPreflight() {
  check(existsSync(packagedApp), "packaged GrooveForge.app should exist; run npm run desktop:package-smoke first");
  check(existsSync(executable), "packaged GrooveForge executable should exist");
  check(existsSync(entitlementsPath), "hardened runtime entitlements file should exist");
  check(existsSync(path.join(appRoot, "dist", "index.html")), "packaged app should include dist/index.html");
  check(existsSync(path.join(appRoot, "dist-electron", "main.js")), "packaged app should include dist-electron/main.js");
  check(existsSync(path.join(packagedApp, "Contents", "Resources", "GrooveForge.icns")), "packaged app should include GrooveForge.icns");
  check(!existsSync(path.join(packagedApp, "Contents", "Resources", "electron.icns")), "packaged app should not include electron.icns");
  await access(executable, constants.X_OK).catch(() => failures.push("packaged GrooveForge executable should be executable"));

  const plist = existsSync(path.join(packagedApp, "Contents", "Info.plist"))
    ? await readFile(path.join(packagedApp, "Contents", "Info.plist"), "utf8")
    : "";
  check(plist.includes(`<string>${bundleId}</string>`), `packaged app Info.plist should use ${bundleId}`);

  const entitlements = existsSync(entitlementsPath) ? await readFile(entitlementsPath, "utf8") : "";
  for (const entitlement of requiredEntitlements) {
    check(entitlements.includes(entitlement), `hardened runtime entitlements should include ${entitlement}`);
  }
}

async function adHocSignApp() {
  await runCommand("codesign", ["--force", "--deep", "--options", "runtime", "--entitlements", entitlementsPath, "--sign", "-", packagedApp]);
  await runCommand("codesign", ["--verify", "--deep", "--strict", "--verbose=2", packagedApp]);
  const appDisplay = await runCommand("codesign", ["--display", "--verbose=4", packagedApp]);
  const executableDisplay = await runCommand("codesign", ["--display", "--verbose=4", executable]);
  const appEntitlements = await runCommand("codesign", ["--display", "--entitlements", ":-", packagedApp]);
  const appSignature = signatureEvidence(`${appDisplay.stdout}\n${appDisplay.stderr}`);
  const executableSignature = signatureEvidence(`${executableDisplay.stdout}\n${executableDisplay.stderr}`);
  const entitlementDetails = `${appEntitlements.stdout}\n${appEntitlements.stderr}`;
  check(appSignature.identifier === bundleId, `ad-hoc signature should preserve ${bundleId}`);
  check(appSignature.isAdHoc, "ad-hoc signature details should report Signature=adhoc");
  check(appSignature.hasRuntimeFlag, "ad-hoc app signature should include the hardened runtime flag");
  check(executableSignature.hasRuntimeFlag, "ad-hoc executable signature should include the hardened runtime flag");
  for (const entitlement of requiredEntitlements) {
    check(entitlementDetails.includes(entitlement), `ad-hoc app signature should include ${entitlement}`);
  }
  check(!appSignature.hasDeveloperIdAuthority, "ad-hoc app signature should not claim Developer ID authority");
  check(!executableSignature.hasDeveloperIdAuthority, "ad-hoc executable signature should not claim Developer ID authority");
  return { appSignature, executableSignature };
}

async function checkSignedFrameworkDependencies() {
  const frameworkDependencies = await electronFrameworkDependencyReport(packagedApp, { root, timeoutMs });
  check(frameworkDependencies.otoolReady, "ad-hoc signed app Electron Framework dependency scan should run");
  check(frameworkDependencies.otoolLoadCommandsReady, "ad-hoc signed app Electron Framework rpath scan should run");
  check(frameworkDependencies.appExecutableLoadCommandsReady, "ad-hoc signed app executable rpath scan should run");
  check(frameworkDependencies.rpathScansReady, "ad-hoc signed app Electron dyld rpath scans should run");
  check(
    frameworkDependencies.allRequiredDependenciesReferenced,
    "ad-hoc signed app Electron Framework should reference Squirrel, ReactiveObjC, and Mantle through @rpath"
  );
  check(
    frameworkDependencies.allRequiredDependenciesPresent,
    "ad-hoc signed app should include every @rpath Electron runtime framework dependency, including Squirrel.framework/Squirrel"
  );
  check(
    frameworkDependencies.allRequiredDependenciesCodeSigned,
    "ad-hoc signed app Electron runtime framework dependencies should pass codesign --verify --strict before launch"
  );
  check(
    frameworkDependencies.allRequiredDependenciesSignatureCompatible,
    "ad-hoc signed app Electron runtime framework dependencies should be signature-compatible with the app bundle before launch"
  );
  check(
    frameworkDependencies.allRequiredDependenciesDyldLoadable,
    "ad-hoc signed app Electron runtime framework dependencies should be dyld-loadable through @rpath before launch"
  );
  return frameworkDependencies;
}

async function launchSignedApp() {
  const blockDetails = macGuiLaunchBlockDetails("npm run desktop:adhoc-sign-smoke");
  if (blockDetails) {
    fail("Refusing to start ad-hoc signed Electron in a restricted macOS GUI context.", blockDetails);
  }

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
      const combinedOutput = `${stdout}\n${stderr}`;
      const result = parseSmokeResult(combinedOutput);
      if (!result) {
        fail(
          `Ad-hoc signed app exited without a launch smoke result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
          macGuiLaunchAbortDetails("npm run desktop:adhoc-sign-smoke", { code, signal, output: combinedOutput })
        );
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

const signature = await adHocSignApp();
if (failures.length > 0) {
  fail("Ad-hoc signature validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const frameworkDependencies = await checkSignedFrameworkDependencies();
if (failures.length > 0) {
  fail("Ad-hoc signed Electron framework dependency validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const result = await launchSignedApp();
checkLaunchResult(result);
if (failures.length > 0) {
  fail("Ad-hoc signed app launch evidence validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge desktop ad-hoc signing smoke passed.");
console.log("- Scope: local macOS ad-hoc app signing with hardened runtime option, codesign verification, and signed app production launch smoke");
console.log(`- App: ${path.relative(root, packagedApp)}`);
console.log(`- Entitlements: ${path.relative(root, entitlementsPath)}`);
console.log("- Signature: ad-hoc with hardened runtime option and Electron runtime entitlements, Developer ID signing not claimed");
console.log(`- Runtime flags: app ${signature.appSignature.hasRuntimeFlag ? "yes" : "no"}, executable ${signature.executableSignature.hasRuntimeFlag ? "yes" : "no"}`);
console.log(
  `- Framework dependencies: ${frameworkDependencies.presentDependencyCount}/${frameworkDependencies.requiredDependencyCount} present, ${frameworkDependencies.signatureVerifiedDependencyCount}/${frameworkDependencies.requiredDependencyCount} code-signed, ${frameworkDependencies.signatureCompatibleDependencyCount}/${frameworkDependencies.requiredDependencyCount} signature-compatible`
);
console.log(
  `- Dyld framework loadability: ${frameworkDependencies.dyldLoadableDependencyCount}/${frameworkDependencies.requiredDependencyCount} loadable via ${frameworkDependencies.rpathCount} dyld rpaths`
);
console.log(`- Visual: ${result.evidence.visual.width}x${result.evidence.visual.height}, ${result.evidence.visual.pngBytes} PNG bytes, ${result.evidence.visual.uniqueSampledColors} sampled colors`);
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
