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
const preflightMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-preflight.md`);
const preflightJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-preflight.json`);
const releaseDoctorPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-doctor.json`);
const completionAuditPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-audit.json`);
const externalGatePath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-distribution-gate.json`);
const externalRemediationPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-remediation.json`);
const completionStatusPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-status.json`);
const externalRunbookPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-operator-runbook.json`);
const externalLedgerPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-readiness-ledger.json`);
const completionProgressPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-progress.json`);
const failures = [];

const targetedChecks = [
  {
    label: "Release doctor",
    script: "release:doctor",
    command: "npm run release:doctor"
  },
  {
    label: "Completion audit",
    script: "desktop:completion-audit-smoke",
    command: "npm run desktop:completion-audit-smoke"
  },
  {
    label: "External distribution gate dry-run",
    script: "desktop:external-distribution-gate-smoke",
    command: "npm run desktop:external-distribution-gate-smoke"
  },
  {
    label: "External remediation",
    script: "desktop:external-remediation-smoke",
    command: "npm run desktop:external-remediation-smoke"
  },
  {
    label: "Completion status",
    script: "desktop:completion-status-smoke",
    command: "npm run desktop:completion-status-smoke"
  },
  {
    label: "External operator runbook",
    script: "desktop:external-operator-runbook-smoke",
    command: "npm run desktop:external-operator-runbook-smoke"
  },
  {
    label: "External readiness ledger",
    script: "desktop:external-readiness-ledger-smoke",
    command: "npm run desktop:external-readiness-ledger-smoke"
  },
  {
    label: "Completion progress",
    script: "desktop:completion-progress-smoke",
    command: "npm run desktop:completion-progress-smoke"
  }
];

