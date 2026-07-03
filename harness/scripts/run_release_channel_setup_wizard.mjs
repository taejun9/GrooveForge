#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { distributionLocalEnvDefaults, distributionPrivateInputKeys } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const args = process.argv.slice(2);
const syntheticSuccessSmoke = args.includes("--success-smoke");
const privateInputFileSuccessSmoke = args.includes("--input-file-success-smoke");
const syntheticRun = syntheticSuccessSmoke || privateInputFileSuccessSmoke;
const forceOverwrite = args.includes("--force") || syntheticRun;
const reportArtifactNames = {
  markdown: "release-channel-setup-wizard.md",
  json: "release-channel-setup-wizard.json",
  successSmokeMarkdown: "release-channel-setup-wizard-success-smoke.md",
  successSmokeJson: "release-channel-setup-wizard-success-smoke.json",
  inputFileSuccessSmokeMarkdown: "release-channel-setup-wizard-input-file-success-smoke.md",
  inputFileSuccessSmokeJson: "release-channel-setup-wizard-input-file-success-smoke.json"
};
const reportStem = privateInputFileSuccessSmoke
  ? "release-channel-setup-wizard-input-file-success-smoke"
  : syntheticSuccessSmoke
  ? "release-channel-setup-wizard-success-smoke"
  : "release-channel-setup-wizard";
const markdownArtifactName = privateInputFileSuccessSmoke
  ? reportArtifactNames.inputFileSuccessSmokeMarkdown
  : syntheticSuccessSmoke
    ? reportArtifactNames.successSmokeMarkdown
    : reportArtifactNames.markdown;
const jsonArtifactName = privateInputFileSuccessSmoke
  ? reportArtifactNames.inputFileSuccessSmokeJson
  : syntheticSuccessSmoke
    ? reportArtifactNames.successSmokeJson
    : reportArtifactNames.json;
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${markdownArtifactName}`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${jsonArtifactName}`);
const setupRootOverride = process.env.GROOVEFORGE_RELEASE_CHANNEL_SETUP_ENV_ROOT?.trim() ?? "";
const syntheticRoot = path.join(packageRoot, reportStem);
const resolvedLocalEnvRoot = syntheticRun
  ? syntheticRoot
  : setupRootOverride
    ? path.resolve(root, setupRootOverride)
    : root;
const relativeLocalEnvRoot = path.relative(root, resolvedLocalEnvRoot);
const configuredEnvFileKey = "GROOVEFORGE_DISTRIBUTION_ENV_FILE";
const privateInputFileKey = "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE";
const defaultPrivateInputFileName = ".env.release-channel.local";
const configuredEnvFileName = process.env[configuredEnvFileKey]?.trim() || distributionLocalEnvDefaults.defaultEnvFileName;
const configuredPrivateInputFileName = process.env[privateInputFileKey]?.trim() || defaultPrivateInputFileName;
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const placeholderPattern = /^(|<[^>]+>|CHANGE_ME|REPLACE_ME|TODO|TBD|example|example-.+|your-.+|https:\/\/example\.com.*)$/i;
const syntheticValues = {
  GROOVEFORGE_DISTRIBUTION_CHANNEL: "private-beta",
  GROOVEFORGE_RELEASE_DOWNLOAD_URL: "https://downloads.invalid/grooveforge.dmg",
  GROOVEFORGE_RELEASE_NOTES_URL: "https://downloads.invalid/grooveforge-notes",
  GROOVEFORGE_SUPPORT_URL: "https://support.invalid/grooveforge"
};
const failures = [];

if ((setupRootOverride || syntheticRun) && (relativeLocalEnvRoot.startsWith("..") || path.isAbsolute(relativeLocalEnvRoot))) {
  console.error("GrooveForge release-channel setup wizard failed:");
  console.error("- Local env root override must stay inside the repository.");
  process.exit(1);
}

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

function localEnvCandidatePath() {
  const candidatePath = path.isAbsolute(configuredEnvFileName)
    ? configuredEnvFileName
    : path.resolve(resolvedLocalEnvRoot, configuredEnvFileName);
  const relativeCandidate = path.relative(resolvedLocalEnvRoot, candidatePath);
  if (relativeCandidate.startsWith("..") || path.isAbsolute(relativeCandidate)) {
    throw new Error("Configured distribution env file must stay inside the selected env root.");
  }
  return candidatePath;
}

function privateInputCandidatePath() {
  return path.isAbsolute(configuredPrivateInputFileName)
    ? configuredPrivateInputFileName
    : path.resolve(resolvedLocalEnvRoot, configuredPrivateInputFileName);
}

function validatePrivateInputFilePath(filePath) {
  const relativeCandidate = path.relative(resolvedLocalEnvRoot, filePath);
  if (relativeCandidate.startsWith("..") || path.isAbsolute(relativeCandidate)) {
    throw new Error("Configured private release-channel input file must stay inside the selected env root.");
  }
}

function displayLocalEnvTarget(filePath) {
  const relativePath = path.relative(root, filePath);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.basename(filePath);
}

function safeHttpsUrlShapeReady(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && Boolean(parsed.hostname) && !parsed.username && !parsed.password && !parsed.hash;
  } catch {
    return false;
  }
}

