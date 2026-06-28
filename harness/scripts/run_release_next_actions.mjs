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
      const keyGuidance = action.keyGuidance.map((item) => `   - ${item.key}: ${item.guidance}`).join("\n") || "   - none";
      const readyCriteria = action.readyCriteria.map((item) => `   - ${item}`).join("\n") || "   - none";
      const editLocations =
        action.placeholderEditLocations.map((item) => `   - ${item.file}:${item.line} ${item.key}`).join("\n") || "   - none";
      const envEditTemplate = action.envEditTemplate.map((item) => `   - ${item.assignment}`).join("\n") || "   - none";
      const actionChecklist = action.actionChecklist.map((item) => `   - ${item}`).join("\n") || "   - none";
      const prerequisites = action.prerequisiteCommands.map((command) => `   - \`${command}\``).join("\n") || "   - none";
      const operatorActions = action.operatorActions.map((item) => `   - ${item}`).join("\n") || "   - none";
      const rerunCommands = action.rerunCommands.map((command) => `   - \`${command}\``).join("\n") || "   - none";
      const blockers = action.blockers.map((blocker) => `   - ${blocker}`).join("\n") || "   - none";
      return `${action.order}. ${action.label}
   Required keys: ${requiredKeys}
   Placeholder keys: ${placeholderKeys}
   Key guidance:
${keyGuidance}
   Ready criteria:
${readyCriteria}
   Placeholder edit locations:
${editLocations}
   Env edit template:
${envEditTemplate}
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

function formatBlockerRows(blockers) {
  if (blockers.length === 0) {
    return "| none | none |";
  }
  return blockers.map((blocker, index) => `| ${index + 1} | ${escapeCell(blocker)} |`).join("\n");
}

function formatKeyList(keys) {
  return Array.isArray(keys) && keys.length > 0 ? keys.map((key) => `- ${key}`).join("\n") : "- None.";
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

function formatChecklistList(items) {
  return Array.isArray(items) && items.length > 0 ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : "1. None.";
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
        ? unique(["npm run release:doctor", group.rerunCommands ?? []])
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
        readyCriteria,
        evidence: group.evidence ?? [],
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
  const currentReadyCriteria = currentAction?.readyCriteria ?? fallback.readyCriteria ?? readyCriteriaForAction(fallback);
  const currentActionChecklist = currentAction?.actionChecklist ?? fallback.actionChecklist ?? [];
  const currentPrerequisiteCommands = currentAction?.prerequisiteCommands ?? [];
  const currentOperatorActions = currentAction?.operatorActions ?? [];
  const currentRerunCommands = currentAction?.rerunCommands ?? [];
  return {
    currentActionId: currentAction?.id ?? fallback.id ?? "none",
    currentActionLabel: currentAction?.label ?? fallback.label ?? "No pending priority action",
    currentNextCommand: currentAction?.nextCommand ?? fallback.nextCommand ?? "npm run release:external-check",
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
    currentReadyCriteriaCount: currentReadyCriteria.length,
    currentReadyCriteriaSummary: currentReadyCriteria.length > 0 ? `${currentReadyCriteria.length} value-free ready criteria` : "none",
    currentReadyCriteria,
    currentActionChecklistCount: currentActionChecklist.length,
    currentActionChecklistSummary: currentActionChecklist.length > 0 ? `${currentActionChecklist.length} value-free steps` : "none",
    currentActionChecklist,
    currentPrerequisiteCommand: firstValue(currentPrerequisiteCommands) || fallback.prerequisiteCommand || "none",
    currentOperatorAction: firstValue(currentOperatorActions) || fallback.operatorAction || "none",
    currentRerunCommand: firstValue(currentRerunCommands) || fallback.rerunCommand || "none",
    currentPrerequisiteCommands,
    currentOperatorActions,
    currentRerunCommands,
    currentActionValueRecorded: false
  };
}

function buildBootstrapNextActionsReport(artifactRows, preflightRun) {
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
      readyCriteria: readyCriteriaForAction({ id: "regenerate-local-release-evidence" }),
      evidence: artifactRows,
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
    ...buildCurrentActionSummary(priorityActions, {
      id: "regenerate-local-release-evidence",
      label: "Regenerate local release evidence",
      nextCommand: "npm run release:check",
      firstBlocker: firstBlockers[0]
    }),
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
- Current required keys: ${report.currentRequiredKeyCount} (${report.currentRequiredKeySummary})
- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${report.currentPlaceholderKeySummary})
- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})
- Current env key guidance: ${report.currentEnvKeyGuidanceCount} (${report.currentEnvKeyGuidanceSummary})
- Current env edit template: ${report.currentEnvEditTemplateCount} (${report.currentEnvEditTemplateSummary})
- Current ready criteria: ${report.currentReadyCriteriaCount} (${report.currentReadyCriteriaSummary})
- Current action checklist: ${report.currentActionChecklistCount} (${report.currentActionChecklistSummary})
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

## Current Ready Criteria

${formatReadyCriteriaList(report.currentReadyCriteria)}

## Current Action Checklist

${formatChecklistList(report.currentActionChecklist)}

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

if (!preflightRun.succeeded && missingSourceEvidence && !fromExisting) {
  nextActionsReport = buildBootstrapNextActionsReport(artifactRows, preflightRun);
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
    sourceEvidenceReady: artifactRows.every((item) => item.present),
    completionStage: externalPreflight.completionStage ?? completionProgress.completionStage ?? "unknown",
    currentFocus,
    ...buildCurrentActionSummary(priorityActions, currentActionFallback),
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
check(Number.isInteger(nextActionsReport.currentReadyCriteriaCount), "external next actions should include the current ready criteria count");
check(typeof nextActionsReport.currentReadyCriteriaSummary === "string" && nextActionsReport.currentReadyCriteriaSummary.length > 0, "external next actions should include the current ready criteria summary");
check(Number.isInteger(nextActionsReport.currentActionChecklistCount), "external next actions should include the current action checklist count");
check(typeof nextActionsReport.currentActionChecklistSummary === "string" && nextActionsReport.currentActionChecklistSummary.length > 0, "external next actions should include the current action checklist summary");
check(typeof nextActionsReport.currentEnvEditTarget === "string" && nextActionsReport.currentEnvEditTarget.length > 0, "external next actions should include the current env edit target");
check(nextActionsReport.currentEnvConfiguredFileKey === "GROOVEFORGE_DISTRIBUTION_ENV_FILE", "external next actions should include the env file override key name");
check(Array.isArray(nextActionsReport.localEnvFilesChecked), "external next actions should include local env files checked");
check(Array.isArray(nextActionsReport.localEnvPresentFiles), "external next actions should include local env present files");
check(Array.isArray(nextActionsReport.currentRequiredKeys), "external next actions should include current required keys");
check(Array.isArray(nextActionsReport.currentPlaceholderKeys), "external next actions should include current placeholder keys");
check(Array.isArray(nextActionsReport.currentPlaceholderEditLocations), "external next actions should include current placeholder edit locations");
check(Array.isArray(nextActionsReport.currentEnvKeyGuidance), "external next actions should include current env key guidance");
check(Array.isArray(nextActionsReport.currentEnvEditTemplate), "external next actions should include current env edit template");
check(Array.isArray(nextActionsReport.currentReadyCriteria), "external next actions should include current ready criteria");
check(Array.isArray(nextActionsReport.currentActionChecklist), "external next actions should include current action checklist");
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
  nextActionsReport.currentReadyCriteriaCount === nextActionsReport.currentReadyCriteria.length,
  "external next actions current ready criteria count should match listed criteria"
);
check(
  nextActionsReport.currentActionChecklistCount === nextActionsReport.currentActionChecklist.length,
  "external next actions current action checklist count should match listed steps"
);
check(Array.isArray(nextActionsReport.currentPrerequisiteCommands), "external next actions should include current prerequisite commands");
check(Array.isArray(nextActionsReport.currentOperatorActions), "external next actions should include current operator actions");
check(Array.isArray(nextActionsReport.currentRerunCommands), "external next actions should include current rerun commands");
check(nextActionsReport.currentActionValueRecorded === false, "external next actions should not record current action values");
check(markdown.includes("Bootstrap mode:"), "external next actions Markdown should include bootstrap mode");
check(markdown.includes("Source evidence ready:"), "external next actions Markdown should include source evidence readiness");
check(markdown.includes("Source evidence prerequisite:"), "external next actions Markdown should include the source evidence prerequisite");
if (nextActionsReport.bootstrapMode === true) {
  check(nextActionsReport.sourceEvidenceReady === false, "bootstrap external next actions should report missing source evidence");
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
  check(nextActionsReport.localReleaseReady === true, "external next actions should include local release readiness");
  check(nextActionsReport.localReleaseReadinessPercent === 100, "external next actions should report 100 percent local release readiness");
}
check(Array.isArray(nextActionsReport.priorityActions), "external next actions should include priority actions");
check(nextActionsReport.externalDistributionReady === true || nextActionsReport.priorityActions.length > 0, "pending external distribution should include at least one priority action");
check(nextActionsReport.priorityActions.every((action) => action.ready === false), "priority actions should be pending actions only");
check(nextActionsReport.priorityActions.every((action) => action.valueRecorded === false), "priority actions should not record values");
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.placeholderKeys)), "priority actions should include placeholder key lists");
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.placeholderEditLocations)), "priority actions should include placeholder edit location lists");
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.keyGuidance)), "priority actions should include key guidance lists");
check(nextActionsReport.priorityActions.every((action) => Array.isArray(action.envEditTemplate)), "priority actions should include env edit template lists");
check(
  nextActionsReport.priorityActions.every((action) =>
    (action.requiredKeys ?? []).every((key) => (action.envEditTemplate ?? []).some((item) => item.key === key && item.valueRecorded === false))
  ),
  "priority actions should include a value-free env edit template for every required key"
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
  check(
    nextActionsReport.currentEnvEditTemplate.every((item) => nextActionsReport.currentRequiredKeys.includes(item.key) && item.valueRecorded === false),
    "release channel metadata should keep value-free env edit templates scoped to current required keys when placeholders remain"
  );
  check(nextActionsReport.currentEnvKeyGuidance.some((item) => item.key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" && item.guidance.includes("managed-release")), "release channel metadata should keep channel value guidance when placeholders remain");
  check(nextActionsReport.currentEnvKeyGuidance.some((item) => item.key === "GROOVEFORGE_SUPPORT_URL" && item.guidance.includes("no credentials")), "release channel metadata should keep safe URL guidance when placeholders remain");
  check(nextActionsReport.currentOperatorAction.includes("Replace placeholder values"), "release channel metadata should surface placeholder replacement as the current operator action when placeholders remain");
  check(nextActionsReport.currentOperatorAction.includes(nextActionsReport.currentEnvEditTarget), "release channel metadata should include the env edit target when placeholders remain");
  check(nextActionsReport.currentOperatorAction.includes("current release-channel keys (4)"), "release channel metadata should focus placeholder replacement on current action keys");
  check(nextActionsReport.currentActionChecklist.some((item) => item.includes("Edit current placeholder keys at")), "release channel metadata should include edit locations in the current action checklist");
  check(nextActionsReport.currentActionChecklist.some((item) => item.includes("release:doctor")), "release channel metadata should include release doctor rerun in the current action checklist");
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
check(markdown.includes("Current required keys:"), "external next actions Markdown should include current required keys");
check(markdown.includes("Current placeholder keys:"), "external next actions Markdown should include current placeholder keys");
check(markdown.includes("Current placeholder edit locations:"), "external next actions Markdown should include current placeholder edit locations");
check(markdown.includes("Current env key guidance:"), "external next actions Markdown should include current env key guidance");
check(markdown.includes("Current env edit template:"), "external next actions Markdown should include current env edit template status");
check(markdown.includes("Current ready criteria:"), "external next actions Markdown should include current ready criteria");
check(markdown.includes("Current action checklist:"), "external next actions Markdown should include current action checklist status");
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
check(markdown.includes("Current Ready Criteria"), "external next actions Markdown should include current ready criteria section");
check(markdown.includes("Ready criteria:"), "external next actions Markdown should include action ready criteria details");
check(markdown.includes("Current Action Checklist"), "external next actions Markdown should include current action checklist section");
check(markdown.includes("Action checklist:"), "external next actions Markdown should include action checklist details");
if (nextActionsReport.currentEnvKeyGuidanceCount > 0) {
  check(markdown.includes("safe absolute HTTPS URL"), "external next actions Markdown should include value-free URL guidance");
  check(markdown.includes("direct-download, private-beta, or managed-release"), "external next actions Markdown should include allowed channel guidance");
}
if (nextActionsReport.currentEnvEditTemplateCount > 0) {
  check(markdown.includes("GROOVEFORGE_DISTRIBUTION_CHANNEL=<direct-download/private-beta/managed-release>"), "external next actions Markdown should include allowed channel assignment template");
  check(markdown.includes("GROOVEFORGE_RELEASE_DOWNLOAD_URL=<safe-absolute-HTTPS-url-no-credentials-or-fragment>"), "external next actions Markdown should include safe URL assignment template");
}
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
console.log(`- Current next command: ${nextActionsReport.currentNextCommand}`);
console.log(`- Current first blocker: ${nextActionsReport.currentFirstBlocker}`);
console.log(`- Current required keys: ${nextActionsReport.currentRequiredKeyCount} (${nextActionsReport.currentRequiredKeySummary})`);
console.log(`- Current placeholder keys: ${nextActionsReport.currentPlaceholderKeyCount} (${nextActionsReport.currentPlaceholderKeySummary})`);
console.log(`- Current placeholder edit locations: ${nextActionsReport.currentPlaceholderEditLocationCount} (${nextActionsReport.currentPlaceholderEditLocationSummary})`);
console.log(`- Current env key guidance: ${nextActionsReport.currentEnvKeyGuidanceCount} (${nextActionsReport.currentEnvKeyGuidanceSummary})`);
console.log(`- Current env edit template: ${nextActionsReport.currentEnvEditTemplateCount} (${nextActionsReport.currentEnvEditTemplateSummary})`);
console.log(`- Current ready criteria: ${nextActionsReport.currentReadyCriteriaCount} (${nextActionsReport.currentReadyCriteriaSummary})`);
console.log(`- Current action checklist: ${nextActionsReport.currentActionChecklistCount} (${nextActionsReport.currentActionChecklistSummary})`);
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
