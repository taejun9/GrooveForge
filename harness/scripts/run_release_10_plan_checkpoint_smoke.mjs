#!/usr/bin/env node

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
const sourceStem = "release-progress-refresh-smoke";
const checkpointStem = "release-10-plan-checkpoint-smoke";
const completedPlansSourceLabel = "docs/exec_plans/completed";
const completedPlansDir = path.join(root, "docs", "exec_plans", "completed");
const sourceJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${sourceStem}.json`);
const checkpointMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${checkpointStem}.md`);
const checkpointJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${checkpointStem}.json`);
const guidedSetupCommand = "npm run release:channel-setup-wizard";
const releasePrepareEnvCommand = "npm run release:prepare-env";
const releaseChannelApplyPrivateEnvPreflightCommand = "npm run release:channel-apply-private-env-preflight";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
const releasePrivateEditStrictProofCommand = "npm run release:private-edit-strict-proof";
const expectedSourceRefreshCommands = [
  "npm run release:proof-bundle",
  "npm run desktop:external-distribution-gate-smoke",
  "npm run desktop:completion-progress-smoke",
  "npm run release:channel-unblock-smoke",
  "npm run release:update-feed-checkpoint-smoke",
  "npm run release:progress-smoke",
  "npm run release:channel-placeholder-input-receipt",
  "npm run release:channel-private-input-ready-gate",
  "npm run release:current-blocker-smoke",
  "npm run release:completion-report-packet-smoke",
  "npm run release:progress-freshness-smoke",
  "npm run release:operator-completion-brief-smoke"
];
const expectedSourceRefreshCommandSummary = expectedSourceRefreshCommands.join(" -> ");
const expectedProofGateRefreshCommands = [
  {
    order: 1,
    command: "npm run release:proof-bundle",
    role: "refresh external proof bundle and current release-channel proof rows before progress reads them"
  },
  {
    order: 2,
    command: "npm run desktop:external-distribution-gate-smoke",
    role: "refresh external gate dry-run so it mirrors the current proof bundle rows"
  }
];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release 10-plan checkpoint smoke failed:");
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

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function objectRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object" && !Array.isArray(row)) : [];
}

function planNumberFromName(name) {
  const match = /^plan-(\d{3,})-[a-z0-9][a-z0-9-]*\.md$/.exec(name);
  return match ? Number.parseInt(match[1], 10) : null;
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}\nRun npm run release:progress-refresh-smoke before npm run release:10-plan-checkpoint-smoke.`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function buildProofGateRefreshRows(sourceCommandRows) {
  return expectedProofGateRefreshCommands.map((expected) => {
    const sourceRow = sourceCommandRows.find((row) => row?.order === expected.order) ?? {};
    const command = textValue(sourceRow.command, "missing");
    const role = textValue(sourceRow.role, "missing");
    return {
      order: expected.order,
      command,
      expectedCommand: expected.command,
      role,
      expectedRole: expected.role,
      commandMatched: command === expected.command,
      roleMatched: role === expected.role,
      valueRecorded: sourceRow.valueRecorded === true
    };
  });
}

function buildUserReportRows(report) {
  return [
    {
      order: 1,
      item: "Latest completed plan",
      value: report.localLatestPlan,
      ready: report.localLatestPlan !== "none",
      sourceField: "localLatestPlan",
      valueRecorded: false
    },
    {
      order: 2,
      item: "10-plan progress",
      value: report.localTenPlanProgress,
      ready: report.localTenPlanCompletedCount === 10 && report.localTenPlanTotal === 10,
      sourceField: "localTenPlanProgress",
      valueRecorded: false
    },
    {
      order: 3,
      item: "Overall completion",
      value: `${report.completionPercent}%`,
      ready: report.completionPercent === 99.999999,
      sourceField: "completionPercent",
      valueRecorded: false
    },
    {
      order: 4,
      item: "Remaining completion",
      value: `${report.remainingPercent}%`,
      ready: report.remainingPercent === 0.000001,
      sourceField: "remainingPercent",
      valueRecorded: false
    },
    {
      order: 5,
      item: "Current first blocker",
      value: report.firstBlocker,
      ready: report.firstBlocker !== "none",
      sourceField: "firstBlocker",
      valueRecorded: false
    },
    {
      order: 6,
      item: "Current operator start command",
      value: report.currentOperatorStartCommand,
      ready:
        report.currentOperatorStartCommand === report.currentOperatorFirstCommand &&
        report.currentOperatorFirstCommandIsGuidedSetup === false &&
        report.currentOperatorCommandRowsContainGuidedSetup === false,
      sourceField: "currentOperatorStartCommand",
      valueRecorded: report.currentOperatorStartCommandValueRecorded
    },
    {
      order: 7,
      item: "Guided setup fallback",
      value: report.releaseChannelGuidedSetupFallbackCommand,
      ready:
        report.releaseChannelGuidedSetupFallbackReady === true &&
        report.releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence === true,
      sourceField: "releaseChannelGuidedSetupFallbackCommand",
      valueRecorded: report.releaseChannelGuidedSetupFallbackValueRecorded
    },
    {
      order: 8,
      item: "Operator proof command",
      value: report.operatorProofCommand,
      ready: report.operatorProofCommand === releasePrivateEditStrictProofCommand,
      sourceField: "operatorProofCommand",
      valueRecorded: false
    },
    {
      order: 9,
      item: "Current edit target",
      value: report.currentEnvEditTarget,
      ready: report.currentEnvEditTarget !== "none",
      sourceField: "currentEnvEditTarget",
      valueRecorded: false
    },
    {
      order: 10,
      item: "External distribution claimed",
      value: readyLabel(report.claimedExternalDistribution),
      ready: report.claimedExternalDistribution === false,
      sourceField: "claimedExternalDistribution",
      valueRecorded: false
    }
  ];
}

