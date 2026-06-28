#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const summaryRoot = path.join(root, "build", "desktop");
const releaseManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const releaseNotesMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-notes.md`);
const releaseNotesPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-notes.json`);
const supportMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-support.md`);
const supportArtifactPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-support.json`);
const updateMetadataPolicyPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-policy.json`);
const autoUpdateReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const developerIdSigningPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(summaryRoot, `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(summaryRoot, `${appName}-${platformArch}-notarized-gatekeeper.json`);
const distributionChannelQaPath = path.join(summaryRoot, `${appName}-${platformArch}-distribution-channel-qa.json`);
const handoffMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-handoff.md`);
const handoffJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-handoff.json`);
const bundleMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-bundle-manifest.md`);
const bundleJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-bundle-manifest.json`);
const distributionMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_DISTRIBUTION_QA_APPROVED",
  "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256"
];
const updateMetadataKeys = [
  "GROOVEFORGE_UPDATE_FEED_URL",
  "ELECTRON_UPDATE_FEED_URL",
  "UPDATE_FEED_URL",
  "GROOVEFORGE_UPDATE_CHANNEL",
  "ELECTRON_UPDATE_CHANNEL",
  "UPDATE_CHANNEL"
];
const signingAndNotaryKeys = [
  "GROOVEFORGE_DEVELOPER_ID_IDENTITY",
  "GROOVEFORGE_NOTARY_SUBMIT",
  "APPLE_ID",
  "APPLE_TEAM_ID",
  "APPLE_APP_SPECIFIC_PASSWORD",
  "ASC_KEY_ID",
  "ASC_ISSUER_ID",
  "ASC_KEY_PATH",
  "APPLE_NOTARY_PROFILE",
  "NOTARYTOOL_KEYCHAIN_PROFILE"
];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge distribution bundle manifest smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))];
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function sha256(filePath) {
  const bytes = await readFile(filePath);
  return createHash("sha256").update(bytes).digest("hex");
}

async function fileArtifact(label, filePath, ready = true) {
  if (!existsSync(filePath)) {
    return {
      label,
      kind: "file",
      path: relative(filePath),
      present: false,
      bytes: null,
      sha256: null,
      ready: false,
      status: "missing"
    };
  }

  const fileStats = await stat(filePath);
  return {
    label,
    kind: "file",
    path: relative(filePath),
    present: true,
    bytes: fileStats.size,
    sha256: await sha256(filePath),
    ready: ready && fileStats.size > 0,
    status: ready && fileStats.size > 0 ? "ready" : "review"
  };
}

function manifestDirectoryArtifact(label, artifactPath, bytes, ready) {
  return {
    label,
    kind: "directory",
    path: artifactPath ?? null,
    present: Boolean(artifactPath),
    bytes: bytes ?? null,
    sha256: null,
    ready: Boolean(ready),
    status: ready ? "referenced" : "review"
  };
}

function manifestFileArtifact(label, artifactPath, bytes, checksum, ready) {
  return {
    label,
    kind: "large-file",
    path: artifactPath ?? null,
    present: Boolean(artifactPath),
    bytes: bytes ?? null,
    sha256: checksum ?? null,
    ready: Boolean(ready),
    status: ready ? "referenced" : "review"
  };
}

function privateEnvironmentValues() {
  return [...distributionMetadataKeys, ...updateMetadataKeys, ...signingAndNotaryKeys]
    .map((key) => process.env[key]?.trim())
    .filter((value) => value && value.length >= 8);
}

function releaseArtifactReady(manifest) {
  const signing = manifest?.signing ?? {};
  return (
    Boolean(manifest) &&
    manifest?.appBundle?.bundleIdentifier === bundleId &&
    /^[a-f0-9]{64}$/.test(manifest?.dmg?.sha256 ?? "") &&
    Number(manifest?.dmg?.bytes ?? 0) > 10000000 &&
    signing.adHocCodeSigningClaimed === true &&
    signing.hardenedRuntimeFlagPresent === true &&
    signing.developerIdCodeSigningClaimed !== true &&
    signing.notarizationClaimed !== true &&
    signing.autoUpdateClaimed !== true &&
    signing.externalDistributionChannelQaClaimed !== true
  );
}

