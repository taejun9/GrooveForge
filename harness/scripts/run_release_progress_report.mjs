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
const completionProgressJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-progress.json`);
const externalProofBundleJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-proof-bundle.json`);
const releaseProgressMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-report.md`);
const releaseProgressJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-report.json`);
const failures = [];

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
    externalProofBundleCurrentNextCommand: textValue(externalProofBundle.currentNextCommand),
    externalProofBundleCurrentFirstBlocker: textValue(externalProofBundle.currentFirstBlocker),
    externalProofBundleCurrentRequiredKeyCount: integerValue(externalProofBundle.currentRequiredKeyCount),
    externalProofBundleCurrentRequiredKeySummary: textValue(externalProofBundle.currentRequiredKeySummary, "none"),
    externalProofBundleCurrentRequiredKeys: stringArrayValue(externalProofBundle.currentRequiredKeys),
    externalProofBundleCurrentPlaceholderKeyCount: integerValue(externalProofBundle.currentPlaceholderKeyCount),
    externalProofBundleCurrentPlaceholderKeySummary: textValue(externalProofBundle.currentPlaceholderKeySummary, "none"),
    externalProofBundleCurrentPlaceholderKeys: stringArrayValue(externalProofBundle.currentPlaceholderKeys),
    externalProofBundleCurrentPlaceholderEditLocationCount: integerValue(externalProofBundle.currentPlaceholderEditLocationCount),
    externalProofBundleCurrentPlaceholderEditLocationSummary: textValue(externalProofBundle.currentPlaceholderEditLocationSummary, "none"),
    externalProofBundleCurrentEnvEditTarget: textValue(externalProofBundle.currentEnvEditTarget, ".env.distribution.local"),
    externalProofBundleCurrentEnvEditTemplateCount: integerValue(externalProofBundle.currentEnvEditTemplateCount),
    externalProofBundleCurrentEnvEditTemplateSummary: textValue(externalProofBundle.currentEnvEditTemplateSummary, "none"),
    externalProofBundleCurrentEnvEditRowsCount: integerValue(externalProofBundle.currentEnvEditRowsCount),
    externalProofBundleCurrentEnvEditRowsSummary: textValue(externalProofBundle.currentEnvEditRowsSummary, "none"),
    externalProofBundleCurrentPlaceholderRemediationRowCount: integerValue(externalProofBundle.currentPlaceholderRemediationRowCount),
    externalProofBundleCurrentPlaceholderRemediationRowSummary: textValue(externalProofBundle.currentPlaceholderRemediationRowSummary, "none"),
    externalProofBundleCurrentProofChecklistRowCount: integerValue(externalProofBundle.currentProofChecklistRowCount),
    externalProofBundleCurrentProofChecklistRowSummary: textValue(externalProofBundle.currentProofChecklistRowSummary, "none"),
    externalProofBundleCurrentActionChecklistCount: integerValue(externalProofBundle.currentActionChecklistCount),
    externalProofBundleCurrentActionChecklistSummary: textValue(externalProofBundle.currentActionChecklistSummary, "none"),
    externalProofBundleCurrentRerunCommand: textValue(externalProofBundle.currentRerunCommand, "none"),
    externalProofBundleCurrentCommandSequenceCount: integerValue(externalProofBundle.currentCommandSequenceCount),
    externalProofBundleCurrentCommandSequenceSummary: textValue(externalProofBundle.currentCommandSequenceSummary, "none"),
    externalProofBundleCurrentCommandVerificationRowCount: integerValue(externalProofBundle.currentCommandVerificationRowCount),
    externalProofBundleCurrentCommandVerificationRowSummary: textValue(externalProofBundle.currentCommandVerificationRowSummary, "none"),
    externalProofBundleHardGateCommand: textValue(externalProofBundle.hardExternalGateCommand, "npm run release:external-check"),
    externalProofBundleLocalEnvLoaded: externalProofBundle.localEnvInput?.enabled === true,
    externalProofBundleCurrentEnvSummaryValueRecorded: false,
    externalProofBundleValueRecorded: false,
    externalProofBundleClaimedExternalDistribution: false
  };
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Progress Report

## Status

