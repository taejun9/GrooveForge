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
const summaryRoot = path.join(root, "build", "desktop");
const releaseManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const releaseNotesPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-notes.json`);
const supportArtifactPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-support.json`);
const updateFeedConfigPath = path.join(summaryRoot, `${appName}-${platformArch}-update-feed-config.json`);
const updateMetadataPolicyPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-policy.json`);
const autoUpdateReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const developerIdReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-readiness.json`);
const developerIdSigningPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(summaryRoot, `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(summaryRoot, `${appName}-${platformArch}-notarized-gatekeeper.json`);
const distributionChannelQaPath = path.join(summaryRoot, `${appName}-${platformArch}-distribution-channel-qa.json`);
const handoffMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-handoff.md`);
const handoffJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-handoff.json`);
const distributionMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_DISTRIBUTION_QA_APPROVED"
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
  console.error("GrooveForge distribution handoff smoke failed:");
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

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))];
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

function collectEvidence(input) {
  const {
    manifest,
    releaseNotes,
    supportArtifact,
    updateFeedConfig,
    updatePolicy,
    autoUpdate,
    developerIdReadiness,
    developerIdSigning,
    notarization,
    notarizedGatekeeper,
    distributionQa
  } = input;

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
  const updateFeedConfigReady =
    Boolean(updateFeedConfig) &&
    updateFeedConfig?.networkProbeAttempted === false &&
    updateFeedConfig?.releaseGateClaimedAutoUpdate === false &&
    updateFeedConfig?.releaseGateClaimedExternalDistribution === false;
  const updatePolicyReady =
    updatePolicy?.policyAvailable === true &&
    updatePolicy?.networkProbeAttempted === false &&
    updatePolicy?.releaseGateClaimedAutoUpdate === false &&
    updatePolicy?.releaseGateClaimedExternalDistribution === false;
  const autoUpdateIntegrationReady =
    autoUpdate?.checks?.updaterIntegrationReady === true &&
    autoUpdate?.checks?.userFacingUpdateBehaviorReady === true &&
    autoUpdate?.networkProbeAttempted === false &&
    autoUpdate?.releaseGateClaimedAutoUpdate === false;
  const developerIdPrerequisitesReady = developerIdReadiness?.externalDistributionReady === true;
  const developerIdSigned = developerIdSigning?.developerIdSigned === true;
  const notarizationReady = notarization?.notarizationReady === true;
  const notarizedGatekeeperAccepted = notarizedGatekeeper?.notarizedGatekeeperAccepted === true;
  const distributionChannelQaPresent =
    Boolean(distributionQa) &&
    distributionQa?.networkProbeAttempted === false &&
    distributionQa?.releaseUploadAttempted === false &&
    distributionQa?.releaseGateClaimedExternalDistribution === false;

  return {
    releaseArtifact: {
      present: Boolean(manifest),
      ready: releaseReady,
      path: existsSync(releaseManifestPath) ? relative(releaseManifestPath) : null
    },
    releaseNotesArtifact: {
      present: Boolean(releaseNotes),
      ready: releaseNotesReady,
      path: existsSync(releaseNotesPath) ? relative(releaseNotesPath) : null
    },
    supportArtifact: {
      present: Boolean(supportArtifact),
      ready: supportReady,
      path: existsSync(supportArtifactPath) ? relative(supportArtifactPath) : null
    },
    updateFeedConfig: {
      present: Boolean(updateFeedConfig),
      ready: updateFeedConfigReady,
      path: existsSync(updateFeedConfigPath) ? relative(updateFeedConfigPath) : null
    },
    updateMetadataPolicy: {
      present: Boolean(updatePolicy),
      ready: updatePolicyReady,
      path: existsSync(updateMetadataPolicyPath) ? relative(updateMetadataPolicyPath) : null
    },
    autoUpdateReadiness: {
      present: Boolean(autoUpdate),
      integrationReady: autoUpdateIntegrationReady,
      externalReady: autoUpdate?.autoUpdateReady === true,
      path: existsSync(autoUpdateReadinessPath) ? relative(autoUpdateReadinessPath) : null
    },
    developerIdReadiness: {
      present: Boolean(developerIdReadiness),
      prerequisitesReady: developerIdPrerequisitesReady,
      validIdentityCount: Number(developerIdReadiness?.developerIdSigning?.validDeveloperIdApplicationIdentityCount ?? 0),
      credentialSignalReady: developerIdReadiness?.notarization?.ready === true,
      path: existsSync(developerIdReadinessPath) ? relative(developerIdReadinessPath) : null
    },
    developerIdSigning: {
      present: Boolean(developerIdSigning),
      signed: developerIdSigned,
      signingAttempted: developerIdSigning?.developerIdSigningAttempted === true,
      path: existsSync(developerIdSigningPath) ? relative(developerIdSigningPath) : null
    },
    notarization: {
      present: Boolean(notarization),
      ready: notarizationReady,
      submissionAttempted: notarization?.notarySubmissionAttempted === true,
      path: existsSync(notarizationPath) ? relative(notarizationPath) : null
    },
    notarizedGatekeeper: {
      present: Boolean(notarizedGatekeeper),
      accepted: notarizedGatekeeperAccepted,
      path: existsSync(notarizedGatekeeperPath) ? relative(notarizedGatekeeperPath) : null
    },
    distributionChannelQa: {
      present: Boolean(distributionQa),
      ready: distributionQa?.externalDistributionReady === true,
      redactedSummaryPresent: distributionChannelQaPresent,
      path: existsSync(distributionChannelQaPath) ? relative(distributionChannelQaPath) : null
    }
  };
}

function localHandoffBlockers(evidence) {
  const blockers = [];
  if (!evidence.releaseArtifact.ready) {
    blockers.push("Release manifest evidence is missing or does not describe a substantial unclaimed GrooveForge DMG artifact.");
  }
  if (!evidence.releaseNotesArtifact.ready) {
    blockers.push("Release notes artifact is missing or unavailable; run npm run desktop:release-notes-smoke first.");
  }
  if (!evidence.supportArtifact.ready) {
    blockers.push("Support artifact is missing or unavailable; run npm run desktop:support-artifact-smoke first.");
  }
  if (!evidence.updateFeedConfig.ready) {
    blockers.push("Update feed config summary is missing or unavailable; run npm run desktop:update-feed-config-smoke first.");
  }
  if (!evidence.updateMetadataPolicy.ready) {
    blockers.push("Update metadata policy summary is missing or unavailable; run npm run desktop:update-metadata-policy-smoke first.");
  }
  if (!evidence.autoUpdateReadiness.present) {
    blockers.push("Auto-update readiness summary is missing; run npm run desktop:auto-update-readiness-smoke first.");
  }
  if (!evidence.developerIdReadiness.present) {
    blockers.push("Developer ID readiness summary is missing; run npm run desktop:developer-id-readiness-smoke first.");
  }
  if (!evidence.developerIdSigning.present) {
    blockers.push("Developer ID signing summary is missing; run npm run desktop:developer-id-signing-smoke first.");
  }
  if (!evidence.notarization.present) {
    blockers.push("Notarization summary is missing; run npm run desktop:notarization-smoke first.");
  }
  if (!evidence.notarizedGatekeeper.present) {
    blockers.push("Notarized Gatekeeper summary is missing; run npm run desktop:notarized-gatekeeper-smoke first.");
  }
  if (!evidence.distributionChannelQa.redactedSummaryPresent) {
    blockers.push("Distribution-channel QA summary is missing; run npm run desktop:distribution-channel-qa-smoke first.");
  }
  return blockers;
}

function externalDistributionBlockers(input, evidence) {
  const blockers = [];
  const { autoUpdate, developerIdReadiness, developerIdSigning, notarization, notarizedGatekeeper, distributionQa } = input;

  blockers.push(...(distributionQa?.blockers ?? []));
  blockers.push(...(autoUpdate?.blockers ?? []));
  blockers.push(...(developerIdReadiness?.blockers ?? []));
  blockers.push(...(developerIdSigning?.blockers ?? []));
  blockers.push(...(notarization?.blockers ?? []));
  blockers.push(...(notarizedGatekeeper?.blockers ?? []));

  if (!evidence.autoUpdateReadiness.externalReady) {
    blockers.push("Auto-update readiness is not complete for the selected distribution channel.");
  }
  if (!evidence.developerIdSigning.signed) {
    blockers.push("Developer ID signed isolated app copy is not available for channel QA.");
  }
  if (!evidence.notarization.ready) {
    blockers.push("Notarization and stapling are not complete for the selected release artifact.");
  }
  if (!evidence.notarizedGatekeeper.accepted) {
    blockers.push("Notarized Gatekeeper assessment has not accepted the selected release artifact.");
  }
  if (!evidence.distributionChannelQa.ready) {
    blockers.push("External distribution-channel QA is not complete.");
  }

  return unique(blockers);
}

function formatEvidenceRows(evidence) {
  return [
    ["Release artifact manifest", evidence.releaseArtifact],
    ["Release notes artifact", evidence.releaseNotesArtifact],
    ["Support artifact", evidence.supportArtifact],
    ["Update feed config", evidence.updateFeedConfig],
    ["Update metadata policy", evidence.updateMetadataPolicy],
    ["Auto-update readiness", evidence.autoUpdateReadiness],
    ["Developer ID readiness", evidence.developerIdReadiness],
    ["Developer ID signing path", evidence.developerIdSigning],
    ["Notarization path", evidence.notarization],
    ["Notarized Gatekeeper path", evidence.notarizedGatekeeper],
    ["Distribution-channel QA", evidence.distributionChannelQa]
  ]
    .map(([label, item]) => `| ${label} | ${item.present ? "yes" : "no"} | ${item.ready || item.integrationReady || item.signed || item.accepted || item.redactedSummaryPresent ? "yes" : "no"} | ${item.path ?? "missing"} |`)
    .join("\n");
}

function buildMarkdown(summary) {
  const blockers = summary.externalDistributionBlockers.length > 0 ? summary.externalDistributionBlockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
  const localBlockers = summary.distributionHandoffBlockers.length > 0 ? summary.distributionHandoffBlockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
  const artifact = summary.artifact;

  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} Distribution Handoff

## What GrooveForge Is

${appName} is an all-genre desktop beat workstation for direct beat composition, sound design, arrangement, mixing, mastering, and local export. It supports first-time beat makers through Guided mode and working producers through Studio mode. Sampling remains optional future scope, not the release identity.

## Audience

- First-time beat makers can use Guided mode, First Beat Path, export preflight, and Handoff checks.
- Working producers can use Studio mode, Quick Actions, direct event editing, mix/master controls, and local delivery checks.

## Handoff Status

- Distribution handoff ready: ${summary.distributionHandoffReady ? "yes" : "no"}
- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}
- Network probe attempted: no
- Release upload attempted: no

## Artifact Identity

- App bundle: ${artifact.appBundlePath}
- Bundle id: ${artifact.bundleId}
- DMG: ${artifact.dmgPath}
- DMG bytes: ${artifact.dmgBytes}
- DMG SHA-256: ${artifact.dmgSha256}
- Signing scope: ${artifact.signatureKind}
- Hardened runtime flag present: ${artifact.hardenedRuntimeFlagPresent ? "yes" : "no"}

## Evidence Checklist

| evidence | present | ready | path |
|---|---:|---:|---|
${formatEvidenceRows(summary.evidence)}

## Required Private Inputs

- Distribution channel keys: ${summary.requiredPrivateInputs.distributionMetadataKeys.join(", ")}
- Update feed/channel keys: ${summary.requiredPrivateInputs.updateMetadataKeys.join(", ")}
- Signing/notary keys: ${summary.requiredPrivateInputs.signingAndNotaryKeys.join(", ")}
- Values for those keys are intentionally not recorded in this handoff.

## Next Local Commands

1. npm run release:check
2. npm run desktop:developer-id-signing-smoke
3. npm run desktop:notarization-smoke
4. npm run desktop:notarized-gatekeeper-smoke
5. npm run desktop:distribution-channel-qa-smoke
6. npm run desktop:distribution-handoff-smoke

## Privacy And Product Posture

- Local-first project files and exports remain on the user's machine.
- No account, analytics, payment, ad, cloud sync, remote AI, media upload, or imported-audio requirement is part of the current MVP.
- Release URLs, support URLs, feed URLs, credentials, tokens, channel values, private beats, and real user audio must not be committed.

## Handoff Blockers

${localBlockers}

## Current External Distribution Blockers

${blockers}

## Not Claimed

This local distribution handoff does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, release upload, or external distribution-channel QA.
`;
}

