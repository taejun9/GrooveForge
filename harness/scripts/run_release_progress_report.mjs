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
const releaseChannelLiveCheckJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-live-check.json`);
const privateEditStrictProofBlockedJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-private-edit-strict-proof-blocked-smoke.json`);
const privateEditStrictProofSuccessJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-private-edit-strict-proof-success-smoke.json`);
const updateFeedCheckpointJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-update-feed-checkpoint-smoke.json`);
const releaseProgressMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-report.md`);
const releaseProgressJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-report.json`);
const failures = [];
const fromExisting = process.argv.includes("--from-existing");
const recommendedPrivateEditOperatorProofCommand = "npm run release:private-edit-strict-proof";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";

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

async function readJsonIfPresent(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function formatUserPercent(value) {
  return value === 100 ? "100%" : `${value.toFixed(6)}%`;
}

function planLabel(planNumber) {
  return `plan-${String(planNumber).padStart(3, "0")}`;
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

function formatTenPlanCadenceRolloverRows(rows) {
  return formatTenPlanProgressReportReceiptRows(rows);
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

function formatReleaseChannelLiveCheckRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| 0 | none | none | no | no | no | no | none | none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order ?? "?"} | ${escapeCell(row.key)} | ${escapeCell(row.kind)} | ${row.present ? "yes" : "no"} | ${row.placeholder ? "yes" : "no"} | ${row.shapeReady ? "yes" : "no"} | ${row.currentReady ? "yes" : "no"} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.editTarget)} | ${escapeCell(row.line ?? "none")} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`
    )
    .join("\n");
}

function formatReleaseChannelLiveCheckLocations(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | no | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.key)} | ${escapeCell(row.file)} | ${escapeCell(row.line ?? "none")} | ${row.placeholder ? "yes" : "no"} | ${row.valueRecorded === false ? "no" : "yes"} |`
    )
    .join("\n");
}

function formatReleaseChannelPostEditReceiptRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | no | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.item)} | ${row.ready ? "yes" : "no"} | ${row.currentReady ? "yes" : "no"} | ${escapeCell(row.evidence)} | ${escapeCell(row.expectedPostEditSignal)} | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatReleaseChannelPostEditOperatorReceiptRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | none | none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order ?? "?"} | ${escapeCell(row.step)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.currentState)} | ${escapeCell(row.operatorAction)} | ${escapeCell(row.expectedPostEditSignal)} | \`${escapeCell(row.command)}\` | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`
    )
    .join("\n");
}

function formatPostEditProofSequenceReceiptRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.step)} | ${row.ready ? "yes" : "no"} | \`${escapeCell(row.command)}\` | ${escapeCell(row.expectedEvidence)} | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatPrivateEditStrictProofCommandRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${escapeCell(row.statusLabel)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatUpdateFeedCheckpointSourceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | no | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${escapeCell(row.path)} | ${row.present ? "yes" : "no"} | ${row.ready ? "yes" : "no"} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatUpdateFeedCheckpointBranchRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | no | no | no | 0/2 | 0 | 0 | no | 0 | no | no | no | no | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.label)} | ${escapeCell(row.sourceMode)} | ${row.syntheticSuccessSmoke ? "yes" : "no"} | ${row.proofReady ? "yes" : "no"} | ${row.liveCheckReady ? "yes" : "no"} | ${row.strictReady ? "yes" : "no"} | ${row.selectedReadyCount ?? 0}/2 | ${row.placeholderKeyCount ?? 0} | ${row.placeholderEditLocationCount ?? 0} | ${row.autoUpdateReady ? "yes" : "no"} | ${row.autoUpdateBlockerCount ?? 0} | ${row.signedUpdateArtifactsReady ? "yes" : "no"} | ${row.hardGateWouldFail ? "yes" : "no"} | ${row.realLocalEnvRead ? "yes" : "no"} | ${row.ready ? "yes" : "no"} | ${row.valueRecorded === false ? "no" : "yes"} |`
    )
    .join("\n");
}

function formatUpdateFeedCheckpointComparisonRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.item)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.evidence)} | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
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
  const tenPlanProgressReportDue = windowCompleted.length === 10;
  const currentTenPlanReportBoundaryAt = windowEnd;
  const nextScheduledTenPlanProgressReportAt = tenPlanProgressReportDue ? windowEnd + 10 : windowEnd;

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
    tenPlanProgressReportDue,
    tenPlanProgressReportCadence: "report after each completed work and every 10 completed plans",
    currentTenPlanReportBoundaryAt,
    currentTenPlanReportBoundaryLabel: planLabel(currentTenPlanReportBoundaryAt),
    nextTenPlanProgressReportAt: currentTenPlanReportBoundaryAt,
    nextScheduledTenPlanProgressReportAt,
    nextScheduledTenPlanProgressReportLabel: planLabel(nextScheduledTenPlanProgressReportAt),
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
  const nextPlan = planLabel(report.nextTenPlanProgressReportAt);
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
    },
    {
      order: 7,
      item: "Next scheduled report after delivery",
      ready: Number.isInteger(report.nextScheduledTenPlanProgressReportAt) && report.nextScheduledTenPlanProgressReportAt >= report.nextTenPlanProgressReportAt,
      evidence: report.nextScheduledTenPlanProgressReportLabel,
      sourceField: "nextScheduledTenPlanProgressReportAt/nextScheduledTenPlanProgressReportLabel",
      valueRecorded: false
    }
  ];

  return {
    tenPlanProgressReportReceiptReady: rows.length === 7 && rows.every((row) => row.ready === true && row.valueRecorded === false),
    tenPlanProgressReportReceiptRowCount: rows.length,
    tenPlanProgressReportReceiptSummary: `${rows.length} value-free 10-plan progress report receipt rows`,
    tenPlanProgressReportReceiptRows: rows,
    tenPlanProgressReportReceiptValueRecorded: false
  };
}

function buildTenPlanCadenceRolloverSummary(report) {
  const rows = [
    {
      order: 1,
      item: "Current report boundary",
      ready: report.currentTenPlanReportBoundaryAt === report.nextTenPlanProgressReportAt,
      evidence: report.currentTenPlanReportBoundaryLabel,
      sourceField: "currentTenPlanReportBoundaryAt/currentTenPlanReportBoundaryLabel",
      valueRecorded: false
    },
    {
      order: 2,
      item: "Next scheduled report after delivery",
      ready: report.nextScheduledTenPlanProgressReportAt >= report.currentTenPlanReportBoundaryAt,
      evidence: report.nextScheduledTenPlanProgressReportLabel,
      sourceField: "nextScheduledTenPlanProgressReportAt/nextScheduledTenPlanProgressReportLabel",
      valueRecorded: false
    }
  ];

  return {
    tenPlanProgressReportRolloverReady: rows.length === 2 && rows.every((row) => row.ready === true && row.valueRecorded === false),
    tenPlanProgressReportRolloverRowCount: rows.length,
    tenPlanProgressReportRolloverSummary: `${rows.length} value-free 10-plan cadence rollover rows`,
    tenPlanProgressReportRolloverRows: rows,
    tenPlanProgressReportRolloverValueRecorded: false
  };
}

function buildReleaseChannelPostEditReceiptSummary(report) {
  const requiredKeys = stringArrayValue(report.externalProofBundleCurrentRequiredKeys);
  const placeholderKeys = stringArrayValue(report.externalProofBundleCurrentPlaceholderKeys);
  const currentEnvEditTarget = textValue(report.externalProofBundleCurrentEnvEditTarget, ".env.distribution.local");
  const liveCheckEnvEditTarget = textValue(report.releaseChannelLiveCheckCurrentEnvEditTarget, currentEnvEditTarget);
  const unblockRows = valueFreeObjectRows(report.releaseChannelUnblockMetadataRows);
  const proofChecklistRows = valueFreeObjectRows(report.externalProofBundleCurrentProofChecklistRows);
  const actionChecklistRows = valueFreeObjectRows(report.externalProofBundleCurrentActionChecklistRows);
  const commandVerificationRows = valueFreeObjectRows(report.externalProofBundleCurrentCommandVerificationRows);
  const currentProofCommand = textValue(report.releaseChannelUnblockNextProofCommandAfterRealEdits, report.externalProofBundleCurrentNextCommand);
  const currentRerunCommand = textValue(report.releaseChannelUnblockCurrentBlockerRefreshCommand, report.externalProofBundleCurrentRerunCommand);
  const hardGateCommand = textValue(report.externalProofBundleHardGateCommand, "npm run release:external-check");
  const rows = [
    {
      order: 1,
      item: "Current key coverage",
      ready:
        requiredKeys.length === report.externalProofBundleCurrentRequiredKeyCount &&
        requiredKeys.length === 4 &&
        currentEnvEditTarget === liveCheckEnvEditTarget,
      currentReady: placeholderKeys.length === 0,
      evidence: `${requiredKeys.length} required release-channel keys; edit target ${report.externalProofBundleCurrentEnvEditTarget}; ${report.externalProofBundleCurrentPlaceholderEditLocationCount} edit locations`,
      expectedPostEditSignal: "all current release-channel keys load without placeholders",
      proofCommand: currentProofCommand,
      rerunCommand: currentRerunCommand,
      sourceField: "externalProofBundleCurrentRequiredKeys/externalProofBundleCurrentPlaceholderEditLocations",
      valueRecorded: false
    },
    {
      order: 2,
      item: "Shape rehearsal coverage",
      ready:
        report.releaseChannelUnblockMetadataReady === true &&
        report.releaseChannelUnblockPlaceholderBlockerCleared === true &&
        unblockRows.length === 4 &&
        unblockRows.every((row) => row.ready === true && row.valueRecorded === false),
      currentReady: report.releaseChannelUnblockPlaceholderBlockerCleared === true,
      evidence: `${unblockRows.length} value-free release-channel unblock rows; values recorded no`,
      expectedPostEditSignal: "real private edits satisfy the same allowed channel and safe HTTPS URL shapes",
      proofCommand: currentProofCommand,
      rerunCommand: currentRerunCommand,
      sourceField: "releaseChannelUnblockMetadataRows/releaseChannelUnblockPlaceholderBlockerCleared",
      valueRecorded: false
    },
    {
      order: 3,
      item: "Placeholder cleanup acceptance",
      ready: Number.isInteger(report.externalProofBundleCurrentPlaceholderKeyCount) && placeholderKeys.length === report.externalProofBundleCurrentPlaceholderKeyCount,
      currentReady: report.externalProofBundleCurrentPlaceholderKeyCount === 0,
      evidence: `${report.externalProofBundleCurrentPlaceholderKeyCount} current placeholder keys remain`,
      expectedPostEditSignal: "0 current placeholder keys; current first blocker advances past release-channel metadata",
      proofCommand: currentProofCommand,
      rerunCommand: currentRerunCommand,
      sourceField: "externalProofBundleCurrentPlaceholderKeyCount/externalProofBundleCurrentFirstBlocker",
      valueRecorded: false
    },
    {
      order: 4,
      item: "Proof and rerun sequence",
      ready:
        currentProofCommand === "npm run release:doctor" &&
        currentRerunCommand === "npm run release:current-blocker" &&
        commandVerificationRows.length > 0,
      currentReady: false,
      evidence: `${commandVerificationRows.length} value-free command verification rows; proof ${currentProofCommand}; rerun ${currentRerunCommand}`,
      expectedPostEditSignal: "release doctor refreshes private-input evidence, then current-blocker mirrors the advanced blocker",
      proofCommand: currentProofCommand,
      rerunCommand: currentRerunCommand,
      sourceField: "externalProofBundleCurrentCommandVerificationRows/releaseChannelUnblockCurrentBlockerRefreshCommand",
      valueRecorded: false
    },
    {
      order: 5,
      item: "Acceptance evidence coverage",
      ready: proofChecklistRows.length > 0 && actionChecklistRows.length > 0,
      currentReady: false,
      evidence: `${proofChecklistRows.length} proof checklist rows; ${actionChecklistRows.length} action checklist rows`,
      expectedPostEditSignal: "private-input, release-channel QA, and current proof checklist signals turn ready without storing values",
      proofCommand: currentProofCommand,
      rerunCommand: currentRerunCommand,
      sourceField: "externalProofBundleCurrentProofChecklistRows/externalProofBundleCurrentActionChecklistRows",
      valueRecorded: false
    },
    {
      order: 6,
      item: "Hard gate separation",
      ready: hardGateCommand === "npm run release:external-check",
      currentReady: report.externalDistributionGateReady === true,
      evidence: `hard gate remains ${hardGateCommand}; external distribution ready ${report.externalDistributionGateReady ? "yes" : "no"}`,
      expectedPostEditSignal: "release-channel metadata clears first; external hard gate remains blocked until downstream proofs are ready",
      proofCommand: hardGateCommand,
      rerunCommand: currentRerunCommand,
      sourceField: "externalProofBundleHardGateCommand/externalDistributionGateReady",
      valueRecorded: false
    }
  ];

  return {
    releaseChannelPostEditReceiptReady: rows.length === 6 && rows.every((row) => row.ready === true && row.valueRecorded === false),
    releaseChannelPostEditReceiptCurrentReadyCount: rows.filter((row) => row.currentReady === true).length,
    releaseChannelPostEditReceiptRowCount: rows.length,
    releaseChannelPostEditReceiptSummary: `${rows.length} value-free release-channel post-edit receipt rows`,
    releaseChannelPostEditReceiptRows: rows,
    releaseChannelPostEditReceiptProofCommand: currentProofCommand,
    releaseChannelPostEditReceiptRerunCommand: currentRerunCommand,
    releaseChannelPostEditReceiptValueRecorded: false
  };
}

function buildReleaseChannelPostEditOperatorReceiptSummary(report) {
  const rows = valueFreeObjectRows(report.externalProofBundleReleaseChannelPostEditOperatorReceiptRows);
  return {
    releaseChannelPostEditOperatorReceiptReady:
      report.externalProofBundleReleaseChannelPostEditOperatorReceiptReady === true &&
      rows.length === 7 &&
      rows.every((row) => row.ready === true && row.valueRecorded === false),
    releaseChannelPostEditOperatorReceiptRowCount: rows.length,
    releaseChannelPostEditOperatorReceiptSummary:
      rows.length > 0 ? `${rows.length} value-free release-channel post-edit operator receipt rows` : "none",
    releaseChannelPostEditOperatorReceiptRows: rows,
    releaseChannelPostEditOperatorReceiptRecommendedProofCommand: textValue(
      report.externalProofBundleReleaseChannelPostEditOperatorReceiptRecommendedProofCommand,
      recommendedPrivateEditOperatorProofCommand
    ),
    releaseChannelPostEditOperatorReceiptRecommendedProofCommandRole: textValue(
      report.externalProofBundleReleaseChannelPostEditOperatorReceiptRecommendedProofCommandRole,
      "recommended strict-first proof chain after replacing the four private release-channel placeholders"
    ),
    releaseChannelPostEditOperatorReceiptRecommendedProofCommandValueRecorded:
      report.externalProofBundleReleaseChannelPostEditOperatorReceiptRecommendedProofCommandValueRecorded === true ? true : false,
    releaseChannelPostEditOperatorReceiptProofCommand: textValue(
      report.externalProofBundleReleaseChannelPostEditOperatorReceiptProofCommand,
      "npm run release:doctor"
    ),
    releaseChannelPostEditOperatorReceiptBlockerRefreshCommand: textValue(
      report.externalProofBundleReleaseChannelPostEditOperatorReceiptBlockerRefreshCommand,
      "npm run release:current-blocker"
    ),
    releaseChannelPostEditOperatorReceiptNextActionsCommand: textValue(
      report.externalProofBundleReleaseChannelPostEditOperatorReceiptNextActionsCommand,
      "npm run release:next-actions"
    ),
    releaseChannelPostEditOperatorReceiptHardGateCommand: textValue(
      report.externalProofBundleReleaseChannelPostEditOperatorReceiptHardGateCommand,
      "npm run release:external-check"
    ),
    releaseChannelPostEditOperatorReceiptValueRecorded:
      report.externalProofBundleReleaseChannelPostEditOperatorReceiptValueRecorded === true ? true : false
  };
}

