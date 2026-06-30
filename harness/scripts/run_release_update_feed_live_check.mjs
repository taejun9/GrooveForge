#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  distributionLocalEnvDefaults,
  distributionPrivateInputKeys,
  loadDistributionLocalEnv
} from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const strictMode = process.argv.includes("--strict");
const requestedReportStem = process.env.GROOVEFORGE_UPDATE_FEED_LIVE_CHECK_REPORT_STEM?.trim() ?? "";
const updateFeedModule = await import(pathToFileURL(path.join(root, "electron", "updateFeedConfig.ts")).href);
const { redactUpdateFeedConfig, resolveUpdateFeedConfig, updateChannelKeys, updateFeedUrlKeys } = updateFeedModule;
const reportArtifacts = {
  default: {
    stem: "release-update-feed-live-check",
    markdownName: "release-update-feed-live-check.md",
    jsonName: "release-update-feed-live-check.json",
    command: "npm run release:update-feed-live-check",
    sourceMode: "real-update-feed-live-check",
    syntheticSuccessSmoke: false
  },
  strict: {
    stem: "release-update-feed-live-check-strict",
    markdownName: "release-update-feed-live-check-strict.md",
    jsonName: "release-update-feed-live-check-strict.json",
    command: "npm run release:update-feed-live-check-strict",
    sourceMode: "real-update-feed-live-check-strict",
    syntheticSuccessSmoke: false
  },
  strictSuccessSmoke: {
    stem: "release-update-feed-live-check-strict-success-smoke",
    markdownName: "release-update-feed-live-check-strict-success-smoke.md",
    jsonName: "release-update-feed-live-check-strict-success-smoke.json",
    command: "npm run release:update-feed-live-check-strict-success-smoke",
    sourceMode: "synthetic-update-feed-strict-success-smoke",
    syntheticSuccessSmoke: true
  }
};

if (
  requestedReportStem &&
  (requestedReportStem !== reportArtifacts.strictSuccessSmoke.stem || strictMode !== true)
) {
  console.error("GrooveForge update feed live check failed:");
  console.error("- Unsupported report stem override.");
  process.exit(1);
}

const selectedArtifact = requestedReportStem
  ? reportArtifacts.strictSuccessSmoke
  : strictMode
    ? reportArtifacts.strict
    : reportArtifacts.default;
const reportStem = selectedArtifact.stem;
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const localEnvRootOverride = process.env.GROOVEFORGE_UPDATE_FEED_LIVE_CHECK_ENV_ROOT?.trim() ?? "";
const resolvedLocalEnvRoot = localEnvRootOverride ? path.resolve(root, localEnvRootOverride) : root;
const relativeLocalEnvRoot = path.relative(root, resolvedLocalEnvRoot);
if (localEnvRootOverride && (relativeLocalEnvRoot.startsWith("..") || path.isAbsolute(relativeLocalEnvRoot))) {
  console.error("GrooveForge update feed live check failed:");
  console.error("- Local env root override must stay inside the repository.");
  process.exit(1);
}

const updateFeedKeys = [...updateFeedUrlKeys, ...updateChannelKeys];
const updateFeedGuidance = {
  GROOVEFORGE_UPDATE_FEED_URL: "safe absolute HTTPS update feed URL",
  ELECTRON_UPDATE_FEED_URL: "safe absolute HTTPS update feed URL",
  UPDATE_FEED_URL: "safe absolute HTTPS update feed URL",
  GROOVEFORGE_UPDATE_CHANNEL: "1-32 lowercase channel token",
  ELECTRON_UPDATE_CHANNEL: "1-32 lowercase channel token",
  UPDATE_CHANNEL: "1-32 lowercase channel token"
};
const placeholderPattern = /^(|<[^>]+>|CHANGE_ME|REPLACE_ME|TODO|TBD|example|example-.+|your-.+|https:\/\/example\.com.*)$/i;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge update feed live check failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function displayLocalEnvTarget(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(root, filePath);
  const relativePath = path.relative(root, absolutePath);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.basename(absolutePath);
}