function channelShapeReady(value) {
  return /^(direct-download|private-beta|managed-release)$/.test(String(value ?? "").trim());
}

function shapeReadyForKey(key, value) {
  return key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" ? channelShapeReady(value) : safeHttpsUrlShapeReady(value);
}

function isPlaceholderValue(value) {
  return placeholderPattern.test(String(value ?? "").trim());
}

function expectedShapeForKey(key) {
  return key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" ? "allowed release channel token" : "safe absolute HTTPS URL";
}

function buildInputRows({ inputValues, inputSources, privateInputFile }) {
  return releaseChannelMetadataKeys.map((key, index) => {
    const value = inputValues.get(key) ?? "";
    const inputPresent = value.trim().length > 0;
    const inputShapeReady = inputPresent && shapeReadyForKey(key, value);
    const inputSource = inputSources.get(key) ?? "missing";
    return {
      order: index + 1,
      key,
      inputSource,
      processEnvPresent: inputSource === "process-env",
      privateInputFilePresent: privateInputFile.present,
      privateInputFileKeyPresent: inputSource === "private-input-file",
      interactiveInputPresent: inputSource === "interactive",
      inputPresent,
      inputShapeReady,
      expectedShape: expectedShapeForKey(key),
      valueRecorded: false
    };
  });
}

async function promptForMissingInputs({ inputValues, inputSources }) {
  const values = new Map(inputValues);
  const sources = new Map(inputSources);
  const missingKeys = releaseChannelMetadataKeys.filter((key) => !values.get(key));
  if (missingKeys.length === 0) {
    return { inputValues: values, inputSources: sources };
  }
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return { inputValues: values, inputSources: sources };
  }

  const reader = createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (const key of missingKeys) {
      const answer = await reader.question(`${key} (${expectedShapeForKey(key)}): `);
      values.set(key, answer.trim());
      sources.set(key, answer.trim() ? "interactive" : "missing");
    }
  } finally {
    reader.close();
  }
  return { inputValues: values, inputSources: sources };
}

async function collectInputValues(privateInputFile) {
  if (syntheticSuccessSmoke) {
    return {
      inputValues: new Map(Object.entries(syntheticValues)),
      inputSources: new Map(releaseChannelMetadataKeys.map((key) => [key, "synthetic-success-smoke"]))
    };
  }
  const inputValues = new Map();
  const inputSources = new Map();
  for (const key of releaseChannelMetadataKeys) {
    const processEnvValue = privateInputFileSuccessSmoke ? "" : process.env[key]?.trim() ?? "";
    const privateInputFileValue = privateInputFile.inputValues.get(key)?.trim() ?? "";
    if (processEnvValue) {
      inputValues.set(key, processEnvValue);
      inputSources.set(key, "process-env");
    } else if (privateInputFileValue) {
      inputValues.set(key, privateInputFileValue);
      inputSources.set(key, "private-input-file");
    } else {
      inputValues.set(key, "");
      inputSources.set(key, "missing");
    }
  }
  return promptForMissingInputs({ inputValues, inputSources });
}

function childEnvForApply({ inputValues, inputRows, privateInputFile }) {
  const childEnv = {
    ...process.env,
    GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT: relativeLocalEnvRoot,
    [configuredEnvFileKey]: configuredEnvFileName
  };
  for (const key of releaseChannelMetadataKeys) {
    delete childEnv[key];
  }
  for (const row of inputRows) {
    if (["process-env", "interactive", "synthetic-success-smoke"].includes(row.inputSource)) {
      childEnv[row.key] = inputValues.get(row.key) ?? "";
    }
  }
  if (privateInputFile.present || inputRows.some((row) => row.inputSource === "private-input-file")) {
    childEnv[privateInputFileKey] = configuredPrivateInputFileName;
  } else {
    delete childEnv[privateInputFileKey];
  }
  return childEnv;
}

function childEnvForLiveCheck() {
  const childEnv = { ...process.env };
  for (const key of distributionPrivateInputKeys) {
    delete childEnv[key];
  }
  childEnv.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_ENV_ROOT = relativeLocalEnvRoot;
  childEnv[configuredEnvFileKey] = configuredEnvFileName;
  if (syntheticRun) {
    childEnv.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_REPORT_STEM = "release-channel-live-check-strict-success-smoke";
  }
  return childEnv;
}

function runNodeScript(scriptPath, scriptArgs, env) {
  return spawnSync(process.execPath, [scriptPath, ...scriptArgs], {
    cwd: root,
    env,
    encoding: "utf8"
  });
}

function outputContainsValues(output, values) {
  return values.some((value) => value && output.includes(value));
}

async function ensureSyntheticEnv(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    [
      "# Synthetic success-smoke fixture for release-channel setup wizard.",
      "GROOVEFORGE_DISTRIBUTION_CHANNEL=<distribution-channel>",
      "GROOVEFORGE_RELEASE_DOWNLOAD_URL=https://example.com/download",
      "GROOVEFORGE_RELEASE_NOTES_URL=https://example.com/notes",
      "GROOVEFORGE_SUPPORT_URL=https://example.com/support",
      ""
    ].join("\n"),
    "utf8"
  );
}

