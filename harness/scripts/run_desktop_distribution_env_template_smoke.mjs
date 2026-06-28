#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionLocalEnvDefaults, loadDistributionLocalEnv } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const templateRelativePath = "harness/templates/distribution-private-inputs.env.example";
const templatePath = path.join(root, ...templateRelativePath.split("/"));
const localEnvPath = path.join(root, distributionLocalEnvDefaults.defaultEnvFileName);
const envTemplateMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-env-template.md`);
const envTemplateJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-env-template.json`);
const distributionMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_DISTRIBUTION_QA_APPROVED",
  "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256"
];
const updateFeedUrlKeys = ["GROOVEFORGE_UPDATE_FEED_URL", "ELECTRON_UPDATE_FEED_URL", "UPDATE_FEED_URL"];
const updateChannelKeys = ["GROOVEFORGE_UPDATE_CHANNEL", "ELECTRON_UPDATE_CHANNEL", "UPDATE_CHANNEL"];
const signingKeys = ["GROOVEFORGE_DEVELOPER_ID_IDENTITY"];
const notarizationKeys = [
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
const allPrivateKeys = [...distributionMetadataKeys, ...updateFeedUrlKeys, ...updateChannelKeys, ...signingKeys, ...notarizationKeys];
const placeholderPattern = /^(|<[^>]+>|CHANGE_ME|REPLACE_ME|TODO|TBD|example|example-.+|your-.+)$/i;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge distribution env template smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  const withoutExport = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
  const separatorIndex = withoutExport.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }
  const key = withoutExport.slice(0, separatorIndex).trim();
  let value = withoutExport.slice(separatorIndex + 1).trim();
  if (!/^[A-Z0-9_]+$/.test(key)) {
    return null;
  }
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function parseTemplateEntries(templateText) {
  return templateText
    .split(/\r?\n/)
    .map(parseEnvLine)
    .filter(Boolean);
}

function isPlaceholderValue(value) {
  return placeholderPattern.test(String(value).trim());
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))];
}

function readEnv(key) {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : "";
}

function firstPresentKey(keys) {
  return keys.find((key) => readEnv(key).length > 0) ?? null;
}

function validateHttpsKey(key) {
  const value = readEnv(key);
  if (!value) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && Boolean(parsed.hostname) && !parsed.username && !parsed.password && !parsed.hash;
  } catch {
    return false;
  }
}

function group(label, requiredKeys, presentKeys) {
  return {
    label,
    requiredKeys,
    presentKeys: requiredKeys.filter((key) => presentKeys.has(key)),
    covered: requiredKeys.every((key) => presentKeys.has(key)),
    valueRecorded: false
  };
}

function privateEnvironmentValues() {
  return allPrivateKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function localEnvBlockers(localEnvInput) {
  const blockers = [];
  if (!localEnvInput.enabled) {
    blockers.push(`${distributionLocalEnvDefaults.defaultEnvFileName} is not present.`);
  }
  if (localEnvInput.unknownKeys.length > 0) {
    blockers.push(`Unknown local env keys: ${localEnvInput.unknownKeys.join(", ")}`);
  }
  if (localEnvInput.malformedLines.length > 0) {
    blockers.push(`Malformed local env lines: ${localEnvInput.malformedLines.join(", ")}`);
  }
  if (localEnvInput.placeholderKeys.length > 0) {
    blockers.push(`Placeholder local env keys: ${localEnvInput.placeholderKeys.join(", ")}`);
  }
  if (!/^(direct-download|private-beta|managed-release)$/.test(readEnv("GROOVEFORGE_DISTRIBUTION_CHANNEL"))) {
    blockers.push("GROOVEFORGE_DISTRIBUTION_CHANNEL must use an allowed channel.");
  }
  for (const key of ["GROOVEFORGE_RELEASE_DOWNLOAD_URL", "GROOVEFORGE_RELEASE_NOTES_URL", "GROOVEFORGE_SUPPORT_URL"]) {
    if (!validateHttpsKey(key)) {
      blockers.push(`${key} must be a safe HTTPS URL.`);
    }
  }
  if (!updateFeedUrlKeys.some(validateHttpsKey)) {
    blockers.push("One update feed URL key must be a safe HTTPS URL.");
  }
  const updateChannelKey = firstPresentKey(updateChannelKeys);
  if (!updateChannelKey || !/^[a-z0-9][a-z0-9._-]{0,31}$/.test(readEnv(updateChannelKey))) {
    blockers.push("One update channel key must pass local channel validation.");
  }
  if (!readEnv("GROOVEFORGE_DEVELOPER_ID_IDENTITY")) {
    blockers.push("GROOVEFORGE_DEVELOPER_ID_IDENTITY must be set for external distribution.");
  }
  const appleIdCredentialKeysPresent =
    readEnv("APPLE_ID").length > 0 &&
    readEnv("APPLE_TEAM_ID").length > 0 &&
    readEnv("APPLE_APP_SPECIFIC_PASSWORD").length > 0;
  const appStoreConnectApiKeyPresent =
    readEnv("ASC_KEY_ID").length > 0 &&
    readEnv("ASC_ISSUER_ID").length > 0 &&
    readEnv("ASC_KEY_PATH").length > 0;
  const notarytoolProfilePresent =
    readEnv("APPLE_NOTARY_PROFILE").length > 0 ||
    readEnv("NOTARYTOOL_KEYCHAIN_PROFILE").length > 0;
  if (!appleIdCredentialKeysPresent && !appStoreConnectApiKeyPresent && !notarytoolProfilePresent) {
    blockers.push("At least one bounded Apple notary credential signal must be set.");
  }
  if (readEnv("GROOVEFORGE_NOTARY_SUBMIT") !== "1") {
    blockers.push("GROOVEFORGE_NOTARY_SUBMIT=1 is required only when the operator is ready to submit.");
  }
  if (readEnv("GROOVEFORGE_DISTRIBUTION_QA_APPROVED") !== "1") {
    blockers.push("GROOVEFORGE_DISTRIBUTION_QA_APPROVED=1 is required after manual channel QA.");
  }
  if (!/^[a-f0-9]{64}$/.test(readEnv("GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256"))) {
    blockers.push("GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256 must match the current distribution manual QA checklist SHA-256.");
  }
  return unique(blockers);
}

function formatGroupRows(groups) {
  return groups
    .map((item) => `| ${item.label} | ${item.covered ? "yes" : "no"} | ${item.requiredKeys.join(", ")} |`)
    .join("\n");
}

function formatList(values) {
  return values.length > 0 ? values.join(", ") : "none";
}

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} Distribution Env Template

