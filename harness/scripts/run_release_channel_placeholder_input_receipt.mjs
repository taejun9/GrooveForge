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
const syntheticSmoke = process.argv.includes("--smoke");
const reportStem = syntheticSmoke
  ? "release-channel-placeholder-input-receipt-smoke"
  : "release-channel-placeholder-input-receipt";
const receiptArtifactNames = [
  "release-channel-placeholder-input-receipt.md",
  "release-channel-placeholder-input-receipt.json",
  "release-channel-placeholder-input-receipt-smoke.md",
  "release-channel-placeholder-input-receipt-smoke.json"
];
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const preflightJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-apply-private-env-preflight.json`
);
const preflightMarkdownPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-apply-private-env-preflight.md`
);
const syntheticRoot = path.join(packageRoot, reportStem);
const privateInputFileKey = "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE";
const defaultPrivateInputFileName = ".env.release-channel.local";
const defaultDistributionEnvFileName = ".env.distribution.local";
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const placeholderValues = new Map([
  ["GROOVEFORGE_DISTRIBUTION_CHANNEL", "<direct-download|private-beta|managed-release>"],
  ["GROOVEFORGE_RELEASE_DOWNLOAD_URL", "<release-download-https-url>"],
  ["GROOVEFORGE_RELEASE_NOTES_URL", "<release-notes-https-url>"],
  ["GROOVEFORGE_SUPPORT_URL", "<support-https-url>"]
]);
const preflightCommand = "npm run release:channel-apply-private-env-preflight";
const templateCommand = "npm run release:channel-private-input-template";
const applyCommand = "npm run release:channel-apply-private-env";
const proofCommand = "npm run release:private-edit-strict-proof";
const currentBlockerCommand = "npm run release:current-blocker";
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

function objectRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object") : [];
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function summarizeKeys(keys) {
  return keys.length > 0 ? keys.join(", ") : "none";
}

async function writeSyntheticFixtures() {
  await mkdir(syntheticRoot, { recursive: true });
  const distributionEnvLines = [
    "# Synthetic ignored distribution env for placeholder-input receipt smoke.",
    ...releaseChannelMetadataKeys.map((key) => `${key}=${placeholderValues.get(key)}`),
    ""
  ];
  const privateInputLines = [
    "# Synthetic ignored private input file for placeholder-input receipt smoke.",
    ...releaseChannelMetadataKeys.map((key) => `${key}=${placeholderValues.get(key)}`),
    ""
  ];
  await writeFile(path.join(syntheticRoot, defaultDistributionEnvFileName), distributionEnvLines.join("\n"));
  await writeFile(path.join(syntheticRoot, defaultPrivateInputFileName), privateInputLines.join("\n"));
}

function preflightEnv() {
  if (!syntheticSmoke) {
    return process.env;
  }
  const env = {
    ...process.env,
    GROOVEFORGE_RELEASE_CHANNEL_APPLY_ENV_ROOT: relative(syntheticRoot),
    GROOVEFORGE_DISTRIBUTION_ENV_FILE: defaultDistributionEnvFileName,
    [privateInputFileKey]: defaultPrivateInputFileName
  };
  for (const key of releaseChannelMetadataKeys) {
    env[key] = "";
  }
  return env;
}

