#!/usr/bin/env node

import { spawnSync } from "node:child_process";
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
const sourcePacketStem = "release-external-completion-run-packet-smoke";
const sourcePacketJsonArtifactName = "release-external-completion-run-packet-smoke.json";
const preflightBlockedStem = "release-channel-apply-private-env-preflight-blocked-smoke";
const preflightBlockedJsonArtifactName = "release-channel-apply-private-env-preflight-blocked-smoke.json";
const resumePacketStem = "release-external-completion-resume-packet-smoke";
const resumePacketMarkdownArtifactName = "release-external-completion-resume-packet-smoke.md";
const resumePacketJsonArtifactName = "release-external-completion-resume-packet-smoke.json";
const sourcePacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${sourcePacketStem}.json`);
const preflightBlockedJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${preflightBlockedStem}.json`);
const resumePacketMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${resumePacketStem}.md`);
const resumePacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${resumePacketStem}.json`);
const failures = [];
const releaseChannelPrivateInputTemplateCommand = "npm run release:channel-private-input-template";
const releaseChannelPrivateInputTemplateRole =
  "create the ignored .env.release-channel.local skeleton for the four private release-channel metadata values before preflight";
const releaseChannelApplyPrivateEnvPreflightCommand = "npm run release:channel-apply-private-env-preflight";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
const releaseChannelApplyPrivateEnvProofCommand = "npm run release:channel-apply-private-env-proof";
const releaseChannelApplyPrivateEnvProofRole =
  "run private env preflight, apply only after preflight readiness, strict proof, and completion readout as one value-free operator proof runner";
const releaseChannelSetupWizardCommand = "npm run release:channel-setup-wizard";
const privateEditStrictProofCommand = "npm run release:private-edit-strict-proof";
const privateInputFileKey = "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE";
const defaultPrivateInputFileName = ".env.release-channel.local";
const operatorPrivateInputFileDefaultPath = defaultPrivateInputFileName;
const blockedPrivateInputFilePathMode = "blocked-smoke-isolated-missing-input-file";

const refreshCommands = [
  {
    order: 1,
    command: "npm run release:external-completion-run-packet-smoke",
    role: "refresh the ordered external completion run packet before deriving the current resume point",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:channel-apply-private-env-preflight-blocked-smoke",
    role: "refresh value-free blocked private-env preflight evidence for the current resume point",
    valueRecorded: false
  }
];
const fromExistingRunPacket = process.argv.includes("--from-existing-run-packet");
const activeRefreshCommands = fromExistingRunPacket ? refreshCommands.slice(1) : refreshCommands;

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release external completion resume packet smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function readyLabel(value) {
  return value === true ? "yes" : "no";
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function objectRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object" && !Array.isArray(row)) : [];
}

function valueFreeRows(rows) {
  return objectRows(rows).every((row) => row.valueRecorded === false);
}

function copyCurrentPrivateInputPlaceholderLocationRow(row) {
  return {
    key: textValue(row.key),
    file: textValue(row.file),
    line: integerValue(row.line),
    location: textValue(row.location),
    placeholder: row.placeholder === true,
    valueRecorded: false
  };
}

function copySetupWizardHandoffRow(row) {
  return {
    order: integerValue(row.order),
    action: textValue(row.action),
    command: textValue(row.command),
    target: textValue(row.target),
    ready: row.ready === true,
    expected: textValue(row.expected),
    valueRecorded: false
  };
}

function setupWizardHandoffRowsReady(rows) {
  const commands = rows.map((row) => row.command);
  return (
    rows.length === 6 &&
    rows.every((row) => row.valueRecorded === false) &&
    commands.includes("edit ignored private input file") &&
    commands.includes(releaseChannelApplyPrivateEnvPreflightCommand) &&
    commands.includes(releaseChannelApplyPrivateEnvCommand) &&
    commands.includes("npm run release:channel-live-check-strict") &&
    commands.includes(privateEditStrictProofCommand) &&
    commands.includes("npm run release:current-blocker")
  );
}

function buildSetupWizardSourceFields(sourcePacket) {
  const handoffRows = objectRows(sourcePacket.realSetupWizardOperatorHandoffRows).map(copySetupWizardHandoffRow);
  return {
    realSetupWizardReceiptReady: sourcePacket.realSetupWizardReceiptReady === true,
    realSetupWizardCommand: textValue(sourcePacket.realSetupWizardCommand, releaseChannelSetupWizardCommand),
    realSetupWizardInputReady: sourcePacket.realSetupWizardInputReady === true,
    realSetupWizardLocalEnvFileLoaded: sourcePacket.realSetupWizardLocalEnvFileLoaded === true,
    realSetupWizardPrivateInputFilePresent: sourcePacket.realSetupWizardPrivateInputFilePresent === true,
    realSetupWizardPrivateInputFileLoadedKeyCount: integerValue(
      sourcePacket.realSetupWizardPrivateInputFileLoadedKeyCount
    ),
    realSetupWizardPrivateInputFileLoadedKeySummary: textValue(
      sourcePacket.realSetupWizardPrivateInputFileLoadedKeySummary
    ),
    realSetupWizardPrivateInputFileLocationRowCount: integerValue(
      sourcePacket.realSetupWizardPrivateInputFileLocationRowCount
    ),
    realSetupWizardPrivateInputFilePlaceholderLocationSummary: textValue(
      sourcePacket.realSetupWizardPrivateInputFilePlaceholderLocationSummary
    ),
    realSetupWizardPrivateInputFileInvalidShapeLocationSummary: textValue(
      sourcePacket.realSetupWizardPrivateInputFileInvalidShapeLocationSummary
    ),
    realSetupWizardPrivateInputFileMissingKeyLocationSummary: textValue(
      sourcePacket.realSetupWizardPrivateInputFileMissingKeyLocationSummary
    ),
    realSetupWizardOperatorHandoffReady:
      sourcePacket.realSetupWizardOperatorHandoffReady === true && setupWizardHandoffRowsReady(handoffRows),
    realSetupWizardOperatorHandoffRows: handoffRows,
    realSetupWizardOperatorHandoffRowCount: integerValue(sourcePacket.realSetupWizardOperatorHandoffRowCount),
    realSetupWizardOperatorHandoffSummary: textValue(sourcePacket.realSetupWizardOperatorHandoffSummary),
    realSetupWizardNextPrivateInputEditTargetSummary: textValue(
      sourcePacket.realSetupWizardNextPrivateInputEditTargetSummary
    ),
    realSetupWizardNextPrivateInputEditExpectedShapeSummary: textValue(
      sourcePacket.realSetupWizardNextPrivateInputEditExpectedShapeSummary
    ),
    realSetupWizardNextOperatorCommandAfterPrivateInputEdit: textValue(
      sourcePacket.realSetupWizardNextOperatorCommandAfterPrivateInputEdit
    ),
    realSetupWizardNextOperatorCommand: textValue(
      sourcePacket.realSetupWizardNextOperatorCommandAfterPrivateInputEdit
    ),
    realSetupWizardPreflightReady: sourcePacket.realSetupWizardPreflightReady === true,
    realSetupWizardApplyReady: sourcePacket.realSetupWizardApplyReady === true,
    realSetupWizardStrictLiveCheckReady: sourcePacket.realSetupWizardStrictLiveCheckReady === true,
    realSetupWizardCurrentReadyKeyCount: integerValue(sourcePacket.realSetupWizardCurrentReadyKeyCount),
    realSetupWizardCurrentRequiredKeyCount: integerValue(sourcePacket.realSetupWizardCurrentRequiredKeyCount),
    realSetupWizardRealLocalEnvRead: sourcePacket.realSetupWizardRealLocalEnvRead === true,
    realSetupWizardRealLocalEnvModified: sourcePacket.realSetupWizardRealLocalEnvModified === true,
    realSetupWizardRecommendedOperatorProofCommand: textValue(
      sourcePacket.realSetupWizardRecommendedOperatorProofCommand,
      privateEditStrictProofCommand
    ),
    realSetupWizardPrivateValuesRecorded: sourcePacket.realSetupWizardPrivateValuesRecorded === true,
    realSetupWizardValueRecorded: sourcePacket.realSetupWizardValueRecorded === true,
    realSetupWizardNetworkProbeAttempted: sourcePacket.realSetupWizardNetworkProbeAttempted === true,
    realSetupWizardReleaseUploadAttempted: sourcePacket.realSetupWizardReleaseUploadAttempted === true,
    realSetupWizardNotarySubmissionAttempted: sourcePacket.realSetupWizardNotarySubmissionAttempted === true,
    realSetupWizardSigningAttempted: sourcePacket.realSetupWizardSigningAttempted === true,
    realSetupWizardClaimedExternalDistribution: sourcePacket.realSetupWizardClaimedExternalDistribution === true
  };
}

function commandOrder(rows, command) {
  const row = objectRows(rows).find((item) => item.command === command);
  return integerValue(row?.order);
}

function copyValueFreeRunRow(row, resumeOrder) {
  return {
    resumeOrder,
    sourceOrder: integerValue(row.order),
    phase: textValue(row.phase),
    command: textValue(row.command),
    proofCommand: textValue(row.proofCommand),
    readiness: textValue(row.readiness, "blocked"),
    source: textValue(row.source),
    note: textValue(row.note),
    valueRecorded: false
  };
}

function commandRowFromSource(row, label) {
  return {
    label,
    phase: textValue(row.phase),
    command: textValue(row.command),
    proofCommand: textValue(row.proofCommand),
    readiness: textValue(row.readiness, "blocked"),
    valueRecorded: false
  };
}

function copyProcessEnvInputRow(row) {
  return {
    order: integerValue(row.order),
    key: textValue(row.key),
    inputSource: textValue(row.inputSource),
    inputPresent: row.inputPresent === true,
    inputPlaceholder: row.inputPlaceholder === true,
    inputShapeReady: row.inputShapeReady === true,
    expectedShape: textValue(row.expectedShape),
    preflightCommand: textValue(row.preflightCommand),
    writeCommand: textValue(row.writeCommand),
    proofCommand: textValue(row.proofCommand),
    valueRecorded: false
  };
}

function copyPreflightRemediationRow(row) {
  return {
    order: integerValue(row.order),
    key: textValue(row.key),
    inputPresent: row.inputPresent === true,
    inputPlaceholder: row.inputPlaceholder === true,
    inputShapeReady: row.inputShapeReady === true,
    remediation: textValue(row.remediation),
    nextCommand: textValue(row.nextCommand),
    writeCommand: textValue(row.writeCommand, releaseChannelApplyPrivateEnvCommand),
    proofCommand: textValue(row.proofCommand, privateEditStrictProofCommand),
    valueRecorded: false
  };
}

function copyOperatorReceiptRow(row) {
  return {
    order: integerValue(row.order),
    step: textValue(row.step),
    status: textValue(row.status),
    command: textValue(row.command),
    target: textValue(row.target),
    expectedEvidence: textValue(row.expectedEvidence),
    operatorAction: textValue(row.operatorAction),
    valueRecorded: false
  };
}

