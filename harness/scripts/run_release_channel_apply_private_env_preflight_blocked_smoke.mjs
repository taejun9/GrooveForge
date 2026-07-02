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
    rowsValueFree(report.applyPlanRows) &&
    rowsValueFree(report.preflightRemediationRows) &&
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
- Blocked rows: ${report.blockedKeyCount}
- Preflight remediation rows: ${report.preflightRemediationRowCount}
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

## Remediation Rows

| order | key | input present | input placeholder | input shape ready | remediation | next command | value recorded |
|---:|---|---:|---:|---:|---|---|---:|
${formatRows(report.preflightRemediationRows)}

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
  blockedKeyCount: report.blockedKeyCount,
  preflightRemediationRowCount: report.preflightRemediationRowCount,
  preflightRemediationRows: report.preflightRemediationRows,
  currentOperatorFirstCommand: report.currentOperatorFirstCommand,
  nextWriteCommand: report.nextWriteCommand,
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
console.log(`- Preflight remediation rows: ${report.preflightRemediationRowCount}`);
console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
console.log(`- Next write command: ${report.nextWriteCommand}`);
console.log(`- Next proof after apply: ${report.recommendedOperatorProofCommand}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
