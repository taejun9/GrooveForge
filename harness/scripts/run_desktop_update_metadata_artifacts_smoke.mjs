#!/usr/bin/env node

import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
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
const updateMetadataPolicyPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-policy.json`);
const developerIdSigningPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-notarized-gatekeeper.json`);
const latestMacPath = path.join(packageRoot, "latest-mac.yml");
const appUpdatePath = path.join(packageRoot, "app-update.yml");
const dmgBlockmapPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}.dmg.blockmap`);
const artifactSummaryPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-artifacts.json`);
const distributionLocalEnv = await loadDistributionLocalEnv({ root, allowedKeys: distributionPrivateInputKeys });
const feedKeys = ["GROOVEFORGE_UPDATE_FEED_URL", "ELECTRON_UPDATE_FEED_URL", "UPDATE_FEED_URL"];
const channelKeys = ["GROOVEFORGE_UPDATE_CHANNEL", "ELECTRON_UPDATE_CHANNEL", "UPDATE_CHANNEL"];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge update metadata artifacts smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

async function hashFile(filePath, algorithm) {
  return await new Promise((resolve, reject) => {
    const hash = createHash(algorithm);
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function yamlScalar(value) {
  return JSON.stringify(String(value));
}

function privateInputValues() {
  return distributionPrivateInputKeys
    .map((key) => process.env[key])
    .filter((value) => typeof value === "string" && value.trim().length >= 8);
}

async function writeTextArtifact(filePath, text) {
  await writeFile(filePath, `${text.trimEnd()}\n`, "utf8");
  const fileStats = await stat(filePath);
  return {
    path: relative(filePath),
    bytes: fileStats.size,
    sha256: await hashFile(filePath, "sha256")
  };
}

function notarizationReady(notarization) {
  return (
    notarization?.notarizationReady === true &&
    notarization?.notarizationAccepted === true &&
    notarization?.stapled === true &&
    notarization?.stapleValidationPassed === true &&
    typeof notarization?.notarizationDmgPath === "string" &&
    notarization.notarizationDmgPath.length > 0
  );
}

function selectUpdateSource(manifestDmgPath, signing, notarization, gatekeeper) {
  const notarizedDmgPath = notarizationReady(notarization)
    ? path.join(root, notarization.notarizationDmgPath)
    : null;
  const signedUpdateArtifact = {
    developerIdSigningSummaryPath: existsSync(developerIdSigningPath) ? relative(developerIdSigningPath) : null,
    notarizationSummaryPath: existsSync(notarizationPath) ? relative(notarizationPath) : null,
    notarizedGatekeeperSummaryPath: existsSync(notarizedGatekeeperPath) ? relative(notarizedGatekeeperPath) : null,
    developerIdSigned: signing?.developerIdSigned === true,
    notarizationReady: notarizationReady(notarization),
    notarizationDmgPath: notarizedDmgPath ? relative(notarizedDmgPath) : null,
    notarizationDmgPresent: Boolean(notarizedDmgPath) && existsSync(notarizedDmgPath),
    notarizedGatekeeperAccepted: gatekeeper?.notarizedGatekeeperAccepted === true,
    ready: false,
    selectedSource: "release-manifest-dmg",
    fallbackReason: null,
    valueRecorded: false
  };
  signedUpdateArtifact.ready =
    signedUpdateArtifact.developerIdSigned &&
    signedUpdateArtifact.notarizationReady &&
    signedUpdateArtifact.notarizationDmgPresent &&
    signedUpdateArtifact.notarizedGatekeeperAccepted;

  if (signedUpdateArtifact.ready && notarizedDmgPath) {
    return {
      path: notarizedDmgPath,
      selectedSource: "notarized-isolated-dmg",
      signedUpdateArtifact: {
        ...signedUpdateArtifact,
        selectedSource: "notarized-isolated-dmg"
      }
    };
  }

  return {
    path: manifestDmgPath,
    selectedSource: "release-manifest-dmg",
    signedUpdateArtifact: {
      ...signedUpdateArtifact,
      fallbackReason:
        "Using release manifest DMG until Developer ID signing, notarization/stapling, and notarized Gatekeeper evidence select the isolated notarized DMG."
    }
  };
}

async function createArtifacts() {
  const base = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    localEnvInput: distributionLocalEnv,
    localEnvValueRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    updateFeedPublishAttempted: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedExternalDistribution: false,
    feedValueRecorded: false,
    channelValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false
  };

  if (process.platform !== "darwin") {
    return {
      ...base,
      skipped: true,
      reason: "Update metadata artifact smoke currently targets the macOS desktop release artifact chain",
      updateMetadataArtifactsDrafted: false,
      updateMetadataArtifactsPublished: false,
      updateMetadataArtifactsReady: false,
      blockers: ["Run on macOS after desktop release manifest and update metadata policy generation."]
    };
  }

  check(existsSync(releaseManifestPath), "release manifest should exist before update metadata artifact smoke");
  check(existsSync(updateMetadataPolicyPath), "update metadata policy should exist before update metadata artifact smoke");
  if (failures.length > 0) {
    fail("Update metadata artifact preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  const manifest = JSON.parse(await readFile(releaseManifestPath, "utf8"));
  const policy = JSON.parse(await readFile(updateMetadataPolicyPath, "utf8"));
  const developerIdSigning = await readJsonIfExists(developerIdSigningPath);
  const notarization = await readJsonIfExists(notarizationPath);
  const notarizedGatekeeper = await readJsonIfExists(notarizedGatekeeperPath);
  const dmgRelativePath = manifest.dmg?.path;
  const manifestDmgPath = dmgRelativePath ? path.join(root, dmgRelativePath) : null;
  check(policy.policyAvailable === true, "update metadata policy should be available before artifact drafting");
  check(
    Boolean(manifestDmgPath) && existsSync(manifestDmgPath),
    "release manifest DMG path should exist before update metadata artifact smoke"
  );
  check(/^[a-f0-9]{64}$/.test(manifest.dmg?.sha256 ?? ""), "release manifest DMG SHA-256 checksum should be available");
  check(manifest.dmg?.bytes > 10000000, "release manifest DMG byte size should be substantial");
  if (failures.length > 0) {
    fail("Update metadata artifact source validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  const selectedUpdateSource = selectUpdateSource(manifestDmgPath, developerIdSigning, notarization, notarizedGatekeeper);
  const dmgPath = selectedUpdateSource.path;
  const dmgStats = await stat(dmgPath);
  const dmgSha256 = await hashFile(dmgPath, "sha256");
  const dmgSha512 = await hashFile(dmgPath, "sha512");
  const dmgFileName = path.basename(dmgPath);
  const releaseDate = new Date().toISOString();
  const latestMacYml = [
    `version: ${yamlScalar(packageJson.version)}`,
    "files:",
    `  - url: ${yamlScalar(dmgFileName)}`,
    `    sha512: ${yamlScalar(dmgSha512)}`,
    `    size: ${dmgStats.size}`,
    `path: ${yamlScalar(dmgFileName)}`,
    `sha512: ${yamlScalar(dmgSha512)}`,
    `releaseDate: ${yamlScalar(releaseDate)}`
  ].join("\n");
  const appUpdateYml = [
    "provider: generic",
    "url: REDACTED_UPDATE_FEED_URL",
    "channel: REDACTED_UPDATE_CHANNEL"
  ].join("\n");
  const draftBlockCount = Math.ceil(dmgStats.size / 65536);
  const blockmap = {
    version: packageJson.version,
    fileName: dmgFileName,
    size: dmgStats.size,
    sha256: dmgSha256,
    sha512: dmgSha512,
    blockMapSize: draftBlockCount,
    generatedAt: releaseDate,
    localDraftOnly: true,
    valueRecorded: false,
    releaseGateClaimedAutoUpdate: false
  };

  await mkdir(packageRoot, { recursive: true });
  const artifacts = {
    latestMac: await writeTextArtifact(latestMacPath, latestMacYml),
    appUpdate: await writeTextArtifact(appUpdatePath, appUpdateYml),
    dmgBlockmap: await writeTextArtifact(dmgBlockmapPath, JSON.stringify(blockmap, null, 2))
  };
  const requiredArtifactFiles = ["latest-mac.yml", "app-update.yml", `${appName}-${packageJson.version}-${platformArch}.dmg.blockmap`];
  const blockers = [];

  if (selectedUpdateSource.signedUpdateArtifact.developerIdSigned !== true) {
    blockers.push("Developer ID signed release artifact is required before update metadata can be published.");
  }
  if (
    selectedUpdateSource.signedUpdateArtifact.notarizationReady !== true ||
    selectedUpdateSource.signedUpdateArtifact.notarizationDmgPresent !== true
  ) {
    blockers.push("Notarized and stapled release artifact is required before update metadata can be published.");
  }
  if (selectedUpdateSource.signedUpdateArtifact.notarizedGatekeeperAccepted !== true) {
    blockers.push("Notarized Gatekeeper accepted release artifact is required before update metadata can be published.");
  }
  if (policy.prerequisites?.externalDistributionChannelQaClaimed !== true) {
    blockers.push("External distribution-channel QA is required before update metadata can be published.");
  }

  return {
    ...base,
    skipped: false,
    releaseManifestPath: relative(releaseManifestPath),
    updateMetadataPolicyPath: relative(updateMetadataPolicyPath),
    policyAvailable: policy.policyAvailable === true,
    sourceDmg: {
      path: relative(dmgPath),
      fileName: dmgFileName,
      selectedSource: selectedUpdateSource.selectedSource,
      fallbackFromSignedNotarizedArtifact: selectedUpdateSource.selectedSource !== "notarized-isolated-dmg",
      bytes: dmgStats.size,
      sha256: dmgSha256,
      sha512: dmgSha512
    },
    signedUpdateArtifact: selectedUpdateSource.signedUpdateArtifact,
    provider: {
      requiredFeedEnvironmentKeys: feedKeys,
      requiredChannelEnvironmentKeys: channelKeys,
      presentEnvironmentKeys: [...feedKeys, ...channelKeys].filter((key) => Boolean(process.env[key])),
      feedValueRecorded: false,
      channelValueRecorded: false
    },
    artifacts,
    requiredArtifactFiles,
    updateMetadataArtifactsDrafted: true,
    updateMetadataArtifactsPublished: false,
    updateMetadataArtifactsReady: false,
    blockers
  };
}

const summary = await createArtifacts();
await mkdir(packageRoot, { recursive: true });
await writeFile(artifactSummaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

check(summary.appName === appName, "update metadata artifact summary should identify GrooveForge");
check(summary.bundleId === bundleId, `update metadata artifact summary should identify ${bundleId}`);
check(summary.version === packageJson.version, "update metadata artifact summary should match package version");
check(summary.localEnvInput?.valueRecorded === false, "update metadata artifact summary should not record local env values");
check(summary.localEnvValueRecorded === false, "update metadata artifact summary should mark local env values as unrecorded");
check(summary.networkProbeAttempted === false, "update metadata artifact smoke should not probe update feeds");
check(summary.releaseUploadAttempted === false, "update metadata artifact smoke should not upload releases");
check(summary.updateFeedPublishAttempted === false, "update metadata artifact smoke should not publish update feeds");
check(summary.releaseGateClaimedAutoUpdate === false, "update metadata artifact smoke should not claim auto-update support");
check(summary.releaseGateClaimedExternalDistribution === false, "update metadata artifact smoke should not claim external distribution completion");
check(summary.feedValueRecorded === false, "update metadata artifact summary should not record feed values");
check(summary.channelValueRecorded === false, "update metadata artifact summary should not record channel values");

if (!summary.skipped) {
  check(summary.updateMetadataArtifactsDrafted === true, "update metadata artifacts should be drafted");
  check(summary.updateMetadataArtifactsPublished === false, "update metadata artifacts should not be published");
  check(summary.updateMetadataArtifactsReady === false, "update metadata artifacts should not claim readiness before signing/notarization/channel QA");
  check(summary.artifacts?.latestMac?.path.endsWith("latest-mac.yml"), "latest-mac.yml draft should be written");
  check(summary.artifacts?.appUpdate?.path.endsWith("app-update.yml"), "app-update.yml draft should be written");
  check(summary.artifacts?.dmgBlockmap?.path.endsWith(".dmg.blockmap"), "DMG blockmap draft should be written");
  check(/^[a-f0-9]{64}$/.test(summary.sourceDmg?.sha256 ?? ""), "source DMG SHA-256 should be recorded");
  check(/^[a-f0-9]{128}$/.test(summary.sourceDmg?.sha512 ?? ""), "source DMG SHA-512 should be recorded");
  check(summary.sourceDmg?.bytes > 10000000, "source DMG byte size should be substantial");
  check(
    summary.signedUpdateArtifact?.ready === false || summary.sourceDmg?.selectedSource === "notarized-isolated-dmg",
    "ready signed update artifact evidence should select the notarized isolated DMG"
  );
  check(summary.signedUpdateArtifact?.valueRecorded === false, "signed update artifact evidence should not record private values");
}

const serialized = JSON.stringify(summary);
for (const privateValue of privateInputValues()) {
  check(!serialized.includes(privateValue), "update metadata artifact summary should not include private distribution values");
}

for (const artifactPath of [latestMacPath, appUpdatePath, dmgBlockmapPath]) {
  if (!existsSync(artifactPath)) {
    continue;
  }
  const artifactText = await readFile(artifactPath, "utf8");
  for (const privateValue of privateInputValues()) {
    check(!artifactText.includes(privateValue), "update metadata artifact files should not include private distribution values");
  }
}

if (failures.length > 0) {
  fail("Update metadata artifact validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

if (summary.skipped) {
  console.log("GrooveForge update metadata artifacts smoke skipped.");
  console.log(`- Scope: ${summary.reason}`);
  process.exit(0);
}

console.log("GrooveForge update metadata artifacts smoke passed.");
console.log(`- Summary: ${relative(artifactSummaryPath)}`);
console.log(`- Local env file loaded: ${distributionLocalEnv.enabled ? "yes" : "no"}`);
console.log(`- Draft artifacts: ${summary.requiredArtifactFiles.join(", ")}`);
console.log(`- Source DMG: ${summary.sourceDmg.path}, ${summary.sourceDmg.bytes} bytes`);
console.log(`- Source selection: ${summary.sourceDmg.selectedSource}`);
console.log(`- Signed update artifact ready: ${summary.signedUpdateArtifact.ready ? "yes" : "no"}`);
console.log(`- Update metadata artifacts drafted: ${summary.updateMetadataArtifactsDrafted ? "yes" : "no"}`);
console.log(`- Update metadata artifacts published: ${summary.updateMetadataArtifactsPublished ? "yes" : "no"}`);
if (summary.blockers.length > 0) {
  console.log(`- Publish blockers: ${summary.blockers.join(" | ")}`);
}
console.log("- Network: no update feed probe, release upload, or feed publish attempted");
console.log("- Not recorded: feed URL values, channel values, local env values, credentials, or tokens");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, app-store submission, or external distribution-channel QA");
