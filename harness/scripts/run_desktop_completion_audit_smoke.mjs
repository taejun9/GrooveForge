#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDistributionLocalEnv } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const summaryRoot = path.join(root, "build", "desktop");
const readinessDocPath = path.join(root, "docs", "release", "readiness.md");
const readmePath = path.join(root, "README.md");
const qualityRulesPath = path.join(root, "docs", "quality", "rules.md");
const releaseManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const releaseNotesPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-notes.json`);
const supportArtifactPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-support.json`);
const updateMetadataPolicyPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-update-metadata-policy.json`);
const updateFeedConfigPath = path.join(summaryRoot, `${appName}-${platformArch}-update-feed-config.json`);
const autoUpdateReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const developerIdReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-readiness.json`);
const developerIdSigningPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(summaryRoot, `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(summaryRoot, `${appName}-${platformArch}-notarized-gatekeeper.json`);
const distributionChannelQaPath = path.join(summaryRoot, `${appName}-${platformArch}-distribution-channel-qa.json`);
const handoffPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-handoff.json`);
const bundleManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-bundle-manifest.json`);
const distributionEnvTemplatePath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-env-template.json`);
const privateInputsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-private-inputs.json`);
const completionAuditMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-audit.md`);
const completionAuditJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-audit.json`);
const privateEnvKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_DISTRIBUTION_QA_APPROVED",
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
const distributionLocalEnv = await loadDistributionLocalEnv({ root, allowedKeys: privateEnvKeys });
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge completion audit smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

async function readTextIfExists(filePath) {
  if (!existsSync(filePath)) {
    return "";
  }
  return readFile(filePath, "utf8");
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

function hasAll(text, markers) {
  return markers.every((marker) => text.includes(marker));
}

function artifact(label, filePath, json, ready) {
  return {
    label,
    path: relative(filePath),
    present: Boolean(json) || existsSync(filePath),
    ready: Boolean(ready),
    valueRecorded: false
  };
}

function privateEnvironmentValues() {
  return privateEnvKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function blockerWhen(condition, message) {
  return condition ? [] : [message];
}

function releaseArtifactReady(manifest) {
  return (
    Boolean(manifest) &&
    manifest?.appName === appName &&
    manifest?.appBundle?.bundleIdentifier === bundleId &&
    /^[a-f0-9]{64}$/.test(manifest?.dmg?.sha256 ?? "") &&
    Number(manifest?.dmg?.bytes ?? 0) > 10000000 &&
    manifest?.signing?.adHocCodeSigningClaimed === true &&
    manifest?.signing?.hardenedRuntimeFlagPresent === true &&
    manifest?.signing?.developerIdCodeSigningClaimed !== true &&
    manifest?.signing?.notarizationClaimed !== true &&
    manifest?.signing?.autoUpdateClaimed !== true &&
    manifest?.signing?.externalDistributionChannelQaClaimed !== true
  );
}

function evidenceReady(json, key) {
  return Boolean(json) && json?.[key] === true;
}

function buildRequirementAudit(input) {
  const { readme, readinessDoc, qualityRules, releaseManifest, releaseNotes, supportArtifact, handoff, bundleManifest, distributionEnvTemplate, privateInputs } = input;
  const productScopeReady =
    hasAll(readme, ["making beats across genres", "direct beat composition", "Sampling stays a later optional sound-source module"]) &&
    hasAll(readinessDoc, ["Direct beat composition is the product spine", "Sampling is secondary and optional."]) &&
    hasAll(qualityRules, ["Korean concept-brief checks must treat", "샘플링은 부가 기능"]);
  const beginnerReady =
    hasAll(readinessDoc, ["First-time composers get a guided setup -> compose -> arrange -> mix -> deliver path."]) &&
    hasAll(readme, ["First Beat Path", "Guide Quick Start"]);
  const producerReady =
    hasAll(readinessDoc, ["Working producers can bypass guidance and edit fast."]) &&
    hasAll(readme, ["Studio mode", "Quick Actions"]);
  const exportReady =
    hasAll(readinessDoc, ["A sample-free 8-bar beat can be generated and exported.", "All supported genres have editable starts."]) &&
    hasAll(readme, ["sample-free 8-bar beat", "WAV headers"]);
  const localDesktopReady = releaseArtifactReady(releaseManifest);
  const supportReady =
    evidenceReady(releaseNotes, "releaseNotesArtifactReady") &&
    evidenceReady(supportArtifact, "supportArtifactReady") &&
    releaseNotes?.releaseUrlValueRecorded !== true &&
    supportArtifact?.supportUrlValueRecorded !== true;
  const distributionEvidenceReady =
    evidenceReady(handoff, "distributionHandoffReady") &&
    evidenceReady(bundleManifest, "distributionBundleManifestReady") &&
    evidenceReady(distributionEnvTemplate, "distributionEnvTemplateReady") &&
    Boolean(privateInputs) &&
    privateInputs?.privateValuesRecorded === false &&
    privateInputs?.releaseUrlValueRecorded === false &&
    privateInputs?.supportUrlValueRecorded === false &&
    privateInputs?.feedValueRecorded === false &&
    privateInputs?.credentialValueRecorded === false &&
    privateInputs?.tokenValueRecorded === false &&
    privateInputs?.channelValueRecorded === false &&
    privateInputs?.developerIdIdentityValueRecorded === false;
  const privacyReady =
    hasAll(readinessDoc, ["Local-first privacy boundary is preserved."]) &&
    distributionEvidenceReady &&
    privateInputs?.networkProbeAttempted === false &&
    privateInputs?.releaseUploadAttempted === false &&
    privateInputs?.notarySubmissionAttempted === false;
  const externalReady = privateInputs?.externalDistributionReady === true;

  return [
    {
      label: "All-genre direct beat workstation scope",
      ready: productScopeReady,
      evidence: ["README.md", "docs/release/readiness.md", "docs/quality/rules.md"],
      blockers: blockerWhen(productScopeReady, "Product scope evidence is missing or sampling is not clearly secondary.")
    },
    {
      label: "First-time beat maker path",
      ready: beginnerReady,
      evidence: ["Guide Quick Start", "First Beat Path", "workflow smoke"],
      blockers: blockerWhen(beginnerReady, "Beginner workflow evidence is incomplete.")
    },
    {
      label: "Working producer path",
      ready: producerReady,
      evidence: ["Studio mode", "Quick Actions", "workflow smoke"],
      blockers: blockerWhen(producerReady, "Producer workflow evidence is incomplete.")
    },
    {
      label: "Sample-free all-style export",
      ready: exportReady,
      evidence: ["runtime smoke", "release readiness matrix"],
      blockers: blockerWhen(exportReady, "Sample-free all-style export evidence is incomplete.")
    },
    {
      label: "Local desktop package evidence",
      ready: localDesktopReady,
      evidence: [relative(releaseManifestPath)],
      blockers: blockerWhen(localDesktopReady, "Release manifest evidence is missing or not locally package-ready.")
    },
    {
      label: "Release notes and support evidence",
      ready: supportReady,
      evidence: [relative(releaseNotesPath), relative(supportArtifactPath)],
      blockers: blockerWhen(supportReady, "Release notes or support artifacts are missing or not redacted.")
    },
    {
      label: "Redacted distribution evidence",
      ready: distributionEvidenceReady,
      evidence: [relative(handoffPath), relative(bundleManifestPath), relative(distributionEnvTemplatePath), relative(privateInputsPath)],
      blockers: blockerWhen(distributionEvidenceReady, "Distribution handoff, bundle manifest, env-template, or private-input evidence is missing or not value-free.")
    },
    {
      label: "Local-first privacy and value redaction",
      ready: privacyReady,
      evidence: [relative(privateInputsPath), "docs/release/readiness.md"],
      blockers: blockerWhen(privacyReady, "Privacy or redaction evidence is incomplete.")
    },
    {
      label: "External macOS distribution",
      ready: externalReady,
      evidence: [relative(privateInputsPath), relative(distributionChannelQaPath)],
      blockers: externalReady ? [] : ["External distribution still requires private values, credentials, notarization/Gatekeeper acceptance, update metadata, and manual channel QA."]
    }
  ];
}

function formatRequirementRows(requirements) {
  return requirements.map((item) => `| ${item.label} | ${item.ready ? "yes" : "no"} | ${item.evidence.join(", ")} |`).join("\n");
}

function formatArtifactRows(artifacts) {
  return artifacts.map((item) => `| ${item.label} | ${item.present ? "yes" : "no"} | ${item.ready ? "yes" : "no"} | ${item.path} |`).join("\n");
}

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} Completion Audit

## What GrooveForge Is

${appName} is an all-genre desktop beat workstation for direct beat composition, sound design, arrangement, mixing, mastering, and local export. It supports First-time beat makers through guided flow and Working producers through direct editing flow. Sampling remains optional future scope, not the release identity.

## Completion Status

- Local MVP evidence ready: ${summary.localMvpEvidenceReady ? "yes" : "no"}
- Local desktop package evidence ready: ${summary.localDesktopPackageReady ? "yes" : "no"}
- Redacted distribution evidence ready: ${summary.redactedDistributionEvidenceReady ? "yes" : "no"}
- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}
- Completion audit ready: ${summary.completionAuditReady ? "yes" : "no"}
- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Notary submission attempted: no

## Requirement Audit

| requirement | ready | evidence |
|---|---:|---|
${formatRequirementRows(summary.requirementAudit)}

## Evidence Artifacts

| artifact | present | ready | path |
|---|---:|---:|---|
${formatArtifactRows(summary.evidenceArtifacts)}

## Next Local Commands

1. npm run release:check
2. npm run desktop:completion-audit-smoke
3. npm run desktop:distribution-private-inputs-smoke
4. npm run desktop:developer-id-signing-smoke
5. npm run desktop:notarization-smoke
6. npm run desktop:notarized-gatekeeper-smoke

## Local Completion Blockers

${formatBlockers(summary.localCompletionBlockers)}

## External Distribution Blockers

${formatBlockers(summary.externalDistributionBlockers)}

## Not Claimed

This local completion audit does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, release upload, notary submission, or external distribution-channel QA.
`;
}