## Status

- Template keys covered: ${summary.templateKeysCovered ? "yes" : "no"}
- Local env file present: ${summary.localEnvFilePresent ? "yes" : "no"}
- Local env ready: ${summary.localEnvReady ? "yes" : "no"}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Notary submission attempted: no

## Template

- Template path: ${summary.templatePath}
- Default local env file: ${summary.defaultLocalEnvFile}
- Override key: ${summary.configuredFileKey}
- Placeholder values rejected: yes

## Required Key Coverage

| group | covered | required keys |
|---|---:|---|
${formatGroupRows(summary.requiredKeyGroups)}

## Local Env Input

- Files checked: ${formatList(summary.localEnvInput.filesChecked)}
- Present files: ${formatList(summary.localEnvInput.presentFiles)}
- Loaded keys: ${formatList(summary.localEnvInput.loadedKeys)}
- Existing exported keys kept: ${formatList(summary.localEnvInput.skippedExistingKeys)}
- Placeholder keys skipped: ${formatList(summary.localEnvInput.placeholderKeys)}
- Unknown keys skipped: ${formatList(summary.localEnvInput.unknownKeys)}
- Malformed lines: ${formatList(summary.localEnvInput.malformedLines)}

## Next Local Commands

1. npm run desktop:distribution-env-template-smoke
2. npm run desktop:distribution-private-inputs-smoke
3. npm run release:check

## Local Env Blockers

${formatBlockers(summary.localEnvBlockers)}

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, private beats, and real user audio are not recorded.

## Not Claimed

