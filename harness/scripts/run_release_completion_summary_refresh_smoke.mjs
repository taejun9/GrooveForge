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
const receiptStem = "release-completion-summary-refresh-smoke";
const progressRefreshStem = "release-progress-refresh-smoke";
const completionSummaryStem = "release-completion-summary-smoke";
const progressRefreshJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${progressRefreshStem}.json`);
const completionSummaryJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${completionSummaryStem}.json`);
const receiptMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${receiptStem}.md`);
const receiptJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${receiptStem}.json`);
const failures = [];
const refreshCommands = [
  {
    order: 1,
    command: "npm run release:progress-refresh-smoke",
    role: "refresh progress, current-blocker, completion-packet, freshness, and operator-brief evidence",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:completion-summary-smoke",
    role: "emit compact after-work completion summary from the refreshed progress receipt",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release completion summary refresh smoke failed:");
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

function percentLabel(value, fallback = "none") {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}%`;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const trimmed = value.trim();
    return trimmed.endsWith("%") ? trimmed : `${trimmed}%`;
  }
  return fallback;
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
    fail(`${command} exited with status ${result.status}.`, "Refresh the required release evidence, then rerun this command.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function formatCommandRows(rows) {
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function buildReport({ progressRefresh, completionSummary }) {
  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:completion-summary-refresh-smoke",
    refreshCommands,
    progressRefreshCommand: "npm run release:progress-refresh-smoke",
    completionSummaryCommand: "npm run release:completion-summary-smoke",
    progressRefreshJsonArtifactName: "release-progress-refresh-smoke.json",
    completionSummaryJsonArtifactName: "release-completion-summary-smoke.json",
    completionSummaryRefreshMarkdownArtifactName: "release-completion-summary-refresh-smoke.md",
    completionSummaryRefreshJsonArtifactName: "release-completion-summary-refresh-smoke.json",
    progressRefreshJsonPath: relative(progressRefreshJsonPath),
    completionSummaryJsonPath: relative(completionSummaryJsonPath),
    completionSummaryRefreshMarkdownPath: relative(receiptMarkdownPath),
    completionSummaryRefreshJsonPath: relative(receiptJsonPath),
    progressRefreshReady: progressRefresh.releaseProgressRefreshReady === true,
    progressRefreshCompletionSummaryReady: progressRefresh.completionSummary?.ready === true,
    progressRefreshLabelsMatch: progressRefresh.labelsMatch === true,
    completionSummaryReadoutReady: completionSummary.completionSummaryReadoutReady === true,
    completionSummarySourceReady: completionSummary.sourceReady === true,
    completionSummarySourceSummaryReady: completionSummary.sourceSummaryReady === true,
    completionSummarySourceLabelsMatch: completionSummary.sourceLabelsMatch === true,
    latestPlanNumber: integerValue(completionSummary.latestPlanNumber),
    latestPlan: textValue(completionSummary.latestPlan),
    tenPlanProgress: textValue(completionSummary.tenPlanProgress),
    tenPlanCompletedCount: integerValue(completionSummary.tenPlanCompletedCount),
    tenPlanTotal: integerValue(completionSummary.tenPlanTotal),
    tenPlanReportDue: completionSummary.tenPlanReportDue === true,
    completionPercent: percentLabel(completionSummary.completionPercent),
    remainingPercent: percentLabel(completionSummary.remainingPercent),
    freshArtifactCount: integerValue(completionSummary.freshArtifactCount),
    staleArtifactCount: integerValue(completionSummary.staleArtifactCount),
    missingArtifactCount: integerValue(completionSummary.missingArtifactCount),
    operatorBriefReady: completionSummary.operatorBriefReady === true,
    releaseChannelMetadataBlocked: completionSummary.releaseChannelMetadataBlocked === true,
    releaseChannelMetadataCleared: completionSummary.releaseChannelMetadataCleared === true,
    releaseChannelCurrentReadyCount: integerValue(completionSummary.releaseChannelCurrentReadyCount),
    releaseChannelCurrentRequiredKeyCount: integerValue(completionSummary.releaseChannelCurrentRequiredKeyCount),
    releaseChannelCurrentPlaceholderKeyCount: integerValue(completionSummary.releaseChannelCurrentPlaceholderKeyCount),
    operatorProofCommand: textValue(completionSummary.operatorProofCommand),
    strictProofHandoffReceiptReady: completionSummary.strictProofHandoffReceiptReady === true,
    privateEditBlockedSmokeReady: completionSummary.privateEditBlockedSmokeReady === true,
    privateEditBlockedSmokeCurrentPlaceholderKeyCount: integerValue(completionSummary.privateEditBlockedSmokeCurrentPlaceholderKeyCount),
    finalHandoffSuccessRedactionReady: completionSummary.finalHandoffSuccessRedactionReady === true,
    postClearanceNextAction: textValue(completionSummary.postClearanceNextAction),
    postClearanceProofCommand: textValue(completionSummary.postClearanceProofCommand),
    firstBlocker: textValue(completionSummary.firstBlocker),
    nextCommand: textValue(completionSummary.nextCommand),
    hardGateReady: completionSummary.hardGateReady === true,
    hardGateWouldFail: completionSummary.hardGateWouldFail === true,
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    appleNotarySubmissionAttempted: false,
    signingAttempted: false,
    claimedAutoUpdate: false,
    claimedExternalDistribution: false,
    completionSummaryRefreshReady: false
  };
}

function buildMarkdown(report) {
  return `# ${appName} Release Completion Summary Refresh Smoke

## Summary

- Refresh receipt ready: ${readyLabel(report.completionSummaryRefreshReady)}
- Progress refresh ready: ${readyLabel(report.progressRefreshReady)}
- Completion summary readout ready: ${readyLabel(report.completionSummaryReadoutReady)}
- Latest completed plan: ${report.latestPlan}
- 10-plan progress: ${report.tenPlanProgress}
- User-facing completion: ${report.completionPercent}
- Remaining completion: ${report.remainingPercent}
- Fresh artifacts: ${report.freshArtifactCount}
- Stale artifacts: ${report.staleArtifactCount}
- Missing artifacts: ${report.missingArtifactCount}
- Operator proof command: \`${report.operatorProofCommand}\`
- Strict proof handoff ready: ${readyLabel(report.strictProofHandoffReceiptReady)}
- Private-edit blocked smoke ready: ${readyLabel(report.privateEditBlockedSmokeReady)}
- Private-edit blocked smoke placeholders: ${report.privateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}
- Final handoff success-redaction ready: ${readyLabel(report.finalHandoffSuccessRedactionReady)}
- Current first blocker: ${report.firstBlocker}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- External distribution claimed: no

## Command Order

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.refreshCommands)}

## Source Artifacts

- Progress refresh JSON: ${report.progressRefreshJsonPath}
- Completion summary JSON: ${report.completionSummaryJsonPath}

## Not Claimed

This refresh does not claim auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, release upload, remote channel probing, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  check(report.progressRefreshReady === true, "release completion summary refresh should run a ready progress refresh first");
  check(report.progressRefreshCompletionSummaryReady === true, "release completion summary refresh should keep progress compact summary ready");
  check(report.progressRefreshLabelsMatch === true, "release completion summary refresh should keep progress labels matched");
  check(report.completionSummaryReadoutReady === true, "release completion summary refresh should emit ready completion summary readout");
  check(report.completionSummarySourceReady === true, "release completion summary refresh should keep completion summary source ready");
  check(report.completionSummarySourceSummaryReady === true, "release completion summary refresh should keep completion summary source compact summary ready");
  check(report.completionSummarySourceLabelsMatch === true, "release completion summary refresh should keep completion summary labels matched");
  check(report.latestPlanNumber > 0, "release completion summary refresh should include latest plan number");
  check(report.latestPlan === `plan-${report.latestPlanNumber}`, "release completion summary refresh should format latest plan");
  check(report.tenPlanTotal === 10, "release completion summary refresh should keep 10-plan denominator");
  check(report.tenPlanCompletedCount >= 1 && report.tenPlanCompletedCount <= 10, "release completion summary refresh should keep current 10-plan count");
  check(report.tenPlanProgress.includes(`${report.tenPlanCompletedCount}/10`), "release completion summary refresh should include current 10-plan progress");
  check(report.completionPercent === "99.999999%", "release completion summary refresh should keep current user-facing completion");
  check(report.remainingPercent === "0.000001%", "release completion summary refresh should keep current remaining completion");
  check(report.freshArtifactCount >= 6, "release completion summary refresh should keep refreshed artifacts fresh");
  check(report.staleArtifactCount === 0, "release completion summary refresh should keep stale artifact count zero");
  check(report.missingArtifactCount === 0, "release completion summary refresh should keep missing artifact count zero");
  check(report.operatorBriefReady === true, "release completion summary refresh should keep operator brief ready");
  check(report.operatorProofCommand === "npm run release:private-edit-strict-proof", "release completion summary refresh should keep strict proof as operator proof command");
  check(report.strictProofHandoffReceiptReady === true, "release completion summary refresh should expose strict proof handoff readiness");
  check(report.privateEditBlockedSmokeReady === true, "release completion summary refresh should expose private-edit blocked smoke readiness");
  check(
    report.privateEditBlockedSmokeCurrentPlaceholderKeyCount === report.releaseChannelCurrentRequiredKeyCount,
    "release completion summary refresh should expose blocked smoke coverage for current release-channel placeholders"
  );
  check(report.finalHandoffSuccessRedactionReady === true, "release completion summary refresh should expose final handoff success-redaction readiness");
  check(report.postClearanceNextAction === "auto-update-feed", "release completion summary refresh should keep auto-update-feed as post-clearance next action");
  check(report.postClearanceProofCommand === "npm run desktop:auto-update-readiness-smoke", "release completion summary refresh should keep auto-update readiness as post-clearance proof command");
  check(report.hardGateReady === false, "release completion summary refresh should keep hard gate unready");
  check(report.hardGateWouldFail === true, "release completion summary refresh should keep hard gate would-fail posture");
  check(report.privateValuesRecorded === false, "release completion summary refresh should not record private values");
  check(report.networkProbeAttempted === false, "release completion summary refresh should not probe networks");
  check(report.releaseUploadAttempted === false, "release completion summary refresh should not upload releases");
  check(report.appleNotarySubmissionAttempted === false, "release completion summary refresh should not submit to Apple");
  check(report.signingAttempted === false, "release completion summary refresh should not sign artifacts");
  check(report.claimedAutoUpdate === false, "release completion summary refresh should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release completion summary refresh should not claim external distribution");
  check(markdown.includes("## Command Order"), "release completion summary refresh Markdown should include command order");
  check(markdown.includes("npm run release:progress-refresh-smoke"), "release completion summary refresh Markdown should cite progress refresh command");
  check(markdown.includes("npm run release:completion-summary-smoke"), "release completion summary refresh Markdown should cite completion summary command");
}

async function main() {
  for (const step of refreshCommands) {
    console.log(`Refreshing release completion summary evidence: ${step.command}`);
    runNpmScript(step.command);
  }

  const [progressRefresh, completionSummary] = await Promise.all([
    readJsonRequired(progressRefreshJsonPath, "release progress refresh"),
    readJsonRequired(completionSummaryJsonPath, "release completion summary")
  ]);
  const report = buildReport({ progressRefresh, completionSummary });
  report.completionSummaryRefreshReady = true;
  const markdown = buildMarkdown(report);
  validateReport(report, markdown);

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }

  await mkdir(packageRoot, { recursive: true });
  await writeFile(receiptMarkdownPath, markdown, "utf8");
  await writeFile(receiptJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("GrooveForge release completion summary refresh smoke passed.");
  console.log(`- Markdown: ${relative(receiptMarkdownPath)}`);
  console.log(`- JSON: ${relative(receiptJsonPath)}`);
  console.log(`- Latest completed plan: ${report.latestPlan}`);
  console.log(`- 10-plan progress: ${report.tenPlanProgress}`);
  console.log(`- User-facing completion: ${report.completionPercent}`);
  console.log(`- Remaining completion: ${report.remainingPercent}`);
  console.log(`- Fresh artifacts: ${report.freshArtifactCount}`);
  console.log(`- Stale artifacts: ${report.staleArtifactCount}`);
  console.log(`- Missing artifacts: ${report.missingArtifactCount}`);
  console.log(`- Operator proof command: ${report.operatorProofCommand}`);
  console.log(`- Strict proof handoff ready: ${report.strictProofHandoffReceiptReady ? "yes" : "no"}`);
  console.log(`- Private-edit blocked smoke ready: ${report.privateEditBlockedSmokeReady ? "yes" : "no"}`);
  console.log(
    `- Private-edit blocked smoke placeholders: ${report.privateEditBlockedSmokeCurrentPlaceholderKeyCount}/${report.releaseChannelCurrentRequiredKeyCount}`
  );
  console.log(`- Final handoff success-redaction ready: ${report.finalHandoffSuccessRedactionReady ? "yes" : "no"}`);
  console.log(`- Current first blocker: ${report.firstBlocker}`);
  console.log("- Private values recorded: no");
  console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
  console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
}

await main();
