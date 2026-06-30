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
const transitionMarkdownPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-auto-update-transition-smoke.md`
);
const transitionJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-auto-update-transition-smoke.json`
);
const releaseChannelTransitionJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-clearance-transition-smoke.json`
);
const updateFeedConfigJsonPath = path.join(summaryRoot, `${appName}-${platformArch}-update-feed-config.json`);
const autoUpdateReadinessJsonPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const failures = [];
const updateFeedKeys = [
  "GROOVEFORGE_UPDATE_FEED_URL",
  "ELECTRON_UPDATE_FEED_URL",
  "UPDATE_FEED_URL",
  "GROOVEFORGE_UPDATE_CHANNEL",
  "ELECTRON_UPDATE_CHANNEL",
  "UPDATE_CHANNEL"
];
const transitionRefreshCommands = [
  {
    order: 1,
    command: "npm run release:channel-clearance-transition-smoke",
    role: "refresh release-channel clearance transition and real current blocker evidence",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run desktop:update-feed-config-smoke",
    role: "refresh value-free update feed/channel config validation and synthetic ready case",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run desktop:auto-update-readiness-smoke",
    role: "refresh real auto-update readiness blockers without probing a feed",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release auto-update transition smoke failed:");
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

function valueFreeRow(row) {
  return {
    ...row,
    valueRecorded: false
  };
}

function runNpmScript(command) {
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

function sourceRow(label, filePath, ready) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready,
    valueRecorded: false
  };
}

function sanitizeBlockerRows(blockers) {
  return stringArray(blockers).map((blocker, index) =>
    valueFreeRow({
      order: index + 1,
      blocker,
      sourceField: "autoUpdateReadiness.blockers",
      proofCommand: "npm run desktop:auto-update-readiness-smoke",
      hardGateCommand: "npm run release:external-check"
    })
  );
}

function formatRefreshRows(rows) {
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
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

function formatBlockerRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.blocker)} | ${escapeCell(row.proofCommand)} | ${escapeCell(row.hardGateCommand)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function buildReport({ releaseChannelTransition, updateFeedConfig, autoUpdateReadiness }) {
  const validFeedCase = objectRows(updateFeedConfig.cases).find((testCase) => testCase.name === "valid GrooveForge feed and channel");
  const validFeedRedacted = validFeedCase?.redacted ?? {};
  const autoUpdateBlockerRows = sanitizeBlockerRows(autoUpdateReadiness.blockers);
  const sourceArtifactRows = [
    sourceRow(
      "Release-channel clearance transition",
      releaseChannelTransitionJsonPath,
      releaseChannelTransition.releaseChannelClearanceTransitionReady === true &&
        releaseChannelTransition.nextPriorityActionId === "auto-update-feed" &&
        releaseChannelTransition.nextActionPreviewProofCommand === "npm run desktop:auto-update-readiness-smoke"
    ),
    sourceRow(
      "Update feed config smoke",
      updateFeedConfigJsonPath,
      updateFeedConfig.currentEnvironmentConfig?.feedValueRecorded === false &&
        updateFeedConfig.currentEnvironmentConfig?.channelValueRecorded === false &&
        validFeedCase?.ready === true &&
        validFeedRedacted.feedValueRecorded === false &&
        validFeedRedacted.channelValueRecorded === false
    ),
    sourceRow(
      "Auto-update readiness smoke",
      autoUpdateReadinessJsonPath,
      autoUpdateReadiness.localEnvValueRecorded === false &&
        autoUpdateReadiness.networkProbeAttempted === false &&
        autoUpdateReadiness.releaseGateClaimedAutoUpdate === false &&
        autoUpdateReadiness.releaseGateClaimedExternalDistribution === false
    )
  ];
  const syntheticFeedChannelReady =
    validFeedCase?.ready === true &&
    validFeedRedacted.ready === true &&
    validFeedRedacted.feedUrlPresent === true &&
    validFeedRedacted.feedUrlValid === true &&
    validFeedRedacted.releaseChannelPresent === true &&
    validFeedRedacted.releaseChannelValid === true &&
    validFeedRedacted.feedValueRecorded === false &&
    validFeedRedacted.channelValueRecorded === false &&
    !("feedUrl" in validFeedRedacted) &&
    !("releaseChannel" in validFeedRedacted);
  const realAutoUpdateBlocked = autoUpdateReadiness.autoUpdateReady === false && autoUpdateBlockerRows.length > 0;
  const transitionRows = [
    {
      order: 1,
      state: "Release-channel transition source",
      evidence: "Release-channel clearance transition identifies auto-update feed and signed metadata as the next operator focus.",
      command: "npm run release:channel-clearance-transition-smoke",
      ready: sourceArtifactRows[0].ready === true,
      valueRecorded: false
    },
    {
      order: 2,
      state: "Synthetic feed/channel config",
      evidence: "Update feed config validation proves a valid feed/channel shape can be ready while redacting feed and channel values.",
      command: "npm run desktop:update-feed-config-smoke",
      ready: syntheticFeedChannelReady,
      valueRecorded: false
    },
    {
      order: 3,
      state: "Real auto-update readiness",
      evidence: "Real readiness remains blocked until operator-owned feed/channel and signed/notarized update artifact evidence are present.",
      command: "npm run desktop:auto-update-readiness-smoke",
      ready: realAutoUpdateBlocked && sourceArtifactRows[2].ready === true,
      valueRecorded: false
    },
    {
      order: 4,
      state: "Hard-gate boundary",
      evidence: "External distribution remains unclaimed until the hard gate passes all downstream release evidence.",
      command: textValue(releaseChannelTransition.hardGateCommand, "npm run release:external-check"),
      ready: releaseChannelTransition.hardGateReady === false && releaseChannelTransition.hardGateWouldFail === true,
      valueRecorded: false
    }
  ];

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:auto-update-transition-smoke",
    transitionRefreshCommands,
    transitionRefreshCommandCount: transitionRefreshCommands.length,
    releaseAutoUpdateTransitionReady:
      sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
      transitionRows.every((row) => row.ready === true && row.valueRecorded === false),
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    releaseChannelClearanceTransitionReady: releaseChannelTransition.releaseChannelClearanceTransitionReady === true,
    releaseChannelCurrentPriorityActionId: textValue(releaseChannelTransition.currentPriorityActionId),
    releaseChannelCurrentPlaceholderKeyCount: integerValue(releaseChannelTransition.currentPlaceholderKeyCount),
    releaseChannelSyntheticClearanceReady: releaseChannelTransition.syntheticClearanceReady === true,
    releaseChannelNextPriorityActionId: textValue(releaseChannelTransition.nextPriorityActionId),
    releaseChannelNextActionProofCommand: textValue(releaseChannelTransition.nextActionPreviewProofCommand),
    syntheticFeedChannelConfigReady: syntheticFeedChannelReady,
    syntheticFeedChannelCaseName: textValue(validFeedCase?.name),
    syntheticFeedKey: textValue(validFeedRedacted.feedKey),
    syntheticChannelKey: textValue(validFeedRedacted.channelKey),
    syntheticFeedUrlPresent: validFeedRedacted.feedUrlPresent === true,
    syntheticFeedUrlValid: validFeedRedacted.feedUrlValid === true,
    syntheticReleaseChannelPresent: validFeedRedacted.releaseChannelPresent === true,
    syntheticReleaseChannelValid: validFeedRedacted.releaseChannelValid === true,
    syntheticPresentEnvironmentKeys: stringArray(validFeedRedacted.presentEnvironmentKeys),
    syntheticPresentEnvironmentKeyCount: stringArray(validFeedRedacted.presentEnvironmentKeys).length,
    syntheticFeedValueRecorded: validFeedRedacted.feedValueRecorded === true,
    syntheticChannelValueRecorded: validFeedRedacted.channelValueRecorded === true,
    currentEnvironmentFeedChannelReady: updateFeedConfig.currentEnvironmentReady === true,
    realAutoUpdateReady: autoUpdateReadiness.autoUpdateReady === true,
    realAutoUpdateBlocked,
    realAutoUpdateBlockerRows: autoUpdateBlockerRows,
    realAutoUpdateBlockerCount: autoUpdateBlockerRows.length,
    updaterIntegrationReady: autoUpdateReadiness.checks?.updaterIntegrationReady === true,
    updateProviderReady: autoUpdateReadiness.checks?.providerReady === true,
    updateFeedConfigReady: autoUpdateReadiness.checks?.updateFeedConfigReady === true,
    updateMetadataPolicyReady: autoUpdateReadiness.checks?.updateMetadataPolicyReady === true,
    updateMetadataFilesReady: autoUpdateReadiness.checks?.updateMetadataFilesReady === true,
    signedUpdateArtifactsReady: autoUpdateReadiness.checks?.signedUpdateArtifactsReady === true,
    userFacingUpdateBehaviorReady: autoUpdateReadiness.checks?.userFacingUpdateBehaviorReady === true,
    selectedUpdateArtifactSource: textValue(autoUpdateReadiness.artifacts?.selectedUpdateArtifactSource),
    selectedUpdateArtifactFallbackReason: textValue(autoUpdateReadiness.artifacts?.selectedUpdateArtifactFallbackReason),
    requiredUpdateFeedKeys: updateFeedKeys,
    requiredUpdateFeedKeyCount: updateFeedKeys.length,
    transitionRows,
    transitionRowCount: transitionRows.length,
    hardGateCommand: textValue(releaseChannelTransition.hardGateCommand, "npm run release:external-check"),
    hardGateReady: releaseChannelTransition.hardGateReady === true,
    hardGateWouldFail: releaseChannelTransition.hardGateWouldFail !== false,
    currentTenPlanProgressLabel: textValue(releaseChannelTransition.currentTenPlanProgressLabel),
    currentTenPlanWindowCompletedCount: integerValue(releaseChannelTransition.currentTenPlanWindowCompletedCount),
    tenPlanProgressReportDue: releaseChannelTransition.tenPlanProgressReportDue === true,
    userFacingCompletionPercent: Number(releaseChannelTransition.userFacingCompletionPercent ?? 99.999999),
    userFacingRemainingPercent: Number(releaseChannelTransition.userFacingRemainingPercent ?? 0.000001),
    privateValuesRecorded: false,
    feedValueRecorded: false,
    channelValueRecorded: false,
    localEnvValueRecorded: false,
    networkProbeAttempted: false,
    updateFeedPublishAttempted: false,
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
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Auto-Update Transition Smoke

## Status

- Transition receipt ready: ${readyLabel(report.releaseAutoUpdateTransitionReady)}
- Release-channel transition ready: ${readyLabel(report.releaseChannelClearanceTransitionReady)}
- Release-channel current blocker: ${report.releaseChannelCurrentPriorityActionId}
- Release-channel placeholder keys: ${report.releaseChannelCurrentPlaceholderKeyCount}
- Next priority action: ${report.releaseChannelNextPriorityActionId}
- Next action proof command: \`${report.releaseChannelNextActionProofCommand}\`
- Synthetic feed/channel config ready: ${readyLabel(report.syntheticFeedChannelConfigReady)}
- Synthetic feed key: ${report.syntheticFeedKey}
- Synthetic channel key: ${report.syntheticChannelKey}
- Synthetic feed value recorded: ${readyLabel(report.syntheticFeedValueRecorded)}
- Synthetic channel value recorded: ${readyLabel(report.syntheticChannelValueRecorded)}
- Real auto-update ready: ${readyLabel(report.realAutoUpdateReady)}
- Real auto-update blocked: ${readyLabel(report.realAutoUpdateBlocked)}
- Auto-update blocker rows: ${report.realAutoUpdateBlockerCount}
- Updater integration ready: ${readyLabel(report.updaterIntegrationReady)}
- Update provider ready: ${readyLabel(report.updateProviderReady)}
- Update feed config ready: ${readyLabel(report.updateFeedConfigReady)}
- Update metadata policy ready: ${readyLabel(report.updateMetadataPolicyReady)}
- Update metadata files ready: ${readyLabel(report.updateMetadataFilesReady)}
- Signed update artifacts ready: ${readyLabel(report.signedUpdateArtifactsReady)}
- User-facing update behavior ready: ${readyLabel(report.userFacingUpdateBehaviorReady)}
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate ready: ${readyLabel(report.hardGateReady)}
- Hard gate would fail: ${readyLabel(report.hardGateWouldFail)}
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- Private values recorded: no
- Feed values recorded: no
- Channel values recorded: no
- Network probe attempted: no
- Update feed publish attempted: no
- Release upload attempted: no
- Signing attempted: no
- Apple notary submission attempted: no
- Auto-update claimed: no
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

## Real Auto-Update Blockers

| order | blocker | proof command | hard gate | value recorded |
|---:|---|---|---|---:|
${formatBlockerRows(report.realAutoUpdateBlockerRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this transition smoke.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.releaseAutoUpdateTransitionReady === true, "release auto-update transition should be ready");
  check(report.transitionRefreshCommandCount === 3, "release auto-update transition should include three refresh commands");
  check(report.transitionRefreshCommands.every((row) => row.valueRecorded === false), "release auto-update transition refresh commands should be value-free");
  check(report.sourceArtifactRowCount === 3, "release auto-update transition should include three source artifacts");
  check(report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false), "release auto-update transition source rows should be present, ready, and value-free");
  check(report.releaseChannelClearanceTransitionReady === true, "release auto-update transition should include release-channel clearance transition readiness");
  check(report.releaseChannelCurrentPriorityActionId === "release-channel-metadata", "release auto-update transition should keep release-channel metadata as the current real blocker");
  check(report.releaseChannelCurrentPlaceholderKeyCount === 4, "release auto-update transition should mirror four release-channel placeholders");
  check(report.releaseChannelSyntheticClearanceReady === true, "release auto-update transition should include synthetic release-channel clearance readiness");
  check(report.releaseChannelNextPriorityActionId === "auto-update-feed", "release auto-update transition should point to auto-update feed as next priority action");
  check(report.releaseChannelNextActionProofCommand === "npm run desktop:auto-update-readiness-smoke", "release auto-update transition should keep auto-update readiness proof command");
  check(report.syntheticFeedChannelConfigReady === true, "release auto-update transition should prove synthetic feed/channel config readiness");
  check(report.syntheticFeedChannelCaseName === "valid GrooveForge feed and channel", "release auto-update transition should use the valid GrooveForge feed/channel case");
  check(report.syntheticFeedKey === "GROOVEFORGE_UPDATE_FEED_URL", "release auto-update transition should use the primary GrooveForge update feed key in the synthetic ready case");
  check(report.syntheticChannelKey === "GROOVEFORGE_UPDATE_CHANNEL", "release auto-update transition should use the primary GrooveForge update channel key in the synthetic ready case");
  check(report.syntheticFeedUrlPresent === true, "release auto-update transition should prove synthetic feed URL presence");
  check(report.syntheticFeedUrlValid === true, "release auto-update transition should prove synthetic feed URL validity");
  check(report.syntheticReleaseChannelPresent === true, "release auto-update transition should prove synthetic update channel presence");
  check(report.syntheticReleaseChannelValid === true, "release auto-update transition should prove synthetic update channel validity");
  check(report.syntheticFeedValueRecorded === false, "release auto-update transition should not record synthetic feed values");
  check(report.syntheticChannelValueRecorded === false, "release auto-update transition should not record synthetic channel values");
  check(report.syntheticPresentEnvironmentKeyCount === 2, "release auto-update transition should report two selected synthetic env keys");
  check(report.requiredUpdateFeedKeyCount === 6, "release auto-update transition should list six update feed/channel keys");
  check(report.realAutoUpdateReady === false, "release auto-update transition should keep real auto-update readiness false while blockers remain");
  check(report.realAutoUpdateBlocked === true, "release auto-update transition should report real auto-update blockers");
  check(report.realAutoUpdateBlockerCount > 0, "release auto-update transition should include blocker rows");
  check(report.realAutoUpdateBlockerRows.every((row) => row.valueRecorded === false), "release auto-update transition blocker rows should be value-free");
  check(report.updaterIntegrationReady === true, "release auto-update transition should keep updater integration ready");
  check(report.userFacingUpdateBehaviorReady === true, "release auto-update transition should keep user-facing update behavior ready");
  check(report.signedUpdateArtifactsReady === false, "release auto-update transition should keep signed update artifacts unready");
  check(report.transitionRowCount === 4, "release auto-update transition should include four transition rows");
  check(report.transitionRows.every((row) => row.ready === true && row.valueRecorded === false), "release auto-update transition rows should be ready and value-free");
  check(report.hardGateCommand === "npm run release:external-check", "release auto-update transition should keep hard external gate command");
  check(report.hardGateReady === false, "release auto-update transition should keep hard gate unready");
  check(report.hardGateWouldFail === true, "release auto-update transition should keep hard gate would-fail posture");
  check(report.userFacingCompletionPercent === 99.999999, "release auto-update transition should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "release auto-update transition should preserve remaining percent");
  check(report.privateValuesRecorded === false, "release auto-update transition should not record private values");
  check(report.feedValueRecorded === false, "release auto-update transition should not record feed values");
  check(report.channelValueRecorded === false, "release auto-update transition should not record channel values");
  check(report.networkProbeAttempted === false, "release auto-update transition should not probe network");
  check(report.updateFeedPublishAttempted === false, "release auto-update transition should not publish update feeds");
  check(report.releaseUploadAttempted === false, "release auto-update transition should not upload releases");
  check(report.signingAttempted === false, "release auto-update transition should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release auto-update transition should not submit to Apple");
  check(report.claimedAutoUpdate === false, "release auto-update transition should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release auto-update transition should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "release auto-update transition JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release auto-update transition Markdown should not include URL values");
  check(!serialized.includes("updates.grooveforge.example"), "release auto-update transition JSON should not include synthetic feed host values");
  check(!markdown.includes("updates.grooveforge.example"), "release auto-update transition Markdown should not include synthetic feed host values");
  check(!serialized.includes("direct-download"), "release auto-update transition JSON should not include distribution channel values");
  check(!markdown.includes("direct-download"), "release auto-update transition Markdown should not include distribution channel values");
  check(!serialized.includes("stable/prod"), "release auto-update transition JSON should not include invalid channel sample values");
  check(!markdown.includes("stable/prod"), "release auto-update transition Markdown should not include invalid channel sample values");
  check(markdown.includes("Release Auto-Update Transition Smoke"), "release auto-update transition Markdown should include title");
  check(markdown.includes("Synthetic feed/channel config ready:"), "release auto-update transition Markdown should include synthetic readiness");
  check(markdown.includes("Real auto-update blocked:"), "release auto-update transition Markdown should include real blocker posture");
  check(markdown.includes("Auto-update claimed: no"), "release auto-update transition Markdown should keep auto-update unclaimed");
  check(markdown.includes("External distribution claimed: no"), "release auto-update transition Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }
}

for (const row of transitionRefreshCommands) {
  console.log(`Refreshing release auto-update transition evidence: ${row.command}`);
  runNpmScript(row.command);
}

const releaseChannelTransition = await readJsonRequired(releaseChannelTransitionJsonPath, "Release-channel clearance transition");
const updateFeedConfig = await readJsonRequired(updateFeedConfigJsonPath, "Update feed config");
const autoUpdateReadiness = await readJsonRequired(autoUpdateReadinessJsonPath, "Auto-update readiness");
const report = buildReport({ releaseChannelTransition, updateFeedConfig, autoUpdateReadiness });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(transitionMarkdownPath, markdown, "utf8");
await writeFile(transitionJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release auto-update transition smoke passed.");
console.log(`- Markdown: ${relative(transitionMarkdownPath)}`);
console.log(`- JSON: ${relative(transitionJsonPath)}`);
console.log(`- Transition ready: ${report.releaseAutoUpdateTransitionReady ? "yes" : "no"}`);
console.log(`- Release-channel transition ready: ${report.releaseChannelClearanceTransitionReady ? "yes" : "no"}`);
console.log(`- Next priority action: ${report.releaseChannelNextPriorityActionId}`);
console.log(`- Synthetic feed/channel config ready: ${report.syntheticFeedChannelConfigReady ? "yes" : "no"}`);
console.log(`- Real auto-update ready: ${report.realAutoUpdateReady ? "yes" : "no"}`);
console.log(`- Real auto-update blocker rows: ${report.realAutoUpdateBlockerCount}`);
console.log(`- Signed update artifacts ready: ${report.signedUpdateArtifactsReady ? "yes" : "no"}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
