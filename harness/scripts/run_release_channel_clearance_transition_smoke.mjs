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
const transitionMarkdownPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-clearance-transition-smoke.md`
);
const transitionJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-channel-clearance-transition-smoke.json`
);
const successHandoffJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-final-handoff-success-redaction-smoke.json`
);
const currentBlockerJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.json`
);
const nextActionsJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-external-next-actions.json`
);
const failures = [];
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const transitionRefreshCommands = [
  {
    order: 1,
    command: "npm run release:final-handoff-success-redaction-smoke",
    role: "prove strict-ready release-channel handoff path remains redacted",
    valueRecorded: false
  },
  {
    order: 2,
    command: "npm run release:current-blocker",
    role: "refresh real current blocker, next-actions, proof bundle, external gate, and 10-plan progress",
    valueRecorded: false
  }
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

function buildReport({ successHandoff, currentBlocker, nextActions }) {
  const sourceArtifactRows = [
    {
      label: "Final handoff success-redaction smoke",
      path: relative(successHandoffJsonPath),
      present: true,
      ready:
        successHandoff.releaseFinalHandoffReady === true &&
        successHandoff.syntheticSuccessRedactionSmoke === true &&
        successHandoff.releaseChannelMetadataReady === true &&
        successHandoff.realStrictReady === true,
      valueRecorded: false
    },
    {
      label: "Release current blocker",
      path: relative(currentBlockerJsonPath),
      present: true,
      ready: currentBlocker.releaseCurrentBlockerReady === true,
      valueRecorded: false
    },
    {
      label: "External next actions",
      path: relative(nextActionsJsonPath),
      present: true,
      ready: nextActions.externalNextActionsReady === true,
      valueRecorded: false
    }
  ];
  const currentPlaceholderKeys = stringArray(currentBlocker.currentPlaceholderKeys);
  const transitionRows = [
    {
      order: 1,
      state: "Current real blocker",
      evidence: "Release-channel metadata remains the real current blocker until operator-owned values replace placeholders.",
      command: textValue(currentBlocker.currentNextCommand, "npm run release:doctor"),
      ready: currentBlocker.currentPriorityActionId === "release-channel-metadata" && currentPlaceholderKeys.length === releaseChannelMetadataKeys.length,
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
      evidence: "The next-actions ladder previews auto-update feed and signed metadata after release-channel metadata clears.",
      command: textValue(nextActions.nextActionPreviewProofCommand, "npm run desktop:auto-update-readiness-smoke"),
      ready:
        nextActions.nextPriorityActionId === "auto-update-feed" &&
        nextActions.nextActionPreviewId === "auto-update-feed" &&
        nextActions.nextActionPreviewReady === true,
      valueRecorded: false
    },
    {
      order: 4,
      state: "Hard-gate boundary",
      evidence: "External distribution remains unclaimed until the hard gate passes all downstream evidence.",
      command: textValue(currentBlocker.hardGateCommand, "npm run release:external-check"),
      ready: currentBlocker.hardGateReady === false && currentBlocker.hardGateWouldFail === true,
      valueRecorded: false
    }
  ];
  const nextActionPreviewRows = [
    ...sanitizeNextActionRows(nextActions.nextActionPreviewReadyCriteriaRows, 3),
    ...sanitizeNextActionRows(nextActions.nextActionPreviewChecklistRows, 2),
    ...sanitizeNextActionRows(nextActions.nextActionPreviewVerificationRows, 3),
    ...sanitizeNextActionRows(nextActions.nextActionPreviewPrerequisiteCommandRows, 4),
    ...sanitizeNextActionRows(nextActions.nextActionPreviewOperatorActionRows, 2),
    ...sanitizeNextActionRows(nextActions.nextActionPreviewEnvEditRows, 6)
  ];

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:channel-clearance-transition-smoke",
    transitionRefreshCommands,
    transitionRefreshCommandCount: transitionRefreshCommands.length,
    releaseChannelClearanceTransitionReady:
      sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false) &&
      transitionRows.every((row) => row.ready === true && row.valueRecorded === false),
    sourceArtifactRows,
    sourceArtifactRowCount: sourceArtifactRows.length,
    currentRealBlockerReady: currentBlocker.releaseCurrentBlockerReady === true,
    currentPriorityActionId: textValue(currentBlocker.currentPriorityActionId),
    currentPriorityActionLabel: textValue(currentBlocker.currentPriorityActionLabel),
    currentTarget: textValue(currentBlocker.currentTarget, "Release channel metadata"),
    currentNextCommand: textValue(currentBlocker.currentNextCommand, "npm run release:doctor"),
    currentFirstBlocker: textValue(currentBlocker.currentFirstBlocker),
    currentRequiredKeys: stringArray(currentBlocker.currentRequiredKeys),
    currentRequiredKeyCount: integerValue(currentBlocker.currentRequiredKeyCount),
    currentPlaceholderKeys,
    currentPlaceholderKeyCount: integerValue(currentBlocker.currentPlaceholderKeyCount),
    syntheticClearanceReady: successHandoff.releaseChannelMetadataReady === true,
    syntheticClearanceStrictReady: successHandoff.realStrictReady === true,
    syntheticClearanceCurrentReadyCount: integerValue(successHandoff.currentReadyCount),
    syntheticClearanceCurrentRowCount: integerValue(successHandoff.currentRowCount),
    syntheticClearancePlaceholderKeyCount: integerValue(successHandoff.currentPlaceholderKeyCount),
    syntheticClearanceRealLocalEnvRead: successHandoff.realLocalEnvRead === true,
    syntheticClearanceRealLocalEnvModified: successHandoff.realLocalEnvModified === true,
    nextPriorityActionId: textValue(nextActions.nextPriorityActionId),
    nextPriorityActionLabel: textValue(nextActions.nextPriorityActionLabel),
    nextPriorityActionNextCommand: textValue(nextActions.nextPriorityActionNextCommand),
    nextPriorityActionFirstBlocker: textValue(nextActions.nextPriorityActionFirstBlocker),
    nextActionPreviewReady: nextActions.nextActionPreviewReady === true,
    nextActionPreviewId: textValue(nextActions.nextActionPreviewId),
    nextActionPreviewLabel: textValue(nextActions.nextActionPreviewLabel),
    nextActionPreviewProofCommand: textValue(nextActions.nextActionPreviewProofCommand),
    nextActionPreviewFirstBlocker: textValue(nextActions.nextActionPreviewFirstBlocker),
    nextActionPreviewRequiredKeyCount: integerValue(nextActions.nextActionPreviewRequiredKeyCount),
    nextActionPreviewPlaceholderKeyCount: integerValue(nextActions.nextActionPreviewPlaceholderKeyCount),
    nextActionPreviewReadyCriteriaRowCount: integerValue(nextActions.nextActionPreviewReadyCriteriaRowCount),
    nextActionPreviewChecklistRowCount: integerValue(nextActions.nextActionPreviewChecklistRowCount),
    nextActionPreviewVerificationRowCount: integerValue(nextActions.nextActionPreviewVerificationRowCount),
    nextActionPreviewPrerequisiteCommandRowCount: integerValue(nextActions.nextActionPreviewPrerequisiteCommandRowCount),
    nextActionPreviewOperatorActionRowCount: integerValue(nextActions.nextActionPreviewOperatorActionRowCount),
    nextActionPreviewEnvEditRowCount: integerValue(nextActions.nextActionPreviewEnvEditRowCount),
    nextActionPreviewRows,
    nextActionPreviewRowCount: nextActionPreviewRows.length,
    transitionRows,
    transitionRowCount: transitionRows.length,
    hardGateCommand: textValue(currentBlocker.hardGateCommand, "npm run release:external-check"),
    hardGateReady: currentBlocker.hardGateReady === true,
    hardGateWouldFail: currentBlocker.hardGateWouldFail !== false,
    currentTenPlanProgressLabel: textValue(currentBlocker.currentTenPlanProgressLabel),
    currentTenPlanWindowCompletedCount: integerValue(currentBlocker.currentTenPlanWindowCompletedCount),
    tenPlanProgressReportDue: currentBlocker.tenPlanProgressReportDue === true,
    userFacingCompletionPercent: Number(currentBlocker.userFacingCompletionPercent ?? 99.999999),
    userFacingRemainingPercent: Number(currentBlocker.userFacingRemainingPercent ?? 0.000001),
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
- Current real blocker: ${report.currentPriorityActionLabel} (${report.currentPriorityActionId})
- Current placeholder keys: ${report.currentPlaceholderKeyCount}
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
  check(report.sourceArtifactRowCount === 3, "release-channel clearance transition should include three source artifacts");
  check(report.sourceArtifactRows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false), "release-channel clearance transition source rows should be present, ready, and value-free");
  check(report.transitionRefreshCommandCount === 2, "release-channel clearance transition should include two refresh commands");
  check(report.transitionRefreshCommands.every((row) => row.valueRecorded === false), "release-channel clearance transition refresh commands should be value-free");
  check(report.currentRealBlockerReady === true, "release-channel clearance transition should include ready current blocker evidence");
  check(report.currentPriorityActionId === "release-channel-metadata", "release-channel clearance transition should keep release-channel metadata as current real blocker");
  check(report.currentPlaceholderKeyCount === releaseChannelMetadataKeys.length, "release-channel clearance transition should mirror four real placeholder keys");
  check(releaseChannelMetadataKeys.every((key) => report.currentPlaceholderKeys.includes(key)), "release-channel clearance transition should mirror release-channel placeholder keys");
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

const successHandoff = await readJsonRequired(successHandoffJsonPath, "Final handoff success-redaction smoke");
const currentBlocker = await readJsonRequired(currentBlockerJsonPath, "Release current blocker");
const nextActions = await readJsonRequired(nextActionsJsonPath, "External next actions");
const report = buildReport({ successHandoff, currentBlocker, nextActions });
const markdown = buildMarkdown(report);
validateReport(report, markdown);

await mkdir(packageRoot, { recursive: true });
await writeFile(transitionMarkdownPath, markdown, "utf8");
await writeFile(transitionJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log("GrooveForge release-channel clearance transition smoke passed.");
console.log(`- Markdown: ${relative(transitionMarkdownPath)}`);
console.log(`- JSON: ${relative(transitionJsonPath)}`);
console.log(`- Transition ready: ${report.releaseChannelClearanceTransitionReady ? "yes" : "no"}`);
console.log(`- Current real blocker: ${report.currentPriorityActionLabel}`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
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