function localEnvCandidatePaths() {
  const paths = [path.join(resolvedLocalEnvRoot, distributionLocalEnvDefaults.defaultEnvFileName)];
  const configuredPath = process.env[distributionLocalEnvDefaults.configuredFileKey]?.trim();
  if (configuredPath) {
    paths.push(path.isAbsolute(configuredPath) ? configuredPath : path.resolve(resolvedLocalEnvRoot, configuredPath));
  }
  return [...new Set(paths)];
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
  return /^[a-z0-9][a-z0-9._-]{0,31}$/.test(String(value ?? "").trim());
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function readyLabel(value) {
  return value === true ? "yes" : "no";
}

function firstArrayValue(values) {
  return Array.isArray(values) ? values.find((value) => typeof value === "string" && value.trim().length > 0) : "";
}

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

async function currentTenPlanProgress() {
  const completedRoot = path.join(root, "docs", "exec_plans", "completed");
  const files = await readdir(completedRoot);
  const planNumbers = files
    .map((file) => /^plan-(\d+)-/.exec(file)?.[1])
    .filter((value) => typeof value === "string")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
  const currentPlan = 1207;
  const windowStart = Math.floor((currentPlan - 1) / 10) * 10 + 1;
  const windowEnd = windowStart + 9;
  const windowRows = planNumbers.filter((number) => number >= windowStart && number <= windowEnd).sort((a, b) => a - b);
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

async function readLocalEnvEntries() {
  const entries = [];
  for (const filePath of localEnvCandidatePaths()) {
    if (!existsSync(filePath)) {
      continue;
    }
    const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      const parsed = parseEnvLine(line);
      if (!parsed || !updateFeedKeys.includes(parsed.key)) {
        continue;
      }
      entries.push({
        key: parsed.key,
        value: parsed.value,
        file: displayLocalEnvTarget(filePath),
        line: index + 1,
        valueRecorded: false
      });
    }
  }
  return entries;
}

function currentLocalEnvEditTarget(localEnvInput) {
  const presentFile = firstArrayValue(localEnvInput.presentFiles);
  if (presentFile) {
    return displayLocalEnvTarget(presentFile);
  }
  const checkedFile = firstArrayValue(localEnvInput.filesChecked);
  if (checkedFile) {
    return displayLocalEnvTarget(checkedFile);
  }
  const configuredPath = process.env[distributionLocalEnvDefaults.configuredFileKey]?.trim();
  return displayLocalEnvTarget(configuredPath || distributionLocalEnvDefaults.defaultEnvFileName);
}

function firstEntryByKey(localEntries) {
  const byKey = new Map();
  for (const entry of localEntries) {
    if (!byKey.has(entry.key)) {
      byKey.set(entry.key, entry);
    }
  }
  return byKey;
}

function buildRows({ localEntries, localEnvInput, editTarget, redactedConfig }) {
  const placeholderKeys = new Set(localEnvInput.placeholderKeys.filter((key) => updateFeedKeys.includes(key)));
  const byKey = firstEntryByKey(localEntries);
  return updateFeedKeys.map((key, index) => {
    const entry = byKey.get(key) ?? null;
    const value = entry?.value?.trim() ?? process.env[key]?.trim() ?? "";
    const kind = updateFeedUrlKeys.includes(key) ? "feed-url" : "channel";
    const present = value.length > 0;
    const placeholder = present && (placeholderKeys.has(key) || isPlaceholderValue(value));
    const shapeReady =
      present && !placeholder && (kind === "feed-url" ? safeHttpsUrlShapeReady(value) : channelShapeReady(value));
    const selected = redactedConfig.feedKey === key || redactedConfig.channelKey === key;
    return {
      order: index + 1,
      key,
      kind,
      selected,
      present,
      placeholder,
      shapeReady,
      selectedReady: selected && present && placeholder === false && shapeReady === true,
      expectedShape: updateFeedGuidance[key],
      editTarget: entry?.file ?? editTarget,
      line: entry?.line ?? null,
      proofCommand: "npm run release:update-feed-live-check",
      strictCommand: "npm run release:update-feed-live-check-strict",
      valueRecorded: false
    };
  });
}

function buildPlaceholderEditLocations(rows) {
  return rows
    .filter((row) => row.placeholder === true)
    .map((row) => ({
      key: row.key,
      file: row.editTarget,
      line: row.line,
      placeholder: true,
      valueRecorded: false
    }));
}

function buildStrictFailureRows({ rows, redactedConfig }) {
  const failures = [];
  if (redactedConfig.feedUrlPresent !== true || redactedConfig.feedUrlValid !== true) {
    failures.push({
      target: "update-feed-url",
      selectedKey: textValue(redactedConfig.feedKey),
      present: redactedConfig.feedUrlPresent === true,
      shapeReady: redactedConfig.feedUrlValid === true,
      blockerCount: redactedConfig.blockers.filter((blocker) => blocker.toLowerCase().includes("feed")).length,
      proofCommand: "npm run release:update-feed-live-check-strict",
      nonStrictProofCommand: "npm run release:update-feed-live-check",
      valueRecorded: false
    });
  }
  if (redactedConfig.releaseChannelPresent !== true || redactedConfig.releaseChannelValid !== true) {
    failures.push({
      target: "update-channel",
      selectedKey: textValue(redactedConfig.channelKey),
      present: redactedConfig.releaseChannelPresent === true,
      shapeReady: redactedConfig.releaseChannelValid === true,
      blockerCount: redactedConfig.blockers.filter((blocker) => blocker.toLowerCase().includes("channel")).length,
      proofCommand: "npm run release:update-feed-live-check-strict",
      nonStrictProofCommand: "npm run release:update-feed-live-check",
      valueRecorded: false
    });
  }
  if (failures.length === 0 && !rows.some((row) => row.kind === "feed-url" && row.selectedReady)) {
    failures.push({
      target: "update-feed-url",
      selectedKey: textValue(redactedConfig.feedKey),
      present: true,
      shapeReady: true,
      blockerCount: 0,
      proofCommand: "npm run release:update-feed-live-check-strict",
      nonStrictProofCommand: "npm run release:update-feed-live-check",
      valueRecorded: false
    });
  }
  if (failures.length === 0 && !rows.some((row) => row.kind === "channel" && row.selectedReady)) {
    failures.push({
      target: "update-channel",
      selectedKey: textValue(redactedConfig.channelKey),
      present: true,
      shapeReady: true,
      blockerCount: 0,
      proofCommand: "npm run release:update-feed-live-check-strict",
      nonStrictProofCommand: "npm run release:update-feed-live-check",
      valueRecorded: false
    });
  }
  return failures;
}

function formatRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| 0 | none | none | no | no | no | no | no | none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.kind)} | ${readyLabel(row.selected)} | ${readyLabel(row.present)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${readyLabel(row.selectedReady)} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "none")} | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatStrictFailureRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | yes | yes | 0 | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.target)} | ${escapeCell(row.selectedKey)} | ${readyLabel(row.present)} | ${readyLabel(row.shapeReady)} | ${row.blockerCount} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.nonStrictProofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatLocations(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | no | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.key)} | ${escapeCell(row.file)} | ${escapeCell(row.line ?? "none")} | ${readyLabel(row.placeholder)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} Update Feed Live Check