function collectReadiness(input) {
  const { manifest, releaseNotes, supportArtifact, handoff, updatePolicy, autoUpdate, developerIdSigning, notarization, gatekeeper, distributionQa } = input;
  const releaseReady = releaseArtifactReady(manifest);
  const releaseNotesReady =
    releaseNotes?.releaseNotesArtifactReady === true &&
    releaseNotes?.urlValueRecorded === false &&
    releaseNotes?.credentialValueRecorded === false &&
    releaseNotes?.tokenValueRecorded === false &&
    releaseNotes?.channelValueRecorded === false &&
    releaseNotes?.releaseGateClaimedExternalDistribution === false;
  const supportReady =
    supportArtifact?.supportArtifactReady === true &&
    supportArtifact?.supportUrlValueRecorded === false &&
    supportArtifact?.releaseUrlValueRecorded === false &&
    supportArtifact?.feedValueRecorded === false &&
    supportArtifact?.credentialValueRecorded === false &&
    supportArtifact?.tokenValueRecorded === false &&
    supportArtifact?.channelValueRecorded === false &&
    supportArtifact?.releaseGateClaimedExternalDistribution === false;
  const handoffReady =
    handoff?.distributionHandoffReady === true &&
    handoff?.releaseUrlValueRecorded === false &&
    handoff?.supportUrlValueRecorded === false &&
    handoff?.feedValueRecorded === false &&
    handoff?.credentialValueRecorded === false &&
    handoff?.tokenValueRecorded === false &&
    handoff?.channelValueRecorded === false &&
    handoff?.releaseGateClaimedExternalDistribution === false;
  const updatePolicyReady =
    updatePolicy?.policyAvailable === true &&
    updatePolicy?.networkProbeAttempted === false &&
    updatePolicy?.releaseGateClaimedAutoUpdate === false &&
    updatePolicy?.releaseGateClaimedExternalDistribution === false;
  const autoUpdatePresent = Boolean(autoUpdate) && autoUpdate?.networkProbeAttempted === false && autoUpdate?.releaseGateClaimedAutoUpdate === false;
  const developerIdSigningPresent =
    Boolean(developerIdSigning) &&
    developerIdSigning?.networkSubmissionAttempted === false &&
    developerIdSigning?.releaseGateClaimedDeveloperIdSigning === false;
  const notarizationPresent =
    Boolean(notarization) &&
    notarization?.releaseGateClaimedNotarization === false &&
    notarization?.releaseGateClaimedExternalDistribution === false;
  const gatekeeperPresent =
    Boolean(gatekeeper) &&
    gatekeeper?.releaseGateClaimedGatekeeperApproval === false &&
    gatekeeper?.releaseGateClaimedExternalDistribution === false;
  const distributionQaPresent =
    Boolean(distributionQa) &&
    distributionQa?.networkProbeAttempted === false &&
    distributionQa?.releaseUploadAttempted === false &&
    distributionQa?.releaseGateClaimedExternalDistribution === false;

  return {
    releaseArtifactReady: releaseReady,
    releaseNotesReady,
    supportArtifactReady: supportReady,
    distributionHandoffReady: handoffReady,
    updateMetadataPolicyReady: updatePolicyReady,
    autoUpdateReadinessPresent: autoUpdatePresent,
    developerIdSigningSummaryPresent: developerIdSigningPresent,
    developerIdSigned: developerIdSigning?.developerIdSigned === true,
    notarizationSummaryPresent: notarizationPresent,
    notarizationReady: notarization?.notarizationReady === true,
    notarizedGatekeeperSummaryPresent: gatekeeperPresent,
    notarizedGatekeeperAccepted: gatekeeper?.notarizedGatekeeperAccepted === true,
    distributionChannelQaSummaryPresent: distributionQaPresent,
    distributionChannelQaReady: distributionQa?.externalDistributionReady === true
  };
}

function bundleManifestBlockers(readiness) {
  const blockers = [];
  if (!readiness.releaseArtifactReady) {
    blockers.push("Release manifest evidence is missing or does not describe a substantial unclaimed GrooveForge DMG artifact.");
  }
  if (!readiness.releaseNotesReady) {
    blockers.push("Release notes artifact is missing or unavailable; run npm run desktop:release-notes-smoke first.");
  }
  if (!readiness.supportArtifactReady) {
    blockers.push("Support artifact is missing or unavailable; run npm run desktop:support-artifact-smoke first.");
  }
  if (!readiness.distributionHandoffReady) {
    blockers.push("Distribution handoff is missing or not locally ready; run npm run desktop:distribution-handoff-smoke first.");
  }
  if (!readiness.updateMetadataPolicyReady) {
    blockers.push("Update metadata policy summary is missing or unavailable; run npm run desktop:update-metadata-policy-smoke first.");
  }
  if (!readiness.autoUpdateReadinessPresent) {
    blockers.push("Auto-update readiness summary is missing; run npm run desktop:auto-update-readiness-smoke first.");
  }
  if (!readiness.developerIdSigningSummaryPresent) {
    blockers.push("Developer ID signing summary is missing; run npm run desktop:developer-id-signing-smoke first.");
  }
  if (!readiness.notarizationSummaryPresent) {
    blockers.push("Notarization summary is missing; run npm run desktop:notarization-smoke first.");
  }
  if (!readiness.notarizedGatekeeperSummaryPresent) {
    blockers.push("Notarized Gatekeeper summary is missing; run npm run desktop:notarized-gatekeeper-smoke first.");
  }
  if (!readiness.distributionChannelQaSummaryPresent) {
    blockers.push("Distribution-channel QA summary is missing; run npm run desktop:distribution-channel-qa-smoke first.");
  }
  return blockers;
}