async function deriveCompletedPlanWindow() {
  const entries = await readdir(completedPlansDir, { withFileTypes: true });
  const plans = entries
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const number = planNumberFromName(entry.name);
      if (number === null) {
        return null;
      }
      return {
        number,
        label: `plan-${number}`,
        fileName: entry.name,
        path: relative(path.join(completedPlansDir, entry.name)),
        valueRecorded: false
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.number - b.number);
  const latest = plans.at(-1) ?? null;
  const latestPlanNumber = latest?.number ?? 0;
  const windowStart = latestPlanNumber > 0 ? latestPlanNumber - ((latestPlanNumber - 1) % 10) : 0;
  const windowEnd = windowStart > 0 ? windowStart + 9 : 0;
  const rows = plans.filter((plan) => plan.number >= windowStart && plan.number <= windowEnd);
  const tenPlanReportDue = rows.length === 10;
  const currentBoundary = windowEnd;
  const postDeliveryNextReportNumber = tenPlanReportDue ? windowEnd + 10 : windowEnd;
  return {
    latestPlanNumber,
    latestPlan: latestPlanNumber > 0 ? `plan-${latestPlanNumber}` : "none",
    windowStart,
    windowEnd,
    tenPlanTotal: 10,
    tenPlanCompletedCount: rows.length,
    tenPlanProgress: windowStart > 0 ? `${windowStart}-${windowEnd}: ${rows.length}/10` : "none",
    tenPlanReportDue,
    currentBoundary,
    currentBoundaryLabel: currentBoundary > 0 ? `plan-${currentBoundary}` : "none",
    postDeliveryNextReportNumber,
    postDeliveryNextReportLabel: postDeliveryNextReportNumber > 0 ? `plan-${postDeliveryNextReportNumber}` : "none",
    rows
  };
}

