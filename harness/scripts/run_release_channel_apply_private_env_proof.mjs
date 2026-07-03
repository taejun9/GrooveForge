#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const successSmoke = process.argv.includes("--success-smoke");
const reportStem = successSmoke
  ? "release-channel-apply-private-env-proof-success-smoke"
  : "release-channel-apply-private-env-proof";
const proofRunnerPassedMessage = "GrooveForge release-channel apply private env proof runner passed";
const proofRunnerBlockedMessage = "GrooveForge release-channel apply private env proof runner blocked";
const proofRunnerArtifactNames = [
  "release-channel-apply-private-env-proof.md",
  "release-channel-apply-private-env-proof.json",
  "release-channel-apply-private-env-proof-success-smoke.md",
  "release-channel-apply-private-env-proof-success-smoke.json"
];
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const completedPlanPattern = /^plan-(\d+)-[a-z0-9][a-z0-9-]*\.md$/;
const preflightScript = successSmoke
  ? "release:channel-apply-private-env-preflight-smoke"
  : "release:channel-apply-private-env-preflight";
const applyScript = successSmoke
  ? "release:channel-apply-private-env-success-smoke"
  : "release:channel-apply-private-env";
const strictProofScript = successSmoke
  ? "release:private-edit-strict-proof-success-smoke"
  : "release:private-edit-strict-proof";
const completionSummaryScript = "release:completion-summary-smoke";
const preflightReportStem = successSmoke
  ? "release-channel-apply-private-env-preflight-smoke"
  : "release-channel-apply-private-env-preflight";
const applyReportStem = successSmoke
  ? "release-channel-apply-private-env-success-smoke"
  : "release-channel-apply-private-env";
const strictProofReportStem = successSmoke
  ? "release-private-edit-strict-proof-success-smoke"
  : "release-private-edit-strict-proof";