This local distribution env template smoke does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, release upload, notary submission, or external distribution-channel QA.
`;
}

const localEnvInput = await loadDistributionLocalEnv({ root, allowedKeys: allPrivateKeys });
const templateText = existsSync(templatePath) ? await readFile(templatePath, "utf8") : "";
const templateEntries = parseTemplateEntries(templateText);
const templateKeys = new Set(templateEntries.map((entry) => entry.key));
const requiredKeyGroups = [
  group("Distribution metadata", distributionMetadataKeys, templateKeys),
  group("Update feed URL", updateFeedUrlKeys, templateKeys),
  group("Update channel", updateChannelKeys, templateKeys),
  group("Developer ID signing identity", signingKeys, templateKeys),
  group("Notarization credentials", notarizationKeys, templateKeys)
];
const missingTemplateKeys = allPrivateKeys.filter((key) => !templateKeys.has(key));
const nonPlaceholderTemplateKeys = templateEntries
  .filter((entry) => !isPlaceholderValue(entry.value))
  .map((entry) => entry.key);
const blockers = localEnvBlockers(localEnvInput);
const templateKeysCovered = missingTemplateKeys.length === 0;
const summary = {
  appName,
  bundleId,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  templatePath: relative(templatePath),
  defaultLocalEnvFile: distributionLocalEnvDefaults.defaultEnvFileName,
  localEnvPath: relative(localEnvPath),
  configuredFileKey: distributionLocalEnvDefaults.configuredFileKey,
  envTemplateMarkdownPath: relative(envTemplateMarkdownPath),
  envTemplateJsonPath: relative(envTemplateJsonPath),
  distributionEnvTemplateReady: templateKeysCovered && nonPlaceholderTemplateKeys.length === 0,
  templateExists: existsSync(templatePath),
  templateMentionsDefaultLocalEnv: templateText.includes(distributionLocalEnvDefaults.defaultEnvFileName),
  templateMentionsConfiguredFileKey: templateText.includes(distributionLocalEnvDefaults.configuredFileKey),
  templateKeysCovered,
  missingTemplateKeys,
  nonPlaceholderTemplateKeys,
  requiredKeyGroups,
  localEnvFilePresent: existsSync(localEnvPath) || localEnvInput.enabled,
  localEnvReady: blockers.length === 0,
  localEnvInput,
  localEnvBlockers: blockers,
  valueRecorded: false,
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
  notarySubmissionAttempted: false,
  signingAttempted: false,
  releaseGateClaimedDeveloperIdSigning: false,
  releaseGateClaimedNotarization: false,
  releaseGateClaimedGatekeeperApproval: false,
  releaseGateClaimedAutoUpdate: false,
  releaseGateClaimedExternalDistribution: false
};
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(envTemplateJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(envTemplateMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "distribution env template should identify GrooveForge");
check(summary.bundleId === bundleId, `distribution env template should identify ${bundleId}`);
check(summary.version === packageJson.version, "distribution env template should match package version");
check(summary.templateExists === true, "distribution env template file should exist");
check(summary.templateMentionsDefaultLocalEnv === true, "distribution env template should mention .env.distribution.local");
check(summary.templateMentionsConfiguredFileKey === true, "distribution env template should mention GROOVEFORGE_DISTRIBUTION_ENV_FILE");
check(summary.templateKeysCovered === true, "distribution env template should cover every required private key");
check(summary.distributionEnvTemplateReady === true, "distribution env template should be placeholder-only and complete");
check(summary.valueRecorded === false, "distribution env template should not record values");
check(summary.privateValuesRecorded === false, "distribution env template should not record private values");
check(summary.releaseUrlValueRecorded === false, "distribution env template should not record release URL values");
check(summary.supportUrlValueRecorded === false, "distribution env template should not record support URL values");
check(summary.feedValueRecorded === false, "distribution env template should not record feed values");
check(summary.credentialValueRecorded === false, "distribution env template should not record credential values");
check(summary.tokenValueRecorded === false, "distribution env template should not record token values");
check(summary.channelValueRecorded === false, "distribution env template should not record channel values");
check(summary.developerIdIdentityValueRecorded === false, "distribution env template should not record Developer ID identity values");
check(summary.networkProbeAttempted === false, "distribution env template smoke should not probe remote channels");
check(summary.releaseUploadAttempted === false, "distribution env template smoke should not upload release artifacts");
check(summary.notarySubmissionAttempted === false, "distribution env template smoke should not submit to Apple notary services");
check(summary.signingAttempted === false, "distribution env template smoke should not sign artifacts");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "distribution env template smoke should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "distribution env template smoke should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "distribution env template smoke should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "distribution env template smoke should not claim auto-update");
check(summary.releaseGateClaimedExternalDistribution === false, "distribution env template smoke should not claim external distribution completion");
check(!/https?:\/\//i.test(templateText), "distribution env template should not include public or private URL values");
check(!/https?:\/\//i.test(markdown), "distribution env template report should not include public or private URL values");
check(markdown.includes("Template keys covered:"), "distribution env template report should include template coverage");
check(markdown.includes("Local env file present:"), "distribution env template report should include local env presence");
check(markdown.includes("Local env ready:"), "distribution env template report should include local env readiness");
check(markdown.includes("Private values recorded: no"), "distribution env template report should state value redaction");
check(markdown.includes("Placeholder values rejected: yes"), "distribution env template report should state placeholder rejection");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of privateEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "distribution env template should not include private environment values");
}

if (failures.length > 0) {
  fail("Distribution env template validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge distribution env template smoke passed.");
console.log(`- Markdown: ${relative(envTemplateMarkdownPath)}`);
console.log(`- JSON: ${relative(envTemplateJsonPath)}`);
console.log(`- Template keys covered: ${summary.templateKeysCovered ? "yes" : "no"}`);
console.log(`- Local env file present: ${summary.localEnvFilePresent ? "yes" : "no"}`);
console.log(`- Local env ready: ${summary.localEnvReady ? "yes" : "no"}`);
console.log("- Private values recorded: no");
if (summary.localEnvBlockers.length > 0) {
  console.log(`- Local env blockers: ${summary.localEnvBlockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe, release upload, or Apple notary submission attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, private beats, or real user audio");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
