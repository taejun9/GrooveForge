#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const summaryRoot = path.join(root, "build", "desktop");
const completionAuditPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-audit.json`);
const distributionEnvTemplatePath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-env-template.json`);
const privateInputsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-private-inputs.json`);
const distributionChannelQaPath = path.join(summaryRoot, `${appName}-${platformArch}-distribution-channel-qa.json`);
const autoUpdateReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const developerIdSigningPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(summaryRoot, `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(summaryRoot, `${appName}-${platformArch}-notarized-gatekeeper.json`);
const externalProofBundlePath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-proof-bundle.json`);
const externalGateMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-distribution-gate.md`);
const externalGateJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-distribution-gate.json`);
const privateEnvKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_DISTRIBUTION_QA_APPROVED",
  "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256",
  "GROOVEFORGE_UPDATE_FEED_URL",
  "ELECTRON_UPDATE_FEED_URL",
  "UPDATE_FEED_URL",
  "GROOVEFORGE_UPDATE_CHANNEL",
  "ELECTRON_UPDATE_CHANNEL",
  "UPDATE_CHANNEL",
  "GROOVEFORGE_DEVELOPER_ID_IDENTITY",
  "GROOVEFORGE_NOTARY_SUBMIT",
  "APPLE_ID",
  "APPLE_TEAM_ID",
  "APPLE_APP_SPECIFIC_PASSWORD",
  "ASC_KEY_ID",
  "ASC_ISSUER_ID",
  "ASC_KEY_PATH",
  "APPLE_NOTARY_PROFILE",
  "NOTARYTOOL_KEYCHAIN_PROFILE"
];
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge external distribution gate smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))];
}

function privateEnvironmentValues() {
  return privateEnvKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function requirement(label, ready, evidence, blocker) {
  return {
    label,
    ready: Boolean(ready),
    evidence,
    blockers: ready ? [] : [blocker],
    valueRecorded: false
  };
}

function valuesRedacted(...artifacts) {
  return artifacts.every((artifact) => {
    if (!artifact) {
      return false;
    }
    return (
      artifact.privateValuesRecorded !== true &&
      artifact.releaseUrlValueRecorded !== true &&
      artifact.supportUrlValueRecorded !== true &&
      artifact.feedValueRecorded !== true &&
      artifact.credentialValueRecorded !== true &&
      artifact.tokenValueRecorded !== true &&
      artifact.channelValueRecorded !== true &&
      artifact.developerIdIdentityValueRecorded !== true &&
      artifact.localEnvValueRecorded !== true &&
      artifact.valueRecorded !== true
    );
  });
}

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function valueFreeObjectRows(values) {
  return Array.isArray(values) ? values.filter((value) => value && typeof value === "object" && value.valueRecorded === false) : [];
}

function formatRequirementRows(requirements) {
  return requirements.map((item) => `| ${item.label} | ${item.ready ? "yes" : "no"} | ${item.evidence} |`).join("\n");
}

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
}

function escapeCell(value) {
  return String(value ?? "none").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function formatEditGuidanceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "- None.";
  }
  return [
    "| location | key | assignment | guidance | value recorded |",
    "|---|---|---|---|---:|",
    ...rows.map((row) => `| ${escapeCell(row.location ?? row.editTarget)} | ${escapeCell(row.key)} | ${escapeCell(row.assignment)} | ${escapeCell(row.guidance)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
  ].join("\n");
}

function formatProofChecklistRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "- None.";
  }
  return [
    "| order | criterion | evidence | proof command | hard gate | value recorded |",
    "|---:|---|---|---|---|---:|",
    ...rows.map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.criterion)} | ${escapeCell(row.evidenceSummary)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.hardGateCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
  ].join("\n");
}

function formatActionChecklistRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "- None.";
  }
  return [
    "| order | step | value recorded |",
    "|---:|---|---:|",
    ...rows.map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.step)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
  ].join("\n");
}

function formatCommandVerificationRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "- None.";
  }
  return [
    "| order | command | role | expectation | proof target | value recorded |",
    "|---:|---|---|---|---|---:|",
    ...rows.map((row) => `| ${row.order ?? "?"} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${escapeCell(row.expectation)} | ${escapeCell(row.proofTarget)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
  ].join("\n");
}

function buildCurrentProofSummary(externalProofBundle) {
  const currentEnvEditRows = valueFreeObjectRows(externalProofBundle?.currentEnvEditRows);
  const currentProofChecklistRows = valueFreeObjectRows(externalProofBundle?.currentProofChecklistRows);
  const currentActionChecklistRows = valueFreeObjectRows(externalProofBundle?.currentActionChecklistRows);
  const currentCommandVerificationRows = valueFreeObjectRows(externalProofBundle?.currentCommandVerificationRows);
  return {
    currentProofBundleSourceReady: Boolean(externalProofBundle),
    currentProofBundleSourcePath: relative(externalProofBundlePath),
    currentFocus: textValue(externalProofBundle?.currentFocus),
    currentNextCommand: textValue(externalProofBundle?.currentNextCommand),
    currentFirstBlocker: textValue(externalProofBundle?.currentFirstBlocker),
    currentOperatorAction: textValue(externalProofBundle?.currentOperatorAction),
    currentRequiredKeyCount: integerValue(externalProofBundle?.currentRequiredKeyCount),
    currentRequiredKeySummary: textValue(externalProofBundle?.currentRequiredKeySummary),
    currentPlaceholderKeyCount: integerValue(externalProofBundle?.currentPlaceholderKeyCount),
    currentPlaceholderKeySummary: textValue(externalProofBundle?.currentPlaceholderKeySummary),
    currentEnvEditTarget: textValue(externalProofBundle?.currentEnvEditTarget),
    currentEnvEditRowsCount: integerValue(externalProofBundle?.currentEnvEditRowsCount),
    currentEnvEditRowsSummary: textValue(externalProofBundle?.currentEnvEditRowsSummary),
    currentEnvEditRows,
    currentPlaceholderRemediationRowCount: integerValue(externalProofBundle?.currentPlaceholderRemediationRowCount),
    currentPlaceholderRemediationRowSummary: textValue(externalProofBundle?.currentPlaceholderRemediationRowSummary),
    currentProofChecklistRowCount: integerValue(externalProofBundle?.currentProofChecklistRowCount),
    currentProofChecklistRowSummary: textValue(externalProofBundle?.currentProofChecklistRowSummary),
    currentProofChecklistRows,
    currentActionChecklistCount: integerValue(externalProofBundle?.currentActionChecklistCount),
    currentActionChecklistSummary: textValue(externalProofBundle?.currentActionChecklistSummary),
    currentActionChecklistRows,
    currentRerunCommand: textValue(externalProofBundle?.currentRerunCommand),
    currentCommandSequenceCount: integerValue(externalProofBundle?.currentCommandSequenceCount),
    currentCommandSequenceSummary: textValue(externalProofBundle?.currentCommandSequenceSummary),
    currentCommandVerificationRowCount: integerValue(externalProofBundle?.currentCommandVerificationRowCount),
    currentCommandVerificationRowSummary: textValue(externalProofBundle?.currentCommandVerificationRowSummary),
    currentCommandVerificationRows,
    currentProofBundleSourceEvidenceReady: externalProofBundle?.sourceEvidenceReady === true,
    currentProofValueRecorded: false
  };
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} External Distribution Gate

## Status

- Dry run: ${summary.dryRun ? "yes" : "no"}
- External distribution gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}
- Hard gate would fail: ${summary.hardGateWouldFail ? "yes" : "no"}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Notary submission attempted by this gate: no
- Current proof bundle source ready: ${summary.currentProofBundleSourceReady ? "yes" : "no"}
- Current proof bundle source evidence ready: ${summary.currentProofBundleSourceEvidenceReady ? "yes" : "no"}
- Current next command: \`${summary.currentNextCommand}\`
- Current first blocker: ${summary.currentFirstBlocker}
- Current env edit rows: ${summary.currentEnvEditRowsCount} (${summary.currentEnvEditRowsSummary})
- Current proof checklist rows: ${summary.currentProofChecklistRowCount} (${summary.currentProofChecklistRowSummary})
- Current action checklist rows: ${summary.currentActionChecklistCount} (${summary.currentActionChecklistSummary})
- Current command verification rows: ${summary.currentCommandVerificationRowCount} (${summary.currentCommandVerificationRowSummary})

## Requirements

| requirement | ready | evidence |
|---|---:|---|
${formatRequirementRows(summary.requirements)}

## Gate Blockers

${formatBlockers(summary.externalDistributionGateBlockers)}

## Current Proof Action

- Source: ${summary.currentProofBundleSourcePath}
- Source ready: ${summary.currentProofBundleSourceReady ? "yes" : "no"}
- Focus: ${summary.currentFocus}
- Next command: \`${summary.currentNextCommand}\`
- First blocker: ${summary.currentFirstBlocker}
- Operator action: ${summary.currentOperatorAction}
- Required keys: ${summary.currentRequiredKeyCount} (${summary.currentRequiredKeySummary})
- Placeholder keys: ${summary.currentPlaceholderKeyCount} (${summary.currentPlaceholderKeySummary})
- Env edit target: ${summary.currentEnvEditTarget}
- Env edit rows: ${summary.currentEnvEditRowsCount} (${summary.currentEnvEditRowsSummary})
- Placeholder remediation rows: ${summary.currentPlaceholderRemediationRowCount} (${summary.currentPlaceholderRemediationRowSummary})
- Proof checklist rows: ${summary.currentProofChecklistRowCount} (${summary.currentProofChecklistRowSummary})
- Action checklist rows: ${summary.currentActionChecklistCount} (${summary.currentActionChecklistSummary})
- Rerun command: \`${summary.currentRerunCommand}\`
- Command sequence: ${summary.currentCommandSequenceCount} (${summary.currentCommandSequenceSummary})
- Command verification rows: ${summary.currentCommandVerificationRowCount} (${summary.currentCommandVerificationRowSummary})
- Current proof values recorded: no

## Current Edit Guidance

${formatEditGuidanceRows(summary.currentEnvEditRows)}

## Current Proof Checklist Rows

${formatProofChecklistRows(summary.currentProofChecklistRows)}

## Current Action Checklist Rows

${formatActionChecklistRows(summary.currentActionChecklistRows)}

## Current Command Verification Rows

${formatCommandVerificationRows(summary.currentCommandVerificationRows)}

## Next Commands

1. npm run release:check
2. npm run desktop:external-distribution-gate-smoke
3. npm run release:external-check

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, private beats, and real user audio are not recorded.

## Not Claimed

Dry-run mode does not claim external distribution completion. Hard mode claims only that the current redacted evidence satisfies this local external-distribution gate; it does not upload releases, publish update feeds, submit to Apple, or contact remote services.
`;
}

const completionAudit = await readJsonIfExists(completionAuditPath);
const distributionEnvTemplate = await readJsonIfExists(distributionEnvTemplatePath);
const privateInputs = await readJsonIfExists(privateInputsPath);
const distributionQa = await readJsonIfExists(distributionChannelQaPath);
const autoUpdate = await readJsonIfExists(autoUpdateReadinessPath);
const developerIdSigning = await readJsonIfExists(developerIdSigningPath);
const notarization = await readJsonIfExists(notarizationPath);
const notarizedGatekeeper = await readJsonIfExists(notarizedGatekeeperPath);
const externalProofBundle = await readJsonIfExists(externalProofBundlePath);

const requirements = [
  requirement("Completion audit artifact present", Boolean(completionAudit), relative(completionAuditPath), "Completion audit JSON is missing; run npm run release:check first."),
  requirement("Completion audit ready", completionAudit?.completionAuditReady === true, relative(completionAuditPath), "Completion audit is not ready."),
  requirement("Local MVP evidence ready", completionAudit?.localMvpEvidenceReady === true, relative(completionAuditPath), "Local MVP evidence is not ready."),
  requirement("Desktop project IO evidence ready", completionAudit?.desktopProjectIoEvidenceReady === true, relative(completionAuditPath), "Desktop project IO evidence is not ready."),
  requirement("PKG payload project IO evidence ready", completionAudit?.pkgPayloadProjectIoReady === true, relative(completionAuditPath), "PKG payload project IO evidence is not ready."),
  requirement("Local desktop package ready", completionAudit?.localDesktopPackageReady === true, relative(completionAuditPath), "Local desktop package evidence is not ready."),
  requirement("Redacted distribution evidence ready", completionAudit?.redactedDistributionEvidenceReady === true, relative(completionAuditPath), "Redacted distribution evidence is not ready."),
  requirement("Distribution env template ready", distributionEnvTemplate?.distributionEnvTemplateReady === true, relative(distributionEnvTemplatePath), "Distribution env template evidence is missing or incomplete."),
  requirement("Private inputs ready", privateInputs?.privateInputsReady === true, relative(privateInputsPath), "Private distribution inputs are not ready."),
  requirement("External distribution marked ready", completionAudit?.externalDistributionReady === true && privateInputs?.externalDistributionReady === true, `${relative(completionAuditPath)}, ${relative(privateInputsPath)}`, "Completion audit and private-input evidence do not mark external distribution ready."),
  requirement("Distribution-channel QA ready", distributionQa?.externalDistributionReady === true, relative(distributionChannelQaPath), "Distribution-channel QA is not ready."),
  requirement("Auto-update ready", autoUpdate?.autoUpdateReady === true, relative(autoUpdateReadinessPath), "Auto-update readiness is not complete."),
  requirement("Developer ID signed isolated app ready", developerIdSigning?.developerIdSigned === true, relative(developerIdSigningPath), "Developer ID signed isolated app evidence is missing."),
  requirement("Notarization accepted and stapled", notarization?.notarizationReady === true && notarization?.notarizationAccepted === true && notarization?.stapled === true && notarization?.stapleValidationPassed === true, relative(notarizationPath), "Notarization, stapling, or staple validation evidence is incomplete."),
  requirement("Notarized Gatekeeper accepted", notarizedGatekeeper?.notarizedGatekeeperAccepted === true, relative(notarizedGatekeeperPath), "Notarized Gatekeeper acceptance evidence is missing."),
  requirement("Private values redacted", valuesRedacted(completionAudit, distributionEnvTemplate, privateInputs), `${relative(completionAuditPath)}, ${relative(distributionEnvTemplatePath)}, ${relative(privateInputsPath)}`, "One or more redaction artifacts is missing or reports value recording.")
];

const externalDistributionGateBlockers = unique([
  ...requirements.flatMap((item) => item.blockers),
  ...(completionAudit?.externalDistributionBlockers ?? []),
  ...(privateInputs?.privateInputBlockers ?? []),
  ...(privateInputs?.externalDistributionBlockers ?? []),
  ...(distributionQa?.blockers ?? []),
  ...(autoUpdate?.blockers ?? []),
  ...(developerIdSigning?.blockers ?? []),
  ...(notarization?.blockers ?? []),
  ...(notarizedGatekeeper?.blockers ?? [])
]);
const externalDistributionGateReady = requirements.every((item) => item.ready) && externalDistributionGateBlockers.length === 0;
const summary = {
  appName,
  bundleId,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  dryRun,
  externalGateMarkdownPath: relative(externalGateMarkdownPath),
  externalGateJsonPath: relative(externalGateJsonPath),
  inputs: {
    completionAuditPath: relative(completionAuditPath),
    distributionEnvTemplatePath: relative(distributionEnvTemplatePath),
    privateInputsPath: relative(privateInputsPath),
    distributionChannelQaPath: relative(distributionChannelQaPath),
    autoUpdateReadinessPath: relative(autoUpdateReadinessPath),
    developerIdSigningPath: relative(developerIdSigningPath),
    notarizationPath: relative(notarizationPath),
    notarizedGatekeeperPath: relative(notarizedGatekeeperPath),
    externalProofBundlePath: relative(externalProofBundlePath)
  },
  ...buildCurrentProofSummary(externalProofBundle),
  requirements,
  externalDistributionGateReady,
  hardGateWouldFail: !externalDistributionGateReady,
  externalDistributionGateBlockers,
  privateValuesRecorded: false,
  releaseUrlValueRecorded: false,
  supportUrlValueRecorded: false,
  feedValueRecorded: false,
  credentialValueRecorded: false,
  tokenValueRecorded: false,
  channelValueRecorded: false,
  developerIdIdentityValueRecorded: false,
  localEnvValueRecorded: false,
  networkProbeAttempted: false,
  releaseUploadAttempted: false,
  notarySubmissionAttemptedByThisGate: false,
  signingAttemptedByThisGate: false,
  releaseGateClaimedExternalDistribution: !dryRun && externalDistributionGateReady
};
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(externalGateJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(externalGateMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "external distribution gate should identify GrooveForge");
check(summary.bundleId === bundleId, `external distribution gate should identify ${bundleId}`);
check(summary.version === packageJson.version, "external distribution gate should match package version");
check(Array.isArray(summary.requirements) && summary.requirements.length >= 10, "external distribution gate should include requirement rows");
const pkgPayloadProjectIoRequirement = summary.requirements.find((item) => item.label === "PKG payload project IO evidence ready");
const sourceMissingProofBundleGateContext =
  summary.dryRun === true &&
  summary.currentProofBundleSourceReady === true &&
  summary.currentProofBundleSourceEvidenceReady === false;
check(
  pkgPayloadProjectIoRequirement?.ready === true ||
    (sourceMissingProofBundleGateContext &&
      pkgPayloadProjectIoRequirement?.ready === false &&
      summary.externalDistributionGateBlockers.includes("PKG payload project IO evidence is not ready.")),
  "external distribution gate should require ready PKG payload project IO evidence or keep it blocked in source-missing dry-run"
);
check(Array.isArray(summary.externalDistributionGateBlockers), "external distribution gate should include blockers");
check(summary.currentProofValueRecorded === false, "external distribution gate current proof summary should not record values");
check(Array.isArray(summary.currentEnvEditRows), "external distribution gate should expose current env edit rows");
check(summary.currentEnvEditRows.every((row) => row.valueRecorded === false), "external distribution gate current env edit rows should not record values");
check(Array.isArray(summary.currentProofChecklistRows), "external distribution gate should expose current proof checklist rows");
check(summary.currentProofChecklistRows.every((row) => row.valueRecorded === false), "external distribution gate current proof checklist rows should not record values");
check(Array.isArray(summary.currentActionChecklistRows), "external distribution gate should expose current action checklist rows");
check(summary.currentActionChecklistRows.every((row) => row.valueRecorded === false), "external distribution gate current action checklist rows should not record values");
check(Array.isArray(summary.currentCommandVerificationRows), "external distribution gate should expose current command verification rows");
check(summary.currentCommandVerificationRows.every((row) => row.valueRecorded === false), "external distribution gate current command verification rows should not record values");
if (summary.currentProofBundleSourceReady) {
  check(summary.currentNextCommand !== "none", "external distribution gate should mirror the current next command when proof bundle evidence exists");
  check(summary.currentEnvEditRowsCount === summary.currentEnvEditRows.length, "external distribution gate should mirror current env edit row count");
  check(summary.currentProofChecklistRowCount === summary.currentProofChecklistRows.length, "external distribution gate should mirror current proof checklist row count");
  check(summary.currentActionChecklistCount === summary.currentActionChecklistRows.length, "external distribution gate should mirror current action checklist count");
  check(summary.currentCommandVerificationRowCount === summary.currentCommandVerificationRows.length, "external distribution gate should mirror current command verification row count");
}
check(summary.privateValuesRecorded === false, "external distribution gate should not record private values");
check(summary.releaseUrlValueRecorded === false, "external distribution gate should not record release URL values");
check(summary.supportUrlValueRecorded === false, "external distribution gate should not record support URL values");
check(summary.feedValueRecorded === false, "external distribution gate should not record feed values");
check(summary.credentialValueRecorded === false, "external distribution gate should not record credential values");
check(summary.tokenValueRecorded === false, "external distribution gate should not record token values");
check(summary.channelValueRecorded === false, "external distribution gate should not record channel values");
check(summary.developerIdIdentityValueRecorded === false, "external distribution gate should not record Developer ID identity values");
check(summary.localEnvValueRecorded === false, "external distribution gate should not record local env values");
check(summary.networkProbeAttempted === false, "external distribution gate should not probe remote channels");
check(summary.releaseUploadAttempted === false, "external distribution gate should not upload release artifacts");
check(summary.notarySubmissionAttemptedByThisGate === false, "external distribution gate should not submit to Apple notary services");
check(summary.signingAttemptedByThisGate === false, "external distribution gate should not sign artifacts");
check(summary.releaseGateClaimedExternalDistribution === (!dryRun && externalDistributionGateReady), "external distribution gate claim should match hard-mode readiness");
check(markdown.includes("External distribution gate ready:"), "external distribution gate report should include readiness");
check(markdown.includes("Hard gate would fail:"), "external distribution gate report should include hard-gate outcome");
check(markdown.includes("Current Proof Action"), "external distribution gate report should include current proof action");
check(markdown.includes("Current Edit Guidance"), "external distribution gate report should include current edit guidance");
check(markdown.includes("Current Proof Checklist Rows"), "external distribution gate report should include current proof checklist rows");
check(markdown.includes("Current Action Checklist Rows"), "external distribution gate report should include current action checklist rows");
check(markdown.includes("Current Command Verification Rows"), "external distribution gate report should include current command verification rows");
check(markdown.includes("Private values recorded: no"), "external distribution gate report should state value redaction");
check(!/https?:\/\//i.test(markdown), "external distribution gate should not include public or private URL values");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of privateEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "external distribution gate should not include private environment values");
}

if (failures.length > 0) {
  fail("External distribution gate validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

if (!dryRun && !externalDistributionGateReady) {
  fail(
    "External distribution gate is not ready.",
    [
      `- Markdown: ${relative(externalGateMarkdownPath)}`,
      `- JSON: ${relative(externalGateJsonPath)}`,
      ...summary.externalDistributionGateBlockers.map((blocker) => `- ${blocker}`)
    ].join("\n")
  );
}

console.log("GrooveForge external distribution gate smoke passed.");
console.log(`- Markdown: ${relative(externalGateMarkdownPath)}`);
console.log(`- JSON: ${relative(externalGateJsonPath)}`);
console.log(`- Dry run: ${summary.dryRun ? "yes" : "no"}`);
console.log(`- External distribution gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- Hard gate would fail: ${summary.hardGateWouldFail ? "yes" : "no"}`);
console.log(`- Current proof bundle source ready: ${summary.currentProofBundleSourceReady ? "yes" : "no"}`);
console.log(`- Current proof bundle source evidence ready: ${summary.currentProofBundleSourceEvidenceReady ? "yes" : "no"}`);
console.log(`- Current next command: ${summary.currentNextCommand}`);
console.log(`- Current first blocker: ${summary.currentFirstBlocker}`);
console.log(`- Current env edit rows: ${summary.currentEnvEditRowsCount} (${summary.currentEnvEditRowsSummary})`);
console.log(`- Current proof checklist rows: ${summary.currentProofChecklistRowCount} (${summary.currentProofChecklistRowSummary})`);
console.log(`- Current action checklist rows: ${summary.currentActionChecklistCount} (${summary.currentActionChecklistSummary})`);
console.log(`- Current command verification rows: ${summary.currentCommandVerificationRowCount} (${summary.currentCommandVerificationRowSummary})`);
console.log("- Private values recorded: no");
if (summary.externalDistributionGateBlockers.length > 0) {
  console.log(`- Gate blockers: ${summary.externalDistributionGateBlockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe, release upload, or Apple notary submission attempted by this gate");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, private beats, or real user audio");
console.log(
  dryRun
    ? "- Not claimed in dry-run: external distribution completion"
    : "- Claimed by hard gate only when redacted evidence satisfies external distribution readiness"
);
