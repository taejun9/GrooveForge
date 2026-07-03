#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const sourceReportStem = "release-channel-apply-private-env-preflight";
const sourceJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${sourceReportStem}.json`);
const sourceMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${sourceReportStem}.md`);
const blockedStem = "release-channel-apply-private-env-preflight-blocked-smoke";
const blockedJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${blockedStem}.json`);
const blockedMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${blockedStem}.md`);
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const preflightCommand = "npm run release:channel-apply-private-env-preflight";
const prepareEnvCommand = "npm run release:prepare-env";
const applyCommand = "npm run release:channel-apply-private-env";
const strictProofCommand = "npm run release:private-edit-strict-proof";
const hardGateCommand = "npm run release:external-check";
const privateInputFileKey = "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE";
const defaultPrivateInputFileName = ".env.release-channel.local";
const guidedSetupFallbackCommand = "npm run release:channel-setup-wizard";
const blockedPrivateInputFilePathMode = "blocked-smoke-isolated-missing-input-file";
const blockedPrivateInputFile = path.join(
  "build",
  "desktop",
  `${appName}-${platformArch}`,
  `release-channel-preflight-blocked-missing-input-${process.pid}.local`
);
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release-channel private env apply preflight blocked smoke failed:");
  console.error(`- ${message}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
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

function candidateLocalEnvPath() {
  return path.join(root, ".env.distribution.local");
}

async function readOptional(filePath) {
  return existsSync(filePath) ? await readFile(filePath, "utf8") : "";
}

function childEnvironment() {
  const env = { ...process.env };
  for (const key of releaseChannelMetadataKeys) {
    delete env[key];
  }
  delete env.GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT;
  env.GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE = blockedPrivateInputFile;
  delete env.GROOVEFORGE_DISTRIBUTION_ENV_FILE;
  return env;
}

function rowsValueFree(rows) {
  return Array.isArray(rows) && rows.every((row) => row && row.valueRecorded === false);
}

function reportIsValueFree(report) {
  return (
    report.privateValuesRecorded === false &&
    report.localEnvValueRecorded === false &&
    report.releaseUrlValueRecorded === false &&
    report.supportUrlValueRecorded === false &&
    report.channelValueRecorded === false &&
    report.networkProbeAttempted === false &&
    report.releaseUploadAttempted === false &&
    report.notarySubmissionAttempted === false &&
    report.signingAttempted === false &&
    report.releaseGateClaimedExternalDistribution === false &&
    report.valueRecorded === false &&
    rowsValueFree(report.processEnvInputChecklistRows) &&
    rowsValueFree(report.privateInputSourceRows) &&
    rowsValueFree(report.applyPlanRows) &&
    rowsValueFree(report.preflightRemediationRows) &&
    rowsValueFree(report.operatorReceiptRows) &&
    rowsValueFree(report.afterApplyRows)
  );
}

function privateValueLeakCandidates(report) {
  return [
    ...(Array.isArray(report.inputMissingKeys) ? report.inputMissingKeys : []),
    ...(Array.isArray(report.inputPlaceholderKeys) ? report.inputPlaceholderKeys : []),
    ...(Array.isArray(report.inputShapeInvalidKeys) ? report.inputShapeInvalidKeys : []),
    ...(Array.isArray(report.currentPlaceholderKeys) ? report.currentPlaceholderKeys : []),
    ...(Array.isArray(report.currentRequiredKeys) ? report.currentRequiredKeys : [])
  ];
}

function formatRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${readyLabel(row.inputPresent)} | ${readyLabel(row.inputPlaceholder)} | ${readyLabel(row.inputShapeReady)} | ${escapeCell(row.remediation)} | \`${escapeCell(row.nextCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatProcessEnvInputRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.inputSource)} | ${readyLabel(row.inputPresent)} | ${readyLabel(row.inputPlaceholder)} | ${readyLabel(row.inputShapeReady)} | ${escapeCell(row.expectedShape)} | \`${escapeCell(row.preflightCommand)}\` | \`${escapeCell(row.writeCommand)}\` | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatOperatorReceiptRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.step)} | ${escapeCell(row.status)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.target)} | ${escapeCell(row.expectedEvidence)} | ${escapeCell(row.operatorAction)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} Release-Channel Preflight Blocked Smoke

## Summary

- Source command: \`${report.sourceCommand}\`
- Source exit status: ${report.sourceExitStatus}
- Blocked smoke ready: ${readyLabel(report.blockedSmokeReady)}
- Expected blocked exit observed: ${readyLabel(report.expectedBlockedExitObserved)}
- Source preflight ready: ${readyLabel(report.sourcePreflightReady)}
- Source apply ready: ${readyLabel(report.sourceApplyReady)}
- Local env loaded: ${readyLabel(report.localEnvFileLoaded)}
- Local env modified: ${readyLabel(report.localEnvModified)}
- Real local env modified: ${readyLabel(report.realLocalEnvModified)}
- Missing process env inputs: ${report.missingInputCount}/${report.requiredInputCount}
- Private input file key: \`${report.privateInputFileKey}\`
- Private input file default: \`${report.privateInputFileDefaultName}\`
- Private input file path: ${report.privateInputFilePath}
- Private input file path mode: ${report.privateInputFilePathMode}
- Private input file present: ${readyLabel(report.privateInputFilePresent)}
- Private input file loaded keys: ${report.privateInputFileLoadedKeyCount} (${report.privateInputFileLoadedKeySummary})
- Guided setup fallback command: \`${report.guidedSetupFallbackCommand}\`
- Process env checklist rows: ${report.processEnvInputChecklistRowCount}
- Blocked rows: ${report.blockedKeyCount}
- Preflight remediation rows: ${report.preflightRemediationRowCount}
- Operator receipt ready: ${readyLabel(report.operatorReceiptReady)}
- Operator receipt rows: ${report.operatorReceiptRowCount}
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Next write command: \`${report.nextWriteCommand}\`
- Proof command after apply: \`${report.recommendedOperatorProofCommand}\`
- Hard gate command: \`${report.hardGateCommand}\`
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- External distribution claimed: no

## Process Env Input Checklist

| order | key | input source | input present | input placeholder | input shape ready | expected shape | preflight command | write command | proof command | value recorded |
|---:|---|---|---:|---:|---:|---|---|---|---|---:|
${formatProcessEnvInputRows(report.processEnvInputChecklistRows)}

## Remediation Rows

| order | key | input present | input placeholder | input shape ready | remediation | next command | value recorded |
|---:|---|---:|---:|---:|---|---|---:|
${formatRows(report.preflightRemediationRows)}

## Operator Receipt

| order | step | status | command | target | expected evidence | operator action | value recorded |
|---:|---|---|---|---|---|---|---:|
${formatOperatorReceiptRows(report.operatorReceiptRows)}

## Boundary

This smoke intentionally removes the four release-channel process env inputs before running the real preflight command. It treats the blocked preflight as the expected safe state, validates that no local env file is modified, and records only key names, booleans, row counts, command names, and artifact paths.
`;
}

