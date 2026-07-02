#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const successSmoke = process.argv.includes("--success-smoke");
const blockedSmoke = process.argv.includes("--blocked-smoke");
if (successSmoke && blockedSmoke) {
  console.error("GrooveForge release private edit strict proof failed:");
  console.error("- Use either --success-smoke or --blocked-smoke, not both.");
  process.exit(1);
}
const modeLabel = successSmoke ? " success smoke" : blockedSmoke ? " blocked smoke" : "";
const reportStem = successSmoke
  ? "release-private-edit-strict-proof-success-smoke"
  : blockedSmoke
    ? "release-private-edit-strict-proof-blocked-smoke"
    : "release-private-edit-strict-proof";
const strictProofMarkdownArtifactName = "release-private-edit-strict-proof.md";
const strictProofJsonArtifactName = "release-private-edit-strict-proof.json";
const strictProofSuccessMarkdownArtifactName = "release-private-edit-strict-proof-success-smoke.md";
const strictProofSuccessJsonArtifactName = "release-private-edit-strict-proof-success-smoke.json";
const strictProofBlockedMarkdownArtifactName = "release-private-edit-strict-proof-blocked-smoke.md";
const strictProofBlockedJsonArtifactName = "release-private-edit-strict-proof-blocked-smoke.json";
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const strictLiveCheckReportStem = successSmoke
  ? "release-channel-live-check-strict-success-smoke"
  : blockedSmoke
    ? "release-channel-live-check-strict-blocked-smoke"
    : "release-channel-live-check-strict";
const strictJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${strictLiveCheckReportStem}.json`
);
const postEditJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${successSmoke ? "release-post-edit-proof-success-smoke" : "release-post-edit-proof"}.json`
);
const progressRefreshJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-progress-refresh-smoke.json`
);
const privateValueLeakAuditJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${successSmoke ? "release-private-value-leak-audit-success-smoke" : "release-private-value-leak-audit"}.json`
);
const currentBlockerJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.json`
);
const blockedSmokeEnvRoot = path.join(packageRoot, "release-private-edit-strict-proof-blocked-smoke-env");
const blockedLiveCheckReportStem = "release-channel-live-check-strict-blocked-smoke";
const distributionLocalEnvFileName = ".env.distribution.local";
const failures = [];
const planNumberPattern = /^plan-(\d+)-[a-z0-9][a-z0-9-]*\.md$/;
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function stringArrayValue(values) {
  return Array.isArray(values) ? values.filter((value) => typeof value === "string" && value.trim().length > 0) : [];
}

function objectRows(values) {
  return Array.isArray(values) ? values.filter((value) => value && typeof value === "object" && !Array.isArray(value)) : [];
}

function runNpmScript(scriptName, { allowFailure = false, envOverrides = {}, deleteEnvKeys = [] } = {}) {
  const command = `npm run ${scriptName}`;
  console.log(`Running release private edit strict proof step: ${command}`);
  const childEnv = { ...process.env, ...envOverrides };
  for (const key of deleteEnvKeys) {
    delete childEnv[key];
  }
  const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", scriptName], {
    cwd: root,
    env: childEnv,
    stdio: "inherit"
  });
  if (result.error) {
    throw new Error(`Could not run ${command}: ${result.error.message}`);
  }
  if (!allowFailure && result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}.`);
  }
  return {
    command,
    status: Number.isInteger(result.status) ? result.status : 1,
    success: result.status === 0
  };
}

async function writeBlockedSmokeEnvFixture() {
  await mkdir(blockedSmokeEnvRoot, { recursive: true });
  const envText = `${releaseChannelMetadataKeys.map((key) => `${key}=CHANGE_ME`).join("\n")}\n`;
  await writeFile(path.join(blockedSmokeEnvRoot, distributionLocalEnvFileName), envText, "utf8");
  return relative(blockedSmokeEnvRoot);
}

