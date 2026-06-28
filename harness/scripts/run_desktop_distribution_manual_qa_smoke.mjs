#!/usr/bin/env node

import { createHash } from "node:crypto";
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
const summaryRoot = path.join(root, "build", "desktop");
const releaseManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const releaseNotesPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-notes.json`);
const supportArtifactPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-support.json`);
const updateFeedConfigPath = path.join(summaryRoot, `${appName}-${platformArch}-update-feed-config.json`);
const updateMetadataPolicyPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-policy.json`);
const updateMetadataArtifactsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-artifacts.json`);
const autoUpdateReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const developerIdSigningPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(summaryRoot, `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(summaryRoot, `${appName}-${platformArch}-notarized-gatekeeper.json`);
const checklistMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-manual-qa.md`);
const checklistJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-manual-qa.json`);
const distributionLocalEnv = await loadDistributionLocalEnv({ root, allowedKeys: distributionPrivateInputKeys });
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge distribution manual QA smoke failed:");
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

function privateInputValues() {
  return distributionPrivateInputKeys
    .filter((key) => key !== "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256")
    .map((key) => process.env[key])
    .filter((value) => typeof value === "string" && value.trim().length >= 8);
}

function sha256Text(value) {
  return createHash("sha256").update(value).digest("hex");
}

function manualQaDigestPayload(summary, checklist) {
  return {
    appName: summary.appName,
    bundleId: summary.bundleId,
    version: summary.version,
    platform: summary.platform,
    arch: summary.arch,
    selectedUpdateArtifactSource: summary.selectedUpdateArtifactSource ?? null,
    signedUpdateArtifactReady: summary.signedUpdateArtifactReady === true,
    checklist: checklist.map((item) => ({
      id: item.id,
      label: item.label,
      ready: item.ready,
      evidence: item.evidence,
      operatorAction: item.operatorAction,
      blockers: item.blockers,
      valueRecorded: item.valueRecorded
    })),
    privateValuesRecorded: false,
    releaseGateClaimedManualQaApproval: false,
    releaseGateClaimedExternalDistribution: false
  };
}

function manualQaChecklistSha256(summary, checklist) {
  return sha256Text(JSON.stringify(manualQaDigestPayload(summary, checklist)));
}

function checklistItem(id, label, ready, evidence, operatorAction, blocker) {
  return {
    id,
    label,
    ready: Boolean(ready),
    evidence,
    operatorAction,
    blockers: ready ? [] : [blocker],
    valueRecorded: false
  };
}

function formatChecklistRows(items) {
  return items.map((item) => `| ${item.label} | ${item.ready ? "yes" : "no"} | ${item.evidence} |`).join("\n");
}

function formatOperatorActions(items) {
  return items.map((item) => `- ${item.operatorAction}`).join("\n");
}

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} Distribution Manual QA

## Status

- Manual QA checklist ready: ${summary.manualQaChecklistReady ? "yes" : "no"}
- Manual QA approval ready: ${summary.manualQaApprovalReady ? "yes" : "no"}
- Manual QA checklist SHA-256: ${summary.manualQaChecklistSha256}
- Manual QA checklist digest matched: ${summary.manualQaChecklistDigestMatches ? "yes" : "no"}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Notary submission attempted: no

## Checklist

| check | ready | evidence |
|---|---:|---|
${formatChecklistRows(summary.checklist)}

## Operator Actions

${formatOperatorActions(summary.checklist)}

## Approval

Set \`GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256=${summary.manualQaChecklistSha256}\` and \`GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1\` only after every operator action above has been completed against the selected signed release artifact and public channel destinations.

## Blockers

${formatBlockers(summary.blockers)}

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, private beats, and real user audio are not recorded.

## Not Claimed

This local manual QA checklist does not claim manual channel QA approval, Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, release upload, or external distribution completion.
`;
}

