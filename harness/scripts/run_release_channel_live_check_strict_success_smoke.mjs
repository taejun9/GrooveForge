#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionLocalEnvDefaults, distributionPrivateInputKeys } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const syntheticRoot = path.join(packageRoot, "release-channel-live-check-strict-success-smoke");
const syntheticEnvPath = path.join(syntheticRoot, distributionLocalEnvDefaults.defaultEnvFileName);
const strictSuccessJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-live-check-strict-success-smoke.json`
);
const strictSuccessMarkdownPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-live-check-strict-success-smoke.md`
);
const strictSuccessStem = "release-channel-live-check-strict-success-smoke";
const failures = [];

const syntheticEnv = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL=direct-download",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL=https://download.invalid/grooveforge",
  "GROOVEFORGE_RELEASE_NOTES_URL=https://notes.invalid/grooveforge",
  "GROOVEFORGE_SUPPORT_URL=https://support.invalid/grooveforge"
].join("\n");

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release-channel live check strict success smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function buildChildEnv() {
  const childEnv = { ...process.env };
  for (const key of distributionPrivateInputKeys) {
    delete childEnv[key];
  }
  childEnv[distributionLocalEnvDefaults.configuredFileKey] = "";
  childEnv.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_ENV_ROOT = relative(syntheticRoot);
  childEnv.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_REPORT_STEM = strictSuccessStem;
  return childEnv;
}

await mkdir(syntheticRoot, { recursive: true });
await writeFile(syntheticEnvPath, `${syntheticEnv}\n`, "utf8");

const result = spawnSync(process.execPath, ["harness/scripts/run_release_channel_live_check.mjs", "--strict"], {
  cwd: root,
  env: buildChildEnv(),
  encoding: "utf8"
});

if (result.status !== 0) {
  fail(
    "Strict live check did not pass with synthetic shape-ready metadata.",
    [result.stdout, result.stderr].filter(Boolean).join("\n")
  );
}

const json = JSON.parse(await readFile(strictSuccessJsonPath, "utf8"));
const markdown = await readFile(strictSuccessMarkdownPath, "utf8");
const combinedOutput = `${JSON.stringify(json)}\n${markdown}\n${result.stdout}\n${result.stderr}`;

check(json.syntheticSuccessSmoke === true, "strict success smoke should mark synthetic success mode");
check(json.sourceMode === "synthetic-strict-success-smoke", "strict success smoke should use synthetic source mode");
check(json.reportCommand === "npm run release:channel-live-check-strict-success-smoke", "strict success smoke should report the smoke command");
check(json.strictMode === true, "strict success smoke should run strict mode");
check(json.strictReady === true, "strict success smoke should be strict-ready");
check(json.strictExitCode === 0, "strict success smoke should record exit code zero");
check(json.strictFailureRowCount === 0, "strict success smoke should have zero strict failure rows");
check(Array.isArray(json.strictFailureRows) && json.strictFailureRows.length === 0, "strict success smoke failure rows should be empty");
check(json.releaseChannelLiveCheckReady === true, "strict success smoke live check should be ready");
check(json.releaseChannelLiveCheckCurrentReadyCount === 4, "strict success smoke should have four ready rows");
check(json.releaseChannelLiveCheckRowCount === 4, "strict success smoke should cover four rows");
check(json.currentRequiredKeyCount === 4, "strict success smoke should require four keys");
check(json.currentPlaceholderKeyCount === 0, "strict success smoke should have zero placeholder keys");
check(Array.isArray(json.currentPlaceholderKeys) && json.currentPlaceholderKeys.length === 0, "strict success smoke placeholder keys should be empty");
check(json.currentPlaceholderEditLocationCount === 0, "strict success smoke should have zero placeholder edit locations");
check(Array.isArray(json.releaseChannelLiveCheckRows) && json.releaseChannelLiveCheckRows.every((row) => row.valueRecorded === false), "strict success smoke rows should not record values");
check(json.realLocalEnvRead === false, "strict success smoke should not read the real local env root");
check(json.realLocalEnvModified === false, "strict success smoke should not modify the real local env");
check(json.privateValuesRecorded === false, "strict success smoke should not record private values");
check(json.networkProbeAttempted === false, "strict success smoke should not probe the network");
check(json.releaseUploadAttempted === false, "strict success smoke should not upload releases");
check(json.notarySubmissionAttempted === false, "strict success smoke should not submit to Apple");
check(json.signingAttempted === false, "strict success smoke should not sign artifacts");
check(json.releaseGateClaimedExternalDistribution === false, "strict success smoke should not claim external distribution");
check(!combinedOutput.includes("direct-download"), "strict success smoke output should not include synthetic channel values");
check(!/https?:\/\//i.test(combinedOutput), "strict success smoke output should not include URL values");
check(markdown.includes("Strict Failure Rows"), "strict success smoke Markdown should include strict failure rows");
check(markdown.includes("Private values recorded: no"), "strict success smoke Markdown should state value redaction");

if (failures.length > 0) {
  fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
}

console.log("GrooveForge release-channel live check strict success smoke passed.");
console.log(`- Markdown: ${relative(strictSuccessMarkdownPath)}`);
console.log(`- JSON: ${relative(strictSuccessJsonPath)}`);
console.log("- Strict ready: yes");
console.log("- Current ready rows: 4/4");
console.log("- Current placeholder keys: 0");
console.log("- Real local env read: no");
console.log("- Real local env modified: no");
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