async function readJsonIfPresent(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function currentTenPlanProgressLabel() {
  const completedPlansDir = path.join(root, "docs", "exec_plans", "completed");
  const entries = await readdir(completedPlansDir, { withFileTypes: true });
  const completedPlanNumbers = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name.match(planNumberPattern))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter((number) => Number.isInteger(number));
  const highestPlanNumber = Math.max(...completedPlanNumbers, 0);
  const windowStart = Math.floor((highestPlanNumber - 1) / 10) * 10 + 1;
  const windowEnd = windowStart + 9;
  const completedInWindow = completedPlanNumbers.filter((number) => number >= windowStart && number <= windowEnd).length;
  return `${windowStart}-${windowEnd}: ${completedInWindow}/10`;
}

function sourceRow(label, filePath, present, synthetic = false) {
  return {
    label,
    synthetic,
    present,
    path: present ? relative(filePath) : relative(filePath),
    valueRecorded: false
  };
}

function formatCommandRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${escapeCell(row.statusLabel)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatFailureRows(rows) {
  if (rows.length === 0) {
    return "| none | yes | no | yes | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.key)} | ${row.present ? "yes" : "no"} | ${row.placeholder ? "yes" : "no"} | ${row.shapeReady ? "yes" : "no"} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "none")} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatBlockedHandoffRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.blocker)} | ${escapeCell(row.editTarget)} | ${row.placeholderKeyCount} | ${row.strictFailureRowCount} | ${escapeCell(row.manualAction)} | \`${escapeCell(row.returnCommand)}\` | \`${escapeCell(row.firstProofCommand)}\` | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${row.synthetic ? "yes" : "no"} | ${row.present ? "yes" : "no"} | ${escapeCell(row.path)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function buildReport({
  strictResult,
  postEditResult,
  progressResult,
  privateValueLeakAuditResult,
  strictLiveCheck,
  postEditProof,
  progressRefresh,
  privateValueLeakAudit,
  currentBlocker,
  fallbackTenPlanProgressLabel
}) {
  const strictReady = strictLiveCheck?.strictReady === true;
  const strictExitCode = Number.isInteger(strictLiveCheck?.strictExitCode)
    ? strictLiveCheck.strictExitCode
    : strictResult.status;
  const strictFailureRows = objectRows(strictLiveCheck?.strictFailureRows).map((row) => ({
    key: textValue(row.key),
    present: row.present === true,
    placeholder: row.placeholder === true,
    shapeReady: row.shapeReady === true,
    expectedShape: textValue(row.expectedShape),
    editTarget: textValue(row.editTarget, textValue(strictLiveCheck?.currentEnvEditTarget, ".env.distribution.local")),
    line: Number.isInteger(row.line) ? row.line : null,
    proofCommand: "npm run release:channel-live-check-strict",
    valueRecorded: false
  }));
  const postEditReady = postEditProof?.releasePostEditProofReady === true || postEditProof?.releasePostEditProofSuccessSmokeReady === true;
  const progressReady = successSmoke || blockedSmoke ? true : progressRefresh?.refreshSmokeReady === true;
  const privateValueLeakAuditReady = blockedSmoke ? false : privateValueLeakAudit?.releasePrivateValueLeakAuditReady === true;
  const proofReady = strictReady && postEditReady && progressReady && privateValueLeakAuditReady;
  const currentTenPlanProgressLabel =
    successSmoke || blockedSmoke
      ? fallbackTenPlanProgressLabel
      : textValue(
          progressRefresh?.latestTenPlanProgressLabel,
          textValue(currentBlocker?.currentTenPlanProgressLabel, textValue(postEditProof?.currentTenPlanProgressLabel, fallbackTenPlanProgressLabel))
        );
  const strictFailureBlocker = `Strict release-channel proof has ${strictFailureRows.length} missing, placeholder, or malformed metadata rows.`;
  const currentFirstBlocker = proofReady
    ? successSmoke
      ? "Strict release-channel proof succeeded in synthetic rehearsal; broader external proofs remain unclaimed."
      : textValue(currentBlocker?.currentFirstBlocker, "Strict release-channel proof passed; broader external proofs remain unclaimed.")
    : blockedSmoke
      ? strictFailureBlocker
      : textValue(currentBlocker?.currentFirstBlocker, strictFailureBlocker);
  const commandRows = [
    {
      order: 1,
      command: successSmoke
        ? "npm run release:channel-live-check-strict-success-smoke"
        : "npm run release:channel-live-check-strict",
      role: successSmoke
        ? "prove strict release-channel success branch without reading the real local env"
        : blockedSmoke
          ? "prove strict release-channel blocked branch with a synthetic placeholder env without reading the real local env"
          : "pass/fail proof that the four private release-channel keys are present, non-placeholder, and shape-ready",
      statusLabel: strictReady ? "passed" : "failed",
      exitCode: strictExitCode,
      valueRecorded: false
    },
    {
      order: 2,
      command: successSmoke ? "npm run release:post-edit-proof-success-smoke" : "npm run release:post-edit-proof",
      role: successSmoke
        ? "prove post-edit proof success branch with synthetic ready evidence"
        : blockedSmoke
          ? "skipped in blocked smoke because strict proof is expected to fail before post-edit proof"
          : "refresh release-channel live-check and current-blocker evidence after strict proof passes",
      statusLabel: blockedSmoke ? "skipped in blocked smoke" : postEditResult ? (postEditResult.success ? "passed" : "failed") : "not run",
      exitCode: postEditResult?.status ?? null,
      valueRecorded: false
    },
    {
      order: 3,
      command: "npm run release:progress-refresh-smoke",
      role: successSmoke
        ? "real progress refresh is skipped in success smoke to avoid reading private local env state"
        : blockedSmoke
          ? "progress refresh is skipped in blocked smoke because strict proof is expected to fail before post-edit proof"
          : "refresh user-facing completion, current blocker, completion packet, and freshness after strict proof passes",
      statusLabel: successSmoke
        ? "skipped in success smoke"
        : blockedSmoke
          ? "skipped in blocked smoke"
          : progressResult
            ? (progressResult.success ? "passed" : "failed")
            : "not run",
      exitCode: progressResult?.status ?? null,
      valueRecorded: false
    },
    {
      order: 4,
      command: successSmoke ? "npm run release:private-value-leak-audit-smoke" : "npm run release:private-value-leak-audit",
      role: successSmoke
        ? "prove generated release evidence leak-audit success branch without reading the real local env"
        : blockedSmoke
          ? "private-value leak audit is skipped in blocked smoke because strict proof fails before private post-edit evidence is generated"
          : "scan generated release evidence for non-placeholder private env candidates after strict proof and progress refresh",
      statusLabel: blockedSmoke
        ? "skipped in blocked smoke"
        : privateValueLeakAuditResult
          ? (privateValueLeakAuditResult.success ? "passed" : "failed")
          : "not run",
      exitCode: privateValueLeakAuditResult?.status ?? null,
      valueRecorded: false
    }
  ];
  const blockedHandoffRows = proofReady
    ? []
    : [
        {
          order: 1,
          blocker: currentFirstBlocker,
          editTarget: textValue(strictLiveCheck?.currentEnvEditTarget, ".env.distribution.local"),
          requiredKeyCount: releaseChannelMetadataKeys.length,
          requiredKeys: releaseChannelMetadataKeys,
          placeholderKeyCount: integerValue(strictLiveCheck?.currentPlaceholderKeyCount),
          placeholderKeys: stringArrayValue(strictLiveCheck?.currentPlaceholderKeys),
          strictFailureRowCount: strictFailureRows.length,
          manualAction: `set private release-channel process env values and run ${releaseChannelApplyPrivateEnvCommand}`,
          returnCommand: successSmoke
            ? "npm run release:private-edit-strict-proof-success-smoke"
            : blockedSmoke
              ? "npm run release:private-edit-strict-proof-blocked-smoke"
              : "npm run release:private-edit-strict-proof",
          firstProofCommand: commandRows[0].command,
          sourceField: "strictFailureRows/currentFirstBlocker/currentEnvEditTarget",
          valueRecorded: false
        }
      ];
  const sourceRows = [
    sourceRow(
      successSmoke
        ? "Release-channel strict success smoke"
        : blockedSmoke
          ? "Release-channel strict blocked smoke"
          : "Release-channel strict live check",
      strictJsonPath,
      Boolean(strictLiveCheck),
      successSmoke || blockedSmoke
    ),
    sourceRow(
      successSmoke ? "Release post-edit proof success smoke" : "Release post-edit proof",
      postEditJsonPath,
      Boolean(postEditProof),
      successSmoke
    ),
    sourceRow("Release progress refresh smoke", progressRefreshJsonPath, Boolean(progressRefresh), false),
    sourceRow(
      successSmoke ? "Release private value leak audit success smoke" : "Release private value leak audit",
      privateValueLeakAuditJsonPath,
      Boolean(privateValueLeakAudit),
      successSmoke
    ),
    sourceRow("Release current blocker", currentBlockerJsonPath, Boolean(currentBlocker), false)
  ];

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: successSmoke
      ? "npm run release:private-edit-strict-proof-success-smoke"
      : blockedSmoke
        ? "npm run release:private-edit-strict-proof-blocked-smoke"
        : "npm run release:private-edit-strict-proof",
    sourceMode: successSmoke
      ? "synthetic private edit strict proof success smoke"
      : blockedSmoke
        ? "synthetic private edit strict proof blocked smoke"
        : "real private edit strict proof",
    realLocalEnvRead: successSmoke || blockedSmoke ? false : strictLiveCheck?.realLocalEnvRead === true,
    realLocalEnvModified: false,
    privateEditStrictProofMarkdownArtifactName: successSmoke
      ? strictProofSuccessMarkdownArtifactName
      : blockedSmoke
        ? strictProofBlockedMarkdownArtifactName
        : strictProofMarkdownArtifactName,
    privateEditStrictProofJsonArtifactName: successSmoke
      ? strictProofSuccessJsonArtifactName
      : blockedSmoke
        ? strictProofBlockedJsonArtifactName
        : strictProofJsonArtifactName,
    privateEditStrictProofReceiptReady: true,
    privateEditStrictProofReady: proofReady,
    privateEditStrictProofState: proofReady
      ? "strict release-channel proof chain is ready"
      : "strict release-channel proof chain is blocked before progress refresh",
    privateEditStrictProofCurrentTarget: textValue(currentBlocker?.currentTarget, "Release channel metadata"),
    privateEditStrictProofCurrentFirstBlocker: currentFirstBlocker,
    privateEditStrictProofFirstCommand: commandRows[0].command,
    privateEditStrictProofPostEditCommand: commandRows[1].command,
    privateEditStrictProofProgressCommand: commandRows[2].command,
    privateEditStrictProofLeakAuditCommand: commandRows[3].command,
    privateEditStrictProofCommandRows: commandRows,
    privateEditStrictProofCommandRowCount: commandRows.length,
    privateEditStrictProofCommandSummary: commandRows.map((row) => row.command).join(" -> "),
    privateEditStrictProofBlockedHandoffReady: proofReady || blockedHandoffRows.length > 0,
    privateEditStrictProofBlockedHandoffRows: blockedHandoffRows,
    privateEditStrictProofBlockedHandoffRowCount: blockedHandoffRows.length,
    privateEditStrictProofBlockedHandoffSummary: blockedHandoffRows.length
      ? `${blockedHandoffRows.length} blocked handoff row for ${blockedHandoffRows[0].editTarget}`
      : "none",
    privateEditStrictProofBlockedHandoffValueRecorded: false,
    strictReady,
    strictExitCode,
    strictFailureRowCount: strictFailureRows.length,
    strictFailureRows,
    strictCurrentReadyCount: integerValue(strictLiveCheck?.releaseChannelLiveCheckCurrentReadyCount),
    strictCurrentRowCount: integerValue(strictLiveCheck?.releaseChannelLiveCheckRowCount),
    currentEnvEditTarget: textValue(strictLiveCheck?.currentEnvEditTarget, ".env.distribution.local"),
    currentRequiredKeyCount: releaseChannelMetadataKeys.length,
    currentRequiredKeys: releaseChannelMetadataKeys,
    currentPlaceholderKeyCount: integerValue(strictLiveCheck?.currentPlaceholderKeyCount),
    currentPlaceholderKeys: stringArrayValue(strictLiveCheck?.currentPlaceholderKeys),
    postEditProofReady: postEditReady,
    postEditProofCommand: successSmoke ? "npm run release:post-edit-proof-success-smoke" : "npm run release:post-edit-proof",
    postEditProofCurrentPlaceholderKeyCount: integerValue(postEditProof?.currentPlaceholderKeyCount),
    postEditProofCurrentPlaceholderKeys: stringArrayValue(postEditProof?.currentPlaceholderKeys),
    progressRefreshReady: progressReady,
    progressRefreshSkippedInSuccessSmoke: successSmoke,
    progressRefreshSkippedInBlockedSmoke: blockedSmoke,
    privateValueLeakAuditReady,
    privateValueLeakAuditCommand: commandRows[3].command,
    privateValueLeakAuditSkippedInBlockedSmoke: blockedSmoke,
    privateValueLeakAuditSyntheticSuccessSmoke: successSmoke,
    privateValueLeakAuditCandidateCount: integerValue(privateValueLeakAudit?.privateValueCandidateCount),
    privateValueLeakAuditScannedArtifactCount: integerValue(privateValueLeakAudit?.scannedArtifactCount),
    privateValueLeakAuditLeakFindingCount: integerValue(privateValueLeakAudit?.leakFindingCount),
    privateValueLeakAuditDetectionProbeReady: blockedSmoke ? true : privateValueLeakAudit?.detectionProbeReady === true,
    currentTenPlanProgressLabel,
    nextScheduledTenPlanProgressReport: textValue(
      progressRefresh?.nextScheduledTenPlanProgressReportAfterDelivery,
      textValue(currentBlocker?.nextScheduledTenPlanProgressReportAfterDelivery, "plan-1230")
    ),
    userFacingCompletionPercent: Number(
      progressRefresh?.userFacingCompletionPercent ??
        currentBlocker?.userFacingCompletionPercent ??
        postEditProof?.userFacingCompletionPercent ??
        99.999999
    ),
    userFacingRemainingPercent: Number(
      progressRefresh?.userFacingRemainingPercent ??
        currentBlocker?.userFacingRemainingPercent ??
        postEditProof?.userFacingRemainingPercent ??
        0.000001
    ),
    nextPriorityActionId: textValue(currentBlocker?.nextPriorityActionId, "auto-update-feed"),
    nextPriorityActionLabel: textValue(currentBlocker?.nextPriorityActionLabel, "Auto-update feed and signed metadata"),
    hardGateCommand: textValue(currentBlocker?.hardGateCommand, "npm run release:external-check"),
    hardGateReady: currentBlocker?.hardGateReady === true,
    sourceArtifactRows: sourceRows,
    sourceArtifactRowCount: sourceRows.length,
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    updateFeedProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttempted: false,
    signingAttempted: false,
    claimedAutoUpdate: false,
    claimedExternalDistribution: false,
    valueRecorded: false
  };
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Private Edit Strict Proof

## Status

- Receipt ready: ${report.privateEditStrictProofReceiptReady ? "yes" : "no"}
- Strict proof chain ready: ${report.privateEditStrictProofReady ? "yes" : "no"}
- State: ${report.privateEditStrictProofState}
- Source mode: ${report.sourceMode}
- Current target: ${report.privateEditStrictProofCurrentTarget}
- Current blocker: ${report.privateEditStrictProofCurrentFirstBlocker}
- First command: \`${report.privateEditStrictProofFirstCommand}\`
- Post-edit proof command: \`${report.privateEditStrictProofPostEditCommand}\`
- Progress refresh command: \`${report.privateEditStrictProofProgressCommand}\`
- Private value leak audit command: \`${report.privateEditStrictProofLeakAuditCommand}\`
- Strict ready: ${report.strictReady ? "yes" : "no"}
- Strict exit code: ${report.strictExitCode}
- Strict current-ready rows: ${report.strictCurrentReadyCount}/${report.strictCurrentRowCount}
- Strict failure rows: ${report.strictFailureRowCount}
- Blocked handoff receipt ready: ${report.privateEditStrictProofBlockedHandoffReady ? "yes" : "no"}
- Blocked handoff rows: ${report.privateEditStrictProofBlockedHandoffRowCount} (${report.privateEditStrictProofBlockedHandoffSummary})
- Current env edit target: ${report.currentEnvEditTarget}
- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${report.currentPlaceholderKeys.join(", ") || "none"})
- Post-edit proof ready: ${report.postEditProofReady ? "yes" : "no"}
- Progress refresh ready: ${report.progressRefreshReady ? "yes" : "no"}
- Progress refresh skipped in success smoke: ${report.progressRefreshSkippedInSuccessSmoke ? "yes" : "no"}
- Progress refresh skipped in blocked smoke: ${report.progressRefreshSkippedInBlockedSmoke ? "yes" : "no"}
- Private value leak audit ready: ${report.privateValueLeakAuditReady ? "yes" : "no"}
- Private value leak audit skipped in blocked smoke: ${report.privateValueLeakAuditSkippedInBlockedSmoke ? "yes" : "no"}
- Private value leak audit findings: ${report.privateValueLeakAuditLeakFindingCount}
- Private value leak audit scanned artifacts: ${report.privateValueLeakAuditScannedArtifactCount}
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- Next scheduled 10-plan report: ${report.nextScheduledTenPlanProgressReport}
- Overall completion: ${report.userFacingCompletionPercent.toFixed(6)}%
- Remaining completion: ${report.userFacingRemainingPercent.toFixed(6)}%
- Next priority after current clears: ${report.nextPriorityActionId} (${report.nextPriorityActionLabel})
- Hard gate: \`${report.hardGateCommand}\` (${report.hardGateReady ? "ready" : "not ready"})
- Private values recorded: no
- External distribution claimed: no

## Proof Chain Commands

- Command rows: ${report.privateEditStrictProofCommandRowCount}
- Command summary: ${report.privateEditStrictProofCommandSummary}

| order | command | role | status | value recorded |
|---:|---|---|---|---:|
${formatCommandRows(report.privateEditStrictProofCommandRows)}

## Strict Failure Rows

| key | present | placeholder | shape ready | expected shape | edit target | line | value recorded |
|---|---:|---:|---:|---|---|---:|---:|
${formatFailureRows(report.strictFailureRows)}

## Blocked Handoff Receipt

| order | blocker | edit target | placeholder keys | strict failure rows | manual action | return command | first proof command | value recorded |
|---:|---|---|---:|---:|---|---|---|---:|
${formatBlockedHandoffRows(report.privateEditStrictProofBlockedHandoffRows)}

## Source Artifacts

| artifact | synthetic | present | path | value recorded |
|---|---:|---:|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Safety

- Network probe attempted: no
- Update feed probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- Auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, and external distribution completion are not claimed.
`;
}

