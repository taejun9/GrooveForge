#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { distributionPrivateInputKeys, loadDistributionLocalEnv } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJsonPath = path.join(root, "package.json");
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const manifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const updateMetadataPolicyPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-policy.json`);
const updateMetadataArtifactsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-artifacts.json`);
const readinessRoot = path.join(root, "build", "desktop");
const readinessPath = path.join(readinessRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const updateFeedModule = await import(pathToFileURL(path.join(root, "electron", "updateFeedConfig.ts")).href);
const { redactUpdateFeedConfig, resolveUpdateFeedConfig } = updateFeedModule;
const distributionLocalEnv = await loadDistributionLocalEnv({ root, allowedKeys: distributionPrivateInputKeys });
const sourcePaths = [
  "electron/main.ts",
  "electron/updateFeedConfig.ts",
  "electron/preload.cts",
  "dist-electron/main.js",
  "dist-electron/updateFeedConfig.js",
  "dist-electron/preload.cjs"
];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge auto-update readiness smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function hasDependency(name) {
  return Boolean(packageJson.dependencies?.[name] || packageJson.devDependencies?.[name]);
}

async function readIfExists(filePath) {
  if (!existsSync(filePath)) {
    return "";
  }
  return await readFile(filePath, "utf8");
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function updateProviderSignals() {
  const publishConfig = packageJson.build?.publish ?? packageJson.publish ?? null;
  const updateFeedConfig = redactUpdateFeedConfig(resolveUpdateFeedConfig());

  return {
    packagePublishConfigPresent: publishConfig !== null,
    updateFeedConfig,
    updateFeedConfigReady: updateFeedConfig.ready,
    environmentFeedUrlKeyPresent: updateFeedConfig.feedUrlPresent,
    environmentChannelKeyPresent: updateFeedConfig.releaseChannelPresent,
    environmentFeedUrlValid: updateFeedConfig.feedUrlValid,
    environmentChannelValid: updateFeedConfig.releaseChannelValid,
    presentEnvironmentKeys: updateFeedConfig.presentEnvironmentKeys,
    // Do not store feed values in readiness output; URLs can reveal private release infrastructure.
    channelValueRecorded: false,
    feedValueRecorded: false,
    publishConfigValueRecorded: false
  };
}

function privateInputValues() {
  return distributionPrivateInputKeys
    .map((key) => process.env[key])
    .filter((value) => typeof value === "string" && value.trim().length >= 8);
}

function updateArtifactSignals(manifest, policy, metadataArtifacts) {
  const signing = manifest?.signing ?? {};
  const releaseFiles = [
    "latest.yml",
    "latest-mac.yml",
    "app-update.yml",
    `${appName}-${packageJson.version}-${platformArch}.blockmap`,
    `${appName}-${packageJson.version}-${platformArch}.dmg.blockmap`
  ];
  const updateMetadataFiles = releaseFiles
    .map((fileName) => path.join(packageRoot, fileName))
    .filter((filePath) => existsSync(filePath))
    .map(relative);
  const requiredUpdateMetadataArtifacts = Array.isArray(policy?.metadataArtifacts)
    ? policy.metadataArtifacts.map((artifact) => artifact.fileName).filter(Boolean)
    : [];
  const requiredUpdateMetadataArtifactsPresent = requiredUpdateMetadataArtifacts.every((fileName) =>
    updateMetadataFiles.some((filePath) => filePath.endsWith(fileName))
  );
  return {
    releaseManifestPresent: Boolean(manifest),
    releaseManifestPath: existsSync(manifestPath) ? relative(manifestPath) : null,
    updateMetadataPolicyPresent: Boolean(policy),
    updateMetadataPolicyPath: existsSync(updateMetadataPolicyPath) ? relative(updateMetadataPolicyPath) : null,
    updateMetadataArtifactsPresent: Boolean(metadataArtifacts),
    updateMetadataArtifactsPath: existsSync(updateMetadataArtifactsPath) ? relative(updateMetadataArtifactsPath) : null,
    updateMetadataArtifactsDrafted: metadataArtifacts?.updateMetadataArtifactsDrafted === true,
    updateMetadataArtifactsPublished: metadataArtifacts?.updateMetadataArtifactsPublished === true,
    updateMetadataArtifactsReady: metadataArtifacts?.updateMetadataArtifactsReady === true,
    updateMetadataArtifactsRecordsFeedValue: metadataArtifacts?.feedValueRecorded === true,
    updateMetadataArtifactsRecordsChannelValue: metadataArtifacts?.channelValueRecorded === true,
    updateMetadataPolicyAvailable: policy?.policyAvailable === true,
    updateMetadataPolicyClaimsAutoUpdate: policy?.releaseGateClaimedAutoUpdate === true,
    updateMetadataPolicyRecordsFeedValue: policy?.provider?.feedValueRecorded === true,
    requiredUpdateMetadataArtifacts,
    requiredUpdateMetadataArtifactsPresent,
    developerIdCodeSigningClaimed: signing.developerIdCodeSigningClaimed === true,
    notarizationClaimed: signing.notarizationClaimed === true,
    autoUpdateClaimedByManifest: signing.autoUpdateClaimed === true,
    updateMetadataFiles,
    updateMetadataFilesReady:
      metadataArtifacts?.updateMetadataArtifactsDrafted === true &&
      requiredUpdateMetadataArtifacts.length > 0 &&
      requiredUpdateMetadataArtifactsPresent
  };
}

async function sourceSignals() {
  const sourceTexts = await Promise.all(sourcePaths.map(async (sourcePath) => readIfExists(path.join(root, sourcePath))));
  const combined = sourceTexts.join("\n");
  return {
    inspectedPaths: sourcePaths.filter((sourcePath) => existsSync(path.join(root, sourcePath))),
    usesElectronAutoUpdaterApi: /\bautoUpdater\b/.test(combined),
    usesElectronUpdaterPackage: /electron-updater|update-electron-app/.test(combined),
    hasCheckForUpdatesCall: /checkForUpdates|checkForUpdatesAndNotify/.test(combined),
    hasUpdateDownloadedHandler: /update-downloaded|quitAndInstall/.test(combined),
    hasUserFacingUpdateCopy: /update available|install update|check for updates|auto-update|automatic update/i.test(combined)
  };
}

async function createReadinessSummary() {
  const base = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    networkProbeAttempted: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedExternalDistribution: false,
    localEnvInput: distributionLocalEnv,
    localEnvValueRecorded: false
  };

  if (process.platform !== "darwin") {
    return {
      ...base,
      skipped: true,
      reason: "Auto-update readiness smoke currently targets the macOS desktop release artifact chain",
      autoUpdateReady: false,
      blockers: ["Run on macOS after desktop release manifest generation."]
    };
  }

  check(existsSync(manifestPath), "release manifest should exist before auto-update readiness smoke");
  if (failures.length > 0) {
    fail("Auto-update readiness preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const policy = await readJsonIfExists(updateMetadataPolicyPath);
  const metadataArtifacts = await readJsonIfExists(updateMetadataArtifactsPath);
  const dependencies = {
    electronBuiltInAutoUpdaterAvailable: hasDependency("electron"),
    electronUpdaterPresent: hasDependency("electron-updater"),
    updateElectronAppPresent: hasDependency("update-electron-app"),
    updaterDependencyPresent: hasDependency("electron") || hasDependency("electron-updater") || hasDependency("update-electron-app")
  };
  const provider = updateProviderSignals();
  const artifacts = updateArtifactSignals(manifest, policy, metadataArtifacts);
  const source = await sourceSignals();
  const providerReady = provider.packagePublishConfigPresent || provider.updateFeedConfigReady;
  const updaterIntegrationReady =
    dependencies.updaterDependencyPresent &&
    (source.usesElectronAutoUpdaterApi || source.usesElectronUpdaterPackage) &&
    source.hasCheckForUpdatesCall;
  const updateMetadataPolicyReady =
    artifacts.updateMetadataPolicyAvailable &&
    artifacts.requiredUpdateMetadataArtifacts.length > 0 &&
    artifacts.updateMetadataPolicyClaimsAutoUpdate === false &&
    artifacts.updateMetadataPolicyRecordsFeedValue === false;
  const signedUpdateArtifactsReady =
    updateMetadataPolicyReady &&
    artifacts.updateMetadataFilesReady &&
    artifacts.developerIdCodeSigningClaimed &&
    artifacts.notarizationClaimed;
  const userFacingUpdateBehaviorReady = source.hasUserFacingUpdateCopy && source.hasUpdateDownloadedHandler;
  const blockers = [];

  if (!updaterIntegrationReady) {
    blockers.push("No Electron auto-update API integration with update checking is implemented.");
  }
  if (!providerReady) {
    if (provider.environmentFeedUrlKeyPresent || provider.environmentChannelKeyPresent) {
      blockers.push("Update provider/feed/channel metadata is present but fails local validation.");
    } else {
      blockers.push("No update provider, feed URL, and channel metadata are configured.");
    }
  }
  if (!updateMetadataPolicyReady) {
    blockers.push("No signed/notarized update metadata artifact policy is available for automatic updates.");
  }
  if (updateMetadataPolicyReady && !artifacts.updateMetadataFilesReady) {
    blockers.push("Local update metadata artifact drafts are missing; run npm run desktop:update-metadata-artifacts-smoke first.");
  }
  if (updateMetadataPolicyReady && !signedUpdateArtifactsReady) {
    blockers.push("Signed/notarized update metadata artifacts are not ready because Developer ID signing or notarization evidence is missing.");
  }
  if (!userFacingUpdateBehaviorReady) {
    blockers.push("No user-facing update check, download, and install behavior is implemented.");
  }
  if (artifacts.autoUpdateClaimedByManifest) {
    blockers.push("Release manifest unexpectedly claims auto-update support before readiness is proven.");
  }
  if (artifacts.updateMetadataPolicyClaimsAutoUpdate) {
    blockers.push("Update metadata policy unexpectedly claims auto-update support before readiness is proven.");
  }
  if (artifacts.updateMetadataPolicyRecordsFeedValue) {
    blockers.push("Update metadata policy unexpectedly records a private update feed value.");
  }
  if (artifacts.updateMetadataArtifactsRecordsFeedValue || artifacts.updateMetadataArtifactsRecordsChannelValue) {
    blockers.push("Update metadata artifact draft unexpectedly records private update provider values.");
  }
  if (provider.feedValueRecorded || provider.channelValueRecorded) {
    blockers.push("Auto-update readiness unexpectedly records private update provider values.");
  }

  return {
    ...base,
    skipped: false,
    dependencies,
    provider,
    artifacts,
    source,
    checks: {
      updaterIntegrationReady,
      providerReady,
      updateFeedConfigReady: provider.updateFeedConfigReady,
      updateMetadataPolicyReady,
      updateMetadataFilesReady: artifacts.updateMetadataFilesReady,
      signedUpdateArtifactsReady,
      userFacingUpdateBehaviorReady
    },
    autoUpdateReady:
      updaterIntegrationReady &&
      providerReady &&
      updateMetadataPolicyReady &&
      signedUpdateArtifactsReady &&
      userFacingUpdateBehaviorReady &&
      !artifacts.autoUpdateClaimedByManifest &&
      !artifacts.updateMetadataPolicyClaimsAutoUpdate,
    blockers
  };
}

const readiness = await createReadinessSummary();
await mkdir(readinessRoot, { recursive: true });
await writeFile(readinessPath, `${JSON.stringify(readiness, null, 2)}\n`, "utf8");

check(readiness.appName === appName, "auto-update readiness summary should identify GrooveForge");
check(readiness.bundleId === bundleId, `auto-update readiness summary should identify ${bundleId}`);
check(readiness.networkProbeAttempted === false, "auto-update readiness smoke should not probe remote update feeds");
check(readiness.releaseGateClaimedAutoUpdate === false, "auto-update readiness smoke should not claim auto-update support");
check(readiness.releaseGateClaimedExternalDistribution === false, "auto-update readiness smoke should not claim external distribution completion");
check(readiness.localEnvInput?.valueRecorded === false, "auto-update readiness summary should not record local env values");
check(readiness.localEnvValueRecorded === false, "auto-update readiness summary should mark local env values as unrecorded");
check(Array.isArray(readiness.blockers), "auto-update readiness summary should include a blockers array");
check(readiness.autoUpdateReady === false || readiness.blockers.length === 0, "ready auto-update summary should not include blockers");
check(
  readiness.skipped === true || readiness.provider?.feedValueRecorded === false,
  "auto-update readiness summary should not store private update feed values"
);
check(
  readiness.skipped === true || readiness.provider?.channelValueRecorded === false,
  "auto-update readiness summary should not store private update channel values"
);
check(
  readiness.skipped === true || !("feedUrl" in readiness.provider?.updateFeedConfig),
  "auto-update readiness summary should omit private feed URL values from redacted config"
);
check(
  readiness.skipped === true || !("releaseChannel" in readiness.provider?.updateFeedConfig),
  "auto-update readiness summary should omit private channel values from redacted config"
);
check(
  readiness.skipped === true || readiness.artifacts?.updateMetadataArtifactsRecordsFeedValue === false,
  "auto-update readiness summary should not record update metadata artifact feed values"
);
check(
  readiness.skipped === true || readiness.artifacts?.updateMetadataArtifactsRecordsChannelValue === false,
  "auto-update readiness summary should not record update metadata artifact channel values"
);

const readinessJson = JSON.stringify(readiness);
for (const privateValue of privateInputValues()) {
  check(!readinessJson.includes(privateValue), "auto-update readiness summary should not include private distribution values");
}

if (failures.length > 0) {
  fail("Auto-update readiness validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge auto-update readiness smoke passed.");
console.log(`- Summary: ${relative(readinessPath)}`);
console.log(`- Local env file loaded: ${distributionLocalEnv.enabled ? "yes" : "no"}`);
console.log(`- Updater integration ready: ${readiness.checks?.updaterIntegrationReady === true ? "yes" : "no"}`);
console.log(`- Update provider ready: ${readiness.checks?.providerReady === true ? "yes" : "no"}`);
console.log(`- Update feed config ready: ${readiness.checks?.updateFeedConfigReady === true ? "yes" : "no"}`);
console.log(`- Update metadata policy ready: ${readiness.checks?.updateMetadataPolicyReady === true ? "yes" : "no"}`);
console.log(`- Update metadata files ready: ${readiness.checks?.updateMetadataFilesReady === true ? "yes" : "no"}`);
console.log(`- Signed update artifacts ready: ${readiness.checks?.signedUpdateArtifactsReady === true ? "yes" : "no"}`);
console.log(`- User-facing update behavior ready: ${readiness.checks?.userFacingUpdateBehaviorReady === true ? "yes" : "no"}`);
console.log(`- Auto-update ready: ${readiness.autoUpdateReady ? "yes" : "no"}`);
if (readiness.blockers.length > 0) {
  console.log(`- Blockers: ${readiness.blockers.join(" | ")}`);
}
console.log("- Network: no update feed probe attempted");
console.log("- Not recorded: feed URL values, channel values, local env values, credentials, or tokens");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, app-store submission, or external distribution-channel QA");
