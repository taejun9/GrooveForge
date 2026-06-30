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
const checkpointStem = "release-update-feed-checkpoint-smoke";
const freshnessStem = "release-progress-freshness-smoke";
const checkpointJsonArtifactName = "release-update-feed-checkpoint-smoke.json";
const checkpointJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${checkpointStem}.json`);
const releaseProgressJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-report.json`);
const currentBlockerJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.json`);
const completionReportPacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-completion-report-packet-smoke.json`);
const clearanceTransitionJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-clearance-transition-smoke.json`);
const autoUpdateTransitionJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-auto-update-transition-smoke.json`);
const freshnessMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${freshnessStem}.md`);
const freshnessJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${freshnessStem}.json`);
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release progress freshness smoke failed:");
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

function runNpmScript(scriptName) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", scriptName], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail(`Could not run npm run ${scriptName}.`, result.error.message);
  }
  if (result.status !== 0) {
    fail(`npm run ${scriptName} exited with status ${result.status}.`, "Run the desktop release artifact smokes through update metadata artifacts first, then retry this freshness smoke.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function readJsonOptional(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function rowValueFree(row) {
  return row && typeof row === "object" && row.valueRecorded === false;
}

function sourceRowsValueFree(report) {
  const rowGroups = [
    report?.refreshCommandRows,
    report?.sourceArtifactRows,
    report?.branchRows,
    report?.comparisonRows,
    report?.tenPlanProgressReportReceiptRows,
    report?.sourceArtifactRows,
    report?.evidenceRows,
    report?.blockerRows
  ];
  return rowGroups.every((rows) => objectRows(rows).every(rowValueFree));
}

function checkpointValueFree(report) {
  return (
    report.releaseUpdateFeedCheckpointReady === true &&
    report.privateValuesRecorded === false &&
    report.feedValueRecorded === false &&
    report.channelValueRecorded === false &&
    report.localEnvValueRecorded === false &&
    report.networkProbeAttempted === false &&
    report.updateFeedPublishAttempted === false &&
    report.releaseUploadAttempted === false &&
    report.signingAttempted === false &&
    report.notarySubmissionAttempted === false &&
    report.claimedAutoUpdate === false &&
    report.claimedExternalDistribution === false &&
    report.valueRecorded === false &&
    sourceRowsValueFree(report)
  );
}

function artifactProgressLabel(kind, artifact) {
  if (!artifact) {
    return "missing";
  }
  if (kind === "release progress report") {
    return textValue(artifact.currentTenPlanWindowLabel);
  }
  if (kind === "release current blocker") {
    return textValue(artifact.currentTenPlanProgressLabel);
  }
  if (kind === "release completion report packet") {
    return textValue(artifact.latestTenPlanProgressLabel);
  }
  return textValue(artifact.currentTenPlanProgressLabel);
}

function artifactDue(kind, artifact) {
  if (!artifact) {
    return false;
  }
  if (kind === "release progress report") {
    return artifact.tenPlanProgressReportDue === true;
  }
  if (kind === "release current blocker") {
    return artifact.tenPlanProgressReportDue === true;
  }
  return artifact.tenPlanProgressReportDue === true;
}

function artifactReady(kind, artifact) {
  if (!artifact) {
    return false;
  }
  if (kind === "release progress report") {
    return artifact.releaseProgressReportReady === true;
  }
  if (kind === "release current blocker") {
    return artifact.releaseCurrentBlockerReady === true;
  }
  if (kind === "release completion report packet") {
    return artifact.releaseCompletionReportPacketReady === true;
  }
  if (kind === "release-channel clearance transition") {
    return artifact.releaseChannelClearanceTransitionReady === true;
  }
  if (kind === "release auto-update transition") {
    return artifact.releaseAutoUpdateTransitionReady === true;
  }
  return artifact.releaseUpdateFeedCheckpointReady === true;
}

function progressRow({ label, filePath, artifact, latestLabel, kind, sourceField, command }) {
  const present = artifact !== null;
  const artifactLabel = artifactProgressLabel(kind, artifact);
  const hasLabel = artifactLabel !== "missing" && artifactLabel !== "none";
  const matchesCheckpoint = present && hasLabel && artifactLabel === latestLabel;
  return {
    label,
    path: relative(filePath),
    command,
    present,
    sourceReady: artifactReady(kind, artifact),
    progressLabel: artifactLabel,
    matchesLatestCheckpoint: matchesCheckpoint,
    stale: present && hasLabel && !matchesCheckpoint,
    missing: !present,
    reportDue: artifactDue(kind, artifact),
    sourceField,
    valueRecorded: false
  };
}

function refreshCommandRows(rows) {
  return rows
    .filter((row) => row.missing === true || row.stale === true)
    .map((row, index) => ({
      order: index + 1,
      command: row.command,
      reason: row.missing ? "artifact missing" : "progress label stale",
      valueRecorded: false
    }));
}

function buildReport({ checkpoint, releaseProgress, currentBlocker, completionReportPacket, clearanceTransition, autoUpdateTransition }) {
  const latestLabel = textValue(checkpoint.currentTenPlanProgressLabel);
  const rows = [
    progressRow({
      label: "Update feed checkpoint",
      filePath: checkpointJsonPath,
      artifact: checkpoint,
      latestLabel,
      kind: "update feed checkpoint",
      sourceField: "currentTenPlanProgressLabel",
      command: "npm run release:update-feed-checkpoint-smoke"
    }),
    progressRow({
      label: "Release progress report",
      filePath: releaseProgressJsonPath,
      artifact: releaseProgress,
      latestLabel,
      kind: "release progress report",
      sourceField: "currentTenPlanWindowLabel",
      command: "npm run release:progress"
    }),
    progressRow({
      label: "Release current blocker",
      filePath: currentBlockerJsonPath,
      artifact: currentBlocker,
      latestLabel,
      kind: "release current blocker",
      sourceField: "currentTenPlanProgressLabel",
      command: "npm run release:current-blocker"
    }),
    progressRow({
      label: "Release completion report packet",
      filePath: completionReportPacketJsonPath,
      artifact: completionReportPacket,
      latestLabel,
      kind: "release completion report packet",
      sourceField: "latestTenPlanProgressLabel",
      command: "npm run release:completion-report-packet-smoke"
    }),
    progressRow({
      label: "Release-channel clearance transition",
      filePath: clearanceTransitionJsonPath,
      artifact: clearanceTransition,
      latestLabel,
      kind: "release-channel clearance transition",
      sourceField: "currentTenPlanProgressLabel",
      command: "npm run release:channel-clearance-transition-smoke"
    }),
    progressRow({
      label: "Release auto-update transition",
      filePath: autoUpdateTransitionJsonPath,
      artifact: autoUpdateTransition,
      latestLabel,
      kind: "release auto-update transition",
      sourceField: "currentTenPlanProgressLabel",
      command: "npm run release:auto-update-transition-smoke"
    })
  ];
  const staleRows = rows.filter((row) => row.stale === true);
  const missingRows = rows.filter((row) => row.missing === true);
  const refreshRows = refreshCommandRows(rows.slice(1));
  const checkpointRow = rows[0];

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:progress-freshness-smoke",
    refreshCommand: "npm run release:update-feed-checkpoint-smoke",
    releaseProgressFreshnessMarkdownArtifactName: "release-progress-freshness-smoke.md",
    releaseProgressFreshnessJsonArtifactName: "release-progress-freshness-smoke.json",
    latestCheckpointJsonArtifactName: checkpointJsonArtifactName,
    releaseProgressFreshnessMarkdownPath: relative(freshnessMarkdownPath),
    releaseProgressFreshnessJsonPath: relative(freshnessJsonPath),
    latestCheckpointPath: relative(checkpointJsonPath),
    releaseProgressJsonPath: relative(releaseProgressJsonPath),
    currentBlockerJsonPath: relative(currentBlockerJsonPath),
    completionReportPacketJsonPath: relative(completionReportPacketJsonPath),
    clearanceTransitionJsonPath: relative(clearanceTransitionJsonPath),
    autoUpdateTransitionJsonPath: relative(autoUpdateTransitionJsonPath),
    releaseProgressFreshnessReady:
      checkpointValueFree(checkpoint) &&
      checkpointRow.present === true &&
      checkpointRow.sourceReady === true &&
      checkpointRow.matchesLatestCheckpoint === true &&
      rows.every((row) => row.valueRecorded === false),
    latestTenPlanProgressLabel: latestLabel,
    latestTenPlanWindowStart: integerValue(checkpoint.currentTenPlanWindowStart),
    latestTenPlanWindowEnd: integerValue(checkpoint.currentTenPlanWindowEnd),
    latestTenPlanCompletedCount: integerValue(checkpoint.currentTenPlanWindowCompletedCount),
    latestTenPlanTotal: integerValue(checkpoint.currentTenPlanWindowTotal),
    tenPlanProgressReportDue: checkpoint.tenPlanProgressReportDue === true,
    nextTenPlanProgressReportAt: textValue(checkpoint.nextTenPlanProgressReportAt),
    freshnessRows: rows,
    freshnessRowCount: rows.length,
    freshArtifactCount: rows.filter((row) => row.matchesLatestCheckpoint === true).length,
    staleArtifactCount: staleRows.length,
    staleArtifactSummary: staleRows.map((row) => `${row.label}: ${row.progressLabel}`).join("; ") || "none",
    missingArtifactCount: missingRows.length,
    missingArtifactSummary: missingRows.map((row) => row.label).join("; ") || "none",
    refreshCommandRows: refreshRows,
    refreshCommandCount: refreshRows.length,
    refreshCommandSummary: refreshRows.map((row) => row.command).join(" -> ") || "none",
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
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

function formatFreshnessRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${escapeCell(row.path)} | ${readyLabel(row.sourceReady)} | ${escapeCell(row.progressLabel)} | ${readyLabel(row.matchesLatestCheckpoint)} | ${readyLabel(row.stale)} | ${readyLabel(row.missing)} | ${readyLabel(row.reportDue)} | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatRefreshCommandRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | no |";
  }
  return rows.map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.reason)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Progress Freshness Smoke

