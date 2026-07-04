#!/usr/bin/env node

import { existsSync, readdirSync } from "node:fs";
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
const reportStem = "release-source-evidence-prereq-smoke";
const reportArtifactNames = [
  "release-source-evidence-prereq-smoke.md",
  "release-source-evidence-prereq-smoke.json"
];
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const proofBundleJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-proof-bundle.json`);
const completionSummaryJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-completion-summary-refresh-smoke.json`);
const failures = [];

const artifactDefinitions = [
  {
    label: "Release doctor",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-doctor.json`),
    command: "npm run release:doctor",
    role: "refresh the redacted current release blocker and private-input posture",
    prerequisite: "none"
  },
  {
    label: "External preflight",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-preflight.json`),
    command: "npm run release:external-preflight",
    role: "refresh the focused external preflight after local source evidence exists",
    prerequisite: "completion audit, external gate, remediation, status, runbook, ledger, and progress evidence"
  },
  {
    label: "External next actions",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-next-actions.json`),
    command: "npm run release:next-actions",
    role: "refresh the current external operator action ladder",
    prerequisite: "release doctor"
  },
  {
    label: "External operator runbook",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-operator-runbook.json`),
    command: "npm run desktop:external-operator-runbook-smoke",
    role: "refresh the value-free external operator runbook",
    prerequisite: "completion status and external remediation evidence"
  },
  {
    label: "External readiness ledger",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-readiness-ledger.json`),
    command: "npm run desktop:external-readiness-ledger-smoke",
    role: "refresh the external readiness ledger",
    prerequisite: "external operator runbook evidence"
  },
  {
    label: "Completion status",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-status.json`),
    command: "npm run desktop:completion-status-smoke",
    role: "refresh local completion status from current desktop and distribution evidence",
    prerequisite: "completion audit and external gate evidence"
  },
  {
    label: "Completion progress",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-progress.json`),
    command: "npm run desktop:completion-progress-smoke",
    role: "refresh completion progress source posture",
    prerequisite: "completion status, external runbook, and readiness ledger when available"
  },
  {
    label: "External remediation",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-remediation.json`),
    command: "npm run desktop:external-remediation-smoke",
    role: "refresh grouped external remediation blockers",
    prerequisite: "external distribution gate evidence"
  },
  {
    label: "External distribution gate",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-distribution-gate.json`),
    command: "npm run desktop:external-distribution-gate-smoke",
    role: "refresh the dry-run hard-gate mirror",
    prerequisite: "release proof bundle when available"
  },
  {
    label: "Distribution private inputs",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-private-inputs.json`),
    command: "npm run desktop:distribution-private-inputs-smoke",
    role: "refresh private input readiness without recording private values",
    prerequisite: "distribution env template and current local env posture"
  },
  {
    label: "Distribution-channel QA",
    path: path.join(summaryRoot, `${appName}-${platformArch}-distribution-channel-qa.json`),
    command: "npm run desktop:distribution-channel-qa-smoke",
    role: "refresh distribution-channel QA blockers without probing a channel",
    prerequisite: "release manifest, notes, support, update, signing, notarization, and manual QA evidence"
  },
  {
    label: "Manual QA checklist",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-manual-qa.json`),
    command: "npm run desktop:distribution-manual-qa-smoke",
    role: "refresh manual QA checklist readiness",
    prerequisite: "release/support/update/signing evidence when available"
  },
  {
    label: "Auto-update readiness",
    path: path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`),
    command: "npm run desktop:auto-update-readiness-smoke",
    role: "refresh local auto-update integration readiness without network probes",
    prerequisite: "update feed config, update metadata policy, and signed update artifacts when available"
  },
  {
    label: "Developer ID signing",
    path: path.join(summaryRoot, `${appName}-${platformArch}-developer-id-signing.json`),
    command: "npm run desktop:developer-id-signing-smoke",
    role: "refresh Developer ID signing blocker evidence",
    prerequisite: "packaged app and operator-owned Developer ID identity"
  },
  {
    label: "Notarization",
    path: path.join(summaryRoot, `${appName}-${platformArch}-notarization.json`),
    command: "npm run desktop:notarization-smoke",
    role: "refresh notarization blocker evidence without submitting unless explicitly enabled",
    prerequisite: "Developer ID signed isolated app and bounded notary credential signal"
  },
  {
    label: "Notarized Gatekeeper",
    path: path.join(summaryRoot, `${appName}-${platformArch}-notarized-gatekeeper.json`),
    command: "npm run desktop:notarized-gatekeeper-smoke",
    role: "refresh stapled Gatekeeper blocker evidence",
    prerequisite: "notarized and stapled isolated release artifact"
  },
  {
    label: "Release manifest",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`),
    command: "npm run desktop:release-manifest-smoke",
    role: "refresh local release manifest from app, DMG, and PKG artifacts",
    prerequisite: "desktop package, ad-hoc signing, DMG, and PKG smoke evidence"
  },
  {
    label: "Release notes",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-notes.json`),
    command: "npm run desktop:release-notes-smoke",
    role: "refresh local release notes artifact",
    prerequisite: "release manifest"
  },
  {
    label: "Support artifact",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-support.json`),
    command: "npm run desktop:support-artifact-smoke",
    role: "refresh local support artifact",
    prerequisite: "release manifest and release notes"
  },
  {
    label: "Distribution handoff",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-handoff.json`),
    command: "npm run desktop:distribution-handoff-smoke",
    role: "refresh distribution handoff across release, support, update, signing, notarization, and QA evidence",
    prerequisite: "release/support/update/signing/notarization/channel QA evidence"
  },
  {
    label: "Distribution bundle manifest",
    path: path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-bundle-manifest.json`),
    command: "npm run desktop:distribution-bundle-manifest-smoke",
    role: "refresh distribution bundle manifest without copying the release payload",
    prerequisite: "distribution handoff and release artifact evidence"
  }
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
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

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function completedPlanNumbers() {
  const completedRoot = path.join(root, "docs", "exec_plans", "completed");
  if (!existsSync(completedRoot)) {
    return [];
  }
  return readdirSync(completedRoot)
    .map((name) => Number(name.match(/^plan-(\d+)-/)?.[1]))
    .filter((value) => Number.isInteger(value))
    .sort((left, right) => left - right);
}

function tenPlanProgressLabel(numbers) {
  if (numbers.length === 0) {
    return "none";
  }
  const latest = numbers[numbers.length - 1];
  const windowStart = Math.floor((latest - 1) / 10) * 10 + 1;
  const windowEnd = windowStart + 9;
  const count = numbers.filter((value) => value >= windowStart && value <= windowEnd).length;
  return `${windowStart}-${windowEnd}: ${count}/10`;
}

function artifactRowsFromDefinitions(proofBundle) {
  const proofRows = Array.isArray(proofBundle?.proofArtifacts) ? proofBundle.proofArtifacts : [];
  return artifactDefinitions.map((definition, index) => {
    const proofRow = proofRows.find((row) => row?.label === definition.label);
    const present = proofRow?.present === true || existsSync(definition.path);
    return {
      order: index + 1,
      label: definition.label,
      path: textValue(proofRow?.path, relative(definition.path)),
      present,
      command: definition.command,
      role: definition.role,
      prerequisite: definition.prerequisite,
      valueRecorded: false
    };
  });
}

function commandRowsFromArtifacts(artifactRows) {
  return artifactRows
    .filter((row) => row.present !== true)
    .map((row, index) => ({
      order: index + 1,
      artifact: row.label,
      command: row.command,
      prerequisite: row.prerequisite,
      role: row.role,
      valueRecorded: false
    }));
}

function formatArtifactRows(rows) {
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.label)} | ${readyLabel(row.present)} | ${escapeCell(row.path)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.prerequisite)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function formatCommandRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${row.order} | ${escapeCell(row.artifact)} | \`${escapeCell(row.command)}\` | ${escapeCell(row.prerequisite)} | ${readyLabel(row.valueRecorded)} |`
    )
    .join("\n");
}

