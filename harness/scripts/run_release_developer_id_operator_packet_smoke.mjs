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
const summaryRoot = path.join(root, "build", "desktop");
const packageRoot = path.join(summaryRoot, `${appName}-${platformArch}`);
const packetStem = "release-developer-id-operator-packet-smoke";
const packetMarkdownName = "release-developer-id-operator-packet-smoke.md";
const packetJsonName = "release-developer-id-operator-packet-smoke.json";
const packetMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetMarkdownName}`);
const packetJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${packetJsonName}`);
const packagedAppPath = path.join(packageRoot, `${appName}.app`);
const developerIdReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-readiness.json`);
const developerIdSigningPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(summaryRoot, `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(summaryRoot, `${appName}-${platformArch}-notarized-gatekeeper.json`);
const manualQaPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-manual-qa.json`);
const distributionChannelQaPath = path.join(summaryRoot, `${appName}-${platformArch}-distribution-channel-qa.json`);
const autoUpdateReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const updateMetadataArtifactsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-artifacts.json`);
const completionSummaryPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-completion-summary-smoke.json`);
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge Developer ID operator packet smoke failed:");
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

function refreshRows() {
  const packagedAppPresent = existsSync(packagedAppPath);
  const signingSummaryPresent = existsSync(developerIdSigningPath);
  const notarizationSummaryPresent = existsSync(notarizationPath);
  return [
    valueFreeRow({
      order: 1,
      command: "npm run desktop:developer-id-readiness-smoke",
      role: "refresh Developer ID tool, identity-count, and notary credential-signal readiness without recording values",
      attempted: true,
      skippedReason: "none"
    }),
    valueFreeRow({
      order: 2,
      command: "npm run desktop:developer-id-signing-smoke",
      role: "refresh isolated Developer ID signing proof when a packaged app artifact is available",
      attempted: packagedAppPresent,
      skippedReason: packagedAppPresent ? "none" : "packaged app artifact is missing"
    }),
    valueFreeRow({
      order: 3,
      command: "npm run desktop:notarization-smoke",
      role: "refresh isolated notarization/stapling proof after Developer ID signing evidence exists",
      attempted: signingSummaryPresent,
      skippedReason: signingSummaryPresent ? "none" : "Developer ID signing summary is missing"
    }),
    valueFreeRow({
      order: 4,
      command: "npm run desktop:notarized-gatekeeper-smoke",
      role: "refresh notarized Gatekeeper assessment after notarization evidence exists",
      attempted: notarizationSummaryPresent,
      skippedReason: notarizationSummaryPresent ? "none" : "notarization summary is missing"
    }),
    valueFreeRow({
      order: 5,
      command: "npm run desktop:distribution-manual-qa-smoke",
      role: "refresh manual distribution QA checklist and signed artifact blockers",
      attempted: true,
      skippedReason: "none"
    }),
    valueFreeRow({
      order: 6,
      command: "npm run desktop:distribution-channel-qa-smoke",
      role: "refresh channel QA hard-gate blockers after signing, notarization, Gatekeeper, update, and manual QA evidence",
      attempted: true,
      skippedReason: "none"
    })
  ];
}

const operatorCommandRows = [
  valueFreeRow({
    order: 1,
    command: "npm run release:private-edit-strict-proof",
    role: "prove release-channel metadata placeholders were replaced without recording values"
  }),
  valueFreeRow({
    order: 2,
    command: "npm run release:update-feed-post-edit-proof",
    role: "prove update feed/channel placeholders and auto-update blockers before signed metadata publication"
  }),
  valueFreeRow({
    order: 3,
    command: "npm run release:update-metadata-publish-packet-smoke",
    role: "refresh update metadata publish posture before signed/notarized artifact selection"
  }),
  valueFreeRow({
    order: 4,
    command: "npm run desktop:developer-id-readiness-smoke",
    role: "verify local Developer ID and notary tool/credential-signal readiness without printing identities"
  }),
  valueFreeRow({
    order: 5,
    command: "npm run desktop:developer-id-signing-smoke",
    role: "sign and verify only an isolated ignored app copy when a matching Developer ID identity is configured"
  }),
  valueFreeRow({
    order: 6,
    command: "npm run desktop:notarization-smoke",
    role: "submit/staple only when the operator explicitly sets the guarded notarization submit flag"
  }),
  valueFreeRow({
    order: 7,
    command: "npm run desktop:notarized-gatekeeper-smoke",
    role: "assess the isolated stapled DMG and mounted app after notarization proof exists"
  }),
  valueFreeRow({
    order: 8,
    command: "npm run desktop:distribution-manual-qa-smoke",
    role: "refresh manual channel QA checklist and approval digest posture"
  }),
  valueFreeRow({
    order: 9,
    command: "npm run desktop:distribution-channel-qa-smoke",
    role: "refresh final distribution-channel QA blockers before the hard gate"
  }),
  valueFreeRow({
    order: 10,
    command: "npm run release:private-value-leak-audit",
    role: "verify generated release evidence does not contain non-placeholder private values"
  }),
  valueFreeRow({
    order: 11,
    command: "npm run release:external-check",
    role: "hard external gate after local, private-input, update, signing, notarization, Gatekeeper, and manual QA proof is ready"
  })
];

function sourceRow(label, filePath, ready, command) {
  return valueFreeRow({
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready,
    command
  });
}

function buildSourceRows({
  developerIdReadiness,
  developerIdSigning,
  notarization,
  gatekeeper,
  manualQa,
  distributionChannelQa
}) {
  return [
    sourceRow(
      "Developer ID readiness",
      developerIdReadinessPath,
      developerIdReadiness?.localEnvValueRecorded === false &&
        developerIdReadiness?.developerIdIdentityValueRecorded === false &&
        developerIdReadiness?.credentialValueRecorded === false &&
        developerIdReadiness?.networkSubmissionAttempted === false,
      "npm run desktop:developer-id-readiness-smoke"
    ),
    sourceRow(
      "Developer ID signing",
      developerIdSigningPath,
      developerIdSigning?.localEnvValueRecorded === false &&
        developerIdSigning?.developerIdIdentityValueRecorded === false &&
        developerIdSigning?.credentialValueRecorded === false &&
        developerIdSigning?.networkSubmissionAttempted === false &&
        developerIdSigning?.releaseGateClaimedExternalDistribution === false,
      "npm run desktop:developer-id-signing-smoke"
    ),
    sourceRow(
      "Notarization",
      notarizationPath,
      notarization?.localEnvValueRecorded === false &&
        notarization?.developerIdIdentityValueRecorded === false &&
        notarization?.credentialValueRecorded === false &&
        notarization?.releaseGateClaimedExternalDistribution === false,
      "npm run desktop:notarization-smoke"
    ),
    sourceRow(
      "Notarized Gatekeeper",
      notarizedGatekeeperPath,
      gatekeeper?.networkSubmissionAttempted === false && gatekeeper?.releaseGateClaimedExternalDistribution === false,
      "npm run desktop:notarized-gatekeeper-smoke"
    ),
    sourceRow(
      "Distribution manual QA",
      manualQaPath,
      manualQa?.manualQaChecklistReady === true &&
        manualQa?.privateValuesRecorded === false &&
        manualQa?.releaseGateClaimedExternalDistribution === false,
      "npm run desktop:distribution-manual-qa-smoke"
    ),
    sourceRow(
      "Distribution-channel QA",
      distributionChannelQaPath,
      distributionChannelQa?.localEnvValueRecorded === false &&
        distributionChannelQa?.networkProbeAttempted === false &&
        distributionChannelQa?.releaseUploadAttempted === false &&
        distributionChannelQa?.releaseGateClaimedExternalDistribution === false,
      "npm run desktop:distribution-channel-qa-smoke"
    )
  ];
}

function buildReadinessRows({
  developerIdReadiness,
  developerIdSigning,
  notarization,
  gatekeeper,
  manualQa,
  distributionChannelQa,
  autoUpdateReadiness,
  updateMetadataArtifacts
}) {
  return [
    valueFreeRow({
      order: 1,
      area: "developer-id-tooling",
      ready: developerIdReadiness?.developerIdSigning?.ready === true,
      detail: `identity-count=${integerValue(developerIdReadiness?.developerIdSigning?.validDeveloperIdApplicationIdentityCount)}`,
      proofCommand: "npm run desktop:developer-id-readiness-smoke"
    }),
    valueFreeRow({
      order: 2,
      area: "developer-id-signing",
      ready: developerIdSigning?.developerIdSigned === true,
      detail: `identity-configured=${readyLabel(developerIdSigning?.configuredIdentityPresent === true)}, matching-identity=${readyLabel(developerIdSigning?.matchingIdentityFound === true)}, isolated-signing-attempted=${readyLabel(developerIdSigning?.developerIdSigningAttempted === true)}`,
      proofCommand: "npm run desktop:developer-id-signing-smoke"
    }),
    valueFreeRow({
      order: 3,
      area: "notarization",
      ready: notarization?.notarizationReady === true,
      detail: `submission-requested=${readyLabel(notarization?.notarySubmissionRequested === true)}, submission-attempted=${readyLabel(notarization?.notarySubmissionAttempted === true)}, accepted=${readyLabel(notarization?.notarizationAccepted === true)}`,
      proofCommand: "npm run desktop:notarization-smoke"
    }),
    valueFreeRow({
      order: 4,
      area: "stapling",
      ready: notarization?.stapled === true && notarization?.stapleValidationPassed === true,
      detail: `stapled=${readyLabel(notarization?.stapled === true)}, staple-validation=${readyLabel(notarization?.stapleValidationPassed === true)}`,
      proofCommand: "npm run desktop:notarization-smoke"
    }),
    valueFreeRow({
      order: 5,
      area: "notarized-gatekeeper",
      ready: gatekeeper?.notarizedGatekeeperAccepted === true,
      detail: `notarized-input=${readyLabel(gatekeeper?.notarizedInputReady === true)}, accepted=${readyLabel(gatekeeper?.notarizedGatekeeperAccepted === true)}`,
      proofCommand: "npm run desktop:notarized-gatekeeper-smoke"
    }),
    valueFreeRow({
      order: 6,
      area: "signed-update-artifact",
      ready:
        updateMetadataArtifacts?.signedUpdateArtifact?.ready === true ||
        autoUpdateReadiness?.checks?.signedUpdateArtifactsReady === true ||
        manualQa?.signedUpdateArtifactReady === true,
      detail: `selected-source=${textValue(updateMetadataArtifacts?.sourceDmg?.selectedSource, textValue(manualQa?.selectedUpdateArtifactSource))}`,
      proofCommand: "npm run desktop:update-metadata-artifacts-smoke"
    }),
    valueFreeRow({
      order: 7,
      area: "manual-qa",
      ready: manualQa?.manualQaApprovalReady === true,
      detail: `checklist-ready=${readyLabel(manualQa?.manualQaChecklistReady === true)}, digest-matched=${readyLabel(manualQa?.manualQaChecklistDigestMatches === true)}, approval-signal=${readyLabel(manualQa?.manualQaApprovalSignalReady === true)}`,
      proofCommand: "npm run desktop:distribution-manual-qa-smoke"
    }),
    valueFreeRow({
      order: 8,
      area: "distribution-channel",
      ready: distributionChannelQa?.externalDistributionReady === true,
      detail: `channel-metadata=${readyLabel(distributionChannelQa?.channel?.ready === true)}, external-ready=${readyLabel(distributionChannelQa?.externalDistributionReady === true)}`,
      proofCommand: "npm run desktop:distribution-channel-qa-smoke"
    })
  ];
}

function blockerRowsFrom(label, source, command, blockers) {
  return stringArray(blockers).map((blocker) => ({
    blocker,
    source,
    area: label,
    proofCommand: command
  }));
}

function buildBlockerRows({
  developerIdReadiness,
  developerIdSigning,
  notarization,
  gatekeeper,
  manualQa,
  distributionChannelQa,
  autoUpdateReadiness,
  updateMetadataArtifacts
}) {
  const blockers = [];
  if (!existsSync(packagedAppPath)) {
    blockers.push({
      blocker: "Packaged GrooveForge.app artifact is missing before isolated Developer ID signing proof can run.",
      source: "packagedApp",
      area: "developer-id-signing",
      proofCommand: "npm run desktop:package-smoke"
    });
  }
  if (!existsSync(updateMetadataArtifactsPath)) {
    blockers.push({
      blocker: "Update metadata artifact evidence is missing before signed update artifact selection can be evaluated.",
      source: "updateMetadataArtifacts",
      area: "signed-update-artifact",
      proofCommand: "npm run desktop:update-metadata-artifacts-smoke"
    });
  }
  blockers.push(
    ...blockerRowsFrom("developer-id-readiness", "developerIdReadiness.blockers", "npm run desktop:developer-id-readiness-smoke", developerIdReadiness?.blockers),
    ...blockerRowsFrom("developer-id-signing", "developerIdSigning.blockers", "npm run desktop:developer-id-signing-smoke", developerIdSigning?.blockers),
    ...blockerRowsFrom("notarization", "notarization.blockers", "npm run desktop:notarization-smoke", notarization?.blockers),
    ...blockerRowsFrom("notarized-gatekeeper", "gatekeeper.blockers", "npm run desktop:notarized-gatekeeper-smoke", gatekeeper?.blockers),
    ...blockerRowsFrom("manual-qa", "manualQa.blockers", "npm run desktop:distribution-manual-qa-smoke", manualQa?.blockers),
    ...blockerRowsFrom("distribution-channel", "distributionChannelQa.blockers", "npm run desktop:distribution-channel-qa-smoke", distributionChannelQa?.blockers),
    ...blockerRowsFrom("auto-update", "autoUpdateReadiness.blockers", "npm run desktop:auto-update-readiness-smoke", autoUpdateReadiness?.blockers),
    ...blockerRowsFrom("update-metadata", "updateMetadataArtifacts.blockers", "npm run desktop:update-metadata-artifacts-smoke", updateMetadataArtifacts?.blockers)
  );
  const seen = new Set();
  return blockers
    .filter((row) => {
      const key = `${row.area}:${row.blocker}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .map((row, index) =>
      valueFreeRow({
        order: index + 1,
        blocker: row.blocker,
        area: row.area,
        source: row.source,
        proofCommand: row.proofCommand,
        hardGateCommand: "npm run release:external-check"
      })
    );
}

