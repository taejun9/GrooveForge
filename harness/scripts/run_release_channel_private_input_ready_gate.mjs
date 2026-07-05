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
const args = process.argv.slice(2);
const blockedSyntheticSmoke = args.includes("--smoke") || args.includes("--blocked-smoke");
const readySyntheticSmoke = args.includes("--ready-smoke");
const strictExit = args.includes("--strict");
const syntheticSmoke = blockedSyntheticSmoke || readySyntheticSmoke;
const reportStem = readySyntheticSmoke
  ? "release-channel-private-input-ready-gate-ready-smoke"
  : blockedSyntheticSmoke
    ? "release-channel-private-input-ready-gate-smoke"
    : "release-channel-private-input-ready-gate";
const sourceReceiptStem = readySyntheticSmoke
  ? "release-channel-placeholder-input-receipt-ready-smoke"
  : blockedSyntheticSmoke
    ? "release-channel-placeholder-input-receipt-smoke"
    : "release-channel-placeholder-input-receipt";
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const sourceReceiptJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${sourceReceiptStem}.json`);
const sourceReceiptMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${sourceReceiptStem}.md`);
const readyGateArtifactNames = [
  "release-channel-private-input-ready-gate.md",
  "release-channel-private-input-ready-gate.json",
  "release-channel-private-input-ready-gate-smoke.md",
  "release-channel-private-input-ready-gate-smoke.json",
  "release-channel-private-input-ready-gate-ready-smoke.md",
  "release-channel-private-input-ready-gate-ready-smoke.json"
];
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const readyGateCommand = "npm run release:channel-private-input-ready-gate";
const templateCommand = "npm run release:channel-private-input-template";
const preflightCommand = "npm run release:channel-apply-private-env-preflight";
const applyCommand = "npm run release:channel-apply-private-env";
const proofCommand = "npm run release:private-edit-strict-proof";
const currentBlockerCommand = "npm run release:current-blocker";
const hardGateCommand = "npm run release:external-check";
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

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function objectRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object" && !Array.isArray(row)) : [];
}

function rowLocation(row) {
  const file = textValue(row.privateInputFilePath, ".env.release-channel.local");
  const line = Number.isInteger(row.privateInputFileLine) ? row.privateInputFileLine : "add";
  return `${file}:${line} ${textValue(row.key)}`;
}

function rowState(row) {
  if (row.privateInputFilePresent !== true) {
    return "missing-private-input-file";
  }
  if (row.privateInputFileKeyPresent !== true) {
    return "missing-private-input-row";
  }
  if (row.privateInputFilePlaceholder === true) {
    return "placeholder-private-input-row";
  }
  if (row.privateInputFileShapeReady !== true) {
    return "invalid-shape-private-input-row";
  }
  return "ready-private-input-row";
}

function summarizeLocations(rows) {
  return rows.length > 0 ? rows.map(rowLocation).join(", ") : "none";
}

