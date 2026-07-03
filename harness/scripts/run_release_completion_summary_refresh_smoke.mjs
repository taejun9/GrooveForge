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
const receiptStem = "release-completion-summary-refresh-smoke";
const progressRefreshStem = "release-progress-refresh-smoke";
const completionSummaryStem = "release-completion-summary-smoke";
const checkpointStem = "release-10-plan-checkpoint-smoke";
const externalRunPacketStem = "release-external-completion-run-packet-smoke";
const externalResumePacketStem = "release-external-completion-resume-packet-smoke";
const operatorPreflightStem = "release-channel-apply-private-env-preflight";
const progressRefreshJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${progressRefreshStem}.json`);
const completionSummaryJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${completionSummaryStem}.json`);
const checkpointJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${checkpointStem}.json`);
const externalRunPacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${externalRunPacketStem}.json`);
const externalResumePacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${externalResumePacketStem}.json`);
const operatorPreflightJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${operatorPreflightStem}.json`);
const receiptMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${receiptStem}.md`);
const receiptJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${receiptStem}.json`);
const failures = [];
const releaseChannelPrivateInputTemplateCommand = "npm run release:channel-private-input-template";
const releaseChannelPrivateInputTemplateRole =
  "create the ignored .env.release-channel.local skeleton for the four private release-channel metadata values before preflight";
const releaseChannelApplyPrivateEnvPreflightCommand = "npm run release:channel-apply-private-env-preflight";
const releaseChannelApplyPrivateEnvPreflightRole =
  "verify operator-owned release-channel process env values before writing the ignored local env";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
const releaseChannelApplyPrivateEnvRole =
  "apply operator-owned release-channel process env values into the ignored local env before strict proof";
const releaseChannelSetupWizardCommand = "npm run release:channel-setup-wizard";
const privateInputFileKey = "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE";
const defaultPrivateInputFileName = ".env.release-channel.local";
const operatorPrivateInputFileDefaultPath = defaultPrivateInputFileName;
const blockedPrivateInputFilePathMode = "blocked-smoke-isolated-missing-input-file";

const requiredRefreshCommands = [
  {
    order: 1,
    command: "npm run release:progress-refresh-smoke",
    role: "refresh progress, current-blocker, completion-packet, freshness, and operator-brief evidence",
    condition: "always",
    skipped: false,
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:completion-summary-smoke",
    role: "emit compact after-work completion summary from the refreshed progress receipt",
    condition: "always",
    skipped: false,
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:external-completion-run-packet-smoke -- --from-existing-completion-summary",
    role: "refresh the ordered external completion run packet from the just-refreshed completion summary",
    condition: "always",
    skipped: false,
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run release:external-completion-resume-packet-smoke -- --from-existing-run-packet",
    role: "refresh the current external completion resume packet from the ordered run packet",
    condition: "always",
    skipped: false,
    valueRecorded: false
  },
  {
    order: 5,
    command: releaseChannelApplyPrivateEnvPreflightCommand,
    role: "leave the real operator private-input preflight receipt after synthetic resume-packet coverage",
    condition: "always; exit 0 or expected blocked exit 1",
    allowBlockedExit: true,
    skipped: false,
    valueRecorded: false
  }
];

const checkpointCommandRow = {
  order: 6,
  command: "npm run release:10-plan-checkpoint-smoke",
  role: "emit the 10-plan checkpoint receipt at a completed report boundary",
  condition: "when 10-plan progress is 10/10",
  skipped: true,
  valueRecorded: false
};

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release completion summary refresh smoke failed:");
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

function percentLabel(value, fallback = "none") {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}%`;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const trimmed = value.trim();
    return trimmed.endsWith("%") ? trimmed : `${trimmed}%`;
  }
  return fallback;
}

function percentNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().replace(/%$/, "");
    const parsed = Number.parseFloat(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
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

function formatKeyList(keys) {
  return keys.length > 0 ? keys.join(", ") : "none";
}

function parseNpmRunCommand(command) {
  const parts = command.trim().split(/\s+/);
  if (parts[0] !== "npm" || parts[1] !== "run" || !parts[2]) {
    fail(`Unsupported refresh command: ${command}`);
  }
  return {
    scriptName: parts[2],
    args: parts.slice(3)
  };
}

function runNpmScript(command, { allowBlockedExit = false } = {}) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const { scriptName, args } = parseNpmRunCommand(command);
  const result = spawnSync(npmCommand, ["run", scriptName, ...args], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail(`Could not run ${command}.`, result.error.message);
  }
  if (result.status !== 0 && !(allowBlockedExit === true && result.status === 1)) {
    fail(`${command} exited with status ${result.status}.`, "Refresh the required release evidence, then rerun this command.");
  }
  return result.status ?? 0;
}

function runGit(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8"
  });
  if (result.error || result.status !== 0) {
    return "unavailable";
  }
  return String(result.stdout ?? "").trim() || "unavailable";
}

function buildGitContext() {
  const headSha = runGit(["rev-parse", "HEAD"]);
  const branchName = runGit(["branch", "--show-current"]);
  const statusOutput = runGit(["status", "--porcelain"]);
  const dirtyLines = statusOutput === "unavailable" ? [] : statusOutput.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const gitContextReady = /^[0-9a-f]{40}$/i.test(headSha) && branchName !== "unavailable";
  return {
    gitContextReady,
    gitBranch: branchName === "unavailable" || branchName.length === 0 ? "detached" : branchName,
    gitHeadSha: headSha,
    gitHeadShortSha: /^[0-9a-f]{40}$/i.test(headSha) ? headSha.slice(0, 8) : "unavailable",
    gitWorktreeName: path.basename(root),
    gitDirty: dirtyLines.length > 0,
    gitDirtyFileCount: dirtyLines.length,
    gitStatusPathsRecorded: false,
    valueRecorded: false
  };
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function tenPlanCheckpointRequired(summary) {
  return summary.tenPlanReportDue === true && integerValue(summary.tenPlanCompletedCount) === 10 && integerValue(summary.tenPlanTotal) === 10;
}

function buildRefreshCommands(checkpointRequired) {
  return [
    ...requiredRefreshCommands,
    {
      ...checkpointCommandRow,
      skipped: !checkpointRequired
    }
  ];
}

function commandStatus(row) {
  return row.skipped === true ? "skipped" : "run";
}

function formatCommandRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${escapeCell(row.condition)} | ${commandStatus(row)} | ${row.valueRecorded ? "yes" : "no"} |`
    )
    .join("\n");
}

function checkpointStatus({ required, ready }) {
  if (!required) {
    return "not-due";
  }
  return ready ? "ready" : "blocked";
}

function checkpointRowsValueFree(checkpoint) {
  if (!checkpoint) {
    return true;
  }
  return Array.isArray(checkpoint.tenPlanWindowRows) && checkpoint.tenPlanWindowRows.every((row) => row.valueRecorded === false);
}

function checkpointReadyLabel(report) {
  return report.tenPlanCheckpointRequired ? readyLabel(report.tenPlanCheckpointReady) : "not due";
}

function checkpointFieldRows(report) {
  return [
    ["required", readyLabel(report.tenPlanCheckpointRequired)],
    ["run", readyLabel(report.tenPlanCheckpointRun)],
    ["ready", checkpointReadyLabel(report)],
    ["status", report.tenPlanCheckpointStatus],
    ["reason", report.tenPlanCheckpointReason],
    ["skipped reason", report.tenPlanCheckpointSkippedReason],
    ["artifact", report.tenPlanCheckpointJsonPath],
    ["latest plan", report.checkpointLatestPlan],
    ["10-plan progress", report.checkpointTenPlanProgress],
    ["current boundary", report.currentTenPlanReportBoundaryAt],
    ["post-delivery next report", report.postDeliveryNextTenPlanProgressReportAt],
    ["source ready", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointSourceReady) : "not due"],
    ["source labels match", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointSourceLabelsMatch) : "not due"],
    ["proof/gate refresh ready", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointProofGateRefreshReady) : "not due"],
    ["proof bundle refresh command", report.checkpointProofBundleRefreshCommand],
    ["external gate refresh command", report.checkpointExternalGateRefreshCommand],
    ["proof/gate rows value-free", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointProofGateRowsValueFree) : "not due"],
    ["current operator sequence ready", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorCommandSequenceReady) : "not due"],
    ["current operator first command", report.checkpointCurrentOperatorFirstCommand],
    ["current operator first command matches summary", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorFirstCommandMatchesSummary) : "not due"],
    ["current operator first command is guided setup", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorFirstCommandIsGuidedSetup) : "not due"],
    ["current operator rows contain guided setup", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorRowsContainGuidedSetup) : "not due"],
    ["current operator rows value-free", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorRowsValueFree) : "not due"],
    ["current operator preflight before apply", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorPreflightBeforeApply) : "not due"],
    ["current operator apply before strict proof", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorApplyBeforeStrictProof) : "not due"],
    ["rows value-free", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointRowsValueFree) : "not due"],
    ["private values recorded", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointPrivateValuesRecorded) : "not due"],
    ["auto-update claimed", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointClaimedAutoUpdate) : "not due"],
    ["external distribution claimed", report.tenPlanCheckpointRequired ? readyLabel(report.checkpointClaimedExternalDistribution) : "not due"]
  ].map(([field, value], index) => ({
    order: index + 1,
    field,
    value,
    valueRecorded: false
  }));
}

function formatCheckpointRows(rows) {
  return rows.map((row) => `| ${row.order} | ${escapeCell(row.field)} | ${escapeCell(row.value)} | ${row.valueRecorded ? "yes" : "no"} |`).join("\n");
}

function gitContextRows(gitContext) {
  return [
    ["context ready", readyLabel(gitContext.gitContextReady)],
    ["branch", gitContext.gitBranch],
    ["head", gitContext.gitHeadShortSha],
    ["worktree", gitContext.gitWorktreeName],
    ["dirty", readyLabel(gitContext.gitDirty)],
    ["dirty file count", gitContext.gitDirtyFileCount],
    ["status paths recorded", readyLabel(gitContext.gitStatusPathsRecorded)]
  ].map(([field, value], index) => ({
    order: index + 1,
    field,
    value,
    valueRecorded: false
  }));
}

function formatGitContextRows(rows) {
  return rows.map((row) => `| ${row.order} | ${escapeCell(row.field)} | ${escapeCell(row.value)} | ${row.valueRecorded ? "yes" : "no"} |`).join("\n");
}

function userFacingCompletionRows(report) {
  return [
    ["completion percent", report.userFacingCompletionPercent],
    ["completion label", report.userFacingCompletionLabel],
    ["remaining percent", report.userFacingRemainingPercent],
    ["remaining label", report.userFacingRemainingLabel],
    ["source field", "completionPercent/remainingPercent"]
  ].map(([field, value], index) => ({
    order: index + 1,
    field,
    value,
    valueRecorded: false
  }));
}

function formatUserFacingCompletionRows(rows) {
  return rows.map((row) => `| ${row.order} | ${escapeCell(row.field)} | ${escapeCell(row.value)} | ${row.valueRecorded ? "yes" : "no"} |`).join("\n");
}

function formatCompletionBlockerActionRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.item)} | ${readyLabel(row.ready === true)} | ${escapeCell(row.currentState)} | ${escapeCell(row.operatorAction)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCompletionBlockerFocusRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.key)} | ${readyLabel(row.present === true)} | ${readyLabel(row.placeholder === true)} | ${readyLabel(row.shapeReady === true)} | ${readyLabel(row.currentReady === true)} | ${escapeCell(row.expectedSignal)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatProcessEnvInputRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.key)} | ${escapeCell(row.inputSource)} | ${readyLabel(row.inputPresent === true)} | ${readyLabel(row.inputPlaceholder === true)} | ${readyLabel(row.inputShapeReady === true)} | ${escapeCell(row.expectedShape)} | \`${escapeCell(row.preflightCommand)}\` | \`${escapeCell(row.writeCommand)}\` | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatPreflightRemediationRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.key)} | ${readyLabel(row.inputPresent === true)} | ${readyLabel(row.inputPlaceholder === true)} | ${readyLabel(row.inputShapeReady === true)} | ${escapeCell(row.remediation)} | \`${escapeCell(row.nextCommand)}\` | \`${escapeCell(row.writeCommand)}\` | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
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

function buildReport({ progressRefresh, completionSummary, externalResume, operatorPreflight, operatorPreflightExitStatus, checkpoint, gitContext }) {
  const checkpointRequired = tenPlanCheckpointRequired(completionSummary);
  const checkpointReady = checkpointRequired ? checkpoint?.tenPlanCheckpointReady === true : false;
  const userFacingCompletionPercent = percentNumber(completionSummary.completionPercent);
  const userFacingRemainingPercent = percentNumber(completionSummary.remainingPercent);
  const userFacingCompletionLabel = percentLabel(completionSummary.completionPercent);
  const userFacingRemainingLabel = percentLabel(completionSummary.remainingPercent);
  const completionBlockerActionRows = objectRows(completionSummary.completionBlockerActionRows);
  const completionBlockerFocusRows = objectRows(completionSummary.completionBlockerFocusRows);
  const currentOperatorCommandRows = objectRows(completionSummary.currentOperatorCommandRows);
  const externalResumeRows = objectRows(externalResume.resumeRows);
  const externalResumeAlreadyReadyRows = objectRows(externalResume.alreadyReadyRows);
  const externalResumePreflightProcessEnvInputRows = objectRows(externalResume.privateEnvPreflightProcessEnvInputRows);
  const externalResumePreflightRemediationRows = objectRows(externalResume.privateEnvPreflightRemediationRows);
  const externalResumePreflightOperatorReceiptRows = objectRows(externalResume.privateEnvPreflightOperatorReceiptRows);
  const realOperatorPreflightProcessEnvInputRows = objectRows(operatorPreflight.processEnvInputChecklistRows);
  const realOperatorPreflightRemediationRows = objectRows(operatorPreflight.preflightRemediationRows);
  const realOperatorPreflightOperatorReceiptRows = objectRows(operatorPreflight.operatorReceiptRows);
  const realOperatorPreflightReady =
    operatorPreflight.reportCommand === releaseChannelApplyPrivateEnvPreflightCommand &&
    operatorPreflight.preflightOnly === true &&
    [0, 1].includes(operatorPreflightExitStatus) &&
    operatorPreflight.localEnvModified === false &&
    operatorPreflight.realLocalEnvModified === false &&
    operatorPreflight.privateInputFileValueRecorded === false &&
    valueFreeRows(realOperatorPreflightProcessEnvInputRows) &&
    valueFreeRows(realOperatorPreflightRemediationRows) &&
    valueFreeRows(realOperatorPreflightOperatorReceiptRows) &&
    operatorPreflight.privateValuesRecorded === false &&
    operatorPreflight.valueRecorded === false &&
    operatorPreflight.networkProbeAttempted === false &&
    operatorPreflight.releaseUploadAttempted === false &&
    operatorPreflight.notarySubmissionAttempted === false &&
    operatorPreflight.signingAttempted === false &&
    operatorPreflight.releaseGateClaimedExternalDistribution === false;
  const externalResumeReady =
    externalResume.externalCompletionResumePacketReady === true &&
    externalResume.sourcePacketReady === true &&
    externalResume.sourcePacketValueFree === true &&
    externalResume.privateEnvPreflightBlockedReady === true &&
    externalResume.privateEnvPreflightExpectedBlockedExitObserved === true &&
    externalResume.privateEnvPreflightProcessEnvInputRowsValueFree === true &&
    externalResume.privateEnvPreflightRemediationRowsValueFree === true &&
    externalResume.privateEnvPreflightOperatorReceiptRowsValueFree === true &&
    externalResume.privateEnvPreflightOperatorPrivateInputFileDefaultPathValueRecorded === false &&
    externalResume.privateEnvPreflightPrivateInputFileValueRecorded === false &&
    externalResume.privateEnvPreflightGuidedSetupFallbackValueRecorded === false &&
    externalResume.nextResumeMatchesCurrentOperatorFirstCommand === true &&
    externalResume.resumeRowsValueFree === true &&
    externalResume.alreadyReadyRowsValueFree === true &&
    externalResume.privateValuesRecorded === false &&
    externalResume.claimedExternalDistribution === false &&
    externalResume.valueRecorded === false;
  const report = {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:completion-summary-refresh-smoke",
    refreshCommands: buildRefreshCommands(checkpointRequired),
    progressRefreshCommand: "npm run release:progress-refresh-smoke",
    completionSummaryCommand: "npm run release:completion-summary-smoke",
    tenPlanCheckpointCommand: checkpointCommandRow.command,
    progressRefreshJsonArtifactName: "release-progress-refresh-smoke.json",
    completionSummaryJsonArtifactName: "release-completion-summary-smoke.json",
    externalCompletionRunPacketJsonArtifactName: "release-external-completion-run-packet-smoke.json",
    externalCompletionResumePacketJsonArtifactName: "release-external-completion-resume-packet-smoke.json",
    realOperatorPreflightJsonArtifactName: "release-channel-apply-private-env-preflight.json",
    tenPlanCheckpointJsonArtifactName: "release-10-plan-checkpoint-smoke.json",
    completionSummaryRefreshMarkdownArtifactName: "release-completion-summary-refresh-smoke.md",
    completionSummaryRefreshJsonArtifactName: "release-completion-summary-refresh-smoke.json",
    progressRefreshJsonPath: relative(progressRefreshJsonPath),
    completionSummaryJsonPath: relative(completionSummaryJsonPath),
    externalCompletionRunPacketJsonPath: relative(externalRunPacketJsonPath),
    externalCompletionResumePacketJsonPath: relative(externalResumePacketJsonPath),
    realOperatorPreflightJsonPath: relative(operatorPreflightJsonPath),
    tenPlanCheckpointJsonPath: checkpointRequired ? relative(checkpointJsonPath) : "not due",
    completionSummaryRefreshMarkdownPath: relative(receiptMarkdownPath),
    completionSummaryRefreshJsonPath: relative(receiptJsonPath),
    progressRefreshReady: progressRefresh.releaseProgressRefreshReady === true,
    progressRefreshCompletionSummaryReady: progressRefresh.completionSummary?.ready === true,
    progressRefreshLabelsMatch: progressRefresh.labelsMatch === true,
    completionSummaryReadoutReady: completionSummary.completionSummaryReadoutReady === true,
    completionSummarySourceReady: completionSummary.sourceReady === true,
    completionSummarySourceSummaryReady: completionSummary.sourceSummaryReady === true,
    completionSummarySourceLabelsMatch: completionSummary.sourceLabelsMatch === true,
    latestPlanNumber: integerValue(completionSummary.latestPlanNumber),
    latestPlan: textValue(completionSummary.latestPlan),
    tenPlanProgress: textValue(completionSummary.tenPlanProgress),
    tenPlanCompletedCount: integerValue(completionSummary.tenPlanCompletedCount),
    tenPlanTotal: integerValue(completionSummary.tenPlanTotal),
    tenPlanReportDue: completionSummary.tenPlanReportDue === true,
    completionPercent: userFacingCompletionLabel,
    remainingPercent: userFacingRemainingLabel,
    userFacingCompletionPercent,
    userFacingCompletionLabel,
    userFacingRemainingPercent,
    userFacingRemainingLabel,
    freshArtifactCount: integerValue(completionSummary.freshArtifactCount),
    staleArtifactCount: integerValue(completionSummary.staleArtifactCount),
    missingArtifactCount: integerValue(completionSummary.missingArtifactCount),
    operatorBriefReady: completionSummary.operatorBriefReady === true,
    releaseChannelMetadataBlocked: completionSummary.releaseChannelMetadataBlocked === true,
    releaseChannelMetadataCleared: completionSummary.releaseChannelMetadataCleared === true,
    releaseChannelMetadataNeedsIgnoredEnv:
      completionSummary.releaseChannelMetadataNeedsIgnoredEnv === true ||
      (completionSummary.releaseChannelMetadataBlocked === true &&
        integerValue(completionSummary.releaseChannelCurrentReadyCount) < integerValue(completionSummary.releaseChannelCurrentRequiredKeyCount) &&
        integerValue(completionSummary.releaseChannelCurrentPlaceholderKeyCount) === 0),
    releaseChannelCurrentReadyCount: integerValue(completionSummary.releaseChannelCurrentReadyCount),
    releaseChannelCurrentRequiredKeyCount: integerValue(completionSummary.releaseChannelCurrentRequiredKeyCount),
    releaseChannelCurrentPlaceholderKeyCount: integerValue(completionSummary.releaseChannelCurrentPlaceholderKeyCount),
    operatorProofCommand: textValue(completionSummary.operatorProofCommand),
    strictProofHandoffReceiptReady: completionSummary.strictProofHandoffReceiptReady === true,
    privateEditBlockedSmokeReady: completionSummary.privateEditBlockedSmokeReady === true,
    privateEditBlockedSmokeCurrentPlaceholderKeyCount: integerValue(completionSummary.privateEditBlockedSmokeCurrentPlaceholderKeyCount),
    finalHandoffSuccessRedactionReady: completionSummary.finalHandoffSuccessRedactionReady === true,
    postClearanceNextAction: textValue(completionSummary.postClearanceNextAction),
    postClearanceProofCommand: textValue(completionSummary.postClearanceProofCommand),
    firstBlocker: textValue(completionSummary.firstBlocker),
    nextCommand: textValue(completionSummary.nextCommand),
    currentEnvEditTarget: textValue(completionSummary.currentEnvEditTarget, ".env.distribution.local"),
    currentRequiredKeyCount: integerValue(completionSummary.currentRequiredKeyCount),
    currentRequiredKeys: stringArrayValue(completionSummary.currentRequiredKeys),
    currentPlaceholderKeyCount: integerValue(completionSummary.currentPlaceholderKeyCount),
    currentPlaceholderKeys: stringArrayValue(completionSummary.currentPlaceholderKeys),
    currentPlaceholderEditLocationCount: integerValue(completionSummary.currentPlaceholderEditLocationCount),
    currentPlaceholderEditLocationSummary: textValue(completionSummary.currentPlaceholderEditLocationSummary),
    completionBlockerActionReceiptReady: completionSummary.completionBlockerActionReceiptReady === true,
    completionBlockerActionRows,
    completionBlockerActionRowCount: integerValue(completionSummary.completionBlockerActionRowCount),
    completionBlockerActionRowsValueFree: completionSummary.completionBlockerActionRowsValueFree === true && valueFreeRows(completionBlockerActionRows),
    completionBlockerFocusReceiptReady: completionSummary.completionBlockerFocusReceiptReady === true,
    completionBlockerFocusCurrentReady: completionSummary.completionBlockerFocusCurrentReady === true,
    completionBlockerFocusRows,
    completionBlockerFocusRowCount: integerValue(completionSummary.completionBlockerFocusRowCount),
    completionBlockerFocusRowsValueFree: completionSummary.completionBlockerFocusRowsValueFree === true && valueFreeRows(completionBlockerFocusRows),
    currentOperatorCommandSequenceReady: completionSummary.currentOperatorCommandSequenceReady === true,
    currentOperatorCommandRows,
    currentOperatorCommandRowCount: integerValue(completionSummary.currentOperatorCommandRowCount),
    currentOperatorCommandSummary: textValue(completionSummary.currentOperatorCommandSummary),
    currentOperatorFirstCommand: textValue(completionSummary.currentOperatorFirstCommand),
    currentOperatorPreflightCommand: textValue(completionSummary.currentOperatorPreflightCommand, releaseChannelApplyPrivateEnvPreflightCommand),
    currentOperatorPreflightCommandOrder: integerValue(completionSummary.currentOperatorPreflightCommandOrder),
    currentOperatorApplyCommand: textValue(completionSummary.currentOperatorApplyCommand, releaseChannelApplyPrivateEnvCommand),
    currentOperatorApplyCommandOrder: integerValue(completionSummary.currentOperatorApplyCommandOrder),
    currentOperatorStrictProofCommand: textValue(completionSummary.currentOperatorStrictProofCommand, "npm run release:private-edit-strict-proof"),
    currentOperatorStrictProofCommandOrder: integerValue(completionSummary.currentOperatorStrictProofCommandOrder),
    currentOperatorBlockerRefreshCommand: textValue(completionSummary.currentOperatorBlockerRefreshCommand, "npm run release:current-blocker"),
    currentOperatorNextActionsRefreshCommand: textValue(completionSummary.currentOperatorNextActionsRefreshCommand, "npm run release:next-actions"),
    currentOperatorPreflightBeforeApply: completionSummary.currentOperatorPreflightBeforeApply === true,
    currentOperatorApplyBeforeStrictProof: completionSummary.currentOperatorApplyBeforeStrictProof === true,
    currentOperatorValueRecorded: completionSummary.currentOperatorValueRecorded === true ? true : false,
    releaseChannelPrivateInputTemplateCommand: textValue(
      completionSummary.releaseChannelPrivateInputTemplateCommand,
      releaseChannelPrivateInputTemplateCommand
    ),
    releaseChannelPrivateInputTemplateRole: textValue(
      completionSummary.releaseChannelPrivateInputTemplateRole,
      releaseChannelPrivateInputTemplateRole
    ),
    releaseChannelPrivateInputTemplateDefaultPath: textValue(
      completionSummary.releaseChannelPrivateInputTemplateDefaultPath,
      defaultPrivateInputFileName
    ),
    releaseChannelPrivateInputTemplatePrivateInputFileKey: textValue(
      completionSummary.releaseChannelPrivateInputTemplatePrivateInputFileKey,
      privateInputFileKey
    ),
    releaseChannelPrivateInputTemplateBeforePreflight:
      completionSummary.releaseChannelPrivateInputTemplateBeforePreflight === true,
    releaseChannelPrivateInputTemplateValueRecorded:
      completionSummary.releaseChannelPrivateInputTemplateValueRecorded === true ? true : false,
    releaseChannelPrivateEnvApplyPreflightCommand: textValue(completionSummary.releaseChannelPrivateEnvApplyPreflightCommand, releaseChannelApplyPrivateEnvPreflightCommand),
    releaseChannelPrivateEnvApplyPreflightRole: textValue(completionSummary.releaseChannelPrivateEnvApplyPreflightRole, releaseChannelApplyPrivateEnvPreflightRole),
    releaseChannelPrivateEnvApplyPreflightBeforeApply:
      completionSummary.releaseChannelPrivateEnvApplyPreflightBeforeApply === true ||
      (textValue(completionSummary.releaseChannelPrivateEnvApplyPreflightCommand, releaseChannelApplyPrivateEnvPreflightCommand) === releaseChannelApplyPrivateEnvPreflightCommand &&
        textValue(completionSummary.releaseChannelPrivateEnvApplyCommand, releaseChannelApplyPrivateEnvCommand) === releaseChannelApplyPrivateEnvCommand),
    releaseChannelPrivateEnvApplyPreflightValueRecorded: completionSummary.releaseChannelPrivateEnvApplyPreflightValueRecorded === true ? true : false,
    releaseChannelPrivateEnvApplyCommand: textValue(completionSummary.releaseChannelPrivateEnvApplyCommand, releaseChannelApplyPrivateEnvCommand),
    releaseChannelPrivateEnvApplyRole: textValue(completionSummary.releaseChannelPrivateEnvApplyRole, releaseChannelApplyPrivateEnvRole),
    releaseChannelPrivateEnvApplyBeforeStrictProof:
      completionSummary.releaseChannelPrivateEnvApplyBeforeStrictProof === true ||
      (textValue(completionSummary.releaseChannelPrivateEnvApplyCommand, releaseChannelApplyPrivateEnvCommand) === releaseChannelApplyPrivateEnvCommand &&
        textValue(completionSummary.releaseChannelFirstProofCommandAfterPrivateEdits) === "npm run release:channel-live-check" &&
        textValue(completionSummary.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits) === "npm run release:private-edit-strict-proof"),
    releaseChannelPrivateEnvApplyValueRecorded: completionSummary.releaseChannelPrivateEnvApplyValueRecorded === true ? true : false,
    releaseChannelFirstProofCommandAfterPrivateEdits: textValue(completionSummary.releaseChannelFirstProofCommandAfterPrivateEdits),
    releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits: textValue(completionSummary.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits),
    realOperatorPreflightReceiptReady: realOperatorPreflightReady,
    realOperatorPreflightCommand: releaseChannelApplyPrivateEnvPreflightCommand,
    realOperatorPreflightRole: releaseChannelApplyPrivateEnvPreflightRole,
    realOperatorPreflightExitStatus: operatorPreflightExitStatus,
    realOperatorPreflightPreflightOnly: operatorPreflight.preflightOnly === true,
    realOperatorPreflightSourcePreflightReady: operatorPreflight.releaseChannelPrivateEnvApplyPreflightReady === true,
    realOperatorPreflightSourceApplyReady: operatorPreflight.releaseChannelPrivateEnvApplyReady === true,
    realOperatorPreflightLocalEnvFileLoaded: operatorPreflight.localEnvFileLoaded === true,
    realOperatorPreflightLocalEnvModified: operatorPreflight.localEnvModified === true,
    realOperatorPreflightRealLocalEnvModified: operatorPreflight.realLocalEnvModified === true,
    realOperatorPreflightCurrentEnvEditTarget: textValue(operatorPreflight.currentEnvEditTarget, ".env.distribution.local"),
    realOperatorPreflightCurrentFirstBlocker: textValue(operatorPreflight.currentFirstBlocker),
    realOperatorPreflightCurrentReadyKeyCount: integerValue(operatorPreflight.currentReadyKeyCount),
    realOperatorPreflightCurrentRequiredKeyCount: integerValue(operatorPreflight.currentRequiredKeyCount),
    realOperatorPreflightPrivateInputFileKey: textValue(operatorPreflight.privateInputFileKey, privateInputFileKey),
    realOperatorPreflightPrivateInputFileDefaultName: textValue(
      operatorPreflight.privateInputFileDefaultName,
      defaultPrivateInputFileName
    ),
    realOperatorPreflightPrivateInputFilePath: textValue(operatorPreflight.privateInputFilePath),
    realOperatorPreflightPrivateInputFilePresent: operatorPreflight.privateInputFilePresent === true,
    realOperatorPreflightPrivateInputFileConfigured: operatorPreflight.privateInputFileConfigured === true,
    realOperatorPreflightPrivateInputFileLoadedKeys: stringArrayValue(operatorPreflight.privateInputFileLoadedKeys),
    realOperatorPreflightPrivateInputFileLoadedKeyCount: integerValue(operatorPreflight.privateInputFileLoadedKeyCount),
    realOperatorPreflightPrivateInputFileLoadedKeySummary: textValue(operatorPreflight.privateInputFileLoadedKeySummary),
    realOperatorPreflightPrivateInputFileUnknownKeyCount: integerValue(operatorPreflight.privateInputFileUnknownKeyCount),
    realOperatorPreflightPrivateInputFileMalformedLineCount: integerValue(operatorPreflight.privateInputFileMalformedLineCount),
    realOperatorPreflightPrivateInputFileValueRecorded: operatorPreflight.privateInputFileValueRecorded === true,
    realOperatorPreflightInputReadyKeyCount: integerValue(operatorPreflight.inputReadyKeyCount),
    realOperatorPreflightInputMissingKeys: stringArrayValue(operatorPreflight.inputMissingKeys),
    realOperatorPreflightInputMissingKeyCount: stringArrayValue(operatorPreflight.inputMissingKeys).length,
    realOperatorPreflightInputPlaceholderKeys: stringArrayValue(operatorPreflight.inputPlaceholderKeys),
    realOperatorPreflightInputPlaceholderKeyCount: stringArrayValue(operatorPreflight.inputPlaceholderKeys).length,
    realOperatorPreflightInputShapeInvalidKeys: stringArrayValue(operatorPreflight.inputShapeInvalidKeys),
    realOperatorPreflightInputShapeInvalidKeyCount: stringArrayValue(operatorPreflight.inputShapeInvalidKeys).length,
    realOperatorPreflightProcessEnvInputRows: realOperatorPreflightProcessEnvInputRows,
    realOperatorPreflightProcessEnvInputRowCount: integerValue(operatorPreflight.processEnvInputChecklistRowCount),
    realOperatorPreflightProcessEnvInputRowsValueFree: valueFreeRows(realOperatorPreflightProcessEnvInputRows),
    realOperatorPreflightRemediationRows: realOperatorPreflightRemediationRows,
    realOperatorPreflightRemediationRowCount: integerValue(operatorPreflight.preflightRemediationRowCount),
    realOperatorPreflightRemediationRowsValueFree: valueFreeRows(realOperatorPreflightRemediationRows),
    realOperatorPreflightOperatorReceiptReady:
      operatorPreflight.operatorReceiptReady === true && valueFreeRows(realOperatorPreflightOperatorReceiptRows),
    realOperatorPreflightOperatorReceiptRows: realOperatorPreflightOperatorReceiptRows,
    realOperatorPreflightOperatorReceiptRowCount: integerValue(operatorPreflight.operatorReceiptRowCount),
    realOperatorPreflightOperatorReceiptRowsValueFree: valueFreeRows(realOperatorPreflightOperatorReceiptRows),
    realOperatorPreflightNextWriteCommand: textValue(operatorPreflight.nextWriteCommand, releaseChannelApplyPrivateEnvCommand),
    realOperatorPreflightGuidedSetupFallbackCommand: textValue(
      operatorPreflight.guidedSetupFallbackCommand,
      releaseChannelSetupWizardCommand
    ),
    realOperatorPreflightRecommendedOperatorProofCommand: textValue(
      operatorPreflight.recommendedOperatorProofCommand,
      "npm run release:private-edit-strict-proof"
    ),
    realOperatorPreflightHardGateCommand: textValue(operatorPreflight.hardGateCommand, "npm run release:external-check"),
    realOperatorPreflightPrivateValuesRecorded: operatorPreflight.privateValuesRecorded === true,
    realOperatorPreflightClaimedExternalDistribution: operatorPreflight.releaseGateClaimedExternalDistribution === true,
    externalCompletionResumePacketReady: externalResumeReady,
    externalCompletionResumeSourceMode: textValue(externalResume.sourceMode),
    externalCompletionResumePrivateInputTemplateCommand: textValue(
      externalResume.releaseChannelPrivateInputTemplateCommand,
      releaseChannelPrivateInputTemplateCommand
    ),
    externalCompletionResumePrivateInputTemplateDefaultPath: textValue(
      externalResume.releaseChannelPrivateInputTemplateDefaultPath,
      defaultPrivateInputFileName
    ),
    externalCompletionResumePrivateInputTemplateBeforePreflight:
      externalResume.releaseChannelPrivateInputTemplateBeforePreflight === true,
    externalCompletionResumeSourcePacketReady: externalResume.sourcePacketReady === true,
    externalCompletionResumeSourcePacketValueFree: externalResume.sourcePacketValueFree === true,
    externalCompletionResumePrivateEnvPreflightBlockedReady: externalResume.privateEnvPreflightBlockedReady === true,
    externalCompletionResumePrivateEnvPreflightExpectedBlockedExitObserved:
      externalResume.privateEnvPreflightExpectedBlockedExitObserved === true,
    externalCompletionResumePrivateEnvPreflightSourceCommand: textValue(
      externalResume.privateEnvPreflightSourceCommand,
      releaseChannelApplyPrivateEnvPreflightCommand
    ),
    externalCompletionResumePrivateEnvPreflightSourceExitStatus: integerValue(externalResume.privateEnvPreflightSourceExitStatus),
    externalCompletionResumePrivateEnvPreflightSourcePreflightReady: externalResume.privateEnvPreflightSourcePreflightReady === true,
    externalCompletionResumePrivateEnvPreflightSourceApplyReady: externalResume.privateEnvPreflightSourceApplyReady === true,
    externalCompletionResumePrivateEnvPreflightLocalEnvFileLoaded: externalResume.privateEnvPreflightLocalEnvFileLoaded === true,
    externalCompletionResumePrivateEnvPreflightLocalEnvModified: externalResume.privateEnvPreflightLocalEnvModified === true,
    externalCompletionResumePrivateEnvPreflightRealLocalEnvModified: externalResume.privateEnvPreflightRealLocalEnvModified === true,
    externalCompletionResumePrivateEnvPreflightRequiredInputCount: integerValue(externalResume.privateEnvPreflightRequiredInputCount),
    externalCompletionResumePrivateEnvPreflightMissingInputCount: integerValue(externalResume.privateEnvPreflightMissingInputCount),
    externalCompletionResumePrivateEnvPreflightPrivateInputFileKey: textValue(
      externalResume.privateEnvPreflightPrivateInputFileKey,
      privateInputFileKey
    ),
    externalCompletionResumePrivateEnvPreflightPrivateInputFileDefaultName: textValue(
      externalResume.privateEnvPreflightPrivateInputFileDefaultName,
      defaultPrivateInputFileName
    ),
    externalCompletionResumePrivateEnvPreflightOperatorPrivateInputFileDefaultPath: textValue(
      externalResume.privateEnvPreflightOperatorPrivateInputFileDefaultPath,
      operatorPrivateInputFileDefaultPath
    ),
    externalCompletionResumePrivateEnvPreflightOperatorPrivateInputFileDefaultPathValueRecorded:
      externalResume.privateEnvPreflightOperatorPrivateInputFileDefaultPathValueRecorded === true,
    externalCompletionResumePrivateEnvPreflightPrivateInputFilePath: textValue(
      externalResume.privateEnvPreflightPrivateInputFilePath
    ),
    externalCompletionResumePrivateEnvPreflightPrivateInputFilePathMode: textValue(
      externalResume.privateEnvPreflightPrivateInputFilePathMode,
      blockedPrivateInputFilePathMode
    ),
    externalCompletionResumePrivateEnvPreflightPrivateInputFilePresent:
      externalResume.privateEnvPreflightPrivateInputFilePresent === true,
    externalCompletionResumePrivateEnvPreflightPrivateInputFileConfigured:
      externalResume.privateEnvPreflightPrivateInputFileConfigured === true,
    externalCompletionResumePrivateEnvPreflightPrivateInputFileLoadedKeyCount: integerValue(
      externalResume.privateEnvPreflightPrivateInputFileLoadedKeyCount
    ),
    externalCompletionResumePrivateEnvPreflightPrivateInputFileLoadedKeySummary: textValue(
      externalResume.privateEnvPreflightPrivateInputFileLoadedKeySummary
    ),
    externalCompletionResumePrivateEnvPreflightPrivateInputFileUnknownKeyCount: integerValue(
      externalResume.privateEnvPreflightPrivateInputFileUnknownKeyCount
    ),
    externalCompletionResumePrivateEnvPreflightPrivateInputFileMalformedLineCount: integerValue(
      externalResume.privateEnvPreflightPrivateInputFileMalformedLineCount
    ),
    externalCompletionResumePrivateEnvPreflightPrivateInputFileValueRecorded:
      externalResume.privateEnvPreflightPrivateInputFileValueRecorded === true,
    externalCompletionResumePrivateEnvPreflightProcessEnvInputRows: externalResumePreflightProcessEnvInputRows,
    externalCompletionResumePrivateEnvPreflightProcessEnvInputRowCount: integerValue(
      externalResume.privateEnvPreflightProcessEnvInputRowCount
    ),
    externalCompletionResumePrivateEnvPreflightProcessEnvInputRowsValueFree:
      externalResume.privateEnvPreflightProcessEnvInputRowsValueFree === true &&
      valueFreeRows(externalResumePreflightProcessEnvInputRows),
    externalCompletionResumePrivateEnvPreflightRemediationRows: externalResumePreflightRemediationRows,
    externalCompletionResumePrivateEnvPreflightRemediationRowCount: integerValue(
      externalResume.privateEnvPreflightRemediationRowCount
    ),
    externalCompletionResumePrivateEnvPreflightRemediationRowsValueFree:
      externalResume.privateEnvPreflightRemediationRowsValueFree === true && valueFreeRows(externalResumePreflightRemediationRows),
    externalCompletionResumePrivateEnvPreflightOperatorReceiptReady:
      externalResume.privateEnvPreflightOperatorReceiptReady === true,
    externalCompletionResumePrivateEnvPreflightOperatorReceiptRows: externalResumePreflightOperatorReceiptRows,
    externalCompletionResumePrivateEnvPreflightOperatorReceiptRowCount: integerValue(
      externalResume.privateEnvPreflightOperatorReceiptRowCount
    ),
    externalCompletionResumePrivateEnvPreflightOperatorReceiptRowsValueFree:
      externalResume.privateEnvPreflightOperatorReceiptRowsValueFree === true &&
      valueFreeRows(externalResumePreflightOperatorReceiptRows),
    externalCompletionResumePrivateEnvPreflightCurrentOperatorFirstCommand: textValue(
      externalResume.privateEnvPreflightCurrentOperatorFirstCommand,
      releaseChannelApplyPrivateEnvPreflightCommand
    ),
    externalCompletionResumePrivateEnvPreflightNextWriteCommand: textValue(
      externalResume.privateEnvPreflightNextWriteCommand,
      releaseChannelApplyPrivateEnvCommand
    ),
    externalCompletionResumePrivateEnvPreflightGuidedSetupFallbackCommand: textValue(
      externalResume.privateEnvPreflightGuidedSetupFallbackCommand,
      releaseChannelSetupWizardCommand
    ),
    externalCompletionResumePrivateEnvPreflightGuidedSetupFallbackValueRecorded:
      externalResume.privateEnvPreflightGuidedSetupFallbackValueRecorded === true,
    externalCompletionResumePrivateEnvPreflightRecommendedOperatorProofCommand: textValue(
      externalResume.privateEnvPreflightRecommendedOperatorProofCommand,
      "npm run release:private-edit-strict-proof"
    ),
    externalCompletionResumePrivateEnvPreflightHardGateCommand: textValue(
      externalResume.privateEnvPreflightHardGateCommand,
      "npm run release:external-check"
    ),
    externalCompletionResumePrivateEnvPreflightPrivateValuesRecorded:
      externalResume.privateEnvPreflightPrivateValuesRecorded === true,
    externalCompletionResumePrivateEnvPreflightClaimedExternalDistribution:
      externalResume.privateEnvPreflightClaimedExternalDistribution === true,
    externalCompletionResumeLatestPlan: textValue(externalResume.latestPlan),
    externalCompletionResumeTenPlanProgress: textValue(externalResume.tenPlanProgress),
    externalCompletionResumeCurrentFirstBlocker: textValue(externalResume.currentFirstBlocker),
    externalCompletionResumeCurrentNextCommand: textValue(externalResume.currentNextCommand),
    externalCompletionResumeFirstBlockedPhase: textValue(externalResume.firstBlockedPhase),
    externalCompletionResumeNextCommand: textValue(externalResume.nextResumeCommand),
    externalCompletionResumeNextProofCommand: textValue(externalResume.nextResumeProofCommand),
    externalCompletionResumeMatchesCurrentOperatorFirstCommand: externalResume.nextResumeMatchesCurrentOperatorFirstCommand === true,
    externalCompletionResumeRowCount: integerValue(externalResume.resumeRowCount),
    externalCompletionResumeRows: externalResumeRows,
    externalCompletionResumeRowsValueFree: externalResume.resumeRowsValueFree === true && valueFreeRows(externalResumeRows),
    externalCompletionResumeAlreadyReadyRowCount: integerValue(externalResume.alreadyReadyRowCount),
    externalCompletionResumeAlreadyReadyRows: externalResumeAlreadyReadyRows,
    externalCompletionResumeAlreadyReadyRowsValueFree:
      externalResume.alreadyReadyRowsValueFree === true && valueFreeRows(externalResumeAlreadyReadyRows),
    externalCompletionResumeHardGateCommand: textValue(externalResume.hardGateCommand, "npm run release:external-check"),
    externalCompletionResumeHardGateReady: externalResume.hardGateReady === true,
    externalCompletionResumeHardGateWouldFail: externalResume.hardGateWouldFail === true,
    externalCompletionResumePrivateValuesRecorded: externalResume.privateValuesRecorded === true,
    externalCompletionResumeClaimedExternalDistribution: externalResume.claimedExternalDistribution === true,
    hardGateReady: completionSummary.hardGateReady === true,
    hardGateWouldFail: completionSummary.hardGateWouldFail === true,
    tenPlanCheckpointRequired: checkpointRequired,
    tenPlanCheckpointRun: checkpointRequired,
    tenPlanCheckpointReady: checkpointReady,
    tenPlanCheckpointStatus: checkpointStatus({ required: checkpointRequired, ready: checkpointReady }),
    tenPlanCheckpointReason: checkpointRequired ? "10-plan report due at the current boundary" : "10-plan report not due",
    tenPlanCheckpointSkippedReason: checkpointRequired ? "not skipped" : "current completed-plan window is not 10/10",
    checkpointLatestPlan: checkpointRequired ? textValue(checkpoint?.localLatestPlan) : "not due",
    checkpointTenPlanProgress: checkpointRequired ? textValue(checkpoint?.localTenPlanProgress) : "not due",
    currentTenPlanReportBoundaryAt: checkpointRequired ? textValue(checkpoint?.currentTenPlanReportBoundaryAt) : "not due",
    postDeliveryNextTenPlanProgressReportAt: checkpointRequired ? textValue(checkpoint?.postDeliveryNextTenPlanProgressReportAt) : "not due",
    checkpointSourceReady: checkpointRequired ? checkpoint?.sourceReady === true : false,
    checkpointSourceLabelsMatch: checkpointRequired ? checkpoint?.sourceLabelsMatch === true : false,
    checkpointProofGateRefreshReady: checkpointRequired ? checkpoint?.sourceProofGateRefreshReady === true : false,
    checkpointProofBundleRefreshCommand: checkpointRequired ? textValue(checkpoint?.sourceProofBundleRefreshCommand) : "not due",
    checkpointExternalGateRefreshCommand: checkpointRequired ? textValue(checkpoint?.sourceExternalGateRefreshCommand) : "not due",
    checkpointProofGateRefreshRowCount: checkpointRequired ? integerValue(checkpoint?.sourceProofGateRefreshRowCount) : 0,
    checkpointProofGateRowsValueFree: checkpointRequired ? checkpoint?.sourceProofGateRefreshRowsValueFree === true : true,
    checkpointCurrentOperatorCommandSequenceReady: checkpointRequired ? checkpoint?.currentOperatorCommandSequenceReady === true : false,
    checkpointCurrentOperatorCommandRowCount: checkpointRequired ? integerValue(checkpoint?.currentOperatorCommandRowCount) : 0,
    checkpointCurrentOperatorFirstCommand: checkpointRequired ? textValue(checkpoint?.currentOperatorFirstCommand) : "not due",
    checkpointCurrentOperatorFirstCommandMatchesSummary: checkpointRequired ? textValue(checkpoint?.currentOperatorFirstCommand) === textValue(completionSummary.currentOperatorFirstCommand) : false,
    checkpointCurrentOperatorFirstCommandIsGuidedSetup: checkpointRequired ? checkpoint?.currentOperatorFirstCommandIsGuidedSetup === true : false,
    checkpointCurrentOperatorRowsContainGuidedSetup: checkpointRequired ? checkpoint?.currentOperatorCommandRowsContainGuidedSetup === true : false,
    checkpointCurrentOperatorRowsValueFree: checkpointRequired ? checkpoint?.currentOperatorCommandRowsValueFree === true : true,
    checkpointCurrentOperatorPreflightBeforeApply: checkpointRequired ? checkpoint?.currentOperatorPreflightBeforeApply === true : false,
    checkpointCurrentOperatorApplyBeforeStrictProof: checkpointRequired ? checkpoint?.currentOperatorApplyBeforeStrictProof === true : false,
    checkpointRowsValueFree: checkpointRequired ? checkpointRowsValueFree(checkpoint) : true,
    checkpointPrivateValuesRecorded: checkpointRequired ? checkpoint?.privateValuesRecorded === true || checkpoint?.valueRecorded === true : false,
    checkpointClaimedAutoUpdate: checkpointRequired ? checkpoint?.claimedAutoUpdate === true : false,
    checkpointClaimedExternalDistribution: checkpointRequired ? checkpoint?.claimedExternalDistribution === true : false,
    checkpointHardGateReady: checkpointRequired ? checkpoint?.hardGateReady === true : false,
    checkpointHardGateWouldFail: checkpointRequired ? checkpoint?.hardGateWouldFail === true : true,
    gitContextReady: gitContext.gitContextReady,
    gitBranch: gitContext.gitBranch,
    gitHeadSha: gitContext.gitHeadSha,
    gitHeadShortSha: gitContext.gitHeadShortSha,
    gitWorktreeName: gitContext.gitWorktreeName,
    gitDirty: gitContext.gitDirty,
    gitDirtyFileCount: gitContext.gitDirtyFileCount,
    gitStatusPathsRecorded: gitContext.gitStatusPathsRecorded,
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    appleNotarySubmissionAttempted: false,
    signingAttempted: false,
    claimedAutoUpdate: false,
    claimedExternalDistribution: false,
    completionSummaryRefreshReady: false
  };
  report.tenPlanCheckpointRows = checkpointFieldRows(report);
  report.tenPlanCheckpointRowCount = report.tenPlanCheckpointRows.length;
  report.tenPlanCheckpointRowSummary = `${report.tenPlanCheckpointRowCount} checkpoint receipt rows`;
  report.gitContextRows = gitContextRows(gitContext);
  report.gitContextRowCount = report.gitContextRows.length;
  report.gitContextRowSummary = `${report.gitContextRowCount} git context rows`;
  report.userFacingCompletionRows = userFacingCompletionRows(report);
  report.userFacingCompletionRowCount = report.userFacingCompletionRows.length;
  report.userFacingCompletionRowSummary = `${report.userFacingCompletionRowCount} user-facing completion alias rows`;
  return report;
}

function buildMarkdown(report) {
  return `# ${appName} Release Completion Summary Refresh Smoke