async function ensureSyntheticPrivateInputFile(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    [
      "# Synthetic ignored private input file for release-channel setup wizard.",
      `GROOVEFORGE_DISTRIBUTION_CHANNEL=${syntheticValues.GROOVEFORGE_DISTRIBUTION_CHANNEL}`,
      `GROOVEFORGE_RELEASE_DOWNLOAD_URL=${syntheticValues.GROOVEFORGE_RELEASE_DOWNLOAD_URL}`,
      `GROOVEFORGE_RELEASE_NOTES_URL=${syntheticValues.GROOVEFORGE_RELEASE_NOTES_URL}`,
      `GROOVEFORGE_SUPPORT_URL=${syntheticValues.GROOVEFORGE_SUPPORT_URL}`,
      ""
    ].join("\n"),
    "utf8"
  );
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  const withoutExport = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
  const separatorIndex = withoutExport.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }
  const key = withoutExport.slice(0, separatorIndex).trim();
  if (!/^[A-Z0-9_]+$/.test(key)) {
    return null;
  }
  let value = withoutExport.slice(separatorIndex + 1).trim();
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return {
    key,
    value
  };
}

async function readPrivateInputFile(filePath) {
  validatePrivateInputFilePath(filePath);
  const displayPath = displayLocalEnvTarget(filePath);
  const result = {
    configuredFileKey: privateInputFileKey,
    defaultFileName: defaultPrivateInputFileName,
    filePath: displayPath,
    present: existsSync(filePath),
    entries: [],
    inputValues: new Map(),
    loadedKeys: [],
    unknownKeys: [],
    malformedLines: [],
    valueRecorded: false
  };

  if (!result.present) {
    return result;
  }

  const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    const parsed = parseEnvLine(line);
    if (!parsed) {
      if (line.trim() && !line.trim().startsWith("#")) {
        result.malformedLines.push(`${displayPath}:${index + 1}`);
      }
      continue;
    }
    if (!releaseChannelMetadataKeys.includes(parsed.key)) {
      result.unknownKeys.push(parsed.key);
      continue;
    }
    result.entries.push({
      key: parsed.key,
      value: parsed.value.trim(),
      file: displayPath,
      line: index + 1,
      valueRecorded: false
    });
    result.inputValues.set(parsed.key, parsed.value.trim());
    result.loadedKeys.push(parsed.key);
  }

  result.loadedKeys = [...new Set(result.loadedKeys)];
  result.unknownKeys = [...new Set(result.unknownKeys)];
  return result;
}

function privateInputFileRemediation({ privateInputFilePresent, privateInputFileKeyPresent, privateInputFilePlaceholder, privateInputFileShapeReady }) {
  if (privateInputFilePresent !== true) {
    return "create-private-input-file";
  }
  if (privateInputFileKeyPresent !== true) {
    return "add-private-input-file-row";
  }
  if (privateInputFilePlaceholder === true) {
    return "replace-private-input-file-placeholder";
  }
  if (privateInputFileShapeReady !== true) {
    return "fix-private-input-file-shape";
  }
  return "ready";
}

function buildPrivateInputFileLocationRows(inputRows, privateInputFile) {
  const entryByKey = new Map(privateInputFile.entries.map((entry) => [entry.key, entry]));
  return inputRows.map((row) => {
    const entry = entryByKey.get(row.key) ?? null;
    const privateInputFileKeyPresent = Boolean(entry?.value?.trim());
    const privateInputFilePlaceholder = privateInputFileKeyPresent && isPlaceholderValue(entry.value);
    const privateInputFileShapeReady =
      privateInputFileKeyPresent && privateInputFilePlaceholder === false && shapeReadyForKey(row.key, entry.value);
    return {
      order: row.order,
      key: row.key,
      privateInputFilePath: privateInputFile.filePath,
      privateInputFilePresent: privateInputFile.present,
      privateInputFileKeyPresent,
      privateInputFileLine: entry?.line ?? null,
      processEnvPresent: row.processEnvPresent,
      inputSource: row.inputSource,
      inputPresent: row.inputPresent,
      inputShapeReady: row.inputShapeReady,
      privateInputFilePlaceholder,
      privateInputFileShapeReady,
      expectedShape: row.expectedShape,
      remediation: privateInputFileRemediation({
        privateInputFilePresent: privateInputFile.present,
        privateInputFileKeyPresent,
        privateInputFilePlaceholder,
        privateInputFileShapeReady
      }),
      valueRecorded: false
    };
  });
}

async function readSyntheticEnvRows(filePath) {
  if (!syntheticRun || !existsSync(filePath)) {
    return [];
  }
  const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);
  const entries = new Map(lines.map(parseEnvLine).filter(Boolean).map((entry) => [entry.key, entry.value]));
  return releaseChannelMetadataKeys.map((key, index) => ({
    order: index + 1,
    key,
    syntheticFixtureUpdated: entries.get(key) === syntheticValues[key],
    valueRecorded: false
  }));
}