async function createCompletionAuditSummary() {
  const readme = await readTextIfExists(readmePath);
  const readinessDoc = await readTextIfExists(readinessDocPath);
  const qualityRules = await readTextIfExists(qualityRulesPath);
  const releaseManifest = await readJsonIfExists(releaseManifestPath);
  const releaseNotes = await readJsonIfExists(releaseNotesPath);
  const supportArtifact = await readJsonIfExists(supportArtifactPath);
  const updateFeedConfig = await readJsonIfExists(updateFeedConfigPath);
  const updatePolicy = await readJsonIfExists(updateMetadataPolicyPath);
  const autoUpdate = await readJsonIfExists(autoUpdateReadinessPath);
  const developerIdReadiness = await readJsonIfExists(developerIdReadinessPath);
  const developerIdSigning = await readJsonIfExists(developerIdSigningPath);
  const notarization = await readJsonIfExists(notarizationPath);
  const gatekeeper = await readJsonIfExists(notarizedGatekeeperPath);
  const distributionQa = await readJsonIfExists(distributionChannelQaPath);
  const handoff = await readJsonIfExists(handoffPath);
  const bundleManifest = await readJsonIfExists(bundleManifestPath);
  const distributionEnvTemplate = await readJsonIfExists(distributionEnvTemplatePath);
  const privateInputs = await readJsonIfExists(privateInputsPath);
  const requirementAudit = buildRequirementAudit({
    readme,
    readinessDoc,
    qualityRules,
    releaseManifest,
    releaseNotes,
    supportArtifact,
    handoff,
    bundleManifest,
    distributionEnvTemplate,
    privateInputs
  });
  const localRequirementLabels = requirementAudit.filter((item) => item.label !== "External macOS distribution");
  const localMvpEvidenceReady = localRequirementLabels.every((item) => item.ready);
  const localDesktopPackageReady = releaseArtifactReady(releaseManifest);
  const redactedDistributionEvidenceReady = requirementAudit.find((item) => item.label === "Redacted distribution evidence")?.ready === true;
  const externalDistributionReady = privateInputs?.externalDistributionReady === true;
  const evidenceArtifacts = [
    artifact("Release readiness doc", readinessDocPath, readinessDoc, readinessDoc.includes("GrooveForge Release Readiness Evidence")),
    artifact("README", readmePath, readme, readme.includes("making beats across genres")),
    artifact("Release manifest", releaseManifestPath, releaseManifest, releaseArtifactReady(releaseManifest)),
    artifact("Release notes", releaseNotesPath, releaseNotes, evidenceReady(releaseNotes, "releaseNotesArtifactReady")),
    artifact("Support artifact", supportArtifactPath, supportArtifact, evidenceReady(supportArtifact, "supportArtifactReady")),
    artifact("Update feed config", updateFeedConfigPath, updateFeedConfig, Boolean(updateFeedConfig)),
    artifact("Update metadata policy", updateMetadataPolicyPath, updatePolicy, evidenceReady(updatePolicy, "updateMetadataPolicyAvailable")),
    artifact("Auto-update readiness", autoUpdateReadinessPath, autoUpdate, Boolean(autoUpdate)),
    artifact("Developer ID readiness", developerIdReadinessPath, developerIdReadiness, Boolean(developerIdReadiness)),
    artifact("Developer ID signing", developerIdSigningPath, developerIdSigning, Boolean(developerIdSigning)),
    artifact("Notarization", notarizationPath, notarization, Boolean(notarization)),
    artifact("Notarized Gatekeeper", notarizedGatekeeperPath, gatekeeper, Boolean(gatekeeper)),
    artifact("Distribution-channel QA", distributionChannelQaPath, distributionQa, Boolean(distributionQa)),
    artifact("Distribution handoff", handoffPath, handoff, evidenceReady(handoff, "distributionHandoffReady")),
    artifact("Distribution bundle manifest", bundleManifestPath, bundleManifest, evidenceReady(bundleManifest, "distributionBundleManifestReady")),
    artifact("Distribution env template", distributionEnvTemplatePath, distributionEnvTemplate, evidenceReady(distributionEnvTemplate, "distributionEnvTemplateReady")),
    artifact("Distribution private inputs", privateInputsPath, privateInputs, Boolean(privateInputs) && privateInputs.privateValuesRecorded === false)
  ];
  const localCompletionBlockers = unique(requirementAudit.flatMap((item) => (item.label === "External macOS distribution" ? [] : item.blockers)));
  const externalDistributionBlockers = unique([
    ...(privateInputs?.externalDistributionBlockers ?? []),
    ...(privateInputs?.privateInputBlockers ?? []),
    ...(bundleManifest?.externalDistributionBlockers ?? []),
    ...(handoff?.externalDistributionBlockers ?? []),
    ...(distributionQa?.blockers ?? []),
    ...(autoUpdate?.blockers ?? []),
    ...(developerIdReadiness?.blockers ?? []),
    ...(developerIdSigning?.blockers ?? []),
    ...(notarization?.blockers ?? []),
    ...(gatekeeper?.blockers ?? [])
  ]);

  return {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    completionAuditMarkdownPath: relative(completionAuditMarkdownPath),
    completionAuditJsonPath: relative(completionAuditJsonPath),
    productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
    targetUsers: ["First-time beat makers", "Working producers"],
    localMvpEvidenceReady,
    localDesktopPackageReady,
    redactedDistributionEvidenceReady,
    externalDistributionReady,
    completionAuditReady: localMvpEvidenceReady && localDesktopPackageReady && redactedDistributionEvidenceReady,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttempted: false,
    signingAttempted: false,
    localEnvInput: distributionLocalEnv,
    localEnvValueRecorded: false,
    privateValuesRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedExternalDistribution: false,
    requirementAudit,
    evidenceArtifacts,
    localCompletionBlockers,
    externalDistributionBlockers
  };
}

