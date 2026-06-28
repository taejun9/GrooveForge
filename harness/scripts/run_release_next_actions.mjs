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
const summaryRoot = path.join(root, "build", "desktop");
const args = new Set(process.argv.slice(2));
const fromExisting = args.has("--from-existing");
const nextActionsMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-next-actions.md`);
const nextActionsJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-next-actions.json`);
const externalPreflightPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-preflight.json`);
const externalRemediationPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-remediation.json`);
const externalRunbookPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-operator-runbook.json`);
const externalLedgerPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-readiness-ledger.json`);
const completionProgressPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-progress.json`);
const releaseDoctorPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-doctor.json`);
const distributionManualQaPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-manual-qa.json`);
const developerIdSigningPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(summaryRoot, `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(summaryRoot, `${appName}-${platformArch}-notarized-gatekeeper.json`);
const autoUpdateReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const failures = [];
const sourceArtifacts = [
  { label: "External preflight", path: externalPreflightPath },
  { label: "External remediation", path: externalRemediationPath },
  { label: "External operator runbook", path: externalRunbookPath },
  { label: "External readiness ledger", path: externalLedgerPath },
  { label: "Completion progress", path: completionProgressPath },
  { label: "Release doctor", path: releaseDoctorPath }
];
const sensitivePrivateKeys = [
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_UPDATE_FEED_URL",
  "ELECTRON_UPDATE_FEED_URL",
  "UPDATE_FEED_URL",
  "GROOVEFORGE_DEVELOPER_ID_IDENTITY",
  "APPLE_ID",
  "APPLE_TEAM_ID",
  "APPLE_APP_SPECIFIC_PASSWORD",
  "ASC_KEY_ID",
  "ASC_ISSUER_ID",
  "ASC_KEY_PATH",
  "APPLE_NOTARY_PROFILE",
  "NOTARYTOOL_KEYCHAIN_PROFILE"
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge external next actions failed:");
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

function readyLabel(value) {
  return value ? "yes" : "no";
}

async function readJsonRequired(artifact) {
  if (!existsSync(artifact.path)) {
    fail(
      `${artifact.label} artifact is missing.`,
      fromExisting
        ? `Run \`npm run release:external-preflight\` first, then rerun \`npm run release:next-actions-smoke\`.\nExpected: ${relative(artifact.path)}`
        : `Expected: ${relative(artifact.path)}`
    );
  }
  return JSON.parse(await readFile(artifact.path, "utf8"));
}

function runExternalPreflight() {
  if (fromExisting) {
    return;
  }
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", "release:external-preflight"], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail("Could not run npm run release:external-preflight.", result.error.message);
  }
  if (result.status !== 0) {
    fail(`npm run release:external-preflight exited with status ${result.status}.`);
  }
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
    "valueRecorded",
    "sourceValueRecorded"
  ];
  return sources.some((source) => fields.some((field) => source?.[field] === true) || source?.localEnvInput?.valueRecorded === true);
}

function sourceClaimedExternalDistribution(...sources) {
  return sources.some(
    (source) => source?.releaseGateClaimedExternalDistribution === true || source?.sourceClaimedExternalDistribution === true
  );
}

function artifact(label, filePath) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    valueRecorded: false
  };
}

function firstValue(values) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0) ?? "";
}

function formatActionRows(actions) {
  if (actions.length === 0) {
    return "| none | none | yes | none | none |";
  }
  return actions
    .map(
      (action) =>
        `| ${action.order} | ${escapeCell(action.label)} | ${readyLabel(action.ready)} | ${escapeCell(action.nextCommand)} | ${escapeCell(action.firstBlocker || "none")} |`
    )
    .join("\n");
}

