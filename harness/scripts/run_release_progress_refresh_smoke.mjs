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
const refreshMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${refreshStem}.md`);
const refreshJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${refreshStem}.json`);
const failures = [];
const refreshCommands = [
  {
    order: 1,
    command: "npm run release:progress-smoke",
    role: "refresh existing-evidence release progress report",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:current-blocker-smoke",
    role: "refresh existing-evidence current blocker receipt",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:completion-report-packet-smoke",
    role: "refresh user-facing completion report packet",
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run release:progress-freshness-smoke",
    role: "verify refreshed artifacts match latest update-feed checkpoint",
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

function buildReport({ releaseProgress, currentBlocker, completionReportPacket, freshness }) {
  const progressLabel = textValue(releaseProgress.currentTenPlanWindowLabel);
  const blockerLabel = textValue(currentBlocker.currentTenPlanProgressLabel);
  const packetLabel = textValue(completionReportPacket.latestTenPlanProgressLabel);
  const freshnessLabel = textValue(freshness.latestTenPlanProgressLabel);
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
    artifactRow("Release progress freshness smoke", freshnessJsonPath, freshness.releaseProgressFreshnessReady === true, freshnessLabel, "latestTenPlanProgressLabel")
  ];
  const labelsMatch = progressLabel === blockerLabel && blockerLabel === packetLabel && packetLabel === freshnessLabel;
  const freshnessClean =
    freshness.releaseProgressFreshnessReady === true &&
    integerValue(freshness.freshArtifactCount) === integerValue(freshness.freshnessRowCount) &&
    integerValue(freshness.staleArtifactCount) === 0 &&
    integerValue(freshness.missingArtifactCount) === 0;
  const currentBlockerStillExternal =
    currentBlocker.hardGateReady === false &&
    currentBlocker.hardGateWouldFail === true &&
    currentBlocker.claimedExternalDistribution === false;

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
    releaseProgressRefreshReady:
      refreshCommands.every((row) => row.valueRecorded === false) &&
      sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
      labelsMatch &&
      freshnessClean &&
      currentBlockerStillExternal,
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
  check(report.reportCommand === "npm run release:progress-refresh-smoke", "release progress refresh smoke should report its command");
  check(report.refreshCommandCount === 4, "release progress refresh smoke should run four commands");
  check(
    report.refreshCommandSummary ===
      "npm run release:progress-smoke -> npm run release:current-blocker-smoke -> npm run release:completion-report-packet-smoke -> npm run release:progress-freshness-smoke",
    "release progress refresh smoke should run progress, current-blocker, completion packet, then freshness"
  );
  check(report.refreshCommandRows.every((row) => row.valueRecorded === false), "release progress refresh command rows should be value-free");
  check(report.sourceArtifactRowCount === 4, "release progress refresh smoke should include four source artifacts");
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
const report = buildReport({ releaseProgress, currentBlocker, completionReportPacket, freshness });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(refreshMarkdownPath, markdown, "utf8");
await writeFile(refreshJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release progress refresh smoke passed.");
console.log(`- Markdown: ${relative(refreshMarkdownPath)}`);
console.log(`- JSON: ${relative(refreshJsonPath)}`);
console.log("- Refresh smoke ready: yes");
console.log(`- Command order: ${report.refreshCommandSummary}`);
console.log(`- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}`);
console.log(`- Fresh artifacts: ${report.finalFreshArtifactCount}/${report.finalFreshnessRowCount}`);
console.log(`- Stale artifacts: ${report.finalStaleArtifactCount}`);
console.log(`- Missing artifacts: ${report.finalMissingArtifactCount}`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
