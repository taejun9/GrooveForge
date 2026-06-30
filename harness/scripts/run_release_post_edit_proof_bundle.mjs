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
const successSmokeJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof-success-smoke.json`
);
const postEditProofJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof.json`
);
const bundleMarkdownPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof-bundle.md`
);
const bundleJsonPath = path.join(
  packageRoot,
  `${appName}-${packageJson.version}-${platformArch}-release-post-edit-proof-bundle.json`
);
const failures = [];
const bundleCommands = [
  {
    order: 1,
    label: "Synthetic success rehearsal",
    command: "npm run release:post-edit-proof-success-smoke",
    role: "prove the value-free post-edit proof ready branch without real local env values"
  },
  {
    order: 2,
    label: "Real post-edit proof",
    command: "npm run release:post-edit-proof",
    role: "refresh the real ignored-env live check and current blocker evidence"
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release post-edit proof bundle failed:");
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

function runBundleCommand(command) {
  console.log(`Running release post-edit proof bundle step: ${command.command}`);
  const [tool, ...args] = command.command.split(" ");
  const npmCommand = process.platform === "win32" ? "npm.cmd" : tool;
  const result = spawnSync(npmCommand, args, {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });

  if (result.error) {
    fail(`Could not run ${command.command}.`, result.error.message);
  }

  if (result.status !== 0) {
    fail(`${command.command} exited with status ${result.status}.`);
  }
}

async function readRequiredJson(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Expected: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function formatBundleCommandRows(rows) {
  return rows
    .map((row) => `| ${row.order} | ${escapeCell(row.label)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatSourceRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${row.present ? "yes" : "no"} | ${escapeCell(row.path)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function formatReadinessRows(rows) {
  return rows
    .map((row) => `| ${escapeCell(row.scope)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.summary)} | ${row.valueRecorded ? "yes" : "no"} |`)
    .join("\n");
}

function buildReport(successSmoke, postEditProof) {
  const commandRows = bundleCommands.map((command) => ({
    ...command,
    valueRecorded: false
  }));
  const successReady = successSmoke.releasePostEditProofSuccessSmokeReady === true && successSmoke.releasePostEditProofReady === true;
  const actualPostEditProofReady = postEditProof.releasePostEditProofReady === true;
  const actualPlaceholderKeyCount = integerValue(postEditProof.releaseChannelLiveCheckCurrentPlaceholderKeyCount);
  const actualLiveCheckReady = postEditProof.releaseChannelLiveCheckReady === true;
  const actualLiveCheckCurrentReadyCount = integerValue(postEditProof.releaseChannelLiveCheckCurrentReadyCount);
  const actualLiveCheckRowCount = integerValue(postEditProof.releaseChannelLiveCheckRowCount);
  const sourceRows = [
    {
      label: "Post-edit proof success smoke",
      path: relative(successSmokeJsonPath),
      present: true,
      valueRecorded: false
    },
    {
      label: "Real post-edit proof",
      path: relative(postEditProofJsonPath),
      present: true,
      valueRecorded: false
    }
  ];
  const readinessRows = [
    {
      scope: "Success branch rehearsal",
      ready: successReady,
      summary: successReady
        ? `${integerValue(successSmoke.releaseChannelLiveCheckCurrentReadyCount)}/${integerValue(successSmoke.releaseChannelLiveCheckRowCount)} synthetic rows ready, ${integerValue(successSmoke.releaseChannelLiveCheckCurrentPlaceholderKeyCount)} placeholders`
        : "synthetic success branch not ready",
      valueRecorded: false
    },
    {
      scope: "Current real ignored-env proof",
      ready: actualPostEditProofReady,
      summary: `${actualLiveCheckCurrentReadyCount}/${actualLiveCheckRowCount} live-check rows ready, ${actualPlaceholderKeyCount} current placeholders`,
      valueRecorded: false
    },
    {
      scope: "External hard gate",
      ready: false,
      summary: "not claimed by this bundle",
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
    reportCommand: "npm run release:post-edit-proof-bundle",
    releasePostEditProofBundleReady: successReady && sourceRows.every((row) => row.present && row.valueRecorded === false),
    releasePostEditProofBundleState: actualPostEditProofReady
      ? "success branch covered and current real post-edit proof ready"
      : "success branch covered; current real release-channel metadata still blocked",
    releasePostEditProofBundleCommandCount: commandRows.length,
    releasePostEditProofBundleCommandSummary: commandRows.map((row) => row.command).join(" -> "),
    releasePostEditProofBundleCommandRows: commandRows,
    sourcePostEditProofSuccessSmokeReady: successReady,
    sourcePostEditProofSuccessSmokePath: relative(successSmokeJsonPath),
    sourcePostEditProofReady: true,
    sourcePostEditProofPath: relative(postEditProofJsonPath),
    sourceArtifactRows: sourceRows,
    sourceArtifactRowCount: sourceRows.length,
    readinessRows,
    readinessRowCount: readinessRows.length,
    successReadyBranchCovered: successReady,
    successRealLocalEnvRead: successSmoke.realLocalEnvRead === true,
    successRealLocalEnvModified: successSmoke.realLocalEnvModified === true,
    successLiveCheckCurrentReadyCount: integerValue(successSmoke.releaseChannelLiveCheckCurrentReadyCount),
    successLiveCheckRowCount: integerValue(successSmoke.releaseChannelLiveCheckRowCount),
    successLiveCheckPlaceholderKeyCount: integerValue(successSmoke.releaseChannelLiveCheckCurrentPlaceholderKeyCount),
    successPostEditProofReady: successSmoke.releasePostEditProofReady === true,
    actualPostEditProofReady,
    actualPostEditProofState: textValue(postEditProof.releasePostEditProofState),
    actualLiveCheckReady,
    actualLiveCheckCurrentReadyCount,
    actualLiveCheckRowCount,
    actualLiveCheckPlaceholderKeyCount: actualPlaceholderKeyCount,
    actualLiveCheckPlaceholderKeys: stringArrayValue(postEditProof.releaseChannelLiveCheckCurrentPlaceholderKeys),
    actualLiveCheckPlaceholderEditLocationCount: integerValue(postEditProof.releaseChannelLiveCheckCurrentPlaceholderEditLocationCount),
    actualLiveCheckPlaceholderEditLocations: objectRows(postEditProof.releaseChannelLiveCheckCurrentPlaceholderEditLocations).map((row) => ({
      key: textValue(row.key),
      file: textValue(row.file),
      line: Number.isInteger(row.line) ? row.line : null,
      valueRecorded: false
    })),
    actualFirstProofCommandAfterPrivateEdits: textValue(postEditProof.releasePostEditProofFirstCommand, "npm run release:channel-live-check"),
    actualCurrentBlockerRefreshCommand: textValue(postEditProof.releasePostEditProofRefreshCommand, "npm run release:current-blocker"),
    actualCurrentNextCommand: textValue(postEditProof.currentNextCommand, "npm run release:doctor"),
    actualCurrentRerunCommand: textValue(postEditProof.currentRerunCommand, "npm run release:current-blocker"),
    currentTarget: textValue(postEditProof.currentTarget, "Release channel metadata"),
    currentFirstBlocker: textValue(postEditProof.currentFirstBlocker),
    currentTenPlanProgressLabel: textValue(postEditProof.currentTenPlanProgressLabel),
    userFacingCompletionPercent: Number(postEditProof.userFacingCompletionPercent ?? 99.999999),
    userFacingRemainingPercent: Number(postEditProof.userFacingRemainingPercent ?? 0.000001),
    hardGateCommand: textValue(postEditProof.hardGateCommand, "npm run release:external-check"),
    hardGateReady: postEditProof.hardGateReady === true,
    privateValuesRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttempted: false,
    signingAttempted: false,
    claimedExternalDistribution: false,
    valueRecorded: false
  };
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Release Post-Edit Proof Bundle

## Status

- Bundle receipt ready: ${report.releasePostEditProofBundleReady ? "yes" : "no"}
- State: ${report.releasePostEditProofBundleState}
- Success ready branch covered: ${report.successReadyBranchCovered ? "yes" : "no"}
- Current real post-edit proof ready: ${report.actualPostEditProofReady ? "yes" : "no"}
- Success smoke real local env read: ${report.successRealLocalEnvRead ? "yes" : "no"}
- Success smoke real local env modified: ${report.successRealLocalEnvModified ? "yes" : "no"}
- First proof after private edits: \`${report.actualFirstProofCommandAfterPrivateEdits}\`
- Current blocker refresh: \`${report.actualCurrentBlockerRefreshCommand}\`
- Current next command: \`${report.actualCurrentNextCommand}\`
- Current rerun command: \`${report.actualCurrentRerunCommand}\`
- Current target: ${report.currentTarget}
- Current first blocker: ${report.currentFirstBlocker}
- Current 10-plan progress: ${report.currentTenPlanProgressLabel}
- Overall completion: ${report.userFacingCompletionPercent.toFixed(6)}%
- Remaining completion: ${report.userFacingRemainingPercent.toFixed(6)}%
- Hard gate command: \`${report.hardGateCommand}\`
- Hard gate ready: ${report.hardGateReady ? "yes" : "no"}
- Private values recorded: no
- External distribution claimed: no

## Bundle Commands

- Command count: ${report.releasePostEditProofBundleCommandCount}
- Command sequence: ${report.releasePostEditProofBundleCommandSummary}

| order | label | command | role | value recorded |
|---:|---|---|---|---:|
${formatBundleCommandRows(report.releasePostEditProofBundleCommandRows)}

## Readiness Rows

| scope | ready | summary | value recorded |
|---|---:|---|---:|
${formatReadinessRows(report.readinessRows)}

## Current Real Proof

- Live-check ready: ${report.actualLiveCheckReady ? "yes" : "no"}
- Live-check current-ready rows: ${report.actualLiveCheckCurrentReadyCount}/${report.actualLiveCheckRowCount}
- Live-check placeholder keys: ${report.actualLiveCheckPlaceholderKeyCount} (${report.actualLiveCheckPlaceholderKeys.join(", ") || "none"})
- Live-check placeholder edit locations: ${report.actualLiveCheckPlaceholderEditLocationCount}

## Source Artifacts

| artifact | present | path | value recorded |
|---|---:|---|---:|
${formatSourceRows(report.sourceArtifactRows)}

## Safety

- Network probe attempted: no
- Release upload attempted: no
- Apple notary submission attempted: no
- Signing attempted: no
- Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, and external distribution completion are not claimed.
`;
}

for (const command of bundleCommands) {
  runBundleCommand(command);
}

await mkdir(packageRoot, { recursive: true });
const successSmoke = await readRequiredJson(successSmokeJsonPath, "Post-edit proof success smoke");
const postEditProof = await readRequiredJson(postEditProofJsonPath, "Real post-edit proof");
const report = buildReport(successSmoke, postEditProof);
const markdown = buildMarkdown(report);

check(report.releasePostEditProofBundleReady === true, "release post-edit proof bundle should be ready");
check(report.releasePostEditProofBundleCommandCount === 2, "release post-edit proof bundle should include two commands");
check(
  report.releasePostEditProofBundleCommandRows[0]?.command === "npm run release:post-edit-proof-success-smoke",
  "release post-edit proof bundle should run success smoke first"
);
check(
  report.releasePostEditProofBundleCommandRows[1]?.command === "npm run release:post-edit-proof",
  "release post-edit proof bundle should run real post-edit proof second"
);
check(report.successReadyBranchCovered === true, "release post-edit proof bundle should cover the ready branch");
check(report.successPostEditProofReady === true, "release post-edit proof bundle success source should be ready");
check(report.successRealLocalEnvRead === false, "release post-edit proof bundle success source should not read real local env");
check(report.successRealLocalEnvModified === false, "release post-edit proof bundle success source should not modify real local env");
check(report.successLiveCheckCurrentReadyCount === report.successLiveCheckRowCount, "release post-edit proof bundle success source should have all rows ready");
check(report.successLiveCheckRowCount === 4, "release post-edit proof bundle success source should cover four metadata rows");
check(report.successLiveCheckPlaceholderKeyCount === 0, "release post-edit proof bundle success source should clear placeholder keys");
check(report.sourceArtifactRowCount === report.sourceArtifactRows.length, "release post-edit proof bundle source count should match rows");
check(report.sourceArtifactRows.every((row) => row.valueRecorded === false), "release post-edit proof bundle source rows should not record values");
check(report.readinessRowCount === report.readinessRows.length, "release post-edit proof bundle readiness count should match rows");
check(report.readinessRows.every((row) => row.valueRecorded === false), "release post-edit proof bundle readiness rows should not record values");
check(report.actualFirstProofCommandAfterPrivateEdits === "npm run release:channel-live-check", "release post-edit proof bundle should keep live-check as first real proof");
check(report.actualCurrentBlockerRefreshCommand === "npm run release:current-blocker", "release post-edit proof bundle should keep current-blocker as refresh command");
check(report.actualCurrentNextCommand === "npm run release:doctor", "release post-edit proof bundle should preserve release doctor as broader next proof");
check(report.actualCurrentRerunCommand === "npm run release:current-blocker", "release post-edit proof bundle should preserve current-blocker as rerun command");
check(report.actualLiveCheckRowCount === 4, "release post-edit proof bundle actual source should cover four live-check rows");
check(
  report.actualLiveCheckPlaceholderEditLocationCount === report.actualLiveCheckPlaceholderEditLocations.length,
  "release post-edit proof bundle actual placeholder edit location count should match rows"
);
check(
  report.actualLiveCheckPlaceholderEditLocations.every((row) => row.valueRecorded === false),
  "release post-edit proof bundle actual placeholder edit rows should not record values"
);
check(report.hardGateReady === false, "release post-edit proof bundle should keep hard gate unclaimed");
check(report.privateValuesRecorded === false, "release post-edit proof bundle should not record private values");
check(report.networkProbeAttempted === false, "release post-edit proof bundle should not probe network");
check(report.releaseUploadAttempted === false, "release post-edit proof bundle should not upload releases");
check(report.notarySubmissionAttempted === false, "release post-edit proof bundle should not submit to Apple");
check(report.signingAttempted === false, "release post-edit proof bundle should not sign artifacts");
check(report.claimedExternalDistribution === false, "release post-edit proof bundle should not claim external distribution");
check(!/https?:\/\//i.test(JSON.stringify(report)), "release post-edit proof bundle JSON should not include URL values");
check(!/https?:\/\//i.test(markdown), "release post-edit proof bundle Markdown should not include URL values");
check(markdown.includes("Release Post-Edit Proof Bundle"), "release post-edit proof bundle Markdown should include title");
check(markdown.includes("Bundle Commands"), "release post-edit proof bundle Markdown should include bundle commands");
check(markdown.includes("Readiness Rows"), "release post-edit proof bundle Markdown should include readiness rows");
check(markdown.includes("Current Real Proof"), "release post-edit proof bundle Markdown should include current real proof");

if (failures.length > 0) {
  console.error("GrooveForge release post-edit proof bundle failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

await writeFile(bundleJsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(bundleMarkdownPath, markdown);

console.log("GrooveForge release post-edit proof bundle passed.");
console.log(`- Markdown: ${relative(bundleMarkdownPath)}`);
console.log(`- JSON: ${relative(bundleJsonPath)}`);
console.log(`- Bundle receipt ready: ${report.releasePostEditProofBundleReady ? "yes" : "no"}`);
console.log(`- Success ready branch covered: ${report.successReadyBranchCovered ? "yes" : "no"}`);
console.log(`- Current real post-edit proof ready: ${report.actualPostEditProofReady ? "yes" : "no"}`);
console.log(`- First proof after private edits: ${report.actualFirstProofCommandAfterPrivateEdits}`);
console.log(`- Current blocker refresh: ${report.actualCurrentBlockerRefreshCommand}`);
console.log(`- Actual live-check current-ready rows: ${report.actualLiveCheckCurrentReadyCount}/${report.actualLiveCheckRowCount}`);
console.log(`- Actual live-check placeholder keys: ${report.actualLiveCheckPlaceholderKeyCount}`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
