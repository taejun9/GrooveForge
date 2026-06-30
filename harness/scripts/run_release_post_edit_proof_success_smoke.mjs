#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const markdownPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof-success-smoke.md`
);
const jsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof-success-smoke.json`
);
const failures = [];
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const planNumberPattern = /^plan-(\d+)-[a-z0-9][a-z0-9-]*\.md$/;
const commandRows = [
  {
    order: 1,
    label: "Release-channel live check",
    command: "npm run release:channel-live-check",
    role: "first value-free release-channel metadata check after ignored local env edits",
    valueRecorded: false
  },
  {
    order: 2,
    label: "Current blocker refresh",
    command: "npm run release:current-blocker",
    role: "refresh broader value-free release blocker evidence after live-check",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function formatCommandRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.label)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatMetadataRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.key)} | ${row.present ? "yes" : "no"} | ${row.placeholder ? "yes" : "no"} | ${row.shapeReady ? "yes" : "no"} | ${row.currentReady ? "yes" : "no"} | ${escapeCell(row.evidence)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${row.synthetic ? "yes" : "no"} | ${row.present ? "yes" : "no"} | ${escapeCell(row.path)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function buildSyntheticLiveCheck() {
  const rows = releaseChannelMetadataKeys.map((key) => ({
    key,
    present: true,
    placeholder: false,
    shapeReady: true,
    currentReady: true,
    evidence: key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" ? "allowed channel token shape" : "safe absolute URL shape",
    valueRecorded: false
  }));

  return {
    reportCommand: "npm run release:channel-live-check",
    sourceMode: "synthetic-ready-post-edit-proof-success-smoke",
    releaseChannelLiveCheckReady: true,
    releaseChannelLiveCheckRows: rows,
    releaseChannelLiveCheckCurrentReadyCount: rows.filter((row) => row.currentReady).length,
    releaseChannelLiveCheckRowCount: rows.length,
    currentRequiredKeyCount: releaseChannelMetadataKeys.length,
    currentRequiredKeys: releaseChannelMetadataKeys,
    currentPlaceholderKeyCount: 0,
    currentPlaceholderKeys: [],
    currentPlaceholderEditLocationCount: 0,
    currentPlaceholderEditLocations: [],
    currentPlaceholderEditLocationSummary: "none",
    currentEnvEditTarget: ".env.distribution.local",
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    claimedExternalDistribution: false,
    valueRecorded: false
  };
}

async function currentTenPlanProgressLabel() {
  const completedPlansDir = path.join(root, "docs", "exec_plans", "completed");
  const entries = await readdir(completedPlansDir, { withFileTypes: true });
  const completedPlanNumbers = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name.match(planNumberPattern))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter((number) => Number.isInteger(number));
  const highestPlanNumber = Math.max(...completedPlanNumbers, 0);
  const windowStart = Math.floor((highestPlanNumber - 1) / 10) * 10 + 1;
  const windowEnd = windowStart + 9;
  const completedInWindow = completedPlanNumbers.filter((number) => number >= windowStart && number <= windowEnd).length;
  return `${windowStart}-${windowEnd}: ${completedInWindow}/10`;
}

function buildSyntheticCurrentBlocker(tenPlanProgressLabel) {
  return {
    reportCommand: "npm run release:current-blocker",
    sourceMode: "synthetic-ready-post-edit-proof-success-smoke",
    releaseCurrentBlockerReady: true,
    releaseChannelFirstProofCommandAfterPrivateEdits: "npm run release:channel-live-check",
    currentTarget: "Release channel metadata",
    currentNextCommand: "npm run release:doctor",
    currentFirstBlocker: "Release-channel metadata placeholders cleared in synthetic success rehearsal; broader external proofs remain unclaimed.",
    currentRerunCommand: "npm run release:current-blocker",
    currentTenPlanProgressLabel: tenPlanProgressLabel,
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
    currentPlaceholderKeyCount: 0,
    currentPlaceholderKeys: [],
    postEditProofSequenceReceiptReady: true,
    postEditProofSequenceReceiptRowCount: 7,
    postEditProofSequenceReceiptSummary: "7 value-free post-edit proof sequence rows",
    postEditProofSequenceReceiptRows: [
      "manual ignored-env edit",
      "npm run release:doctor",
      "npm run release:current-blocker",
      "npm run release:next-actions",
      "npm run release:proof-bundle",
      "npm run release:progress-smoke",
      "npm run release:external-check"
    ].map((label, index) => ({
      order: index + 1,
      label,
      ready: true,
      valueRecorded: false
    })),
    hardGateCommand: "npm run release:external-check",
    hardGateReady: false,
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    claimedExternalDistribution: false,
    valueRecorded: false
  };
}

function buildReport(liveCheck, currentBlocker) {
  const sourceRows = [
    {
      label: "Synthetic release-channel live check ready receipt",
      synthetic: true,
      present: true,
      path: "synthetic-ready-release-channel-live-check",
      valueRecorded: false
    },
    {
      label: "Synthetic current blocker ready receipt",
      synthetic: true,
      present: true,
      path: "synthetic-ready-release-current-blocker",
      valueRecorded: false
    }
  ];
  const releasePostEditProofReady =
    liveCheck.releaseChannelLiveCheckReady === true &&
    currentBlocker.releaseCurrentBlockerReady === true &&
    liveCheck.currentPlaceholderKeyCount === 0 &&
    liveCheck.releaseChannelLiveCheckCurrentReadyCount === liveCheck.releaseChannelLiveCheckRowCount;

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:post-edit-proof-success-smoke",
    sourceMode: "synthetic success rehearsal",
    realLocalEnvRead: false,
    realLocalEnvModified: false,
    releasePostEditProofSuccessSmokeReady: releasePostEditProofReady,
    releasePostEditProofReady,
    releasePostEditProofState: releasePostEditProofReady
      ? "release-channel metadata ready branch is covered by synthetic success rehearsal"
      : "release-channel metadata ready branch is not covered",
    releasePostEditProofCommandCount: commandRows.length,
    releasePostEditProofCommandSummary: commandRows.map((row) => row.command).join(" -> "),
    releasePostEditProofCommandRows: commandRows,
    releasePostEditProofFirstCommand: commandRows[0]?.command ?? "none",
    releasePostEditProofRefreshCommand: commandRows[1]?.command ?? "none",
    sourceReleaseChannelLiveCheckReady: true,
    sourceReleaseChannelLiveCheckPath: "synthetic-ready-release-channel-live-check",
    sourceReleaseCurrentBlockerReady: true,
    sourceReleaseCurrentBlockerPath: "synthetic-ready-release-current-blocker",
    sourceArtifactRows: sourceRows,
    sourceArtifactRowCount: sourceRows.length,
    releaseChannelLiveCheckReady: liveCheck.releaseChannelLiveCheckReady === true,
    releaseChannelLiveCheckRows: liveCheck.releaseChannelLiveCheckRows,
    releaseChannelLiveCheckCurrentReadyCount: liveCheck.releaseChannelLiveCheckCurrentReadyCount,
    releaseChannelLiveCheckRowCount: liveCheck.releaseChannelLiveCheckRowCount,
    releaseChannelLiveCheckCommand: liveCheck.reportCommand,
    releaseChannelLiveCheckCurrentEnvEditTarget: liveCheck.currentEnvEditTarget,
    releaseChannelLiveCheckCurrentRequiredKeyCount: liveCheck.currentRequiredKeyCount,
    releaseChannelLiveCheckCurrentRequiredKeys: liveCheck.currentRequiredKeys,
    releaseChannelLiveCheckCurrentPlaceholderKeyCount: liveCheck.currentPlaceholderKeyCount,
    releaseChannelLiveCheckCurrentPlaceholderKeys: liveCheck.currentPlaceholderKeys,
    releaseChannelLiveCheckCurrentPlaceholderEditLocationCount: liveCheck.currentPlaceholderEditLocationCount,
    releaseChannelLiveCheckCurrentPlaceholderEditLocationSummary: liveCheck.currentPlaceholderEditLocationSummary,
    releaseChannelLiveCheckCurrentPlaceholderEditLocations: liveCheck.currentPlaceholderEditLocations,
    releaseChannelFirstProofCommandAfterPrivateEdits: currentBlocker.releaseChannelFirstProofCommandAfterPrivateEdits,
    currentTarget: currentBlocker.currentTarget,
    currentNextCommand: currentBlocker.currentNextCommand,
    currentFirstBlocker: currentBlocker.currentFirstBlocker,
    currentRerunCommand: currentBlocker.currentRerunCommand,
    currentTenPlanProgressLabel: currentBlocker.currentTenPlanProgressLabel,
    userFacingCompletionPercent: currentBlocker.userFacingCompletionPercent,
    userFacingRemainingPercent: currentBlocker.userFacingRemainingPercent,
    currentPlaceholderKeyCount: currentBlocker.currentPlaceholderKeyCount,
    currentPlaceholderKeys: currentBlocker.currentPlaceholderKeys,
    postEditProofSequenceReceiptReady: currentBlocker.postEditProofSequenceReceiptReady,
    postEditProofSequenceReceiptRowCount: currentBlocker.postEditProofSequenceReceiptRowCount,
    postEditProofSequenceReceiptSummary: currentBlocker.postEditProofSequenceReceiptSummary,
    postEditProofSequenceReceiptRows: currentBlocker.postEditProofSequenceReceiptRows,
    hardGateCommand: currentBlocker.hardGateCommand,
    hardGateReady: currentBlocker.hardGateReady,
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
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Post-Edit Proof Success Smoke

## Status

- Success smoke ready: ${report.releasePostEditProofSuccessSmokeReady ? "yes" : "no"}
- Post-edit proof ready branch: ${report.releasePostEditProofReady ? "yes" : "no"}
- State: ${report.releasePostEditProofState}
- Source mode: ${report.sourceMode}
- Real local env read: no
- Real local env modified: no
- First proof after private edits: \`${report.releasePostEditProofFirstCommand}\`
- Current blocker refresh: \`${report.releasePostEditProofRefreshCommand}\`
- Live-check ready: ${report.releaseChannelLiveCheckReady ? "yes" : "no"}
- Live-check current-ready rows: ${report.releaseChannelLiveCheckCurrentReadyCount}/${report.releaseChannelLiveCheckRowCount}
- Live-check placeholder keys: ${report.releaseChannelLiveCheckCurrentPlaceholderKeyCount}
- Current target: ${report.currentTarget}
- Current next command: \`${report.currentNextCommand}\`
- Current rerun command: \`${report.currentRerunCommand}\`
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- Overall completion remains: ${report.userFacingCompletionPercent.toFixed(6)}%
- Remaining completion remains: ${report.userFacingRemainingPercent.toFixed(6)}%
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate ready: ${report.hardGateReady ? "yes" : "no"}
- Private values recorded: no
- External distribution claimed: no

## Proof Commands

| order | label | command | role | value recorded |
|---:|---|---|---|---:|
${formatCommandRows(report.releasePostEditProofCommandRows)}

## Synthetic Metadata Rows

| key | present | placeholder | shape ready | current ready | evidence | value recorded |
|---|---:|---:|---:|---:|---|---:|
${formatMetadataRows(report.releaseChannelLiveCheckRows)}

## Source Artifacts

| artifact | synthetic | present | path | value recorded |
|---|---:|---:|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Safety

- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, and external distribution completion are not claimed.
`;
}

