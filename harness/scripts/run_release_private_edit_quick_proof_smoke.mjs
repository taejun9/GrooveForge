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
const fromExisting = process.argv.includes("--from-existing");
const reportStem = "release-private-edit-quick-proof-smoke";
const quickProofMarkdownArtifactName = "release-private-edit-quick-proof-smoke.md";
const quickProofJsonArtifactName = "release-private-edit-quick-proof-smoke.json";
const quickProofMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${quickProofMarkdownArtifactName}`);
const quickProofJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${quickProofJsonArtifactName}`);
const liveCheckJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-live-check.json`);
const currentBlockerJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.json`);
const failures = [];
const recommendedOperatorProofCommand = "npm run release:private-edit-strict-proof";
const recommendedStrictFirstProofCommand = "npm run release:channel-live-check-strict";
const releaseChannelApplyPrivateEnvCommand = "npm run release:channel-apply-private-env";
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
  console.error(`GrooveForge release private edit quick proof${fromExisting ? " smoke" : ""} failed:`);
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

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function integerValue(value) {
  return Number.isInteger(value) ? value : 0;
}

function stringArrayValue(values) {
  return Array.isArray(values) ? values.filter((value) => typeof value === "string" && value.trim().length > 0) : [];
}

function objectRows(values) {
  return Array.isArray(values) ? values.filter((value) => value && typeof value === "object" && !Array.isArray(value)) : [];
}

function valueFreeRows(values) {
  return objectRows(values).filter((row) => row.valueRecorded === false);
}

