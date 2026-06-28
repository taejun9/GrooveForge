#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
      const prerequisites = action.prerequisiteCommands.map((command) => `   - \`${command}\``).join("\n") || "   - none";
      const operatorActions = action.operatorActions.map((item) => `   - ${item}`).join("\n") || "   - none";
      const rerunCommands = action.rerunCommands.map((command) => `   - \`${command}\``).join("\n") || "   - none";
      const blockers = action.blockers.map((blocker) => `   - ${blocker}`).join("\n") || "   - none";
      return `${action.order}. ${action.label}
   Required keys: ${requiredKeys}
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

function sensitiveEnvironmentValues() {
  return sensitivePrivateKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function buildPriorityActions(remediation, context = {}) {
  const localEnvFileLoaded = context.localEnvFileLoaded === true;
  const localEnvPlaceholderKeys = Array.isArray(context.localEnvPlaceholderKeys) ? context.localEnvPlaceholderKeys : [];
  const localEnvPlaceholderKeyCount = Number.isInteger(context.localEnvPlaceholderKeyCount)
    ? context.localEnvPlaceholderKeyCount
    : localEnvPlaceholderKeys.length;
  return (remediation.remediationGroups ?? [])
    .filter((group) => group.ready !== true)
    .map((group, index) => {
      const shouldPrepareEnv = group.id === "release-channel-metadata" && !localEnvFileLoaded;
      const shouldReplacePlaceholders = group.id === "release-channel-metadata" && localEnvFileLoaded && localEnvPlaceholderKeyCount > 0;
      const prerequisiteCommands = shouldPrepareEnv
        ? unique(["npm run release:prepare-env", group.prerequisiteCommands ?? []])
        : group.prerequisiteCommands ?? [];
      const operatorActions = shouldPrepareEnv
        ? unique([
            "Run the explicit prepare-env command to create the ignored local distribution env scaffold before validating private inputs.",
            group.operatorActions ?? []
          ])
        : shouldReplacePlaceholders
          ? unique([
              `Replace placeholder values in the ignored local distribution env file for ${localEnvPlaceholderKeyCount} keys: ${localEnvPlaceholderKeys.join(", ")}.`,
              "Keep those private values out of committed files and generated reports.",
              group.operatorActions ?? []
            ])
        : group.operatorActions ?? [];
      const rerunCommands = shouldReplacePlaceholders
        ? unique(["npm run release:doctor", group.rerunCommands ?? []])
        : group.rerunCommands ?? [];
      const placeholderBlocker = shouldReplacePlaceholders
        ? `Local distribution env still contains ${localEnvPlaceholderKeyCount} placeholder keys.`
        : "";
      const missingLocalEnvBlocker = shouldPrepareEnv ? "Ignored local distribution env file is not loaded." : "";
      return {
        order: index + 1,
        id: group.id,
        label: group.label,
        ready: false,
        requiredKeys: group.requiredKeys ?? [],
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
    });
}

function buildCurrentActionSummary(priorityActions, fallback = {}) {
  const currentAction = Array.isArray(priorityActions) ? priorityActions[0] : null;
  const currentPrerequisiteCommands = currentAction?.prerequisiteCommands ?? [];
  const currentOperatorActions = currentAction?.operatorActions ?? [];
  const currentRerunCommands = currentAction?.rerunCommands ?? [];
  return {
    currentActionId: currentAction?.id ?? fallback.id ?? "none",
    currentActionLabel: currentAction?.label ?? fallback.label ?? "No pending priority action",
    currentNextCommand: currentAction?.nextCommand ?? fallback.nextCommand ?? "npm run release:external-check",
    currentFirstBlocker: currentAction?.firstBlocker || fallback.firstBlocker || "none",
    currentRequiredKeys: currentAction?.requiredKeys ?? [],
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
    localEnvFileLoaded: false,
    localEnvPlaceholderKeyCount: 0,
    localEnvPlaceholderKeys: [],
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
  const priorityActions = buildPriorityActions(externalRemediation, {
    localEnvFileLoaded,
    localEnvPlaceholderKeyCount,
    localEnvPlaceholderKeys
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
    localEnvFileLoaded,
    localEnvPlaceholderKeyCount,
    localEnvPlaceholderKeys,
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
check(Array.isArray(nextActionsReport.currentRequiredKeys), "external next actions should include current required keys");
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
}
check(Number.isInteger(nextActionsReport.localEnvPlaceholderKeyCount), "external next actions should include local env placeholder key count");
check(Array.isArray(nextActionsReport.localEnvPlaceholderKeys), "external next actions should include local env placeholder key names");
check(
  nextActionsReport.localEnvPlaceholderKeyCount === nextActionsReport.localEnvPlaceholderKeys.length,
  "external next actions placeholder key count should match listed keys"
);
if (nextActionsReport.bootstrapMode === false && nextActionsReport.localEnvFileLoaded === false) {
  const releaseChannelAction = nextActionsReport.priorityActions.find((action) => action.id === "release-channel-metadata");
  check(nextActionsReport.currentActionId === releaseChannelAction?.id, "release channel metadata should be the current action when no local env file is loaded");
  check(nextActionsReport.currentFirstBlocker.includes("local distribution env file is not loaded"), "release channel metadata should surface the missing local env file as the current first blocker");
  check(nextActionsReport.currentOperatorAction.includes("prepare-env"), "release channel metadata should surface prepare-env as the current operator action when no local env file is loaded");
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
  check(nextActionsReport.currentOperatorAction.includes("Replace placeholder values"), "release channel metadata should surface placeholder replacement as the current operator action when placeholders remain");
  check(releaseChannelAction?.nextCommand === "npm run release:doctor", "release channel metadata should rerun release doctor after placeholder cleanup");
  check(
    releaseChannelAction?.operatorActions.some((action) => action.includes("Replace placeholder values in the ignored local distribution env file")),
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
check(markdown.includes("Current operator action:"), "external next actions Markdown should include current operator action");
check(markdown.includes("Current rerun command:"), "external next actions Markdown should include current rerun command");
check(markdown.includes("Local env placeholder keys:"), "external next actions Markdown should include placeholder key count");
check(markdown.includes("Local Env Placeholder Keys"), "external next actions Markdown should include placeholder key section");
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