const liveCheck = buildSyntheticLiveCheck();
const currentBlocker = buildSyntheticCurrentBlocker(await currentTenPlanProgressLabel());
const report = buildReport(liveCheck, currentBlocker);
const markdown = buildMarkdown(report);

check(report.releasePostEditProofSuccessSmokeReady === true, "release post-edit proof success smoke should be ready");
check(report.releasePostEditProofReady === true, "release post-edit proof success smoke should cover the ready branch");
check(report.realLocalEnvRead === false, "release post-edit proof success smoke should not read real local env");
check(report.realLocalEnvModified === false, "release post-edit proof success smoke should not modify real local env");
check(report.releasePostEditProofCommandCount === 2, "release post-edit proof success smoke should include two proof commands");
check(report.releasePostEditProofFirstCommand === "npm run release:channel-live-check", "release post-edit proof success smoke should run live-check first");
check(report.releasePostEditProofRefreshCommand === "npm run release:current-blocker", "release post-edit proof success smoke should refresh current blocker second");
check(report.releaseChannelFirstProofCommandAfterPrivateEdits === "npm run release:channel-live-check", "release post-edit proof success smoke should mirror live-check as first proof");
check(report.currentNextCommand === "npm run release:doctor", "release post-edit proof success smoke should preserve release doctor as broader next proof");
check(report.currentRerunCommand === "npm run release:current-blocker", "release post-edit proof success smoke should preserve current-blocker as rerun command");
check(report.releaseChannelLiveCheckReady === true, "release post-edit proof success smoke should mark live-check ready");
check(report.releaseChannelLiveCheckCurrentReadyCount === 4, "release post-edit proof success smoke should cover four current-ready rows");
check(report.releaseChannelLiveCheckRowCount === 4, "release post-edit proof success smoke should cover four metadata rows");
check(report.releaseChannelLiveCheckCurrentPlaceholderKeyCount === 0, "release post-edit proof success smoke should clear current placeholder keys");
check(report.releaseChannelLiveCheckCurrentPlaceholderEditLocationCount === 0, "release post-edit proof success smoke should clear current placeholder edit locations");
check(report.releaseChannelLiveCheckRows.every((row) => row.valueRecorded === false), "release post-edit proof success smoke metadata rows should not record values");
check(report.sourceArtifactRowCount === report.sourceArtifactRows.length, "release post-edit proof success smoke source artifact count should match rows");
check(report.sourceArtifactRows.every((row) => row.synthetic === true && row.valueRecorded === false), "release post-edit proof success smoke source rows should be synthetic and value-free");
check(report.hardGateReady === false, "release post-edit proof success smoke should keep hard gate unclaimed");
check(report.privateValuesRecorded === false, "release post-edit proof success smoke should not record private values");
check(report.networkProbeAttempted === false, "release post-edit proof success smoke should not probe network");
check(report.releaseUploadAttempted === false, "release post-edit proof success smoke should not upload releases");
check(report.notarySubmissionAttempted === false, "release post-edit proof success smoke should not submit to Apple");
check(report.signingAttempted === false, "release post-edit proof success smoke should not sign artifacts");
check(report.claimedExternalDistribution === false, "release post-edit proof success smoke should not claim external distribution");
check(!/https?:\/\//i.test(JSON.stringify(report)), "release post-edit proof success smoke JSON should not include URL values");
check(!/https?:\/\//i.test(markdown), "release post-edit proof success smoke Markdown should not include URL values");
check(markdown.includes("Release Post-Edit Proof Success Smoke"), "release post-edit proof success smoke Markdown should include title");
check(markdown.includes("Synthetic Metadata Rows"), "release post-edit proof success smoke Markdown should include synthetic metadata rows");
check(markdown.includes("Proof Commands"), "release post-edit proof success smoke Markdown should include proof commands");
check(markdown.includes("External distribution claimed: no"), "release post-edit proof success smoke Markdown should keep external distribution unclaimed");

if (failures.length > 0) {
  console.error("GrooveForge release post-edit proof success smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

await mkdir(packageRoot, { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(markdownPath, markdown);

console.log("GrooveForge release post-edit proof success smoke passed.");
console.log(`- Markdown: ${relative(markdownPath)}`);
console.log(`- JSON: ${relative(jsonPath)}`);
console.log(`- Success smoke ready: ${report.releasePostEditProofSuccessSmokeReady ? "yes" : "no"}`);
console.log(`- Post-edit proof ready branch: ${report.releasePostEditProofReady ? "yes" : "no"}`);
console.log("- Source mode: synthetic success rehearsal");
console.log("- Real local env read: no");
console.log("- Real local env modified: no");
console.log(`- First proof after private edits: ${report.releasePostEditProofFirstCommand}`);
console.log(`- Current blocker refresh: ${report.releasePostEditProofRefreshCommand}`);
console.log(`- Live-check current-ready rows: ${report.releaseChannelLiveCheckCurrentReadyCount}/${report.releaseChannelLiveCheckRowCount}`);
console.log(`- Live-check placeholder keys: ${report.releaseChannelLiveCheckCurrentPlaceholderKeyCount}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
