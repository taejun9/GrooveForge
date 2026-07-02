#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { distributionLocalEnvDefaults, distributionPrivateInputKeys } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const args = process.argv.slice(2);
const syntheticSuccessSmoke = args.includes("--success-smoke");
const forceOverwrite = args.includes("--force") || syntheticSuccessSmoke;
const reportArtifactNames = {
  markdown: "release-channel-setup-wizard.md",
  json: "release-channel-setup-wizard.json",
  successSmokeMarkdown: "release-channel-setup-wizard-success-smoke.md",
  successSmokeJson: "release-channel-setup-wizard-success-smoke.json"
};
const reportStem = syntheticSuccessSmoke
  ? "release-channel-setup-wizard-success-smoke"
  : "release-channel-setup-wizard";
const markdownArtifactName = syntheticSuccessSmoke ? reportArtifactNames.successSmokeMarkdown : reportArtifactNames.markdown;
const jsonArtifactName = syntheticSuccessSmoke ? reportArtifactNames.successSmokeJson : reportArtifactNames.json;
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${markdownArtifactName}`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${jsonArtifactName}`);
const setupRootOverride = process.env.GROOVEFORGE_RELEASE_CHANNEL_SETUP_ENV_ROOT?.trim() ?? "";
const syntheticRoot = path.join(packageRoot, "release-channel-setup-wizard-success-smoke");
const resolvedLocalEnvRoot = syntheticSuccessSmoke
  ? syntheticRoot
  : setupRootOverride
    ? path.resolve(root, setupRootOverride)
    : root;
const relativeLocalEnvRoot = path.relative(root, resolvedLocalEnvRoot);
const configuredEnvFileKey = "GROOVEFORGE_DISTRIBUTION_ENV_FILE";
const configuredEnvFileName = process.env[configuredEnvFileKey]?.trim() || distributionLocalEnvDefaults.defaultEnvFileName;
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const syntheticValues = {
  GROOVEFORGE_DISTRIBUTION_CHANNEL: "private-beta",
  GROOVEFORGE_RELEASE_DOWNLOAD_URL: "https://downloads.invalid/grooveforge.dmg",
  GROOVEFORGE_RELEASE_NOTES_URL: "https://downloads.invalid/grooveforge-notes",
  GROOVEFORGE_SUPPORT_URL: "https://support.invalid/grooveforge"
};
const failures = [];

if ((setupRootOverride || syntheticSuccessSmoke) && (relativeLocalEnvRoot.startsWith("..") || path.isAbsolute(relativeLocalEnvRoot))) {
  console.error("GrooveForge release-channel setup wizard failed:");
  console.error("- Local env root override must stay inside the repository.");
  process.exit(1);
}

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

function localEnvCandidatePath() {
  const candidatePath = path.isAbsolute(configuredEnvFileName)
    ? configuredEnvFileName
    : path.resolve(resolvedLocalEnvRoot, configuredEnvFileName);
  const relativeCandidate = path.relative(resolvedLocalEnvRoot, candidatePath);
  if (relativeCandidate.startsWith("..") || path.isAbsolute(relativeCandidate)) {
    throw new Error("Configured distribution env file must stay inside the selected env root.");
  }
  return candidatePath;
}

function displayLocalEnvTarget(filePath) {
  const relativePath = path.relative(root, filePath);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.basename(filePath);
}

function safeHttpsUrlShapeReady(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && Boolean(parsed.hostname) && !parsed.username && !parsed.password && !parsed.hash;
  } catch {
    return false;
  }
}

function channelShapeReady(value) {
  return /^(direct-download|private-beta|managed-release)$/.test(String(value ?? "").trim());
}

function shapeReadyForKey(key, value) {
  return key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" ? channelShapeReady(value) : safeHttpsUrlShapeReady(value);
}

function expectedShapeForKey(key) {
  return key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" ? "allowed release channel token" : "safe absolute HTTPS URL";
}

function inputSourceForKey(key) {
  if (syntheticSuccessSmoke) {
    return "synthetic-success-smoke";
  }
  return process.env[key]?.trim() ? "process-env" : "interactive";
}

function buildInputRows(inputValues) {
  return releaseChannelMetadataKeys.map((key, index) => {
    const value = inputValues.get(key) ?? "";
    const inputPresent = value.trim().length > 0;
    const inputShapeReady = inputPresent && shapeReadyForKey(key, value);
    return {
      order: index + 1,
      key,
      inputSource: inputSourceForKey(key),
      inputPresent,
      inputShapeReady,
      expectedShape: expectedShapeForKey(key),
      valueRecorded: false
    };
  });
}

