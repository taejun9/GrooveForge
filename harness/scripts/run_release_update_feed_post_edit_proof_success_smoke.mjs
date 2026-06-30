#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const successStem = "release-update-feed-post-edit-proof-success-smoke";
const successMarkdownName = "release-update-feed-post-edit-proof-success-smoke.md";
const successJsonName = "release-update-feed-post-edit-proof-success-smoke.json";
const successJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${successStem}.json`);
const successMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${successStem}.md`);
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge update feed post-edit proof success smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

const childEnv = {
  ...process.env,
  GROOVEFORGE_UPDATE_FEED_POST_EDIT_PROOF_REPORT_STEM: successStem
};
const result = spawnSync(process.execPath, ["harness/scripts/run_release_update_feed_post_edit_proof.mjs"], {
  cwd: root,
  env: childEnv,
  encoding: "utf8"
});

if (result.status !== 0) {
  fail("Update feed post-edit proof did not pass in synthetic success-smoke mode.", [result.stdout, result.stderr].filter(Boolean).join("\n"));
}

if (!existsSync(successJsonPath) || !existsSync(successMarkdownPath)) {
  fail(
    "Update feed post-edit proof success-smoke artifacts are missing.",
    `Expected: ${relative(successJsonPath)} and ${relative(successMarkdownPath)}`
  );
}

const json = JSON.parse(await readFile(successJsonPath, "utf8"));
const markdown = await readFile(successMarkdownPath, "utf8");
const combinedOutput = `${JSON.stringify(json)}\n${markdown}\n${result.stdout}\n${result.stderr}`;