function buildReport({ proofBundle, completionSummary }) {
  const numbers = completedPlanNumbers();
  const latestCompletedPlanNumber = numbers.length > 0 ? numbers[numbers.length - 1] : null;
  const artifactRows = artifactRowsFromDefinitions(proofBundle);
  const missingArtifactRows = artifactRows.filter((row) => row.present !== true);
  const commandRows = commandRowsFromArtifacts(artifactRows);
  const tenPlanProgress = textValue(
    completionSummary?.tenPlanProgress,
    tenPlanProgressLabel(numbers)
  );
  return {
    generatedAt: new Date().toISOString(),
    appName,
    bundleId,
    version: packageJson.version,
    platform: process.platform,
    arch: process.arch,
    platformArch,
    reportCommand: "npm run release:source-evidence-prereq-smoke",
    reportStem,
    reportArtifactNames,
    latestCompletedPlan: latestCompletedPlanNumber ? `plan-${latestCompletedPlanNumber}` : "none",
    tenPlanProgress,
    proofBundlePresent: proofBundle !== null,
    proofBundleSourceEvidenceReady: proofBundle?.sourceEvidenceReady === true,
    proofBundleReady: proofBundle?.proofBundleReady === true,
    proofBundleCurrentFirstBlocker: textValue(proofBundle?.currentFirstBlocker, completionSummary?.currentFirstBlocker),
    completionSummaryPresent: completionSummary !== null,
    userFacingCompletion: textValue(completionSummary?.userFacingCompletionLabel, "unknown"),
    userFacingRemaining: textValue(completionSummary?.userFacingRemainingLabel, "unknown"),
    currentOperatorFirstCommand: textValue(completionSummary?.currentOperatorFirstCommand, "npm run release:channel-apply-private-env-preflight"),
    operatorProofCommand: textValue(completionSummary?.operatorProofCommand, "npm run release:private-edit-strict-proof"),
    currentPrivateInputPlaceholderLocationSummary: textValue(completionSummary?.currentPrivateInputPlaceholderLocationSummary),
    artifactRows,
    sourceArtifactTotal: artifactRows.length,
    sourceArtifactPresentCount: artifactRows.length - missingArtifactRows.length,
    sourceArtifactMissingCount: missingArtifactRows.length,
    sourceArtifactMissingSummary: missingArtifactRows.length > 0 ? missingArtifactRows.map((row) => row.label).join(", ") : "none",
    commandRows,
    commandRowCount: commandRows.length,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    updateFeedPublishAttempted: false,
    signingAttempted: false,
    notarySubmissionAttempted: false,
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
}

function buildMarkdown(report) {
  return `# Release Source Evidence Prerequisite Smoke

- Report ready: yes
- Latest completed plan: ${report.latestCompletedPlan}
- 10-plan progress: ${report.tenPlanProgress}
- Proof bundle present: ${readyLabel(report.proofBundlePresent)}
- Proof bundle source evidence ready: ${readyLabel(report.proofBundleSourceEvidenceReady)}
- Proof bundle ready: ${readyLabel(report.proofBundleReady)}
- Current first blocker: ${report.proofBundleCurrentFirstBlocker}
- User-facing completion: ${report.userFacingCompletion}
- User-facing remaining: ${report.userFacingRemaining}
- Current operator first command: \`${report.currentOperatorFirstCommand}\`
- Operator proof command: \`${report.operatorProofCommand}\`
- Current private input placeholder locations: ${report.currentPrivateInputPlaceholderLocationSummary}
- Source artifacts present: ${report.sourceArtifactPresentCount}/${report.sourceArtifactTotal}
- Missing source artifacts: ${report.sourceArtifactMissingCount} (${report.sourceArtifactMissingSummary})
- Private values recorded: ${readyLabel(report.privateValuesRecorded)}
- Network probe attempted: ${readyLabel(report.networkProbeAttempted)}
- Release upload attempted: ${readyLabel(report.releaseUploadAttempted)}
- Update feed publish attempted: ${readyLabel(report.updateFeedPublishAttempted)}
- Signing attempted: ${readyLabel(report.signingAttempted)}
- Notary submission attempted: ${readyLabel(report.notarySubmissionAttempted)}
- External distribution claimed: ${readyLabel(report.releaseGateClaimedExternalDistribution)}

## Source Artifact Rows

| order | artifact | present | path | refresh command | prerequisite | value recorded |
|---:|---|---|---|---|---|---|
${formatArtifactRows(report.artifactRows)}

## Missing Artifact Command Rows

| order | artifact | refresh command | prerequisite | value recorded |
|---:|---|---|---|---|
${formatCommandRows(report.commandRows)}

This packet is a value-free prerequisite map. It does not run the heavy release gate, does not sign, notarize, upload, publish feeds, probe distribution channels, or record release/support/feed URLs, channel values, credentials, tokens, Developer ID identity labels, local env values, private beats, or real user audio.
`;
}

function validateReport(report, markdown) {
  check(report.sourceArtifactTotal === artifactDefinitions.length, "source evidence prereq should cover the expected 21 external proof source artifacts");
  check(report.artifactRows.every((row) => row.valueRecorded === false), "source evidence artifact rows should be value-free");
  check(report.commandRows.every((row) => row.valueRecorded === false), "source evidence command rows should be value-free");
  check(report.commandRows.every((row) => row.command.startsWith("npm run ")), "source evidence command rows should include npm run commands");
  check(report.sourceArtifactMissingCount === report.commandRowCount, "missing source artifact count should match command rows");
  check(report.privateValuesRecorded === false, "source evidence prereq should not record private values");
  check(report.localEnvValueRecorded === false, "source evidence prereq should not record local env values");
  check(report.releaseUrlValueRecorded === false, "source evidence prereq should not record release URL values");
  check(report.supportUrlValueRecorded === false, "source evidence prereq should not record support URL values");
  check(report.feedValueRecorded === false, "source evidence prereq should not record feed values");
  check(report.channelValueRecorded === false, "source evidence prereq should not record channel values");
  check(report.credentialValueRecorded === false, "source evidence prereq should not record credential values");
  check(report.tokenValueRecorded === false, "source evidence prereq should not record token values");
  check(report.developerIdIdentityValueRecorded === false, "source evidence prereq should not record Developer ID identity values");
  check(report.networkProbeAttempted === false, "source evidence prereq should not attempt network probes");
  check(report.releaseUploadAttempted === false, "source evidence prereq should not attempt release uploads");
  check(report.updateFeedPublishAttempted === false, "source evidence prereq should not publish update feeds");
  check(report.signingAttempted === false, "source evidence prereq should not attempt signing");
  check(report.notarySubmissionAttempted === false, "source evidence prereq should not attempt notarization");
  check(report.releaseGateClaimedAutoUpdate === false, "source evidence prereq should not claim auto-update");
  check(report.releaseGateClaimedDeveloperIdSigning === false, "source evidence prereq should not claim Developer ID signing");
  check(report.releaseGateClaimedNotarization === false, "source evidence prereq should not claim notarization");
  check(report.releaseGateClaimedGatekeeperApproval === false, "source evidence prereq should not claim Gatekeeper approval");
  check(report.releaseGateClaimedManualQaApproval === false, "source evidence prereq should not claim manual QA approval");
  check(report.releaseGateClaimedExternalDistribution === false, "source evidence prereq should not claim external distribution");
  check(JSON.stringify(report).includes("https://") === false, "source evidence prereq JSON should not include URL values");
  check(markdown.includes("https://") === false, "source evidence prereq Markdown should not include URL values");
  check(markdown.includes("Release Source Evidence Prerequisite Smoke"), "source evidence prereq Markdown should include title");
  check(markdown.includes("Source Artifact Rows"), "source evidence prereq Markdown should include artifact rows");
  check(markdown.includes("Missing Artifact Command Rows"), "source evidence prereq Markdown should include command rows");
}

try {
  await mkdir(packageRoot, { recursive: true });
  const proofBundle = await readJsonIfExists(proofBundleJsonPath);
  const completionSummary = await readJsonIfExists(completionSummaryJsonPath);
  const report = buildReport({ proofBundle, completionSummary });
  const markdown = buildMarkdown(report);
  validateReport(report, markdown);

  if (failures.length > 0) {
    console.error("GrooveForge release source evidence prereq smoke failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  await writeFile(markdownPath, markdown);
  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log("GrooveForge release source evidence prereq smoke passed.");
  console.log(`- Markdown: ${relative(markdownPath)}`);
  console.log(`- JSON: ${relative(jsonPath)}`);
  console.log(`- Latest completed plan: ${report.latestCompletedPlan}`);
  console.log(`- 10-plan progress: ${report.tenPlanProgress}`);
  console.log(`- Source artifacts present: ${report.sourceArtifactPresentCount}/${report.sourceArtifactTotal}`);
  console.log(`- Missing source artifacts: ${report.sourceArtifactMissingCount} (${report.sourceArtifactMissingSummary})`);
  console.log(`- Current first blocker: ${report.proofBundleCurrentFirstBlocker}`);
  console.log(`- Current operator first command: ${report.currentOperatorFirstCommand}`);
  console.log(`- Operator proof command: ${report.operatorProofCommand}`);
  console.log("- Private values recorded: no");
  console.log("- Network: no distribution channel probe, release upload, update feed publish, Apple notary submission, or signing attempted");
  console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, manual QA approval, app-store submission, or external distribution completion");
} catch (error) {
  console.error("GrooveForge release source evidence prereq smoke failed:");
  console.error(`- ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
