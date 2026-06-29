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

function formatChecklistList(items) {
  return Array.isArray(items) && items.length > 0 ? items.map((item, index) => `${index + 1}. ${item}`).join("\n") : "1. None.";
}

function displayLocalEnvTarget(filePath) {
  if (typeof filePath !== "string" || filePath.trim().length === 0) {
    return distributionLocalEnvDefaults.defaultEnvFileName;
  }
  const absolute = path.isAbsolute(filePath) ? filePath : path.resolve(root, filePath);
  return path.relative(root, absolute) || distributionLocalEnvDefaults.defaultEnvFileName;
}

function currentLocalEnvEditTarget(localEnvPresentFiles = []) {
  const configuredPath = process.env[distributionLocalEnvDefaults.configuredFileKey]?.trim();
  if (configuredPath) {
    return displayLocalEnvTarget(configuredPath);
  }
  const firstPresentFile = Array.isArray(localEnvPresentFiles) ? localEnvPresentFiles[0] : "";
  return displayLocalEnvTarget(firstPresentFile || distributionLocalEnvDefaults.defaultEnvFileName);
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
      currentActionFirstBlocker: "Ignored local distribution env file is not loaded.",
      currentActionOperatorAction: `Run \`npm run release:prepare-env\` to create ${currentEnvEditTarget}, then replace release-channel placeholder values outside committed files.`,
      currentActionRequiredKeys: releaseChannelMetadataKeys,
      currentActionPlaceholderKeys: [],
      currentActionRerunCommands: ["npm run release:doctor"],
      currentActionChecklist: checklist
    };
  }
  if (releaseChannelPlaceholderKeys.length > 0) {
    const keySummary = releaseChannelPlaceholderKeys.join(", ");
    const checklist = [
      `Replace placeholder values in ${currentEnvEditTarget} for the current release-channel keys: ${keySummary}.`,
      "Use real operator-owned release/support URLs and one allowed distribution channel value.",
      "Keep real values out of committed files and generated reports.",
      "Rerun `npm run release:doctor` after editing.",
      "Rerun `npm run release:next-actions` after the doctor report updates."
    ];
    return {
      currentActionId: "replace-release-channel-placeholders",
      currentActionLabel: "Replace release-channel metadata placeholders",
      currentActionNextCommand: "npm run release:doctor",
      currentActionFirstBlocker: `Current release-channel metadata still contains ${releaseChannelPlaceholderKeys.length} placeholder keys.`,
      currentActionOperatorAction: `Replace placeholder values in ${currentEnvEditTarget} for the current release-channel keys (${releaseChannelPlaceholderKeys.length}): ${keySummary}.`,
      currentActionRequiredKeys: releaseChannelMetadataKeys,
      currentActionPlaceholderKeys: releaseChannelPlaceholderKeys,
      currentActionRerunCommands: ["npm run release:doctor", "npm run release:next-actions"],
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
      currentActionFirstBlocker: firstChannelBlocker,
      currentActionOperatorAction: "Run distribution-channel QA after the current release-channel metadata keys have real operator-owned values.",
      currentActionRequiredKeys: releaseChannelMetadataKeys,
      currentActionPlaceholderKeys: [],
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
      currentActionFirstBlocker: firstBlocker,
      currentActionOperatorAction: "Use external next-actions to select the next proof target after release-channel metadata.",
      currentActionRequiredKeys: [],
      currentActionPlaceholderKeys: [],
      currentActionRerunCommands: ["npm run release:next-actions"],
      currentActionChecklist: checklist
    };
  }
  return {
    currentActionId: "run-hard-external-distribution-gate",
    currentActionLabel: "Run hard external distribution gate",
    currentActionNextCommand: "npm run release:external-check",
    currentActionFirstBlocker: "none",
    currentActionOperatorAction: "Run the hard external distribution gate after every redacted readiness signal is ready.",
    currentActionRequiredKeys: [],
    currentActionPlaceholderKeys: [],
    currentActionRerunCommands: ["npm run release:external-check"],
    currentActionChecklist: ["Run `npm run release:external-check` and archive the resulting value-free evidence."]
  };
}