function runPreflight() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  return spawnSync(npmCommand, ["run", "release:channel-apply-private-env-preflight"], {
    cwd: root,
    env: preflightEnv(),
    stdio: "pipe",
    encoding: "utf8"
  });
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`${label} JSON is missing at ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function sanitizeLocationRows(rows) {
  return objectRows(rows).map((row) => ({
    order: integerValue(row.order),
    key: textValue(row.key),
    privateInputFilePath: textValue(row.privateInputFilePath),
    privateInputFilePresent: row.privateInputFilePresent === true,
    privateInputFileKeyPresent: row.privateInputFileKeyPresent === true,
    privateInputFileLine: Number.isInteger(row.privateInputFileLine) ? row.privateInputFileLine : null,
    processEnvPresent: row.processEnvPresent === true,
    inputSource: textValue(row.inputSource),
    inputPresent: row.inputPresent === true,
    inputPlaceholder: row.inputPlaceholder === true,
    inputShapeReady: row.inputShapeReady === true,
    privateInputFilePlaceholder: row.privateInputFilePlaceholder === true,
    privateInputFileShapeReady: row.privateInputFileShapeReady === true,
    expectedShape: textValue(row.expectedShape),
    remediation: textValue(row.remediation),
    valueRecorded: false
  }));
}

function receiptMode(preflight) {
  const loadedKeyCount = integerValue(preflight.privateInputFileLoadedKeyCount);
  const missingKeyCount = integerValue(preflight.privateInputFileLocationMissingKeyCount);
  const placeholderCount = integerValue(preflight.privateInputFileLocationPlaceholderCount);
  const invalidShapeCount = integerValue(preflight.privateInputFileLocationInvalidShapeCount);
  if (preflight.privateInputFilePresent !== true) {
    return "missing-private-input-file";
  }
  if (loadedKeyCount < releaseChannelMetadataKeys.length || missingKeyCount > 0) {
    return "incomplete-private-input-file";
  }
  if (placeholderCount > 0) {
    return "placeholder-private-input-file";
  }
  if (invalidShapeCount > 0) {
    return "invalid-shape-private-input-file";
  }
  if (preflight.releaseChannelPrivateEnvApplyPreflightReady === true) {
    return "ready-private-input-file";
  }
  return "review-private-input-file";
}

function buildCommandRows(mode) {
  return [
    {
      order: 1,
      command: templateCommand,
      role: "create or refresh the ignored private input file skeleton",
      requiredBeforeApply: mode === "missing-private-input-file" || mode === "incomplete-private-input-file",
      valueRecorded: false
    },
    {
      order: 2,
      command: preflightCommand,
      role: "verify the four private release-channel inputs before writing the ignored distribution env",
      requiredBeforeApply: mode !== "ready-private-input-file",
      valueRecorded: false
    },
    {
      order: 3,
      command: applyCommand,
      role: "write shape-ready private inputs into the ignored distribution env",
      requiredBeforeApply: false,
      valueRecorded: false
    },
    {
      order: 4,
      command: proofCommand,
      role: "run the strict value-free proof chain after apply",
      requiredBeforeApply: false,
      valueRecorded: false
    },
    {
      order: 5,
      command: currentBlockerCommand,
      role: "refresh the current blocker after private proof",
      requiredBeforeApply: false,
      valueRecorded: false
    }
  ];
}

function buildReport(preflight, preflightResult) {
  const privateInputFileLocationRows = sanitizeLocationRows(preflight.privateInputFileLocationRows);
  const privateInputPlaceholderKeys = privateInputFileLocationRows
    .filter((row) => row.privateInputFilePlaceholder === true)
    .map((row) => row.key);
  const privateInputMissingKeys = privateInputFileLocationRows
    .filter((row) => row.privateInputFileKeyPresent !== true)
    .map((row) => row.key);
  const privateInputInvalidShapeKeys = privateInputFileLocationRows
    .filter((row) => row.privateInputFileKeyPresent === true && row.privateInputFilePlaceholder !== true && row.privateInputFileShapeReady !== true)
    .map((row) => row.key);
  const mode = receiptMode(preflight);
  const commandRows = buildCommandRows(mode);
  const receiptReady =
    releaseChannelMetadataKeys.every((key) => privateInputFileLocationRows.some((row) => row.key === key)) &&
    preflight.privateValuesRecorded !== true &&
    preflight.privateInputFileValueRecorded !== true &&
    preflight.releaseUploadAttempted !== true &&
    preflight.notarySubmissionAttempted !== true &&
    preflight.signingAttempted !== true &&
    preflight.networkProbeAttempted !== true &&
    preflight.localEnvModified !== true &&
    preflight.realLocalEnvModified !== true;
  return {
    generatedAt: new Date().toISOString(),
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: syntheticSmoke
      ? "npm run release:channel-placeholder-input-receipt-smoke"
      : "npm run release:channel-placeholder-input-receipt",
    reportStem,
    receiptArtifactNames,
    syntheticSmoke,
    receiptReady,
    receiptMode: mode,
    sourcePreflightCommand: preflightCommand,
    sourcePreflightExitStatus: preflightResult.status,
    sourcePreflightJsonPath: relative(preflightJsonPath),
    sourcePreflightMarkdownPath: relative(preflightMarkdownPath),
    sourcePreflightReady: preflight.releaseChannelPrivateEnvApplyPreflightReady === true,
    localEnvFileLoaded: preflight.localEnvFileLoaded === true,
    localEnvModified: preflight.localEnvModified === true,
    realLocalEnvModified: preflight.realLocalEnvModified === true,
    realLocalEnvRead: preflight.realLocalEnvRead === true,
    currentEnvEditTarget: textValue(preflight.currentEnvEditTarget, ".env.distribution.local"),
    privateInputFileKey,
    privateInputFileDefaultName: defaultPrivateInputFileName,
    privateInputFilePath: textValue(preflight.privateInputFilePath, defaultPrivateInputFileName),
    privateInputFilePresent: preflight.privateInputFilePresent === true,
    privateInputFileLoadedKeys: stringArray(preflight.privateInputFileLoadedKeys),
    privateInputFileLoadedKeyCount: integerValue(preflight.privateInputFileLoadedKeyCount),
    privateInputFileLoadedKeySummary: textValue(preflight.privateInputFileLoadedKeySummary, "none"),
    privateInputFilePlaceholderKeys: privateInputPlaceholderKeys,
    privateInputFilePlaceholderKeyCount: privateInputPlaceholderKeys.length,
    privateInputFilePlaceholderKeySummary: summarizeKeys(privateInputPlaceholderKeys),
    privateInputFileMissingKeys: privateInputMissingKeys,
    privateInputFileMissingKeyCount: privateInputMissingKeys.length,
    privateInputFileMissingKeySummary: summarizeKeys(privateInputMissingKeys),
    privateInputFileInvalidShapeKeys: privateInputInvalidShapeKeys,
    privateInputFileInvalidShapeKeyCount: privateInputInvalidShapeKeys.length,
    privateInputFileInvalidShapeKeySummary: summarizeKeys(privateInputInvalidShapeKeys),
    privateInputFileLocationRowCount: privateInputFileLocationRows.length,
    privateInputFileLocationRows,
    processEnvInputChecklistMissingCount: integerValue(preflight.processEnvInputChecklistMissingCount),
    processEnvInputChecklistPlaceholderCount: integerValue(preflight.processEnvInputChecklistPlaceholderCount),
    processEnvInputChecklistInvalidShapeCount: integerValue(preflight.processEnvInputChecklistInvalidShapeCount),
    processEnvInputChecklistReadyCount: integerValue(preflight.processEnvInputChecklistReadyCount),
    preflightRemediationRows: objectRows(preflight.preflightRemediationRows).map((row) => ({
      order: integerValue(row.order),
      key: textValue(row.key),
      remediation: textValue(row.remediation),
      nextCommand: textValue(row.nextCommand),
      writeCommand: textValue(row.writeCommand),
      proofCommand: textValue(row.proofCommand),
      valueRecorded: false
    })),
    commandRows,
    commandRowCount: commandRows.length,
    nextOperatorCommand:
      mode === "ready-private-input-file"
        ? applyCommand
        : mode === "missing-private-input-file" || mode === "incomplete-private-input-file"
          ? templateCommand
          : preflightCommand,
    nextProofCommand: proofCommand,
    hardGateCommand: "npm run release:external-check",
    privateValuesRecorded: preflight.privateValuesRecorded === true,
    privateInputFileValueRecorded: preflight.privateInputFileValueRecorded === true,
    releaseUrlValueRecorded: preflight.releaseUrlValueRecorded === true,
    supportUrlValueRecorded: preflight.supportUrlValueRecorded === true,
    channelValueRecorded: preflight.channelValueRecorded === true,
    networkProbeAttempted: preflight.networkProbeAttempted === true,
    releaseUploadAttempted: preflight.releaseUploadAttempted === true,
    signingAttempted: preflight.signingAttempted === true,
    notarySubmissionAttempted: preflight.notarySubmissionAttempted === true,
    releaseGateClaimedAutoUpdate: preflight.releaseGateClaimedAutoUpdate === true,
    releaseGateClaimedDeveloperIdSigning: preflight.releaseGateClaimedDeveloperIdSigning === true,
    releaseGateClaimedNotarization: preflight.releaseGateClaimedNotarization === true,
    releaseGateClaimedGatekeeperApproval: preflight.releaseGateClaimedGatekeeperApproval === true,
    releaseGateClaimedManualQaApproval: preflight.releaseGateClaimedManualQaApproval === true,
    releaseGateClaimedExternalDistribution: preflight.releaseGateClaimedExternalDistribution === true,
    valueRecorded: false
  };
}

function formatLocationRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.privateInputFilePath)} | ${escapeCell(row.privateInputFileLine ?? "none")} | ${readyLabel(row.privateInputFilePresent)} | ${readyLabel(row.privateInputFileKeyPresent)} | ${readyLabel(row.privateInputFilePlaceholder)} | ${readyLabel(row.privateInputFileShapeReady)} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.remediation)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCommandRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.requiredBeforeApply)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# Release-Channel Placeholder Input Receipt

- Receipt ready: ${readyLabel(report.receiptReady)}
- Receipt mode: ${report.receiptMode}
- Synthetic smoke: ${readyLabel(report.syntheticSmoke)}
- Source preflight command: \`${report.sourcePreflightCommand}\`
- Source preflight exit status: ${report.sourcePreflightExitStatus}
- Source preflight ready: ${readyLabel(report.sourcePreflightReady)}
- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}
- Local env modified: ${readyLabel(report.localEnvModified)}
- Real local env modified: ${readyLabel(report.realLocalEnvModified)}
- Current env edit target: \`${report.currentEnvEditTarget}\`
- Private input file key: \`${report.privateInputFileKey}\`
- Private input file default: \`${report.privateInputFileDefaultName}\`
- Private input file path: \`${report.privateInputFilePath}\`
- Private input file present: ${readyLabel(report.privateInputFilePresent)}
- Private input loaded keys: ${report.privateInputFileLoadedKeyCount} (${report.privateInputFileLoadedKeySummary})
- Private input placeholder keys: ${report.privateInputFilePlaceholderKeyCount} (${report.privateInputFilePlaceholderKeySummary})
- Private input missing keys: ${report.privateInputFileMissingKeyCount} (${report.privateInputFileMissingKeySummary})
- Private input invalid-shape keys: ${report.privateInputFileInvalidShapeKeyCount} (${report.privateInputFileInvalidShapeKeySummary})
- Process env checklist ready/missing/placeholder/invalid: ${report.processEnvInputChecklistReadyCount}/${report.processEnvInputChecklistMissingCount}/${report.processEnvInputChecklistPlaceholderCount}/${report.processEnvInputChecklistInvalidShapeCount}
- Next operator command: \`${report.nextOperatorCommand}\`
- Next proof command: \`${report.nextProofCommand}\`
- Hard gate command: \`${report.hardGateCommand}\`
- Private values recorded: ${readyLabel(report.privateValuesRecorded)}
- Private input file values recorded: ${readyLabel(report.privateInputFileValueRecorded)}
- URL/channel/private values recorded: ${readyLabel(report.releaseUrlValueRecorded || report.supportUrlValueRecorded || report.channelValueRecorded)}
- Network probe attempted: ${readyLabel(report.networkProbeAttempted)}
- Release upload attempted: ${readyLabel(report.releaseUploadAttempted)}
- Signing attempted: ${readyLabel(report.signingAttempted)}
- Notary submission attempted: ${readyLabel(report.notarySubmissionAttempted)}
- External distribution claimed: ${readyLabel(report.releaseGateClaimedExternalDistribution)}

## Private Input File Rows

| order | key | file | line | file present | key present | placeholder | shape ready | expected shape | remediation | value recorded |
|---:|---|---|---:|---|---|---|---|---|---|---|
${formatLocationRows(report.privateInputFileLocationRows)}

## Operator Command Rows

| order | command | role | required before apply | value recorded |
|---:|---|---|---|---|
${formatCommandRows(report.commandRows)}

The receipt is value-free. It records key names, file paths, line numbers, readiness booleans, row counts, and command names only; it does not record release URLs, support URLs, channel values, credentials, tokens, private beats, or real user audio.
`;
}

