#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const packagedApp = path.join(packageRoot, `${appName}.app`);
const entitlementsPath = path.join(root, "harness", "fixtures", "macos-hardened-runtime-entitlements.plist");
const signingRoot = path.join(packageRoot, "developer-id-signing-smoke");
const signedApp = path.join(signingRoot, `${appName}.app`);
const signedExecutable = path.join(signedApp, "Contents", "MacOS", appName);
const summaryPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-developer-id-signing.json`);
const requiredRuntimeEntitlements = [
  "com.apple.security.cs.allow-jit",
  "com.apple.security.cs.allow-unsigned-executable-memory",
  "com.apple.security.cs.disable-library-validation"
];
const identityEnvKey = "GROOVEFORGE_DEVELOPER_ID_IDENTITY";
const commandTimeoutMs = 90000;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge Developer ID signing smoke failed:");
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

function parseDeveloperIdIdentities(output) {
  const identities = [];
  const identityPattern = /\b[0-9]+\)\s+([A-Fa-f0-9]{40})\s+"(Developer ID Application:[^"]+)"/g;
  for (const match of output.matchAll(identityPattern)) {
    identities.push({
      fingerprint: match[1],
      label: match[2]
    });
  }
  return identities;
}

function signatureEvidence(label, targetPath, display, entitlements) {
  const output = `${display.stdout}\n${display.stderr}`;
  const entitlementOutput = `${entitlements.stdout}\n${entitlements.stderr}`;
  const flagsLine = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("CodeDirectory") && line.includes("flags="));

  return {
    label,
    path: relative(targetPath),
    identifier: output.match(/Identifier=([^\n]+)/)?.[1] ?? null,
    flagsLine: flagsLine ?? null,
    hasRuntimeFlag: /\bflags=[^\n]*\bruntime\b/.test(flagsLine ?? ""),
    isAdHoc: output.includes("Signature=adhoc") || /\bflags=[^\n]*\badhoc\b/.test(flagsLine ?? ""),
    hasDeveloperIdAuthority: output.includes("Authority=Developer ID"),
    runtimeEntitlements: Object.fromEntries(
      requiredRuntimeEntitlements.map((entitlement) => [entitlement, entitlementOutput.includes(entitlement)])
    ),
    displayOk: display.ok,
    entitlementsOk: entitlements.ok
  };
}

function identityMatches(identity, configuredIdentity) {
  return identity.fingerprint === configuredIdentity || identity.label === configuredIdentity || identity.label.includes(configuredIdentity);
}

async function createSigningSummary() {
  const base = {
    appName,
    bundleId,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    identityEnvKey,
    networkSubmissionAttempted: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedExternalDistribution: false
  };

  if (process.platform !== "darwin") {
    return {
      ...base,
      skipped: true,
      reason: "Developer ID signing smoke is only meaningful on macOS",
      developerIdSigningAttempted: false,
      developerIdSigned: false,
      blockers: ["Run on macOS after packaging the desktop app."]
    };
  }

  check(existsSync(packagedApp), "packaged GrooveForge.app should exist before Developer ID signing smoke");
  check(existsSync(entitlementsPath), "hardened runtime entitlements file should exist before Developer ID signing smoke");
  if (failures.length > 0) {
    fail("Developer ID signing preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  const codesign = await runCommand("which", ["codesign"]);
  const ditto = await runCommand("which", ["ditto"]);
  const security = await runCommand("security", ["find-identity", "-v", "-p", "codesigning"]);
  const identityOutput = `${security.stdout}\n${security.stderr}`;
  const developerIdApplicationIdentities = parseDeveloperIdIdentities(identityOutput);
  const configuredIdentity = process.env[identityEnvKey]?.trim() ?? "";
  const matchingIdentity = configuredIdentity
    ? developerIdApplicationIdentities.find((identity) => identityMatches(identity, configuredIdentity))
    : null;
  const blockers = [];

  if (!codesign.ok) {
    blockers.push("macOS codesign CLI is unavailable.");
  }
  if (!ditto.ok) {
    blockers.push("macOS ditto CLI is unavailable for isolated app copying.");
  }
  if (!security.ok) {
    blockers.push("macOS security CLI could not inspect code-signing identities.");
  }
  if (developerIdApplicationIdentities.length === 0) {
    blockers.push("No valid Developer ID Application identity is installed in the current keychain search list.");
  }
  if (!configuredIdentity) {
    blockers.push(`Set ${identityEnvKey} to a Developer ID Application identity label or SHA-1 fingerprint before signing.`);
  } else if (!matchingIdentity) {
    blockers.push(`Configured ${identityEnvKey} identity was not found in the current keychain search list.`);
  }

  const canAttemptSigning = codesign.ok && ditto.ok && security.ok && Boolean(matchingIdentity);
  if (!canAttemptSigning) {
    return {
      ...base,
      skipped: false,
      tools: {
        codesignAvailable: codesign.ok,
        dittoAvailable: ditto.ok,
        securityIdentityInspectionAvailable: security.ok
      },
      configuredIdentityPresent: configuredIdentity.length > 0,
      developerIdApplicationIdentityCount: developerIdApplicationIdentities.length,
      matchingIdentityFound: Boolean(matchingIdentity),
      developerIdSigningAttempted: false,
      developerIdSigned: false,
      signedAppPath: null,
      blockers
    };
  }

  await rm(signingRoot, { recursive: true, force: true });
  await mkdir(signingRoot, { recursive: true });
  const copy = await runCommand("ditto", [packagedApp, signedApp]);
  if (!copy.ok) {
    blockers.push("Could not copy packaged app into the isolated Developer ID signing smoke path.");
  }

  let sign = { ok: false, stdout: "", stderr: "", code: null, signal: null, error: "signing not attempted" };
  let verify = { ok: false, stdout: "", stderr: "", code: null, signal: null, error: "verification not attempted" };
  let appSignature = null;
  let executableSignature = null;

  if (copy.ok) {
    sign = await runCommand("codesign", [
      "--force",
      "--deep",
      "--options",
      "runtime",
      "--entitlements",
      entitlementsPath,
      "--sign",
      matchingIdentity.label,
      signedApp
    ]);
    if (!sign.ok) {
      blockers.push("Developer ID signing command failed for the isolated app copy.");
    }

    verify = await runCommand("codesign", ["--verify", "--deep", "--strict", "--verbose=2", signedApp]);
    if (!verify.ok) {
      blockers.push("Developer ID signed app copy failed strict codesign verification.");
    }

    const appDisplay = await runCommand("codesign", ["--display", "--verbose=4", signedApp]);
    const appEntitlements = await runCommand("codesign", ["--display", "--entitlements", ":-", signedApp]);
    const executableDisplay = await runCommand("codesign", ["--display", "--verbose=4", signedExecutable]);
    const executableEntitlements = await runCommand("codesign", ["--display", "--entitlements", ":-", signedExecutable]);
    appSignature = signatureEvidence("app-bundle", signedApp, appDisplay, appEntitlements);
    executableSignature = signatureEvidence("main-executable", signedExecutable, executableDisplay, executableEntitlements);

    if (appSignature.identifier !== bundleId) {
      blockers.push(`Developer ID signed app identifier is not ${bundleId}.`);
    }
    if (!appSignature.hasRuntimeFlag || !executableSignature.hasRuntimeFlag) {
      blockers.push("Developer ID signed app or executable does not include the hardened runtime flag.");
    }
    if (appSignature.isAdHoc || executableSignature.isAdHoc) {
      blockers.push("Developer ID signed copy still reports ad-hoc signature evidence.");
    }
    if (!appSignature.hasDeveloperIdAuthority) {
      blockers.push("Developer ID signed copy does not include Developer ID authority.");
    }
    for (const entitlement of requiredRuntimeEntitlements) {
      if (appSignature.runtimeEntitlements?.[entitlement] !== true) {
        blockers.push(`Developer ID signed copy does not include ${entitlement}.`);
      }
    }
  }

  const developerIdSigned =
    copy.ok &&
    sign.ok &&
    verify.ok &&
    appSignature?.identifier === bundleId &&
    appSignature?.hasRuntimeFlag === true &&
    executableSignature?.hasRuntimeFlag === true &&
    appSignature?.isAdHoc === false &&
    executableSignature?.isAdHoc === false &&
    appSignature?.hasDeveloperIdAuthority === true &&
    requiredRuntimeEntitlements.every((entitlement) => appSignature?.runtimeEntitlements?.[entitlement] === true);

  return {
    ...base,
    skipped: false,
    tools: {
      codesignAvailable: codesign.ok,
      dittoAvailable: ditto.ok,
      securityIdentityInspectionAvailable: security.ok
    },
    configuredIdentityPresent: true,
    developerIdApplicationIdentityCount: developerIdApplicationIdentities.length,
    matchingIdentityFound: true,
    selectedIdentity: {
      fingerprint: matchingIdentity.fingerprint,
      label: matchingIdentity.label
    },
    developerIdSigningAttempted: true,
    developerIdSigned,
    signedAppPath: relative(signedApp),
    appSignature,
    executableSignature,
    blockers
  };
}

const summary = await createSigningSummary();
await mkdir(path.dirname(summaryPath), { recursive: true });
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

check(summary.appName === appName, "Developer ID signing summary should identify GrooveForge");
check(summary.bundleId === bundleId, `Developer ID signing summary should identify ${bundleId}`);
check(summary.networkSubmissionAttempted === false, "Developer ID signing smoke should not submit to Apple notary services");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "Developer ID signing smoke should not claim primary release artifact Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "Developer ID signing smoke should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "Developer ID signing smoke should not claim Gatekeeper approval");
check(summary.releaseGateClaimedExternalDistribution === false, "Developer ID signing smoke should not claim external distribution completion");
check(Array.isArray(summary.blockers), "Developer ID signing summary should include a blockers array");
check(summary.developerIdSigned === false || summary.blockers.length === 0, "signed Developer ID summary should not include blockers");

if (failures.length > 0) {
  fail("Developer ID signing validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge Developer ID signing smoke passed.");
console.log(`- Summary: ${relative(summaryPath)}`);
console.log(`- Identity configured: ${summary.configuredIdentityPresent === true ? "yes" : "no"}`);
console.log(`- Matching identity found: ${summary.matchingIdentityFound === true ? "yes" : "no"}`);
console.log(`- Signing attempted: ${summary.developerIdSigningAttempted === true ? "yes" : "no"}`);
console.log(`- Developer ID signed copy: ${summary.developerIdSigned === true ? "yes" : "no"}`);
if (summary.signedAppPath) {
  console.log(`- Signed app copy: ${summary.signedAppPath}`);
}
if (summary.blockers.length > 0) {
  console.log(`- Blockers: ${summary.blockers.join(" | ")}`);
}
console.log("- Network: no Apple notary submission attempted");
console.log("- Not claimed: primary release artifact Developer ID signing, notarization, Gatekeeper approval, app-store submission, auto-update, or external distribution-channel QA");
