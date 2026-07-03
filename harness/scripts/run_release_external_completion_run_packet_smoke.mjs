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
const releaseChannelApplyPrivateEnvPreflightCommand = "npm run release:channel-apply-private-env-preflight";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
const privateEditStrictProofCommand = "npm run release:private-edit-strict-proof";

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
const fromExistingCompletionSummary = process.argv.includes("--from-existing-completion-summary");
const activeRefreshCommands = fromExistingCompletionSummary ? refreshCommands.slice(1) : refreshCommands;

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

function commandOrder(rows, command) {
  const row = objectRows(rows).find((item) => item.command === command);
  return integerValue(row?.order);
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

function sequenceRunRows(rows) {
  let currentBlockerAssigned = false;
  return rows.map((row) => {
    if (row.readiness === "ready") {
      return {
        ...row,
        sequenceStatus: "ready"
      };
    }
    if (!currentBlockerAssigned) {
      currentBlockerAssigned = true;
      return {
        ...row,
        sequenceStatus: "current-blocker"
      };
    }
    return {
      ...row,
      sequenceStatus: "waiting-for-prerequisite"
    };
  });
}

function deriveFirstRunCommand(completionSummary) {
  const currentOperatorFirstCommand = textValue(completionSummary.currentOperatorFirstCommand, "");
  if (completionSummary.currentOperatorCommandSequenceReady === true && currentOperatorFirstCommand !== "none") {
    return currentOperatorFirstCommand;
  }
  if (completionSummary.releaseChannelMetadataNeedsIgnoredEnv === true || /ignored local distribution env/i.test(textValue(completionSummary.firstBlocker))) {
    return "npm run release:channel-setup-wizard";
  }
  return privateEditStrictProofCommand;
}

function buildRunRows({ completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket }) {
  const firstRunCommand = deriveFirstRunCommand(completionSummary);
  const releaseChannelProofCommand = textValue(completionSummary.currentOperatorStrictProofCommand, privateEditStrictProofCommand);
  const rows = [
    commandRow(
      1,
      "release-channel-metadata",
      firstRunCommand,
      releaseChannelProofCommand,
      completionSummary.releaseChannelMetadataCleared === true ? "ready" : "blocked",
      "completionSummary.currentOperatorCommandRows",
      "run the current value-free operator command sequence for release-channel metadata, then prove the four rows without printing values"
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
  return sequenceRunRows(rows);
}

function buildSourceRows({ completionSummaryRefresh, completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket }) {
  const rows = [
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
  if (!fromExistingCompletionSummary) {
    rows.unshift(
      sourceRow(
        "completion-summary-refresh",
        completionSummaryRefreshJsonPath,
        completionSummaryRefresh?.completionSummaryRefreshReady === true &&
          completionSummaryRefresh.privateValuesRecorded === false &&
          completionSummaryRefresh.claimedExternalDistribution === false,
        "npm run release:completion-summary-refresh-smoke"
      )
    );
  }
  return rows;
}

function buildReport({ completionSummaryRefresh, completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket }) {
  const currentOperatorCommandRows = objectRows(completionSummary.currentOperatorCommandRows);
  const currentOperatorPreflightCommand = textValue(
    completionSummary.currentOperatorPreflightCommand,
    releaseChannelApplyPrivateEnvPreflightCommand
  );
  const currentOperatorApplyCommand = textValue(completionSummary.currentOperatorApplyCommand, releaseChannelApplyPrivateEnvCommand);
  const currentOperatorStrictProofCommand = textValue(completionSummary.currentOperatorStrictProofCommand, privateEditStrictProofCommand);
  const currentOperatorPreflightCommandOrder =
    integerValue(completionSummary.currentOperatorPreflightCommandOrder) || commandOrder(currentOperatorCommandRows, currentOperatorPreflightCommand);
  const currentOperatorApplyCommandOrder =
    integerValue(completionSummary.currentOperatorApplyCommandOrder) || commandOrder(currentOperatorCommandRows, currentOperatorApplyCommand);
  const currentOperatorStrictProofCommandOrder =
    integerValue(completionSummary.currentOperatorStrictProofCommandOrder) || commandOrder(currentOperatorCommandRows, currentOperatorStrictProofCommand);
  const runRows = buildRunRows({ completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket });
  const sourceRows = buildSourceRows({ completionSummaryRefresh, completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket });
  const blockedRows = runRows.filter((row) => row.readiness !== "ready");
  const currentBlockedRows = runRows.filter((row) => row.sequenceStatus === "current-blocker");
  const waitingRows = runRows.filter((row) => row.sequenceStatus === "waiting-for-prerequisite");
  const readyRows = runRows.filter((row) => row.sequenceStatus === "ready");
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
    sourceMode: fromExistingCompletionSummary ? "existing-completion-summary" : "refreshed-completion-summary",
    refreshCommands: activeRefreshCommands,
    refreshCommandCount: activeRefreshCommands.length,
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
    currentOperatorCommandSequenceReady: completionSummary.currentOperatorCommandSequenceReady === true,
    currentOperatorCommandRows,
    currentOperatorCommandRowCount: integerValue(completionSummary.currentOperatorCommandRowCount),
    currentOperatorCommandSummary: textValue(completionSummary.currentOperatorCommandSummary),
    currentOperatorFirstCommand: textValue(completionSummary.currentOperatorFirstCommand),
    currentOperatorPreflightCommand,
    currentOperatorPreflightCommandOrder,
    currentOperatorApplyCommand,
    currentOperatorApplyCommandOrder,
    currentOperatorStrictProofCommand,
    currentOperatorStrictProofCommandOrder,
    currentOperatorBlockerRefreshCommand: textValue(completionSummary.currentOperatorBlockerRefreshCommand, "npm run release:current-blocker"),
    currentOperatorNextActionsRefreshCommand: textValue(completionSummary.currentOperatorNextActionsRefreshCommand, "npm run release:next-actions"),
    currentOperatorPreflightBeforeApply: completionSummary.currentOperatorPreflightBeforeApply === true,
    currentOperatorApplyBeforeStrictProof: completionSummary.currentOperatorApplyBeforeStrictProof === true,
    currentOperatorValueRecorded: completionSummary.currentOperatorValueRecorded === true ? true : false,
    firstRunCommand: textValue(runRows[0]?.command),
    firstRunMatchesCurrentOperatorFirstCommand:
      textValue(runRows[0]?.command) !== "none" && textValue(runRows[0]?.command) === textValue(completionSummary.currentOperatorFirstCommand),
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
    readyRunRowCount: readyRows.length,
    blockedRunRowCount: blockedRows.length,
    blockedRunRowSummary: blockedRows.map((row) => row.phase).join(", ") || "none",
    currentBlockedRunRowCount: currentBlockedRows.length,
    currentBlockedRunRowSummary: currentBlockedRows.map((row) => row.phase).join(", ") || "none",
    waitingRunRowCount: waitingRows.length,
    waitingRunRowSummary: waitingRows.map((row) => row.phase).join(", ") || "none",
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
        `| ${row.order} | ${escapeCell(row.phase)} | \`${escapeCell(row.command)}\` | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.readiness)} | ${escapeCell(row.sequenceStatus)} | ${escapeCell(row.source)} | ${escapeCell(row.note)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCurrentOperatorCommandRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.ready === true)} | ${readyLabel(row.valueRecorded)} |`
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
- Current operator command sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- First run command: \`${report.firstRunCommand}\`
- First run matches current operator first command: ${readyLabel(report.firstRunMatchesCurrentOperatorFirstCommand)}
- Current operator preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Current operator apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
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
- Current blocker run rows: ${report.currentBlockedRunRowCount} (${report.currentBlockedRunRowSummary})
- Waiting run rows: ${report.waitingRunRowCount} (${report.waitingRunRowSummary})
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

| order | phase | command | proof command | readiness | sequence status | source | note | value recorded |
|---:|---|---|---|---|---|---|---|---:|
${formatRunRows(report.runRows)}

## Current Operator Command Sequence

- Sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- First command: \`${report.currentOperatorFirstCommand}\`
- Preflight command: \`${report.currentOperatorPreflightCommand}\`
- Apply command: \`${report.currentOperatorApplyCommand}\`
- Strict proof command: \`${report.currentOperatorStrictProofCommand}\`
- Current-blocker refresh command: \`${report.currentOperatorBlockerRefreshCommand}\`
- Next-actions refresh command: \`${report.currentOperatorNextActionsRefreshCommand}\`
- Preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Value recorded: ${readyLabel(report.currentOperatorValueRecorded)}

| order | command | role | ready | value recorded |
|---:|---|---|---:|---:|
${formatCurrentOperatorCommandRows(report.currentOperatorCommandRows)}

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
  if (fromExistingCompletionSummary) {
    check(report.sourceMode === "existing-completion-summary", "external completion run packet should report existing completion summary mode");
    check(report.refreshCommandCount === 3, "external completion run packet existing-summary mode should refresh three downstream packets");
    check(
      report.refreshCommands.map((row) => row.command).join(" -> ") ===
        "npm run release:update-feed-edit-packet-smoke -> npm run release:update-metadata-publish-packet-smoke -> npm run release:developer-id-operator-packet-smoke",
      "external completion run packet existing-summary mode should keep downstream refresh order"
    );
    check(report.sourceRowCount === 4, "external completion run packet existing-summary mode should include four source rows");
  } else {
    check(report.sourceMode === "refreshed-completion-summary", "external completion run packet should report refreshed completion summary mode");
    check(report.refreshCommandCount === 4, "external completion run packet should refresh four source packets");
    check(
      report.refreshCommands.map((row) => row.command).join(" -> ") ===
        "npm run release:completion-summary-refresh-smoke -> npm run release:update-feed-edit-packet-smoke -> npm run release:update-metadata-publish-packet-smoke -> npm run release:developer-id-operator-packet-smoke",
      "external completion run packet should keep source refresh order"
    );
    check(report.sourceRowCount === 5, "external completion run packet should include five source rows");
  }
  check(report.sourceRows.every((row) => row.present === true && row.ready === true), "external completion run packet source rows should be present and ready");
  check(report.sourceRowsValueFree === true, "external completion run packet source rows should be value-free");
  check(report.latestPlanNumber > 0, "external completion run packet should include latest plan number");
  check(report.tenPlanTotal === 10, "external completion run packet should keep ten-plan total");
  check(report.completionPercent === 99.999999, "external completion run packet should preserve completion percent");
  check(report.remainingPercent === 0.000001, "external completion run packet should preserve remaining percent");
  check(report.currentEnvEditTarget !== "none", "external completion run packet should expose current env edit target");
  check(report.currentOperatorCommandSequenceReady === true, "external completion run packet current operator command sequence should be ready");
  check(
    report.currentOperatorCommandRowCount === report.currentOperatorCommandRows.length,
    "external completion run packet current operator command row count should match rows"
  );
  check(
    report.currentOperatorCommandRows.length >= 5,
    "external completion run packet current operator command sequence should include preflight, apply, strict proof, blocker refresh, and next-actions refresh"
  );
  check(
    report.currentOperatorCommandRows.every((row) => row.ready === true && row.valueRecorded === false),
    "external completion run packet current operator command rows should be ready and value-free"
  );
  check(
    report.currentOperatorPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand,
    "external completion run packet current operator sequence should expose private env preflight command"
  );
  check(
    report.currentOperatorApplyCommand === releaseChannelApplyPrivateEnvCommand,
    "external completion run packet current operator sequence should expose private env apply command"
  );
  check(
    report.currentOperatorStrictProofCommand === privateEditStrictProofCommand,
    "external completion run packet current operator sequence should expose strict proof command"
  );
  check(report.currentOperatorPreflightBeforeApply === true, "external completion run packet current operator sequence should place preflight before apply");
  check(report.currentOperatorApplyBeforeStrictProof === true, "external completion run packet current operator sequence should place apply before strict proof");
  check(
    report.currentOperatorBlockerRefreshCommand === "npm run release:current-blocker",
    "external completion run packet current operator sequence should include current-blocker refresh"
  );
  check(
    report.currentOperatorNextActionsRefreshCommand === "npm run release:next-actions",
    "external completion run packet current operator sequence should include next-actions refresh"
  );
  check(report.currentOperatorValueRecorded === false, "external completion run packet current operator sequence should be value-free");
  check(report.releaseChannelRequiredCount === 4, "external completion run packet should track four release-channel metadata keys");
  check(report.updateFeedSelectedRequiredCount === 2, "external completion run packet should track two update feed/channel selected keys");
  check(report.hardGateCommand === "npm run release:external-check", "external completion run packet should cite hard gate command");
  check(report.hardGateReady === false, "external completion run packet should keep hard gate unready");
  check(report.hardGateWouldFail === true, "external completion run packet should keep hard gate would-fail posture");
  check(report.runRowCount === 12, "external completion run packet should include twelve run rows");
  check(report.runRowsValueFree === true, "external completion run packet run rows should be value-free");
  check(
    report.runRows.every((row) => ["ready", "current-blocker", "waiting-for-prerequisite"].includes(row.sequenceStatus)),
    "external completion run packet run rows should include valid sequence statuses"
  );
  check(report.currentBlockedRunRowCount === 1, "external completion run packet should identify exactly one current blocker run row");
  check(report.currentBlockedRunRowSummary !== "none", "external completion run packet should summarize the current blocker run row");
  check(
    report.waitingRunRowCount === report.blockedRunRowCount - report.currentBlockedRunRowCount,
    "external completion run packet waiting count should cover blocked rows after the current blocker"
  );
  check(report.runRows[0]?.phase === "release-channel-metadata", "external completion run packet should start with release-channel metadata");
  check(report.runRows[0]?.sequenceStatus === "current-blocker", "external completion run packet should mark the first incomplete row as current blocker");
  check(report.firstRunCommand === report.runRows[0]?.command, "external completion run packet first run command should match the first run row");
  check(
    report.firstRunMatchesCurrentOperatorFirstCommand === true,
    "external completion run packet first run command should match current operator first command"
  );
  check(
    report.runRows[0]?.command === report.currentOperatorFirstCommand,
    "external completion run packet release-channel row should start with current operator first command"
  );
  check(
    report.runRows[0]?.proofCommand === report.currentOperatorStrictProofCommand,
    "external completion run packet release-channel proof command should match current operator strict proof command"
  );
  check(
    report.runRows[0]?.command !== privateEditStrictProofCommand,
    "external completion run packet should not use the strict proof command as the first operator command while release-channel metadata is blocked"
  );
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
  check(markdown.includes("## Current Operator Command Sequence"), "external completion run packet Markdown should include current operator command sequence");
  check(markdown.includes("Current blocker run rows"), "external completion run packet Markdown should include current blocker row summary");
  check(markdown.includes("External distribution claimed: no"), "external completion run packet Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const step of activeRefreshCommands) {
  console.log(`Refreshing release external completion run packet evidence: ${step.command}`);
  runNpmScript(step.command);
}

const [completionSummaryRefresh, completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket] = await Promise.all([
  fromExistingCompletionSummary ? Promise.resolve(null) : readJsonRequired(completionSummaryRefreshJsonPath, "release completion summary refresh"),
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
console.log(`- Current operator command sequence ready: ${report.currentOperatorCommandSequenceReady ? "yes" : "no"}`);
console.log(`- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})`);
console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
console.log(`- First run matches current operator first command: ${report.firstRunMatchesCurrentOperatorFirstCommand ? "yes" : "no"}`);
console.log(`- Current operator preflight before apply: ${report.currentOperatorPreflightBeforeApply ? "yes" : "no"}`);
console.log(`- Current operator apply before strict proof: ${report.currentOperatorApplyBeforeStrictProof ? "yes" : "no"}`);
console.log(`- Run rows: ${report.runRowCount}`);
console.log(`- Blocked run rows: ${report.blockedRunRowCount} (${report.blockedRunRowSummary})`);
console.log(`- Current blocker run rows: ${report.currentBlockedRunRowCount} (${report.currentBlockedRunRowSummary})`);
console.log(`- Waiting run rows: ${report.waitingRunRowCount} (${report.waitingRunRowSummary})`);
console.log(`- Hard gate command: ${report.hardGateCommand}`);
console.log(`- Hard gate ready: ${report.hardGateReady ? "yes" : "no"}`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
