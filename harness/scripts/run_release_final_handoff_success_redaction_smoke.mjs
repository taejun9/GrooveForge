#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionPrivateInputKeys } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const syntheticRoot = path.join(packageRoot, "release-final-handoff-success-redaction-smoke");
const reportStem = "release-final-handoff-success-redaction-smoke";
const successRedactionMarkdownName = "release-final-handoff-success-redaction-smoke.md";
const successRedactionJsonName = "release-final-handoff-success-redaction-smoke.json";
const finalHandoffJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`
);
const finalHandoffMarkdownPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`
);
const postEditProofBundleJsonPath = path.join(syntheticRoot, "synthetic-post-edit-proof-bundle.json");
const currentBlockerJsonPath = path.join(syntheticRoot, "synthetic-current-blocker.json");
const releaseProgressJsonPath = path.join(syntheticRoot, "synthetic-release-progress-report.json");
const strictLiveCheckJsonPath = path.join(syntheticRoot, "synthetic-strict-live-check.json");
const strictSuccessSmokeJsonPath = path.join(syntheticRoot, "synthetic-strict-success-smoke.json");
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
const planNumberPattern = /^plan-(\d+)-[a-z0-9][a-z0-9-]*\.md$/;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release final handoff success-redaction smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function currentTenPlanWindow() {
  const completedPlansDir = path.join(root, "docs", "exec_plans", "completed");
  const entries = await readdir(completedPlansDir, { withFileTypes: true });
  const completedPlanNumbers = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name.match(planNumberPattern))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter((number) => Number.isInteger(number));
  const highestPlanNumber = Math.max(...completedPlanNumbers, 0);
  const start = Math.floor((highestPlanNumber - 1) / 10) * 10 + 1;
  const end = start + 9;
  const completedCount = completedPlanNumbers.filter((number) => number >= start && number <= end).length;
  const total = 10;
  return {
    start,
    end,
    completedCount,
    total,
    label: `${start}-${end}: ${completedCount}/${total}`,
    due: completedCount >= total,
    nextReportAt: end
  };
}

function buildEditRows() {
  return releaseChannelMetadataKeys.map((key, index) => ({
    order: index + 1,
    key,
    location: `.env.distribution.local:${10 + index}`,
    editTarget: ".env.distribution.local",
    line: 10 + index,
    placeholder: false,
    assignment: `${key}=<operator-owned-value>`,
    guidance: "operator-owned release metadata stored only in the ignored local env file",
    valueRecorded: false
  }));
}

function buildSequenceRows() {
  return [
    ["Private value edit", releaseChannelApplyPrivateEnvCommand, "operator-owned metadata becomes shape-ready"],
    ["Release doctor proof", "npm run release:doctor", "doctor current action clears release-channel placeholders"],
    ["Current-blocker refresh", "npm run release:current-blocker", "current blocker mirrors release-channel ready posture"],
    ["Next-actions refresh", "npm run release:next-actions", "next action advances beyond release-channel metadata"],
    ["Proof bundle refresh", "npm run release:proof-bundle", "proof bundle mirrors cleared release-channel metadata"],
    ["Progress refresh", "npm run release:progress-smoke", "progress report keeps completion and 10-plan cadence current"],
    ["Hard-gate boundary", "npm run release:external-check", "hard gate remains the only external distribution claim boundary"]
  ].map(([step, command, expectedEvidence], index) => ({
    order: index + 1,
    step,
    ready: true,
    command,
    expectedEvidence,
    sourceField: `syntheticSuccessRedactionSequence[${index}]`,
    valueRecorded: false
  }));
}

function buildOperatorRows() {
  return [
    ["Edit release-channel metadata", "synthetic metadata rows are shape-ready", "live check reports 4/4 ready rows"],
    ["Run strict live check", "strict receipt is ready", "strict command exits zero without recording values"],
    ["Refresh current blocker", "current blocker no longer lists release-channel placeholders", "next action can advance"],
    ["Refresh proof bundle", "proof bundle mirrors ready metadata posture", "source artifacts remain value-free"],
    ["Refresh progress", "completion cadence remains current", "10-plan report state is preserved"],
    ["Respect hard gate", "external distribution is still unclaimed", "only the external hard gate may claim completion"]
  ].map(([step, currentState, expectedPostEditSignal], index) => ({
    order: index + 1,
    step,
    ready: true,
    currentState,
    operatorAction: "follow the value-free release handoff sequence",
    expectedPostEditSignal,
    sourceField: `syntheticSuccessRedactionOperatorRows[${index}]`,
    valueRecorded: false
  }));
}

