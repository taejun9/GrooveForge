#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionPrivateInputKeys, loadDistributionLocalEnv } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const distributionLocalEnv = await loadDistributionLocalEnv({ root, allowedKeys: distributionPrivateInputKeys });
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const platformArch = `${process.platform}-${process.arch}`;
const readinessRoot = path.join(root, "build", "desktop");
const readinessPath = path.join(readinessRoot, `${appName}-${platformArch}-developer-id-readiness.json`);
const commandTimeoutMs = 30000;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge Developer ID readiness smoke failed:");
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

function environmentSignals() {
  const hasAppleIdCredentials =
    Boolean(process.env.APPLE_ID) &&
    Boolean(process.env.APPLE_TEAM_ID) &&
    Boolean(process.env.APPLE_APP_SPECIFIC_PASSWORD);
  const hasApiKeyCredentials =
    Boolean(process.env.ASC_KEY_ID) &&
    Boolean(process.env.ASC_ISSUER_ID) &&
    Boolean(process.env.ASC_KEY_PATH) &&
    existsSync(process.env.ASC_KEY_PATH);
  const hasKeychainProfile =
    Boolean(process.env.APPLE_NOTARY_PROFILE) ||
    Boolean(process.env.NOTARYTOOL_KEYCHAIN_PROFILE);

  return {
    appleIdCredentialKeysPresent: hasAppleIdCredentials,
    appStoreConnectApiKeySignalPresent: hasApiKeyCredentials,
    notarytoolKeychainProfileSignalPresent: hasKeychainProfile,
    presentEnvironmentKeys: [
      "APPLE_ID",
      "APPLE_TEAM_ID",
      "APPLE_APP_SPECIFIC_PASSWORD",
      "ASC_KEY_ID",
      "ASC_ISSUER_ID",
      "ASC_KEY_PATH",
      "APPLE_NOTARY_PROFILE",
      "NOTARYTOOL_KEYCHAIN_PROFILE"
    ].filter((key) => Boolean(process.env[key]))
  };
}

async function createReadinessSummary() {
  const base = {
    appName,
    bundleId,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    localEnvInput: distributionLocalEnv,
    localEnvValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    credentialValueRecorded: false,
    networkSubmissionAttempted: false,
    releaseGateClaimedExternalDistribution: false
  };

  if (process.platform !== "darwin") {
    return {
      ...base,
      skipped: true,
      reason: "Developer ID readiness smoke is only meaningful on macOS",
      externalDistributionReady: false,
      blockers: ["Run on macOS with Apple Developer signing and notary prerequisites available."]
    };
  }

  const codesign = await runCommand("which", ["codesign"]);
  const security = await runCommand("security", ["find-identity", "-v", "-p", "codesigning"]);
  const notarytool = await runCommand("xcrun", ["notarytool", "--help"]);
  const stapler = await runCommand("xcrun", ["stapler", "validate", "--help"]);
  const signatureOutput = `${security.stdout}\n${security.stderr}`;
  const developerIdApplicationIdentities = parseDeveloperIdIdentities(signatureOutput);
  const credentialSignals = environmentSignals();
  const notarizationCredentialSignalReady =
    credentialSignals.appleIdCredentialKeysPresent ||
    credentialSignals.appStoreConnectApiKeySignalPresent ||
    credentialSignals.notarytoolKeychainProfileSignalPresent;
  const blockers = [];

  if (!codesign.ok) {
    blockers.push("macOS codesign CLI is unavailable.");
  }
  if (!security.ok) {
    blockers.push("macOS security CLI could not inspect code-signing identities.");
  }
  if (developerIdApplicationIdentities.length === 0) {
    blockers.push("No valid Developer ID Application identity is installed in the current keychain search list.");
  }
  if (!notarytool.ok) {
    blockers.push("xcrun notarytool is unavailable.");
  }
  if (!stapler.stdout.includes("Usage: stapler") && !stapler.stderr.includes("Usage: stapler")) {
    blockers.push("xcrun stapler is unavailable.");
  }
  if (!notarizationCredentialSignalReady) {
    blockers.push("No bounded notary credential signal is present through Apple ID, App Store Connect API key, or notarytool keychain profile environment keys.");
  }

  const developerIdSigningReady = codesign.ok && security.ok && developerIdApplicationIdentities.length > 0;
  const notarizationReady = notarytool.ok && notarizationCredentialSignalReady;
  const staplerReady = stapler.stdout.includes("Usage: stapler") || stapler.stderr.includes("Usage: stapler");

  return {
    ...base,
    skipped: false,
    tools: {
      codesignAvailable: codesign.ok,
      securityIdentityInspectionAvailable: security.ok,
      notarytoolAvailable: notarytool.ok,
      staplerAvailable: staplerReady
    },
    developerIdSigning: {
      ready: developerIdSigningReady,
      validDeveloperIdApplicationIdentityCount: developerIdApplicationIdentities.length,
      identityValuesRecorded: false
    },
    notarization: {
      ready: notarizationReady,
      credentialSignals,
      submissionAttempted: false
    },
    stapling: {
      ready: staplerReady,
      validationAttempted: false
    },
    externalDistributionReady: developerIdSigningReady && notarizationReady && staplerReady,
    blockers
  };
}

const readiness = await createReadinessSummary();
await mkdir(readinessRoot, { recursive: true });
await writeFile(readinessPath, `${JSON.stringify(readiness, null, 2)}\n`, "utf8");

check(readiness.appName === appName, "readiness summary should identify GrooveForge");
check(readiness.bundleId === bundleId, `readiness summary should identify ${bundleId}`);
check(readiness.networkSubmissionAttempted === false, "readiness smoke should not submit to Apple notary services");
check(readiness.releaseGateClaimedExternalDistribution === false, "readiness smoke should not claim external distribution completion");
check(readiness.localEnvValueRecorded === false, "readiness summary should not record local env values");
check(readiness.developerIdIdentityValueRecorded === false, "readiness summary should not record Developer ID identity values");
check(readiness.credentialValueRecorded === false, "readiness summary should not record credential values");
check(Array.isArray(readiness.blockers), "readiness summary should include a blockers array");
check(readiness.externalDistributionReady === false || readiness.blockers.length === 0, "ready summary should not include blockers");

const readinessJson = JSON.stringify(readiness);
check(!readinessJson.includes(process.env.APPLE_APP_SPECIFIC_PASSWORD ?? "__missing_secret__"), "readiness summary should not include Apple app-specific password values");
check(!readinessJson.includes(process.env.ASC_PRIVATE_KEY ?? "__missing_secret__"), "readiness summary should not include App Store Connect private key values");
for (const privateValue of distributionPrivateInputKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8)) {
  check(!readinessJson.includes(privateValue), "readiness summary should not include private distribution values");
}

if (failures.length > 0) {
  fail("Developer ID readiness validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge Developer ID readiness smoke passed.");
console.log(`- Summary: ${relative(readinessPath)}`);
console.log(`- Developer ID signing ready: ${readiness.developerIdSigning?.ready === true ? "yes" : "no"}`);
console.log(`- Notarization credential signal ready: ${readiness.notarization?.ready === true ? "yes" : "no"}`);
console.log(`- External distribution ready: ${readiness.externalDistributionReady ? "yes" : "no"}`);
console.log(`- Local env file loaded: ${readiness.localEnvInput?.enabled === true ? "yes" : "no"}`);
if (readiness.blockers.length > 0) {
  console.log(`- Blockers: ${readiness.blockers.join(" | ")}`);
}
console.log("- Network: no Apple notary submission attempted");
console.log("- Not recorded: local env values, credentials, tokens, identity labels, or channel values");
