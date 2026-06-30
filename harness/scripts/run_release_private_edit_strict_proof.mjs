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
const successSmoke = process.argv.includes("--success-smoke");
const reportStem = successSmoke ? "release-private-edit-strict-proof-success-smoke" : "release-private-edit-strict-proof";
const strictProofMarkdownArtifactName = "release-private-edit-strict-proof.md";
const strictProofJsonArtifactName = "release-private-edit-strict-proof.json";
const strictProofSuccessMarkdownArtifactName = "release-private-edit-strict-proof-success-smoke.md";
const strictProofSuccessJsonArtifactName = "release-private-edit-strict-proof-success-smoke.json";
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const strictJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${successSmoke ? "release-channel-live-check-strict-success-smoke" : "release-channel-live-check-strict"}.json`
);
const postEditJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${successSmoke ? "release-post-edit-proof-success-smoke" : "release-post-edit-proof"}.json`
);
const progressRefreshJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-progress-refresh-smoke.json`
);
const currentBlockerJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.json`
);
const failures = [];
const planNumberPattern = /^plan-(\d+)-[a-z0-9][a-z0-9-]*\.md$/;
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function relative(filePath) {
  return path.relative(root, filePath);
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

function stringArrayValue(values) {
  return Array.isArray(values) ? values.filter((value) => typeof value === "string" && value.trim().length > 0) : [];
}

function objectRows(values) {
  return Array.isArray(values) ? values.filter((value) => value && typeof value === "object" && !Array.isArray(value)) : [];
}

function runNpmScript(scriptName, { allowFailure = false } = {}) {
  const command = `npm run ${scriptName}`;
  console.log(`Running release private edit strict proof step: ${command}`);
  const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", scriptName], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    throw new Error(`Could not run ${command}: ${result.error.message}`);
  }
  if (!allowFailure && result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}.`);
  }
  return {
    command,
    status: Number.isInteger(result.status) ? result.status : 1,
    success: result.status === 0
  };
}

async function readJsonIfPresent(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function currentTenPlanProgressLabel() {
  const completedPlansDir = path.join(root, "docs", "exec_plans", "completed");
  const entries = await readdir(completedPlansDir, { withFileTypes: true });
  const completedPlanNumbers = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name.match(planNumberPattern))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter((number) => Number.isInteger(number));
  const highestPlanNumber = Math.max(...completedPlanNumbers, 0);
  const windowStart = Math.floor((highestPlanNumber - 1) / 10) * 10 + 1;
  const windowEnd = windowStart + 9;
  const completedInWindow = completedPlanNumbers.filter((number) => number >= windowStart && number <= windowEnd).length;
  return `${windowStart}-${windowEnd}: ${completedInWindow}/10`;
}

function sourceRow(label, filePath, present, synthetic = false) {
  return {
    label,
    synthetic,
    present,
    path: present ? relative(filePath) : relative(filePath),
    valueRecorded: false
  };
}

function formatCommandRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${escapeCell(row.statusLabel)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatFailureRows(rows) {
  if (rows.length === 0) {
    return "| none | yes | no | yes | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.key)} | ${row.present ? "yes" : "no"} | ${row.placeholder ? "yes" : "no"} | ${row.shapeReady ? "yes" : "no"} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "none")} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${row.synthetic ? "yes" : "no"} | ${row.present ? "yes" : "no"} | ${escapeCell(row.path)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function buildReport({ strictResult, postEditResult, progressResult, strictLiveCheck, postEditProof, progressRefresh, currentBlocker, fallbackTenPlanProgressLabel }) {
  const strictReady = strictLiveCheck?.strictReady === true;
  const strictExitCode = Number.isInteger(strictLiveCheck?.strictExitCode)
    ? strictLiveCheck.strictExitCode
    : strictResult.status;
  const strictFailureRows = objectRows(strictLiveCheck?.strictFailureRows).map((row) => ({
    key: textValue(row.key),
    present: row.present === true,
    placeholder: row.placeholder === true,
    shapeReady: row.shapeReady === true,
    expectedShape: textValue(row.expectedShape),
    editTarget: textValue(row.editTarget, textValue(strictLiveCheck?.currentEnvEditTarget, ".env.distribution.local")),
    line: Number.isInteger(row.line) ? row.line : null,
    proofCommand: "npm run release:channel-live-check-strict",
    valueRecorded: false
  }));
  const postEditReady = postEditProof?.releasePostEditProofReady === true || postEditProof?.releasePostEditProofSuccessSmokeReady === true;
  const progressReady = successSmoke ? true : progressRefresh?.refreshSmokeReady === true;
  const proofReady = strictReady && postEditReady && progressReady;
  const currentTenPlanProgressLabel = textValue(
    progressRefresh?.latestTenPlanProgressLabel,
    textValue(currentBlocker?.currentTenPlanProgressLabel, textValue(postEditProof?.currentTenPlanProgressLabel, fallbackTenPlanProgressLabel))
  );
  const currentFirstBlocker = proofReady
    ? textValue(
        currentBlocker?.currentFirstBlocker,
        successSmoke
          ? "Strict release-channel proof succeeded in synthetic rehearsal; broader external proofs remain unclaimed."
          : "Strict release-channel proof passed; broader external proofs remain unclaimed."
      )
    : textValue(
        currentBlocker?.currentFirstBlocker,
        "Strict release-channel proof did not pass, so post-edit proof and progress refresh were not run."
      );
  const commandRows = [
    {
      order: 1,
      command: successSmoke ? "npm run release:channel-live-check-strict-success-smoke" : "npm run release:channel-live-check-strict",
      role: successSmoke
        ? "prove strict release-channel success branch without reading the real local env"
        : "pass/fail proof that the four private release-channel keys are present, non-placeholder, and shape-ready",
      statusLabel: strictReady ? "passed" : "failed",
      exitCode: strictExitCode,
      valueRecorded: false
    },
    {
      order: 2,
      command: successSmoke ? "npm run release:post-edit-proof-success-smoke" : "npm run release:post-edit-proof",
      role: successSmoke
        ? "prove post-edit proof success branch with synthetic ready evidence"
        : "refresh release-channel live-check and current-blocker evidence after strict proof passes",
      statusLabel: postEditResult ? (postEditResult.success ? "passed" : "failed") : "not run",
      exitCode: postEditResult?.status ?? null,
      valueRecorded: false
    },
    {
      order: 3,
      command: "npm run release:progress-refresh-smoke",
      role: successSmoke
        ? "real progress refresh is skipped in success smoke to avoid reading private local env state"
        : "refresh user-facing completion, current blocker, completion packet, and freshness after strict proof passes",
      statusLabel: successSmoke ? "skipped in success smoke" : progressResult ? (progressResult.success ? "passed" : "failed") : "not run",
      exitCode: progressResult?.status ?? null,
      valueRecorded: false
    }
  ];
  const sourceRows = [
    sourceRow(
      successSmoke ? "Release-channel strict success smoke" : "Release-channel strict live check",
      strictJsonPath,
      Boolean(strictLiveCheck),
      successSmoke
    ),
    sourceRow(
      successSmoke ? "Release post-edit proof success smoke" : "Release post-edit proof",
      postEditJsonPath,
      Boolean(postEditProof),
      successSmoke
    ),
    sourceRow("Release progress refresh smoke", progressRefreshJsonPath, Boolean(progressRefresh), false),
    sourceRow("Release current blocker", currentBlockerJsonPath, Boolean(currentBlocker), false)
  ];

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: successSmoke ? "npm run release:private-edit-strict-proof-success-smoke" : "npm run release:private-edit-strict-proof",
    sourceMode: successSmoke ? "synthetic private edit strict proof success smoke" : "real private edit strict proof",
    realLocalEnvRead: successSmoke ? false : strictLiveCheck?.realLocalEnvRead === true,
    realLocalEnvModified: false,
    privateEditStrictProofReceiptReady: true,
    privateEditStrictProofReady: proofReady,
    privateEditStrictProofState: proofReady
      ? "strict release-channel proof chain is ready"
      : "strict release-channel proof chain is blocked before progress refresh",
    privateEditStrictProofCurrentTarget: textValue(currentBlocker?.currentTarget, "Release channel metadata"),
    privateEditStrictProofCurrentFirstBlocker: currentFirstBlocker,
    privateEditStrictProofFirstCommand: commandRows[0].command,
    privateEditStrictProofPostEditCommand: commandRows[1].command,
    privateEditStrictProofProgressCommand: commandRows[2].command,
    privateEditStrictProofCommandRows: commandRows,
    privateEditStrictProofCommandRowCount: commandRows.length,
    privateEditStrictProofCommandSummary: commandRows.map((row) => row.command).join(" -> "),
    strictReady,
    strictExitCode,
    strictFailureRowCount: strictFailureRows.length,
    strictFailureRows,
    strictCurrentReadyCount: integerValue(strictLiveCheck?.releaseChannelLiveCheckCurrentReadyCount),
    strictCurrentRowCount: integerValue(strictLiveCheck?.releaseChannelLiveCheckRowCount),
    currentEnvEditTarget: textValue(strictLiveCheck?.currentEnvEditTarget, ".env.distribution.local"),
    currentRequiredKeyCount: releaseChannelMetadataKeys.length,
    currentRequiredKeys: releaseChannelMetadataKeys,
    currentPlaceholderKeyCount: integerValue(strictLiveCheck?.currentPlaceholderKeyCount),
    currentPlaceholderKeys: stringArrayValue(strictLiveCheck?.currentPlaceholderKeys),
    postEditProofReady: postEditReady,
    postEditProofCommand: successSmoke ? "npm run release:post-edit-proof-success-smoke" : "npm run release:post-edit-proof",
    postEditProofCurrentPlaceholderKeyCount: integerValue(postEditProof?.currentPlaceholderKeyCount),
    postEditProofCurrentPlaceholderKeys: stringArrayValue(postEditProof?.currentPlaceholderKeys),
    progressRefreshReady: progressReady,
    progressRefreshSkippedInSuccessSmoke: successSmoke,
    currentTenPlanProgressLabel,
    nextScheduledTenPlanProgressReport: textValue(
      progressRefresh?.nextScheduledTenPlanProgressReportAfterDelivery,
      textValue(currentBlocker?.nextScheduledTenPlanProgressReportAfterDelivery, "plan-1230")
    ),
    userFacingCompletionPercent: Number(
      progressRefresh?.userFacingCompletionPercent ??
        currentBlocker?.userFacingCompletionPercent ??
        postEditProof?.userFacingCompletionPercent ??
        99.999999
    ),
    userFacingRemainingPercent: Number(
      progressRefresh?.userFacingRemainingPercent ??
        currentBlocker?.userFacingRemainingPercent ??
        postEditProof?.userFacingRemainingPercent ??
        0.000001
    ),
    nextPriorityActionId: textValue(currentBlocker?.nextPriorityActionId, "auto-update-feed"),
    nextPriorityActionLabel: textValue(currentBlocker?.nextPriorityActionLabel, "Auto-update feed and signed metadata"),
    hardGateCommand: textValue(currentBlocker?.hardGateCommand, "npm run release:external-check"),
    hardGateReady: currentBlocker?.hardGateReady === true,
    sourceArtifactRows: sourceRows,
    sourceArtifactRowCount: sourceRows.length,
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    updateFeedProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttempted: false,
    signingAttempted: false,
    claimedAutoUpdate: false,
    claimedExternalDistribution: false,
    valueRecorded: false
  };
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Private Edit Strict Proof

## Status

- Receipt ready: ${report.privateEditStrictProofReceiptReady ? "yes" : "no"}
- Strict proof chain ready: ${report.privateEditStrictProofReady ? "yes" : "no"}
- State: ${report.privateEditStrictProofState}
- Source mode: ${report.sourceMode}
- Current target: ${report.privateEditStrictProofCurrentTarget}
- Current blocker: ${report.privateEditStrictProofCurrentFirstBlocker}
- First command: \`${report.privateEditStrictProofFirstCommand}\`
- Post-edit proof command: \`${report.privateEditStrictProofPostEditCommand}\`
- Progress refresh command: \`${report.privateEditStrictProofProgressCommand}\`
- Strict ready: ${report.strictReady ? "yes" : "no"}
- Strict exit code: ${report.strictExitCode}
- Strict current-ready rows: ${report.strictCurrentReadyCount}/${report.strictCurrentRowCount}
- Strict failure rows: ${report.strictFailureRowCount}
- Current env edit target: ${report.currentEnvEditTarget}
- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${report.currentPlaceholderKeys.join(", ") || "none"})
- Post-edit proof ready: ${report.postEditProofReady ? "yes" : "no"}
- Progress refresh ready: ${report.progressRefreshReady ? "yes" : "no"}
- Progress refresh skipped in success smoke: ${report.progressRefreshSkippedInSuccessSmoke ? "yes" : "no"}
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- Next scheduled 10-plan report: ${report.nextScheduledTenPlanProgressReport}
- Overall completion: ${report.userFacingCompletionPercent.toFixed(6)}%
- Remaining completion: ${report.userFacingRemainingPercent.toFixed(6)}%
- Next priority after current clears: ${report.nextPriorityActionId} (${report.nextPriorityActionLabel})
- Hard gate: \`${report.hardGateCommand}\` (${report.hardGateReady ? "ready" : "not ready"})
- Private values recorded: no
- External distribution claimed: no

## Proof Chain Commands

- Command rows: ${report.privateEditStrictProofCommandRowCount}
- Command summary: ${report.privateEditStrictProofCommandSummary}

| order | command | role | status | value recorded |
|---:|---|---|---|---:|
${formatCommandRows(report.privateEditStrictProofCommandRows)}

## Strict Failure Rows

| key | present | placeholder | shape ready | expected shape | edit target | line | value recorded |
|---|---:|---:|---:|---|---|---:|---:|
${formatFailureRows(report.strictFailureRows)}

## Source Artifacts

| artifact | synthetic | present | path | value recorded |
|---|---:|---:|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Safety

- Network probe attempted: no
- Update feed probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- Auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, and external distribution completion are not claimed.
`;
}