const localEnvPath = candidateLocalEnvPath();
const beforeLocalEnvText = await readOptional(localEnvPath);
const beforeSourceReportText = await readOptional(sourceJsonPath);
const child = spawnSync(process.execPath, ["harness/scripts/run_release_channel_apply_private_env.mjs", "--preflight"], {
  cwd: root,
  env: childEnvironment(),
  encoding: "utf8"
});
const childOutput = `${child.stdout ?? ""}\n${child.stderr ?? ""}`;
const afterLocalEnvText = await readOptional(localEnvPath);

check(child.status !== 0, "real preflight should be blocked when release-channel process env inputs are not provided");
check(existsSync(sourceJsonPath), "real blocked preflight should write a source JSON report");
check(existsSync(sourceMarkdownPath), "real blocked preflight should write a source Markdown report");
check(afterLocalEnvText === beforeLocalEnvText, "blocked preflight should not modify .env.distribution.local");

const report = existsSync(sourceJsonPath) ? JSON.parse(await readFile(sourceJsonPath, "utf8")) : null;
if (!report) {
  fail("Source preflight report was not available after blocked preflight.");
}

const sourceReportText = await readFile(sourceJsonPath, "utf8");
const sourceMarkdownText = await readFile(sourceMarkdownPath, "utf8");
const childCombinedOutput = `${childOutput}\n${sourceReportText}\n${sourceMarkdownText}`;

