#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionLocalEnvDefaults, distributionPrivateInputKeys } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const templateRelativePath = "harness/templates/distribution-private-inputs.env.example";
const templatePath = path.join(root, ...templateRelativePath.split("/"));
const localEnvFileName = ".env.distribution.local";
const localEnvPath = path.join(root, localEnvFileName);
const manualQaPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-manual-qa.json`);
const scaffoldPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-prepare-env.scaffold`);
const prepareEnvMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-prepare-env.md`);
const prepareEnvJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-prepare-env.json`);
const args = process.argv.slice(2);
const writeLocalSmoke = args.includes("--write-local-smoke");
const writeLocal = args.includes("--write-local") || writeLocalSmoke;
const force = args.includes("--force");
const failures = [];
const placeholderPattern = /^(|<[^>]+>|CHANGE_ME|REPLACE_ME|TODO|TBD|example|example-.+|your-.+|https:\/\/example\.com.*)$/i;
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release prepare env failed:");
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
  const value = withoutExport.slice(separatorIndex + 1).trim();
  if (!/^[A-Z0-9_]+$/.test(key)) {
    return null;
  }
  return { key, value };
}

function normalizedEnvValue(value) {
  const trimmed = String(value ?? "").trim();
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function isPlaceholderValue(value) {
  return placeholderPattern.test(normalizedEnvValue(value));
}

function parseTemplateEntries(templateText) {
  return templateText
    .split(/\r?\n/)
    .map(parseEnvLine)
    .filter(Boolean);
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

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function displayLocalEnvTarget(filePath) {
  const relativePath = path.relative(root, filePath);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.basename(filePath);
}

function localEnvCandidatePaths() {
  const configuredPath = process.env[distributionLocalEnvDefaults.configuredFileKey]?.trim();
  if (configuredPath) {
    return [path.isAbsolute(configuredPath) ? configuredPath : path.resolve(root, configuredPath)];
  }
  return [localEnvPath];
}

async function readExistingLocalEnvPlaceholderAudit(files = localEnvCandidatePaths()) {
  const filesChecked = [...new Set(files)];
  const placeholderKeys = [];
  const placeholderEditLocations = [];
  const presentFiles = [];

  for (const filePath of filesChecked) {
    if (!existsSync(filePath)) {
      continue;
    }
    const displayFile = displayLocalEnvTarget(filePath);
    presentFiles.push(displayFile);
    const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      const parsed = parseEnvLine(line);
      if (!parsed || !distributionPrivateInputKeys.includes(parsed.key) || !isPlaceholderValue(parsed.value)) {
        continue;
      }
      placeholderKeys.push(parsed.key);
      placeholderEditLocations.push({
        key: parsed.key,
        file: displayFile,
        line: index + 1,
        placeholder: true,
        valueRecorded: false
      });
    }
  }

  const uniquePlaceholderKeys = unique(placeholderKeys);
  const releaseChannelPlaceholderKeys = releaseChannelMetadataKeys.filter((key) => uniquePlaceholderKeys.includes(key));
  const releaseChannelPlaceholderEditLocations = placeholderEditLocations.filter((item) => releaseChannelMetadataKeys.includes(item.key));

  return {
    existingLocalEnvFilesChecked: filesChecked.map(displayLocalEnvTarget),
    existingLocalEnvPresentFiles: unique(presentFiles),
    existingLocalEnvFileLoaded: presentFiles.length > 0,
    existingLocalEnvPlaceholderKeyCount: uniquePlaceholderKeys.length,
    existingLocalEnvPlaceholderKeySummary: uniquePlaceholderKeys.length > 0 ? uniquePlaceholderKeys.join(", ") : "none",
    existingLocalEnvPlaceholderKeys: uniquePlaceholderKeys,
    existingLocalEnvPlaceholderEditLocationCount: placeholderEditLocations.length,
    existingLocalEnvPlaceholderEditLocationSummary: formatLocationSummary(placeholderEditLocations),
    existingLocalEnvPlaceholderEditLocations: placeholderEditLocations,
    existingReleaseChannelPlaceholderKeyCount: releaseChannelPlaceholderKeys.length,
    existingReleaseChannelPlaceholderKeySummary: releaseChannelPlaceholderKeys.length > 0 ? releaseChannelPlaceholderKeys.join(", ") : "none",
    existingReleaseChannelPlaceholderKeys: releaseChannelPlaceholderKeys,
    existingReleaseChannelPlaceholderEditLocationCount: releaseChannelPlaceholderEditLocations.length,
    existingReleaseChannelPlaceholderEditLocationSummary: formatLocationSummary(releaseChannelPlaceholderEditLocations),
    existingReleaseChannelPlaceholderEditLocations: releaseChannelPlaceholderEditLocations,
    existingLocalEnvValueRecorded: false
  };
}

function validDigest(value) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

const scaffoldGuidanceSections = [
  {
    id: "distribution-channel",
    label: "Distribution channel and public metadata",
    beforeKey: "GROOVEFORGE_DISTRIBUTION_CHANNEL",
    lines: [
      "Choose exactly one distribution channel: direct-download, private-beta, or managed-release.",
      "Fill the release download, release notes, and support URL keys with safe public HTTPS URLs before channel QA."
    ]
  },
  {
    id: "manual-qa-approval",
    label: "Manual QA approval",
    beforeKey: "GROOVEFORGE_DISTRIBUTION_QA_APPROVED",
    lines: [
      "Leave GROOVEFORGE_DISTRIBUTION_QA_APPROVED=0 until signed, notarized, Gatekeeper-accepted, update-channel QA is complete.",
      "The checklist SHA-256 is filled automatically when current manual QA evidence exists; otherwise keep the placeholder until the checklist is generated."
    ]
  },
  {
    id: "auto-update-feed",
    label: "Auto-update feed and channel",
    beforeKey: "GROOVEFORGE_UPDATE_FEED_URL",
    lines: [
      "Configure one update feed URL key and one matching channel key for the selected provider.",
      "Fallback ELECTRON_* and UPDATE_* keys are compatibility alternatives; unused alternatives can stay placeholders until selected."
    ]
  },
  {
    id: "developer-id",
    label: "Developer ID signing identity",
    beforeKey: "GROOVEFORGE_DEVELOPER_ID_IDENTITY",
    lines: [
      "Set this to a local Developer ID Application identity label or SHA-1 fingerprint from the signing keychain.",
      "Do not paste private certificates, passwords, or exported key material into this file."
    ]
  },
  {
    id: "notarization",
    label: "Apple notarization credentials",
    beforeKey: "GROOVEFORGE_NOTARY_SUBMIT",
    lines: [
      "Keep GROOVEFORGE_NOTARY_SUBMIT=0 until Developer ID signing and a bounded notary credential method are ready.",
      "Use one credential method: Apple ID app-specific password, App Store Connect API key, or notarytool keychain profile."
    ]
  }
];

function renderScaffold(entries, manualQaDigest) {
  const sectionsByKey = new Map(scaffoldGuidanceSections.map((section) => [section.beforeKey, section]));
  const lines = [
    "# GrooveForge local distribution env scaffold.",
    "# Generated by npm run release:prepare-env.",
    "# This file is ignored by git. Replace placeholders locally and never commit real values.",
    "# Rerun npm run release:doctor after editing; when source release evidence exists, npm run release:current-blocker refreshes the current receipt.",
    "# Continue with npm run release:external-preflight after current blockers are clear.",
    "# Run npm run release:external-check only when every preflight blocker is cleared.",
    ""
  ];

  for (const entry of entries) {
    const section = sectionsByKey.get(entry.key);
    if (section) {
      lines.push(`# ${section.label}`);
      for (const guidanceLine of section.lines) {
        lines.push(`# ${guidanceLine}`);
      }
    }
    if (entry.key === "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256" && validDigest(manualQaDigest)) {
      lines.push(`${entry.key}=${manualQaDigest}`);
      lines.push("");
      continue;
    }
    lines.push(`${entry.key}=${entry.value}`);
    if (entry.key === "GROOVEFORGE_SUPPORT_URL" || entry.key === "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256" || entry.key === "UPDATE_CHANNEL" || entry.key === "GROOVEFORGE_DEVELOPER_ID_IDENTITY") {
      lines.push("");
    }
  }

  if (lines.at(-1) !== "") {
    lines.push("");
  }
  lines.push("# Rerun sequence after editing local values:");
  lines.push("# 1. npm run release:doctor");
  lines.push("# 2. npm run release:external-preflight");
  lines.push("# 3. npm run release:external-check");
  lines.push("");
  return lines.join("\n");
}

function formatKeyRows(keys, appliedDigestKey) {
  return keys
    .map((key) => {
      const valueSource = key === appliedDigestKey ? "current manual QA checklist digest" : "operator private input";
      return `| ${key} | ${valueSource} |`;
    })
    .join("\n");
}

function formatBlockers(blockers) {
  if (!Array.isArray(blockers) || blockers.length === 0) {
    return "- None.";
  }
  return blockers.map((blocker) => `- ${blocker}`).join("\n");
}

function formatKeyList(keys) {
  if (!Array.isArray(keys) || keys.length === 0) {
    return "- None.";
  }
  return keys.map((key) => `- ${key}`).join("\n");
}

function formatLocationSummary(locations) {
  if (!Array.isArray(locations) || locations.length === 0) {
    return "none";
  }
  return locations.map((item) => `${item.file}:${item.line} ${item.key}`).join(", ");
}

function formatLocationRows(locations) {
  if (!Array.isArray(locations) || locations.length === 0) {
    return "| none | none | none | none |";
  }
  return locations
    .map((item) => `| ${item.file} | ${item.line} | ${item.key} | ${item.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} Release Prepare Env

## Status

- Prepare env report ready: ${summary.releasePrepareEnvReady ? "yes" : "no"}
- Scaffold written: ${summary.scaffoldWritten ? "yes" : "no"}
- Write smoke: ${summary.writeLocalSmoke ? "yes" : "no"}
- Local env write requested: ${summary.localEnvWriteRequested ? "yes" : "no"}
- Local env written: ${summary.localEnvWritten ? "yes" : "no"}
- Local env already exists: ${summary.localEnvAlreadyExists ? "yes" : "no"}
- Local env write target: ${summary.localEnvWriteTarget}
- Local env write target is real root: ${summary.localEnvWriteTargetIsRealRoot ? "yes" : "no"}
- Real root local env modified: ${summary.realRootLocalEnvModified ? "yes" : "no"}
- Force overwrite requested: ${summary.forceOverwrite ? "yes" : "no"}
- Manual QA checklist digest available: ${summary.manualQaChecklistDigestAvailable ? "yes" : "no"}
- Manual QA checklist digest applied: ${summary.manualQaChecklistDigestApplied ? "yes" : "no"}
- Existing local env file loaded: ${summary.existingLocalEnvFileLoaded ? "yes" : "no"}
- Existing local env placeholder keys: ${summary.existingLocalEnvPlaceholderKeyCount} (${summary.existingLocalEnvPlaceholderKeySummary})
- Existing release-channel placeholder keys: ${summary.existingReleaseChannelPlaceholderKeyCount} (${summary.existingReleaseChannelPlaceholderKeySummary})
- Existing release-channel placeholder edit locations: ${summary.existingReleaseChannelPlaceholderEditLocationCount} (${summary.existingReleaseChannelPlaceholderEditLocationSummary})
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no

## Commands

- Smoke command: \`${summary.smokeCommand}\`
- Write smoke command: \`${summary.writeSmokeCommand}\`
- Prepare local env command: \`${summary.prepareLocalEnvCommand}\`
- Force overwrite command: \`${summary.forceOverwriteCommand}\`
- Doctor command: \`${summary.doctorCommand}\`
- Hard external distribution gate: \`${summary.hardExternalGateCommand}\`

## Paths

- Template path: ${summary.templatePath}
- Build scaffold path: ${summary.scaffoldPath}
- Local env path: ${summary.localEnvPath}
- Local env write target: ${summary.localEnvWriteTarget}
- Smoke local env directory: ${summary.smokeLocalEnvDirectory}
- Real root local env path: ${summary.realRootLocalEnvPath}
- Manual QA evidence path: ${summary.manualQaPath}

## Scaffold Keys

| key | value source |
|---|---|
${formatKeyRows(summary.scaffoldKeys, summary.manualQaChecklistDigestApplied ? "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256" : null)}

## Local Env Write Blockers

${formatBlockers(summary.localEnvWriteBlockers)}

## Existing Local Env Placeholder Audit

- Files checked: ${summary.existingLocalEnvFilesChecked.join(", ") || "none"}
- Present files: ${summary.existingLocalEnvPresentFiles.join(", ") || "none"}
- Placeholder keys: ${summary.existingLocalEnvPlaceholderKeyCount} (${summary.existingLocalEnvPlaceholderKeySummary})
- Release-channel placeholder keys: ${summary.existingReleaseChannelPlaceholderKeyCount} (${summary.existingReleaseChannelPlaceholderKeySummary})
- Release-channel placeholder edit locations: ${summary.existingReleaseChannelPlaceholderEditLocationCount} (${summary.existingReleaseChannelPlaceholderEditLocationSummary})
- Value recorded: ${summary.existingLocalEnvValueRecorded ? "yes" : "no"}

### Existing Placeholder Keys

${formatKeyList(summary.existingLocalEnvPlaceholderKeys)}

### Existing Release-Channel Placeholder Edit Locations

| file | line | key | value recorded |
|---|---:|---|---:|
${formatLocationRows(summary.existingReleaseChannelPlaceholderEditLocations)}

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, local env values, private beats, and real user audio are not recorded.

## Not Claimed

This command does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

const templateText = await readFile(templatePath, "utf8");
const templateEntries = parseTemplateEntries(templateText);
const templateKeys = templateEntries.map((entry) => entry.key);
const missingTemplateKeys = distributionPrivateInputKeys.filter((key) => !templateKeys.includes(key));
const extraTemplateKeys = templateKeys.filter((key) => !distributionPrivateInputKeys.includes(key));
const manualQa = await readJsonIfExists(manualQaPath);
const manualQaDigest = manualQa?.manualQaChecklistSha256;
const manualQaChecklistDigestAvailable = validDigest(manualQaDigest);
const scaffold = renderScaffold(templateEntries, manualQaDigest);
const smokeLocalEnvDirectory = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-prepare-env-write-smoke`);
const smokeLocalEnvPath = path.join(smokeLocalEnvDirectory, localEnvFileName);
const localEnvWritePath = writeLocalSmoke ? smokeLocalEnvPath : localEnvPath;
const localEnvAlreadyExists = existsSync(localEnvWritePath);
const realRootLocalEnvContentBefore = existsSync(localEnvPath) ? await readFile(localEnvPath, "utf8") : null;
const localEnvWriteBlockers = [];
let localEnvWritten = false;

if (writeLocal && localEnvAlreadyExists && !force && !writeLocalSmoke) {
  localEnvWriteBlockers.push(`${displayLocalEnvTarget(localEnvWritePath)} already exists; rerun with --force only when you intentionally want to replace it.`);
}

await mkdir(packageRoot, { recursive: true });
await writeFile(scaffoldPath, scaffold, "utf8");

if (writeLocal && localEnvWriteBlockers.length === 0) {
  await mkdir(path.dirname(localEnvWritePath), { recursive: true });
  await writeFile(localEnvWritePath, scaffold, "utf8");
  localEnvWritten = true;
}

const realRootLocalEnvContentAfter = existsSync(localEnvPath) ? await readFile(localEnvPath, "utf8") : null;
const existingLocalEnvPlaceholderAudit = await readExistingLocalEnvPlaceholderAudit(writeLocalSmoke ? [localEnvWritePath] : localEnvCandidatePaths());

const releasePrepareEnvReport = {
  appName,
  bundleId,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  smokeCommand: "npm run release:prepare-env-smoke",
  writeSmokeCommand: "npm run release:prepare-env-write-smoke",
  prepareLocalEnvCommand: "npm run release:prepare-env",
  forceOverwriteCommand: "npm run release:prepare-env -- --force",
  doctorCommand: "npm run release:doctor",
  hardExternalGateCommand: "npm run release:external-check",
  templatePath: relative(templatePath),
  scaffoldPath: relative(scaffoldPath),
  localEnvPath: relative(localEnvPath),
  manualQaPath: relative(manualQaPath),
  releasePrepareEnvMarkdownPath: relative(prepareEnvMarkdownPath),
  releasePrepareEnvJsonPath: relative(prepareEnvJsonPath),
  templateKeyCount: templateKeys.length,
  templateKeys,
  missingTemplateKeys,
  extraTemplateKeys,
  scaffoldKeyCount: templateKeys.length,
  scaffoldKeys: templateKeys,
  scaffoldGuidanceSectionCount: scaffoldGuidanceSections.length,
  scaffoldGuidanceSections: scaffoldGuidanceSections.map(({ id, label, beforeKey }) => ({ id, label, beforeKey })),
  scaffoldWritten: true,
  writeLocalSmoke,
  localEnvWriteRequested: writeLocal,
  localEnvWriteAttempted: writeLocal && localEnvWriteBlockers.length === 0,
  localEnvWritten,
  localEnvAlreadyExists,
  localEnvWriteTarget: relative(localEnvWritePath),
  localEnvWriteTargetIsRealRoot: path.resolve(localEnvWritePath) === path.resolve(localEnvPath),
  smokeLocalEnvDirectory: writeLocalSmoke ? relative(smokeLocalEnvDirectory) : "none",
  realRootLocalEnvPath: relative(localEnvPath),
  realRootLocalEnvPresentBefore: realRootLocalEnvContentBefore !== null,
  realRootLocalEnvPresentAfter: realRootLocalEnvContentAfter !== null,
  realRootLocalEnvModified: realRootLocalEnvContentBefore !== realRootLocalEnvContentAfter,
  forceOverwrite: force,
  localEnvWriteBlockers,
  ...existingLocalEnvPlaceholderAudit,
  manualQaChecklistDigestAvailable,
  manualQaChecklistDigestApplied: manualQaChecklistDigestAvailable,
  privateValuesRecorded: false,
  localEnvValueRecorded: false,
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
  releaseGateClaimedManualQaApproval: false,
  releaseGateClaimedExternalDistribution: false
};

releasePrepareEnvReport.releasePrepareEnvReady =
  releasePrepareEnvReport.scaffoldWritten === true &&
  releasePrepareEnvReport.missingTemplateKeys.length === 0 &&
  releasePrepareEnvReport.extraTemplateKeys.length === 0 &&
  releasePrepareEnvReport.privateValuesRecorded === false &&
  releasePrepareEnvReport.releaseGateClaimedExternalDistribution === false;

const markdown = buildMarkdown(releasePrepareEnvReport);
const serializedReport = `${JSON.stringify(releasePrepareEnvReport, null, 2)}\n`;

await writeFile(prepareEnvJsonPath, serializedReport, "utf8");
await writeFile(prepareEnvMarkdownPath, markdown, "utf8");

check(releasePrepareEnvReport.appName === appName, "release prepare env should identify GrooveForge");
check(releasePrepareEnvReport.bundleId === bundleId, `release prepare env should identify ${bundleId}`);
check(releasePrepareEnvReport.releasePrepareEnvReady === true, "release prepare env report should be ready");
check(releasePrepareEnvReport.templateKeys.length === distributionPrivateInputKeys.length, "release prepare env should read every private input template key");
check(releasePrepareEnvReport.missingTemplateKeys.length === 0, `release prepare env template is missing keys: ${releasePrepareEnvReport.missingTemplateKeys.join(", ")}`);
check(releasePrepareEnvReport.extraTemplateKeys.length === 0, `release prepare env template has unexpected keys: ${releasePrepareEnvReport.extraTemplateKeys.join(", ")}`);
check(releasePrepareEnvReport.scaffoldWritten === true, "release prepare env should write the build scaffold");
check(releasePrepareEnvReport.writeSmokeCommand === "npm run release:prepare-env-write-smoke", "release prepare env should include the write smoke command");
check(typeof releasePrepareEnvReport.writeLocalSmoke === "boolean", "release prepare env should report write-smoke mode");
check(typeof releasePrepareEnvReport.localEnvWriteTarget === "string", "release prepare env should report the local env write target");
check(typeof releasePrepareEnvReport.localEnvWriteTargetIsRealRoot === "boolean", "release prepare env should report whether the write target is the real root env");
check(typeof releasePrepareEnvReport.realRootLocalEnvModified === "boolean", "release prepare env should report whether the real root env changed");
check(releasePrepareEnvReport.scaffoldGuidanceSectionCount === 5, "release prepare env should include guided scaffold sections");
check(Array.isArray(releasePrepareEnvReport.existingLocalEnvFilesChecked), "release prepare env should include existing local env files checked");
check(Array.isArray(releasePrepareEnvReport.existingLocalEnvPresentFiles), "release prepare env should include existing local env present files");
check(typeof releasePrepareEnvReport.existingLocalEnvFileLoaded === "boolean", "release prepare env should include existing local env loaded status");
check(Number.isInteger(releasePrepareEnvReport.existingLocalEnvPlaceholderKeyCount), "release prepare env should include existing local env placeholder key count");
check(typeof releasePrepareEnvReport.existingLocalEnvPlaceholderKeySummary === "string", "release prepare env should include existing local env placeholder key summary");
check(Array.isArray(releasePrepareEnvReport.existingLocalEnvPlaceholderKeys), "release prepare env should include existing local env placeholder keys");
check(
  releasePrepareEnvReport.existingLocalEnvPlaceholderKeyCount === releasePrepareEnvReport.existingLocalEnvPlaceholderKeys.length,
  "release prepare env existing placeholder key count should match listed keys"
);
check(Number.isInteger(releasePrepareEnvReport.existingLocalEnvPlaceholderEditLocationCount), "release prepare env should include existing local env placeholder edit location count");
check(typeof releasePrepareEnvReport.existingLocalEnvPlaceholderEditLocationSummary === "string", "release prepare env should include existing local env placeholder edit location summary");
check(Array.isArray(releasePrepareEnvReport.existingLocalEnvPlaceholderEditLocations), "release prepare env should include existing local env placeholder edit locations");
check(Number.isInteger(releasePrepareEnvReport.existingReleaseChannelPlaceholderKeyCount), "release prepare env should include release-channel placeholder key count");
check(typeof releasePrepareEnvReport.existingReleaseChannelPlaceholderKeySummary === "string", "release prepare env should include release-channel placeholder key summary");
check(Array.isArray(releasePrepareEnvReport.existingReleaseChannelPlaceholderKeys), "release prepare env should include release-channel placeholder keys");
check(
  releasePrepareEnvReport.existingReleaseChannelPlaceholderKeyCount === releasePrepareEnvReport.existingReleaseChannelPlaceholderKeys.length,
  "release prepare env release-channel placeholder key count should match listed keys"
);
check(Number.isInteger(releasePrepareEnvReport.existingReleaseChannelPlaceholderEditLocationCount), "release prepare env should include release-channel placeholder edit location count");
check(
  typeof releasePrepareEnvReport.existingReleaseChannelPlaceholderEditLocationSummary === "string",
  "release prepare env should include release-channel placeholder edit location summary"
);
check(Array.isArray(releasePrepareEnvReport.existingReleaseChannelPlaceholderEditLocations), "release prepare env should include release-channel placeholder edit locations");
check(
  releasePrepareEnvReport.existingReleaseChannelPlaceholderEditLocations.every(
    (item) =>
      releaseChannelMetadataKeys.includes(item.key) &&
      typeof item.file === "string" &&
      item.file.length > 0 &&
      Number.isInteger(item.line) &&
      item.line > 0 &&
      item.placeholder === true &&
      item.valueRecorded === false
  ),
  "release prepare env release-channel placeholder edit locations should include only value-free file, line, and key rows"
);
check(releasePrepareEnvReport.existingLocalEnvValueRecorded === false, "release prepare env existing local env audit should not record values");
check(scaffold.includes("GROOVEFORGE_DISTRIBUTION_CHANNEL="), "release prepare env scaffold should include channel key");
check(scaffold.includes("GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256="), "release prepare env scaffold should include manual QA digest key");
check(scaffold.includes("# Distribution channel and public metadata"), "release prepare env scaffold should guide distribution metadata");
check(scaffold.includes("# Manual QA approval"), "release prepare env scaffold should guide manual QA approval");
check(scaffold.includes("# Auto-update feed and channel"), "release prepare env scaffold should guide update feed setup");
check(scaffold.includes("# Developer ID signing identity"), "release prepare env scaffold should guide Developer ID identity setup");
check(scaffold.includes("# Apple notarization credentials"), "release prepare env scaffold should guide notarization setup");
check(scaffold.includes("# 2. npm run release:external-preflight"), "release prepare env scaffold should include the preflight rerun command");
check(scaffold.includes("npm run release:current-blocker"), "release prepare env scaffold should include the current blocker refresh command");
check(releasePrepareEnvReport.privateValuesRecorded === false, "release prepare env should not record private values");
check(releasePrepareEnvReport.localEnvValueRecorded === false, "release prepare env should not record local env values");
check(releasePrepareEnvReport.releaseUrlValueRecorded === false, "release prepare env should not record release URL values");
check(releasePrepareEnvReport.supportUrlValueRecorded === false, "release prepare env should not record support URL values");
check(releasePrepareEnvReport.feedValueRecorded === false, "release prepare env should not record feed values");
check(releasePrepareEnvReport.credentialValueRecorded === false, "release prepare env should not record credential values");
check(releasePrepareEnvReport.tokenValueRecorded === false, "release prepare env should not record token values");
check(releasePrepareEnvReport.channelValueRecorded === false, "release prepare env should not record channel values");
check(releasePrepareEnvReport.developerIdIdentityValueRecorded === false, "release prepare env should not record Developer ID identity values");
check(releasePrepareEnvReport.networkProbeAttempted === false, "release prepare env should not probe remote channels");
check(releasePrepareEnvReport.releaseUploadAttempted === false, "release prepare env should not upload releases");
check(releasePrepareEnvReport.notarySubmissionAttempted === false, "release prepare env should not submit to Apple notary services");
check(releasePrepareEnvReport.signingAttempted === false, "release prepare env should not sign artifacts");
check(releasePrepareEnvReport.releaseGateClaimedExternalDistribution === false, "release prepare env should not claim external distribution completion");
if (writeLocalSmoke) {
  check(releasePrepareEnvReport.localEnvWriteRequested === true, "release prepare env write smoke should request local env writing");
  check(releasePrepareEnvReport.localEnvWriteAttempted === true, "release prepare env write smoke should attempt local env writing");
  check(releasePrepareEnvReport.localEnvWritten === true, "release prepare env write smoke should write the smoke local env target");
  check(releasePrepareEnvReport.localEnvWriteTargetIsRealRoot === false, "release prepare env write smoke should not target the real root local env file");
  check(releasePrepareEnvReport.realRootLocalEnvModified === false, "release prepare env write smoke should not modify the real root local env file");
  check(releasePrepareEnvReport.existingLocalEnvFileLoaded === true, "release prepare env write smoke should audit the written smoke local env target");
  check(
    releasePrepareEnvReport.existingReleaseChannelPlaceholderKeyCount === releaseChannelMetadataKeys.length,
    "release prepare env write smoke should report all release-channel placeholders in the smoke target"
  );
}
check(markdown.includes("Release Prepare Env"), "release prepare env Markdown should include title");
check(markdown.includes("Prepare local env command: `npm run release:prepare-env`"), "release prepare env Markdown should include local env command");
check(markdown.includes("Write smoke command: `npm run release:prepare-env-write-smoke`"), "release prepare env Markdown should include write smoke command");
check(markdown.includes("Hard external distribution gate: `npm run release:external-check`"), "release prepare env Markdown should include hard gate command");
check(markdown.includes("Local env write target:"), "release prepare env Markdown should include local env write target");
check(markdown.includes("Real root local env modified:"), "release prepare env Markdown should include real root modification status");
check(markdown.includes("Existing local env placeholder keys:"), "release prepare env Markdown should include existing local env placeholder key status");
check(markdown.includes("Existing release-channel placeholder keys:"), "release prepare env Markdown should include release-channel placeholder key status");
check(markdown.includes("## Existing Local Env Placeholder Audit"), "release prepare env Markdown should include existing local env placeholder audit section");
check(markdown.includes("Existing Release-Channel Placeholder Edit Locations"), "release prepare env Markdown should include release-channel placeholder edit locations section");
check(!/https?:\/\//i.test(markdown), "release prepare env Markdown should not include public or private URL values");
check(!/https?:\/\//i.test(serializedReport), "release prepare env JSON should not include public or private URL values");

for (const key of distributionPrivateInputKeys) {
  const value = process.env[key]?.trim();
  if (value && value.length >= 8) {
    check(!serializedReport.includes(value), "release prepare env JSON should not include private environment values");
    check(!markdown.includes(value), "release prepare env Markdown should not include private environment values");
  }
}

if (failures.length > 0) {
  fail("Release prepare env validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge release prepare env passed.");
console.log(`- Markdown: ${relative(prepareEnvMarkdownPath)}`);
console.log(`- JSON: ${relative(prepareEnvJsonPath)}`);
console.log(`- Build scaffold: ${relative(scaffoldPath)}`);
console.log(`- Write smoke: ${releasePrepareEnvReport.writeLocalSmoke ? "yes" : "no"}`);
console.log(`- Local env write requested: ${releasePrepareEnvReport.localEnvWriteRequested ? "yes" : "no"}`);
console.log(`- Local env written: ${releasePrepareEnvReport.localEnvWritten ? "yes" : "no"}`);
console.log(`- Local env write target: ${releasePrepareEnvReport.localEnvWriteTarget}`);
console.log(`- Local env write target is real root: ${releasePrepareEnvReport.localEnvWriteTargetIsRealRoot ? "yes" : "no"}`);
console.log(`- Real root local env modified: ${releasePrepareEnvReport.realRootLocalEnvModified ? "yes" : "no"}`);
console.log(`- Manual QA checklist digest available: ${releasePrepareEnvReport.manualQaChecklistDigestAvailable ? "yes" : "no"}`);
console.log(`- Manual QA checklist digest applied: ${releasePrepareEnvReport.manualQaChecklistDigestApplied ? "yes" : "no"}`);
console.log(`- Existing local env file loaded: ${releasePrepareEnvReport.existingLocalEnvFileLoaded ? "yes" : "no"}`);
console.log(`- Existing local env placeholder keys: ${releasePrepareEnvReport.existingLocalEnvPlaceholderKeyCount} (${releasePrepareEnvReport.existingLocalEnvPlaceholderKeySummary})`);
console.log(
  `- Existing release-channel placeholder keys: ${releasePrepareEnvReport.existingReleaseChannelPlaceholderKeyCount} (${releasePrepareEnvReport.existingReleaseChannelPlaceholderKeySummary})`
);
console.log(
  `- Existing release-channel placeholder edit locations: ${releasePrepareEnvReport.existingReleaseChannelPlaceholderEditLocationCount} (${releasePrepareEnvReport.existingReleaseChannelPlaceholderEditLocationSummary})`
);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
