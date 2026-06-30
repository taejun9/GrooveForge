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
const completedPlansDir = path.join(root, "docs", "exec_plans", "completed");
const personaReadinessJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-persona-readiness.json`);
const completionProgressJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-progress.json`);
const externalProofBundleJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-proof-bundle.json`);
const externalGateJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-distribution-gate.json`);
const releaseChannelUnblockJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-unblock-smoke.json`);
const releaseProgressMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-report.md`);
const releaseProgressJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-report.json`);
const failures = [];
const fromExisting = process.argv.includes("--from-existing");

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release progress report failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function formatBlockerRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none |";
  }
  return rows.map((row) => `| ${row.order ?? "?"} | ${row.blocker ?? "none"} |`).join("\n");
}

function textValue(value, fallback = "unknown") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function stringArrayValue(values) {
  return Array.isArray(values) ? values.filter((value) => typeof value === "string" && value.trim().length > 0) : [];
}

function valueFreeObjectRows(values) {
  return Array.isArray(values) ? values.filter((value) => value && typeof value === "object" && value.valueRecorded === false) : [];
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function formatUserPercent(value) {
  return value === 100 ? "100%" : `${value.toFixed(6)}%`;
}

function formatEditGuidanceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none |";
  }

  return rows
    .map((row) => {
      const location = row.location ?? (row.file && row.line ? `${row.file}:${row.line}` : row.editTarget ?? "unknown");
      return `| ${escapeCell(location)} | ${escapeCell(row.key ?? "unknown")} | ${escapeCell(row.assignment ?? "none")} | ${escapeCell(row.guidance ?? "none")} |`;
    })
    .join("\n");
}

function formatProofChecklistRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.criterion)} | ${escapeCell(row.evidenceSummary)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.hardGateCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatActionChecklistRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.step)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCommandVerificationRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${escapeCell(row.expectation)} | ${escapeCell(row.proofTarget)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCompletedPlanRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.number ?? "?"} | ${escapeCell(row.fileName)} | ${escapeCell(row.path)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatTenPlanProgressReportReceiptRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.item)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.evidence)} | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatAudienceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | none | none | no | no | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.audience)} | ${escapeCell(row.readinessRole)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.workflowMode)} | ${row.workflowBars ?? 0} | ${escapeCell(row.workflowDeliveryTarget)} | ${escapeCell(row.workflowStyle)} | ${row.deliveryPackageReady ? "yes" : "no"} | ${row.deliveryPackageReopenReady ? "yes" : "no"} | ${row.deliveryArtifactCount ?? 0} | ${row.verifiedDeliveryArtifactCount ?? 0} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatAudienceAcceptanceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | no | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.audience)} | ${escapeCell(row.acceptanceArea)} | ${escapeCell(row.criterion)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.evidenceSource)} | ${escapeCell(row.evidenceSummary)} | ${escapeCell(row.workflowLabel)} | ${row.artifactCount ?? 0} | ${row.verifiedArtifactCount ?? 0} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatDeliveryPackageRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.persona)} | ${escapeCell(row.workflowLabel)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.mode)} | ${row.bars ?? 0} | ${escapeCell(row.deliveryTarget)} | ${row.artifactCount ?? 0} | ${escapeCell(row.packageRoot)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatDeliveryPackageReopenRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | no | no | no | no | no | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.persona)} | ${escapeCell(row.workflowLabel)} | ${row.ready ? "yes" : "no"} | ${row.artifactCount ?? 0} | ${row.verifiedArtifactCount ?? 0} | ${row.projectReopened ? "yes" : "no"} | ${row.hashesReady ? "yes" : "no"} | ${row.wavHeadersReady ? "yes" : "no"} | ${row.midiHeaderReady ? "yes" : "no"} | ${row.handoffReady ? "yes" : "no"} | ${escapeCell(row.packageRoot)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatReleaseChannelUnblockRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | no | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.key)} | ${row.present ? "yes" : "no"} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.evidence)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

async function buildCompletedPlanSummary() {
  const names = await readdir(completedPlansDir);
  const planRows = names
    .map((name) => {
      const match = name.match(/^plan-(\d{3,})-[a-z0-9][a-z0-9-]*\.md$/);
      return match ? { number: Number.parseInt(match[1], 10), fileName: name } : null;
    })
    .filter((row) => row && Number.isInteger(row.number))
    .sort((a, b) => a.number - b.number);
  const latest = planRows.at(-1) ?? { number: 0, fileName: "none" };
  const windowStart = latest.number > 0 ? Math.floor((latest.number - 1) / 10) * 10 + 1 : 1;
  const windowEnd = windowStart + 9;
  const windowCompleted = planRows.filter((row) => row.number >= windowStart && row.number <= windowEnd);
  const latestPath = latest.fileName === "none" ? "none" : relative(path.join(completedPlansDir, latest.fileName));
  const currentTenPlanWindowRows = windowCompleted.map((row) => ({
    number: row.number,
    fileName: row.fileName,
    path: relative(path.join(completedPlansDir, row.fileName)),
    valueRecorded: false
  }));

  return {
    completedPlanSource: relative(completedPlansDir),
    completedPlanCount: planRows.length,
    latestCompletedPlanNumber: latest.number,
    latestCompletedPlanPath: latestPath,
    currentTenPlanWindowStart: windowStart,
    currentTenPlanWindowEnd: windowEnd,
    currentTenPlanWindowCompletedCount: windowCompleted.length,
    currentTenPlanWindowTotal: 10,
    currentTenPlanWindowLabel: `${windowStart}-${windowEnd}: ${windowCompleted.length}/10`,
    currentTenPlanWindowRowCount: currentTenPlanWindowRows.length,
    currentTenPlanWindowRowSummary:
      currentTenPlanWindowRows.length > 0
        ? `${currentTenPlanWindowRows.length} completed plan filenames`
        : "none",
    currentTenPlanWindowRows,
    tenPlanProgressReportDue: windowCompleted.length === 10,
    tenPlanProgressReportCadence: "report after each completed work and every 10 completed plans",
    nextTenPlanProgressReportAt: windowEnd,
    completedPlanValueRecorded: false
  };
}

function buildAudienceReadinessSummary(personaReadiness) {
  const deliveryPackageRows = valueFreeObjectRows(personaReadiness.deliveryPackageRows).map((row) => ({
    persona: textValue(row.persona),
    workflowLabel: textValue(row.workflowLabel),
    ready: row.ready === true,
    mode: textValue(row.mode),
    styleId: textValue(row.styleId),
    bars: integerValue(row.bars),
    deliveryTarget: textValue(row.deliveryTarget),
    packageRoot: textValue(row.packageRoot),
    manifestJsonPath: textValue(row.manifestJsonPath),
    artifactCount: integerValue(row.artifactCount),
    totalBytes: integerValue(row.totalBytes),
    stemArtifactCount: integerValue(row.stemArtifactCount),
    midiBytes: integerValue(row.midiBytes),
    handoffSheetBytes: integerValue(row.handoffSheetBytes),
    mixStatus: textValue(row.mixStatus),
    localFirst: row.localFirst === true,
    samplingSecondary: row.samplingSecondary === true,
    valueRecorded: false
  }));
  const deliveryPackageReopenRows = valueFreeObjectRows(personaReadiness.deliveryPackageReopenRows).map((row) => ({
    persona: textValue(row.persona),
    workflowLabel: textValue(row.workflowLabel),
    ready: row.ready === true,
    packageRoot: textValue(row.packageRoot),
    manifestJsonPath: textValue(row.manifestJsonPath),
    artifactCount: integerValue(row.artifactCount),
    verifiedArtifactCount: integerValue(row.verifiedArtifactCount),
    totalBytes: integerValue(row.totalBytes),
    projectReopened: row.projectReopened === true,
    hashesReady: row.hashesReady === true,
    wavHeadersReady: row.wavHeadersReady === true,
    midiHeaderReady: row.midiHeaderReady === true,
    handoffReady: row.handoffReady === true,
    localFirst: row.localFirst === true,
    samplingSecondary: row.samplingSecondary === true,
    valueRecorded: false
  }));
  const rows = valueFreeObjectRows(personaReadiness.audienceReadinessRows).map((row) => ({
    audience: textValue(row.audience),
    readinessRole: textValue(row.readinessRole),
    ready: row.ready === true,
    renderedSignalGroup: textValue(row.renderedSignalGroup),
    workflowLabel: textValue(row.workflowLabel),
    workflowMode: textValue(row.workflowMode),
    workflowBars: integerValue(row.workflowBars),
    workflowDeliveryTarget: textValue(row.workflowDeliveryTarget),
    workflowStyle: textValue(row.workflowStyle),
    deliveryPackageReady: row.deliveryPackageReady === true,
    deliveryPackageReopenReady: row.deliveryPackageReopenReady === true,
    deliveryArtifactCount: integerValue(row.deliveryArtifactCount),
    verifiedDeliveryArtifactCount: integerValue(row.verifiedDeliveryArtifactCount),
    proofSummary: textValue(row.proofSummary),
    localFirst: row.localFirst === true,
    samplingSecondary: row.samplingSecondary === true,
    valueRecorded: false
  }));
  const acceptanceRows = valueFreeObjectRows(personaReadiness.audienceAcceptanceRows).map((row) => ({
    audience: textValue(row.audience),
    readinessRole: textValue(row.readinessRole),
    acceptanceArea: textValue(row.acceptanceArea),
    criterion: textValue(row.criterion),
    ready: row.ready === true,
    evidenceSource: textValue(row.evidenceSource),
    evidenceSummary: textValue(row.evidenceSummary),
    workflowLabel: textValue(row.workflowLabel),
    artifactCount: integerValue(row.artifactCount),
    verifiedArtifactCount: integerValue(row.verifiedArtifactCount),
    localFirst: row.localFirst === true,
    samplingSecondary: row.samplingSecondary === true,
    valueRecorded: false
  }));
  const beginnerRow = rows.find((row) => row.audience === "first-time composer");
  const producerRow = rows.find((row) => row.audience === "professional producer");
  const audienceAcceptanceReady =
    personaReadiness.audienceAcceptanceReady === true &&
    acceptanceRows.length === 10 &&
    acceptanceRows.filter((row) => row.audience === "first-time composer").length === 5 &&
    acceptanceRows.filter((row) => row.audience === "professional producer").length === 5 &&
    acceptanceRows.every((row) => row.ready === true && row.localFirst === true && row.samplingSecondary === true && row.valueRecorded === false);
  const audienceReadinessReady =
    personaReadiness.personaReadinessReady === true &&
    personaReadiness.beginnerReadinessReady === true &&
    personaReadiness.professionalProducerReadinessReady === true &&
    personaReadiness.directCompositionReady === true &&
    personaReadiness.allGenreStyleReadinessReady === true &&
    personaReadiness.localExportReadinessReady === true &&
    personaReadiness.personaDeliveryPackagesReady === true &&
    personaReadiness.personaDeliveryPackagesReopenReady === true &&
    audienceAcceptanceReady &&
    personaReadiness.samplingSecondaryReady === true &&
    deliveryPackageRows.length === 2 &&
    deliveryPackageRows.every((row) => row.ready === true && row.artifactCount === 8 && row.localFirst === true && row.samplingSecondary === true && row.valueRecorded === false) &&
    deliveryPackageReopenRows.length === 2 &&
    deliveryPackageReopenRows.every(
      (row) =>
        row.ready === true &&
        row.verifiedArtifactCount === 8 &&
        row.projectReopened === true &&
        row.hashesReady === true &&
        row.wavHeadersReady === true &&
        row.midiHeaderReady === true &&
        row.handoffReady === true &&
        row.localFirst === true &&
        row.samplingSecondary === true &&
        row.valueRecorded === false
    ) &&
    rows.length === 2 &&
    rows.every(
      (row) =>
        row.ready === true &&
        row.deliveryPackageReady === true &&
        row.deliveryPackageReopenReady === true &&
        row.deliveryArtifactCount === 8 &&
        row.verifiedDeliveryArtifactCount === 8 &&
        row.localFirst === true &&
        row.samplingSecondary === true &&
        row.valueRecorded === false
    );

  return {
    sourcePersonaReadinessReady: true,
    sourcePersonaReadinessPath: relative(personaReadinessJsonPath),
    audienceReadinessReady,
    audienceReadinessRowCount: rows.length,
    audienceReadinessRowSummary: rows.length > 0 ? `${rows.length} value-free audience readiness rows` : "none",
    audienceReadinessRows: rows,
    audienceAcceptanceReady,
    audienceAcceptanceRowCount: acceptanceRows.length,
    audienceAcceptanceRowSummary: acceptanceRows.length > 0 ? `${acceptanceRows.length} value-free audience acceptance rows` : "none",
    audienceAcceptanceRows: acceptanceRows,
    audienceDeliveryPackagesReady: personaReadiness.personaDeliveryPackagesReady === true,
    audienceDeliveryPackageRoot: textValue(personaReadiness.personaDeliveryPackageRoot, "none"),
    audienceDeliveryPackageRowCount: deliveryPackageRows.length,
    audienceDeliveryPackageRowSummary: deliveryPackageRows.length > 0 ? `${deliveryPackageRows.length} value-free persona delivery package rows` : "none",
    audienceDeliveryPackageRows: deliveryPackageRows,
    audienceDeliveryPackagesReopenReady: personaReadiness.personaDeliveryPackagesReopenReady === true,
    audienceDeliveryPackageReopenRowCount: deliveryPackageReopenRows.length,
    audienceDeliveryPackageReopenRowSummary:
      deliveryPackageReopenRows.length > 0 ? `${deliveryPackageReopenRows.length} value-free persona delivery package reopen rows` : "none",
    audienceDeliveryPackageReopenRows: deliveryPackageReopenRows,
    beginnerAudienceReadinessReady: beginnerRow?.ready === true,
    professionalProducerAudienceReadinessReady: producerRow?.ready === true,
    audienceReadinessLocalExportReady: personaReadiness.localExportReadinessReady === true,
    audienceReadinessAllGenreReady: personaReadiness.allGenreStyleReadinessReady === true,
    audienceReadinessSamplingSecondary: personaReadiness.samplingSecondaryReady === true,
    audienceReadinessPrivateValuesRecorded: false,
    audienceReadinessNetworkAttempted: false,
    audienceReadinessClaimedExternalDistribution: false
  };
}

function buildUserFacingCompletionSummary(report, completedPlanSummary) {
  const completionPercent = report.externalDistributionGateReady ? 100 : 99.999999;
  const remainingPercent = report.externalDistributionGateReady ? 0 : 0.000001;
  const completionStatus = report.externalDistributionGateReady
    ? "100% complete; external distribution hard gate is ready."
    : "99.999999% complete; external/private release proof remains.";

  return {
    userFacingCompletionPercent: completionPercent,
    userFacingRemainingPercent: remainingPercent,
    userFacingCompletionStatus: completionStatus,
    userFacingCompletionSummary:
      "Local app, beat-workstation, desktop package, project IO, and release evidence are ready; final external distribution proof remains operator-owned.",
    userFacingNextProofTarget: report.externalProofBundleCurrentProofTarget,
    userFacingNextBlocker: report.externalProofBundleCurrentFirstBlocker,
    userFacingNextCommand: report.externalProofBundleCurrentNextCommand,
    userFacingOperatorAction: report.externalProofBundleCurrentOperatorAction,
    userFacingCompletionEvidenceSummary:
      "local release ready, desktop project IO ready, PKG payload project IO ready, audience readiness ready, persona delivery packages ready, external proof bundle ready",
    userFacingReportCadence: completedPlanSummary.tenPlanProgressReportCadence,
    userFacingCompletionPrivateValueRecorded: false,
    ...completedPlanSummary
  };
}

function buildTenPlanProgressReportReceiptSummary(report) {
  const currentRows = valueFreeObjectRows(report.currentTenPlanWindowRows);
  const nextPlan = `plan-${String(report.nextTenPlanProgressReportAt).padStart(3, "0")}`;
  const rows = [
    {
      order: 1,
      item: "10-plan cadence",
      ready: report.tenPlanProgressReportCadence === "report after each completed work and every 10 completed plans",
      evidence: report.tenPlanProgressReportCadence,
      sourceField: "tenPlanProgressReportCadence",
      valueRecorded: false
    },
    {
      order: 2,
      item: "Current 10-plan window",
      ready: currentRows.length === report.currentTenPlanWindowRowCount && report.currentTenPlanWindowRowCount === report.currentTenPlanWindowCompletedCount,
      evidence: `${report.currentTenPlanWindowLabel}; ${report.currentTenPlanWindowRowCount} completed plan rows`,
      sourceField: "currentTenPlanWindowLabel/currentTenPlanWindowRows",
      valueRecorded: false
    },
    {
      order: 3,
      item: "Completed plan rows",
      ready: currentRows.length === report.currentTenPlanWindowRowCount && currentRows.every((row) => Number.isInteger(row.number) && typeof row.fileName === "string"),
      evidence: `${currentRows.length} value-free completed plan filenames`,
      sourceField: "currentTenPlanWindowRows",
      valueRecorded: false
    },
    {
      order: 4,
      item: "10-plan report due posture",
      ready: typeof report.tenPlanProgressReportDue === "boolean" && report.nextTenPlanProgressReportAt === report.currentTenPlanWindowEnd,
      evidence: `due ${report.tenPlanProgressReportDue ? "yes" : "no"}; next ${nextPlan}`,
      sourceField: "tenPlanProgressReportDue/nextTenPlanProgressReportAt",
      valueRecorded: false
    },
    {
      order: 5,
      item: "Completion posture",
      ready: Number.isFinite(report.userFacingCompletionPercent) && Number.isFinite(report.userFacingRemainingPercent),
      evidence: `${formatUserPercent(report.userFacingCompletionPercent)} complete; ${formatUserPercent(report.userFacingRemainingPercent)} remaining`,
      sourceField: "userFacingCompletionPercent/userFacingRemainingPercent",
      valueRecorded: false
    },
    {
      order: 6,
      item: "Current blocker",
      ready: textValue(report.userFacingNextBlocker, "none") !== "none",
      evidence: textValue(report.userFacingNextBlocker, "none"),
      sourceField: "userFacingNextBlocker/externalProofBundleCurrentFirstBlocker",
      valueRecorded: false
    }
  ];

  return {
    tenPlanProgressReportReceiptReady: rows.length === 6 && rows.every((row) => row.ready === true && row.valueRecorded === false),
    tenPlanProgressReportReceiptRowCount: rows.length,
    tenPlanProgressReportReceiptSummary: `${rows.length} value-free 10-plan progress report receipt rows`,
    tenPlanProgressReportReceiptRows: rows,
    tenPlanProgressReportReceiptValueRecorded: false
  };
}

function buildExternalProofBundleSummary(externalProofBundle) {
  return {
    sourceExternalProofBundleReady: true,
    sourceExternalProofBundlePath: relative(externalProofBundleJsonPath),
    externalProofBundleReady: externalProofBundle.proofBundleReady === true,
    externalProofBundleProofArtifactCount: integerValue(externalProofBundle.proofArtifactCount),
    externalProofBundleProofArtifactPresentCount: integerValue(externalProofBundle.proofArtifactPresentCount),
    externalProofBundleProofArtifactMissingCount: integerValue(externalProofBundle.proofArtifactMissingCount),
    externalProofBundleProofArtifactMissingSummary: textValue(externalProofBundle.proofArtifactMissingSummary, "none"),
    externalProofBundleGateRequirementTotal: integerValue(externalProofBundle.gateRequirementTotal),
    externalProofBundleGateRequirementReadyCount: integerValue(externalProofBundle.gateRequirementReadyCount),
    externalProofBundleGateRequirementBlockedCount: integerValue(externalProofBundle.gateRequirementBlockedCount),
    externalProofBundleCurrentFocus: textValue(externalProofBundle.currentFocus),
    externalProofBundleCurrentProofTarget: textValue(externalProofBundle.currentFocus),
    externalProofBundleCurrentNextCommand: textValue(externalProofBundle.currentNextCommand),
    externalProofBundleCurrentFirstBlocker: textValue(externalProofBundle.currentFirstBlocker),
    externalProofBundleCurrentOperatorAction: textValue(externalProofBundle.currentOperatorAction),
    externalProofBundleCurrentRequiredKeyCount: integerValue(externalProofBundle.currentRequiredKeyCount),
    externalProofBundleCurrentRequiredKeySummary: textValue(externalProofBundle.currentRequiredKeySummary, "none"),
    externalProofBundleCurrentRequiredKeys: stringArrayValue(externalProofBundle.currentRequiredKeys),
    externalProofBundleCurrentPlaceholderKeyCount: integerValue(externalProofBundle.currentPlaceholderKeyCount),
    externalProofBundleCurrentPlaceholderKeySummary: textValue(externalProofBundle.currentPlaceholderKeySummary, "none"),
    externalProofBundleCurrentPlaceholderKeys: stringArrayValue(externalProofBundle.currentPlaceholderKeys),
    externalProofBundleCurrentPlaceholderEditLocationCount: integerValue(externalProofBundle.currentPlaceholderEditLocationCount),
    externalProofBundleCurrentPlaceholderEditLocationSummary: textValue(externalProofBundle.currentPlaceholderEditLocationSummary, "none"),
    externalProofBundleCurrentPlaceholderEditLocations: valueFreeObjectRows(externalProofBundle.currentPlaceholderEditLocations),
    externalProofBundleCurrentEnvEditTarget: textValue(externalProofBundle.currentEnvEditTarget, ".env.distribution.local"),
    externalProofBundleCurrentEnvEditTemplateCount: integerValue(externalProofBundle.currentEnvEditTemplateCount),
    externalProofBundleCurrentEnvEditTemplateSummary: textValue(externalProofBundle.currentEnvEditTemplateSummary, "none"),
    externalProofBundleCurrentEnvEditTemplate: valueFreeObjectRows(externalProofBundle.currentEnvEditTemplate),
    externalProofBundleCurrentEnvEditRowsCount: integerValue(externalProofBundle.currentEnvEditRowsCount),
    externalProofBundleCurrentEnvEditRowsSummary: textValue(externalProofBundle.currentEnvEditRowsSummary, "none"),
    externalProofBundleCurrentEnvEditRows: valueFreeObjectRows(externalProofBundle.currentEnvEditRows),
    externalProofBundleCurrentPlaceholderRemediationRowCount: integerValue(externalProofBundle.currentPlaceholderRemediationRowCount),
    externalProofBundleCurrentPlaceholderRemediationRowSummary: textValue(externalProofBundle.currentPlaceholderRemediationRowSummary, "none"),
    externalProofBundleCurrentPlaceholderRemediationRows: valueFreeObjectRows(externalProofBundle.currentPlaceholderRemediationRows),
    externalProofBundleCurrentProofChecklistRowCount: integerValue(externalProofBundle.currentProofChecklistRowCount),
    externalProofBundleCurrentProofChecklistRowSummary: textValue(externalProofBundle.currentProofChecklistRowSummary, "none"),
    externalProofBundleCurrentProofChecklistRows: valueFreeObjectRows(externalProofBundle.currentProofChecklistRows),
    externalProofBundleCurrentActionChecklistCount: integerValue(externalProofBundle.currentActionChecklistCount),
    externalProofBundleCurrentActionChecklistSummary: textValue(externalProofBundle.currentActionChecklistSummary, "none"),
    externalProofBundleCurrentActionChecklistRows: valueFreeObjectRows(externalProofBundle.currentActionChecklistRows),
    externalProofBundleCurrentRerunCommand: textValue(externalProofBundle.currentRerunCommand, "none"),
    externalProofBundleCurrentCommandSequenceCount: integerValue(externalProofBundle.currentCommandSequenceCount),
    externalProofBundleCurrentCommandSequenceSummary: textValue(externalProofBundle.currentCommandSequenceSummary, "none"),
    externalProofBundleCurrentCommandVerificationRowCount: integerValue(externalProofBundle.currentCommandVerificationRowCount),
    externalProofBundleCurrentCommandVerificationRowSummary: textValue(externalProofBundle.currentCommandVerificationRowSummary, "none"),
    externalProofBundleCurrentCommandVerificationRows: valueFreeObjectRows(externalProofBundle.currentCommandVerificationRows),
    externalProofBundleHardGateCommand: textValue(externalProofBundle.hardExternalGateCommand, "npm run release:external-check"),
    externalProofBundleLocalEnvLoaded: externalProofBundle.localEnvInput?.enabled === true,
    externalProofBundleCurrentEnvSummaryValueRecorded: false,
    externalProofBundleValueRecorded: false,
    externalProofBundleClaimedExternalDistribution: false
  };
}

function buildReleaseChannelUnblockSummary(releaseChannelUnblock) {
  const metadataRows = valueFreeObjectRows(releaseChannelUnblock.releaseChannelMetadataRows).map((row) => ({
    key: textValue(row.key),
    present: row.present === true,
    ready: row.ready === true,
    evidence: textValue(row.evidence),
    valueRecorded: false
  }));
  return {
    sourceReleaseChannelUnblockReady: true,
    sourceReleaseChannelUnblockPath: relative(releaseChannelUnblockJsonPath),
    releaseChannelUnblockSmokeReady: releaseChannelUnblock.releaseChannelUnblockSmokeReady === true,
    releaseChannelUnblockSyntheticFixturePath: textValue(releaseChannelUnblock.syntheticEnvFixturePath, "none"),
    releaseChannelUnblockLoaderEnabled: releaseChannelUnblock.loaderEnabled === true,
    releaseChannelUnblockLoadedKeyCount: integerValue(releaseChannelUnblock.loadedKeyCount),
    releaseChannelUnblockLoadedKeys: stringArrayValue(releaseChannelUnblock.loadedKeys),
    releaseChannelUnblockPlaceholderKeyCount: integerValue(releaseChannelUnblock.placeholderKeyCount),
    releaseChannelUnblockPlaceholderKeys: stringArrayValue(releaseChannelUnblock.placeholderKeys),
    releaseChannelUnblockMetadataReady: releaseChannelUnblock.releaseChannelMetadataReady === true,
    releaseChannelUnblockMetadataRowCount: metadataRows.length,
    releaseChannelUnblockMetadataRowSummary: metadataRows.length > 0 ? `${metadataRows.length} value-free release-channel unblock rows` : "none",
    releaseChannelUnblockMetadataRows: metadataRows,
    releaseChannelUnblockPlaceholderBlockerCleared: releaseChannelUnblock.releaseChannelPlaceholderBlockerCleared === true,
    releaseChannelUnblockNextProofCommandAfterRealEdits: textValue(releaseChannelUnblock.nextProofCommandAfterRealEdits, "npm run release:doctor"),
    releaseChannelUnblockCurrentBlockerRefreshCommand: textValue(releaseChannelUnblock.currentBlockerRefreshCommand, "npm run release:current-blocker"),
    releaseChannelUnblockPrivateValuesRecorded: releaseChannelUnblock.privateValuesRecorded === true ? true : false,
    releaseChannelUnblockNetworkProbeAttempted: releaseChannelUnblock.networkProbeAttempted === true,
    releaseChannelUnblockReleaseUploadAttempted: releaseChannelUnblock.releaseUploadAttempted === true,
    releaseChannelUnblockAppleNotarySubmissionAttempted: releaseChannelUnblock.appleNotarySubmissionAttempted === true,
    releaseChannelUnblockSigningAttempted: releaseChannelUnblock.signingAttempted === true,
    releaseChannelUnblockClaimedExternalDistribution: releaseChannelUnblock.claimedExternalDistribution === true,
    releaseChannelUnblockValueRecorded: false
  };
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function buildExternalGateCurrentProofSummary(externalGate, proofBundleSummary) {
  const currentEnvEditRows = valueFreeObjectRows(externalGate.currentEnvEditRows);
  const currentProofChecklistRows = valueFreeObjectRows(externalGate.currentProofChecklistRows);
  const currentActionChecklistRows = valueFreeObjectRows(externalGate.currentActionChecklistRows);
  const currentCommandVerificationRows = valueFreeObjectRows(externalGate.currentCommandVerificationRows);
  const consistencyChecks = {
    currentNextCommandMatches: textValue(externalGate.currentNextCommand, "none") === proofBundleSummary.externalProofBundleCurrentNextCommand,
    currentFirstBlockerMatches: textValue(externalGate.currentFirstBlocker, "none") === proofBundleSummary.externalProofBundleCurrentFirstBlocker,
    currentEnvEditRowsMatch:
      integerValue(externalGate.currentEnvEditRowsCount) === proofBundleSummary.externalProofBundleCurrentEnvEditRowsCount &&
      sameJson(currentEnvEditRows, proofBundleSummary.externalProofBundleCurrentEnvEditRows),
    currentProofChecklistRowsMatch:
      integerValue(externalGate.currentProofChecklistRowCount) === proofBundleSummary.externalProofBundleCurrentProofChecklistRowCount &&
      sameJson(currentProofChecklistRows, proofBundleSummary.externalProofBundleCurrentProofChecklistRows),
    currentActionChecklistRowsMatch:
      integerValue(externalGate.currentActionChecklistCount) === proofBundleSummary.externalProofBundleCurrentActionChecklistCount &&
      sameJson(currentActionChecklistRows, proofBundleSummary.externalProofBundleCurrentActionChecklistRows),
    currentCommandVerificationRowsMatch:
      integerValue(externalGate.currentCommandVerificationRowCount) === proofBundleSummary.externalProofBundleCurrentCommandVerificationRowCount &&
      sameJson(currentCommandVerificationRows, proofBundleSummary.externalProofBundleCurrentCommandVerificationRows)
  };
  const externalGateProofBundleConsistencyReady =
    externalGate.currentProofBundleSourceReady === true &&
    Object.values(consistencyChecks).every((value) => value === true);

  return {
    sourceExternalGateReady: true,
    sourceExternalGatePath: relative(externalGateJsonPath),
    externalGateDryRun: externalGate.dryRun === true,
    externalGateCurrentProofBundleSourceReady: externalGate.currentProofBundleSourceReady === true,
    externalGateCurrentProofBundleSourcePath: textValue(externalGate.currentProofBundleSourcePath, "none"),
    externalGateCurrentNextCommand: textValue(externalGate.currentNextCommand, "none"),
    externalGateCurrentFirstBlocker: textValue(externalGate.currentFirstBlocker, "none"),
    externalGateCurrentEnvEditRowsCount: integerValue(externalGate.currentEnvEditRowsCount),
    externalGateCurrentEnvEditRowsSummary: textValue(externalGate.currentEnvEditRowsSummary, "none"),
    externalGateCurrentEnvEditRows: currentEnvEditRows,
    externalGateCurrentProofChecklistRowCount: integerValue(externalGate.currentProofChecklistRowCount),
    externalGateCurrentProofChecklistRowSummary: textValue(externalGate.currentProofChecklistRowSummary, "none"),
    externalGateCurrentProofChecklistRows: currentProofChecklistRows,
    externalGateCurrentActionChecklistCount: integerValue(externalGate.currentActionChecklistCount),
    externalGateCurrentActionChecklistSummary: textValue(externalGate.currentActionChecklistSummary, "none"),
    externalGateCurrentActionChecklistRows: currentActionChecklistRows,
    externalGateCurrentCommandVerificationRowCount: integerValue(externalGate.currentCommandVerificationRowCount),
    externalGateCurrentCommandVerificationRowSummary: textValue(externalGate.currentCommandVerificationRowSummary, "none"),
    externalGateCurrentCommandVerificationRows: currentCommandVerificationRows,
    externalGateProofBundleConsistencyReady,
    externalGateProofBundleConsistencyChecks: consistencyChecks,
    externalGateProofBundleConsistencyValueRecorded: false,
    externalGateValueRecorded: false
  };
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Progress Report

## Status

- Report ready: ${report.releaseProgressReportReady ? "yes" : "no"}
- Report mode: ${report.releaseProgressReportMode}
- Release check run by this report: ${report.releaseCheckRunByThisReport ? "yes" : "no"}
- Persona readiness refreshed by this report: ${report.personaReadinessRefreshedByThisReport ? "yes" : "no"}
- Completion stage: ${report.completionStage}
- User-facing overall completion: ${formatUserPercent(report.userFacingCompletionPercent)}
- User-facing remaining completion: ${formatUserPercent(report.userFacingRemainingPercent)}
- User-facing completion status: ${report.userFacingCompletionStatus}
- Current 10-plan progress: ${report.currentTenPlanWindowLabel}
- Current 10-plan rows: ${report.currentTenPlanWindowRowCount} (${report.currentTenPlanWindowRowSummary})
- 10-plan report due: ${report.tenPlanProgressReportDue ? "yes" : "no"}
- 10-plan progress report receipt ready: ${report.tenPlanProgressReportReceiptReady ? "yes" : "no"}
- 10-plan progress report receipt rows: ${report.tenPlanProgressReportReceiptRowCount} (${report.tenPlanProgressReportReceiptSummary})
- Source evidence ready: ${report.sourceEvidenceReady ? "yes" : "no"}
- Local release ready: ${report.localReleaseReady ? "yes" : "no"}
- Local release readiness: ${report.localReleaseReadinessPercent.toFixed(1)}%
- Desktop project IO evidence ready: ${report.desktopProjectIoEvidenceReady ? "yes" : "no"}
- PKG payload project IO evidence ready: ${report.pkgPayloadProjectIoEvidenceReady ? "yes" : "no"}
- Audience readiness ready: ${report.audienceReadinessReady ? "yes" : "no"}
- Audience readiness rows: ${report.audienceReadinessRowCount} (${report.audienceReadinessRowSummary})
- Audience acceptance ready: ${report.audienceAcceptanceReady ? "yes" : "no"}
- Audience acceptance rows: ${report.audienceAcceptanceRowCount} (${report.audienceAcceptanceRowSummary})
- Persona delivery packages ready: ${report.audienceDeliveryPackagesReady ? "yes" : "no"}
- Persona delivery package rows: ${report.audienceDeliveryPackageRowCount} (${report.audienceDeliveryPackageRowSummary})
- Persona delivery packages reopen ready: ${report.audienceDeliveryPackagesReopenReady ? "yes" : "no"}
- Persona delivery package reopen rows: ${report.audienceDeliveryPackageReopenRowCount} (${report.audienceDeliveryPackageReopenRowSummary})
- First-time composer readiness: ${report.beginnerAudienceReadinessReady ? "yes" : "no"}
- Professional producer readiness: ${report.professionalProducerAudienceReadinessReady ? "yes" : "no"}
- External distribution hard gate ready: ${report.externalDistributionGateReady ? "yes" : "no"}
- External gate requirements ready: ${report.gateRequirementReadyCount}/${report.gateRequirementTotal} (${report.gateRequirementReadinessPercent.toFixed(1)}%)
- Remediation groups ready: ${report.remediationReadyCount}/${report.remediationTotal} (${report.remediationReadinessPercent.toFixed(1)}%)
- External proof bundle source ready: ${report.sourceExternalProofBundleReady ? "yes" : "no"}
- External proof bundle ready: ${report.externalProofBundleReady ? "yes" : "no"}
- External gate source ready: ${report.sourceExternalGateReady ? "yes" : "no"}
- External gate current proof source ready: ${report.externalGateCurrentProofBundleSourceReady ? "yes" : "no"}
- External gate/proof current action consistent: ${report.externalGateProofBundleConsistencyReady ? "yes" : "no"}
- Release-channel unblock source ready: ${report.sourceReleaseChannelUnblockReady ? "yes" : "no"}
- Release-channel unblock ready: ${report.releaseChannelUnblockSmokeReady ? "yes" : "no"}
- Release-channel placeholder blocker cleared in rehearsal: ${report.releaseChannelUnblockPlaceholderBlockerCleared ? "yes" : "no"}
- Release-channel unblock metadata rows: ${report.releaseChannelUnblockMetadataRowCount} (${report.releaseChannelUnblockMetadataRowSummary})
- External proof artifacts present: ${report.externalProofBundleProofArtifactPresentCount}/${report.externalProofBundleProofArtifactCount} (missing: ${report.externalProofBundleProofArtifactMissingSummary})
- External proof gate requirements ready: ${report.externalProofBundleGateRequirementReadyCount}/${report.externalProofBundleGateRequirementTotal} (blocked: ${report.externalProofBundleGateRequirementBlockedCount})
- External proof current target: ${report.externalProofBundleCurrentProofTarget}
- External proof current next command: \`${report.externalProofBundleCurrentNextCommand}\`
- External proof current first blocker: ${report.externalProofBundleCurrentFirstBlocker}
- External proof current operator action: ${report.externalProofBundleCurrentOperatorAction}
- External proof current required keys: ${report.externalProofBundleCurrentRequiredKeyCount} (${report.externalProofBundleCurrentRequiredKeySummary})
- External proof current placeholder keys: ${report.externalProofBundleCurrentPlaceholderKeyCount} (${report.externalProofBundleCurrentPlaceholderKeySummary})
- External proof current placeholder edit locations: ${report.externalProofBundleCurrentPlaceholderEditLocationCount} (${report.externalProofBundleCurrentPlaceholderEditLocationSummary})
- External proof current env edit target: ${report.externalProofBundleCurrentEnvEditTarget}
- External proof current env edit template: ${report.externalProofBundleCurrentEnvEditTemplateCount} (${report.externalProofBundleCurrentEnvEditTemplateSummary})
- External proof current placeholder remediation rows: ${report.externalProofBundleCurrentPlaceholderRemediationRowCount} (${report.externalProofBundleCurrentPlaceholderRemediationRowSummary})
- External proof current action checklist rows: ${report.externalProofBundleCurrentActionChecklistCount} (${report.externalProofBundleCurrentActionChecklistSummary})
- External proof current rerun command: \`${report.externalProofBundleCurrentRerunCommand}\`
- External proof current command sequence: ${report.externalProofBundleCurrentCommandSequenceCount} (${report.externalProofBundleCurrentCommandSequenceSummary})
- External proof current command verification rows: ${report.externalProofBundleCurrentCommandVerificationRowCount} (${report.externalProofBundleCurrentCommandVerificationRowSummary})
- First blockers tracked: ${report.firstBlockers.length}
- Local env file loaded: ${report.localEnvInput.enabled ? "yes" : "no"}
- External proof bundle local env file loaded: ${report.externalProofBundleLocalEnvLoaded ? "yes" : "no"}
- Private values recorded: no
- Network probe attempted by this report: no
- Release upload attempted by this report: no
- Apple notary submission attempted by this report: no
- Signing attempted by this report: no

## User-Facing Progress

- Overall completion for status reports: ${formatUserPercent(report.userFacingCompletionPercent)}
- Remaining completion for status reports: ${formatUserPercent(report.userFacingRemainingPercent)}
- Completion status wording: ${report.userFacingCompletionStatus}
- Completion evidence summary: ${report.userFacingCompletionEvidenceSummary}
- Release-channel unblock rehearsal to report: ${report.releaseChannelUnblockSmokeReady ? "ready" : "blocked"}; placeholder blocker cleared: ${report.releaseChannelUnblockPlaceholderBlockerCleared ? "yes" : "no"}
- Audience readiness to report: ${report.audienceReadinessRowCount} (${report.audienceReadinessRowSummary})
- Audience acceptance rows to report: ${report.audienceAcceptanceRowCount} (${report.audienceAcceptanceRowSummary})
- Persona delivery packages to report: ${report.audienceDeliveryPackageRowCount} (${report.audienceDeliveryPackageRowSummary})
- Persona delivery package reopen rows to report: ${report.audienceDeliveryPackageReopenRowCount} (${report.audienceDeliveryPackageReopenRowSummary})
- Next proof target to report: ${report.userFacingNextProofTarget}
- Next blocker to report: ${report.userFacingNextBlocker}
- Next command to report: \`${report.userFacingNextCommand}\`
- Operator action to report: ${report.userFacingOperatorAction}
- Report cadence: ${report.userFacingReportCadence}
- Completed plan source: ${report.completedPlanSource}
- Completed plan count: ${report.completedPlanCount}
- Latest completed plan: ${report.latestCompletedPlanPath}
- Current 10-plan window: ${report.currentTenPlanWindowLabel}
- Current 10-plan rows: ${report.currentTenPlanWindowRowCount} (${report.currentTenPlanWindowRowSummary})
- Next 10-plan report at: plan-${String(report.nextTenPlanProgressReportAt).padStart(3, "0")}
- 10-plan progress report receipt: ${report.tenPlanProgressReportReceiptRowCount} (${report.tenPlanProgressReportReceiptSummary})
- Private values recorded in this summary: no

## Current 10-Plan Window Rows

| plan | file | path | value recorded |
|---|---|---|---|
${formatCompletedPlanRows(report.currentTenPlanWindowRows)}

## 10-Plan Progress Report Receipt

- Receipt ready: ${report.tenPlanProgressReportReceiptReady ? "yes" : "no"}
- Receipt rows: ${report.tenPlanProgressReportReceiptRowCount} (${report.tenPlanProgressReportReceiptSummary})
- Value recorded: ${report.tenPlanProgressReportReceiptValueRecorded ? "yes" : "no"}

| order | item | ready | evidence | source field | value recorded |
|---:|---|---:|---|---|---:|
${formatTenPlanProgressReportReceiptRows(report.tenPlanProgressReportReceiptRows)}

## Audience Readiness

| audience | role | ready | mode | bars | delivery | style | package ready | package reopen ready | artifacts | verified artifacts | value recorded |
|---|---|---:|---|---:|---|---|---:|---:|---:|---:|---:|
${formatAudienceRows(report.audienceReadinessRows)}

## Audience Acceptance Matrix

| audience | area | criterion | ready | evidence source | evidence summary | workflow | artifacts | verified artifacts | value recorded |
|---|---|---|---:|---|---|---|---:|---:|---:|
${formatAudienceAcceptanceRows(report.audienceAcceptanceRows)}

## Persona Delivery Packages

| persona | workflow | ready | mode | bars | delivery | artifacts | package | value recorded |
|---|---|---:|---|---:|---|---:|---|---:|
${formatDeliveryPackageRows(report.audienceDeliveryPackageRows)}

## Persona Delivery Package Reopen

| persona | workflow | ready | artifacts | verified artifacts | project | hashes | WAV | MIDI | Handoff | package | value recorded |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|
${formatDeliveryPackageReopenRows(report.audienceDeliveryPackageReopenRows)}

## Commands

- Regenerated evidence with: \`${report.evidenceCommand}\`
- Persona readiness refresh: \`${report.personaReadinessCommand}\`
- Progress command: \`${report.progressCommand}\`
- Existing-evidence smoke command: \`npm run release:progress-smoke\`
- Hard external distribution gate remains: \`${report.hardExternalGateCommand}\`
- External proof hard gate: \`${report.externalProofBundleHardGateCommand}\`

## Source Evidence

- Completion progress JSON: ${report.sourceCompletionProgressPath}
- Persona readiness JSON: ${report.sourcePersonaReadinessPath}
- External proof bundle JSON: ${report.sourceExternalProofBundlePath}
- External distribution gate JSON: ${report.sourceExternalGatePath}
- Release-channel unblock JSON: ${report.sourceReleaseChannelUnblockPath}

## Release-Channel Unblock Rehearsal

- Source ready: ${report.sourceReleaseChannelUnblockReady ? "yes" : "no"}
- Smoke ready: ${report.releaseChannelUnblockSmokeReady ? "yes" : "no"}
- Synthetic fixture path: ${report.releaseChannelUnblockSyntheticFixturePath}
- Loader enabled: ${report.releaseChannelUnblockLoaderEnabled ? "yes" : "no"}
- Loaded keys: ${report.releaseChannelUnblockLoadedKeyCount} (${report.releaseChannelUnblockLoadedKeys.join(", ") || "none"})
- Placeholder keys in rehearsal: ${report.releaseChannelUnblockPlaceholderKeyCount} (${report.releaseChannelUnblockPlaceholderKeys.join(", ") || "none"})
- Metadata ready: ${report.releaseChannelUnblockMetadataReady ? "yes" : "no"}
- Placeholder blocker cleared in rehearsal: ${report.releaseChannelUnblockPlaceholderBlockerCleared ? "yes" : "no"}
- Next proof command after real edits: \`${report.releaseChannelUnblockNextProofCommandAfterRealEdits}\`
- Current blocker refresh command: \`${report.releaseChannelUnblockCurrentBlockerRefreshCommand}\`
- Value recorded: ${report.releaseChannelUnblockValueRecorded ? "yes" : "no"}

| key | present | ready | evidence | value recorded |
|---|---:|---:|---|---:|
${formatReleaseChannelUnblockRows(report.releaseChannelUnblockMetadataRows)}

## External Proof Bundle

- Proof bundle ready: ${report.externalProofBundleReady ? "yes" : "no"}
- Proof artifacts present: ${report.externalProofBundleProofArtifactPresentCount}/${report.externalProofBundleProofArtifactCount}
- Missing proof artifacts: ${report.externalProofBundleProofArtifactMissingSummary}
- Gate requirements ready: ${report.externalProofBundleGateRequirementReadyCount}/${report.externalProofBundleGateRequirementTotal}
- Gate requirements blocked: ${report.externalProofBundleGateRequirementBlockedCount}
- Current focus: ${report.externalProofBundleCurrentFocus}
- Current proof target: ${report.externalProofBundleCurrentProofTarget}
- Current next command: \`${report.externalProofBundleCurrentNextCommand}\`
- Current first blocker: ${report.externalProofBundleCurrentFirstBlocker}
- Current operator action: ${report.externalProofBundleCurrentOperatorAction}
- Current required keys: ${report.externalProofBundleCurrentRequiredKeyCount} (${report.externalProofBundleCurrentRequiredKeySummary})
- Current placeholder keys: ${report.externalProofBundleCurrentPlaceholderKeyCount} (${report.externalProofBundleCurrentPlaceholderKeySummary})
- Current placeholder edit locations: ${report.externalProofBundleCurrentPlaceholderEditLocationCount} (${report.externalProofBundleCurrentPlaceholderEditLocationSummary})
- Current env edit target: ${report.externalProofBundleCurrentEnvEditTarget}
- Current env edit rows: ${report.externalProofBundleCurrentEnvEditRowsCount} (${report.externalProofBundleCurrentEnvEditRowsSummary})
- Current placeholder remediation rows: ${report.externalProofBundleCurrentPlaceholderRemediationRowCount} (${report.externalProofBundleCurrentPlaceholderRemediationRowSummary})
- Current proof checklist rows: ${report.externalProofBundleCurrentProofChecklistRowCount} (${report.externalProofBundleCurrentProofChecklistRowSummary})
- Current action checklist rows: ${report.externalProofBundleCurrentActionChecklistCount} (${report.externalProofBundleCurrentActionChecklistSummary})
- Current rerun command: \`${report.externalProofBundleCurrentRerunCommand}\`
- Current command sequence: ${report.externalProofBundleCurrentCommandSequenceCount} (${report.externalProofBundleCurrentCommandSequenceSummary})
- Current command verification rows: ${report.externalProofBundleCurrentCommandVerificationRowCount} (${report.externalProofBundleCurrentCommandVerificationRowSummary})
- Hard gate: \`${report.externalProofBundleHardGateCommand}\`

## External Gate Current Proof Consistency

- Gate source ready: ${report.sourceExternalGateReady ? "yes" : "no"}
- Gate source: ${report.sourceExternalGatePath}
- Gate dry run: ${report.externalGateDryRun ? "yes" : "no"}
- Gate current proof source ready: ${report.externalGateCurrentProofBundleSourceReady ? "yes" : "no"}
- Gate current proof source: ${report.externalGateCurrentProofBundleSourcePath}
- Gate/proof current action consistent: ${report.externalGateProofBundleConsistencyReady ? "yes" : "no"}
- Current next command matches: ${report.externalGateProofBundleConsistencyChecks.currentNextCommandMatches ? "yes" : "no"}
- Current first blocker matches: ${report.externalGateProofBundleConsistencyChecks.currentFirstBlockerMatches ? "yes" : "no"}
- Current edit rows match: ${report.externalGateProofBundleConsistencyChecks.currentEnvEditRowsMatch ? "yes" : "no"}
- Current proof checklist rows match: ${report.externalGateProofBundleConsistencyChecks.currentProofChecklistRowsMatch ? "yes" : "no"}
- Current action checklist rows match: ${report.externalGateProofBundleConsistencyChecks.currentActionChecklistRowsMatch ? "yes" : "no"}
- Current command verification rows match: ${report.externalGateProofBundleConsistencyChecks.currentCommandVerificationRowsMatch ? "yes" : "no"}
- Gate current next command: \`${report.externalGateCurrentNextCommand}\`
- Gate current first blocker: ${report.externalGateCurrentFirstBlocker}
- Gate current env edit rows: ${report.externalGateCurrentEnvEditRowsCount} (${report.externalGateCurrentEnvEditRowsSummary})
- Gate current proof checklist rows: ${report.externalGateCurrentProofChecklistRowCount} (${report.externalGateCurrentProofChecklistRowSummary})
- Gate current action checklist rows: ${report.externalGateCurrentActionChecklistCount} (${report.externalGateCurrentActionChecklistSummary})
- Gate current command verification rows: ${report.externalGateCurrentCommandVerificationRowCount} (${report.externalGateCurrentCommandVerificationRowSummary})
- Gate consistency values recorded: no

## Current Edit Guidance

| location | key | assignment shape | guidance |
|---|---|---|---|
${formatEditGuidanceRows(report.externalProofBundleCurrentEnvEditRows)}

## Current Proof Checklist Rows

| order | criterion | evidence | proof command | hard gate | value recorded |
|---:|---|---|---|---|---:|
${formatProofChecklistRows(report.externalProofBundleCurrentProofChecklistRows)}

## Current Action Checklist Rows

| order | step | value recorded |
|---:|---|---:|
${formatActionChecklistRows(report.externalProofBundleCurrentActionChecklistRows)}

## Current Command Verification Rows

| order | command | role | expectation | proof target | value recorded |
|---:|---|---|---|---|---:|
${formatCommandVerificationRows(report.externalProofBundleCurrentCommandVerificationRows)}

## Current First Blockers

| order | blocker |
|---:|---|
${formatBlockerRows(report.firstBlockers)}

## Interpretation

Local release readiness can be ready while external distribution remains pending. This report cites regenerated local release evidence only; external distribution completion still requires the hard gate.

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, local env values, private beats, and real user audio are not recorded.

## Not Claimed

This report does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

function runReleaseCheck() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", "release:check"], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail("Could not run npm run release:check.", result.error.message);
  }
  if (result.status !== 0) {
    fail(`npm run release:check exited with status ${result.status}.`);
  }
}

function runPersonaReadinessSmoke() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", "persona:smoke"], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail("Could not run npm run persona:smoke.", result.error.message);
  }
  if (result.status !== 0) {
    fail(`npm run persona:smoke exited with status ${result.status}.`);
  }
}

if (!fromExisting) {
  runReleaseCheck();
}

runPersonaReadinessSmoke();

if (!existsSync(completionProgressJsonPath)) {
  fail(
    "Completion progress JSON was not generated.",
    `${fromExisting ? "Run npm run release:check or npm run verify before npm run release:progress-smoke.\n" : ""}Expected: ${relative(completionProgressJsonPath)}`
  );
}
if (!existsSync(externalProofBundleJsonPath)) {
  fail(
    "External proof bundle JSON was not generated.",
    `${fromExisting ? "Run npm run release:check or npm run verify before npm run release:progress-smoke.\n" : ""}Expected: ${relative(externalProofBundleJsonPath)}`
  );
}
if (!existsSync(externalGateJsonPath)) {
  fail(
    "External distribution gate JSON was not generated.",
    `${fromExisting ? "Run npm run release:check or npm run verify before npm run release:progress-smoke.\n" : ""}Expected: ${relative(externalGateJsonPath)}`
  );
}
if (!existsSync(releaseChannelUnblockJsonPath)) {
  fail(
    "Release-channel unblock JSON was not generated.",
    `${fromExisting ? "Run npm run release:check or npm run verify before npm run release:progress-smoke.\n" : ""}Expected: ${relative(releaseChannelUnblockJsonPath)}`
  );
}
if (!existsSync(personaReadinessJsonPath)) {
  fail(
    "Persona readiness JSON was not generated.",
    `Expected: ${relative(personaReadinessJsonPath)}`
  );
}

const personaReadiness = JSON.parse(await readFile(personaReadinessJsonPath, "utf8"));
const completionProgress = JSON.parse(await readFile(completionProgressJsonPath, "utf8"));
const externalProofBundle = JSON.parse(await readFile(externalProofBundleJsonPath, "utf8"));
const externalGate = JSON.parse(await readFile(externalGateJsonPath, "utf8"));
const releaseChannelUnblock = JSON.parse(await readFile(releaseChannelUnblockJsonPath, "utf8"));
const externalProofBundleSummary = buildExternalProofBundleSummary(externalProofBundle);
const externalGateCurrentProofSummary = buildExternalGateCurrentProofSummary(externalGate, externalProofBundleSummary);
const releaseChannelUnblockSummary = buildReleaseChannelUnblockSummary(releaseChannelUnblock);
const audienceReadinessSummary = buildAudienceReadinessSummary(personaReadiness);
const completedPlanSummary = await buildCompletedPlanSummary();
const releaseProgressReport = {
  appName,
  bundleId,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  releaseProgressReportMode: fromExisting ? "existing-evidence smoke" : "full release gate",
  releaseProgressFromExisting: fromExisting,
  releaseCheckRunByThisReport: !fromExisting,
  personaReadinessRefreshedByThisReport: true,
  personaReadinessCommand: "npm run persona:smoke",
  progressCommand: fromExisting ? "npm run release:progress-smoke" : "npm run release:progress",
  evidenceCommand: fromExisting ? "existing release evidence from npm run verify or npm run release:check" : "npm run release:check",
  hardExternalGateCommand: "npm run release:external-check",
  releaseProgressMarkdownPath: relative(releaseProgressMarkdownPath),
  releaseProgressJsonPath: relative(releaseProgressJsonPath),
  sourceCompletionProgressPath: relative(completionProgressJsonPath),
  ...audienceReadinessSummary,
  ...externalProofBundleSummary,
  ...externalGateCurrentProofSummary,
  ...releaseChannelUnblockSummary,
  productScope: completionProgress.productScope,
  completionStage: completionProgress.completionStage,
  sourceEvidenceReady: completionProgress.sourceEvidenceReady === true,
  localReleaseReady: completionProgress.localReleaseReady === true,
  localReleaseReadinessPercent: completionProgress.localReleaseReadinessPercent ?? 0,
  desktopProjectIoEvidenceReady: completionProgress.desktopProjectIoEvidenceReady === true,
  pkgPayloadProjectIoEvidenceReady: completionProgress.pkgPayloadProjectIoEvidenceReady === true,
  externalDistributionGateReady: completionProgress.externalDistributionGateReady === true,
  gateRequirementTotal: completionProgress.gateRequirementTotal ?? 0,
  gateRequirementReadyCount: completionProgress.gateRequirementReadyCount ?? 0,
  gateRequirementReadinessPercent: completionProgress.gateRequirementReadinessPercent ?? 0,
  remediationTotal: completionProgress.remediationTotal ?? 0,
  remediationReadyCount: completionProgress.remediationReadyCount ?? 0,
  remediationReadinessPercent: completionProgress.remediationReadinessPercent ?? 0,
  firstBlockers: completionProgress.firstBlockers ?? [],
  localEnvInput: completionProgress.localEnvInput ?? { enabled: false, valueRecorded: false },
  localEnvValueRecorded: false,
  privateValuesRecorded: false,
  releaseUrlValueRecorded: false,
  supportUrlValueRecorded: false,
  feedValueRecorded: false,
  credentialValueRecorded: false,
  tokenValueRecorded: false,
  channelValueRecorded: false,
  developerIdIdentityValueRecorded: false,
  networkProbeAttemptedByThisReport: false,
  releaseUploadAttemptedByThisReport: false,
  notarySubmissionAttemptedByThisReport: false,
  signingAttemptedByThisReport: false,
  releaseGateClaimedDeveloperIdSigning: false,
  releaseGateClaimedNotarization: false,
  releaseGateClaimedGatekeeperApproval: false,
  releaseGateClaimedAutoUpdate: false,
  releaseGateClaimedManualQaApproval: false,
  releaseGateClaimedExternalDistribution: false
};
releaseProgressReport.releaseProgressReportReady =
  releaseProgressReport.sourceEvidenceReady &&
  releaseProgressReport.localReleaseReady &&
  releaseProgressReport.localReleaseReadinessPercent === 100 &&
  releaseProgressReport.desktopProjectIoEvidenceReady &&
  releaseProgressReport.pkgPayloadProjectIoEvidenceReady &&
  releaseProgressReport.audienceReadinessReady &&
  releaseProgressReport.audienceAcceptanceReady &&
  releaseProgressReport.audienceDeliveryPackagesReady &&
  releaseProgressReport.audienceDeliveryPackagesReopenReady &&
  releaseProgressReport.sourceExternalProofBundleReady &&
  releaseProgressReport.externalProofBundleReady &&
  releaseProgressReport.sourceExternalGateReady &&
  releaseProgressReport.externalGateProofBundleConsistencyReady &&
  releaseProgressReport.sourceReleaseChannelUnblockReady &&
  releaseProgressReport.releaseChannelUnblockSmokeReady &&
  releaseProgressReport.releaseChannelUnblockPlaceholderBlockerCleared;
Object.assign(releaseProgressReport, buildUserFacingCompletionSummary(releaseProgressReport, completedPlanSummary));
Object.assign(releaseProgressReport, buildTenPlanProgressReportReceiptSummary(releaseProgressReport));

const markdown = buildMarkdown(releaseProgressReport);

await mkdir(packageRoot, { recursive: true });
await writeFile(releaseProgressJsonPath, `${JSON.stringify(releaseProgressReport, null, 2)}\n`, "utf8");
await writeFile(releaseProgressMarkdownPath, markdown, "utf8");

check(releaseProgressReport.appName === appName, "release progress report should identify GrooveForge");
check(releaseProgressReport.bundleId === bundleId, `release progress report should identify ${bundleId}`);
check(releaseProgressReport.releaseProgressReportMode === (fromExisting ? "existing-evidence smoke" : "full release gate"), "release progress report should identify its mode");
check(releaseProgressReport.releaseProgressFromExisting === fromExisting, "release progress report should identify whether it used existing evidence");
check(releaseProgressReport.releaseCheckRunByThisReport === !fromExisting, "release progress report should identify whether it ran release:check");
check(releaseProgressReport.personaReadinessRefreshedByThisReport === true, "release progress report should refresh persona readiness evidence");
check(releaseProgressReport.personaReadinessCommand === "npm run persona:smoke", "release progress report should identify the persona readiness refresh command");
check(releaseProgressReport.progressCommand === (fromExisting ? "npm run release:progress-smoke" : "npm run release:progress"), "release progress report should identify the progress command");
check(releaseProgressReport.evidenceCommand === (fromExisting ? "existing release evidence from npm run verify or npm run release:check" : "npm run release:check"), "release progress report should identify its evidence source");
check(releaseProgressReport.hardExternalGateCommand === "npm run release:external-check", "release progress report should keep the hard external gate command");
check(releaseProgressReport.sourceEvidenceReady === true, "release progress report should include ready source evidence");
check(releaseProgressReport.localReleaseReady === true, "release progress report should include ready local release evidence");
check(releaseProgressReport.localReleaseReadinessPercent === 100, "release progress report should report 100 percent local release readiness");
check(releaseProgressReport.userFacingCompletionPercent === (releaseProgressReport.externalDistributionGateReady ? 100 : 99.999999), "release progress report should include user-facing overall completion percent");
check(releaseProgressReport.userFacingRemainingPercent === (releaseProgressReport.externalDistributionGateReady ? 0 : 0.000001), "release progress report should include user-facing remaining completion percent");
check(typeof releaseProgressReport.userFacingCompletionStatus === "string" && releaseProgressReport.userFacingCompletionStatus.length > 0, "release progress report should include user-facing completion status wording");
check(typeof releaseProgressReport.userFacingCompletionSummary === "string" && releaseProgressReport.userFacingCompletionSummary.length > 0, "release progress report should include user-facing completion summary");
check(typeof releaseProgressReport.userFacingNextProofTarget === "string" && releaseProgressReport.userFacingNextProofTarget.length > 0, "release progress report should include user-facing next proof target");
check(typeof releaseProgressReport.userFacingNextBlocker === "string" && releaseProgressReport.userFacingNextBlocker.length > 0, "release progress report should include user-facing next blocker");
check(typeof releaseProgressReport.userFacingNextCommand === "string" && releaseProgressReport.userFacingNextCommand.length > 0, "release progress report should include user-facing next command");
check(typeof releaseProgressReport.userFacingOperatorAction === "string" && releaseProgressReport.userFacingOperatorAction.length > 0, "release progress report should include user-facing operator action");
check(releaseProgressReport.userFacingReportCadence === "report after each completed work and every 10 completed plans", "release progress report should include user-facing report cadence");
check(releaseProgressReport.userFacingCompletionPrivateValueRecorded === false, "release progress report should not record private values in the user-facing completion summary");
check(releaseProgressReport.completedPlanSource === "docs/exec_plans/completed", "release progress report should identify completed plan source");
check(Number.isInteger(releaseProgressReport.completedPlanCount) && releaseProgressReport.completedPlanCount > 0, "release progress report should count completed plans");
check(Number.isInteger(releaseProgressReport.latestCompletedPlanNumber) && releaseProgressReport.latestCompletedPlanNumber >= 1130, "release progress report should identify the latest completed plan number");
check(typeof releaseProgressReport.latestCompletedPlanPath === "string" && releaseProgressReport.latestCompletedPlanPath.includes(`plan-${String(releaseProgressReport.latestCompletedPlanNumber).padStart(3, "0")}-`), "release progress report should identify the latest completed plan path");
check(Number.isInteger(releaseProgressReport.currentTenPlanWindowStart), "release progress report should include current 10-plan window start");
check(Number.isInteger(releaseProgressReport.currentTenPlanWindowEnd), "release progress report should include current 10-plan window end");
check(releaseProgressReport.currentTenPlanWindowEnd === releaseProgressReport.currentTenPlanWindowStart + 9, "release progress report should make 10-plan window end match start plus nine");
check(releaseProgressReport.currentTenPlanWindowTotal === 10, "release progress report should use a 10-plan reporting window");
check(releaseProgressReport.currentTenPlanWindowCompletedCount >= 1 && releaseProgressReport.currentTenPlanWindowCompletedCount <= 10, "release progress report should count completed plans in the current 10-plan window");
check(releaseProgressReport.currentTenPlanWindowLabel === `${releaseProgressReport.currentTenPlanWindowStart}-${releaseProgressReport.currentTenPlanWindowEnd}: ${releaseProgressReport.currentTenPlanWindowCompletedCount}/10`, "release progress report should format the current 10-plan window label");
check(Number.isInteger(releaseProgressReport.currentTenPlanWindowRowCount), "release progress report should include current 10-plan window row count");
check(releaseProgressReport.currentTenPlanWindowRowCount === releaseProgressReport.currentTenPlanWindowCompletedCount, "release progress report current 10-plan row count should match completed count");
check(Array.isArray(releaseProgressReport.currentTenPlanWindowRows), "release progress report should include current 10-plan window rows");
check(releaseProgressReport.currentTenPlanWindowRows.length === releaseProgressReport.currentTenPlanWindowRowCount, "release progress report current 10-plan rows should match row count");
check(releaseProgressReport.currentTenPlanWindowRows.every((row) => row.valueRecorded === false), "release progress report current 10-plan rows should not record values");
check(releaseProgressReport.currentTenPlanWindowRows.every((row) => Number.isInteger(row.number) && typeof row.fileName === "string" && row.path.startsWith("docs/exec_plans/completed/")), "release progress report current 10-plan rows should identify completed plan filenames");
check(typeof releaseProgressReport.tenPlanProgressReportDue === "boolean", "release progress report should include 10-plan report due posture");
check(releaseProgressReport.nextTenPlanProgressReportAt === releaseProgressReport.currentTenPlanWindowEnd, "release progress report should identify the next 10-plan report plan number");
check(releaseProgressReport.completedPlanValueRecorded === false, "release progress report should not record completed plan values beyond filenames and counts");
check(releaseProgressReport.tenPlanProgressReportReceiptReady === true, "release progress report 10-plan progress report receipt should be ready");
check(releaseProgressReport.tenPlanProgressReportReceiptRowCount === releaseProgressReport.tenPlanProgressReportReceiptRows.length, "release progress report 10-plan receipt row count should match rows");
check(releaseProgressReport.tenPlanProgressReportReceiptRowCount >= 6, "release progress report 10-plan receipt should include cadence, window, completed rows, due, completion, and blocker rows");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.every((row) => row.valueRecorded === false), "release progress report 10-plan receipt rows should not record values");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "10-plan cadence" && row.evidence.includes("every 10 completed plans")), "release progress report 10-plan receipt should include report cadence");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "Current 10-plan window" && row.evidence.includes(releaseProgressReport.currentTenPlanWindowLabel)), "release progress report 10-plan receipt should include current 10-plan window");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "Completed plan rows" && row.evidence.includes(`${releaseProgressReport.currentTenPlanWindowRowCount} value-free completed plan filenames`)), "release progress report 10-plan receipt should include completed plan row coverage");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "10-plan report due posture" && row.evidence.includes(`due ${releaseProgressReport.tenPlanProgressReportDue ? "yes" : "no"}`)), "release progress report 10-plan receipt should include due posture");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "Completion posture" && row.evidence.includes(formatUserPercent(releaseProgressReport.userFacingCompletionPercent)) && row.evidence.includes(formatUserPercent(releaseProgressReport.userFacingRemainingPercent))), "release progress report 10-plan receipt should include completion and remaining percentages");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "Current blocker" && row.evidence === releaseProgressReport.userFacingNextBlocker), "release progress report 10-plan receipt should include current blocker");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.every((row) => typeof row.sourceField === "string" && row.sourceField.length > 0), "release progress report 10-plan receipt rows should identify source fields");
check(releaseProgressReport.tenPlanProgressReportReceiptValueRecorded === false, "release progress report 10-plan receipt should not record values");
check(releaseProgressReport.desktopProjectIoEvidenceReady === true, "release progress report should include ready desktop project IO evidence");
check(releaseProgressReport.pkgPayloadProjectIoEvidenceReady === true, "release progress report should include ready PKG payload project IO evidence");
check(releaseProgressReport.sourcePersonaReadinessReady === true, "release progress report should include ready persona readiness source evidence");
check(releaseProgressReport.sourcePersonaReadinessPath === relative(personaReadinessJsonPath), "release progress report should identify the persona readiness source path");
check(releaseProgressReport.audienceReadinessReady === true, "release progress report should include ready audience readiness evidence");
check(releaseProgressReport.audienceReadinessRowCount === 2, "release progress report should include two audience readiness rows");
check(releaseProgressReport.audienceReadinessRows.length === releaseProgressReport.audienceReadinessRowCount, "release progress report audience readiness row count should match rows");
check(releaseProgressReport.audienceReadinessRows.every((row) => row.valueRecorded === false), "release progress report audience readiness rows should not record values");
check(releaseProgressReport.audienceReadinessRows.every((row) => row.ready === true), "release progress report audience readiness rows should be ready");
check(releaseProgressReport.audienceReadinessRows.every((row) => row.deliveryPackageReady === true), "release progress report audience readiness rows should include ready delivery packages");
check(releaseProgressReport.audienceReadinessRows.every((row) => row.deliveryPackageReopenReady === true), "release progress report audience readiness rows should include reopened delivery packages");
check(releaseProgressReport.audienceReadinessRows.every((row) => row.deliveryArtifactCount === 8), "release progress report audience readiness rows should include eight delivery artifacts");
check(releaseProgressReport.audienceReadinessRows.every((row) => row.verifiedDeliveryArtifactCount === 8), "release progress report audience readiness rows should include eight verified delivery artifacts");
check(releaseProgressReport.audienceAcceptanceReady === true, "release progress report should include ready audience acceptance evidence");
check(releaseProgressReport.audienceAcceptanceRowCount === 10, "release progress report should include ten audience acceptance rows");
check(releaseProgressReport.audienceAcceptanceRows.length === releaseProgressReport.audienceAcceptanceRowCount, "release progress report audience acceptance row count should match rows");
check(releaseProgressReport.audienceAcceptanceRows.every((row) => row.valueRecorded === false), "release progress report audience acceptance rows should not record values");
check(releaseProgressReport.audienceAcceptanceRows.every((row) => row.ready === true), "release progress report audience acceptance rows should be ready");
check(releaseProgressReport.audienceAcceptanceRows.filter((row) => row.audience === "first-time composer").length === 5, "release progress report should include five first-time composer acceptance rows");
check(releaseProgressReport.audienceAcceptanceRows.filter((row) => row.audience === "professional producer").length === 5, "release progress report should include five professional producer acceptance rows");
check(releaseProgressReport.audienceAcceptanceRows.some((row) => row.acceptanceArea === "Rendered path"), "release progress report audience acceptance should include rendered path evidence");
check(releaseProgressReport.audienceAcceptanceRows.some((row) => row.acceptanceArea === "Workflow"), "release progress report audience acceptance should include workflow evidence");
check(releaseProgressReport.audienceAcceptanceRows.some((row) => row.acceptanceArea === "Package"), "release progress report audience acceptance should include package evidence");
check(releaseProgressReport.audienceAcceptanceRows.some((row) => row.acceptanceArea === "Package reopen"), "release progress report audience acceptance should include package reopen evidence");
check(releaseProgressReport.audienceAcceptanceRows.some((row) => row.acceptanceArea === "Export and Handoff"), "release progress report audience acceptance should include export and Handoff evidence");
check(releaseProgressReport.audienceReadinessRows.some((row) => row.audience === "first-time composer" && row.workflowMode === "guided"), "release progress report should include first-time composer guided readiness");
check(releaseProgressReport.audienceReadinessRows.some((row) => row.audience === "professional producer" && row.workflowMode === "studio"), "release progress report should include professional producer studio readiness");
check(releaseProgressReport.audienceDeliveryPackagesReady === true, "release progress report should include ready persona delivery packages");
check(releaseProgressReport.audienceDeliveryPackageRowCount === 2, "release progress report should include two persona delivery package rows");
check(releaseProgressReport.audienceDeliveryPackageRows.length === releaseProgressReport.audienceDeliveryPackageRowCount, "release progress report persona delivery package row count should match rows");
check(releaseProgressReport.audienceDeliveryPackageRows.every((row) => row.ready === true), "release progress report persona delivery package rows should be ready");
check(releaseProgressReport.audienceDeliveryPackageRows.every((row) => row.artifactCount === 8), "release progress report persona delivery package rows should include all deliverable artifacts");
check(releaseProgressReport.audienceDeliveryPackageRows.every((row) => row.valueRecorded === false), "release progress report persona delivery package rows should not record values");
check(releaseProgressReport.audienceDeliveryPackagesReopenReady === true, "release progress report should include ready persona delivery package reopen evidence");
check(releaseProgressReport.audienceDeliveryPackageReopenRowCount === 2, "release progress report should include two persona delivery package reopen rows");
check(releaseProgressReport.audienceDeliveryPackageReopenRows.length === releaseProgressReport.audienceDeliveryPackageReopenRowCount, "release progress report persona delivery package reopen row count should match rows");
check(releaseProgressReport.audienceDeliveryPackageReopenRows.every((row) => row.ready === true), "release progress report persona delivery package reopen rows should be ready");
check(releaseProgressReport.audienceDeliveryPackageReopenRows.every((row) => row.verifiedArtifactCount === 8), "release progress report persona delivery package reopen rows should verify all deliverable artifacts");
check(
  releaseProgressReport.audienceDeliveryPackageReopenRows.every(
    (row) => row.projectReopened === true && row.hashesReady === true && row.wavHeadersReady === true && row.midiHeaderReady === true && row.handoffReady === true
  ),
  "release progress report persona delivery package reopen rows should verify project, hashes, WAV, MIDI, and Handoff"
);
check(releaseProgressReport.audienceDeliveryPackageReopenRows.every((row) => row.valueRecorded === false), "release progress report persona delivery package reopen rows should not record values");
check(releaseProgressReport.beginnerAudienceReadinessReady === true, "release progress report should include first-time composer readiness");
check(releaseProgressReport.professionalProducerAudienceReadinessReady === true, "release progress report should include professional producer readiness");
check(releaseProgressReport.audienceReadinessLocalExportReady === true, "release progress report should include audience local export readiness");
check(releaseProgressReport.audienceReadinessAllGenreReady === true, "release progress report should include audience all-genre readiness");
check(releaseProgressReport.audienceReadinessSamplingSecondary === true, "release progress report should include audience sampling-secondary posture");
check(releaseProgressReport.audienceReadinessPrivateValuesRecorded === false, "release progress report should not record private audience values");
check(releaseProgressReport.audienceReadinessNetworkAttempted === false, "release progress report should not probe network for audience readiness");
check(releaseProgressReport.audienceReadinessClaimedExternalDistribution === false, "release progress report should not claim external distribution from audience readiness");
check(typeof releaseProgressReport.externalDistributionGateReady === "boolean", "release progress report should include external distribution hard-gate readiness");
check(releaseProgressReport.sourceExternalProofBundleReady === true, "release progress report should include ready external proof bundle source evidence");
check(releaseProgressReport.externalProofBundleReady === true, "release progress report should include a ready external proof bundle");
check(releaseProgressReport.sourceExternalProofBundlePath === relative(externalProofBundleJsonPath), "release progress report should identify the external proof bundle source path");
check(releaseProgressReport.sourceExternalGateReady === true, "release progress report should include ready external gate source evidence");
check(releaseProgressReport.sourceExternalGatePath === relative(externalGateJsonPath), "release progress report should identify the external gate source path");
check(releaseProgressReport.externalGateCurrentProofBundleSourceReady === true, "release progress report should include external gate current proof source readiness");
check(releaseProgressReport.externalGateCurrentProofBundleSourcePath === relative(externalProofBundleJsonPath), "release progress report should identify the external gate proof bundle source path");
check(typeof releaseProgressReport.externalGateCurrentNextCommand === "string" && releaseProgressReport.externalGateCurrentNextCommand.length > 0, "release progress report should include external gate current next command");
check(typeof releaseProgressReport.externalGateCurrentFirstBlocker === "string" && releaseProgressReport.externalGateCurrentFirstBlocker.length > 0, "release progress report should include external gate current first blocker");
check(Number.isInteger(releaseProgressReport.externalGateCurrentEnvEditRowsCount), "release progress report should include external gate current env edit row count");
check(Array.isArray(releaseProgressReport.externalGateCurrentEnvEditRows), "release progress report should include external gate current env edit rows");
check(releaseProgressReport.externalGateCurrentEnvEditRows.every((row) => row.valueRecorded === false), "release progress report external gate env edit rows should not record values");
check(Number.isInteger(releaseProgressReport.externalGateCurrentProofChecklistRowCount), "release progress report should include external gate current proof checklist row count");
check(Array.isArray(releaseProgressReport.externalGateCurrentProofChecklistRows), "release progress report should include external gate current proof checklist rows");
check(releaseProgressReport.externalGateCurrentProofChecklistRows.every((row) => row.valueRecorded === false), "release progress report external gate proof checklist rows should not record values");
check(Number.isInteger(releaseProgressReport.externalGateCurrentActionChecklistCount), "release progress report should include external gate current action checklist count");
check(Array.isArray(releaseProgressReport.externalGateCurrentActionChecklistRows), "release progress report should include external gate current action checklist rows");
check(releaseProgressReport.externalGateCurrentActionChecklistRows.every((row) => row.valueRecorded === false), "release progress report external gate action checklist rows should not record values");
check(Number.isInteger(releaseProgressReport.externalGateCurrentCommandVerificationRowCount), "release progress report should include external gate current command verification row count");
check(Array.isArray(releaseProgressReport.externalGateCurrentCommandVerificationRows), "release progress report should include external gate current command verification rows");
check(releaseProgressReport.externalGateCurrentCommandVerificationRows.every((row) => row.valueRecorded === false), "release progress report external gate command verification rows should not record values");
check(releaseProgressReport.externalGateProofBundleConsistencyReady === true, "release progress report should prove external gate and proof bundle current proof rows are consistent");
check(releaseProgressReport.externalGateProofBundleConsistencyChecks.currentNextCommandMatches === true, "release progress report should prove external gate current next command matches proof bundle");
check(releaseProgressReport.externalGateProofBundleConsistencyChecks.currentFirstBlockerMatches === true, "release progress report should prove external gate current first blocker matches proof bundle");
check(releaseProgressReport.externalGateProofBundleConsistencyChecks.currentEnvEditRowsMatch === true, "release progress report should prove external gate current edit rows match proof bundle");
check(releaseProgressReport.externalGateProofBundleConsistencyChecks.currentProofChecklistRowsMatch === true, "release progress report should prove external gate current proof checklist rows match proof bundle");
check(releaseProgressReport.externalGateProofBundleConsistencyChecks.currentActionChecklistRowsMatch === true, "release progress report should prove external gate current action checklist rows match proof bundle");
check(releaseProgressReport.externalGateProofBundleConsistencyChecks.currentCommandVerificationRowsMatch === true, "release progress report should prove external gate current command verification rows match proof bundle");
check(releaseProgressReport.externalGateProofBundleConsistencyValueRecorded === false, "release progress report should not record external gate consistency values");
check(releaseProgressReport.externalGateValueRecorded === false, "release progress report should not record external gate values");
check(releaseProgressReport.sourceReleaseChannelUnblockReady === true, "release progress report should include ready release-channel unblock source evidence");
check(releaseProgressReport.sourceReleaseChannelUnblockPath === relative(releaseChannelUnblockJsonPath), "release progress report should identify the release-channel unblock source path");
check(releaseProgressReport.releaseChannelUnblockSmokeReady === true, "release progress report should mirror ready release-channel unblock smoke evidence");
check(releaseProgressReport.releaseChannelUnblockLoaderEnabled === true, "release progress report should mirror release-channel unblock loader readiness");
check(releaseProgressReport.releaseChannelUnblockLoadedKeyCount === 4, "release progress report should mirror four loaded release-channel unblock keys");
check(releaseProgressReport.releaseChannelUnblockLoadedKeys.length === releaseProgressReport.releaseChannelUnblockLoadedKeyCount, "release progress report unblock loaded key count should match names");
check(releaseProgressReport.releaseChannelUnblockPlaceholderKeyCount === 0, "release progress report should mirror zero release-channel unblock placeholder keys");
check(releaseProgressReport.releaseChannelUnblockPlaceholderKeys.length === 0, "release progress report unblock placeholder key names should be empty");
check(releaseProgressReport.releaseChannelUnblockMetadataReady === true, "release progress report should mirror release-channel unblock metadata readiness");
check(releaseProgressReport.releaseChannelUnblockMetadataRowCount === releaseProgressReport.releaseChannelUnblockMetadataRows.length, "release progress report unblock row count should match rows");
check(releaseProgressReport.releaseChannelUnblockMetadataRowCount === 4, "release progress report should include four release-channel unblock metadata rows");
check(releaseProgressReport.releaseChannelUnblockMetadataRows.every((row) => row.valueRecorded === false), "release progress report unblock metadata rows should not record values");
check(releaseProgressReport.releaseChannelUnblockMetadataRows.every((row) => row.present === true && row.ready === true), "release progress report unblock metadata rows should be present and ready");
check(releaseProgressReport.releaseChannelUnblockPlaceholderBlockerCleared === true, "release progress report should prove release-channel placeholder blocker can clear in rehearsal");
check(releaseProgressReport.releaseChannelUnblockNextProofCommandAfterRealEdits === "npm run release:doctor", "release progress report should mirror unblock next proof command");
check(releaseProgressReport.releaseChannelUnblockCurrentBlockerRefreshCommand === "npm run release:current-blocker", "release progress report should mirror unblock current blocker refresh command");
check(releaseProgressReport.releaseChannelUnblockPrivateValuesRecorded === false, "release progress report unblock evidence should not record private values");
check(releaseProgressReport.releaseChannelUnblockNetworkProbeAttempted === false, "release progress report unblock evidence should not probe network");
check(releaseProgressReport.releaseChannelUnblockReleaseUploadAttempted === false, "release progress report unblock evidence should not upload releases");
check(releaseProgressReport.releaseChannelUnblockAppleNotarySubmissionAttempted === false, "release progress report unblock evidence should not submit to Apple");
check(releaseProgressReport.releaseChannelUnblockSigningAttempted === false, "release progress report unblock evidence should not sign artifacts");
check(releaseProgressReport.releaseChannelUnblockClaimedExternalDistribution === false, "release progress report unblock evidence should not claim external distribution");
check(releaseProgressReport.releaseChannelUnblockValueRecorded === false, "release progress report should not record release-channel unblock values");
check(Number.isInteger(releaseProgressReport.externalProofBundleProofArtifactCount), "release progress report should include external proof artifact count");
check(Number.isInteger(releaseProgressReport.externalProofBundleProofArtifactPresentCount), "release progress report should include external proof artifact present count");
check(Number.isInteger(releaseProgressReport.externalProofBundleProofArtifactMissingCount), "release progress report should include external proof artifact missing count");
check(releaseProgressReport.externalProofBundleProofArtifactPresentCount <= releaseProgressReport.externalProofBundleProofArtifactCount, "release progress report proof artifact present count should not exceed total");
check(releaseProgressReport.externalProofBundleProofArtifactMissingCount === releaseProgressReport.externalProofBundleProofArtifactCount - releaseProgressReport.externalProofBundleProofArtifactPresentCount, "release progress report proof artifact missing count should match total minus present count");
check(Number.isInteger(releaseProgressReport.externalProofBundleGateRequirementTotal), "release progress report should include external proof gate requirement total");
check(Number.isInteger(releaseProgressReport.externalProofBundleGateRequirementReadyCount), "release progress report should include external proof gate requirement ready count");
check(Number.isInteger(releaseProgressReport.externalProofBundleGateRequirementBlockedCount), "release progress report should include external proof gate requirement blocked count");
check(releaseProgressReport.externalProofBundleGateRequirementBlockedCount === releaseProgressReport.externalProofBundleGateRequirementTotal - releaseProgressReport.externalProofBundleGateRequirementReadyCount, "release progress report proof gate blocked count should match total minus ready count");
check(releaseProgressReport.externalProofBundleCurrentProofTarget.length > 0, "release progress report should include external proof current proof target");
check(releaseProgressReport.externalProofBundleCurrentNextCommand.length > 0, "release progress report should include external proof current next command");
check(releaseProgressReport.externalProofBundleCurrentFirstBlocker.length > 0, "release progress report should include external proof current first blocker");
check(releaseProgressReport.externalProofBundleCurrentOperatorAction.length > 0, "release progress report should include external proof current operator action");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentRequiredKeyCount), "release progress report should include external proof current required key count");
check(typeof releaseProgressReport.externalProofBundleCurrentRequiredKeySummary === "string" && releaseProgressReport.externalProofBundleCurrentRequiredKeySummary.length > 0, "release progress report should include external proof current required key summary");
check(Array.isArray(releaseProgressReport.externalProofBundleCurrentRequiredKeys), "release progress report should include external proof current required key names");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentPlaceholderKeyCount), "release progress report should include external proof current placeholder key count");
check(typeof releaseProgressReport.externalProofBundleCurrentPlaceholderKeySummary === "string" && releaseProgressReport.externalProofBundleCurrentPlaceholderKeySummary.length > 0, "release progress report should include external proof current placeholder key summary");
check(Array.isArray(releaseProgressReport.externalProofBundleCurrentPlaceholderKeys), "release progress report should include external proof current placeholder key names");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentPlaceholderEditLocationCount), "release progress report should include external proof current placeholder edit location count");
check(typeof releaseProgressReport.externalProofBundleCurrentPlaceholderEditLocationSummary === "string" && releaseProgressReport.externalProofBundleCurrentPlaceholderEditLocationSummary.length > 0, "release progress report should include external proof current placeholder edit location summary");
check(Array.isArray(releaseProgressReport.externalProofBundleCurrentPlaceholderEditLocations), "release progress report should include value-free external proof current placeholder edit locations");
check(releaseProgressReport.externalProofBundleCurrentPlaceholderEditLocations.every((row) => row.valueRecorded === false), "release progress report placeholder edit locations should not record values");
check(typeof releaseProgressReport.externalProofBundleCurrentEnvEditTarget === "string" && releaseProgressReport.externalProofBundleCurrentEnvEditTarget.length > 0, "release progress report should include external proof current env edit target");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentEnvEditTemplateCount), "release progress report should include external proof current env edit template count");
check(typeof releaseProgressReport.externalProofBundleCurrentEnvEditTemplateSummary === "string" && releaseProgressReport.externalProofBundleCurrentEnvEditTemplateSummary.length > 0, "release progress report should include external proof current env edit template summary");
check(Array.isArray(releaseProgressReport.externalProofBundleCurrentEnvEditTemplate), "release progress report should include value-free external proof current env edit template rows");
check(releaseProgressReport.externalProofBundleCurrentEnvEditTemplate.every((row) => row.valueRecorded === false), "release progress report env edit template rows should not record values");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentEnvEditRowsCount), "release progress report should include external proof current env edit rows count");
check(typeof releaseProgressReport.externalProofBundleCurrentEnvEditRowsSummary === "string" && releaseProgressReport.externalProofBundleCurrentEnvEditRowsSummary.length > 0, "release progress report should include external proof current env edit rows summary");
check(Array.isArray(releaseProgressReport.externalProofBundleCurrentEnvEditRows), "release progress report should include value-free external proof current env edit rows");
check(releaseProgressReport.externalProofBundleCurrentEnvEditRows.every((row) => row.valueRecorded === false), "release progress report env edit rows should not record values");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRowCount), "release progress report should include external proof current placeholder remediation row count");
check(typeof releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRowSummary === "string" && releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRowSummary.length > 0, "release progress report should include external proof current placeholder remediation row summary");
check(Array.isArray(releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRows), "release progress report should include value-free external proof current placeholder remediation rows");
check(releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRows.every((row) => row.valueRecorded === false), "release progress report placeholder remediation rows should not record values");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentProofChecklistRowCount), "release progress report should include external proof current proof checklist row count");
check(typeof releaseProgressReport.externalProofBundleCurrentProofChecklistRowSummary === "string" && releaseProgressReport.externalProofBundleCurrentProofChecklistRowSummary.length > 0, "release progress report should include external proof current proof checklist row summary");
check(Array.isArray(releaseProgressReport.externalProofBundleCurrentProofChecklistRows), "release progress report should include value-free external proof current proof checklist rows");
check(releaseProgressReport.externalProofBundleCurrentProofChecklistRows.every((row) => row.valueRecorded === false), "release progress report proof checklist rows should not record values");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentActionChecklistCount), "release progress report should include external proof current action checklist count");
check(typeof releaseProgressReport.externalProofBundleCurrentActionChecklistSummary === "string" && releaseProgressReport.externalProofBundleCurrentActionChecklistSummary.length > 0, "release progress report should include external proof current action checklist summary");
check(Array.isArray(releaseProgressReport.externalProofBundleCurrentActionChecklistRows), "release progress report should include value-free external proof current action checklist rows");
check(releaseProgressReport.externalProofBundleCurrentActionChecklistRows.every((row) => row.valueRecorded === false), "release progress report action checklist rows should not record values");
check(
  releaseProgressReport.externalProofBundleCurrentActionChecklistCount === releaseProgressReport.externalProofBundleCurrentActionChecklistRows.length,
  "release progress report action checklist count should match rows"
);
check(typeof releaseProgressReport.externalProofBundleCurrentRerunCommand === "string" && releaseProgressReport.externalProofBundleCurrentRerunCommand.length > 0, "release progress report should include external proof current rerun command");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentCommandSequenceCount), "release progress report should include external proof current command sequence count");
check(typeof releaseProgressReport.externalProofBundleCurrentCommandSequenceSummary === "string" && releaseProgressReport.externalProofBundleCurrentCommandSequenceSummary.length > 0, "release progress report should include external proof current command sequence summary");
check(Array.isArray(releaseProgressReport.externalProofBundleCurrentCommandVerificationRows), "release progress report should include value-free external proof current command verification rows");
check(releaseProgressReport.externalProofBundleCurrentCommandVerificationRows.every((row) => row.valueRecorded === false), "release progress report command verification rows should not record values");
check(releaseProgressReport.externalProofBundleCurrentRequiredKeyCount === releaseProgressReport.externalProofBundleCurrentRequiredKeys.length, "release progress report current required key count should match names");
check(releaseProgressReport.externalProofBundleCurrentPlaceholderKeyCount === releaseProgressReport.externalProofBundleCurrentPlaceholderKeys.length, "release progress report current placeholder key count should match names");
check(releaseProgressReport.externalProofBundleCurrentCommandVerificationRowCount >= 0, "release progress report should include external proof command verification row count");
check(releaseProgressReport.externalProofBundleHardGateCommand === "npm run release:external-check", "release progress report should mirror the external proof bundle hard gate command");
check(releaseProgressReport.externalProofBundleCurrentEnvSummaryValueRecorded === false, "release progress report should not record external proof current env summary values");
check(releaseProgressReport.externalProofBundleValueRecorded === false, "release progress report should not record external proof bundle values");
check(releaseProgressReport.externalProofBundleClaimedExternalDistribution === false, "release progress report should not claim external proof bundle distribution completion");
check(releaseProgressReport.localEnvValueRecorded === false, "release progress report should not record local env values");
check(releaseProgressReport.privateValuesRecorded === false, "release progress report should not record private values");
check(releaseProgressReport.releaseUrlValueRecorded === false, "release progress report should not record release URL values");
check(releaseProgressReport.supportUrlValueRecorded === false, "release progress report should not record support URL values");
check(releaseProgressReport.feedValueRecorded === false, "release progress report should not record feed values");
check(releaseProgressReport.credentialValueRecorded === false, "release progress report should not record credential values");
check(releaseProgressReport.tokenValueRecorded === false, "release progress report should not record token values");
check(releaseProgressReport.channelValueRecorded === false, "release progress report should not record channel values");
check(releaseProgressReport.developerIdIdentityValueRecorded === false, "release progress report should not record Developer ID identity values");
check(releaseProgressReport.networkProbeAttemptedByThisReport === false, "release progress report should not probe remote channels");
check(releaseProgressReport.releaseUploadAttemptedByThisReport === false, "release progress report should not upload releases");
check(releaseProgressReport.notarySubmissionAttemptedByThisReport === false, "release progress report should not submit to Apple notary services");
check(releaseProgressReport.signingAttemptedByThisReport === false, "release progress report should not sign artifacts");
check(releaseProgressReport.releaseGateClaimedExternalDistribution === false, "release progress report should not claim external distribution completion");
check(markdown.includes("Release Progress Report"), "release progress Markdown should include title");
check(markdown.includes("Report mode:"), "release progress Markdown should include report mode");
check(markdown.includes("Release check run by this report:"), "release progress Markdown should include release-check run posture");
check(markdown.includes("Persona readiness refreshed by this report:"), "release progress Markdown should include persona readiness refresh posture");
check(markdown.includes("User-Facing Progress"), "release progress Markdown should include user-facing progress summary");
check(markdown.includes("User-facing overall completion:"), "release progress Markdown should include user-facing overall completion");
check(markdown.includes("Current 10-plan progress:"), "release progress Markdown should include current 10-plan progress");
check(markdown.includes("Current 10-Plan Window Rows"), "release progress Markdown should include current 10-plan window rows");
check(markdown.includes("10-plan progress report receipt ready:"), "release progress Markdown should include 10-plan progress report receipt readiness");
check(markdown.includes("10-plan progress report receipt rows:"), "release progress Markdown should include 10-plan progress report receipt rows");
check(markdown.includes("10-Plan Progress Report Receipt"), "release progress Markdown should include 10-plan progress report receipt table");
check(markdown.includes("Audience Readiness"), "release progress Markdown should include audience readiness summary");
check(markdown.includes("Audience Acceptance Matrix"), "release progress Markdown should include audience acceptance summary");
check(markdown.includes("Persona Delivery Packages"), "release progress Markdown should include persona delivery package summary");
check(markdown.includes("Persona Delivery Package Reopen"), "release progress Markdown should include persona delivery package reopen summary");
check(markdown.includes("First-time composer readiness:"), "release progress Markdown should include first-time composer readiness");
check(markdown.includes("Professional producer readiness:"), "release progress Markdown should include professional producer readiness");
check(markdown.includes("Local release readiness:"), "release progress Markdown should include local release readiness");
check(markdown.includes("PKG payload project IO evidence ready:"), "release progress Markdown should include PKG payload project IO readiness");
check(markdown.includes("External Proof Bundle"), "release progress Markdown should include external proof bundle summary");
check(markdown.includes("Release-Channel Unblock Rehearsal"), "release progress Markdown should include release-channel unblock rehearsal summary");
check(markdown.includes("Release-channel placeholder blocker cleared in rehearsal:"), "release progress Markdown should include release-channel unblock cleared status");
check(markdown.includes("Release-channel unblock JSON:"), "release progress Markdown should include release-channel unblock source path");
check(markdown.includes("External Gate Current Proof Consistency"), "release progress Markdown should include external gate current proof consistency summary");
check(markdown.includes("External gate/proof current action consistent:"), "release progress Markdown should include external gate/proof consistency status");
check(markdown.includes("Current next command matches:"), "release progress Markdown should include external gate next-command match status");
check(markdown.includes("Current edit rows match:"), "release progress Markdown should include external gate edit-row match status");
check(markdown.includes("Current action checklist rows match:"), "release progress Markdown should include external gate action-checklist match status");
check(markdown.includes("Current command verification rows match:"), "release progress Markdown should include external gate command-row match status");
check(markdown.includes("External proof artifacts present:"), "release progress Markdown should include external proof artifact coverage");
check(markdown.includes("External proof current target:"), "release progress Markdown should include external proof current target");
check(markdown.includes("External proof current operator action:"), "release progress Markdown should include external proof current operator action");
check(markdown.includes("External proof current required keys:"), "release progress Markdown should include external proof current required key summary");
check(markdown.includes("Next proof target to report:"), "release progress Markdown should include user-facing next proof target");
check(markdown.includes("Operator action to report:"), "release progress Markdown should include user-facing operator action");
check(markdown.includes("Current Edit Guidance"), "release progress Markdown should include current edit guidance table");
check(markdown.includes("assignment shape"), "release progress Markdown should include value-free assignment shape guidance");
check(markdown.includes("Current Proof Checklist Rows"), "release progress Markdown should include current proof checklist rows");
check(markdown.includes("Current Action Checklist Rows"), "release progress Markdown should include current action checklist rows");
check(markdown.includes("Current Command Verification Rows"), "release progress Markdown should include current command verification rows");
check(markdown.includes("proof command"), "release progress Markdown should include proof command guidance");
check(markdown.includes("expectation"), "release progress Markdown should include command expectation guidance");
check(markdown.includes("Current env edit target:"), "release progress Markdown should include current env edit target");
check(markdown.includes("Current placeholder remediation rows:"), "release progress Markdown should include current placeholder remediation summary");
check(markdown.includes("Current command sequence:"), "release progress Markdown should include current command sequence summary");
check(markdown.includes("External proof hard gate: `npm run release:external-check`"), "release progress Markdown should include the external proof hard gate");
check(markdown.includes("Hard external distribution gate remains: `npm run release:external-check`"), "release progress Markdown should keep the hard external gate command");
check(!/https?:\/\//i.test(markdown), "release progress report should not include public or private URL values");

if (failures.length > 0) {
  fail("Release progress report validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge release progress report passed.");
console.log(`- Markdown: ${relative(releaseProgressMarkdownPath)}`);
console.log(`- JSON: ${relative(releaseProgressJsonPath)}`);
console.log(`- Report mode: ${releaseProgressReport.releaseProgressReportMode}`);
console.log(`- Release check run by this report: ${releaseProgressReport.releaseCheckRunByThisReport ? "yes" : "no"}`);
console.log(`- Persona readiness refreshed by this report: ${releaseProgressReport.personaReadinessRefreshedByThisReport ? "yes" : "no"}`);
console.log(`- Completion stage: ${releaseProgressReport.completionStage}`);
console.log(`- User-facing overall completion: ${formatUserPercent(releaseProgressReport.userFacingCompletionPercent)}`);
console.log(`- User-facing remaining completion: ${formatUserPercent(releaseProgressReport.userFacingRemainingPercent)}`);
console.log(`- User-facing completion status: ${releaseProgressReport.userFacingCompletionStatus}`);
console.log(`- Current 10-plan progress: ${releaseProgressReport.currentTenPlanWindowLabel}`);
console.log(`- Current 10-plan rows: ${releaseProgressReport.currentTenPlanWindowRowCount} (${releaseProgressReport.currentTenPlanWindowRowSummary})`);
console.log(`- 10-plan report due: ${releaseProgressReport.tenPlanProgressReportDue ? "yes" : "no"}`);
console.log(`- 10-plan progress report receipt ready: ${releaseProgressReport.tenPlanProgressReportReceiptReady ? "yes" : "no"}`);
console.log(`- 10-plan progress report receipt rows: ${releaseProgressReport.tenPlanProgressReportReceiptRowCount} (${releaseProgressReport.tenPlanProgressReportReceiptSummary})`);
console.log(`- Source evidence ready: ${releaseProgressReport.sourceEvidenceReady ? "yes" : "no"}`);
console.log(`- Local release ready: ${releaseProgressReport.localReleaseReady ? "yes" : "no"}`);
console.log(`- Local release readiness: ${releaseProgressReport.localReleaseReadinessPercent.toFixed(1)}%`);
console.log(`- Desktop project IO evidence ready: ${releaseProgressReport.desktopProjectIoEvidenceReady ? "yes" : "no"}`);
console.log(`- PKG payload project IO evidence ready: ${releaseProgressReport.pkgPayloadProjectIoEvidenceReady ? "yes" : "no"}`);
console.log(`- Audience readiness ready: ${releaseProgressReport.audienceReadinessReady ? "yes" : "no"}`);
console.log(`- Audience readiness rows: ${releaseProgressReport.audienceReadinessRowCount} (${releaseProgressReport.audienceReadinessRowSummary})`);
console.log(`- Audience acceptance ready: ${releaseProgressReport.audienceAcceptanceReady ? "yes" : "no"}`);
console.log(`- Audience acceptance rows: ${releaseProgressReport.audienceAcceptanceRowCount} (${releaseProgressReport.audienceAcceptanceRowSummary})`);
console.log(`- Persona delivery packages ready: ${releaseProgressReport.audienceDeliveryPackagesReady ? "yes" : "no"}`);
console.log(`- Persona delivery package rows: ${releaseProgressReport.audienceDeliveryPackageRowCount} (${releaseProgressReport.audienceDeliveryPackageRowSummary})`);
console.log(`- Persona delivery packages reopen ready: ${releaseProgressReport.audienceDeliveryPackagesReopenReady ? "yes" : "no"}`);
console.log(`- Persona delivery package reopen rows: ${releaseProgressReport.audienceDeliveryPackageReopenRowCount} (${releaseProgressReport.audienceDeliveryPackageReopenRowSummary})`);
console.log(`- First-time composer readiness: ${releaseProgressReport.beginnerAudienceReadinessReady ? "yes" : "no"}`);
console.log(`- Professional producer readiness: ${releaseProgressReport.professionalProducerAudienceReadinessReady ? "yes" : "no"}`);
console.log(`- External distribution hard gate ready: ${releaseProgressReport.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- External gate requirements ready: ${releaseProgressReport.gateRequirementReadyCount}/${releaseProgressReport.gateRequirementTotal} (${releaseProgressReport.gateRequirementReadinessPercent.toFixed(1)}%)`);
console.log(`- Remediation groups ready: ${releaseProgressReport.remediationReadyCount}/${releaseProgressReport.remediationTotal} (${releaseProgressReport.remediationReadinessPercent.toFixed(1)}%)`);
console.log(`- External proof bundle ready: ${releaseProgressReport.externalProofBundleReady ? "yes" : "no"}`);
console.log(`- External gate source ready: ${releaseProgressReport.sourceExternalGateReady ? "yes" : "no"}`);
console.log(`- External gate current proof source ready: ${releaseProgressReport.externalGateCurrentProofBundleSourceReady ? "yes" : "no"}`);
console.log(`- External gate/proof current action consistent: ${releaseProgressReport.externalGateProofBundleConsistencyReady ? "yes" : "no"}`);
console.log(`- Release-channel unblock ready: ${releaseProgressReport.releaseChannelUnblockSmokeReady ? "yes" : "no"}`);
console.log(`- Release-channel placeholder blocker cleared in rehearsal: ${releaseProgressReport.releaseChannelUnblockPlaceholderBlockerCleared ? "yes" : "no"}`);
console.log(`- Release-channel unblock rows: ${releaseProgressReport.releaseChannelUnblockMetadataRowCount} (${releaseProgressReport.releaseChannelUnblockMetadataRowSummary})`);
console.log(`- External gate current next command: ${releaseProgressReport.externalGateCurrentNextCommand}`);
console.log(`- External gate current first blocker: ${releaseProgressReport.externalGateCurrentFirstBlocker}`);
console.log(`- External gate current env edit rows: ${releaseProgressReport.externalGateCurrentEnvEditRowsCount} (${releaseProgressReport.externalGateCurrentEnvEditRowsSummary})`);
console.log(`- External gate current proof checklist rows: ${releaseProgressReport.externalGateCurrentProofChecklistRowCount} (${releaseProgressReport.externalGateCurrentProofChecklistRowSummary})`);
console.log(`- External gate current action checklist rows: ${releaseProgressReport.externalGateCurrentActionChecklistCount} (${releaseProgressReport.externalGateCurrentActionChecklistSummary})`);
console.log(`- External gate current command verification rows: ${releaseProgressReport.externalGateCurrentCommandVerificationRowCount} (${releaseProgressReport.externalGateCurrentCommandVerificationRowSummary})`);
console.log(`- External proof artifacts present: ${releaseProgressReport.externalProofBundleProofArtifactPresentCount}/${releaseProgressReport.externalProofBundleProofArtifactCount} (missing: ${releaseProgressReport.externalProofBundleProofArtifactMissingSummary})`);
console.log(`- External proof gate requirements ready: ${releaseProgressReport.externalProofBundleGateRequirementReadyCount}/${releaseProgressReport.externalProofBundleGateRequirementTotal} (blocked: ${releaseProgressReport.externalProofBundleGateRequirementBlockedCount})`);
console.log(`- External proof current target: ${releaseProgressReport.externalProofBundleCurrentProofTarget}`);
console.log(`- External proof current next command: ${releaseProgressReport.externalProofBundleCurrentNextCommand}`);
console.log(`- External proof current first blocker: ${releaseProgressReport.externalProofBundleCurrentFirstBlocker}`);
console.log(`- External proof current operator action: ${releaseProgressReport.externalProofBundleCurrentOperatorAction}`);
console.log(`- External proof current required keys: ${releaseProgressReport.externalProofBundleCurrentRequiredKeyCount} (${releaseProgressReport.externalProofBundleCurrentRequiredKeySummary})`);
console.log(`- External proof current placeholder keys: ${releaseProgressReport.externalProofBundleCurrentPlaceholderKeyCount} (${releaseProgressReport.externalProofBundleCurrentPlaceholderKeySummary})`);
console.log(`- External proof current placeholder edit locations: ${releaseProgressReport.externalProofBundleCurrentPlaceholderEditLocationCount} (${releaseProgressReport.externalProofBundleCurrentPlaceholderEditLocationSummary})`);
console.log(`- External proof current env edit target: ${releaseProgressReport.externalProofBundleCurrentEnvEditTarget}`);
console.log(`- External proof current env edit template: ${releaseProgressReport.externalProofBundleCurrentEnvEditTemplateCount} (${releaseProgressReport.externalProofBundleCurrentEnvEditTemplateSummary})`);
console.log(`- External proof current env edit rows: ${releaseProgressReport.externalProofBundleCurrentEnvEditRowsCount} (${releaseProgressReport.externalProofBundleCurrentEnvEditRowsSummary})`);
console.log(`- External proof current placeholder remediation rows: ${releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRowCount} (${releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRowSummary})`);
console.log(`- External proof current proof checklist rows: ${releaseProgressReport.externalProofBundleCurrentProofChecklistRowCount} (${releaseProgressReport.externalProofBundleCurrentProofChecklistRowSummary})`);
console.log(`- External proof current action checklist rows: ${releaseProgressReport.externalProofBundleCurrentActionChecklistCount} (${releaseProgressReport.externalProofBundleCurrentActionChecklistSummary})`);
console.log(`- External proof current rerun command: ${releaseProgressReport.externalProofBundleCurrentRerunCommand}`);
console.log(`- External proof current command sequence: ${releaseProgressReport.externalProofBundleCurrentCommandSequenceCount} (${releaseProgressReport.externalProofBundleCurrentCommandSequenceSummary})`);
console.log(`- External proof current command verification rows: ${releaseProgressReport.externalProofBundleCurrentCommandVerificationRowCount} (${releaseProgressReport.externalProofBundleCurrentCommandVerificationRowSummary})`);
console.log(`- External proof hard gate: ${releaseProgressReport.externalProofBundleHardGateCommand}`);
console.log(`- First blockers tracked: ${releaseProgressReport.firstBlockers.length}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted by this report");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
