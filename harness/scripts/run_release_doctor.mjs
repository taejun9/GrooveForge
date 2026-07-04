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
const releaseDoctorMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-doctor.md`);
const releaseDoctorJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-doctor.json`);
const failures = [];
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const privateEditStrictProofCommand = "npm run release:private-edit-strict-proof";
const releaseChannelApplyPrivateEnvPreflightCommand = "npm run release:channel-apply-private-env-preflight";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
const releaseChannelPrivateInputSourceLabel = "process env values or ignored private input file rows";
const releaseChannelEnvKeyGuidance = {
  GROOVEFORGE_DISTRIBUTION_CHANNEL: "Use one of direct-download, private-beta, or managed-release.",
  GROOVEFORGE_RELEASE_DOWNLOAD_URL: "Use a safe absolute HTTPS URL without credentials or URL fragments.",
  GROOVEFORGE_RELEASE_NOTES_URL: "Use a safe absolute HTTPS URL without credentials or URL fragments.",
  GROOVEFORGE_SUPPORT_URL: "Use a safe absolute HTTPS URL without credentials or URL fragments."
};

const targetedChecks = [
  {
    label: "Distribution env template",
    command: "npm run desktop:distribution-env-template-smoke",
    script: "desktop:distribution-env-template-smoke"
  },
  {
    label: "Release prepare env",
    command: "npm run release:prepare-env-smoke",
    script: "release:prepare-env-smoke"
  },
  {
    label: "Update feed config",
    command: "npm run desktop:update-feed-config-smoke",
    script: "desktop:update-feed-config-smoke"
  },
  {
    label: "Developer ID readiness",
    command: "npm run desktop:developer-id-readiness-smoke",
    script: "desktop:developer-id-readiness-smoke"
  },
  {
    label: "Distribution manual QA",
    command: "npm run desktop:distribution-manual-qa-smoke",
    script: "desktop:distribution-manual-qa-smoke"
  },
  {
    label: "Distribution-channel QA",
    command: "npm run desktop:distribution-channel-qa-smoke",
    script: "desktop:distribution-channel-qa-smoke"
  },
  {
    label: "Distribution private inputs",
    command: "npm run desktop:distribution-private-inputs-smoke",
    script: "desktop:distribution-private-inputs-smoke"
  }
];

const sourceArtifacts = [
  {
    label: "Distribution env template",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-env-template.json`)
  },
  {
    label: "Release prepare env",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-prepare-env.json`)
  },
  {
    label: "Update feed config",
    path: path.join(summaryRoot, `${appName}-${platformArch}-update-feed-config.json`)
  },
  {
    label: "Developer ID readiness",
    path: path.join(summaryRoot, `${appName}-${platformArch}-developer-id-readiness.json`)
  },
  {
    label: "Distribution manual QA",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-manual-qa.json`)
  },
  {
    label: "Distribution-channel QA",
    path: path.join(summaryRoot, `${appName}-${platformArch}-distribution-channel-qa.json`)
  },
  {
    label: "Distribution private inputs",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-private-inputs.json`)
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release doctor failed:");
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

function formatCommandRows(commands) {
  return commands.map((item) => `| ${escapeCell(item.label)} | \`${item.command}\` |`).join("\n");
}

function formatArtifactRows(artifacts) {
  return artifacts
    .map((item) => `| ${escapeCell(item.label)} | ${item.present ? "yes" : "no"} | ${escapeCell(item.path)} |`)
    .join("\n");
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

function formatGroupRows(groups) {
  if (!Array.isArray(groups) || groups.length === 0) {
    return "| none | no | none |";
  }
  return groups
    .map((group) => `| ${escapeCell(group.label)} | ${readyLabel(group.ready === true)} | ${escapeCell((group.requiredKeys ?? []).join(", "))} |`)
    .join("\n");
}

function formatKeyList(keys) {
  return Array.isArray(keys) && keys.length > 0 ? keys.map((key) => `- ${key}`).join("\n") : "- None.";
}

function formatBlockerRows(blockers) {
  if (!Array.isArray(blockers) || blockers.length === 0) {
    return "| none | none |";
  }
  return blockers.map((blocker, index) => `| ${index + 1} | ${escapeCell(blocker)} |`).join("\n");
}

function formatSummary(items) {
  return Array.isArray(items) && items.length > 0 ? items.join(", ") : "none";
}

function formatCommandSummary(commands) {
  return Array.isArray(commands) && commands.length > 0 ? commands.join(", ") : "none";
}

function formatCommandList(commands) {
  return Array.isArray(commands) && commands.length > 0 ? commands.map((command, index) => `${index + 1}. \`${command}\``).join("\n") : "1. None.";
}

function buildCurrentActionCommandSequence({ prerequisiteCommands = [], nextCommand = "", rerunCommands = [] } = {}) {
  return unique([prerequisiteCommands, nextCommand, rerunCommands]);
}

function operatorStartRoleForCommand(command) {
  const roles = {
    "npm run release:prepare-env": "operator-scaffold",
    [releaseChannelApplyPrivateEnvPreflightCommand]: "operator-preflight",
    "npm run desktop:distribution-channel-qa-smoke": "operator-proof",
    "npm run release:next-actions": "operator-refresh",
    "npm run release:external-check": "operator-hard-gate"
  };
  return roles[command] ?? "operator-action";
}

function formatChecklistList(items) {
  return Array.isArray(items) && items.length > 0 ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : "1. None.";
}

function formatReadyCriteriaList(items) {
  return Array.isArray(items) && items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None.";
}

function formatLocationSummary(items) {
  return Array.isArray(items) && items.length > 0 ? items.map((item) => `${item.file}:${item.line} ${item.key}`).join(", ") : "none";
}

function formatLocationList(items) {
  return Array.isArray(items) && items.length > 0
    ? items.map((item) => `- ${item.file}:${item.line} ${item.key}`).join("\n")
    : "- None.";
}

function formatLocationRows(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "| none | none | none | no |";
  }
  return items
    .map((item) => `| ${escapeCell(item.file)} | ${Number.isInteger(item.line) ? item.line : "none"} | ${escapeCell(item.key)} | ${readyLabel(item.valueRecorded)} |`)
    .join("\n");
}

function formatEnvEditTemplateBlock(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "- None.";
  }
  return `\`\`\`env\n${items.map((item) => item.assignment).join("\n")}\n\`\`\``;
}

function formatEnvEditRowsTable(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "| key | location | assignment | guidance | placeholder |\n|---|---|---|---|---:|\n| none | none | none | none | no |";
  }
  return [
    "| key | location | assignment | guidance | placeholder |",
    "|---|---|---|---|---:|",
    ...items.map((item) => `| ${escapeCell(item.key)} | ${escapeCell(item.location)} | ${escapeCell(item.assignment)} | ${escapeCell(item.guidance)} | ${readyLabel(item.placeholder)} |`)
  ].join("\n");
}

function formatReleaseChannelFocusRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | no | no | no | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.key)} | ${readyLabel(row.present)} | ${readyLabel(row.placeholder)} | ${readyLabel(row.shapeReady)} | ${readyLabel(row.currentReady)} | ${escapeCell(row.evidence)} | ${escapeCell(row.expectedSignal)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function displayLocalEnvTarget(filePath) {
  if (typeof filePath !== "string" || filePath.trim().length === 0) {
    return distributionLocalEnvDefaults.defaultEnvFileName;
  }
  const absolute = path.isAbsolute(filePath) ? filePath : path.resolve(root, filePath);
  const relativePath = path.relative(root, absolute);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath || distributionLocalEnvDefaults.defaultEnvFileName;
  }
  return path.basename(absolute);
}

function currentLocalEnvEditTarget(localEnvPresentFiles = []) {
  const configuredPath = process.env[distributionLocalEnvDefaults.configuredFileKey]?.trim();
  if (configuredPath) {
    return displayLocalEnvTarget(configuredPath);
  }
  const firstPresentFile = Array.isArray(localEnvPresentFiles) ? localEnvPresentFiles[0] : "";
  return displayLocalEnvTarget(firstPresentFile || distributionLocalEnvDefaults.defaultEnvFileName);
}

function releaseChannelInputSourceOperatorAction({
  editTarget = distributionLocalEnvDefaults.defaultEnvFileName,
  detail = "the four current release-channel metadata keys",
  locationSummary = ""
} = {}) {
  const locationClause = locationSummary && locationSummary !== "none" ? `: ${locationSummary}` : "";
  return `Set private release-channel metadata through ${releaseChannelPrivateInputSourceLabel} for ${detail}, run ${releaseChannelApplyPrivateEnvPreflightCommand}, then run ${releaseChannelApplyPrivateEnvCommand} to update ${editTarget}${locationClause}.`;
}

