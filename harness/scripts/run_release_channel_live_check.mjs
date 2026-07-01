#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
const requestedReportStem = process.env.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_REPORT_STEM?.trim() ?? "";
const reportArtifacts = {
  default: {
    stem: "release-channel-live-check",
    markdownName: "release-channel-live-check.md",
    jsonName: "release-channel-live-check.json",
    command: "npm run release:channel-live-check",
    sourceMode: "real-release-channel-live-check",
    syntheticSuccessSmoke: false,
    syntheticBlockedSmoke: false
  },
  strict: {
    stem: "release-channel-live-check-strict",
    markdownName: "release-channel-live-check-strict.md",
    jsonName: "release-channel-live-check-strict.json",
    command: "npm run release:channel-live-check-strict",
    sourceMode: "real-release-channel-live-check-strict",
    syntheticSuccessSmoke: false,
    syntheticBlockedSmoke: false
  },
  strictSuccessSmoke: {
    stem: "release-channel-live-check-strict-success-smoke",
    markdownName: "release-channel-live-check-strict-success-smoke.md",
    jsonName: "release-channel-live-check-strict-success-smoke.json",
    command: "npm run release:channel-live-check-strict-success-smoke",
    sourceMode: "synthetic-strict-success-smoke",
    syntheticSuccessSmoke: true,
    syntheticBlockedSmoke: false
  },
  strictBlockedSmoke: {
    stem: "release-channel-live-check-strict-blocked-smoke",
    markdownName: "release-channel-live-check-strict-blocked-smoke.md",
    jsonName: "release-channel-live-check-strict-blocked-smoke.json",
    command: "npm run release:private-edit-strict-proof-blocked-smoke",
    sourceMode: "synthetic-strict-blocked-smoke",
    syntheticSuccessSmoke: false,
    syntheticBlockedSmoke: true
  }
};
const requestedArtifact = requestedReportStem
  ? Object.values(reportArtifacts).find((artifact) => artifact.stem === requestedReportStem)
  : null;
if (requestedReportStem && (!requestedArtifact || strictMode !== true)) {
  console.error("GrooveForge release-channel live check failed:");
  console.error("- Unsupported report stem override.");
  process.exit(1);
}
const selectedArtifact = requestedArtifact
  ? requestedArtifact
  : strictMode
    ? reportArtifacts.strict
    : reportArtifacts.default;
const reportStem = selectedArtifact.stem;
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const localEnvRootOverride = process.env.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_ENV_ROOT?.trim() ?? "";
const resolvedLocalEnvRoot = localEnvRootOverride
  ? path.resolve(root, localEnvRootOverride)
  : root;
const relativeLocalEnvRoot = path.relative(root, resolvedLocalEnvRoot);
if (localEnvRootOverride && (relativeLocalEnvRoot.startsWith("..") || path.isAbsolute(relativeLocalEnvRoot))) {
  console.error("GrooveForge release-channel live check failed:");
  console.error("- Local env root override must stay inside the repository.");
  process.exit(1);
}
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const releaseChannelGuidance = {
  GROOVEFORGE_DISTRIBUTION_CHANNEL: "allowed release channel token",
  GROOVEFORGE_RELEASE_DOWNLOAD_URL: "safe absolute HTTPS URL",
  GROOVEFORGE_RELEASE_NOTES_URL: "safe absolute HTTPS URL",
  GROOVEFORGE_SUPPORT_URL: "safe absolute HTTPS URL"
};
const placeholderPattern = /^(|<[^>]+>|CHANGE_ME|REPLACE_ME|TODO|TBD|example|example-.+|your-.+|https:\/\/example\.com.*)$/i;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release-channel live check failed:");
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
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
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
  return /^(direct-download|private-beta|managed-release)$/.test(value);
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

