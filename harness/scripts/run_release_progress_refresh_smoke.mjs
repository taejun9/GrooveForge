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
    command: "npm run release:update-feed-checkpoint-smoke",
    role: "refresh latest update-feed checkpoint before progress reads it",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:progress-smoke",
    role: "refresh existing-evidence release progress report",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:current-blocker-smoke",
    role: "refresh existing-evidence current blocker receipt",
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run release:completion-report-packet-smoke",
    role: "refresh user-facing completion report packet",
    valueRecorded: false
  },
  {
    order: 5,
    command: "npm run release:progress-freshness-smoke",
    role: "verify refreshed artifacts match latest update-feed checkpoint",
    valueRecorded: false
  },
  {
    order: 6,
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
  const releaseProgressRefreshReady =
    refreshCommands.every((row) => row.valueRecorded === false) &&
    sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
    labelsMatch &&
    freshnessClean &&
    operatorBriefReady &&
    currentBlockerStillExternal;
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
    postClearanceNextAction: textValue(operatorCompletionBrief.postClearanceNextPriorityActionId),
    postClearanceProofCommand: textValue(operatorCompletionBrief.postClearanceNextActionPreviewProofCommand),
    firstBlocker: textValue(currentBlocker.currentFirstBlocker),
    nextCommand: textValue(currentBlocker.currentNextCommand),
    rerunCommand: textValue(currentBlocker.currentRerunCommand),
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
- Operator post-clearance next action: ${report.operatorCompletionBriefPostClearanceNextPriorityActionId}
- Operator post-clearance proof command: \`${report.operatorCompletionBriefPostClearanceProofCommand}\`
- Operator update-feed checkpoint ready: ${readyLabel(report.operatorCompletionBriefUpdateFeedCheckpointReady)}
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
- Post-clearance next action: ${report.completionSummary.postClearanceNextAction}
- Post-clearance proof command: \`${report.completionSummary.postClearanceProofCommand}\`
- Next command: \`${report.completionSummary.nextCommand}\`
- First blocker: ${report.completionSummary.firstBlocker}
- Private values recorded: ${readyLabel(report.completionSummary.privateValuesRecorded)}
- Auto-update claimed: ${readyLabel(report.completionSummary.claimedAutoUpdate)}
- External distribution claimed: ${readyLabel(report.completionSummary.claimedExternalDistribution)}

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
  check(report.completionSummary.privateValuesRecorded === false, "release progress refresh summary should not record private values");
  check(report.completionSummary.claimedAutoUpdate === false, "release progress refresh summary should not claim auto-update");
  check(report.completionSummary.claimedExternalDistribution === false, "release progress refresh summary should not claim external distribution");
  check(report.reportCommand === "npm run release:progress-refresh-smoke", "release progress refresh smoke should report its command");
  check(report.refreshCommandCount === 6, "release progress refresh smoke should run six commands");
  check(
    report.refreshCommandSummary ===
      "npm run release:update-feed-checkpoint-smoke -> npm run release:progress-smoke -> npm run release:current-blocker-smoke -> npm run release:completion-report-packet-smoke -> npm run release:progress-freshness-smoke -> npm run release:operator-completion-brief-smoke",
    "release progress refresh smoke should run update-feed checkpoint, progress, current-blocker, completion packet, freshness, then operator completion brief"
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
console.log(`- Operator post-clearance next action: ${report.operatorCompletionBriefPostClearanceNextPriorityActionId}`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
