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

function gateRequirementReady(externalGate, label) {
  return (externalGate?.requirements ?? []).some((requirement) => requirement.label === label && requirement.ready === true);
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

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
}

function buildCurrentActionSummary(externalOperatorRunbook) {
  const currentRequiredKeys = stringArrayValue(externalOperatorRunbook?.currentRequiredKeys);
  const currentPlaceholderKeys = stringArrayValue(externalOperatorRunbook?.currentPlaceholderKeys);
  const currentPlaceholderEditLocations = valueFreeObjectRows(externalOperatorRunbook?.currentPlaceholderEditLocations);
  const currentEnvEditRows = valueFreeObjectRows(externalOperatorRunbook?.currentEnvEditRows);
  const currentPlaceholderRemediationRows = valueFreeObjectRows(externalOperatorRunbook?.currentPlaceholderRemediationRows);
  const currentProofChecklistRows = valueFreeObjectRows(externalOperatorRunbook?.currentProofChecklistRows);
  const currentCommandVerificationRows = valueFreeObjectRows(externalOperatorRunbook?.currentCommandVerificationRows);
  return {
    currentActionSourceReady: externalOperatorRunbook?.currentActionSourceReady === true,
    currentActionSourcePath: relative(externalOperatorRunbookPath),
    currentFocus: textValue(externalOperatorRunbook?.currentFocus),
    currentActionLabel: textValue(externalOperatorRunbook?.currentActionLabel, "No pending priority action"),
    currentNextCommand: textValue(externalOperatorRunbook?.currentNextCommand),
    currentFirstBlocker: textValue(externalOperatorRunbook?.currentFirstBlocker),
    currentOperatorAction: textValue(externalOperatorRunbook?.currentOperatorAction),
    currentRequiredKeyCount: integerValue(externalOperatorRunbook?.currentRequiredKeyCount),
    currentRequiredKeySummary: textValue(externalOperatorRunbook?.currentRequiredKeySummary),
    currentRequiredKeys,
    currentPlaceholderKeyCount: integerValue(externalOperatorRunbook?.currentPlaceholderKeyCount),
    currentPlaceholderKeySummary: textValue(externalOperatorRunbook?.currentPlaceholderKeySummary),
    currentPlaceholderKeys,
    currentPlaceholderEditLocationCount: integerValue(externalOperatorRunbook?.currentPlaceholderEditLocationCount),
    currentPlaceholderEditLocationSummary: textValue(externalOperatorRunbook?.currentPlaceholderEditLocationSummary),
    currentPlaceholderEditLocations,
    currentEnvEditTarget: textValue(externalOperatorRunbook?.currentEnvEditTarget, ".env.distribution.local"),
    currentEnvEditRowsCount: integerValue(externalOperatorRunbook?.currentEnvEditRowsCount),
    currentEnvEditRowsSummary: textValue(externalOperatorRunbook?.currentEnvEditRowsSummary),
    currentEnvEditRows,
    currentPlaceholderRemediationRowCount: integerValue(externalOperatorRunbook?.currentPlaceholderRemediationRowCount),
    currentPlaceholderRemediationRowSummary: textValue(externalOperatorRunbook?.currentPlaceholderRemediationRowSummary),
    currentPlaceholderRemediationRows,
    currentProofChecklistRowCount: integerValue(externalOperatorRunbook?.currentProofChecklistRowCount),
    currentProofChecklistRowSummary: textValue(externalOperatorRunbook?.currentProofChecklistRowSummary),
    currentProofChecklistRows,
    currentActionChecklistCount: integerValue(externalOperatorRunbook?.currentActionChecklistCount),
    currentActionChecklistSummary: textValue(externalOperatorRunbook?.currentActionChecklistSummary),
    currentRerunCommand: textValue(externalOperatorRunbook?.currentRerunCommand),
    currentCommandSequenceCount: integerValue(externalOperatorRunbook?.currentCommandSequenceCount),
    currentCommandSequenceSummary: textValue(externalOperatorRunbook?.currentCommandSequenceSummary),
    currentCommandVerificationRowCount: integerValue(externalOperatorRunbook?.currentCommandVerificationRowCount),
    currentCommandVerificationRowSummary: textValue(externalOperatorRunbook?.currentCommandVerificationRowSummary),
    currentCommandVerificationRows,
    currentActionValueRecorded: false
  };
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} External Readiness Ledger

## Status

