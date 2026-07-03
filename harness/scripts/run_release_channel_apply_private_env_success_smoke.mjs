#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const syntheticRoot = path.join(packageRoot, "release-channel-apply-private-env-success-smoke");
const syntheticRootRelative = path.relative(root, syntheticRoot);
const syntheticEnvPath = path.join(syntheticRoot, ".env.distribution.local");
const reportJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-apply-private-env-success-smoke.json`
);
const syntheticValues = {
  GROOVEFORGE_DISTRIBUTION_CHANNEL: "private-beta",
  GROOVEFORGE_RELEASE_DOWNLOAD_URL: "https://downloads.invalid/grooveforge.dmg",
  GROOVEFORGE_RELEASE_NOTES_URL: "https://downloads.invalid/grooveforge-notes",
  GROOVEFORGE_SUPPORT_URL: "https://support.invalid/grooveforge"
};
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message) {
  console.error("GrooveForge release-channel private env apply success smoke failed:");
  console.error(`- ${message}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  const separatorIndex = trimmed.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }
  return {
    key: trimmed.slice(0, separatorIndex).trim(),
    value: trimmed.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "")
  };
}

function outputContainsSyntheticValues(output) {
  return Object.values(syntheticValues).some((value) => output.includes(value));
}

await mkdir(syntheticRoot, { recursive: true });
await writeFile(
  syntheticEnvPath,
  [
    "# Synthetic success-smoke fixture for release-channel private env apply.",
    "GROOVEFORGE_DISTRIBUTION_CHANNEL=<distribution-channel>",
    "GROOVEFORGE_RELEASE_DOWNLOAD_URL=https://example.com/download",
    "GROOVEFORGE_RELEASE_NOTES_URL=https://example.com/notes",
    "GROOVEFORGE_SUPPORT_URL=https://example.com/support",
    ""
  ].join("\n"),
  "utf8"
);

const child = spawnSync(
  process.execPath,
  ["harness/scripts/run_release_channel_apply_private_env.mjs", "--success-smoke"],
  {
    cwd: root,
    env: {
      ...process.env,
      ...syntheticValues,
      GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT: syntheticRootRelative,
      GROOVEFORGE_DISTRIBUTION_ENV_FILE: ".env.distribution.local"
    },
    encoding: "utf8"
  }
);

const childOutput = `${child.stdout ?? ""}\n${child.stderr ?? ""}`;
check(child.status === 0, "release-channel private env apply success child should exit zero");
check(outputContainsSyntheticValues(childOutput) === false, "release-channel private env apply success child output should not include synthetic values");
check(!/https?:\/\//i.test(childOutput), "release-channel private env apply success child output should not include URL values");
check(existsSync(reportJsonPath), "release-channel private env apply success report JSON should exist");

const report = existsSync(reportJsonPath) ? JSON.parse(await readFile(reportJsonPath, "utf8")) : null;
if (report) {
  check(report.syntheticSuccessSmoke === true, "success report should mark synthetic success smoke");
  check(report.localEnvRootOverrideEnabled === true, "success report should use local env root override");
  check(report.realLocalEnvRead === false, "success report should not read real local env");
  check(report.realLocalEnvModified === false, "success report should not modify real local env");
  check(report.releaseChannelPrivateEnvApplyReady === true, "success report should mark apply ready");
  check(report.appliedKeyCount === 4, "success report should apply four keys");
  check(report.currentReadyKeyCount === 4, "success report should show four current-ready keys");
  check(report.currentPlaceholderKeyCount === 0, "success report should clear placeholder keys");
  check(report.recommendedOperatorProofCommand === "npm run release:private-edit-strict-proof", "success report should keep strict proof chain");
  check(report.operatorReceiptReady === true, "success report should include a ready value-free operator receipt");
  check(report.operatorReceiptRowCount === 6, "success report operator receipt should include six rows");
  check(report.operatorReceiptRows.every((row) => row.valueRecorded === false), "success report operator receipt rows should be value-free");
  check(
    report.operatorReceiptRows.some((row) => row.command === "npm run release:channel-apply-private-env"),
    "success report operator receipt should include the write command"
  );
  check(
    report.operatorReceiptRows.some((row) => row.command === "npm run release:private-edit-strict-proof"),
    "success report operator receipt should include the strict proof chain"
  );
  check(report.privateValuesRecorded === false, "success report should not record private values");
  check(report.localEnvValueRecorded === false, "success report should not record local env values");
  check(report.networkProbeAttempted === false, "success report should not probe networks");
  check(report.releaseGateClaimedExternalDistribution === false, "success report should not claim external distribution");
  check(JSON.stringify(report).includes("https://") === false, "success report JSON should not include URL values");
  check(outputContainsSyntheticValues(JSON.stringify(report)) === false, "success report JSON should not include synthetic values");
}

const updatedLines = (await readFile(syntheticEnvPath, "utf8")).split(/\r?\n/);
const updatedEntries = new Map(updatedLines.map(parseEnvLine).filter(Boolean).map((entry) => [entry.key, entry.value]));
for (const [key, value] of Object.entries(syntheticValues)) {
  check(updatedEntries.get(key) === value, `synthetic env should receive ${key}`);
}

if (failures.length > 0) {
  if (childOutput.trim()) {
    console.error(childOutput.trim());
  }
  fail("Validation failed.");
}

process.stdout.write(child.stdout ?? "");
process.stderr.write(child.stderr ?? "");
console.log("GrooveForge release-channel private env apply success smoke passed.");
console.log(`- Synthetic env root: ${syntheticRootRelative}`);
console.log("- Synthetic env modified: yes");
console.log("- Applied rows: 4");
console.log("- Current ready rows: 4/4");
console.log("- Operator receipt rows: 6");
console.log("- Real local env read: no");
console.log("- Real local env modified: no");
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
