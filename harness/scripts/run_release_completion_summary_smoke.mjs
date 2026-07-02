#!/usr/bin/env node

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
const sourceStem = "release-progress-refresh-smoke";
const readoutStem = "release-completion-summary-smoke";
const sourceRefreshCommand = "npm run release:progress-refresh-smoke";
const readoutRefreshCommand = "npm run release:completion-summary-refresh-smoke";
const sourceJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${sourceStem}.json`);
const readoutMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${readoutStem}.md`);
const readoutJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${readoutStem}.json`);
const failures = [];
const releaseChannelApplyPrivateEnvPreflightCommand = "npm run release:channel-apply-private-env-preflight";
const releaseChannelApplyPrivateEnvPreflightRole =
  "verify operator-owned release-channel process env values before writing the ignored local env";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
const releaseChannelApplyPrivateEnvRole =
  "apply operator-owned release-channel process env values into the ignored local env before strict proof";

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
    `- Strict proof handoff ready: ${readyLabel(report.strictProofHandoffReceiptReady)}`,
    `- Private-edit blocked smoke ready: ${readyLabel(report.privateEditBlockedSmokeReady)}`,
    `- Final handoff success-redaction ready: ${readyLabel(report.finalHandoffSuccessRedactionReady)}`,
    `Run ${readoutRefreshCommand} for after-work completion reports.`,
    `Run ${sourceRefreshCommand} before npm run release:completion-summary-smoke when only the source bundle needs refreshing.`
  ].join("\n");
}

function buildReport(source) {
  const summary = source.completionSummary ?? {};
  const completionBlockerActionRows = objectRows(summary.completionBlockerActionRows);
  const completionBlockerFocusRows = objectRows(summary.completionBlockerFocusRows);
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
    latestPlanNumber: integerValue(summary.latestPlanNumber),
    latestPlan: textValue(summary.latestPlan),
    tenPlanProgress: textValue(summary.tenPlanProgress),
    tenPlanCompletedCount: integerValue(summary.tenPlanCompletedCount),
    tenPlanTotal: integerValue(summary.tenPlanTotal),
    tenPlanReportDue: summary.tenPlanReportDue === true,
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
    currentOperatorValueRecorded: summary.currentOperatorValueRecorded === true ? true : false,
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
- Completion blocker action receipt ready: ${readyLabel(report.completionBlockerActionReceiptReady)}
- Completion blocker action rows: ${report.completionBlockerActionRowCount}
- Completion blocker focus receipt ready: ${readyLabel(report.completionBlockerFocusReceiptReady)}
- Completion blocker focus rows: ${report.completionBlockerFocusRowCount}
- Current operator command sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Current operator command rows: ${report.currentOperatorCommandRowCount} (${report.currentOperatorCommandSummary})
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Current operator preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Current operator apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Private env apply preflight command: \`${report.releaseChannelPrivateEnvApplyPreflightCommand}\`
- Private env apply preflight before apply: ${readyLabel(report.releaseChannelPrivateEnvApplyPreflightBeforeApply)}
- Private env apply command: \`${report.releaseChannelPrivateEnvApplyCommand}\`
- Private env apply before strict proof: ${readyLabel(report.releaseChannelPrivateEnvApplyBeforeStrictProof)}
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
- Preflight command: \`${report.currentOperatorPreflightCommand}\`
- Apply command: \`${report.currentOperatorApplyCommand}\`
- Strict proof command: \`${report.currentOperatorStrictProofCommand}\`
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
  check(report.latestPlanNumber > 0, "release completion summary should include latest plan number");
  check(report.latestPlan === `plan-${report.latestPlanNumber}`, "release completion summary should format latest plan");
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
  check(report.currentOperatorPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand, "release completion summary current operator sequence should expose private env preflight command");
  check(report.currentOperatorApplyCommand === releaseChannelApplyPrivateEnvCommand, "release completion summary current operator sequence should expose private env apply command");
  check(report.currentOperatorStrictProofCommand === "npm run release:private-edit-strict-proof", "release completion summary current operator sequence should expose strict proof command");
  check(report.currentOperatorPreflightBeforeApply === true, "release completion summary current operator sequence should place preflight before apply");
  check(report.currentOperatorApplyBeforeStrictProof === true, "release completion summary current operator sequence should place apply before strict proof");
  check(report.currentOperatorBlockerRefreshCommand === "npm run release:current-blocker", "release completion summary current operator sequence should include current-blocker refresh");
  check(report.currentOperatorNextActionsRefreshCommand === "npm run release:next-actions", "release completion summary current operator sequence should include next-actions refresh");
  check(report.currentOperatorValueRecorded === false, "release completion summary current operator sequence should be value-free");
  check(report.releaseChannelPrivateEnvApplyPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand, "release completion summary should expose private env apply preflight command");
  check(report.releaseChannelPrivateEnvApplyPreflightRole === releaseChannelApplyPrivateEnvPreflightRole, "release completion summary should describe private env apply preflight role");
  check(report.releaseChannelPrivateEnvApplyPreflightBeforeApply === true, "release completion summary should place private env apply preflight before apply");
  check(report.releaseChannelPrivateEnvApplyPreflightValueRecorded === false, "release completion summary private env apply preflight command should be value-free");
  check(report.releaseChannelPrivateEnvApplyCommand === releaseChannelApplyPrivateEnvCommand, "release completion summary should expose private env apply command");
  check(report.releaseChannelPrivateEnvApplyRole === releaseChannelApplyPrivateEnvRole, "release completion summary should describe private env apply role");
  check(report.releaseChannelPrivateEnvApplyBeforeStrictProof === true, "release completion summary should place private env apply before strict proof");
  check(report.releaseChannelPrivateEnvApplyValueRecorded === false, "release completion summary private env apply command should be value-free");
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
  check(markdown.includes("## Completion Blocker Action Receipt"), "release completion summary Markdown should include completion blocker action receipt");
  check(markdown.includes("## Completion Blocker Focus Rows"), "release completion summary Markdown should include completion blocker focus rows");
  check(markdown.includes("Completion blocker action receipt ready: yes"), "release completion summary Markdown should include blocker action receipt readiness");
  check(markdown.includes("Current operator command sequence ready: yes"), "release completion summary Markdown should include current operator command sequence readiness");
  check(markdown.includes("Current Operator Command Sequence"), "release completion summary Markdown should include current operator command sequence");

  if (failures.length > 0) {
    fail("Validation failed.", `${failures.map((message) => `- ${message}`).join("\n")}\n${buildSourceGuidance(report)}`);
  }
}

const source = await readJsonRequired(sourceJsonPath, "Release progress refresh smoke");
const report = buildReport(source);
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
console.log(`- Current operator preflight before apply: ${report.currentOperatorPreflightBeforeApply ? "yes" : "no"}`);
console.log(`- Current operator apply before strict proof: ${report.currentOperatorApplyBeforeStrictProof ? "yes" : "no"}`);
console.log(`- Private env apply preflight command: ${report.releaseChannelPrivateEnvApplyPreflightCommand}`);
console.log(`- Private env apply preflight before apply: ${report.releaseChannelPrivateEnvApplyPreflightBeforeApply ? "yes" : "no"}`);
console.log(`- Private env apply command: ${report.releaseChannelPrivateEnvApplyCommand}`);
console.log(`- Private env apply before strict proof: ${report.releaseChannelPrivateEnvApplyBeforeStrictProof ? "yes" : "no"}`);
console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
console.log(`- Current required keys: ${report.currentRequiredKeyCount} (${formatKeyList(report.currentRequiredKeys)})`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})`);
console.log(`- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})`);
console.log(`- Current first blocker: ${report.firstBlocker}`);
console.log(`- Private values recorded: ${report.privateValuesRecorded ? "yes" : "no"}`);
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
