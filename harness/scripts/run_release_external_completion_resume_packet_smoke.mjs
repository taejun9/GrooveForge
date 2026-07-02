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
const sourcePacketStem = "release-external-completion-run-packet-smoke";
const sourcePacketJsonArtifactName = "release-external-completion-run-packet-smoke.json";
const resumePacketStem = "release-external-completion-resume-packet-smoke";
const resumePacketMarkdownArtifactName = "release-external-completion-resume-packet-smoke.md";
const resumePacketJsonArtifactName = "release-external-completion-resume-packet-smoke.json";
const sourcePacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${sourcePacketStem}.json`);
const resumePacketMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${resumePacketStem}.md`);
const resumePacketJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${resumePacketStem}.json`);
const failures = [];

const refreshCommands = [
  {
    order: 1,
    command: "npm run release:external-completion-run-packet-smoke",
    role: "refresh the ordered external completion run packet before deriving the current resume point",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release external completion resume packet smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
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

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function objectRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object" && !Array.isArray(row)) : [];
}

function valueFreeRows(rows) {
  return objectRows(rows).every((row) => row.valueRecorded === false);
}

function copyValueFreeRunRow(row, resumeOrder) {
  return {
    resumeOrder,
    sourceOrder: integerValue(row.order),
    phase: textValue(row.phase),
    command: textValue(row.command),
    proofCommand: textValue(row.proofCommand),
    readiness: textValue(row.readiness, "blocked"),
    source: textValue(row.source),
    note: textValue(row.note),
    valueRecorded: false
  };
}

function commandRowFromSource(row, label) {
  return {
    label,
    phase: textValue(row.phase),
    command: textValue(row.command),
    proofCommand: textValue(row.proofCommand),
    readiness: textValue(row.readiness, "blocked"),
    valueRecorded: false
  };
}

function runNpmScript(command) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const [, , scriptName] = command.trim().split(/\s+/);
  const result = spawnSync(npmCommand, ["run", scriptName], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail(`Could not run ${command}.`, result.error.message);
  }
  if (result.status !== 0) {
    fail(`${command} exited with status ${result.status}.`, "Refresh the release evidence, then rerun this resume packet smoke.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function buildReport(sourcePacket) {
  const runRows = objectRows(sourcePacket.runRows);
  const firstBlockedIndex = runRows.findIndex((row) => textValue(row.readiness) !== "ready");
  const firstBlockedRow = firstBlockedIndex >= 0 ? runRows[firstBlockedIndex] : null;
  const resumeRows = firstBlockedIndex >= 0 ? runRows.slice(firstBlockedIndex).map((row, index) => copyValueFreeRunRow(row, index + 1)) : [];
  const alreadyReadyRows = firstBlockedIndex >= 0 ? runRows.slice(0, firstBlockedIndex).map((row, index) => copyValueFreeRunRow(row, index + 1)) : runRows.map((row, index) => copyValueFreeRunRow(row, index + 1));
  const firstBlockedSummary = firstBlockedRow ? commandRowFromSource(firstBlockedRow, "first-blocked") : null;
  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:external-completion-resume-packet-smoke",
    sourceCommand: "npm run release:external-completion-run-packet-smoke",
    refreshCommands,
    refreshCommandCount: refreshCommands.length,
    externalCompletionResumePacketMarkdownArtifactName: resumePacketMarkdownArtifactName,
    externalCompletionResumePacketJsonArtifactName: resumePacketJsonArtifactName,
    externalCompletionResumePacketMarkdownPath: relative(resumePacketMarkdownPath),
    externalCompletionResumePacketJsonPath: relative(resumePacketJsonPath),
    externalCompletionResumePacketReady: false,
    sourcePacketJsonArtifactName,
    sourcePacketPath: relative(sourcePacketJsonPath),
    sourcePacketPresent: existsSync(sourcePacketJsonPath),
    sourcePacketReady: sourcePacket.externalCompletionRunPacketReady === true,
    sourcePacketValueFree: sourcePacket.privateValuesRecorded === false && sourcePacket.claimedExternalDistribution === false && valueFreeRows(sourcePacket.runRows),
    latestPlan: textValue(sourcePacket.latestPlan),
    latestPlanNumber: integerValue(sourcePacket.latestPlanNumber),
    tenPlanProgress: textValue(sourcePacket.tenPlanProgress),
    tenPlanCompletedCount: integerValue(sourcePacket.tenPlanCompletedCount),
    tenPlanTotal: integerValue(sourcePacket.tenPlanTotal),
    completionPercent: sourcePacket.completionPercent,
    remainingPercent: sourcePacket.remainingPercent,
    currentFirstBlocker: textValue(sourcePacket.currentFirstBlocker),
    currentNextCommand: textValue(sourcePacket.currentNextCommand),
    currentEnvEditTarget: textValue(sourcePacket.currentEnvEditTarget, ".env.distribution.local"),
    hardGateCommand: textValue(sourcePacket.hardGateCommand, "npm run release:external-check"),
    hardGateReady: sourcePacket.hardGateReady === true,
    hardGateWouldFail: sourcePacket.hardGateWouldFail === true,
    totalRunRowCount: runRows.length,
    sourceBlockedRunRowCount: integerValue(sourcePacket.blockedRunRowCount),
    sourceBlockedRunRowSummary: textValue(sourcePacket.blockedRunRowSummary),
    firstBlockedRunRowFound: firstBlockedRow !== null,
    firstBlockedRunRow: firstBlockedSummary,
    firstBlockedRunOrder: firstBlockedSummary ? integerValue(firstBlockedRow.order) : 0,
    firstBlockedPhase: firstBlockedSummary ? firstBlockedSummary.phase : "none",
    firstBlockedCommand: firstBlockedSummary ? firstBlockedSummary.command : "none",
    firstBlockedProofCommand: firstBlockedSummary ? firstBlockedSummary.proofCommand : "none",
    firstBlockedReadiness: firstBlockedSummary ? firstBlockedSummary.readiness : "ready",
    nextResumeCommand: firstBlockedSummary ? firstBlockedSummary.command : sourcePacket.hardGateCommand,
    nextResumeProofCommand: firstBlockedSummary ? firstBlockedSummary.proofCommand : "npm run release:completion-summary-refresh-smoke",
    resumeRows,
    resumeRowCount: resumeRows.length,
    resumeRowsValueFree: valueFreeRows(resumeRows),
    alreadyReadyRows,
    alreadyReadyRowCount: alreadyReadyRows.length,
    alreadyReadyRowsValueFree: valueFreeRows(alreadyReadyRows),
    completionBlockerActionRows: objectRows(sourcePacket.completionBlockerActionRows),
    completionBlockerActionRowCount: integerValue(sourcePacket.completionBlockerActionRowCount),
    completionBlockerActionRowsValueFree: valueFreeRows(sourcePacket.completionBlockerActionRows),
    completionBlockerFocusRows: objectRows(sourcePacket.completionBlockerFocusRows),
    completionBlockerFocusRowCount: integerValue(sourcePacket.completionBlockerFocusRowCount),
    completionBlockerFocusRowsValueFree: valueFreeRows(sourcePacket.completionBlockerFocusRows),
    privateValuesRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    localEnvValueRecorded: false,
    networkProbeAttempted: false,
    updateFeedPublishAttempted: false,
    distributionChannelProbeAttempted: false,
    releaseUploadAttempted: false,
    signingAttempted: false,
    notarySubmissionAttempted: false,
    hardGateRun: false,
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

function formatRefreshRows(rows) {
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatResumeRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.resumeOrder} | ${row.sourceOrder} | ${escapeCell(row.phase)} | \`${escapeCell(row.command)}\` | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.readiness)} | ${escapeCell(row.source)} | ${escapeCell(row.note)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCompletionActionRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.item)} | ${readyLabel(row.ready === true)} | ${escapeCell(row.currentState)} | ${escapeCell(row.operatorAction)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCompletionFocusRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${integerValue(row.order)} | ${escapeCell(row.key)} | ${readyLabel(row.present === true)} | ${readyLabel(row.placeholder === true)} | ${readyLabel(row.shapeReady === true)} | ${readyLabel(row.currentReady === true)} | ${escapeCell(row.expectedSignal)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} External Completion Resume Packet Smoke

## Summary

- External completion resume packet ready: ${readyLabel(report.externalCompletionResumePacketReady)}
- Source packet ready: ${readyLabel(report.sourcePacketReady)}
- Latest completed plan: ${report.latestPlan}
- 10-plan progress: ${report.tenPlanProgress}
- User-facing completion: ${report.completionPercent}%
- Remaining completion: ${report.remainingPercent}%
- Current first blocker: ${report.currentFirstBlocker}
- Current next command: \`${report.currentNextCommand}\`
- Current env edit target: ${report.currentEnvEditTarget}
- First blocked run row found: ${readyLabel(report.firstBlockedRunRowFound)}
- First blocked run order: ${report.firstBlockedRunOrder}
- First blocked phase: ${report.firstBlockedPhase}
- Next resume command: \`${report.nextResumeCommand}\`
- Next resume proof command: \`${report.nextResumeProofCommand}\`
- Resume rows: ${report.resumeRowCount}/${report.totalRunRowCount}
- Already ready rows before resume point: ${report.alreadyReadyRowCount}
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate run by this packet: no
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Private values recorded: no
- Network probe attempted: no
- Update feed publish attempted: no
- Release upload attempted: no
- Signing attempted by this packet: no
- Apple notary submission attempted by this packet: no
- External distribution claimed: no

## Refresh Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatRefreshRows(report.refreshCommands)}

## First Blocked Run Row

| phase | command | proof command | readiness | value recorded |
|---|---|---|---|---:|
| ${escapeCell(report.firstBlockedPhase)} | \`${escapeCell(report.firstBlockedCommand)}\` | \`${escapeCell(report.firstBlockedProofCommand)}\` | ${escapeCell(report.firstBlockedReadiness)} | no |

## Resume Rows

| resume order | source order | phase | command | proof command | readiness | source | note | value recorded |
|---:|---:|---|---|---|---|---|---|---:|
${formatResumeRows(report.resumeRows)}

## Already Ready Rows Before Resume Point

| resume order | source order | phase | command | proof command | readiness | source | note | value recorded |
|---:|---:|---|---|---|---|---|---|---:|
${formatResumeRows(report.alreadyReadyRows)}

## Current Completion Blocker Actions

| order | item | ready | current state | operator action | evidence | proof command | source field | value recorded |
|---:|---|---:|---|---|---|---|---|---:|
${formatCompletionActionRows(report.completionBlockerActionRows)}

## Current Completion Blocker Focus

| order | key | present | placeholder | shape ready | current ready | expected signal | proof command | rerun command | value recorded |
|---:|---|---:|---:|---:|---:|---|---|---|---:|
${formatCompletionFocusRows(report.completionBlockerFocusRows)}

## Not Recorded Or Claimed

This resume packet records no release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, local env value, private beat, or real user audio. It does not run the hard gate, publish feeds, probe remote channels, upload releases, sign artifacts, submit to Apple, claim auto-update, or claim external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.appName === appName, "external completion resume packet should identify GrooveForge");
  check(report.bundleId === bundleId, `external completion resume packet should identify ${bundleId}`);
  check(report.reportCommand === "npm run release:external-completion-resume-packet-smoke", "external completion resume packet should report its command");
  check(report.sourceCommand === "npm run release:external-completion-run-packet-smoke", "external completion resume packet should cite source command");
  check(report.refreshCommandCount === 1, "external completion resume packet should refresh one source packet");
  check(report.refreshCommands[0]?.command === "npm run release:external-completion-run-packet-smoke", "external completion resume packet should refresh the run packet first");
  check(report.sourcePacketPresent === true, "external completion resume packet source packet should be present");
  check(report.sourcePacketReady === true, "external completion resume packet source packet should be ready");
  check(report.sourcePacketValueFree === true, "external completion resume packet source packet should be value-free");
  check(report.latestPlanNumber > 0, "external completion resume packet should include latest plan number");
  check(report.tenPlanTotal === 10, "external completion resume packet should keep ten-plan total");
  check(report.completionPercent === 99.999999, "external completion resume packet should preserve completion percent");
  check(report.remainingPercent === 0.000001, "external completion resume packet should preserve remaining percent");
  check(report.currentEnvEditTarget !== "none", "external completion resume packet should expose current env edit target");
  check(report.hardGateCommand === "npm run release:external-check", "external completion resume packet should cite hard gate command");
  check(report.hardGateReady === false, "external completion resume packet should keep hard gate unready");
  check(report.hardGateWouldFail === true, "external completion resume packet should keep hard gate would-fail posture");
  check(report.hardGateRun === false, "external completion resume packet should not run the hard gate");
  check(report.totalRunRowCount === 12, "external completion resume packet should derive twelve source run rows");
  check(report.firstBlockedRunRowFound === true, "external completion resume packet should find the first blocked row while external proof is incomplete");
  check(report.firstBlockedRunOrder >= 1, "external completion resume packet should expose first blocked order");
  check(report.firstBlockedPhase !== "none", "external completion resume packet should expose first blocked phase");
  check(report.nextResumeCommand === report.firstBlockedCommand, "external completion resume packet next command should match first blocked row");
  check(report.nextResumeProofCommand === report.firstBlockedProofCommand, "external completion resume packet proof command should match first blocked row");
  check(report.resumeRowCount === report.sourceBlockedRunRowCount, "external completion resume packet resume rows should match blocked source rows");
  check(report.resumeRowCount > 0, "external completion resume packet should include resume rows while external proof remains incomplete");
  check(report.resumeRows[0]?.sourceOrder === report.firstBlockedRunOrder, "external completion resume packet first resume row should match first blocked order");
  check(report.resumeRows[0]?.command === report.nextResumeCommand, "external completion resume packet first resume row should carry next resume command");
  check(report.resumeRowsValueFree === true, "external completion resume packet resume rows should be value-free");
  check(report.alreadyReadyRowCount + report.resumeRowCount === report.totalRunRowCount, "external completion resume packet row partitions should cover all source rows");
  check(report.alreadyReadyRowsValueFree === true, "external completion resume packet already-ready rows should be value-free");
  check(report.completionBlockerActionRowCount === report.completionBlockerActionRows.length, "external completion resume packet blocker action count should match rows");
  check(report.completionBlockerActionRowsValueFree === true, "external completion resume packet blocker action rows should be value-free");
  check(report.completionBlockerFocusRowCount === report.completionBlockerFocusRows.length, "external completion resume packet blocker focus count should match rows");
  check(report.completionBlockerFocusRowsValueFree === true, "external completion resume packet blocker focus rows should be value-free");
  check(report.privateValuesRecorded === false, "external completion resume packet should not record private values");
  check(report.releaseUrlValueRecorded === false, "external completion resume packet should not record release URL values");
  check(report.supportUrlValueRecorded === false, "external completion resume packet should not record support URL values");
  check(report.feedValueRecorded === false, "external completion resume packet should not record feed values");
  check(report.credentialValueRecorded === false, "external completion resume packet should not record credential values");
  check(report.tokenValueRecorded === false, "external completion resume packet should not record token values");
  check(report.channelValueRecorded === false, "external completion resume packet should not record channel values");
  check(report.developerIdIdentityValueRecorded === false, "external completion resume packet should not record Developer ID identity values");
  check(report.localEnvValueRecorded === false, "external completion resume packet should not record local env values");
  check(report.networkProbeAttempted === false, "external completion resume packet should not probe networks");
  check(report.updateFeedPublishAttempted === false, "external completion resume packet should not publish update feeds");
  check(report.distributionChannelProbeAttempted === false, "external completion resume packet should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "external completion resume packet should not upload releases");
  check(report.signingAttempted === false, "external completion resume packet should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "external completion resume packet should not submit to Apple");
  check(report.claimedDeveloperIdSigning === false, "external completion resume packet should not claim Developer ID signing");
  check(report.claimedNotarization === false, "external completion resume packet should not claim notarization");
  check(report.claimedGatekeeperApproval === false, "external completion resume packet should not claim Gatekeeper approval");
  check(report.claimedAutoUpdate === false, "external completion resume packet should not claim auto-update");
  check(report.claimedManualQaApproval === false, "external completion resume packet should not claim manual QA approval");
  check(report.claimedAppStoreSubmission === false, "external completion resume packet should not claim app-store submission");
  check(report.claimedExternalDistribution === false, "external completion resume packet should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "external completion resume packet JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "external completion resume packet Markdown should not include URL values");
  check(markdown.includes("External Completion Resume Packet Smoke"), "external completion resume packet Markdown should include title");
  check(markdown.includes("## First Blocked Run Row"), "external completion resume packet Markdown should include first blocked row");
  check(markdown.includes("## Resume Rows"), "external completion resume packet Markdown should include resume rows");
  check(markdown.includes("External distribution claimed: no"), "external completion resume packet Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const step of refreshCommands) {
  console.log(`Refreshing release external completion resume packet evidence: ${step.command}`);
  runNpmScript(step.command);
}

const sourcePacket = await readJsonRequired(sourcePacketJsonPath, "release external completion run packet");
const report = buildReport(sourcePacket);
report.externalCompletionResumePacketReady = true;
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(resumePacketMarkdownPath, markdown, "utf8");
await writeFile(resumePacketJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release external completion resume packet smoke passed.");
console.log(`- Markdown: ${relative(resumePacketMarkdownPath)}`);
console.log(`- JSON: ${relative(resumePacketJsonPath)}`);
console.log(`- Latest completed plan: ${report.latestPlan}`);
console.log(`- 10-plan progress: ${report.tenPlanProgress}`);
console.log(`- User-facing completion: ${report.completionPercent}%`);
console.log(`- Remaining completion: ${report.remainingPercent}%`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- Current next command: ${report.currentNextCommand}`);
console.log(`- First blocked phase: ${report.firstBlockedPhase}`);
console.log(`- Next resume command: ${report.nextResumeCommand}`);
console.log(`- Next resume proof command: ${report.nextResumeProofCommand}`);
console.log(`- Resume rows: ${report.resumeRowCount}/${report.totalRunRowCount}`);
console.log(`- Hard gate command: ${report.hardGateCommand}`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
