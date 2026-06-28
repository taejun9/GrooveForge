#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const releaseManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const updateFeedConfigPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-update-feed-config.json`);
const updateMetadataPolicyPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-policy.json`);
const autoUpdateReadinessPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-auto-update-readiness.json`);
const developerIdSigningPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-notarized-gatekeeper.json`);
const summaryRoot = path.join(root, "build", "desktop");
const summaryPath = path.join(summaryRoot, `${appName}-${platformArch}-distribution-channel-qa.json`);
const distributionMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_DISTRIBUTION_QA_APPROVED"
];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge distribution-channel QA smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function readEnv(key) {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : "";
}

function validateHttpsUrl(value, label) {
  if (!value) {
    return [`${label} environment key is required for distribution-channel QA.`];
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return [`${label} must be an absolute HTTPS URL.`];
  }

  const blockers = [];
  if (parsed.protocol !== "https:") {
    blockers.push(`${label} must use HTTPS.`);
  }
  if (!parsed.hostname) {
    blockers.push(`${label} must include a hostname.`);
  }
  if (parsed.username || parsed.password) {
    blockers.push(`${label} must not include credentials.`);
  }
  if (parsed.hash) {
    blockers.push(`${label} must not include a fragment.`);
  }

  return blockers;
}

function distributionChannelSignals() {
  const distributionChannel = readEnv("GROOVEFORGE_DISTRIBUTION_CHANNEL");
  const downloadUrl = readEnv("GROOVEFORGE_RELEASE_DOWNLOAD_URL");
  const releaseNotesUrl = readEnv("GROOVEFORGE_RELEASE_NOTES_URL");
  const supportUrl = readEnv("GROOVEFORGE_SUPPORT_URL");
  const qaApproved = readEnv("GROOVEFORGE_DISTRIBUTION_QA_APPROVED") === "1";
  const blockers = [];

  if (!/^(direct-download|private-beta|managed-release)$/.test(distributionChannel)) {
    blockers.push("GROOVEFORGE_DISTRIBUTION_CHANNEL must be direct-download, private-beta, or managed-release.");
  }
  blockers.push(...validateHttpsUrl(downloadUrl, "GROOVEFORGE_RELEASE_DOWNLOAD_URL"));
  blockers.push(...validateHttpsUrl(releaseNotesUrl, "GROOVEFORGE_RELEASE_NOTES_URL"));
  blockers.push(...validateHttpsUrl(supportUrl, "GROOVEFORGE_SUPPORT_URL"));
  if (!qaApproved) {
    blockers.push("GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1 is required after manual channel QA with the selected signed release artifact.");
  }

  return {
    ready: blockers.length === 0,
    presentEnvironmentKeys: distributionMetadataKeys.filter((key) => Boolean(process.env[key])),
    distributionChannelKeyPresent: distributionChannel.length > 0,
    downloadUrlKeyPresent: downloadUrl.length > 0,
    releaseNotesUrlKeyPresent: releaseNotesUrl.length > 0,
    supportUrlKeyPresent: supportUrl.length > 0,
    manualQaApprovalKeyPresent: readEnv("GROOVEFORGE_DISTRIBUTION_QA_APPROVED").length > 0,
    manualQaApproved: qaApproved,
    valueRecorded: false,
    blockers
  };
}

function summarizeInputs(input) {
  const { manifest, updateFeedConfig, updatePolicy, autoUpdate, developerIdSigning, notarization, gatekeeper } = input;
  const signing = manifest?.signing ?? {};
  const releaseArtifactReady =
    Boolean(manifest) &&
    manifest.appBundle?.bundleIdentifier === bundleId &&
    /^[a-f0-9]{64}$/.test(manifest.dmg?.sha256 ?? "") &&
    Number(manifest.dmg?.bytes ?? 0) > 10000000 &&
    signing.externalDistributionChannelQaClaimed !== true &&
    signing.autoUpdateClaimed !== true;
  const updateFeedConfigSummaryPresent = Boolean(updateFeedConfig);
  const updateMetadataPolicyReady = updatePolicy?.policyAvailable === true;
  const autoUpdateReady = autoUpdate?.autoUpdateReady === true;
  const developerIdSigned = developerIdSigning?.developerIdSigned === true;
  const notarizedAndStapled =
    notarization?.notarizationReady === true &&
    notarization?.notarizationAccepted === true &&
    notarization?.stapled === true &&
    notarization?.stapleValidationPassed === true;
  const gatekeeperAccepted = gatekeeper?.notarizedGatekeeperAccepted === true;

  return {
    releaseArtifactReady,
    releaseManifestPresent: Boolean(manifest),
    releaseManifestPath: existsSync(releaseManifestPath) ? relative(releaseManifestPath) : null,
    updateFeedConfigSummaryPresent,
    updateFeedConfigPath: existsSync(updateFeedConfigPath) ? relative(updateFeedConfigPath) : null,
    updateMetadataPolicyReady,
    updateMetadataPolicyPath: existsSync(updateMetadataPolicyPath) ? relative(updateMetadataPolicyPath) : null,
    autoUpdateReady,
    autoUpdateReadinessPath: existsSync(autoUpdateReadinessPath) ? relative(autoUpdateReadinessPath) : null,
    developerIdSigned,
    developerIdSigningPath: existsSync(developerIdSigningPath) ? relative(developerIdSigningPath) : null,
    notarizedAndStapled,
    notarizationPath: existsSync(notarizationPath) ? relative(notarizationPath) : null,
    gatekeeperAccepted,
    notarizedGatekeeperPath: existsSync(notarizedGatekeeperPath) ? relative(notarizedGatekeeperPath) : null
  };
}

async function createDistributionSummary() {
  const base = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedExternalDistribution: false
  };

  if (process.platform !== "darwin") {
    return {
      ...base,
      skipped: true,
      reason: "Distribution-channel QA smoke currently targets the macOS desktop release artifact chain",
      externalDistributionReady: false,
      blockers: ["Run on macOS after the desktop release readiness chain."]
    };
  }

  const manifest = await readJsonIfExists(releaseManifestPath);
  const updateFeedConfig = await readJsonIfExists(updateFeedConfigPath);
  const updatePolicy = await readJsonIfExists(updateMetadataPolicyPath);
  const autoUpdate = await readJsonIfExists(autoUpdateReadinessPath);
  const developerIdSigning = await readJsonIfExists(developerIdSigningPath);
  const notarization = await readJsonIfExists(notarizationPath);
  const gatekeeper = await readJsonIfExists(notarizedGatekeeperPath);
  const channel = distributionChannelSignals();
  const inputs = summarizeInputs({ manifest, updateFeedConfig, updatePolicy, autoUpdate, developerIdSigning, notarization, gatekeeper });
  const blockers = [...channel.blockers];

  if (!inputs.releaseArtifactReady) {
    blockers.push("Release manifest is missing or does not describe a substantial unclaimed GrooveForge DMG artifact.");
  }
  if (!inputs.updateFeedConfigSummaryPresent) {
    blockers.push("Update feed config summary is missing; run npm run desktop:update-feed-config-smoke first.");
  }
  if (!inputs.updateMetadataPolicyReady) {
    blockers.push("Update metadata policy summary is missing or unavailable.");
  }
  if (!inputs.autoUpdateReady) {
    blockers.push("Auto-update readiness is not complete for the selected distribution channel.");
  }
  if (!inputs.developerIdSigned) {
    blockers.push("Developer ID signed isolated app copy is not available for channel QA.");
  }
  if (!inputs.notarizedAndStapled) {
    blockers.push("Notarized and stapled isolated release artifact is not available for channel QA.");
  }
  if (!inputs.gatekeeperAccepted) {
    blockers.push("Notarized Gatekeeper assessment has not accepted the selected release artifact.");
  }

  return {
    ...base,
    skipped: false,
    distributionMetadataKeys,
    channel,
    inputs,
    externalDistributionReady:
      channel.ready &&
      inputs.releaseArtifactReady &&
      inputs.updateFeedConfigSummaryPresent &&
      inputs.updateMetadataPolicyReady &&
      inputs.autoUpdateReady &&
      inputs.developerIdSigned &&
      inputs.notarizedAndStapled &&
      inputs.gatekeeperAccepted,
    blockers
  };
}

const summary = await createDistributionSummary();
await mkdir(summaryRoot, { recursive: true });
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

check(summary.appName === appName, "distribution-channel QA summary should identify GrooveForge");
check(summary.bundleId === bundleId, `distribution-channel QA summary should identify ${bundleId}`);
check(summary.networkProbeAttempted === false, "distribution-channel QA smoke should not probe remote channels");
check(summary.releaseUploadAttempted === false, "distribution-channel QA smoke should not upload release artifacts");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "distribution-channel QA smoke should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "distribution-channel QA smoke should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "distribution-channel QA smoke should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "distribution-channel QA smoke should not claim auto-update");
check(summary.releaseGateClaimedExternalDistribution === false, "distribution-channel QA smoke should not claim external distribution completion");
check(summary.channel?.valueRecorded === false, "distribution-channel QA summary should not record private channel metadata values");
check(Array.isArray(summary.blockers), "distribution-channel QA summary should include blockers");
check(summary.externalDistributionReady === false || summary.blockers.length === 0, "ready distribution summary should not include blockers");

const summaryJson = JSON.stringify(summary);
for (const privateValue of [
  process.env.GROOVEFORGE_RELEASE_DOWNLOAD_URL,
  process.env.GROOVEFORGE_RELEASE_NOTES_URL,
  process.env.GROOVEFORGE_SUPPORT_URL
].filter(Boolean)) {
  check(!summaryJson.includes(privateValue), "distribution-channel QA summary should not include private distribution URL values");
}

if (failures.length > 0) {
  fail("Distribution-channel QA validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge distribution-channel QA smoke passed.");
console.log(`- Summary: ${relative(summaryPath)}`);
console.log(`- Channel metadata ready: ${summary.channel?.ready === true ? "yes" : "no"}`);
console.log(`- Release artifact ready: ${summary.inputs?.releaseArtifactReady === true ? "yes" : "no"}`);
console.log(`- Auto-update ready: ${summary.inputs?.autoUpdateReady === true ? "yes" : "no"}`);
console.log(`- Developer ID signed: ${summary.inputs?.developerIdSigned === true ? "yes" : "no"}`);
console.log(`- Notarized and stapled: ${summary.inputs?.notarizedAndStapled === true ? "yes" : "no"}`);
console.log(`- Notarized Gatekeeper accepted: ${summary.inputs?.gatekeeperAccepted === true ? "yes" : "no"}`);
console.log(`- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}`);
if (summary.blockers.length > 0) {
  console.log(`- Blockers: ${summary.blockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe or upload attempted");
console.log("- Not recorded: release URLs, support URLs, credentials, tokens, or private feed values");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
