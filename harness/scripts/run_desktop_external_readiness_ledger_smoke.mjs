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
const completionStatusPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-status.json`);
const externalGatePath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-distribution-gate.json`);
const externalRemediationPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-remediation.json`);
const externalOperatorRunbookPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-operator-runbook.json`);
const manualQaPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-manual-qa.json`);
const privateInputsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-private-inputs.json`);
const ledgerMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-readiness-ledger.md`);
const ledgerJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-readiness-ledger.json`);
const sensitivePrivateKeys = [
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_UPDATE_FEED_URL",
  "ELECTRON_UPDATE_FEED_URL",
  "UPDATE_FEED_URL",
  "GROOVEFORGE_DEVELOPER_ID_IDENTITY",
  "APPLE_ID",
  "APPLE_TEAM_ID",
  "APPLE_APP_SPECIFIC_PASSWORD",
  "ASC_KEY_ID",
  "ASC_ISSUER_ID",
  "ASC_KEY_PATH",
  "APPLE_NOTARY_PROFILE",
  "NOTARYTOOL_KEYCHAIN_PROFILE"
];
const distributionLocalEnv = await loadDistributionLocalEnv({ root, allowedKeys: distributionPrivateInputKeys });
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge external readiness ledger smoke failed:");
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

function evidence(filePath, label) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    valueRecorded: false
  };
}

function firstBlocker(blockers) {
  return blockers.find((blocker) => typeof blocker === "string" && blocker.trim().length > 0) ?? "";
}

function sensitiveEnvironmentValues() {
  return sensitivePrivateKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function toRequirementRow(requirement, index) {
  const blockers = unique(requirement.blockers ?? []);
  return {
    order: index + 1,
    id: `requirement-${index + 1}`,
    label: requirement.label ?? `Requirement ${index + 1}`,
    source: "external-distribution-gate",
    ready: requirement.ready === true,
    evidence: requirement.evidence ? [requirement.evidence] : [],
    blockerCount: blockers.length,
    firstBlocker: firstBlocker(blockers),
    valueRecorded: false
  };
}

function toRemediationRow(group, index) {
  const blockers = unique(group.blockers ?? []);
  return {
    order: index + 1,
    id: group.id ?? `remediation-${index + 1}`,
    label: group.label ?? `Remediation ${index + 1}`,
    source: "external-remediation",
    ready: group.ready === true,
    requiredKeys: group.requiredKeys ?? [],
    rerunCommands: group.rerunCommands ?? [],
    blockerCount: blockers.length,
    firstBlocker: firstBlocker(blockers),
    valueRecorded: false
  };
}

function countReady(rows) {
  return rows.filter((row) => row.ready).length;
}

function formatRequirementRows(rows) {
  if (rows.length === 0) {
    return "| none | no | no gate requirement rows | 0 |  |";
  }
  return rows
    .map((row) => `| ${row.label} | ${row.ready ? "yes" : "no"} | ${row.source} | ${row.blockerCount} | ${row.firstBlocker || "none"} |`)
    .join("\n");
}

function formatRemediationRows(rows) {
  if (rows.length === 0) {
    return "| none | no | no remediation rows | 0 | none |";
  }
  return rows
    .map((row) => `| ${row.label} | ${row.ready ? "yes" : "no"} | ${row.requiredKeys.length > 0 ? row.requiredKeys.join(", ") : "none"} | ${row.blockerCount} | ${row.firstBlocker || "none"} |`)
    .join("\n");
}

function formatEvidenceRows(rows) {
  return rows.map((row) => `| ${row.label} | ${row.present ? "yes" : "no"} | ${row.path} |`).join("\n");
}

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} External Readiness Ledger

## Status

- Ledger ready: ${summary.ledgerReady ? "yes" : "no"}
- Completion stage: ${summary.completionStage}
- Local release ready: ${summary.localReleaseReady ? "yes" : "no"}
- External distribution hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}
- Gate requirements ready: ${summary.gateRequirementReadyCount}/${summary.gateRequirementTotal}
- Remediation groups ready: ${summary.remediationReadyCount}/${summary.remediationTotal}
- Operator runbook ready: ${summary.operatorRunbookReady ? "yes" : "no"}
- Manual QA checklist digest available: ${summary.manualQaChecklistDigestAvailable ? "yes" : "no"}
- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted by this ledger: no
- Signing attempted by this ledger: no

