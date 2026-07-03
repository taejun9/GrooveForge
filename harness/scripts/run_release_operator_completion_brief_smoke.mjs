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
const briefStem = "release-operator-completion-brief-smoke";
const briefMarkdownArtifactName = "release-operator-completion-brief-smoke.md";
const briefJsonArtifactName = "release-operator-completion-brief-smoke.json";
const briefMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${briefMarkdownArtifactName}`);
const briefJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${briefJsonArtifactName}`);
const completionReportPacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-completion-report-packet-smoke.json`);
const releaseProgressJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-report.json`);
const currentBlockerJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.json`);
const progressFreshnessJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-freshness-smoke.json`);
const releaseChannelPreflightBlockedJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-apply-private-env-preflight-blocked-smoke.json`);
const reportCommand = "npm run release:operator-completion-brief-smoke";
const completionPacketCommand = "npm run release:completion-report-packet-smoke";
const progressCommand = "npm run release:progress-smoke";
const currentBlockerCommand = "npm run release:current-blocker";
const currentBlockerSmokeCommand = "npm run release:current-blocker-smoke";
const freshnessCommand = "npm run release:progress-freshness-smoke";
const hardGateCommand = "npm run release:external-check";
const releasePrepareEnvCommand = "npm run release:prepare-env";
const privateEditOperatorProofCommand = "npm run release:private-edit-strict-proof";
const releaseChannelApplyPrivateEnvPreflightCommand = "npm run release:channel-apply-private-env-preflight";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
const releaseChannelSetupWizardCommand = "npm run release:channel-setup-wizard";
const privateInputFileKey = "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE";
const defaultPrivateInputFileName = ".env.release-channel.local";
const operatorPrivateInputFileDefaultPath = defaultPrivateInputFileName;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release operator completion brief smoke failed:");
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

function integerValueOr(value, fallback) {
  return Number.isInteger(value) ? value : fallback;
}

function objectRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object" && !Array.isArray(row)) : [];
}

function rowsValueFree(rows) {
  return objectRows(rows).every((row) => row.valueRecorded === false);
}

function commandOrder(rows, command) {
  const row = objectRows(rows).find((candidate) => candidate.command === command);
  return Number.isInteger(row?.order) ? row.order : 0;
}

function fieldsAreFalse(source, fields) {
  return fields.every((field) => source[field] === false);
}

function sourcePrivacyBoundaryReady({ completionReportPacket, releaseProgress, currentBlocker, progressFreshness }) {
  return (
    fieldsAreFalse(completionReportPacket, [
      "privateEditOperatorProofCommandValueRecorded",
      "strictProofHandoffReceiptValueRecorded",
      "privateEditBlockedSmokeValueRecorded",
      "finalHandoffSuccessRedactionValueRecorded",
      "updateFeedCheckpointValueRecorded",
      "tenPlanProgressReportReceiptValueRecorded",
      "tenPlanProgressReportRolloverValueRecorded",
      "privateValuesRecorded",
      "localEnvValueRecorded",
      "releaseUrlValueRecorded",
      "supportUrlValueRecorded",
      "feedValueRecorded",
      "credentialValueRecorded",
      "tokenValueRecorded",
      "channelValueRecorded",
      "developerIdIdentityValueRecorded",
      "privateBeatRecorded",
      "realUserAudioRecorded",
      "networkProbeAttempted",
      "updateFeedPublishAttempted",
      "distributionChannelProbeAttempted",
      "releaseUploadAttempted",
      "signingAttempted",
      "notarySubmissionAttempted",
      "claimedDeveloperIdSigning",
      "claimedNotarization",
      "claimedGatekeeperApproval",
      "claimedAutoUpdate",
      "claimedManualQaApproval",
      "claimedAppStoreSubmission",
      "claimedExternalDistribution",
      "valueRecorded"
    ]) &&
    fieldsAreFalse(releaseProgress, [
      "updateFeedCheckpointValueRecorded",
      "updateFeedCheckpointPrivateValuesRecorded",
      "updateFeedCheckpointFeedValueRecorded",
      "updateFeedCheckpointChannelValueRecorded",
      "updateFeedCheckpointLocalEnvValueRecorded",
      "updateFeedCheckpointNetworkProbeAttempted",
      "updateFeedCheckpointPublishAttempted",
      "updateFeedCheckpointReleaseUploadAttempted",
      "updateFeedCheckpointSigningAttempted",
      "updateFeedCheckpointNotarySubmissionAttempted",
      "updateFeedCheckpointClaimedAutoUpdate",
      "updateFeedCheckpointClaimedExternalDistribution",
      "localEnvValueRecorded",
      "privateValuesRecorded",
      "releaseUrlValueRecorded",
      "supportUrlValueRecorded",
      "feedValueRecorded",
      "credentialValueRecorded",
      "tokenValueRecorded",
      "channelValueRecorded",
      "developerIdIdentityValueRecorded",
      "networkProbeAttemptedByThisReport",
      "releaseUploadAttemptedByThisReport",
      "notarySubmissionAttemptedByThisReport",
      "signingAttemptedByThisReport",
      "releaseGateClaimedDeveloperIdSigning",
      "releaseGateClaimedNotarization",
      "releaseGateClaimedGatekeeperApproval",
      "releaseGateClaimedAutoUpdate",
      "releaseGateClaimedManualQaApproval",
      "releaseGateClaimedExternalDistribution",
      "userFacingCompletionPrivateValueRecorded",
      "completedPlanValueRecorded",
      "tenPlanProgressReportReceiptValueRecorded",
      "tenPlanProgressReportRolloverValueRecorded",
      "privateEditStrictProofValueRecorded",
      "privateEditStrictProofPrivateValuesRecorded",
      "privateEditStrictProofNetworkProbeAttempted",
      "privateEditStrictProofClaimedAutoUpdate",
      "privateEditStrictProofClaimedExternalDistribution"
    ]) &&
    fieldsAreFalse(currentBlocker, [
      "updateFeedCheckpointValueRecorded",
      "updateFeedCheckpointPrivateValuesRecorded",
      "updateFeedCheckpointFeedValueRecorded",
      "updateFeedCheckpointChannelValueRecorded",
      "updateFeedCheckpointLocalEnvValueRecorded",
      "updateFeedCheckpointNetworkProbeAttempted",
      "updateFeedCheckpointPublishAttempted",
      "updateFeedCheckpointReleaseUploadAttempted",
      "updateFeedCheckpointSigningAttempted",
      "updateFeedCheckpointNotarySubmissionAttempted",
      "updateFeedCheckpointClaimedAutoUpdate",
      "updateFeedCheckpointClaimedExternalDistribution",
      "privateEditStrictProofValueRecorded",
      "privateEditStrictProofPrivateValuesRecorded",
      "privateEditStrictProofNetworkProbeAttempted",
      "privateEditStrictProofClaimedAutoUpdate",
      "privateEditStrictProofClaimedExternalDistribution",
      "privateValuesRecorded",
      "networkProbeAttemptedByThisReport",
      "releaseUploadAttemptedByThisReport",
      "appleNotarySubmissionAttemptedByThisReport",
      "signingAttemptedByThisReport",
      "claimedDeveloperIdSigning",
      "claimedNotarization",
      "claimedGatekeeperApproval",
      "claimedAutoUpdate",
      "claimedManualQaApproval",
      "claimedAppStoreSubmission",
      "claimedExternalDistribution",
      "valueRecorded"
    ]) &&
    fieldsAreFalse(progressFreshness, [
      "privateValuesRecorded",
      "feedValueRecorded",
      "channelValueRecorded",
      "localEnvValueRecorded",
      "networkProbeAttempted",
      "updateFeedPublishAttempted",
      "releaseUploadAttempted",
      "signingAttempted",
      "notarySubmissionAttempted",
      "claimedDeveloperIdSigning",
      "claimedNotarization",
      "claimedGatekeeperApproval",
      "claimedAutoUpdate",
      "claimedManualQaApproval",
      "claimedAppStoreSubmission",
      "claimedExternalDistribution",
      "valueRecorded"
    ])
  );
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function sourceArtifactRows({ completionReportPacket, releaseProgress, currentBlocker, progressFreshness }) {
  return [
    {
      label: "Completion report packet",
      path: relative(completionReportPacketJsonPath),
      command: completionPacketCommand,
      present: true,
      ready: completionReportPacket.releaseCompletionReportPacketReady === true,
      progressLabel: textValue(completionReportPacket.latestTenPlanProgressLabel),
      valueRecorded: false
    },
    {
      label: "Release progress report",
      path: relative(releaseProgressJsonPath),
      command: progressCommand,
      present: true,
      ready: releaseProgress.releaseProgressReportReady === true,
      progressLabel: textValue(releaseProgress.currentTenPlanWindowLabel),
      valueRecorded: false
    },
    {
      label: "Release current blocker",
      path: relative(currentBlockerJsonPath),
      command: currentBlockerSmokeCommand,
      present: true,
      ready: currentBlocker.releaseCurrentBlockerReady === true,
      progressLabel: textValue(currentBlocker.currentTenPlanProgressLabel),
      valueRecorded: false
    },
    {
      label: "Release progress freshness",
      path: relative(progressFreshnessJsonPath),
      command: freshnessCommand,
      present: true,
      ready: progressFreshness.releaseProgressFreshnessReady === true,
      progressLabel: textValue(progressFreshness.latestTenPlanProgressLabel),
      valueRecorded: false
    }
  ];
}

function sanitizeEditRows(rows) {
  return objectRows(rows).map((row, index) => ({
    order: index + 1,
    key: textValue(row.key),
    editTarget: textValue(row.editTarget, ".env.distribution.local"),
    location: textValue(row.location),
    assignment: textValue(row.assignment),
    guidance: textValue(row.guidance),
    placeholder: row.placeholder === true,
    proofCommand: textValue(row.proofCommand, privateEditOperatorProofCommand),
    valueRecorded: row.valueRecorded === false ? false : true
  }));
}

function sanitizeProcessEnvInputChecklistRows(rows) {
  return objectRows(rows).map((row, index) => ({
    order: Number.isInteger(row.order) ? row.order : index + 1,
    key: textValue(row.key),
    inputSource: textValue(row.inputSource),
    inputPresent: row.inputPresent === true,
    inputPlaceholder: row.inputPlaceholder === true,
    inputShapeReady: row.inputShapeReady === true,
    expectedShape: textValue(row.expectedShape),
    preflightCommand: textValue(row.preflightCommand),
    writeCommand: textValue(row.writeCommand),
    proofCommand: textValue(row.proofCommand),
    valueRecorded: row.valueRecorded === false ? false : true
  }));
}

function sanitizePreflightOperatorReceiptRows(rows) {
  return objectRows(rows).map((row, index) => ({
    order: Number.isInteger(row.order) ? row.order : index + 1,
    step: textValue(row.step),
    status: textValue(row.status),
    command: textValue(row.command),
    target: textValue(row.target),
    expectedEvidence: textValue(row.expectedEvidence),
    operatorAction: textValue(row.operatorAction),
    valueRecorded: row.valueRecorded === false ? false : true
  }));
}

function releaseChannelMetadataPosture({ completionReportPacket, currentBlocker }) {
  const requiredKeyCount = integerValueOr(
    currentBlocker.releaseChannelLiveCheckCurrentRequiredKeyCount,
    integerValue(completionReportPacket.currentRequiredKeyCount)
  );
  const readyCount = integerValueOr(currentBlocker.releaseChannelLiveCheckCurrentReadyCount, 0);
  const placeholderKeyCount = integerValueOr(
    currentBlocker.releaseChannelLiveCheckCurrentPlaceholderKeyCount,
    integerValue(completionReportPacket.currentPlaceholderKeyCount)
  );
  const blocked = requiredKeyCount === 4 && readyCount < requiredKeyCount;
  const cleared = requiredKeyCount === 4 && readyCount === requiredKeyCount && placeholderKeyCount === 0;
  const needsIgnoredEnv = blocked && placeholderKeyCount === 0;
  return {
    requiredKeyCount,
    readyCount,
    placeholderKeyCount,
    needsIgnoredEnv,
    blocked,
    cleared,
    ready: blocked || cleared
  };
}

function operatorBriefRows({ completionReportPacket, currentBlocker, progressFreshness, currentEnvEditTarget }) {
  const releaseChannelPosture = releaseChannelMetadataPosture({ completionReportPacket, currentBlocker });
  const rows = [
    {
      step: "Preflight private release-channel metadata",
      command: releaseChannelApplyPrivateEnvPreflightCommand,
      evidence: releaseChannelPosture.cleared
        ? "release-channel metadata placeholders cleared in value-free receipts"
        : releaseChannelPosture.needsIgnoredEnv
          ? "ignored local distribution env is not loaded; release-channel setup must create it first"
          : `${releaseChannelPosture.placeholderKeyCount} current release-channel placeholders remain`,
      expectedPostEditSignal: `operator-owned process env metadata is shape-valid for ${currentEnvEditTarget}; ignored local env is not modified by preflight`,
      sourceField: "currentBlocker.releaseChannelPrivateEnvApplyPreflightCommand",
      valueRecorded: false
    },
    {
      step: "Edit private release-channel metadata",
      command: releaseChannelApplyPrivateEnvCommand,
      evidence: releaseChannelPosture.cleared
        ? "release-channel metadata placeholders cleared in value-free receipts"
        : releaseChannelPosture.needsIgnoredEnv
          ? "ignored local distribution env is not loaded; release-channel setup must create it first"
          : `${releaseChannelPosture.placeholderKeyCount} current release-channel placeholders remain after preflight is required`,
      expectedPostEditSignal: `operator-owned process env metadata applies into ${currentEnvEditTarget}; release-channel metadata placeholders clear in value-free receipts`,
      sourceField: "currentBlocker.releaseChannelLiveCheckCurrentPlaceholderKeyCount",
      valueRecorded: false
    },
    {
      step: "Run strict private-edit proof chain",
      command: privateEditOperatorProofCommand,
      evidence: textValue(completionReportPacket.privateEditProofCommandSummary),
      expectedPostEditSignal: "strict proof, post-edit proof, progress refresh, and private-value leak audit run before the hard gate",
      sourceField: "completionReportPacket.privateEditOperatorProofCommand/privateEditProofCommandRows",
      valueRecorded: false
    },
    {
      step: "Refresh current blocker",
      command: currentBlockerCommand,
      evidence: textValue(currentBlocker.currentRerunCommand, currentBlockerCommand),
      expectedPostEditSignal: "current blocker moves past release-channel metadata when private rows are shape-ready",
      sourceField: "currentBlocker.currentRerunCommand",
      valueRecorded: false
    },
    {
      step: "Refresh completion packet",
      command: completionPacketCommand,
      evidence: textValue(completionReportPacket.latestTenPlanProgressLabel),
      expectedPostEditSignal: "completion packet keeps the latest 10-plan label and reports the next blocker",
      sourceField: "completionReportPacket.latestTenPlanProgressLabel",
      valueRecorded: false
    },
    {
      step: "Verify progress freshness",
      command: freshnessCommand,
      evidence: `${integerValue(progressFreshness.freshArtifactCount)}/${integerValue(progressFreshness.freshnessRowCount)} fresh; stale ${integerValue(progressFreshness.staleArtifactCount)}; missing ${integerValue(progressFreshness.missingArtifactCount)}`,
      expectedPostEditSignal: "progress/current-blocker/completion packet remain aligned to the latest checkpoint",
      sourceField: "progressFreshness.freshnessRows",
      valueRecorded: false
    },
    {
      step: "Keep the hard gate last",
      command: hardGateCommand,
      evidence: `hard gate would fail: ${readyLabel(currentBlocker.hardGateWouldFail)}`,
      expectedPostEditSignal: "run only after private release-channel, auto-update, signing, notarization, Gatekeeper, and manual QA evidence are ready",
      sourceField: "currentBlocker.hardGateWouldFail",
      valueRecorded: false
    }
  ];
  if (releaseChannelPosture.needsIgnoredEnv === true) {
    rows.unshift({
      step: "Prepare ignored local distribution env",
      command: releasePrepareEnvCommand,
      evidence: "ignored local distribution env is not loaded; scaffold must exist before private metadata preflight",
      expectedPostEditSignal: `${currentEnvEditTarget} exists as an ignored local env scaffold before private release-channel metadata is applied`,
      sourceField: "currentBlocker.currentOperatorFirstCommand",
      valueRecorded: false
    });
  }
  return rows.map((row, index) => ({
    order: index + 1,
    ...row
  }));
}

function nextActionRows({ completionReportPacket, currentBlocker }) {
  return [
    {
      order: 1,
      stage: "after release-channel clears",
      actionId: textValue(completionReportPacket.postClearanceNextPriorityActionId, "auto-update-feed"),
      label: textValue(completionReportPacket.postClearanceNextPriorityActionLabel, "Auto-update feed and signed metadata"),
      proofCommand: textValue(completionReportPacket.postClearanceNextActionPreviewProofCommand, "npm run desktop:auto-update-readiness-smoke"),
      evidence: textValue(completionReportPacket.postClearanceNextActionPreviewFirstBlocker, currentBlocker.nextPriorityActionFirstBlocker),
      sourceField: "completionReportPacket.postClearanceNextPriorityActionId",
      valueRecorded: false
    },
    {
      order: 2,
      stage: "auto-update proof",
      actionId: textValue(currentBlocker.nextPriorityActionId, "auto-update-feed"),
      label: textValue(currentBlocker.nextPriorityActionLabel, "Auto-update feed and signed metadata"),
      proofCommand: textValue(currentBlocker.nextPriorityActionNextCommand, "npm run desktop:auto-update-readiness-smoke"),
      evidence: `${integerValue(currentBlocker.nextActionPreviewRequiredKeyCount)} update feed/channel keys; ${integerValue(currentBlocker.nextActionPreviewBlockerRowCount)} blockers`,
      sourceField: "currentBlocker.nextActionPreviewReadyCriteriaRows",
      valueRecorded: false
    },
    {
      order: 3,
      stage: "update-feed checkpoint",
      actionId: "update-feed-checkpoint",
      label: "Update-feed checkpoint",
      proofCommand: textValue(completionReportPacket.updateFeedCheckpointCommand, "npm run release:update-feed-checkpoint-smoke"),
      evidence: `real selected ${integerValue(completionReportPacket.updateFeedCheckpointRealSelectedReadyCount)}/2; synthetic selected ${integerValue(completionReportPacket.updateFeedCheckpointSyntheticSelectedReadyCount)}/2; hard gate would fail ${readyLabel(completionReportPacket.updateFeedCheckpointHardGateWouldFail)}`,
      sourceField: "completionReportPacket.updateFeedCheckpointRows",
      valueRecorded: false
    }
  ];
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${escapeCell(row.path)} | \`${escapeCell(row.command)}\` | ${readyLabel(row.present)} | ${readyLabel(row.ready)} | ${escapeCell(row.progressLabel)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatPreflightChecklistRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.inputSource)} | ${readyLabel(row.inputPresent)} | ${readyLabel(row.inputPlaceholder)} | ${readyLabel(row.inputShapeReady)} | ${escapeCell(row.expectedShape)} | \`${escapeCell(row.preflightCommand)}\` | \`${escapeCell(row.writeCommand)}\` | \`${escapeCell(row.proofCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatPreflightOperatorReceiptRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.step)} | ${escapeCell(row.status)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.target)} | ${escapeCell(row.expectedEvidence)} | ${escapeCell(row.operatorAction)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatEditRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.location)} | \`${escapeCell(row.assignment)}\` | ${escapeCell(row.guidance)} | ${row.placeholder ? "yes" : "no"} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatOperatorRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.step)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.evidence)} | ${escapeCell(row.expectedPostEditSignal)} | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCurrentOperatorCommandRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.step)} | ${row.ready === true ? "yes" : "no"} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${escapeCell(row.expectedOperatorInput)} | ${escapeCell(row.expectedEvidence)} | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatProofRows(rows) {
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatNextActionRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.stage)} | ${escapeCell(row.actionId)} | ${escapeCell(row.label)} | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.evidence)} | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function buildMarkdown(report) {
  return `# GrooveForge Release Operator Completion Brief Smoke

