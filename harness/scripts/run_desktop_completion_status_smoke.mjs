#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionPrivateInputKeys, loadDistributionLocalEnv } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const completionAuditPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-audit.json`);
const externalGatePath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-distribution-gate.json`);
const externalRemediationPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-remediation.json`);
const releaseManifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const pkgPayloadProjectIoPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-pkg-payload-project-io-smoke`,
  `${appName}-${packageJson.version}-${platformArch}-pkg-payload-project-io-smoke.json`
);
const releaseReadinessPath = path.join(root, "docs", "release", "readiness.md");
const completionStatusMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-status.md`);
const completionStatusJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-status.json`);
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
const distributionLocalEnv = await loadDistributionLocalEnv({ root, allowedKeys: distributionPrivateInputKeys });
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge completion status smoke failed:");
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

async function readTextIfExists(filePath) {
  if (!existsSync(filePath)) {
    return "";
  }
  return readFile(filePath, "utf8");
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))];
}

function evidence(filePath, ready, label) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready: Boolean(ready),
    valueRecorded: false
  };
}

function dimension(label, ready, evidencePaths, blockers = []) {
  return {
    label,
    ready: Boolean(ready),
    evidence: evidencePaths,
    blockers: ready ? [] : unique(blockers),
    valueRecorded: false
  };
}

function formatDimensionRows(dimensions) {
  return dimensions.map((item) => `| ${item.label} | ${item.ready ? "yes" : "no"} | ${item.evidence.join(", ")} |`).join("\n");
}

function formatEvidenceRows(evidenceArtifacts) {
  return evidenceArtifacts.map((item) => `| ${item.label} | ${item.present ? "yes" : "no"} | ${item.ready ? "yes" : "no"} | ${item.path} |`).join("\n");
}

function formatPendingGroups(groups) {
  if (groups.length === 0) {
    return "- None.";
  }
  return groups.map((group) => `- ${group.label}: ${group.blockers.length} blocker(s); rerun ${group.rerunCommands.join(", ") || "release gate"}`).join("\n");
}

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
}

function sensitiveEnvironmentValues() {
  return sensitivePrivateKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function completionStage(dimensions) {
  const localReady = dimensions.filter((item) => item.label !== "External distribution hard gate").every((item) => item.ready);
  const externalReady = dimensions.find((item) => item.label === "External distribution hard gate")?.ready === true;
  if (localReady && externalReady) {
    return "external distribution ready";
  }
  if (localReady) {
    return "local release ready; external distribution pending";
  }
  return "local release evidence incomplete";
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} Completion Status

## Status

- Completion stage: ${summary.completionStage}
- Completion status ready: ${summary.completionStatusReady ? "yes" : "no"}
- Local MVP evidence ready: ${summary.localMvpEvidenceReady ? "yes" : "no"}
- Desktop project IO evidence ready: ${summary.desktopProjectIoEvidenceReady ? "yes" : "no"}
- PKG payload project IO evidence ready: ${summary.pkgPayloadProjectIoReady ? "yes" : "no"}
- Local desktop package ready: ${summary.localDesktopPackageReady ? "yes" : "no"}
- Redacted distribution evidence ready: ${summary.redactedDistributionEvidenceReady ? "yes" : "no"}
- External distribution hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}
- Pending external remediation groups: ${summary.pendingExternalRemediationCount}
- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted by this smoke: no
- Signing attempted by this smoke: no

## Completion Dimensions

| dimension | ready | evidence |
|---|---:|---|
${formatDimensionRows(summary.completionDimensions)}

## Evidence Artifacts

| artifact | present | ready | path |
|---|---:|---:|---|
${formatEvidenceRows(summary.evidenceArtifacts)}

## Pending External Remediation Groups

${formatPendingGroups(summary.pendingExternalRemediationGroups)}

## Consolidated Blockers

${formatBlockers(summary.completionStatusBlockers)}

## Next Commands

1. npm run release:check
2. npm run desktop:completion-status-smoke
3. npm run release:external-check

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, private beats, and real user audio are not recorded.

## Not Claimed

This completion status artifact does not claim external distribution completion. The hard gate remains \`npm run release:external-check\`.
`;
}