function buildLiveCheckRows() {
  return releaseChannelMetadataKeys.map((key, index) => ({
    order: index + 1,
    key,
    kind: key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" ? "channel" : "url",
    present: true,
    placeholder: false,
    shapeReady: true,
    currentReady: true,
    expectedShape: key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" ? "allowed channel token" : "safe absolute HTTPS URL",
    editTarget: ".env.distribution.local",
    line: 10 + index,
    proofCommand: "npm run release:channel-live-check",
    rerunCommand: "npm run release:doctor",
    sourceField: "synthetic value-free release metadata",
    valueRecorded: false
  }));
}

function buildSourceArtifacts(tenPlan) {
  const editRows = buildEditRows();
  const sequenceRows = buildSequenceRows();
  const operatorRows = buildOperatorRows();
  const liveCheckRows = buildLiveCheckRows();
  const sourceBase = {
    appName,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    sourceMode: "synthetic-final-handoff-success-redaction-smoke",
    syntheticSuccessRedactionSmoke: true,
    realLocalEnvRead: false,
    realLocalEnvModified: false,
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttempted: false,
    signingAttempted: false,
    claimedExternalDistribution: false,
    valueRecorded: false
  };

  const postEditProofBundle = {
    ...sourceBase,
    reportCommand: "npm run release:post-edit-proof-bundle",
    releasePostEditProofBundleReady: true,
    actualPostEditProofReady: true,
    actualLiveCheckRequiredKeys: releaseChannelMetadataKeys,
    actualLiveCheckPlaceholderKeys: [],
    actualLiveCheckPlaceholderEditLocations: [],
    actualLiveCheckCurrentReadyCount: releaseChannelMetadataKeys.length,
    actualLiveCheckRowCount: releaseChannelMetadataKeys.length,
    actualLiveCheckPlaceholderKeyCount: 0,
    actualFirstProofCommandAfterPrivateEdits: "npm run release:channel-live-check",
    actualCurrentBlockerRefreshCommand: "npm run release:current-blocker",
    currentTenPlanProgressLabel: tenPlan.label,
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
    successReadyBranchCovered: true,
    successRealLocalEnvRead: false,
    successRealLocalEnvModified: false
  };

  const currentBlocker = {
    ...sourceBase,
    reportCommand: "npm run release:current-blocker",
    releaseCurrentBlockerReady: true,
    currentTarget: "Release channel metadata",
    currentFirstBlocker: "Synthetic success-redaction rehearsal cleared release-channel metadata; external distribution remains unclaimed.",
    currentEnvEditTarget: ".env.distribution.local",
    currentRequiredKeys: releaseChannelMetadataKeys,
    currentPlaceholderKeys: [],
    currentPlaceholderKeyCount: 0,
    currentEnvEditRows: editRows,
    currentPlaceholderEditLocations: [],
    releaseChannelLiveCheckCurrentReadyCount: releaseChannelMetadataKeys.length,
    releaseChannelLiveCheckRowCount: releaseChannelMetadataKeys.length,
    releaseChannelFirstProofCommandAfterPrivateEdits: "npm run release:channel-live-check",
    currentRerunCommand: "npm run release:current-blocker",
    hardGateCommand: "npm run release:external-check",
    hardGateReady: false,
    hardGateWouldFail: true,
    hardGateRequirementReadyCount: 9,
    hardGateRequirementCount: 16,
    postEditProofSequenceReceiptReady: true,
    postEditProofSequenceReceiptRows: sequenceRows,
    postEditProofSequenceReceiptRowCount: sequenceRows.length,
    postEditProofSequenceReceiptProofBundleCommand: "npm run release:proof-bundle",
    postEditProofSequenceReceiptProgressCommand: "npm run release:progress-smoke",
    releaseChannelPostEditOperatorReceiptReady: true,
    releaseChannelPostEditOperatorReceiptRows: operatorRows,
    releaseChannelPostEditOperatorReceiptRowCount: operatorRows.length,
    releaseChannelPostEditOperatorReceiptNextActionsCommand: "npm run release:next-actions"
  };

  const releaseProgress = {
    ...sourceBase,
    reportCommand: "npm run release:progress-smoke",
    tenPlanProgressReportReceiptReady: true,
    tenPlanProgressReportReceiptRowCount: 6,
    tenPlanProgressReportCadence: "report after each completed work and every 10 completed plans",
    currentTenPlanWindowLabel: tenPlan.label,
    currentTenPlanWindowStart: tenPlan.start,
    currentTenPlanWindowEnd: tenPlan.end,
    currentTenPlanWindowCompletedCount: tenPlan.completedCount,
    currentTenPlanWindowTotal: tenPlan.total,
    currentTenPlanWindowRowCount: tenPlan.completedCount,
    tenPlanProgressReportDue: tenPlan.due,
    nextTenPlanProgressReportAt: tenPlan.nextReportAt,
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
    userFacingCompletionStatus: "99.999999% complete; external/private release proof remains.",
    postEditProofSequenceReceiptReady: true,
    postEditProofSequenceReceiptRows: sequenceRows,
    postEditProofSequenceReceiptRowCount: sequenceRows.length,
    releaseChannelPostEditOperatorReceiptReady: true,
    releaseChannelPostEditOperatorReceiptRows: operatorRows,
    releaseChannelPostEditOperatorReceiptRowCount: operatorRows.length
  };

  const strictLiveCheck = {
    ...sourceBase,
    reportCommand: "npm run release:channel-live-check-strict",
    sourceMode: "synthetic-final-handoff-strict-ready-redaction-smoke",
    strictMode: true,
    strictReady: true,
    strictExitCode: 0,
    strictFailureRows: [],
    strictFailureRowCount: 0,
    releaseChannelLiveCheckReady: true,
    releaseChannelLiveCheckRows: liveCheckRows,
    releaseChannelLiveCheckCurrentReadyCount: releaseChannelMetadataKeys.length,
    releaseChannelLiveCheckRowCount: releaseChannelMetadataKeys.length,
    currentRequiredKeyCount: releaseChannelMetadataKeys.length,
    currentRequiredKeys: releaseChannelMetadataKeys,
    currentPlaceholderKeyCount: 0,
    currentPlaceholderKeys: [],
    currentPlaceholderEditLocationCount: 0,
    currentPlaceholderEditLocations: [],
    currentEnvEditTarget: ".env.distribution.local"
  };

  const strictSuccessSmoke = {
    ...strictLiveCheck,
    reportCommand: "npm run release:channel-live-check-strict-success-smoke",
    sourceMode: "synthetic-strict-success-smoke",
    syntheticSuccessSmoke: true
  };

  return {
    postEditProofBundle,
    currentBlocker,
    releaseProgress,
    strictLiveCheck,
    strictSuccessSmoke
  };
}