async function createManualQaSummary() {
  const base = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    localEnvInput: distributionLocalEnv,
    localEnvValueRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttemptedByThisSmoke: false,
    releaseGateClaimedManualQaApproval: false,
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
      reason: "Distribution manual QA checklist currently targets the macOS desktop release artifact chain",
      manualQaChecklistReady: false,
      manualQaApprovalReady: false,
      checklist: [],
      blockers: ["Run on macOS after the desktop release readiness chain."]
    };
  }

  const manifest = await readJsonIfExists(releaseManifestPath);
  const releaseNotes = await readJsonIfExists(releaseNotesPath);
  const supportArtifact = await readJsonIfExists(supportArtifactPath);
  const updateFeedConfig = await readJsonIfExists(updateFeedConfigPath);
  const updatePolicy = await readJsonIfExists(updateMetadataPolicyPath);
  const updateArtifacts = await readJsonIfExists(updateMetadataArtifactsPath);
  const autoUpdate = await readJsonIfExists(autoUpdateReadinessPath);
  const developerIdSigning = await readJsonIfExists(developerIdSigningPath);
  const notarization = await readJsonIfExists(notarizationPath);
  const notarizedGatekeeper = await readJsonIfExists(notarizedGatekeeperPath);
  const releaseArtifactReady =
    manifest?.appBundle?.bundleIdentifier === bundleId &&
    /^[a-f0-9]{64}$/.test(manifest?.dmg?.sha256 ?? "") &&
    Number(manifest?.dmg?.bytes ?? 0) > 10000000;
  const releaseNotesReady = releaseNotes?.releaseNotesArtifactReady === true;
  const supportReady = supportArtifact?.supportArtifactReady === true;
  const updateMetadataDraftReady = updateArtifacts?.updateMetadataArtifactsDrafted === true;
  const updaterUserPathReady =
    autoUpdate?.checks?.updaterIntegrationReady === true &&
    autoUpdate?.checks?.userFacingUpdateBehaviorReady === true;
  const signedArtifactSelected =
    updateArtifacts?.signedUpdateArtifact?.ready === true &&
    updateArtifacts?.sourceDmg?.selectedSource === "notarized-isolated-dmg";
  const developerIdSigned = developerIdSigning?.developerIdSigned === true;
  const notarizedAndStapled =
    notarization?.notarizationReady === true &&
    notarization?.notarizationAccepted === true &&
    notarization?.stapled === true &&
    notarization?.stapleValidationPassed === true;
  const gatekeeperAccepted = notarizedGatekeeper?.notarizedGatekeeperAccepted === true;
  const approvalChecklist = [
    checklistItem(
      "release-artifact",
      "Release artifact evidence",
      releaseArtifactReady,
      existsSync(releaseManifestPath) ? relative(releaseManifestPath) : relative(releaseManifestPath),
      "Confirm the selected DMG path, byte size, checksum, bundle id, icon, and direct-composition product scope match the intended release.",
      "Release manifest evidence is missing or incomplete."
    ),
    checklistItem(
      "release-notes",
      "Release notes evidence",
      releaseNotesReady,
      existsSync(releaseNotesPath) ? relative(releaseNotesPath) : relative(releaseNotesPath),
      "Publish release notes that match the local release notes artifact and do not expose private values.",
      "Release notes artifact is missing or incomplete."
    ),
    checklistItem(
      "support-artifact",
      "Support page evidence",
      supportReady,
      existsSync(supportArtifactPath) ? relative(supportArtifactPath) : relative(supportArtifactPath),
      "Publish support content that matches the local support artifact and keeps local-first privacy posture clear.",
      "Support artifact is missing or incomplete."
    ),
    checklistItem(
      "update-metadata",
      "Update metadata evidence",
      Boolean(updateFeedConfig) && updatePolicy?.policyAvailable === true && updateMetadataDraftReady,
      [
        existsSync(updateFeedConfigPath) ? relative(updateFeedConfigPath) : relative(updateFeedConfigPath),
        existsSync(updateMetadataPolicyPath) ? relative(updateMetadataPolicyPath) : relative(updateMetadataPolicyPath),
        existsSync(updateMetadataArtifactsPath) ? relative(updateMetadataArtifactsPath) : relative(updateMetadataArtifactsPath)
      ].join(", "),
      "Confirm the update feed destination, channel, latest metadata, app update config, and blockmap are staged for the selected release artifact.",
      "Update feed config, policy, or metadata artifact draft evidence is missing."
    ),
    checklistItem(
      "auto-update",
      "User-facing update path",
      updaterUserPathReady,
      existsSync(autoUpdateReadinessPath) ? relative(autoUpdateReadinessPath) : relative(autoUpdateReadinessPath),
      "Run the user-facing Check for Updates path against the intended update feed only after signed update metadata is staged.",
      "Auto-update integration or user-facing update behavior evidence is missing."
    ),
    checklistItem(
      "signed-artifact",
      "Signed update artifact selection",
      signedArtifactSelected,
      existsSync(updateMetadataArtifactsPath) ? relative(updateMetadataArtifactsPath) : relative(updateMetadataArtifactsPath),
      "Confirm the selected signed artifact in update metadata is the notarized isolated DMG before approving public distribution.",
      "Update metadata has not selected a signed, notarized, Gatekeeper-accepted DMG."
    ),
    checklistItem(
      "developer-id",
      "Developer ID signing evidence",
      developerIdSigned,
      existsSync(developerIdSigningPath) ? relative(developerIdSigningPath) : relative(developerIdSigningPath),
      "Confirm the selected artifact was signed with Developer ID Application authority and hardened runtime entitlements.",
      "Developer ID signed isolated app evidence is missing."
    ),
    checklistItem(
      "notarization",
      "Notarization/stapling evidence",
      notarizedAndStapled,
      existsSync(notarizationPath) ? relative(notarizationPath) : relative(notarizationPath),
      "Confirm Apple notarization/stapling returned Accepted, the ticket is stapled, and staple validation passed.",
      "Notarization, stapling, or staple validation evidence is incomplete."
    ),
    checklistItem(
      "gatekeeper",
      "notarized Gatekeeper evidence",
      gatekeeperAccepted,
      existsSync(notarizedGatekeeperPath) ? relative(notarizedGatekeeperPath) : relative(notarizedGatekeeperPath),
      "Confirm notarized Gatekeeper accepts the stapled DMG and mounted app on the target macOS channel.",
      "Notarized Gatekeeper acceptance evidence is missing."
    )
  ];
  const approvalBase = {
    ...base,
    skipped: false,
    selectedUpdateArtifactSource: updateArtifacts?.sourceDmg?.selectedSource ?? null,
    signedUpdateArtifactReady: updateArtifacts?.signedUpdateArtifact?.ready === true
  };
  const checklistSha256 = manualQaChecklistSha256(approvalBase, approvalChecklist);
  const manualQaChecklistDigestKey = process.env.GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256?.trim() ?? "";
  const manualQaChecklistDigestKeyPresent = manualQaChecklistDigestKey.length > 0;
  const manualQaChecklistDigestWellFormed = /^[a-f0-9]{64}$/.test(manualQaChecklistDigestKey);
  const manualQaChecklistDigestMatches = manualQaChecklistDigestWellFormed && manualQaChecklistDigestKey === checklistSha256;
  const manualQaApprovalSignalReady = process.env.GROOVEFORGE_DISTRIBUTION_QA_APPROVED === "1";
  const manualQaApprovalReady = manualQaApprovalSignalReady && manualQaChecklistDigestMatches;
  const checklist = [
    ...approvalChecklist,
    checklistItem(
      "manual-approval",
      "Manual approval env signal and checklist digest",
      manualQaApprovalReady,
      `GROOVEFORGE_DISTRIBUTION_QA_APPROVED and GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256=${checklistSha256}`,
      "Set GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1 and GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256 to the checklist SHA-256 only after all manual channel QA checks pass.",
      manualQaApprovalSignalReady
        ? "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256 must match the current distribution manual QA checklist SHA-256."
        : "GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1 and a matching GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256 are required after manual channel QA."
    )
  ];
  const blockers = checklist.flatMap((item) => item.blockers);

  return {
    ...base,
    skipped: false,
    manualQaChecklistMarkdownPath: relative(checklistMarkdownPath),
    manualQaChecklistJsonPath: relative(checklistJsonPath),
    manualQaChecklistReady: true,
    manualQaChecklistSha256: checklistSha256,
    manualQaChecklistDigestKeyPresent,
    manualQaChecklistDigestWellFormed,
    manualQaChecklistDigestMatches,
    manualQaApprovalSignalReady,
    manualQaApprovalReady,
    checklist,
    selectedUpdateArtifactSource: updateArtifacts?.sourceDmg?.selectedSource ?? null,
    signedUpdateArtifactReady: updateArtifacts?.signedUpdateArtifact?.ready === true,
    localEnvInput: distributionLocalEnv,
    blockers
  };
}