function runNpmScript(command) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const [, , scriptName] = command.trim().split(/\s+/);
  const result = spawnSync(npmCommand, ["run", scriptName], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail(`Could not run ${command}.`, result.error.message);
  }
  if (result.status !== 0) {
    fail(`${command} exited with status ${result.status}.`, "Refresh the release evidence, then rerun this resume packet smoke.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function buildReport(sourcePacket, preflightBlocked) {
  const runRows = objectRows(sourcePacket.runRows);
  const currentOperatorCommandRows = objectRows(sourcePacket.currentOperatorCommandRows);
  const preflightProcessEnvInputRows = objectRows(preflightBlocked.processEnvInputChecklistRows).map(copyProcessEnvInputRow);
  const preflightRemediationRows = objectRows(preflightBlocked.preflightRemediationRows).map(copyPreflightRemediationRow);
  const preflightOperatorReceiptRows = objectRows(preflightBlocked.operatorReceiptRows).map(copyOperatorReceiptRow);
  const currentPrivateInputPlaceholderLocations = objectRows(
    sourcePacket.currentPrivateInputPlaceholderLocations
  )
    .filter((row) => row.valueRecorded === false)
    .map(copyCurrentPrivateInputPlaceholderLocationRow);
  const currentOperatorPreflightCommand = textValue(
    sourcePacket.currentOperatorPreflightCommand,
    releaseChannelApplyPrivateEnvPreflightCommand
  );
  const currentOperatorApplyCommand = textValue(sourcePacket.currentOperatorApplyCommand, releaseChannelApplyPrivateEnvCommand);
  const currentOperatorStrictProofCommand = textValue(sourcePacket.currentOperatorStrictProofCommand, privateEditStrictProofCommand);
  const currentOperatorPreflightCommandOrder =
    integerValue(sourcePacket.currentOperatorPreflightCommandOrder) || commandOrder(currentOperatorCommandRows, currentOperatorPreflightCommand);
  const currentOperatorApplyCommandOrder =
    integerValue(sourcePacket.currentOperatorApplyCommandOrder) || commandOrder(currentOperatorCommandRows, currentOperatorApplyCommand);
  const currentOperatorStrictProofCommandOrder =
    integerValue(sourcePacket.currentOperatorStrictProofCommandOrder) || commandOrder(currentOperatorCommandRows, currentOperatorStrictProofCommand);
  const currentOperatorFirstCommand = textValue(sourcePacket.currentOperatorFirstCommand);
  const currentOperatorStartCommand = textValue(sourcePacket.currentOperatorStartCommand, currentOperatorFirstCommand);
  const currentOperatorStartCommandRole = textValue(
    sourcePacket.currentOperatorStartCommandRole,
    currentOperatorCommandRows[0]?.role ?? "none"
  );
  const firstBlockedIndex = runRows.findIndex((row) => textValue(row.readiness) !== "ready");
  const firstBlockedRow = firstBlockedIndex >= 0 ? runRows[firstBlockedIndex] : null;
  const resumeRows = firstBlockedIndex >= 0 ? runRows.slice(firstBlockedIndex).map((row, index) => copyValueFreeRunRow(row, index + 1)) : [];
  const alreadyReadyRows = firstBlockedIndex >= 0 ? runRows.slice(0, firstBlockedIndex).map((row, index) => copyValueFreeRunRow(row, index + 1)) : runRows.map((row, index) => copyValueFreeRunRow(row, index + 1));
  const firstBlockedSummary = firstBlockedRow ? commandRowFromSource(firstBlockedRow, "first-blocked") : null;
  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:external-completion-resume-packet-smoke",
    sourceCommand: "npm run release:external-completion-run-packet-smoke",
    sourceMode: fromExistingRunPacket ? "existing-run-packet" : "refreshed-run-packet",
    refreshCommands: activeRefreshCommands,
    refreshCommandCount: activeRefreshCommands.length,
    externalCompletionResumePacketMarkdownArtifactName: resumePacketMarkdownArtifactName,
    externalCompletionResumePacketJsonArtifactName: resumePacketJsonArtifactName,
    externalCompletionResumePacketMarkdownPath: relative(resumePacketMarkdownPath),
    externalCompletionResumePacketJsonPath: relative(resumePacketJsonPath),
    externalCompletionResumePacketReady: false,
    sourcePacketJsonArtifactName,
    sourcePacketPath: relative(sourcePacketJsonPath),
    sourcePacketPresent: existsSync(sourcePacketJsonPath),
    sourcePacketReady: sourcePacket.externalCompletionRunPacketReady === true,
    sourcePacketValueFree: sourcePacket.privateValuesRecorded === false && sourcePacket.claimedExternalDistribution === false && valueFreeRows(sourcePacket.runRows),
    privateEnvPreflightBlockedJsonArtifactName: preflightBlockedJsonArtifactName,
    privateEnvPreflightBlockedPath: relative(preflightBlockedJsonPath),
    privateEnvPreflightBlockedPresent: existsSync(preflightBlockedJsonPath),
    privateEnvPreflightBlockedReady: preflightBlocked.blockedSmokeReady === true,
    privateEnvPreflightExpectedBlockedExitObserved: preflightBlocked.expectedBlockedExitObserved === true,
    privateEnvPreflightSourceCommand: textValue(preflightBlocked.sourceCommand, releaseChannelApplyPrivateEnvPreflightCommand),
    privateEnvPreflightSourceExitStatus: integerValue(preflightBlocked.sourceExitStatus),
    privateEnvPreflightSourcePreflightReady: preflightBlocked.sourcePreflightReady === true,
    privateEnvPreflightSourceApplyReady: preflightBlocked.sourceApplyReady === true,
    privateEnvPreflightLocalEnvFileLoaded: preflightBlocked.localEnvFileLoaded === true,
    privateEnvPreflightLocalEnvModified: preflightBlocked.localEnvModified === true,
    privateEnvPreflightRealLocalEnvModified: preflightBlocked.realLocalEnvModified === true,
    privateEnvPreflightRequiredInputCount: integerValue(preflightBlocked.requiredInputCount),
    privateEnvPreflightMissingInputCount: integerValue(preflightBlocked.missingInputCount),
    privateEnvPreflightPrivateInputFileKey: textValue(preflightBlocked.privateInputFileKey, privateInputFileKey),
    privateEnvPreflightPrivateInputFileDefaultName: textValue(
      preflightBlocked.privateInputFileDefaultName,
      defaultPrivateInputFileName
    ),
    privateEnvPreflightOperatorPrivateInputFileDefaultPath: textValue(
      preflightBlocked.operatorPrivateInputFileDefaultPath,
      operatorPrivateInputFileDefaultPath
    ),
    privateEnvPreflightOperatorPrivateInputFileDefaultPathValueRecorded:
      preflightBlocked.operatorPrivateInputFileDefaultPathValueRecorded === true,
    privateEnvPreflightPrivateInputFilePath: textValue(preflightBlocked.privateInputFilePath),
    privateEnvPreflightPrivateInputFilePathMode: textValue(
      preflightBlocked.privateInputFilePathMode,
      blockedPrivateInputFilePathMode
    ),
    privateEnvPreflightPrivateInputFilePresent: preflightBlocked.privateInputFilePresent === true,
    privateEnvPreflightPrivateInputFileConfigured: preflightBlocked.privateInputFileConfigured === true,
    privateEnvPreflightPrivateInputFileLoadedKeyCount: integerValue(preflightBlocked.privateInputFileLoadedKeyCount),
    privateEnvPreflightPrivateInputFileLoadedKeySummary: textValue(preflightBlocked.privateInputFileLoadedKeySummary),
    privateEnvPreflightPrivateInputFileUnknownKeyCount: integerValue(preflightBlocked.privateInputFileUnknownKeyCount),
    privateEnvPreflightPrivateInputFileMalformedLineCount: integerValue(preflightBlocked.privateInputFileMalformedLineCount),
    privateEnvPreflightPrivateInputFileValueRecorded: preflightBlocked.privateInputFileValueRecorded === true,
    privateEnvPreflightProcessEnvInputRows: preflightProcessEnvInputRows,
    privateEnvPreflightProcessEnvInputRowCount: integerValue(preflightBlocked.processEnvInputChecklistRowCount),
    privateEnvPreflightProcessEnvInputRowsValueFree: valueFreeRows(preflightProcessEnvInputRows),
    privateEnvPreflightRemediationRows: preflightRemediationRows,
    privateEnvPreflightRemediationRowCount: integerValue(preflightBlocked.preflightRemediationRowCount),
    privateEnvPreflightRemediationRowsValueFree: valueFreeRows(preflightRemediationRows),
    privateEnvPreflightOperatorReceiptReady: preflightBlocked.operatorReceiptReady === true,
    privateEnvPreflightOperatorReceiptRows: preflightOperatorReceiptRows,
    privateEnvPreflightOperatorReceiptRowCount: integerValue(preflightBlocked.operatorReceiptRowCount),
    privateEnvPreflightOperatorReceiptRowsValueFree: valueFreeRows(preflightOperatorReceiptRows),
    privateEnvPreflightCurrentOperatorFirstCommand: textValue(preflightBlocked.currentOperatorFirstCommand, releaseChannelApplyPrivateEnvPreflightCommand),
    privateEnvPreflightNextWriteCommand: textValue(preflightBlocked.nextWriteCommand, releaseChannelApplyPrivateEnvCommand),
    privateEnvPreflightGuidedSetupFallbackCommand: textValue(
      preflightBlocked.guidedSetupFallbackCommand,
      releaseChannelSetupWizardCommand
    ),
    privateEnvPreflightGuidedSetupFallbackValueRecorded: preflightBlocked.guidedSetupFallbackValueRecorded === true,
    privateEnvPreflightRecommendedOperatorProofCommand: textValue(preflightBlocked.recommendedOperatorProofCommand, privateEditStrictProofCommand),
    privateEnvPreflightHardGateCommand: textValue(preflightBlocked.hardGateCommand, "npm run release:external-check"),
    privateEnvPreflightPrivateValuesRecorded: preflightBlocked.privateValuesRecorded === true,
    privateEnvPreflightClaimedExternalDistribution: preflightBlocked.claimedExternalDistribution === true,
    latestPlan: textValue(sourcePacket.latestPlan),
    latestPlanNumber: integerValue(sourcePacket.latestPlanNumber),
    latestCompletedPlan: textValue(sourcePacket.latestPlan),
    latestCompletedPlanNumber: integerValue(sourcePacket.latestPlanNumber),
    tenPlanProgress: textValue(sourcePacket.tenPlanProgress),
    tenPlanCompletedCount: integerValue(sourcePacket.tenPlanCompletedCount),
    tenPlanTotal: integerValue(sourcePacket.tenPlanTotal),
    completionPercent: sourcePacket.completionPercent,
    remainingPercent: sourcePacket.remainingPercent,
    currentFirstBlocker: textValue(sourcePacket.currentFirstBlocker),
    currentNextCommand: textValue(sourcePacket.currentNextCommand),
    currentEnvEditTarget: textValue(sourcePacket.currentEnvEditTarget, ".env.distribution.local"),
    currentPrivateInputPlaceholderLocationCount: integerValue(
      sourcePacket.currentPrivateInputPlaceholderLocationCount
    ),
    currentPrivateInputPlaceholderLocationSummary: textValue(
      sourcePacket.currentPrivateInputPlaceholderLocationSummary
    ),
    currentPrivateInputPlaceholderLocations,
    currentPrivateInputReceiptReady: sourcePacket.currentPrivateInputReceiptReady === true,
    currentPrivateInputReceiptMode: textValue(sourcePacket.currentPrivateInputReceiptMode),
    currentPrivateInputReceiptPrivateInputFilePresent:
      sourcePacket.currentPrivateInputReceiptPrivateInputFilePresent === true,
    currentPrivateInputReceiptPrivateInputFileLoadedKeyCount: integerValue(
      sourcePacket.currentPrivateInputReceiptPrivateInputFileLoadedKeyCount
    ),
    currentPrivateInputReceiptPrivateInputFileLoadedKeySummary: textValue(
      sourcePacket.currentPrivateInputReceiptPrivateInputFileLoadedKeySummary
    ),
    currentPrivateInputReceiptPrivateInputFileMissingKeyCount: integerValue(
      sourcePacket.currentPrivateInputReceiptPrivateInputFileMissingKeyCount
    ),
    currentPrivateInputReceiptPrivateInputFileMissingKeySummary: textValue(
      sourcePacket.currentPrivateInputReceiptPrivateInputFileMissingKeySummary
    ),
    currentPrivateInputReceiptPrivateInputFilePlaceholderKeyCount: integerValue(
      sourcePacket.currentPrivateInputReceiptPrivateInputFilePlaceholderKeyCount
    ),
    currentPrivateInputReceiptPrivateInputFilePlaceholderKeySummary: textValue(
      sourcePacket.currentPrivateInputReceiptPrivateInputFilePlaceholderKeySummary
    ),
    currentPrivateInputReceiptPrivateInputFileInvalidShapeKeyCount: integerValue(
      sourcePacket.currentPrivateInputReceiptPrivateInputFileInvalidShapeKeyCount
    ),
    currentPrivateInputReceiptPrivateInputFileInvalidShapeKeySummary: textValue(
      sourcePacket.currentPrivateInputReceiptPrivateInputFileInvalidShapeKeySummary
    ),
    currentPrivateInputReceiptPrivateInputFilePlaceholderLocationCount: integerValue(
      sourcePacket.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationCount
    ),
    currentPrivateInputReceiptPrivateInputFilePlaceholderLocationSummary: textValue(
      sourcePacket.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationSummary
    ),
    currentPrivateInputReceiptRowCount: integerValue(sourcePacket.currentPrivateInputReceiptRowCount),
    currentPrivateInputReceiptCommandRowCount: integerValue(sourcePacket.currentPrivateInputReceiptCommandRowCount),
    currentPrivateInputReceiptNextOperatorCommand: textValue(sourcePacket.currentPrivateInputReceiptNextOperatorCommand),
    currentPrivateInputReceiptNextProofCommand: textValue(sourcePacket.currentPrivateInputReceiptNextProofCommand),
    currentPrivateInputReceiptValueRecorded:
      sourcePacket.currentPrivateInputReceiptValueRecorded === true ? true : false,
    realOperatorPreflightReceiptReady: sourcePacket.realOperatorPreflightReceiptReady === true,
    realOperatorPreflightCommand: textValue(sourcePacket.realOperatorPreflightCommand),
    realOperatorPreflightRole: textValue(sourcePacket.realOperatorPreflightRole),
    realOperatorPreflightExitStatus: integerValue(sourcePacket.realOperatorPreflightExitStatus),
    realOperatorPreflightPreflightOnly: sourcePacket.realOperatorPreflightPreflightOnly === true,
    realOperatorPreflightSourcePreflightReady:
      sourcePacket.realOperatorPreflightSourcePreflightReady === true,
    realOperatorPreflightSourceApplyReady: sourcePacket.realOperatorPreflightSourceApplyReady === true,
    realOperatorPreflightLocalEnvFileLoaded:
      sourcePacket.realOperatorPreflightLocalEnvFileLoaded === true,
    realOperatorPreflightLocalEnvModified:
      sourcePacket.realOperatorPreflightLocalEnvModified === true,
    realOperatorPreflightRealLocalEnvModified:
      sourcePacket.realOperatorPreflightRealLocalEnvModified === true,
    realOperatorPreflightCurrentEnvEditTarget: textValue(
      sourcePacket.realOperatorPreflightCurrentEnvEditTarget,
      ".env.distribution.local"
    ),
    realOperatorPreflightCurrentFirstBlocker: textValue(
      sourcePacket.realOperatorPreflightCurrentFirstBlocker
    ),
    realOperatorPreflightCurrentReadyKeyCount: integerValue(
      sourcePacket.realOperatorPreflightCurrentReadyKeyCount
    ),
    realOperatorPreflightCurrentRequiredKeyCount: integerValue(
      sourcePacket.realOperatorPreflightCurrentRequiredKeyCount
    ),
    realOperatorPreflightPrivateInputFileKey: textValue(
      sourcePacket.realOperatorPreflightPrivateInputFileKey
    ),
    realOperatorPreflightPrivateInputFileDefaultName: textValue(
      sourcePacket.realOperatorPreflightPrivateInputFileDefaultName
    ),
    realOperatorPreflightPrivateInputFilePath: textValue(
      sourcePacket.realOperatorPreflightPrivateInputFilePath
    ),
    realOperatorPreflightPrivateInputFilePresent:
      sourcePacket.realOperatorPreflightPrivateInputFilePresent === true,
    realOperatorPreflightPrivateInputFileConfigured:
      sourcePacket.realOperatorPreflightPrivateInputFileConfigured === true,
    realOperatorPreflightPrivateInputFileLoadedKeyCount: integerValue(
      sourcePacket.realOperatorPreflightPrivateInputFileLoadedKeyCount
    ),
    realOperatorPreflightPrivateInputFileLoadedKeySummary: textValue(
      sourcePacket.realOperatorPreflightPrivateInputFileLoadedKeySummary
    ),
    realOperatorPreflightPrivateInputFileUnknownKeyCount: integerValue(
      sourcePacket.realOperatorPreflightPrivateInputFileUnknownKeyCount
    ),
    realOperatorPreflightPrivateInputFileMalformedLineCount: integerValue(
      sourcePacket.realOperatorPreflightPrivateInputFileMalformedLineCount
    ),
    realOperatorPreflightPrivateInputFileValueRecorded:
      sourcePacket.realOperatorPreflightPrivateInputFileValueRecorded === true ? true : false,
    realOperatorPreflightInputReadyKeyCount: integerValue(
      sourcePacket.realOperatorPreflightInputReadyKeyCount
    ),
    realOperatorPreflightInputMissingKeyCount: integerValue(
      sourcePacket.realOperatorPreflightInputMissingKeyCount
    ),
    realOperatorPreflightInputPlaceholderKeyCount: integerValue(
      sourcePacket.realOperatorPreflightInputPlaceholderKeyCount
    ),
    realOperatorPreflightInputShapeInvalidKeyCount: integerValue(
      sourcePacket.realOperatorPreflightInputShapeInvalidKeyCount
    ),
    realOperatorPreflightProcessEnvInputRowCount: integerValue(
      sourcePacket.realOperatorPreflightProcessEnvInputRowCount
    ),
    realOperatorPreflightProcessEnvInputRowsValueFree:
      sourcePacket.realOperatorPreflightProcessEnvInputRowsValueFree === true,
    realOperatorPreflightRemediationRowCount: integerValue(
      sourcePacket.realOperatorPreflightRemediationRowCount
    ),
    realOperatorPreflightRemediationRowsValueFree:
      sourcePacket.realOperatorPreflightRemediationRowsValueFree === true,
    realOperatorPreflightOperatorReceiptReady:
      sourcePacket.realOperatorPreflightOperatorReceiptReady === true,
    realOperatorPreflightOperatorReceiptRowCount: integerValue(
      sourcePacket.realOperatorPreflightOperatorReceiptRowCount
    ),
    realOperatorPreflightOperatorReceiptRowsValueFree:
      sourcePacket.realOperatorPreflightOperatorReceiptRowsValueFree === true,
    realOperatorPreflightNextWriteCommand: textValue(
      sourcePacket.realOperatorPreflightNextWriteCommand
    ),
    realOperatorPreflightGuidedSetupFallbackCommand: textValue(
      sourcePacket.realOperatorPreflightGuidedSetupFallbackCommand
    ),
    realOperatorPreflightRecommendedOperatorProofCommand: textValue(
      sourcePacket.realOperatorPreflightRecommendedOperatorProofCommand
    ),
    realOperatorPreflightHardGateCommand: textValue(
      sourcePacket.realOperatorPreflightHardGateCommand,
      "npm run release:external-check"
    ),
    realOperatorPreflightPrivateValuesRecorded:
      sourcePacket.realOperatorPreflightPrivateValuesRecorded === true ? true : false,
    realOperatorPreflightClaimedExternalDistribution:
      sourcePacket.realOperatorPreflightClaimedExternalDistribution === true ? true : false,
    ...buildSetupWizardSourceFields(sourcePacket),
    currentOperatorCommandSequenceReady: sourcePacket.currentOperatorCommandSequenceReady === true,
    currentOperatorCommandRows,
    currentOperatorCommandRowCount: integerValue(sourcePacket.currentOperatorCommandRowCount),
    currentOperatorCommandSummary: textValue(sourcePacket.currentOperatorCommandSummary),
    currentOperatorFirstCommand,
    currentOperatorStartCommand,
    currentOperatorStartCommandRole,
    currentOperatorStartCommandMatchesFirstCommand:
      sourcePacket.currentOperatorStartCommandMatchesFirstCommand === true ||
      currentOperatorStartCommand === currentOperatorFirstCommand,
    currentOperatorPreflightCommand,
    currentOperatorPreflightCommandOrder,
    currentOperatorApplyCommand,
    currentOperatorApplyCommandOrder,
    currentOperatorStrictProofCommand,
    currentOperatorStrictProofCommandOrder,
    currentOperatorBlockerRefreshCommand: textValue(sourcePacket.currentOperatorBlockerRefreshCommand, "npm run release:current-blocker"),
    currentOperatorNextActionsRefreshCommand: textValue(sourcePacket.currentOperatorNextActionsRefreshCommand, "npm run release:next-actions"),
    currentOperatorPreflightBeforeApply: sourcePacket.currentOperatorPreflightBeforeApply === true,
    currentOperatorApplyBeforeStrictProof: sourcePacket.currentOperatorApplyBeforeStrictProof === true,
    currentOperatorStartCommandValueRecorded:
      sourcePacket.currentOperatorStartCommandValueRecorded === true ? true : false,
    currentOperatorValueRecorded: sourcePacket.currentOperatorValueRecorded === true ? true : false,
    releaseChannelPrivateEnvApplyProofCommand: textValue(
      sourcePacket.releaseChannelPrivateEnvApplyProofCommand,
      releaseChannelApplyPrivateEnvProofCommand
    ),
    releaseChannelPrivateEnvApplyProofRole: textValue(
      sourcePacket.releaseChannelPrivateEnvApplyProofRole,
      releaseChannelApplyPrivateEnvProofRole
    ),
    releaseChannelPrivateEnvApplyProofAfterPreflight:
      sourcePacket.releaseChannelPrivateEnvApplyProofAfterPreflight === true ||
      textValue(sourcePacket.releaseChannelPrivateEnvApplyProofCommand, releaseChannelApplyPrivateEnvProofCommand) ===
        releaseChannelApplyPrivateEnvProofCommand,
    releaseChannelPrivateEnvApplyProofValueRecorded:
      sourcePacket.releaseChannelPrivateEnvApplyProofValueRecorded === true ? true : false,
    releaseChannelPrivateInputTemplateCommand: textValue(
      sourcePacket.releaseChannelPrivateInputTemplateCommand,
      releaseChannelPrivateInputTemplateCommand
    ),
    releaseChannelPrivateInputTemplateRole: textValue(
      sourcePacket.releaseChannelPrivateInputTemplateRole,
      releaseChannelPrivateInputTemplateRole
    ),
    releaseChannelPrivateInputTemplateDefaultPath: textValue(
      sourcePacket.releaseChannelPrivateInputTemplateDefaultPath,
      defaultPrivateInputFileName
    ),
    releaseChannelPrivateInputTemplatePrivateInputFileKey: textValue(
      sourcePacket.releaseChannelPrivateInputTemplatePrivateInputFileKey,
      privateInputFileKey
    ),
    releaseChannelPrivateInputTemplateBeforePreflight:
      sourcePacket.releaseChannelPrivateInputTemplateBeforePreflight === true,
    releaseChannelPrivateInputTemplateValueRecorded:
      sourcePacket.releaseChannelPrivateInputTemplateValueRecorded === true ? true : false,
    hardGateCommand: textValue(sourcePacket.hardGateCommand, "npm run release:external-check"),
    hardGateReady: sourcePacket.hardGateReady === true,
    hardGateWouldFail: sourcePacket.hardGateWouldFail === true,
    totalRunRowCount: runRows.length,
    sourceBlockedRunRowCount: integerValue(sourcePacket.blockedRunRowCount),
    sourceBlockedRunRowSummary: textValue(sourcePacket.blockedRunRowSummary),
    firstBlockedRunRowFound: firstBlockedRow !== null,
    firstBlockedRunRow: firstBlockedSummary,
    firstBlockedRunOrder: firstBlockedSummary ? integerValue(firstBlockedRow.order) : 0,
    firstBlockedPhase: firstBlockedSummary ? firstBlockedSummary.phase : "none",
    firstBlockedCommand: firstBlockedSummary ? firstBlockedSummary.command : "none",
    firstBlockedProofCommand: firstBlockedSummary ? firstBlockedSummary.proofCommand : "none",
    firstBlockedReadiness: firstBlockedSummary ? firstBlockedSummary.readiness : "ready",
    nextResumeCommand: firstBlockedSummary ? firstBlockedSummary.command : sourcePacket.hardGateCommand,
    nextResumeProofCommand: firstBlockedSummary ? firstBlockedSummary.proofCommand : "npm run release:completion-summary-refresh-smoke",
    nextResumeMatchesCurrentOperatorFirstCommand:
      firstBlockedSummary !== null && firstBlockedSummary.command !== "none" && firstBlockedSummary.command === currentOperatorFirstCommand,
    nextResumeMatchesCurrentOperatorStartCommand:
      firstBlockedSummary !== null && firstBlockedSummary.command !== "none" && firstBlockedSummary.command === currentOperatorStartCommand,
    resumeRows,
    resumeRowCount: resumeRows.length,
    resumeRowsValueFree: valueFreeRows(resumeRows),
    alreadyReadyRows,
    alreadyReadyRowCount: alreadyReadyRows.length,
    alreadyReadyRowsValueFree: valueFreeRows(alreadyReadyRows),
    completionBlockerActionRows: objectRows(sourcePacket.completionBlockerActionRows),
    completionBlockerActionRowCount: integerValue(sourcePacket.completionBlockerActionRowCount),
    completionBlockerActionRowsValueFree: valueFreeRows(sourcePacket.completionBlockerActionRows),
    completionBlockerFocusRows: objectRows(sourcePacket.completionBlockerFocusRows),
    completionBlockerFocusRowCount: integerValue(sourcePacket.completionBlockerFocusRowCount),
    completionBlockerFocusRowsValueFree: valueFreeRows(sourcePacket.completionBlockerFocusRows),
    privateValuesRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    localEnvValueRecorded: false,
    networkProbeAttempted: false,
    updateFeedPublishAttempted: false,
    distributionChannelProbeAttempted: false,
    releaseUploadAttempted: false,
    signingAttempted: false,
    notarySubmissionAttempted: false,
    hardGateRun: false,
    claimedDeveloperIdSigning: false,
    claimedNotarization: false,
    claimedGatekeeperApproval: false,
    claimedAutoUpdate: false,
    claimedManualQaApproval: false,
    claimedAppStoreSubmission: false,
    claimedExternalDistribution: false,
    valueRecorded: false
  };
}

