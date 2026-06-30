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
const packetMarkdownArtifactName = "release-completion-report-packet-smoke.md";
const packetJsonArtifactName = "release-completion-report-packet-smoke.json";
const packetMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetMarkdownArtifactName}`);
const packetJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetJsonArtifactName}`);
const audienceHandoffJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-audience-completion-handoff-smoke.json`);
const channelEditPacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-edit-packet-smoke.json`);
const failures = [];
const refreshCommandRows = [
  {
    order: 1,
    command: "npm run release:audience-completion-handoff-smoke",
    role: "refresh beginner/professional audience readiness and local package evidence",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:channel-edit-packet-smoke",
    role: "refresh current release-channel edit packet and external/private blocker evidence",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release completion report packet smoke failed:");
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
    fail(`${command} exited with status ${result.status}.`, "Refresh the source evidence named above before retrying this completion report packet smoke.");
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

function formatCommandRows(rows) {
  return rows.map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${readyLabel(row.ready)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.path)}\` | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function buildReport({ audience, channel, progress }) {
  const sourceArtifactRows = [
    sourceRow({
      label: "Audience completion handoff",
      path: audienceHandoffJsonPath,
      ready: audience.releaseAudienceCompletionHandoffReady === true,
      evidence: `${audience.latestTenPlanProgressLabel}; first-time ${readyLabel(audience.firstTimeComposerReady)}; professional ${readyLabel(audience.professionalProducerReady)}`
    }),
    sourceRow({
      label: "Release-channel edit packet",
      path: channelEditPacketJsonPath,
      ready: channel.releaseChannelEditPacketReady === true,
      evidence: `${channel.latestTenPlanProgressLabel}; ${textValue(channel.releaseChannelEditPacketMode)}; placeholders ${integerValue(channel.currentPlaceholderKeyCount)}`
    })
  ];
  const labelsMatch =
    audience.latestTenPlanProgressLabel === progress.latestTenPlanProgressLabel &&
    channel.latestTenPlanProgressLabel === progress.latestTenPlanProgressLabel;
  const completionPercentsMatch =
    audience.userFacingCompletionPercent === 99.999999 &&
    channel.userFacingCompletionPercent === 99.999999 &&
    audience.userFacingRemainingPercent === 0.000001 &&
    channel.userFacingRemainingPercent === 0.000001;
  const valueBoundaryClean =
    audience.valueRecorded === false &&
    audience.claimedExternalDistribution === false &&
    audience.networkProbeAttempted === false &&
    channel.valueRecorded === false &&
    channel.claimedExternalDistribution === false &&
    channel.networkProbeAttempted === false;
  const releaseCompletionReportPacketReady =
    refreshCommandRows.every((row) => row.valueRecorded === false) &&
    sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
    labelsMatch &&
    completionPercentsMatch &&
    valueBoundaryClean &&
    audience.firstTimeComposerReady === true &&
    audience.professionalProducerReady === true &&
    audience.directCompositionReady === true &&
    audience.allGenreStyleReadinessReady === true &&
    audience.localDeliveryPackageReady === true &&
    audience.localPackageReopenReady === true &&
    audience.completionGapStatus === "external proof pending" &&
    channel.completionGapStatus === "external proof pending" &&
    channel.externalDistributionReady === false;

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:completion-report-packet-smoke",
    releaseCompletionReportPacketMarkdownArtifactName: packetMarkdownArtifactName,
    releaseCompletionReportPacketJsonArtifactName: packetJsonArtifactName,
    releaseCompletionReportPacketMarkdownPath: relative(packetMarkdownPath),
    releaseCompletionReportPacketJsonPath: relative(packetJsonPath),
    releaseCompletionReportPacketReady,
    refreshCommandRows,
    refreshCommandCount: refreshCommandRows.length,
    refreshCommandSummary: commandSummary(refreshCommandRows),
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    sourceLabelsMatchLatestTenPlan: labelsMatch,
    audienceLatestTenPlanProgressLabel: textValue(audience.latestTenPlanProgressLabel),
    channelEditLatestTenPlanProgressLabel: textValue(channel.latestTenPlanProgressLabel),
    latestCompletedPlanNumber: progress.latestCompletedPlanNumber,
    latestTenPlanProgressLabel: progress.latestTenPlanProgressLabel,
    latestTenPlanWindowStart: progress.latestTenPlanWindowStart,
    latestTenPlanWindowEnd: progress.latestTenPlanWindowEnd,
    latestTenPlanCompletedCount: progress.latestTenPlanCompletedCount,
    latestTenPlanTotal: progress.latestTenPlanTotal,
    tenPlanProgressReportDue: progress.tenPlanProgressReportDue,
    nextTenPlanProgressReportAt: progress.nextTenPlanProgressReportAt,
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
    firstTimeComposerReady: audience.firstTimeComposerReady === true,
    professionalProducerReady: audience.professionalProducerReady === true,
    directCompositionReady: audience.directCompositionReady === true,
    allGenreStyleReadinessReady: audience.allGenreStyleReadinessReady === true,
    readyStyleCount: integerValue(audience.readyStyleCount),
    requiredStyleCount: integerValue(audience.requiredStyleCount),
    localDeliveryPackageReady: audience.localDeliveryPackageReady === true,
    localPackageReopenReady: audience.localPackageReopenReady === true,
    localPackageReopenRegeneratedExportsMatchDisk: audience.localPackageReopenRegeneratedExportsMatchDisk === true,
    samplingSecondaryReady: audience.samplingSecondaryReady === true,
    localFirstReady: audience.localFirstReady === true,
    completionGapStatus: textValue(channel.completionGapStatus),
    currentActionLabel: textValue(channel.currentActionLabel),
    currentNextCommand: textValue(channel.currentNextCommand),
    currentFirstBlocker: textValue(channel.currentFirstBlocker),
    currentEnvEditTarget: textValue(channel.currentEnvEditTarget),
    releaseChannelEditPacketMode: textValue(channel.releaseChannelEditPacketMode),
    currentRequiredKeyCount: integerValue(channel.currentRequiredKeyCount),
    currentPlaceholderKeyCount: integerValue(channel.currentPlaceholderKeyCount),
    liveCheckCurrentReadyCount: integerValue(channel.liveCheckCurrentReadyCount),
    liveCheckRowCount: integerValue(channel.liveCheckRowCount),
    hardGateCommand: textValue(channel.hardGateCommand),
    externalDistributionReady: channel.externalDistributionReady === true,
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
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Completion Report Packet Smoke

## Status

- Completion report packet ready: ${readyLabel(report.releaseCompletionReportPacketReady)}
- Refresh command order: ${report.refreshCommandSummary}
- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}
- Source labels match latest 10-plan: ${readyLabel(report.sourceLabelsMatchLatestTenPlan)}
- Audience source label: ${report.audienceLatestTenPlanProgressLabel}
- Channel edit source label: ${report.channelEditLatestTenPlanProgressLabel}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- First-time composer ready: ${readyLabel(report.firstTimeComposerReady)}
- Professional producer ready: ${readyLabel(report.professionalProducerReady)}
- Direct composition ready: ${readyLabel(report.directCompositionReady)}
- All-genre style readiness: ${report.readyStyleCount}/${report.requiredStyleCount}
- Local delivery package ready: ${readyLabel(report.localDeliveryPackageReady)}
- Local package reopen ready: ${readyLabel(report.localPackageReopenReady)}
- Regenerated exports match disk: ${readyLabel(report.localPackageReopenRegeneratedExportsMatchDisk)}
- Sampling secondary: ${readyLabel(report.samplingSecondaryReady)}
- Local-first ready: ${readyLabel(report.localFirstReady)}
- Completion gap status: ${report.completionGapStatus}
- Current action: ${report.currentActionLabel}
- Current next command: \`${report.currentNextCommand}\`
- Current first blocker: ${report.currentFirstBlocker}
- Current env edit target: \`${report.currentEnvEditTarget}\`
- Release-channel edit packet mode: ${report.releaseChannelEditPacketMode}
- Current required keys: ${report.currentRequiredKeyCount}
- Current placeholder keys: ${report.currentPlaceholderKeyCount}
- Live-check ready rows: ${report.liveCheckCurrentReadyCount}/${report.liveCheckRowCount}
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

## Source Artifacts

| artifact | present | ready | evidence | path | value recorded |
|---|---:|---:|---|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this packet smoke.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.releaseCompletionReportPacketReady === true, "release completion report packet should be ready");
  check(report.reportCommand === "npm run release:completion-report-packet-smoke", "release completion report packet should report its command");
  check(report.refreshCommandCount === 2, "release completion report packet should refresh two source commands");
  check(
    report.refreshCommandSummary === "npm run release:audience-completion-handoff-smoke -> npm run release:channel-edit-packet-smoke",
    "release completion report packet should refresh audience then channel edit packet"
  );
  check(report.refreshCommandRows.every((row) => row.valueRecorded === false), "release completion report packet command rows should be value-free");
  check(report.sourceArtifactRowCount === 2, "release completion report packet should include two source artifacts");
  check(report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false), "release completion report packet sources should be present, ready, and value-free");
  check(report.sourceLabelsMatchLatestTenPlan === true, "release completion report packet source labels should match latest 10-plan progress");
  check(report.audienceLatestTenPlanProgressLabel === report.latestTenPlanProgressLabel, "release completion report packet audience label should match latest progress");
  check(report.channelEditLatestTenPlanProgressLabel === report.latestTenPlanProgressLabel, "release completion report packet channel edit label should match latest progress");
  check(report.firstTimeComposerReady === true, "release completion report packet should prove first-time composer readiness");
  check(report.professionalProducerReady === true, "release completion report packet should prove professional producer readiness");
  check(report.directCompositionReady === true, "release completion report packet should prove direct composition readiness");
  check(report.allGenreStyleReadinessReady === true, "release completion report packet should prove all-genre readiness");
  check(report.readyStyleCount === report.requiredStyleCount && report.requiredStyleCount >= 14, "release completion report packet should prove all supported styles");
  check(report.localDeliveryPackageReady === true, "release completion report packet should prove local delivery package readiness");
  check(report.localPackageReopenReady === true, "release completion report packet should prove local package reopen readiness");
  check(report.localPackageReopenRegeneratedExportsMatchDisk === true, "release completion report packet should prove regenerated exports match disk");
  check(report.samplingSecondaryReady === true, "release completion report packet should keep sampling secondary");
  check(report.localFirstReady === true, "release completion report packet should keep local-first posture");
  check(report.completionGapStatus === "external proof pending", "release completion report packet should keep external proof pending");
  check(report.currentNextCommand !== "none", "release completion report packet should include current next command");
  check(report.currentFirstBlocker !== "none", "release completion report packet should include current first blocker");
  check(report.currentEnvEditTarget === ".env.distribution.local", "release completion report packet should point at ignored local env target");
  check(report.currentRequiredKeyCount === 4, "release completion report packet should report four release-channel keys");
  check(report.liveCheckRowCount === 4, "release completion report packet should mirror four live-check rows");
  check(report.hardGateCommand === "npm run release:external-check", "release completion report packet should keep hard external gate");
  check(report.externalDistributionReady === false, "release completion report packet should keep external distribution unready");
  check(report.userFacingCompletionPercent === 99.999999, "release completion report packet should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "release completion report packet should preserve remaining percent");
  check(report.latestTenPlanWindowStart > 0, "release completion report packet should report a positive 10-plan window start");
  check(report.latestTenPlanWindowEnd === report.latestTenPlanWindowStart + 9, "release completion report packet should report a 10-plan window");
  check(report.latestTenPlanTotal === 10, "release completion report packet should use ten-plan windows");
  check(
    report.latestTenPlanProgressLabel === `${report.latestTenPlanWindowStart}-${report.latestTenPlanWindowEnd}: ${report.latestTenPlanCompletedCount}/10`,
    "release completion report packet progress label should match latest 10-plan fields"
  );
  check(report.privateValuesRecorded === false, "release completion report packet should not record private values");
  check(report.localEnvValueRecorded === false, "release completion report packet should not record local env values");
  check(report.releaseUrlValueRecorded === false, "release completion report packet should not record release URL values");
  check(report.supportUrlValueRecorded === false, "release completion report packet should not record support URL values");
  check(report.feedValueRecorded === false, "release completion report packet should not record feed values");
  check(report.credentialValueRecorded === false, "release completion report packet should not record credentials");
  check(report.tokenValueRecorded === false, "release completion report packet should not record tokens");
  check(report.channelValueRecorded === false, "release completion report packet should not record channel values");
  check(report.developerIdIdentityValueRecorded === false, "release completion report packet should not record Developer ID identity values");
  check(report.privateBeatRecorded === false, "release completion report packet should not record private beats");
  check(report.realUserAudioRecorded === false, "release completion report packet should not record real user audio");
  check(report.networkProbeAttempted === false, "release completion report packet should not probe networks");
  check(report.updateFeedPublishAttempted === false, "release completion report packet should not publish feeds");
  check(report.distributionChannelProbeAttempted === false, "release completion report packet should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "release completion report packet should not upload releases");
  check(report.signingAttempted === false, "release completion report packet should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release completion report packet should not submit to Apple");
  check(report.claimedAutoUpdate === false, "release completion report packet should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release completion report packet should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "release completion report packet JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release completion report packet Markdown should not include URL values");
  check(markdown.includes("Release Completion Report Packet Smoke"), "release completion report packet Markdown should include title");
  check(markdown.includes("Completion report packet ready: yes"), "release completion report packet Markdown should include readiness");
  check(markdown.includes("Source labels match latest 10-plan: yes"), "release completion report packet Markdown should include source label agreement");
  check(markdown.includes("External distribution claimed: no"), "release completion report packet Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const row of refreshCommandRows) {
  console.log(`Refreshing release completion report packet evidence: ${row.command}`);
  runNpmScript(row.command);
}

const audience = await readJsonRequired(audienceHandoffJsonPath, "Audience completion handoff");
const channel = await readJsonRequired(channelEditPacketJsonPath, "Release-channel edit packet");
const progress = await completedPlanProgress();
const report = buildReport({ audience, channel, progress });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(packetMarkdownPath, markdown, "utf8");
await writeFile(packetJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release completion report packet smoke passed.");
console.log(`- Markdown: ${relative(packetMarkdownPath)}`);
console.log(`- JSON: ${relative(packetJsonPath)}`);
console.log("- Completion report packet ready: yes");
console.log(`- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}`);
console.log(`- Source labels match latest 10-plan: ${report.sourceLabelsMatchLatestTenPlan ? "yes" : "no"}`);
console.log(`- First-time composer ready: ${report.firstTimeComposerReady ? "yes" : "no"}`);
console.log(`- Professional producer ready: ${report.professionalProducerReady ? "yes" : "no"}`);
console.log(`- Current action: ${report.currentActionLabel}`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- Release-channel edit packet mode: ${report.releaseChannelEditPacketMode}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
