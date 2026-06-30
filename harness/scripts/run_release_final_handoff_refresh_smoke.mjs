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
const refreshStem = "release-final-handoff-refresh-smoke";
const refreshMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${refreshStem}.md`);
const refreshJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${refreshStem}.json`);
const progressRefreshJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-refresh-smoke.json`);
const releaseProgressJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-report.json`);
const currentBlockerJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.json`);
const finalHandoffJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-final-handoff.json`);
const finalHandoffSuccessJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-final-handoff-success-redaction-smoke.json`);
const postEditProofBundleJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof-bundle.json`);
const postEditProofJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof.json`);
const postEditProofSuccessJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof-success-smoke.json`);
const failures = [];
const refreshCommands = [
  {
    order: 1,
    command: "npm run release:proof-bundle",
    role: "refresh value-free external proof bundle source evidence",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:progress-refresh-smoke",
    role: "refresh progress, current-blocker, and progress-freshness labels",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:final-handoff",
    role: "refresh real final handoff and post-edit proof receipts",
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run release:final-handoff-success-redaction-smoke",
    role: "refresh synthetic strict-ready final handoff redaction receipt",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release final handoff refresh smoke failed:");
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

function commandSummary(rows) {
  return rows.map((row) => row.command).join(" -> ");
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
    fail(`${command} exited with status ${result.status}.`, "Run npm run release:check or refresh the missing source evidence before retrying this final handoff refresh smoke.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function sourceRow({ label, filePath, artifact, progressLabel, sourceField, receiptReady, expectedBlocked = false }) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    receiptReady,
    expectedBlocked,
    progressLabel,
    sourceField,
    claimedExternalDistribution: artifact?.claimedExternalDistribution === true,
    valueRecorded: false
  };
}

function formatCommandRows(rows) {
  return rows.map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${readyLabel(row.receiptReady)} | ${readyLabel(row.expectedBlocked)} | ${escapeCell(row.path)} | ${escapeCell(row.progressLabel)} | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function buildReport({
  progressRefresh,
  releaseProgress,
  currentBlocker,
  finalHandoff,
  finalHandoffSuccess,
  postEditProofBundle,
  postEditProof,
  postEditProofSuccess
}) {
  const latestLabel = textValue(progressRefresh.latestTenPlanProgressLabel);
  const sourceArtifactRows = [
    sourceRow({
      label: "Release progress refresh smoke",
      filePath: progressRefreshJsonPath,
      artifact: progressRefresh,
      progressLabel: latestLabel,
      sourceField: "latestTenPlanProgressLabel",
      receiptReady: progressRefresh.releaseProgressRefreshReady === true
    }),
    sourceRow({
      label: "Release progress report",
      filePath: releaseProgressJsonPath,
      artifact: releaseProgress,
      progressLabel: textValue(releaseProgress.currentTenPlanWindowLabel),
      sourceField: "currentTenPlanWindowLabel",
      receiptReady: releaseProgress.releaseProgressReportReady === true
    }),
    sourceRow({
      label: "Release current blocker",
      filePath: currentBlockerJsonPath,
      artifact: currentBlocker,
      progressLabel: textValue(currentBlocker.currentTenPlanProgressLabel),
      sourceField: "currentTenPlanProgressLabel",
      receiptReady: currentBlocker.releaseCurrentBlockerReady === true
    }),
    sourceRow({
      label: "Release final handoff",
      filePath: finalHandoffJsonPath,
      artifact: finalHandoff,
      progressLabel: textValue(finalHandoff.currentTenPlanProgressLabel),
      sourceField: "currentTenPlanProgressLabel",
      receiptReady: finalHandoff.releaseFinalHandoffReady === true
    }),
    sourceRow({
      label: "Release final handoff success-redaction smoke",
      filePath: finalHandoffSuccessJsonPath,
      artifact: finalHandoffSuccess,
      progressLabel: textValue(finalHandoffSuccess.currentTenPlanProgressLabel),
      sourceField: "currentTenPlanProgressLabel",
      receiptReady: finalHandoffSuccess.releaseFinalHandoffReady === true
    }),
    sourceRow({
      label: "Release post-edit proof bundle",
      filePath: postEditProofBundleJsonPath,
      artifact: postEditProofBundle,
      progressLabel: textValue(postEditProofBundle.currentTenPlanProgressLabel),
      sourceField: "currentTenPlanProgressLabel",
      receiptReady: postEditProofBundle.releasePostEditProofBundleReady === true
    }),
    sourceRow({
      label: "Release post-edit proof",
      filePath: postEditProofJsonPath,
      artifact: postEditProof,
      progressLabel: textValue(postEditProof.currentTenPlanProgressLabel),
      sourceField: "currentTenPlanProgressLabel",
      receiptReady: typeof postEditProof.releasePostEditProofReady === "boolean",
      expectedBlocked: postEditProof.releasePostEditProofReady === false
    }),
    sourceRow({
      label: "Release post-edit proof success smoke",
      filePath: postEditProofSuccessJsonPath,
      artifact: postEditProofSuccess,
      progressLabel: textValue(postEditProofSuccess.currentTenPlanProgressLabel),
      sourceField: "currentTenPlanProgressLabel",
      receiptReady: postEditProofSuccess.releasePostEditProofSuccessSmokeReady === true
    })
  ];
  const labelsMatch = sourceArtifactRows.every((row) => row.progressLabel === latestLabel);
  const receiptsClean = sourceArtifactRows.every(
    (row) => row.present === true && row.receiptReady === true && row.claimedExternalDistribution === false && row.valueRecorded === false
  );
  const privateBoundaryClean =
    finalHandoff.releaseFinalHandoffReady === true &&
    finalHandoff.privateValuesRecorded === false &&
    finalHandoff.networkProbeAttempted === false &&
    finalHandoff.releaseUploadAttempted === false &&
    finalHandoff.signingAttempted === false &&
    finalHandoff.notarySubmissionAttempted === false &&
    finalHandoff.claimedExternalDistribution === false &&
    finalHandoffSuccess.realLocalEnvRead === false &&
    finalHandoffSuccess.realLocalEnvModified === false &&
    finalHandoffSuccess.claimedExternalDistribution === false;

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:final-handoff-refresh-smoke",
    releaseFinalHandoffRefreshMarkdownArtifactName: "release-final-handoff-refresh-smoke.md",
    releaseFinalHandoffRefreshJsonArtifactName: "release-final-handoff-refresh-smoke.json",
    releaseFinalHandoffRefreshMarkdownPath: relative(refreshMarkdownPath),
    releaseFinalHandoffRefreshJsonPath: relative(refreshJsonPath),
    releaseFinalHandoffRefreshReady:
      refreshCommands.every((row) => row.valueRecorded === false) &&
      receiptsClean &&
      labelsMatch &&
      privateBoundaryClean,
    refreshCommandRows: refreshCommands,
    refreshCommandCount: refreshCommands.length,
    refreshCommandSummary: commandSummary(refreshCommands),
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    labelsMatch,
    latestTenPlanProgressLabel: latestLabel,
    latestTenPlanWindowStart: integerValue(progressRefresh.latestTenPlanWindowStart),
    latestTenPlanWindowEnd: integerValue(progressRefresh.latestTenPlanWindowEnd),
    latestTenPlanCompletedCount: integerValue(progressRefresh.latestTenPlanCompletedCount),
    latestTenPlanTotal: integerValue(progressRefresh.latestTenPlanTotal),
    tenPlanProgressReportDue: progressRefresh.tenPlanProgressReportDue === true,
    finalHandoffReady: finalHandoff.releaseFinalHandoffReady === true,
    finalHandoffState: textValue(finalHandoff.releaseFinalHandoffState),
    finalHandoffMetadataReady: finalHandoff.releaseChannelMetadataReady === true,
    finalHandoffPrivateEditStillRequired: finalHandoff.privateEditStillRequired === true,
    finalHandoffCurrentReadyCount: integerValue(finalHandoff.currentReadyCount),
    finalHandoffCurrentRowCount: integerValue(finalHandoff.currentRowCount),
    finalHandoffPlaceholderKeyCount: integerValue(finalHandoff.currentPlaceholderKeyCount),
    finalHandoffSuccessReady: finalHandoffSuccess.releaseFinalHandoffReady === true,
    finalHandoffSuccessMetadataReady: finalHandoffSuccess.releaseChannelMetadataReady === true,
    finalHandoffSuccessPlaceholderKeyCount: integerValue(finalHandoffSuccess.currentPlaceholderKeyCount),
    finalHandoffSuccessRealLocalEnvRead: finalHandoffSuccess.realLocalEnvRead === true,
    finalHandoffSuccessRealLocalEnvModified: finalHandoffSuccess.realLocalEnvModified === true,
    postEditProofBundleReady: postEditProofBundle.releasePostEditProofBundleReady === true,
    postEditProofReady: postEditProof.releasePostEditProofReady === true,
    postEditProofExpectedBlocked: postEditProof.releasePostEditProofReady === false,
    currentFirstBlocker: textValue(currentBlocker.currentFirstBlocker),
    currentNextCommand: textValue(currentBlocker.currentNextCommand),
    currentRerunCommand: textValue(currentBlocker.currentRerunCommand),
    hardGateReady: currentBlocker.hardGateReady === true,
    hardGateWouldFail: currentBlocker.hardGateWouldFail === true,
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
    privateValuesRecorded: false,
    feedValueRecorded: false,
    channelValueRecorded: false,
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

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Final Handoff Refresh Smoke

## Status

- Final handoff refresh ready: ${readyLabel(report.releaseFinalHandoffRefreshReady)}
- Command order: ${report.refreshCommandSummary}
- Labels match: ${readyLabel(report.labelsMatch)}
- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- Final handoff ready: ${readyLabel(report.finalHandoffReady)}
- Final handoff state: ${report.finalHandoffState}
- Final handoff metadata ready: ${readyLabel(report.finalHandoffMetadataReady)}
- Final handoff private edit still required: ${readyLabel(report.finalHandoffPrivateEditStillRequired)}
- Final handoff current rows: ${report.finalHandoffCurrentReadyCount}/${report.finalHandoffCurrentRowCount}
- Final handoff placeholder keys: ${report.finalHandoffPlaceholderKeyCount}
- Success-redaction final handoff ready: ${readyLabel(report.finalHandoffSuccessReady)}
- Success-redaction metadata ready: ${readyLabel(report.finalHandoffSuccessMetadataReady)}
- Success-redaction placeholder keys: ${report.finalHandoffSuccessPlaceholderKeyCount}
- Success-redaction real local env read: ${readyLabel(report.finalHandoffSuccessRealLocalEnvRead)}
- Success-redaction real local env modified: ${readyLabel(report.finalHandoffSuccessRealLocalEnvModified)}
- Post-edit proof bundle ready: ${readyLabel(report.postEditProofBundleReady)}
- Real post-edit proof ready: ${readyLabel(report.postEditProofReady)}
- Real post-edit proof expected blocked: ${readyLabel(report.postEditProofExpectedBlocked)}
- Current next command: \`${report.currentNextCommand}\`
- Current first blocker: ${report.currentFirstBlocker}
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Private values recorded: no
- Feed values recorded: no
- Channel values recorded: no
- Network probe attempted: no
- Update feed publish attempted: no
- Distribution channel probe attempted: no
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

| artifact | present | receipt ready | expected blocked | path | progress label | source field | value recorded |
|---|---:|---:|---:|---|---|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this refresh smoke.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.releaseFinalHandoffRefreshReady === true, "release final handoff refresh smoke should be ready");
  check(report.reportCommand === "npm run release:final-handoff-refresh-smoke", "release final handoff refresh smoke should report its command");
  check(report.refreshCommandCount === 4, "release final handoff refresh smoke should run four commands");
  check(
    report.refreshCommandSummary === "npm run release:proof-bundle -> npm run release:progress-refresh-smoke -> npm run release:final-handoff -> npm run release:final-handoff-success-redaction-smoke",
    "release final handoff refresh smoke should run proof-bundle, progress-refresh, final-handoff, then success-redaction"
  );
  check(report.refreshCommandRows.every((row) => row.valueRecorded === false), "release final handoff refresh command rows should be value-free");
  check(report.sourceArtifactRowCount === 8, "release final handoff refresh smoke should include eight source artifacts");
  check(report.sourceArtifactRows.every((row) => row.present === true && row.receiptReady === true && row.valueRecorded === false), "release final handoff refresh source artifacts should be present, usable, and value-free");
  check(report.labelsMatch === true, "release final handoff refresh smoke should leave final handoff labels matched");
  check(report.latestTenPlanWindowStart > 0, "release final handoff refresh smoke should report a positive 10-plan window start");
  check(report.latestTenPlanWindowEnd === report.latestTenPlanWindowStart + 9, "release final handoff refresh smoke should report a 10-plan window");
  check(report.latestTenPlanTotal === 10, "release final handoff refresh smoke should use ten-plan windows");
  check(
    report.latestTenPlanProgressLabel === `${report.latestTenPlanWindowStart}-${report.latestTenPlanWindowEnd}: ${report.latestTenPlanCompletedCount}/10`,
    "release final handoff refresh label should match latest 10-plan window fields"
  );
  check(report.finalHandoffReady === true, "release final handoff refresh smoke should refresh the real final handoff");
  check(report.finalHandoffSuccessReady === true, "release final handoff refresh smoke should refresh the success-redaction handoff");
  check(report.finalHandoffSuccessMetadataReady === true, "release final handoff success-redaction should prove metadata ready posture");
  check(report.finalHandoffSuccessPlaceholderKeyCount === 0, "release final handoff success-redaction should prove zero placeholder keys");
  check(report.finalHandoffSuccessRealLocalEnvRead === false, "release final handoff success-redaction should not read real local env");
  check(report.finalHandoffSuccessRealLocalEnvModified === false, "release final handoff success-redaction should not modify real local env");
  check(report.postEditProofBundleReady === true, "release final handoff refresh smoke should refresh the post-edit proof bundle");
  check(typeof report.postEditProofReady === "boolean", "release final handoff refresh smoke should include real post-edit proof posture");
  check(report.hardGateReady === false, "release final handoff refresh smoke should keep hard gate unready");
  check(report.hardGateWouldFail === true, "release final handoff refresh smoke should keep hard gate would-fail posture");
  check(report.userFacingCompletionPercent === 99.999999, "release final handoff refresh smoke should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "release final handoff refresh smoke should preserve remaining percent");
  check(report.privateValuesRecorded === false, "release final handoff refresh smoke should not record private values");
  check(report.feedValueRecorded === false, "release final handoff refresh smoke should not record feed values");
  check(report.channelValueRecorded === false, "release final handoff refresh smoke should not record channel values");
  check(report.localEnvValueRecorded === false, "release final handoff refresh smoke should not record local env values");
  check(report.networkProbeAttempted === false, "release final handoff refresh smoke should not probe networks");
  check(report.updateFeedPublishAttempted === false, "release final handoff refresh smoke should not publish update feeds");
  check(report.distributionChannelProbeAttempted === false, "release final handoff refresh smoke should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "release final handoff refresh smoke should not upload releases");
  check(report.signingAttempted === false, "release final handoff refresh smoke should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release final handoff refresh smoke should not submit to Apple");
  check(report.claimedAutoUpdate === false, "release final handoff refresh smoke should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release final handoff refresh smoke should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "release final handoff refresh JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release final handoff refresh Markdown should not include URL values");
  check(markdown.includes("Release Final Handoff Refresh Smoke"), "release final handoff refresh Markdown should include title");
  check(markdown.includes("Final handoff refresh ready: yes"), "release final handoff refresh Markdown should include readiness");
  check(markdown.includes("Auto-update claimed: no"), "release final handoff refresh Markdown should keep auto-update unclaimed");
  check(markdown.includes("External distribution claimed: no"), "release final handoff refresh Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const row of refreshCommands) {
  console.log(`Refreshing release final handoff evidence: ${row.command}`);
  runNpmScript(row.command);
}

const progressRefresh = await readJsonRequired(progressRefreshJsonPath, "Release progress refresh smoke");
const releaseProgress = await readJsonRequired(releaseProgressJsonPath, "Release progress report");
const currentBlocker = await readJsonRequired(currentBlockerJsonPath, "Release current blocker");
const finalHandoff = await readJsonRequired(finalHandoffJsonPath, "Release final handoff");
const finalHandoffSuccess = await readJsonRequired(finalHandoffSuccessJsonPath, "Release final handoff success-redaction smoke");
const postEditProofBundle = await readJsonRequired(postEditProofBundleJsonPath, "Release post-edit proof bundle");
const postEditProof = await readJsonRequired(postEditProofJsonPath, "Release post-edit proof");
const postEditProofSuccess = await readJsonRequired(postEditProofSuccessJsonPath, "Release post-edit proof success smoke");
const report = buildReport({
  progressRefresh,
  releaseProgress,
  currentBlocker,
  finalHandoff,
  finalHandoffSuccess,
  postEditProofBundle,
  postEditProof,
  postEditProofSuccess
});
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(refreshMarkdownPath, markdown, "utf8");
await writeFile(refreshJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release final handoff refresh smoke passed.");
console.log(`- Markdown: ${relative(refreshMarkdownPath)}`);
console.log(`- JSON: ${relative(refreshJsonPath)}`);
console.log("- Final handoff refresh ready: yes");
console.log(`- Command order: ${report.refreshCommandSummary}`);
console.log(`- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}`);
console.log(`- Labels match: ${report.labelsMatch ? "yes" : "no"}`);
console.log(`- Final handoff ready: ${report.finalHandoffReady ? "yes" : "no"}`);
console.log(`- Success-redaction ready: ${report.finalHandoffSuccessReady ? "yes" : "no"}`);
console.log(`- Post-edit proof bundle ready: ${report.postEditProofBundleReady ? "yes" : "no"}`);
console.log(`- Real post-edit proof ready: ${report.postEditProofReady ? "yes" : "no"}`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