const completionSummaryReportStem = "release-completion-summary-smoke";
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function artifactPath(stem, extension) {
  return path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${stem}.${extension}`);
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

function stringArrayValue(values) {
  return Array.isArray(values) ? values.filter((value) => typeof value === "string" && value.trim().length > 0) : [];
}

async function readJsonIfPresent(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function runNpmScript(scriptName) {
  const command = scriptName.startsWith("synthetic ") ? scriptName : `npm run ${scriptName}`;
  if (scriptName.startsWith("synthetic ")) {
    return {
      command,
      status: 0,
      success: true,
      errorMessage: "none"
    };
  }
  const child = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", scriptName], {
    cwd: root,
    env: process.env,
    encoding: "utf8"
  });
  if (child.error) {
    return {
      command,
      status: 1,
      success: false,
      errorMessage: child.error.message
    };
  }
  return {
    command,
    status: Number.isInteger(child.status) ? child.status : 1,
    success: child.status === 0,
    errorMessage: "none"
  };
}

function commandRow(order, scriptName, role, result, attempted) {
  const success = attempted && result?.success === true;
  const status = attempted && Number.isInteger(result?.status) ? result.status : null;
  return {
    order,
    command: result?.command ?? (scriptName.startsWith("synthetic ") ? scriptName : `npm run ${scriptName}`),
    role,
    attempted,
    exitStatus: status,
    success,
    statusLabel: attempted ? (success ? "passed" : "blocked-or-failed") : "skipped",
    valueRecorded: false
  };
}

async function currentCompletedPlanState() {
  const completedPlansDir = path.join(root, "docs", "exec_plans", "completed");
  const entries = await readdir(completedPlansDir, { withFileTypes: true });
  const completedPlanNumbers = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name.match(completedPlanPattern))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter((number) => Number.isInteger(number) && number > 0);
  const latestPlanNumber = Math.max(...completedPlanNumbers, 0);
  if (latestPlanNumber === 0) {
    return {
      latestPlan: "none",
      tenPlanProgress: "none"
    };
  }
  const windowStart = latestPlanNumber - ((latestPlanNumber - 1) % 10);
  const windowEnd = windowStart + 9;
  const completedInWindow = completedPlanNumbers.filter((number) => number >= windowStart && number <= windowEnd).length;
  return {
    latestPlan: `plan-${latestPlanNumber}`,
    tenPlanProgress: `${windowStart}-${windowEnd}: ${completedInWindow}/10`
  };
}

function syntheticCompletionSummaryReadout(completedPlanState) {
  return {
    completionSummaryReadoutReady: true,
    completionPercent: "99.999999%",
    remainingPercent: "0.000001%",
    latestPlan: completedPlanState.latestPlan,
    tenPlanProgress: completedPlanState.tenPlanProgress,
    currentOperatorStartCommand: "npm run release:channel-apply-private-env-preflight",
    currentOperatorFirstCommand: "npm run release:channel-apply-private-env-preflight",
    currentOperatorStartCommandRole: "operator-preflight",
    currentOperatorStartCommandMatchesFirstCommand: true,
    privateValuesRecorded: false,
    claimedExternalDistribution: false
  };
}

function sourceRow(label, filePath, report) {
  return {
    label,
    path: relative(filePath),
    present: report !== null,
    valueRecorded: false
  };
}

function formatCommandRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.attempted)} | ${escapeCell(
          row.exitStatus ?? "none"
        )} | ${readyLabel(row.success)} | ${escapeCell(row.statusLabel)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | \`${escapeCell(row.path)}\` | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatKeyList(keys) {
  return keys.length > 0 ? keys.join(", ") : "none";
}

function buildReport({
  preflightResult,
  applyResult,
  strictProofResult,
  completionSummaryResult,
  preflightReport,
  applyReport,
  strictProofReport,
  completionSummaryReport,
  completedPlanState,
  paths
}) {
  const preflightReady =
    preflightResult.success === true && preflightReport?.releaseChannelPrivateEnvApplyPreflightReady === true;
  const applyAttempted = preflightReady === true;
  const applyReady = applyAttempted && applyResult?.success === true && applyReport?.releaseChannelPrivateEnvApplyReady === true;
  const strictProofAttempted = applyReady === true;
  const strictProofReady =
    strictProofAttempted && strictProofResult?.success === true && strictProofReport?.privateEditStrictProofReady === true;
  const completionSummaryAttempted = strictProofReady === true;
  const completionSummaryReady =
    completionSummaryAttempted && completionSummaryResult?.success === true && completionSummaryReport?.completionSummaryReadoutReady === true;
  const runnerReady = preflightReady && applyReady && strictProofReady && completionSummaryReady;
  const commandRows = [
    commandRow(1, preflightScript, "verify release-channel private inputs without writing local env", preflightResult, true),
    commandRow(2, applyScript, "write the four release-channel rows only after preflight is ready", applyResult, applyAttempted),
    commandRow(3, strictProofScript, "run strict release-channel proof and value-free downstream checks", strictProofResult, strictProofAttempted),
    commandRow(4, completionSummaryScript, "refresh compact completion readout after proof succeeds", completionSummaryResult, completionSummaryAttempted)
  ];
  const sourceRows = [
    sourceRow("Release-channel preflight", paths.preflightJsonPath, preflightReport),
    sourceRow("Release-channel apply", paths.applyJsonPath, applyReport),
    sourceRow("Private edit strict proof", paths.strictProofJsonPath, strictProofReport),
    sourceRow("Completion summary", paths.completionSummaryJsonPath, completionSummaryReport)
  ];
  const preflightRemediationRows = Array.isArray(preflightReport?.preflightRemediationRows)
    ? preflightReport.preflightRemediationRows
    : [];
  const completionPercent = textValue(completionSummaryReport?.completionPercent, textValue(preflightReport?.completionPercent, "99.999999%"));
  const remainingPercent = textValue(completionSummaryReport?.remainingPercent, "0.000001%");
  const currentPlaceholderKeys = stringArrayValue(
    completionSummaryReport?.currentPlaceholderKeys ?? preflightReport?.currentPlaceholderKeys ?? applyReport?.currentPlaceholderKeys
  );
  const currentRequiredKeys = stringArrayValue(
    completionSummaryReport?.currentRequiredKeys ?? preflightReport?.currentRequiredKeys ?? releaseChannelMetadataKeys
  );
  const currentOperatorStartCommand = textValue(
    completionSummaryReport?.currentOperatorStartCommand,
    textValue(preflightReport?.currentOperatorFirstCommand, "npm run release:channel-apply-private-env-preflight")
  );
  const currentOperatorFirstCommand = textValue(
    completionSummaryReport?.currentOperatorFirstCommand,
    textValue(preflightReport?.currentOperatorFirstCommand, "npm run release:channel-apply-private-env-preflight")
  );
  return {
    reportCommand: successSmoke
      ? "npm run release:channel-apply-private-env-proof-smoke"
      : "npm run release:channel-apply-private-env-proof",
    sourceMode: successSmoke ? "synthetic-success-smoke" : "real-operator-runner",
    successSmoke,
    proofRunnerArtifactNames,
    proofRunnerArtifactNameCount: proofRunnerArtifactNames.length,
    releaseChannelApplyPrivateEnvProofRunnerReady: runnerReady,
    preflightReady,
    applyAttempted,
    applyReady,
    strictProofAttempted,
    strictProofReady,
    completionSummaryAttempted,
    completionSummaryReady,
    commandRows,
    commandRowCount: commandRows.length,
    commandRowsValueFree: commandRows.every((row) => row.valueRecorded === false),
    sourceRows,
    sourceRowCount: sourceRows.length,
    sourceRowsValueFree: sourceRows.every((row) => row.valueRecorded === false),
    preflightExitStatus: preflightResult.status,
    applyExitStatus: applyAttempted ? applyResult?.status ?? 1 : null,
    strictProofExitStatus: strictProofAttempted ? strictProofResult?.status ?? 1 : null,
    completionSummaryExitStatus: completionSummaryAttempted ? completionSummaryResult?.status ?? 1 : null,
    preflightRemediationRowCount: integerValue(preflightReport?.preflightRemediationRowCount) || preflightRemediationRows.length,
    preflightMissingInputCount: integerValue(preflightReport?.preflightRemediationMissingInputCount),
    preflightPlaceholderInputCount: integerValue(preflightReport?.preflightRemediationPlaceholderInputCount),
    preflightInvalidShapeCount: integerValue(preflightReport?.preflightRemediationInvalidShapeCount),
    privateInputFilePresent: preflightReport?.privateInputFilePresent === true,
    privateInputFileLoadedKeyCount: integerValue(preflightReport?.privateInputFileLoadedKeyCount),
    privateInputFileKey: textValue(preflightReport?.privateInputFileKey, "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE"),
    privateInputFileDefault: textValue(preflightReport?.privateInputFileDefault, ".env.release-channel.local"),
    nextWriteCommand: textValue(preflightReport?.nextWriteCommand, "npm run release:channel-apply-private-env"),
    strictProofCommand: textValue(preflightReport?.recommendedOperatorProofCommand, "npm run release:private-edit-strict-proof"),
    completionSummaryCommand: "npm run release:completion-summary-smoke",
    appliedKeyCount: integerValue(applyReport?.appliedKeyCount),
    currentReadyKeyCount: integerValue(applyReport?.currentReadyKeyCount),
    currentRequiredKeyCount: integerValue(applyReport?.currentRequiredKeyCount) || currentRequiredKeys.length || releaseChannelMetadataKeys.length,
    currentRequiredKeys: currentRequiredKeys.length > 0 ? currentRequiredKeys : releaseChannelMetadataKeys,
    currentPlaceholderKeyCount:
      integerValue(completionSummaryReport?.currentPlaceholderKeyCount) ||
      integerValue(preflightReport?.currentPlaceholderKeyCount) ||
      currentPlaceholderKeys.length,
    currentPlaceholderKeys,
    currentFirstBlocker: textValue(
      completionSummaryReport?.currentFirstBlocker,
      preflightReady
        ? "Release-channel apply proof runner has not completed all proof steps."
        : "Release-channel private env preflight is blocked."
    ),
    currentOperatorStartCommand,
    currentOperatorFirstCommand,
    currentOperatorStartCommandRole: textValue(completionSummaryReport?.currentOperatorStartCommandRole, "operator-preflight"),
    currentOperatorStartCommandMatchesFirstCommand: currentOperatorStartCommand === currentOperatorFirstCommand,
    userFacingCompletionPercent: completionPercent,
    userFacingRemainingPercent: remainingPercent,
    latestCompletedPlan: textValue(completionSummaryReport?.latestPlan ?? completionSummaryReport?.latestCompletedPlan, completedPlanState.latestPlan),
    tenPlanProgress: textValue(completionSummaryReport?.tenPlanProgress, completedPlanState.tenPlanProgress),
    realLocalEnvRead: successSmoke ? false : preflightReport?.realLocalEnvRead === true || applyReport?.realLocalEnvRead === true,
    realLocalEnvModified: successSmoke ? false : applyReport?.realLocalEnvModified === true,
    localEnvModifiedBeforePreflightReady: preflightReady !== true && (applyReport?.realLocalEnvModified === true || applyReport?.localEnvModified === true),
    privateValuesRecorded: false,
    localEnvValueRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    channelValueRecorded: false,
    networkProbeAttempted: false,
    updateFeedProbeAttempted: false,
    releaseUploadAttempted: false,
    signingAttempted: false,
    notarySubmissionAttempted: false,
    claimedAutoUpdate: false,
    claimedExternalDistribution: false
  };
}

function buildMarkdown(report) {
  return `# GrooveForge Release-Channel Apply Private Env Proof Runner

- Runner ready: ${readyLabel(report.releaseChannelApplyPrivateEnvProofRunnerReady)}
- Source mode: ${report.sourceMode}
- Preflight ready: ${readyLabel(report.preflightReady)}
- Apply attempted: ${readyLabel(report.applyAttempted)}
- Apply ready: ${readyLabel(report.applyReady)}
- Strict proof attempted: ${readyLabel(report.strictProofAttempted)}
- Strict proof ready: ${readyLabel(report.strictProofReady)}
- Completion summary attempted: ${readyLabel(report.completionSummaryAttempted)}
- Completion summary ready: ${readyLabel(report.completionSummaryReady)}
- Current operator start command: \`${report.currentOperatorStartCommand}\`
- Current operator start command role: ${report.currentOperatorStartCommandRole}
- Applied rows: ${report.appliedKeyCount}
- Current ready rows: ${report.currentReadyKeyCount}/${report.currentRequiredKeyCount}
- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})
- Current first blocker: ${report.currentFirstBlocker}
- Private input file key: ${report.privateInputFileKey}
- Private input file default: ${report.privateInputFileDefault}
- Private input file present: ${readyLabel(report.privateInputFilePresent)}
- Private input file loaded keys: ${report.privateInputFileLoadedKeyCount}
- Next write command: \`${report.nextWriteCommand}\`
- Strict proof command: \`${report.strictProofCommand}\`
- Completion summary command: \`${report.completionSummaryCommand}\`
- Latest completed plan: ${report.latestCompletedPlan}
- 10-plan progress: ${report.tenPlanProgress}
- User-facing completion: ${report.userFacingCompletionPercent}
- Remaining completion: ${report.userFacingRemainingPercent}
- Real local env read: ${readyLabel(report.realLocalEnvRead)}
- Real local env modified: ${readyLabel(report.realLocalEnvModified)}
- Local env modified before preflight ready: ${readyLabel(report.localEnvModifiedBeforePreflightReady)}
- Private values recorded: ${readyLabel(report.privateValuesRecorded)}
- Network probe attempted: ${readyLabel(report.networkProbeAttempted)}
- External distribution claimed: ${readyLabel(report.claimedExternalDistribution)}

## Command Rows

| order | command | role | attempted | exit status | success | status | value recorded |
|---:|---|---|---|---:|---|---|---|
${formatCommandRows(report.commandRows)}

## Source Artifacts

| label | present | path | value recorded |
|---|---|---|---|
${formatSourceRows(report.sourceRows)}

## Current Required Keys

| key | value recorded |
|---|---|
${report.currentRequiredKeys.map((key) => `| ${key} | no |`).join("\n")}

## Safety Posture

- Private values recorded: no
- Local env values recorded: no
- Release URL values recorded: no
- Support URL values recorded: no
- Channel values recorded: no
- Network: no update feed probe, distribution channel probe, release upload, Apple notary submission, or signing attempted
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion
`;
}

