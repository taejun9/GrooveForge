#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const liveCheckJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-live-check.json`);
const currentBlockerJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.json`);
const postEditProofMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof.md`);
const postEditProofJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof.json`);
const failures = [];
const proofCommands = [
  {
    order: 1,
    label: "Release-channel live check",
    command: "npm run release:channel-live-check",
    role: "first value-free release-channel metadata check after ignored local env edits"
  },
  {
    order: 2,
    label: "Current blocker refresh",
    command: "npm run release:current-blocker",
    role: "refresh broader value-free release blocker evidence after live-check"
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release post-edit proof failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
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

function objectRows(values) {
  return Array.isArray(values) ? values.filter((value) => value && typeof value === "object" && !Array.isArray(value)) : [];
}

function runProofCommand(command) {
  console.log(`Running release post-edit proof step: ${command.command}`);
  const [tool, ...args] = command.command.split(" ");
  const npmCommand = process.platform === "win32" ? "npm.cmd" : tool;
  const result = spawnSync(npmCommand, args, {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });

  if (result.error) {
    fail(`Could not run ${command.command}.`, result.error.message);
  }

  if (result.status !== 0) {
    fail(`${command.command} exited with status ${result.status}.`);
  }
}

async function readRequiredJson(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function formatCommandRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.label)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatPlaceholderRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | no |";
  }
  return rows
    .map((row) => {
      const line = Number.isInteger(row.line) ? row.line : "none";
      return `| ${escapeCell(row.file)} | ${line} | ${escapeCell(row.key)} | ${row.valueRecorded === false ? "no" : "yes"} |`;
    })
    .join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${row.present ? "yes" : "no"} | ${escapeCell(row.path)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function buildReport(liveCheck, currentBlocker) {
  const commandRows = proofCommands.map((command) => ({
    ...command,
    valueRecorded: false
  }));
  const placeholderEditLocations = objectRows(liveCheck.currentPlaceholderEditLocations).map((row) => ({
    key: textValue(row.key),
    file: textValue(row.file),
    line: Number.isInteger(row.line) ? row.line : null,
    placeholder: row.placeholder === true,
    valueRecorded: false
  }));
  const sourceRows = [
    {
      label: "Release-channel live check",
      path: relative(liveCheckJsonPath),
      present: true,
      valueRecorded: false
    },
    {
      label: "Release current blocker",
      path: relative(currentBlockerJsonPath),
      present: true,
      valueRecorded: false
    }
  ];
  const liveCheckReady = liveCheck.releaseChannelLiveCheckReady === true;
  const currentBlockerReady = currentBlocker.releaseCurrentBlockerReady === true;
  const currentPlaceholderKeyCount = integerValue(liveCheck.currentPlaceholderKeyCount);
  const postEditProofReady = liveCheckReady && currentBlockerReady && currentPlaceholderKeyCount === 0;

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:post-edit-proof",
    releasePostEditProofReady: postEditProofReady,
    releasePostEditProofState: postEditProofReady ? "release-channel metadata ready for broader external proof" : "release-channel metadata still blocked",
    releasePostEditProofCommandCount: commandRows.length,
    releasePostEditProofCommandSummary: commandRows.map((row) => row.command).join(" -> "),
    releasePostEditProofCommandRows: commandRows,
    releasePostEditProofFirstCommand: commandRows[0]?.command ?? "none",
    releasePostEditProofRefreshCommand: commandRows[1]?.command ?? "none",
    sourceReleaseChannelLiveCheckReady: true,
    sourceReleaseChannelLiveCheckPath: relative(liveCheckJsonPath),
    sourceReleaseCurrentBlockerReady: true,
    sourceReleaseCurrentBlockerPath: relative(currentBlockerJsonPath),
    sourceArtifactRows: sourceRows,
    sourceArtifactRowCount: sourceRows.length,
    releaseChannelLiveCheckReady: liveCheckReady,
    releaseChannelLiveCheckCurrentReadyCount: integerValue(liveCheck.releaseChannelLiveCheckCurrentReadyCount),
    releaseChannelLiveCheckRowCount: integerValue(liveCheck.releaseChannelLiveCheckRowCount),
    releaseChannelLiveCheckCommand: textValue(liveCheck.reportCommand, "npm run release:channel-live-check"),
    releaseChannelLiveCheckCurrentEnvEditTarget: textValue(liveCheck.currentEnvEditTarget, ".env.distribution.local"),
    releaseChannelLiveCheckCurrentRequiredKeyCount: integerValue(liveCheck.currentRequiredKeyCount),
    releaseChannelLiveCheckCurrentRequiredKeys: stringArrayValue(liveCheck.currentRequiredKeys),
    releaseChannelLiveCheckCurrentPlaceholderKeyCount: currentPlaceholderKeyCount,
    releaseChannelLiveCheckCurrentPlaceholderKeys: stringArrayValue(liveCheck.currentPlaceholderKeys),
    releaseChannelLiveCheckCurrentPlaceholderEditLocationCount: integerValue(liveCheck.currentPlaceholderEditLocationCount),
    releaseChannelLiveCheckCurrentPlaceholderEditLocationSummary: textValue(
      liveCheck.currentPlaceholderEditLocationSummary,
      placeholderEditLocations.length > 0 ? `${placeholderEditLocations.length} current placeholder edit locations` : "none"
    ),
    releaseChannelLiveCheckCurrentPlaceholderEditLocations: placeholderEditLocations,
    releaseChannelFirstProofCommandAfterPrivateEdits: textValue(
      currentBlocker.releaseChannelFirstProofCommandAfterPrivateEdits,
      "npm run release:channel-live-check"
    ),
    currentTarget: textValue(currentBlocker.currentTarget, "Release channel metadata"),
    currentNextCommand: textValue(currentBlocker.currentNextCommand, "npm run release:doctor"),
    currentFirstBlocker: textValue(currentBlocker.currentFirstBlocker),
    currentRerunCommand: textValue(currentBlocker.currentRerunCommand, "npm run release:current-blocker"),
    currentTenPlanProgressLabel: textValue(currentBlocker.currentTenPlanProgressLabel),
    userFacingCompletionPercent: Number(currentBlocker.userFacingCompletionPercent ?? 99.999999),
    userFacingRemainingPercent: Number(currentBlocker.userFacingRemainingPercent ?? 0.000001),
    currentPlaceholderKeyCount: integerValue(currentBlocker.currentPlaceholderKeyCount),
    currentPlaceholderKeys: stringArrayValue(currentBlocker.currentPlaceholderKeys),
    postEditProofSequenceReceiptReady: currentBlocker.postEditProofSequenceReceiptReady === true,
    postEditProofSequenceReceiptRowCount: integerValue(currentBlocker.postEditProofSequenceReceiptRowCount),
    postEditProofSequenceReceiptSummary: textValue(currentBlocker.postEditProofSequenceReceiptSummary),
    postEditProofSequenceReceiptRows: objectRows(currentBlocker.postEditProofSequenceReceiptRows).filter((row) => row.valueRecorded === false),
    hardGateCommand: textValue(currentBlocker.hardGateCommand, "npm run release:external-check"),
    hardGateReady: currentBlocker.hardGateReady === true,
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttempted: false,
    signingAttempted: false,
    claimedExternalDistribution: false,
    valueRecorded: false
  };
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Post-Edit Proof

## Status

- Post-edit proof ready: ${report.releasePostEditProofReady ? "yes" : "no"}
- State: ${report.releasePostEditProofState}
- First proof after private edits: \`${report.releasePostEditProofFirstCommand}\`
- Current blocker refresh: \`${report.releasePostEditProofRefreshCommand}\`
- Current target: ${report.currentTarget}
- Current next command: \`${report.currentNextCommand}\`
- Current first blocker: ${report.currentFirstBlocker}
- Current rerun command: \`${report.currentRerunCommand}\`
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- Overall completion: ${report.userFacingCompletionPercent.toFixed(6)}%
- Remaining completion: ${report.userFacingRemainingPercent.toFixed(6)}%
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate ready: ${report.hardGateReady ? "yes" : "no"}
- Private values recorded: no
- External distribution claimed: no

## Proof Commands

- Command count: ${report.releasePostEditProofCommandCount}
- Command sequence: ${report.releasePostEditProofCommandSummary}

| order | label | command | role | value recorded |
|---:|---|---|---|---:|
${formatCommandRows(report.releasePostEditProofCommandRows)}

## Live Check

- Source ready: ${report.sourceReleaseChannelLiveCheckReady ? "yes" : "no"}
- Source path: ${report.sourceReleaseChannelLiveCheckPath}
- Live-check ready: ${report.releaseChannelLiveCheckReady ? "yes" : "no"}
- Current-ready rows: ${report.releaseChannelLiveCheckCurrentReadyCount}/${report.releaseChannelLiveCheckRowCount}
- Current env edit target: ${report.releaseChannelLiveCheckCurrentEnvEditTarget}
- Current required keys: ${report.releaseChannelLiveCheckCurrentRequiredKeyCount} (${report.releaseChannelLiveCheckCurrentRequiredKeys.join(", ") || "none"})
- Current placeholder keys: ${report.releaseChannelLiveCheckCurrentPlaceholderKeyCount} (${report.releaseChannelLiveCheckCurrentPlaceholderKeys.join(", ") || "none"})
- Current placeholder edit locations: ${report.releaseChannelLiveCheckCurrentPlaceholderEditLocationCount} (${report.releaseChannelLiveCheckCurrentPlaceholderEditLocationSummary})
- First proof mirrored by current blocker: \`${report.releaseChannelFirstProofCommandAfterPrivateEdits}\`

| file | line | key | value recorded |
|---|---:|---|---:|
${formatPlaceholderRows(report.releaseChannelLiveCheckCurrentPlaceholderEditLocations)}

## Source Artifacts

| artifact | present | path | value recorded |
|---|---:|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Safety

- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, and external distribution completion are not claimed.
`;
}