const sourceArtifacts = [
  {
    label: "Release doctor",
    path: releaseDoctorPath
  },
  {
    label: "Completion audit",
    path: completionAuditPath
  },
  {
    label: "External distribution gate",
    path: externalGatePath
  },
  {
    label: "External remediation",
    path: externalRemediationPath
  },
  {
    label: "Completion status",
    path: completionStatusPath
  },
  {
    label: "External operator runbook",
    path: externalRunbookPath
  },
  {
    label: "External readiness ledger",
    path: externalLedgerPath
  },
  {
    label: "Completion progress",
    path: completionProgressPath
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge external preflight failed:");
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
  return value ? "yes" : "no";
}

function unique(values) {
  return [
    ...new Set(
      values
        .flat()
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ];
}

function firstBlockers(...blockerGroups) {
  return unique(blockerGroups).slice(0, 12);
}

function formatCommandRows(commands) {
  return commands.map((item) => `| ${escapeCell(item.label)} | \`${item.command}\` |`).join("\n");
}

function formatArtifactRows(artifacts) {
  return artifacts
    .map((item) => `| ${escapeCell(item.label)} | ${item.present ? "yes" : "no"} | ${escapeCell(item.path)} |`)
    .join("\n");
}

function formatBlockerRows(blockers) {
  if (!Array.isArray(blockers) || blockers.length === 0) {
    return "| none | none |";
  }
  return blockers.map((blocker, index) => `| ${index + 1} | ${escapeCell(blocker)} |`).join("\n");
}

function runTargetedChecks() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  for (const item of targetedChecks) {
    const result = spawnSync(npmCommand, ["run", item.script], {
      cwd: root,
      env: process.env,
      stdio: "inherit"
    });
    if (result.error) {
      fail(`Could not run ${item.command}.`, result.error.message);
    }
    if (result.status !== 0) {
      fail(
        `${item.command} exited with status ${result.status}.`,
        "Run `npm run release:check` first when local release evidence is missing or stale."
      );
    }
  }
}

async function readJsonRequired(artifact) {
  if (!existsSync(artifact.path)) {
    fail(`${artifact.label} artifact was not generated.`, `Expected: ${relative(artifact.path)}`);
  }
  return JSON.parse(await readFile(artifact.path, "utf8"));
}

function sourceValueRecorded(...sources) {
  const fields = [
    "localEnvValueRecorded",
    "privateValuesRecorded",
    "releaseUrlValueRecorded",
    "supportUrlValueRecorded",
    "feedValueRecorded",
    "credentialValueRecorded",
    "tokenValueRecorded",
    "channelValueRecorded",
    "developerIdIdentityValueRecorded",
    "valueRecorded"
  ];
  return sources.some((source) => fields.some((field) => source?.[field] === true) || source?.localEnvInput?.valueRecorded === true);
}

function sourceClaimedExternalDistribution(...sources) {
  return sources.some((source) => source?.releaseGateClaimedExternalDistribution === true);
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} External Preflight

## Status

- Preflight ready: ${readyLabel(report.externalPreflightReady)}
- Completion stage: ${report.completionStage}
- Local release ready: ${readyLabel(report.localReleaseReady)}
- Local release readiness: ${report.localReleaseReadinessPercent.toFixed(1)}%
- Desktop project IO evidence ready: ${readyLabel(report.desktopProjectIoEvidenceReady)}
- PKG payload project IO evidence ready: ${readyLabel(report.pkgPayloadProjectIoEvidenceReady)}
- External distribution ready: ${readyLabel(report.externalDistributionReady)}
- External distribution hard gate ready: ${readyLabel(report.externalDistributionGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- External gate requirements ready: ${report.gateRequirementReadyCount}/${report.gateRequirementTotal} (${report.gateRequirementReadinessPercent.toFixed(1)}%)
- Remediation groups ready: ${report.remediationReadyCount}/${report.remediationTotal} (${report.remediationReadinessPercent.toFixed(1)}%)
- Private input groups ready: ${report.privateInputGroupReadyCount}/${report.privateInputGroupTotal}
- Manual QA checklist digest available: ${readyLabel(report.manualQaChecklistDigestAvailable)}
- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}
- Private values recorded: no
- Network probe attempted by this preflight: no
- Release upload attempted by this preflight: no
- Apple notary submission attempted by this preflight: no
- Signing attempted by this preflight: no

## Commands

- Preflight command: \`${report.preflightCommand}\`
- Prepare env command: \`${report.prepareEnvCommand}\`
- Fast doctor command: \`${report.doctorCommand}\`
- Full progress command: \`${report.progressCommand}\`
- Source evidence prerequisite: \`${report.prerequisiteCommand}\`
- Hard external distribution gate: \`${report.hardExternalGateCommand}\`

| targeted check | command |
|---|---|
${formatCommandRows(report.targetedCommands)}

## Source Artifacts

| artifact | present | path |
|---|---:|---|
${formatArtifactRows(report.sourceArtifacts)}

## Current First Blockers

| order | blocker |
|---:|---|
${formatBlockerRows(report.firstBlockers)}

## Interpretation

Use this after \`npm run release:prepare-env\` and after editing the ignored local env file. This command is a fast redacted preflight; the hard external distribution gate remains authoritative.

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, local env values, private beats, and real user audio are not recorded.

## Not Claimed

This preflight does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

runTargetedChecks();

const artifactRows = sourceArtifacts.map((artifact) => ({
  label: artifact.label,
  path: relative(artifact.path),
  present: existsSync(artifact.path)
}));

const [
  releaseDoctor,
  completionAudit,
  externalGate,
  externalRemediation,
  completionStatus,
  externalRunbook,
  externalLedger,
  completionProgress
] = await Promise.all(sourceArtifacts.map(readJsonRequired));

const firstBlockerValues = firstBlockers(
  releaseDoctor.firstBlockers ?? [],
  completionProgress.firstBlockers?.map((item) => item.blocker) ?? [],
  externalGate.externalDistributionGateBlockers ?? [],
  externalRemediation.remediationBlockers ?? [],
  completionStatus.completionStatusBlockers ?? [],
  externalLedger.firstBlockers ?? []
);

const externalPreflightReport = {
  appName,
  bundleId,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  preflightCommand: "npm run release:external-preflight",
  prepareEnvCommand: "npm run release:prepare-env",
  doctorCommand: "npm run release:doctor",
  progressCommand: "npm run release:progress",
  prerequisiteCommand: "npm run release:check",
  hardExternalGateCommand: "npm run release:external-check",
  externalPreflightMarkdownPath: relative(preflightMarkdownPath),
  externalPreflightJsonPath: relative(preflightJsonPath),
  targetedCommands: targetedChecks.map(({ label, command }) => ({ label, command })),
  sourceArtifacts: artifactRows,
  completionStage: completionProgress.completionStage ?? completionStatus.completionStage ?? "unknown",
  sourceEvidenceReady: completionProgress.sourceEvidenceReady === true,
  localReleaseReady: completionProgress.localReleaseReady === true,
  localReleaseReadinessPercent: completionProgress.localReleaseReadinessPercent ?? 0,
  desktopProjectIoEvidenceReady:
    completionProgress.desktopProjectIoEvidenceReady === true &&
    completionStatus.desktopProjectIoEvidenceReady === true &&
    externalLedger.desktopProjectIoEvidenceReady === true,
  pkgPayloadProjectIoEvidenceReady:
    completionProgress.pkgPayloadProjectIoEvidenceReady === true &&
    completionStatus.pkgPayloadProjectIoReady === true,
  externalDistributionReady:
    completionAudit.externalDistributionReady === true &&
    releaseDoctor.externalDistributionReady === true &&
    externalGate.externalDistributionGateReady === true,
  externalDistributionGateReady: externalGate.externalDistributionGateReady === true,
  hardGateWouldFail: externalGate.hardGateWouldFail === true,
  gateRequirementTotal: completionProgress.gateRequirementTotal ?? externalLedger.gateRequirementTotal ?? 0,
  gateRequirementReadyCount: completionProgress.gateRequirementReadyCount ?? externalLedger.gateRequirementReadyCount ?? 0,
  gateRequirementReadinessPercent: completionProgress.gateRequirementReadinessPercent ?? 0,
  remediationTotal: completionProgress.remediationTotal ?? externalLedger.remediationTotal ?? 0,
  remediationReadyCount: completionProgress.remediationReadyCount ?? externalLedger.remediationReadyCount ?? 0,
  remediationReadinessPercent: completionProgress.remediationReadinessPercent ?? 0,
  privateInputGroupTotal: releaseDoctor.privateInputGroupTotal ?? 0,
  privateInputGroupReadyCount: releaseDoctor.privateInputGroupReadyCount ?? 0,
  manualQaChecklistDigestAvailable: externalRunbook.manualQaChecklistSha256 !== null || externalLedger.manualQaChecklistDigestAvailable === true,
  localEnvFileLoaded:
    releaseDoctor.localEnvFileLoaded === true ||
    completionProgress.localEnvInput?.enabled === true ||
    completionStatus.localEnvInput?.enabled === true,
  firstBlockers: firstBlockerValues,
  localEnvValueRecorded: false,
  privateValuesRecorded: false,
  releaseUrlValueRecorded: false,
  supportUrlValueRecorded: false,
  feedValueRecorded: false,
  credentialValueRecorded: false,
  tokenValueRecorded: false,
  channelValueRecorded: false,
  developerIdIdentityValueRecorded: false,
  networkProbeAttemptedByThisPreflight: false,
  releaseUploadAttemptedByThisPreflight: false,
  notarySubmissionAttemptedByThisPreflight: false,
  signingAttemptedByThisPreflight: false,
  releaseGateClaimedDeveloperIdSigning: false,
  releaseGateClaimedNotarization: false,
  releaseGateClaimedGatekeeperApproval: false,
  releaseGateClaimedAutoUpdate: false,
  releaseGateClaimedManualQaApproval: false,
  releaseGateClaimedExternalDistribution: false,
  sourceValueRecorded: sourceValueRecorded(
    releaseDoctor,
    completionAudit,
    externalGate,
    externalRemediation,
    completionStatus,
    externalRunbook,
    externalLedger,
    completionProgress
  ),
  sourceClaimedExternalDistribution: sourceClaimedExternalDistribution(
    releaseDoctor,
    completionAudit,
    externalGate,
    externalRemediation,
    completionStatus,
    externalRunbook,
    externalLedger,
    completionProgress
  )
};

externalPreflightReport.externalPreflightReady =
  externalPreflightReport.sourceArtifacts.every((artifact) => artifact.present) &&
  releaseDoctor.releaseDoctorReportReady === true &&
  completionAudit.completionAuditReady === true &&
  completionStatus.completionStatusReady === true &&
  externalRunbook.operatorRunbookReady === true &&
  externalLedger.ledgerReady === true &&
  completionProgress.completionProgressReady === true &&
  externalPreflightReport.sourceEvidenceReady === true &&
  externalPreflightReport.localReleaseReady === true &&
  externalPreflightReport.localReleaseReadinessPercent === 100 &&
  externalPreflightReport.desktopProjectIoEvidenceReady === true &&
  externalPreflightReport.pkgPayloadProjectIoEvidenceReady === true &&
  externalPreflightReport.sourceValueRecorded === false &&
  externalPreflightReport.sourceClaimedExternalDistribution === false;

const markdown = buildMarkdown(externalPreflightReport);
const serializedReport = `${JSON.stringify(externalPreflightReport, null, 2)}\n`;

await mkdir(packageRoot, { recursive: true });
await writeFile(preflightJsonPath, serializedReport, "utf8");
await writeFile(preflightMarkdownPath, markdown, "utf8");

check(externalPreflightReport.appName === appName, "external preflight should identify GrooveForge");
check(externalPreflightReport.bundleId === bundleId, `external preflight should identify ${bundleId}`);
check(externalPreflightReport.preflightCommand === "npm run release:external-preflight", "external preflight should identify the preflight command");
check(externalPreflightReport.prepareEnvCommand === "npm run release:prepare-env", "external preflight should include the prepare-env command");
check(externalPreflightReport.doctorCommand === "npm run release:doctor", "external preflight should include the doctor command");
check(externalPreflightReport.prerequisiteCommand === "npm run release:check", "external preflight should identify the source evidence prerequisite");
check(externalPreflightReport.hardExternalGateCommand === "npm run release:external-check", "external preflight should keep the hard external gate command");
check(externalPreflightReport.targetedCommands.length === targetedChecks.length, "external preflight should include every targeted command");
check(externalPreflightReport.sourceArtifacts.every((artifact) => artifact.present), "external preflight should cite generated source artifacts");
check(externalPreflightReport.externalPreflightReady === true, "external preflight should be ready after targeted checks");
check(externalPreflightReport.sourceEvidenceReady === true, "external preflight should include source evidence readiness");
check(externalPreflightReport.localReleaseReady === true, "external preflight should include ready local release evidence");
check(externalPreflightReport.localReleaseReadinessPercent === 100, "external preflight should report 100 percent local release readiness");
check(externalPreflightReport.desktopProjectIoEvidenceReady === true, "external preflight should include ready desktop project IO evidence");
check(externalPreflightReport.pkgPayloadProjectIoEvidenceReady === true, "external preflight should include ready PKG payload project IO evidence");
check(typeof externalPreflightReport.externalDistributionReady === "boolean", "external preflight should include external distribution readiness");
check(typeof externalPreflightReport.externalDistributionGateReady === "boolean", "external preflight should include hard-gate readiness");
check(typeof externalPreflightReport.hardGateWouldFail === "boolean", "external preflight should include hard-gate would-fail status");
check(Array.isArray(externalPreflightReport.firstBlockers), "external preflight should include first blockers");
check(externalPreflightReport.localEnvValueRecorded === false, "external preflight should not record local env values");
check(externalPreflightReport.privateValuesRecorded === false, "external preflight should not record private values");
check(externalPreflightReport.releaseUrlValueRecorded === false, "external preflight should not record release URL values");
check(externalPreflightReport.supportUrlValueRecorded === false, "external preflight should not record support URL values");
check(externalPreflightReport.feedValueRecorded === false, "external preflight should not record feed values");
check(externalPreflightReport.credentialValueRecorded === false, "external preflight should not record credential values");
check(externalPreflightReport.tokenValueRecorded === false, "external preflight should not record token values");
check(externalPreflightReport.channelValueRecorded === false, "external preflight should not record channel values");
check(externalPreflightReport.developerIdIdentityValueRecorded === false, "external preflight should not record Developer ID identity values");
check(externalPreflightReport.sourceValueRecorded === false, "external preflight source artifacts should not record values");
check(externalPreflightReport.networkProbeAttemptedByThisPreflight === false, "external preflight should not probe remote channels");
check(externalPreflightReport.releaseUploadAttemptedByThisPreflight === false, "external preflight should not upload releases");
check(externalPreflightReport.notarySubmissionAttemptedByThisPreflight === false, "external preflight should not submit to Apple notary services");
check(externalPreflightReport.signingAttemptedByThisPreflight === false, "external preflight should not sign artifacts");
check(externalPreflightReport.releaseGateClaimedExternalDistribution === false, "external preflight should not claim external distribution completion");
check(externalPreflightReport.sourceClaimedExternalDistribution === false, "external preflight source artifacts should not claim external distribution completion");
check(markdown.includes("External Preflight"), "external preflight Markdown should include title");
check(markdown.includes("Preflight command: `npm run release:external-preflight`"), "external preflight Markdown should include the preflight command");
check(markdown.includes("Prepare env command: `npm run release:prepare-env`"), "external preflight Markdown should include the prepare-env command");
check(markdown.includes("Source evidence prerequisite: `npm run release:check`"), "external preflight Markdown should include the prerequisite command");
check(markdown.includes("Hard external distribution gate: `npm run release:external-check`"), "external preflight Markdown should keep the hard external gate command");
check(!/https?:\/\//i.test(markdown), "external preflight Markdown should not include public or private URL values");
check(!/https?:\/\//i.test(serializedReport), "external preflight JSON should not include public or private URL values");

if (failures.length > 0) {
  fail("External preflight validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge external preflight passed.");
console.log(`- Markdown: ${relative(preflightMarkdownPath)}`);
console.log(`- JSON: ${relative(preflightJsonPath)}`);
console.log(`- Completion stage: ${externalPreflightReport.completionStage}`);
console.log(`- Source evidence ready: ${externalPreflightReport.sourceEvidenceReady ? "yes" : "no"}`);
console.log(`- Local release ready: ${externalPreflightReport.localReleaseReady ? "yes" : "no"}`);
console.log(`- Local release readiness: ${externalPreflightReport.localReleaseReadinessPercent.toFixed(1)}%`);
console.log(`- Desktop project IO evidence ready: ${externalPreflightReport.desktopProjectIoEvidenceReady ? "yes" : "no"}`);
console.log(`- PKG payload project IO evidence ready: ${externalPreflightReport.pkgPayloadProjectIoEvidenceReady ? "yes" : "no"}`);
console.log(`- External distribution ready: ${externalPreflightReport.externalDistributionReady ? "yes" : "no"}`);
console.log(`- External distribution hard gate ready: ${externalPreflightReport.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- Hard gate would fail: ${externalPreflightReport.hardGateWouldFail ? "yes" : "no"}`);
console.log(`- External gate requirements ready: ${externalPreflightReport.gateRequirementReadyCount}/${externalPreflightReport.gateRequirementTotal} (${externalPreflightReport.gateRequirementReadinessPercent.toFixed(1)}%)`);
console.log(`- Remediation groups ready: ${externalPreflightReport.remediationReadyCount}/${externalPreflightReport.remediationTotal} (${externalPreflightReport.remediationReadinessPercent.toFixed(1)}%)`);
console.log(`- Private input groups ready: ${externalPreflightReport.privateInputGroupReadyCount}/${externalPreflightReport.privateInputGroupTotal}`);
console.log(`- First blockers tracked: ${externalPreflightReport.firstBlockers.length}`);
console.log(`- Local env file loaded: ${externalPreflightReport.localEnvFileLoaded ? "yes" : "no"}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted by this preflight");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