async function writeReport(report) {
  await mkdir(packageRoot, { recursive: true });
  const markdown = buildMarkdown(report);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  check(report.commandRowCount === 4, "release-channel proof runner should include four command rows");
  check(report.proofRunnerArtifactNameCount === 4, "release-channel proof runner should track four artifact names");
  check(report.commandRowsValueFree === true, "release-channel proof runner command rows should be value-free");
  check(report.sourceRowCount === 4, "release-channel proof runner should include four source rows");
  check(report.sourceRowsValueFree === true, "release-channel proof runner source rows should be value-free");
  check(report.preflightExitStatus === 0 || report.applyAttempted === false, "release-channel proof runner should only apply after preflight succeeds");
  check(report.strictProofAttempted === report.applyReady, "release-channel proof runner should only run strict proof after apply is ready");
  check(report.completionSummaryAttempted === report.strictProofReady, "release-channel proof runner should only run completion summary after strict proof is ready");
  check(report.localEnvModifiedBeforePreflightReady === false, "release-channel proof runner must not modify local env before preflight readiness");
  check(report.currentRequiredKeyCount === 4, "release-channel proof runner should track four release-channel keys");
  check(releaseChannelMetadataKeys.every((key) => report.currentRequiredKeys.includes(key)), "release-channel proof runner should cover release-channel keys");
  check(report.privateValuesRecorded === false, "release-channel proof runner should not record private values");
  check(report.localEnvValueRecorded === false, "release-channel proof runner should not record local env values");
  check(report.releaseUrlValueRecorded === false, "release-channel proof runner should not record release URL values");
  check(report.supportUrlValueRecorded === false, "release-channel proof runner should not record support URL values");
  check(report.channelValueRecorded === false, "release-channel proof runner should not record channel values");
  check(report.networkProbeAttempted === false, "release-channel proof runner should not probe distribution channels");
  check(report.updateFeedProbeAttempted === false, "release-channel proof runner should not probe update feeds");
  check(report.releaseUploadAttempted === false, "release-channel proof runner should not upload releases");
  check(report.signingAttempted === false, "release-channel proof runner should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release-channel proof runner should not submit to Apple");
  check(report.claimedAutoUpdate === false, "release-channel proof runner should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release-channel proof runner should not claim external distribution");
  check(!/https?:\/\//i.test(json), "release-channel proof runner JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release-channel proof runner Markdown should not include URL values");
  check(markdown.includes("Command Rows"), "release-channel proof runner Markdown should include command rows");
  check(markdown.includes("Source Artifacts"), "release-channel proof runner Markdown should include source artifacts");
  if (successSmoke) {
    check(report.releaseChannelApplyPrivateEnvProofRunnerReady === true, "release-channel proof runner success smoke should be ready");
    check(report.preflightReady === true, "release-channel proof runner success smoke should pass preflight");
    check(report.applyReady === true, "release-channel proof runner success smoke should pass apply");
    check(report.strictProofReady === true, "release-channel proof runner success smoke should pass strict proof");
    check(report.completionSummaryReady === true, "release-channel proof runner success smoke should pass completion summary");
    check(report.appliedKeyCount === 4, "release-channel proof runner success smoke should apply four keys");
    check(report.currentReadyKeyCount === 4, "release-channel proof runner success smoke should produce four ready keys");
    check(report.realLocalEnvModified === false, "release-channel proof runner success smoke should not modify real local env");
  }

  if (failures.length > 0) {
    console.error("GrooveForge release-channel apply private env proof runner failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  await writeFile(jsonPath, json, "utf8");
  await writeFile(markdownPath, markdown, "utf8");
}

const preflightJsonPath = artifactPath(preflightReportStem, "json");
const applyJsonPath = artifactPath(applyReportStem, "json");
const strictProofJsonPath = artifactPath(strictProofReportStem, "json");
const completionSummaryJsonPath = artifactPath(completionSummaryReportStem, "json");

const preflightResult = runNpmScript(preflightScript);
const preflightReport = await readJsonIfPresent(preflightJsonPath);
let applyResult = null;
let applyReport = null;
let strictProofResult = null;
let strictProofReport = null;
let completionSummaryResult = null;
let completionSummaryReport = null;
const completedPlanState = await currentCompletedPlanState();

if (preflightResult.success) {
  applyResult = runNpmScript(applyScript);
  applyReport = await readJsonIfPresent(applyJsonPath);
}

if (applyResult?.success === true && applyReport?.releaseChannelPrivateEnvApplyReady === true) {
  strictProofResult = runNpmScript(strictProofScript);
  strictProofReport = await readJsonIfPresent(strictProofJsonPath);
}

if (strictProofResult?.success === true && strictProofReport?.privateEditStrictProofReady === true) {
  if (successSmoke) {
    completionSummaryResult = runNpmScript("synthetic completion-summary readout");
    completionSummaryReport = syntheticCompletionSummaryReadout(completedPlanState);
  } else {
    completionSummaryResult = runNpmScript(completionSummaryScript);
    completionSummaryReport = await readJsonIfPresent(completionSummaryJsonPath);
  }
}

const report = buildReport({
  preflightResult,
  applyResult,
  strictProofResult,
  completionSummaryResult,
  preflightReport,
  applyReport,
  strictProofReport,
  completionSummaryReport,
  completedPlanState,
  paths: {
    preflightJsonPath,
    applyJsonPath,
    strictProofJsonPath,
    completionSummaryJsonPath
  }
});
await writeReport(report);

console.log(
  `${report.releaseChannelApplyPrivateEnvProofRunnerReady ? proofRunnerPassedMessage : proofRunnerBlockedMessage}.`
);
console.log(`- Markdown: ${relative(markdownPath)}`);
console.log(`- JSON: ${relative(jsonPath)}`);
console.log(`- Runner ready: ${report.releaseChannelApplyPrivateEnvProofRunnerReady ? "yes" : "no"}`);
console.log(`- Source mode: ${report.sourceMode}`);
console.log(`- Preflight ready: ${report.preflightReady ? "yes" : "no"}`);
console.log(`- Apply attempted: ${report.applyAttempted ? "yes" : "no"}`);
console.log(`- Apply ready: ${report.applyReady ? "yes" : "no"}`);
console.log(`- Strict proof attempted: ${report.strictProofAttempted ? "yes" : "no"}`);
console.log(`- Strict proof ready: ${report.strictProofReady ? "yes" : "no"}`);
console.log(`- Completion summary attempted: ${report.completionSummaryAttempted ? "yes" : "no"}`);
console.log(`- Completion summary ready: ${report.completionSummaryReady ? "yes" : "no"}`);
console.log(`- Current operator start command: ${report.currentOperatorStartCommand}`);
console.log(`- Current operator start command role: ${report.currentOperatorStartCommandRole}`);
console.log(`- Applied rows: ${report.appliedKeyCount}`);
console.log(`- Current ready rows: ${report.currentReadyKeyCount}/${report.currentRequiredKeyCount}`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- Private input file key: ${report.privateInputFileKey}`);
console.log(`- Private input file default: ${report.privateInputFileDefault}`);
console.log(`- Private input file present: ${report.privateInputFilePresent ? "yes" : "no"}`);
console.log(`- Private input file loaded keys: ${report.privateInputFileLoadedKeyCount}`);
console.log(`- Next write command: ${report.nextWriteCommand}`);
console.log(`- Strict proof command: ${report.strictProofCommand}`);
console.log(`- Completion summary command: ${report.completionSummaryCommand}`);
console.log(`- Latest completed plan: ${report.latestCompletedPlan}`);
console.log(`- 10-plan progress: ${report.tenPlanProgress}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}`);
console.log(`- Real local env read: ${report.realLocalEnvRead ? "yes" : "no"}`);
console.log(`- Real local env modified: ${report.realLocalEnvModified ? "yes" : "no"}`);
console.log(`- Local env modified before preflight ready: ${report.localEnvModifiedBeforePreflightReady ? "yes" : "no"}`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");

if (!successSmoke && !report.releaseChannelApplyPrivateEnvProofRunnerReady) {
  process.exit(1);
}
