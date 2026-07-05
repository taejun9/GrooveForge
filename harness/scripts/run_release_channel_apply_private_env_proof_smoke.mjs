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
const reportStem = "release-channel-apply-private-env-proof-success-smoke";
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function runProofRunnerSuccessSmoke() {
  const child = spawnSync(process.execPath, ["harness/scripts/run_release_channel_apply_private_env_proof.mjs", "--success-smoke"], {
    cwd: root,
    env: process.env,
    encoding: "utf8"
  });
  return {
    command: "node harness/scripts/run_release_channel_apply_private_env_proof.mjs --success-smoke",
    status: Number.isInteger(child.status) ? child.status : 1,
    output: `${child.stdout ?? ""}\n${child.stderr ?? ""}`,
    errorMessage: child.error?.message ?? "none"
  };
}

async function readJsonIfPresent(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function hasUrlValue(text) {
  return /https?:\/\//i.test(text);
}

const child = runProofRunnerSuccessSmoke();
check(child.status === 0, "release-channel apply private env proof success runner should exit zero");
check(child.errorMessage === "none", "release-channel apply private env proof success runner should not have spawn errors");
check(!hasUrlValue(child.output), "release-channel apply private env proof success runner output should not include URL values");
check(existsSync(jsonPath), "release-channel apply private env proof success JSON should exist");
check(existsSync(markdownPath), "release-channel apply private env proof success Markdown should exist");

const report = await readJsonIfPresent(jsonPath);
const markdown = existsSync(markdownPath) ? await readFile(markdownPath, "utf8") : "";
if (report) {
  check(report.successSmoke === true, "proof success report should mark success smoke mode");
  check(report.sourceMode === "synthetic-success-smoke", "proof success report should use synthetic success mode");
  check(report.releaseChannelApplyPrivateEnvProofRunnerReady === true, "proof success report should be ready");
  check(report.preflightReady === true, "proof success report should pass preflight");
  check(report.applyAttempted === true, "proof success report should attempt apply");
  check(report.applyReady === true, "proof success report should pass apply");
  check(report.strictProofAttempted === true, "proof success report should attempt strict proof");
  check(report.strictProofReady === true, "proof success report should pass strict proof");
  check(report.completionSummaryAttempted === true, "proof success report should attempt completion summary");
  check(report.completionSummaryReady === true, "proof success report should pass completion summary");
  check(report.commandRowCount === 4, "proof success report should include four command rows");
  check(report.commandRowsValueFree === true, "proof success command rows should be value-free");
  check(report.sourceRowCount === 4, "proof success report should include four source rows");
  check(report.sourceRowsValueFree === true, "proof success source rows should be value-free");
  check(report.privateInputFileLocationRowCount === 4, "proof success report should include four private input location rows");
  check(report.privateInputFileLocationRowsValueFree === true, "proof success private input location rows should be value-free");
  check(report.privateInputFileLocationPlaceholderCount === 0, "proof success report should not include private input placeholder rows");
  check(report.privateInputFileLocationInvalidShapeCount === 0, "proof success report should not include private input invalid-shape rows");
  check(report.preflightRemediationRowCount === 4, "proof success report should include four preflight remediation rows");
  check(report.preflightRemediationRowsValueFree === true, "proof success preflight remediation rows should be value-free");
  check(report.nextOperatorAction === "run apply only after preflight readiness", "proof success report should expose the post-preflight next action");
  check(report.proofRunnerResumeAliasesReady === true, "proof success report should expose resume aliases");
  check(report.proofRunnerResumeAliasRowCount === 17, "proof success report should include 17 resume alias rows");
  check(report.proofRunnerResumeAliasRowsValueFree === true, "proof success resume alias rows should be value-free");
  check(
    report.proofRunnerResumeFirstCommandAlias === "npm run release:channel-apply-private-env-preflight",
    "proof success report should preserve preflight as the resume first command"
  );
  check(report.proofRunnerResumeApplyCommandAlias === "npm run release:channel-apply-private-env", "proof success report should expose apply resume alias");
  check(report.proofRunnerResumeStrictProofCommandAlias === "npm run release:private-edit-strict-proof", "proof success report should expose strict proof resume alias");
  check(
    report.proofRunnerResumePrivateInputEditTarget === "none; private inputs are shape-ready",
    "proof success report should not ask for private input edits after ready inputs"
  );
  check(report.proofRunnerResumePlaceholderLocationCount === 0, "proof success report should expose zero resume placeholder locations");
  check(report.appliedKeyCount === 4, "proof success report should apply four keys");
  check(report.currentReadyKeyCount === 4, "proof success report should report four ready keys");
  check(report.currentRequiredKeyCount === 4, "proof success report should track four release-channel keys");
  check(report.currentOperatorStartCommand === "npm run release:channel-apply-private-env-preflight", "proof success report should preserve preflight as the first operator command");
  check(report.currentOperatorStartCommandMatchesFirstCommand === true, "proof success report should match the first command");
  check(report.realLocalEnvModified === false, "proof success report should not modify the real local env");
  check(report.localEnvModifiedBeforePreflightReady === false, "proof success report should not modify local env before preflight readiness");
  check(report.privateValuesRecorded === false, "proof success report should not record private values");
  check(report.localEnvValueRecorded === false, "proof success report should not record local env values");
  check(report.releaseUrlValueRecorded === false, "proof success report should not record release URL values");
  check(report.supportUrlValueRecorded === false, "proof success report should not record support URL values");
  check(report.channelValueRecorded === false, "proof success report should not record channel values");
  check(report.networkProbeAttempted === false, "proof success report should not probe networks");
  check(report.updateFeedProbeAttempted === false, "proof success report should not probe update feeds");
  check(report.releaseUploadAttempted === false, "proof success report should not upload releases");
  check(report.signingAttempted === false, "proof success report should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "proof success report should not submit to Apple");
  check(report.claimedAutoUpdate === false, "proof success report should not claim auto-update");
  check(report.claimedExternalDistribution === false, "proof success report should not claim external distribution");
  check(!hasUrlValue(JSON.stringify(report)), "proof success JSON should not include URL values");
}
check(!hasUrlValue(markdown), "proof success Markdown should not include URL values");
check(markdown.includes("Proof Runner Resume Aliases"), "proof success Markdown should include resume aliases");
check(markdown.includes("Private Input Location Rows"), "proof success Markdown should include private input location rows");
check(markdown.includes("Preflight Remediation Rows"), "proof success Markdown should include preflight remediation rows");

if (failures.length > 0) {
  console.error("GrooveForge release-channel apply private env proof smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error(`- Proof runner status: ${child.status}`);
  process.exit(1);
}

console.log("GrooveForge release-channel apply private env proof smoke passed.");
console.log(`- Markdown: ${relative(markdownPath)}`);
console.log(`- JSON: ${relative(jsonPath)}`);
console.log("- Runner ready: yes");
console.log("- Preflight ready: yes");
console.log("- Apply ready: yes");
console.log("- Strict proof ready: yes");
console.log("- Completion summary ready: yes");
console.log("- Proof runner resume aliases: ready");
console.log("- Applied rows: 4");
console.log("- Current ready rows: 4/4");
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
