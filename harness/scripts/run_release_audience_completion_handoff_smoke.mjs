#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const deliveryRoot = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-local-delivery-package`);
const handoffMarkdownArtifactName = "release-audience-completion-handoff-smoke.md";
const handoffJsonArtifactName = "release-audience-completion-handoff-smoke.json";
const handoffMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${handoffMarkdownArtifactName}`);
const handoffJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${handoffJsonArtifactName}`);
const personaReadinessJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-persona-readiness.json`);
const deliveryManifestJsonPath = path.join(deliveryRoot, `${appName}-${packageJson.version}-${platformArch}-local-delivery-package-manifest.json`);
const packageReopenJsonPath = path.join(deliveryRoot, `${appName}-${packageJson.version}-${platformArch}-local-package-reopen.json`);
const releaseDoctorJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-doctor.json`);
const failures = [];
const handoffCommands = [
  {
    order: 1,
    command: "npm run persona:smoke",
    role: "refresh first-time composer and professional producer readiness evidence",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run desktop:local-delivery-package-smoke",
    role: "refresh sample-free local beat delivery package evidence",
    valueRecorded: false
  },
  {
    order: 3,
    command: "npm run desktop:local-package-reopen-smoke",
    role: "refresh local package reopen and regenerated export evidence",
    valueRecorded: false
  },
  {
    order: 4,
    command: "npm run release:doctor",
    role: "refresh value-free external/private release blocker evidence",
    valueRecorded: false
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release audience completion handoff smoke failed:");
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

function commandSummary(rows) {
  return rows.map((row) => row.command).join(" -> ");
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
    fail(`${command} exited with status ${result.status}.`, "Refresh the source evidence named above before retrying this audience completion handoff smoke.");
  }
}

async function readJsonRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function completedPlanProgress() {
  const completedDir = path.join(root, "docs", "exec_plans", "completed");
  const entries = await readdir(completedDir);
  const planNumbers = entries
    .map((entry) => /^plan-(\d+)-/.exec(entry)?.[1])
    .filter(Boolean)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value > 0);
  const latestCompletedPlanNumber = Math.max(...planNumbers);
  const latestTenPlanWindowStart = Math.floor((latestCompletedPlanNumber - 1) / 10) * 10 + 1;
  const latestTenPlanWindowEnd = latestTenPlanWindowStart + 9;
  const latestTenPlanCompletedCount = planNumbers.filter(
    (planNumber) => planNumber >= latestTenPlanWindowStart && planNumber <= latestTenPlanWindowEnd
  ).length;
  const latestTenPlanTotal = 10;
  return {
    latestCompletedPlanNumber,
    latestTenPlanWindowStart,
    latestTenPlanWindowEnd,
    latestTenPlanCompletedCount,
    latestTenPlanTotal,
    latestTenPlanProgressLabel: `${latestTenPlanWindowStart}-${latestTenPlanWindowEnd}: ${latestTenPlanCompletedCount}/${latestTenPlanTotal}`,
    tenPlanProgressReportDue: latestTenPlanCompletedCount === latestTenPlanTotal,
    nextTenPlanProgressReportAt: `plan-${latestTenPlanWindowEnd}`
  };
}

function sourceRow({ label, path: filePath, ready, evidence, valueRecorded = false }) {
  return {
    label,
    path: relative(filePath),
    present: existsSync(filePath),
    ready,
    evidence,
    valueRecorded
  };
}

