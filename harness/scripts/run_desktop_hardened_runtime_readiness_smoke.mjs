#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const packagedApp = path.join(packageRoot, `${appName}.app`);
const executable = path.join(packagedApp, "Contents", "MacOS", appName);
const readinessRoot = path.join(root, "build", "desktop");
const readinessPath = path.join(readinessRoot, `${appName}-${platformArch}-hardened-runtime-readiness.json`);
const commandTimeoutMs = 30000;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge hardened runtime readiness smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function runCommand(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, NO_COLOR: "1" },
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
      resolve({
        ok: false,
        stdout,
        stderr,
        code: null,
        signal: "SIGTERM",
        error: `${command} timed out after ${commandTimeoutMs}ms`
      });
    }, commandTimeoutMs);

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
      resolve({
        ok: false,
        stdout,
        stderr,
        code: null,
        signal: null,
        error: error.message
      });
    });
    child.on("exit", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      resolve({
        ok: code === 0,
        stdout,
        stderr,
        code,
        signal,
        error: null
      });
    });
  });
}

function signatureEvidence(label, targetPath, display, verify) {
  const output = `${display.stdout}\n${display.stderr}`;
  const flagsLine = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("CodeDirectory") && line.includes("flags="));
  const identifier = output.match(/Identifier=([^\n]+)/)?.[1] ?? null;
  const hasRuntimeFlag = /\bflags=[^\n]*\bruntime\b/.test(flagsLine ?? "");
  const isAdHoc = output.includes("Signature=adhoc") || /\bflags=[^\n]*\badhoc\b/.test(flagsLine ?? "");
  const hasDeveloperIdAuthority = output.includes("Authority=Developer ID");

  return {
    label,
    path: relative(targetPath),
    displayOk: display.ok,
    verifyOk: verify.ok,
    identifier,
    flagsLine: flagsLine ?? null,
    hasRuntimeFlag,
    isAdHoc,
    hasDeveloperIdAuthority,
    displayCode: display.code,
    verifyCode: verify.code,
    displayError: display.error,
    verifyError: verify.error
  };
}

async function createReadinessSummary() {
  const base = {
    appName,
    bundleId,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    networkSubmissionAttempted: false,
    releaseGateClaimedHardenedRuntime: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedExternalDistribution: false
  };

  if (process.platform !== "darwin") {
    return {
      ...base,
      skipped: true,
      reason: "Hardened runtime readiness smoke is only meaningful on macOS",
      hardenedRuntimeReady: false,
      blockers: ["Run on macOS after packaging and signing the desktop app."]
    };
  }

  check(existsSync(packagedApp), "packaged GrooveForge.app should exist before hardened runtime readiness smoke");
  check(existsSync(executable), "packaged GrooveForge executable should exist before hardened runtime readiness smoke");
  if (failures.length > 0) {
    fail("Hardened runtime readiness preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  const appDisplay = await runCommand("codesign", ["--display", "--verbose=4", packagedApp]);
  const appVerify = await runCommand("codesign", ["--verify", "--deep", "--strict", "--verbose=2", packagedApp]);
  const executableDisplay = await runCommand("codesign", ["--display", "--verbose=4", executable]);
  const executableVerify = await runCommand("codesign", ["--verify", "--strict", "--verbose=2", executable]);
  const appSignature = signatureEvidence("app-bundle", packagedApp, appDisplay, appVerify);
  const executableSignature = signatureEvidence("main-executable", executable, executableDisplay, executableVerify);
  const blockers = [];

  if (!appSignature.displayOk || !appSignature.verifyOk) {
    blockers.push("Packaged app code signature could not be displayed and verified.");
  }
  if (!executableSignature.displayOk || !executableSignature.verifyOk) {
    blockers.push("Packaged executable code signature could not be displayed and verified.");
  }
  if (appSignature.identifier !== bundleId) {
    blockers.push(`Packaged app signature identifier is not ${bundleId}.`);
  }
  if (!appSignature.hasRuntimeFlag) {
    blockers.push("Packaged app signature does not include the hardened runtime flag.");
  }
  if (!executableSignature.hasRuntimeFlag) {
    blockers.push("Packaged executable signature does not include the hardened runtime flag.");
  }
  if (appSignature.isAdHoc || executableSignature.isAdHoc) {
    blockers.push("Packaged app is ad-hoc signed; Developer ID signing is required before notarization readiness can be claimed.");
  }
  if (!appSignature.hasDeveloperIdAuthority) {
    blockers.push("Packaged app signature does not include Developer ID authority.");
  }

  const hardenedRuntimeReady =
    appSignature.displayOk &&
    appSignature.verifyOk &&
    executableSignature.displayOk &&
    executableSignature.verifyOk &&
    appSignature.identifier === bundleId &&
    appSignature.hasRuntimeFlag &&
    executableSignature.hasRuntimeFlag &&
    !appSignature.isAdHoc &&
    !executableSignature.isAdHoc &&
    appSignature.hasDeveloperIdAuthority;

  return {
    ...base,
    skipped: false,
    appSignature,
    executableSignature,
    hardenedRuntimeReady,
    blockers
  };
}

const readiness = await createReadinessSummary();
await mkdir(readinessRoot, { recursive: true });
await writeFile(readinessPath, `${JSON.stringify(readiness, null, 2)}\n`, "utf8");

check(readiness.appName === appName, "hardened runtime readiness summary should identify GrooveForge");
check(readiness.bundleId === bundleId, `hardened runtime readiness summary should identify ${bundleId}`);
check(readiness.networkSubmissionAttempted === false, "hardened runtime readiness smoke should not submit to Apple notary services");
check(readiness.releaseGateClaimedHardenedRuntime === false, "hardened runtime readiness smoke should not claim hardened runtime completion");
check(readiness.releaseGateClaimedNotarization === false, "hardened runtime readiness smoke should not claim notarization");
check(readiness.releaseGateClaimedGatekeeperApproval === false, "hardened runtime readiness smoke should not claim Gatekeeper approval");
check(readiness.releaseGateClaimedExternalDistribution === false, "hardened runtime readiness smoke should not claim external distribution completion");
check(Array.isArray(readiness.blockers), "hardened runtime readiness summary should include a blockers array");
check(readiness.hardenedRuntimeReady === false || readiness.blockers.length === 0, "ready hardened runtime summary should not include blockers");

if (failures.length > 0) {
  fail("Hardened runtime readiness validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge hardened runtime readiness smoke passed.");
console.log(`- Summary: ${relative(readinessPath)}`);
console.log(`- App runtime flag: ${readiness.appSignature?.hasRuntimeFlag === true ? "yes" : "no"}`);
console.log(`- Executable runtime flag: ${readiness.executableSignature?.hasRuntimeFlag === true ? "yes" : "no"}`);
console.log(`- Developer ID authority: ${readiness.appSignature?.hasDeveloperIdAuthority === true ? "yes" : "no"}`);
console.log(`- Hardened runtime ready: ${readiness.hardenedRuntimeReady ? "yes" : "no"}`);
if (readiness.blockers.length > 0) {
  console.log(`- Blockers: ${readiness.blockers.join(" | ")}`);
}
console.log("- Network: no Apple notary submission attempted");
console.log("- Not claimed: hardened runtime completion, Developer ID signing, notarization, Gatekeeper approval, app-store submission, or external distribution-channel QA");