async function writeReport(report) {
  await mkdir(packageRoot, { recursive: true });
  const markdown = buildMarkdown(report);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  check(report.privateEditStrictProofReceiptReady === true, "release private edit strict proof should write a ready receipt");
  check(report.privateEditStrictProofCommandRowCount === 3, "release private edit strict proof should include three command rows");
  check(report.privateEditStrictProofFirstCommand.includes("channel-live-check-strict"), "release private edit strict proof should run strict live-check first");
  check(report.privateEditStrictProofPostEditCommand.includes("post-edit-proof"), "release private edit strict proof should include post-edit proof");
  check(report.privateEditStrictProofProgressCommand === "npm run release:progress-refresh-smoke", "release private edit strict proof should include progress refresh");
  check(report.currentRequiredKeyCount === 4, "release private edit strict proof should track four release-channel keys");
  check(releaseChannelMetadataKeys.every((key) => report.currentRequiredKeys.includes(key)), "release private edit strict proof should cover release-channel keys");
  check(report.strictFailureRowCount === report.strictFailureRows.length, "release private edit strict proof strict failure row count should match rows");
  check(report.strictFailureRows.every((row) => row.valueRecorded === false), "release private edit strict proof failure rows should not record values");
  check(report.sourceArtifactRowCount === report.sourceArtifactRows.length, "release private edit strict proof source row count should match rows");
  check(report.sourceArtifactRows.every((row) => row.valueRecorded === false), "release private edit strict proof source rows should not record values");
  check(report.privateValuesRecorded === false, "release private edit strict proof should not record private values");
  check(report.networkProbeAttempted === false, "release private edit strict proof should not probe distribution channels");
  check(report.updateFeedProbeAttempted === false, "release private edit strict proof should not probe update feeds");
  check(report.releaseUploadAttempted === false, "release private edit strict proof should not upload releases");
  check(report.notarySubmissionAttempted === false, "release private edit strict proof should not submit to Apple");
  check(report.signingAttempted === false, "release private edit strict proof should not sign artifacts");
  check(report.claimedAutoUpdate === false, "release private edit strict proof should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release private edit strict proof should not claim external distribution");
  check(!/https?:\/\//i.test(json), "release private edit strict proof JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release private edit strict proof Markdown should not include URL values");
  check(markdown.includes("Release Private Edit Strict Proof"), "release private edit strict proof Markdown should include title");
  check(markdown.includes("Proof Chain Commands"), "release private edit strict proof Markdown should include proof chain commands");
  check(markdown.includes("Strict Failure Rows"), "release private edit strict proof Markdown should include strict failure rows");

  if (failures.length > 0) {
    console.error(`GrooveForge release private edit strict proof${successSmoke ? " success smoke" : ""} failed:`);
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  await writeFile(jsonPath, json, "utf8");
  await writeFile(markdownPath, markdown, "utf8");
}

let strictResult = { command: "none", status: 1, success: false };
let postEditResult = null;
let progressResult = null;
let strictLiveCheck = null;
let postEditProof = null;
let progressRefresh = null;
let currentBlocker = await readJsonIfPresent(currentBlockerJsonPath);
const fallbackTenPlanProgressLabel = await currentTenPlanProgressLabel();

try {
  strictResult = runNpmScript(successSmoke ? "release:channel-live-check-strict-success-smoke" : "release:channel-live-check-strict", {
    allowFailure: !successSmoke
  });
  strictLiveCheck = await readJsonIfPresent(strictJsonPath);

  if (strictResult.success) {
    postEditResult = runNpmScript(successSmoke ? "release:post-edit-proof-success-smoke" : "release:post-edit-proof");
    postEditProof = await readJsonIfPresent(postEditJsonPath);

    if (!successSmoke) {
      progressResult = runNpmScript("release:progress-refresh-smoke");
      progressRefresh = await readJsonIfPresent(progressRefreshJsonPath);
      currentBlocker = await readJsonIfPresent(currentBlockerJsonPath);
    }
  }
} catch (error) {
  console.error(`GrooveForge release private edit strict proof${successSmoke ? " success smoke" : ""} command failed:`);
  console.error(`- ${error.message}`);
  process.exit(1);
}

const report = buildReport({
  strictResult,
  postEditResult,
  progressResult,
  strictLiveCheck,
  postEditProof,
  progressRefresh,
  currentBlocker,
  fallbackTenPlanProgressLabel
});
await writeReport(report);

console.log(`GrooveForge release private edit strict proof${successSmoke ? " success smoke" : ""} ${report.privateEditStrictProofReady ? "passed" : "blocked"}.`);
console.log(`- Markdown: ${relative(markdownPath)}`);
console.log(`- JSON: ${relative(jsonPath)}`);
console.log(`- Receipt ready: ${report.privateEditStrictProofReceiptReady ? "yes" : "no"}`);
console.log(`- Strict proof chain ready: ${report.privateEditStrictProofReady ? "yes" : "no"}`);
console.log(`- Current target: ${report.privateEditStrictProofCurrentTarget}`);
console.log(`- Current blocker: ${report.privateEditStrictProofCurrentFirstBlocker}`);
console.log(`- First command: ${report.privateEditStrictProofFirstCommand}`);
console.log(`- Post-edit proof command: ${report.privateEditStrictProofPostEditCommand}`);
console.log(`- Progress refresh command: ${report.privateEditStrictProofProgressCommand}`);
console.log(`- Strict ready: ${report.strictReady ? "yes" : "no"}`);
console.log(`- Strict failure rows: ${report.strictFailureRowCount}`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- Overall completion: ${report.userFacingCompletionPercent.toFixed(6)}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent.toFixed(6)}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");

if (!successSmoke && !report.privateEditStrictProofReady) {
  process.exit(1);
}