function localEnvCandidatePaths() {
  const configuredPath = process.env[distributionLocalEnvDefaults.configuredFileKey]?.trim();
  if (configuredPath) {
    return [path.isAbsolute(configuredPath) ? configuredPath : path.resolve(root, configuredPath)];
  }
  return [path.join(root, distributionLocalEnvDefaults.defaultEnvFileName)];
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

function envTemplatePlaceholderForKey(key) {
  const placeholders = {
    GROOVEFORGE_DISTRIBUTION_CHANNEL: "<direct-download/private-beta/managed-release>",
    GROOVEFORGE_RELEASE_DOWNLOAD_URL: "<safe-absolute-HTTPS-url-no-credentials-or-fragment>",
    GROOVEFORGE_RELEASE_NOTES_URL: "<safe-absolute-HTTPS-url-no-credentials-or-fragment>",
    GROOVEFORGE_SUPPORT_URL: "<safe-absolute-HTTPS-url-no-credentials-or-fragment>"
  };
  return placeholders[key] ?? "<private-value-kept-out-of-committed-files>";
}

function buildCurrentActionEnvEditTemplate(keys) {
  return (Array.isArray(keys) ? keys : []).map((key) => {
    const placeholder = envTemplatePlaceholderForKey(key);
    return {
      key,
      placeholder,
      assignment: `${key}=${placeholder}`,
      guidance: releaseChannelEnvKeyGuidance[key] ?? "Set this private env key only in the ignored local env file.",
      valueRecorded: false
    };
  });
}

function buildCurrentActionEnvEditRows({ envEditTemplate = [], editLocations = [], placeholderKeys = [], currentEnvEditTarget = "" } = {}) {
  const locationByKey = new Map(editLocations.map((item) => [item.key, item]));
  const placeholderKeySet = new Set(placeholderKeys);
  return envEditTemplate.map((template) => {
    const location = locationByKey.get(template.key);
    const file = location?.file ?? currentEnvEditTarget;
    const line = Number.isInteger(location?.line) ? location.line : null;
    return {
      key: template.key,
      editTarget: currentEnvEditTarget,
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

function currentActionEvidenceLabels(actionId) {
  const evidenceByAction = {
    "prepare-local-distribution-env": ["Distribution env template", "Release prepare env"],
    "replace-release-channel-placeholders": ["Distribution env template", "Distribution private inputs", "Distribution-channel QA"],
    "verify-release-channel-metadata": ["Distribution private inputs", "Distribution-channel QA"],
    "continue-external-proof-chain": ["Distribution-channel QA", "Developer ID readiness", "Distribution manual QA"],
    "run-hard-external-distribution-gate": ["Distribution private inputs", "Distribution-channel QA", "Developer ID readiness", "Distribution manual QA"]
  };
  return evidenceByAction[actionId] ?? [];
}

function buildCurrentActionEvidenceRows(actionId, artifacts = []) {
  const labelSet = new Set(currentActionEvidenceLabels(actionId));
  return (Array.isArray(artifacts) ? artifacts : [])
    .filter((artifact) => labelSet.has(artifact.label))
    .map((artifact) => ({
      label: artifact.label,
      path: artifact.path,
      present: artifact.present === true,
      valueRecorded: false
    }));
}

function buildCurrentActionReadyCriteria(actionId) {
  const criteriaByAction = {
    "prepare-local-distribution-env": [
      "Ignored local distribution env file loads through the redacted local-env loader.",
      "Release-channel keys are present only in ignored local env input without recording values.",
      "`npm run release:doctor` advances to placeholder cleanup or metadata verification."
    ],
    "replace-release-channel-placeholders": [
      "Required release-channel keys no longer appear in the local env placeholder key list.",
      "Distribution private inputs validates release-channel metadata without recording values.",
      "Distribution-channel QA no longer reports release-channel metadata blockers before the next proof target."
    ],
    "verify-release-channel-metadata": [
      "Distribution-channel QA reports channel metadata ready without recording values.",
      "Distribution private inputs no longer reports release-channel metadata blockers.",
      "`npm run release:next-actions` moves to the next external proof target."
    ],
    "continue-external-proof-chain": [
      "`npm run release:next-actions` selects a later external proof target.",
      "The current first blocker is absent from redacted doctor evidence.",
      "External distribution remains unclaimed until the hard gate passes."
    ],
    "run-hard-external-distribution-gate": [
      "`npm run release:external-check` passes in hard mode.",
      "External distribution readiness is true in redacted gate evidence.",
      "Developer ID signing, notarization, Gatekeeper, auto-update, and manual QA evidence are all proven before any completion claim."
    ]
  };
  return criteriaByAction[actionId] ?? ["Rerun commands complete and redacted evidence no longer lists this action as blocked."];
}

function buildCompletionGapSummary({
  currentActionLabel = "No pending release doctor action",
  currentActionNextCommand = "npm run release:doctor",
  currentActionFirstBlocker = "none",
  currentActionEvidenceLabelSummary = "none",
  currentActionReadyCriteriaSummary = "none",
  currentActionChecklistSummary = "none",
  externalDistributionReady = false,
  hardExternalGateCommand = "npm run release:external-check"
} = {}) {
  const completionGapStatus = externalDistributionReady ? "hard gate confirmation pending" : "external proof pending";
  const completionGapCurrentProofTarget = currentActionLabel;
  const completionGapClaimBlockers = unique([
    externalDistributionReady ? "" : `${completionGapCurrentProofTarget} is not fully proven in redacted release doctor evidence.`,
    currentActionFirstBlocker !== "none" ? currentActionFirstBlocker : "",
    `Hard external distribution gate must pass via ${hardExternalGateCommand}.`,
    "This release doctor stays value-free and cannot itself claim release upload, signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion."
  ]);
  return {
    completionGapStatus,
    completionGapSummary: `${completionGapStatus}: ${completionGapCurrentProofTarget} is the next proof target before any external distribution completion claim.`,
    completionGapCompletionStage: externalDistributionReady ? "external distribution evidence ready; hard gate pending" : "external distribution pending",
    completionGapCurrentProofTarget,
    completionGapNextProofCommand: currentActionNextCommand,
    completionGapHardGateCommand: hardExternalGateCommand,
    completionGapFirstBlocker: currentActionFirstBlocker || "none",
    completionGapEvidenceSummary: currentActionEvidenceLabelSummary,
    completionGapReadyCriteriaSummary: currentActionReadyCriteriaSummary,
    completionGapActionChecklistSummary: currentActionChecklistSummary,
    completionGapClaimBlockerCount: completionGapClaimBlockers.length,
    completionGapClaimBlockerSummary: completionGapClaimBlockers.length > 0 ? `${completionGapClaimBlockers.length} value-free blockers` : "none",
    completionGapClaimBlockers,
    completionGapClaimedExternalDistribution: false,
    completionGapValueRecorded: false
  };
}

function buildCurrentAction({
  localEnvFileLoaded,
  localEnvPlaceholderKeys,
  currentEnvEditTarget,
  channelMetadataReady,
  distributionChannelQa,
  externalDistributionReady,
  firstBlockers
}) {
  const placeholderKeys = Array.isArray(localEnvPlaceholderKeys) ? localEnvPlaceholderKeys : [];
  const releaseChannelPlaceholderKeys = releaseChannelMetadataKeys.filter((key) => placeholderKeys.includes(key));
  if (!localEnvFileLoaded) {
    const checklist = [
      `Run \`npm run release:prepare-env\` to create the ignored local env scaffold at ${currentEnvEditTarget}.`,
      "Keep real release values out of committed files and generated reports.",
      "Rerun `npm run release:doctor` after the scaffold exists."
    ];
    return {
      currentActionId: "prepare-local-distribution-env",
      currentActionLabel: "Create ignored local distribution env",
      currentActionNextCommand: "npm run release:prepare-env",
      currentActionOperatorStartCommand: "npm run release:prepare-env",
      currentActionFirstBlocker: "Ignored local distribution env file is not loaded.",
      currentActionOperatorAction: `Run \`npm run release:prepare-env\` to create ${currentEnvEditTarget}, then set private release-channel metadata through ${releaseChannelPrivateInputSourceLabel}, run \`${releaseChannelApplyPrivateEnvPreflightCommand}\`, and run \`${releaseChannelApplyPrivateEnvCommand}\`.`,
      currentActionRequiredKeys: releaseChannelMetadataKeys,
      currentActionPlaceholderKeys: [],
      currentActionPrerequisiteCommands: [],
      currentActionRerunCommands: ["npm run release:doctor"],
      currentActionChecklist: checklist
    };
  }
  if (releaseChannelPlaceholderKeys.length > 0) {
    const keySummary = releaseChannelPlaceholderKeys.join(", ");
    const checklist = [
      releaseChannelInputSourceOperatorAction({
        editTarget: currentEnvEditTarget,
        detail: "the current release-channel keys",
        locationSummary: keySummary
      }),
      "Use real operator-owned release/support URLs and one allowed distribution channel value through process env or the ignored private input file.",
      "Keep real values out of committed files and generated reports.",
      "Rerun `npm run release:current-blocker` after applying metadata to refresh the value-free blocker evidence.",
      "Rerun `npm run release:next-actions` after the doctor report updates."
    ];
    return {
      currentActionId: "replace-release-channel-placeholders",
      currentActionLabel: "Replace release-channel metadata placeholders",
      currentActionNextCommand: "npm run release:doctor",
      currentActionOperatorStartCommand: releaseChannelApplyPrivateEnvPreflightCommand,
      currentActionFirstBlocker: `Current release-channel metadata still contains ${releaseChannelPlaceholderKeys.length} placeholder keys.`,
      currentActionOperatorAction: releaseChannelInputSourceOperatorAction({
        editTarget: currentEnvEditTarget,
        detail: `the current release-channel keys (${releaseChannelPlaceholderKeys.length})`,
        locationSummary: keySummary
      }),
      currentActionPostEditProofCommand: privateEditStrictProofCommand,
      currentActionPostEditProofRole: "Run the strict value-free proof chain after applying release-channel metadata through the private env helper.",
      currentActionRequiredKeys: releaseChannelMetadataKeys,
      currentActionPlaceholderKeys: releaseChannelPlaceholderKeys,
      currentActionPrerequisiteCommands: [],
      currentActionRerunCommands: ["npm run release:current-blocker", "npm run release:doctor", "npm run release:next-actions"],
      currentActionChecklist: checklist
    };
  }
  if (!channelMetadataReady) {
    const firstChannelBlocker =
      (Array.isArray(distributionChannelQa.channel?.blockers) && distributionChannelQa.channel.blockers[0]) ||
      (Array.isArray(distributionChannelQa.blockers) && distributionChannelQa.blockers[0]) ||
      "Distribution-channel metadata is not ready.";
    const checklist = [
      "Rerun distribution-channel QA after release-channel metadata is configured.",
      "Keep URL, support, feed, credential, token, identity, and channel values out of generated reports.",
      "Rerun `npm run release:next-actions` after channel metadata is ready."
    ];
    return {
      currentActionId: "verify-release-channel-metadata",
      currentActionLabel: "Verify release-channel metadata",
      currentActionNextCommand: "npm run desktop:distribution-channel-qa-smoke",
      currentActionOperatorStartCommand: "npm run desktop:distribution-channel-qa-smoke",
      currentActionFirstBlocker: firstChannelBlocker,
      currentActionOperatorAction: "Run distribution-channel QA after the current release-channel metadata keys have real operator-owned values.",
      currentActionRequiredKeys: releaseChannelMetadataKeys,
      currentActionPlaceholderKeys: [],
      currentActionPrerequisiteCommands: ["npm run desktop:distribution-private-inputs-smoke"],
      currentActionRerunCommands: ["npm run desktop:distribution-channel-qa-smoke", "npm run release:next-actions"],
      currentActionChecklist: checklist
    };
  }
  if (!externalDistributionReady) {
    const firstBlocker = Array.isArray(firstBlockers) && firstBlockers.length > 0 ? firstBlockers[0] : "External distribution is not ready.";
    const checklist = [
      "Run `npm run release:next-actions` for the next external proof target.",
      "Complete the remaining value-free evidence chain before claiming external distribution."
    ];
    return {
      currentActionId: "continue-external-proof-chain",
      currentActionLabel: "Continue external proof chain",
      currentActionNextCommand: "npm run release:next-actions",
      currentActionOperatorStartCommand: "npm run release:next-actions",
      currentActionFirstBlocker: firstBlocker,
      currentActionOperatorAction: "Use external next-actions to select the next proof target after release-channel metadata.",
      currentActionRequiredKeys: [],
      currentActionPlaceholderKeys: [],
      currentActionPrerequisiteCommands: ["npm run release:external-preflight"],
      currentActionRerunCommands: ["npm run release:next-actions"],
      currentActionChecklist: checklist
    };
  }
  return {
    currentActionId: "run-hard-external-distribution-gate",
    currentActionLabel: "Run hard external distribution gate",
    currentActionNextCommand: "npm run release:external-check",
    currentActionOperatorStartCommand: "npm run release:external-check",
    currentActionFirstBlocker: "none",
    currentActionOperatorAction: "Run the hard external distribution gate after every redacted readiness signal is ready.",
    currentActionRequiredKeys: [],
    currentActionPlaceholderKeys: [],
    currentActionPrerequisiteCommands: ["npm run release:check"],
    currentActionRerunCommands: ["npm run release:external-check"],
    currentActionChecklist: ["Run `npm run release:external-check` and archive the resulting value-free evidence."]
  };
}

function enrichCurrentAction(action, { currentEnvEditTarget = "", editLocations = [], artifacts = [] } = {}) {
  const currentActionRequiredKeys = Array.isArray(action.currentActionRequiredKeys) ? action.currentActionRequiredKeys : [];
  const currentActionPlaceholderKeys = Array.isArray(action.currentActionPlaceholderKeys) ? action.currentActionPlaceholderKeys : [];
  const currentActionChecklist = Array.isArray(action.currentActionChecklist) ? action.currentActionChecklist : [];
  const currentActionOperatorStartCommand =
    typeof action.currentActionOperatorStartCommand === "string" && action.currentActionOperatorStartCommand.length > 0
      ? action.currentActionOperatorStartCommand
      : action.currentActionNextCommand;
  const currentActionOperatorStartCommandRole = operatorStartRoleForCommand(currentActionOperatorStartCommand);
  const currentActionPostEditProofCommand =
    typeof action.currentActionPostEditProofCommand === "string" && action.currentActionPostEditProofCommand.length > 0
      ? action.currentActionPostEditProofCommand
      : action.currentActionNextCommand;
  const currentActionPostEditProofRole =
    typeof action.currentActionPostEditProofRole === "string" && action.currentActionPostEditProofRole.length > 0
      ? action.currentActionPostEditProofRole
      : "Run after the current operator action to refresh value-free proof evidence.";
  const currentActionPrerequisiteCommands = Array.isArray(action.currentActionPrerequisiteCommands)
    ? action.currentActionPrerequisiteCommands
    : [];
  const currentActionRerunCommands = Array.isArray(action.currentActionRerunCommands) ? action.currentActionRerunCommands : [];
  const currentActionCommandSequence = buildCurrentActionCommandSequence({
    prerequisiteCommands: currentActionPrerequisiteCommands,
    nextCommand: action.currentActionNextCommand,
    rerunCommands: currentActionRerunCommands
  });
  const currentActionPlaceholderEditLocations = Array.isArray(editLocations)
    ? editLocations.filter((item) => currentActionPlaceholderKeys.includes(item.key))
    : [];
  const currentActionEnvEditTemplate = buildCurrentActionEnvEditTemplate(currentActionRequiredKeys);
  const currentActionEnvEditRows = buildCurrentActionEnvEditRows({
    envEditTemplate: currentActionEnvEditTemplate,
    editLocations: currentActionPlaceholderEditLocations,
    placeholderKeys: currentActionPlaceholderKeys,
    currentEnvEditTarget
  });
  const currentActionEvidenceRows = buildCurrentActionEvidenceRows(action.currentActionId, artifacts);
  const currentActionEvidenceLabels = buildEvidenceLabels(currentActionEvidenceRows);
  const currentActionReadyCriteria = buildCurrentActionReadyCriteria(action.currentActionId);
  return {
    ...action,
    currentActionPrerequisiteCommands,
    currentActionRerunCommands,
    currentActionRequiredKeyCount: currentActionRequiredKeys.length,
    currentActionRequiredKeySummary: formatSummary(currentActionRequiredKeys),
    currentActionPlaceholderKeyCount: currentActionPlaceholderKeys.length,
    currentActionPlaceholderKeySummary: formatSummary(currentActionPlaceholderKeys),
    currentActionPlaceholderEditLocationCount: currentActionPlaceholderEditLocations.length,
    currentActionPlaceholderEditLocationSummary: formatLocationSummary(currentActionPlaceholderEditLocations),
    currentActionPlaceholderEditLocations,
    currentActionEnvEditTemplateCount: currentActionEnvEditTemplate.length,
    currentActionEnvEditTemplateSummary: currentActionEnvEditTemplate.length > 0 ? `${currentActionEnvEditTemplate.length} value-free env assignments` : "none",
    currentActionEnvEditTemplate,
    currentActionEnvEditRowsCount: currentActionEnvEditRows.length,
    currentActionEnvEditRowsSummary: currentActionEnvEditRows.length > 0 ? `${currentActionEnvEditRows.length} value-free edit rows` : "none",
    currentActionEnvEditRows,
    currentActionEvidenceRowsCount: currentActionEvidenceRows.length,
    currentActionEvidenceRowsSummary: formatEvidenceRowsSummary(currentActionEvidenceRows),
    currentActionEvidenceRows,
    currentActionEvidenceLabelCount: currentActionEvidenceLabels.length,
    currentActionEvidenceLabelSummary: formatEvidenceLabelSummary(currentActionEvidenceRows),
    currentActionEvidenceLabels,
    currentActionReadyCriteriaCount: currentActionReadyCriteria.length,
    currentActionReadyCriteriaSummary: currentActionReadyCriteria.length > 0 ? `${currentActionReadyCriteria.length} value-free ready criteria` : "none",
    currentActionReadyCriteria,
    currentActionChecklistCount: currentActionChecklist.length,
    currentActionChecklistSummary: currentActionChecklist.length > 0 ? `${currentActionChecklist.length} value-free steps` : "none",
    currentActionPrerequisiteCommandCount: currentActionPrerequisiteCommands.length,
    currentActionPrerequisiteCommandSummary: formatCommandSummary(currentActionPrerequisiteCommands),
    currentActionRerunCommandCount: currentActionRerunCommands.length,
    currentActionRerunCommandSummary: formatCommandSummary(currentActionRerunCommands),
    currentActionCommandSequenceCount: currentActionCommandSequence.length,
    currentActionCommandSequenceSummary: formatCommandSummary(currentActionCommandSequence),
    currentActionCommandSequence,
    currentActionOperatorStartCommand,
    currentActionOperatorStartCommandRole,
    currentActionOperatorStartCommandValueRecorded: false,
    currentActionPostEditProofCommand,
    currentActionPostEditProofRole,
    currentActionPostEditProofValueRecorded: false,
    currentActionValueRecorded: false
  };
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
      fail(`${item.command} exited with status ${result.status}.`);
    }
  }
}

async function readJsonRequired(artifact) {
  if (!existsSync(artifact.path)) {
    fail(`${artifact.label} artifact was not generated.`, `Expected: ${relative(artifact.path)}`);
  }
  return JSON.parse(await readFile(artifact.path, "utf8"));
}

function sourceLocalEnvLoaded(...sources) {
  return sources.some((source) => source?.localEnvInput?.enabled === true);
}

function sourceValueRecorded(...sources) {
  const valueFields = [
    "localEnvValueRecorded",
    "privateValuesRecorded",
    "releaseUrlValueRecorded",
    "supportUrlValueRecorded",
    "feedValueRecorded",
    "credentialValueRecorded",
    "tokenValueRecorded",
    "channelValueRecorded",
    "developerIdIdentityValueRecorded"
  ];
  return sources.some((source) => valueFields.some((field) => source?.[field] === true) || source?.localEnvInput?.valueRecorded === true);
}

function sourceClaimedExternalDistribution(...sources) {
  return sources.some((source) => source?.releaseGateClaimedExternalDistribution === true);
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Doctor

## Status

- Doctor report ready: ${readyLabel(report.releaseDoctorReportReady)}
- External distribution ready: ${readyLabel(report.externalDistributionReady)}
- Completion gap status: ${report.completionGapStatus}
- Completion gap summary: ${report.completionGapSummary}
- Completion gap proof target: ${report.completionGapCurrentProofTarget}
- Completion gap next proof command: \`${report.completionGapNextProofCommand}\`
- Completion gap hard gate command: \`${report.completionGapHardGateCommand}\`
- Completion gap first blocker: ${report.completionGapFirstBlocker}
- Completion gap claim blockers: ${report.completionGapClaimBlockerCount} (${report.completionGapClaimBlockerSummary})
- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}
- Local env ready: ${readyLabel(report.localEnvReady)}
- Distribution env template ready: ${readyLabel(report.distributionEnvTemplateReady)}
- Release prepare env ready: ${readyLabel(report.releasePrepareEnvReady)}
- Release prepare env scaffold written: ${readyLabel(report.releasePrepareEnvScaffoldWritten)}
- Release prepare-env existing local env file loaded: ${readyLabel(report.releasePrepareEnvExistingLocalEnvFileLoaded)}
- Release prepare-env existing local env placeholder keys: ${report.releasePrepareEnvExistingLocalEnvPlaceholderKeyCount} (${report.releasePrepareEnvExistingLocalEnvPlaceholderKeySummary})
- Release prepare-env release-channel placeholder keys: ${report.releasePrepareEnvExistingReleaseChannelPlaceholderKeyCount} (${report.releasePrepareEnvExistingReleaseChannelPlaceholderKeySummary})
- Release prepare-env release-channel placeholder edit locations: ${report.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationCount} (${report.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationSummary})
- Template keys covered: ${readyLabel(report.templateKeysCovered)}
- Private inputs ready: ${readyLabel(report.privateInputsReady)}
- Private input groups ready: ${report.privateInputGroupReadyCount}/${report.privateInputGroupTotal}
- Release-channel focus receipt ready: ${readyLabel(report.releaseChannelFocusReceiptReady)}
- Release-channel focus current action ready: ${readyLabel(report.releaseChannelFocusCurrentReady)}
- Release-channel focus current-ready rows: ${report.releaseChannelFocusCurrentReadyCount}/${report.releaseChannelFocusRowCount}
- Release-channel focus placeholder keys: ${report.releaseChannelFocusPlaceholderKeyCount}
- Local env placeholder keys: ${report.localEnvPlaceholderKeyCount}
- Current action: ${report.currentActionLabel}
- Current next command: \`${report.currentActionNextCommand}\`
- Current action operator start command: \`${report.currentActionOperatorStartCommand}\`
- Current action operator start command role: ${report.currentActionOperatorStartCommandRole}
- Current action post-edit proof command: \`${report.currentActionPostEditProofCommand}\`
- Current action post-edit proof role: ${report.currentActionPostEditProofRole}
- Current first blocker: ${report.currentActionFirstBlocker}
- Current env edit target: ${report.currentEnvEditTarget}
- Current action required keys: ${report.currentActionRequiredKeyCount} (${report.currentActionRequiredKeySummary})
- Current action placeholder keys: ${report.currentActionPlaceholderKeyCount} (${report.currentActionPlaceholderKeySummary})
- Current action placeholder edit locations: ${report.currentActionPlaceholderEditLocationCount} (${report.currentActionPlaceholderEditLocationSummary})
- Current action env edit template: ${report.currentActionEnvEditTemplateCount} (${report.currentActionEnvEditTemplateSummary})
- Current action env edit rows: ${report.currentActionEnvEditRowsCount} (${report.currentActionEnvEditRowsSummary})
- Current action evidence rows: ${report.currentActionEvidenceRowsCount} (${report.currentActionEvidenceRowsSummary})
- Current action evidence labels: ${report.currentActionEvidenceLabelCount} (${report.currentActionEvidenceLabelSummary})
- Current action ready criteria: ${report.currentActionReadyCriteriaCount} (${report.currentActionReadyCriteriaSummary})
- Current action checklist: ${report.currentActionChecklistCount} (${report.currentActionChecklistSummary})
- Current action prerequisite commands: ${report.currentActionPrerequisiteCommandCount} (${report.currentActionPrerequisiteCommandSummary})
- Current action rerun commands: ${report.currentActionRerunCommandCount} (${report.currentActionRerunCommandSummary})
- Current action command sequence: ${report.currentActionCommandSequenceCount} (${report.currentActionCommandSequenceSummary})
- Update feed current environment ready: ${readyLabel(report.updateFeedCurrentEnvironmentReady)}
- Channel metadata ready: ${readyLabel(report.channelMetadataReady)}
- Distribution-channel QA ready: ${readyLabel(report.distributionChannelQaReady)}
- Manual QA checklist ready: ${readyLabel(report.manualQaChecklistReady)}
- Manual QA approval ready: ${readyLabel(report.manualQaApprovalReady)}
- Manual QA checklist digest matches: ${readyLabel(report.manualQaChecklistDigestMatches)}
- Developer ID signing ready: ${readyLabel(report.developerIdSigningReady)}
- Notarization credential signal ready: ${readyLabel(report.notarizationCredentialSignalReady)}
- First blockers tracked: ${report.firstBlockers.length}
- Private values recorded: no
- Network probe attempted by this doctor: no
- Release upload attempted by this doctor: no
- Apple notary submission attempted by this doctor: no
- Signing attempted by this doctor: no

## Commands

- Doctor command: \`${report.doctorCommand}\`
- Prepare env command: \`${report.prepareEnvCommand}\`
- Progress command: \`${report.progressCommand}\`
- Hard external distribution gate: \`${report.hardExternalGateCommand}\`

| targeted check | command |
|---|---|
${formatCommandRows(report.targetedCommands)}

## Release Prepare Env Placeholder Audit

- Existing local env files checked: ${report.releasePrepareEnvExistingLocalEnvFilesChecked.join(", ") || "none"}
- Existing local env present files: ${report.releasePrepareEnvExistingLocalEnvPresentFiles.join(", ") || "none"}
- Existing local env file loaded: ${readyLabel(report.releasePrepareEnvExistingLocalEnvFileLoaded)}
- Existing local env placeholder keys: ${report.releasePrepareEnvExistingLocalEnvPlaceholderKeyCount} (${report.releasePrepareEnvExistingLocalEnvPlaceholderKeySummary})
- Existing local env placeholder edit locations: ${report.releasePrepareEnvExistingLocalEnvPlaceholderEditLocationCount} (${report.releasePrepareEnvExistingLocalEnvPlaceholderEditLocationSummary})
- Existing release-channel placeholder keys: ${report.releasePrepareEnvExistingReleaseChannelPlaceholderKeyCount} (${report.releasePrepareEnvExistingReleaseChannelPlaceholderKeySummary})
- Existing release-channel placeholder edit locations: ${report.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationCount} (${report.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationSummary})
- Value recorded: ${readyLabel(report.releasePrepareEnvExistingLocalEnvValueRecorded)}

### Release Prepare Env Existing Placeholder Keys

${formatKeyList(report.releasePrepareEnvExistingLocalEnvPlaceholderKeys)}

### Release Prepare Env Release-Channel Placeholder Edit Locations

| file | line | key | value recorded |
|---|---:|---|---:|
${formatLocationRows(report.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocations)}

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
- External distribution claimed by this doctor: ${readyLabel(report.completionGapClaimedExternalDistribution)}
- Value recorded: ${readyLabel(report.completionGapValueRecorded)}

${formatChecklistList(report.completionGapClaimBlockers)}

## Current Action

- Action: ${report.currentActionLabel}
- Next command: \`${report.currentActionNextCommand}\`
- Operator start command: \`${report.currentActionOperatorStartCommand}\`
- Operator start command role: ${report.currentActionOperatorStartCommandRole}
- Post-edit proof command: \`${report.currentActionPostEditProofCommand}\`
- Post-edit proof role: ${report.currentActionPostEditProofRole}
- First blocker: ${report.currentActionFirstBlocker}
- Env edit target: ${report.currentEnvEditTarget}
- Operator action: ${report.currentActionOperatorAction}
- Required keys: ${report.currentActionRequiredKeyCount} (${report.currentActionRequiredKeySummary})
- Placeholder keys: ${report.currentActionPlaceholderKeyCount} (${report.currentActionPlaceholderKeySummary})
- Placeholder edit locations: ${report.currentActionPlaceholderEditLocationCount} (${report.currentActionPlaceholderEditLocationSummary})
- Env edit template: ${report.currentActionEnvEditTemplateCount} (${report.currentActionEnvEditTemplateSummary})
- Env edit rows: ${report.currentActionEnvEditRowsCount} (${report.currentActionEnvEditRowsSummary})
- Evidence rows: ${report.currentActionEvidenceRowsCount} (${report.currentActionEvidenceRowsSummary})
- Evidence labels: ${report.currentActionEvidenceLabelCount} (${report.currentActionEvidenceLabelSummary})
- Ready criteria: ${report.currentActionReadyCriteriaCount} (${report.currentActionReadyCriteriaSummary})
- Prerequisite commands: ${report.currentActionPrerequisiteCommandCount} (${report.currentActionPrerequisiteCommandSummary})
- Rerun commands: ${report.currentActionRerunCommandCount} (${report.currentActionRerunCommandSummary})
- Command sequence: ${report.currentActionCommandSequenceCount} (${report.currentActionCommandSequenceSummary})
- Operator start command value recorded: ${readyLabel(report.currentActionOperatorStartCommandValueRecorded)}
- Post-edit proof value recorded: ${readyLabel(report.currentActionPostEditProofValueRecorded)}
- Value recorded: ${readyLabel(report.currentActionValueRecorded)}

${formatChecklistList(report.currentActionChecklist)}

## Current Action Command Sequence

${formatCommandList(report.currentActionCommandSequence)}

## Current Action Evidence Rows

${formatEvidenceRowsTable(report.currentActionEvidenceRows)}

## Current Action Ready Criteria

${formatReadyCriteriaList(report.currentActionReadyCriteria)}

## Current Action Placeholder Edit Locations

${formatLocationList(report.currentActionPlaceholderEditLocations)}

## Current Action Env Edit Template

${formatEnvEditTemplateBlock(report.currentActionEnvEditTemplate)}

## Current Action Env Edit Rows

${formatEnvEditRowsTable(report.currentActionEnvEditRows)}

## Release-Channel Focus Receipt

- Receipt ready: ${readyLabel(report.releaseChannelFocusReceiptReady)}
- Current action ready: ${readyLabel(report.releaseChannelFocusCurrentReady)}
- Receipt rows: ${report.releaseChannelFocusRowCount} (${report.releaseChannelFocusSummary})
- Current-ready rows: ${report.releaseChannelFocusCurrentReadyCount}/${report.releaseChannelFocusRowCount}
- Placeholder keys: ${report.releaseChannelFocusPlaceholderKeyCount}
- Proof command: \`${report.releaseChannelFocusProofCommand}\`
- Rerun command: \`${report.releaseChannelFocusRerunCommand}\`
- Value recorded: ${readyLabel(report.releaseChannelFocusValueRecorded)}

| key | present | placeholder | shape ready | current ready | evidence | expected signal | proof command | rerun command | value recorded |
|---|---:|---:|---:|---:|---|---|---|---|---:|
${formatReleaseChannelFocusRows(report.releaseChannelFocusRows)}

## Source Artifacts

| artifact | present | path |
|---|---:|---|
${formatArtifactRows(report.sourceArtifacts)}

## Private Input Groups

| group | ready | required keys |
|---|---:|---|
${formatGroupRows(report.privateInputGroups)}

## Local Env Placeholder Keys

${formatKeyList(report.localEnvPlaceholderKeys)}

## Current First Blockers

| order | blocker |
|---:|---|
${formatBlockerRows(report.firstBlockers)}

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, local env values, private beats, and real user audio are not recorded.

## Not Claimed

This doctor does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

runTargetedChecks();

const artifactRows = sourceArtifacts.map((artifact) => ({
  label: artifact.label,
  path: relative(artifact.path),
  present: existsSync(artifact.path)
}));

const [
  distributionEnvTemplate,
  releasePrepareEnv,
  updateFeedConfig,
  developerIdReadiness,
  distributionManualQa,
  distributionChannelQa,
  distributionPrivateInputs
] = await Promise.all(sourceArtifacts.map(readJsonRequired));

const privateInputGroups = Array.isArray(distributionPrivateInputs.inputGroups) ? distributionPrivateInputs.inputGroups : [];
const privateInputGroupReadyCount = privateInputGroups.filter((group) => group.ready === true).length;
const releaseChannelFocusRows = Array.isArray(distributionPrivateInputs.releaseChannelFocusRows)
  ? distributionPrivateInputs.releaseChannelFocusRows
  : [];
const localEnvPlaceholderKeys = Array.isArray(distributionPrivateInputs.localEnvPlaceholderKeys)
  ? distributionPrivateInputs.localEnvPlaceholderKeys
  : [];
const localEnvPlaceholderKeyCount = Number.isInteger(distributionPrivateInputs.localEnvPlaceholderKeyCount)
  ? distributionPrivateInputs.localEnvPlaceholderKeyCount
  : localEnvPlaceholderKeys.length;
const localEnvInput = distributionPrivateInputs.localEnvInput ?? distributionEnvTemplate.localEnvInput ?? {};
const localEnvFilesChecked = Array.isArray(localEnvInput.filesChecked) ? localEnvInput.filesChecked : [];
const localEnvPresentFiles = Array.isArray(localEnvInput.presentFiles) ? localEnvInput.presentFiles : [];
const localEnvFileLoaded = sourceLocalEnvLoaded(
  distributionEnvTemplate,
  updateFeedConfig,
  developerIdReadiness,
  distributionManualQa,
  distributionChannelQa,
  distributionPrivateInputs
);
const combinedBlockers = unique([
  updateFeedConfig.currentEnvironmentConfig?.blockers ?? [],
  distributionEnvTemplate.localEnvBlockers ?? [],
  developerIdReadiness.blockers ?? [],
  distributionManualQa.blockers ?? [],
  distributionChannelQa.channel?.blockers ?? [],
  distributionChannelQa.blockers ?? [],
  distributionPrivateInputs.privateInputBlockers ?? [],
  distributionPrivateInputs.externalDistributionBlockers ?? []
]);
const externalDistributionReady =
  distributionPrivateInputs.externalDistributionReady === true &&
  distributionChannelQa.externalDistributionReady === true &&
  developerIdReadiness.externalDistributionReady === true;
const currentEnvEditTarget = currentLocalEnvEditTarget(localEnvPresentFiles);
const currentActionEditLocations = await readLocalEnvKeyLocations(releaseChannelMetadataKeys);
const currentAction = enrichCurrentAction(
  buildCurrentAction({
    localEnvFileLoaded,
    localEnvPlaceholderKeys,
    currentEnvEditTarget,
    channelMetadataReady: distributionChannelQa.channel?.ready === true,
    distributionChannelQa,
    externalDistributionReady,
    firstBlockers: combinedBlockers.slice(0, 12)
  }),
  {
    currentEnvEditTarget,
    editLocations: currentActionEditLocations,
    artifacts: artifactRows
  }
);
const completionGap = buildCompletionGapSummary({
  currentActionLabel: currentAction.currentActionLabel,
  currentActionNextCommand: currentAction.currentActionNextCommand,
  currentActionFirstBlocker: currentAction.currentActionFirstBlocker,
  currentActionEvidenceLabelSummary: currentAction.currentActionEvidenceLabelSummary,
  currentActionReadyCriteriaSummary: currentAction.currentActionReadyCriteriaSummary,
  currentActionChecklistSummary: currentAction.currentActionChecklistSummary,
  externalDistributionReady,
  hardExternalGateCommand: "npm run release:external-check"
});

const releaseDoctorReport = {
  appName,
  bundleId,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  doctorCommand: "npm run release:doctor",
  prepareEnvCommand: "npm run release:prepare-env",
  progressCommand: "npm run release:progress",
  hardExternalGateCommand: "npm run release:external-check",
  releaseDoctorMarkdownPath: relative(releaseDoctorMarkdownPath),
  releaseDoctorJsonPath: relative(releaseDoctorJsonPath),
  targetedCommands: targetedChecks.map(({ label, command }) => ({ label, command })),
  sourceArtifacts: artifactRows,
  distributionEnvTemplateReady: distributionEnvTemplate.distributionEnvTemplateReady === true,
  releasePrepareEnvReady: releasePrepareEnv.releasePrepareEnvReady === true,
  releasePrepareEnvScaffoldWritten: releasePrepareEnv.scaffoldWritten === true,
  releasePrepareEnvLocalWriteRequested: releasePrepareEnv.localEnvWriteRequested === true,
  releasePrepareEnvExistingLocalEnvFilesChecked: Array.isArray(releasePrepareEnv.existingLocalEnvFilesChecked)
    ? releasePrepareEnv.existingLocalEnvFilesChecked
    : [],
  releasePrepareEnvExistingLocalEnvPresentFiles: Array.isArray(releasePrepareEnv.existingLocalEnvPresentFiles)
    ? releasePrepareEnv.existingLocalEnvPresentFiles
    : [],
  releasePrepareEnvExistingLocalEnvFileLoaded: releasePrepareEnv.existingLocalEnvFileLoaded === true,
  releasePrepareEnvExistingLocalEnvPlaceholderKeyCount: Number.isInteger(releasePrepareEnv.existingLocalEnvPlaceholderKeyCount)
    ? releasePrepareEnv.existingLocalEnvPlaceholderKeyCount
    : 0,
  releasePrepareEnvExistingLocalEnvPlaceholderKeySummary:
    typeof releasePrepareEnv.existingLocalEnvPlaceholderKeySummary === "string"
      ? releasePrepareEnv.existingLocalEnvPlaceholderKeySummary
      : "none",
  releasePrepareEnvExistingLocalEnvPlaceholderKeys: Array.isArray(releasePrepareEnv.existingLocalEnvPlaceholderKeys)
    ? releasePrepareEnv.existingLocalEnvPlaceholderKeys
    : [],
  releasePrepareEnvExistingLocalEnvPlaceholderEditLocationCount: Number.isInteger(releasePrepareEnv.existingLocalEnvPlaceholderEditLocationCount)
    ? releasePrepareEnv.existingLocalEnvPlaceholderEditLocationCount
    : 0,
  releasePrepareEnvExistingLocalEnvPlaceholderEditLocationSummary:
    typeof releasePrepareEnv.existingLocalEnvPlaceholderEditLocationSummary === "string"
      ? releasePrepareEnv.existingLocalEnvPlaceholderEditLocationSummary
      : "none",
  releasePrepareEnvExistingLocalEnvPlaceholderEditLocations: Array.isArray(releasePrepareEnv.existingLocalEnvPlaceholderEditLocations)
    ? releasePrepareEnv.existingLocalEnvPlaceholderEditLocations
    : [],
  releasePrepareEnvExistingReleaseChannelPlaceholderKeyCount: Number.isInteger(releasePrepareEnv.existingReleaseChannelPlaceholderKeyCount)
    ? releasePrepareEnv.existingReleaseChannelPlaceholderKeyCount
    : 0,
  releasePrepareEnvExistingReleaseChannelPlaceholderKeySummary:
    typeof releasePrepareEnv.existingReleaseChannelPlaceholderKeySummary === "string"
      ? releasePrepareEnv.existingReleaseChannelPlaceholderKeySummary
      : "none",
  releasePrepareEnvExistingReleaseChannelPlaceholderKeys: Array.isArray(releasePrepareEnv.existingReleaseChannelPlaceholderKeys)
    ? releasePrepareEnv.existingReleaseChannelPlaceholderKeys
    : [],
  releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationCount: Number.isInteger(releasePrepareEnv.existingReleaseChannelPlaceholderEditLocationCount)
    ? releasePrepareEnv.existingReleaseChannelPlaceholderEditLocationCount
    : 0,
  releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationSummary:
    typeof releasePrepareEnv.existingReleaseChannelPlaceholderEditLocationSummary === "string"
      ? releasePrepareEnv.existingReleaseChannelPlaceholderEditLocationSummary
      : "none",
  releasePrepareEnvExistingReleaseChannelPlaceholderEditLocations: Array.isArray(releasePrepareEnv.existingReleaseChannelPlaceholderEditLocations)
    ? releasePrepareEnv.existingReleaseChannelPlaceholderEditLocations
    : [],
  releasePrepareEnvExistingLocalEnvValueRecorded: releasePrepareEnv.existingLocalEnvValueRecorded === true,
  templateKeysCovered: distributionEnvTemplate.templateKeysCovered === true,
  localEnvFileLoaded,
  localEnvReady: distributionEnvTemplate.localEnvReady === true,
  currentEnvEditTarget,
  currentEnvConfiguredFileKey: distributionLocalEnvDefaults.configuredFileKey,
  ...currentAction,
  ...completionGap,
  updateFeedCurrentEnvironmentReady: updateFeedConfig.currentEnvironmentReady === true,
  privateInputsReady: distributionPrivateInputs.privateInputsReady === true,
  privateInputGroupTotal: privateInputGroups.length,
  privateInputGroupReadyCount,
  privateInputGroups,
  releaseChannelFocusReceiptReady: distributionPrivateInputs.releaseChannelFocusReceiptReady === true,
  releaseChannelFocusCurrentReady: distributionPrivateInputs.releaseChannelFocusCurrentReady === true,
  releaseChannelFocusCurrentReadyCount: Number.isInteger(distributionPrivateInputs.releaseChannelFocusCurrentReadyCount)
    ? distributionPrivateInputs.releaseChannelFocusCurrentReadyCount
    : releaseChannelFocusRows.filter((row) => row.currentReady === true).length,
  releaseChannelFocusRowCount: Number.isInteger(distributionPrivateInputs.releaseChannelFocusRowCount)
    ? distributionPrivateInputs.releaseChannelFocusRowCount
    : releaseChannelFocusRows.length,
  releaseChannelFocusSummary:
    typeof distributionPrivateInputs.releaseChannelFocusSummary === "string"
      ? distributionPrivateInputs.releaseChannelFocusSummary
      : "none",
  releaseChannelFocusRows,
  releaseChannelFocusPlaceholderKeyCount: Number.isInteger(distributionPrivateInputs.releaseChannelFocusPlaceholderKeyCount)
    ? distributionPrivateInputs.releaseChannelFocusPlaceholderKeyCount
    : 0,
  releaseChannelFocusPlaceholderKeys: Array.isArray(distributionPrivateInputs.releaseChannelFocusPlaceholderKeys)
    ? distributionPrivateInputs.releaseChannelFocusPlaceholderKeys
    : [],
  releaseChannelFocusProofCommand:
    typeof distributionPrivateInputs.releaseChannelFocusProofCommand === "string"
      ? distributionPrivateInputs.releaseChannelFocusProofCommand
      : "npm run desktop:distribution-private-inputs-smoke",
  releaseChannelFocusRerunCommand:
    typeof distributionPrivateInputs.releaseChannelFocusRerunCommand === "string"
      ? distributionPrivateInputs.releaseChannelFocusRerunCommand
      : "npm run release:doctor",
  releaseChannelFocusValueRecorded: distributionPrivateInputs.releaseChannelFocusValueRecorded === true,
  localEnvFilesChecked,
  localEnvPresentFiles,
  localEnvPlaceholderKeyCount,
  localEnvPlaceholderKeys,
  privateInputBlockerCount: Array.isArray(distributionPrivateInputs.privateInputBlockers)
    ? distributionPrivateInputs.privateInputBlockers.length
    : 0,
  channelMetadataReady: distributionChannelQa.channel?.ready === true,
  distributionChannelQaReady: distributionChannelQa.externalDistributionReady === true,
  manualQaChecklistReady: distributionManualQa.manualQaChecklistReady === true,
  manualQaApprovalReady: distributionManualQa.manualQaApprovalReady === true,
  manualQaChecklistDigestMatches: distributionManualQa.manualQaChecklistDigestMatches === true,
  developerIdSigningReady: developerIdReadiness.developerIdSigning?.ready === true,
  validDeveloperIdApplicationIdentityCount:
    developerIdReadiness.developerIdSigning?.validDeveloperIdApplicationIdentityCount ?? 0,
  notarizationCredentialSignalReady: developerIdReadiness.notarization?.ready === true,
  externalDistributionReady,
  blockerTotal: combinedBlockers.length,
  firstBlockers: combinedBlockers.slice(0, 12),
  localEnvValueRecorded: false,
  privateValuesRecorded: false,
  releaseUrlValueRecorded: false,
  supportUrlValueRecorded: false,
  feedValueRecorded: false,
  credentialValueRecorded: false,
  tokenValueRecorded: false,
  channelValueRecorded: false,
  developerIdIdentityValueRecorded: false,
  networkProbeAttemptedByThisDoctor: false,
  releaseUploadAttemptedByThisDoctor: false,
  notarySubmissionAttemptedByThisDoctor: false,
  signingAttemptedByThisDoctor: false,
  releaseGateClaimedDeveloperIdSigning: false,
  releaseGateClaimedNotarization: false,
  releaseGateClaimedGatekeeperApproval: false,
  releaseGateClaimedAutoUpdate: false,
  releaseGateClaimedManualQaApproval: false,
  releaseGateClaimedExternalDistribution: false,
  sourceValueRecorded: sourceValueRecorded(
    distributionEnvTemplate,
    updateFeedConfig,
    developerIdReadiness,
    distributionManualQa,
    distributionChannelQa,
    distributionPrivateInputs
  ),
  sourceClaimedExternalDistribution: sourceClaimedExternalDistribution(
    distributionEnvTemplate,
    updateFeedConfig,
    developerIdReadiness,
    distributionManualQa,
    distributionChannelQa,
    distributionPrivateInputs
  )
};

releaseDoctorReport.releaseDoctorReportReady =
  releaseDoctorReport.sourceArtifacts.every((artifact) => artifact.present) &&
  releaseDoctorReport.sourceValueRecorded === false &&
  releaseDoctorReport.sourceClaimedExternalDistribution === false;

const markdown = buildMarkdown(releaseDoctorReport);
const serializedReport = `${JSON.stringify(releaseDoctorReport, null, 2)}\n`;

await mkdir(packageRoot, { recursive: true });
await writeFile(releaseDoctorJsonPath, serializedReport, "utf8");
await writeFile(releaseDoctorMarkdownPath, markdown, "utf8");

check(releaseDoctorReport.appName === appName, "release doctor should identify GrooveForge");
check(releaseDoctorReport.bundleId === bundleId, `release doctor should identify ${bundleId}`);
check(releaseDoctorReport.doctorCommand === "npm run release:doctor", "release doctor should identify the doctor command");
check(releaseDoctorReport.prepareEnvCommand === "npm run release:prepare-env", "release doctor should include the prepare-env command");
check(releaseDoctorReport.progressCommand === "npm run release:progress", "release doctor should include the progress command");
check(releaseDoctorReport.hardExternalGateCommand === "npm run release:external-check", "release doctor should keep the hard external gate command");
check(releaseDoctorReport.targetedCommands.length === targetedChecks.length, "release doctor should include every targeted command");
check(releaseDoctorReport.sourceArtifacts.every((artifact) => artifact.present), "release doctor should cite generated source artifacts");
check(releaseDoctorReport.releaseDoctorReportReady === true, "release doctor report should be ready after targeted checks");
check(releaseDoctorReport.releasePrepareEnvReady === true, "release doctor should include ready release prepare-env evidence");
check(releaseDoctorReport.releasePrepareEnvScaffoldWritten === true, "release doctor should include written prepare-env scaffold evidence");
check(releaseDoctorReport.releasePrepareEnvLocalWriteRequested === false, "release doctor should not request a local env write");
check(Array.isArray(releaseDoctorReport.releasePrepareEnvExistingLocalEnvFilesChecked), "release doctor should include prepare-env existing local env files checked");
check(Array.isArray(releaseDoctorReport.releasePrepareEnvExistingLocalEnvPresentFiles), "release doctor should include prepare-env existing local env present files");
check(typeof releaseDoctorReport.releasePrepareEnvExistingLocalEnvFileLoaded === "boolean", "release doctor should include prepare-env existing local env loaded status");
check(Number.isInteger(releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderKeyCount), "release doctor should include prepare-env existing local env placeholder key count");
check(typeof releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderKeySummary === "string", "release doctor should include prepare-env existing local env placeholder key summary");
check(Array.isArray(releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderKeys), "release doctor should include prepare-env existing local env placeholder keys");
check(
  releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderKeyCount === releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderKeys.length,
  "release doctor prepare-env existing local env placeholder key count should match listed keys"
);
check(Number.isInteger(releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderEditLocationCount), "release doctor should include prepare-env existing local env placeholder edit location count");
check(typeof releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderEditLocationSummary === "string", "release doctor should include prepare-env existing local env placeholder edit location summary");
check(Array.isArray(releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderEditLocations), "release doctor should include prepare-env existing local env placeholder edit locations");
check(
  releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderEditLocationCount === releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderEditLocations.length,
  "release doctor prepare-env existing local env placeholder edit location count should match listed locations"
);
check(Number.isInteger(releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderKeyCount), "release doctor should include prepare-env release-channel placeholder key count");
check(typeof releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderKeySummary === "string", "release doctor should include prepare-env release-channel placeholder key summary");
check(Array.isArray(releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderKeys), "release doctor should include prepare-env release-channel placeholder keys");
check(
  releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderKeyCount === releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderKeys.length,
  "release doctor prepare-env release-channel placeholder key count should match listed keys"
);
check(Number.isInteger(releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationCount), "release doctor should include prepare-env release-channel placeholder edit location count");
check(typeof releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationSummary === "string", "release doctor should include prepare-env release-channel placeholder edit location summary");
check(Array.isArray(releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocations), "release doctor should include prepare-env release-channel placeholder edit locations");
check(
  releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationCount === releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocations.length,
  "release doctor prepare-env release-channel placeholder edit location count should match listed locations"
);
check(
  releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocations.every(
    (item) =>
      releaseChannelMetadataKeys.includes(item.key) &&
      typeof item.file === "string" &&
      item.file.length > 0 &&
      Number.isInteger(item.line) &&
      item.line > 0 &&
      item.placeholder === true &&
      item.valueRecorded === false
  ),
  "release doctor prepare-env release-channel placeholder edit locations should include only value-free file, line, and key rows"
);
check(releaseDoctorReport.releasePrepareEnvExistingLocalEnvValueRecorded === false, "release doctor prepare-env placeholder audit should not record values");
check(typeof releaseDoctorReport.externalDistributionReady === "boolean", "release doctor should include external distribution readiness");
check(typeof releaseDoctorReport.completionGapStatus === "string" && releaseDoctorReport.completionGapStatus.length > 0, "release doctor should include the completion gap status");
check(typeof releaseDoctorReport.completionGapSummary === "string" && releaseDoctorReport.completionGapSummary.length > 0, "release doctor should include the completion gap summary");
check(
  typeof releaseDoctorReport.completionGapCurrentProofTarget === "string" && releaseDoctorReport.completionGapCurrentProofTarget.length > 0,
  "release doctor should include the completion gap proof target"
);
check(
  releaseDoctorReport.completionGapCurrentProofTarget === releaseDoctorReport.currentActionLabel,
  "release doctor completion gap proof target should match current action"
);
check(
  releaseDoctorReport.completionGapNextProofCommand === releaseDoctorReport.currentActionNextCommand,
  "release doctor completion gap next proof command should match current next command"
);
check(
  releaseDoctorReport.completionGapHardGateCommand === releaseDoctorReport.hardExternalGateCommand,
  "release doctor completion gap should keep the hard gate command"
);
check(
  releaseDoctorReport.completionGapFirstBlocker === releaseDoctorReport.currentActionFirstBlocker,
  "release doctor completion gap first blocker should match current first blocker"
);
check(Array.isArray(releaseDoctorReport.completionGapClaimBlockers), "release doctor should include completion gap claim blockers");
check(
  releaseDoctorReport.completionGapClaimBlockerCount === releaseDoctorReport.completionGapClaimBlockers.length,
  "release doctor completion gap blocker count should match listed blockers"
);
check(
  typeof releaseDoctorReport.completionGapClaimBlockerSummary === "string" && releaseDoctorReport.completionGapClaimBlockerSummary.length > 0,
  "release doctor should include the completion gap blocker summary"
);
check(releaseDoctorReport.completionGapClaimedExternalDistribution === false, "release doctor completion gap should not claim external distribution");
check(releaseDoctorReport.completionGapValueRecorded === false, "release doctor completion gap should not record values");
check(typeof releaseDoctorReport.privateInputsReady === "boolean", "release doctor should include private-input readiness");
check(Array.isArray(releaseDoctorReport.privateInputGroups), "release doctor should include private-input groups");
check(releaseDoctorReport.releaseChannelFocusReceiptReady === true, "release doctor should mirror ready release-channel focus receipt");
check(typeof releaseDoctorReport.releaseChannelFocusCurrentReady === "boolean", "release doctor should include release-channel focus current readiness");
check(Number.isInteger(releaseDoctorReport.releaseChannelFocusCurrentReadyCount), "release doctor should include release-channel focus current-ready count");
check(Number.isInteger(releaseDoctorReport.releaseChannelFocusRowCount), "release doctor should include release-channel focus row count");
check(typeof releaseDoctorReport.releaseChannelFocusSummary === "string", "release doctor should include release-channel focus summary");
check(Array.isArray(releaseDoctorReport.releaseChannelFocusRows), "release doctor should include release-channel focus rows");
check(
  releaseDoctorReport.releaseChannelFocusRowCount === releaseDoctorReport.releaseChannelFocusRows.length,
  "release doctor release-channel focus row count should match rows"
);
check(releaseDoctorReport.releaseChannelFocusRowCount === releaseChannelMetadataKeys.length, "release doctor release-channel focus should cover four metadata keys");
check(
  releaseChannelMetadataKeys.every((key) => releaseDoctorReport.releaseChannelFocusRows.some((row) => row.key === key)),
  "release doctor release-channel focus should cover current release-channel keys"
);
check(
  releaseDoctorReport.releaseChannelFocusRows.every((row) => row.valueRecorded === false),
  "release doctor release-channel focus rows should not record values"
);
check(
  releaseDoctorReport.releaseChannelFocusRows.every((row) => typeof row.expectedSignal === "string" && row.expectedSignal.length > 0),
  "release doctor release-channel focus rows should include expected signals"
);
check(
  releaseDoctorReport.releaseChannelFocusRows.every((row) => row.proofCommand === releaseDoctorReport.releaseChannelFocusProofCommand),
  "release doctor release-channel focus rows should mirror proof command"
);
check(
  releaseDoctorReport.releaseChannelFocusRows.every((row) => row.rerunCommand === releaseDoctorReport.releaseChannelFocusRerunCommand),
  "release doctor release-channel focus rows should mirror rerun command"
);
check(
  releaseDoctorReport.releaseChannelFocusCurrentReadyCount === releaseDoctorReport.releaseChannelFocusRows.filter((row) => row.currentReady === true).length,
  "release doctor release-channel focus current-ready count should match rows"
);
check(
  releaseDoctorReport.releaseChannelFocusCurrentReady === (releaseDoctorReport.releaseChannelFocusCurrentReadyCount === releaseDoctorReport.releaseChannelFocusRowCount),
  "release doctor release-channel focus current readiness should match rows"
);
check(Number.isInteger(releaseDoctorReport.releaseChannelFocusPlaceholderKeyCount), "release doctor should include release-channel focus placeholder count");
check(Array.isArray(releaseDoctorReport.releaseChannelFocusPlaceholderKeys), "release doctor should include release-channel focus placeholder keys");
check(
  releaseDoctorReport.releaseChannelFocusPlaceholderKeyCount === releaseDoctorReport.releaseChannelFocusPlaceholderKeys.length,
  "release doctor release-channel focus placeholder count should match listed keys"
);
check(
  releaseDoctorReport.releaseChannelFocusPlaceholderKeys.every((key) => releaseChannelMetadataKeys.includes(key)),
  "release doctor release-channel focus placeholders should be limited to current metadata keys"
);
check(
  releaseDoctorReport.releaseChannelFocusProofCommand === "npm run desktop:distribution-private-inputs-smoke",
  "release doctor release-channel focus proof command should be private-inputs smoke"
);
check(releaseDoctorReport.releaseChannelFocusRerunCommand === "npm run release:doctor", "release doctor release-channel focus rerun command should be release doctor");
check(releaseDoctorReport.releaseChannelFocusValueRecorded === false, "release doctor release-channel focus should not record values");
check(Number.isInteger(releaseDoctorReport.localEnvPlaceholderKeyCount), "release doctor should include local env placeholder key count");
check(Array.isArray(releaseDoctorReport.localEnvPlaceholderKeys), "release doctor should include local env placeholder key names");
check(Array.isArray(releaseDoctorReport.localEnvFilesChecked), "release doctor should include local env files checked");
check(Array.isArray(releaseDoctorReport.localEnvPresentFiles), "release doctor should include local env present files");
check(typeof releaseDoctorReport.currentActionId === "string" && releaseDoctorReport.currentActionId.length > 0, "release doctor should include the current action id");
check(typeof releaseDoctorReport.currentActionLabel === "string" && releaseDoctorReport.currentActionLabel.length > 0, "release doctor should include the current action label");
check(typeof releaseDoctorReport.currentActionNextCommand === "string" && releaseDoctorReport.currentActionNextCommand.length > 0, "release doctor should include the current next command");
check(
  typeof releaseDoctorReport.currentActionOperatorStartCommand === "string" &&
    releaseDoctorReport.currentActionOperatorStartCommand.length > 0,
  "release doctor should include the current action operator start command"
);
check(
  typeof releaseDoctorReport.currentActionOperatorStartCommandRole === "string" &&
    releaseDoctorReport.currentActionOperatorStartCommandRole.length > 0,
  "release doctor should include the current action operator start command role"
);
check(releaseDoctorReport.currentActionOperatorStartCommandValueRecorded === false, "release doctor current action operator start command should not record values");
check(
  typeof releaseDoctorReport.currentActionPostEditProofCommand === "string" &&
    releaseDoctorReport.currentActionPostEditProofCommand.length > 0,
  "release doctor should include the current action post-edit proof command"
);
check(
  typeof releaseDoctorReport.currentActionPostEditProofRole === "string" && releaseDoctorReport.currentActionPostEditProofRole.length > 0,
  "release doctor should include the current action post-edit proof role"
);
check(releaseDoctorReport.currentActionPostEditProofValueRecorded === false, "release doctor current action post-edit proof should not record values");
check(typeof releaseDoctorReport.currentActionFirstBlocker === "string" && releaseDoctorReport.currentActionFirstBlocker.length > 0, "release doctor should include the current first blocker");
check(typeof releaseDoctorReport.currentEnvEditTarget === "string" && releaseDoctorReport.currentEnvEditTarget.length > 0, "release doctor should include the current env edit target");
check(releaseDoctorReport.currentEnvConfiguredFileKey === "GROOVEFORGE_DISTRIBUTION_ENV_FILE", "release doctor should include the env file override key name");
check(Number.isInteger(releaseDoctorReport.currentActionRequiredKeyCount), "release doctor should include the current required key count");
check(typeof releaseDoctorReport.currentActionRequiredKeySummary === "string", "release doctor should include the current required key summary");
check(Array.isArray(releaseDoctorReport.currentActionRequiredKeys), "release doctor should include current required keys");
check(Number.isInteger(releaseDoctorReport.currentActionPlaceholderKeyCount), "release doctor should include the current placeholder key count");
check(typeof releaseDoctorReport.currentActionPlaceholderKeySummary === "string", "release doctor should include the current placeholder key summary");
check(Array.isArray(releaseDoctorReport.currentActionPlaceholderKeys), "release doctor should include current placeholder keys");
check(Number.isInteger(releaseDoctorReport.currentActionPlaceholderEditLocationCount), "release doctor should include the current placeholder edit location count");
check(typeof releaseDoctorReport.currentActionPlaceholderEditLocationSummary === "string", "release doctor should include the current placeholder edit location summary");
check(Array.isArray(releaseDoctorReport.currentActionPlaceholderEditLocations), "release doctor should include current placeholder edit locations");
check(Number.isInteger(releaseDoctorReport.currentActionEnvEditTemplateCount), "release doctor should include the current env edit template count");
check(typeof releaseDoctorReport.currentActionEnvEditTemplateSummary === "string", "release doctor should include the current env edit template summary");
check(Array.isArray(releaseDoctorReport.currentActionEnvEditTemplate), "release doctor should include the current env edit template");
check(Number.isInteger(releaseDoctorReport.currentActionEnvEditRowsCount), "release doctor should include the current env edit rows count");
check(typeof releaseDoctorReport.currentActionEnvEditRowsSummary === "string", "release doctor should include the current env edit rows summary");
check(Array.isArray(releaseDoctorReport.currentActionEnvEditRows), "release doctor should include current env edit rows");
check(Number.isInteger(releaseDoctorReport.currentActionEvidenceRowsCount), "release doctor should include the current action evidence rows count");
check(typeof releaseDoctorReport.currentActionEvidenceRowsSummary === "string", "release doctor should include the current action evidence rows summary");
check(Array.isArray(releaseDoctorReport.currentActionEvidenceRows), "release doctor should include current action evidence rows");
check(Number.isInteger(releaseDoctorReport.currentActionEvidenceLabelCount), "release doctor should include the current action evidence label count");
check(typeof releaseDoctorReport.currentActionEvidenceLabelSummary === "string", "release doctor should include the current action evidence label summary");
check(Array.isArray(releaseDoctorReport.currentActionEvidenceLabels), "release doctor should include current action evidence labels");
check(Number.isInteger(releaseDoctorReport.currentActionReadyCriteriaCount), "release doctor should include the current action ready criteria count");
check(typeof releaseDoctorReport.currentActionReadyCriteriaSummary === "string", "release doctor should include the current action ready criteria summary");
check(Array.isArray(releaseDoctorReport.currentActionReadyCriteria), "release doctor should include current action ready criteria");
check(
  releaseDoctorReport.currentActionRequiredKeyCount === releaseDoctorReport.currentActionRequiredKeys.length,
  "release doctor current required key count should match listed keys"
);
check(
  releaseDoctorReport.currentActionPlaceholderKeyCount === releaseDoctorReport.currentActionPlaceholderKeys.length,
  "release doctor current placeholder key count should match listed keys"
);
check(
  releaseDoctorReport.currentActionPlaceholderEditLocationCount === releaseDoctorReport.currentActionPlaceholderEditLocations.length,
  "release doctor current placeholder edit location count should match listed locations"
);
check(
  releaseDoctorReport.currentActionEnvEditTemplateCount === releaseDoctorReport.currentActionEnvEditTemplate.length,
  "release doctor current env edit template count should match listed assignments"
);
check(
  releaseDoctorReport.currentActionEnvEditRowsCount === releaseDoctorReport.currentActionEnvEditRows.length,
  "release doctor current env edit rows count should match listed rows"
);
check(
  releaseDoctorReport.currentActionEvidenceRowsCount === releaseDoctorReport.currentActionEvidenceRows.length,
  "release doctor current action evidence rows count should match listed rows"
);
check(
  releaseDoctorReport.currentActionEvidenceLabelCount === releaseDoctorReport.currentActionEvidenceLabels.length,
  "release doctor current action evidence label count should match listed labels"
);
check(
  releaseDoctorReport.currentActionEvidenceLabelCount === releaseDoctorReport.currentActionEvidenceRowsCount,
  "release doctor current action evidence label count should match evidence rows"
);
check(
  releaseDoctorReport.currentActionReadyCriteriaCount === releaseDoctorReport.currentActionReadyCriteria.length,
  "release doctor current action ready criteria count should match listed criteria"
);
check(
  releaseDoctorReport.currentActionReadyCriteriaCount > 0,
  "release doctor current action should include at least one ready criterion"
);
check(
  releaseDoctorReport.currentActionEnvEditTemplate.every(
    (item) =>
      releaseDoctorReport.currentActionRequiredKeys.includes(item.key) &&
      typeof item.placeholder === "string" &&
      item.placeholder.startsWith("<") &&
      item.placeholder.endsWith(">") &&
      item.assignment === `${item.key}=${item.placeholder}` &&
      item.valueRecorded === false
  ),
  "release doctor current env edit template should contain only value-free assignments"
);
check(
  releaseDoctorReport.currentActionEnvEditRows.every((item) => {
    const matchingTemplate = releaseDoctorReport.currentActionEnvEditTemplate.find((template) => template.key === item.key);
    return (
      matchingTemplate &&
      releaseDoctorReport.currentActionRequiredKeys.includes(item.key) &&
      item.editTarget === releaseDoctorReport.currentEnvEditTarget &&
      typeof item.location === "string" &&
      item.assignment === matchingTemplate.assignment &&
      item.placeholderShape === matchingTemplate.placeholder &&
      item.valueRecorded === false
    );
  }),
  "release doctor current env edit rows should combine value-free assignment, location, guidance, and placeholder status"
);
check(
  releaseDoctorReport.currentActionPlaceholderKeys.every((key) => releaseDoctorReport.localEnvPlaceholderKeys.includes(key)),
  "release doctor current placeholder keys should be drawn from local env placeholder keys"
);
check(
  releaseDoctorReport.currentActionEvidenceRows.every(
    (item) =>
      typeof item.label === "string" &&
      item.label.length > 0 &&
      typeof item.path === "string" &&
      item.path.length > 0 &&
      typeof item.present === "boolean" &&
      item.valueRecorded === false
  ),
  "release doctor current action evidence rows should cite stable value-free artifact labels and paths"
);
check(
  releaseDoctorReport.currentActionEvidenceLabels.every(
    (label, index) => label === releaseDoctorReport.currentActionEvidenceRows[index]?.label
  ),
  "release doctor current action evidence labels should mirror evidence row labels"
);
check(
  releaseDoctorReport.currentActionEvidenceLabelSummary === formatEvidenceLabelSummary(releaseDoctorReport.currentActionEvidenceRows),
  "release doctor current action evidence label summary should match evidence row labels"
);
check(
  releaseDoctorReport.currentActionReadyCriteria.every((item) => typeof item === "string" && item.length > 0),
  "release doctor current action ready criteria should contain concrete value-free criteria"
);
check(typeof releaseDoctorReport.currentActionOperatorAction === "string" && releaseDoctorReport.currentActionOperatorAction.length > 0, "release doctor should include the current operator action");
check(Array.isArray(releaseDoctorReport.currentActionChecklist), "release doctor should include the current action checklist");
check(Number.isInteger(releaseDoctorReport.currentActionChecklistCount), "release doctor should include the current action checklist count");
check(
  releaseDoctorReport.currentActionChecklistCount === releaseDoctorReport.currentActionChecklist.length,
  "release doctor current action checklist count should match listed steps"
);
check(Array.isArray(releaseDoctorReport.currentActionPrerequisiteCommands), "release doctor should include current prerequisite commands");
check(Number.isInteger(releaseDoctorReport.currentActionPrerequisiteCommandCount), "release doctor should include the current prerequisite command count");
check(typeof releaseDoctorReport.currentActionPrerequisiteCommandSummary === "string", "release doctor should include the current prerequisite command summary");
check(
  releaseDoctorReport.currentActionPrerequisiteCommandCount === releaseDoctorReport.currentActionPrerequisiteCommands.length,
  "release doctor current prerequisite command count should match listed commands"
);
check(Array.isArray(releaseDoctorReport.currentActionRerunCommands), "release doctor should include current rerun commands");
check(Number.isInteger(releaseDoctorReport.currentActionRerunCommandCount), "release doctor should include the current rerun command count");
check(typeof releaseDoctorReport.currentActionRerunCommandSummary === "string", "release doctor should include the current rerun command summary");
check(
  releaseDoctorReport.currentActionRerunCommandCount === releaseDoctorReport.currentActionRerunCommands.length,
  "release doctor current rerun command count should match listed commands"
);
check(Array.isArray(releaseDoctorReport.currentActionCommandSequence), "release doctor should include current command sequence");
check(Number.isInteger(releaseDoctorReport.currentActionCommandSequenceCount), "release doctor should include the current command sequence count");
check(typeof releaseDoctorReport.currentActionCommandSequenceSummary === "string", "release doctor should include the current command sequence summary");
check(
  releaseDoctorReport.currentActionCommandSequenceCount === releaseDoctorReport.currentActionCommandSequence.length,
  "release doctor current command sequence count should match listed commands"
);
check(
  releaseDoctorReport.currentActionCommandSequence.includes(releaseDoctorReport.currentActionNextCommand),
  "release doctor current command sequence should include the current next command"
);
check(
  releaseDoctorReport.currentActionCommandSequence.every((command) => typeof command === "string" && command.length > 0 && command !== "none"),
  "release doctor current command sequence should contain only concrete commands"
);
check(
  new Set(releaseDoctorReport.currentActionCommandSequence).size === releaseDoctorReport.currentActionCommandSequence.length,
  "release doctor current command sequence should not duplicate commands"
);
check(releaseDoctorReport.currentActionValueRecorded === false, "release doctor current action should not record values");
if (releaseDoctorReport.localEnvFileLoaded === false) {
  check(releaseDoctorReport.currentActionNextCommand === "npm run release:prepare-env", "release doctor should surface prepare-env when local env evidence is absent");
  check(
    releaseDoctorReport.currentActionOperatorStartCommand === "npm run release:prepare-env",
    "release doctor missing-env operator start command should be prepare-env"
  );
  check(releaseDoctorReport.currentActionFirstBlocker.includes("local distribution env file is not loaded"), "release doctor should make missing local env the current first blocker");
  check(releaseDoctorReport.currentActionCommandSequence.includes("npm run release:prepare-env"), "release doctor missing-env command sequence should include prepare-env");
  check(releaseDoctorReport.currentActionCommandSequence.includes("npm run release:doctor"), "release doctor missing-env command sequence should include doctor rerun");
  check(
    releaseDoctorReport.currentActionEvidenceLabels.includes("Distribution env template") &&
      releaseDoctorReport.currentActionEvidenceLabels.includes("Release prepare env"),
    "release doctor missing-env evidence should include env template and prepare-env artifacts"
  );
  check(
    releaseDoctorReport.currentActionReadyCriteria.some((item) => item.includes("Ignored local distribution env file loads")),
    "release doctor missing-env ready criteria should explain local env loading"
  );
}
if (releaseDoctorReport.localEnvFileLoaded === true && releaseChannelMetadataKeys.every((key) => releaseDoctorReport.localEnvPlaceholderKeys.includes(key))) {
  check(releaseDoctorReport.currentActionId === "replace-release-channel-placeholders", "release doctor should prioritize release-channel placeholder cleanup");
  check(releaseDoctorReport.currentActionNextCommand === "npm run release:doctor", "release doctor should rerun itself after placeholder cleanup");
  check(
    releaseDoctorReport.currentActionOperatorStartCommand === releaseChannelApplyPrivateEnvPreflightCommand,
    "release doctor placeholder operator start command should be private env preflight"
  );
  check(
    releaseDoctorReport.currentActionOperatorStartCommand !== releaseDoctorReport.currentActionNextCommand,
    "release doctor placeholder operator start command should be distinct from doctor rerun command"
  );
  check(
    releaseDoctorReport.currentActionPostEditProofCommand === privateEditStrictProofCommand,
    "release doctor placeholder action should surface strict private-edit proof command"
  );
  check(
    releaseDoctorReport.currentActionPostEditProofCommand !== releaseDoctorReport.currentActionNextCommand,
    "release doctor placeholder post-edit proof command should be distinct from doctor rerun command"
  );
  check(releaseDoctorReport.currentActionCommandSequence.includes("npm run release:doctor"), "release doctor placeholder command sequence should include doctor rerun");
  check(
    releaseDoctorReport.currentActionCommandSequence.includes("npm run release:current-blocker"),
    "release doctor placeholder command sequence should include current-blocker refresh"
  );
  check(releaseDoctorReport.currentActionCommandSequence.includes("npm run release:next-actions"), "release doctor placeholder command sequence should include next-actions rerun");
  check(
    releaseDoctorReport.currentActionChecklist.some((item) => item.includes("npm run release:current-blocker")),
    "release doctor placeholder checklist should tell operators to refresh current blocker evidence after editing"
  );
  check(
    releaseDoctorReport.currentActionEvidenceLabels.includes("Distribution private inputs") &&
      releaseDoctorReport.currentActionEvidenceLabels.includes("Distribution-channel QA"),
    "release doctor placeholder evidence should include private-inputs and distribution-channel QA artifacts"
  );
  check(
    releaseDoctorReport.currentActionReadyCriteria.some((item) => item.includes("Required release-channel keys no longer appear")),
    "release doctor placeholder ready criteria should explain placeholder-free readiness"
  );
  check(
    releaseDoctorReport.currentActionReadyCriteria.some((item) => item.includes("Distribution-channel QA")),
    "release doctor placeholder ready criteria should explain distribution-channel QA readiness"
  );
  check(releaseDoctorReport.releaseChannelFocusCurrentReady === false, "release doctor release-channel focus should remain current-blocked while placeholders remain");
  check(releaseDoctorReport.releaseChannelFocusPlaceholderKeyCount === releaseChannelMetadataKeys.length, "release doctor release-channel focus should count current release-channel placeholders");
  check(
    releaseChannelMetadataKeys.every((key) => releaseDoctorReport.releaseChannelFocusPlaceholderKeys.includes(key)),
    "release doctor release-channel focus placeholder keys should include current release-channel metadata keys"
  );
  check(
    releaseDoctorReport.releaseChannelFocusRows.every((row) => row.placeholder === true && row.currentReady === false),
    "release doctor release-channel focus rows should mark current placeholder rows blocked"
  );
  check(releaseDoctorReport.currentActionPlaceholderKeyCount === releaseChannelMetadataKeys.length, "release doctor should focus current placeholders on release-channel metadata keys");
  check(
    releaseChannelMetadataKeys.every((key) => releaseDoctorReport.currentActionPlaceholderKeys.includes(key)),
    "release doctor current placeholder keys should include release-channel metadata keys"
  );
  check(releaseDoctorReport.currentActionPlaceholderEditLocationCount === releaseChannelMetadataKeys.length, "release doctor should surface current release-channel placeholder edit locations");
  check(
    releaseDoctorReport.currentActionPlaceholderEditLocations.every(
      (item) =>
        releaseChannelMetadataKeys.includes(item.key) &&
        item.file === releaseDoctorReport.currentEnvEditTarget &&
        Number.isInteger(item.line) &&
        item.line > 0 &&
        item.placeholder === true &&
        item.valueRecorded === false
    ),
    "release doctor current placeholder edit locations should include file, line, key, placeholder flag, and value redaction"
  );
  check(releaseDoctorReport.currentActionEnvEditTemplateCount === releaseChannelMetadataKeys.length, "release doctor should include release-channel env edit templates");
  check(releaseDoctorReport.currentActionEnvEditRowsCount === releaseChannelMetadataKeys.length, "release doctor should include release-channel env edit rows");
  check(
    releaseDoctorReport.currentActionEnvEditRows.every(
      (item) =>
        releaseChannelMetadataKeys.includes(item.key) &&
        item.file === releaseDoctorReport.currentEnvEditTarget &&
        Number.isInteger(item.line) &&
        item.line > 0 &&
        item.locationKnown === true &&
        item.placeholder === true &&
        item.valueRecorded === false
    ),
    "release doctor current env edit rows should include known file and line for release-channel placeholders"
  );
  check(releaseDoctorReport.currentActionOperatorAction.includes(releaseDoctorReport.currentEnvEditTarget), "release doctor current operator action should include the env edit target");
}
check(
  releaseDoctorReport.localEnvPlaceholderKeyCount === releaseDoctorReport.localEnvPlaceholderKeys.length,
  "release doctor placeholder key count should match listed keys"
);
check(releaseDoctorReport.localEnvValueRecorded === false, "release doctor should not record local env values");
check(releaseDoctorReport.privateValuesRecorded === false, "release doctor should not record private values");
check(releaseDoctorReport.releaseUrlValueRecorded === false, "release doctor should not record release URL values");
check(releaseDoctorReport.supportUrlValueRecorded === false, "release doctor should not record support URL values");
check(releaseDoctorReport.feedValueRecorded === false, "release doctor should not record feed values");
check(releaseDoctorReport.credentialValueRecorded === false, "release doctor should not record credential values");
check(releaseDoctorReport.tokenValueRecorded === false, "release doctor should not record token values");
check(releaseDoctorReport.channelValueRecorded === false, "release doctor should not record channel values");
check(releaseDoctorReport.developerIdIdentityValueRecorded === false, "release doctor should not record Developer ID identity values");
check(releaseDoctorReport.sourceValueRecorded === false, "release doctor source artifacts should not record values");
check(releaseDoctorReport.networkProbeAttemptedByThisDoctor === false, "release doctor should not probe remote channels");
check(releaseDoctorReport.releaseUploadAttemptedByThisDoctor === false, "release doctor should not upload releases");
check(releaseDoctorReport.notarySubmissionAttemptedByThisDoctor === false, "release doctor should not submit to Apple notary services");
check(releaseDoctorReport.signingAttemptedByThisDoctor === false, "release doctor should not sign artifacts");
check(releaseDoctorReport.releaseGateClaimedExternalDistribution === false, "release doctor should not claim external distribution completion");
check(releaseDoctorReport.sourceClaimedExternalDistribution === false, "release doctor source artifacts should not claim external distribution completion");
check(markdown.includes("Release Doctor"), "release doctor Markdown should include title");
check(markdown.includes("Completion gap status:"), "release doctor Markdown should include completion gap status");
check(markdown.includes("Completion gap proof target:"), "release doctor Markdown should include completion gap proof target");
check(markdown.includes("Completion gap next proof command:"), "release doctor Markdown should include completion gap next proof command");
check(markdown.includes("Completion gap hard gate command:"), "release doctor Markdown should include completion gap hard gate command");
check(markdown.includes("Completion gap claim blockers:"), "release doctor Markdown should include completion gap claim blocker count");
check(markdown.includes("Completion Gap"), "release doctor Markdown should include completion gap section");
check(markdown.includes("Proof target:"), "release doctor Markdown should include completion gap proof target details");
check(markdown.includes("Local env placeholder keys:"), "release doctor Markdown should include placeholder key count");
check(markdown.includes("Release-channel focus receipt ready:"), "release doctor Markdown should include release-channel focus receipt readiness");
check(markdown.includes("Release-channel focus current-ready rows:"), "release doctor Markdown should include release-channel focus current-ready rows");
check(markdown.includes("Release-Channel Focus Receipt"), "release doctor Markdown should include release-channel focus receipt table");
check(markdown.includes("expected signal"), "release doctor Markdown should include release-channel focus expected signals");
check(markdown.includes("Local Env Placeholder Keys"), "release doctor Markdown should include placeholder key section");
check(markdown.includes("Release prepare-env existing local env placeholder keys:"), "release doctor Markdown should include prepare-env existing local env placeholder key status");
check(markdown.includes("Release prepare-env release-channel placeholder keys:"), "release doctor Markdown should include prepare-env release-channel placeholder key status");
check(markdown.includes("Release prepare-env release-channel placeholder edit locations:"), "release doctor Markdown should include prepare-env release-channel placeholder edit location status");
check(markdown.includes("Release Prepare Env Placeholder Audit"), "release doctor Markdown should include prepare-env placeholder audit section");
check(markdown.includes("Release Prepare Env Existing Placeholder Keys"), "release doctor Markdown should include prepare-env existing placeholder key section");
check(markdown.includes("Release Prepare Env Release-Channel Placeholder Edit Locations"), "release doctor Markdown should include prepare-env release-channel placeholder edit location section");
check(markdown.includes("Current action:"), "release doctor Markdown should include current action status");
check(markdown.includes("Current next command:"), "release doctor Markdown should include current next command");
check(markdown.includes("Current action operator start command:"), "release doctor Markdown should include current action operator start command");
check(markdown.includes("Current action operator start command role:"), "release doctor Markdown should include current action operator start command role");
check(markdown.includes("Current action post-edit proof command:"), "release doctor Markdown should include current action post-edit proof command");
check(markdown.includes("Current action post-edit proof role:"), "release doctor Markdown should include current action post-edit proof role");
check(markdown.includes("Current first blocker:"), "release doctor Markdown should include current first blocker");
check(markdown.includes("Current env edit target:"), "release doctor Markdown should include current env edit target");
check(markdown.includes("Current action required keys:"), "release doctor Markdown should include current action required keys");
check(markdown.includes("Current action placeholder keys:"), "release doctor Markdown should include current action placeholder keys");
check(markdown.includes("Current action placeholder edit locations:"), "release doctor Markdown should include current action placeholder edit locations");
check(markdown.includes("Current action env edit template:"), "release doctor Markdown should include current action env edit template status");
check(markdown.includes("Current action env edit rows:"), "release doctor Markdown should include current action env edit rows status");
check(markdown.includes("Current action evidence rows:"), "release doctor Markdown should include current action evidence rows status");
check(markdown.includes("Current action evidence labels:"), "release doctor Markdown should include current action evidence labels status");
check(markdown.includes("Current action ready criteria:"), "release doctor Markdown should include current action ready criteria status");
check(markdown.includes("Current action prerequisite commands:"), "release doctor Markdown should include current action prerequisite commands");
check(markdown.includes("Current action rerun commands:"), "release doctor Markdown should include current action rerun commands");
check(markdown.includes("Current action command sequence:"), "release doctor Markdown should include current action command sequence status");
check(markdown.includes("Current Action"), "release doctor Markdown should include current action section");
check(markdown.includes("Operator start command:"), "release doctor Markdown should include current operator start command details");
check(markdown.includes("Operator action:"), "release doctor Markdown should include current operator action details");
check(markdown.includes("Current Action Command Sequence"), "release doctor Markdown should include current command sequence section");
check(markdown.includes("Current Action Evidence Rows"), "release doctor Markdown should include current action evidence row section");
check(markdown.includes("Current Action Ready Criteria"), "release doctor Markdown should include current action ready criteria section");
check(markdown.includes("Current Action Placeholder Edit Locations"), "release doctor Markdown should include current placeholder edit location section");
check(markdown.includes("Current Action Env Edit Template"), "release doctor Markdown should include current env edit template section");
check(markdown.includes("Current Action Env Edit Rows"), "release doctor Markdown should include current env edit row section");
check(markdown.includes("| key | location | assignment | guidance | placeholder |"), "release doctor Markdown should include current env edit row table");
check(markdown.includes("Value recorded: no"), "release doctor Markdown should state current action value redaction");
check(markdown.includes("Doctor command: `npm run release:doctor`"), "release doctor Markdown should include the doctor command");
check(markdown.includes("Prepare env command: `npm run release:prepare-env`"), "release doctor Markdown should include the prepare-env command");
check(markdown.includes("Progress command: `npm run release:progress`"), "release doctor Markdown should include the progress command");
check(markdown.includes("Hard external distribution gate: `npm run release:external-check`"), "release doctor Markdown should keep the hard external gate command");
check(markdown.includes("Hard gate command: `npm run release:external-check`"), "release doctor Markdown should include completion gap hard gate details");
check(!/https?:\/\//i.test(markdown), "release doctor Markdown should not include public or private URL values");
check(!/https?:\/\//i.test(serializedReport), "release doctor JSON should not include public or private URL values");

if (failures.length > 0) {
  fail("Release doctor validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge release doctor passed.");
console.log(`- Markdown: ${relative(releaseDoctorMarkdownPath)}`);
console.log(`- JSON: ${relative(releaseDoctorJsonPath)}`);
console.log(`- Completion gap status: ${releaseDoctorReport.completionGapStatus}`);
console.log(`- Completion gap summary: ${releaseDoctorReport.completionGapSummary}`);
console.log(`- Completion gap proof target: ${releaseDoctorReport.completionGapCurrentProofTarget}`);
console.log(`- Completion gap next proof command: ${releaseDoctorReport.completionGapNextProofCommand}`);
console.log(`- Completion gap hard gate command: ${releaseDoctorReport.completionGapHardGateCommand}`);
console.log(`- Completion gap claim blockers: ${releaseDoctorReport.completionGapClaimBlockerCount} (${releaseDoctorReport.completionGapClaimBlockerSummary})`);
console.log(`- Local env file loaded: ${releaseDoctorReport.localEnvFileLoaded ? "yes" : "no"}`);
console.log(`- Local env ready: ${releaseDoctorReport.localEnvReady ? "yes" : "no"}`);
console.log(`- Release prepare env ready: ${releaseDoctorReport.releasePrepareEnvReady ? "yes" : "no"}`);
console.log(`- Release prepare env scaffold written: ${releaseDoctorReport.releasePrepareEnvScaffoldWritten ? "yes" : "no"}`);
console.log(`- Release prepare-env existing local env file loaded: ${releaseDoctorReport.releasePrepareEnvExistingLocalEnvFileLoaded ? "yes" : "no"}`);
console.log(
  `- Release prepare-env existing local env placeholder keys: ${releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderKeyCount} (${releaseDoctorReport.releasePrepareEnvExistingLocalEnvPlaceholderKeySummary})`
);
console.log(
  `- Release prepare-env release-channel placeholder keys: ${releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderKeyCount} (${releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderKeySummary})`
);
console.log(
  `- Release prepare-env release-channel placeholder edit locations: ${releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationCount} (${releaseDoctorReport.releasePrepareEnvExistingReleaseChannelPlaceholderEditLocationSummary})`
);
console.log(`- Private inputs ready: ${releaseDoctorReport.privateInputsReady ? "yes" : "no"}`);
console.log(`- Private input groups ready: ${releaseDoctorReport.privateInputGroupReadyCount}/${releaseDoctorReport.privateInputGroupTotal}`);
console.log(`- Release-channel focus receipt ready: ${releaseDoctorReport.releaseChannelFocusReceiptReady ? "yes" : "no"}`);
console.log(`- Release-channel focus current action ready: ${releaseDoctorReport.releaseChannelFocusCurrentReady ? "yes" : "no"}`);
console.log(`- Release-channel focus current-ready rows: ${releaseDoctorReport.releaseChannelFocusCurrentReadyCount}/${releaseDoctorReport.releaseChannelFocusRowCount}`);
console.log(`- Release-channel focus placeholder keys: ${releaseDoctorReport.releaseChannelFocusPlaceholderKeyCount}`);
console.log(`- Local env placeholder keys: ${releaseDoctorReport.localEnvPlaceholderKeyCount}`);
console.log(`- Current action: ${releaseDoctorReport.currentActionLabel}`);
console.log(`- Current next command: ${releaseDoctorReport.currentActionNextCommand}`);
console.log(`- Current action operator start command: ${releaseDoctorReport.currentActionOperatorStartCommand}`);
console.log(`- Current action operator start command role: ${releaseDoctorReport.currentActionOperatorStartCommandRole}`);
console.log(`- Current action post-edit proof command: ${releaseDoctorReport.currentActionPostEditProofCommand}`);
console.log(`- Current action post-edit proof role: ${releaseDoctorReport.currentActionPostEditProofRole}`);
console.log(`- Current first blocker: ${releaseDoctorReport.currentActionFirstBlocker}`);
console.log(`- Current env edit target: ${releaseDoctorReport.currentEnvEditTarget}`);
console.log(`- Current action required keys: ${releaseDoctorReport.currentActionRequiredKeyCount} (${releaseDoctorReport.currentActionRequiredKeySummary})`);
console.log(`- Current action placeholder keys: ${releaseDoctorReport.currentActionPlaceholderKeyCount} (${releaseDoctorReport.currentActionPlaceholderKeySummary})`);
console.log(`- Current action placeholder edit locations: ${releaseDoctorReport.currentActionPlaceholderEditLocationCount} (${releaseDoctorReport.currentActionPlaceholderEditLocationSummary})`);
console.log(`- Current action env edit template: ${releaseDoctorReport.currentActionEnvEditTemplateCount} (${releaseDoctorReport.currentActionEnvEditTemplateSummary})`);
console.log(`- Current action env edit rows: ${releaseDoctorReport.currentActionEnvEditRowsCount} (${releaseDoctorReport.currentActionEnvEditRowsSummary})`);
console.log(`- Current action evidence rows: ${releaseDoctorReport.currentActionEvidenceRowsCount} (${releaseDoctorReport.currentActionEvidenceRowsSummary})`);
console.log(`- Current action evidence labels: ${releaseDoctorReport.currentActionEvidenceLabelCount} (${releaseDoctorReport.currentActionEvidenceLabelSummary})`);
console.log(`- Current action ready criteria: ${releaseDoctorReport.currentActionReadyCriteriaCount} (${releaseDoctorReport.currentActionReadyCriteriaSummary})`);
console.log(`- Current action prerequisite commands: ${releaseDoctorReport.currentActionPrerequisiteCommandCount} (${releaseDoctorReport.currentActionPrerequisiteCommandSummary})`);
console.log(`- Current action rerun commands: ${releaseDoctorReport.currentActionRerunCommandCount} (${releaseDoctorReport.currentActionRerunCommandSummary})`);
console.log(`- Current action command sequence: ${releaseDoctorReport.currentActionCommandSequenceCount} (${releaseDoctorReport.currentActionCommandSequenceSummary})`);
console.log(`- Current operator action: ${releaseDoctorReport.currentActionOperatorAction}`);
console.log(`- Channel metadata ready: ${releaseDoctorReport.channelMetadataReady ? "yes" : "no"}`);
console.log(`- Manual QA approval ready: ${releaseDoctorReport.manualQaApprovalReady ? "yes" : "no"}`);
console.log(`- Developer ID signing ready: ${releaseDoctorReport.developerIdSigningReady ? "yes" : "no"}`);
console.log(`- Notarization credential signal ready: ${releaseDoctorReport.notarizationCredentialSignalReady ? "yes" : "no"}`);
console.log(`- External distribution ready: ${releaseDoctorReport.externalDistributionReady ? "yes" : "no"}`);
console.log(`- First blockers tracked: ${releaseDoctorReport.firstBlockers.length}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted by this doctor");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