const summary = await createManualQaSummary();
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(checklistJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(checklistMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "manual QA checklist should identify GrooveForge");
check(summary.bundleId === bundleId, `manual QA checklist should identify ${bundleId}`);
check(summary.localEnvInput?.valueRecorded === false, "manual QA checklist local env loader should not record values");
check(summary.localEnvValueRecorded === false, "manual QA checklist should not record local env values");
check(summary.releaseUrlValueRecorded === false, "manual QA checklist should not record release URL values");
check(summary.supportUrlValueRecorded === false, "manual QA checklist should not record support URL values");
check(summary.feedValueRecorded === false, "manual QA checklist should not record feed values");
check(summary.credentialValueRecorded === false, "manual QA checklist should not record credential values");
check(summary.tokenValueRecorded === false, "manual QA checklist should not record token values");
check(summary.channelValueRecorded === false, "manual QA checklist should not record channel values");
check(summary.privateValuesRecorded === false, "manual QA checklist should not record private values");
check(/^[a-f0-9]{64}$/.test(summary.manualQaChecklistSha256), "manual QA checklist should include a deterministic SHA-256 digest");
check(summary.networkProbeAttempted === false, "manual QA checklist should not probe remote channels");
check(summary.releaseUploadAttempted === false, "manual QA checklist should not upload release artifacts");
check(summary.notarySubmissionAttemptedByThisSmoke === false, "manual QA checklist should not submit to Apple");
check(summary.releaseGateClaimedManualQaApproval === false, "manual QA checklist should not claim manual approval");
check(summary.releaseGateClaimedExternalDistribution === false, "manual QA checklist should not claim external distribution");
check(Array.isArray(summary.checklist), "manual QA checklist should include checklist rows");
check(summary.skipped === true || summary.manualQaChecklistReady === true, "manual QA checklist should be ready when generated on macOS");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of privateInputValues()) {
  check(!combinedOutput.includes(privateValue), "manual QA checklist should not include private distribution values");
}

if (failures.length > 0) {
  fail("Distribution manual QA validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge distribution manual QA smoke passed.");
console.log(`- Markdown: ${relative(checklistMarkdownPath)}`);
console.log(`- JSON: ${relative(checklistJsonPath)}`);
console.log(`- Manual QA checklist ready: ${summary.manualQaChecklistReady ? "yes" : "no"}`);
console.log(`- Manual QA approval ready: ${summary.manualQaApprovalReady ? "yes" : "no"}`);
console.log(`- Manual QA checklist SHA-256: ${summary.manualQaChecklistSha256}`);
console.log(`- Manual QA checklist digest matched: ${summary.manualQaChecklistDigestMatches ? "yes" : "no"}`);
console.log(`- Selected update artifact source: ${summary.selectedUpdateArtifactSource ?? "none"}`);
console.log(`- Signed update artifact ready: ${summary.signedUpdateArtifactReady ? "yes" : "no"}`);
console.log(`- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}`);
if (summary.blockers.length > 0) {
  console.log(`- Manual QA blockers: ${summary.blockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe, release upload, or Apple notary submission attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, private beats, or real user audio");
console.log("- Not claimed: manual QA approval, Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution completion");