const summary = await createCompletionAuditSummary();
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(completionAuditJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(completionAuditMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "completion audit should identify GrooveForge");
check(summary.bundleId === bundleId, `completion audit should identify ${bundleId}`);
check(summary.version === packageJson.version, "completion audit should match package version");
check(summary.productScope.includes("all-genre direct beat workstation"), "completion audit should describe direct beat workstation scope");
check(summary.productScope.includes("sampling optional"), "completion audit should keep sampling optional");
check(summary.targetUsers.includes("First-time beat makers"), "completion audit should address first-time beat makers");
check(summary.targetUsers.includes("Working producers"), "completion audit should address working producers");
check(Array.isArray(summary.requirementAudit) && summary.requirementAudit.length >= 8, "completion audit should include requirement audit rows");
check(Array.isArray(summary.evidenceArtifacts) && summary.evidenceArtifacts.length >= 10, "completion audit should include evidence artifacts");
check(summary.networkProbeAttempted === false, "completion audit should not probe remote channels");
check(summary.releaseUploadAttempted === false, "completion audit should not upload release artifacts");
check(summary.notarySubmissionAttempted === false, "completion audit should not submit to Apple notary services");
check(summary.signingAttempted === false, "completion audit should not sign artifacts");
check(summary.localEnvInput?.valueRecorded === false, "completion audit local env loader should not record values");
check(summary.localEnvValueRecorded === false, "completion audit should not record local env values");
check(summary.privateValuesRecorded === false, "completion audit should not record private values");
check(summary.releaseUrlValueRecorded === false, "completion audit should not record release URL values");
check(summary.supportUrlValueRecorded === false, "completion audit should not record support URL values");
check(summary.feedValueRecorded === false, "completion audit should not record feed values");
check(summary.credentialValueRecorded === false, "completion audit should not record credential values");
check(summary.tokenValueRecorded === false, "completion audit should not record token values");
check(summary.channelValueRecorded === false, "completion audit should not record channel values");
check(summary.developerIdIdentityValueRecorded === false, "completion audit should not record Developer ID identity values");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "completion audit should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "completion audit should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "completion audit should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "completion audit should not claim auto-update");
check(summary.releaseGateClaimedExternalDistribution === false, "completion audit should not claim external distribution completion");
check(markdown.includes("all-genre desktop beat workstation"), "completion audit should describe the all-genre desktop beat workstation");
check(markdown.includes("Sampling remains optional future scope"), "completion audit should keep sampling secondary");
check(markdown.includes("First-time beat makers"), "completion audit should address first-time beat makers");
check(markdown.includes("Working producers"), "completion audit should address working producers");
check(markdown.includes("Local MVP evidence ready:"), "completion audit should include local MVP readiness");
check(markdown.includes("External distribution ready:"), "completion audit should include external readiness");
check(markdown.includes("Local env file loaded:"), "completion audit should include local env loader status");
check(markdown.includes("Private values recorded: no"), "completion audit should state value redaction");
check(!/https?:\/\//i.test(markdown), "completion audit should not include public or private URL values before channel selection");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of privateEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "completion audit should not include private environment values");
}

if (failures.length > 0) {
  fail("Completion audit validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge completion audit smoke passed.");
console.log(`- Markdown: ${relative(completionAuditMarkdownPath)}`);
console.log(`- JSON: ${relative(completionAuditJsonPath)}`);
console.log(`- Local MVP evidence ready: ${summary.localMvpEvidenceReady ? "yes" : "no"}`);
console.log(`- Local desktop package evidence ready: ${summary.localDesktopPackageReady ? "yes" : "no"}`);
console.log(`- Redacted distribution evidence ready: ${summary.redactedDistributionEvidenceReady ? "yes" : "no"}`);
console.log(`- External distribution ready: ${summary.externalDistributionReady ? "yes" : "no"}`);
console.log(`- Completion audit ready: ${summary.completionAuditReady ? "yes" : "no"}`);
console.log(`- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}`);
console.log("- Private values recorded: no");
if (summary.localCompletionBlockers.length > 0) {
  console.log(`- Local completion blockers: ${summary.localCompletionBlockers.join(" | ")}`);
}
if (summary.externalDistributionBlockers.length > 0) {
  console.log(`- External distribution blockers: ${summary.externalDistributionBlockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe, release upload, or Apple notary submission attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, private beats, or real user audio");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