function buildReport(source, localWindow) {
  const summary = source.completionSummary ?? {};
  const sourceRefreshCommandRows = Array.isArray(source.refreshCommandRows) ? source.refreshCommandRows : [];
  const sourceProofGateRefreshRows = buildProofGateRefreshRows(sourceRefreshCommandRows);
  const currentOperatorCommandRows = objectRows(summary.currentOperatorCommandRows);
  const sourceRefreshCommandsValueFree =
    sourceRefreshCommandRows.length > 0 && sourceRefreshCommandRows.every((row) => row?.valueRecorded === false);
  const sourceProofGateRefreshRowsValueFree = sourceProofGateRefreshRows.every((row) => row.valueRecorded === false);
  const currentOperatorFirstCommand = textValue(summary.currentOperatorFirstCommand);
  const currentOperatorStartCommand = textValue(summary.currentOperatorStartCommand, currentOperatorFirstCommand);
  const currentOperatorStartCommandRole = textValue(
    summary.currentOperatorStartCommandRole,
    currentOperatorCommandRows[0]?.role ?? "none"
  );
  const currentOperatorPreflightCommand = textValue(summary.currentOperatorPreflightCommand, releaseChannelApplyPrivateEnvPreflightCommand);
  const currentOperatorApplyCommand = textValue(summary.currentOperatorApplyCommand, releaseChannelApplyPrivateEnvCommand);
  const currentOperatorStrictProofCommand = textValue(summary.currentOperatorStrictProofCommand, releasePrivateEditStrictProofCommand);
  const currentOperatorPreflightCommandOrder = integerValue(summary.currentOperatorPreflightCommandOrder);
  const currentOperatorApplyCommandOrder = integerValue(summary.currentOperatorApplyCommandOrder);
  const currentOperatorStrictProofCommandOrder = integerValue(summary.currentOperatorStrictProofCommandOrder);
  const currentOperatorCommandRowsValueFree =
    currentOperatorCommandRows.length > 0 && currentOperatorCommandRows.every((row) => row?.valueRecorded === false && row?.ready === true);
  const currentOperatorCommandRowsContainGuidedSetup = currentOperatorCommandRows.some((row) => textValue(row.command) === guidedSetupCommand);
  const sourceProofGateRefreshReady =
    source.releaseProgressRefreshReady === true &&
    integerValue(source.refreshCommandCount) === expectedSourceRefreshCommands.length &&
    textValue(source.refreshCommandSummary) === expectedSourceRefreshCommandSummary &&
    sourceRefreshCommandsValueFree &&
    sourceProofGateRefreshRows.length === 2 &&
    sourceProofGateRefreshRows.every((row) => row.commandMatched === true && row.roleMatched === true) &&
    sourceProofGateRefreshRowsValueFree;
  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:10-plan-checkpoint-smoke",
    sourceCommand: "npm run release:progress-refresh-smoke",
    readoutCommand: "npm run release:completion-summary-smoke",
    sourceJsonArtifactName: "release-progress-refresh-smoke.json",
    sourceJsonPath: relative(sourceJsonPath),
    checkpointMarkdownArtifactName: "release-10-plan-checkpoint-smoke.md",
    checkpointJsonArtifactName: "release-10-plan-checkpoint-smoke.json",
    checkpointMarkdownPath: relative(checkpointMarkdownPath),
    checkpointJsonPath: relative(checkpointJsonPath),
    completedPlansSourceDir: completedPlansSourceLabel,
    sourceReady: source.releaseProgressRefreshReady === true,
    sourceSummaryReady: summary.ready === true,
    sourceLabelsMatch: source.labelsMatch === true,
    sourceRefreshCommandCount: integerValue(source.refreshCommandCount),
    sourceRefreshCommandSummary: textValue(source.refreshCommandSummary),
    sourceRefreshCommandsValueFree,
    sourceProofGateRefreshReady,
    sourceProofGateRefreshRows,
    sourceProofGateRefreshRowCount: sourceProofGateRefreshRows.length,
    sourceProofGateRefreshRowsValueFree,
    sourceProofBundleRefreshCommand: sourceProofGateRefreshRows[0]?.command ?? "missing",
    sourceExternalGateRefreshCommand: sourceProofGateRefreshRows[1]?.command ?? "missing",
    currentOperatorCommandSequenceReady: summary.currentOperatorCommandSequenceReady === true,
    currentOperatorCommandRows,
    currentOperatorCommandRowCount: integerValue(summary.currentOperatorCommandRowCount),
    currentOperatorCommandSummary: textValue(summary.currentOperatorCommandSummary),
    currentOperatorCommandRowsValueFree,
    currentOperatorFirstCommand,
    currentOperatorStartCommand,
    currentOperatorStartCommandRole,
    currentOperatorStartCommandMatchesFirstCommand:
      summary.currentOperatorStartCommandMatchesFirstCommand === true ||
      currentOperatorStartCommand === currentOperatorFirstCommand,
    currentOperatorStartCommandValueRecorded:
      summary.currentOperatorStartCommandValueRecorded === true ? true : false,
    currentOperatorFirstCommandIsGuidedSetup: currentOperatorFirstCommand === guidedSetupCommand,
    currentOperatorFirstCommandAllowed: [releasePrepareEnvCommand, releaseChannelApplyPrivateEnvPreflightCommand].includes(currentOperatorFirstCommand),
    currentOperatorCommandRowsContainGuidedSetup,
    currentOperatorPreflightCommand,
    currentOperatorPreflightCommandOrder,
    currentOperatorApplyCommand,
    currentOperatorApplyCommandOrder,
    currentOperatorStrictProofCommand,
    currentOperatorStrictProofCommandOrder,
    currentOperatorBlockerRefreshCommand: textValue(summary.currentOperatorBlockerRefreshCommand, "npm run release:current-blocker"),
    currentOperatorNextActionsRefreshCommand: textValue(summary.currentOperatorNextActionsRefreshCommand, "npm run release:next-actions"),
    currentOperatorPreflightBeforeApply: summary.currentOperatorPreflightBeforeApply === true,
    currentOperatorApplyBeforeStrictProof: summary.currentOperatorApplyBeforeStrictProof === true,
    currentOperatorValueRecorded: summary.currentOperatorValueRecorded === true ? true : false,
    releaseChannelGuidedSetupFallbackCommand: textValue(
      summary.releaseChannelGuidedSetupFallbackCommand,
      guidedSetupCommand
    ),
    releaseChannelGuidedSetupFallbackReady: summary.releaseChannelGuidedSetupFallbackReady === true,
    releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence:
      summary.releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence === true,
    releaseChannelGuidedSetupFallbackValueRecorded:
      summary.releaseChannelGuidedSetupFallbackValueRecorded === true ? true : false,
    sourceLatestPlanNumber: integerValue(summary.latestPlanNumber),
    sourceLatestPlan: textValue(summary.latestPlan),
    sourceTenPlanProgress: textValue(summary.tenPlanProgress),
    sourceTenPlanCompletedCount: integerValue(summary.tenPlanCompletedCount),
    sourceTenPlanTotal: integerValue(summary.tenPlanTotal),
    sourceTenPlanReportDue: summary.tenPlanReportDue === true,
    sourceNextTenPlanProgressReportAt: textValue(source.nextTenPlanProgressReportAt),
    localLatestPlanNumber: localWindow.latestPlanNumber,
    localLatestPlan: localWindow.latestPlan,
    localTenPlanProgress: localWindow.tenPlanProgress,
    localTenPlanCompletedCount: localWindow.tenPlanCompletedCount,
    localTenPlanTotal: localWindow.tenPlanTotal,
    tenPlanWindowStart: localWindow.windowStart,
    tenPlanWindowEnd: localWindow.windowEnd,
    tenPlanWindowRows: localWindow.rows,
    tenPlanWindowRowCount: localWindow.rows.length,
    currentTenPlanReportBoundaryNumber: localWindow.currentBoundary,
    currentTenPlanReportBoundaryAt: localWindow.currentBoundaryLabel,
    legacyNextTenPlanProgressReportAt: textValue(source.nextTenPlanProgressReportAt, localWindow.currentBoundaryLabel),
    postDeliveryNextTenPlanProgressReportNumber: localWindow.postDeliveryNextReportNumber,
    postDeliveryNextTenPlanProgressReportAt: localWindow.postDeliveryNextReportLabel,
    postDeliveryNextTenPlanProgressReportReady: false,
    tenPlanWindowComplete: false,
    tenPlanBoundaryMatched: false,
    completionPercent: summary.completionPercent,
    remainingPercent: summary.remainingPercent,
    freshArtifactCount: integerValue(summary.freshArtifactCount),
    staleArtifactCount: integerValue(summary.staleArtifactCount),
    missingArtifactCount: integerValue(summary.missingArtifactCount),
    operatorBriefReady: summary.operatorBriefReady === true,
    releaseChannelMetadataBlocked: summary.releaseChannelMetadataBlocked === true,
    releaseChannelMetadataCleared: summary.releaseChannelMetadataCleared === true,
    releaseChannelMetadataNeedsIgnoredEnv:
      summary.releaseChannelMetadataNeedsIgnoredEnv === true ||
      (summary.releaseChannelMetadataBlocked === true &&
        integerValue(summary.releaseChannelCurrentReadyCount) < integerValue(summary.releaseChannelCurrentRequiredKeyCount) &&
        integerValue(summary.releaseChannelCurrentPlaceholderKeyCount) === 0),
    releaseChannelCurrentReadyCount: integerValue(summary.releaseChannelCurrentReadyCount),
    releaseChannelCurrentRequiredKeyCount: integerValue(summary.releaseChannelCurrentRequiredKeyCount),
    releaseChannelCurrentPlaceholderKeyCount: integerValue(summary.releaseChannelCurrentPlaceholderKeyCount),
    privateEditBlockedSmokeReady: summary.privateEditBlockedSmokeReady === true,
    privateEditBlockedSmokeCurrentPlaceholderKeyCount: integerValue(summary.privateEditBlockedSmokeCurrentPlaceholderKeyCount),
    operatorProofCommand: textValue(summary.operatorProofCommand),
    postClearanceNextAction: textValue(summary.postClearanceNextAction),
    postClearanceProofCommand: textValue(summary.postClearanceProofCommand),
    firstBlocker: textValue(summary.firstBlocker),
    nextCommand: textValue(summary.nextCommand),
    rerunCommand: textValue(summary.rerunCommand),
    currentEnvEditTarget: textValue(summary.currentEnvEditTarget, ".env.distribution.local"),
    hardGateReady: summary.hardGateReady === true,
    hardGateWouldFail: summary.hardGateWouldFail === true,
    privateValuesRecorded: summary.privateValuesRecorded === true,
    claimedAutoUpdate: summary.claimedAutoUpdate === true,
    claimedExternalDistribution: summary.claimedExternalDistribution === true,
    tenPlanCheckpointReady: false,
    valueRecorded: false,
    networkProbeAttempted: false,
    updateFeedPublishAttempted: false,
    distributionChannelProbeAttempted: false,
    releaseUploadAttempted: false,
    signingAttempted: false,
    notarySubmissionAttempted: false,
    claimedDeveloperIdSigning: false,
    claimedNotarization: false,
    claimedGatekeeperApproval: false,
    claimedManualQaApproval: false,
    claimedAppStoreSubmission: false,
    userReportReady: false,
    userReportRows: [],
    userReportRowCount: 0,
    userReportRowSummary: "0 user report rows"
  };
}