## Summary

- Strict mode: ${readyLabel(report.strictMode)}
- Strict ready: ${readyLabel(report.strictReady)}
- Strict exit code: ${report.strictExitCode}
- Strict failure rows: ${report.strictFailureRowCount}
- Update feed live check ready: ${readyLabel(report.updateFeedLiveCheckReady)}
- Current env edit target: ${report.currentEnvEditTarget}
- Current required keys: ${report.currentRequiredKeyCount}
- Current selected keys ready: ${report.currentSelectedReadyCount}/2
- Current placeholder keys: ${report.currentPlaceholderKeyCount}
- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount}
- Feed key selected: ${report.selectedFeedKey}
- Channel key selected: ${report.selectedChannelKey}
- Feed value recorded: no
- Channel value recorded: no
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- Auto-update readiness command: \`${report.autoUpdateReadinessCommand}\`
- Hard gate command: \`${report.hardGateCommand}\`
- Private values recorded: no
- Network probe attempted: no
- Update feed publish attempted: no
- Auto-update claimed: no
- External distribution claimed: no

## Current Update Feed Rows

| order | key | kind | selected | present | placeholder | shape ready | selected ready | expected shape | edit target | line | proof command | value recorded |
|---:|---|---|---:|---:|---:|---:|---:|---|---|---:|---|---:|
${formatRows(report.updateFeedLiveCheckRows)}

## Strict Failure Rows

| target | selected key | present | shape ready | blocker count | strict command | non-strict command | value recorded |
|---|---|---:|---:|---:|---|---|---:|
${formatStrictFailureRows(report.strictFailureRows)}

## Current Placeholder Edit Locations

| key | file | line | placeholder | value recorded |
|---|---|---:|---:|---:|
${formatLocations(report.currentPlaceholderEditLocations)}

## Not Claimed

This live check does not claim auto-update readiness, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, release upload, remote feed probing, app-store submission, or external distribution completion.
`;
}