function buildChildEnv() {
  const childEnv = { ...process.env };
  for (const key of distributionPrivateInputKeys) {
    delete childEnv[key];
  }
  childEnv.GROOVEFORGE_DISTRIBUTION_ENV_FILE = "";
  childEnv.GROOVEFORGE_RELEASE_FINAL_HANDOFF_REPORT_STEM = reportStem;
  childEnv.GROOVEFORGE_RELEASE_FINAL_HANDOFF_POST_EDIT_PROOF_BUNDLE_JSON = relative(postEditProofBundleJsonPath);
  childEnv.GROOVEFORGE_RELEASE_FINAL_HANDOFF_CURRENT_BLOCKER_JSON = relative(currentBlockerJsonPath);
  childEnv.GROOVEFORGE_RELEASE_FINAL_HANDOFF_RELEASE_PROGRESS_JSON = relative(releaseProgressJsonPath);
  childEnv.GROOVEFORGE_RELEASE_FINAL_HANDOFF_STRICT_LIVE_CHECK_JSON = relative(strictLiveCheckJsonPath);
  childEnv.GROOVEFORGE_RELEASE_FINAL_HANDOFF_STRICT_SUCCESS_SMOKE_JSON = relative(strictSuccessSmokeJsonPath);
  return childEnv;
}

await mkdir(syntheticRoot, { recursive: true });

const tenPlan = await currentTenPlanWindow();
const sourceArtifacts = buildSourceArtifacts(tenPlan);
await writeJson(postEditProofBundleJsonPath, sourceArtifacts.postEditProofBundle);
await writeJson(currentBlockerJsonPath, sourceArtifacts.currentBlocker);
await writeJson(releaseProgressJsonPath, sourceArtifacts.releaseProgress);
await writeJson(strictLiveCheckJsonPath, sourceArtifacts.strictLiveCheck);
await writeJson(strictSuccessSmokeJsonPath, sourceArtifacts.strictSuccessSmoke);

