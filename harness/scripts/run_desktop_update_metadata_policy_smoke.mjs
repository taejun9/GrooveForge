#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionPrivateInputKeys, loadDistributionLocalEnv } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const releaseManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const policyPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-policy.json`);
const distributionLocalEnv = await loadDistributionLocalEnv({ root, allowedKeys: distributionPrivateInputKeys });
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge update metadata policy smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function providerSignals() {
  const feedKeys = ["GROOVEFORGE_UPDATE_FEED_URL", "ELECTRON_UPDATE_FEED_URL", "UPDATE_FEED_URL"];
  const channelKeys = ["GROOVEFORGE_UPDATE_CHANNEL", "ELECTRON_UPDATE_CHANNEL", "UPDATE_CHANNEL"];
  return {
    requiredFeedEnvironmentKeys: feedKeys,
    requiredChannelEnvironmentKeys: channelKeys,
    presentEnvironmentKeys: [...feedKeys, ...channelKeys].filter((key) => Boolean(process.env[key])),
    feedValueRecorded: false,
    channelValueRecorded: false
  };
}

function privateInputValues() {
  return distributionPrivateInputKeys
    .map((key) => process.env[key])
    .filter((value) => typeof value === "string" && value.trim().length >= 8);
}

function requiredMetadataArtifacts(version, platformLabel) {
  return [
    {
      kind: "latest mac update manifest",
      fileName: "latest-mac.yml",
      requiredFields: ["version", "files", "path", "sha512", "releaseDate"],
      publishOnlyAfter: ["Developer ID signing", "notarization", "stapling", "Gatekeeper acceptance"]
    },
    {
      kind: "app update channel manifest",
      fileName: "app-update.yml",
      requiredFields: ["provider", "url", "channel"],
      publishOnlyAfter: ["feed provider selection", "private feed value review"]
    },
    {
      kind: "disk image blockmap",
      fileName: `${appName}-${version}-${platformLabel}.dmg.blockmap`,
      requiredFields: ["size", "sha512", "blockMapSize"],
      publishOnlyAfter: ["notarized DMG finalization"]
    }
  ];
}

