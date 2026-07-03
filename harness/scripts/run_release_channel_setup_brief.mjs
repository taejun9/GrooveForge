#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionLocalEnvDefaults } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const args = process.argv.slice(2);
const syntheticSmoke = args.includes("--smoke");
const reportStem = syntheticSmoke ? "release-channel-setup-brief-smoke" : "release-channel-setup-brief";
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const envRootOverride = process.env.GROOVEFORGE_RELEASE_CHANNEL_SETUP_BRIEF_ENV_ROOT?.trim() ?? "";
const syntheticRoot = path.join(packageRoot, reportStem);
const resolvedLocalEnvRoot = syntheticSmoke ? syntheticRoot : envRootOverride ? path.resolve(root, envRootOverride) : root;
const relativeLocalEnvRoot = path.relative(root, resolvedLocalEnvRoot);
const distributionEnvFileKey = "GROOVEFORGE_DISTRIBUTION_ENV_FILE";
const privateInputFileKey = "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE";
const defaultPrivateInputFileName = ".env.release-channel.local";
const configuredEnvFileName = process.env[distributionEnvFileKey]?.trim() || distributionLocalEnvDefaults.defaultEnvFileName;
const configuredPrivateInputFileName = process.env[privateInputFileKey]?.trim() || defaultPrivateInputFileName;
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const placeholderValues = new Map([
  ["GROOVEFORGE_DISTRIBUTION_CHANNEL", "<direct-download|private-beta|managed-release>"],
  ["GROOVEFORGE_RELEASE_DOWNLOAD_URL", "<release-download-https-url>"],
  ["GROOVEFORGE_RELEASE_NOTES_URL", "<release-notes-https-url>"],
  ["GROOVEFORGE_SUPPORT_URL", "<support-https-url>"]
]);
const expectedShapes = new Map([
  ["GROOVEFORGE_DISTRIBUTION_CHANNEL", "allowed release channel token"],
  ["GROOVEFORGE_RELEASE_DOWNLOAD_URL", "safe absolute HTTPS URL"],
  ["GROOVEFORGE_RELEASE_NOTES_URL", "safe absolute HTTPS URL"],
  ["GROOVEFORGE_SUPPORT_URL", "safe absolute HTTPS URL"]
]);
const placeholderPattern = /^(|<[^>]+>|CHANGE_ME|REPLACE_ME|TODO|TBD|example|example-.+|your-.+|https:\/\/example\.com.*)$/i;
const failures = [];