function formatDetailRows(actions) {
  if (actions.length === 0) {
    return "No blocked next actions remain in the redacted evidence. Run the hard external gate.";
  }
  return actions
    .map((action) => {
      const requiredKeys = action.requiredKeys.length > 0 ? action.requiredKeys.join(", ") : "none";
      const prerequisites = action.prerequisiteCommands.map((command) => `   - \`${command}\``).join("\n") || "   - none";
      const operatorActions = action.operatorActions.map((item) => `   - ${item}`).join("\n") || "   - none";
      const rerunCommands = action.rerunCommands.map((command) => `   - \`${command}\``).join("\n") || "   - none";
      const blockers = action.blockers.map((blocker) => `   - ${blocker}`).join("\n") || "   - none";
      return `${action.order}. ${action.label}
   Required keys: ${requiredKeys}
   Next command: \`${action.nextCommand}\`
   Prerequisites:
${prerequisites}
   Operator actions:
${operatorActions}
   Rerun commands:
${rerunCommands}
   Blockers:
${blockers}`;
    })
    .join("\n\n");
}

function formatArtifactRows(artifacts) {
  return artifacts.map((item) => `| ${escapeCell(item.label)} | ${readyLabel(item.present)} | ${escapeCell(item.path)} |`).join("\n");
}

function formatBlockerRows(blockers) {
  if (blockers.length === 0) {
    return "| none | none |";
  }
  return blockers.map((blocker, index) => `| ${index + 1} | ${escapeCell(blocker)} |`).join("\n");
}

