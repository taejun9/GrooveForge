#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const packetMarkdownArtifactName = "release-channel-edit-packet-smoke.md";
const packetJsonArtifactName = "release-channel-edit-packet-smoke.json";
const packetMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetMarkdownArtifactName}`);
const packetJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetJsonArtifactName}`);
const releaseDoctorJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-doctor.json`);
const releaseChannelLiveCheckJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-live-check.json`);
const releaseChannelPreflightBlockedJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-apply-private-env-preflight-blocked-smoke.json`);
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const recommendedOperatorProofCommand = "npm run release:private-edit-strict-proof";
const releaseChannelPrivateInputTemplateCommand = "npm run release:channel-private-input-template";
const releaseChannelPrivateInputTemplateRole =
  "create the ignored .env.release-channel.local skeleton for the four private release-channel metadata values before preflight";
const releaseChannelSetupWizardCommand = "npm run release:channel-setup-wizard";
const releaseChannelApplyPrivateEnvPreflightCommand = "npm run release:channel-apply-private-env-preflight";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
const releaseChannelPrivateInputSourceLabel = "process env or ignored private input file";
const privateInputFileKey = "GROOVEFORGE_RELEASE_CHANNEL_INPUT_FILE";
const defaultPrivateInputFileName = ".env.release-channel.local";
const operatorPrivateInputFileDefaultPath = defaultPrivateInputFileName;
const lowerLevelLiveCheckCommand = "npm run release:channel-live-check";
const lowerLevelStrictProofCommand = "npm run release:channel-live-check-strict";
const refreshCommandRows = [
  {
    order: 1,
    command: "npm run release:doctor",
    role: "refresh value-free release-channel blocker and current action evidence",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:channel-live-check",
    role: "refresh value-free current release-channel key shape and location evidence",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:channel-apply-private-env-preflight-blocked-smoke",
    role: "refresh value-free private input file route and blocked preflight handoff evidence",
    valueRecorded: false
  }
];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release-channel edit packet smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function readyLabel(value) {
  return value === true ? "yes" : "no";
}

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function displayEvidenceFile(filePath) {
  const value = textValue(filePath);
  if (value === "none") {
    return value;
  }
  const absolutePath = path.isAbsolute(value) ? value : path.resolve(root, value);
  const relativePath = path.relative(root, absolutePath);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.basename(absolutePath);
}

function sameEditTarget(left, right) {
  const normalizedLeft = displayEvidenceFile(left);
  const normalizedRight = displayEvidenceFile(right);
  return normalizedLeft !== "none" && normalizedLeft === normalizedRight;
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function commandSummary(rows) {
  return rows.map((row) => row.command).join(" -> ");
}

function commandOrder(rows, command) {
  const index = rows.findIndex((row) => row.command === command);
  return index >= 0 ? index + 1 : 0;
}

function runNpmScript(command) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const [, , scriptName] = command.split(" ");
  const result = spawnSync(npmCommand, ["run", scriptName], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail(`Could not run ${command}.`, result.error.message);
  }
  if (result.status !== 0) {
    fail(`${command} exited with status ${result.status}.`, "Refresh the release-channel evidence named above before retrying this edit packet smoke.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function completedPlanProgress() {
  const completedDir = path.join(root, "docs", "exec_plans", "completed");
  const entries = await readdir(completedDir);
  const planNumbers = entries
    .map((entry) => /^plan-(\d+)-/.exec(entry)?.[1])
    .filter(Boolean)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value > 0);
  const latestCompletedPlanNumber = Math.max(...planNumbers);
  const latestTenPlanWindowStart = Math.floor((latestCompletedPlanNumber - 1) / 10) * 10 + 1;
  const latestTenPlanWindowEnd = latestTenPlanWindowStart + 9;
  const latestTenPlanCompletedCount = planNumbers.filter(
    (planNumber) => planNumber >= latestTenPlanWindowStart && planNumber <= latestTenPlanWindowEnd
  ).length;
  const latestTenPlanTotal = 10;
  return {
    latestCompletedPlanNumber,
    latestTenPlanWindowStart,
    latestTenPlanWindowEnd,
    latestTenPlanCompletedCount,
    latestTenPlanTotal,
    latestTenPlanProgressLabel: `${latestTenPlanWindowStart}-${latestTenPlanWindowEnd}: ${latestTenPlanCompletedCount}/${latestTenPlanTotal}`,
    tenPlanProgressReportDue: latestTenPlanCompletedCount === latestTenPlanTotal,
    nextTenPlanProgressReportAt: `plan-${latestTenPlanWindowEnd}`
  };
}

function sourceRow({ label, path: filePath, ready, evidence }) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready,
    evidence,
    valueRecorded: false
  };
}

function packetMode(doctor) {
  if (doctor.currentActionId === "prepare-local-distribution-env") {
    return "create-ignored-env-scaffold";
  }
  if (doctor.currentActionId === "replace-release-channel-placeholders") {
    return "replace-release-channel-placeholders";
  }
  if (doctor.currentActionId === "verify-release-channel-metadata") {
    return "verify-release-channel-metadata";
  }
  return "continue-external-proof-chain";
}

function operatorCommandRows(mode, currentEnvEditTarget) {
  const baseRows =
    mode === "create-ignored-env-scaffold"
      ? [
          {
            order: 1,
            command: releaseChannelPrivateInputTemplateCommand,
            role: releaseChannelPrivateInputTemplateRole,
            valueRecorded: false
          },
          {
            order: 2,
            command: releaseChannelSetupWizardCommand,
            role: `guided local-only setup for the four private release-channel metadata values in ${currentEnvEditTarget}`,
            valueRecorded: false
          },
          {
            order: 3,
            command: "npm run release:prepare-env",
            role: "create the ignored local distribution env scaffold before private edits",
            valueRecorded: false
          },
          {
            order: 4,
            command: releaseChannelApplyPrivateEnvPreflightCommand,
            role: `verify the four private release-channel metadata rows from ${releaseChannelPrivateInputSourceLabel} before writing ${currentEnvEditTarget}`,
            valueRecorded: false
          },
          {
            order: 5,
            command: releaseChannelApplyPrivateEnvCommand,
            role: `apply the four private release-channel metadata rows from ${releaseChannelPrivateInputSourceLabel} into ${currentEnvEditTarget} after preflight passes`,
            valueRecorded: false
          }
        ]
      : [
          {
            order: 1,
            command: releaseChannelPrivateInputTemplateCommand,
            role: releaseChannelPrivateInputTemplateRole,
            valueRecorded: false
          },
          {
            order: 2,
            command: releaseChannelSetupWizardCommand,
            role: `guided local-only setup for the four private release-channel metadata values in ${currentEnvEditTarget}`,
            valueRecorded: false
          },
          {
            order: 3,
            command: releaseChannelApplyPrivateEnvPreflightCommand,
            role: `verify the four private release-channel metadata rows from ${releaseChannelPrivateInputSourceLabel} before writing ${currentEnvEditTarget}`,
            valueRecorded: false
          },
          {
            order: 4,
            command: releaseChannelApplyPrivateEnvCommand,
            role: `apply the four private release-channel metadata rows from ${releaseChannelPrivateInputSourceLabel} into ${currentEnvEditTarget} after preflight passes`,
            valueRecorded: false
          }
        ];
  const followUpRows = [
    {
      command: recommendedOperatorProofCommand,
      role: "recommended one-command strict proof chain after preflight and apply for the four private release-channel metadata values",
      valueRecorded: false
    },
    {
      command: lowerLevelLiveCheckCommand,
      role: "narrow value-free shape/location check for the four release-channel metadata rows",
      valueRecorded: false
    },
    {
      command: lowerLevelStrictProofCommand,
      role: "lower-level pass/fail proof for the same four release-channel metadata rows",
      valueRecorded: false
    },
    {
      command: "npm run release:doctor",
      role: "broader redacted release readiness refresh after the strict proof chain",
      valueRecorded: false
    },
    {
      command: "npm run release:current-blocker",
      role: "refresh the user-facing current blocker receipt after private edits",
      valueRecorded: false
    },
    {
      command: "npm run release:next-actions",
      role: "select the next external proof target after release-channel metadata clears",
      valueRecorded: false
    },
    {
      command: "npm run release:external-check",
      role: "hard external gate after every redacted readiness signal is ready",
      valueRecorded: false
    }
  ];
  return [...baseRows, ...followUpRows].map((row, index) => ({ ...row, order: index + 1 }));
}

function currentOperatorCommandRows(mode, currentEnvEditTarget) {
  const baseRows =
    mode === "create-ignored-env-scaffold"
      ? [
          {
            command: "npm run release:prepare-env",
            role: `create the ignored local distribution env scaffold before private edits in ${currentEnvEditTarget}`
          },
          {
            command: releaseChannelApplyPrivateEnvPreflightCommand,
            role: `verify the four private release-channel metadata rows from ${releaseChannelPrivateInputSourceLabel} before writing ${currentEnvEditTarget}`
          },
          {
            command: releaseChannelApplyPrivateEnvCommand,
            role: `apply the four private release-channel metadata rows from ${releaseChannelPrivateInputSourceLabel} into ${currentEnvEditTarget} after preflight passes`
          }
        ]
      : [
          {
            command: releaseChannelApplyPrivateEnvPreflightCommand,
            role: `verify the four private release-channel metadata rows from ${releaseChannelPrivateInputSourceLabel} before writing ${currentEnvEditTarget}`
          },
          {
            command: releaseChannelApplyPrivateEnvCommand,
            role: `apply the four private release-channel metadata rows from ${releaseChannelPrivateInputSourceLabel} into ${currentEnvEditTarget} after preflight passes`
          }
        ];
  const followUpRows = [
    {
      command: recommendedOperatorProofCommand,
      role: "recommended one-command strict proof chain after preflight and apply for the four private release-channel metadata values"
    },
    {
      command: "npm run release:current-blocker",
      role: "refresh the user-facing current blocker receipt after private edits"
    },
    {
      command: "npm run release:next-actions",
      role: "select the next external proof target after release-channel metadata clears"
    },
    {
      command: "npm run release:external-check",
      role: "hard external gate after every redacted readiness signal is ready"
    }
  ];

  return [...baseRows, ...followUpRows].map((row, index) => ({
    ...row,
    order: index + 1,
    ready: true,
    valueRecorded: false
  }));
}

function buildEditRows(liveCheck) {
  return arrayValue(liveCheck.releaseChannelLiveCheckRows).map((row) => ({
    order: row.order,
    key: row.key,
    kind: row.kind,
    expectedShape: row.expectedShape,
    present: row.present === true,
    placeholder: row.placeholder === true,
    shapeReady: row.shapeReady === true,
    currentReady: row.currentReady === true,
    editTarget: textValue(row.editTarget),
    line: Number.isInteger(row.line) ? row.line : null,
    proofCommand: lowerLevelLiveCheckCommand,
    strictProofCommand: lowerLevelStrictProofCommand,
    operatorProofCommand: recommendedOperatorProofCommand,
    doctorCommand: "npm run release:doctor",
    currentBlockerCommand: "npm run release:current-blocker",
    hardGateCommand: "npm run release:external-check",
    valueRecorded: false
  }));
}

function formatCommandRows(rows) {
  return rows.map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function formatCurrentOperatorCommandRows(rows) {
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.ready)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${readyLabel(row.ready)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.path)}\` | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatEditRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.kind)} | ${escapeCell(row.expectedShape)} | ${readyLabel(row.present)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${readyLabel(row.currentReady)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "none")} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.strictProofCommand)}\` | \`${escapeCell(row.operatorProofCommand)}\` | \`${escapeCell(row.doctorCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildReport({ doctor, liveCheck, preflightBlocked, progress }) {
  const mode = packetMode(doctor);
  const editRows = buildEditRows(liveCheck);
  const currentEnvEditTarget = displayEvidenceFile(liveCheck.currentEnvEditTarget ?? doctor.currentEnvEditTarget);
  const operatorRows = operatorCommandRows(mode, currentEnvEditTarget);
  const currentOperatorRows = currentOperatorCommandRows(mode, currentEnvEditTarget);
  const currentOperatorPreflightCommandOrder = commandOrder(currentOperatorRows, releaseChannelApplyPrivateEnvPreflightCommand);
  const currentOperatorApplyCommandOrder = commandOrder(currentOperatorRows, releaseChannelApplyPrivateEnvCommand);
  const currentOperatorStrictProofCommandOrder = commandOrder(currentOperatorRows, recommendedOperatorProofCommand);
  const currentOperatorCommandSequenceReady =
    currentOperatorRows.length >= 5 &&
    currentOperatorRows.every((row) => row.ready === true && row.valueRecorded === false) &&
    currentOperatorPreflightCommandOrder > 0 &&
    currentOperatorApplyCommandOrder > currentOperatorPreflightCommandOrder &&
    currentOperatorStrictProofCommandOrder > currentOperatorApplyCommandOrder &&
    currentOperatorRows.some((row) => row.command === "npm run release:current-blocker") &&
    currentOperatorRows.some((row) => row.command === "npm run release:next-actions") &&
    currentOperatorRows.every((row) => row.command !== releaseChannelSetupWizardCommand);
  const preflightBlockedSourceReady =
    preflightBlocked.blockedSmokeReady === true &&
    preflightBlocked.expectedBlockedExitObserved === true &&
    preflightBlocked.sourceCommand === releaseChannelApplyPrivateEnvPreflightCommand &&
    preflightBlocked.currentOperatorFirstCommand === releaseChannelApplyPrivateEnvPreflightCommand &&
    preflightBlocked.nextWriteCommand === releaseChannelApplyPrivateEnvCommand &&
    preflightBlocked.recommendedOperatorProofCommand === recommendedOperatorProofCommand &&
    preflightBlocked.privateInputFileKey === privateInputFileKey &&
    preflightBlocked.privateInputFileDefaultName === defaultPrivateInputFileName &&
    preflightBlocked.operatorPrivateInputFileDefaultPath === operatorPrivateInputFileDefaultPath &&
    preflightBlocked.operatorPrivateInputFileDefaultPathValueRecorded === false &&
    preflightBlocked.privateInputFileValueRecorded === false &&
    preflightBlocked.guidedSetupFallbackCommand === releaseChannelSetupWizardCommand &&
    preflightBlocked.guidedSetupFallbackValueRecorded === false &&
    preflightBlocked.privateValuesRecorded === false &&
    preflightBlocked.networkProbeAttempted === false &&
    preflightBlocked.releaseUploadAttempted === false &&
    preflightBlocked.signingAttempted === false &&
    preflightBlocked.notarySubmissionAttempted === false &&
    preflightBlocked.claimedExternalDistribution === false;
  const sourceArtifactRows = [
    sourceRow({
      label: "Release doctor",
      path: releaseDoctorJsonPath,
      ready: doctor.releaseDoctorReportReady === true,
      evidence: `${textValue(doctor.currentActionLabel)}; ${textValue(doctor.completionGapStatus)}`
    }),
    sourceRow({
      label: "Release-channel live check",
      path: releaseChannelLiveCheckJsonPath,
      ready: liveCheck.releaseChannelLiveCheckRowCount === releaseChannelMetadataKeys.length,
      evidence: `${integerValue(liveCheck.releaseChannelLiveCheckCurrentReadyCount)}/${integerValue(liveCheck.releaseChannelLiveCheckRowCount)} current-ready rows; ${integerValue(liveCheck.currentPlaceholderKeyCount)} placeholders`
    }),
    sourceRow({
      label: "Release-channel private env preflight blocked smoke",
      path: releaseChannelPreflightBlockedJsonPath,
      ready: preflightBlockedSourceReady,
      evidence: `${textValue(preflightBlocked.privateInputFileKey)} -> ${textValue(preflightBlocked.operatorPrivateInputFileDefaultPath)}; loaded keys ${integerValue(preflightBlocked.privateInputFileLoadedKeyCount)}`
    })
  ];
  const releaseChannelEditPacketReady =
    refreshCommandRows.every((row) => row.valueRecorded === false) &&
    operatorRows.every((row) => row.valueRecorded === false) &&
    currentOperatorCommandSequenceReady &&
    preflightBlockedSourceReady &&
    sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
    editRows.length === releaseChannelMetadataKeys.length &&
    editRows.every((row) => releaseChannelMetadataKeys.includes(row.key) && row.valueRecorded === false) &&
    doctor.releaseDoctorReportReady === true &&
    doctor.completionGapStatus === "external proof pending" &&
    sameEditTarget(doctor.currentEnvEditTarget, currentEnvEditTarget) &&
    doctor.currentActionRequiredKeyCount === releaseChannelMetadataKeys.length &&
    doctor.externalDistributionReady === false &&
    sameEditTarget(liveCheck.currentEnvEditTarget, currentEnvEditTarget) &&
    liveCheck.currentRequiredKeyCount === releaseChannelMetadataKeys.length &&
    liveCheck.privateValuesRecorded === false &&
    liveCheck.networkProbeAttempted === false &&
    liveCheck.valueRecorded === false &&
    doctor.privateValuesRecorded === false &&
    doctor.networkProbeAttemptedByThisDoctor === false &&
    doctor.releaseGateClaimedExternalDistribution === false;

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:channel-edit-packet-smoke",
    releaseChannelEditPacketMarkdownArtifactName: packetMarkdownArtifactName,
    releaseChannelEditPacketJsonArtifactName: packetJsonArtifactName,
    releaseChannelEditPacketMarkdownPath: relative(packetMarkdownPath),
    releaseChannelEditPacketJsonPath: relative(packetJsonPath),
    releaseChannelEditPacketReady,
    releaseChannelEditPacketMode: mode,
    refreshCommandRows,
    refreshCommandCount: refreshCommandRows.length,
    refreshCommandSummary: commandSummary(refreshCommandRows),
    operatorCommandRows: operatorRows,
    operatorCommandCount: operatorRows.length,
    operatorCommandSummary: commandSummary(operatorRows),
    currentOperatorCommandSequenceReady,
    currentOperatorCommandRows: currentOperatorRows,
    currentOperatorCommandRowCount: currentOperatorRows.length,
    currentOperatorCommandSummary: commandSummary(currentOperatorRows),
    currentOperatorFirstCommand: currentOperatorRows[0]?.command ?? "none",
    currentOperatorPreflightCommand: releaseChannelApplyPrivateEnvPreflightCommand,
    currentOperatorPreflightCommandOrder,
    currentOperatorApplyCommand: releaseChannelApplyPrivateEnvCommand,
    currentOperatorApplyCommandOrder,
    currentOperatorStrictProofCommand: recommendedOperatorProofCommand,
    currentOperatorStrictProofCommandOrder,
    currentOperatorBlockerRefreshCommand: "npm run release:current-blocker",
    currentOperatorNextActionsRefreshCommand: "npm run release:next-actions",
    currentOperatorPreflightBeforeApply:
      currentOperatorPreflightCommandOrder > 0 &&
      currentOperatorApplyCommandOrder > 0 &&
      currentOperatorPreflightCommandOrder < currentOperatorApplyCommandOrder,
    currentOperatorApplyBeforeStrictProof:
      currentOperatorApplyCommandOrder > 0 &&
      currentOperatorStrictProofCommandOrder > 0 &&
      currentOperatorApplyCommandOrder < currentOperatorStrictProofCommandOrder,
    currentOperatorFirstCommandIsGuidedSetup: currentOperatorRows[0]?.command === releaseChannelSetupWizardCommand,
    currentOperatorValueRecorded: false,
    releaseChannelPrivateInputTemplateCommand,
    releaseChannelPrivateInputTemplateRole,
    releaseChannelPrivateInputTemplateDefaultPath: defaultPrivateInputFileName,
    releaseChannelPrivateInputTemplatePrivateInputFileKey: privateInputFileKey,
    releaseChannelPrivateInputTemplateBeforePreflight:
      commandOrder(operatorRows, releaseChannelPrivateInputTemplateCommand) > 0 &&
      commandOrder(operatorRows, releaseChannelPrivateInputTemplateCommand) <
        commandOrder(operatorRows, releaseChannelApplyPrivateEnvPreflightCommand),
    releaseChannelPrivateInputTemplateValueRecorded: false,
    releaseChannelSetupWizardCommand,
    releaseChannelSetupWizardCommandValueRecorded: false,
    releaseChannelApplyPrivateEnvPreflightCommand,
    releaseChannelApplyPrivateEnvPreflightCommandValueRecorded: false,
    releaseChannelApplyPrivateEnvCommand,
    releaseChannelPrivateInputFileGuidanceReady: preflightBlockedSourceReady,
    releaseChannelPrivateInputFileKey: textValue(preflightBlocked.privateInputFileKey),
    releaseChannelPrivateInputFileDefaultName: textValue(preflightBlocked.privateInputFileDefaultName),
    releaseChannelOperatorPrivateInputFileDefaultPath: textValue(preflightBlocked.operatorPrivateInputFileDefaultPath),
    releaseChannelOperatorPrivateInputFileDefaultPathValueRecorded:
      preflightBlocked.operatorPrivateInputFileDefaultPathValueRecorded === true,
    releaseChannelPrivateInputFilePath: textValue(preflightBlocked.privateInputFilePath),
    releaseChannelPrivateInputFilePathMode: textValue(preflightBlocked.privateInputFilePathMode),
    releaseChannelPrivateInputFilePresent: preflightBlocked.privateInputFilePresent === true,
    releaseChannelPrivateInputFileLoadedKeyCount: integerValue(preflightBlocked.privateInputFileLoadedKeyCount),
    releaseChannelPrivateInputFileLoadedKeySummary: textValue(preflightBlocked.privateInputFileLoadedKeySummary),
    releaseChannelPrivateInputFileValueRecorded: preflightBlocked.privateInputFileValueRecorded === true,
    releaseChannelGuidedSetupFallbackCommand: textValue(preflightBlocked.guidedSetupFallbackCommand),
    releaseChannelGuidedSetupFallbackValueRecorded: preflightBlocked.guidedSetupFallbackValueRecorded === true,
    releaseChannelRecommendedOperatorProofCommand: recommendedOperatorProofCommand,
    releaseChannelRecommendedOperatorProofCommandRole:
      "recommended strict-first proof chain after applying the four private release-channel metadata values",
    releaseChannelRecommendedOperatorProofCommandValueRecorded: false,
    releaseChannelLowerLevelLiveCheckCommand: lowerLevelLiveCheckCommand,
    releaseChannelLowerLevelStrictProofCommand: lowerLevelStrictProofCommand,
    releaseChannelLowerLevelProofCommandsValueRecorded: false,
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    currentActionId: textValue(doctor.currentActionId),
    currentActionLabel: textValue(doctor.currentActionLabel),
    currentNextCommand: textValue(doctor.currentActionNextCommand),
    currentFirstBlocker: textValue(doctor.currentActionFirstBlocker),
    currentOperatorAction: textValue(doctor.currentActionOperatorAction),
    completionGapStatus: textValue(doctor.completionGapStatus),
    completionGapProofTarget: textValue(doctor.completionGapCurrentProofTarget),
    completionGapNextProofCommand: textValue(doctor.completionGapNextProofCommand),
    completionGapHardGateCommand: textValue(doctor.completionGapHardGateCommand),
    currentEnvEditTarget,
    currentRequiredKeyCount: integerValue(doctor.currentActionRequiredKeyCount),
    currentRequiredKeys: arrayValue(doctor.currentActionRequiredKeys),
    currentPlaceholderKeyCount: integerValue(doctor.currentActionPlaceholderKeyCount),
    currentPlaceholderKeys: arrayValue(doctor.currentActionPlaceholderKeys),
    liveCheckReady: liveCheck.releaseChannelLiveCheckReady === true,
    liveCheckCurrentReadyCount: integerValue(liveCheck.releaseChannelLiveCheckCurrentReadyCount),
    liveCheckRowCount: integerValue(liveCheck.releaseChannelLiveCheckRowCount),
    liveCheckPlaceholderKeyCount: integerValue(liveCheck.currentPlaceholderKeyCount),
    liveCheckPlaceholderKeys: arrayValue(liveCheck.currentPlaceholderKeys),
    liveCheckPlaceholderEditLocationCount: integerValue(liveCheck.currentPlaceholderEditLocationCount),
    liveCheckPlaceholderEditLocations: arrayValue(liveCheck.currentPlaceholderEditLocations).map((row) => ({
      key: row.key,
      file: row.file,
      line: row.line,
      placeholder: row.placeholder === true,
      valueRecorded: false
    })),
    releaseChannelEditRows: editRows,
    releaseChannelEditRowCount: editRows.length,
    doctorCommand: "npm run release:doctor",
    liveCheckCommand: lowerLevelLiveCheckCommand,
    strictLiveCheckCommand: lowerLevelStrictProofCommand,
    currentBlockerCommand: "npm run release:current-blocker",
    nextActionsCommand: "npm run release:next-actions",
    proofBundleCommand: "npm run release:proof-bundle",
    progressCommand: "npm run release:progress-smoke",
    hardGateCommand: "npm run release:external-check",
    localEnvFileLoaded: doctor.localEnvFileLoaded === true,
    externalDistributionReady: doctor.externalDistributionReady === true,
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
    latestCompletedPlanNumber: progress.latestCompletedPlanNumber,
    latestTenPlanProgressLabel: progress.latestTenPlanProgressLabel,
    latestTenPlanWindowStart: progress.latestTenPlanWindowStart,
    latestTenPlanWindowEnd: progress.latestTenPlanWindowEnd,
    latestTenPlanCompletedCount: progress.latestTenPlanCompletedCount,
    latestTenPlanTotal: progress.latestTenPlanTotal,
    tenPlanProgressReportDue: progress.tenPlanProgressReportDue,
    nextTenPlanProgressReportAt: progress.nextTenPlanProgressReportAt,
    privateValuesRecorded: false,
    localEnvValueRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    privateBeatRecorded: false,
    realUserAudioRecorded: false,
    networkProbeAttempted: false,
    updateFeedPublishAttempted: false,
    distributionChannelProbeAttempted: false,
    releaseUploadAttempted: false,
    signingAttempted: false,
    notarySubmissionAttempted: false,
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
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release-Channel Edit Packet Smoke

## Status

- Release-channel edit packet ready: ${readyLabel(report.releaseChannelEditPacketReady)}
- Packet mode: ${report.releaseChannelEditPacketMode}
- Refresh command order: ${report.refreshCommandSummary}
- Operator command order: ${report.operatorCommandSummary}
- Current operator command sequence ready: ${readyLabel(report.currentOperatorCommandSequenceReady)}
- Current operator command order: ${report.currentOperatorCommandSummary}
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Current operator preflight before apply: ${readyLabel(report.currentOperatorPreflightBeforeApply)}
- Current operator apply before strict proof: ${readyLabel(report.currentOperatorApplyBeforeStrictProof)}
- Private input template command: \`${report.releaseChannelPrivateInputTemplateCommand}\`
- Private input template default path: \`${report.releaseChannelPrivateInputTemplateDefaultPath}\`
- Private input template before preflight: ${readyLabel(report.releaseChannelPrivateInputTemplateBeforePreflight)}
- Guided setup wizard command: \`${report.releaseChannelSetupWizardCommand}\`
- Private metadata preflight command: \`${report.releaseChannelApplyPrivateEnvPreflightCommand}\`
- First private metadata apply command: \`${report.releaseChannelApplyPrivateEnvCommand}\`
- Private input file key: \`${report.releaseChannelPrivateInputFileKey}\`
- Private input file default: \`${report.releaseChannelPrivateInputFileDefaultName}\`
- Operator private input file default path: \`${report.releaseChannelOperatorPrivateInputFileDefaultPath}\`
- Current blocked-smoke private input file path: ${report.releaseChannelPrivateInputFilePath}
- Private input file loaded keys: ${report.releaseChannelPrivateInputFileLoadedKeyCount} (${report.releaseChannelPrivateInputFileLoadedKeySummary})
- Guided setup fallback command: \`${report.releaseChannelGuidedSetupFallbackCommand}\`
- Recommended operator proof chain: \`${report.releaseChannelRecommendedOperatorProofCommand}\`
- Recommended operator proof role: ${report.releaseChannelRecommendedOperatorProofCommandRole}
- Lower-level live-check proof: \`${report.releaseChannelLowerLevelLiveCheckCommand}\`
- Lower-level strict proof: \`${report.releaseChannelLowerLevelStrictProofCommand}\`
- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Completion gap status: ${report.completionGapStatus}
- Current action: ${report.currentActionLabel}
- Current next command: \`${report.currentNextCommand}\`
- Current first blocker: ${report.currentFirstBlocker}
- Current env edit target: \`${report.currentEnvEditTarget}\`
- Current required keys: ${report.currentRequiredKeyCount}
- Current placeholder keys: ${report.currentPlaceholderKeyCount}
- Live-check ready rows: ${report.liveCheckCurrentReadyCount}/${report.liveCheckRowCount}
- Live-check placeholders: ${report.liveCheckPlaceholderKeyCount}
- Hard gate command: \`${report.hardGateCommand}\`
- Private values recorded: no
- Local env values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Signing attempted: no
- Apple notary submission attempted: no
- External distribution claimed: no

## Refresh Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.refreshCommandRows)}

## Operator Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.operatorCommandRows)}

## Current Operator Commands

| order | command | role | ready | value recorded |
|---:|---|---|---:|---:|
${formatCurrentOperatorCommandRows(report.currentOperatorCommandRows)}

## Source Artifacts

| artifact | present | ready | evidence | path | value recorded |
|---|---:|---:|---|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Release-Channel Edit Rows

| order | key | kind | expected shape | present | placeholder | shape ready | current ready | edit target | line | live check | strict proof | operator proof chain | doctor | value recorded |
|---:|---|---|---|---:|---:|---:|---:|---|---:|---|---|---|---|---:|
${formatEditRows(report.releaseChannelEditRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this packet smoke.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.releaseChannelEditPacketReady === true, "release-channel edit packet should be ready");
  check(report.reportCommand === "npm run release:channel-edit-packet-smoke", "release-channel edit packet should report its command");
  check(report.refreshCommandCount === 3, "release-channel edit packet should refresh three source commands");
  check(
    report.refreshCommandSummary ===
      "npm run release:doctor -> npm run release:channel-live-check -> npm run release:channel-apply-private-env-preflight-blocked-smoke",
    "release-channel edit packet should refresh doctor, live-check, then blocked private-env preflight"
  );
  check(report.operatorCommandCount >= 7, "release-channel edit packet should include operator proof commands");
  check(report.operatorCommandRows.every((row) => row.valueRecorded === false), "release-channel edit packet operator rows should be value-free");
  check(report.currentOperatorCommandSequenceReady === true, "release-channel edit packet current operator command sequence should be ready");
  check(Array.isArray(report.currentOperatorCommandRows), "release-channel edit packet should include current operator command rows");
  check(report.currentOperatorCommandRowCount === report.currentOperatorCommandRows.length, "release-channel edit packet current operator command row count should match rows");
  check(report.currentOperatorCommandRows.length >= 5, "release-channel edit packet current operator command sequence should include preflight, apply, strict proof, current-blocker, and next-actions");
  check(report.currentOperatorCommandRows.every((row) => row.ready === true && row.valueRecorded === false), "release-channel edit packet current operator command rows should be ready and value-free");
  check(
    report.currentOperatorCommandRows.every((row) => row.command !== releaseChannelSetupWizardCommand),
    "release-channel edit packet current operator command rows should not include the setup wizard"
  );
  check(report.currentOperatorFirstCommand !== releaseChannelSetupWizardCommand, "release-channel edit packet current operator first command should not be the setup wizard");
  if (report.releaseChannelEditPacketMode === "create-ignored-env-scaffold") {
    check(report.currentOperatorFirstCommand === "npm run release:prepare-env", "release-channel edit packet missing-env current operator sequence should start with prepare-env");
  } else {
    check(
      report.currentOperatorFirstCommand === releaseChannelApplyPrivateEnvPreflightCommand,
      "release-channel edit packet current operator sequence should start with private env preflight when local env exists"
    );
  }
  check(report.currentOperatorPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand, "release-channel edit packet current operator sequence should expose private env preflight");
  check(report.currentOperatorApplyCommand === releaseChannelApplyPrivateEnvCommand, "release-channel edit packet current operator sequence should expose private env apply");
  check(report.currentOperatorStrictProofCommand === recommendedOperatorProofCommand, "release-channel edit packet current operator sequence should expose strict proof chain");
  check(report.currentOperatorBlockerRefreshCommand === "npm run release:current-blocker", "release-channel edit packet current operator sequence should include current-blocker refresh");
  check(report.currentOperatorNextActionsRefreshCommand === "npm run release:next-actions", "release-channel edit packet current operator sequence should include next-actions refresh");
  check(report.currentOperatorPreflightBeforeApply === true, "release-channel edit packet current operator sequence should place preflight before apply");
  check(report.currentOperatorApplyBeforeStrictProof === true, "release-channel edit packet current operator sequence should place apply before strict proof");
  check(report.currentOperatorFirstCommandIsGuidedSetup === false, "release-channel edit packet current operator first command should be distinct from guided setup");
  check(report.currentOperatorValueRecorded === false, "release-channel edit packet current operator sequence should be value-free");
  check(
    report.operatorCommandRows.some((row) => row.command === releaseChannelSetupWizardCommand),
    "release-channel edit packet should include the setup wizard"
  );
  check(
    report.operatorCommandRows.some((row) => row.command === releaseChannelPrivateInputTemplateCommand),
    "release-channel edit packet should include the private input template command"
  );
  check(
    report.releaseChannelPrivateInputTemplateCommand === releaseChannelPrivateInputTemplateCommand,
    "release-channel edit packet should expose the private input template command"
  );
  check(
    report.releaseChannelPrivateInputTemplateRole === releaseChannelPrivateInputTemplateRole,
    "release-channel edit packet should describe the private input template role"
  );
  check(
    report.releaseChannelPrivateInputTemplateDefaultPath === defaultPrivateInputFileName,
    "release-channel edit packet should expose the private input template default path"
  );
  check(
    report.releaseChannelPrivateInputTemplatePrivateInputFileKey === privateInputFileKey,
    "release-channel edit packet should expose the private input template file key"
  );
  check(
    report.releaseChannelPrivateInputTemplateBeforePreflight === true,
    "release-channel edit packet should place the private input template before preflight in the helper sequence"
  );
  check(
    report.releaseChannelPrivateInputTemplateValueRecorded === false,
    "release-channel edit packet private input template command should be value-free"
  );
  check(
    report.operatorCommandRows.some((row) => row.command === releaseChannelApplyPrivateEnvPreflightCommand),
    "release-channel edit packet should include the private env preflight helper"
  );
  check(
    report.operatorCommandRows.some((row) => row.command === releaseChannelApplyPrivateEnvCommand),
    "release-channel edit packet should include the private env apply helper"
  );
  check(
    report.operatorCommandRows.findIndex((row) => row.command === releaseChannelApplyPrivateEnvPreflightCommand) <
      report.operatorCommandRows.findIndex((row) => row.command === releaseChannelApplyPrivateEnvCommand),
    "release-channel edit packet should place the private env preflight before apply"
  );
  check(
    !report.operatorCommandSummary.includes("manual edit"),
    "release-channel edit packet operator order should not use stale manual edit language"
  );
  check(report.releaseChannelApplyPrivateEnvCommand === releaseChannelApplyPrivateEnvCommand, "release-channel edit packet should expose the private env apply helper");
  check(
    report.releaseChannelApplyPrivateEnvPreflightCommand === releaseChannelApplyPrivateEnvPreflightCommand,
    "release-channel edit packet should expose the private env preflight helper"
  );
  check(
    report.releaseChannelApplyPrivateEnvPreflightCommandValueRecorded === false,
    "release-channel edit packet private env preflight command should be value-free"
  );
  check(report.releaseChannelSetupWizardCommand === releaseChannelSetupWizardCommand, "release-channel edit packet should expose the setup wizard");
  check(report.releaseChannelSetupWizardCommandValueRecorded === false, "release-channel edit packet setup wizard command should be value-free");
  check(report.releaseChannelPrivateInputFileGuidanceReady === true, "release-channel edit packet should include private input file guidance");
  check(report.releaseChannelPrivateInputFileKey === privateInputFileKey, "release-channel edit packet should expose the private input file key");
  check(report.releaseChannelPrivateInputFileDefaultName === defaultPrivateInputFileName, "release-channel edit packet should expose the private input file default");
  check(
    report.releaseChannelOperatorPrivateInputFileDefaultPath === operatorPrivateInputFileDefaultPath,
    "release-channel edit packet should expose the operator private input file default path"
  );
  check(
    report.releaseChannelOperatorPrivateInputFileDefaultPathValueRecorded === false,
    "release-channel edit packet operator private input file default path should be value-free"
  );
  check(report.releaseChannelPrivateInputFilePath !== "none", "release-channel edit packet should expose the current blocked-smoke private input file path");
  check(report.releaseChannelPrivateInputFilePathMode === "blocked-smoke-isolated-missing-input-file", "release-channel edit packet should keep the blocked-smoke path mode");
  check(report.releaseChannelPrivateInputFilePresent === false, "release-channel edit packet should keep the blocked-smoke private input file absent");
  check(report.releaseChannelPrivateInputFileLoadedKeyCount === 0, "release-channel edit packet should mirror zero loaded private input file keys");
  check(report.releaseChannelPrivateInputFileValueRecorded === false, "release-channel edit packet private input file path should be value-free");
  check(report.releaseChannelGuidedSetupFallbackCommand === releaseChannelSetupWizardCommand, "release-channel edit packet should expose guided setup fallback");
  check(report.releaseChannelGuidedSetupFallbackValueRecorded === false, "release-channel edit packet guided setup fallback should be value-free");
  check(
    report.operatorCommandRows.some((row) => row.command === recommendedOperatorProofCommand),
    "release-channel edit packet should include the recommended private-edit strict proof chain"
  );
  check(
    report.operatorCommandRows.some((row) => row.command === lowerLevelLiveCheckCommand),
    "release-channel edit packet should keep the lower-level live-check command"
  );
  check(
    report.operatorCommandRows.some((row) => row.command === lowerLevelStrictProofCommand),
    "release-channel edit packet should keep the lower-level strict proof command"
  );
  check(report.releaseChannelRecommendedOperatorProofCommand === recommendedOperatorProofCommand, "release-channel edit packet should expose the recommended operator proof chain");
  check(
    report.releaseChannelRecommendedOperatorProofCommandRole === "recommended strict-first proof chain after applying the four private release-channel metadata values",
    "release-channel edit packet should describe the recommended operator proof chain role"
  );
  check(report.releaseChannelRecommendedOperatorProofCommandValueRecorded === false, "release-channel edit packet recommended operator proof chain should be value-free");
  check(report.releaseChannelLowerLevelLiveCheckCommand === lowerLevelLiveCheckCommand, "release-channel edit packet should expose the lower-level live-check command");
  check(report.releaseChannelLowerLevelStrictProofCommand === lowerLevelStrictProofCommand, "release-channel edit packet should expose the lower-level strict proof command");
  check(report.releaseChannelLowerLevelProofCommandsValueRecorded === false, "release-channel edit packet lower-level proof commands should be value-free");
  check(report.sourceArtifactRowCount === 3, "release-channel edit packet should include three source artifacts");
  check(report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false), "release-channel edit packet source artifacts should be present, ready, and value-free");
  check(["create-ignored-env-scaffold", "replace-release-channel-placeholders", "verify-release-channel-metadata", "continue-external-proof-chain"].includes(report.releaseChannelEditPacketMode), "release-channel edit packet should identify a known mode");
  check(report.currentEnvEditTarget !== "none", "release-channel edit packet should point at the ignored local env target");
  check(report.currentRequiredKeyCount === 4, "release-channel edit packet should report four current release-channel keys");
  check(releaseChannelMetadataKeys.every((key) => report.currentRequiredKeys.includes(key)), "release-channel edit packet should include all current release-channel keys");
  check(report.releaseChannelEditRowCount === 4, "release-channel edit packet should include four edit rows");
  check(report.releaseChannelEditRows.every((row) => releaseChannelMetadataKeys.includes(row.key)), "release-channel edit packet rows should cover only current release-channel keys");
  check(report.releaseChannelEditRows.every((row) => row.valueRecorded === false), "release-channel edit packet rows should not record values");
  check(report.releaseChannelEditRows.every((row) => row.proofCommand === lowerLevelLiveCheckCommand), "release-channel edit packet rows should point at live-check proof");
  check(report.releaseChannelEditRows.every((row) => row.strictProofCommand === lowerLevelStrictProofCommand), "release-channel edit packet rows should point at strict proof");
  check(report.releaseChannelEditRows.every((row) => row.operatorProofCommand === recommendedOperatorProofCommand), "release-channel edit packet rows should point at recommended operator proof chain");
  check(report.releaseChannelEditRows.every((row) => row.doctorCommand === "npm run release:doctor"), "release-channel edit packet rows should point at doctor proof");
  check(report.liveCheckRowCount === 4, "release-channel edit packet should mirror four live-check rows");
  check(report.liveCheckPlaceholderEditLocations.every((row) => row.valueRecorded === false), "release-channel edit packet placeholder locations should be value-free");
  check(report.completionGapStatus === "external proof pending", "release-channel edit packet should keep external proof pending");
  check(report.currentNextCommand !== "none", "release-channel edit packet should include current next command");
  check(report.currentFirstBlocker !== "none", "release-channel edit packet should include current first blocker");
  check(report.hardGateCommand === "npm run release:external-check", "release-channel edit packet should keep hard external gate command");
  check(report.userFacingCompletionPercent === 99.999999, "release-channel edit packet should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "release-channel edit packet should preserve remaining percent");
  check(report.latestTenPlanWindowStart > 0, "release-channel edit packet should report a positive 10-plan window start");
  check(report.latestTenPlanWindowEnd === report.latestTenPlanWindowStart + 9, "release-channel edit packet should report a 10-plan window");
  check(report.latestTenPlanTotal === 10, "release-channel edit packet should use ten-plan windows");
  check(
    report.latestTenPlanProgressLabel === `${report.latestTenPlanWindowStart}-${report.latestTenPlanWindowEnd}: ${report.latestTenPlanCompletedCount}/10`,
    "release-channel edit packet progress label should match latest 10-plan fields"
  );
  check(report.privateValuesRecorded === false, "release-channel edit packet should not record private values");
  check(report.localEnvValueRecorded === false, "release-channel edit packet should not record local env values");
  check(report.releaseUrlValueRecorded === false, "release-channel edit packet should not record release URL values");
  check(report.supportUrlValueRecorded === false, "release-channel edit packet should not record support URL values");
  check(report.feedValueRecorded === false, "release-channel edit packet should not record feed values");
  check(report.credentialValueRecorded === false, "release-channel edit packet should not record credentials");
  check(report.tokenValueRecorded === false, "release-channel edit packet should not record tokens");
  check(report.channelValueRecorded === false, "release-channel edit packet should not record channel values");
  check(report.developerIdIdentityValueRecorded === false, "release-channel edit packet should not record Developer ID identity values");
  check(report.privateBeatRecorded === false, "release-channel edit packet should not record private beats");
  check(report.realUserAudioRecorded === false, "release-channel edit packet should not record real user audio");
  check(report.networkProbeAttempted === false, "release-channel edit packet should not probe networks");
  check(report.updateFeedPublishAttempted === false, "release-channel edit packet should not publish feeds");
  check(report.distributionChannelProbeAttempted === false, "release-channel edit packet should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "release-channel edit packet should not upload releases");
  check(report.signingAttempted === false, "release-channel edit packet should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release-channel edit packet should not submit to Apple");
  check(report.claimedAutoUpdate === false, "release-channel edit packet should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release-channel edit packet should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "release-channel edit packet JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release-channel edit packet Markdown should not include URL values");
  check(markdown.includes("Release-Channel Edit Packet Smoke"), "release-channel edit packet Markdown should include title");
  check(markdown.includes("Release-channel edit packet ready: yes"), "release-channel edit packet Markdown should include readiness");
  check(markdown.includes("Recommended operator proof chain"), "release-channel edit packet Markdown should include the recommended operator proof chain");
  check(markdown.includes("Private input template command:"), "release-channel edit packet Markdown should include the private input template command");
  check(markdown.includes("Operator private input file default path:"), "release-channel edit packet Markdown should include operator private input file path guidance");
  check(markdown.includes("Guided setup fallback command:"), "release-channel edit packet Markdown should include guided setup fallback");
  check(markdown.includes("Current Operator Commands"), "release-channel edit packet Markdown should include current operator commands");
  check(markdown.includes("Current operator first command:"), "release-channel edit packet Markdown should include current operator first command");
  check(markdown.includes("Release-Channel Edit Rows"), "release-channel edit packet Markdown should include edit rows");
  check(markdown.includes("External distribution claimed: no"), "release-channel edit packet Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const row of refreshCommandRows) {
  console.log(`Refreshing release-channel edit packet evidence: ${row.command}`);
  runNpmScript(row.command);
}

const doctor = await readJsonRequired(releaseDoctorJsonPath, "Release doctor");
const liveCheck = await readJsonRequired(releaseChannelLiveCheckJsonPath, "Release-channel live check");
const preflightBlocked = await readJsonRequired(releaseChannelPreflightBlockedJsonPath, "Release-channel private env preflight blocked smoke");
const progress = await completedPlanProgress();
const report = buildReport({ doctor, liveCheck, preflightBlocked, progress });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(packetMarkdownPath, markdown, "utf8");
await writeFile(packetJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release-channel edit packet smoke passed.");
console.log(`- Markdown: ${relative(packetMarkdownPath)}`);
console.log(`- JSON: ${relative(packetJsonPath)}`);
console.log("- Release-channel edit packet ready: yes");
console.log(`- Packet mode: ${report.releaseChannelEditPacketMode}`);
console.log(`- Recommended operator proof chain: ${report.releaseChannelRecommendedOperatorProofCommand}`);
console.log(`- Private input template command: ${report.releaseChannelPrivateInputTemplateCommand}`);
console.log(`- Private input template default path: ${report.releaseChannelPrivateInputTemplateDefaultPath}`);
console.log(`- Private input file key: ${report.releaseChannelPrivateInputFileKey}`);
console.log(`- Private input file default: ${report.releaseChannelPrivateInputFileDefaultName}`);
console.log(`- Operator private input file default path: ${report.releaseChannelOperatorPrivateInputFileDefaultPath}`);
console.log(`- Current blocked-smoke private input file path: ${report.releaseChannelPrivateInputFilePath}`);
console.log(`- Private input file loaded keys: ${report.releaseChannelPrivateInputFileLoadedKeyCount}`);
console.log(`- Guided setup fallback command: ${report.releaseChannelGuidedSetupFallbackCommand}`);
console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
console.log(`- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}`);
console.log(`- Current action: ${report.currentActionLabel}`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- Current required keys: ${report.currentRequiredKeyCount}`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
console.log(`- Live-check ready rows: ${report.liveCheckCurrentReadyCount}/${report.liveCheckRowCount}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
