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
const releaseNotesMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-notes.md`);
const releaseNotesJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-notes.json`);
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop release notes smoke failed:");
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

function releaseArtifactSignals(manifest) {
  const signing = manifest?.signing ?? {};
  return {
    releaseManifestPresent: Boolean(manifest),
    releaseManifestPath: existsSync(releaseManifestPath) ? relative(releaseManifestPath) : null,
    appBundlePath: manifest?.appBundle?.path ?? null,
    appBundleIdentifier: manifest?.appBundle?.bundleIdentifier ?? null,
    appBundleBytes: manifest?.appBundle?.bytes ?? null,
    appBundleFiles: manifest?.appBundle?.files ?? null,
    dmgPath: manifest?.dmg?.path ?? null,
    dmgBytes: manifest?.dmg?.bytes ?? null,
    dmgSha256: manifest?.dmg?.sha256 ?? null,
    distributionScope: manifest?.distributionScope ?? null,
    signatureKind: signing.signatureKind ?? null,
    adHocCodeSigningClaimed: signing.adHocCodeSigningClaimed === true,
    developerIdCodeSigningClaimed: signing.developerIdCodeSigningClaimed === true,
    notarizationClaimed: signing.notarizationClaimed === true,
    autoUpdateClaimed: signing.autoUpdateClaimed === true,
    externalDistributionChannelQaClaimed: signing.externalDistributionChannelQaClaimed === true,
    hardenedRuntimeFlagPresent: signing.hardenedRuntimeFlagPresent === true,
    developerIdAuthorityPresent: signing.developerIdAuthorityPresent === true
  };
}

function artifactBlockers(artifact) {
  const blockers = [];

  if (!artifact.releaseManifestPresent) {
    blockers.push("Release manifest is missing; run npm run desktop:release-manifest-smoke first.");
  }
  if (artifact.appBundleIdentifier !== bundleId) {
    blockers.push(`Release manifest app bundle id should be ${bundleId}.`);
  }
  if (!artifact.dmgPath?.endsWith(".dmg")) {
    blockers.push("Release manifest should include a DMG path.");
  }
  if (!/^[a-f0-9]{64}$/.test(artifact.dmgSha256 ?? "")) {
    blockers.push("Release manifest DMG SHA-256 checksum is missing.");
  }
  if (Number(artifact.dmgBytes ?? 0) <= 10000000) {
    blockers.push("Release manifest DMG byte size is not substantial.");
  }
  if (artifact.distributionScope !== "local ad-hoc signed macOS artifacts") {
    blockers.push("Release manifest should describe the current local ad-hoc signed artifact scope.");
  }
  if (!artifact.adHocCodeSigningClaimed || artifact.signatureKind !== "ad-hoc") {
    blockers.push("Release manifest should include local ad-hoc signing evidence.");
  }
  if (!artifact.hardenedRuntimeFlagPresent) {
    blockers.push("Release manifest should include hardened runtime flag evidence.");
  }
  if (artifact.developerIdCodeSigningClaimed || artifact.notarizationClaimed || artifact.autoUpdateClaimed || artifact.externalDistributionChannelQaClaimed) {
    blockers.push("Release manifest unexpectedly claims external distribution readiness.");
  }

  return blockers;
}

function externalDistributionBlockers(artifact) {
  const blockers = [];

  if (!artifact.developerIdCodeSigningClaimed || !artifact.developerIdAuthorityPresent) {
    blockers.push("Developer ID signing is not complete for the primary release artifact.");
  }
  if (!artifact.notarizationClaimed) {
    blockers.push("Notarization and stapling are not complete for the primary release artifact.");
  }
  if (!artifact.autoUpdateClaimed) {
    blockers.push("Auto-update is not claimed until provider/feed metadata and signed update metadata are verified.");
  }
  if (!artifact.externalDistributionChannelQaClaimed) {
    blockers.push("External distribution-channel QA is not complete.");
  }

  return blockers;
}

function buildMarkdown(summary) {
  const artifact = summary.artifact;
  const externalBlockers = summary.externalDistributionBlockers.map((blocker) => `- ${blocker}`).join("\n");

  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} Release Notes

## Product Scope

${appName} is an all-genre desktop beat workstation for direct beat composition, sound design, arrangement, mixing, mastering, and export. The first-run path starts from editable musical events, built-in drums, 808/bass, melody, chords, arrangement, mixer/master, and local delivery. Sampling remains an optional future add-on, not the product spine.

## Audience

- First-time beat makers can follow a guided setup, compose, arrange, mix, master, and deliver path.
- Working producers can bypass guidance and edit events, sounds, arrangement, mix, master, and handoff checks directly.

## Local Artifact Evidence

- App bundle: ${artifact.appBundlePath}
- Bundle id: ${artifact.appBundleIdentifier}
- DMG: ${artifact.dmgPath}
- DMG bytes: ${artifact.dmgBytes}
- DMG SHA-256: ${artifact.dmgSha256}
- Signing scope: ${artifact.distributionScope}
- Signature kind: ${artifact.signatureKind}
- Hardened runtime flag present: ${artifact.hardenedRuntimeFlagPresent ? "yes" : "no"}

## Verified Local Posture