- Operator completion brief ready: ${readyLabel(report.releaseOperatorCompletionBriefReady)}
- Report command: \`${report.reportCommand}\`
- Source privacy boundary ready: ${readyLabel(report.sourcePrivacyBoundaryReady)}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Current 10-plan progress: ${report.latestTenPlanProgressLabel}
- Current blocker: ${report.currentFirstBlocker}
- Current edit target: ${report.currentEnvEditTarget}
- Current placeholder keys: ${report.currentPlaceholderKeyCount}/${report.currentRequiredKeyCount}
- Release-channel metadata blocked: ${readyLabel(report.releaseChannelMetadataBlocked)}
- Release-channel metadata cleared: ${readyLabel(report.releaseChannelMetadataCleared)}
- Release-channel current ready rows: ${report.releaseChannelCurrentReadyCount}/${report.releaseChannelCurrentRequiredKeyCount}
- Release-channel current placeholder keys: ${report.releaseChannelCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}
- Current operator command sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Current operator start command: \`${report.currentOperatorStartCommand}\`
- Current operator start command role: ${report.currentOperatorStartCommandRole}
- Current operator start command matches first command: ${readyLabel(report.currentOperatorStartCommandMatchesFirstCommand)}
- Operator brief first command: \`${report.operatorBriefFirstCommand}\`
- Operator brief first command matches current operator: ${readyLabel(report.operatorBriefFirstCommandMatchesCurrentOperator)}
- Operator brief first command matches current operator start: ${readyLabel(report.operatorBriefFirstCommandMatchesCurrentOperatorStart)}
- Current operator preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Current operator apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Preflight process env checklist source ready: ${readyLabel(report.preflightProcessEnvChecklistSourceReady)}
- Preflight process env checklist blocked smoke ready: ${readyLabel(report.preflightProcessEnvChecklistBlockedSmokeReady)}
- Preflight process env checklist expected blocked exit observed: ${readyLabel(report.preflightProcessEnvChecklistExpectedBlockedExitObserved)}
- Preflight process env checklist local env loaded: ${readyLabel(report.preflightProcessEnvChecklistLocalEnvFileLoaded)}
- Preflight process env checklist source exit status: ${report.preflightProcessEnvChecklistSourceExitStatus}
- Preflight process env checklist rows: ${report.preflightProcessEnvChecklistRowCount} (${report.preflightProcessEnvChecklistSummary})
- Preflight process env checklist ready rows: ${report.preflightProcessEnvChecklistReadyCount}/${report.preflightProcessEnvChecklistRowCount}
- Preflight process env checklist missing/placeholder/invalid rows: ${report.preflightProcessEnvChecklistMissingCount}/${report.preflightProcessEnvChecklistPlaceholderCount}/${report.preflightProcessEnvChecklistInvalidShapeCount}
- Preflight private input file key: \`${report.preflightPrivateInputFileKey}\`
- Preflight private input file default: \`${report.preflightPrivateInputFileDefaultName}\`
- Preflight operator private input file default path: \`${report.preflightOperatorPrivateInputFileDefaultPath}\`
- Preflight blocked-smoke private input file path: ${report.preflightPrivateInputFilePath}
- Preflight private input file loaded keys: ${report.preflightPrivateInputFileLoadedKeyCount} (${report.preflightPrivateInputFileLoadedKeySummary})
- Preflight guided setup fallback command: \`${report.preflightGuidedSetupFallbackCommand}\`
- Preflight operator receipt source ready: ${readyLabel(report.preflightOperatorReceiptSourceReady)}
- Preflight operator receipt rows: ${report.preflightOperatorReceiptRowCount} (${report.preflightOperatorReceiptSummary})
- Preflight operator receipt first command: \`${report.preflightOperatorReceiptFirstCommand}\`
- Preflight operator receipt includes hard gate: ${readyLabel(report.preflightOperatorReceiptIncludesHardGate)}
- Private-edit operator proof command: \`${report.privateEditOperatorProofCommand}\`
- Post-clearance next action: ${report.postClearanceNextPriorityActionLabel}
- Post-clearance proof command: \`${report.postClearanceNextActionPreviewProofCommand}\`
- Update-feed checkpoint ready: ${readyLabel(report.updateFeedCheckpointReady)}
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Fresh artifacts: ${report.freshArtifactCount}/${report.freshnessRowCount}
- Stale artifacts: ${report.staleArtifactCount}
- Missing artifacts: ${report.missingArtifactCount}
- Private values recorded: ${readyLabel(report.privateValuesRecorded)}
- Feed values recorded: ${readyLabel(report.feedValueRecorded)}
- Channel values recorded: ${readyLabel(report.channelValueRecorded)}
- Network probe attempted: ${readyLabel(report.networkProbeAttempted)}
- Update feed publish attempted: ${readyLabel(report.updateFeedPublishAttempted)}
- Release upload attempted: ${readyLabel(report.releaseUploadAttempted)}
- Signing attempted: ${readyLabel(report.signingAttempted)}
- Apple notary submission attempted: ${readyLabel(report.notarySubmissionAttempted)}
- Auto-update claimed: ${readyLabel(report.claimedAutoUpdate)}
- External distribution claimed: ${readyLabel(report.claimedExternalDistribution)}

## Source Artifacts

| label | path | command | present | ready | 10-plan | value recorded |
|---|---|---|---:|---:|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Preflight Process Env Input Checklist

| order | key | input source | input present | input placeholder | input shape ready | expected shape | preflight command | write command | proof command | value recorded |
|---:|---|---|---:|---:|---:|---|---|---|---|---:|
${formatPreflightChecklistRows(report.preflightProcessEnvChecklistRows)}

## Preflight Operator Receipt

| order | step | status | command | target | expected evidence | operator action | value recorded |
|---:|---|---|---|---|---|---|---:|
${formatPreflightOperatorReceiptRows(report.preflightOperatorReceiptRows)}

## Current Private Edit Rows

| order | key | location | assignment | guidance | placeholder | value recorded |
|---:|---|---|---|---|---:|---:|
${formatEditRows(report.currentEnvEditRows)}

## Operator Brief Rows

| order | step | command | evidence | expected post-edit signal | source | value recorded |
|---:|---|---|---|---|---|---:|
${formatOperatorRows(report.operatorBriefRows)}

## Current Operator Command Sequence

| order | step | ready | command | role | expected operator input | expected evidence | source | value recorded |
|---:|---|---:|---|---|---|---|---|---:|
${formatCurrentOperatorCommandRows(report.currentOperatorCommandRows)}

## Private-Edit Proof Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatProofRows(report.privateEditProofCommandRows)}

## Post-Clearance Next Action Rows

| order | stage | action | label | proof command | evidence | source | value recorded |
|---:|---|---|---|---|---|---|---:|
${formatNextActionRows(report.postClearanceNextActionRows)}

## Non-Claiming Boundary

This brief reads existing value-free release evidence only. It does not read or modify the ignored local env file, does not record URL/channel/feed values, does not probe networks, does not publish feeds, does not upload releases, does not sign artifacts, does not submit to Apple, and does not claim auto-update or external distribution completion.
`;
}