- Ledger ready: ${summary.ledgerReady ? "yes" : "no"}
- Completion stage: ${summary.completionStage}
- Local release ready: ${summary.localReleaseReady ? "yes" : "no"}
- Desktop project IO evidence ready: ${summary.desktopProjectIoEvidenceReady ? "yes" : "no"}
- External distribution hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}
- Gate requirements ready: ${summary.gateRequirementReadyCount}/${summary.gateRequirementTotal}
- Remediation groups ready: ${summary.remediationReadyCount}/${summary.remediationTotal}
- Operator runbook ready: ${summary.operatorRunbookReady ? "yes" : "no"}
- Manual QA checklist digest available: ${summary.manualQaChecklistDigestAvailable ? "yes" : "no"}
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
  const completionStatusDesktopProjectIoReady = completionStatus?.desktopProjectIoEvidenceReady === true;
  const completionStatusPkgPayloadProjectIoReady = completionStatus?.pkgPayloadProjectIoReady === true;
  const externalGateDesktopProjectIoReady = gateRequirementReady(externalGate, "Desktop project IO evidence ready");
  const externalGatePkgPayloadProjectIoReady = gateRequirementReady(externalGate, "PKG payload project IO evidence ready");
  const operatorRunbookDesktopProjectIoReady = externalOperatorRunbook?.desktopProjectIoEvidenceReady === true;
  const desktopProjectIoEvidenceReady =
    completionStatusDesktopProjectIoReady &&
    completionStatusPkgPayloadProjectIoReady &&
    externalGateDesktopProjectIoReady &&
    externalGatePkgPayloadProjectIoReady &&
    operatorRunbookDesktopProjectIoReady;
  const sourceEvidenceReady = Boolean(completionStatus) && Boolean(externalGate) && Boolean(externalRemediation) && Boolean(externalOperatorRunbook) && desktopProjectIoEvidenceReady;
  const firstBlockers = unique([
    ...gateRequirementRows.map((row) => row.firstBlocker),
    ...remediationRows.map((row) => row.firstBlocker),
    ...(desktopProjectIoEvidenceReady ? [] : ["Desktop project IO evidence is not ready in completion status, external gate, and operator runbook evidence."]),
    ...(completionStatusPkgPayloadProjectIoReady && externalGatePkgPayloadProjectIoReady ? [] : ["PKG payload project IO evidence is not ready in completion status and external gate evidence."]),
    ...(sourceEvidenceReady ? [] : ["External readiness source evidence is incomplete; run npm run release:check first."])
  ]).slice(0, 12);
  const evidenceArtifacts = [
    evidence(completionStatusPath, "Completion status"),
    evidence(completionStatusPath, "Desktop project IO status evidence"),
    evidence(completionStatusPath, "PKG payload project IO status evidence"),
    evidence(externalGatePath, "External distribution gate"),
    evidence(externalGatePath, "Desktop project IO gate requirement"),
    evidence(externalGatePath, "PKG payload project IO gate requirement"),
    evidence(externalRemediationPath, "External remediation"),
    evidence(externalOperatorRunbookPath, "External operator runbook"),
    evidence(externalOperatorRunbookPath, "Desktop project IO runbook evidence"),
    evidence(externalOperatorRunbookPath, "Operator runbook current proof rows"),
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
    localReleaseReady: completionStatus?.completionStatusReady === true && completionStatus?.localMvpEvidenceReady === true && completionStatusDesktopProjectIoReady && completionStatus?.localDesktopPackageReady === true,
    desktopProjectIoEvidenceReady,
    desktopProjectIoEvidence: {
      completionStatusReady: completionStatusDesktopProjectIoReady,
      pkgPayloadProjectIoStatusReady: completionStatusPkgPayloadProjectIoReady,
      externalGateRequirementReady: externalGateDesktopProjectIoReady,
      pkgPayloadProjectIoGateRequirementReady: externalGatePkgPayloadProjectIoReady,
      operatorRunbookReady: operatorRunbookDesktopProjectIoReady,
      completionStatusPath: relative(completionStatusPath),
      externalGatePath: relative(externalGatePath),
      externalOperatorRunbookPath: relative(externalOperatorRunbookPath),
      valueRecorded: false
    },
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
    ...buildCurrentActionSummary(externalOperatorRunbook),
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
check(summary.desktopProjectIoEvidenceReady === true, "external readiness ledger should include ready desktop project IO evidence");
check(summary.desktopProjectIoEvidence?.completionStatusReady === true, "external readiness ledger should read desktop project IO readiness from completion status");
check(summary.desktopProjectIoEvidence?.pkgPayloadProjectIoStatusReady === true, "external readiness ledger should read PKG payload project IO readiness from completion status");
check(summary.desktopProjectIoEvidence?.externalGateRequirementReady === true, "external readiness ledger should read desktop project IO readiness from the external gate");
check(summary.desktopProjectIoEvidence?.pkgPayloadProjectIoGateRequirementReady === true, "external readiness ledger should read PKG payload project IO readiness from the external gate");
check(summary.desktopProjectIoEvidence?.operatorRunbookReady === true, "external readiness ledger should read desktop project IO readiness from the operator runbook");
check(summary.desktopProjectIoEvidence?.valueRecorded === false, "external readiness ledger desktop project IO evidence should not record values");
check(Array.isArray(summary.evidenceArtifacts) && summary.evidenceArtifacts.length >= 11, "external readiness ledger should include evidence artifacts");
check(summary.evidenceArtifacts.some((item) => item.label === "Desktop project IO status evidence"), "external readiness ledger should include desktop project IO status evidence");
check(summary.evidenceArtifacts.some((item) => item.label === "PKG payload project IO status evidence"), "external readiness ledger should include PKG payload project IO status evidence");
check(summary.evidenceArtifacts.some((item) => item.label === "Desktop project IO gate requirement"), "external readiness ledger should include desktop project IO gate evidence");
check(summary.evidenceArtifacts.some((item) => item.label === "PKG payload project IO gate requirement"), "external readiness ledger should include PKG payload project IO gate evidence");
check(summary.evidenceArtifacts.some((item) => item.label === "Desktop project IO runbook evidence"), "external readiness ledger should include desktop project IO runbook evidence");
check(summary.evidenceArtifacts.some((item) => item.label === "Operator runbook current proof rows"), "external readiness ledger should include operator runbook current proof row evidence");
check(Array.isArray(summary.gateRequirementRows), "external readiness ledger should include gate requirement rows");
check(
  summary.gateRequirementRows.some((item) => item.label === "Desktop project IO evidence ready" && item.ready === true),
  "external readiness ledger should include a ready desktop project IO gate row"
);
check(
  summary.gateRequirementRows.some((item) => item.label === "PKG payload project IO evidence ready" && item.ready === true),
  "external readiness ledger should include a ready PKG payload project IO gate row"
);
check(Array.isArray(summary.remediationRows), "external readiness ledger should include remediation rows");
check(Array.isArray(summary.firstBlockers), "external readiness ledger should include first blockers");
check(summary.evidenceArtifacts.every((item) => item.valueRecorded === false), "external readiness evidence artifacts should not record values");
check(summary.gateRequirementRows.every((item) => item.valueRecorded === false), "external readiness gate rows should not record values");
check(summary.remediationRows.every((item) => item.valueRecorded === false), "external readiness remediation rows should not record values");
check(summary.currentActionValueRecorded === false, "external readiness current action summary should not record values");
check(Array.isArray(summary.currentEnvEditRows), "external readiness ledger should expose current env edit rows");
check(summary.currentEnvEditRows.every((row) => row.valueRecorded === false), "external readiness current env edit rows should not record values");
check(Array.isArray(summary.currentProofChecklistRows), "external readiness ledger should expose current proof checklist rows");
check(summary.currentProofChecklistRows.every((row) => row.valueRecorded === false), "external readiness current proof checklist rows should not record values");
check(Array.isArray(summary.currentCommandVerificationRows), "external readiness ledger should expose current command verification rows");
check(summary.currentCommandVerificationRows.every((row) => row.valueRecorded === false), "external readiness current command verification rows should not record values");
if (summary.currentActionSourceReady) {
  check(summary.currentNextCommand !== "none", "external readiness ledger should mirror the current next command when runbook current action evidence exists");
  check(summary.currentProofChecklistRowCount === summary.currentProofChecklistRows.length, "external readiness ledger should mirror current proof checklist row count");
  check(summary.currentCommandVerificationRowCount === summary.currentCommandVerificationRows.length, "external readiness ledger should mirror current command verification row count");
}
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
check(markdown.includes("Current Action"), "external readiness ledger Markdown should include current action");
check(markdown.includes("Current Edit Guidance"), "external readiness ledger Markdown should include current edit guidance");
check(markdown.includes("Current Proof Checklist Rows"), "external readiness ledger Markdown should include current proof checklist rows");
check(markdown.includes("Current Command Verification Rows"), "external readiness ledger Markdown should include current command verification rows");
check(markdown.includes("Desktop project IO evidence ready:"), "external readiness ledger Markdown should include desktop project IO readiness");
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
console.log(`- Desktop project IO evidence ready: ${summary.desktopProjectIoEvidenceReady ? "yes" : "no"}`);
console.log(`- External distribution hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- Gate requirements ready: ${summary.gateRequirementReadyCount}/${summary.gateRequirementTotal}`);
console.log(`- Remediation groups ready: ${summary.remediationReadyCount}/${summary.remediationTotal}`);
console.log(`- Manual QA checklist digest available: ${summary.manualQaChecklistDigestAvailable ? "yes" : "no"}`);
console.log(`- Current action source ready: ${summary.currentActionSourceReady ? "yes" : "no"}`);
console.log(`- Current next command: ${summary.currentNextCommand}`);
console.log(`- Current first blocker: ${summary.currentFirstBlocker}`);
console.log(`- Current env edit rows: ${summary.currentEnvEditRowsCount} (${summary.currentEnvEditRowsSummary})`);
console.log(`- Current proof checklist rows: ${summary.currentProofChecklistRowCount} (${summary.currentProofChecklistRowSummary})`);
console.log(`- Current command verification rows: ${summary.currentCommandVerificationRowCount} (${summary.currentCommandVerificationRowSummary})`);
console.log(`- First blockers tracked: ${summary.firstBlockers.length}`);
console.log(`- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, local env values, private beats, or real user audio");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
