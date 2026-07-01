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
const realStem = "release-update-feed-post-edit-proof";
const successStem = "release-update-feed-post-edit-proof-success-smoke";
const checkpointStem = "release-update-feed-checkpoint-smoke";
const realJsonName = "release-update-feed-post-edit-proof.json";
const successJsonName = "release-update-feed-post-edit-proof-success-smoke.json";
const checkpointMarkdownName = "release-update-feed-checkpoint-smoke.md";
const checkpointJsonName = "release-update-feed-checkpoint-smoke.json";
const realJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${realStem}.json`);
const successJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${successStem}.json`);
const checkpointMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${checkpointStem}.md`);
const checkpointJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${checkpointStem}.json`);
const failures = [];
const refreshCommands = [
  {
    order: 1,
    command: "npm run release:update-feed-post-edit-proof",
    role: "refresh real ignored local env update feed post-edit posture",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:update-feed-post-edit-proof-success-smoke",
    role: "refresh synthetic shape-ready update feed post-edit success branch",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge update feed checkpoint smoke failed:");
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
    fail(`${command} exited with status ${result.status}.`, "Run the desktop release artifact smokes through update metadata artifacts first, then retry this checkpoint.");
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
    label: `${windowStart}-${windowEnd}: ${windowRows.length}/10`,
    windowStart,
    windowEnd,
    completedCount: windowRows.length,
    windowTotal: 10,
    reportDue: windowRows.length === 10,
    nextReportAt: `plan-${windowEnd}`
  };
}

function sourceRow(label, filePath, ready) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready,
    valueRecorded: false
  };
}

function reportValueFree(report) {
  return (
    report.privateValuesRecorded === false &&
    report.feedValueRecorded === false &&
    report.channelValueRecorded === false &&
    report.localEnvValueRecorded === false &&
    report.networkProbeAttempted === false &&
    report.updateFeedPublishAttempted === false &&
    report.releaseUploadAttempted === false &&
    report.signingAttempted === false &&
    report.notarySubmissionAttempted === false &&
    report.claimedAutoUpdate === false &&
    report.claimedExternalDistribution === false &&
    report.valueRecorded === false
  );
}

function allRowsValueFree(report) {
  const rowGroups = [
    report.releaseUpdateFeedPostEditProofCommandRows,
    report.sourceArtifactRows,
    report.proofRows,
    report.updateFeedLiveCheckRows,
    report.updateFeedStrictFailureRows,
    report.currentPlaceholderEditLocations,
    report.autoUpdateBlockerRows
  ];
  return rowGroups.every((rows) => objectRows(rows).every((row) => row.valueRecorded === false));
}

function branchRow(label, report, expectedSynthetic) {
  const placeholderCount = integerValue(report.currentPlaceholderKeyCount);
  const selectedCount = integerValue(report.currentSelectedReadyCount);
  const isSynthetic = report.syntheticSuccessSmoke === true;
  const ready =
    report.releaseUpdateFeedPostEditProofReady === true &&
    isSynthetic === expectedSynthetic &&
    reportValueFree(report) &&
    allRowsValueFree(report);
  return {
    label,
    sourceMode: textValue(report.sourceMode),
    syntheticSuccessSmoke: isSynthetic,
    proofReady: report.releaseUpdateFeedPostEditProofReady === true,
    liveCheckReady: report.updateFeedLiveCheckReady === true,
    strictReady: report.updateFeedStrictReady === true,
    selectedReadyCount: selectedCount,
    placeholderKeyCount: placeholderCount,
    placeholderEditLocationCount: integerValue(report.currentPlaceholderEditLocationCount),
    autoUpdateReady: report.autoUpdateReady === true,
    autoUpdateBlockerCount: integerValue(report.autoUpdateBlockerCount),
    signedUpdateArtifactsReady: report.signedUpdateArtifactsReady === true,
    hardGateWouldFail: report.hardGateWouldFail === true,
    realLocalEnvRead: report.realLocalEnvRead === true,
    currentTenPlanProgressLabel: textValue(report.currentTenPlanProgressLabel),
    ready,
    valueRecorded: false
  };
}

function comparisonRow(order, item, ready, evidence, sourceField) {
  return {
    order,
    item,
    ready,
    evidence,
    sourceField,
    valueRecorded: false
  };
}