function sensitiveEnvironmentValues() {
  return sensitivePrivateKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function buildPriorityActions(remediation) {
  return (remediation.remediationGroups ?? [])
    .filter((group) => group.ready !== true)
    .map((group, index) => ({
      order: index + 1,
      id: group.id,
      label: group.label,
      ready: false,
      requiredKeys: group.requiredKeys ?? [],
      evidence: group.evidence ?? [],
      prerequisiteCommands: group.prerequisiteCommands ?? [],
      operatorActions: group.operatorActions ?? [],
      rerunCommands: group.rerunCommands ?? [],
      nextCommand: firstValue(group.rerunCommands ?? []) || "npm run release:external-preflight",
      firstBlocker: firstValue(group.blockers ?? []),
      blockers: group.blockers ?? [],
      valueRecorded: false
    }));
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} External Next Actions

## Status

- Next actions ready: ${readyLabel(report.externalNextActionsReady)}
- Completion stage: ${report.completionStage}
- Current focus: ${report.currentFocus}
- Local release ready: ${readyLabel(report.localReleaseReady)}
- Local release readiness: ${report.localReleaseReadinessPercent.toFixed(1)}%
- External distribution ready: ${readyLabel(report.externalDistributionReady)}
- External hard gate ready: ${readyLabel(report.externalDistributionGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Priority actions pending: ${report.priorityActions.length}
- External gate requirements ready: ${report.gateRequirementReadyCount}/${report.gateRequirementTotal} (${report.gateRequirementReadinessPercent.toFixed(1)}%)
- Remediation groups ready: ${report.remediationReadyCount}/${report.remediationTotal} (${report.remediationReadinessPercent.toFixed(1)}%)
- Private input groups ready: ${report.privateInputGroupReadyCount}/${report.privateInputGroupTotal}
- Manual QA checklist digest available: ${readyLabel(report.manualQaChecklistDigestAvailable)}
- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}
- Private values recorded: no
- Network probe attempted by this next-actions report: no
- Release upload attempted by this next-actions report: no
- Apple notary submission attempted by this next-actions report: no
- Signing attempted by this next-actions report: no

## Commands

- Next actions command: \`${report.nextActionsCommand}\`
- Source preflight command: \`${report.externalPreflightCommand}\`
- Prepare env command: \`${report.prepareEnvCommand}\`
- Fast doctor command: \`${report.doctorCommand}\`
- Hard external distribution gate: \`${report.hardExternalGateCommand}\`

## Priority Next Actions

| order | action | ready | next command | first blocker |
|---:|---|---:|---|---|
${formatActionRows(report.priorityActions)}

## Action Details

${formatDetailRows(report.priorityActions)}

## Source Artifacts

| artifact | present | path |
|---|---:|---|
${formatArtifactRows(report.sourceArtifacts)}

## Current First Blockers

| order | blocker |
|---:|---|
${formatBlockerRows(report.firstBlockers)}

## Interpretation

This is the compact operator view after external preflight. It does not replace \`npm run release:external-preflight\` or the hard gate \`npm run release:external-check\`.

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, local env values, private beats, and real user audio are not recorded.

## Not Claimed

This next-actions report does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

runExternalPreflight();

const artifactRows = sourceArtifacts.map((item) => artifact(item.label, item.path));
const [externalPreflight, externalRemediation, externalRunbook, externalLedger, completionProgress, releaseDoctor] = await Promise.all(
  sourceArtifacts.map(readJsonRequired)
);
const priorityActions = buildPriorityActions(externalRemediation);
const firstBlockers = unique([
  priorityActions.map((action) => action.firstBlocker),
  externalPreflight.firstBlockers ?? [],
  completionProgress.firstBlockers?.map((item) => item.blocker) ?? [],
  externalLedger.firstBlockers ?? [],
  externalRemediation.remediationBlockers ?? []
]).slice(0, 12);
const currentFocus = priorityActions[0]?.label ?? (externalPreflight.externalDistributionGateReady ? "Run hard external distribution gate" : "Refresh external preflight evidence");

const nextActionsReport = {
  appName,
  bundleId,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  nextActionsCommand: "npm run release:next-actions",
  nextActionsSmokeCommand: "npm run release:next-actions-smoke",
  externalPreflightCommand: "npm run release:external-preflight",
  prepareEnvCommand: "npm run release:prepare-env",
  doctorCommand: "npm run release:doctor",
  hardExternalGateCommand: "npm run release:external-check",
  externalNextActionsMarkdownPath: relative(nextActionsMarkdownPath),
  externalNextActionsJsonPath: relative(nextActionsJsonPath),
  productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
  nextActionsScope: "value-free prioritized external distribution operator actions from redacted preflight and remediation evidence",
  sourceArtifacts: artifactRows,
  sourceEvidenceReady: artifactRows.every((item) => item.present),
  completionStage: externalPreflight.completionStage ?? completionProgress.completionStage ?? "unknown",
  currentFocus,
  localReleaseReady: externalPreflight.localReleaseReady === true,
  localReleaseReadinessPercent: externalPreflight.localReleaseReadinessPercent ?? 0,
  externalDistributionReady: externalPreflight.externalDistributionReady === true,
  externalDistributionGateReady: externalPreflight.externalDistributionGateReady === true,
  hardGateWouldFail: externalPreflight.hardGateWouldFail === true,
  gateRequirementTotal: externalPreflight.gateRequirementTotal ?? completionProgress.gateRequirementTotal ?? 0,
  gateRequirementReadyCount: externalPreflight.gateRequirementReadyCount ?? completionProgress.gateRequirementReadyCount ?? 0,
  gateRequirementReadinessPercent: externalPreflight.gateRequirementReadinessPercent ?? completionProgress.gateRequirementReadinessPercent ?? 0,
  remediationTotal: externalPreflight.remediationTotal ?? completionProgress.remediationTotal ?? 0,
  remediationReadyCount: externalPreflight.remediationReadyCount ?? completionProgress.remediationReadyCount ?? 0,
  remediationReadinessPercent: externalPreflight.remediationReadinessPercent ?? completionProgress.remediationReadinessPercent ?? 0,
  privateInputGroupTotal: externalPreflight.privateInputGroupTotal ?? releaseDoctor.privateInputGroupTotal ?? 0,
  privateInputGroupReadyCount: externalPreflight.privateInputGroupReadyCount ?? releaseDoctor.privateInputGroupReadyCount ?? 0,
  manualQaChecklistDigestAvailable: externalPreflight.manualQaChecklistDigestAvailable === true || externalRunbook.manualQaChecklistSha256 !== null,
  localEnvFileLoaded: externalPreflight.localEnvFileLoaded === true,
  priorityActions,
  priorityActionCount: priorityActions.length,
  firstBlockers,
  actionEvidence: [
    artifact("Developer ID signing", developerIdSigningPath),
    artifact("Notarization", notarizationPath),
    artifact("Notarized Gatekeeper", notarizedGatekeeperPath),
    artifact("Auto-update readiness", autoUpdateReadinessPath),
    artifact("Distribution manual QA", distributionManualQaPath)
  ],
  localEnvValueRecorded: false,
  privateValuesRecorded: false,
  releaseUrlValueRecorded: false,
  supportUrlValueRecorded: false,
  feedValueRecorded: false,
  credentialValueRecorded: false,
  tokenValueRecorded: false,
  channelValueRecorded: false,
  developerIdIdentityValueRecorded: false,
  networkProbeAttemptedByThisNextActionsReport: false,
  releaseUploadAttemptedByThisNextActionsReport: false,
  notarySubmissionAttemptedByThisNextActionsReport: false,
  signingAttemptedByThisNextActionsReport: false,
  releaseGateClaimedDeveloperIdSigning: false,
  releaseGateClaimedNotarization: false,
  releaseGateClaimedGatekeeperApproval: false,
  releaseGateClaimedAutoUpdate: false,
  releaseGateClaimedManualQaApproval: false,
  releaseGateClaimedExternalDistribution: false,
  sourceValueRecorded: sourceValueRecorded(externalPreflight, externalRemediation, externalRunbook, externalLedger, completionProgress, releaseDoctor),
  sourceClaimedExternalDistribution: sourceClaimedExternalDistribution(
    externalPreflight,
    externalRemediation,
    externalRunbook,
    externalLedger,
    completionProgress,
    releaseDoctor
  )
};

nextActionsReport.externalNextActionsReady =
  nextActionsReport.sourceEvidenceReady &&
  externalPreflight.externalPreflightReady === true &&
  Array.isArray(externalRemediation.remediationGroups) &&
  externalRunbook.operatorRunbookReady === true &&
  externalLedger.ledgerReady === true &&
  completionProgress.completionProgressReady === true &&
  nextActionsReport.localReleaseReady === true &&
  nextActionsReport.localReleaseReadinessPercent === 100 &&
  nextActionsReport.priorityActions.every((action) => action.valueRecorded === false) &&
  nextActionsReport.sourceValueRecorded === false &&
  nextActionsReport.sourceClaimedExternalDistribution === false;

const markdown = buildMarkdown(nextActionsReport);
const serializedReport = `${JSON.stringify(nextActionsReport, null, 2)}\n`;

await mkdir(packageRoot, { recursive: true });
await writeFile(nextActionsJsonPath, serializedReport, "utf8");
await writeFile(nextActionsMarkdownPath, markdown, "utf8");

check(nextActionsReport.appName === appName, "external next actions should identify GrooveForge");
check(nextActionsReport.bundleId === bundleId, `external next actions should identify ${bundleId}`);
check(nextActionsReport.nextActionsCommand === "npm run release:next-actions", "external next actions should identify the next-actions command");
check(nextActionsReport.nextActionsSmokeCommand === "npm run release:next-actions-smoke", "external next actions should identify the smoke command");
check(nextActionsReport.externalPreflightCommand === "npm run release:external-preflight", "external next actions should include the preflight command");
check(nextActionsReport.prepareEnvCommand === "npm run release:prepare-env", "external next actions should include the prepare-env command");
check(nextActionsReport.hardExternalGateCommand === "npm run release:external-check", "external next actions should keep the hard gate command");
check(nextActionsReport.productScope.includes("all-genre direct beat workstation"), "external next actions should describe direct beat workstation scope");
check(nextActionsReport.productScope.includes("sampling optional"), "external next actions should keep sampling optional");
check(nextActionsReport.sourceArtifacts.every((item) => item.present), "external next actions should cite generated source artifacts");
check(nextActionsReport.externalNextActionsReady === true, "external next actions should be ready from redacted preflight evidence");
check(nextActionsReport.localReleaseReady === true, "external next actions should include local release readiness");
check(nextActionsReport.localReleaseReadinessPercent === 100, "external next actions should report 100 percent local release readiness");
check(Array.isArray(nextActionsReport.priorityActions), "external next actions should include priority actions");
check(nextActionsReport.externalDistributionReady === true || nextActionsReport.priorityActions.length > 0, "pending external distribution should include at least one priority action");
check(nextActionsReport.priorityActions.every((action) => action.ready === false), "priority actions should be pending actions only");
check(nextActionsReport.priorityActions.every((action) => action.valueRecorded === false), "priority actions should not record values");
check(nextActionsReport.priorityActions.every((action) => typeof action.nextCommand === "string" && action.nextCommand.length > 0), "priority actions should include next commands");
check(nextActionsReport.localEnvValueRecorded === false, "external next actions should not record local env values");
check(nextActionsReport.privateValuesRecorded === false, "external next actions should not record private values");
check(nextActionsReport.releaseUrlValueRecorded === false, "external next actions should not record release URL values");
check(nextActionsReport.supportUrlValueRecorded === false, "external next actions should not record support URL values");
check(nextActionsReport.feedValueRecorded === false, "external next actions should not record feed values");
check(nextActionsReport.credentialValueRecorded === false, "external next actions should not record credential values");
check(nextActionsReport.tokenValueRecorded === false, "external next actions should not record token values");
check(nextActionsReport.channelValueRecorded === false, "external next actions should not record channel values");
check(nextActionsReport.developerIdIdentityValueRecorded === false, "external next actions should not record Developer ID identity values");
check(nextActionsReport.sourceValueRecorded === false, "external next actions source artifacts should not record values");
check(nextActionsReport.networkProbeAttemptedByThisNextActionsReport === false, "external next actions should not probe remote channels");
check(nextActionsReport.releaseUploadAttemptedByThisNextActionsReport === false, "external next actions should not upload release artifacts");
check(nextActionsReport.notarySubmissionAttemptedByThisNextActionsReport === false, "external next actions should not submit to Apple notary services");
check(nextActionsReport.signingAttemptedByThisNextActionsReport === false, "external next actions should not sign artifacts");
check(nextActionsReport.releaseGateClaimedExternalDistribution === false, "external next actions should not claim external distribution completion");
check(nextActionsReport.sourceClaimedExternalDistribution === false, "external next actions source artifacts should not claim external distribution completion");
check(markdown.includes("External Next Actions"), "external next actions Markdown should include title");
check(markdown.includes("Current focus:"), "external next actions Markdown should include current focus");
check(markdown.includes("Priority Next Actions"), "external next actions Markdown should include priority actions");
check(markdown.includes("Hard external distribution gate: `npm run release:external-check`"), "external next actions Markdown should keep the hard gate command");
check(markdown.includes("Private values recorded: no"), "external next actions Markdown should state value redaction");
check(!/https?:\/\//i.test(markdown), "external next actions Markdown should not include public or private URL values");
check(!/https?:\/\//i.test(serializedReport), "external next actions JSON should not include public or private URL values");

const combinedOutput = `${markdown}\n${serializedReport}`;
for (const privateValue of sensitiveEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "external next actions should not include sensitive private environment values");
}

if (failures.length > 0) {
  fail("External next actions validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge external next actions passed.");
console.log(`- Markdown: ${relative(nextActionsMarkdownPath)}`);
console.log(`- JSON: ${relative(nextActionsJsonPath)}`);
console.log(`- Completion stage: ${nextActionsReport.completionStage}`);
console.log(`- Current focus: ${nextActionsReport.currentFocus}`);
console.log(`- Local release ready: ${nextActionsReport.localReleaseReady ? "yes" : "no"}`);
console.log(`- Local release readiness: ${nextActionsReport.localReleaseReadinessPercent.toFixed(1)}%`);
console.log(`- External distribution ready: ${nextActionsReport.externalDistributionReady ? "yes" : "no"}`);
console.log(`- External hard gate ready: ${nextActionsReport.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- Hard gate would fail: ${nextActionsReport.hardGateWouldFail ? "yes" : "no"}`);
console.log(`- Priority actions pending: ${nextActionsReport.priorityActions.length}`);
console.log(`- External gate requirements ready: ${nextActionsReport.gateRequirementReadyCount}/${nextActionsReport.gateRequirementTotal} (${nextActionsReport.gateRequirementReadinessPercent.toFixed(1)}%)`);
console.log(`- Remediation groups ready: ${nextActionsReport.remediationReadyCount}/${nextActionsReport.remediationTotal} (${nextActionsReport.remediationReadinessPercent.toFixed(1)}%)`);
console.log(`- Private input groups ready: ${nextActionsReport.privateInputGroupReadyCount}/${nextActionsReport.privateInputGroupTotal}`);
console.log(`- Local env file loaded: ${nextActionsReport.localEnvFileLoaded ? "yes" : "no"}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted by this next-actions report");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