function privateValues(localEntries) {
  const values = [];
  for (const key of distributionPrivateInputKeys) {
    const value = process.env[key]?.trim();
    if (value && value.length >= 8) {
      values.push(value);
    }
  }
  for (const entry of localEntries) {
    const value = entry.value?.trim();
    if (value && value.length >= 8) {
      values.push(value);
    }
  }
  return [...new Set(values)];
}

async function main() {
  const previousValues = new Map(distributionPrivateInputKeys.map((key) => [key, process.env[key]]));
  try {
    const localEnvInput = await loadDistributionLocalEnv({
      root: resolvedLocalEnvRoot,
      allowedKeys: distributionPrivateInputKeys
    });
    const localEntries = await readLocalEnvEntries();
    const redactedConfig = redactUpdateFeedConfig(resolveUpdateFeedConfig(process.env));
    const currentEnvEditTarget = currentLocalEnvEditTarget(localEnvInput);
    const progress = await currentTenPlanProgress();
    const rows = buildRows({ localEntries, localEnvInput, editTarget: currentEnvEditTarget, redactedConfig });
    const currentPlaceholderKeys = rows.filter((row) => row.placeholder === true).map((row) => row.key);
    const currentPlaceholderEditLocations = buildPlaceholderEditLocations(rows);
    const selectedReadyCount = rows.filter((row) => row.selectedReady === true).length;
    const strictFailureRows = buildStrictFailureRows({ rows, redactedConfig });
    const ready = redactedConfig.ready === true && selectedReadyCount === 2 && rows.every((row) => row.valueRecorded === false);
    const report = {
      appName,
      bundleId,
      version: packageJson.version,
      generatedAt: new Date().toISOString(),
      platform: process.platform,
      arch: process.arch,
      platformArch,
      strictMode,
      sourceMode: selectedArtifact.sourceMode,
      syntheticSuccessSmoke: selectedArtifact.syntheticSuccessSmoke,
      reportCommand: selectedArtifact.command,
      updateFeedLiveCheckMarkdownArtifactName: selectedArtifact.markdownName,
      updateFeedLiveCheckJsonArtifactName: selectedArtifact.jsonName,
      updateFeedLiveCheckMarkdownPath: relative(markdownPath),
      updateFeedLiveCheckJsonPath: relative(jsonPath),
      localEnvRootOverrideEnabled: Boolean(localEnvRootOverride),
      localEnvRootRelativePath: localEnvRootOverride ? relativeLocalEnvRoot : ".",
      realLocalEnvRead: resolvedLocalEnvRoot === root,
      realLocalEnvModified: false,
      updateFeedLiveCheckReady: ready,
      updateFeedLiveCheckRows: rows,
      updateFeedLiveCheckRowCount: rows.length,
      updateFeedLiveCheckSummary: `${selectedReadyCount}/2 selected update feed/channel rows ready`,
      localEnvFileLoaded: localEnvInput.enabled === true,
      localEnvFilesChecked: localEnvInput.filesChecked,
      localEnvPresentFiles: localEnvInput.presentFiles,
      localEnvLoadedKeyCount: localEnvInput.loadedKeys.length,
      localEnvLoadedKeys: localEnvInput.loadedKeys,
      localEnvSkippedExistingKeyCount: localEnvInput.skippedExistingKeys.length,
      localEnvSkippedExistingKeys: localEnvInput.skippedExistingKeys,
      localEnvPlaceholderKeyCount: localEnvInput.placeholderKeys.length,
      localEnvPlaceholderKeys: localEnvInput.placeholderKeys,
      localEnvUnknownKeyCount: localEnvInput.unknownKeys.length,
      localEnvMalformedLineCount: localEnvInput.malformedLines.length,
      localEnvValueRecorded: false,
      currentEnvEditTarget,
      currentRequiredKeyCount: updateFeedKeys.length,
      currentRequiredKeys: updateFeedKeys,
      currentSelectedReadyCount: selectedReadyCount,
      selectedFeedKey: textValue(redactedConfig.feedKey),
      selectedChannelKey: textValue(redactedConfig.channelKey),
      feedUrlPresent: redactedConfig.feedUrlPresent === true,
      feedUrlValid: redactedConfig.feedUrlValid === true,
      releaseChannelPresent: redactedConfig.releaseChannelPresent === true,
      releaseChannelValid: redactedConfig.releaseChannelValid === true,
      presentEnvironmentKeys: redactedConfig.presentEnvironmentKeys,
      presentEnvironmentKeyCount: redactedConfig.presentEnvironmentKeys.length,
      blockerRows: redactedConfig.blockers.map((blocker, index) => ({
        order: index + 1,
        blocker,
        proofCommand: "npm run release:update-feed-live-check",
        valueRecorded: false
      })),
      blockerCount: redactedConfig.blockers.length,
      currentPlaceholderKeyCount: currentPlaceholderKeys.length,
      currentPlaceholderKeys,
      currentPlaceholderEditLocationCount: currentPlaceholderEditLocations.length,
      currentPlaceholderEditLocationSummary:
        currentPlaceholderEditLocations.length > 0 ? `${currentPlaceholderEditLocations.length} update feed/channel placeholder edit locations` : "none",
      currentPlaceholderEditLocations,
      strictReady: ready,
      strictExitCode: ready ? 0 : 1,
      strictFailureRowCount: strictFailureRows.length,
      strictFailureRows,
      strictFailureSummary: ready
        ? "selected update feed URL and channel rows are strict-ready"
        : `${strictFailureRows.length} update feed/channel targets are not strict-ready`,
      currentTenPlanProgressLabel: progress.label,
      currentTenPlanWindowStart: progress.windowStart,
      currentTenPlanWindowEnd: progress.windowEnd,
      currentTenPlanWindowCompletedCount: progress.completedCount,
      currentTenPlanWindowTotal: progress.windowTotal,
      tenPlanProgressReportDue: progress.reportDue,
      nextTenPlanProgressReportAt: progress.nextReportAt,
      autoUpdateReadinessCommand: "npm run desktop:auto-update-readiness-smoke",
      hardGateCommand: "npm run release:external-check",
      privateValuesRecorded: false,
      feedValueRecorded: false,
      channelValueRecorded: false,
      networkProbeAttempted: false,
      updateFeedPublishAttempted: false,
      releaseUploadAttempted: false,
      notarySubmissionAttempted: false,
      signingAttempted: false,
      claimedDeveloperIdSigning: false,
      claimedNotarization: false,
      claimedGatekeeperApproval: false,
      claimedAutoUpdate: false,
      claimedManualQaApproval: false,
      claimedAppStoreSubmission: false,
      claimedExternalDistribution: false,
      valueRecorded: false
    };

    check(report.appName === appName, "update feed live check should identify GrooveForge");
    check(report.bundleId === bundleId, `update feed live check should identify ${bundleId}`);
    check(report.sourceMode === selectedArtifact.sourceMode, "update feed live check source mode should match artifact mode");
    check(report.reportCommand === selectedArtifact.command, "update feed live check report command should match artifact mode");
    check(report.updateFeedLiveCheckRowCount === updateFeedKeys.length, "update feed live check should cover six update feed/channel keys");
    check(updateFeedKeys.every((key) => rows.some((row) => row.key === key)), "update feed live check should cover update feed/channel keys");
    check(rows.every((row) => row.valueRecorded === false), "update feed live check rows should not record values");
    check(rows.every((row) => typeof row.expectedShape === "string" && row.expectedShape.length > 0), "update feed live check rows should include expected shapes");
    check(rows.every((row) => row.proofCommand === "npm run release:update-feed-live-check"), "update feed live check rows should point at the live check command");
    check(report.currentRequiredKeyCount === updateFeedKeys.length, "update feed live check should list six current required keys");
    check(report.updateFeedLiveCheckMarkdownArtifactName === selectedArtifact.markdownName, "update feed live check Markdown artifact name should match mode");
    check(report.updateFeedLiveCheckJsonArtifactName === selectedArtifact.jsonName, "update feed live check JSON artifact name should match mode");
    check(report.currentPlaceholderKeyCount === report.currentPlaceholderKeys.length, "update feed live check placeholder count should match keys");
    check(report.currentPlaceholderEditLocationCount === report.currentPlaceholderEditLocations.length, "update feed live check placeholder edit location count should match rows");
    check(report.currentPlaceholderEditLocations.every((row) => row.valueRecorded === false), "update feed live check placeholder edit locations should not record values");
    check(report.strictReady === report.updateFeedLiveCheckReady, "update feed strict readiness should mirror live-check readiness");
    check(report.strictExitCode === (report.strictReady ? 0 : 1), "update feed strict exit code should match strict readiness");
    check(report.strictFailureRowCount === report.strictFailureRows.length, "update feed strict failure row count should match rows");
    check(report.strictFailureRows.every((row) => row.valueRecorded === false), "update feed strict failure rows should not record values");
    check(report.localEnvValueRecorded === false, "update feed live check should not record local env values");
    check(report.privateValuesRecorded === false, "update feed live check should not record private values");
    check(report.feedValueRecorded === false, "update feed live check should not record feed values");
    check(report.channelValueRecorded === false, "update feed live check should not record channel values");
    check(report.realLocalEnvModified === false, "update feed live check should not modify real local env");
    check(report.syntheticSuccessSmoke === selectedArtifact.syntheticSuccessSmoke, "update feed live check synthetic smoke flag should match artifact mode");
    check(report.networkProbeAttempted === false, "update feed live check should not probe the network");
    check(report.updateFeedPublishAttempted === false, "update feed live check should not publish feeds");
    check(report.releaseUploadAttempted === false, "update feed live check should not upload releases");
    check(report.notarySubmissionAttempted === false, "update feed live check should not submit to Apple");
    check(report.signingAttempted === false, "update feed live check should not sign artifacts");
    check(report.claimedAutoUpdate === false, "update feed live check should not claim auto-update");
    check(report.claimedExternalDistribution === false, "update feed live check should not claim external distribution");

    const markdown = buildMarkdown(report);
    const json = `${JSON.stringify(report, null, 2)}\n`;
    const combinedOutput = `${markdown}\n${json}`;
    for (const value of privateValues(localEntries)) {
      check(!combinedOutput.includes(value), "update feed live check should not include private or placeholder values");
    }
    check(!/https?:\/\//i.test(combinedOutput), "update feed live check should not include URL values");
    check(!combinedOutput.includes("stable/prod"), "update feed live check should not include invalid channel sample values");
    check(markdown.includes("Current Update Feed Rows"), "update feed live check Markdown should include feed rows");
    check(markdown.includes("Strict Failure Rows"), "update feed live check Markdown should include strict failure rows");
    check(markdown.includes("Current Placeholder Edit Locations"), "update feed live check Markdown should include placeholder edit locations");
    check(markdown.includes("Private values recorded: no"), "update feed live check Markdown should state value redaction");

    if (failures.length > 0) {
      fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
    }

    await mkdir(packageRoot, { recursive: true });
    await writeFile(markdownPath, markdown, "utf8");
    await writeFile(jsonPath, json, "utf8");

    if (strictMode && !report.strictReady) {
      console.error("GrooveForge update feed live check strict failed.");
      console.error(`- Markdown: ${relative(markdownPath)}`);
      console.error(`- JSON: ${relative(jsonPath)}`);
      console.error(`- Update feed live check ready: ${report.updateFeedLiveCheckReady ? "yes" : "no"}`);
      console.error(`- Strict failure rows: ${report.strictFailureRowCount}`);
      console.error(`- Current selected keys ready: ${report.currentSelectedReadyCount}/2`);
      console.error(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
      console.error(`- Current env edit target: ${report.currentEnvEditTarget}`);
      console.error(`- Retry after private edits: ${report.reportCommand}`);
      console.error("- Private values recorded: no");
      console.error("- Network: no update feed probe, feed publish, release upload, Apple notary submission, or signing attempted");
      console.error("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
      process.exit(1);
    }

    if (strictMode) {
      console.log("GrooveForge update feed live check strict passed.");
    } else {
      console.log("GrooveForge update feed live check passed.");
    }
    console.log(`- Markdown: ${relative(markdownPath)}`);
    console.log(`- JSON: ${relative(jsonPath)}`);
    console.log(`- Source mode: ${report.sourceMode}`);
    console.log(`- Strict mode: ${report.strictMode ? "yes" : "no"}`);
    console.log(`- Strict ready: ${report.strictReady ? "yes" : "no"}`);
    console.log(`- Update feed live check ready: ${report.updateFeedLiveCheckReady ? "yes" : "no"}`);
    console.log(`- Current selected keys ready: ${report.currentSelectedReadyCount}/2`);
    console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
    console.log(`- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount}`);
    console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
    console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
    console.log(`- 10-plan report due: ${report.tenPlanProgressReportDue ? "yes" : "no"}`);
    console.log("- Private values recorded: no");
    console.log("- Network: no update feed probe, feed publish, release upload, Apple notary submission, or signing attempted");
    console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
  } finally {
    for (const [key, value] of previousValues) {
      if (typeof value === "string") {
        process.env[key] = value;
      } else {
        delete process.env[key];
      }
    }
  }
}

await main();
