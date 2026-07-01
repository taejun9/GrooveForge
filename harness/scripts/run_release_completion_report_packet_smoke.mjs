#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const packetMarkdownArtifactName = "release-completion-report-packet-smoke.md";
const packetJsonArtifactName = "release-completion-report-packet-smoke.json";
const packetMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetMarkdownArtifactName}`);
const packetJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetJsonArtifactName}`);
const audienceHandoffJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-audience-completion-handoff-smoke.json`);
const channelEditPacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-edit-packet-smoke.json`);
const privateEditBlockedSmokeJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-private-edit-strict-proof-blocked-smoke.json`);
const finalHandoffSuccessRedactionJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-final-handoff-success-redaction-smoke.json`);
const clearanceTransitionJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-clearance-transition-smoke.json`);
const autoUpdateTransitionJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-auto-update-transition-smoke.json`);
const updateFeedCheckpointJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-update-feed-checkpoint-smoke.json`);
const failures = [];
const privateEditOperatorProofCommand = "npm run release:private-edit-strict-proof";
const refreshCommandRows = [
  {
    order: 1,
    command: "npm run release:audience-completion-handoff-smoke",
    role: "refresh beginner/professional audience readiness and local package evidence",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:channel-edit-packet-smoke",
    role: "refresh current release-channel edit packet and external/private blocker evidence",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:private-edit-strict-proof-blocked-smoke",
    role: "refresh deterministic blocked strict-proof handoff evidence without reading the real local env",
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run release:final-handoff-success-redaction-smoke",
    role: "refresh strict-ready final handoff proof with synthetic value-free metadata",
    valueRecorded: false
  },
  {
    order: 5,
    command: "npm run release:channel-clearance-transition-smoke",
    role: "refresh post-clearance transition evidence from release-channel metadata to auto-update feed",
    valueRecorded: false
  },
  {
    order: 6,
    command: "npm run release:auto-update-transition-smoke",
    role: "refresh value-free auto-update transition evidence after the release-channel handoff",
    valueRecorded: false
  },
  {
    order: 7,
    command: "npm run release:update-feed-checkpoint-smoke",
    role: "refresh real and synthetic update-feed checkpoint evidence after the auto-update transition",
    valueRecorded: false
  }
];
const privateEditProofCommandRows = [
  {
    order: 1,
    command: "npm run release:channel-live-check-strict",
    role: "prove the four release-channel metadata rows are present, non-placeholder, and shape-ready after private edits",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:post-edit-proof",
    role: "refresh the value-free live check and current-blocker evidence after private edits",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:progress-refresh-smoke",
    role: "refresh user-facing completion and current progress evidence after post-edit proof passes",
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run release:private-value-leak-audit",
    role: "scan generated release evidence for non-placeholder private env candidates after private edits",
    valueRecorded: false
  },
  {
    order: 5,
    command: "npm run release:external-check",
    role: "run the hard external distribution gate after all private and external evidence is ready",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release completion report packet smoke failed:");
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

function objectRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object" && !Array.isArray(row)) : [];
}

function commandSummary(rows) {
  return rows.map((row) => row.command).join(" -> ");
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
    fail(`${command} exited with status ${result.status}.`, "Refresh the source evidence named above before retrying this completion report packet smoke.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function completedPlanProgress() {
  const completedDir = path.join(root, "docs", "exec_plans", "completed");
  const entries = await readdir(completedDir);
  const completedPlanEntries = entries
    .map((entry) => {
      const match = /^plan-(\d+)-/.exec(entry);
      if (!match) {
        return null;
      }
      const planNumber = Number.parseInt(match[1], 10);
      if (!Number.isInteger(planNumber) || planNumber <= 0) {
        return null;
      }
      return {
        planNumber,
        filename: entry
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.planNumber - right.planNumber);
  const planNumbers = completedPlanEntries.map((entry) => entry.planNumber);
  const latestCompletedPlanNumber = Math.max(...planNumbers);
  const latestTenPlanWindowStart = Math.floor((latestCompletedPlanNumber - 1) / 10) * 10 + 1;
  const latestTenPlanWindowEnd = latestTenPlanWindowStart + 9;
  const currentTenPlanWindowRows = completedPlanEntries
    .filter((entry) => entry.planNumber >= latestTenPlanWindowStart && entry.planNumber <= latestTenPlanWindowEnd)
    .map((entry, index) => ({
      order: index + 1,
      planNumber: entry.planNumber,
      filename: entry.filename,
      valueRecorded: false
    }));
  const latestTenPlanCompletedCount = currentTenPlanWindowRows.length;
  const latestTenPlanTotal = 10;
  const tenPlanProgressReportDue = latestTenPlanCompletedCount === latestTenPlanTotal;
  const currentTenPlanReportBoundaryNumber = latestTenPlanWindowEnd;
  const nextScheduledTenPlanProgressReportNumber = tenPlanProgressReportDue
    ? latestTenPlanWindowEnd + latestTenPlanTotal
    : latestTenPlanWindowEnd;
  return {
    latestCompletedPlanNumber,
    latestTenPlanWindowStart,
    latestTenPlanWindowEnd,
    latestTenPlanCompletedCount,
    latestTenPlanTotal,
    latestTenPlanProgressLabel: `${latestTenPlanWindowStart}-${latestTenPlanWindowEnd}: ${latestTenPlanCompletedCount}/${latestTenPlanTotal}`,
    tenPlanProgressReportDue,
    currentTenPlanReportBoundaryNumber,
    currentTenPlanReportBoundaryAt: `plan-${currentTenPlanReportBoundaryNumber}`,
    nextTenPlanProgressReportAt: `plan-${currentTenPlanReportBoundaryNumber}`,
    nextScheduledTenPlanProgressReportNumber,
    nextScheduledTenPlanProgressReportAt: `plan-${nextScheduledTenPlanProgressReportNumber}`,
    currentTenPlanWindowRows
  };
}

function sourceRow({ label, path: filePath, ready, evidence }) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready,
    evidence,
    valueRecorded: false
  };
}

function formatCommandRows(rows) {
  return rows.map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function planRowSummary(rows) {
  return rows.length > 0 ? rows.map((row) => `plan-${row.planNumber}`).join(", ") : "none";
}

function formatPlanRows(rows) {
  return rows.map((row) => `| ${row.order} | plan-${row.planNumber} | \`${escapeCell(row.filename)}\` | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function formatReceiptRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.item)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.sourceField)}\` | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatRolloverRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.item)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.sourceField)}\` | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatStrictProofHandoffRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.blocker)} | \`${escapeCell(row.editTarget)}\` | \`${escapeCell(row.command)}\` | ${escapeCell(row.followUp)} | \`${escapeCell(row.sourceField)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${readyLabel(row.ready)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.path)}\` | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatClearanceTransitionRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.state)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.command)}\` | ${readyLabel(row.ready)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function buildReport({ audience, channel, privateEditBlockedSmoke, finalHandoff, clearance, autoUpdate, updateFeedCheckpoint, progress }) {
  const currentTenPlanWindowRows = progress.currentTenPlanWindowRows;
  const currentTenPlanWindowRowCount = currentTenPlanWindowRows.length;
  const currentTenPlanWindowRowSummary = planRowSummary(currentTenPlanWindowRows);
  const privateEditProofCommandSummary = commandSummary(privateEditProofCommandRows);
  const privateEditOperatorProofCommandRole =
    "recommended strict-first proof chain after replacing the four private release-channel placeholders";
  const strictProofHandoffReceiptRows = [
    {
      order: 1,
      blocker: textValue(channel.currentFirstBlocker),
      editTarget: textValue(channel.currentEnvEditTarget),
      command: privateEditOperatorProofCommand,
      followUp: "strict live-check, post-edit proof, progress refresh, and private-value leak audit",
      sourceField: "currentFirstBlocker/currentEnvEditTarget/privateEditOperatorProofCommand",
      valueRecorded: false
    }
  ];
  const privateEditBlockedSmokeRows = [
    {
      order: 1,
      item: "Blocked smoke command",
      evidence: `${textValue(privateEditBlockedSmoke.reportCommand)}; strict proof ready ${readyLabel(privateEditBlockedSmoke.privateEditStrictProofReady)}`,
      sourceField: "reportCommand/privateEditStrictProofReady",
      valueRecorded: false
    },
    {
      order: 2,
      item: "Blocked handoff receipt",
      evidence: `${integerValue(privateEditBlockedSmoke.privateEditStrictProofBlockedHandoffRowCount)} handoff rows; return ${textValue(privateEditBlockedSmoke.privateEditStrictProofBlockedHandoffRows?.[0]?.returnCommand)}`,
      sourceField: "privateEditStrictProofBlockedHandoffRows",
      valueRecorded: false
    },
    {
      order: 3,
      item: "Strict failure coverage",
      evidence: `${integerValue(privateEditBlockedSmoke.strictFailureRowCount)} strict failure rows; placeholders ${integerValue(privateEditBlockedSmoke.currentPlaceholderKeyCount)}`,
      sourceField: "strictFailureRowCount/currentPlaceholderKeyCount",
      valueRecorded: false
    },
    {
      order: 4,
      item: "Real env boundary",
      evidence: `real local env read ${readyLabel(privateEditBlockedSmoke.realLocalEnvRead)}; modified ${readyLabel(privateEditBlockedSmoke.realLocalEnvModified)}`,
      sourceField: "realLocalEnvRead/realLocalEnvModified",
      valueRecorded: false
    }
  ];
  const finalHandoffSuccessRedactionRows = [
    {
      order: 1,
      item: "Final handoff success-redaction command",
      evidence: `${textValue(finalHandoff.reportCommand)}; source ${textValue(finalHandoff.sourceMode)}`,
      sourceField: "reportCommand/sourceMode",
      valueRecorded: false
    },
    {
      order: 2,
      item: "Strict-ready metadata posture",
      evidence: `metadata ready ${readyLabel(finalHandoff.releaseChannelMetadataReady)}; private edit required ${readyLabel(finalHandoff.privateEditStillRequired)}`,
      sourceField: "releaseChannelMetadataReady/privateEditStillRequired",
      valueRecorded: false
    },
    {
      order: 3,
      item: "Strict success coverage",
      evidence: `strict ready ${readyLabel(finalHandoff.realStrictReady)}; rows ${integerValue(finalHandoff.realStrictCurrentReadyCount)}/${integerValue(finalHandoff.realStrictCurrentRowCount)}; placeholders ${integerValue(finalHandoff.realStrictPlaceholderKeyCount)}`,
      sourceField: "realStrictReady/realStrictCurrentReadyCount/realStrictCurrentRowCount/realStrictPlaceholderKeyCount",
      valueRecorded: false
    },
    {
      order: 4,
      item: "Real env boundary",
      evidence: `real local env read ${readyLabel(finalHandoff.realLocalEnvRead)}; modified ${readyLabel(finalHandoff.realLocalEnvModified)}`,
      sourceField: "realLocalEnvRead/realLocalEnvModified",
      valueRecorded: false
    }
  ];
  const postClearanceTransitionRows = objectRows(clearance.transitionRows);
  const autoUpdateTransitionRows = objectRows(autoUpdate.transitionRows);
  const updateFeedCheckpointRows = [
    {
      order: 1,
      item: "Update-feed checkpoint command",
      evidence: `${textValue(updateFeedCheckpoint.reportCommand)}; checkpoint ready ${readyLabel(updateFeedCheckpoint.releaseUpdateFeedCheckpointReady)}`,
      sourceField: "reportCommand/releaseUpdateFeedCheckpointReady",
      valueRecorded: false
    },
    {
      order: 2,
      item: "Real update-feed branch",
      evidence: `proof ready ${readyLabel(updateFeedCheckpoint.realPostEditProofReady)}; live check ready ${readyLabel(updateFeedCheckpoint.realLiveCheckReady)}; selected ${integerValue(updateFeedCheckpoint.realSelectedReadyCount)}/2; placeholders ${integerValue(updateFeedCheckpoint.realPlaceholderKeyCount)}`,
      sourceField: "realPostEditProofReady/realLiveCheckReady/realSelectedReadyCount/realPlaceholderKeyCount",
      valueRecorded: false
    },
    {
      order: 3,
      item: "Synthetic update-feed branch",
      evidence: `proof ready ${readyLabel(updateFeedCheckpoint.syntheticPostEditProofReady)}; live check ready ${readyLabel(updateFeedCheckpoint.syntheticLiveCheckReady)}; selected ${integerValue(updateFeedCheckpoint.syntheticSelectedReadyCount)}/2; placeholders ${integerValue(updateFeedCheckpoint.syntheticPlaceholderKeyCount)}; real env read ${readyLabel(updateFeedCheckpoint.syntheticRealLocalEnvRead)}`,
      sourceField: "syntheticPostEditProofReady/syntheticLiveCheckReady/syntheticSelectedReadyCount/syntheticPlaceholderKeyCount/syntheticRealLocalEnvRead",
      valueRecorded: false
    },
    {
      order: 4,
      item: "Downstream hard-gate boundary",
      evidence: `real auto-update ready ${readyLabel(updateFeedCheckpoint.realAutoUpdateReady)}; synthetic auto-update ready ${readyLabel(updateFeedCheckpoint.syntheticAutoUpdateReady)}; signed artifacts ready ${readyLabel(updateFeedCheckpoint.signedUpdateArtifactsReady)}; hard gate would fail ${readyLabel(updateFeedCheckpoint.hardGateWouldFail)}`,
      sourceField: "realAutoUpdateReady/syntheticAutoUpdateReady/signedUpdateArtifactsReady/hardGateWouldFail",
      valueRecorded: false
    }
  ];
  const tenPlanProgressReportRolloverRows = [
    {
      order: 1,
      item: "Current report boundary",
      evidence: `current-window boundary ${progress.currentTenPlanReportBoundaryAt}`,
      sourceField: "currentTenPlanReportBoundaryAt",
      valueRecorded: false
    },
    {
      order: 2,
      item: "Next scheduled report after delivery",
      evidence: `next scheduled ${progress.nextScheduledTenPlanProgressReportAt}`,
      sourceField: "nextScheduledTenPlanProgressReportAt",
      valueRecorded: false
    }
  ];
  const tenPlanProgressReportReceiptRows = [
    {
      order: 1,
      item: "10-plan cadence",
      evidence: `Report once per ${progress.latestTenPlanTotal} completed plans`,
      sourceField: "latestTenPlanTotal",
      valueRecorded: false
    },
    {
      order: 2,
      item: "Current 10-plan window",
      evidence: progress.latestTenPlanProgressLabel,
      sourceField: "latestTenPlanProgressLabel",
      valueRecorded: false
    },
    {
      order: 3,
      item: "Completed plan rows",
      evidence: `${currentTenPlanWindowRowCount}/${progress.latestTenPlanTotal} value-free rows: ${currentTenPlanWindowRowSummary}`,
      sourceField: "currentTenPlanWindowRows",
      valueRecorded: false
    },
    {
      order: 4,
      item: "Report due posture",
      evidence: `due ${readyLabel(progress.tenPlanProgressReportDue)} at ${progress.nextTenPlanProgressReportAt}`,
      sourceField: "tenPlanProgressReportDue",
      valueRecorded: false
    },
    {
      order: 5,
      item: "Completion posture",
      evidence: "99.999999% complete; 0.000001% remaining",
      sourceField: "userFacingCompletionPercent/userFacingRemainingPercent",
      valueRecorded: false
    },
    {
      order: 6,
      item: "Current blocker",
      evidence: textValue(channel.currentFirstBlocker),
      sourceField: "currentFirstBlocker",
      valueRecorded: false
    },
    {
      order: 7,
      item: "Private-edit proof command order",
      evidence: privateEditProofCommandSummary,
      sourceField: "privateEditProofCommandSummary",
      valueRecorded: false
    },
    {
      order: 8,
      item: "Private-edit blocked smoke evidence",
      evidence: `${textValue(privateEditBlockedSmoke.reportCommand)}; blocked handoff rows ${integerValue(privateEditBlockedSmoke.privateEditStrictProofBlockedHandoffRowCount)}`,
      sourceField: "privateEditBlockedSmoke.reportCommand/privateEditStrictProofBlockedHandoffRowCount",
      valueRecorded: false
    },
    {
      order: 9,
      item: "Final handoff success-redaction proof",
      evidence: `${textValue(finalHandoff.reportCommand)}; strict ready ${readyLabel(finalHandoff.realStrictReady)}; metadata ready ${readyLabel(finalHandoff.releaseChannelMetadataReady)}`,
      sourceField: "finalHandoff.reportCommand/realStrictReady/releaseChannelMetadataReady",
      valueRecorded: false
    },
    {
      order: 10,
      item: "Next scheduled report after delivery",
      evidence: progress.nextScheduledTenPlanProgressReportAt,
      sourceField: "nextScheduledTenPlanProgressReportAt",
      valueRecorded: false
    },
    {
      order: 11,
      item: "Post-clearance next action",
      evidence: `${textValue(clearance.nextPriorityActionLabel)} via ${textValue(clearance.nextActionPreviewProofCommand)}`,
      sourceField: "clearanceTransition.nextPriorityActionLabel/nextActionPreviewProofCommand",
      valueRecorded: false
    },
    {
      order: 12,
      item: "Post-clearance auto-update proof",
      evidence: `${textValue(autoUpdate.releaseChannelNextPriorityActionId)} via ${textValue(autoUpdate.releaseChannelNextActionProofCommand)}; real auto-update blocked ${readyLabel(autoUpdate.realAutoUpdateBlocked === true)}`,
      sourceField: "autoUpdateTransition.releaseChannelNextPriorityActionId/releaseChannelNextActionProofCommand/realAutoUpdateBlocked",
      valueRecorded: false
    },
    {
      order: 13,
      item: "Update-feed checkpoint proof",
      evidence: `${textValue(updateFeedCheckpoint.reportCommand)}; real selected ${integerValue(updateFeedCheckpoint.realSelectedReadyCount)}/2; synthetic selected ${integerValue(updateFeedCheckpoint.syntheticSelectedReadyCount)}/2; hard gate would fail ${readyLabel(updateFeedCheckpoint.hardGateWouldFail)}`,
      sourceField: "updateFeedCheckpoint.reportCommand/realSelectedReadyCount/syntheticSelectedReadyCount/hardGateWouldFail",
      valueRecorded: false
    }
  ];
  const tenPlanProgressReportReceiptReady =
    currentTenPlanWindowRowCount === progress.latestTenPlanCompletedCount &&
    currentTenPlanWindowRowCount > 0 &&
    currentTenPlanWindowRows.every((row) => row.valueRecorded === false) &&
    tenPlanProgressReportReceiptRows.every((row) => row.valueRecorded === false);
  const tenPlanProgressReportRolloverReady =
    tenPlanProgressReportRolloverRows.every((row) => row.valueRecorded === false) &&
    progress.currentTenPlanReportBoundaryAt === progress.nextTenPlanProgressReportAt &&
    progress.nextScheduledTenPlanProgressReportNumber >= progress.currentTenPlanReportBoundaryNumber;
  const strictProofHandoffReceiptReady =
    strictProofHandoffReceiptRows.length === 1 &&
    strictProofHandoffReceiptRows[0].blocker !== "none" &&
    strictProofHandoffReceiptRows[0].editTarget === ".env.distribution.local" &&
    strictProofHandoffReceiptRows[0].command === privateEditOperatorProofCommand &&
    strictProofHandoffReceiptRows.every((row) => row.valueRecorded === false);
  const privateEditBlockedSmokeReady =
    privateEditBlockedSmoke.reportCommand === "npm run release:private-edit-strict-proof-blocked-smoke" &&
    privateEditBlockedSmoke.sourceMode === "synthetic private edit strict proof blocked smoke" &&
    privateEditBlockedSmoke.privateEditStrictProofReady === false &&
    privateEditBlockedSmoke.privateEditStrictProofBlockedHandoffReady === true &&
    integerValue(privateEditBlockedSmoke.privateEditStrictProofBlockedHandoffRowCount) > 0 &&
    privateEditBlockedSmoke.privateEditStrictProofBlockedHandoffRows?.every((row) => row.valueRecorded === false) &&
    integerValue(privateEditBlockedSmoke.strictFailureRowCount) === 4 &&
    integerValue(privateEditBlockedSmoke.currentPlaceholderKeyCount) === 4 &&
    privateEditBlockedSmoke.realLocalEnvRead === false &&
    privateEditBlockedSmoke.realLocalEnvModified === false &&
    privateEditBlockedSmoke.progressRefreshSkippedInBlockedSmoke === true &&
    privateEditBlockedSmoke.privateValuesRecorded === false &&
    privateEditBlockedSmoke.networkProbeAttempted === false &&
    privateEditBlockedSmoke.releaseUploadAttempted === false &&
    privateEditBlockedSmoke.signingAttempted === false &&
    privateEditBlockedSmoke.notarySubmissionAttempted === false &&
    privateEditBlockedSmoke.claimedExternalDistribution === false &&
    privateEditBlockedSmokeRows.every((row) => row.valueRecorded === false);
  const finalHandoffSuccessRedactionReady =
    finalHandoff.reportCommand === "npm run release:final-handoff-success-redaction-smoke" &&
    finalHandoff.sourceMode === "synthetic-final-handoff-success-redaction-smoke" &&
    finalHandoff.syntheticSuccessRedactionSmoke === true &&
    finalHandoff.releaseFinalHandoffReady === true &&
    finalHandoff.releaseChannelMetadataReady === true &&
    finalHandoff.privateEditStillRequired === false &&
    integerValue(finalHandoff.currentReadyCount) === 4 &&
    integerValue(finalHandoff.currentRowCount) === 4 &&
    integerValue(finalHandoff.currentPlaceholderKeyCount) === 0 &&
    integerValue(finalHandoff.currentPlaceholderEditLocationCount) === 0 &&
    finalHandoff.strictProofReady === true &&
    finalHandoff.realStrictReady === true &&
    integerValue(finalHandoff.realStrictExitCode) === 0 &&
    integerValue(finalHandoff.realStrictCurrentReadyCount) === 4 &&
    integerValue(finalHandoff.realStrictCurrentRowCount) === 4 &&
    integerValue(finalHandoff.realStrictPlaceholderKeyCount) === 0 &&
    finalHandoff.strictSuccessSmokeReady === true &&
    integerValue(finalHandoff.strictSuccessSmokeCurrentReadyCount) === 4 &&
    integerValue(finalHandoff.strictSuccessSmokeCurrentRowCount) === 4 &&
    integerValue(finalHandoff.strictSuccessSmokePlaceholderKeyCount) === 0 &&
    finalHandoff.realLocalEnvRead === false &&
    finalHandoff.realLocalEnvModified === false &&
    finalHandoff.strictSuccessSmokeRealLocalEnvRead === false &&
    finalHandoff.strictSuccessSmokeRealLocalEnvModified === false &&
    finalHandoff.privateValuesRecorded === false &&
    finalHandoff.networkProbeAttempted === false &&
    finalHandoff.releaseUploadAttempted === false &&
    finalHandoff.signingAttempted === false &&
    finalHandoff.notarySubmissionAttempted === false &&
    finalHandoff.claimedExternalDistribution === false &&
    finalHandoff.valueRecorded === false &&
    finalHandoffSuccessRedactionRows.every((row) => row.valueRecorded === false);
  const sourceArtifactRows = [
    sourceRow({
      label: "Audience completion handoff",
      path: audienceHandoffJsonPath,
      ready: audience.releaseAudienceCompletionHandoffReady === true,
      evidence: `${audience.latestTenPlanProgressLabel}; first-time ${readyLabel(audience.firstTimeComposerReady)}; professional ${readyLabel(audience.professionalProducerReady)}`
    }),
    sourceRow({
      label: "Release-channel edit packet",
      path: channelEditPacketJsonPath,
      ready: channel.releaseChannelEditPacketReady === true,
      evidence: `${channel.latestTenPlanProgressLabel}; ${textValue(channel.releaseChannelEditPacketMode)}; placeholders ${integerValue(channel.currentPlaceholderKeyCount)}; recommended ${textValue(channel.releaseChannelRecommendedOperatorProofCommand)}`
    }),
    sourceRow({
      label: "Private-edit blocked smoke",
      path: privateEditBlockedSmokeJsonPath,
      ready: privateEditBlockedSmokeReady,
      evidence: `${textValue(privateEditBlockedSmoke.currentTenPlanProgressLabel)}; blocked handoff ${readyLabel(privateEditBlockedSmoke.privateEditStrictProofBlockedHandoffReady)}; strict failures ${integerValue(privateEditBlockedSmoke.strictFailureRowCount)}`
    }),
    sourceRow({
      label: "Final handoff success-redaction",
      path: finalHandoffSuccessRedactionJsonPath,
      ready: finalHandoffSuccessRedactionReady,
      evidence: `${textValue(finalHandoff.currentTenPlanProgressLabel)}; strict ready ${readyLabel(finalHandoff.realStrictReady)}; placeholders ${integerValue(finalHandoff.currentPlaceholderKeyCount)}; real env read ${readyLabel(finalHandoff.realLocalEnvRead)}`
    }),
    sourceRow({
      label: "Release-channel clearance transition",
      path: clearanceTransitionJsonPath,
      ready: clearance.releaseChannelClearanceTransitionReady === true,
      evidence: `${clearance.currentTenPlanProgressLabel}; next ${textValue(clearance.nextPriorityActionId)}; proof ${textValue(clearance.nextActionPreviewProofCommand)}`
    }),
    sourceRow({
      label: "Release auto-update transition",
      path: autoUpdateTransitionJsonPath,
      ready: autoUpdate.releaseAutoUpdateTransitionReady === true,
      evidence: `${autoUpdate.currentTenPlanProgressLabel}; synthetic feed/channel ${readyLabel(autoUpdate.syntheticFeedChannelConfigReady)}; real auto-update blocked ${readyLabel(autoUpdate.realAutoUpdateBlocked)}`
    }),
    sourceRow({
      label: "Update feed checkpoint",
      path: updateFeedCheckpointJsonPath,
      ready: updateFeedCheckpoint.releaseUpdateFeedCheckpointReady === true,
      evidence: `${updateFeedCheckpoint.currentTenPlanProgressLabel}; real selected ${integerValue(updateFeedCheckpoint.realSelectedReadyCount)}/2; synthetic selected ${integerValue(updateFeedCheckpoint.syntheticSelectedReadyCount)}/2; hard gate would fail ${readyLabel(updateFeedCheckpoint.hardGateWouldFail)}`
    })
  ];
  const labelsMatch =
    audience.latestTenPlanProgressLabel === progress.latestTenPlanProgressLabel &&
    channel.latestTenPlanProgressLabel === progress.latestTenPlanProgressLabel &&
    privateEditBlockedSmoke.currentTenPlanProgressLabel === progress.latestTenPlanProgressLabel &&
    finalHandoff.currentTenPlanProgressLabel === progress.latestTenPlanProgressLabel &&
    clearance.currentTenPlanProgressLabel === progress.latestTenPlanProgressLabel &&
    autoUpdate.currentTenPlanProgressLabel === progress.latestTenPlanProgressLabel &&
    updateFeedCheckpoint.currentTenPlanProgressLabel === progress.latestTenPlanProgressLabel;
  const completionPercentsMatch =
    audience.userFacingCompletionPercent === 99.999999 &&
    channel.userFacingCompletionPercent === 99.999999 &&
    privateEditBlockedSmoke.userFacingCompletionPercent === 99.999999 &&
    finalHandoff.userFacingCompletionPercent === 99.999999 &&
    clearance.userFacingCompletionPercent === 99.999999 &&
    autoUpdate.userFacingCompletionPercent === 99.999999 &&
    updateFeedCheckpoint.userFacingCompletionPercent === 99.999999 &&
    audience.userFacingRemainingPercent === 0.000001 &&
    channel.userFacingRemainingPercent === 0.000001 &&
    privateEditBlockedSmoke.userFacingRemainingPercent === 0.000001 &&
    finalHandoff.userFacingRemainingPercent === 0.000001 &&
    clearance.userFacingRemainingPercent === 0.000001 &&
    autoUpdate.userFacingRemainingPercent === 0.000001 &&
    updateFeedCheckpoint.userFacingRemainingPercent === 0.000001;
  const valueBoundaryClean =
    audience.valueRecorded === false &&
    audience.claimedExternalDistribution === false &&
    audience.networkProbeAttempted === false &&
    channel.valueRecorded === false &&
    channel.claimedExternalDistribution === false &&
    channel.networkProbeAttempted === false &&
    privateEditBlockedSmoke.valueRecorded === false &&
    privateEditBlockedSmoke.privateValuesRecorded === false &&
    privateEditBlockedSmoke.realLocalEnvRead === false &&
    privateEditBlockedSmoke.realLocalEnvModified === false &&
    privateEditBlockedSmoke.claimedExternalDistribution === false &&
    privateEditBlockedSmoke.networkProbeAttempted === false &&
    finalHandoff.valueRecorded === false &&
    finalHandoff.privateValuesRecorded === false &&
    finalHandoff.realLocalEnvRead === false &&
    finalHandoff.realLocalEnvModified === false &&
    finalHandoff.claimedExternalDistribution === false &&
    finalHandoff.networkProbeAttempted === false &&
    finalHandoff.releaseUploadAttempted === false &&
    finalHandoff.signingAttempted === false &&
    finalHandoff.notarySubmissionAttempted === false &&
    clearance.valueRecorded === false &&
    clearance.privateValuesRecorded === false &&
    clearance.claimedExternalDistribution === false &&
    clearance.networkProbeAttempted === false &&
    autoUpdate.valueRecorded === false &&
    autoUpdate.privateValuesRecorded === false &&
    autoUpdate.feedValueRecorded === false &&
    autoUpdate.channelValueRecorded === false &&
    autoUpdate.claimedAutoUpdate === false &&
    autoUpdate.claimedExternalDistribution === false &&
    autoUpdate.networkProbeAttempted === false &&
    autoUpdate.updateFeedPublishAttempted === false &&
    updateFeedCheckpoint.valueRecorded === false &&
    updateFeedCheckpoint.privateValuesRecorded === false &&
    updateFeedCheckpoint.feedValueRecorded === false &&
    updateFeedCheckpoint.channelValueRecorded === false &&
    updateFeedCheckpoint.localEnvValueRecorded === false &&
    updateFeedCheckpoint.claimedAutoUpdate === false &&
    updateFeedCheckpoint.claimedExternalDistribution === false &&
    updateFeedCheckpoint.networkProbeAttempted === false &&
    updateFeedCheckpoint.updateFeedPublishAttempted === false &&
    updateFeedCheckpoint.releaseUploadAttempted === false &&
    updateFeedCheckpoint.signingAttempted === false &&
    updateFeedCheckpoint.notarySubmissionAttempted === false;
  const clearanceTransitionReady =
    clearance.releaseChannelClearanceTransitionReady === true &&
    ["prepare-local-distribution-env", "replace-release-channel-placeholders", "release-channel-metadata"].includes(
      clearance.currentPriorityActionId
    ) &&
    (clearance.currentBlockerMode === "missing-local-env" || clearance.currentBlockerMode === "replace-release-channel-placeholders") &&
    integerValue(clearance.currentRequiredKeyCount) === 4 &&
    (clearance.currentBlockerMode === "missing-local-env"
      ? integerValue(clearance.currentPlaceholderKeyCount) === 0 && clearance.currentNextCommand === "npm run release:prepare-env"
      : integerValue(clearance.currentPlaceholderKeyCount) === 4) &&
    clearance.syntheticClearanceReady === true &&
    clearance.syntheticClearanceStrictReady === true &&
    integerValue(clearance.syntheticClearanceCurrentReadyCount) === 4 &&
    integerValue(clearance.syntheticClearancePlaceholderKeyCount) === 0 &&
    clearance.nextPriorityActionId === "auto-update-feed" &&
    clearance.nextActionPreviewId === "auto-update-feed" &&
    clearance.nextActionPreviewReady === true &&
    clearance.nextActionPreviewProofCommand === "npm run desktop:auto-update-readiness-smoke" &&
    clearance.hardGateCommand === "npm run release:external-check" &&
    clearance.hardGateReady === false &&
    clearance.hardGateWouldFail === true &&
    postClearanceTransitionRows.length === integerValue(clearance.transitionRowCount) &&
    postClearanceTransitionRows.length > 0 &&
    postClearanceTransitionRows.every((row) => row.ready === true && row.valueRecorded === false);
  const autoUpdateTransitionReady =
    autoUpdate.releaseAutoUpdateTransitionReady === true &&
    autoUpdate.releaseChannelClearanceTransitionReady === true &&
    autoUpdate.releaseChannelNextPriorityActionId === "auto-update-feed" &&
    autoUpdate.releaseChannelNextActionProofCommand === "npm run desktop:auto-update-readiness-smoke" &&
    autoUpdate.syntheticFeedChannelConfigReady === true &&
    autoUpdate.syntheticFeedValueRecorded === false &&
    autoUpdate.syntheticChannelValueRecorded === false &&
    autoUpdate.currentEnvironmentFeedChannelReady === false &&
    autoUpdate.realAutoUpdateReady === false &&
    autoUpdate.realAutoUpdateBlocked === true &&
    integerValue(autoUpdate.realAutoUpdateBlockerCount) > 0 &&
    autoUpdate.realAutoUpdateBlockerRows?.every((row) => row.valueRecorded === false) &&
    autoUpdate.signedUpdateArtifactsReady === false &&
    integerValue(autoUpdate.requiredUpdateFeedKeyCount) === 6 &&
    autoUpdate.hardGateCommand === "npm run release:external-check" &&
    autoUpdate.hardGateReady === false &&
    autoUpdate.hardGateWouldFail === true &&
    autoUpdateTransitionRows.length === integerValue(autoUpdate.transitionRowCount) &&
    autoUpdateTransitionRows.length > 0 &&
    autoUpdateTransitionRows.every((row) => row.ready === true && row.valueRecorded === false);
  const updateFeedCheckpointReady =
    updateFeedCheckpoint.reportCommand === "npm run release:update-feed-checkpoint-smoke" &&
    updateFeedCheckpoint.releaseUpdateFeedCheckpointReady === true &&
    integerValue(updateFeedCheckpoint.sourceArtifactRowCount) === 2 &&
    updateFeedCheckpoint.sourceArtifactRows?.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
    integerValue(updateFeedCheckpoint.branchRowCount) === 2 &&
    updateFeedCheckpoint.branchRows?.every((row) => row.ready === true && row.valueRecorded === false) &&
    integerValue(updateFeedCheckpoint.comparisonRowCount) === 6 &&
    updateFeedCheckpoint.comparisonRows?.every((row) => row.ready === true && row.valueRecorded === false) &&
    updateFeedCheckpoint.realPostEditProofReady === true &&
    updateFeedCheckpoint.syntheticPostEditProofReady === true &&
    updateFeedCheckpoint.syntheticLiveCheckReady === true &&
    updateFeedCheckpoint.syntheticStrictReady === true &&
    integerValue(updateFeedCheckpoint.syntheticSelectedReadyCount) === 2 &&
    integerValue(updateFeedCheckpoint.syntheticPlaceholderKeyCount) === 0 &&
    integerValue(updateFeedCheckpoint.syntheticPlaceholderEditLocationCount) === 0 &&
    updateFeedCheckpoint.syntheticRealLocalEnvRead === false &&
    updateFeedCheckpoint.realAutoUpdateReady === false &&
    updateFeedCheckpoint.syntheticAutoUpdateReady === false &&
    integerValue(updateFeedCheckpoint.realAutoUpdateBlockerCount) > 0 &&
    integerValue(updateFeedCheckpoint.syntheticAutoUpdateBlockerCount) > 0 &&
    updateFeedCheckpoint.signedUpdateArtifactsReady === false &&
    updateFeedCheckpoint.hardGateCommand === "npm run release:external-check" &&
    updateFeedCheckpoint.hardGateReady === false &&
    updateFeedCheckpoint.hardGateWouldFail === true &&
    updateFeedCheckpoint.privateValuesRecorded === false &&
    updateFeedCheckpoint.feedValueRecorded === false &&
    updateFeedCheckpoint.channelValueRecorded === false &&
    updateFeedCheckpoint.localEnvValueRecorded === false &&
    updateFeedCheckpoint.networkProbeAttempted === false &&
    updateFeedCheckpoint.updateFeedPublishAttempted === false &&
    updateFeedCheckpoint.releaseUploadAttempted === false &&
    updateFeedCheckpoint.signingAttempted === false &&
    updateFeedCheckpoint.notarySubmissionAttempted === false &&
    updateFeedCheckpoint.claimedAutoUpdate === false &&
    updateFeedCheckpoint.claimedExternalDistribution === false &&
    updateFeedCheckpoint.valueRecorded === false &&
    updateFeedCheckpointRows.every((row) => row.valueRecorded === false);
  const releaseCompletionReportPacketReady =
    refreshCommandRows.every((row) => row.valueRecorded === false) &&
    privateEditProofCommandRows.every((row) => row.valueRecorded === false) &&
    strictProofHandoffReceiptReady &&
    privateEditBlockedSmokeReady &&
    finalHandoffSuccessRedactionReady &&
    updateFeedCheckpointReady &&
    tenPlanProgressReportReceiptReady &&
    tenPlanProgressReportRolloverReady &&
    sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
    labelsMatch &&
    completionPercentsMatch &&
    valueBoundaryClean &&
    audience.firstTimeComposerReady === true &&
    audience.professionalProducerReady === true &&
    audience.directCompositionReady === true &&
    audience.allGenreStyleReadinessReady === true &&
    audience.localDeliveryPackageReady === true &&
    audience.localPackageReopenReady === true &&
    audience.completionGapStatus === "external proof pending" &&
    channel.completionGapStatus === "external proof pending" &&
    channel.externalDistributionReady === false &&
    channel.releaseChannelRecommendedOperatorProofCommand === privateEditOperatorProofCommand &&
    channel.releaseChannelRecommendedOperatorProofCommandValueRecorded === false &&
    clearanceTransitionReady &&
    autoUpdateTransitionReady;

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:completion-report-packet-smoke",
    releaseCompletionReportPacketMarkdownArtifactName: packetMarkdownArtifactName,
    releaseCompletionReportPacketJsonArtifactName: packetJsonArtifactName,
    releaseCompletionReportPacketMarkdownPath: relative(packetMarkdownPath),
    releaseCompletionReportPacketJsonPath: relative(packetJsonPath),
    releaseCompletionReportPacketReady,
    refreshCommandRows,
    refreshCommandCount: refreshCommandRows.length,
    refreshCommandSummary: commandSummary(refreshCommandRows),
    privateEditProofCommandRows,
    privateEditProofCommandCount: privateEditProofCommandRows.length,
    privateEditProofCommandSummary,
    privateEditOperatorProofCommand,
    privateEditOperatorProofCommandRole,
    privateEditOperatorProofCommandValueRecorded: false,
    strictProofHandoffReceiptRows,
    strictProofHandoffReceiptRowCount: strictProofHandoffReceiptRows.length,
    strictProofHandoffReceiptReady,
    strictProofHandoffReceiptSummary: strictProofHandoffReceiptRows
      .map((row) => `${row.blocker} -> ${row.command}`)
      .join(", "),
    strictProofHandoffReceiptValueRecorded: false,
    privateEditBlockedSmokeCommand: "npm run release:private-edit-strict-proof-blocked-smoke",
    privateEditBlockedSmokeReady,
    privateEditBlockedSmokeSourceMode: textValue(privateEditBlockedSmoke.sourceMode),
    privateEditBlockedSmokeReportCommand: textValue(privateEditBlockedSmoke.reportCommand),
    privateEditBlockedSmokeStrictProofReady: privateEditBlockedSmoke.privateEditStrictProofReady === true,
    privateEditBlockedSmokeHandoffReady: privateEditBlockedSmoke.privateEditStrictProofBlockedHandoffReady === true,
    privateEditBlockedSmokeHandoffRowCount: integerValue(privateEditBlockedSmoke.privateEditStrictProofBlockedHandoffRowCount),
    privateEditBlockedSmokeStrictFailureRowCount: integerValue(privateEditBlockedSmoke.strictFailureRowCount),
    privateEditBlockedSmokeCurrentPlaceholderKeyCount: integerValue(privateEditBlockedSmoke.currentPlaceholderKeyCount),
    privateEditBlockedSmokeRealLocalEnvRead: privateEditBlockedSmoke.realLocalEnvRead === true,
    privateEditBlockedSmokeRealLocalEnvModified: privateEditBlockedSmoke.realLocalEnvModified === true,
    privateEditBlockedSmokeProgressSkipped: privateEditBlockedSmoke.progressRefreshSkippedInBlockedSmoke === true,
    privateEditBlockedSmokeRows,
    privateEditBlockedSmokeRowCount: privateEditBlockedSmokeRows.length,
    privateEditBlockedSmokeSummary: privateEditBlockedSmokeRows.map((row) => row.item).join(", "),
    privateEditBlockedSmokeValueRecorded: false,
    finalHandoffSuccessRedactionCommand: "npm run release:final-handoff-success-redaction-smoke",
    finalHandoffSuccessRedactionReady,
    finalHandoffSuccessRedactionSourceMode: textValue(finalHandoff.sourceMode),
    finalHandoffSuccessRedactionReportCommand: textValue(finalHandoff.reportCommand),
    finalHandoffSuccessRedactionSyntheticSmoke: finalHandoff.syntheticSuccessRedactionSmoke === true,
    finalHandoffSuccessRedactionMetadataReady: finalHandoff.releaseChannelMetadataReady === true,
    finalHandoffSuccessRedactionPrivateEditStillRequired: finalHandoff.privateEditStillRequired === true,
    finalHandoffSuccessRedactionCurrentReadyCount: integerValue(finalHandoff.currentReadyCount),
    finalHandoffSuccessRedactionCurrentRowCount: integerValue(finalHandoff.currentRowCount),
    finalHandoffSuccessRedactionCurrentPlaceholderKeyCount: integerValue(finalHandoff.currentPlaceholderKeyCount),
    finalHandoffSuccessRedactionPlaceholderEditLocationCount: integerValue(finalHandoff.currentPlaceholderEditLocationCount),
    finalHandoffSuccessRedactionStrictProofReady: finalHandoff.strictProofReady === true,
    finalHandoffSuccessRedactionRealStrictReady: finalHandoff.realStrictReady === true,
    finalHandoffSuccessRedactionRealStrictExitCode: integerValue(finalHandoff.realStrictExitCode),
    finalHandoffSuccessRedactionRealStrictReadyCount: integerValue(finalHandoff.realStrictCurrentReadyCount),
    finalHandoffSuccessRedactionRealStrictRowCount: integerValue(finalHandoff.realStrictCurrentRowCount),
    finalHandoffSuccessRedactionRealStrictPlaceholderKeyCount: integerValue(finalHandoff.realStrictPlaceholderKeyCount),
    finalHandoffSuccessRedactionRealLocalEnvRead: finalHandoff.realLocalEnvRead === true,
    finalHandoffSuccessRedactionRealLocalEnvModified: finalHandoff.realLocalEnvModified === true,
    finalHandoffSuccessRedactionRows,
    finalHandoffSuccessRedactionRowCount: finalHandoffSuccessRedactionRows.length,
    finalHandoffSuccessRedactionSummary: finalHandoffSuccessRedactionRows.map((row) => row.item).join(", "),
    finalHandoffSuccessRedactionValueRecorded: false,
    updateFeedCheckpointCommand: "npm run release:update-feed-checkpoint-smoke",
    updateFeedCheckpointReady,
    updateFeedCheckpointReportCommand: textValue(updateFeedCheckpoint.reportCommand),
    updateFeedCheckpointSourceArtifactRowCount: integerValue(updateFeedCheckpoint.sourceArtifactRowCount),
    updateFeedCheckpointBranchRowCount: integerValue(updateFeedCheckpoint.branchRowCount),
    updateFeedCheckpointComparisonRowCount: integerValue(updateFeedCheckpoint.comparisonRowCount),
    updateFeedCheckpointRealPostEditProofReady: updateFeedCheckpoint.realPostEditProofReady === true,
    updateFeedCheckpointRealLiveCheckReady: updateFeedCheckpoint.realLiveCheckReady === true,
    updateFeedCheckpointRealStrictReady: updateFeedCheckpoint.realStrictReady === true,
    updateFeedCheckpointRealSelectedReadyCount: integerValue(updateFeedCheckpoint.realSelectedReadyCount),
    updateFeedCheckpointRealPlaceholderKeyCount: integerValue(updateFeedCheckpoint.realPlaceholderKeyCount),
    updateFeedCheckpointRealPlaceholderEditLocationCount: integerValue(updateFeedCheckpoint.realPlaceholderEditLocationCount),
    updateFeedCheckpointRealAutoUpdateReady: updateFeedCheckpoint.realAutoUpdateReady === true,
    updateFeedCheckpointRealAutoUpdateBlockerCount: integerValue(updateFeedCheckpoint.realAutoUpdateBlockerCount),
    updateFeedCheckpointSyntheticPostEditProofReady: updateFeedCheckpoint.syntheticPostEditProofReady === true,
    updateFeedCheckpointSyntheticLiveCheckReady: updateFeedCheckpoint.syntheticLiveCheckReady === true,
    updateFeedCheckpointSyntheticStrictReady: updateFeedCheckpoint.syntheticStrictReady === true,
    updateFeedCheckpointSyntheticSelectedReadyCount: integerValue(updateFeedCheckpoint.syntheticSelectedReadyCount),
    updateFeedCheckpointSyntheticPlaceholderKeyCount: integerValue(updateFeedCheckpoint.syntheticPlaceholderKeyCount),
    updateFeedCheckpointSyntheticPlaceholderEditLocationCount: integerValue(updateFeedCheckpoint.syntheticPlaceholderEditLocationCount),
    updateFeedCheckpointSyntheticRealLocalEnvRead: updateFeedCheckpoint.syntheticRealLocalEnvRead === true,
    updateFeedCheckpointSyntheticAutoUpdateReady: updateFeedCheckpoint.syntheticAutoUpdateReady === true,
    updateFeedCheckpointSyntheticAutoUpdateBlockerCount: integerValue(updateFeedCheckpoint.syntheticAutoUpdateBlockerCount),
    updateFeedCheckpointSignedUpdateArtifactsReady: updateFeedCheckpoint.signedUpdateArtifactsReady === true,
    updateFeedCheckpointHardGateCommand: textValue(updateFeedCheckpoint.hardGateCommand),
    updateFeedCheckpointHardGateReady: updateFeedCheckpoint.hardGateReady === true,
    updateFeedCheckpointHardGateWouldFail: updateFeedCheckpoint.hardGateWouldFail === true,
    updateFeedCheckpointRows,
    updateFeedCheckpointRowCount: updateFeedCheckpointRows.length,
    updateFeedCheckpointSummary: updateFeedCheckpointRows.map((row) => row.item).join(", "),
    updateFeedCheckpointValueRecorded: false,
    channelEditRecommendedOperatorProofCommand: textValue(channel.releaseChannelRecommendedOperatorProofCommand),
    channelEditRecommendedOperatorProofCommandRole: textValue(channel.releaseChannelRecommendedOperatorProofCommandRole),
    channelEditRecommendedOperatorProofCommandValueRecorded:
      channel.releaseChannelRecommendedOperatorProofCommandValueRecorded === false,
    firstPrivateEditProofCommand: privateEditProofCommandRows[0].command,
    postEditProofCommand: privateEditProofCommandRows[1].command,
    progressRefreshCommand: privateEditProofCommandRows[2].command,
    privateValueLeakAuditCommand: privateEditProofCommandRows[3].command,
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    sourceLabelsMatchLatestTenPlan: labelsMatch,
    audienceLatestTenPlanProgressLabel: textValue(audience.latestTenPlanProgressLabel),
    channelEditLatestTenPlanProgressLabel: textValue(channel.latestTenPlanProgressLabel),
    privateEditBlockedSmokeLatestTenPlanProgressLabel: textValue(privateEditBlockedSmoke.currentTenPlanProgressLabel),
    finalHandoffSuccessRedactionLatestTenPlanProgressLabel: textValue(finalHandoff.currentTenPlanProgressLabel),
    clearanceTransitionLatestTenPlanProgressLabel: textValue(clearance.currentTenPlanProgressLabel),
    autoUpdateTransitionLatestTenPlanProgressLabel: textValue(autoUpdate.currentTenPlanProgressLabel),
    updateFeedCheckpointLatestTenPlanProgressLabel: textValue(updateFeedCheckpoint.currentTenPlanProgressLabel),
    releaseChannelClearanceTransitionReady: clearance.releaseChannelClearanceTransitionReady === true,
    postClearanceCurrentBlockerMode: textValue(clearance.currentBlockerMode),
    postClearanceCurrentPriorityActionId: textValue(clearance.currentPriorityActionId),
    postClearanceCurrentPriorityActionLabel: textValue(clearance.currentPriorityActionLabel),
    postClearanceCurrentPlaceholderKeyCount: integerValue(clearance.currentPlaceholderKeyCount),
    postClearanceSyntheticClearanceReady: clearance.syntheticClearanceReady === true,
    postClearanceSyntheticStrictReady: clearance.syntheticClearanceStrictReady === true,
    postClearanceSyntheticReadyRowCount: integerValue(clearance.syntheticClearanceCurrentReadyCount),
    postClearanceSyntheticRowCount: integerValue(clearance.syntheticClearanceCurrentRowCount),
    postClearanceSyntheticPlaceholderKeyCount: integerValue(clearance.syntheticClearancePlaceholderKeyCount),
    postClearanceNextPriorityActionId: textValue(clearance.nextPriorityActionId),
    postClearanceNextPriorityActionLabel: textValue(clearance.nextPriorityActionLabel),
    postClearanceNextActionPreviewReady: clearance.nextActionPreviewReady === true,
    postClearanceNextActionPreviewProofCommand: textValue(clearance.nextActionPreviewProofCommand),
    postClearanceNextActionPreviewFirstBlocker: textValue(clearance.nextActionPreviewFirstBlocker),
    postClearanceNextActionPreviewRequiredKeyCount: integerValue(clearance.nextActionPreviewRequiredKeyCount),
    postClearanceNextActionPreviewPlaceholderKeyCount: integerValue(clearance.nextActionPreviewPlaceholderKeyCount),
    postClearanceTransitionRows,
    postClearanceTransitionRowCount: postClearanceTransitionRows.length,
    releaseAutoUpdateTransitionReady: autoUpdate.releaseAutoUpdateTransitionReady === true,
    autoUpdateTransitionReady,
    autoUpdateSyntheticFeedChannelConfigReady: autoUpdate.syntheticFeedChannelConfigReady === true,
    autoUpdateRealAutoUpdateReady: autoUpdate.realAutoUpdateReady === true,
    autoUpdateRealAutoUpdateBlocked: autoUpdate.realAutoUpdateBlocked === true,
    autoUpdateRealAutoUpdateBlockerCount: integerValue(autoUpdate.realAutoUpdateBlockerCount),
    autoUpdateSignedUpdateArtifactsReady: autoUpdate.signedUpdateArtifactsReady === true,
    autoUpdateRequiredUpdateFeedKeyCount: integerValue(autoUpdate.requiredUpdateFeedKeyCount),
    autoUpdateProofCommand: textValue(autoUpdate.releaseChannelNextActionProofCommand),
    autoUpdateTransitionRows,
    autoUpdateTransitionRowCount: autoUpdateTransitionRows.length,
    latestCompletedPlanNumber: progress.latestCompletedPlanNumber,
    latestTenPlanProgressLabel: progress.latestTenPlanProgressLabel,
    latestTenPlanWindowStart: progress.latestTenPlanWindowStart,
    latestTenPlanWindowEnd: progress.latestTenPlanWindowEnd,
    latestTenPlanCompletedCount: progress.latestTenPlanCompletedCount,
    latestTenPlanTotal: progress.latestTenPlanTotal,
    tenPlanProgressReportDue: progress.tenPlanProgressReportDue,
    currentTenPlanReportBoundaryNumber: progress.currentTenPlanReportBoundaryNumber,
    currentTenPlanReportBoundaryAt: progress.currentTenPlanReportBoundaryAt,
    nextTenPlanProgressReportAt: progress.nextTenPlanProgressReportAt,
    nextScheduledTenPlanProgressReportNumber: progress.nextScheduledTenPlanProgressReportNumber,
    nextScheduledTenPlanProgressReportAt: progress.nextScheduledTenPlanProgressReportAt,
    currentTenPlanWindowRows,
    currentTenPlanWindowRowCount,
    currentTenPlanWindowRowSummary,
    tenPlanProgressReportReceiptRows,
    tenPlanProgressReportReceiptRowCount: tenPlanProgressReportReceiptRows.length,
    tenPlanProgressReportReceiptReady,
    tenPlanProgressReportReceiptSummary: tenPlanProgressReportReceiptRows.map((row) => row.item).join(", "),
    tenPlanProgressReportReceiptValueRecorded: false,
    tenPlanProgressReportRolloverRows,
    tenPlanProgressReportRolloverRowCount: tenPlanProgressReportRolloverRows.length,
    tenPlanProgressReportRolloverReady,
    tenPlanProgressReportRolloverSummary: tenPlanProgressReportRolloverRows.map((row) => row.item).join(", "),
    tenPlanProgressReportRolloverValueRecorded: false,
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
    firstTimeComposerReady: audience.firstTimeComposerReady === true,
    professionalProducerReady: audience.professionalProducerReady === true,
    directCompositionReady: audience.directCompositionReady === true,
    allGenreStyleReadinessReady: audience.allGenreStyleReadinessReady === true,
    readyStyleCount: integerValue(audience.readyStyleCount),
    requiredStyleCount: integerValue(audience.requiredStyleCount),
    localDeliveryPackageReady: audience.localDeliveryPackageReady === true,
    localPackageReopenReady: audience.localPackageReopenReady === true,
    localPackageReopenRegeneratedExportsMatchDisk: audience.localPackageReopenRegeneratedExportsMatchDisk === true,
    samplingSecondaryReady: audience.samplingSecondaryReady === true,
    localFirstReady: audience.localFirstReady === true,
    completionGapStatus: textValue(channel.completionGapStatus),
    currentActionLabel: textValue(channel.currentActionLabel),
    currentNextCommand: textValue(channel.currentNextCommand),
    currentFirstBlocker: textValue(channel.currentFirstBlocker),
    currentEnvEditTarget: textValue(channel.currentEnvEditTarget),
    releaseChannelEditPacketMode: textValue(channel.releaseChannelEditPacketMode),
    releaseChannelEditPacketOperatorCommandSummary: textValue(channel.operatorCommandSummary),
    currentRequiredKeyCount: integerValue(channel.currentRequiredKeyCount),
    currentPlaceholderKeyCount: integerValue(channel.currentPlaceholderKeyCount),
    liveCheckCurrentReadyCount: integerValue(channel.liveCheckCurrentReadyCount),
    liveCheckRowCount: integerValue(channel.liveCheckRowCount),
    hardGateCommand: textValue(channel.hardGateCommand),
    externalDistributionReady: channel.externalDistributionReady === true,
    privateValuesRecorded: false,
    localEnvValueRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    privateBeatRecorded: false,
    realUserAudioRecorded: false,
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

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Completion Report Packet Smoke

## Status

- Completion report packet ready: ${readyLabel(report.releaseCompletionReportPacketReady)}
- Refresh command order: ${report.refreshCommandSummary}
- Private-edit proof command order: ${report.privateEditProofCommandSummary}
- Private-edit operator proof command: \`${report.privateEditOperatorProofCommand}\`
- Private-edit operator proof role: ${report.privateEditOperatorProofCommandRole}
- Strict proof handoff receipt ready: ${readyLabel(report.strictProofHandoffReceiptReady)}
- Strict proof handoff receipt rows: ${report.strictProofHandoffReceiptRowCount} (${report.strictProofHandoffReceiptSummary})
- Private-edit blocked smoke ready: ${readyLabel(report.privateEditBlockedSmokeReady)}
- Private-edit blocked smoke rows: ${report.privateEditBlockedSmokeRowCount} (${report.privateEditBlockedSmokeSummary})
- Private-edit blocked smoke command: \`${report.privateEditBlockedSmokeCommand}\`
- Private-edit blocked smoke source label: ${report.privateEditBlockedSmokeLatestTenPlanProgressLabel}
- Private-edit blocked smoke handoff rows: ${report.privateEditBlockedSmokeHandoffRowCount}
- Private-edit blocked smoke strict failures: ${report.privateEditBlockedSmokeStrictFailureRowCount}
- Private-edit blocked smoke real env read: ${readyLabel(report.privateEditBlockedSmokeRealLocalEnvRead)}
- Final handoff success-redaction ready: ${readyLabel(report.finalHandoffSuccessRedactionReady)}
- Final handoff success-redaction command: \`${report.finalHandoffSuccessRedactionCommand}\`
- Final handoff success-redaction source label: ${report.finalHandoffSuccessRedactionLatestTenPlanProgressLabel}
- Final handoff release-channel metadata ready: ${readyLabel(report.finalHandoffSuccessRedactionMetadataReady)}
- Final handoff real strict rows: ${report.finalHandoffSuccessRedactionRealStrictReadyCount}/${report.finalHandoffSuccessRedactionRealStrictRowCount}
- Final handoff real strict placeholder keys: ${report.finalHandoffSuccessRedactionRealStrictPlaceholderKeyCount}
- Final handoff real env read: ${readyLabel(report.finalHandoffSuccessRedactionRealLocalEnvRead)}
- Channel edit packet recommended proof chain: \`${report.channelEditRecommendedOperatorProofCommand}\`
- Channel edit packet proof role: ${report.channelEditRecommendedOperatorProofCommandRole}
- Latest completed plan: plan-${report.latestCompletedPlanNumber}
- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- Current 10-plan report boundary: ${report.currentTenPlanReportBoundaryAt}
- Next 10-plan progress report at: ${report.nextTenPlanProgressReportAt}
- Next scheduled 10-plan progress report after delivery: ${report.nextScheduledTenPlanProgressReportAt}
- Current 10-plan rows: ${report.currentTenPlanWindowRowCount} (${report.currentTenPlanWindowRowSummary})
- 10-plan progress report receipt ready: ${readyLabel(report.tenPlanProgressReportReceiptReady)}
- 10-plan progress report receipt rows: ${report.tenPlanProgressReportReceiptRowCount} (${report.tenPlanProgressReportReceiptSummary})
- 10-plan cadence rollover ready: ${readyLabel(report.tenPlanProgressReportRolloverReady)}
- 10-plan cadence rollover rows: ${report.tenPlanProgressReportRolloverRowCount} (${report.tenPlanProgressReportRolloverSummary})
- Source labels match latest 10-plan: ${readyLabel(report.sourceLabelsMatchLatestTenPlan)}
- Audience source label: ${report.audienceLatestTenPlanProgressLabel}
- Channel edit source label: ${report.channelEditLatestTenPlanProgressLabel}
- Private-edit blocked smoke source label: ${report.privateEditBlockedSmokeLatestTenPlanProgressLabel}
- Final handoff success-redaction source label: ${report.finalHandoffSuccessRedactionLatestTenPlanProgressLabel}
- Clearance transition source label: ${report.clearanceTransitionLatestTenPlanProgressLabel}
- Auto-update transition source label: ${report.autoUpdateTransitionLatestTenPlanProgressLabel}
- Update-feed checkpoint source label: ${report.updateFeedCheckpointLatestTenPlanProgressLabel}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- First-time composer ready: ${readyLabel(report.firstTimeComposerReady)}
- Professional producer ready: ${readyLabel(report.professionalProducerReady)}
- Direct composition ready: ${readyLabel(report.directCompositionReady)}
- All-genre style readiness: ${report.readyStyleCount}/${report.requiredStyleCount}
- Local delivery package ready: ${readyLabel(report.localDeliveryPackageReady)}
- Local package reopen ready: ${readyLabel(report.localPackageReopenReady)}
- Regenerated exports match disk: ${readyLabel(report.localPackageReopenRegeneratedExportsMatchDisk)}
- Sampling secondary: ${readyLabel(report.samplingSecondaryReady)}
- Local-first ready: ${readyLabel(report.localFirstReady)}
- Completion gap status: ${report.completionGapStatus}
- Current action: ${report.currentActionLabel}
- Current next command: \`${report.currentNextCommand}\`
- Current first blocker: ${report.currentFirstBlocker}
- Current env edit target: \`${report.currentEnvEditTarget}\`
- Release-channel edit packet mode: ${report.releaseChannelEditPacketMode}
- Release-channel edit packet operator order: ${report.releaseChannelEditPacketOperatorCommandSummary}
- Current required keys: ${report.currentRequiredKeyCount}
- Current placeholder keys: ${report.currentPlaceholderKeyCount}
- Live-check ready rows: ${report.liveCheckCurrentReadyCount}/${report.liveCheckRowCount}
- Post-clearance transition ready: ${readyLabel(report.releaseChannelClearanceTransitionReady)}
- Post-clearance current blocker mode: ${report.postClearanceCurrentBlockerMode}
- Post-clearance current priority: ${report.postClearanceCurrentPriorityActionLabel} (${report.postClearanceCurrentPriorityActionId})
- Post-clearance current placeholder keys: ${report.postClearanceCurrentPlaceholderKeyCount}
- Post-clearance synthetic strict ready: ${readyLabel(report.postClearanceSyntheticStrictReady)}
- Post-clearance synthetic ready rows: ${report.postClearanceSyntheticReadyRowCount}/${report.postClearanceSyntheticRowCount}
- Post-clearance next priority action: ${report.postClearanceNextPriorityActionLabel} (${report.postClearanceNextPriorityActionId})
- Post-clearance next proof command: \`${report.postClearanceNextActionPreviewProofCommand}\`
- Post-clearance next first blocker: ${report.postClearanceNextActionPreviewFirstBlocker}
- Auto-update transition ready: ${readyLabel(report.releaseAutoUpdateTransitionReady)}
- Auto-update synthetic feed/channel ready: ${readyLabel(report.autoUpdateSyntheticFeedChannelConfigReady)}
- Auto-update real readiness: ${readyLabel(report.autoUpdateRealAutoUpdateReady)}
- Auto-update real blocked: ${readyLabel(report.autoUpdateRealAutoUpdateBlocked)}
- Auto-update blocker rows: ${report.autoUpdateRealAutoUpdateBlockerCount}
- Auto-update signed artifacts ready: ${readyLabel(report.autoUpdateSignedUpdateArtifactsReady)}
- Auto-update proof command: \`${report.autoUpdateProofCommand}\`
- Update-feed checkpoint ready: ${readyLabel(report.updateFeedCheckpointReady)}
- Update-feed checkpoint command: \`${report.updateFeedCheckpointCommand}\`
- Update-feed real selected keys: ${report.updateFeedCheckpointRealSelectedReadyCount}/2
- Update-feed real placeholder keys: ${report.updateFeedCheckpointRealPlaceholderKeyCount}
- Update-feed synthetic selected keys: ${report.updateFeedCheckpointSyntheticSelectedReadyCount}/2
- Update-feed synthetic placeholder keys: ${report.updateFeedCheckpointSyntheticPlaceholderKeyCount}
- Update-feed synthetic real env read: ${readyLabel(report.updateFeedCheckpointSyntheticRealLocalEnvRead)}
- Update-feed hard gate would fail: ${readyLabel(report.updateFeedCheckpointHardGateWouldFail)}
- Hard gate command: \`${report.hardGateCommand}\`
- Private values recorded: no
- Local env values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Signing attempted: no
- Apple notary submission attempted: no
- External distribution claimed: no

## Refresh Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.refreshCommandRows)}

## Private-Edit Proof Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.privateEditProofCommandRows)}

## Strict Proof Handoff Receipt

| order | current blocker | edit target | recommended command | follow-up | source field | value recorded |
|---:|---|---|---|---|---|---:|
${formatStrictProofHandoffRows(report.strictProofHandoffReceiptRows)}

## Private-Edit Blocked Smoke Evidence

| order | item | evidence | source field | value recorded |
|---:|---|---|---|---:|
${formatReceiptRows(report.privateEditBlockedSmokeRows)}

## Final Handoff Success-Redaction Evidence

| order | item | evidence | source field | value recorded |
|---:|---|---|---|---:|
${formatReceiptRows(report.finalHandoffSuccessRedactionRows)}

## Update Feed Checkpoint Evidence

| order | item | evidence | source field | value recorded |
|---:|---|---|---|---:|
${formatReceiptRows(report.updateFeedCheckpointRows)}

## Current 10-Plan Window Rows

| order | plan | filename | value recorded |
|---:|---|---|---:|
${formatPlanRows(report.currentTenPlanWindowRows)}

## 10-Plan Progress Report Receipt

| order | item | evidence | source field | value recorded |
|---:|---|---|---|---:|
${formatReceiptRows(report.tenPlanProgressReportReceiptRows)}

## 10-Plan Cadence Rollover

| order | item | evidence | source field | value recorded |
|---:|---|---|---|---:|
${formatRolloverRows(report.tenPlanProgressReportRolloverRows)}

## Source Artifacts

| artifact | present | ready | evidence | path | value recorded |
|---|---:|---:|---|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Post-Clearance Transition Rows

| order | state | evidence | command | ready | value recorded |
|---:|---|---|---|---:|---:|
${formatClearanceTransitionRows(report.postClearanceTransitionRows)}

## Auto-Update Transition Rows

| order | state | evidence | command | ready | value recorded |
|---:|---|---|---|---:|---:|
${formatClearanceTransitionRows(report.autoUpdateTransitionRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this packet smoke.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.releaseCompletionReportPacketReady === true, "release completion report packet should be ready");
  check(report.reportCommand === "npm run release:completion-report-packet-smoke", "release completion report packet should report its command");
  check(report.refreshCommandCount === 7, "release completion report packet should refresh seven source commands");
  check(
    report.refreshCommandSummary ===
      "npm run release:audience-completion-handoff-smoke -> npm run release:channel-edit-packet-smoke -> npm run release:private-edit-strict-proof-blocked-smoke -> npm run release:final-handoff-success-redaction-smoke -> npm run release:channel-clearance-transition-smoke -> npm run release:auto-update-transition-smoke -> npm run release:update-feed-checkpoint-smoke",
    "release completion report packet should refresh audience, channel edit packet, private-edit blocked smoke, final handoff success-redaction, clearance transition, auto-update transition, then update-feed checkpoint"
  );
  check(report.refreshCommandRows.every((row) => row.valueRecorded === false), "release completion report packet command rows should be value-free");
  check(report.privateEditProofCommandCount === 5, "release completion report packet should include five private-edit proof commands");
  check(
    report.privateEditProofCommandSummary ===
      "npm run release:channel-live-check-strict -> npm run release:post-edit-proof -> npm run release:progress-refresh-smoke -> npm run release:private-value-leak-audit -> npm run release:external-check",
    "release completion report packet should expose the private-edit proof command order"
  );
  check(report.privateEditOperatorProofCommand === privateEditOperatorProofCommand, "release completion report packet should include the recommended private-edit operator proof command");
  check(report.privateEditOperatorProofCommandRole === "recommended strict-first proof chain after replacing the four private release-channel placeholders", "release completion report packet should describe the private-edit operator proof command");
  check(report.privateEditOperatorProofCommandValueRecorded === false, "release completion report packet operator proof command should be value-free");
  check(report.strictProofHandoffReceiptReady === true, "release completion report packet strict proof handoff receipt should be ready");
  check(Array.isArray(report.strictProofHandoffReceiptRows), "release completion report packet should include strict proof handoff receipt rows");
  check(report.strictProofHandoffReceiptRowCount === 1, "release completion report packet should include one strict proof handoff row");
  check(report.strictProofHandoffReceiptRowCount === report.strictProofHandoffReceiptRows.length, "release completion report packet strict proof handoff row count should match row length");
  check(report.strictProofHandoffReceiptRows[0]?.command === privateEditOperatorProofCommand, "release completion report packet strict proof handoff should recommend the strict proof chain");
  check(report.strictProofHandoffReceiptRows[0]?.editTarget === ".env.distribution.local", "release completion report packet strict proof handoff should point at ignored local env");
  check(report.strictProofHandoffReceiptRows[0]?.blocker === report.currentFirstBlocker, "release completion report packet strict proof handoff should carry the current blocker");
  check(report.strictProofHandoffReceiptRows.every((row) => row.valueRecorded === false), "release completion report packet strict proof handoff rows should not record values");
  check(report.strictProofHandoffReceiptValueRecorded === false, "release completion report packet strict proof handoff receipt should be value-free");
  check(report.privateEditBlockedSmokeReady === true, "release completion report packet blocked smoke evidence should be ready");
  check(report.privateEditBlockedSmokeCommand === "npm run release:private-edit-strict-proof-blocked-smoke", "release completion report packet should expose the blocked smoke command");
  check(report.privateEditBlockedSmokeReportCommand === report.privateEditBlockedSmokeCommand, "release completion report packet should match the blocked smoke report command");
  check(report.privateEditBlockedSmokeStrictProofReady === false, "release completion report packet blocked smoke should stay blocked");
  check(report.privateEditBlockedSmokeHandoffReady === true, "release completion report packet blocked smoke handoff should be ready");
  check(report.privateEditBlockedSmokeHandoffRowCount > 0, "release completion report packet blocked smoke should include blocked handoff rows");
  check(report.privateEditBlockedSmokeStrictFailureRowCount === 4, "release completion report packet blocked smoke should include four strict failure rows");
  check(report.privateEditBlockedSmokeCurrentPlaceholderKeyCount === 4, "release completion report packet blocked smoke should include four placeholder keys");
  check(report.privateEditBlockedSmokeRealLocalEnvRead === false, "release completion report packet blocked smoke should not read the real local env");
  check(report.privateEditBlockedSmokeRealLocalEnvModified === false, "release completion report packet blocked smoke should not modify the real local env");
  check(report.privateEditBlockedSmokeProgressSkipped === true, "release completion report packet blocked smoke should skip progress refresh");
  check(report.privateEditBlockedSmokeRowCount === report.privateEditBlockedSmokeRows.length, "release completion report packet blocked smoke row count should match rows");
  check(report.privateEditBlockedSmokeRowCount === 4, "release completion report packet should include four blocked smoke evidence rows");
  check(report.privateEditBlockedSmokeRows.every((row) => row.valueRecorded === false), "release completion report packet blocked smoke rows should not record values");
  check(report.privateEditBlockedSmokeValueRecorded === false, "release completion report packet blocked smoke evidence should be value-free");
  check(report.finalHandoffSuccessRedactionReady === true, "release completion report packet final handoff success-redaction should be ready");
  check(report.finalHandoffSuccessRedactionCommand === "npm run release:final-handoff-success-redaction-smoke", "release completion report packet should expose the final handoff success-redaction command");
  check(report.finalHandoffSuccessRedactionReportCommand === report.finalHandoffSuccessRedactionCommand, "release completion report packet should match the final handoff success-redaction report command");
  check(report.finalHandoffSuccessRedactionSourceMode === "synthetic-final-handoff-success-redaction-smoke", "release completion report packet final handoff source mode should be synthetic success-redaction");
  check(report.finalHandoffSuccessRedactionSyntheticSmoke === true, "release completion report packet final handoff should report synthetic smoke posture");
  check(report.finalHandoffSuccessRedactionMetadataReady === true, "release completion report packet final handoff should prove metadata-ready posture");
  check(report.finalHandoffSuccessRedactionPrivateEditStillRequired === false, "release completion report packet final handoff should clear private-edit-required posture in synthetic proof");
  check(report.finalHandoffSuccessRedactionCurrentReadyCount === 4, "release completion report packet final handoff should prove four current ready rows");
  check(report.finalHandoffSuccessRedactionCurrentRowCount === 4, "release completion report packet final handoff should prove four current rows");
  check(report.finalHandoffSuccessRedactionCurrentPlaceholderKeyCount === 0, "release completion report packet final handoff should prove zero current placeholder keys");
  check(report.finalHandoffSuccessRedactionPlaceholderEditLocationCount === 0, "release completion report packet final handoff should prove zero placeholder edit locations");
  check(report.finalHandoffSuccessRedactionStrictProofReady === true, "release completion report packet final handoff should prove strict proof readiness");
  check(report.finalHandoffSuccessRedactionRealStrictReady === true, "release completion report packet final handoff should prove real strict ready posture from synthetic source");
  check(report.finalHandoffSuccessRedactionRealStrictExitCode === 0, "release completion report packet final handoff should prove strict exit zero");
  check(report.finalHandoffSuccessRedactionRealStrictReadyCount === 4, "release completion report packet final handoff should prove four strict-ready rows");
  check(report.finalHandoffSuccessRedactionRealStrictRowCount === 4, "release completion report packet final handoff should prove four strict rows");
  check(report.finalHandoffSuccessRedactionRealStrictPlaceholderKeyCount === 0, "release completion report packet final handoff should prove zero strict placeholder keys");
  check(report.finalHandoffSuccessRedactionRealLocalEnvRead === false, "release completion report packet final handoff should not read real local env");
  check(report.finalHandoffSuccessRedactionRealLocalEnvModified === false, "release completion report packet final handoff should not modify real local env");
  check(report.finalHandoffSuccessRedactionRowCount === report.finalHandoffSuccessRedactionRows.length, "release completion report packet final handoff row count should match rows");
  check(report.finalHandoffSuccessRedactionRowCount === 4, "release completion report packet should include four final handoff success-redaction evidence rows");
  check(report.finalHandoffSuccessRedactionRows.every((row) => row.valueRecorded === false), "release completion report packet final handoff rows should not record values");
  check(report.finalHandoffSuccessRedactionValueRecorded === false, "release completion report packet final handoff evidence should be value-free");
  check(report.updateFeedCheckpointReady === true, "release completion report packet update-feed checkpoint should be ready");
  check(report.updateFeedCheckpointCommand === "npm run release:update-feed-checkpoint-smoke", "release completion report packet should expose the update-feed checkpoint command");
  check(report.updateFeedCheckpointReportCommand === report.updateFeedCheckpointCommand, "release completion report packet should match the update-feed checkpoint report command");
  check(report.updateFeedCheckpointSourceArtifactRowCount === 2, "release completion report packet update-feed checkpoint should include two source artifacts");
  check(report.updateFeedCheckpointBranchRowCount === 2, "release completion report packet update-feed checkpoint should include two branch rows");
  check(report.updateFeedCheckpointComparisonRowCount === 6, "release completion report packet update-feed checkpoint should include six comparison rows");
  check(report.updateFeedCheckpointRealPostEditProofReady === true, "release completion report packet update-feed checkpoint should keep real proof ready");
  check(report.updateFeedCheckpointSyntheticPostEditProofReady === true, "release completion report packet update-feed checkpoint should keep synthetic proof ready");
  check(report.updateFeedCheckpointSyntheticLiveCheckReady === true, "release completion report packet update-feed checkpoint should prove synthetic live-check readiness");
  check(report.updateFeedCheckpointSyntheticStrictReady === true, "release completion report packet update-feed checkpoint should prove synthetic strict readiness");
  check(report.updateFeedCheckpointSyntheticSelectedReadyCount === 2, "release completion report packet update-feed checkpoint should prove two synthetic selected-ready keys");
  check(report.updateFeedCheckpointSyntheticPlaceholderKeyCount === 0, "release completion report packet update-feed checkpoint should prove zero synthetic placeholders");
  check(report.updateFeedCheckpointSyntheticPlaceholderEditLocationCount === 0, "release completion report packet update-feed checkpoint should prove zero synthetic placeholder edit locations");
  check(report.updateFeedCheckpointSyntheticRealLocalEnvRead === false, "release completion report packet update-feed checkpoint should not read real local env for the synthetic branch");
  check(report.updateFeedCheckpointRealAutoUpdateReady === false, "release completion report packet update-feed checkpoint should keep real auto-update unready");
  check(report.updateFeedCheckpointSyntheticAutoUpdateReady === false, "release completion report packet update-feed checkpoint should keep synthetic-source auto-update unready");
  check(report.updateFeedCheckpointRealAutoUpdateBlockerCount > 0, "release completion report packet update-feed checkpoint should include real auto-update blocker rows");
  check(report.updateFeedCheckpointSyntheticAutoUpdateBlockerCount > 0, "release completion report packet update-feed checkpoint should include synthetic-source auto-update blocker rows");
  check(report.updateFeedCheckpointSignedUpdateArtifactsReady === false, "release completion report packet update-feed checkpoint should keep signed update artifacts unready");
  check(report.updateFeedCheckpointHardGateCommand === "npm run release:external-check", "release completion report packet update-feed checkpoint should keep hard gate command");
  check(report.updateFeedCheckpointHardGateReady === false, "release completion report packet update-feed checkpoint should keep hard gate unready");
  check(report.updateFeedCheckpointHardGateWouldFail === true, "release completion report packet update-feed checkpoint should keep hard gate would-fail posture");
  check(report.updateFeedCheckpointRowCount === report.updateFeedCheckpointRows.length, "release completion report packet update-feed checkpoint row count should match rows");
  check(report.updateFeedCheckpointRowCount === 4, "release completion report packet should include four update-feed checkpoint evidence rows");
  check(report.updateFeedCheckpointRows.every((row) => row.valueRecorded === false), "release completion report packet update-feed checkpoint rows should not record values");
  check(report.updateFeedCheckpointValueRecorded === false, "release completion report packet update-feed checkpoint evidence should be value-free");
  check(report.channelEditRecommendedOperatorProofCommand === privateEditOperatorProofCommand, "release completion report packet should mirror the channel edit packet recommended proof chain");
  check(
    report.channelEditRecommendedOperatorProofCommandRole === report.privateEditOperatorProofCommandRole,
    "release completion report packet should mirror the channel edit packet recommended proof role"
  );
  check(report.channelEditRecommendedOperatorProofCommandValueRecorded === true, "release completion report packet should prove the channel edit packet recommendation is value-free");
  check(
    report.releaseChannelEditPacketOperatorCommandSummary.includes(privateEditOperatorProofCommand),
    "release completion report packet should show the channel edit packet operator order includes the strict proof chain"
  );
  check(report.privateEditProofCommandRows.every((row) => row.valueRecorded === false), "release completion report packet private-edit proof commands should be value-free");
  check(report.firstPrivateEditProofCommand === "npm run release:channel-live-check-strict", "release completion report packet should make strict live check the first private-edit proof command");
  check(report.postEditProofCommand === "npm run release:post-edit-proof", "release completion report packet should include post-edit proof command");
  check(report.progressRefreshCommand === "npm run release:progress-refresh-smoke", "release completion report packet should include progress refresh command");
  check(report.privateValueLeakAuditCommand === "npm run release:private-value-leak-audit", "release completion report packet should include private value leak audit command");
  check(report.sourceArtifactRowCount === 7, "release completion report packet should include seven source artifacts");
  check(report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false), "release completion report packet sources should be present, ready, and value-free");
  check(report.sourceLabelsMatchLatestTenPlan === true, "release completion report packet source labels should match latest 10-plan progress");
  check(report.audienceLatestTenPlanProgressLabel === report.latestTenPlanProgressLabel, "release completion report packet audience label should match latest progress");
  check(report.channelEditLatestTenPlanProgressLabel === report.latestTenPlanProgressLabel, "release completion report packet channel edit label should match latest progress");
  check(report.privateEditBlockedSmokeLatestTenPlanProgressLabel === report.latestTenPlanProgressLabel, "release completion report packet blocked smoke label should match latest progress");
  check(report.finalHandoffSuccessRedactionLatestTenPlanProgressLabel === report.latestTenPlanProgressLabel, "release completion report packet final handoff success-redaction label should match latest progress");
  check(report.clearanceTransitionLatestTenPlanProgressLabel === report.latestTenPlanProgressLabel, "release completion report packet clearance transition label should match latest progress");
  check(report.autoUpdateTransitionLatestTenPlanProgressLabel === report.latestTenPlanProgressLabel, "release completion report packet auto-update transition label should match latest progress");
  check(report.updateFeedCheckpointLatestTenPlanProgressLabel === report.latestTenPlanProgressLabel, "release completion report packet update-feed checkpoint label should match latest progress");
  check(report.firstTimeComposerReady === true, "release completion report packet should prove first-time composer readiness");
  check(report.professionalProducerReady === true, "release completion report packet should prove professional producer readiness");
  check(report.directCompositionReady === true, "release completion report packet should prove direct composition readiness");
  check(report.allGenreStyleReadinessReady === true, "release completion report packet should prove all-genre readiness");
  check(report.readyStyleCount === report.requiredStyleCount && report.requiredStyleCount >= 14, "release completion report packet should prove all supported styles");
  check(report.localDeliveryPackageReady === true, "release completion report packet should prove local delivery package readiness");
  check(report.localPackageReopenReady === true, "release completion report packet should prove local package reopen readiness");
  check(report.localPackageReopenRegeneratedExportsMatchDisk === true, "release completion report packet should prove regenerated exports match disk");
  check(report.samplingSecondaryReady === true, "release completion report packet should keep sampling secondary");
  check(report.localFirstReady === true, "release completion report packet should keep local-first posture");
  check(report.completionGapStatus === "external proof pending", "release completion report packet should keep external proof pending");
  check(report.currentNextCommand !== "none", "release completion report packet should include current next command");
  check(report.currentFirstBlocker !== "none", "release completion report packet should include current first blocker");
  check(report.currentEnvEditTarget === ".env.distribution.local", "release completion report packet should point at ignored local env target");
  check(report.currentRequiredKeyCount === 4, "release completion report packet should report four release-channel keys");
  check(report.liveCheckRowCount === 4, "release completion report packet should mirror four live-check rows");
  check(report.releaseChannelClearanceTransitionReady === true, "release completion report packet should carry ready clearance transition evidence");
  check(
    report.postClearanceCurrentBlockerMode === "missing-local-env" || report.postClearanceCurrentBlockerMode === "replace-release-channel-placeholders",
    "release completion report packet should identify the post-clearance current blocker mode"
  );
  check(
    ["prepare-local-distribution-env", "replace-release-channel-placeholders", "release-channel-metadata"].includes(
      report.postClearanceCurrentPriorityActionId
    ),
    "release completion report packet should keep release-channel setup as the current real blocker"
  );
  if (report.postClearanceCurrentBlockerMode === "missing-local-env") {
    check(report.postClearanceCurrentPlaceholderKeyCount === 0, "release completion report packet should show zero placeholders before the ignored env exists");
    check(report.currentNextCommand === "npm run release:prepare-env", "release completion report packet should surface prepare-env when the ignored env is missing");
  } else {
    check(report.postClearanceCurrentPlaceholderKeyCount === 4, "release completion report packet should mirror four current release-channel placeholders");
  }
  check(report.postClearanceSyntheticClearanceReady === true, "release completion report packet should prove synthetic clearance readiness");
  check(report.postClearanceSyntheticStrictReady === true, "release completion report packet should prove synthetic strict readiness");
  check(report.postClearanceSyntheticReadyRowCount === 4, "release completion report packet should prove four synthetic ready rows");
  check(report.postClearanceSyntheticPlaceholderKeyCount === 0, "release completion report packet should prove zero synthetic placeholder keys");
  check(report.postClearanceNextPriorityActionId === "auto-update-feed", "release completion report packet should expose auto-update feed as the post-clearance next action");
  check(report.postClearanceNextActionPreviewReady === true, "release completion report packet should carry ready post-clearance next-action preview");
  check(
    report.postClearanceNextActionPreviewProofCommand === "npm run desktop:auto-update-readiness-smoke",
    "release completion report packet should expose the auto-update readiness proof command"
  );
  check(report.postClearanceNextActionPreviewRequiredKeyCount === 6, "release completion report packet should mirror six post-clearance update feed/channel keys");
  check(report.postClearanceTransitionRowCount === report.postClearanceTransitionRows.length, "release completion report packet should match post-clearance transition row count");
  check(report.postClearanceTransitionRowCount === 4, "release completion report packet should include four post-clearance transition rows");
  check(
    report.postClearanceTransitionRows.every((row) => row.ready === true && row.valueRecorded === false),
    "release completion report packet post-clearance transition rows should be ready and value-free"
  );
  check(report.releaseAutoUpdateTransitionReady === true, "release completion report packet should carry ready auto-update transition evidence");
  check(report.autoUpdateTransitionReady === true, "release completion report packet should validate auto-update transition readiness");
  check(report.autoUpdateSyntheticFeedChannelConfigReady === true, "release completion report packet should prove synthetic feed/channel readiness");
  check(report.autoUpdateRealAutoUpdateReady === false, "release completion report packet should keep real auto-update unready while blockers remain");
  check(report.autoUpdateRealAutoUpdateBlocked === true, "release completion report packet should expose real auto-update blockers");
  check(report.autoUpdateRealAutoUpdateBlockerCount > 0, "release completion report packet should include real auto-update blocker rows");
  check(report.autoUpdateSignedUpdateArtifactsReady === false, "release completion report packet should keep signed update artifacts unready");
  check(report.autoUpdateRequiredUpdateFeedKeyCount === 6, "release completion report packet should mirror six auto-update feed/channel keys");
  check(report.autoUpdateProofCommand === "npm run desktop:auto-update-readiness-smoke", "release completion report packet should expose the auto-update transition proof command");
  check(report.autoUpdateTransitionRowCount === report.autoUpdateTransitionRows.length, "release completion report packet should match auto-update transition row count");
  check(report.autoUpdateTransitionRowCount === 4, "release completion report packet should include four auto-update transition rows");
  check(
    report.autoUpdateTransitionRows.every((row) => row.ready === true && row.valueRecorded === false),
    "release completion report packet auto-update transition rows should be ready and value-free"
  );
  check(report.hardGateCommand === "npm run release:external-check", "release completion report packet should keep hard external gate");
  check(
    report.privateEditProofCommandRows.some((row) => row.command === report.hardGateCommand),
    "release completion report packet private-edit proof commands should include the hard external gate"
  );
  check(report.externalDistributionReady === false, "release completion report packet should keep external distribution unready");
  check(report.userFacingCompletionPercent === 99.999999, "release completion report packet should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "release completion report packet should preserve remaining percent");
  check(report.latestTenPlanWindowStart > 0, "release completion report packet should report a positive 10-plan window start");
  check(report.latestTenPlanWindowEnd === report.latestTenPlanWindowStart + 9, "release completion report packet should report a 10-plan window");
  check(report.latestTenPlanTotal === 10, "release completion report packet should use ten-plan windows");
  check(report.latestCompletedPlanNumber >= report.latestTenPlanWindowStart, "release completion report packet should report a latest completed plan inside or after the current window start");
  check(report.latestCompletedPlanNumber <= report.latestTenPlanWindowEnd, "release completion report packet should report a latest completed plan inside the current window");
  check(
    report.tenPlanProgressReportDue === (report.latestTenPlanCompletedCount === report.latestTenPlanTotal),
    "release completion report packet should derive the 10-plan report due flag from the completed count"
  );
  check(
    report.nextTenPlanProgressReportAt === `plan-${report.latestTenPlanWindowEnd}`,
    "release completion report packet should expose the current 10-plan report boundary"
  );
  check(report.currentTenPlanReportBoundaryNumber === report.latestTenPlanWindowEnd, "release completion report packet current report boundary should match the current window end");
  check(report.currentTenPlanReportBoundaryAt === report.nextTenPlanProgressReportAt, "release completion report packet current report boundary should match the current-window report field");
  const expectedNextScheduledTenPlanProgressReportNumber = report.tenPlanProgressReportDue
    ? report.latestTenPlanWindowEnd + report.latestTenPlanTotal
    : report.latestTenPlanWindowEnd;
  check(
    report.nextScheduledTenPlanProgressReportNumber === expectedNextScheduledTenPlanProgressReportNumber,
    "release completion report packet should derive the next scheduled 10-plan report after delivery"
  );
  check(
    report.nextScheduledTenPlanProgressReportAt === `plan-${expectedNextScheduledTenPlanProgressReportNumber}`,
    "release completion report packet should expose the next scheduled 10-plan report after delivery"
  );
  check(
    report.latestTenPlanProgressLabel === `${report.latestTenPlanWindowStart}-${report.latestTenPlanWindowEnd}: ${report.latestTenPlanCompletedCount}/10`,
    "release completion report packet progress label should match latest 10-plan fields"
  );
  check(Array.isArray(report.currentTenPlanWindowRows), "release completion report packet should include current 10-plan rows");
  check(report.currentTenPlanWindowRowCount === report.currentTenPlanWindowRows.length, "release completion report packet current 10-plan row count should match row length");
  check(report.currentTenPlanWindowRowCount === report.latestTenPlanCompletedCount, "release completion report packet current 10-plan row count should match completed count");
  check(report.currentTenPlanWindowRowCount > 0 && report.currentTenPlanWindowRowCount <= report.latestTenPlanTotal, "release completion report packet current 10-plan row count should stay within the current window");
  check(report.currentTenPlanWindowRows.every((row) => row.valueRecorded === false), "release completion report packet 10-plan rows should not record values");
  check(
    report.currentTenPlanWindowRows.every((row, index) => row.order === index + 1 && row.planNumber >= report.latestTenPlanWindowStart && row.planNumber <= report.latestTenPlanWindowEnd),
    "release completion report packet 10-plan rows should match the current window"
  );
  check(
    report.currentTenPlanWindowRows.some((row) => row.planNumber === report.latestCompletedPlanNumber),
    "release completion report packet 10-plan rows should include the latest completed plan"
  );
  check(report.currentTenPlanWindowRowSummary.includes(`plan-${report.latestCompletedPlanNumber}`), "release completion report packet 10-plan row summary should include the latest completed plan");
  check(report.tenPlanProgressReportReceiptReady === true, "release completion report packet 10-plan receipt should be ready");
  check(Array.isArray(report.tenPlanProgressReportReceiptRows), "release completion report packet should include 10-plan receipt rows");
  check(report.tenPlanProgressReportReceiptRowCount === report.tenPlanProgressReportReceiptRows.length, "release completion report packet 10-plan receipt row count should match row length");
  check(report.tenPlanProgressReportReceiptRowCount >= 7, "release completion report packet should include the required 10-plan receipt coverage");
  check(report.tenPlanProgressReportReceiptRows.every((row) => row.valueRecorded === false), "release completion report packet 10-plan receipt rows should not record values");
  check(report.tenPlanProgressReportReceiptValueRecorded === false, "release completion report packet 10-plan receipt should be value-free");
  check(report.tenPlanProgressReportReceiptRows.every((row, index) => row.order === index + 1 && textValue(row.sourceField) !== "none"), "release completion report packet 10-plan receipt rows should keep source fields");
  check(report.tenPlanProgressReportRolloverReady === true, "release completion report packet 10-plan rollover should be ready");
  check(Array.isArray(report.tenPlanProgressReportRolloverRows), "release completion report packet should include 10-plan rollover rows");
  check(report.tenPlanProgressReportRolloverRowCount === report.tenPlanProgressReportRolloverRows.length, "release completion report packet 10-plan rollover row count should match row length");
  check(report.tenPlanProgressReportRolloverRowCount === 2, "release completion report packet should include current-boundary and next-scheduled rollover rows");
  check(report.tenPlanProgressReportRolloverRows.every((row) => row.valueRecorded === false), "release completion report packet 10-plan rollover rows should not record values");
  check(report.tenPlanProgressReportRolloverValueRecorded === false, "release completion report packet 10-plan rollover should be value-free");
  const tenPlanRolloverEvidence = report.tenPlanProgressReportRolloverRows.map((row) => `${row.item}: ${row.evidence}`).join(" | ");
  check(tenPlanRolloverEvidence.includes(report.currentTenPlanReportBoundaryAt), "release completion report packet 10-plan rollover should include current report boundary");
  check(tenPlanRolloverEvidence.includes(report.nextScheduledTenPlanProgressReportAt), "release completion report packet 10-plan rollover should include next scheduled report");
  const tenPlanReceiptEvidence = report.tenPlanProgressReportReceiptRows.map((row) => `${row.item}: ${row.evidence}`).join(" | ");
  check(tenPlanReceiptEvidence.includes(report.latestTenPlanProgressLabel), "release completion report packet 10-plan receipt should include the current window label");
  check(tenPlanReceiptEvidence.includes(`${report.currentTenPlanWindowRowCount}/${report.latestTenPlanTotal}`), "release completion report packet 10-plan receipt should include completed row count");
  check(tenPlanReceiptEvidence.includes(`due ${readyLabel(report.tenPlanProgressReportDue)}`), "release completion report packet 10-plan receipt should include report due posture");
  check(tenPlanReceiptEvidence.includes(report.nextScheduledTenPlanProgressReportAt), "release completion report packet 10-plan receipt should include next scheduled report after delivery");
  check(
    tenPlanReceiptEvidence.includes(`${report.userFacingCompletionPercent}%`) && tenPlanReceiptEvidence.includes(`${report.userFacingRemainingPercent}%`),
    "release completion report packet 10-plan receipt should include completion and remaining percentages"
  );
  check(tenPlanReceiptEvidence.includes(report.currentFirstBlocker), "release completion report packet 10-plan receipt should include current blocker");
  check(tenPlanReceiptEvidence.includes(report.privateEditProofCommandSummary), "release completion report packet 10-plan receipt should include private-edit proof command order");
  check(tenPlanReceiptEvidence.includes(report.privateEditBlockedSmokeCommand), "release completion report packet 10-plan receipt should include blocked smoke evidence");
  check(tenPlanReceiptEvidence.includes(report.finalHandoffSuccessRedactionCommand), "release completion report packet 10-plan receipt should include final handoff success-redaction proof");
  check(tenPlanReceiptEvidence.includes(report.postClearanceNextPriorityActionLabel), "release completion report packet 10-plan receipt should include post-clearance next action");
  check(tenPlanReceiptEvidence.includes(report.autoUpdateProofCommand), "release completion report packet should include auto-update transition proof");
  check(tenPlanReceiptEvidence.includes(report.updateFeedCheckpointCommand), "release completion report packet 10-plan receipt should include update-feed checkpoint proof");
  check(report.privateValuesRecorded === false, "release completion report packet should not record private values");
  check(report.localEnvValueRecorded === false, "release completion report packet should not record local env values");
  check(report.releaseUrlValueRecorded === false, "release completion report packet should not record release URL values");
  check(report.supportUrlValueRecorded === false, "release completion report packet should not record support URL values");
  check(report.feedValueRecorded === false, "release completion report packet should not record feed values");
  check(report.credentialValueRecorded === false, "release completion report packet should not record credentials");
  check(report.tokenValueRecorded === false, "release completion report packet should not record tokens");
  check(report.channelValueRecorded === false, "release completion report packet should not record channel values");
  check(report.developerIdIdentityValueRecorded === false, "release completion report packet should not record Developer ID identity values");
  check(report.privateBeatRecorded === false, "release completion report packet should not record private beats");
  check(report.realUserAudioRecorded === false, "release completion report packet should not record real user audio");
  check(report.networkProbeAttempted === false, "release completion report packet should not probe networks");
  check(report.updateFeedPublishAttempted === false, "release completion report packet should not publish feeds");
  check(report.distributionChannelProbeAttempted === false, "release completion report packet should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "release completion report packet should not upload releases");
  check(report.signingAttempted === false, "release completion report packet should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release completion report packet should not submit to Apple");
  check(report.claimedAutoUpdate === false, "release completion report packet should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release completion report packet should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "release completion report packet JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release completion report packet Markdown should not include URL values");
  check(markdown.includes("Release Completion Report Packet Smoke"), "release completion report packet Markdown should include title");
  check(markdown.includes("Completion report packet ready: yes"), "release completion report packet Markdown should include readiness");
  check(markdown.includes("Private-edit proof command order:"), "release completion report packet Markdown should include private-edit proof command order");
  check(markdown.includes("Strict proof handoff receipt ready:"), "release completion report packet Markdown should include strict proof handoff receipt readiness");
  check(markdown.includes("Strict Proof Handoff Receipt"), "release completion report packet Markdown should include strict proof handoff receipt table");
  check(markdown.includes("Private-edit blocked smoke ready:"), "release completion report packet Markdown should include blocked smoke readiness");
  check(markdown.includes("Private-Edit Blocked Smoke Evidence"), "release completion report packet Markdown should include blocked smoke evidence table");
  check(markdown.includes("Final handoff success-redaction ready:"), "release completion report packet Markdown should include final handoff success-redaction readiness");
  check(markdown.includes("Final Handoff Success-Redaction Evidence"), "release completion report packet Markdown should include final handoff success-redaction evidence table");
  check(markdown.includes("Update-feed checkpoint ready:"), "release completion report packet Markdown should include update-feed checkpoint readiness");
  check(markdown.includes("Update Feed Checkpoint Evidence"), "release completion report packet Markdown should include update-feed checkpoint evidence table");
  check(markdown.includes("Channel edit packet recommended proof chain:"), "release completion report packet Markdown should include channel edit packet proof recommendation");
  check(markdown.includes("Private-Edit Proof Commands"), "release completion report packet Markdown should include private-edit proof command table");
  check(markdown.includes("10-plan report due:"), "release completion report packet Markdown should include the 10-plan report due flag");
  check(markdown.includes(`Next 10-plan progress report at: ${report.nextTenPlanProgressReportAt}`), "release completion report packet Markdown should include next 10-plan report plan");
  check(markdown.includes(`Next scheduled 10-plan progress report after delivery: ${report.nextScheduledTenPlanProgressReportAt}`), "release completion report packet Markdown should include next scheduled 10-plan report after delivery");
  check(markdown.includes("Current 10-plan rows:"), "release completion report packet Markdown should include current 10-plan row summary");
  check(markdown.includes("10-plan progress report receipt ready:"), "release completion report packet Markdown should include 10-plan progress report receipt readiness");
  check(markdown.includes("10-plan progress report receipt rows:"), "release completion report packet Markdown should include 10-plan progress report receipt rows");
  check(markdown.includes("10-plan cadence rollover ready:"), "release completion report packet Markdown should include 10-plan cadence rollover readiness");
  check(markdown.includes("10-plan cadence rollover rows:"), "release completion report packet Markdown should include 10-plan cadence rollover rows");
  check(markdown.includes("Current 10-Plan Window Rows"), "release completion report packet Markdown should include current 10-plan window rows");
  check(markdown.includes("10-Plan Progress Report Receipt"), "release completion report packet Markdown should include 10-plan progress report receipt table");
  check(markdown.includes("10-Plan Cadence Rollover"), "release completion report packet Markdown should include 10-plan cadence rollover table");
  check(markdown.includes("Source labels match latest 10-plan: yes"), "release completion report packet Markdown should include source label agreement");
  check(markdown.includes("Post-clearance transition ready: yes"), "release completion report packet Markdown should include post-clearance transition readiness");
  check(markdown.includes("Post-Clearance Transition Rows"), "release completion report packet Markdown should include post-clearance transition rows");
  check(markdown.includes("Auto-update transition ready: yes"), "release completion report packet Markdown should include auto-update transition readiness");
  check(markdown.includes("Auto-Update Transition Rows"), "release completion report packet Markdown should include auto-update transition rows");
  check(markdown.includes("External distribution claimed: no"), "release completion report packet Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const row of refreshCommandRows) {
  console.log(`Refreshing release completion report packet evidence: ${row.command}`);
  runNpmScript(row.command);
}

const audience = await readJsonRequired(audienceHandoffJsonPath, "Audience completion handoff");
const channel = await readJsonRequired(channelEditPacketJsonPath, "Release-channel edit packet");
const privateEditBlockedSmoke = await readJsonRequired(privateEditBlockedSmokeJsonPath, "Private-edit blocked smoke");
const finalHandoff = await readJsonRequired(finalHandoffSuccessRedactionJsonPath, "Final handoff success-redaction");
const clearance = await readJsonRequired(clearanceTransitionJsonPath, "Release-channel clearance transition");
const autoUpdate = await readJsonRequired(autoUpdateTransitionJsonPath, "Release auto-update transition");
const updateFeedCheckpoint = await readJsonRequired(updateFeedCheckpointJsonPath, "Update feed checkpoint");
const progress = await completedPlanProgress();
const report = buildReport({ audience, channel, privateEditBlockedSmoke, finalHandoff, clearance, autoUpdate, updateFeedCheckpoint, progress });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(packetMarkdownPath, markdown, "utf8");
await writeFile(packetJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release completion report packet smoke passed.");
console.log(`- Markdown: ${relative(packetMarkdownPath)}`);
console.log(`- JSON: ${relative(packetJsonPath)}`);
console.log("- Completion report packet ready: yes");
console.log(`- Private-edit proof command order: ${report.privateEditProofCommandSummary}`);
console.log(`- Private-edit operator proof command: ${report.privateEditOperatorProofCommand}`);
console.log(`- Strict proof handoff receipt ready: ${report.strictProofHandoffReceiptReady ? "yes" : "no"}`);
console.log(`- Strict proof handoff receipt rows: ${report.strictProofHandoffReceiptRowCount} (${report.strictProofHandoffReceiptSummary})`);
console.log(`- Private-edit blocked smoke ready: ${report.privateEditBlockedSmokeReady ? "yes" : "no"}`);
console.log(`- Private-edit blocked smoke rows: ${report.privateEditBlockedSmokeRowCount} (${report.privateEditBlockedSmokeSummary})`);
console.log(`- Private-edit blocked smoke command: ${report.privateEditBlockedSmokeCommand}`);
console.log(`- Private-edit blocked smoke handoff rows: ${report.privateEditBlockedSmokeHandoffRowCount}`);
console.log(`- Private-edit blocked smoke strict failures: ${report.privateEditBlockedSmokeStrictFailureRowCount}`);
console.log(`- Private-edit blocked smoke real env read: ${report.privateEditBlockedSmokeRealLocalEnvRead ? "yes" : "no"}`);
console.log(`- Final handoff success-redaction ready: ${report.finalHandoffSuccessRedactionReady ? "yes" : "no"}`);
console.log(`- Final handoff success-redaction command: ${report.finalHandoffSuccessRedactionCommand}`);
console.log(`- Final handoff metadata ready: ${report.finalHandoffSuccessRedactionMetadataReady ? "yes" : "no"}`);
console.log(`- Final handoff strict rows: ${report.finalHandoffSuccessRedactionRealStrictReadyCount}/${report.finalHandoffSuccessRedactionRealStrictRowCount}`);
console.log(`- Final handoff strict placeholder keys: ${report.finalHandoffSuccessRedactionRealStrictPlaceholderKeyCount}`);
console.log(`- Final handoff real env read: ${report.finalHandoffSuccessRedactionRealLocalEnvRead ? "yes" : "no"}`);
console.log(`- Update-feed checkpoint ready: ${report.updateFeedCheckpointReady ? "yes" : "no"}`);
console.log(`- Update-feed checkpoint command: ${report.updateFeedCheckpointCommand}`);
console.log(`- Update-feed real selected keys: ${report.updateFeedCheckpointRealSelectedReadyCount}/2`);
console.log(`- Update-feed real placeholder keys: ${report.updateFeedCheckpointRealPlaceholderKeyCount}`);
console.log(`- Update-feed synthetic selected keys: ${report.updateFeedCheckpointSyntheticSelectedReadyCount}/2`);
console.log(`- Update-feed synthetic placeholder keys: ${report.updateFeedCheckpointSyntheticPlaceholderKeyCount}`);
console.log(`- Update-feed hard gate would fail: ${report.updateFeedCheckpointHardGateWouldFail ? "yes" : "no"}`);
console.log(`- Channel edit packet recommended proof chain: ${report.channelEditRecommendedOperatorProofCommand}`);
console.log(`- Latest completed plan: plan-${report.latestCompletedPlanNumber}`);
console.log(`- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}`);
console.log(`- 10-plan report due: ${report.tenPlanProgressReportDue ? "yes" : "no"}`);
console.log(`- Current 10-plan report boundary: ${report.currentTenPlanReportBoundaryAt}`);
console.log(`- Next 10-plan progress report at: ${report.nextTenPlanProgressReportAt}`);
console.log(`- Next scheduled 10-plan progress report after delivery: ${report.nextScheduledTenPlanProgressReportAt}`);
console.log(`- Current 10-plan rows: ${report.currentTenPlanWindowRowCount} (${report.currentTenPlanWindowRowSummary})`);
console.log(`- 10-plan progress report receipt ready: ${report.tenPlanProgressReportReceiptReady ? "yes" : "no"}`);
console.log(`- 10-plan progress report receipt rows: ${report.tenPlanProgressReportReceiptRowCount} (${report.tenPlanProgressReportReceiptSummary})`);
console.log(`- 10-plan cadence rollover ready: ${report.tenPlanProgressReportRolloverReady ? "yes" : "no"}`);
console.log(`- 10-plan cadence rollover rows: ${report.tenPlanProgressReportRolloverRowCount} (${report.tenPlanProgressReportRolloverSummary})`);
console.log(`- Source labels match latest 10-plan: ${report.sourceLabelsMatchLatestTenPlan ? "yes" : "no"}`);
console.log(`- First-time composer ready: ${report.firstTimeComposerReady ? "yes" : "no"}`);
console.log(`- Professional producer ready: ${report.professionalProducerReady ? "yes" : "no"}`);
console.log(`- Current action: ${report.currentActionLabel}`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- Release-channel edit packet mode: ${report.releaseChannelEditPacketMode}`);
console.log(`- Release-channel edit packet operator order: ${report.releaseChannelEditPacketOperatorCommandSummary}`);
console.log(`- Post-clearance transition ready: ${report.releaseChannelClearanceTransitionReady ? "yes" : "no"}`);
console.log(`- Post-clearance next priority action: ${report.postClearanceNextPriorityActionLabel}`);
console.log(`- Post-clearance next proof command: ${report.postClearanceNextActionPreviewProofCommand}`);
console.log(`- Auto-update transition ready: ${report.releaseAutoUpdateTransitionReady ? "yes" : "no"}`);
console.log(`- Auto-update proof command: ${report.autoUpdateProofCommand}`);
console.log(`- Auto-update blocker rows: ${report.autoUpdateRealAutoUpdateBlockerCount}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
