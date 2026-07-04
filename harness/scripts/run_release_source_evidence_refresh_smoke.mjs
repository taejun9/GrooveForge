#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const summaryRoot = path.join(root, "build", "desktop");
const reportStem = "release-source-evidence-refresh-smoke";
const reportMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const reportJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const sourcePrereqJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-source-evidence-prereq-smoke.json`);
const developerIdSigningJsonPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationJsonPath = path.join(summaryRoot, `${appName}-${platformArch}-notarization.json`);
const packagedAppPath = path.join(packageRoot, `${appName}.app`);
const dmgPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}.dmg`);
const pkgPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}.pkg`);
const failures = [];
const cleanupRows = [];

const refreshCommands = [
  {
    command: "npm run build",
    role: "compile renderer and Electron entrypoints before local package evidence",
    sourceArtifact: "Build prerequisite"
  },
  {
    command: "npm run desktop:project-io-smoke",
    role: "refresh native desktop project save/open evidence for completion audit",
    sourceArtifact: "Native project IO prerequisite"
  },
  {
    command: "npm run desktop:package-smoke",
    role: "assemble and launch the local macOS app bundle for release evidence",
    sourceArtifact: "Package prerequisite"
  },
  {
    command: "npm run desktop:packaged-project-io-smoke",
    role: "refresh packaged app project IO evidence",
    sourceArtifact: "Packaged project IO prerequisite"
  },
  {
    command: "npm run desktop:adhoc-sign-smoke",
    role: "refresh local ad-hoc signing evidence without Developer ID claims",
    sourceArtifact: "Release manifest prerequisite"
  },
  {
    command: "npm run desktop:hardened-runtime-readiness-smoke",
    role: "refresh hardened runtime readiness evidence",
    sourceArtifact: "Release manifest prerequisite"
  },
  {
    command: "npm run desktop:pkg-smoke",
    role: "refresh local unsigned PKG artifact evidence",
    sourceArtifact: "Release manifest prerequisite"
  },
  {
    command: "npm run desktop:pkg-payload-smoke",
    role: "refresh PKG payload launch evidence",
    sourceArtifact: "Completion audit prerequisite"
  },
  {
    command: "npm run desktop:pkg-payload-project-io-smoke",
    role: "refresh PKG payload project IO evidence",
    sourceArtifact: "Completion audit prerequisite",
    cleanupAfter: [
      path.join(packageRoot, "pkg-payload-smoke"),
      path.join(packageRoot, "pkg-payload-smoke-expanded")
    ]
  },
  {
    command: "npm run desktop:dmg-smoke",
    role: "refresh local DMG artifact evidence after PKG payload copies are cleaned",
    sourceArtifact: "Release manifest prerequisite"
  },
  {
    command: "npm run desktop:release-manifest-smoke",
    role: "refresh release manifest source artifact",
    sourceArtifact: "Release manifest"
  },
  {
    command: "npm run desktop:release-notes-smoke",
    role: "refresh release notes source artifact",
    sourceArtifact: "Release notes"
  },
  {
    command: "npm run desktop:support-artifact-smoke",
    role: "refresh support source artifact",
    sourceArtifact: "Support artifact"
  },
  {
    command: "npm run desktop:update-feed-config-smoke",
    role: "refresh value-free update feed configuration evidence",
    sourceArtifact: "Auto-update prerequisite"
  },
  {
    command: "npm run desktop:update-metadata-policy-smoke",
    role: "refresh update metadata policy evidence",
    sourceArtifact: "Auto-update prerequisite"
  },
  {
    command: "npm run desktop:update-metadata-artifacts-smoke",
    role: "refresh local update metadata artifact evidence",
    sourceArtifact: "Auto-update prerequisite"
  },
  {
    command: "npm run desktop:auto-update-readiness-smoke",
    role: "refresh auto-update readiness source evidence without feed probes",
    sourceArtifact: "Auto-update prerequisite"
  },
  {
    command: "npm run desktop:developer-id-readiness-smoke",
    role: "refresh Developer ID readiness evidence without recording identity values",
    sourceArtifact: "Developer ID prerequisite"
  },
  {
    command: "npm run desktop:developer-id-signing-smoke",
    role: "refresh Developer ID signing blocker or isolated signing evidence without claiming release signing",
    sourceArtifact: "Developer ID signing"
  },
  {
    command: "npm run desktop:notarization-smoke",
    role: "refresh notarization blocker evidence with notarization submission disabled by this wrapper",
    sourceArtifact: "Notarization"
  },
  {
    command: "npm run desktop:notarized-gatekeeper-smoke",
    role: "refresh notarized Gatekeeper blocker evidence without Apple submission",
    sourceArtifact: "Notarized Gatekeeper"
  },
  {
    command: "npm run desktop:distribution-manual-qa-smoke",
    role: "refresh manual QA checklist evidence without approval claims",
    sourceArtifact: "Manual QA checklist"
  },
  {
    command: "npm run desktop:distribution-channel-qa-smoke",
    role: "refresh distribution-channel QA blocker evidence without channel probes",
    sourceArtifact: "Distribution-channel QA"
  },
  {
    command: "npm run desktop:distribution-handoff-smoke",
    role: "refresh distribution handoff source artifact",
    sourceArtifact: "Distribution handoff"
  },
  {
    command: "npm run desktop:distribution-bundle-manifest-smoke",
    role: "refresh distribution bundle manifest source artifact",
    sourceArtifact: "Distribution bundle manifest"
  },
  {
    command: "npm run desktop:distribution-env-template-smoke",
    role: "refresh distribution env template evidence",
    sourceArtifact: "Completion audit prerequisite"
  },
  {
    command: "npm run desktop:distribution-private-inputs-smoke",
    role: "refresh private-input readiness without recording values",
    sourceArtifact: "Distribution private inputs",
    cleanupAfter: [
      packagedAppPath,
      pkgPath
    ]
  },
  {
    command: "npm run desktop:install-smoke",
    role: "refresh simulated install-path evidence from the retained local DMG",
    sourceArtifact: "Completion audit prerequisite"
  },
  {
    command: "npm run desktop:installed-project-io-smoke",
    role: "refresh simulated installed app project IO evidence",
    sourceArtifact: "Completion audit prerequisite",
    cleanupAfter: [
      path.join(packageRoot, "install-smoke"),
      path.join(packageRoot, "install-smoke-mount"),
      dmgPath
    ]
  },
  {
    command: "npm run release:channel-placeholder-input-receipt",
    role: "refresh value-free release-channel placeholder input receipt before blocker handoff evidence reads it",
    sourceArtifact: "Release-channel placeholder input receipt"
  },
  {
    command: "npm run release:channel-apply-private-env-preflight-blocked-smoke",
    role: "refresh value-free private-env preflight Operator Receipt for external runbook evidence",
    sourceArtifact: "Release-channel preflight Operator Receipt"
  },
  {
    command: "npm run desktop:completion-audit-smoke",
    role: "refresh completion audit source evidence",
    sourceArtifact: "Completion audit prerequisite"
  },
  {
    command: "npm run desktop:external-distribution-gate-smoke",
    role: "refresh external distribution gate dry-run before remediation/status evidence",
    sourceArtifact: "External distribution gate"
  },
  {
    command: "npm run desktop:external-remediation-smoke",
    role: "refresh external remediation source artifact",
    sourceArtifact: "External remediation"
  },
  {
    command: "npm run desktop:completion-status-smoke",
    role: "refresh completion status source artifact",
    sourceArtifact: "Completion status"
  },
  {
    command: "npm run desktop:external-operator-runbook-smoke",
    role: "refresh external operator runbook source artifact",
    sourceArtifact: "External operator runbook"
  },
  {
    command: "npm run desktop:external-readiness-ledger-smoke",
    role: "refresh external readiness ledger source artifact",
    sourceArtifact: "External readiness ledger"
  },
  {
    command: "npm run desktop:completion-progress-smoke",
    role: "refresh completion progress source artifact",
    sourceArtifact: "Completion progress"
  },
  {
    command: "npm run release:external-preflight",
    role: "refresh external preflight source artifact",
    sourceArtifact: "External preflight"
  },
  {
    command: "npm run release:doctor",
    role: "refresh release doctor source artifact",
    sourceArtifact: "Release doctor"
  },
  {
    command: "npm run release:next-actions",
    role: "refresh external next-actions source artifact",
    sourceArtifact: "External next actions"
  },
  {
    command: "npm run release:proof-bundle",
    role: "refresh external proof bundle from current source evidence",
    sourceArtifact: "Proof bundle prerequisite"
  },
  {
    command: "npm run desktop:external-distribution-gate-smoke",
    role: "refresh external distribution gate after proof-bundle mirroring",
    sourceArtifact: "External distribution gate"
  },
  {
    command: "npm run release:source-evidence-prereq-smoke",
    role: "rewrite and validate final source evidence prerequisite coverage",
    sourceArtifact: "Source evidence prerequisite"
  }
].map((row, index) => ({
  order: index + 1,
  ...row,
  valueRecorded: false
}));

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release source evidence refresh smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function readyLabel(value) {
  return value === true ? "yes" : "no";
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function textValue(value, fallback = "none") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function commandToNpmArgs(command) {
  const parts = command.trim().split(/\s+/);
  if (parts[0] !== "npm" || parts[1] !== "run" || !parts[2] || parts.length > 3) {
    fail(`Unsupported source evidence refresh command: ${command}`);
  }
  return ["run", parts[2]];
}

function tailOutput(value, maxLength = 4000) {
  const text = String(value ?? "").trim();
  return text.length > maxLength ? text.slice(text.length - maxLength) : text;
}

function runNpmCommand(row) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const startedAtMs = Date.now();
  console.log(`[${row.order}/${refreshCommands.length}] ${row.command}`);
  const result = spawnSync(npmCommand, commandToNpmArgs(row.command), {
    cwd: root,
    env: {
      ...process.env,
      NO_COLOR: "1",
      GROOVEFORGE_NOTARY_SUBMIT: "0"
    },
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20
  });
  const durationMs = Date.now() - startedAtMs;
  const outputTail = tailOutput(`${result.stdout ?? ""}\n${result.stderr ?? ""}`);

  if (result.error) {
    fail(`Could not run ${row.command}.`, result.error.message);
  }
  if (result.status !== 0) {
    fail(`${row.command} exited with status ${result.status}.`, outputTail);
  }

  return {
    ...row,
    cleanupAfter: undefined,
    exitStatus: result.status,
    signal: result.signal ?? null,
    durationMs,
    stdoutRecorded: false,
    stderrRecorded: false,
    valueRecorded: false
  };
}

async function cleanupAfterCommand(row) {
  if (!Array.isArray(row.cleanupAfter) || row.cleanupAfter.length === 0) {
    return;
  }
  for (const cleanupPath of row.cleanupAfter) {
    const presentBeforeCleanup = existsSync(cleanupPath);
    await rm(cleanupPath, { recursive: true, force: true });
    cleanupRows.push({
      order: cleanupRows.length + 1,
      afterCommand: row.command,
      path: relative(cleanupPath),
      presentBeforeCleanup,
      removed: !existsSync(cleanupPath),
      valueRecorded: false
    });
  }
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function commandSummary(rows) {
  return rows.map((row) => row.command).join(" -> ");
}

function formatCommandRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | \`${escapeCell(row.command)}\` | ${escapeCell(row.sourceArtifact)} | ${escapeCell(row.role)} | ${row.exitStatus} | ${row.durationMs} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCleanupRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | no | no | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order} | \`${escapeCell(row.afterCommand)}\` | ${escapeCell(row.path)} | ${readyLabel(row.presentBeforeCleanup)} | ${readyLabel(row.removed)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildMarkdown(report) {
  return `# Release Source Evidence Refresh Smoke

