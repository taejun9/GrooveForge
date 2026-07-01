#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionLocalEnvDefaults } from "./distribution_local_env.mjs";

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
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const recommendedPrivateEditOperatorProofCommand = "npm run release:private-edit-strict-proof";
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
const envKeyGuidance = {
  GROOVEFORGE_DISTRIBUTION_CHANNEL: "Choose exactly one allowed value: direct-download, private-beta, or managed-release.",
  GROOVEFORGE_RELEASE_DOWNLOAD_URL: "Use a safe absolute HTTPS URL with a hostname, no credentials, and no fragment.",
  GROOVEFORGE_RELEASE_NOTES_URL: "Use a safe absolute HTTPS URL with a hostname, no credentials, and no fragment.",
  GROOVEFORGE_SUPPORT_URL: "Use a safe absolute HTTPS URL with a hostname, no credentials, and no fragment.",
  GROOVEFORGE_UPDATE_FEED_URL:
    "Use a safe absolute HTTPS update-feed URL with a hostname, no credentials, and no fragment; keep fallback feed keys as placeholders unless selected.",
  ELECTRON_UPDATE_FEED_URL:
    "Use this compatibility fallback only when it is the selected update-feed key; it must be a safe absolute HTTPS URL with no credentials or fragment.",
  UPDATE_FEED_URL:
    "Use this compatibility fallback only when it is the selected update-feed key; it must be a safe absolute HTTPS URL with no credentials or fragment.",
  GROOVEFORGE_UPDATE_CHANNEL: "Use a 1-32 character lowercase update channel made from letters, numbers, dots, underscores, or hyphens.",
  ELECTRON_UPDATE_CHANNEL:
    "Use this compatibility fallback only when it is the selected update channel; it must match the same lowercase channel format.",
  UPDATE_CHANNEL:
    "Use this compatibility fallback only when it is the selected update channel; it must match the same lowercase channel format.",
  GROOVEFORGE_DEVELOPER_ID_IDENTITY:
    "Use an installed Developer ID Application identity label or SHA-1 fingerprint from the current macOS keychain search list.",
  GROOVEFORGE_NOTARY_SUBMIT: "Set to 1 only after Developer ID signing and one bounded notary credential signal are ready.",
  APPLE_ID: "Use only as part of the Apple ID notary credential set with Apple team ID and an app-specific password.",
  APPLE_TEAM_ID: "Use only as part of the Apple ID notary credential set with Apple ID and an app-specific password.",
  APPLE_APP_SPECIFIC_PASSWORD: "Use only as part of the Apple ID notary credential set; never commit or echo the password.",
  ASC_KEY_ID: "Use only as part of the App Store Connect API key credential set with issuer ID and key path.",
  ASC_ISSUER_ID: "Use only as part of the App Store Connect API key credential set with key ID and key path.",
  ASC_KEY_PATH: "Use a local path to the App Store Connect private key file; keep the key file outside committed files.",
  APPLE_NOTARY_PROFILE: "Use an existing notarytool keychain profile name as a bounded credential signal.",
  NOTARYTOOL_KEYCHAIN_PROFILE: "Use an existing notarytool keychain profile name as a bounded credential signal.",
  GROOVEFORGE_DISTRIBUTION_QA_APPROVED: "Set to 1 only after manual channel QA passes against the selected signed release artifact.",
  GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256:
    "Use the current distribution manual QA checklist SHA-256 digest and keep it paired with the approval signal."
};
const actionReadyCriteria = {
  "regenerate-local-release-evidence": [
    "The ignored source evidence artifacts exist after `npm run release:check`.",
    "`npm run release:next-actions` can run external preflight from existing redacted evidence."
  ],
  "release-channel-metadata": [
    "The current release-channel keys are present in the ignored local env file without placeholder values.",
    "Distribution private-inputs evidence marks release channel metadata ready without recording URL or channel values.",
    "Distribution-channel QA no longer reports channel, release download, release notes, or support URL blockers."
  ],
  "auto-update-feed": [
    "Update feed config evidence marks one safe feed URL key and one valid update channel key ready without recording values.",
    "Auto-update readiness evidence marks provider/feed/channel metadata ready.",
    "Signed and notarized update metadata artifacts are regenerated after Developer ID, notarization, and Gatekeeper evidence are ready."
  ],
  "developer-id-signing": [
    "Developer ID readiness finds a valid Developer ID Application identity in the current keychain search list.",
    "Developer ID signing smoke produces an isolated signed app copy with Developer ID authority and required runtime entitlements.",
    "Signing evidence remains value-free and does not mark notarization or external distribution complete."
  ],
  "notarization-stapling": [
    "A Developer ID signed isolated app copy is available for notarization.",
    "One bounded notary credential signal is present and the submit guard is intentionally enabled.",
    "Notarization smoke reports accepted notarization, stapling, and staple validation for the isolated artifact."
  ],
  "notarized-gatekeeper": [
    "A notarized and stapled isolated DMG is available for Gatekeeper assessment.",
    "Notarized Gatekeeper smoke reports acceptance for the selected DMG and mounted app.",
    "Gatekeeper evidence remains tied to the selected release artifact chain."
  ],
  "manual-channel-qa": [
    "The manual QA checklist is complete against the selected signed, notarized, Gatekeeper-accepted release artifact.",
    "The approval signal is set only after manual channel QA passes.",
    "The checklist digest matches the current distribution manual QA checklist evidence."
  ],
  "final-hard-gate": [
    "Every preceding remediation group is ready in redacted evidence.",
    "`npm run release:external-check` runs after `npm run release:check` and no longer fails the hard external distribution gate.",
    "External distribution readiness is claimed only by the hard gate after private inputs, signing, notarization, Gatekeeper, auto-update, and manual QA evidence are all ready."
  ],
  "run-hard-external-distribution-gate": [
    "`npm run release:external-check` is the next command.",
    "The hard external distribution gate passes without recording private values."
  ],
  "refresh-external-preflight-evidence": [
    "`npm run release:external-preflight` regenerates redacted operator-loop evidence.",
    "The refreshed evidence identifies the next pending priority action."
  ]
};

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

function displayLocalEnvTarget(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(root, filePath);
  const relativePath = path.relative(root, absolutePath);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.basename(absolutePath);
}

function firstArrayValue(values) {
  return Array.isArray(values) ? values.find((value) => typeof value === "string" && value.trim().length > 0) : "";
}

function currentLocalEnvEditTarget(evidence = {}) {
  const presentFile = firstArrayValue(evidence.localEnvPresentFiles);
  if (presentFile) {
    return displayLocalEnvTarget(presentFile);
  }
  const checkedFile = firstArrayValue(evidence.localEnvFilesChecked);
  if (checkedFile) {
    return displayLocalEnvTarget(checkedFile);
  }
  const configuredPath = process.env[distributionLocalEnvDefaults.configuredFileKey]?.trim();
  return displayLocalEnvTarget(configuredPath || distributionLocalEnvDefaults.defaultEnvFileName);
}

function localEnvCandidatePaths() {
  const paths = [path.join(root, distributionLocalEnvDefaults.defaultEnvFileName)];
  const configuredPath = process.env[distributionLocalEnvDefaults.configuredFileKey]?.trim();
  if (configuredPath) {
    paths.push(path.isAbsolute(configuredPath) ? configuredPath : path.resolve(root, configuredPath));
  }
  return [...new Set(paths)];
}

function parseEnvLineKey(line) {
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
  return /^[A-Z0-9_]+$/.test(key) ? key : null;
}

async function readLocalEnvKeyLocations(keys) {
  const keySet = new Set(Array.isArray(keys) ? keys : []);
  if (keySet.size === 0) {
    return [];
  }
  const locations = [];
  for (const filePath of localEnvCandidatePaths()) {
    if (!existsSync(filePath)) {
      continue;
    }
    const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      const key = parseEnvLineKey(line);
      if (!keySet.has(key)) {
        continue;
      }
      locations.push({
        key,
        file: displayLocalEnvTarget(filePath),
        line: index + 1,
        placeholder: true,
        valueRecorded: false
      });
    }
  }
  return locations;
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
    return {
      attempted: false,
      succeeded: true,
      status: 0,
      stdout: "",
      stderr: ""
    };
  }
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["run", "release:external-preflight"], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.error) {
    fail("Could not run npm run release:external-preflight.", result.error.message);
  }
  return {
    attempted: true,
    succeeded: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? ""
  };
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
      const placeholderKeys = action.placeholderKeys.length > 0 ? action.placeholderKeys.join(", ") : "none";
      const evidence = action.evidence.map((item) => `   - ${item.label}: ${item.path} (${item.present ? "present" : "missing"})`).join("\n") || "   - none";
      const keyGuidance = action.keyGuidance.map((item) => `   - ${item.key}: ${item.guidance}`).join("\n") || "   - none";
      const readyCriteria = action.readyCriteria.map((item) => `   - ${item}`).join("\n") || "   - none";
      const editLocations =
        action.placeholderEditLocations.map((item) => `   - ${item.file}:${item.line} ${item.key}`).join("\n") || "   - none";
      const envEditTemplate = action.envEditTemplate.map((item) => `   - ${item.assignment}`).join("\n") || "   - none";
      const envEditRows = action.envEditRows.map((item) => `   - ${item.location} ${item.assignment} | ${item.guidance}`).join("\n") || "   - none";
      const actionChecklist = action.actionChecklist.map((item) => `   - ${item}`).join("\n") || "   - none";
      const prerequisites = action.prerequisiteCommands.map((command) => `   - \`${command}\``).join("\n") || "   - none";
      const operatorActions = action.operatorActions.map((item) => `   - ${item}`).join("\n") || "   - none";
      const rerunCommands = action.rerunCommands.map((command) => `   - \`${command}\``).join("\n") || "   - none";
      const blockers = action.blockers.map((blocker) => `   - ${blocker}`).join("\n") || "   - none";
      return `${action.order}. ${action.label}
   Required keys: ${requiredKeys}
   Placeholder keys: ${placeholderKeys}
   Evidence:
${evidence}
   Key guidance:
${keyGuidance}
   Ready criteria:
${readyCriteria}
   Placeholder edit locations:
${editLocations}
   Env edit template:
${envEditTemplate}
   Env edit rows:
${envEditRows}
   Action checklist:
${actionChecklist}
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

function isGenericEvidenceLabel(label) {
  return /^Evidence\s+\d+$/i.test(String(label ?? "").trim());
}

function titleCaseEvidenceSlug(value) {
  return String(value ?? "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => {
      const upper = part.toUpperCase();
      if (["ID", "QA", "URL", "PKG", "DMG"].includes(upper)) {
        return upper;
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function inferEvidenceLabelFromPath(filePath, index) {
  const rawPath = typeof filePath === "string" ? filePath : "";
  const baseName = path.basename(rawPath, path.extname(rawPath));
  const prefixes = [`${appName}-${packageJson.version}-${platformArch}-`, `${appName}-${platformArch}-`, `${appName}-`];
  const slug = prefixes.reduce((current, prefix) => (current.startsWith(prefix) ? current.slice(prefix.length) : current), baseName);
  return titleCaseEvidenceSlug(slug) || `Evidence artifact ${index + 1}`;
}

function stableEvidenceLabel(item, index) {
  const label = typeof item.label === "string" ? item.label.trim() : "";
  return label.length > 0 && !isGenericEvidenceLabel(label) ? label : inferEvidenceLabelFromPath(item.path, index);
}

function buildEvidenceRows(items = []) {
  return (Array.isArray(items) ? items : []).map((item, index) => ({
    label: stableEvidenceLabel(item, index),
    path: item.path ?? "unknown",
    present: item.present === true,
    valueRecorded: false
  }));
}

function formatEvidenceRowsSummary(items) {
  return Array.isArray(items) && items.length > 0 ? `${items.length} value-free evidence rows` : "none";
}

function buildEvidenceLabels(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => (typeof item.label === "string" ? item.label.trim() : ""))
    .filter((label) => label.length > 0);
}

function formatEvidenceLabelSummary(items = []) {
  const labels = buildEvidenceLabels(items);
  return labels.length > 0 ? labels.join(", ") : "none";
}

function formatEvidenceRowsTable(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "| evidence | present | path | value recorded |\n|---|---:|---|---:|\n| none | no | none | no |";
  }
  return [
    "| evidence | present | path | value recorded |",
    "|---|---:|---|---:|",
    ...items.map((item) => `| ${escapeCell(item.label)} | ${readyLabel(item.present)} | ${escapeCell(item.path)} | ${readyLabel(item.valueRecorded)} |`)
  ].join("\n");
}

function formatBlockerRows(blockers) {
  if (blockers.length === 0) {
    return "| none | none |";
  }
  return blockers.map((blocker, index) => `| ${index + 1} | ${escapeCell(blocker)} |`).join("\n");
}

function formatKeyList(keys) {
  return Array.isArray(keys) && keys.length > 0 ? keys.map((key) => `- ${key}`).join("\n") : "- None.";
}

function formatInlineList(items) {
  return Array.isArray(items) && items.length > 0 ? items.join(", ") : "none";
}

function guidanceForKeys(keys) {
  return (Array.isArray(keys) ? keys : [])
    .map((key) => {
      const guidance = envKeyGuidance[key];
      return guidance ? { key, guidance } : null;
    })
    .filter(Boolean);
}

function readyCriteriaForAction(action = {}) {
  const mappedCriteria = actionReadyCriteria[action.id] ?? [];
  if (mappedCriteria.length > 0) {
    return mappedCriteria;
  }
  const requiredKeys = Array.isArray(action.requiredKeys) ? action.requiredKeys : [];
  if (requiredKeys.length > 0) {
    return [
      "Required private env keys validate in redacted evidence without recording values.",
      "Rerun commands complete without leaving this priority action blocked."
    ];
  }
  return ["Rerun commands complete and redacted evidence no longer lists this action as blocked."];
}

function formatGuidanceList(items) {
  return Array.isArray(items) && items.length > 0
    ? items.map((item) => `- ${item.key}: ${item.guidance}`).join("\n")
    : "- None.";
}

function formatReadyCriteriaList(items) {
  return Array.isArray(items) && items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None.";
}

function formatEditLocationSummary(items) {
  return Array.isArray(items) && items.length > 0 ? items.map((item) => `${item.file}:${item.line} ${item.key}`).join(", ") : "none";
}

function formatEditLocationList(items) {
  return Array.isArray(items) && items.length > 0
    ? items.map((item) => `- ${item.file}:${item.line} ${item.key}`).join("\n")
    : "- None.";
}

function envTemplatePlaceholderForKey(key) {
  const placeholders = {
    GROOVEFORGE_DISTRIBUTION_CHANNEL: "<direct-download/private-beta/managed-release>",
    GROOVEFORGE_RELEASE_DOWNLOAD_URL: "<safe-absolute-HTTPS-url-no-credentials-or-fragment>",
    GROOVEFORGE_RELEASE_NOTES_URL: "<safe-absolute-HTTPS-url-no-credentials-or-fragment>",
    GROOVEFORGE_SUPPORT_URL: "<safe-absolute-HTTPS-url-no-credentials-or-fragment>",
    GROOVEFORGE_UPDATE_FEED_URL: "<safe-absolute-HTTPS-update-feed-url-no-credentials-or-fragment>",
    ELECTRON_UPDATE_FEED_URL: "<safe-absolute-HTTPS-update-feed-url-no-credentials-or-fragment>",
    UPDATE_FEED_URL: "<safe-absolute-HTTPS-update-feed-url-no-credentials-or-fragment>",
    GROOVEFORGE_UPDATE_CHANNEL: "<lowercase-update-channel>",
    ELECTRON_UPDATE_CHANNEL: "<lowercase-update-channel>",
    UPDATE_CHANNEL: "<lowercase-update-channel>",
    GROOVEFORGE_DEVELOPER_ID_IDENTITY: "<developer-id-application-identity-or-sha1>",
    GROOVEFORGE_NOTARY_SUBMIT: "<1-after-signing-and-notary-credentials-ready>",
    APPLE_ID: "<apple-id-for-notary-credential-set>",
    APPLE_TEAM_ID: "<apple-team-id-for-notary-credential-set>",
    APPLE_APP_SPECIFIC_PASSWORD: "<apple-app-specific-password>",
    ASC_KEY_ID: "<app-store-connect-key-id>",
    ASC_ISSUER_ID: "<app-store-connect-issuer-id>",
    ASC_KEY_PATH: "<local-path-to-asc-private-key>",
    APPLE_NOTARY_PROFILE: "<notarytool-keychain-profile-name>",
    NOTARYTOOL_KEYCHAIN_PROFILE: "<notarytool-keychain-profile-name>",
    GROOVEFORGE_DISTRIBUTION_QA_APPROVED: "<1-after-manual-channel-qa>",
    GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256: "<manual-qa-checklist-sha256>"
  };
  return placeholders[key] ?? "<private-value-kept-out-of-committed-files>";
}

function buildEnvEditTemplate(keys) {
  return (Array.isArray(keys) ? keys : []).map((key) => {
    const placeholder = envTemplatePlaceholderForKey(key);
    return {
      key,
      placeholder,
      assignment: `${key}=${placeholder}`,
      guidance: envKeyGuidance[key] ?? "Set this private env key only in the ignored local env file.",
      valueRecorded: false
    };
  });
}

function formatEnvEditTemplateSummary(items) {
  return Array.isArray(items) && items.length > 0 ? `${items.length} value-free env assignments` : "none";
}

function formatEnvEditTemplateBlock(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "- None.";
  }
  return `\`\`\`env\n${items.map((item) => item.assignment).join("\n")}\n\`\`\``;
}

function buildEnvEditRows({ envEditTemplate = [], placeholderEditLocations = [], placeholderKeys = [], localEnvEditTarget = "" } = {}) {
  const locationByKey = new Map(placeholderEditLocations.map((item) => [item.key, item]));
  const placeholderKeySet = new Set(placeholderKeys);
  return envEditTemplate.map((template) => {
    const location = locationByKey.get(template.key);
    const file = location?.file ?? localEnvEditTarget;
    const line = Number.isInteger(location?.line) ? location.line : null;
    return {
      key: template.key,
      editTarget: localEnvEditTarget,
      file,
      line,
      locationKnown: line !== null,
      location: line === null ? `${file}:line-after-scaffold` : `${file}:${line}`,
      placeholder: placeholderKeySet.has(template.key),
      placeholderShape: template.placeholder,
      assignment: template.assignment,
      guidance: template.guidance,
      valueRecorded: false
    };
  });
}

function formatEnvEditRowsSummary(items) {
  return Array.isArray(items) && items.length > 0 ? `${items.length} value-free edit rows` : "none";
}

function formatEnvEditRowsTable(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "| key | location | assignment | guidance | placeholder |\n|---|---|---|---|---|\n| none | none | none | none | no |";
  }
  return [
    "| key | location | assignment | guidance | placeholder |",
    "|---|---|---|---|---|",
    ...items.map((item) => `| ${escapeCell(item.key)} | ${escapeCell(item.location)} | ${escapeCell(item.assignment)} | ${escapeCell(item.guidance)} | ${readyLabel(item.placeholder)} |`)
  ].join("\n");
}

function buildCurrentPlaceholderRemediationSummary({ currentActionSummary = {}, doctorPrepareEnvAudit = {} } = {}) {
  const currentEnvEditRows = Array.isArray(currentActionSummary.currentEnvEditRows) ? currentActionSummary.currentEnvEditRows : [];
  const currentPlaceholderKeys = Array.isArray(currentActionSummary.currentPlaceholderKeys) ? currentActionSummary.currentPlaceholderKeys : [];
  const placeholderKeySet = new Set(currentPlaceholderKeys);
  const doctorEditLocations = Array.isArray(doctorPrepareEnvAudit.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocations)
    ? doctorPrepareEnvAudit.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocations
    : [];
  const doctorLocationByKey = new Map(doctorEditLocations.map((item) => [item.key, item]));
  const currentPlaceholderRemediationRows = currentEnvEditRows
    .filter((item) => placeholderKeySet.has(item.key) || item.placeholder === true)
    .map((item, index) => {
      const doctorLocation = doctorLocationByKey.get(item.key);
      const file = doctorLocation?.file ?? item.file ?? currentActionSummary.currentEnvEditTarget ?? "unknown";
      const line = Number.isInteger(doctorLocation?.line) ? doctorLocation.line : Number.isInteger(item.line) ? item.line : null;
      const location = line === null ? item.location ?? `${file}:line-after-scaffold` : `${file}:${line}`;
      const nextCommand = currentActionSummary.currentNextCommand ?? "npm run release:doctor";
      return {
        order: index + 1,
        key: item.key,
        editTarget: item.editTarget ?? currentActionSummary.currentEnvEditTarget ?? file,
        file,
        line,
        location,
        assignment: item.assignment,
        guidance: item.guidance,
        placeholder: true,
        sourceArtifact: doctorPrepareEnvAudit.doctorPrepareEnvAuditSourceArtifact ?? "Release doctor",
        sourcePath: doctorPrepareEnvAudit.doctorPrepareEnvAuditSourcePath ?? relative(releaseDoctorPath),
        sourceReady: doctorPrepareEnvAudit.doctorPrepareEnvAuditSourceReady === true,
        doctorReportReady: doctorPrepareEnvAudit.doctorPrepareEnvAuditDoctorReportReady === true,
        nextCommand,
        rerunCommand: currentActionSummary.currentRerunCommand && currentActionSummary.currentRerunCommand !== "none" ? currentActionSummary.currentRerunCommand : nextCommand,
        valueRecorded: false
      };
    });

  return {
    currentPlaceholderRemediationRowCount: currentPlaceholderRemediationRows.length,
    currentPlaceholderRemediationRowSummary:
      currentPlaceholderRemediationRows.length > 0 ? `${currentPlaceholderRemediationRows.length} value-free remediation rows` : "none",
    currentPlaceholderRemediationRows
  };
}

function formatPlaceholderRemediationRowsTable(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "| key | location | assignment | guidance | source | next command | value recorded |\n|---|---|---|---|---|---|---:|\n| none | none | none | none | none | none | no |";
  }
  return [
    "| key | location | assignment | guidance | source | next command | value recorded |",
    "|---|---|---|---|---|---|---:|",
    ...items.map(
      (item) =>
        `| ${escapeCell(item.key)} | ${escapeCell(item.location)} | ${escapeCell(item.assignment)} | ${escapeCell(item.guidance)} | ${escapeCell(`${item.sourceArtifact}: ${item.sourcePath}`)} | ${escapeCell(item.nextCommand)} | ${readyLabel(item.valueRecorded)} |`
    )
  ].join("\n");
}

function buildCurrentProofChecklistSummary({ currentActionSummary = {}, hardExternalGateCommand = "npm run release:external-check" } = {}) {
  const currentReadyCriteria = Array.isArray(currentActionSummary.currentReadyCriteria) ? currentActionSummary.currentReadyCriteria : [];
  const currentEvidenceRows = Array.isArray(currentActionSummary.currentEvidenceRows) ? currentActionSummary.currentEvidenceRows : [];
  const currentEvidenceLabels = buildEvidenceLabels(currentEvidenceRows);
  const currentEvidencePaths = currentEvidenceRows.map((item) => item.path).filter((item) => typeof item === "string" && item.length > 0);
  const currentEvidenceReady = currentEvidenceRows.length > 0 && currentEvidenceRows.every((item) => item.present === true);
  const currentEvidenceSummary = formatEvidenceLabelSummary(currentEvidenceRows);
  const proofCommand =
    currentActionSummary.currentNextCommand && currentActionSummary.currentNextCommand !== "none"
      ? currentActionSummary.currentNextCommand
      : hardExternalGateCommand;
  const rerunCommand =
    currentActionSummary.currentRerunCommand && currentActionSummary.currentRerunCommand !== "none"
      ? currentActionSummary.currentRerunCommand
      : proofCommand;
  const currentProofChecklistRows = currentReadyCriteria.map((criterion, index) => ({
    order: index + 1,
    criterion,
    evidenceLabels: currentEvidenceLabels,
    evidencePaths: currentEvidencePaths,
    evidenceReady: currentEvidenceReady,
    evidenceSummary: currentEvidenceSummary,
    proofCommand,
    rerunCommand,
    hardGateCommand: hardExternalGateCommand,
    valueRecorded: false
  }));

  return {
    currentProofChecklistRowCount: currentProofChecklistRows.length,
    currentProofChecklistRowSummary:
      currentProofChecklistRows.length > 0 ? `${currentProofChecklistRows.length} value-free proof checklist rows` : "none",
    currentProofChecklistRows
  };
}

function formatProofChecklistRowsTable(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "| order | criterion | evidence | proof command | rerun command | hard gate | value recorded |\n|---:|---|---|---|---|---|---:|\n| 0 | none | none | none | none | none | no |";
  }
  return [
    "| order | criterion | evidence | proof command | rerun command | hard gate | value recorded |",
    "|---:|---|---|---|---|---|---:|",
    ...items.map(
      (item) =>
        `| ${item.order} | ${escapeCell(item.criterion)} | ${escapeCell(item.evidenceSummary)} | ${escapeCell(item.proofCommand)} | ${escapeCell(item.rerunCommand)} | ${escapeCell(item.hardGateCommand)} | ${readyLabel(item.valueRecorded)} |`
    )
  ].join("\n");
}

function classifyCurrentCommand(command, currentActionSummary = {}, hardExternalGateCommand = "npm run release:external-check") {
  const prerequisiteCommands = Array.isArray(currentActionSummary.currentPrerequisiteCommands) ? currentActionSummary.currentPrerequisiteCommands : [];
  const rerunCommands = Array.isArray(currentActionSummary.currentRerunCommands) ? currentActionSummary.currentRerunCommands : [];
  if (command === hardExternalGateCommand) {
    return "hard-gate";
  }
  if (command === currentActionSummary.currentNextCommand) {
    return "proof";
  }
  if (prerequisiteCommands.includes(command)) {
    return "prerequisite";
  }
  if (rerunCommands.includes(command)) {
    return "rerun";
  }
  return "supporting";
}

function commandVerificationExpectation(role) {
  switch (role) {
    case "prerequisite":
      return "Refresh current prerequisite evidence before the proof command.";
    case "proof":
      return "Run the current proof command after the current action is completed.";
    case "rerun":
      return "Rerun after editing to confirm the current action leaves the priority list.";
    case "hard-gate":
      return "Run only after all external distribution requirements are proven.";
    default:
      return "Keep this supporting command value-free and local.";
  }
}

function buildCurrentCommandVerificationSummary({ currentActionSummary = {}, hardExternalGateCommand = "npm run release:external-check" } = {}) {
  const currentCommandSequence = Array.isArray(currentActionSummary.currentCommandSequence) ? currentActionSummary.currentCommandSequence : [];
  const currentEvidenceRows = Array.isArray(currentActionSummary.currentEvidenceRows) ? currentActionSummary.currentEvidenceRows : [];
  const currentEvidenceLabels = buildEvidenceLabels(currentEvidenceRows);
  const currentEvidencePaths = currentEvidenceRows.map((item) => item.path).filter((item) => typeof item === "string" && item.length > 0);
  const currentEvidenceReady = currentEvidenceRows.length > 0 && currentEvidenceRows.every((item) => item.present === true);
  const currentEvidenceSummary = formatEvidenceLabelSummary(currentEvidenceRows);
  const proofCommand =
    currentActionSummary.currentNextCommand && currentActionSummary.currentNextCommand !== "none"
      ? currentActionSummary.currentNextCommand
      : hardExternalGateCommand;
  const rerunCommand =
    currentActionSummary.currentRerunCommand && currentActionSummary.currentRerunCommand !== "none"
      ? currentActionSummary.currentRerunCommand
      : proofCommand;
  const currentCommandVerificationRows = currentCommandSequence.map((command, index) => {
    const role = classifyCurrentCommand(command, currentActionSummary, hardExternalGateCommand);
    return {
      order: index + 1,
      command,
      role,
      expectation: commandVerificationExpectation(role),
      proofTarget: currentActionSummary.currentActionLabel ?? "No pending priority action",
      evidenceLabels: currentEvidenceLabels,
      evidencePaths: currentEvidencePaths,
      evidenceReady: currentEvidenceReady,
      evidenceSummary: currentEvidenceSummary,
      proofCommand,
      rerunCommand,
      hardGateCommand: hardExternalGateCommand,
      valueRecorded: false
    };
  });

  return {
    currentCommandVerificationRowCount: currentCommandVerificationRows.length,
    currentCommandVerificationRowSummary:
      currentCommandVerificationRows.length > 0 ? `${currentCommandVerificationRows.length} value-free command verification rows` : "none",
    currentCommandVerificationRows
  };
}

function formatCommandVerificationRowsTable(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "| order | command | role | expectation | evidence | proof target | hard gate | value recorded |\n|---:|---|---|---|---|---|---|---:|\n| 0 | none | none | none | none | none | none | no |";
  }
  return [
    "| order | command | role | expectation | evidence | proof target | hard gate | value recorded |",
    "|---:|---|---|---|---|---|---|---:|",
    ...items.map(
      (item) =>
        `| ${item.order} | ${escapeCell(item.command)} | ${escapeCell(item.role)} | ${escapeCell(item.expectation)} | ${escapeCell(item.evidenceSummary)} | ${escapeCell(item.proofTarget)} | ${escapeCell(item.hardGateCommand)} | ${readyLabel(item.valueRecorded)} |`
    )
  ].join("\n");
}

function currentActionAcceptanceEvidence(criterion, { currentActionSummary = {}, releaseDoctor = null } = {}) {
  const lower = String(criterion ?? "").toLowerCase();
  if (lower.includes("without placeholder values")) {
    const requiredCount = Number.isInteger(currentActionSummary.currentRequiredKeyCount)
      ? currentActionSummary.currentRequiredKeyCount
      : Array.isArray(currentActionSummary.currentRequiredKeys)
        ? currentActionSummary.currentRequiredKeys.length
        : 0;
    const placeholderCount = Number.isInteger(currentActionSummary.currentPlaceholderKeyCount)
      ? currentActionSummary.currentPlaceholderKeyCount
      : Array.isArray(currentActionSummary.currentPlaceholderKeys)
        ? currentActionSummary.currentPlaceholderKeys.length
        : 0;
    const ready = requiredCount > 0 && placeholderCount === 0;
    return {
      ready,
      evidence: ready
        ? `${requiredCount} current required keys are present without placeholder values`
        : `${placeholderCount} current placeholder keys remain`,
      sourceField: "currentRequiredKeys/currentPlaceholderKeys/currentPlaceholderEditLocations",
      operatorAction:
        placeholderCount > 0
          ? `Replace current release-channel placeholder keys in ${currentActionSummary.currentEnvEditTarget ?? ".env.distribution.local"}: ${currentActionSummary.currentPlaceholderEditLocationSummary ?? "current placeholder edit locations"}.`
          : "Keep the current release-channel keys placeholder-free in the ignored local env file.",
      expectedSignal: "current required keys present and current placeholder key count is 0"
    };
  }
  if (lower.includes("private-inputs") || lower.includes("private inputs")) {
    const privateInputsReady = releaseDoctor?.privateInputsReady === true;
    const channelMetadataReady = releaseDoctor?.channelMetadataReady === true;
    const privateValuesRecorded = releaseDoctor?.privateValuesRecorded === true;
    return {
      ready: privateInputsReady && channelMetadataReady && !privateValuesRecorded,
      evidence: `private inputs ready ${readyLabel(privateInputsReady)}; channel metadata ready ${readyLabel(channelMetadataReady)}; private values recorded ${readyLabel(privateValuesRecorded)}`,
      sourceField: "releaseDoctor.privateInputsReady/channelMetadataReady/privateValuesRecorded",
      operatorAction: `Run ${currentActionSummary.currentNextCommand ?? "npm run release:doctor"} after replacing the current release-channel metadata placeholders.`,
      expectedSignal: "private inputs ready yes; channel metadata ready yes; private values recorded no"
    };
  }
  if (lower.includes("distribution-channel qa")) {
    const distributionChannelQaReady = releaseDoctor?.distributionChannelQaReady === true;
    const channelMetadataReady = releaseDoctor?.channelMetadataReady === true;
    const privateValuesRecorded = releaseDoctor?.privateValuesRecorded === true;
    return {
      ready: distributionChannelQaReady && channelMetadataReady && !privateValuesRecorded,
      evidence: `distribution-channel QA ready ${readyLabel(distributionChannelQaReady)}; channel metadata ready ${readyLabel(channelMetadataReady)}; private values recorded ${readyLabel(privateValuesRecorded)}`,
      sourceField: "releaseDoctor.distributionChannelQaReady/channelMetadataReady/privateValuesRecorded",
      operatorAction: "Run npm run desktop:distribution-channel-qa-smoke after release doctor reports channel metadata ready.",
      expectedSignal: "distribution-channel QA ready yes; channel metadata ready yes; private values recorded no"
    };
  }
  return {
    ready: false,
    evidence: currentActionSummary.currentFirstBlocker ?? "Current evidence does not yet prove this criterion.",
    sourceField: "currentReadyCriteria/currentFirstBlocker",
    operatorAction: `Rerun ${currentActionSummary.currentRerunCommand ?? currentActionSummary.currentNextCommand ?? "npm run release:next-actions"} after resolving this criterion.`,
    expectedSignal: "criterion ready yes without recording private values"
  };
}

function buildCurrentActionAcceptanceSummary({
  currentActionSummary = {},
  releaseDoctor = null,
  hardExternalGateCommand = "npm run release:external-check"
} = {}) {
  const currentReadyCriteria = Array.isArray(currentActionSummary.currentReadyCriteria) ? currentActionSummary.currentReadyCriteria : [];
  const proofCommand =
    currentActionSummary.currentNextCommand && currentActionSummary.currentNextCommand !== "none"
      ? currentActionSummary.currentNextCommand
      : hardExternalGateCommand;
  const rerunCommand =
    currentActionSummary.currentRerunCommand && currentActionSummary.currentRerunCommand !== "none"
      ? currentActionSummary.currentRerunCommand
      : proofCommand;
  const currentActionAcceptanceRows = currentReadyCriteria.map((criterion, index) => {
    const evidence = currentActionAcceptanceEvidence(criterion, { currentActionSummary, releaseDoctor });
    return {
      order: index + 1,
      criterion,
      ready: evidence.ready,
      evidence: evidence.evidence,
      proofCommand,
      rerunCommand,
      hardGateCommand: hardExternalGateCommand,
      valueRecorded: false
    };
  });
  const currentActionAcceptanceBlockerRows = currentActionAcceptanceRows
    .filter((row) => row.ready !== true)
    .map((row, index) => {
      const evidence = currentActionAcceptanceEvidence(row.criterion, { currentActionSummary, releaseDoctor });
      return {
        order: index + 1,
        criterion: row.criterion,
        blocker: row.evidence,
        sourceField: evidence.sourceField,
        operatorAction: evidence.operatorAction,
        proofCommand,
        rerunCommand,
        valueRecorded: false
      };
    });
  const readyCount = currentActionAcceptanceRows.filter((row) => row.ready).length;
  return {
    currentActionAcceptanceReady: currentActionAcceptanceRows.length > 0 && readyCount === currentActionAcceptanceRows.length,
    currentActionAcceptanceRowCount: currentActionAcceptanceRows.length,
    currentActionAcceptanceReadyCount: readyCount,
    currentActionAcceptanceSummary:
      currentActionAcceptanceRows.length > 0 ? `${readyCount}/${currentActionAcceptanceRows.length} current action acceptance criteria ready` : "none",
    currentActionAcceptanceRows,
    currentActionAcceptanceBlockerCount: currentActionAcceptanceBlockerRows.length,
    currentActionAcceptanceBlockerSummary:
      currentActionAcceptanceBlockerRows.length > 0 ? `${currentActionAcceptanceBlockerRows.length} current action acceptance blockers` : "none",
    currentActionAcceptanceBlockerRows,
    currentActionAcceptanceValueRecorded: false
  };
}

function buildCurrentActionPostEditVerificationSummary({
  currentActionSummary = {},
  acceptanceRows = [],
  hardExternalGateCommand = "npm run release:external-check"
} = {}) {
  const proofCommand =
    currentActionSummary.currentNextCommand && currentActionSummary.currentNextCommand !== "none"
      ? currentActionSummary.currentNextCommand
      : hardExternalGateCommand;
  const rerunCommand =
    currentActionSummary.currentRerunCommand && currentActionSummary.currentRerunCommand !== "none"
      ? currentActionSummary.currentRerunCommand
      : proofCommand;
  const currentActionPostEditVerificationRows = (Array.isArray(acceptanceRows) ? acceptanceRows : []).map((row, index) => {
    const evidence = currentActionAcceptanceEvidence(row.criterion, { currentActionSummary });
    const expectedSignal =
      currentActionSummary.currentActionId === "release-channel-metadata" &&
      index === 0 &&
      !String(evidence.expectedSignal ?? "").includes("current placeholder key count is 0")
        ? `${evidence.expectedSignal}; current placeholder key count is 0`
        : evidence.expectedSignal;
    return {
      order: index + 1,
      criterion: row.criterion,
      currentReady: row.ready === true,
      currentEvidence: row.evidence,
      expectedSignal,
      sourceField: evidence.sourceField,
      proofCommand,
      rerunCommand,
      hardGateCommand: hardExternalGateCommand,
      valueRecorded: false
    };
  });
  const currentReadyCount = currentActionPostEditVerificationRows.filter((row) => row.currentReady).length;
  return {
    currentActionPostEditVerificationReady:
      currentActionPostEditVerificationRows.length === (Array.isArray(acceptanceRows) ? acceptanceRows.length : 0) &&
      currentActionPostEditVerificationRows.every((row) => row.valueRecorded === false),
    currentActionPostEditVerificationRowCount: currentActionPostEditVerificationRows.length,
    currentActionPostEditVerificationCurrentReadyCount: currentReadyCount,
    currentActionPostEditVerificationSummary:
      currentActionPostEditVerificationRows.length > 0
        ? `${currentActionPostEditVerificationRows.length} value-free post-edit verification rows`
        : "none",
    currentActionPostEditVerificationCurrentSummary:
      currentActionPostEditVerificationRows.length > 0
        ? `${currentReadyCount}/${currentActionPostEditVerificationRows.length} post-edit signals currently ready`
        : "none",
    currentActionPostEditVerificationRows,
    currentActionPostEditVerificationMatchesAcceptance:
      currentActionPostEditVerificationRows.length === (Array.isArray(acceptanceRows) ? acceptanceRows.length : 0)
  };
}

function buildCurrentActionHandoffSummary({
  sourceArtifacts = [],
  currentActionSummary = {},
  currentActionAcceptance = {},
  currentCommandVerification = {},
  hardGateRequirementBlockedCount = 0,
  hardGateBlockedRequirementSummary = "none",
  hardExternalGateCommand = "npm run release:external-check"
} = {}) {
  const proofCommand =
    currentActionSummary.currentNextCommand && currentActionSummary.currentNextCommand !== "none"
      ? currentActionSummary.currentNextCommand
      : hardExternalGateCommand;
  const rerunCommand =
    currentActionSummary.currentRerunCommand && currentActionSummary.currentRerunCommand !== "none"
      ? currentActionSummary.currentRerunCommand
      : proofCommand;
  const sourceArtifactSummary = (Array.isArray(sourceArtifacts) ? sourceArtifacts : [])
    .map((item) => item.label)
    .filter((label) => typeof label === "string" && label.length > 0)
    .join(", ");
  const acceptanceBlockerCount = Number.isInteger(currentActionAcceptance.currentActionAcceptanceBlockerCount)
    ? currentActionAcceptance.currentActionAcceptanceBlockerCount
    : 0;
  const currentActionHandoffRows = [
    {
      order: 1,
      item: "Source artifacts",
      sourceField: "sourceArtifacts",
      evidence: sourceArtifactSummary || "none",
      blockerCount: hardGateRequirementBlockedCount,
      acceptanceBlockerCount,
      proofCommand,
      rerunCommand,
      hardGateCommand: hardExternalGateCommand,
      valueRecorded: false
    },
    {
      order: 2,
      item: "Current edit target",
      sourceField: "currentEnvEditTarget/currentPlaceholderEditLocations",
      evidence: `${currentActionSummary.currentEnvEditTarget ?? "unknown"}; ${currentActionSummary.currentPlaceholderEditLocationSummary ?? "none"}`,
      blockerCount: Number.isInteger(currentActionSummary.currentPlaceholderKeyCount)
        ? currentActionSummary.currentPlaceholderKeyCount
        : 0,
      acceptanceBlockerCount,
      proofCommand,
      rerunCommand,
      hardGateCommand: hardExternalGateCommand,
      valueRecorded: false
    },
    {
      order: 3,
      item: "Acceptance blockers",
      sourceField: "currentActionAcceptanceBlockerRows",
      evidence: currentActionAcceptance.currentActionAcceptanceBlockerSummary ?? "none",
      blockerCount: acceptanceBlockerCount,
      acceptanceBlockerCount,
      proofCommand,
      rerunCommand,
      hardGateCommand: hardExternalGateCommand,
      valueRecorded: false
    },
    {
      order: 4,
      item: "Rerun order",
      sourceField: "currentCommandVerificationRows/currentCommandSequence",
      evidence: currentActionSummary.currentCommandSequenceSummary ?? currentCommandVerification.currentCommandVerificationRowSummary ?? "none",
      blockerCount: acceptanceBlockerCount,
      acceptanceBlockerCount,
      proofCommand,
      rerunCommand,
      hardGateCommand: hardExternalGateCommand,
      valueRecorded: false
    },
    {
      order: 5,
      item: "Hard gate",
      sourceField: "externalPreflight.gateRequirementTotal/gateRequirementReadyCount",
      evidence: hardGateBlockedRequirementSummary,
      blockerCount: hardGateRequirementBlockedCount,
      acceptanceBlockerCount,
      proofCommand,
      rerunCommand,
      hardGateCommand: hardExternalGateCommand,
      valueRecorded: false
    }
  ];

  return {
    currentActionHandoffReady: currentActionHandoffRows.length === 5 && currentActionHandoffRows.every((row) => row.valueRecorded === false),
    currentActionHandoffRowCount: currentActionHandoffRows.length,
    currentActionHandoffSummary:
      currentActionHandoffRows.length > 0 ? `${currentActionHandoffRows.length} value-free current action handoff rows` : "none",
    currentActionHandoffRows,
    currentActionHandoffSourceArtifactCount: Array.isArray(sourceArtifacts) ? sourceArtifacts.length : 0,
    currentActionHandoffSourceArtifactSummary: sourceArtifactSummary || "none"
  };
}

function expectedInputShapeForKey(key) {
  if (key === "GROOVEFORGE_DISTRIBUTION_CHANNEL") {
    return "allowed channel token: direct-download, private-beta, or managed-release";
  }
  return "safe HTTPS URL shape: HTTPS protocol, hostname present, no credentials, no fragment";
}

function buildCurrentPrivateEditSafetySummary({
  currentActionSummary = {},
  currentEnvEditTarget = ".env.distribution.local",
  hardExternalGateCommand = "npm run release:external-check"
} = {}) {
  if (currentActionSummary.currentActionId !== "release-channel-metadata") {
    return {
      currentPrivateEditSafetyReady: true,
      currentPrivateEditSafetyRowCount: 0,
      currentPrivateEditSafetySummary: "none",
      currentPrivateEditSafetyRows: []
    };
  }

  const currentRerunCommand =
    currentActionSummary.currentRerunCommand && currentActionSummary.currentRerunCommand !== "none"
      ? currentActionSummary.currentRerunCommand
      : currentActionSummary.currentNextCommand;
  const commandSequence = Array.isArray(currentActionSummary.currentCommandSequence)
    ? currentActionSummary.currentCommandSequence
    : [];
  const missingLocalEnv =
    currentActionSummary.currentNextCommand === "npm run release:prepare-env" ||
    String(currentActionSummary.currentFirstBlocker ?? "").includes("local distribution env file is not loaded");
  const currentRequiredKeyCount = Number.isInteger(currentActionSummary.currentRequiredKeyCount)
    ? currentActionSummary.currentRequiredKeyCount
    : 0;
  const currentPlaceholderKeyCount = Number.isInteger(currentActionSummary.currentPlaceholderKeyCount)
    ? currentActionSummary.currentPlaceholderKeyCount
    : 0;
  const currentPrivateEditSafetyRows = [
    {
      order: 1,
      check: "Private edits stay in ignored local env target",
      ready: currentEnvEditTarget === currentLocalEnvEditTarget() && currentRequiredKeyCount === releaseChannelMetadataKeys.length,
      evidence: `${currentEnvEditTarget}; ${currentPlaceholderKeyCount}/${currentRequiredKeyCount} current release-channel placeholders; ${currentActionSummary.currentPlaceholderEditLocationSummary ?? "current placeholder edit locations"}`,
      command: currentRerunCommand,
      valueRecorded: false
    },
    {
      order: 2,
      check: "Receipt output stays value-free",
      ready: true,
      evidence: "key names, counts, file-line locations, assignment shapes, and expected signals only; private values recorded no",
      command: currentRerunCommand,
      valueRecorded: false
    },
    {
      order: 3,
      check: "Post-edit rerun order is explicit",
      ready:
        (commandSequence.includes("npm run release:doctor") && commandSequence.includes(currentRerunCommand)) ||
        (missingLocalEnv && commandSequence.includes("npm run release:prepare-env") && commandSequence.includes(currentRerunCommand)),
      evidence: formatCommandSummary(commandSequence),
      command: currentRerunCommand,
      valueRecorded: false
    },
    {
      order: 4,
      check: "Hard external gate remains separate",
      ready: hardExternalGateCommand === "npm run release:external-check",
      evidence: "next-actions does not claim the hard external distribution gate",
      command: hardExternalGateCommand,
      valueRecorded: false
    },
    {
      order: 5,
      check: "No remote side effects by this report",
      ready: true,
      evidence: "network probe no; release upload no; signing no; Apple notary submission no",
      command: currentRerunCommand,
      valueRecorded: false
    }
  ];

  return {
    currentPrivateEditSafetyReady: currentPrivateEditSafetyRows.every((row) => row.ready === true && row.valueRecorded === false),
    currentPrivateEditSafetyRowCount: currentPrivateEditSafetyRows.length,
    currentPrivateEditSafetySummary:
      currentPrivateEditSafetyRows.length > 0
        ? `${currentPrivateEditSafetyRows.length} value-free private edit safety rows`
        : "none",
    currentPrivateEditSafetyRows
  };
}

function buildCurrentInputShapeChecklistSummary({
  currentActionSummary = {},
  doctorReleaseChannelFocus = {},
  hardExternalGateCommand = "npm run release:external-check"
} = {}) {
  if (currentActionSummary.currentActionId !== "release-channel-metadata") {
    return {
      currentInputShapeChecklistReady: true,
      currentInputShapeChecklistRowCount: 0,
      currentInputShapeChecklistSummary: "none",
      currentInputShapeChecklistRows: []
    };
  }

  const currentRequiredKeys = Array.isArray(currentActionSummary.currentRequiredKeys)
    ? currentActionSummary.currentRequiredKeys
    : [];
  const proofCommand =
    currentActionSummary.currentNextCommand && currentActionSummary.currentNextCommand !== "none"
      ? currentActionSummary.currentNextCommand
      : hardExternalGateCommand;
  const rerunCommand =
    currentActionSummary.currentRerunCommand && currentActionSummary.currentRerunCommand !== "none"
      ? currentActionSummary.currentRerunCommand
      : proofCommand;
  const focusRowsByKey = new Map(
    valueFreeObjectRows(doctorReleaseChannelFocus.doctorReleaseChannelFocusRows).map((row) => [row.key, row])
  );
  const currentInputShapeChecklistRows = currentRequiredKeys.map((key, index) => {
    const focusRow = focusRowsByKey.get(key);
    const guidance = envKeyGuidance[key] ?? expectedInputShapeForKey(key);
    return {
      order: index + 1,
      key,
      ready: releaseChannelMetadataKeys.includes(key) && typeof guidance === "string" && guidance.length > 0,
      expectedShape: expectedInputShapeForKey(key),
      evidenceSource: focusRow?.expectedSignal
        ? `${focusRow.expectedSignal}; guidance: ${guidance}`
        : `guidance: ${guidance}`,
      proofCommand,
      rerunCommand,
      hardGateCommand: hardExternalGateCommand,
      valueRecorded: false
    };
  });

  return {
    currentInputShapeChecklistReady:
      currentInputShapeChecklistRows.length === releaseChannelMetadataKeys.length &&
      releaseChannelMetadataKeys.every((key) => currentInputShapeChecklistRows.some((row) => row.key === key)) &&
      currentInputShapeChecklistRows.every(
        (row) =>
          row.ready === true &&
          row.valueRecorded === false &&
          row.proofCommand === proofCommand &&
          row.rerunCommand === rerunCommand &&
          row.hardGateCommand === hardExternalGateCommand
      ),
    currentInputShapeChecklistRowCount: currentInputShapeChecklistRows.length,
    currentInputShapeChecklistSummary:
      currentInputShapeChecklistRows.length > 0
        ? `${currentInputShapeChecklistRows.length} value-free current input shape rows`
        : "none",
    currentInputShapeChecklistRows
  };
}

function firstStringArray(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === "string" && item.length > 0);
    }
  }
  return [];
}

function buildCurrentLocalEnvDiagnosticsSummary({
  externalPreflight = {},
  releaseDoctor = {},
  currentEnvEditTarget = ".env.distribution.local",
  currentPlaceholderKeyCount = 0
} = {}) {
  const filesChecked = firstStringArray(
    externalPreflight.localEnvFilesChecked,
    releaseDoctor.localEnvFilesChecked,
    releaseDoctor.releasePrepareEnvExistingLocalEnvFilesChecked,
    [distributionLocalEnvDefaults.defaultEnvFileName]
  );
  const presentFiles = firstStringArray(
    externalPreflight.localEnvPresentFiles,
    releaseDoctor.localEnvPresentFiles,
    releaseDoctor.releasePrepareEnvExistingLocalEnvPresentFiles
  );
  const placeholderKeys = firstStringArray(
    externalPreflight.localEnvPlaceholderKeys,
    releaseDoctor.localEnvPlaceholderKeys,
    releaseDoctor.releasePrepareEnvExistingLocalEnvPlaceholderKeys
  );
  const unknownKeys = firstStringArray(
    externalPreflight.localEnvUnknownKeys,
    releaseDoctor.localEnvUnknownKeys,
    externalPreflight.localEnvInput?.unknownKeys,
    releaseDoctor.localEnvInput?.unknownKeys
  );
  const malformedLines = firstStringArray(
    externalPreflight.localEnvMalformedLines,
    releaseDoctor.localEnvMalformedLines,
    externalPreflight.localEnvInput?.malformedLines,
    releaseDoctor.localEnvInput?.malformedLines
  );
  const skippedExistingKeys = firstStringArray(
    externalPreflight.localEnvSkippedExistingKeys,
    releaseDoctor.localEnvSkippedExistingKeys,
    externalPreflight.localEnvInput?.skippedExistingKeys,
    releaseDoctor.localEnvInput?.skippedExistingKeys
  );
  const loadedKeys = firstStringArray(
    externalPreflight.localEnvLoadedKeys,
    releaseDoctor.localEnvLoadedKeys,
    externalPreflight.localEnvInput?.loadedKeys,
    releaseDoctor.localEnvInput?.loadedKeys
  );
  const localEnvValueRecorded =
    externalPreflight.localEnvValueRecorded === true ||
    releaseDoctor.localEnvValueRecorded === true ||
    releaseDoctor.releasePrepareEnvExistingLocalEnvValueRecorded === true ||
    externalPreflight.localEnvInput?.valueRecorded === true ||
    releaseDoctor.localEnvInput?.valueRecorded === true;
  const rows = [
    {
      order: 1,
      diagnostic: "Local env source files checked",
      status: filesChecked.length > 0 ? "checked" : "missing",
      evidence: `checked: ${formatInlineList(filesChecked)}; present: ${formatInlineList(presentFiles)}`,
      sourceField: "externalPreflight.localEnvFilesChecked/presentFiles",
      valueRecorded: false
    },
    {
      order: 2,
      diagnostic: "Current edit target present",
      status: presentFiles.includes(currentEnvEditTarget) ? "present" : "missing",
      evidence: currentEnvEditTarget,
      sourceField: "externalPreflight.localEnvPresentFiles/currentEnvEditTarget",
      valueRecorded: false
    },
    {
      order: 3,
      diagnostic: "Current placeholder scope",
      status: currentPlaceholderKeyCount === 0 ? "clear" : "blocked",
      evidence: `${currentPlaceholderKeyCount} current release-channel placeholders; ${placeholderKeys.length} total local env placeholders`,
      sourceField: "currentPlaceholderKeys/localEnvPlaceholderKeys",
      valueRecorded: false
    },
    {
      order: 4,
      diagnostic: "Unknown key scan",
      status: unknownKeys.length === 0 ? "clean" : "needs-edit",
      evidence: `${unknownKeys.length} unknown key names reported`,
      sourceField: "localEnvUnknownKeys/localEnvInput.unknownKeys",
      valueRecorded: false
    },
    {
      order: 5,
      diagnostic: "Malformed line scan",
      status: malformedLines.length === 0 ? "clean" : "needs-edit",
      evidence: `${malformedLines.length} malformed line locations reported`,
      sourceField: "localEnvMalformedLines/localEnvInput.malformedLines",
      valueRecorded: false
    },
    {
      order: 6,
      diagnostic: "Existing environment overrides",
      status: skippedExistingKeys.length === 0 ? "none" : "skipped",
      evidence: `${skippedExistingKeys.length} existing environment key names skipped`,
      sourceField: "localEnvSkippedExistingKeys/localEnvInput.skippedExistingKeys",
      valueRecorded: false
    },
    {
      order: 7,
      diagnostic: "Loaded key redaction",
      status: "redacted",
      evidence: `${loadedKeys.length} non-placeholder key names loaded; values recorded no`,
      sourceField: "localEnvLoadedKeys/localEnvInput.loadedKeys/valueRecorded",
      valueRecorded: false
    },
    {
      order: 8,
      diagnostic: "Local env value recording",
      status: localEnvValueRecorded ? "blocked" : "clean",
      evidence: `local env values recorded ${localEnvValueRecorded ? "yes" : "no"}`,
      sourceField: "localEnvValueRecorded/releasePrepareEnvExistingLocalEnvValueRecorded",
      valueRecorded: false
    }
  ];
  return {
    currentLocalEnvDiagnosticsReady:
      rows.length === 8 && rows.every((row) => row.valueRecorded === false) && localEnvValueRecorded === false,
    currentLocalEnvDiagnosticRowCount: rows.length,
    currentLocalEnvDiagnosticSummary: rows.length > 0 ? `${rows.length} value-free local env diagnostic rows` : "none",
    currentLocalEnvDiagnosticRows: rows
  };
}

function buildReleaseChannelPostEditReceiptSummary({
  currentActionSummary = {},
  currentActionAcceptance = {},
  currentActionPostEditVerification = {},
  currentInputShapeChecklist = {},
  currentLocalEnvDiagnostics = {},
  hardExternalGateCommand = "npm run release:external-check"
} = {}) {
  const currentStepCommand =
    currentActionSummary.currentNextCommand && currentActionSummary.currentNextCommand !== "none"
      ? currentActionSummary.currentNextCommand
      : hardExternalGateCommand;
  const missingLocalEnv =
    currentStepCommand === "npm run release:prepare-env" ||
    String(currentActionSummary.currentFirstBlocker ?? "").includes("local distribution env file is not loaded");
  const proofCommand = currentActionSummary.currentActionId === "release-channel-metadata" ? "npm run release:doctor" : currentStepCommand;
  const rerunCommand = currentActionSummary.currentActionId === "release-channel-metadata" ? "npm run release:current-blocker" : proofCommand;
  if (currentActionSummary.currentActionId !== "release-channel-metadata") {
    return {
      releaseChannelPostEditReceiptReady: true,
      releaseChannelPostEditReceiptCurrentReadyCount: 0,
      releaseChannelPostEditReceiptRowCount: 0,
      releaseChannelPostEditReceiptSummary: "none",
      releaseChannelPostEditReceiptRows: [],
      releaseChannelPostEditReceiptProofCommand: proofCommand,
      releaseChannelPostEditReceiptRerunCommand: rerunCommand,
      releaseChannelPostEditReceiptValueRecorded: false
    };
  }

  const currentRequiredKeys = Array.isArray(currentActionSummary.currentRequiredKeys)
    ? currentActionSummary.currentRequiredKeys
    : [];
  const currentPlaceholderKeys = Array.isArray(currentActionSummary.currentPlaceholderKeys)
    ? currentActionSummary.currentPlaceholderKeys
    : [];
  const currentInputShapeRows = valueFreeObjectRows(currentInputShapeChecklist.currentInputShapeChecklistRows);
  const postEditRows = valueFreeObjectRows(currentActionPostEditVerification.currentActionPostEditVerificationRows);
  const acceptanceRows = valueFreeObjectRows(currentActionAcceptance.currentActionAcceptanceRows);
  const localEnvDiagnosticRows = valueFreeObjectRows(currentLocalEnvDiagnostics.currentLocalEnvDiagnosticRows);
  const commandSequence = Array.isArray(currentActionSummary.currentCommandSequence)
    ? currentActionSummary.currentCommandSequence
    : [];
  const rows = [
    {
      order: 1,
      item: "Current key coverage",
      ready:
        currentRequiredKeys.length === releaseChannelMetadataKeys.length &&
        releaseChannelMetadataKeys.every((key) => currentRequiredKeys.includes(key)) &&
        currentActionSummary.currentEnvEditTarget === currentLocalEnvEditTarget(),
      currentReady: currentPlaceholderKeys.length === 0,
      evidence: `${currentRequiredKeys.length} required release-channel keys; ${currentPlaceholderKeys.length} current placeholder keys; edit target ${currentActionSummary.currentEnvEditTarget}`,
      expectedPostEditSignal: "all current release-channel metadata keys load without placeholders; 0 current placeholder keys",
      proofCommand,
      rerunCommand,
      sourceField: "currentRequiredKeys/currentPlaceholderKeys/currentEnvEditTarget",
      valueRecorded: false
    },
    {
      order: 2,
      item: "Shape rehearsal coverage",
      ready:
        currentInputShapeChecklist.currentInputShapeChecklistReady === true &&
        currentInputShapeRows.length === releaseChannelMetadataKeys.length &&
        currentInputShapeRows.every((row) => row.ready === true && row.valueRecorded === false),
      currentReady: currentInputShapeChecklist.currentInputShapeChecklistReady === true,
      evidence: `${currentInputShapeRows.length} value-free current input shape rows; values recorded no`,
      expectedPostEditSignal: "real private edits satisfy the same allowed channel-token and safe HTTPS URL shapes",
      proofCommand,
      rerunCommand,
      sourceField: "currentInputShapeChecklistRows/currentInputShapeChecklistReady",
      valueRecorded: false
    },
    {
      order: 3,
      item: "Placeholder cleanup acceptance",
      ready:
        Number.isInteger(currentActionSummary.currentPlaceholderKeyCount) &&
        currentActionSummary.currentPlaceholderKeyCount === currentPlaceholderKeys.length &&
        postEditRows.some((row) => String(row.expectedSignal ?? "").includes("current placeholder key count is 0")),
      currentReady: currentActionSummary.currentPlaceholderKeyCount === 0,
      evidence: `${currentActionSummary.currentPlaceholderKeyCount} current placeholder keys remain; ${currentActionPostEditVerification.currentActionPostEditVerificationCurrentReadyCount}/${currentActionPostEditVerification.currentActionPostEditVerificationRowCount} current post-edit signals ready`,
      expectedPostEditSignal: "0 current placeholder keys; current first blocker advances past release-channel metadata",
      proofCommand,
      rerunCommand,
      sourceField: "currentPlaceholderKeyCount/currentActionPostEditVerificationRows",
      valueRecorded: false
    },
    {
      order: 4,
      item: "Proof and rerun sequence",
      ready:
        proofCommand === "npm run release:doctor" &&
        rerunCommand === "npm run release:current-blocker" &&
        ((commandSequence.includes(proofCommand) && commandSequence.includes(rerunCommand)) ||
          (missingLocalEnv && commandSequence.includes("npm run release:prepare-env"))),
      currentReady: false,
      evidence: `${commandSequence.length} command sequence rows; current step ${currentStepCommand}; post-edit proof ${proofCommand}; rerun ${rerunCommand}`,
      expectedPostEditSignal: "run npm run release:doctor, then npm run release:current-blocker to mirror the advanced blocker",
      proofCommand,
      rerunCommand,
      sourceField: "currentCommandSequence/currentNextCommand/currentRerunCommand",
      valueRecorded: false
    },
    {
      order: 5,
      item: "Acceptance evidence coverage",
      ready:
        acceptanceRows.length > 0 &&
        Number.isInteger(currentActionAcceptance.currentActionAcceptanceBlockerCount) &&
        postEditRows.length === acceptanceRows.length &&
        localEnvDiagnosticRows.length === 8,
      currentReady: currentActionAcceptance.currentActionAcceptanceReady === true,
      evidence: `${acceptanceRows.length} current action acceptance rows; ${currentActionAcceptance.currentActionAcceptanceBlockerCount} blockers; ${localEnvDiagnosticRows.length} local env diagnostic rows`,
      expectedPostEditSignal: "private-input, distribution-channel QA, and current proof checklist signals turn ready without storing values",
      proofCommand,
      rerunCommand,
      sourceField: "currentActionAcceptanceRows/currentActionPostEditVerificationRows/currentLocalEnvDiagnosticRows",
      valueRecorded: false
    },
    {
      order: 6,
      item: "Hard gate separation",
      ready: hardExternalGateCommand === "npm run release:external-check",
      currentReady: false,
      evidence: `hard gate remains ${hardExternalGateCommand}; next-actions does not claim external distribution completion`,
      expectedPostEditSignal: "release-channel metadata clears first; hard gate remains separate until downstream proofs are ready",
      proofCommand: hardExternalGateCommand,
      rerunCommand,
      sourceField: "hardExternalGateCommand/releaseGateClaimedExternalDistribution",
      valueRecorded: false
    }
  ];

  return {
    releaseChannelPostEditReceiptReady: rows.length === 6 && rows.every((row) => row.ready === true && row.valueRecorded === false),
    releaseChannelPostEditReceiptCurrentReadyCount: rows.filter((row) => row.currentReady === true).length,
    releaseChannelPostEditReceiptRowCount: rows.length,
    releaseChannelPostEditReceiptSummary: `${rows.length} value-free release-channel post-edit receipt rows`,
    releaseChannelPostEditReceiptRows: rows,
    releaseChannelPostEditReceiptProofCommand: proofCommand,
    releaseChannelPostEditReceiptRerunCommand: rerunCommand,
    releaseChannelPostEditReceiptValueRecorded: false
  };
}

function buildReleaseChannelPostEditOperatorReceiptSummary({
  currentActionSummary = {},
  releaseChannelPostEditReceipt = {},
  hardExternalGateCommand = "npm run release:external-check"
} = {}) {
  const currentStepCommand =
    currentActionSummary.currentNextCommand && currentActionSummary.currentNextCommand !== "none"
      ? currentActionSummary.currentNextCommand
      : "npm run release:doctor";
  const missingLocalEnv =
    currentStepCommand === "npm run release:prepare-env" ||
    String(currentActionSummary.currentFirstBlocker ?? "").includes("local distribution env file is not loaded");
  const proofCommand = currentActionSummary.currentActionId === "release-channel-metadata" ? "npm run release:doctor" : currentStepCommand;
  const blockerRefreshCommand =
    currentActionSummary.currentActionId === "release-channel-metadata" ? "npm run release:current-blocker" : proofCommand;
  const nextActionsRefreshCommand = "npm run release:next-actions";
  if (currentActionSummary.currentActionId !== "release-channel-metadata") {
    return {
      releaseChannelPostEditOperatorReceiptReady: true,
      releaseChannelPostEditOperatorReceiptRowCount: 0,
      releaseChannelPostEditOperatorReceiptSummary: "none",
      releaseChannelPostEditOperatorReceiptRows: [],
      releaseChannelPostEditOperatorReceiptProofCommand: proofCommand,
      releaseChannelPostEditOperatorReceiptBlockerRefreshCommand: blockerRefreshCommand,
      releaseChannelPostEditOperatorReceiptNextActionsCommand: nextActionsRefreshCommand,
      releaseChannelPostEditOperatorReceiptHardGateCommand: hardExternalGateCommand,
      releaseChannelPostEditOperatorReceiptValueRecorded: false
    };
  }

  const placeholderLocations = Array.isArray(currentActionSummary.currentPlaceholderEditLocations)
    ? currentActionSummary.currentPlaceholderEditLocations
    : [];
  const placeholderLocationSummary =
    currentActionSummary.currentPlaceholderEditLocationSummary ??
    formatEditLocationSummary(placeholderLocations);
  const placeholderKeys = Array.isArray(currentActionSummary.currentPlaceholderKeys)
    ? currentActionSummary.currentPlaceholderKeys
    : [];
  const postEditRows = valueFreeObjectRows(releaseChannelPostEditReceipt.releaseChannelPostEditReceiptRows);
  const rows = [
    {
      order: 1,
      step: "Edit target",
      ready:
        currentActionSummary.currentEnvEditTarget === currentLocalEnvEditTarget() &&
        ((placeholderKeys.length === releaseChannelMetadataKeys.length &&
          placeholderLocations.length === releaseChannelMetadataKeys.length) ||
          (missingLocalEnv && placeholderKeys.length === 0 && placeholderLocations.length === 0)),
      currentState: `${placeholderKeys.length} current release-channel placeholder keys at ${placeholderLocationSummary}`,
      operatorAction: missingLocalEnv
        ? `Run ${currentStepCommand} to create ${currentActionSummary.currentEnvEditTarget}, then replace private values for the four current release-channel metadata keys.`
        : `Replace private values in ${currentActionSummary.currentEnvEditTarget} for the four current release-channel metadata keys.`,
      expectedPostEditSignal: "0 current placeholder keys; values still redacted in reports",
      command: missingLocalEnv ? currentStepCommand : "edit ignored local env file",
      proofCommand,
      rerunCommand: blockerRefreshCommand,
      sourceField: "currentPlaceholderKeys/currentPlaceholderEditLocations/currentEnvEditTarget",
      valueRecorded: false
    },
    {
      order: 2,
      step: "Recommended strict proof chain",
      ready: recommendedPrivateEditOperatorProofCommand === "npm run release:private-edit-strict-proof",
      currentState: `recommended operator proof chain ${recommendedPrivateEditOperatorProofCommand}`,
      operatorAction: `Run ${recommendedPrivateEditOperatorProofCommand} after private release-channel metadata edits.`,
      expectedPostEditSignal: "strict live-check, post-edit proof, progress refresh, and hard-gate boundary evidence are refreshed without recording values",
      command: recommendedPrivateEditOperatorProofCommand,
      proofCommand: recommendedPrivateEditOperatorProofCommand,
      rerunCommand: blockerRefreshCommand,
      sourceField: "releaseChannelRecommendedOperatorProofCommandAfterPrivateEdits",
      valueRecorded: false
    },
    {
      order: 3,
      step: "Release doctor proof",
      ready: proofCommand === "npm run release:doctor",
      currentState: `lower-level release doctor proof command ${proofCommand}`,
      operatorAction: `Run ${proofCommand} as the lower-level blocker refresh proof if the strict chain is being inspected step-by-step.`,
      expectedPostEditSignal: "release doctor reports release-channel focus current action ready or advances to the next proof target",
      command: proofCommand,
      proofCommand,
      rerunCommand: blockerRefreshCommand,
      sourceField: "currentNextCommand/releaseChannelPostEditReceiptProofCommand",
      valueRecorded: false
    },
    {
      order: 4,
      step: "Current blocker refresh",
      ready: blockerRefreshCommand === "npm run release:current-blocker",
      currentState: `current blocker refresh command ${blockerRefreshCommand}`,
      operatorAction: `Run ${blockerRefreshCommand} after ${recommendedPrivateEditOperatorProofCommand}.`,
      expectedPostEditSignal: "current blocker no longer reports four release-channel metadata placeholders",
      command: blockerRefreshCommand,
      proofCommand,
      rerunCommand: blockerRefreshCommand,
      sourceField: "currentRerunCommand/currentCommandSequence",
      valueRecorded: false
    },
    {
      order: 5,
      step: "Next-actions refresh",
      ready: nextActionsRefreshCommand === "npm run release:next-actions",
      currentState: `next-actions refresh command ${nextActionsRefreshCommand}`,
      operatorAction: `Run ${nextActionsRefreshCommand} after the current blocker advances.`,
      expectedPostEditSignal: "next priority action appears after release-channel metadata clears",
      command: nextActionsRefreshCommand,
      proofCommand,
      rerunCommand: blockerRefreshCommand,
      sourceField: "nextActionsCommand/nextPriorityActionId",
      valueRecorded: false
    },
    {
      order: 6,
      step: "Hard-gate boundary",
      ready: hardExternalGateCommand === "npm run release:external-check",
      currentState: `hard gate remains ${hardExternalGateCommand}`,
      operatorAction: "Keep the hard external distribution gate separate until downstream proofs are ready.",
      expectedPostEditSignal: "external distribution remains unclaimed until the hard gate passes",
      command: hardExternalGateCommand,
      proofCommand: hardExternalGateCommand,
      rerunCommand: blockerRefreshCommand,
      sourceField: "hardExternalGateCommand/releaseGateClaimedExternalDistribution",
      valueRecorded: false
    },
    {
      order: 7,
      step: "Value redaction",
      ready:
        releaseChannelPostEditReceipt.releaseChannelPostEditReceiptReady === true &&
        releaseChannelPostEditReceipt.releaseChannelPostEditReceiptValueRecorded === false &&
        postEditRows.length === 6,
      currentState: `${postEditRows.length} post-edit receipt rows; values recorded no`,
      operatorAction: "Check receipts for readiness, counts, commands, and source fields only.",
      expectedPostEditSignal: "private URL/channel values never appear in Markdown, JSON, or console output",
      command: nextActionsRefreshCommand,
      proofCommand,
      rerunCommand: blockerRefreshCommand,
      sourceField: "releaseChannelPostEditReceiptRows/releaseChannelPostEditReceiptValueRecorded",
      valueRecorded: false
    }
  ];

  return {
    releaseChannelPostEditOperatorReceiptReady: rows.length === 7 && rows.every((row) => row.ready === true && row.valueRecorded === false),
    releaseChannelPostEditOperatorReceiptRowCount: rows.length,
    releaseChannelPostEditOperatorReceiptSummary: `${rows.length} value-free release-channel post-edit operator receipt rows`,
    releaseChannelPostEditOperatorReceiptRows: rows,
    releaseChannelPostEditOperatorReceiptRecommendedProofCommand: recommendedPrivateEditOperatorProofCommand,
    releaseChannelPostEditOperatorReceiptRecommendedProofCommandRole:
      "recommended strict-first proof chain after replacing the four private release-channel placeholders",
    releaseChannelPostEditOperatorReceiptRecommendedProofCommandValueRecorded: false,
    releaseChannelPostEditOperatorReceiptProofCommand: proofCommand,
    releaseChannelPostEditOperatorReceiptBlockerRefreshCommand: blockerRefreshCommand,
    releaseChannelPostEditOperatorReceiptNextActionsCommand: nextActionsRefreshCommand,
    releaseChannelPostEditOperatorReceiptHardGateCommand: hardExternalGateCommand,
    releaseChannelPostEditOperatorReceiptValueRecorded: false
  };
}

function buildPostEditProofSequenceReceiptSummary({
  currentActionSummary = {},
  releaseChannelPostEditOperatorReceipt = {},
  hardExternalGateCommand = "npm run release:external-check"
} = {}) {
  const textOrFallback = (value, fallback) => (typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback);
  const envEditTarget = textOrFallback(currentActionSummary.currentEnvEditTarget, currentLocalEnvEditTarget());
  const placeholderKeyCount = Number.isInteger(currentActionSummary.currentPlaceholderKeyCount)
    ? currentActionSummary.currentPlaceholderKeyCount
    : 0;
  const doctorCommand = textOrFallback(releaseChannelPostEditOperatorReceipt.releaseChannelPostEditOperatorReceiptProofCommand, "npm run release:doctor");
  const currentBlockerCommand = textOrFallback(
    releaseChannelPostEditOperatorReceipt.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand,
    "npm run release:current-blocker"
  );
  const nextActionsCommand = textOrFallback(
    releaseChannelPostEditOperatorReceipt.releaseChannelPostEditOperatorReceiptNextActionsCommand,
    "npm run release:next-actions"
  );
  const proofBundleCommand = "npm run release:proof-bundle";
  const progressCommand = "npm run release:progress-smoke";
  const hardGateCommand = textOrFallback(
    releaseChannelPostEditOperatorReceipt.releaseChannelPostEditOperatorReceiptHardGateCommand,
    hardExternalGateCommand
  );
  const rows = [
    {
      order: 1,
      step: "Private value edit",
      ready: envEditTarget === currentLocalEnvEditTarget() && placeholderKeyCount >= 0,
      command: `manual edit ${envEditTarget}`,
      expectedEvidence: "current release-channel placeholder key count becomes 0 after the operator-owned edit",
      sourceField: "currentEnvEditTarget/currentPlaceholderKeyCount",
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
      sourceField: "externalNextActionsJsonPath/proofBundleCommand",
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

function formatCurrentActionAcceptanceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | criterion | ready | evidence | proof command | rerun command | hard gate | value recorded |\n|---:|---|---:|---|---|---|---|---:|\n| 0 | none | no | none | none | none | none | no |";
  }
  return [
    "| order | criterion | ready | evidence | proof command | rerun command | hard gate | value recorded |",
    "|---:|---|---:|---|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.criterion)} | ${readyLabel(row.ready)} | ${escapeCell(row.evidence)} | ${escapeCell(row.proofCommand)} | ${escapeCell(row.rerunCommand)} | ${escapeCell(row.hardGateCommand)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatCurrentActionAcceptanceBlockerRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | criterion | blocker | source | operator action | proof command | rerun command | value recorded |\n|---:|---|---|---|---|---|---|---:|\n| 0 | none | none | none | none | none | none | no |";
  }
  return [
    "| order | criterion | blocker | source | operator action | proof command | rerun command | value recorded |",
    "|---:|---|---|---|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.criterion)} | ${escapeCell(row.blocker)} | ${escapeCell(row.sourceField)} | ${escapeCell(row.operatorAction)} | ${escapeCell(row.proofCommand)} | ${escapeCell(row.rerunCommand)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatCurrentActionPostEditVerificationRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | criterion | current ready | current evidence | expected signal | source | proof command | rerun command | hard gate | value recorded |\n|---:|---|---:|---|---|---|---|---|---|---:|\n| 0 | none | no | none | none | none | none | none | none | no |";
  }
  return [
    "| order | criterion | current ready | current evidence | expected signal | source | proof command | rerun command | hard gate | value recorded |",
    "|---:|---|---:|---|---|---|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.criterion)} | ${readyLabel(row.currentReady)} | ${escapeCell(row.currentEvidence)} | ${escapeCell(row.expectedSignal)} | ${escapeCell(row.sourceField)} | ${escapeCell(row.proofCommand)} | ${escapeCell(row.rerunCommand)} | ${escapeCell(row.hardGateCommand)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatCurrentActionHandoffRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | item | source | evidence | blockers | acceptance blockers | proof command | rerun command | hard gate | value recorded |\n|---:|---|---|---|---:|---:|---|---|---|---:|\n| 0 | none | none | none | 0 | 0 | none | none | none | no |";
  }
  return [
    "| order | item | source | evidence | blockers | acceptance blockers | proof command | rerun command | hard gate | value recorded |",
    "|---:|---|---|---|---:|---:|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.item)} | ${escapeCell(row.sourceField)} | ${escapeCell(row.evidence)} | ${row.blockerCount} | ${row.acceptanceBlockerCount} | ${escapeCell(row.proofCommand)} | ${escapeCell(row.rerunCommand)} | ${escapeCell(row.hardGateCommand)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatCurrentPrivateEditSafetyRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | ready | check | evidence | command | value recorded |\n|---:|---:|---|---|---|---:|\n| 0 | no | none | none | none | no |";
  }
  return [
    "| order | ready | check | evidence | command | value recorded |",
    "|---:|---:|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${readyLabel(row.ready)} | ${escapeCell(row.check)} | ${escapeCell(row.evidence)} | ${escapeCell(row.command)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatCurrentInputShapeChecklistRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | key | ready | expected shape | evidence source | proof command | rerun command | value recorded |\n|---:|---|---:|---|---|---|---|---:|\n| 0 | none | no | none | none | none | none | no |";
  }
  return [
    "| order | key | ready | expected shape | evidence source | proof command | rerun command | value recorded |",
    "|---:|---|---:|---|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.key)} | ${readyLabel(row.ready)} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.evidenceSource)} | ${escapeCell(row.proofCommand)} | ${escapeCell(row.rerunCommand)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatCurrentLocalEnvDiagnosticRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | diagnostic | status | evidence | source | value recorded |\n|---:|---|---|---|---|---:|\n| 0 | none | none | none | none | no |";
  }
  return [
    "| order | diagnostic | status | evidence | source | value recorded |",
    "|---:|---|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.diagnostic)} | ${escapeCell(row.status)} | ${escapeCell(row.evidence)} | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatReleaseChannelPostEditReceiptRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | item | receipt ready | current ready | evidence | expected post-edit signal | proof command | rerun command | source | value recorded |\n|---:|---|---:|---:|---|---|---|---|---|---:|\n| 0 | none | no | no | none | none | none | none | none | no |";
  }
  return [
    "| order | item | receipt ready | current ready | evidence | expected post-edit signal | proof command | rerun command | source | value recorded |",
    "|---:|---|---:|---:|---|---|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.item)} | ${readyLabel(row.ready)} | ${readyLabel(row.currentReady)} | ${escapeCell(row.evidence)} | ${escapeCell(row.expectedPostEditSignal)} | ${escapeCell(row.proofCommand)} | ${escapeCell(row.rerunCommand)} | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatReleaseChannelPostEditOperatorReceiptRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | step | ready | current state | operator action | expected post-edit signal | command | proof command | rerun command | source | value recorded |\n|---:|---|---:|---|---|---|---|---|---|---|---:|\n| 0 | none | no | none | none | none | none | none | none | none | no |";
  }
  return [
    "| order | step | ready | current state | operator action | expected post-edit signal | command | proof command | rerun command | source | value recorded |",
    "|---:|---|---:|---|---|---|---|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.step)} | ${readyLabel(row.ready)} | ${escapeCell(row.currentState)} | ${escapeCell(row.operatorAction)} | ${escapeCell(row.expectedPostEditSignal)} | ${escapeCell(row.command)} | ${escapeCell(row.proofCommand)} | ${escapeCell(row.rerunCommand)} | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatPostEditProofSequenceReceiptRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | step | ready | command | expected evidence | source | value recorded |\n|---:|---|---:|---|---|---|---:|\n| 0 | none | no | none | none | none | no |";
  }
  return [
    "| order | step | ready | command | expected evidence | source | value recorded |",
    "|---:|---|---:|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.step)} | ${readyLabel(row.ready)} | ${escapeCell(row.command)} | ${escapeCell(row.expectedEvidence)} | ${escapeCell(row.sourceField)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function nextActionReadyCriteriaSourceField(criterion) {
  const lower = String(criterion ?? "").toLowerCase();
  if (lower.includes("update feed config")) {
    return "externalNextActions.priorityActions[1].readyCriteria/updateFeedConfig";
  }
  if (lower.includes("auto-update readiness")) {
    return "externalNextActions.priorityActions[1].readyCriteria/autoUpdateReadiness";
  }
  if (lower.includes("signed") && lower.includes("notarized")) {
    return "externalNextActions.priorityActions[1].readyCriteria/updateMetadataArtifacts";
  }
  return "externalNextActions.priorityActions[1].readyCriteria";
}

function nextActionExpectedSignal(criterion) {
  const lower = String(criterion ?? "").toLowerCase();
  if (lower.includes("update feed config")) {
    return "one safe feed URL key ready; one valid update channel key ready; value recorded no";
  }
  if (lower.includes("auto-update readiness")) {
    return "auto-update readiness ready yes; provider/feed/channel metadata ready; value recorded no";
  }
  if (lower.includes("signed") && lower.includes("notarized")) {
    return "signed/notarized update metadata artifacts ready after Developer ID, notarization, and Gatekeeper evidence; value recorded no";
  }
  return "next action ready signal present; value recorded no";
}

function nextActionCurrentEvidenceForCriterion(criterion, blockers) {
  const lower = String(criterion ?? "").toLowerCase();
  if (lower.includes("update feed config")) {
    return blockers.find((blocker) => /provider, feed url, and channel metadata/i.test(blocker)) ?? "none";
  }
  if (lower.includes("auto-update readiness")) {
    return blockers.find((blocker) => /auto-update readiness is not complete/i.test(blocker)) ?? "none";
  }
  if (lower.includes("signed") && lower.includes("notarized")) {
    return blockers.find((blocker) => /signed\/notarized update metadata artifacts/i.test(blocker)) ?? "none";
  }
  return blockers.length > 0 ? blockers.join("; ") : "none";
}

function buildNextActionPreviewSummary(priorityActions = []) {
  const nextAction = Array.isArray(priorityActions) ? priorityActions[1] : null;
  if (!nextAction) {
    return {
      nextPriorityActionId: "none",
      nextPriorityActionLabel: "none",
      nextPriorityActionNextCommand: "none",
      nextPriorityActionFirstBlocker: "none",
      nextActionPreviewReady: true,
      nextActionPreviewId: "none",
      nextActionPreviewLabel: "none",
      nextActionPreviewProofCommand: "none",
      nextActionPreviewFirstBlocker: "none",
      nextActionPreviewRerunCommandCount: 0,
      nextActionPreviewRerunCommandSummary: "none",
      nextActionPreviewRerunCommands: [],
      nextActionPreviewRequiredKeyCount: 0,
      nextActionPreviewRequiredKeySummary: "none",
      nextActionPreviewRequiredKeys: [],
      nextActionPreviewPlaceholderKeyCount: 0,
      nextActionPreviewPlaceholderKeySummary: "none",
      nextActionPreviewPlaceholderKeys: [],
      nextActionPreviewReadyCriteriaRowCount: 0,
      nextActionPreviewReadyCriteriaSummary: "none",
      nextActionPreviewReadyCriteriaRows: [],
      nextActionPreviewChecklistRowCount: 0,
      nextActionPreviewChecklistSummary: "none",
      nextActionPreviewChecklistRows: [],
      nextActionPreviewEvidenceRowCount: 0,
      nextActionPreviewEvidenceSummary: "none",
      nextActionPreviewEvidenceRows: [],
      nextActionPreviewBlockerRowCount: 0,
      nextActionPreviewBlockerSummary: "none",
      nextActionPreviewBlockerRows: [],
      nextActionPreviewVerificationRowCount: 0,
      nextActionPreviewVerificationSummary: "none",
      nextActionPreviewVerificationRows: [],
      nextActionPreviewPrerequisiteCommandRowCount: 0,
      nextActionPreviewPrerequisiteCommandSummary: "none",
      nextActionPreviewPrerequisiteCommandRows: [],
      nextActionPreviewOperatorActionRowCount: 0,
      nextActionPreviewOperatorActionSummary: "none",
      nextActionPreviewOperatorActionRows: [],
      nextActionPreviewEnvEditRowCount: 0,
      nextActionPreviewEnvEditSummary: "none",
      nextActionPreviewEnvEditRows: []
    };
  }

  const proofCommand = typeof nextAction.nextCommand === "string" && nextAction.nextCommand.length > 0
    ? nextAction.nextCommand
    : "npm run release:external-check";
  const blockers = Array.isArray(nextAction.blockers) ? unique(nextAction.blockers) : [];
  const readyCriteria = Array.isArray(nextAction.readyCriteria) ? unique(nextAction.readyCriteria) : [];
  const checklist = Array.isArray(nextAction.actionChecklist) ? unique(nextAction.actionChecklist) : [];
  const prerequisiteCommands = Array.isArray(nextAction.prerequisiteCommands) ? unique(nextAction.prerequisiteCommands) : [];
  const operatorActions = Array.isArray(nextAction.operatorActions) ? unique(nextAction.operatorActions) : [];
  const rerunCommands = Array.isArray(nextAction.rerunCommands) ? unique(nextAction.rerunCommands) : [];
  const requiredKeys = Array.isArray(nextAction.requiredKeys) ? unique(nextAction.requiredKeys) : [];
  const placeholderKeys = Array.isArray(nextAction.placeholderKeys) ? unique(nextAction.placeholderKeys) : [];
  const evidenceRows = valueFreeObjectRows(nextAction.evidence).map((row) => ({
    label: row.label ?? "Evidence",
    path: row.path ?? "unknown",
    present: row.present === true,
    valueRecorded: false
  }));
  const readyCriteriaRows = readyCriteria.map((criterion, index) => ({
    order: index + 1,
    criterion,
    sourceField: nextActionReadyCriteriaSourceField(criterion),
    proofCommand,
    blocker: nextAction.firstBlocker ?? "none",
    valueRecorded: false
  }));
  const checklistRows = checklist.map((step, index) => ({
    order: index + 1,
    step,
    proofCommand,
    valueRecorded: false
  }));
  const blockerRows = blockers.map((blocker, index) => ({
    order: index + 1,
    blocker,
    sourceField: "externalNextActions.priorityActions[1].blockers",
    proofCommand,
    valueRecorded: false
  }));
  const currentReady = nextAction.ready === true && blockers.length === 0;
  const verificationRows = readyCriteria.map((criterion, index) => ({
    order: index + 1,
    criterion,
    currentReady,
    currentEvidence: nextActionCurrentEvidenceForCriterion(criterion, blockers),
    expectedSignal: nextActionExpectedSignal(criterion),
    sourceField: "externalNextActions.priorityActions[1].readyCriteria/blockers",
    proofCommand,
    valueRecorded: false
  }));
  const prerequisiteCommandRows = prerequisiteCommands.map((command, index) => ({
    order: index + 1,
    command,
    sourceField: "externalNextActions.priorityActions[1].prerequisiteCommands",
    proofCommand,
    valueRecorded: false
  }));
  const operatorActionRows = operatorActions.map((action, index) => ({
    order: index + 1,
    action,
    sourceField: "externalNextActions.priorityActions[1].operatorActions",
    proofCommand,
    valueRecorded: false
  }));
  const envEditRows = valueFreeObjectRows(nextAction.envEditRows).map((row, index) => ({
    order: index + 1,
    key: row.key ?? "unknown",
    location: row.location ?? (row.file && row.line ? `${row.file}:${row.line}` : row.editTarget ?? "none"),
    assignment: row.assignment ?? "none",
    guidance: row.guidance ?? "none",
    placeholder: row.placeholder === true,
    sourceField: "externalNextActions.priorityActions[1].envEditRows",
    proofCommand,
    valueRecorded: false
  }));
  const nextActionPreviewReady =
    readyCriteriaRows.length === readyCriteria.length &&
    checklistRows.length === checklist.length &&
    blockerRows.length === blockers.length &&
    verificationRows.length === readyCriteria.length &&
    prerequisiteCommandRows.length === prerequisiteCommands.length &&
    operatorActionRows.length === operatorActions.length &&
    envEditRows.length === valueFreeObjectRows(nextAction.envEditRows).length &&
    readyCriteriaRows.length > 0 &&
    checklistRows.length > 0 &&
    blockerRows.length > 0 &&
    verificationRows.length > 0 &&
    prerequisiteCommandRows.length > 0 &&
    operatorActionRows.length > 0 &&
    envEditRows.length > 0 &&
    readyCriteriaRows.every((row) => row.valueRecorded === false && row.proofCommand === proofCommand) &&
    checklistRows.every((row) => row.valueRecorded === false && row.proofCommand === proofCommand) &&
    evidenceRows.every((row) => row.valueRecorded === false) &&
    blockerRows.every((row) => row.valueRecorded === false && row.proofCommand === proofCommand) &&
    verificationRows.every((row) => row.valueRecorded === false && row.proofCommand === proofCommand) &&
    prerequisiteCommandRows.every((row) => row.valueRecorded === false && row.proofCommand === proofCommand) &&
    operatorActionRows.every((row) => row.valueRecorded === false && row.proofCommand === proofCommand) &&
    envEditRows.every((row) => row.valueRecorded === false && row.proofCommand === proofCommand);

  return {
    nextPriorityActionId: nextAction.id ?? "none",
    nextPriorityActionLabel: nextAction.label ?? "none",
    nextPriorityActionNextCommand: proofCommand,
    nextPriorityActionFirstBlocker: nextAction.firstBlocker ?? "none",
    nextActionPreviewReady,
    nextActionPreviewId: nextAction.id ?? "none",
    nextActionPreviewLabel: nextAction.label ?? "none",
    nextActionPreviewProofCommand: proofCommand,
    nextActionPreviewFirstBlocker: nextAction.firstBlocker ?? "none",
    nextActionPreviewRerunCommandCount: rerunCommands.length,
    nextActionPreviewRerunCommandSummary: formatCommandSummary(rerunCommands),
    nextActionPreviewRerunCommands: rerunCommands,
    nextActionPreviewRequiredKeyCount: requiredKeys.length,
    nextActionPreviewRequiredKeySummary: requiredKeys.length > 0 ? requiredKeys.join(", ") : "none",
    nextActionPreviewRequiredKeys: requiredKeys,
    nextActionPreviewPlaceholderKeyCount: placeholderKeys.length,
    nextActionPreviewPlaceholderKeySummary: placeholderKeys.length > 0 ? placeholderKeys.join(", ") : "none",
    nextActionPreviewPlaceholderKeys: placeholderKeys,
    nextActionPreviewReadyCriteriaRowCount: readyCriteriaRows.length,
    nextActionPreviewReadyCriteriaSummary: readyCriteriaRows.length > 0 ? `${readyCriteriaRows.length} value-free next action ready criteria rows` : "none",
    nextActionPreviewReadyCriteriaRows: readyCriteriaRows,
    nextActionPreviewChecklistRowCount: checklistRows.length,
    nextActionPreviewChecklistSummary: checklistRows.length > 0 ? `${checklistRows.length} value-free next action checklist rows` : "none",
    nextActionPreviewChecklistRows: checklistRows,
    nextActionPreviewEvidenceRowCount: evidenceRows.length,
    nextActionPreviewEvidenceSummary: evidenceRows.length > 0 ? `${evidenceRows.length} value-free next action evidence rows` : "none",
    nextActionPreviewEvidenceRows: evidenceRows,
    nextActionPreviewBlockerRowCount: blockerRows.length,
    nextActionPreviewBlockerSummary: blockerRows.length > 0 ? `${blockerRows.length} value-free next action blocker rows` : "none",
    nextActionPreviewBlockerRows: blockerRows,
    nextActionPreviewVerificationRowCount: verificationRows.length,
    nextActionPreviewVerificationSummary: verificationRows.length > 0 ? `${verificationRows.length} value-free next action verification rows` : "none",
    nextActionPreviewVerificationRows: verificationRows,
    nextActionPreviewPrerequisiteCommandRowCount: prerequisiteCommandRows.length,
    nextActionPreviewPrerequisiteCommandSummary: prerequisiteCommandRows.length > 0 ? `${prerequisiteCommandRows.length} value-free next action prerequisite command rows` : "none",
    nextActionPreviewPrerequisiteCommandRows: prerequisiteCommandRows,
    nextActionPreviewOperatorActionRowCount: operatorActionRows.length,
    nextActionPreviewOperatorActionSummary: operatorActionRows.length > 0 ? `${operatorActionRows.length} value-free next action operator action rows` : "none",
    nextActionPreviewOperatorActionRows: operatorActionRows,
    nextActionPreviewEnvEditRowCount: envEditRows.length,
    nextActionPreviewEnvEditSummary: envEditRows.length > 0 ? `${envEditRows.length} value-free next action env edit rows` : "none",
    nextActionPreviewEnvEditRows: envEditRows
  };
}

function formatNextActionReadyCriteriaRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | criterion | source field | proof command | blocker | value recorded |\n|---:|---|---|---|---|---:|\n| 0 | none | none | none | none | no |";
  }
  return [
    "| order | criterion | source field | proof command | blocker | value recorded |",
    "|---:|---|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.criterion)} | ${escapeCell(row.sourceField)} | ${escapeCell(row.proofCommand)} | ${escapeCell(row.blocker)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatNextActionChecklistRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | step | proof command | value recorded |\n|---:|---|---|---:|\n| 0 | none | none | no |";
  }
  return [
    "| order | step | proof command | value recorded |",
    "|---:|---|---|---:|",
    ...rows.map((row) => `| ${row.order} | ${escapeCell(row.step)} | ${escapeCell(row.proofCommand)} | ${readyLabel(row.valueRecorded)} |`)
  ].join("\n");
}

function formatNextActionEvidenceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| label | path | present | value recorded |\n|---|---|---:|---:|\n| none | none | no | no |";
  }
  return [
    "| label | path | present | value recorded |",
    "|---|---|---:|---:|",
    ...rows.map((row) => `| ${escapeCell(row.label)} | ${escapeCell(row.path)} | ${readyLabel(row.present)} | ${readyLabel(row.valueRecorded)} |`)
  ].join("\n");
}

function formatNextActionBlockerRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | blocker | source field | proof command | value recorded |\n|---:|---|---|---|---:|\n| 0 | none | none | none | no |";
  }
  return [
    "| order | blocker | source field | proof command | value recorded |",
    "|---:|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.blocker)} | ${escapeCell(row.sourceField)} | ${escapeCell(row.proofCommand)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatNextActionVerificationRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | currently ready | criterion | current evidence | expected signal | proof command | value recorded |\n|---:|---:|---|---|---|---|---:|\n| 0 | no | none | none | none | none | no |";
  }
  return [
    "| order | currently ready | criterion | current evidence | expected signal | proof command | value recorded |",
    "|---:|---:|---|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${readyLabel(row.currentReady)} | ${escapeCell(row.criterion)} | ${escapeCell(row.currentEvidence)} | ${escapeCell(row.expectedSignal)} | ${escapeCell(row.proofCommand)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatNextActionPrerequisiteCommandRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | command | source field | proof command | value recorded |\n|---:|---|---|---|---:|\n| 0 | none | none | none | no |";
  }
  return [
    "| order | command | source field | proof command | value recorded |",
    "|---:|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.command)} | ${escapeCell(row.sourceField)} | ${escapeCell(row.proofCommand)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatNextActionOperatorActionRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | action | source field | proof command | value recorded |\n|---:|---|---|---|---:|\n| 0 | none | none | none | no |";
  }
  return [
    "| order | action | source field | proof command | value recorded |",
    "|---:|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.action)} | ${escapeCell(row.sourceField)} | ${escapeCell(row.proofCommand)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatNextActionEnvEditRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| order | location | key | assignment shape | guidance | proof command | value recorded |\n|---:|---|---|---|---|---|---:|\n| 0 | none | none | none | none | none | no |";
  }
  return [
    "| order | location | key | assignment shape | guidance | proof command | value recorded |",
    "|---:|---|---|---|---|---|---:|",
    ...rows.map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.location)} | ${escapeCell(row.key)} | ${escapeCell(row.assignment)} | ${escapeCell(row.guidance)} | ${escapeCell(row.proofCommand)} | ${readyLabel(row.valueRecorded)} |`
    )
  ].join("\n");
}

function formatChecklistList(items) {
  return Array.isArray(items) && items.length > 0 ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : "1. None.";
}

function formatCommandSummary(commands) {
  return Array.isArray(commands) && commands.length > 0 ? commands.join(", ") : "none";
}

function buildCurrentCommandSequence({ prerequisiteCommands = [], nextCommand = "", rerunCommands = [] } = {}) {
  return unique([prerequisiteCommands, nextCommand, rerunCommands]).filter((command) => command !== "none");
}

function formatCommandList(commands) {
  return Array.isArray(commands) && commands.length > 0 ? commands.map((command, index) => `${index + 1}. \`${command}\``).join("\n") : "1. None.";
}

function buildActionChecklist(action, context = {}) {
  const rerunCommand = firstValue(action.rerunCommands ?? []) || action.nextCommand;
  if (context.shouldPrepareEnv) {
    return [
      `Run \`npm run release:prepare-env\` to create the ignored local env scaffold at ${context.localEnvEditTarget}.`,
      "Keep real release values out of committed files.",
      `Rerun \`${rerunCommand}\` after the scaffold exists.`
    ];
  }
  if (context.shouldReplacePlaceholders) {
    const locationSummary = formatEditLocationSummary(action.placeholderEditLocations);
    return [
      `Edit current placeholder keys at ${locationSummary}.`,
      "Replace only the listed current-action placeholders in the ignored local env file first.",
      "Follow the current value-free key guidance for allowed channel and safe HTTPS URL constraints.",
      `Rerun \`${rerunCommand}\` after editing.`,
      "Continue only when the current ready criteria pass in redacted evidence."
    ];
  }
  return [
    "Follow this priority action's operator actions without recording private values.",
    `Rerun \`${action.nextCommand}\` and check whether this action leaves the priority list.`
  ];
}

function sensitiveEnvironmentValues() {
  return sensitivePrivateKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function buildPriorityActions(remediation, context = {}) {
  const localEnvFileLoaded = context.localEnvFileLoaded === true;
  const localEnvPlaceholderKeys = Array.isArray(context.localEnvPlaceholderKeys) ? context.localEnvPlaceholderKeys : [];
  const localEnvPlaceholderKeySet = new Set(localEnvPlaceholderKeys);
  const localEnvPlaceholderKeyCount = Number.isInteger(context.localEnvPlaceholderKeyCount)
    ? context.localEnvPlaceholderKeyCount
    : localEnvPlaceholderKeys.length;
  const localEnvPlaceholderLocations = Array.isArray(context.localEnvPlaceholderLocations) ? context.localEnvPlaceholderLocations : [];
  const localEnvEditTarget = context.localEnvEditTarget ?? currentLocalEnvEditTarget();
  return (remediation.remediationGroups ?? [])
    .filter((group) => group.ready !== true)
    .map((group, index) => {
      const requiredKeys = group.requiredKeys ?? [];
      const placeholderKeys = requiredKeys.filter((key) => localEnvPlaceholderKeySet.has(key));
      const placeholderEditLocations = localEnvPlaceholderLocations.filter((item) => placeholderKeys.includes(item.key));
      const keyGuidance = guidanceForKeys(requiredKeys);
      const envEditTemplate = buildEnvEditTemplate(requiredKeys);
      const envEditRows = buildEnvEditRows({ envEditTemplate, placeholderEditLocations, placeholderKeys, localEnvEditTarget });
      const shouldPrepareEnv = group.id === "release-channel-metadata" && !localEnvFileLoaded;
      const shouldReplacePlaceholders = group.id === "release-channel-metadata" && localEnvFileLoaded && placeholderKeys.length > 0;
      const prerequisiteCommands = shouldPrepareEnv
        ? unique(["npm run release:prepare-env", group.prerequisiteCommands ?? []])
        : group.prerequisiteCommands ?? [];
      const operatorActions = shouldPrepareEnv
        ? unique([
            `Run the explicit prepare-env command to create the ignored local distribution env scaffold at ${localEnvEditTarget} before validating private inputs.`,
            group.operatorActions ?? []
          ])
        : shouldReplacePlaceholders
          ? unique([
              `Replace placeholder values in ${localEnvEditTarget} for the current release-channel keys (${placeholderKeys.length}): ${placeholderKeys.join(", ")}.`,
              `The full local env still has ${localEnvPlaceholderKeyCount} placeholder keys across all external distribution groups.`,
              "Keep those private values out of committed files and generated reports.",
              group.operatorActions ?? []
            ])
        : group.operatorActions ?? [];
      const rerunCommands = shouldReplacePlaceholders
        ? unique(["npm run release:current-blocker", "npm run release:doctor", group.rerunCommands ?? []])
        : group.rerunCommands ?? [];
      const placeholderBlocker = shouldReplacePlaceholders
        ? `Current action still contains ${placeholderKeys.length} placeholder keys for required release-channel metadata.`
        : "";
      const missingLocalEnvBlocker = shouldPrepareEnv ? "Ignored local distribution env file is not loaded." : "";
      const readyCriteria = readyCriteriaForAction(group);
      const action = {
        order: index + 1,
        id: group.id,
        label: group.label,
        ready: false,
        requiredKeys,
        placeholderKeys,
        placeholderEditLocations,
        keyGuidance,
        envEditTemplate,
        envEditRows,
        readyCriteria,
        evidence: buildEvidenceRows(group.evidence ?? []),
        prerequisiteCommands,
        operatorActions,
        rerunCommands,
        nextCommand: shouldPrepareEnv
          ? "npm run release:prepare-env"
          : shouldReplacePlaceholders
            ? "npm run release:doctor"
            : firstValue(rerunCommands) || "npm run release:external-preflight",
        firstBlocker: missingLocalEnvBlocker || placeholderBlocker || firstValue(group.blockers ?? []),
        blockers: unique([missingLocalEnvBlocker, placeholderBlocker, group.blockers ?? []]),
        valueRecorded: false
      };
      action.actionChecklist = buildActionChecklist(action, { shouldPrepareEnv, shouldReplacePlaceholders, localEnvEditTarget });
      return action;
    });
}

function buildCurrentActionSummary(priorityActions, fallback = {}) {
  const currentAction = Array.isArray(priorityActions) ? priorityActions[0] : null;
  const currentRequiredKeys = currentAction?.requiredKeys ?? fallback.requiredKeys ?? [];
  const currentPlaceholderKeys = currentAction?.placeholderKeys ?? fallback.placeholderKeys ?? [];
  const currentPlaceholderEditLocations = currentAction?.placeholderEditLocations ?? fallback.placeholderEditLocations ?? [];
  const currentEnvKeyGuidance = currentAction?.keyGuidance ?? fallback.keyGuidance ?? guidanceForKeys(currentRequiredKeys);
  const currentEnvEditTemplate = currentAction?.envEditTemplate ?? fallback.envEditTemplate ?? buildEnvEditTemplate(currentRequiredKeys);
  const currentEnvEditRows =
    currentAction?.envEditRows ??
    fallback.envEditRows ??
    buildEnvEditRows({
      envEditTemplate: currentEnvEditTemplate,
      placeholderEditLocations: currentPlaceholderEditLocations,
      placeholderKeys: currentPlaceholderKeys,
      localEnvEditTarget: fallback.currentEnvEditTarget ?? currentLocalEnvEditTarget()
    });
  const currentEvidenceRows = currentAction?.evidence ?? fallback.evidence ?? [];
  const currentEvidenceLabels = buildEvidenceLabels(currentEvidenceRows);
  const currentReadyCriteria = currentAction?.readyCriteria ?? fallback.readyCriteria ?? readyCriteriaForAction(fallback);
  const currentActionChecklist = currentAction?.actionChecklist ?? fallback.actionChecklist ?? [];
  const currentPrerequisiteCommands = currentAction?.prerequisiteCommands ?? [];
  const currentOperatorActions = currentAction?.operatorActions ?? [];
  const currentRerunCommands = currentAction?.rerunCommands ?? [];
  const currentNextCommand = currentAction?.nextCommand ?? fallback.nextCommand ?? "npm run release:external-check";
  const currentCommandSequence = buildCurrentCommandSequence({
    prerequisiteCommands: currentPrerequisiteCommands,
    nextCommand: currentNextCommand,
    rerunCommands: currentRerunCommands
  });
  return {
    currentActionId: currentAction?.id ?? fallback.id ?? "none",
    currentActionLabel: currentAction?.label ?? fallback.label ?? "No pending priority action",
    currentNextCommand,
    currentFirstBlocker: currentAction?.firstBlocker || fallback.firstBlocker || "none",
    currentRequiredKeyCount: currentRequiredKeys.length,
    currentRequiredKeySummary: currentRequiredKeys.length > 0 ? currentRequiredKeys.join(", ") : "none",
    currentRequiredKeys,
    currentPlaceholderKeyCount: currentPlaceholderKeys.length,
    currentPlaceholderKeySummary: currentPlaceholderKeys.length > 0 ? currentPlaceholderKeys.join(", ") : "none",
    currentPlaceholderKeys,
    currentPlaceholderEditLocationCount: currentPlaceholderEditLocations.length,
    currentPlaceholderEditLocationSummary: formatEditLocationSummary(currentPlaceholderEditLocations),
    currentPlaceholderEditLocations,
    currentEnvKeyGuidanceCount: currentEnvKeyGuidance.length,
    currentEnvKeyGuidanceSummary: currentEnvKeyGuidance.length > 0 ? `${currentEnvKeyGuidance.length} keys with value-free guidance` : "none",
    currentEnvKeyGuidance,
    currentEnvEditTemplateCount: currentEnvEditTemplate.length,
    currentEnvEditTemplateSummary: formatEnvEditTemplateSummary(currentEnvEditTemplate),
    currentEnvEditTemplate,
    currentEnvEditRowsCount: currentEnvEditRows.length,
    currentEnvEditRowsSummary: formatEnvEditRowsSummary(currentEnvEditRows),
    currentEnvEditRows,
    currentEvidenceRowsCount: currentEvidenceRows.length,
    currentEvidenceRowsSummary: formatEvidenceRowsSummary(currentEvidenceRows),
    currentEvidenceRows,
    currentEvidenceLabelCount: currentEvidenceLabels.length,
    currentEvidenceLabelSummary: formatEvidenceLabelSummary(currentEvidenceRows),
    currentEvidenceLabels,
    currentReadyCriteriaCount: currentReadyCriteria.length,
    currentReadyCriteriaSummary: currentReadyCriteria.length > 0 ? `${currentReadyCriteria.length} value-free ready criteria` : "none",
    currentReadyCriteria,
    currentActionChecklistCount: currentActionChecklist.length,
    currentActionChecklistSummary: currentActionChecklist.length > 0 ? `${currentActionChecklist.length} value-free steps` : "none",
    currentActionChecklist,
    currentPrerequisiteCommandCount: currentPrerequisiteCommands.length,
    currentPrerequisiteCommandSummary: formatCommandSummary(currentPrerequisiteCommands),
    currentPrerequisiteCommand: firstValue(currentPrerequisiteCommands) || fallback.prerequisiteCommand || "none",
    currentOperatorAction: firstValue(currentOperatorActions) || fallback.operatorAction || "none",
    currentRerunCommandCount: currentRerunCommands.length,
    currentRerunCommandSummary: formatCommandSummary(currentRerunCommands),
    currentRerunCommand: firstValue(currentRerunCommands) || fallback.rerunCommand || "none",
    currentPrerequisiteCommands,
    currentOperatorActions,
    currentRerunCommands,
    currentCommandSequenceCount: currentCommandSequence.length,
    currentCommandSequenceSummary: formatCommandSummary(currentCommandSequence),
    currentCommandSequence,
    currentActionValueRecorded: false
  };
}

function buildCompletionGapSummary({
  sourceEvidenceReady = false,
  completionStage = "unknown",
  currentActionLabel = "No pending priority action",
  currentNextCommand = "npm run release:external-check",
  currentFirstBlocker = "none",
  currentEvidenceLabelSummary = "none",
  currentReadyCriteriaSummary = "none",
  currentActionChecklistSummary = "none",
  externalDistributionReady = false,
  externalDistributionGateReady = false,
  hardGateWouldFail = true,
  priorityActionCount = 0,
  hardExternalGateCommand = "npm run release:external-check",
  prerequisiteCommand = "npm run release:check"
} = {}) {
  const pendingPriorityActionCount = Number.isInteger(priorityActionCount) ? priorityActionCount : 0;
  const completionGapStatus = !sourceEvidenceReady
    ? "source evidence missing"
    : pendingPriorityActionCount > 0
      ? "external proof pending"
      : externalDistributionReady && externalDistributionGateReady && hardGateWouldFail === false
        ? "hard gate evidence ready"
        : "external hard gate pending";
  const completionGapCurrentProofTarget = sourceEvidenceReady ? currentActionLabel : "Regenerate local release evidence";
  const completionGapClaimBlockers = unique([
    sourceEvidenceReady ? "" : `Regenerate source release evidence with ${prerequisiteCommand}.`,
    pendingPriorityActionCount > 0
      ? `${pendingPriorityActionCount} value-free priority action${pendingPriorityActionCount === 1 ? "" : "s"} must be resolved in redacted evidence.`
      : "",
    currentFirstBlocker !== "none" ? currentFirstBlocker : "",
    externalDistributionGateReady && hardGateWouldFail === false ? "" : `Hard external distribution gate must pass via ${hardExternalGateCommand}.`,
    "This next-actions report stays value-free and cannot itself claim release upload, signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion."
  ]);
  return {
    completionGapStatus,
    completionGapSummary: `${completionGapStatus}: ${completionGapCurrentProofTarget} is the next proof target before any external distribution completion claim.`,
    completionGapCompletionStage: completionStage,
    completionGapCurrentProofTarget,
    completionGapNextProofCommand: currentNextCommand,
    completionGapHardGateCommand: hardExternalGateCommand,
    completionGapFirstBlocker: currentFirstBlocker || "none",
    completionGapEvidenceSummary: currentEvidenceLabelSummary,
    completionGapReadyCriteriaSummary: currentReadyCriteriaSummary,
    completionGapActionChecklistSummary: currentActionChecklistSummary,
    completionGapClaimBlockerCount: completionGapClaimBlockers.length,
    completionGapClaimBlockerSummary: completionGapClaimBlockers.length > 0 ? `${completionGapClaimBlockers.length} value-free blockers` : "none",
    completionGapClaimBlockers,
    completionGapClaimedExternalDistribution: false,
    completionGapValueRecorded: false
  };
}

function stringField(source, key, fallback = "none") {
  const value = source?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function booleanField(source, key, fallback = false) {
  const value = source?.[key];
  return typeof value === "boolean" ? value : fallback;
}

function arrayField(source, key) {
  return Array.isArray(source?.[key]) ? unique(source[key]) : [];
}

function buildDoctorCompletionGapSummary(releaseDoctor = null, fallback = {}) {
  const doctorCompletionGapSourceReady = releaseDoctor !== null && typeof releaseDoctor === "object";
  const doctorCompletionGapStatus = doctorCompletionGapSourceReady
    ? stringField(releaseDoctor, "completionGapStatus", "unknown")
    : "source evidence missing";
  const doctorCompletionGapProofTarget = doctorCompletionGapSourceReady
    ? stringField(releaseDoctor, "completionGapCurrentProofTarget", fallback.currentActionLabel ?? "Regenerate local release evidence")
    : fallback.currentActionLabel ?? "Regenerate local release evidence";
  const doctorCompletionGapNextProofCommand = doctorCompletionGapSourceReady
    ? stringField(releaseDoctor, "completionGapNextProofCommand", fallback.currentNextCommand ?? "npm run release:check")
    : fallback.currentNextCommand ?? "npm run release:check";
  const doctorCompletionGapHardGateCommand = doctorCompletionGapSourceReady
    ? stringField(releaseDoctor, "completionGapHardGateCommand", fallback.hardExternalGateCommand ?? "npm run release:external-check")
    : fallback.hardExternalGateCommand ?? "npm run release:external-check";
  const doctorCompletionGapFirstBlocker = doctorCompletionGapSourceReady
    ? stringField(releaseDoctor, "completionGapFirstBlocker", fallback.currentFirstBlocker ?? "none")
    : fallback.currentFirstBlocker ?? "Release doctor source evidence is missing.";
  const doctorCompletionGapClaimBlockers = doctorCompletionGapSourceReady
    ? arrayField(releaseDoctor, "completionGapClaimBlockers")
    : unique([
        "Release doctor source evidence is missing.",
        `Regenerate source release evidence with ${fallback.prerequisiteCommand ?? "npm run release:check"}.`,
        `Hard external distribution gate must pass via ${doctorCompletionGapHardGateCommand}.`
      ]);
  return {
    doctorCompletionGapSourceArtifact: "Release doctor",
    doctorCompletionGapSourcePath: relative(releaseDoctorPath),
    doctorCompletionGapSourceReady,
    doctorCompletionGapDoctorReportReady: doctorCompletionGapSourceReady
      ? booleanField(releaseDoctor, "releaseDoctorReportReady", false)
      : false,
    doctorCompletionGapStatus,
    doctorCompletionGapSummary: doctorCompletionGapSourceReady
      ? stringField(
          releaseDoctor,
          "completionGapSummary",
          `${doctorCompletionGapStatus}: ${doctorCompletionGapProofTarget} is the next proof target before any external distribution completion claim.`
        )
      : `${doctorCompletionGapStatus}: ${doctorCompletionGapProofTarget} requires release doctor source evidence before any external distribution completion claim.`,
    doctorCompletionGapCompletionStage: doctorCompletionGapSourceReady
      ? stringField(releaseDoctor, "completionGapCompletionStage", fallback.completionStage ?? "unknown")
      : fallback.completionStage ?? "source evidence missing",
    doctorCompletionGapProofTarget,
    doctorCompletionGapNextProofCommand,
    doctorCompletionGapHardGateCommand,
    doctorCompletionGapFirstBlocker,
    doctorCompletionGapEvidenceSummary: doctorCompletionGapSourceReady
      ? stringField(releaseDoctor, "completionGapEvidenceSummary", fallback.currentEvidenceLabelSummary ?? "none")
      : fallback.currentEvidenceLabelSummary ?? "none",
    doctorCompletionGapReadyCriteriaSummary: doctorCompletionGapSourceReady
      ? stringField(releaseDoctor, "completionGapReadyCriteriaSummary", fallback.currentReadyCriteriaSummary ?? "none")
      : fallback.currentReadyCriteriaSummary ?? "none",
    doctorCompletionGapActionChecklistSummary: doctorCompletionGapSourceReady
      ? stringField(releaseDoctor, "completionGapActionChecklistSummary", fallback.currentActionChecklistSummary ?? "none")
      : fallback.currentActionChecklistSummary ?? "none",
    doctorCompletionGapClaimBlockerCount: doctorCompletionGapClaimBlockers.length,
    doctorCompletionGapClaimBlockerSummary:
      doctorCompletionGapClaimBlockers.length > 0 ? `${doctorCompletionGapClaimBlockers.length} value-free blockers` : "none",
    doctorCompletionGapClaimBlockers,
    doctorCompletionGapClaimedExternalDistribution: doctorCompletionGapSourceReady
      ? booleanField(releaseDoctor, "completionGapClaimedExternalDistribution", false)
      : false,
    doctorCompletionGapValueRecorded: doctorCompletionGapSourceReady
      ? booleanField(releaseDoctor, "completionGapValueRecorded", false)
      : false,
    doctorCompletionGapSourceValueRecorded: doctorCompletionGapSourceReady
      ? booleanField(releaseDoctor, "sourceValueRecorded", false)
      : false,
    doctorCompletionGapSourceClaimedExternalDistribution: doctorCompletionGapSourceReady
      ? booleanField(releaseDoctor, "sourceClaimedExternalDistribution", false)
      : false
  };
}

function arrayObjectField(source, key) {
  return Array.isArray(source?.[key]) ? source[key].filter((item) => item !== null && typeof item === "object") : [];
}

function valueFreeObjectRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter((item) => item !== null && typeof item === "object")
    .map((item) => ({ ...item, valueRecorded: false }));
}

function numberField(source, key, fallback = 0) {
  const value = source?.[key];
  return Number.isInteger(value) ? value : fallback;
}

function buildDoctorPrepareEnvAuditSummary(releaseDoctor = null) {
  const doctorPrepareEnvAuditSourceReady = releaseDoctor !== null && typeof releaseDoctor === "object";
  const doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeys = doctorPrepareEnvAuditSourceReady
    ? arrayField(releaseDoctor, "releasePrepareEnvExistingLocalEnvPlaceholderKeys")
    : [];
  const doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocations = doctorPrepareEnvAuditSourceReady
    ? arrayObjectField(releaseDoctor, "releasePrepareEnvExistingLocalEnvPlaceholderEditLocations")
    : [];
  const doctorPrepareEnvAuditReleaseChannelPlaceholderKeys = doctorPrepareEnvAuditSourceReady
    ? arrayField(releaseDoctor, "releasePrepareEnvExistingReleaseChannelPlaceholderKeys")
    : [];
  const doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocations = doctorPrepareEnvAuditSourceReady
    ? arrayObjectField(releaseDoctor, "releasePrepareEnvExistingReleaseChannelPlaceholderEditLocations")
    : [];
  return {
    doctorPrepareEnvAuditSourceArtifact: "Release doctor",
    doctorPrepareEnvAuditSourcePath: relative(releaseDoctorPath),
    doctorPrepareEnvAuditSourceReady,
    doctorPrepareEnvAuditDoctorReportReady: doctorPrepareEnvAuditSourceReady
      ? booleanField(releaseDoctor, "releaseDoctorReportReady", false)
      : false,
    doctorPrepareEnvAuditExistingLocalEnvFilesChecked: doctorPrepareEnvAuditSourceReady
      ? arrayField(releaseDoctor, "releasePrepareEnvExistingLocalEnvFilesChecked")
      : [],
    doctorPrepareEnvAuditExistingLocalEnvPresentFiles: doctorPrepareEnvAuditSourceReady
      ? arrayField(releaseDoctor, "releasePrepareEnvExistingLocalEnvPresentFiles")
      : [],
    doctorPrepareEnvAuditExistingLocalEnvFileLoaded: doctorPrepareEnvAuditSourceReady
      ? booleanField(releaseDoctor, "releasePrepareEnvExistingLocalEnvFileLoaded", false)
      : false,
    doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeyCount: doctorPrepareEnvAuditSourceReady
      ? numberField(releaseDoctor, "releasePrepareEnvExistingLocalEnvPlaceholderKeyCount", doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeys.length)
      : 0,
    doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeySummary: doctorPrepareEnvAuditSourceReady
      ? stringField(
          releaseDoctor,
          "releasePrepareEnvExistingLocalEnvPlaceholderKeySummary",
          doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeys.length > 0 ? doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeys.join(", ") : "none"
        )
      : "none",
    doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeys,
    doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocationCount: doctorPrepareEnvAuditSourceReady
      ? numberField(
          releaseDoctor,
          "releasePrepareEnvExistingLocalEnvPlaceholderEditLocationCount",
          doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocations.length
        )
      : 0,
    doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocationSummary: doctorPrepareEnvAuditSourceReady
      ? stringField(
          releaseDoctor,
          "releasePrepareEnvExistingLocalEnvPlaceholderEditLocationSummary",
          formatEditLocationSummary(doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocations)
        )
      : "none",
    doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocations,
    doctorPrepareEnvAuditReleaseChannelPlaceholderKeyCount: doctorPrepareEnvAuditSourceReady
      ? numberField(
          releaseDoctor,
          "releasePrepareEnvExistingReleaseChannelPlaceholderKeyCount",
          doctorPrepareEnvAuditReleaseChannelPlaceholderKeys.length
        )
      : 0,
    doctorPrepareEnvAuditReleaseChannelPlaceholderKeySummary: doctorPrepareEnvAuditSourceReady
      ? stringField(
          releaseDoctor,
          "releasePrepareEnvExistingReleaseChannelPlaceholderKeySummary",
          doctorPrepareEnvAuditReleaseChannelPlaceholderKeys.length > 0 ? doctorPrepareEnvAuditReleaseChannelPlaceholderKeys.join(", ") : "none"
        )
      : "none",
    doctorPrepareEnvAuditReleaseChannelPlaceholderKeys,
    doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocationCount: doctorPrepareEnvAuditSourceReady
      ? numberField(
          releaseDoctor,
          "releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationCount",
          doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocations.length
        )
      : 0,
    doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocationSummary: doctorPrepareEnvAuditSourceReady
      ? stringField(
          releaseDoctor,
          "releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationSummary",
          formatEditLocationSummary(doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocations)
        )
      : "none",
    doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocations,
    doctorPrepareEnvAuditValueRecorded: doctorPrepareEnvAuditSourceReady
      ? booleanField(releaseDoctor, "releasePrepareEnvExistingLocalEnvValueRecorded", false)
      : false,
    doctorPrepareEnvAuditClaimedExternalDistribution: doctorPrepareEnvAuditSourceReady
      ? booleanField(releaseDoctor, "releaseGateClaimedExternalDistribution", false)
      : false
  };
}

function buildDoctorReleaseChannelFocusSummary(releaseDoctor = null) {
  const doctorReleaseChannelFocusSourceReady = releaseDoctor !== null && typeof releaseDoctor === "object";
  const doctorReleaseChannelFocusRows = doctorReleaseChannelFocusSourceReady
    ? valueFreeObjectRows(releaseDoctor.releaseChannelFocusRows)
    : [];
  const doctorReleaseChannelFocusRowCount = doctorReleaseChannelFocusSourceReady
    ? numberField(releaseDoctor, "releaseChannelFocusRowCount", doctorReleaseChannelFocusRows.length)
    : 0;
  const doctorReleaseChannelFocusPlaceholderKeys = doctorReleaseChannelFocusSourceReady
    ? arrayField(releaseDoctor, "releaseChannelFocusPlaceholderKeys")
    : [];
  const doctorReleaseChannelFocusReceiptReady =
    doctorReleaseChannelFocusSourceReady &&
    booleanField(releaseDoctor, "releaseChannelFocusReceiptReady", false) &&
    doctorReleaseChannelFocusRowCount === doctorReleaseChannelFocusRows.length &&
    doctorReleaseChannelFocusRows.length === releaseChannelMetadataKeys.length &&
    doctorReleaseChannelFocusRows.every((row) => row.valueRecorded === false);

  return {
    doctorReleaseChannelFocusSourceArtifact: "Release doctor",
    doctorReleaseChannelFocusSourcePath: relative(releaseDoctorPath),
    doctorReleaseChannelFocusSourceReady,
    doctorReleaseChannelFocusDoctorReportReady: doctorReleaseChannelFocusSourceReady
      ? booleanField(releaseDoctor, "releaseDoctorReportReady", false)
      : false,
    doctorReleaseChannelFocusReceiptReady,
    doctorReleaseChannelFocusCurrentReady: doctorReleaseChannelFocusSourceReady
      ? booleanField(releaseDoctor, "releaseChannelFocusCurrentReady", false)
      : false,
    doctorReleaseChannelFocusCurrentReadyCount: doctorReleaseChannelFocusSourceReady
      ? numberField(releaseDoctor, "releaseChannelFocusCurrentReadyCount", 0)
      : 0,
    doctorReleaseChannelFocusRowCount,
    doctorReleaseChannelFocusSummary: doctorReleaseChannelFocusSourceReady
      ? stringField(releaseDoctor, "releaseChannelFocusSummary", "none")
      : "none",
    doctorReleaseChannelFocusRows,
    doctorReleaseChannelFocusPlaceholderKeyCount: doctorReleaseChannelFocusSourceReady
      ? numberField(releaseDoctor, "releaseChannelFocusPlaceholderKeyCount", doctorReleaseChannelFocusPlaceholderKeys.length)
      : 0,
    doctorReleaseChannelFocusPlaceholderKeys,
    doctorReleaseChannelFocusProofCommand: doctorReleaseChannelFocusSourceReady
      ? stringField(releaseDoctor, "releaseChannelFocusProofCommand", "npm run desktop:distribution-private-inputs-smoke")
      : "npm run desktop:distribution-private-inputs-smoke",
    doctorReleaseChannelFocusRerunCommand: doctorReleaseChannelFocusSourceReady
      ? stringField(releaseDoctor, "releaseChannelFocusRerunCommand", "npm run release:doctor")
      : "npm run release:doctor",
    doctorReleaseChannelFocusValueRecorded: doctorReleaseChannelFocusSourceReady
      ? booleanField(releaseDoctor, "releaseChannelFocusValueRecorded", false)
      : false,
    doctorReleaseChannelFocusClaimedExternalDistribution: doctorReleaseChannelFocusSourceReady
      ? booleanField(releaseDoctor, "sourceClaimedExternalDistribution", false)
      : false
  };
}

function buildDoctorPostEditProofSummary(releaseDoctor = null) {
  const doctorPostEditProofSourceReady = releaseDoctor !== null && typeof releaseDoctor === "object";
  const doctorPostEditProofCommand = doctorPostEditProofSourceReady
    ? stringField(releaseDoctor, "currentActionPostEditProofCommand", "none")
    : "none";
  const doctorPostEditProofRole = doctorPostEditProofSourceReady
    ? stringField(releaseDoctor, "currentActionPostEditProofRole", "none")
    : "none";
  const doctorPostEditProofValueRecorded = doctorPostEditProofSourceReady
    ? booleanField(releaseDoctor, "currentActionPostEditProofValueRecorded", false)
    : false;
  return {
    doctorPostEditProofSourceArtifact: "Release doctor",
    doctorPostEditProofSourcePath: relative(releaseDoctorPath),
    doctorPostEditProofSourceReady,
    doctorPostEditProofDoctorReportReady: doctorPostEditProofSourceReady
      ? booleanField(releaseDoctor, "releaseDoctorReportReady", false)
      : false,
    doctorPostEditProofCurrentActionId: doctorPostEditProofSourceReady ? stringField(releaseDoctor, "currentActionId", "none") : "none",
    doctorPostEditProofCurrentActionLabel: doctorPostEditProofSourceReady
      ? stringField(releaseDoctor, "currentActionLabel", "none")
      : "none",
    doctorPostEditProofCommand,
    doctorPostEditProofRole,
    doctorPostEditProofMatchesRecommended: doctorPostEditProofCommand === recommendedPrivateEditOperatorProofCommand,
    doctorPostEditProofValueRecorded,
    doctorPostEditProofClaimedExternalDistribution: doctorPostEditProofSourceReady
      ? booleanField(releaseDoctor, "releaseGateClaimedExternalDistribution", false)
      : false
  };
}

function formatReleaseChannelFocusRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | no | no | no | none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.key)} | ${readyLabel(row.present)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${readyLabel(row.currentReady)} | ${escapeCell(row.evidence)} | ${escapeCell(row.expectedSignal)} | ${escapeCell(row.proofCommand)} | ${escapeCell(row.rerunCommand)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildBootstrapNextActionsReport(artifactRows, preflightRun, releaseDoctor = null) {
  const missingArtifacts = artifactRows.filter((item) => !item.present);
  const missingLabels = missingArtifacts.map((item) => item.label);
  const firstBlockers = unique([
    `Source release evidence is missing: ${missingLabels.join(", ") || "unknown"}.`,
    "Run npm run release:check before external preflight.",
    "Rerun npm run release:next-actions after evidence is regenerated."
  ]);
  const priorityActions = [
    {
      order: 1,
      id: "regenerate-local-release-evidence",
      label: "Regenerate local release evidence",
      ready: false,
      requiredKeys: [],
      placeholderKeys: [],
      placeholderEditLocations: [],
      keyGuidance: [],
      envEditTemplate: [],
      envEditRows: [],
      readyCriteria: readyCriteriaForAction({ id: "regenerate-local-release-evidence" }),
      evidence: buildEvidenceRows(artifactRows),
      prerequisiteCommands: [],
      operatorActions: [
        "Run the full local release gate to regenerate ignored source evidence before external preflight.",
        "Do not add private release values to committed files while regenerating evidence."
      ],
      rerunCommands: ["npm run release:check", "npm run release:next-actions"],
      nextCommand: "npm run release:check",
      firstBlocker: firstBlockers[0],
      blockers: firstBlockers,
      valueRecorded: false
    }
  ];
  priorityActions[0].actionChecklist = buildActionChecklist(priorityActions[0]);
  const currentActionSummary = buildCurrentActionSummary(priorityActions, {
    id: "regenerate-local-release-evidence",
    label: "Regenerate local release evidence",
    nextCommand: "npm run release:check",
    firstBlocker: firstBlockers[0]
  });
  const completionGap = buildCompletionGapSummary({
    sourceEvidenceReady: false,
    completionStage: "source evidence missing",
    ...currentActionSummary,
    externalDistributionReady: false,
    externalDistributionGateReady: false,
    hardGateWouldFail: true,
    priorityActionCount: priorityActions.length
  });
  const doctorCompletionGap = buildDoctorCompletionGapSummary(releaseDoctor, {
    completionStage: "source evidence missing",
    ...currentActionSummary,
    hardExternalGateCommand: "npm run release:external-check",
    prerequisiteCommand: "npm run release:check"
  });
  const doctorPrepareEnvAudit = buildDoctorPrepareEnvAuditSummary(releaseDoctor);
  const doctorReleaseChannelFocus = buildDoctorReleaseChannelFocusSummary(releaseDoctor);
  const doctorPostEditProof = buildDoctorPostEditProofSummary(releaseDoctor);
  const currentPlaceholderRemediation = buildCurrentPlaceholderRemediationSummary({
    currentActionSummary,
    doctorPrepareEnvAudit
  });
  const currentProofChecklist = buildCurrentProofChecklistSummary({
    currentActionSummary,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentCommandVerification = buildCurrentCommandVerificationSummary({
    currentActionSummary,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentActionAcceptance = buildCurrentActionAcceptanceSummary({
    currentActionSummary,
    releaseDoctor,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentActionPostEditVerification = buildCurrentActionPostEditVerificationSummary({
    currentActionSummary,
    acceptanceRows: currentActionAcceptance.currentActionAcceptanceRows,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentActionHandoff = buildCurrentActionHandoffSummary({
    sourceArtifacts: artifactRows,
    currentActionSummary,
    currentActionAcceptance,
    currentCommandVerification,
    hardGateRequirementBlockedCount: 0,
    hardGateBlockedRequirementSummary: "source evidence missing",
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentPrivateEditSafety = buildCurrentPrivateEditSafetySummary({
    currentActionSummary,
    currentEnvEditTarget: currentLocalEnvEditTarget(),
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentInputShapeChecklist = buildCurrentInputShapeChecklistSummary({
    currentActionSummary,
    doctorReleaseChannelFocus,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentLocalEnvDiagnostics = buildCurrentLocalEnvDiagnosticsSummary({
    releaseDoctor: releaseDoctor ?? {},
    currentEnvEditTarget: currentLocalEnvEditTarget(),
    currentPlaceholderKeyCount: currentActionSummary.currentPlaceholderKeyCount ?? 0
  });
  const releaseChannelPostEditReceipt = buildReleaseChannelPostEditReceiptSummary({
    currentActionSummary,
    currentActionAcceptance,
    currentActionPostEditVerification,
    currentInputShapeChecklist,
    currentLocalEnvDiagnostics,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const releaseChannelPostEditOperatorReceipt = buildReleaseChannelPostEditOperatorReceiptSummary({
    currentActionSummary,
    releaseChannelPostEditReceipt,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const postEditProofSequenceReceipt = buildPostEditProofSequenceReceiptSummary({
    currentActionSummary,
    releaseChannelPostEditOperatorReceipt,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const nextActionPreview = buildNextActionPreviewSummary(priorityActions);

  return {
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
    prerequisiteCommand: "npm run release:check",
    externalNextActionsMarkdownPath: relative(nextActionsMarkdownPath),
    externalNextActionsJsonPath: relative(nextActionsJsonPath),
    productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
    nextActionsScope: "value-free bootstrap external distribution operator actions when source release evidence is missing",
    bootstrapMode: true,
    preflightRunAttempted: preflightRun.attempted,
    preflightRunSucceeded: preflightRun.succeeded,
    preflightExitStatus: preflightRun.status,
    preflightOutputRecorded: false,
    sourceArtifacts: artifactRows,
    missingSourceArtifacts: missingArtifacts,
    sourceEvidenceReady: false,
    completionStage: "source evidence missing",
    currentFocus: "Regenerate local release evidence",
    ...currentActionSummary,
    ...completionGap,
    ...doctorCompletionGap,
    ...doctorPrepareEnvAudit,
    ...doctorReleaseChannelFocus,
    ...doctorPostEditProof,
    ...currentPlaceholderRemediation,
    ...currentProofChecklist,
    ...currentCommandVerification,
    ...currentActionAcceptance,
    ...currentActionPostEditVerification,
    ...currentActionHandoff,
    ...currentPrivateEditSafety,
    ...currentInputShapeChecklist,
    ...currentLocalEnvDiagnostics,
    ...releaseChannelPostEditReceipt,
    ...releaseChannelPostEditOperatorReceipt,
    ...postEditProofSequenceReceipt,
    ...nextActionPreview,
    localReleaseReady: false,
    localReleaseReadinessPercent: 0,
    externalDistributionReady: false,
    externalDistributionGateReady: false,
    hardGateWouldFail: true,
    gateRequirementTotal: 0,
    gateRequirementReadyCount: 0,
    gateRequirementReadinessPercent: 0,
    remediationTotal: 0,
    remediationReadyCount: 0,
    remediationReadinessPercent: 0,
    privateInputGroupTotal: 0,
    privateInputGroupReadyCount: 0,
    manualQaChecklistDigestAvailable: false,
    currentEnvEditTarget: currentLocalEnvEditTarget(),
    currentEnvConfiguredFileKey: distributionLocalEnvDefaults.configuredFileKey,
    localEnvFilesChecked: [distributionLocalEnvDefaults.defaultEnvFileName],
    localEnvPresentFiles: [],
    localEnvFileLoaded: false,
    localEnvPlaceholderKeyCount: 0,
    localEnvPlaceholderKeys: [],
    localEnvPlaceholderLocations: [],
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
    sourceValueRecorded: false,
    sourceClaimedExternalDistribution: false,
    externalNextActionsReady: true
  };
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} External Next Actions

## Status

- Next actions ready: ${readyLabel(report.externalNextActionsReady)}
- Bootstrap mode: ${readyLabel(report.bootstrapMode)}
- Source evidence ready: ${readyLabel(report.sourceEvidenceReady)}
- Completion stage: ${report.completionStage}
- Current focus: ${report.currentFocus}
- Current action: ${report.currentActionLabel}
- Current next command: \`${report.currentNextCommand}\`
- Current first blocker: ${report.currentFirstBlocker}
- Completion gap status: ${report.completionGapStatus}
- Completion gap summary: ${report.completionGapSummary}
- Completion gap proof target: ${report.completionGapCurrentProofTarget}
- Completion gap next proof command: \`${report.completionGapNextProofCommand}\`
- Completion gap hard gate command: \`${report.completionGapHardGateCommand}\`
- Completion gap first blocker: ${report.completionGapFirstBlocker}
- Completion gap claim blockers: ${report.completionGapClaimBlockerCount} (${report.completionGapClaimBlockerSummary})
- Doctor completion gap source ready: ${readyLabel(report.doctorCompletionGapSourceReady)}
- Doctor completion gap status: ${report.doctorCompletionGapStatus}
- Doctor completion gap proof target: ${report.doctorCompletionGapProofTarget}
- Doctor completion gap next proof command: \`${report.doctorCompletionGapNextProofCommand}\`
- Doctor completion gap hard gate command: \`${report.doctorCompletionGapHardGateCommand}\`
- Doctor completion gap claim blockers: ${report.doctorCompletionGapClaimBlockerCount} (${report.doctorCompletionGapClaimBlockerSummary})
- Doctor prepare-env audit source ready: ${readyLabel(report.doctorPrepareEnvAuditSourceReady)}
- Doctor prepare-env existing local env placeholder keys: ${report.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeyCount} (${report.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeySummary})
- Doctor prepare-env release-channel placeholder keys: ${report.doctorPrepareEnvAuditReleaseChannelPlaceholderKeyCount} (${report.doctorPrepareEnvAuditReleaseChannelPlaceholderKeySummary})
- Doctor prepare-env release-channel placeholder edit locations: ${report.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocationCount} (${report.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocationSummary})
- Doctor release-channel focus receipt ready: ${readyLabel(report.doctorReleaseChannelFocusReceiptReady)}
- Doctor release-channel focus current action ready: ${readyLabel(report.doctorReleaseChannelFocusCurrentReady)}
- Doctor release-channel focus current-ready rows: ${report.doctorReleaseChannelFocusCurrentReadyCount}/${report.doctorReleaseChannelFocusRowCount}
- Doctor release-channel focus placeholder keys: ${report.doctorReleaseChannelFocusPlaceholderKeyCount}
- Doctor post-edit proof command: \`${report.doctorPostEditProofCommand}\`
- Doctor post-edit proof matches recommended: ${readyLabel(report.doctorPostEditProofMatchesRecommended)}
- Current required keys: ${report.currentRequiredKeyCount} (${report.currentRequiredKeySummary})
- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${report.currentPlaceholderKeySummary})
- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})
- Current env key guidance: ${report.currentEnvKeyGuidanceCount} (${report.currentEnvKeyGuidanceSummary})
- Current env edit template: ${report.currentEnvEditTemplateCount} (${report.currentEnvEditTemplateSummary})
- Current env edit rows: ${report.currentEnvEditRowsCount} (${report.currentEnvEditRowsSummary})
- Current placeholder remediation rows: ${report.currentPlaceholderRemediationRowCount} (${report.currentPlaceholderRemediationRowSummary})
- Current evidence rows: ${report.currentEvidenceRowsCount} (${report.currentEvidenceRowsSummary})
- Current evidence labels: ${report.currentEvidenceLabelCount} (${report.currentEvidenceLabelSummary})
- Current ready criteria: ${report.currentReadyCriteriaCount} (${report.currentReadyCriteriaSummary})
- Current proof checklist rows: ${report.currentProofChecklistRowCount} (${report.currentProofChecklistRowSummary})
- Current action checklist: ${report.currentActionChecklistCount} (${report.currentActionChecklistSummary})
- Current action acceptance ready: ${readyLabel(report.currentActionAcceptanceReady)}
- Current action acceptance rows: ${report.currentActionAcceptanceRowCount} (${report.currentActionAcceptanceSummary})
- Current action acceptance blockers: ${report.currentActionAcceptanceBlockerCount} (${report.currentActionAcceptanceBlockerSummary})
- Current action post-edit verification ready: ${readyLabel(report.currentActionPostEditVerificationReady)}
- Current action post-edit verification rows: ${report.currentActionPostEditVerificationRowCount} (${report.currentActionPostEditVerificationSummary})
- Current action post-edit signals currently ready: ${report.currentActionPostEditVerificationCurrentSummary}
- Current action handoff ready: ${readyLabel(report.currentActionHandoffReady)}
- Current action handoff rows: ${report.currentActionHandoffRowCount} (${report.currentActionHandoffSummary})
- Current private edit safety ready: ${readyLabel(report.currentPrivateEditSafetyReady)}
- Current private edit safety rows: ${report.currentPrivateEditSafetyRowCount} (${report.currentPrivateEditSafetySummary})
- Current input shape checklist ready: ${readyLabel(report.currentInputShapeChecklistReady)}
- Current input shape checklist rows: ${report.currentInputShapeChecklistRowCount} (${report.currentInputShapeChecklistSummary})
- Current local env diagnostics ready: ${readyLabel(report.currentLocalEnvDiagnosticsReady)}
- Current local env diagnostic rows: ${report.currentLocalEnvDiagnosticRowCount} (${report.currentLocalEnvDiagnosticSummary})
- Release-channel post-edit receipt ready: ${readyLabel(report.releaseChannelPostEditReceiptReady)}
- Release-channel post-edit receipt rows: ${report.releaseChannelPostEditReceiptRowCount} (${report.releaseChannelPostEditReceiptSummary})
- Release-channel post-edit current-ready rows: ${report.releaseChannelPostEditReceiptCurrentReadyCount}/${report.releaseChannelPostEditReceiptRowCount}
- Release-channel post-edit operator receipt ready: ${readyLabel(report.releaseChannelPostEditOperatorReceiptReady)}
- Release-channel post-edit operator receipt rows: ${report.releaseChannelPostEditOperatorReceiptRowCount} (${report.releaseChannelPostEditOperatorReceiptSummary})
- Release-channel post-edit operator recommended proof chain: \`${report.releaseChannelPostEditOperatorReceiptRecommendedProofCommand}\`
- Release-channel post-edit operator proof command: \`${report.releaseChannelPostEditOperatorReceiptProofCommand}\`
- Release-channel post-edit operator blocker refresh: \`${report.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand}\`
- Release-channel post-edit operator next-actions refresh: \`${report.releaseChannelPostEditOperatorReceiptNextActionsCommand}\`
- Post-edit proof sequence receipt ready: ${readyLabel(report.postEditProofSequenceReceiptReady)}
- Post-edit proof sequence receipt rows: ${report.postEditProofSequenceReceiptRowCount} (${report.postEditProofSequenceReceiptSummary})
- Post-edit proof sequence recommended proof chain: \`${report.postEditProofSequenceReceiptRecommendedProofCommand}\`
- Post-edit proof sequence doctor command: \`${report.postEditProofSequenceReceiptDoctorCommand}\`
- Post-edit proof sequence current-blocker command: \`${report.postEditProofSequenceReceiptCurrentBlockerCommand}\`
- Post-edit proof sequence next-actions command: \`${report.postEditProofSequenceReceiptNextActionsCommand}\`
- Post-edit proof sequence proof-bundle command: \`${report.postEditProofSequenceReceiptProofBundleCommand}\`
- Post-edit proof sequence progress command: \`${report.postEditProofSequenceReceiptProgressCommand}\`
- Post-edit proof sequence hard-gate command: \`${report.postEditProofSequenceReceiptHardGateCommand}\`
- Next priority action after current clears: ${report.nextPriorityActionId} (${report.nextPriorityActionLabel})
- Next action preview ready: ${readyLabel(report.nextActionPreviewReady)}
- Next action preview ready criteria rows: ${report.nextActionPreviewReadyCriteriaRowCount} (${report.nextActionPreviewReadyCriteriaSummary})
- Next action preview checklist rows: ${report.nextActionPreviewChecklistRowCount} (${report.nextActionPreviewChecklistSummary})
- Next action preview blocker rows: ${report.nextActionPreviewBlockerRowCount} (${report.nextActionPreviewBlockerSummary})
- Next action preview verification rows: ${report.nextActionPreviewVerificationRowCount} (${report.nextActionPreviewVerificationSummary})
- Next action preview prerequisite command rows: ${report.nextActionPreviewPrerequisiteCommandRowCount} (${report.nextActionPreviewPrerequisiteCommandSummary})
- Next action preview operator action rows: ${report.nextActionPreviewOperatorActionRowCount} (${report.nextActionPreviewOperatorActionSummary})
- Next action preview env edit rows: ${report.nextActionPreviewEnvEditRowCount} (${report.nextActionPreviewEnvEditSummary})
- Current prerequisite commands: ${report.currentPrerequisiteCommandCount} (${report.currentPrerequisiteCommandSummary})
- Current rerun commands: ${report.currentRerunCommandCount} (${report.currentRerunCommandSummary})
- Current command sequence: ${report.currentCommandSequenceCount} (${report.currentCommandSequenceSummary})
- Current command verification rows: ${report.currentCommandVerificationRowCount} (${report.currentCommandVerificationRowSummary})
- Current env edit target: ${report.currentEnvEditTarget}
- Current operator action: ${report.currentOperatorAction}
- Current rerun command: \`${report.currentRerunCommand}\`
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
- Local env placeholder keys: ${report.localEnvPlaceholderKeyCount}
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
- Source evidence prerequisite: \`${report.prerequisiteCommand ?? "none"}\`
- Hard external distribution gate: \`${report.hardExternalGateCommand}\`

## Current Command Sequence

${formatCommandList(report.currentCommandSequence)}

## Current Command Verification

${formatCommandVerificationRowsTable(report.currentCommandVerificationRows)}

## Completion Gap

- Status: ${report.completionGapStatus}
- Summary: ${report.completionGapSummary}
- Completion stage: ${report.completionGapCompletionStage}
- Proof target: ${report.completionGapCurrentProofTarget}
- Next proof command: \`${report.completionGapNextProofCommand}\`
- Hard gate command: \`${report.completionGapHardGateCommand}\`
- First blocker: ${report.completionGapFirstBlocker}
- Evidence summary: ${report.completionGapEvidenceSummary}
- Ready criteria summary: ${report.completionGapReadyCriteriaSummary}
- Action checklist summary: ${report.completionGapActionChecklistSummary}
- External distribution claimed by this report: ${readyLabel(report.completionGapClaimedExternalDistribution)}
- Value recorded: ${readyLabel(report.completionGapValueRecorded)}

${formatChecklistList(report.completionGapClaimBlockers)}

## Release Doctor Completion Gap

- Source artifact: ${report.doctorCompletionGapSourceArtifact}
- Source path: ${report.doctorCompletionGapSourcePath}
- Source ready: ${readyLabel(report.doctorCompletionGapSourceReady)}
- Doctor report ready: ${readyLabel(report.doctorCompletionGapDoctorReportReady)}
- Status: ${report.doctorCompletionGapStatus}
- Summary: ${report.doctorCompletionGapSummary}
- Completion stage: ${report.doctorCompletionGapCompletionStage}
- Proof target: ${report.doctorCompletionGapProofTarget}
- Next proof command: \`${report.doctorCompletionGapNextProofCommand}\`
- Hard gate command: \`${report.doctorCompletionGapHardGateCommand}\`
- First blocker: ${report.doctorCompletionGapFirstBlocker}
- Evidence summary: ${report.doctorCompletionGapEvidenceSummary}
- Ready criteria summary: ${report.doctorCompletionGapReadyCriteriaSummary}
- Action checklist summary: ${report.doctorCompletionGapActionChecklistSummary}
- External distribution claimed by release doctor: ${readyLabel(report.doctorCompletionGapClaimedExternalDistribution)}
- Value recorded by release doctor: ${readyLabel(report.doctorCompletionGapValueRecorded)}
- Source values recorded: ${readyLabel(report.doctorCompletionGapSourceValueRecorded)}
- Source external distribution claimed: ${readyLabel(report.doctorCompletionGapSourceClaimedExternalDistribution)}

${formatChecklistList(report.doctorCompletionGapClaimBlockers)}

## Release Doctor Prepare Env Audit

- Source artifact: ${report.doctorPrepareEnvAuditSourceArtifact}
- Source path: ${report.doctorPrepareEnvAuditSourcePath}
- Source ready: ${readyLabel(report.doctorPrepareEnvAuditSourceReady)}
- Doctor report ready: ${readyLabel(report.doctorPrepareEnvAuditDoctorReportReady)}
- Existing local env files checked: ${report.doctorPrepareEnvAuditExistingLocalEnvFilesChecked.join(", ") || "none"}
- Existing local env present files: ${report.doctorPrepareEnvAuditExistingLocalEnvPresentFiles.join(", ") || "none"}
- Existing local env file loaded: ${readyLabel(report.doctorPrepareEnvAuditExistingLocalEnvFileLoaded)}
- Existing local env placeholder keys: ${report.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeyCount} (${report.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeySummary})
- Existing local env placeholder edit locations: ${report.doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocationCount} (${report.doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocationSummary})
- Release-channel placeholder keys: ${report.doctorPrepareEnvAuditReleaseChannelPlaceholderKeyCount} (${report.doctorPrepareEnvAuditReleaseChannelPlaceholderKeySummary})
- Release-channel placeholder edit locations: ${report.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocationCount} (${report.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocationSummary})
- Value recorded by release doctor prepare-env audit: ${readyLabel(report.doctorPrepareEnvAuditValueRecorded)}
- External distribution claimed by release doctor prepare-env audit: ${readyLabel(report.doctorPrepareEnvAuditClaimedExternalDistribution)}

### Doctor Prepare Env Existing Placeholder Keys

${formatKeyList(report.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeys)}

### Doctor Prepare Env Release-Channel Placeholder Edit Locations

${formatEditLocationList(report.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocations)}

## Release Doctor Release-Channel Focus Receipt

- Source artifact: ${report.doctorReleaseChannelFocusSourceArtifact}
- Source path: ${report.doctorReleaseChannelFocusSourcePath}
- Source ready: ${readyLabel(report.doctorReleaseChannelFocusSourceReady)}
- Doctor report ready: ${readyLabel(report.doctorReleaseChannelFocusDoctorReportReady)}
- Receipt ready: ${readyLabel(report.doctorReleaseChannelFocusReceiptReady)}
- Current action ready: ${readyLabel(report.doctorReleaseChannelFocusCurrentReady)}
- Receipt rows: ${report.doctorReleaseChannelFocusRowCount} (${report.doctorReleaseChannelFocusSummary})
- Current-ready rows: ${report.doctorReleaseChannelFocusCurrentReadyCount}/${report.doctorReleaseChannelFocusRowCount}
- Placeholder keys: ${report.doctorReleaseChannelFocusPlaceholderKeyCount} (${report.doctorReleaseChannelFocusPlaceholderKeys.join(", ") || "none"})
- Proof command: \`${report.doctorReleaseChannelFocusProofCommand}\`
- Rerun command: \`${report.doctorReleaseChannelFocusRerunCommand}\`
- Value recorded: ${readyLabel(report.doctorReleaseChannelFocusValueRecorded)}
- External distribution claimed by release doctor: ${readyLabel(report.doctorReleaseChannelFocusClaimedExternalDistribution)}

| key | present | placeholder | shape ready | current ready | evidence | expected signal | proof command | rerun command | value recorded |
|---|---:|---:|---:|---:|---|---|---|---|---:|
${formatReleaseChannelFocusRows(report.doctorReleaseChannelFocusRows)}

## Release Doctor Post-Edit Proof

- Source artifact: ${report.doctorPostEditProofSourceArtifact}
- Source path: ${report.doctorPostEditProofSourcePath}
- Source ready: ${readyLabel(report.doctorPostEditProofSourceReady)}
- Doctor report ready: ${readyLabel(report.doctorPostEditProofDoctorReportReady)}
- Current action: ${report.doctorPostEditProofCurrentActionLabel}
- Current action id: ${report.doctorPostEditProofCurrentActionId}
- Post-edit proof command: \`${report.doctorPostEditProofCommand}\`
- Post-edit proof role: ${report.doctorPostEditProofRole}
- Matches recommended operator proof chain: ${readyLabel(report.doctorPostEditProofMatchesRecommended)}
- Value recorded: ${readyLabel(report.doctorPostEditProofValueRecorded)}
- External distribution claimed by release doctor: ${readyLabel(report.doctorPostEditProofClaimedExternalDistribution)}

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

## Local Env Placeholder Keys

${formatKeyList(report.localEnvPlaceholderKeys)}

## Current Placeholder Edit Locations

${formatEditLocationList(report.currentPlaceholderEditLocations)}

## Current Env Key Guidance

${formatGuidanceList(report.currentEnvKeyGuidance)}

## Current Env Edit Template

${formatEnvEditTemplateBlock(report.currentEnvEditTemplate)}

## Current Env Edit Rows

${formatEnvEditRowsTable(report.currentEnvEditRows)}

## Current Placeholder Remediation Checklist

${formatPlaceholderRemediationRowsTable(report.currentPlaceholderRemediationRows)}

## Current Evidence Rows

${formatEvidenceRowsTable(report.currentEvidenceRows)}

## Current Ready Criteria

${formatReadyCriteriaList(report.currentReadyCriteria)}

## Current Proof Checklist

${formatProofChecklistRowsTable(report.currentProofChecklistRows)}

## Current Action Checklist

${formatChecklistList(report.currentActionChecklist)}

## Current Action Acceptance

- Acceptance ready: ${readyLabel(report.currentActionAcceptanceReady)}
- Acceptance rows: ${report.currentActionAcceptanceRowCount} (${report.currentActionAcceptanceSummary})
- Ready rows: ${report.currentActionAcceptanceReadyCount}/${report.currentActionAcceptanceRowCount}
- Blocker rows: ${report.currentActionAcceptanceBlockerCount} (${report.currentActionAcceptanceBlockerSummary})
- Value recorded: ${readyLabel(report.currentActionAcceptanceValueRecorded)}

${formatCurrentActionAcceptanceRows(report.currentActionAcceptanceRows)}

### Current Action Acceptance Blockers

${formatCurrentActionAcceptanceBlockerRows(report.currentActionAcceptanceBlockerRows)}

## Current Action Post-Edit Verification

- Verification ready: ${readyLabel(report.currentActionPostEditVerificationReady)}
- Verification rows: ${report.currentActionPostEditVerificationRowCount} (${report.currentActionPostEditVerificationSummary})
- Signals currently ready: ${report.currentActionPostEditVerificationCurrentSummary}
- Matches acceptance: ${readyLabel(report.currentActionPostEditVerificationMatchesAcceptance)}

${formatCurrentActionPostEditVerificationRows(report.currentActionPostEditVerificationRows)}

## Current Action Handoff Package

- Handoff ready: ${readyLabel(report.currentActionHandoffReady)}
- Handoff rows: ${report.currentActionHandoffRowCount} (${report.currentActionHandoffSummary})
- Source artifacts: ${report.currentActionHandoffSourceArtifactCount} (${report.currentActionHandoffSourceArtifactSummary})

${formatCurrentActionHandoffRows(report.currentActionHandoffRows)}

## Current Private Edit Safety Checklist

- Safety ready: ${readyLabel(report.currentPrivateEditSafetyReady)}
- Safety rows: ${report.currentPrivateEditSafetyRowCount} (${report.currentPrivateEditSafetySummary})

${formatCurrentPrivateEditSafetyRows(report.currentPrivateEditSafetyRows)}

## Current Input Shape Checklist

- Shape checklist ready: ${readyLabel(report.currentInputShapeChecklistReady)}
- Shape checklist rows: ${report.currentInputShapeChecklistRowCount} (${report.currentInputShapeChecklistSummary})

${formatCurrentInputShapeChecklistRows(report.currentInputShapeChecklistRows)}

## Current Local Env Diagnostics

- Diagnostics ready: ${readyLabel(report.currentLocalEnvDiagnosticsReady)}
- Diagnostic rows: ${report.currentLocalEnvDiagnosticRowCount} (${report.currentLocalEnvDiagnosticSummary})

${formatCurrentLocalEnvDiagnosticRows(report.currentLocalEnvDiagnosticRows)}

## Release-Channel Post-Edit Receipt

- Receipt ready: ${readyLabel(report.releaseChannelPostEditReceiptReady)}
- Receipt rows: ${report.releaseChannelPostEditReceiptRowCount} (${report.releaseChannelPostEditReceiptSummary})
- Current-ready rows: ${report.releaseChannelPostEditReceiptCurrentReadyCount}/${report.releaseChannelPostEditReceiptRowCount}
- Proof command: \`${report.releaseChannelPostEditReceiptProofCommand}\`
- Rerun command: \`${report.releaseChannelPostEditReceiptRerunCommand}\`
- Value recorded: ${readyLabel(report.releaseChannelPostEditReceiptValueRecorded)}

${formatReleaseChannelPostEditReceiptRows(report.releaseChannelPostEditReceiptRows)}

## Release-Channel Post-Edit Operator Receipt

- Receipt ready: ${readyLabel(report.releaseChannelPostEditOperatorReceiptReady)}
- Receipt rows: ${report.releaseChannelPostEditOperatorReceiptRowCount} (${report.releaseChannelPostEditOperatorReceiptSummary})
- Recommended proof chain: \`${report.releaseChannelPostEditOperatorReceiptRecommendedProofCommand}\`
- Proof command: \`${report.releaseChannelPostEditOperatorReceiptProofCommand}\`
- Current-blocker refresh command: \`${report.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand}\`
- Next-actions refresh command: \`${report.releaseChannelPostEditOperatorReceiptNextActionsCommand}\`
- Hard gate command: \`${report.releaseChannelPostEditOperatorReceiptHardGateCommand}\`
- Value recorded: ${readyLabel(report.releaseChannelPostEditOperatorReceiptValueRecorded)}

${formatReleaseChannelPostEditOperatorReceiptRows(report.releaseChannelPostEditOperatorReceiptRows)}

## Post-Edit Proof Sequence Receipt

- Receipt ready: ${readyLabel(report.postEditProofSequenceReceiptReady)}
- Receipt rows: ${report.postEditProofSequenceReceiptRowCount} (${report.postEditProofSequenceReceiptSummary})
- Recommended proof chain: \`${report.postEditProofSequenceReceiptRecommendedProofCommand}\`
- Doctor command: \`${report.postEditProofSequenceReceiptDoctorCommand}\`
- Current-blocker command: \`${report.postEditProofSequenceReceiptCurrentBlockerCommand}\`
- Next-actions command: \`${report.postEditProofSequenceReceiptNextActionsCommand}\`
- Proof-bundle command: \`${report.postEditProofSequenceReceiptProofBundleCommand}\`
- Progress command: \`${report.postEditProofSequenceReceiptProgressCommand}\`
- Hard-gate command: \`${report.postEditProofSequenceReceiptHardGateCommand}\`
- Value recorded: ${readyLabel(report.postEditProofSequenceReceiptValueRecorded)}

${formatPostEditProofSequenceReceiptRows(report.postEditProofSequenceReceiptRows)}

## Next Action Preview

- Preview ready: ${readyLabel(report.nextActionPreviewReady)}
- Next action: ${report.nextActionPreviewId} (${report.nextActionPreviewLabel})
- Proof command: \`${report.nextActionPreviewProofCommand}\`
- Rerun commands: ${report.nextActionPreviewRerunCommandSummary}
- First blocker: ${report.nextActionPreviewFirstBlocker}
- Required keys: ${report.nextActionPreviewRequiredKeyCount} (${report.nextActionPreviewRequiredKeySummary})
- Placeholder keys: ${report.nextActionPreviewPlaceholderKeyCount} (${report.nextActionPreviewPlaceholderKeySummary})
- Ready criteria rows: ${report.nextActionPreviewReadyCriteriaRowCount} (${report.nextActionPreviewReadyCriteriaSummary})
- Checklist rows: ${report.nextActionPreviewChecklistRowCount} (${report.nextActionPreviewChecklistSummary})
- Evidence rows: ${report.nextActionPreviewEvidenceRowCount} (${report.nextActionPreviewEvidenceSummary})
- Blocker rows: ${report.nextActionPreviewBlockerRowCount} (${report.nextActionPreviewBlockerSummary})
- Verification rows: ${report.nextActionPreviewVerificationRowCount} (${report.nextActionPreviewVerificationSummary})
- Prerequisite command rows: ${report.nextActionPreviewPrerequisiteCommandRowCount} (${report.nextActionPreviewPrerequisiteCommandSummary})
- Operator action rows: ${report.nextActionPreviewOperatorActionRowCount} (${report.nextActionPreviewOperatorActionSummary})
- Env edit rows: ${report.nextActionPreviewEnvEditRowCount} (${report.nextActionPreviewEnvEditSummary})

${formatNextActionReadyCriteriaRows(report.nextActionPreviewReadyCriteriaRows)}

${formatNextActionChecklistRows(report.nextActionPreviewChecklistRows)}

${formatNextActionEvidenceRows(report.nextActionPreviewEvidenceRows)}

${formatNextActionBlockerRows(report.nextActionPreviewBlockerRows)}

${formatNextActionVerificationRows(report.nextActionPreviewVerificationRows)}

${formatNextActionPrerequisiteCommandRows(report.nextActionPreviewPrerequisiteCommandRows)}

${formatNextActionOperatorActionRows(report.nextActionPreviewOperatorActionRows)}

${formatNextActionEnvEditRows(report.nextActionPreviewEnvEditRows)}

## Current First Blockers

| order | blocker |
|---:|---|
${formatBlockerRows(report.firstBlockers)}

## Interpretation

This is the compact operator view after external preflight or the bootstrap view when source evidence is missing. It does not replace \`npm run release:external-preflight\` or the hard gate \`npm run release:external-check\`.

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, local env values, private beats, and real user audio are not recorded.

## Not Claimed

This next-actions report does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

const preflightRun = runExternalPreflight();
const artifactRows = sourceArtifacts.map((item) => artifact(item.label, item.path));
const missingSourceEvidence = artifactRows.some((item) => !item.present);
let nextActionsReport = null;
let releaseDoctorSource = null;

if (!preflightRun.succeeded && missingSourceEvidence && !fromExisting) {
  const bootstrapReleaseDoctor = existsSync(releaseDoctorPath) ? JSON.parse(await readFile(releaseDoctorPath, "utf8")) : null;
  releaseDoctorSource = bootstrapReleaseDoctor;
  nextActionsReport = buildBootstrapNextActionsReport(artifactRows, preflightRun, bootstrapReleaseDoctor);
} else {
  if (!preflightRun.succeeded) {
    fail(
      `npm run release:external-preflight exited with status ${preflightRun.status}.`,
      [preflightRun.stdout, preflightRun.stderr].filter((value) => value.trim().length > 0).join("\n")
    );
  }

  const [externalPreflight, externalRemediation, externalRunbook, externalLedger, completionProgress, releaseDoctor] = await Promise.all(
    sourceArtifacts.map(readJsonRequired)
  );
  releaseDoctorSource = releaseDoctor;
  const localEnvFileLoaded = externalPreflight.localEnvFileLoaded === true || releaseDoctor.localEnvFileLoaded === true;
  const localEnvPlaceholderKeys = Array.isArray(externalPreflight.localEnvPlaceholderKeys)
    ? externalPreflight.localEnvPlaceholderKeys
    : Array.isArray(releaseDoctor.localEnvPlaceholderKeys)
      ? releaseDoctor.localEnvPlaceholderKeys
      : [];
  const localEnvPlaceholderKeyCount = Number.isInteger(externalPreflight.localEnvPlaceholderKeyCount)
    ? externalPreflight.localEnvPlaceholderKeyCount
    : Number.isInteger(releaseDoctor.localEnvPlaceholderKeyCount)
      ? releaseDoctor.localEnvPlaceholderKeyCount
      : localEnvPlaceholderKeys.length;
  const localEnvFilesChecked = Array.isArray(externalPreflight.localEnvFilesChecked)
    ? externalPreflight.localEnvFilesChecked
    : Array.isArray(releaseDoctor.localEnvFilesChecked)
      ? releaseDoctor.localEnvFilesChecked
      : [distributionLocalEnvDefaults.defaultEnvFileName];
  const localEnvPresentFiles = Array.isArray(externalPreflight.localEnvPresentFiles)
    ? externalPreflight.localEnvPresentFiles
    : Array.isArray(releaseDoctor.localEnvPresentFiles)
      ? releaseDoctor.localEnvPresentFiles
      : [];
  const localEnvEditTarget = currentLocalEnvEditTarget({ localEnvFilesChecked, localEnvPresentFiles });
  const localEnvPlaceholderLocations = await readLocalEnvKeyLocations(localEnvPlaceholderKeys);
  const priorityActions = buildPriorityActions(externalRemediation, {
    localEnvFileLoaded,
    localEnvPlaceholderKeyCount,
    localEnvPlaceholderKeys,
    localEnvPlaceholderLocations,
    localEnvEditTarget
  });
  const firstBlockers = unique([
    priorityActions.map((action) => action.firstBlocker),
    externalPreflight.firstBlockers ?? [],
    completionProgress.firstBlockers?.map((item) => item.blocker) ?? [],
    externalLedger.firstBlockers ?? [],
    externalRemediation.remediationBlockers ?? []
  ]).slice(0, 12);
  const currentActionFallback = externalPreflight.externalDistributionGateReady
    ? {
        id: "run-hard-external-distribution-gate",
        label: "Run hard external distribution gate",
        nextCommand: "npm run release:external-check",
        firstBlocker: "none"
      }
    : {
        id: "refresh-external-preflight-evidence",
        label: "Refresh external preflight evidence",
        nextCommand: "npm run release:external-preflight",
        firstBlocker: "External distribution gate is not ready in redacted evidence."
      };
  const currentFocus = priorityActions[0]?.label ?? currentActionFallback.label;
  const sourceEvidenceReady = artifactRows.every((item) => item.present);
  const completionStage = externalPreflight.completionStage ?? completionProgress.completionStage ?? "unknown";
  const currentActionSummary = buildCurrentActionSummary(priorityActions, currentActionFallback);
  const completionGap = buildCompletionGapSummary({
    sourceEvidenceReady,
    completionStage,
    ...currentActionSummary,
    externalDistributionReady: externalPreflight.externalDistributionReady === true,
    externalDistributionGateReady: externalPreflight.externalDistributionGateReady === true,
    hardGateWouldFail: externalPreflight.hardGateWouldFail === true,
    priorityActionCount: priorityActions.length
  });
  const doctorCompletionGap = buildDoctorCompletionGapSummary(releaseDoctor, {
    completionStage,
    ...currentActionSummary,
    hardExternalGateCommand: "npm run release:external-check",
    prerequisiteCommand: "npm run release:check"
  });
  const doctorPrepareEnvAudit = buildDoctorPrepareEnvAuditSummary(releaseDoctor);
  const doctorReleaseChannelFocus = buildDoctorReleaseChannelFocusSummary(releaseDoctor);
  const doctorPostEditProof = buildDoctorPostEditProofSummary(releaseDoctor);
  const currentPlaceholderRemediation = buildCurrentPlaceholderRemediationSummary({
    currentActionSummary: {
      ...currentActionSummary,
      currentEnvEditTarget: localEnvEditTarget
    },
    doctorPrepareEnvAudit
  });
  const currentProofChecklist = buildCurrentProofChecklistSummary({
    currentActionSummary,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentCommandVerification = buildCurrentCommandVerificationSummary({
    currentActionSummary,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const gateRequirementTotal = externalPreflight.gateRequirementTotal ?? completionProgress.gateRequirementTotal ?? 0;
  const gateRequirementReadyCount = externalPreflight.gateRequirementReadyCount ?? completionProgress.gateRequirementReadyCount ?? 0;
  const gateRequirementReadinessPercent =
    externalPreflight.gateRequirementReadinessPercent ?? completionProgress.gateRequirementReadinessPercent ?? 0;
  const hardGateRequirementBlockedCount = Math.max(gateRequirementTotal - gateRequirementReadyCount, 0);
  const currentActionAcceptance = buildCurrentActionAcceptanceSummary({
    currentActionSummary: {
      ...currentActionSummary,
      currentEnvEditTarget: localEnvEditTarget
    },
    releaseDoctor,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentActionPostEditVerification = buildCurrentActionPostEditVerificationSummary({
    currentActionSummary,
    acceptanceRows: currentActionAcceptance.currentActionAcceptanceRows,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentActionHandoff = buildCurrentActionHandoffSummary({
    sourceArtifacts: artifactRows,
    currentActionSummary: {
      ...currentActionSummary,
      currentEnvEditTarget: localEnvEditTarget
    },
    currentActionAcceptance,
    currentCommandVerification,
    hardGateRequirementBlockedCount,
    hardGateBlockedRequirementSummary:
      hardGateRequirementBlockedCount > 0 ? `${hardGateRequirementBlockedCount} blocked hard-gate requirements` : "none",
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentPrivateEditSafety = buildCurrentPrivateEditSafetySummary({
    currentActionSummary: {
      ...currentActionSummary,
      currentEnvEditTarget: localEnvEditTarget
    },
    currentEnvEditTarget: localEnvEditTarget,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentInputShapeChecklist = buildCurrentInputShapeChecklistSummary({
    currentActionSummary,
    doctorReleaseChannelFocus,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const currentLocalEnvDiagnostics = buildCurrentLocalEnvDiagnosticsSummary({
    externalPreflight,
    releaseDoctor,
    currentEnvEditTarget: localEnvEditTarget,
    currentPlaceholderKeyCount: currentActionSummary.currentPlaceholderKeyCount ?? 0
  });
  const releaseChannelPostEditReceipt = buildReleaseChannelPostEditReceiptSummary({
    currentActionSummary: {
      ...currentActionSummary,
      currentEnvEditTarget: localEnvEditTarget
    },
    currentActionAcceptance,
    currentActionPostEditVerification,
    currentInputShapeChecklist,
    currentLocalEnvDiagnostics,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const releaseChannelPostEditOperatorReceipt = buildReleaseChannelPostEditOperatorReceiptSummary({
    currentActionSummary: {
      ...currentActionSummary,
      currentEnvEditTarget: localEnvEditTarget
    },
    releaseChannelPostEditReceipt,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const postEditProofSequenceReceipt = buildPostEditProofSequenceReceiptSummary({
    currentActionSummary: {
      ...currentActionSummary,
      currentEnvEditTarget: localEnvEditTarget
    },
    releaseChannelPostEditOperatorReceipt,
    hardExternalGateCommand: "npm run release:external-check"
  });
  const nextActionPreview = buildNextActionPreviewSummary(priorityActions);

  nextActionsReport = {
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
    prerequisiteCommand: "npm run release:check",
    externalNextActionsMarkdownPath: relative(nextActionsMarkdownPath),
    externalNextActionsJsonPath: relative(nextActionsJsonPath),
    productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
    nextActionsScope: "value-free prioritized external distribution operator actions from redacted preflight and remediation evidence",
    bootstrapMode: false,
    preflightRunAttempted: preflightRun.attempted,
    preflightRunSucceeded: preflightRun.succeeded,
    preflightExitStatus: preflightRun.status,
    preflightOutputRecorded: false,
    sourceArtifacts: artifactRows,
    missingSourceArtifacts: [],
    sourceEvidenceReady,
    completionStage,
    currentFocus,
    ...currentActionSummary,
    ...completionGap,
    ...doctorCompletionGap,
    ...doctorPrepareEnvAudit,
    ...doctorReleaseChannelFocus,
    ...doctorPostEditProof,
    ...currentPlaceholderRemediation,
    ...currentProofChecklist,
    ...currentCommandVerification,
    ...currentActionAcceptance,
    ...currentActionPostEditVerification,
    ...currentActionHandoff,
    ...currentPrivateEditSafety,
    ...currentInputShapeChecklist,
    ...currentLocalEnvDiagnostics,
    ...releaseChannelPostEditReceipt,
    ...releaseChannelPostEditOperatorReceipt,
    ...postEditProofSequenceReceipt,
    ...nextActionPreview,
    localReleaseReady: externalPreflight.localReleaseReady === true,
    localReleaseReadinessPercent: externalPreflight.localReleaseReadinessPercent ?? 0,
    externalDistributionReady: externalPreflight.externalDistributionReady === true,
    externalDistributionGateReady: externalPreflight.externalDistributionGateReady === true,
    hardGateWouldFail: externalPreflight.hardGateWouldFail === true,
    gateRequirementTotal,
    gateRequirementReadyCount,
    gateRequirementReadinessPercent,
    remediationTotal: externalPreflight.remediationTotal ?? completionProgress.remediationTotal ?? 0,
    remediationReadyCount: externalPreflight.remediationReadyCount ?? completionProgress.remediationReadyCount ?? 0,
    remediationReadinessPercent: externalPreflight.remediationReadinessPercent ?? completionProgress.remediationReadinessPercent ?? 0,
    privateInputGroupTotal: externalPreflight.privateInputGroupTotal ?? releaseDoctor.privateInputGroupTotal ?? 0,
    privateInputGroupReadyCount: externalPreflight.privateInputGroupReadyCount ?? releaseDoctor.privateInputGroupReadyCount ?? 0,
    manualQaChecklistDigestAvailable: externalPreflight.manualQaChecklistDigestAvailable === true || externalRunbook.manualQaChecklistSha256 !== null,
    currentEnvEditTarget: localEnvEditTarget,
    currentEnvConfiguredFileKey: distributionLocalEnvDefaults.configuredFileKey,
    localEnvFilesChecked,
    localEnvPresentFiles,
    localEnvFileLoaded,
    localEnvPlaceholderKeyCount,
    localEnvPlaceholderKeys,
    localEnvPlaceholderLocations,
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
    nextActionsReport.currentActionPostEditVerificationReady === true &&
    nextActionsReport.currentActionHandoffReady === true &&
    nextActionsReport.currentPrivateEditSafetyReady === true &&
    nextActionsReport.currentInputShapeChecklistReady === true &&
    nextActionsReport.currentLocalEnvDiagnosticsReady === true &&
    nextActionsReport.releaseChannelPostEditReceiptReady === true &&
    nextActionsReport.releaseChannelPostEditOperatorReceiptReady === true &&
    nextActionsReport.nextActionPreviewReady === true &&
    nextActionsReport.sourceValueRecorded === false &&
    nextActionsReport.sourceClaimedExternalDistribution === false;
}

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
check(nextActionsReport.prerequisiteCommand === "npm run release:check", "external next actions should include the source evidence prerequisite");
check(nextActionsReport.productScope.includes("all-genre direct beat workstation"), "external next actions should describe direct beat workstation scope");
check(nextActionsReport.productScope.includes("sampling optional"), "external next actions should keep sampling optional");
check(Array.isArray(nextActionsReport.sourceArtifacts), "external next actions should cite source artifacts");
check(nextActionsReport.externalNextActionsReady === true, "external next actions should be ready from redacted preflight evidence");
check(typeof nextActionsReport.currentActionId === "string" && nextActionsReport.currentActionId.length > 0, "external next actions should include the current action id");
check(typeof nextActionsReport.currentActionLabel === "string" && nextActionsReport.currentActionLabel.length > 0, "external next actions should include the current action label");
check(typeof nextActionsReport.currentNextCommand === "string" && nextActionsReport.currentNextCommand.length > 0, "external next actions should include the current next command");
check(typeof nextActionsReport.currentFirstBlocker === "string" && nextActionsReport.currentFirstBlocker.length > 0, "external next actions should include the current first blocker");
check(typeof nextActionsReport.completionGapStatus === "string" && nextActionsReport.completionGapStatus.length > 0, "external next actions should include the completion gap status");
check(typeof nextActionsReport.completionGapSummary === "string" && nextActionsReport.completionGapSummary.length > 0, "external next actions should include the completion gap summary");
check(
  typeof nextActionsReport.completionGapCurrentProofTarget === "string" && nextActionsReport.completionGapCurrentProofTarget.length > 0,
  "external next actions should include the completion gap proof target"
);
check(
  nextActionsReport.completionGapNextProofCommand === nextActionsReport.currentNextCommand,
  "external next actions completion gap should mirror the current next proof command"
);
check(
  nextActionsReport.completionGapHardGateCommand === nextActionsReport.hardExternalGateCommand,
  "external next actions completion gap should keep the hard gate command"
);
check(
  nextActionsReport.completionGapFirstBlocker === nextActionsReport.currentFirstBlocker,
  "external next actions completion gap should mirror the current first blocker"
);
check(Array.isArray(nextActionsReport.completionGapClaimBlockers), "external next actions should include completion gap claim blockers");
check(nextActionsReport.completionGapClaimBlockerCount === nextActionsReport.completionGapClaimBlockers.length, "external next actions completion gap blocker count should match listed blockers");
check(
  typeof nextActionsReport.completionGapClaimBlockerSummary === "string" && nextActionsReport.completionGapClaimBlockerSummary.length > 0,
  "external next actions should include the completion gap blocker summary"
);
check(nextActionsReport.completionGapClaimedExternalDistribution === false, "external next actions completion gap should not claim external distribution");
check(nextActionsReport.completionGapValueRecorded === false, "external next actions completion gap should not record values");
check(nextActionsReport.doctorCompletionGapSourceArtifact === "Release doctor", "external next actions should identify the release doctor completion gap source");
check(typeof nextActionsReport.doctorCompletionGapSourcePath === "string" && nextActionsReport.doctorCompletionGapSourcePath.length > 0, "external next actions should include the release doctor completion gap source path");
check(typeof nextActionsReport.doctorCompletionGapSourceReady === "boolean", "external next actions should include release doctor completion gap source readiness");
check(typeof nextActionsReport.doctorCompletionGapDoctorReportReady === "boolean", "external next actions should include release doctor report readiness");
check(typeof nextActionsReport.doctorCompletionGapStatus === "string" && nextActionsReport.doctorCompletionGapStatus.length > 0, "external next actions should include the release doctor completion gap status");
check(typeof nextActionsReport.doctorCompletionGapSummary === "string" && nextActionsReport.doctorCompletionGapSummary.length > 0, "external next actions should include the release doctor completion gap summary");
check(
  typeof nextActionsReport.doctorCompletionGapCompletionStage === "string" && nextActionsReport.doctorCompletionGapCompletionStage.length > 0,
  "external next actions should include the release doctor completion gap completion stage"
);
check(
  typeof nextActionsReport.doctorCompletionGapProofTarget === "string" && nextActionsReport.doctorCompletionGapProofTarget.length > 0,
  "external next actions should include the release doctor completion gap proof target"
);
check(
  typeof nextActionsReport.doctorCompletionGapNextProofCommand === "string" && nextActionsReport.doctorCompletionGapNextProofCommand.length > 0,
  "external next actions should include the release doctor completion gap next proof command"
);
check(
  nextActionsReport.doctorCompletionGapHardGateCommand === nextActionsReport.hardExternalGateCommand,
  "external next actions release doctor completion gap should keep the hard gate command"
);
check(
  typeof nextActionsReport.doctorCompletionGapFirstBlocker === "string" && nextActionsReport.doctorCompletionGapFirstBlocker.length > 0,
  "external next actions should include the release doctor completion gap first blocker"
);
check(Array.isArray(nextActionsReport.doctorCompletionGapClaimBlockers), "external next actions should include release doctor completion gap claim blockers");
check(
  nextActionsReport.doctorCompletionGapClaimBlockerCount === nextActionsReport.doctorCompletionGapClaimBlockers.length,
  "external next actions release doctor completion gap blocker count should match listed blockers"
);
check(
  typeof nextActionsReport.doctorCompletionGapClaimBlockerSummary === "string" && nextActionsReport.doctorCompletionGapClaimBlockerSummary.length > 0,
  "external next actions should include the release doctor completion gap blocker summary"
);
check(nextActionsReport.doctorCompletionGapClaimedExternalDistribution === false, "external next actions release doctor completion gap should not claim external distribution");
check(nextActionsReport.doctorCompletionGapValueRecorded === false, "external next actions release doctor completion gap should not record values");
check(nextActionsReport.doctorCompletionGapSourceValueRecorded === false, "external next actions release doctor completion gap source should not record values");
check(
  nextActionsReport.doctorCompletionGapSourceClaimedExternalDistribution === false,
  "external next actions release doctor completion gap source should not claim external distribution"
);
check(nextActionsReport.doctorPrepareEnvAuditSourceArtifact === "Release doctor", "external next actions should identify the release doctor prepare-env audit source");
check(typeof nextActionsReport.doctorPrepareEnvAuditSourcePath === "string" && nextActionsReport.doctorPrepareEnvAuditSourcePath.length > 0, "external next actions should include the release doctor prepare-env audit source path");
check(typeof nextActionsReport.doctorPrepareEnvAuditSourceReady === "boolean", "external next actions should include release doctor prepare-env audit source readiness");
check(typeof nextActionsReport.doctorPrepareEnvAuditDoctorReportReady === "boolean", "external next actions should include release doctor prepare-env audit doctor readiness");
check(Array.isArray(nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvFilesChecked), "external next actions should include doctor prepare-env existing local env files checked");
check(Array.isArray(nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPresentFiles), "external next actions should include doctor prepare-env existing local env present files");
check(typeof nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvFileLoaded === "boolean", "external next actions should include doctor prepare-env existing local env loaded status");
check(Number.isInteger(nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeyCount), "external next actions should include doctor prepare-env existing local env placeholder key count");
check(typeof nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeySummary === "string", "external next actions should include doctor prepare-env existing local env placeholder key summary");
check(Array.isArray(nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeys), "external next actions should include doctor prepare-env existing local env placeholder keys");
check(
  nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeyCount === nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeys.length,
  "external next actions doctor prepare-env existing local env placeholder key count should match listed keys"
);
check(Number.isInteger(nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocationCount), "external next actions should include doctor prepare-env existing local env placeholder edit location count");
check(typeof nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocationSummary === "string", "external next actions should include doctor prepare-env existing local env placeholder edit location summary");
check(Array.isArray(nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocations), "external next actions should include doctor prepare-env existing local env placeholder edit locations");
check(
  nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocationCount === nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderEditLocations.length,
  "external next actions doctor prepare-env existing local env placeholder edit location count should match listed locations"
);
check(Number.isInteger(nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderKeyCount), "external next actions should include doctor prepare-env release-channel placeholder key count");
check(typeof nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderKeySummary === "string", "external next actions should include doctor prepare-env release-channel placeholder key summary");
check(Array.isArray(nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderKeys), "external next actions should include doctor prepare-env release-channel placeholder keys");
check(
  nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderKeyCount === nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderKeys.length,
  "external next actions doctor prepare-env release-channel placeholder key count should match listed keys"
);
check(Number.isInteger(nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocationCount), "external next actions should include doctor prepare-env release-channel placeholder edit location count");
check(typeof nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocationSummary === "string", "external next actions should include doctor prepare-env release-channel placeholder edit location summary");
check(Array.isArray(nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocations), "external next actions should include doctor prepare-env release-channel placeholder edit locations");
check(
  nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocationCount === nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocations.length,
  "external next actions doctor prepare-env release-channel placeholder edit location count should match listed locations"
);
check(
  nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocations.every(
    (item) =>
      typeof item.key === "string" &&
      typeof item.file === "string" &&
      item.file.length > 0 &&
      Number.isInteger(item.line) &&
      item.line > 0 &&
      item.placeholder === true &&
      item.valueRecorded === false
  ),
  "external next actions doctor prepare-env release-channel placeholder edit locations should include only value-free file, line, and key rows"
);
check(nextActionsReport.doctorPrepareEnvAuditValueRecorded === false, "external next actions doctor prepare-env audit should not record values");
check(nextActionsReport.doctorPrepareEnvAuditClaimedExternalDistribution === false, "external next actions doctor prepare-env audit should not claim external distribution");
check(nextActionsReport.doctorReleaseChannelFocusSourceArtifact === "Release doctor", "external next actions should identify the release doctor focus source");
check(typeof nextActionsReport.doctorReleaseChannelFocusSourcePath === "string" && nextActionsReport.doctorReleaseChannelFocusSourcePath.length > 0, "external next actions should include the release doctor focus source path");
check(typeof nextActionsReport.doctorReleaseChannelFocusSourceReady === "boolean", "external next actions should include release doctor focus source readiness");
check(typeof nextActionsReport.doctorReleaseChannelFocusDoctorReportReady === "boolean", "external next actions should include release doctor focus doctor readiness");
check(typeof nextActionsReport.doctorReleaseChannelFocusReceiptReady === "boolean", "external next actions should include release doctor focus receipt readiness");
check(typeof nextActionsReport.doctorReleaseChannelFocusCurrentReady === "boolean", "external next actions should include release doctor focus current action readiness");
check(Number.isInteger(nextActionsReport.doctorReleaseChannelFocusCurrentReadyCount), "external next actions should include release doctor focus current-ready count");
check(Number.isInteger(nextActionsReport.doctorReleaseChannelFocusRowCount), "external next actions should include release doctor focus row count");
check(typeof nextActionsReport.doctorReleaseChannelFocusSummary === "string", "external next actions should include release doctor focus summary");
check(Array.isArray(nextActionsReport.doctorReleaseChannelFocusRows), "external next actions should include release doctor focus rows");
check(Number.isInteger(nextActionsReport.doctorReleaseChannelFocusPlaceholderKeyCount), "external next actions should include release doctor focus placeholder key count");
check(Array.isArray(nextActionsReport.doctorReleaseChannelFocusPlaceholderKeys), "external next actions should include release doctor focus placeholder keys");
check(typeof nextActionsReport.doctorReleaseChannelFocusProofCommand === "string" && nextActionsReport.doctorReleaseChannelFocusProofCommand.length > 0, "external next actions should include release doctor focus proof command");
check(typeof nextActionsReport.doctorReleaseChannelFocusRerunCommand === "string" && nextActionsReport.doctorReleaseChannelFocusRerunCommand.length > 0, "external next actions should include release doctor focus rerun command");
check(nextActionsReport.doctorReleaseChannelFocusRowCount === nextActionsReport.doctorReleaseChannelFocusRows.length, "external next actions release doctor focus row count should match listed rows");
check(
  nextActionsReport.doctorReleaseChannelFocusCurrentReadyCount ===
    nextActionsReport.doctorReleaseChannelFocusRows.filter((row) => row.currentReady === true).length,
  "external next actions release doctor focus current-ready count should match listed rows"
);
check(
  nextActionsReport.doctorReleaseChannelFocusPlaceholderKeyCount === nextActionsReport.doctorReleaseChannelFocusPlaceholderKeys.length,
  "external next actions release doctor focus placeholder key count should match listed keys"
);
check(
  nextActionsReport.doctorReleaseChannelFocusRows.every(
    (row) =>
      releaseChannelMetadataKeys.includes(row.key) &&
      typeof row.present === "boolean" &&
      typeof row.placeholder === "boolean" &&
      typeof row.shapeReady === "boolean" &&
      typeof row.currentReady === "boolean" &&
      typeof row.evidence === "string" &&
      row.evidence.length > 0 &&
      typeof row.expectedSignal === "string" &&
      row.expectedSignal.length > 0 &&
      row.proofCommand === nextActionsReport.doctorReleaseChannelFocusProofCommand &&
      row.rerunCommand === nextActionsReport.doctorReleaseChannelFocusRerunCommand &&
      row.valueRecorded === false
  ),
  "external next actions release doctor focus rows should cover value-free current release-channel metadata evidence"
);
check(
  releaseChannelMetadataKeys.every((key) => nextActionsReport.doctorReleaseChannelFocusRows.some((row) => row.key === key)) ||
    nextActionsReport.doctorReleaseChannelFocusRows.length === 0,
  "external next actions release doctor focus rows should cover the four release-channel metadata keys when source evidence exists"
);
check(nextActionsReport.doctorReleaseChannelFocusProofCommand === "npm run desktop:distribution-private-inputs-smoke", "external next actions release doctor focus proof command should be private-inputs smoke");
check(nextActionsReport.doctorReleaseChannelFocusRerunCommand === "npm run release:doctor", "external next actions release doctor focus rerun command should be release doctor");
check(nextActionsReport.doctorReleaseChannelFocusValueRecorded === false, "external next actions release doctor focus should not record values");
check(nextActionsReport.doctorReleaseChannelFocusClaimedExternalDistribution === false, "external next actions release doctor focus should not claim external distribution");
check(nextActionsReport.doctorPostEditProofSourceArtifact === "Release doctor", "external next actions should identify the release doctor post-edit proof source");
check(typeof nextActionsReport.doctorPostEditProofSourcePath === "string" && nextActionsReport.doctorPostEditProofSourcePath.length > 0, "external next actions should include the release doctor post-edit proof source path");
check(typeof nextActionsReport.doctorPostEditProofSourceReady === "boolean", "external next actions should include release doctor post-edit proof source readiness");
check(typeof nextActionsReport.doctorPostEditProofDoctorReportReady === "boolean", "external next actions should include release doctor post-edit proof doctor readiness");
check(typeof nextActionsReport.doctorPostEditProofCurrentActionId === "string", "external next actions should include release doctor post-edit proof current action id");
check(typeof nextActionsReport.doctorPostEditProofCurrentActionLabel === "string", "external next actions should include release doctor post-edit proof current action label");
check(typeof nextActionsReport.doctorPostEditProofCommand === "string" && nextActionsReport.doctorPostEditProofCommand.length > 0, "external next actions should include release doctor post-edit proof command");
check(typeof nextActionsReport.doctorPostEditProofRole === "string" && nextActionsReport.doctorPostEditProofRole.length > 0, "external next actions should include release doctor post-edit proof role");
check(typeof nextActionsReport.doctorPostEditProofMatchesRecommended === "boolean", "external next actions should include release doctor post-edit proof recommended match");
check(nextActionsReport.doctorPostEditProofValueRecorded === false, "external next actions release doctor post-edit proof should not record values");
check(nextActionsReport.doctorPostEditProofClaimedExternalDistribution === false, "external next actions release doctor post-edit proof should not claim external distribution");
if (releaseDoctorSource !== null) {
  check(nextActionsReport.doctorReleaseChannelFocusSourceReady === true, "external next actions should report ready release doctor focus source evidence when release doctor exists");
  check(nextActionsReport.doctorReleaseChannelFocusDoctorReportReady === true, "external next actions should report ready release doctor focus doctor evidence when release doctor exists");
  check(nextActionsReport.doctorReleaseChannelFocusReceiptReady === releaseDoctorSource.releaseChannelFocusReceiptReady, "external next actions should mirror release doctor focus receipt readiness");
  check(nextActionsReport.doctorReleaseChannelFocusCurrentReady === releaseDoctorSource.releaseChannelFocusCurrentReady, "external next actions should mirror release doctor focus current readiness");
  check(nextActionsReport.doctorReleaseChannelFocusRowCount === releaseDoctorSource.releaseChannelFocusRowCount, "external next actions should mirror release doctor focus row count");
  check(
    JSON.stringify(nextActionsReport.doctorReleaseChannelFocusRows) === JSON.stringify(valueFreeObjectRows(releaseDoctorSource.releaseChannelFocusRows)),
    "external next actions should mirror release doctor focus rows"
  );
  check(
    nextActionsReport.doctorReleaseChannelFocusPlaceholderKeyCount === releaseDoctorSource.releaseChannelFocusPlaceholderKeyCount,
    "external next actions should mirror release doctor focus placeholder key count"
  );
  check(
    JSON.stringify(nextActionsReport.doctorReleaseChannelFocusPlaceholderKeys) === JSON.stringify(arrayField(releaseDoctorSource, "releaseChannelFocusPlaceholderKeys")),
    "external next actions should mirror release doctor focus placeholder keys"
  );
  check(nextActionsReport.doctorPostEditProofSourceReady === true, "external next actions should report ready release doctor post-edit proof source evidence when release doctor exists");
  check(nextActionsReport.doctorPostEditProofDoctorReportReady === true, "external next actions should report ready release doctor post-edit proof doctor evidence when release doctor exists");
  check(
    nextActionsReport.doctorPostEditProofCurrentActionId === stringField(releaseDoctorSource, "currentActionId", "none"),
    "external next actions should mirror release doctor post-edit proof current action id"
  );
  check(
    nextActionsReport.doctorPostEditProofCommand === stringField(releaseDoctorSource, "currentActionPostEditProofCommand", "none"),
    "external next actions should mirror release doctor post-edit proof command"
  );
  check(
    nextActionsReport.doctorPostEditProofRole === stringField(releaseDoctorSource, "currentActionPostEditProofRole", "none"),
    "external next actions should mirror release doctor post-edit proof role"
  );
  check(
    nextActionsReport.doctorPostEditProofValueRecorded === booleanField(releaseDoctorSource, "currentActionPostEditProofValueRecorded", false),
    "external next actions should mirror release doctor post-edit proof value redaction"
  );
}
check(typeof nextActionsReport.currentPrerequisiteCommand === "string" && nextActionsReport.currentPrerequisiteCommand.length > 0, "external next actions should include the current prerequisite command");
check(typeof nextActionsReport.currentOperatorAction === "string" && nextActionsReport.currentOperatorAction.length > 0, "external next actions should include the current operator action");
check(typeof nextActionsReport.currentRerunCommand === "string" && nextActionsReport.currentRerunCommand.length > 0, "external next actions should include the current rerun command");
check(Number.isInteger(nextActionsReport.currentRequiredKeyCount), "external next actions should include the current required key count");
check(typeof nextActionsReport.currentRequiredKeySummary === "string" && nextActionsReport.currentRequiredKeySummary.length > 0, "external next actions should include the current required key summary");
check(Number.isInteger(nextActionsReport.currentPlaceholderKeyCount), "external next actions should include the current placeholder key count");
check(typeof nextActionsReport.currentPlaceholderKeySummary === "string" && nextActionsReport.currentPlaceholderKeySummary.length > 0, "external next actions should include the current placeholder key summary");
check(Number.isInteger(nextActionsReport.currentPlaceholderEditLocationCount), "external next actions should include the current placeholder edit location count");
check(
  typeof nextActionsReport.currentPlaceholderEditLocationSummary === "string" && nextActionsReport.currentPlaceholderEditLocationSummary.length > 0,
  "external next actions should include the current placeholder edit location summary"
);
check(Number.isInteger(nextActionsReport.currentEnvKeyGuidanceCount), "external next actions should include the current env key guidance count");
check(typeof nextActionsReport.currentEnvKeyGuidanceSummary === "string" && nextActionsReport.currentEnvKeyGuidanceSummary.length > 0, "external next actions should include the current env key guidance summary");
check(Number.isInteger(nextActionsReport.currentEnvEditTemplateCount), "external next actions should include the current env edit template count");
check(
  typeof nextActionsReport.currentEnvEditTemplateSummary === "string" && nextActionsReport.currentEnvEditTemplateSummary.length > 0,
  "external next actions should include the current env edit template summary"
);
check(Number.isInteger(nextActionsReport.currentEnvEditRowsCount), "external next actions should include the current env edit rows count");
check(
  typeof nextActionsReport.currentEnvEditRowsSummary === "string" && nextActionsReport.currentEnvEditRowsSummary.length > 0,
  "external next actions should include the current env edit rows summary"
);
check(Number.isInteger(nextActionsReport.currentPlaceholderRemediationRowCount), "external next actions should include the current placeholder remediation row count");
check(
  typeof nextActionsReport.currentPlaceholderRemediationRowSummary === "string" && nextActionsReport.currentPlaceholderRemediationRowSummary.length > 0,
  "external next actions should include the current placeholder remediation row summary"
);
check(Number.isInteger(nextActionsReport.currentEvidenceRowsCount), "external next actions should include the current evidence rows count");
check(
  typeof nextActionsReport.currentEvidenceRowsSummary === "string" && nextActionsReport.currentEvidenceRowsSummary.length > 0,
  "external next actions should include the current evidence rows summary"
);
check(Number.isInteger(nextActionsReport.currentEvidenceLabelCount), "external next actions should include the current evidence label count");
check(
  typeof nextActionsReport.currentEvidenceLabelSummary === "string" && nextActionsReport.currentEvidenceLabelSummary.length > 0,
  "external next actions should include the current evidence label summary"
);
check(Number.isInteger(nextActionsReport.currentReadyCriteriaCount), "external next actions should include the current ready criteria count");
check(typeof nextActionsReport.currentReadyCriteriaSummary === "string" && nextActionsReport.currentReadyCriteriaSummary.length > 0, "external next actions should include the current ready criteria summary");
check(Number.isInteger(nextActionsReport.currentProofChecklistRowCount), "external next actions should include the current proof checklist row count");
check(
  typeof nextActionsReport.currentProofChecklistRowSummary === "string" && nextActionsReport.currentProofChecklistRowSummary.length > 0,
  "external next actions should include the current proof checklist row summary"
);
check(Number.isInteger(nextActionsReport.currentActionChecklistCount), "external next actions should include the current action checklist count");
check(typeof nextActionsReport.currentActionChecklistSummary === "string" && nextActionsReport.currentActionChecklistSummary.length > 0, "external next actions should include the current action checklist summary");
check(Number.isInteger(nextActionsReport.currentPrerequisiteCommandCount), "external next actions should include the current prerequisite command count");
check(
  typeof nextActionsReport.currentPrerequisiteCommandSummary === "string" && nextActionsReport.currentPrerequisiteCommandSummary.length > 0,
  "external next actions should include the current prerequisite command summary"
);
check(Number.isInteger(nextActionsReport.currentRerunCommandCount), "external next actions should include the current rerun command count");
check(
  typeof nextActionsReport.currentRerunCommandSummary === "string" && nextActionsReport.currentRerunCommandSummary.length > 0,
  "external next actions should include the current rerun command summary"
);
check(Number.isInteger(nextActionsReport.currentCommandSequenceCount), "external next actions should include the current command sequence count");
check(
  typeof nextActionsReport.currentCommandSequenceSummary === "string" && nextActionsReport.currentCommandSequenceSummary.length > 0,
  "external next actions should include the current command sequence summary"
);
check(Number.isInteger(nextActionsReport.currentCommandVerificationRowCount), "external next actions should include the current command verification row count");
check(
  typeof nextActionsReport.currentCommandVerificationRowSummary === "string" && nextActionsReport.currentCommandVerificationRowSummary.length > 0,
  "external next actions should include the current command verification row summary"
);
check(typeof nextActionsReport.currentEnvEditTarget === "string" && nextActionsReport.currentEnvEditTarget.length > 0, "external next actions should include the current env edit target");
check(nextActionsReport.currentEnvConfiguredFileKey === "GROOVEFORGE_DISTRIBUTION_ENV_FILE", "external next actions should include the env file override key name");
check(Array.isArray(nextActionsReport.localEnvFilesChecked), "external next actions should include local env files checked");
check(Array.isArray(nextActionsReport.localEnvPresentFiles), "external next actions should include local env present files");
check(Array.isArray(nextActionsReport.currentRequiredKeys), "external next actions should include current required keys");
check(Array.isArray(nextActionsReport.currentPlaceholderKeys), "external next actions should include current placeholder keys");
check(Array.isArray(nextActionsReport.currentPlaceholderEditLocations), "external next actions should include current placeholder edit locations");
check(Array.isArray(nextActionsReport.currentEnvKeyGuidance), "external next actions should include current env key guidance");
check(Array.isArray(nextActionsReport.currentEnvEditTemplate), "external next actions should include current env edit template");
check(Array.isArray(nextActionsReport.currentEnvEditRows), "external next actions should include current env edit rows");
check(Array.isArray(nextActionsReport.currentPlaceholderRemediationRows), "external next actions should include current placeholder remediation rows");
check(Array.isArray(nextActionsReport.currentEvidenceRows), "external next actions should include current evidence rows");
check(Array.isArray(nextActionsReport.currentEvidenceLabels), "external next actions should include current evidence labels");
check(Array.isArray(nextActionsReport.currentReadyCriteria), "external next actions should include current ready criteria");
check(Array.isArray(nextActionsReport.currentProofChecklistRows), "external next actions should include current proof checklist rows");
check(Array.isArray(nextActionsReport.currentActionChecklist), "external next actions should include current action checklist");
check(Array.isArray(nextActionsReport.currentPrerequisiteCommands), "external next actions should include current prerequisite commands");
check(Array.isArray(nextActionsReport.currentOperatorActions), "external next actions should include current operator actions");
check(Array.isArray(nextActionsReport.currentRerunCommands), "external next actions should include current rerun commands");
check(Array.isArray(nextActionsReport.currentCommandSequence), "external next actions should include current command sequence");
check(Array.isArray(nextActionsReport.currentCommandVerificationRows), "external next actions should include current command verification rows");
check(
  nextActionsReport.currentRequiredKeyCount === nextActionsReport.currentRequiredKeys.length,
  "external next actions current required key count should match listed keys"
);
check(
  nextActionsReport.currentPlaceholderKeyCount === nextActionsReport.currentPlaceholderKeys.length,
  "external next actions current placeholder key count should match listed keys"
);
check(
  nextActionsReport.currentPlaceholderEditLocationCount === nextActionsReport.currentPlaceholderEditLocations.length,
  "external next actions current placeholder edit location count should match listed locations"
);
check(
  nextActionsReport.currentEnvKeyGuidanceCount === nextActionsReport.currentEnvKeyGuidance.length,
  "external next actions current env key guidance count should match listed guidance"
);
check(
  nextActionsReport.currentEnvEditTemplateCount === nextActionsReport.currentEnvEditTemplate.length,
  "external next actions current env edit template count should match listed assignments"
);
check(
  nextActionsReport.currentEnvEditRowsCount === nextActionsReport.currentEnvEditRows.length,
  "external next actions current env edit rows count should match listed rows"
);
check(
  nextActionsReport.currentPlaceholderRemediationRowCount === nextActionsReport.currentPlaceholderRemediationRows.length,
  "external next actions current placeholder remediation row count should match listed rows"
);
check(
  nextActionsReport.currentEvidenceRowsCount === nextActionsReport.currentEvidenceRows.length,
  "external next actions current evidence rows count should match listed rows"
);
check(
  nextActionsReport.currentEvidenceLabelCount === nextActionsReport.currentEvidenceLabels.length,
  "external next actions current evidence label count should match listed labels"
);
check(
  nextActionsReport.currentEvidenceLabelCount === nextActionsReport.currentEvidenceRowsCount,
  "external next actions current evidence label count should match current evidence rows"
);
check(
  nextActionsReport.currentProofChecklistRowCount === nextActionsReport.currentProofChecklistRows.length,
  "external next actions current proof checklist row count should match listed rows"
);
check(
  nextActionsReport.currentCommandVerificationRowCount === nextActionsReport.currentCommandVerificationRows.length,
  "external next actions current command verification row count should match listed rows"
);
check(
  nextActionsReport.currentEnvEditTemplate.every(
    (item) =>
      nextActionsReport.currentRequiredKeys.includes(item.key) &&
      typeof item.placeholder === "string" &&
      item.placeholder.startsWith("<") &&
      item.placeholder.endsWith(">") &&
      item.assignment === `${item.key}=${item.placeholder}` &&
      item.valueRecorded === false
  ),
  "external next actions current env edit template should contain only value-free assignments for current required keys"
);
check(
  nextActionsReport.currentEnvEditRows.every((item) => {
    const matchingTemplate = nextActionsReport.currentEnvEditTemplate.find((template) => template.key === item.key);
    return (
      nextActionsReport.currentRequiredKeys.includes(item.key) &&
      matchingTemplate &&
      item.assignment === matchingTemplate.assignment &&
      item.placeholderShape === matchingTemplate.placeholder &&
      item.editTarget === nextActionsReport.currentEnvEditTarget &&
      item.placeholder === nextActionsReport.currentPlaceholderKeys.includes(item.key) &&
      typeof item.file === "string" &&
      item.file.length > 0 &&
      (item.line === null || (Number.isInteger(item.line) && item.line > 0)) &&
      item.locationKnown === (item.line !== null) &&
      item.location === (item.line === null ? `${item.file}:line-after-scaffold` : `${item.file}:${item.line}`) &&
      typeof item.guidance === "string" &&
      item.guidance.length > 0 &&
      item.valueRecorded === false
    );
  }),
  "external next actions current env edit rows should combine value-free assignment, location, guidance, and placeholder status"
);
check(
  nextActionsReport.currentPlaceholderRemediationRows.every((item) => {
    const matchingEnvRow = nextActionsReport.currentEnvEditRows.find((row) => row.key === item.key);
    const matchingDoctorLocation = nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocations.find((location) => location.key === item.key);
    return (
      matchingEnvRow &&
      nextActionsReport.currentPlaceholderKeys.includes(item.key) &&
      item.editTarget === nextActionsReport.currentEnvEditTarget &&
      item.assignment === matchingEnvRow.assignment &&
      item.guidance === matchingEnvRow.guidance &&
      item.placeholder === true &&
      item.sourceArtifact === "Release doctor" &&
      item.sourcePath === nextActionsReport.doctorPrepareEnvAuditSourcePath &&
      item.sourceReady === nextActionsReport.doctorPrepareEnvAuditSourceReady &&
      item.doctorReportReady === nextActionsReport.doctorPrepareEnvAuditDoctorReportReady &&
      item.nextCommand === nextActionsReport.currentNextCommand &&
      item.rerunCommand === nextActionsReport.currentRerunCommand &&
      item.valueRecorded === false &&
      (!matchingDoctorLocation ||
        (item.file === matchingDoctorLocation.file &&
          item.line === matchingDoctorLocation.line &&
          item.location === `${matchingDoctorLocation.file}:${matchingDoctorLocation.line}`))
    );
  }),
  "external next actions current placeholder remediation rows should combine current env rows with release doctor file-line evidence without values"
);
check(
  nextActionsReport.currentPlaceholderRemediationRows.every(
    (item) =>
      typeof item.key === "string" &&
      typeof item.location === "string" &&
      typeof item.assignment === "string" &&
      typeof item.guidance === "string" &&
      typeof item.sourcePath === "string" &&
      typeof item.nextCommand === "string" &&
      typeof item.rerunCommand === "string"
  ),
  "external next actions current placeholder remediation rows should include key, location, assignment, guidance, source, and commands"
);
check(
  nextActionsReport.currentEvidenceRows.every(
    (item) =>
      typeof item.label === "string" &&
      item.label.length > 0 &&
      !isGenericEvidenceLabel(item.label) &&
      typeof item.path === "string" &&
      item.path.length > 0 &&
      typeof item.present === "boolean" &&
      item.valueRecorded === false
  ),
  "external next actions current evidence rows should cite stable value-free artifact labels and paths"
);
check(
  nextActionsReport.currentEvidenceLabels.every((label, index) => label === nextActionsReport.currentEvidenceRows[index]?.label && !isGenericEvidenceLabel(label)),
  "external next actions current evidence labels should mirror stable evidence row labels"
);
check(
  nextActionsReport.currentEvidenceLabelSummary === formatEvidenceLabelSummary(nextActionsReport.currentEvidenceRows),
  "external next actions current evidence label summary should list stable evidence row labels"
);
check(
  nextActionsReport.currentReadyCriteriaCount === nextActionsReport.currentReadyCriteria.length,
  "external next actions current ready criteria count should match listed criteria"
);
check(
  nextActionsReport.currentProofChecklistRowCount === nextActionsReport.currentReadyCriteriaCount,
  "external next actions current proof checklist row count should match current ready criteria count"
);
check(
  nextActionsReport.currentProofChecklistRows.every((item, index) => {
    const expectedRerunCommand =
      nextActionsReport.currentRerunCommand && nextActionsReport.currentRerunCommand !== "none"
        ? nextActionsReport.currentRerunCommand
        : nextActionsReport.currentNextCommand;
    const expectedEvidencePaths = nextActionsReport.currentEvidenceRows.map((row) => row.path);
    const expectedEvidenceReady = nextActionsReport.currentEvidenceRows.length > 0 && nextActionsReport.currentEvidenceRows.every((row) => row.present === true);
    return (
      item.order === index + 1 &&
      item.criterion === nextActionsReport.currentReadyCriteria[index] &&
      Array.isArray(item.evidenceLabels) &&
      JSON.stringify(item.evidenceLabels) === JSON.stringify(nextActionsReport.currentEvidenceLabels) &&
      Array.isArray(item.evidencePaths) &&
      JSON.stringify(item.evidencePaths) === JSON.stringify(expectedEvidencePaths) &&
      item.evidenceReady === expectedEvidenceReady &&
      item.evidenceSummary === nextActionsReport.currentEvidenceLabelSummary &&
      item.proofCommand === nextActionsReport.currentNextCommand &&
      item.rerunCommand === expectedRerunCommand &&
      item.hardGateCommand === nextActionsReport.hardExternalGateCommand &&
      item.valueRecorded === false
    );
  }),
  "external next actions current proof checklist rows should connect ready criteria to current evidence and commands without values"
);
check(
  nextActionsReport.currentActionChecklistCount === nextActionsReport.currentActionChecklist.length,
  "external next actions current action checklist count should match listed steps"
);
check(
  nextActionsReport.currentPrerequisiteCommandCount === nextActionsReport.currentPrerequisiteCommands.length,
  "external next actions current prerequisite command count should match listed commands"
);
check(
  nextActionsReport.currentPrerequisiteCommandSummary === formatCommandSummary(nextActionsReport.currentPrerequisiteCommands),
  "external next actions current prerequisite command summary should list current prerequisite commands"
);
check(
  nextActionsReport.currentRerunCommandCount === nextActionsReport.currentRerunCommands.length,
  "external next actions current rerun command count should match listed commands"
);
check(
  nextActionsReport.currentRerunCommandSummary === formatCommandSummary(nextActionsReport.currentRerunCommands),
  "external next actions current rerun command summary should list current rerun commands"
);
check(
  nextActionsReport.currentCommandSequenceCount === nextActionsReport.currentCommandSequence.length,
  "external next actions current command sequence count should match listed commands"
);
check(
  nextActionsReport.currentCommandSequenceSummary === formatCommandSummary(nextActionsReport.currentCommandSequence),
  "external next actions current command sequence summary should list current command sequence"
);
check(
  nextActionsReport.currentCommandVerificationRowCount === nextActionsReport.currentCommandSequenceCount,
  "external next actions current command verification row count should match current command sequence count"
);
check(
  nextActionsReport.currentCommandVerificationRows.every((item, index) => {
    const expectedRerunCommand =
      nextActionsReport.currentRerunCommand && nextActionsReport.currentRerunCommand !== "none"
        ? nextActionsReport.currentRerunCommand
        : nextActionsReport.currentNextCommand;
    const expectedEvidencePaths = nextActionsReport.currentEvidenceRows.map((row) => row.path);
    const expectedEvidenceReady = nextActionsReport.currentEvidenceRows.length > 0 && nextActionsReport.currentEvidenceRows.every((row) => row.present === true);
    const role = classifyCurrentCommand(item.command, nextActionsReport, nextActionsReport.hardExternalGateCommand);
    return (
      item.order === index + 1 &&
      item.command === nextActionsReport.currentCommandSequence[index] &&
      item.role === role &&
      item.expectation === commandVerificationExpectation(role) &&
      item.proofTarget === nextActionsReport.currentActionLabel &&
      Array.isArray(item.evidenceLabels) &&
      JSON.stringify(item.evidenceLabels) === JSON.stringify(nextActionsReport.currentEvidenceLabels) &&
      Array.isArray(item.evidencePaths) &&
      JSON.stringify(item.evidencePaths) === JSON.stringify(expectedEvidencePaths) &&
      item.evidenceReady === expectedEvidenceReady &&
      item.evidenceSummary === nextActionsReport.currentEvidenceLabelSummary &&
      item.proofCommand === nextActionsReport.currentNextCommand &&
      item.rerunCommand === expectedRerunCommand &&
      item.hardGateCommand === nextActionsReport.hardExternalGateCommand &&
      item.valueRecorded === false
    );
  }),
  "external next actions current command verification rows should classify sequence commands and connect evidence without values"
);
check(
  JSON.stringify(nextActionsReport.currentCommandSequence) ===
    JSON.stringify(
      buildCurrentCommandSequence({
        prerequisiteCommands: nextActionsReport.currentPrerequisiteCommands,
        nextCommand: nextActionsReport.currentNextCommand,
        rerunCommands: nextActionsReport.currentRerunCommands
      })
    ),
  "external next actions current command sequence should combine prerequisite, next, and rerun commands"
);
check(
  nextActionsReport.currentCommandSequence.includes(nextActionsReport.currentNextCommand),
  "external next actions current command sequence should include the current next command"
);
check(
  nextActionsReport.currentCommandSequence.every((command) => typeof command === "string" && command.length > 0 && command !== "none"),
  "external next actions current command sequence should contain only concrete commands"
);
check(typeof nextActionsReport.currentActionAcceptanceReady === "boolean", "external next actions should include current action acceptance readiness");
check(Number.isInteger(nextActionsReport.currentActionAcceptanceRowCount), "external next actions should include current action acceptance row count");
check(Number.isInteger(nextActionsReport.currentActionAcceptanceReadyCount), "external next actions should include current action acceptance ready count");
check(typeof nextActionsReport.currentActionAcceptanceSummary === "string" && nextActionsReport.currentActionAcceptanceSummary.length > 0, "external next actions should include current action acceptance summary");
check(Array.isArray(nextActionsReport.currentActionAcceptanceRows), "external next actions should include current action acceptance rows");
check(Number.isInteger(nextActionsReport.currentActionAcceptanceBlockerCount), "external next actions should include current action acceptance blocker count");
check(typeof nextActionsReport.currentActionAcceptanceBlockerSummary === "string" && nextActionsReport.currentActionAcceptanceBlockerSummary.length > 0, "external next actions should include current action acceptance blocker summary");
check(Array.isArray(nextActionsReport.currentActionAcceptanceBlockerRows), "external next actions should include current action acceptance blocker rows");
check(nextActionsReport.currentActionAcceptanceValueRecorded === false, "external next actions current action acceptance should not record values");
check(
  nextActionsReport.currentActionAcceptanceRowCount === nextActionsReport.currentActionAcceptanceRows.length,
  "external next actions current action acceptance row count should match listed rows"
);
check(
  nextActionsReport.currentActionAcceptanceRowCount === nextActionsReport.currentReadyCriteriaCount,
  "external next actions current action acceptance rows should match current ready criteria"
);
check(
  nextActionsReport.currentActionAcceptanceReadyCount === nextActionsReport.currentActionAcceptanceRows.filter((row) => row.ready === true).length,
  "external next actions current action acceptance ready count should match listed rows"
);
check(
  nextActionsReport.currentActionAcceptanceReady ===
    (nextActionsReport.currentActionAcceptanceRows.length > 0 &&
      nextActionsReport.currentActionAcceptanceRows.every((row) => row.ready === true)),
  "external next actions current action acceptance readiness should reflect listed rows"
);
check(
  nextActionsReport.currentActionAcceptanceBlockerCount === nextActionsReport.currentActionAcceptanceBlockerRows.length,
  "external next actions current action acceptance blocker count should match listed blockers"
);
check(
  nextActionsReport.currentActionAcceptanceBlockerCount ===
    nextActionsReport.currentActionAcceptanceRows.filter((row) => row.ready !== true).length,
  "external next actions current action acceptance blocker rows should match not-ready acceptance rows"
);
check(
  nextActionsReport.currentActionAcceptanceRows.every(
    (row, index) =>
      row.order === index + 1 &&
      row.criterion === nextActionsReport.currentReadyCriteria[index] &&
      typeof row.ready === "boolean" &&
      typeof row.evidence === "string" &&
      row.evidence.length > 0 &&
      row.proofCommand === nextActionsReport.currentNextCommand &&
      row.rerunCommand === nextActionsReport.currentRerunCommand &&
      row.hardGateCommand === nextActionsReport.hardExternalGateCommand &&
      row.valueRecorded === false
  ),
  "external next actions current action acceptance rows should mirror current criteria and commands without values"
);
check(
  nextActionsReport.currentActionAcceptanceBlockerRows.every(
    (row, index) =>
      row.order === index + 1 &&
      typeof row.criterion === "string" &&
      row.criterion.length > 0 &&
      typeof row.blocker === "string" &&
      row.blocker.length > 0 &&
      typeof row.sourceField === "string" &&
      row.sourceField.length > 0 &&
      typeof row.operatorAction === "string" &&
      row.operatorAction.length > 0 &&
      row.proofCommand === nextActionsReport.currentNextCommand &&
      row.rerunCommand === nextActionsReport.currentRerunCommand &&
      row.valueRecorded === false
  ),
  "external next actions current action acceptance blocker rows should include value-free source and operator action evidence"
);
check(typeof nextActionsReport.currentActionPostEditVerificationReady === "boolean", "external next actions should include current action post-edit verification readiness");
check(Number.isInteger(nextActionsReport.currentActionPostEditVerificationRowCount), "external next actions should include current action post-edit verification row count");
check(Number.isInteger(nextActionsReport.currentActionPostEditVerificationCurrentReadyCount), "external next actions should include current action post-edit verification current-ready count");
check(
  typeof nextActionsReport.currentActionPostEditVerificationSummary === "string" &&
    nextActionsReport.currentActionPostEditVerificationSummary.length > 0,
  "external next actions should include current action post-edit verification summary"
);
check(
  typeof nextActionsReport.currentActionPostEditVerificationCurrentSummary === "string" &&
    nextActionsReport.currentActionPostEditVerificationCurrentSummary.length > 0,
  "external next actions should include current action post-edit verification current summary"
);
check(Array.isArray(nextActionsReport.currentActionPostEditVerificationRows), "external next actions should include current action post-edit verification rows");
check(typeof nextActionsReport.currentActionPostEditVerificationMatchesAcceptance === "boolean", "external next actions should state whether post-edit verification matches acceptance");
check(
  nextActionsReport.currentActionPostEditVerificationReady === true,
  "external next actions current action post-edit verification should be ready"
);
check(
  nextActionsReport.currentActionPostEditVerificationRowCount === nextActionsReport.currentActionPostEditVerificationRows.length,
  "external next actions current action post-edit verification row count should match listed rows"
);
check(
  nextActionsReport.currentActionPostEditVerificationRowCount === nextActionsReport.currentActionAcceptanceRowCount,
  "external next actions current action post-edit verification rows should mirror acceptance rows"
);
check(
  nextActionsReport.currentActionPostEditVerificationCurrentReadyCount ===
    nextActionsReport.currentActionPostEditVerificationRows.filter((row) => row.currentReady === true).length,
  "external next actions current action post-edit verification current-ready count should match listed rows"
);
check(
  nextActionsReport.currentActionPostEditVerificationRows.every(
    (row, index) =>
      row.order === index + 1 &&
      row.criterion === nextActionsReport.currentActionAcceptanceRows[index]?.criterion &&
      row.currentReady === nextActionsReport.currentActionAcceptanceRows[index]?.ready &&
      row.currentEvidence === nextActionsReport.currentActionAcceptanceRows[index]?.evidence &&
      typeof row.expectedSignal === "string" &&
      row.expectedSignal.length > 0 &&
      typeof row.sourceField === "string" &&
      row.sourceField.length > 0 &&
      row.proofCommand === nextActionsReport.currentNextCommand &&
      row.rerunCommand === nextActionsReport.currentRerunCommand &&
      row.hardGateCommand === nextActionsReport.hardExternalGateCommand &&
      row.valueRecorded === false
  ),
  "external next actions current action post-edit verification rows should mirror acceptance rows and expected post-edit signals"
);
check(
  nextActionsReport.currentActionPostEditVerificationRows.some((row) => row.expectedSignal.includes("current placeholder key count is 0")) ||
    nextActionsReport.currentActionPostEditVerificationRows.length === 0,
  "external next actions current action post-edit verification should include the placeholder-clear expected signal"
);
check(
  nextActionsReport.currentActionPostEditVerificationMatchesAcceptance ===
    (nextActionsReport.currentActionPostEditVerificationRowCount === nextActionsReport.currentActionAcceptanceRowCount),
  "external next actions current action post-edit verification match flag should align with acceptance row count"
);
check(typeof nextActionsReport.currentActionHandoffReady === "boolean", "external next actions should include current action handoff readiness");
check(Number.isInteger(nextActionsReport.currentActionHandoffRowCount), "external next actions should include current action handoff row count");
check(typeof nextActionsReport.currentActionHandoffSummary === "string" && nextActionsReport.currentActionHandoffSummary.length > 0, "external next actions should include current action handoff summary");
check(Array.isArray(nextActionsReport.currentActionHandoffRows), "external next actions should include current action handoff rows");
check(Number.isInteger(nextActionsReport.currentActionHandoffSourceArtifactCount), "external next actions should include current action handoff source artifact count");
check(typeof nextActionsReport.currentActionHandoffSourceArtifactSummary === "string" && nextActionsReport.currentActionHandoffSourceArtifactSummary.length > 0, "external next actions should include current action handoff source artifact summary");
check(nextActionsReport.currentActionHandoffReady === true, "external next actions current action handoff should be ready");
check(
  nextActionsReport.currentActionHandoffRowCount === nextActionsReport.currentActionHandoffRows.length,
  "external next actions current action handoff row count should match listed rows"
);
check(nextActionsReport.currentActionHandoffRowCount === 5, "external next actions current action handoff should include five rows");
check(
  nextActionsReport.currentActionHandoffSourceArtifactCount === nextActionsReport.sourceArtifacts.length,
  "external next actions current action handoff source artifact count should match source artifacts"
);
check(
  nextActionsReport.currentActionHandoffRows.every(
    (row, index) =>
      row.order === index + 1 &&
      typeof row.item === "string" &&
      row.item.length > 0 &&
      typeof row.sourceField === "string" &&
      row.sourceField.length > 0 &&
      typeof row.evidence === "string" &&
      row.evidence.length > 0 &&
      Number.isInteger(row.blockerCount) &&
      Number.isInteger(row.acceptanceBlockerCount) &&
      row.acceptanceBlockerCount === nextActionsReport.currentActionAcceptanceBlockerCount &&
      row.proofCommand === nextActionsReport.currentNextCommand &&
      row.rerunCommand === nextActionsReport.currentRerunCommand &&
      row.hardGateCommand === nextActionsReport.hardExternalGateCommand &&
      row.valueRecorded === false
  ),
  "external next actions current action handoff rows should summarize sources, edit target, acceptance blockers, rerun order, and hard gate without values"
);
check(
  nextActionsReport.currentActionHandoffRows.some((row) => row.sourceField === "sourceArtifacts") &&
    nextActionsReport.currentActionHandoffRows.some((row) => row.sourceField.includes("currentEnvEditTarget")) &&
    nextActionsReport.currentActionHandoffRows.some((row) => row.sourceField === "currentActionAcceptanceBlockerRows") &&
    nextActionsReport.currentActionHandoffRows.some((row) => row.sourceField.includes("currentCommandVerificationRows")) &&
    nextActionsReport.currentActionHandoffRows.some((row) => row.sourceField.includes("externalPreflight")),
  "external next actions current action handoff should include source artifacts, edit target, acceptance blockers, rerun order, and hard gate rows"
);
check(typeof nextActionsReport.currentPrivateEditSafetyReady === "boolean", "external next actions should include current private edit safety readiness");
check(Number.isInteger(nextActionsReport.currentPrivateEditSafetyRowCount), "external next actions should include current private edit safety row count");
check(typeof nextActionsReport.currentPrivateEditSafetySummary === "string" && nextActionsReport.currentPrivateEditSafetySummary.length > 0, "external next actions should include current private edit safety summary");
check(Array.isArray(nextActionsReport.currentPrivateEditSafetyRows), "external next actions should include current private edit safety rows");
check(
  nextActionsReport.currentPrivateEditSafetyRowCount === nextActionsReport.currentPrivateEditSafetyRows.length,
  "external next actions current private edit safety row count should match listed rows"
);
check(
  nextActionsReport.currentPrivateEditSafetyReady ===
    nextActionsReport.currentPrivateEditSafetyRows.every((row) => row.ready === true && row.valueRecorded === false),
  "external next actions current private edit safety readiness should reflect listed rows"
);
check(
  nextActionsReport.currentPrivateEditSafetyRows.every(
    (row, index) =>
      row.order === index + 1 &&
      typeof row.check === "string" &&
      row.check.length > 0 &&
      typeof row.evidence === "string" &&
      row.evidence.length > 0 &&
      typeof row.command === "string" &&
      row.command.length > 0 &&
      row.valueRecorded === false
  ),
  "external next actions current private edit safety rows should include value-free checks, evidence, and commands"
);
check(typeof nextActionsReport.currentInputShapeChecklistReady === "boolean", "external next actions should include current input shape checklist readiness");
check(Number.isInteger(nextActionsReport.currentInputShapeChecklistRowCount), "external next actions should include current input shape checklist row count");
check(typeof nextActionsReport.currentInputShapeChecklistSummary === "string" && nextActionsReport.currentInputShapeChecklistSummary.length > 0, "external next actions should include current input shape checklist summary");
check(Array.isArray(nextActionsReport.currentInputShapeChecklistRows), "external next actions should include current input shape checklist rows");
check(
  nextActionsReport.currentInputShapeChecklistRowCount === nextActionsReport.currentInputShapeChecklistRows.length,
  "external next actions current input shape checklist row count should match listed rows"
);
check(
  nextActionsReport.currentInputShapeChecklistReady ===
    (nextActionsReport.currentInputShapeChecklistRows.length === 0 ||
      (nextActionsReport.currentInputShapeChecklistRows.length === releaseChannelMetadataKeys.length &&
        releaseChannelMetadataKeys.every((key) => nextActionsReport.currentInputShapeChecklistRows.some((row) => row.key === key)) &&
        nextActionsReport.currentInputShapeChecklistRows.every((row) => row.ready === true && row.valueRecorded === false))),
  "external next actions current input shape checklist readiness should reflect listed release-channel shape rows"
);
check(
  nextActionsReport.currentInputShapeChecklistRows.every(
    (row, index) =>
      row.order === index + 1 &&
      typeof row.key === "string" &&
      row.key.length > 0 &&
      typeof row.expectedShape === "string" &&
      row.expectedShape.length > 0 &&
      typeof row.evidenceSource === "string" &&
      row.evidenceSource.length > 0 &&
      row.proofCommand === nextActionsReport.currentNextCommand &&
      row.rerunCommand === nextActionsReport.currentRerunCommand &&
      row.hardGateCommand === nextActionsReport.hardExternalGateCommand &&
      row.valueRecorded === false
  ),
  "external next actions current input shape checklist rows should include shape guidance and current commands without values"
);
check(typeof nextActionsReport.currentLocalEnvDiagnosticsReady === "boolean", "external next actions should include current local env diagnostics readiness");
check(Number.isInteger(nextActionsReport.currentLocalEnvDiagnosticRowCount), "external next actions should include current local env diagnostic row count");
check(
  typeof nextActionsReport.currentLocalEnvDiagnosticSummary === "string" &&
    nextActionsReport.currentLocalEnvDiagnosticSummary.length > 0,
  "external next actions should include current local env diagnostic summary"
);
check(Array.isArray(nextActionsReport.currentLocalEnvDiagnosticRows), "external next actions should include current local env diagnostic rows");
check(
  nextActionsReport.currentLocalEnvDiagnosticsReady === true,
  "external next actions current local env diagnostics should be ready"
);
check(
  nextActionsReport.currentLocalEnvDiagnosticRowCount === nextActionsReport.currentLocalEnvDiagnosticRows.length,
  "external next actions current local env diagnostic row count should match rows"
);
check(
  nextActionsReport.currentLocalEnvDiagnosticRowCount === 8,
  "external next actions current local env diagnostics should include eight rows"
);
check(
  nextActionsReport.currentLocalEnvDiagnosticRows.every(
    (row, index) =>
      row.order === index + 1 &&
      typeof row.diagnostic === "string" &&
      row.diagnostic.length > 0 &&
      typeof row.status === "string" &&
      row.status.length > 0 &&
      typeof row.evidence === "string" &&
      row.evidence.length > 0 &&
      typeof row.sourceField === "string" &&
      row.sourceField.length > 0 &&
      row.valueRecorded === false
  ),
  "external next actions current local env diagnostic rows should include value-free source evidence"
);
check(
  nextActionsReport.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Local env source files checked" && row.status === "checked"),
  "external next actions current local env diagnostics should include checked files"
);
check(
  nextActionsReport.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Current edit target present" && row.evidence === nextActionsReport.currentEnvEditTarget),
  "external next actions current local env diagnostics should include current edit target presence"
);
check(
  nextActionsReport.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Current placeholder scope" && row.evidence.includes("current release-channel placeholders")),
  "external next actions current local env diagnostics should include current placeholder scope"
);
check(
  nextActionsReport.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Unknown key scan" && row.evidence.includes("unknown key names reported")),
  "external next actions current local env diagnostics should include unknown key scan"
);
check(
  nextActionsReport.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Malformed line scan" && row.evidence.includes("malformed line locations reported")),
  "external next actions current local env diagnostics should include malformed line scan"
);
check(
  nextActionsReport.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Existing environment overrides" && row.evidence.includes("existing environment key names skipped")),
  "external next actions current local env diagnostics should include skipped existing env scan"
);
check(
  nextActionsReport.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Loaded key redaction" && row.evidence.includes("values recorded no")),
  "external next actions current local env diagnostics should include loaded key redaction"
);
check(
  nextActionsReport.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Local env value recording" && row.evidence.includes("values recorded no")),
  "external next actions current local env diagnostics should include local env value-recording posture"
);
check(typeof nextActionsReport.releaseChannelPostEditReceiptReady === "boolean", "external next actions should include release-channel post-edit receipt readiness");
check(Number.isInteger(nextActionsReport.releaseChannelPostEditReceiptCurrentReadyCount), "external next actions should include release-channel post-edit receipt current-ready count");
check(Number.isInteger(nextActionsReport.releaseChannelPostEditReceiptRowCount), "external next actions should include release-channel post-edit receipt row count");
check(
  typeof nextActionsReport.releaseChannelPostEditReceiptSummary === "string" &&
    nextActionsReport.releaseChannelPostEditReceiptSummary.length > 0,
  "external next actions should include release-channel post-edit receipt summary"
);
check(Array.isArray(nextActionsReport.releaseChannelPostEditReceiptRows), "external next actions should include release-channel post-edit receipt rows");
check(
  typeof nextActionsReport.releaseChannelPostEditReceiptProofCommand === "string" &&
    nextActionsReport.releaseChannelPostEditReceiptProofCommand.length > 0,
  "external next actions should include release-channel post-edit receipt proof command"
);
check(
  typeof nextActionsReport.releaseChannelPostEditReceiptRerunCommand === "string" &&
    nextActionsReport.releaseChannelPostEditReceiptRerunCommand.length > 0,
  "external next actions should include release-channel post-edit receipt rerun command"
);
check(nextActionsReport.releaseChannelPostEditReceiptValueRecorded === false, "external next actions release-channel post-edit receipt should not record values");
check(
  nextActionsReport.releaseChannelPostEditReceiptRowCount === nextActionsReport.releaseChannelPostEditReceiptRows.length,
  "external next actions release-channel post-edit receipt row count should match rows"
);
check(
  nextActionsReport.releaseChannelPostEditReceiptCurrentReadyCount ===
    nextActionsReport.releaseChannelPostEditReceiptRows.filter((row) => row.currentReady === true).length,
  "external next actions release-channel post-edit receipt current-ready count should match rows"
);
check(
  nextActionsReport.releaseChannelPostEditReceiptReady ===
    (nextActionsReport.releaseChannelPostEditReceiptRows.length === 0 ||
      (nextActionsReport.releaseChannelPostEditReceiptRows.length === 6 &&
        nextActionsReport.releaseChannelPostEditReceiptRows.every((row) => row.ready === true && row.valueRecorded === false))),
  "external next actions release-channel post-edit receipt readiness should reflect listed rows"
);
check(
  nextActionsReport.releaseChannelPostEditReceiptRows.every(
    (row, index) =>
      row.order === index + 1 &&
      typeof row.item === "string" &&
      row.item.length > 0 &&
      typeof row.ready === "boolean" &&
      typeof row.currentReady === "boolean" &&
      typeof row.evidence === "string" &&
      row.evidence.length > 0 &&
      typeof row.expectedPostEditSignal === "string" &&
      row.expectedPostEditSignal.length > 0 &&
      typeof row.proofCommand === "string" &&
      row.proofCommand.length > 0 &&
      row.rerunCommand === nextActionsReport.releaseChannelPostEditReceiptRerunCommand &&
      typeof row.sourceField === "string" &&
      row.sourceField.length > 0 &&
      row.valueRecorded === false
  ),
  "external next actions release-channel post-edit receipt rows should include value-free receipt evidence"
);
check(typeof nextActionsReport.releaseChannelPostEditOperatorReceiptReady === "boolean", "external next actions should include release-channel post-edit operator receipt readiness");
check(Number.isInteger(nextActionsReport.releaseChannelPostEditOperatorReceiptRowCount), "external next actions should include release-channel post-edit operator receipt row count");
check(
  typeof nextActionsReport.releaseChannelPostEditOperatorReceiptSummary === "string" &&
    nextActionsReport.releaseChannelPostEditOperatorReceiptSummary.length > 0,
  "external next actions should include release-channel post-edit operator receipt summary"
);
check(Array.isArray(nextActionsReport.releaseChannelPostEditOperatorReceiptRows), "external next actions should include release-channel post-edit operator receipt rows");
check(
  nextActionsReport.releaseChannelPostEditOperatorReceiptRecommendedProofCommand === recommendedPrivateEditOperatorProofCommand,
  "external next actions release-channel post-edit operator receipt should include the recommended strict proof chain"
);
check(
  nextActionsReport.releaseChannelPostEditOperatorReceiptRecommendedProofCommandRole ===
    "recommended strict-first proof chain after replacing the four private release-channel placeholders",
  "external next actions release-channel post-edit operator receipt should describe the recommended strict proof chain"
);
check(
  nextActionsReport.releaseChannelPostEditOperatorReceiptRecommendedProofCommandValueRecorded === false,
  "external next actions release-channel post-edit operator receipt recommended proof chain should be value-free"
);
check(
  nextActionsReport.releaseChannelPostEditOperatorReceiptProofCommand === "npm run release:doctor",
  "external next actions release-channel post-edit operator receipt should keep release doctor as proof command"
);
check(
  nextActionsReport.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand === "npm run release:current-blocker",
  "external next actions release-channel post-edit operator receipt should keep current-blocker as blocker refresh command"
);
check(
  nextActionsReport.releaseChannelPostEditOperatorReceiptNextActionsCommand === "npm run release:next-actions",
  "external next actions release-channel post-edit operator receipt should keep next-actions as refresh command"
);
check(
  nextActionsReport.releaseChannelPostEditOperatorReceiptHardGateCommand === nextActionsReport.hardExternalGateCommand,
  "external next actions release-channel post-edit operator receipt should keep the hard gate command"
);
check(nextActionsReport.releaseChannelPostEditOperatorReceiptValueRecorded === false, "external next actions release-channel post-edit operator receipt should not record values");
check(
  nextActionsReport.releaseChannelPostEditOperatorReceiptRowCount === nextActionsReport.releaseChannelPostEditOperatorReceiptRows.length,
  "external next actions release-channel post-edit operator receipt row count should match rows"
);
check(
  nextActionsReport.releaseChannelPostEditOperatorReceiptReady ===
    (nextActionsReport.releaseChannelPostEditOperatorReceiptRows.length === 0 ||
      (nextActionsReport.releaseChannelPostEditOperatorReceiptRows.length === 7 &&
        nextActionsReport.releaseChannelPostEditOperatorReceiptRows.every((row) => row.ready === true && row.valueRecorded === false))),
  "external next actions release-channel post-edit operator receipt readiness should reflect listed rows"
);
check(
  nextActionsReport.releaseChannelPostEditOperatorReceiptRows.every(
    (row, index) =>
      row.order === index + 1 &&
      typeof row.step === "string" &&
      row.step.length > 0 &&
      typeof row.currentState === "string" &&
      row.currentState.length > 0 &&
      typeof row.operatorAction === "string" &&
      row.operatorAction.length > 0 &&
      typeof row.expectedPostEditSignal === "string" &&
      row.expectedPostEditSignal.length > 0 &&
      typeof row.command === "string" &&
      row.command.length > 0 &&
      typeof row.proofCommand === "string" &&
      row.proofCommand.length > 0 &&
      row.rerunCommand === nextActionsReport.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand &&
      typeof row.sourceField === "string" &&
      row.sourceField.length > 0 &&
      row.valueRecorded === false
  ),
  "external next actions release-channel post-edit operator receipt rows should include value-free operator actions"
);
check(
  nextActionsReport.releaseChannelPostEditOperatorReceiptRows.some(
    (row) => row.step === "Recommended strict proof chain" && row.command === recommendedPrivateEditOperatorProofCommand
  ),
  "external next actions release-channel post-edit operator receipt should include the recommended strict proof chain row"
);
check(typeof nextActionsReport.postEditProofSequenceReceiptReady === "boolean", "external next actions should include post-edit proof sequence receipt readiness");
check(Number.isInteger(nextActionsReport.postEditProofSequenceReceiptRowCount), "external next actions should include post-edit proof sequence row count");
check(
  typeof nextActionsReport.postEditProofSequenceReceiptSummary === "string" &&
    nextActionsReport.postEditProofSequenceReceiptSummary.length > 0,
  "external next actions should include post-edit proof sequence summary"
);
check(Array.isArray(nextActionsReport.postEditProofSequenceReceiptRows), "external next actions should include post-edit proof sequence rows");
check(
  nextActionsReport.postEditProofSequenceReceiptReady === true,
  "external next actions post-edit proof sequence receipt should be ready"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRowCount === nextActionsReport.postEditProofSequenceReceiptRows.length,
  "external next actions post-edit proof sequence row count should match rows"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRowCount === 8,
  "external next actions post-edit proof sequence receipt should include eight rows"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRecommendedProofCommand === recommendedPrivateEditOperatorProofCommand,
  "external next actions post-edit proof sequence should include the recommended strict proof chain command"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRecommendedProofCommandValueRecorded === false,
  "external next actions post-edit proof sequence recommended proof chain should be value-free"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRows.every(
    (row, index) =>
      row.order === index + 1 &&
      typeof row.step === "string" &&
      row.step.length > 0 &&
      row.ready === true &&
      typeof row.command === "string" &&
      row.command.length > 0 &&
      typeof row.expectedEvidence === "string" &&
      row.expectedEvidence.length > 0 &&
      typeof row.sourceField === "string" &&
      row.sourceField.length > 0 &&
      row.valueRecorded === false
  ),
  "external next actions post-edit proof sequence rows should include ready value-free evidence"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRows.some(
    (row) => row.step === "Private value edit" && row.command === `manual edit ${nextActionsReport.currentEnvEditTarget}`
  ),
  "external next actions post-edit proof sequence should include private value edit"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRows.some(
    (row) => row.step === "Recommended strict proof chain" && row.command === recommendedPrivateEditOperatorProofCommand
  ),
  "external next actions post-edit proof sequence should include the recommended strict proof chain"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRows.some(
    (row) => row.step === "Release doctor proof" && row.command === "npm run release:doctor"
  ),
  "external next actions post-edit proof sequence should include release doctor proof"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRows.some(
    (row) => row.step === "Current-blocker refresh" && row.command === "npm run release:current-blocker"
  ),
  "external next actions post-edit proof sequence should include current-blocker refresh"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRows.some(
    (row) => row.step === "Next-actions refresh" && row.command === "npm run release:next-actions"
  ),
  "external next actions post-edit proof sequence should include next-actions refresh"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRows.some(
    (row) => row.step === "Proof bundle refresh" && row.command === "npm run release:proof-bundle"
  ),
  "external next actions post-edit proof sequence should include proof-bundle refresh"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRows.some(
    (row) => row.step === "Progress refresh" && row.command === "npm run release:progress-smoke"
  ),
  "external next actions post-edit proof sequence should include progress refresh"
);
check(
  nextActionsReport.postEditProofSequenceReceiptRows.some(
    (row) => row.step === "Hard-gate boundary" && row.command === nextActionsReport.hardExternalGateCommand
  ),
  "external next actions post-edit proof sequence should include hard-gate boundary"
);
check(
  nextActionsReport.postEditProofSequenceReceiptDoctorCommand === "npm run release:doctor",
  "external next actions post-edit proof sequence should keep release doctor command"
);
check(
  nextActionsReport.postEditProofSequenceReceiptCurrentBlockerCommand === "npm run release:current-blocker",
  "external next actions post-edit proof sequence should keep current-blocker command"
);
check(
  nextActionsReport.postEditProofSequenceReceiptNextActionsCommand === "npm run release:next-actions",
  "external next actions post-edit proof sequence should keep next-actions command"
);
check(
  nextActionsReport.postEditProofSequenceReceiptProofBundleCommand === "npm run release:proof-bundle",
  "external next actions post-edit proof sequence should keep proof-bundle command"
);
check(
  nextActionsReport.postEditProofSequenceReceiptProgressCommand === "npm run release:progress-smoke",
  "external next actions post-edit proof sequence should keep progress-smoke command"
);
check(
  nextActionsReport.postEditProofSequenceReceiptHardGateCommand === nextActionsReport.hardExternalGateCommand,
  "external next actions post-edit proof sequence should keep hard-gate command"
);
check(nextActionsReport.postEditProofSequenceReceiptValueRecorded === false, "external next actions post-edit proof sequence should not record values");
check(typeof nextActionsReport.nextPriorityActionId === "string", "external next actions should include the next priority action id");
check(typeof nextActionsReport.nextPriorityActionLabel === "string", "external next actions should include the next priority action label");
check(typeof nextActionsReport.nextPriorityActionNextCommand === "string", "external next actions should include the next priority action command");
check(typeof nextActionsReport.nextPriorityActionFirstBlocker === "string", "external next actions should include the next priority action blocker");
check(typeof nextActionsReport.nextActionPreviewReady === "boolean", "external next actions should include next action preview readiness");
check(typeof nextActionsReport.nextActionPreviewId === "string", "external next actions should include next action preview id");
check(typeof nextActionsReport.nextActionPreviewLabel === "string", "external next actions should include next action preview label");
check(typeof nextActionsReport.nextActionPreviewProofCommand === "string", "external next actions should include next action preview proof command");
check(typeof nextActionsReport.nextActionPreviewFirstBlocker === "string", "external next actions should include next action preview first blocker");
check(Number.isInteger(nextActionsReport.nextActionPreviewRerunCommandCount), "external next actions should include next action preview rerun command count");
check(typeof nextActionsReport.nextActionPreviewRerunCommandSummary === "string", "external next actions should include next action preview rerun command summary");
check(Array.isArray(nextActionsReport.nextActionPreviewRerunCommands), "external next actions should include next action preview rerun commands");
check(Number.isInteger(nextActionsReport.nextActionPreviewRequiredKeyCount), "external next actions should include next action preview required key count");
check(typeof nextActionsReport.nextActionPreviewRequiredKeySummary === "string", "external next actions should include next action preview required key summary");
check(Array.isArray(nextActionsReport.nextActionPreviewRequiredKeys), "external next actions should include next action preview required keys");
check(Number.isInteger(nextActionsReport.nextActionPreviewPlaceholderKeyCount), "external next actions should include next action preview placeholder key count");
check(typeof nextActionsReport.nextActionPreviewPlaceholderKeySummary === "string", "external next actions should include next action preview placeholder key summary");
check(Array.isArray(nextActionsReport.nextActionPreviewPlaceholderKeys), "external next actions should include next action preview placeholder keys");
check(Number.isInteger(nextActionsReport.nextActionPreviewReadyCriteriaRowCount), "external next actions should include next action preview ready criteria row count");
check(typeof nextActionsReport.nextActionPreviewReadyCriteriaSummary === "string", "external next actions should include next action preview ready criteria summary");
check(Array.isArray(nextActionsReport.nextActionPreviewReadyCriteriaRows), "external next actions should include next action preview ready criteria rows");
check(Number.isInteger(nextActionsReport.nextActionPreviewChecklistRowCount), "external next actions should include next action preview checklist row count");
check(typeof nextActionsReport.nextActionPreviewChecklistSummary === "string", "external next actions should include next action preview checklist summary");
check(Array.isArray(nextActionsReport.nextActionPreviewChecklistRows), "external next actions should include next action preview checklist rows");
check(Number.isInteger(nextActionsReport.nextActionPreviewEvidenceRowCount), "external next actions should include next action preview evidence row count");
check(typeof nextActionsReport.nextActionPreviewEvidenceSummary === "string", "external next actions should include next action preview evidence summary");
check(Array.isArray(nextActionsReport.nextActionPreviewEvidenceRows), "external next actions should include next action preview evidence rows");
check(Number.isInteger(nextActionsReport.nextActionPreviewBlockerRowCount), "external next actions should include next action preview blocker row count");
check(typeof nextActionsReport.nextActionPreviewBlockerSummary === "string", "external next actions should include next action preview blocker summary");
check(Array.isArray(nextActionsReport.nextActionPreviewBlockerRows), "external next actions should include next action preview blocker rows");
check(Number.isInteger(nextActionsReport.nextActionPreviewVerificationRowCount), "external next actions should include next action preview verification row count");
check(typeof nextActionsReport.nextActionPreviewVerificationSummary === "string", "external next actions should include next action preview verification summary");
check(Array.isArray(nextActionsReport.nextActionPreviewVerificationRows), "external next actions should include next action preview verification rows");
check(Number.isInteger(nextActionsReport.nextActionPreviewPrerequisiteCommandRowCount), "external next actions should include next action preview prerequisite command row count");
check(typeof nextActionsReport.nextActionPreviewPrerequisiteCommandSummary === "string", "external next actions should include next action preview prerequisite command summary");
check(Array.isArray(nextActionsReport.nextActionPreviewPrerequisiteCommandRows), "external next actions should include next action preview prerequisite command rows");
check(Number.isInteger(nextActionsReport.nextActionPreviewOperatorActionRowCount), "external next actions should include next action preview operator action row count");
check(typeof nextActionsReport.nextActionPreviewOperatorActionSummary === "string", "external next actions should include next action preview operator action summary");
check(Array.isArray(nextActionsReport.nextActionPreviewOperatorActionRows), "external next actions should include next action preview operator action rows");
check(Number.isInteger(nextActionsReport.nextActionPreviewEnvEditRowCount), "external next actions should include next action preview env edit row count");
check(typeof nextActionsReport.nextActionPreviewEnvEditSummary === "string", "external next actions should include next action preview env edit summary");
check(Array.isArray(nextActionsReport.nextActionPreviewEnvEditRows), "external next actions should include next action preview env edit rows");
check(
  nextActionsReport.nextActionPreviewReadyCriteriaRowCount === nextActionsReport.nextActionPreviewReadyCriteriaRows.length,
  "external next actions next action preview ready criteria row count should match rows"
);
check(
  nextActionsReport.nextActionPreviewChecklistRowCount === nextActionsReport.nextActionPreviewChecklistRows.length,
  "external next actions next action preview checklist row count should match rows"
);
check(
  nextActionsReport.nextActionPreviewEvidenceRowCount === nextActionsReport.nextActionPreviewEvidenceRows.length,
  "external next actions next action preview evidence row count should match rows"
);
check(
  nextActionsReport.nextActionPreviewBlockerRowCount === nextActionsReport.nextActionPreviewBlockerRows.length,
  "external next actions next action preview blocker row count should match rows"
);
check(
  nextActionsReport.nextActionPreviewVerificationRowCount === nextActionsReport.nextActionPreviewVerificationRows.length,
  "external next actions next action preview verification row count should match rows"
);
check(
  nextActionsReport.nextActionPreviewPrerequisiteCommandRowCount === nextActionsReport.nextActionPreviewPrerequisiteCommandRows.length,
  "external next actions next action preview prerequisite command row count should match rows"
);
check(
  nextActionsReport.nextActionPreviewOperatorActionRowCount === nextActionsReport.nextActionPreviewOperatorActionRows.length,
  "external next actions next action preview operator action row count should match rows"
);
check(
  nextActionsReport.nextActionPreviewEnvEditRowCount === nextActionsReport.nextActionPreviewEnvEditRows.length,
  "external next actions next action preview env edit row count should match rows"
);
check(
  [
    ...nextActionsReport.nextActionPreviewReadyCriteriaRows,
    ...nextActionsReport.nextActionPreviewChecklistRows,
    ...nextActionsReport.nextActionPreviewEvidenceRows,
    ...nextActionsReport.nextActionPreviewBlockerRows,
    ...nextActionsReport.nextActionPreviewVerificationRows,
    ...nextActionsReport.nextActionPreviewPrerequisiteCommandRows,
    ...nextActionsReport.nextActionPreviewOperatorActionRows,
    ...nextActionsReport.nextActionPreviewEnvEditRows
  ].every((row) => row.valueRecorded === false),
  "external next actions next action preview rows should not record values"
);
check(
  nextActionsReport.nextActionPreviewReady ===
    (nextActionsReport.nextActionPreviewReadyCriteriaRows.length === 0 ||
      (nextActionsReport.nextActionPreviewReadyCriteriaRows.length > 0 &&
        nextActionsReport.nextActionPreviewChecklistRows.length > 0 &&
        nextActionsReport.nextActionPreviewBlockerRows.length > 0 &&
        nextActionsReport.nextActionPreviewVerificationRows.length > 0 &&
        nextActionsReport.nextActionPreviewPrerequisiteCommandRows.length > 0 &&
        nextActionsReport.nextActionPreviewOperatorActionRows.length > 0 &&
        nextActionsReport.nextActionPreviewEnvEditRows.length > 0 &&
        [
          ...nextActionsReport.nextActionPreviewReadyCriteriaRows,
          ...nextActionsReport.nextActionPreviewChecklistRows,
          ...nextActionsReport.nextActionPreviewBlockerRows,
          ...nextActionsReport.nextActionPreviewVerificationRows,
          ...nextActionsReport.nextActionPreviewPrerequisiteCommandRows,
          ...nextActionsReport.nextActionPreviewOperatorActionRows,
          ...nextActionsReport.nextActionPreviewEnvEditRows
        ].every((row) => row.proofCommand === nextActionsReport.nextActionPreviewProofCommand && row.valueRecorded === false))),
  "external next actions next action preview readiness should reflect listed rows"
);
check(nextActionsReport.currentActionValueRecorded === false, "external next actions should not record current action values");
check(markdown.includes("Bootstrap mode:"), "external next actions Markdown should include bootstrap mode");
check(markdown.includes("Source evidence ready:"), "external next actions Markdown should include source evidence readiness");
check(markdown.includes("Source evidence prerequisite:"), "external next actions Markdown should include the source evidence prerequisite");
check(markdown.includes("Current prerequisite commands:"), "external next actions Markdown should include current prerequisite commands status");
check(markdown.includes("Current rerun commands:"), "external next actions Markdown should include current rerun commands status");
check(markdown.includes("Current command sequence:"), "external next actions Markdown should include current command sequence status");
check(markdown.includes("Current command verification rows:"), "external next actions Markdown should include current command verification row status");
check(markdown.includes("## Current Command Sequence"), "external next actions Markdown should include current command sequence section");
check(markdown.includes("## Current Command Verification"), "external next actions Markdown should include current command verification section");
if (nextActionsReport.bootstrapMode === true) {
  const releaseDoctorArtifactPresent = nextActionsReport.sourceArtifacts.some((item) => item.label === "Release doctor" && item.present === true);
  check(nextActionsReport.sourceEvidenceReady === false, "bootstrap external next actions should report missing source evidence");
  check(
    nextActionsReport.doctorCompletionGapSourceReady === releaseDoctorArtifactPresent,
    "bootstrap external next actions should match release doctor completion gap source readiness to the release doctor artifact"
  );
  check(nextActionsReport.localReleaseReady === false, "bootstrap external next actions should not claim local release readiness");
  check(nextActionsReport.localReleaseReadinessPercent === 0, "bootstrap external next actions should report zero local release readiness");
  check(nextActionsReport.currentFocus === "Regenerate local release evidence", "bootstrap external next actions should focus on regenerating evidence");
  check(nextActionsReport.currentNextCommand === "npm run release:check", "bootstrap external next actions should surface release:check as the current next command");
  check(nextActionsReport.priorityActions[0]?.nextCommand === "npm run release:check", "bootstrap external next actions should make release:check the first command");
  check(Array.isArray(nextActionsReport.missingSourceArtifacts) && nextActionsReport.missingSourceArtifacts.length > 0, "bootstrap external next actions should list missing source artifacts");
  check(markdown.includes("Regenerate local release evidence"), "bootstrap external next actions Markdown should include the evidence regeneration focus");
  check(markdown.includes("npm run release:check"), "bootstrap external next actions Markdown should include the source evidence command");
} else {
  check(nextActionsReport.sourceArtifacts.every((item) => item.present), "external next actions should cite generated source artifacts");
  check(nextActionsReport.sourceEvidenceReady === true, "external next actions should report source evidence readiness");
  check(nextActionsReport.doctorCompletionGapSourceReady === true, "external next actions should report ready release doctor completion gap source evidence");
  check(nextActionsReport.doctorCompletionGapDoctorReportReady === true, "external next actions should report ready release doctor evidence");
  check(nextActionsReport.localReleaseReady === true, "external next actions should include local release readiness");
  check(nextActionsReport.localReleaseReadinessPercent === 100, "external next actions should report 100 percent local release readiness");
}
check(Array.isArray(nextActionsReport.priorityActions), "external next actions should include priority actions");
check(nextActionsReport.externalDistributionReady === true || nextActionsReport.priorityActions.length > 0, "pending external distribution should include at least one priority action");
check(nextActionsReport.priorityActions.every((action) => action.ready === false), "priority actions should be pending actions only");
check(nextActionsReport.priorityActions.every((action) => action.valueRecorded === false), "priority actions should not record values");
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.placeholderKeys)), "priority actions should include placeholder key lists");
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.placeholderEditLocations)), "priority actions should include placeholder edit location lists");
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.evidence)), "priority actions should include evidence row lists");
check(
  nextActionsReport.priorityActions.every((action) =>
    (action.evidence ?? []).every(
      (item) =>
        typeof item.label === "string" &&
        item.label.length > 0 &&
        !isGenericEvidenceLabel(item.label) &&
        typeof item.path === "string" &&
        item.path.length > 0 &&
        typeof item.present === "boolean" &&
        item.valueRecorded === false
    )
  ),
  "priority actions should include stable value-free evidence rows"
);
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.keyGuidance)), "priority actions should include key guidance lists");
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.envEditTemplate)), "priority actions should include env edit template lists");
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.envEditRows)), "priority actions should include env edit row lists");
check(
  nextActionsReport.priorityActions.every((action) =>
    (action.requiredKeys ?? []).every((key) => (action.envEditTemplate ?? []).some((item) => item.key === key && item.valueRecorded === false))
  ),
  "priority actions should include a value-free env edit template for every required key"
);
check(
  nextActionsReport.priorityActions.every((action) =>
    (action.requiredKeys ?? []).every((key) => (action.envEditRows ?? []).some((item) => item.key === key && item.valueRecorded === false))
  ),
  "priority actions should include a value-free env edit row for every required key"
);
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.readyCriteria)), "priority actions should include ready criteria lists");
check(nextActionsReport.priorityActions.every((action) => action.readyCriteria.length > 0), "priority actions should include at least one ready criterion");
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.actionChecklist)), "priority actions should include action checklist lists");
check(nextActionsReport.priorityActions.every((action) => action.actionChecklist.length > 0), "priority actions should include at least one action checklist step");
check(
  nextActionsReport.priorityActions.every((action) =>
    (action.requiredKeys ?? []).every((key) => (action.keyGuidance ?? []).some((item) => item.key === key))
  ),
  "priority actions should include guidance for every required key"
);
check(nextActionsReport.priorityActions.every((action) => typeof action.nextCommand === "string" && action.nextCommand.length > 0), "priority actions should include next commands");
if (nextActionsReport.priorityActions.length > 0) {
  const firstPriorityAction = nextActionsReport.priorityActions[0];
  check(nextActionsReport.currentActionId === firstPriorityAction.id, "external next actions should mirror the first priority action id");
  check(nextActionsReport.currentActionLabel === firstPriorityAction.label, "external next actions should mirror the first priority action label");
  check(nextActionsReport.currentNextCommand === firstPriorityAction.nextCommand, "external next actions should mirror the first priority next command");
  check(nextActionsReport.currentFirstBlocker === firstPriorityAction.firstBlocker, "external next actions should mirror the first priority blocker");
  check(
    nextActionsReport.currentPrerequisiteCommand === (firstValue(firstPriorityAction.prerequisiteCommands ?? []) || "none"),
    "external next actions should mirror the first priority prerequisite command"
  );
  check(
    nextActionsReport.currentOperatorAction === (firstValue(firstPriorityAction.operatorActions ?? []) || "none"),
    "external next actions should mirror the first priority operator action"
  );
  check(
    nextActionsReport.currentRerunCommand === (firstValue(firstPriorityAction.rerunCommands ?? []) || "none"),
    "external next actions should mirror the first priority rerun command"
  );
  check(
    nextActionsReport.currentRequiredKeyCount === (firstPriorityAction.requiredKeys ?? []).length,
    "external next actions should mirror the first priority required key count"
  );
  check(
    nextActionsReport.currentRequiredKeySummary === ((firstPriorityAction.requiredKeys ?? []).length > 0 ? firstPriorityAction.requiredKeys.join(", ") : "none"),
    "external next actions should mirror the first priority required key summary"
  );
  check(
    nextActionsReport.currentPlaceholderKeyCount === (firstPriorityAction.placeholderKeys ?? []).length,
    "external next actions should mirror the first priority placeholder key count"
  );
  check(
    nextActionsReport.currentPlaceholderKeySummary === ((firstPriorityAction.placeholderKeys ?? []).length > 0 ? firstPriorityAction.placeholderKeys.join(", ") : "none"),
    "external next actions should mirror the first priority placeholder key summary"
  );
  check(
    nextActionsReport.currentPlaceholderEditLocationCount === (firstPriorityAction.placeholderEditLocations ?? []).length,
    "external next actions should mirror the first priority placeholder edit location count"
  );
  check(
    nextActionsReport.currentPlaceholderEditLocationSummary === formatEditLocationSummary(firstPriorityAction.placeholderEditLocations ?? []),
    "external next actions should mirror the first priority placeholder edit location summary"
  );
  check(
    nextActionsReport.currentEnvKeyGuidanceCount === (firstPriorityAction.keyGuidance ?? []).length,
    "external next actions should mirror the first priority key guidance count"
  );
  check(
    nextActionsReport.currentEnvKeyGuidanceSummary === ((firstPriorityAction.keyGuidance ?? []).length > 0 ? `${firstPriorityAction.keyGuidance.length} keys with value-free guidance` : "none"),
    "external next actions should mirror the first priority key guidance summary"
  );
  check(
    nextActionsReport.currentEnvEditTemplateCount === (firstPriorityAction.envEditTemplate ?? []).length,
    "external next actions should mirror the first priority env edit template count"
  );
  check(
    nextActionsReport.currentEnvEditTemplateSummary === formatEnvEditTemplateSummary(firstPriorityAction.envEditTemplate ?? []),
    "external next actions should mirror the first priority env edit template summary"
  );
  check(
    nextActionsReport.currentEnvEditRowsCount === (firstPriorityAction.envEditRows ?? []).length,
    "external next actions should mirror the first priority env edit rows count"
  );
  check(
    nextActionsReport.currentEnvEditRowsSummary === formatEnvEditRowsSummary(firstPriorityAction.envEditRows ?? []),
    "external next actions should mirror the first priority env edit rows summary"
  );
  check(
    nextActionsReport.currentEvidenceRowsCount === (firstPriorityAction.evidence ?? []).length,
    "external next actions should mirror the first priority evidence rows count"
  );
  check(
    nextActionsReport.currentEvidenceRowsSummary === formatEvidenceRowsSummary(firstPriorityAction.evidence ?? []),
    "external next actions should mirror the first priority evidence rows summary"
  );
  check(
    nextActionsReport.currentEvidenceLabelCount === buildEvidenceLabels(firstPriorityAction.evidence ?? []).length,
    "external next actions should mirror the first priority evidence label count"
  );
  check(
    nextActionsReport.currentEvidenceLabelSummary === formatEvidenceLabelSummary(firstPriorityAction.evidence ?? []),
    "external next actions should mirror the first priority evidence label summary"
  );
  check(
    nextActionsReport.currentReadyCriteriaCount === (firstPriorityAction.readyCriteria ?? []).length,
    "external next actions should mirror the first priority ready criteria count"
  );
  check(
    nextActionsReport.currentReadyCriteriaSummary ===
      ((firstPriorityAction.readyCriteria ?? []).length > 0 ? `${firstPriorityAction.readyCriteria.length} value-free ready criteria` : "none"),
    "external next actions should mirror the first priority ready criteria summary"
  );
  check(
    nextActionsReport.currentActionChecklistCount === (firstPriorityAction.actionChecklist ?? []).length,
    "external next actions should mirror the first priority action checklist count"
  );
  check(
    nextActionsReport.currentActionChecklistSummary ===
      ((firstPriorityAction.actionChecklist ?? []).length > 0 ? `${firstPriorityAction.actionChecklist.length} value-free steps` : "none"),
    "external next actions should mirror the first priority action checklist summary"
  );
  check(
    nextActionsReport.currentPrerequisiteCommandCount === (firstPriorityAction.prerequisiteCommands ?? []).length,
    "external next actions should mirror the first priority prerequisite command count"
  );
  check(
    nextActionsReport.currentPrerequisiteCommandSummary === formatCommandSummary(firstPriorityAction.prerequisiteCommands ?? []),
    "external next actions should mirror the first priority prerequisite command summary"
  );
  check(
    nextActionsReport.currentRerunCommandCount === (firstPriorityAction.rerunCommands ?? []).length,
    "external next actions should mirror the first priority rerun command count"
  );
  check(
    nextActionsReport.currentRerunCommandSummary === formatCommandSummary(firstPriorityAction.rerunCommands ?? []),
    "external next actions should mirror the first priority rerun command summary"
  );
  check(
    nextActionsReport.currentCommandSequenceCount ===
      buildCurrentCommandSequence({
        prerequisiteCommands: firstPriorityAction.prerequisiteCommands ?? [],
        nextCommand: firstPriorityAction.nextCommand,
        rerunCommands: firstPriorityAction.rerunCommands ?? []
      }).length,
    "external next actions should mirror the first priority command sequence count"
  );
  check(
    nextActionsReport.currentCommandSequenceSummary ===
      formatCommandSummary(
        buildCurrentCommandSequence({
          prerequisiteCommands: firstPriorityAction.prerequisiteCommands ?? [],
          nextCommand: firstPriorityAction.nextCommand,
          rerunCommands: firstPriorityAction.rerunCommands ?? []
        })
      ),
    "external next actions should mirror the first priority command sequence summary"
  );
}
if (nextActionsReport.priorityActions.length > 1) {
  const secondPriorityAction = nextActionsReport.priorityActions[1];
  check(nextActionsReport.nextPriorityActionId === secondPriorityAction.id, "external next actions should mirror the second priority action id");
  check(nextActionsReport.nextPriorityActionLabel === secondPriorityAction.label, "external next actions should mirror the second priority action label");
  check(nextActionsReport.nextPriorityActionNextCommand === secondPriorityAction.nextCommand, "external next actions should mirror the second priority action command");
  check(nextActionsReport.nextPriorityActionFirstBlocker === secondPriorityAction.firstBlocker, "external next actions should mirror the second priority action blocker");
  check(nextActionsReport.nextActionPreviewId === secondPriorityAction.id, "external next actions next action preview should mirror the second priority id");
  check(nextActionsReport.nextActionPreviewLabel === secondPriorityAction.label, "external next actions next action preview should mirror the second priority label");
  check(nextActionsReport.nextActionPreviewProofCommand === secondPriorityAction.nextCommand, "external next actions next action preview should mirror the second priority command");
  check(nextActionsReport.nextActionPreviewFirstBlocker === secondPriorityAction.firstBlocker, "external next actions next action preview should mirror the second priority blocker");
  check(
    nextActionsReport.nextActionPreviewRerunCommandCount === (secondPriorityAction.rerunCommands ?? []).length,
    "external next actions next action preview should mirror second priority rerun command count"
  );
  check(
    nextActionsReport.nextActionPreviewRerunCommandSummary === formatCommandSummary(secondPriorityAction.rerunCommands ?? []),
    "external next actions next action preview should mirror second priority rerun command summary"
  );
  check(
    nextActionsReport.nextActionPreviewRequiredKeyCount === (secondPriorityAction.requiredKeys ?? []).length,
    "external next actions next action preview should mirror second priority required key count"
  );
  check(
    nextActionsReport.nextActionPreviewPlaceholderKeyCount === (secondPriorityAction.placeholderKeys ?? []).length,
    "external next actions next action preview should mirror second priority placeholder key count"
  );
  check(
    nextActionsReport.nextActionPreviewReadyCriteriaRowCount === (secondPriorityAction.readyCriteria ?? []).length,
    "external next actions next action preview should mirror second priority ready criteria count"
  );
  check(
    nextActionsReport.nextActionPreviewChecklistRowCount === (secondPriorityAction.actionChecklist ?? []).length,
    "external next actions next action preview should mirror second priority checklist count"
  );
  check(
    nextActionsReport.nextActionPreviewEvidenceRowCount === (secondPriorityAction.evidence ?? []).length,
    "external next actions next action preview should mirror second priority evidence count"
  );
  check(
    nextActionsReport.nextActionPreviewBlockerRowCount === (secondPriorityAction.blockers ?? []).length,
    "external next actions next action preview should mirror second priority blocker count"
  );
  check(
    nextActionsReport.nextActionPreviewVerificationRowCount === (secondPriorityAction.readyCriteria ?? []).length,
    "external next actions next action preview should mirror second priority verification count"
  );
  check(
    nextActionsReport.nextActionPreviewPrerequisiteCommandRowCount === (secondPriorityAction.prerequisiteCommands ?? []).length,
    "external next actions next action preview should mirror second priority prerequisite command count"
  );
  check(
    nextActionsReport.nextActionPreviewOperatorActionRowCount === (secondPriorityAction.operatorActions ?? []).length,
    "external next actions next action preview should mirror second priority operator action count"
  );
  check(
    nextActionsReport.nextActionPreviewEnvEditRowCount === (secondPriorityAction.envEditRows ?? []).length,
    "external next actions next action preview should mirror second priority env edit row count"
  );
  check(
    nextActionsReport.nextActionPreviewReadyCriteriaRows.every((row, index) => row.criterion === secondPriorityAction.readyCriteria[index]),
    "external next actions next action preview ready criteria should mirror second priority criteria"
  );
  check(
    nextActionsReport.nextActionPreviewChecklistRows.every((row, index) => row.step === secondPriorityAction.actionChecklist[index]),
    "external next actions next action preview checklist should mirror second priority checklist"
  );
  check(
    nextActionsReport.nextActionPreviewBlockerRows.every((row, index) => row.blocker === secondPriorityAction.blockers[index]),
    "external next actions next action preview blockers should mirror second priority blockers"
  );
  check(
    nextActionsReport.nextActionPreviewPrerequisiteCommandRows.every((row, index) => row.command === secondPriorityAction.prerequisiteCommands[index]),
    "external next actions next action preview prerequisite commands should mirror second priority commands"
  );
  check(
    nextActionsReport.nextActionPreviewOperatorActionRows.every((row, index) => row.action === secondPriorityAction.operatorActions[index]),
    "external next actions next action preview operator actions should mirror second priority operator actions"
  );
  check(
    nextActionsReport.nextActionPreviewEnvEditRows.every((row, index) => row.key === secondPriorityAction.envEditRows[index]?.key),
    "external next actions next action preview env edit rows should mirror second priority env keys"
  );
}
if (nextActionsReport.bootstrapMode === false) {
  const releaseChannelAction = nextActionsReport.priorityActions.find((action) => action.id === "release-channel-metadata");
  if (releaseChannelAction) {
    check(
      releaseChannelAction.readyCriteria.some((item) => item.includes("without placeholder values")),
      "release channel metadata should explain placeholder-free readiness"
    );
    check(
      releaseChannelAction.readyCriteria.some((item) => item.includes("Distribution-channel QA")),
      "release channel metadata should explain distribution-channel QA readiness"
    );
    if ((releaseChannelAction.placeholderKeys ?? []).length > 0) {
      check(
        releaseChannelAction.rerunCommands[0] === "npm run release:current-blocker",
        "release channel placeholder cleanup should make current-blocker the first rerun command"
      );
      check(
        releaseChannelAction.rerunCommands.includes("npm run release:doctor"),
        "release channel placeholder cleanup should keep doctor rerun guidance"
      );
      check(
        releaseChannelAction.actionChecklist.some((item) => item.includes("npm run release:current-blocker")),
        "release channel placeholder cleanup checklist should tell operators to refresh current blocker evidence"
      );
      if (nextActionsReport.currentActionId === "release-channel-metadata") {
        check(
          nextActionsReport.currentRerunCommand === "npm run release:current-blocker",
          "current placeholder action should expose current-blocker as the rerun command"
        );
        check(
          nextActionsReport.currentCommandSequence.includes("npm run release:current-blocker"),
          "current placeholder action command sequence should include current-blocker refresh"
        );
      }
    }
  }
  const autoUpdateAction = nextActionsReport.priorityActions.find((action) => action.id === "auto-update-feed");
  if (autoUpdateAction) {
    check(autoUpdateAction.keyGuidance.length === autoUpdateAction.requiredKeys.length, "auto-update priority action should include guidance for each update feed/channel key");
    check(
      autoUpdateAction.keyGuidance.some((item) => item.key === "GROOVEFORGE_UPDATE_FEED_URL" && item.guidance.includes("safe absolute HTTPS update-feed URL")),
      "auto-update priority action should explain safe update-feed URL values"
    );
    check(
      autoUpdateAction.keyGuidance.some((item) => item.key === "GROOVEFORGE_UPDATE_CHANNEL" && item.guidance.includes("1-32 character lowercase update channel")),
      "auto-update priority action should explain update channel values"
    );
    check(
      autoUpdateAction.readyCriteria.some((item) => item.includes("provider/feed/channel metadata ready")),
      "auto-update priority action should explain auto-update ready criteria"
    );
    if (nextActionsReport.currentActionId === "release-channel-metadata") {
      check(nextActionsReport.nextActionPreviewReady === true, "release-channel current action should include a ready next-action preview");
      check(nextActionsReport.nextPriorityActionId === "auto-update-feed", "release-channel current action should preview auto-update feed next");
      check(
        nextActionsReport.nextActionPreviewProofCommand === "npm run desktop:auto-update-readiness-smoke",
        "release-channel current action should preview the auto-update readiness proof command"
      );
      check(
        nextActionsReport.nextActionPreviewRequiredKeyCount === 6 &&
          nextActionsReport.nextActionPreviewRequiredKeys.includes("GROOVEFORGE_UPDATE_FEED_URL") &&
          nextActionsReport.nextActionPreviewRequiredKeys.includes("UPDATE_CHANNEL"),
        "release-channel current action next preview should include the six update feed/channel keys"
      );
      check(
        nextActionsReport.nextActionPreviewReadyCriteriaRowCount === 3 &&
          nextActionsReport.nextActionPreviewVerificationRowCount === 3,
        "release-channel current action next preview should include three ready criteria and verification rows"
      );
      check(
        nextActionsReport.nextActionPreviewPrerequisiteCommandRows.some((row) => row.command === "npm run desktop:update-feed-config-smoke") &&
          nextActionsReport.nextActionPreviewPrerequisiteCommandRows.some((row) => row.command === "npm run desktop:update-metadata-artifacts-smoke") &&
          nextActionsReport.nextActionPreviewPrerequisiteCommandRows.some((row) => row.command === "npm run desktop:auto-update-readiness-smoke"),
        "release-channel current action next preview should include update feed, metadata, and auto-update prerequisite commands"
      );
      check(
        nextActionsReport.nextActionPreviewOperatorActionRows.some((row) => /ignored update feed and channel keys/i.test(row.action)) &&
          nextActionsReport.nextActionPreviewOperatorActionRows.some((row) => /regenerate update metadata/i.test(row.action)),
        "release-channel current action next preview should include auto-update operator actions"
      );
      check(
        nextActionsReport.nextActionPreviewEnvEditRows.some(
          (row) =>
            row.key === "GROOVEFORGE_UPDATE_FEED_URL" &&
            typeof row.location === "string" &&
            row.location.startsWith(`${nextActionsReport.currentEnvEditTarget}:`)
        ) &&
          nextActionsReport.nextActionPreviewEnvEditRows.some(
            (row) =>
              row.key === "UPDATE_CHANNEL" &&
              typeof row.location === "string" &&
              row.location.startsWith(`${nextActionsReport.currentEnvEditTarget}:`)
          ),
        "release-channel current action next preview should include primary and fallback update env edit rows"
      );
      check(
        nextActionsReport.nextActionPreviewEnvEditRows.every((row) => row.assignment.includes("<") && row.assignment.includes(">")),
        "release-channel current action next preview env edit rows should use value-free assignment shapes"
      );
    }
  }
  const developerIdAction = nextActionsReport.priorityActions.find((action) => action.id === "developer-id-signing");
  if (developerIdAction) {
    check(developerIdAction.keyGuidance.length === developerIdAction.requiredKeys.length, "Developer ID priority action should include guidance for its identity key");
    check(
      developerIdAction.keyGuidance.some((item) => item.key === "GROOVEFORGE_DEVELOPER_ID_IDENTITY" && item.guidance.includes("Developer ID Application identity")),
      "Developer ID priority action should explain identity label or fingerprint values"
    );
    check(
      developerIdAction.readyCriteria.some((item) => item.includes("isolated signed app copy")),
      "Developer ID priority action should explain signed isolated app readiness"
    );
  }
  const notarizationAction = nextActionsReport.priorityActions.find((action) => action.id === "notarization-stapling");
  if (notarizationAction) {
    check(notarizationAction.keyGuidance.length === notarizationAction.requiredKeys.length, "notarization priority action should include guidance for every notary key");
    check(
      notarizationAction.keyGuidance.some((item) => item.key === "GROOVEFORGE_NOTARY_SUBMIT" && item.guidance.includes("Set to 1 only after Developer ID signing")),
      "notarization priority action should explain the submit guard"
    );
    check(
      notarizationAction.keyGuidance.some((item) => item.key === "NOTARYTOOL_KEYCHAIN_PROFILE" && item.guidance.includes("keychain profile")),
      "notarization priority action should explain keychain profile credential signals"
    );
    check(
      notarizationAction.readyCriteria.some((item) => item.includes("accepted notarization, stapling, and staple validation")),
      "notarization priority action should explain accepted notarization and staple readiness"
    );
  }
  const gatekeeperAction = nextActionsReport.priorityActions.find((action) => action.id === "notarized-gatekeeper");
  if (gatekeeperAction) {
    check(
      gatekeeperAction.readyCriteria.some((item) => item.includes("Gatekeeper assessment")),
      "notarized Gatekeeper priority action should explain Gatekeeper assessment readiness"
    );
  }
  const manualQaAction = nextActionsReport.priorityActions.find((action) => action.id === "manual-channel-qa");
  if (manualQaAction) {
    check(manualQaAction.keyGuidance.length === manualQaAction.requiredKeys.length, "manual QA priority action should include guidance for approval and checklist digest keys");
    check(
      manualQaAction.keyGuidance.some((item) => item.key === "GROOVEFORGE_DISTRIBUTION_QA_APPROVED" && item.guidance.includes("manual channel QA passes")),
      "manual QA priority action should explain the approval signal"
    );
    check(
      manualQaAction.keyGuidance.some((item) => item.key === "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256" && item.guidance.includes("checklist SHA-256")),
      "manual QA priority action should explain the checklist digest"
    );
    check(
      manualQaAction.readyCriteria.some((item) => item.includes("checklist digest matches")),
      "manual QA priority action should explain checklist digest readiness"
    );
  }
  const finalHardGateAction = nextActionsReport.priorityActions.find((action) => action.id === "final-hard-gate");
  if (finalHardGateAction) {
    check(
      finalHardGateAction.readyCriteria.some((item) => item.includes("npm run release:external-check")),
      "final hard gate priority action should explain hard gate readiness"
    );
  }
}
check(Number.isInteger(nextActionsReport.localEnvPlaceholderKeyCount), "external next actions should include local env placeholder key count");
check(Array.isArray(nextActionsReport.localEnvPlaceholderKeys), "external next actions should include local env placeholder key names");
check(Array.isArray(nextActionsReport.localEnvPlaceholderLocations), "external next actions should include local env placeholder locations");
check(
  nextActionsReport.localEnvPlaceholderKeyCount === nextActionsReport.localEnvPlaceholderKeys.length,
  "external next actions placeholder key count should match listed keys"
);
if (nextActionsReport.bootstrapMode === false && nextActionsReport.localEnvFileLoaded === false) {
  const releaseChannelAction = nextActionsReport.priorityActions.find((action) => action.id === "release-channel-metadata");
  check(nextActionsReport.currentActionId === releaseChannelAction?.id, "release channel metadata should be the current action when no local env file is loaded");
  check(nextActionsReport.currentRequiredKeyCount === 4, "release channel metadata should surface four current required metadata keys when no local env file is loaded");
  check(nextActionsReport.currentRequiredKeys.includes("GROOVEFORGE_RELEASE_DOWNLOAD_URL"), "release channel metadata should surface release download URL as a current required key name");
  check(nextActionsReport.currentPlaceholderKeyCount === 0, "release channel metadata should not surface current placeholder keys before a local env file is loaded");
  check(nextActionsReport.currentPlaceholderEditLocationCount === 0, "release channel metadata should not surface edit locations before a local env file is loaded");
  check(nextActionsReport.currentEnvKeyGuidanceCount === 4, "release channel metadata should surface four current key guidance rows when no local env file is loaded");
  check(nextActionsReport.currentEnvEditTemplateCount === 4, "release channel metadata should surface four current env edit template assignments when no local env file is loaded");
  check(nextActionsReport.currentEnvEditRowsCount === 4, "release channel metadata should surface four current env edit rows when no local env file is loaded");
  check(
    nextActionsReport.currentEnvEditRows.every(
      (item) =>
        nextActionsReport.currentRequiredKeys.includes(item.key) &&
        item.editTarget === nextActionsReport.currentEnvEditTarget &&
        item.file === nextActionsReport.currentEnvEditTarget &&
        item.line === null &&
        item.locationKnown === false &&
        item.location.endsWith(":line-after-scaffold") &&
        item.placeholder === false &&
        item.valueRecorded === false
    ),
    "release channel metadata should surface value-free scaffold-pending env edit rows when no local env file is loaded"
  );
  check(
    nextActionsReport.currentEnvEditTemplate.some(
      (item) => item.key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" && item.assignment.includes("<direct-download/private-beta/managed-release>")
    ),
    "release channel metadata should surface allowed channel assignment shape when no local env file is loaded"
  );
  check(
    nextActionsReport.currentEnvEditTemplate.some(
      (item) => item.key === "GROOVEFORGE_RELEASE_DOWNLOAD_URL" && item.assignment.includes("<safe-absolute-HTTPS-url-no-credentials-or-fragment>")
    ),
    "release channel metadata should surface safe URL assignment shape when no local env file is loaded"
  );
  check(nextActionsReport.currentEnvKeyGuidance.some((item) => item.key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" && item.guidance.includes("direct-download")), "release channel metadata should surface allowed channel guidance");
  check(nextActionsReport.currentEnvKeyGuidance.some((item) => item.key === "GROOVEFORGE_RELEASE_DOWNLOAD_URL" && item.guidance.includes("safe absolute HTTPS URL")), "release channel metadata should surface safe HTTPS guidance");
  check(nextActionsReport.currentFirstBlocker.includes("local distribution env file is not loaded"), "release channel metadata should surface the missing local env file as the current first blocker");
  check(nextActionsReport.currentOperatorAction.includes("prepare-env"), "release channel metadata should surface prepare-env as the current operator action when no local env file is loaded");
  check(nextActionsReport.currentOperatorAction.includes(nextActionsReport.currentEnvEditTarget), "release channel metadata should include the env edit target when no local env file is loaded");
  check(nextActionsReport.currentActionChecklist.some((item) => item.includes("release:prepare-env")), "release channel metadata should include prepare-env in the current action checklist when no local env file is loaded");
  check(releaseChannelAction?.nextCommand === "npm run release:prepare-env", "release channel metadata should prepare the ignored env scaffold when no local env file is loaded");
  check(
    releaseChannelAction?.firstBlocker.includes("local distribution env file is not loaded"),
    "release channel metadata should make the missing local env file the first blocker when no local env file is loaded"
  );
  check(
    releaseChannelAction?.prerequisiteCommands.includes("npm run release:prepare-env"),
    "release channel metadata should list prepare-env as a prerequisite when no local env file is loaded"
  );
}
if (nextActionsReport.bootstrapMode === false && nextActionsReport.localEnvPlaceholderKeyCount > 0) {
  const releaseChannelAction = nextActionsReport.priorityActions.find((action) => action.id === "release-channel-metadata");
  check(nextActionsReport.currentActionId === releaseChannelAction?.id, "release channel metadata should be the current action when placeholder keys remain");
  check(nextActionsReport.currentNextCommand === "npm run release:doctor", "release channel metadata should surface release doctor as the current next command when placeholders remain");
  check(nextActionsReport.currentPlaceholderKeyCount === 4, "release channel metadata should surface four current placeholder metadata keys when placeholders remain");
  check(nextActionsReport.currentPlaceholderKeys.includes("GROOVEFORGE_RELEASE_DOWNLOAD_URL"), "release channel metadata should surface release download URL as a current placeholder key name");
  check(nextActionsReport.currentPlaceholderEditLocationCount === 4, "release channel metadata should surface four current placeholder edit locations when placeholders remain");
  check(nextActionsReport.doctorReleaseChannelFocusReceiptReady === true, "release channel metadata should include ready release doctor focus receipt when placeholders remain");
  check(nextActionsReport.doctorReleaseChannelFocusRowCount === 4, "release channel metadata should include four release doctor focus rows when placeholders remain");
  check(nextActionsReport.doctorReleaseChannelFocusCurrentReady === false, "release channel metadata should keep release doctor focus current action blocked while placeholders remain");
  check(nextActionsReport.doctorReleaseChannelFocusCurrentReadyCount === 0, "release channel metadata should report zero current-ready focus rows while placeholders remain");
  check(
    nextActionsReport.doctorReleaseChannelFocusPlaceholderKeyCount === nextActionsReport.currentPlaceholderKeyCount,
    "release channel metadata should align release doctor focus placeholder count with current placeholder keys"
  );
  check(
    JSON.stringify(nextActionsReport.doctorReleaseChannelFocusPlaceholderKeys) === JSON.stringify(nextActionsReport.currentPlaceholderKeys),
    "release channel metadata should align release doctor focus placeholder keys with current placeholder keys"
  );
  check(
    nextActionsReport.doctorPostEditProofCurrentActionId === "replace-release-channel-placeholders",
    "release channel metadata should mirror doctor post-edit proof action id while placeholders remain"
  );
  check(
    nextActionsReport.doctorPostEditProofCommand === recommendedPrivateEditOperatorProofCommand,
    "release channel metadata should mirror doctor post-edit strict proof command while placeholders remain"
  );
  check(
    nextActionsReport.doctorPostEditProofMatchesRecommended === true,
    "release channel metadata doctor post-edit proof should match recommended strict proof while placeholders remain"
  );
  check(
    nextActionsReport.currentPlaceholderEditLocations.every(
      (item) =>
        nextActionsReport.currentPlaceholderKeys.includes(item.key) &&
        item.file === nextActionsReport.currentEnvEditTarget &&
        Number.isInteger(item.line) &&
        item.line > 0 &&
        item.placeholder === true &&
        item.valueRecorded === false
    ),
    "release channel metadata should surface value-free file and line edit locations for current placeholder keys"
  );
  check(nextActionsReport.currentEnvKeyGuidanceCount === 4, "release channel metadata should keep four current key guidance rows when placeholders remain");
  check(nextActionsReport.currentEnvEditTemplateCount === 4, "release channel metadata should keep four current env edit template assignments when placeholders remain");
  check(nextActionsReport.currentEnvEditRowsCount === 4, "release channel metadata should keep four current env edit rows when placeholders remain");
  check(nextActionsReport.currentPlaceholderRemediationRowCount === 4, "release channel metadata should keep four current placeholder remediation rows when placeholders remain");
  check(nextActionsReport.currentProofChecklistRowCount === 3, "release channel metadata should surface three current proof checklist rows when placeholders remain");
  check(nextActionsReport.currentCommandVerificationRowCount === 5, "release channel metadata should surface five current command verification rows when placeholders remain");
  check(nextActionsReport.currentActionAcceptanceReady === false, "release channel metadata should keep current action acceptance blocked while placeholders remain");
  check(nextActionsReport.currentActionAcceptanceRowCount === 3, "release channel metadata should surface three current action acceptance rows when placeholders remain");
  check(nextActionsReport.currentActionAcceptanceReadyCount === 0, "release channel metadata should report zero ready acceptance rows while placeholders remain");
  check(nextActionsReport.currentActionAcceptanceBlockerCount === 3, "release channel metadata should surface three acceptance blockers while placeholders remain");
  check(
    nextActionsReport.currentActionAcceptanceRows.every(
      (row) =>
        row.ready === false &&
        row.proofCommand === "npm run release:doctor" &&
        row.rerunCommand === "npm run release:current-blocker" &&
        row.hardGateCommand === "npm run release:external-check" &&
        row.valueRecorded === false
    ),
    "release channel metadata should keep current action acceptance rows value-free and tied to doctor/current-blocker commands"
  );
  check(
    nextActionsReport.currentActionAcceptanceRows.some((row) => row.evidence.includes("4 current placeholder keys remain")),
    "release channel metadata should include placeholder count in current action acceptance evidence"
  );
  check(
    nextActionsReport.currentActionAcceptanceRows.some((row) => row.evidence.includes("private inputs ready no")) &&
      nextActionsReport.currentActionAcceptanceRows.some((row) => row.evidence.includes("distribution-channel QA ready no")),
    "release channel metadata should include private-input and distribution-channel QA acceptance evidence"
  );
  check(
    nextActionsReport.currentActionAcceptanceBlockerRows.some((row) => row.sourceField.includes("currentPlaceholderKeys")) &&
      nextActionsReport.currentActionAcceptanceBlockerRows.some((row) => row.sourceField.includes("privateInputsReady")) &&
      nextActionsReport.currentActionAcceptanceBlockerRows.some((row) => row.sourceField.includes("distributionChannelQaReady")),
    "release channel metadata should map acceptance blockers to placeholder, private-input, and channel-QA source fields"
  );
  check(
    nextActionsReport.currentActionAcceptanceBlockerRows.some((row) => row.operatorAction.includes("Replace current release-channel placeholder keys")),
    "release channel metadata should include placeholder replacement operator action in acceptance blockers"
  );
  check(nextActionsReport.currentActionPostEditVerificationReady === true, "release channel metadata should include ready post-edit verification receipt while placeholders remain");
  check(nextActionsReport.currentActionPostEditVerificationRowCount === 3, "release channel metadata should surface three post-edit verification rows when placeholders remain");
  check(nextActionsReport.currentActionPostEditVerificationCurrentReadyCount === 0, "release channel metadata should report zero current-ready post-edit rows while placeholders remain");
  check(nextActionsReport.currentActionPostEditVerificationMatchesAcceptance === true, "release channel metadata post-edit verification should match acceptance rows");
  check(
    nextActionsReport.currentActionPostEditVerificationRows.some((row) => row.expectedSignal.includes("current placeholder key count is 0")) &&
      nextActionsReport.currentActionPostEditVerificationRows.some((row) => row.expectedSignal.includes("private inputs ready yes")) &&
      nextActionsReport.currentActionPostEditVerificationRows.some((row) => row.expectedSignal.includes("distribution-channel QA ready yes")),
    "release channel metadata should include placeholder, private-input, and channel-QA post-edit expected signals"
  );
  check(nextActionsReport.currentActionHandoffReady === true, "release channel metadata should include ready current action handoff package while placeholders remain");
  check(nextActionsReport.currentActionHandoffRowCount === 5, "release channel metadata should include five current action handoff rows when placeholders remain");
  check(
    nextActionsReport.currentActionHandoffRows.some((row) => row.item === "Source artifacts" && row.evidence.includes("Release doctor")) &&
      nextActionsReport.currentActionHandoffRows.some((row) => row.item === "Current edit target" && row.evidence.includes(nextActionsReport.currentEnvEditTarget)) &&
      nextActionsReport.currentActionHandoffRows.some((row) => row.item === "Acceptance blockers" && row.acceptanceBlockerCount === 3) &&
      nextActionsReport.currentActionHandoffRows.some((row) => row.item === "Rerun order" && row.evidence.includes("npm run release:current-blocker")) &&
      nextActionsReport.currentActionHandoffRows.some((row) => row.item === "Hard gate" && row.hardGateCommand === "npm run release:external-check"),
    "release channel metadata should include source, edit-target, acceptance, rerun, and hard-gate handoff rows"
  );
  check(nextActionsReport.currentPrivateEditSafetyReady === true, "release channel metadata should include ready private edit safety rows while placeholders remain");
  check(nextActionsReport.currentPrivateEditSafetyRowCount === 5, "release channel metadata should include five private edit safety rows when placeholders remain");
  check(
    nextActionsReport.currentPrivateEditSafetyRows.every((row) => row.ready === true && row.valueRecorded === false),
    "release channel metadata private edit safety rows should be ready and value-free"
  );
  check(
    nextActionsReport.currentPrivateEditSafetyRows.some((row) => /ignored local env target/i.test(row.check) && row.evidence.includes(nextActionsReport.currentEnvEditTarget)) &&
      nextActionsReport.currentPrivateEditSafetyRows.some((row) => /value-free/i.test(row.check) && /private values recorded no/i.test(row.evidence)) &&
      nextActionsReport.currentPrivateEditSafetyRows.some((row) => /rerun order/i.test(row.check) && row.command === "npm run release:current-blocker") &&
      nextActionsReport.currentPrivateEditSafetyRows.some((row) => /Hard external gate/i.test(row.check) && row.command === "npm run release:external-check") &&
      nextActionsReport.currentPrivateEditSafetyRows.some((row) => /No remote side effects/i.test(row.check) && /network probe no/i.test(row.evidence)),
    "release channel metadata private edit safety should cover ignored target, value-free output, rerun order, hard-gate separation, and no remote side effects"
  );
  check(nextActionsReport.currentInputShapeChecklistReady === true, "release channel metadata should include ready input shape checklist rows while placeholders remain");
  check(nextActionsReport.currentInputShapeChecklistRowCount === 4, "release channel metadata should include four input shape checklist rows when placeholders remain");
  check(
    JSON.stringify(nextActionsReport.currentInputShapeChecklistRows.map((row) => row.key)) === JSON.stringify(releaseChannelMetadataKeys),
    "release channel metadata input shape checklist should cover the release-channel metadata keys in order"
  );
  check(
    nextActionsReport.currentInputShapeChecklistRows.every(
      (row) =>
        row.ready === true &&
        row.proofCommand === "npm run release:doctor" &&
        row.rerunCommand === "npm run release:current-blocker" &&
        row.hardGateCommand === "npm run release:external-check" &&
        row.valueRecorded === false
    ),
    "release channel metadata input shape checklist rows should be ready, value-free, and tied to doctor/current-blocker commands"
  );
  check(
    nextActionsReport.currentInputShapeChecklistRows.some((row) => row.key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" && /allowed channel token/i.test(row.expectedShape)) &&
      nextActionsReport.currentInputShapeChecklistRows.filter((row) => /safe HTTPS URL shape/i.test(row.expectedShape)).length === 3,
    "release channel metadata input shape checklist should include one allowed channel row and three safe HTTPS URL rows"
  );
  check(
    nextActionsReport.currentInputShapeChecklistRows.every((row) => /expected signal|guidance/i.test(row.evidenceSource)),
    "release channel metadata input shape checklist should cite value-free expected signals or guidance"
  );
  check(
    nextActionsReport.currentLocalEnvDiagnosticsReady === true,
    "release channel metadata should include ready local env diagnostics while placeholders remain"
  );
  check(
    nextActionsReport.currentLocalEnvDiagnosticRowCount === 8,
    "release channel metadata local env diagnostics should include eight rows while placeholders remain"
  );
  check(
    nextActionsReport.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Current edit target present" && row.status === "present"),
    "release channel metadata local env diagnostics should confirm the current edit target is present"
  );
  check(
    nextActionsReport.currentLocalEnvDiagnosticRows.some(
      (row) =>
        row.diagnostic === "Current placeholder scope" &&
        row.status === "blocked" &&
        row.evidence.includes("4 current release-channel placeholders") &&
        row.evidence.includes(`${nextActionsReport.localEnvPlaceholderKeyCount} total local env placeholders`)
    ),
    "release channel metadata local env diagnostics should summarize current and total placeholder scope"
  );
  check(
    nextActionsReport.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Local env value recording" && row.status === "clean"),
    "release channel metadata local env diagnostics should keep local env value recording clean"
  );
  check(
    nextActionsReport.releaseChannelPostEditReceiptReady === true,
    "release channel metadata should include ready release-channel post-edit receipt while placeholders remain"
  );
  check(
    nextActionsReport.releaseChannelPostEditReceiptRowCount === 6,
    "release channel metadata post-edit receipt should include six rows when placeholders remain"
  );
  check(
    nextActionsReport.releaseChannelPostEditReceiptCurrentReadyCount === 1,
    "release channel metadata post-edit receipt should report one current-ready row while placeholders remain"
  );
  check(
    nextActionsReport.releaseChannelPostEditReceiptRows.every((row) => row.ready === true && row.valueRecorded === false),
    "release channel metadata post-edit receipt rows should be receipt-ready and value-free"
  );
  check(
    nextActionsReport.releaseChannelPostEditReceiptRows.some(
      (row) => row.item === "Current key coverage" && row.evidence.includes("4 required release-channel keys")
    ),
    "release channel metadata post-edit receipt should include current key coverage"
  );
  check(
    nextActionsReport.releaseChannelPostEditReceiptRows.some(
      (row) => row.item === "Shape rehearsal coverage" && row.evidence.includes("value-free current input shape rows") && row.currentReady === true
    ),
    "release channel metadata post-edit receipt should include current-ready shape rehearsal coverage"
  );
  check(
    nextActionsReport.releaseChannelPostEditReceiptRows.some(
      (row) => row.item === "Placeholder cleanup acceptance" && row.expectedPostEditSignal.includes("0 current placeholder keys")
    ),
    "release channel metadata post-edit receipt should include placeholder cleanup acceptance"
  );
  check(
    nextActionsReport.releaseChannelPostEditReceiptRows.some(
      (row) =>
        row.item === "Proof and rerun sequence" &&
        row.proofCommand === "npm run release:doctor" &&
        row.rerunCommand === "npm run release:current-blocker"
    ),
    "release channel metadata post-edit receipt should include proof and rerun sequence"
  );
  check(
    nextActionsReport.releaseChannelPostEditReceiptRows.some(
      (row) =>
        row.item === "Acceptance evidence coverage" &&
        row.expectedPostEditSignal.includes("private-input") &&
        row.expectedPostEditSignal.includes("distribution-channel QA")
    ),
    "release channel metadata post-edit receipt should include acceptance evidence coverage"
  );
  check(
    nextActionsReport.releaseChannelPostEditReceiptRows.some(
      (row) => row.item === "Hard gate separation" && row.proofCommand === "npm run release:external-check"
    ),
    "release channel metadata post-edit receipt should include hard gate separation"
  );
  check(
    nextActionsReport.releaseChannelPostEditOperatorReceiptReady === true,
    "release channel metadata should include ready release-channel post-edit operator receipt while placeholders remain"
  );
  check(
    nextActionsReport.releaseChannelPostEditOperatorReceiptRowCount === 7,
    "release channel metadata post-edit operator receipt should include seven rows when placeholders remain"
  );
  check(
    nextActionsReport.releaseChannelPostEditOperatorReceiptRows.every((row) => row.ready === true && row.valueRecorded === false),
    "release channel metadata post-edit operator receipt rows should be ready and value-free"
  );
  check(
    nextActionsReport.releaseChannelPostEditOperatorReceiptRows.some(
      (row) => row.step === "Edit target" && row.operatorAction.includes(nextActionsReport.currentEnvEditTarget)
    ),
    "release channel metadata post-edit operator receipt should include the ignored edit target"
  );
  check(
    nextActionsReport.releaseChannelPostEditOperatorReceiptRows.some(
      (row) => row.step === "Recommended strict proof chain" && row.command === recommendedPrivateEditOperatorProofCommand
    ),
    "release channel metadata post-edit operator receipt should include the recommended strict proof chain"
  );
  check(
    nextActionsReport.releaseChannelPostEditOperatorReceiptRows.some(
      (row) => row.step === "Release doctor proof" && row.command === "npm run release:doctor"
    ),
    "release channel metadata post-edit operator receipt should include release doctor proof refresh"
  );
  check(
    nextActionsReport.releaseChannelPostEditOperatorReceiptRows.some(
      (row) => row.step === "Current blocker refresh" && row.command === "npm run release:current-blocker"
    ),
    "release channel metadata post-edit operator receipt should include current blocker refresh"
  );
  check(
    nextActionsReport.releaseChannelPostEditOperatorReceiptRows.some(
      (row) => row.step === "Next-actions refresh" && row.command === "npm run release:next-actions"
    ),
    "release channel metadata post-edit operator receipt should include next-actions refresh"
  );
  check(
    nextActionsReport.releaseChannelPostEditOperatorReceiptRows.some(
      (row) => row.step === "Hard-gate boundary" && row.command === "npm run release:external-check"
    ),
    "release channel metadata post-edit operator receipt should include hard-gate boundary"
  );
  check(
    nextActionsReport.releaseChannelPostEditOperatorReceiptRows.some(
      (row) => row.step === "Value redaction" && row.expectedPostEditSignal.includes("private URL/channel values never appear")
    ),
    "release channel metadata post-edit operator receipt should include value redaction"
  );
  check(
    nextActionsReport.postEditProofSequenceReceiptReady === true,
    "release channel metadata should include ready post-edit proof sequence receipt"
  );
  check(
    nextActionsReport.postEditProofSequenceReceiptRowCount === 8,
    "release channel metadata post-edit proof sequence should include eight rows"
  );
  check(
    nextActionsReport.postEditProofSequenceReceiptRows.every((row) => row.ready === true && row.valueRecorded === false),
    "release channel metadata post-edit proof sequence rows should be ready and value-free"
  );
  check(
    nextActionsReport.postEditProofSequenceReceiptRows.some(
      (row) => row.step === "Private value edit" && row.command === `manual edit ${nextActionsReport.currentEnvEditTarget}`
    ),
    "release channel metadata post-edit proof sequence should include private value edit"
  );
  check(
    nextActionsReport.postEditProofSequenceReceiptRows.some(
      (row) => row.step === "Recommended strict proof chain" && row.command === recommendedPrivateEditOperatorProofCommand
    ),
    "release channel metadata post-edit proof sequence should include the recommended strict proof chain"
  );
  check(
    nextActionsReport.postEditProofSequenceReceiptRows.some(
      (row) => row.step === "Release doctor proof" && row.command === "npm run release:doctor"
    ),
    "release channel metadata post-edit proof sequence should include release doctor proof"
  );
  check(
    nextActionsReport.postEditProofSequenceReceiptRows.some(
      (row) => row.step === "Current-blocker refresh" && row.command === "npm run release:current-blocker"
    ),
    "release channel metadata post-edit proof sequence should include current-blocker refresh"
  );
  check(
    nextActionsReport.postEditProofSequenceReceiptRows.some(
      (row) => row.step === "Next-actions refresh" && row.command === "npm run release:next-actions"
    ),
    "release channel metadata post-edit proof sequence should include next-actions refresh"
  );
  check(
    nextActionsReport.postEditProofSequenceReceiptRows.some(
      (row) => row.step === "Proof bundle refresh" && row.command === "npm run release:proof-bundle"
    ),
    "release channel metadata post-edit proof sequence should include proof-bundle refresh"
  );
  check(
    nextActionsReport.postEditProofSequenceReceiptRows.some(
      (row) => row.step === "Progress refresh" && row.command === "npm run release:progress-smoke"
    ),
    "release channel metadata post-edit proof sequence should include progress refresh"
  );
  check(
    nextActionsReport.postEditProofSequenceReceiptRows.some(
      (row) => row.step === "Hard-gate boundary" && row.command === "npm run release:external-check"
    ),
    "release channel metadata post-edit proof sequence should include hard-gate boundary"
  );
  check(
    nextActionsReport.currentPlaceholderRemediationRows.every(
      (item) =>
        nextActionsReport.currentPlaceholderKeys.includes(item.key) &&
        item.editTarget === nextActionsReport.currentEnvEditTarget &&
        item.file === nextActionsReport.currentEnvEditTarget &&
        Number.isInteger(item.line) &&
        item.line > 0 &&
        item.placeholder === true &&
        item.sourceArtifact === "Release doctor" &&
        item.sourceReady === true &&
        item.doctorReportReady === true &&
        item.nextCommand === "npm run release:doctor" &&
        item.rerunCommand === "npm run release:current-blocker" &&
        item.valueRecorded === false
    ),
    "release channel metadata should include value-free current placeholder remediation rows sourced from release doctor"
  );
  check(
    nextActionsReport.currentProofChecklistRows.every(
      (item) =>
        nextActionsReport.currentReadyCriteria.includes(item.criterion) &&
        item.evidenceLabels.includes("Distribution private inputs") &&
        item.evidenceLabels.includes("Distribution-channel QA") &&
        item.evidencePaths.some((path) => path.endsWith("-distribution-private-inputs.json")) &&
        item.evidencePaths.some((path) => path.endsWith("-distribution-channel-qa.json")) &&
        item.evidenceReady === true &&
        item.proofCommand === "npm run release:doctor" &&
        item.rerunCommand === "npm run release:current-blocker" &&
        item.hardGateCommand === "npm run release:external-check" &&
        item.valueRecorded === false
    ),
    "release channel metadata should connect current proof checklist rows to stable evidence, release doctor, and the hard gate"
  );
  check(
    nextActionsReport.currentCommandVerificationRows.some((item) => item.command === "npm run release:doctor" && item.role === "proof") &&
      nextActionsReport.currentCommandVerificationRows.some((item) => item.command === "npm run release:current-blocker" && item.role === "rerun") &&
      nextActionsReport.currentCommandVerificationRows.some((item) => item.command === "npm run desktop:distribution-channel-qa-smoke" && item.role === "rerun") &&
      nextActionsReport.currentCommandVerificationRows.filter((item) => item.role === "prerequisite").length === 2,
    "release channel metadata should classify current command verification rows by prerequisite, proof, and rerun roles"
  );
  check(
    nextActionsReport.currentCommandVerificationRows.every(
      (item) =>
        nextActionsReport.currentCommandSequence.includes(item.command) &&
        item.evidenceLabels.includes("Distribution private inputs") &&
        item.evidenceLabels.includes("Distribution-channel QA") &&
        item.evidenceReady === true &&
        item.proofCommand === "npm run release:doctor" &&
        item.rerunCommand === "npm run release:current-blocker" &&
        item.hardGateCommand === "npm run release:external-check" &&
        item.valueRecorded === false
    ),
    "release channel metadata should connect current command verification rows to stable evidence, release doctor, and the hard gate"
  );
  check(
    nextActionsReport.currentEnvEditTemplate.every((item) => nextActionsReport.currentRequiredKeys.includes(item.key) && item.valueRecorded === false),
    "release channel metadata should keep value-free env edit templates scoped to current required keys when placeholders remain"
  );
  check(
    nextActionsReport.currentEnvEditRows.every(
      (item) =>
        nextActionsReport.currentRequiredKeys.includes(item.key) &&
        item.editTarget === nextActionsReport.currentEnvEditTarget &&
        item.file === nextActionsReport.currentEnvEditTarget &&
        Number.isInteger(item.line) &&
        item.line > 0 &&
        item.locationKnown === true &&
        item.placeholder === true &&
        item.valueRecorded === false
    ),
    "release channel metadata should combine current file, line, assignment, guidance, and placeholder status when placeholders remain"
  );
  check(nextActionsReport.currentEnvKeyGuidance.some((item) => item.key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" && item.guidance.includes("managed-release")), "release channel metadata should keep channel value guidance when placeholders remain");
  check(nextActionsReport.currentEnvKeyGuidance.some((item) => item.key === "GROOVEFORGE_SUPPORT_URL" && item.guidance.includes("no credentials")), "release channel metadata should keep safe URL guidance when placeholders remain");
  check(nextActionsReport.currentOperatorAction.includes("Replace placeholder values"), "release channel metadata should surface placeholder replacement as the current operator action when placeholders remain");
  check(nextActionsReport.currentOperatorAction.includes(nextActionsReport.currentEnvEditTarget), "release channel metadata should include the env edit target when placeholders remain");
  check(nextActionsReport.currentOperatorAction.includes("current release-channel keys (4)"), "release channel metadata should focus placeholder replacement on current action keys");
  check(nextActionsReport.currentActionChecklist.some((item) => item.includes("Edit current placeholder keys at")), "release channel metadata should include edit locations in the current action checklist");
  check(
    nextActionsReport.currentActionChecklist.some((item) => item.includes("release:current-blocker")),
    "release channel metadata should include current-blocker refresh in the current action checklist"
  );
  check(releaseChannelAction?.nextCommand === "npm run release:doctor", "release channel metadata should rerun release doctor after placeholder cleanup");
  check(
    releaseChannelAction?.operatorActions.some((action) => action.includes(`Replace placeholder values in ${nextActionsReport.currentEnvEditTarget}`)),
    "release channel metadata should tell operators to replace placeholder values"
  );
  check(
    releaseChannelAction?.firstBlocker.includes("placeholder keys"),
    "release channel metadata should make placeholder keys the first blocker when local env placeholders remain"
  );
}
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
check(markdown.includes("Current next command:"), "external next actions Markdown should include current next command");
check(markdown.includes("Current first blocker:"), "external next actions Markdown should include current first blocker");
check(markdown.includes("Completion gap status:"), "external next actions Markdown should include completion gap status");
check(markdown.includes("Completion gap summary:"), "external next actions Markdown should include completion gap summary");
check(markdown.includes("Completion gap proof target:"), "external next actions Markdown should include completion gap proof target");
check(markdown.includes("Completion gap next proof command:"), "external next actions Markdown should include completion gap next proof command");
check(markdown.includes("Completion gap hard gate command:"), "external next actions Markdown should include completion gap hard gate command");
check(markdown.includes("Completion gap first blocker:"), "external next actions Markdown should include completion gap first blocker");
check(markdown.includes("Completion gap claim blockers:"), "external next actions Markdown should include completion gap claim blocker count");
check(markdown.includes("Current required keys:"), "external next actions Markdown should include current required keys");
check(markdown.includes("Current placeholder keys:"), "external next actions Markdown should include current placeholder keys");
check(markdown.includes("Current placeholder edit locations:"), "external next actions Markdown should include current placeholder edit locations");
check(markdown.includes("Current env key guidance:"), "external next actions Markdown should include current env key guidance");
check(markdown.includes("Current env edit template:"), "external next actions Markdown should include current env edit template status");
check(markdown.includes("Current env edit rows:"), "external next actions Markdown should include current env edit rows status");
check(markdown.includes("Current placeholder remediation rows:"), "external next actions Markdown should include current placeholder remediation row status");
check(markdown.includes("Current evidence rows:"), "external next actions Markdown should include current evidence rows status");
check(markdown.includes("Current evidence labels:"), "external next actions Markdown should include current evidence labels status");
check(markdown.includes("Current ready criteria:"), "external next actions Markdown should include current ready criteria");
check(markdown.includes("Current proof checklist rows:"), "external next actions Markdown should include current proof checklist row status");
check(markdown.includes("Current action checklist:"), "external next actions Markdown should include current action checklist status");
check(markdown.includes("Current action acceptance ready:"), "external next actions Markdown should include current action acceptance readiness");
check(markdown.includes("Current action acceptance rows:"), "external next actions Markdown should include current action acceptance row status");
check(markdown.includes("Current action acceptance blockers:"), "external next actions Markdown should include current action acceptance blocker status");
check(markdown.includes("Current action post-edit verification ready:"), "external next actions Markdown should include current action post-edit verification readiness");
check(markdown.includes("Current action post-edit verification rows:"), "external next actions Markdown should include current action post-edit verification row status");
check(markdown.includes("Current action handoff ready:"), "external next actions Markdown should include current action handoff readiness");
check(markdown.includes("Current action handoff rows:"), "external next actions Markdown should include current action handoff row status");
check(markdown.includes("Current private edit safety ready:"), "external next actions Markdown should include current private edit safety readiness");
check(markdown.includes("Current private edit safety rows:"), "external next actions Markdown should include current private edit safety row status");
check(markdown.includes("Current input shape checklist ready:"), "external next actions Markdown should include current input shape checklist readiness");
check(markdown.includes("Current input shape checklist rows:"), "external next actions Markdown should include current input shape checklist row status");
check(markdown.includes("Current local env diagnostics ready:"), "external next actions Markdown should include current local env diagnostics readiness");
check(markdown.includes("Current local env diagnostic rows:"), "external next actions Markdown should include current local env diagnostic row status");
check(markdown.includes("Next priority action after current clears:"), "external next actions Markdown should include next priority action status");
check(markdown.includes("Next action preview ready:"), "external next actions Markdown should include next action preview readiness");
check(markdown.includes("Next action preview ready criteria rows:"), "external next actions Markdown should include next action preview ready criteria status");
check(markdown.includes("Next action preview checklist rows:"), "external next actions Markdown should include next action preview checklist status");
check(markdown.includes("Next action preview blocker rows:"), "external next actions Markdown should include next action preview blocker status");
check(markdown.includes("Next action preview verification rows:"), "external next actions Markdown should include next action preview verification status");
check(markdown.includes("Next action preview prerequisite command rows:"), "external next actions Markdown should include next action preview prerequisite command status");
check(markdown.includes("Next action preview operator action rows:"), "external next actions Markdown should include next action preview operator action status");
check(markdown.includes("Next action preview env edit rows:"), "external next actions Markdown should include next action preview env edit status");
check(markdown.includes("Current env edit target:"), "external next actions Markdown should include current env edit target");
check(markdown.includes("Current operator action:"), "external next actions Markdown should include current operator action");
check(markdown.includes("Current rerun command:"), "external next actions Markdown should include current rerun command");
check(markdown.includes("Local env placeholder keys:"), "external next actions Markdown should include placeholder key count");
check(markdown.includes("Local Env Placeholder Keys"), "external next actions Markdown should include placeholder key section");
check(markdown.includes("Current Placeholder Edit Locations"), "external next actions Markdown should include current placeholder edit location section");
check(markdown.includes("Placeholder edit locations:"), "external next actions Markdown should include action edit location details");
check(markdown.includes("Current Env Key Guidance"), "external next actions Markdown should include current key guidance section");
check(markdown.includes("Current Env Edit Template"), "external next actions Markdown should include current env edit template section");
check(markdown.includes("Env edit template:"), "external next actions Markdown should include action env edit template details");
check(markdown.includes("Current Env Edit Rows"), "external next actions Markdown should include current env edit rows section");
check(markdown.includes("Env edit rows:"), "external next actions Markdown should include action env edit row details");
check(markdown.includes("Current Placeholder Remediation Checklist"), "external next actions Markdown should include current placeholder remediation checklist section");
check(markdown.includes("Current Evidence Rows"), "external next actions Markdown should include current evidence rows section");
check(markdown.includes("Evidence:"), "external next actions Markdown should include action evidence details");
check(markdown.includes("Current Ready Criteria"), "external next actions Markdown should include current ready criteria section");
check(markdown.includes("Ready criteria:"), "external next actions Markdown should include action ready criteria details");
check(markdown.includes("Current Proof Checklist"), "external next actions Markdown should include current proof checklist section");
check(markdown.includes("Current Action Checklist"), "external next actions Markdown should include current action checklist section");
check(markdown.includes("Action checklist:"), "external next actions Markdown should include action checklist details");
check(markdown.includes("## Current Action Acceptance"), "external next actions Markdown should include current action acceptance section");
check(markdown.includes("| order | criterion | ready | evidence | proof command | rerun command | hard gate | value recorded |"), "external next actions Markdown should include current action acceptance table");
check(markdown.includes("### Current Action Acceptance Blockers"), "external next actions Markdown should include current action acceptance blockers section");
check(markdown.includes("| order | criterion | blocker | source | operator action | proof command | rerun command | value recorded |"), "external next actions Markdown should include current action acceptance blockers table");
check(markdown.includes("## Current Action Post-Edit Verification"), "external next actions Markdown should include current action post-edit verification section");
check(
  markdown.includes("| order | criterion | current ready | current evidence | expected signal | source | proof command | rerun command | hard gate | value recorded |"),
  "external next actions Markdown should include current action post-edit verification table"
);
check(markdown.includes("## Current Action Handoff Package"), "external next actions Markdown should include current action handoff package section");
check(
  markdown.includes("| order | item | source | evidence | blockers | acceptance blockers | proof command | rerun command | hard gate | value recorded |"),
  "external next actions Markdown should include current action handoff table"
);
check(markdown.includes("## Current Private Edit Safety Checklist"), "external next actions Markdown should include current private edit safety section");
check(
  markdown.includes("| order | ready | check | evidence | command | value recorded |"),
  "external next actions Markdown should include current private edit safety table"
);
check(markdown.includes("## Current Input Shape Checklist"), "external next actions Markdown should include current input shape checklist section");
check(
  markdown.includes("| order | key | ready | expected shape | evidence source | proof command | rerun command | value recorded |"),
  "external next actions Markdown should include current input shape checklist table"
);
check(markdown.includes("## Current Local Env Diagnostics"), "external next actions Markdown should include current local env diagnostics section");
check(
  markdown.includes("| order | diagnostic | status | evidence | source | value recorded |"),
  "external next actions Markdown should include current local env diagnostics table"
);
check(markdown.includes("Release-channel post-edit receipt ready:"), "external next actions Markdown should include release-channel post-edit receipt readiness");
check(markdown.includes("Release-channel post-edit receipt rows:"), "external next actions Markdown should include release-channel post-edit receipt rows");
check(markdown.includes("Release-channel post-edit current-ready rows:"), "external next actions Markdown should include release-channel post-edit current-ready rows");
check(markdown.includes("## Release-Channel Post-Edit Receipt"), "external next actions Markdown should include release-channel post-edit receipt section");
check(
  markdown.includes("| order | item | receipt ready | current ready | evidence | expected post-edit signal | proof command | rerun command | source | value recorded |"),
  "external next actions Markdown should include release-channel post-edit receipt table"
);
check(markdown.includes("Release-channel post-edit operator receipt ready:"), "external next actions Markdown should include release-channel post-edit operator receipt readiness");
check(markdown.includes("Release-channel post-edit operator receipt rows:"), "external next actions Markdown should include release-channel post-edit operator receipt rows");
check(markdown.includes("Release-channel post-edit operator recommended proof chain:"), "external next actions Markdown should include release-channel post-edit operator recommended proof chain");
check(markdown.includes("Release-channel post-edit operator proof command:"), "external next actions Markdown should include release-channel post-edit operator proof command");
check(markdown.includes("## Release-Channel Post-Edit Operator Receipt"), "external next actions Markdown should include release-channel post-edit operator receipt section");
check(
  markdown.includes("| order | step | ready | current state | operator action | expected post-edit signal | command | proof command | rerun command | source | value recorded |"),
  "external next actions Markdown should include release-channel post-edit operator receipt table"
);
check(markdown.includes("Post-edit proof sequence receipt ready:"), "external next actions Markdown should include post-edit proof sequence receipt readiness");
check(markdown.includes("Post-edit proof sequence receipt rows:"), "external next actions Markdown should include post-edit proof sequence receipt rows");
check(markdown.includes("Post-edit proof sequence recommended proof chain:"), "external next actions Markdown should include post-edit proof sequence recommended proof chain");
check(markdown.includes("Post-edit proof sequence doctor command:"), "external next actions Markdown should include post-edit proof sequence doctor command");
check(markdown.includes("## Post-Edit Proof Sequence Receipt"), "external next actions Markdown should include post-edit proof sequence receipt section");
check(
  markdown.includes("| order | step | ready | command | expected evidence | source | value recorded |"),
  "external next actions Markdown should include post-edit proof sequence receipt table"
);
check(markdown.includes("## Next Action Preview"), "external next actions Markdown should include next action preview section");
check(
  markdown.includes("| order | criterion | source field | proof command | blocker | value recorded |"),
  "external next actions Markdown should include next action ready criteria table"
);
check(
  markdown.includes("| order | step | proof command | value recorded |"),
  "external next actions Markdown should include next action checklist table"
);
check(
  markdown.includes("| label | path | present | value recorded |"),
  "external next actions Markdown should include next action evidence table"
);
check(
  markdown.includes("| order | blocker | source field | proof command | value recorded |"),
  "external next actions Markdown should include next action blocker table"
);
check(
  markdown.includes("| order | currently ready | criterion | current evidence | expected signal | proof command | value recorded |"),
  "external next actions Markdown should include next action verification table"
);
check(
  markdown.includes("| order | command | source field | proof command | value recorded |"),
  "external next actions Markdown should include next action prerequisite command table"
);
check(
  markdown.includes("| order | action | source field | proof command | value recorded |"),
  "external next actions Markdown should include next action operator action table"
);
check(
  markdown.includes("| order | location | key | assignment shape | guidance | proof command | value recorded |"),
  "external next actions Markdown should include next action env edit table"
);
check(markdown.includes("Completion Gap"), "external next actions Markdown should include completion gap section");
check(markdown.includes("Proof target:"), "external next actions Markdown should include completion gap proof target details");
check(markdown.includes("External distribution claimed by this report: no"), "external next actions Markdown should state completion gap does not claim distribution");
if (nextActionsReport.currentEnvKeyGuidanceCount > 0) {
  check(markdown.includes("safe absolute HTTPS URL"), "external next actions Markdown should include value-free URL guidance");
  check(markdown.includes("direct-download, private-beta, or managed-release"), "external next actions Markdown should include allowed channel guidance");
}
if (nextActionsReport.currentEnvEditTemplateCount > 0) {
  check(markdown.includes("GROOVEFORGE_DISTRIBUTION_CHANNEL=<direct-download/private-beta/managed-release>"), "external next actions Markdown should include allowed channel assignment template");
  check(markdown.includes("GROOVEFORGE_RELEASE_DOWNLOAD_URL=<safe-absolute-HTTPS-url-no-credentials-or-fragment>"), "external next actions Markdown should include safe URL assignment template");
}
if (nextActionsReport.currentEnvEditRowsCount > 0) {
  check(nextActionsReport.currentEnvEditRows.some((item) => markdown.includes(item.location)), "external next actions Markdown should include current env edit row locations");
  check(markdown.includes("| key | location | assignment | guidance | placeholder |"), "external next actions Markdown should include current env edit row table");
}
if (nextActionsReport.currentPlaceholderRemediationRowCount > 0) {
  check(
    nextActionsReport.currentPlaceholderRemediationRows.every((item) => markdown.includes(item.location) && markdown.includes(item.assignment)),
    "external next actions Markdown should include current placeholder remediation locations and assignments"
  );
  check(markdown.includes("| key | location | assignment | guidance | source | next command | value recorded |"), "external next actions Markdown should include current placeholder remediation checklist table");
}
if (nextActionsReport.currentEvidenceRowsCount > 0) {
  check(markdown.includes(nextActionsReport.currentEvidenceLabelSummary), "external next actions Markdown should include current evidence label summary");
  check(nextActionsReport.currentEvidenceRows.some((item) => markdown.includes(item.label)), "external next actions Markdown should include current evidence row labels");
  check(nextActionsReport.currentEvidenceRows.some((item) => markdown.includes(item.path)), "external next actions Markdown should include current evidence row paths");
  check(markdown.includes("| evidence | present | path | value recorded |"), "external next actions Markdown should include current evidence row table");
}
if (nextActionsReport.currentProofChecklistRowCount > 0) {
  check(nextActionsReport.currentProofChecklistRows.some((item) => markdown.includes(item.criterion)), "external next actions Markdown should include current proof checklist criteria");
  check(markdown.includes("| order | criterion | evidence | proof command | rerun command | hard gate | value recorded |"), "external next actions Markdown should include current proof checklist table");
}
if (nextActionsReport.currentCommandVerificationRowCount > 0) {
  check(nextActionsReport.currentCommandVerificationRows.some((item) => markdown.includes(item.command)), "external next actions Markdown should include current command verification commands");
  check(
    markdown.includes("| order | command | role | expectation | evidence | proof target | hard gate | value recorded |"),
    "external next actions Markdown should include current command verification table"
  );
}
if (nextActionsReport.currentActionAcceptanceRowCount > 0) {
  check(
    nextActionsReport.currentActionAcceptanceRows.some((item) => markdown.includes(item.criterion)),
    "external next actions Markdown should include current action acceptance criteria"
  );
  check(
    nextActionsReport.currentActionAcceptanceRows.some((item) => markdown.includes(item.evidence)),
    "external next actions Markdown should include current action acceptance evidence"
  );
}
if (nextActionsReport.currentActionAcceptanceBlockerCount > 0) {
  check(
    nextActionsReport.currentActionAcceptanceBlockerRows.some((item) => markdown.includes(item.operatorAction)),
    "external next actions Markdown should include current action acceptance operator actions"
  );
}
if (nextActionsReport.currentActionPostEditVerificationRowCount > 0) {
  check(
    nextActionsReport.currentActionPostEditVerificationRows.some((item) => markdown.includes(item.expectedSignal)),
    "external next actions Markdown should include current action post-edit expected signals"
  );
}
if (nextActionsReport.currentActionHandoffRowCount > 0) {
  check(
    nextActionsReport.currentActionHandoffRows.some((item) => markdown.includes(item.item) && markdown.includes(item.evidence)),
    "external next actions Markdown should include current action handoff rows"
  );
}
if (nextActionsReport.currentPrivateEditSafetyRowCount > 0) {
  check(
    nextActionsReport.currentPrivateEditSafetyRows.some((item) => markdown.includes(item.check) && markdown.includes(item.evidence)),
    "external next actions Markdown should include current private edit safety rows"
  );
}
if (nextActionsReport.currentInputShapeChecklistRowCount > 0) {
  check(
    nextActionsReport.currentInputShapeChecklistRows.some((item) => markdown.includes(item.key) && markdown.includes(item.expectedShape)),
    "external next actions Markdown should include current input shape checklist rows"
  );
}
if (nextActionsReport.nextActionPreviewReadyCriteriaRowCount > 0) {
  check(
    nextActionsReport.nextActionPreviewReadyCriteriaRows.some((item) => markdown.includes(item.criterion) && markdown.includes(item.proofCommand)),
    "external next actions Markdown should include next action ready criteria rows"
  );
}
if (nextActionsReport.nextActionPreviewBlockerRowCount > 0) {
  check(
    nextActionsReport.nextActionPreviewBlockerRows.some((item) => markdown.includes(item.blocker) && markdown.includes(item.proofCommand)),
    "external next actions Markdown should include next action blocker rows"
  );
}
if (nextActionsReport.nextActionPreviewVerificationRowCount > 0) {
  check(
    nextActionsReport.nextActionPreviewVerificationRows.some((item) => markdown.includes(item.expectedSignal)),
    "external next actions Markdown should include next action verification expected signals"
  );
}
if (nextActionsReport.nextActionPreviewPrerequisiteCommandRowCount > 0) {
  check(
    nextActionsReport.nextActionPreviewPrerequisiteCommandRows.some((item) => markdown.includes(item.command)),
    "external next actions Markdown should include next action prerequisite commands"
  );
}
if (nextActionsReport.nextActionPreviewOperatorActionRowCount > 0) {
  check(
    nextActionsReport.nextActionPreviewOperatorActionRows.some((item) => markdown.includes(item.action)),
    "external next actions Markdown should include next action operator actions"
  );
}
if (nextActionsReport.nextActionPreviewEnvEditRowCount > 0) {
  check(
    nextActionsReport.nextActionPreviewEnvEditRows.some((item) => markdown.includes(item.key) && markdown.includes(item.assignment)),
    "external next actions Markdown should include next action env edit rows"
  );
}
check(markdown.includes("Priority Next Actions"), "external next actions Markdown should include priority actions");
check(markdown.includes("Hard external distribution gate: `npm run release:external-check`"), "external next actions Markdown should keep the hard gate command");
check(markdown.includes("Doctor completion gap status:"), "external next actions Markdown should include release doctor completion gap status");
check(markdown.includes("Doctor completion gap proof target:"), "external next actions Markdown should include release doctor completion gap proof target");
check(markdown.includes("Doctor completion gap next proof command:"), "external next actions Markdown should include release doctor completion gap next proof command");
check(markdown.includes("Doctor completion gap hard gate command:"), "external next actions Markdown should include release doctor completion gap hard gate command");
check(markdown.includes("Doctor completion gap claim blockers:"), "external next actions Markdown should include release doctor completion gap claim blocker count");
check(markdown.includes("## Release Doctor Completion Gap"), "external next actions Markdown should include release doctor completion gap section");
check(markdown.includes("External distribution claimed by release doctor: no"), "external next actions Markdown should state release doctor completion gap does not claim distribution");
check(markdown.includes("Doctor prepare-env audit source ready:"), "external next actions Markdown should include release doctor prepare-env audit source status");
check(markdown.includes("Doctor prepare-env existing local env placeholder keys:"), "external next actions Markdown should include release doctor prepare-env placeholder key status");
check(markdown.includes("Doctor prepare-env release-channel placeholder keys:"), "external next actions Markdown should include release doctor prepare-env release-channel placeholder key status");
check(markdown.includes("Doctor prepare-env release-channel placeholder edit locations:"), "external next actions Markdown should include release doctor prepare-env release-channel edit location status");
check(markdown.includes("## Release Doctor Prepare Env Audit"), "external next actions Markdown should include release doctor prepare-env audit section");
check(markdown.includes("Doctor Prepare Env Existing Placeholder Keys"), "external next actions Markdown should include release doctor prepare-env existing placeholder key section");
check(markdown.includes("Doctor Prepare Env Release-Channel Placeholder Edit Locations"), "external next actions Markdown should include release doctor prepare-env release-channel edit location section");
check(markdown.includes("Value recorded by release doctor prepare-env audit: no"), "external next actions Markdown should state release doctor prepare-env audit value redaction");
check(markdown.includes("Doctor release-channel focus receipt ready:"), "external next actions Markdown should include release doctor focus receipt readiness");
check(markdown.includes("Doctor release-channel focus current-ready rows:"), "external next actions Markdown should include release doctor focus current-ready rows");
check(markdown.includes("Doctor release-channel focus placeholder keys:"), "external next actions Markdown should include release doctor focus placeholder keys");
check(markdown.includes("## Release Doctor Release-Channel Focus Receipt"), "external next actions Markdown should include release doctor focus receipt section");
check(markdown.includes("| key | present | placeholder | shape ready | current ready | evidence | expected signal | proof command | rerun command | value recorded |"), "external next actions Markdown should include release doctor focus receipt table");
check(markdown.includes("Value recorded: no"), "external next actions Markdown should state release doctor focus value redaction");
check(markdown.includes("Doctor post-edit proof command:"), "external next actions Markdown should include release doctor post-edit proof command");
check(markdown.includes("Doctor post-edit proof matches recommended:"), "external next actions Markdown should include release doctor post-edit proof recommended match");
check(markdown.includes("## Release Doctor Post-Edit Proof"), "external next actions Markdown should include release doctor post-edit proof section");
check(markdown.includes("Matches recommended operator proof chain:"), "external next actions Markdown should include release doctor post-edit proof match details");
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
console.log(`- Current next command: ${nextActionsReport.currentNextCommand}`);
console.log(`- Current first blocker: ${nextActionsReport.currentFirstBlocker}`);
console.log(`- Completion gap status: ${nextActionsReport.completionGapStatus}`);
console.log(`- Completion gap summary: ${nextActionsReport.completionGapSummary}`);
console.log(`- Completion gap proof target: ${nextActionsReport.completionGapCurrentProofTarget}`);
console.log(`- Completion gap next proof command: ${nextActionsReport.completionGapNextProofCommand}`);
console.log(`- Completion gap hard gate command: ${nextActionsReport.completionGapHardGateCommand}`);
console.log(`- Completion gap claim blockers: ${nextActionsReport.completionGapClaimBlockerCount} (${nextActionsReport.completionGapClaimBlockerSummary})`);
console.log(`- Doctor completion gap source ready: ${nextActionsReport.doctorCompletionGapSourceReady ? "yes" : "no"}`);
console.log(`- Doctor completion gap status: ${nextActionsReport.doctorCompletionGapStatus}`);
console.log(`- Doctor completion gap summary: ${nextActionsReport.doctorCompletionGapSummary}`);
console.log(`- Doctor completion gap proof target: ${nextActionsReport.doctorCompletionGapProofTarget}`);
console.log(`- Doctor completion gap next proof command: ${nextActionsReport.doctorCompletionGapNextProofCommand}`);
console.log(`- Doctor completion gap hard gate command: ${nextActionsReport.doctorCompletionGapHardGateCommand}`);
console.log(`- Doctor completion gap claim blockers: ${nextActionsReport.doctorCompletionGapClaimBlockerCount} (${nextActionsReport.doctorCompletionGapClaimBlockerSummary})`);
console.log(`- Doctor prepare-env audit source ready: ${nextActionsReport.doctorPrepareEnvAuditSourceReady ? "yes" : "no"}`);
console.log(
  `- Doctor prepare-env existing local env placeholder keys: ${nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeyCount} (${nextActionsReport.doctorPrepareEnvAuditExistingLocalEnvPlaceholderKeySummary})`
);
console.log(
  `- Doctor prepare-env release-channel placeholder keys: ${nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderKeyCount} (${nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderKeySummary})`
);
console.log(
  `- Doctor prepare-env release-channel placeholder edit locations: ${nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocationCount} (${nextActionsReport.doctorPrepareEnvAuditReleaseChannelPlaceholderEditLocationSummary})`
);
console.log(`- Doctor release-channel focus receipt ready: ${nextActionsReport.doctorReleaseChannelFocusReceiptReady ? "yes" : "no"}`);
console.log(`- Doctor release-channel focus current action ready: ${nextActionsReport.doctorReleaseChannelFocusCurrentReady ? "yes" : "no"}`);
console.log(`- Doctor release-channel focus current-ready rows: ${nextActionsReport.doctorReleaseChannelFocusCurrentReadyCount}/${nextActionsReport.doctorReleaseChannelFocusRowCount}`);
console.log(`- Doctor release-channel focus placeholder keys: ${nextActionsReport.doctorReleaseChannelFocusPlaceholderKeyCount}`);
console.log(`- Doctor post-edit proof command: ${nextActionsReport.doctorPostEditProofCommand}`);
console.log(`- Doctor post-edit proof matches recommended: ${nextActionsReport.doctorPostEditProofMatchesRecommended ? "yes" : "no"}`);
console.log(`- Current required keys: ${nextActionsReport.currentRequiredKeyCount} (${nextActionsReport.currentRequiredKeySummary})`);
console.log(`- Current placeholder keys: ${nextActionsReport.currentPlaceholderKeyCount} (${nextActionsReport.currentPlaceholderKeySummary})`);
console.log(`- Current placeholder edit locations: ${nextActionsReport.currentPlaceholderEditLocationCount} (${nextActionsReport.currentPlaceholderEditLocationSummary})`);
console.log(`- Current env key guidance: ${nextActionsReport.currentEnvKeyGuidanceCount} (${nextActionsReport.currentEnvKeyGuidanceSummary})`);
console.log(`- Current env edit template: ${nextActionsReport.currentEnvEditTemplateCount} (${nextActionsReport.currentEnvEditTemplateSummary})`);
console.log(`- Current env edit rows: ${nextActionsReport.currentEnvEditRowsCount} (${nextActionsReport.currentEnvEditRowsSummary})`);
console.log(`- Current placeholder remediation rows: ${nextActionsReport.currentPlaceholderRemediationRowCount} (${nextActionsReport.currentPlaceholderRemediationRowSummary})`);
console.log(`- Current evidence rows: ${nextActionsReport.currentEvidenceRowsCount} (${nextActionsReport.currentEvidenceRowsSummary})`);
console.log(`- Current evidence labels: ${nextActionsReport.currentEvidenceLabelCount} (${nextActionsReport.currentEvidenceLabelSummary})`);
console.log(`- Current ready criteria: ${nextActionsReport.currentReadyCriteriaCount} (${nextActionsReport.currentReadyCriteriaSummary})`);
console.log(`- Current proof checklist rows: ${nextActionsReport.currentProofChecklistRowCount} (${nextActionsReport.currentProofChecklistRowSummary})`);
console.log(`- Current action checklist: ${nextActionsReport.currentActionChecklistCount} (${nextActionsReport.currentActionChecklistSummary})`);
console.log(`- Current action acceptance ready: ${nextActionsReport.currentActionAcceptanceReady ? "yes" : "no"}`);
console.log(`- Current action acceptance rows: ${nextActionsReport.currentActionAcceptanceRowCount} (${nextActionsReport.currentActionAcceptanceSummary})`);
console.log(`- Current action acceptance blockers: ${nextActionsReport.currentActionAcceptanceBlockerCount} (${nextActionsReport.currentActionAcceptanceBlockerSummary})`);
console.log(`- Current action post-edit verification ready: ${nextActionsReport.currentActionPostEditVerificationReady ? "yes" : "no"}`);
console.log(
  `- Current action post-edit verification rows: ${nextActionsReport.currentActionPostEditVerificationRowCount} (${nextActionsReport.currentActionPostEditVerificationSummary})`
);
console.log(`- Current action post-edit signals currently ready: ${nextActionsReport.currentActionPostEditVerificationCurrentSummary}`);
console.log(`- Current action handoff ready: ${nextActionsReport.currentActionHandoffReady ? "yes" : "no"}`);
console.log(`- Current action handoff rows: ${nextActionsReport.currentActionHandoffRowCount} (${nextActionsReport.currentActionHandoffSummary})`);
console.log(`- Current private edit safety ready: ${nextActionsReport.currentPrivateEditSafetyReady ? "yes" : "no"}`);
console.log(`- Current private edit safety rows: ${nextActionsReport.currentPrivateEditSafetyRowCount} (${nextActionsReport.currentPrivateEditSafetySummary})`);
console.log(`- Current input shape checklist ready: ${nextActionsReport.currentInputShapeChecklistReady ? "yes" : "no"}`);
console.log(`- Current input shape checklist rows: ${nextActionsReport.currentInputShapeChecklistRowCount} (${nextActionsReport.currentInputShapeChecklistSummary})`);
console.log(`- Current local env diagnostics ready: ${nextActionsReport.currentLocalEnvDiagnosticsReady ? "yes" : "no"}`);
console.log(`- Current local env diagnostic rows: ${nextActionsReport.currentLocalEnvDiagnosticRowCount} (${nextActionsReport.currentLocalEnvDiagnosticSummary})`);
console.log(`- Release-channel post-edit receipt ready: ${nextActionsReport.releaseChannelPostEditReceiptReady ? "yes" : "no"}`);
console.log(`- Release-channel post-edit receipt rows: ${nextActionsReport.releaseChannelPostEditReceiptRowCount} (${nextActionsReport.releaseChannelPostEditReceiptSummary})`);
console.log(`- Release-channel post-edit current-ready rows: ${nextActionsReport.releaseChannelPostEditReceiptCurrentReadyCount}/${nextActionsReport.releaseChannelPostEditReceiptRowCount}`);
console.log(`- Release-channel post-edit operator receipt ready: ${nextActionsReport.releaseChannelPostEditOperatorReceiptReady ? "yes" : "no"}`);
console.log(`- Release-channel post-edit operator receipt rows: ${nextActionsReport.releaseChannelPostEditOperatorReceiptRowCount} (${nextActionsReport.releaseChannelPostEditOperatorReceiptSummary})`);
console.log(`- Release-channel post-edit operator proof command: ${nextActionsReport.releaseChannelPostEditOperatorReceiptProofCommand}`);
console.log(`- Release-channel post-edit operator blocker refresh: ${nextActionsReport.releaseChannelPostEditOperatorReceiptBlockerRefreshCommand}`);
console.log(`- Release-channel post-edit operator next-actions refresh: ${nextActionsReport.releaseChannelPostEditOperatorReceiptNextActionsCommand}`);
console.log(`- Post-edit proof sequence receipt ready: ${nextActionsReport.postEditProofSequenceReceiptReady ? "yes" : "no"}`);
console.log(`- Post-edit proof sequence rows: ${nextActionsReport.postEditProofSequenceReceiptRowCount} (${nextActionsReport.postEditProofSequenceReceiptSummary})`);
console.log(`- Post-edit proof sequence doctor command: ${nextActionsReport.postEditProofSequenceReceiptDoctorCommand}`);
console.log(`- Post-edit proof sequence current-blocker command: ${nextActionsReport.postEditProofSequenceReceiptCurrentBlockerCommand}`);
console.log(`- Post-edit proof sequence next-actions command: ${nextActionsReport.postEditProofSequenceReceiptNextActionsCommand}`);
console.log(`- Post-edit proof sequence proof-bundle command: ${nextActionsReport.postEditProofSequenceReceiptProofBundleCommand}`);
console.log(`- Post-edit proof sequence progress command: ${nextActionsReport.postEditProofSequenceReceiptProgressCommand}`);
console.log(`- Post-edit proof sequence hard-gate command: ${nextActionsReport.postEditProofSequenceReceiptHardGateCommand}`);
console.log(`- Next priority action after current clears: ${nextActionsReport.nextPriorityActionId} (${nextActionsReport.nextPriorityActionLabel})`);
console.log(`- Next action preview ready: ${nextActionsReport.nextActionPreviewReady ? "yes" : "no"}`);
console.log(`- Next action preview ready criteria rows: ${nextActionsReport.nextActionPreviewReadyCriteriaRowCount} (${nextActionsReport.nextActionPreviewReadyCriteriaSummary})`);
console.log(`- Next action preview checklist rows: ${nextActionsReport.nextActionPreviewChecklistRowCount} (${nextActionsReport.nextActionPreviewChecklistSummary})`);
console.log(`- Next action preview blocker rows: ${nextActionsReport.nextActionPreviewBlockerRowCount} (${nextActionsReport.nextActionPreviewBlockerSummary})`);
console.log(`- Next action preview verification rows: ${nextActionsReport.nextActionPreviewVerificationRowCount} (${nextActionsReport.nextActionPreviewVerificationSummary})`);
console.log(`- Next action preview prerequisite command rows: ${nextActionsReport.nextActionPreviewPrerequisiteCommandRowCount} (${nextActionsReport.nextActionPreviewPrerequisiteCommandSummary})`);
console.log(`- Next action preview operator action rows: ${nextActionsReport.nextActionPreviewOperatorActionRowCount} (${nextActionsReport.nextActionPreviewOperatorActionSummary})`);
console.log(`- Next action preview env edit rows: ${nextActionsReport.nextActionPreviewEnvEditRowCount} (${nextActionsReport.nextActionPreviewEnvEditSummary})`);
console.log(`- Current prerequisite commands: ${nextActionsReport.currentPrerequisiteCommandCount} (${nextActionsReport.currentPrerequisiteCommandSummary})`);
console.log(`- Current rerun commands: ${nextActionsReport.currentRerunCommandCount} (${nextActionsReport.currentRerunCommandSummary})`);
console.log(`- Current command sequence: ${nextActionsReport.currentCommandSequenceCount} (${nextActionsReport.currentCommandSequenceSummary})`);
console.log(`- Current command verification rows: ${nextActionsReport.currentCommandVerificationRowCount} (${nextActionsReport.currentCommandVerificationRowSummary})`);
console.log(`- Current env edit target: ${nextActionsReport.currentEnvEditTarget}`);
console.log(`- Current operator action: ${nextActionsReport.currentOperatorAction}`);
console.log(`- Current rerun command: ${nextActionsReport.currentRerunCommand}`);
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
console.log(`- Local env placeholder keys: ${nextActionsReport.localEnvPlaceholderKeyCount}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted by this next-actions report");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