function buildPostEditProofSequenceReceiptSummary(report) {
  const upstreamRows = valueFreeObjectRows(report.externalProofBundlePostEditProofSequenceReceiptRows);
  if (upstreamRows.length > 0) {
    return {
      postEditProofSequenceReceiptReady:
        report.externalProofBundlePostEditProofSequenceReceiptReady === true &&
        upstreamRows.length === 8 &&
        upstreamRows.every((row) => row.ready === true && row.valueRecorded === false),
      postEditProofSequenceReceiptRowCount: upstreamRows.length,
      postEditProofSequenceReceiptSummary: textValue(
        report.externalProofBundlePostEditProofSequenceReceiptSummary,
        `${upstreamRows.length} value-free post-edit proof sequence rows`
      ),
      postEditProofSequenceReceiptRows: upstreamRows,
      postEditProofSequenceReceiptRecommendedProofCommand: textValue(
        report.externalProofBundlePostEditProofSequenceReceiptRecommendedProofCommand,
        recommendedPrivateEditOperatorProofCommand
      ),
      postEditProofSequenceReceiptRecommendedProofCommandValueRecorded:
        report.externalProofBundlePostEditProofSequenceReceiptRecommendedProofCommandValueRecorded === true ? true : false,
      postEditProofSequenceReceiptDoctorCommand: textValue(
        report.externalProofBundlePostEditProofSequenceReceiptDoctorCommand,
        "npm run release:doctor"
      ),
      postEditProofSequenceReceiptCurrentBlockerCommand: textValue(
        report.externalProofBundlePostEditProofSequenceReceiptCurrentBlockerCommand,
        "npm run release:current-blocker"
      ),
      postEditProofSequenceReceiptNextActionsCommand: textValue(
        report.externalProofBundlePostEditProofSequenceReceiptNextActionsCommand,
        "npm run release:next-actions"
      ),
      postEditProofSequenceReceiptProofBundleCommand: textValue(
        report.externalProofBundlePostEditProofSequenceReceiptProofBundleCommand,
        "npm run release:proof-bundle"
      ),
      postEditProofSequenceReceiptProgressCommand: textValue(
        report.externalProofBundlePostEditProofSequenceReceiptProgressCommand,
        "npm run release:progress-smoke"
      ),
      postEditProofSequenceReceiptHardGateCommand: textValue(
        report.externalProofBundlePostEditProofSequenceReceiptHardGateCommand,
        "npm run release:external-check"
      ),
      postEditProofSequenceReceiptValueRecorded:
        report.externalProofBundlePostEditProofSequenceReceiptValueRecorded === true ? true : false
    };
  }

  const envEditTarget = textValue(report.externalProofBundleCurrentEnvEditTarget, ".env.distribution.local");
  const placeholderKeyCount = integerValue(report.externalProofBundleCurrentPlaceholderKeyCount);
  const doctorCommand = textValue(report.releaseChannelPostEditOperatorReceiptProofCommand, "npm run release:doctor");
  const currentBlockerCommand = textValue(report.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand, "npm run release:current-blocker");
  const nextActionsCommand = textValue(report.releaseChannelPostEditOperatorReceiptNextActionsCommand, "npm run release:next-actions");
  const proofBundleCommand = "npm run release:proof-bundle";
  const progressCommand = "npm run release:progress-smoke";
  const hardGateCommand = textValue(report.releaseChannelPostEditOperatorReceiptHardGateCommand, "npm run release:external-check");
  const rows = [
    {
      order: 1,
      step: "Private value edit",
      ready: envEditTarget.length > 0 && placeholderKeyCount >= 0,
      command: releaseChannelApplyPrivateEnvCommand,
      expectedEvidence: `operator-owned process env metadata is applied into ${envEditTarget}; current release-channel placeholder key count becomes 0`,
      sourceField: "externalProofBundleCurrentEnvEditTarget/externalProofBundleCurrentPlaceholderKeyCount",
      valueRecorded: false
    },
    {
      order: 2,
      step: "Recommended strict proof chain",
      ready: recommendedPrivateEditOperatorProofCommand === "npm run release:private-edit-strict-proof",
      command: recommendedPrivateEditOperatorProofCommand,
      expectedEvidence: "strict live-check runs first, then post-edit proof and progress refresh run without recording private values",
      sourceField: "releaseChannelPostEditOperatorReceiptRecommendedProofCommand",
      valueRecorded: false
    },
    {
      order: 3,
      step: "Release doctor proof",
      ready: doctorCommand === "npm run release:doctor",
      command: doctorCommand,
      expectedEvidence: "release doctor reports release-channel metadata without placeholder blockers",
      sourceField: "releaseChannelPostEditOperatorReceiptProofCommand",
      valueRecorded: false
    },
    {
      order: 4,
      step: "Current-blocker refresh",
      ready: currentBlockerCommand === "npm run release:current-blocker",
      command: currentBlockerCommand,
      expectedEvidence: "current-blocker mirrors the advanced blocker and refreshed proof sequence",
      sourceField: "releaseChannelPostEditOperatorReceiptBlockerRefreshCommand",
      valueRecorded: false
    },
    {
      order: 5,
      step: "Next-actions refresh",
      ready: nextActionsCommand === "npm run release:next-actions",
      command: nextActionsCommand,
      expectedEvidence: "next-actions reprioritizes downstream blockers after release-channel metadata clears",
      sourceField: "releaseChannelPostEditOperatorReceiptNextActionsCommand",
      valueRecorded: false
    },
    {
      order: 6,
      step: "Proof bundle refresh",
      ready: proofBundleCommand === "npm run release:proof-bundle",
      command: proofBundleCommand,
      expectedEvidence: "external proof bundle mirrors refreshed current-action evidence",
      sourceField: "sourceExternalProofBundlePath/externalProofBundleReady",
      valueRecorded: false
    },
    {
      order: 7,
      step: "Progress refresh",
      ready: progressCommand === "npm run release:progress-smoke",
      command: progressCommand,
      expectedEvidence: "release progress mirrors the refreshed proof bundle and 10-plan status",
      sourceField: "releaseProgressReportMode/currentTenPlanWindowLabel",
      valueRecorded: false
    },
    {
      order: 8,
      step: "Hard-gate boundary",
      ready: hardGateCommand === "npm run release:external-check",
      command: hardGateCommand,
      expectedEvidence: "hard gate remains blocked until downstream external proofs are ready; no completion claimed",
      sourceField: "releaseChannelPostEditOperatorReceiptHardGateCommand/externalDistributionGateReady",
      valueRecorded: false
    }
  ];

  return {
    postEditProofSequenceReceiptReady: rows.length === 8 && rows.every((row) => row.ready === true && row.valueRecorded === false),
    postEditProofSequenceReceiptRowCount: rows.length,
    postEditProofSequenceReceiptSummary: `${rows.length} value-free post-edit proof sequence rows`,
    postEditProofSequenceReceiptRows: rows,
    postEditProofSequenceReceiptRecommendedProofCommand: recommendedPrivateEditOperatorProofCommand,
    postEditProofSequenceReceiptRecommendedProofCommandValueRecorded: false,
    postEditProofSequenceReceiptDoctorCommand: doctorCommand,
    postEditProofSequenceReceiptCurrentBlockerCommand: currentBlockerCommand,
    postEditProofSequenceReceiptNextActionsCommand: nextActionsCommand,
    postEditProofSequenceReceiptProofBundleCommand: proofBundleCommand,
    postEditProofSequenceReceiptProgressCommand: progressCommand,
    postEditProofSequenceReceiptHardGateCommand: hardGateCommand,
    postEditProofSequenceReceiptValueRecorded: false
  };
}

function buildPrivateEditStrictProofHandoffSummary({ blockedSmoke, successSmoke }) {
  const blockedRows = valueFreeObjectRows(blockedSmoke?.privateEditStrictProofBlockedHandoffRows);
  const commandRows = valueFreeObjectRows(successSmoke?.privateEditStrictProofCommandRows ?? blockedSmoke?.privateEditStrictProofCommandRows);
  const blockedSourceReady = blockedSmoke !== null;
  const successSourceReady = successSmoke !== null;
  const blockedReady =
    blockedSourceReady &&
    blockedSmoke.reportCommand === "npm run release:private-edit-strict-proof-blocked-smoke" &&
    blockedSmoke.privateEditStrictProofReceiptReady === true &&
    blockedSmoke.privateEditStrictProofReady === false &&
    blockedSmoke.privateEditStrictProofBlockedHandoffReady === true &&
    integerValue(blockedSmoke.privateEditStrictProofBlockedHandoffRowCount) === blockedRows.length &&
    blockedRows.length > 0 &&
    integerValue(blockedSmoke.strictFailureRowCount) === 4 &&
    integerValue(blockedSmoke.currentPlaceholderKeyCount) === 4 &&
    blockedSmoke.progressRefreshSkippedInBlockedSmoke === true &&
    blockedSmoke.realLocalEnvRead === false &&
    blockedSmoke.realLocalEnvModified === false &&
    blockedSmoke.privateValuesRecorded === false &&
    blockedSmoke.networkProbeAttempted === false &&
    blockedSmoke.releaseUploadAttempted === false &&
    blockedSmoke.signingAttempted === false &&
    blockedSmoke.notarySubmissionAttempted === false &&
    blockedSmoke.claimedExternalDistribution === false &&
    blockedRows.every((row) => row.valueRecorded === false);
  const successReady =
    successSourceReady &&
    successSmoke.reportCommand === "npm run release:private-edit-strict-proof-success-smoke" &&
    successSmoke.privateEditStrictProofReceiptReady === true &&
    successSmoke.privateEditStrictProofReady === true &&
    successSmoke.strictReady === true &&
    integerValue(successSmoke.strictFailureRowCount) === 0 &&
    integerValue(successSmoke.currentPlaceholderKeyCount) === 0 &&
    successSmoke.postEditProofReady === true &&
    successSmoke.progressRefreshReady === true &&
    successSmoke.privateValueLeakAuditReady === true &&
    integerValue(successSmoke.privateValueLeakAuditLeakFindingCount) === 0 &&
    successSmoke.realLocalEnvRead === false &&
    successSmoke.realLocalEnvModified === false &&
    successSmoke.privateValuesRecorded === false &&
    successSmoke.networkProbeAttempted === false &&
    successSmoke.releaseUploadAttempted === false &&
    successSmoke.signingAttempted === false &&
    successSmoke.notarySubmissionAttempted === false &&
    successSmoke.claimedExternalDistribution === false &&
    commandRows.length === integerValue(successSmoke.privateEditStrictProofCommandRowCount) &&
    commandRows.every((row) => row.valueRecorded === false);
  const sourceReady = blockedSourceReady || successSourceReady;
  return {
    privateEditStrictProofHandoffSourceArtifact: "Release private-edit strict proof smokes",
    privateEditStrictProofHandoffSourceReady: sourceReady,
    privateEditStrictProofHandoffReady: blockedReady && successReady,
    privateEditStrictProofOperatorCommand: recommendedPrivateEditOperatorProofCommand,
    privateEditStrictProofBlockedSourcePath: relative(privateEditStrictProofBlockedJsonPath),
    privateEditStrictProofBlockedSourceReady: blockedSourceReady,
    privateEditStrictProofBlockedReady: blockedReady,
    privateEditStrictProofBlockedCommand: textValue(blockedSmoke?.reportCommand, "npm run release:private-edit-strict-proof-blocked-smoke"),
    privateEditStrictProofBlockedState: textValue(blockedSmoke?.privateEditStrictProofState, "missing blocked smoke evidence"),
    privateEditStrictProofBlockedHandoffReady: blockedSmoke?.privateEditStrictProofBlockedHandoffReady === true,
    privateEditStrictProofBlockedHandoffRowCount: integerValue(blockedSmoke?.privateEditStrictProofBlockedHandoffRowCount),
    privateEditStrictProofBlockedHandoffSummary: textValue(blockedSmoke?.privateEditStrictProofBlockedHandoffSummary, "missing blocked smoke evidence"),
    privateEditStrictProofBlockedHandoffRows: blockedRows,
    privateEditStrictProofBlockedStrictFailureRowCount: integerValue(blockedSmoke?.strictFailureRowCount),
    privateEditStrictProofBlockedPlaceholderKeyCount: integerValue(blockedSmoke?.currentPlaceholderKeyCount),
    privateEditStrictProofBlockedProgressSkipped: blockedSmoke?.progressRefreshSkippedInBlockedSmoke === true,
    privateEditStrictProofBlockedRealLocalEnvRead: blockedSmoke?.realLocalEnvRead === true,
    privateEditStrictProofBlockedRealLocalEnvModified: blockedSmoke?.realLocalEnvModified === true,
    privateEditStrictProofSuccessSourcePath: relative(privateEditStrictProofSuccessJsonPath),
    privateEditStrictProofSuccessSourceReady: successSourceReady,
    privateEditStrictProofSuccessReady: successReady,
    privateEditStrictProofSuccessCommand: textValue(successSmoke?.reportCommand, "npm run release:private-edit-strict-proof-success-smoke"),
    privateEditStrictProofSuccessState: textValue(successSmoke?.privateEditStrictProofState, "missing success smoke evidence"),
    privateEditStrictProofSuccessStrictReady: successSmoke?.strictReady === true,
    privateEditStrictProofSuccessPlaceholderKeyCount: integerValue(successSmoke?.currentPlaceholderKeyCount),
    privateEditStrictProofSuccessPostEditReady: successSmoke?.postEditProofReady === true,
    privateEditStrictProofSuccessProgressRefreshReady: successSmoke?.progressRefreshReady === true,
    privateEditStrictProofSuccessLeakAuditReady: successSmoke?.privateValueLeakAuditReady === true,
    privateEditStrictProofSuccessLeakFindingCount: integerValue(successSmoke?.privateValueLeakAuditLeakFindingCount),
    privateEditStrictProofSuccessRealLocalEnvRead: successSmoke?.realLocalEnvRead === true,
    privateEditStrictProofSuccessRealLocalEnvModified: successSmoke?.realLocalEnvModified === true,
    privateEditStrictProofCommandRowCount: commandRows.length,
    privateEditStrictProofCommandSummary: textValue(
      successSmoke?.privateEditStrictProofCommandSummary ?? blockedSmoke?.privateEditStrictProofCommandSummary,
      "missing strict proof command rows"
    ),
    privateEditStrictProofCommandRows: commandRows,
    privateEditStrictProofValueRecorded: false,
    privateEditStrictProofPrivateValuesRecorded: blockedSmoke?.privateValuesRecorded === true || successSmoke?.privateValuesRecorded === true,
    privateEditStrictProofNetworkProbeAttempted: blockedSmoke?.networkProbeAttempted === true || successSmoke?.networkProbeAttempted === true,
    privateEditStrictProofClaimedAutoUpdate: blockedSmoke?.claimedAutoUpdate === true || successSmoke?.claimedAutoUpdate === true,
    privateEditStrictProofClaimedExternalDistribution:
      blockedSmoke?.claimedExternalDistribution === true || successSmoke?.claimedExternalDistribution === true
  };
}