function enrichCurrentAction(action) {
  const currentActionRequiredKeys = Array.isArray(action.currentActionRequiredKeys) ? action.currentActionRequiredKeys : [];
  const currentActionPlaceholderKeys = Array.isArray(action.currentActionPlaceholderKeys) ? action.currentActionPlaceholderKeys : [];
  const currentActionChecklist = Array.isArray(action.currentActionChecklist) ? action.currentActionChecklist : [];
  const currentActionRerunCommands = Array.isArray(action.currentActionRerunCommands) ? action.currentActionRerunCommands : [];
  return {
    ...action,
    currentActionRequiredKeyCount: currentActionRequiredKeys.length,
    currentActionRequiredKeySummary: formatSummary(currentActionRequiredKeys),
    currentActionPlaceholderKeyCount: currentActionPlaceholderKeys.length,
    currentActionPlaceholderKeySummary: formatSummary(currentActionPlaceholderKeys),
    currentActionChecklistCount: currentActionChecklist.length,
    currentActionChecklistSummary: currentActionChecklist.length > 0 ? `${currentActionChecklist.length} value-free steps` : "none",
    currentActionRerunCommandCount: currentActionRerunCommands.length,
    currentActionRerunCommandSummary: formatSummary(currentActionRerunCommands),
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
- Local env file loaded: ${readyLabel(report.localEnvFileLoaded)}
- Local env ready: ${readyLabel(report.localEnvReady)}
- Distribution env template ready: ${readyLabel(report.distributionEnvTemplateReady)}
- Release prepare env ready: ${readyLabel(report.releasePrepareEnvReady)}
- Release prepare env scaffold written: ${readyLabel(report.releasePrepareEnvScaffoldWritten)}
- Template keys covered: ${readyLabel(report.templateKeysCovered)}
- Private inputs ready: ${readyLabel(report.privateInputsReady)}
- Private input groups ready: ${report.privateInputGroupReadyCount}/${report.privateInputGroupTotal}
- Local env placeholder keys: ${report.localEnvPlaceholderKeyCount}
- Current action: ${report.currentActionLabel}
- Current next command: \`${report.currentActionNextCommand}\`
- Current first blocker: ${report.currentActionFirstBlocker}
- Current env edit target: ${report.currentEnvEditTarget}
- Current action required keys: ${report.currentActionRequiredKeyCount} (${report.currentActionRequiredKeySummary})
- Current action placeholder keys: ${report.currentActionPlaceholderKeyCount} (${report.currentActionPlaceholderKeySummary})
- Current action checklist: ${report.currentActionChecklistCount} (${report.currentActionChecklistSummary})
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

## Current Action

- Action: ${report.currentActionLabel}
- Next command: \`${report.currentActionNextCommand}\`
- First blocker: ${report.currentActionFirstBlocker}
- Env edit target: ${report.currentEnvEditTarget}
- Operator action: ${report.currentActionOperatorAction}
- Required keys: ${report.currentActionRequiredKeyCount} (${report.currentActionRequiredKeySummary})
- Placeholder keys: ${report.currentActionPlaceholderKeyCount} (${report.currentActionPlaceholderKeySummary})
- Rerun commands: ${report.currentActionRerunCommandCount} (${report.currentActionRerunCommandSummary})
- Value recorded: ${readyLabel(report.currentActionValueRecorded)}

${formatChecklistList(report.currentActionChecklist)}

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
const currentAction = enrichCurrentAction(
  buildCurrentAction({
    localEnvFileLoaded,
    localEnvPlaceholderKeys,
    currentEnvEditTarget,
    channelMetadataReady: distributionChannelQa.channel?.ready === true,
    distributionChannelQa,
    externalDistributionReady,
    firstBlockers: combinedBlockers.slice(0, 12)
  })
);

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
  templateKeysCovered: distributionEnvTemplate.templateKeysCovered === true,
  localEnvFileLoaded,
  localEnvReady: distributionEnvTemplate.localEnvReady === true,
  currentEnvEditTarget,
  currentEnvConfiguredFileKey: distributionLocalEnvDefaults.configuredFileKey,
  ...currentAction,
  updateFeedCurrentEnvironmentReady: updateFeedConfig.currentEnvironmentReady === true,
  privateInputsReady: distributionPrivateInputs.privateInputsReady === true,
  privateInputGroupTotal: privateInputGroups.length,
  privateInputGroupReadyCount,
  privateInputGroups,
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
check(typeof releaseDoctorReport.externalDistributionReady === "boolean", "release doctor should include external distribution readiness");
check(typeof releaseDoctorReport.privateInputsReady === "boolean", "release doctor should include private-input readiness");
check(Array.isArray(releaseDoctorReport.privateInputGroups), "release doctor should include private-input groups");
check(Number.isInteger(releaseDoctorReport.localEnvPlaceholderKeyCount), "release doctor should include local env placeholder key count");
check(Array.isArray(releaseDoctorReport.localEnvPlaceholderKeys), "release doctor should include local env placeholder key names");
check(Array.isArray(releaseDoctorReport.localEnvFilesChecked), "release doctor should include local env files checked");
check(Array.isArray(releaseDoctorReport.localEnvPresentFiles), "release doctor should include local env present files");
check(typeof releaseDoctorReport.currentActionId === "string" && releaseDoctorReport.currentActionId.length > 0, "release doctor should include the current action id");
check(typeof releaseDoctorReport.currentActionLabel === "string" && releaseDoctorReport.currentActionLabel.length > 0, "release doctor should include the current action label");
check(typeof releaseDoctorReport.currentActionNextCommand === "string" && releaseDoctorReport.currentActionNextCommand.length > 0, "release doctor should include the current next command");
check(typeof releaseDoctorReport.currentActionFirstBlocker === "string" && releaseDoctorReport.currentActionFirstBlocker.length > 0, "release doctor should include the current first blocker");
check(typeof releaseDoctorReport.currentEnvEditTarget === "string" && releaseDoctorReport.currentEnvEditTarget.length > 0, "release doctor should include the current env edit target");
check(releaseDoctorReport.currentEnvConfiguredFileKey === "GROOVEFORGE_DISTRIBUTION_ENV_FILE", "release doctor should include the env file override key name");
check(Number.isInteger(releaseDoctorReport.currentActionRequiredKeyCount), "release doctor should include the current required key count");
check(typeof releaseDoctorReport.currentActionRequiredKeySummary === "string", "release doctor should include the current required key summary");
check(Array.isArray(releaseDoctorReport.currentActionRequiredKeys), "release doctor should include current required keys");
check(Number.isInteger(releaseDoctorReport.currentActionPlaceholderKeyCount), "release doctor should include the current placeholder key count");
check(typeof releaseDoctorReport.currentActionPlaceholderKeySummary === "string", "release doctor should include the current placeholder key summary");
check(Array.isArray(releaseDoctorReport.currentActionPlaceholderKeys), "release doctor should include current placeholder keys");
check(
  releaseDoctorReport.currentActionRequiredKeyCount === releaseDoctorReport.currentActionRequiredKeys.length,
  "release doctor current required key count should match listed keys"
);
check(
  releaseDoctorReport.currentActionPlaceholderKeyCount === releaseDoctorReport.currentActionPlaceholderKeys.length,
  "release doctor current placeholder key count should match listed keys"
);
check(
  releaseDoctorReport.currentActionPlaceholderKeys.every((key) => releaseDoctorReport.localEnvPlaceholderKeys.includes(key)),
  "release doctor current placeholder keys should be drawn from local env placeholder keys"
);
check(typeof releaseDoctorReport.currentActionOperatorAction === "string" && releaseDoctorReport.currentActionOperatorAction.length > 0, "release doctor should include the current operator action");
check(Array.isArray(releaseDoctorReport.currentActionChecklist), "release doctor should include the current action checklist");
check(Number.isInteger(releaseDoctorReport.currentActionChecklistCount), "release doctor should include the current action checklist count");
check(
  releaseDoctorReport.currentActionChecklistCount === releaseDoctorReport.currentActionChecklist.length,
  "release doctor current action checklist count should match listed steps"
);
check(Array.isArray(releaseDoctorReport.currentActionRerunCommands), "release doctor should include current rerun commands");
check(Number.isInteger(releaseDoctorReport.currentActionRerunCommandCount), "release doctor should include the current rerun command count");
check(
  releaseDoctorReport.currentActionRerunCommandCount === releaseDoctorReport.currentActionRerunCommands.length,
  "release doctor current rerun command count should match listed commands"
);
check(releaseDoctorReport.currentActionValueRecorded === false, "release doctor current action should not record values");
if (releaseDoctorReport.localEnvFileLoaded === false) {
  check(releaseDoctorReport.currentActionNextCommand === "npm run release:prepare-env", "release doctor should surface prepare-env when local env evidence is absent");
  check(releaseDoctorReport.currentActionFirstBlocker.includes("local distribution env file is not loaded"), "release doctor should make missing local env the current first blocker");
}
if (releaseDoctorReport.localEnvFileLoaded === true && releaseChannelMetadataKeys.every((key) => releaseDoctorReport.localEnvPlaceholderKeys.includes(key))) {
  check(releaseDoctorReport.currentActionId === "replace-release-channel-placeholders", "release doctor should prioritize release-channel placeholder cleanup");
  check(releaseDoctorReport.currentActionNextCommand === "npm run release:doctor", "release doctor should rerun itself after placeholder cleanup");
  check(releaseDoctorReport.currentActionPlaceholderKeyCount === releaseChannelMetadataKeys.length, "release doctor should focus current placeholders on release-channel metadata keys");
  check(
    releaseChannelMetadataKeys.every((key) => releaseDoctorReport.currentActionPlaceholderKeys.includes(key)),
    "release doctor current placeholder keys should include release-channel metadata keys"
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
check(markdown.includes("Local env placeholder keys:"), "release doctor Markdown should include placeholder key count");
check(markdown.includes("Local Env Placeholder Keys"), "release doctor Markdown should include placeholder key section");
check(markdown.includes("Current action:"), "release doctor Markdown should include current action status");
check(markdown.includes("Current next command:"), "release doctor Markdown should include current next command");
check(markdown.includes("Current first blocker:"), "release doctor Markdown should include current first blocker");
check(markdown.includes("Current env edit target:"), "release doctor Markdown should include current env edit target");
check(markdown.includes("Current action required keys:"), "release doctor Markdown should include current action required keys");
check(markdown.includes("Current action placeholder keys:"), "release doctor Markdown should include current action placeholder keys");
check(markdown.includes("Current Action"), "release doctor Markdown should include current action section");
check(markdown.includes("Operator action:"), "release doctor Markdown should include current operator action details");
check(markdown.includes("Value recorded: no"), "release doctor Markdown should state current action value redaction");
check(markdown.includes("Doctor command: `npm run release:doctor`"), "release doctor Markdown should include the doctor command");
check(markdown.includes("Prepare env command: `npm run release:prepare-env`"), "release doctor Markdown should include the prepare-env command");
check(markdown.includes("Progress command: `npm run release:progress`"), "release doctor Markdown should include the progress command");
check(markdown.includes("Hard external distribution gate: `npm run release:external-check`"), "release doctor Markdown should keep the hard external gate command");
check(!/https?:\/\//i.test(markdown), "release doctor Markdown should not include public or private URL values");
check(!/https?:\/\//i.test(serializedReport), "release doctor JSON should not include public or private URL values");

if (failures.length > 0) {
  fail("Release doctor validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge release doctor passed.");
console.log(`- Markdown: ${relative(releaseDoctorMarkdownPath)}`);
console.log(`- JSON: ${relative(releaseDoctorJsonPath)}`);
console.log(`- Local env file loaded: ${releaseDoctorReport.localEnvFileLoaded ? "yes" : "no"}`);
console.log(`- Local env ready: ${releaseDoctorReport.localEnvReady ? "yes" : "no"}`);
console.log(`- Release prepare env ready: ${releaseDoctorReport.releasePrepareEnvReady ? "yes" : "no"}`);
console.log(`- Release prepare env scaffold written: ${releaseDoctorReport.releasePrepareEnvScaffoldWritten ? "yes" : "no"}`);
console.log(`- Private inputs ready: ${releaseDoctorReport.privateInputsReady ? "yes" : "no"}`);
console.log(`- Private input groups ready: ${releaseDoctorReport.privateInputGroupReadyCount}/${releaseDoctorReport.privateInputGroupTotal}`);
console.log(`- Local env placeholder keys: ${releaseDoctorReport.localEnvPlaceholderKeyCount}`);
console.log(`- Current action: ${releaseDoctorReport.currentActionLabel}`);
console.log(`- Current next command: ${releaseDoctorReport.currentActionNextCommand}`);
console.log(`- Current first blocker: ${releaseDoctorReport.currentActionFirstBlocker}`);
console.log(`- Current env edit target: ${releaseDoctorReport.currentEnvEditTarget}`);
console.log(`- Current action required keys: ${releaseDoctorReport.currentActionRequiredKeyCount} (${releaseDoctorReport.currentActionRequiredKeySummary})`);
console.log(`- Current action placeholder keys: ${releaseDoctorReport.currentActionPlaceholderKeyCount} (${releaseDoctorReport.currentActionPlaceholderKeySummary})`);
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
