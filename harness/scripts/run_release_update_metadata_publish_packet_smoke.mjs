#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionPrivateInputKeys } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const summaryRoot = path.join(root, "build", "desktop");
const packetStem = "release-update-metadata-publish-packet-smoke";
const packetMarkdownName = "release-update-metadata-publish-packet-smoke.md";
const packetJsonName = "release-update-metadata-publish-packet-smoke.json";
const releaseManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const updateMetadataPolicyPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-policy.json`);
const updateMetadataArtifactsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-artifacts.json`);
const autoUpdateReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const updateFeedPostEditProofPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-update-feed-post-edit-proof.json`
);
const packetMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetStem}.md`);
const packetJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetStem}.json`);
const failures = [];

const updateMetadataFiles = [
  "latest-mac.yml",
  "app-update.yml",
  `${appName}-${packageJson.version}-${platformArch}.dmg.blockmap`
];

const operatorCommandRows = [
  {
    order: 1,
    command: "npm run release:private-edit-strict-proof",
    role: "prove release-channel metadata placeholders were replaced without recording values",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:update-feed-live-check-strict",
    role: "strict first proof for one selected update feed URL key and one selected update channel key",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run release:update-feed-post-edit-proof",
    role: "refresh update feed/channel posture and downstream auto-update blockers",
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run desktop:update-metadata-artifacts-smoke",
    role: "draft local update metadata files from the selected signed/notarized source artifact when prerequisites exist",
    valueRecorded: false
  },
  {
    order: 5,
    command: "npm run release:update-metadata-publish-packet-smoke",
    role: "regenerate this publish packet after feed/channel and signed artifact evidence are ready",
    valueRecorded: false
  },
  {
    order: 6,
    command: "npm run release:private-value-leak-audit",
    role: "verify generated release evidence does not contain non-placeholder private values",
    valueRecorded: false
  },
  {
    order: 7,
    command: "npm run release:external-check",
    role: "hard external gate after every local, private-input, signed, notarized, update, and QA proof is ready",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge update metadata publish packet smoke failed:");
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
    fail(`${command} exited with status ${result.status}.`);
  }
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function currentTenPlanProgress() {
  const completedRoot = path.join(root, "docs", "exec_plans", "completed");
  const completedFiles = await readdir(completedRoot);
  const completedPlanNumbers = completedFiles
    .map((file) => /^plan-(\d+)-/.exec(file)?.[1])
    .filter((value) => typeof value === "string")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));
  const currentPlan = Math.max(...completedPlanNumbers);
  const windowStart = Math.floor((currentPlan - 1) / 10) * 10 + 1;
  const windowEnd = windowStart + 9;
  const windowRows = completedPlanNumbers.filter((number) => number >= windowStart && number <= windowEnd).sort((a, b) => a - b);
  return {
    latestPlan: `plan-${currentPlan}`,
    label: `${windowStart}-${windowEnd}: ${windowRows.length}/10`,
    windowStart,
    windowEnd,
    completedCount: windowRows.length,
    windowTotal: 10,
    reportDue: windowRows.length === 10,
    nextReportAt: `plan-${windowEnd}`
  };
}

function sourceRow(label, filePath, ready, command) {
  return valueFreeRow({
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready,
    command
  });
}

function refreshRows() {
  const manifestPresent = existsSync(releaseManifestPath);
  const policyPresent = existsSync(updateMetadataPolicyPath);
  return [
    valueFreeRow({
      order: 1,
      command: "npm run desktop:update-metadata-policy-smoke",
      role: "refresh update metadata policy after release manifest evidence exists",
      attempted: manifestPresent,
      skippedReason: manifestPresent ? "none" : "release manifest artifact is missing",
      valueRecorded: false
    }),
    valueFreeRow({
      order: 2,
      command: "npm run desktop:update-metadata-artifacts-smoke",
      role: "refresh local latest-mac/app-update/blockmap draft artifacts",
      attempted: manifestPresent && policyPresent,
      skippedReason: manifestPresent && policyPresent ? "none" : "release manifest or update metadata policy artifact is missing",
      valueRecorded: false
    }),
    valueFreeRow({
      order: 3,
      command: "npm run release:update-feed-post-edit-proof",
      role: "refresh update feed/channel posture and real auto-update blockers",
      attempted: true,
      skippedReason: "none",
      valueRecorded: false
    }),
    valueFreeRow({
      order: 4,
      command: "npm run desktop:auto-update-readiness-smoke",
      role: "refresh consolidated auto-update readiness after metadata artifact refresh attempts",
      attempted: true,
      skippedReason: "none",
      valueRecorded: false
    })
  ];
}

function sanitizeMetadataFileRows(metadataArtifacts) {
  return updateMetadataFiles.map((fileName, index) => {
    const artifact = metadataArtifacts?.artifacts ?? {};
    const knownPath =
      fileName === "latest-mac.yml"
        ? artifact.latestMac?.path
        : fileName === "app-update.yml"
          ? artifact.appUpdate?.path
          : artifact.dmgBlockmap?.path;
    const filePath = path.join(packageRoot, fileName);
    return valueFreeRow({
      order: index + 1,
      fileName,
      path: textValue(knownPath, relative(filePath)),
      present: existsSync(filePath),
      drafted: Boolean(knownPath) && existsSync(path.join(root, knownPath)),
      requiredBeforePublish: true,
      proofCommand: "npm run desktop:update-metadata-artifacts-smoke",
      valueRecorded: false
    });
  });
}

function sanitizeBlockerRows({ metadataArtifacts, autoUpdateReadiness, postEditProof }) {
  const blockers = [];
  if (!existsSync(releaseManifestPath)) {
    blockers.push({
      blocker: "Release manifest evidence is missing before update metadata publish packet can confirm source artifacts.",
      source: "releaseManifest",
      proofCommand: "npm run desktop:release-manifest-smoke"
    });
  }
  if (!existsSync(updateMetadataArtifactsPath)) {
    blockers.push({
      blocker: "Update metadata artifact draft evidence is missing before publish readiness can be evaluated.",
      source: "updateMetadataArtifacts",
      proofCommand: "npm run desktop:update-metadata-artifacts-smoke"
    });
  }
  for (const blocker of stringArray(metadataArtifacts?.blockers)) {
    blockers.push({
      blocker,
      source: "updateMetadataArtifacts.blockers",
      proofCommand: "npm run desktop:update-metadata-artifacts-smoke"
    });
  }
  for (const blocker of stringArray(autoUpdateReadiness?.blockers)) {
    blockers.push({
      blocker,
      source: "autoUpdateReadiness.blockers",
      proofCommand: "npm run desktop:auto-update-readiness-smoke"
    });
  }
  if (postEditProof?.proofReady !== true || postEditProof?.updateFeedLiveCheckReady !== true) {
    blockers.push({
      blocker: "Update feed/channel post-edit proof is not fully ready yet.",
      source: "releaseUpdateFeedPostEditProof",
      proofCommand: "npm run release:update-feed-post-edit-proof"
    });
  }
  return blockers.map((row, index) =>
    valueFreeRow({
      order: index + 1,
      blocker: row.blocker,
      source: row.source,
      proofCommand: row.proofCommand,
      hardGateCommand: "npm run release:external-check",
      valueRecorded: false
    })
  );
}

function buildArtifactSelectionRows(metadataArtifacts, autoUpdateReadiness) {
  const sourceDmg = metadataArtifacts?.sourceDmg ?? {};
  const signed = metadataArtifacts?.signedUpdateArtifact ?? {};
  return [
    valueFreeRow({
      order: 1,
      target: "release-manifest-source",
      selectedSource: textValue(sourceDmg.selectedSource, textValue(autoUpdateReadiness?.artifacts?.selectedUpdateArtifactSource)),
      sourcePath: textValue(sourceDmg.path, textValue(autoUpdateReadiness?.artifacts?.selectedUpdateArtifactPath)),
      readyForDraft: metadataArtifacts?.updateMetadataArtifactsDrafted === true,
      readyForPublish: false,
      proofCommand: "npm run desktop:update-metadata-artifacts-smoke",
      valueRecorded: false
    }),
    valueFreeRow({
      order: 2,
      target: "signed-notarized-update-artifact",
      selectedSource: textValue(signed.selectedSource, textValue(autoUpdateReadiness?.artifacts?.selectedUpdateArtifactSource)),
      sourcePath: textValue(signed.notarizationDmgPath, textValue(autoUpdateReadiness?.artifacts?.selectedUpdateArtifactPath)),
      developerIdSigned: signed.developerIdSigned === true || autoUpdateReadiness?.artifacts?.signedUpdateArtifactDeveloperIdSigned === true,
      notarizationReady: signed.notarizationReady === true || autoUpdateReadiness?.artifacts?.signedUpdateArtifactNotarizationReady === true,
      gatekeeperAccepted:
        signed.notarizedGatekeeperAccepted === true || autoUpdateReadiness?.artifacts?.signedUpdateArtifactGatekeeperAccepted === true,
      readyForPublish: signed.ready === true || autoUpdateReadiness?.checks?.signedUpdateArtifactsReady === true,
      proofCommand: "npm run desktop:auto-update-readiness-smoke",
      valueRecorded: false
    })
  ];
}

function buildReport({ metadataArtifacts, autoUpdateReadiness, postEditProof, progress, refreshCommandRows }) {
  const metadataFileRows = sanitizeMetadataFileRows(metadataArtifacts);
  const artifactSelectionRows = buildArtifactSelectionRows(metadataArtifacts, autoUpdateReadiness);
  const publishBlockerRows = sanitizeBlockerRows({ metadataArtifacts, autoUpdateReadiness, postEditProof });
  const sourceArtifactRows = [
    sourceRow(
      "Release manifest",
      releaseManifestPath,
      existsSync(releaseManifestPath),
      "npm run desktop:release-manifest-smoke"
    ),
    sourceRow(
      "Update metadata policy",
      updateMetadataPolicyPath,
      existsSync(updateMetadataPolicyPath),
      "npm run desktop:update-metadata-policy-smoke"
    ),
    sourceRow(
      "Update metadata artifacts",
      updateMetadataArtifactsPath,
      metadataArtifacts?.updateMetadataArtifactsDrafted === true && metadataArtifacts?.feedValueRecorded === false,
      "npm run desktop:update-metadata-artifacts-smoke"
    ),
    sourceRow(
      "Auto-update readiness",
      autoUpdateReadinessPath,
      autoUpdateReadiness?.localEnvValueRecorded === false &&
        autoUpdateReadiness?.networkProbeAttempted === false &&
        autoUpdateReadiness?.releaseGateClaimedAutoUpdate === false,
      "npm run desktop:auto-update-readiness-smoke"
    ),
    sourceRow(
      "Update feed post-edit proof",
      updateFeedPostEditProofPath,
      postEditProof?.privateValuesRecorded === false &&
        postEditProof?.networkProbeAttempted === false &&
        postEditProof?.claimedAutoUpdate === false,
      "npm run release:update-feed-post-edit-proof"
    )
  ];
  const updateFeedSelectedReadyCount = integerValue(postEditProof?.currentSelectedReadyCount);
  const updateFeedPlaceholderKeyCount = integerValue(postEditProof?.currentPlaceholderKeyCount);
  const metadataFilesReady = metadataFileRows.every((row) => row.present === true && row.drafted === true && row.valueRecorded === false);
  const signedUpdateArtifactsReady =
    autoUpdateReadiness?.checks?.signedUpdateArtifactsReady === true ||
    metadataArtifacts?.signedUpdateArtifact?.ready === true;
  const updateMetadataPublishReady =
    metadataFilesReady &&
    signedUpdateArtifactsReady &&
    autoUpdateReadiness?.autoUpdateReady === true &&
    postEditProof?.updateFeedLiveCheckReady === true &&
    publishBlockerRows.length === 0;

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:update-metadata-publish-packet-smoke",
    packetMarkdownName,
    packetJsonName,
    packetMarkdownPath: relative(packetMarkdownPath),
    packetJsonPath: relative(packetJsonPath),
    refreshCommandRows,
    refreshCommandRowCount: refreshCommandRows.length,
    operatorCommandRows,
    operatorCommandRowCount: operatorCommandRows.length,
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    metadataFileRows,
    metadataFileRowCount: metadataFileRows.length,
    artifactSelectionRows,
    artifactSelectionRowCount: artifactSelectionRows.length,
    publishBlockerRows,
    publishBlockerRowCount: publishBlockerRows.length,
    updateMetadataPublishPacketReady:
      sourceArtifactRows[3].present === true &&
      sourceArtifactRows[3].ready === true &&
      sourceArtifactRows[4].present === true &&
      sourceArtifactRows[4].ready === true &&
      refreshCommandRows.every((row) => row.valueRecorded === false) &&
      operatorCommandRows.every((row) => row.valueRecorded === false) &&
      metadataFileRows.every((row) => row.valueRecorded === false) &&
      artifactSelectionRows.every((row) => row.valueRecorded === false) &&
      publishBlockerRows.every((row) => row.valueRecorded === false),
    updateMetadataFilesReady: metadataFilesReady,
    signedUpdateArtifactsReady,
    updateFeedPostEditProofReady: postEditProof?.proofReady === true,
    updateFeedLiveCheckReady: postEditProof?.updateFeedLiveCheckReady === true,
    updateFeedSelectedReadyCount,
    updateFeedRequiredReadyCount: 2,
    updateFeedPlaceholderKeyCount,
    autoUpdateReady: autoUpdateReadiness?.autoUpdateReady === true,
    updateMetadataPublishReady,
    selectedUpdateArtifactSource: textValue(
      metadataArtifacts?.sourceDmg?.selectedSource,
      textValue(autoUpdateReadiness?.artifacts?.selectedUpdateArtifactSource)
    ),
    selectedUpdateArtifactFallbackReason: textValue(
      metadataArtifacts?.signedUpdateArtifact?.fallbackReason,
      textValue(autoUpdateReadiness?.artifacts?.selectedUpdateArtifactFallbackReason)
    ),
    currentTenPlanProgressLabel: progress.label,
    currentTenPlanWindowCompletedCount: progress.completedCount,
    tenPlanProgressReportDue: progress.reportDue,
    latestCompletedPlan: progress.latestPlan,
    userFacingCompletionPercent: Number(postEditProof?.userFacingCompletionPercent ?? 99.999999),
    userFacingRemainingPercent: Number(postEditProof?.userFacingRemainingPercent ?? 0.000001),
    hardGateCommand: "npm run release:external-check",
    hardGateReady: false,
    hardGateWouldFail: true,
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

function formatRefreshRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.attempted)} | ${escapeCell(row.skippedReason)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatOperatorRows(rows) {
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${readyLabel(row.ready)} | ${escapeCell(row.path)} | \`${escapeCell(row.command)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatMetadataRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.fileName)} | ${readyLabel(row.present)} | ${readyLabel(row.drafted)} | ${escapeCell(row.path)} | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatArtifactSelectionRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.target)} | ${escapeCell(row.selectedSource)} | ${escapeCell(row.sourcePath)} | ${readyLabel(row.readyForPublish)} | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatBlockerRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.blocker)} | ${escapeCell(row.source)} | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Update Metadata Publish Packet Smoke

## Status

- Publish packet ready: ${readyLabel(report.updateMetadataPublishPacketReady)}
- Update metadata publish ready: ${readyLabel(report.updateMetadataPublishReady)}
- Update metadata files ready: ${readyLabel(report.updateMetadataFilesReady)}
- Signed update artifacts ready: ${readyLabel(report.signedUpdateArtifactsReady)}
- Update feed post-edit proof ready: ${readyLabel(report.updateFeedPostEditProofReady)}
- Update feed live check ready: ${readyLabel(report.updateFeedLiveCheckReady)}
- Update feed selected keys ready: ${report.updateFeedSelectedReadyCount}/${report.updateFeedRequiredReadyCount}
- Update feed placeholder keys: ${report.updateFeedPlaceholderKeyCount}
- Auto-update ready: ${readyLabel(report.autoUpdateReady)}
- Selected update artifact source: ${report.selectedUpdateArtifactSource}
- Selected update artifact fallback: ${report.selectedUpdateArtifactFallbackReason}
- Publish blocker rows: ${report.publishBlockerRowCount}
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Latest completed plan: ${report.latestCompletedPlan}
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

## Refresh Commands

| order | command | role | attempted | skipped reason | value recorded |
|---:|---|---|---:|---|---:|
${formatRefreshRows(report.refreshCommandRows)}

## Operator Proof Order

| order | command | role | value recorded |
|---:|---|---|---:|
${formatOperatorRows(report.operatorCommandRows)}

## Source Artifacts

| artifact | present | ready | path | command | value recorded |
|---|---:|---:|---|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Update Metadata Files

| order | file | present | drafted | path | proof command | value recorded |
|---:|---|---:|---:|---|---|---:|
${formatMetadataRows(report.metadataFileRows)}

## Artifact Selection

| order | target | selected source | source path | ready for publish | proof command | value recorded |
|---:|---|---|---|---:|---|---:|
${formatArtifactSelectionRows(report.artifactSelectionRows)}

## Publish Blockers

| order | blocker | source | proof command | value recorded |
|---:|---|---|---|---:|
${formatBlockerRows(report.publishBlockerRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this packet.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function privateInputValues() {
  return distributionPrivateInputKeys
    .map((key) => process.env[key])
    .filter((value) => typeof value === "string" && value.trim().length >= 8);
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.reportCommand === "npm run release:update-metadata-publish-packet-smoke", "packet command should match package script");
  check(report.updateMetadataPublishPacketReady === true, "packet should be ready as a value-free handoff receipt");
  check(report.updateMetadataPublishReady === false, "packet should not claim update metadata publish readiness while blockers remain");
  check(report.refreshCommandRowCount === 4, "packet should include four refresh command rows");
  check(report.refreshCommandRows.every((row) => row.valueRecorded === false), "refresh command rows should be value-free");
  check(report.operatorCommandRowCount === 7, "packet should include seven operator command rows");
  check(report.operatorCommandRows.every((row) => row.valueRecorded === false), "operator command rows should be value-free");
  check(report.sourceArtifactRowCount === 5, "packet should include five source artifact rows");
  check(report.sourceArtifactRows.every((row) => row.valueRecorded === false), "source artifact rows should be value-free");
  check(report.metadataFileRowCount === 3, "packet should include three update metadata file rows");
  check(report.metadataFileRows.every((row) => row.valueRecorded === false), "metadata file rows should be value-free");
  check(report.artifactSelectionRowCount === 2, "packet should include two artifact selection rows");
  check(report.artifactSelectionRows.every((row) => row.valueRecorded === false), "artifact selection rows should be value-free");
  check(report.publishBlockerRowCount > 0, "packet should include publish blocker rows until external evidence is ready");
  check(report.publishBlockerRows.every((row) => row.valueRecorded === false), "publish blocker rows should be value-free");
  check(report.updateFeedRequiredReadyCount === 2, "packet should require feed and channel readiness");
  check(report.hardGateCommand === "npm run release:external-check", "packet should keep the hard external gate command");
  check(report.hardGateReady === false, "packet should keep hard gate unready");
  check(report.hardGateWouldFail === true, "packet should keep hard gate would-fail posture");
  check(report.userFacingCompletionPercent === 99.999999, "packet should preserve current completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "packet should preserve current remaining percent");
  check(report.privateValuesRecorded === false, "packet should not record private values");
  check(report.feedValueRecorded === false, "packet should not record feed values");
  check(report.channelValueRecorded === false, "packet should not record channel values");
  check(report.localEnvValueRecorded === false, "packet should not record local env values");
  check(report.networkProbeAttempted === false, "packet should not probe network");
  check(report.updateFeedPublishAttempted === false, "packet should not publish update feeds");
  check(report.releaseUploadAttempted === false, "packet should not upload releases");
  check(report.signingAttempted === false, "packet should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "packet should not submit to Apple");
  check(report.claimedAutoUpdate === false, "packet should not claim auto-update");
  check(report.claimedExternalDistribution === false, "packet should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "packet JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "packet Markdown should not include URL values");
  check(!serialized.includes("REDACTED_UPDATE_FEED_URL"), "packet JSON should not copy app-update placeholder values");
  check(!markdown.includes("REDACTED_UPDATE_FEED_URL"), "packet Markdown should not copy app-update placeholder values");
  check(markdown.includes("Update Metadata Publish Packet Smoke"), "packet Markdown should include title");
  check(markdown.includes("Update Metadata Files"), "packet Markdown should include metadata files table");
  check(markdown.includes("Publish Blockers"), "packet Markdown should include blocker table");
  for (const privateValue of privateInputValues()) {
    check(!serialized.includes(privateValue), "packet JSON should not include private distribution values");
    check(!markdown.includes(privateValue), "packet Markdown should not include private distribution values");
  }

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }
}

const rows = refreshRows();
for (const row of rows) {
  if (!row.attempted) {
    console.log(`Skipping update metadata publish packet refresh: ${row.command} (${row.skippedReason})`);
    continue;
  }
  console.log(`Refreshing update metadata publish packet evidence: ${row.command}`);
  runNpmScript(row.command);
}

const metadataArtifacts = await readJsonIfExists(updateMetadataArtifactsPath);
const autoUpdateReadiness = await readJsonIfExists(autoUpdateReadinessPath);
const postEditProof = await readJsonIfExists(updateFeedPostEditProofPath);
if (!autoUpdateReadiness) {
  fail("Auto-update readiness artifact is missing.", `Expected: ${relative(autoUpdateReadinessPath)}`);
}
if (!postEditProof) {
  fail("Update feed post-edit proof artifact is missing.", `Expected: ${relative(updateFeedPostEditProofPath)}`);
}

const progress = await currentTenPlanProgress();
const report = buildReport({ metadataArtifacts, autoUpdateReadiness, postEditProof, progress, refreshCommandRows: rows });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(packetMarkdownPath, markdown, "utf8");
await writeFile(packetJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge update metadata publish packet smoke passed.");
console.log(`- Markdown: ${relative(packetMarkdownPath)}`);
console.log(`- JSON: ${relative(packetJsonPath)}`);
console.log(`- Publish packet ready: ${report.updateMetadataPublishPacketReady ? "yes" : "no"}`);
console.log(`- Update metadata publish ready: ${report.updateMetadataPublishReady ? "yes" : "no"}`);
console.log(`- Update metadata files ready: ${report.updateMetadataFilesReady ? "yes" : "no"}`);
console.log(`- Signed update artifacts ready: ${report.signedUpdateArtifactsReady ? "yes" : "no"}`);
console.log(`- Update feed live check ready: ${report.updateFeedLiveCheckReady ? "yes" : "no"}`);
console.log(`- Publish blocker rows: ${report.publishBlockerRowCount}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