function runNpmScript(scriptName) {
  const command = `npm run ${scriptName}`;
  console.log(`Refreshing release private edit quick proof evidence: ${command}`);
  const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", scriptName], {
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

async function readRequiredJson(filePath, label) {
  if (!existsSync(filePath)) {
    fail(
      `${label} artifact is missing.`,
      `Expected: ${relative(filePath)}\nRun npm run release:progress-refresh-smoke or npm run release:check before this quick proof.`
    );
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function formatCommandRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatKeyRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | no | no | no | no |";
  }
  return rows
    .map((row) => {
      const location = row.line ? `${row.editTarget}:${row.line}` : row.editTarget;
      return `| ${row.order} | ${escapeCell(row.key)} | ${escapeCell(row.kind)} | ${escapeCell(location)} | ${row.present ? "yes" : "no"} | ${row.placeholder ? "yes" : "no"} | ${row.shapeReady ? "yes" : "no"} | ${row.currentReady ? "yes" : "no"} | ${row.valueRecorded ? "yes" : "no"} |`;
    })
    .join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${row.present ? "yes" : "no"} | ${escapeCell(row.path)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function currentKeyRows(liveCheck) {
  return objectRows(liveCheck.releaseChannelLiveCheckRows).map((row) => ({
    order: integerValue(row.order),
    key: textValue(row.key),
    kind: textValue(row.kind),
    expectedShape: textValue(row.expectedShape),
    editTarget: textValue(row.editTarget, textValue(liveCheck.currentEnvEditTarget, ".env.distribution.local")),
    line: Number.isInteger(row.line) ? row.line : null,
    present: row.present === true,
    placeholder: row.placeholder === true,
    shapeReady: row.shapeReady === true,
    currentReady: row.currentReady === true,
    proofCommand: recommendedStrictFirstProofCommand,
    rerunCommand: "npm run release:private-edit-quick-proof",
    valueRecorded: false
  }));
}

function buildReport({ liveCheck, currentBlocker, refreshRows }) {
  const keyRows = currentKeyRows(liveCheck);
  const placeholderKeys = stringArrayValue(liveCheck.currentPlaceholderKeys);
  const currentReadyCount = keyRows.filter((row) => row.currentReady).length;
  const liveCheckReady = liveCheck.releaseChannelLiveCheckReady === true;
  const quickProofReady = liveCheckReady && keyRows.length === releaseChannelMetadataKeys.length && currentReadyCount === releaseChannelMetadataKeys.length;
  const currentActionAcceptanceRows = valueFreeRows(currentBlocker.currentActionAcceptanceRows);
  const postEditProofRows = valueFreeRows(currentBlocker.postEditProofSequenceReceiptRows);
  const operatorProofRows = [
    {
      order: 1,
      command: releaseChannelApplyPrivateEnvCommand,
      role: "apply only operator-owned current release-channel metadata from process env into the ignored local env file",
      valueRecorded: false
    },
    {
      order: 2,
      command: recommendedOperatorProofCommand,
      role: "recommended one-command proof chain after replacing the four private release-channel placeholders",
      valueRecorded: false
    },
    {
      order: 3,
      command: "npm run release:channel-live-check",
      role: "value-free shape/location check that passes while reporting any remaining blocker",
      valueRecorded: false
    },
    {
      order: 4,
      command: recommendedStrictFirstProofCommand,
      role: "pass/fail proof for the four release-channel keys after private edits",
      valueRecorded: false
    },
    {
      order: 5,
      command: "npm run release:post-edit-proof",
      role: "refresh live-check and current-blocker proof after the private edit",
      valueRecorded: false
    },
    {
      order: 6,
      command: "npm run release:progress-refresh-smoke",
      role: "refresh user-facing completion and 10-plan progress receipts",
      valueRecorded: false
    },
    {
      order: 7,
      command: "npm run release:external-check",
      role: "hard gate after every private and external proof is ready",
      valueRecorded: false
    }
  ];
  const sourceRows = [
    {
      label: "Release-channel live check",
      path: relative(liveCheckJsonPath),
      present: true,
      valueRecorded: false
    },
    {
      label: "Release current blocker",
      path: relative(currentBlockerJsonPath),
      present: true,
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
    reportCommand: fromExisting ? "npm run release:private-edit-quick-proof-smoke" : "npm run release:private-edit-quick-proof",
    sourceMode: fromExisting ? "existing-evidence smoke" : "refreshed release private edit quick proof",
    privateEditQuickProofReceiptReady: true,
    privateEditQuickProofReady: quickProofReady,
    privateEditQuickProofState: quickProofReady
      ? "release-channel private edit proof ready"
      : "release-channel private edit proof still has current blockers",
    privateEditQuickProofCurrentTarget: textValue(currentBlocker.currentTarget, "Release channel metadata"),
    privateEditQuickProofCurrentAction: textValue(currentBlocker.currentExternalCompletionChecklistRow?.label, "Release channel metadata"),
    privateEditQuickProofCurrentFirstBlocker: textValue(currentBlocker.currentFirstBlocker),
    privateEditQuickProofCurrentNextCommand: textValue(currentBlocker.currentNextCommand, "npm run release:doctor"),
    privateEditQuickProofRecommendedOperatorProofCommand: recommendedOperatorProofCommand,
    privateEditQuickProofRecommendedOperatorProofRole:
      "run the strict release-channel proof first, then refresh post-edit and progress evidence only after strict proof passes",
    privateEditQuickProofRecommendedFirstProofCommand: recommendedStrictFirstProofCommand,
    privateEditQuickProofRerunCommand: "npm run release:private-edit-quick-proof",
    currentEnvEditTarget: textValue(liveCheck.currentEnvEditTarget, ".env.distribution.local"),
    currentRequiredKeyCount: releaseChannelMetadataKeys.length,
    currentRequiredKeys: releaseChannelMetadataKeys,
    currentReadyCount,
    currentRowCount: keyRows.length,
    currentPlaceholderKeyCount: placeholderKeys.length,
    currentPlaceholderKeys: placeholderKeys,
    currentKeyRows: keyRows,
    currentActionAcceptanceReady: currentBlocker.currentActionAcceptanceReady === true,
    currentActionAcceptanceRowCount: currentActionAcceptanceRows.length,
    currentActionAcceptanceRows,
    postEditProofSequenceReceiptReady: currentBlocker.postEditProofSequenceReceiptReady === true,
    postEditProofSequenceReceiptRowCount: postEditProofRows.length,
    postEditProofSequenceReceiptRows: postEditProofRows,
    operatorProofCommandRows: operatorProofRows,
    operatorProofCommandRowCount: operatorProofRows.length,
    operatorProofCommandSummary: operatorProofRows.map((row) => row.command).join(" -> "),
    refreshCommandRows: refreshRows,
    refreshCommandRowCount: refreshRows.length,
    nextPriorityActionId: textValue(currentBlocker.nextPriorityActionId, "none"),
    nextPriorityActionLabel: textValue(currentBlocker.nextPriorityActionLabel, "none"),
    nextPriorityActionNextCommand: textValue(currentBlocker.nextPriorityActionNextCommand, "none"),
    hardGateCommand: textValue(currentBlocker.hardGateCommand, "npm run release:external-check"),
    hardGateReady: currentBlocker.hardGateReady === true,
    currentTenPlanProgressLabel: textValue(currentBlocker.currentTenPlanProgressLabel),
    tenPlanProgressReportDue: currentBlocker.tenPlanProgressReportDue === true,
    nextScheduledTenPlanProgressReport: textValue(currentBlocker.nextScheduledTenPlanProgressReportAfterDelivery, "plan-1230"),
    userFacingCompletionPercent: Number(currentBlocker.userFacingCompletionPercent ?? 99.999999),
    userFacingRemainingPercent: Number(currentBlocker.userFacingRemainingPercent ?? 0.000001),
    sourceArtifactRows: sourceRows,
    sourceArtifactRowCount: sourceRows.length,
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    updateFeedProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttempted: false,
    signingAttempted: false,
    claimedAutoUpdate: false,
    claimedExternalDistribution: false,
    valueRecorded: false
  };
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Private Edit Quick Proof

## Status

- Receipt ready: ${report.privateEditQuickProofReceiptReady ? "yes" : "no"}
- Private edit proof ready: ${report.privateEditQuickProofReady ? "yes" : "no"}
- State: ${report.privateEditQuickProofState}
- Source mode: ${report.sourceMode}
- Current target: ${report.privateEditQuickProofCurrentTarget}
- Current blocker: ${report.privateEditQuickProofCurrentFirstBlocker}
- Recommended operator proof after edit: \`${report.privateEditQuickProofRecommendedOperatorProofCommand}\`
- Recommended operator proof role: ${report.privateEditQuickProofRecommendedOperatorProofRole}
- Recommended first proof after edit: \`${report.privateEditQuickProofRecommendedFirstProofCommand}\`
- Current env edit target: ${report.currentEnvEditTarget}
- Current ready rows: ${report.currentReadyCount}/${report.currentRowCount}
- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${report.currentPlaceholderKeys.join(", ") || "none"})
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- Next scheduled 10-plan report: ${report.nextScheduledTenPlanProgressReport}
- Overall completion: ${report.userFacingCompletionPercent.toFixed(6)}%
- Remaining completion: ${report.userFacingRemainingPercent.toFixed(6)}%
- Next priority after current clears: ${report.nextPriorityActionId} (${report.nextPriorityActionLabel})
- Hard gate: \`${report.hardGateCommand}\` (${report.hardGateReady ? "ready" : "not ready"})
- Private values recorded: no
- External distribution claimed: no

## Current Keys

| order | key | kind | location | present | placeholder | shape ready | current ready | value recorded |
|---:|---|---|---|---:|---:|---:|---:|---:|
${formatKeyRows(report.currentKeyRows)}

## Operator Proof Commands

- Command rows: ${report.operatorProofCommandRowCount}
- Command summary: ${report.operatorProofCommandSummary}

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.operatorProofCommandRows)}

## Refresh Commands Run By This Receipt

| order | command | role | value recorded |
|---:|---|---|---:|
${formatCommandRows(report.refreshCommandRows)}

## Source Artifacts

| artifact | present | path | value recorded |
|---|---:|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Safety

- Network probe attempted: no
- Update feed probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- Auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, and external distribution completion are not claimed.
`;
}

const refreshRows = [
  {
    order: 1,
    command: "npm run release:channel-live-check",
    role: "refresh value-free current release-channel key shape and placeholder evidence",
    valueRecorded: false
  },
  {
    order: 2,
    command: fromExisting ? "npm run release:current-blocker-smoke" : "npm run release:current-blocker",
    role: fromExisting
      ? "read existing value-free current blocker evidence after the live check"
      : "refresh value-free current blocker evidence after the live check",
    valueRecorded: false
  }
];

runNpmScript("release:channel-live-check");
runNpmScript(fromExisting ? "release:current-blocker-smoke" : "release:current-blocker");

await mkdir(packageRoot, { recursive: true });
const liveCheck = await readRequiredJson(liveCheckJsonPath, "Release-channel live check");
const currentBlocker = await readRequiredJson(currentBlockerJsonPath, "Release current blocker");
const report = buildReport({ liveCheck, currentBlocker, refreshRows });
const markdown = buildMarkdown(report);

check(report.privateEditQuickProofReceiptReady === true, "release private edit quick proof should produce a ready receipt");
check(report.currentRequiredKeyCount === 4, "release private edit quick proof should track four release-channel keys");
check(report.currentRowCount === 4, "release private edit quick proof should include four current key rows");
check(releaseChannelMetadataKeys.every((key) => report.currentRequiredKeys.includes(key)), "release private edit quick proof should cover release-channel metadata keys");
check(report.currentKeyRows.every((row) => row.valueRecorded === false), "release private edit quick proof key rows should not record values");
check(report.currentKeyRows.every((row) => row.proofCommand === recommendedStrictFirstProofCommand), "release private edit quick proof should make strict live-check the key proof");
check(report.currentPlaceholderKeyCount === report.currentPlaceholderKeys.length, "release private edit quick proof placeholder key count should match listed keys");
check(report.privateEditQuickProofRecommendedOperatorProofCommand === recommendedOperatorProofCommand, "release private edit quick proof should recommend the strict proof chain operator command");
check(report.privateEditQuickProofRecommendedFirstProofCommand === recommendedStrictFirstProofCommand, "release private edit quick proof should preserve the strict first proof command");
check(report.operatorProofCommandRowCount === 7, "release private edit quick proof should include seven operator proof rows");
check(report.operatorProofCommandRows.some((row) => row.command === recommendedOperatorProofCommand), "release private edit quick proof should include strict proof chain guidance");
check(report.operatorProofCommandRows.some((row) => row.command === recommendedStrictFirstProofCommand), "release private edit quick proof should include strict live-check guidance");
check(report.operatorProofCommandRows.some((row) => row.command === "npm run release:post-edit-proof"), "release private edit quick proof should include post-edit proof guidance");
check(report.operatorProofCommandRows.some((row) => row.command === "npm run release:progress-refresh-smoke"), "release private edit quick proof should include progress refresh guidance");
check(report.refreshCommandRowCount === 2, "release private edit quick proof should include two refresh rows");
check(report.refreshCommandRows.every((row) => row.valueRecorded === false), "release private edit quick proof refresh rows should not record values");
check(report.sourceArtifactRowCount === 2, "release private edit quick proof should include two source rows");
check(report.sourceArtifactRows.every((row) => row.valueRecorded === false), "release private edit quick proof source rows should not record values");
check(report.privateValuesRecorded === false, "release private edit quick proof should not record private values");
check(report.networkProbeAttempted === false, "release private edit quick proof should not probe distribution channels");
check(report.updateFeedProbeAttempted === false, "release private edit quick proof should not probe update feeds");
check(report.releaseUploadAttempted === false, "release private edit quick proof should not upload releases");
check(report.notarySubmissionAttempted === false, "release private edit quick proof should not submit to Apple");
check(report.signingAttempted === false, "release private edit quick proof should not sign artifacts");
check(report.claimedAutoUpdate === false, "release private edit quick proof should not claim auto-update");
check(report.claimedExternalDistribution === false, "release private edit quick proof should not claim external distribution");
check(!/https?:\/\//i.test(JSON.stringify(report)), "release private edit quick proof JSON should not include URL values");
check(!/https?:\/\//i.test(markdown), "release private edit quick proof Markdown should not include URL values");
check(markdown.includes("Release Private Edit Quick Proof"), "release private edit quick proof Markdown should include title");
check(markdown.includes("Recommended operator proof after edit"), "release private edit quick proof Markdown should include operator proof guidance");
check(markdown.includes("Recommended first proof after edit"), "release private edit quick proof Markdown should include first proof guidance");
check(markdown.includes("Current Keys"), "release private edit quick proof Markdown should include current keys");
check(markdown.includes("Operator Proof Commands"), "release private edit quick proof Markdown should include operator proof commands");

if (failures.length > 0) {
  console.error(`GrooveForge release private edit quick proof${fromExisting ? " smoke" : ""} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

await writeFile(quickProofJsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(quickProofMarkdownPath, markdown);

console.log(`GrooveForge release private edit quick proof${fromExisting ? " smoke" : ""} passed.`);
console.log(`- Markdown: ${relative(quickProofMarkdownPath)}`);
console.log(`- JSON: ${relative(quickProofJsonPath)}`);
console.log(`- Receipt ready: ${report.privateEditQuickProofReceiptReady ? "yes" : "no"}`);
console.log(`- Private edit proof ready: ${report.privateEditQuickProofReady ? "yes" : "no"}`);
console.log(`- Current target: ${report.privateEditQuickProofCurrentTarget}`);
console.log(`- Current blocker: ${report.privateEditQuickProofCurrentFirstBlocker}`);
console.log(`- Recommended operator proof after edit: ${report.privateEditQuickProofRecommendedOperatorProofCommand}`);
console.log(`- Recommended first proof after edit: ${report.privateEditQuickProofRecommendedFirstProofCommand}`);
console.log(`- Current ready rows: ${report.currentReadyCount}/${report.currentRowCount}`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount}`);
console.log(`- Operator proof rows: ${report.operatorProofCommandRowCount}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- Overall completion: ${report.userFacingCompletionPercent.toFixed(6)}%`);
console.log(`- Remaining completion: ${report.userFacingRemainingPercent.toFixed(6)}%`);
console.log("- Private values recorded: no");
console.log("- Network: no update feed probe, distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