async function ensureRealLocalEnv(filePath) {
  if (syntheticRun || existsSync(filePath)) {
    return { prepareEnvRun: false, prepareEnvExitCode: null };
  }
  const result = runNodeScript("harness/scripts/run_release_prepare_env.mjs", ["--write-local"], process.env);
  return {
    prepareEnvRun: true,
    prepareEnvExitCode: result.status,
    prepareEnvOutput: `${result.stdout ?? ""}\n${result.stderr ?? ""}`
  };
}

function formatInputRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.inputSource)} | ${readyLabel(row.processEnvPresent)} | ${readyLabel(row.privateInputFilePresent)} | ${readyLabel(row.privateInputFileKeyPresent)} | ${readyLabel(row.interactiveInputPresent)} | ${readyLabel(row.inputPresent)} | ${readyLabel(row.inputShapeReady)} | ${escapeCell(row.expectedShape)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatPrivateInputFileLocationRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.privateInputFilePath)} | ${escapeCell(row.privateInputFileLine ?? "add")} | ${readyLabel(row.privateInputFilePresent)} | ${readyLabel(row.privateInputFileKeyPresent)} | ${readyLabel(row.privateInputFilePlaceholder)} | ${readyLabel(row.privateInputFileShapeReady)} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.remediation)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatSyntheticRows(rows) {
  return rows.length > 0
    ? rows
        .map((row) => `| ${row.order} | ${escapeCell(row.key)} | ${readyLabel(row.syntheticFixtureUpdated)} | ${readyLabel(row.valueRecorded)} |`)
        .join("\n")
    : "| 1 | none | no | no |";
}

