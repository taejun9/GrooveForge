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
const releaseNotesPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-notes.json`);
const supportMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-support.md`);
const supportJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-support.json`);
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop support artifact smoke failed:");
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

function releaseArtifactSignals(manifest, releaseNotes) {
  const signing = manifest?.signing ?? {};
  return {
    releaseManifestPresent: Boolean(manifest),
    releaseManifestPath: existsSync(releaseManifestPath) ? relative(releaseManifestPath) : null,
    releaseNotesArtifactPresent: Boolean(releaseNotes),
    releaseNotesPath: existsSync(releaseNotesPath) ? relative(releaseNotesPath) : null,
    releaseNotesArtifactReady: releaseNotes?.releaseNotesArtifactReady === true,
    appBundlePath: manifest?.appBundle?.path ?? null,
    appBundleIdentifier: manifest?.appBundle?.bundleIdentifier ?? null,
    dmgPath: manifest?.dmg?.path ?? null,
    dmgBytes: manifest?.dmg?.bytes ?? null,
    dmgSha256: manifest?.dmg?.sha256 ?? null,
    pkgPath: manifest?.pkg?.path ?? null,
    pkgBytes: manifest?.pkg?.bytes ?? null,
    pkgSha256: manifest?.pkg?.sha256 ?? null,
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

function supportArtifactBlockers(artifact) {
  const blockers = [];

  if (!artifact.releaseManifestPresent) {
    blockers.push("Release manifest is missing; run npm run desktop:release-manifest-smoke first.");
  }
  if (!artifact.releaseNotesArtifactReady) {
    blockers.push("Release notes artifact is missing or unavailable; run npm run desktop:release-notes-smoke first.");
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
  if (!artifact.pkgPath?.endsWith(".pkg")) {
    blockers.push("Release manifest should include a PKG path.");
  }
  if (!/^[a-f0-9]{64}$/.test(artifact.pkgSha256 ?? "")) {
    blockers.push("Release manifest PKG SHA-256 checksum is missing.");
  }
  if (Number(artifact.pkgBytes ?? 0) <= 10000000) {
    blockers.push("Release manifest PKG byte size is not substantial.");
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
  const supportBlockers = summary.supportArtifactBlockers.length > 0 ? summary.supportArtifactBlockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
  const externalBlockers = summary.externalDistributionBlockers.map((blocker) => `- ${blocker}`).join("\n");

  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} Support

## What GrooveForge Is

${appName} is an all-genre desktop beat workstation for direct beat composition, sound design, arrangement, mixing, mastering, and local export. The core workflow uses editable musical events, built-in drums, 808/bass, melody, chords, arrangement, mixer/master, WAV/stem/MIDI export, and Handoff Sheet delivery. Sampling remains optional future scope, not the default support path.

## Who This Supports

- First-time beat makers can follow Guided mode, First Beat Path, Composer Guide, export preflight, and Handoff Pack checks.
- Working producers can use Studio mode, Quick Actions, Command Reference, Pattern A/B/C editing, sound design, mix/master controls, and local delivery checks directly.

## Install And Launch Scope

- Artifact scope: ${artifact.distributionScope}
- App bundle: ${artifact.appBundlePath}
- Bundle id: ${artifact.appBundleIdentifier}
- DMG: ${artifact.dmgPath}
- DMG bytes: ${artifact.dmgBytes}
- DMG SHA-256: ${artifact.dmgSha256}
- PKG: ${artifact.pkgPath}
- PKG bytes: ${artifact.pkgBytes}
- PKG SHA-256: ${artifact.pkgSha256}
- Signing scope: ${artifact.signatureKind}
- Hardened runtime flag present: ${artifact.hardenedRuntimeFlagPresent ? "yes" : "no"}

## First Session Help

1. Start from Guided mode for a first beat or Studio mode for direct editing.
2. Choose BPM, key, and style.
3. Program drums, 808/bass, melody, and chords as editable events.
4. Arrange sections, check mix/master posture, then export WAV, stems, MIDI, and Handoff Sheet locally.

## Update And Distribution Support Posture

- Automatic update checks are user-initiated through Help > Check for Updates.
- Update feed, signed update metadata, Developer ID signing, notarization, Gatekeeper acceptance, and manual distribution-channel QA must be complete before public update support is claimed.
- This support artifact does not contact feeds, upload artifacts, or record private URL/channel values.

## Privacy Support Posture

- Local-first project files and exports remain on the user's machine.
- No account, analytics, payment, ad, cloud sync, remote AI, media upload, or imported-audio requirement is part of the current MVP.
- Real user audio, private beats, credentials, release URLs, feed URLs, support URLs, and tokens must not be committed.

## Support Artifact Blockers

${supportBlockers}

## Current External Distribution Blockers

${externalBlockers}

## Not Claimed

This local support artifact does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA.
`;
}

