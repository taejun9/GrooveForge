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
const bundleManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-bundle-manifest.json`);
const handoffPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-handoff.json`);
const autoUpdateReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const developerIdReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-readiness.json`);
const developerIdSigningPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(summaryRoot, `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(summaryRoot, `${appName}-${platformArch}-notarized-gatekeeper.json`);
const distributionChannelQaPath = path.join(summaryRoot, `${appName}-${platformArch}-distribution-channel-qa.json`);
const privateInputsMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-private-inputs.md`);
const privateInputsJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-private-inputs.json`);
const distributionMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_DISTRIBUTION_QA_APPROVED"
];
const updateFeedUrlKeys = ["GROOVEFORGE_UPDATE_FEED_URL", "ELECTRON_UPDATE_FEED_URL", "UPDATE_FEED_URL"];
const updateChannelKeys = ["GROOVEFORGE_UPDATE_CHANNEL", "ELECTRON_UPDATE_CHANNEL", "UPDATE_CHANNEL"];
const signingKeys = ["GROOVEFORGE_DEVELOPER_ID_IDENTITY"];
const notarizationKeys = [
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
const allPrivateKeys = [...distributionMetadataKeys, ...updateFeedUrlKeys, ...updateChannelKeys, ...signingKeys, ...notarizationKeys];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge distribution private inputs smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function readEnv(key) {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : "";
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function firstPresentKey(keys) {
  return keys.find((key) => readEnv(key).length > 0) ?? null;
}

function keySignals(keys) {
  return keys.map((key) => ({
    key,
    present: readEnv(key).length > 0,
    valueRecorded: false
  }));
}

function validateHttpsUrlPresence(key) {
  const value = readEnv(key);
  const blockers = [];
  if (!value) {
    blockers.push(`${key} is required and must be a safe HTTPS URL.`);
    return {
      key,
      keyPresent: false,
      urlValid: false,
      usesHttps: false,
      hasHostname: false,
      hasCredentials: false,
      hasFragment: false,
      valueRecorded: false,
      blockers
    };
  }

  let parsed = null;
  try {
    parsed = new URL(value);
  } catch {
    blockers.push(`${key} must be an absolute HTTPS URL.`);
  }

  const usesHttps = parsed?.protocol === "https:";
  const hasHostname = Boolean(parsed?.hostname);
  const hasCredentials = Boolean(parsed?.username || parsed?.password);
  const hasFragment = Boolean(parsed?.hash);
  if (parsed && !usesHttps) {
    blockers.push(`${key} must use HTTPS.`);
  }
  if (parsed && !hasHostname) {
    blockers.push(`${key} must include a hostname.`);
  }
  if (parsed && hasCredentials) {
    blockers.push(`${key} must not include credentials.`);
  }
  if (parsed && hasFragment) {
    blockers.push(`${key} must not include a fragment.`);
  }

  return {
    key,
    keyPresent: true,
    urlValid: blockers.length === 0,
    usesHttps,
    hasHostname,
    hasCredentials,
    hasFragment,
    valueRecorded: false,
    blockers
  };
}

function validateFirstHttpsUrl(keys, label) {
  const key = firstPresentKey(keys);
  if (!key) {
    return {
      label,
      keys,
      selectedKey: null,
      keyPresent: false,
      urlValid: false,
      valueRecorded: false,
      blockers: [`${label} environment key is required and must be a safe HTTPS URL.`]
    };
  }

  const validation = validateHttpsUrlPresence(key);
  return {
    label,
    keys,
    selectedKey: key,
    keyPresent: validation.keyPresent,
    urlValid: validation.urlValid,
    valueRecorded: false,
    blockers: validation.blockers
  };
}

function distributionChannelSignals() {
  const value = readEnv("GROOVEFORGE_DISTRIBUTION_CHANNEL");
  const keyPresent = value.length > 0;
  const channelValid = /^(direct-download|private-beta|managed-release)$/.test(value);
  const blockers = [];
  if (!keyPresent || !channelValid) {
    blockers.push("GROOVEFORGE_DISTRIBUTION_CHANNEL must be configured to an allowed release channel.");
  }

  return {
    keys: ["GROOVEFORGE_DISTRIBUTION_CHANNEL"],
    keyPresent,
    channelValid,
    valueRecorded: false,
    blockers
  };
}

function manualApprovalSignals() {
  const value = readEnv("GROOVEFORGE_DISTRIBUTION_QA_APPROVED");
  const keyPresent = value.length > 0;
  const approved = value === "1";
  return {
    keys: ["GROOVEFORGE_DISTRIBUTION_QA_APPROVED"],
    keyPresent,
    approved,
    valueRecorded: false,
    blockers: approved ? [] : ["GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1 is required after manual channel QA."]
  };
}

function updateChannelSignals() {
  const key = firstPresentKey(updateChannelKeys);
  const value = key ? readEnv(key) : "";
  const channelValid = /^[a-z0-9][a-z0-9._-]{0,31}$/.test(value);
  return {
    keys: updateChannelKeys,
    selectedKey: key,
    keyPresent: Boolean(key),
    channelValid,
    valueRecorded: false,
    blockers: key && channelValid ? [] : ["An update release channel key is required and must pass local channel validation."]
  };
}

function developerIdSignals(developerIdReadiness, developerIdSigning) {
  const keyPresent = readEnv("GROOVEFORGE_DEVELOPER_ID_IDENTITY").length > 0;
  const readinessIdentityCount = Number(developerIdReadiness?.developerIdSigning?.validDeveloperIdApplicationIdentityCount ?? 0);
  const matchingIdentityFound = developerIdSigning?.matchingIdentityFound === true;
  const signedCopyReady = developerIdSigning?.developerIdSigned === true;
  const blockers = [];
  if (!keyPresent) {
    blockers.push("GROOVEFORGE_DEVELOPER_ID_IDENTITY must be set before Developer ID signing.");
  }
  if (readinessIdentityCount <= 0) {
    blockers.push("A valid Developer ID Application identity must be available in the keychain search list.");
  }
  if (!matchingIdentityFound) {
    blockers.push("The configured Developer ID identity must match an available Developer ID Application identity.");
  }

  return {
    keys: signingKeys,
    keyPresent,
    validDeveloperIdApplicationIdentityCount: readinessIdentityCount,
    matchingIdentityFound,
    signedCopyReady,
    developerIdIdentityValueRecorded: false,
    blockers
  };
}

function notarizationSignals(developerIdReadiness, notarization) {
  const appleIdCredentialKeysPresent =
    readEnv("APPLE_ID").length > 0 &&
    readEnv("APPLE_TEAM_ID").length > 0 &&
    readEnv("APPLE_APP_SPECIFIC_PASSWORD").length > 0;
  const ascKeyPath = readEnv("ASC_KEY_PATH");
  const appStoreConnectApiKeySignalPresent =
    readEnv("ASC_KEY_ID").length > 0 &&
    readEnv("ASC_ISSUER_ID").length > 0 &&
    ascKeyPath.length > 0 &&
    existsSync(ascKeyPath);
  const notarytoolKeychainProfileSignalPresent =
    readEnv("APPLE_NOTARY_PROFILE").length > 0 ||
    readEnv("NOTARYTOOL_KEYCHAIN_PROFILE").length > 0;
  const credentialSignalReady =
    appleIdCredentialKeysPresent ||
    appStoreConnectApiKeySignalPresent ||
    notarytoolKeychainProfileSignalPresent ||
    developerIdReadiness?.notarization?.ready === true;
  const submitKeyPresent = readEnv("GROOVEFORGE_NOTARY_SUBMIT").length > 0;
  const submitRequested = readEnv("GROOVEFORGE_NOTARY_SUBMIT") === "1";
  const notarizationReady = notarization?.notarizationReady === true;
  const blockers = [];
  if (!credentialSignalReady) {
    blockers.push("A bounded Apple notary credential signal is required before notarization.");
  }
  if (!submitRequested) {
    blockers.push("GROOVEFORGE_NOTARY_SUBMIT=1 is required only after signing and credentials are ready.");
  }

  return {
    keys: notarizationKeys,
    keySignals: keySignals(notarizationKeys),
    appleIdCredentialKeysPresent,
    appStoreConnectApiKeySignalPresent,
    ascKeyPathKeyPresent: ascKeyPath.length > 0,
    ascKeyPathExists: ascKeyPath.length > 0 && existsSync(ascKeyPath),
    notarytoolKeychainProfileSignalPresent,
    credentialSignalReady,
    submitKeyPresent,
    submitRequested,
    notarizationReady,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    blockers
  };
}

function collectEvidence(input) {
  const { bundleManifest, handoff, autoUpdate, developerIdReadiness, developerIdSigning, notarization, gatekeeper, distributionQa } = input;
  return {
    bundleManifest: {
      present: Boolean(bundleManifest),
      ready: bundleManifest?.distributionBundleManifestReady === true,
      path: existsSync(bundleManifestPath) ? relative(bundleManifestPath) : null
    },
    handoff: {
      present: Boolean(handoff),
      ready: handoff?.distributionHandoffReady === true,
      path: existsSync(handoffPath) ? relative(handoffPath) : null
    },
    autoUpdate: {
      present: Boolean(autoUpdate),
      ready: autoUpdate?.autoUpdateReady === true,
      path: existsSync(autoUpdateReadinessPath) ? relative(autoUpdateReadinessPath) : null
    },
    developerIdReadiness: {
      present: Boolean(developerIdReadiness),
      ready: developerIdReadiness?.externalDistributionReady === true,
      path: existsSync(developerIdReadinessPath) ? relative(developerIdReadinessPath) : null
    },
    developerIdSigning: {
      present: Boolean(developerIdSigning),
      ready: developerIdSigning?.developerIdSigned === true,
      path: existsSync(developerIdSigningPath) ? relative(developerIdSigningPath) : null
    },
    notarization: {
      present: Boolean(notarization),
      ready: notarization?.notarizationReady === true,
      path: existsSync(notarizationPath) ? relative(notarizationPath) : null
    },
    notarizedGatekeeper: {
      present: Boolean(gatekeeper),
      ready: gatekeeper?.notarizedGatekeeperAccepted === true,
      path: existsSync(notarizedGatekeeperPath) ? relative(notarizedGatekeeperPath) : null
    },
    distributionChannelQa: {
      present: Boolean(distributionQa),
      ready: distributionQa?.externalDistributionReady === true,
      path: existsSync(distributionChannelQaPath) ? relative(distributionChannelQaPath) : null
    }
  };
}

function evidenceBlockers(evidence) {
  const blockers = [];
  if (!evidence.bundleManifest.present) {
    blockers.push("Distribution bundle manifest is missing; run npm run desktop:distribution-bundle-manifest-smoke first.");
  }
  if (!evidence.handoff.present) {
    blockers.push("Distribution handoff is missing; run npm run desktop:distribution-handoff-smoke first.");
  }
  if (!evidence.autoUpdate.present) {
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
  if (!evidence.distributionChannelQa.present) {
    blockers.push("Distribution-channel QA summary is missing; run npm run desktop:distribution-channel-qa-smoke first.");
  }
  return blockers;
}

function formatGroupRows(groups) {
  return groups
    .map((group) => `| ${group.label} | ${group.ready ? "yes" : "no"} | ${group.requiredKeys.join(", ")} | ${group.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatEvidenceRows(evidence) {
  return Object.entries(evidence)
    .map(([label, item]) => `| ${label} | ${item.present ? "yes" : "no"} | ${item.ready ? "yes" : "no"} | ${item.path ?? "missing"} |`)
    .join("\n");
}

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
}

function privateEnvironmentValues() {
  return allPrivateKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} Distribution Private Inputs

## What GrooveForge Is

${appName} is an all-genre desktop beat workstation for direct beat composition, sound design, arrangement, mixing, mastering, and local export. It supports First-time beat makers through Guided mode and Working producers through Studio mode. Sampling remains optional future scope, not the release identity.

## Private Input Status

- Private inputs ready: ${summary.privateInputsReady ? "yes" : "no"}
- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Notary submission attempted: no

## Input Groups

| group | ready | required keys | values recorded |
|---|---:|---|---:|
${formatGroupRows(summary.inputGroups)}

## Evidence Inputs

| evidence | present | ready | path |
|---|---:|---:|---|
${formatEvidenceRows(summary.evidence)}

## Next Local Commands

1. npm run release:check
2. npm run desktop:distribution-private-inputs-smoke
3. npm run desktop:developer-id-signing-smoke
4. npm run desktop:notarization-smoke
5. npm run desktop:notarized-gatekeeper-smoke
6. npm run desktop:distribution-channel-qa-smoke

## Privacy Rules

- Values for required private keys are intentionally not recorded.
- Release URLs, support URLs, feed URLs, credentials, tokens, channel values, Developer ID identity labels, private beats, and real user audio must not be committed.
- Local-first project files and exports remain on the user's machine.

## Private Input Blockers

${formatBlockers(summary.privateInputBlockers)}

## External Distribution Blockers

${formatBlockers(summary.externalDistributionBlockers)}

## Not Claimed

This local private-inputs smoke does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, release upload, notary submission, or external distribution-channel QA.
`;
}

function group(label, requiredKeys, ready, detail) {
  return {
    label,
    requiredKeys,
    ready,
    valueRecorded: false,
    detail
  };
}

async function createPrivateInputsSummary() {
  const base = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    privateInputsMarkdownPath: relative(privateInputsMarkdownPath),
    privateInputsJsonPath: relative(privateInputsJsonPath),
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttempted: false,
    signingAttempted: false,
    privateValuesRecorded: false,
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

  const bundleManifest = await readJsonIfExists(bundleManifestPath);
  const handoff = await readJsonIfExists(handoffPath);
  const autoUpdate = await readJsonIfExists(autoUpdateReadinessPath);
  const developerIdReadiness = await readJsonIfExists(developerIdReadinessPath);
  const developerIdSigning = await readJsonIfExists(developerIdSigningPath);
  const notarization = await readJsonIfExists(notarizationPath);
  const gatekeeper = await readJsonIfExists(notarizedGatekeeperPath);
  const distributionQa = await readJsonIfExists(distributionChannelQaPath);
  const evidence = collectEvidence({
    bundleManifest,
    handoff,
    autoUpdate,
    developerIdReadiness,
    developerIdSigning,
    notarization,
    gatekeeper,
    distributionQa
  });
  const channel = distributionChannelSignals();
  const downloadUrl = validateHttpsUrlPresence("GROOVEFORGE_RELEASE_DOWNLOAD_URL");
  const releaseNotesUrl = validateHttpsUrlPresence("GROOVEFORGE_RELEASE_NOTES_URL");
  const supportUrl = validateHttpsUrlPresence("GROOVEFORGE_SUPPORT_URL");
  const updateFeed = validateFirstHttpsUrl(updateFeedUrlKeys, "Update feed URL");
  const updateChannel = updateChannelSignals();
  const developerId = developerIdSignals(developerIdReadiness, developerIdSigning);
  const notarizationInputs = notarizationSignals(developerIdReadiness, notarization);
  const manualApproval = manualApprovalSignals();
  const inputGroups = [
    group("Distribution channel", ["GROOVEFORGE_DISTRIBUTION_CHANNEL"], channel.keyPresent && channel.channelValid, channel),
    group("Release download URL", ["GROOVEFORGE_RELEASE_DOWNLOAD_URL"], downloadUrl.urlValid, downloadUrl),
    group("Release notes URL", ["GROOVEFORGE_RELEASE_NOTES_URL"], releaseNotesUrl.urlValid, releaseNotesUrl),
    group("Support URL", ["GROOVEFORGE_SUPPORT_URL"], supportUrl.urlValid, supportUrl),
    group("Update feed URL", updateFeedUrlKeys, updateFeed.urlValid, updateFeed),
    group("Update channel", updateChannelKeys, updateChannel.channelValid, updateChannel),
    group("Developer ID signing identity", signingKeys, developerId.keyPresent && developerId.matchingIdentityFound, developerId),
    group("Notarization credentials", notarizationKeys, notarizationInputs.credentialSignalReady && notarizationInputs.submitRequested, notarizationInputs),
    group("Manual distribution QA approval", ["GROOVEFORGE_DISTRIBUTION_QA_APPROVED"], manualApproval.approved, manualApproval)
  ];
  const privateInputBlockers = [
    ...channel.blockers,
    ...downloadUrl.blockers,
    ...releaseNotesUrl.blockers,
    ...supportUrl.blockers,
    ...updateFeed.blockers,
    ...updateChannel.blockers,
    ...developerId.blockers,
    ...notarizationInputs.blockers,
    ...manualApproval.blockers,
    ...evidenceBlockers(evidence)
  ];
  const externalDistributionBlockers = [
    ...(bundleManifest?.externalDistributionBlockers ?? []),
    ...(handoff?.externalDistributionBlockers ?? []),
    ...(distributionQa?.blockers ?? []),
    ...(autoUpdate?.blockers ?? []),
    ...(developerIdReadiness?.blockers ?? []),
    ...(developerIdSigning?.blockers ?? []),
    ...(notarization?.blockers ?? []),
    ...(gatekeeper?.blockers ?? [])
  ].filter((blocker, index, blockers) => blockers.indexOf(blocker) === index);

  return {
    ...base,
    skipped: process.platform !== "darwin",
    reason: process.platform === "darwin" ? null : "Distribution private inputs smoke currently targets the macOS desktop release artifact chain",
    productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
    privateInputsScope: "redacted local external distribution input checklist for release URLs, update feeds, signing, notarization, channel metadata, and manual QA approval",
    requiredPrivateInputs: {
      distributionMetadataKeys,
      updateFeedUrlKeys,
      updateChannelKeys,
      signingKeys,
      notarizationKeys,
      valuesRecorded: false
    },
    inputGroups,
    evidence,
    privateInputsReady: process.platform === "darwin" && privateInputBlockers.length === 0,
    externalDistributionReady:
      bundleManifest?.externalDistributionReady === true &&
      handoff?.externalDistributionReady === true &&
      distributionQa?.externalDistributionReady === true &&
      autoUpdate?.autoUpdateReady === true &&
      developerIdSigning?.developerIdSigned === true &&
      notarization?.notarizationReady === true &&
      gatekeeper?.notarizedGatekeeperAccepted === true,
    privateInputBlockers: process.platform === "darwin" ? privateInputBlockers : ["Run on macOS after the desktop release readiness chain."],
    externalDistributionBlockers
  };
}

const summary = await createPrivateInputsSummary();
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(privateInputsJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(privateInputsMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "distribution private inputs should identify GrooveForge");
check(summary.bundleId === bundleId, `distribution private inputs should identify ${bundleId}`);
check(summary.version === packageJson.version, "distribution private inputs should match package version");
check(summary.networkProbeAttempted === false, "distribution private inputs smoke should not probe remote channels");
check(summary.releaseUploadAttempted === false, "distribution private inputs smoke should not upload release artifacts");
check(summary.notarySubmissionAttempted === false, "distribution private inputs smoke should not submit to Apple notary services");
check(summary.signingAttempted === false, "distribution private inputs smoke should not sign artifacts");
check(summary.privateValuesRecorded === false, "distribution private inputs should not record private values");
check(summary.releaseUrlValueRecorded === false, "distribution private inputs should not record release URL values");
check(summary.supportUrlValueRecorded === false, "distribution private inputs should not record support URL values");
check(summary.feedValueRecorded === false, "distribution private inputs should not record feed values");
check(summary.credentialValueRecorded === false, "distribution private inputs should not record credential values");
check(summary.tokenValueRecorded === false, "distribution private inputs should not record token values");
check(summary.channelValueRecorded === false, "distribution private inputs should not record channel values");
check(summary.developerIdIdentityValueRecorded === false, "distribution private inputs should not record Developer ID identity values");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "distribution private inputs should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "distribution private inputs should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "distribution private inputs should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "distribution private inputs should not claim auto-update");
check(summary.releaseGateClaimedExternalDistribution === false, "distribution private inputs should not claim external distribution completion");
check(summary.requiredPrivateInputs?.valuesRecorded === false, "distribution private inputs should record key names only");
check(Array.isArray(summary.inputGroups), "distribution private inputs should include input groups");
check(Array.isArray(summary.privateInputBlockers), "distribution private inputs should include private input blockers");
check(Array.isArray(summary.externalDistributionBlockers), "distribution private inputs should include external distribution blockers");
check(summary.privateInputsReady === false || summary.privateInputBlockers.length === 0, "ready private input summary should not include private input blockers");
check(markdown.includes("all-genre desktop beat workstation"), "distribution private inputs should describe the direct beat workstation scope");
check(markdown.includes("Sampling remains optional future scope"), "distribution private inputs should keep sampling secondary");
check(markdown.includes("First-time beat makers"), "distribution private inputs should address first-time beat makers");
check(markdown.includes("Working producers"), "distribution private inputs should address working producers");
check(markdown.includes("Private inputs ready:"), "distribution private inputs should include private input readiness");
check(markdown.includes("External distribution ready:"), "distribution private inputs should include external readiness");
check(markdown.includes("Private values recorded: no"), "distribution private inputs should state value redaction");
check(markdown.includes("Values for required private keys are intentionally not recorded"), "distribution private inputs should state key value redaction");
check(!/https?:\/\//i.test(markdown), "distribution private inputs should not include public or private URL values before channel selection");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of privateEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "distribution private inputs should not include private environment values");
}

if (failures.length > 0) {
  fail("Distribution private inputs validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge distribution private inputs smoke passed.");
console.log(`- Markdown: ${relative(privateInputsMarkdownPath)}`);
console.log(`- JSON: ${relative(privateInputsJsonPath)}`);
console.log(`- Private inputs ready: ${summary.privateInputsReady ? "yes" : "no"}`);
console.log(`- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}`);
console.log("- Private values recorded: no");
if (summary.privateInputBlockers.length > 0) {
  console.log(`- Private input blockers: ${summary.privateInputBlockers.join(" | ")}`);
}
if (summary.externalDistributionBlockers.length > 0) {
  console.log(`- External distribution blockers: ${summary.externalDistributionBlockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe, upload, or Apple notary submission attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, or channel values");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
