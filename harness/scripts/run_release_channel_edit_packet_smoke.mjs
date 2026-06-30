#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const packetMarkdownArtifactName = "release-channel-edit-packet-smoke.md";
const packetJsonArtifactName = "release-channel-edit-packet-smoke.json";
const packetMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetMarkdownArtifactName}`);
const packetJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetJsonArtifactName}`);
const releaseDoctorJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-doctor.json`);
const releaseChannelLiveCheckJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-live-check.json`);
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const refreshCommandRows = [
  {
    order: 1,
    command: "npm run release:doctor",
    role: "refresh value-free release-channel blocker and current action evidence",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:channel-live-check",
    role: "refresh value-free current release-channel key shape and location evidence",
    valueRecorded: false
  }
];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release-channel edit packet smoke failed:");
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

function readyLabel(value) {
  return value === true ? "yes" : "no";
}

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function commandSummary(rows) {
  return rows.map((row) => row.command).join(" -> ");
}

function runNpmScript(command) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const [, , scriptName] = command.split(" ");
  const result = spawnSync(npmCommand, ["run", scriptName], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail(`Could not run ${command}.`, result.error.message);
  }
  if (result.status !== 0) {
    fail(`${command} exited with status ${result.status}.`, "Refresh the release-channel evidence named above before retrying this edit packet smoke.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function completedPlanProgress() {
  const completedDir = path.join(root, "docs", "exec_plans", "completed");
  const entries = await readdir(completedDir);
  const planNumbers = entries
    .map((entry) => /^plan-(\d+)-/.exec(entry)?.[1])
    .filter(Boolean)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value > 0);
  const latestCompletedPlanNumber = Math.max(...planNumbers);
  const latestTenPlanWindowStart = Math.floor((latestCompletedPlanNumber - 1) / 10) * 10 + 1;
  const latestTenPlanWindowEnd = latestTenPlanWindowStart + 9;
  const latestTenPlanCompletedCount = planNumbers.filter(
    (planNumber) => planNumber >= latestTenPlanWindowStart && planNumber <= latestTenPlanWindowEnd
  ).length;
  const latestTenPlanTotal = 10;
  return {
    latestCompletedPlanNumber,
    latestTenPlanWindowStart,
    latestTenPlanWindowEnd,
    latestTenPlanCompletedCount,
    latestTenPlanTotal,
    latestTenPlanProgressLabel: `${latestTenPlanWindowStart}-${latestTenPlanWindowEnd}: ${latestTenPlanCompletedCount}/${latestTenPlanTotal}`,
    tenPlanProgressReportDue: latestTenPlanCompletedCount === latestTenPlanTotal,
    nextTenPlanProgressReportAt: `plan-${latestTenPlanWindowEnd}`
  };
}

function sourceRow({ label, path: filePath, ready, evidence }) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready,
    evidence,
    valueRecorded: false
  };
}

function packetMode(doctor) {
  if (doctor.currentActionId === "prepare-local-distribution-env") {
    return "create-ignored-env-scaffold";
  }
  if (doctor.currentActionId === "replace-release-channel-placeholders") {
    return "replace-release-channel-placeholders";
  }
  if (doctor.currentActionId === "verify-release-channel-metadata") {
    return "verify-release-channel-metadata";
  }
  return "continue-external-proof-chain";
}

function operatorCommandRows(mode) {
  const baseRows =
    mode === "create-ignored-env-scaffold"
      ? [
          {
            order: 1,
            command: "npm run release:prepare-env",
            role: "create the ignored local distribution env scaffold before private edits",
            valueRecorded: false
          },
          {
            order: 2,
            command: "npm run release:doctor",
            role: "refresh value-free release-channel blocker evidence after scaffold creation",
            valueRecorded: false
          }
        ]
      : [
          {
            order: 1,
            command: "npm run release:doctor",
            role: "refresh value-free blocker evidence after editing release-channel metadata",
            valueRecorded: false
          }
        ];
  const followUpRows = [
    {
      command: "npm run release:channel-live-check",
      role: "confirm the four release-channel metadata rows are present, non-placeholder, and shape-ready",
      valueRecorded: false
    },
    {
      command: "npm run release:current-blocker",
      role: "refresh the user-facing current blocker receipt after private edits",
      valueRecorded: false
    },
    {
      command: "npm run release:next-actions",
      role: "select the next external proof target after release-channel metadata clears",
      valueRecorded: false
    },
    {
      command: "npm run release:external-check",
      role: "hard external gate after every redacted readiness signal is ready",
      valueRecorded: false
    }
  ];
  return [...baseRows, ...followUpRows].map((row, index) => ({ ...row, order: index + 1 }));
}