function buildUpdateFeedCheckpointSummary({ checkpoint, currentTenPlanWindowLabel }) {
  const sourceRows = valueFreeObjectRows(checkpoint?.sourceArtifactRows);
  const branchRows = valueFreeObjectRows(checkpoint?.branchRows);
  const comparisonRows = valueFreeObjectRows(checkpoint?.comparisonRows);
  const refreshRows = valueFreeObjectRows(checkpoint?.refreshCommandRows);
  const sourceReady = checkpoint !== null;
  const realPlaceholderKeyCount = integerValue(checkpoint?.realPlaceholderKeyCount);
  const realPlaceholderEditLocationCount = integerValue(checkpoint?.realPlaceholderEditLocationCount);
  const realPlaceholderStateReady =
    (realPlaceholderKeyCount === 0 && realPlaceholderEditLocationCount === 0) ||
    (realPlaceholderKeyCount === 6 && realPlaceholderEditLocationCount === 6);
  const checkpointReady =
    sourceReady &&
    checkpoint.releaseUpdateFeedCheckpointReady === true &&
    checkpoint.reportCommand === "npm run release:update-feed-checkpoint-smoke" &&
    integerValue(checkpoint.sourceArtifactRowCount) === sourceRows.length &&
    sourceRows.length === 2 &&
    sourceRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
    integerValue(checkpoint.branchRowCount) === branchRows.length &&
    branchRows.length === 2 &&
    branchRows.every((row) => row.ready === true && row.valueRecorded === false) &&
    integerValue(checkpoint.comparisonRowCount) === comparisonRows.length &&
    comparisonRows.length === 6 &&
    comparisonRows.every((row) => row.ready === true && row.valueRecorded === false) &&
    checkpoint.realPostEditProofReady === true &&
    checkpoint.realLiveCheckReady === false &&
    checkpoint.realStrictReady === false &&
    integerValue(checkpoint.realSelectedReadyCount) === 0 &&
    realPlaceholderStateReady &&
    checkpoint.syntheticPostEditProofReady === true &&
    checkpoint.syntheticLiveCheckReady === true &&
    checkpoint.syntheticStrictReady === true &&
    integerValue(checkpoint.syntheticSelectedReadyCount) === 2 &&
    integerValue(checkpoint.syntheticPlaceholderKeyCount) === 0 &&
    checkpoint.syntheticRealLocalEnvRead === false &&
    checkpoint.realAutoUpdateReady === false &&
    checkpoint.syntheticAutoUpdateReady === false &&
    checkpoint.signedUpdateArtifactsReady === false &&
    checkpoint.hardGateCommand === "npm run release:external-check" &&
    checkpoint.hardGateReady === false &&
    checkpoint.hardGateWouldFail === true &&
    checkpoint.privateValuesRecorded === false &&
    checkpoint.feedValueRecorded === false &&
    checkpoint.channelValueRecorded === false &&
    checkpoint.localEnvValueRecorded === false &&
    checkpoint.networkProbeAttempted === false &&
    checkpoint.updateFeedPublishAttempted === false &&
    checkpoint.releaseUploadAttempted === false &&
    checkpoint.signingAttempted === false &&
    checkpoint.notarySubmissionAttempted === false &&
    checkpoint.claimedAutoUpdate === false &&
    checkpoint.claimedExternalDistribution === false &&
    checkpoint.valueRecorded === false;
  return {
    updateFeedCheckpointSourceArtifact: "Release update-feed checkpoint",
    updateFeedCheckpointSourcePath: relative(updateFeedCheckpointJsonPath),
    updateFeedCheckpointSourceReady: sourceReady,
    updateFeedCheckpointReady: checkpointReady,
    updateFeedCheckpointMirrorsCurrentTenPlan:
      sourceReady && textValue(checkpoint.currentTenPlanProgressLabel, "none") === currentTenPlanWindowLabel,
    updateFeedCheckpointCommand: textValue(checkpoint?.reportCommand, "npm run release:update-feed-checkpoint-smoke"),
    updateFeedCheckpointRefreshCommandCount: integerValue(checkpoint?.refreshCommandCount),
    updateFeedCheckpointRefreshCommandSummary: textValue(
      checkpoint?.refreshCommandSummary,
      "npm run release:update-feed-post-edit-proof -> npm run release:update-feed-post-edit-proof-success-smoke"
    ),
    updateFeedCheckpointRefreshCommandRows: refreshRows,
    updateFeedCheckpointSourceArtifactRows: sourceRows,
    updateFeedCheckpointSourceArtifactRowCount: integerValue(checkpoint?.sourceArtifactRowCount),
    updateFeedCheckpointBranchRows: branchRows,
    updateFeedCheckpointBranchRowCount: integerValue(checkpoint?.branchRowCount),
    updateFeedCheckpointComparisonRows: comparisonRows,
    updateFeedCheckpointComparisonRowCount: integerValue(checkpoint?.comparisonRowCount),
    updateFeedCheckpointRealPostEditProofReady: checkpoint?.realPostEditProofReady === true,
    updateFeedCheckpointRealLiveCheckReady: checkpoint?.realLiveCheckReady === true,
    updateFeedCheckpointRealStrictReady: checkpoint?.realStrictReady === true,
    updateFeedCheckpointRealSelectedReadyCount: integerValue(checkpoint?.realSelectedReadyCount),
    updateFeedCheckpointRealPlaceholderKeyCount: realPlaceholderKeyCount,
    updateFeedCheckpointRealPlaceholderEditLocationCount: realPlaceholderEditLocationCount,
    updateFeedCheckpointRealAutoUpdateReady: checkpoint?.realAutoUpdateReady === true,
    updateFeedCheckpointRealAutoUpdateBlockerCount: integerValue(checkpoint?.realAutoUpdateBlockerCount),
    updateFeedCheckpointSyntheticPostEditProofReady: checkpoint?.syntheticPostEditProofReady === true,
    updateFeedCheckpointSyntheticLiveCheckReady: checkpoint?.syntheticLiveCheckReady === true,
    updateFeedCheckpointSyntheticStrictReady: checkpoint?.syntheticStrictReady === true,
    updateFeedCheckpointSyntheticSelectedReadyCount: integerValue(checkpoint?.syntheticSelectedReadyCount),
    updateFeedCheckpointSyntheticPlaceholderKeyCount: integerValue(checkpoint?.syntheticPlaceholderKeyCount),
    updateFeedCheckpointSyntheticPlaceholderEditLocationCount: integerValue(checkpoint?.syntheticPlaceholderEditLocationCount),
    updateFeedCheckpointSyntheticRealLocalEnvRead: checkpoint?.syntheticRealLocalEnvRead === true,
    updateFeedCheckpointSyntheticAutoUpdateReady: checkpoint?.syntheticAutoUpdateReady === true,
    updateFeedCheckpointSyntheticAutoUpdateBlockerCount: integerValue(checkpoint?.syntheticAutoUpdateBlockerCount),
    updateFeedCheckpointSignedUpdateArtifactsReady: checkpoint?.signedUpdateArtifactsReady === true,
    updateFeedCheckpointHardGateCommand: textValue(checkpoint?.hardGateCommand, "npm run release:external-check"),
    updateFeedCheckpointHardGateReady: checkpoint?.hardGateReady === true,
    updateFeedCheckpointHardGateWouldFail: checkpoint?.hardGateWouldFail === true,
    updateFeedCheckpointTenPlanProgressLabel: textValue(checkpoint?.currentTenPlanProgressLabel, "missing update-feed checkpoint"),
    updateFeedCheckpointValueRecorded: checkpoint?.valueRecorded === true ? true : false,
    updateFeedCheckpointPrivateValuesRecorded: checkpoint?.privateValuesRecorded === true,
    updateFeedCheckpointFeedValueRecorded: checkpoint?.feedValueRecorded === true,
    updateFeedCheckpointChannelValueRecorded: checkpoint?.channelValueRecorded === true,
    updateFeedCheckpointLocalEnvValueRecorded: checkpoint?.localEnvValueRecorded === true,
    updateFeedCheckpointNetworkProbeAttempted: checkpoint?.networkProbeAttempted === true,
    updateFeedCheckpointPublishAttempted: checkpoint?.updateFeedPublishAttempted === true,
    updateFeedCheckpointReleaseUploadAttempted: checkpoint?.releaseUploadAttempted === true,
    updateFeedCheckpointSigningAttempted: checkpoint?.signingAttempted === true,
    updateFeedCheckpointNotarySubmissionAttempted: checkpoint?.notarySubmissionAttempted === true,
    updateFeedCheckpointClaimedAutoUpdate: checkpoint?.claimedAutoUpdate === true,
    updateFeedCheckpointClaimedExternalDistribution: checkpoint?.claimedExternalDistribution === true
  };
}