function externalDistributionBlockers(input, readiness) {
  const { handoff, autoUpdate, developerIdSigning, notarization, gatekeeper, distributionQa } = input;
  const blockers = [
    ...(handoff?.externalDistributionBlockers ?? []),
    ...(autoUpdate?.blockers ?? []),
    ...(developerIdSigning?.blockers ?? []),
    ...(notarization?.blockers ?? []),
    ...(gatekeeper?.blockers ?? []),
    ...(distributionQa?.blockers ?? [])
  ];

  if (!readiness.developerIdSigned) {
    blockers.push("Developer ID signed isolated app copy is not available for channel QA.");
  }
  if (!readiness.notarizationReady) {
    blockers.push("Notarization and stapling are not complete for the selected release artifact.");
  }
  if (!readiness.notarizedGatekeeperAccepted) {
    blockers.push("Notarized Gatekeeper assessment has not accepted the selected release artifact.");
  }
  if (!readiness.distributionChannelQaReady) {
    blockers.push("External distribution-channel QA is not complete.");
  }

  return unique(blockers);
}

async function referencedArtifacts(input, readiness) {
  const { manifest, releaseNotes, supportArtifact, handoff, updatePolicy, autoUpdate, developerIdSigning, notarization, gatekeeper, distributionQa } = input;
  return [
    manifestDirectoryArtifact("App bundle", manifest?.appBundle?.path, manifest?.appBundle?.bytes, readiness.releaseArtifactReady),
    manifestFileArtifact("DMG", manifest?.dmg?.path, manifest?.dmg?.bytes, manifest?.dmg?.sha256, readiness.releaseArtifactReady),
    await fileArtifact("Release manifest JSON", releaseManifestPath, readiness.releaseArtifactReady),
    await fileArtifact("Release notes Markdown", releaseNotesMarkdownPath, readiness.releaseNotesReady),
    await fileArtifact("Release notes JSON", releaseNotesPath, readiness.releaseNotesReady),
    await fileArtifact("Support Markdown", supportMarkdownPath, readiness.supportArtifactReady),
    await fileArtifact("Support JSON", supportArtifactPath, readiness.supportArtifactReady),
    await fileArtifact("Distribution handoff Markdown", handoffMarkdownPath, readiness.distributionHandoffReady),
    await fileArtifact("Distribution handoff JSON", handoffJsonPath, readiness.distributionHandoffReady),
    await fileArtifact("Update metadata policy JSON", updateMetadataPolicyPath, readiness.updateMetadataPolicyReady),
    await fileArtifact("Auto-update readiness JSON", autoUpdateReadinessPath, Boolean(autoUpdate)),
    await fileArtifact("Developer ID signing JSON", developerIdSigningPath, Boolean(developerIdSigning)),
    await fileArtifact("Notarization JSON", notarizationPath, Boolean(notarization)),
    await fileArtifact("Notarized Gatekeeper JSON", notarizedGatekeeperPath, Boolean(gatekeeper)),
    await fileArtifact("Distribution-channel QA JSON", distributionChannelQaPath, Boolean(distributionQa))
  ];
}

function formatArtifactRows(artifacts) {
  return artifacts
    .map((artifact) => {
      const bytes = artifact.bytes === null || artifact.bytes === undefined ? "n/a" : String(artifact.bytes);
      const checksum = artifact.sha256 ?? "n/a";
      return `| ${artifact.label} | ${artifact.present ? "yes" : "no"} | ${bytes} | ${checksum} | ${artifact.status} | ${artifact.path ?? "missing"} |`;
    })
    .join("\n");
}

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} Distribution Bundle Manifest

## What GrooveForge Is

