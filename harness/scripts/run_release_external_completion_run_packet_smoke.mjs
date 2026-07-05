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
const setupWizardStem = "release-channel-setup-wizard";
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
const setupWizardJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${setupWizardStem}.json`);
const updateFeedPacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${updateFeedPacketStem}.json`);
const updateMetadataPacketJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${updateMetadataPacketStem}.json`
);
const developerIdPacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${developerIdPacketStem}.json`);
const failures = [];
const releaseChannelPrivateInputTemplateCommand = "npm run release:channel-private-input-template";
const releaseChannelPrivateInputTemplateRole =
  "create the ignored .env.release-channel.local skeleton for the four private release-channel metadata values before preflight";
const releaseChannelApplyPrivateEnvPreflightCommand = "npm run release:channel-apply-private-env-preflight";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
const releaseChannelApplyPrivateEnvProofCommand = "npm run release:channel-apply-private-env-proof";
const releaseChannelApplyPrivateEnvProofRole =
  "run private env preflight, apply only after preflight readiness, strict proof, and completion readout as one value-free operator proof runner";
const releaseChannelSetupWizardCommand = "npm run release:channel-setup-wizard";
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
    command: releaseChannelSetupWizardCommand,
    role: "refresh the value-free setup wizard Operator Handoff for the current private release-channel metadata blocker",
    allowBlockedExit: true,
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:update-feed-edit-packet-smoke",
    role: "refresh the value-free update feed/channel edit packet for the post-clearance auto-update step",
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run release:update-metadata-publish-packet-smoke",
    role: "refresh the value-free update metadata publish packet and signed metadata blockers",
    valueRecorded: false
  },
  {
    order: 5,
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

function buildOperatorUnblockAliasRows(fields) {
  return [
    {
      order: 1,
      label: "receipt-ready",
      value: readyLabel(fields.receiptReady),
      source: "external-completion-run-packet",
      valueRecorded: false
    },
    {
      order: 2,
      label: "current-blocker",
      value: fields.currentBlockerAlias,
      source: "completion-summary",
      valueRecorded: false
    },
    {
      order: 3,
      label: "broad-next-command",
      value: fields.broadNextCommandAlias,
      source: "completion-summary",
      valueRecorded: false
    },
    {
      order: 4,
      label: "first-command",
      value: fields.firstCommandAlias,
      source: "current-operator-sequence",
      valueRecorded: false
    },
    {
      order: 5,
      label: "start-command",
      value: fields.startCommandAlias,
      source: "current-operator-sequence",
      valueRecorded: false
    },
    {
      order: 6,
      label: "start-command-role",
      value: fields.startCommandRoleAlias,
      source: "current-operator-sequence",
      valueRecorded: false
    },
    {
      order: 7,
      label: "private-input-edit-target",
      value: fields.privateInputEditTarget,
      source: "setup-wizard",
      valueRecorded: false
    },
    {
      order: 8,
      label: "expected-shape-summary",
      value: fields.expectedShapeSummary,
      source: "setup-wizard",
      valueRecorded: false
    },
    {
      order: 9,
      label: "private-input-template-command",
      value: fields.privateInputTemplateCommandAlias,
      source: "completion-summary",
      valueRecorded: false
    },
    {
      order: 10,
      label: "private-input-template-default-path",
      value: fields.privateInputTemplateDefaultPathAlias,
      source: "completion-summary",
      valueRecorded: false
    },
    {
      order: 11,
      label: "preflight-command",
      value: fields.preflightCommandAlias,
      source: "current-operator-sequence",
      valueRecorded: false
    },
    {
      order: 12,
      label: "apply-command",
      value: fields.applyCommandAlias,
      source: "current-operator-sequence",
      valueRecorded: false
    },
    {
      order: 13,
      label: "strict-proof-command",
      value: fields.strictProofCommandAlias,
      source: "current-operator-sequence",
      valueRecorded: false
    },
    {
      order: 14,
      label: "blocker-refresh-command",
      value: fields.blockerRefreshCommandAlias,
      source: "current-operator-sequence",
      valueRecorded: false
    },
    {
      order: 15,
      label: "next-actions-refresh-command",
      value: fields.nextActionsRefreshCommandAlias,
      source: "current-operator-sequence",
      valueRecorded: false
    },
    {
      order: 16,
      label: "guided-setup-fallback-command",
      value: fields.guidedSetupFallbackCommandAlias,
      source: "completion-summary",
      valueRecorded: false
    },
    {
      order: 17,
      label: "placeholder-location-summary",
      value: fields.placeholderLocationSummary,
      source: "current-private-input-placeholder-locations",
      valueRecorded: false
    }
  ];
}

function copyCurrentPrivateInputPlaceholderLocationRow(row) {
  return {
    key: textValue(row.key),
    file: textValue(row.file),
    line: integerValue(row.line),
    location: textValue(row.location),
    placeholder: row.placeholder === true,
    valueRecorded: false
  };
}

function copySetupWizardHandoffRow(row) {
  return {
    order: integerValue(row.order),
    action: textValue(row.action),
    command: textValue(row.command),
    target: textValue(row.target),
    ready: row.ready === true,
    expected: textValue(row.expected),
    valueRecorded: false
  };
}

function setupWizardHandoffRowsReady(rows) {
  const commands = rows.map((row) => row.command);
  return (
    rows.length === 6 &&
    rows.every((row) => row.valueRecorded === false) &&
    commands.includes("edit ignored private input file") &&
    commands.includes(releaseChannelApplyPrivateEnvPreflightCommand) &&
    commands.includes(releaseChannelApplyPrivateEnvCommand) &&
    commands.includes("npm run release:channel-live-check-strict") &&
    commands.includes(privateEditStrictProofCommand) &&
    commands.includes("npm run release:current-blocker")
  );
}

function buildSetupWizardMirrorFields(setupWizard) {
  const handoffRows = objectRows(setupWizard.operatorHandoffRows).map(copySetupWizardHandoffRow);
  const handoffRowsReady = setupWizardHandoffRowsReady(handoffRows);
  return {
    realSetupWizardReceiptReady:
      setupWizard.reportCommand === releaseChannelSetupWizardCommand &&
      setupWizard.operatorHandoffReady === true &&
      handoffRowsReady &&
      setupWizard.privateValuesRecorded === false &&
      setupWizard.valueRecorded === false &&
      setupWizard.networkProbeAttempted === false &&
      setupWizard.releaseUploadAttempted === false &&
      setupWizard.notarySubmissionAttempted === false &&
      setupWizard.signingAttempted === false &&
      setupWizard.releaseGateClaimedExternalDistribution === false,
    realSetupWizardCommand: releaseChannelSetupWizardCommand,
    realSetupWizardInputReady: setupWizard.inputReady === true,
    realSetupWizardLocalEnvFileLoaded: setupWizard.localEnvFileLoaded === true,
    realSetupWizardPrivateInputFilePresent: setupWizard.privateInputFilePresent === true,
    realSetupWizardPrivateInputFileLoadedKeyCount: integerValue(setupWizard.privateInputFileLoadedKeyCount),
    realSetupWizardPrivateInputFileLoadedKeySummary: textValue(setupWizard.privateInputFileLoadedKeySummary),
    realSetupWizardPrivateInputFileLocationRowCount: integerValue(setupWizard.privateInputFileLocationRowCount),
    realSetupWizardPrivateInputFilePlaceholderLocationSummary: textValue(
      setupWizard.privateInputFilePlaceholderLocationSummary
    ),
    realSetupWizardPrivateInputFileInvalidShapeLocationSummary: textValue(
      setupWizard.privateInputFileInvalidShapeLocationSummary
    ),
    realSetupWizardPrivateInputFileMissingKeyLocationSummary: textValue(
      setupWizard.privateInputFileMissingKeyLocationSummary
    ),
    realSetupWizardOperatorHandoffReady: setupWizard.operatorHandoffReady === true && handoffRowsReady,
    realSetupWizardOperatorHandoffRows: handoffRows,
    realSetupWizardOperatorHandoffRowCount: integerValue(setupWizard.operatorHandoffRowCount),
    realSetupWizardOperatorHandoffSummary: textValue(setupWizard.operatorHandoffSummary),
    realSetupWizardNextPrivateInputEditTargetSummary: textValue(setupWizard.nextPrivateInputEditTargetSummary),
    realSetupWizardNextPrivateInputEditExpectedShapeSummary: textValue(
      setupWizard.nextPrivateInputEditExpectedShapeSummary
    ),
    realSetupWizardNextOperatorCommandAfterPrivateInputEdit: textValue(
      setupWizard.nextOperatorCommandAfterPrivateInputEdit
    ),
    realSetupWizardPreflightReady: setupWizard.preflightReady === true,
    realSetupWizardApplyReady: setupWizard.applyReady === true,
    realSetupWizardStrictLiveCheckReady: setupWizard.strictLiveCheckReady === true,
    realSetupWizardCurrentReadyKeyCount: integerValue(setupWizard.currentReadyKeyCount),
    realSetupWizardCurrentRequiredKeyCount: integerValue(setupWizard.currentRequiredKeyCount),
    realSetupWizardRealLocalEnvRead: setupWizard.realLocalEnvRead === true,
    realSetupWizardRealLocalEnvModified: setupWizard.realLocalEnvModified === true,
    realSetupWizardRecommendedOperatorProofCommand: textValue(
      setupWizard.recommendedOperatorProofCommand,
      privateEditStrictProofCommand
    ),
    realSetupWizardPrivateValuesRecorded: setupWizard.privateValuesRecorded === true,
    realSetupWizardValueRecorded: setupWizard.valueRecorded === true,
    realSetupWizardNetworkProbeAttempted: setupWizard.networkProbeAttempted === true,
    realSetupWizardReleaseUploadAttempted: setupWizard.releaseUploadAttempted === true,
    realSetupWizardNotarySubmissionAttempted: setupWizard.notarySubmissionAttempted === true,
    realSetupWizardSigningAttempted: setupWizard.signingAttempted === true,
    realSetupWizardClaimedExternalDistribution: setupWizard.releaseGateClaimedExternalDistribution === true
  };
}

function commandOrder(rows, command) {
  const row = objectRows(rows).find((item) => item.command === command);
  return integerValue(row?.order);
}

function runNpmScript(command, { allowBlockedExit = false } = {}) {
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
  if (result.status !== 0 && !(allowBlockedExit === true && result.status === 1)) {
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

function buildSourceRows({ completionSummaryRefresh, completionSummary, setupWizard, updateFeedPacket, updateMetadataPacket, developerIdPacket }) {
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
      "release-channel-setup-wizard",
      setupWizardJsonPath,
      buildSetupWizardMirrorFields(setupWizard).realSetupWizardReceiptReady === true,
      releaseChannelSetupWizardCommand
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

function buildReport({ completionSummaryRefresh, completionSummary, setupWizard, updateFeedPacket, updateMetadataPacket, developerIdPacket }) {
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
  const currentOperatorFirstCommand = textValue(completionSummary.currentOperatorFirstCommand);
  const currentOperatorStartCommand = textValue(completionSummary.currentOperatorStartCommand, currentOperatorFirstCommand);
  const currentOperatorStartCommandRole = textValue(
    completionSummary.currentOperatorStartCommandRole,
    currentOperatorCommandRows[0]?.role ?? "none"
  );
  const runRows = buildRunRows({ completionSummary, updateFeedPacket, updateMetadataPacket, developerIdPacket });
  const sourceRows = buildSourceRows({ completionSummaryRefresh, completionSummary, setupWizard, updateFeedPacket, updateMetadataPacket, developerIdPacket });
  const blockedRows = runRows.filter((row) => row.readiness !== "ready");
  const currentBlockedRows = runRows.filter((row) => row.sequenceStatus === "current-blocker");
  const waitingRows = runRows.filter((row) => row.sequenceStatus === "waiting-for-prerequisite");
  const readyRows = runRows.filter((row) => row.sequenceStatus === "ready");
  const completionBlockerActionRows = objectRows(completionSummary.completionBlockerActionRows);
  const completionBlockerFocusRows = objectRows(completionSummary.completionBlockerFocusRows);
  const currentPrivateInputPlaceholderLocations = objectRows(
    completionSummary.currentPrivateInputPlaceholderLocations
  )
    .filter((row) => row.valueRecorded === false)
    .map(copyCurrentPrivateInputPlaceholderLocationRow);
  const setupWizardMirrorFields = buildSetupWizardMirrorFields(setupWizard);
  const operatorUnblockReceiptReady =
    completionSummary.operatorUnblockReceiptReady === true ||
    (completionSummary.currentOperatorCommandSequenceReady === true &&
      setupWizardMirrorFields.realSetupWizardOperatorHandoffReady === true &&
      completionSummary.placeholderInputReceiptReady === true);
  const operatorUnblockCurrentBlockerAlias = textValue(
    completionSummary.operatorUnblockCurrentBlockerAlias,
    textValue(completionSummary.currentFirstBlockerAlias, textValue(completionSummary.firstBlocker))
  );
  const operatorUnblockBroadNextCommandAlias = textValue(
    completionSummary.operatorUnblockBroadNextCommandAlias,
    textValue(completionSummary.currentNextCommandAlias, textValue(completionSummary.nextCommand))
  );
  const operatorUnblockPrivateInputEditTarget = textValue(
    completionSummary.operatorUnblockPrivateInputEditTarget,
    setupWizardMirrorFields.realSetupWizardNextPrivateInputEditTargetSummary
  );
  const operatorUnblockExpectedShapeSummary = textValue(
    completionSummary.operatorUnblockExpectedShapeSummary,
    setupWizardMirrorFields.realSetupWizardNextPrivateInputEditExpectedShapeSummary
  );
  const operatorUnblockPrivateInputTemplateCommandAlias = textValue(
    completionSummary.operatorUnblockPrivateInputTemplateCommandAlias,
    textValue(completionSummary.releaseChannelPrivateInputTemplateCommand, releaseChannelPrivateInputTemplateCommand)
  );
  const operatorUnblockPrivateInputTemplateDefaultPathAlias = textValue(
    completionSummary.operatorUnblockPrivateInputTemplateDefaultPathAlias,
    textValue(completionSummary.releaseChannelPrivateInputTemplateDefaultPath, ".env.release-channel.local")
  );
  const operatorUnblockGuidedSetupFallbackCommandAlias = textValue(
    completionSummary.operatorUnblockGuidedSetupFallbackCommandAlias,
    textValue(completionSummary.releaseChannelGuidedSetupFallbackCommand, releaseChannelSetupWizardCommand)
  );
  const operatorUnblockPlaceholderLocationCount =
    integerValue(completionSummary.operatorUnblockPlaceholderLocationCount) ||
    integerValue(completionSummary.currentPrivateInputPlaceholderLocationCount);
  const operatorUnblockPlaceholderLocationSummary = textValue(
    completionSummary.operatorUnblockPlaceholderLocationSummary,
    textValue(completionSummary.currentPrivateInputPlaceholderLocationSummary)
  );
  const operatorUnblockAliasRows = buildOperatorUnblockAliasRows({
    receiptReady: operatorUnblockReceiptReady,
    currentBlockerAlias: operatorUnblockCurrentBlockerAlias,
    broadNextCommandAlias: operatorUnblockBroadNextCommandAlias,
    firstCommandAlias: currentOperatorFirstCommand,
    startCommandAlias: currentOperatorStartCommand,
    startCommandRoleAlias: currentOperatorStartCommandRole,
    privateInputEditTarget: operatorUnblockPrivateInputEditTarget,
    expectedShapeSummary: operatorUnblockExpectedShapeSummary,
    privateInputTemplateCommandAlias: operatorUnblockPrivateInputTemplateCommandAlias,
    privateInputTemplateDefaultPathAlias: operatorUnblockPrivateInputTemplateDefaultPathAlias,
    preflightCommandAlias: currentOperatorPreflightCommand,
    applyCommandAlias: currentOperatorApplyCommand,
    strictProofCommandAlias: currentOperatorStrictProofCommand,
    blockerRefreshCommandAlias: textValue(
      completionSummary.currentOperatorBlockerRefreshCommand,
      "npm run release:current-blocker"
    ),
    nextActionsRefreshCommandAlias: textValue(
      completionSummary.currentOperatorNextActionsRefreshCommand,
      "npm run release:next-actions"
    ),
    guidedSetupFallbackCommandAlias: operatorUnblockGuidedSetupFallbackCommandAlias,
    placeholderLocationSummary: operatorUnblockPlaceholderLocationSummary
  });
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
    currentPrivateInputPlaceholderLocationCount: integerValue(
      completionSummary.currentPrivateInputPlaceholderLocationCount
    ),
    currentPrivateInputPlaceholderLocationSummary: textValue(
      completionSummary.currentPrivateInputPlaceholderLocationSummary
    ),
    currentPrivateInputPlaceholderLocations,
    currentPrivateInputReceiptReady: completionSummary.placeholderInputReceiptReady === true,
    currentPrivateInputReceiptMode: textValue(completionSummary.placeholderInputReceiptMode),
    currentPrivateInputReceiptPrivateInputFilePresent:
      completionSummary.placeholderInputReceiptPrivateInputFilePresent === true,
    currentPrivateInputReceiptPrivateInputFileLoadedKeyCount: integerValue(
      completionSummary.placeholderInputReceiptPrivateInputFileLoadedKeyCount
    ),
    currentPrivateInputReceiptPrivateInputFileLoadedKeySummary: textValue(
      completionSummary.placeholderInputReceiptPrivateInputFileLoadedKeySummary
    ),
    currentPrivateInputReceiptPrivateInputFileMissingKeyCount: integerValue(
      completionSummary.placeholderInputReceiptPrivateInputFileMissingKeyCount
    ),
    currentPrivateInputReceiptPrivateInputFileMissingKeySummary: textValue(
      completionSummary.placeholderInputReceiptPrivateInputFileMissingKeySummary
    ),
    currentPrivateInputReceiptPrivateInputFilePlaceholderKeyCount: integerValue(
      completionSummary.placeholderInputReceiptPrivateInputFilePlaceholderKeyCount
    ),
    currentPrivateInputReceiptPrivateInputFilePlaceholderKeySummary: textValue(
      completionSummary.placeholderInputReceiptPrivateInputFilePlaceholderKeySummary
    ),
    currentPrivateInputReceiptPrivateInputFileInvalidShapeKeyCount: integerValue(
      completionSummary.placeholderInputReceiptPrivateInputFileInvalidShapeKeyCount
    ),
    currentPrivateInputReceiptPrivateInputFileInvalidShapeKeySummary: textValue(
      completionSummary.placeholderInputReceiptPrivateInputFileInvalidShapeKeySummary
    ),
    currentPrivateInputReceiptPrivateInputFilePlaceholderLocationCount: integerValue(
      completionSummary.placeholderInputReceiptPrivateInputFilePlaceholderLocationCount
    ),
    currentPrivateInputReceiptPrivateInputFilePlaceholderLocationSummary: textValue(
      completionSummary.placeholderInputReceiptPrivateInputFilePlaceholderLocationSummary
    ),
    currentPrivateInputReceiptRowCount: integerValue(completionSummary.placeholderInputReceiptRowCount),
    currentPrivateInputReceiptCommandRowCount: integerValue(completionSummary.placeholderInputReceiptCommandRowCount),
    currentPrivateInputReceiptNextOperatorCommand: textValue(completionSummary.placeholderInputReceiptNextOperatorCommand),
    currentPrivateInputReceiptNextProofCommand: textValue(completionSummary.placeholderInputReceiptNextProofCommand),
    currentPrivateInputReceiptValueRecorded:
      completionSummary.placeholderInputReceiptValueRecorded === true ? true : false,
    realOperatorPreflightReceiptReady: completionSummary.realOperatorPreflightReceiptReady === true,
    realOperatorPreflightCommand: textValue(completionSummary.realOperatorPreflightCommand),
    realOperatorPreflightRole: textValue(completionSummary.realOperatorPreflightRole),
    realOperatorPreflightExitStatus: integerValue(completionSummary.realOperatorPreflightExitStatus),
    realOperatorPreflightPreflightOnly: completionSummary.realOperatorPreflightPreflightOnly === true,
    realOperatorPreflightSourcePreflightReady:
      completionSummary.realOperatorPreflightSourcePreflightReady === true,
    realOperatorPreflightSourceApplyReady: completionSummary.realOperatorPreflightSourceApplyReady === true,
    realOperatorPreflightLocalEnvFileLoaded:
      completionSummary.realOperatorPreflightLocalEnvFileLoaded === true,
    realOperatorPreflightLocalEnvModified:
      completionSummary.realOperatorPreflightLocalEnvModified === true,
    realOperatorPreflightRealLocalEnvModified:
      completionSummary.realOperatorPreflightRealLocalEnvModified === true,
    realOperatorPreflightCurrentEnvEditTarget: textValue(
      completionSummary.realOperatorPreflightCurrentEnvEditTarget,
      ".env.distribution.local"
    ),
    realOperatorPreflightCurrentFirstBlocker: textValue(
      completionSummary.realOperatorPreflightCurrentFirstBlocker
    ),
    realOperatorPreflightCurrentReadyKeyCount: integerValue(
      completionSummary.realOperatorPreflightCurrentReadyKeyCount
    ),
    realOperatorPreflightCurrentRequiredKeyCount: integerValue(
      completionSummary.realOperatorPreflightCurrentRequiredKeyCount
    ),
    realOperatorPreflightPrivateInputFileKey: textValue(
      completionSummary.realOperatorPreflightPrivateInputFileKey
    ),
    realOperatorPreflightPrivateInputFileDefaultName: textValue(
      completionSummary.realOperatorPreflightPrivateInputFileDefaultName
    ),
    realOperatorPreflightPrivateInputFilePath: textValue(
      completionSummary.realOperatorPreflightPrivateInputFilePath
    ),
    realOperatorPreflightPrivateInputFilePresent:
      completionSummary.realOperatorPreflightPrivateInputFilePresent === true,
    realOperatorPreflightPrivateInputFileConfigured:
      completionSummary.realOperatorPreflightPrivateInputFileConfigured === true,
    realOperatorPreflightPrivateInputFileLoadedKeyCount: integerValue(
      completionSummary.realOperatorPreflightPrivateInputFileLoadedKeyCount
    ),
    realOperatorPreflightPrivateInputFileLoadedKeySummary: textValue(
      completionSummary.realOperatorPreflightPrivateInputFileLoadedKeySummary
    ),
    realOperatorPreflightPrivateInputFileUnknownKeyCount: integerValue(
      completionSummary.realOperatorPreflightPrivateInputFileUnknownKeyCount
    ),
    realOperatorPreflightPrivateInputFileMalformedLineCount: integerValue(
      completionSummary.realOperatorPreflightPrivateInputFileMalformedLineCount
    ),
    realOperatorPreflightPrivateInputFileValueRecorded:
      completionSummary.realOperatorPreflightPrivateInputFileValueRecorded === true ? true : false,
    realOperatorPreflightInputReadyKeyCount: integerValue(
      completionSummary.realOperatorPreflightInputReadyKeyCount
    ),
    realOperatorPreflightInputMissingKeyCount: integerValue(
      completionSummary.realOperatorPreflightInputMissingKeyCount
    ),
    realOperatorPreflightInputPlaceholderKeyCount: integerValue(
      completionSummary.realOperatorPreflightInputPlaceholderKeyCount
    ),
    realOperatorPreflightInputShapeInvalidKeyCount: integerValue(
      completionSummary.realOperatorPreflightInputShapeInvalidKeyCount
    ),
    realOperatorPreflightProcessEnvInputRowCount: integerValue(
      completionSummary.realOperatorPreflightProcessEnvInputRowCount
    ),
    realOperatorPreflightProcessEnvInputRowsValueFree:
      completionSummary.realOperatorPreflightProcessEnvInputRowsValueFree === true,
    realOperatorPreflightRemediationRowCount: integerValue(
      completionSummary.realOperatorPreflightRemediationRowCount
    ),
    realOperatorPreflightRemediationRowsValueFree:
      completionSummary.realOperatorPreflightRemediationRowsValueFree === true,
    realOperatorPreflightOperatorReceiptReady:
      completionSummary.realOperatorPreflightOperatorReceiptReady === true,
    realOperatorPreflightOperatorReceiptRowCount: integerValue(
      completionSummary.realOperatorPreflightOperatorReceiptRowCount
    ),
    realOperatorPreflightOperatorReceiptRowsValueFree:
      completionSummary.realOperatorPreflightOperatorReceiptRowsValueFree === true,
    realOperatorPreflightNextWriteCommand: textValue(
      completionSummary.realOperatorPreflightNextWriteCommand
    ),
    realOperatorPreflightGuidedSetupFallbackCommand: textValue(
      completionSummary.realOperatorPreflightGuidedSetupFallbackCommand
    ),
    realOperatorPreflightRecommendedOperatorProofCommand: textValue(
      completionSummary.realOperatorPreflightRecommendedOperatorProofCommand
    ),
    realOperatorPreflightHardGateCommand: textValue(
      completionSummary.realOperatorPreflightHardGateCommand,
      "npm run release:external-check"
    ),
    realOperatorPreflightPrivateValuesRecorded:
      completionSummary.realOperatorPreflightPrivateValuesRecorded === true ? true : false,
    realOperatorPreflightClaimedExternalDistribution:
      completionSummary.realOperatorPreflightClaimedExternalDistribution === true ? true : false,
    ...setupWizardMirrorFields,
    currentOperatorCommandSequenceReady: completionSummary.currentOperatorCommandSequenceReady === true,
    currentOperatorCommandRows,
    currentOperatorCommandRowCount: integerValue(completionSummary.currentOperatorCommandRowCount),
    currentOperatorCommandSummary: textValue(completionSummary.currentOperatorCommandSummary),
    currentOperatorFirstCommand,
    currentOperatorStartCommand,
    currentOperatorStartCommandRole,
    currentOperatorStartCommandMatchesFirstCommand:
      completionSummary.currentOperatorStartCommandMatchesFirstCommand === true ||
      currentOperatorStartCommand === currentOperatorFirstCommand,
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
    currentOperatorStartCommandValueRecorded:
      completionSummary.currentOperatorStartCommandValueRecorded === true ? true : false,
    currentOperatorValueRecorded: completionSummary.currentOperatorValueRecorded === true ? true : false,
    operatorUnblockAliasRows,
    operatorUnblockAliasRowCount: operatorUnblockAliasRows.length,
    operatorUnblockAliasRowSummary: operatorUnblockAliasRows.map((row) => row.label).join(", "),
    operatorUnblockAliasRowsValueFree: valueFreeRows(operatorUnblockAliasRows),
    operatorUnblockReceiptReady,
    operatorUnblockCommandSequenceReady: completionSummary.currentOperatorCommandSequenceReady === true,
    operatorUnblockSetupWizardHandoffReady: setupWizardMirrorFields.realSetupWizardOperatorHandoffReady === true,
    operatorUnblockPrivateInputReceiptReady: completionSummary.placeholderInputReceiptReady === true,
    operatorUnblockCurrentBlockerAlias,
    operatorUnblockBroadNextCommandAlias,
    operatorUnblockFirstCommandAlias: currentOperatorFirstCommand,
    operatorUnblockStartCommandAlias: currentOperatorStartCommand,
    operatorUnblockStartCommandRoleAlias: currentOperatorStartCommandRole,
    operatorUnblockPrivateInputEditTarget,
    operatorUnblockExpectedShapeSummary,
    operatorUnblockPrivateInputTemplateCommandAlias,
    operatorUnblockPrivateInputTemplateDefaultPathAlias,
    operatorUnblockPreflightCommandAlias: currentOperatorPreflightCommand,
    operatorUnblockApplyCommandAlias: currentOperatorApplyCommand,
    operatorUnblockStrictProofCommandAlias: currentOperatorStrictProofCommand,
    operatorUnblockBlockerRefreshCommandAlias: textValue(
      completionSummary.currentOperatorBlockerRefreshCommand,
      "npm run release:current-blocker"
    ),
    operatorUnblockNextActionsRefreshCommandAlias: textValue(
      completionSummary.currentOperatorNextActionsRefreshCommand,
      "npm run release:next-actions"
    ),
    operatorUnblockGuidedSetupFallbackCommandAlias,
    operatorUnblockPlaceholderLocationCount,
    operatorUnblockPlaceholderLocationSummary,
    operatorUnblockValueRecorded: false,
    releaseChannelPrivateEnvApplyProofCommand: textValue(completionSummary.releaseChannelPrivateEnvApplyProofCommand, releaseChannelApplyPrivateEnvProofCommand),
    releaseChannelPrivateEnvApplyProofRole: textValue(completionSummary.releaseChannelPrivateEnvApplyProofRole, releaseChannelApplyPrivateEnvProofRole),
    releaseChannelPrivateEnvApplyProofAfterPreflight:
      completionSummary.releaseChannelPrivateEnvApplyProofAfterPreflight === true ||
      textValue(completionSummary.releaseChannelPrivateEnvApplyProofCommand, releaseChannelApplyPrivateEnvProofCommand) === releaseChannelApplyPrivateEnvProofCommand,
    releaseChannelPrivateEnvApplyProofValueRecorded: completionSummary.releaseChannelPrivateEnvApplyProofValueRecorded === true ? true : false,
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
      ".env.release-channel.local"
    ),
    releaseChannelPrivateInputTemplatePrivateInputFileKey: textValue(
      completionSummary.releaseChannelPrivateInputTemplatePrivateInputFileKey,
      "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE"
    ),
    releaseChannelPrivateInputTemplateBeforePreflight:
      completionSummary.releaseChannelPrivateInputTemplateBeforePreflight === true,
    releaseChannelPrivateInputTemplateValueRecorded:
      completionSummary.releaseChannelPrivateInputTemplateValueRecorded === true ? true : false,
    firstRunCommand: textValue(runRows[0]?.command),
    firstRunMatchesCurrentOperatorFirstCommand:
      textValue(runRows[0]?.command) !== "none" && textValue(runRows[0]?.command) === currentOperatorFirstCommand,
    firstRunMatchesCurrentOperatorStartCommand:
      textValue(runRows[0]?.command) !== "none" && textValue(runRows[0]?.command) === currentOperatorStartCommand,
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

function formatOperatorUnblockAliasRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.label)} | ${escapeCell(row.value)} | ${escapeCell(row.source)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCurrentPrivateInputPlaceholderLocationRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.key)} | ${escapeCell(row.file)} | ${integerValue(row.line)} | ${escapeCell(row.location)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatSetupWizardHandoffRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.action)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.target)} | ${readyLabel(row.ready)} | ${escapeCell(row.expected)} | ${readyLabel(row.valueRecorded)} |`
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
- Current private input placeholder locations: ${report.currentPrivateInputPlaceholderLocationCount} (${report.currentPrivateInputPlaceholderLocationSummary})
- Current private input receipt: ${readyLabel(report.currentPrivateInputReceiptReady)} (${report.currentPrivateInputReceiptMode})
- Current private input file present: ${readyLabel(report.currentPrivateInputReceiptPrivateInputFilePresent)}
- Current private input loaded keys: ${report.currentPrivateInputReceiptPrivateInputFileLoadedKeyCount} (${report.currentPrivateInputReceiptPrivateInputFileLoadedKeySummary})
- Current private input missing/placeholder/invalid rows: ${report.currentPrivateInputReceiptPrivateInputFileMissingKeyCount}/${report.currentPrivateInputReceiptPrivateInputFilePlaceholderKeyCount}/${report.currentPrivateInputReceiptPrivateInputFileInvalidShapeKeyCount}
- Current private input receipt next operator command: \`${report.currentPrivateInputReceiptNextOperatorCommand}\`
- Real operator preflight receipt: ${readyLabel(report.realOperatorPreflightReceiptReady)} (exit ${report.realOperatorPreflightExitStatus})
- Real operator preflight ready: ${readyLabel(report.realOperatorPreflightSourcePreflightReady)}
- Real operator private input file present: ${readyLabel(report.realOperatorPreflightPrivateInputFilePresent)}
- Real operator private input loaded keys: ${report.realOperatorPreflightPrivateInputFileLoadedKeyCount} (${report.realOperatorPreflightPrivateInputFileLoadedKeySummary})
- Real operator input ready/missing/placeholder/invalid rows: ${report.realOperatorPreflightInputReadyKeyCount}/${report.realOperatorPreflightInputMissingKeyCount}/${report.realOperatorPreflightInputPlaceholderKeyCount}/${report.realOperatorPreflightInputShapeInvalidKeyCount}
- Real operator next write command: \`${report.realOperatorPreflightNextWriteCommand}\`
- Real setup wizard receipt ready: ${readyLabel(report.realSetupWizardReceiptReady)}
- Real setup wizard handoff ready: ${readyLabel(report.realSetupWizardOperatorHandoffReady)}
- Real setup wizard handoff rows: ${report.realSetupWizardOperatorHandoffRowCount} (${report.realSetupWizardOperatorHandoffSummary})
- Real setup wizard next private input edit target: ${report.realSetupWizardNextPrivateInputEditTargetSummary}
- Real setup wizard next operator command: \`${report.realSetupWizardNextOperatorCommandAfterPrivateInputEdit}\`
- Current operator command sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Current operator start command: \`${report.currentOperatorStartCommand}\`
- Current operator start command role: ${report.currentOperatorStartCommandRole}
- Current operator start command matches first command: ${readyLabel(report.currentOperatorStartCommandMatchesFirstCommand)}
- First run command: \`${report.firstRunCommand}\`
- First run matches current operator first command: ${readyLabel(report.firstRunMatchesCurrentOperatorFirstCommand)}
- First run matches current operator start command: ${readyLabel(report.firstRunMatchesCurrentOperatorStartCommand)}
- Current operator preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Current operator apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Operator unblock aliases ready: ${readyLabel(report.operatorUnblockReceiptReady)}
- Operator unblock first command alias: \`${report.operatorUnblockFirstCommandAlias}\`
- Operator unblock broad next command alias: \`${report.operatorUnblockBroadNextCommandAlias}\`
- Operator unblock private input edit target: ${report.operatorUnblockPrivateInputEditTarget}
- Operator unblock preflight/apply/strict proof: \`${report.operatorUnblockPreflightCommandAlias}\` / \`${report.operatorUnblockApplyCommandAlias}\` / \`${report.operatorUnblockStrictProofCommandAlias}\`
- Private env apply proof runner command: \`${report.releaseChannelPrivateEnvApplyProofCommand}\`
- Private env apply proof runner after preflight: ${readyLabel(report.releaseChannelPrivateEnvApplyProofAfterPreflight)}
- Private input template command: \`${report.releaseChannelPrivateInputTemplateCommand}\`
- Private input template default path: \`${report.releaseChannelPrivateInputTemplateDefaultPath}\`
- Private input template before preflight: ${readyLabel(report.releaseChannelPrivateInputTemplateBeforePreflight)}
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
- Start command: \`${report.currentOperatorStartCommand}\`
- Start command role: ${report.currentOperatorStartCommandRole}
- Start command matches first command: ${readyLabel(report.currentOperatorStartCommandMatchesFirstCommand)}
- Preflight command: \`${report.currentOperatorPreflightCommand}\`
- Apply command: \`${report.currentOperatorApplyCommand}\`
- Strict proof command: \`${report.currentOperatorStrictProofCommand}\`
- Current-blocker refresh command: \`${report.currentOperatorBlockerRefreshCommand}\`
- Next-actions refresh command: \`${report.currentOperatorNextActionsRefreshCommand}\`
- Preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Private env apply proof runner command: \`${report.releaseChannelPrivateEnvApplyProofCommand}\`
- Private env apply proof runner role: ${report.releaseChannelPrivateEnvApplyProofRole}
- Private env apply proof runner after preflight: ${readyLabel(report.releaseChannelPrivateEnvApplyProofAfterPreflight)}
- Value recorded: ${readyLabel(report.currentOperatorValueRecorded)}

| order | command | role | ready | value recorded |
|---:|---|---|---:|---:|
${formatCurrentOperatorCommandRows(report.currentOperatorCommandRows)}

## Operator Unblock Aliases

- Aliases ready: ${readyLabel(report.operatorUnblockReceiptReady)}
- Command sequence ready: ${readyLabel(report.operatorUnblockCommandSequenceReady)}
- Setup wizard handoff ready: ${readyLabel(report.operatorUnblockSetupWizardHandoffReady)}
- Private input receipt ready: ${readyLabel(report.operatorUnblockPrivateInputReceiptReady)}
- Current blocker alias: ${report.operatorUnblockCurrentBlockerAlias}
- Broad next command alias: \`${report.operatorUnblockBroadNextCommandAlias}\`
- First command alias: \`${report.operatorUnblockFirstCommandAlias}\`
- Start command alias: \`${report.operatorUnblockStartCommandAlias}\`
- Start command role alias: ${report.operatorUnblockStartCommandRoleAlias}
- Private input edit target: ${report.operatorUnblockPrivateInputEditTarget}
- Expected shape summary: ${report.operatorUnblockExpectedShapeSummary}
- Private input template command alias: \`${report.operatorUnblockPrivateInputTemplateCommandAlias}\`
- Private input template default path alias: \`${report.operatorUnblockPrivateInputTemplateDefaultPathAlias}\`
- Preflight command alias: \`${report.operatorUnblockPreflightCommandAlias}\`
- Apply command alias: \`${report.operatorUnblockApplyCommandAlias}\`
- Strict proof command alias: \`${report.operatorUnblockStrictProofCommandAlias}\`
- Blocker refresh command alias: \`${report.operatorUnblockBlockerRefreshCommandAlias}\`
- Next-actions refresh command alias: \`${report.operatorUnblockNextActionsRefreshCommandAlias}\`
- Guided setup fallback command alias: \`${report.operatorUnblockGuidedSetupFallbackCommandAlias}\`
- Placeholder location summary: ${report.operatorUnblockPlaceholderLocationSummary}
- Alias rows value-free: ${readyLabel(report.operatorUnblockAliasRowsValueFree)}

| order | label | value | source | value recorded |
|---:|---|---|---|---:|
${formatOperatorUnblockAliasRows(report.operatorUnblockAliasRows)}

## Current Private Input Placeholder Locations

| key | file | line | location | placeholder | value recorded |
|---|---|---:|---|---:|---:|
${formatCurrentPrivateInputPlaceholderLocationRows(report.currentPrivateInputPlaceholderLocations)}

## Current Private Input Receipt

- Receipt ready: ${readyLabel(report.currentPrivateInputReceiptReady)}
- Receipt mode: ${report.currentPrivateInputReceiptMode}
- Private input file present: ${readyLabel(report.currentPrivateInputReceiptPrivateInputFilePresent)}
- Loaded keys: ${report.currentPrivateInputReceiptPrivateInputFileLoadedKeyCount} (${report.currentPrivateInputReceiptPrivateInputFileLoadedKeySummary})
- Missing keys: ${report.currentPrivateInputReceiptPrivateInputFileMissingKeyCount} (${report.currentPrivateInputReceiptPrivateInputFileMissingKeySummary})
- Placeholder keys: ${report.currentPrivateInputReceiptPrivateInputFilePlaceholderKeyCount} (${report.currentPrivateInputReceiptPrivateInputFilePlaceholderKeySummary})
- Invalid-shape keys: ${report.currentPrivateInputReceiptPrivateInputFileInvalidShapeKeyCount} (${report.currentPrivateInputReceiptPrivateInputFileInvalidShapeKeySummary})
- Placeholder locations: ${report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationCount} (${report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationSummary})
- Receipt rows: ${report.currentPrivateInputReceiptRowCount}
- Command rows: ${report.currentPrivateInputReceiptCommandRowCount}
- Next operator command: \`${report.currentPrivateInputReceiptNextOperatorCommand}\`
- Next proof command: \`${report.currentPrivateInputReceiptNextProofCommand}\`
- Value recorded: ${readyLabel(report.currentPrivateInputReceiptValueRecorded)}

## Real Operator Preflight Receipt

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
- Env edit target: ${report.realOperatorPreflightCurrentEnvEditTarget}
- Current blocker: ${report.realOperatorPreflightCurrentFirstBlocker}
- Current ready keys: ${report.realOperatorPreflightCurrentReadyKeyCount}/${report.realOperatorPreflightCurrentRequiredKeyCount}
- Private input file key: ${report.realOperatorPreflightPrivateInputFileKey}
- Private input file default: ${report.realOperatorPreflightPrivateInputFileDefaultName}
- Private input file path: ${report.realOperatorPreflightPrivateInputFilePath}
- Private input file present: ${readyLabel(report.realOperatorPreflightPrivateInputFilePresent)}
- Private input file configured: ${readyLabel(report.realOperatorPreflightPrivateInputFileConfigured)}
- Private input loaded keys: ${report.realOperatorPreflightPrivateInputFileLoadedKeyCount} (${report.realOperatorPreflightPrivateInputFileLoadedKeySummary})
- Private input unknown/malformed rows: ${report.realOperatorPreflightPrivateInputFileUnknownKeyCount}/${report.realOperatorPreflightPrivateInputFileMalformedLineCount}
- Private input file value recorded: ${readyLabel(report.realOperatorPreflightPrivateInputFileValueRecorded)}
- Input ready/missing/placeholder/invalid rows: ${report.realOperatorPreflightInputReadyKeyCount}/${report.realOperatorPreflightInputMissingKeyCount}/${report.realOperatorPreflightInputPlaceholderKeyCount}/${report.realOperatorPreflightInputShapeInvalidKeyCount}
- Process env input rows: ${report.realOperatorPreflightProcessEnvInputRowCount}
- Process env input rows value-free: ${readyLabel(report.realOperatorPreflightProcessEnvInputRowsValueFree)}
- Remediation rows: ${report.realOperatorPreflightRemediationRowCount}
- Remediation rows value-free: ${readyLabel(report.realOperatorPreflightRemediationRowsValueFree)}
- Operator receipt ready: ${readyLabel(report.realOperatorPreflightOperatorReceiptReady)}
- Operator receipt rows: ${report.realOperatorPreflightOperatorReceiptRowCount}
- Operator receipt rows value-free: ${readyLabel(report.realOperatorPreflightOperatorReceiptRowsValueFree)}
- Next write command: \`${report.realOperatorPreflightNextWriteCommand}\`
- Guided setup fallback command: \`${report.realOperatorPreflightGuidedSetupFallbackCommand}\`
- Recommended proof command: \`${report.realOperatorPreflightRecommendedOperatorProofCommand}\`
- Hard gate command: \`${report.realOperatorPreflightHardGateCommand}\`
- Private values recorded: ${readyLabel(report.realOperatorPreflightPrivateValuesRecorded)}
- External distribution claimed: ${readyLabel(report.realOperatorPreflightClaimedExternalDistribution)}

## Real Setup Wizard Handoff

- Receipt ready: ${readyLabel(report.realSetupWizardReceiptReady)}
- Command: \`${report.realSetupWizardCommand}\`
- Input ready: ${readyLabel(report.realSetupWizardInputReady)}
- Local env loaded: ${readyLabel(report.realSetupWizardLocalEnvFileLoaded)}
- Private input file present: ${readyLabel(report.realSetupWizardPrivateInputFilePresent)}
- Private input file loaded keys: ${report.realSetupWizardPrivateInputFileLoadedKeyCount} (${report.realSetupWizardPrivateInputFileLoadedKeySummary})
- Private input file location rows: ${report.realSetupWizardPrivateInputFileLocationRowCount}
- Private input placeholder locations: ${report.realSetupWizardPrivateInputFilePlaceholderLocationSummary}
- Private input missing key locations: ${report.realSetupWizardPrivateInputFileMissingKeyLocationSummary}
- Private input invalid-shape locations: ${report.realSetupWizardPrivateInputFileInvalidShapeLocationSummary}
- Operator handoff ready: ${readyLabel(report.realSetupWizardOperatorHandoffReady)}
- Operator handoff rows: ${report.realSetupWizardOperatorHandoffRowCount} (${report.realSetupWizardOperatorHandoffSummary})
- Next private input edit target: ${report.realSetupWizardNextPrivateInputEditTargetSummary}
- Next private input expected shape: ${report.realSetupWizardNextPrivateInputEditExpectedShapeSummary}
- Next operator command after private input edit: \`${report.realSetupWizardNextOperatorCommandAfterPrivateInputEdit}\`
- Preflight/apply/strict ready: ${readyLabel(report.realSetupWizardPreflightReady)}/${readyLabel(report.realSetupWizardApplyReady)}/${readyLabel(report.realSetupWizardStrictLiveCheckReady)}
- Current ready rows: ${report.realSetupWizardCurrentReadyKeyCount}/${report.realSetupWizardCurrentRequiredKeyCount}
- Recommended proof command: \`${report.realSetupWizardRecommendedOperatorProofCommand}\`
- Real local env read/modified: ${readyLabel(report.realSetupWizardRealLocalEnvRead)}/${readyLabel(report.realSetupWizardRealLocalEnvModified)}
- Private values recorded: ${readyLabel(report.realSetupWizardPrivateValuesRecorded)}
- External distribution claimed: ${readyLabel(report.realSetupWizardClaimedExternalDistribution)}

| order | action | command | target | ready | expected | value recorded |
|---:|---|---|---|---:|---|---:|
${formatSetupWizardHandoffRows(report.realSetupWizardOperatorHandoffRows)}

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
    check(report.refreshCommandCount === 4, "external completion run packet existing-summary mode should refresh setup wizard plus three downstream packets");
    check(
      report.refreshCommands.map((row) => row.command).join(" -> ") ===
        "npm run release:channel-setup-wizard -> npm run release:update-feed-edit-packet-smoke -> npm run release:update-metadata-publish-packet-smoke -> npm run release:developer-id-operator-packet-smoke",
      "external completion run packet existing-summary mode should keep downstream refresh order"
    );
    check(report.sourceRowCount === 5, "external completion run packet existing-summary mode should include five source rows");
  } else {
    check(report.sourceMode === "refreshed-completion-summary", "external completion run packet should report refreshed completion summary mode");
    check(report.refreshCommandCount === 5, "external completion run packet should refresh five source packets");
    check(
      report.refreshCommands.map((row) => row.command).join(" -> ") ===
        "npm run release:completion-summary-refresh-smoke -> npm run release:channel-setup-wizard -> npm run release:update-feed-edit-packet-smoke -> npm run release:update-metadata-publish-packet-smoke -> npm run release:developer-id-operator-packet-smoke",
      "external completion run packet should keep source refresh order"
    );
    check(report.sourceRowCount === 6, "external completion run packet should include six source rows");
  }
  check(report.sourceRows.every((row) => row.present === true && row.ready === true), "external completion run packet source rows should be present and ready");
  check(report.sourceRowsValueFree === true, "external completion run packet source rows should be value-free");
  check(report.latestPlanNumber > 0, "external completion run packet should include latest plan number");
  check(report.tenPlanTotal === 10, "external completion run packet should keep ten-plan total");
  check(report.completionPercent === 99.999999, "external completion run packet should preserve completion percent");
  check(report.remainingPercent === 0.000001, "external completion run packet should preserve remaining percent");
  check(report.currentEnvEditTarget !== "none", "external completion run packet should expose current env edit target");
  check(
    report.currentPrivateInputPlaceholderLocationCount === report.currentPrivateInputPlaceholderLocations.length,
    "external completion run packet current private input placeholder location count should match locations"
  );
  check(
    report.currentPrivateInputPlaceholderLocations.every((row) => row.valueRecorded === false),
    "external completion run packet current private input placeholder locations should not record values"
  );
  check(
    report.currentPrivateInputPlaceholderLocationCount === 0 ||
      report.currentPrivateInputPlaceholderLocationSummary !== "none",
    "external completion run packet should expose current private input placeholder file/line locations"
  );
  check(report.currentPrivateInputReceiptReady === true, "external completion run packet should expose ready current private input receipt");
  check(
    [
      "missing-private-input-file",
      "incomplete-private-input-file",
      "placeholder-private-input-file",
      "invalid-shape-private-input-file",
      "ready-private-input-file",
      "review-private-input-file"
    ].includes(report.currentPrivateInputReceiptMode),
    "external completion run packet should expose current private input receipt mode"
  );
  check(
    report.currentPrivateInputReceiptRowCount === 4,
    "external completion run packet should expose current private input receipt row count"
  );
  check(
    report.currentPrivateInputReceiptValueRecorded === false,
    "external completion run packet current private input receipt should not record values"
  );
  check(
    report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationCount === 0 ||
      report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationSummary !== "none",
    "external completion run packet should expose current private input receipt placeholder locations"
  );
  if (report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationCount > 0) {
    check(
      report.currentPrivateInputPlaceholderLocationCount ===
        report.currentPrivateInputReceiptPrivateInputFilePlaceholderLocationCount,
      "external completion run packet should promote private input placeholder locations into current blocker handoff"
    );
    check(
      report.currentPrivateInputPlaceholderLocations.every((row) =>
        textValue(row.file).includes(".env.release-channel.local")
      ),
      "external completion run packet promoted private input placeholder rows should point to the ignored private input file"
    );
  }
  check(
    report.currentPrivateInputReceiptNextOperatorCommand !== "none",
    "external completion run packet should expose current private input receipt next operator command"
  );
  check(
    report.realOperatorPreflightReceiptReady === true,
    "external completion run packet should expose ready real operator preflight receipt"
  );
  check(
    report.realOperatorPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand,
    "external completion run packet real operator preflight should cite the preflight command"
  );
  check(
    [0, 1].includes(report.realOperatorPreflightExitStatus),
    "external completion run packet real operator preflight should record success or expected blocked exit"
  );
  check(
    (report.realOperatorPreflightSourcePreflightReady === true && report.realOperatorPreflightExitStatus === 0) ||
      (report.realOperatorPreflightSourcePreflightReady === false && report.realOperatorPreflightExitStatus === 1),
    "external completion run packet real operator preflight readiness should match exit status"
  );
  check(
    report.realOperatorPreflightPreflightOnly === true,
    "external completion run packet real operator preflight should be preflight-only"
  );
  check(
    report.realOperatorPreflightSourceApplyReady === false,
    "external completion run packet real operator preflight should not claim apply completion"
  );
  check(
    report.realOperatorPreflightLocalEnvModified === false &&
      report.realOperatorPreflightRealLocalEnvModified === false,
    "external completion run packet real operator preflight should not modify local env files"
  );
  check(
    report.realOperatorPreflightCurrentRequiredKeyCount === 4,
    "external completion run packet real operator preflight should cover four current keys"
  );
  check(
    report.realOperatorPreflightPrivateInputFileKey !== "none" &&
      report.realOperatorPreflightPrivateInputFileDefaultName === ".env.release-channel.local",
    "external completion run packet real operator preflight should expose private input file key/default"
  );
  check(
    report.realOperatorPreflightPrivateInputFileLoadedKeyCount <=
      report.realOperatorPreflightCurrentRequiredKeyCount,
    "external completion run packet real operator preflight loaded key count should not exceed required keys"
  );
  check(
    report.realOperatorPreflightPrivateInputFileValueRecorded === false,
    "external completion run packet real operator preflight private input file should stay value-free"
  );
  check(
    report.realOperatorPreflightInputReadyKeyCount +
      report.realOperatorPreflightInputMissingKeyCount +
      report.realOperatorPreflightInputPlaceholderKeyCount +
      report.realOperatorPreflightInputShapeInvalidKeyCount ===
      report.realOperatorPreflightCurrentRequiredKeyCount,
    "external completion run packet real operator preflight input counts should cover required keys"
  );
  check(
    report.realOperatorPreflightProcessEnvInputRowCount === 4 &&
      report.realOperatorPreflightProcessEnvInputRowsValueFree === true,
    "external completion run packet real operator preflight process input rows should be value-free"
  );
  check(
    report.realOperatorPreflightRemediationRowCount === 4 &&
      report.realOperatorPreflightRemediationRowsValueFree === true,
    "external completion run packet real operator preflight remediation rows should be value-free"
  );
  check(
    report.realOperatorPreflightOperatorReceiptReady === true &&
      report.realOperatorPreflightOperatorReceiptRowCount === 6 &&
      report.realOperatorPreflightOperatorReceiptRowsValueFree === true,
    "external completion run packet real operator preflight operator receipt should be ready and value-free"
  );
  check(
    report.realOperatorPreflightNextWriteCommand === releaseChannelApplyPrivateEnvCommand,
    "external completion run packet real operator preflight should expose the next write command"
  );
  check(
    report.realOperatorPreflightRecommendedOperatorProofCommand === privateEditStrictProofCommand,
    "external completion run packet real operator preflight should expose the recommended proof command"
  );
  check(
    report.realOperatorPreflightHardGateCommand === "npm run release:external-check",
    "external completion run packet real operator preflight should expose the hard gate command"
  );
  check(
    report.realOperatorPreflightPrivateValuesRecorded === false &&
      report.realOperatorPreflightClaimedExternalDistribution === false,
    "external completion run packet real operator preflight should not record private values or claim external distribution"
  );
  check(report.realSetupWizardReceiptReady === true, "external completion run packet should expose ready real setup wizard evidence");
  check(report.realSetupWizardCommand === releaseChannelSetupWizardCommand, "external completion run packet setup wizard should cite its command");
  check(
    report.realSetupWizardPrivateInputFileLocationRowCount === 4,
    "external completion run packet setup wizard should expose four private input file location rows"
  );
  check(
    report.realSetupWizardOperatorHandoffReady === true,
    "external completion run packet setup wizard operator handoff should be ready"
  );
  check(
    report.realSetupWizardOperatorHandoffRowCount === report.realSetupWizardOperatorHandoffRows.length &&
      report.realSetupWizardOperatorHandoffRowCount === 6,
    "external completion run packet setup wizard should expose six operator handoff rows"
  );
  check(
    setupWizardHandoffRowsReady(report.realSetupWizardOperatorHandoffRows),
    "external completion run packet setup wizard handoff rows should cover edit, preflight, apply, strict proof, full proof, and blocker refresh"
  );
  check(
    report.realSetupWizardNextPrivateInputEditTargetSummary !== "none",
    "external completion run packet setup wizard should expose the next private input edit targets"
  );
  check(
    report.realSetupWizardNextPrivateInputEditExpectedShapeSummary.includes("GROOVEFORGE_DISTRIBUTION_CHANNEL"),
    "external completion run packet setup wizard should expose expected private input shapes"
  );
  check(
    report.realSetupWizardNextOperatorCommandAfterPrivateInputEdit === releaseChannelApplyPrivateEnvPreflightCommand,
    "external completion run packet setup wizard should point the next operator command at preflight"
  );
  check(
    report.realSetupWizardRecommendedOperatorProofCommand === privateEditStrictProofCommand,
    "external completion run packet setup wizard should expose the strict proof command"
  );
  check(
    report.realSetupWizardCurrentRequiredKeyCount === 4,
    "external completion run packet setup wizard should cover four current release-channel keys"
  );
  check(
    report.realSetupWizardRealLocalEnvModified === false,
    "external completion run packet setup wizard should not modify the real local env"
  );
  check(
    report.realSetupWizardPrivateValuesRecorded === false &&
      report.realSetupWizardValueRecorded === false &&
      report.realSetupWizardNetworkProbeAttempted === false &&
      report.realSetupWizardReleaseUploadAttempted === false &&
      report.realSetupWizardNotarySubmissionAttempted === false &&
      report.realSetupWizardSigningAttempted === false &&
      report.realSetupWizardClaimedExternalDistribution === false,
    "external completion run packet setup wizard should stay value-free and non-claiming"
  );
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
  check(report.currentOperatorStartCommand === report.currentOperatorFirstCommand, "external completion run packet current operator start command should mirror first command");
  check(report.currentOperatorStartCommand === report.currentOperatorCommandRows[0]?.command, "external completion run packet current operator start command should match first row command");
  check(report.currentOperatorStartCommandRole === report.currentOperatorCommandRows[0]?.role, "external completion run packet current operator start command role should match first row role");
  check(report.currentOperatorStartCommandMatchesFirstCommand === true, "external completion run packet current operator start command should declare first-command match");
  check(report.currentOperatorStartCommandValueRecorded === false, "external completion run packet current operator start command should be value-free");
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
  check(report.releaseChannelPrivateEnvApplyProofCommand === releaseChannelApplyPrivateEnvProofCommand, "external completion run packet should expose private env apply proof runner command");
  check(report.releaseChannelPrivateEnvApplyProofRole === releaseChannelApplyPrivateEnvProofRole, "external completion run packet should describe private env apply proof runner role");
  check(report.releaseChannelPrivateEnvApplyProofAfterPreflight === true, "external completion run packet should keep proof runner after preflight readiness");
  check(report.releaseChannelPrivateEnvApplyProofValueRecorded === false, "external completion run packet private env apply proof runner command should be value-free");
  check(
    report.releaseChannelPrivateInputTemplateCommand === releaseChannelPrivateInputTemplateCommand,
    "external completion run packet should expose private input template command"
  );
  check(
    report.releaseChannelPrivateInputTemplateRole === releaseChannelPrivateInputTemplateRole,
    "external completion run packet should expose private input template role"
  );
  check(
    report.releaseChannelPrivateInputTemplateDefaultPath === ".env.release-channel.local",
    "external completion run packet should expose private input template default path"
  );
  check(
    report.releaseChannelPrivateInputTemplatePrivateInputFileKey === "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE",
    "external completion run packet should expose private input template file key"
  );
  check(
    report.releaseChannelPrivateInputTemplateBeforePreflight === true,
    "external completion run packet should place private input template before preflight"
  );
  check(
    report.releaseChannelPrivateInputTemplateValueRecorded === false,
    "external completion run packet private input template command should be value-free"
  );
  check(
    report.currentOperatorBlockerRefreshCommand === "npm run release:current-blocker",
    "external completion run packet current operator sequence should include current-blocker refresh"
  );
  check(
    report.currentOperatorNextActionsRefreshCommand === "npm run release:next-actions",
    "external completion run packet current operator sequence should include next-actions refresh"
  );
  check(report.currentOperatorValueRecorded === false, "external completion run packet current operator sequence should be value-free");
  check(report.operatorUnblockReceiptReady === true, "external completion run packet should expose ready operator unblock aliases");
  check(
    report.operatorUnblockCommandSequenceReady === report.currentOperatorCommandSequenceReady,
    "external completion run packet operator unblock aliases should mirror current operator sequence readiness"
  );
  check(
    report.operatorUnblockSetupWizardHandoffReady === report.realSetupWizardOperatorHandoffReady,
    "external completion run packet operator unblock aliases should mirror setup wizard handoff readiness"
  );
  check(
    report.operatorUnblockPrivateInputReceiptReady === report.currentPrivateInputReceiptReady,
    "external completion run packet operator unblock aliases should mirror private input receipt readiness"
  );
  check(
    report.operatorUnblockCurrentBlockerAlias === report.currentFirstBlocker,
    "external completion run packet operator unblock blocker alias should mirror current first blocker"
  );
  check(
    report.operatorUnblockBroadNextCommandAlias === report.currentNextCommand,
    "external completion run packet operator unblock broad next command should mirror current next command"
  );
  check(
    report.operatorUnblockFirstCommandAlias === report.currentOperatorFirstCommand,
    "external completion run packet operator unblock first command should mirror current operator first command"
  );
  check(
    report.operatorUnblockStartCommandAlias === report.currentOperatorStartCommand,
    "external completion run packet operator unblock start command should mirror current operator start command"
  );
  check(
    report.operatorUnblockStartCommandRoleAlias === report.currentOperatorStartCommandRole,
    "external completion run packet operator unblock start command role should mirror current operator role"
  );
  check(
    report.operatorUnblockPrivateInputEditTarget === report.realSetupWizardNextPrivateInputEditTargetSummary,
    "external completion run packet operator unblock edit target should mirror setup wizard private input target"
  );
  check(
    report.operatorUnblockExpectedShapeSummary === report.realSetupWizardNextPrivateInputEditExpectedShapeSummary,
    "external completion run packet operator unblock expected shape should mirror setup wizard private input shape"
  );
  check(
    report.operatorUnblockPrivateInputEditTarget !== "none" &&
      report.operatorUnblockExpectedShapeSummary !== "none",
    "external completion run packet operator unblock aliases should expose concrete private input target and shape"
  );
  check(
    report.operatorUnblockPrivateInputTemplateCommandAlias === report.releaseChannelPrivateInputTemplateCommand,
    "external completion run packet operator unblock template command should mirror private input template command"
  );
  check(
    report.operatorUnblockPrivateInputTemplateDefaultPathAlias === report.releaseChannelPrivateInputTemplateDefaultPath,
    "external completion run packet operator unblock template path should mirror private input template path"
  );
  check(
    report.operatorUnblockPreflightCommandAlias === report.currentOperatorPreflightCommand,
    "external completion run packet operator unblock preflight command should mirror current operator preflight"
  );
  check(
    report.operatorUnblockApplyCommandAlias === report.currentOperatorApplyCommand,
    "external completion run packet operator unblock apply command should mirror current operator apply"
  );
  check(
    report.operatorUnblockStrictProofCommandAlias === report.currentOperatorStrictProofCommand,
    "external completion run packet operator unblock strict proof should mirror current operator strict proof"
  );
  check(
    report.operatorUnblockBlockerRefreshCommandAlias === report.currentOperatorBlockerRefreshCommand,
    "external completion run packet operator unblock blocker refresh should mirror current operator blocker refresh"
  );
  check(
    report.operatorUnblockNextActionsRefreshCommandAlias === report.currentOperatorNextActionsRefreshCommand,
    "external completion run packet operator unblock next-actions refresh should mirror current operator next-actions refresh"
  );
  check(
    report.operatorUnblockGuidedSetupFallbackCommandAlias === report.realOperatorPreflightGuidedSetupFallbackCommand ||
      report.operatorUnblockGuidedSetupFallbackCommandAlias === releaseChannelSetupWizardCommand,
    "external completion run packet operator unblock guided setup fallback should mirror available guided setup command"
  );
  check(
    report.operatorUnblockPlaceholderLocationCount === report.currentPrivateInputPlaceholderLocationCount,
    "external completion run packet operator unblock placeholder count should mirror current private input placeholder count"
  );
  check(
    report.operatorUnblockPlaceholderLocationSummary === report.currentPrivateInputPlaceholderLocationSummary,
    "external completion run packet operator unblock placeholder summary should mirror current private input placeholder summary"
  );
  check(
    report.operatorUnblockAliasRowCount === report.operatorUnblockAliasRows.length &&
      report.operatorUnblockAliasRowCount >= 17,
    "external completion run packet operator unblock alias rows should be complete"
  );
  check(
    report.operatorUnblockAliasRowsValueFree === true &&
      report.operatorUnblockValueRecorded === false &&
      report.operatorUnblockAliasRows.every((row) => row.valueRecorded === false),
    "external completion run packet operator unblock aliases should be value-free"
  );
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
    report.firstRunMatchesCurrentOperatorStartCommand === true,
    "external completion run packet first run command should match current operator start command"
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
  check(markdown.includes("Private input template command:"), "external completion run packet Markdown should include private input template command");
  check(markdown.includes("Private env apply proof runner command:"), "external completion run packet Markdown should include private env apply proof runner command");
  check(markdown.includes("## External Completion Run Rows"), "external completion run packet Markdown should include run rows");
  check(markdown.includes("## Current Operator Command Sequence"), "external completion run packet Markdown should include current operator command sequence");
  check(markdown.includes("Current operator start command:"), "external completion run packet Markdown should include current operator start command");
  check(markdown.includes("First run matches current operator start command:"), "external completion run packet Markdown should include first-run/start-command match");
  check(markdown.includes("Operator unblock aliases ready:"), "external completion run packet Markdown should include operator unblock summary");
  check(markdown.includes("## Operator Unblock Aliases"), "external completion run packet Markdown should include operator unblock aliases section");
  check(markdown.includes("Private input edit target:"), "external completion run packet Markdown should include operator unblock private input target");
  check(markdown.includes("Preflight command alias:"), "external completion run packet Markdown should include operator unblock preflight command");
  check(markdown.includes("Strict proof command alias:"), "external completion run packet Markdown should include operator unblock strict proof command");
  check(markdown.includes("Current private input placeholder locations:"), "external completion run packet Markdown should include current private input placeholder locations");
  check(markdown.includes("Current Private Input Placeholder Locations"), "external completion run packet Markdown should include current private input placeholder location rows");
  check(markdown.includes("Current private input receipt:"), "external completion run packet Markdown should include current private input receipt summary");
  check(markdown.includes("Current Private Input Receipt"), "external completion run packet Markdown should include current private input receipt section");
  check(markdown.includes("Real operator preflight receipt:"), "external completion run packet Markdown should include real operator preflight summary");
  check(markdown.includes("Real Operator Preflight Receipt"), "external completion run packet Markdown should include real operator preflight section");
  check(markdown.includes("Real setup wizard receipt ready:"), "external completion run packet Markdown should include setup wizard summary");
  check(markdown.includes("Real Setup Wizard Handoff"), "external completion run packet Markdown should include setup wizard handoff section");
  check(markdown.includes("Next private input edit target:"), "external completion run packet Markdown should include setup wizard edit target");
  check(markdown.includes("Current blocker run rows"), "external completion run packet Markdown should include current blocker row summary");
  check(markdown.includes("External distribution claimed: no"), "external completion run packet Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const step of activeRefreshCommands) {
  console.log(`Refreshing release external completion run packet evidence: ${step.command}`);
  runNpmScript(step.command, { allowBlockedExit: step.allowBlockedExit === true });
}

const [completionSummaryRefresh, completionSummary, setupWizard, updateFeedPacket, updateMetadataPacket, developerIdPacket] = await Promise.all([
  fromExistingCompletionSummary ? Promise.resolve(null) : readJsonRequired(completionSummaryRefreshJsonPath, "release completion summary refresh"),
  readJsonRequired(completionSummaryJsonPath, "release completion summary"),
  readJsonRequired(setupWizardJsonPath, "release-channel setup wizard"),
  readJsonRequired(updateFeedPacketJsonPath, "release update feed edit packet"),
  readJsonRequired(updateMetadataPacketJsonPath, "release update metadata publish packet"),
  readJsonRequired(developerIdPacketJsonPath, "release Developer ID operator packet")
]);

const report = buildReport({ completionSummaryRefresh, completionSummary, setupWizard, updateFeedPacket, updateMetadataPacket, developerIdPacket });
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
console.log(`- Current private input placeholder locations: ${report.currentPrivateInputPlaceholderLocationCount} (${report.currentPrivateInputPlaceholderLocationSummary})`);
console.log(`- Current private input receipt: ${report.currentPrivateInputReceiptReady ? "yes" : "no"} (${report.currentPrivateInputReceiptMode})`);
console.log(`- Current private input file present: ${report.currentPrivateInputReceiptPrivateInputFilePresent ? "yes" : "no"}`);
console.log(`- Current private input loaded keys: ${report.currentPrivateInputReceiptPrivateInputFileLoadedKeyCount} (${report.currentPrivateInputReceiptPrivateInputFileLoadedKeySummary})`);
console.log(`- Current private input missing/placeholder/invalid rows: ${report.currentPrivateInputReceiptPrivateInputFileMissingKeyCount}/${report.currentPrivateInputReceiptPrivateInputFilePlaceholderKeyCount}/${report.currentPrivateInputReceiptPrivateInputFileInvalidShapeKeyCount}`);
console.log(`- Current private input receipt next operator command: ${report.currentPrivateInputReceiptNextOperatorCommand}`);
console.log(`- Real operator preflight receipt: ${report.realOperatorPreflightReceiptReady ? "yes" : "no"} (exit ${report.realOperatorPreflightExitStatus})`);
console.log(`- Real operator preflight ready: ${report.realOperatorPreflightSourcePreflightReady ? "yes" : "no"}`);
console.log(`- Real operator private input file present: ${report.realOperatorPreflightPrivateInputFilePresent ? "yes" : "no"}`);
console.log(`- Real operator private input loaded keys: ${report.realOperatorPreflightPrivateInputFileLoadedKeyCount} (${report.realOperatorPreflightPrivateInputFileLoadedKeySummary})`);
console.log(`- Real operator input ready/missing/placeholder/invalid rows: ${report.realOperatorPreflightInputReadyKeyCount}/${report.realOperatorPreflightInputMissingKeyCount}/${report.realOperatorPreflightInputPlaceholderKeyCount}/${report.realOperatorPreflightInputShapeInvalidKeyCount}`);
console.log(`- Real operator next write command: ${report.realOperatorPreflightNextWriteCommand}`);
console.log(`- Real setup wizard receipt ready: ${report.realSetupWizardReceiptReady ? "yes" : "no"}`);
console.log(`- Real setup wizard handoff rows: ${report.realSetupWizardOperatorHandoffRowCount} (${report.realSetupWizardOperatorHandoffSummary})`);
console.log(`- Real setup wizard next private input edit target: ${report.realSetupWizardNextPrivateInputEditTargetSummary}`);
console.log(`- Real setup wizard next operator command: ${report.realSetupWizardNextOperatorCommandAfterPrivateInputEdit}`);
console.log(`- Current operator command sequence ready: ${report.currentOperatorCommandSequenceReady ? "yes" : "no"}`);
console.log(`- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})`);
console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
console.log(`- Current operator start command: ${report.currentOperatorStartCommand}`);
console.log(`- Current operator start command role: ${report.currentOperatorStartCommandRole}`);
console.log(`- Current operator start command matches first command: ${report.currentOperatorStartCommandMatchesFirstCommand ? "yes" : "no"}`);
console.log(`- First run matches current operator first command: ${report.firstRunMatchesCurrentOperatorFirstCommand ? "yes" : "no"}`);
console.log(`- First run matches current operator start command: ${report.firstRunMatchesCurrentOperatorStartCommand ? "yes" : "no"}`);
console.log(`- Current operator preflight before apply: ${report.currentOperatorPreflightBeforeApply ? "yes" : "no"}`);
console.log(`- Current operator apply before strict proof: ${report.currentOperatorApplyBeforeStrictProof ? "yes" : "no"}`);
console.log(`- Operator unblock aliases ready: ${report.operatorUnblockReceiptReady ? "yes" : "no"}`);
console.log(`- Operator unblock first command alias: ${report.operatorUnblockFirstCommandAlias}`);
console.log(`- Operator unblock broad next command alias: ${report.operatorUnblockBroadNextCommandAlias}`);
console.log(`- Operator unblock private input edit target: ${report.operatorUnblockPrivateInputEditTarget}`);
console.log(`- Operator unblock preflight/apply/strict proof: ${report.operatorUnblockPreflightCommandAlias} / ${report.operatorUnblockApplyCommandAlias} / ${report.operatorUnblockStrictProofCommandAlias}`);
console.log(`- Private env apply proof runner command: ${report.releaseChannelPrivateEnvApplyProofCommand}`);
console.log(`- Private env apply proof runner after preflight: ${report.releaseChannelPrivateEnvApplyProofAfterPreflight ? "yes" : "no"}`);
console.log(`- Private input template command: ${report.releaseChannelPrivateInputTemplateCommand}`);
console.log(`- Private input template default path: ${report.releaseChannelPrivateInputTemplateDefaultPath}`);
console.log(`- Run rows: ${report.runRowCount}`);
console.log(`- Blocked run rows: ${report.blockedRunRowCount} (${report.blockedRunRowSummary})`);
console.log(`- Current blocker run rows: ${report.currentBlockedRunRowCount} (${report.currentBlockedRunRowSummary})`);
console.log(`- Waiting run rows: ${report.waitingRunRowCount} (${report.waitingRunRowSummary})`);
console.log(`- Hard gate command: ${report.hardGateCommand}`);
console.log(`- Hard gate ready: ${report.hardGateReady ? "yes" : "no"}`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
