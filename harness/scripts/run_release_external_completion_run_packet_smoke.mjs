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
const packetStem = "release-external-completion-run-packet-smoke";
const packetMarkdownArtifactName = "release-external-completion-run-packet-smoke.md";
const packetJsonArtifactName = "release-external-completion-run-packet-smoke.json";
const completionSummaryRefreshStem = "release-completion-summary-refresh-smoke";
const completionSummaryStem = "release-completion-summary-smoke";
const updateFeedPacketStem = "release-update-feed-edit-packet-smoke";
const updateMetadataPacketStem = "release-update-metadata-publish-packet-smoke";
const developerIdPacketStem = "release-developer-id-operator-packet-smoke";
const packetMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetStem}.md`);
const packetJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetStem}.json`);
const completionSummaryRefreshJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${completionSummaryRefreshStem}.json`
);
const completionSummaryJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${completionSummaryStem}.json`);
const updateFeedPacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${updateFeedPacketStem}.json`);
const updateMetadataPacketJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${updateMetadataPacketStem}.json`
);
const developerIdPacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${developerIdPacketStem}.json`);
const failures = [];

const refreshCommands = [
  {
    order: 1,
    command: "npm run release:completion-summary-refresh-smoke",
    role: "refresh after-work completion, current blocker, proof bundle, freshness, and operator brief evidence",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:update-feed-edit-packet-smoke",
    role: "refresh the value-free update feed/channel edit packet for the post-clearance auto-update step",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:update-metadata-publish-packet-smoke",
    role: "refresh the value-free update metadata publish packet and signed metadata blockers",
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run release:developer-id-operator-packet-smoke",
    role: "refresh the value-free Developer ID, notarization, Gatekeeper, manual QA, and channel QA packet",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release external completion run packet smoke failed:");
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
    fail(`${command} exited with status ${result.status}.`, "Refresh the release evidence, then rerun this packet smoke.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function sourceRow(label, filePath, ready, command) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready,
    command,
    valueRecorded: false
  };
}

function commandRow(order, phase, command, proofCommand, readiness, source, note) {
  return {
    order,
    phase,
    command,
    proofCommand,
    readiness,
    source,
    note,
    valueRecorded: false
  };
}

function deriveFirstRunCommand(completionSummary) {
  if (completionSummary.releaseChannelMetadataNeedsIgnoredEnv === true || /ignored local distribution env/i.test(textValue(completionSummary.firstBlocker))) {
    return "npm run release:channel-setup-wizard";
  }
  return "npm run release:private-edit-strict-proof";
}

function buildRunRows({ completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket }) {
  const firstRunCommand = deriveFirstRunCommand(completionSummary);
  const rows = [
    commandRow(
      1,
      "release-channel-metadata",
      firstRunCommand,
      "npm run release:private-edit-strict-proof",
      completionSummary.releaseChannelMetadataCleared === true ? "ready" : "blocked",
      "completionSummary.releaseChannelMetadata",
      "create/fill the ignored distribution env and prove the four release-channel metadata rows without printing values"
    ),
    commandRow(
      2,
      "private-edit-strict-proof",
      "npm run release:private-edit-strict-proof",
      "npm run release:private-value-leak-audit",
      completionSummary.releaseChannelMetadataCleared === true ? "ready" : "blocked",
      "completionSummary.operatorProofCommand",
      "run strict proof, post-edit proof, progress refresh, and leak audit after private release-channel values are ready"
    ),
    commandRow(
      3,
      "auto-update-feed",
      "npm run release:update-feed-edit-packet-smoke",
      "npm run release:update-feed-live-check-strict",
      updateFeedPacket.currentSelectedReadyCount === updateFeedPacket.currentSelectedRequiredCount ? "ready" : "blocked",
      "updateFeedPacket.currentSelectedReadyCount",
      "set one feed URL key and one channel key in the ignored env, then run the strict live check"
    ),
    commandRow(
      4,
      "auto-update-post-edit",
      "npm run release:update-feed-post-edit-proof",
      "npm run release:update-feed-checkpoint-smoke",
      updateFeedPacket.updateFeedLiveCheckReady === true ? "ready" : "blocked",
      "updateFeedPacket.updateFeedLiveCheckReady",
      "refresh real auto-update blockers and compare the real branch with the synthetic success branch"
    ),
    commandRow(
      5,
      "update-metadata",
      "npm run release:update-metadata-publish-packet-smoke",
      "npm run desktop:update-metadata-artifacts-smoke",
      updateMetadataPacket.updateMetadataPublishReady === true ? "ready" : "blocked",
      "updateMetadataPacket.updateMetadataPublishReady",
      "draft and verify update metadata only after feed/channel and signed artifact prerequisites are ready"
    ),
    commandRow(
      6,
      "developer-id",
      "npm run release:developer-id-operator-packet-smoke",
      "npm run desktop:developer-id-signing-smoke",
      developerIdPacket.developerIdReady === true ? "ready" : "blocked",
      "developerIdPacket.developerIdReady",
      "refresh Developer ID readiness and sign only an isolated ignored app copy when identity evidence exists"
    ),
    commandRow(
      7,
      "notarization",
      "npm run desktop:notarization-smoke",
      "npm run desktop:notarized-gatekeeper-smoke",
      developerIdPacket.notarizationReady === true ? "ready" : "blocked",
      "developerIdPacket.notarizationReady",
      "submit/staple only when Developer ID signing and guarded notary credentials are ready"
    ),
    commandRow(
      8,
      "gatekeeper",
      "npm run desktop:notarized-gatekeeper-smoke",
      "npm run desktop:distribution-manual-qa-smoke",
      developerIdPacket.gatekeeperReady === true ? "ready" : "blocked",
      "developerIdPacket.gatekeeperReady",
      "assess the isolated stapled DMG and mounted app before manual distribution QA"
    ),
    commandRow(
      9,
      "manual-qa",
      "npm run desktop:distribution-manual-qa-smoke",
      "npm run desktop:distribution-channel-qa-smoke",
      developerIdPacket.manualQaReady === true ? "ready" : "blocked",
      "developerIdPacket.manualQaReady",
      "record approval only after the current checklist digest and signed artifact evidence match"
    ),
    commandRow(
      10,
      "distribution-channel-qa",
      "npm run desktop:distribution-channel-qa-smoke",
      "npm run release:private-value-leak-audit",
      developerIdPacket.distributionChannelReady === true ? "ready" : "blocked",
      "developerIdPacket.distributionChannelReady",
      "refresh final channel QA after metadata, signing, notarization, Gatekeeper, update, and manual QA proofs"
    ),
    commandRow(
      11,
      "final-hard-gate",
      "npm run release:private-value-leak-audit",
      "npm run release:external-check",
      developerIdPacket.externalDistributionReady === true ? "ready" : "blocked",
      "developerIdPacket.externalDistributionReady",
      "run leak audit before the hard external gate; external completion stays unclaimed until the hard gate passes"
    ),
    commandRow(
      12,
      "external-check",
      "npm run release:external-check",
      "npm run release:completion-summary-refresh-smoke",
      "blocked",
      "hardGateReady",
      "final local gate after every private-input, update, signing, notarization, Gatekeeper, and manual QA proof is ready"
    )
  ];
  return rows;
}

function buildSourceRows({ completionSummaryRefresh, completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket }) {
  return [
    sourceRow(
      "completion-summary-refresh",
      completionSummaryRefreshJsonPath,
      completionSummaryRefresh.completionSummaryRefreshReady === true &&
        completionSummaryRefresh.privateValuesRecorded === false &&
        completionSummaryRefresh.claimedExternalDistribution === false,
      "npm run release:completion-summary-refresh-smoke"
    ),
    sourceRow(
      "completion-summary",
      completionSummaryJsonPath,
      completionSummary.completionSummaryReadoutReady === true &&
        completionSummary.privateValuesRecorded === false &&
        completionSummary.claimedExternalDistribution === false,
      "npm run release:completion-summary-smoke"
    ),
    sourceRow(
      "update-feed-edit-packet",
      updateFeedPacketJsonPath,
      updateFeedPacket.updateFeedEditPacketReady === true &&
        updateFeedPacket.privateValuesRecorded === false &&
        updateFeedPacket.claimedExternalDistribution === false,
      "npm run release:update-feed-edit-packet-smoke"
    ),
    sourceRow(
      "update-metadata-publish-packet",
      updateMetadataPacketJsonPath,
      updateMetadataPacket.updateMetadataPublishPacketReady === true &&
        updateMetadataPacket.privateValuesRecorded === false &&
        updateMetadataPacket.claimedExternalDistribution === false,
      "npm run release:update-metadata-publish-packet-smoke"
    ),
    sourceRow(
      "developer-id-operator-packet",
      developerIdPacketJsonPath,
      developerIdPacket.developerIdOperatorPacketReady === true &&
        developerIdPacket.privateValuesRecorded === false &&
        developerIdPacket.claimedExternalDistribution === false,
      "npm run release:developer-id-operator-packet-smoke"
    )
  ];
}

function buildReport({ completionSummaryRefresh, completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket }) {
  const runRows = buildRunRows({ completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket });
  const sourceRows = buildSourceRows({ completionSummaryRefresh, completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket });
  const blockedRows = runRows.filter((row) => row.readiness !== "ready");
  const completionBlockerActionRows = objectRows(completionSummary.completionBlockerActionRows);
  const completionBlockerFocusRows = objectRows(completionSummary.completionBlockerFocusRows);
  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:external-completion-run-packet-smoke",
    refreshCommands,
    refreshCommandCount: refreshCommands.length,
    externalCompletionRunPacketMarkdownArtifactName: packetMarkdownArtifactName,
    externalCompletionRunPacketJsonArtifactName: packetJsonArtifactName,
    externalCompletionRunPacketMarkdownPath: relative(packetMarkdownPath),
    externalCompletionRunPacketJsonPath: relative(packetJsonPath),
    externalCompletionRunPacketReady: false,
    sourceRows,
    sourceRowCount: sourceRows.length,
    sourceRowsValueFree: valueFreeRows(sourceRows),
    latestPlan: textValue(completionSummary.latestPlan),
    latestPlanNumber: integerValue(completionSummary.latestPlanNumber),
    tenPlanProgress: textValue(completionSummary.tenPlanProgress),
    tenPlanCompletedCount: integerValue(completionSummary.tenPlanCompletedCount),
    tenPlanTotal: integerValue(completionSummary.tenPlanTotal),
    completionPercent: completionSummary.completionPercent,
    remainingPercent: completionSummary.remainingPercent,
    currentFirstBlocker: textValue(completionSummary.firstBlocker),
    currentNextCommand: textValue(completionSummary.nextCommand),
    currentEnvEditTarget: textValue(completionSummary.currentEnvEditTarget, ".env.distribution.local"),
    releaseChannelMetadataBlocked: completionSummary.releaseChannelMetadataBlocked === true,
    releaseChannelMetadataCleared: completionSummary.releaseChannelMetadataCleared === true,
    releaseChannelMetadataNeedsIgnoredEnv: completionSummary.releaseChannelMetadataNeedsIgnoredEnv === true,
    releaseChannelReadyCount: integerValue(completionSummary.releaseChannelCurrentReadyCount),
    releaseChannelRequiredCount: integerValue(completionSummary.releaseChannelCurrentRequiredKeyCount),
    releaseChannelPlaceholderCount: integerValue(completionSummary.releaseChannelCurrentPlaceholderKeyCount),
    updateFeedSelectedReadyCount: integerValue(updateFeedPacket.currentSelectedReadyCount),
    updateFeedSelectedRequiredCount: integerValue(updateFeedPacket.currentSelectedRequiredCount),
    updateMetadataPublishReady: updateMetadataPacket.updateMetadataPublishReady === true,
    developerIdReady: developerIdPacket.developerIdReady === true,
    notarizationReady: developerIdPacket.notarizationReady === true,
    gatekeeperReady: developerIdPacket.gatekeeperReady === true,
    manualQaReady: developerIdPacket.manualQaReady === true,
    distributionChannelReady: developerIdPacket.distributionChannelReady === true,
    hardGateCommand: "npm run release:external-check",
    hardGateReady: false,
    hardGateWouldFail: true,
    runRows,
    runRowCount: runRows.length,
    runRowsValueFree: valueFreeRows(runRows),
    blockedRunRowCount: blockedRows.length,
    blockedRunRowSummary: blockedRows.map((row) => row.phase).join(", ") || "none",
    completionBlockerActionRows,
    completionBlockerActionRowCount: integerValue(completionSummary.completionBlockerActionRowCount),
    completionBlockerActionRowsValueFree: valueFreeRows(completionBlockerActionRows),
    completionBlockerFocusRows,
    completionBlockerFocusRowCount: integerValue(completionSummary.completionBlockerFocusRowCount),
    completionBlockerFocusRowsValueFree: valueFreeRows(completionBlockerFocusRows),
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

function formatSourceRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.label)} | ${escapeCell(row.path)} | ${readyLabel(row.present)} | ${readyLabel(row.ready)} | \`${escapeCell(row.command)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatRunRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.phase)} | \`${escapeCell(row.command)}\` | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.readiness)} | ${escapeCell(row.source)} | ${escapeCell(row.note)} | ${readyLabel(row.valueRecorded)} |`
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
  return `# ${appName} External Completion Run Packet Smoke

## Summary

- External completion run packet ready: ${readyLabel(report.externalCompletionRunPacketReady)}
- Latest completed plan: ${report.latestPlan}
- 10-plan progress: ${report.tenPlanProgress}
- User-facing completion: ${report.completionPercent}%
- Remaining completion: ${report.remainingPercent}%
- Current first blocker: ${report.currentFirstBlocker}
- Current next command: \`${report.currentNextCommand}\`
- Current env edit target: ${report.currentEnvEditTarget}
- Release-channel metadata blocked: ${readyLabel(report.releaseChannelMetadataBlocked)}
- Release-channel metadata cleared: ${readyLabel(report.releaseChannelMetadataCleared)}
- Release-channel metadata needs ignored env: ${readyLabel(report.releaseChannelMetadataNeedsIgnoredEnv)}
- Release-channel ready rows: ${report.releaseChannelReadyCount}/${report.releaseChannelRequiredCount}
- Release-channel placeholders: ${report.releaseChannelPlaceholderCount}/${report.releaseChannelRequiredCount}
- Update feed selected keys ready: ${report.updateFeedSelectedReadyCount}/${report.updateFeedSelectedRequiredCount}
- Update metadata publish ready: ${readyLabel(report.updateMetadataPublishReady)}
- Developer ID signed isolated app ready: ${readyLabel(report.developerIdReady)}
- Notarization ready: ${readyLabel(report.notarizationReady)}
- Notarized Gatekeeper ready: ${readyLabel(report.gatekeeperReady)}
- Manual QA approval ready: ${readyLabel(report.manualQaReady)}
- Distribution-channel ready: ${readyLabel(report.distributionChannelReady)}
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Run rows: ${report.runRowCount}
- Blocked run rows: ${report.blockedRunRowCount} (${report.blockedRunRowSummary})
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

## Source Rows

| source | path | present | ready | command | value recorded |
|---|---|---:|---:|---|---:|
${formatSourceRows(report.sourceRows)}

## External Completion Run Rows

| order | phase | command | proof command | readiness | source | note | value recorded |
|---:|---|---|---|---|---|---|---:|
${formatRunRows(report.runRows)}

## Current Completion Blocker Actions

| order | item | ready | current state | operator action | evidence | proof command | source field | value recorded |
|---:|---|---:|---|---|---|---|---|---:|
${formatCompletionActionRows(report.completionBlockerActionRows)}

## Current Completion Blocker Focus

| order | key | present | placeholder | shape ready | current ready | expected signal | proof command | rerun command | value recorded |
|---:|---|---:|---:|---:|---:|---|---|---|---:|
${formatCompletionFocusRows(report.completionBlockerFocusRows)}

## Not Recorded Or Claimed

This packet records no release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, local env value, private beat, or real user audio. It does not publish feeds, probe remote channels, upload releases, sign artifacts, submit to Apple, claim auto-update, or claim external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.appName === appName, "external completion run packet should identify GrooveForge");
  check(report.bundleId === bundleId, `external completion run packet should identify ${bundleId}`);
  check(report.reportCommand === "npm run release:external-completion-run-packet-smoke", "external completion run packet should report its command");
  check(report.refreshCommandCount === 4, "external completion run packet should refresh four source packets");
  check(
    report.refreshCommands.map((row) => row.command).join(" -> ") ===
      "npm run release:completion-summary-refresh-smoke -> npm run release:update-feed-edit-packet-smoke -> npm run release:update-metadata-publish-packet-smoke -> npm run release:developer-id-operator-packet-smoke",
    "external completion run packet should keep source refresh order"
  );
  check(report.sourceRowCount === 5, "external completion run packet should include five source rows");
  check(report.sourceRows.every((row) => row.present === true && row.ready === true), "external completion run packet source rows should be present and ready");
  check(report.sourceRowsValueFree === true, "external completion run packet source rows should be value-free");
  check(report.latestPlanNumber > 0, "external completion run packet should include latest plan number");
  check(report.tenPlanTotal === 10, "external completion run packet should keep ten-plan total");
  check(report.completionPercent === 99.999999, "external completion run packet should preserve completion percent");
  check(report.remainingPercent === 0.000001, "external completion run packet should preserve remaining percent");
  check(report.currentEnvEditTarget !== "none", "external completion run packet should expose current env edit target");
  check(report.releaseChannelRequiredCount === 4, "external completion run packet should track four release-channel metadata keys");
  check(report.updateFeedSelectedRequiredCount === 2, "external completion run packet should track two update feed/channel selected keys");
  check(report.hardGateCommand === "npm run release:external-check", "external completion run packet should cite hard gate command");
  check(report.hardGateReady === false, "external completion run packet should keep hard gate unready");
  check(report.hardGateWouldFail === true, "external completion run packet should keep hard gate would-fail posture");
  check(report.runRowCount === 12, "external completion run packet should include twelve run rows");
  check(report.runRowsValueFree === true, "external completion run packet run rows should be value-free");
  check(report.runRows[0]?.phase === "release-channel-metadata", "external completion run packet should start with release-channel metadata");
  check(report.runRows[0]?.command === "npm run release:channel-setup-wizard" || report.runRows[0]?.command === "npm run release:private-edit-strict-proof", "external completion run packet should start with setup wizard or strict proof");
  check(report.runRows.some((row) => row.command === "npm run release:update-feed-edit-packet-smoke"), "external completion run packet should include update feed edit packet");
  check(report.runRows.some((row) => row.command === "npm run release:update-metadata-publish-packet-smoke"), "external completion run packet should include update metadata publish packet");
  check(report.runRows.some((row) => row.command === "npm run release:developer-id-operator-packet-smoke"), "external completion run packet should include Developer ID operator packet");
  check(report.runRows.some((row) => row.command === "npm run release:external-check"), "external completion run packet should include hard external gate");
  check(report.blockedRunRowCount >= 1, "external completion run packet should keep blocked run rows while external proof remains incomplete");
  check(report.completionBlockerActionRowCount === report.completionBlockerActionRows.length, "external completion run packet blocker action count should match rows");
  check(report.completionBlockerActionRowsValueFree === true, "external completion run packet blocker action rows should be value-free");
  check(report.completionBlockerFocusRowCount === report.completionBlockerFocusRows.length, "external completion run packet blocker focus count should match rows");
  check(report.completionBlockerFocusRowsValueFree === true, "external completion run packet blocker focus rows should be value-free");
  check(report.privateValuesRecorded === false, "external completion run packet should not record private values");
  check(report.releaseUrlValueRecorded === false, "external completion run packet should not record release URL values");
  check(report.supportUrlValueRecorded === false, "external completion run packet should not record support URL values");
  check(report.feedValueRecorded === false, "external completion run packet should not record feed values");
  check(report.credentialValueRecorded === false, "external completion run packet should not record credential values");
  check(report.tokenValueRecorded === false, "external completion run packet should not record token values");
  check(report.channelValueRecorded === false, "external completion run packet should not record channel values");
  check(report.developerIdIdentityValueRecorded === false, "external completion run packet should not record Developer ID identity values");
  check(report.localEnvValueRecorded === false, "external completion run packet should not record local env values");
  check(report.networkProbeAttempted === false, "external completion run packet should not probe networks");
  check(report.updateFeedPublishAttempted === false, "external completion run packet should not publish update feeds");
  check(report.distributionChannelProbeAttempted === false, "external completion run packet should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "external completion run packet should not upload releases");
  check(report.signingAttempted === false, "external completion run packet should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "external completion run packet should not submit to Apple");
  check(report.claimedDeveloperIdSigning === false, "external completion run packet should not claim Developer ID signing");
  check(report.claimedNotarization === false, "external completion run packet should not claim notarization");
  check(report.claimedGatekeeperApproval === false, "external completion run packet should not claim Gatekeeper approval");
  check(report.claimedAutoUpdate === false, "external completion run packet should not claim auto-update");
  check(report.claimedManualQaApproval === false, "external completion run packet should not claim manual QA approval");
  check(report.claimedAppStoreSubmission === false, "external completion run packet should not claim app-store submission");
  check(report.claimedExternalDistribution === false, "external completion run packet should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "external completion run packet JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "external completion run packet Markdown should not include URL values");
  check(markdown.includes("External Completion Run Packet Smoke"), "external completion run packet Markdown should include title");
  check(markdown.includes("## External Completion Run Rows"), "external completion run packet Markdown should include run rows");
  check(markdown.includes("External distribution claimed: no"), "external completion run packet Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const step of refreshCommands) {
  console.log(`Refreshing release external completion run packet evidence: ${step.command}`);
  runNpmScript(step.command);
}

const [completionSummaryRefresh, completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket] = await Promise.all([
  readJsonRequired(completionSummaryRefreshJsonPath, "release completion summary refresh"),
  readJsonRequired(completionSummaryJsonPath, "release completion summary"),
  readJsonRequired(updateFeedPacketJsonPath, "release update feed edit packet"),
  readJsonRequired(updateMetadataPacketJsonPath, "release update metadata publish packet"),
  readJsonRequired(developerIdPacketJsonPath, "release Developer ID operator packet")
]);

const report = buildReport({ completionSummaryRefresh, completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket });
report.externalCompletionRunPacketReady = true;
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(packetMarkdownPath, markdown, "utf8");
await writeFile(packetJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release external completion run packet smoke passed.");
console.log(`- Markdown: ${relative(packetMarkdownPath)}`);
console.log(`- JSON: ${relative(packetJsonPath)}`);
console.log(`- Latest completed plan: ${report.latestPlan}`);
console.log(`- 10-plan progress: ${report.tenPlanProgress}`);
console.log(`- User-facing completion: ${report.completionPercent}%`);
console.log(`- Remaining completion: ${report.remainingPercent}%`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- Current next command: ${report.currentNextCommand}`);
console.log(`- First run command: ${report.runRows[0]?.command}`);
console.log(`- Run rows: ${report.runRowCount}`);
console.log(`- Blocked run rows: ${report.blockedRunRowCount} (${report.blockedRunRowSummary})`);
console.log(`- Hard gate command: ${report.hardGateCommand}`);
console.log(`- Hard gate ready: ${report.hardGateReady ? "yes" : "no"}`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
