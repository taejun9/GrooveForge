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
const postEditProofBundleJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof-bundle.json`
);
const currentBlockerJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.json`
);
const releaseProgressJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-progress-report.json`
);
const finalHandoffMarkdownPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-final-handoff.md`
);
const finalHandoffJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-final-handoff.json`
);
const fromExisting = process.argv.includes("--from-existing");
const failures = [];
const refreshCommand = "npm run release:post-edit-proof-bundle";
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error(`GrooveForge release final handoff${fromExisting ? " smoke" : ""} failed:`);
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function runRefresh() {
  if (fromExisting) {
    return;
  }

  console.log(`Refreshing release final handoff evidence: ${refreshCommand}`);
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", "release:post-edit-proof-bundle"], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });

  if (result.error) {
    fail(`Could not run ${refreshCommand}.`, result.error.message);
  }

  if (result.status !== 0) {
    fail(`${refreshCommand} exited with status ${result.status}.`);
  }
}

function relative(filePath) {
  return path.relative(root, filePath);
}

async function readRequiredJson(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
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

function valueFreeRows(values) {
  return objectRows(values).filter((row) => row.valueRecorded === false);
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function readyLabel(value) {
  return value === true ? "yes" : "no";
}

function sanitizeEditRows(rows) {
  return objectRows(rows).map((row, index) => ({
    order: Number.isInteger(row.order) ? row.order : index + 1,
    key: textValue(row.key),
    location: textValue(row.location, row.file && row.line ? `${row.file}:${row.line}` : row.editTarget ?? "none"),
    editTarget: textValue(row.editTarget, row.file ?? "none"),
    line: Number.isInteger(row.line) ? row.line : null,
    placeholder: row.placeholder === true,
    assignmentShape: textValue(row.assignment, `${textValue(row.key)}=<operator-owned-value>`),
    guidance: textValue(row.guidance, "operator-owned value; keep it in the ignored local env file"),
    proofCommand: "npm run release:channel-live-check",
    rerunCommand: "npm run release:current-blocker",
    hardGateCommand: "npm run release:external-check",
    valueRecorded: false
  }));
}

function sanitizeLocationRows(rows) {
  return objectRows(rows).map((row, index) => ({
    order: Number.isInteger(row.order) ? row.order : index + 1,
    key: textValue(row.key),
    file: textValue(row.file, row.editTarget ?? "none"),
    line: Number.isInteger(row.line) ? row.line : null,
    location: textValue(row.location, row.file && row.line ? `${row.file}:${row.line}` : "none"),
    placeholder: row.placeholder !== false,
    valueRecorded: false
  }));
}

function sanitizeSequenceRows(rows) {
  return objectRows(rows).map((row, index) => ({
    order: Number.isInteger(row.order) ? row.order : index + 1,
    step: textValue(row.step, row.item ?? "handoff step"),
    ready: row.ready === true,
    command: textValue(row.command),
    expectedEvidence: textValue(row.expectedEvidence, row.expectedPostEditSignal ?? row.evidence ?? "value-free release evidence"),
    sourceField: textValue(row.sourceField),
    valueRecorded: false
  }));
}

function sanitizeOperatorRows(rows) {
  return objectRows(rows).map((row, index) => ({
    order: Number.isInteger(row.order) ? row.order : index + 1,
    step: textValue(row.step, row.item ?? "operator handoff"),
    ready: row.ready === true,
    currentState: textValue(row.currentState, row.evidence ?? "value-free current state"),
    operatorAction: textValue(row.operatorAction, "follow the value-free release handoff sequence"),
    expectedPostEditSignal: textValue(row.expectedPostEditSignal, "source evidence turns ready without recorded private values"),
    sourceField: textValue(row.sourceField),
    valueRecorded: false
  }));
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${row.present ? "yes" : "no"} | ${escapeCell(row.path)} | ${row.ready ? "yes" : "no"} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatEditRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.location)} | ${escapeCell(row.assignmentShape)} | ${escapeCell(row.guidance)} | ${row.valueRecorded ? "yes" : "no"} |`
    )
    .join("\n");
}

function formatSequenceRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.step)} | ${readyLabel(row.ready)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.expectedEvidence)} | ${row.valueRecorded ? "yes" : "no"} |`
    )
    .join("\n");
}

function formatOperatorRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.step)} | ${escapeCell(row.currentState)} | ${escapeCell(row.expectedPostEditSignal)} | ${row.valueRecorded ? "yes" : "no"} |`
    )
    .join("\n");
}

function buildCommandRows() {
  return [
    {
      order: 1,
      label: "Narrow live check",
      command: "npm run release:channel-live-check",
      role: "first proof after private release-channel edits",
      valueRecorded: false
    },
    {
      order: 2,
      label: "Post-edit proof bundle",
      command: "npm run release:post-edit-proof-bundle",
      role: "prove synthetic ready branch and current real ignored-env posture",
      valueRecorded: false
    },
    {
      order: 3,
      label: "Current blocker refresh",
      command: "npm run release:current-blocker",
      role: "refresh value-free current blocker and 10-plan progress evidence",
      valueRecorded: false
    },
    {
      order: 4,
      label: "Progress refresh",
      command: "npm run release:progress-smoke",
      role: "refresh user-facing completion and 10-plan report from existing evidence",
      valueRecorded: false
    },
    {
      order: 5,
      label: "Hard external gate",
      command: "npm run release:external-check",
      role: "only command that may claim external distribution completion when all evidence is ready",
      valueRecorded: false
    }
  ];
}