const result = spawnSync(process.execPath, ["harness/scripts/run_release_final_handoff.mjs", "--from-existing"], {
  cwd: root,
  env: buildChildEnv(),
  encoding: "utf8"
});

if (result.status !== 0) {
  fail("Final handoff success-redaction source validation did not pass.", [result.stdout, result.stderr].filter(Boolean).join("\n"));
}

const report = JSON.parse(await readFile(finalHandoffJsonPath, "utf8"));
const markdown = await readFile(finalHandoffMarkdownPath, "utf8");
const combinedOutput = `${JSON.stringify(report)}\n${markdown}\n${result.stdout}\n${result.stderr}`;

check(report.syntheticSuccessRedactionSmoke === true, "success-redaction report should mark synthetic smoke mode");
check(report.sourceMode === "synthetic-final-handoff-success-redaction-smoke", "success-redaction report should record synthetic source mode");
check(report.reportCommand === "npm run release:final-handoff-success-redaction-smoke", "success-redaction report should record smoke command");
check(report.releaseFinalHandoffReady === true, "success-redaction report should be ready");
check(report.releaseChannelMetadataReady === true, "success-redaction report should prove release-channel metadata ready posture");
check(report.privateEditStillRequired === false, "success-redaction report should clear private-edit-required posture");
check(report.currentReadyCount === 4, "success-redaction report should show four ready rows");
check(report.currentRowCount === 4, "success-redaction report should show four current rows");
check(report.currentPlaceholderKeyCount === 0, "success-redaction report should show zero placeholder keys");
check(report.currentPlaceholderEditLocationCount === 0, "success-redaction report should show zero placeholder locations");
check(report.realStrictReady === true, "success-redaction report should show strict ready");
check(report.realStrictExitCode === 0, "success-redaction report should show strict exit zero");
check(report.realStrictCurrentReadyCount === 4, "success-redaction report should show four strict ready rows");
check(report.realStrictPlaceholderKeyCount === 0, "success-redaction report should show zero strict placeholder keys");
check(report.strictSuccessSmokeReady === true, "success-redaction report should keep strict success smoke ready");
check(report.realLocalEnvRead === false, "success-redaction report should not read real local env");
check(report.realLocalEnvModified === false, "success-redaction report should not modify real local env");
check(report.privateValuesRecorded === false, "success-redaction report should not record private values");
check(report.networkProbeAttempted === false, "success-redaction report should not probe network");
check(report.releaseUploadAttempted === false, "success-redaction report should not upload releases");
check(report.notarySubmissionAttempted === false, "success-redaction report should not submit to Apple");
check(report.signingAttempted === false, "success-redaction report should not sign artifacts");
check(report.claimedExternalDistribution === false, "success-redaction report should not claim external distribution");
check(report.userFacingCompletionPercent === 99.999999, "success-redaction report should preserve completion percent");
check(report.userFacingRemainingPercent === 0.000001, "success-redaction report should preserve remaining percent");
check(!/https?:\/\//i.test(combinedOutput), "success-redaction output should not include URL values");
check(!combinedOutput.includes("direct-download"), "success-redaction output should not include synthetic channel values");
check(markdown.includes("Synthetic success-redaction smoke: yes"), "success-redaction Markdown should include smoke posture");
check(markdown.includes("Real local env read by this handoff: no"), "success-redaction Markdown should state no real local env read");
check(markdown.includes("External distribution claimed: no"), "success-redaction Markdown should keep external distribution unclaimed");

if (failures.length > 0) {
  fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
}

console.log("GrooveForge release final handoff success-redaction smoke passed.");
console.log(`- Markdown: ${relative(finalHandoffMarkdownPath)}`);
console.log(`- JSON: ${relative(finalHandoffJsonPath)}`);
console.log("- Final handoff ready: yes");
console.log("- Synthetic success-redaction smoke: yes");
console.log("- Release-channel metadata ready posture: yes");
console.log("- Current ready rows: 4/4");
console.log("- Current placeholder keys: 0");
console.log("- Real strict ready: yes");
console.log("- Real local env read: no");
console.log("- Real local env modified: no");
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
