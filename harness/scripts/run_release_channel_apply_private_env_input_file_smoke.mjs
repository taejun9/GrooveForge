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
const smokeRoot = path.join(packageRoot, "release-channel-apply-private-env-input-file-smoke");
const smokeRootRelative = path.relative(root, smokeRoot);
const distributionEnvFileName = ".env.distribution.local";
const privateInputFileName = ".env.release-channel.local";
const syntheticEnvPath = path.join(smokeRoot, distributionEnvFileName);
const syntheticInputPath = path.join(smokeRoot, privateInputFileName);
const reportStem = "release-channel-apply-private-env-input-file-smoke";
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const preflightReportJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-apply-private-env-preflight.json`
);
const applyReportJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-apply-private-env.json`
);
const strictReportJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-live-check-strict.json`
);
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const syntheticValues = {
  GROOVEFORGE_DISTRIBUTION_CHANNEL: "private-beta",
  GROOVEFORGE_RELEASE_DOWNLOAD_URL: "https://downloads.invalid/grooveforge.dmg",
  GROOVEFORGE_RELEASE_NOTES_URL: "https://releases.invalid/grooveforge-notes",
  GROOVEFORGE_SUPPORT_URL: "https://support.invalid/grooveforge"
};
const commandNames = {
  preflight: "npm run release:channel-apply-private-env-preflight",
  apply: "npm run release:channel-apply-private-env",
  strict: "npm run release:channel-live-check-strict",
  proof: "npm run release:private-edit-strict-proof"
};
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

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }
  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function parseEnvMap(text) {
  return new Map(text.split(/\r?\n/).map(parseEnvLine).filter(Boolean).map((entry) => [entry.key, entry.value]));
}

function childEnv(extraEnv = {}) {
  const env = { ...process.env };
  for (const key of releaseChannelMetadataKeys) {
    delete env[key];
  }
  delete env.GROOVEFORGE_DISTRIBUTION_ENV_FILE;
  delete env.GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT;
  delete env.GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE;
  delete env.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_ENV_ROOT;
  delete env.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_REPORT_STEM;
  return {
    ...env,
    ...extraEnv
  };
}

function runNodeScript(args, env) {
  return spawnSync(process.execPath, args, {
    cwd: root,
    env,
    encoding: "utf8"
  });
}

function outputContainsSyntheticValues(output) {
  return Object.values(syntheticValues).some((value) => output.includes(value));
}

async function readJson(filePath) {
  check(existsSync(filePath), `${relative(filePath)} should exist`);
  return existsSync(filePath) ? JSON.parse(await readFile(filePath, "utf8")) : null;
}

function sourceRowsReady(report) {
  return (
    report?.privateInputFilePresent === true &&
    report?.privateInputFileLoadedKeyCount === releaseChannelMetadataKeys.length &&
    Array.isArray(report?.processEnvInputChecklistRows) &&
    report.processEnvInputChecklistRows.length === releaseChannelMetadataKeys.length &&
    report.processEnvInputChecklistRows.every((row) => row.inputSource === "private-input-file" && row.valueRecorded === false) &&
    Array.isArray(report?.privateInputSourceRows) &&
    report.privateInputSourceRows.length === releaseChannelMetadataKeys.length &&
    report.privateInputSourceRows.every(
      (row) =>
        row.inputSource === "private-input-file" &&
        row.processEnvPresent === false &&
        row.privateInputFilePresent === true &&
        row.privateInputFileKeyPresent === true &&
        row.valueRecorded === false
    )
  );
}

function formatRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.inputSource)} | ${readyLabel(row.processEnvPresent)} | ${readyLabel(row.privateInputFilePresent)} | ${readyLabel(row.privateInputFileKeyPresent)} | ${readyLabel(row.inputShapeReady)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} Release-Channel Input File Smoke

## Summary

- Smoke ready: ${readyLabel(report.releaseChannelInputFileSmokeReady)}
- Preflight ready: ${readyLabel(report.preflightReady)}
- Apply ready: ${readyLabel(report.applyReady)}
- Strict live-check ready: ${readyLabel(report.strictLiveCheckReady)}
- Private input file present: ${readyLabel(report.privateInputFilePresent)}
- Private input file loaded keys: ${report.privateInputFileLoadedKeyCount}/${report.requiredInputKeyCount}
- Preflight input source rows ready: ${readyLabel(report.preflightInputSourceRowsReady)}
- Apply input source rows ready: ${readyLabel(report.applyInputSourceRowsReady)}
- Synthetic env modified: ${readyLabel(report.syntheticEnvModified)}
- Real local env read: ${readyLabel(report.realLocalEnvRead)}
- Real local env modified: ${readyLabel(report.realLocalEnvModified)}
- Current ready rows: ${report.currentReadyKeyCount}/${report.requiredInputKeyCount}
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Next write command: \`${report.nextWriteCommand}\`
- Strict proof command: \`${report.recommendedOperatorProofCommand}\`
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- External distribution claimed: no

## Input Source Rows

| order | key | input source | process env present | private input file present | private input file key present | input shape ready | value recorded |
|---:|---|---|---:|---:|---:|---:|---:|
${formatRows(report.inputSourceRows)}

## Boundary

This smoke writes only synthetic ignored fixtures under \`${report.syntheticRoot}\`. It proves the apply helper can read the four release-channel metadata keys from an ignored private input file when the matching process env keys are absent, then passes the strict release-channel live-check against the same synthetic target without recording URL or channel values.
`;
}