function buildReport({ postEditProofBundle, currentBlocker, releaseProgress }) {
  const blockerRequiredKeys = stringArrayValue(currentBlocker.currentRequiredKeys);
  const bundleRequiredKeys = stringArrayValue(postEditProofBundle.actualLiveCheckRequiredKeys);
  const blockerPlaceholderKeys = stringArrayValue(currentBlocker.currentPlaceholderKeys);
  const bundlePlaceholderKeys = stringArrayValue(postEditProofBundle.actualLiveCheckPlaceholderKeys);
  const blockerEditRows = objectRows(currentBlocker.currentEnvEditRows);
  const blockerPlaceholderLocations = objectRows(currentBlocker.currentPlaceholderEditLocations);
  const bundlePlaceholderLocations = objectRows(postEditProofBundle.actualLiveCheckPlaceholderEditLocations);
  const blockerSequenceRows = objectRows(currentBlocker.postEditProofSequenceReceiptRows);
  const progressSequenceRows = objectRows(releaseProgress.postEditProofSequenceReceiptRows);
  const blockerOperatorRows = objectRows(currentBlocker.releaseChannelPostEditOperatorReceiptRows);
  const progressOperatorRows = objectRows(releaseProgress.releaseChannelPostEditOperatorReceiptRows);
  const currentRequiredKeys = stringArrayValue(
    blockerRequiredKeys.length > 0
      ? blockerRequiredKeys
      : bundleRequiredKeys.length > 0
        ? bundleRequiredKeys
        : releaseChannelMetadataKeys
  );
  const currentPlaceholderKeys = stringArrayValue(
    blockerPlaceholderKeys.length > 0 ? blockerPlaceholderKeys : bundlePlaceholderKeys
  );
  const currentEnvEditRows = sanitizeEditRows(blockerEditRows);
  const currentPlaceholderEditLocations = sanitizeLocationRows(
    blockerPlaceholderLocations.length > 0 ? blockerPlaceholderLocations : bundlePlaceholderLocations
  );
  const postEditProofSequenceRows = sanitizeSequenceRows(
    blockerSequenceRows.length > 0 ? blockerSequenceRows : progressSequenceRows
  );
  const postEditOperatorRows = sanitizeOperatorRows(
    blockerOperatorRows.length > 0 ? blockerOperatorRows : progressOperatorRows
  );
  const commandRows = buildCommandRows();
  const sourceArtifactRows = [
    {
      label: "Post-edit proof bundle",
      path: relative(postEditProofBundleJsonPath),
      present: true,
      ready: postEditProofBundle.releasePostEditProofBundleReady === true,
      valueRecorded: false
    },
    {
      label: "Release current blocker",
      path: relative(currentBlockerJsonPath),
      present: true,
      ready: currentBlocker.releaseCurrentBlockerReady === true,
      valueRecorded: false
    },
    {
      label: "Release progress report",
      path: relative(releaseProgressJsonPath),
      present: true,
      ready: releaseProgress.tenPlanProgressReportReceiptReady === true,
      valueRecorded: false
    }
  ];
  const tenPlanCompletedCount = integerValue(releaseProgress.currentTenPlanWindowCompletedCount);
  const tenPlanTotal = integerValue(releaseProgress.currentTenPlanWindowTotal || 10);
  const tenPlanReportDue = releaseProgress.tenPlanProgressReportDue === true || tenPlanCompletedCount >= tenPlanTotal;
  const currentReadyCount = integerValue(
    currentBlocker.releaseChannelLiveCheckCurrentReadyCount ?? postEditProofBundle.actualLiveCheckCurrentReadyCount
  );
  const currentRowCount = integerValue(
    currentBlocker.releaseChannelLiveCheckRowCount ?? postEditProofBundle.actualLiveCheckRowCount
  );
  const currentPlaceholderKeyCount = integerValue(
    currentBlocker.currentPlaceholderKeyCount ?? postEditProofBundle.actualLiveCheckPlaceholderKeyCount
  );
  const releaseChannelMetadataReady =
    postEditProofBundle.actualPostEditProofReady === true ||
    (currentRowCount === releaseChannelMetadataKeys.length && currentReadyCount === currentRowCount && currentPlaceholderKeyCount === 0);
  const privateEditStillRequired = releaseChannelMetadataReady === false;

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: fromExisting ? "npm run release:final-handoff -- --from-existing" : "npm run release:final-handoff",
    refreshCommand: fromExisting ? "none" : refreshCommand,
    releaseFinalHandoffReady: sourceArtifactRows.every((row) => row.present && row.ready && row.valueRecorded === false),
    releaseFinalHandoffState: privateEditStillRequired
      ? "private release-channel metadata handoff ready; external distribution still blocked"
      : "release-channel metadata proof cleared; continue downstream external hard-gate actions",
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    releaseFinalHandoffCommandRows: commandRows,
    releaseFinalHandoffCommandCount: commandRows.length,
    releaseFinalHandoffCommandSummary: commandRows.map((row) => row.command).join(" -> "),
    currentTarget: textValue(currentBlocker.currentTarget, "Release channel metadata"),
    currentFirstBlocker: textValue(currentBlocker.currentFirstBlocker),
    currentEnvEditTarget: textValue(currentBlocker.currentEnvEditTarget, postEditProofBundle.actualLiveCheckPlaceholderEditLocations?.[0]?.file ?? ".env.distribution.local"),
    currentRequiredKeys,
    currentRequiredKeyCount: currentRequiredKeys.length || releaseChannelMetadataKeys.length,
    currentPlaceholderKeys,
    currentPlaceholderKeyCount,
    currentPlaceholderEditLocations,
    currentPlaceholderEditLocationCount: currentPlaceholderEditLocations.length,
    currentEnvEditRows,
    currentEnvEditRowCount: currentEnvEditRows.length,
    currentReadyCount,
    currentRowCount,
    releaseChannelMetadataReady,
    privateEditStillRequired,
    firstProofAfterPrivateEdits: textValue(
      currentBlocker.releaseChannelFirstProofCommandAfterPrivateEdits,
      postEditProofBundle.actualFirstProofCommandAfterPrivateEdits
    ),
    postEditProofBundleCommand: refreshCommand,
    currentBlockerRefreshCommand: textValue(
      currentBlocker.currentRerunCommand,
      postEditProofBundle.actualCurrentBlockerRefreshCommand
    ),
    nextActionsCommand: textValue(currentBlocker.releaseChannelPostEditOperatorReceiptNextActionsCommand, "npm run release:next-actions"),
    proofBundleCommand: textValue(currentBlocker.postEditProofSequenceReceiptProofBundleCommand, "npm run release:proof-bundle"),
    progressCommand: textValue(currentBlocker.postEditProofSequenceReceiptProgressCommand, "npm run release:progress-smoke"),
    hardGateCommand: textValue(currentBlocker.hardGateCommand, "npm run release:external-check"),
    hardGateReady: currentBlocker.hardGateReady === true,
    hardGateWouldFail: currentBlocker.hardGateWouldFail !== false,
    hardGateRequirementReadyCount: integerValue(currentBlocker.hardGateRequirementReadyCount),
    hardGateRequirementCount: integerValue(currentBlocker.hardGateRequirementCount),
    postEditProofSequenceReceiptReady: currentBlocker.postEditProofSequenceReceiptReady === true || releaseProgress.postEditProofSequenceReceiptReady === true,
    postEditProofSequenceReceiptRows: postEditProofSequenceRows,
    postEditProofSequenceReceiptRowCount: postEditProofSequenceRows.length,
    releaseChannelPostEditOperatorReceiptReady:
      currentBlocker.releaseChannelPostEditOperatorReceiptReady === true ||
      releaseProgress.releaseChannelPostEditOperatorReceiptReady === true,
    releaseChannelPostEditOperatorReceiptRows: postEditOperatorRows,
    releaseChannelPostEditOperatorReceiptRowCount: postEditOperatorRows.length,
    successReadyBranchCovered: postEditProofBundle.successReadyBranchCovered === true,
    successRealLocalEnvRead: postEditProofBundle.successRealLocalEnvRead === true,
    successRealLocalEnvModified: postEditProofBundle.successRealLocalEnvModified === true,
    currentTenPlanProgressLabel: textValue(releaseProgress.currentTenPlanWindowLabel, postEditProofBundle.currentTenPlanProgressLabel),
    currentTenPlanWindowStart: integerValue(releaseProgress.currentTenPlanWindowStart),
    currentTenPlanWindowEnd: integerValue(releaseProgress.currentTenPlanWindowEnd),
    currentTenPlanWindowCompletedCount: tenPlanCompletedCount,
    currentTenPlanWindowTotal: tenPlanTotal,
    currentTenPlanWindowRowCount: integerValue(releaseProgress.currentTenPlanWindowRowCount),
    tenPlanProgressReportDue: tenPlanReportDue,
    tenPlanProgressReportCadence: textValue(releaseProgress.tenPlanProgressReportCadence, "report after each completed work and every 10 completed plans"),
    tenPlanProgressReportReceiptReady: releaseProgress.tenPlanProgressReportReceiptReady === true,
    tenPlanProgressReportReceiptRowCount: integerValue(releaseProgress.tenPlanProgressReportReceiptRowCount),
    nextTenPlanProgressReportAt: integerValue(releaseProgress.nextTenPlanProgressReportAt),
    userFacingCompletionPercent: Number(releaseProgress.userFacingCompletionPercent ?? postEditProofBundle.userFacingCompletionPercent ?? 99.999999),
    userFacingRemainingPercent: Number(releaseProgress.userFacingRemainingPercent ?? postEditProofBundle.userFacingRemainingPercent ?? 0.000001),
    userFacingCompletionStatus: textValue(releaseProgress.userFacingCompletionStatus, "99.999999% complete; external/private release proof remains."),
    privateValuesRecorded: false,
    networkProbeAttempted: false,
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
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Final Handoff

## Status

- Final handoff receipt ready: ${readyLabel(report.releaseFinalHandoffReady)}
- State: ${report.releaseFinalHandoffState}
- Current target: ${report.currentTarget}
- Current first blocker: ${report.currentFirstBlocker}
- Release-channel metadata ready: ${readyLabel(report.releaseChannelMetadataReady)}
- Private edit still required: ${readyLabel(report.privateEditStillRequired)}
- Current env edit target: ${report.currentEnvEditTarget}
- Current ready rows: ${report.currentReadyCount}/${report.currentRowCount}
- Current placeholder keys: ${report.currentPlaceholderKeyCount}
- First proof after private edits: \`${report.firstProofAfterPrivateEdits}\`
- Post-edit proof bundle: \`${report.postEditProofBundleCommand}\`
- Current blocker refresh: \`${report.currentBlockerRefreshCommand}\`
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Signing attempted: no
- Apple notary submission attempted: no
- External distribution claimed: no

## Source Artifacts

| artifact | present | path | ready | value recorded |
|---|---:|---|---:|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Final Handoff Commands

| order | label | command | role | value recorded |
|---:|---|---|---|---:|
${report.releaseFinalHandoffCommandRows
  .map((row) => `| ${row.order} | ${escapeCell(row.label)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${row.valueRecorded ? "yes" : "no"} |`)
  .join("\n")}

## Current Private Edit Rows

| order | key | location | assignment shape | guidance | value recorded |
|---:|---|---|---|---|---:|
${formatEditRows(report.currentEnvEditRows)}

## Post-Edit Proof Sequence Receipt

| order | step | ready | command | expected evidence | value recorded |
|---:|---|---:|---|---|---:|
${formatSequenceRows(report.postEditProofSequenceReceiptRows)}

## Release-Channel Post-Edit Operator Receipt

| order | step | current state | expected post-edit signal | value recorded |
|---:|---|---|---|---:|
${formatOperatorRows(report.releaseChannelPostEditOperatorReceiptRows)}

## Completion Cadence

- Cadence: ${report.tenPlanProgressReportCadence}
- Current window: ${report.currentTenPlanProgressLabel}
- Window start: ${report.currentTenPlanWindowStart}
- Window end: ${report.currentTenPlanWindowEnd}
- Completed rows: ${report.currentTenPlanWindowCompletedCount}/${report.currentTenPlanWindowTotal}
- Next 10-plan report at: ${report.nextTenPlanProgressReportAt || report.currentTenPlanWindowEnd}
- Report due now: ${readyLabel(report.tenPlanProgressReportDue)}
- Completion status: ${report.userFacingCompletionStatus}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No distribution channel probe, release upload, Apple notary submission, or signing is attempted by this handoff receipt.
- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  check(report.releaseFinalHandoffReady === true, "release final handoff should be ready");
  check(report.sourceArtifactRowCount === 3, "release final handoff should include three source artifacts");
  check(report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false), "release final handoff source rows should be present, ready, and value-free");
  check(report.releaseFinalHandoffCommandCount === 5, "release final handoff should include five handoff commands");
  check(report.releaseFinalHandoffCommandRows.every((row) => row.valueRecorded === false), "release final handoff command rows should not record values");
  check(report.firstProofAfterPrivateEdits === "npm run release:channel-live-check", "release final handoff should keep live-check as first proof after private edits");
  check(report.postEditProofBundleCommand === "npm run release:post-edit-proof-bundle", "release final handoff should keep post-edit proof bundle command");
  check(report.currentBlockerRefreshCommand === "npm run release:current-blocker", "release final handoff should keep current-blocker refresh command");
  check(report.hardGateCommand === "npm run release:external-check", "release final handoff should keep hard external gate command");
  check(report.currentRequiredKeyCount === 4, "release final handoff should track four current release-channel keys");
  check(report.currentRequiredKeys.length === 0 || releaseChannelMetadataKeys.every((key) => report.currentRequiredKeys.includes(key)), "release final handoff should cover release-channel metadata keys");
  check(report.currentRowCount === 4, "release final handoff should mirror four live-check rows");
  check(report.currentReadyCount >= 0 && report.currentReadyCount <= report.currentRowCount, "release final handoff current-ready count should be bounded");
  check(report.currentPlaceholderKeyCount >= 0 && report.currentPlaceholderKeyCount <= 4, "release final handoff placeholder key count should be bounded");
  check(report.currentEnvEditRows.every((row) => row.valueRecorded === false), "release final handoff edit rows should not record values");
  check(report.currentPlaceholderEditLocations.every((row) => row.valueRecorded === false), "release final handoff placeholder locations should not record values");
  check(report.postEditProofSequenceReceiptReady === true, "release final handoff should include ready post-edit proof sequence receipt");
  check(report.postEditProofSequenceReceiptRowCount === 7, "release final handoff should include seven post-edit proof sequence rows");
  check(report.postEditProofSequenceReceiptRows.every((row) => row.valueRecorded === false), "release final handoff post-edit sequence rows should not record values");
  check(report.releaseChannelPostEditOperatorReceiptReady === true, "release final handoff should include ready post-edit operator receipt");
  check(report.releaseChannelPostEditOperatorReceiptRowCount === 6, "release final handoff should include six post-edit operator rows");
  check(report.releaseChannelPostEditOperatorReceiptRows.every((row) => row.valueRecorded === false), "release final handoff operator rows should not record values");
  check(report.successReadyBranchCovered === true, "release final handoff should preserve success ready-branch coverage");
  check(report.successRealLocalEnvRead === false, "release final handoff success source should not read the real local env");
  check(report.successRealLocalEnvModified === false, "release final handoff success source should not modify the real local env");
  check(report.tenPlanProgressReportReceiptReady === true, "release final handoff should include ready 10-plan progress receipt");
  check(report.currentTenPlanWindowEnd >= 1200, "release final handoff should cover the plan-1200 cadence window");
  check(report.currentTenPlanWindowCompletedCount >= 9, "release final handoff should be at or beyond the 9/10 plan-1200 handoff point");
  check(report.currentTenPlanWindowCompletedCount <= report.currentTenPlanWindowTotal, "release final handoff completed-count should not exceed the current window total");
  check(report.userFacingCompletionPercent === 99.999999, "release final handoff should preserve user-facing completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "release final handoff should preserve user-facing remaining percent");
  check(report.privateValuesRecorded === false, "release final handoff should not record private values");
  check(report.networkProbeAttempted === false, "release final handoff should not probe network");
  check(report.releaseUploadAttempted === false, "release final handoff should not upload releases");
  check(report.notarySubmissionAttempted === false, "release final handoff should not submit to Apple");
  check(report.signingAttempted === false, "release final handoff should not sign artifacts");
  check(report.claimedExternalDistribution === false, "release final handoff should not claim external distribution");
  check(!/https?:\/\//i.test(JSON.stringify(report)), "release final handoff JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release final handoff Markdown should not include URL values");
  check(markdown.includes("Release Final Handoff"), "release final handoff Markdown should include title");
  check(markdown.includes("Final Handoff Commands"), "release final handoff Markdown should include commands");
  check(markdown.includes("Current Private Edit Rows"), "release final handoff Markdown should include private edit rows");
  check(markdown.includes("Post-Edit Proof Sequence Receipt"), "release final handoff Markdown should include proof sequence");
  check(markdown.includes("Release-Channel Post-Edit Operator Receipt"), "release final handoff Markdown should include operator receipt");
  check(markdown.includes("Completion Cadence"), "release final handoff Markdown should include completion cadence");
  check(markdown.includes("External distribution claimed: no"), "release final handoff Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Final handoff validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }
}

runRefresh();

const postEditProofBundle = await readRequiredJson(postEditProofBundleJsonPath, "Post-edit proof bundle");
const currentBlocker = await readRequiredJson(currentBlockerJsonPath, "Release current blocker");
const releaseProgress = await readRequiredJson(releaseProgressJsonPath, "Release progress report");
const report = buildReport({ postEditProofBundle, currentBlocker, releaseProgress });
const markdown = buildMarkdown(report);

validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(finalHandoffMarkdownPath, markdown);
await writeFile(finalHandoffJsonPath, `${JSON.stringify(report, null, 2)}\n`);

console.log("GrooveForge release final handoff passed.");
console.log(`- Markdown: ${relative(finalHandoffMarkdownPath)}`);
console.log(`- JSON: ${relative(finalHandoffJsonPath)}`);
console.log(`- Final handoff ready: ${report.releaseFinalHandoffReady ? "yes" : "no"}`);
console.log(`- State: ${report.releaseFinalHandoffState}`);
console.log(`- Release-channel metadata ready: ${report.releaseChannelMetadataReady ? "yes" : "no"}`);
console.log(`- Private edit still required: ${report.privateEditStillRequired ? "yes" : "no"}`);
console.log(`- Current target: ${report.currentTarget}`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
console.log(`- First proof after private edits: ${report.firstProofAfterPrivateEdits}`);
console.log(`- Post-edit proof bundle: ${report.postEditProofBundleCommand}`);
console.log(`- Current blocker refresh: ${report.currentBlockerRefreshCommand}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- 10-plan report due: ${report.tenPlanProgressReportDue ? "yes" : "no"}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