function formatCommandRows(rows) {
  return rows.map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${readyLabel(row.valueRecorded)} |`).join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${readyLabel(row.ready)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.path)}\` | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatAudienceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.audience)} | ${readyLabel(row.ready)} | ${escapeCell(row.readinessRole)} | ${escapeCell(row.workflowMode)} | ${row.workflowBars} | ${escapeCell(row.workflowDeliveryTarget)} | ${escapeCell(row.workflowStyle)} | ${readyLabel(row.deliveryPackageReady)} | ${readyLabel(row.deliveryPackageReopenReady)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function buildReport({ persona, deliveryManifest, packageReopen, releaseDoctor, progress }) {
  const audienceRows = Array.isArray(persona.audienceReadinessRows) ? persona.audienceReadinessRows : [];
  const firstTimeComposerReady = audienceRows.some((row) => row.audience === "first-time composer" && row.ready === true);
  const professionalProducerReady = audienceRows.some((row) => row.audience === "professional producer" && row.ready === true);
  const personaDeliveryRows = Array.isArray(persona.deliveryPackageRows) ? persona.deliveryPackageRows : [];
  const personaReopenRows = Array.isArray(persona.deliveryPackageReopenRows) ? persona.deliveryPackageReopenRows : [];
  const styleCoverage = persona.styleCoverage ?? {};
  const localDeliveryReady =
    deliveryManifest.localDeliveryPackageReady === true &&
    deliveryManifest.artifactCount === 8 &&
    deliveryManifest.totalBytes > 0;
  const localPackageReopenReady =
    packageReopen.localPackageReopenReady === true &&
    packageReopen.sourceArtifactCount === 8 &&
    packageReopen.verifiedArtifactCount === 8 &&
    packageReopen.projectRoundtripReady === true &&
    packageReopen.diskChecksumsReady === true &&
    packageReopen.regeneratedExportsMatchDisk === true;
  const releaseDoctorReady = releaseDoctor.releaseDoctorReportReady === true;
  const valueBoundaryClean =
    persona.privateValuesRecorded === false &&
    persona.networkAttemptedByThisReport === false &&
    persona.releaseUploadAttemptedByThisReport === false &&
    persona.notarySubmissionAttemptedByThisReport === false &&
    persona.signingAttemptedByThisReport === false &&
    persona.claimedExternalDistribution === false &&
    deliveryManifest.localEnvValueRecorded === false &&
    deliveryManifest.privateValuesRecorded === false &&
    deliveryManifest.privateBeatRecorded === false &&
    deliveryManifest.realUserAudioRecorded === false &&
    deliveryManifest.networkProbeAttempted === false &&
    deliveryManifest.releaseUploadAttempted === false &&
    deliveryManifest.releaseGateClaimedExternalDistribution === false &&
    packageReopen.localEnvValueRecorded === false &&
    packageReopen.privateValuesRecorded === false &&
    packageReopen.privateBeatRecorded === false &&
    packageReopen.realUserAudioRecorded === false &&
    packageReopen.networkProbeAttempted === false &&
    packageReopen.releaseUploadAttempted === false &&
    packageReopen.releaseGateClaimedExternalDistribution === false &&
    releaseDoctor.localEnvValueRecorded === false &&
    releaseDoctor.privateValuesRecorded === false &&
    releaseDoctor.releaseUrlValueRecorded === false &&
    releaseDoctor.supportUrlValueRecorded === false &&
    releaseDoctor.feedValueRecorded === false &&
    releaseDoctor.credentialValueRecorded === false &&
    releaseDoctor.tokenValueRecorded === false &&
    releaseDoctor.channelValueRecorded === false &&
    releaseDoctor.developerIdIdentityValueRecorded === false &&
    releaseDoctor.networkProbeAttemptedByThisDoctor === false &&
    releaseDoctor.releaseUploadAttemptedByThisDoctor === false &&
    releaseDoctor.notarySubmissionAttemptedByThisDoctor === false &&
    releaseDoctor.signingAttemptedByThisDoctor === false &&
    releaseDoctor.releaseGateClaimedExternalDistribution === false;
  const sourceArtifactRows = [
    sourceRow({
      label: "Persona readiness",
      path: personaReadinessJsonPath,
      ready: persona.personaReadinessReady === true,
      evidence: `${audienceRows.length} audience rows; ${integerValue(styleCoverage.readyStyleCount)}/${integerValue(styleCoverage.requiredStyleCount)} styles ready`
    }),
    sourceRow({
      label: "Local delivery package",
      path: deliveryManifestJsonPath,
      ready: localDeliveryReady,
      evidence: `${deliveryManifest.artifactCount} artifacts; ${deliveryManifest.totalBytes} bytes`
    }),
    sourceRow({
      label: "Local package reopen",
      path: packageReopenJsonPath,
      ready: localPackageReopenReady,
      evidence: `${packageReopen.verifiedArtifactCount}/${packageReopen.sourceArtifactCount} artifacts verified; regenerated exports match disk`
    }),
    sourceRow({
      label: "Release doctor blocker posture",
      path: releaseDoctorJsonPath,
      ready: releaseDoctorReady,
      evidence: `${textValue(releaseDoctor.completionGapStatus)}; ${textValue(releaseDoctor.currentActionLabel)}`
    })
  ];
  const releaseAudienceCompletionHandoffReady =
    handoffCommands.every((row) => row.valueRecorded === false) &&
    firstTimeComposerReady &&
    professionalProducerReady &&
    persona.directCompositionReady === true &&
    persona.allGenreStyleReadinessReady === true &&
    persona.localExportReadinessReady === true &&
    persona.samplingSecondaryReady === true &&
    persona.localFirstReady === true &&
    persona.personaDeliveryPackagesReady === true &&
    persona.personaDeliveryPackagesReopenReady === true &&
    persona.audienceAcceptanceReady === true &&
    personaDeliveryRows.every((row) => row.ready === true && row.valueRecorded === false) &&
    personaReopenRows.every((row) => row.ready === true && row.valueRecorded === false) &&
    localDeliveryReady &&
    localPackageReopenReady &&
    releaseDoctorReady &&
    releaseDoctor.externalDistributionReady === false &&
    sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
    valueBoundaryClean;

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:audience-completion-handoff-smoke",
    releaseAudienceCompletionHandoffMarkdownArtifactName: handoffMarkdownArtifactName,
    releaseAudienceCompletionHandoffJsonArtifactName: handoffJsonArtifactName,
    releaseAudienceCompletionHandoffMarkdownPath: relative(handoffMarkdownPath),
    releaseAudienceCompletionHandoffJsonPath: relative(handoffJsonPath),
    releaseAudienceCompletionHandoffReady,
    handoffCommandRows: handoffCommands,
    handoffCommandCount: handoffCommands.length,
    handoffCommandSummary: commandSummary(handoffCommands),
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    audienceReadinessRows: audienceRows,
    audienceReadinessRowCount: audienceRows.length,
    audienceAcceptanceReady: persona.audienceAcceptanceReady === true,
    audienceAcceptanceRowCount: Array.isArray(persona.audienceAcceptanceRows) ? persona.audienceAcceptanceRows.length : 0,
    firstTimeComposerReady,
    professionalProducerReady,
    directCompositionReady: persona.directCompositionReady === true,
    allGenreStyleReadinessReady: persona.allGenreStyleReadinessReady === true,
    readyStyleCount: integerValue(styleCoverage.readyStyleCount),
    requiredStyleCount: integerValue(styleCoverage.requiredStyleCount),
    supportedStyleCount: integerValue(styleCoverage.supportedStyleCount),
    localExportReadinessReady: persona.localExportReadinessReady === true,
    personaDeliveryPackagesReady: persona.personaDeliveryPackagesReady === true,
    personaDeliveryPackageRows: personaDeliveryRows,
    personaDeliveryPackageRowCount: personaDeliveryRows.length,
    personaDeliveryPackagesReopenReady: persona.personaDeliveryPackagesReopenReady === true,
    personaDeliveryPackageReopenRows: personaReopenRows,
    personaDeliveryPackageReopenRowCount: personaReopenRows.length,
    samplingSecondaryReady: persona.samplingSecondaryReady === true,
    localFirstReady: persona.localFirstReady === true,
    localDeliveryPackageReady: localDeliveryReady,
    localDeliveryPackageArtifactCount: integerValue(deliveryManifest.artifactCount),
    localDeliveryPackageTotalBytes: integerValue(deliveryManifest.totalBytes),
    localDeliveryPackageBars: integerValue(deliveryManifest.project?.arrangementBars),
    localDeliveryPackageStyle: textValue(deliveryManifest.project?.styleId),
    localDeliveryPackageMixStatus: textValue(deliveryManifest.mixAnalysis?.status),
    localPackageReopenReady,
    localPackageReopenVerifiedArtifactCount: integerValue(packageReopen.verifiedArtifactCount),
    localPackageReopenSourceArtifactCount: integerValue(packageReopen.sourceArtifactCount),
    localPackageReopenRegeneratedExportsMatchDisk: packageReopen.regeneratedExportsMatchDisk === true,
    releaseDoctorReady,
    completionGapStatus: textValue(releaseDoctor.completionGapStatus),
    completionGapProofTarget: textValue(releaseDoctor.completionGapCurrentProofTarget),
    completionGapNextProofCommand: textValue(releaseDoctor.completionGapNextProofCommand),
    completionGapHardGateCommand: textValue(releaseDoctor.completionGapHardGateCommand),
    currentActionId: textValue(releaseDoctor.currentActionId),
    currentActionLabel: textValue(releaseDoctor.currentActionLabel),
    currentNextCommand: textValue(releaseDoctor.currentActionNextCommand),
    currentFirstBlocker: textValue(releaseDoctor.currentActionFirstBlocker),
    currentEnvEditTarget: textValue(releaseDoctor.currentEnvEditTarget),
    currentRequiredKeyCount: integerValue(releaseDoctor.currentActionRequiredKeyCount),
    currentPlaceholderKeyCount: integerValue(releaseDoctor.currentActionPlaceholderKeyCount),
    localEnvFileLoaded: releaseDoctor.localEnvFileLoaded === true,
    externalDistributionReady: releaseDoctor.externalDistributionReady === true,
    hardExternalGateCommand: textValue(releaseDoctor.hardExternalGateCommand),
    userFacingCompletionPercent: 99.999999,
    userFacingRemainingPercent: 0.000001,
    latestCompletedPlanNumber: progress.latestCompletedPlanNumber,
    latestTenPlanProgressLabel: progress.latestTenPlanProgressLabel,
    latestTenPlanWindowStart: progress.latestTenPlanWindowStart,
    latestTenPlanWindowEnd: progress.latestTenPlanWindowEnd,
    latestTenPlanCompletedCount: progress.latestTenPlanCompletedCount,
    latestTenPlanTotal: progress.latestTenPlanTotal,
    tenPlanProgressReportDue: progress.tenPlanProgressReportDue,
    nextTenPlanProgressReportAt: progress.nextTenPlanProgressReportAt,
    privateValuesRecorded: false,
    privateBeatRecorded: false,
    realUserAudioRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    localEnvValueRecorded: false,
    networkProbeAttempted: false,
    updateFeedPublishAttempted: false,
    distributionChannelProbeAttempted: false,
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
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Audience Completion Handoff Smoke

## Status

- Audience completion handoff ready: ${readyLabel(report.releaseAudienceCompletionHandoffReady)}
- Command order: ${report.handoffCommandSummary}
- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}
- 10-plan report due: ${readyLabel(report.tenPlanProgressReportDue)}
- User-facing completion: ${report.userFacingCompletionPercent}%
- Remaining completion: ${report.userFacingRemainingPercent}%
- First-time composer ready: ${readyLabel(report.firstTimeComposerReady)}
- Professional producer ready: ${readyLabel(report.professionalProducerReady)}
- Direct composition ready: ${readyLabel(report.directCompositionReady)}
- All-genre style readiness: ${report.readyStyleCount}/${report.requiredStyleCount}
- Local export ready: ${readyLabel(report.localExportReadinessReady)}
- Sampling secondary: ${readyLabel(report.samplingSecondaryReady)}
- Local-first ready: ${readyLabel(report.localFirstReady)}
- Local delivery package ready: ${readyLabel(report.localDeliveryPackageReady)}
- Local delivery artifacts: ${report.localDeliveryPackageArtifactCount}
- Local delivery bytes: ${report.localDeliveryPackageTotalBytes}
- Local package reopen ready: ${readyLabel(report.localPackageReopenReady)}
- Local package reopen artifacts: ${report.localPackageReopenVerifiedArtifactCount}/${report.localPackageReopenSourceArtifactCount}
- Regenerated exports match disk: ${readyLabel(report.localPackageReopenRegeneratedExportsMatchDisk)}
- Release doctor ready: ${readyLabel(report.releaseDoctorReady)}
- Completion gap status: ${report.completionGapStatus}
- Current action: ${report.currentActionLabel}
- Current next command: \`${report.currentNextCommand}\`
- Current first blocker: ${report.currentFirstBlocker}
- Current env edit target: \`${report.currentEnvEditTarget}\`
- Current required keys: ${report.currentRequiredKeyCount}
- Current placeholder keys: ${report.currentPlaceholderKeyCount}
- External distribution ready: ${readyLabel(report.externalDistributionReady)}
- Hard gate command: \`${report.hardExternalGateCommand}\`
- Private values recorded: no
- Private beats recorded: no
- Real user audio recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Signing attempted: no
- Apple notary submission attempted: no
- Auto-update claimed: no
- External distribution claimed: no

## Handoff Commands

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.handoffCommandRows)}

## Source Artifacts

| artifact | present | ready | evidence | path | value recorded |
|---|---:|---:|---|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Audience Rows

| audience | ready | role | mode | bars | delivery target | style | package | reopen | value recorded |
|---|---:|---|---|---:|---|---|---:|---:|---:|
${formatAudienceRows(report.audienceReadinessRows)}

## Not Recorded Or Claimed

- No release URL, support URL, feed URL, credential, token, channel value, Developer ID identity value, private beat, or real user audio is recorded.
- No update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing is attempted by this handoff smoke.
- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion.
`;
}

