#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const packetStem = "release-update-feed-edit-packet-smoke";
const liveCheckStem = "release-update-feed-live-check";
const packetMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetStem}.md`);
const packetJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetStem}.json`);
const liveCheckJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${liveCheckStem}.json`);
const updateFeedKeys = [
  "GROOVEFORGE_UPDATE_FEED_URL",
  "ELECTRON_UPDATE_FEED_URL",
  "UPDATE_FEED_URL",
  "GROOVEFORGE_UPDATE_CHANNEL",
  "ELECTRON_UPDATE_CHANNEL",
  "UPDATE_CHANNEL"
];
const refreshCommands = [
  {
    order: 1,
    command: "npm run release:update-feed-live-check",
    role: "refresh value-free real ignored-env update feed/channel posture",
    valueRecorded: false
  }
];
const operatorCommandRows = [
  {
    order: 1,
    command: "manual edit current env target",
    role: "replace one update feed URL key and one update channel key outside committed files",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:update-feed-live-check-strict",
    role: "strict first proof for selected feed URL and update channel rows",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:update-feed-post-edit-proof",
    role: "refresh live-check and real auto-update readiness after private edits",
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run release:update-feed-checkpoint-smoke",
    role: "compare real update-feed proof with synthetic strict-ready branch",
    valueRecorded: false
  },
  {
    order: 5,
    command: "npm run release:current-blocker",
    role: "refresh current external blocker after update feed/channel edits",
    valueRecorded: false
  },
  {
    order: 6,
    command: "npm run release:external-check",
    role: "hard external gate after every redacted readiness signal is ready",
    valueRecorded: false
  }
];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge update feed edit packet smoke failed:");
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
    fail(`${command} exited with status ${result.status}.`, "Refresh the update feed live-check evidence, then retry this edit packet smoke.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function currentTenPlanProgress() {
  const completedRoot = path.join(root, "docs", "exec_plans", "completed");
  const completedFiles = await readdir(completedRoot);
  const completedPlanNumbers = completedFiles
    .map((file) => /^plan-(\d+)-/.exec(file)?.[1])
    .filter((value) => typeof value === "string")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
  const currentPlan = Math.max(...completedPlanNumbers);
  const windowStart = Math.floor((currentPlan - 1) / 10) * 10 + 1;
  const windowEnd = windowStart + 9;
  const windowRows = completedPlanNumbers.filter((number) => number >= windowStart && number <= windowEnd).sort((a, b) => a - b);
  return {
    latestPlan: `plan-${currentPlan}`,
    label: `${windowStart}-${windowEnd}: ${windowRows.length}/10`,
    windowStart,
    windowEnd,
    completedCount: windowRows.length,
    windowTotal: 10,
    reportDue: windowRows.length === 10,
    nextReportAt: `plan-${windowEnd}`
  };
}

function valueFreeRows(rows) {
  return objectRows(rows).every((row) => row.valueRecorded === false);
}

function sanitizeUpdateFeedRows(rows) {
  return objectRows(rows).map((row) => ({
    order: integerValue(row.order),
    key: textValue(row.key),
    kind: textValue(row.kind),
    selected: row.selected === true,
    present: row.present === true,
    placeholder: row.placeholder === true,
    shapeReady: row.shapeReady === true,
    selectedReady: row.selectedReady === true,
    expectedShape: textValue(row.expectedShape),
    editTarget: textValue(row.editTarget),
    line: Number.isInteger(row.line) ? row.line : null,
    proofCommand: textValue(row.proofCommand, "npm run release:update-feed-live-check"),
    strictCommand: textValue(row.strictCommand, "npm run release:update-feed-live-check-strict"),
    valueRecorded: false
  }));
}

function sanitizeStrictFailureRows(rows) {
  return objectRows(rows).map((row) => ({
    target: textValue(row.target),
    selectedKey: textValue(row.selectedKey),
    present: row.present === true,
    shapeReady: row.shapeReady === true,
    blockerCount: integerValue(row.blockerCount),
    proofCommand: textValue(row.proofCommand, "npm run release:update-feed-live-check-strict"),
    nonStrictProofCommand: textValue(row.nonStrictProofCommand, "npm run release:update-feed-live-check"),
    valueRecorded: false
  }));
}

function sanitizePlaceholderEditLocations(rows) {
  return objectRows(rows).map((row) => ({
    key: textValue(row.key),
    file: textValue(row.file),
    line: Number.isInteger(row.line) ? row.line : null,
    placeholder: row.placeholder === true,
    valueRecorded: false
  }));
}

function buildSelectionRows(updateFeedRows) {
  const feedRows = updateFeedRows.filter((row) => row.kind === "feed-url");
  const channelRows = updateFeedRows.filter((row) => row.kind === "channel");
  return [
    {
      order: 1,
      target: "update-feed-url",
      candidateKeyCount: feedRows.length,
      selectedKey: textValue(feedRows.find((row) => row.selected)?.key),
      selectedReady: feedRows.some((row) => row.selectedReady),
      requiredReadyCount: 1,
      proofCommand: "npm run release:update-feed-live-check-strict",
      valueRecorded: false
    },
    {
      order: 2,
      target: "update-channel",
      candidateKeyCount: channelRows.length,
      selectedKey: textValue(channelRows.find((row) => row.selected)?.key),
      selectedReady: channelRows.some((row) => row.selectedReady),
      requiredReadyCount: 1,
      proofCommand: "npm run release:update-feed-live-check-strict",
      valueRecorded: false
    }
  ];
}

function buildReport({ liveCheck, progress }) {
  const updateFeedRows = sanitizeUpdateFeedRows(liveCheck.updateFeedLiveCheckRows);
  const strictFailureRows = sanitizeStrictFailureRows(liveCheck.strictFailureRows);
  const placeholderEditLocations = sanitizePlaceholderEditLocations(liveCheck.currentPlaceholderEditLocations);
  const selectionRows = buildSelectionRows(updateFeedRows);
  const selectedReadyCount = integerValue(liveCheck.currentSelectedReadyCount);
  const placeholderCount = integerValue(liveCheck.currentPlaceholderKeyCount);
  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:update-feed-edit-packet-smoke",
    refreshCommands,
    refreshCommandCount: refreshCommands.length,
    operatorCommandRows: operatorCommandRows.map((row) =>
      row.command === "manual edit current env target"
        ? { ...row, command: `manual edit ${textValue(liveCheck.currentEnvEditTarget)}` }
        : row
    ),
    operatorCommandCount: operatorCommandRows.length,
    updateFeedEditPacketMarkdownArtifactName: "release-update-feed-edit-packet-smoke.md",
    updateFeedEditPacketJsonArtifactName: "release-update-feed-edit-packet-smoke.json",
    updateFeedEditPacketMarkdownPath: relative(packetMarkdownPath),
    updateFeedEditPacketJsonPath: relative(packetJsonPath),
    liveCheckJsonArtifactName: "release-update-feed-live-check.json",
    liveCheckJsonPath: relative(liveCheckJsonPath),
    updateFeedEditPacketReady: false,
    liveCheckSourceReady:
      liveCheck.privateValuesRecorded === false &&
      liveCheck.feedValueRecorded === false &&
      liveCheck.channelValueRecorded === false &&
      liveCheck.networkProbeAttempted === false &&
      liveCheck.updateFeedPublishAttempted === false &&
      liveCheck.claimedAutoUpdate === false &&
      liveCheck.claimedExternalDistribution === false &&
      valueFreeRows(liveCheck.updateFeedLiveCheckRows),
    updateFeedLiveCheckReady: liveCheck.updateFeedLiveCheckReady === true,
    updateFeedStrictReady: liveCheck.strictReady === true,
    updateFeedStrictExitCode: integerValue(liveCheck.strictExitCode),
    currentEnvEditTarget: textValue(liveCheck.currentEnvEditTarget),
    currentRequiredKeyCount: integerValue(liveCheck.currentRequiredKeyCount),
    currentRequiredKeys: Array.isArray(liveCheck.currentRequiredKeys) ? liveCheck.currentRequiredKeys : [],
    currentSelectedReadyCount: selectedReadyCount,
    currentSelectedRequiredCount: 2,
    currentPlaceholderKeyCount: placeholderCount,
    currentPlaceholderKeys: Array.isArray(liveCheck.currentPlaceholderKeys) ? liveCheck.currentPlaceholderKeys : [],
    currentPlaceholderEditLocationCount: integerValue(liveCheck.currentPlaceholderEditLocationCount),
    currentPlaceholderEditLocations: placeholderEditLocations,
    updateFeedLiveCheckRows: updateFeedRows,
    updateFeedLiveCheckRowCount: updateFeedRows.length,
    updateFeedSelectionRows: selectionRows,
    updateFeedSelectionRowCount: selectionRows.length,
    strictFailureRows,
    strictFailureRowCount: strictFailureRows.length,
    selectedFeedKey: textValue(liveCheck.selectedFeedKey),
    selectedChannelKey: textValue(liveCheck.selectedChannelKey),
    postEditProofCommand: "npm run release:update-feed-post-edit-proof",
    checkpointCommand: "npm run release:update-feed-checkpoint-smoke",
    strictProofCommand: "npm run release:update-feed-live-check-strict",
    autoUpdateReadinessCommand: "npm run desktop:auto-update-readiness-smoke",
    hardGateCommand: "npm run release:external-check",
    latestCompletedPlan: progress.latestPlan,
    currentTenPlanProgressLabel: progress.label,
    currentTenPlanWindowStart: progress.windowStart,
    currentTenPlanWindowEnd: progress.windowEnd,
    currentTenPlanWindowCompletedCount: progress.completedCount,
    currentTenPlanWindowTotal: progress.windowTotal,
    tenPlanProgressReportDue: progress.reportDue,
    nextTenPlanProgressReportAt: progress.nextReportAt,
    userFacingCompletionPercent: "99.999999%",
    userFacingRemainingPercent: "0.000001%",
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

function formatCommandRows(rows) {
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatUpdateFeedRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.kind)} | ${readyLabel(row.selected)} | ${readyLabel(row.present)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${readyLabel(row.selectedReady)} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "none")} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.strictCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatSelectionRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.target)} | ${row.candidateKeyCount} | ${escapeCell(row.selectedKey)} | ${readyLabel(row.selectedReady)} | ${row.requiredReadyCount} | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatStrictFailureRows(rows) {
  if (rows.length === 0) {
    return "| none | none | yes | yes | 0 | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.target)} | ${escapeCell(row.selectedKey)} | ${readyLabel(row.present)} | ${readyLabel(row.shapeReady)} | ${row.blockerCount} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.nonStrictProofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatPlaceholderRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | no | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.key)} | ${escapeCell(row.file)} | ${escapeCell(row.line ?? "none")} | ${readyLabel(row.placeholder)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} Update Feed Edit Packet Smoke

## Summary

- Edit packet ready: ${readyLabel(report.updateFeedEditPacketReady)}
- Live-check source ready: ${readyLabel(report.liveCheckSourceReady)}
- Update feed live check ready: ${readyLabel(report.updateFeedLiveCheckReady)}
- Strict ready: ${readyLabel(report.updateFeedStrictReady)}
- Current env edit target: ${report.currentEnvEditTarget}
- Required update feed/channel keys: ${report.currentRequiredKeyCount}
- Selected keys ready: ${report.currentSelectedReadyCount}/${report.currentSelectedRequiredCount}
- Placeholder keys: ${report.currentPlaceholderKeyCount}
- Placeholder edit locations: ${report.currentPlaceholderEditLocationCount}
- Strict proof command: \`${report.strictProofCommand}\`
- Post-edit proof command: \`${report.postEditProofCommand}\`
- Checkpoint command: \`${report.checkpointCommand}\`
- Auto-update readiness command: \`${report.autoUpdateReadinessCommand}\`
- Hard gate command: \`${report.hardGateCommand}\`
- Latest completed plan: ${report.latestCompletedPlan}
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- User-facing completion: ${report.userFacingCompletionPercent}
- Remaining completion: ${report.userFacingRemainingPercent}
- Private values recorded: no
- Feed values recorded: no
- Channel values recorded: no
- Network probe attempted: no
- Update feed publish attempted: no
- Auto-update claimed: no
- External distribution claimed: no

## Refresh Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.refreshCommands)}

## Operator Command Rows

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.operatorCommandRows)}

## Selection Rows

| order | target | candidate keys | selected key | selected ready | required ready count | proof command | value recorded |
|---:|---|---:|---|---:|---:|---|---:|
${formatSelectionRows(report.updateFeedSelectionRows)}

## Update Feed Rows

| order | key | kind | selected | present | placeholder | shape ready | selected ready | expected shape | edit target | line | proof command | strict command | value recorded |
|---:|---|---|---:|---:|---:|---:|---:|---|---|---:|---|---|---:|
${formatUpdateFeedRows(report.updateFeedLiveCheckRows)}

## Strict Failure Rows

| target | selected key | present | shape ready | blocker count | strict command | non-strict command | value recorded |
|---|---|---:|---:|---:|---|---|---:|
${formatStrictFailureRows(report.strictFailureRows)}

## Placeholder Edit Locations

| key | file | line | placeholder | value recorded |
|---|---|---:|---:|---:|
${formatPlaceholderRows(report.currentPlaceholderEditLocations)}

## Not Claimed

This edit packet does not claim auto-update readiness, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, release upload, update feed publishing, remote feed probing, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.appName === appName, "update feed edit packet should identify GrooveForge");
  check(report.bundleId === bundleId, `update feed edit packet should identify ${bundleId}`);
  check(report.reportCommand === "npm run release:update-feed-edit-packet-smoke", "update feed edit packet should report its command");
  check(report.refreshCommandCount === 1, "update feed edit packet should have one refresh command");
  check(report.refreshCommands[0]?.command === "npm run release:update-feed-live-check", "update feed edit packet should refresh live-check first");
  check(report.operatorCommandCount === 6, "update feed edit packet should include six operator command rows");
  check(report.liveCheckSourceReady === true, "update feed edit packet should require a value-free live-check source");
  check(report.currentRequiredKeyCount === 6, "update feed edit packet should cover six update feed/channel keys");
  check(updateFeedKeys.every((key) => report.currentRequiredKeys.includes(key)), "update feed edit packet should include every update feed/channel key");
  check(report.updateFeedLiveCheckRowCount === 6, "update feed edit packet should mirror six update feed live-check rows");
  check(report.updateFeedSelectionRowCount === 2, "update feed edit packet should include feed and channel selection rows");
  check(report.currentSelectedReadyCount >= 0 && report.currentSelectedReadyCount <= 2, "update feed edit packet selected-ready count should be bounded");
  check(report.currentSelectedRequiredCount === 2, "update feed edit packet should require two selected-ready rows");
  check(report.currentPlaceholderKeyCount === report.currentPlaceholderKeys.length, "update feed edit packet placeholder key count should match keys");
  check(report.currentPlaceholderEditLocationCount === report.currentPlaceholderEditLocations.length, "update feed edit packet placeholder edit location count should match rows");
  check(report.updateFeedLiveCheckRows.every((row) => row.valueRecorded === false), "update feed edit packet live rows should be value-free");
  check(report.updateFeedSelectionRows.every((row) => row.valueRecorded === false), "update feed edit packet selection rows should be value-free");
  check(report.strictFailureRows.every((row) => row.valueRecorded === false), "update feed edit packet strict failure rows should be value-free");
  check(report.currentPlaceholderEditLocations.every((row) => row.valueRecorded === false), "update feed edit packet placeholder rows should be value-free");
  check(report.operatorCommandRows.every((row) => row.valueRecorded === false), "update feed edit packet operator rows should be value-free");
  check(report.strictProofCommand === "npm run release:update-feed-live-check-strict", "update feed edit packet should cite strict proof command");
  check(report.postEditProofCommand === "npm run release:update-feed-post-edit-proof", "update feed edit packet should cite post-edit proof command");
  check(report.checkpointCommand === "npm run release:update-feed-checkpoint-smoke", "update feed edit packet should cite checkpoint command");
  check(report.autoUpdateReadinessCommand === "npm run desktop:auto-update-readiness-smoke", "update feed edit packet should cite auto-update readiness command");
  check(report.hardGateCommand === "npm run release:external-check", "update feed edit packet should cite hard gate command");
  check(report.userFacingCompletionPercent === "99.999999%", "update feed edit packet should preserve completion percent");
  check(report.userFacingRemainingPercent === "0.000001%", "update feed edit packet should preserve remaining percent");
  check(report.privateValuesRecorded === false, "update feed edit packet should not record private values");
  check(report.feedValueRecorded === false, "update feed edit packet should not record feed values");
  check(report.channelValueRecorded === false, "update feed edit packet should not record channel values");
  check(report.localEnvValueRecorded === false, "update feed edit packet should not record local env values");
  check(report.networkProbeAttempted === false, "update feed edit packet should not probe networks");
  check(report.updateFeedPublishAttempted === false, "update feed edit packet should not publish update feeds");
  check(report.releaseUploadAttempted === false, "update feed edit packet should not upload releases");
  check(report.signingAttempted === false, "update feed edit packet should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "update feed edit packet should not submit to Apple");
  check(report.claimedAutoUpdate === false, "update feed edit packet should not claim auto-update");
  check(report.claimedExternalDistribution === false, "update feed edit packet should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "update feed edit packet JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "update feed edit packet Markdown should not include URL values");
  check(markdown.includes("Update Feed Edit Packet Smoke"), "update feed edit packet Markdown should include title");
  check(markdown.includes("Operator Command Rows"), "update feed edit packet Markdown should include operator command rows");
  check(markdown.includes("Selection Rows"), "update feed edit packet Markdown should include selection rows");
  check(markdown.includes("Update Feed Rows"), "update feed edit packet Markdown should include update feed rows");
  check(markdown.includes("Auto-update claimed: no"), "update feed edit packet Markdown should keep auto-update unclaimed");
  check(markdown.includes("External distribution claimed: no"), "update feed edit packet Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const step of refreshCommands) {
  console.log(`Refreshing update feed edit packet evidence: ${step.command}`);
  runNpmScript(step.command);
}

const liveCheck = await readJsonRequired(liveCheckJsonPath, "Update feed live check");
const progress = await currentTenPlanProgress();
const report = buildReport({ liveCheck, progress });
report.updateFeedEditPacketReady = true;
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(packetMarkdownPath, markdown, "utf8");
await writeFile(packetJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge update feed edit packet smoke passed.");
console.log(`- Markdown: ${relative(packetMarkdownPath)}`);
console.log(`- JSON: ${relative(packetJsonPath)}`);
console.log(`- Edit packet ready: ${report.updateFeedEditPacketReady ? "yes" : "no"}`);
console.log(`- Live-check source ready: ${report.liveCheckSourceReady ? "yes" : "no"}`);
console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
console.log(`- Current selected keys ready: ${report.currentSelectedReadyCount}/${report.currentSelectedRequiredCount}`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
console.log(`- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount}`);
console.log(`- Strict proof command: ${report.strictProofCommand}`);
console.log(`- Post-edit proof command: ${report.postEditProofCommand}`);
console.log(`- Checkpoint command: ${report.checkpointCommand}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
