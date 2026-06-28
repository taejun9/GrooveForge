#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionPrivateInputKeys, loadDistributionLocalEnv } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const distributionLocalEnv = await loadDistributionLocalEnv({ root, allowedKeys: distributionPrivateInputKeys });
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const signingSummaryPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationRoot = path.join(packageRoot, "notarization-smoke");
const dmgRoot = path.join(notarizationRoot, "dmg-root");
const notarizationDmg = path.join(notarizationRoot, `${appName}-${packageJson.version}-${platformArch}-notary.dmg`);
const summaryPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-notarization.json`);
const submitEnvKey = "GROOVEFORGE_NOTARY_SUBMIT";
const commandTimeoutMs = 90000;
const notarySubmitTimeoutMs = 1800000;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge notarization smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function runCommand(command, args, timeoutMs = commandTimeoutMs) {
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
        error: `${command} timed out after ${timeoutMs}ms`
      });
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

function credentialSignals() {
  const appleIdCredentialsPresent =
    Boolean(process.env.APPLE_ID) &&
    Boolean(process.env.APPLE_TEAM_ID) &&
    Boolean(process.env.APPLE_APP_SPECIFIC_PASSWORD);
  const appStoreConnectApiKeyPresent =
    Boolean(process.env.ASC_KEY_ID) &&
    Boolean(process.env.ASC_ISSUER_ID) &&
    Boolean(process.env.ASC_KEY_PATH) &&
    existsSync(process.env.ASC_KEY_PATH);
  const notarytoolKeychainProfilePresent =
    Boolean(process.env.APPLE_NOTARY_PROFILE) ||
    Boolean(process.env.NOTARYTOOL_KEYCHAIN_PROFILE);

  return {
    appleIdCredentialKeysPresent: appleIdCredentialsPresent,
    appStoreConnectApiKeySignalPresent: appStoreConnectApiKeyPresent,
    notarytoolKeychainProfileSignalPresent: notarytoolKeychainProfilePresent,
    presentEnvironmentKeys: [
      "APPLE_ID",
      "APPLE_TEAM_ID",
      "APPLE_APP_SPECIFIC_PASSWORD",
      "ASC_KEY_ID",
      "ASC_ISSUER_ID",
      "ASC_KEY_PATH",
      "APPLE_NOTARY_PROFILE",
      "NOTARYTOOL_KEYCHAIN_PROFILE",
      submitEnvKey
    ].filter((key) => Boolean(process.env[key]))
  };
}

function credentialReady(signals) {
  return (
    signals.appleIdCredentialKeysPresent ||
    signals.appStoreConnectApiKeySignalPresent ||
    signals.notarytoolKeychainProfileSignalPresent
  );
}

function notaryAuthArgs(signals) {
  if (signals.notarytoolKeychainProfileSignalPresent) {
    return {
      mode: "keychain-profile",
      args: ["--keychain-profile", process.env.NOTARYTOOL_KEYCHAIN_PROFILE || process.env.APPLE_NOTARY_PROFILE]
    };
  }
  if (signals.appStoreConnectApiKeySignalPresent) {
    return {
      mode: "app-store-connect-api-key",
      args: ["--key", process.env.ASC_KEY_PATH, "--key-id", process.env.ASC_KEY_ID, "--issuer", process.env.ASC_ISSUER_ID]
    };
  }
  if (signals.appleIdCredentialKeysPresent) {
    return {
      mode: "apple-id",
      args: [
        "--apple-id",
        process.env.APPLE_ID,
        "--team-id",
        process.env.APPLE_TEAM_ID,
        "--password",
        process.env.APPLE_APP_SPECIFIC_PASSWORD
      ]
    };
  }
  return {
    mode: null,
    args: []
  };
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function parseNotarytoolJson(stdout) {
  try {
    return JSON.parse(stdout.trim());
  } catch {
    return null;
  }
}

async function prepareNotarizationDmg(signedAppPath) {
  await rm(notarizationRoot, { recursive: true, force: true });
  await mkdir(dmgRoot, { recursive: true });
  const copy = await runCommand("ditto", [signedAppPath, path.join(dmgRoot, `${appName}.app`)]);
  if (!copy.ok) {
    return {
      copy,
      createDmg: { ok: false }
    };
  }
  await symlink("/Applications", path.join(dmgRoot, "Applications"));
  const createDmg = await runCommand("hdiutil", [
    "create",
    "-volname",
    appName,
    "-fs",
    "HFS+",
    "-format",
    "UDZO",
    "-srcfolder",
    dmgRoot,
    notarizationDmg
  ]);
  return {
    copy,
    createDmg
  };
}

async function createNotarizationSummary() {
  const base = {
    appName,
    bundleId,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    submitEnvKey,
    localEnvInput: distributionLocalEnv,
    localEnvValueRecorded: false,
    credentialValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    notarySubmissionRequested: process.env[submitEnvKey] === "1",
    notarySubmissionAttempted: false,
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
      reason: "Notarization smoke is only meaningful on macOS",
      notarizationArtifactPrepared: false,
      notarizationAccepted: false,
      staplingAttempted: false,
      stapled: false,
      stapleValidationPassed: false,
      blockers: ["Run on macOS after Developer ID signing the isolated app copy."]
    };
  }

  const xcrun = await runCommand("which", ["xcrun"]);
  const hdiutil = await runCommand("which", ["hdiutil"]);
  const ditto = await runCommand("which", ["ditto"]);
  const notarytoolHelp = await runCommand("xcrun", ["notarytool", "submit", "--help"]);
  const staplerHelp = await runCommand("xcrun", ["stapler", "validate"]);
  const signingSummary = await readJsonIfExists(signingSummaryPath);
  const signedAppPath = signingSummary?.signedAppPath ? path.join(root, signingSummary.signedAppPath) : null;
  const signals = credentialSignals();
  const auth = notaryAuthArgs(signals);
  const blockers = [];

  if (!xcrun.ok) {
    blockers.push("macOS xcrun CLI is unavailable.");
  }
  if (!hdiutil.ok) {
    blockers.push("macOS hdiutil CLI is unavailable for isolated notarization DMG creation.");
  }
  if (!ditto.ok) {
    blockers.push("macOS ditto CLI is unavailable for isolated app copying.");
  }
  if (!notarytoolHelp.ok || !notarytoolHelp.stdout.includes("notarytool submit")) {
    blockers.push("xcrun notarytool submit is unavailable.");
  }
  if (!staplerHelp.stdout.includes("Usage: stapler") && !staplerHelp.stderr.includes("Usage: stapler")) {
    blockers.push("xcrun stapler is unavailable.");
  }
  if (!signingSummary) {
    blockers.push("Developer ID signing summary is missing; run npm run desktop:developer-id-signing-smoke first.");
  } else if (signingSummary.developerIdSigned !== true) {
    blockers.push("No Developer ID signed isolated app copy is available for notarization.");
  }
  if (signedAppPath && !existsSync(signedAppPath)) {
    blockers.push("Developer ID signed isolated app copy path from the signing summary does not exist.");
  }
  if (!credentialReady(signals)) {
    blockers.push("No bounded notary credential signal is present through Apple ID, App Store Connect API key, or notarytool keychain profile environment keys.");
  }
  if (!base.notarySubmissionRequested) {
    blockers.push(`Set ${submitEnvKey}=1 only after Developer ID signing and notary credentials are ready to attempt Apple notarization.`);
  }

  const canPrepareArtifact =
    hdiutil.ok &&
    ditto.ok &&
    signingSummary?.developerIdSigned === true &&
    signedAppPath &&
    existsSync(signedAppPath);
  let notarizationArtifactPrepared = false;
  let dittoCopyOk = false;
  let hdiutilCreateOk = false;
  let imageInfoOk = false;

  if (canPrepareArtifact) {
    const prepared = await prepareNotarizationDmg(signedAppPath);
    dittoCopyOk = prepared.copy.ok;
    hdiutilCreateOk = prepared.createDmg.ok;
    if (!prepared.copy.ok) {
      blockers.push("Could not copy the Developer ID signed app into the isolated notarization DMG source path.");
    }
    if (prepared.copy.ok && !prepared.createDmg.ok) {
      blockers.push("Could not create the isolated Developer ID signed DMG for notarization.");
    }
    const imageInfo = prepared.createDmg.ok ? await runCommand("hdiutil", ["imageinfo", notarizationDmg]) : { ok: false };
    imageInfoOk = imageInfo.ok;
    if (prepared.createDmg.ok && !imageInfo.ok) {
      blockers.push("Isolated notarization DMG did not pass hdiutil imageinfo.");
    }
    notarizationArtifactPrepared = prepared.copy.ok && prepared.createDmg.ok && imageInfo.ok;
  }

  const canSubmit =
    base.notarySubmissionRequested &&
    notarizationArtifactPrepared &&
    xcrun.ok &&
    notarytoolHelp.ok &&
    credentialReady(signals);
  let notarySubmissionAttempted = false;
  let notarizationAccepted = false;
  let notarytoolStatus = null;
  let notarytoolId = null;
  let staplingAttempted = false;
  let stapled = false;
  let stapleValidationPassed = false;

  if (canSubmit) {
    notarySubmissionAttempted = true;
    const submit = await runCommand(
      "xcrun",
      ["notarytool", "submit", "--wait", "--output-format", "json", ...auth.args, notarizationDmg],
      notarySubmitTimeoutMs
    );
    const submitJson = parseNotarytoolJson(submit.stdout);
    notarytoolStatus = submitJson?.status ?? null;
    notarytoolId = submitJson?.id ?? null;
    notarizationAccepted = submit.ok && notarytoolStatus === "Accepted";
    if (!notarizationAccepted) {
      blockers.push("Apple notarization did not return Accepted for the isolated DMG.");
    }
  }

  if (notarizationAccepted) {
    staplingAttempted = true;
    const staple = await runCommand("xcrun", ["stapler", "staple", "-v", notarizationDmg]);
    stapled = staple.ok;
    if (!stapled) {
      blockers.push("Stapling the accepted notarization ticket to the isolated DMG failed.");
    }
    const validate = stapled ? await runCommand("xcrun", ["stapler", "validate", "-v", notarizationDmg]) : { ok: false };
    stapleValidationPassed = validate.ok;
    if (stapled && !stapleValidationPassed) {
      blockers.push("Stapled isolated DMG did not pass stapler validation.");
    }
  }

  const notarizationReady = notarizationAccepted && stapled && stapleValidationPassed;

  return {
    ...base,
    skipped: false,
    tools: {
      xcrunAvailable: xcrun.ok,
      hdiutilAvailable: hdiutil.ok,
      dittoAvailable: ditto.ok,
      notarytoolSubmitAvailable: notarytoolHelp.ok && notarytoolHelp.stdout.includes("notarytool submit"),
      staplerAvailable: staplerHelp.stdout.includes("Usage: stapler") || staplerHelp.stderr.includes("Usage: stapler")
    },
    credentialSignals: signals,
    credentialMode: auth.mode,
    signingSummaryPath: relative(signingSummaryPath),
    developerIdSignedInputReady: signingSummary?.developerIdSigned === true && Boolean(signedAppPath) && existsSync(signedAppPath),
    signedAppPath: signedAppPath ? relative(signedAppPath) : null,
    notarizationDmgPath: notarizationArtifactPrepared ? relative(notarizationDmg) : null,
    notarizationArtifactPrepared,
    dittoCopyOk,
    hdiutilCreateOk,
    imageInfoOk,
    notarySubmissionAttempted,
    networkSubmissionAttempted: notarySubmissionAttempted,
    notarytoolStatus,
    notarytoolId,
    notarizationAccepted,
    staplingAttempted,
    stapled,
    stapleValidationPassed,
    notarizationReady,
    blockers
  };
}

const summary = await createNotarizationSummary();
await mkdir(path.dirname(summaryPath), { recursive: true });
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

check(summary.appName === appName, "notarization summary should identify GrooveForge");
check(summary.bundleId === bundleId, `notarization summary should identify ${bundleId}`);
check(summary.notarySubmissionAttempted === true || summary.networkSubmissionAttempted === false, "notarization smoke should stay network-free unless submission is explicit");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "notarization smoke should not claim primary release artifact Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "notarization smoke should not claim primary release artifact notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "notarization smoke should not claim Gatekeeper approval");
check(summary.releaseGateClaimedExternalDistribution === false, "notarization smoke should not claim external distribution completion");
check(summary.localEnvValueRecorded === false, "notarization summary should not record local env values");
check(summary.credentialValueRecorded === false, "notarization summary should not record credential values");
check(summary.developerIdIdentityValueRecorded === false, "notarization summary should not record Developer ID identity values");
check(Array.isArray(summary.blockers), "notarization summary should include a blockers array");
check(summary.notarizationReady === false || summary.blockers.length === 0, "ready notarization summary should not include blockers");

const summaryJson = JSON.stringify(summary);
for (const secretValue of [process.env.APPLE_APP_SPECIFIC_PASSWORD, process.env.ASC_PRIVATE_KEY].filter(Boolean)) {
  check(!summaryJson.includes(secretValue), "notarization summary should not include secret credential values");
}
for (const privateValue of distributionPrivateInputKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8)) {
  check(!summaryJson.includes(privateValue), "notarization summary should not include private distribution values");
}

if (failures.length > 0) {
  fail("Notarization validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge notarization smoke passed.");
console.log(`- Summary: ${relative(summaryPath)}`);
console.log(`- Submission requested: ${summary.notarySubmissionRequested === true ? "yes" : "no"}`);
console.log(`- Notarization artifact prepared: ${summary.notarizationArtifactPrepared === true ? "yes" : "no"}`);
console.log(`- Submission attempted: ${summary.notarySubmissionAttempted === true ? "yes" : "no"}`);
console.log(`- Notarization accepted: ${summary.notarizationAccepted === true ? "yes" : "no"}`);
console.log(`- Stapled: ${summary.stapled === true ? "yes" : "no"}`);
console.log(`- Staple validation passed: ${summary.stapleValidationPassed === true ? "yes" : "no"}`);
console.log(`- Local env file loaded: ${summary.localEnvInput?.enabled === true ? "yes" : "no"}`);
if (summary.notarizationDmgPath) {
  console.log(`- Isolated notarization DMG: ${summary.notarizationDmgPath}`);
}
if (summary.blockers.length > 0) {
  console.log(`- Blockers: ${summary.blockers.join(" | ")}`);
}
if (summary.notarySubmissionAttempted) {
  console.log(`- Network: Apple notary submission attempted by explicit ${submitEnvKey}=1`);
} else {
  console.log("- Network: no Apple notary submission attempted");
}
console.log("- Not recorded: local env values, credentials, tokens, identity labels, or channel values");
console.log("- Not claimed: primary release artifact Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