function sourceLabelsMatchLatest(rows, latestLabel) {
  return rows.every((row) => row.progressLabel === latestLabel);
}

function outputLooksValueFree(text) {
  return !/https?:\/\//i.test(text) && !/:\/\/[^<\s]+/i.test(text);
}

function buildReport({ completionReportPacket, releaseProgress, currentBlocker, progressFreshness, releaseChannelPreflightBlocked }) {
  const latestTenPlanProgressLabel = textValue(completionReportPacket.latestTenPlanProgressLabel);
  const sourceRows = sourceArtifactRows({ completionReportPacket, releaseProgress, currentBlocker, progressFreshness });
  const preflightProcessEnvChecklistRows = sanitizeProcessEnvInputChecklistRows(releaseChannelPreflightBlocked.processEnvInputChecklistRows);
  const preflightOperatorReceiptRows = sanitizePreflightOperatorReceiptRows(releaseChannelPreflightBlocked.operatorReceiptRows);
  const preflightProcessEnvChecklistSourceReady =
    releaseChannelPreflightBlocked.blockedSmokeReady === true &&
    releaseChannelPreflightBlocked.expectedBlockedExitObserved === true &&
    releaseChannelPreflightBlocked.sourceCommand === releaseChannelApplyPrivateEnvPreflightCommand &&
    releaseChannelPreflightBlocked.currentOperatorFirstCommand === releaseChannelApplyPrivateEnvPreflightCommand &&
    releaseChannelPreflightBlocked.nextWriteCommand === releaseChannelApplyPrivateEnvCommand &&
    releaseChannelPreflightBlocked.recommendedOperatorProofCommand === privateEditOperatorProofCommand &&
    releaseChannelPreflightBlocked.privateValuesRecorded === false &&
    releaseChannelPreflightBlocked.localEnvValueRecorded === false &&
    releaseChannelPreflightBlocked.releaseUrlValueRecorded === false &&
    releaseChannelPreflightBlocked.supportUrlValueRecorded === false &&
    releaseChannelPreflightBlocked.channelValueRecorded === false &&
    releaseChannelPreflightBlocked.networkProbeAttempted === false &&
    releaseChannelPreflightBlocked.releaseUploadAttempted === false &&
    releaseChannelPreflightBlocked.signingAttempted === false &&
    releaseChannelPreflightBlocked.notarySubmissionAttempted === false &&
    releaseChannelPreflightBlocked.claimedExternalDistribution === false &&
    preflightProcessEnvChecklistRows.length === 4 &&
    preflightProcessEnvChecklistRows.every((row) => row.inputSource === "process.env") &&
    preflightProcessEnvChecklistRows.every((row) => row.preflightCommand === releaseChannelApplyPrivateEnvPreflightCommand) &&
    preflightProcessEnvChecklistRows.every((row) => row.writeCommand === releaseChannelApplyPrivateEnvCommand) &&
    preflightProcessEnvChecklistRows.every((row) => row.proofCommand === privateEditOperatorProofCommand) &&
    releaseChannelPreflightBlocked.privateInputFileKey === privateInputFileKey &&
    releaseChannelPreflightBlocked.privateInputFileDefaultName === defaultPrivateInputFileName &&
    releaseChannelPreflightBlocked.operatorPrivateInputFileDefaultPath === operatorPrivateInputFileDefaultPath &&
    releaseChannelPreflightBlocked.operatorPrivateInputFileDefaultPathValueRecorded === false &&
    releaseChannelPreflightBlocked.privateInputFileValueRecorded === false &&
    releaseChannelPreflightBlocked.guidedSetupFallbackCommand === releaseChannelSetupWizardCommand &&
    releaseChannelPreflightBlocked.guidedSetupFallbackValueRecorded === false &&
    preflightProcessEnvChecklistRows.every((row) => row.valueRecorded === false);
  const preflightOperatorReceiptFirstCommand = textValue(preflightOperatorReceiptRows[0]?.command, "none");
  const preflightOperatorReceiptIncludesHardGate = preflightOperatorReceiptRows.some((row) => row.command === hardGateCommand);
  const preflightOperatorReceiptSourceReady =
    releaseChannelPreflightBlocked.operatorReceiptReady === true &&
    integerValue(releaseChannelPreflightBlocked.operatorReceiptRowCount) === 6 &&
    preflightOperatorReceiptRows.length === 6 &&
    preflightOperatorReceiptFirstCommand === releaseChannelApplyPrivateEnvPreflightCommand &&
    preflightOperatorReceiptRows.some((row) => row.command === releaseChannelApplyPrivateEnvCommand) &&
    preflightOperatorReceiptRows.some((row) => row.command === privateEditOperatorProofCommand) &&
    preflightOperatorReceiptIncludesHardGate === true &&
    preflightOperatorReceiptRows.every((row) => row.valueRecorded === false);
  const currentEnvEditTarget = textValue(completionReportPacket.currentEnvEditTarget, currentBlocker.currentEnvEditTarget);
  const currentEnvEditRows = sanitizeEditRows(currentBlocker.currentEnvEditRows);
  const operatorRows = operatorBriefRows({ completionReportPacket, currentBlocker, progressFreshness, currentEnvEditTarget });
  const currentOperatorCommandRows = objectRows(currentBlocker.currentOperatorCommandRows);
  const currentOperatorPreflightCommandOrder = integerValue(currentBlocker.currentOperatorPreflightCommandOrder) || commandOrder(currentOperatorCommandRows, releaseChannelApplyPrivateEnvPreflightCommand);
  const currentOperatorApplyCommandOrder = integerValue(currentBlocker.currentOperatorApplyCommandOrder) || commandOrder(currentOperatorCommandRows, releaseChannelApplyPrivateEnvCommand);
  const currentOperatorStrictProofCommandOrder = integerValue(currentBlocker.currentOperatorStrictProofCommandOrder) || commandOrder(currentOperatorCommandRows, privateEditOperatorProofCommand);
  const currentOperatorFirstCommand = textValue(currentBlocker.currentOperatorFirstCommand, currentOperatorCommandRows[0]?.command ?? "none");
  const currentOperatorStartCommand = textValue(currentBlocker.currentOperatorStartCommand, currentOperatorFirstCommand);
  const currentOperatorStartCommandRole = textValue(
    currentBlocker.currentOperatorStartCommandRole,
    currentOperatorCommandRows[0]?.role ?? "none"
  );
  const currentOperatorPreflightBeforeApply =
    currentBlocker.currentOperatorPreflightBeforeApply === true ||
    (currentOperatorPreflightCommandOrder > 0 && currentOperatorPreflightCommandOrder < currentOperatorApplyCommandOrder);
  const currentOperatorApplyBeforeStrictProof =
    currentBlocker.currentOperatorApplyBeforeStrictProof === true ||
    (currentOperatorApplyCommandOrder > 0 && currentOperatorApplyCommandOrder < currentOperatorStrictProofCommandOrder);
  const currentOperatorCommandSequenceReady =
    currentBlocker.currentOperatorCommandSequenceReady === true &&
    integerValue(currentBlocker.currentOperatorCommandRowCount) === currentOperatorCommandRows.length &&
    currentOperatorCommandRows.length >= 5 &&
    currentOperatorCommandRows.every((row) => row.ready === true && row.valueRecorded === false) &&
    currentOperatorPreflightCommandOrder > 0 &&
    currentOperatorApplyCommandOrder > currentOperatorPreflightCommandOrder &&
    currentOperatorStrictProofCommandOrder > currentOperatorApplyCommandOrder;
  const operatorBriefFirstCommand = textValue(operatorRows[0]?.command, "none");
  const operatorBriefFirstCommandMatchesCurrentOperator = operatorBriefFirstCommand === currentOperatorFirstCommand;
  const operatorBriefFirstCommandMatchesCurrentOperatorStart = operatorBriefFirstCommand === currentOperatorStartCommand;
  const proofRows = objectRows(completionReportPacket.privateEditProofCommandRows);
  const postClearanceRows = nextActionRows({ completionReportPacket, currentBlocker });
  const sourceBoundaryReady = sourcePrivacyBoundaryReady({ completionReportPacket, releaseProgress, currentBlocker, progressFreshness });
  const releaseChannelPosture = releaseChannelMetadataPosture({ completionReportPacket, currentBlocker });
  const currentEditRowsReady =
    currentEnvEditRows.length > 0 &&
    currentEnvEditRows.every((row) => row.valueRecorded === false) &&
    (releaseChannelPosture.blocked
      ? currentEnvEditRows.length === 4 &&
        (releaseChannelPosture.needsIgnoredEnv === true || currentEnvEditRows.every((row) => row.placeholder === true))
      : true);
  const ready =
    sourceRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
    sourceLabelsMatchLatest(sourceRows, latestTenPlanProgressLabel) &&
    sourceBoundaryReady === true &&
    completionReportPacket.releaseCompletionReportPacketReady === true &&
    completionReportPacket.sourceLabelsMatchLatestTenPlan === true &&
    releaseProgress.releaseProgressReportReady === true &&
    currentBlocker.releaseCurrentBlockerReady === true &&
    progressFreshness.releaseProgressFreshnessReady === true &&
    integerValue(progressFreshness.staleArtifactCount) === 0 &&
    integerValue(progressFreshness.missingArtifactCount) === 0 &&
    releaseChannelPosture.ready === true &&
    currentEditRowsReady === true &&
    preflightProcessEnvChecklistSourceReady === true &&
    preflightOperatorReceiptSourceReady === true &&
    operatorRows.length === (releaseChannelPosture.needsIgnoredEnv === true ? 8 : 7) &&
    operatorRows.every((row) => row.valueRecorded === false) &&
    currentOperatorCommandSequenceReady === true &&
    operatorBriefFirstCommandMatchesCurrentOperator === true &&
    proofRows.length === 5 &&
    proofRows.every((row) => row.valueRecorded === false) &&
    postClearanceRows.length === 3 &&
    postClearanceRows.every((row) => row.valueRecorded === false) &&
    completionReportPacket.strictProofHandoffReceiptReady === true &&
    completionReportPacket.privateEditBlockedSmokeReady === true &&
    completionReportPacket.finalHandoffSuccessRedactionReady === true &&
    completionReportPacket.updateFeedCheckpointReady === true &&
    completionReportPacket.updateFeedCheckpointHardGateWouldFail === true &&
    currentBlocker.hardGateReady === false &&
    currentBlocker.hardGateWouldFail === true &&
    completionReportPacket.claimedExternalDistribution === false &&
    currentBlocker.claimedExternalDistribution === false &&
    releaseProgress.releaseGateClaimedExternalDistribution === false &&
    progressFreshness.claimedExternalDistribution === false;
  return {
    appName,
    bundleId,
    version: packageJson.version,
    platformArch,
    reportCommand,
    releaseOperatorCompletionBriefMarkdownArtifactName: briefMarkdownArtifactName,
    releaseOperatorCompletionBriefJsonArtifactName: briefJsonArtifactName,
    releaseOperatorCompletionBriefMarkdownPath: relative(briefMarkdownPath),
    releaseOperatorCompletionBriefJsonPath: relative(briefJsonPath),
    releaseOperatorCompletionBriefReady: ready,
    sourceArtifactRows: sourceRows,
    sourceArtifactRowCount: sourceRows.length,
    sourceLabelsMatchLatestTenPlan: sourceLabelsMatchLatest(sourceRows, latestTenPlanProgressLabel),
    sourcePrivacyBoundaryReady: sourceBoundaryReady,
    preflightProcessEnvChecklistSourceReady,
    preflightProcessEnvChecklistArtifactPath: relative(releaseChannelPreflightBlockedJsonPath),
    preflightProcessEnvChecklistReportCommand: textValue(releaseChannelPreflightBlocked.sourceCommand),
    preflightProcessEnvChecklistPreflightOnly: true,
    preflightProcessEnvChecklistBlockedSmokeReady: releaseChannelPreflightBlocked.blockedSmokeReady === true,
    preflightProcessEnvChecklistExpectedBlockedExitObserved: releaseChannelPreflightBlocked.expectedBlockedExitObserved === true,
    preflightProcessEnvChecklistLocalEnvFileLoaded: releaseChannelPreflightBlocked.localEnvFileLoaded === true,
    preflightProcessEnvChecklistSourceExitStatus: integerValue(releaseChannelPreflightBlocked.sourceExitStatus),
    preflightProcessEnvChecklistRows,
    preflightProcessEnvChecklistRowCount: preflightProcessEnvChecklistRows.length,
    preflightProcessEnvChecklistReadyCount: preflightProcessEnvChecklistRows.filter((row) => row.inputShapeReady === true).length,
    preflightProcessEnvChecklistMissingCount: preflightProcessEnvChecklistRows.filter((row) => row.inputPresent !== true).length,
    preflightProcessEnvChecklistPlaceholderCount: preflightProcessEnvChecklistRows.filter((row) => row.inputPlaceholder === true).length,
    preflightProcessEnvChecklistInvalidShapeCount: preflightProcessEnvChecklistRows.filter(
      (row) => row.inputPresent === true && row.inputPlaceholder === false && row.inputShapeReady !== true
    ).length,
    preflightProcessEnvChecklistSummary:
      preflightProcessEnvChecklistRows.length > 0
        ? `${preflightProcessEnvChecklistRows.length} value-free process.env input checklist rows`
        : "none",
    preflightPrivateInputFileKey: textValue(releaseChannelPreflightBlocked.privateInputFileKey),
    preflightPrivateInputFileDefaultName: textValue(releaseChannelPreflightBlocked.privateInputFileDefaultName),
    preflightOperatorPrivateInputFileDefaultPath: textValue(releaseChannelPreflightBlocked.operatorPrivateInputFileDefaultPath),
    preflightOperatorPrivateInputFileDefaultPathValueRecorded:
      releaseChannelPreflightBlocked.operatorPrivateInputFileDefaultPathValueRecorded === true,
    preflightPrivateInputFilePath: textValue(releaseChannelPreflightBlocked.privateInputFilePath),
    preflightPrivateInputFilePathMode: textValue(releaseChannelPreflightBlocked.privateInputFilePathMode),
    preflightPrivateInputFilePresent: releaseChannelPreflightBlocked.privateInputFilePresent === true,
    preflightPrivateInputFileLoadedKeyCount: integerValue(releaseChannelPreflightBlocked.privateInputFileLoadedKeyCount),
    preflightPrivateInputFileLoadedKeySummary: textValue(releaseChannelPreflightBlocked.privateInputFileLoadedKeySummary),
    preflightPrivateInputFileValueRecorded: releaseChannelPreflightBlocked.privateInputFileValueRecorded === true,
    preflightGuidedSetupFallbackCommand: textValue(releaseChannelPreflightBlocked.guidedSetupFallbackCommand),
    preflightGuidedSetupFallbackValueRecorded: releaseChannelPreflightBlocked.guidedSetupFallbackValueRecorded === true,
    preflightOperatorReceiptSourceReady,
    preflightOperatorReceiptArtifactPath: relative(releaseChannelPreflightBlockedJsonPath),
    preflightOperatorReceiptReady: releaseChannelPreflightBlocked.operatorReceiptReady === true,
    preflightOperatorReceiptRows,
    preflightOperatorReceiptRowCount: preflightOperatorReceiptRows.length,
    preflightOperatorReceiptFirstCommand,
    preflightOperatorReceiptIncludesHardGate,
    preflightOperatorReceiptSummary:
      preflightOperatorReceiptRows.length > 0
        ? `${preflightOperatorReceiptRows.length} value-free private-env handoff rows`
        : "none",
    releaseChannelMetadataPostureReady: releaseChannelPosture.ready,
    releaseChannelMetadataBlocked: releaseChannelPosture.blocked,
    releaseChannelMetadataCleared: releaseChannelPosture.cleared,
    releaseChannelMetadataNeedsIgnoredEnv: releaseChannelPosture.needsIgnoredEnv,
    releaseChannelCurrentRequiredKeyCount: releaseChannelPosture.requiredKeyCount,
    releaseChannelCurrentReadyCount: releaseChannelPosture.readyCount,
    releaseChannelCurrentPlaceholderKeyCount: releaseChannelPosture.placeholderKeyCount,
    currentOperatorCommandSequenceReady,
    currentOperatorCommandRows,
    currentOperatorCommandRowCount: currentOperatorCommandRows.length,
    currentOperatorCommandSummary:
      currentOperatorCommandRows.length > 0 ? `${currentOperatorCommandRows.length} value-free current operator command rows` : "none",
    currentOperatorFirstCommand,
    currentOperatorStartCommand,
    currentOperatorStartCommandRole,
    currentOperatorStartCommandMatchesFirstCommand:
      currentBlocker.currentOperatorStartCommandMatchesFirstCommand === true ||
      currentOperatorStartCommand === currentOperatorFirstCommand,
    currentOperatorPreflightCommand: textValue(
      currentBlocker.currentOperatorPreflightCommand,
      releaseChannelApplyPrivateEnvPreflightCommand
    ),
    currentOperatorPreflightCommandOrder,
    currentOperatorApplyCommand: textValue(currentBlocker.currentOperatorApplyCommand, releaseChannelApplyPrivateEnvCommand),
    currentOperatorApplyCommandOrder,
    currentOperatorStrictProofCommand: textValue(currentBlocker.currentOperatorStrictProofCommand, privateEditOperatorProofCommand),
    currentOperatorStrictProofCommandOrder,
    currentOperatorBlockerRefreshCommand: textValue(currentBlocker.currentOperatorBlockerRefreshCommand, currentBlockerCommand),
    currentOperatorNextActionsRefreshCommand: textValue(currentBlocker.currentOperatorNextActionsRefreshCommand, "npm run release:next-actions"),
    currentOperatorPreflightBeforeApply,
    currentOperatorApplyBeforeStrictProof,
    currentOperatorStartCommandValueRecorded:
      currentBlocker.currentOperatorStartCommandValueRecorded === true ? true : false,
    currentOperatorValueRecorded: currentOperatorCommandRows.some((row) => row.valueRecorded !== false),
    latestCompletedPlanNumber: integerValue(completionReportPacket.latestCompletedPlanNumber),
    latestTenPlanProgressLabel,
    latestTenPlanCompletedCount: integerValue(completionReportPacket.latestTenPlanCompletedCount),
    latestTenPlanTotal: integerValue(completionReportPacket.latestTenPlanTotal),
    tenPlanProgressReportDue: completionReportPacket.tenPlanProgressReportDue === true,
    nextScheduledTenPlanProgressReportAt: textValue(completionReportPacket.nextScheduledTenPlanProgressReportAt),
    userFacingCompletionPercent: completionReportPacket.userFacingCompletionPercent,
    userFacingRemainingPercent: completionReportPacket.userFacingRemainingPercent,
    currentActionLabel: textValue(completionReportPacket.currentActionLabel, currentBlocker.currentPriorityActionLabel),
    currentFirstBlocker: textValue(completionReportPacket.currentFirstBlocker, currentBlocker.currentFirstBlocker),
    currentEnvEditTarget,
    currentRequiredKeyCount: integerValue(completionReportPacket.currentRequiredKeyCount),
    currentPlaceholderKeyCount: integerValue(completionReportPacket.currentPlaceholderKeyCount),
    currentEnvEditRows,
    currentEnvEditRowCount: currentEnvEditRows.length,
    operatorBriefRows: operatorRows,
    operatorBriefRowCount: operatorRows.length,
    operatorBriefFirstCommand,
    operatorBriefFirstCommandMatchesCurrentOperator,
    operatorBriefFirstCommandMatchesCurrentOperatorStart,
    privateEditOperatorProofCommand: textValue(completionReportPacket.privateEditOperatorProofCommand, privateEditOperatorProofCommand),
    privateEditProofCommandRows: proofRows,
    privateEditProofCommandCount: proofRows.length,
    privateEditProofCommandSummary: textValue(completionReportPacket.privateEditProofCommandSummary),
    strictProofHandoffReceiptReady: completionReportPacket.strictProofHandoffReceiptReady === true,
    privateEditBlockedSmokeReady: completionReportPacket.privateEditBlockedSmokeReady === true,
    privateEditBlockedSmokeCurrentPlaceholderKeyCount: integerValue(completionReportPacket.privateEditBlockedSmokeCurrentPlaceholderKeyCount),
    finalHandoffSuccessRedactionReady: completionReportPacket.finalHandoffSuccessRedactionReady === true,
    finalHandoffSuccessRedactionCurrentReadyCount: integerValue(completionReportPacket.finalHandoffSuccessRedactionCurrentReadyCount),
    finalHandoffSuccessRedactionCurrentPlaceholderKeyCount: integerValue(completionReportPacket.finalHandoffSuccessRedactionCurrentPlaceholderKeyCount),
    postClearanceNextPriorityActionId: textValue(completionReportPacket.postClearanceNextPriorityActionId, "auto-update-feed"),
    postClearanceNextPriorityActionLabel: textValue(completionReportPacket.postClearanceNextPriorityActionLabel, "Auto-update feed and signed metadata"),
    postClearanceNextActionPreviewProofCommand: textValue(completionReportPacket.postClearanceNextActionPreviewProofCommand, "npm run desktop:auto-update-readiness-smoke"),
    postClearanceNextActionRows: postClearanceRows,
    postClearanceNextActionRowCount: postClearanceRows.length,
    updateFeedCheckpointReady: completionReportPacket.updateFeedCheckpointReady === true,
    updateFeedCheckpointCommand: textValue(completionReportPacket.updateFeedCheckpointCommand, "npm run release:update-feed-checkpoint-smoke"),
    updateFeedCheckpointRealSelectedReadyCount: integerValue(completionReportPacket.updateFeedCheckpointRealSelectedReadyCount),
    updateFeedCheckpointRealPlaceholderKeyCount: integerValue(completionReportPacket.updateFeedCheckpointRealPlaceholderKeyCount),
    updateFeedCheckpointSyntheticSelectedReadyCount: integerValue(completionReportPacket.updateFeedCheckpointSyntheticSelectedReadyCount),
    updateFeedCheckpointSyntheticPlaceholderKeyCount: integerValue(completionReportPacket.updateFeedCheckpointSyntheticPlaceholderKeyCount),
    updateFeedCheckpointHardGateWouldFail: completionReportPacket.updateFeedCheckpointHardGateWouldFail === true,
    hardGateCommand,
    hardGateReady: currentBlocker.hardGateReady === true,
    hardGateWouldFail: currentBlocker.hardGateWouldFail === true,
    freshnessRowCount: integerValue(progressFreshness.freshnessRowCount),
    freshArtifactCount: integerValue(progressFreshness.freshArtifactCount),
    staleArtifactCount: integerValue(progressFreshness.staleArtifactCount),
    missingArtifactCount: integerValue(progressFreshness.missingArtifactCount),
    refreshCommandCount: integerValue(progressFreshness.refreshCommandCount),
    privateValuesRecorded: false,
    feedValueRecorded: false,
    channelValueRecorded: false,
    localEnvValueRecorded: false,
    networkProbeAttempted: false,
    updateFeedPublishAttempted: false,
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

const completionReportPacket = await readJsonRequired(completionReportPacketJsonPath, "Completion report packet");
const releaseProgress = await readJsonRequired(releaseProgressJsonPath, "Release progress report");
const currentBlocker = await readJsonRequired(currentBlockerJsonPath, "Release current blocker");
const progressFreshness = await readJsonRequired(progressFreshnessJsonPath, "Release progress freshness");
const releaseChannelPreflightBlocked = await readJsonRequired(releaseChannelPreflightBlockedJsonPath, "Release-channel private env preflight blocked smoke");
const report = buildReport({ completionReportPacket, releaseProgress, currentBlocker, progressFreshness, releaseChannelPreflightBlocked });
const markdown = buildMarkdown(report);
const jsonText = `${JSON.stringify(report, null, 2)}\n`;

check(report.releaseOperatorCompletionBriefReady === true, "release operator completion brief should be ready");
check(report.sourceArtifactRowCount === 4, "release operator completion brief should include four source artifacts");
check(report.sourceArtifactRows.every((row) => row.ready === true && row.valueRecorded === false), "release operator completion brief source rows should be ready and value-free");
check(report.sourceLabelsMatchLatestTenPlan === true, "release operator completion brief source labels should match latest 10-plan progress");
check(report.sourcePrivacyBoundaryReady === true, "release operator completion brief source privacy boundaries should be ready");
check(report.preflightProcessEnvChecklistSourceReady === true, "release operator completion brief should include ready private-env preflight checklist source");
check(report.preflightProcessEnvChecklistBlockedSmokeReady === true, "release operator completion brief preflight checklist should come from the blocked preflight smoke");
check(report.preflightProcessEnvChecklistExpectedBlockedExitObserved === true, "release operator completion brief preflight checklist should preserve expected blocked exit evidence");
check(report.preflightProcessEnvChecklistRowCount === 4, "release operator completion brief preflight checklist should include four process env rows");
check(report.preflightProcessEnvChecklistRows.every((row) => row.inputSource === "process.env"), "release operator completion brief preflight checklist rows should identify process.env input source");
check(report.preflightProcessEnvChecklistRows.every((row) => row.preflightCommand === releaseChannelApplyPrivateEnvPreflightCommand), "release operator completion brief preflight checklist rows should carry preflight command");
check(report.preflightProcessEnvChecklistRows.every((row) => row.writeCommand === releaseChannelApplyPrivateEnvCommand), "release operator completion brief preflight checklist rows should carry apply command");
check(report.preflightProcessEnvChecklistRows.every((row) => row.proofCommand === privateEditOperatorProofCommand), "release operator completion brief preflight checklist rows should carry strict proof command");
check(report.preflightProcessEnvChecklistRows.every((row) => row.valueRecorded === false), "release operator completion brief preflight checklist rows should be value-free");
check(report.preflightPrivateInputFileKey === privateInputFileKey, "release operator completion brief should expose the private input file key");
check(report.preflightPrivateInputFileDefaultName === defaultPrivateInputFileName, "release operator completion brief should expose the private input file default");
check(
  report.preflightOperatorPrivateInputFileDefaultPath === operatorPrivateInputFileDefaultPath,
  "release operator completion brief should expose the operator private input file default path"
);
check(
  report.preflightOperatorPrivateInputFileDefaultPathValueRecorded === false,
  "release operator completion brief operator private input file default path should be value-free"
);
check(report.preflightPrivateInputFilePath !== "none", "release operator completion brief should expose the blocked-smoke private input file path");
check(report.preflightPrivateInputFilePathMode === "blocked-smoke-isolated-missing-input-file", "release operator completion brief should keep blocked-smoke private input file path mode");
check(report.preflightPrivateInputFilePresent === false, "release operator completion brief should keep blocked-smoke private input file absent");
check(report.preflightPrivateInputFileLoadedKeyCount === 0, "release operator completion brief should mirror zero loaded private input file keys");
check(report.preflightPrivateInputFileValueRecorded === false, "release operator completion brief private input file path should be value-free");
check(report.preflightGuidedSetupFallbackCommand === releaseChannelSetupWizardCommand, "release operator completion brief should expose guided setup fallback");
check(report.preflightGuidedSetupFallbackValueRecorded === false, "release operator completion brief guided setup fallback should be value-free");
check(report.preflightOperatorReceiptSourceReady === true, "release operator completion brief should include ready private-env operator receipt source");
check(report.preflightOperatorReceiptReady === true, "release operator completion brief should mirror a ready private-env operator receipt");
check(report.preflightOperatorReceiptRowCount === 6, "release operator completion brief preflight operator receipt should include six rows");
check(report.preflightOperatorReceiptFirstCommand === releaseChannelApplyPrivateEnvPreflightCommand, "release operator completion brief preflight operator receipt should start with preflight");
check(
  report.preflightOperatorReceiptRows.some((row) => row.command === releaseChannelApplyPrivateEnvCommand),
  "release operator completion brief preflight operator receipt should include apply command"
);
check(
  report.preflightOperatorReceiptRows.some((row) => row.command === privateEditOperatorProofCommand),
  "release operator completion brief preflight operator receipt should include strict proof chain"
);
check(report.preflightOperatorReceiptIncludesHardGate === true, "release operator completion brief preflight operator receipt should include hard-gate boundary");
check(report.preflightOperatorReceiptRows.every((row) => row.valueRecorded === false), "release operator completion brief preflight operator receipt rows should be value-free");
check(report.latestTenPlanProgressLabel === completionReportPacket.latestTenPlanProgressLabel, "release operator completion brief should mirror completion packet 10-plan progress");
check(report.userFacingCompletionPercent === 99.999999, "release operator completion brief should keep user-facing completion percent");
check(report.userFacingRemainingPercent === 0.000001, "release operator completion brief should keep remaining completion percent");
check(report.currentEnvEditTarget !== "none", "release operator completion brief should point at the ignored local env target");
check(report.releaseChannelMetadataPostureReady === true, "release operator completion brief should accept blocked or cleared release-channel metadata posture");
check(report.releaseChannelCurrentRequiredKeyCount === 4, "release operator completion brief should track four release-channel metadata keys");
check(
  report.releaseChannelMetadataBlocked !== report.releaseChannelMetadataCleared,
  "release operator completion brief should report exactly one release-channel metadata posture"
);
check(
  !report.releaseChannelMetadataBlocked || [0, 4].includes(report.releaseChannelCurrentPlaceholderKeyCount),
  "release operator completion brief blocked posture should keep release-channel placeholders or require ignored env setup"
);
check(
  !report.releaseChannelMetadataCleared ||
    (report.releaseChannelCurrentReadyCount === 4 && report.releaseChannelCurrentPlaceholderKeyCount === 0),
  "release operator completion brief cleared posture should report four ready release-channel rows and zero placeholders"
);
check(report.currentEnvEditRowCount > 0, "release operator completion brief should include current edit rows");
check(report.currentEnvEditRows.every((row) => row.valueRecorded === false), "release operator completion brief edit rows should be value-free");
check(
  !report.releaseChannelMetadataBlocked ||
    report.releaseChannelMetadataNeedsIgnoredEnv === true ||
    report.currentEnvEditRows.every((row) => row.placeholder === true),
  "release operator completion brief blocked edit rows should be placeholders unless ignored env setup is required"
);
check(
  report.operatorBriefRowCount === (report.releaseChannelMetadataNeedsIgnoredEnv === true ? 8 : 7),
  "release operator completion brief should include prepare-env only when ignored env setup is required"
);
check(report.operatorBriefRows.every((row) => row.valueRecorded === false), "release operator completion brief rows should be value-free");
check(report.currentOperatorCommandSequenceReady === true, "release operator completion brief current operator command sequence should be ready");
check(Array.isArray(report.currentOperatorCommandRows), "release operator completion brief should include current operator command rows");
check(report.currentOperatorCommandRowCount === report.currentOperatorCommandRows.length, "release operator completion brief current operator command row count should match rows");
check(report.currentOperatorCommandRows.length >= 5, "release operator completion brief current operator command sequence should include preflight, apply, strict proof, blocker refresh, and next-actions refresh");
check(report.currentOperatorCommandRows.every((row) => row.ready === true && row.valueRecorded === false), "release operator completion brief current operator command rows should be ready and value-free");
check(report.currentOperatorFirstCommand !== "none", "release operator completion brief should expose current operator first command");
check(report.currentOperatorStartCommand === report.currentOperatorFirstCommand, "release operator completion brief current operator start command should mirror first command");
check(report.currentOperatorStartCommand === report.currentOperatorCommandRows[0]?.command, "release operator completion brief current operator start command should match first row command");
check(report.currentOperatorStartCommandRole === report.currentOperatorCommandRows[0]?.role, "release operator completion brief current operator start command role should match first row role");
check(report.currentOperatorStartCommandMatchesFirstCommand === true, "release operator completion brief current operator start command should declare first-command match");
check(report.currentOperatorStartCommandValueRecorded === false, "release operator completion brief current operator start command should be value-free");
check(report.operatorBriefFirstCommandMatchesCurrentOperator === true, "release operator completion brief first command should match current operator first command");
check(report.operatorBriefFirstCommandMatchesCurrentOperatorStart === true, "release operator completion brief first command should match current operator start command");
check(report.currentOperatorPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand, "release operator completion brief current operator sequence should expose private env preflight command");
check(report.currentOperatorApplyCommand === releaseChannelApplyPrivateEnvCommand, "release operator completion brief current operator sequence should expose private env apply command");
check(report.currentOperatorStrictProofCommand === privateEditOperatorProofCommand, "release operator completion brief current operator sequence should expose strict proof command");
check(report.currentOperatorBlockerRefreshCommand === currentBlockerCommand, "release operator completion brief current operator sequence should expose current-blocker refresh command");
check(report.currentOperatorNextActionsRefreshCommand === "npm run release:next-actions", "release operator completion brief current operator sequence should expose next-actions refresh command");
check(report.currentOperatorPreflightBeforeApply === true, "release operator completion brief current operator sequence should place preflight before apply");
check(report.currentOperatorApplyBeforeStrictProof === true, "release operator completion brief current operator sequence should place apply before strict proof");
check(report.currentOperatorValueRecorded === false, "release operator completion brief current operator sequence should not record values");
check(
  report.operatorBriefRows.some((row) => row.command === releaseChannelApplyPrivateEnvPreflightCommand),
  "release operator completion brief should include the private env preflight command"
);
check(
  report.operatorBriefRows.findIndex((row) => row.command === releaseChannelApplyPrivateEnvPreflightCommand) <
    report.operatorBriefRows.findIndex((row) => row.command === releaseChannelApplyPrivateEnvCommand),
  "release operator completion brief should place private env preflight before apply"
);
check(report.privateEditOperatorProofCommand === privateEditOperatorProofCommand, "release operator completion brief should expose the private-edit strict proof command");
check(report.privateEditProofCommandCount === 5, "release operator completion brief should include five private-edit proof commands");
check(report.privateEditProofCommandRows.every((row) => row.valueRecorded === false), "release operator completion brief proof command rows should be value-free");
check(report.strictProofHandoffReceiptReady === true, "release operator completion brief should include strict proof handoff readiness");
check(report.privateEditBlockedSmokeReady === true, "release operator completion brief should include blocked smoke readiness");
check(report.finalHandoffSuccessRedactionReady === true, "release operator completion brief should include final handoff success-redaction readiness");
check(report.finalHandoffSuccessRedactionCurrentReadyCount === 4, "release operator completion brief should include synthetic four-row readiness");
check(report.finalHandoffSuccessRedactionCurrentPlaceholderKeyCount === 0, "release operator completion brief synthetic handoff should clear placeholders");
check(report.postClearanceNextPriorityActionId === "auto-update-feed", "release operator completion brief should surface auto-update-feed as the next action");
check(report.postClearanceNextActionPreviewProofCommand === "npm run desktop:auto-update-readiness-smoke", "release operator completion brief should surface auto-update readiness proof command");
check(report.postClearanceNextActionRowCount === 3, "release operator completion brief should include three post-clearance next action rows");
check(report.postClearanceNextActionRows.every((row) => row.valueRecorded === false), "release operator completion brief next action rows should be value-free");
check(report.updateFeedCheckpointReady === true, "release operator completion brief should include update-feed checkpoint readiness");
check(report.updateFeedCheckpointHardGateWouldFail === true, "release operator completion brief should keep update-feed checkpoint hard gate blocked");
check(report.hardGateCommand === hardGateCommand, "release operator completion brief should keep hard gate command");
check(report.hardGateReady === false, "release operator completion brief should keep hard gate unready");
check(report.hardGateWouldFail === true, "release operator completion brief should keep hard gate would-fail posture");
check(report.freshArtifactCount === report.freshnessRowCount, "release operator completion brief should report all freshness artifacts fresh");
check(report.staleArtifactCount === 0, "release operator completion brief should report zero stale artifacts");
check(report.missingArtifactCount === 0, "release operator completion brief should report zero missing artifacts");
check(rowsValueFree(report.sourceArtifactRows), "release operator completion brief source artifact rows should not record values");
check(rowsValueFree(report.preflightProcessEnvChecklistRows), "release operator completion brief preflight checklist rows should not record values");
check(rowsValueFree(report.preflightOperatorReceiptRows), "release operator completion brief preflight operator receipt rows should not record values");
check(rowsValueFree(report.currentEnvEditRows), "release operator completion brief current edit rows should not record values");
check(rowsValueFree(report.operatorBriefRows), "release operator completion brief operator rows should not record values");
check(rowsValueFree(report.currentOperatorCommandRows), "release operator completion brief current operator command rows should not record values");
check(rowsValueFree(report.privateEditProofCommandRows), "release operator completion brief proof rows should not record values");
check(rowsValueFree(report.postClearanceNextActionRows), "release operator completion brief next action rows should not record values");
check(report.privateValuesRecorded === false, "release operator completion brief should not record private values");
check(report.feedValueRecorded === false, "release operator completion brief should not record feed values");
check(report.channelValueRecorded === false, "release operator completion brief should not record channel values");
check(report.localEnvValueRecorded === false, "release operator completion brief should not record local env values");
check(report.networkProbeAttempted === false, "release operator completion brief should not probe network");
check(report.updateFeedPublishAttempted === false, "release operator completion brief should not publish update feeds");
check(report.releaseUploadAttempted === false, "release operator completion brief should not upload releases");
check(report.signingAttempted === false, "release operator completion brief should not sign artifacts");
check(report.notarySubmissionAttempted === false, "release operator completion brief should not submit to Apple notary");
check(report.claimedAutoUpdate === false, "release operator completion brief should not claim auto-update");
check(report.claimedExternalDistribution === false, "release operator completion brief should not claim external distribution");
check(outputLooksValueFree(jsonText), "release operator completion brief JSON should not include URL values");
check(outputLooksValueFree(markdown), "release operator completion brief Markdown should not include URL values");
check(markdown.includes("Release Operator Completion Brief Smoke"), "release operator completion brief Markdown should include title");
check(markdown.includes("Preflight Process Env Input Checklist"), "release operator completion brief Markdown should include preflight checklist");
check(markdown.includes("Preflight operator private input file default path:"), "release operator completion brief Markdown should include operator private input path guidance");
check(markdown.includes("Preflight guided setup fallback command:"), "release operator completion brief Markdown should include guided setup fallback");
check(markdown.includes("Preflight Operator Receipt"), "release operator completion brief Markdown should include preflight operator receipt");
check(markdown.includes("Operator Brief Rows"), "release operator completion brief Markdown should include operator rows");
check(markdown.includes("Current Operator Command Sequence"), "release operator completion brief Markdown should include current operator command sequence");
check(markdown.includes("Current operator start command:"), "release operator completion brief Markdown should include current operator start command");
check(markdown.includes("Operator brief first command matches current operator start:"), "release operator completion brief Markdown should include brief/start-command match");
check(markdown.includes("Current Private Edit Rows"), "release operator completion brief Markdown should include edit rows");
check(markdown.includes("Post-Clearance Next Action Rows"), "release operator completion brief Markdown should include next action rows");
check(markdown.includes("External distribution claimed: no"), "release operator completion brief Markdown should include non-claiming posture");

if (failures.length > 0) {
  fail("Validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await mkdir(packageRoot, { recursive: true });
await writeFile(briefJsonPath, jsonText);
await writeFile(briefMarkdownPath, markdown);

console.log("GrooveForge release operator completion brief smoke passed.");
console.log(`- Markdown: ${relative(briefMarkdownPath)}`);
console.log(`- JSON: ${relative(briefJsonPath)}`);
console.log(`- Operator completion brief ready: ${report.releaseOperatorCompletionBriefReady ? "yes" : "no"}`);
console.log(`- Source privacy boundary ready: ${report.sourcePrivacyBoundaryReady ? "yes" : "no"}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log(`- Current 10-plan progress: ${report.latestTenPlanProgressLabel}`);
console.log(`- Current blocker: ${report.currentFirstBlocker}`);
console.log(`- Current edit target: ${report.currentEnvEditTarget}`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}/${report.currentRequiredKeyCount}`);
console.log(`- Release-channel metadata blocked: ${report.releaseChannelMetadataBlocked ? "yes" : "no"}`);
console.log(`- Release-channel metadata cleared: ${report.releaseChannelMetadataCleared ? "yes" : "no"}`);
console.log(`- Release-channel current ready rows: ${report.releaseChannelCurrentReadyCount}/${report.releaseChannelCurrentRequiredKeyCount}`);
console.log(`- Release-channel current placeholder keys: ${report.releaseChannelCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}`);
console.log(`- Current operator command sequence ready: ${report.currentOperatorCommandSequenceReady ? "yes" : "no"}`);
console.log(`- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})`);
console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
console.log(`- Current operator start command: ${report.currentOperatorStartCommand}`);
console.log(`- Current operator start command role: ${report.currentOperatorStartCommandRole}`);
console.log(`- Current operator start command matches first command: ${report.currentOperatorStartCommandMatchesFirstCommand ? "yes" : "no"}`);
console.log(`- Operator brief first command: ${report.operatorBriefFirstCommand}`);
console.log(`- Operator brief first command matches current operator: ${report.operatorBriefFirstCommandMatchesCurrentOperator ? "yes" : "no"}`);
console.log(`- Operator brief first command matches current operator start: ${report.operatorBriefFirstCommandMatchesCurrentOperatorStart ? "yes" : "no"}`);
console.log(`- Current operator preflight before apply: ${report.currentOperatorPreflightBeforeApply ? "yes" : "no"}`);
console.log(`- Current operator apply before strict proof: ${report.currentOperatorApplyBeforeStrictProof ? "yes" : "no"}`);
console.log(`- Preflight process env checklist source ready: ${report.preflightProcessEnvChecklistSourceReady ? "yes" : "no"}`);
console.log(`- Preflight process env checklist blocked smoke ready: ${report.preflightProcessEnvChecklistBlockedSmokeReady ? "yes" : "no"}`);
console.log(`- Preflight process env checklist expected blocked exit observed: ${report.preflightProcessEnvChecklistExpectedBlockedExitObserved ? "yes" : "no"}`);
console.log(`- Preflight process env checklist local env loaded: ${report.preflightProcessEnvChecklistLocalEnvFileLoaded ? "yes" : "no"}`);
console.log(`- Preflight process env checklist source exit status: ${report.preflightProcessEnvChecklistSourceExitStatus}`);
console.log(`- Preflight process env checklist rows: ${report.preflightProcessEnvChecklistRowCount} (${report.preflightProcessEnvChecklistSummary})`);
console.log(`- Preflight process env checklist ready rows: ${report.preflightProcessEnvChecklistReadyCount}/${report.preflightProcessEnvChecklistRowCount}`);
console.log(`- Preflight process env checklist missing/placeholder/invalid rows: ${report.preflightProcessEnvChecklistMissingCount}/${report.preflightProcessEnvChecklistPlaceholderCount}/${report.preflightProcessEnvChecklistInvalidShapeCount}`);
console.log(`- Preflight private input file key: ${report.preflightPrivateInputFileKey}`);
console.log(`- Preflight private input file default: ${report.preflightPrivateInputFileDefaultName}`);
console.log(`- Preflight operator private input file default path: ${report.preflightOperatorPrivateInputFileDefaultPath}`);
console.log(`- Preflight blocked-smoke private input file path: ${report.preflightPrivateInputFilePath}`);
console.log(`- Preflight private input file loaded keys: ${report.preflightPrivateInputFileLoadedKeyCount}`);
console.log(`- Preflight guided setup fallback command: ${report.preflightGuidedSetupFallbackCommand}`);
console.log(`- Preflight operator receipt source ready: ${report.preflightOperatorReceiptSourceReady ? "yes" : "no"}`);
console.log(`- Preflight operator receipt rows: ${report.preflightOperatorReceiptRowCount} (${report.preflightOperatorReceiptSummary})`);
console.log(`- Preflight operator receipt first command: ${report.preflightOperatorReceiptFirstCommand}`);
console.log(`- Preflight operator receipt includes hard gate: ${report.preflightOperatorReceiptIncludesHardGate ? "yes" : "no"}`);
console.log(`- Private-edit operator proof command: ${report.privateEditOperatorProofCommand}`);
console.log(`- Post-clearance next action: ${report.postClearanceNextPriorityActionLabel}`);
console.log(`- Post-clearance proof command: ${report.postClearanceNextActionPreviewProofCommand}`);
console.log(`- Update-feed checkpoint ready: ${report.updateFeedCheckpointReady ? "yes" : "no"}`);
console.log(`- Hard gate would fail: ${report.hardGateWouldFail ? "yes" : "no"}`);
console.log(`- Fresh artifacts: ${report.freshArtifactCount}/${report.freshnessRowCount}`);
console.log(`- Private values recorded: ${report.privateValuesRecorded ? "yes" : "no"}`);
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