function buildMarkdown(report) {
  const rows = report.tenPlanWindowRows
    .map((row) => `| ${row.label} | ${row.path} | ${readyLabel(!row.valueRecorded)} |`)
    .join("\n");
  const currentOperatorRows = report.currentOperatorCommandRows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.step)} | ${readyLabel(row.ready === true)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${escapeCell(row.expectedOperatorInput)} | ${escapeCell(row.expectedEvidence)} | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
  const proofGateRows = report.sourceProofGateRefreshRows
    .map(
      (row) =>
        `| ${row.order} | \`${escapeCell(row.command)}\` | \`${escapeCell(row.expectedCommand)}\` | ${readyLabel(row.commandMatched)} | ${escapeCell(row.role)} | ${readyLabel(row.roleMatched)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
  const userReportRows = report.userReportRows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.item)} | ${readyLabel(row.ready === true)} | ${escapeCell(row.value)} | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release 10-Plan Checkpoint Smoke

## Checkpoint

- 10-plan checkpoint ready: ${readyLabel(report.tenPlanCheckpointReady)}
- Report command: \`${report.reportCommand}\`
- Source command: \`${report.sourceCommand}\`
- Readout command: \`${report.readoutCommand}\`
- Source JSON: ${report.sourceJsonPath}
- Source ready: ${readyLabel(report.sourceReady)}
- Source summary ready: ${readyLabel(report.sourceSummaryReady)}
- Source labels match: ${readyLabel(report.sourceLabelsMatch)}
- Source refresh command count: ${report.sourceRefreshCommandCount}
- Source proof/gate refresh ready: ${readyLabel(report.sourceProofGateRefreshReady)}
- Source proof bundle refresh command: \`${report.sourceProofBundleRefreshCommand}\`
- Source external gate refresh command: \`${report.sourceExternalGateRefreshCommand}\`
- Source current operator sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Source current operator rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- Source current operator first command: \`${report.currentOperatorFirstCommand}\`
- Source current operator start command: \`${report.currentOperatorStartCommand}\`
- Source current operator start command role: ${report.currentOperatorStartCommandRole}
- Source current operator start command matches first command: ${readyLabel(report.currentOperatorStartCommandMatchesFirstCommand)}
- Source current operator first command is guided setup: ${readyLabel(report.currentOperatorFirstCommandIsGuidedSetup)}
- Source current operator rows contain guided setup: ${readyLabel(report.currentOperatorCommandRowsContainGuidedSetup)}
- Guided setup fallback command: \`${report.releaseChannelGuidedSetupFallbackCommand}\`
- Guided setup fallback ready: ${readyLabel(report.releaseChannelGuidedSetupFallbackReady)}
- Guided setup fallback separate from primary sequence: ${readyLabel(report.releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence)}
- Source current operator preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Source current operator apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Latest completed plan: ${report.localLatestPlan}
- Source latest completed plan: ${report.sourceLatestPlan}
- 10-plan progress: ${report.localTenPlanProgress}
- Source 10-plan progress: ${report.sourceTenPlanProgress}
- 10-plan report due: ${readyLabel(report.sourceTenPlanReportDue)}
- Current 10-plan report boundary: ${report.currentTenPlanReportBoundaryAt}
- Legacy next 10-plan report field: ${report.legacyNextTenPlanProgressReportAt}
- Post-delivery next 10-plan report: ${report.postDeliveryNextTenPlanProgressReportAt}
- Post-delivery next report ready: ${readyLabel(report.postDeliveryNextTenPlanProgressReportReady)}
- 10-plan window complete: ${readyLabel(report.tenPlanWindowComplete)}
- 10-plan boundary matched: ${readyLabel(report.tenPlanBoundaryMatched)}
- User-facing completion: ${report.completionPercent}%
- Remaining completion: ${report.remainingPercent}%
- Fresh artifacts: ${report.freshArtifactCount}
- Stale artifacts: ${report.staleArtifactCount}
- Missing artifacts: ${report.missingArtifactCount}
- Operator proof command: \`${report.operatorProofCommand}\`
- Release-channel metadata blocked: ${readyLabel(report.releaseChannelMetadataBlocked)}
- Release-channel metadata cleared: ${readyLabel(report.releaseChannelMetadataCleared)}
- Release-channel metadata needs ignored env: ${readyLabel(report.releaseChannelMetadataNeedsIgnoredEnv)}
- Release-channel current placeholders: ${report.releaseChannelCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}
- Private-edit blocked smoke ready: ${readyLabel(report.privateEditBlockedSmokeReady)}
- Private-edit blocked smoke placeholders: ${report.privateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}
- Post-clearance next action: ${report.postClearanceNextAction}
- Post-clearance proof command: \`${report.postClearanceProofCommand}\`
- Current first blocker: ${report.firstBlocker}
- Current edit target: ${report.currentEnvEditTarget}
- User report ready: ${readyLabel(report.userReportReady)}
- User report rows: ${report.userReportRowCount} (${report.userReportRowSummary})
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Private values recorded: ${readyLabel(report.privateValuesRecorded)}
- Auto-update claimed: ${readyLabel(report.claimedAutoUpdate)}
- External distribution claimed: ${readyLabel(report.claimedExternalDistribution)}

## Proof/Gate Refresh Evidence

- Source refresh command summary: ${report.sourceRefreshCommandSummary}
- Source refresh commands value-free: ${readyLabel(report.sourceRefreshCommandsValueFree)}
- Source proof/gate refresh rows: ${report.sourceProofGateRefreshRowCount}
- Source proof/gate rows value-free: ${readyLabel(report.sourceProofGateRefreshRowsValueFree)}

| order | command | expected command | command matched | role | role matched | value recorded |
|---:|---|---|---:|---|---:|---:|
${proofGateRows}

## Source Current Operator Command Sequence

- Sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- First command: \`${report.currentOperatorFirstCommand}\`
- Start command: \`${report.currentOperatorStartCommand}\`
- Start command role: ${report.currentOperatorStartCommandRole}
- Start command matches first command: ${readyLabel(report.currentOperatorStartCommandMatchesFirstCommand)}
- First command allowed: ${readyLabel(report.currentOperatorFirstCommandAllowed)}
- First command is guided setup: ${readyLabel(report.currentOperatorFirstCommandIsGuidedSetup)}
- Rows contain guided setup: ${readyLabel(report.currentOperatorCommandRowsContainGuidedSetup)}
- Preflight command: \`${report.currentOperatorPreflightCommand}\`
- Apply command: \`${report.currentOperatorApplyCommand}\`
- Strict proof command: \`${report.currentOperatorStrictProofCommand}\`
- Current-blocker refresh command: \`${report.currentOperatorBlockerRefreshCommand}\`
- Next-actions refresh command: \`${report.currentOperatorNextActionsRefreshCommand}\`
- Preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Value recorded: ${readyLabel(report.currentOperatorValueRecorded)}

| order | step | ready | command | role | expected operator input | expected evidence | source field | value recorded |
|---:|---|---:|---|---|---|---|---|---:|
${currentOperatorRows}

## User Report Receipt

| order | item | ready | value | source field | value recorded |
|---:|---|---:|---|---|---:|
${userReportRows}

## 10-Plan Window Rows

| plan | path | value-free |
|---|---|---|
${rows}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this checkpoint.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  const expectedProgress = `${report.tenPlanWindowStart}-${report.tenPlanWindowEnd}: 10/10`;
  check(report.sourceReady === true, "release 10-plan checkpoint should require ready progress refresh source");
  check(report.sourceSummaryReady === true, "release 10-plan checkpoint should require ready compact source summary");
  check(report.sourceLabelsMatch === true, "release 10-plan checkpoint should require matched source labels");
  check(
    report.sourceRefreshCommandCount === expectedSourceRefreshCommands.length,
    "release 10-plan checkpoint should require the full source refresh command sequence"
  );
  check(
    report.sourceRefreshCommandSummary === expectedSourceRefreshCommandSummary,
    "release 10-plan checkpoint should require proof bundle and external gate before progress refresh reads evidence"
  );
  check(report.sourceRefreshCommandsValueFree === true, "release 10-plan checkpoint source refresh commands should be value-free");
  check(report.sourceProofGateRefreshReady === true, "release 10-plan checkpoint should require proof/gate refresh evidence");
  check(report.sourceProofGateRefreshRowCount === 2, "release 10-plan checkpoint should include two proof/gate refresh rows");
  check(report.sourceProofGateRefreshRows.every((row) => row.commandMatched === true), "release 10-plan checkpoint proof/gate commands should match expected commands");
  check(report.sourceProofGateRefreshRows.every((row) => row.roleMatched === true), "release 10-plan checkpoint proof/gate roles should match expected roles");
  check(report.sourceProofGateRefreshRowsValueFree === true, "release 10-plan checkpoint proof/gate rows should be value-free");
  check(report.sourceProofBundleRefreshCommand === "npm run release:proof-bundle", "release 10-plan checkpoint should expose proof-bundle refresh command");
  check(
    report.sourceExternalGateRefreshCommand === "npm run desktop:external-distribution-gate-smoke",
    "release 10-plan checkpoint should expose external gate refresh command"
  );
  check(report.currentOperatorCommandSequenceReady === true, "release 10-plan checkpoint should require source current operator command sequence readiness");
  check(report.currentOperatorCommandRowCount === report.currentOperatorCommandRows.length, "release 10-plan checkpoint current operator row count should match rows");
  check(report.currentOperatorCommandRows.length >= 5, "release 10-plan checkpoint current operator sequence should include preflight, apply, strict proof, blocker refresh, and next-actions refresh");
  check(report.currentOperatorCommandRowsValueFree === true, "release 10-plan checkpoint current operator rows should be ready and value-free");
  check(report.currentOperatorStartCommand === report.currentOperatorFirstCommand, "release 10-plan checkpoint current operator start command should mirror first command");
  check(report.currentOperatorStartCommand === report.currentOperatorCommandRows[0]?.command, "release 10-plan checkpoint current operator start command should match first row command");
  check(report.currentOperatorStartCommandRole === report.currentOperatorCommandRows[0]?.role, "release 10-plan checkpoint current operator start command role should match first row role");
  check(report.currentOperatorStartCommandMatchesFirstCommand === true, "release 10-plan checkpoint current operator start command should declare first-command match");
  check(report.currentOperatorStartCommandValueRecorded === false, "release 10-plan checkpoint current operator start command should be value-free");
  check(report.currentOperatorFirstCommandAllowed === true, "release 10-plan checkpoint current operator first command should be prepare-env or private-env preflight");
  check(report.currentOperatorFirstCommandIsGuidedSetup === false, "release 10-plan checkpoint current operator first command should not be the guided setup wizard");
  check(report.currentOperatorCommandRowsContainGuidedSetup === false, "release 10-plan checkpoint current operator rows should not include the guided setup wizard");
  check(report.releaseChannelGuidedSetupFallbackCommand === guidedSetupCommand, "release 10-plan checkpoint should expose the guided setup fallback command");
  check(report.releaseChannelGuidedSetupFallbackReady === true, "release 10-plan checkpoint should keep guided setup fallback ready");
  check(
    report.releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence === true,
    "release 10-plan checkpoint should keep guided setup fallback separate from the primary sequence"
  );
  check(
    report.releaseChannelGuidedSetupFallbackValueRecorded === false,
    "release 10-plan checkpoint guided setup fallback should be value-free"
  );
  check(report.currentOperatorPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand, "release 10-plan checkpoint current operator sequence should expose private env preflight command");
  check(report.currentOperatorApplyCommand === releaseChannelApplyPrivateEnvCommand, "release 10-plan checkpoint current operator sequence should expose private env apply command");
  check(report.currentOperatorStrictProofCommand === releasePrivateEditStrictProofCommand, "release 10-plan checkpoint current operator sequence should expose strict proof command");
  check(report.currentOperatorPreflightCommandOrder > 0, "release 10-plan checkpoint current operator preflight command should have an order");
  check(report.currentOperatorApplyCommandOrder > report.currentOperatorPreflightCommandOrder, "release 10-plan checkpoint current operator apply command should follow preflight");
  check(report.currentOperatorStrictProofCommandOrder > report.currentOperatorApplyCommandOrder, "release 10-plan checkpoint current operator strict proof should follow apply");
  check(report.currentOperatorBlockerRefreshCommand === "npm run release:current-blocker", "release 10-plan checkpoint current operator sequence should include current-blocker refresh");
  check(report.currentOperatorNextActionsRefreshCommand === "npm run release:next-actions", "release 10-plan checkpoint current operator sequence should include next-actions refresh");
  check(report.currentOperatorPreflightBeforeApply === true, "release 10-plan checkpoint current operator sequence should place preflight before apply");
  check(report.currentOperatorApplyBeforeStrictProof === true, "release 10-plan checkpoint current operator sequence should place apply before strict proof");
  check(report.currentOperatorValueRecorded === false, "release 10-plan checkpoint current operator sequence should not record values");
  check(report.localLatestPlanNumber > 0, "release 10-plan checkpoint should include latest local completed plan number");
  check(report.sourceLatestPlanNumber === report.localLatestPlanNumber, "release 10-plan checkpoint should match source and local latest plan number");
  check(report.sourceLatestPlan === report.localLatestPlan, "release 10-plan checkpoint should match source and local latest plan label");
  check(report.sourceTenPlanTotal === 10, "release 10-plan checkpoint should use ten-plan source totals");
  check(report.localTenPlanTotal === 10, "release 10-plan checkpoint should use ten-plan local totals");
  check(report.sourceTenPlanCompletedCount === 10, "release 10-plan checkpoint should require source window count 10");
  check(report.localTenPlanCompletedCount === 10, "release 10-plan checkpoint should require local window count 10");
  check(report.sourceTenPlanReportDue === true, "release 10-plan checkpoint should require report-due source posture");
  check(report.localLatestPlanNumber === report.tenPlanWindowEnd, "release 10-plan checkpoint should require latest plan at the window boundary");
  check(report.sourceTenPlanProgress === expectedProgress, "release 10-plan checkpoint should require source progress at 10/10");
  check(report.localTenPlanProgress === expectedProgress, "release 10-plan checkpoint should require local progress at 10/10");
  check(report.currentTenPlanReportBoundaryNumber === report.tenPlanWindowEnd, "release 10-plan checkpoint current report boundary should match the window end");
  check(report.currentTenPlanReportBoundaryAt === `plan-${report.tenPlanWindowEnd}`, "release 10-plan checkpoint should label the current report boundary");
  check(report.legacyNextTenPlanProgressReportAt === report.currentTenPlanReportBoundaryAt, "release 10-plan checkpoint should preserve legacy next report field as current boundary");
  check(report.postDeliveryNextTenPlanProgressReportNumber === report.tenPlanWindowEnd + 10, "release 10-plan checkpoint should schedule the next post-delivery report one window ahead");
  check(report.postDeliveryNextTenPlanProgressReportAt === `plan-${report.tenPlanWindowEnd + 10}`, "release 10-plan checkpoint should label the next post-delivery report");
  check(report.postDeliveryNextTenPlanProgressReportReady === true, "release 10-plan checkpoint should mark post-delivery next report target ready");
  check(report.tenPlanWindowRows.every((row) => row.valueRecorded === false), "release 10-plan checkpoint rows should be value-free");
  check(report.completionPercent === 99.999999, "release 10-plan checkpoint should preserve completion percent");
  check(report.remainingPercent === 0.000001, "release 10-plan checkpoint should preserve remaining percent");
  check(report.freshArtifactCount > 0, "release 10-plan checkpoint should report fresh artifacts");
  check(report.staleArtifactCount === 0, "release 10-plan checkpoint should report zero stale artifacts");
  check(report.missingArtifactCount === 0, "release 10-plan checkpoint should report zero missing artifacts");
  check(report.operatorBriefReady === true, "release 10-plan checkpoint should keep operator brief ready");
  check(report.releaseChannelMetadataBlocked !== report.releaseChannelMetadataCleared, "release 10-plan checkpoint should keep exactly one release-channel metadata posture");
  check(
    !report.releaseChannelMetadataBlocked ||
      report.releaseChannelCurrentPlaceholderKeyCount === 4 ||
      report.releaseChannelMetadataNeedsIgnoredEnv,
    "release 10-plan checkpoint should keep placeholders or require ignored env setup while blocked"
  );
  check(!report.releaseChannelMetadataCleared || report.releaseChannelCurrentPlaceholderKeyCount === 0, "release 10-plan checkpoint should allow zero placeholders when cleared");
  check(report.privateEditBlockedSmokeReady === true, "release 10-plan checkpoint should expose private-edit blocked smoke readiness");
  check(report.privateEditBlockedSmokeCurrentPlaceholderKeyCount === 4, "release 10-plan checkpoint should expose blocked smoke coverage for four placeholders");
  check(report.operatorProofCommand === "npm run release:private-edit-strict-proof", "release 10-plan checkpoint should keep strict proof as operator proof command");
  check(report.currentEnvEditTarget !== "none", "release 10-plan checkpoint should expose the current edit target");
  check(report.userReportReady === true, "release 10-plan checkpoint should expose a ready user report receipt");
  check(report.userReportRowCount === report.userReportRows.length, "release 10-plan checkpoint should count user report rows");
  check(report.userReportRowCount === 10, "release 10-plan checkpoint user report should include ten rows");
  check(report.userReportRowSummary === "10 user report rows", "release 10-plan checkpoint should summarize user report rows");
  check(report.userReportRows.every((row) => row.ready === true), "release 10-plan checkpoint user report rows should be ready");
  check(report.userReportRows.every((row) => row.valueRecorded === false), "release 10-plan checkpoint user report rows should be value-free");
  check(
    report.userReportRows.some((row) => row.item === "Overall completion" && row.value === "99.999999%"),
    "release 10-plan checkpoint user report should include overall completion"
  );
  check(
    report.userReportRows.some((row) => row.item === "Remaining completion" && row.value === "0.000001%"),
    "release 10-plan checkpoint user report should include remaining completion"
  );
  check(
    report.userReportRows.some((row) => row.item === "Guided setup fallback" && row.value === guidedSetupCommand),
    "release 10-plan checkpoint user report should include guided setup fallback"
  );
  check(
    report.userReportRows.some((row) => row.item === "External distribution claimed" && row.value === "no"),
    "release 10-plan checkpoint user report should include external distribution non-claim posture"
  );
  check(report.postClearanceNextAction === "auto-update-feed", "release 10-plan checkpoint should keep auto-update-feed as post-clearance next action");
  check(report.postClearanceProofCommand === "npm run desktop:auto-update-readiness-smoke", "release 10-plan checkpoint should keep auto-update readiness as post-clearance proof command");
  check(report.hardGateReady === false, "release 10-plan checkpoint should keep hard gate unready");
  check(report.hardGateWouldFail === true, "release 10-plan checkpoint should keep hard gate would-fail posture");
  check(report.privateValuesRecorded === false, "release 10-plan checkpoint should not record private values");
  check(report.claimedAutoUpdate === false, "release 10-plan checkpoint should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release 10-plan checkpoint should not claim external distribution");
  check(report.networkProbeAttempted === false, "release 10-plan checkpoint should not probe networks");
  check(report.updateFeedPublishAttempted === false, "release 10-plan checkpoint should not publish update feeds");
  check(report.distributionChannelProbeAttempted === false, "release 10-plan checkpoint should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "release 10-plan checkpoint should not upload releases");
  check(report.signingAttempted === false, "release 10-plan checkpoint should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release 10-plan checkpoint should not submit to Apple");
  check(!/https?:\/\//i.test(serialized), "release 10-plan checkpoint JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release 10-plan checkpoint Markdown should not include URL values");
  check(markdown.includes("Release 10-Plan Checkpoint Smoke"), "release 10-plan checkpoint Markdown should include title");
  check(markdown.includes("10-plan checkpoint ready: yes"), "release 10-plan checkpoint Markdown should include readiness");
  check(markdown.includes("Proof/Gate Refresh Evidence"), "release 10-plan checkpoint Markdown should include proof/gate refresh evidence");
  check(markdown.includes("Source proof/gate refresh ready: yes"), "release 10-plan checkpoint Markdown should include proof/gate refresh readiness");
  check(markdown.includes("Source Current Operator Command Sequence"), "release 10-plan checkpoint Markdown should include source current operator sequence");
  check(markdown.includes("Source current operator start command:"), "release 10-plan checkpoint Markdown should include source current operator start command");
  check(markdown.includes("First command is guided setup: no"), "release 10-plan checkpoint Markdown should prove guided setup is not first command");
  check(markdown.includes("## User Report Receipt"), "release 10-plan checkpoint Markdown should include user report receipt");
  check(markdown.includes("User report ready: yes"), "release 10-plan checkpoint Markdown should summarize user report readiness");
  check(markdown.includes("| 3 | Overall completion | yes | 99.999999% | completionPercent | no |"), "release 10-plan checkpoint Markdown should include completion user report row");
  check(markdown.includes("| 7 | Guided setup fallback | yes | npm run release:channel-setup-wizard |"), "release 10-plan checkpoint Markdown should include guided fallback user report row");
  check(markdown.includes(`| ${report.localLatestPlan} |`), "release 10-plan checkpoint Markdown should include the boundary plan row when current window completes");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

const source = await readJsonRequired(sourceJsonPath, "Release progress refresh smoke");
const localWindow = await deriveCompletedPlanWindow();
const report = buildReport(source, localWindow);
report.tenPlanWindowComplete = report.localTenPlanCompletedCount === 10;
report.tenPlanBoundaryMatched = report.localLatestPlanNumber === report.tenPlanWindowEnd && report.sourceLatestPlanNumber === report.localLatestPlanNumber;
report.postDeliveryNextTenPlanProgressReportReady =
  report.sourceTenPlanReportDue === true &&
  report.currentTenPlanReportBoundaryAt === report.legacyNextTenPlanProgressReportAt &&
  report.postDeliveryNextTenPlanProgressReportNumber === report.tenPlanWindowEnd + 10;
report.tenPlanCheckpointReady =
  report.sourceReady === true &&
  report.sourceSummaryReady === true &&
  report.sourceLabelsMatch === true &&
  report.sourceProofGateRefreshReady === true &&
  report.sourceTenPlanReportDue === true &&
  report.sourceTenPlanCompletedCount === 10 &&
  report.localTenPlanCompletedCount === 10 &&
  report.tenPlanBoundaryMatched === true &&
  report.privateValuesRecorded === false &&
  report.claimedExternalDistribution === false;
report.userReportRows = buildUserReportRows(report);
report.userReportRowCount = report.userReportRows.length;
report.userReportRowSummary = `${report.userReportRowCount} user report rows`;
report.userReportReady =
  report.tenPlanCheckpointReady === true &&
  report.userReportRowCount === 10 &&
  report.userReportRows.every((row) => row.ready === true && row.valueRecorded === false);
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(checkpointMarkdownPath, markdown, "utf8");
await writeFile(checkpointJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release 10-plan checkpoint smoke passed.");
console.log(`- Markdown: ${relative(checkpointMarkdownPath)}`);
console.log(`- JSON: ${relative(checkpointJsonPath)}`);
console.log("- 10-plan checkpoint ready: yes");
console.log(`- Source command: ${report.sourceCommand}`);
console.log(`- Source proof/gate refresh ready: ${report.sourceProofGateRefreshReady ? "yes" : "no"}`);
console.log(`- Source proof bundle refresh command: ${report.sourceProofBundleRefreshCommand}`);
console.log(`- Source external gate refresh command: ${report.sourceExternalGateRefreshCommand}`);
console.log(`- Source current operator sequence ready: ${report.currentOperatorCommandSequenceReady ? "yes" : "no"}`);
console.log(`- Source current operator rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})`);
console.log(`- Source current operator first command: ${report.currentOperatorFirstCommand}`);
console.log(`- Source current operator start command: ${report.currentOperatorStartCommand}`);
console.log(`- Source current operator start command role: ${report.currentOperatorStartCommandRole}`);
console.log(`- Source current operator start command matches first command: ${report.currentOperatorStartCommandMatchesFirstCommand ? "yes" : "no"}`);
console.log(`- Source current operator first command is guided setup: ${report.currentOperatorFirstCommandIsGuidedSetup ? "yes" : "no"}`);
console.log(`- Source current operator rows contain guided setup: ${report.currentOperatorCommandRowsContainGuidedSetup ? "yes" : "no"}`);
console.log(`- Guided setup fallback command: ${report.releaseChannelGuidedSetupFallbackCommand}`);
console.log(`- Guided setup fallback ready: ${report.releaseChannelGuidedSetupFallbackReady ? "yes" : "no"}`);
console.log(`- Guided setup fallback separate from primary sequence: ${report.releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence ? "yes" : "no"}`);
console.log(`- Source current operator preflight before apply: ${report.currentOperatorPreflightBeforeApply ? "yes" : "no"}`);
console.log(`- Source current operator apply before strict proof: ${report.currentOperatorApplyBeforeStrictProof ? "yes" : "no"}`);
console.log(`- Release-channel metadata needs ignored env: ${report.releaseChannelMetadataNeedsIgnoredEnv ? "yes" : "no"}`);
console.log(`- Release-channel current placeholders: ${report.releaseChannelCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}`);
console.log(`- Private-edit blocked smoke ready: ${report.privateEditBlockedSmokeReady ? "yes" : "no"}`);
console.log(`- Private-edit blocked smoke placeholders: ${report.privateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}`);
console.log(`- Latest completed plan: ${report.localLatestPlan}`);
console.log(`- 10-plan progress: ${report.localTenPlanProgress}`);
console.log(`- Current 10-plan report boundary: ${report.currentTenPlanReportBoundaryAt}`);
console.log(`- Post-delivery next 10-plan report: ${report.postDeliveryNextTenPlanProgressReportAt}`);
console.log(`- User-facing completion: ${report.completionPercent}%`);
console.log(`- Remaining completion: ${report.remainingPercent}%`);
console.log(`- User report ready: ${report.userReportReady ? "yes" : "no"}`);
console.log(`- User report rows: ${report.userReportRowCount} (${report.userReportRowSummary})`);
console.log(`- Fresh artifacts: ${report.freshArtifactCount}`);
console.log(`- Stale artifacts: ${report.staleArtifactCount}`);
console.log(`- Missing artifacts: ${report.missingArtifactCount}`);
console.log(`- Operator proof command: ${report.operatorProofCommand}`);
console.log(`- Current first blocker: ${report.firstBlocker}`);
console.log(`- Private values recorded: ${report.privateValuesRecorded ? "yes" : "no"}`);
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