function buildExternalProofBundleSummary(externalProofBundle) {
  const releaseChannelPostEditOperatorReceiptRows = valueFreeObjectRows(externalProofBundle.releaseChannelPostEditOperatorReceiptRows);
  const postEditProofSequenceReceiptRows = valueFreeObjectRows(externalProofBundle.postEditProofSequenceReceiptRows);
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
    externalProofBundleReleaseChannelPostEditOperatorReceiptReady:
      externalProofBundle.releaseChannelPostEditOperatorReceiptReady === true &&
      integerValue(externalProofBundle.releaseChannelPostEditOperatorReceiptRowCount) === releaseChannelPostEditOperatorReceiptRows.length &&
      releaseChannelPostEditOperatorReceiptRows.length === 7 &&
      releaseChannelPostEditOperatorReceiptRows.every((row) => row.ready === true && row.valueRecorded === false),
    externalProofBundleReleaseChannelPostEditOperatorReceiptRowCount: integerValue(externalProofBundle.releaseChannelPostEditOperatorReceiptRowCount),
    externalProofBundleReleaseChannelPostEditOperatorReceiptSummary: textValue(externalProofBundle.releaseChannelPostEditOperatorReceiptSummary, "none"),
    externalProofBundleReleaseChannelPostEditOperatorReceiptRows: releaseChannelPostEditOperatorReceiptRows,
    externalProofBundleReleaseChannelPostEditOperatorReceiptRecommendedProofCommand: textValue(
      externalProofBundle.releaseChannelPostEditOperatorReceiptRecommendedProofCommand,
      recommendedPrivateEditOperatorProofCommand
    ),
    externalProofBundleReleaseChannelPostEditOperatorReceiptRecommendedProofCommandRole: textValue(
      externalProofBundle.releaseChannelPostEditOperatorReceiptRecommendedProofCommandRole,
      "recommended strict-first proof chain after replacing the four private release-channel placeholders"
    ),
    externalProofBundleReleaseChannelPostEditOperatorReceiptRecommendedProofCommandValueRecorded:
      externalProofBundle.releaseChannelPostEditOperatorReceiptRecommendedProofCommandValueRecorded === true ? true : false,
    externalProofBundleReleaseChannelPostEditOperatorReceiptProofCommand: textValue(
      externalProofBundle.releaseChannelPostEditOperatorReceiptProofCommand,
      "npm run release:doctor"
    ),
    externalProofBundleReleaseChannelPostEditOperatorReceiptBlockerRefreshCommand: textValue(
      externalProofBundle.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand,
      "npm run release:current-blocker"
    ),
    externalProofBundleReleaseChannelPostEditOperatorReceiptNextActionsCommand: textValue(
      externalProofBundle.releaseChannelPostEditOperatorReceiptNextActionsCommand,
      "npm run release:next-actions"
    ),
    externalProofBundleReleaseChannelPostEditOperatorReceiptHardGateCommand: textValue(
      externalProofBundle.releaseChannelPostEditOperatorReceiptHardGateCommand,
      "npm run release:external-check"
    ),
    externalProofBundleReleaseChannelPostEditOperatorReceiptValueRecorded:
      externalProofBundle.releaseChannelPostEditOperatorReceiptValueRecorded === true ? true : false,
    externalProofBundlePostEditProofSequenceReceiptReady:
      externalProofBundle.postEditProofSequenceReceiptReady === true &&
      integerValue(externalProofBundle.postEditProofSequenceReceiptRowCount) === postEditProofSequenceReceiptRows.length &&
      postEditProofSequenceReceiptRows.length === 8 &&
      postEditProofSequenceReceiptRows.every((row) => row.ready === true && row.valueRecorded === false),
    externalProofBundlePostEditProofSequenceReceiptRowCount: integerValue(externalProofBundle.postEditProofSequenceReceiptRowCount),
    externalProofBundlePostEditProofSequenceReceiptSummary: textValue(externalProofBundle.postEditProofSequenceReceiptSummary, "none"),
    externalProofBundlePostEditProofSequenceReceiptRows: postEditProofSequenceReceiptRows,
    externalProofBundlePostEditProofSequenceReceiptRecommendedProofCommand: textValue(
      externalProofBundle.postEditProofSequenceReceiptRecommendedProofCommand,
      recommendedPrivateEditOperatorProofCommand
    ),
    externalProofBundlePostEditProofSequenceReceiptRecommendedProofCommandValueRecorded:
      externalProofBundle.postEditProofSequenceReceiptRecommendedProofCommandValueRecorded === true ? true : false,
    externalProofBundlePostEditProofSequenceReceiptDoctorCommand: textValue(
      externalProofBundle.postEditProofSequenceReceiptDoctorCommand,
      "npm run release:doctor"
    ),
    externalProofBundlePostEditProofSequenceReceiptCurrentBlockerCommand: textValue(
      externalProofBundle.postEditProofSequenceReceiptCurrentBlockerCommand,
      "npm run release:current-blocker"
    ),
    externalProofBundlePostEditProofSequenceReceiptNextActionsCommand: textValue(
      externalProofBundle.postEditProofSequenceReceiptNextActionsCommand,
      "npm run release:next-actions"
    ),
    externalProofBundlePostEditProofSequenceReceiptProofBundleCommand: textValue(
      externalProofBundle.postEditProofSequenceReceiptProofBundleCommand,
      "npm run release:proof-bundle"
    ),
    externalProofBundlePostEditProofSequenceReceiptProgressCommand: textValue(
      externalProofBundle.postEditProofSequenceReceiptProgressCommand,
      "npm run release:progress-smoke"
    ),
    externalProofBundlePostEditProofSequenceReceiptHardGateCommand: textValue(
      externalProofBundle.postEditProofSequenceReceiptHardGateCommand,
      "npm run release:external-check"
    ),
    externalProofBundlePostEditProofSequenceReceiptValueRecorded:
      externalProofBundle.postEditProofSequenceReceiptValueRecorded === true ? true : false,
    proofBundleDoctorPostEditProofSourceArtifact: "External proof bundle",
    proofBundleDoctorPostEditProofSourcePath: relative(externalProofBundleJsonPath),
    proofBundleDoctorPostEditProofSourceReady:
      externalProofBundle.proofBundleReady === true && externalProofBundle.doctorPostEditProofSourceReady === true,
    proofBundleDoctorPostEditProofProofBundleReady: externalProofBundle.proofBundleReady === true,
    proofBundleDoctorPostEditProofNextActionsSourceArtifact: textValue(externalProofBundle.doctorPostEditProofSourceArtifact, "External next actions"),
    proofBundleDoctorPostEditProofNextActionsSourcePath: textValue(externalProofBundle.doctorPostEditProofSourcePath, "none"),
    proofBundleDoctorPostEditProofNextActionsReady: externalProofBundle.doctorPostEditProofNextActionsReady === true,
    proofBundleDoctorPostEditProofDoctorSourceArtifact: textValue(externalProofBundle.doctorPostEditProofDoctorSourceArtifact, "Release doctor"),
    proofBundleDoctorPostEditProofDoctorSourcePath: textValue(externalProofBundle.doctorPostEditProofDoctorSourcePath, "none"),
    proofBundleDoctorPostEditProofDoctorReportReady: externalProofBundle.doctorPostEditProofDoctorReportReady === true,
    proofBundleDoctorPostEditProofCurrentActionId: textValue(externalProofBundle.doctorPostEditProofCurrentActionId, "none"),
    proofBundleDoctorPostEditProofCurrentActionLabel: textValue(externalProofBundle.doctorPostEditProofCurrentActionLabel, "none"),
    proofBundleDoctorPostEditProofCommand: textValue(externalProofBundle.doctorPostEditProofCommand, "none"),
    proofBundleDoctorPostEditProofRole: textValue(externalProofBundle.doctorPostEditProofRole, "none"),
    proofBundleDoctorPostEditProofMatchesRecommended: externalProofBundle.doctorPostEditProofMatchesRecommended === true,
    proofBundleDoctorPostEditProofMirrorsNextActions: externalProofBundle.doctorPostEditProofMirrorsNextActions === true,
    proofBundleDoctorPostEditProofValueRecorded: externalProofBundle.doctorPostEditProofValueRecorded === true ? true : false,
    proofBundleDoctorPostEditProofClaimedExternalDistribution:
      externalProofBundle.doctorPostEditProofClaimedExternalDistribution === true ? true : false,
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

function buildReleaseChannelLiveCheckSummary(releaseChannelLiveCheck) {
  const liveCheckRows = valueFreeObjectRows(releaseChannelLiveCheck.releaseChannelLiveCheckRows).map((row) => ({
    order: integerValue(row.order),
    key: textValue(row.key),
    kind: textValue(row.kind),
    present: row.present === true,
    placeholder: row.placeholder === true,
    shapeReady: row.shapeReady === true,
    currentReady: row.currentReady === true,
    expectedShape: textValue(row.expectedShape),
    editTarget: textValue(row.editTarget),
    line: Number.isInteger(row.line) ? row.line : null,
    proofCommand: textValue(row.proofCommand, "npm run release:channel-live-check"),
    rerunCommand: textValue(row.rerunCommand, "npm run release:doctor"),
    sourceField: textValue(row.sourceField, "releaseChannelLiveCheckRows"),
    valueRecorded: false
  }));
  const placeholderLocations = valueFreeObjectRows(releaseChannelLiveCheck.currentPlaceholderEditLocations).map((row) => ({
    key: textValue(row.key),
    file: textValue(row.file),
    line: Number.isInteger(row.line) ? row.line : null,
    placeholder: row.placeholder === true,
    valueRecorded: false
  }));
  return {
    sourceReleaseChannelLiveCheckReady: true,
    sourceReleaseChannelLiveCheckPath: relative(releaseChannelLiveCheckJsonPath),
    releaseChannelLiveCheckCommand: textValue(releaseChannelLiveCheck.reportCommand, "npm run release:channel-live-check"),
    releaseChannelFirstProofCommandAfterPrivateEdits: textValue(
      releaseChannelLiveCheck.reportCommand,
      "npm run release:channel-live-check"
    ),
    releaseChannelFirstProofCommandRole:
      "first value-free release-channel metadata check after ignored local env edits",
    releaseChannelFirstProofCommandValueRecorded: false,
    releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits: recommendedPrivateEditOperatorProofCommand,
    releaseChannelRecommendedOperatorProofCommandRole:
      "recommended strict-first proof chain after replacing the four private release-channel placeholders",
    releaseChannelRecommendedOperatorProofCommandValueRecorded: false,
    releaseChannelLiveCheckRefreshedByThisReport: true,
    releaseChannelLiveCheckReady: releaseChannelLiveCheck.releaseChannelLiveCheckReady === true,
    releaseChannelLiveCheckCurrentReadyCount: integerValue(releaseChannelLiveCheck.releaseChannelLiveCheckCurrentReadyCount),
    releaseChannelLiveCheckRowCount: integerValue(releaseChannelLiveCheck.releaseChannelLiveCheckRowCount),
    releaseChannelLiveCheckRowSummary: textValue(
      releaseChannelLiveCheck.releaseChannelLiveCheckSummary,
      `${liveCheckRows.filter((row) => row.currentReady === true).length}/${liveCheckRows.length} current release-channel metadata rows ready`
    ),
    releaseChannelLiveCheckRows: liveCheckRows,
    releaseChannelLiveCheckLocalEnvFileLoaded: releaseChannelLiveCheck.localEnvFileLoaded === true,
    releaseChannelLiveCheckCurrentEnvEditTarget: textValue(releaseChannelLiveCheck.currentEnvEditTarget, ".env.distribution.local"),
    releaseChannelLiveCheckCurrentRequiredKeyCount: integerValue(releaseChannelLiveCheck.currentRequiredKeyCount),
    releaseChannelLiveCheckCurrentRequiredKeys: stringArrayValue(releaseChannelLiveCheck.currentRequiredKeys),
    releaseChannelLiveCheckCurrentPlaceholderKeyCount: integerValue(releaseChannelLiveCheck.currentPlaceholderKeyCount),
    releaseChannelLiveCheckCurrentPlaceholderKeys: stringArrayValue(releaseChannelLiveCheck.currentPlaceholderKeys),
    releaseChannelLiveCheckCurrentPlaceholderEditLocationCount: integerValue(
      releaseChannelLiveCheck.currentPlaceholderEditLocationCount
    ),
    releaseChannelLiveCheckCurrentPlaceholderEditLocationSummary: textValue(
      releaseChannelLiveCheck.currentPlaceholderEditLocationSummary,
      placeholderLocations.length > 0 ? `${placeholderLocations.length} current placeholder edit locations` : "none"
    ),
    releaseChannelLiveCheckCurrentPlaceholderEditLocations: placeholderLocations,
    releaseChannelLiveCheckDoctorCommand: textValue(releaseChannelLiveCheck.doctorCommand, "npm run release:doctor"),
    releaseChannelLiveCheckCurrentBlockerCommand: textValue(
      releaseChannelLiveCheck.currentBlockerCommand,
      "npm run release:current-blocker"
    ),
    releaseChannelLiveCheckNextActionsCommand: textValue(
      releaseChannelLiveCheck.nextActionsCommand,
      "npm run release:next-actions"
    ),
    releaseChannelLiveCheckProofBundleCommand: textValue(
      releaseChannelLiveCheck.proofBundleCommand,
      "npm run release:proof-bundle"
    ),
    releaseChannelLiveCheckProgressCommand: textValue(
      releaseChannelLiveCheck.progressCommand,
      "npm run release:progress-smoke"
    ),
    releaseChannelLiveCheckHardGateCommand: textValue(
      releaseChannelLiveCheck.hardGateCommand,
      "npm run release:external-check"
    ),
    releaseChannelLiveCheckPrivateValuesRecorded: releaseChannelLiveCheck.privateValuesRecorded === true,
    releaseChannelLiveCheckNetworkProbeAttempted: releaseChannelLiveCheck.networkProbeAttempted === true,
    releaseChannelLiveCheckReleaseUploadAttempted: releaseChannelLiveCheck.releaseUploadAttempted === true,
    releaseChannelLiveCheckNotarySubmissionAttempted: releaseChannelLiveCheck.notarySubmissionAttempted === true,
    releaseChannelLiveCheckSigningAttempted: releaseChannelLiveCheck.signingAttempted === true,
    releaseChannelLiveCheckClaimedExternalDistribution:
      releaseChannelLiveCheck.releaseGateClaimedExternalDistribution === true,
    releaseChannelLiveCheckValueRecorded: false
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
- Current 10-plan report boundary: ${report.currentTenPlanReportBoundaryLabel}
- Next scheduled 10-plan progress report after delivery: ${report.nextScheduledTenPlanProgressReportLabel}
- 10-plan progress report receipt ready: ${report.tenPlanProgressReportReceiptReady ? "yes" : "no"}
- 10-plan progress report receipt rows: ${report.tenPlanProgressReportReceiptRowCount} (${report.tenPlanProgressReportReceiptSummary})
- 10-plan cadence rollover ready: ${report.tenPlanProgressReportRolloverReady ? "yes" : "no"}
- 10-plan cadence rollover rows: ${report.tenPlanProgressReportRolloverRowCount} (${report.tenPlanProgressReportRolloverSummary})
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
- Release-channel live-check source ready: ${report.sourceReleaseChannelLiveCheckReady ? "yes" : "no"}
- Release-channel live-check ready: ${report.releaseChannelLiveCheckReady ? "yes" : "no"}
- Release-channel live-check current-ready rows: ${report.releaseChannelLiveCheckCurrentReadyCount}/${report.releaseChannelLiveCheckRowCount}
- Release-channel live-check placeholder keys: ${report.releaseChannelLiveCheckCurrentPlaceholderKeyCount}
- Release-channel first proof after private edits: \`${report.releaseChannelFirstProofCommandAfterPrivateEdits}\`
- Release-channel recommended operator proof chain: \`${report.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits}\`
- Release-channel post-edit receipt ready: ${report.releaseChannelPostEditReceiptReady ? "yes" : "no"}
- Release-channel post-edit receipt rows: ${report.releaseChannelPostEditReceiptRowCount} (${report.releaseChannelPostEditReceiptSummary})
- Release-channel post-edit current-ready rows: ${report.releaseChannelPostEditReceiptCurrentReadyCount}/${report.releaseChannelPostEditReceiptRowCount}
- Release-channel post-edit operator receipt ready: ${report.releaseChannelPostEditOperatorReceiptReady ? "yes" : "no"}
- Release-channel post-edit operator receipt rows: ${report.releaseChannelPostEditOperatorReceiptRowCount} (${report.releaseChannelPostEditOperatorReceiptSummary})
- Release-channel post-edit operator recommended proof chain: \`${report.releaseChannelPostEditOperatorReceiptRecommendedProofCommand}\`
- Release-channel post-edit operator proof command: \`${report.releaseChannelPostEditOperatorReceiptProofCommand}\`
- Release-channel post-edit operator blocker refresh: \`${report.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand}\`
- Release-channel post-edit operator next-actions refresh: \`${report.releaseChannelPostEditOperatorReceiptNextActionsCommand}\`
- Post-edit proof sequence receipt ready: ${report.postEditProofSequenceReceiptReady ? "yes" : "no"}
- Post-edit proof sequence receipt rows: ${report.postEditProofSequenceReceiptRowCount} (${report.postEditProofSequenceReceiptSummary})
- Post-edit proof sequence recommended proof chain: \`${report.postEditProofSequenceReceiptRecommendedProofCommand}\`
- Post-edit proof sequence doctor command: \`${report.postEditProofSequenceReceiptDoctorCommand}\`
- Post-edit proof sequence current-blocker command: \`${report.postEditProofSequenceReceiptCurrentBlockerCommand}\`
- Post-edit proof sequence next-actions command: \`${report.postEditProofSequenceReceiptNextActionsCommand}\`
- Post-edit proof sequence proof-bundle command: \`${report.postEditProofSequenceReceiptProofBundleCommand}\`
- Post-edit proof sequence progress command: \`${report.postEditProofSequenceReceiptProgressCommand}\`
- Post-edit proof sequence hard-gate command: \`${report.postEditProofSequenceReceiptHardGateCommand}\`
- Proof-bundle doctor post-edit proof source ready: ${report.proofBundleDoctorPostEditProofSourceReady ? "yes" : "no"}
- Proof-bundle doctor post-edit proof command: \`${report.proofBundleDoctorPostEditProofCommand}\`
- Proof-bundle doctor post-edit proof matches recommended: ${report.proofBundleDoctorPostEditProofMatchesRecommended ? "yes" : "no"}
- Private-edit strict proof handoff source ready: ${report.privateEditStrictProofHandoffSourceReady ? "yes" : "no"}
- Private-edit strict proof handoff ready: ${report.privateEditStrictProofHandoffReady ? "yes" : "no"}
- Private-edit strict proof operator command: \`${report.privateEditStrictProofOperatorCommand}\`
- Private-edit strict proof blocked smoke ready: ${report.privateEditStrictProofBlockedReady ? "yes" : "no"}
- Private-edit strict proof success smoke ready: ${report.privateEditStrictProofSuccessReady ? "yes" : "no"}
- Update-feed checkpoint source ready: ${report.updateFeedCheckpointSourceReady ? "yes" : "no"}
- Update-feed checkpoint ready: ${report.updateFeedCheckpointReady ? "yes" : "no"}
- Update-feed checkpoint command: \`${report.updateFeedCheckpointCommand}\`
- Update-feed checkpoint real live-check ready: ${report.updateFeedCheckpointRealLiveCheckReady ? "yes" : "no"}
- Update-feed checkpoint synthetic live-check ready: ${report.updateFeedCheckpointSyntheticLiveCheckReady ? "yes" : "no"}
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
- Release-channel live-check to report: ${report.releaseChannelLiveCheckCurrentReadyCount}/${report.releaseChannelLiveCheckRowCount} current-ready rows; placeholders ${report.releaseChannelLiveCheckCurrentPlaceholderKeyCount}; command ${report.releaseChannelLiveCheckCommand}; first proof after private edits ${report.releaseChannelFirstProofCommandAfterPrivateEdits}; recommended operator proof chain ${report.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits}
- Release-channel post-edit receipt to report: ${report.releaseChannelPostEditReceiptRowCount} (${report.releaseChannelPostEditReceiptSummary}); current-ready rows ${report.releaseChannelPostEditReceiptCurrentReadyCount}/${report.releaseChannelPostEditReceiptRowCount}
- Release-channel post-edit operator receipt to report: ${report.releaseChannelPostEditOperatorReceiptRowCount} (${report.releaseChannelPostEditOperatorReceiptSummary}); recommended proof ${report.releaseChannelPostEditOperatorReceiptRecommendedProofCommand}; proof ${report.releaseChannelPostEditOperatorReceiptProofCommand}; blocker refresh ${report.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand}
- Post-edit proof sequence to report: ${report.postEditProofSequenceReceiptRowCount} (${report.postEditProofSequenceReceiptSummary}); recommended proof ${report.postEditProofSequenceReceiptRecommendedProofCommand}; next commands ${report.postEditProofSequenceReceiptDoctorCommand}, ${report.postEditProofSequenceReceiptCurrentBlockerCommand}, ${report.postEditProofSequenceReceiptNextActionsCommand}, ${report.postEditProofSequenceReceiptProofBundleCommand}, ${report.postEditProofSequenceReceiptProgressCommand}
- Proof-bundle doctor post-edit proof to report: ${report.proofBundleDoctorPostEditProofCommand}; matches recommended ${report.proofBundleDoctorPostEditProofMatchesRecommended ? "yes" : "no"}; source ${report.proofBundleDoctorPostEditProofSourceArtifact}
- Private-edit strict proof handoff to report: blocked ${report.privateEditStrictProofBlockedReady ? "ready" : "missing"}; success ${report.privateEditStrictProofSuccessReady ? "ready" : "missing"}; command ${report.privateEditStrictProofOperatorCommand}
- Update-feed checkpoint to report: source ${report.updateFeedCheckpointSourceReady ? "ready" : "missing"}; real live-check ${report.updateFeedCheckpointRealLiveCheckReady ? "ready" : "blocked"}; synthetic live-check ${report.updateFeedCheckpointSyntheticLiveCheckReady ? "ready" : "blocked"}; hard gate would fail ${report.updateFeedCheckpointHardGateWouldFail ? "yes" : "no"}; command ${report.updateFeedCheckpointCommand}
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
- Current 10-plan report boundary: ${report.currentTenPlanReportBoundaryLabel}
- Next 10-plan report at: ${planLabel(report.nextTenPlanProgressReportAt)}
- Next scheduled 10-plan progress report after delivery: ${report.nextScheduledTenPlanProgressReportLabel}
- 10-plan progress report receipt: ${report.tenPlanProgressReportReceiptRowCount} (${report.tenPlanProgressReportReceiptSummary})
- 10-plan cadence rollover: ${report.tenPlanProgressReportRolloverRowCount} (${report.tenPlanProgressReportRolloverSummary})
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

## 10-Plan Cadence Rollover

- Rollover ready: ${report.tenPlanProgressReportRolloverReady ? "yes" : "no"}
- Rollover rows: ${report.tenPlanProgressReportRolloverRowCount} (${report.tenPlanProgressReportRolloverSummary})
- Value recorded: ${report.tenPlanProgressReportRolloverValueRecorded ? "yes" : "no"}

| order | item | ready | evidence | source field | value recorded |
|---:|---|---:|---|---|---:|
${formatTenPlanCadenceRolloverRows(report.tenPlanProgressReportRolloverRows)}

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
- Release-channel live-check JSON: ${report.sourceReleaseChannelLiveCheckPath}
- Update-feed checkpoint JSON: ${report.updateFeedCheckpointSourcePath}

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

## Release-Channel Live Check

- Source ready: ${report.sourceReleaseChannelLiveCheckReady ? "yes" : "no"}
- Source path: ${report.sourceReleaseChannelLiveCheckPath}
- Refreshed by this report: ${report.releaseChannelLiveCheckRefreshedByThisReport ? "yes" : "no"}
- Command: \`${report.releaseChannelLiveCheckCommand}\`
- First proof after private edits: \`${report.releaseChannelFirstProofCommandAfterPrivateEdits}\`
- First proof role: ${report.releaseChannelFirstProofCommandRole}
- Recommended operator proof chain: \`${report.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits}\`
- Recommended operator proof role: ${report.releaseChannelRecommendedOperatorProofCommandRole}
- Live-check ready: ${report.releaseChannelLiveCheckReady ? "yes" : "no"}
- Current-ready rows: ${report.releaseChannelLiveCheckCurrentReadyCount}/${report.releaseChannelLiveCheckRowCount}
- Current env edit target: ${report.releaseChannelLiveCheckCurrentEnvEditTarget}
- Current required keys: ${report.releaseChannelLiveCheckCurrentRequiredKeyCount} (${report.releaseChannelLiveCheckCurrentRequiredKeys.join(", ") || "none"})
- Current placeholder keys: ${report.releaseChannelLiveCheckCurrentPlaceholderKeyCount} (${report.releaseChannelLiveCheckCurrentPlaceholderKeys.join(", ") || "none"})
- Current placeholder edit locations: ${report.releaseChannelLiveCheckCurrentPlaceholderEditLocationCount} (${report.releaseChannelLiveCheckCurrentPlaceholderEditLocationSummary})
- Doctor command: \`${report.releaseChannelLiveCheckDoctorCommand}\`
- Current blocker command: \`${report.releaseChannelLiveCheckCurrentBlockerCommand}\`
- Next-actions command: \`${report.releaseChannelLiveCheckNextActionsCommand}\`
- Proof bundle command: \`${report.releaseChannelLiveCheckProofBundleCommand}\`
- Progress command: \`${report.releaseChannelLiveCheckProgressCommand}\`
- Hard gate command: \`${report.releaseChannelLiveCheckHardGateCommand}\`
- Value recorded: ${report.releaseChannelLiveCheckValueRecorded ? "yes" : "no"}

| order | key | kind | present | placeholder | shape ready | current ready | expected shape | edit target | line | proof command | rerun command | value recorded |
|---:|---|---|---:|---:|---:|---:|---|---|---:|---|---|---:|
${formatReleaseChannelLiveCheckRows(report.releaseChannelLiveCheckRows)}

### Release-Channel Live Check Placeholder Locations

| key | file | line | placeholder | value recorded |
|---|---|---:|---:|---:|
${formatReleaseChannelLiveCheckLocations(report.releaseChannelLiveCheckCurrentPlaceholderEditLocations)}

## Release-Channel Post-Edit Receipt

- Receipt ready: ${report.releaseChannelPostEditReceiptReady ? "yes" : "no"}
- Receipt rows: ${report.releaseChannelPostEditReceiptRowCount} (${report.releaseChannelPostEditReceiptSummary})
- Current-ready rows: ${report.releaseChannelPostEditReceiptCurrentReadyCount}/${report.releaseChannelPostEditReceiptRowCount}
- Proof command: \`${report.releaseChannelPostEditReceiptProofCommand}\`
- Rerun command: \`${report.releaseChannelPostEditReceiptRerunCommand}\`
- Value recorded: ${report.releaseChannelPostEditReceiptValueRecorded ? "yes" : "no"}

| order | item | receipt ready | current ready | evidence | expected post-edit signal | proof command | source field | value recorded |
|---:|---|---:|---:|---|---|---|---|---:|
${formatReleaseChannelPostEditReceiptRows(report.releaseChannelPostEditReceiptRows)}

## Release-Channel Post-Edit Operator Receipt

- Receipt ready: ${report.releaseChannelPostEditOperatorReceiptReady ? "yes" : "no"}
- Receipt rows: ${report.releaseChannelPostEditOperatorReceiptRowCount} (${report.releaseChannelPostEditOperatorReceiptSummary})
- Recommended proof chain: \`${report.releaseChannelPostEditOperatorReceiptRecommendedProofCommand}\`
- Recommended proof chain role: ${report.releaseChannelPostEditOperatorReceiptRecommendedProofCommandRole}
- Proof command: \`${report.releaseChannelPostEditOperatorReceiptProofCommand}\`
- Current-blocker refresh command: \`${report.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand}\`
- Next-actions refresh command: \`${report.releaseChannelPostEditOperatorReceiptNextActionsCommand}\`
- Hard gate command: \`${report.releaseChannelPostEditOperatorReceiptHardGateCommand}\`
- Value recorded: ${report.releaseChannelPostEditOperatorReceiptValueRecorded ? "yes" : "no"}

| order | step | ready | current state | operator action | expected post-edit signal | command | proof command | rerun command | source | value recorded |
|---:|---|---:|---|---|---|---|---|---|---|---:|
${formatReleaseChannelPostEditOperatorReceiptRows(report.releaseChannelPostEditOperatorReceiptRows)}

## Post-Edit Proof Sequence Receipt

- Receipt ready: ${report.postEditProofSequenceReceiptReady ? "yes" : "no"}
- Receipt rows: ${report.postEditProofSequenceReceiptRowCount} (${report.postEditProofSequenceReceiptSummary})
- Recommended proof chain: \`${report.postEditProofSequenceReceiptRecommendedProofCommand}\`
- Doctor command: \`${report.postEditProofSequenceReceiptDoctorCommand}\`
- Current-blocker command: \`${report.postEditProofSequenceReceiptCurrentBlockerCommand}\`
- Next-actions command: \`${report.postEditProofSequenceReceiptNextActionsCommand}\`
- Proof-bundle command: \`${report.postEditProofSequenceReceiptProofBundleCommand}\`
- Progress command: \`${report.postEditProofSequenceReceiptProgressCommand}\`
- Hard-gate command: \`${report.postEditProofSequenceReceiptHardGateCommand}\`
- Value recorded: ${report.postEditProofSequenceReceiptValueRecorded ? "yes" : "no"}

| order | step | ready | command | expected evidence | source field | value recorded |
|---:|---|---:|---|---|---|---:|
${formatPostEditProofSequenceReceiptRows(report.postEditProofSequenceReceiptRows)}

## Proof-Bundle Doctor Post-Edit Proof Mirror

- Source artifact: ${report.proofBundleDoctorPostEditProofSourceArtifact}
- Source path: ${report.proofBundleDoctorPostEditProofSourcePath}
- Source ready: ${report.proofBundleDoctorPostEditProofSourceReady ? "yes" : "no"}
- Proof bundle ready: ${report.proofBundleDoctorPostEditProofProofBundleReady ? "yes" : "no"}
- Next-actions source artifact: ${report.proofBundleDoctorPostEditProofNextActionsSourceArtifact}
- Next-actions source path: ${report.proofBundleDoctorPostEditProofNextActionsSourcePath}
- Next-actions ready: ${report.proofBundleDoctorPostEditProofNextActionsReady ? "yes" : "no"}
- Doctor source artifact: ${report.proofBundleDoctorPostEditProofDoctorSourceArtifact}
- Doctor source path: ${report.proofBundleDoctorPostEditProofDoctorSourcePath}
- Doctor report ready: ${report.proofBundleDoctorPostEditProofDoctorReportReady ? "yes" : "no"}
- Current action: ${report.proofBundleDoctorPostEditProofCurrentActionLabel}
- Current action id: ${report.proofBundleDoctorPostEditProofCurrentActionId}
- Post-edit proof command: \`${report.proofBundleDoctorPostEditProofCommand}\`
- Post-edit proof role: ${report.proofBundleDoctorPostEditProofRole}
- Mirrors next-actions: ${report.proofBundleDoctorPostEditProofMirrorsNextActions ? "yes" : "no"}
- Matches recommended operator proof chain: ${report.proofBundleDoctorPostEditProofMatchesRecommended ? "yes" : "no"}
- Value recorded: ${report.proofBundleDoctorPostEditProofValueRecorded ? "yes" : "no"}
- External distribution claimed: ${report.proofBundleDoctorPostEditProofClaimedExternalDistribution ? "yes" : "no"}

## Private-Edit Strict Proof Handoff Mirror

- Source artifact: ${report.privateEditStrictProofHandoffSourceArtifact}
- Source ready: ${report.privateEditStrictProofHandoffSourceReady ? "yes" : "no"}
- Handoff ready: ${report.privateEditStrictProofHandoffReady ? "yes" : "no"}
- Operator command: \`${report.privateEditStrictProofOperatorCommand}\`
- Blocked smoke source path: ${report.privateEditStrictProofBlockedSourcePath}
- Blocked smoke source ready: ${report.privateEditStrictProofBlockedSourceReady ? "yes" : "no"}
- Blocked smoke ready: ${report.privateEditStrictProofBlockedReady ? "yes" : "no"}
- Blocked smoke command: \`${report.privateEditStrictProofBlockedCommand}\`
- Blocked smoke state: ${report.privateEditStrictProofBlockedState}
- Blocked handoff ready: ${report.privateEditStrictProofBlockedHandoffReady ? "yes" : "no"}
- Blocked handoff rows: ${report.privateEditStrictProofBlockedHandoffRowCount} (${report.privateEditStrictProofBlockedHandoffSummary})
- Blocked strict failure rows: ${report.privateEditStrictProofBlockedStrictFailureRowCount}
- Blocked placeholder keys: ${report.privateEditStrictProofBlockedPlaceholderKeyCount}
- Blocked progress refresh skipped: ${report.privateEditStrictProofBlockedProgressSkipped ? "yes" : "no"}
- Blocked real local env read: ${report.privateEditStrictProofBlockedRealLocalEnvRead ? "yes" : "no"}
- Blocked real local env modified: ${report.privateEditStrictProofBlockedRealLocalEnvModified ? "yes" : "no"}
- Success smoke source path: ${report.privateEditStrictProofSuccessSourcePath}
- Success smoke source ready: ${report.privateEditStrictProofSuccessSourceReady ? "yes" : "no"}
- Success smoke ready: ${report.privateEditStrictProofSuccessReady ? "yes" : "no"}
- Success smoke command: \`${report.privateEditStrictProofSuccessCommand}\`
- Success smoke state: ${report.privateEditStrictProofSuccessState}
- Success strict ready: ${report.privateEditStrictProofSuccessStrictReady ? "yes" : "no"}
- Success placeholder keys: ${report.privateEditStrictProofSuccessPlaceholderKeyCount}
- Success post-edit proof ready: ${report.privateEditStrictProofSuccessPostEditReady ? "yes" : "no"}
- Success progress refresh ready: ${report.privateEditStrictProofSuccessProgressRefreshReady ? "yes" : "no"}
- Success private-value leak audit ready: ${report.privateEditStrictProofSuccessLeakAuditReady ? "yes" : "no"}
- Success private-value leak findings: ${report.privateEditStrictProofSuccessLeakFindingCount}
- Success real local env read: ${report.privateEditStrictProofSuccessRealLocalEnvRead ? "yes" : "no"}
- Success real local env modified: ${report.privateEditStrictProofSuccessRealLocalEnvModified ? "yes" : "no"}
- Command rows: ${report.privateEditStrictProofCommandRowCount} (${report.privateEditStrictProofCommandSummary})
- Value recorded: ${report.privateEditStrictProofValueRecorded ? "yes" : "no"}
- Private values recorded: ${report.privateEditStrictProofPrivateValuesRecorded ? "yes" : "no"}
- Network probe attempted: ${report.privateEditStrictProofNetworkProbeAttempted ? "yes" : "no"}
- Auto-update claimed: ${report.privateEditStrictProofClaimedAutoUpdate ? "yes" : "no"}
- External distribution claimed: ${report.privateEditStrictProofClaimedExternalDistribution ? "yes" : "no"}

| order | command | role | status | value recorded |
|---:|---|---|---|---:|
${formatPrivateEditStrictProofCommandRows(report.privateEditStrictProofCommandRows)}

## Update-Feed Checkpoint Mirror

- Source artifact: ${report.updateFeedCheckpointSourceArtifact}
- Source path: ${report.updateFeedCheckpointSourcePath}
- Source ready: ${report.updateFeedCheckpointSourceReady ? "yes" : "no"}
- Checkpoint ready: ${report.updateFeedCheckpointReady ? "yes" : "no"}
- Mirrors current 10-plan progress: ${report.updateFeedCheckpointMirrorsCurrentTenPlan ? "yes" : "no"}
- Command: \`${report.updateFeedCheckpointCommand}\`
- Refresh command rows: ${report.updateFeedCheckpointRefreshCommandCount} (${report.updateFeedCheckpointRefreshCommandSummary})
- Source artifact rows: ${report.updateFeedCheckpointSourceArtifactRowCount}
- Branch rows: ${report.updateFeedCheckpointBranchRowCount}
- Comparison rows: ${report.updateFeedCheckpointComparisonRowCount}
- Real post-edit proof ready: ${report.updateFeedCheckpointRealPostEditProofReady ? "yes" : "no"}
- Real live-check ready: ${report.updateFeedCheckpointRealLiveCheckReady ? "yes" : "no"}
- Real strict ready: ${report.updateFeedCheckpointRealStrictReady ? "yes" : "no"}
- Real selected-ready rows: ${report.updateFeedCheckpointRealSelectedReadyCount}/2
- Real placeholder keys: ${report.updateFeedCheckpointRealPlaceholderKeyCount}
- Real placeholder edit locations: ${report.updateFeedCheckpointRealPlaceholderEditLocationCount}
- Real auto-update ready: ${report.updateFeedCheckpointRealAutoUpdateReady ? "yes" : "no"}
- Real auto-update blockers: ${report.updateFeedCheckpointRealAutoUpdateBlockerCount}
- Synthetic post-edit proof ready: ${report.updateFeedCheckpointSyntheticPostEditProofReady ? "yes" : "no"}
- Synthetic live-check ready: ${report.updateFeedCheckpointSyntheticLiveCheckReady ? "yes" : "no"}
- Synthetic strict ready: ${report.updateFeedCheckpointSyntheticStrictReady ? "yes" : "no"}
- Synthetic selected-ready rows: ${report.updateFeedCheckpointSyntheticSelectedReadyCount}/2
- Synthetic placeholder keys: ${report.updateFeedCheckpointSyntheticPlaceholderKeyCount}
- Synthetic placeholder edit locations: ${report.updateFeedCheckpointSyntheticPlaceholderEditLocationCount}
- Synthetic real local env read: ${report.updateFeedCheckpointSyntheticRealLocalEnvRead ? "yes" : "no"}
- Synthetic auto-update ready: ${report.updateFeedCheckpointSyntheticAutoUpdateReady ? "yes" : "no"}
- Synthetic auto-update blockers: ${report.updateFeedCheckpointSyntheticAutoUpdateBlockerCount}
- Signed update artifacts ready: ${report.updateFeedCheckpointSignedUpdateArtifactsReady ? "yes" : "no"}
- Hard gate command: \`${report.updateFeedCheckpointHardGateCommand}\`
- Hard gate ready: ${report.updateFeedCheckpointHardGateReady ? "yes" : "no"}
- Hard gate would fail: ${report.updateFeedCheckpointHardGateWouldFail ? "yes" : "no"}
- 10-plan progress: ${report.updateFeedCheckpointTenPlanProgressLabel}
- Value recorded: ${report.updateFeedCheckpointValueRecorded ? "yes" : "no"}
- Private values recorded: ${report.updateFeedCheckpointPrivateValuesRecorded ? "yes" : "no"}
- Feed values recorded: ${report.updateFeedCheckpointFeedValueRecorded ? "yes" : "no"}
- Channel values recorded: ${report.updateFeedCheckpointChannelValueRecorded ? "yes" : "no"}
- Local env values recorded: ${report.updateFeedCheckpointLocalEnvValueRecorded ? "yes" : "no"}
- Network probe attempted: ${report.updateFeedCheckpointNetworkProbeAttempted ? "yes" : "no"}
- Update feed publish attempted: ${report.updateFeedCheckpointPublishAttempted ? "yes" : "no"}
- Release upload attempted: ${report.updateFeedCheckpointReleaseUploadAttempted ? "yes" : "no"}
- Signing attempted: ${report.updateFeedCheckpointSigningAttempted ? "yes" : "no"}
- Apple notary submission attempted: ${report.updateFeedCheckpointNotarySubmissionAttempted ? "yes" : "no"}
- Auto-update claimed: ${report.updateFeedCheckpointClaimedAutoUpdate ? "yes" : "no"}
- External distribution claimed: ${report.updateFeedCheckpointClaimedExternalDistribution ? "yes" : "no"}

| label | path | present | ready | value recorded |
|---|---|---:|---:|---:|
${formatUpdateFeedCheckpointSourceRows(report.updateFeedCheckpointSourceArtifactRows)}

| label | mode | synthetic | proof | live-check | strict | selected | placeholders | edit locations | auto-update | blockers | signed artifacts | hard gate would fail | real local env read | ready | value recorded |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${formatUpdateFeedCheckpointBranchRows(report.updateFeedCheckpointBranchRows)}

| order | item | ready | evidence | source field | value recorded |
|---:|---|---:|---|---|---:|
${formatUpdateFeedCheckpointComparisonRows(report.updateFeedCheckpointComparisonRows)}

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

function runReleaseChannelLiveCheck() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", "release:channel-live-check"], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail("Could not run npm run release:channel-live-check.", result.error.message);
  }
  if (result.status !== 0) {
    fail(`npm run release:channel-live-check exited with status ${result.status}.`);
  }
}

if (!fromExisting) {
  runReleaseCheck();
}

runPersonaReadinessSmoke();
runReleaseChannelLiveCheck();

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
if (!existsSync(releaseChannelLiveCheckJsonPath)) {
  fail(
    "Release-channel live-check JSON was not generated.",
    `Expected: ${relative(releaseChannelLiveCheckJsonPath)}`
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
const releaseChannelLiveCheck = JSON.parse(await readFile(releaseChannelLiveCheckJsonPath, "utf8"));
const privateEditStrictProofBlockedSmoke = await readJsonIfPresent(privateEditStrictProofBlockedJsonPath);
const privateEditStrictProofSuccessSmoke = await readJsonIfPresent(privateEditStrictProofSuccessJsonPath);
const updateFeedCheckpoint = await readJsonIfPresent(updateFeedCheckpointJsonPath);
const externalProofBundleSummary = buildExternalProofBundleSummary(externalProofBundle);
const externalGateCurrentProofSummary = buildExternalGateCurrentProofSummary(externalGate, externalProofBundleSummary);
const releaseChannelUnblockSummary = buildReleaseChannelUnblockSummary(releaseChannelUnblock);
const releaseChannelLiveCheckSummary = buildReleaseChannelLiveCheckSummary(releaseChannelLiveCheck);
const privateEditStrictProofHandoffSummary = buildPrivateEditStrictProofHandoffSummary({
  blockedSmoke: privateEditStrictProofBlockedSmoke,
  successSmoke: privateEditStrictProofSuccessSmoke
});
const audienceReadinessSummary = buildAudienceReadinessSummary(personaReadiness);
const completedPlanSummary = await buildCompletedPlanSummary();
const updateFeedCheckpointSummary = buildUpdateFeedCheckpointSummary({
  checkpoint: updateFeedCheckpoint,
  currentTenPlanWindowLabel: completedPlanSummary.currentTenPlanWindowLabel
});
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
  ...releaseChannelLiveCheckSummary,
  ...privateEditStrictProofHandoffSummary,
  ...updateFeedCheckpointSummary,
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
Object.assign(releaseProgressReport, buildTenPlanCadenceRolloverSummary(releaseProgressReport));
Object.assign(releaseProgressReport, buildReleaseChannelPostEditReceiptSummary(releaseProgressReport));
Object.assign(releaseProgressReport, buildReleaseChannelPostEditOperatorReceiptSummary(releaseProgressReport));
Object.assign(releaseProgressReport, buildPostEditProofSequenceReceiptSummary(releaseProgressReport));

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
check(releaseProgressReport.currentTenPlanReportBoundaryAt === releaseProgressReport.currentTenPlanWindowEnd, "release progress report current report boundary should match current window end");
check(releaseProgressReport.currentTenPlanReportBoundaryLabel === planLabel(releaseProgressReport.currentTenPlanReportBoundaryAt), "release progress report current report boundary label should match boundary number");
check(releaseProgressReport.nextTenPlanProgressReportAt === releaseProgressReport.currentTenPlanReportBoundaryAt, "release progress report should identify the current 10-plan report boundary number");
const expectedNextScheduledTenPlanProgressReportAt = releaseProgressReport.tenPlanProgressReportDue
  ? releaseProgressReport.currentTenPlanWindowEnd + releaseProgressReport.currentTenPlanWindowTotal
  : releaseProgressReport.currentTenPlanWindowEnd;
check(releaseProgressReport.nextScheduledTenPlanProgressReportAt === expectedNextScheduledTenPlanProgressReportAt, "release progress report should derive the next scheduled 10-plan report after delivery");
check(releaseProgressReport.nextScheduledTenPlanProgressReportLabel === planLabel(releaseProgressReport.nextScheduledTenPlanProgressReportAt), "release progress report next scheduled label should match next scheduled report number");
check(releaseProgressReport.completedPlanValueRecorded === false, "release progress report should not record completed plan values beyond filenames and counts");
check(releaseProgressReport.tenPlanProgressReportReceiptReady === true, "release progress report 10-plan progress report receipt should be ready");
check(releaseProgressReport.tenPlanProgressReportReceiptRowCount === releaseProgressReport.tenPlanProgressReportReceiptRows.length, "release progress report 10-plan receipt row count should match rows");
check(releaseProgressReport.tenPlanProgressReportReceiptRowCount >= 7, "release progress report 10-plan receipt should include cadence, window, completed rows, due, completion, blocker, and next scheduled rows");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.every((row) => row.valueRecorded === false), "release progress report 10-plan receipt rows should not record values");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "10-plan cadence" && row.evidence.includes("every 10 completed plans")), "release progress report 10-plan receipt should include report cadence");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "Current 10-plan window" && row.evidence.includes(releaseProgressReport.currentTenPlanWindowLabel)), "release progress report 10-plan receipt should include current 10-plan window");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "Completed plan rows" && row.evidence.includes(`${releaseProgressReport.currentTenPlanWindowRowCount} value-free completed plan filenames`)), "release progress report 10-plan receipt should include completed plan row coverage");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "10-plan report due posture" && row.evidence.includes(`due ${releaseProgressReport.tenPlanProgressReportDue ? "yes" : "no"}`)), "release progress report 10-plan receipt should include due posture");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "Completion posture" && row.evidence.includes(formatUserPercent(releaseProgressReport.userFacingCompletionPercent)) && row.evidence.includes(formatUserPercent(releaseProgressReport.userFacingRemainingPercent))), "release progress report 10-plan receipt should include completion and remaining percentages");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "Current blocker" && row.evidence === releaseProgressReport.userFacingNextBlocker), "release progress report 10-plan receipt should include current blocker");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.some((row) => row.item === "Next scheduled report after delivery" && row.evidence === releaseProgressReport.nextScheduledTenPlanProgressReportLabel), "release progress report 10-plan receipt should include next scheduled report after delivery");
check(releaseProgressReport.tenPlanProgressReportReceiptRows.every((row) => typeof row.sourceField === "string" && row.sourceField.length > 0), "release progress report 10-plan receipt rows should identify source fields");
check(releaseProgressReport.tenPlanProgressReportReceiptValueRecorded === false, "release progress report 10-plan receipt should not record values");
check(releaseProgressReport.tenPlanProgressReportRolloverReady === true, "release progress report 10-plan rollover should be ready");
check(Array.isArray(releaseProgressReport.tenPlanProgressReportRolloverRows), "release progress report should include 10-plan rollover rows");
check(releaseProgressReport.tenPlanProgressReportRolloverRowCount === releaseProgressReport.tenPlanProgressReportRolloverRows.length, "release progress report 10-plan rollover row count should match rows");
check(releaseProgressReport.tenPlanProgressReportRolloverRowCount === 2, "release progress report should include current-boundary and next-scheduled rollover rows");
check(releaseProgressReport.tenPlanProgressReportRolloverRows.every((row) => row.valueRecorded === false), "release progress report 10-plan rollover rows should not record values");
check(releaseProgressReport.tenPlanProgressReportRolloverRows.some((row) => row.item === "Current report boundary" && row.evidence === releaseProgressReport.currentTenPlanReportBoundaryLabel), "release progress report 10-plan rollover should include current report boundary");
check(releaseProgressReport.tenPlanProgressReportRolloverRows.some((row) => row.item === "Next scheduled report after delivery" && row.evidence === releaseProgressReport.nextScheduledTenPlanProgressReportLabel), "release progress report 10-plan rollover should include next scheduled report");
check(releaseProgressReport.tenPlanProgressReportRolloverValueRecorded === false, "release progress report 10-plan rollover should not record values");
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
check(releaseProgressReport.sourceReleaseChannelLiveCheckReady === true, "release progress report should include ready release-channel live-check source evidence");
check(releaseProgressReport.sourceReleaseChannelLiveCheckPath === relative(releaseChannelLiveCheckJsonPath), "release progress report should identify the release-channel live-check source path");
check(releaseProgressReport.releaseChannelLiveCheckCommand === "npm run release:channel-live-check", "release progress report should identify the release-channel live-check command");
check(releaseProgressReport.releaseChannelFirstProofCommandAfterPrivateEdits === "npm run release:channel-live-check", "release progress report should identify live-check as the first proof after private edits");
check(releaseProgressReport.releaseChannelFirstProofCommandAfterPrivateEdits === releaseProgressReport.releaseChannelLiveCheckCommand, "release progress report first proof command should match live-check command");
check(releaseProgressReport.releaseChannelFirstProofCommandAfterPrivateEdits !== releaseProgressReport.releaseChannelLiveCheckDoctorCommand, "release progress report should keep first proof narrower than release doctor");
check(releaseProgressReport.releaseChannelFirstProofCommandRole === "first value-free release-channel metadata check after ignored local env edits", "release progress report should describe the live-check first proof role");
check(releaseProgressReport.releaseChannelFirstProofCommandValueRecorded === false, "release progress report first proof command should not record values");
check(releaseProgressReport.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits === recommendedPrivateEditOperatorProofCommand, "release progress report should recommend the private edit strict proof chain after private edits");
check(releaseProgressReport.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits !== releaseProgressReport.releaseChannelFirstProofCommandAfterPrivateEdits, "release progress report should distinguish the operator proof chain from the narrow first proof");
check(releaseProgressReport.releaseChannelRecommendedOperatorProofCommandRole === "recommended strict-first proof chain after replacing the four private release-channel placeholders", "release progress report should describe the strict proof chain role");
check(releaseProgressReport.releaseChannelRecommendedOperatorProofCommandValueRecorded === false, "release progress report operator proof chain command should not record values");
check(releaseProgressReport.releaseChannelLiveCheckRefreshedByThisReport === true, "release progress report should refresh release-channel live check");
check(releaseProgressReport.releaseChannelLiveCheckRowCount === releaseProgressReport.releaseChannelLiveCheckRows.length, "release progress report live-check row count should match rows");
check(releaseProgressReport.releaseChannelLiveCheckRowCount === 4, "release progress report should mirror four release-channel live-check rows");
check(releaseProgressReport.releaseChannelLiveCheckCurrentReadyCount === releaseProgressReport.releaseChannelLiveCheckRows.filter((row) => row.currentReady === true).length, "release progress report live-check current-ready count should match rows");
check(releaseProgressReport.releaseChannelLiveCheckReady === (releaseProgressReport.releaseChannelLiveCheckCurrentReadyCount === releaseProgressReport.releaseChannelLiveCheckRowCount), "release progress report live-check readiness should match current-ready rows");
check(releaseProgressReport.releaseChannelLiveCheckRows.every((row) => row.valueRecorded === false), "release progress report live-check rows should not record values");
check(releaseProgressReport.releaseChannelLiveCheckRows.every((row) => typeof row.expectedShape === "string" && row.expectedShape.length > 0), "release progress report live-check rows should include expected shapes");
check(releaseProgressReport.releaseChannelLiveCheckRows.every((row) => row.proofCommand === "npm run release:channel-live-check"), "release progress report live-check rows should mirror live-check command");
check(releaseProgressReport.releaseChannelLiveCheckRows.every((row) => row.rerunCommand === "npm run release:doctor"), "release progress report live-check rows should keep release doctor as rerun command");
check(releaseProgressReport.releaseChannelLiveCheckCurrentRequiredKeyCount === 4, "release progress report live-check should list four current required keys");
check(releaseProgressReport.releaseChannelLiveCheckCurrentRequiredKeys.length === releaseProgressReport.releaseChannelLiveCheckCurrentRequiredKeyCount, "release progress report live-check required key count should match names");
check(releaseProgressReport.releaseChannelLiveCheckCurrentPlaceholderKeyCount === releaseProgressReport.releaseChannelLiveCheckCurrentPlaceholderKeys.length, "release progress report live-check placeholder count should match names");
check(
  releaseProgressReport.releaseChannelLiveCheckCurrentPlaceholderKeyCount === releaseProgressReport.releaseChannelLiveCheckRows.filter((row) => row.placeholder === true).length,
  "release progress report live-check placeholder count should match rows"
);
check(
  releaseProgressReport.releaseChannelLiveCheckCurrentPlaceholderEditLocationCount === releaseProgressReport.releaseChannelLiveCheckCurrentPlaceholderEditLocations.length,
  "release progress report live-check placeholder edit location count should match rows"
);
check(
  releaseProgressReport.releaseChannelLiveCheckCurrentPlaceholderEditLocations.every((row) => row.valueRecorded === false),
  "release progress report live-check placeholder edit locations should not record values"
);
check(releaseProgressReport.releaseChannelLiveCheckDoctorCommand === "npm run release:doctor", "release progress report live-check should mirror doctor command");
check(releaseProgressReport.releaseChannelLiveCheckCurrentBlockerCommand === "npm run release:current-blocker", "release progress report live-check should mirror current-blocker command");
check(releaseProgressReport.releaseChannelLiveCheckNextActionsCommand === "npm run release:next-actions", "release progress report live-check should mirror next-actions command");
check(releaseProgressReport.releaseChannelLiveCheckProofBundleCommand === "npm run release:proof-bundle", "release progress report live-check should mirror proof-bundle command");
check(releaseProgressReport.releaseChannelLiveCheckProgressCommand === "npm run release:progress-smoke", "release progress report live-check should mirror progress command");
check(releaseProgressReport.releaseChannelLiveCheckHardGateCommand === "npm run release:external-check", "release progress report live-check should mirror hard-gate command");
check(releaseProgressReport.releaseChannelLiveCheckPrivateValuesRecorded === false, "release progress report live-check evidence should not record private values");
check(releaseProgressReport.releaseChannelLiveCheckNetworkProbeAttempted === false, "release progress report live-check evidence should not probe network");
check(releaseProgressReport.releaseChannelLiveCheckReleaseUploadAttempted === false, "release progress report live-check evidence should not upload releases");
check(releaseProgressReport.releaseChannelLiveCheckNotarySubmissionAttempted === false, "release progress report live-check evidence should not submit to Apple");
check(releaseProgressReport.releaseChannelLiveCheckSigningAttempted === false, "release progress report live-check evidence should not sign artifacts");
check(releaseProgressReport.releaseChannelLiveCheckClaimedExternalDistribution === false, "release progress report live-check evidence should not claim external distribution");
check(releaseProgressReport.releaseChannelLiveCheckValueRecorded === false, "release progress report should not record release-channel live-check values");
check(releaseProgressReport.releaseChannelPostEditReceiptReady === true, "release progress report release-channel post-edit receipt should be ready");
check(releaseProgressReport.releaseChannelPostEditReceiptRowCount === releaseProgressReport.releaseChannelPostEditReceiptRows.length, "release progress report post-edit receipt row count should match rows");
check(releaseProgressReport.releaseChannelPostEditReceiptRowCount === 6, "release progress report post-edit receipt should include six rows");
check(releaseProgressReport.releaseChannelPostEditReceiptRows.every((row) => row.valueRecorded === false), "release progress report post-edit receipt rows should not record values");
check(releaseProgressReport.releaseChannelPostEditReceiptRows.every((row) => row.ready === true), "release progress report post-edit receipt rows should be receipt-ready");
check(releaseProgressReport.releaseChannelPostEditReceiptRows.every((row) => typeof row.expectedPostEditSignal === "string" && row.expectedPostEditSignal.length > 0), "release progress report post-edit receipt rows should include expected post-edit signals");
check(releaseProgressReport.releaseChannelPostEditReceiptRows.every((row) => typeof row.sourceField === "string" && row.sourceField.length > 0), "release progress report post-edit receipt rows should include source fields");
check(releaseProgressReport.releaseChannelPostEditReceiptRows.some((row) => row.item === "Current key coverage" && row.evidence.includes("4 required release-channel keys")), "release progress report post-edit receipt should include required key coverage");
check(releaseProgressReport.releaseChannelPostEditReceiptRows.some((row) => row.item === "Shape rehearsal coverage" && row.evidence.includes("value-free release-channel unblock rows")), "release progress report post-edit receipt should include shape rehearsal coverage");
check(releaseProgressReport.releaseChannelPostEditReceiptRows.some((row) => row.item === "Placeholder cleanup acceptance" && row.expectedPostEditSignal.includes("0 current placeholder keys")), "release progress report post-edit receipt should include placeholder cleanup acceptance");
check(releaseProgressReport.releaseChannelPostEditReceiptRows.some((row) => row.item === "Proof and rerun sequence" && row.proofCommand === "npm run release:doctor" && row.rerunCommand === "npm run release:current-blocker"), "release progress report post-edit receipt should include proof and rerun sequence");
check(releaseProgressReport.releaseChannelPostEditReceiptRows.some((row) => row.item === "Acceptance evidence coverage" && row.expectedPostEditSignal.includes("private-input")), "release progress report post-edit receipt should include acceptance evidence coverage");
check(releaseProgressReport.releaseChannelPostEditReceiptRows.some((row) => row.item === "Hard gate separation" && row.proofCommand === "npm run release:external-check"), "release progress report post-edit receipt should include hard gate separation");
check(releaseProgressReport.releaseChannelPostEditReceiptCurrentReadyCount === releaseProgressReport.releaseChannelPostEditReceiptRows.filter((row) => row.currentReady === true).length, "release progress report post-edit receipt current-ready count should match rows");
check(releaseProgressReport.releaseChannelPostEditReceiptProofCommand === "npm run release:doctor", "release progress report post-edit receipt should keep release doctor as proof command");
check(releaseProgressReport.releaseChannelPostEditReceiptRerunCommand === "npm run release:current-blocker", "release progress report post-edit receipt should keep current-blocker as rerun command");
check(releaseProgressReport.releaseChannelPostEditReceiptValueRecorded === false, "release progress report post-edit receipt should not record values");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptReady === true, "release progress report release-channel post-edit operator receipt should be ready");
check(
  releaseProgressReport.releaseChannelPostEditOperatorReceiptReady ===
    releaseProgressReport.externalProofBundleReleaseChannelPostEditOperatorReceiptReady,
  "release progress report should mirror external proof post-edit operator receipt readiness"
);
check(
  releaseProgressReport.releaseChannelPostEditOperatorReceiptRowCount ===
    releaseProgressReport.externalProofBundleReleaseChannelPostEditOperatorReceiptRowCount,
  "release progress report should mirror external proof post-edit operator receipt row count"
);
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptRowCount === releaseProgressReport.releaseChannelPostEditOperatorReceiptRows.length, "release progress report post-edit operator receipt row count should match rows");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptRowCount === 7, "release progress report post-edit operator receipt should include seven rows");
check(
  sameJson(
    releaseProgressReport.releaseChannelPostEditOperatorReceiptRows,
    releaseProgressReport.externalProofBundleReleaseChannelPostEditOperatorReceiptRows
  ),
  "release progress report should mirror external proof post-edit operator receipt rows"
);
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptRows.every((row) => row.ready === true && row.valueRecorded === false), "release progress report post-edit operator receipt rows should be ready and value-free");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptRows.every((row) => typeof row.operatorAction === "string" && row.operatorAction.length > 0), "release progress report post-edit operator receipt rows should include operator actions");
check(
  releaseProgressReport.releaseChannelPostEditOperatorReceiptRows.some(
    (row) => row.step === "Edit target" && row.operatorAction.includes(releaseProgressReport.externalProofBundleCurrentEnvEditTarget)
  ),
  "release progress report post-edit operator receipt should include ignored edit target"
);
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Recommended strict proof chain" && row.command === recommendedPrivateEditOperatorProofCommand), "release progress report post-edit operator receipt should include recommended strict proof chain");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Release doctor proof" && row.command === "npm run release:doctor"), "release progress report post-edit operator receipt should include release doctor proof");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Current blocker refresh" && row.command === "npm run release:current-blocker"), "release progress report post-edit operator receipt should include current-blocker refresh");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Next-actions refresh" && row.command === "npm run release:next-actions"), "release progress report post-edit operator receipt should include next-actions refresh");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Hard-gate boundary" && row.command === "npm run release:external-check"), "release progress report post-edit operator receipt should include hard-gate boundary");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptRows.some((row) => row.step === "Value redaction" && row.expectedPostEditSignal.includes("private URL/channel values never appear")), "release progress report post-edit operator receipt should include value redaction");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptRecommendedProofCommand === recommendedPrivateEditOperatorProofCommand, "release progress report post-edit operator receipt should expose recommended strict proof chain");
check(
  releaseProgressReport.releaseChannelPostEditOperatorReceiptRecommendedProofCommand ===
    releaseProgressReport.externalProofBundleReleaseChannelPostEditOperatorReceiptRecommendedProofCommand,
  "release progress report should mirror external proof recommended operator proof command"
);
check(
  releaseProgressReport.releaseChannelPostEditOperatorReceiptRecommendedProofCommandRole ===
    releaseProgressReport.externalProofBundleReleaseChannelPostEditOperatorReceiptRecommendedProofCommandRole,
  "release progress report should mirror external proof recommended operator proof role"
);
check(
  releaseProgressReport.releaseChannelPostEditOperatorReceiptRecommendedProofCommandValueRecorded === false &&
    releaseProgressReport.externalProofBundleReleaseChannelPostEditOperatorReceiptRecommendedProofCommandValueRecorded === false,
  "release progress report recommended operator proof command should be value-free"
);
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptProofCommand === "npm run release:doctor", "release progress report post-edit operator receipt should keep release doctor as proof command");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand === "npm run release:current-blocker", "release progress report post-edit operator receipt should keep current-blocker as blocker refresh command");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptNextActionsCommand === "npm run release:next-actions", "release progress report post-edit operator receipt should keep next-actions as refresh command");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptHardGateCommand === "npm run release:external-check", "release progress report post-edit operator receipt should keep hard-gate command");
check(releaseProgressReport.releaseChannelPostEditOperatorReceiptValueRecorded === false, "release progress report post-edit operator receipt should not record values");
check(releaseProgressReport.postEditProofSequenceReceiptReady === true, "release progress report post-edit proof sequence receipt should be ready");
check(
  releaseProgressReport.externalProofBundlePostEditProofSequenceReceiptReady === true,
  "release progress report should include ready external proof post-edit proof sequence receipt"
);
check(
  releaseProgressReport.postEditProofSequenceReceiptReady ===
    releaseProgressReport.externalProofBundlePostEditProofSequenceReceiptReady,
  "release progress report should mirror external proof post-edit proof sequence readiness"
);
check(
  releaseProgressReport.postEditProofSequenceReceiptRowCount ===
    releaseProgressReport.externalProofBundlePostEditProofSequenceReceiptRowCount,
  "release progress report should mirror external proof post-edit proof sequence row count"
);
check(releaseProgressReport.postEditProofSequenceReceiptRowCount === releaseProgressReport.postEditProofSequenceReceiptRows.length, "release progress report post-edit proof sequence row count should match rows");
check(releaseProgressReport.postEditProofSequenceReceiptRowCount === 8, "release progress report post-edit proof sequence receipt should include eight rows");
check(
  sameJson(
    releaseProgressReport.postEditProofSequenceReceiptRows,
    releaseProgressReport.externalProofBundlePostEditProofSequenceReceiptRows
  ),
  "release progress report should mirror external proof post-edit proof sequence rows"
);
check(releaseProgressReport.postEditProofSequenceReceiptRows.every((row) => row.ready === true && row.valueRecorded === false), "release progress report post-edit proof sequence rows should be ready and value-free");
check(releaseProgressReport.postEditProofSequenceReceiptRows.every((row) => typeof row.expectedEvidence === "string" && row.expectedEvidence.length > 0), "release progress report post-edit proof sequence rows should include expected evidence");
check(releaseProgressReport.postEditProofSequenceReceiptRows.every((row) => typeof row.sourceField === "string" && row.sourceField.length > 0), "release progress report post-edit proof sequence rows should include source fields");
check(
  releaseProgressReport.postEditProofSequenceReceiptRows.some(
    (row) => row.step === "Private value edit" && row.command === releaseChannelApplyPrivateEnvCommand
  ),
  "release progress report post-edit proof sequence should include the private env apply helper"
);
check(releaseProgressReport.postEditProofSequenceReceiptRows.some((row) => row.step === "Recommended strict proof chain" && row.command === recommendedPrivateEditOperatorProofCommand), "release progress report post-edit proof sequence should include recommended strict proof chain");
check(releaseProgressReport.postEditProofSequenceReceiptRows.some((row) => row.step === "Release doctor proof" && row.command === "npm run release:doctor"), "release progress report post-edit proof sequence should include release doctor proof");
check(releaseProgressReport.postEditProofSequenceReceiptRows.some((row) => row.step === "Current-blocker refresh" && row.command === "npm run release:current-blocker"), "release progress report post-edit proof sequence should include current-blocker refresh");
check(releaseProgressReport.postEditProofSequenceReceiptRows.some((row) => row.step === "Next-actions refresh" && row.command === "npm run release:next-actions"), "release progress report post-edit proof sequence should include next-actions refresh");
check(releaseProgressReport.postEditProofSequenceReceiptRows.some((row) => row.step === "Proof bundle refresh" && row.command === "npm run release:proof-bundle"), "release progress report post-edit proof sequence should include proof-bundle refresh");
check(releaseProgressReport.postEditProofSequenceReceiptRows.some((row) => row.step === "Progress refresh" && row.command === "npm run release:progress-smoke"), "release progress report post-edit proof sequence should include progress refresh");
check(releaseProgressReport.postEditProofSequenceReceiptRows.some((row) => row.step === "Hard-gate boundary" && row.command === "npm run release:external-check"), "release progress report post-edit proof sequence should include hard-gate boundary");
check(releaseProgressReport.postEditProofSequenceReceiptRecommendedProofCommand === recommendedPrivateEditOperatorProofCommand, "release progress report post-edit proof sequence should expose recommended strict proof chain");
check(
  releaseProgressReport.postEditProofSequenceReceiptRecommendedProofCommand ===
    releaseProgressReport.externalProofBundlePostEditProofSequenceReceiptRecommendedProofCommand,
  "release progress report should mirror external proof recommended post-edit proof command"
);
check(
  releaseProgressReport.postEditProofSequenceReceiptRecommendedProofCommandValueRecorded === false &&
    releaseProgressReport.externalProofBundlePostEditProofSequenceReceiptRecommendedProofCommandValueRecorded === false,
  "release progress report recommended post-edit proof command should be value-free"
);
check(releaseProgressReport.postEditProofSequenceReceiptDoctorCommand === "npm run release:doctor", "release progress report post-edit proof sequence should keep release doctor command");
check(releaseProgressReport.postEditProofSequenceReceiptCurrentBlockerCommand === "npm run release:current-blocker", "release progress report post-edit proof sequence should keep current-blocker command");
check(releaseProgressReport.postEditProofSequenceReceiptNextActionsCommand === "npm run release:next-actions", "release progress report post-edit proof sequence should keep next-actions command");
check(releaseProgressReport.postEditProofSequenceReceiptProofBundleCommand === "npm run release:proof-bundle", "release progress report post-edit proof sequence should keep proof-bundle command");
check(releaseProgressReport.postEditProofSequenceReceiptProgressCommand === "npm run release:progress-smoke", "release progress report post-edit proof sequence should keep progress-smoke command");
check(releaseProgressReport.postEditProofSequenceReceiptHardGateCommand === "npm run release:external-check", "release progress report post-edit proof sequence should keep hard-gate command");
check(releaseProgressReport.postEditProofSequenceReceiptValueRecorded === false, "release progress report post-edit proof sequence should not record values");
check(releaseProgressReport.proofBundleDoctorPostEditProofSourceArtifact === "External proof bundle", "release progress report should identify the proof bundle as the doctor post-edit proof mirror source");
check(releaseProgressReport.proofBundleDoctorPostEditProofSourcePath === relative(externalProofBundleJsonPath), "release progress report should include the proof bundle doctor post-edit proof source path");
check(releaseProgressReport.proofBundleDoctorPostEditProofSourceReady === true, "release progress report should report ready proof-bundle doctor post-edit proof source evidence");
check(releaseProgressReport.proofBundleDoctorPostEditProofProofBundleReady === releaseProgressReport.externalProofBundleReady, "release progress report should tie doctor post-edit proof source readiness to proof-bundle readiness");
check(releaseProgressReport.proofBundleDoctorPostEditProofNextActionsSourceArtifact === "External next actions", "release progress report should keep external next-actions as the doctor post-edit proof upstream source");
check(typeof releaseProgressReport.proofBundleDoctorPostEditProofNextActionsSourcePath === "string" && releaseProgressReport.proofBundleDoctorPostEditProofNextActionsSourcePath.length > 0, "release progress report should include next-actions doctor post-edit proof source path");
check(releaseProgressReport.proofBundleDoctorPostEditProofNextActionsReady === true, "release progress report should mirror next-actions doctor post-edit proof readiness");
check(releaseProgressReport.proofBundleDoctorPostEditProofDoctorSourceArtifact === "Release doctor", "release progress report should keep release doctor as the original doctor post-edit proof source");
check(typeof releaseProgressReport.proofBundleDoctorPostEditProofDoctorSourcePath === "string" && releaseProgressReport.proofBundleDoctorPostEditProofDoctorSourcePath.length > 0, "release progress report should include release doctor post-edit proof source path");
check(releaseProgressReport.proofBundleDoctorPostEditProofDoctorReportReady === true, "release progress report should mirror release doctor post-edit proof readiness from proof bundle");
check(typeof releaseProgressReport.proofBundleDoctorPostEditProofCurrentActionId === "string" && releaseProgressReport.proofBundleDoctorPostEditProofCurrentActionId.length > 0, "release progress report should include proof-bundle doctor post-edit proof current action id");
check(typeof releaseProgressReport.proofBundleDoctorPostEditProofCurrentActionLabel === "string" && releaseProgressReport.proofBundleDoctorPostEditProofCurrentActionLabel.length > 0, "release progress report should include proof-bundle doctor post-edit proof current action label");
check(releaseProgressReport.proofBundleDoctorPostEditProofCommand === externalProofBundle.doctorPostEditProofCommand, "release progress report should mirror the proof-bundle doctor post-edit proof command");
check(releaseProgressReport.proofBundleDoctorPostEditProofCommand === externalProofBundle.doctorPostEditProofCommand, "release progress report proof-bundle doctor post-edit proof command should match source proof bundle");
check(typeof releaseProgressReport.proofBundleDoctorPostEditProofRole === "string" && releaseProgressReport.proofBundleDoctorPostEditProofRole.length > 0, "release progress report should include proof-bundle doctor post-edit proof role");
check(
  releaseProgressReport.proofBundleDoctorPostEditProofCurrentActionId !== "replace-release-channel-placeholders" ||
    releaseProgressReport.proofBundleDoctorPostEditProofMatchesRecommended === true,
  "release progress report proof-bundle doctor post-edit proof should match the recommended operator proof chain"
);
check(releaseProgressReport.proofBundleDoctorPostEditProofMirrorsNextActions === true, "release progress report proof-bundle doctor post-edit proof should mirror next-actions");
check(releaseProgressReport.proofBundleDoctorPostEditProofValueRecorded === false, "release progress report proof-bundle doctor post-edit proof should not record values");
check(releaseProgressReport.proofBundleDoctorPostEditProofClaimedExternalDistribution === false, "release progress report proof-bundle doctor post-edit proof should not claim external distribution");
check(releaseProgressReport.privateEditStrictProofHandoffSourceArtifact === "Release private-edit strict proof smokes", "release progress report should label strict proof handoff source artifacts");
check(typeof releaseProgressReport.privateEditStrictProofHandoffSourceReady === "boolean", "release progress report should include strict proof handoff source readiness");
check(typeof releaseProgressReport.privateEditStrictProofHandoffReady === "boolean", "release progress report should include strict proof handoff readiness");
check(releaseProgressReport.privateEditStrictProofOperatorCommand === recommendedPrivateEditOperatorProofCommand, "release progress report should expose strict proof operator command");
check(releaseProgressReport.privateEditStrictProofBlockedSourcePath === relative(privateEditStrictProofBlockedJsonPath), "release progress report should include blocked strict proof source path");
check(releaseProgressReport.privateEditStrictProofSuccessSourcePath === relative(privateEditStrictProofSuccessJsonPath), "release progress report should include success strict proof source path");
check(releaseProgressReport.privateEditStrictProofBlockedSourceReady === (privateEditStrictProofBlockedSmoke !== null), "release progress report should match blocked strict proof source readiness to artifact presence");
check(releaseProgressReport.privateEditStrictProofSuccessSourceReady === (privateEditStrictProofSuccessSmoke !== null), "release progress report should match success strict proof source readiness to artifact presence");
if (releaseProgressReport.privateEditStrictProofBlockedSourceReady) {
  check(releaseProgressReport.privateEditStrictProofBlockedReady === true, "release progress report should prove blocked strict proof smoke readiness when source exists");
  check(releaseProgressReport.privateEditStrictProofBlockedCommand === "npm run release:private-edit-strict-proof-blocked-smoke", "release progress report should mirror blocked strict proof command");
  check(releaseProgressReport.privateEditStrictProofBlockedHandoffReady === true, "release progress report should mirror blocked strict proof handoff readiness");
  check(releaseProgressReport.privateEditStrictProofBlockedHandoffRowCount === releaseProgressReport.privateEditStrictProofBlockedHandoffRows.length, "release progress report blocked strict proof handoff count should match rows");
  check(releaseProgressReport.privateEditStrictProofBlockedHandoffRows.every((row) => row.valueRecorded === false), "release progress report blocked strict proof handoff rows should be value-free");
  check(releaseProgressReport.privateEditStrictProofBlockedStrictFailureRowCount === 4, "release progress report blocked strict proof should include four strict failure rows");
  check(releaseProgressReport.privateEditStrictProofBlockedPlaceholderKeyCount === 4, "release progress report blocked strict proof should include four placeholder keys");
  check(releaseProgressReport.privateEditStrictProofBlockedProgressSkipped === true, "release progress report blocked strict proof should skip progress refresh");
  check(releaseProgressReport.privateEditStrictProofBlockedRealLocalEnvRead === false, "release progress report blocked strict proof should not read real local env");
  check(releaseProgressReport.privateEditStrictProofBlockedRealLocalEnvModified === false, "release progress report blocked strict proof should not modify real local env");
}
if (releaseProgressReport.privateEditStrictProofSuccessSourceReady) {
  check(releaseProgressReport.privateEditStrictProofSuccessReady === true, "release progress report should prove success strict proof smoke readiness when source exists");
  check(releaseProgressReport.privateEditStrictProofSuccessCommand === "npm run release:private-edit-strict-proof-success-smoke", "release progress report should mirror success strict proof command");
  check(releaseProgressReport.privateEditStrictProofSuccessStrictReady === true, "release progress report success strict proof should be strict-ready");
  check(releaseProgressReport.privateEditStrictProofSuccessPlaceholderKeyCount === 0, "release progress report success strict proof should have zero placeholder keys");
  check(releaseProgressReport.privateEditStrictProofSuccessPostEditReady === true, "release progress report success strict proof should include post-edit proof readiness");
  check(releaseProgressReport.privateEditStrictProofSuccessProgressRefreshReady === true, "release progress report success strict proof should include progress refresh readiness");
  check(releaseProgressReport.privateEditStrictProofSuccessLeakAuditReady === true, "release progress report success strict proof should include private-value leak audit readiness");
  check(releaseProgressReport.privateEditStrictProofSuccessLeakFindingCount === 0, "release progress report success strict proof should include zero leak findings");
  check(releaseProgressReport.privateEditStrictProofSuccessRealLocalEnvRead === false, "release progress report success strict proof should not read real local env");
  check(releaseProgressReport.privateEditStrictProofSuccessRealLocalEnvModified === false, "release progress report success strict proof should not modify real local env");
  check(releaseProgressReport.privateEditStrictProofCommandRowCount === releaseProgressReport.privateEditStrictProofCommandRows.length, "release progress report strict proof command count should match rows");
  check(releaseProgressReport.privateEditStrictProofCommandRows.every((row) => row.valueRecorded === false), "release progress report strict proof command rows should be value-free");
}
check(
  releaseProgressReport.privateEditStrictProofHandoffReady ===
    (releaseProgressReport.privateEditStrictProofBlockedReady && releaseProgressReport.privateEditStrictProofSuccessReady),
  "release progress report strict proof handoff readiness should require blocked and success smoke readiness"
);
check(releaseProgressReport.privateEditStrictProofValueRecorded === false, "release progress report strict proof handoff should not record values");
check(releaseProgressReport.privateEditStrictProofPrivateValuesRecorded === false, "release progress report strict proof handoff should not record private values");
check(releaseProgressReport.privateEditStrictProofNetworkProbeAttempted === false, "release progress report strict proof handoff should not probe network");
check(releaseProgressReport.privateEditStrictProofClaimedAutoUpdate === false, "release progress report strict proof handoff should not claim auto-update");
check(releaseProgressReport.privateEditStrictProofClaimedExternalDistribution === false, "release progress report strict proof handoff should not claim external distribution");
check(releaseProgressReport.updateFeedCheckpointSourceArtifact === "Release update-feed checkpoint", "release progress report should label update-feed checkpoint source artifact");
check(releaseProgressReport.updateFeedCheckpointSourcePath === relative(updateFeedCheckpointJsonPath), "release progress report should include update-feed checkpoint source path");
check(releaseProgressReport.updateFeedCheckpointSourceReady === (updateFeedCheckpoint !== null), "release progress report should match update-feed checkpoint source readiness to artifact presence");
check(releaseProgressReport.updateFeedCheckpointCommand === "npm run release:update-feed-checkpoint-smoke", "release progress report should expose update-feed checkpoint command");
check(releaseProgressReport.updateFeedCheckpointHardGateCommand === "npm run release:external-check", "release progress report should keep update-feed checkpoint hard gate command");
if (releaseProgressReport.updateFeedCheckpointSourceReady) {
  check(releaseProgressReport.updateFeedCheckpointReady === true, "release progress report should prove update-feed checkpoint readiness when source exists");
  check(releaseProgressReport.updateFeedCheckpointMirrorsCurrentTenPlan === true, "release progress report update-feed checkpoint should mirror current 10-plan progress");
  check(releaseProgressReport.updateFeedCheckpointRefreshCommandCount === releaseProgressReport.updateFeedCheckpointRefreshCommandRows.length, "release progress report update-feed checkpoint refresh command count should match rows");
  check(releaseProgressReport.updateFeedCheckpointRefreshCommandCount === 2, "release progress report update-feed checkpoint should include two refresh commands");
  check(releaseProgressReport.updateFeedCheckpointRefreshCommandRows.every((row) => row.valueRecorded === false), "release progress report update-feed checkpoint refresh command rows should be value-free");
  check(releaseProgressReport.updateFeedCheckpointSourceArtifactRowCount === releaseProgressReport.updateFeedCheckpointSourceArtifactRows.length, "release progress report update-feed checkpoint source row count should match rows");
  check(releaseProgressReport.updateFeedCheckpointSourceArtifactRowCount === 2, "release progress report update-feed checkpoint should include two source artifact rows");
  check(releaseProgressReport.updateFeedCheckpointSourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false), "release progress report update-feed checkpoint source rows should be present, ready, and value-free");
  check(releaseProgressReport.updateFeedCheckpointBranchRowCount === releaseProgressReport.updateFeedCheckpointBranchRows.length, "release progress report update-feed checkpoint branch row count should match rows");
  check(releaseProgressReport.updateFeedCheckpointBranchRowCount === 2, "release progress report update-feed checkpoint should include real and synthetic branch rows");
  check(releaseProgressReport.updateFeedCheckpointBranchRows.every((row) => row.ready === true && row.valueRecorded === false), "release progress report update-feed checkpoint branch rows should be ready and value-free");
  check(releaseProgressReport.updateFeedCheckpointComparisonRowCount === releaseProgressReport.updateFeedCheckpointComparisonRows.length, "release progress report update-feed checkpoint comparison row count should match rows");
  check(releaseProgressReport.updateFeedCheckpointComparisonRowCount === 6, "release progress report update-feed checkpoint should include six comparison rows");
  check(releaseProgressReport.updateFeedCheckpointComparisonRows.every((row) => row.ready === true && row.valueRecorded === false), "release progress report update-feed checkpoint comparison rows should be ready and value-free");
  check(releaseProgressReport.updateFeedCheckpointRealPostEditProofReady === true, "release progress report update-feed checkpoint real branch should have post-edit proof");
  check(releaseProgressReport.updateFeedCheckpointRealLiveCheckReady === false, "release progress report update-feed checkpoint real branch should keep live-check blocked while placeholders remain");
  check(releaseProgressReport.updateFeedCheckpointRealStrictReady === false, "release progress report update-feed checkpoint real branch should keep strict readiness blocked while placeholders remain");
  check(releaseProgressReport.updateFeedCheckpointRealSelectedReadyCount === 0, "release progress report update-feed checkpoint real branch should include zero selected-ready rows");
  check(
    [0, 6].includes(releaseProgressReport.updateFeedCheckpointRealPlaceholderKeyCount),
    "release progress report update-feed checkpoint real branch should mirror allowed placeholder key counts"
  );
  check(
    releaseProgressReport.updateFeedCheckpointRealPlaceholderEditLocationCount ===
      releaseProgressReport.updateFeedCheckpointRealPlaceholderKeyCount,
    "release progress report update-feed checkpoint real branch should align placeholder edit locations with placeholder keys"
  );
  check(releaseProgressReport.updateFeedCheckpointRealAutoUpdateReady === false, "release progress report update-feed checkpoint real branch should not mark auto-update ready");
  check(releaseProgressReport.updateFeedCheckpointRealAutoUpdateBlockerCount === 2, "release progress report update-feed checkpoint real branch should keep two auto-update blockers");
  check(releaseProgressReport.updateFeedCheckpointSyntheticPostEditProofReady === true, "release progress report update-feed checkpoint synthetic branch should have post-edit proof");
  check(releaseProgressReport.updateFeedCheckpointSyntheticLiveCheckReady === true, "release progress report update-feed checkpoint synthetic branch should be live-check ready");
  check(releaseProgressReport.updateFeedCheckpointSyntheticStrictReady === true, "release progress report update-feed checkpoint synthetic branch should be strict-ready");
  check(releaseProgressReport.updateFeedCheckpointSyntheticSelectedReadyCount === 2, "release progress report update-feed checkpoint synthetic branch should include two selected-ready rows");
  check(releaseProgressReport.updateFeedCheckpointSyntheticPlaceholderKeyCount === 0, "release progress report update-feed checkpoint synthetic branch should include zero placeholder keys");
  check(releaseProgressReport.updateFeedCheckpointSyntheticPlaceholderEditLocationCount === 0, "release progress report update-feed checkpoint synthetic branch should include zero placeholder edit locations");
  check(releaseProgressReport.updateFeedCheckpointSyntheticRealLocalEnvRead === false, "release progress report update-feed checkpoint synthetic branch should not read the real local env");
  check(releaseProgressReport.updateFeedCheckpointSyntheticAutoUpdateReady === false, "release progress report update-feed checkpoint synthetic branch should not mark auto-update ready");
  check(releaseProgressReport.updateFeedCheckpointSyntheticAutoUpdateBlockerCount === 2, "release progress report update-feed checkpoint synthetic branch should keep two auto-update blockers");
  check(releaseProgressReport.updateFeedCheckpointSignedUpdateArtifactsReady === false, "release progress report update-feed checkpoint should not mark signed update artifacts ready");
  check(releaseProgressReport.updateFeedCheckpointHardGateReady === false, "release progress report update-feed checkpoint should keep hard gate blocked");
  check(releaseProgressReport.updateFeedCheckpointHardGateWouldFail === true, "release progress report update-feed checkpoint should preserve hard gate would-fail posture");
  check(releaseProgressReport.updateFeedCheckpointTenPlanProgressLabel === releaseProgressReport.currentTenPlanWindowLabel, "release progress report update-feed checkpoint 10-plan label should match current progress");
}
check(releaseProgressReport.updateFeedCheckpointValueRecorded === false, "release progress report update-feed checkpoint should not record values");
check(releaseProgressReport.updateFeedCheckpointPrivateValuesRecorded === false, "release progress report update-feed checkpoint should not record private values");
check(releaseProgressReport.updateFeedCheckpointFeedValueRecorded === false, "release progress report update-feed checkpoint should not record feed values");
check(releaseProgressReport.updateFeedCheckpointChannelValueRecorded === false, "release progress report update-feed checkpoint should not record channel values");
check(releaseProgressReport.updateFeedCheckpointLocalEnvValueRecorded === false, "release progress report update-feed checkpoint should not record local env values");
check(releaseProgressReport.updateFeedCheckpointNetworkProbeAttempted === false, "release progress report update-feed checkpoint should not probe network");
check(releaseProgressReport.updateFeedCheckpointPublishAttempted === false, "release progress report update-feed checkpoint should not publish update feeds");
check(releaseProgressReport.updateFeedCheckpointReleaseUploadAttempted === false, "release progress report update-feed checkpoint should not upload releases");
check(releaseProgressReport.updateFeedCheckpointSigningAttempted === false, "release progress report update-feed checkpoint should not sign artifacts");
check(releaseProgressReport.updateFeedCheckpointNotarySubmissionAttempted === false, "release progress report update-feed checkpoint should not submit to Apple notary");
check(releaseProgressReport.updateFeedCheckpointClaimedAutoUpdate === false, "release progress report update-feed checkpoint should not claim auto-update");
check(releaseProgressReport.updateFeedCheckpointClaimedExternalDistribution === false, "release progress report update-feed checkpoint should not claim external distribution");
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
check(markdown.includes("Current 10-plan report boundary:"), "release progress Markdown should include current 10-plan report boundary");
check(markdown.includes("Next scheduled 10-plan progress report after delivery:"), "release progress Markdown should include next scheduled 10-plan progress report");
check(markdown.includes("10-plan progress report receipt ready:"), "release progress Markdown should include 10-plan progress report receipt readiness");
check(markdown.includes("10-plan progress report receipt rows:"), "release progress Markdown should include 10-plan progress report receipt rows");
check(markdown.includes("10-Plan Progress Report Receipt"), "release progress Markdown should include 10-plan progress report receipt table");
check(markdown.includes("10-plan cadence rollover ready:"), "release progress Markdown should include 10-plan cadence rollover readiness");
check(markdown.includes("10-plan cadence rollover rows:"), "release progress Markdown should include 10-plan cadence rollover rows");
check(markdown.includes("10-Plan Cadence Rollover"), "release progress Markdown should include 10-plan cadence rollover table");
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
check(markdown.includes("Release-Channel Live Check"), "release progress Markdown should include release-channel live-check summary");
check(markdown.includes("Release-channel live-check JSON:"), "release progress Markdown should include release-channel live-check source path");
check(markdown.includes("Release-channel live-check current-ready rows:"), "release progress Markdown should include release-channel live-check current-ready rows");
check(markdown.includes("Release-Channel Live Check Placeholder Locations"), "release progress Markdown should include release-channel live-check placeholder locations");
check(markdown.includes("Release-channel post-edit receipt ready:"), "release progress Markdown should include release-channel post-edit receipt readiness");
check(markdown.includes("Release-channel post-edit receipt rows:"), "release progress Markdown should include release-channel post-edit receipt rows");
check(markdown.includes("Release-Channel Post-Edit Receipt"), "release progress Markdown should include release-channel post-edit receipt table");
check(markdown.includes("Release-channel post-edit operator receipt ready:"), "release progress Markdown should include release-channel post-edit operator receipt readiness");
check(markdown.includes("Release-channel post-edit operator receipt rows:"), "release progress Markdown should include release-channel post-edit operator receipt rows");
check(markdown.includes("Release-channel post-edit operator recommended proof chain:"), "release progress Markdown should include release-channel post-edit operator recommended proof chain");
check(markdown.includes("Release-Channel Post-Edit Operator Receipt"), "release progress Markdown should include release-channel post-edit operator receipt table");
check(markdown.includes("Post-edit proof sequence receipt ready:"), "release progress Markdown should include post-edit proof sequence readiness");
check(markdown.includes("Post-edit proof sequence receipt rows:"), "release progress Markdown should include post-edit proof sequence rows");
check(markdown.includes("Post-edit proof sequence recommended proof chain:"), "release progress Markdown should include post-edit proof sequence recommended proof chain");
check(markdown.includes("Post-Edit Proof Sequence Receipt"), "release progress Markdown should include post-edit proof sequence receipt table");
check(markdown.includes("Proof-bundle command:"), "release progress Markdown should include post-edit proof-bundle command");
check(markdown.includes("Progress command: `npm run release:progress-smoke`"), "release progress Markdown should include post-edit progress-smoke command");
check(markdown.includes("Proof-bundle doctor post-edit proof source ready:"), "release progress Markdown should include proof-bundle doctor post-edit proof source readiness");
check(markdown.includes("Proof-bundle doctor post-edit proof command:"), "release progress Markdown should include proof-bundle doctor post-edit proof command");
check(markdown.includes("Proof-Bundle Doctor Post-Edit Proof Mirror"), "release progress Markdown should include proof-bundle doctor post-edit proof mirror section");
check(markdown.includes("Next-actions source artifact:"), "release progress Markdown should include doctor post-edit proof next-actions source");
check(markdown.includes("Mirrors next-actions:"), "release progress Markdown should include doctor post-edit proof next-actions mirror posture");
check(markdown.includes("Private-edit strict proof handoff source ready:"), "release progress Markdown should include strict proof handoff source readiness");
check(markdown.includes("Private-edit strict proof operator command:"), "release progress Markdown should include strict proof operator command");
check(markdown.includes("Private-Edit Strict Proof Handoff Mirror"), "release progress Markdown should include strict proof handoff mirror section");
check(markdown.includes("Blocked smoke ready:"), "release progress Markdown should include blocked strict proof readiness");
check(markdown.includes("Success smoke ready:"), "release progress Markdown should include success strict proof readiness");
check(markdown.includes("Update-feed checkpoint source ready:"), "release progress Markdown should include update-feed checkpoint source readiness");
check(markdown.includes("Update-feed checkpoint command:"), "release progress Markdown should include update-feed checkpoint command");
check(markdown.includes("Update-Feed Checkpoint Mirror"), "release progress Markdown should include update-feed checkpoint mirror section");
check(markdown.includes("Real live-check ready:"), "release progress Markdown should include update-feed checkpoint real live-check readiness");
check(markdown.includes("Synthetic live-check ready:"), "release progress Markdown should include update-feed checkpoint synthetic live-check readiness");
check(markdown.includes("operator action"), "release progress Markdown should include post-edit operator action guidance");
check(markdown.includes("expected post-edit signal"), "release progress Markdown should include post-edit expected signals");
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
console.log(`- Current 10-plan report boundary: ${releaseProgressReport.currentTenPlanReportBoundaryLabel}`);
console.log(`- Next scheduled 10-plan progress report after delivery: ${releaseProgressReport.nextScheduledTenPlanProgressReportLabel}`);
console.log(`- 10-plan progress report receipt ready: ${releaseProgressReport.tenPlanProgressReportReceiptReady ? "yes" : "no"}`);
console.log(`- 10-plan progress report receipt rows: ${releaseProgressReport.tenPlanProgressReportReceiptRowCount} (${releaseProgressReport.tenPlanProgressReportReceiptSummary})`);
console.log(`- 10-plan cadence rollover ready: ${releaseProgressReport.tenPlanProgressReportRolloverReady ? "yes" : "no"}`);
console.log(`- 10-plan cadence rollover rows: ${releaseProgressReport.tenPlanProgressReportRolloverRowCount} (${releaseProgressReport.tenPlanProgressReportRolloverSummary})`);
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
console.log(`- Release-channel live-check ready: ${releaseProgressReport.releaseChannelLiveCheckReady ? "yes" : "no"}`);
console.log(`- Release-channel live-check current-ready rows: ${releaseProgressReport.releaseChannelLiveCheckCurrentReadyCount}/${releaseProgressReport.releaseChannelLiveCheckRowCount}`);
console.log(`- Release-channel live-check placeholder keys: ${releaseProgressReport.releaseChannelLiveCheckCurrentPlaceholderKeyCount}`);
console.log(`- Release-channel live-check placeholder edit locations: ${releaseProgressReport.releaseChannelLiveCheckCurrentPlaceholderEditLocationCount}`);
console.log(`- Release-channel first proof after private edits: ${releaseProgressReport.releaseChannelFirstProofCommandAfterPrivateEdits}`);
console.log(`- Release-channel recommended operator proof chain: ${releaseProgressReport.releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits}`);
console.log(`- Release-channel post-edit receipt ready: ${releaseProgressReport.releaseChannelPostEditReceiptReady ? "yes" : "no"}`);
console.log(`- Release-channel post-edit receipt rows: ${releaseProgressReport.releaseChannelPostEditReceiptRowCount} (${releaseProgressReport.releaseChannelPostEditReceiptSummary})`);
console.log(`- Release-channel post-edit current-ready rows: ${releaseProgressReport.releaseChannelPostEditReceiptCurrentReadyCount}/${releaseProgressReport.releaseChannelPostEditReceiptRowCount}`);
console.log(`- Release-channel post-edit operator receipt ready: ${releaseProgressReport.releaseChannelPostEditOperatorReceiptReady ? "yes" : "no"}`);
console.log(`- Release-channel post-edit operator receipt rows: ${releaseProgressReport.releaseChannelPostEditOperatorReceiptRowCount} (${releaseProgressReport.releaseChannelPostEditOperatorReceiptSummary})`);
console.log(`- Release-channel post-edit operator recommended proof chain: ${releaseProgressReport.releaseChannelPostEditOperatorReceiptRecommendedProofCommand}`);
console.log(`- Release-channel post-edit operator proof command: ${releaseProgressReport.releaseChannelPostEditOperatorReceiptProofCommand}`);
console.log(`- Release-channel post-edit operator blocker refresh: ${releaseProgressReport.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand}`);
console.log(`- Release-channel post-edit operator next-actions refresh: ${releaseProgressReport.releaseChannelPostEditOperatorReceiptNextActionsCommand}`);
console.log(`- Post-edit proof sequence receipt ready: ${releaseProgressReport.postEditProofSequenceReceiptReady ? "yes" : "no"}`);
console.log(`- Post-edit proof sequence rows: ${releaseProgressReport.postEditProofSequenceReceiptRowCount} (${releaseProgressReport.postEditProofSequenceReceiptSummary})`);
console.log(`- Post-edit proof sequence recommended proof chain: ${releaseProgressReport.postEditProofSequenceReceiptRecommendedProofCommand}`);
console.log(`- Post-edit proof sequence doctor command: ${releaseProgressReport.postEditProofSequenceReceiptDoctorCommand}`);
console.log(`- Post-edit proof sequence current-blocker command: ${releaseProgressReport.postEditProofSequenceReceiptCurrentBlockerCommand}`);
console.log(`- Post-edit proof sequence next-actions command: ${releaseProgressReport.postEditProofSequenceReceiptNextActionsCommand}`);
console.log(`- Post-edit proof sequence proof-bundle command: ${releaseProgressReport.postEditProofSequenceReceiptProofBundleCommand}`);
console.log(`- Post-edit proof sequence progress command: ${releaseProgressReport.postEditProofSequenceReceiptProgressCommand}`);
console.log(`- Post-edit proof sequence hard-gate command: ${releaseProgressReport.postEditProofSequenceReceiptHardGateCommand}`);
console.log(`- Proof-bundle doctor post-edit proof source ready: ${releaseProgressReport.proofBundleDoctorPostEditProofSourceReady ? "yes" : "no"}`);
console.log(`- Proof-bundle doctor post-edit proof command: ${releaseProgressReport.proofBundleDoctorPostEditProofCommand}`);
console.log(`- Proof-bundle doctor post-edit proof matches recommended: ${releaseProgressReport.proofBundleDoctorPostEditProofMatchesRecommended ? "yes" : "no"}`);
console.log(`- Private-edit strict proof handoff source ready: ${releaseProgressReport.privateEditStrictProofHandoffSourceReady ? "yes" : "no"}`);
console.log(`- Private-edit strict proof handoff ready: ${releaseProgressReport.privateEditStrictProofHandoffReady ? "yes" : "no"}`);
console.log(`- Private-edit strict proof operator command: ${releaseProgressReport.privateEditStrictProofOperatorCommand}`);
console.log(`- Private-edit strict proof blocked smoke ready: ${releaseProgressReport.privateEditStrictProofBlockedReady ? "yes" : "no"}`);
console.log(`- Private-edit strict proof success smoke ready: ${releaseProgressReport.privateEditStrictProofSuccessReady ? "yes" : "no"}`);
console.log(`- Update-feed checkpoint source ready: ${releaseProgressReport.updateFeedCheckpointSourceReady ? "yes" : "no"}`);
console.log(`- Update-feed checkpoint ready: ${releaseProgressReport.updateFeedCheckpointReady ? "yes" : "no"}`);
console.log(`- Update-feed checkpoint command: ${releaseProgressReport.updateFeedCheckpointCommand}`);
console.log(`- Update-feed checkpoint real live-check ready: ${releaseProgressReport.updateFeedCheckpointRealLiveCheckReady ? "yes" : "no"}`);
console.log(`- Update-feed checkpoint synthetic live-check ready: ${releaseProgressReport.updateFeedCheckpointSyntheticLiveCheckReady ? "yes" : "no"}`);
console.log(`- Update-feed checkpoint hard gate would fail: ${releaseProgressReport.updateFeedCheckpointHardGateWouldFail ? "yes" : "no"}`);
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
