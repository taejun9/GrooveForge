#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionPrivateInputKeys } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const smokeRoot = path.join(packageRoot, "release-channel-apply-private-env-targeted-smoke");
const envFileName = ".env.distribution.local";
const syntheticEnvPath = path.join(smokeRoot, envFileName);
const reportStem = "release-channel-apply-private-env-targeted-smoke";
const markdownArtifactName = "release-channel-apply-private-env-targeted-smoke.md";
const jsonArtifactName = "release-channel-apply-private-env-targeted-smoke.json";
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const preflightReportJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-apply-private-env-preflight.json`
);
const applyReportJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-apply-private-env.json`
);
const strictReportJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-live-check-strict.json`
);
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const unrelatedPrivateKeys = distributionPrivateInputKeys.filter((key) => !releaseChannelMetadataKeys.includes(key));
const commandNames = {
  preflight: "npm run release:channel-apply-private-env-preflight",
  apply: "npm run release:channel-apply-private-env",
  strict: "npm run release:channel-live-check-strict",
  proof: "npm run release:private-edit-strict-proof",
  currentBlocker: "npm run release:current-blocker"
};
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

function relative(filePath) {
  return path.relative(root, filePath);
}

function readyLabel(value) {
  return value === true ? "yes" : "no";
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  const withoutExport = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
  const separatorIndex = withoutExport.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }
  const key = withoutExport.slice(0, separatorIndex).trim();
  let value = withoutExport.slice(separatorIndex + 1).trim();
  if (!/^[A-Z0-9_]+$/.test(key)) {
    return null;
  }
  if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function parseEnvMap(text) {
  const entries = new Map();
  for (const line of text.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (parsed) {
      entries.set(parsed.key, parsed.value);
    }
  }
  return entries;
}

function outputContainsSyntheticValues(output) {
  return Object.values(syntheticValues).some((value) => output.includes(value));
}

function childEnv(extraEnv = {}) {
  const env = { ...process.env };
  for (const key of distributionPrivateInputKeys) {
    delete env[key];
  }
  delete env.GROOVEFORGE_DISTRIBUTION_ENV_FILE;
  delete env.GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT;
  delete env.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_ENV_ROOT;
  delete env.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_REPORT_STEM;
  return {
    ...env,
    ...extraEnv,
    GROOVEFORGE_DISTRIBUTION_ENV_FILE: envFileName
  };
}

function runNodeScript(args, env) {
  return spawnSync(process.execPath, args, {
    cwd: root,
    env,
    encoding: "utf8"
  });
}

async function writeFullSyntheticScaffold() {
  await rm(smokeRoot, { recursive: true, force: true });
  await mkdir(smokeRoot, { recursive: true });
  const lines = [
    "# Synthetic full distribution env scaffold for targeted release-channel apply.",
    "# Release-channel metadata placeholders.",
    "GROOVEFORGE_DISTRIBUTION_CHANNEL=<distribution-channel>",
    "GROOVEFORGE_RELEASE_DOWNLOAD_URL=<release-download-url>",
    "GROOVEFORGE_RELEASE_NOTES_URL=<release-notes-url>",
    "GROOVEFORGE_SUPPORT_URL=<support-url>",
    "",
    "# Unrelated private distribution placeholders that must be preserved.",
    "GROOVEFORGE_DISTRIBUTION_QA_APPROVED=<manual-qa-approval>",
    "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256=<manual-qa-checklist-sha256>",
    "GROOVEFORGE_UPDATE_FEED_URL=<update-feed-url>",
    "ELECTRON_UPDATE_FEED_URL=<electron-update-feed-url>",
    "UPDATE_FEED_URL=<generic-update-feed-url>",
    "GROOVEFORGE_UPDATE_CHANNEL=<update-channel>",
    "ELECTRON_UPDATE_CHANNEL=<electron-update-channel>",
    "UPDATE_CHANNEL=<generic-update-channel>",
    "GROOVEFORGE_DEVELOPER_ID_IDENTITY=<developer-id-identity>",
    "GROOVEFORGE_NOTARY_SUBMIT=<notary-submit-flag>",
    "APPLE_ID=<apple-id>",
    "APPLE_TEAM_ID=<apple-team-id>",
    "APPLE_APP_SPECIFIC_PASSWORD=<apple-app-specific-password>",
    "ASC_KEY_ID=<asc-key-id>",
    "ASC_ISSUER_ID=<asc-issuer-id>",
    "ASC_KEY_PATH=<asc-key-path>",
    "APPLE_NOTARY_PROFILE=<apple-notary-profile>",
    "NOTARYTOOL_KEYCHAIN_PROFILE=<notarytool-keychain-profile>",
    ""
  ];
  await writeFile(syntheticEnvPath, lines.join("\n"), "utf8");
}

function changedKeys(beforeMap, afterMap) {
  return [...new Set([...beforeMap.keys(), ...afterMap.keys()])].filter((key) => beforeMap.get(key) !== afterMap.get(key));
}

function buildKeyRows(beforeMap, afterMap) {
  return distributionPrivateInputKeys.map((key, index) => {
    const changed = beforeMap.get(key) !== afterMap.get(key);
    return {
      order: index + 1,
      key,
      scope: releaseChannelMetadataKeys.includes(key) ? "release-channel" : "unrelated-private",
      changed,
      expectedChanged: releaseChannelMetadataKeys.includes(key),
      preserved: releaseChannelMetadataKeys.includes(key) ? false : changed === false,
      valueRecorded: false
    };
  });
}

function formatRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.scope)} | ${readyLabel(row.changed)} | ${readyLabel(row.expectedChanged)} | ${readyLabel(row.preserved)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} Release-Channel Targeted Apply Smoke

## Summary

- Targeted apply ready: ${readyLabel(report.releaseChannelTargetedApplySmokeReady)}
- Preflight ready: ${readyLabel(report.preflightReady)}
- Apply ready: ${readyLabel(report.applyReady)}
- Strict live-check ready: ${readyLabel(report.strictLiveCheckReady)}
- Preflight operator receipt rows: ${report.preflightOperatorReceiptRowCount}
- Apply operator receipt rows: ${report.applyOperatorReceiptRowCount}
- Release-channel changed keys: ${report.releaseChannelChangedKeyCount}/${report.releaseChannelKeyCount}
- Unrelated private keys preserved: ${report.unrelatedPrivatePreservedKeyCount}/${report.unrelatedPrivateKeyCount}
- Changed key values recorded: no
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Next write command: \`${report.nextWriteCommand}\`
- Strict proof command: \`${report.recommendedOperatorProofCommand}\`
- Real local env read: ${readyLabel(report.realLocalEnvRead)}
- Real local env modified: ${readyLabel(report.realLocalEnvModified)}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- External distribution claimed: no

## Key Rows

| order | key | scope | changed | expected changed | preserved | value recorded |
|---:|---|---|---:|---:|---:|---:|
${formatRows(report.keyRows)}

## Not Recorded

This smoke records key names, scopes, changed booleans, preservation booleans, counts, command names, and artifact paths only. It does not record release URLs, support URLs, channel values, update feed values, credentials, tokens, Developer ID identity labels, notary values, manual QA values, local env values, private beats, or real user audio.

## Not Claimed

This smoke does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function readJson(filePath) {
  check(existsSync(filePath), `${relative(filePath)} should exist`);
  return existsSync(filePath) ? JSON.parse(await readFile(filePath, "utf8")) : null;
}

await mkdir(packageRoot, { recursive: true });
await writeFullSyntheticScaffold();

const syntheticRootRelative = relative(smokeRoot);
const beforeText = await readFile(syntheticEnvPath, "utf8");
const beforeMap = parseEnvMap(beforeText);
const preflight = runNodeScript(
  ["harness/scripts/run_release_channel_apply_private_env.mjs", "--preflight"],
  childEnv({
    ...syntheticValues,
    GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT: syntheticRootRelative
  })
);
const preflightOutput = `${preflight.stdout ?? ""}\n${preflight.stderr ?? ""}`;
const afterPreflightText = await readFile(syntheticEnvPath, "utf8");
check(preflight.status === 0, "targeted apply preflight child should exit zero");
check(beforeText === afterPreflightText, "targeted apply preflight should not modify the synthetic full scaffold");
check(outputContainsSyntheticValues(preflightOutput) === false, "targeted apply preflight output should not include synthetic values");
check(!/https?:\/\//i.test(preflightOutput), "targeted apply preflight output should not include URL values");
const preflightReport = await readJson(preflightReportJsonPath);

const apply = runNodeScript(
  ["harness/scripts/run_release_channel_apply_private_env.mjs"],
  childEnv({
    ...syntheticValues,
    GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT: syntheticRootRelative
  })
);
const applyOutput = `${apply.stdout ?? ""}\n${apply.stderr ?? ""}`;
check(apply.status === 0, "targeted apply child should exit zero");
check(outputContainsSyntheticValues(applyOutput) === false, "targeted apply output should not include synthetic values");
check(!/https?:\/\//i.test(applyOutput), "targeted apply output should not include URL values");
const applyReport = await readJson(applyReportJsonPath);

const afterText = await readFile(syntheticEnvPath, "utf8");
const afterMap = parseEnvMap(afterText);
const allChangedKeys = changedKeys(beforeMap, afterMap);
const releaseChangedKeys = allChangedKeys.filter((key) => releaseChannelMetadataKeys.includes(key));
const unrelatedChangedKeys = allChangedKeys.filter((key) => unrelatedPrivateKeys.includes(key));
const keyRows = buildKeyRows(beforeMap, afterMap);
for (const [key, value] of Object.entries(syntheticValues)) {
  check(afterMap.get(key) === value, `targeted apply should update ${key}`);
}
check(releaseChangedKeys.length === releaseChannelMetadataKeys.length, "targeted apply should change exactly four release-channel keys");
check(unrelatedChangedKeys.length === 0, "targeted apply should preserve unrelated private placeholder keys");
check(keyRows.every((row) => row.changed === row.expectedChanged), "targeted apply changed-key rows should match expectation");

const strict = runNodeScript(
  ["harness/scripts/run_release_channel_live_check.mjs", "--strict"],
  childEnv({
    GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_ENV_ROOT: syntheticRootRelative
  })
);
const strictOutput = `${strict.stdout ?? ""}\n${strict.stderr ?? ""}`;
check(strict.status === 0, "targeted apply strict live-check child should exit zero");
check(outputContainsSyntheticValues(strictOutput) === false, "targeted apply strict live-check output should not include synthetic values");
check(!/https?:\/\//i.test(strictOutput), "targeted apply strict live-check output should not include URL values");
const strictReport = await readJson(strictReportJsonPath);

if (preflightReport) {
  check(preflightReport.releaseChannelPrivateEnvApplyPreflightReady === true, "targeted preflight report should be ready");
  check(preflightReport.localEnvRootOverrideEnabled === true, "targeted preflight report should use root override");
  check(preflightReport.realLocalEnvRead === false, "targeted preflight report should not read real local env");
  check(preflightReport.realLocalEnvModified === false, "targeted preflight report should not modify real local env");
  check(preflightReport.wouldApplyKeyCount === 4, "targeted preflight report should identify four would-apply keys");
  check(preflightReport.appliedKeyCount === 0, "targeted preflight report should not apply keys");
  check(preflightReport.operatorReceiptReady === true, "targeted preflight report should include a ready operator receipt");
  check(preflightReport.operatorReceiptRowCount === 6, "targeted preflight report should include six operator receipt rows");
  check(
    preflightReport.operatorReceiptRows.every((row) => row.valueRecorded === false),
    "targeted preflight operator receipt rows should be value-free"
  );
}
if (applyReport) {
  check(applyReport.releaseChannelPrivateEnvApplyReady === true, "targeted apply report should be ready");
  check(applyReport.localEnvRootOverrideEnabled === true, "targeted apply report should use root override");
  check(applyReport.realLocalEnvRead === false, "targeted apply report should not read real local env");
  check(applyReport.realLocalEnvModified === false, "targeted apply report should not modify real local env");
  check(applyReport.appliedKeyCount === 4, "targeted apply report should apply four keys");
  check(applyReport.currentReadyKeyCount === 4, "targeted apply report should have four current-ready keys");
  check(applyReport.currentPlaceholderKeyCount === 0, "targeted apply report should clear release-channel placeholders");
  check(applyReport.operatorReceiptReady === true, "targeted apply report should include a ready operator receipt");
  check(applyReport.operatorReceiptRowCount === 6, "targeted apply report should include six operator receipt rows");
  check(
    applyReport.operatorReceiptRows.every((row) => row.valueRecorded === false),
    "targeted apply operator receipt rows should be value-free"
  );
}
if (strictReport) {
  check(strictReport.strictReady === true, "targeted strict live-check report should be strict-ready");
  check(strictReport.releaseChannelLiveCheckCurrentReadyCount === 4, "targeted strict live-check report should have four ready rows");
  check(strictReport.currentPlaceholderKeyCount === 0, "targeted strict live-check report should have zero release-channel placeholders");
  check(strictReport.localEnvRootOverrideEnabled === true, "targeted strict live-check should use root override");
  check(strictReport.realLocalEnvRead === false, "targeted strict live-check should not read real local env");
  check(strictReport.realLocalEnvModified === false, "targeted strict live-check should not modify real local env");
}

const report = {
  appName,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  platformArch,
  reportCommand: "npm run release:channel-apply-private-env-targeted-smoke",
  markdownPath: relative(markdownPath),
  jsonPath: relative(jsonPath),
  artifactNames: [markdownArtifactName, jsonArtifactName],
  syntheticEnvRoot: syntheticRootRelative,
  syntheticEnvFile: relative(syntheticEnvPath),
  releaseChannelTargetedApplySmokeReady:
    preflight.status === 0 &&
    apply.status === 0 &&
    strict.status === 0 &&
    releaseChangedKeys.length === releaseChannelMetadataKeys.length &&
    unrelatedChangedKeys.length === 0,
  preflightReady: preflight.status === 0 && preflightReport?.releaseChannelPrivateEnvApplyPreflightReady === true,
  applyReady: apply.status === 0 && applyReport?.releaseChannelPrivateEnvApplyReady === true,
  strictLiveCheckReady: strict.status === 0 && strictReport?.strictReady === true,
  preflightOperatorReceiptRowCount: preflightReport?.operatorReceiptRowCount ?? 0,
  applyOperatorReceiptRowCount: applyReport?.operatorReceiptRowCount ?? 0,
  releaseChannelKeyCount: releaseChannelMetadataKeys.length,
  releaseChannelChangedKeyCount: releaseChangedKeys.length,
  releaseChannelChangedKeys: releaseChangedKeys,
  unrelatedPrivateKeyCount: unrelatedPrivateKeys.length,
  unrelatedPrivatePreservedKeyCount: unrelatedPrivateKeys.length - unrelatedChangedKeys.length,
  unrelatedPrivateChangedKeyCount: unrelatedChangedKeys.length,
  unrelatedPrivateChangedKeys: unrelatedChangedKeys,
  keyRows,
  keyRowCount: keyRows.length,
  currentOperatorFirstCommand: commandNames.preflight,
  nextWriteCommand: commandNames.apply,
  strictFirstProofCommand: commandNames.strict,
  recommendedOperatorProofCommand: commandNames.proof,
  currentBlockerRefreshCommand: commandNames.currentBlocker,
  realLocalEnvRead: false,
  realLocalEnvModified: false,
  privateValuesRecorded: false,
  localEnvValueRecorded: false,
  releaseUrlValueRecorded: false,
  supportUrlValueRecorded: false,
  channelValueRecorded: false,
  updateFeedValueRecorded: false,
  credentialValueRecorded: false,
  tokenValueRecorded: false,
  developerIdIdentityValueRecorded: false,
  notaryValueRecorded: false,
  manualQaValueRecorded: false,
  networkProbeAttempted: false,
  releaseUploadAttempted: false,
  updateFeedPublishAttempted: false,
  notarySubmissionAttempted: false,
  signingAttempted: false,
  releaseGateClaimedDeveloperIdSigning: false,
  releaseGateClaimedNotarization: false,
  releaseGateClaimedGatekeeperApproval: false,
  releaseGateClaimedAutoUpdate: false,
  releaseGateClaimedManualQaApproval: false,
  releaseGateClaimedExternalDistribution: false,
  valueRecorded: false
};

check(report.releaseChannelTargetedApplySmokeReady === true, "targeted apply smoke should be ready");
check(report.keyRows.every((row) => row.valueRecorded === false), "targeted apply smoke key rows should be value-free");
check(report.realLocalEnvRead === false, "targeted apply smoke should not read real local env");
check(report.realLocalEnvModified === false, "targeted apply smoke should not modify real local env");
check(report.privateValuesRecorded === false, "targeted apply smoke should not record private values");
check(report.networkProbeAttempted === false, "targeted apply smoke should not probe networks");
check(report.releaseGateClaimedExternalDistribution === false, "targeted apply smoke should not claim external distribution");

const markdown = buildMarkdown(report);
const json = `${JSON.stringify(report, null, 2)}\n`;
const combined = `${markdown}\n${json}`;
check(outputContainsSyntheticValues(combined) === false, "targeted apply smoke artifacts should not include synthetic values");
check(!/https?:\/\//i.test(combined), "targeted apply smoke artifacts should not include URL values");
await writeFile(markdownPath, markdown, "utf8");
await writeFile(jsonPath, json, "utf8");

if (failures.length > 0) {
  console.error("GrooveForge release-channel private env targeted apply smoke failed.");
  console.error(`- Markdown: ${relative(markdownPath)}`);
  console.error(`- JSON: ${relative(jsonPath)}`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GrooveForge release-channel private env targeted apply smoke passed.");
console.log(`- Markdown: ${relative(markdownPath)}`);
console.log(`- JSON: ${relative(jsonPath)}`);
console.log("- Preflight ready: yes");
console.log("- Apply ready: yes");
console.log("- Strict live-check ready: yes");
console.log(`- Preflight operator receipt rows: ${report.preflightOperatorReceiptRowCount}`);
console.log(`- Apply operator receipt rows: ${report.applyOperatorReceiptRowCount}`);
console.log(`- Release-channel changed keys: ${report.releaseChannelChangedKeyCount}/${report.releaseChannelKeyCount}`);
console.log(`- Unrelated private keys preserved: ${report.unrelatedPrivatePreservedKeyCount}/${report.unrelatedPrivateKeyCount}`);
console.log(`- Current operator command: ${report.currentOperatorFirstCommand}`);
console.log(`- Next write command: ${report.nextWriteCommand}`);
console.log(`- Strict proof command: ${report.recommendedOperatorProofCommand}`);
console.log("- Real local env read: no");
console.log("- Real local env modified: no");
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