async function createPolicy() {
  const base = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    releaseManifestPath: relative(releaseManifestPath),
    networkProbeAttempted: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedExternalDistribution: false,
    localEnvInput: distributionLocalEnv,
    localEnvValueRecorded: false
  };

  if (process.platform !== "darwin") {
    return {
      ...base,
      skipped: true,
      reason: "Update metadata policy smoke currently targets the macOS desktop release artifact chain",
      policyAvailable: false,
      updateMetadataArtifactsReady: false,
      blockers: ["Run on macOS after desktop release manifest generation."]
    };
  }

  check(existsSync(releaseManifestPath), "release manifest should exist before update metadata policy smoke");
  if (failures.length > 0) {
    fail("Update metadata policy preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  const manifest = JSON.parse(await readFile(releaseManifestPath, "utf8"));
  const signing = manifest.signing ?? {};
  const provider = providerSignals();
  const metadataArtifacts = requiredMetadataArtifacts(packageJson.version, platformArch);
  const sourceArtifacts = {
    releaseManifest: {
      path: relative(releaseManifestPath)
    },
    appBundle: {
      path: manifest.appBundle?.path ?? null,
      bundleIdentifier: manifest.appBundle?.bundleIdentifier ?? null,
      files: manifest.appBundle?.files ?? null,
      bytes: manifest.appBundle?.bytes ?? null
    },
    dmg: {
      path: manifest.dmg?.path ?? null,
      sha256: manifest.dmg?.sha256 ?? null,
      bytes: manifest.dmg?.bytes ?? null
    }
  };
  const prerequisites = {
    requiresDeveloperIdSigning: true,
    developerIdCodeSigningClaimed: signing.developerIdCodeSigningClaimed === true,
    requiresNotarization: true,
    notarizationClaimed: signing.notarizationClaimed === true,
    requiresGatekeeperAcceptance: true,
    gatekeeperApprovalClaimed: false,
    requiresSignedMetadataArtifacts: true,
    updateMetadataArtifactsClaimed: false,
    requiresExternalDistributionQa: true,
    externalDistributionChannelQaClaimed: signing.externalDistributionChannelQaClaimed === true
  };
  const blockers = [];

  if (sourceArtifacts.appBundle.bundleIdentifier !== bundleId) {
    blockers.push(`Release manifest app bundle id should be ${bundleId}.`);
  }
  if (!/^[a-f0-9]{64}$/.test(sourceArtifacts.dmg.sha256 ?? "")) {
    blockers.push("Release manifest DMG SHA-256 checksum is missing.");
  }
  if (sourceArtifacts.dmg.bytes <= 10000000) {
    blockers.push("Release manifest DMG byte size is not substantial.");
  }
  if (!prerequisites.developerIdCodeSigningClaimed) {
    blockers.push("Developer ID signed release artifact is required before publishing update metadata.");
  }
  if (!prerequisites.notarizationClaimed) {
    blockers.push("Notarized and stapled release artifact is required before publishing update metadata.");
  }
  if (!prerequisites.externalDistributionChannelQaClaimed) {
    blockers.push("External distribution-channel QA is required before update metadata can be published.");
  }

  return {
    ...base,
    skipped: false,
    policyAvailable: true,
    policyScope: "local signed/notarized update metadata requirements",
    provider,
    metadataArtifacts,
    sourceArtifacts,
    prerequisites,
    updateMetadataArtifactsReady:
      prerequisites.developerIdCodeSigningClaimed &&
      prerequisites.notarizationClaimed &&
      prerequisites.updateMetadataArtifactsClaimed &&
      prerequisites.externalDistributionChannelQaClaimed,
    blockers
  };
}

const policy = await createPolicy();
await mkdir(packageRoot, { recursive: true });
await writeFile(policyPath, `${JSON.stringify(policy, null, 2)}\n`, "utf8");

check(policy.appName === appName, "update metadata policy should identify GrooveForge");
check(policy.bundleId === bundleId, `update metadata policy should identify ${bundleId}`);
check(policy.version === packageJson.version, "update metadata policy should match package version");
check(policy.networkProbeAttempted === false, "update metadata policy smoke should not probe remote update feeds");
check(policy.releaseGateClaimedAutoUpdate === false, "update metadata policy smoke should not claim auto-update support");
check(policy.releaseGateClaimedDeveloperIdSigning === false, "update metadata policy smoke should not claim Developer ID signing");
check(policy.releaseGateClaimedNotarization === false, "update metadata policy smoke should not claim notarization");
check(policy.releaseGateClaimedGatekeeperApproval === false, "update metadata policy smoke should not claim Gatekeeper approval");
check(policy.releaseGateClaimedExternalDistribution === false, "update metadata policy smoke should not claim external distribution completion");
check(policy.provider?.feedValueRecorded === false, "update metadata policy should not record private update feed values");
check(policy.provider?.channelValueRecorded === false, "update metadata policy should not record private update channel values");
check(policy.localEnvInput?.valueRecorded === false, "update metadata policy should not record local env values");
check(policy.localEnvValueRecorded === false, "update metadata policy should mark local env values as unrecorded");
check(Array.isArray(policy.metadataArtifacts), "update metadata policy should list required metadata artifacts");
check(Array.isArray(policy.blockers), "update metadata policy should include a blockers array");
check(policy.updateMetadataArtifactsReady === false || policy.blockers.length === 0, "ready update metadata policy should not include blockers");

const policyJson = JSON.stringify(policy);
for (const privateValue of [
  process.env.GROOVEFORGE_UPDATE_FEED_URL,
  process.env.ELECTRON_UPDATE_FEED_URL,
  process.env.UPDATE_FEED_URL
].filter(Boolean)) {
  check(!policyJson.includes(privateValue), "update metadata policy should not include private update feed values");
}
for (const privateValue of privateInputValues()) {
  check(!policyJson.includes(privateValue), "update metadata policy should not include private distribution values");
}

if (failures.length > 0) {
  fail("Update metadata policy validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge update metadata policy smoke passed.");
console.log(`- Policy: ${relative(policyPath)}`);
console.log(`- Local env file loaded: ${distributionLocalEnv.enabled ? "yes" : "no"}`);
console.log(`- Policy available: ${policy.policyAvailable === true ? "yes" : "no"}`);
console.log(`- Required metadata artifacts: ${policy.metadataArtifacts?.map((artifact) => artifact.fileName).join(", ") ?? "none"}`);
console.log(`- Update metadata artifacts ready: ${policy.updateMetadataArtifactsReady ? "yes" : "no"}`);
if (policy.blockers.length > 0) {
  console.log(`- Blockers: ${policy.blockers.join(" | ")}`);
}
console.log("- Network: no update feed probe attempted");
console.log("- Not recorded: feed URL values, channel values, local env values, credentials, or tokens");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, app-store submission, or external distribution-channel QA");