- Report ready: yes
- Latest completed plan: ${report.latestCompletedPlan}
- 10-plan progress: ${report.tenPlanProgress}
- Refresh command count: ${report.commandCount}
- Cleanup row count: ${report.cleanupRowCount}
- Source artifacts present after refresh: ${report.sourceArtifactPresentCount}/${report.sourceArtifactTotal}
- Missing source artifacts after refresh: ${report.sourceArtifactMissingCount} (${report.sourceArtifactMissingSummary})
- Current first blocker: ${report.currentFirstBlocker}
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Operator proof command: \`${report.operatorProofCommand}\`
- Current private input placeholder locations: ${report.currentPrivateInputPlaceholderLocationSummary}
- Notary submission attempted: ${readyLabel(report.notarySubmissionAttempted)}
- Network probe attempted: ${readyLabel(report.networkProbeAttempted)}
- Release upload attempted: ${readyLabel(report.releaseUploadAttempted)}
- Update feed publish attempted: ${readyLabel(report.updateFeedPublishAttempted)}
- Private values recorded: ${readyLabel(report.privateValuesRecorded)}
- External distribution claimed: ${readyLabel(report.releaseGateClaimedExternalDistribution)}

## Refresh Commands

| order | command | source artifact | role | exit status | duration ms | value recorded |
|---:|---|---|---|---:|---:|---|
${formatCommandRows(report.commandRows)}

## Cleanup Rows

| order | after command | path | present before cleanup | removed | value recorded |
|---:|---|---|---|---|---|
${formatCleanupRows(report.cleanupRows)}

This refresh chain is local-only release evidence generation. It disables Apple notarization submission through \`GROOVEFORGE_NOTARY_SUBMIT=0\`, does not upload releases, publish update feeds, probe distribution channels, or record release/support/feed URLs, channel values, credentials, tokens, Developer ID identity labels, private beats, or real user audio. Developer ID signing remains isolated to the existing Developer ID smoke and is not claimed as primary release signing by this receipt.
`;
}