async function promptForMissingInputs(existingValues) {
  const values = new Map(existingValues);
  const missingKeys = releaseChannelMetadataKeys.filter((key) => !values.get(key));
  if (missingKeys.length === 0) {
    return values;
  }
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return values;
  }

  const reader = createInterface({ input: process.stdin, output: process.stdout });
  try {
    for (const key of missingKeys) {
      const answer = await reader.question(`${key} (${expectedShapeForKey(key)}): `);
      values.set(key, answer.trim());
    }
  } finally {
    reader.close();
  }
  return values;
}

async function collectInputValues() {
  if (syntheticSuccessSmoke) {
    return new Map(Object.entries(syntheticValues));
  }
  const fromProcessEnv = new Map(
    releaseChannelMetadataKeys.map((key) => [key, process.env[key]?.trim() ?? ""])
  );
  return promptForMissingInputs(fromProcessEnv);
}

function childEnvForApply(inputValues) {
  return {
    ...process.env,
    ...Object.fromEntries(inputValues),
    GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT: relativeLocalEnvRoot,
    [configuredEnvFileKey]: configuredEnvFileName
  };
}

function childEnvForLiveCheck() {
  const childEnv = { ...process.env };
  for (const key of distributionPrivateInputKeys) {
    delete childEnv[key];
  }
  childEnv.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_ENV_ROOT = relativeLocalEnvRoot;
  childEnv[configuredEnvFileKey] = configuredEnvFileName;
  if (syntheticSuccessSmoke) {
    childEnv.GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_REPORT_STEM = "release-channel-live-check-strict-success-smoke";
  }
  return childEnv;
}

function runNodeScript(scriptPath, scriptArgs, env) {
  return spawnSync(process.execPath, [scriptPath, ...scriptArgs], {
    cwd: root,
    env,
    encoding: "utf8"
  });
}

function outputContainsValues(output, values) {
  return values.some((value) => value && output.includes(value));
}

async function ensureSyntheticEnv(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(
    filePath,
    [
      "# Synthetic success-smoke fixture for release-channel setup wizard.",
      "GROOVEFORGE_DISTRIBUTION_CHANNEL=<distribution-channel>",
      "GROOVEFORGE_RELEASE_DOWNLOAD_URL=https://example.com/download",
      "GROOVEFORGE_RELEASE_NOTES_URL=https://example.com/notes",
      "GROOVEFORGE_SUPPORT_URL=https://example.com/support",
      ""
    ].join("\n"),
    "utf8"
  );
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

async function readSyntheticEnvRows(filePath) {
  if (!syntheticSuccessSmoke || !existsSync(filePath)) {
    return [];
  }
  const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);
  const entries = new Map(lines.map(parseEnvLine).filter(Boolean).map((entry) => [entry.key, entry.value]));
  return releaseChannelMetadataKeys.map((key, index) => ({
    order: index + 1,
    key,
    syntheticFixtureUpdated: entries.get(key) === syntheticValues[key],
    valueRecorded: false
  }));
}

async function ensureRealLocalEnv(filePath) {
  if (syntheticSuccessSmoke || existsSync(filePath)) {
    return { prepareEnvRun: false, prepareEnvExitCode: null };
  }
  const result = runNodeScript("harness/scripts/run_release_prepare_env.mjs", ["--write-local"], process.env);
  return {
    prepareEnvRun: true,
    prepareEnvExitCode: result.status,
    prepareEnvOutput: `${result.stdout ?? ""}\n${result.stderr ?? ""}`
  };
}

function formatInputRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.inputSource)} | ${readyLabel(row.inputPresent)} | ${readyLabel(row.inputShapeReady)} | ${escapeCell(row.expectedShape)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatSyntheticRows(rows) {
  return rows.length > 0
    ? rows
        .map((row) => `| ${row.order} | ${escapeCell(row.key)} | ${readyLabel(row.syntheticFixtureUpdated)} | ${readyLabel(row.valueRecorded)} |`)
        .join("\n")
    : "| 1 | none | no | no |";
}

function buildMarkdown(report) {
  return `# ${appName} Release-Channel Setup Wizard

## Summary

- Setup wizard ready: ${readyLabel(report.releaseChannelSetupWizardReady)}
- Synthetic success smoke: ${readyLabel(report.syntheticSuccessSmoke)}
- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}
- Local env prepared by wizard: ${readyLabel(report.prepareEnvRun)}
- Real local env read: ${readyLabel(report.realLocalEnvRead)}
- Real local env modified: ${readyLabel(report.realLocalEnvModified)}
- Apply command exit code: ${report.applyExitCode}
- Strict live-check exit code: ${report.strictLiveCheckExitCode}
- Apply ready: ${readyLabel(report.applyReady)}
- Strict live-check ready: ${readyLabel(report.strictLiveCheckReady)}
- Current ready rows: ${report.currentReadyKeyCount}/${report.currentRequiredKeyCount}
- Current env edit target: ${report.currentEnvEditTarget}
- First proof command: \`${report.firstProofCommand}\`
- Recommended proof chain: \`${report.recommendedOperatorProofCommand}\`
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- External distribution claimed: no

## Wizard Input Rows

| order | key | source | input present | shape ready | expected shape | value recorded |
|---:|---|---|---:|---:|---|---:|
${formatInputRows(report.wizardInputRows)}

## Synthetic Fixture Rows

| order | key | fixture updated | value recorded |
|---:|---|---:|---:|
${formatSyntheticRows(report.syntheticFixtureRows)}

## Command Chain

1. \`${report.prepareEnvCommand}\` when the ignored local env is missing.
2. \`${report.applyCommand}\` to write shape-ready private metadata into the ignored local env.
3. \`${report.firstProofCommand}\` to prove the four release-channel rows are strict-ready.
4. \`${report.recommendedOperatorProofCommand}\` for the full value-free proof chain after setup succeeds.

## Not Recorded

This report records key names, readiness booleans, row counts, file names, command names, and exit codes only. It does not record release URLs, support URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, private beats, or real user audio.

## Not Claimed

This command does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function writeReport(report, privateValueCandidates) {
  const markdown = buildMarkdown(report);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  const combined = `${markdown}\n${json}`;
  for (const value of privateValueCandidates) {
    check(!combined.includes(value), "release-channel setup wizard report should not include private values");
  }
  check(!/https?:\/\//i.test(combined), "release-channel setup wizard report should not include URL values");
  await mkdir(packageRoot, { recursive: true });
  await writeFile(markdownPath, markdown, "utf8");
  await writeFile(jsonPath, json, "utf8");
}

async function main() {
  const localEnvPath = localEnvCandidatePath();
  if (syntheticSuccessSmoke) {
    await ensureSyntheticEnv(localEnvPath);
  }

  const inputValues = await collectInputValues();
  const inputRows = buildInputRows(inputValues);
  const inputReady = inputRows.every((row) => row.inputPresent === true && row.inputShapeReady === true);
  const privateValueCandidates = [...inputValues.values()].filter((value) => value.trim().length >= 8);
  const prepareResult = inputReady ? await ensureRealLocalEnv(localEnvPath) : { prepareEnvRun: false, prepareEnvExitCode: null };
  const localEnvFileLoaded = existsSync(localEnvPath);
  const applyArgs = syntheticSuccessSmoke ? ["--success-smoke"] : [];
  if (forceOverwrite) {
    applyArgs.push("--force");
  }
  const applyResult = inputReady && localEnvFileLoaded
    ? runNodeScript("harness/scripts/run_release_channel_apply_private_env.mjs", applyArgs, childEnvForApply(inputValues))
    : { status: 1, stdout: "", stderr: "" };
  const strictResult = applyResult.status === 0
    ? runNodeScript("harness/scripts/run_release_channel_live_check.mjs", ["--strict"], childEnvForLiveCheck())
    : { status: 1, stdout: "", stderr: "" };
  const applyOutput = `${applyResult.stdout ?? ""}\n${applyResult.stderr ?? ""}`;
  const strictOutput = `${strictResult.stdout ?? ""}\n${strictResult.stderr ?? ""}`;
  const childOutput = `${prepareResult.prepareEnvOutput ?? ""}\n${applyOutput}\n${strictOutput}`;
  const applyReportStem = syntheticSuccessSmoke
    ? "release-channel-apply-private-env-success-smoke"
    : "release-channel-apply-private-env";
  const liveCheckReportStem = syntheticSuccessSmoke
    ? "release-channel-live-check-strict-success-smoke"
    : "release-channel-live-check-strict";
  const applyJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${applyReportStem}.json`);
  const liveCheckJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${liveCheckReportStem}.json`);
  const applyReport = existsSync(applyJsonPath) ? JSON.parse(await readFile(applyJsonPath, "utf8")) : null;
  const liveCheckReport = existsSync(liveCheckJsonPath) ? JSON.parse(await readFile(liveCheckJsonPath, "utf8")) : null;
  const syntheticFixtureRows = await readSyntheticEnvRows(localEnvPath);
  const currentReadyKeyCount = Number.isInteger(liveCheckReport?.releaseChannelLiveCheckCurrentReadyCount)
    ? liveCheckReport.releaseChannelLiveCheckCurrentReadyCount
    : 0;
  const report = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: syntheticSuccessSmoke
      ? "npm run release:channel-setup-wizard-success-smoke"
      : "npm run release:channel-setup-wizard",
    releaseChannelSetupWizardMarkdownPath: relative(markdownPath),
    releaseChannelSetupWizardJsonPath: relative(jsonPath),
    syntheticSuccessSmoke,
    localEnvRootOverrideEnabled: Boolean(setupRootOverride) || syntheticSuccessSmoke,
    localEnvRootRelativePath: relativeLocalEnvRoot,
    currentEnvEditTarget: displayLocalEnvTarget(localEnvPath),
    currentRequiredKeyCount: releaseChannelMetadataKeys.length,
    currentRequiredKeys: releaseChannelMetadataKeys,
    wizardInputRows: inputRows,
    wizardInputRowCount: inputRows.length,
    inputReady,
    localEnvFileLoaded,
    prepareEnvRun: prepareResult.prepareEnvRun,
    prepareEnvExitCode: prepareResult.prepareEnvExitCode,
    prepareEnvCommand: "npm run release:prepare-env",
    applyCommand: "npm run release:channel-apply-private-env",
    applyExitCode: applyResult.status,
    applyReportReady: applyReport?.releaseChannelPrivateEnvApplyReady === true,
    applyReady: applyResult.status === 0 && applyReport?.releaseChannelPrivateEnvApplyReady === true,
    applyReportPath: applyReport ? relative(applyJsonPath) : "none",
    realLocalEnvRead: resolvedLocalEnvRoot === root && localEnvFileLoaded === true,
    realLocalEnvModified: applyReport?.realLocalEnvModified === true,
    strictLiveCheckCommand: "npm run release:channel-live-check-strict",
    strictLiveCheckExitCode: strictResult.status,
    strictLiveCheckReady: strictResult.status === 0 && liveCheckReport?.strictReady === true,
    strictLiveCheckReportPath: liveCheckReport ? relative(liveCheckJsonPath) : "none",
    currentReadyKeyCount,
    currentPlaceholderKeyCount: Number.isInteger(liveCheckReport?.currentPlaceholderKeyCount)
      ? liveCheckReport.currentPlaceholderKeyCount
      : releaseChannelMetadataKeys.length,
    firstProofCommand: "npm run release:channel-live-check-strict",
    recommendedOperatorProofCommand: "npm run release:private-edit-strict-proof",
    currentBlockerCommand: "npm run release:current-blocker",
    hardGateCommand: "npm run release:external-check",
    syntheticFixtureRows,
    syntheticFixtureRowCount: syntheticFixtureRows.length,
    releaseChannelSetupWizardReady:
      inputReady === true &&
      localEnvFileLoaded === true &&
      applyResult.status === 0 &&
      strictResult.status === 0 &&
      applyReport?.releaseChannelPrivateEnvApplyReady === true &&
      liveCheckReport?.strictReady === true &&
      currentReadyKeyCount === releaseChannelMetadataKeys.length,
    privateValuesRecorded: false,
    localEnvValueRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    channelValueRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
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

  check(report.wizardInputRowCount === 4, "release-channel setup wizard should inspect four input rows");
  check(report.wizardInputRows.every((row) => row.valueRecorded === false), "release-channel setup wizard input rows should be value-free");
  check(report.privateValuesRecorded === false, "release-channel setup wizard should not record private values");
  check(report.localEnvValueRecorded === false, "release-channel setup wizard should not record local env values");
  check(report.releaseUrlValueRecorded === false, "release-channel setup wizard should not record release URL values");
  check(report.supportUrlValueRecorded === false, "release-channel setup wizard should not record support URL values");
  check(report.channelValueRecorded === false, "release-channel setup wizard should not record channel values");
  check(report.networkProbeAttempted === false, "release-channel setup wizard should not probe networks");
  check(report.releaseUploadAttempted === false, "release-channel setup wizard should not upload releases");
  check(report.notarySubmissionAttempted === false, "release-channel setup wizard should not submit to Apple");
  check(report.signingAttempted === false, "release-channel setup wizard should not sign artifacts");
  check(report.releaseGateClaimedExternalDistribution === false, "release-channel setup wizard should not claim external distribution");
  check(!syntheticSuccessSmoke || report.realLocalEnvRead === false, "release-channel setup wizard success smoke should not read real local env");
  check(!syntheticSuccessSmoke || report.realLocalEnvModified === false, "release-channel setup wizard success smoke should not modify real local env");
  check(report.applyCommand === "npm run release:channel-apply-private-env", "release-channel setup wizard should call the private env apply helper");
  check(report.firstProofCommand === "npm run release:channel-live-check-strict", "release-channel setup wizard should run strict live check first");
  check(report.recommendedOperatorProofCommand === "npm run release:private-edit-strict-proof", "release-channel setup wizard should expose the full proof chain");
  check(!outputContainsValues(childOutput, privateValueCandidates), "release-channel setup wizard child output should not include private values");
  check(!/https?:\/\//i.test(childOutput), "release-channel setup wizard child output should not include URL values");
  if (syntheticSuccessSmoke) {
    check(report.releaseChannelSetupWizardReady === true, "release-channel setup wizard success smoke should be ready");
    check(report.applyReady === true, "release-channel setup wizard success smoke should prove apply readiness");
    check(report.strictLiveCheckReady === true, "release-channel setup wizard success smoke should prove strict live-check readiness");
    check(report.currentReadyKeyCount === 4, "release-channel setup wizard success smoke should produce four ready rows");
    check(report.currentPlaceholderKeyCount === 0, "release-channel setup wizard success smoke should clear placeholders");
    check(report.syntheticFixtureRows.every((row) => row.syntheticFixtureUpdated === true), "release-channel setup wizard success smoke should update synthetic fixture rows");
  }

  await writeReport(report, privateValueCandidates);

  if (failures.length > 0 || report.releaseChannelSetupWizardReady !== true) {
    console.error("GrooveForge release-channel setup wizard failed.");
    console.error(`- Markdown: ${relative(markdownPath)}`);
    console.error(`- JSON: ${relative(jsonPath)}`);
    console.error(`- Synthetic success smoke: ${readyLabel(report.syntheticSuccessSmoke)}`);
    console.error(`- Input ready: ${readyLabel(report.inputReady)}`);
    console.error(`- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}`);
    console.error(`- Real local env read: ${readyLabel(report.realLocalEnvRead)}`);
    console.error(`- Real local env modified: ${readyLabel(report.realLocalEnvModified)}`);
    console.error(`- Apply ready: ${readyLabel(report.applyReady)}`);
    console.error(`- Strict live-check ready: ${readyLabel(report.strictLiveCheckReady)}`);
    console.error(`- Current ready rows: ${report.currentReadyKeyCount}/${report.currentRequiredKeyCount}`);
    console.error(`- Current env edit target: ${report.currentEnvEditTarget}`);
    console.error(`- Next proof after setup: ${report.recommendedOperatorProofCommand}`);
    console.error("- Private values recorded: no");
    console.error("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
    console.error("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("GrooveForge release-channel setup wizard passed.");
  console.log(`- Markdown: ${relative(markdownPath)}`);
  console.log(`- JSON: ${relative(jsonPath)}`);
  console.log(`- Synthetic success smoke: ${readyLabel(report.syntheticSuccessSmoke)}`);
  console.log(`- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}`);
  console.log(`- Local env prepared by wizard: ${readyLabel(report.prepareEnvRun)}`);
  console.log(`- Real local env read: ${readyLabel(report.realLocalEnvRead)}`);
  console.log(`- Real local env modified: ${readyLabel(report.realLocalEnvModified)}`);
  console.log(`- Apply ready: ${readyLabel(report.applyReady)}`);
  console.log(`- Strict live-check ready: ${readyLabel(report.strictLiveCheckReady)}`);
  console.log(`- Current ready rows: ${report.currentReadyKeyCount}/${report.currentRequiredKeyCount}`);
  console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
  console.log(`- Next proof after setup: ${report.recommendedOperatorProofCommand}`);
  console.log("- Private values recorded: no");
  console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
  console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
}

await main();
