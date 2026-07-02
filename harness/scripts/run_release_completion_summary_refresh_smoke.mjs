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
const progressRefreshJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${progressRefreshStem}.json`);
const completionSummaryJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${completionSummaryStem}.json`);
const checkpointJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${checkpointStem}.json`);
const receiptMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${receiptStem}.md`);
const receiptJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${receiptStem}.json`);
const failures = [];

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
  }
];

const checkpointCommandRow = {
  order: 3,
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

function runNpmScript(command) {
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
  if (result.status !== 0) {
    fail(`${command} exited with status ${result.status}.`, "Refresh the required release evidence, then rerun this command.");
  }
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

function buildReport({ progressRefresh, completionSummary, checkpoint, gitContext }) {
  const checkpointRequired = tenPlanCheckpointRequired(completionSummary);
  const checkpointReady = checkpointRequired ? checkpoint?.tenPlanCheckpointReady === true : false;
  const userFacingCompletionPercent = percentNumber(completionSummary.completionPercent);
  const userFacingRemainingPercent = percentNumber(completionSummary.remainingPercent);
  const userFacingCompletionLabel = percentLabel(completionSummary.completionPercent);
  const userFacingRemainingLabel = percentLabel(completionSummary.remainingPercent);
  const completionBlockerActionRows = objectRows(completionSummary.completionBlockerActionRows);
  const completionBlockerFocusRows = objectRows(completionSummary.completionBlockerFocusRows);
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
    tenPlanCheckpointJsonArtifactName: "release-10-plan-checkpoint-smoke.json",
    completionSummaryRefreshMarkdownArtifactName: "release-completion-summary-refresh-smoke.md",
    completionSummaryRefreshJsonArtifactName: "release-completion-summary-refresh-smoke.json",
    progressRefreshJsonPath: relative(progressRefreshJsonPath),
    completionSummaryJsonPath: relative(completionSummaryJsonPath),
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
    releaseChannelFirstProofCommandAfterPrivateEdits: textValue(completionSummary.releaseChannelFirstProofCommandAfterPrivateEdits),
    releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits: textValue(completionSummary.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits),
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
- Current first blocker: ${report.firstBlocker}
- Current env edit target: ${report.currentEnvEditTarget}
- Current required keys: ${report.currentRequiredKeyCount} (${formatKeyList(report.currentRequiredKeys)})
- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})
- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})
- Completion blocker action receipt ready: ${readyLabel(report.completionBlockerActionReceiptReady)}
- Completion blocker action rows: ${report.completionBlockerActionRowCount}
- Completion blocker focus receipt ready: ${readyLabel(report.completionBlockerFocusReceiptReady)}
- Completion blocker focus rows: ${report.completionBlockerFocusRowCount}
- First proof after private edits: \`${report.releaseChannelFirstProofCommandAfterPrivateEdits}\`
- Recommended operator proof chain: \`${report.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits}\`
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
- 10-plan checkpoint JSON: ${report.tenPlanCheckpointJsonPath}

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
  check(report.currentPlaceholderEditLocationSummary.includes(report.currentEnvEditTarget), "release completion summary refresh should expose value-free placeholder edit location summary");
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
  check(report.releaseChannelFirstProofCommandAfterPrivateEdits === "npm run release:channel-live-check", "release completion summary refresh should expose release-channel first proof command");
  check(report.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits === "npm run release:private-edit-strict-proof", "release completion summary refresh should expose recommended private edit proof chain");
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
  check(report.refreshCommands.length === 3, "release completion summary refresh should record required commands plus conditional checkpoint command");
  check(report.refreshCommands.every((row) => row.valueRecorded === false), "release completion summary refresh command rows should be value-free");
  check(report.refreshCommands.slice(0, 2).every((row) => row.skipped === false), "release completion summary refresh should always run the first two commands");
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
  check(markdown.includes("npm run release:progress-refresh-smoke"), "release completion summary refresh Markdown should cite progress refresh command");
  check(markdown.includes("npm run release:completion-summary-smoke"), "release completion summary refresh Markdown should cite completion summary command");
  check(markdown.includes("npm run release:10-plan-checkpoint-smoke"), "release completion summary refresh Markdown should cite checkpoint command");
  check(markdown.includes("## 10-Plan Checkpoint"), "release completion summary refresh Markdown should include checkpoint section");
  check(markdown.includes("## 10-Plan Checkpoint Rows"), "release completion summary refresh Markdown should include checkpoint rows");
  check(markdown.includes("Checkpoint proof/gate refresh ready:"), "release completion summary refresh Markdown should include checkpoint proof/gate readiness");
  check(markdown.includes("## Completion Blocker Action Receipt"), "release completion summary refresh Markdown should include blocker action receipt section");
  check(markdown.includes("## Completion Blocker Focus Rows"), "release completion summary refresh Markdown should include blocker focus rows");
  check(markdown.includes("Completion blocker action receipt ready: yes"), "release completion summary refresh Markdown should include blocker action receipt readiness");
  check(markdown.includes("## Git Worktree Context"), "release completion summary refresh Markdown should include git context section");
  check(markdown.includes("## User-Facing Completion Aliases"), "release completion summary refresh Markdown should include user-facing completion alias section");
}

async function main() {
  for (const step of requiredRefreshCommands) {
    console.log(`Refreshing release completion summary evidence: ${step.command}`);
    runNpmScript(step.command);
  }

  const [progressRefresh, completionSummary] = await Promise.all([
    readJsonRequired(progressRefreshJsonPath, "release progress refresh"),
    readJsonRequired(completionSummaryJsonPath, "release completion summary")
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
  const report = buildReport({ progressRefresh, completionSummary, checkpoint, gitContext });
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
  console.log(`- Git context: ${report.gitBranch}@${report.gitHeadShortSha} (${report.gitWorktreeName}, dirty ${report.gitDirty ? "yes" : "no"})`);
  console.log(`- User-facing completion: ${report.userFacingCompletionLabel}`);
  console.log(`- Remaining completion: ${report.userFacingRemainingLabel}`);
  console.log(`- Fresh artifacts: ${report.freshArtifactCount}`);
  console.log(`- Stale artifacts: ${report.staleArtifactCount}`);
  console.log(`- Missing artifacts: ${report.missingArtifactCount}`);
  console.log(`- Operator proof command: ${report.operatorProofCommand}`);
  console.log(`- Strict proof handoff ready: ${report.strictProofHandoffReceiptReady ? "yes" : "no"}`);
  console.log(`- Private-edit blocked smoke ready: ${report.privateEditBlockedSmokeReady ? "yes" : "no"}`);
  console.log(
    `- Private-edit blocked smoke placeholders: ${report.privateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}`
  );
  console.log(`- Final handoff success-redaction ready: ${report.finalHandoffSuccessRedactionReady ? "yes" : "no"}`);
  console.log(`- Completion blocker action receipt ready: ${report.completionBlockerActionReceiptReady ? "yes" : "no"}`);
  console.log(`- Completion blocker action rows: ${report.completionBlockerActionRowCount}`);
  console.log(`- Completion blocker focus rows: ${report.completionBlockerFocusRowCount}`);
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