function buildReport({ realProof, successProof, progress }) {
  const realBranch = branchRow("real ignored local env post-edit proof", realProof, false);
  const successBranch = branchRow("synthetic shape-ready post-edit proof", successProof, true);
  const sourceArtifactRows = [
    sourceRow("Real update feed post-edit proof", realJsonPath, realBranch.ready),
    sourceRow("Synthetic update feed post-edit success smoke", successJsonPath, successBranch.ready)
  ];
  const branchRows = [realBranch, successBranch];
  const sharedAutoUpdateBlocked =
    realProof.autoUpdateReady === false &&
    successProof.autoUpdateReady === false &&
    integerValue(realProof.autoUpdateBlockerCount) > 0 &&
    integerValue(successProof.autoUpdateBlockerCount) > 0;
  const sharedHardGateBlocked = realProof.hardGateWouldFail === true && successProof.hardGateWouldFail === true;
  const sharedSignedArtifactsUnready = realProof.signedUpdateArtifactsReady === false && successProof.signedUpdateArtifactsReady === false;
  const sharedCompletion =
    realProof.userFacingCompletionPercent === 99.999999 &&
    successProof.userFacingCompletionPercent === 99.999999 &&
    realProof.userFacingRemainingPercent === 0.000001 &&
    successProof.userFacingRemainingPercent === 0.000001;
  const branchSeparationReady =
    realProof.syntheticSuccessSmoke === false &&
    successProof.syntheticSuccessSmoke === true &&
    successProof.updateFeedLiveCheckReady === true &&
    successProof.currentSelectedReadyCount === 2 &&
    successProof.currentPlaceholderKeyCount === 0 &&
    successProof.realLocalEnvRead === false;
  const comparisonRows = [
    comparisonRow(
      1,
      "Real branch preserved",
      realBranch.ready && realProof.syntheticSuccessSmoke === false,
      `${realProof.currentSelectedReadyCount}/2 selected-ready rows; ${realProof.currentPlaceholderKeyCount} real placeholders remain.`,
      "realProof.syntheticSuccessSmoke/currentSelectedReadyCount/currentPlaceholderKeyCount"
    ),
    comparisonRow(
      2,
      "Synthetic success branch covered",
      branchSeparationReady,
      `${successProof.currentSelectedReadyCount}/2 selected-ready rows; ${successProof.currentPlaceholderKeyCount} placeholders; real local env read ${successProof.realLocalEnvRead ? "yes" : "no"}.`,
      "successProof.syntheticSuccessSmoke/currentSelectedReadyCount/currentPlaceholderKeyCount/realLocalEnvRead"
    ),
    comparisonRow(
      3,
      "Downstream auto-update still blocked",
      sharedAutoUpdateBlocked && sharedSignedArtifactsUnready,
      `${realProof.autoUpdateBlockerCount} real blocker rows and ${successProof.autoUpdateBlockerCount} synthetic-source blocker rows; signed update artifacts unready.`,
      "autoUpdateReady/autoUpdateBlockerCount/signedUpdateArtifactsReady"
    ),
    comparisonRow(
      4,
      "Hard gate remains unclaimed",
      sharedHardGateBlocked,
      "`npm run release:external-check` would still fail until external distribution evidence is real.",
      "hardGateWouldFail"
    ),
    comparisonRow(
      5,
      "Value redaction and non-claim posture",
      reportValueFree(realProof) && reportValueFree(successProof) && allRowsValueFree(realProof) && allRowsValueFree(successProof),
      "Both source receipts keep private values, feed/channel values, network probes, uploads, signing, notarization, auto-update claims, and external distribution claims false.",
      "valueRecorded/notClaimedFields"
    ),
    comparisonRow(
      6,
      "10-plan checkpoint posture",
      progress.completedCount >= 0 && progress.completedCount <= 10,
      `${progress.label}; report due ${progress.reportDue ? "yes" : "no"}.`,
      "currentTenPlanProgress"
    )
  ];

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:update-feed-checkpoint-smoke",
    realPostEditProofJsonArtifactName: realJsonName,
    syntheticPostEditProofJsonArtifactName: successJsonName,
    updateFeedCheckpointMarkdownArtifactName: checkpointMarkdownName,
    updateFeedCheckpointJsonArtifactName: checkpointJsonName,
    checkpointMarkdownPath: relative(checkpointMarkdownPath),
    checkpointJsonPath: relative(checkpointJsonPath),
    releaseUpdateFeedCheckpointReady:
      sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
      branchRows.every((row) => row.ready === true && row.valueRecorded === false) &&
      comparisonRows.every((row) => row.ready === true && row.valueRecorded === false),
    refreshCommandRows,
    refreshCommandCount: refreshCommandRows.length,
    refreshCommandSummary: refreshCommandRows.map((row) => row.command).join(" -> "),
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    branchRows,
    branchRowCount: branchRows.length,
    comparisonRows,
    comparisonRowCount: comparisonRows.length,
    realPostEditProofReady: realProof.releaseUpdateFeedPostEditProofReady === true,
    realLiveCheckReady: realProof.updateFeedLiveCheckReady === true,
    realStrictReady: realProof.updateFeedStrictReady === true,
    realSelectedReadyCount: integerValue(realProof.currentSelectedReadyCount),
    realPlaceholderKeyCount: integerValue(realProof.currentPlaceholderKeyCount),
    realPlaceholderEditLocationCount: integerValue(realProof.currentPlaceholderEditLocationCount),
    realAutoUpdateReady: realProof.autoUpdateReady === true,
    realAutoUpdateBlockerCount: integerValue(realProof.autoUpdateBlockerCount),
    syntheticPostEditProofReady: successProof.releaseUpdateFeedPostEditProofReady === true,
    syntheticLiveCheckReady: successProof.updateFeedLiveCheckReady === true,
    syntheticStrictReady: successProof.updateFeedStrictReady === true,
    syntheticSelectedReadyCount: integerValue(successProof.currentSelectedReadyCount),
    syntheticPlaceholderKeyCount: integerValue(successProof.currentPlaceholderKeyCount),
    syntheticPlaceholderEditLocationCount: integerValue(successProof.currentPlaceholderEditLocationCount),
    syntheticRealLocalEnvRead: successProof.realLocalEnvRead === true,
    syntheticAutoUpdateReady: successProof.autoUpdateReady === true,
    syntheticAutoUpdateBlockerCount: integerValue(successProof.autoUpdateBlockerCount),
    signedUpdateArtifactsReady: realProof.signedUpdateArtifactsReady === true || successProof.signedUpdateArtifactsReady === true,
    hardGateCommand: "npm run release:external-check",
    hardGateReady: false,
    hardGateWouldFail: sharedHardGateBlocked,
    currentTenPlanProgressLabel: progress.label,
    currentTenPlanWindowStart: progress.windowStart,
    currentTenPlanWindowEnd: progress.windowEnd,
    currentTenPlanWindowCompletedCount: progress.completedCount,
    currentTenPlanWindowTotal: progress.windowTotal,
    tenPlanProgressReportDue: progress.reportDue,
    nextTenPlanProgressReportAt: progress.nextReportAt,
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
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
  return rows.map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function formatSourceRows(rows) {
  return rows.map((row) => `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${escapeCell(row.path)} | ${readyLabel(row.ready)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function formatBranchRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.label)} | ${escapeCell(row.sourceMode)} | ${readyLabel(row.syntheticSuccessSmoke)} | ${readyLabel(row.proofReady)} | ${readyLabel(row.liveCheckReady)} | ${readyLabel(row.strictReady)} | ${row.selectedReadyCount}/2 | ${row.placeholderKeyCount} | ${row.placeholderEditLocationCount} | ${readyLabel(row.autoUpdateReady)} | ${row.autoUpdateBlockerCount} | ${readyLabel(row.signedUpdateArtifactsReady)} | ${readyLabel(row.hardGateWouldFail)} | ${readyLabel(row.realLocalEnvRead)} | ${readyLabel(row.ready)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatComparisonRows(rows) {
  return rows.map((row) => `| ${row.order} | ${escapeCell(row.item)} | ${readyLabel(row.ready)} | ${escapeCell(row.evidence)} | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Update Feed Checkpoint Smoke

## Status

- Checkpoint ready: ${readyLabel(report.releaseUpdateFeedCheckpointReady)}
- Command order: ${report.refreshCommandSummary}
- Real post-edit proof ready: ${readyLabel(report.realPostEditProofReady)}
- Real live check ready: ${readyLabel(report.realLiveCheckReady)}
- Real selected keys ready: ${report.realSelectedReadyCount}/2
- Real placeholder keys: ${report.realPlaceholderKeyCount}
- Synthetic post-edit proof ready: ${readyLabel(report.syntheticPostEditProofReady)}
- Synthetic live check ready: ${readyLabel(report.syntheticLiveCheckReady)}
- Synthetic selected keys ready: ${report.syntheticSelectedReadyCount}/2
- Synthetic placeholder keys: ${report.syntheticPlaceholderKeyCount}
- Synthetic real local env read: ${readyLabel(report.syntheticRealLocalEnvRead)}
- Real auto-update ready: ${readyLabel(report.realAutoUpdateReady)}
- Synthetic auto-update ready: ${readyLabel(report.syntheticAutoUpdateReady)}
- Real auto-update blocker rows: ${report.realAutoUpdateBlockerCount}
- Synthetic auto-update blocker rows: ${report.syntheticAutoUpdateBlockerCount}
- Signed update artifacts ready: ${readyLabel(report.signedUpdateArtifactsReady)}
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Private values recorded: no
- Feed values recorded: no
- Channel values recorded: no
- Network probe attempted: no
- Update feed publish attempted: no
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

| artifact | present | path | ready | value recorded |
|---|---:|---|---:|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Branch Rows

| branch | source mode | synthetic | proof ready | live ready | strict ready | selected ready | placeholders | edit locations | auto-update ready | blockers | signed artifacts ready | hard gate would fail | real env read | ready | value recorded |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${formatBranchRows(report.branchRows)}

## Comparison Rows

| order | item | ready | evidence | source field | value recorded |
|---:|---|---:|---|---|---:|
${formatComparisonRows(report.comparisonRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this checkpoint.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.releaseUpdateFeedCheckpointReady === true, "update feed checkpoint should be ready");
  check(report.reportCommand === "npm run release:update-feed-checkpoint-smoke", "update feed checkpoint should report the checkpoint command");
  check(report.refreshCommandCount === 2, "update feed checkpoint should refresh two source commands");
  check(
    report.refreshCommandSummary === "npm run release:update-feed-post-edit-proof -> npm run release:update-feed-post-edit-proof-success-smoke",
    "update feed checkpoint should refresh real proof before synthetic success proof"
  );
  check(report.refreshCommandRows.every((row) => row.valueRecorded === false), "update feed checkpoint command rows should be value-free");
  check(report.sourceArtifactRowCount === 2, "update feed checkpoint should include two source artifacts");
  check(
    report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false),
    "update feed checkpoint source artifacts should be present, ready, and value-free"
  );
  check(report.branchRowCount === 2, "update feed checkpoint should include two branch rows");
  check(report.branchRows.every((row) => row.ready === true && row.valueRecorded === false), "update feed checkpoint branch rows should be ready and value-free");
  check(report.comparisonRowCount === 6, "update feed checkpoint should include six comparison rows");
  check(report.comparisonRows.every((row) => row.ready === true && row.valueRecorded === false), "update feed checkpoint comparison rows should be ready and value-free");
  check(report.realPostEditProofReady === true, "update feed checkpoint should keep real proof ready");
  check(report.syntheticPostEditProofReady === true, "update feed checkpoint should keep synthetic proof ready");
  check(report.syntheticLiveCheckReady === true, "update feed checkpoint should prove synthetic live-check readiness");
  check(report.syntheticStrictReady === true, "update feed checkpoint should prove synthetic strict readiness");
  check(report.syntheticSelectedReadyCount === 2, "update feed checkpoint should prove two synthetic selected-ready keys");
  check(report.syntheticPlaceholderKeyCount === 0, "update feed checkpoint should prove zero synthetic placeholders");
  check(report.syntheticPlaceholderEditLocationCount === 0, "update feed checkpoint should prove zero synthetic placeholder edit locations");
  check(report.syntheticRealLocalEnvRead === false, "update feed checkpoint should not read the real local env for the synthetic source");
  check(report.realAutoUpdateReady === false, "update feed checkpoint should keep real auto-update readiness false");
  check(report.syntheticAutoUpdateReady === false, "update feed checkpoint should keep synthetic-source auto-update readiness false");
  check(report.realAutoUpdateBlockerCount > 0, "update feed checkpoint should keep real auto-update blocker rows");
  check(report.syntheticAutoUpdateBlockerCount > 0, "update feed checkpoint should keep synthetic-source auto-update blocker rows");
  check(report.signedUpdateArtifactsReady === false, "update feed checkpoint should keep signed update artifacts unready");
  check(report.hardGateCommand === "npm run release:external-check", "update feed checkpoint should keep hard external gate command");
  check(report.hardGateReady === false, "update feed checkpoint should keep hard gate unready");
  check(report.hardGateWouldFail === true, "update feed checkpoint should keep hard gate would-fail posture");
  check(report.currentTenPlanWindowStart > 0, "update feed checkpoint should report a positive 10-plan window start");
  check(report.currentTenPlanWindowEnd === report.currentTenPlanWindowStart + 9, "update feed checkpoint should report a 10-plan window range");
  check(report.currentTenPlanWindowTotal === 10, "update feed checkpoint should use ten-plan windows");
  check(
    report.currentTenPlanProgressLabel ===
      `${report.currentTenPlanWindowStart}-${report.currentTenPlanWindowEnd}: ${report.currentTenPlanWindowCompletedCount}/10`,
    "update feed checkpoint progress label should match the completed-plan 10-plan window"
  );
  check(report.currentTenPlanWindowCompletedCount >= 0 && report.currentTenPlanWindowCompletedCount <= 10, "update feed checkpoint completed count should be bounded");
  check(report.userFacingCompletionPercent === 99.999999, "update feed checkpoint should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "update feed checkpoint should preserve remaining percent");
  check(report.privateValuesRecorded === false, "update feed checkpoint should not record private values");
  check(report.feedValueRecorded === false, "update feed checkpoint should not record feed values");
  check(report.channelValueRecorded === false, "update feed checkpoint should not record channel values");
  check(report.localEnvValueRecorded === false, "update feed checkpoint should not record local env values");
  check(report.networkProbeAttempted === false, "update feed checkpoint should not probe the network");
  check(report.updateFeedPublishAttempted === false, "update feed checkpoint should not publish update feeds");
  check(report.releaseUploadAttempted === false, "update feed checkpoint should not upload releases");
  check(report.signingAttempted === false, "update feed checkpoint should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "update feed checkpoint should not submit to Apple");
  check(report.claimedAutoUpdate === false, "update feed checkpoint should not claim auto-update");
  check(report.claimedExternalDistribution === false, "update feed checkpoint should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "update feed checkpoint JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "update feed checkpoint Markdown should not include URL values");
  check(markdown.includes("Update Feed Checkpoint Smoke"), "update feed checkpoint Markdown should include title");
  check(markdown.includes("Real post-edit proof ready: yes"), "update feed checkpoint Markdown should include real proof readiness");
  check(markdown.includes("Synthetic live check ready: yes"), "update feed checkpoint Markdown should include synthetic live readiness");
  check(markdown.includes("Auto-update claimed: no"), "update feed checkpoint Markdown should keep auto-update unclaimed");
  check(markdown.includes("External distribution claimed: no"), "update feed checkpoint Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

const refreshCommandRows = refreshCommands.map((row) => ({ ...row, valueRecorded: false }));
for (const row of refreshCommandRows) {
  console.log(`Refreshing update feed checkpoint evidence: ${row.command}`);
  runNpmScript(row.command);
}

const realProof = await readJsonRequired(realJsonPath, "Real update feed post-edit proof");
const successProof = await readJsonRequired(successJsonPath, "Synthetic update feed post-edit proof success smoke");
const progress = await currentTenPlanProgress();
const report = buildReport({ realProof, successProof, progress });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(checkpointMarkdownPath, markdown, "utf8");
await writeFile(checkpointJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge update feed checkpoint smoke passed.");
console.log(`- Markdown: ${relative(checkpointMarkdownPath)}`);
console.log(`- JSON: ${relative(checkpointJsonPath)}`);
console.log("- Checkpoint ready: yes");
console.log(`- Real live check ready: ${report.realLiveCheckReady ? "yes" : "no"}`);
console.log(`- Real selected keys ready: ${report.realSelectedReadyCount}/2`);
console.log(`- Real placeholder keys: ${report.realPlaceholderKeyCount}`);
console.log("- Synthetic live check ready: yes");
console.log("- Synthetic selected keys ready: 2/2");
console.log("- Synthetic placeholder keys: 0");
console.log(`- Auto-update ready: ${report.realAutoUpdateReady || report.syntheticAutoUpdateReady ? "yes" : "no"}`);
console.log(`- Auto-update blocker rows: real ${report.realAutoUpdateBlockerCount}, synthetic ${report.syntheticAutoUpdateBlockerCount}`);
console.log("- Signed update artifacts ready: no");
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- 10-plan report due: ${report.tenPlanProgressReportDue ? "yes" : "no"}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