await rm(smokeRoot, { recursive: true, force: true });
await mkdir(smokeRoot, { recursive: true });
await writeFile(
  syntheticEnvPath,
  [
    "# Synthetic target fixture for release-channel private env input file smoke.",
    "GROOVEFORGE_DISTRIBUTION_CHANNEL=<distribution-channel>",
    "GROOVEFORGE_RELEASE_DOWNLOAD_URL=<release-download-url>",
    "GROOVEFORGE_RELEASE_NOTES_URL=<release-notes-url>",
    "GROOVEFORGE_SUPPORT_URL=<support-url>",
    ""
  ].join("\n"),
  "utf8"
);
await writeFile(
  syntheticInputPath,
  [
    "# Synthetic ignored private input file for release-channel metadata.",
    `GROOVEFORGE_DISTRIBUTION_CHANNEL=${syntheticValues.GROOVEFORGE_DISTRIBUTION_CHANNEL}`,
    `GROOVEFORGE_RELEASE_DOWNLOAD_URL=${syntheticValues.GROOVEFORGE_RELEASE_DOWNLOAD_URL}`,
    `GROOVEFORGE_RELEASE_NOTES_URL=${syntheticValues.GROOVEFORGE_RELEASE_NOTES_URL}`,
    `GROOVEFORGE_SUPPORT_URL=${syntheticValues.GROOVEFORGE_SUPPORT_URL}`,
    ""
  ].join("\n"),
  "utf8"
);

const beforeEnvText = await readFile(syntheticEnvPath, "utf8");
const preflight = runNodeScript(
  ["harness/scripts/run_release_channel_apply_private_env.mjs", "--preflight"],
  childEnv({
    GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT: smokeRootRelative,
    GROOVEFORGE_DISTRIBUTION_ENV_FILE: distributionEnvFileName,
    GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE: privateInputFileName
  })
);
const afterPreflightText = await readFile(syntheticEnvPath, "utf8");
const apply = runNodeScript(
  ["harness/scripts/run_release_channel_apply_private_env.mjs"],
  childEnv({
    GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT: smokeRootRelative,
    GROOVEFORGE_DISTRIBUTION_ENV_FILE: distributionEnvFileName,
    GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE: privateInputFileName
  })
);
const afterApplyText = await readFile(syntheticEnvPath, "utf8");
const strict = runNodeScript(
  ["harness/scripts/run_release_channel_live_check.mjs", "--strict"],
  childEnv({
    GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_ENV_ROOT: smokeRootRelative,
    GROOVEFORGE_DISTRIBUTION_ENV_FILE: distributionEnvFileName
  })
);
const childOutput = `${preflight.stdout ?? ""}\n${preflight.stderr ?? ""}\n${apply.stdout ?? ""}\n${apply.stderr ?? ""}\n${strict.stdout ?? ""}\n${strict.stderr ?? ""}`;