async function createCompletionStatusSummary() {
  const completionAudit = await readJsonIfExists(completionAuditPath);
  const externalGate = await readJsonIfExists(externalGatePath);
  const externalRemediation = await readJsonIfExists(externalRemediationPath);
  const releaseManifest = await readJsonIfExists(releaseManifestPath);
  const releaseReadiness = await readTextIfExists(releaseReadinessPath);
  const completionAuditReady = completionAudit?.completionAuditReady === true;
  const localMvpEvidenceReady = completionAudit?.localMvpEvidenceReady === true;
  const desktopProjectIoEvidenceReady = completionAudit?.desktopProjectIoEvidenceReady === true;
  const pkgPayloadProjectIoReady = completionAudit?.pkgPayloadProjectIoReady === true;
  const localDesktopPackageReady = completionAudit?.localDesktopPackageReady === true;
  const redactedDistributionEvidenceReady = completionAudit?.redactedDistributionEvidenceReady === true;
  const externalDistributionGateReady = externalGate?.externalDistributionGateReady === true;
  const externalRemediationReady = externalRemediation?.externalRemediationReady === true;
  const pendingExternalRemediationGroups = (externalRemediation?.remediationGroups ?? []).filter((group) => group.ready !== true);
  const localBlockers = unique(completionAudit?.localCompletionBlockers ?? []);
  const externalBlockers = unique([
    ...(completionAudit?.externalDistributionBlockers ?? []),
    ...(externalGate?.externalDistributionGateBlockers ?? []),
    ...(externalRemediation?.remediationBlockers ?? [])
  ]);
  const completionDimensions = [
    dimension("Direct beat workstation MVP", localMvpEvidenceReady, [relative(completionAuditPath), "docs/release/readiness.md"], localBlockers),
    dimension("Desktop project IO", desktopProjectIoEvidenceReady, [relative(completionAuditPath), relative(pkgPayloadProjectIoPath)], localBlockers),
    dimension("Local desktop package", localDesktopPackageReady, [relative(releaseManifestPath), relative(completionAuditPath)], localBlockers),
    dimension("Redacted distribution evidence", redactedDistributionEvidenceReady, [relative(completionAuditPath), relative(externalRemediationPath)], localBlockers),
    dimension("External remediation guidance", Boolean(externalRemediation), [relative(externalRemediationPath)], ["External remediation artifact is missing."]),
    dimension("External distribution hard gate", externalDistributionGateReady, [relative(externalGatePath)], externalBlockers)
  ];
  const completionStatusReady =
    completionAuditReady &&
    localMvpEvidenceReady &&
    desktopProjectIoEvidenceReady &&
    localDesktopPackageReady &&
    redactedDistributionEvidenceReady &&
    Boolean(externalGate) &&
    Boolean(externalRemediation);
  const evidenceArtifacts = [
    evidence(completionAuditPath, completionAuditReady, "Completion audit"),
    evidence(pkgPayloadProjectIoPath, pkgPayloadProjectIoReady, "PKG payload project IO"),
    evidence(externalGatePath, Boolean(externalGate), "External distribution gate"),
    evidence(externalRemediationPath, Boolean(externalRemediation), "External remediation"),
    evidence(releaseManifestPath, Boolean(releaseManifest), "Release manifest"),
    evidence(releaseReadinessPath, releaseReadiness.includes("GrooveForge Release Readiness Evidence"), "Release readiness matrix")
  ];

  return {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    completionStatusMarkdownPath: relative(completionStatusMarkdownPath),
    completionStatusJsonPath: relative(completionStatusJsonPath),
    productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
    targetUsers: ["First-time beat makers", "Working producers"],
    localMvpEvidenceReady,
    desktopProjectIoEvidenceReady,
    pkgPayloadProjectIoReady,
    localDesktopPackageReady,
    redactedDistributionEvidenceReady,
    externalDistributionGateReady,
    externalRemediationReady,
    completionStatusReady,
    completionStage: completionStage(completionDimensions),
    pendingExternalRemediationCount: pendingExternalRemediationGroups.length,
    pendingExternalRemediationGroups: pendingExternalRemediationGroups.map((group) => ({
      id: group.id,
      label: group.label,
      requiredKeys: group.requiredKeys ?? [],
      blockers: group.blockers ?? [],
      rerunCommands: group.rerunCommands ?? [],
      valueRecorded: false
    })),
    completionDimensions,
    evidenceArtifacts,
    completionStatusBlockers: unique([
      ...completionDimensions.flatMap((item) => item.blockers),
      ...(completionStatusReady ? [] : ["Completion status source evidence is incomplete."])
    ]),
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
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttemptedByThisSmoke: false,
    signingAttemptedByThisSmoke: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedExternalDistribution: false
  };
}