async function createHandoff() {
  const base = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    handoffMarkdownPath: relative(handoffMarkdownPath),
    handoffJsonPath: relative(handoffJsonPath),
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
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
      reason: "Distribution handoff smoke currently targets the macOS desktop release artifact chain",
      distributionHandoffReady: false,
      externalDistributionReady: false,
      distributionHandoffBlockers: ["Run on macOS after the desktop release readiness chain."],
      externalDistributionBlockers: ["External distribution remains unverified on this platform."]
    };
  }

  const manifest = await readJsonIfExists(releaseManifestPath);
  const releaseNotes = await readJsonIfExists(releaseNotesPath);
  const supportArtifact = await readJsonIfExists(supportArtifactPath);
  const updateFeedConfig = await readJsonIfExists(updateFeedConfigPath);
  const updatePolicy = await readJsonIfExists(updateMetadataPolicyPath);
  const autoUpdate = await readJsonIfExists(autoUpdateReadinessPath);
  const developerIdReadiness = await readJsonIfExists(developerIdReadinessPath);
  const developerIdSigning = await readJsonIfExists(developerIdSigningPath);
  const notarization = await readJsonIfExists(notarizationPath);
  const notarizedGatekeeper = await readJsonIfExists(notarizedGatekeeperPath);
  const distributionQa = await readJsonIfExists(distributionChannelQaPath);
  const input = {
    autoUpdate,
    developerIdReadiness,
    developerIdSigning,
    notarization,
    notarizedGatekeeper,
    distributionQa
  };
  const evidence = collectEvidence({
    manifest,
    releaseNotes,
    supportArtifact,
    updateFeedConfig,
    updatePolicy,
    ...input
  });
  const handoffBlockers = localHandoffBlockers(evidence);
  const distributionBlockers = externalDistributionBlockers(input, evidence);

  return {
    ...base,
    skipped: false,
    productScope: "all-genre direct beat workstation; sampling optional and secondary",
    handoffScope: "redacted local distribution evidence handoff for signing, notarization, update, support, release, and channel QA",
    audience: ["first-time beat makers", "working producers"],
    artifact: {
      appBundlePath: manifest?.appBundle?.path ?? null,
      bundleId: manifest?.appBundle?.bundleIdentifier ?? null,
      dmgPath: manifest?.dmg?.path ?? null,
      dmgBytes: manifest?.dmg?.bytes ?? null,
      dmgSha256: manifest?.dmg?.sha256 ?? null,
      signatureKind: manifest?.signing?.signatureKind ?? null,
      hardenedRuntimeFlagPresent: manifest?.signing?.hardenedRuntimeFlagPresent === true
    },
    requiredPrivateInputs: {
      distributionMetadataKeys,
      updateMetadataKeys,
      signingAndNotaryKeys,
      valuesRecorded: false
    },
    evidence,
    distributionHandoffReady: handoffBlockers.length === 0,
    externalDistributionReady: distributionQa?.externalDistributionReady === true,
    distributionHandoffBlockers: handoffBlockers,
    externalDistributionBlockers: distributionBlockers
  };
}