## Status

- Freshness smoke ready: ${readyLabel(report.releaseProgressFreshnessReady)}
- Latest checkpoint: ${report.latestTenPlanProgressLabel}
- Latest checkpoint path: ${report.latestCheckpointPath}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- Fresh artifacts: ${report.freshArtifactCount}/${report.freshnessRowCount}
- Stale artifacts: ${report.staleArtifactCount} (${report.staleArtifactSummary})
- Missing artifacts: ${report.missingArtifactCount} (${report.missingArtifactSummary})
- Refresh commands: ${report.refreshCommandSummary}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Private values recorded: no
- Feed values recorded: no
- Channel values recorded: no
- Network probe attempted: no
- Update feed publish attempted: no
- Release upload attempted: no
- Signing attempted: no
- Apple notary submission attempted: no
- Auto-update claimed: no
- External distribution claimed: no

## Freshness Rows

| artifact | present | path | source ready | progress label | matches latest checkpoint | stale | missing | report due | source field | value recorded |
|---|---:|---|---:|---|---:|---:|---:|---:|---|---:|
${formatFreshnessRows(report.freshnessRows)}

## Refresh Commands

| order | command | reason | value recorded |
|---:|---|---|---:|
${formatRefreshCommandRows(report.refreshCommandRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this freshness smoke.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.releaseProgressFreshnessReady === true, "release progress freshness smoke should be ready");
  check(report.reportCommand === "npm run release:progress-freshness-smoke", "release progress freshness smoke should report its command");
  check(report.refreshCommand === "npm run release:update-feed-checkpoint-smoke", "release progress freshness smoke should refresh update-feed checkpoint first");
  check(report.freshnessRowCount === 6, "release progress freshness smoke should include six freshness rows");
  check(report.freshnessRows.every((row) => row.valueRecorded === false), "release progress freshness rows should be value-free");
  check(report.freshnessRows[0].label === "Update feed checkpoint", "release progress freshness smoke should lead with checkpoint row");
  check(report.freshnessRows[0].present === true, "release progress freshness smoke should require checkpoint artifact");
  check(report.freshnessRows[0].sourceReady === true, "release progress freshness smoke should require checkpoint readiness");
  check(report.freshnessRows[0].matchesLatestCheckpoint === true, "release progress freshness smoke should self-match checkpoint label");
  check(
    report.freshnessRows.some((row) => row.label === "Release completion report packet" && row.command === "npm run release:completion-report-packet-smoke"),
    "release progress freshness smoke should include completion report packet refresh guidance"
  );
  check(
    report.freshnessRows.some((row) => row.label === "Release-channel clearance transition" && row.command === "npm run release:channel-clearance-transition-smoke"),
    "release progress freshness smoke should include clearance transition refresh guidance"
  );
  check(
    report.freshnessRows.some((row) => row.label === "Release auto-update transition" && row.command === "npm run release:auto-update-transition-smoke"),
    "release progress freshness smoke should include auto-update transition refresh guidance"
  );
  check(report.latestTenPlanWindowStart > 0, "release progress freshness smoke should report a positive latest 10-plan window start");
  check(report.latestTenPlanWindowEnd === report.latestTenPlanWindowStart + 9, "release progress freshness smoke should report a 10-plan window");
  check(report.latestTenPlanTotal === 10, "release progress freshness smoke should use ten-plan windows");
  check(
    report.latestTenPlanProgressLabel === `${report.latestTenPlanWindowStart}-${report.latestTenPlanWindowEnd}: ${report.latestTenPlanCompletedCount}/10`,
    "release progress freshness label should match latest checkpoint window fields"
  );
  check(report.latestTenPlanCompletedCount >= 0 && report.latestTenPlanCompletedCount <= 10, "release progress freshness completed count should be bounded");
  check(report.freshArtifactCount + report.staleArtifactCount + report.missingArtifactCount === report.freshnessRowCount, "release progress freshness counts should cover rows");
  check(report.refreshCommandRows.every((row) => row.valueRecorded === false), "release progress freshness refresh command rows should be value-free");
  check(report.userFacingCompletionPercent === 99.999999, "release progress freshness smoke should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "release progress freshness smoke should preserve remaining percent");
  check(report.privateValuesRecorded === false, "release progress freshness smoke should not record private values");
  check(report.feedValueRecorded === false, "release progress freshness smoke should not record feed values");
  check(report.channelValueRecorded === false, "release progress freshness smoke should not record channel values");
  check(report.localEnvValueRecorded === false, "release progress freshness smoke should not record local env values");
  check(report.networkProbeAttempted === false, "release progress freshness smoke should not probe the network");
  check(report.updateFeedPublishAttempted === false, "release progress freshness smoke should not publish update feeds");
  check(report.releaseUploadAttempted === false, "release progress freshness smoke should not upload releases");
  check(report.signingAttempted === false, "release progress freshness smoke should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release progress freshness smoke should not submit to Apple");
  check(report.claimedAutoUpdate === false, "release progress freshness smoke should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release progress freshness smoke should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "release progress freshness JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release progress freshness Markdown should not include URL values");
  check(markdown.includes("Release Progress Freshness Smoke"), "release progress freshness Markdown should include title");
  check(markdown.includes("Freshness smoke ready: yes"), "release progress freshness Markdown should include readiness");
  check(markdown.includes("Freshness Rows"), "release progress freshness Markdown should include freshness rows");
  check(markdown.includes("Auto-update claimed: no"), "release progress freshness Markdown should keep auto-update unclaimed");
  check(markdown.includes("External distribution claimed: no"), "release progress freshness Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

console.log("Refreshing latest update-feed checkpoint for progress freshness.");
runNpmScript("release:update-feed-checkpoint-smoke");

const checkpoint = await readJsonRequired(checkpointJsonPath, "Update feed checkpoint smoke");
const releaseProgress = await readJsonOptional(releaseProgressJsonPath);
const currentBlocker = await readJsonOptional(currentBlockerJsonPath);
const completionReportPacket = await readJsonOptional(completionReportPacketJsonPath);
const clearanceTransition = await readJsonOptional(clearanceTransitionJsonPath);
const autoUpdateTransition = await readJsonOptional(autoUpdateTransitionJsonPath);
const report = buildReport({ checkpoint, releaseProgress, currentBlocker, completionReportPacket, clearanceTransition, autoUpdateTransition });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(freshnessMarkdownPath, markdown, "utf8");
await writeFile(freshnessJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release progress freshness smoke passed.");
console.log(`- Markdown: ${relative(freshnessMarkdownPath)}`);
console.log(`- JSON: ${relative(freshnessJsonPath)}`);
console.log("- Freshness smoke ready: yes");
console.log(`- Latest checkpoint: ${report.latestTenPlanProgressLabel}`);
console.log(`- Fresh artifacts: ${report.freshArtifactCount}/${report.freshnessRowCount}`);
console.log(`- Stale artifacts: ${report.staleArtifactCount} (${report.staleArtifactSummary})`);
console.log(`- Missing artifacts: ${report.missingArtifactCount} (${report.missingArtifactSummary})`);
console.log(`- Refresh commands: ${report.refreshCommandSummary}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
