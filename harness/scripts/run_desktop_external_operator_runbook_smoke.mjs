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
const externalRemediationPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-remediation.json`);
const externalGatePath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-distribution-gate.json`);
const manualQaPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-manual-qa.json`);
const privateInputsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-private-inputs.json`);
const distributionEnvTemplateArtifactPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-env-template.json`);
const externalNextActionsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-next-actions.json`);
const distributionTemplatePath = path.join(root, "harness", "templates", "distribution-private-inputs.env.example");
const operatorRunbookMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-operator-runbook.md`);
const operatorRunbookJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-operator-runbook.json`);
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
  console.error("GrooveForge external operator runbook smoke failed:");
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

async function readTextIfExists(filePath) {
  if (!existsSync(filePath)) {
    return "";
  }
  return readFile(filePath, "utf8");
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

function parseTemplateKeys(templateText) {
  return unique([...templateText.matchAll(/^([A-Z0-9_]+)=/gm)].map((match) => match[1]));
}

function sensitiveEnvironmentValues() {
  return sensitivePrivateKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function gateRequirementReady(externalGate, label) {
  return (externalGate?.requirements ?? []).some((requirement) => requirement.label === label && requirement.ready === true);
}

function phaseFromGroup(group, index) {
  return {
    order: index + 1,
    id: group.id,
    label: group.label,
    ready: group.ready === true,
    requiredKeys: group.requiredKeys ?? [],
    evidence: group.evidence ?? [],
    prerequisiteCommands: group.prerequisiteCommands ?? [],
    operatorActions: group.operatorActions ?? [],
    rerunCommands: group.rerunCommands ?? [],
    blockers: group.blockers ?? [],
    valueRecorded: false
  };
}

function fallbackPhases() {
  return [
    {
      order: 1,
      id: "regenerate-local-release-evidence",
      label: "Regenerate local release evidence",
      ready: false,
      requiredKeys: [],
      evidence: [evidence(completionStatusPath, "Completion status"), evidence(externalRemediationPath, "External remediation")],
      prerequisiteCommands: ["npm run release:check"],
      operatorActions: ["Run the local release gate to create completion, remediation, manual QA, and hard-gate evidence."],
      rerunCommands: ["npm run release:check"],
      blockers: ["Completion status and external remediation artifacts are missing."],
      valueRecorded: false
    },
    {
      order: 2,
      id: "fill-ignored-private-inputs",
      label: "Fill ignored private input file",
      ready: false,
      requiredKeys: distributionPrivateInputKeys,
      evidence: [evidence(distributionTemplatePath, "Distribution private inputs template")],
      prerequisiteCommands: ["npm run desktop:distribution-env-template-smoke"],
      operatorActions: ["Copy the template into an ignored local env file and fill only local private values."],
      rerunCommands: ["npm run desktop:distribution-private-inputs-smoke"],
      blockers: ["Private distribution input evidence is missing."],
      valueRecorded: false
    },
    {
      order: 3,
      id: "run-hard-external-gate",
      label: "Run hard external distribution gate",
      ready: false,
      requiredKeys: distributionPrivateInputKeys,
      evidence: [evidence(externalGatePath, "External distribution gate")],
      prerequisiteCommands: ["npm run release:check"],
      operatorActions: ["Run the hard external gate only after every remediation phase is ready."],
      rerunCommands: ["npm run release:external-check"],
      blockers: ["External distribution hard gate evidence is missing."],
      valueRecorded: false
    }
  ];
}

function commandStep(order, label, command, evidencePaths, note) {
  return {
    order,
    label,
    command,
    evidence: evidencePaths,
    note,
    valueRecorded: false
  };
}

function buildCurrentActionSummary(externalNextActions) {
  const currentRequiredKeys = stringArrayValue(externalNextActions?.currentRequiredKeys);
  const currentPlaceholderKeys = stringArrayValue(externalNextActions?.currentPlaceholderKeys);
  const currentPlaceholderEditLocations = valueFreeObjectRows(externalNextActions?.currentPlaceholderEditLocations);
  const currentEnvEditTemplate = valueFreeObjectRows(externalNextActions?.currentEnvEditTemplate);
  const currentEnvEditRows = valueFreeObjectRows(externalNextActions?.currentEnvEditRows);
  const currentPlaceholderRemediationRows = valueFreeObjectRows(externalNextActions?.currentPlaceholderRemediationRows);
  const currentProofChecklistRows = valueFreeObjectRows(externalNextActions?.currentProofChecklistRows);
  const currentCommandVerificationRows = valueFreeObjectRows(externalNextActions?.currentCommandVerificationRows);
  return {
    currentActionSourceReady: Boolean(externalNextActions),
    currentActionSourcePath: relative(externalNextActionsPath),
    currentFocus: textValue(externalNextActions?.currentFocus),
    currentActionLabel: textValue(externalNextActions?.currentActionLabel, "No pending priority action"),
    currentNextCommand: textValue(externalNextActions?.currentNextCommand),
    currentFirstBlocker: textValue(externalNextActions?.currentFirstBlocker),
    currentOperatorAction: textValue(externalNextActions?.currentOperatorAction),
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
    currentRerunCommand: textValue(externalNextActions?.currentRerunCommand),
    currentCommandSequenceCount: integerValue(externalNextActions?.currentCommandSequenceCount),
    currentCommandSequenceSummary: textValue(externalNextActions?.currentCommandSequenceSummary),
    currentCommandVerificationRowCount: integerValue(externalNextActions?.currentCommandVerificationRowCount),
    currentCommandVerificationRowSummary: textValue(externalNextActions?.currentCommandVerificationRowSummary),
    currentCommandVerificationRows,
    currentActionValueRecorded: false
  };
}

function buildCommandSequence(summarySources) {
  const manualDigest = summarySources.manualQa?.manualQaChecklistSha256;
  return [
    commandStep(1, "Regenerate local evidence", "npm run release:check", [relative(completionStatusPath), relative(externalRemediationPath)], "Creates the local evidence chain, including desktop project IO status, without private value output."),
    commandStep(2, "Prepare ignored private inputs", "copy template to ignored local env file", [relative(distributionTemplatePath)], "Use key names from the template; do not commit the filled file."),
    commandStep(3, "Validate private input posture", "npm run desktop:distribution-private-inputs-smoke", [relative(privateInputsPath)], "Records key readiness and blockers only."),
    commandStep(4, "Sign isolated release copy", "npm run desktop:developer-id-signing-smoke", ["build/desktop/GrooveForge-<platform>-<arch>-developer-id-signing.json"], "Requires a local Developer ID Application identity selector."),
    commandStep(5, "Notarize and staple isolated artifact", "npm run desktop:notarization-smoke", ["build/desktop/GrooveForge-<platform>-<arch>-notarization.json"], "Requires explicit notary submit signal and bounded credentials."),
    commandStep(6, "Assess notarized Gatekeeper posture", "npm run desktop:notarized-gatekeeper-smoke", ["build/desktop/GrooveForge-<platform>-<arch>-notarized-gatekeeper.json"], "Uses the stapled isolated DMG and local Gatekeeper assessment."),
    commandStep(7, "Regenerate signed update metadata", "npm run desktop:update-metadata-artifacts-smoke && npm run desktop:auto-update-readiness-smoke", ["build/desktop/GrooveForge-<platform>-<arch>-auto-update-readiness.json"], "Prefers the notarized isolated DMG when ready and publishes nothing."),
    commandStep(
      8,
      "Complete manual QA digest",
      "npm run desktop:distribution-manual-qa-smoke",
      [relative(manualQaPath)],
      manualDigest ? `Use current checklist SHA-256 ${manualDigest} only after manual QA is complete.` : "Manual QA digest is unavailable until the manual QA smoke runs."
    ),
    commandStep(9, "Refresh channel QA and handoff evidence", "npm run desktop:distribution-channel-qa-smoke && npm run desktop:distribution-handoff-smoke && npm run desktop:distribution-bundle-manifest-smoke", ["build/desktop/GrooveForge-<platform>-<arch>-distribution-channel-qa.json"], "Rechecks channel metadata, manual approval digest, handoff, and bundle manifest evidence."),
    commandStep(10, "Refresh completion status", "npm run desktop:external-remediation-smoke && npm run desktop:completion-status-smoke && npm run desktop:external-operator-runbook-smoke", [relative(operatorRunbookJsonPath)], "Updates the final value-free status, desktop project IO readiness, and operator runbook."),
    commandStep(11, "Run hard external gate", "npm run release:external-check", [relative(externalGatePath)], "This remains the only local command that may prove external distribution readiness.")
  ];
}

function formatPhaseRows(phases) {
  return phases
    .map((phase) => `| ${phase.order} | ${phase.label} | ${phase.ready ? "yes" : "no"} | ${phase.requiredKeys.length > 0 ? phase.requiredKeys.join(", ") : "none"} | ${phase.rerunCommands.join(", ") || "none"} |`)
    .join("\n");
}

function formatCommandRows(commandSequence) {
  return commandSequence.map((step) => `| ${step.order} | ${step.label} | \`${step.command}\` | ${step.note} |`).join("\n");
}

function formatEvidenceRows(evidenceChecklist) {
  return evidenceChecklist.map((item) => `| ${item.label} | ${item.present ? "yes" : "no"} | ${item.path} |`).join("\n");
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

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} External Operator Runbook

## Status

- Operator runbook ready: ${summary.operatorRunbookReady ? "yes" : "no"}
- Completion stage: ${summary.completionStage}
- Desktop project IO evidence ready: ${summary.desktopProjectIoEvidenceReady ? "yes" : "no"}
- External distribution hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}
- Pending remediation groups: ${summary.pendingRemediationCount}
- Manual QA checklist digest available: ${summary.manualQaChecklistSha256 ? "yes" : "no"}
- Required private input keys: ${summary.requiredPrivateInputKeys.length}
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
- Apple notary submission attempted by this runbook: no
- Signing attempted by this runbook: no

## Current Action

- Source artifact: ${summary.currentActionSourcePath}
- Current focus: ${summary.currentFocus}
- Current action: ${summary.currentActionLabel}
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

## Command Sequence

| order | phase | command or action | note |
|---:|---|---|---|
${formatCommandRows(summary.commandSequence)}

## Remediation Phases

| order | phase | ready | required keys | rerun commands |
|---:|---|---:|---|---|
${formatPhaseRows(summary.operatorPhases)}

## Evidence Checklist

| artifact | present | path |
|---|---:|---|
${formatEvidenceRows(summary.evidenceChecklist)}

## Manual QA Digest

- Current checklist SHA-256: ${summary.manualQaChecklistSha256 ?? "unavailable"}
- Approval key name: GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256
- Approval signal key name: GROOVEFORGE_DISTRIBUTION_QA_APPROVED

## Runbook Blockers

${formatBlockers(summary.operatorRunbookBlockers)}

## Hard Gate

Hard gate remains \`npm run release:external-check\`. This runbook does not replace or weaken that command.

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, local env values, private beats, and real user audio are not recorded.

## Not Claimed

This runbook does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function createRunbookSummary() {
  const completionStatus = await readJsonIfExists(completionStatusPath);
  const externalRemediation = await readJsonIfExists(externalRemediationPath);
  const externalGate = await readJsonIfExists(externalGatePath);
  const manualQa = await readJsonIfExists(manualQaPath);
  const privateInputs = await readJsonIfExists(privateInputsPath);
  const distributionEnvTemplateArtifact = await readJsonIfExists(distributionEnvTemplateArtifactPath);
  const externalNextActions = await readJsonIfExists(externalNextActionsPath);
  const templateText = await readTextIfExists(distributionTemplatePath);
  const requiredPrivateInputKeys = parseTemplateKeys(templateText);
  const completionStatusDesktopProjectIoReady = completionStatus?.desktopProjectIoEvidenceReady === true;
  const completionStatusPkgPayloadProjectIoReady = completionStatus?.pkgPayloadProjectIoReady === true;
  const externalGateDesktopProjectIoReady = gateRequirementReady(externalGate, "Desktop project IO evidence ready");
  const externalGatePkgPayloadProjectIoReady = gateRequirementReady(externalGate, "PKG payload project IO evidence ready");
  const desktopProjectIoEvidenceReady =
    completionStatusDesktopProjectIoReady &&
    completionStatusPkgPayloadProjectIoReady &&
    externalGateDesktopProjectIoReady &&
    externalGatePkgPayloadProjectIoReady;
  const operatorPhases =
    Array.isArray(externalRemediation?.remediationGroups) && externalRemediation.remediationGroups.length > 0
      ? externalRemediation.remediationGroups.map(phaseFromGroup)
      : fallbackPhases();
  const evidenceChecklist = [
    evidence(completionStatusPath, "Completion status"),
    evidence(completionStatusPath, "Desktop project IO status evidence"),
    evidence(completionStatusPath, "PKG payload project IO status evidence"),
    evidence(externalRemediationPath, "External remediation"),
    evidence(externalGatePath, "External distribution gate"),
    evidence(externalGatePath, "Desktop project IO gate requirement"),
    evidence(externalGatePath, "PKG payload project IO gate requirement"),
    evidence(manualQaPath, "Manual QA checklist"),
    evidence(privateInputsPath, "Private inputs"),
    evidence(distributionEnvTemplateArtifactPath, "Distribution env template artifact"),
    evidence(externalNextActionsPath, "External next actions current proof rows"),
    evidence(distributionTemplatePath, "Distribution private inputs template")
  ];
  const sourceEvidenceReady = Boolean(completionStatus) && Boolean(externalRemediation) && Boolean(externalGate) && desktopProjectIoEvidenceReady && requiredPrivateInputKeys.length > 0;
  const phaseBlockers = unique(operatorPhases.flatMap((phase) => phase.blockers));
  const operatorRunbookBlockers = unique([
    ...(sourceEvidenceReady ? [] : ["Operator runbook source evidence is incomplete; run npm run release:check first."]),
    ...(desktopProjectIoEvidenceReady ? [] : ["Desktop project IO evidence is not ready in completion status and external gate evidence."]),
    ...(completionStatusPkgPayloadProjectIoReady ? [] : ["PKG payload project IO evidence is not ready in completion status evidence."]),
    ...(externalGatePkgPayloadProjectIoReady ? [] : ["PKG payload project IO requirement is not ready in external gate evidence."]),
    ...(manualQa?.manualQaChecklistSha256 ? [] : ["Manual QA checklist digest evidence is missing."]),
    ...(requiredPrivateInputKeys.includes("GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256") ? [] : ["Distribution template is missing the manual QA checklist digest key."]),
    ...phaseBlockers
  ]);

  return {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    operatorRunbookMarkdownPath: relative(operatorRunbookMarkdownPath),
    operatorRunbookJsonPath: relative(operatorRunbookJsonPath),
    productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
    runbookScope: "value-free external distribution operator command sequence and evidence checklist",
    completionStage: completionStatus?.completionStage ?? "source evidence incomplete",
    desktopProjectIoEvidenceReady,
    desktopProjectIoEvidence: {
      completionStatusReady: completionStatusDesktopProjectIoReady,
      pkgPayloadProjectIoStatusReady: completionStatusPkgPayloadProjectIoReady,
      externalGateRequirementReady: externalGateDesktopProjectIoReady,
      pkgPayloadProjectIoGateRequirementReady: externalGatePkgPayloadProjectIoReady,
      completionStatusPath: relative(completionStatusPath),
      externalGatePath: relative(externalGatePath),
      valueRecorded: false
    },
    operatorRunbookReady: sourceEvidenceReady,
    externalDistributionGateReady: externalGate?.externalDistributionGateReady === true,
    pendingRemediationCount: externalRemediation?.pendingRemediationCount ?? operatorPhases.filter((phase) => !phase.ready).length,
    manualQaChecklistSha256: manualQa?.manualQaChecklistSha256 ?? null,
    manualQaChecklistDigestAvailable: Boolean(manualQa?.manualQaChecklistSha256),
    manualQaApprovalReady: manualQa?.manualQaApprovalReady === true,
    requiredPrivateInputKeys,
    requiredPrivateInputKeyCount: requiredPrivateInputKeys.length,
    templatePath: relative(distributionTemplatePath),
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
    notarySubmissionAttemptedByThisRunbook: false,
    signingAttemptedByThisRunbook: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedManualQaApproval: false,
    releaseGateClaimedExternalDistribution: false,
    sourceEvidence: {
      completionStatusPresent: Boolean(completionStatus),
      externalRemediationPresent: Boolean(externalRemediation),
      externalGatePresent: Boolean(externalGate),
      externalNextActionsPresent: Boolean(externalNextActions),
      desktopProjectIoEvidenceReady,
      pkgPayloadProjectIoStatusReady: completionStatusPkgPayloadProjectIoReady,
      pkgPayloadProjectIoGateRequirementReady: externalGatePkgPayloadProjectIoReady,
      manualQaPresent: Boolean(manualQa),
      privateInputsPresent: Boolean(privateInputs),
      distributionEnvTemplateArtifactPresent: Boolean(distributionEnvTemplateArtifact),
      templatePresent: templateText.length > 0,
      valueRecorded: false
    },
    evidenceChecklist,
    ...buildCurrentActionSummary(externalNextActions),
    commandSequence: buildCommandSequence({ completionStatus, externalRemediation, externalGate, manualQa, privateInputs }),
    operatorPhases,
    operatorRunbookBlockers
  };
}

const summary = await createRunbookSummary();
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(operatorRunbookJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(operatorRunbookMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "external operator runbook should identify GrooveForge");
check(summary.bundleId === bundleId, `external operator runbook should identify ${bundleId}`);
check(summary.version === packageJson.version, "external operator runbook should match package version");
check(summary.productScope.includes("all-genre direct beat workstation"), "external operator runbook should describe direct beat workstation scope");
check(summary.productScope.includes("sampling optional"), "external operator runbook should keep sampling optional");
check(summary.desktopProjectIoEvidenceReady === true, "external operator runbook should include ready desktop project IO evidence");
check(summary.desktopProjectIoEvidence?.completionStatusReady === true, "external operator runbook should read desktop project IO readiness from completion status");
check(summary.desktopProjectIoEvidence?.pkgPayloadProjectIoStatusReady === true, "external operator runbook should read PKG payload project IO readiness from completion status");
check(summary.desktopProjectIoEvidence?.externalGateRequirementReady === true, "external operator runbook should read desktop project IO readiness from the external gate");
check(summary.desktopProjectIoEvidence?.pkgPayloadProjectIoGateRequirementReady === true, "external operator runbook should read PKG payload project IO readiness from the external gate");
check(summary.desktopProjectIoEvidence?.valueRecorded === false, "external operator runbook desktop project IO evidence should not record values");
check(Array.isArray(summary.commandSequence) && summary.commandSequence.length >= 10, "external operator runbook should include a command sequence");
check(summary.commandSequence.some((step) => step.command === "npm run release:external-check"), "external operator runbook should end with the hard gate command");
check(Array.isArray(summary.operatorPhases) && summary.operatorPhases.length >= 3, "external operator runbook should include operator phases");
check(summary.evidenceChecklist.some((item) => item.label === "Desktop project IO status evidence"), "external operator runbook should include desktop project IO status evidence");
check(summary.evidenceChecklist.some((item) => item.label === "PKG payload project IO status evidence"), "external operator runbook should include PKG payload project IO status evidence");
check(summary.evidenceChecklist.some((item) => item.label === "Desktop project IO gate requirement"), "external operator runbook should include desktop project IO gate evidence");
check(summary.evidenceChecklist.some((item) => item.label === "PKG payload project IO gate requirement"), "external operator runbook should include PKG payload project IO gate evidence");
check(summary.evidenceChecklist.some((item) => item.label === "External next actions current proof rows"), "external operator runbook should include external next-actions evidence");
check(summary.operatorPhases.every((phase) => phase.valueRecorded === false), "external operator phases should not record values");
check(summary.commandSequence.every((step) => step.valueRecorded === false), "external operator commands should not record values");
check(summary.evidenceChecklist.every((item) => item.valueRecorded === false), "external operator evidence checklist should not record values");
check(summary.sourceEvidence.valueRecorded === false, "external operator source evidence should not record values");
check(summary.sourceEvidence.desktopProjectIoEvidenceReady === true, "external operator source evidence should include ready desktop project IO evidence");
check(summary.currentActionValueRecorded === false, "external operator current action summary should not record values");
check(Array.isArray(summary.currentEnvEditRows), "external operator runbook should expose current env edit rows");
check(summary.currentEnvEditRows.every((row) => row.valueRecorded === false), "external operator current env edit rows should not record values");
check(Array.isArray(summary.currentProofChecklistRows), "external operator runbook should expose current proof checklist rows");
check(summary.currentProofChecklistRows.every((row) => row.valueRecorded === false), "external operator current proof checklist rows should not record values");
check(Array.isArray(summary.currentCommandVerificationRows), "external operator runbook should expose current command verification rows");
check(summary.currentCommandVerificationRows.every((row) => row.valueRecorded === false), "external operator current command verification rows should not record values");
if (summary.currentActionSourceReady) {
  check(summary.currentNextCommand !== "none", "external operator runbook should mirror the current next command when next-actions evidence exists");
  check(summary.currentProofChecklistRowCount === summary.currentProofChecklistRows.length, "external operator runbook should mirror current proof checklist row count");
  check(summary.currentCommandVerificationRowCount === summary.currentCommandVerificationRows.length, "external operator runbook should mirror current command verification row count");
}
check(summary.requiredPrivateInputKeys.includes("GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256"), "external operator runbook should include manual QA digest key");
check(summary.requiredPrivateInputKeys.includes("GROOVEFORGE_DEVELOPER_ID_IDENTITY"), "external operator runbook should include Developer ID identity key name");
check(summary.manualQaChecklistSha256 === null || /^[a-f0-9]{64}$/.test(summary.manualQaChecklistSha256), "external operator runbook should record only a valid manual QA digest when available");
check(summary.localEnvInput?.valueRecorded === false, "external operator runbook local env loader should not record values");
check(summary.localEnvValueRecorded === false, "external operator runbook should not record local env values");
check(summary.privateValuesRecorded === false, "external operator runbook should not record private values");
check(summary.releaseUrlValueRecorded === false, "external operator runbook should not record release URL values");
check(summary.supportUrlValueRecorded === false, "external operator runbook should not record support URL values");
check(summary.feedValueRecorded === false, "external operator runbook should not record feed values");
check(summary.credentialValueRecorded === false, "external operator runbook should not record credential values");
check(summary.tokenValueRecorded === false, "external operator runbook should not record token values");
check(summary.channelValueRecorded === false, "external operator runbook should not record channel values");
check(summary.developerIdIdentityValueRecorded === false, "external operator runbook should not record Developer ID identity values");
check(summary.networkProbeAttempted === false, "external operator runbook should not probe remote channels");
check(summary.releaseUploadAttempted === false, "external operator runbook should not upload release artifacts");
check(summary.notarySubmissionAttemptedByThisRunbook === false, "external operator runbook should not submit to Apple notary services");
check(summary.signingAttemptedByThisRunbook === false, "external operator runbook should not sign artifacts");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "external operator runbook should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "external operator runbook should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "external operator runbook should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "external operator runbook should not claim auto-update");
check(summary.releaseGateClaimedManualQaApproval === false, "external operator runbook should not claim manual QA approval");
check(summary.releaseGateClaimedExternalDistribution === false, "external operator runbook should not claim external distribution completion");
check(markdown.includes("External Operator Runbook"), "external operator runbook Markdown should include title");
check(markdown.includes("Current Action"), "external operator runbook Markdown should include current action");
check(markdown.includes("Current Edit Guidance"), "external operator runbook Markdown should include current edit guidance");
check(markdown.includes("Current Proof Checklist Rows"), "external operator runbook Markdown should include current proof checklist rows");
check(markdown.includes("Current Command Verification Rows"), "external operator runbook Markdown should include current command verification rows");
check(markdown.includes("Command Sequence"), "external operator runbook Markdown should include command sequence");
check(markdown.includes("Desktop project IO evidence ready:"), "external operator runbook Markdown should include desktop project IO readiness");
check(markdown.includes("Hard gate remains `npm run release:external-check`"), "external operator runbook Markdown should keep the hard gate authoritative");
check(markdown.includes("Private values recorded: no"), "external operator runbook Markdown should state value redaction");
check(!/https?:\/\//i.test(markdown), "external operator runbook should not include public or private URL values");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of sensitiveEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "external operator runbook should not include sensitive private environment values");
}

if (failures.length > 0) {
  fail("External operator runbook validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge external operator runbook smoke passed.");
console.log(`- Markdown: ${relative(operatorRunbookMarkdownPath)}`);
console.log(`- JSON: ${relative(operatorRunbookJsonPath)}`);
console.log(`- Operator runbook ready: ${summary.operatorRunbookReady ? "yes" : "no"}`);
console.log(`- Completion stage: ${summary.completionStage}`);
console.log(`- Desktop project IO evidence ready: ${summary.desktopProjectIoEvidenceReady ? "yes" : "no"}`);
console.log(`- External distribution hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- Pending remediation groups: ${summary.pendingRemediationCount}`);
console.log(`- Manual QA checklist digest available: ${summary.manualQaChecklistDigestAvailable ? "yes" : "no"}`);
console.log(`- Required private input keys: ${summary.requiredPrivateInputKeyCount}`);
console.log(`- Current action source ready: ${summary.currentActionSourceReady ? "yes" : "no"}`);
console.log(`- Current next command: ${summary.currentNextCommand}`);
console.log(`- Current first blocker: ${summary.currentFirstBlocker}`);
console.log(`- Current env edit rows: ${summary.currentEnvEditRowsCount} (${summary.currentEnvEditRowsSummary})`);
console.log(`- Current proof checklist rows: ${summary.currentProofChecklistRowCount} (${summary.currentProofChecklistRowSummary})`);
console.log(`- Current command verification rows: ${summary.currentCommandVerificationRowCount} (${summary.currentCommandVerificationRowSummary})`);
console.log(`- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}`);
console.log("- Private values recorded: no");
if (summary.operatorRunbookBlockers.length > 0) {
  console.log(`- Runbook blockers: ${summary.operatorRunbookBlockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, local env values, private beats, or real user audio");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