async function writeReport(report) {
  await mkdir(packageRoot, { recursive: true });
  const markdown = buildMarkdown(report);
  const json = `${JSON.stringify(report, null, 2)}\n`;
  check(report.privateEditStrictProofReceiptReady === true, "release private edit strict proof should write a ready receipt");
  check(report.privateEditStrictProofCommandRowCount === 4, "release private edit strict proof should include four command rows");
  check(report.privateEditStrictProofFirstCommand.includes("channel-live-check-strict"), "release private edit strict proof should run strict live-check first");
  check(report.privateEditStrictProofPostEditCommand.includes("post-edit-proof"), "release private edit strict proof should include post-edit proof");
  check(report.privateEditStrictProofProgressCommand === "npm run release:progress-refresh-smoke", "release private edit strict proof should include progress refresh");
  check(report.privateEditStrictProofLeakAuditCommand.includes("private-value-leak-audit"), "release private edit strict proof should include private value leak audit");
  check(report.privateEditStrictProofMarkdownArtifactName.endsWith(".md"), "release private edit strict proof should record Markdown artifact name");
  check(report.privateEditStrictProofJsonArtifactName.endsWith(".json"), "release private edit strict proof should record JSON artifact name");
  check(report.privateEditStrictProofBlockedHandoffReady === true, "release private edit strict proof blocked handoff receipt should be ready");
  check(report.privateEditStrictProofBlockedHandoffRowCount === report.privateEditStrictProofBlockedHandoffRows.length, "release private edit strict proof blocked handoff row count should match rows");
  check(report.privateEditStrictProofReady || report.privateEditStrictProofBlockedHandoffRowCount > 0, "release private edit strict proof should include a blocked handoff row when blocked");
  check(report.privateEditStrictProofBlockedHandoffRows.every((row) => row.valueRecorded === false), "release private edit strict proof blocked handoff rows should not record values");
  check(!blockedSmoke || report.privateEditStrictProofReady === false, "release private edit strict proof blocked smoke should stay blocked");
  check(!blockedSmoke || report.privateEditStrictProofBlockedHandoffRowCount > 0, "release private edit strict proof blocked smoke should include blocked handoff rows");
  check(!blockedSmoke || report.realLocalEnvRead === false, "release private edit strict proof blocked smoke should not read real local env");
  check(!blockedSmoke || report.sourceMode.includes("blocked smoke"), "release private edit strict proof blocked smoke should use blocked smoke source mode");
  check(!blockedSmoke || report.strictFailureRowCount === releaseChannelMetadataKeys.length, "release private edit strict proof blocked smoke should cover four strict failure rows");
  check(!blockedSmoke || report.progressRefreshSkippedInBlockedSmoke === true, "release private edit strict proof blocked smoke should skip progress refresh");
  check(!blockedSmoke || report.privateValueLeakAuditSkippedInBlockedSmoke === true, "release private edit strict proof blocked smoke should skip private value leak audit");
  check(!successSmoke && !blockedSmoke || report.currentTenPlanProgressLabel === fallbackTenPlanProgressLabel, "release private edit strict proof smoke should derive the latest completed-plan label without progress refresh");
  check(successSmoke || blockedSmoke || report.privateValueLeakAuditReady === true, "release private edit strict proof real success path should run a ready private value leak audit");
  check(!successSmoke || report.privateValueLeakAuditReady === true, "release private edit strict proof success smoke should run a ready private value leak audit smoke");
  check(report.privateValueLeakAuditLeakFindingCount === 0, "release private edit strict proof private value leak audit should find zero leaks");
  check(report.privateValueLeakAuditDetectionProbeReady === true, "release private edit strict proof private value leak audit should keep detection probe ready");
  check(report.currentRequiredKeyCount === 4, "release private edit strict proof should track four release-channel keys");
  check(releaseChannelMetadataKeys.every((key) => report.currentRequiredKeys.includes(key)), "release private edit strict proof should cover release-channel keys");
  check(report.strictFailureRowCount === report.strictFailureRows.length, "release private edit strict proof strict failure row count should match rows");
  check(report.strictFailureRows.every((row) => row.valueRecorded === false), "release private edit strict proof failure rows should not record values");
  check(report.sourceArtifactRowCount === report.sourceArtifactRows.length, "release private edit strict proof source row count should match rows");
  check(report.sourceArtifactRows.every((row) => row.valueRecorded === false), "release private edit strict proof source rows should not record values");
  check(report.privateValuesRecorded === false, "release private edit strict proof should not record private values");
  check(report.networkProbeAttempted === false, "release private edit strict proof should not probe distribution channels");
  check(report.updateFeedProbeAttempted === false, "release private edit strict proof should not probe update feeds");
  check(report.releaseUploadAttempted === false, "release private edit strict proof should not upload releases");
  check(report.notarySubmissionAttempted === false, "release private edit strict proof should not submit to Apple");
  check(report.signingAttempted === false, "release private edit strict proof should not sign artifacts");
  check(report.claimedAutoUpdate === false, "release private edit strict proof should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release private edit strict proof should not claim external distribution");
  check(!/https?:\/\//i.test(json), "release private edit strict proof JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release private edit strict proof Markdown should not include URL values");
  check(markdown.includes("Release Private Edit Strict Proof"), "release private edit strict proof Markdown should include title");
  check(markdown.includes("Proof Chain Commands"), "release private edit strict proof Markdown should include proof chain commands");
  check(markdown.includes("Strict Failure Rows"), "release private edit strict proof Markdown should include strict failure rows");
  check(markdown.includes("Blocked Handoff Receipt"), "release private edit strict proof Markdown should include blocked handoff receipt");

  if (failures.length > 0) {
    console.error(`GrooveForge release private edit strict proof${modeLabel} failed:`);
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  await writeFile(jsonPath, json, "utf8");
  await writeFile(markdownPath, markdown, "utf8");
}

let strictResult = { command: "none", status: 1, success: false };
let postEditResult = null;
let progressResult = null;
let privateValueLeakAuditResult = null;
let strictLiveCheck = null;
let postEditProof = null;
let progressRefresh = null;
let privateValueLeakAudit = null;
let currentBlocker = await readJsonIfPresent(currentBlockerJsonPath);
const fallbackTenPlanProgressLabel = await currentTenPlanProgressLabel();

try {
  const strictScriptName = successSmoke ? "release:channel-live-check-strict-success-smoke" : "release:channel-live-check-strict";
  const strictOptions = {
    allowFailure: !successSmoke
  };
  if (blockedSmoke) {
    const blockedSmokeEnvRootRelative = await writeBlockedSmokeEnvFixture();
    strictOptions.envOverrides = {
      GROOVEFORGE_DISTRIBUTION_ENV_FILE: "",
      GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_ENV_ROOT: blockedSmokeEnvRootRelative,
      GROOVEFORGE_RELEASE_CHANNEL_LIVE_CHECK_REPORT_STEM: blockedLiveCheckReportStem
    };
    strictOptions.deleteEnvKeys = releaseChannelMetadataKeys;
  }
  strictResult = runNpmScript(strictScriptName, strictOptions);
  strictLiveCheck = await readJsonIfPresent(strictJsonPath);

  if (strictResult.success && !blockedSmoke) {
    postEditResult = runNpmScript(successSmoke ? "release:post-edit-proof-success-smoke" : "release:post-edit-proof");
    postEditProof = await readJsonIfPresent(postEditJsonPath);

    if (!successSmoke) {
      progressResult = runNpmScript("release:progress-refresh-smoke");
      progressRefresh = await readJsonIfPresent(progressRefreshJsonPath);
      currentBlocker = await readJsonIfPresent(currentBlockerJsonPath);
    }

    privateValueLeakAuditResult = runNpmScript(
      successSmoke ? "release:private-value-leak-audit-smoke" : "release:private-value-leak-audit"
    );
    privateValueLeakAudit = await readJsonIfPresent(privateValueLeakAuditJsonPath);
  }
} catch (error) {
  console.error(`GrooveForge release private edit strict proof${modeLabel} command failed:`);
  console.error(`- ${error.message}`);
  process.exit(1);
}

const report = buildReport({
  strictResult,
  postEditResult,
  progressResult,
  privateValueLeakAuditResult,
  strictLiveCheck,
  postEditProof,
  progressRefresh,
  privateValueLeakAudit,
  currentBlocker,
  fallbackTenPlanProgressLabel
});
await writeReport(report);

console.log(`GrooveForge release private edit strict proof${modeLabel} ${report.privateEditStrictProofReady ? "passed" : "blocked"}.`);
console.log(`- Markdown: ${relative(markdownPath)}`);
console.log(`- JSON: ${relative(jsonPath)}`);
console.log(`- Receipt ready: ${report.privateEditStrictProofReceiptReady ? "yes" : "no"}`);
console.log(`- Strict proof chain ready: ${report.privateEditStrictProofReady ? "yes" : "no"}`);
console.log(`- Current target: ${report.privateEditStrictProofCurrentTarget}`);
console.log(`- Current blocker: ${report.privateEditStrictProofCurrentFirstBlocker}`);
console.log(`- First command: ${report.privateEditStrictProofFirstCommand}`);
console.log(`- Post-edit proof command: ${report.privateEditStrictProofPostEditCommand}`);
console.log(`- Progress refresh command: ${report.privateEditStrictProofProgressCommand}`);
console.log(`- Private value leak audit command: ${report.privateEditStrictProofLeakAuditCommand}`);
console.log(`- Strict ready: ${report.strictReady ? "yes" : "no"}`);
console.log(`- Strict failure rows: ${report.strictFailureRowCount}`);
console.log(`- Private value leak audit ready: ${report.privateValueLeakAuditReady ? "yes" : "no"}`);
console.log(`- Private value leak audit findings: ${report.privateValueLeakAuditLeakFindingCount}`);
console.log(`- Blocked handoff receipt ready: ${report.privateEditStrictProofBlockedHandoffReady ? "yes" : "no"}`);
console.log(`- Blocked handoff rows: ${report.privateEditStrictProofBlockedHandoffRowCount} (${report.privateEditStrictProofBlockedHandoffSummary})`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- Overall completion: ${report.userFacingCompletionPercent.toFixed(6)}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent.toFixed(6)}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");

if (!successSmoke && !blockedSmoke && !report.privateEditStrictProofReady) {
  process.exit(1);
}
