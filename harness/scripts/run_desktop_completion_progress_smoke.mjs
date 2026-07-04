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
const externalReadinessLedgerPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-readiness-ledger.json`);
const completionProgressMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-progress.md`);
const completionProgressJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-progress.json`);
const prerequisiteNextCommand = "npm run release:check";
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
  console.error("GrooveForge completion progress smoke failed:");
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

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function stringArrayValue(values) {
  return Array.isArray(values) ? values.filter((value) => typeof value === "string" && value.trim().length > 0) : [];
}

function valueFreeObjectRows(values) {
  return Array.isArray(values) ? values.filter((value) => value && typeof value === "object" && value.valueRecorded === false) : [];
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function percent(ready, total) {
  if (total <= 0) {
    return 0;
  }
  return Number(((ready / total) * 100).toFixed(1));
}

function countReady(rows) {
  return rows.filter((row) => row.ready === true).length;
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

function blockerRows(blockers) {
  return unique(blockers)
    .slice(0, 12)
    .map((blocker, index) => ({
      order: index + 1,
      blocker,
      valueRecorded: false
    }));
}

function formatEvidenceRows(rows) {
  return rows.map((row) => `| ${row.label} | ${row.present ? "yes" : "no"} | ${row.path} |`).join("\n");
}

function formatMissingEvidence(rows) {
  if (rows.length === 0) {
    return "- none";
  }
  return rows.map((row) => `- ${row.label}: ${row.path}`).join("\n");
}

function formatBlockerRows(rows) {
  if (rows.length === 0) {
    return "| none | none |";
  }
  return rows.map((row) => `| ${row.order} | ${row.blocker} |`).join("\n");
}

function formatEditGuidanceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.location ?? row.editTarget)} | ${escapeCell(row.key)} | ${escapeCell(row.assignment)} | ${escapeCell(row.guidance)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatProofChecklistRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.criterion)} | ${escapeCell(row.evidenceSummary)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.hardGateCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCommandVerificationRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${escapeCell(row.expectation)} | ${escapeCell(row.proofTarget)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function buildCurrentActionSummary(externalReadinessLedger) {
  const currentRequiredKeys = stringArrayValue(externalReadinessLedger?.currentRequiredKeys);
  const currentPlaceholderKeys = stringArrayValue(externalReadinessLedger?.currentPlaceholderKeys);
  const currentPlaceholderEditLocations = valueFreeObjectRows(externalReadinessLedger?.currentPlaceholderEditLocations);
  const currentEnvEditRows = valueFreeObjectRows(externalReadinessLedger?.currentEnvEditRows);
  const currentPlaceholderRemediationRows = valueFreeObjectRows(externalReadinessLedger?.currentPlaceholderRemediationRows);
  const currentProofChecklistRows = valueFreeObjectRows(externalReadinessLedger?.currentProofChecklistRows);
  const currentCommandVerificationRows = valueFreeObjectRows(externalReadinessLedger?.currentCommandVerificationRows);
  return {
    currentActionSourceReady: externalReadinessLedger?.currentActionSourceReady === true,
    currentActionSourcePath: relative(externalReadinessLedgerPath),
    currentFocus: textValue(externalReadinessLedger?.currentFocus),
    currentActionLabel: textValue(externalReadinessLedger?.currentActionLabel, "No pending priority action"),
    currentNextCommand: textValue(externalReadinessLedger?.currentNextCommand),
    currentFirstBlocker: textValue(externalReadinessLedger?.currentFirstBlocker),
    currentOperatorAction: textValue(externalReadinessLedger?.currentOperatorAction),
    currentRequiredKeyCount: integerValue(externalReadinessLedger?.currentRequiredKeyCount),
    currentRequiredKeySummary: textValue(externalReadinessLedger?.currentRequiredKeySummary),
    currentRequiredKeys,
    currentPlaceholderKeyCount: integerValue(externalReadinessLedger?.currentPlaceholderKeyCount),
    currentPlaceholderKeySummary: textValue(externalReadinessLedger?.currentPlaceholderKeySummary),
    currentPlaceholderKeys,
    currentPlaceholderEditLocationCount: integerValue(externalReadinessLedger?.currentPlaceholderEditLocationCount),
    currentPlaceholderEditLocationSummary: textValue(externalReadinessLedger?.currentPlaceholderEditLocationSummary),
    currentPlaceholderEditLocations,
    currentEnvEditTarget: textValue(externalReadinessLedger?.currentEnvEditTarget, ".env.distribution.local"),
    currentEnvEditRowsCount: integerValue(externalReadinessLedger?.currentEnvEditRowsCount),
    currentEnvEditRowsSummary: textValue(externalReadinessLedger?.currentEnvEditRowsSummary),
    currentEnvEditRows,
    currentPlaceholderRemediationRowCount: integerValue(externalReadinessLedger?.currentPlaceholderRemediationRowCount),
    currentPlaceholderRemediationRowSummary: textValue(externalReadinessLedger?.currentPlaceholderRemediationRowSummary),
    currentPlaceholderRemediationRows,
    currentProofChecklistRowCount: integerValue(externalReadinessLedger?.currentProofChecklistRowCount),
    currentProofChecklistRowSummary: textValue(externalReadinessLedger?.currentProofChecklistRowSummary),
    currentProofChecklistRows,
    currentActionChecklistCount: integerValue(externalReadinessLedger?.currentActionChecklistCount),
    currentActionChecklistSummary: textValue(externalReadinessLedger?.currentActionChecklistSummary),
    currentRerunCommand: textValue(externalReadinessLedger?.currentRerunCommand),
    currentCommandSequenceCount: integerValue(externalReadinessLedger?.currentCommandSequenceCount),
    currentCommandSequenceSummary: textValue(externalReadinessLedger?.currentCommandSequenceSummary),
    currentCommandVerificationRowCount: integerValue(externalReadinessLedger?.currentCommandVerificationRowCount),
    currentCommandVerificationRowSummary: textValue(externalReadinessLedger?.currentCommandVerificationRowSummary),
    currentCommandVerificationRows,
    currentActionValueRecorded: false
  };
}

function sensitiveEnvironmentValues() {
  return sensitivePrivateKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} Completion Progress

## Status

- Completion progress ready: ${summary.completionProgressReady ? "yes" : "no"}
- Completion stage: ${summary.completionStage}
- Source evidence ready: ${summary.sourceEvidenceReady ? "yes" : "no"}
- Missing source evidence artifacts: ${summary.missingEvidenceArtifacts.length}
- Local release ready: ${summary.localReleaseReady ? "yes" : "no"}
- Local release readiness: ${summary.localReleaseReadinessPercent.toFixed(1)}%
- Desktop project IO evidence ready: ${summary.desktopProjectIoEvidenceReady ? "yes" : "no"}
- PKG payload project IO evidence ready: ${summary.pkgPayloadProjectIoEvidenceReady ? "yes" : "no"}
- External distribution hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}
- External gate requirements ready: ${summary.gateRequirementReadyCount}/${summary.gateRequirementTotal} (${summary.gateRequirementReadinessPercent.toFixed(1)}%)
- Remediation groups ready: ${summary.remediationReadyCount}/${summary.remediationTotal} (${summary.remediationReadinessPercent.toFixed(1)}%)
- Operator runbook ready: ${summary.operatorRunbookReady ? "yes" : "no"}
- External readiness ledger ready: ${summary.externalReadinessLedgerReady ? "yes" : "no"}
- Current action source ready: ${summary.currentActionSourceReady ? "yes" : "no"}
- Current next command: \`${summary.currentNextCommand}\`
- Current first blocker: ${summary.currentFirstBlocker}
- Current env edit rows: ${summary.currentEnvEditRowsCount} (${summary.currentEnvEditRowsSummary})
- Current proof checklist rows: ${summary.currentProofChecklistRowCount} (${summary.currentProofChecklistRowSummary})
- Current command verification rows: ${summary.currentCommandVerificationRowCount} (${summary.currentCommandVerificationRowSummary})
- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted by this progress report: no
- Signing attempted by this progress report: no

## Prerequisites

- Required source evidence ready: ${summary.sourceEvidenceReady ? "yes" : "no"}
- Next local command when missing: \`${summary.prerequisiteNextCommand}\`

Missing source evidence:

${formatMissingEvidence(summary.missingEvidenceArtifacts)}

## Evidence Artifacts

| artifact | present | path |
|---|---:|---|
${formatEvidenceRows(summary.evidenceArtifacts)}

## Current Action

- Source artifact: ${summary.currentActionSourcePath}
- Current focus: ${summary.currentFocus}
- Current action: ${summary.currentActionLabel}
- Current operator action: ${summary.currentOperatorAction}
- Current required keys: ${summary.currentRequiredKeyCount} (${summary.currentRequiredKeySummary})
- Current placeholder keys: ${summary.currentPlaceholderKeyCount} (${summary.currentPlaceholderKeySummary})
- Current placeholder edit locations: ${summary.currentPlaceholderEditLocationCount} (${summary.currentPlaceholderEditLocationSummary})
- Current env edit target: ${summary.currentEnvEditTarget}
- Current env edit rows: ${summary.currentEnvEditRowsCount} (${summary.currentEnvEditRowsSummary})
- Current placeholder remediation rows: ${summary.currentPlaceholderRemediationRowCount} (${summary.currentPlaceholderRemediationRowSummary})
- Current proof checklist rows: ${summary.currentProofChecklistRowCount} (${summary.currentProofChecklistRowSummary})
- Current action checklist: ${summary.currentActionChecklistCount} (${summary.currentActionChecklistSummary})
- Current rerun command: \`${summary.currentRerunCommand}\`
- Current command sequence: ${summary.currentCommandSequenceCount} (${summary.currentCommandSequenceSummary})
- Current command verification rows: ${summary.currentCommandVerificationRowCount} (${summary.currentCommandVerificationRowSummary})

### Current Edit Guidance

| location | key | assignment shape | guidance | value recorded |
|---|---|---|---|---:|
${formatEditGuidanceRows(summary.currentEnvEditRows)}

### Current Proof Checklist Rows

| order | criterion | evidence | proof command | hard gate | value recorded |
|---:|---|---|---|---|---:|
${formatProofChecklistRows(summary.currentProofChecklistRows)}

### Current Command Verification Rows

| order | command | role | expectation | proof target | value recorded |
|---:|---|---|---|---|---:|
${formatCommandVerificationRows(summary.currentCommandVerificationRows)}

## Current First Blockers

| order | blocker |
|---:|---|
${formatBlockerRows(summary.firstBlockers)}

## Progress Interpretation

Local beat-workstation readiness and local desktop release evidence can be ready while external distribution remains pending. The hard external distribution gate remains \`npm run release:external-check\`.

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, local env values, private beats, and real user audio are not recorded.

## Not Claimed

This progress report does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function createCompletionProgressSummary() {
  const completionStatus = await readJsonIfExists(completionStatusPath);
  const externalGate = await readJsonIfExists(externalGatePath);
  const externalRemediation = await readJsonIfExists(externalRemediationPath);
  const externalOperatorRunbook = await readJsonIfExists(externalOperatorRunbookPath);
  const externalReadinessLedger = await readJsonIfExists(externalReadinessLedgerPath);
  const completionDimensions = completionStatus?.completionDimensions ?? [];
  const localDimensions = completionDimensions.filter((dimension) => dimension.label !== "External distribution hard gate");
  const localReadyCount = countReady(localDimensions);
  const localTotal = localDimensions.length;
  const gateRequirements = externalGate?.requirements ?? [];
  const remediationGroups = externalRemediation?.remediationGroups ?? [];
  const gateRequirementReadyCount = countReady(gateRequirements);
  const remediationReadyCount = countReady(remediationGroups);
  const pkgPayloadProjectIoEvidenceReady =
    completionStatus?.pkgPayloadProjectIoReady === true &&
    externalOperatorRunbook?.desktopProjectIoEvidence?.pkgPayloadProjectIoStatusReady === true &&
    externalOperatorRunbook?.desktopProjectIoEvidence?.pkgPayloadProjectIoGateRequirementReady === true &&
    externalReadinessLedger?.desktopProjectIoEvidence?.pkgPayloadProjectIoStatusReady === true &&
    externalReadinessLedger?.desktopProjectIoEvidence?.pkgPayloadProjectIoGateRequirementReady === true &&
    gateRequirements.some((requirement) => requirement.label === "PKG payload project IO evidence ready" && requirement.ready === true);
  const desktopProjectIoEvidenceReady =
    completionStatus?.desktopProjectIoEvidenceReady === true &&
    pkgPayloadProjectIoEvidenceReady &&
    externalOperatorRunbook?.desktopProjectIoEvidenceReady === true &&
    externalReadinessLedger?.desktopProjectIoEvidenceReady === true &&
    gateRequirements.some((requirement) => requirement.label === "Desktop project IO evidence ready" && requirement.ready === true);
  const localReleaseReady =
    completionStatus?.completionStatusReady === true &&
    completionStatus?.localMvpEvidenceReady === true &&
    completionStatus?.localDesktopPackageReady === true &&
    completionStatus?.redactedDistributionEvidenceReady === true &&
    completionStatus?.desktopProjectIoEvidenceReady === true;
  const firstBlockers = blockerRows([
    ...(externalReadinessLedger?.firstBlockers ?? []),
    firstBlocker(externalGate?.externalDistributionGateBlockers ?? []),
    firstBlocker(externalRemediation?.remediationBlockers ?? [])
  ]);
  const evidenceArtifacts = [
    evidence(completionStatusPath, "Completion status"),
    evidence(externalGatePath, "External distribution gate"),
    evidence(externalRemediationPath, "External remediation"),
    evidence(externalOperatorRunbookPath, "External operator runbook"),
    evidence(externalReadinessLedgerPath, "External readiness ledger")
  ];
  const sourceEvidenceReady = evidenceArtifacts.every((item) => item.present);
  const missingEvidenceArtifacts = evidenceArtifacts.filter((item) => !item.present);

  return {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    completionProgressMarkdownPath: relative(completionProgressMarkdownPath),
    completionProgressJsonPath: relative(completionProgressJsonPath),
    productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
    progressScope: "value-free completion progress report for local release readiness and external distribution blockers",
    prerequisiteNextCommand,
    prerequisiteCommandReason: "Regenerates completion status, external gate, remediation, operator runbook, and readiness ledger source evidence before this progress report runs.",
    missingEvidenceArtifacts,
    completionStage: completionStatus?.completionStage ?? "source evidence incomplete",
    completionProgressReady: sourceEvidenceReady && localReleaseReady && desktopProjectIoEvidenceReady && externalOperatorRunbook?.operatorRunbookReady === true && externalReadinessLedger?.ledgerReady === true,
    sourceEvidenceReady,
    localReleaseReady,
    localReleaseReadinessPercent: percent(localReadyCount, localTotal),
    localReleaseReadyCount: localReadyCount,
    localReleaseTotal: localTotal,
    desktopProjectIoEvidenceReady,
    pkgPayloadProjectIoEvidenceReady,
    externalDistributionGateReady: externalGate?.externalDistributionGateReady === true,
    gateRequirementTotal: gateRequirements.length,
    gateRequirementReadyCount,
    gateRequirementBlockedCount: gateRequirements.filter((requirement) => requirement.ready !== true).length,
    gateRequirementReadinessPercent: percent(gateRequirementReadyCount, gateRequirements.length),
    remediationTotal: remediationGroups.length,
    remediationReadyCount,
    remediationBlockedCount: remediationGroups.filter((group) => group.ready !== true).length,
    remediationReadinessPercent: percent(remediationReadyCount, remediationGroups.length),
    operatorRunbookReady: externalOperatorRunbook?.operatorRunbookReady === true,
    externalReadinessLedgerReady: externalReadinessLedger?.ledgerReady === true,
    evidenceArtifacts,
    firstBlockers,
    ...buildCurrentActionSummary(externalReadinessLedger),
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
    notarySubmissionAttemptedByThisProgressReport: false,
    signingAttemptedByThisProgressReport: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedManualQaApproval: false,
    releaseGateClaimedExternalDistribution: false
  };
}

const summary = await createCompletionProgressSummary();
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(completionProgressJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(completionProgressMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "completion progress should identify GrooveForge");
check(summary.bundleId === bundleId, `completion progress should identify ${bundleId}`);
check(summary.version === packageJson.version, "completion progress should match package version");
check(summary.productScope.includes("all-genre direct beat workstation"), "completion progress should describe direct beat workstation scope");
check(summary.productScope.includes("sampling optional"), "completion progress should keep sampling optional");
check(summary.prerequisiteNextCommand === prerequisiteNextCommand, "completion progress should identify the prerequisite release check command");
check(summary.prerequisiteCommandReason.includes("external gate"), "completion progress should explain prerequisite source evidence");
check(Array.isArray(summary.missingEvidenceArtifacts), "completion progress should list missing source evidence artifacts");
check(summary.missingEvidenceArtifacts.every((item) => item.valueRecorded === false), "completion progress missing source evidence should not record values");
const sourceMissingCompletionProgressContext =
  summary.sourceEvidenceReady === false && summary.missingEvidenceArtifacts.length > 0;
check(
  summary.completionProgressReady === true || sourceMissingCompletionProgressContext,
  "completion progress should be ready when source evidence is ready or report source-missing prerequisites"
);
check(
  summary.sourceEvidenceReady === true || sourceMissingCompletionProgressContext,
  "completion progress should include source evidence or source-missing evidence rows"
);
check(
  summary.localReleaseReady === true || sourceMissingCompletionProgressContext,
  "completion progress should include ready local release evidence or keep it blocked by missing source evidence"
);
check(
  summary.localReleaseReadinessPercent === 100 || sourceMissingCompletionProgressContext,
  "completion progress should report 100 percent local release readiness or a source-missing fallback percentage"
);
check(
  summary.desktopProjectIoEvidenceReady === true || sourceMissingCompletionProgressContext,
  "completion progress should include ready desktop project IO evidence or keep it blocked by missing source evidence"
);
check(
  summary.pkgPayloadProjectIoEvidenceReady === true || sourceMissingCompletionProgressContext,
  "completion progress should include ready PKG payload project IO evidence or keep it blocked by missing source evidence"
);
check(
  summary.operatorRunbookReady === true || sourceMissingCompletionProgressContext,
  "completion progress should include ready operator runbook evidence or keep it blocked by missing source evidence"
);
check(
  summary.externalReadinessLedgerReady === true || sourceMissingCompletionProgressContext,
  "completion progress should include ready external readiness ledger evidence or keep it blocked by missing source evidence"
);
check(Array.isArray(summary.evidenceArtifacts) && summary.evidenceArtifacts.length >= 5, "completion progress should include evidence artifacts");
check(summary.evidenceArtifacts.every((item) => item.valueRecorded === false), "completion progress evidence artifacts should not record values");
check(summary.firstBlockers.every((item) => item.valueRecorded === false), "completion progress blockers should not record values");
check(summary.currentActionValueRecorded === false, "completion progress current action summary should not record values");
check(Array.isArray(summary.currentEnvEditRows), "completion progress should expose current env edit rows");
check(summary.currentEnvEditRows.every((row) => row.valueRecorded === false), "completion progress current env edit rows should not record values");
check(Array.isArray(summary.currentProofChecklistRows), "completion progress should expose current proof checklist rows");
check(summary.currentProofChecklistRows.every((row) => row.valueRecorded === false), "completion progress current proof checklist rows should not record values");
check(Array.isArray(summary.currentCommandVerificationRows), "completion progress should expose current command verification rows");
check(summary.currentCommandVerificationRows.every((row) => row.valueRecorded === false), "completion progress current command verification rows should not record values");
if (summary.currentActionSourceReady) {
  check(summary.currentNextCommand !== "none", "completion progress should mirror the current next command when ledger current action evidence exists");
  check(summary.currentProofChecklistRowCount === summary.currentProofChecklistRows.length, "completion progress should mirror current proof checklist row count");
  check(summary.currentCommandVerificationRowCount === summary.currentCommandVerificationRows.length, "completion progress should mirror current command verification row count");
}
check(summary.localEnvInput?.valueRecorded === false, "completion progress local env loader should not record values");
check(summary.localEnvValueRecorded === false, "completion progress should not record local env values");
check(summary.privateValuesRecorded === false, "completion progress should not record private values");
check(summary.releaseUrlValueRecorded === false, "completion progress should not record release URL values");
check(summary.supportUrlValueRecorded === false, "completion progress should not record support URL values");
check(summary.feedValueRecorded === false, "completion progress should not record feed values");
check(summary.credentialValueRecorded === false, "completion progress should not record credential values");
check(summary.tokenValueRecorded === false, "completion progress should not record token values");
check(summary.channelValueRecorded === false, "completion progress should not record channel values");
check(summary.developerIdIdentityValueRecorded === false, "completion progress should not record Developer ID identity values");
check(summary.networkProbeAttempted === false, "completion progress should not probe remote channels");
check(summary.releaseUploadAttempted === false, "completion progress should not upload release artifacts");
check(summary.notarySubmissionAttemptedByThisProgressReport === false, "completion progress should not submit to Apple notary services");
check(summary.signingAttemptedByThisProgressReport === false, "completion progress should not sign artifacts");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "completion progress should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "completion progress should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "completion progress should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "completion progress should not claim auto-update");
check(summary.releaseGateClaimedManualQaApproval === false, "completion progress should not claim manual QA approval");
check(summary.releaseGateClaimedExternalDistribution === false, "completion progress should not claim external distribution completion");
check(markdown.includes("Completion Progress"), "completion progress Markdown should include title");
check(markdown.includes("Source evidence ready:"), "completion progress Markdown should include source evidence readiness");
check(markdown.includes("Next local command when missing: `npm run release:check`"), "completion progress Markdown should include the prerequisite command");
check(markdown.includes("Local release readiness:"), "completion progress Markdown should include local release readiness");
check(markdown.includes("PKG payload project IO evidence ready:"), "completion progress Markdown should include PKG payload project IO readiness");
check(markdown.includes("Current Action"), "completion progress Markdown should include current action");
check(markdown.includes("Current Edit Guidance"), "completion progress Markdown should include current edit guidance");
check(markdown.includes("Current Proof Checklist Rows"), "completion progress Markdown should include current proof checklist rows");
check(markdown.includes("Current Command Verification Rows"), "completion progress Markdown should include current command verification rows");
check(markdown.includes("External gate requirements ready:"), "completion progress Markdown should include external gate requirement progress");
check(markdown.includes("Remediation groups ready:"), "completion progress Markdown should include remediation progress");
check(markdown.includes("Private values recorded: no"), "completion progress Markdown should state value redaction");
check(markdown.includes("The hard external distribution gate remains `npm run release:external-check`"), "completion progress Markdown should keep the hard gate authoritative");
check(!/https?:\/\//i.test(markdown), "completion progress should not include public or private URL values");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of sensitiveEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "completion progress should not include sensitive private environment values");
}

if (failures.length > 0) {
  const prerequisiteDetails = summary.sourceEvidenceReady
    ? []
    : [
        `- Missing source evidence artifacts: ${summary.missingEvidenceArtifacts.length}`,
        formatMissingEvidence(summary.missingEvidenceArtifacts),
        `- Next local command: ${summary.prerequisiteNextCommand}`
      ];
  fail("Completion progress validation failed.", [...failures.map((failure) => `- ${failure}`), ...prerequisiteDetails].join("\n"));
}

console.log("GrooveForge completion progress smoke passed.");
console.log(`- Markdown: ${relative(completionProgressMarkdownPath)}`);
console.log(`- JSON: ${relative(completionProgressJsonPath)}`);
console.log(`- Completion progress ready: ${summary.completionProgressReady ? "yes" : "no"}`);
console.log(`- Completion stage: ${summary.completionStage}`);
console.log(`- Source evidence ready: ${summary.sourceEvidenceReady ? "yes" : "no"}`);
console.log(`- Missing source evidence artifacts: ${summary.missingEvidenceArtifacts.length}`);
console.log(`- Local release ready: ${summary.localReleaseReady ? "yes" : "no"}`);
console.log(`- Local release readiness: ${summary.localReleaseReadinessPercent.toFixed(1)}%`);
console.log(`- Desktop project IO evidence ready: ${summary.desktopProjectIoEvidenceReady ? "yes" : "no"}`);
console.log(`- PKG payload project IO evidence ready: ${summary.pkgPayloadProjectIoEvidenceReady ? "yes" : "no"}`);
console.log(`- External distribution hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- External gate requirements ready: ${summary.gateRequirementReadyCount}/${summary.gateRequirementTotal} (${summary.gateRequirementReadinessPercent.toFixed(1)}%)`);
console.log(`- Remediation groups ready: ${summary.remediationReadyCount}/${summary.remediationTotal} (${summary.remediationReadinessPercent.toFixed(1)}%)`);
console.log(`- Current action source ready: ${summary.currentActionSourceReady ? "yes" : "no"}`);
console.log(`- Current next command: ${summary.currentNextCommand}`);
console.log(`- Current first blocker: ${summary.currentFirstBlocker}`);
console.log(`- Current env edit rows: ${summary.currentEnvEditRowsCount} (${summary.currentEnvEditRowsSummary})`);
console.log(`- Current proof checklist rows: ${summary.currentProofChecklistRowCount} (${summary.currentProofChecklistRowSummary})`);
console.log(`- Current command verification rows: ${summary.currentCommandVerificationRowCount} (${summary.currentCommandVerificationRowSummary})`);
console.log(`- First blockers tracked: ${summary.firstBlockers.length}`);
console.log(`- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}`);
console.log(`- Prerequisite command when source evidence is missing: ${summary.prerequisiteNextCommand}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, local env values, private beats, or real user audio");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