function privateEnvironmentValues() {
  const keys = [
    "GROOVEFORGE_SUPPORT_URL",
    "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
    "GROOVEFORGE_RELEASE_NOTES_URL",
    "GROOVEFORGE_DISTRIBUTION_CHANNEL",
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

async function createSupportArtifact() {
  const base = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    supportMarkdownPath: relative(supportMarkdownPath),
    supportJsonPath: relative(supportJsonPath),
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    supportUrlValueRecorded: false,
    releaseUrlValueRecorded: false,
    feedValueRecorded: false,
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
      reason: "Support artifact smoke currently targets the macOS desktop release artifact chain",
      supportArtifactReady: false,
      supportArtifactBlockers: ["Run on macOS after desktop release manifest and release notes generation."],
      externalDistributionBlockers: ["External distribution remains unverified on this platform."]
    };
  }

  const manifest = await readJsonIfExists(releaseManifestPath);
  const releaseNotes = await readJsonIfExists(releaseNotesPath);
  const artifact = releaseArtifactSignals(manifest, releaseNotes);
  const supportBlockers = supportArtifactBlockers(artifact);
  const distributionBlockers = externalDistributionBlockers(artifact);

  return {
    ...base,
    skipped: false,
    productScope: "all-genre direct beat workstation; sampling optional and secondary",
    supportScope: "local install, launch, first-session, export, update-posture, privacy, and distribution-blocker support content",
    audience: ["first-time beat makers", "working producers"],
    artifact,
    supportArtifactReady: supportBlockers.length === 0,
    supportArtifactBlockers: supportBlockers,
    externalDistributionReady: false,
    externalDistributionBlockers: distributionBlockers
  };
}

const summary = await createSupportArtifact();
const markdown = summary.skipped ? `# ${appName} ${summary.version} Support\n\n${summary.reason}\n` : buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(supportJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(supportMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "support summary should identify GrooveForge");
check(summary.bundleId === bundleId, `support summary should identify ${bundleId}`);
check(summary.version === packageJson.version, "support summary should match package version");
check(summary.networkProbeAttempted === false, "support artifact smoke should not probe remote channels");
check(summary.releaseUploadAttempted === false, "support artifact smoke should not upload artifacts");
check(summary.supportUrlValueRecorded === false, "support artifact summary should not record support URL values");
check(summary.releaseUrlValueRecorded === false, "support artifact summary should not record release URL values");
check(summary.feedValueRecorded === false, "support artifact summary should not record feed values");
check(summary.credentialValueRecorded === false, "support artifact summary should not record credential values");
check(summary.tokenValueRecorded === false, "support artifact summary should not record token values");
check(summary.channelValueRecorded === false, "support artifact summary should not record channel values");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "support artifact smoke should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "support artifact smoke should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "support artifact smoke should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "support artifact smoke should not claim auto-update");
check(summary.releaseGateClaimedExternalDistribution === false, "support artifact smoke should not claim external distribution completion");
check(Array.isArray(summary.supportArtifactBlockers), "support artifact summary should include support artifact blockers");
check(Array.isArray(summary.externalDistributionBlockers), "support artifact summary should include external distribution blockers");
check(summary.supportArtifactReady === false || summary.supportArtifactBlockers.length === 0, "ready support artifact should not include support artifact blockers");
check(markdown.includes("all-genre desktop beat workstation"), "support artifact should describe the direct beat workstation scope");
check(markdown.includes("Sampling remains optional future scope"), "support artifact should keep sampling secondary");
check(markdown.includes("First-time beat makers"), "support artifact should address first-time beat makers");
check(markdown.includes("Working producers"), "support artifact should address working producers");
check(markdown.includes("Help > Check for Updates"), "support artifact should describe update support posture");
check(markdown.includes("No account, analytics, payment, ad, cloud sync, remote AI"), "support artifact should describe privacy support posture");
check(!/https?:\/\//i.test(markdown), "support artifact should not include public or private URL values before channel selection");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of privateEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "support artifact should not include private environment values");
}

if (failures.length > 0) {
  fail("Support artifact validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge desktop support artifact smoke passed.");
console.log(`- Markdown: ${relative(supportMarkdownPath)}`);
console.log(`- JSON: ${relative(supportJsonPath)}`);
console.log(`- Support artifact ready: ${summary.supportArtifactReady ? "yes" : "no"}`);
console.log(`- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}`);
if (summary.supportArtifactBlockers.length > 0) {
  console.log(`- Support artifact blockers: ${summary.supportArtifactBlockers.join(" | ")}`);
}
if (summary.externalDistributionBlockers.length > 0) {
  console.log(`- External distribution blockers: ${summary.externalDistributionBlockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe or upload attempted");
console.log("- Not recorded: support URLs, release URLs, feed URLs, credentials, tokens, or channel values");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