const summary = await createCompletionStatusSummary();
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(completionStatusJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(completionStatusMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "completion status should identify GrooveForge");
check(summary.bundleId === bundleId, `completion status should identify ${bundleId}`);
check(summary.version === packageJson.version, "completion status should match package version");
check(summary.productScope.includes("all-genre direct beat workstation"), "completion status should describe direct beat workstation scope");
check(summary.productScope.includes("sampling optional"), "completion status should keep sampling optional");
check(summary.targetUsers.includes("First-time beat makers"), "completion status should address first-time beat makers");
check(summary.targetUsers.includes("Working producers"), "completion status should address working producers");
check(Array.isArray(summary.completionDimensions) && summary.completionDimensions.length >= 6, "completion status should include completion dimensions");
check(summary.desktopProjectIoEvidenceReady === true, "completion status should include ready desktop project IO evidence");
check(
  summary.completionDimensions.some((item) => item.label === "Desktop project IO" && item.ready === true),
  "completion status should include a ready desktop project IO dimension"
);
check(Array.isArray(summary.evidenceArtifacts) && summary.evidenceArtifacts.length >= 6, "completion status should include evidence artifacts");
check(summary.pkgPayloadProjectIoReady === true, "completion status should include ready PKG payload project IO evidence");
check(
  summary.evidenceArtifacts.some((item) => item.label === "PKG payload project IO" && item.ready === true),
  "completion status should include a ready PKG payload project IO artifact row"
);
check(summary.completionDimensions.every((item) => item.valueRecorded === false), "completion dimensions should not record values");
check(summary.pendingExternalRemediationGroups.every((item) => item.valueRecorded === false), "pending remediation groups should not record values");
check(summary.localEnvInput?.valueRecorded === false, "completion status local env loader should not record values");
check(summary.localEnvValueRecorded === false, "completion status should not record local env values");
check(summary.privateValuesRecorded === false, "completion status should not record private values");
check(summary.releaseUrlValueRecorded === false, "completion status should not record release URL values");
check(summary.supportUrlValueRecorded === false, "completion status should not record support URL values");
check(summary.feedValueRecorded === false, "completion status should not record feed values");
check(summary.credentialValueRecorded === false, "completion status should not record credential values");
check(summary.tokenValueRecorded === false, "completion status should not record token values");
check(summary.channelValueRecorded === false, "completion status should not record channel values");
check(summary.developerIdIdentityValueRecorded === false, "completion status should not record Developer ID identity values");
check(summary.networkProbeAttempted === false, "completion status should not probe remote channels");
check(summary.releaseUploadAttempted === false, "completion status should not upload release artifacts");
check(summary.notarySubmissionAttemptedByThisSmoke === false, "completion status should not submit to Apple notary services");
check(summary.signingAttemptedByThisSmoke === false, "completion status should not sign artifacts");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "completion status should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "completion status should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "completion status should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "completion status should not claim auto-update");
check(summary.releaseGateClaimedExternalDistribution === false, "completion status should not claim external distribution completion");
check(markdown.includes("Completion Status"), "completion status Markdown should include title");
check(markdown.includes("Completion stage:"), "completion status Markdown should include stage");
check(markdown.includes("Desktop project IO evidence ready:"), "completion status Markdown should include desktop project IO readiness");
check(markdown.includes("PKG payload project IO evidence ready:"), "completion status Markdown should include PKG payload project IO readiness");
check(markdown.includes("Private values recorded: no"), "completion status Markdown should state value redaction");
check(markdown.includes("The hard gate remains `npm run release:external-check`"), "completion status Markdown should point to hard gate");
check(!/https?:\/\//i.test(markdown), "completion status should not include public or private URL values");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of sensitiveEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "completion status should not include sensitive private environment values");
}

if (failures.length > 0) {
  fail("Completion status validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge completion status smoke passed.");
console.log(`- Markdown: ${relative(completionStatusMarkdownPath)}`);
console.log(`- JSON: ${relative(completionStatusJsonPath)}`);
console.log(`- Completion stage: ${summary.completionStage}`);
console.log(`- Completion status ready: ${summary.completionStatusReady ? "yes" : "no"}`);
console.log(`- Local MVP evidence ready: ${summary.localMvpEvidenceReady ? "yes" : "no"}`);
console.log(`- Desktop project IO evidence ready: ${summary.desktopProjectIoEvidenceReady ? "yes" : "no"}`);
console.log(`- PKG payload project IO evidence ready: ${summary.pkgPayloadProjectIoReady ? "yes" : "no"}`);
console.log(`- Local desktop package ready: ${summary.localDesktopPackageReady ? "yes" : "no"}`);
console.log(`- Redacted distribution evidence ready: ${summary.redactedDistributionEvidenceReady ? "yes" : "no"}`);
console.log(`- External distribution hard gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- Pending external remediation groups: ${summary.pendingExternalRemediationCount}`);
console.log(`- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}`);
console.log("- Private values recorded: no");
if (summary.completionStatusBlockers.length > 0) {
  console.log(`- Completion status blockers: ${summary.completionStatusBlockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, private beats, or real user audio");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution completion");
