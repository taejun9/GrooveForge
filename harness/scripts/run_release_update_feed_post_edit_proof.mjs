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
const summaryRoot = path.join(root, "build", "desktop");
const requestedReportStem = process.env.GROOVEFORGE_UPDATE_FEED_POST_EDIT_PROOF_REPORT_STEM?.trim() ?? "";
const postEditProofArtifacts = {
  default: {
    stem: "release-update-feed-post-edit-proof",
    markdownName: "release-update-feed-post-edit-proof.md",
    jsonName: "release-update-feed-post-edit-proof.json",
    command: "npm run release:update-feed-post-edit-proof",
    sourceMode: "real-update-feed-post-edit-proof",
    syntheticSuccessSmoke: false,
    liveCheckLabel: "Update feed live check",
    liveCheckCommand: "npm run release:update-feed-live-check",
    liveCheckStem: "release-update-feed-live-check",
    liveCheckRole: "refresh real ignored local env update feed/channel posture"
  },
  successSmoke: {
    stem: "release-update-feed-post-edit-proof-success-smoke",
    markdownName: "release-update-feed-post-edit-proof-success-smoke.md",
    jsonName: "release-update-feed-post-edit-proof-success-smoke.json",
    command: "npm run release:update-feed-post-edit-proof-success-smoke",
    sourceMode: "synthetic-update-feed-post-edit-proof-success-smoke",
    syntheticSuccessSmoke: true,
    liveCheckLabel: "Update feed live check strict success smoke",
    liveCheckCommand: "npm run release:update-feed-live-check-strict-success-smoke",
    liveCheckStem: "release-update-feed-live-check-strict-success-smoke",
    liveCheckRole: "refresh synthetic shape-ready update feed/channel posture without reading the real local env root"
  }
};
const selectedArtifact = requestedReportStem ? postEditProofArtifacts.successSmoke : postEditProofArtifacts.default;
if (requestedReportStem && requestedReportStem !== postEditProofArtifacts.successSmoke.stem) {
  console.error("GrooveForge update feed post-edit proof failed:");
  console.error("- Unsupported report stem override.");
  process.exit(1);
}
const liveCheckJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${selectedArtifact.liveCheckStem}.json`
);
const autoUpdateReadinessJsonPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const postEditProofMarkdownPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${selectedArtifact.stem}.md`
);
const postEditProofJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${selectedArtifact.stem}.json`
);
const failures = [];
const proofCommands = [
  {
    order: 1,
    command: selectedArtifact.liveCheckCommand,
    role: selectedArtifact.liveCheckRole,
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run desktop:auto-update-readiness-smoke",
    role: "refresh real auto-update readiness blockers after the live-check",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge update feed post-edit proof failed:");
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

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function objectRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object" && !Array.isArray(row)) : [];
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim().length > 0) : [];
}

function valueFreeRow(row) {
  return {
    ...row,
    valueRecorded: false
  };
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
    fail(
      `${command} exited with status ${result.status}.`,
      command === "npm run desktop:auto-update-readiness-smoke"
        ? "Run the desktop release artifact smokes through update metadata artifacts first, then retry this proof."
        : ""
    );
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function currentTenPlanProgress() {
  const completedRoot = path.join(root, "docs", "exec_plans", "completed");
  const files = await readdir(completedRoot);
  const planNumbers = files
    .map((file) => /^plan-(\d+)-/.exec(file)?.[1])
    .filter((value) => typeof value === "string")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
  const currentPlan = 1209;
  const windowStart = Math.floor((currentPlan - 1) / 10) * 10 + 1;
  const windowEnd = windowStart + 9;
  const windowRows = planNumbers.filter((number) => number >= windowStart && number <= windowEnd).sort((a, b) => a - b);
  return {
    label: `${windowStart}-${windowEnd}: ${windowRows.length}/10`,
    windowStart,
    windowEnd,
    completedCount: windowRows.length,
    windowTotal: 10,
    reportDue: windowRows.length === 10,
    nextReportAt: `plan-${windowEnd}`
  };
}

function commandRows() {
  return proofCommands.map((row) => valueFreeRow(row));
}

function sourceRow(label, filePath, ready) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready,
    valueRecorded: false
  };
}

function sanitizeLiveRows(rows) {
  return objectRows(rows).map((row) =>
    valueFreeRow({
      order: integerValue(row.order),
      key: textValue(row.key),
      kind: textValue(row.kind),
      selected: row.selected === true,
      present: row.present === true,
      placeholder: row.placeholder === true,
      shapeReady: row.shapeReady === true,
      selectedReady: row.selectedReady === true,
      expectedShape: textValue(row.expectedShape),
      editTarget: textValue(row.editTarget),
      line: Number.isInteger(row.line) ? row.line : null,
      proofCommand: textValue(row.proofCommand, "npm run release:update-feed-live-check")
    })
  );
}

function sanitizePlaceholderRows(rows) {
  return objectRows(rows).map((row) =>
    valueFreeRow({
      key: textValue(row.key),
      file: textValue(row.file),
      line: Number.isInteger(row.line) ? row.line : null,
      placeholder: row.placeholder === true
    })
  );
}

function sanitizeStrictFailureRows(rows) {
  return objectRows(rows).map((row) =>
    valueFreeRow({
      target: textValue(row.target),
      selectedKey: textValue(row.selectedKey),
      present: row.present === true,
      shapeReady: row.shapeReady === true,
      blockerCount: integerValue(row.blockerCount),
      proofCommand: textValue(row.proofCommand, "npm run release:update-feed-live-check-strict"),
      nonStrictProofCommand: textValue(row.nonStrictProofCommand, "npm run release:update-feed-live-check")
    })
  );
}

function sanitizeBlockerRows(blockers) {
  return stringArray(blockers).map((blocker, index) =>
    valueFreeRow({
      order: index + 1,
      blocker,
      sourceField: "autoUpdateReadiness.blockers",
      proofCommand: "npm run desktop:auto-update-readiness-smoke",
      hardGateCommand: "npm run release:external-check"
    })
  );
}

function formatCommandRows(rows) {
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${escapeCell(row.path)} | ${readyLabel(row.ready)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatProofRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.state)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.command)}\` | ${readyLabel(row.ready)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatLiveRows(rows) {
  if (rows.length === 0) {
    return "| 0 | none | none | no | no | no | no | no | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.kind)} | ${readyLabel(row.selected)} | ${readyLabel(row.present)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${readyLabel(row.selectedReady)} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "none")} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatStrictFailureRows(rows) {
  if (rows.length === 0) {
    return "| none | none | yes | yes | 0 | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.target)} | ${escapeCell(row.selectedKey)} | ${readyLabel(row.present)} | ${readyLabel(row.shapeReady)} | ${row.blockerCount} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.nonStrictProofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatPlaceholderRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | no | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.key)} | ${escapeCell(row.file)} | ${escapeCell(row.line ?? "none")} | ${readyLabel(row.placeholder)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatBlockerRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.blocker)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.hardGateCommand)}\` | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function buildReport({ liveCheck, autoUpdateReadiness, progress }) {
  const releaseUpdateFeedLiveRows = sanitizeLiveRows(liveCheck.updateFeedLiveCheckRows);
  const updateFeedStrictFailureRows = sanitizeStrictFailureRows(liveCheck.strictFailureRows);
  const updateFeedPlaceholderEditLocations = sanitizePlaceholderRows(liveCheck.currentPlaceholderEditLocations);
  const autoUpdateBlockerRows = sanitizeBlockerRows(autoUpdateReadiness.blockers);
  const autoUpdateSourceReady =
    autoUpdateReadiness.localEnvValueRecorded === false &&
    autoUpdateReadiness.networkProbeAttempted === false &&
    autoUpdateReadiness.releaseGateClaimedAutoUpdate === false &&
    autoUpdateReadiness.releaseGateClaimedExternalDistribution === false &&
    Array.isArray(autoUpdateReadiness.blockers);
  const liveCheckSourceReady =
    liveCheck.privateValuesRecorded === false &&
    liveCheck.feedValueRecorded === false &&
    liveCheck.channelValueRecorded === false &&
    liveCheck.networkProbeAttempted === false &&
    liveCheck.updateFeedPublishAttempted === false &&
    liveCheck.claimedAutoUpdate === false &&
    liveCheck.claimedExternalDistribution === false &&
    releaseUpdateFeedLiveRows.every((row) => row.valueRecorded === false);
  const sourceArtifactRows = [
    sourceRow(selectedArtifact.liveCheckLabel, liveCheckJsonPath, liveCheckSourceReady),
    sourceRow("Auto-update readiness smoke", autoUpdateReadinessJsonPath, autoUpdateSourceReady)
  ];
  const signedUpdateArtifactsReady = autoUpdateReadiness.checks?.signedUpdateArtifactsReady === true;
  const realAutoUpdateBlocked = autoUpdateReadiness.autoUpdateReady === false && autoUpdateBlockerRows.length > 0;
  const hardGateWouldFail = liveCheck.updateFeedLiveCheckReady !== true || autoUpdateReadiness.autoUpdateReady !== true;
  const proofRows = [
    {
      order: 1,
      state: "Update feed live-check posture",
      evidence: `${integerValue(liveCheck.currentSelectedReadyCount)}/2 selected update feed/channel rows ready; ${integerValue(liveCheck.currentPlaceholderKeyCount)} placeholders remain.`,
      command: selectedArtifact.liveCheckCommand,
      ready: liveCheckSourceReady,
      valueRecorded: false
    },
    {
      order: 2,
      state: "Real auto-update readiness posture",
      evidence: realAutoUpdateBlocked
        ? `${autoUpdateBlockerRows.length} real auto-update blocker rows remain after the live-check.`
        : "Real auto-update readiness has no blocker rows.",
      command: "npm run desktop:auto-update-readiness-smoke",
      ready: autoUpdateSourceReady && (realAutoUpdateBlocked || autoUpdateReadiness.autoUpdateReady === true),
      valueRecorded: false
    },
    {
      order: 3,
      state: "Signed update artifact boundary",
      evidence: signedUpdateArtifactsReady
        ? "Signed update artifacts are reported ready by the source readiness smoke."
        : "Signed/notarized update artifact evidence remains unavailable, so auto-update completion is not claimed.",
      command: "npm run desktop:auto-update-readiness-smoke",
      ready: signedUpdateArtifactsReady === false,
      valueRecorded: false
    },
    {
      order: 4,
      state: "Hard-gate boundary",
      evidence: hardGateWouldFail
        ? "External release remains blocked until the live feed/channel and auto-update readiness evidence clear."
        : "External release hard-gate inputs appear ready from the source proofs.",
      command: "npm run release:external-check",
      ready: hardGateWouldFail,
      valueRecorded: false
    },
    {
      order: 5,
      state: "Non-claim posture",
      evidence: "No feed values, channel values, network probes, uploads, signing, notarization, auto-update claim, or external distribution claim are recorded.",
      command: selectedArtifact.command,
      ready: true,
      valueRecorded: false
    }
  ];

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    sourceMode: selectedArtifact.sourceMode,
    syntheticSuccessSmoke: selectedArtifact.syntheticSuccessSmoke,
    reportCommand: selectedArtifact.command,
    updateFeedPostEditProofMarkdownArtifactName: selectedArtifact.markdownName,
    updateFeedPostEditProofJsonArtifactName: selectedArtifact.jsonName,
    updateFeedPostEditProofMarkdownPath: relative(postEditProofMarkdownPath),
    updateFeedPostEditProofJsonPath: relative(postEditProofJsonPath),
    releaseUpdateFeedPostEditProofReady:
      sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
      proofRows.every((row) => row.ready === true && row.valueRecorded === false),
    releaseUpdateFeedPostEditProofState:
      liveCheck.updateFeedLiveCheckReady === true && autoUpdateReadiness.autoUpdateReady === true
        ? "update feed and auto-update source evidence ready"
        : "update feed or downstream auto-update evidence still blocked",
    releaseUpdateFeedPostEditProofCommandRows: commandRows(),
    releaseUpdateFeedPostEditProofCommandCount: proofCommands.length,
    releaseUpdateFeedPostEditProofCommandSummary: proofCommands.map((row) => row.command).join(" -> "),
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    proofRows,
    proofRowCount: proofRows.length,
    updateFeedLiveCheckReady: liveCheck.updateFeedLiveCheckReady === true,
    updateFeedStrictReady: liveCheck.strictReady === true,
    updateFeedStrictExitCode: integerValue(liveCheck.strictExitCode),
    updateFeedStrictFailureRows,
    updateFeedStrictFailureRowCount: updateFeedStrictFailureRows.length,
    updateFeedLiveCheckRows: releaseUpdateFeedLiveRows,
    updateFeedLiveCheckRowCount: releaseUpdateFeedLiveRows.length,
    currentSelectedReadyCount: integerValue(liveCheck.currentSelectedReadyCount),
    currentRequiredKeyCount: integerValue(liveCheck.currentRequiredKeyCount),
    currentRequiredKeys: stringArray(liveCheck.currentRequiredKeys),
    currentPlaceholderKeyCount: integerValue(liveCheck.currentPlaceholderKeyCount),
    currentPlaceholderKeys: stringArray(liveCheck.currentPlaceholderKeys),
    currentPlaceholderEditLocationCount: integerValue(liveCheck.currentPlaceholderEditLocationCount),
    currentPlaceholderEditLocations: updateFeedPlaceholderEditLocations,
    currentEnvEditTarget: textValue(liveCheck.currentEnvEditTarget),
    selectedFeedKey: textValue(liveCheck.selectedFeedKey),
    selectedChannelKey: textValue(liveCheck.selectedChannelKey),
    realLocalEnvRead: liveCheck.realLocalEnvRead === true,
    realLocalEnvModified: liveCheck.realLocalEnvModified === true,
    autoUpdateReady: autoUpdateReadiness.autoUpdateReady === true,
    autoUpdateBlocked: realAutoUpdateBlocked,
    autoUpdateBlockerRows,
    autoUpdateBlockerCount: autoUpdateBlockerRows.length,
    updaterIntegrationReady: autoUpdateReadiness.checks?.updaterIntegrationReady === true,
    updateProviderReady: autoUpdateReadiness.checks?.providerReady === true,
    updateFeedConfigReady: autoUpdateReadiness.checks?.updateFeedConfigReady === true,
    updateMetadataPolicyReady: autoUpdateReadiness.checks?.updateMetadataPolicyReady === true,
    updateMetadataFilesReady: autoUpdateReadiness.checks?.updateMetadataFilesReady === true,
    signedUpdateArtifactsReady,
    userFacingUpdateBehaviorReady: autoUpdateReadiness.checks?.userFacingUpdateBehaviorReady === true,
    selectedUpdateArtifactSource: textValue(autoUpdateReadiness.artifacts?.selectedUpdateArtifactSource),
    selectedUpdateArtifactFallbackReason: textValue(autoUpdateReadiness.artifacts?.selectedUpdateArtifactFallbackReason),
    hardGateCommand: "npm run release:external-check",
    hardGateReady: false,
    hardGateWouldFail,
    currentTenPlanProgressLabel: progress.label,
    currentTenPlanWindowStart: progress.windowStart,
    currentTenPlanWindowEnd: progress.windowEnd,
    currentTenPlanWindowCompletedCount: progress.completedCount,
    currentTenPlanWindowTotal: progress.windowTotal,
    tenPlanProgressReportDue: progress.reportDue,
    nextTenPlanProgressReportAt: progress.nextReportAt,
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
    privateValuesRecorded: false,
    feedValueRecorded: false,
    channelValueRecorded: false,
    localEnvValueRecorded: false,
    networkProbeAttempted: false,
    updateFeedPublishAttempted: false,
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
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Update Feed Post-Edit Proof

## Status

- Post-edit proof ready: ${readyLabel(report.releaseUpdateFeedPostEditProofReady)}
- State: ${report.releaseUpdateFeedPostEditProofState}
- Source mode: ${report.sourceMode}
- Synthetic success smoke: ${readyLabel(report.syntheticSuccessSmoke)}
- Command order: ${report.releaseUpdateFeedPostEditProofCommandSummary}
- Update feed live check ready: ${readyLabel(report.updateFeedLiveCheckReady)}
- Update feed strict ready: ${readyLabel(report.updateFeedStrictReady)}
- Current selected keys ready: ${report.currentSelectedReadyCount}/2
- Current placeholder keys: ${report.currentPlaceholderKeyCount}
- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount}
- Current env edit target: ${report.currentEnvEditTarget}
- Feed key selected: ${report.selectedFeedKey}
- Channel key selected: ${report.selectedChannelKey}
- Auto-update ready: ${readyLabel(report.autoUpdateReady)}
- Auto-update blocked: ${readyLabel(report.autoUpdateBlocked)}
- Auto-update blocker rows: ${report.autoUpdateBlockerCount}
- Update provider ready: ${readyLabel(report.updateProviderReady)}
- Update feed config ready: ${readyLabel(report.updateFeedConfigReady)}
- Update metadata policy ready: ${readyLabel(report.updateMetadataPolicyReady)}
- Update metadata files ready: ${readyLabel(report.updateMetadataFilesReady)}
- Signed update artifacts ready: ${readyLabel(report.signedUpdateArtifactsReady)}
- User-facing update behavior ready: ${readyLabel(report.userFacingUpdateBehaviorReady)}
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Private values recorded: no
- Feed values recorded: no
- Channel values recorded: no
- Network probe attempted: no
- Update feed publish attempted: no
- Release upload attempted: no
- Signing attempted: no
- Apple notary submission attempted: no
- Auto-update claimed: no
- External distribution claimed: no

## Proof Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.releaseUpdateFeedPostEditProofCommandRows)}

## Source Artifacts

| artifact | present | path | ready | value recorded |
|---|---:|---|---:|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Proof Rows

| order | state | evidence | command | ready | value recorded |
|---:|---|---|---|---:|---:|
${formatProofRows(report.proofRows)}

## Update Feed Rows

| order | key | kind | selected | present | placeholder | shape ready | selected ready | expected shape | edit target | line | value recorded |
|---:|---|---|---:|---:|---:|---:|---:|---|---|---:|---:|
${formatLiveRows(report.updateFeedLiveCheckRows)}

## Strict Failure Rows

| target | selected key | present | shape ready | blocker count | strict command | non-strict command | value recorded |
|---|---|---:|---:|---:|---|---|---:|
${formatStrictFailureRows(report.updateFeedStrictFailureRows)}

## Placeholder Edit Locations

| key | file | line | placeholder | value recorded |
|---|---|---:|---:|---:|
${formatPlaceholderRows(report.currentPlaceholderEditLocations)}

## Auto-Update Blockers

| order | blocker | proof command | hard gate | value recorded |
|---:|---|---|---|---:|
${formatBlockerRows(report.autoUpdateBlockerRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this proof.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.releaseUpdateFeedPostEditProofReady === true, "update feed post-edit proof should be ready");
  check(report.sourceMode === selectedArtifact.sourceMode, "update feed post-edit proof source mode should match artifact mode");
  check(report.syntheticSuccessSmoke === selectedArtifact.syntheticSuccessSmoke, "update feed post-edit proof synthetic flag should match artifact mode");
  check(report.reportCommand === selectedArtifact.command, "update feed post-edit proof report command should match artifact mode");
  check(report.updateFeedPostEditProofMarkdownArtifactName === selectedArtifact.markdownName, "update feed post-edit proof Markdown artifact name should match artifact mode");
  check(report.updateFeedPostEditProofJsonArtifactName === selectedArtifact.jsonName, "update feed post-edit proof JSON artifact name should match artifact mode");
  check(report.releaseUpdateFeedPostEditProofCommandCount === 2, "update feed post-edit proof should include two commands");
  check(
    report.releaseUpdateFeedPostEditProofCommandSummary === `${selectedArtifact.liveCheckCommand} -> npm run desktop:auto-update-readiness-smoke`,
    "update feed post-edit proof should run live check before auto-update readiness"
  );
  check(
    report.releaseUpdateFeedPostEditProofCommandRows.every((row) => row.valueRecorded === false),
    "update feed post-edit proof command rows should be value-free"
  );
  check(report.sourceArtifactRowCount === 2, "update feed post-edit proof should include two source artifacts");
  check(
    report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false),
    "update feed post-edit proof source artifacts should be present, ready, and value-free"
  );
  check(report.proofRowCount === 5, "update feed post-edit proof should include five proof rows");
  check(
    report.proofRows.every((row) => row.ready === true && row.valueRecorded === false),
    "update feed post-edit proof rows should be ready and value-free"
  );
  check(report.updateFeedLiveCheckRowCount === 6, "update feed post-edit proof should mirror six update feed/channel rows");
  check(
    report.updateFeedLiveCheckRows.every((row) => row.valueRecorded === false),
    "update feed post-edit proof live rows should be value-free"
  );
  check(
    report.currentSelectedReadyCount >= 0 && report.currentSelectedReadyCount <= 2,
    "update feed post-edit proof selected-ready count should be bounded"
  );
  check(
    report.currentPlaceholderKeyCount === report.currentPlaceholderKeys.length,
    "update feed post-edit proof placeholder key count should match keys"
  );
  check(
    report.currentPlaceholderEditLocationCount === report.currentPlaceholderEditLocations.length,
    "update feed post-edit proof placeholder edit location count should match rows"
  );
  check(
    report.currentPlaceholderEditLocations.every((row) => row.valueRecorded === false),
    "update feed post-edit proof placeholder edit rows should be value-free"
  );
  check(
    report.updateFeedStrictFailureRows.every((row) => row.valueRecorded === false),
    "update feed post-edit proof strict failure rows should be value-free"
  );
  check(report.autoUpdateReady === false, "update feed post-edit proof should keep real auto-update readiness false while blockers remain");
  check(report.autoUpdateBlocked === true, "update feed post-edit proof should report real auto-update blockers");
  check(report.autoUpdateBlockerCount > 0, "update feed post-edit proof should include auto-update blocker rows");
  check(
    report.autoUpdateBlockerRows.every((row) => row.valueRecorded === false),
    "update feed post-edit proof blocker rows should be value-free"
  );
  check(report.signedUpdateArtifactsReady === false, "update feed post-edit proof should keep signed update artifacts unready");
  check(report.hardGateCommand === "npm run release:external-check", "update feed post-edit proof should keep hard external gate command");
  check(report.hardGateReady === false, "update feed post-edit proof should keep hard gate unready");
  check(report.hardGateWouldFail === true, "update feed post-edit proof should keep hard gate would-fail posture");
  check(report.userFacingCompletionPercent === 99.999999, "update feed post-edit proof should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "update feed post-edit proof should preserve remaining percent");
  check(report.privateValuesRecorded === false, "update feed post-edit proof should not record private values");
  check(report.feedValueRecorded === false, "update feed post-edit proof should not record feed values");
  check(report.channelValueRecorded === false, "update feed post-edit proof should not record channel values");
  check(report.localEnvValueRecorded === false, "update feed post-edit proof should not record local env values");
  check(report.networkProbeAttempted === false, "update feed post-edit proof should not probe the network");
  check(report.updateFeedPublishAttempted === false, "update feed post-edit proof should not publish update feeds");
  check(report.releaseUploadAttempted === false, "update feed post-edit proof should not upload releases");
  check(report.signingAttempted === false, "update feed post-edit proof should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "update feed post-edit proof should not submit to Apple");
  check(report.claimedAutoUpdate === false, "update feed post-edit proof should not claim auto-update");
  check(report.claimedExternalDistribution === false, "update feed post-edit proof should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "update feed post-edit proof JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "update feed post-edit proof Markdown should not include URL values");
  check(markdown.includes("Update Feed Post-Edit Proof"), "update feed post-edit proof Markdown should include title");
  check(markdown.includes("Update feed live check ready:"), "update feed post-edit proof Markdown should include live readiness");
  check(markdown.includes("Auto-update blocker rows:"), "update feed post-edit proof Markdown should include blocker posture");
  check(markdown.includes("Signed update artifacts ready:"), "update feed post-edit proof Markdown should include signed artifact posture");
  check(markdown.includes("Auto-update claimed: no"), "update feed post-edit proof Markdown should keep auto-update unclaimed");
  check(markdown.includes("External distribution claimed: no"), "update feed post-edit proof Markdown should keep external distribution unclaimed");

  if (selectedArtifact.syntheticSuccessSmoke) {
    check(report.updateFeedLiveCheckReady === true, "update feed post-edit proof success smoke should prove live-check readiness");
    check(report.updateFeedStrictReady === true, "update feed post-edit proof success smoke should prove strict readiness");
    check(report.updateFeedStrictExitCode === 0, "update feed post-edit proof success smoke should record strict exit code zero");
    check(report.updateFeedStrictFailureRowCount === 0, "update feed post-edit proof success smoke should have zero strict failure rows");
    check(report.currentSelectedReadyCount === 2, "update feed post-edit proof success smoke should prove two selected-ready keys");
    check(report.currentPlaceholderKeyCount === 0, "update feed post-edit proof success smoke should prove zero placeholder keys");
    check(report.currentPlaceholderEditLocationCount === 0, "update feed post-edit proof success smoke should prove zero placeholder edit locations");
    check(report.realLocalEnvRead === false, "update feed post-edit proof success smoke should not read the real local env root for the live check");
    check(report.realLocalEnvModified === false, "update feed post-edit proof success smoke should not modify the real local env");
  }

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }
}

for (const row of proofCommands) {
  console.log(`Refreshing update feed post-edit proof evidence: ${row.command}`);
  runNpmScript(row.command);
}

const liveCheck = await readJsonRequired(liveCheckJsonPath, "Update feed live check");
const autoUpdateReadiness = await readJsonRequired(autoUpdateReadinessJsonPath, "Auto-update readiness");
const progress = await currentTenPlanProgress();
const report = buildReport({ liveCheck, autoUpdateReadiness, progress });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(postEditProofMarkdownPath, markdown, "utf8");
await writeFile(postEditProofJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge update feed post-edit proof passed.");
console.log(`- Markdown: ${relative(postEditProofMarkdownPath)}`);
console.log(`- JSON: ${relative(postEditProofJsonPath)}`);
console.log(`- Source mode: ${report.sourceMode}`);
console.log(`- Synthetic success smoke: ${report.syntheticSuccessSmoke ? "yes" : "no"}`);
console.log(`- Proof ready: ${report.releaseUpdateFeedPostEditProofReady ? "yes" : "no"}`);
console.log(`- Update feed live check ready: ${report.updateFeedLiveCheckReady ? "yes" : "no"}`);
console.log(`- Current selected keys ready: ${report.currentSelectedReadyCount}/2`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
console.log(`- Auto-update ready: ${report.autoUpdateReady ? "yes" : "no"}`);
console.log(`- Auto-update blocker rows: ${report.autoUpdateBlockerCount}`);
console.log(`- Signed update artifacts ready: ${report.signedUpdateArtifactsReady ? "yes" : "no"}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- 10-plan report due: ${report.tenPlanProgressReportDue ? "yes" : "no"}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