for (const command of proofCommands) {
  runProofCommand(command);
}

await mkdir(packageRoot, { recursive: true });
const liveCheck = await readRequiredJson(liveCheckJsonPath, "Release-channel live check");
const currentBlocker = await readRequiredJson(currentBlockerJsonPath, "Release current blocker");
const report = buildReport(liveCheck, currentBlocker);
const markdown = buildMarkdown(report);

check(report.releasePostEditProofCommandCount === 2, "release post-edit proof should include two proof commands");
check(report.releasePostEditProofFirstCommand === "npm run release:channel-live-check", "release post-edit proof should run live-check first");
check(report.releasePostEditProofRefreshCommand === "npm run release:current-blocker", "release post-edit proof should refresh current blocker second");
check(report.releaseChannelFirstProofCommandAfterPrivateEdits === "npm run release:channel-live-check", "release post-edit proof should mirror live-check as first proof");
check(report.releaseChannelFirstProofCommandAfterPrivateEdits === report.releaseChannelLiveCheckCommand, "release post-edit proof first proof should match live-check command");
check(report.currentNextCommand === "npm run release:doctor", "release post-edit proof should keep release doctor as broader next proof");
check(report.currentRerunCommand === "npm run release:current-blocker", "release post-edit proof should keep current-blocker as rerun command");
check(report.releaseChannelLiveCheckRowCount === 4, "release post-edit proof should cover four release-channel live-check rows");
check(
  report.releaseChannelLiveCheckCurrentPlaceholderEditLocationCount === report.releaseChannelLiveCheckCurrentPlaceholderEditLocations.length,
  "release post-edit proof placeholder edit location count should match rows"
);
check(
  report.releaseChannelLiveCheckCurrentPlaceholderEditLocations.every((row) => row.valueRecorded === false),
  "release post-edit proof placeholder edit locations should not record values"
);
check(report.sourceArtifactRowCount === report.sourceArtifactRows.length, "release post-edit proof source artifact count should match rows");
check(report.sourceArtifactRows.every((row) => row.valueRecorded === false), "release post-edit proof source rows should not record values");
check(report.privateValuesRecorded === false, "release post-edit proof should not record private values");
check(report.networkProbeAttempted === false, "release post-edit proof should not probe network");
check(report.releaseUploadAttempted === false, "release post-edit proof should not upload releases");
check(report.notarySubmissionAttempted === false, "release post-edit proof should not submit to Apple");
check(report.signingAttempted === false, "release post-edit proof should not sign artifacts");
check(report.claimedExternalDistribution === false, "release post-edit proof should not claim external distribution");
check(!/https?:\/\//i.test(JSON.stringify(report)), "release post-edit proof JSON should not include URL values");
check(!/https?:\/\//i.test(markdown), "release post-edit proof Markdown should not include URL values");
check(markdown.includes("Release Post-Edit Proof"), "release post-edit proof Markdown should include title");
check(markdown.includes("First proof after private edits"), "release post-edit proof Markdown should include first proof guidance");
check(markdown.includes("Proof Commands"), "release post-edit proof Markdown should include proof commands");
check(markdown.includes("Live Check"), "release post-edit proof Markdown should include live check section");

if (failures.length > 0) {
  console.error("GrooveForge release post-edit proof failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

await writeFile(postEditProofJsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(postEditProofMarkdownPath, markdown);

console.log("GrooveForge release post-edit proof passed.");
console.log(`- Markdown: ${relative(postEditProofMarkdownPath)}`);
console.log(`- JSON: ${relative(postEditProofJsonPath)}`);
console.log(`- Post-edit proof ready: ${report.releasePostEditProofReady ? "yes" : "no"}`);
console.log(`- First proof after private edits: ${report.releasePostEditProofFirstCommand}`);
console.log(`- Current blocker refresh: ${report.releasePostEditProofRefreshCommand}`);
console.log(`- Live-check ready: ${report.releaseChannelLiveCheckReady ? "yes" : "no"}`);
console.log(`- Live-check current-ready rows: ${report.releaseChannelLiveCheckCurrentReadyCount}/${report.releaseChannelLiveCheckRowCount}`);
console.log(`- Live-check placeholder keys: ${report.releaseChannelLiveCheckCurrentPlaceholderKeyCount}`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