function validateReport(report, markdown) {
  check(report.reportCommand === "npm run release:source-evidence-refresh-smoke", "source evidence refresh report command should match package script");
  check(report.commandRows.length === refreshCommands.length, "source evidence refresh should report every refresh command");
  check(report.commandRows.every((row) => row.exitStatus === 0), "source evidence refresh command rows should all pass");
  check(report.commandRows.every((row) => row.valueRecorded === false), "source evidence refresh command rows should be value-free");
  check(report.commandRows.every((row) => row.stdoutRecorded === false && row.stderrRecorded === false), "source evidence refresh report should not store command output");
  check(report.cleanupRows.every((row) => row.valueRecorded === false), "source evidence refresh cleanup rows should be value-free");
  check(report.cleanupRows.every((row) => row.removed === true), "source evidence refresh cleanup rows should remove generated intermediate dirs");
  check(report.commandSummary.includes("npm run release:source-evidence-prereq-smoke"), "source evidence refresh should end with prerequisite refresh");
  check(report.sourcePrereqPresent === true, "source evidence refresh should produce the prerequisite JSON");
  check(report.sourceArtifactTotal === 21, "source evidence refresh should validate the 21 source artifact prerequisite set");
  check(report.sourceArtifactPresentCount === report.sourceArtifactTotal, "source evidence refresh should leave all source artifacts present");
  check(report.sourceArtifactMissingCount === 0, "source evidence refresh should leave no missing source artifacts");
  check(report.privateValuesRecorded === false, "source evidence refresh should not record private values");
  check(report.localEnvValueRecorded === false, "source evidence refresh should not record local env values");
  check(report.releaseUrlValueRecorded === false, "source evidence refresh should not record release URL values");
  check(report.supportUrlValueRecorded === false, "source evidence refresh should not record support URL values");
  check(report.feedValueRecorded === false, "source evidence refresh should not record feed values");
  check(report.channelValueRecorded === false, "source evidence refresh should not record channel values");
  check(report.credentialValueRecorded === false, "source evidence refresh should not record credential values");
  check(report.tokenValueRecorded === false, "source evidence refresh should not record token values");
  check(report.developerIdIdentityValueRecorded === false, "source evidence refresh should not record Developer ID identity values");
  check(report.notarySubmissionAttempted === false, "source evidence refresh should not submit to Apple notarization");
  check(report.networkProbeAttempted === false, "source evidence refresh should not probe distribution channels");
  check(report.releaseUploadAttempted === false, "source evidence refresh should not upload releases");
  check(report.updateFeedPublishAttempted === false, "source evidence refresh should not publish update feeds");
  check(report.releaseGateClaimedAutoUpdate === false, "source evidence refresh should not claim auto-update");
  check(report.releaseGateClaimedDeveloperIdSigning === false, "source evidence refresh should not claim Developer ID signing");
  check(report.releaseGateClaimedNotarization === false, "source evidence refresh should not claim notarization");
  check(report.releaseGateClaimedGatekeeperApproval === false, "source evidence refresh should not claim Gatekeeper approval");
  check(report.releaseGateClaimedManualQaApproval === false, "source evidence refresh should not claim manual QA approval");
  check(report.releaseGateClaimedExternalDistribution === false, "source evidence refresh should not claim external distribution");
  check(JSON.stringify(report).includes("https://") === false, "source evidence refresh JSON should not include URL values");
  check(markdown.includes("Release Source Evidence Refresh Smoke"), "source evidence refresh Markdown should include title");
  check(markdown.includes("Source artifacts present after refresh: 21/21"), "source evidence refresh Markdown should include final source coverage");
  check(markdown.includes("GROOVEFORGE_NOTARY_SUBMIT=0"), "source evidence refresh Markdown should state notarization submission guard");
  check(markdown.includes("Private values recorded: no"), "source evidence refresh Markdown should state value redaction");
  check(markdown.includes("External distribution claimed: no"), "source evidence refresh Markdown should state external distribution is not claimed");
  check(markdown.includes("https://") === false, "source evidence refresh Markdown should not include URL values");
}

