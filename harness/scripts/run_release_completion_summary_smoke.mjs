#!/usr/bin/env node

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
const sourceStem = "release-progress-refresh-smoke";
const readoutStem = "release-completion-summary-smoke";
const sourceRefreshCommand = "npm run release:progress-refresh-smoke";
const readoutRefreshCommand = "npm run release:completion-summary-refresh-smoke";
const sourceJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${sourceStem}.json`);
const readoutMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${readoutStem}.md`);
const readoutJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${readoutStem}.json`);
const completedPlanRoot = path.join(root, "docs", "exec_plans", "completed");
const failures = [];
const releaseChannelPrivateInputTemplateCommand = "npm run release:channel-private-input-template";
const releaseChannelPrivateInputTemplateRole =
  "create the ignored .env.release-channel.local skeleton for the four private release-channel metadata values before preflight";
const releaseChannelApplyPrivateEnvPreflightCommand = "npm run release:channel-apply-private-env-preflight";
const releaseChannelApplyPrivateEnvPreflightRole =
  "verify operator-owned release-channel metadata from process env or the ignored private input file before writing the ignored local env";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
const releaseChannelApplyPrivateEnvRole =
  "apply operator-owned release-channel metadata from process env or the ignored private input file into the ignored local env before strict proof";
const releaseChannelApplyPrivateEnvProofCommand = "npm run release:channel-apply-private-env-proof";
const releaseChannelApplyPrivateEnvProofRole =
  "run private env preflight, apply only after preflight readiness, strict proof, and completion readout as one value-free operator proof runner";
const releaseChannelSetupWizardCommand = "npm run release:channel-setup-wizard";
const releaseChannelSetupWizardRole =
  "guided local-only fallback for first-time operators when private release-channel inputs are missing, placeholders, or shape-invalid";

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release completion summary smoke failed:");
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

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(
      `${label} artifact is missing.`,
      [
        `Expected: ${relative(filePath)}`,
        `Run ${readoutRefreshCommand} for after-work completion reports.`,
        `Run ${sourceRefreshCommand} before npm run release:completion-summary-smoke when only the source bundle needs refreshing.`
      ].join("\n")
    );
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function buildSourceGuidance(report) {
  return [
    "Source evidence is missing, stale, or incomplete.",
    `- Source ready: ${readyLabel(report.sourceReady)}`,
    `- Source summary ready: ${readyLabel(report.sourceSummaryReady)}`,
    `- Source labels match: ${readyLabel(report.sourceLabelsMatch)}`,
    `- Source latest plan: ${report.latestPlan}`,
    `- Current completed-plan latest: ${report.currentCompletedPlan}`,
    `- Source 10-plan progress: ${report.tenPlanProgress}`,
    `- Current completed-plan 10-plan progress: ${report.currentCompletedPlanTenPlanProgress}`,
    `- Source latest plan matches current completed plans: ${readyLabel(report.sourceLatestPlanMatchesCurrentCompletedPlans)}`,
    `- Source 10-plan progress matches current completed plans: ${readyLabel(report.sourceTenPlanProgressMatchesCurrentCompletedPlans)}`,
    `- Strict proof handoff ready: ${readyLabel(report.strictProofHandoffReceiptReady)}`,
    `- Private-edit blocked smoke ready: ${readyLabel(report.privateEditBlockedSmokeReady)}`,
    `- Final handoff success-redaction ready: ${readyLabel(report.finalHandoffSuccessRedactionReady)}`,
    `Run ${readoutRefreshCommand} for after-work completion reports.`,
    `Run ${sourceRefreshCommand} before npm run release:completion-summary-smoke when only the source bundle needs refreshing.`
  ].join("\n");
}

async function currentCompletedPlanState() {
  const completedFiles = await readdir(completedPlanRoot);
  const completedPlanNumbers = completedFiles
    .map((file) => /^plan-(\d+)-/.exec(file)?.[1])
    .filter((value) => typeof value === "string")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
  if (completedPlanNumbers.length === 0) {
    fail("No completed plan files were found.", `Expected completed plans under ${relative(completedPlanRoot)}.`);
  }
  const latestPlanNumber = Math.max(...completedPlanNumbers);
  const windowStart = latestPlanNumber - ((latestPlanNumber - 1) % 10);
  const windowEnd = windowStart + 9;
  const windowRows = completedPlanNumbers.filter((number) => number >= windowStart && number <= windowEnd).sort((a, b) => a - b);
  return {
    latestPlanNumber,
    latestPlan: `plan-${latestPlanNumber}`,
    tenPlanWindowStart: windowStart,
    tenPlanWindowEnd: windowEnd,
    tenPlanCompletedCount: windowRows.length,
    tenPlanTotal: 10,
    tenPlanProgress: `${windowStart}-${windowEnd}: ${windowRows.length}/10`,
    tenPlanReportDue: windowRows.length === 10,
    completedPlanRows: windowRows.map((number) => `plan-${number}`)
  };
}

function buildReport(source, completedPlanState) {
  const summary = source.completionSummary ?? {};
  const completionBlockerActionRows = objectRows(summary.completionBlockerActionRows);
  const completionBlockerFocusRows = objectRows(summary.completionBlockerFocusRows);
  const latestPlanNumber = integerValue(summary.latestPlanNumber);
  const latestPlan = textValue(summary.latestPlan);
  const tenPlanProgress = textValue(summary.tenPlanProgress);
  const tenPlanCompletedCount = integerValue(summary.tenPlanCompletedCount);
  const tenPlanTotal = integerValue(summary.tenPlanTotal);
  const tenPlanReportDue = summary.tenPlanReportDue === true;
  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:completion-summary-smoke",
    sourceCommand: "npm run release:progress-refresh-smoke",
    sourceJsonArtifactName: "release-progress-refresh-smoke.json",
    sourceJsonPath: relative(sourceJsonPath),
    completionSummaryMarkdownArtifactName: "release-completion-summary-smoke.md",
    completionSummaryJsonArtifactName: "release-completion-summary-smoke.json",
    completionSummaryMarkdownPath: relative(readoutMarkdownPath),
    completionSummaryJsonPath: relative(readoutJsonPath),
    sourceReady: source.releaseProgressRefreshReady === true,
    sourceSummaryReady: summary.ready === true,
    sourceLabelsMatch: source.labelsMatch === true,
    latestPlanNumber,
    latestPlan,
    tenPlanProgress,
    tenPlanCompletedCount,
    tenPlanTotal,
    tenPlanReportDue,
    currentCompletedPlanNumber: completedPlanState.latestPlanNumber,
    currentCompletedPlan: completedPlanState.latestPlan,
    currentCompletedPlanTenPlanProgress: completedPlanState.tenPlanProgress,
    currentCompletedPlanTenPlanCompletedCount: completedPlanState.tenPlanCompletedCount,
    currentCompletedPlanTenPlanTotal: completedPlanState.tenPlanTotal,
    currentCompletedPlanTenPlanReportDue: completedPlanState.tenPlanReportDue,
    currentCompletedPlanWindowStart: completedPlanState.tenPlanWindowStart,
    currentCompletedPlanWindowEnd: completedPlanState.tenPlanWindowEnd,
    currentCompletedPlanRows: completedPlanState.completedPlanRows,
    sourceCompletedPlanStateReady: completedPlanState.latestPlanNumber > 0,
    sourceLatestPlanMatchesCurrentCompletedPlans:
      latestPlanNumber === completedPlanState.latestPlanNumber && latestPlan === completedPlanState.latestPlan,
    sourceTenPlanProgressMatchesCurrentCompletedPlans: tenPlanProgress === completedPlanState.tenPlanProgress,
    sourceTenPlanCountMatchesCurrentCompletedPlans:
      tenPlanCompletedCount === completedPlanState.tenPlanCompletedCount && tenPlanTotal === completedPlanState.tenPlanTotal,
    sourceTenPlanReportDueMatchesCurrentCompletedPlans: tenPlanReportDue === completedPlanState.tenPlanReportDue,
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
    operatorProofCommand: textValue(summary.operatorProofCommand),
    strictProofHandoffReceiptReady: summary.strictProofHandoffReceiptReady === true,
    privateEditBlockedSmokeReady: summary.privateEditBlockedSmokeReady === true,
    privateEditBlockedSmokeCurrentPlaceholderKeyCount: integerValue(summary.privateEditBlockedSmokeCurrentPlaceholderKeyCount),
    finalHandoffSuccessRedactionReady: summary.finalHandoffSuccessRedactionReady === true,
    postClearanceNextAction: textValue(summary.postClearanceNextAction),
    postClearanceProofCommand: textValue(summary.postClearanceProofCommand),
    firstBlocker: textValue(summary.firstBlocker),
    nextCommand: textValue(summary.nextCommand),
    rerunCommand: textValue(summary.rerunCommand),
    currentEnvEditTarget: textValue(summary.currentEnvEditTarget, ".env.distribution.local"),
    currentRequiredKeyCount: integerValue(summary.currentRequiredKeyCount),
    currentRequiredKeys: stringArrayValue(summary.currentRequiredKeys),
    currentPlaceholderKeyCount: integerValue(summary.currentPlaceholderKeyCount),
    currentPlaceholderKeys: stringArrayValue(summary.currentPlaceholderKeys),
    currentPlaceholderEditLocationCount: integerValue(summary.currentPlaceholderEditLocationCount),
    currentPlaceholderEditLocationSummary: textValue(summary.currentPlaceholderEditLocationSummary),
    placeholderInputReceiptReady: summary.placeholderInputReceiptReady === true,
    placeholderInputReceiptMode: textValue(summary.placeholderInputReceiptMode),
    placeholderInputReceiptPrivateInputFilePresent: summary.placeholderInputReceiptPrivateInputFilePresent === true,
    placeholderInputReceiptPrivateInputFileLoadedKeyCount: integerValue(summary.placeholderInputReceiptPrivateInputFileLoadedKeyCount),
    placeholderInputReceiptPrivateInputFileLoadedKeySummary: textValue(summary.placeholderInputReceiptPrivateInputFileLoadedKeySummary),
    placeholderInputReceiptPrivateInputFileMissingKeyCount: integerValue(summary.placeholderInputReceiptPrivateInputFileMissingKeyCount),
    placeholderInputReceiptPrivateInputFileMissingKeySummary: textValue(summary.placeholderInputReceiptPrivateInputFileMissingKeySummary),
    placeholderInputReceiptPrivateInputFilePlaceholderKeyCount: integerValue(summary.placeholderInputReceiptPrivateInputFilePlaceholderKeyCount),
    placeholderInputReceiptPrivateInputFilePlaceholderKeySummary: textValue(summary.placeholderInputReceiptPrivateInputFilePlaceholderKeySummary),
    placeholderInputReceiptPrivateInputFileInvalidShapeKeyCount: integerValue(summary.placeholderInputReceiptPrivateInputFileInvalidShapeKeyCount),
    placeholderInputReceiptPrivateInputFileInvalidShapeKeySummary: textValue(summary.placeholderInputReceiptPrivateInputFileInvalidShapeKeySummary),
    placeholderInputReceiptPrivateInputFileMissingLocationCount: integerValue(summary.placeholderInputReceiptPrivateInputFileMissingLocationCount),
    placeholderInputReceiptPrivateInputFileMissingLocationSummary: textValue(summary.placeholderInputReceiptPrivateInputFileMissingLocationSummary),
    placeholderInputReceiptPrivateInputFilePlaceholderLocationCount: integerValue(summary.placeholderInputReceiptPrivateInputFilePlaceholderLocationCount),
    placeholderInputReceiptPrivateInputFilePlaceholderLocationSummary: textValue(summary.placeholderInputReceiptPrivateInputFilePlaceholderLocationSummary),
    placeholderInputReceiptPrivateInputFileInvalidShapeLocationCount: integerValue(summary.placeholderInputReceiptPrivateInputFileInvalidShapeLocationCount),
    placeholderInputReceiptPrivateInputFileInvalidShapeLocationSummary: textValue(summary.placeholderInputReceiptPrivateInputFileInvalidShapeLocationSummary),
    placeholderInputReceiptRowCount: integerValue(summary.placeholderInputReceiptRowCount),
    placeholderInputReceiptCommandRowCount: integerValue(summary.placeholderInputReceiptCommandRowCount),
    placeholderInputReceiptNextOperatorCommand: textValue(summary.placeholderInputReceiptNextOperatorCommand),
    placeholderInputReceiptNextProofCommand: textValue(summary.placeholderInputReceiptNextProofCommand),
    placeholderInputReceiptValueRecorded: summary.placeholderInputReceiptValueRecorded === true ? true : false,
    completionBlockerActionReceiptReady: summary.completionBlockerActionReceiptReady === true,
    completionBlockerActionRows,
    completionBlockerActionRowCount: integerValue(summary.completionBlockerActionRowCount),
    completionBlockerActionRowsValueFree: summary.completionBlockerActionRowsValueFree === true && valueFreeRows(completionBlockerActionRows),
    completionBlockerFocusReceiptReady: summary.completionBlockerFocusReceiptReady === true,
    completionBlockerFocusCurrentReady: summary.completionBlockerFocusCurrentReady === true,
    completionBlockerFocusRows,
    completionBlockerFocusRowCount: integerValue(summary.completionBlockerFocusRowCount),
    completionBlockerFocusRowsValueFree: summary.completionBlockerFocusRowsValueFree === true && valueFreeRows(completionBlockerFocusRows),
    currentOperatorCommandSequenceReady: summary.currentOperatorCommandSequenceReady === true,
    currentOperatorCommandRows: objectRows(summary.currentOperatorCommandRows),
    currentOperatorCommandRowCount: integerValue(summary.currentOperatorCommandRowCount),
    currentOperatorCommandSummary: textValue(summary.currentOperatorCommandSummary),
    currentOperatorFirstCommand: textValue(summary.currentOperatorFirstCommand),
    currentOperatorStartCommand: textValue(summary.currentOperatorStartCommand, textValue(summary.currentOperatorFirstCommand)),
    currentOperatorStartCommandRole: textValue(summary.currentOperatorStartCommandRole, objectRows(summary.currentOperatorCommandRows)[0]?.role ?? "none"),
    currentOperatorStartCommandMatchesFirstCommand:
      summary.currentOperatorStartCommandMatchesFirstCommand === true ||
      textValue(summary.currentOperatorStartCommand, textValue(summary.currentOperatorFirstCommand)) ===
        textValue(summary.currentOperatorFirstCommand),
    currentOperatorPreflightCommand: textValue(summary.currentOperatorPreflightCommand, releaseChannelApplyPrivateEnvPreflightCommand),
    currentOperatorPreflightCommandOrder: integerValue(summary.currentOperatorPreflightCommandOrder),
    currentOperatorApplyCommand: textValue(summary.currentOperatorApplyCommand, releaseChannelApplyPrivateEnvCommand),
    currentOperatorApplyCommandOrder: integerValue(summary.currentOperatorApplyCommandOrder),
    currentOperatorStrictProofCommand: textValue(summary.currentOperatorStrictProofCommand, "npm run release:private-edit-strict-proof"),
    currentOperatorStrictProofCommandOrder: integerValue(summary.currentOperatorStrictProofCommandOrder),
    currentOperatorBlockerRefreshCommand: textValue(summary.currentOperatorBlockerRefreshCommand, "npm run release:current-blocker"),
    currentOperatorNextActionsRefreshCommand: textValue(summary.currentOperatorNextActionsRefreshCommand, "npm run release:next-actions"),
    currentOperatorPreflightBeforeApply: summary.currentOperatorPreflightBeforeApply === true,
    currentOperatorApplyBeforeStrictProof: summary.currentOperatorApplyBeforeStrictProof === true,
    currentOperatorStartCommandValueRecorded: summary.currentOperatorStartCommandValueRecorded === true ? true : false,
    currentOperatorValueRecorded: summary.currentOperatorValueRecorded === true ? true : false,
    releaseChannelGuidedSetupFallbackCommand: textValue(
      summary.releaseChannelGuidedSetupFallbackCommand,
      releaseChannelSetupWizardCommand
    ),
    releaseChannelGuidedSetupFallbackRole: textValue(
      summary.releaseChannelGuidedSetupFallbackRole,
      releaseChannelSetupWizardRole
    ),
    releaseChannelGuidedSetupFallbackReady: summary.releaseChannelGuidedSetupFallbackReady === true,
    releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence:
      summary.releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence === true,
    releaseChannelGuidedSetupFallbackValueRecorded:
      summary.releaseChannelGuidedSetupFallbackValueRecorded === true ? true : false,
    currentOperatorCommandRowsContainGuidedSetup: summary.currentOperatorCommandRowsContainGuidedSetup === true,
    releaseChannelPrivateInputTemplateCommand: textValue(
      summary.releaseChannelPrivateInputTemplateCommand,
      releaseChannelPrivateInputTemplateCommand
    ),
    releaseChannelPrivateInputTemplateRole: textValue(
      summary.releaseChannelPrivateInputTemplateRole,
      releaseChannelPrivateInputTemplateRole
    ),
    releaseChannelPrivateInputTemplateDefaultPath: textValue(
      summary.releaseChannelPrivateInputTemplateDefaultPath,
      ".env.release-channel.local"
    ),
    releaseChannelPrivateInputTemplatePrivateInputFileKey: textValue(
      summary.releaseChannelPrivateInputTemplatePrivateInputFileKey,
      "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE"
    ),
    releaseChannelPrivateInputTemplateBeforePreflight:
      summary.releaseChannelPrivateInputTemplateBeforePreflight === true,
    releaseChannelPrivateInputTemplateValueRecorded:
      summary.releaseChannelPrivateInputTemplateValueRecorded === true ? true : false,
    releaseChannelPrivateEnvApplyPreflightCommand: textValue(summary.releaseChannelPrivateEnvApplyPreflightCommand, releaseChannelApplyPrivateEnvPreflightCommand),
    releaseChannelPrivateEnvApplyPreflightRole: textValue(summary.releaseChannelPrivateEnvApplyPreflightRole, releaseChannelApplyPrivateEnvPreflightRole),
    releaseChannelPrivateEnvApplyPreflightBeforeApply:
      summary.releaseChannelPrivateEnvApplyPreflightBeforeApply === true ||
      (textValue(summary.releaseChannelPrivateEnvApplyPreflightCommand, releaseChannelApplyPrivateEnvPreflightCommand) === releaseChannelApplyPrivateEnvPreflightCommand &&
        textValue(summary.releaseChannelPrivateEnvApplyCommand, releaseChannelApplyPrivateEnvCommand) === releaseChannelApplyPrivateEnvCommand),
    releaseChannelPrivateEnvApplyPreflightValueRecorded: summary.releaseChannelPrivateEnvApplyPreflightValueRecorded === true ? true : false,
    releaseChannelPrivateEnvApplyCommand: textValue(summary.releaseChannelPrivateEnvApplyCommand, releaseChannelApplyPrivateEnvCommand),
    releaseChannelPrivateEnvApplyRole: textValue(summary.releaseChannelPrivateEnvApplyRole, releaseChannelApplyPrivateEnvRole),
    releaseChannelPrivateEnvApplyBeforeStrictProof:
      summary.releaseChannelPrivateEnvApplyBeforeStrictProof === true ||
      (textValue(summary.releaseChannelPrivateEnvApplyCommand, releaseChannelApplyPrivateEnvCommand) === releaseChannelApplyPrivateEnvCommand &&
        textValue(summary.releaseChannelFirstProofCommandAfterPrivateEdits) === "npm run release:channel-live-check" &&
        textValue(summary.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits) === "npm run release:private-edit-strict-proof"),
    releaseChannelPrivateEnvApplyValueRecorded: summary.releaseChannelPrivateEnvApplyValueRecorded === true ? true : false,
    releaseChannelPrivateEnvApplyProofCommand: textValue(summary.releaseChannelPrivateEnvApplyProofCommand, releaseChannelApplyPrivateEnvProofCommand),
    releaseChannelPrivateEnvApplyProofRole: textValue(summary.releaseChannelPrivateEnvApplyProofRole, releaseChannelApplyPrivateEnvProofRole),
    releaseChannelPrivateEnvApplyProofAfterPreflight:
      summary.releaseChannelPrivateEnvApplyProofAfterPreflight === true ||
      textValue(summary.releaseChannelPrivateEnvApplyProofCommand, releaseChannelApplyPrivateEnvProofCommand) === releaseChannelApplyPrivateEnvProofCommand,
    releaseChannelPrivateEnvApplyProofValueRecorded: summary.releaseChannelPrivateEnvApplyProofValueRecorded === true ? true : false,
    releaseChannelFirstProofCommandAfterPrivateEdits: textValue(summary.releaseChannelFirstProofCommandAfterPrivateEdits),
    releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits: textValue(summary.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits),
    hardGateReady: summary.hardGateReady === true,
    hardGateWouldFail: summary.hardGateWouldFail === true,
    privateValuesRecorded: summary.privateValuesRecorded === true,
    claimedAutoUpdate: summary.claimedAutoUpdate === true,
    claimedExternalDistribution: summary.claimedExternalDistribution === true,
    completionSummaryReadoutReady: false,
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
    claimedAppStoreSubmission: false
  };
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

function formatCurrentOperatorCommandRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.step)} | ${readyLabel(row.ready === true)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${escapeCell(row.expectedOperatorInput)} | ${escapeCell(row.expectedEvidence)} | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Completion Summary Smoke

## Completion Summary

- Completion summary readout ready: ${readyLabel(report.completionSummaryReadoutReady)}
- Source command: \`${report.sourceCommand}\`
- Source JSON: ${report.sourceJsonPath}
- Source ready: ${readyLabel(report.sourceReady)}
- Source summary ready: ${readyLabel(report.sourceSummaryReady)}
- Source labels match: ${readyLabel(report.sourceLabelsMatch)}
- Latest completed plan: ${report.latestPlan}
- 10-plan progress: ${report.tenPlanProgress}
- Current completed-plan latest: ${report.currentCompletedPlan}
- Current completed-plan 10-plan progress: ${report.currentCompletedPlanTenPlanProgress}
- Source latest plan matches current completed plans: ${readyLabel(report.sourceLatestPlanMatchesCurrentCompletedPlans)}
- Source 10-plan progress matches current completed plans: ${readyLabel(report.sourceTenPlanProgressMatchesCurrentCompletedPlans)}
- User-facing completion: ${report.completionPercent}%
- Remaining completion: ${report.remainingPercent}%
- Fresh artifacts: ${report.freshArtifactCount}
- Stale artifacts: ${report.staleArtifactCount}
- Missing artifacts: ${report.missingArtifactCount}
- Operator completion brief ready: ${readyLabel(report.operatorBriefReady)}
- Release-channel metadata blocked: ${readyLabel(report.releaseChannelMetadataBlocked)}
- Release-channel metadata cleared: ${readyLabel(report.releaseChannelMetadataCleared)}
- Release-channel metadata needs ignored env: ${readyLabel(report.releaseChannelMetadataNeedsIgnoredEnv)}
- Release-channel current ready rows: ${report.releaseChannelCurrentReadyCount}/${report.releaseChannelCurrentRequiredKeyCount}
- Release-channel placeholders: ${report.releaseChannelCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}
- Operator proof command: \`${report.operatorProofCommand}\`
- Strict proof handoff ready: ${readyLabel(report.strictProofHandoffReceiptReady)}
- Private-edit blocked smoke ready: ${readyLabel(report.privateEditBlockedSmokeReady)}
- Private-edit blocked smoke placeholders: ${report.privateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}
- Final handoff success-redaction ready: ${readyLabel(report.finalHandoffSuccessRedactionReady)}
- Post-clearance next action: ${report.postClearanceNextAction}
- Post-clearance proof command: \`${report.postClearanceProofCommand}\`
- Next command: \`${report.nextCommand}\`
- Rerun command: \`${report.rerunCommand}\`
- Current first blocker: ${report.firstBlocker}
- Current env edit target: ${report.currentEnvEditTarget}
- Current required keys: ${report.currentRequiredKeyCount} (${formatKeyList(report.currentRequiredKeys)})
- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})
- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})
- Placeholder input receipt ready: ${readyLabel(report.placeholderInputReceiptReady)}
- Placeholder input receipt mode: ${report.placeholderInputReceiptMode}
- Placeholder private input file present: ${readyLabel(report.placeholderInputReceiptPrivateInputFilePresent)}
- Placeholder private input loaded keys: ${report.placeholderInputReceiptPrivateInputFileLoadedKeyCount} (${report.placeholderInputReceiptPrivateInputFileLoadedKeySummary})
- Placeholder private input missing/placeholder/invalid rows: ${report.placeholderInputReceiptPrivateInputFileMissingKeyCount}/${report.placeholderInputReceiptPrivateInputFilePlaceholderKeyCount}/${report.placeholderInputReceiptPrivateInputFileInvalidShapeKeyCount}
- Placeholder private input missing locations: ${report.placeholderInputReceiptPrivateInputFileMissingLocationCount} (${report.placeholderInputReceiptPrivateInputFileMissingLocationSummary})
- Placeholder private input placeholder locations: ${report.placeholderInputReceiptPrivateInputFilePlaceholderLocationCount} (${report.placeholderInputReceiptPrivateInputFilePlaceholderLocationSummary})
- Placeholder private input invalid-shape locations: ${report.placeholderInputReceiptPrivateInputFileInvalidShapeLocationCount} (${report.placeholderInputReceiptPrivateInputFileInvalidShapeLocationSummary})
- Placeholder input next operator command: \`${report.placeholderInputReceiptNextOperatorCommand}\`
- Completion blocker action receipt ready: ${readyLabel(report.completionBlockerActionReceiptReady)}
- Completion blocker action rows: ${report.completionBlockerActionRowCount}
- Completion blocker focus receipt ready: ${readyLabel(report.completionBlockerFocusReceiptReady)}
- Completion blocker focus rows: ${report.completionBlockerFocusRowCount}
- Current operator command sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Current operator start command: \`${report.currentOperatorStartCommand}\`
- Current operator start command role: ${report.currentOperatorStartCommandRole}
- Current operator start command matches first command: ${readyLabel(report.currentOperatorStartCommandMatchesFirstCommand)}
- Current operator preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Current operator apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Guided setup fallback command: \`${report.releaseChannelGuidedSetupFallbackCommand}\`
- Guided setup fallback ready: ${readyLabel(report.releaseChannelGuidedSetupFallbackReady)}
- Guided setup fallback separate from primary sequence: ${readyLabel(report.releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence)}
- Primary rows contain guided setup fallback: ${readyLabel(report.currentOperatorCommandRowsContainGuidedSetup)}
- Private input template command: \`${report.releaseChannelPrivateInputTemplateCommand}\`
- Private input template default path: \`${report.releaseChannelPrivateInputTemplateDefaultPath}\`
- Private input template before preflight: ${readyLabel(report.releaseChannelPrivateInputTemplateBeforePreflight)}
- Private env apply preflight command: \`${report.releaseChannelPrivateEnvApplyPreflightCommand}\`
- Private env apply preflight before apply: ${readyLabel(report.releaseChannelPrivateEnvApplyPreflightBeforeApply)}
- Private env apply command: \`${report.releaseChannelPrivateEnvApplyCommand}\`
- Private env apply before strict proof: ${readyLabel(report.releaseChannelPrivateEnvApplyBeforeStrictProof)}
- Private env apply proof runner command: \`${report.releaseChannelPrivateEnvApplyProofCommand}\`
- Private env apply proof runner after preflight: ${readyLabel(report.releaseChannelPrivateEnvApplyProofAfterPreflight)}
- First proof after private edits: \`${report.releaseChannelFirstProofCommandAfterPrivateEdits}\`
- Recommended operator proof chain: \`${report.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits}\`
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Private values recorded: ${readyLabel(report.privateValuesRecorded)}
- Auto-update claimed: ${readyLabel(report.claimedAutoUpdate)}
- External distribution claimed: ${readyLabel(report.claimedExternalDistribution)}

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

## Current Operator Command Sequence

- Sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- First command: \`${report.currentOperatorFirstCommand}\`
- Operator start command: \`${report.currentOperatorStartCommand}\`
- Operator start role: ${report.currentOperatorStartCommandRole}
- Start matches first command: ${readyLabel(report.currentOperatorStartCommandMatchesFirstCommand)}
- Preflight command: \`${report.currentOperatorPreflightCommand}\`
- Apply command: \`${report.currentOperatorApplyCommand}\`
- Strict proof command: \`${report.currentOperatorStrictProofCommand}\`
- Guided setup fallback command: \`${report.releaseChannelGuidedSetupFallbackCommand}\`
- Guided setup fallback role: ${report.releaseChannelGuidedSetupFallbackRole}
- Guided setup fallback ready: ${readyLabel(report.releaseChannelGuidedSetupFallbackReady)}
- Guided setup fallback separate from primary sequence: ${readyLabel(report.releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence)}
- Primary rows contain guided setup fallback: ${readyLabel(report.currentOperatorCommandRowsContainGuidedSetup)}
- Current-blocker refresh command: \`${report.currentOperatorBlockerRefreshCommand}\`
- Next-actions refresh command: \`${report.currentOperatorNextActionsRefreshCommand}\`
- Preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Value recorded: ${readyLabel(report.currentOperatorValueRecorded)}

| order | step | ready | command | role | expected operator input | expected evidence | source | value recorded |
|---:|---|---:|---|---|---|---|---|---:|
${formatCurrentOperatorCommandRows(report.currentOperatorCommandRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this readout.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.sourceReady === true, "release completion summary should require ready progress refresh source");
  check(report.sourceSummaryReady === true, "release completion summary should require ready compact source summary");
  check(report.sourceLabelsMatch === true, "release completion summary should require matched source labels");
  check(report.sourceCompletedPlanStateReady === true, "release completion summary should derive current completed-plan filesystem state");
  check(report.latestPlanNumber > 0, "release completion summary should include latest plan number");
  check(report.latestPlan === `plan-${report.latestPlanNumber}`, "release completion summary should format latest plan");
  check(report.sourceLatestPlanMatchesCurrentCompletedPlans === true, "release completion summary source latest plan should match current completed plan files");
  check(report.sourceTenPlanProgressMatchesCurrentCompletedPlans === true, "release completion summary source 10-plan progress should match current completed plan files");
  check(report.sourceTenPlanCountMatchesCurrentCompletedPlans === true, "release completion summary source 10-plan counts should match current completed plan files");
  check(report.sourceTenPlanReportDueMatchesCurrentCompletedPlans === true, "release completion summary source 10-plan report due posture should match current completed plan files");
  check(report.currentCompletedPlanRows.length === report.currentCompletedPlanTenPlanCompletedCount, "release completion summary current completed-plan rows should match current 10-plan count");
  check(report.tenPlanTotal === 10, "release completion summary should use ten-plan totals");
  check(report.tenPlanProgress === `${report.latestPlanNumber - ((report.latestPlanNumber - 1) % 10)}-${report.latestPlanNumber - ((report.latestPlanNumber - 1) % 10) + 9}: ${report.tenPlanCompletedCount}/10`, "release completion summary should align latest plan window");
  check(report.completionPercent === 99.999999, "release completion summary should preserve completion percent");
  check(report.remainingPercent === 0.000001, "release completion summary should preserve remaining percent");
  check(report.freshArtifactCount > 0, "release completion summary should report fresh artifacts");
  check(report.staleArtifactCount === 0, "release completion summary should report zero stale artifacts");
  check(report.missingArtifactCount === 0, "release completion summary should report zero missing artifacts");
  check(report.operatorBriefReady === true, "release completion summary should keep operator brief ready");
  check(report.releaseChannelMetadataBlocked !== report.releaseChannelMetadataCleared, "release completion summary should keep exactly one release-channel metadata posture");
  check(
    !report.releaseChannelMetadataBlocked ||
      report.releaseChannelCurrentPlaceholderKeyCount === 4 ||
      report.releaseChannelMetadataNeedsIgnoredEnv,
    "release completion summary should keep placeholders or require ignored env setup while blocked"
  );
  check(!report.releaseChannelMetadataCleared || report.releaseChannelCurrentPlaceholderKeyCount === 0, "release completion summary should allow zero placeholders when cleared");
  check(report.operatorProofCommand === "npm run release:private-edit-strict-proof", "release completion summary should keep strict proof as operator proof command");
  check(report.strictProofHandoffReceiptReady === true, "release completion summary should expose strict proof handoff readiness");
  check(report.privateEditBlockedSmokeReady === true, "release completion summary should expose private-edit blocked smoke readiness");
  check(report.privateEditBlockedSmokeCurrentPlaceholderKeyCount === 4, "release completion summary should expose blocked smoke coverage for four placeholders");
  check(report.finalHandoffSuccessRedactionReady === true, "release completion summary should expose final handoff success-redaction readiness");
  check(report.postClearanceNextAction === "auto-update-feed", "release completion summary should keep auto-update-feed as post-clearance next action");
  check(report.postClearanceProofCommand === "npm run desktop:auto-update-readiness-smoke", "release completion summary should keep auto-update readiness as post-clearance proof command");
  check(report.currentEnvEditTarget !== "none", "release completion summary should expose current env edit target");
  check(report.currentRequiredKeyCount === 4, "release completion summary should expose four current release-channel required keys");
  check(report.currentRequiredKeys.length === report.currentRequiredKeyCount, "release completion summary required keys should match count");
  check(report.currentPlaceholderKeys.length === report.currentPlaceholderKeyCount, "release completion summary placeholder keys should match count");
  check(report.currentPlaceholderEditLocationCount === report.currentPlaceholderKeyCount, "release completion summary placeholder edit locations should match placeholders");
  check(
    report.currentPlaceholderEditLocationSummary.includes(report.currentEnvEditTarget) ||
      (report.currentPlaceholderEditLocationCount === 0 && report.currentPlaceholderEditLocationSummary === "none"),
    "release completion summary should expose value-free edit location summary or none before ignored env setup"
  );
  check(report.placeholderInputReceiptReady === true, "release completion summary should expose ready placeholder input receipt evidence");
  check(
    ["missing-private-input-file", "incomplete-private-input-file", "placeholder-private-input-file", "invalid-shape-private-input-file", "ready-private-input-file", "review-private-input-file"].includes(
      report.placeholderInputReceiptMode
    ),
    "release completion summary should expose a known placeholder input receipt mode"
  );
  check(report.placeholderInputReceiptRowCount === 4, "release completion summary should expose four placeholder input receipt rows");
  check(report.placeholderInputReceiptCommandRowCount >= 5, "release completion summary should expose placeholder input command rows");
  check(report.placeholderInputReceiptValueRecorded === false, "release completion summary placeholder input receipt should stay value-free");
  check(
    report.placeholderInputReceiptPrivateInputFilePlaceholderLocationCount === 0 ||
      report.placeholderInputReceiptPrivateInputFilePlaceholderLocationSummary !== "none",
    "release completion summary should expose private input placeholder file/line locations"
  );
  check(
    report.placeholderInputReceiptPrivateInputFileMissingLocationCount === 0 ||
      report.placeholderInputReceiptPrivateInputFileMissingLocationSummary !== "none",
    "release completion summary should expose private input missing file/key locations"
  );
  check(
    report.placeholderInputReceiptPrivateInputFileInvalidShapeLocationCount === 0 ||
      report.placeholderInputReceiptPrivateInputFileInvalidShapeLocationSummary !== "none",
    "release completion summary should expose private input invalid-shape file/key locations"
  );
  check(report.completionBlockerActionReceiptReady === true, "release completion summary should expose ready blocker action receipt");
  check(report.completionBlockerActionRowCount === report.completionBlockerActionRows.length, "release completion summary blocker action row count should match rows");
  check(report.completionBlockerActionRowCount === 7, "release completion summary blocker action receipt should include seven rows");
  check(report.completionBlockerActionRowsValueFree === true, "release completion summary blocker action rows should be value-free");
  check(report.completionBlockerActionRows.every((row) => row.ready === true && row.valueRecorded === false), "release completion summary blocker action rows should be ready and value-free");
  check(report.completionBlockerActionRows.some((row) => row.item === "Edit target" && row.evidence === report.currentEnvEditTarget), "release completion summary blocker action rows should include edit target");
  check(report.completionBlockerActionRows.some((row) => row.item === "First proof after edit" && row.proofCommand === "npm run release:channel-live-check"), "release completion summary blocker action rows should include first proof command");
  check(report.completionBlockerActionRows.some((row) => row.item === "Recommended proof chain" && row.proofCommand === "npm run release:private-edit-strict-proof"), "release completion summary blocker action rows should include strict proof chain");
  check(report.completionBlockerFocusReceiptReady === true, "release completion summary should expose ready blocker focus receipt");
  check(report.completionBlockerFocusRowCount === report.completionBlockerFocusRows.length, "release completion summary blocker focus row count should match rows");
  check(report.completionBlockerFocusRowCount === 4, "release completion summary blocker focus receipt should include four rows");
  check(report.completionBlockerFocusRowsValueFree === true, "release completion summary blocker focus rows should be value-free");
  check(report.completionBlockerFocusRows.every((row) => row.valueRecorded === false), "release completion summary blocker focus rows should not record values");
  check(report.completionBlockerFocusRows.every((row) => report.currentRequiredKeys.includes(row.key)), "release completion summary blocker focus rows should match required keys");
  check(report.currentOperatorCommandSequenceReady === true, "release completion summary current operator command sequence should be ready");
  check(report.currentOperatorCommandRowCount === report.currentOperatorCommandRows.length, "release completion summary current operator command row count should match rows");
  check(report.currentOperatorCommandRows.length >= 5, "release completion summary current operator command sequence should include preflight, apply, strict proof, blocker refresh, and next-actions refresh");
  check(report.currentOperatorCommandRows.every((row) => row.ready === true && row.valueRecorded === false), "release completion summary current operator command rows should be ready and value-free");
  check(report.currentOperatorStartCommand === report.currentOperatorFirstCommand, "release completion summary current operator start command should mirror first command");
  check(report.currentOperatorStartCommand === report.currentOperatorCommandRows[0]?.command, "release completion summary current operator start command should match first row command");
  check(report.currentOperatorStartCommandRole === report.currentOperatorCommandRows[0]?.role, "release completion summary current operator start command role should match first row role");
  check(report.currentOperatorStartCommandMatchesFirstCommand === true, "release completion summary current operator start command should declare first-command match");
  check(report.currentOperatorStartCommandValueRecorded === false, "release completion summary current operator start command should be value-free");
  check(report.currentOperatorPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand, "release completion summary current operator sequence should expose private env preflight command");
  check(report.currentOperatorApplyCommand === releaseChannelApplyPrivateEnvCommand, "release completion summary current operator sequence should expose private env apply command");
  check(report.currentOperatorStrictProofCommand === "npm run release:private-edit-strict-proof", "release completion summary current operator sequence should expose strict proof command");
  check(report.currentOperatorPreflightBeforeApply === true, "release completion summary current operator sequence should place preflight before apply");
  check(report.currentOperatorApplyBeforeStrictProof === true, "release completion summary current operator sequence should place apply before strict proof");
  check(report.currentOperatorBlockerRefreshCommand === "npm run release:current-blocker", "release completion summary current operator sequence should include current-blocker refresh");
  check(report.currentOperatorNextActionsRefreshCommand === "npm run release:next-actions", "release completion summary current operator sequence should include next-actions refresh");
  check(report.currentOperatorValueRecorded === false, "release completion summary current operator sequence should be value-free");
  check(report.releaseChannelGuidedSetupFallbackCommand === releaseChannelSetupWizardCommand, "release completion summary should expose guided setup fallback command");
  check(report.releaseChannelGuidedSetupFallbackRole === releaseChannelSetupWizardRole, "release completion summary should expose guided setup fallback role");
  check(report.releaseChannelGuidedSetupFallbackReady === true, "release completion summary guided setup fallback should be ready");
  check(
    report.releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence === true,
    "release completion summary guided setup fallback should stay outside primary operator sequence"
  );
  check(report.releaseChannelGuidedSetupFallbackValueRecorded === false, "release completion summary guided setup fallback should be value-free");
  check(report.currentOperatorCommandRowsContainGuidedSetup === false, "release completion summary current operator rows should not include guided setup fallback");
  check(report.releaseChannelPrivateInputTemplateCommand === releaseChannelPrivateInputTemplateCommand, "release completion summary should expose private input template command");
  check(report.releaseChannelPrivateInputTemplateRole === releaseChannelPrivateInputTemplateRole, "release completion summary should expose private input template role");
  check(report.releaseChannelPrivateInputTemplateDefaultPath === ".env.release-channel.local", "release completion summary should expose private input template default path");
  check(
    report.releaseChannelPrivateInputTemplatePrivateInputFileKey === "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE",
    "release completion summary should expose private input template file key"
  );
  check(report.releaseChannelPrivateInputTemplateBeforePreflight === true, "release completion summary should place private input template before preflight");
  check(report.releaseChannelPrivateInputTemplateValueRecorded === false, "release completion summary private input template command should be value-free");
  check(report.releaseChannelPrivateEnvApplyPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand, "release completion summary should expose private env apply preflight command");
  check(report.releaseChannelPrivateEnvApplyPreflightRole === releaseChannelApplyPrivateEnvPreflightRole, "release completion summary should describe private env apply preflight role");
  check(report.releaseChannelPrivateEnvApplyPreflightBeforeApply === true, "release completion summary should place private env apply preflight before apply");
  check(report.releaseChannelPrivateEnvApplyPreflightValueRecorded === false, "release completion summary private env apply preflight command should be value-free");
  check(report.releaseChannelPrivateEnvApplyCommand === releaseChannelApplyPrivateEnvCommand, "release completion summary should expose private env apply command");
  check(report.releaseChannelPrivateEnvApplyRole === releaseChannelApplyPrivateEnvRole, "release completion summary should describe private env apply role");
  check(report.releaseChannelPrivateEnvApplyBeforeStrictProof === true, "release completion summary should place private env apply before strict proof");
  check(report.releaseChannelPrivateEnvApplyValueRecorded === false, "release completion summary private env apply command should be value-free");
  check(report.releaseChannelPrivateEnvApplyProofCommand === releaseChannelApplyPrivateEnvProofCommand, "release completion summary should expose private env apply proof runner command");
  check(report.releaseChannelPrivateEnvApplyProofRole === releaseChannelApplyPrivateEnvProofRole, "release completion summary should describe private env apply proof runner role");
  check(report.releaseChannelPrivateEnvApplyProofAfterPreflight === true, "release completion summary should keep proof runner after preflight readiness");
  check(report.releaseChannelPrivateEnvApplyProofValueRecorded === false, "release completion summary private env apply proof runner command should be value-free");
  check(report.releaseChannelFirstProofCommandAfterPrivateEdits === "npm run release:channel-live-check", "release completion summary should expose release-channel first proof command");
  check(report.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits === "npm run release:private-edit-strict-proof", "release completion summary should expose recommended proof chain");
  check(report.hardGateReady === false, "release completion summary should keep hard gate unready");
  check(report.hardGateWouldFail === true, "release completion summary should keep hard gate would-fail posture");
  check(report.privateValuesRecorded === false, "release completion summary should not record private values");
  check(report.claimedAutoUpdate === false, "release completion summary should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release completion summary should not claim external distribution");
  check(report.networkProbeAttempted === false, "release completion summary should not probe networks");
  check(report.updateFeedPublishAttempted === false, "release completion summary should not publish update feeds");
  check(report.distributionChannelProbeAttempted === false, "release completion summary should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "release completion summary should not upload releases");
  check(report.signingAttempted === false, "release completion summary should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release completion summary should not submit to Apple");
  check(!/https?:\/\//i.test(serialized), "release completion summary JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release completion summary Markdown should not include URL values");
  check(markdown.includes("Release Completion Summary Smoke"), "release completion summary Markdown should include title");
  check(markdown.includes("Completion summary readout ready: yes"), "release completion summary Markdown should include readiness");
  check(markdown.includes("Source latest plan matches current completed plans: yes"), "release completion summary Markdown should include current-plan guard status");
  check(markdown.includes("## Completion Blocker Action Receipt"), "release completion summary Markdown should include completion blocker action receipt");
  check(markdown.includes("## Completion Blocker Focus Rows"), "release completion summary Markdown should include completion blocker focus rows");
  check(markdown.includes("Completion blocker action receipt ready: yes"), "release completion summary Markdown should include blocker action receipt readiness");
  check(markdown.includes("Current operator command sequence ready: yes"), "release completion summary Markdown should include current operator command sequence readiness");
  check(markdown.includes("Current operator start command:"), "release completion summary Markdown should include current operator start command");
  check(markdown.includes("Current operator start command role:"), "release completion summary Markdown should include current operator start command role");
  check(markdown.includes("Current operator start command matches first command:"), "release completion summary Markdown should include current operator start command match");
  check(markdown.includes("Guided setup fallback command:"), "release completion summary Markdown should include guided setup fallback command");
  check(markdown.includes("Guided setup fallback separate from primary sequence:"), "release completion summary Markdown should include guided fallback primary sequence boundary");
  check(markdown.includes("Placeholder input receipt ready:"), "release completion summary Markdown should include placeholder input receipt readiness");
  check(markdown.includes("Placeholder input receipt mode:"), "release completion summary Markdown should include placeholder input receipt mode");
  check(markdown.includes("Placeholder private input missing/placeholder/invalid rows:"), "release completion summary Markdown should include placeholder input row counts");
  check(markdown.includes("Placeholder private input placeholder locations:"), "release completion summary Markdown should include placeholder input file/line locations");
  check(markdown.includes("Current Operator Command Sequence"), "release completion summary Markdown should include current operator command sequence");
  check(markdown.includes("Private input template command:"), "release completion summary Markdown should include private input template command");

  if (failures.length > 0) {
    fail("Validation failed.", `${failures.map((message) => `- ${message}`).join("\n")}\n${buildSourceGuidance(report)}`);
  }
}

const source = await readJsonRequired(sourceJsonPath, "Release progress refresh smoke");
const completedPlanState = await currentCompletedPlanState();
const report = buildReport(source, completedPlanState);
report.completionSummaryReadoutReady = true;
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(readoutMarkdownPath, markdown, "utf8");
await writeFile(readoutJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release completion summary smoke passed.");
console.log(`- Markdown: ${relative(readoutMarkdownPath)}`);
console.log(`- JSON: ${relative(readoutJsonPath)}`);
console.log("- Completion summary readout ready: yes");
console.log(`- Source command: ${report.sourceCommand}`);
console.log(`- Latest completed plan: ${report.latestPlan}`);
console.log(`- 10-plan progress: ${report.tenPlanProgress}`);
console.log(`- Current completed-plan latest: ${report.currentCompletedPlan}`);
console.log(`- Current completed-plan 10-plan progress: ${report.currentCompletedPlanTenPlanProgress}`);
console.log(`- Source latest plan matches current completed plans: ${report.sourceLatestPlanMatchesCurrentCompletedPlans ? "yes" : "no"}`);
console.log(`- Source 10-plan progress matches current completed plans: ${report.sourceTenPlanProgressMatchesCurrentCompletedPlans ? "yes" : "no"}`);
console.log(`- User-facing completion: ${report.completionPercent}%`);
console.log(`- Remaining completion: ${report.remainingPercent}%`);
console.log(`- Fresh artifacts: ${report.freshArtifactCount}`);
console.log(`- Stale artifacts: ${report.staleArtifactCount}`);
console.log(`- Missing artifacts: ${report.missingArtifactCount}`);
console.log(`- Operator proof command: ${report.operatorProofCommand}`);
console.log(`- Release-channel metadata needs ignored env: ${report.releaseChannelMetadataNeedsIgnoredEnv ? "yes" : "no"}`);
console.log(`- Strict proof handoff ready: ${report.strictProofHandoffReceiptReady ? "yes" : "no"}`);
console.log(`- Private-edit blocked smoke ready: ${report.privateEditBlockedSmokeReady ? "yes" : "no"}`);
console.log(
  `- Private-edit blocked smoke placeholders: ${report.privateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}`
);
console.log(`- Final handoff success-redaction ready: ${report.finalHandoffSuccessRedactionReady ? "yes" : "no"}`);
console.log(`- Completion blocker action receipt ready: ${report.completionBlockerActionReceiptReady ? "yes" : "no"}`);
console.log(`- Completion blocker action rows: ${report.completionBlockerActionRowCount}`);
console.log(`- Completion blocker focus rows: ${report.completionBlockerFocusRowCount}`);
console.log(`- Current operator command sequence ready: ${report.currentOperatorCommandSequenceReady ? "yes" : "no"}`);
console.log(`- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})`);
console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
console.log(`- Current operator start command: ${report.currentOperatorStartCommand}`);
console.log(`- Current operator start command role: ${report.currentOperatorStartCommandRole}`);
console.log(`- Current operator start command matches first command: ${report.currentOperatorStartCommandMatchesFirstCommand ? "yes" : "no"}`);
console.log(`- Current operator preflight before apply: ${report.currentOperatorPreflightBeforeApply ? "yes" : "no"}`);
console.log(`- Current operator apply before strict proof: ${report.currentOperatorApplyBeforeStrictProof ? "yes" : "no"}`);
console.log(`- Guided setup fallback command: ${report.releaseChannelGuidedSetupFallbackCommand}`);
console.log(`- Guided setup fallback ready: ${report.releaseChannelGuidedSetupFallbackReady ? "yes" : "no"}`);
console.log(`- Guided setup fallback separate from primary sequence: ${report.releaseChannelGuidedSetupFallbackSeparateFromPrimarySequence ? "yes" : "no"}`);
console.log(`- Private input template command: ${report.releaseChannelPrivateInputTemplateCommand}`);
console.log(`- Private input template default path: ${report.releaseChannelPrivateInputTemplateDefaultPath}`);
console.log(`- Private env apply preflight command: ${report.releaseChannelPrivateEnvApplyPreflightCommand}`);
console.log(`- Private env apply preflight before apply: ${report.releaseChannelPrivateEnvApplyPreflightBeforeApply ? "yes" : "no"}`);
console.log(`- Private env apply command: ${report.releaseChannelPrivateEnvApplyCommand}`);
console.log(`- Private env apply before strict proof: ${report.releaseChannelPrivateEnvApplyBeforeStrictProof ? "yes" : "no"}`);
console.log(`- Private env apply proof runner command: ${report.releaseChannelPrivateEnvApplyProofCommand}`);
console.log(`- Private env apply proof runner after preflight: ${report.releaseChannelPrivateEnvApplyProofAfterPreflight ? "yes" : "no"}`);
console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
console.log(`- Current required keys: ${report.currentRequiredKeyCount} (${formatKeyList(report.currentRequiredKeys)})`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})`);
console.log(`- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})`);
console.log(`- Placeholder input receipt ready: ${report.placeholderInputReceiptReady ? "yes" : "no"}`);
console.log(`- Placeholder input receipt mode: ${report.placeholderInputReceiptMode}`);
console.log(`- Placeholder private input file present: ${report.placeholderInputReceiptPrivateInputFilePresent ? "yes" : "no"}`);
console.log(`- Placeholder private input loaded keys: ${report.placeholderInputReceiptPrivateInputFileLoadedKeyCount}`);
console.log(
  `- Placeholder private input missing/placeholder/invalid rows: ${report.placeholderInputReceiptPrivateInputFileMissingKeyCount}/${report.placeholderInputReceiptPrivateInputFilePlaceholderKeyCount}/${report.placeholderInputReceiptPrivateInputFileInvalidShapeKeyCount}`
);
console.log(
  `- Placeholder private input placeholder locations: ${report.placeholderInputReceiptPrivateInputFilePlaceholderLocationCount} (${report.placeholderInputReceiptPrivateInputFilePlaceholderLocationSummary})`
);
console.log(`- Placeholder input next operator command: ${report.placeholderInputReceiptNextOperatorCommand}`);
console.log(`- Current first blocker: ${report.firstBlocker}`);
console.log(`- Private values recorded: ${report.privateValuesRecorded ? "yes" : "no"}`);
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