const summary = await createHandoff();
const markdown = summary.skipped ? `# ${appName} ${summary.version} Distribution Handoff\n\n${summary.reason}\n` : buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(handoffJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(handoffMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "distribution handoff should identify GrooveForge");
check(summary.bundleId === bundleId, `distribution handoff should identify ${bundleId}`);
check(summary.version === packageJson.version, "distribution handoff should match package version");
check(summary.networkProbeAttempted === false, "distribution handoff smoke should not probe remote channels");
check(summary.releaseUploadAttempted === false, "distribution handoff smoke should not upload release artifacts");
check(summary.releaseUrlValueRecorded === false, "distribution handoff should not record release URL values");
check(summary.supportUrlValueRecorded === false, "distribution handoff should not record support URL values");
check(summary.feedValueRecorded === false, "distribution handoff should not record feed values");
check(summary.credentialValueRecorded === false, "distribution handoff should not record credential values");
check(summary.tokenValueRecorded === false, "distribution handoff should not record token values");
check(summary.channelValueRecorded === false, "distribution handoff should not record channel values");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "distribution handoff should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "distribution handoff should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "distribution handoff should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "distribution handoff should not claim auto-update");
check(summary.releaseGateClaimedExternalDistribution === false, "distribution handoff should not claim external distribution completion");
check(summary.requiredPrivateInputs?.valuesRecorded === false, "distribution handoff should record environment key names only");
check(Array.isArray(summary.distributionHandoffBlockers), "distribution handoff should include handoff blockers");
check(Array.isArray(summary.externalDistributionBlockers), "distribution handoff should include external distribution blockers");
check(summary.distributionHandoffReady === false || summary.distributionHandoffBlockers.length === 0, "ready handoff should not include handoff blockers");
check(markdown.includes("all-genre desktop beat workstation"), "distribution handoff should describe the direct beat workstation scope");
check(markdown.includes("Sampling remains optional future scope"), "distribution handoff should keep sampling secondary");
check(markdown.includes("First-time beat makers"), "distribution handoff should address first-time beat makers");
check(markdown.includes("working producers"), "distribution handoff should address working producers");
check(markdown.includes("Distribution handoff ready:"), "distribution handoff should include handoff readiness");
check(markdown.includes("External distribution ready:"), "distribution handoff should include external readiness");
check(markdown.includes("Required Private Inputs"), "distribution handoff should list required private input keys");
check(markdown.includes("Values for those keys are intentionally not recorded"), "distribution handoff should state value redaction");
check(!/https?:\/\//i.test(markdown), "distribution handoff should not include public or private URL values before channel selection");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of privateEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "distribution handoff should not include private environment values");
}

if (failures.length > 0) {
  fail("Distribution handoff validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge distribution handoff smoke passed.");
console.log(`- Markdown: ${relative(handoffMarkdownPath)}`);
console.log(`- JSON: ${relative(handoffJsonPath)}`);
console.log(`- Distribution handoff ready: ${summary.distributionHandoffReady ? "yes" : "no"}`);
console.log(`- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}`);
if (summary.distributionHandoffBlockers.length > 0) {
  console.log(`- Handoff blockers: ${summary.distributionHandoffBlockers.join(" | ")}`);
}
if (summary.externalDistributionBlockers.length > 0) {
  console.log(`- External distribution blockers: ${summary.externalDistributionBlockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe or upload attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, or channel values");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
