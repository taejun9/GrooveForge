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

function formatRequirementRows(requirements) {
  return requirements.map((item) => `| ${item.label} | ${item.ready ? "yes" : "no"} | ${item.evidence} |`).join("\n");
}

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
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

## Requirements

| requirement | ready | evidence |
|---|---:|---|
${formatRequirementRows(summary.requirements)}

## Gate Blockers

${formatBlockers(summary.externalDistributionGateBlockers)}

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

const requirements = [
  requirement("Completion audit artifact present", Boolean(completionAudit), relative(completionAuditPath), "Completion audit JSON is missing; run npm run release:check first."),
  requirement("Completion audit ready", completionAudit?.completionAuditReady === true, relative(completionAuditPath), "Completion audit is not ready."),
  requirement("Local MVP evidence ready", completionAudit?.localMvpEvidenceReady === true, relative(completionAuditPath), "Local MVP evidence is not ready."),
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
    notarizedGatekeeperPath: relative(notarizedGatekeeperPath)
  },
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
check(Array.isArray(summary.externalDistributionGateBlockers), "external distribution gate should include blockers");
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