## Summary

- Refresh receipt ready: ${readyLabel(report.completionSummaryRefreshReady)}
- Progress refresh ready: ${readyLabel(report.progressRefreshReady)}
- Completion summary readout ready: ${readyLabel(report.completionSummaryReadoutReady)}
- Latest completed plan: ${report.latestPlan}
- 10-plan progress: ${report.tenPlanProgress}
- 10-plan report due: ${readyLabel(report.tenPlanReportDue)}
- 10-plan checkpoint required: ${readyLabel(report.tenPlanCheckpointRequired)}
- 10-plan checkpoint ready: ${checkpointReadyLabel(report)}
- User-facing completion: ${report.userFacingCompletionLabel}
- Remaining completion: ${report.userFacingRemainingLabel}
- Fresh artifacts: ${report.freshArtifactCount}
- Stale artifacts: ${report.staleArtifactCount}
- Missing artifacts: ${report.missingArtifactCount}
- Operator proof command: \`${report.operatorProofCommand}\`
- Strict proof handoff ready: ${readyLabel(report.strictProofHandoffReceiptReady)}
- Private-edit blocked smoke ready: ${readyLabel(report.privateEditBlockedSmokeReady)}
- Private-edit blocked smoke placeholders: ${report.privateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}
- Final handoff success-redaction ready: ${readyLabel(report.finalHandoffSuccessRedactionReady)}
- Release-channel metadata needs ignored env: ${readyLabel(report.releaseChannelMetadataNeedsIgnoredEnv)}
- Current first blocker: ${report.firstBlocker}
- Current env edit target: ${report.currentEnvEditTarget}
- Current required keys: ${report.currentRequiredKeyCount} (${formatKeyList(report.currentRequiredKeys)})
- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})
- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})
- Completion blocker action receipt ready: ${readyLabel(report.completionBlockerActionReceiptReady)}
- Completion blocker action rows: ${report.completionBlockerActionRowCount}
- Completion blocker focus receipt ready: ${readyLabel(report.completionBlockerFocusReceiptReady)}
- Completion blocker focus rows: ${report.completionBlockerFocusRowCount}
- Current operator command sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Current operator preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Current operator apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Private input template command: \`${report.releaseChannelPrivateInputTemplateCommand}\`
- Private input template default path: \`${report.releaseChannelPrivateInputTemplateDefaultPath}\`
- Private input template before preflight: ${readyLabel(report.releaseChannelPrivateInputTemplateBeforePreflight)}
- Private env apply preflight command: \`${report.releaseChannelPrivateEnvApplyPreflightCommand}\`
- Private env apply preflight before apply: ${readyLabel(report.releaseChannelPrivateEnvApplyPreflightBeforeApply)}
- Private env apply command: \`${report.releaseChannelPrivateEnvApplyCommand}\`
- Private env apply before strict proof: ${readyLabel(report.releaseChannelPrivateEnvApplyBeforeStrictProof)}
- First proof after private edits: \`${report.releaseChannelFirstProofCommandAfterPrivateEdits}\`
- Recommended operator proof chain: \`${report.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits}\`
- Real operator preflight receipt ready: ${readyLabel(report.realOperatorPreflightReceiptReady)}
- Real operator preflight command: \`${report.realOperatorPreflightCommand}\`
- Real operator preflight exit status: ${report.realOperatorPreflightExitStatus}
- Real operator preflight ready: ${readyLabel(report.realOperatorPreflightSourcePreflightReady)}
- Real operator local env loaded: ${readyLabel(report.realOperatorPreflightLocalEnvFileLoaded)}
- Real operator private input file present: ${readyLabel(report.realOperatorPreflightPrivateInputFilePresent)}
- Real operator private input file loaded keys: ${report.realOperatorPreflightPrivateInputFileLoadedKeyCount} (${report.realOperatorPreflightPrivateInputFileLoadedKeySummary})
- Real operator input missing/placeholder/invalid rows: ${report.realOperatorPreflightInputMissingKeyCount}/${report.realOperatorPreflightInputPlaceholderKeyCount}/${report.realOperatorPreflightInputShapeInvalidKeyCount}
- Real operator next write command: \`${report.realOperatorPreflightNextWriteCommand}\`
- Real operator next proof command: \`${report.realOperatorPreflightRecommendedOperatorProofCommand}\`
- External resume packet ready: ${readyLabel(report.externalCompletionResumePacketReady)}
- External resume source mode: ${report.externalCompletionResumeSourceMode}
- External resume private input template command: \`${report.externalCompletionResumePrivateInputTemplateCommand}\`
- External resume private input template default path: \`${report.externalCompletionResumePrivateInputTemplateDefaultPath}\`
- External resume private-env preflight blocked ready: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightBlockedReady)}
- External resume private-env missing inputs: ${report.externalCompletionResumePrivateEnvPreflightMissingInputCount}/${report.externalCompletionResumePrivateEnvPreflightRequiredInputCount}
- External resume private-env expected blocked exit: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightExpectedBlockedExitObserved)}
- External resume private input file key: \`${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileKey}\`
- External resume private input file default: \`${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileDefaultName}\`
- External resume operator private input file default path: \`${report.externalCompletionResumePrivateEnvPreflightOperatorPrivateInputFileDefaultPath}\`
- External resume private input file path: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFilePath}
- External resume private input file present: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightPrivateInputFilePresent)}
- External resume private input file loaded keys: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileLoadedKeyCount} (${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileLoadedKeySummary})
- External resume guided setup fallback command: \`${report.externalCompletionResumePrivateEnvPreflightGuidedSetupFallbackCommand}\`
- External resume next command: \`${report.externalCompletionResumeNextCommand}\`
- External resume next proof command: \`${report.externalCompletionResumeNextProofCommand}\`
- External resume matches current operator first command: ${readyLabel(report.externalCompletionResumeMatchesCurrentOperatorFirstCommand)}
- External resume first blocked phase: ${report.externalCompletionResumeFirstBlockedPhase}
- External resume rows: ${report.externalCompletionResumeRowCount}
- External resume hard gate would fail: ${readyLabel(report.externalCompletionResumeHardGateWouldFail)}
- Git context ready: ${readyLabel(report.gitContextReady)}
- Git branch: ${report.gitBranch}
- Git HEAD: ${report.gitHeadShortSha}
- Git worktree: ${report.gitWorktreeName}
- Git dirty: ${readyLabel(report.gitDirty)}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- External distribution claimed: no

## Command Order

| order | command | role | condition | status | value recorded |
|---:|---|---|---|---|---:|
${formatCommandRows(report.refreshCommands)}

## Source Artifacts

- Progress refresh JSON: ${report.progressRefreshJsonPath}
- Completion summary JSON: ${report.completionSummaryJsonPath}
- External completion run packet JSON: ${report.externalCompletionRunPacketJsonPath}
- External completion resume packet JSON: ${report.externalCompletionResumePacketJsonPath}
- Real operator preflight JSON: ${report.realOperatorPreflightJsonPath}
- 10-plan checkpoint JSON: ${report.tenPlanCheckpointJsonPath}

## Real Operator Preflight Readout

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
- Current env edit target: ${report.realOperatorPreflightCurrentEnvEditTarget}
- Current ready rows: ${report.realOperatorPreflightCurrentReadyKeyCount}/${report.realOperatorPreflightCurrentRequiredKeyCount}
- Current first blocker: ${report.realOperatorPreflightCurrentFirstBlocker}
- Private input file key: \`${report.realOperatorPreflightPrivateInputFileKey}\`
- Private input file default: \`${report.realOperatorPreflightPrivateInputFileDefaultName}\`
- Private input file path: ${report.realOperatorPreflightPrivateInputFilePath}
- Private input file present: ${readyLabel(report.realOperatorPreflightPrivateInputFilePresent)}
- Private input file configured: ${readyLabel(report.realOperatorPreflightPrivateInputFileConfigured)}
- Private input file loaded keys: ${report.realOperatorPreflightPrivateInputFileLoadedKeyCount} (${report.realOperatorPreflightPrivateInputFileLoadedKeySummary})
- Private input file unknown keys: ${report.realOperatorPreflightPrivateInputFileUnknownKeyCount}
- Private input file malformed lines: ${report.realOperatorPreflightPrivateInputFileMalformedLineCount}
- Private input file value recorded: ${readyLabel(report.realOperatorPreflightPrivateInputFileValueRecorded)}
- Input ready/missing/placeholder/invalid rows: ${report.realOperatorPreflightInputReadyKeyCount}/${report.realOperatorPreflightInputMissingKeyCount}/${report.realOperatorPreflightInputPlaceholderKeyCount}/${report.realOperatorPreflightInputShapeInvalidKeyCount}
- Process input rows value-free: ${readyLabel(report.realOperatorPreflightProcessEnvInputRowsValueFree)}
- Remediation rows value-free: ${readyLabel(report.realOperatorPreflightRemediationRowsValueFree)}
- Operator receipt ready: ${readyLabel(report.realOperatorPreflightOperatorReceiptReady)}
- Operator receipt rows value-free: ${readyLabel(report.realOperatorPreflightOperatorReceiptRowsValueFree)}
- Next write command: \`${report.realOperatorPreflightNextWriteCommand}\`
- Guided setup fallback command: \`${report.realOperatorPreflightGuidedSetupFallbackCommand}\`
- Recommended proof command: \`${report.realOperatorPreflightRecommendedOperatorProofCommand}\`
- Hard gate command: \`${report.realOperatorPreflightHardGateCommand}\`
- Private values recorded: ${readyLabel(report.realOperatorPreflightPrivateValuesRecorded)}
- External distribution claimed: ${readyLabel(report.realOperatorPreflightClaimedExternalDistribution)}

### Real Operator Process Input Checklist

| order | key | input source | input present | input placeholder | input shape ready | expected shape | preflight command | write command | proof command | value recorded |
|---:|---|---|---:|---:|---:|---|---|---|---|---:|
${formatProcessEnvInputRows(report.realOperatorPreflightProcessEnvInputRows)}

### Real Operator Preflight Remediation Rows

| order | key | input present | input placeholder | input shape ready | remediation | next command | write command | proof command | value recorded |
|---:|---|---:|---:|---:|---|---|---|---|---:|
${formatPreflightRemediationRows(report.realOperatorPreflightRemediationRows)}

### Real Operator Preflight Receipt

| order | step | status | command | target | expected evidence | operator action | value recorded |
|---:|---|---|---|---|---|---|---:|
${formatPreflightOperatorReceiptRows(report.realOperatorPreflightOperatorReceiptRows)}

## External Completion Resume Packet

- Resume packet ready: ${readyLabel(report.externalCompletionResumePacketReady)}
- Source mode: ${report.externalCompletionResumeSourceMode}
- Source packet ready: ${readyLabel(report.externalCompletionResumeSourcePacketReady)}
- Source packet value-free: ${readyLabel(report.externalCompletionResumeSourcePacketValueFree)}
- Private-env preflight blocked ready: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightBlockedReady)}
- Private-env preflight source command: \`${report.externalCompletionResumePrivateEnvPreflightSourceCommand}\`
- Private-env preflight source exit status: ${report.externalCompletionResumePrivateEnvPreflightSourceExitStatus}
- Private-env expected blocked exit observed: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightExpectedBlockedExitObserved)}
- Private-env preflight ready: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightSourcePreflightReady)}
- Private-env apply ready: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightSourceApplyReady)}
- Private-env local env loaded: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightLocalEnvFileLoaded)}
- Private-env local env modified: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightLocalEnvModified)}
- Private-env real local env modified: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightRealLocalEnvModified)}
- Private-env missing process env inputs: ${report.externalCompletionResumePrivateEnvPreflightMissingInputCount}/${report.externalCompletionResumePrivateEnvPreflightRequiredInputCount}
- Private-env private input file key: \`${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileKey}\`
- Private-env private input file default: \`${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileDefaultName}\`
- Private-env operator private input file default path: \`${report.externalCompletionResumePrivateEnvPreflightOperatorPrivateInputFileDefaultPath}\`
- Private-env operator private input file default path value recorded: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightOperatorPrivateInputFileDefaultPathValueRecorded)}
- Private-env private input file path: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFilePath}
- Private-env private input file path mode: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFilePathMode}
- Private-env private input file present: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightPrivateInputFilePresent)}
- Private-env private input file configured: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightPrivateInputFileConfigured)}
- Private-env private input file loaded keys: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileLoadedKeyCount} (${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileLoadedKeySummary})
- Private-env private input file unknown keys: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileUnknownKeyCount}
- Private-env private input file malformed lines: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileMalformedLineCount}
- Private-env private input file value recorded: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightPrivateInputFileValueRecorded)}
- Private-env process env rows value-free: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightProcessEnvInputRowsValueFree)}
- Private-env remediation rows value-free: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightRemediationRowsValueFree)}
- Private-env operator receipt ready: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightOperatorReceiptReady)}
- Private-env operator receipt rows value-free: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightOperatorReceiptRowsValueFree)}
- Private-env current operator first command: \`${report.externalCompletionResumePrivateEnvPreflightCurrentOperatorFirstCommand}\`
- Private-env next write command: \`${report.externalCompletionResumePrivateEnvPreflightNextWriteCommand}\`
- Private-env guided setup fallback command: \`${report.externalCompletionResumePrivateEnvPreflightGuidedSetupFallbackCommand}\`
- Private-env guided setup fallback value recorded: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightGuidedSetupFallbackValueRecorded)}
- Private-env recommended proof command: \`${report.externalCompletionResumePrivateEnvPreflightRecommendedOperatorProofCommand}\`
- Private-env hard gate command: \`${report.externalCompletionResumePrivateEnvPreflightHardGateCommand}\`
- Private-env private values recorded: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightPrivateValuesRecorded)}
- Private-env external distribution claimed: ${readyLabel(report.externalCompletionResumePrivateEnvPreflightClaimedExternalDistribution)}
- Latest plan: ${report.externalCompletionResumeLatestPlan}
- 10-plan progress: ${report.externalCompletionResumeTenPlanProgress}
- Current first blocker: ${report.externalCompletionResumeCurrentFirstBlocker}
- Current next command: \`${report.externalCompletionResumeCurrentNextCommand}\`
- First blocked phase: ${report.externalCompletionResumeFirstBlockedPhase}
- Next resume command: \`${report.externalCompletionResumeNextCommand}\`
- Next resume proof command: \`${report.externalCompletionResumeNextProofCommand}\`
- Next resume matches current operator first command: ${readyLabel(report.externalCompletionResumeMatchesCurrentOperatorFirstCommand)}
- Resume rows value-free: ${readyLabel(report.externalCompletionResumeRowsValueFree)}
- Already-ready rows value-free: ${readyLabel(report.externalCompletionResumeAlreadyReadyRowsValueFree)}
- Hard gate command: \`${report.externalCompletionResumeHardGateCommand}\`
- Hard gate ready: ${readyLabel(report.externalCompletionResumeHardGateReady)}
- Hard gate would fail: ${readyLabel(report.externalCompletionResumeHardGateWouldFail)}
- Private values recorded: ${readyLabel(report.externalCompletionResumePrivateValuesRecorded)}
- External distribution claimed: ${readyLabel(report.externalCompletionResumeClaimedExternalDistribution)}

### Private Env Process Input Checklist

| order | key | input source | input present | input placeholder | input shape ready | expected shape | preflight command | write command | proof command | value recorded |
|---:|---|---|---:|---:|---:|---|---|---|---|---:|
${formatProcessEnvInputRows(report.externalCompletionResumePrivateEnvPreflightProcessEnvInputRows)}

### Private Env Preflight Remediation Rows

| order | key | input present | input placeholder | input shape ready | remediation | next command | write command | proof command | value recorded |
|---:|---|---:|---:|---:|---|---|---|---|---:|
${formatPreflightRemediationRows(report.externalCompletionResumePrivateEnvPreflightRemediationRows)}

### Private Env Preflight Operator Receipt

| order | step | status | command | target | expected evidence | operator action | value recorded |
|---:|---|---|---|---|---|---|---:|
${formatPreflightOperatorReceiptRows(report.externalCompletionResumePrivateEnvPreflightOperatorReceiptRows)}

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

## 10-Plan Checkpoint

- 10-plan checkpoint command: \`${report.tenPlanCheckpointCommand}\`
- 10-plan checkpoint required: ${readyLabel(report.tenPlanCheckpointRequired)}
- 10-plan checkpoint run: ${readyLabel(report.tenPlanCheckpointRun)}
- 10-plan checkpoint status: ${report.tenPlanCheckpointStatus}
- 10-plan checkpoint ready: ${checkpointReadyLabel(report)}
- 10-plan checkpoint reason: ${report.tenPlanCheckpointReason}
- 10-plan checkpoint skipped reason: ${report.tenPlanCheckpointSkippedReason}
- 10-plan checkpoint latest plan: ${report.checkpointLatestPlan}
- 10-plan checkpoint progress: ${report.checkpointTenPlanProgress}
- Current 10-plan report boundary: ${report.currentTenPlanReportBoundaryAt}
- Post-delivery next 10-plan report: ${report.postDeliveryNextTenPlanProgressReportAt}
- Checkpoint source ready: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointSourceReady) : "not due"}
- Checkpoint source labels match: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointSourceLabelsMatch) : "not due"}
- Checkpoint proof/gate refresh ready: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointProofGateRefreshReady) : "not due"}
- Checkpoint proof bundle refresh command: \`${report.checkpointProofBundleRefreshCommand}\`
- Checkpoint external gate refresh command: \`${report.checkpointExternalGateRefreshCommand}\`
- Checkpoint proof/gate rows value-free: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointProofGateRowsValueFree) : "not due"}
- Checkpoint current operator sequence ready: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorCommandSequenceReady) : "not due"}
- Checkpoint current operator rows: ${report.tenPlanCheckpointRequired ? report.checkpointCurrentOperatorCommandRowCount : "not due"}
- Checkpoint current operator first command: \`${report.checkpointCurrentOperatorFirstCommand}\`
- Checkpoint current operator first command matches summary: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorFirstCommandMatchesSummary) : "not due"}
- Checkpoint current operator first command is guided setup: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorFirstCommandIsGuidedSetup) : "not due"}
- Checkpoint current operator rows contain guided setup: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorRowsContainGuidedSetup) : "not due"}
- Checkpoint current operator rows value-free: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorRowsValueFree) : "not due"}
- Checkpoint current operator preflight before apply: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorPreflightBeforeApply) : "not due"}
- Checkpoint current operator apply before strict proof: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointCurrentOperatorApplyBeforeStrictProof) : "not due"}
- Checkpoint rows value-free: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointRowsValueFree) : "not due"}
- Checkpoint private values recorded: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointPrivateValuesRecorded) : "not due"}
- Checkpoint auto-update claimed: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointClaimedAutoUpdate) : "not due"}
- Checkpoint external distribution claimed: ${report.tenPlanCheckpointRequired ? readyLabel(report.checkpointClaimedExternalDistribution) : "not due"}

## 10-Plan Checkpoint Rows

| order | field | value | value recorded |
|---:|---|---|---:|
${formatCheckpointRows(report.tenPlanCheckpointRows)}

## Git Worktree Context

| order | field | value | value recorded |
|---:|---|---|---:|
${formatGitContextRows(report.gitContextRows)}

## User-Facing Completion Aliases

| order | field | value | value recorded |
|---:|---|---|---:|
${formatUserFacingCompletionRows(report.userFacingCompletionRows)}

## Not Claimed

This refresh does not claim auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, release upload, remote channel probing, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const checkpointExpected = report.tenPlanReportDue === true && report.tenPlanCompletedCount === 10 && report.tenPlanTotal === 10;
  const checkpointRow = report.refreshCommands.find((row) => row.command === report.tenPlanCheckpointCommand);

  check(report.progressRefreshReady === true, "release completion summary refresh should run a ready progress refresh first");
  check(report.progressRefreshCompletionSummaryReady === true, "release completion summary refresh should keep progress compact summary ready");
  check(report.progressRefreshLabelsMatch === true, "release completion summary refresh should keep progress labels matched");
  check(report.completionSummaryReadoutReady === true, "release completion summary refresh should emit ready completion summary readout");
  check(report.completionSummarySourceReady === true, "release completion summary refresh should keep completion summary source ready");
  check(report.completionSummarySourceSummaryReady === true, "release completion summary refresh should keep completion summary source compact summary ready");
  check(report.completionSummarySourceLabelsMatch === true, "release completion summary refresh should keep completion summary labels matched");
  check(report.latestPlanNumber > 0, "release completion summary refresh should include latest plan number");
  check(report.latestPlan === `plan-${report.latestPlanNumber}`, "release completion summary refresh should format latest plan");
  check(report.tenPlanTotal === 10, "release completion summary refresh should keep 10-plan denominator");
  check(report.tenPlanCompletedCount >= 1 && report.tenPlanCompletedCount <= 10, "release completion summary refresh should keep current 10-plan count");
  check(report.tenPlanProgress.includes(`${report.tenPlanCompletedCount}/10`), "release completion summary refresh should include current 10-plan progress");
  check(report.completionPercent === "99.999999%", "release completion summary refresh should keep current user-facing completion");
  check(report.remainingPercent === "0.000001%", "release completion summary refresh should keep current remaining completion");
  check(report.userFacingCompletionLabel === report.completionPercent, "release completion summary refresh user-facing completion label should mirror completion percent");
  check(report.userFacingRemainingLabel === report.remainingPercent, "release completion summary refresh user-facing remaining label should mirror remaining percent");
  check(
    Math.abs(report.userFacingCompletionPercent - 99.999999) < 0.000000001,
    "release completion summary refresh should expose numeric user-facing completion percent"
  );
  check(
    Math.abs(report.userFacingRemainingPercent - 0.000001) < 0.000000001,
    "release completion summary refresh should expose numeric user-facing remaining percent"
  );
  check(report.userFacingCompletionRows.length === report.userFacingCompletionRowCount, "release completion summary refresh should count user-facing completion alias rows");
  check(report.userFacingCompletionRows.every((row) => row.valueRecorded === false), "release completion summary refresh user-facing completion alias rows should be value-free");
  check(report.freshArtifactCount >= 6, "release completion summary refresh should keep refreshed artifacts fresh");
  check(report.staleArtifactCount === 0, "release completion summary refresh should keep stale artifact count zero");
  check(report.missingArtifactCount === 0, "release completion summary refresh should keep missing artifact count zero");
  check(report.operatorBriefReady === true, "release completion summary refresh should keep operator brief ready");
  check(report.operatorProofCommand === "npm run release:private-edit-strict-proof", "release completion summary refresh should keep strict proof as operator proof command");
  check(report.strictProofHandoffReceiptReady === true, "release completion summary refresh should expose strict proof handoff readiness");
  check(report.privateEditBlockedSmokeReady === true, "release completion summary refresh should expose private-edit blocked smoke readiness");
  check(
    report.privateEditBlockedSmokeCurrentPlaceholderKeyCount === report.releaseChannelCurrentRequiredKeyCount,
    "release completion summary refresh should expose blocked smoke coverage for current release-channel placeholders"
  );
  check(report.finalHandoffSuccessRedactionReady === true, "release completion summary refresh should expose final handoff success-redaction readiness");
  check(report.postClearanceNextAction === "auto-update-feed", "release completion summary refresh should keep auto-update-feed as post-clearance next action");
  check(report.postClearanceProofCommand === "npm run desktop:auto-update-readiness-smoke", "release completion summary refresh should keep auto-update readiness as post-clearance proof command");
  check(report.currentEnvEditTarget !== "none", "release completion summary refresh should expose current env edit target");
  check(report.currentRequiredKeyCount === 4, "release completion summary refresh should expose four current release-channel required keys");
  check(report.currentRequiredKeys.length === report.currentRequiredKeyCount, "release completion summary refresh required keys should match count");
  check(report.currentPlaceholderKeys.length === report.currentPlaceholderKeyCount, "release completion summary refresh placeholder keys should match count");
  check(report.currentPlaceholderEditLocationCount === report.currentPlaceholderKeyCount, "release completion summary refresh placeholder locations should match placeholders");
  check(
    report.currentPlaceholderEditLocationSummary.includes(report.currentEnvEditTarget) ||
      (report.currentPlaceholderEditLocationCount === 0 && report.currentPlaceholderEditLocationSummary === "none"),
    "release completion summary refresh should expose value-free placeholder edit location summary or none before ignored env setup"
  );
  check(report.completionBlockerActionReceiptReady === true, "release completion summary refresh should expose ready completion blocker action receipt");
  check(report.completionBlockerActionRowCount === report.completionBlockerActionRows.length, "release completion summary refresh blocker action row count should match rows");
  check(report.completionBlockerActionRowCount === 7, "release completion summary refresh blocker action receipt should include seven rows");
  check(report.completionBlockerActionRowsValueFree === true, "release completion summary refresh blocker action rows should be value-free");
  check(
    report.completionBlockerActionRows.every((row) => row.ready === true && row.valueRecorded === false),
    "release completion summary refresh blocker action rows should be ready and value-free"
  );
  check(
    report.completionBlockerActionRows.some((row) => row.item === "Edit target" && row.evidence === report.currentEnvEditTarget),
    "release completion summary refresh blocker action rows should include edit target"
  );
  check(
    report.completionBlockerActionRows.some((row) => row.item === "First proof after edit" && row.proofCommand === "npm run release:channel-live-check"),
    "release completion summary refresh blocker action rows should include first proof command"
  );
  check(
    report.completionBlockerActionRows.some((row) => row.item === "Recommended proof chain" && row.proofCommand === "npm run release:private-edit-strict-proof"),
    "release completion summary refresh blocker action rows should include strict proof chain"
  );
  check(report.completionBlockerFocusReceiptReady === true, "release completion summary refresh should expose ready blocker focus receipt");
  check(report.completionBlockerFocusRowCount === report.completionBlockerFocusRows.length, "release completion summary refresh blocker focus row count should match rows");
  check(report.completionBlockerFocusRowCount === 4, "release completion summary refresh blocker focus receipt should include four rows");
  check(report.completionBlockerFocusRowsValueFree === true, "release completion summary refresh blocker focus rows should be value-free");
  check(report.completionBlockerFocusRows.every((row) => row.valueRecorded === false), "release completion summary refresh blocker focus rows should not record values");
  check(report.completionBlockerFocusRows.every((row) => report.currentRequiredKeys.includes(row.key)), "release completion summary refresh blocker focus rows should match required keys");
  check(report.currentOperatorCommandSequenceReady === true, "release completion summary refresh current operator command sequence should be ready");
  check(report.currentOperatorCommandRowCount === report.currentOperatorCommandRows.length, "release completion summary refresh current operator command row count should match rows");
  check(report.currentOperatorCommandRows.length >= 5, "release completion summary refresh current operator command sequence should include preflight, apply, strict proof, blocker refresh, and next-actions refresh");
  check(report.currentOperatorCommandRows.every((row) => row.ready === true && row.valueRecorded === false), "release completion summary refresh current operator command rows should be ready and value-free");
  check(report.currentOperatorPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand, "release completion summary refresh current operator sequence should expose private env preflight command");
  check(report.currentOperatorApplyCommand === releaseChannelApplyPrivateEnvCommand, "release completion summary refresh current operator sequence should expose private env apply command");
  check(report.currentOperatorStrictProofCommand === "npm run release:private-edit-strict-proof", "release completion summary refresh current operator sequence should expose strict proof command");
  check(report.currentOperatorPreflightBeforeApply === true, "release completion summary refresh current operator sequence should place preflight before apply");
  check(report.currentOperatorApplyBeforeStrictProof === true, "release completion summary refresh current operator sequence should place apply before strict proof");
  check(report.currentOperatorBlockerRefreshCommand === "npm run release:current-blocker", "release completion summary refresh current operator sequence should include current-blocker refresh");
  check(report.currentOperatorNextActionsRefreshCommand === "npm run release:next-actions", "release completion summary refresh current operator sequence should include next-actions refresh");
  check(report.currentOperatorValueRecorded === false, "release completion summary refresh current operator sequence should be value-free");
  check(report.releaseChannelPrivateInputTemplateCommand === releaseChannelPrivateInputTemplateCommand, "release completion summary refresh should expose private input template command");
  check(report.releaseChannelPrivateInputTemplateRole === releaseChannelPrivateInputTemplateRole, "release completion summary refresh should expose private input template role");
  check(report.releaseChannelPrivateInputTemplateDefaultPath === defaultPrivateInputFileName, "release completion summary refresh should expose private input template default path");
  check(report.releaseChannelPrivateInputTemplatePrivateInputFileKey === privateInputFileKey, "release completion summary refresh should expose private input template file key");
  check(report.releaseChannelPrivateInputTemplateBeforePreflight === true, "release completion summary refresh should place private input template before preflight");
  check(report.releaseChannelPrivateInputTemplateValueRecorded === false, "release completion summary refresh private input template command should be value-free");
  check(report.releaseChannelPrivateEnvApplyPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand, "release completion summary refresh should expose private env apply preflight command");
  check(report.releaseChannelPrivateEnvApplyPreflightRole === releaseChannelApplyPrivateEnvPreflightRole, "release completion summary refresh should describe private env apply preflight role");
  check(report.releaseChannelPrivateEnvApplyPreflightBeforeApply === true, "release completion summary refresh should place private env apply preflight before apply");
  check(report.releaseChannelPrivateEnvApplyPreflightValueRecorded === false, "release completion summary refresh private env apply preflight command should be value-free");
  check(report.releaseChannelPrivateEnvApplyCommand === releaseChannelApplyPrivateEnvCommand, "release completion summary refresh should expose private env apply command");
  check(report.releaseChannelPrivateEnvApplyRole === releaseChannelApplyPrivateEnvRole, "release completion summary refresh should describe private env apply role");
  check(report.releaseChannelPrivateEnvApplyBeforeStrictProof === true, "release completion summary refresh should place private env apply before strict proof");
  check(report.releaseChannelPrivateEnvApplyValueRecorded === false, "release completion summary refresh private env apply command should be value-free");
  check(report.releaseChannelFirstProofCommandAfterPrivateEdits === "npm run release:channel-live-check", "release completion summary refresh should expose release-channel first proof command");
  check(report.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits === "npm run release:private-edit-strict-proof", "release completion summary refresh should expose recommended private edit proof chain");
  check(report.realOperatorPreflightReceiptReady === true, "release completion summary refresh should leave a ready real operator preflight readout");
  check(report.realOperatorPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand, "release completion summary refresh real operator preflight should cite the preflight command");
  check(report.realOperatorPreflightRole === releaseChannelApplyPrivateEnvPreflightRole, "release completion summary refresh real operator preflight should describe the preflight role");
  check([0, 1].includes(report.realOperatorPreflightExitStatus), "release completion summary refresh real operator preflight should record success or expected blocked exit");
  check(
    (report.realOperatorPreflightSourcePreflightReady === true && report.realOperatorPreflightExitStatus === 0) ||
      (report.realOperatorPreflightSourcePreflightReady === false && report.realOperatorPreflightExitStatus === 1),
    "release completion summary refresh real operator preflight exit status should match preflight readiness"
  );
  check(report.realOperatorPreflightPreflightOnly === true, "release completion summary refresh real operator preflight should be preflight-only");
  check(report.realOperatorPreflightSourceApplyReady === false, "release completion summary refresh real operator preflight should not claim apply completion");
  check(report.realOperatorPreflightLocalEnvModified === false, "release completion summary refresh real operator preflight should not modify local env");
  check(report.realOperatorPreflightRealLocalEnvModified === false, "release completion summary refresh real operator preflight should not modify the real local env");
  check(report.realOperatorPreflightCurrentRequiredKeyCount === 4, "release completion summary refresh real operator preflight should cover four current keys");
  check(report.realOperatorPreflightPrivateInputFileKey === privateInputFileKey, "release completion summary refresh real operator preflight should expose the private input file key");
  check(report.realOperatorPreflightPrivateInputFileDefaultName === defaultPrivateInputFileName, "release completion summary refresh real operator preflight should expose the default private input file name");
  check(
    report.realOperatorPreflightPrivateInputFileLoadedKeys.length === report.realOperatorPreflightPrivateInputFileLoadedKeyCount,
    "release completion summary refresh real operator preflight loaded-key count should match keys"
  );
  check(
    report.realOperatorPreflightPrivateInputFileLoadedKeyCount <= report.realOperatorPreflightCurrentRequiredKeyCount,
    "release completion summary refresh real operator preflight loaded-key count should stay bounded to current keys"
  );
  check(
    report.realOperatorPreflightPrivateInputFileValueRecorded === false,
    "release completion summary refresh real operator preflight should not record private input file values"
  );
  check(
    report.realOperatorPreflightInputReadyKeyCount +
      report.realOperatorPreflightInputMissingKeyCount +
      report.realOperatorPreflightInputPlaceholderKeyCount +
      report.realOperatorPreflightInputShapeInvalidKeyCount ===
      report.realOperatorPreflightCurrentRequiredKeyCount,
    "release completion summary refresh real operator preflight input counts should partition the four current keys"
  );
  check(
    report.realOperatorPreflightProcessEnvInputRows.length === report.realOperatorPreflightProcessEnvInputRowCount,
    "release completion summary refresh real operator preflight process row count should match rows"
  );
  check(report.realOperatorPreflightProcessEnvInputRowCount === 4, "release completion summary refresh real operator preflight should expose four process input rows");
  check(report.realOperatorPreflightProcessEnvInputRowsValueFree === true, "release completion summary refresh real operator preflight process rows should be value-free");
  check(
    report.realOperatorPreflightProcessEnvInputRows.every(
      (row) =>
        ["process.env", "private-input-file"].includes(row.inputSource) &&
        row.preflightCommand === releaseChannelApplyPrivateEnvPreflightCommand &&
        row.writeCommand === releaseChannelApplyPrivateEnvCommand &&
        row.proofCommand === "npm run release:private-edit-strict-proof" &&
        row.valueRecorded === false
    ),
    "release completion summary refresh real operator preflight rows should expose only supported input sources and value-free commands"
  );
  check(
    report.realOperatorPreflightRemediationRows.length === report.realOperatorPreflightRemediationRowCount,
    "release completion summary refresh real operator preflight remediation row count should match rows"
  );
  check(report.realOperatorPreflightRemediationRowCount === 4, "release completion summary refresh real operator preflight should expose four remediation rows");
  check(report.realOperatorPreflightRemediationRowsValueFree === true, "release completion summary refresh real operator preflight remediation rows should be value-free");
  check(report.realOperatorPreflightOperatorReceiptReady === true, "release completion summary refresh real operator preflight should expose a ready operator receipt");
  check(
    report.realOperatorPreflightOperatorReceiptRows.length === report.realOperatorPreflightOperatorReceiptRowCount,
    "release completion summary refresh real operator preflight operator receipt row count should match rows"
  );
  check(report.realOperatorPreflightOperatorReceiptRowCount === 6, "release completion summary refresh real operator preflight operator receipt should include six rows");
  check(report.realOperatorPreflightOperatorReceiptRowsValueFree === true, "release completion summary refresh real operator preflight operator receipt rows should be value-free");
  check(report.realOperatorPreflightNextWriteCommand === releaseChannelApplyPrivateEnvCommand, "release completion summary refresh real operator preflight should expose the write command");
  check(report.realOperatorPreflightGuidedSetupFallbackCommand === releaseChannelSetupWizardCommand, "release completion summary refresh real operator preflight should expose guided setup fallback");
  check(
    report.realOperatorPreflightRecommendedOperatorProofCommand === "npm run release:private-edit-strict-proof",
    "release completion summary refresh real operator preflight should expose the strict proof chain"
  );
  check(report.realOperatorPreflightHardGateCommand === "npm run release:external-check", "release completion summary refresh real operator preflight should expose the hard gate command");
  check(report.realOperatorPreflightPrivateValuesRecorded === false, "release completion summary refresh real operator preflight should not record private values");
  check(
    report.realOperatorPreflightClaimedExternalDistribution === false,
    "release completion summary refresh real operator preflight should not claim external distribution"
  );
  check(report.externalCompletionResumePacketReady === true, "release completion summary refresh should refresh a ready external completion resume packet");
  check(report.externalCompletionResumeSourceMode === "existing-run-packet", "release completion summary refresh should use the non-recursive existing run packet resume mode");
  check(report.externalCompletionResumeSourcePacketReady === true, "release completion summary refresh should require a ready external completion run packet source");
  check(report.externalCompletionResumeSourcePacketValueFree === true, "release completion summary refresh should require a value-free external completion run packet source");
  check(
    report.externalCompletionResumePrivateEnvPreflightBlockedReady === true,
    "release completion summary refresh should mirror ready blocked private-env preflight evidence"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightExpectedBlockedExitObserved === true,
    "release completion summary refresh should prove the private-env preflight blocked exit was expected"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightSourceCommand === releaseChannelApplyPrivateEnvPreflightCommand,
    "release completion summary refresh should cite private env preflight command"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightSourceExitStatus !== 0,
    "release completion summary refresh should record blocked private-env preflight source status"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightSourcePreflightReady === false,
    "release completion summary refresh should keep blocked private-env preflight unready"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightSourceApplyReady === false,
    "release completion summary refresh should keep private-env apply unready"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightLocalEnvModified === false,
    "release completion summary refresh should prove private-env preflight did not modify local env"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightRealLocalEnvModified === false,
    "release completion summary refresh should prove private-env preflight did not modify the real local env"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightRequiredInputCount === 4,
    "release completion summary refresh should require four private-env process inputs"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightMissingInputCount === 4,
    "release completion summary refresh should mirror four missing private-env process inputs in blocked evidence"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateInputFileKey === privateInputFileKey,
    "release completion summary refresh should mirror the private input file key"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateInputFileDefaultName === defaultPrivateInputFileName,
    "release completion summary refresh should mirror the default private input file name"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightOperatorPrivateInputFileDefaultPath === operatorPrivateInputFileDefaultPath,
    "release completion summary refresh should mirror the operator default private input file path"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightOperatorPrivateInputFileDefaultPathValueRecorded === false,
    "release completion summary refresh operator default private input file path should be value-free"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateInputFilePath !== "none",
    "release completion summary refresh should mirror the current private input file path"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateInputFilePathMode === blockedPrivateInputFilePathMode,
    "release completion summary refresh should mirror the isolated missing input file path mode"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateInputFilePresent === false,
    "release completion summary refresh should mirror absent private input file evidence"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateInputFileConfigured === true,
    "release completion summary refresh should mirror the isolated private input file override"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateInputFileLoadedKeyCount === 0,
    "release completion summary refresh should mirror zero loaded private input keys"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateInputFileLoadedKeySummary === "none",
    "release completion summary refresh should mirror the private input loaded-key summary"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateInputFileUnknownKeyCount === 0,
    "release completion summary refresh should mirror zero private input unknown keys"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateInputFileMalformedLineCount === 0,
    "release completion summary refresh should mirror zero private input malformed lines"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateInputFileValueRecorded === false,
    "release completion summary refresh should not record private input file values"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightGuidedSetupFallbackCommand === releaseChannelSetupWizardCommand,
    "release completion summary refresh should mirror guided setup as a fallback command"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightGuidedSetupFallbackValueRecorded === false,
    "release completion summary refresh guided setup fallback should be value-free"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightProcessEnvInputRows.length ===
      report.externalCompletionResumePrivateEnvPreflightProcessEnvInputRowCount,
    "release completion summary refresh private-env process input row count should match rows"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightProcessEnvInputRowCount === 4,
    "release completion summary refresh should mirror four private-env process input rows"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightProcessEnvInputRowsValueFree === true,
    "release completion summary refresh private-env process input rows should be value-free"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightProcessEnvInputRows.every(
      (row) =>
        row.inputSource === "process.env" &&
        row.inputPresent === false &&
        row.inputPlaceholder === false &&
        row.inputShapeReady === false &&
        row.preflightCommand === releaseChannelApplyPrivateEnvPreflightCommand &&
        row.writeCommand === releaseChannelApplyPrivateEnvCommand &&
        row.proofCommand === "npm run release:private-edit-strict-proof" &&
        row.valueRecorded === false
    ),
    "release completion summary refresh private-env process input rows should describe missing value-free inputs"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightRemediationRows.length ===
      report.externalCompletionResumePrivateEnvPreflightRemediationRowCount,
    "release completion summary refresh private-env remediation row count should match rows"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightRemediationRowCount === 4,
    "release completion summary refresh should mirror four private-env remediation rows"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightRemediationRowsValueFree === true,
    "release completion summary refresh private-env remediation rows should be value-free"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightOperatorReceiptReady === true,
    "release completion summary refresh should mirror ready private-env preflight operator receipt"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightOperatorReceiptRows.length ===
      report.externalCompletionResumePrivateEnvPreflightOperatorReceiptRowCount,
    "release completion summary refresh private-env operator receipt row count should match rows"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightOperatorReceiptRowCount === 6,
    "release completion summary refresh private-env operator receipt should include six rows"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightOperatorReceiptRowsValueFree === true,
    "release completion summary refresh private-env operator receipt rows should be value-free"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightNextWriteCommand === releaseChannelApplyPrivateEnvCommand,
    "release completion summary refresh should mirror private-env write command"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightRecommendedOperatorProofCommand ===
      "npm run release:private-edit-strict-proof",
    "release completion summary refresh should mirror private-env recommended proof command"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightHardGateCommand === "npm run release:external-check",
    "release completion summary refresh should mirror private-env hard gate command"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightPrivateValuesRecorded === false,
    "release completion summary refresh private-env preflight should not record private values"
  );
  check(
    report.externalCompletionResumePrivateEnvPreflightClaimedExternalDistribution === false,
    "release completion summary refresh private-env preflight should not claim external distribution"
  );
  check(report.externalCompletionResumeLatestPlan === report.latestPlan, "release completion summary refresh should align resume latest plan");
  check(report.externalCompletionResumeTenPlanProgress === report.tenPlanProgress, "release completion summary refresh should align resume 10-plan progress");
  check(
    report.externalCompletionResumeCurrentFirstBlocker === report.firstBlocker,
    "release completion summary refresh should align resume current first blocker"
  );
  check(
    report.externalCompletionResumeCurrentNextCommand === report.nextCommand,
    "release completion summary refresh should align resume current next command"
  );
  check(
    report.externalCompletionResumePrivateInputTemplateCommand === report.releaseChannelPrivateInputTemplateCommand,
    "release completion summary refresh should mirror resume private input template command"
  );
  check(
    report.externalCompletionResumePrivateInputTemplateDefaultPath === report.releaseChannelPrivateInputTemplateDefaultPath,
    "release completion summary refresh should mirror resume private input template default path"
  );
  check(
    report.externalCompletionResumePrivateInputTemplateBeforePreflight === true,
    "release completion summary refresh should mirror resume private input template order"
  );
  check(
    report.externalCompletionResumeNextCommand === report.currentOperatorFirstCommand,
    "release completion summary refresh should make resume next command match the current operator first command"
  );
  check(
    report.externalCompletionResumeNextProofCommand === report.currentOperatorStrictProofCommand,
    "release completion summary refresh should make resume proof command match the strict proof command"
  );
  check(
    report.externalCompletionResumeMatchesCurrentOperatorFirstCommand === true,
    "release completion summary refresh should prove resume command/current operator alignment"
  );
  check(report.externalCompletionResumeRowCount > 0, "release completion summary refresh should expose pending external resume rows");
  check(report.externalCompletionResumeRows.length === report.externalCompletionResumeRowCount, "release completion summary refresh resume row count should match rows");
  check(report.externalCompletionResumeRowsValueFree === true, "release completion summary refresh resume rows should be value-free");
  check(
    report.externalCompletionResumeRows[0]?.command === report.externalCompletionResumeNextCommand,
    "release completion summary refresh first resume row should carry the next resume command"
  );
  check(
    report.externalCompletionResumeAlreadyReadyRows.length === report.externalCompletionResumeAlreadyReadyRowCount,
    "release completion summary refresh already-ready resume row count should match rows"
  );
  check(report.externalCompletionResumeAlreadyReadyRowsValueFree === true, "release completion summary refresh already-ready resume rows should be value-free");
  check(
    report.externalCompletionResumeHardGateCommand === "npm run release:external-check",
    "release completion summary refresh should keep external hard gate command in resume packet"
  );
  check(report.externalCompletionResumeHardGateReady === false, "release completion summary refresh should keep resume hard gate unready");
  check(report.externalCompletionResumeHardGateWouldFail === true, "release completion summary refresh should keep resume hard gate would-fail posture");
  check(report.externalCompletionResumePrivateValuesRecorded === false, "release completion summary refresh resume packet should not record private values");
  check(
    report.externalCompletionResumeClaimedExternalDistribution === false,
    "release completion summary refresh resume packet should not claim external distribution"
  );
  check(report.hardGateReady === false, "release completion summary refresh should keep hard gate unready");
  check(report.hardGateWouldFail === true, "release completion summary refresh should keep hard gate would-fail posture");
  check(report.privateValuesRecorded === false, "release completion summary refresh should not record private values");
  check(report.networkProbeAttempted === false, "release completion summary refresh should not probe networks");
  check(report.releaseUploadAttempted === false, "release completion summary refresh should not upload releases");
  check(report.appleNotarySubmissionAttempted === false, "release completion summary refresh should not submit to Apple");
  check(report.signingAttempted === false, "release completion summary refresh should not sign artifacts");
  check(report.claimedAutoUpdate === false, "release completion summary refresh should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release completion summary refresh should not claim external distribution");
  check(report.gitContextReady === true, "release completion summary refresh should record current git context");
  check(/^[0-9a-f]{40}$/i.test(report.gitHeadSha), "release completion summary refresh should record a full HEAD SHA");
  check(/^[0-9a-f]{8}$/i.test(report.gitHeadShortSha), "release completion summary refresh should record a short HEAD SHA");
  check(report.gitBranch !== "unavailable", "release completion summary refresh should record the current branch or detached state");
  check(report.gitWorktreeName.length > 0 && !report.gitWorktreeName.includes(path.sep), "release completion summary refresh should record only a worktree basename");
  check(Number.isInteger(report.gitDirtyFileCount) && report.gitDirtyFileCount >= 0, "release completion summary refresh should count dirty status rows");
  check(report.gitStatusPathsRecorded === false, "release completion summary refresh should not record git status paths");
  check(report.gitContextRows.length === report.gitContextRowCount, "release completion summary refresh should count git context rows");
  check(report.gitContextRows.every((row) => row.valueRecorded === false), "release completion summary refresh git context rows should be value-free");
  check(report.refreshCommands.length === 6, "release completion summary refresh should record required commands, real preflight, plus conditional checkpoint command");
  check(report.refreshCommands.every((row) => row.valueRecorded === false), "release completion summary refresh command rows should be value-free");
  check(report.refreshCommands.slice(0, 5).every((row) => row.skipped === false), "release completion summary refresh should always run the first five commands");
  check(
    report.refreshCommands.some(
      (row) => row.command === releaseChannelApplyPrivateEnvPreflightCommand && row.allowBlockedExit === true
    ),
    "release completion summary refresh command rows should include the real operator preflight with expected blocked exit allowed"
  );
  check(Boolean(checkpointRow), "release completion summary refresh should include checkpoint command row");
  check(checkpointRow?.skipped === !checkpointExpected, "release completion summary refresh should skip checkpoint only when the 10-plan window is not due");
  check(report.tenPlanCheckpointRequired === checkpointExpected, "release completion summary refresh should derive checkpoint requirement from the refreshed 10-plan summary");
  check(report.tenPlanCheckpointRun === checkpointExpected, "release completion summary refresh should run checkpoint when required");
  check(report.tenPlanCheckpointStatus === checkpointStatus({ required: checkpointExpected, ready: report.tenPlanCheckpointReady }), "release completion summary refresh checkpoint status should match readiness");
  check(report.tenPlanCheckpointRows.length === report.tenPlanCheckpointRowCount, "release completion summary refresh should count checkpoint rows");
  check(report.tenPlanCheckpointRowSummary === `${report.tenPlanCheckpointRowCount} checkpoint receipt rows`, "release completion summary refresh should summarize checkpoint rows");
  check(report.tenPlanCheckpointRows.every((row) => row.valueRecorded === false), "release completion summary refresh checkpoint rows should be value-free");

  if (checkpointExpected) {
    check(report.tenPlanCheckpointReady === true, "release completion summary refresh should produce a ready checkpoint when the 10-plan report is due");
    check(report.tenPlanCheckpointJsonPath === relative(checkpointJsonPath), "release completion summary refresh should expose checkpoint artifact path when due");
    check(report.checkpointLatestPlan === report.latestPlan, "release completion summary refresh checkpoint should match latest plan");
    check(report.checkpointTenPlanProgress === report.tenPlanProgress, "release completion summary refresh checkpoint should match 10-plan progress");
    check(report.currentTenPlanReportBoundaryAt === report.latestPlan, "release completion summary refresh checkpoint boundary should match latest boundary plan");
    check(report.postDeliveryNextTenPlanProgressReportAt !== "not due", "release completion summary refresh checkpoint should expose post-delivery next report");
    check(report.checkpointSourceReady === true, "release completion summary refresh checkpoint source should be ready");
    check(report.checkpointSourceLabelsMatch === true, "release completion summary refresh checkpoint labels should match");
    check(report.checkpointProofGateRefreshReady === true, "release completion summary refresh checkpoint should prove proof/gate refresh readiness");
    check(
      report.checkpointProofBundleRefreshCommand === "npm run release:proof-bundle",
      "release completion summary refresh checkpoint should expose proof-bundle refresh command"
    );
    check(
      report.checkpointExternalGateRefreshCommand === "npm run desktop:external-distribution-gate-smoke",
      "release completion summary refresh checkpoint should expose external gate refresh command"
    );
    check(report.checkpointProofGateRefreshRowCount === 2, "release completion summary refresh checkpoint should expose two proof/gate rows");
    check(report.checkpointProofGateRowsValueFree === true, "release completion summary refresh checkpoint proof/gate rows should be value-free");
    check(report.checkpointCurrentOperatorCommandSequenceReady === true, "release completion summary refresh checkpoint should prove current operator sequence readiness");
    check(report.checkpointCurrentOperatorCommandRowCount >= 5, "release completion summary refresh checkpoint should expose current operator rows");
    check(report.checkpointCurrentOperatorFirstCommandMatchesSummary === true, "release completion summary refresh checkpoint current operator first command should match completion summary");
    check(report.checkpointCurrentOperatorFirstCommandIsGuidedSetup === false, "release completion summary refresh checkpoint current operator first command should not be guided setup");
    check(report.checkpointCurrentOperatorRowsContainGuidedSetup === false, "release completion summary refresh checkpoint current operator rows should not include guided setup");
    check(report.checkpointCurrentOperatorRowsValueFree === true, "release completion summary refresh checkpoint current operator rows should be value-free");
    check(report.checkpointCurrentOperatorPreflightBeforeApply === true, "release completion summary refresh checkpoint current operator sequence should place preflight before apply");
    check(report.checkpointCurrentOperatorApplyBeforeStrictProof === true, "release completion summary refresh checkpoint current operator sequence should place apply before strict proof");
    check(report.checkpointRowsValueFree === true, "release completion summary refresh checkpoint rows should be value-free");
    check(report.checkpointPrivateValuesRecorded === false, "release completion summary refresh checkpoint should not record private values");
    check(report.checkpointClaimedAutoUpdate === false, "release completion summary refresh checkpoint should not claim auto-update");
    check(report.checkpointClaimedExternalDistribution === false, "release completion summary refresh checkpoint should not claim external distribution");
    check(report.checkpointHardGateReady === false, "release completion summary refresh checkpoint should keep hard gate unready");
    check(report.checkpointHardGateWouldFail === true, "release completion summary refresh checkpoint should keep hard gate would-fail posture");
  } else {
    check(report.tenPlanCheckpointReady === false, "release completion summary refresh should not mark checkpoint ready when it is not due");
    check(report.tenPlanCheckpointJsonPath === "not due", "release completion summary refresh should not expose a checkpoint artifact path when not due");
    check(report.checkpointLatestPlan === "not due", "release completion summary refresh should mark checkpoint plan not due");
    check(report.checkpointTenPlanProgress === "not due", "release completion summary refresh should mark checkpoint progress not due");
  }

  check(markdown.includes("## Command Order"), "release completion summary refresh Markdown should include command order");
  check(markdown.includes("condition | status"), "release completion summary refresh Markdown should include command conditions and statuses");
  check(markdown.includes("Current operator command sequence ready: yes"), "release completion summary refresh Markdown should include current operator command sequence readiness");
  check(markdown.includes("Private input template command:"), "release completion summary refresh Markdown should include private input template command");
  check(markdown.includes("npm run release:progress-refresh-smoke"), "release completion summary refresh Markdown should cite progress refresh command");
  check(markdown.includes("npm run release:completion-summary-smoke"), "release completion summary refresh Markdown should cite completion summary command");
  check(markdown.includes("npm run release:10-plan-checkpoint-smoke"), "release completion summary refresh Markdown should cite checkpoint command");
  check(markdown.includes("## 10-Plan Checkpoint"), "release completion summary refresh Markdown should include checkpoint section");
  check(markdown.includes("## 10-Plan Checkpoint Rows"), "release completion summary refresh Markdown should include checkpoint rows");
  check(markdown.includes("Checkpoint proof/gate refresh ready:"), "release completion summary refresh Markdown should include checkpoint proof/gate readiness");
  check(markdown.includes("Checkpoint current operator sequence ready:"), "release completion summary refresh Markdown should include checkpoint current operator readiness");
  check(markdown.includes("## Completion Blocker Action Receipt"), "release completion summary refresh Markdown should include blocker action receipt section");
  check(markdown.includes("## Real Operator Preflight Readout"), "release completion summary refresh Markdown should include real operator preflight readout");
  check(markdown.includes("Real operator preflight receipt ready:"), "release completion summary refresh Markdown should summarize real operator preflight readiness");
  check(markdown.includes("Real Operator Process Input Checklist"), "release completion summary refresh Markdown should include real operator process input checklist");
  check(markdown.includes("External resume private input template command:"), "release completion summary refresh Markdown should include external resume private input template command");
  check(markdown.includes("External resume private input file key:"), "release completion summary refresh Markdown should include external resume private input file guidance");
  check(
    markdown.includes("External resume operator private input file default path:"),
    "release completion summary refresh Markdown should include external resume operator default private input file path guidance"
  );
  check(markdown.includes("External resume guided setup fallback command:"), "release completion summary refresh Markdown should include external resume guided setup fallback");
  check(markdown.includes("Private Env Process Input Checklist"), "release completion summary refresh Markdown should include private-env process input checklist");
  check(markdown.includes("## Completion Blocker Focus Rows"), "release completion summary refresh Markdown should include blocker focus rows");
  check(markdown.includes("Completion blocker action receipt ready: yes"), "release completion summary refresh Markdown should include blocker action receipt readiness");
  check(markdown.includes("## Git Worktree Context"), "release completion summary refresh Markdown should include git context section");
  check(markdown.includes("## User-Facing Completion Aliases"), "release completion summary refresh Markdown should include user-facing completion alias section");
}

async function main() {
  let operatorPreflightExitStatus = 0;
  for (const step of requiredRefreshCommands) {
    console.log(`Refreshing release completion summary evidence: ${step.command}`);
    const exitStatus = runNpmScript(step.command, { allowBlockedExit: step.allowBlockedExit === true });
    if (step.command === releaseChannelApplyPrivateEnvPreflightCommand) {
      operatorPreflightExitStatus = exitStatus;
    }
  }

  const [progressRefresh, completionSummary, externalResume, operatorPreflight] = await Promise.all([
    readJsonRequired(progressRefreshJsonPath, "release progress refresh"),
    readJsonRequired(completionSummaryJsonPath, "release completion summary"),
    readJsonRequired(externalResumePacketJsonPath, "release external completion resume packet"),
    readJsonRequired(operatorPreflightJsonPath, "release-channel private env apply preflight")
  ]);

  let checkpoint = null;
  if (tenPlanCheckpointRequired(completionSummary)) {
    console.log(`Refreshing release completion summary evidence: ${checkpointCommandRow.command}`);
    runNpmScript(checkpointCommandRow.command);
    checkpoint = await readJsonRequired(checkpointJsonPath, "release 10-plan checkpoint");
  } else {
    console.log("Skipping release 10-plan checkpoint: current completed-plan window is not 10/10.");
  }

  const gitContext = buildGitContext();
  const report = buildReport({
    progressRefresh,
    completionSummary,
    externalResume,
    operatorPreflight,
    operatorPreflightExitStatus,
    checkpoint,
    gitContext
  });
  report.completionSummaryRefreshReady = true;
  const markdown = buildMarkdown(report);
  validateReport(report, markdown);

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }

  await mkdir(packageRoot, { recursive: true });
  await writeFile(receiptMarkdownPath, markdown, "utf8");
  await writeFile(receiptJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("GrooveForge release completion summary refresh smoke passed.");
  console.log(`- Markdown: ${relative(receiptMarkdownPath)}`);
  console.log(`- JSON: ${relative(receiptJsonPath)}`);
  console.log(`- Latest completed plan: ${report.latestPlan}`);
  console.log(`- 10-plan progress: ${report.tenPlanProgress}`);
  console.log(`- 10-plan checkpoint required: ${report.tenPlanCheckpointRequired ? "yes" : "no"}`);
  console.log(`- 10-plan checkpoint run: ${report.tenPlanCheckpointRun ? "yes" : "no"}`);
  console.log(`- 10-plan checkpoint status: ${report.tenPlanCheckpointStatus}`);
  console.log(`- 10-plan checkpoint ready: ${checkpointReadyLabel(report)}`);
  console.log(`- 10-plan checkpoint artifact: ${report.tenPlanCheckpointJsonPath}`);
  console.log(`- 10-plan checkpoint proof/gate refresh ready: ${report.tenPlanCheckpointRequired ? (report.checkpointProofGateRefreshReady ? "yes" : "no") : "not due"}`);
  console.log(
    `- 10-plan checkpoint current operator sequence ready: ${
      report.tenPlanCheckpointRequired ? (report.checkpointCurrentOperatorCommandSequenceReady ? "yes" : "no") : "not due"
    }`
  );
  console.log(`- 10-plan checkpoint current operator first command: ${report.checkpointCurrentOperatorFirstCommand}`);
  console.log(
    `- 10-plan checkpoint current operator first command matches summary: ${
      report.tenPlanCheckpointRequired ? (report.checkpointCurrentOperatorFirstCommandMatchesSummary ? "yes" : "no") : "not due"
    }`
  );
  console.log(
    `- 10-plan checkpoint current operator first command is guided setup: ${
      report.tenPlanCheckpointRequired ? (report.checkpointCurrentOperatorFirstCommandIsGuidedSetup ? "yes" : "no") : "not due"
    }`
  );
  console.log(`- Git context: ${report.gitBranch}@${report.gitHeadShortSha} (${report.gitWorktreeName}, dirty ${report.gitDirty ? "yes" : "no"})`);
  console.log(`- User-facing completion: ${report.userFacingCompletionLabel}`);
  console.log(`- Remaining completion: ${report.userFacingRemainingLabel}`);
  console.log(`- Fresh artifacts: ${report.freshArtifactCount}`);
  console.log(`- Stale artifacts: ${report.staleArtifactCount}`);
  console.log(`- Missing artifacts: ${report.missingArtifactCount}`);
  console.log(`- Operator proof command: ${report.operatorProofCommand}`);
  console.log(`- Release-channel metadata needs ignored env: ${report.releaseChannelMetadataNeedsIgnoredEnv ? "yes" : "no"}`);
  console.log(`- Strict proof handoff ready: ${report.strictProofHandoffReceiptReady ? "yes" : "no"}`);
  console.log(`- Private-edit blocked smoke ready: ${report.privateEditBlockedSmokeReady ? "yes" : "no"}`);
  console.log(
    `- Private-edit blocked smoke placeholders: ${report.privateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}`
  );
  console.log(`- Final handoff success-redaction ready: ${report.finalHandoffSuccessRedactionReady ? "yes" : "no"}`);
  console.log(`- Completion blocker action receipt ready: ${report.completionBlockerActionReceiptReady ? "yes" : "no"}`);
  console.log(`- Completion blocker action rows: ${report.completionBlockerActionRowCount}`);
  console.log(`- Completion blocker focus rows: ${report.completionBlockerFocusRowCount}`);
  console.log(`- Current operator command sequence ready: ${report.currentOperatorCommandSequenceReady ? "yes" : "no"}`);
  console.log(`- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})`);
  console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
  console.log(`- Current operator preflight before apply: ${report.currentOperatorPreflightBeforeApply ? "yes" : "no"}`);
  console.log(`- Current operator apply before strict proof: ${report.currentOperatorApplyBeforeStrictProof ? "yes" : "no"}`);
  console.log(`- Private input template command: ${report.releaseChannelPrivateInputTemplateCommand}`);
  console.log(`- Private input template default path: ${report.releaseChannelPrivateInputTemplateDefaultPath}`);
  console.log(`- Real operator preflight receipt ready: ${report.realOperatorPreflightReceiptReady ? "yes" : "no"}`);
  console.log(`- Real operator preflight exit status: ${report.realOperatorPreflightExitStatus}`);
  console.log(`- Real operator preflight ready: ${report.realOperatorPreflightSourcePreflightReady ? "yes" : "no"}`);
  console.log(`- Real operator local env loaded: ${report.realOperatorPreflightLocalEnvFileLoaded ? "yes" : "no"}`);
  console.log(`- Real operator private input file present: ${report.realOperatorPreflightPrivateInputFilePresent ? "yes" : "no"}`);
  console.log(`- Real operator private input file loaded keys: ${report.realOperatorPreflightPrivateInputFileLoadedKeyCount}`);
  console.log(
    `- Real operator input missing/placeholder/invalid rows: ${report.realOperatorPreflightInputMissingKeyCount}/${report.realOperatorPreflightInputPlaceholderKeyCount}/${report.realOperatorPreflightInputShapeInvalidKeyCount}`
  );
  console.log(`- Real operator next write command: ${report.realOperatorPreflightNextWriteCommand}`);
  console.log(`- Private env apply preflight command: ${report.releaseChannelPrivateEnvApplyPreflightCommand}`);
  console.log(`- Private env apply preflight before apply: ${report.releaseChannelPrivateEnvApplyPreflightBeforeApply ? "yes" : "no"}`);
  console.log(`- Private env apply command: ${report.releaseChannelPrivateEnvApplyCommand}`);
  console.log(`- Private env apply before strict proof: ${report.releaseChannelPrivateEnvApplyBeforeStrictProof ? "yes" : "no"}`);
  console.log(`- External resume packet ready: ${report.externalCompletionResumePacketReady ? "yes" : "no"}`);
  console.log(`- External resume private input template command: ${report.externalCompletionResumePrivateInputTemplateCommand}`);
  console.log(
    `- External resume private-env preflight missing inputs: ${report.externalCompletionResumePrivateEnvPreflightMissingInputCount}/${report.externalCompletionResumePrivateEnvPreflightRequiredInputCount}`
  );
  console.log(
    `- External resume private-env preflight blocked ready: ${report.externalCompletionResumePrivateEnvPreflightBlockedReady ? "yes" : "no"}`
  );
  console.log(`- External resume private input file key: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileKey}`);
  console.log(`- External resume private input file default: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileDefaultName}`);
  console.log(
    `- External resume operator private input file default path: ${report.externalCompletionResumePrivateEnvPreflightOperatorPrivateInputFileDefaultPath}`
  );
  console.log(`- External resume private input file path: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFilePath}`);
  console.log(
    `- External resume private input file present: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFilePresent ? "yes" : "no"}`
  );
  console.log(
    `- External resume private input file loaded keys: ${report.externalCompletionResumePrivateEnvPreflightPrivateInputFileLoadedKeyCount}`
  );
  console.log(`- External resume guided setup fallback: ${report.externalCompletionResumePrivateEnvPreflightGuidedSetupFallbackCommand}`);
  console.log(`- External resume next command: ${report.externalCompletionResumeNextCommand}`);
  console.log(`- External resume next proof command: ${report.externalCompletionResumeNextProofCommand}`);
  console.log(
    `- External resume matches current operator first command: ${report.externalCompletionResumeMatchesCurrentOperatorFirstCommand ? "yes" : "no"}`
  );
  console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
  console.log(`- Current required keys: ${report.currentRequiredKeyCount} (${formatKeyList(report.currentRequiredKeys)})`);
  console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})`);
  console.log(`- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})`);
  console.log(`- Current first blocker: ${report.firstBlocker}`);
  console.log("- Private values recorded: no");
  console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
  console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
}

await main();
