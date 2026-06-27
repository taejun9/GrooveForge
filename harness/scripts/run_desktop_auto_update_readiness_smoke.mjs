#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJsonPath = path.join(root, "package.json");
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const manifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const readinessRoot = path.join(root, "build", "desktop");
const readinessPath = path.join(readinessRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const sourcePaths = [
  "electron/main.ts",
  "electron/preload.cts",
  "dist-electron/main.js",
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

function updateProviderSignals() {
  const publishConfig = packageJson.build?.publish ?? packageJson.publish ?? null;
  const updateUrl =
    process.env.GROOVEFORGE_UPDATE_FEED_URL ??
    process.env.ELECTRON_UPDATE_FEED_URL ??
    process.env.UPDATE_FEED_URL ??
    "";
  const updateChannel =
    process.env.GROOVEFORGE_UPDATE_CHANNEL ??
    process.env.ELECTRON_UPDATE_CHANNEL ??
    process.env.UPDATE_CHANNEL ??
    "";

  return {
    packagePublishConfigPresent: publishConfig !== null,
    environmentFeedUrlKeyPresent: updateUrl.length > 0,
    environmentChannelKeyPresent: updateChannel.length > 0,
    presentEnvironmentKeys: [
      "GROOVEFORGE_UPDATE_FEED_URL",
      "ELECTRON_UPDATE_FEED_URL",
      "UPDATE_FEED_URL",
      "GROOVEFORGE_UPDATE_CHANNEL",
      "ELECTRON_UPDATE_CHANNEL",
      "UPDATE_CHANNEL"
    ].filter((key) => Boolean(process.env[key])),
    // Do not store feed values in readiness output; URLs can reveal private release infrastructure.
    feedValueRecorded: false,
    publishConfigValueRecorded: false
  };
}

function updateArtifactSignals(manifest) {
  const signing = manifest?.signing ?? {};
  const releaseFiles = [
    "latest.yml",
    "latest-mac.yml",
    "app-update.yml",
    `${appName}-${packageJson.version}-${platformArch}.blockmap`,
    `${appName}-${packageJson.version}-${platformArch}.dmg.blockmap`
  ];
  return {
    releaseManifestPresent: Boolean(manifest),
    releaseManifestPath: existsSync(manifestPath) ? relative(manifestPath) : null,
    developerIdCodeSigningClaimed: signing.developerIdCodeSigningClaimed === true,
    notarizationClaimed: signing.notarizationClaimed === true,
    autoUpdateClaimedByManifest: signing.autoUpdateClaimed === true,
    updateMetadataFiles: releaseFiles
      .map((fileName) => path.join(packageRoot, fileName))
      .filter((filePath) => existsSync(filePath))
      .map(relative)
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
    releaseGateClaimedExternalDistribution: false
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
  const dependencies = {
    electronUpdaterPresent: hasDependency("electron-updater"),
    updateElectronAppPresent: hasDependency("update-electron-app"),
    updaterDependencyPresent: hasDependency("electron-updater") || hasDependency("update-electron-app")
  };
  const provider = updateProviderSignals();
  const artifacts = updateArtifactSignals(manifest);
  const source = await sourceSignals();
  const providerReady =
    provider.packagePublishConfigPresent ||
    (provider.environmentFeedUrlKeyPresent && provider.environmentChannelKeyPresent);
  const updaterIntegrationReady =
    dependencies.updaterDependencyPresent &&
    (source.usesElectronAutoUpdaterApi || source.usesElectronUpdaterPackage) &&
    source.hasCheckForUpdatesCall;
  const signedUpdatePolicyReady =
    artifacts.developerIdCodeSigningClaimed &&
    artifacts.notarizationClaimed &&
    artifacts.updateMetadataFiles.length > 0;
  const userFacingUpdateBehaviorReady = source.hasUserFacingUpdateCopy && source.hasUpdateDownloadedHandler;
  const blockers = [];

  if (!updaterIntegrationReady) {
    blockers.push("No auto-update package/API integration with update checking is implemented.");
  }
  if (!providerReady) {
    blockers.push("No update provider, feed URL, and channel metadata are configured.");
  }
  if (!signedUpdatePolicyReady) {
    blockers.push("No signed/notarized update metadata artifact policy is available for automatic updates.");
  }
  if (!userFacingUpdateBehaviorReady) {
    blockers.push("No user-facing update check, download, and install behavior is implemented.");
  }
  if (artifacts.autoUpdateClaimedByManifest) {
    blockers.push("Release manifest unexpectedly claims auto-update support before readiness is proven.");
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
      signedUpdatePolicyReady,
      userFacingUpdateBehaviorReady
    },
    autoUpdateReady:
      updaterIntegrationReady &&
      providerReady &&
      signedUpdatePolicyReady &&
      userFacingUpdateBehaviorReady &&
      !artifacts.autoUpdateClaimedByManifest,
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
check(Array.isArray(readiness.blockers), "auto-update readiness summary should include a blockers array");
check(readiness.autoUpdateReady === false || readiness.blockers.length === 0, "ready auto-update summary should not include blockers");
check(
  readiness.skipped === true || readiness.provider?.feedValueRecorded === false,
  "auto-update readiness summary should not store private update feed values"
);

if (failures.length > 0) {
  fail("Auto-update readiness validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge auto-update readiness smoke passed.");
console.log(`- Summary: ${relative(readinessPath)}`);
console.log(`- Updater integration ready: ${readiness.checks?.updaterIntegrationReady === true ? "yes" : "no"}`);
console.log(`- Update provider ready: ${readiness.checks?.providerReady === true ? "yes" : "no"}`);
console.log(`- Signed update policy ready: ${readiness.checks?.signedUpdatePolicyReady === true ? "yes" : "no"}`);
console.log(`- User-facing update behavior ready: ${readiness.checks?.userFacingUpdateBehaviorReady === true ? "yes" : "no"}`);
console.log(`- Auto-update ready: ${readiness.autoUpdateReady ? "yes" : "no"}`);
if (readiness.blockers.length > 0) {
  console.log(`- Blockers: ${readiness.blockers.join(" | ")}`);
}
console.log("- Network: no update feed probe attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, app-store submission, or external distribution-channel QA");