if ((syntheticSmoke || envRootOverride) && (relativeLocalEnvRoot.startsWith("..") || path.isAbsolute(relativeLocalEnvRoot))) {
  console.error("GrooveForge release-channel setup brief failed:");
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

function summarizeKeys(keys) {
  return keys.length > 0 ? keys.join(", ") : "none";
}

function displayLocalEnvTarget(filePath) {
  const relativePath = path.relative(root, filePath);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.basename(filePath);
}

function localEnvCandidatePath() {
  return path.isAbsolute(configuredEnvFileName)
    ? configuredEnvFileName
    : path.resolve(resolvedLocalEnvRoot, configuredEnvFileName);
}

function privateInputCandidatePath() {
  return path.isAbsolute(configuredPrivateInputFileName)
    ? configuredPrivateInputFileName
    : path.resolve(resolvedLocalEnvRoot, configuredPrivateInputFileName);
}

function validateInsideEnvRoot(filePath, label) {
  const relativePath = path.relative(resolvedLocalEnvRoot, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    console.error("GrooveForge release-channel setup brief failed:");
    console.error(`- ${label} must stay inside the selected env root.`);
    process.exit(1);
  }
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
  let value = withoutExport.slice(separatorIndex + 1).trim();
  if (!/^[A-Z0-9_]+$/.test(key)) {
    return null;
  }
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function isPlaceholderValue(value) {
  return placeholderPattern.test(String(value ?? "").trim());
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

async function readEnvSnapshot(filePath, label) {
  validateInsideEnvRoot(filePath, label);
  const displayPath = displayLocalEnvTarget(filePath);
  const snapshot = {
    label,
    filePath: displayPath,
    present: existsSync(filePath),
    entries: new Map(),
    loadedKeys: [],
    placeholderKeys: [],
    shapeReadyKeys: [],
    shapeInvalidKeys: [],
    missingKeys: [],
    unknownKeys: [],
    malformedLines: [],
    locationRows: [],
    valueRecorded: false
  };

  if (!snapshot.present) {
    snapshot.missingKeys = [...releaseChannelMetadataKeys];
    return snapshot;
  }

  const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    const parsed = parseEnvLine(line);
    if (!parsed) {
      if (line.trim() && !line.trim().startsWith("#")) {
        snapshot.malformedLines.push(`${displayPath}:${index + 1}`);
      }
      continue;
    }
    if (!releaseChannelMetadataKeys.includes(parsed.key)) {
      snapshot.unknownKeys.push(parsed.key);
      continue;
    }
    const placeholder = isPlaceholderValue(parsed.value);
    const shapeReady = placeholder === false && shapeReadyForKey(parsed.key, parsed.value);
    snapshot.entries.set(parsed.key, {
      key: parsed.key,
      line: index + 1,
      present: true,
      placeholder,
      shapeReady,
      shapeInvalid: placeholder === false && shapeReady === false,
      valueRecorded: false
    });
    snapshot.loadedKeys.push(parsed.key);
    snapshot.locationRows.push({
      key: parsed.key,
      file: displayPath,
      line: index + 1,
      placeholder,
      shapeReady,
      shapeInvalid: placeholder === false && shapeReady === false,
      valueRecorded: false
    });
  }

  snapshot.loadedKeys = [...new Set(snapshot.loadedKeys)];
  snapshot.unknownKeys = [...new Set(snapshot.unknownKeys)];
  snapshot.placeholderKeys = releaseChannelMetadataKeys.filter((key) => snapshot.entries.get(key)?.placeholder === true);
  snapshot.shapeReadyKeys = releaseChannelMetadataKeys.filter((key) => snapshot.entries.get(key)?.shapeReady === true);
  snapshot.shapeInvalidKeys = releaseChannelMetadataKeys.filter((key) => snapshot.entries.get(key)?.shapeInvalid === true);
  snapshot.missingKeys = releaseChannelMetadataKeys.filter((key) => !snapshot.entries.has(key));
  return snapshot;
}

function processEnvSnapshot() {
  const entries = new Map();
  const locationRows = [];
  for (const [index, key] of releaseChannelMetadataKeys.entries()) {
    const value = syntheticSmoke ? "" : process.env[key]?.trim() ?? "";
    const present = value.length > 0;
    const placeholder = present && isPlaceholderValue(value);
    const shapeReady = present && placeholder === false && shapeReadyForKey(key, value);
    const shapeInvalid = present && placeholder === false && shapeReady === false;
    if (present) {
      entries.set(key, {
        key,
        line: null,
        present,
        placeholder,
        shapeReady,
        shapeInvalid,
        valueRecorded: false
      });
    }
    locationRows.push({
      order: index + 1,
      key,
      source: "process-env",
      present,
      placeholder,
      shapeReady,
      shapeInvalid,
      valueRecorded: false
    });
  }
  return {
    label: "process-env",
    filePath: "process.env",
    present: true,
    entries,
    loadedKeys: releaseChannelMetadataKeys.filter((key) => entries.has(key)),
    placeholderKeys: releaseChannelMetadataKeys.filter((key) => entries.get(key)?.placeholder === true),
    shapeReadyKeys: releaseChannelMetadataKeys.filter((key) => entries.get(key)?.shapeReady === true),
    shapeInvalidKeys: releaseChannelMetadataKeys.filter((key) => entries.get(key)?.shapeInvalid === true),
    missingKeys: releaseChannelMetadataKeys.filter((key) => !entries.has(key)),
    unknownKeys: [],
    malformedLines: [],
    locationRows,
    valueRecorded: false
  };
}

function buildSetupRows({ processEnv, privateInput, localEnv }) {
  return releaseChannelMetadataKeys.map((key, index) => {
    const processEntry = processEnv.entries.get(key);
    const privateEntry = privateInput.entries.get(key);
    const localEntry = localEnv.entries.get(key);
    const effectiveSource = processEntry?.present
      ? "process-env"
      : privateEntry?.present
        ? "private-input-file"
        : "missing";
    const effectiveEntry = effectiveSource === "process-env" ? processEntry : effectiveSource === "private-input-file" ? privateEntry : null;
    const effectiveInputPresent = Boolean(effectiveEntry?.present);
    const effectiveInputPlaceholder = Boolean(effectiveEntry?.placeholder);
    const effectiveInputShapeReady = Boolean(effectiveEntry?.shapeReady);
    return {
      order: index + 1,
      key,
      expectedShape: expectedShapes.get(key),
      effectiveInputSource: effectiveSource,
      effectiveInputPresent,
      effectiveInputPlaceholder,
      effectiveInputShapeReady,
      effectiveInputShapeInvalid: Boolean(effectiveEntry?.shapeInvalid),
      processEnvPresent: Boolean(processEntry?.present),
      processEnvPlaceholder: Boolean(processEntry?.placeholder),
      processEnvShapeReady: Boolean(processEntry?.shapeReady),
      privateInputFilePresent: privateInput.present,
      privateInputKeyPresent: Boolean(privateEntry?.present),
      privateInputPlaceholder: Boolean(privateEntry?.placeholder),
      privateInputShapeReady: Boolean(privateEntry?.shapeReady),
      privateInputLine: privateEntry?.line ?? null,
      localEnvFilePresent: localEnv.present,
      localEnvKeyPresent: Boolean(localEntry?.present),
      localEnvPlaceholder: Boolean(localEntry?.placeholder),
      localEnvShapeReady: Boolean(localEntry?.shapeReady),
      localEnvLine: localEntry?.line ?? null,
      nextInputAction: effectiveInputShapeReady
        ? "run preflight"
        : privateInput.present
          ? "replace private input placeholder or invalid value"
          : "create private input template",
      preflightCommand: "npm run release:channel-apply-private-env-preflight",
      applyCommand: "npm run release:channel-apply-private-env",
      proofCommand: "npm run release:private-edit-strict-proof",
      valueRecorded: false
    };
  });
}

function renderSyntheticEnvFile() {
  return [
    "# Synthetic release-channel setup brief fixture.",
    "# Values are placeholders and are safe to record as placeholders only.",
    ...releaseChannelMetadataKeys.map((key) => `${key}=${placeholderValues.get(key)}`),
    ""
  ].join("\n");
}

async function prepareSyntheticFixture({ localEnvPath, privateInputPath }) {
  await mkdir(path.dirname(localEnvPath), { recursive: true });
  await mkdir(path.dirname(privateInputPath), { recursive: true });
  const text = renderSyntheticEnvFile();
  await writeFile(localEnvPath, text, "utf8");
  await writeFile(privateInputPath, text, "utf8");
}

function rowTable(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.effectiveInputSource)} | ${readyLabel(row.effectiveInputPresent)} | ${readyLabel(row.effectiveInputPlaceholder)} | ${readyLabel(row.effectiveInputShapeReady)} | ${readyLabel(row.localEnvShapeReady)} | ${escapeCell(row.nextInputAction)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function locationTable(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | none | none |\n";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.key)} | ${escapeCell(row.file)} | ${row.line ?? "n/a"} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} Release-Channel Setup Brief

## Summary

- Setup brief ready: ${readyLabel(report.releaseChannelSetupBriefReady)}
- Synthetic smoke: ${readyLabel(report.syntheticSmoke)}
- Local env file present: ${readyLabel(report.localEnvFilePresent)}
- Private input file present: ${readyLabel(report.privateInputFilePresent)}
- Effective input ready rows: ${report.effectiveInputReadyCount}/${report.currentRequiredKeyCount}
- Current local env ready rows: ${report.localEnvReadyCount}/${report.currentRequiredKeyCount}
- Effective missing rows: ${report.effectiveInputMissingCount}
- Effective placeholder rows: ${report.effectiveInputPlaceholderCount}
- Effective shape-invalid rows: ${report.effectiveInputShapeInvalidCount}
- Private input placeholder rows: ${report.privateInputPlaceholderCount}
- Local env placeholder rows: ${report.localEnvPlaceholderCount}
- Private input file key: \`${report.privateInputFileKey}\`
- Private input file default: \`${report.privateInputFileDefaultName}\`
- Operator private input file default path: \`${report.operatorPrivateInputFileDefaultPath}\`
- Private input file path: ${report.privateInputFilePath}
- Current env edit target: ${report.currentEnvEditTarget}
- Template command: \`${report.privateInputTemplateCommand}\`
- Current operator first command after inputs: \`${report.currentOperatorFirstCommand}\`
- Apply command after preflight: \`${report.privateEnvApplyCommand}\`
- One-command apply proof runner: \`${report.privateEnvApplyProofCommand}\`
- Recommended proof chain after apply: \`${report.recommendedOperatorProofCommand}\`
- Guided setup fallback: \`${report.guidedSetupFallbackCommand}\`
- Current blocker refresh: \`${report.currentBlockerCommand}\`
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- External distribution claimed: no

## Setup Rows

| order | key | effective input source | input present | input placeholder | input shape ready | local env ready | next input action | value recorded |
|---:|---|---|---:|---:|---:|---:|---|---:|
${rowTable(report.setupRows)}

## Private Input File Locations

| key | file | line | placeholder | shape ready | value recorded |
|---|---|---:|---:|---:|---:|
${locationTable(report.privateInputLocationRows)}

## Current Local Env Locations

| key | file | line | placeholder | shape ready | value recorded |
|---|---|---:|---:|---:|---:|
${locationTable(report.localEnvLocationRows)}

## Command Chain

1. \`${report.privateInputTemplateCommand}\` if the ignored private input file is missing.
2. Edit \`${report.operatorPrivateInputFileDefaultPath}\` locally until the setup rows show 4/4 shape-ready inputs.
3. \`${report.currentOperatorFirstCommand}\` to verify the private inputs before writing the ignored local env.
4. \`${report.privateEnvApplyCommand}\` after preflight reports 4/4 ready rows.
5. \`${report.recommendedOperatorProofCommand}\` after apply writes 4/4 current-ready rows.

## Not Recorded

This report records key names, source labels, file names, line numbers, booleans, row counts, and command names only. It does not record release URLs, support URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, private beats, or real user audio.

## Not Claimed

This command does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function writeReport(report) {
  const markdown = buildMarkdown(report);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const combined = `${markdown}\n${json}`;
  check(!/https?:\/\//i.test(combined), "release-channel setup brief report should not include URL values");
  check(!combined.includes("downloads.invalid"), "release-channel setup brief report should not include synthetic URL host values");
  check(!combined.includes("support.invalid"), "release-channel setup brief report should not include synthetic support host values");
  await mkdir(packageRoot, { recursive: true });
  await writeFile(markdownPath, markdown, "utf8");
  await writeFile(jsonPath, json, "utf8");
}

async function main() {
  const localEnvPath = localEnvCandidatePath();
  const privateInputPath = privateInputCandidatePath();
  validateInsideEnvRoot(localEnvPath, "Distribution env file");
  validateInsideEnvRoot(privateInputPath, "Private release-channel input file");

  if (syntheticSmoke) {
    await prepareSyntheticFixture({ localEnvPath, privateInputPath });
  }

  const processEnv = processEnvSnapshot();
  const privateInput = await readEnvSnapshot(privateInputPath, "private-input-file");
  const localEnv = await readEnvSnapshot(localEnvPath, "local-env");
  const setupRows = buildSetupRows({ processEnv, privateInput, localEnv });
  const effectiveInputReadyRows = setupRows.filter((row) => row.effectiveInputShapeReady);
  const localEnvReadyRows = setupRows.filter((row) => row.localEnvShapeReady);
  const effectiveInputMissingRows = setupRows.filter((row) => row.effectiveInputPresent === false);
  const effectiveInputPlaceholderRows = setupRows.filter((row) => row.effectiveInputPlaceholder);
  const effectiveInputShapeInvalidRows = setupRows.filter((row) => row.effectiveInputShapeInvalid);
  const report = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: syntheticSmoke ? "npm run release:channel-setup-brief-smoke" : "npm run release:channel-setup-brief",
    releaseChannelSetupBriefMarkdownPath: relative(markdownPath),
    releaseChannelSetupBriefJsonPath: relative(jsonPath),
    syntheticSmoke,
    localEnvRootOverrideEnabled: Boolean(envRootOverride) || syntheticSmoke,
    localEnvRootRelativePath: syntheticSmoke || envRootOverride ? relativeLocalEnvRoot : ".",
    privateInputFileKey,
    privateInputFileDefaultName: defaultPrivateInputFileName,
    operatorPrivateInputFileDefaultPath: defaultPrivateInputFileName,
    configuredPrivateInputFileName,
    privateInputFilePath: displayLocalEnvTarget(privateInputPath),
    privateInputFilePresent: privateInput.present,
    privateInputLoadedKeyCount: privateInput.loadedKeys.length,
    privateInputLoadedKeys: privateInput.loadedKeys,
    privateInputMissingKeys: privateInput.missingKeys,
    privateInputMissingKeyCount: privateInput.missingKeys.length,
    privateInputPlaceholderKeys: privateInput.placeholderKeys,
    privateInputPlaceholderCount: privateInput.placeholderKeys.length,
    privateInputShapeReadyKeys: privateInput.shapeReadyKeys,
    privateInputShapeReadyCount: privateInput.shapeReadyKeys.length,
    privateInputShapeInvalidKeys: privateInput.shapeInvalidKeys,
    privateInputShapeInvalidCount: privateInput.shapeInvalidKeys.length,
    privateInputUnknownKeys: privateInput.unknownKeys,
    privateInputMalformedLines: privateInput.malformedLines,
    privateInputLocationRows: privateInput.locationRows,
    privateInputLocationRowCount: privateInput.locationRows.length,
    processEnvLoadedKeys: processEnv.loadedKeys,
    processEnvLoadedKeyCount: processEnv.loadedKeys.length,
    processEnvPlaceholderKeys: processEnv.placeholderKeys,
    processEnvPlaceholderCount: processEnv.placeholderKeys.length,
    processEnvShapeReadyKeys: processEnv.shapeReadyKeys,
    processEnvShapeReadyCount: processEnv.shapeReadyKeys.length,
    processEnvShapeInvalidKeys: processEnv.shapeInvalidKeys,
    processEnvShapeInvalidCount: processEnv.shapeInvalidKeys.length,
    distributionEnvFileKey,
    distributionEnvFileName: configuredEnvFileName,
    currentEnvEditTarget: displayLocalEnvTarget(localEnvPath),
    localEnvFilePresent: localEnv.present,
    localEnvLoadedKeyCount: localEnv.loadedKeys.length,
    localEnvLoadedKeys: localEnv.loadedKeys,
    localEnvMissingKeys: localEnv.missingKeys,
    localEnvMissingKeyCount: localEnv.missingKeys.length,
    localEnvPlaceholderKeys: localEnv.placeholderKeys,
    localEnvPlaceholderCount: localEnv.placeholderKeys.length,
    localEnvShapeReadyKeys: localEnv.shapeReadyKeys,
    localEnvShapeReadyCount: localEnv.shapeReadyKeys.length,
    localEnvShapeInvalidKeys: localEnv.shapeInvalidKeys,
    localEnvShapeInvalidCount: localEnv.shapeInvalidKeys.length,
    localEnvUnknownKeys: localEnv.unknownKeys,
    localEnvMalformedLines: localEnv.malformedLines,
    localEnvLocationRows: localEnv.locationRows,
    localEnvLocationRowCount: localEnv.locationRows.length,
    currentRequiredKeys: releaseChannelMetadataKeys,
    currentRequiredKeyCount: releaseChannelMetadataKeys.length,
    currentRequiredKeySummary: summarizeKeys(releaseChannelMetadataKeys),
    setupRows,
    setupRowCount: setupRows.length,
    effectiveInputReadyCount: effectiveInputReadyRows.length,
    effectiveInputReadyKeys: effectiveInputReadyRows.map((row) => row.key),
    effectiveInputMissingCount: effectiveInputMissingRows.length,
    effectiveInputMissingKeys: effectiveInputMissingRows.map((row) => row.key),
    effectiveInputPlaceholderCount: effectiveInputPlaceholderRows.length,
    effectiveInputPlaceholderKeys: effectiveInputPlaceholderRows.map((row) => row.key),
    effectiveInputShapeInvalidCount: effectiveInputShapeInvalidRows.length,
    effectiveInputShapeInvalidKeys: effectiveInputShapeInvalidRows.map((row) => row.key),
    localEnvReadyCount: localEnvReadyRows.length,
    localEnvReadyKeys: localEnvReadyRows.map((row) => row.key),
    privateInputTemplateCommand: "npm run release:channel-private-input-template",
    currentOperatorFirstCommand: "npm run release:channel-apply-private-env-preflight",
    privateEnvApplyPreflightCommand: "npm run release:channel-apply-private-env-preflight",
    privateEnvApplyCommand: "npm run release:channel-apply-private-env",
    privateEnvApplyProofCommand: "npm run release:channel-apply-private-env-proof",
    firstStrictProofCommand: "npm run release:channel-live-check-strict",
    recommendedOperatorProofCommand: "npm run release:private-edit-strict-proof",
    guidedSetupFallbackCommand: "npm run release:channel-setup-wizard",
    currentBlockerCommand: "npm run release:current-blocker",
    completionSummaryRefreshCommand: "npm run release:completion-summary-refresh-smoke",
    hardGateCommand: "npm run release:external-check",
    releaseChannelSetupBriefReady: setupRows.length === releaseChannelMetadataKeys.length,
    privateInputFileValueRecorded: false,
    processEnvValueRecorded: false,
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

  check(report.currentRequiredKeyCount === 4, "release-channel setup brief should cover four release-channel keys");
  check(report.setupRowCount === 4, "release-channel setup brief should write four setup rows");
  check(report.setupRows.every((row) => row.valueRecorded === false), "release-channel setup brief rows should be value-free");
  check(report.privateInputLocationRows.every((row) => row.valueRecorded === false), "release-channel setup brief private input rows should be value-free");
  check(report.localEnvLocationRows.every((row) => row.valueRecorded === false), "release-channel setup brief local env rows should be value-free");
  check(report.privateInputFileKey === privateInputFileKey, "release-channel setup brief should expose private input file key");
  check(report.privateInputFileDefaultName === defaultPrivateInputFileName, "release-channel setup brief should expose default private input file name");
  check(report.operatorPrivateInputFileDefaultPath === defaultPrivateInputFileName, "release-channel setup brief should expose operator default private input path");
  check(report.currentOperatorFirstCommand === "npm run release:channel-apply-private-env-preflight", "release-channel setup brief should keep preflight first");
  check(report.privateEnvApplyCommand === "npm run release:channel-apply-private-env", "release-channel setup brief should expose apply after preflight");
  check(report.privateEnvApplyProofCommand === "npm run release:channel-apply-private-env-proof", "release-channel setup brief should expose apply proof runner");
  check(report.recommendedOperatorProofCommand === "npm run release:private-edit-strict-proof", "release-channel setup brief should expose strict proof chain");
  check(report.guidedSetupFallbackCommand === "npm run release:channel-setup-wizard", "release-channel setup brief should keep setup wizard as fallback");
  check(report.privateValuesRecorded === false, "release-channel setup brief should not record private values");
  check(report.localEnvValueRecorded === false, "release-channel setup brief should not record local env values");
  check(report.releaseUrlValueRecorded === false, "release-channel setup brief should not record release URL values");
  check(report.supportUrlValueRecorded === false, "release-channel setup brief should not record support URL values");
  check(report.channelValueRecorded === false, "release-channel setup brief should not record channel values");
  check(report.networkProbeAttempted === false, "release-channel setup brief should not probe networks");
  check(report.releaseUploadAttempted === false, "release-channel setup brief should not upload releases");
  check(report.notarySubmissionAttempted === false, "release-channel setup brief should not submit notarization");
  check(report.signingAttempted === false, "release-channel setup brief should not sign artifacts");
  check(report.releaseGateClaimedExternalDistribution === false, "release-channel setup brief should not claim external distribution");
  if (syntheticSmoke) {
    check(report.privateInputFilePresent === true, "release-channel setup brief smoke should load a synthetic private input file");
    check(report.localEnvFilePresent === true, "release-channel setup brief smoke should load a synthetic local env file");
    check(report.privateInputPlaceholderCount === 4, "release-channel setup brief smoke should surface four private input placeholders");
    check(report.localEnvPlaceholderCount === 4, "release-channel setup brief smoke should surface four local env placeholders");
    check(report.effectiveInputPlaceholderCount === 4, "release-channel setup brief smoke should surface four effective input placeholders");
  }

  await writeReport(report);

  if (failures.length > 0 || report.releaseChannelSetupBriefReady !== true) {
    console.error("GrooveForge release-channel setup brief failed.");
    console.error(`- Markdown: ${relative(markdownPath)}`);
    console.error(`- JSON: ${relative(jsonPath)}`);
    console.error(`- Synthetic smoke: ${readyLabel(report.syntheticSmoke)}`);
    console.error(`- Private input file present: ${readyLabel(report.privateInputFilePresent)}`);
    console.error(`- Local env file present: ${readyLabel(report.localEnvFilePresent)}`);
    console.error(`- Effective input ready rows: ${report.effectiveInputReadyCount}/${report.currentRequiredKeyCount}`);
    console.error(`- Current local env ready rows: ${report.localEnvReadyCount}/${report.currentRequiredKeyCount}`);
    console.error(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
    console.error(`- Apply command: ${report.privateEnvApplyCommand}`);
    console.error(`- Proof command: ${report.recommendedOperatorProofCommand}`);
    console.error("- Private values recorded: no");
    console.error("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
    console.error("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("GrooveForge release-channel setup brief passed.");
  console.log(`- Markdown: ${relative(markdownPath)}`);
  console.log(`- JSON: ${relative(jsonPath)}`);
  console.log(`- Synthetic smoke: ${readyLabel(report.syntheticSmoke)}`);
  console.log(`- Private input file present: ${readyLabel(report.privateInputFilePresent)}`);
  console.log(`- Private input file path: ${report.privateInputFilePath}`);
  console.log(`- Private input loaded keys: ${report.privateInputLoadedKeyCount}`);
  console.log(`- Private input placeholder rows: ${report.privateInputPlaceholderCount}`);
  console.log(`- Local env file present: ${readyLabel(report.localEnvFilePresent)}`);
  console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
  console.log(`- Current local env placeholder rows: ${report.localEnvPlaceholderCount}`);
  console.log(`- Effective input ready rows: ${report.effectiveInputReadyCount}/${report.currentRequiredKeyCount}`);
  console.log(`- Current local env ready rows: ${report.localEnvReadyCount}/${report.currentRequiredKeyCount}`);
  console.log(`- Template command: ${report.privateInputTemplateCommand}`);
  console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
  console.log(`- Apply command after preflight: ${report.privateEnvApplyCommand}`);
  console.log(`- One-command apply proof runner: ${report.privateEnvApplyProofCommand}`);
  console.log(`- Recommended proof chain after apply: ${report.recommendedOperatorProofCommand}`);
  console.log(`- Guided setup fallback: ${report.guidedSetupFallbackCommand}`);
  console.log("- Private values recorded: no");
  console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
  console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
}

await main();