function runSourceReceipt() {
  const scriptName = readySyntheticSmoke
    ? "release:channel-placeholder-input-receipt-ready-smoke"
    : blockedSyntheticSmoke
      ? "release:channel-placeholder-input-receipt-smoke"
      : "release:channel-placeholder-input-receipt";
  const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", scriptName], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    stdio: "pipe"
  });
  return {
    command: `npm run ${scriptName}`,
    status: Number.isInteger(result.status) ? result.status : 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error
  };
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`${label} JSON is missing at ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function readyRowsFromReceipt(receipt) {
  return objectRows(receipt.privateInputFileLocationRows).map((row, index) => {
    const state = rowState(row);
    return {
      order: integerValue(row.order) || index + 1,
      key: textValue(row.key),
      privateInputFilePath: textValue(row.privateInputFilePath, ".env.release-channel.local"),
      privateInputFileLine: Number.isInteger(row.privateInputFileLine) ? row.privateInputFileLine : null,
      inputSource: textValue(row.inputSource),
      privateInputFilePresent: row.privateInputFilePresent === true,
      privateInputFileKeyPresent: row.privateInputFileKeyPresent === true,
      privateInputFilePlaceholder: row.privateInputFilePlaceholder === true,
      privateInputFileShapeReady: row.privateInputFileShapeReady === true,
      readyToApply: state === "ready-private-input-row",
      gateState: state,
      expectedShape: textValue(row.expectedShape),
      remediation: textValue(row.remediation),
      valueRecorded: false
    };
  });
}

function gateMode({ readyToApply, missingCount, placeholderCount, invalidShapeCount }) {
  if (readyToApply) {
    return "ready-to-apply";
  }
  if (missingCount > 0) {
    return "blocked-missing-private-input";
  }
  if (placeholderCount > 0) {
    return "blocked-placeholder-private-input";
  }
  if (invalidShapeCount > 0) {
    return "blocked-invalid-shape-private-input";
  }
  return "blocked-review-private-input";
}

function buildGateRows({ readyToApply, blockedRows }) {
  return [
    {
      order: 1,
      step: "edit-private-input-file",
      command: "edit ignored private input file",
      ready: readyToApply,
      target: summarizeLocations(blockedRows),
      expected: "four value-free shape-ready private input rows",
      valueRecorded: false
    },
    {
      order: 2,
      step: "run-ready-gate",
      command: readyGateCommand,
      ready: readyToApply,
      target: "private input file readiness before apply",
      expected: "ready-to-apply mode",
      valueRecorded: false
    },
    {
      order: 3,
      step: "run-preflight",
      command: preflightCommand,
      ready: readyToApply,
      target: "non-writing release-channel private input preflight",
      expected: "preflight exits 0",
      valueRecorded: false
    },
    {
      order: 4,
      step: "run-apply",
      command: applyCommand,
      ready: false,
      target: ".env.distribution.local release-channel rows",
      expected: "run only after ready gate and preflight are ready",
      valueRecorded: false
    },
    {
      order: 5,
      step: "run-strict-proof",
      command: proofCommand,
      ready: false,
      target: "post-apply release-channel proof chain",
      expected: "strict proof passes after apply",
      valueRecorded: false
    }
  ];
}

function buildReport(receipt, sourceResult) {
  const rows = readyRowsFromReceipt(receipt);
  const readyCount = rows.filter((row) => row.readyToApply === true).length;
  const missingRows = rows.filter(
    (row) => row.privateInputFilePresent !== true || row.privateInputFileKeyPresent !== true
  );
  const placeholderRows = rows.filter((row) => row.privateInputFilePlaceholder === true);
  const invalidShapeRows = rows.filter(
    (row) =>
      row.privateInputFilePresent === true &&
      row.privateInputFileKeyPresent === true &&
      row.privateInputFilePlaceholder !== true &&
      row.privateInputFileShapeReady !== true
  );
  const blockedRows = missingRows.length > 0 ? missingRows : placeholderRows.length > 0 ? placeholderRows : invalidShapeRows;
  const readyToApply =
    receipt.receiptReady === true &&
    receipt.receiptMode === "ready-private-input-file" &&
    receipt.sourcePreflightReady === true &&
    readyCount === releaseChannelMetadataKeys.length &&
    missingRows.length === 0 &&
    placeholderRows.length === 0 &&
    invalidShapeRows.length === 0;
  const mode = gateMode({
    readyToApply,
    missingCount: missingRows.length,
    placeholderCount: placeholderRows.length,
    invalidShapeCount: invalidShapeRows.length
  });
  const gateRows = buildGateRows({ readyToApply, blockedRows });
  const readyGateResumeCommand = readyToApply ? applyCommand : readyGateCommand;
  const readyGateResumeEditTarget = readyToApply
    ? "none; private input rows are shape-ready"
    : summarizeLocations(blockedRows);
  const readyGateResumeExpected = readyToApply
    ? "run apply after the preserved preflight command stays ready"
    : "replace blocked private input rows, rerun the ready gate, then run preflight and apply";
  return {
    generatedAt: new Date().toISOString(),
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: readySyntheticSmoke
      ? "npm run release:channel-private-input-ready-gate-ready-smoke"
      : blockedSyntheticSmoke
        ? "npm run release:channel-private-input-ready-gate-smoke"
        : "npm run release:channel-private-input-ready-gate",
    reportStem,
    strictExit,
    syntheticSmoke,
    blockedSyntheticSmoke,
    readySyntheticSmoke,
    readyGateArtifactNames,
    readyGateArtifactNameCount: readyGateArtifactNames.length,
    releaseChannelPrivateInputReadyGateMarkdownPath: relative(markdownPath),
    releaseChannelPrivateInputReadyGateJsonPath: relative(jsonPath),
    sourceReceiptCommand: sourceResult.command,
    sourceReceiptExitStatus: sourceResult.status,
    sourceReceiptReady: receipt.receiptReady === true,
    sourceReceiptMode: textValue(receipt.receiptMode),
    sourceReceiptJsonPath: relative(sourceReceiptJsonPath),
    sourceReceiptMarkdownPath: relative(sourceReceiptMarkdownPath),
    sourceReceiptValueRecorded: receipt.valueRecorded === true,
    sourcePreflightCommand: textValue(receipt.sourcePreflightCommand, preflightCommand),
    sourcePreflightExitStatus: integerValue(receipt.sourcePreflightExitStatus),
    sourcePreflightReady: receipt.sourcePreflightReady === true,
    localEnvModified: receipt.localEnvModified === true,
    realLocalEnvModified: receipt.realLocalEnvModified === true,
    readyGateCommand,
    readyGateMode: mode,
    readyGateResumeCommand,
    readyGateResumeEditTarget,
    readyGateResumeMode: mode,
    readyGateResumeExpected,
    readyGateResumeReadyToApply: readyToApply,
    readyGateResumeValueRecorded: false,
    releaseChannelPrivateInputReadyGateReady: true,
    releaseChannelPrivateInputReadyToApply: readyToApply,
    currentOperatorFirstCommand: preflightCommand,
    currentOperatorFirstCommandPreserved: true,
    nextOperatorCommand: readyToApply ? applyCommand : readyGateCommand,
    nextWriteCommand: applyCommand,
    nextProofCommand: proofCommand,
    currentBlockerCommand,
    hardGateCommand,
    privateInputFileKey: textValue(receipt.privateInputFileKey, "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE"),
    privateInputFileDefaultName: textValue(receipt.privateInputFileDefaultName, ".env.release-channel.local"),
    privateInputFilePath: textValue(receipt.privateInputFilePath, ".env.release-channel.local"),
    privateInputFilePresent: receipt.privateInputFilePresent === true,
    privateInputFileLoadedKeyCount: integerValue(receipt.privateInputFileLoadedKeyCount),
    privateInputFileLoadedKeySummary: textValue(receipt.privateInputFileLoadedKeySummary),
    readyInputKeyCount: readyCount,
    missingInputKeyCount: missingRows.length,
    placeholderInputKeyCount: placeholderRows.length,
    invalidShapeInputKeyCount: invalidShapeRows.length,
    blockedInputKeyCount: missingRows.length + placeholderRows.length + invalidShapeRows.length,
    blockedInputLocationSummary: summarizeLocations(blockedRows),
    readyGateRows: gateRows,
    readyGateRowCount: gateRows.length,
    readyGateRowsValueFree: gateRows.every((row) => row.valueRecorded === false),
    privateInputReadyRows: rows,
    privateInputReadyRowCount: rows.length,
    privateInputReadyRowsValueFree: rows.every((row) => row.valueRecorded === false),
    privateInputReadyLocationSummary: summarizeLocations(rows),
    privateValuesRecorded: receipt.privateValuesRecorded === true,
    privateInputFileValueRecorded: receipt.privateInputFileValueRecorded === true,
    localEnvValueRecorded: false,
    releaseUrlValueRecorded: receipt.releaseUrlValueRecorded === true,
    supportUrlValueRecorded: receipt.supportUrlValueRecorded === true,
    channelValueRecorded: receipt.channelValueRecorded === true,
    networkProbeAttempted: receipt.networkProbeAttempted === true,
    releaseUploadAttempted: receipt.releaseUploadAttempted === true,
    updateFeedPublishAttempted: false,
    signingAttempted: receipt.signingAttempted === true,
    notarySubmissionAttempted: receipt.notarySubmissionAttempted === true,
    claimedAutoUpdate: receipt.releaseGateClaimedAutoUpdate === true,
    claimedDeveloperIdSigning: receipt.releaseGateClaimedDeveloperIdSigning === true,
    claimedNotarization: receipt.releaseGateClaimedNotarization === true,
    claimedGatekeeperApproval: receipt.releaseGateClaimedGatekeeperApproval === true,
    claimedManualQaApproval: receipt.releaseGateClaimedManualQaApproval === true,
    claimedExternalDistribution: receipt.releaseGateClaimedExternalDistribution === true,
    valueRecorded: false
  };
}

function formatReadyRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.privateInputFilePath)} | ${escapeCell(row.privateInputFileLine ?? "add")} | ${escapeCell(row.inputSource)} | ${readyLabel(row.privateInputFilePresent)} | ${readyLabel(row.privateInputFileKeyPresent)} | ${readyLabel(row.privateInputFilePlaceholder)} | ${readyLabel(row.privateInputFileShapeReady)} | ${readyLabel(row.readyToApply)} | ${escapeCell(row.gateState)} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.remediation)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatGateRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.step)} | \`${escapeCell(row.command)}\` | ${readyLabel(row.ready)} | ${escapeCell(row.target)} | ${escapeCell(row.expected)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# GrooveForge Release-Channel Private Input Ready Gate

## Summary

- Ready gate ready: ${readyLabel(report.releaseChannelPrivateInputReadyGateReady)}
- Ready to apply: ${readyLabel(report.releaseChannelPrivateInputReadyToApply)}
- Ready gate mode: ${report.readyGateMode}
- Ready gate resume command: \`${report.readyGateResumeCommand}\`
- Ready gate resume edit target: ${report.readyGateResumeEditTarget}
- Ready gate resume expected: ${report.readyGateResumeExpected}
- Synthetic smoke: ${readyLabel(report.syntheticSmoke)}
- Strict exit requested: ${readyLabel(report.strictExit)}
- Source receipt command: \`${report.sourceReceiptCommand}\`
- Source receipt mode: ${report.sourceReceiptMode}
- Source receipt ready: ${readyLabel(report.sourceReceiptReady)}
- Source preflight ready: ${readyLabel(report.sourcePreflightReady)}
- Source preflight exit status: ${report.sourcePreflightExitStatus}
- Current operator first command preserved: ${readyLabel(report.currentOperatorFirstCommandPreserved)}
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Ready gate command: \`${report.readyGateCommand}\`
- Next operator command: \`${report.nextOperatorCommand}\`
- Next write command: \`${report.nextWriteCommand}\`
- Next proof command: \`${report.nextProofCommand}\`
- Private input file path: \`${report.privateInputFilePath}\`
- Private input file present: ${readyLabel(report.privateInputFilePresent)}
- Private input loaded keys: ${report.privateInputFileLoadedKeyCount} (${report.privateInputFileLoadedKeySummary})
- Ready/missing/placeholder/invalid rows: ${report.readyInputKeyCount}/${report.missingInputKeyCount}/${report.placeholderInputKeyCount}/${report.invalidShapeInputKeyCount}
- Blocked private input locations: ${report.blockedInputKeyCount} (${report.blockedInputLocationSummary})
- Private input ready rows: ${report.privateInputReadyRowCount}
- Gate handoff rows: ${report.readyGateRowCount}
- Local env modified: ${readyLabel(report.localEnvModified)}
- Real local env modified: ${readyLabel(report.realLocalEnvModified)}
- Private values recorded: ${readyLabel(report.privateValuesRecorded)}
- Private input file values recorded: ${readyLabel(report.privateInputFileValueRecorded)}
- URL/channel values recorded: ${readyLabel(report.releaseUrlValueRecorded || report.supportUrlValueRecorded || report.channelValueRecorded)}
- Network probe attempted: ${readyLabel(report.networkProbeAttempted)}
- Release upload attempted: ${readyLabel(report.releaseUploadAttempted)}
- Signing attempted: ${readyLabel(report.signingAttempted)}
- Notary submission attempted: ${readyLabel(report.notarySubmissionAttempted)}
- External distribution claimed: ${readyLabel(report.claimedExternalDistribution)}

## Private Input Ready Rows

| order | key | file | line | source | file present | key present | placeholder | shape ready | ready to apply | gate state | expected shape | remediation | value recorded |
|---:|---|---|---:|---|---:|---:|---:|---:|---:|---|---|---|---:|
${formatReadyRows(report.privateInputReadyRows)}

## Ready Gate Handoff

| order | step | command | ready | target | expected | value recorded |
|---:|---|---|---:|---|---|---:|
${formatGateRows(report.readyGateRows)}

## Safety Posture

This gate records key names, file paths, line numbers, readiness booleans, row counts, and command names only. It does not record release URLs, support URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, private beats, or real user audio. It does not probe networks, upload releases, sign, notarize, or claim external distribution.
`;
}

