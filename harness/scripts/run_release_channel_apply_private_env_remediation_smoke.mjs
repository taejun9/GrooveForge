#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const smokeRoot = path.join(packageRoot, "release-channel-apply-private-env-remediation-smoke");
const reportStem = "release-channel-apply-private-env-remediation-smoke";
const markdownArtifactName = "release-channel-apply-private-env-remediation-smoke.md";
const jsonArtifactName = "release-channel-apply-private-env-remediation-smoke.json";
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const childReportJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-apply-private-env-preflight.json`
);
const envFileName = ".env.distribution.local";
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const commandNames = {
  preflight: "npm run release:channel-apply-private-env-preflight",
  apply: "npm run release:channel-apply-private-env",
  fallback: "npm run release:channel-setup-wizard",
  proof: "npm run release:private-edit-strict-proof",
  prepareEnv: "npm run release:prepare-env"
};
const cases = [
  {
    id: "missing-env-scaffold",
    envFilePresent: false,
    processValues: {},
    expectedRemediation: "create-ignored-env-scaffold",
    expectedNextCommand: commandNames.prepareEnv,
    expectedMissingInputCount: 4,
    expectedPlaceholderInputCount: 0,
    expectedInvalidShapeCount: 0
  },
  {
    id: "missing-process-env",
    envFilePresent: true,
    processValues: {},
    expectedRemediation: "set-process-env",
    expectedNextCommand: commandNames.preflight,
    expectedMissingInputCount: 4,
    expectedPlaceholderInputCount: 0,
    expectedInvalidShapeCount: 0
  },
  {
    id: "placeholder-process-env",
    envFilePresent: true,
    processValues: Object.fromEntries(releaseChannelMetadataKeys.map((key) => [key, "CHANGE_ME"])),
    expectedRemediation: "replace-process-env-placeholder",
    expectedNextCommand: commandNames.preflight,
    expectedMissingInputCount: 0,
    expectedPlaceholderInputCount: 4,
    expectedInvalidShapeCount: 0
  },
  {
    id: "shape-invalid-process-env",
    envFilePresent: true,
    processValues: Object.fromEntries(releaseChannelMetadataKeys.map((key) => [key, "wrong-shape"])),
    expectedRemediation: "fix-process-env-shape",
    expectedNextCommand: commandNames.preflight,
    expectedMissingInputCount: 0,
    expectedPlaceholderInputCount: 0,
    expectedInvalidShapeCount: 4
  }
];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
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

function childEnvForCase(testCase, caseRootRelative) {
  const env = { ...process.env };
  for (const key of releaseChannelMetadataKeys) {
    delete env[key];
  }
  delete env.GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT;
  delete env.GROOVEFORGE_DISTRIBUTION_ENV_FILE;
  return {
    ...env,
    ...testCase.processValues,
    GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT: caseRootRelative,
    GROOVEFORGE_DISTRIBUTION_ENV_FILE: envFileName
  };
}

async function writeSyntheticEnv(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    [
      "# Synthetic blocked remediation fixture for release-channel private env apply.",
      "GROOVEFORGE_DISTRIBUTION_CHANNEL=<distribution-channel>",
      "GROOVEFORGE_RELEASE_DOWNLOAD_URL=<release-download-url>",
      "GROOVEFORGE_RELEASE_NOTES_URL=<release-notes-url>",
      "GROOVEFORGE_SUPPORT_URL=<support-url>",
      ""
    ].join("\n"),
    "utf8"
  );
}

function formatCaseRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.id)} | ${escapeCell(row.expectedRemediation)} | ${escapeCell(row.actualRemediationSummary)} | ${escapeCell(row.expectedNextCommand)} | ${escapeCell(row.actualNextCommandSummary)} | ${row.missingInputCount} | ${row.placeholderInputCount} | ${row.invalidShapeCount} | ${readyLabel(row.ready)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} Release-Channel Preflight Remediation Smoke

## Summary

- Smoke ready: ${readyLabel(report.releaseChannelPreflightRemediationSmokeReady)}
- Cases: ${report.caseCount}
- Ready cases: ${report.readyCaseCount}/${report.caseCount}
- Real local env read: ${readyLabel(report.realLocalEnvRead)}
- Real local env modified: ${readyLabel(report.realLocalEnvModified)}
- Current operator command: \`${report.currentOperatorFirstCommand}\`
- Next write command: \`${report.nextWriteCommand}\`
- Guided fallback command: \`${report.guidedSetupFallbackCommand}\`
- Strict proof command: \`${report.recommendedOperatorProofCommand}\`
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- External distribution claimed: no

## Case Rows

| case | expected remediation | actual remediation | expected next command | actual next command | missing inputs | placeholder inputs | invalid-shape inputs | ready | value recorded |
|---|---|---|---|---|---:|---:|---:|---:|---:|
${formatCaseRows(report.caseRows)}

## Not Recorded

This smoke records key names, remediation labels, readiness booleans, row counts, artifact paths, and command names only. It does not record release URLs, support URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, private beats, or real user audio.

## Not Claimed

This smoke does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function runCase(testCase) {
  const caseRoot = path.join(smokeRoot, testCase.id);
  const caseRootRelative = relative(caseRoot);
  const envPath = path.join(caseRoot, envFileName);
  await rm(caseRoot, { recursive: true, force: true });
  await mkdir(caseRoot, { recursive: true });
  if (testCase.envFilePresent) {
    await writeSyntheticEnv(envPath);
  }

  const child = spawnSync(
    process.execPath,
    ["harness/scripts/run_release_channel_apply_private_env.mjs", "--preflight"],
    {
      cwd: root,
      env: childEnvForCase(testCase, caseRootRelative),
      encoding: "utf8"
    }
  );
  const childOutput = `${child.stdout ?? ""}\n${child.stderr ?? ""}`;
  check(child.status !== 0, `${testCase.id} release-channel private env apply remediation child should exit non-zero`);
  check(!/https?:\/\//i.test(childOutput), `${testCase.id} child output should not include URL values`);
  check(existsSync(childReportJsonPath), `${testCase.id} child report JSON should exist`);
  const report = existsSync(childReportJsonPath) ? JSON.parse(await readFile(childReportJsonPath, "utf8")) : null;
  const remediationRows = report?.preflightRemediationRows ?? [];
  const remediations = [...new Set(remediationRows.map((row) => row.remediation))];
  const nextCommands = [...new Set(remediationRows.map((row) => row.nextCommand))];
  const rowReady =
    report?.preflightRemediationRowCount === 4 &&
    remediations.length === 1 &&
    remediations[0] === testCase.expectedRemediation &&
    nextCommands.length === 1 &&
    nextCommands[0] === testCase.expectedNextCommand &&
    report.preflightRemediationMissingInputCount === testCase.expectedMissingInputCount &&
    report.preflightRemediationPlaceholderInputCount === testCase.expectedPlaceholderInputCount &&
    report.preflightRemediationInvalidShapeCount === testCase.expectedInvalidShapeCount &&
    report.currentOperatorFirstCommand === commandNames.preflight &&
    report.nextWriteCommand === commandNames.apply &&
    report.guidedSetupFallbackCommand === commandNames.fallback &&
    report.recommendedOperatorProofCommand === commandNames.proof &&
    report.operatorReceiptReady === true &&
    report.operatorReceiptRowCount === 6 &&
    report.operatorReceiptRows.every((row) => row.valueRecorded === false) &&
    report.realLocalEnvRead === false &&
    report.realLocalEnvModified === false &&
    report.privateValuesRecorded === false &&
    report.localEnvValueRecorded === false &&
    report.networkProbeAttempted === false &&
    report.releaseGateClaimedExternalDistribution === false &&
    remediationRows.every((row) => row.valueRecorded === false);

  check(report?.preflightRemediationRowCount === 4, `${testCase.id} remediation report should expose four remediation rows`);
  check(report?.operatorReceiptReady === true, `${testCase.id} remediation report should expose a ready operator receipt`);
  check(report?.operatorReceiptRowCount === 6, `${testCase.id} remediation report should expose six operator receipt rows`);
  check(
    report?.operatorReceiptRows.every((row) => row.valueRecorded === false),
    `${testCase.id} remediation report operator receipt rows should be value-free`
  );
  check(report?.realLocalEnvRead === false, `${testCase.id} remediation report should not read real local env`);
  check(report?.realLocalEnvModified === false, `${testCase.id} remediation report should not modify real local env`);
  check(report?.privateValuesRecorded === false, `${testCase.id} remediation report should not record private values`);
  check(
    report?.releaseGateClaimedExternalDistribution === false,
    `${testCase.id} remediation report should not claim external distribution`
  );
  check(rowReady, `${testCase.id} remediation report should match expected blocked posture`);
  if (report) {
    const reportText = JSON.stringify(report);
    check(!/https?:\/\//i.test(reportText), `${testCase.id} remediation report should not include URL values`);
  }

  return {
    id: testCase.id,
    reportCommand: commandNames.preflight,
    envRoot: caseRootRelative,
    envFilePresent: testCase.envFilePresent,
    expectedRemediation: testCase.expectedRemediation,
    actualRemediations: remediations,
    actualRemediationSummary: remediations.length > 0 ? remediations.join(", ") : "none",
    expectedNextCommand: testCase.expectedNextCommand,
    actualNextCommands: nextCommands,
    actualNextCommandSummary: nextCommands.length > 0 ? nextCommands.join(", ") : "none",
    missingInputCount: report?.preflightRemediationMissingInputCount ?? 0,
    placeholderInputCount: report?.preflightRemediationPlaceholderInputCount ?? 0,
    invalidShapeCount: report?.preflightRemediationInvalidShapeCount ?? 0,
    remediationRowCount: report?.preflightRemediationRowCount ?? 0,
    operatorReceiptRowCount: report?.operatorReceiptRowCount ?? 0,
    childExitCode: child.status,
    ready: rowReady,
    valueRecorded: false
  };
}

await mkdir(packageRoot, { recursive: true });
const caseRows = [];
for (const testCase of cases) {
  caseRows.push(await runCase(testCase));
}

const report = {
  appName,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  platformArch,
  releaseChannelPreflightRemediationSmokeReady: caseRows.every((row) => row.ready === true),
  caseCount: caseRows.length,
  readyCaseCount: caseRows.filter((row) => row.ready === true).length,
  caseRows,
  caseRowCount: caseRows.length,
  currentOperatorFirstCommand: commandNames.preflight,
  nextWriteCommand: commandNames.apply,
  guidedSetupFallbackCommand: commandNames.fallback,
  recommendedOperatorProofCommand: commandNames.proof,
  realLocalEnvRead: false,
  realLocalEnvModified: false,
  privateValuesRecorded: false,
  localEnvValueRecorded: false,
  releaseUrlValueRecorded: false,
  supportUrlValueRecorded: false,
  channelValueRecorded: false,
  networkProbeAttempted: false,
  releaseUploadAttempted: false,
  notarySubmissionAttempted: false,
  signingAttempted: false,
  releaseGateClaimedDeveloperIdSigning: false,
  releaseGateClaimedNotarization: false,
  releaseGateClaimedGatekeeperApproval: false,
  releaseGateClaimedAutoUpdate: false,
  releaseGateClaimedManualQaApproval: false,
  releaseGateClaimedExternalDistribution: false,
  markdownPath: relative(markdownPath),
  jsonPath: relative(jsonPath),
  artifactNames: [markdownArtifactName, jsonArtifactName],
  valueRecorded: false
};

check(report.releaseChannelPreflightRemediationSmokeReady === true, "preflight remediation smoke should be ready");
check(report.caseCount === 4, "preflight remediation smoke should cover four blocked cases");
check(report.readyCaseCount === 4, "preflight remediation smoke should pass all blocked cases");
check(report.caseRows.every((row) => row.valueRecorded === false), "preflight remediation smoke rows should be value-free");
check(report.realLocalEnvRead === false, "preflight remediation smoke should not read real local env");
check(report.realLocalEnvModified === false, "preflight remediation smoke should not modify real local env");
check(report.privateValuesRecorded === false, "preflight remediation smoke should not record private values");
check(report.networkProbeAttempted === false, "preflight remediation smoke should not probe networks");
check(report.releaseGateClaimedExternalDistribution === false, "preflight remediation smoke should not claim external distribution");

const markdown = buildMarkdown(report);
const json = `${JSON.stringify(report, null, 2)}\n`;
const combined = `${markdown}\n${json}`;
check(!/https?:\/\//i.test(combined), "preflight remediation smoke artifacts should not include URL values");
await writeFile(markdownPath, markdown, "utf8");
await writeFile(jsonPath, json, "utf8");

if (failures.length > 0) {
  console.error("GrooveForge release-channel private env apply remediation smoke failed.");
  console.error(`- Markdown: ${relative(markdownPath)}`);
  console.error(`- JSON: ${relative(jsonPath)}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GrooveForge release-channel private env apply remediation smoke passed.");
console.log(`- Markdown: ${relative(markdownPath)}`);
console.log(`- JSON: ${relative(jsonPath)}`);
console.log(`- Cases: ${report.readyCaseCount}/${report.caseCount}`);
console.log("- Blocked cases: 4");
console.log("- Covered: missing-env-scaffold, missing-process-env, placeholder-process-env, shape-invalid-process-env");
console.log(`- Current operator command: ${report.currentOperatorFirstCommand}`);
console.log(`- Next write command: ${report.nextWriteCommand}`);
console.log(`- Guided setup fallback: ${report.guidedSetupFallbackCommand}`);
console.log(`- Strict proof command: ${report.recommendedOperatorProofCommand}`);
console.log("- Real local env read: no");
console.log("- Real local env modified: no");
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