- Release manifest: ${artifact.releaseManifestPath}
- Release notes JSON: ${summary.releaseNotesJsonPath}
- Release notes Markdown: ${summary.releaseNotesMarkdownPath}
- Network probe attempted: no
- Release upload attempted: no
- Private URL, credential, token, feed, and channel values recorded: no

## Current External Distribution Blockers

${externalBlockers}

## Not Claimed

This local release notes artifact does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.
`;
}

function privateEnvironmentValues() {
  const keys = [
    "GROOVEFORGE_DISTRIBUTION_CHANNEL",
    "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
    "GROOVEFORGE_RELEASE_NOTES_URL",
    "GROOVEFORGE_SUPPORT_URL",
    "GROOVEFORGE_UPDATE_FEED_URL",
    "ELECTRON_UPDATE_FEED_URL",
    "UPDATE_FEED_URL",
    "GROOVEFORGE_UPDATE_CHANNEL",
    "ELECTRON_UPDATE_CHANNEL",
    "UPDATE_CHANNEL",
    "APPLE_ID",
    "APPLE_TEAM_ID",
    "APPLE_APP_SPECIFIC_PASSWORD",
    "ASC_KEY_ID",
    "ASC_ISSUER_ID",
    "ASC_KEY_PATH",
    "APPLE_NOTARY_PROFILE",
    "NOTARYTOOL_KEYCHAIN_PROFILE",
    "GROOVEFORGE_DEVELOPER_ID_IDENTITY"
  ];

  return keys
    .map((key) => process.env[key]?.trim())
    .filter((value) => value && value.length >= 8);
}

async function createReleaseNotes() {
  const base = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    releaseNotesMarkdownPath: relative(releaseNotesMarkdownPath),
    releaseNotesJsonPath: relative(releaseNotesJsonPath),
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    urlValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
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
      reason: "Release notes artifact smoke currently targets the macOS desktop release artifact chain",
      releaseNotesArtifactReady: false,
      artifactBlockers: ["Run on macOS after desktop release manifest generation."],
      externalDistributionBlockers: ["External distribution remains unverified on this platform."]
    };
  }

  const manifest = await readJsonIfExists(releaseManifestPath);
  const artifact = releaseArtifactSignals(manifest);
  const artifactIssues = artifactBlockers(artifact);
  const distributionIssues = externalDistributionBlockers(artifact);

  return {
    ...base,
    skipped: false,
    productScope: "all-genre direct beat workstation; sampling optional and secondary",
    audience: ["first-time beat makers", "working producers"],
    artifact,
    releaseNotesArtifactReady: artifactIssues.length === 0,
    artifactBlockers: artifactIssues,
    externalDistributionReady: false,
    externalDistributionBlockers: distributionIssues
  };
}

const summary = await createReleaseNotes();
const markdown = summary.skipped ? `# ${appName} ${summary.version} Release Notes\n\n${summary.reason}\n` : buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(releaseNotesJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(releaseNotesMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "release notes summary should identify GrooveForge");
check(summary.bundleId === bundleId, `release notes summary should identify ${bundleId}`);
check(summary.version === packageJson.version, "release notes summary should match package version");
check(summary.networkProbeAttempted === false, "release notes smoke should not probe remote channels");
check(summary.releaseUploadAttempted === false, "release notes smoke should not upload artifacts");
check(summary.urlValueRecorded === false, "release notes summary should not record URL values");
check(summary.credentialValueRecorded === false, "release notes summary should not record credential values");
check(summary.tokenValueRecorded === false, "release notes summary should not record token values");
check(summary.channelValueRecorded === false, "release notes summary should not record channel values");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "release notes smoke should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "release notes smoke should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "release notes smoke should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "release notes smoke should not claim auto-update");
check(summary.releaseGateClaimedExternalDistribution === false, "release notes smoke should not claim external distribution completion");
check(Array.isArray(summary.artifactBlockers), "release notes summary should include artifact blockers");
check(Array.isArray(summary.externalDistributionBlockers), "release notes summary should include external distribution blockers");
check(summary.releaseNotesArtifactReady === false || summary.artifactBlockers.length === 0, "ready release notes artifact should not include artifact blockers");
check(markdown.includes("all-genre desktop beat workstation"), "release notes should describe the direct beat workstation scope");
check(markdown.includes("Sampling remains an optional future add-on"), "release notes should keep sampling secondary");
check(markdown.includes("First-time beat makers"), "release notes should address first-time beat makers");
check(markdown.includes("Working producers"), "release notes should address working producers");
check(!/https?:\/\//i.test(markdown), "release notes should not include public or private URL values before channel selection");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of privateEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "release notes artifact should not include private environment values");
}

if (failures.length > 0) {
  fail("Release notes validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge desktop release notes smoke passed.");
console.log(`- Markdown: ${relative(releaseNotesMarkdownPath)}`);
console.log(`- JSON: ${relative(releaseNotesJsonPath)}`);
console.log(`- Release notes artifact ready: ${summary.releaseNotesArtifactReady ? "yes" : "no"}`);
console.log(`- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}`);
if (summary.artifactBlockers.length > 0) {
  console.log(`- Artifact blockers: ${summary.artifactBlockers.join(" | ")}`);
}
if (summary.externalDistributionBlockers.length > 0) {
  console.log(`- External distribution blockers: ${summary.externalDistributionBlockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe or upload attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, or channel values");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