function buildMarkdown(report) {
  return `# ${appName} Release-Channel Setup Wizard

## Summary

- Setup wizard ready: ${readyLabel(report.releaseChannelSetupWizardReady)}
- Synthetic success smoke: ${readyLabel(report.syntheticSuccessSmoke)}
- Private input-file success smoke: ${readyLabel(report.privateInputFileSuccessSmoke)}
- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}
- Local env prepared by wizard: ${readyLabel(report.prepareEnvRun)}
- Real local env read: ${readyLabel(report.realLocalEnvRead)}
- Real local env modified: ${readyLabel(report.realLocalEnvModified)}
- Private input file key: \`${report.privateInputFileKey}\`
- Private input file default: \`${report.privateInputFileDefaultName}\`
- Private input file path: ${report.privateInputFilePath}
- Private input file present: ${readyLabel(report.privateInputFilePresent)}
- Private input file loaded keys: ${report.privateInputFileLoadedKeyCount} (${report.privateInputFileLoadedKeySummary})
- Private input file location rows: ${report.privateInputFileLocationRowCount}
- Private input file placeholder locations: ${report.privateInputFileLocationPlaceholderCount}
- Private input file invalid-shape locations: ${report.privateInputFileLocationInvalidShapeCount}
- Private input file missing key rows: ${report.privateInputFileLocationMissingKeyCount}
- Private input source rows: ${report.privateInputSourceRowCount}
- Preflight command exit code: ${report.preflightExitCode}
- Apply command exit code: ${report.applyExitCode}
- Strict live-check exit code: ${report.strictLiveCheckExitCode}
- Preflight ready: ${readyLabel(report.preflightReady)}
- Apply ready: ${readyLabel(report.applyReady)}
- Strict live-check ready: ${readyLabel(report.strictLiveCheckReady)}
- Current ready rows: ${report.currentReadyKeyCount}/${report.currentRequiredKeyCount}
- Current env edit target: ${report.currentEnvEditTarget}
- First proof command: \`${report.firstProofCommand}\`
- Recommended proof chain: \`${report.recommendedOperatorProofCommand}\`
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- External distribution claimed: no

## Wizard Input Rows

| order | key | source | process env present | private input file present | private input file key present | interactive present | input present | shape ready | expected shape | value recorded |
|---:|---|---|---:|---:|---:|---:|---:|---:|---|---:|
${formatInputRows(report.wizardInputRows)}

## Private Input File Location Rows

| order | key | private input file | line | file present | key present | file placeholder | file shape ready | expected shape | remediation | value recorded |
|---:|---|---|---:|---:|---:|---:|---:|---|---|---:|
${formatPrivateInputFileLocationRows(report.privateInputFileLocationRows)}

## Synthetic Fixture Rows

| order | key | fixture updated | value recorded |
|---:|---|---:|---:|
${formatSyntheticRows(report.syntheticFixtureRows)}

## Command Chain

1. \`${report.prepareEnvCommand}\` when the ignored local env is missing.
2. \`${report.preflightCommand}\` to prove process-env or ignored private input-file metadata is shape-ready before writing.
3. \`${report.applyCommand}\` to write shape-ready private metadata into the ignored local env after preflight passes.
4. \`${report.firstProofCommand}\` to prove the four release-channel rows are strict-ready.
5. \`${report.recommendedOperatorProofCommand}\` for the full value-free proof chain after setup succeeds.

## Not Recorded

This report records key names, readiness booleans, row counts, file names, command names, and exit codes only. It does not record release URLs, support URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, private beats, or real user audio.

## Not Claimed

This command does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function writeReport(report, privateValueCandidates) {
  const markdown = buildMarkdown(report);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const combined = `${markdown}\n${json}`;
  for (const value of privateValueCandidates) {
    check(!combined.includes(value), "release-channel setup wizard report should not include private values");
  }
  check(!/https?:\/\//i.test(combined), "release-channel setup wizard report should not include URL values");
  await mkdir(packageRoot, { recursive: true });
  await writeFile(markdownPath, markdown, "utf8");
  await writeFile(jsonPath, json, "utf8");
}

async function main() {
  const localEnvPath = localEnvCandidatePath();
  const privateInputFilePath = privateInputCandidatePath();
  if (syntheticRun) {
    await ensureSyntheticEnv(localEnvPath);
  }
  if (privateInputFileSuccessSmoke) {
    await ensureSyntheticPrivateInputFile(privateInputFilePath);
  }

  const privateInputFile = await readPrivateInputFile(privateInputFilePath);
  const { inputValues, inputSources } = await collectInputValues(privateInputFile);
  const inputRows = buildInputRows({ inputValues, inputSources, privateInputFile });
  const privateInputFileLocationRows = buildPrivateInputFileLocationRows(inputRows, privateInputFile);
  const inputReady = inputRows.every((row) => row.inputPresent === true && row.inputShapeReady === true);
  const privateValueCandidates = [...inputValues.values()].filter((value) => value.trim().length >= 8);
  const prepareResult = inputReady ? await ensureRealLocalEnv(localEnvPath) : { prepareEnvRun: false, prepareEnvExitCode: null };
  const localEnvFileLoaded = existsSync(localEnvPath);
  const preflightArgs = ["--preflight"];
  if (forceOverwrite) {
    preflightArgs.push("--force");
  }
  const applyChildEnv = childEnvForApply({ inputValues, inputRows, privateInputFile });
  const preflightResult = inputReady && localEnvFileLoaded
    ? runNodeScript("harness/scripts/run_release_channel_apply_private_env.mjs", preflightArgs, applyChildEnv)
    : { status: 1, stdout: "", stderr: "" };
  const applyArgs = syntheticRun ? ["--success-smoke"] : [];
  if (forceOverwrite) {
    applyArgs.push("--force");
  }
  const applyResult = preflightResult.status === 0
    ? runNodeScript("harness/scripts/run_release_channel_apply_private_env.mjs", applyArgs, applyChildEnv)
    : { status: 1, stdout: "", stderr: "" };
  const strictResult = applyResult.status === 0
    ? runNodeScript("harness/scripts/run_release_channel_live_check.mjs", ["--strict"], childEnvForLiveCheck())
    : { status: 1, stdout: "", stderr: "" };
  const preflightOutput = `${preflightResult.stdout ?? ""}\n${preflightResult.stderr ?? ""}`;
  const applyOutput = `${applyResult.stdout ?? ""}\n${applyResult.stderr ?? ""}`;
  const strictOutput = `${strictResult.stdout ?? ""}\n${strictResult.stderr ?? ""}`;
  const childOutput = `${prepareResult.prepareEnvOutput ?? ""}\n${preflightOutput}\n${applyOutput}\n${strictOutput}`;
  const preflightReportStem = "release-channel-apply-private-env-preflight";
  const applyReportStem = syntheticRun
    ? "release-channel-apply-private-env-success-smoke"
    : "release-channel-apply-private-env";
  const liveCheckReportStem = syntheticRun
    ? "release-channel-live-check-strict-success-smoke"
    : "release-channel-live-check-strict";
  const preflightJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${preflightReportStem}.json`);
  const applyJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${applyReportStem}.json`);
  const liveCheckJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${liveCheckReportStem}.json`);
  const preflightReport = existsSync(preflightJsonPath) ? JSON.parse(await readFile(preflightJsonPath, "utf8")) : null;
  const applyReport = existsSync(applyJsonPath) ? JSON.parse(await readFile(applyJsonPath, "utf8")) : null;
  const liveCheckReport = existsSync(liveCheckJsonPath) ? JSON.parse(await readFile(liveCheckJsonPath, "utf8")) : null;
  const syntheticFixtureRows = await readSyntheticEnvRows(localEnvPath);
  const currentReadyKeyCount = Number.isInteger(liveCheckReport?.releaseChannelLiveCheckCurrentReadyCount)
    ? liveCheckReport.releaseChannelLiveCheckCurrentReadyCount
    : 0;
  const report = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: syntheticSuccessSmoke
      ? "npm run release:channel-setup-wizard-success-smoke"
      : privateInputFileSuccessSmoke
        ? "npm run release:channel-setup-wizard-input-file-success-smoke"
      : "npm run release:channel-setup-wizard",
    releaseChannelSetupWizardMarkdownPath: relative(markdownPath),
    releaseChannelSetupWizardJsonPath: relative(jsonPath),
    syntheticSuccessSmoke: syntheticRun,
    privateInputFileSuccessSmoke,
    localEnvRootOverrideEnabled: Boolean(setupRootOverride) || syntheticRun,
    localEnvRootRelativePath: relativeLocalEnvRoot,
    currentEnvEditTarget: displayLocalEnvTarget(localEnvPath),
    currentRequiredKeyCount: releaseChannelMetadataKeys.length,
    currentRequiredKeys: releaseChannelMetadataKeys,
    privateInputFileKey,
    privateInputFileDefaultName: defaultPrivateInputFileName,
    privateInputFilePath: privateInputFile.filePath,
    privateInputFilePresent: privateInputFile.present,
    privateInputFileConfigured: Boolean(process.env[privateInputFileKey]?.trim()),
    privateInputFileLoadedKeys: privateInputFile.loadedKeys,
    privateInputFileLoadedKeyCount: privateInputFile.loadedKeys.length,
    privateInputFileLoadedKeySummary: privateInputFile.loadedKeys.length > 0 ? privateInputFile.loadedKeys.join(", ") : "none",
    privateInputFileUnknownKeys: privateInputFile.unknownKeys,
    privateInputFileUnknownKeyCount: privateInputFile.unknownKeys.length,
    privateInputFileMalformedLines: privateInputFile.malformedLines,
    privateInputFileMalformedLineCount: privateInputFile.malformedLines.length,
    privateInputFileValueRecorded: false,
    privateInputFileLocationRows,
    privateInputFileLocationRowCount: privateInputFileLocationRows.length,
    privateInputFileLocationPresentRowCount: privateInputFileLocationRows.filter((row) => row.privateInputFileKeyPresent === true).length,
    privateInputFileLocationMissingKeyCount: privateInputFileLocationRows.filter((row) => row.privateInputFileKeyPresent !== true).length,
    privateInputFileLocationPlaceholderCount: privateInputFileLocationRows.filter((row) => row.privateInputFilePlaceholder === true).length,
    privateInputFileLocationInvalidShapeCount: privateInputFileLocationRows.filter(
      (row) => row.privateInputFileKeyPresent === true && row.privateInputFilePlaceholder === false && row.privateInputFileShapeReady !== true
    ).length,
    privateInputFilePlaceholderLocations: privateInputFileLocationRows
      .filter((row) => row.privateInputFilePlaceholder === true)
      .map((row) => `${row.privateInputFilePath}:${row.privateInputFileLine ?? "add"} ${row.key}`),
    privateInputFileShapeInvalidLocations: privateInputFileLocationRows
      .filter((row) => row.privateInputFileKeyPresent === true && row.privateInputFilePlaceholder === false && row.privateInputFileShapeReady !== true)
      .map((row) => `${row.privateInputFilePath}:${row.privateInputFileLine ?? "add"} ${row.key}`),
    wizardInputRows: inputRows,
    wizardInputRowCount: inputRows.length,
    privateInputSourceRows: inputRows,
    privateInputSourceRowCount: inputRows.length,
    privateInputSourceReadyCount: inputRows.filter((row) => row.inputShapeReady === true).length,
    privateInputSourceProcessEnvCount: inputRows.filter((row) => row.inputSource === "process-env").length,
    privateInputSourceFileCount: inputRows.filter((row) => row.inputSource === "private-input-file").length,
    privateInputSourceInteractiveCount: inputRows.filter((row) => row.inputSource === "interactive").length,
    inputReady,
    localEnvFileLoaded,
    prepareEnvRun: prepareResult.prepareEnvRun,
    prepareEnvExitCode: prepareResult.prepareEnvExitCode,
    prepareEnvCommand: "npm run release:prepare-env",
    preflightCommand: "npm run release:channel-apply-private-env-preflight",
    preflightExitCode: preflightResult.status,
    preflightReportReady: preflightReport?.releaseChannelPrivateEnvApplyPreflightReady === true,
    preflightReady: preflightResult.status === 0 && preflightReport?.releaseChannelPrivateEnvApplyPreflightReady === true,
    preflightReportPath: preflightReport ? relative(preflightJsonPath) : "none",
    applyCommand: "npm run release:channel-apply-private-env",
    applyExitCode: applyResult.status,
    applyReportReady: applyReport?.releaseChannelPrivateEnvApplyReady === true,
    applyReady: applyResult.status === 0 && applyReport?.releaseChannelPrivateEnvApplyReady === true,
    applyReportPath: applyReport ? relative(applyJsonPath) : "none",
    realLocalEnvRead: resolvedLocalEnvRoot === root && localEnvFileLoaded === true,
    realLocalEnvModified: applyReport?.realLocalEnvModified === true,
    strictLiveCheckCommand: "npm run release:channel-live-check-strict",
    strictLiveCheckExitCode: strictResult.status,
    strictLiveCheckReady: strictResult.status === 0 && liveCheckReport?.strictReady === true,
    strictLiveCheckReportPath: liveCheckReport ? relative(liveCheckJsonPath) : "none",
    currentReadyKeyCount,
    currentPlaceholderKeyCount: Number.isInteger(liveCheckReport?.currentPlaceholderKeyCount)
      ? liveCheckReport.currentPlaceholderKeyCount
      : releaseChannelMetadataKeys.length,
    firstProofCommand: "npm run release:channel-live-check-strict",
    recommendedOperatorProofCommand: "npm run release:private-edit-strict-proof",
    currentBlockerCommand: "npm run release:current-blocker",
    hardGateCommand: "npm run release:external-check",
    syntheticFixtureRows,
    syntheticFixtureRowCount: syntheticFixtureRows.length,
    releaseChannelSetupWizardReady:
      inputReady === true &&
      localEnvFileLoaded === true &&
      preflightResult.status === 0 &&
      applyResult.status === 0 &&
      strictResult.status === 0 &&
      preflightReport?.releaseChannelPrivateEnvApplyPreflightReady === true &&
      applyReport?.releaseChannelPrivateEnvApplyReady === true &&
      liveCheckReport?.strictReady === true &&
      currentReadyKeyCount === releaseChannelMetadataKeys.length,
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
    valueRecorded: false
  };

  check(report.wizardInputRowCount === 4, "release-channel setup wizard should inspect four input rows");
  check(report.wizardInputRows.every((row) => row.valueRecorded === false), "release-channel setup wizard input rows should be value-free");
  check(report.privateInputFileKey === privateInputFileKey, "release-channel setup wizard should expose the private input file key");
  check(report.privateInputFileDefaultName === defaultPrivateInputFileName, "release-channel setup wizard should expose the default private input file name");
  check(report.privateInputFileValueRecorded === false, "release-channel setup wizard should not record private input file values");
  check(report.privateInputFileLocationRowCount === 4, "release-channel setup wizard should create four private input file location rows");
  check(report.privateInputFileLocationRows.every((row) => row.valueRecorded === false), "release-channel setup wizard private input file location rows should be value-free");
  check(
    report.privateInputFileLocationRows.every((row) => row.privateInputFilePath === report.privateInputFilePath),
    "release-channel setup wizard location rows should identify the private input file path"
  );
  check(
    report.privateInputFileLocationRows.every((row) => typeof row.expectedShape === "string" && row.expectedShape.length > 0),
    "release-channel setup wizard location rows should expose expected input shapes"
  );
  check(report.privateInputSourceRowCount === 4, "release-channel setup wizard should expose four private input source rows");
  check(report.privateInputSourceRows.every((row) => row.valueRecorded === false), "release-channel setup wizard source rows should be value-free");
  check(report.privateValuesRecorded === false, "release-channel setup wizard should not record private values");
  check(report.localEnvValueRecorded === false, "release-channel setup wizard should not record local env values");
  check(report.releaseUrlValueRecorded === false, "release-channel setup wizard should not record release URL values");
  check(report.supportUrlValueRecorded === false, "release-channel setup wizard should not record support URL values");
  check(report.channelValueRecorded === false, "release-channel setup wizard should not record channel values");
  check(report.networkProbeAttempted === false, "release-channel setup wizard should not probe networks");
  check(report.releaseUploadAttempted === false, "release-channel setup wizard should not upload releases");
  check(report.notarySubmissionAttempted === false, "release-channel setup wizard should not submit to Apple");
  check(report.signingAttempted === false, "release-channel setup wizard should not sign artifacts");
  check(report.releaseGateClaimedExternalDistribution === false, "release-channel setup wizard should not claim external distribution");
  check(!syntheticRun || report.realLocalEnvRead === false, "release-channel setup wizard synthetic smoke should not read real local env");
  check(!syntheticRun || report.realLocalEnvModified === false, "release-channel setup wizard synthetic smoke should not modify real local env");
  check(report.preflightCommand === "npm run release:channel-apply-private-env-preflight", "release-channel setup wizard should call the private env preflight helper");
  check(report.applyCommand === "npm run release:channel-apply-private-env", "release-channel setup wizard should call the private env apply helper");
  check(report.firstProofCommand === "npm run release:channel-live-check-strict", "release-channel setup wizard should run strict live check first");
  check(report.recommendedOperatorProofCommand === "npm run release:private-edit-strict-proof", "release-channel setup wizard should expose the full proof chain");
  check(!outputContainsValues(childOutput, privateValueCandidates), "release-channel setup wizard child output should not include private values");
  check(!/https?:\/\//i.test(childOutput), "release-channel setup wizard child output should not include URL values");
  if (syntheticRun) {
    check(report.releaseChannelSetupWizardReady === true, "release-channel setup wizard synthetic smoke should be ready");
    check(report.preflightReady === true, "release-channel setup wizard synthetic smoke should prove preflight readiness");
    check(report.applyReady === true, "release-channel setup wizard synthetic smoke should prove apply readiness");
    check(report.strictLiveCheckReady === true, "release-channel setup wizard synthetic smoke should prove strict live-check readiness");
    check(report.currentReadyKeyCount === 4, "release-channel setup wizard synthetic smoke should produce four ready rows");
    check(report.currentPlaceholderKeyCount === 0, "release-channel setup wizard synthetic smoke should clear placeholders");
    check(report.syntheticFixtureRows.every((row) => row.syntheticFixtureUpdated === true), "release-channel setup wizard synthetic smoke should update synthetic fixture rows");
  }
  if (privateInputFileSuccessSmoke) {
    check(report.privateInputFilePresent === true, "release-channel setup wizard input-file smoke should load a private input file");
    check(report.privateInputFileLoadedKeyCount === 4, "release-channel setup wizard input-file smoke should load four private input keys");
    check(report.privateInputFileLocationRowCount === 4, "release-channel setup wizard input-file smoke should expose four private input file location rows");
    check(report.privateInputFileLocationPresentRowCount === 4, "release-channel setup wizard input-file smoke should expose four present private input file location rows");
    check(report.privateInputFileLocationPlaceholderCount === 0, "release-channel setup wizard input-file smoke should have no private input file placeholder rows");
    check(report.privateInputFileLocationInvalidShapeCount === 0, "release-channel setup wizard input-file smoke should have no private input file invalid-shape rows");
    check(report.privateInputSourceFileCount === 4, "release-channel setup wizard input-file smoke should use four private input-file rows");
    check(report.privateInputSourceProcessEnvCount === 0, "release-channel setup wizard input-file smoke should not use process env rows");
    check(report.privateInputSourceInteractiveCount === 0, "release-channel setup wizard input-file smoke should not use interactive rows");
    check(report.wizardInputRows.every((row) => row.inputSource === "private-input-file"), "release-channel setup wizard input-file smoke rows should come from the private input file");
    check(preflightReport?.privateInputSourceFileCount === 4, "release-channel setup wizard input-file smoke preflight should use four private input-file rows");
    check(applyReport?.privateInputSourceFileCount === 4, "release-channel setup wizard input-file smoke apply should use four private input-file rows");
  }

  await writeReport(report, privateValueCandidates);

  if (failures.length > 0 || report.releaseChannelSetupWizardReady !== true) {
    console.error("GrooveForge release-channel setup wizard failed.");
    console.error(`- Markdown: ${relative(markdownPath)}`);
    console.error(`- JSON: ${relative(jsonPath)}`);
    console.error(`- Synthetic success smoke: ${readyLabel(report.syntheticSuccessSmoke)}`);
    console.error(`- Private input-file success smoke: ${readyLabel(report.privateInputFileSuccessSmoke)}`);
    console.error(`- Input ready: ${readyLabel(report.inputReady)}`);
    console.error(`- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}`);
    console.error(`- Private input file present: ${readyLabel(report.privateInputFilePresent)}`);
    console.error(`- Private input file loaded keys: ${report.privateInputFileLoadedKeyCount}`);
    console.error(`- Private input file location rows: ${report.privateInputFileLocationRowCount}`);
    console.error(`- Private input file placeholder locations: ${report.privateInputFileLocationPlaceholderCount}`);
    console.error(`- Private input file invalid-shape locations: ${report.privateInputFileLocationInvalidShapeCount}`);
    console.error(`- Real local env read: ${readyLabel(report.realLocalEnvRead)}`);
    console.error(`- Real local env modified: ${readyLabel(report.realLocalEnvModified)}`);
    console.error(`- Preflight ready: ${readyLabel(report.preflightReady)}`);
    console.error(`- Apply ready: ${readyLabel(report.applyReady)}`);
    console.error(`- Strict live-check ready: ${readyLabel(report.strictLiveCheckReady)}`);
    console.error(`- Current ready rows: ${report.currentReadyKeyCount}/${report.currentRequiredKeyCount}`);
    console.error(`- Current env edit target: ${report.currentEnvEditTarget}`);
    console.error(`- Next proof after setup: ${report.recommendedOperatorProofCommand}`);
    console.error("- Private values recorded: no");
    console.error("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
    console.error("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("GrooveForge release-channel setup wizard passed.");
  console.log(`- Markdown: ${relative(markdownPath)}`);
  console.log(`- JSON: ${relative(jsonPath)}`);
  console.log(`- Synthetic success smoke: ${readyLabel(report.syntheticSuccessSmoke)}`);
  console.log(`- Private input-file success smoke: ${readyLabel(report.privateInputFileSuccessSmoke)}`);
  console.log(`- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}`);
  console.log(`- Local env prepared by wizard: ${readyLabel(report.prepareEnvRun)}`);
  console.log(`- Private input file present: ${readyLabel(report.privateInputFilePresent)}`);
  console.log(`- Private input file loaded keys: ${report.privateInputFileLoadedKeyCount}`);
  console.log(`- Private input file location rows: ${report.privateInputFileLocationRowCount}`);
  console.log(`- Private input file placeholder locations: ${report.privateInputFileLocationPlaceholderCount}`);
  console.log(`- Private input file invalid-shape locations: ${report.privateInputFileLocationInvalidShapeCount}`);
  console.log(`- Private input source rows: ${report.privateInputSourceRowCount}`);
  console.log(`- Real local env read: ${readyLabel(report.realLocalEnvRead)}`);
  console.log(`- Real local env modified: ${readyLabel(report.realLocalEnvModified)}`);
  console.log(`- Preflight ready: ${readyLabel(report.preflightReady)}`);
  console.log(`- Apply ready: ${readyLabel(report.applyReady)}`);
  console.log(`- Strict live-check ready: ${readyLabel(report.strictLiveCheckReady)}`);
  console.log(`- Current ready rows: ${report.currentReadyKeyCount}/${report.currentRequiredKeyCount}`);
  console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
  console.log(`- Next proof after setup: ${report.recommendedOperatorProofCommand}`);
  console.log("- Private values recorded: no");
  console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
  console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
}

await main();