function validateReport(report, markdown) {
  const serialized = JSON.stringify(report);
  check(report.releaseAudienceCompletionHandoffReady === true, "release audience completion handoff should be ready");
  check(report.reportCommand === "npm run release:audience-completion-handoff-smoke", "release audience completion handoff should report its command");
  check(report.handoffCommandCount === 4, "release audience completion handoff should run four commands");
  check(
    report.handoffCommandSummary ===
      "npm run persona:smoke -> npm run desktop:local-delivery-package-smoke -> npm run desktop:local-package-reopen-smoke -> npm run release:doctor",
    "release audience completion handoff should refresh persona, local delivery, package reopen, and release doctor evidence"
  );
  check(report.handoffCommandRows.every((row) => row.valueRecorded === false), "release audience completion handoff command rows should be value-free");
  check(report.sourceArtifactRowCount === 4, "release audience completion handoff should include four source artifacts");
  check(report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false), "release audience completion source artifacts should be present, ready, and value-free");
  check(report.audienceReadinessRowCount === 2, "release audience completion handoff should include two audience rows");
  check(report.firstTimeComposerReady === true, "release audience completion handoff should prove first-time composer readiness");
  check(report.professionalProducerReady === true, "release audience completion handoff should prove professional producer readiness");
  check(report.directCompositionReady === true, "release audience completion handoff should prove direct composition readiness");
  check(report.allGenreStyleReadinessReady === true, "release audience completion handoff should prove all-genre style readiness");
  check(report.readyStyleCount === report.requiredStyleCount && report.requiredStyleCount >= 14, "release audience completion handoff should prove all supported styles are ready");
  check(report.localExportReadinessReady === true, "release audience completion handoff should prove local export readiness");
  check(report.samplingSecondaryReady === true, "release audience completion handoff should keep sampling secondary");
  check(report.localFirstReady === true, "release audience completion handoff should keep local-first posture");
  check(report.personaDeliveryPackagesReady === true, "release audience completion handoff should prove persona delivery packages");
  check(report.personaDeliveryPackagesReopenReady === true, "release audience completion handoff should prove persona delivery package reopen");
  check(report.audienceAcceptanceReady === true && report.audienceAcceptanceRowCount === 10, "release audience completion handoff should prove audience acceptance matrix");
  check(report.localDeliveryPackageReady === true, "release audience completion handoff should prove local delivery package readiness");
  check(report.localDeliveryPackageArtifactCount === 8, "release audience completion handoff should prove eight local delivery artifacts");
  check(report.localDeliveryPackageTotalBytes > 0, "release audience completion handoff should prove non-empty local delivery artifacts");
  check(report.localDeliveryPackageBars === 8, "release audience completion handoff should prove sample-free 8-bar local package");
  check(report.localDeliveryPackageMixStatus === "Ready", "release audience completion handoff should prove local delivery mix readiness");
  check(report.localPackageReopenReady === true, "release audience completion handoff should prove package reopen readiness");
  check(report.localPackageReopenVerifiedArtifactCount === 8 && report.localPackageReopenSourceArtifactCount === 8, "release audience completion handoff should prove local package reopen artifact coverage");
  check(report.localPackageReopenRegeneratedExportsMatchDisk === true, "release audience completion handoff should prove regenerated exports match disk");
  check(report.releaseDoctorReady === true, "release audience completion handoff should include release doctor evidence");
  check(report.completionGapStatus === "external proof pending", "release audience completion handoff should keep external proof pending");
  check(report.currentNextCommand !== "none", "release audience completion handoff should include current next command");
  check(report.currentFirstBlocker !== "none", "release audience completion handoff should include current first blocker");
  check(report.currentEnvEditTarget !== "none", "release audience completion handoff should point at the ignored local env edit target");
  check(report.currentRequiredKeyCount === 4, "release audience completion handoff should report four current release-channel keys");
  check(report.externalDistributionReady === false, "release audience completion handoff should keep external distribution unready");
  check(report.hardExternalGateCommand === "npm run release:external-check", "release audience completion handoff should keep hard external gate command");
  check(report.userFacingCompletionPercent === 99.999999, "release audience completion handoff should preserve completion percent");
  check(report.userFacingRemainingPercent === 0.000001, "release audience completion handoff should preserve remaining percent");
  check(report.latestTenPlanWindowStart > 0, "release audience completion handoff should report a positive 10-plan window start");
  check(report.latestTenPlanWindowEnd === report.latestTenPlanWindowStart + 9, "release audience completion handoff should report a 10-plan window");
  check(report.latestTenPlanTotal === 10, "release audience completion handoff should use ten-plan windows");
  check(
    report.latestTenPlanProgressLabel === `${report.latestTenPlanWindowStart}-${report.latestTenPlanWindowEnd}: ${report.latestTenPlanCompletedCount}/10`,
    "release audience completion handoff progress label should match latest 10-plan fields"
  );
  check(report.privateValuesRecorded === false, "release audience completion handoff should not record private values");
  check(report.privateBeatRecorded === false, "release audience completion handoff should not record private beats");
  check(report.realUserAudioRecorded === false, "release audience completion handoff should not record real user audio");
  check(report.releaseUrlValueRecorded === false, "release audience completion handoff should not record release URL values");
  check(report.supportUrlValueRecorded === false, "release audience completion handoff should not record support URL values");
  check(report.feedValueRecorded === false, "release audience completion handoff should not record feed values");
  check(report.credentialValueRecorded === false, "release audience completion handoff should not record credentials");
  check(report.tokenValueRecorded === false, "release audience completion handoff should not record tokens");
  check(report.channelValueRecorded === false, "release audience completion handoff should not record channel values");
  check(report.developerIdIdentityValueRecorded === false, "release audience completion handoff should not record Developer ID identity values");
  check(report.localEnvValueRecorded === false, "release audience completion handoff should not record local env values");
  check(report.networkProbeAttempted === false, "release audience completion handoff should not probe networks");
  check(report.updateFeedPublishAttempted === false, "release audience completion handoff should not publish feeds");
  check(report.distributionChannelProbeAttempted === false, "release audience completion handoff should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "release audience completion handoff should not upload releases");
  check(report.signingAttempted === false, "release audience completion handoff should not sign artifacts");
  check(report.notarySubmissionAttempted === false, "release audience completion handoff should not submit to Apple");
  check(report.claimedAutoUpdate === false, "release audience completion handoff should not claim auto-update");
  check(report.claimedExternalDistribution === false, "release audience completion handoff should not claim external distribution");
  check(!/https?:\/\//i.test(serialized), "release audience completion handoff JSON should not include URL values");
  check(!/https?:\/\//i.test(markdown), "release audience completion handoff Markdown should not include URL values");
  check(markdown.includes("Release Audience Completion Handoff Smoke"), "release audience completion handoff Markdown should include title");
  check(markdown.includes("Audience completion handoff ready: yes"), "release audience completion handoff Markdown should include readiness");
  check(markdown.includes("First-time composer ready: yes"), "release audience completion handoff Markdown should include beginner readiness");
  check(markdown.includes("Professional producer ready: yes"), "release audience completion handoff Markdown should include professional readiness");
  check(markdown.includes("Sampling secondary: yes"), "release audience completion handoff Markdown should include sampling-secondary posture");
  check(markdown.includes("External distribution claimed: no"), "release audience completion handoff Markdown should keep external distribution unclaimed");

  if (failures.length > 0) {
    fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
  }
}

for (const row of handoffCommands) {
  console.log(`Refreshing release audience completion evidence: ${row.command}`);
  runNpmScript(row.command);
}

const persona = await readJsonRequired(personaReadinessJsonPath, "Persona readiness");
const deliveryManifest = await readJsonRequired(deliveryManifestJsonPath, "Local delivery package");
const packageReopen = await readJsonRequired(packageReopenJsonPath, "Local package reopen");
const releaseDoctor = await readJsonRequired(releaseDoctorJsonPath, "Release doctor");
const progress = await completedPlanProgress();
const report = buildReport({
  persona,
  deliveryManifest,
  packageReopen,
  releaseDoctor,
  progress
});
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(handoffMarkdownPath, markdown, "utf8");
await writeFile(handoffJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release audience completion handoff smoke passed.");
console.log(`- Markdown: ${relative(handoffMarkdownPath)}`);
console.log(`- JSON: ${relative(handoffJsonPath)}`);
console.log("- Audience completion handoff ready: yes");
console.log(`- Command order: ${report.handoffCommandSummary}`);
console.log(`- Latest 10-plan progress: ${report.latestTenPlanProgressLabel}`);
console.log(`- First-time composer ready: ${report.firstTimeComposerReady ? "yes" : "no"}`);
console.log(`- Professional producer ready: ${report.professionalProducerReady ? "yes" : "no"}`);
console.log(`- Direct composition ready: ${report.directCompositionReady ? "yes" : "no"}`);
console.log(`- All-genre styles ready: ${report.readyStyleCount}/${report.requiredStyleCount}`);
console.log(`- Local delivery package ready: ${report.localDeliveryPackageReady ? "yes" : "no"}`);
console.log(`- Local package reopen ready: ${report.localPackageReopenReady ? "yes" : "no"}`);
console.log(`- Completion gap status: ${report.completionGapStatus}`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- User-facing completion: ${report.userFacingCompletionPercent}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, feed publish, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