function validateReport(report, markdown) {
  check(report.receiptReady === true, "release-channel placeholder input receipt should be ready");
  check(
    [
      "missing-private-input-file",
      "incomplete-private-input-file",
      "placeholder-private-input-file",
      "invalid-shape-private-input-file",
      "ready-private-input-file",
      "review-private-input-file"
    ].includes(report.receiptMode),
    "release-channel placeholder input receipt should identify a private input mode"
  );
  check(report.privateInputFileLocationRowCount === releaseChannelMetadataKeys.length, "placeholder input receipt should include four private input location rows");
  check(report.privateInputFileLocationRows.every((row) => row.valueRecorded === false), "placeholder input location rows should be value-free");
  check(report.commandRows.every((row) => row.valueRecorded === false), "placeholder input command rows should be value-free");
  check(report.commandRows.some((row) => row.command === templateCommand), "placeholder input receipt should include private input template command");
  check(report.commandRows.some((row) => row.command === preflightCommand), "placeholder input receipt should include preflight command");
  check(report.commandRows.some((row) => row.command === applyCommand), "placeholder input receipt should include apply command");
  check(report.commandRows.some((row) => row.command === proofCommand), "placeholder input receipt should include strict proof command");
  check(report.privateValuesRecorded === false, "placeholder input receipt should not record private values");
  check(report.privateInputFileValueRecorded === false, "placeholder input receipt should not record private input file values");
  check(report.releaseUrlValueRecorded === false, "placeholder input receipt should not record release URLs");
  check(report.supportUrlValueRecorded === false, "placeholder input receipt should not record support URLs");
  check(report.channelValueRecorded === false, "placeholder input receipt should not record channel values");
  check(report.networkProbeAttempted === false, "placeholder input receipt should not attempt network probes");
  check(report.releaseUploadAttempted === false, "placeholder input receipt should not attempt release uploads");
  check(report.signingAttempted === false, "placeholder input receipt should not attempt signing");
  check(report.notarySubmissionAttempted === false, "placeholder input receipt should not attempt notarization");
  check(report.localEnvModified === false, "placeholder input receipt should not modify the local env");
  check(report.realLocalEnvModified === false, "placeholder input receipt should not modify the real local env");
  check(report.releaseGateClaimedAutoUpdate === false, "placeholder input receipt should not claim auto-update");
  check(report.releaseGateClaimedDeveloperIdSigning === false, "placeholder input receipt should not claim Developer ID signing");
  check(report.releaseGateClaimedNotarization === false, "placeholder input receipt should not claim notarization");
  check(report.releaseGateClaimedGatekeeperApproval === false, "placeholder input receipt should not claim Gatekeeper approval");
  check(report.releaseGateClaimedManualQaApproval === false, "placeholder input receipt should not claim manual QA approval");
  check(report.releaseGateClaimedExternalDistribution === false, "placeholder input receipt should not claim external distribution");
  if (report.syntheticSmoke) {
    check(report.receiptMode === "placeholder-private-input-file", "placeholder input smoke should use placeholder-private-input-file mode");
    check(report.sourcePreflightExitStatus === 1, "placeholder input smoke should observe blocked preflight exit 1");
    check(report.sourcePreflightReady === false, "placeholder input smoke should keep preflight blocked");
    check(report.privateInputFilePresent === true, "placeholder input smoke should include a private input file");
    check(report.privateInputFileLoadedKeyCount === releaseChannelMetadataKeys.length, "placeholder input smoke should load four private input keys");
    check(report.privateInputFilePlaceholderKeyCount === releaseChannelMetadataKeys.length, "placeholder input smoke should report four placeholder private input keys");
    check(report.privateInputFileMissingKeyCount === 0, "placeholder input smoke should not report missing private input keys");
    check(report.privateInputFileInvalidShapeKeyCount === 0, "placeholder input smoke should not report invalid private input shapes");
    check(report.nextOperatorCommand === preflightCommand, "placeholder input smoke should keep preflight as the next operator command");
  }
  check(markdown.includes("Release-Channel Placeholder Input Receipt"), "placeholder input receipt Markdown should include title");
  check(markdown.includes("Receipt mode:"), "placeholder input receipt Markdown should include mode");
  check(markdown.includes("Private input placeholder keys:"), "placeholder input receipt Markdown should include placeholder key count");
  check(markdown.includes("Private Input File Rows"), "placeholder input receipt Markdown should include private input rows");
  check(markdown.includes("Operator Command Rows"), "placeholder input receipt Markdown should include operator command rows");
}