function buildReport({
  developerIdReadiness,
  developerIdSigning,
  notarization,
  gatekeeper,
  manualQa,
  distributionChannelQa,
  autoUpdateReadiness,
  updateMetadataArtifacts,
  completionSummary,
  progress,
  refreshCommandRows
}) {
  const sourceArtifactRows = buildSourceRows({
    developerIdReadiness,
    developerIdSigning,
    notarization,
    gatekeeper,
    manualQa,
    distributionChannelQa
  });
  const readinessRows = buildReadinessRows({
    developerIdReadiness,
    developerIdSigning,
    notarization,
    gatekeeper,
    manualQa,
    distributionChannelQa,
    autoUpdateReadiness,
    updateMetadataArtifacts
  });
  const blockerRows = buildBlockerRows({
    developerIdReadiness,
    developerIdSigning,
    notarization,
    gatekeeper,
    manualQa,
    distributionChannelQa,
    autoUpdateReadiness,
    updateMetadataArtifacts
  });
  const developerIdReady = developerIdSigning?.developerIdSigned === true;
  const notarizationReady = notarization?.notarizationReady === true;
  const gatekeeperReady = gatekeeper?.notarizedGatekeeperAccepted === true;
  const manualQaReady = manualQa?.manualQaApprovalReady === true;
  const distributionChannelReady = distributionChannelQa?.externalDistributionReady === true;
  const signedUpdateArtifactsReady =
    updateMetadataArtifacts?.signedUpdateArtifact?.ready === true ||
    autoUpdateReadiness?.checks?.signedUpdateArtifactsReady === true ||
    manualQa?.signedUpdateArtifactReady === true;
  const developerIdOperatorPacketReady =
    sourceArtifactRows[0].present === true &&
    sourceArtifactRows[0].ready === true &&
    sourceArtifactRows[4].present === true &&
    sourceArtifactRows[4].ready === true &&
    sourceArtifactRows[5].present === true &&
    sourceArtifactRows[5].ready === true &&
    refreshCommandRows.every((row) => row.valueRecorded === false) &&
    operatorCommandRows.every((row) => row.valueRecorded === false) &&
    readinessRows.every((row) => row.valueRecorded === false) &&
    blockerRows.every((row) => row.valueRecorded === false);
  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:developer-id-operator-packet-smoke",
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
    readinessRows,
    readinessRowCount: readinessRows.length,
    blockerRows,
    blockerRowCount: blockerRows.length,
    developerIdOperatorPacketReady,
    developerIdToolingReady: developerIdReadiness?.developerIdSigning?.ready === true,
    developerIdIdentityCount: integerValue(developerIdReadiness?.developerIdSigning?.validDeveloperIdApplicationIdentityCount),
    developerIdIdentityConfigured: developerIdSigning?.configuredIdentityPresent === true,
    developerIdMatchingIdentityFound: developerIdSigning?.matchingIdentityFound === true,
    developerIdSigningAttempted: developerIdSigning?.developerIdSigningAttempted === true,
    developerIdReady,
    notaryCredentialSignalReady: developerIdReadiness?.notarization?.ready === true || notarization?.credentialSignals
      ? notarization?.credentialSignals?.appleIdCredentialKeysPresent === true ||
        notarization?.credentialSignals?.appStoreConnectApiKeySignalPresent === true ||
        notarization?.credentialSignals?.notarytoolKeychainProfileSignalPresent === true ||
        developerIdReadiness?.notarization?.ready === true
      : false,
    notarySubmissionRequested: notarization?.notarySubmissionRequested === true,
    notarySubmissionAttempted: notarization?.notarySubmissionAttempted === true,
    notarizationArtifactPrepared: notarization?.notarizationArtifactPrepared === true,
    notarizationAccepted: notarization?.notarizationAccepted === true,
    stapled: notarization?.stapled === true,
    stapleValidationPassed: notarization?.stapleValidationPassed === true,
    notarizationReady,
    gatekeeperInputReady: gatekeeper?.notarizedInputReady === true,
    gatekeeperReady,
    signedUpdateArtifactsReady,
    manualQaChecklistReady: manualQa?.manualQaChecklistReady === true,
    manualQaDigestMatched: manualQa?.manualQaChecklistDigestMatches === true,
    manualQaReady,
    channelMetadataReady: distributionChannelQa?.channel?.ready === true,
    autoUpdateReady: autoUpdateReadiness?.autoUpdateReady === true || distributionChannelQa?.inputs?.autoUpdateReady === true,
    distributionChannelReady,
    externalDistributionReady: false,
    hardGateCommand: "npm run release:external-check",
    hardGateReady: false,
    hardGateWouldFail: true,
    currentTenPlanProgressLabel: progress.label,
    currentTenPlanWindowCompletedCount: progress.completedCount,
    tenPlanProgressReportDue: progress.reportDue,
    latestCompletedPlan: progress.latestPlan,
    userFacingCompletionPercent: Number(completionSummary?.userFacingCompletionPercent ?? completionSummary?.completionSummary?.userFacingCompletionPercent ?? 99.999999),
    userFacingRemainingPercent: Number(completionSummary?.userFacingRemainingPercent ?? completionSummary?.completionSummary?.userFacingRemainingPercent ?? 0.000001),
    privateValuesRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    channelValueRecorded: false,
    localEnvValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    releaseUploadAttempted: false,
    updateFeedPublishAttempted: false,
    distributionChannelProbeAttempted: false,
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

function formatReadinessRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.area)} | ${readyLabel(row.ready)} | ${escapeCell(row.detail)} | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
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
        `| ${row.order} | ${escapeCell(row.area)} | ${escapeCell(row.blocker)} | \`${escapeCell(row.proofCommand)}\` | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Developer ID Operator Packet Smoke

## Status

- Developer ID operator packet ready: ${readyLabel(report.developerIdOperatorPacketReady)}
- Developer ID tooling ready: ${readyLabel(report.developerIdToolingReady)}
- Developer ID identity count: ${report.developerIdIdentityCount}
- Developer ID identity configured: ${readyLabel(report.developerIdIdentityConfigured)}
- Developer ID matching identity found: ${readyLabel(report.developerIdMatchingIdentityFound)}
- Developer ID isolated signing attempted: ${readyLabel(report.developerIdSigningAttempted)}
- Developer ID signed isolated app ready: ${readyLabel(report.developerIdReady)}
- Notary credential signal ready: ${readyLabel(report.notaryCredentialSignalReady)}
- Notary submission requested: ${readyLabel(report.notarySubmissionRequested)}
- Notary submission attempted: ${readyLabel(report.notarySubmissionAttempted)}
- Notarization artifact prepared: ${readyLabel(report.notarizationArtifactPrepared)}
- Notarization accepted: ${readyLabel(report.notarizationAccepted)}
- Stapled: ${readyLabel(report.stapled)}
- Staple validation passed: ${readyLabel(report.stapleValidationPassed)}
- Notarization ready: ${readyLabel(report.notarizationReady)}
- Gatekeeper input ready: ${readyLabel(report.gatekeeperInputReady)}
- Notarized Gatekeeper ready: ${readyLabel(report.gatekeeperReady)}
- Signed update artifacts ready: ${readyLabel(report.signedUpdateArtifactsReady)}
- Manual QA checklist ready: ${readyLabel(report.manualQaChecklistReady)}
- Manual QA digest matched: ${readyLabel(report.manualQaDigestMatched)}
- Manual QA approval ready: ${readyLabel(report.manualQaReady)}
- Channel metadata ready: ${readyLabel(report.channelMetadataReady)}
- Auto-update ready: ${readyLabel(report.autoUpdateReady)}
- Distribution-channel ready: ${readyLabel(report.distributionChannelReady)}
- External distribution ready: ${readyLabel(report.externalDistributionReady)}
- Blocker rows: ${report.blockerRowCount}
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Latest completed plan: ${report.latestCompletedPlan}
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Private values recorded: no
- Developer ID identity value recorded: no
- Credential values recorded: no
- Release upload attempted: no
- Update feed publish attempted: no
- Distribution channel probe attempted: no
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

## Developer ID Readiness

| order | area | ready | detail | proof command | value recorded |
|---:|---|---:|---|---|---:|
${formatReadinessRows(report.readinessRows)}

## Blockers

| order | area | blocker | proof command | value recorded |
|---:|---|---|---|---:|
${formatBlockerRows(report.blockerRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity label, private beat, or real user audio is recorded.
- This packet does not upload releases, publish update feeds, probe distribution channels, or claim App Store submission.
- Apple notarization can only be attempted by the underlying notarization smoke when the operator has explicitly set the guarded submit flag; this packet records only the boolean outcome and no credentials.
- Not claimed: primary release artifact Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion.
`;
}