async function readLocalEnvEntries() {
  const entries = [];
  for (const filePath of localEnvCandidatePaths()) {
    if (!existsSync(filePath)) {
      continue;
    }
    const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      const parsed = parseEnvLine(line);
      if (!parsed || !releaseChannelMetadataKeys.includes(parsed.key)) {
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

function buildRows({ localEntries, localEnvInput, editTarget }) {
  const placeholderKeys = new Set(localEnvInput.placeholderKeys.filter((key) => releaseChannelMetadataKeys.includes(key)));
  const firstEntryByKey = new Map();
  for (const entry of localEntries) {
    if (!firstEntryByKey.has(entry.key)) {
      firstEntryByKey.set(entry.key, entry);
    }
  }

  return releaseChannelMetadataKeys.map((key, index) => {
    const entry = firstEntryByKey.get(key) ?? null;
    const value = entry?.value?.trim() ?? "";
    const present = value.length > 0;
    const placeholder = present && (placeholderKeys.has(key) || isPlaceholderValue(value));
    const kind = key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" ? "channel" : "url";
    const shapeReady = present && !placeholder && (kind === "channel" ? channelShapeReady(value) : safeHttpsUrlShapeReady(value));
    return {
      order: index + 1,
      key,
      kind,
      present,
      placeholder,
      shapeReady,
      currentReady: present && placeholder === false && shapeReady === true,
      expectedShape: releaseChannelGuidance[key],
      editTarget: entry?.file ?? editTarget,
      line: entry?.line ?? null,
      proofCommand: "npm run release:channel-live-check",
      rerunCommand: "npm run release:doctor",
      sourceField: "local .env distribution metadata",
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

function buildStrictFailureRows(rows) {
  return rows
    .filter((row) => row.currentReady !== true)
    .map((row) => ({
      key: row.key,
      present: row.present,
      placeholder: row.placeholder,
      shapeReady: row.shapeReady,
      editTarget: row.editTarget,
      line: row.line,
      expectedShape: row.expectedShape,
      proofCommand: "npm run release:channel-live-check-strict",
      nonStrictProofCommand: "npm run release:channel-live-check",
      valueRecorded: false
    }));
}

function formatRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| 0 | none | none | no | no | no | no | none | none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.kind)} | ${readyLabel(row.present)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${readyLabel(row.currentReady)} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "none")} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatStrictFailureRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | yes | no | yes | none | none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.key)} | ${readyLabel(row.present)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "none")} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.nonStrictProofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
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
  return `# ${appName} Release-Channel Live Check

## Summary

- Strict mode: ${readyLabel(report.strictMode)}
- Strict ready: ${readyLabel(report.strictReady)}
- Strict exit code: ${report.strictExitCode}
- Strict failure rows: ${report.strictFailureRowCount}
- Live check ready: ${readyLabel(report.releaseChannelLiveCheckReady)}
- Current env edit target: ${report.currentEnvEditTarget}
- Current required keys: ${report.currentRequiredKeyCount}
- Current ready rows: ${report.releaseChannelLiveCheckCurrentReadyCount}/${report.releaseChannelLiveCheckRowCount}
- Current placeholder keys: ${report.currentPlaceholderKeyCount}
- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount}
- Doctor command: \`${report.doctorCommand}\`
- Current blocker command: \`${report.currentBlockerCommand}\`
- Next-actions command: \`${report.nextActionsCommand}\`
- Proof bundle command: \`${report.proofBundleCommand}\`
- Progress command: \`${report.progressCommand}\`
- Hard gate command: \`${report.hardGateCommand}\`
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- External distribution claimed: no

## Current Metadata Rows

| order | key | kind | present | placeholder | shape ready | current ready | expected shape | edit target | line | proof command | rerun command | value recorded |
|---:|---|---|---:|---:|---:|---:|---|---|---:|---|---|---:|
${formatRows(report.releaseChannelLiveCheckRows)}

## Strict Failure Rows

| key | present | placeholder | shape ready | expected shape | edit target | line | strict command | non-strict command | value recorded |
|---|---:|---:|---:|---|---|---:|---|---|---:|
${formatStrictFailureRows(report.strictFailureRows)}

## Current Placeholder Edit Locations

| key | file | line | placeholder | value recorded |
|---|---|---:|---:|---:|
${formatLocations(report.currentPlaceholderEditLocations)}

## Not Claimed

This live check does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, release upload, remote channel probing, app-store submission, or external distribution completion.
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
    const currentEnvEditTarget = currentLocalEnvEditTarget(localEnvInput);
    const rows = buildRows({ localEntries, localEnvInput, editTarget: currentEnvEditTarget });
    const currentPlaceholderKeys = rows.filter((row) => row.placeholder === true).map((row) => row.key);
    const currentPlaceholderEditLocations = buildPlaceholderEditLocations(rows);
    const currentReadyCount = rows.filter((row) => row.currentReady === true).length;
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
      syntheticBlockedSmoke: selectedArtifact.syntheticBlockedSmoke,
      reportCommand: selectedArtifact.command,
      releaseChannelLiveCheckMarkdownArtifactName: selectedArtifact.markdownName,
      releaseChannelLiveCheckJsonArtifactName: selectedArtifact.jsonName,
      releaseChannelLiveCheckMarkdownPath: relative(markdownPath),
      releaseChannelLiveCheckJsonPath: relative(jsonPath),
      localEnvRootOverrideEnabled: Boolean(localEnvRootOverride),
      localEnvRootRelativePath: localEnvRootOverride ? relativeLocalEnvRoot : ".",
      realLocalEnvRead: resolvedLocalEnvRoot === root,
      realLocalEnvModified: false,
      releaseChannelLiveCheckReady: currentReadyCount === rows.length && rows.every((row) => row.valueRecorded === false),
      releaseChannelLiveCheckCurrentReadyCount: currentReadyCount,
      releaseChannelLiveCheckRowCount: rows.length,
      releaseChannelLiveCheckRows: rows,
      releaseChannelLiveCheckSummary: `${currentReadyCount}/${rows.length} current release-channel metadata rows ready`,
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
      currentRequiredKeyCount: releaseChannelMetadataKeys.length,
      currentRequiredKeys: releaseChannelMetadataKeys,
      currentPlaceholderKeyCount: currentPlaceholderKeys.length,
      currentPlaceholderKeys,
      currentPlaceholderEditLocationCount: currentPlaceholderEditLocations.length,
      currentPlaceholderEditLocationSummary:
        currentPlaceholderEditLocations.length > 0 ? `${currentPlaceholderEditLocations.length} current placeholder edit locations` : "none",
      currentPlaceholderEditLocations,
      strictReady: currentReadyCount === rows.length && rows.every((row) => row.valueRecorded === false),
      strictExitCode: currentReadyCount === rows.length && rows.every((row) => row.valueRecorded === false) ? 0 : 1,
      strictFailureRowCount: buildStrictFailureRows(rows).length,
      strictFailureRows: buildStrictFailureRows(rows),
      strictFailureSummary:
        currentReadyCount === rows.length
          ? "all current release-channel metadata rows are strict-ready"
          : `${rows.length - currentReadyCount} current release-channel metadata rows are not strict-ready`,
      strictFailureReason:
        currentReadyCount === rows.length
          ? "none"
          : "strict mode requires all four current release-channel metadata rows to be present, non-placeholder, and shape-ready",
      currentReadyKeyCount: currentReadyCount,
      currentReadyKeys: rows.filter((row) => row.currentReady === true).map((row) => row.key),
      doctorCommand: "npm run release:doctor",
      nextActionsCommand: "npm run release:next-actions",
      currentBlockerCommand: "npm run release:current-blocker",
      proofBundleCommand: "npm run release:proof-bundle",
      progressCommand: "npm run release:progress-smoke",
      hardGateCommand: "npm run release:external-check",
      privateValuesRecorded: false,
      networkProbeAttempted: false,
      releaseUploadAttempted: false,
      notarySubmissionAttempted: false,
      signingAttempted: false,
      releaseGateClaimedExternalDistribution: false,
      valueRecorded: false
    };

    check(report.appName === appName, "release-channel live check should identify GrooveForge");
    check(report.bundleId === bundleId, `release-channel live check should identify ${bundleId}`);
    check(report.sourceMode === selectedArtifact.sourceMode, "release-channel live check source mode should match artifact mode");
    check(report.reportCommand === selectedArtifact.command, "release-channel live check report command should match artifact mode");
    check(report.releaseChannelLiveCheckRowCount === releaseChannelMetadataKeys.length, "release-channel live check should cover four metadata rows");
    check(releaseChannelMetadataKeys.every((key) => rows.some((row) => row.key === key)), "release-channel live check should cover current release-channel keys");
    check(rows.every((row) => row.valueRecorded === false), "release-channel live check rows should not record values");
    check(rows.every((row) => typeof row.expectedShape === "string" && row.expectedShape.length > 0), "release-channel live check rows should include expected shapes");
    check(rows.every((row) => row.proofCommand === "npm run release:channel-live-check"), "release-channel live check rows should point at the live check command");
    check(rows.every((row) => row.rerunCommand === "npm run release:doctor"), "release-channel live check rows should rerun release doctor after edits");
    check(report.currentRequiredKeyCount === releaseChannelMetadataKeys.length, "release-channel live check should list four current required keys");
    check(report.releaseChannelLiveCheckMarkdownArtifactName === selectedArtifact.markdownName, "release-channel live check Markdown artifact name should match mode");
    check(report.releaseChannelLiveCheckJsonArtifactName === selectedArtifact.jsonName, "release-channel live check JSON artifact name should match mode");
    check(report.currentPlaceholderKeyCount === report.currentPlaceholderKeys.length, "release-channel live check placeholder count should match keys");
    check(report.currentPlaceholderEditLocationCount === report.currentPlaceholderEditLocations.length, "release-channel live check placeholder edit location count should match rows");
    check(report.currentPlaceholderEditLocations.every((row) => row.valueRecorded === false), "release-channel live check placeholder edit locations should not record values");
    check(report.strictReady === report.releaseChannelLiveCheckReady, "release-channel strict readiness should mirror live-check readiness");
    check(report.strictExitCode === (report.strictReady ? 0 : 1), "release-channel strict exit code should match strict readiness");
    check(report.strictFailureRowCount === report.strictFailureRows.length, "release-channel strict failure row count should match rows");
    check(report.strictFailureRows.every((row) => row.valueRecorded === false), "release-channel strict failure rows should not record values");
    check(
      report.strictFailureRows.every((row) => row.proofCommand === "npm run release:channel-live-check-strict"),
      "release-channel strict failure rows should point at the strict command"
    );
    check(
      report.strictFailureRows.every((row) => row.nonStrictProofCommand === "npm run release:channel-live-check"),
      "release-channel strict failure rows should point at the non-strict evidence command"
    );
    check(report.localEnvValueRecorded === false, "release-channel live check should not record local env values");
    check(report.privateValuesRecorded === false, "release-channel live check should not record private values");
    check(report.realLocalEnvModified === false, "release-channel live check should not modify real local env");
    check(report.syntheticSuccessSmoke === selectedArtifact.syntheticSuccessSmoke, "release-channel live check synthetic smoke flag should match artifact mode");
    check(report.syntheticBlockedSmoke === selectedArtifact.syntheticBlockedSmoke, "release-channel live check synthetic blocked smoke flag should match artifact mode");
    check(!report.syntheticBlockedSmoke || report.strictReady === false, "release-channel strict blocked smoke should stay blocked");
    check(!report.syntheticBlockedSmoke || report.strictFailureRowCount === releaseChannelMetadataKeys.length, "release-channel strict blocked smoke should include four strict failure rows");
    check(report.networkProbeAttempted === false, "release-channel live check should not probe the network");
    check(report.releaseUploadAttempted === false, "release-channel live check should not upload releases");
    check(report.notarySubmissionAttempted === false, "release-channel live check should not submit to Apple");
    check(report.signingAttempted === false, "release-channel live check should not sign artifacts");
    check(report.releaseGateClaimedExternalDistribution === false, "release-channel live check should not claim external distribution");

    const markdown = buildMarkdown(report);
    const json = `${JSON.stringify(report, null, 2)}\n`;
    const combinedOutput = `${markdown}\n${json}`;
    for (const value of privateValues(localEntries)) {
      check(!combinedOutput.includes(value), "release-channel live check should not include private or placeholder values");
    }
    check(!/https?:\/\//i.test(combinedOutput), "release-channel live check should not include URL values");
    check(markdown.includes("Current Metadata Rows"), "release-channel live check Markdown should include metadata rows");
    check(markdown.includes("Strict Failure Rows"), "release-channel live check Markdown should include strict failure rows");
    check(markdown.includes("Current Placeholder Edit Locations"), "release-channel live check Markdown should include placeholder edit locations");
    check(markdown.includes("Private values recorded: no"), "release-channel live check Markdown should state value redaction");

    if (failures.length > 0) {
      fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
    }

    await mkdir(packageRoot, { recursive: true });
    await writeFile(markdownPath, markdown, "utf8");
    await writeFile(jsonPath, json, "utf8");

    if (strictMode && !report.strictReady) {
      console.error("GrooveForge release-channel live check strict failed.");
      console.error(`- Markdown: ${relative(markdownPath)}`);
      console.error(`- JSON: ${relative(jsonPath)}`);
      console.error(`- Live check ready: ${report.releaseChannelLiveCheckReady ? "yes" : "no"}`);
      console.error(`- Strict failure rows: ${report.strictFailureRowCount}`);
      console.error(`- Current ready rows: ${report.releaseChannelLiveCheckCurrentReadyCount}/${report.releaseChannelLiveCheckRowCount}`);
      console.error(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
      console.error(`- Current env edit target: ${report.currentEnvEditTarget}`);
      console.error(`- Retry after private edits: ${report.reportCommand}`);
      console.error("- Private values recorded: no");
      console.error("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
      console.error("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
      process.exit(1);
    }

    if (strictMode) {
      console.log("GrooveForge release-channel live check strict passed.");
    } else {
      console.log("GrooveForge release-channel live check passed.");
    }
    console.log(`- Markdown: ${relative(markdownPath)}`);
    console.log(`- JSON: ${relative(jsonPath)}`);
    console.log(`- Source mode: ${report.sourceMode}`);
    console.log(`- Strict mode: ${report.strictMode ? "yes" : "no"}`);
    console.log(`- Strict ready: ${report.strictReady ? "yes" : "no"}`);
    console.log(`- Live check ready: ${report.releaseChannelLiveCheckReady ? "yes" : "no"}`);
    console.log(`- Current ready rows: ${report.releaseChannelLiveCheckCurrentReadyCount}/${report.releaseChannelLiveCheckRowCount}`);
    console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
    console.log(`- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount}`);
    console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
    console.log(`- Doctor command: ${report.doctorCommand}`);
    console.log(`- Current blocker command: ${report.currentBlockerCommand}`);
    console.log("- Private values recorded: no");
    console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
    console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
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