try {
  await mkdir(packageRoot, { recursive: true });
  if (syntheticSmoke) {
    await writeSyntheticFixtures();
  }
  const preflightResult = runPreflight();
  if (preflightResult.error) {
    throw preflightResult.error;
  }
  if (![0, 1].includes(preflightResult.status)) {
    throw new Error(`preflight exited with unexpected status ${preflightResult.status}`);
  }
  const preflight = await readJsonRequired(preflightJsonPath, "release-channel apply preflight");
  const report = buildReport(preflight, preflightResult);
  const markdown = buildMarkdown(report);
  validateReport(report, markdown);

  if (failures.length > 0) {
    console.error("GrooveForge release-channel placeholder input receipt failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  await writeFile(markdownPath, markdown);
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log("GrooveForge release-channel placeholder input receipt passed.");
  console.log(`- Markdown: ${relative(markdownPath)}`);
  console.log(`- JSON: ${relative(jsonPath)}`);
  console.log(`- Receipt mode: ${report.receiptMode}`);
  console.log(`- Synthetic smoke: ${report.syntheticSmoke ? "yes" : "no"}`);
  console.log(`- Source preflight exit status: ${report.sourcePreflightExitStatus}`);
  console.log(`- Private input file present: ${report.privateInputFilePresent ? "yes" : "no"}`);
  console.log(`- Private input loaded keys: ${report.privateInputFileLoadedKeyCount}`);
  console.log(`- Private input placeholder keys: ${report.privateInputFilePlaceholderKeyCount}`);
  console.log(`- Private input missing keys: ${report.privateInputFileMissingKeyCount}`);
  console.log(`- Private input invalid-shape keys: ${report.privateInputFileInvalidShapeKeyCount}`);
  console.log(`- Next operator command: ${report.nextOperatorCommand}`);
  console.log(`- Private values recorded: ${report.privateValuesRecorded ? "yes" : "no"}`);
  console.log("- Network: no distribution channel probe, release upload, update feed publish, Apple notary submission, or signing attempted");
  console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
} catch (error) {
  console.error("GrooveForge release-channel placeholder input receipt failed:");
  console.error(`- ${error.message}`);
  process.exit(1);
}