function formatRefreshRows(rows) {
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatResumeRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.resumeOrder} | ${row.sourceOrder} | ${escapeCell(row.phase)} | \`${escapeCell(row.command)}\` | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.readiness)} | ${escapeCell(row.source)} | ${escapeCell(row.note)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCurrentOperatorCommandRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.ready === true)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCurrentPrivateInputPlaceholderLocationRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.key)} | ${escapeCell(row.file)} | ${integerValue(row.line)} | ${escapeCell(row.location)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatSetupWizardHandoffRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.action)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.target)} | ${readyLabel(row.ready)} | ${escapeCell(row.expected)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatProcessEnvInputRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.key)} | ${escapeCell(row.inputSource)} | ${readyLabel(row.inputPresent)} | ${readyLabel(row.inputPlaceholder)} | ${readyLabel(row.inputShapeReady)} | ${escapeCell(row.expectedShape)} | \`${escapeCell(row.preflightCommand)}\` | \`${escapeCell(row.writeCommand)}\` | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatPreflightRemediationRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.key)} | ${readyLabel(row.inputPresent)} | ${readyLabel(row.inputPlaceholder)} | ${readyLabel(row.inputShapeReady)} | ${escapeCell(row.remediation)} | \`${escapeCell(row.nextCommand)}\` | \`${escapeCell(row.writeCommand)}\` | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatPreflightOperatorReceiptRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.step)} | ${escapeCell(row.status)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.target)} | ${escapeCell(row.expectedEvidence)} | ${escapeCell(row.operatorAction)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCompletionActionRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.item)} | ${readyLabel(row.ready === true)} | ${escapeCell(row.currentState)} | ${escapeCell(row.operatorAction)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCompletionFocusRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.key)} | ${readyLabel(row.present === true)} | ${readyLabel(row.placeholder === true)} | ${readyLabel(row.shapeReady === true)} | ${readyLabel(row.currentReady === true)} | ${escapeCell(row.expectedSignal)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} External Completion Resume Packet Smoke

## Summary

- External completion resume packet ready: ${readyLabel(report.externalCompletionResumePacketReady)}
- Source packet ready: ${readyLabel(report.sourcePacketReady)}
- Private-env preflight blocked smoke ready: ${readyLabel(report.privateEnvPreflightBlockedReady)}
- Private-env preflight missing inputs: ${report.privateEnvPreflightMissingInputCount}/${report.privateEnvPreflightRequiredInputCount}
- Private-env preflight source ready: ${readyLabel(report.privateEnvPreflightSourcePreflightReady)}
- Private-env preflight expected blocked exit observed: ${readyLabel(report.privateEnvPreflightExpectedBlockedExitObserved)}
- Private-env private input file key: \`${report.privateEnvPreflightPrivateInputFileKey}\`
- Private-env private input file default: \`${report.privateEnvPreflightPrivateInputFileDefaultName}\`
- Private-env operator private input file default path: \`${report.privateEnvPreflightOperatorPrivateInputFileDefaultPath}\`
- Private-env private input file path: ${report.privateEnvPreflightPrivateInputFilePath}
- Private-env private input file present: ${readyLabel(report.privateEnvPreflightPrivateInputFilePresent)}
- Private-env private input file loaded keys: ${report.privateEnvPreflightPrivateInputFileLoadedKeyCount} (${report.privateEnvPreflightPrivateInputFileLoadedKeySummary})
- Private-env guided setup fallback command: \`${report.privateEnvPreflightGuidedSetupFallbackCommand}\`
- Latest completed plan: ${report.latestPlan}
- Latest completed plan alias: ${report.latestCompletedPlan}
- 10-plan progress: ${report.tenPlanProgress}
- User-facing completion: ${report.completionPercent}%
- Remaining completion: ${report.remainingPercent}%
- Current first blocker: ${report.currentFirstBlocker}
- Current next command: \`${report.currentNextCommand}\`
- Current env edit target: ${report.currentEnvEditTarget}
- Current private input placeholder locations: ${report.currentPrivateInputPlaceholderLocationCount} (${report.currentPrivateInputPlaceholderLocationSummary})
- Current private input receipt: ${readyLabel(report.currentPrivateInputReceiptReady)} (${report.currentPrivateInputReceiptMode})
- Current private input file present: ${readyLabel(report.currentPrivateInputReceiptPrivateInputFilePresent)}
- Current private input loaded keys: ${report.currentPrivateInputReceiptPrivateInputFileLoadedKeyCount} (${report.currentPrivateInputReceiptPrivateInputFileLoadedKeySummary})
- Current private input missing/placeholder/invalid rows: ${report.currentPrivateInputReceiptPrivateInputFileMissingKeyCount}/${report.currentPrivateInputReceiptPrivateInputFilePlaceholderKeyCount}/${report.currentPrivateInputReceiptPrivateInputFileInvalidShapeKeyCount}
- Current private input receipt next operator command: \`${report.currentPrivateInputReceiptNextOperatorCommand}\`
- Real operator preflight receipt: ${readyLabel(report.realOperatorPreflightReceiptReady)} (exit ${report.realOperatorPreflightExitStatus})
- Real operator preflight ready: ${readyLabel(report.realOperatorPreflightSourcePreflightReady)}
- Real operator private input file present: ${readyLabel(report.realOperatorPreflightPrivateInputFilePresent)}
- Real operator private input loaded keys: ${report.realOperatorPreflightPrivateInputFileLoadedKeyCount} (${report.realOperatorPreflightPrivateInputFileLoadedKeySummary})
- Real operator input ready/missing/placeholder/invalid rows: ${report.realOperatorPreflightInputReadyKeyCount}/${report.realOperatorPreflightInputMissingKeyCount}/${report.realOperatorPreflightInputPlaceholderKeyCount}/${report.realOperatorPreflightInputShapeInvalidKeyCount}
- Real operator next write command: \`${report.realOperatorPreflightNextWriteCommand}\`
- Real setup wizard receipt: ${readyLabel(report.realSetupWizardReceiptReady)}
- Real setup wizard handoff rows: ${report.realSetupWizardOperatorHandoffRowCount} (${report.realSetupWizardOperatorHandoffSummary})
- Real setup wizard next private input edit target: ${report.realSetupWizardNextPrivateInputEditTargetSummary}
- Real setup wizard next operator command: \`${report.realSetupWizardNextOperatorCommandAfterPrivateInputEdit}\`
- Real setup wizard next operator command alias: \`${report.realSetupWizardNextOperatorCommand}\`
- Current operator command sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Current operator start command: \`${report.currentOperatorStartCommand}\`
- Current operator start command role: ${report.currentOperatorStartCommandRole}
- Current operator start command matches first command: ${readyLabel(report.currentOperatorStartCommandMatchesFirstCommand)}
- Next resume matches current operator first command: ${readyLabel(report.nextResumeMatchesCurrentOperatorFirstCommand)}
- Next resume matches current operator start command: ${readyLabel(report.nextResumeMatchesCurrentOperatorStartCommand)}
- Current operator preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Current operator apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Private env apply proof runner command: \`${report.releaseChannelPrivateEnvApplyProofCommand}\`
- Private env apply proof runner after preflight: ${readyLabel(report.releaseChannelPrivateEnvApplyProofAfterPreflight)}
- Private input template command: \`${report.releaseChannelPrivateInputTemplateCommand}\`
- Private input template default path: \`${report.releaseChannelPrivateInputTemplateDefaultPath}\`
- Private input template before preflight: ${readyLabel(report.releaseChannelPrivateInputTemplateBeforePreflight)}
- First blocked run row found: ${readyLabel(report.firstBlockedRunRowFound)}
- First blocked run order: ${report.firstBlockedRunOrder}
- First blocked phase: ${report.firstBlockedPhase}
- Next resume command: \`${report.nextResumeCommand}\`
- Next resume proof command: \`${report.nextResumeProofCommand}\`
- Resume rows: ${report.resumeRowCount}/${report.totalRunRowCount}
- Already ready rows before resume point: ${report.alreadyReadyRowCount}
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate run by this packet: no
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Private values recorded: no
- Network probe attempted: no
- Update feed publish attempted: no
- Release upload attempted: no
- Signing attempted by this packet: no
- Apple notary submission attempted by this packet: no
- External distribution claimed: no

## Refresh Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatRefreshRows(report.refreshCommands)}

## First Blocked Run Row

| phase | command | proof command | readiness | value recorded |
|---|---|---|---|---:|
| ${escapeCell(report.firstBlockedPhase)} | \`${escapeCell(report.firstBlockedCommand)}\` | \`${escapeCell(report.firstBlockedProofCommand)}\` | ${escapeCell(report.firstBlockedReadiness)} | no |

## Resume Rows

| resume order | source order | phase | command | proof command | readiness | source | note | value recorded |
|---:|---:|---|---|---|---|---|---|---:|
${formatResumeRows(report.resumeRows)}

## Already Ready Rows Before Resume Point

| resume order | source order | phase | command | proof command | readiness | source | note | value recorded |
|---:|---:|---|---|---|---|---|---|---:|
${formatResumeRows(report.alreadyReadyRows)}

## Current Operator Command Sequence

- Sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- First command: \`${report.currentOperatorFirstCommand}\`
- Start command: \`${report.currentOperatorStartCommand}\`
- Start command role: ${report.currentOperatorStartCommandRole}
- Start command matches first command: ${readyLabel(report.currentOperatorStartCommandMatchesFirstCommand)}
- Preflight command: \`${report.currentOperatorPreflightCommand}\`
- Apply command: \`${report.currentOperatorApplyCommand}\`
- Strict proof command: \`${report.currentOperatorStrictProofCommand}\`
- Current-blocker refresh command: \`${report.currentOperatorBlockerRefreshCommand}\`
- Next-actions refresh command: \`${report.currentOperatorNextActionsRefreshCommand}\`
- Preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Private env apply proof runner command: \`${report.releaseChannelPrivateEnvApplyProofCommand}\`
- Private env apply proof runner role: ${report.releaseChannelPrivateEnvApplyProofRole}
- Private env apply proof runner after preflight: ${readyLabel(report.releaseChannelPrivateEnvApplyProofAfterPreflight)}
- Value recorded: ${readyLabel(report.currentOperatorValueRecorded)}

| order | command | role | ready | value recorded |
|---:|---|---|---:|---:|
${formatCurrentOperatorCommandRows(report.currentOperatorCommandRows)}

## Current Private Input Placeholder Locations

| key | file | line | location | placeholder | value recorded |
|---|---|---:|---|---:|---:|
${formatCurrentPrivateInputPlaceholderLocationRows(report.currentPrivateInputPlaceholderLocations)}

## Current Private Input Receipt

- Receipt ready: ${readyLabel(report.currentPrivateInputReceiptReady)}
- Receipt mode: ${report.currentPrivateInputReceiptMode}
- Private input file present: ${readyLabel(report.currentPrivateInputReceiptPrivateInputFilePresent)}
- Loaded keys: ${report.currentPrivateInputReceiptPrivateInputFileLoadedKeyCount} (${report.currentPrivateInputReceiptPrivateInputFileLoadedKeySummary})
- Missing keys: ${report.currentPrivateInputReceiptPrivateInputFileMissingKeyCount} (${report.currentPrivateInputReceiptPrivateInputFileMissingKeySummary})
- Placeholder keys: ${report.currentPrivateInputReceiptPrivateInputFilePlaceholderKeyCount} (${report.currentPrivateInputReceiptPrivateInputFilePlaceholderKeySummary})
- Invalid-shape keys: ${report.currentPrivateInputReceiptPrivateInputFileInvalidShapeKeyCount} (${report.currentPrivateInputReceiptPrivateInputFileInvalidShapeKeySummary})
- Placeholder locations: ${report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationCount} (${report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationSummary})
- Receipt rows: ${report.currentPrivateInputReceiptRowCount}
- Command rows: ${report.currentPrivateInputReceiptCommandRowCount}
- Next operator command: \`${report.currentPrivateInputReceiptNextOperatorCommand}\`
- Next proof command: \`${report.currentPrivateInputReceiptNextProofCommand}\`
- Value recorded: ${readyLabel(report.currentPrivateInputReceiptValueRecorded)}

## Real Operator Preflight Receipt

- Receipt ready: ${readyLabel(report.realOperatorPreflightReceiptReady)}
- Command: \`${report.realOperatorPreflightCommand}\`
- Role: ${report.realOperatorPreflightRole}
- Exit status: ${report.realOperatorPreflightExitStatus}
- Preflight only: ${readyLabel(report.realOperatorPreflightPreflightOnly)}
- Preflight ready: ${readyLabel(report.realOperatorPreflightSourcePreflightReady)}
- Apply ready: ${readyLabel(report.realOperatorPreflightSourceApplyReady)}
- Local env loaded: ${readyLabel(report.realOperatorPreflightLocalEnvFileLoaded)}
- Local env modified: ${readyLabel(report.realOperatorPreflightLocalEnvModified)}
- Real local env modified: ${readyLabel(report.realOperatorPreflightRealLocalEnvModified)}
- Env edit target: ${report.realOperatorPreflightCurrentEnvEditTarget}
- Current blocker: ${report.realOperatorPreflightCurrentFirstBlocker}
- Current ready keys: ${report.realOperatorPreflightCurrentReadyKeyCount}/${report.realOperatorPreflightCurrentRequiredKeyCount}
- Private input file key: ${report.realOperatorPreflightPrivateInputFileKey}
- Private input file default: ${report.realOperatorPreflightPrivateInputFileDefaultName}
- Private input file path: ${report.realOperatorPreflightPrivateInputFilePath}
- Private input file present: ${readyLabel(report.realOperatorPreflightPrivateInputFilePresent)}
- Private input file configured: ${readyLabel(report.realOperatorPreflightPrivateInputFileConfigured)}
- Private input loaded keys: ${report.realOperatorPreflightPrivateInputFileLoadedKeyCount} (${report.realOperatorPreflightPrivateInputFileLoadedKeySummary})
- Private input unknown/malformed rows: ${report.realOperatorPreflightPrivateInputFileUnknownKeyCount}/${report.realOperatorPreflightPrivateInputFileMalformedLineCount}
- Private input file value recorded: ${readyLabel(report.realOperatorPreflightPrivateInputFileValueRecorded)}
- Input ready/missing/placeholder/invalid rows: ${report.realOperatorPreflightInputReadyKeyCount}/${report.realOperatorPreflightInputMissingKeyCount}/${report.realOperatorPreflightInputPlaceholderKeyCount}/${report.realOperatorPreflightInputShapeInvalidKeyCount}
- Process env input rows: ${report.realOperatorPreflightProcessEnvInputRowCount}
- Process env input rows value-free: ${readyLabel(report.realOperatorPreflightProcessEnvInputRowsValueFree)}
- Remediation rows: ${report.realOperatorPreflightRemediationRowCount}
- Remediation rows value-free: ${readyLabel(report.realOperatorPreflightRemediationRowsValueFree)}
- Operator receipt ready: ${readyLabel(report.realOperatorPreflightOperatorReceiptReady)}
- Operator receipt rows: ${report.realOperatorPreflightOperatorReceiptRowCount}
- Operator receipt rows value-free: ${readyLabel(report.realOperatorPreflightOperatorReceiptRowsValueFree)}
- Next write command: \`${report.realOperatorPreflightNextWriteCommand}\`
- Guided setup fallback command: \`${report.realOperatorPreflightGuidedSetupFallbackCommand}\`
- Recommended proof command: \`${report.realOperatorPreflightRecommendedOperatorProofCommand}\`
- Hard gate command: \`${report.realOperatorPreflightHardGateCommand}\`
- Private values recorded: ${readyLabel(report.realOperatorPreflightPrivateValuesRecorded)}
- External distribution claimed: ${readyLabel(report.realOperatorPreflightClaimedExternalDistribution)}

## Real Setup Wizard Handoff

- Receipt ready: ${readyLabel(report.realSetupWizardReceiptReady)}
- Command: \`${report.realSetupWizardCommand}\`
- Input ready: ${readyLabel(report.realSetupWizardInputReady)}
- Local env loaded: ${readyLabel(report.realSetupWizardLocalEnvFileLoaded)}
- Private input file present: ${readyLabel(report.realSetupWizardPrivateInputFilePresent)}
- Private input file loaded keys: ${report.realSetupWizardPrivateInputFileLoadedKeyCount} (${report.realSetupWizardPrivateInputFileLoadedKeySummary})
- Private input file location rows: ${report.realSetupWizardPrivateInputFileLocationRowCount}
- Private input placeholder locations: ${report.realSetupWizardPrivateInputFilePlaceholderLocationSummary}
- Private input missing key locations: ${report.realSetupWizardPrivateInputFileMissingKeyLocationSummary}
- Private input invalid-shape locations: ${report.realSetupWizardPrivateInputFileInvalidShapeLocationSummary}
- Operator handoff ready: ${readyLabel(report.realSetupWizardOperatorHandoffReady)}
- Operator handoff rows: ${report.realSetupWizardOperatorHandoffRowCount} (${report.realSetupWizardOperatorHandoffSummary})
- Next private input edit target: ${report.realSetupWizardNextPrivateInputEditTargetSummary}
- Next private input expected shape: ${report.realSetupWizardNextPrivateInputEditExpectedShapeSummary}
- Next operator command after private input edit: \`${report.realSetupWizardNextOperatorCommandAfterPrivateInputEdit}\`
- Preflight/apply/strict ready: ${readyLabel(report.realSetupWizardPreflightReady)}/${readyLabel(report.realSetupWizardApplyReady)}/${readyLabel(report.realSetupWizardStrictLiveCheckReady)}
- Current ready rows: ${report.realSetupWizardCurrentReadyKeyCount}/${report.realSetupWizardCurrentRequiredKeyCount}
- Recommended proof command: \`${report.realSetupWizardRecommendedOperatorProofCommand}\`
- Real local env read/modified: ${readyLabel(report.realSetupWizardRealLocalEnvRead)}/${readyLabel(report.realSetupWizardRealLocalEnvModified)}
- Private values recorded: ${readyLabel(report.realSetupWizardPrivateValuesRecorded)}
- External distribution claimed: ${readyLabel(report.realSetupWizardClaimedExternalDistribution)}

| order | action | command | target | ready | expected | value recorded |
|---:|---|---|---|---:|---|---:|
${formatSetupWizardHandoffRows(report.realSetupWizardOperatorHandoffRows)}

## Private Env Preflight Blocker

- Blocked smoke ready: ${readyLabel(report.privateEnvPreflightBlockedReady)}
- Artifact: ${report.privateEnvPreflightBlockedPath}
- Source command: \`${report.privateEnvPreflightSourceCommand}\`
- Source exit status: ${report.privateEnvPreflightSourceExitStatus}
- Expected blocked exit observed: ${readyLabel(report.privateEnvPreflightExpectedBlockedExitObserved)}
- Source preflight ready: ${readyLabel(report.privateEnvPreflightSourcePreflightReady)}
- Source apply ready: ${readyLabel(report.privateEnvPreflightSourceApplyReady)}
- Local env loaded: ${readyLabel(report.privateEnvPreflightLocalEnvFileLoaded)}
- Local env modified: ${readyLabel(report.privateEnvPreflightLocalEnvModified)}
- Real local env modified: ${readyLabel(report.privateEnvPreflightRealLocalEnvModified)}
- Missing process env inputs: ${report.privateEnvPreflightMissingInputCount}/${report.privateEnvPreflightRequiredInputCount}
- Private input file key: \`${report.privateEnvPreflightPrivateInputFileKey}\`
- Private input file default: \`${report.privateEnvPreflightPrivateInputFileDefaultName}\`
- Operator private input file default path: \`${report.privateEnvPreflightOperatorPrivateInputFileDefaultPath}\`
- Operator private input file default path value recorded: ${readyLabel(report.privateEnvPreflightOperatorPrivateInputFileDefaultPathValueRecorded)}
- Private input file path: ${report.privateEnvPreflightPrivateInputFilePath}
- Private input file path mode: ${report.privateEnvPreflightPrivateInputFilePathMode}
- Private input file present: ${readyLabel(report.privateEnvPreflightPrivateInputFilePresent)}
- Private input file configured: ${readyLabel(report.privateEnvPreflightPrivateInputFileConfigured)}
- Private input file loaded keys: ${report.privateEnvPreflightPrivateInputFileLoadedKeyCount} (${report.privateEnvPreflightPrivateInputFileLoadedKeySummary})
- Private input file unknown keys: ${report.privateEnvPreflightPrivateInputFileUnknownKeyCount}
- Private input file malformed lines: ${report.privateEnvPreflightPrivateInputFileMalformedLineCount}
- Private input file value recorded: ${readyLabel(report.privateEnvPreflightPrivateInputFileValueRecorded)}
- Process env rows value-free: ${readyLabel(report.privateEnvPreflightProcessEnvInputRowsValueFree)}
- Remediation rows value-free: ${readyLabel(report.privateEnvPreflightRemediationRowsValueFree)}
- Operator receipt ready: ${readyLabel(report.privateEnvPreflightOperatorReceiptReady)}
- Operator receipt rows value-free: ${readyLabel(report.privateEnvPreflightOperatorReceiptRowsValueFree)}
- Current operator first command: \`${report.privateEnvPreflightCurrentOperatorFirstCommand}\`
- Next write command: \`${report.privateEnvPreflightNextWriteCommand}\`
- Guided setup fallback command: \`${report.privateEnvPreflightGuidedSetupFallbackCommand}\`
- Guided setup fallback value recorded: ${readyLabel(report.privateEnvPreflightGuidedSetupFallbackValueRecorded)}
- Recommended proof command: \`${report.privateEnvPreflightRecommendedOperatorProofCommand}\`
- Hard gate command: \`${report.privateEnvPreflightHardGateCommand}\`
- Private values recorded: ${readyLabel(report.privateEnvPreflightPrivateValuesRecorded)}
- External distribution claimed: ${readyLabel(report.privateEnvPreflightClaimedExternalDistribution)}

### Process Env Input Checklist

| order | key | input source | input present | input placeholder | input shape ready | expected shape | preflight command | write command | proof command | value recorded |
|---:|---|---|---:|---:|---:|---|---|---|---|---:|
${formatProcessEnvInputRows(report.privateEnvPreflightProcessEnvInputRows)}

### Preflight Remediation Rows

| order | key | input present | input placeholder | input shape ready | remediation | next command | write command | proof command | value recorded |
|---:|---|---:|---:|---:|---|---|---|---|---:|
${formatPreflightRemediationRows(report.privateEnvPreflightRemediationRows)}

### Preflight Operator Receipt

| order | step | status | command | target | expected evidence | operator action | value recorded |
|---:|---|---|---|---|---|---|---:|
${formatPreflightOperatorReceiptRows(report.privateEnvPreflightOperatorReceiptRows)}

## Current Completion Blocker Actions

| order | item | ready | current state | operator action | evidence | proof command | source field | value recorded |
|---:|---|---:|---|---|---|---|---|---:|
${formatCompletionActionRows(report.completionBlockerActionRows)}

## Current Completion Blocker Focus

| order | key | present | placeholder | shape ready | current ready | expected signal | proof command | rerun command | value recorded |
|---:|---|---:|---:|---:|---:|---|---|---|---:|
${formatCompletionFocusRows(report.completionBlockerFocusRows)}

## Not Recorded Or Claimed

This resume packet records no release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, local env value, private beat, or real user audio. It does not run the hard gate, publish feeds, probe remote channels, upload releases, sign artifacts, submit to Apple, claim auto-update, or claim external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.appName === appName, "external completion resume packet should identify GrooveForge");
  check(report.bundleId === bundleId, `external completion resume packet should identify ${bundleId}`);
  check(report.reportCommand === "npm run release:external-completion-resume-packet-smoke", "external completion resume packet should report its command");
  check(report.sourceCommand === "npm run release:external-completion-run-packet-smoke", "external completion resume packet should cite source command");
  if (fromExistingRunPacket) {
    check(report.sourceMode === "existing-run-packet", "external completion resume packet should report existing run packet mode");
    check(report.refreshCommandCount === 1, "external completion resume packet existing-run mode should refresh only blocked preflight evidence");
    check(
      report.refreshCommands[0]?.command === "npm run release:channel-apply-private-env-preflight-blocked-smoke",
      "external completion resume packet existing-run mode should refresh blocked preflight evidence"
    );
  } else {
    check(report.sourceMode === "refreshed-run-packet", "external completion resume packet should report refreshed run packet mode");
    check(report.refreshCommandCount === 2, "external completion resume packet should refresh run packet and blocked preflight evidence");
    check(
      report.refreshCommands[0]?.command === "npm run release:external-completion-run-packet-smoke",
      "external completion resume packet should refresh the run packet first"
    );
    check(
      report.refreshCommands[1]?.command === "npm run release:channel-apply-private-env-preflight-blocked-smoke",
      "external completion resume packet should refresh blocked preflight evidence second"
    );
  }
  check(report.sourcePacketPresent === true, "external completion resume packet source packet should be present");
  check(report.sourcePacketReady === true, "external completion resume packet source packet should be ready");
  check(report.sourcePacketValueFree === true, "external completion resume packet source packet should be value-free");
  check(report.privateEnvPreflightBlockedPresent === true, "external completion resume packet blocked preflight artifact should be present");
  check(report.privateEnvPreflightBlockedReady === true, "external completion resume packet should include ready blocked preflight evidence");
  check(report.privateEnvPreflightExpectedBlockedExitObserved === true, "external completion resume packet should prove expected blocked preflight exit");
  check(report.privateEnvPreflightSourceCommand === releaseChannelApplyPrivateEnvPreflightCommand, "external completion resume packet should cite private env preflight command");
  check(report.privateEnvPreflightSourceExitStatus !== 0, "external completion resume packet blocked preflight source should exit nonzero");
  check(report.privateEnvPreflightSourcePreflightReady === false, "external completion resume packet blocked preflight should not be preflight ready");
  check(report.privateEnvPreflightSourceApplyReady === false, "external completion resume packet blocked preflight should not be apply ready");
  check(report.privateEnvPreflightLocalEnvModified === false, "external completion resume packet blocked preflight should not modify local env");
  check(report.privateEnvPreflightRealLocalEnvModified === false, "external completion resume packet blocked preflight should not modify real local env");
  check(report.privateEnvPreflightRequiredInputCount === 4, "external completion resume packet blocked preflight should require four process env inputs");
  check(report.privateEnvPreflightMissingInputCount === 4, "external completion resume packet blocked preflight should prove four missing process env inputs");
  check(report.privateEnvPreflightPrivateInputFileKey === privateInputFileKey, "external completion resume packet blocked preflight should expose the private input file key");
  check(
    report.privateEnvPreflightPrivateInputFileDefaultName === defaultPrivateInputFileName,
    "external completion resume packet blocked preflight should expose the default private input file name"
  );
  check(
    report.privateEnvPreflightOperatorPrivateInputFileDefaultPath === operatorPrivateInputFileDefaultPath,
    "external completion resume packet blocked preflight should expose the operator default private input file path"
  );
  check(
    report.privateEnvPreflightOperatorPrivateInputFileDefaultPathValueRecorded === false,
    "external completion resume packet blocked preflight operator default private input file path should be value-free"
  );
  check(
    report.privateEnvPreflightPrivateInputFilePath !== "none",
    "external completion resume packet blocked preflight should expose the current private input file path"
  );
  check(
    report.privateEnvPreflightPrivateInputFilePathMode === blockedPrivateInputFilePathMode,
    "external completion resume packet blocked preflight should identify the isolated missing input file path mode"
  );
  check(report.privateEnvPreflightPrivateInputFilePresent === false, "external completion resume packet blocked preflight should keep private input file absent");
  check(report.privateEnvPreflightPrivateInputFileConfigured === true, "external completion resume packet blocked preflight should mark the isolated input file override configured");
  check(report.privateEnvPreflightPrivateInputFileLoadedKeyCount === 0, "external completion resume packet blocked preflight should load zero private input keys");
  check(
    report.privateEnvPreflightPrivateInputFileLoadedKeySummary === "none",
    "external completion resume packet blocked preflight should summarize zero loaded private input keys"
  );
  check(report.privateEnvPreflightPrivateInputFileUnknownKeyCount === 0, "external completion resume packet blocked preflight should expose zero private input unknown keys");
  check(report.privateEnvPreflightPrivateInputFileMalformedLineCount === 0, "external completion resume packet blocked preflight should expose zero private input malformed lines");
  check(report.privateEnvPreflightPrivateInputFileValueRecorded === false, "external completion resume packet blocked preflight should not record private input file values");
  check(
    report.privateEnvPreflightGuidedSetupFallbackCommand === releaseChannelSetupWizardCommand,
    "external completion resume packet blocked preflight should expose guided setup as a fallback command"
  );
  check(
    report.privateEnvPreflightGuidedSetupFallbackValueRecorded === false,
    "external completion resume packet blocked preflight guided setup fallback should be value-free"
  );
  check(
    report.privateEnvPreflightProcessEnvInputRowCount === report.privateEnvPreflightProcessEnvInputRows.length,
    "external completion resume packet blocked preflight process env row count should match rows"
  );
  check(report.privateEnvPreflightProcessEnvInputRowCount === 4, "external completion resume packet blocked preflight should include four process env rows");
  check(report.privateEnvPreflightProcessEnvInputRowsValueFree === true, "external completion resume packet blocked preflight process env rows should be value-free");
  check(
    report.privateEnvPreflightProcessEnvInputRows.every(
      (row) =>
        row.inputSource === "process.env" &&
        row.inputPresent === false &&
        row.inputPlaceholder === false &&
        row.inputShapeReady === false &&
        row.preflightCommand === releaseChannelApplyPrivateEnvPreflightCommand &&
        row.writeCommand === releaseChannelApplyPrivateEnvCommand &&
        row.proofCommand === privateEditStrictProofCommand &&
        row.valueRecorded === false
    ),
    "external completion resume packet blocked preflight process env rows should describe missing value-free inputs"
  );
  check(
    report.privateEnvPreflightRemediationRowCount === report.privateEnvPreflightRemediationRows.length,
    "external completion resume packet blocked preflight remediation row count should match rows"
  );
  check(report.privateEnvPreflightRemediationRowCount === 4, "external completion resume packet blocked preflight should include four remediation rows");
  check(report.privateEnvPreflightRemediationRowsValueFree === true, "external completion resume packet blocked preflight remediation rows should be value-free");
  check(
    report.privateEnvPreflightRemediationRows.every(
      (row) =>
        row.writeCommand === releaseChannelApplyPrivateEnvCommand &&
        row.proofCommand === privateEditStrictProofCommand &&
        row.valueRecorded === false
    ),
    "external completion resume packet blocked preflight remediation rows should keep write/proof commands value-free"
  );
  check(report.privateEnvPreflightOperatorReceiptReady === true, "external completion resume packet blocked preflight should include ready operator receipt");
  check(
    report.privateEnvPreflightOperatorReceiptRowCount === report.privateEnvPreflightOperatorReceiptRows.length,
    "external completion resume packet blocked preflight operator receipt count should match rows"
  );
  check(report.privateEnvPreflightOperatorReceiptRowCount === 6, "external completion resume packet blocked preflight operator receipt should include six rows");
  check(report.privateEnvPreflightOperatorReceiptRowsValueFree === true, "external completion resume packet blocked preflight operator receipt rows should be value-free");
  check(
    report.privateEnvPreflightOperatorReceiptRows.some((row) => row.command === releaseChannelApplyPrivateEnvCommand),
    "external completion resume packet blocked preflight operator receipt should include private env apply command"
  );
  check(
    report.privateEnvPreflightOperatorReceiptRows.some((row) => row.command === privateEditStrictProofCommand),
    "external completion resume packet blocked preflight operator receipt should include strict proof command"
  );
  check(report.privateEnvPreflightNextWriteCommand === releaseChannelApplyPrivateEnvCommand, "external completion resume packet blocked preflight should expose next write command");
  check(
    report.privateEnvPreflightRecommendedOperatorProofCommand === privateEditStrictProofCommand,
    "external completion resume packet blocked preflight should expose recommended proof command"
  );
  check(report.privateEnvPreflightHardGateCommand === "npm run release:external-check", "external completion resume packet blocked preflight should expose hard gate command");
  check(report.privateEnvPreflightPrivateValuesRecorded === false, "external completion resume packet blocked preflight should not record private values");
  check(report.privateEnvPreflightClaimedExternalDistribution === false, "external completion resume packet blocked preflight should not claim external distribution");
  check(report.latestPlanNumber > 0, "external completion resume packet should include latest plan number");
  check(report.latestCompletedPlan === report.latestPlan, "external completion resume packet should mirror latest completed plan alias");
  check(
    report.latestCompletedPlanNumber === report.latestPlanNumber,
    "external completion resume packet should mirror latest completed plan number alias"
  );
  check(report.tenPlanTotal === 10, "external completion resume packet should keep ten-plan total");
  check(report.completionPercent === 99.999999, "external completion resume packet should preserve completion percent");
  check(report.remainingPercent === 0.000001, "external completion resume packet should preserve remaining percent");
  check(report.currentEnvEditTarget !== "none", "external completion resume packet should expose current env edit target");
  check(
    report.currentPrivateInputPlaceholderLocationCount === report.currentPrivateInputPlaceholderLocations.length,
    "external completion resume packet current private input placeholder location count should match locations"
  );
  check(
    report.currentPrivateInputPlaceholderLocations.every((row) => row.valueRecorded === false),
    "external completion resume packet current private input placeholder locations should not record values"
  );
  check(
    report.currentPrivateInputPlaceholderLocationCount === 0 ||
      report.currentPrivateInputPlaceholderLocationSummary !== "none",
    "external completion resume packet should expose current private input placeholder file/line locations"
  );
  check(report.currentPrivateInputReceiptReady === true, "external completion resume packet should expose ready current private input receipt");
  check(
    [
      "missing-private-input-file",
      "incomplete-private-input-file",
      "placeholder-private-input-file",
      "invalid-shape-private-input-file",
      "ready-private-input-file",
      "review-private-input-file"
    ].includes(report.currentPrivateInputReceiptMode),
    "external completion resume packet should expose current private input receipt mode"
  );
  check(
    report.currentPrivateInputReceiptRowCount === 4,
    "external completion resume packet should expose current private input receipt row count"
  );
  check(
    report.currentPrivateInputReceiptValueRecorded === false,
    "external completion resume packet current private input receipt should not record values"
  );
  check(
    report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationCount === 0 ||
      report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationSummary !== "none",
    "external completion resume packet should expose current private input receipt placeholder locations"
  );
  if (report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationCount > 0) {
    check(
      report.currentPrivateInputPlaceholderLocationCount ===
        report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationCount,
      "external completion resume packet should promote private input placeholder locations into current blocker handoff"
    );
    check(
      report.currentPrivateInputPlaceholderLocations.every((row) =>
        textValue(row.file).includes(".env.release-channel.local")
      ),
      "external completion resume packet promoted private input placeholder rows should point to the ignored private input file"
    );
  }
  check(
    report.currentPrivateInputReceiptNextOperatorCommand !== "none",
    "external completion resume packet should expose current private input receipt next operator command"
  );
  check(
    report.realOperatorPreflightReceiptReady === true,
    "external completion resume packet should expose ready real operator preflight receipt"
  );
  check(
    report.realOperatorPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand,
    "external completion resume packet real operator preflight should cite the preflight command"
  );
  check(
    [0, 1].includes(report.realOperatorPreflightExitStatus),
    "external completion resume packet real operator preflight should record success or expected blocked exit"
  );
  check(
    (report.realOperatorPreflightSourcePreflightReady === true && report.realOperatorPreflightExitStatus === 0) ||
      (report.realOperatorPreflightSourcePreflightReady === false && report.realOperatorPreflightExitStatus === 1),
    "external completion resume packet real operator preflight readiness should match exit status"
  );
  check(
    report.realOperatorPreflightPreflightOnly === true,
    "external completion resume packet real operator preflight should be preflight-only"
  );
  check(
    report.realOperatorPreflightSourceApplyReady === false,
    "external completion resume packet real operator preflight should not claim apply completion"
  );
  check(
    report.realOperatorPreflightLocalEnvModified === false &&
      report.realOperatorPreflightRealLocalEnvModified === false,
    "external completion resume packet real operator preflight should not modify local env files"
  );
  check(
    report.realOperatorPreflightCurrentRequiredKeyCount === 4,
    "external completion resume packet real operator preflight should cover four current keys"
  );
  check(
    report.realOperatorPreflightPrivateInputFileKey !== "none" &&
      report.realOperatorPreflightPrivateInputFileDefaultName === defaultPrivateInputFileName,
    "external completion resume packet real operator preflight should expose private input file key/default"
  );
  check(
    report.realOperatorPreflightPrivateInputFileLoadedKeyCount <=
      report.realOperatorPreflightCurrentRequiredKeyCount,
    "external completion resume packet real operator preflight loaded key count should not exceed required keys"
  );
  check(
    report.realOperatorPreflightPrivateInputFileValueRecorded === false,
    "external completion resume packet real operator preflight private input file should stay value-free"
  );
  check(
    report.realOperatorPreflightInputReadyKeyCount +
      report.realOperatorPreflightInputMissingKeyCount +
      report.realOperatorPreflightInputPlaceholderKeyCount +
      report.realOperatorPreflightInputShapeInvalidKeyCount ===
      report.realOperatorPreflightCurrentRequiredKeyCount,
    "external completion resume packet real operator preflight input counts should cover required keys"
  );
  check(
    report.realOperatorPreflightProcessEnvInputRowCount === 4 &&
      report.realOperatorPreflightProcessEnvInputRowsValueFree === true,
    "external completion resume packet real operator preflight process input rows should be value-free"
  );
  check(
    report.realOperatorPreflightRemediationRowCount === 4 &&
      report.realOperatorPreflightRemediationRowsValueFree === true,
    "external completion resume packet real operator preflight remediation rows should be value-free"
  );
  check(
    report.realOperatorPreflightOperatorReceiptReady === true &&
      report.realOperatorPreflightOperatorReceiptRowCount === 6 &&
      report.realOperatorPreflightOperatorReceiptRowsValueFree === true,
    "external completion resume packet real operator preflight operator receipt should be ready and value-free"
  );
  check(
    report.realOperatorPreflightNextWriteCommand === releaseChannelApplyPrivateEnvCommand,
    "external completion resume packet real operator preflight should expose the next write command"
  );
  check(
    report.realOperatorPreflightRecommendedOperatorProofCommand === privateEditStrictProofCommand,
    "external completion resume packet real operator preflight should expose the recommended proof command"
  );
  check(
    report.realOperatorPreflightHardGateCommand === "npm run release:external-check",
    "external completion resume packet real operator preflight should expose the hard gate command"
  );
  check(
    report.realOperatorPreflightPrivateValuesRecorded === false &&
      report.realOperatorPreflightClaimedExternalDistribution === false,
    "external completion resume packet real operator preflight should not record private values or claim external distribution"
  );
  check(report.realSetupWizardReceiptReady === true, "external completion resume packet should expose ready real setup wizard evidence");
  check(report.realSetupWizardCommand === releaseChannelSetupWizardCommand, "external completion resume packet setup wizard should cite its command");
  check(
    report.realSetupWizardPrivateInputFileLocationRowCount === 4,
    "external completion resume packet setup wizard should expose four private input file location rows"
  );
  check(
    report.realSetupWizardOperatorHandoffReady === true,
    "external completion resume packet setup wizard operator handoff should be ready"
  );
  check(
    report.realSetupWizardOperatorHandoffRowCount === report.realSetupWizardOperatorHandoffRows.length &&
      report.realSetupWizardOperatorHandoffRowCount === 6,
    "external completion resume packet setup wizard should expose six operator handoff rows"
  );
  check(
    setupWizardHandoffRowsReady(report.realSetupWizardOperatorHandoffRows),
    "external completion resume packet setup wizard handoff rows should cover edit, preflight, apply, strict proof, full proof, and blocker refresh"
  );
  check(
    report.realSetupWizardNextPrivateInputEditTargetSummary !== "none",
    "external completion resume packet setup wizard should expose the next private input edit targets"
  );
  check(
    report.realSetupWizardNextPrivateInputEditExpectedShapeSummary.includes("GROOVEFORGE_DISTRIBUTION_CHANNEL"),
    "external completion resume packet setup wizard should expose expected private input shapes"
  );
  check(
    report.realSetupWizardNextOperatorCommandAfterPrivateInputEdit === releaseChannelApplyPrivateEnvPreflightCommand,
    "external completion resume packet setup wizard should point the next operator command at preflight"
  );
  check(
    report.realSetupWizardNextOperatorCommand === report.realSetupWizardNextOperatorCommandAfterPrivateInputEdit,
    "external completion resume packet setup wizard next operator command alias should match the source command"
  );
  check(
    report.realSetupWizardRecommendedOperatorProofCommand === privateEditStrictProofCommand,
    "external completion resume packet setup wizard should expose the strict proof command"
  );
  check(
    report.realSetupWizardCurrentRequiredKeyCount === 4,
    "external completion resume packet setup wizard should cover four current release-channel keys"
  );
  check(
    report.realSetupWizardRealLocalEnvModified === false,
    "external completion resume packet setup wizard should not modify the real local env"
  );
  check(
    report.realSetupWizardPrivateValuesRecorded === false &&
      report.realSetupWizardValueRecorded === false &&
      report.realSetupWizardNetworkProbeAttempted === false &&
      report.realSetupWizardReleaseUploadAttempted === false &&
      report.realSetupWizardNotarySubmissionAttempted === false &&
      report.realSetupWizardSigningAttempted === false &&
      report.realSetupWizardClaimedExternalDistribution === false,
    "external completion resume packet setup wizard should stay value-free and non-claiming"
  );
  check(report.currentOperatorCommandSequenceReady === true, "external completion resume packet current operator command sequence should be ready");
  check(
    report.currentOperatorCommandRowCount === report.currentOperatorCommandRows.length,
    "external completion resume packet current operator command row count should match rows"
  );
  check(
    report.currentOperatorCommandRows.length >= 5,
    "external completion resume packet current operator command sequence should include preflight, apply, strict proof, blocker refresh, and next-actions refresh"
  );
  check(
    report.currentOperatorCommandRows.every((row) => row.ready === true && row.valueRecorded === false),
    "external completion resume packet current operator command rows should be ready and value-free"
  );
  check(report.currentOperatorStartCommand === report.currentOperatorFirstCommand, "external completion resume packet current operator start command should mirror first command");
  check(report.currentOperatorStartCommand === report.currentOperatorCommandRows[0]?.command, "external completion resume packet current operator start command should match first row command");
  check(report.currentOperatorStartCommandRole === report.currentOperatorCommandRows[0]?.role, "external completion resume packet current operator start command role should match first row role");
  check(report.currentOperatorStartCommandMatchesFirstCommand === true, "external completion resume packet current operator start command should declare first-command match");
  check(report.currentOperatorStartCommandValueRecorded === false, "external completion resume packet current operator start command should be value-free");
  check(
    report.currentOperatorPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand,
    "external completion resume packet current operator sequence should expose private env preflight command"
  );
  check(
    report.currentOperatorApplyCommand === releaseChannelApplyPrivateEnvCommand,
    "external completion resume packet current operator sequence should expose private env apply command"
  );
  check(
    report.currentOperatorStrictProofCommand === privateEditStrictProofCommand,
    "external completion resume packet current operator sequence should expose strict proof command"
  );
  check(report.currentOperatorPreflightBeforeApply === true, "external completion resume packet current operator sequence should place preflight before apply");
  check(report.currentOperatorApplyBeforeStrictProof === true, "external completion resume packet current operator sequence should place apply before strict proof");
  check(
    report.releaseChannelPrivateEnvApplyProofCommand === releaseChannelApplyPrivateEnvProofCommand,
    "external completion resume packet should expose private env apply proof runner command"
  );
  check(
    report.releaseChannelPrivateEnvApplyProofRole === releaseChannelApplyPrivateEnvProofRole,
    "external completion resume packet should describe private env apply proof runner role"
  );
  check(
    report.releaseChannelPrivateEnvApplyProofAfterPreflight === true,
    "external completion resume packet should keep proof runner after preflight readiness"
  );
  check(
    report.releaseChannelPrivateEnvApplyProofValueRecorded === false,
    "external completion resume packet private env apply proof runner command should be value-free"
  );
  check(
    report.releaseChannelPrivateInputTemplateCommand === releaseChannelPrivateInputTemplateCommand,
    "external completion resume packet should expose private input template command"
  );
  check(
    report.releaseChannelPrivateInputTemplateRole === releaseChannelPrivateInputTemplateRole,
    "external completion resume packet should expose private input template role"
  );
  check(
    report.releaseChannelPrivateInputTemplateDefaultPath === defaultPrivateInputFileName,
    "external completion resume packet should expose private input template default path"
  );
  check(
    report.releaseChannelPrivateInputTemplatePrivateInputFileKey === privateInputFileKey,
    "external completion resume packet should expose private input template file key"
  );
  check(
    report.releaseChannelPrivateInputTemplateBeforePreflight === true,
    "external completion resume packet should place private input template before preflight"
  );
  check(
    report.releaseChannelPrivateInputTemplateValueRecorded === false,
    "external completion resume packet private input template command should be value-free"
  );
  check(
    report.currentOperatorBlockerRefreshCommand === "npm run release:current-blocker",
    "external completion resume packet current operator sequence should include current-blocker refresh"
  );
  check(
    report.currentOperatorNextActionsRefreshCommand === "npm run release:next-actions",
    "external completion resume packet current operator sequence should include next-actions refresh"
  );
  check(report.currentOperatorValueRecorded === false, "external completion resume packet current operator sequence should be value-free");
  check(report.hardGateCommand === "npm run release:external-check", "external completion resume packet should cite hard gate command");
  check(report.hardGateReady === false, "external completion resume packet should keep hard gate unready");
  check(report.hardGateWouldFail === true, "external completion resume packet should keep hard gate would-fail posture");
  check(report.hardGateRun === false, "external completion resume packet should not run the hard gate");
  check(report.totalRunRowCount === 12, "external completion resume packet should derive twelve source run rows");
  check(report.firstBlockedRunRowFound === true, "external completion resume packet should find the first blocked row while external proof is incomplete");
  check(report.firstBlockedRunOrder >= 1, "external completion resume packet should expose first blocked order");
  check(report.firstBlockedPhase !== "none", "external completion resume packet should expose first blocked phase");
  check(report.nextResumeCommand === report.firstBlockedCommand, "external completion resume packet next command should match first blocked row");
  check(report.nextResumeProofCommand === report.firstBlockedProofCommand, "external completion resume packet proof command should match first blocked row");
  check(
    report.nextResumeMatchesCurrentOperatorFirstCommand === true,
    "external completion resume packet next resume command should match current operator first command"
  );
  check(
    report.nextResumeMatchesCurrentOperatorStartCommand === true,
    "external completion resume packet next resume command should match current operator start command"
  );
  check(
    report.resumeRows[0]?.command === report.currentOperatorFirstCommand,
    "external completion resume packet first resume row should start with current operator first command"
  );
  check(
    report.resumeRows[0]?.proofCommand === report.currentOperatorStrictProofCommand,
    "external completion resume packet first resume proof command should match current operator strict proof command"
  );
  check(
    report.nextResumeCommand !== privateEditStrictProofCommand,
    "external completion resume packet should not use the strict proof command as the next resume operator command while release-channel metadata is blocked"
  );
  check(report.resumeRowCount === report.sourceBlockedRunRowCount, "external completion resume packet resume rows should match blocked source rows");
  check(report.resumeRowCount > 0, "external completion resume packet should include resume rows while external proof remains incomplete");
  check(report.resumeRows[0]?.sourceOrder === report.firstBlockedRunOrder, "external completion resume packet first resume row should match first blocked order");
  check(report.resumeRows[0]?.command === report.nextResumeCommand, "external completion resume packet first resume row should carry next resume command");
  check(report.resumeRowsValueFree === true, "external completion resume packet resume rows should be value-free");
  check(report.alreadyReadyRowCount + report.resumeRowCount === report.totalRunRowCount, "external completion resume packet row partitions should cover all source rows");
  check(report.alreadyReadyRowsValueFree === true, "external completion resume packet already-ready rows should be value-free");
  check(report.completionBlockerActionRowCount === report.completionBlockerActionRows.length, "external completion resume packet blocker action count should match rows");
  check(report.completionBlockerActionRowsValueFree === true, "external completion resume packet blocker action rows should be value-free");
  check(report.completionBlockerFocusRowCount === report.completionBlockerFocusRows.length, "external completion resume packet blocker focus count should match rows");
  check(report.completionBlockerFocusRowsValueFree === true, "external completion resume packet blocker focus rows should be value-free");
  check(report.privateValuesRecorded === false, "external completion resume packet should not record private values");
  check(report.releaseUrlValueRecorded === false, "external completion resume packet should not record release URL values");
  check(report.supportUrlValueRecorded === false, "external completion resume packet should not record support URL values");
  check(report.feedValueRecorded === false, "external completion resume packet should not record feed values");
  check(report.credentialValueRecorded === false, "external completion resume packet should not record credential values");
  check(report.tokenValueRecorded === false, "external completion resume packet should not record token values");
  check(report.channelValueRecorded === false, "external completion resume packet should not record channel values");
  check(report.developerIdIdentityValueRecorded === false, "external completion resume packet should not record Developer ID identity values");
  check(report.localEnvValueRecorded === false, "external completion resume packet should not record local env values");
  check(report.networkProbeAttempted === false, "external completion resume packet should not probe networks");
  check(report.updateFeedPublishAttempted === false, "external completion resume packet should not publish update feeds");
  check(report.distributionChannelProbeAttempted === false, "external completion resume packet should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "external completion resume packet should not upload releases");
  check(report.signingAttempted === false, "external completion resume packet should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "external completion resume packet should not submit to Apple");
  check(report.claimedDeveloperIdSigning === false, "external completion resume packet should not claim Developer ID signing");
  check(report.claimedNotarization === false, "external completion resume packet should not claim notarization");
  check(report.claimedGatekeeperApproval === false, "external completion resume packet should not claim Gatekeeper approval");
  check(report.claimedAutoUpdate === false, "external completion resume packet should not claim auto-update");
  check(report.claimedManualQaApproval === false, "external completion resume packet should not claim manual QA approval");
  check(report.claimedAppStoreSubmission === false, "external completion resume packet should not claim app-store submission");
  check(report.claimedExternalDistribution === false, "external completion resume packet should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "external completion resume packet JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "external completion resume packet Markdown should not include URL values");
  check(markdown.includes("External Completion Resume Packet Smoke"), "external completion resume packet Markdown should include title");
  check(markdown.includes("## First Blocked Run Row"), "external completion resume packet Markdown should include first blocked row");
  check(markdown.includes("## Resume Rows"), "external completion resume packet Markdown should include resume rows");
  check(markdown.includes("## Current Operator Command Sequence"), "external completion resume packet Markdown should include current operator command sequence");
  check(markdown.includes("Latest completed plan alias:"), "external completion resume packet Markdown should include latest completed plan alias");
  check(markdown.includes("Current operator start command:"), "external completion resume packet Markdown should include current operator start command");
  check(markdown.includes("Next resume matches current operator start command:"), "external completion resume packet Markdown should include resume/start-command match");
  check(markdown.includes("Current private input placeholder locations:"), "external completion resume packet Markdown should include current private input placeholder locations");
  check(markdown.includes("Current Private Input Placeholder Locations"), "external completion resume packet Markdown should include current private input placeholder location rows");
  check(markdown.includes("Current private input receipt:"), "external completion resume packet Markdown should include current private input receipt summary");
  check(markdown.includes("Current Private Input Receipt"), "external completion resume packet Markdown should include current private input receipt section");
  check(markdown.includes("Real operator preflight receipt:"), "external completion resume packet Markdown should include real operator preflight summary");
  check(markdown.includes("Real Operator Preflight Receipt"), "external completion resume packet Markdown should include real operator preflight section");
  check(markdown.includes("Real setup wizard receipt:"), "external completion resume packet Markdown should include setup wizard summary");
  check(markdown.includes("Real Setup Wizard Handoff"), "external completion resume packet Markdown should include setup wizard handoff section");
  check(markdown.includes("Next private input edit target:"), "external completion resume packet Markdown should include setup wizard edit target");
  check(
    markdown.includes("Real setup wizard next operator command alias:"),
    "external completion resume packet Markdown should include setup wizard next operator command alias"
  );
  check(markdown.includes("Private input template command:"), "external completion resume packet Markdown should include private input template command");
  check(
    markdown.includes("Private env apply proof runner command:"),
    "external completion resume packet Markdown should include private env apply proof runner command"
  );
  check(markdown.includes("## Private Env Preflight Blocker"), "external completion resume packet Markdown should include private env preflight blocker");
  check(markdown.includes("Private input file key:"), "external completion resume packet Markdown should include private input file key guidance");
  check(
    markdown.includes("Operator private input file default path:"),
    "external completion resume packet Markdown should include operator default private input file path guidance"
  );
  check(markdown.includes("Guided setup fallback command:"), "external completion resume packet Markdown should include guided setup fallback guidance");
  check(markdown.includes("External distribution claimed: no"), "external completion resume packet Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const step of activeRefreshCommands) {
  console.log(`Refreshing release external completion resume packet evidence: ${step.command}`);
  runNpmScript(step.command);
}

const [sourcePacket, preflightBlocked] = await Promise.all([
  readJsonRequired(sourcePacketJsonPath, "release external completion run packet"),
  readJsonRequired(preflightBlockedJsonPath, "release-channel private env preflight blocked smoke")
]);
const report = buildReport(sourcePacket, preflightBlocked);
report.externalCompletionResumePacketReady = true;
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(resumePacketMarkdownPath, markdown, "utf8");
await writeFile(resumePacketJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release external completion resume packet smoke passed.");
console.log(`- Markdown: ${relative(resumePacketMarkdownPath)}`);
console.log(`- JSON: ${relative(resumePacketJsonPath)}`);
console.log(`- Latest completed plan: ${report.latestPlan}`);
console.log(`- Latest completed plan alias: ${report.latestCompletedPlan}`);
console.log(`- 10-plan progress: ${report.tenPlanProgress}`);
console.log(`- User-facing completion: ${report.completionPercent}%`);
console.log(`- Remaining completion: ${report.remainingPercent}%`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- Current next command: ${report.currentNextCommand}`);
console.log(`- Current private input placeholder locations: ${report.currentPrivateInputPlaceholderLocationCount} (${report.currentPrivateInputPlaceholderLocationSummary})`);
console.log(`- Current private input receipt: ${report.currentPrivateInputReceiptReady ? "yes" : "no"} (${report.currentPrivateInputReceiptMode})`);
console.log(`- Current private input file present: ${report.currentPrivateInputReceiptPrivateInputFilePresent ? "yes" : "no"}`);
console.log(`- Current private input loaded keys: ${report.currentPrivateInputReceiptPrivateInputFileLoadedKeyCount} (${report.currentPrivateInputReceiptPrivateInputFileLoadedKeySummary})`);
console.log(`- Current private input missing/placeholder/invalid rows: ${report.currentPrivateInputReceiptPrivateInputFileMissingKeyCount}/${report.currentPrivateInputReceiptPrivateInputFilePlaceholderKeyCount}/${report.currentPrivateInputReceiptPrivateInputFileInvalidShapeKeyCount}`);
console.log(`- Current private input receipt next operator command: ${report.currentPrivateInputReceiptNextOperatorCommand}`);
console.log(`- Real operator preflight receipt: ${report.realOperatorPreflightReceiptReady ? "yes" : "no"} (exit ${report.realOperatorPreflightExitStatus})`);
console.log(`- Real operator preflight ready: ${report.realOperatorPreflightSourcePreflightReady ? "yes" : "no"}`);
console.log(`- Real operator private input file present: ${report.realOperatorPreflightPrivateInputFilePresent ? "yes" : "no"}`);
console.log(`- Real operator private input loaded keys: ${report.realOperatorPreflightPrivateInputFileLoadedKeyCount} (${report.realOperatorPreflightPrivateInputFileLoadedKeySummary})`);
console.log(`- Real operator input ready/missing/placeholder/invalid rows: ${report.realOperatorPreflightInputReadyKeyCount}/${report.realOperatorPreflightInputMissingKeyCount}/${report.realOperatorPreflightInputPlaceholderKeyCount}/${report.realOperatorPreflightInputShapeInvalidKeyCount}`);
console.log(`- Real operator next write command: ${report.realOperatorPreflightNextWriteCommand}`);
console.log(`- Real setup wizard receipt ready: ${report.realSetupWizardReceiptReady ? "yes" : "no"}`);
console.log(`- Real setup wizard handoff rows: ${report.realSetupWizardOperatorHandoffRowCount} (${report.realSetupWizardOperatorHandoffSummary})`);
console.log(`- Real setup wizard next private input edit target: ${report.realSetupWizardNextPrivateInputEditTargetSummary}`);
console.log(`- Real setup wizard next operator command: ${report.realSetupWizardNextOperatorCommandAfterPrivateInputEdit}`);
console.log(`- Real setup wizard next operator command alias: ${report.realSetupWizardNextOperatorCommand}`);
console.log(`- Current operator command sequence ready: ${report.currentOperatorCommandSequenceReady ? "yes" : "no"}`);
console.log(`- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})`);
console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
console.log(`- Current operator start command: ${report.currentOperatorStartCommand}`);
console.log(`- Current operator start command role: ${report.currentOperatorStartCommandRole}`);
console.log(`- Current operator start command matches first command: ${report.currentOperatorStartCommandMatchesFirstCommand ? "yes" : "no"}`);
console.log(`- Next resume matches current operator first command: ${report.nextResumeMatchesCurrentOperatorFirstCommand ? "yes" : "no"}`);
console.log(`- Next resume matches current operator start command: ${report.nextResumeMatchesCurrentOperatorStartCommand ? "yes" : "no"}`);
console.log(`- Current operator preflight before apply: ${report.currentOperatorPreflightBeforeApply ? "yes" : "no"}`);
console.log(`- Current operator apply before strict proof: ${report.currentOperatorApplyBeforeStrictProof ? "yes" : "no"}`);
console.log(`- Private env apply proof runner command: ${report.releaseChannelPrivateEnvApplyProofCommand}`);
console.log(`- Private env apply proof runner after preflight: ${report.releaseChannelPrivateEnvApplyProofAfterPreflight ? "yes" : "no"}`);
console.log(`- Private input template command: ${report.releaseChannelPrivateInputTemplateCommand}`);
console.log(`- Private input template default path: ${report.releaseChannelPrivateInputTemplateDefaultPath}`);
console.log(`- Private-env preflight blocked smoke ready: ${report.privateEnvPreflightBlockedReady ? "yes" : "no"}`);
console.log(`- Private-env preflight missing inputs: ${report.privateEnvPreflightMissingInputCount}/${report.privateEnvPreflightRequiredInputCount}`);
console.log(`- Private-env private input file key: ${report.privateEnvPreflightPrivateInputFileKey}`);
console.log(`- Private-env private input file default: ${report.privateEnvPreflightPrivateInputFileDefaultName}`);
console.log(`- Private-env operator private input file default path: ${report.privateEnvPreflightOperatorPrivateInputFileDefaultPath}`);
console.log(`- Private-env private input file path: ${report.privateEnvPreflightPrivateInputFilePath}`);
console.log(`- Private-env private input file present: ${report.privateEnvPreflightPrivateInputFilePresent ? "yes" : "no"}`);
console.log(`- Private-env private input file loaded keys: ${report.privateEnvPreflightPrivateInputFileLoadedKeyCount}`);
console.log(`- Private-env guided setup fallback: ${report.privateEnvPreflightGuidedSetupFallbackCommand}`);
console.log(`- Private-env preflight operator receipt rows: ${report.privateEnvPreflightOperatorReceiptRowCount}`);
console.log(`- First blocked phase: ${report.firstBlockedPhase}`);
console.log(`- Next resume command: ${report.nextResumeCommand}`);
console.log(`- Next resume proof command: ${report.nextResumeProofCommand}`);
console.log(`- Resume rows: ${report.resumeRowCount}/${report.totalRunRowCount}`);
console.log(`- Hard gate command: ${report.hardGateCommand}`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
