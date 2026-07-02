#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionLocalEnvDefaults, distributionPrivateInputKeys } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const args = process.argv.slice(2);
const force = args.includes("--force");
const syntheticSuccessSmoke = args.includes("--success-smoke");
const syntheticPreflightSmoke = args.includes("--preflight-smoke");
const preflightOnly = args.includes("--preflight") || syntheticPreflightSmoke;
const reportStem = syntheticSuccessSmoke
  ? "release-channel-apply-private-env-success-smoke"
  : syntheticPreflightSmoke
    ? "release-channel-apply-private-env-preflight-smoke"
    : preflightOnly
      ? "release-channel-apply-private-env-preflight"
  : "release-channel-apply-private-env";
const reportArtifactSuffixes = [
  "release-channel-apply-private-env.md",
  "release-channel-apply-private-env.json",
  "release-channel-apply-private-env-success-smoke.md",
  "release-channel-apply-private-env-success-smoke.json",
  "release-channel-apply-private-env-preflight.md",
  "release-channel-apply-private-env-preflight.json",
  "release-channel-apply-private-env-preflight-smoke.md",
  "release-channel-apply-private-env-preflight-smoke.json"
];
const configuredLocalEnvFileKey = "GROOVEFORGE_DISTRIBUTION_ENV_FILE";
const notClaimedSummary =
  "Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion";
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const localEnvRootOverride = process.env.GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT?.trim() ?? "";
const resolvedLocalEnvRoot = localEnvRootOverride ? path.resolve(root, localEnvRootOverride) : root;
const relativeLocalEnvRoot = path.relative(root, resolvedLocalEnvRoot);
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const privateEnvApplyPreflightCommand = "npm run release:channel-apply-private-env-preflight";
const privateEnvApplyCommand = "npm run release:channel-apply-private-env";
const guidedSetupFallbackCommand = "npm run release:channel-setup-wizard";
const strictFirstProofCommand = "npm run release:channel-live-check-strict";
const strictOperatorProofCommand = "npm run release:private-edit-strict-proof";
const placeholderPattern = /^(|<[^>]+>|CHANGE_ME|REPLACE_ME|TODO|TBD|example|example-.+|your-.+|https:\/\/example\.com.*)$/i;
const failures = [];

