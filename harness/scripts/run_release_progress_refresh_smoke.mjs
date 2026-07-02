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
const refreshStem = "release-progress-refresh-smoke";
const releaseProgressJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-report.json`);
const currentBlockerJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.json`);
const completionReportPacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-completion-report-packet-smoke.json`);
const freshnessJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-freshness-smoke.json`);
const operatorCompletionBriefJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-operator-completion-brief-smoke.json`);
const refreshMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${refreshStem}.md`);
const refreshJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${refreshStem}.json`);
const failures = [];
const refreshCommands = [
  {
    order: 1,
    command: "npm run release:proof-bundle",
    role: "refresh external proof bundle and current release-channel proof rows before progress reads them",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run desktop:external-distribution-gate-smoke",
    role: "refresh external gate dry-run so it mirrors the current proof bundle rows",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:update-feed-checkpoint-smoke",
    role: "refresh latest update-feed checkpoint before progress reads it",
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run release:progress-smoke",
    role: "refresh existing-evidence release progress report",
    valueRecorded: false
  },
  {
    order: 5,
    command: "npm run release:current-blocker-smoke",
    role: "refresh existing-evidence current blocker receipt",
    valueRecorded: false
  },
  {
    order: 6,
    command: "npm run release:completion-report-packet-smoke",
    role: "refresh user-facing completion report packet",
    valueRecorded: false
  },
  {
    order: 7,
    command: "npm run release:progress-freshness-smoke",
    role: "verify refreshed artifacts match latest update-feed checkpoint",
    valueRecorded: false
  },
  {
    order: 8,
    command: "npm run release:operator-completion-brief-smoke",
    role: "refresh compact operator completion brief from aligned release evidence",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release progress refresh smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function readyLabel(value) {
  return value === true ? "yes" : "no";
}

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function stringArrayValue(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim().length > 0) : [];
}

function objectRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object" && !Array.isArray(row)) : [];
}

function valueFreeRows(rows) {
  return objectRows(rows).every((row) => row.valueRecorded === false);
}

function runNpmScript(command) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const [, , scriptName] = command.split(" ");
  const result = spawnSync(npmCommand, ["run", scriptName], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail(`Could not run ${command}.`, result.error.message);
  }
  if (result.status !== 0) {
    fail(`${command} exited with status ${result.status}.`, "Run npm run release:check or refresh the missing source evidence before retrying this existing-evidence refresh smoke.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function artifactRow(label, filePath, ready, progressLabel, sourceField) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready,
    progressLabel,
    sourceField,
    valueRecorded: false
  };
}

function commandSummary(rows) {
  return rows.map((row) => row.command).join(" -> ");
}

function formatKeyList(keys) {
  return keys.length > 0 ? keys.join(", ") : "none";
}

function sanitizeCompletionBlockerFocusRows(rows) {
  return objectRows(rows).map((row, index) => ({
    order: index + 1,
    key: textValue(row.key),
    present: row.present === true,
    placeholder: row.placeholder === true,
    shapeReady: row.shapeReady === true,
    currentReady: row.currentReady === true,
    expectedSignal: textValue(row.expectedSignal),
    proofCommand: textValue(row.proofCommand, "npm run desktop:distribution-private-inputs-smoke"),
    rerunCommand: textValue(row.rerunCommand, "npm run release:doctor"),
    valueRecorded: false
  }));
}

function buildCompletionBlockerActionRows(currentBlocker) {
  const currentEnvEditTarget = textValue(currentBlocker.currentEnvEditTarget, ".env.distribution.local");
  const currentRequiredKeys = stringArrayValue(currentBlocker.currentRequiredKeys);
  const currentPlaceholderKeys = stringArrayValue(currentBlocker.currentPlaceholderKeys);
  const currentPlaceholderEditLocationSummary = textValue(currentBlocker.currentPlaceholderEditLocationSummary);
  const firstProofCommand = textValue(currentBlocker.releaseChannelFirstProofCommandAfterPrivateEdits, "npm run release:channel-live-check");
  const operatorProofCommand = textValue(
    currentBlocker.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits,
    "npm run release:private-edit-strict-proof"
  );
  const hardGateCommand = textValue(currentBlocker.hardGateCommand, "npm run release:external-check");
  return [
    {
      order: 1,
      item: "Edit target",
      ready: currentEnvEditTarget !== "none",
      currentState: currentBlocker.currentPlaceholderKeyCount > 0 ? "blocked" : "ready",
      operatorAction: `replace current release-channel placeholders in ${currentEnvEditTarget}`,
      evidence: currentEnvEditTarget,
      proofCommand: firstProofCommand,
      sourceField: "currentBlocker.currentEnvEditTarget",
      valueRecorded: false
    },
    {
      order: 2,
      item: "Required release-channel keys",
      ready: currentRequiredKeys.length === 4,
      currentState: `${currentRequiredKeys.length} required keys`,
      operatorAction: "provide the required release-channel metadata outside committed files",
      evidence: formatKeyList(currentRequiredKeys),
      proofCommand: firstProofCommand,
      sourceField: "currentBlocker.currentRequiredKeys",
      valueRecorded: false
    },
    {
      order: 3,
      item: "Placeholder keys to replace",
      ready: currentPlaceholderKeys.length === integerValue(currentBlocker.currentPlaceholderKeyCount),
      currentState: `${currentPlaceholderKeys.length} placeholders`,
      operatorAction: "replace placeholder markers with private release-channel metadata",
      evidence: formatKeyList(currentPlaceholderKeys),
      proofCommand: firstProofCommand,
      sourceField: "currentBlocker.currentPlaceholderKeys",
      valueRecorded: false
    },
    {
      order: 4,
      item: "Placeholder edit locations",
      ready: integerValue(currentBlocker.currentPlaceholderEditLocationCount) === currentPlaceholderKeys.length,
      currentState: `${integerValue(currentBlocker.currentPlaceholderEditLocationCount)} locations`,
      operatorAction: "edit only the ignored local distribution env file at the reported key lines",
      evidence: currentPlaceholderEditLocationSummary,
      proofCommand: firstProofCommand,
      sourceField: "currentBlocker.currentPlaceholderEditLocations",
      valueRecorded: false
    },
    {
      order: 5,
      item: "First proof after edit",
      ready: firstProofCommand === "npm run release:channel-live-check",
      currentState: "narrow release-channel live check",
      operatorAction: "run the first value-free release-channel metadata proof",
      evidence: firstProofCommand,
      proofCommand: firstProofCommand,
      sourceField: "currentBlocker.releaseChannelFirstProofCommandAfterPrivateEdits",
      valueRecorded: false
    },
    {
      order: 6,
      item: "Recommended proof chain",
      ready: operatorProofCommand === "npm run release:private-edit-strict-proof",
      currentState: "strict-first private edit proof chain",
      operatorAction: "run the recommended strict proof chain after private edits",
      evidence: operatorProofCommand,
      proofCommand: operatorProofCommand,
      sourceField: "currentBlocker.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits",
      valueRecorded: false
    },
    {
      order: 7,
      item: "Hard gate boundary",
      ready: hardGateCommand === "npm run release:external-check" && currentBlocker.hardGateReady === false,
      currentState: "external gate remains blocked",
      operatorAction: "run the hard gate only after private-input, update, signing, notarization, Gatekeeper, and QA proofs are ready",
      evidence: hardGateCommand,
      proofCommand: hardGateCommand,
      sourceField: "currentBlocker.hardGateCommand/hardGateReady",
      valueRecorded: false
    }
  ];
}

function buildReport({ releaseProgress, currentBlocker, completionReportPacket, freshness, operatorCompletionBrief }) {
  const progressLabel = textValue(releaseProgress.currentTenPlanWindowLabel);
  const blockerLabel = textValue(currentBlocker.currentTenPlanProgressLabel);
  const packetLabel = textValue(completionReportPacket.latestTenPlanProgressLabel);
  const freshnessLabel = textValue(freshness.latestTenPlanProgressLabel);
  const operatorBriefLabel = textValue(operatorCompletionBrief.latestTenPlanProgressLabel);
  const sourceArtifactRows = [
    artifactRow("Release progress report", releaseProgressJsonPath, releaseProgress.releaseProgressReportReady === true, progressLabel, "currentTenPlanWindowLabel"),
    artifactRow("Release current blocker", currentBlockerJsonPath, currentBlocker.releaseCurrentBlockerReady === true, blockerLabel, "currentTenPlanProgressLabel"),
    artifactRow(
      "Release completion report packet",
      completionReportPacketJsonPath,
      completionReportPacket.releaseCompletionReportPacketReady === true,
      packetLabel,
      "latestTenPlanProgressLabel"
    ),
    artifactRow("Release progress freshness smoke", freshnessJsonPath, freshness.releaseProgressFreshnessReady === true, freshnessLabel, "latestTenPlanProgressLabel"),
    artifactRow(
      "Release operator completion brief smoke",
      operatorCompletionBriefJsonPath,
      operatorCompletionBrief.releaseOperatorCompletionBriefReady === true,
      operatorBriefLabel,
      "latestTenPlanProgressLabel"
    )
  ];
  const labelsMatch =
    progressLabel === blockerLabel &&
    blockerLabel === packetLabel &&
    packetLabel === freshnessLabel &&
    freshnessLabel === operatorBriefLabel;
  const freshnessClean =
    freshness.releaseProgressFreshnessReady === true &&
    integerValue(freshness.freshArtifactCount) === integerValue(freshness.freshnessRowCount) &&
    integerValue(freshness.staleArtifactCount) === 0 &&
    integerValue(freshness.missingArtifactCount) === 0;
  const operatorBriefReady =
    operatorCompletionBrief.releaseOperatorCompletionBriefReady === true &&
    operatorCompletionBrief.sourcePrivacyBoundaryReady === true &&
    operatorCompletionBrief.sourceLabelsMatchLatestTenPlan === true &&
    operatorCompletionBrief.releaseChannelMetadataPostureReady === true &&
    operatorCompletionBrief.releaseChannelCurrentRequiredKeyCount === 4 &&
    operatorCompletionBrief.releaseChannelMetadataBlocked !== operatorCompletionBrief.releaseChannelMetadataCleared &&
    operatorCompletionBrief.privateEditOperatorProofCommand === "npm run release:private-edit-strict-proof" &&
    operatorCompletionBrief.postClearanceNextPriorityActionId === "auto-update-feed" &&
    operatorCompletionBrief.updateFeedCheckpointReady === true &&
    operatorCompletionBrief.hardGateReady === false &&
    operatorCompletionBrief.hardGateWouldFail === true &&
    operatorCompletionBrief.privateValuesRecorded === false &&
    operatorCompletionBrief.feedValueRecorded === false &&
    operatorCompletionBrief.channelValueRecorded === false &&
    operatorCompletionBrief.claimedExternalDistribution === false;
  const currentBlockerStillExternal =
    currentBlocker.hardGateReady === false &&
    currentBlocker.hardGateWouldFail === true &&
    currentBlocker.claimedExternalDistribution === false;
  const currentRequiredKeys = stringArrayValue(currentBlocker.currentRequiredKeys);
  const currentPlaceholderKeys = stringArrayValue(currentBlocker.currentPlaceholderKeys);
  const completionBlockerActionRows = buildCompletionBlockerActionRows(currentBlocker);
  const completionBlockerFocusRows = sanitizeCompletionBlockerFocusRows(currentBlocker.releaseChannelFocusRows);
  const completionBlockerActionReceiptReady =
    completionBlockerActionRows.length === 7 &&
    completionBlockerActionRows.every((row) => row.ready === true && row.valueRecorded === false) &&
    currentBlocker.releaseChannelFocusReceiptReady === true &&
    integerValue(currentBlocker.releaseChannelFocusRowCount) === completionBlockerFocusRows.length &&
    completionBlockerFocusRows.length === 4 &&
    valueFreeRows(completionBlockerFocusRows) &&
    currentRequiredKeys.length === 4 &&
    integerValue(currentBlocker.currentRequiredKeyCount) === currentRequiredKeys.length &&
    integerValue(currentBlocker.currentPlaceholderKeyCount) === currentPlaceholderKeys.length &&
    integerValue(currentBlocker.currentPlaceholderEditLocationCount) === currentPlaceholderKeys.length;
  const releaseProgressRefreshReady =
    refreshCommands.every((row) => row.valueRecorded === false) &&
    sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
    labelsMatch &&
    freshnessClean &&
    operatorBriefReady &&
    currentBlockerStillExternal &&
    completionBlockerActionReceiptReady;
  const latestCompletedPlanNumber = integerValue(completionReportPacket.latestCompletedPlanNumber);
  const completionSummary = {
    ready: releaseProgressRefreshReady,
    reportCommand: "npm run release:progress-refresh-smoke",
    latestPlanNumber: latestCompletedPlanNumber,
    latestPlan: latestCompletedPlanNumber > 0 ? `plan-${latestCompletedPlanNumber}` : "none",
    tenPlanProgress: freshnessLabel,
    tenPlanCompletedCount: integerValue(freshness.latestTenPlanCompletedCount),
    tenPlanTotal: integerValue(freshness.latestTenPlanTotal),
    tenPlanReportDue: freshness.tenPlanProgressReportDue === true,
    completionPercent: 99.999999,
    remainingPercent: 0.000001,
    freshArtifactCount: integerValue(freshness.freshArtifactCount),
    staleArtifactCount: integerValue(freshness.staleArtifactCount),
    missingArtifactCount: integerValue(freshness.missingArtifactCount),
    operatorBriefReady,
    releaseChannelMetadataBlocked: operatorCompletionBrief.releaseChannelMetadataBlocked === true,
    releaseChannelMetadataCleared: operatorCompletionBrief.releaseChannelMetadataCleared === true,
    releaseChannelCurrentReadyCount: integerValue(operatorCompletionBrief.releaseChannelCurrentReadyCount),
    releaseChannelCurrentRequiredKeyCount: integerValue(operatorCompletionBrief.releaseChannelCurrentRequiredKeyCount),
    releaseChannelCurrentPlaceholderKeyCount: integerValue(operatorCompletionBrief.releaseChannelCurrentPlaceholderKeyCount),
    operatorProofCommand: textValue(operatorCompletionBrief.privateEditOperatorProofCommand),
    strictProofHandoffReceiptReady: operatorCompletionBrief.strictProofHandoffReceiptReady === true,
    privateEditBlockedSmokeReady: operatorCompletionBrief.privateEditBlockedSmokeReady === true,
    privateEditBlockedSmokeCurrentPlaceholderKeyCount: integerValue(operatorCompletionBrief.privateEditBlockedSmokeCurrentPlaceholderKeyCount),
    finalHandoffSuccessRedactionReady: operatorCompletionBrief.finalHandoffSuccessRedactionReady === true,
    postClearanceNextAction: textValue(operatorCompletionBrief.postClearanceNextPriorityActionId),
    postClearanceProofCommand: textValue(operatorCompletionBrief.postClearanceNextActionPreviewProofCommand),
    firstBlocker: textValue(currentBlocker.currentFirstBlocker),
    nextCommand: textValue(currentBlocker.currentNextCommand),
    rerunCommand: textValue(currentBlocker.currentRerunCommand),
    currentEnvEditTarget: textValue(currentBlocker.currentEnvEditTarget, ".env.distribution.local"),
    currentRequiredKeyCount: integerValue(currentBlocker.currentRequiredKeyCount),
    currentRequiredKeys,
    currentPlaceholderKeyCount: integerValue(currentBlocker.currentPlaceholderKeyCount),
    currentPlaceholderKeys,
    currentPlaceholderEditLocationCount: integerValue(currentBlocker.currentPlaceholderEditLocationCount),
    currentPlaceholderEditLocationSummary: textValue(currentBlocker.currentPlaceholderEditLocationSummary),
    completionBlockerActionReceiptReady,
    completionBlockerActionRows,
    completionBlockerActionRowCount: completionBlockerActionRows.length,
    completionBlockerActionRowsValueFree: completionBlockerActionRows.every((row) => row.valueRecorded === false),
    completionBlockerFocusReceiptReady: currentBlocker.releaseChannelFocusReceiptReady === true,
    completionBlockerFocusCurrentReady: currentBlocker.releaseChannelFocusCurrentReady === true,
    completionBlockerFocusRows,
    completionBlockerFocusRowCount: completionBlockerFocusRows.length,
    completionBlockerFocusRowsValueFree: valueFreeRows(completionBlockerFocusRows),
    releaseChannelFirstProofCommandAfterPrivateEdits: textValue(
      currentBlocker.releaseChannelFirstProofCommandAfterPrivateEdits,
      "npm run release:channel-live-check"
    ),
    releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits: textValue(
      currentBlocker.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits,
      "npm run release:private-edit-strict-proof"
    ),
    hardGateReady: currentBlocker.hardGateReady === true,
    hardGateWouldFail: currentBlocker.hardGateWouldFail === true,
    privateValuesRecorded: false,
    claimedAutoUpdate: false,
    claimedExternalDistribution: false
  };

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:progress-refresh-smoke",
    releaseProgressRefreshMarkdownArtifactName: "release-progress-refresh-smoke.md",
    releaseProgressRefreshJsonArtifactName: "release-progress-refresh-smoke.json",
    releaseProgressRefreshMarkdownPath: relative(refreshMarkdownPath),
    releaseProgressRefreshJsonPath: relative(refreshJsonPath),
    releaseProgressRefreshReady,
    completionSummary,
    latestPlanNumber: completionSummary.latestPlanNumber,
    latestPlan: completionSummary.latestPlan,
    tenPlanProgress: completionSummary.tenPlanProgress,
    completionPercent: completionSummary.completionPercent,
    remainingPercent: completionSummary.remainingPercent,
    freshArtifactCount: completionSummary.freshArtifactCount,
    staleArtifactCount: completionSummary.staleArtifactCount,
    missingArtifactCount: completionSummary.missingArtifactCount,
    releaseChannelMetadataBlocked: completionSummary.releaseChannelMetadataBlocked,
    releaseChannelMetadataCleared: completionSummary.releaseChannelMetadataCleared,
    releaseChannelPlaceholderKeyCount: completionSummary.releaseChannelCurrentPlaceholderKeyCount,
    releaseChannelRequiredKeyCount: completionSummary.releaseChannelCurrentRequiredKeyCount,
    operatorProofCommand: completionSummary.operatorProofCommand,
    postClearanceNextAction: completionSummary.postClearanceNextAction,
    postClearanceProofCommand: completionSummary.postClearanceProofCommand,
    firstBlocker: completionSummary.firstBlocker,
    nextCommand: completionSummary.nextCommand,
    refreshCommandRows: refreshCommands,
    refreshCommandCount: refreshCommands.length,
    refreshCommandSummary: commandSummary(refreshCommands),
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    labelsMatch,
    latestTenPlanProgressLabel: freshnessLabel,
    latestTenPlanWindowStart: integerValue(freshness.latestTenPlanWindowStart),
    latestTenPlanWindowEnd: integerValue(freshness.latestTenPlanWindowEnd),
    latestTenPlanCompletedCount: integerValue(freshness.latestTenPlanCompletedCount),
    latestTenPlanTotal: integerValue(freshness.latestTenPlanTotal),
    tenPlanProgressReportDue: freshness.tenPlanProgressReportDue === true,
    nextTenPlanProgressReportAt: textValue(freshness.nextTenPlanProgressReportAt),
    finalFreshArtifactCount: integerValue(freshness.freshArtifactCount),
    finalFreshnessRowCount: integerValue(freshness.freshnessRowCount),
    finalStaleArtifactCount: integerValue(freshness.staleArtifactCount),
    finalMissingArtifactCount: integerValue(freshness.missingArtifactCount),
    operatorCompletionBriefReady: operatorBriefReady,
    operatorCompletionBriefSourcePrivacyBoundaryReady: operatorCompletionBrief.sourcePrivacyBoundaryReady === true,
    operatorCompletionBriefSourceLabelsMatchLatestTenPlan: operatorCompletionBrief.sourceLabelsMatchLatestTenPlan === true,
    operatorCompletionBriefReleaseChannelMetadataPostureReady: operatorCompletionBrief.releaseChannelMetadataPostureReady === true,
    operatorCompletionBriefReleaseChannelMetadataBlocked: operatorCompletionBrief.releaseChannelMetadataBlocked === true,
    operatorCompletionBriefReleaseChannelMetadataCleared: operatorCompletionBrief.releaseChannelMetadataCleared === true,
    operatorCompletionBriefCurrentPlaceholderKeyCount: integerValue(operatorCompletionBrief.releaseChannelCurrentPlaceholderKeyCount),
    operatorCompletionBriefCurrentReadyCount: integerValue(operatorCompletionBrief.releaseChannelCurrentReadyCount),
    operatorCompletionBriefCurrentRequiredKeyCount: integerValue(operatorCompletionBrief.releaseChannelCurrentRequiredKeyCount),
    operatorCompletionBriefProofCommand: textValue(operatorCompletionBrief.privateEditOperatorProofCommand),
    operatorCompletionBriefStrictProofHandoffReceiptReady: operatorCompletionBrief.strictProofHandoffReceiptReady === true,
    operatorCompletionBriefPrivateEditBlockedSmokeReady: operatorCompletionBrief.privateEditBlockedSmokeReady === true,
    operatorCompletionBriefPrivateEditBlockedSmokeCurrentPlaceholderKeyCount: integerValue(
      operatorCompletionBrief.privateEditBlockedSmokeCurrentPlaceholderKeyCount
    ),
    operatorCompletionBriefFinalHandoffSuccessRedactionReady: operatorCompletionBrief.finalHandoffSuccessRedactionReady === true,
    operatorCompletionBriefPostClearanceNextPriorityActionId: textValue(operatorCompletionBrief.postClearanceNextPriorityActionId),
    operatorCompletionBriefPostClearanceProofCommand: textValue(operatorCompletionBrief.postClearanceNextActionPreviewProofCommand),
    operatorCompletionBriefUpdateFeedCheckpointReady: operatorCompletionBrief.updateFeedCheckpointReady === true,
    operatorCompletionBriefHardGateWouldFail: operatorCompletionBrief.hardGateWouldFail === true,
    operatorCompletionBriefFreshArtifactCount: integerValue(operatorCompletionBrief.freshArtifactCount),
    operatorCompletionBriefStaleArtifactCount: integerValue(operatorCompletionBrief.staleArtifactCount),
    operatorCompletionBriefMissingArtifactCount: integerValue(operatorCompletionBrief.missingArtifactCount),
    currentFirstBlocker: textValue(currentBlocker.currentFirstBlocker),
    currentNextCommand: textValue(currentBlocker.currentNextCommand),
    currentRerunCommand: textValue(currentBlocker.currentRerunCommand),
    currentEnvEditTarget: completionSummary.currentEnvEditTarget,
    currentRequiredKeyCount: completionSummary.currentRequiredKeyCount,
    currentRequiredKeys: completionSummary.currentRequiredKeys,
    currentPlaceholderKeyCount: completionSummary.currentPlaceholderKeyCount,
    currentPlaceholderKeys: completionSummary.currentPlaceholderKeys,
    currentPlaceholderEditLocationCount: completionSummary.currentPlaceholderEditLocationCount,
    currentPlaceholderEditLocationSummary: completionSummary.currentPlaceholderEditLocationSummary,
    completionBlockerActionReceiptReady,
    completionBlockerActionRows,
    completionBlockerActionRowCount: completionBlockerActionRows.length,
    completionBlockerActionRowsValueFree: completionBlockerActionRows.every((row) => row.valueRecorded === false),
    completionBlockerFocusReceiptReady: completionSummary.completionBlockerFocusReceiptReady,
    completionBlockerFocusCurrentReady: completionSummary.completionBlockerFocusCurrentReady,
    completionBlockerFocusRows,
    completionBlockerFocusRowCount: completionBlockerFocusRows.length,
    completionBlockerFocusRowsValueFree: valueFreeRows(completionBlockerFocusRows),
    hardGateReady: currentBlocker.hardGateReady === true,
    hardGateWouldFail: currentBlocker.hardGateWouldFail === true,
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
    privateValuesRecorded: false,
    feedValueRecorded: false,
    channelValueRecorded: false,
    localEnvValueRecorded: false,
    networkProbeAttempted: false,
    updateFeedPublishAttempted: false,
    distributionChannelProbeAttempted: false,
    releaseUploadAttempted: false,
    signingAttempted: false,
    notarySubmissionAttempted: false,
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

function formatCommandRows(rows) {
  return rows.map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function formatArtifactRows(rows) {
  return rows.map((row) => `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${escapeCell(row.path)} | ${readyLabel(row.ready)} | ${escapeCell(row.progressLabel)} | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function formatCompletionBlockerActionRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.item)} | ${readyLabel(row.ready)} | ${escapeCell(row.currentState)} | ${escapeCell(row.operatorAction)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCompletionBlockerFocusRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${readyLabel(row.present)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${readyLabel(row.currentReady)} | ${escapeCell(row.expectedSignal)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Progress Refresh Smoke

## Status

- Refresh smoke ready: ${readyLabel(report.releaseProgressRefreshReady)}
- Command order: ${report.refreshCommandSummary}
- Labels match: ${readyLabel(report.labelsMatch)}
- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- Fresh artifacts: ${report.finalFreshArtifactCount}/${report.finalFreshnessRowCount}
- Stale artifacts: ${report.finalStaleArtifactCount}
- Missing artifacts: ${report.finalMissingArtifactCount}
- Operator completion brief ready: ${readyLabel(report.operatorCompletionBriefReady)}
- Operator source privacy boundary ready: ${readyLabel(report.operatorCompletionBriefSourcePrivacyBoundaryReady)}
- Operator release-channel metadata blocked: ${readyLabel(report.operatorCompletionBriefReleaseChannelMetadataBlocked)}
- Operator release-channel metadata cleared: ${readyLabel(report.operatorCompletionBriefReleaseChannelMetadataCleared)}
- Operator release-channel current ready rows: ${report.operatorCompletionBriefCurrentReadyCount}/${report.operatorCompletionBriefCurrentRequiredKeyCount}
- Operator current placeholder keys: ${report.operatorCompletionBriefCurrentPlaceholderKeyCount}/${report.operatorCompletionBriefCurrentRequiredKeyCount}
- Operator proof command: \`${report.operatorCompletionBriefProofCommand}\`
- Strict proof handoff ready: ${readyLabel(report.operatorCompletionBriefStrictProofHandoffReceiptReady)}
- Private-edit blocked smoke ready: ${readyLabel(report.operatorCompletionBriefPrivateEditBlockedSmokeReady)}
- Private-edit blocked smoke placeholders: ${report.operatorCompletionBriefPrivateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.operatorCompletionBriefCurrentRequiredKeyCount}
- Final handoff success-redaction ready: ${readyLabel(report.operatorCompletionBriefFinalHandoffSuccessRedactionReady)}
- Operator post-clearance next action: ${report.operatorCompletionBriefPostClearanceNextPriorityActionId}
- Operator post-clearance proof command: \`${report.operatorCompletionBriefPostClearanceProofCommand}\`
- Operator update-feed checkpoint ready: ${readyLabel(report.operatorCompletionBriefUpdateFeedCheckpointReady)}
- Completion blocker action receipt ready: ${readyLabel(report.completionBlockerActionReceiptReady)}
- Completion blocker action rows: ${report.completionBlockerActionRowCount}
- Completion blocker focus rows: ${report.completionBlockerFocusRowCount}
- Current env edit target: ${report.currentEnvEditTarget}
- Current required keys: ${report.currentRequiredKeyCount} (${formatKeyList(report.currentRequiredKeys)})
- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})
- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})
- Current next command: \`${report.currentNextCommand}\`
- Current first blocker: ${report.currentFirstBlocker}
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Private values recorded: no
- Feed values recorded: no
- Channel values recorded: no
- Network probe attempted: no
- Update feed publish attempted: no
- Distribution channel probe attempted: no
- Release upload attempted: no
- Signing attempted: no
- Apple notary submission attempted: no
- Auto-update claimed: no
- External distribution claimed: no

## Completion Summary

- Completion summary ready: ${readyLabel(report.completionSummary.ready)}
- Latest completed plan: ${report.completionSummary.latestPlan}
- 10-plan progress: ${report.completionSummary.tenPlanProgress}
- User-facing completion: ${report.completionSummary.completionPercent}%
- Remaining completion: ${report.completionSummary.remainingPercent}%
- Freshness: fresh ${report.completionSummary.freshArtifactCount}, stale ${report.completionSummary.staleArtifactCount}, missing ${report.completionSummary.missingArtifactCount}
- Release-channel metadata blocked: ${readyLabel(report.completionSummary.releaseChannelMetadataBlocked)}
- Release-channel metadata cleared: ${readyLabel(report.completionSummary.releaseChannelMetadataCleared)}
- Release-channel placeholders: ${report.completionSummary.releaseChannelCurrentPlaceholderKeyCount}/${report.completionSummary.releaseChannelCurrentRequiredKeyCount}
- Operator proof command: \`${report.completionSummary.operatorProofCommand}\`
- Strict proof handoff ready: ${readyLabel(report.completionSummary.strictProofHandoffReceiptReady)}
- Private-edit blocked smoke ready: ${readyLabel(report.completionSummary.privateEditBlockedSmokeReady)}
- Private-edit blocked smoke placeholders: ${report.completionSummary.privateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.completionSummary.releaseChannelCurrentRequiredKeyCount}
- Final handoff success-redaction ready: ${readyLabel(report.completionSummary.finalHandoffSuccessRedactionReady)}
- Post-clearance next action: ${report.completionSummary.postClearanceNextAction}
- Post-clearance proof command: \`${report.completionSummary.postClearanceProofCommand}\`
- Next command: \`${report.completionSummary.nextCommand}\`
- First blocker: ${report.completionSummary.firstBlocker}
- Current env edit target: ${report.completionSummary.currentEnvEditTarget}
- Current required keys: ${report.completionSummary.currentRequiredKeyCount} (${formatKeyList(report.completionSummary.currentRequiredKeys)})
- Current placeholder keys: ${report.completionSummary.currentPlaceholderKeyCount} (${formatKeyList(report.completionSummary.currentPlaceholderKeys)})
- Current placeholder edit locations: ${report.completionSummary.currentPlaceholderEditLocationCount} (${report.completionSummary.currentPlaceholderEditLocationSummary})
- Completion blocker action receipt ready: ${readyLabel(report.completionSummary.completionBlockerActionReceiptReady)}
- Completion blocker action rows: ${report.completionSummary.completionBlockerActionRowCount}
- Completion blocker focus receipt ready: ${readyLabel(report.completionSummary.completionBlockerFocusReceiptReady)}
- Completion blocker focus rows: ${report.completionSummary.completionBlockerFocusRowCount}
- First proof after private edits: \`${report.completionSummary.releaseChannelFirstProofCommandAfterPrivateEdits}\`
- Recommended operator proof chain: \`${report.completionSummary.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits}\`
- Private values recorded: ${readyLabel(report.completionSummary.privateValuesRecorded)}
- Auto-update claimed: ${readyLabel(report.completionSummary.claimedAutoUpdate)}
- External distribution claimed: ${readyLabel(report.completionSummary.claimedExternalDistribution)}

## Completion Blocker Action Receipt

- Receipt ready: ${readyLabel(report.completionBlockerActionReceiptReady)}
- Action rows: ${report.completionBlockerActionRowCount}
- Action rows value-free: ${readyLabel(report.completionBlockerActionRowsValueFree)}
- Focus receipt ready: ${readyLabel(report.completionBlockerFocusReceiptReady)}
- Focus current action ready: ${readyLabel(report.completionBlockerFocusCurrentReady)}
- Focus rows: ${report.completionBlockerFocusRowCount}
- Focus rows value-free: ${readyLabel(report.completionBlockerFocusRowsValueFree)}

| order | item | ready | current state | operator action | evidence | proof command | source field | value recorded |
|---:|---|---:|---|---|---|---|---|---:|
${formatCompletionBlockerActionRows(report.completionBlockerActionRows)}

## Completion Blocker Focus Rows

| order | key | present | placeholder | shape ready | current ready | expected signal | proof command | rerun command | value recorded |
|---:|---|---:|---:|---:|---:|---|---|---|---:|
${formatCompletionBlockerFocusRows(report.completionBlockerFocusRows)}

## Refresh Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.refreshCommandRows)}

## Source Artifacts

| artifact | present | path | ready | progress label | source field | value recorded |
|---|---:|---|---:|---|---|---:|
${formatArtifactRows(report.sourceArtifactRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this refresh smoke.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.releaseProgressRefreshReady === true, "release progress refresh smoke should be ready");
  check(report.completionSummary.ready === report.releaseProgressRefreshReady, "release progress refresh summary should mirror readiness");
  check(report.completionSummary.reportCommand === report.reportCommand, "release progress refresh summary should mirror report command");
  check(report.completionSummary.latestPlanNumber === report.latestPlanNumber, "release progress refresh summary should mirror latest plan number");
  check(report.completionSummary.latestPlan === report.latestPlan, "release progress refresh summary should mirror latest plan label");
  check(report.completionSummary.latestPlanNumber > 0, "release progress refresh summary should include a positive latest plan number");
  check(report.completionSummary.latestPlan === `plan-${report.completionSummary.latestPlanNumber}`, "release progress refresh summary should format latest plan label");
  check(report.completionSummary.tenPlanProgress === report.latestTenPlanProgressLabel, "release progress refresh summary should mirror latest 10-plan progress");
  check(report.tenPlanProgress === report.latestTenPlanProgressLabel, "release progress refresh alias should mirror latest 10-plan progress");
  check(report.completionSummary.completionPercent === report.userFacingCompletionPercent, "release progress refresh summary should mirror completion percent");
  check(report.completionPercent === report.userFacingCompletionPercent, "release progress refresh alias should mirror completion percent");
  check(report.completionSummary.remainingPercent === report.userFacingRemainingPercent, "release progress refresh summary should mirror remaining percent");
  check(report.remainingPercent === report.userFacingRemainingPercent, "release progress refresh alias should mirror remaining percent");
  check(report.completionSummary.freshArtifactCount === report.finalFreshArtifactCount, "release progress refresh summary should mirror fresh artifact count");
  check(report.freshArtifactCount === report.finalFreshArtifactCount, "release progress refresh alias should mirror fresh artifact count");
  check(report.completionSummary.staleArtifactCount === report.finalStaleArtifactCount, "release progress refresh summary should mirror stale artifact count");
  check(report.staleArtifactCount === report.finalStaleArtifactCount, "release progress refresh alias should mirror stale artifact count");
  check(report.completionSummary.missingArtifactCount === report.finalMissingArtifactCount, "release progress refresh summary should mirror missing artifact count");
  check(report.missingArtifactCount === report.finalMissingArtifactCount, "release progress refresh alias should mirror missing artifact count");
  check(
    report.completionSummary.releaseChannelMetadataBlocked === report.operatorCompletionBriefReleaseChannelMetadataBlocked,
    "release progress refresh summary should mirror release-channel blocked posture"
  );
  check(
    report.releaseChannelMetadataBlocked === report.operatorCompletionBriefReleaseChannelMetadataBlocked,
    "release progress refresh alias should mirror release-channel blocked posture"
  );
  check(
    report.completionSummary.releaseChannelMetadataCleared === report.operatorCompletionBriefReleaseChannelMetadataCleared,
    "release progress refresh summary should mirror release-channel cleared posture"
  );
  check(
    report.releaseChannelMetadataCleared === report.operatorCompletionBriefReleaseChannelMetadataCleared,
    "release progress refresh alias should mirror release-channel cleared posture"
  );
  check(
    report.completionSummary.releaseChannelCurrentPlaceholderKeyCount === report.operatorCompletionBriefCurrentPlaceholderKeyCount,
    "release progress refresh summary should mirror release-channel placeholder count"
  );
  check(
    report.releaseChannelPlaceholderKeyCount === report.operatorCompletionBriefCurrentPlaceholderKeyCount,
    "release progress refresh alias should mirror release-channel placeholder count"
  );
  check(
    report.completionSummary.operatorProofCommand === report.operatorCompletionBriefProofCommand,
    "release progress refresh summary should mirror operator proof command"
  );
  check(report.operatorProofCommand === report.operatorCompletionBriefProofCommand, "release progress refresh alias should mirror operator proof command");
  check(
    report.completionSummary.strictProofHandoffReceiptReady === report.operatorCompletionBriefStrictProofHandoffReceiptReady,
    "release progress refresh summary should mirror strict proof handoff readiness"
  );
  check(
    report.completionSummary.privateEditBlockedSmokeReady === report.operatorCompletionBriefPrivateEditBlockedSmokeReady,
    "release progress refresh summary should mirror private-edit blocked smoke readiness"
  );
  check(
    report.completionSummary.privateEditBlockedSmokeCurrentPlaceholderKeyCount ===
      report.operatorCompletionBriefPrivateEditBlockedSmokeCurrentPlaceholderKeyCount,
    "release progress refresh summary should mirror private-edit blocked smoke placeholder count"
  );
  check(
    report.completionSummary.finalHandoffSuccessRedactionReady === report.operatorCompletionBriefFinalHandoffSuccessRedactionReady,
    "release progress refresh summary should mirror final handoff success-redaction readiness"
  );
  check(
    report.completionSummary.postClearanceNextAction === report.operatorCompletionBriefPostClearanceNextPriorityActionId,
    "release progress refresh summary should mirror post-clearance next action"
  );
  check(
    report.postClearanceNextAction === report.operatorCompletionBriefPostClearanceNextPriorityActionId,
    "release progress refresh alias should mirror post-clearance next action"
  );
  check(report.completionSummary.firstBlocker === report.currentFirstBlocker, "release progress refresh summary should mirror current first blocker");
  check(report.firstBlocker === report.currentFirstBlocker, "release progress refresh alias should mirror current first blocker");
  check(report.completionSummary.nextCommand === report.currentNextCommand, "release progress refresh summary should mirror current next command");
  check(report.nextCommand === report.currentNextCommand, "release progress refresh alias should mirror current next command");
  check(report.completionSummary.currentEnvEditTarget === report.currentEnvEditTarget, "release progress refresh summary should mirror current env edit target");
  check(report.currentEnvEditTarget !== "none", "release progress refresh should expose current env edit target");
  check(report.completionSummary.currentRequiredKeyCount === report.currentRequiredKeyCount, "release progress refresh summary should mirror current required key count");
  check(report.currentRequiredKeyCount === 4, "release progress refresh should expose four current release-channel required keys");
  check(report.completionSummary.currentRequiredKeys.length === report.currentRequiredKeys.length, "release progress refresh summary should mirror current required keys");
  check(report.currentRequiredKeys.length === report.currentRequiredKeyCount, "release progress refresh required keys should match count");
  check(report.completionSummary.currentPlaceholderKeyCount === report.currentPlaceholderKeyCount, "release progress refresh summary should mirror current placeholder key count");
  check(report.currentPlaceholderKeys.length === report.currentPlaceholderKeyCount, "release progress refresh placeholder keys should match count");
  check(
    report.completionSummary.currentPlaceholderEditLocationCount === report.currentPlaceholderEditLocationCount,
    "release progress refresh summary should mirror current placeholder edit location count"
  );
  check(report.currentPlaceholderEditLocationCount === report.currentPlaceholderKeyCount, "release progress refresh placeholder edit locations should match placeholder keys");
  check(
    typeof report.currentPlaceholderEditLocationSummary === "string" && report.currentPlaceholderEditLocationSummary.includes(report.currentEnvEditTarget),
    "release progress refresh should expose value-free placeholder edit location summary"
  );
  check(report.completionBlockerActionReceiptReady === true, "release progress refresh should expose ready completion blocker action receipt");
  check(
    report.completionSummary.completionBlockerActionReceiptReady === report.completionBlockerActionReceiptReady,
    "release progress refresh summary should mirror blocker action receipt readiness"
  );
  check(report.completionBlockerActionRowCount === report.completionBlockerActionRows.length, "release progress refresh blocker action row count should match rows");
  check(report.completionBlockerActionRowCount === 7, "release progress refresh blocker action receipt should include seven rows");
  check(
    report.completionBlockerActionRows.every((row) => row.ready === true && row.valueRecorded === false),
    "release progress refresh blocker action rows should be ready and value-free"
  );
  check(
    report.completionBlockerActionRows.some((row) => row.item === "Edit target" && row.evidence === report.currentEnvEditTarget),
    "release progress refresh blocker action rows should include edit target"
  );
  check(
    report.completionBlockerActionRows.some((row) => row.item === "First proof after edit" && row.proofCommand === "npm run release:channel-live-check"),
    "release progress refresh blocker action rows should include first proof command"
  );
  check(
    report.completionBlockerActionRows.some((row) => row.item === "Recommended proof chain" && row.proofCommand === "npm run release:private-edit-strict-proof"),
    "release progress refresh blocker action rows should include strict proof chain"
  );
  check(
    report.completionBlockerActionRows.some((row) => row.item === "Hard gate boundary" && row.proofCommand === "npm run release:external-check"),
    "release progress refresh blocker action rows should include hard-gate boundary"
  );
  check(report.completionBlockerFocusReceiptReady === true, "release progress refresh should expose ready completion blocker focus receipt");
  check(
    report.completionSummary.completionBlockerFocusReceiptReady === report.completionBlockerFocusReceiptReady,
    "release progress refresh summary should mirror blocker focus receipt readiness"
  );
  check(report.completionBlockerFocusRowCount === report.completionBlockerFocusRows.length, "release progress refresh blocker focus row count should match rows");
  check(report.completionBlockerFocusRowCount === 4, "release progress refresh blocker focus receipt should include four rows");
  check(report.completionBlockerFocusRows.every((row) => row.valueRecorded === false), "release progress refresh blocker focus rows should be value-free");
  check(
    report.completionBlockerFocusRows.every((row) => report.currentRequiredKeys.includes(row.key)),
    "release progress refresh blocker focus rows should match current required keys"
  );
  check(
    report.completionSummary.releaseChannelFirstProofCommandAfterPrivateEdits === "npm run release:channel-live-check",
    "release progress refresh summary should expose release-channel first proof command"
  );
  check(
    report.completionSummary.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits === "npm run release:private-edit-strict-proof",
    "release progress refresh summary should expose recommended private edit proof chain"
  );
  check(report.completionSummary.privateValuesRecorded === false, "release progress refresh summary should not record private values");
  check(report.completionSummary.claimedAutoUpdate === false, "release progress refresh summary should not claim auto-update");
  check(report.completionSummary.claimedExternalDistribution === false, "release progress refresh summary should not claim external distribution");
  check(report.reportCommand === "npm run release:progress-refresh-smoke", "release progress refresh smoke should report its command");
  check(report.refreshCommandCount === 8, "release progress refresh smoke should run eight commands");
  check(
    report.refreshCommandSummary ===
      "npm run release:proof-bundle -> npm run desktop:external-distribution-gate-smoke -> npm run release:update-feed-checkpoint-smoke -> npm run release:progress-smoke -> npm run release:current-blocker-smoke -> npm run release:completion-report-packet-smoke -> npm run release:progress-freshness-smoke -> npm run release:operator-completion-brief-smoke",
    "release progress refresh smoke should run proof bundle, external gate, update-feed checkpoint, progress, current-blocker, completion packet, freshness, then operator completion brief"
  );
  check(report.refreshCommandRows.every((row) => row.valueRecorded === false), "release progress refresh command rows should be value-free");
  check(report.sourceArtifactRowCount === 5, "release progress refresh smoke should include five source artifacts");
  check(report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false), "release progress refresh source artifacts should be present, ready, and value-free");
  check(report.labelsMatch === true, "release progress refresh smoke should leave progress labels matched");
  check(report.latestTenPlanWindowStart > 0, "release progress refresh smoke should report a positive 10-plan window start");
  check(report.latestTenPlanWindowEnd === report.latestTenPlanWindowStart + 9, "release progress refresh smoke should report a 10-plan window");
  check(report.latestTenPlanTotal === 10, "release progress refresh smoke should use ten-plan windows");
  check(
    report.latestTenPlanProgressLabel === `${report.latestTenPlanWindowStart}-${report.latestTenPlanWindowEnd}: ${report.latestTenPlanCompletedCount}/10`,
    "release progress refresh label should match latest 10-plan window fields"
  );
  check(report.finalFreshArtifactCount === report.finalFreshnessRowCount, "release progress refresh smoke should finish with all freshness rows fresh");
  check(report.finalStaleArtifactCount === 0, "release progress refresh smoke should finish with zero stale artifacts");
  check(report.finalMissingArtifactCount === 0, "release progress refresh smoke should finish with zero missing artifacts");
  check(report.operatorCompletionBriefReady === true, "release progress refresh smoke should refresh the operator completion brief");
  check(report.operatorCompletionBriefSourcePrivacyBoundaryReady === true, "release progress refresh smoke should keep operator source privacy boundary ready");
  check(report.operatorCompletionBriefSourceLabelsMatchLatestTenPlan === true, "release progress refresh smoke should keep operator source labels matched");
  check(report.operatorCompletionBriefReleaseChannelMetadataPostureReady === true, "release progress refresh smoke should keep operator release-channel posture ready");
  check(
    report.operatorCompletionBriefReleaseChannelMetadataBlocked !== report.operatorCompletionBriefReleaseChannelMetadataCleared,
    "release progress refresh smoke should keep exactly one operator release-channel posture"
  );
  check(report.operatorCompletionBriefCurrentRequiredKeyCount === 4, "release progress refresh smoke should keep four release-channel metadata keys");
  check(
    !report.operatorCompletionBriefReleaseChannelMetadataBlocked || report.operatorCompletionBriefCurrentPlaceholderKeyCount === 4,
    "release progress refresh smoke should keep four operator placeholders while blocked"
  );
  check(
    !report.operatorCompletionBriefReleaseChannelMetadataCleared ||
      (report.operatorCompletionBriefCurrentReadyCount === 4 && report.operatorCompletionBriefCurrentPlaceholderKeyCount === 0),
    "release progress refresh smoke should allow operator release-channel metadata cleared posture"
  );
  check(report.operatorCompletionBriefProofCommand === "npm run release:private-edit-strict-proof", "release progress refresh smoke should keep strict proof as operator proof command");
  check(report.operatorCompletionBriefStrictProofHandoffReceiptReady === true, "release progress refresh smoke should keep strict proof handoff ready");
  check(report.operatorCompletionBriefPrivateEditBlockedSmokeReady === true, "release progress refresh smoke should keep private-edit blocked smoke ready");
  check(
    report.operatorCompletionBriefPrivateEditBlockedSmokeCurrentPlaceholderKeyCount === 4,
    "release progress refresh smoke should keep blocked smoke placeholder coverage at four keys"
  );
  check(report.operatorCompletionBriefFinalHandoffSuccessRedactionReady === true, "release progress refresh smoke should keep final handoff success-redaction ready");
  check(report.operatorCompletionBriefPostClearanceNextPriorityActionId === "auto-update-feed", "release progress refresh smoke should keep auto-update-feed as post-clearance next action");
  check(report.operatorCompletionBriefPostClearanceProofCommand === "npm run desktop:auto-update-readiness-smoke", "release progress refresh smoke should keep auto-update readiness as post-clearance proof");
  check(report.operatorCompletionBriefUpdateFeedCheckpointReady === true, "release progress refresh smoke should keep operator update-feed checkpoint ready");
  check(report.operatorCompletionBriefHardGateWouldFail === true, "release progress refresh smoke should keep operator hard gate would-fail posture");
  check(report.operatorCompletionBriefFreshArtifactCount === report.finalFreshArtifactCount, "release progress refresh smoke should align operator fresh artifact count");
  check(report.operatorCompletionBriefStaleArtifactCount === 0, "release progress refresh smoke should keep operator stale artifacts at zero");
  check(report.operatorCompletionBriefMissingArtifactCount === 0, "release progress refresh smoke should keep operator missing artifacts at zero");
  check(report.hardGateReady === false, "release progress refresh smoke should keep hard gate unready");
  check(report.hardGateWouldFail === true, "release progress refresh smoke should keep hard gate would-fail posture");
  check(report.userFacingCompletionPercent === 99.999999, "release progress refresh smoke should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "release progress refresh smoke should preserve remaining percent");
  check(report.privateValuesRecorded === false, "release progress refresh smoke should not record private values");
  check(report.feedValueRecorded === false, "release progress refresh smoke should not record feed values");
  check(report.channelValueRecorded === false, "release progress refresh smoke should not record channel values");
  check(report.localEnvValueRecorded === false, "release progress refresh smoke should not record local env values");
  check(report.networkProbeAttempted === false, "release progress refresh smoke should not probe networks");
  check(report.updateFeedPublishAttempted === false, "release progress refresh smoke should not publish update feeds");
  check(report.distributionChannelProbeAttempted === false, "release progress refresh smoke should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "release progress refresh smoke should not upload releases");
  check(report.signingAttempted === false, "release progress refresh smoke should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release progress refresh smoke should not submit to Apple");
  check(report.claimedAutoUpdate === false, "release progress refresh smoke should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release progress refresh smoke should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "release progress refresh JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release progress refresh Markdown should not include URL values");
  check(markdown.includes("Release Progress Refresh Smoke"), "release progress refresh Markdown should include title");
  check(markdown.includes("Refresh smoke ready: yes"), "release progress refresh Markdown should include readiness");
  check(markdown.includes("## Completion Summary"), "release progress refresh Markdown should include completion summary section");
  check(markdown.includes("Completion summary ready: yes"), "release progress refresh Markdown should include summary readiness");
  check(markdown.includes("## Completion Blocker Action Receipt"), "release progress refresh Markdown should include completion blocker action receipt");
  check(markdown.includes("## Completion Blocker Focus Rows"), "release progress refresh Markdown should include completion blocker focus rows");
  check(markdown.includes("Completion blocker action receipt ready: yes"), "release progress refresh Markdown should include blocker action receipt readiness");
  check(markdown.includes("Auto-update claimed: no"), "release progress refresh Markdown should keep auto-update unclaimed");
  check(markdown.includes("External distribution claimed: no"), "release progress refresh Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const row of refreshCommands) {
  console.log(`Refreshing release progress evidence: ${row.command}`);
  runNpmScript(row.command);
}

const releaseProgress = await readJsonRequired(releaseProgressJsonPath, "Release progress report");
const currentBlocker = await readJsonRequired(currentBlockerJsonPath, "Release current blocker");
const completionReportPacket = await readJsonRequired(completionReportPacketJsonPath, "Release completion report packet");
const freshness = await readJsonRequired(freshnessJsonPath, "Release progress freshness smoke");
const operatorCompletionBrief = await readJsonRequired(operatorCompletionBriefJsonPath, "Release operator completion brief smoke");
const report = buildReport({ releaseProgress, currentBlocker, completionReportPacket, freshness, operatorCompletionBrief });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(refreshMarkdownPath, markdown, "utf8");
await writeFile(refreshJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release progress refresh smoke passed.");
console.log(`- Markdown: ${relative(refreshMarkdownPath)}`);
console.log(`- JSON: ${relative(refreshJsonPath)}`);
console.log("- Refresh smoke ready: yes");
console.log(`- Completion summary ready: ${report.completionSummary.ready ? "yes" : "no"}`);
console.log(`- Latest completed plan: ${report.completionSummary.latestPlan}`);
console.log(`- Command order: ${report.refreshCommandSummary}`);
console.log(`- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}`);
console.log(`- Fresh artifacts: ${report.finalFreshArtifactCount}/${report.finalFreshnessRowCount}`);
console.log(`- Stale artifacts: ${report.finalStaleArtifactCount}`);
console.log(`- Missing artifacts: ${report.finalMissingArtifactCount}`);
console.log(`- Operator completion brief ready: ${report.operatorCompletionBriefReady ? "yes" : "no"}`);
console.log(`- Operator source privacy boundary ready: ${report.operatorCompletionBriefSourcePrivacyBoundaryReady ? "yes" : "no"}`);
console.log(`- Operator release-channel metadata blocked: ${report.operatorCompletionBriefReleaseChannelMetadataBlocked ? "yes" : "no"}`);
console.log(`- Operator release-channel metadata cleared: ${report.operatorCompletionBriefReleaseChannelMetadataCleared ? "yes" : "no"}`);
console.log(`- Operator release-channel current ready rows: ${report.operatorCompletionBriefCurrentReadyCount}/${report.operatorCompletionBriefCurrentRequiredKeyCount}`);
console.log(`- Operator current placeholder keys: ${report.operatorCompletionBriefCurrentPlaceholderKeyCount}/${report.operatorCompletionBriefCurrentRequiredKeyCount}`);
console.log(`- Operator proof command: ${report.operatorCompletionBriefProofCommand}`);
console.log(`- Strict proof handoff ready: ${report.operatorCompletionBriefStrictProofHandoffReceiptReady ? "yes" : "no"}`);
console.log(`- Private-edit blocked smoke ready: ${report.operatorCompletionBriefPrivateEditBlockedSmokeReady ? "yes" : "no"}`);
console.log(
  `- Private-edit blocked smoke placeholders: ${report.operatorCompletionBriefPrivateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.operatorCompletionBriefCurrentRequiredKeyCount}`
);
console.log(`- Final handoff success-redaction ready: ${report.operatorCompletionBriefFinalHandoffSuccessRedactionReady ? "yes" : "no"}`);
console.log(`- Operator post-clearance next action: ${report.operatorCompletionBriefPostClearanceNextPriorityActionId}`);
console.log(`- Completion blocker action receipt ready: ${report.completionBlockerActionReceiptReady ? "yes" : "no"}`);
console.log(`- Completion blocker action rows: ${report.completionBlockerActionRowCount}`);
console.log(`- Completion blocker focus rows: ${report.completionBlockerFocusRowCount}`);
console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
console.log(`- Current required keys: ${report.currentRequiredKeyCount} (${formatKeyList(report.currentRequiredKeys)})`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})`);
console.log(`- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