${appName} is an all-genre desktop beat workstation for direct beat composition, sound design, arrangement, mixing, mastering, and local export. It supports First-time beat makers through Guided mode and Working producers through Studio mode. Sampling remains optional future scope, not the release identity.

## Bundle Status

- Bundle manifest ready: ${summary.distributionBundleManifestReady ? "yes" : "no"}
- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}
- Large artifact copied: no
- Network probe attempted: no
- Release upload attempted: no

## Product And Privacy Posture

- Product scope: ${summary.productScope}
- Local-first project files and exports remain on the user's machine.
- No account, analytics, payment, ad, cloud sync, remote AI, media upload, or imported-audio requirement is part of the current MVP.
- Release URLs, support URLs, feed URLs, credentials, tokens, channel values, private beats, and real user audio must not be committed.

## Artifact Checklist

| artifact | present | bytes | sha256 | status | path |
|---|---:|---:|---|---|---|
${formatArtifactRows(summary.referencedArtifacts)}

## Required Private Inputs

- Distribution channel keys: ${summary.requiredPrivateInputs.distributionMetadataKeys.join(", ")}
- Update feed/channel keys: ${summary.requiredPrivateInputs.updateMetadataKeys.join(", ")}
- Signing/notary keys: ${summary.requiredPrivateInputs.signingAndNotaryKeys.join(", ")}
- Values for those keys are intentionally not recorded in this distribution bundle manifest.

## Next Local Commands

1. npm run release:check
2. npm run desktop:developer-id-signing-smoke
3. npm run desktop:notarization-smoke
4. npm run desktop:notarized-gatekeeper-smoke
5. npm run desktop:distribution-channel-qa-smoke
6. npm run desktop:distribution-handoff-smoke
7. npm run desktop:distribution-bundle-manifest-smoke

## Bundle Manifest Blockers

${formatBlockers(summary.distributionBundleManifestBlockers)}

## Current External Distribution Blockers

${formatBlockers(summary.externalDistributionBlockers)}

## Not Claimed

