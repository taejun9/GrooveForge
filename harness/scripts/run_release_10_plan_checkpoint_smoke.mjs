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
const expectedSourceRefreshCommandSummary =
  "npm run release:proof-bundle -> npm run desktop:external-distribution-gate-smoke -> npm run release:update-feed-checkpoint-smoke -> npm run release:progress-smoke -> npm run release:current-blocker-smoke -> npm run release:completion-report-packet-smoke -> npm run release:progress-freshness-smoke -> npm run release:operator-completion-brief-smoke";
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
  const sourceRefreshCommandsValueFree =
    sourceRefreshCommandRows.length > 0 && sourceRefreshCommandRows.every((row) => row?.valueRecorded === false);
  const sourceProofGateRefreshRowsValueFree = sourceProofGateRefreshRows.every((row) => row.valueRecorded === false);
  const sourceProofGateRefreshReady =
    source.releaseProgressRefreshReady === true &&
    integerValue(source.refreshCommandCount) === 8 &&
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
    releaseChannelCurrentReadyCount: integerValue(summary.releaseChannelCurrentReadyCount),
    releaseChannelCurrentRequiredKeyCount: integerValue(summary.releaseChannelCurrentRequiredKeyCount),
    releaseChannelCurrentPlaceholderKeyCount: integerValue(summary.releaseChannelCurrentPlaceholderKeyCount),
    operatorProofCommand: textValue(summary.operatorProofCommand),
    postClearanceNextAction: textValue(summary.postClearanceNextAction),
    postClearanceProofCommand: textValue(summary.postClearanceProofCommand),
    firstBlocker: textValue(summary.firstBlocker),
    nextCommand: textValue(summary.nextCommand),
    rerunCommand: textValue(summary.rerunCommand),
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
    claimedAppStoreSubmission: false
  };
}

function buildMarkdown(report) {
  const rows = report.tenPlanWindowRows
    .map((row) => `| ${row.label} | ${row.path} | ${readyLabel(!row.valueRecorded)} |`)
    .join("\n");
  const proofGateRows = report.sourceProofGateRefreshRows
    .map(
      (row) =>
        `| ${row.order} | \`${escapeCell(row.command)}\` | \`${escapeCell(row.expectedCommand)}\` | ${readyLabel(row.commandMatched)} | ${escapeCell(row.role)} | ${readyLabel(row.roleMatched)} | ${readyLabel(row.valueRecorded)} |`
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
- Post-clearance next action: ${report.postClearanceNextAction}
- Post-clearance proof command: \`${report.postClearanceProofCommand}\`
- Current first blocker: ${report.firstBlocker}
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
  check(report.sourceRefreshCommandCount === 8, "release 10-plan checkpoint should require the full source refresh command sequence");
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
  check(!report.releaseChannelMetadataBlocked || report.releaseChannelCurrentPlaceholderKeyCount === 4, "release 10-plan checkpoint should keep four placeholders while blocked");
  check(!report.releaseChannelMetadataCleared || report.releaseChannelCurrentPlaceholderKeyCount === 0, "release 10-plan checkpoint should allow zero placeholders when cleared");
  check(report.operatorProofCommand === "npm run release:private-edit-strict-proof", "release 10-plan checkpoint should keep strict proof as operator proof command");
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
console.log(`- Latest completed plan: ${report.localLatestPlan}`);
console.log(`- 10-plan progress: ${report.localTenPlanProgress}`);
console.log(`- Current 10-plan report boundary: ${report.currentTenPlanReportBoundaryAt}`);
console.log(`- Post-delivery next 10-plan report: ${report.postDeliveryNextTenPlanProgressReportAt}`);
console.log(`- User-facing completion: ${report.completionPercent}%`);
console.log(`- Remaining completion: ${report.remainingPercent}%`);
console.log(`- Fresh artifacts: ${report.freshArtifactCount}`);
console.log(`- Stale artifacts: ${report.staleArtifactCount}`);
console.log(`- Missing artifacts: ${report.missingArtifactCount}`);
console.log(`- Operator proof command: ${report.operatorProofCommand}`);
console.log(`- Current first blocker: ${report.firstBlocker}`);
console.log(`- Private values recorded: ${report.privateValuesRecorded ? "yes" : "no"}`);
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