function validateReport(report, markdown, sourceOutput) {
  check(report.releaseChannelPrivateInputReadyGateReady === true, "private input ready gate report should be ready");
  check(report.readyGateArtifactNameCount === 6, "private input ready gate should track six artifact names");
  check(report.sourceReceiptReady === true, "private input ready gate should read a ready source receipt");
  check(report.privateInputReadyRowCount === releaseChannelMetadataKeys.length, "private input ready gate should include four private input rows");
  check(report.privateInputReadyRowsValueFree === true, "private input ready gate private input rows should be value-free");
  check(report.readyGateRowCount === 5, "private input ready gate should include five handoff rows");
  check(report.readyGateRowsValueFree === true, "private input ready gate handoff rows should be value-free");
  check(report.currentOperatorFirstCommand === preflightCommand, "private input ready gate should preserve the preflight-first operator command");
  check(report.readyGateCommand === readyGateCommand, "private input ready gate should expose its rerun command");
  check(report.readyGateResumeCommand === report.nextOperatorCommand, "private input ready gate resume command should mirror next operator command");
  check(report.readyGateResumeMode === report.readyGateMode, "private input ready gate resume mode should mirror gate mode");
  check(report.readyGateResumeValueRecorded === false, "private input ready gate resume fields should stay value-free");
  check(report.nextWriteCommand === applyCommand, "private input ready gate should expose the apply command");
  check(report.nextProofCommand === proofCommand, "private input ready gate should expose the strict proof command");
  check(report.localEnvModified === false, "private input ready gate should not modify local env");
  check(report.realLocalEnvModified === false, "private input ready gate should not modify real local env");
  check(report.privateValuesRecorded === false, "private input ready gate should not record private values");
  check(report.privateInputFileValueRecorded === false, "private input ready gate should not record private input file values");
  check(report.releaseUrlValueRecorded === false, "private input ready gate should not record release URL values");
  check(report.supportUrlValueRecorded === false, "private input ready gate should not record support URL values");
  check(report.channelValueRecorded === false, "private input ready gate should not record channel values");
  check(report.networkProbeAttempted === false, "private input ready gate should not probe networks");
  check(report.releaseUploadAttempted === false, "private input ready gate should not upload releases");
  check(report.signingAttempted === false, "private input ready gate should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "private input ready gate should not submit to Apple notary service");
  check(report.claimedAutoUpdate === false, "private input ready gate should not claim auto-update");
  check(report.claimedDeveloperIdSigning === false, "private input ready gate should not claim Developer ID signing");
  check(report.claimedNotarization === false, "private input ready gate should not claim notarization");
  check(report.claimedGatekeeperApproval === false, "private input ready gate should not claim Gatekeeper approval");
  check(report.claimedManualQaApproval === false, "private input ready gate should not claim manual QA approval");
  check(report.claimedExternalDistribution === false, "private input ready gate should not claim external distribution");
  if (blockedSyntheticSmoke) {
    check(report.releaseChannelPrivateInputReadyToApply === false, "blocked ready gate smoke should not be ready to apply");
    check(report.readyGateMode === "blocked-placeholder-private-input", "blocked ready gate smoke should report placeholder-private-input mode");
    check(report.placeholderInputKeyCount === releaseChannelMetadataKeys.length, "blocked ready gate smoke should report four placeholder input rows");
    check(report.nextOperatorCommand === readyGateCommand, "blocked ready gate smoke should ask the operator to rerun the ready gate after edits");
    check(report.readyGateResumeCommand === readyGateCommand, "blocked ready gate smoke should expose the ready gate as the resume command");
    check(report.readyGateResumeEditTarget.includes(".env.release-channel.local"), "blocked ready gate smoke should expose the ignored private input edit target");
  }
  if (readySyntheticSmoke) {
    check(report.releaseChannelPrivateInputReadyToApply === true, "ready gate smoke should be ready to apply");
    check(report.readyGateMode === "ready-to-apply", "ready gate smoke should report ready-to-apply mode");
    check(report.readyInputKeyCount === releaseChannelMetadataKeys.length, "ready gate smoke should report four ready private input rows");
    check(report.nextOperatorCommand === applyCommand, "ready gate smoke should hand off to apply");
    check(report.readyGateResumeCommand === applyCommand, "ready gate smoke should expose apply as the resume command");
    check(report.readyGateResumeEditTarget.includes("shape-ready"), "ready gate smoke should not ask for another private edit when rows are ready");
  }
  check(!/https?:\/\//i.test(JSON.stringify(report)), "private input ready gate JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "private input ready gate Markdown should not include URL values");
  check(!/https?:\/\//i.test(sourceOutput), "private input ready gate source output should not include URL values");
  check(markdown.includes("Private Input Ready Rows"), "private input ready gate Markdown should include ready rows");
  check(markdown.includes("Ready Gate Handoff"), "private input ready gate Markdown should include handoff rows");
}

try {
  await mkdir(packageRoot, { recursive: true });
  const sourceResult = runSourceReceipt();
  if (sourceResult.error) {
    throw sourceResult.error;
  }
  if (sourceResult.status !== 0) {
    throw new Error(`${sourceResult.command} exited with status ${sourceResult.status}`);
  }
  const receipt = await readJsonRequired(sourceReceiptJsonPath, "release-channel placeholder input receipt");
  const report = buildReport(receipt, sourceResult);
  const markdown = buildMarkdown(report);
  validateReport(report, markdown, `${sourceResult.stdout}\n${sourceResult.stderr}`);

  if (failures.length > 0) {
    console.error("GrooveForge release-channel private input ready gate failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  await writeFile(markdownPath, markdown, "utf8");
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("GrooveForge release-channel private input ready gate passed.");
  console.log(`- Markdown: ${relative(markdownPath)}`);
  console.log(`- JSON: ${relative(jsonPath)}`);
  console.log(`- Ready to apply: ${report.releaseChannelPrivateInputReadyToApply ? "yes" : "no"}`);
  console.log(`- Ready gate mode: ${report.readyGateMode}`);
  console.log(`- Ready gate resume command: ${report.readyGateResumeCommand}`);
  console.log(`- Ready gate resume edit target: ${report.readyGateResumeEditTarget}`);
  console.log(`- Source receipt mode: ${report.sourceReceiptMode}`);
  console.log(`- Ready/missing/placeholder/invalid rows: ${report.readyInputKeyCount}/${report.missingInputKeyCount}/${report.placeholderInputKeyCount}/${report.invalidShapeInputKeyCount}`);
  console.log(`- Blocked private input locations: ${report.blockedInputKeyCount} (${report.blockedInputLocationSummary})`);
  console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
  console.log(`- Ready gate command: ${report.readyGateCommand}`);
  console.log(`- Next operator command: ${report.nextOperatorCommand}`);
  console.log(`- Next write command: ${report.nextWriteCommand}`);
  console.log(`- Next proof command: ${report.nextProofCommand}`);
  console.log("- Private values recorded: no");
  console.log("- Network: no distribution channel probe, release upload, update feed publish, Apple notary submission, or signing attempted");
  console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");

  if (strictExit && report.releaseChannelPrivateInputReadyToApply !== true) {
    process.exit(1);
  }
} catch (error) {
  console.error("GrooveForge release-channel private input ready gate failed:");
  console.error(`- ${error.message}`);
  process.exit(1);
}