This local distribution bundle manifest does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, release upload, large artifact copying, or external distribution-channel QA.
`;
}

async function createBundleManifest() {
  const base = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    bundleMarkdownPath: relative(bundleMarkdownPath),
    bundleJsonPath: relative(bundleJsonPath),
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    largeArtifactCopied: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedExternalDistribution: false
  };

  const manifest = await readJsonIfExists(releaseManifestPath);
  const releaseNotes = await readJsonIfExists(releaseNotesPath);
  const supportArtifact = await readJsonIfExists(supportArtifactPath);
  const handoff = await readJsonIfExists(handoffJsonPath);
  const updatePolicy = await readJsonIfExists(updateMetadataPolicyPath);
  const autoUpdate = await readJsonIfExists(autoUpdateReadinessPath);
  const developerIdSigning = await readJsonIfExists(developerIdSigningPath);
  const notarization = await readJsonIfExists(notarizationPath);
  const gatekeeper = await readJsonIfExists(notarizedGatekeeperPath);
  const distributionQa = await readJsonIfExists(distributionChannelQaPath);
  const input = {
    manifest,
    releaseNotes,
    supportArtifact,
    handoff,
    updatePolicy,
    autoUpdate,
    developerIdSigning,
    notarization,
    gatekeeper,
    distributionQa
  };
  const readiness = collectReadiness(input);
  const distributionBundleManifestBlockers = process.platform === "darwin" ? bundleManifestBlockers(readiness) : ["Run on macOS after the desktop release readiness chain."];
  const distributionBlockers = externalDistributionBlockers(input, readiness);
  const artifacts = await referencedArtifacts(input, readiness);

  return {
    ...base,
    skipped: process.platform !== "darwin",
    reason: process.platform === "darwin" ? null : "Distribution bundle manifest smoke currently targets the macOS desktop release artifact chain",
    productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
    manifestScope: "redacted local distribution bundle checklist for release, handoff, update, signing, notarization, Gatekeeper, and channel QA evidence",
    audience: ["First-time beat makers", "Working producers"],
    artifactPolicy: {
      largeArtifactCopied: false,
      copiedArtifacts: [],
      referencedOnly: ["DMG", "GrooveForge.app"],
      localIgnoredBuildRoot: relative(path.join(root, "build", "desktop"))
    },
    readiness,
    referencedArtifacts: artifacts,
    requiredPrivateInputs: {
      distributionMetadataKeys,
      updateMetadataKeys,
      signingAndNotaryKeys,
      valuesRecorded: false
    },
    distributionBundleManifestReady: distributionBundleManifestBlockers.length === 0,
    externalDistributionReady: handoff?.externalDistributionReady === true && distributionQa?.externalDistributionReady === true,
    distributionBundleManifestBlockers,
    externalDistributionBlockers: distributionBlockers
  };
}

const summary = await createBundleManifest();
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(bundleJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(bundleMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "distribution bundle manifest should identify GrooveForge");
check(summary.bundleId === bundleId, `distribution bundle manifest should identify ${bundleId}`);
check(summary.version === packageJson.version, "distribution bundle manifest should match package version");
check(summary.networkProbeAttempted === false, "distribution bundle manifest smoke should not probe remote channels");
check(summary.releaseUploadAttempted === false, "distribution bundle manifest smoke should not upload release artifacts");
check(summary.largeArtifactCopied === false, "distribution bundle manifest smoke should not copy large artifacts");
check(summary.releaseUrlValueRecorded === false, "distribution bundle manifest should not record release URL values");
check(summary.supportUrlValueRecorded === false, "distribution bundle manifest should not record support URL values");
check(summary.feedValueRecorded === false, "distribution bundle manifest should not record feed values");
check(summary.credentialValueRecorded === false, "distribution bundle manifest should not record credential values");
check(summary.tokenValueRecorded === false, "distribution bundle manifest should not record token values");
check(summary.channelValueRecorded === false, "distribution bundle manifest should not record channel values");
check(summary.developerIdIdentityValueRecorded === false, "distribution bundle manifest should not record Developer ID identity values");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "distribution bundle manifest should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "distribution bundle manifest should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "distribution bundle manifest should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "distribution bundle manifest should not claim auto-update");
check(summary.releaseGateClaimedExternalDistribution === false, "distribution bundle manifest should not claim external distribution completion");
check(summary.requiredPrivateInputs?.valuesRecorded === false, "distribution bundle manifest should record environment key names only");
check(Array.isArray(summary.referencedArtifacts), "distribution bundle manifest should include referenced artifacts");
check(Array.isArray(summary.distributionBundleManifestBlockers), "distribution bundle manifest should include bundle manifest blockers");
check(Array.isArray(summary.externalDistributionBlockers), "distribution bundle manifest should include external distribution blockers");
check(summary.distributionBundleManifestReady === false || summary.distributionBundleManifestBlockers.length === 0, "ready bundle manifest should not include bundle blockers");
check(markdown.includes("all-genre desktop beat workstation"), "distribution bundle manifest should describe the direct beat workstation scope");
check(markdown.includes("all-genre direct beat workstation"), "distribution bundle manifest should keep the product scope direct");
check(markdown.includes("Sampling remains optional future scope"), "distribution bundle manifest should keep sampling secondary");
check(markdown.includes("First-time beat makers"), "distribution bundle manifest should address first-time beat makers");
check(markdown.includes("Working producers"), "distribution bundle manifest should address working producers");
check(markdown.includes("Bundle manifest ready:"), "distribution bundle manifest should include bundle readiness");
check(markdown.includes("External distribution ready:"), "distribution bundle manifest should include external readiness");
check(markdown.includes("Large artifact copied: no"), "distribution bundle manifest should state no large artifact copy");
check(markdown.includes("Required Private Inputs"), "distribution bundle manifest should list required private input keys");
check(markdown.includes("Values for those keys are intentionally not recorded"), "distribution bundle manifest should state value redaction");
check(!/https?:\/\//i.test(markdown), "distribution bundle manifest should not include public or private URL values before channel selection");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of privateEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "distribution bundle manifest should not include private environment values");
}

if (failures.length > 0) {
  fail("Distribution bundle manifest validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge distribution bundle manifest smoke passed.");
console.log(`- Markdown: ${relative(bundleMarkdownPath)}`);
console.log(`- JSON: ${relative(bundleJsonPath)}`);
console.log(`- Bundle manifest ready: ${summary.distributionBundleManifestReady ? "yes" : "no"}`);
console.log(`- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}`);
console.log("- Large artifact copied: no");
if (summary.distributionBundleManifestBlockers.length > 0) {
  console.log(`- Bundle manifest blockers: ${summary.distributionBundleManifestBlockers.join(" | ")}`);
}
if (summary.externalDistributionBlockers.length > 0) {
  console.log(`- External distribution blockers: ${summary.externalDistributionBlockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe or upload attempted");
console.log("- Not copied: DMG or app bundle; local ignored paths and checksums only");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, or channel values");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
