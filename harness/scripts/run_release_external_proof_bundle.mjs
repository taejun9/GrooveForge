#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionPrivateInputKeys, loadDistributionLocalEnv } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const desktopRoot = path.join(root, "build", "desktop");
const packageRoot = path.join(desktopRoot, `${appName}-${platformArch}`);
const releaseDoctorPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-doctor.json`);
const externalPreflightPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-preflight.json`);
const externalNextActionsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-next-actions.json`);
const externalOperatorRunbookPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-operator-runbook.json`);
const externalReadinessLedgerPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-readiness-ledger.json`);
const completionStatusPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-status.json`);
const completionProgressPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-progress.json`);
const externalRemediationPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-remediation.json`);
const externalGatePath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-distribution-gate.json`);
const privateInputsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-private-inputs.json`);
const distributionChannelQaPath = path.join(desktopRoot, `${appName}-${platformArch}-distribution-channel-qa.json`);
const manualQaPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-manual-qa.json`);
const autoUpdateReadinessPath = path.join(desktopRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const developerIdSigningPath = path.join(desktopRoot, `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(desktopRoot, `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(desktopRoot, `${appName}-${platformArch}-notarized-gatekeeper.json`);
const releaseManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const releaseNotesPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-notes.json`);
const supportArtifactPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-support.json`);
const distributionHandoffPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-handoff.json`);
const distributionBundleManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-bundle-manifest.json`);
const proofBundleMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-proof-bundle.md`);
const proofBundleJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-proof-bundle.json`);
const hardExternalGateCommand = "npm run release:external-check";
const recommendedPrivateEditOperatorProofCommand = "npm run release:private-edit-strict-proof";
const args = new Set(process.argv.slice(2));
const fromExisting = args.has("--from-existing");
const failures = [];
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

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge external proof bundle failed:");
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

function sensitiveEnvironmentValues() {
  return sensitivePrivateKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function firstBoolean(source, keys) {
  for (const key of keys) {
    if (source && typeof source[key] === "boolean") {
      return source[key];
    }
  }
  return null;
}

function firstBlockerFrom(values) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0) ?? "";
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

function actionChecklistRows(values) {
  return stringArrayValue(values).map((step, index) => ({
    order: index + 1,
    step,
    valueRecorded: false
  }));
}

function buildCurrentEnvSummary(externalNextActions) {
  const currentRequiredKeys = stringArrayValue(externalNextActions?.currentRequiredKeys);
  const currentPlaceholderKeys = stringArrayValue(externalNextActions?.currentPlaceholderKeys);
  const currentPlaceholderEditLocations = valueFreeObjectRows(externalNextActions?.currentPlaceholderEditLocations);
  const currentEnvEditTemplate = valueFreeObjectRows(externalNextActions?.currentEnvEditTemplate);
  const currentEnvEditRows = valueFreeObjectRows(externalNextActions?.currentEnvEditRows);
  const currentPlaceholderRemediationRows = valueFreeObjectRows(externalNextActions?.currentPlaceholderRemediationRows);
  const currentProofChecklistRows = valueFreeObjectRows(externalNextActions?.currentProofChecklistRows);
  const currentCommandVerificationRows = valueFreeObjectRows(externalNextActions?.currentCommandVerificationRows);
  const releaseChannelPostEditOperatorReceiptRows = valueFreeObjectRows(externalNextActions?.releaseChannelPostEditOperatorReceiptRows);
  const postEditProofSequenceReceiptRows = valueFreeObjectRows(externalNextActions?.postEditProofSequenceReceiptRows);
  const currentActionChecklistRows = actionChecklistRows(externalNextActions?.currentActionChecklist);
  return {
    currentRequiredKeyCount: integerValue(externalNextActions?.currentRequiredKeyCount),
    currentRequiredKeySummary: textValue(externalNextActions?.currentRequiredKeySummary),
    currentRequiredKeys,
    currentPlaceholderKeyCount: integerValue(externalNextActions?.currentPlaceholderKeyCount),
    currentPlaceholderKeySummary: textValue(externalNextActions?.currentPlaceholderKeySummary),
    currentPlaceholderKeys,
    currentPlaceholderEditLocationCount: integerValue(externalNextActions?.currentPlaceholderEditLocationCount),
    currentPlaceholderEditLocationSummary: textValue(externalNextActions?.currentPlaceholderEditLocationSummary),
    currentPlaceholderEditLocations,
    currentEnvEditTarget: textValue(externalNextActions?.currentEnvEditTarget, ".env.distribution.local"),
    currentEnvEditTemplateCount: integerValue(externalNextActions?.currentEnvEditTemplateCount),
    currentEnvEditTemplateSummary: textValue(externalNextActions?.currentEnvEditTemplateSummary),
    currentEnvEditTemplate,
    currentEnvEditRowsCount: integerValue(externalNextActions?.currentEnvEditRowsCount),
    currentEnvEditRowsSummary: textValue(externalNextActions?.currentEnvEditRowsSummary),
    currentEnvEditRows,
    currentPlaceholderRemediationRowCount: integerValue(externalNextActions?.currentPlaceholderRemediationRowCount),
    currentPlaceholderRemediationRowSummary: textValue(externalNextActions?.currentPlaceholderRemediationRowSummary),
    currentPlaceholderRemediationRows,
    currentProofChecklistRowCount: integerValue(externalNextActions?.currentProofChecklistRowCount),
    currentProofChecklistRowSummary: textValue(externalNextActions?.currentProofChecklistRowSummary),
    currentProofChecklistRows,
    currentActionChecklistCount: integerValue(externalNextActions?.currentActionChecklistCount),
    currentActionChecklistSummary: textValue(externalNextActions?.currentActionChecklistSummary),
    currentActionChecklistRows,
    currentRerunCommand: textValue(externalNextActions?.currentRerunCommand),
    currentCommandSequenceCount: integerValue(externalNextActions?.currentCommandSequenceCount),
    currentCommandSequenceSummary: textValue(externalNextActions?.currentCommandSequenceSummary),
    currentCommandVerificationRows,
    releaseChannelPostEditOperatorReceiptReady:
      externalNextActions?.releaseChannelPostEditOperatorReceiptReady === true &&
      integerValue(externalNextActions?.releaseChannelPostEditOperatorReceiptRowCount) === releaseChannelPostEditOperatorReceiptRows.length &&
      releaseChannelPostEditOperatorReceiptRows.length === 7 &&
      releaseChannelPostEditOperatorReceiptRows.every((row) => row.ready === true && row.valueRecorded === false),
    releaseChannelPostEditOperatorReceiptRowCount: integerValue(externalNextActions?.releaseChannelPostEditOperatorReceiptRowCount),
    releaseChannelPostEditOperatorReceiptSummary: textValue(externalNextActions?.releaseChannelPostEditOperatorReceiptSummary, "none"),
    releaseChannelPostEditOperatorReceiptRows,
    releaseChannelPostEditOperatorReceiptRecommendedProofCommand: textValue(
      externalNextActions?.releaseChannelPostEditOperatorReceiptRecommendedProofCommand,
      recommendedPrivateEditOperatorProofCommand
    ),
    releaseChannelPostEditOperatorReceiptRecommendedProofCommandRole: textValue(
      externalNextActions?.releaseChannelPostEditOperatorReceiptRecommendedProofCommandRole,
      "recommended strict-first proof chain after replacing the four private release-channel placeholders"
    ),
    releaseChannelPostEditOperatorReceiptRecommendedProofCommandValueRecorded:
      externalNextActions?.releaseChannelPostEditOperatorReceiptRecommendedProofCommandValueRecorded === true ? true : false,
    releaseChannelPostEditOperatorReceiptProofCommand: textValue(externalNextActions?.releaseChannelPostEditOperatorReceiptProofCommand, "npm run release:doctor"),
    releaseChannelPostEditOperatorReceiptBlockerRefreshCommand: textValue(
      externalNextActions?.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand,
      "npm run release:current-blocker"
    ),
    releaseChannelPostEditOperatorReceiptNextActionsCommand: textValue(
      externalNextActions?.releaseChannelPostEditOperatorReceiptNextActionsCommand,
      "npm run release:next-actions"
    ),
    releaseChannelPostEditOperatorReceiptHardGateCommand: textValue(
      externalNextActions?.releaseChannelPostEditOperatorReceiptHardGateCommand,
      hardExternalGateCommand
    ),
    releaseChannelPostEditOperatorReceiptValueRecorded:
      externalNextActions?.releaseChannelPostEditOperatorReceiptValueRecorded === true ? true : false,
    postEditProofSequenceReceiptReady:
      externalNextActions?.postEditProofSequenceReceiptReady === true &&
      integerValue(externalNextActions?.postEditProofSequenceReceiptRowCount) === postEditProofSequenceReceiptRows.length &&
      postEditProofSequenceReceiptRows.length === 8 &&
      postEditProofSequenceReceiptRows.every((row) => row.ready === true && row.valueRecorded === false),
    postEditProofSequenceReceiptRowCount: integerValue(externalNextActions?.postEditProofSequenceReceiptRowCount),
    postEditProofSequenceReceiptSummary: textValue(externalNextActions?.postEditProofSequenceReceiptSummary, "none"),
    postEditProofSequenceReceiptRows: postEditProofSequenceReceiptRows,
    postEditProofSequenceReceiptRecommendedProofCommand: textValue(
      externalNextActions?.postEditProofSequenceReceiptRecommendedProofCommand,
      recommendedPrivateEditOperatorProofCommand
    ),
    postEditProofSequenceReceiptRecommendedProofCommandValueRecorded:
      externalNextActions?.postEditProofSequenceReceiptRecommendedProofCommandValueRecorded === true ? true : false,
    postEditProofSequenceReceiptDoctorCommand: textValue(
      externalNextActions?.postEditProofSequenceReceiptDoctorCommand,
      "npm run release:doctor"
    ),
    postEditProofSequenceReceiptCurrentBlockerCommand: textValue(
      externalNextActions?.postEditProofSequenceReceiptCurrentBlockerCommand,
      "npm run release:current-blocker"
    ),
    postEditProofSequenceReceiptNextActionsCommand: textValue(
      externalNextActions?.postEditProofSequenceReceiptNextActionsCommand,
      "npm run release:next-actions"
    ),
    postEditProofSequenceReceiptProofBundleCommand: textValue(
      externalNextActions?.postEditProofSequenceReceiptProofBundleCommand,
      "npm run release:proof-bundle"
    ),
    postEditProofSequenceReceiptProgressCommand: textValue(
      externalNextActions?.postEditProofSequenceReceiptProgressCommand,
      "npm run release:progress-smoke"
    ),
    postEditProofSequenceReceiptHardGateCommand: textValue(
      externalNextActions?.postEditProofSequenceReceiptHardGateCommand,
      hardExternalGateCommand
    ),
    postEditProofSequenceReceiptValueRecorded:
      externalNextActions?.postEditProofSequenceReceiptValueRecorded === true ? true : false,
    currentEnvSummaryValueRecorded: false
  };
}

function buildDoctorPostEditProofMirror(externalNextActions) {
  const nextActionsReady = externalNextActions !== null && typeof externalNextActions === "object";
  const command = textValue(externalNextActions?.doctorPostEditProofCommand, "none");
  const role = textValue(externalNextActions?.doctorPostEditProofRole, "none");
  return {
    doctorPostEditProofSourceArtifact: "External next actions",
    doctorPostEditProofSourcePath: relative(externalNextActionsPath),
    doctorPostEditProofSourceReady: nextActionsReady,
    doctorPostEditProofNextActionsReady: nextActionsReady,
    doctorPostEditProofDoctorSourceArtifact: textValue(externalNextActions?.doctorPostEditProofSourceArtifact),
    doctorPostEditProofDoctorSourcePath: textValue(externalNextActions?.doctorPostEditProofSourcePath),
    doctorPostEditProofDoctorReportReady: nextActionsReady && externalNextActions?.doctorPostEditProofDoctorReportReady === true,
    doctorPostEditProofCurrentActionId: textValue(externalNextActions?.doctorPostEditProofCurrentActionId),
    doctorPostEditProofCurrentActionLabel: textValue(externalNextActions?.doctorPostEditProofCurrentActionLabel),
    doctorPostEditProofCommand: command,
    doctorPostEditProofRole: role,
    doctorPostEditProofMatchesRecommended:
      nextActionsReady &&
      externalNextActions?.doctorPostEditProofMatchesRecommended === true &&
      command === recommendedPrivateEditOperatorProofCommand,
    doctorPostEditProofMirrorsNextActions:
      nextActionsReady &&
      command === textValue(externalNextActions?.doctorPostEditProofCommand, "none") &&
      role === textValue(externalNextActions?.doctorPostEditProofRole, "none"),
    doctorPostEditProofValueRecorded: externalNextActions?.doctorPostEditProofValueRecorded === true ? true : false,
    doctorPostEditProofClaimedExternalDistribution:
      externalNextActions?.doctorPostEditProofClaimedExternalDistribution === true ? true : false
  };
}

function proofArtifact(order, label, category, filePath, source, readyKeys = [], requiredForHardGate = true) {
  const blockers = unique([
    ...(source?.blockers ?? []),
    ...(source?.firstBlockers ?? []),
    ...(source?.completionStatusBlockers ?? []),
    ...(source?.externalDistributionBlockers ?? []),
    ...(source?.privateInputBlockers ?? []),
    ...(source?.manualQaBlockers ?? [])
  ]);
  return {
    order,
    label,
    category,
    path: relative(filePath),
    present: existsSync(filePath),
    readySignal: firstBoolean(source, readyKeys),
    firstBlocker: firstBlockerFrom(blockers),
    requiredForHardGate,
    valueRecorded: false
  };
}

function toGateRequirementRow(requirement, index) {
  const blockers = unique(requirement.blockers ?? []);
  return {
    order: index + 1,
    label: requirement.label ?? `Requirement ${index + 1}`,
    ready: requirement.ready === true,
    evidence: requirement.evidence ?? "",
    blockerCount: blockers.length,
    firstBlocker: firstBlockerFrom(blockers),
    valueRecorded: false
  };
}

function formatProofArtifactRows(rows) {
  return rows.map((row) => `| ${row.order} | ${row.label} | ${row.present ? "yes" : "no"} | ${row.readySignal === null ? "n/a" : row.readySignal ? "yes" : "no"} | ${row.category} | ${row.path} |`).join("\n");
}

function formatGateRequirementRows(rows) {
  if (rows.length === 0) {
    return "| none | no | 0 | no gate requirement rows |";
  }
  return rows.map((row) => `| ${row.label} | ${row.ready ? "yes" : "no"} | ${row.blockerCount} | ${row.firstBlocker || "none"} |`).join("\n");
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
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

function formatActionChecklistRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.step)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatReleaseChannelPostEditOperatorReceiptRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | none | none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order ?? "?"} | ${escapeCell(row.step)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.currentState)} | ${escapeCell(row.operatorAction)} | ${escapeCell(row.expectedPostEditSignal)} | \`${escapeCell(row.command)}\` | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`
    )
    .join("\n");
}

function formatPostEditProofSequenceReceiptRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order ?? "?"} | ${escapeCell(row.step)} | ${row.ready ? "yes" : "no"} | \`${escapeCell(row.command)}\` | ${escapeCell(row.expectedEvidence)} | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`
    )
    .join("\n");
}

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} External Proof Bundle

## Status

- Proof bundle ready: ${summary.proofBundleReady ? "yes" : "no"}
- Completion stage: ${summary.completionStage}
- Source evidence ready: ${summary.sourceEvidenceReady ? "yes" : "no"}
- Local release ready: ${summary.localReleaseReady ? "yes" : "no"}
- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}
- External hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}
- Hard gate would fail: ${summary.hardGateWouldFail ? "yes" : "no"}
- Proof artifacts present: ${summary.proofArtifactPresentCount}/${summary.proofArtifactCount}
- Gate requirements ready: ${summary.gateRequirementReadyCount}/${summary.gateRequirementTotal}
- Current next command: \`${summary.currentNextCommand}\`
- Hard external distribution gate: \`${summary.hardExternalGateCommand}\`
- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted by this proof bundle: no
- Signing attempted by this proof bundle: no

## Proof Artifacts

| order | artifact | present | ready signal | category | path |
|---:|---|---:|---:|---|---|
${formatProofArtifactRows(summary.proofArtifacts)}

## Gate Requirements

| requirement | ready | blockers | first blocker |
|---|---:|---:|---|
${formatGateRequirementRows(summary.gateRequirementRows)}

## Current Action

- Current focus: ${summary.currentFocus}
- Current first blocker: ${summary.currentFirstBlocker}
- Current operator action: ${summary.currentOperatorAction}
- Current required keys: ${summary.currentRequiredKeyCount} (${summary.currentRequiredKeySummary})
- Current placeholder keys: ${summary.currentPlaceholderKeyCount} (${summary.currentPlaceholderKeySummary})
- Current placeholder edit locations: ${summary.currentPlaceholderEditLocationCount} (${summary.currentPlaceholderEditLocationSummary})
- Current env edit target: ${summary.currentEnvEditTarget}
- Current env edit template: ${summary.currentEnvEditTemplateCount} (${summary.currentEnvEditTemplateSummary})
- Current env edit rows: ${summary.currentEnvEditRowsCount} (${summary.currentEnvEditRowsSummary})
- Current placeholder remediation rows: ${summary.currentPlaceholderRemediationRowCount} (${summary.currentPlaceholderRemediationRowSummary})
- Current proof checklist rows: ${summary.currentProofChecklistRowCount} (${summary.currentProofChecklistRowSummary})
- Current action checklist: ${summary.currentActionChecklistCount} (${summary.currentActionChecklistSummary})
- Current rerun command: \`${summary.currentRerunCommand}\`
- Current command sequence: ${summary.currentCommandSequenceCount} (${summary.currentCommandSequenceSummary})
- Current command verification rows: ${summary.currentCommandVerificationRowCount} (${summary.currentCommandVerificationRowSummary})
- Release-channel post-edit operator receipt ready: ${summary.releaseChannelPostEditOperatorReceiptReady ? "yes" : "no"}
- Release-channel post-edit operator receipt rows: ${summary.releaseChannelPostEditOperatorReceiptRowCount} (${summary.releaseChannelPostEditOperatorReceiptSummary})
- Release-channel post-edit operator recommended proof chain: \`${summary.releaseChannelPostEditOperatorReceiptRecommendedProofCommand}\`
- Release-channel post-edit operator proof command: \`${summary.releaseChannelPostEditOperatorReceiptProofCommand}\`
- Release-channel post-edit operator blocker refresh: \`${summary.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand}\`
- Release-channel post-edit operator next-actions refresh: \`${summary.releaseChannelPostEditOperatorReceiptNextActionsCommand}\`
- Release-channel post-edit operator hard gate: \`${summary.releaseChannelPostEditOperatorReceiptHardGateCommand}\`
- Post-edit proof sequence receipt ready: ${summary.postEditProofSequenceReceiptReady ? "yes" : "no"}
- Post-edit proof sequence receipt rows: ${summary.postEditProofSequenceReceiptRowCount} (${summary.postEditProofSequenceReceiptSummary})
- Post-edit proof sequence recommended proof chain: \`${summary.postEditProofSequenceReceiptRecommendedProofCommand}\`
- Post-edit proof sequence doctor command: \`${summary.postEditProofSequenceReceiptDoctorCommand}\`
- Post-edit proof sequence current-blocker command: \`${summary.postEditProofSequenceReceiptCurrentBlockerCommand}\`
- Post-edit proof sequence next-actions command: \`${summary.postEditProofSequenceReceiptNextActionsCommand}\`
- Post-edit proof sequence proof-bundle command: \`${summary.postEditProofSequenceReceiptProofBundleCommand}\`
- Post-edit proof sequence progress command: \`${summary.postEditProofSequenceReceiptProgressCommand}\`
- Post-edit proof sequence hard gate: \`${summary.postEditProofSequenceReceiptHardGateCommand}\`
- Doctor post-edit proof source ready: ${summary.doctorPostEditProofSourceReady ? "yes" : "no"}
- Doctor post-edit proof command: \`${summary.doctorPostEditProofCommand}\`
- Doctor post-edit proof matches recommended: ${summary.doctorPostEditProofMatchesRecommended ? "yes" : "no"}

## Current Action Checklist Rows

| order | step | value recorded |
|---:|---|---:|
${formatActionChecklistRows(summary.currentActionChecklistRows)}

## Current Proof Checklist Rows

| order | criterion | evidence | proof command | hard gate | value recorded |
|---:|---|---|---|---|---:|
${formatProofChecklistRows(summary.currentProofChecklistRows)}

## Current Command Verification Rows

| order | command | role | expectation | proof target | value recorded |
|---:|---|---|---|---|---:|
${formatCommandVerificationRows(summary.currentCommandVerificationRows)}

## Release-Channel Post-Edit Operator Receipt

| order | step | ready | current state | operator action | expected post-edit signal | command | proof command | rerun command | source | value recorded |
|---:|---|---:|---|---|---|---|---|---|---|---:|
${formatReleaseChannelPostEditOperatorReceiptRows(summary.releaseChannelPostEditOperatorReceiptRows)}

## Post-Edit Proof Sequence Receipt

| order | step | ready | command | expected evidence | source | value recorded |
|---:|---|---:|---|---|---|---:|
${formatPostEditProofSequenceReceiptRows(summary.postEditProofSequenceReceiptRows)}

## Release Doctor Post-Edit Proof Mirror

- Source artifact: ${summary.doctorPostEditProofSourceArtifact}
- Source path: ${summary.doctorPostEditProofSourcePath}
- Source ready: ${summary.doctorPostEditProofSourceReady ? "yes" : "no"}
- Next-actions ready: ${summary.doctorPostEditProofNextActionsReady ? "yes" : "no"}
- Doctor source artifact: ${summary.doctorPostEditProofDoctorSourceArtifact}
- Doctor source path: ${summary.doctorPostEditProofDoctorSourcePath}
- Doctor report ready: ${summary.doctorPostEditProofDoctorReportReady ? "yes" : "no"}
- Current action: ${summary.doctorPostEditProofCurrentActionLabel}
- Current action id: ${summary.doctorPostEditProofCurrentActionId}
- Post-edit proof command: \`${summary.doctorPostEditProofCommand}\`
- Post-edit proof role: ${summary.doctorPostEditProofRole}
- Mirrors next-actions: ${summary.doctorPostEditProofMirrorsNextActions ? "yes" : "no"}
- Matches recommended operator proof chain: ${summary.doctorPostEditProofMatchesRecommended ? "yes" : "no"}
- Value recorded: ${summary.doctorPostEditProofValueRecorded ? "yes" : "no"}
- External distribution claimed by release doctor: ${summary.doctorPostEditProofClaimedExternalDistribution ? "yes" : "no"}

## First Blockers

${formatBlockers(summary.firstBlockers)}

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, local env values, private beats, and real user audio are not recorded.

## Not Claimed

This proof bundle does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function runNextActionsIfNeeded() {
  if (fromExisting) {
    return { attempted: false, succeeded: true, status: 0 };
  }
  const result = spawnSync("npm", ["run", "release:next-actions"], {
    cwd: root,
    stdio: "inherit",
    env: process.env
  });
  return {
    attempted: true,
    succeeded: result.status === 0,
    status: result.status ?? 1
  };
}

async function createProofBundleSummary(nextActionsRun) {
  const releaseDoctor = await readJsonIfExists(releaseDoctorPath);
  const externalPreflight = await readJsonIfExists(externalPreflightPath);
  const externalNextActions = await readJsonIfExists(externalNextActionsPath);
  const externalOperatorRunbook = await readJsonIfExists(externalOperatorRunbookPath);
  const externalReadinessLedger = await readJsonIfExists(externalReadinessLedgerPath);
  const completionStatus = await readJsonIfExists(completionStatusPath);
  const completionProgress = await readJsonIfExists(completionProgressPath);
  const externalRemediation = await readJsonIfExists(externalRemediationPath);
  const externalGate = await readJsonIfExists(externalGatePath);
  const privateInputs = await readJsonIfExists(privateInputsPath);
  const distributionChannelQa = await readJsonIfExists(distributionChannelQaPath);
  const manualQa = await readJsonIfExists(manualQaPath);
  const autoUpdateReadiness = await readJsonIfExists(autoUpdateReadinessPath);
  const developerIdSigning = await readJsonIfExists(developerIdSigningPath);
  const notarization = await readJsonIfExists(notarizationPath);
  const notarizedGatekeeper = await readJsonIfExists(notarizedGatekeeperPath);
  const releaseManifest = await readJsonIfExists(releaseManifestPath);
  const releaseNotes = await readJsonIfExists(releaseNotesPath);
  const supportArtifact = await readJsonIfExists(supportArtifactPath);
  const distributionHandoff = await readJsonIfExists(distributionHandoffPath);
  const distributionBundleManifest = await readJsonIfExists(distributionBundleManifestPath);
  const localEnvInput = await loadDistributionLocalEnv({ root, allowedKeys: distributionPrivateInputKeys });
  const proofArtifacts = [
    proofArtifact(1, "Release doctor", "operator-status", releaseDoctorPath, releaseDoctor, ["releaseDoctorReady", "localReleaseReady"], true),
    proofArtifact(2, "External preflight", "operator-status", externalPreflightPath, externalPreflight, ["sourceEvidenceReady", "localReleaseReady"], true),
    proofArtifact(3, "External next actions", "operator-status", externalNextActionsPath, externalNextActions, ["sourceEvidenceReady"], true),
    proofArtifact(4, "External operator runbook", "operator-status", externalOperatorRunbookPath, externalOperatorRunbook, ["operatorRunbookReady"], true),
    proofArtifact(5, "External readiness ledger", "operator-status", externalReadinessLedgerPath, externalReadinessLedger, ["ledgerReady"], true),
    proofArtifact(6, "Completion status", "completion-evidence", completionStatusPath, completionStatus, ["completionStatusReady", "localMvpEvidenceReady"], true),
    proofArtifact(7, "Completion progress", "completion-evidence", completionProgressPath, completionProgress, ["completionProgressReady", "sourceEvidenceReady"], true),
    proofArtifact(8, "External remediation", "completion-evidence", externalRemediationPath, externalRemediation, ["externalRemediationReady"], true),
    proofArtifact(9, "External distribution gate", "hard-gate", externalGatePath, externalGate, ["externalDistributionGateReady"], true),
    proofArtifact(10, "Distribution private inputs", "private-inputs", privateInputsPath, privateInputs, ["privateInputsReady"], true),
    proofArtifact(11, "Distribution-channel QA", "channel-qa", distributionChannelQaPath, distributionChannelQa, ["externalDistributionReady", "channelMetadataReady"], true),
    proofArtifact(12, "Manual QA checklist", "manual-qa", manualQaPath, manualQa, ["manualQaApprovalReady", "manualQaChecklistReady"], true),
    proofArtifact(13, "Auto-update readiness", "auto-update", autoUpdateReadinessPath, autoUpdateReadiness, ["autoUpdateReady"], true),
    proofArtifact(14, "Developer ID signing", "signing", developerIdSigningPath, developerIdSigning, ["developerIdSignedCopyReady", "developerIdSigningReady"], true),
    proofArtifact(15, "Notarization", "notarization", notarizationPath, notarization, ["notarizationAccepted", "stapleValidationPassed"], true),
    proofArtifact(16, "Notarized Gatekeeper", "gatekeeper", notarizedGatekeeperPath, notarizedGatekeeper, ["notarizedGatekeeperReady"], true),
    proofArtifact(17, "Release manifest", "release-artifact", releaseManifestPath, releaseManifest, ["releaseManifestReady"], true),
    proofArtifact(18, "Release notes", "release-artifact", releaseNotesPath, releaseNotes, ["releaseNotesReady"], true),
    proofArtifact(19, "Support artifact", "release-artifact", supportArtifactPath, supportArtifact, ["supportArtifactReady"], true),
    proofArtifact(20, "Distribution handoff", "release-artifact", distributionHandoffPath, distributionHandoff, ["distributionHandoffReady"], true),
    proofArtifact(21, "Distribution bundle manifest", "release-artifact", distributionBundleManifestPath, distributionBundleManifest, ["bundleManifestReady"], true)
  ];
  const gateRequirementRows = (externalGate?.requirements ?? []).map(toGateRequirementRow);
  const proofArtifactPresentCount = proofArtifacts.filter((artifact) => artifact.present).length;
  const missingProofArtifacts = proofArtifacts.filter((artifact) => !artifact.present).map((artifact) => artifact.label);
  const gateRequirementReadyCount = gateRequirementRows.filter((row) => row.ready).length;
  const firstBlockers = unique([
    externalNextActions?.currentFirstBlocker,
    externalNextActions?.completionGapFirstBlocker,
    releaseDoctor?.currentActionFirstBlocker,
    ...(externalNextActions?.firstBlockers ?? []),
    ...(externalPreflight?.firstBlockers ?? []),
    ...gateRequirementRows.map((row) => row.firstBlocker),
    ...proofArtifacts.map((artifact) => artifact.firstBlocker),
    ...(missingProofArtifacts.length > 0 ? [`Missing proof artifacts: ${missingProofArtifacts.join(", ")}`] : [])
  ]).slice(0, 12);
  const proofBundleReady = nextActionsRun.succeeded && proofArtifactPresentCount === proofArtifacts.length && Boolean(externalNextActions);
  const sourceEvidenceReady = externalNextActions?.sourceEvidenceReady === true || externalPreflight?.sourceEvidenceReady === true || completionProgress?.sourceEvidenceReady === true;
  const localReleaseReady = externalNextActions?.localReleaseReady === true || externalPreflight?.localReleaseReady === true || completionStatus?.localReleaseReady === true;
  const externalDistributionGateReady = externalGate?.externalDistributionGateReady === true || externalNextActions?.externalDistributionGateReady === true;
  const hardGateWouldFail = externalNextActions?.hardGateWouldFail === true || externalPreflight?.hardGateWouldFail === true || externalDistributionGateReady !== true;
  const currentEnvSummary = buildCurrentEnvSummary(externalNextActions);
  const doctorPostEditProofMirror = buildDoctorPostEditProofMirror(externalNextActions);

  return {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    proofBundleMarkdownPath: relative(proofBundleMarkdownPath),
    proofBundleJsonPath: relative(proofBundleJsonPath),
    productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
    proofBundleScope: "value-free external proof artifact index before the hard external distribution gate",
    proofBundleCommand: "npm run release:proof-bundle",
    proofBundleSmokeCommand: "npm run release:proof-bundle-smoke",
    nextActionsRunAttempted: nextActionsRun.attempted,
    nextActionsRunSucceeded: nextActionsRun.succeeded,
    nextActionsExitStatus: nextActionsRun.status,
    nextActionsOutputRecorded: false,
    completionStage: externalNextActions?.completionStage ?? externalPreflight?.completionStage ?? completionStatus?.completionStage ?? "source evidence incomplete",
    sourceEvidenceReady,
    localReleaseReady,
    externalDistributionReady: externalNextActions?.externalDistributionReady === true || externalPreflight?.externalDistributionReady === true,
    externalDistributionGateReady,
    hardGateWouldFail,
    hardExternalGateCommand,
    currentFocus: externalNextActions?.currentFocus ?? releaseDoctor?.currentActionLabel ?? "unknown",
    currentNextCommand: externalNextActions?.currentNextCommand ?? releaseDoctor?.currentActionNextCommand ?? "npm run release:next-actions",
    currentFirstBlocker: externalNextActions?.currentFirstBlocker ?? releaseDoctor?.currentActionFirstBlocker ?? firstBlockers[0] ?? "unknown",
    currentOperatorAction: externalNextActions?.currentOperatorAction ?? releaseDoctor?.currentActionOperatorAction ?? "Review the proof bundle and resolve the first blocker.",
    ...currentEnvSummary,
    ...doctorPostEditProofMirror,
    currentCommandVerificationRowCount: externalNextActions?.currentCommandVerificationRowCount ?? 0,
    currentCommandVerificationRowSummary: externalNextActions?.currentCommandVerificationRowSummary ?? "none",
    proofArtifactCount: proofArtifacts.length,
    proofArtifactPresentCount,
    proofArtifactMissingCount: missingProofArtifacts.length,
    proofArtifactMissingSummary: missingProofArtifacts.length > 0 ? missingProofArtifacts.join(", ") : "none",
    gateRequirementTotal: gateRequirementRows.length,
    gateRequirementReadyCount,
    gateRequirementBlockedCount: gateRequirementRows.filter((row) => !row.ready).length,
    proofBundleReady,
    localEnvInput,
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
    notarySubmissionAttemptedByThisProofBundle: false,
    signingAttemptedByThisProofBundle: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedManualQaApproval: false,
    releaseGateClaimedExternalDistribution: false,
    proofArtifacts,
    gateRequirementRows,
    firstBlockers
  };
}

const nextActionsRun = await runNextActionsIfNeeded();
if (!nextActionsRun.succeeded) {
  fail("release:next-actions failed before proof bundle generation.");
}

const summary = await createProofBundleSummary(nextActionsRun);
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(proofBundleJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(proofBundleMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "release proof bundle should identify GrooveForge");
check(summary.bundleId === bundleId, `release proof bundle should identify ${bundleId}`);
check(summary.version === packageJson.version, "release proof bundle should match package version");
check(summary.productScope.includes("all-genre direct beat workstation"), "release proof bundle should describe direct beat workstation scope");
check(summary.productScope.includes("sampling optional"), "release proof bundle should keep sampling optional");
check(summary.hardExternalGateCommand === hardExternalGateCommand, "release proof bundle should keep the hard external gate command");
check(summary.currentNextCommand.length > 0, "release proof bundle should include the current next command");
check(summary.currentFirstBlocker.length > 0, "release proof bundle should include the current first blocker");
check(Number.isInteger(summary.currentRequiredKeyCount), "release proof bundle should include current required key count");
check(typeof summary.currentRequiredKeySummary === "string" && summary.currentRequiredKeySummary.length > 0, "release proof bundle should include current required key summary");
check(Array.isArray(summary.currentRequiredKeys), "release proof bundle should include current required key names");
check(Number.isInteger(summary.currentPlaceholderKeyCount), "release proof bundle should include current placeholder key count");
check(typeof summary.currentPlaceholderKeySummary === "string" && summary.currentPlaceholderKeySummary.length > 0, "release proof bundle should include current placeholder key summary");
check(Array.isArray(summary.currentPlaceholderKeys), "release proof bundle should include current placeholder key names");
check(Number.isInteger(summary.currentPlaceholderEditLocationCount), "release proof bundle should include current placeholder edit location count");
check(typeof summary.currentPlaceholderEditLocationSummary === "string" && summary.currentPlaceholderEditLocationSummary.length > 0, "release proof bundle should include current placeholder edit location summary");
check(Array.isArray(summary.currentPlaceholderEditLocations), "release proof bundle should include value-free current placeholder edit locations");
check(summary.currentPlaceholderEditLocations.every((row) => row.valueRecorded === false), "release proof bundle placeholder edit locations should not record values");
check(typeof summary.currentEnvEditTarget === "string" && summary.currentEnvEditTarget.length > 0, "release proof bundle should include current env edit target");
check(Number.isInteger(summary.currentEnvEditTemplateCount), "release proof bundle should include current env edit template count");
check(typeof summary.currentEnvEditTemplateSummary === "string" && summary.currentEnvEditTemplateSummary.length > 0, "release proof bundle should include current env edit template summary");
check(Array.isArray(summary.currentEnvEditTemplate), "release proof bundle should include value-free current env edit template rows");
check(summary.currentEnvEditTemplate.every((row) => row.valueRecorded === false), "release proof bundle env edit template rows should not record values");
check(Number.isInteger(summary.currentEnvEditRowsCount), "release proof bundle should include current env edit rows count");
check(typeof summary.currentEnvEditRowsSummary === "string" && summary.currentEnvEditRowsSummary.length > 0, "release proof bundle should include current env edit rows summary");
check(Array.isArray(summary.currentEnvEditRows), "release proof bundle should include value-free current env edit rows");
check(summary.currentEnvEditRows.every((row) => row.valueRecorded === false), "release proof bundle env edit rows should not record values");
check(Number.isInteger(summary.currentPlaceholderRemediationRowCount), "release proof bundle should include current placeholder remediation row count");
check(typeof summary.currentPlaceholderRemediationRowSummary === "string" && summary.currentPlaceholderRemediationRowSummary.length > 0, "release proof bundle should include current placeholder remediation row summary");
check(Array.isArray(summary.currentPlaceholderRemediationRows), "release proof bundle should include value-free current placeholder remediation rows");
check(summary.currentPlaceholderRemediationRows.every((row) => row.valueRecorded === false), "release proof bundle placeholder remediation rows should not record values");
check(Number.isInteger(summary.currentProofChecklistRowCount), "release proof bundle should include current proof checklist row count");
check(typeof summary.currentProofChecklistRowSummary === "string" && summary.currentProofChecklistRowSummary.length > 0, "release proof bundle should include current proof checklist row summary");
check(Array.isArray(summary.currentProofChecklistRows), "release proof bundle should include value-free current proof checklist rows");
check(summary.currentProofChecklistRows.every((row) => row.valueRecorded === false), "release proof bundle current proof checklist rows should not record values");
check(Number.isInteger(summary.currentActionChecklistCount), "release proof bundle should include current action checklist count");
check(typeof summary.currentActionChecklistSummary === "string" && summary.currentActionChecklistSummary.length > 0, "release proof bundle should include current action checklist summary");
check(Array.isArray(summary.currentActionChecklistRows), "release proof bundle should include value-free current action checklist rows");
check(summary.currentActionChecklistRows.every((row) => row.valueRecorded === false), "release proof bundle current action checklist rows should not record values");
check(summary.currentActionChecklistCount === summary.currentActionChecklistRows.length, "release proof bundle current action checklist count should match rows");
check(typeof summary.currentRerunCommand === "string" && summary.currentRerunCommand.length > 0, "release proof bundle should include current rerun command");
check(Number.isInteger(summary.currentCommandSequenceCount), "release proof bundle should include current command sequence count");
check(typeof summary.currentCommandSequenceSummary === "string" && summary.currentCommandSequenceSummary.length > 0, "release proof bundle should include current command sequence summary");
check(Array.isArray(summary.currentCommandVerificationRows), "release proof bundle should include value-free current command verification rows");
check(summary.currentCommandVerificationRows.every((row) => row.valueRecorded === false), "release proof bundle current command verification rows should not record values");
check(summary.releaseChannelPostEditOperatorReceiptReady === true, "release proof bundle should include ready release-channel post-edit operator receipt");
check(summary.releaseChannelPostEditOperatorReceiptRowCount === summary.releaseChannelPostEditOperatorReceiptRows.length, "release proof bundle post-edit operator receipt row count should match rows");
check(summary.releaseChannelPostEditOperatorReceiptRowCount === 7, "release proof bundle post-edit operator receipt should include seven rows");
check(summary.releaseChannelPostEditOperatorReceiptRows.every((row) => row.ready === true && row.valueRecorded === false), "release proof bundle post-edit operator receipt rows should be ready and value-free");
check(summary.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Edit target"), "release proof bundle post-edit operator receipt should include edit target");
check(
  summary.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Recommended strict proof chain" && row.command === recommendedPrivateEditOperatorProofCommand),
  "release proof bundle post-edit operator receipt should include the recommended strict proof chain"
);
check(summary.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Release doctor proof" && row.command === "npm run release:doctor"), "release proof bundle post-edit operator receipt should include release doctor proof refresh");
check(summary.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Current blocker refresh" && row.command === "npm run release:current-blocker"), "release proof bundle post-edit operator receipt should include current-blocker refresh");
check(summary.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Next-actions refresh" && row.command === "npm run release:next-actions"), "release proof bundle post-edit operator receipt should include next-actions refresh");
check(summary.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Hard-gate boundary" && row.command === hardExternalGateCommand), "release proof bundle post-edit operator receipt should include hard-gate boundary");
check(summary.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Value redaction"), "release proof bundle post-edit operator receipt should include value redaction");
check(
  summary.releaseChannelPostEditOperatorReceiptRecommendedProofCommand === recommendedPrivateEditOperatorProofCommand,
  "release proof bundle post-edit operator receipt should mirror the recommended strict proof chain"
);
check(
  summary.releaseChannelPostEditOperatorReceiptRecommendedProofCommandRole === "recommended strict-first proof chain after replacing the four private release-channel placeholders",
  "release proof bundle post-edit operator receipt should describe the recommended strict proof chain"
);
check(
  summary.releaseChannelPostEditOperatorReceiptRecommendedProofCommandValueRecorded === false,
  "release proof bundle post-edit operator receipt recommended proof chain should be value-free"
);
check(summary.releaseChannelPostEditOperatorReceiptProofCommand === "npm run release:doctor", "release proof bundle post-edit operator receipt should keep release doctor as proof command");
check(summary.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand === "npm run release:current-blocker", "release proof bundle post-edit operator receipt should keep current-blocker as blocker refresh command");
check(summary.releaseChannelPostEditOperatorReceiptNextActionsCommand === "npm run release:next-actions", "release proof bundle post-edit operator receipt should keep next-actions as refresh command");
check(summary.releaseChannelPostEditOperatorReceiptHardGateCommand === hardExternalGateCommand, "release proof bundle post-edit operator receipt should keep hard-gate command");
check(summary.releaseChannelPostEditOperatorReceiptValueRecorded === false, "release proof bundle post-edit operator receipt should not record values");
check(summary.postEditProofSequenceReceiptReady === true, "release proof bundle should include ready post-edit proof sequence receipt");
check(summary.postEditProofSequenceReceiptRowCount === summary.postEditProofSequenceReceiptRows.length, "release proof bundle post-edit proof sequence row count should match rows");
check(summary.postEditProofSequenceReceiptRowCount === 8, "release proof bundle post-edit proof sequence should include eight rows");
check(summary.postEditProofSequenceReceiptRows.every((row) => row.ready === true && row.valueRecorded === false), "release proof bundle post-edit proof sequence rows should be ready and value-free");
check(summary.postEditProofSequenceReceiptRows.every((row) => typeof row.expectedEvidence === "string" && row.expectedEvidence.length > 0), "release proof bundle post-edit proof sequence rows should include expected evidence");
check(summary.postEditProofSequenceReceiptRows.every((row) => typeof row.sourceField === "string" && row.sourceField.length > 0), "release proof bundle post-edit proof sequence rows should include source fields");
check(
  summary.postEditProofSequenceReceiptRows.some(
    (row) => row.step === "Private value edit" && row.command === `manual edit ${summary.currentEnvEditTarget}`
  ),
  "release proof bundle post-edit proof sequence should include private value edit"
);
check(
  summary.postEditProofSequenceReceiptRows.some((row) => row.step === "Recommended strict proof chain" && row.command === recommendedPrivateEditOperatorProofCommand),
  "release proof bundle post-edit proof sequence should include the recommended strict proof chain"
);
check(summary.postEditProofSequenceReceiptRows.some((row) => row.step === "Release doctor proof" && row.command === "npm run release:doctor"), "release proof bundle post-edit proof sequence should include release doctor proof");
check(summary.postEditProofSequenceReceiptRows.some((row) => row.step === "Current-blocker refresh" && row.command === "npm run release:current-blocker"), "release proof bundle post-edit proof sequence should include current-blocker refresh");
check(summary.postEditProofSequenceReceiptRows.some((row) => row.step === "Next-actions refresh" && row.command === "npm run release:next-actions"), "release proof bundle post-edit proof sequence should include next-actions refresh");
check(summary.postEditProofSequenceReceiptRows.some((row) => row.step === "Proof bundle refresh" && row.command === "npm run release:proof-bundle"), "release proof bundle post-edit proof sequence should include proof-bundle refresh");
check(summary.postEditProofSequenceReceiptRows.some((row) => row.step === "Progress refresh" && row.command === "npm run release:progress-smoke"), "release proof bundle post-edit proof sequence should include progress refresh");
check(summary.postEditProofSequenceReceiptRows.some((row) => row.step === "Hard-gate boundary" && row.command === hardExternalGateCommand), "release proof bundle post-edit proof sequence should include hard-gate boundary");
check(
  summary.postEditProofSequenceReceiptRecommendedProofCommand === recommendedPrivateEditOperatorProofCommand,
  "release proof bundle post-edit proof sequence should mirror the recommended strict proof chain"
);
check(
  summary.postEditProofSequenceReceiptRecommendedProofCommandValueRecorded === false,
  "release proof bundle post-edit proof sequence recommended proof chain should be value-free"
);
check(summary.postEditProofSequenceReceiptDoctorCommand === "npm run release:doctor", "release proof bundle post-edit proof sequence should keep release doctor command");
check(summary.postEditProofSequenceReceiptCurrentBlockerCommand === "npm run release:current-blocker", "release proof bundle post-edit proof sequence should keep current-blocker command");
check(summary.postEditProofSequenceReceiptNextActionsCommand === "npm run release:next-actions", "release proof bundle post-edit proof sequence should keep next-actions command");
check(summary.postEditProofSequenceReceiptProofBundleCommand === "npm run release:proof-bundle", "release proof bundle post-edit proof sequence should keep proof-bundle command");
check(summary.postEditProofSequenceReceiptProgressCommand === "npm run release:progress-smoke", "release proof bundle post-edit proof sequence should keep progress-smoke command");
check(summary.postEditProofSequenceReceiptHardGateCommand === hardExternalGateCommand, "release proof bundle post-edit proof sequence should keep hard-gate command");
check(summary.postEditProofSequenceReceiptValueRecorded === false, "release proof bundle post-edit proof sequence should not record values");
check(summary.doctorPostEditProofSourceArtifact === "External next actions", "release proof bundle should identify external next-actions as the doctor post-edit proof mirror source");
check(summary.doctorPostEditProofSourcePath === relative(externalNextActionsPath), "release proof bundle should include the external next-actions doctor post-edit proof source path");
check(summary.doctorPostEditProofSourceReady === true, "release proof bundle should report ready external next-actions doctor post-edit proof source evidence");
check(summary.doctorPostEditProofNextActionsReady === true, "release proof bundle should report ready next-actions doctor post-edit proof mirror");
check(summary.doctorPostEditProofDoctorSourceArtifact === "Release doctor", "release proof bundle should keep the release doctor as the original post-edit proof source");
check(typeof summary.doctorPostEditProofDoctorSourcePath === "string" && summary.doctorPostEditProofDoctorSourcePath.length > 0, "release proof bundle should include the release doctor post-edit proof source path");
check(summary.doctorPostEditProofDoctorReportReady === true, "release proof bundle should mirror release doctor post-edit proof readiness");
check(typeof summary.doctorPostEditProofCurrentActionId === "string" && summary.doctorPostEditProofCurrentActionId.length > 0, "release proof bundle should include doctor post-edit proof current action id");
check(typeof summary.doctorPostEditProofCurrentActionLabel === "string" && summary.doctorPostEditProofCurrentActionLabel.length > 0, "release proof bundle should include doctor post-edit proof current action label");
check(summary.doctorPostEditProofCommand === recommendedPrivateEditOperatorProofCommand, "release proof bundle should mirror the doctor post-edit proof command from next-actions");
check(typeof summary.doctorPostEditProofRole === "string" && summary.doctorPostEditProofRole.length > 0, "release proof bundle should include doctor post-edit proof role");
check(summary.doctorPostEditProofMatchesRecommended === true, "release proof bundle doctor post-edit proof should match the recommended operator proof chain");
check(summary.doctorPostEditProofMirrorsNextActions === true, "release proof bundle doctor post-edit proof should mirror next-actions");
check(summary.doctorPostEditProofValueRecorded === false, "release proof bundle doctor post-edit proof should not record values");
check(summary.doctorPostEditProofClaimedExternalDistribution === false, "release proof bundle doctor post-edit proof should not claim external distribution");
check(summary.currentRequiredKeyCount === summary.currentRequiredKeys.length, "release proof bundle current required key count should match names");
check(summary.currentPlaceholderKeyCount === summary.currentPlaceholderKeys.length, "release proof bundle current placeholder key count should match names");
check(summary.currentEnvSummaryValueRecorded === false, "release proof bundle current env summary should not record values");
check(Number.isInteger(summary.proofArtifactCount), "release proof bundle should include proof artifact count");
check(Number.isInteger(summary.proofArtifactPresentCount), "release proof bundle should include present proof artifact count");
check(Number.isInteger(summary.proofArtifactMissingCount), "release proof bundle should include missing proof artifact count");
check(summary.proofArtifactCount === summary.proofArtifacts.length, "release proof bundle proof artifact count should match rows");
check(summary.proofArtifactMissingCount === summary.proofArtifacts.filter((artifact) => !artifact.present).length, "release proof bundle missing count should match rows");
check(Array.isArray(summary.proofArtifacts) && summary.proofArtifacts.length >= 20, "release proof bundle should include proof artifact rows");
check(summary.proofArtifacts.some((artifact) => artifact.label === "External next actions"), "release proof bundle should include external next-actions artifact");
check(summary.proofArtifacts.some((artifact) => artifact.label === "External distribution gate"), "release proof bundle should include external distribution gate artifact");
check(summary.proofArtifacts.some((artifact) => artifact.label === "Distribution private inputs"), "release proof bundle should include private input artifact");
check(summary.proofArtifacts.some((artifact) => artifact.label === "Distribution-channel QA"), "release proof bundle should include distribution-channel QA artifact");
check(summary.proofArtifacts.some((artifact) => artifact.label === "Developer ID signing"), "release proof bundle should include Developer ID signing artifact");
check(summary.proofArtifacts.some((artifact) => artifact.label === "Notarization"), "release proof bundle should include notarization artifact");
check(summary.proofArtifacts.some((artifact) => artifact.label === "Notarized Gatekeeper"), "release proof bundle should include notarized Gatekeeper artifact");
check(summary.proofArtifacts.every((artifact) => artifact.valueRecorded === false), "release proof bundle artifact rows should not record values");
check(Array.isArray(summary.gateRequirementRows), "release proof bundle should include gate requirement rows");
check(summary.gateRequirementRows.every((row) => row.valueRecorded === false), "release proof bundle gate requirement rows should not record values");
check(summary.localEnvInput?.valueRecorded === false, "release proof bundle local env loader should not record values");
check(summary.localEnvValueRecorded === false, "release proof bundle should not record local env values");
check(summary.privateValuesRecorded === false, "release proof bundle should not record private values");
check(summary.releaseUrlValueRecorded === false, "release proof bundle should not record release URL values");
check(summary.supportUrlValueRecorded === false, "release proof bundle should not record support URL values");
check(summary.feedValueRecorded === false, "release proof bundle should not record feed values");
check(summary.credentialValueRecorded === false, "release proof bundle should not record credential values");
check(summary.tokenValueRecorded === false, "release proof bundle should not record token values");
check(summary.channelValueRecorded === false, "release proof bundle should not record channel values");
check(summary.developerIdIdentityValueRecorded === false, "release proof bundle should not record Developer ID identity values");
check(summary.networkProbeAttempted === false, "release proof bundle should not probe remote channels");
check(summary.releaseUploadAttempted === false, "release proof bundle should not upload releases");
check(summary.notarySubmissionAttemptedByThisProofBundle === false, "release proof bundle should not submit to Apple notary services");
check(summary.signingAttemptedByThisProofBundle === false, "release proof bundle should not sign artifacts");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "release proof bundle should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "release proof bundle should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "release proof bundle should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "release proof bundle should not claim auto-update");
check(summary.releaseGateClaimedManualQaApproval === false, "release proof bundle should not claim manual QA approval");
check(summary.releaseGateClaimedExternalDistribution === false, "release proof bundle should not claim external distribution completion");
check(markdown.includes("External Proof Bundle"), "release proof bundle Markdown should include title");
check(markdown.includes("Proof Artifacts"), "release proof bundle Markdown should include proof artifact rows");
check(markdown.includes("Gate Requirements"), "release proof bundle Markdown should include gate requirement rows");
check(markdown.includes("Current required keys:"), "release proof bundle Markdown should include current required key summary");
check(markdown.includes("Current placeholder keys:"), "release proof bundle Markdown should include current placeholder key summary");
check(markdown.includes("Current env edit target:"), "release proof bundle Markdown should include current env edit target");
check(markdown.includes("Current placeholder remediation rows:"), "release proof bundle Markdown should include current placeholder remediation summary");
check(markdown.includes("Current Proof Checklist Rows"), "release proof bundle Markdown should include current proof checklist rows");
check(markdown.includes("Current Action Checklist Rows"), "release proof bundle Markdown should include current action checklist rows");
check(markdown.includes("Current Command Verification Rows"), "release proof bundle Markdown should include current command verification rows");
check(markdown.includes("Release-channel post-edit operator receipt ready:"), "release proof bundle Markdown should include release-channel post-edit operator receipt readiness");
check(markdown.includes("Release-channel post-edit operator recommended proof chain:"), "release proof bundle Markdown should include release-channel post-edit operator recommended proof chain");
check(markdown.includes("Release-Channel Post-Edit Operator Receipt"), "release proof bundle Markdown should include release-channel post-edit operator receipt table");
check(markdown.includes("operator action"), "release proof bundle Markdown should include post-edit operator action guidance");
check(markdown.includes("Post-edit proof sequence receipt ready:"), "release proof bundle Markdown should include post-edit proof sequence receipt readiness");
check(markdown.includes("Post-edit proof sequence recommended proof chain:"), "release proof bundle Markdown should include post-edit proof sequence recommended proof chain");
check(markdown.includes("Post-Edit Proof Sequence Receipt"), "release proof bundle Markdown should include post-edit proof sequence receipt table");
check(markdown.includes("expected evidence"), "release proof bundle Markdown should include post-edit proof sequence expected evidence");
check(markdown.includes("Doctor post-edit proof command:"), "release proof bundle Markdown should include doctor post-edit proof command");
check(markdown.includes("Doctor post-edit proof matches recommended:"), "release proof bundle Markdown should include doctor post-edit proof recommended match");
check(markdown.includes("Release Doctor Post-Edit Proof Mirror"), "release proof bundle Markdown should include doctor post-edit proof mirror section");
check(markdown.includes("Mirrors next-actions:"), "release proof bundle Markdown should include next-actions mirror posture");
check(markdown.includes("Current command sequence:"), "release proof bundle Markdown should include current command sequence summary");
check(markdown.includes("Hard external distribution gate: `npm run release:external-check`"), "release proof bundle Markdown should keep hard gate authoritative");
check(markdown.includes("Private values recorded: no"), "release proof bundle Markdown should state value redaction");
check(!/https?:\/\//i.test(markdown), "release proof bundle Markdown should not include public or private URL values");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of sensitiveEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "release proof bundle should not include sensitive private environment values");
}

if (failures.length > 0) {
  fail("External proof bundle validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge external proof bundle passed.");
console.log(`- Markdown: ${relative(proofBundleMarkdownPath)}`);
console.log(`- JSON: ${relative(proofBundleJsonPath)}`);
console.log(`- Proof bundle ready: ${summary.proofBundleReady ? "yes" : "no"}`);
console.log(`- Completion stage: ${summary.completionStage}`);
console.log(`- Source evidence ready: ${summary.sourceEvidenceReady ? "yes" : "no"}`);
console.log(`- Local release ready: ${summary.localReleaseReady ? "yes" : "no"}`);
console.log(`- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}`);
console.log(`- External hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- Hard gate would fail: ${summary.hardGateWouldFail ? "yes" : "no"}`);
console.log(`- Proof artifacts present: ${summary.proofArtifactPresentCount}/${summary.proofArtifactCount}`);
console.log(`- Gate requirements ready: ${summary.gateRequirementReadyCount}/${summary.gateRequirementTotal}`);
console.log(`- Current next command: ${summary.currentNextCommand}`);
console.log(`- Current first blocker: ${summary.currentFirstBlocker}`);
console.log(`- Current required keys: ${summary.currentRequiredKeyCount} (${summary.currentRequiredKeySummary})`);
console.log(`- Current placeholder keys: ${summary.currentPlaceholderKeyCount} (${summary.currentPlaceholderKeySummary})`);
console.log(`- Current placeholder edit locations: ${summary.currentPlaceholderEditLocationCount} (${summary.currentPlaceholderEditLocationSummary})`);
console.log(`- Current env edit target: ${summary.currentEnvEditTarget}`);
console.log(`- Current env edit rows: ${summary.currentEnvEditRowsCount} (${summary.currentEnvEditRowsSummary})`);
console.log(`- Current placeholder remediation rows: ${summary.currentPlaceholderRemediationRowCount} (${summary.currentPlaceholderRemediationRowSummary})`);
console.log(`- Current proof checklist rows: ${summary.currentProofChecklistRowCount} (${summary.currentProofChecklistRowSummary})`);
console.log(`- Current action checklist rows: ${summary.currentActionChecklistCount} (${summary.currentActionChecklistSummary})`);
console.log(`- Current rerun command: ${summary.currentRerunCommand}`);
console.log(`- Current command sequence: ${summary.currentCommandSequenceCount} (${summary.currentCommandSequenceSummary})`);
console.log(`- Current command verification rows: ${summary.currentCommandVerificationRowCount} (${summary.currentCommandVerificationRowSummary})`);
console.log(`- Release-channel post-edit operator receipt ready: ${summary.releaseChannelPostEditOperatorReceiptReady ? "yes" : "no"}`);
console.log(`- Release-channel post-edit operator receipt rows: ${summary.releaseChannelPostEditOperatorReceiptRowCount} (${summary.releaseChannelPostEditOperatorReceiptSummary})`);
console.log(`- Release-channel post-edit operator recommended proof chain: ${summary.releaseChannelPostEditOperatorReceiptRecommendedProofCommand}`);
console.log(`- Release-channel post-edit operator proof command: ${summary.releaseChannelPostEditOperatorReceiptProofCommand}`);
console.log(`- Release-channel post-edit operator blocker refresh: ${summary.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand}`);
console.log(`- Release-channel post-edit operator next-actions refresh: ${summary.releaseChannelPostEditOperatorReceiptNextActionsCommand}`);
console.log(`- Post-edit proof sequence receipt ready: ${summary.postEditProofSequenceReceiptReady ? "yes" : "no"}`);
console.log(`- Post-edit proof sequence rows: ${summary.postEditProofSequenceReceiptRowCount} (${summary.postEditProofSequenceReceiptSummary})`);
console.log(`- Post-edit proof sequence recommended proof chain: ${summary.postEditProofSequenceReceiptRecommendedProofCommand}`);
console.log(`- Post-edit proof sequence doctor command: ${summary.postEditProofSequenceReceiptDoctorCommand}`);
console.log(`- Post-edit proof sequence current-blocker command: ${summary.postEditProofSequenceReceiptCurrentBlockerCommand}`);
console.log(`- Post-edit proof sequence next-actions command: ${summary.postEditProofSequenceReceiptNextActionsCommand}`);
console.log(`- Post-edit proof sequence proof-bundle command: ${summary.postEditProofSequenceReceiptProofBundleCommand}`);
console.log(`- Post-edit proof sequence progress command: ${summary.postEditProofSequenceReceiptProgressCommand}`);
console.log(`- Post-edit proof sequence hard-gate command: ${summary.postEditProofSequenceReceiptHardGateCommand}`);
console.log(`- Doctor post-edit proof source ready: ${summary.doctorPostEditProofSourceReady ? "yes" : "no"}`);
console.log(`- Doctor post-edit proof command: ${summary.doctorPostEditProofCommand}`);
console.log(`- Doctor post-edit proof matches recommended: ${summary.doctorPostEditProofMatchesRecommended ? "yes" : "no"}`);
console.log(`- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, local env values, private beats, or real user audio");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