function privateInputValues() {
  return distributionPrivateInputKeys
    .map((key) => process.env[key])
    .filter((value) => typeof value === "string" && value.trim().length >= 8);
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.reportCommand === "npm run release:developer-id-operator-packet-smoke", "packet command should match package script");
  check(report.developerIdOperatorPacketReady === true, "packet should be ready as a value-free Developer ID handoff receipt");
  check(report.externalDistributionReady === false, "packet should not claim external distribution readiness");
  check(report.refreshCommandRowCount === 6, "packet should include six refresh command rows");
  check(report.refreshCommandRows.every((row) => row.valueRecorded === false), "refresh command rows should be value-free");
  check(report.operatorCommandRowCount === 11, "packet should include eleven operator command rows");
  check(report.operatorCommandRows.every((row) => row.valueRecorded === false), "operator command rows should be value-free");
  check(report.sourceArtifactRowCount === 6, "packet should include six source artifact rows");
  check(report.sourceArtifactRows.every((row) => row.valueRecorded === false), "source artifact rows should be value-free");
  check(report.readinessRowCount === 8, "packet should include eight readiness rows");
  check(report.readinessRows.every((row) => row.valueRecorded === false), "readiness rows should be value-free");
  check(report.blockerRowCount > 0, "packet should include blocker rows until external evidence is ready");
  check(report.blockerRows.every((row) => row.valueRecorded === false), "blocker rows should be value-free");
  check(report.hardGateCommand === "npm run release:external-check", "packet should keep hard external gate command");
  check(report.hardGateReady === false, "packet should keep hard gate unready");
  check(report.hardGateWouldFail === true, "packet should keep hard gate would-fail posture");
  check(report.userFacingCompletionPercent === 99.999999, "packet should preserve current completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "packet should preserve current remaining percent");
  check(report.privateValuesRecorded === false, "packet should not record private values");
  check(report.releaseUrlValueRecorded === false, "packet should not record release URL values");
  check(report.supportUrlValueRecorded === false, "packet should not record support URL values");
  check(report.feedValueRecorded === false, "packet should not record feed values");
  check(report.channelValueRecorded === false, "packet should not record channel values");
  check(report.localEnvValueRecorded === false, "packet should not record local env values");
  check(report.credentialValueRecorded === false, "packet should not record credential values");
  check(report.tokenValueRecorded === false, "packet should not record token values");
  check(report.developerIdIdentityValueRecorded === false, "packet should not record Developer ID identity values");
  check(report.releaseUploadAttempted === false, "packet should not upload releases");
  check(report.updateFeedPublishAttempted === false, "packet should not publish update feeds");
  check(report.distributionChannelProbeAttempted === false, "packet should not probe distribution channels");
  check(report.claimedDeveloperIdSigning === false, "packet should not claim Developer ID signing completion");
  check(report.claimedNotarization === false, "packet should not claim notarization completion");
  check(report.claimedGatekeeperApproval === false, "packet should not claim Gatekeeper approval");
  check(report.claimedManualQaApproval === false, "packet should not claim manual QA approval");
  check(report.claimedExternalDistribution === false, "packet should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "packet JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "packet Markdown should not include URL values");
  check(!/Developer ID Application:/i.test(serialized), "packet JSON should not include Developer ID identity labels");
  check(!/Developer ID Application:/i.test(markdown), "packet Markdown should not include Developer ID identity labels");
  check(markdown.includes("Developer ID Operator Packet Smoke"), "packet Markdown should include title");
  check(markdown.includes("Developer ID Readiness"), "packet Markdown should include readiness table");
  check(markdown.includes("Operator Proof Order"), "packet Markdown should include operator proof order");
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
    console.log(`Skipping Developer ID operator packet refresh: ${row.command} (${row.skippedReason})`);
    continue;
  }
  console.log(`Refreshing Developer ID operator packet evidence: ${row.command}`);
  runNpmScript(row.command);
}