check(report.syntheticSuccessSmoke === false, "blocked preflight source report should not be a synthetic success smoke");
check(report.syntheticPreflightSmoke === false, "blocked preflight source report should not be a synthetic preflight smoke");
check(report.preflightOnly === true, "blocked preflight source report should be preflight-only");
check(report.localEnvRootOverrideEnabled === false, "blocked preflight source report should not use a synthetic root override");
check(report.localEnvModified === false, "blocked preflight source report should not modify local env");
check(report.realLocalEnvModified === false, "blocked preflight source report should not modify the real local env");
check(report.releaseChannelPrivateEnvApplyPreflightReady === false, "blocked preflight source report should not be preflight ready");
check(report.releaseChannelPrivateEnvApplyReady === false, "blocked preflight source report should not claim apply readiness");
check(report.currentOperatorFirstCommand === preflightCommand, "blocked preflight should keep preflight as the current operator first command");
check(report.nextWriteCommand === applyCommand, "blocked preflight should point to the write command after preflight passes");
check(report.recommendedOperatorProofCommand === strictProofCommand, "blocked preflight should point to the strict proof command after apply");
check(report.appliedKeyCount === 0, "blocked preflight should apply zero keys");
check(report.inputMissingKeys?.length === releaseChannelMetadataKeys.length, "blocked preflight should report four missing process env inputs");
check(report.preflightRemediationMissingInputCount === releaseChannelMetadataKeys.length, "blocked preflight should include four missing-input remediation rows");
check(report.preflightRemediationRowCount === releaseChannelMetadataKeys.length, "blocked preflight should include four preflight remediation rows");
check(report.processEnvInputChecklistRowCount === releaseChannelMetadataKeys.length, "blocked preflight should include four process env input checklist rows");
check(report.processEnvInputChecklistRows.every((row) => row.inputSource === "process.env"), "blocked preflight checklist rows should identify process.env as the input source");
check(report.processEnvInputChecklistRows.every((row) => row.inputPresent === false), "blocked preflight checklist rows should show missing process env inputs");
check(report.processEnvInputChecklistRows.every((row) => row.valueRecorded === false), "blocked preflight checklist rows should be value-free");
check(report.privateInputFilePresent === false, "blocked preflight should not read an existing private input file");
check(report.privateInputSourceRowCount === releaseChannelMetadataKeys.length, "blocked preflight should include four private input source rows");
check(report.privateInputSourceRows.every((row) => row.valueRecorded === false), "blocked preflight private input source rows should be value-free");
check(report.processEnvInputChecklistRows.every((row) => row.preflightCommand === preflightCommand), "blocked preflight checklist rows should include the preflight command");
check(report.processEnvInputChecklistRows.every((row) => row.writeCommand === applyCommand), "blocked preflight checklist rows should include the write command");
check(report.processEnvInputChecklistRows.every((row) => row.proofCommand === strictProofCommand), "blocked preflight checklist rows should include the strict proof command");
check(report.privateInputFileKey === privateInputFileKey, "blocked preflight should expose the private input file key");
check(report.privateInputFileDefaultName === defaultPrivateInputFileName, "blocked preflight should expose the default private input file name");
check(report.privateInputFilePath === blockedPrivateInputFile, "blocked preflight should expose the isolated missing private input file path");
check(report.privateInputFilePresent === false, "blocked preflight should keep the isolated private input file absent");
check(report.privateInputFileLoadedKeyCount === 0, "blocked preflight should load zero private input file keys");
check(report.privateInputFileLoadedKeySummary === "none", "blocked preflight should summarize absent private input file keys");
check(report.privateInputFileValueRecorded === false, "blocked preflight should not record private input file values");
check(report.guidedSetupFallbackCommand === guidedSetupFallbackCommand, "blocked preflight should expose the guided setup fallback command");
check(report.operatorReceiptReady === true, "blocked preflight should include a ready value-free operator receipt");
check(report.operatorReceiptRowCount === 6, "blocked preflight operator receipt should include six rows");
check(report.operatorReceiptRows.every((row) => row.valueRecorded === false), "blocked preflight operator receipt rows should be value-free");
check(report.operatorReceiptRows[0]?.command === preflightCommand, "blocked preflight operator receipt should start with the preflight command");
check(report.operatorReceiptRows.some((row) => row.command === applyCommand), "blocked preflight operator receipt should include the write command");
check(report.operatorReceiptRows.some((row) => row.command === strictProofCommand), "blocked preflight operator receipt should include the strict proof chain");
check(report.operatorReceiptRows.some((row) => row.command === hardGateCommand), "blocked preflight operator receipt should include the hard-gate boundary");
check(
  report.preflightRemediationRows.every((row) => [preflightCommand, prepareEnvCommand].includes(row.nextCommand)),
  "blocked preflight remediation rows should point to prepare-env when the ignored env is missing or preflight when process env inputs are missing"
);
check(report.preflightRemediationRows.every((row) => row.writeCommand === applyCommand), "blocked preflight remediation rows should include the write command");
check(report.preflightRemediationRows.every((row) => row.proofCommand === strictProofCommand), "blocked preflight remediation rows should include the strict proof command");
check(reportIsValueFree(report), "blocked preflight source report should remain value-free and non-claiming");
check(!/https?:\/\//i.test(childCombinedOutput), "blocked preflight output and reports should not include URL values");

for (const value of privateValueLeakCandidates(report)) {
  check(!beforeSourceReportText.includes(`${value}=`), "previous source report should not contain key assignment values");
}

const blockedReport = {
  appName,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  platformArch,
  sourceCommand: preflightCommand,
  sourceExitStatus: child.status,
  expectedBlockedExitObserved: child.status !== 0,
  blockedSmokeReady: failures.length === 0 && child.status !== 0,
  sourcePreflightReady: report.releaseChannelPrivateEnvApplyPreflightReady,
  sourceApplyReady: report.releaseChannelPrivateEnvApplyReady,
  sourceMarkdownPath: relative(sourceMarkdownPath),
  sourceJsonPath: relative(sourceJsonPath),
  localEnvTarget: report.currentEnvEditTarget,
  localEnvFileLoaded: report.localEnvFileLoaded,
  localEnvModified: report.localEnvModified,
  realLocalEnvModified: report.realLocalEnvModified,
  requiredInputCount: releaseChannelMetadataKeys.length,
  missingInputCount: report.inputMissingKeys.length,
  missingInputKeys: report.inputMissingKeys,
  privateInputFileKey: report.privateInputFileKey,
  privateInputFileDefaultName: report.privateInputFileDefaultName,
  privateInputFilePath: report.privateInputFilePath,
  privateInputFilePathMode: blockedPrivateInputFilePathMode,
  privateInputFilePresent: report.privateInputFilePresent,
  privateInputFileConfigured: report.privateInputFileConfigured,
  privateInputFileLoadedKeyCount: report.privateInputFileLoadedKeyCount,
  privateInputFileLoadedKeySummary: report.privateInputFileLoadedKeySummary,
  privateInputFileUnknownKeyCount: report.privateInputFileUnknownKeyCount,
  privateInputFileMalformedLineCount: report.privateInputFileMalformedLineCount,
  privateInputFileValueRecorded: report.privateInputFileValueRecorded,
  processEnvInputChecklistRowCount: report.processEnvInputChecklistRowCount,
  processEnvInputChecklistRows: report.processEnvInputChecklistRows,
  blockedKeyCount: report.blockedKeyCount,
  preflightRemediationRowCount: report.preflightRemediationRowCount,
  preflightRemediationRows: report.preflightRemediationRows,
  operatorReceiptReady: report.operatorReceiptReady,
  operatorReceiptRowCount: report.operatorReceiptRowCount,
  operatorReceiptRows: report.operatorReceiptRows,
  currentOperatorFirstCommand: report.currentOperatorFirstCommand,
  nextWriteCommand: report.nextWriteCommand,
  guidedSetupFallbackCommand: report.guidedSetupFallbackCommand,
  guidedSetupFallbackValueRecorded: false,
  recommendedOperatorProofCommand: report.recommendedOperatorProofCommand,
  hardGateCommand,
  privateValuesRecorded: false,
  localEnvValueRecorded: false,
  releaseUrlValueRecorded: false,
  supportUrlValueRecorded: false,
  channelValueRecorded: false,
  credentialValueRecorded: false,
  tokenValueRecorded: false,
  developerIdIdentityValueRecorded: false,
  networkProbeAttempted: false,
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

const blockedMarkdown = buildMarkdown(blockedReport);
const blockedJson = `${JSON.stringify(blockedReport, null, 2)}\n`;
const blockedCombined = `${blockedMarkdown}\n${blockedJson}`;
check(!/https?:\/\//i.test(blockedCombined), "blocked preflight smoke artifacts should not include URL values");

if (failures.length > 0) {
  fail("Validation failed.", childOutput);
}

await writeFile(blockedMarkdownPath, blockedMarkdown, "utf8");
await writeFile(blockedJsonPath, blockedJson, "utf8");

process.stdout.write(child.stdout ?? "");
process.stderr.write(child.stderr ?? "");
console.log("GrooveForge release-channel private env apply preflight blocked smoke passed.");
console.log(`- Markdown: ${relative(blockedMarkdownPath)}`);
console.log(`- JSON: ${relative(blockedJsonPath)}`);
console.log(`- Source preflight JSON: ${relative(sourceJsonPath)}`);
console.log(`- Source exit status: ${child.status}`);
console.log("- Expected blocked exit observed: yes");
console.log(`- Local env file loaded: ${report.localEnvFileLoaded ? "yes" : "no"}`);
console.log("- Local env modified: no");
console.log("- Real local env modified: no");
console.log(`- Missing process env inputs: ${report.inputMissingKeys.length}/${releaseChannelMetadataKeys.length}`);
console.log(`- Private input file key: ${report.privateInputFileKey}`);
console.log(`- Private input file default: ${report.privateInputFileDefaultName}`);
console.log(`- Private input file path: ${report.privateInputFilePath}`);
console.log(`- Private input file present: ${report.privateInputFilePresent ? "yes" : "no"}`);
console.log(`- Private input file loaded keys: ${report.privateInputFileLoadedKeyCount}`);
console.log(`- Guided setup fallback: ${report.guidedSetupFallbackCommand}`);
console.log(`- Process env checklist rows: ${report.processEnvInputChecklistRowCount}`);
console.log(`- Preflight remediation rows: ${report.preflightRemediationRowCount}`);
console.log(`- Operator receipt rows: ${report.operatorReceiptRowCount}`);
console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
console.log(`- Next write command: ${report.nextWriteCommand}`);
console.log(`- Next proof after apply: ${report.recommendedOperatorProofCommand}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
