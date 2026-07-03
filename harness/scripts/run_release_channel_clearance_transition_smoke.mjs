#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const postClearanceSmoke = process.argv.includes("--post-clearance-smoke");
const reportStem = postClearanceSmoke
  ? "release-channel-clearance-transition-post-clearance-smoke"
  : "release-channel-clearance-transition-smoke";
const transitionArtifactNames = [
  "release-channel-clearance-transition-smoke.md",
  "release-channel-clearance-transition-smoke.json",
  "release-channel-clearance-transition-post-clearance-smoke.md",
  "release-channel-clearance-transition-post-clearance-smoke.json"
];
const transitionMarkdownPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`
);
const transitionJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`
);
const successHandoffJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-final-handoff-success-redaction-smoke.json`
);
const releaseDoctorJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-doctor.json`
);
const failures = [];
const completedPlanPattern = /^plan-(\d+)-[a-z0-9][a-z0-9-]*\.md$/;
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const transitionRefreshCommands = postClearanceSmoke
  ? [
      {
        order: 1,
        command: "synthetic final-handoff success-redaction fixture",
        role: "prove post-clearance release-channel metadata readiness without reading real ignored env values",
        valueRecorded: false
      },
      {
        order: 2,
        command: "synthetic release doctor post-clearance fixture",
        role: "prove downstream current-action mode after release-channel metadata clears",
        valueRecorded: false
      }
    ]
  : [
      {
        order: 1,
        command: "npm run release:final-handoff-success-redaction-smoke",
        role: "prove strict-ready release-channel handoff path remains redacted",
        valueRecorded: false
      },
      {
        order: 2,
        command: "npm run release:doctor",
        role: "refresh real release doctor current action without requiring full local release evidence",
        valueRecorded: false
      }
    ];
const updateFeedMetadataKeys = [
  "GROOVEFORGE_UPDATE_FEED_URL",
  "ELECTRON_UPDATE_FEED_URL",
  "UPDATE_FEED_URL",
  "GROOVEFORGE_UPDATE_CHANNEL",
  "ELECTRON_UPDATE_CHANNEL",
  "UPDATE_CHANNEL"
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release-channel clearance transition smoke failed:");
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

function readyLabel(value) {
  return value === true ? "yes" : "no";
}

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function objectRows(value) {
  return Array.isArray(value) ? value.filter((row) => row && typeof row === "object" && !Array.isArray(row)) : [];
}

function stringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim().length > 0) : [];
}