try {
  await mkdir(packageRoot, { recursive: true });
  const commandRows = [];
  for (const row of refreshCommands) {
    commandRows.push(runNpmCommand(row));
    await cleanupAfterCommand(row);
  }

  const sourcePrereq = await readJsonIfExists(sourcePrereqJsonPath);
  const developerIdSigning = await readJsonIfExists(developerIdSigningJsonPath);
  const notarization = await readJsonIfExists(notarizationJsonPath);
  const report = {
    generatedAt: new Date().toISOString(),
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:source-evidence-refresh-smoke",
    reportStem,
    reportArtifactNames: [
      "release-source-evidence-refresh-smoke.md",
      "release-source-evidence-refresh-smoke.json"
    ],
    commandRows,
    commandCount: commandRows.length,
    commandSummary: commandSummary(commandRows),
    cleanupRows,
    cleanupRowCount: cleanupRows.length,
    sourcePrereqPresent: Boolean(sourcePrereq),
    sourcePrereqPath: relative(sourcePrereqJsonPath),
    latestCompletedPlan: textValue(sourcePrereq?.latestCompletedPlan),
    tenPlanProgress: textValue(sourcePrereq?.tenPlanProgress),
    sourceArtifactTotal: sourcePrereq?.sourceArtifactTotal ?? 0,
    sourceArtifactPresentCount: sourcePrereq?.sourceArtifactPresentCount ?? 0,
    sourceArtifactMissingCount: sourcePrereq?.sourceArtifactMissingCount ?? 0,
    sourceArtifactMissingSummary: textValue(sourcePrereq?.sourceArtifactMissingSummary),
    currentFirstBlocker: textValue(sourcePrereq?.proofBundleCurrentFirstBlocker),
    currentOperatorFirstCommand: textValue(sourcePrereq?.currentOperatorFirstCommand),
    operatorProofCommand: textValue(sourcePrereq?.operatorProofCommand),
    currentPrivateInputPlaceholderLocationSummary: textValue(sourcePrereq?.currentPrivateInputPlaceholderLocationSummary),
    developerIdSigningCommandIncluded: true,
    developerIdSigningAttemptedByExistingSmoke: developerIdSigning?.developerIdSigningAttempted === true,
    developerIdSignedByExistingSmoke: developerIdSigning?.developerIdSigned === true,
    localAdHocSigningCommandIncluded: true,
    notarySubmissionAttempted: notarization?.notarySubmissionAttempted === true,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    updateFeedPublishAttempted: false,
    privateValuesRecorded: false,
    localEnvValueRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    channelValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedManualQaApproval: false,
    releaseGateClaimedExternalDistribution: false,
    valueRecorded: false
  };
  const markdown = buildMarkdown(report);
  validateReport(report, markdown);

  if (failures.length > 0) {
    fail("Source evidence refresh validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  await writeFile(reportMarkdownPath, markdown, "utf8");
  await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("GrooveForge release source evidence refresh smoke passed.");
  console.log(`- Markdown: ${relative(reportMarkdownPath)}`);
  console.log(`- JSON: ${relative(reportJsonPath)}`);
  console.log(`- Commands: ${report.commandCount}`);
  console.log(`- Source artifacts present: ${report.sourceArtifactPresentCount}/${report.sourceArtifactTotal}`);
  console.log(`- Missing source artifacts: ${report.sourceArtifactMissingCount} (${report.sourceArtifactMissingSummary})`);
  console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
  console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
  console.log(`- Operator proof command: ${report.operatorProofCommand}`);
  console.log("- Private values recorded: no");
  console.log("- Network: no distribution channel probe, release upload, update feed publish, or Apple notary submission attempted");
  console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