## Gate Requirement Ledger

| requirement | ready | source | blockers | first blocker |
|---|---:|---|---:|---|
${formatRequirementRows(summary.gateRequirementRows)}

## Remediation Ledger

| remediation group | ready | required keys | blockers | first blocker |
|---|---:|---|---:|---|
${formatRemediationRows(summary.remediationRows)}

## Evidence Artifacts

| artifact | present | path |
|---|---:|---|
${formatEvidenceRows(summary.evidenceArtifacts)}

## Current First Blockers

${formatBlockers(summary.firstBlockers)}

## Hard Gate

Hard gate remains \`npm run release:external-check\`. This ledger does not replace or weaken that command.

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, local env values, private beats, and real user audio are not recorded.

## Not Claimed

This ledger does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function createLedgerSummary() {
  const completionStatus = await readJsonIfExists(completionStatusPath);
  const externalGate = await readJsonIfExists(externalGatePath);
  const externalRemediation = await readJsonIfExists(externalRemediationPath);
  const externalOperatorRunbook = await readJsonIfExists(externalOperatorRunbookPath);
  const manualQa = await readJsonIfExists(manualQaPath);
  const privateInputs = await readJsonIfExists(privateInputsPath);
  const gateRequirementRows = (externalGate?.requirements ?? []).map(toRequirementRow);
  const remediationRows = (externalRemediation?.remediationGroups ?? []).map(toRemediationRow);
  const sourceEvidenceReady = Boolean(completionStatus) && Boolean(externalGate) && Boolean(externalRemediation) && Boolean(externalOperatorRunbook);
  const firstBlockers = unique([
    ...gateRequirementRows.map((row) => row.firstBlocker),
    ...remediationRows.map((row) => row.firstBlocker),
    ...(sourceEvidenceReady ? [] : ["External readiness source evidence is incomplete; run npm run release:check first."])
  ]).slice(0, 12);
  const evidenceArtifacts = [
    evidence(completionStatusPath, "Completion status"),
    evidence(externalGatePath, "External distribution gate"),
    evidence(externalRemediationPath, "External remediation"),
    evidence(externalOperatorRunbookPath, "External operator runbook"),
    evidence(manualQaPath, "Manual QA checklist"),
    evidence(privateInputsPath, "Private inputs")
  ];

  return {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    ledgerMarkdownPath: relative(ledgerMarkdownPath),
    ledgerJsonPath: relative(ledgerJsonPath),
    productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
    ledgerScope: "value-free external readiness evidence ledger for completion reporting",
    completionStage: completionStatus?.completionStage ?? "source evidence incomplete",
    localReleaseReady: completionStatus?.completionStatusReady === true && completionStatus?.localMvpEvidenceReady === true && completionStatus?.localDesktopPackageReady === true,
    ledgerReady: sourceEvidenceReady,
    sourceEvidenceReady,
    externalDistributionGateReady: externalGate?.externalDistributionGateReady === true,
    gateRequirementTotal: gateRequirementRows.length,
    gateRequirementReadyCount: countReady(gateRequirementRows),
    gateRequirementBlockedCount: gateRequirementRows.filter((row) => !row.ready).length,
    remediationTotal: remediationRows.length,
    remediationReadyCount: countReady(remediationRows),
    remediationBlockedCount: remediationRows.filter((row) => !row.ready).length,
    operatorRunbookReady: externalOperatorRunbook?.operatorRunbookReady === true,
    manualQaChecklistSha256: manualQa?.manualQaChecklistSha256 ?? null,
    manualQaChecklistDigestAvailable: Boolean(manualQa?.manualQaChecklistSha256),
    manualQaApprovalReady: manualQa?.manualQaApprovalReady === true,
    privateInputsReady: privateInputs?.privateInputsReady === true,
    localEnvInput: distributionLocalEnv,
    localEnvValueRecorded: false,
    privateValuesRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttemptedByThisLedger: false,
    signingAttemptedByThisLedger: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedManualQaApproval: false,
    releaseGateClaimedExternalDistribution: false,
    evidenceArtifacts,
    gateRequirementRows,
    remediationRows,
    firstBlockers
  };
}

const summary = await createLedgerSummary();
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(ledgerJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(ledgerMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "external readiness ledger should identify GrooveForge");
check(summary.bundleId === bundleId, `external readiness ledger should identify ${bundleId}`);
check(summary.version === packageJson.version, "external readiness ledger should match package version");
check(summary.productScope.includes("all-genre direct beat workstation"), "external readiness ledger should describe direct beat workstation scope");
check(summary.productScope.includes("sampling optional"), "external readiness ledger should keep sampling optional");
check(Array.isArray(summary.evidenceArtifacts) && summary.evidenceArtifacts.length >= 6, "external readiness ledger should include evidence artifacts");
check(Array.isArray(summary.gateRequirementRows), "external readiness ledger should include gate requirement rows");
check(Array.isArray(summary.remediationRows), "external readiness ledger should include remediation rows");
check(Array.isArray(summary.firstBlockers), "external readiness ledger should include first blockers");
check(summary.evidenceArtifacts.every((item) => item.valueRecorded === false), "external readiness evidence artifacts should not record values");
check(summary.gateRequirementRows.every((item) => item.valueRecorded === false), "external readiness gate rows should not record values");
check(summary.remediationRows.every((item) => item.valueRecorded === false), "external readiness remediation rows should not record values");
check(summary.localEnvInput?.valueRecorded === false, "external readiness ledger local env loader should not record values");
check(summary.localEnvValueRecorded === false, "external readiness ledger should not record local env values");
check(summary.privateValuesRecorded === false, "external readiness ledger should not record private values");
check(summary.releaseUrlValueRecorded === false, "external readiness ledger should not record release URL values");
check(summary.supportUrlValueRecorded === false, "external readiness ledger should not record support URL values");
check(summary.feedValueRecorded === false, "external readiness ledger should not record feed values");
check(summary.credentialValueRecorded === false, "external readiness ledger should not record credential values");
check(summary.tokenValueRecorded === false, "external readiness ledger should not record token values");
check(summary.channelValueRecorded === false, "external readiness ledger should not record channel values");
check(summary.developerIdIdentityValueRecorded === false, "external readiness ledger should not record Developer ID identity values");
check(summary.networkProbeAttempted === false, "external readiness ledger should not probe remote channels");
check(summary.releaseUploadAttempted === false, "external readiness ledger should not upload release artifacts");
check(summary.notarySubmissionAttemptedByThisLedger === false, "external readiness ledger should not submit to Apple notary services");
check(summary.signingAttemptedByThisLedger === false, "external readiness ledger should not sign artifacts");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "external readiness ledger should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "external readiness ledger should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "external readiness ledger should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "external readiness ledger should not claim auto-update");
check(summary.releaseGateClaimedManualQaApproval === false, "external readiness ledger should not claim manual QA approval");
check(summary.releaseGateClaimedExternalDistribution === false, "external readiness ledger should not claim external distribution completion");
check(markdown.includes("External Readiness Ledger"), "external readiness ledger Markdown should include title");
check(markdown.includes("Gate Requirement Ledger"), "external readiness ledger Markdown should include gate requirement rows");
check(markdown.includes("Remediation Ledger"), "external readiness ledger Markdown should include remediation rows");
check(markdown.includes("Hard gate remains `npm run release:external-check`"), "external readiness ledger Markdown should keep hard gate authoritative");
check(markdown.includes("Private values recorded: no"), "external readiness ledger Markdown should state value redaction");
check(!/https?:\/\//i.test(markdown), "external readiness ledger should not include public or private URL values");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of sensitiveEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "external readiness ledger should not include sensitive private environment values");
}

if (failures.length > 0) {
  fail("External readiness ledger validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge external readiness ledger smoke passed.");
console.log(`- Markdown: ${relative(ledgerMarkdownPath)}`);
console.log(`- JSON: ${relative(ledgerJsonPath)}`);
console.log(`- Ledger ready: ${summary.ledgerReady ? "yes" : "no"}`);
console.log(`- Completion stage: ${summary.completionStage}`);
console.log(`- Local release ready: ${summary.localReleaseReady ? "yes" : "no"}`);
console.log(`- External distribution hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- Gate requirements ready: ${summary.gateRequirementReadyCount}/${summary.gateRequirementTotal}`);
console.log(`- Remediation groups ready: ${summary.remediationReadyCount}/${summary.remediationTotal}`);
console.log(`- Manual QA checklist digest available: ${summary.manualQaChecklistDigestAvailable ? "yes" : "no"}`);
console.log(`- First blockers tracked: ${summary.firstBlockers.length}`);
console.log(`- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, local env values, private beats, or real user audio");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