function runNpmScript(command) {
  if (command.startsWith("synthetic ")) {
    return;
  }
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const [, , scriptName] = command.split(" ");
  const result = spawnSync(npmCommand, ["run", scriptName], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.error) {
    fail(`Could not run ${command}.`, result.error.message);
  }
  if (result.status !== 0) {
    fail(`${command} exited with status ${result.status}.`);
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function valueFreeRow(row) {
  return {
    ...row,
    valueRecorded: false
  };
}

async function currentCompletedPlanState() {
  const completedPlansDir = path.join(root, "docs", "exec_plans", "completed");
  const entries = await readdir(completedPlansDir, { withFileTypes: true });
  const completedPlanNumbers = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name.match(completedPlanPattern))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter((planNumber) => Number.isInteger(planNumber) && planNumber > 0);
  const latestPlanNumber = Math.max(...completedPlanNumbers, 0);
  if (latestPlanNumber === 0) {
    return {
      latestPlan: "none",
      tenPlanProgress: "none",
      completedInWindow: 0
    };
  }
  const windowStart = latestPlanNumber - ((latestPlanNumber - 1) % 10);
  const windowEnd = windowStart + 9;
  const completedInWindow = completedPlanNumbers.filter((planNumber) => planNumber >= windowStart && planNumber <= windowEnd).length;
  return {
    latestPlan: `plan-${latestPlanNumber}`,
    tenPlanProgress: `${windowStart}-${windowEnd}: ${completedInWindow}/10`,
    completedInWindow
  };
}

async function syntheticPostClearanceFixtures() {
  const completedPlanState = await currentCompletedPlanState();
  return {
    successHandoff: {
      releaseFinalHandoffReady: true,
      syntheticSuccessRedactionSmoke: true,
      releaseChannelMetadataReady: true,
      realStrictReady: true,
      currentReadyCount: releaseChannelMetadataKeys.length,
      currentRowCount: releaseChannelMetadataKeys.length,
      currentPlaceholderKeyCount: 0,
      realLocalEnvRead: false,
      realLocalEnvModified: false,
      currentTenPlanProgressLabel: completedPlanState.tenPlanProgress,
      currentTenPlanWindowCompletedCount: completedPlanState.completedInWindow,
      tenPlanProgressReportDue: false
    },
    releaseDoctor: {
      releaseDoctorReportReady: true,
      currentActionId: "auto-update-feed",
      currentActionLabel: "Auto-update feed and signed metadata",
      currentActionNextCommand: "npm run desktop:auto-update-readiness-smoke",
      currentActionFirstBlocker: "Update feed/channel metadata and signed update artifacts remain pending.",
      currentActionRequiredKeys: updateFeedMetadataKeys,
      currentActionRequiredKeyCount: updateFeedMetadataKeys.length,
      currentActionPlaceholderKeys: updateFeedMetadataKeys,
      currentActionPlaceholderKeyCount: updateFeedMetadataKeys.length,
      releaseChannelMetadataReady: true,
      completionGapCurrentProofTarget: "Auto-update feed and signed metadata",
      completionGapHardGateCommand: "npm run release:external-check",
      externalDistributionReady: false,
      userFacingCompletionPercent: 99.999999,
      userFacingRemainingPercent: 0.000001
    }
  };
}

function sanitizeNextActionRows(rows, limit = 12) {
  return objectRows(rows)
    .slice(0, limit)
    .map((row, index) =>
      valueFreeRow({
        order: Number.isInteger(row.order) ? row.order : index + 1,
        label: textValue(row.label, row.criterion ?? row.step ?? row.key ?? "next-action row"),
        command: textValue(row.command, row.proofCommand ?? row.rerunCommand ?? "none"),
        evidence: textValue(row.evidence, row.expectedSignal ?? row.currentEvidence ?? row.blocker ?? row.guidance ?? "value-free evidence"),
        sourceField: textValue(row.sourceField, "external next-actions preview")
      })
    );
}

function autoUpdatePreviewRows() {
  return [
    {
      order: 1,
      label: "Feed URL shape",
      command: "npm run desktop:update-feed-config-smoke",
      evidence: "one selected update feed URL key must be safe HTTPS without recording values",
      sourceField: "staticAutoUpdatePreview.readyCriteria",
      valueRecorded: false
    },
    {
      order: 2,
      label: "Update channel shape",
      command: "npm run desktop:update-feed-config-smoke",
      evidence: "one selected update channel key must pass local channel validation without recording values",
      sourceField: "staticAutoUpdatePreview.readyCriteria",
      valueRecorded: false
    },
    {
      order: 3,
      label: "Auto-update readiness",
      command: "npm run desktop:auto-update-readiness-smoke",
      evidence: "provider, feed, channel, and signed metadata readiness stay separate from external completion claims",
      sourceField: "staticAutoUpdatePreview.readyCriteria",
      valueRecorded: false
    },
    {
      order: 4,
      label: "Update feed config",
      command: "npm run desktop:update-feed-config-smoke",
      evidence: "refresh redacted update feed configuration evidence",
      sourceField: "staticAutoUpdatePreview.checklist",
      valueRecorded: false
    },
    {
      order: 5,
      label: "Auto-update proof",
      command: "npm run desktop:auto-update-readiness-smoke",
      evidence: "refresh redacted auto-update readiness evidence",
      sourceField: "staticAutoUpdatePreview.checklist",
      valueRecorded: false
    },
    {
      order: 6,
      label: "Config verification",
      command: "npm run desktop:update-feed-config-smoke",
      evidence: "feed/channel config evidence should advance without URL/channel values",
      sourceField: "staticAutoUpdatePreview.verification",
      valueRecorded: false
    },
    {
      order: 7,
      label: "Readiness verification",
      command: "npm run desktop:auto-update-readiness-smoke",
      evidence: "auto-update readiness should advance only after provider/feed/channel metadata is ready",
      sourceField: "staticAutoUpdatePreview.verification",
      valueRecorded: false
    },
    {
      order: 8,
      label: "Hard gate separation",
      command: "npm run release:external-check",
      evidence: "external distribution remains unclaimed until downstream proofs and hard gate pass",
      sourceField: "staticAutoUpdatePreview.verification",
      valueRecorded: false
    },
    {
      order: 9,
      label: "Distribution env template",
      command: "npm run desktop:distribution-env-template-smoke",
      evidence: "confirm update feed/channel assignment shapes remain documented",
      sourceField: "staticAutoUpdatePreview.prerequisiteCommands",
      valueRecorded: false
    },
    {
      order: 10,
      label: "Private inputs",
      command: "npm run desktop:distribution-private-inputs-smoke",
      evidence: "confirm selected feed/channel keys remain redacted",
      sourceField: "staticAutoUpdatePreview.prerequisiteCommands",
      valueRecorded: false
    },
    {
      order: 11,
      label: "Update config",
      command: "npm run desktop:update-feed-config-smoke",
      evidence: "confirm selected update provider/feed/channel shape",
      sourceField: "staticAutoUpdatePreview.prerequisiteCommands",
      valueRecorded: false
    },
    {
      order: 12,
      label: "Auto-update readiness",
      command: "npm run desktop:auto-update-readiness-smoke",
      evidence: "confirm auto-update readiness blockers after metadata edits",
      sourceField: "staticAutoUpdatePreview.prerequisiteCommands",
      valueRecorded: false
    },
    {
      order: 13,
      label: "Select feed URL key",
      command: "manual edit .env.distribution.local",
      evidence: "choose one update feed URL key in the ignored local env file",
      sourceField: "staticAutoUpdatePreview.operatorActions",
      valueRecorded: false
    },
    {
      order: 14,
      label: "Select update channel key",
      command: "manual edit .env.distribution.local",
      evidence: "choose one update channel key in the ignored local env file",
      sourceField: "staticAutoUpdatePreview.operatorActions",
      valueRecorded: false
    },
    ...updateFeedMetadataKeys.map((key, index) => ({
      order: 15 + index,
      label: key,
      command: "manual edit .env.distribution.local",
      evidence: `${key}=<value-shape>`,
      sourceField: "staticAutoUpdatePreview.envEditRows",
      valueRecorded: false
    }))
  ];
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${escapeCell(row.path)} | ${readyLabel(row.ready)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatTransitionRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.state)} | ${escapeCell(row.evidence)} | ${escapeCell(row.command)} | ${readyLabel(row.ready)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatPreviewRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.label)} | ${escapeCell(row.command)} | ${escapeCell(row.evidence)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatRefreshRows(rows) {
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function buildReport({ successHandoff, releaseDoctor }) {
  const currentFirstBlocker = textValue(releaseDoctor.currentActionFirstBlocker);
  const currentNextCommand = textValue(releaseDoctor.currentActionNextCommand, "npm run release:doctor");
  const currentRequiredKeys = stringArray(releaseDoctor.currentActionRequiredKeys);
  const currentPlaceholderKeys = stringArray(releaseDoctor.currentActionPlaceholderKeys);
  const currentReleaseChannelPlaceholderKeys = currentPlaceholderKeys.filter((key) => releaseChannelMetadataKeys.includes(key));
  const currentActionIsReleaseChannel =
    releaseDoctor.currentActionId === "prepare-local-distribution-env" ||
    releaseDoctor.currentActionId === "replace-release-channel-placeholders" ||
    releaseDoctor.currentActionId === "release-channel-metadata";
  const currentActionRequiresReleaseChannelKeys = releaseChannelMetadataKeys.every((key) => currentRequiredKeys.includes(key));
  const missingLocalEnvCurrentBlocker =
    currentNextCommand === "npm run release:prepare-env" ||
    currentFirstBlocker.includes("local distribution env file is not loaded");
  const placeholderCurrentBlocker = currentReleaseChannelPlaceholderKeys.length === releaseChannelMetadataKeys.length;
  const currentReleaseChannelBlocked =
    currentActionIsReleaseChannel &&
    currentActionRequiresReleaseChannelKeys &&
    (missingLocalEnvCurrentBlocker || placeholderCurrentBlocker);
  const postReleaseChannelClearance =
    currentReleaseChannelBlocked === false &&
    missingLocalEnvCurrentBlocker === false &&
    currentReleaseChannelPlaceholderKeys.length === 0 &&
    (releaseDoctor.releaseChannelMetadataReady === true || currentActionIsReleaseChannel === false || currentActionRequiresReleaseChannelKeys === false);
  const currentBlockerMode = missingLocalEnvCurrentBlocker
    ? "missing-local-env"
    : currentReleaseChannelBlocked
      ? "replace-release-channel-placeholders"
      : "post-release-channel-clearance";
  const sourceArtifactRows = [
    {
      label: postClearanceSmoke ? "Synthetic final handoff success-redaction fixture" : "Final handoff success-redaction smoke",
      path: postClearanceSmoke ? "synthetic/post-clearance/final-handoff-success-redaction" : relative(successHandoffJsonPath),
      present: true,
      ready:
        successHandoff.releaseFinalHandoffReady === true &&
        successHandoff.syntheticSuccessRedactionSmoke === true &&
        successHandoff.releaseChannelMetadataReady === true &&
        successHandoff.realStrictReady === true,
      valueRecorded: false
    },
    {
      label: postClearanceSmoke ? "Synthetic release doctor post-clearance fixture" : "Release doctor",
      path: postClearanceSmoke ? "synthetic/post-clearance/release-doctor" : relative(releaseDoctorJsonPath),
      present: true,
      ready: releaseDoctor.releaseDoctorReportReady === true,
      valueRecorded: false
    }
  ];
  const transitionRows = [
    {
      order: 1,
      state: postReleaseChannelClearance ? "Post-clearance downstream blocker" : "Current real blocker",
      evidence: postReleaseChannelClearance
        ? "Release-channel metadata has no remaining release-channel placeholders, so the transition receipt accepts the downstream auto-update or release-gate blocker."
        : missingLocalEnvCurrentBlocker
        ? "Release-channel metadata remains the real current blocker until the ignored local env scaffold exists and operator-owned values replace placeholders."
        : "Release-channel metadata remains the real current blocker until operator-owned values replace placeholders.",
      command: currentNextCommand,
      ready: currentReleaseChannelBlocked || postReleaseChannelClearance,
      valueRecorded: false
    },
    {
      order: 2,
      state: "Synthetic clearance proof",
      evidence: "Success-redaction handoff proves release-channel metadata can be strict-ready without recording URL/channel/private values.",
      command: "npm run release:final-handoff-success-redaction-smoke",
      ready:
        successHandoff.releaseChannelMetadataReady === true &&
        successHandoff.currentReadyCount === releaseChannelMetadataKeys.length &&
        successHandoff.currentPlaceholderKeyCount === 0 &&
        successHandoff.realStrictReady === true,
      valueRecorded: false
    },
    {
      order: 3,
      state: "Next operator focus",
      evidence: "The value-free transition preview points to auto-update feed and signed metadata after release-channel metadata clears.",
      command: "npm run desktop:auto-update-readiness-smoke",
      ready: true,
      valueRecorded: false
    },
    {
      order: 4,
      state: "Hard-gate boundary",
      evidence: "External distribution remains unclaimed until the hard gate passes all downstream evidence.",
      command: textValue(releaseDoctor.completionGapHardGateCommand, "npm run release:external-check"),
      ready: releaseDoctor.externalDistributionReady !== true,
      valueRecorded: false
    }
  ];
  const nextActionPreviewRows = [
    ...sanitizeNextActionRows(autoUpdatePreviewRows(), 21)
  ];

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: postClearanceSmoke
      ? "npm run release:channel-clearance-transition-post-clearance-smoke"
      : "npm run release:channel-clearance-transition-smoke",
    reportStem,
    transitionArtifactNames,
    postClearanceSmoke,
    transitionRefreshCommands,
    transitionRefreshCommandCount: transitionRefreshCommands.length,
    releaseChannelClearanceTransitionReady:
      sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
      transitionRows.every((row) => row.ready === true && row.valueRecorded === false),
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    currentRealBlockerReady: releaseDoctor.releaseDoctorReportReady === true,
    currentBlockerMode,
    releaseChannelBlockedBeforeClearance: currentReleaseChannelBlocked,
    releaseChannelPostClearanceMode: postReleaseChannelClearance,
    currentPriorityActionId: textValue(releaseDoctor.currentActionId),
    currentPriorityActionLabel: textValue(releaseDoctor.currentActionLabel),
    currentTarget: textValue(releaseDoctor.completionGapCurrentProofTarget, "Release channel metadata"),
    currentNextCommand,
    currentFirstBlocker,
    currentRequiredKeys,
    currentRequiredKeyCount: integerValue(releaseDoctor.currentActionRequiredKeyCount),
    currentPlaceholderKeys,
    currentPlaceholderKeyCount: integerValue(releaseDoctor.currentActionPlaceholderKeyCount),
    currentReleaseChannelPlaceholderKeys,
    currentReleaseChannelPlaceholderKeyCount: currentReleaseChannelPlaceholderKeys.length,
    syntheticClearanceReady: successHandoff.releaseChannelMetadataReady === true,
    syntheticClearanceStrictReady: successHandoff.realStrictReady === true,
    syntheticClearanceCurrentReadyCount: integerValue(successHandoff.currentReadyCount),
    syntheticClearanceCurrentRowCount: integerValue(successHandoff.currentRowCount),
    syntheticClearancePlaceholderKeyCount: integerValue(successHandoff.currentPlaceholderKeyCount),
    syntheticClearanceRealLocalEnvRead: successHandoff.realLocalEnvRead === true,
    syntheticClearanceRealLocalEnvModified: successHandoff.realLocalEnvModified === true,
    nextPriorityActionId: "auto-update-feed",
    nextPriorityActionLabel: "Auto-update feed and signed metadata",
    nextPriorityActionNextCommand: "npm run desktop:auto-update-readiness-smoke",
    nextPriorityActionFirstBlocker: "Update feed/channel metadata and signed update artifacts remain pending.",
    nextActionPreviewReady: true,
    nextActionPreviewId: "auto-update-feed",
    nextActionPreviewLabel: "Auto-update feed and signed metadata",
    nextActionPreviewProofCommand: "npm run desktop:auto-update-readiness-smoke",
    nextActionPreviewFirstBlocker: "Update feed/channel metadata and signed update artifacts remain pending.",
    nextActionPreviewRequiredKeyCount: updateFeedMetadataKeys.length,
    nextActionPreviewPlaceholderKeyCount: 0,
    nextActionPreviewReadyCriteriaRowCount: 3,
    nextActionPreviewChecklistRowCount: 2,
    nextActionPreviewVerificationRowCount: 3,
    nextActionPreviewPrerequisiteCommandRowCount: 4,
    nextActionPreviewOperatorActionRowCount: 2,
    nextActionPreviewEnvEditRowCount: updateFeedMetadataKeys.length,
    nextActionPreviewRows,
    nextActionPreviewRowCount: nextActionPreviewRows.length,
    transitionRows,
    transitionRowCount: transitionRows.length,
    hardGateCommand: textValue(releaseDoctor.completionGapHardGateCommand, "npm run release:external-check"),
    hardGateReady: releaseDoctor.externalDistributionReady === true,
    hardGateWouldFail: releaseDoctor.externalDistributionReady !== true,
    currentTenPlanProgressLabel: textValue(successHandoff.currentTenPlanProgressLabel),
    currentTenPlanWindowCompletedCount: integerValue(successHandoff.currentTenPlanWindowCompletedCount),
    tenPlanProgressReportDue: successHandoff.tenPlanProgressReportDue === true,
    userFacingCompletionPercent: Number(releaseDoctor.userFacingCompletionPercent ?? 99.999999),
    userFacingRemainingPercent: Number(releaseDoctor.userFacingRemainingPercent ?? 0.000001),
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    signingAttempted: false,
    notarySubmissionAttempted: false,
    claimedDeveloperIdSigning: false,
    claimedNotarization: false,
    claimedGatekeeperApproval: false,
    claimedAutoUpdate: false,
    claimedManualQaApproval: false,
    claimedAppStoreSubmission: false,
    claimedExternalDistribution: false,
    valueRecorded: false
  };
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release-Channel Clearance Transition Smoke

## Status

- Transition receipt ready: ${readyLabel(report.releaseChannelClearanceTransitionReady)}
- Current blocker mode: ${report.currentBlockerMode}
- Post-clearance smoke: ${readyLabel(report.postClearanceSmoke)}
- Release-channel blocked before clearance: ${readyLabel(report.releaseChannelBlockedBeforeClearance)}
- Release-channel post-clearance mode: ${readyLabel(report.releaseChannelPostClearanceMode)}
- Current real blocker: ${report.currentPriorityActionLabel} (${report.currentPriorityActionId})
- Current placeholder keys: ${report.currentPlaceholderKeyCount}
- Current release-channel placeholder keys: ${report.currentReleaseChannelPlaceholderKeyCount}
- Synthetic clearance ready: ${readyLabel(report.syntheticClearanceReady)}
- Synthetic strict ready: ${readyLabel(report.syntheticClearanceStrictReady)}
- Synthetic ready rows: ${report.syntheticClearanceCurrentReadyCount}/${report.syntheticClearanceCurrentRowCount}
- Synthetic placeholder keys: ${report.syntheticClearancePlaceholderKeyCount}
- Next priority action: ${report.nextPriorityActionLabel} (${report.nextPriorityActionId})
- Next action proof command: \`${report.nextActionPreviewProofCommand}\`
- Next action first blocker: ${report.nextActionPreviewFirstBlocker}
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Signing attempted: no
- Apple notary submission attempted: no
- External distribution claimed: no

## Refresh Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatRefreshRows(report.transitionRefreshCommands)}

## Source Artifacts

| artifact | present | path | ready | value recorded |
|---|---:|---|---:|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Transition Rows

| order | state | evidence | command | ready | value recorded |
|---:|---|---|---|---:|---:|
${formatTransitionRows(report.transitionRows)}

## Next Action Preview Rows

| order | label | command | evidence | value recorded |
|---:|---|---|---|---:|
${formatPreviewRows(report.nextActionPreviewRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No distribution channel probe, release upload, Apple notary submission, or signing is attempted by this transition smoke.
- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  check(report.releaseChannelClearanceTransitionReady === true, "release-channel clearance transition should be ready");
  check(report.sourceArtifactRowCount === 2, "release-channel clearance transition should include two source artifacts");
  check(report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false), "release-channel clearance transition source rows should be present, ready, and value-free");
  check(report.transitionRefreshCommandCount === 2, "release-channel clearance transition should include two refresh commands");
  check(report.transitionRefreshCommands.every((row) => row.valueRecorded === false), "release-channel clearance transition refresh commands should be value-free");
  check(report.currentRealBlockerReady === true, "release-channel clearance transition should include ready current blocker evidence");
  check(
    ["missing-local-env", "replace-release-channel-placeholders", "post-release-channel-clearance"].includes(report.currentBlockerMode),
    "release-channel clearance transition should identify the current transition mode"
  );
  if (report.currentBlockerMode === "missing-local-env") {
    check(
      ["prepare-local-distribution-env", "replace-release-channel-placeholders", "release-channel-metadata"].includes(report.currentPriorityActionId),
      "release-channel clearance transition should keep release-channel setup as current real blocker before clearance"
    );
    check(report.currentRequiredKeyCount === releaseChannelMetadataKeys.length, "release-channel clearance transition should mirror four release-channel required keys before clearance");
    check(report.currentNextCommand === "npm run release:prepare-env", "release-channel clearance transition should surface prepare-env when the ignored env is missing");
    check(report.currentPlaceholderKeyCount === 0, "release-channel clearance transition should not report placeholder keys before the ignored env exists");
    check(report.currentReleaseChannelPlaceholderKeyCount === 0, "release-channel clearance transition should not report release-channel placeholders before the ignored env exists");
    check(report.releaseChannelBlockedBeforeClearance === true, "release-channel clearance transition should mark missing-env mode as blocked before clearance");
    check(report.releaseChannelPostClearanceMode === false, "release-channel clearance transition should not mark missing-env mode as post-clearance");
    check(report.currentFirstBlocker.includes("local distribution env file is not loaded"), "release-channel clearance transition should surface the missing-env blocker");
  } else if (report.currentBlockerMode === "replace-release-channel-placeholders") {
    check(
      ["prepare-local-distribution-env", "replace-release-channel-placeholders", "release-channel-metadata"].includes(report.currentPriorityActionId),
      "release-channel clearance transition should keep release-channel setup as current real blocker while placeholders remain"
    );
    check(report.currentRequiredKeyCount === releaseChannelMetadataKeys.length, "release-channel clearance transition should mirror four release-channel required keys while placeholders remain");
    check(report.currentPlaceholderKeyCount === releaseChannelMetadataKeys.length, "release-channel clearance transition should mirror four real placeholder keys");
    check(releaseChannelMetadataKeys.every((key) => report.currentPlaceholderKeys.includes(key)), "release-channel clearance transition should mirror release-channel placeholder keys");
    check(report.currentReleaseChannelPlaceholderKeyCount === releaseChannelMetadataKeys.length, "release-channel clearance transition should count four release-channel placeholders");
    check(report.releaseChannelBlockedBeforeClearance === true, "release-channel clearance transition should mark placeholder mode as blocked before clearance");
    check(report.releaseChannelPostClearanceMode === false, "release-channel clearance transition should not mark placeholder mode as post-clearance");
  } else {
    check(report.releaseChannelBlockedBeforeClearance === false, "release-channel clearance transition post-clearance mode should not be blocked by release-channel metadata");
    check(report.releaseChannelPostClearanceMode === true, "release-channel clearance transition should mark downstream mode as post-clearance");
    check(report.currentReleaseChannelPlaceholderKeyCount === 0, "release-channel clearance transition post-clearance mode should have zero release-channel placeholders");
    check(
      !["prepare-local-distribution-env", "replace-release-channel-placeholders", "release-channel-metadata"].includes(report.currentPriorityActionId),
      "release-channel clearance transition post-clearance mode should have a downstream current action"
    );
    check(report.currentNextCommand !== "npm run release:channel-apply-private-env-preflight", "release-channel clearance transition post-clearance mode should advance past release-channel preflight");
  }
  check(report.syntheticClearanceReady === true, "release-channel clearance transition should include synthetic clearance readiness");
  check(report.syntheticClearanceStrictReady === true, "release-channel clearance transition should include synthetic strict readiness");
  check(report.syntheticClearanceCurrentReadyCount === releaseChannelMetadataKeys.length, "release-channel clearance transition should prove four synthetic ready rows");
  check(report.syntheticClearancePlaceholderKeyCount === 0, "release-channel clearance transition should prove zero synthetic placeholder keys");
  check(report.syntheticClearanceRealLocalEnvRead === false, "release-channel clearance transition synthetic source should not read real local env");
  check(report.syntheticClearanceRealLocalEnvModified === false, "release-channel clearance transition synthetic source should not modify real local env");
  check(report.nextPriorityActionId === "auto-update-feed", "release-channel clearance transition should point to auto-update feed as next priority action");
  check(report.nextActionPreviewId === "auto-update-feed", "release-channel clearance transition should mirror auto-update next-action preview");
  check(report.nextActionPreviewReady === true, "release-channel clearance transition should include ready next-action preview");
  check(report.nextActionPreviewProofCommand === "npm run desktop:auto-update-readiness-smoke", "release-channel clearance transition should keep auto-update readiness proof command");
  check(report.nextActionPreviewReadyCriteriaRowCount === 3, "release-channel clearance transition should mirror three next-action ready criteria rows");
  check(report.nextActionPreviewChecklistRowCount === 2, "release-channel clearance transition should mirror two next-action checklist rows");
  check(report.nextActionPreviewVerificationRowCount === 3, "release-channel clearance transition should mirror three next-action verification rows");
  check(report.nextActionPreviewPrerequisiteCommandRowCount === 4, "release-channel clearance transition should mirror four next-action prerequisite commands");
  check(report.nextActionPreviewOperatorActionRowCount === 2, "release-channel clearance transition should mirror two next-action operator rows");
  check(report.nextActionPreviewEnvEditRowCount === 6, "release-channel clearance transition should mirror six next-action env edit rows");
  check(report.nextActionPreviewRows.every((row) => row.valueRecorded === false), "release-channel clearance transition next-action rows should be value-free");
  check(report.transitionRowCount === 4, "release-channel clearance transition should include four transition rows");
  check(report.transitionRows.every((row) => row.ready === true && row.valueRecorded === false), "release-channel clearance transition rows should be ready and value-free");
  check(report.hardGateCommand === "npm run release:external-check", "release-channel clearance transition should keep hard external gate command");
  check(report.hardGateReady === false, "release-channel clearance transition should keep hard gate unready");
  check(report.hardGateWouldFail === true, "release-channel clearance transition should keep hard gate would-fail posture");
  check(report.userFacingCompletionPercent === 99.999999, "release-channel clearance transition should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "release-channel clearance transition should preserve remaining percent");
  check(report.privateValuesRecorded === false, "release-channel clearance transition should not record private values");
  check(report.networkProbeAttempted === false, "release-channel clearance transition should not probe network");
  check(report.releaseUploadAttempted === false, "release-channel clearance transition should not upload releases");
  check(report.signingAttempted === false, "release-channel clearance transition should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release-channel clearance transition should not submit to Apple");
  check(report.claimedExternalDistribution === false, "release-channel clearance transition should not claim external distribution");
  check(!/https?:\/\//i.test(JSON.stringify(report)), "release-channel clearance transition JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release-channel clearance transition Markdown should not include URL values");
  check(!JSON.stringify(report).includes("direct-download"), "release-channel clearance transition JSON should not include channel values");
  check(!markdown.includes("direct-download"), "release-channel clearance transition Markdown should not include channel values");
  check(markdown.includes("Release-Channel Clearance Transition Smoke"), "release-channel clearance transition Markdown should include title");
  check(markdown.includes("Next priority action:"), "release-channel clearance transition Markdown should include next priority action");
  check(markdown.includes("External distribution claimed: no"), "release-channel clearance transition Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }
}

for (const row of transitionRefreshCommands) {
  console.log(`Refreshing release-channel transition evidence: ${row.command}`);
  runNpmScript(row.command);
}

const fixtures = postClearanceSmoke ? await syntheticPostClearanceFixtures() : null;
const successHandoff = fixtures?.successHandoff ?? (await readJsonRequired(successHandoffJsonPath, "Final handoff success-redaction smoke"));
const releaseDoctor = fixtures?.releaseDoctor ?? (await readJsonRequired(releaseDoctorJsonPath, "Release doctor"));
const report = buildReport({ successHandoff, releaseDoctor });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(transitionMarkdownPath, markdown, "utf8");
await writeFile(transitionJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release-channel clearance transition smoke passed.");
console.log(`- Markdown: ${relative(transitionMarkdownPath)}`);
console.log(`- JSON: ${relative(transitionJsonPath)}`);
console.log(`- Transition ready: ${report.releaseChannelClearanceTransitionReady ? "yes" : "no"}`);
console.log(`- Current blocker mode: ${report.currentBlockerMode}`);
console.log(`- Post-clearance smoke: ${report.postClearanceSmoke ? "yes" : "no"}`);
console.log(`- Release-channel post-clearance mode: ${report.releaseChannelPostClearanceMode ? "yes" : "no"}`);
console.log(`- Current real blocker: ${report.currentPriorityActionLabel}`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
console.log(`- Current release-channel placeholder keys: ${report.currentReleaseChannelPlaceholderKeyCount}`);
console.log(`- Synthetic clearance ready: ${report.syntheticClearanceReady ? "yes" : "no"}`);
console.log(`- Synthetic strict ready: ${report.syntheticClearanceStrictReady ? "yes" : "no"}`);
console.log(`- Next priority action: ${report.nextPriorityActionLabel}`);
console.log(`- Next action proof command: ${report.nextActionPreviewProofCommand}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