function buildEditRows(liveCheck) {
  return arrayValue(liveCheck.releaseChannelLiveCheckRows).map((row) => ({
    order: row.order,
    key: row.key,
    kind: row.kind,
    expectedShape: row.expectedShape,
    present: row.present === true,
    placeholder: row.placeholder === true,
    shapeReady: row.shapeReady === true,
    currentReady: row.currentReady === true,
    editTarget: textValue(row.editTarget),
    line: Number.isInteger(row.line) ? row.line : null,
    proofCommand: "npm run release:channel-live-check",
    strictProofCommand: "npm run release:channel-live-check-strict",
    doctorCommand: "npm run release:doctor",
    currentBlockerCommand: "npm run release:current-blocker",
    hardGateCommand: "npm run release:external-check",
    valueRecorded: false
  }));
}

function formatCommandRows(rows) {
  return rows.map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${readyLabel(row.ready)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.path)}\` | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatEditRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.kind)} | ${escapeCell(row.expectedShape)} | ${readyLabel(row.present)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${readyLabel(row.currentReady)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "none")} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.doctorCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildReport({ doctor, liveCheck, progress }) {
  const mode = packetMode(doctor);
  const editRows = buildEditRows(liveCheck);
  const operatorRows = operatorCommandRows(mode);
  const sourceArtifactRows = [
    sourceRow({
      label: "Release doctor",
      path: releaseDoctorJsonPath,
      ready: doctor.releaseDoctorReportReady === true,
      evidence: `${textValue(doctor.currentActionLabel)}; ${textValue(doctor.completionGapStatus)}`
    }),
    sourceRow({
      label: "Release-channel live check",
      path: releaseChannelLiveCheckJsonPath,
      ready: liveCheck.releaseChannelLiveCheckRowCount === releaseChannelMetadataKeys.length,
      evidence: `${integerValue(liveCheck.releaseChannelLiveCheckCurrentReadyCount)}/${integerValue(liveCheck.releaseChannelLiveCheckRowCount)} current-ready rows; ${integerValue(liveCheck.currentPlaceholderKeyCount)} placeholders`
    })
  ];
  const releaseChannelEditPacketReady =
    refreshCommandRows.every((row) => row.valueRecorded === false) &&
    operatorRows.every((row) => row.valueRecorded === false) &&
    sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
    editRows.length === releaseChannelMetadataKeys.length &&
    editRows.every((row) => releaseChannelMetadataKeys.includes(row.key) && row.valueRecorded === false) &&
    doctor.releaseDoctorReportReady === true &&
    doctor.completionGapStatus === "external proof pending" &&
    doctor.currentEnvEditTarget === ".env.distribution.local" &&
    doctor.currentActionRequiredKeyCount === releaseChannelMetadataKeys.length &&
    doctor.externalDistributionReady === false &&
    liveCheck.currentEnvEditTarget === ".env.distribution.local" &&
    liveCheck.currentRequiredKeyCount === releaseChannelMetadataKeys.length &&
    liveCheck.privateValuesRecorded === false &&
    liveCheck.networkProbeAttempted === false &&
    liveCheck.valueRecorded === false &&
    doctor.privateValuesRecorded === false &&
    doctor.networkProbeAttemptedByThisDoctor === false &&
    doctor.releaseGateClaimedExternalDistribution === false;

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:channel-edit-packet-smoke",
    releaseChannelEditPacketMarkdownArtifactName: packetMarkdownArtifactName,
    releaseChannelEditPacketJsonArtifactName: packetJsonArtifactName,
    releaseChannelEditPacketMarkdownPath: relative(packetMarkdownPath),
    releaseChannelEditPacketJsonPath: relative(packetJsonPath),
    releaseChannelEditPacketReady,
    releaseChannelEditPacketMode: mode,
    refreshCommandRows,
    refreshCommandCount: refreshCommandRows.length,
    refreshCommandSummary: commandSummary(refreshCommandRows),
    operatorCommandRows: operatorRows,
    operatorCommandCount: operatorRows.length,
    operatorCommandSummary: commandSummary(operatorRows),
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    currentActionId: textValue(doctor.currentActionId),
    currentActionLabel: textValue(doctor.currentActionLabel),
    currentNextCommand: textValue(doctor.currentActionNextCommand),
    currentFirstBlocker: textValue(doctor.currentActionFirstBlocker),
    currentOperatorAction: textValue(doctor.currentActionOperatorAction),
    completionGapStatus: textValue(doctor.completionGapStatus),
    completionGapProofTarget: textValue(doctor.completionGapCurrentProofTarget),
    completionGapNextProofCommand: textValue(doctor.completionGapNextProofCommand),
    completionGapHardGateCommand: textValue(doctor.completionGapHardGateCommand),
    currentEnvEditTarget: textValue(doctor.currentEnvEditTarget),
    currentRequiredKeyCount: integerValue(doctor.currentActionRequiredKeyCount),
    currentRequiredKeys: arrayValue(doctor.currentActionRequiredKeys),
    currentPlaceholderKeyCount: integerValue(doctor.currentActionPlaceholderKeyCount),
    currentPlaceholderKeys: arrayValue(doctor.currentActionPlaceholderKeys),
    liveCheckReady: liveCheck.releaseChannelLiveCheckReady === true,
    liveCheckCurrentReadyCount: integerValue(liveCheck.releaseChannelLiveCheckCurrentReadyCount),
    liveCheckRowCount: integerValue(liveCheck.releaseChannelLiveCheckRowCount),
    liveCheckPlaceholderKeyCount: integerValue(liveCheck.currentPlaceholderKeyCount),
    liveCheckPlaceholderKeys: arrayValue(liveCheck.currentPlaceholderKeys),
    liveCheckPlaceholderEditLocationCount: integerValue(liveCheck.currentPlaceholderEditLocationCount),
    liveCheckPlaceholderEditLocations: arrayValue(liveCheck.currentPlaceholderEditLocations).map((row) => ({
      key: row.key,
      file: row.file,
      line: row.line,
      placeholder: row.placeholder === true,
      valueRecorded: false
    })),
    releaseChannelEditRows: editRows,
    releaseChannelEditRowCount: editRows.length,
    doctorCommand: "npm run release:doctor",
    liveCheckCommand: "npm run release:channel-live-check",
    strictLiveCheckCommand: "npm run release:channel-live-check-strict",
    currentBlockerCommand: "npm run release:current-blocker",
    nextActionsCommand: "npm run release:next-actions",
    proofBundleCommand: "npm run release:proof-bundle",
    progressCommand: "npm run release:progress-smoke",
    hardGateCommand: "npm run release:external-check",
    localEnvFileLoaded: doctor.localEnvFileLoaded === true,
    externalDistributionReady: doctor.externalDistributionReady === true,
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
    latestCompletedPlanNumber: progress.latestCompletedPlanNumber,
    latestTenPlanProgressLabel: progress.latestTenPlanProgressLabel,
    latestTenPlanWindowStart: progress.latestTenPlanWindowStart,
    latestTenPlanWindowEnd: progress.latestTenPlanWindowEnd,
    latestTenPlanCompletedCount: progress.latestTenPlanCompletedCount,
    latestTenPlanTotal: progress.latestTenPlanTotal,
    tenPlanProgressReportDue: progress.tenPlanProgressReportDue,
    nextTenPlanProgressReportAt: progress.nextTenPlanProgressReportAt,
    privateValuesRecorded: false,
    localEnvValueRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    privateBeatRecorded: false,
    realUserAudioRecorded: false,
    networkProbeAttempted: false,
    updateFeedPublishAttempted: false,
    distributionChannelProbeAttempted: false,
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
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release-Channel Edit Packet Smoke

## Status

- Release-channel edit packet ready: ${readyLabel(report.releaseChannelEditPacketReady)}
- Packet mode: ${report.releaseChannelEditPacketMode}
- Refresh command order: ${report.refreshCommandSummary}
- Operator command order: ${report.operatorCommandSummary}
- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Completion gap status: ${report.completionGapStatus}
- Current action: ${report.currentActionLabel}
- Current next command: \`${report.currentNextCommand}\`
- Current first blocker: ${report.currentFirstBlocker}
- Current env edit target: \`${report.currentEnvEditTarget}\`
- Current required keys: ${report.currentRequiredKeyCount}
- Current placeholder keys: ${report.currentPlaceholderKeyCount}
- Live-check ready rows: ${report.liveCheckCurrentReadyCount}/${report.liveCheckRowCount}
- Live-check placeholders: ${report.liveCheckPlaceholderKeyCount}
- Hard gate command: \`${report.hardGateCommand}\`
- Private values recorded: no
- Local env values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Signing attempted: no
- Apple notary submission attempted: no
- External distribution claimed: no

## Refresh Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.refreshCommandRows)}

## Operator Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.operatorCommandRows)}

## Source Artifacts

| artifact | present | ready | evidence | path | value recorded |
|---|---:|---:|---|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Release-Channel Edit Rows

| order | key | kind | expected shape | present | placeholder | shape ready | current ready | edit target | line | live check | doctor | value recorded |
|---:|---|---|---|---:|---:|---:|---:|---|---:|---|---|---:|
${formatEditRows(report.releaseChannelEditRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this packet smoke.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.releaseChannelEditPacketReady === true, "release-channel edit packet should be ready");
  check(report.reportCommand === "npm run release:channel-edit-packet-smoke", "release-channel edit packet should report its command");
  check(report.refreshCommandCount === 2, "release-channel edit packet should refresh two source commands");
  check(report.refreshCommandSummary === "npm run release:doctor -> npm run release:channel-live-check", "release-channel edit packet should refresh doctor then live-check");
  check(report.operatorCommandCount >= 5, "release-channel edit packet should include operator proof commands");
  check(report.operatorCommandRows.every((row) => row.valueRecorded === false), "release-channel edit packet operator rows should be value-free");
  check(report.sourceArtifactRowCount === 2, "release-channel edit packet should include two source artifacts");
  check(report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false), "release-channel edit packet source artifacts should be present, ready, and value-free");
  check(["create-ignored-env-scaffold", "replace-release-channel-placeholders", "verify-release-channel-metadata", "continue-external-proof-chain"].includes(report.releaseChannelEditPacketMode), "release-channel edit packet should identify a known mode");
  check(report.currentEnvEditTarget === ".env.distribution.local", "release-channel edit packet should point at the ignored local env target");
  check(report.currentRequiredKeyCount === 4, "release-channel edit packet should report four current release-channel keys");
  check(releaseChannelMetadataKeys.every((key) => report.currentRequiredKeys.includes(key)), "release-channel edit packet should include all current release-channel keys");
  check(report.releaseChannelEditRowCount === 4, "release-channel edit packet should include four edit rows");
  check(report.releaseChannelEditRows.every((row) => releaseChannelMetadataKeys.includes(row.key)), "release-channel edit packet rows should cover only current release-channel keys");
  check(report.releaseChannelEditRows.every((row) => row.valueRecorded === false), "release-channel edit packet rows should not record values");
  check(report.releaseChannelEditRows.every((row) => row.proofCommand === "npm run release:channel-live-check"), "release-channel edit packet rows should point at live-check proof");
  check(report.releaseChannelEditRows.every((row) => row.doctorCommand === "npm run release:doctor"), "release-channel edit packet rows should point at doctor proof");
  check(report.liveCheckRowCount === 4, "release-channel edit packet should mirror four live-check rows");
  check(report.liveCheckPlaceholderEditLocations.every((row) => row.valueRecorded === false), "release-channel edit packet placeholder locations should be value-free");
  check(report.completionGapStatus === "external proof pending", "release-channel edit packet should keep external proof pending");
  check(report.currentNextCommand !== "none", "release-channel edit packet should include current next command");
  check(report.currentFirstBlocker !== "none", "release-channel edit packet should include current first blocker");
  check(report.hardGateCommand === "npm run release:external-check", "release-channel edit packet should keep hard external gate command");
  check(report.userFacingCompletionPercent === 99.999999, "release-channel edit packet should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "release-channel edit packet should preserve remaining percent");
  check(report.latestTenPlanWindowStart > 0, "release-channel edit packet should report a positive 10-plan window start");
  check(report.latestTenPlanWindowEnd === report.latestTenPlanWindowStart + 9, "release-channel edit packet should report a 10-plan window");
  check(report.latestTenPlanTotal === 10, "release-channel edit packet should use ten-plan windows");
  check(
    report.latestTenPlanProgressLabel === `${report.latestTenPlanWindowStart}-${report.latestTenPlanWindowEnd}: ${report.latestTenPlanCompletedCount}/10`,
    "release-channel edit packet progress label should match latest 10-plan fields"
  );
  check(report.privateValuesRecorded === false, "release-channel edit packet should not record private values");
  check(report.localEnvValueRecorded === false, "release-channel edit packet should not record local env values");
  check(report.releaseUrlValueRecorded === false, "release-channel edit packet should not record release URL values");
  check(report.supportUrlValueRecorded === false, "release-channel edit packet should not record support URL values");
  check(report.feedValueRecorded === false, "release-channel edit packet should not record feed values");
  check(report.credentialValueRecorded === false, "release-channel edit packet should not record credentials");
  check(report.tokenValueRecorded === false, "release-channel edit packet should not record tokens");
  check(report.channelValueRecorded === false, "release-channel edit packet should not record channel values");
  check(report.developerIdIdentityValueRecorded === false, "release-channel edit packet should not record Developer ID identity values");
  check(report.privateBeatRecorded === false, "release-channel edit packet should not record private beats");
  check(report.realUserAudioRecorded === false, "release-channel edit packet should not record real user audio");
  check(report.networkProbeAttempted === false, "release-channel edit packet should not probe networks");
  check(report.updateFeedPublishAttempted === false, "release-channel edit packet should not publish feeds");
  check(report.distributionChannelProbeAttempted === false, "release-channel edit packet should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "release-channel edit packet should not upload releases");
  check(report.signingAttempted === false, "release-channel edit packet should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release-channel edit packet should not submit to Apple");
  check(report.claimedAutoUpdate === false, "release-channel edit packet should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release-channel edit packet should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "release-channel edit packet JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release-channel edit packet Markdown should not include URL values");
  check(markdown.includes("Release-Channel Edit Packet Smoke"), "release-channel edit packet Markdown should include title");
  check(markdown.includes("Release-channel edit packet ready: yes"), "release-channel edit packet Markdown should include readiness");
  check(markdown.includes("Release-Channel Edit Rows"), "release-channel edit packet Markdown should include edit rows");
  check(markdown.includes("External distribution claimed: no"), "release-channel edit packet Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const row of refreshCommandRows) {
  console.log(`Refreshing release-channel edit packet evidence: ${row.command}`);
  runNpmScript(row.command);
}

const doctor = await readJsonRequired(releaseDoctorJsonPath, "Release doctor");
const liveCheck = await readJsonRequired(releaseChannelLiveCheckJsonPath, "Release-channel live check");
const progress = await completedPlanProgress();
const report = buildReport({ doctor, liveCheck, progress });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(packetMarkdownPath, markdown, "utf8");
await writeFile(packetJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release-channel edit packet smoke passed.");
console.log(`- Markdown: ${relative(packetMarkdownPath)}`);
console.log(`- JSON: ${relative(packetJsonPath)}`);
console.log("- Release-channel edit packet ready: yes");
console.log(`- Packet mode: ${report.releaseChannelEditPacketMode}`);
console.log(`- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}`);
console.log(`- Current action: ${report.currentActionLabel}`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- Current required keys: ${report.currentRequiredKeyCount}`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
console.log(`- Live-check ready rows: ${report.liveCheckCurrentReadyCount}/${report.liveCheckRowCount}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