if (localEnvRootOverride && (relativeLocalEnvRoot.startsWith("..") || path.isAbsolute(relativeLocalEnvRoot))) {
  console.error("GrooveForge release-channel private env apply failed:");
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

function displayLocalEnvTarget(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(resolvedLocalEnvRoot, filePath);
  const relativePath = path.relative(root, absolutePath);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.basename(absolutePath);
}

function localEnvCandidatePath() {
  const configuredPath = process.env[configuredLocalEnvFileKey]?.trim();
  if (configuredPath) {
    return path.isAbsolute(configuredPath) ? configuredPath : path.resolve(resolvedLocalEnvRoot, configuredPath);
  }
  return path.join(resolvedLocalEnvRoot, distributionLocalEnvDefaults.defaultEnvFileName);
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

function expectedShapeForKey(key) {
  return key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" ? "allowed release channel token" : "safe absolute HTTPS URL";
}

function quoteEnvValue(value) {
  const raw = String(value ?? "");
  if (/^[^\s#"'\\]+$/.test(raw)) {
    return raw;
  }
  return `"${raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function replaceLineValue(line, key, value) {
  const hasExport = line.trimStart().startsWith("export ");
  const prefix = hasExport ? "export " : "";
  return `${prefix}${key}=${quoteEnvValue(value)}`;
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

function parseEnvEntries(lines, filePath) {
  const entries = [];
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
      lineIndex: index,
      valueRecorded: false
    });
  }
  return entries;
}

function buildInputRows() {
  return releaseChannelMetadataKeys.map((key, index) => {
    const value = process.env[key]?.trim() ?? "";
    const inputPresent = value.length > 0;
    const inputPlaceholder = inputPresent && isPlaceholderValue(value);
    const inputShapeReady = inputPresent && inputPlaceholder === false && shapeReadyForKey(key, value);
    return {
      order: index + 1,
      key,
      inputPresent,
      inputPlaceholder,
      inputShapeReady,
      expectedShape: expectedShapeForKey(key),
      valueRecorded: false
    };
  });
}

function buildPlanRows({ inputRows, existingEntries, filePath, forceOverwrite }) {
  const entryByKey = new Map(existingEntries.map((entry) => [entry.key, entry]));
  return inputRows.map((inputRow) => {
    const existing = entryByKey.get(inputRow.key) ?? null;
    const previousPresent = Boolean(existing);
    const previousPlaceholder = previousPresent && isPlaceholderValue(existing.value);
    const previousShapeReady = previousPresent && previousPlaceholder === false && shapeReadyForKey(inputRow.key, existing.value);
    const previousCurrentReady = previousPresent && previousPlaceholder === false && previousShapeReady === true;
    const missingInputBlocker = inputRow.inputPresent !== true;
    const placeholderInputBlocker = inputRow.inputPlaceholder === true;
    const shapeInputBlocker = inputRow.inputPresent === true && inputRow.inputPlaceholder === false && inputRow.inputShapeReady !== true;
    const overwriteBlocked = previousCurrentReady === true && forceOverwrite !== true;
    const shouldApply =
      missingInputBlocker === false &&
      placeholderInputBlocker === false &&
      shapeInputBlocker === false &&
      overwriteBlocked === false;
    const skippedCurrent = overwriteBlocked === true;
    const blocked =
      missingInputBlocker === true ||
      placeholderInputBlocker === true ||
      shapeInputBlocker === true;
    return {
      ...inputRow,
      editTarget: existing?.file ?? displayLocalEnvTarget(filePath),
      line: existing?.line ?? null,
      previousPresent,
      previousPlaceholder,
      previousShapeReady,
      previousCurrentReady,
      forceOverwrite,
      shouldApply,
      skippedCurrent,
      blocked,
      action: blocked
        ? "blocked"
        : skippedCurrent
          ? "skipped-current"
          : previousPresent
            ? "replace-local-env-row"
            : "append-local-env-row",
      proofCommand: "npm run release:private-edit-strict-proof",
      firstProofCommand: "npm run release:channel-live-check-strict",
      valueRecorded: false
    };
  });
}

function remediationForPlanRow(row, localEnvFileLoaded) {
  if (localEnvFileLoaded !== true) {
    return "create-ignored-env-scaffold";
  }
  if (row.inputPresent !== true) {
    return "set-process-env";
  }
  if (row.inputPlaceholder === true) {
    return "replace-process-env-placeholder";
  }
  if (row.inputShapeReady !== true) {
    return "fix-process-env-shape";
  }
  if (row.skippedCurrent === true) {
    return "already-current";
  }
  if (row.shouldApply === true) {
    return "ready-to-apply";
  }
  return "review-input";
}

function nextCommandForRemediation(row, localEnvFileLoaded) {
  if (localEnvFileLoaded !== true) {
    return "npm run release:prepare-env";
  }
  if (row.inputPresent !== true || row.inputPlaceholder === true || row.inputShapeReady !== true) {
    return privateEnvApplyPreflightCommand;
  }
  return privateEnvApplyCommand;
}

function buildPreflightRemediationRows({ planRows, localEnvFileLoaded }) {
  return planRows.map((row) => ({
    order: row.order,
    key: row.key,
    inputPresent: row.inputPresent,
    inputPlaceholder: row.inputPlaceholder,
    inputShapeReady: row.inputShapeReady,
    expectedShape: row.expectedShape,
    localEnvFileLoaded,
    previousCurrentReady: row.previousCurrentReady,
    remediation: remediationForPlanRow(row, localEnvFileLoaded),
    nextCommand: nextCommandForRemediation(row, localEnvFileLoaded),
    writeCommand: privateEnvApplyCommand,
    guidedSetupFallbackCommand,
    proofCommand: strictOperatorProofCommand,
    valueRecorded: false
  }));
}

function buildProcessEnvInputChecklistRows(inputRows) {
  return inputRows.map((row) => ({
    order: row.order,
    key: row.key,
    inputSource: "process.env",
    inputPresent: row.inputPresent,
    inputPlaceholder: row.inputPlaceholder,
    inputShapeReady: row.inputShapeReady,
    expectedShape: row.expectedShape,
    preflightCommand: privateEnvApplyPreflightCommand,
    writeCommand: privateEnvApplyCommand,
    guidedSetupFallbackCommand,
    proofCommand: strictOperatorProofCommand,
    valueRecorded: false
  }));
}

function applyRowsToLines(lines, planRows, inputValues) {
  const nextLines = [...lines];
  let modified = false;
  for (const row of planRows) {
    if (row.shouldApply !== true) {
      continue;
    }
    const value = inputValues.get(row.key);
    if (typeof value !== "string") {
      continue;
    }
    if (Number.isInteger(row.line) && row.line > 0) {
      nextLines[row.line - 1] = replaceLineValue(nextLines[row.line - 1], row.key, value);
    } else {
      if (nextLines.length > 0 && nextLines.at(-1)?.trim() !== "") {
        nextLines.push("");
      }
      nextLines.push(`${row.key}=${quoteEnvValue(value)}`);
    }
    modified = true;
  }
  return { nextLines, modified };
}

function buildAfterRows(entries) {
  const entryByKey = new Map(entries.map((entry) => [entry.key, entry]));
  return releaseChannelMetadataKeys.map((key, index) => {
    const entry = entryByKey.get(key) ?? null;
    const present = Boolean(entry?.value?.trim());
    const placeholder = present && isPlaceholderValue(entry.value);
    const shapeReady = present && placeholder === false && shapeReadyForKey(key, entry.value);
    return {
      order: index + 1,
      key,
      present,
      placeholder,
      shapeReady,
      currentReady: present && placeholder === false && shapeReady === true,
      editTarget: entry?.file ?? displayLocalEnvTarget(localEnvCandidatePath()),
      line: entry?.line ?? null,
      valueRecorded: false
    };
  });
}

function privateValues({ inputValues, beforeEntries, afterEntries }) {
  const values = [];
  for (const value of inputValues.values()) {
    if (typeof value === "string" && value.trim().length >= 8) {
      values.push(value.trim());
    }
  }
  for (const entry of [...beforeEntries, ...afterEntries]) {
    if (typeof entry.value === "string" && entry.value.trim().length >= 8) {
      values.push(entry.value.trim());
    }
  }
  return [...new Set(values)];
}

function formatPlanRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${readyLabel(row.inputPresent)} | ${readyLabel(row.inputPlaceholder)} | ${readyLabel(row.inputShapeReady)} | ${readyLabel(row.previousPresent)} | ${readyLabel(row.previousPlaceholder)} | ${readyLabel(row.previousCurrentReady)} | ${escapeCell(row.action)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "append")} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatAfterRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${readyLabel(row.present)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${readyLabel(row.currentReady)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "none")} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatPreflightRemediationRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${readyLabel(row.inputPresent)} | ${readyLabel(row.inputPlaceholder)} | ${readyLabel(row.inputShapeReady)} | ${escapeCell(row.expectedShape)} | ${readyLabel(row.localEnvFileLoaded)} | ${escapeCell(row.remediation)} | \`${escapeCell(row.nextCommand)}\` | \`${escapeCell(row.writeCommand)}\` | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatProcessEnvInputChecklistRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.inputSource)} | ${readyLabel(row.inputPresent)} | ${readyLabel(row.inputPlaceholder)} | ${readyLabel(row.inputShapeReady)} | ${escapeCell(row.expectedShape)} | \`${escapeCell(row.preflightCommand)}\` | \`${escapeCell(row.writeCommand)}\` | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} Release-Channel Private Env Apply

## Summary

- Apply ready: ${readyLabel(report.releaseChannelPrivateEnvApplyReady)}
- Preflight only: ${readyLabel(report.preflightOnly)}
- Preflight ready: ${readyLabel(report.releaseChannelPrivateEnvApplyPreflightReady)}
- Synthetic success smoke: ${readyLabel(report.syntheticSuccessSmoke)}
- Synthetic preflight smoke: ${readyLabel(report.syntheticPreflightSmoke)}
- Force overwrite requested: ${readyLabel(report.forceOverwrite)}
- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}
- Local env modified: ${readyLabel(report.localEnvModified)}
- Real local env modified: ${readyLabel(report.realLocalEnvModified)}
- Would apply rows: ${report.wouldApplyKeyCount}
- Applied rows: ${report.appliedKeyCount}
- Skipped current rows: ${report.skippedCurrentKeyCount}
- Blocked rows: ${report.blockedKeyCount}
- Current ready rows after apply: ${report.currentReadyKeyCount}/${report.currentRequiredKeyCount}
- Current env edit target: ${report.currentEnvEditTarget}
- Current required keys: ${report.currentRequiredKeyCount} (${report.currentRequiredKeySummary})
- Current blocker after apply: ${report.currentFirstBlocker}
- Process env input checklist rows: ${report.processEnvInputChecklistRowCount}
- Preflight remediation rows: ${report.preflightRemediationRowCount}
- Next write command: \`${report.nextWriteCommand}\`
- Guided setup fallback command: \`${report.guidedSetupFallbackCommand}\`
- First strict proof command: \`${report.firstStrictProofCommand}\`
- Recommended operator proof chain: \`${report.recommendedOperatorProofCommand}\`
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- External distribution claimed: no

## Process Env Input Checklist

| order | key | input source | input present | input placeholder | input shape ready | expected shape | preflight command | write command | proof command | value recorded |
|---:|---|---|---:|---:|---:|---|---|---|---|---:|
${formatProcessEnvInputChecklistRows(report.processEnvInputChecklistRows)}

## Apply Plan Rows

| order | key | input present | input placeholder | input shape ready | previous present | previous placeholder | previous current ready | action | edit target | line | value recorded |
|---:|---|---:|---:|---:|---:|---:|---:|---|---|---:|---:|
${formatPlanRows(report.applyPlanRows)}

## Preflight Remediation Rows

| order | key | input present | input placeholder | input shape ready | expected shape | local env loaded | remediation | next command | write command | proof command | value recorded |
|---:|---|---:|---:|---:|---|---:|---|---|---|---|---:|
${formatPreflightRemediationRows(report.preflightRemediationRows)}

## After Apply Rows

| order | key | present | placeholder | shape ready | current ready | edit target | line | value recorded |
|---:|---|---:|---:|---:|---:|---|---:|---:|
${formatAfterRows(report.afterApplyRows)}

## Next Proof

Run \`${report.reportCommand}\`${report.preflightOnly ? ` first to verify process env readiness, then \`${report.nextWriteCommand}\` to write the ignored local env file.` : " to write the ignored local env file."} If interactive guidance is needed, run \`${report.guidedSetupFallbackCommand}\` as a separate fallback helper. Run \`${report.recommendedOperatorProofCommand}\` after the apply command reports 4/4 current-ready rows. The strict proof chain starts with \`${report.firstStrictProofCommand}\`, then runs the downstream post-edit proof, progress refresh, and private-value leak audit.

## Not Recorded

This report records key names, readiness booleans, row counts, file names, and line numbers only. It does not record release URLs, support URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, private beats, or real user audio.

## Not Claimed

This command does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function writeReport(report, privateValueCandidates) {
  const markdown = buildMarkdown(report);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const combined = `${markdown}\n${json}`;
  for (const value of privateValueCandidates) {
    check(!combined.includes(value), "release-channel private env apply report should not include private values");
  }
  check(!/https?:\/\//i.test(combined), "release-channel private env apply report should not include URL values");
  await mkdir(packageRoot, { recursive: true });
  await writeFile(markdownPath, markdown, "utf8");
  await writeFile(jsonPath, json, "utf8");
}

async function main() {
  const filePath = localEnvCandidatePath();
  const inputRows = buildInputRows();
  const processEnvInputChecklistRows = buildProcessEnvInputChecklistRows(inputRows);
  const inputValues = new Map(releaseChannelMetadataKeys.map((key) => [key, process.env[key]?.trim() ?? ""]));
  const localEnvFileLoaded = existsSync(filePath);
  const beforeText = localEnvFileLoaded ? await readFile(filePath, "utf8") : "";
  const beforeLines = beforeText.length > 0 ? beforeText.split(/\r?\n/) : [];
  const beforeEntries = localEnvFileLoaded ? parseEnvEntries(beforeLines, filePath) : [];
  const planRows = buildPlanRows({ inputRows, existingEntries: beforeEntries, filePath, forceOverwrite: force });
  const preflightRemediationRows = buildPreflightRemediationRows({ planRows, localEnvFileLoaded });
  const blockedRows = planRows.filter((row) => row.blocked === true);
  const applyAllowed = localEnvFileLoaded && blockedRows.length === 0;
  let afterLines = beforeLines;
  let localEnvModified = false;

  if (applyAllowed && preflightOnly === false) {
    const applied = applyRowsToLines(beforeLines, planRows, inputValues);
    afterLines = applied.nextLines;
    localEnvModified = applied.modified;
    if (localEnvModified) {
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, afterLines.join("\n").replace(/\n*$/, "\n"), "utf8");
    }
  }

  const afterText = localEnvFileLoaded ? await readFile(filePath, "utf8") : "";
  const afterEntries = localEnvFileLoaded ? parseEnvEntries(afterText.split(/\r?\n/), filePath) : [];
  const afterRows = buildAfterRows(afterEntries);
  const currentReadyKeyCount = afterRows.filter((row) => row.currentReady === true).length;
  const wouldApplyRows = planRows.filter((row) => row.shouldApply === true);
  const appliedRows = preflightOnly ? [] : planRows.filter((row) => row.shouldApply === true);
  const skippedCurrentRows = planRows.filter((row) => row.skippedCurrent === true);
  const currentPlaceholderKeys = afterRows.filter((row) => row.placeholder === true).map((row) => row.key);
  const privateValueCandidates = privateValues({ inputValues, beforeEntries, afterEntries });
  const preflightReady =
    preflightOnly === true &&
    localEnvFileLoaded === true &&
    blockedRows.length === 0 &&
    inputRows.every((row) => row.inputShapeReady === true) &&
    planRows.every((row) => row.shouldApply === true || row.skippedCurrent === true);
  const report = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: syntheticSuccessSmoke
      ? "npm run release:channel-apply-private-env-success-smoke"
      : syntheticPreflightSmoke
        ? "npm run release:channel-apply-private-env-preflight-smoke"
        : preflightOnly
          ? "npm run release:channel-apply-private-env-preflight"
      : "npm run release:channel-apply-private-env",
    releaseChannelPrivateEnvApplyMarkdownPath: relative(markdownPath),
    releaseChannelPrivateEnvApplyJsonPath: relative(jsonPath),
    syntheticSuccessSmoke,
    syntheticPreflightSmoke,
    preflightOnly,
    forceOverwrite: force,
    localEnvRootOverrideEnabled: Boolean(localEnvRootOverride),
    localEnvRootRelativePath: localEnvRootOverride ? relativeLocalEnvRoot : ".",
    localEnvFileLoaded,
    localEnvFilesChecked: [displayLocalEnvTarget(filePath)],
    localEnvPresentFiles: localEnvFileLoaded ? [displayLocalEnvTarget(filePath)] : [],
    currentEnvEditTarget: displayLocalEnvTarget(filePath),
    currentRequiredKeyCount: releaseChannelMetadataKeys.length,
    currentRequiredKeys: releaseChannelMetadataKeys,
    currentRequiredKeySummary: summarizeKeys(releaseChannelMetadataKeys),
    inputKeyCount: inputRows.length,
    inputReadyKeyCount: inputRows.filter((row) => row.inputShapeReady === true).length,
    inputMissingKeys: inputRows.filter((row) => row.inputPresent !== true).map((row) => row.key),
    inputPlaceholderKeys: inputRows.filter((row) => row.inputPlaceholder === true).map((row) => row.key),
    inputShapeInvalidKeys: inputRows.filter((row) => row.inputPresent === true && row.inputPlaceholder === false && row.inputShapeReady !== true).map((row) => row.key),
    processEnvInputChecklistRows,
    processEnvInputChecklistRowCount: processEnvInputChecklistRows.length,
    processEnvInputChecklistReadyCount: processEnvInputChecklistRows.filter((row) => row.inputShapeReady === true).length,
    processEnvInputChecklistMissingCount: processEnvInputChecklistRows.filter((row) => row.inputPresent !== true).length,
    processEnvInputChecklistPlaceholderCount: processEnvInputChecklistRows.filter((row) => row.inputPlaceholder === true).length,
    processEnvInputChecklistInvalidShapeCount: processEnvInputChecklistRows.filter(
      (row) => row.inputPresent === true && row.inputPlaceholder === false && row.inputShapeReady !== true
    ).length,
    applyPlanRows: planRows.map(({ lineIndex, ...row }) => row),
    applyPlanRowCount: planRows.length,
    wouldApplyKeyCount: wouldApplyRows.length,
    wouldApplyKeys: wouldApplyRows.map((row) => row.key),
    appliedKeyCount: appliedRows.length,
    appliedKeys: appliedRows.map((row) => row.key),
    skippedCurrentKeyCount: skippedCurrentRows.length,
    skippedCurrentKeys: skippedCurrentRows.map((row) => row.key),
    blockedKeyCount: blockedRows.length + (localEnvFileLoaded ? 0 : 1),
    blockedKeys: blockedRows.map((row) => row.key),
    afterApplyRows: afterRows,
    afterApplyRowCount: afterRows.length,
    currentReadyKeyCount,
    currentReadyKeys: afterRows.filter((row) => row.currentReady === true).map((row) => row.key),
    currentPlaceholderKeyCount: currentPlaceholderKeys.length,
    currentPlaceholderKeys,
    preflightRemediationRows,
    preflightRemediationRowCount: preflightRemediationRows.length,
    preflightRemediationMissingInputCount: preflightRemediationRows.filter((row) => row.inputPresent !== true).length,
    preflightRemediationPlaceholderInputCount: preflightRemediationRows.filter((row) => row.inputPlaceholder === true).length,
    preflightRemediationInvalidShapeCount: preflightRemediationRows.filter((row) => row.inputPresent === true && row.inputPlaceholder === false && row.inputShapeReady !== true).length,
    preflightRemediationReadyRowCount: preflightRemediationRows.filter((row) => row.remediation === "ready-to-apply" || row.remediation === "already-current").length,
    localEnvModified,
    realLocalEnvRead: resolvedLocalEnvRoot === root,
    realLocalEnvModified: resolvedLocalEnvRoot === root && localEnvModified === true,
    currentOperatorFirstCommand: privateEnvApplyPreflightCommand,
    nextWriteCommand: privateEnvApplyCommand,
    guidedSetupFallbackCommand,
    firstStrictProofCommand: strictFirstProofCommand,
    recommendedOperatorProofCommand: strictOperatorProofCommand,
    currentBlockerCommand: "npm run release:current-blocker",
    hardGateCommand: "npm run release:external-check",
    currentFirstBlocker:
      currentReadyKeyCount === releaseChannelMetadataKeys.length
        ? "none; current release-channel metadata rows are local strict-proof ready"
        : localEnvFileLoaded
          ? `Current release-channel metadata still has ${releaseChannelMetadataKeys.length - currentReadyKeyCount} non-ready rows.`
          : "Ignored local distribution env file is not loaded.",
    releaseChannelPrivateEnvApplyPreflightReady: preflightReady,
    releaseChannelPrivateEnvApplyReady:
      preflightOnly === false &&
      localEnvFileLoaded === true &&
      blockedRows.length === 0 &&
      currentReadyKeyCount === releaseChannelMetadataKeys.length &&
      afterRows.every((row) => row.valueRecorded === false),
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

  check(report.appName === appName, "release-channel private env apply should identify GrooveForge");
  check(report.bundleId === bundleId, `release-channel private env apply should identify ${bundleId}`);
  check(distributionLocalEnvDefaults.configuredFileKey === configuredLocalEnvFileKey, "release-channel private env apply should use the configured distribution env file key");
  check(reportArtifactSuffixes.includes(`${reportStem}.md`), "release-channel private env apply should use a documented Markdown artifact suffix");
  check(reportArtifactSuffixes.includes(`${reportStem}.json`), "release-channel private env apply should use a documented JSON artifact suffix");
  check(notClaimedSummary.startsWith("Not claimed:"), "release-channel private env apply should expose a not-claimed summary");
  check(report.currentRequiredKeyCount === 4, "release-channel private env apply should cover four metadata keys");
  check(report.inputKeyCount === 4, "release-channel private env apply should inspect four input keys");
  check(report.processEnvInputChecklistRowCount === 4, "release-channel private env apply should create four process env input checklist rows");
  check(report.processEnvInputChecklistRows.every((row) => row.inputSource === "process.env"), "release-channel private env apply checklist rows should identify process.env as the input source");
  check(report.processEnvInputChecklistRows.every((row) => row.valueRecorded === false), "release-channel private env apply checklist rows should be value-free");
  check(report.processEnvInputChecklistRows.every((row) => row.preflightCommand === privateEnvApplyPreflightCommand), "release-channel private env apply checklist rows should carry the preflight command");
  check(report.processEnvInputChecklistRows.every((row) => row.writeCommand === privateEnvApplyCommand), "release-channel private env apply checklist rows should carry the write command");
  check(report.processEnvInputChecklistRows.every((row) => row.proofCommand === strictOperatorProofCommand), "release-channel private env apply checklist rows should carry the proof command");
  check(report.applyPlanRowCount === 4, "release-channel private env apply should create four plan rows");
  check(report.preflightRemediationRowCount === 4, "release-channel private env apply should create four preflight remediation rows");
  check(report.afterApplyRowCount === 4 || report.localEnvFileLoaded === false, "release-channel private env apply should inspect four after rows when local env exists");
  check(report.applyPlanRows.every((row) => row.valueRecorded === false), "release-channel private env apply plan rows should be value-free");
  check(report.preflightRemediationRows.every((row) => row.valueRecorded === false), "release-channel private env apply preflight remediation rows should be value-free");
  check(report.preflightRemediationRows.every((row) => row.guidedSetupFallbackCommand === guidedSetupFallbackCommand), "release-channel private env apply should keep guided setup as a fallback command");
  check(report.currentOperatorFirstCommand === privateEnvApplyPreflightCommand, "release-channel private env apply should keep preflight as the current first operator command");
  check(report.nextWriteCommand === privateEnvApplyCommand, "release-channel private env apply should expose the private env write command");
  check(report.guidedSetupFallbackCommand === guidedSetupFallbackCommand, "release-channel private env apply should expose the guided setup fallback command separately");
  check(report.afterApplyRows.every((row) => row.valueRecorded === false), "release-channel private env apply after rows should be value-free");
  check(report.privateValuesRecorded === false, "release-channel private env apply should not record private values");
  check(report.localEnvValueRecorded === false, "release-channel private env apply should not record local env values");
  check(report.releaseUrlValueRecorded === false, "release-channel private env apply should not record release URL values");
  check(report.supportUrlValueRecorded === false, "release-channel private env apply should not record support URL values");
  check(report.channelValueRecorded === false, "release-channel private env apply should not record channel values");
  check(report.networkProbeAttempted === false, "release-channel private env apply should not probe networks");
  check(report.releaseUploadAttempted === false, "release-channel private env apply should not upload releases");
  check(report.notarySubmissionAttempted === false, "release-channel private env apply should not submit notarization");
  check(report.signingAttempted === false, "release-channel private env apply should not sign artifacts");
  check(report.releaseGateClaimedExternalDistribution === false, "release-channel private env apply should not claim external distribution");
  check(report.firstStrictProofCommand === strictFirstProofCommand, "release-channel private env apply should expose strict first proof");
  check(report.recommendedOperatorProofCommand === strictOperatorProofCommand, "release-channel private env apply should expose strict proof chain");
  if (syntheticSuccessSmoke) {
    check(report.localEnvRootOverrideEnabled === true, "release-channel apply success smoke should use a local env root override");
    check(report.realLocalEnvRead === false, "release-channel apply success smoke should not read the real local env");
    check(report.realLocalEnvModified === false, "release-channel apply success smoke should not modify the real local env");
    check(report.releaseChannelPrivateEnvApplyReady === true, "release-channel apply success smoke should prove ready apply");
    check(report.appliedKeyCount === 4, "release-channel apply success smoke should apply four keys");
    check(report.currentReadyKeyCount === 4, "release-channel apply success smoke should produce four current-ready rows");
    check(report.currentPlaceholderKeyCount === 0, "release-channel apply success smoke should clear placeholders");
  }
  if (syntheticPreflightSmoke) {
    check(report.localEnvRootOverrideEnabled === true, "release-channel apply preflight smoke should use a local env root override");
    check(report.preflightOnly === true, "release-channel apply preflight smoke should mark preflight-only mode");
    check(report.realLocalEnvRead === false, "release-channel apply preflight smoke should not read the real local env");
    check(report.localEnvModified === false, "release-channel apply preflight smoke should not modify local env");
    check(report.realLocalEnvModified === false, "release-channel apply preflight smoke should not modify the real local env");
    check(report.releaseChannelPrivateEnvApplyPreflightReady === true, "release-channel apply preflight smoke should prove ready inputs");
    check(report.releaseChannelPrivateEnvApplyReady === false, "release-channel apply preflight smoke should not claim apply completion");
    check(report.wouldApplyKeyCount === 4, "release-channel apply preflight smoke should identify four would-apply keys");
    check(report.appliedKeyCount === 0, "release-channel apply preflight smoke should not apply keys");
    check(report.currentReadyKeyCount === 0, "release-channel apply preflight smoke should not mutate placeholders into current-ready rows");
  }

  await writeReport(report, privateValueCandidates);

  const commandReady = preflightOnly ? report.releaseChannelPrivateEnvApplyPreflightReady : report.releaseChannelPrivateEnvApplyReady;
  if (failures.length > 0 || commandReady !== true) {
    console.error(preflightOnly ? "GrooveForge release-channel private env apply preflight failed." : "GrooveForge release-channel private env apply failed.");
    console.error(`- Markdown: ${relative(markdownPath)}`);
    console.error(`- JSON: ${relative(jsonPath)}`);
    console.error(`- Preflight only: ${report.preflightOnly ? "yes" : "no"}`);
    console.error(`- Preflight ready: ${report.releaseChannelPrivateEnvApplyPreflightReady ? "yes" : "no"}`);
    console.error(`- Local env file loaded: ${report.localEnvFileLoaded ? "yes" : "no"}`);
    console.error(`- Would apply rows: ${report.wouldApplyKeyCount}`);
    console.error(`- Applied rows: ${report.appliedKeyCount}`);
    console.error(`- Blocked rows: ${report.blockedKeyCount}`);
    console.error(`- Current ready rows: ${report.currentReadyKeyCount}/${report.currentRequiredKeyCount}`);
    console.error(`- Current env edit target: ${report.currentEnvEditTarget}`);
    console.error(`- Process env input checklist rows: ${report.processEnvInputChecklistRowCount}`);
    console.error(`- Preflight remediation rows: ${report.preflightRemediationRowCount}`);
    console.error(`- Missing input rows: ${report.preflightRemediationMissingInputCount}`);
    console.error(`- Placeholder input rows: ${report.preflightRemediationPlaceholderInputCount}`);
    console.error(`- Shape-invalid input rows: ${report.preflightRemediationInvalidShapeCount}`);
    console.error(`- Next write command: ${report.nextWriteCommand}`);
    console.error(`- Guided setup fallback: ${report.guidedSetupFallbackCommand}`);
    console.error(`- Next proof after apply: ${report.recommendedOperatorProofCommand}`);
    console.error("- Private values recorded: no");
    console.error("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
    console.error("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
    if (failures.length > 0) {
      for (const failure of failures) {
        console.error(`- ${failure}`);
      }
    }
    process.exit(1);
  }

  console.log(preflightOnly ? "GrooveForge release-channel private env apply preflight passed." : "GrooveForge release-channel private env apply passed.");
  console.log(`- Markdown: ${relative(markdownPath)}`);
  console.log(`- JSON: ${relative(jsonPath)}`);
  console.log(`- Preflight only: ${report.preflightOnly ? "yes" : "no"}`);
  console.log(`- Preflight ready: ${report.releaseChannelPrivateEnvApplyPreflightReady ? "yes" : "no"}`);
  console.log(`- Synthetic success smoke: ${report.syntheticSuccessSmoke ? "yes" : "no"}`);
  console.log(`- Synthetic preflight smoke: ${report.syntheticPreflightSmoke ? "yes" : "no"}`);
  console.log(`- Local env file loaded: ${report.localEnvFileLoaded ? "yes" : "no"}`);
  console.log(`- Local env modified: ${report.localEnvModified ? "yes" : "no"}`);
  console.log(`- Real local env modified: ${report.realLocalEnvModified ? "yes" : "no"}`);
  console.log(`- Would apply rows: ${report.wouldApplyKeyCount}`);
  console.log(`- Applied rows: ${report.appliedKeyCount}`);
  console.log(`- Skipped current rows: ${report.skippedCurrentKeyCount}`);
  console.log(`- Current ready rows: ${report.currentReadyKeyCount}/${report.currentRequiredKeyCount}`);
  console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
  console.log(`- Process env input checklist rows: ${report.processEnvInputChecklistRowCount}`);
  console.log(`- Preflight remediation rows: ${report.preflightRemediationRowCount}`);
  console.log(`- Missing input rows: ${report.preflightRemediationMissingInputCount}`);
  console.log(`- Placeholder input rows: ${report.preflightRemediationPlaceholderInputCount}`);
  console.log(`- Shape-invalid input rows: ${report.preflightRemediationInvalidShapeCount}`);
  console.log(`- Next write command: ${report.nextWriteCommand}`);
  console.log(`- Guided setup fallback: ${report.guidedSetupFallbackCommand}`);
  console.log(`- Next proof after apply: ${report.recommendedOperatorProofCommand}`);
  console.log("- Private values recorded: no");
  console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
  console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
}

await main();