- Report ready: ${report.releaseProgressReportReady ? "yes" : "no"}
- Completion stage: ${report.completionStage}
- Source evidence ready: ${report.sourceEvidenceReady ? "yes" : "no"}
- Local release ready: ${report.localReleaseReady ? "yes" : "no"}
- Local release readiness: ${report.localReleaseReadinessPercent.toFixed(1)}%
- Desktop project IO evidence ready: ${report.desktopProjectIoEvidenceReady ? "yes" : "no"}
- PKG payload project IO evidence ready: ${report.pkgPayloadProjectIoEvidenceReady ? "yes" : "no"}
- External distribution hard gate ready: ${report.externalDistributionGateReady ? "yes" : "no"}
- External gate requirements ready: ${report.gateRequirementReadyCount}/${report.gateRequirementTotal} (${report.gateRequirementReadinessPercent.toFixed(1)}%)
- Remediation groups ready: ${report.remediationReadyCount}/${report.remediationTotal} (${report.remediationReadinessPercent.toFixed(1)}%)
- External proof bundle source ready: ${report.sourceExternalProofBundleReady ? "yes" : "no"}
- External proof bundle ready: ${report.externalProofBundleReady ? "yes" : "no"}
- External proof artifacts present: ${report.externalProofBundleProofArtifactPresentCount}/${report.externalProofBundleProofArtifactCount} (missing: ${report.externalProofBundleProofArtifactMissingSummary})
- External proof gate requirements ready: ${report.externalProofBundleGateRequirementReadyCount}/${report.externalProofBundleGateRequirementTotal} (blocked: ${report.externalProofBundleGateRequirementBlockedCount})
- External proof current next command: \`${report.externalProofBundleCurrentNextCommand}\`
- External proof current first blocker: ${report.externalProofBundleCurrentFirstBlocker}
- External proof current required keys: ${report.externalProofBundleCurrentRequiredKeyCount} (${report.externalProofBundleCurrentRequiredKeySummary})
- External proof current placeholder keys: ${report.externalProofBundleCurrentPlaceholderKeyCount} (${report.externalProofBundleCurrentPlaceholderKeySummary})
- External proof current env edit target: ${report.externalProofBundleCurrentEnvEditTarget}
- External proof current placeholder remediation rows: ${report.externalProofBundleCurrentPlaceholderRemediationRowCount} (${report.externalProofBundleCurrentPlaceholderRemediationRowSummary})
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

## Commands

- Regenerated evidence with: \`${report.evidenceCommand}\`
- Progress command: \`${report.progressCommand}\`
- Hard external distribution gate remains: \`${report.hardExternalGateCommand}\`
- External proof hard gate: \`${report.externalProofBundleHardGateCommand}\`

## Source Evidence

- Completion progress JSON: ${report.sourceCompletionProgressPath}
- External proof bundle JSON: ${report.sourceExternalProofBundlePath}

## External Proof Bundle

- Proof bundle ready: ${report.externalProofBundleReady ? "yes" : "no"}
- Proof artifacts present: ${report.externalProofBundleProofArtifactPresentCount}/${report.externalProofBundleProofArtifactCount}
- Missing proof artifacts: ${report.externalProofBundleProofArtifactMissingSummary}
- Gate requirements ready: ${report.externalProofBundleGateRequirementReadyCount}/${report.externalProofBundleGateRequirementTotal}
- Gate requirements blocked: ${report.externalProofBundleGateRequirementBlockedCount}
- Current focus: ${report.externalProofBundleCurrentFocus}
- Current next command: \`${report.externalProofBundleCurrentNextCommand}\`
- Current first blocker: ${report.externalProofBundleCurrentFirstBlocker}
- Current required keys: ${report.externalProofBundleCurrentRequiredKeyCount} (${report.externalProofBundleCurrentRequiredKeySummary})
- Current placeholder keys: ${report.externalProofBundleCurrentPlaceholderKeyCount} (${report.externalProofBundleCurrentPlaceholderKeySummary})
- Current placeholder edit locations: ${report.externalProofBundleCurrentPlaceholderEditLocationCount} (${report.externalProofBundleCurrentPlaceholderEditLocationSummary})
- Current env edit target: ${report.externalProofBundleCurrentEnvEditTarget}
- Current env edit rows: ${report.externalProofBundleCurrentEnvEditRowsCount} (${report.externalProofBundleCurrentEnvEditRowsSummary})
- Current placeholder remediation rows: ${report.externalProofBundleCurrentPlaceholderRemediationRowCount} (${report.externalProofBundleCurrentPlaceholderRemediationRowSummary})
- Current proof checklist rows: ${report.externalProofBundleCurrentProofChecklistRowCount} (${report.externalProofBundleCurrentProofChecklistRowSummary})
- Current action checklist: ${report.externalProofBundleCurrentActionChecklistCount} (${report.externalProofBundleCurrentActionChecklistSummary})
- Current rerun command: \`${report.externalProofBundleCurrentRerunCommand}\`
- Current command sequence: ${report.externalProofBundleCurrentCommandSequenceCount} (${report.externalProofBundleCurrentCommandSequenceSummary})
- Current command verification rows: ${report.externalProofBundleCurrentCommandVerificationRowCount} (${report.externalProofBundleCurrentCommandVerificationRowSummary})
- Hard gate: \`${report.externalProofBundleHardGateCommand}\`

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

runReleaseCheck();

if (!existsSync(completionProgressJsonPath)) {
  fail("Completion progress JSON was not generated.", `Expected: ${relative(completionProgressJsonPath)}`);
}
if (!existsSync(externalProofBundleJsonPath)) {
  fail("External proof bundle JSON was not generated.", `Expected: ${relative(externalProofBundleJsonPath)}`);
}

const completionProgress = JSON.parse(await readFile(completionProgressJsonPath, "utf8"));
const externalProofBundle = JSON.parse(await readFile(externalProofBundleJsonPath, "utf8"));
const externalProofBundleSummary = buildExternalProofBundleSummary(externalProofBundle);
const releaseProgressReport = {
  appName,
  bundleId,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  progressCommand: "npm run release:progress",
  evidenceCommand: "npm run release:check",
  hardExternalGateCommand: "npm run release:external-check",
  releaseProgressMarkdownPath: relative(releaseProgressMarkdownPath),
  releaseProgressJsonPath: relative(releaseProgressJsonPath),
  sourceCompletionProgressPath: relative(completionProgressJsonPath),
  ...externalProofBundleSummary,
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
  releaseProgressReport.sourceExternalProofBundleReady &&
  releaseProgressReport.externalProofBundleReady;

const markdown = buildMarkdown(releaseProgressReport);

await mkdir(packageRoot, { recursive: true });
await writeFile(releaseProgressJsonPath, `${JSON.stringify(releaseProgressReport, null, 2)}\n`, "utf8");
await writeFile(releaseProgressMarkdownPath, markdown, "utf8");

check(releaseProgressReport.appName === appName, "release progress report should identify GrooveForge");
check(releaseProgressReport.bundleId === bundleId, `release progress report should identify ${bundleId}`);
check(releaseProgressReport.progressCommand === "npm run release:progress", "release progress report should identify the progress command");
check(releaseProgressReport.evidenceCommand === "npm run release:check", "release progress report should identify release:check evidence regeneration");
check(releaseProgressReport.hardExternalGateCommand === "npm run release:external-check", "release progress report should keep the hard external gate command");
check(releaseProgressReport.sourceEvidenceReady === true, "release progress report should include ready source evidence");
check(releaseProgressReport.localReleaseReady === true, "release progress report should include ready local release evidence");
check(releaseProgressReport.localReleaseReadinessPercent === 100, "release progress report should report 100 percent local release readiness");
check(releaseProgressReport.desktopProjectIoEvidenceReady === true, "release progress report should include ready desktop project IO evidence");
check(releaseProgressReport.pkgPayloadProjectIoEvidenceReady === true, "release progress report should include ready PKG payload project IO evidence");
check(typeof releaseProgressReport.externalDistributionGateReady === "boolean", "release progress report should include external distribution hard-gate readiness");
check(releaseProgressReport.sourceExternalProofBundleReady === true, "release progress report should include ready external proof bundle source evidence");
check(releaseProgressReport.externalProofBundleReady === true, "release progress report should include a ready external proof bundle");
check(releaseProgressReport.sourceExternalProofBundlePath === relative(externalProofBundleJsonPath), "release progress report should identify the external proof bundle source path");
check(Number.isInteger(releaseProgressReport.externalProofBundleProofArtifactCount), "release progress report should include external proof artifact count");
check(Number.isInteger(releaseProgressReport.externalProofBundleProofArtifactPresentCount), "release progress report should include external proof artifact present count");
check(Number.isInteger(releaseProgressReport.externalProofBundleProofArtifactMissingCount), "release progress report should include external proof artifact missing count");
check(releaseProgressReport.externalProofBundleProofArtifactPresentCount <= releaseProgressReport.externalProofBundleProofArtifactCount, "release progress report proof artifact present count should not exceed total");
check(releaseProgressReport.externalProofBundleProofArtifactMissingCount === releaseProgressReport.externalProofBundleProofArtifactCount - releaseProgressReport.externalProofBundleProofArtifactPresentCount, "release progress report proof artifact missing count should match total minus present count");
check(Number.isInteger(releaseProgressReport.externalProofBundleGateRequirementTotal), "release progress report should include external proof gate requirement total");
check(Number.isInteger(releaseProgressReport.externalProofBundleGateRequirementReadyCount), "release progress report should include external proof gate requirement ready count");
check(Number.isInteger(releaseProgressReport.externalProofBundleGateRequirementBlockedCount), "release progress report should include external proof gate requirement blocked count");
check(releaseProgressReport.externalProofBundleGateRequirementBlockedCount === releaseProgressReport.externalProofBundleGateRequirementTotal - releaseProgressReport.externalProofBundleGateRequirementReadyCount, "release progress report proof gate blocked count should match total minus ready count");
check(releaseProgressReport.externalProofBundleCurrentNextCommand.length > 0, "release progress report should include external proof current next command");
check(releaseProgressReport.externalProofBundleCurrentFirstBlocker.length > 0, "release progress report should include external proof current first blocker");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentRequiredKeyCount), "release progress report should include external proof current required key count");
check(typeof releaseProgressReport.externalProofBundleCurrentRequiredKeySummary === "string" && releaseProgressReport.externalProofBundleCurrentRequiredKeySummary.length > 0, "release progress report should include external proof current required key summary");
check(Array.isArray(releaseProgressReport.externalProofBundleCurrentRequiredKeys), "release progress report should include external proof current required key names");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentPlaceholderKeyCount), "release progress report should include external proof current placeholder key count");
check(typeof releaseProgressReport.externalProofBundleCurrentPlaceholderKeySummary === "string" && releaseProgressReport.externalProofBundleCurrentPlaceholderKeySummary.length > 0, "release progress report should include external proof current placeholder key summary");
check(Array.isArray(releaseProgressReport.externalProofBundleCurrentPlaceholderKeys), "release progress report should include external proof current placeholder key names");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentPlaceholderEditLocationCount), "release progress report should include external proof current placeholder edit location count");
check(typeof releaseProgressReport.externalProofBundleCurrentPlaceholderEditLocationSummary === "string" && releaseProgressReport.externalProofBundleCurrentPlaceholderEditLocationSummary.length > 0, "release progress report should include external proof current placeholder edit location summary");
check(typeof releaseProgressReport.externalProofBundleCurrentEnvEditTarget === "string" && releaseProgressReport.externalProofBundleCurrentEnvEditTarget.length > 0, "release progress report should include external proof current env edit target");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentEnvEditTemplateCount), "release progress report should include external proof current env edit template count");
check(typeof releaseProgressReport.externalProofBundleCurrentEnvEditTemplateSummary === "string" && releaseProgressReport.externalProofBundleCurrentEnvEditTemplateSummary.length > 0, "release progress report should include external proof current env edit template summary");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentEnvEditRowsCount), "release progress report should include external proof current env edit rows count");
check(typeof releaseProgressReport.externalProofBundleCurrentEnvEditRowsSummary === "string" && releaseProgressReport.externalProofBundleCurrentEnvEditRowsSummary.length > 0, "release progress report should include external proof current env edit rows summary");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRowCount), "release progress report should include external proof current placeholder remediation row count");
check(typeof releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRowSummary === "string" && releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRowSummary.length > 0, "release progress report should include external proof current placeholder remediation row summary");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentProofChecklistRowCount), "release progress report should include external proof current proof checklist row count");
check(typeof releaseProgressReport.externalProofBundleCurrentProofChecklistRowSummary === "string" && releaseProgressReport.externalProofBundleCurrentProofChecklistRowSummary.length > 0, "release progress report should include external proof current proof checklist row summary");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentActionChecklistCount), "release progress report should include external proof current action checklist count");
check(typeof releaseProgressReport.externalProofBundleCurrentActionChecklistSummary === "string" && releaseProgressReport.externalProofBundleCurrentActionChecklistSummary.length > 0, "release progress report should include external proof current action checklist summary");
check(typeof releaseProgressReport.externalProofBundleCurrentRerunCommand === "string" && releaseProgressReport.externalProofBundleCurrentRerunCommand.length > 0, "release progress report should include external proof current rerun command");
check(Number.isInteger(releaseProgressReport.externalProofBundleCurrentCommandSequenceCount), "release progress report should include external proof current command sequence count");
check(typeof releaseProgressReport.externalProofBundleCurrentCommandSequenceSummary === "string" && releaseProgressReport.externalProofBundleCurrentCommandSequenceSummary.length > 0, "release progress report should include external proof current command sequence summary");
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
check(markdown.includes("Local release readiness:"), "release progress Markdown should include local release readiness");
check(markdown.includes("PKG payload project IO evidence ready:"), "release progress Markdown should include PKG payload project IO readiness");
check(markdown.includes("External Proof Bundle"), "release progress Markdown should include external proof bundle summary");
check(markdown.includes("External proof artifacts present:"), "release progress Markdown should include external proof artifact coverage");
check(markdown.includes("External proof current required keys:"), "release progress Markdown should include external proof current required key summary");
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
console.log(`- Completion stage: ${releaseProgressReport.completionStage}`);
console.log(`- Source evidence ready: ${releaseProgressReport.sourceEvidenceReady ? "yes" : "no"}`);
console.log(`- Local release ready: ${releaseProgressReport.localReleaseReady ? "yes" : "no"}`);
console.log(`- Local release readiness: ${releaseProgressReport.localReleaseReadinessPercent.toFixed(1)}%`);
console.log(`- Desktop project IO evidence ready: ${releaseProgressReport.desktopProjectIoEvidenceReady ? "yes" : "no"}`);
console.log(`- PKG payload project IO evidence ready: ${releaseProgressReport.pkgPayloadProjectIoEvidenceReady ? "yes" : "no"}`);
console.log(`- External distribution hard gate ready: ${releaseProgressReport.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- External gate requirements ready: ${releaseProgressReport.gateRequirementReadyCount}/${releaseProgressReport.gateRequirementTotal} (${releaseProgressReport.gateRequirementReadinessPercent.toFixed(1)}%)`);
console.log(`- Remediation groups ready: ${releaseProgressReport.remediationReadyCount}/${releaseProgressReport.remediationTotal} (${releaseProgressReport.remediationReadinessPercent.toFixed(1)}%)`);
console.log(`- External proof bundle ready: ${releaseProgressReport.externalProofBundleReady ? "yes" : "no"}`);
console.log(`- External proof artifacts present: ${releaseProgressReport.externalProofBundleProofArtifactPresentCount}/${releaseProgressReport.externalProofBundleProofArtifactCount} (missing: ${releaseProgressReport.externalProofBundleProofArtifactMissingSummary})`);
console.log(`- External proof gate requirements ready: ${releaseProgressReport.externalProofBundleGateRequirementReadyCount}/${releaseProgressReport.externalProofBundleGateRequirementTotal} (blocked: ${releaseProgressReport.externalProofBundleGateRequirementBlockedCount})`);
console.log(`- External proof current next command: ${releaseProgressReport.externalProofBundleCurrentNextCommand}`);
console.log(`- External proof current first blocker: ${releaseProgressReport.externalProofBundleCurrentFirstBlocker}`);
console.log(`- External proof current required keys: ${releaseProgressReport.externalProofBundleCurrentRequiredKeyCount} (${releaseProgressReport.externalProofBundleCurrentRequiredKeySummary})`);
console.log(`- External proof current placeholder keys: ${releaseProgressReport.externalProofBundleCurrentPlaceholderKeyCount} (${releaseProgressReport.externalProofBundleCurrentPlaceholderKeySummary})`);
console.log(`- External proof current env edit target: ${releaseProgressReport.externalProofBundleCurrentEnvEditTarget}`);
console.log(`- External proof current placeholder remediation rows: ${releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRowCount} (${releaseProgressReport.externalProofBundleCurrentPlaceholderRemediationRowSummary})`);
console.log(`- External proof current rerun command: ${releaseProgressReport.externalProofBundleCurrentRerunCommand}`);
console.log(`- External proof current command sequence: ${releaseProgressReport.externalProofBundleCurrentCommandSequenceCount} (${releaseProgressReport.externalProofBundleCurrentCommandSequenceSummary})`);
console.log(`- External proof current command verification rows: ${releaseProgressReport.externalProofBundleCurrentCommandVerificationRowCount} (${releaseProgressReport.externalProofBundleCurrentCommandVerificationRowSummary})`);
console.log(`- External proof hard gate: ${releaseProgressReport.externalProofBundleHardGateCommand}`);
console.log(`- First blockers tracked: ${releaseProgressReport.firstBlockers.length}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted by this report");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