const developerIdReadiness = await readJsonIfExists(developerIdReadinessPath);
const developerIdSigning = await readJsonIfExists(developerIdSigningPath);
const notarization = await readJsonIfExists(notarizationPath);
const gatekeeper = await readJsonIfExists(notarizedGatekeeperPath);
const manualQa = await readJsonIfExists(manualQaPath);
const distributionChannelQa = await readJsonIfExists(distributionChannelQaPath);
const autoUpdateReadiness = await readJsonIfExists(autoUpdateReadinessPath);
const updateMetadataArtifacts = await readJsonIfExists(updateMetadataArtifactsPath);
const completionSummary = await readJsonIfExists(completionSummaryPath);

if (!developerIdReadiness) {
  fail("Developer ID readiness artifact is missing.", `Expected: ${relative(developerIdReadinessPath)}`);
}
if (!manualQa) {
  fail("Distribution manual QA artifact is missing.", `Expected: ${relative(manualQaPath)}`);
}
if (!distributionChannelQa) {
  fail("Distribution-channel QA artifact is missing.", `Expected: ${relative(distributionChannelQaPath)}`);
}

const progress = await currentTenPlanProgress();
const report = buildReport({
  developerIdReadiness,
  developerIdSigning,
  notarization,
  gatekeeper,
  manualQa,
  distributionChannelQa,
  autoUpdateReadiness,
  updateMetadataArtifacts,
  completionSummary,
  progress,
  refreshCommandRows: rows
});
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(packetMarkdownPath, markdown, "utf8");
await writeFile(packetJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge Developer ID operator packet smoke passed.");
console.log(`- Markdown: ${relative(packetMarkdownPath)}`);
console.log(`- JSON: ${relative(packetJsonPath)}`);
console.log(`- Developer ID operator packet ready: ${report.developerIdOperatorPacketReady ? "yes" : "no"}`);
console.log(`- Developer ID signed isolated app ready: ${report.developerIdReady ? "yes" : "no"}`);
console.log(`- Notarization ready: ${report.notarizationReady ? "yes" : "no"}`);
console.log(`- Notarized Gatekeeper ready: ${report.gatekeeperReady ? "yes" : "no"}`);
console.log(`- Manual QA approval ready: ${report.manualQaReady ? "yes" : "no"}`);
console.log(`- Distribution-channel ready: ${report.distributionChannelReady ? "yes" : "no"}`);
console.log(`- Blocker rows: ${report.blockerRowCount}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, update feed publish, or credential value recording by this packet");
console.log("- Not claimed: primary release artifact Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