check(json.sourceMode === "synthetic-update-feed-post-edit-proof-success-smoke", "success smoke should use synthetic source mode");
check(json.syntheticSuccessSmoke === true, "success smoke should mark synthetic success mode");
check(json.reportCommand === "npm run release:update-feed-post-edit-proof-success-smoke", "success smoke should report the success smoke command");
check(json.updateFeedPostEditProofMarkdownArtifactName === successMarkdownName, "success smoke Markdown artifact name should match");
check(json.updateFeedPostEditProofJsonArtifactName === successJsonName, "success smoke JSON artifact name should match");
check(json.releaseUpdateFeedPostEditProofReady === true, "success smoke post-edit proof should be ready");
check(json.releaseUpdateFeedPostEditProofCommandSummary === "npm run release:update-feed-live-check-strict-success-smoke -> npm run desktop:auto-update-readiness-smoke", "success smoke should run strict success live check before auto-update readiness");
check(json.updateFeedLiveCheckReady === true, "success smoke should prove update feed live-check readiness");
check(json.updateFeedStrictReady === true, "success smoke should prove strict readiness");
check(json.updateFeedStrictExitCode === 0, "success smoke strict exit code should be zero");
check(json.updateFeedStrictFailureRowCount === 0, "success smoke should have zero strict failure rows");
check(Array.isArray(json.updateFeedStrictFailureRows) && json.updateFeedStrictFailureRows.length === 0, "success smoke strict failure rows should be empty");
check(json.currentSelectedReadyCount === 2, "success smoke should have two selected-ready keys");
check(json.currentPlaceholderKeyCount === 0, "success smoke should have zero placeholder keys");
check(Array.isArray(json.currentPlaceholderKeys) && json.currentPlaceholderKeys.length === 0, "success smoke placeholder keys should be empty");
check(json.currentPlaceholderEditLocationCount === 0, "success smoke should have zero placeholder edit locations");
check(Array.isArray(json.currentPlaceholderEditLocations) && json.currentPlaceholderEditLocations.length === 0, "success smoke placeholder edit locations should be empty");
check(Array.isArray(json.updateFeedLiveCheckRows) && json.updateFeedLiveCheckRows.every((row) => row.valueRecorded === false), "success smoke feed rows should be value-free");
check(Array.isArray(json.sourceArtifactRows) && json.sourceArtifactRows.every((row) => row.valueRecorded === false), "success smoke source rows should be value-free");
check(Array.isArray(json.proofRows) && json.proofRows.every((row) => row.valueRecorded === false), "success smoke proof rows should be value-free");
check(Array.isArray(json.autoUpdateBlockerRows) && json.autoUpdateBlockerRows.every((row) => row.valueRecorded === false), "success smoke auto-update blocker rows should be value-free");
check(json.autoUpdateReady === false, "success smoke should keep real auto-update readiness false");
check(json.autoUpdateBlocked === true, "success smoke should report real auto-update blockers");
check(json.autoUpdateBlockerCount > 0, "success smoke should include auto-update blocker rows");
check(json.signedUpdateArtifactsReady === false, "success smoke should keep signed update artifacts unready");
check(json.hardGateCommand === "npm run release:external-check", "success smoke should keep hard external gate command");
check(json.hardGateReady === false, "success smoke should keep hard gate unready");
check(json.hardGateWouldFail === true, "success smoke should keep hard gate would-fail posture");
check(json.realLocalEnvRead === false, "success smoke should not read the real local env root for the live check");
check(json.realLocalEnvModified === false, "success smoke should not modify the real local env");
check(json.userFacingCompletionPercent === 99.999999, "success smoke should preserve completion percent");
check(json.userFacingRemainingPercent === 0.000001, "success smoke should preserve remaining percent");
check(json.privateValuesRecorded === false, "success smoke should not record private values");
check(json.feedValueRecorded === false, "success smoke should not record feed values");
check(json.channelValueRecorded === false, "success smoke should not record channel values");
check(json.localEnvValueRecorded === false, "success smoke should not record local env values");
check(json.networkProbeAttempted === false, "success smoke should not probe the network");
check(json.updateFeedPublishAttempted === false, "success smoke should not publish update feeds");
check(json.releaseUploadAttempted === false, "success smoke should not upload releases");
check(json.signingAttempted === false, "success smoke should not sign artifacts");
check(json.notarySubmissionAttempted === false, "success smoke should not submit to Apple");
check(json.claimedAutoUpdate === false, "success smoke should not claim auto-update");
check(json.claimedExternalDistribution === false, "success smoke should not claim external distribution");
check(!combinedOutput.includes("stable"), "success smoke output should not include synthetic channel values");
check(!combinedOutput.includes("updates.invalid"), "success smoke output should not include synthetic feed host values");
check(!/https?:\/\//i.test(combinedOutput), "success smoke output should not include URL values");
check(markdown.includes("Update Feed Post-Edit Proof"), "success smoke Markdown should include title");
check(markdown.includes("Update feed live check ready: yes"), "success smoke Markdown should prove live readiness");
check(markdown.includes("Auto-update ready: no"), "success smoke Markdown should keep auto-update unready");
check(markdown.includes("Signed update artifacts ready: no"), "success smoke Markdown should keep signed artifacts unready");
check(markdown.includes("Auto-update claimed: no"), "success smoke Markdown should keep auto-update unclaimed");
check(markdown.includes("External distribution claimed: no"), "success smoke Markdown should keep external distribution unclaimed");

if (failures.length > 0) {
  fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
}

console.log("GrooveForge update feed post-edit proof success smoke passed.");
console.log(`- Markdown: ${relative(successMarkdownPath)}`);
console.log(`- JSON: ${relative(successJsonPath)}`);
console.log("- Proof ready: yes");
console.log("- Update feed live check ready: yes");
console.log("- Current selected keys ready: 2/2");
console.log("- Current placeholder keys: 0");
console.log("- Auto-update ready: no");
console.log(`- Auto-update blocker rows: ${json.autoUpdateBlockerCount}`);
console.log("- Signed update artifacts ready: no");
console.log(`- Current 10-plan progress: ${json.currentTenPlanProgressLabel}`);
console.log(`- User-facing completion: ${json.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${json.userFacingRemainingPercent}%`);
console.log("- Real local env read by live check: no");
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