check(preflight.status === 0, "input-file preflight child should exit zero");
check(apply.status === 0, "input-file apply child should exit zero");
check(strict.status === 0, "input-file strict live-check child should exit zero");
check(afterPreflightText === beforeEnvText, "input-file preflight should not modify the synthetic env target");
check(afterApplyText !== beforeEnvText, "input-file apply should modify the synthetic env target");
check(outputContainsSyntheticValues(childOutput) === false, "input-file smoke child output should not include synthetic values");
check(!/https?:\/\//i.test(childOutput), "input-file smoke child output should not include URL values");

const preflightReport = await readJson(preflightReportJsonPath);
const applyReport = await readJson(applyReportJsonPath);
const strictReport = await readJson(strictReportJsonPath);
const afterMap = parseEnvMap(afterApplyText);
for (const [key, value] of Object.entries(syntheticValues)) {
  check(afterMap.get(key) === value, `synthetic env should receive ${key} from private input file`);
}

check(preflightReport?.releaseChannelPrivateEnvApplyPreflightReady === true, "input-file preflight report should be ready");
check(preflightReport?.releaseChannelPrivateEnvApplyReady === false, "input-file preflight report should not claim apply completion");
check(preflightReport?.localEnvModified === false, "input-file preflight report should not modify local env");
check(preflightReport?.wouldApplyKeyCount === releaseChannelMetadataKeys.length, "input-file preflight report should identify four would-apply keys");
check(sourceRowsReady(preflightReport), "input-file preflight report should show private-input-file source rows");
check(applyReport?.releaseChannelPrivateEnvApplyReady === true, "input-file apply report should be ready");
check(applyReport?.appliedKeyCount === releaseChannelMetadataKeys.length, "input-file apply report should apply four keys");
check(applyReport?.currentReadyKeyCount === releaseChannelMetadataKeys.length, "input-file apply report should produce four current-ready rows");
check(applyReport?.realLocalEnvRead === false, "input-file apply report should not read real local env");
check(applyReport?.realLocalEnvModified === false, "input-file apply report should not modify real local env");
check(sourceRowsReady(applyReport), "input-file apply report should show private-input-file source rows");
check(strictReport?.strictReady === true, "input-file strict live-check report should be strict-ready");
check(strictReport?.releaseChannelLiveCheckCurrentReadyCount === releaseChannelMetadataKeys.length, "input-file strict live-check should see four current-ready rows");
check(strictReport?.realLocalEnvRead === false, "input-file strict live-check should not read real local env");
check(strictReport?.privateValuesRecorded === false, "input-file strict live-check should not record private values");

const report = {
  appName,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  platformArch,
  command: "npm run release:channel-apply-private-env-input-file-smoke",
  markdownPath: relative(markdownPath),
  jsonPath: relative(jsonPath),
  syntheticRoot: smokeRootRelative,
  syntheticTargetPath: relative(syntheticEnvPath),
  syntheticInputPath: relative(syntheticInputPath),
  releaseChannelInputFileSmokeReady: failures.length === 0,
  preflightReady: preflightReport?.releaseChannelPrivateEnvApplyPreflightReady === true,
  applyReady: applyReport?.releaseChannelPrivateEnvApplyReady === true,
  strictLiveCheckReady: strictReport?.strictReady === true,
  privateInputFilePresent: applyReport?.privateInputFilePresent === true,
  privateInputFileLoadedKeyCount: applyReport?.privateInputFileLoadedKeyCount ?? 0,
  requiredInputKeyCount: releaseChannelMetadataKeys.length,
  preflightInputSourceRowsReady: sourceRowsReady(preflightReport),
  applyInputSourceRowsReady: sourceRowsReady(applyReport),
  inputSourceRows: applyReport?.privateInputSourceRows ?? [],
  syntheticEnvModified: afterApplyText !== beforeEnvText,
  currentReadyKeyCount: applyReport?.currentReadyKeyCount ?? 0,
  currentOperatorFirstCommand: commandNames.preflight,
  nextWriteCommand: commandNames.apply,
  strictLiveCheckCommand: commandNames.strict,
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
  releaseGateClaimedExternalDistribution: false,
  valueRecorded: false
};

const markdown = buildMarkdown(report);
const json = `${JSON.stringify(report, null, 2)}\n`;
const combined = `${markdown}\n${json}\n${childOutput}`;
check(outputContainsSyntheticValues(combined) === false, "input-file smoke artifacts should not include synthetic values");
check(!/https?:\/\//i.test(combined), "input-file smoke artifacts should not include URL values");
check(report.releaseChannelInputFileSmokeReady === true, "input-file smoke should be ready");

await mkdir(packageRoot, { recursive: true });
await writeFile(jsonPath, json, "utf8");
await writeFile(markdownPath, markdown, "utf8");

if (failures.length > 0) {
  console.error("GrooveForge release-channel private env input-file smoke failed.");
  console.error(`- Markdown: ${relative(markdownPath)}`);
  console.error(`- JSON: ${relative(jsonPath)}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GrooveForge release-channel private env input-file smoke passed.");
console.log(`- Markdown: ${relative(markdownPath)}`);
console.log(`- JSON: ${relative(jsonPath)}`);
console.log(`- Synthetic env root: ${smokeRootRelative}`);
console.log("- Private input file present: yes");
console.log("- Private input file loaded keys: 4");
console.log("- Input source rows: 4");
console.log("- Preflight ready: yes");
console.log("- Apply ready: yes");
console.log("- Strict live-check ready: yes");
console.log("- Real local env read: no");
console.log("- Real local env modified: no");
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
