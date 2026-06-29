#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const releaseDoctorJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-doctor.json`);
const externalProofBundleJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-proof-bundle.json`);
const externalGateJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-distribution-gate.json`);
const releaseProgressJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-progress-report.json`);
const currentBlockerMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.md`);
const currentBlockerJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-current-blocker.json`);
const fromExisting = process.argv.includes("--from-existing");
const failures = [];
const refreshCommandsBeforeSourceCheck = [
  ["run", "release:doctor"],
  ["run", "release:proof-bundle"]
];
const refreshCommandsAfterSourceCheck = [
  ["run", "desktop:external-distribution-gate-smoke"],
  ["run", "release:progress-smoke"]
];
const refreshCommands = [...refreshCommandsBeforeSourceCheck, ...refreshCommandsAfterSourceCheck];
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
  console.error(`GrooveForge release current blocker${fromExisting ? " smoke" : ""} failed:`);
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function runCommand(args) {
  const command = `npm ${args.join(" ")}`;
  console.log(`Refreshing release current blocker evidence: ${command}`);
  const result = spawnSync("npm", args, {
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

async function assertSourceEvidenceReadyForRefresh() {
  const proofBundle = await readRequiredJson(externalProofBundleJsonPath, "External proof bundle");
  if (proofBundle.sourceEvidenceReady !== true) {
    fail(
      "Source release evidence is missing for release:current-blocker.",
      [
        "Run npm run release:check once to regenerate local release evidence before refreshing the current blocker.",
        `Current proof bundle next command: ${textValue(proofBundle.currentNextCommand)}`,
        `Current proof bundle first blocker: ${textValue(proofBundle.currentFirstBlocker)}`
      ].join("\n")
    );
  }
}

async function runRefreshCommands() {
  for (const args of refreshCommandsBeforeSourceCheck) {
    runCommand(args);
  }

  await assertSourceEvidenceReadyForRefresh();

  for (const args of refreshCommandsAfterSourceCheck) {
    runCommand(args);
  }
}

function relative(filePath) {
  return path.relative(root, filePath);
}

async function readRequiredJson(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label} artifact is missing.`, `Run npm run release:check or npm run verify before ${fromExisting ? "release:current-blocker-smoke" : "release:current-blocker"}. Missing: ${relative(filePath)}`);
  }
  return JSON.parse(await readFile(filePath, "utf8"));
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
  return Array.isArray(values) ? values.filter((value) => value && typeof value === "object") : [];
}

function valueFreeObjectRows(values) {
  return objectRows(values).filter((value) => value.valueRecorded === false);
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function sameStringArray(left, right) {
  return JSON.stringify(stringArrayValue(left)) === JSON.stringify(stringArrayValue(right));
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function locationKeyRows(rows) {
  return valueFreeObjectRows(rows).map((row) => ({
    key: textValue(row.key),
    file: textValue(row.file, row.editTarget ?? "none"),
    line: Number.isInteger(row.line) ? row.line : 0,
    location: textValue(row.location, row.file && row.line ? `${row.file}:${row.line}` : "none"),
    placeholder: row.placeholder === true,
    valueRecorded: false
  }));
}

function formatKeyList(keys) {
  return stringArrayValue(keys).length > 0 ? stringArrayValue(keys).join(", ") : "none";
}

function formatCommandSummary(commands) {
  return stringArrayValue(commands).length > 0 ? stringArrayValue(commands).join(", ") : "none";
}

function formatLocationSummary(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "none";
  }
  return rows.map((row) => `${textValue(row.location)} ${textValue(row.key)}`).join(", ");
}

function commandSequenceFromRows(rows) {
  return objectRows(rows)
    .slice()
    .sort((left, right) => integerValue(left.order) - integerValue(right.order))
    .map((row) => textValue(row.command))
    .filter((command) => command !== "none");
}

function formatLocationRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.location)} | ${escapeCell(row.key)} | ${row.placeholder ? "yes" : "no"} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatEditRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => {
      const location = row.location ?? (row.file && row.line ? `${row.file}:${row.line}` : row.editTarget ?? "unknown");
      return `| ${escapeCell(location)} | ${escapeCell(row.key)} | ${escapeCell(row.assignment)} | ${escapeCell(row.guidance)} | ${row.valueRecorded === false ? "no" : "yes"} |`;
    })
    .join("\n");
}

function formatConsistencyRows(rows) {
  return rows.map((row) => `| ${escapeCell(row.check)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.evidence)} |`).join("\n");
}

function formatCommandRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatActionChecklistRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.step)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCompletedPlanRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.number ?? "?"} | ${escapeCell(row.fileName)} | ${escapeCell(row.path)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatAudienceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | none | none | no | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.audience)} | ${escapeCell(row.readinessRole)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.workflowMode)} | ${row.workflowBars ?? 0} | ${escapeCell(row.workflowDeliveryTarget)} | ${escapeCell(row.workflowStyle)} | ${row.deliveryPackageReady ? "yes" : "no"} | ${row.deliveryArtifactCount ?? 0} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatDeliveryPackageRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.persona)} | ${escapeCell(row.workflowLabel)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.mode)} | ${row.bars ?? 0} | ${escapeCell(row.deliveryTarget)} | ${row.artifactCount ?? 0} | ${escapeCell(row.packageRoot)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function buildReport({ releaseDoctor, externalProofBundle, externalGate, releaseProgress }) {
  const doctorRequiredKeys = stringArrayValue(releaseDoctor.currentActionRequiredKeys);
  const proofRequiredKeys = stringArrayValue(externalProofBundle.currentRequiredKeys);
  const progressRequiredKeys = stringArrayValue(releaseProgress.externalProofBundleCurrentRequiredKeys);
  const doctorPlaceholderKeys = stringArrayValue(releaseDoctor.currentActionPlaceholderKeys);
  const proofPlaceholderKeys = stringArrayValue(externalProofBundle.currentPlaceholderKeys);
  const progressPlaceholderKeys = stringArrayValue(releaseProgress.externalProofBundleCurrentPlaceholderKeys);
  const doctorPlaceholderLocations = locationKeyRows(releaseDoctor.currentActionPlaceholderEditLocations);
  const proofPlaceholderLocations = locationKeyRows(externalProofBundle.currentPlaceholderEditLocations);
  const progressPlaceholderLocations = locationKeyRows(releaseProgress.externalProofBundleCurrentPlaceholderEditLocations);
  const doctorEnvEditRows = valueFreeObjectRows(releaseDoctor.currentActionEnvEditRows);
  const proofEnvEditRows = valueFreeObjectRows(externalProofBundle.currentEnvEditRows);
  const gateEnvEditRows = valueFreeObjectRows(externalGate.currentEnvEditRows);
  const proofChecklistRows = valueFreeObjectRows(externalProofBundle.currentProofChecklistRows);
  const gateProofChecklistRows = valueFreeObjectRows(externalGate.currentProofChecklistRows);
  const actionChecklistRows = valueFreeObjectRows(externalProofBundle.currentActionChecklistRows);
  const commandVerificationRows = valueFreeObjectRows(externalProofBundle.currentCommandVerificationRows);
  const gateCommandVerificationRows = valueFreeObjectRows(externalGate.currentCommandVerificationRows);
  const currentCommandSequence = commandSequenceFromRows(commandVerificationRows);
  const currentCommandSequenceCount =
    integerValue(externalProofBundle.currentCommandSequenceCount) || currentCommandSequence.length;
  const currentCommandSequenceSummary = textValue(
    externalProofBundle.currentCommandSequenceSummary,
    formatCommandSummary(currentCommandSequence)
  );
  const progressConsistency = releaseProgress.externalGateProofBundleConsistencyChecks ?? {};
  const currentNextCommands = [
    textValue(releaseDoctor.currentActionNextCommand),
    textValue(releaseDoctor.completionGapNextProofCommand),
    textValue(externalProofBundle.currentNextCommand),
    textValue(externalGate.currentNextCommand),
    textValue(releaseProgress.externalProofBundleCurrentNextCommand),
    textValue(releaseProgress.externalGateCurrentNextCommand)
  ];
  const currentFirstBlockers = [
    textValue(releaseDoctor.currentActionFirstBlocker),
    textValue(releaseDoctor.completionGapFirstBlocker),
    textValue(externalProofBundle.currentFirstBlocker),
    textValue(externalGate.currentFirstBlocker),
    textValue(releaseProgress.externalProofBundleCurrentFirstBlocker),
    textValue(releaseProgress.externalGateCurrentFirstBlocker)
  ];
  const currentNextCommandConsensus = currentNextCommands.every((command) => command === currentNextCommands[0]);
  const proofGateProgressBlockers = currentFirstBlockers.slice(2);
  const currentFirstBlockerConsensus = proofGateProgressBlockers.every((blocker) => blocker === proofGateProgressBlockers[0]);
  const exactFirstBlockerConsensus = currentFirstBlockers.every((blocker) => blocker === currentFirstBlockers[0]);
  const currentNextCommand = textValue(externalProofBundle.currentNextCommand);
  const localEnvSetupPending = currentNextCommand === "npm run release:prepare-env";
  const placeholderCleanupPending = currentNextCommand === "npm run release:doctor" && proofPlaceholderKeys.length > 0;
  const doctorFirstBlockerAligned = localEnvSetupPending
    ? currentFirstBlockers.slice(0, 2).every((blocker) => /local distribution env file|local env file/i.test(blocker) && /not loaded|missing|absent/i.test(blocker))
    : currentFirstBlockers.slice(0, 2).every((blocker) => /placeholder/i.test(blocker) && blocker.includes(String(proofPlaceholderKeys.length)));
  const placeholderState = localEnvSetupPending
    ? "local env scaffold pending"
    : placeholderCleanupPending
      ? "placeholder cleanup pending"
      : "release-channel metadata proof can advance";
  const nextExpectedOperatorSequence = localEnvSetupPending
    ? [
        "Run npm run release:prepare-env to create the ignored local distribution env scaffold.",
        "Replace the current release-channel placeholder values in the ignored local env file.",
        "Run npm run release:doctor to refresh value-free private-input and channel evidence.",
        "Run npm run release:next-actions to confirm the blocker advances without storing values.",
        "Run npm run release:proof-bundle to refresh hard-gate preparation evidence.",
        "Run npm run release:external-check only when signing, notarization, Gatekeeper, update metadata, and manual QA are also ready."
      ]
    : [
        "Replace the current release-channel placeholder values in the ignored local env file.",
        "Run npm run release:doctor to refresh value-free private-input and channel evidence.",
        "Run npm run release:next-actions to confirm the blocker advances without storing values.",
        "Run npm run release:proof-bundle to refresh hard-gate preparation evidence.",
        "Run npm run release:external-check only when signing, notarization, Gatekeeper, update metadata, and manual QA are also ready."
      ];
  const consistencyRows = [
    {
      check: "Doctor/proof/gate/progress next command consensus",
      ready: currentNextCommandConsensus,
      evidence: currentNextCommands.join(" | ")
    },
    {
      check: "Proof/gate/progress blocker consensus",
      ready: currentFirstBlockerConsensus,
      evidence: proofGateProgressBlockers.join(" | ")
    },
    {
      check: "Release doctor blocker alignment",
      ready: doctorFirstBlockerAligned,
      evidence: currentFirstBlockers.slice(0, 2).join(" | ")
    },
    {
      check: "Required release-channel keys match",
      ready: sameStringArray(doctorRequiredKeys, proofRequiredKeys) && sameStringArray(proofRequiredKeys, progressRequiredKeys),
      evidence: formatKeyList(proofRequiredKeys)
    },
    {
      check: "Current placeholder keys match",
      ready: sameStringArray(doctorPlaceholderKeys, proofPlaceholderKeys) && sameStringArray(proofPlaceholderKeys, progressPlaceholderKeys),
      evidence: formatKeyList(proofPlaceholderKeys)
    },
    {
      check: "Current placeholder edit locations match",
      ready:
        sameJson(doctorPlaceholderLocations, proofPlaceholderLocations) &&
        sameJson(proofPlaceholderLocations, progressPlaceholderLocations),
      evidence: proofPlaceholderLocations.map((row) => row.location).join(", ") || "none"
    },
    {
      check: "Proof bundle and external gate edit rows match",
      ready: progressConsistency.currentEnvEditRowsMatch === true && sameJson(proofEnvEditRows, gateEnvEditRows),
      evidence: `${proofEnvEditRows.length} value-free edit rows`
    },
    {
      check: "Proof bundle and external gate proof checklist rows match",
      ready: progressConsistency.currentProofChecklistRowsMatch === true && sameJson(proofChecklistRows, gateProofChecklistRows),
      evidence: `${proofChecklistRows.length} value-free proof checklist rows`
    },
    {
      check: "Proof bundle and external gate command verification rows match",
      ready: progressConsistency.currentCommandVerificationRowsMatch === true && sameJson(commandVerificationRows, gateCommandVerificationRows),
      evidence: `${commandVerificationRows.length} value-free command verification rows`
    }
  ];

  return {
    appName,
    bundleId,
    version: packageJson.version,
    platformArch,
    reportCommand: fromExisting ? "npm run release:current-blocker-smoke" : "npm run release:current-blocker",
    sourceMode: fromExisting ? "existing evidence" : "refreshed external release evidence",
    refreshCommandSequence: fromExisting ? [] : refreshCommands.map((args) => `npm ${args.join(" ")}`),
    refreshCommandCount: fromExisting ? 0 : refreshCommands.length,
    releaseCurrentBlockerReady: true,
    releaseCurrentBlockerState: placeholderState,
    currentTarget: textValue(externalProofBundle.currentFocus, "Release channel metadata"),
    currentNextCommand,
    currentFirstBlocker: textValue(externalProofBundle.currentFirstBlocker),
    doctorFirstBlocker: textValue(releaseDoctor.currentActionFirstBlocker),
    currentOperatorAction: textValue(externalProofBundle.currentOperatorAction),
    hardGateCommand: textValue(externalProofBundle.hardExternalGateCommand, "npm run release:external-check"),
    currentEnvEditTarget: textValue(externalProofBundle.currentEnvEditTarget, ".env.distribution.local"),
    currentRequiredKeyCount: integerValue(externalProofBundle.currentRequiredKeyCount),
    currentRequiredKeys: proofRequiredKeys,
    currentPlaceholderKeyCount: integerValue(externalProofBundle.currentPlaceholderKeyCount),
    currentPlaceholderKeys: proofPlaceholderKeys,
    currentPlaceholderEditLocationCount: integerValue(externalProofBundle.currentPlaceholderEditLocationCount),
    currentPlaceholderEditLocationSummary: textValue(
      externalProofBundle.currentPlaceholderEditLocationSummary,
      formatLocationSummary(proofPlaceholderLocations)
    ),
    currentPlaceholderEditLocations: proofPlaceholderLocations,
    currentEnvEditRowsCount: integerValue(externalProofBundle.currentEnvEditRowsCount),
    currentEnvEditRowsSummary: textValue(externalProofBundle.currentEnvEditRowsSummary, `${proofEnvEditRows.length} value-free edit rows`),
    currentEnvEditRows: proofEnvEditRows,
    currentProofChecklistRowCount: integerValue(externalProofBundle.currentProofChecklistRowCount),
    currentProofChecklistRowSummary: textValue(externalProofBundle.currentProofChecklistRowSummary, `${proofChecklistRows.length} value-free proof checklist rows`),
    currentProofChecklistRows: proofChecklistRows,
    currentActionChecklistCount: integerValue(externalProofBundle.currentActionChecklistCount),
    currentActionChecklistSummary: textValue(externalProofBundle.currentActionChecklistSummary, `${actionChecklistRows.length} value-free steps`),
    currentActionChecklistRows: actionChecklistRows,
    currentCommandVerificationRowCount: integerValue(externalProofBundle.currentCommandVerificationRowCount),
    currentCommandVerificationRowSummary: textValue(
      externalProofBundle.currentCommandVerificationRowSummary,
      `${commandVerificationRows.length} value-free command verification rows`
    ),
    currentCommandVerificationRows: commandVerificationRows,
    currentRerunCommand: textValue(externalProofBundle.currentRerunCommand, currentNextCommand),
    currentCommandSequenceCount,
    currentCommandSequenceSummary,
    currentCommandSequence,
    currentNextCommandConsensus,
    currentFirstBlockerConsensus,
    exactFirstBlockerConsensus,
    doctorFirstBlockerAligned,
    consistencyRows,
    consistencyReady: consistencyRows.every((row) => row.ready),
    userFacingCompletionPercent: releaseProgress.userFacingCompletionPercent,
    userFacingRemainingPercent: releaseProgress.userFacingRemainingPercent,
    currentTenPlanProgressLabel: releaseProgress.currentTenPlanWindowLabel,
    currentTenPlanWindowRowCount: integerValue(releaseProgress.currentTenPlanWindowRowCount),
    currentTenPlanWindowRowSummary: textValue(releaseProgress.currentTenPlanWindowRowSummary, "none"),
    currentTenPlanWindowRows: valueFreeObjectRows(releaseProgress.currentTenPlanWindowRows),
    audienceReadinessReady: releaseProgress.audienceReadinessReady === true,
    audienceReadinessRowCount: integerValue(releaseProgress.audienceReadinessRowCount),
    audienceReadinessRowSummary: textValue(releaseProgress.audienceReadinessRowSummary, "none"),
    audienceReadinessRows: valueFreeObjectRows(releaseProgress.audienceReadinessRows),
    audienceDeliveryPackagesReady: releaseProgress.audienceDeliveryPackagesReady === true,
    audienceDeliveryPackageRowCount: integerValue(releaseProgress.audienceDeliveryPackageRowCount),
    audienceDeliveryPackageRowSummary: textValue(releaseProgress.audienceDeliveryPackageRowSummary, "none"),
    audienceDeliveryPackageRows: valueFreeObjectRows(releaseProgress.audienceDeliveryPackageRows),
    beginnerAudienceReadinessReady: releaseProgress.beginnerAudienceReadinessReady === true,
    professionalProducerAudienceReadinessReady: releaseProgress.professionalProducerAudienceReadinessReady === true,
    nextExpectedOperatorSequence,
    sourceArtifacts: [
      { label: "Release doctor", path: relative(releaseDoctorJsonPath), present: true, valueRecorded: false },
      { label: "External proof bundle", path: relative(externalProofBundleJsonPath), present: true, valueRecorded: false },
      { label: "External distribution gate", path: relative(externalGateJsonPath), present: true, valueRecorded: false },
      { label: "Release progress report", path: relative(releaseProgressJsonPath), present: true, valueRecorded: false }
    ],
    privateValuesRecorded: false,
    networkProbeAttemptedByThisReport: false,
    releaseUploadAttemptedByThisReport: false,
    appleNotarySubmissionAttemptedByThisReport: false,
    signingAttemptedByThisReport: false,
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

function validateReport(report, { releaseDoctor, externalProofBundle, externalGate, releaseProgress }) {
  check(report.releaseCurrentBlockerReady === true, "release current blocker receipt should be ready");
  check(report.appName === appName, "release current blocker receipt should identify GrooveForge");
  check(report.bundleId === bundleId, `release current blocker receipt should identify ${bundleId}`);
  check(report.reportCommand === (fromExisting ? "npm run release:current-blocker-smoke" : "npm run release:current-blocker"), "release current blocker receipt should identify its command");
  check(report.sourceMode === (fromExisting ? "existing evidence" : "refreshed external release evidence"), "release current blocker receipt should identify its source mode");
  check(report.refreshCommandCount === report.refreshCommandSequence.length, "release current blocker refresh command count should match sequence");
  if (!fromExisting) {
    check(report.refreshCommandCount === refreshCommands.length, "release current blocker should record refresh command sequence count");
    check(report.refreshCommandSequence.includes("npm run release:doctor"), "release current blocker should refresh release doctor evidence");
    check(report.refreshCommandSequence.includes("npm run release:proof-bundle"), "release current blocker should refresh proof bundle evidence");
    check(report.refreshCommandSequence.includes("npm run desktop:external-distribution-gate-smoke"), "release current blocker should refresh external gate dry-run evidence");
    check(report.refreshCommandSequence.includes("npm run release:progress-smoke"), "release current blocker should refresh release progress evidence from refreshed sources");
  }
  check(report.currentEnvEditTarget === ".env.distribution.local", "release current blocker receipt should identify the current env edit target");
  check(
    ["npm run release:prepare-env", "npm run release:doctor"].includes(report.currentNextCommand),
    "release current blocker receipt should route local env setup to prepare-env or placeholder cleanup to release doctor"
  );
  check(report.hardGateCommand === "npm run release:external-check", "release current blocker receipt should keep the hard external gate command");
  check(report.currentRequiredKeyCount === report.currentRequiredKeys.length, "release current blocker required key count should match keys");
  check(report.currentPlaceholderKeyCount === report.currentPlaceholderKeys.length, "release current blocker placeholder key count should match keys");
  check(report.currentPlaceholderEditLocationCount === report.currentPlaceholderEditLocations.length, "release current blocker placeholder edit location count should match locations");
  check(report.currentEnvEditRowsCount === report.currentEnvEditRows.length, "release current blocker env edit row count should match rows");
  check(report.currentProofChecklistRowCount === report.currentProofChecklistRows.length, "release current blocker proof checklist row count should match rows");
  check(report.currentActionChecklistCount === report.currentActionChecklistRows.length, "release current blocker action checklist count should match rows");
  check(report.currentCommandVerificationRowCount === report.currentCommandVerificationRows.length, "release current blocker command verification row count should match rows");
  check(typeof report.currentPlaceholderEditLocationSummary === "string" && report.currentPlaceholderEditLocationSummary.length > 0, "release current blocker receipt should include current placeholder edit location summary");
  check(typeof report.currentEnvEditRowsSummary === "string" && report.currentEnvEditRowsSummary.length > 0, "release current blocker receipt should include current env edit rows summary");
  check(typeof report.currentProofChecklistRowSummary === "string" && report.currentProofChecklistRowSummary.length > 0, "release current blocker receipt should include current proof checklist row summary");
  check(typeof report.currentActionChecklistSummary === "string" && report.currentActionChecklistSummary.length > 0, "release current blocker receipt should include current action checklist summary");
  check(typeof report.currentCommandVerificationRowSummary === "string" && report.currentCommandVerificationRowSummary.length > 0, "release current blocker receipt should include current command verification row summary");
  check(typeof report.currentRerunCommand === "string" && report.currentRerunCommand.length > 0, "release current blocker receipt should include current rerun command");
  check(report.currentCommandSequenceCount === report.currentCommandSequence.length, "release current blocker command sequence count should match sequence");
  check(typeof report.currentCommandSequenceSummary === "string" && report.currentCommandSequenceSummary.length > 0, "release current blocker receipt should include current command sequence summary");
  check(report.currentCommandSequence.includes(report.currentNextCommand), "release current blocker command sequence should include current next command");
  check(report.currentCommandSequence.includes(report.currentRerunCommand), "release current blocker command sequence should include current rerun command");
  check(report.currentRequiredKeyCount === releaseChannelMetadataKeys.length, "release current blocker should focus on four release-channel metadata keys");
  check(sameStringArray(report.currentRequiredKeys, releaseChannelMetadataKeys), "release current blocker required keys should match release-channel metadata keys");
  if (report.currentNextCommand === "npm run release:doctor") {
    check(report.currentPlaceholderKeyCount === releaseChannelMetadataKeys.length, "release current blocker should report four release-channel placeholder keys when blocked here");
    check(sameStringArray(report.currentPlaceholderKeys, releaseChannelMetadataKeys), "release current blocker placeholder keys should match release-channel metadata keys");
    check(report.currentRerunCommand === "npm run release:current-blocker", "release current blocker receipt should make current-blocker the current rerun command when placeholders remain");
    check(
      report.currentActionChecklistRows.some((row) => typeof row.step === "string" && row.step.includes("npm run release:current-blocker")),
      "release current blocker action checklist should include current-blocker rerun when placeholders remain"
    );
  }
  check(report.currentPlaceholderEditLocations.every((row) => row.valueRecorded === false), "release current blocker placeholder locations should not record values");
  check(report.currentEnvEditRows.every((row) => row.valueRecorded === false), "release current blocker env edit rows should not record values");
  check(report.currentProofChecklistRows.every((row) => row.valueRecorded === false), "release current blocker proof checklist rows should not record values");
  check(report.currentActionChecklistRows.every((row) => row.valueRecorded === false), "release current blocker action checklist rows should not record values");
  check(report.currentCommandVerificationRows.every((row) => row.valueRecorded === false), "release current blocker command verification rows should not record values");
  check(report.currentNextCommandConsensus === true, "release current blocker should prove next command consensus");
  check(report.currentFirstBlockerConsensus === true, "release current blocker should prove proof/gate/progress blocker consensus");
  check(report.currentTenPlanWindowRowCount === report.currentTenPlanWindowRows.length, "release current blocker 10-plan row count should match rows");
  check(report.currentTenPlanProgressLabel === releaseProgress.currentTenPlanWindowLabel, "release current blocker should mirror release progress 10-plan label");
  check(report.currentTenPlanWindowRowCount === releaseProgress.currentTenPlanWindowRowCount, "release current blocker should mirror release progress 10-plan row count");
  check(report.currentTenPlanWindowRows.every((row) => row.valueRecorded === false), "release current blocker 10-plan rows should not record values");
  check(report.audienceReadinessReady === true, "release current blocker should include ready audience readiness");
  check(report.audienceReadinessRowCount === report.audienceReadinessRows.length, "release current blocker audience row count should match rows");
  check(report.audienceReadinessRowCount === releaseProgress.audienceReadinessRowCount, "release current blocker should mirror release progress audience row count");
  check(report.audienceReadinessRows.every((row) => row.valueRecorded === false), "release current blocker audience readiness rows should not record values");
  check(report.audienceReadinessRows.every((row) => row.ready === true), "release current blocker audience readiness rows should be ready");
  check(report.audienceReadinessRows.every((row) => row.deliveryPackageReady === true), "release current blocker audience readiness rows should include ready delivery packages");
  check(report.audienceReadinessRows.every((row) => row.deliveryArtifactCount === 8), "release current blocker audience readiness rows should include eight delivery artifacts");
  check(report.audienceDeliveryPackagesReady === releaseProgress.audienceDeliveryPackagesReady, "release current blocker should mirror persona delivery package readiness");
  check(report.audienceDeliveryPackageRowCount === releaseProgress.audienceDeliveryPackageRowCount, "release current blocker should mirror persona delivery package row count");
  check(report.audienceDeliveryPackageRows.every((row) => row.valueRecorded === false), "release current blocker persona delivery package rows should not record values");
  check(report.audienceDeliveryPackageRows.every((row) => row.ready === true && row.artifactCount === 8), "release current blocker persona delivery package rows should be ready with all artifacts");
  check(report.beginnerAudienceReadinessReady === releaseProgress.beginnerAudienceReadinessReady, "release current blocker should mirror first-time composer readiness");
  check(report.professionalProducerAudienceReadinessReady === releaseProgress.professionalProducerAudienceReadinessReady, "release current blocker should mirror professional producer readiness");
  check(report.consistencyReady === true, "release current blocker should pass all consistency checks");
  check(releaseDoctor.completionGapClaimedExternalDistribution === false, "release doctor source should not claim external distribution");
  check(releaseDoctor.completionGapValueRecorded === false, "release doctor source should not record completion gap values");
  check(externalProofBundle.privateValuesRecorded === false, "external proof bundle source should not record private values");
  check(externalGate.privateValuesRecorded === false, "external gate source should not record private values");
  check(releaseProgress.userFacingCompletionPrivateValueRecorded === false, "release progress source should not record private values");
  check(report.privateValuesRecorded === false, "release current blocker receipt should not record private values");
  check(report.networkProbeAttemptedByThisReport === false, "release current blocker receipt should not probe network");
  check(report.releaseUploadAttemptedByThisReport === false, "release current blocker receipt should not upload releases");
  check(report.appleNotarySubmissionAttemptedByThisReport === false, "release current blocker receipt should not submit to Apple");
  check(report.signingAttemptedByThisReport === false, "release current blocker receipt should not sign artifacts");
  check(report.claimedExternalDistribution === false, "release current blocker receipt should not claim external distribution");
}

function buildMarkdown(report) {
  const lines = [
    "# GrooveForge Release Current Blocker",
    "",
    "This value-free receipt verifies that release doctor, external proof bundle, external distribution gate, and release progress evidence agree on the current external release blocker.",
    "",
    "## Summary",
    "",
    `- App: ${report.appName}`,
    `- Bundle ID: ${report.bundleId}`,
    `- Report command: \`${report.reportCommand}\``,
    `- Source mode: ${report.sourceMode}`,
    `- Refresh command count: ${report.refreshCommandCount}`,
    `- Current target: ${report.currentTarget}`,
    `- Current state: ${report.releaseCurrentBlockerState}`,
    `- Current next command: \`${report.currentNextCommand}\``,
    `- Current first blocker: ${report.currentFirstBlocker}`,
    `- Doctor first blocker: ${report.doctorFirstBlocker}`,
    `- Current env edit target: ${report.currentEnvEditTarget}`,
    `- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})`,
    `- Current action checklist rows: ${report.currentActionChecklistCount} (${report.currentActionChecklistSummary})`,
    `- Current rerun command: \`${report.currentRerunCommand}\``,
    `- Current command sequence: ${report.currentCommandSequenceCount} (${report.currentCommandSequenceSummary})`,
    `- Hard gate command: \`${report.hardGateCommand}\``,
    `- Overall completion: ${Number(report.userFacingCompletionPercent).toFixed(6)}%`,
    `- Remaining completion: ${Number(report.userFacingRemainingPercent).toFixed(6)}%`,
    `- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`,
    `- Current 10-plan rows: ${report.currentTenPlanWindowRowCount} (${report.currentTenPlanWindowRowSummary})`,
    `- Audience readiness ready: ${report.audienceReadinessReady ? "yes" : "no"}`,
    `- Audience readiness rows: ${report.audienceReadinessRowCount} (${report.audienceReadinessRowSummary})`,
    `- Persona delivery packages ready: ${report.audienceDeliveryPackagesReady ? "yes" : "no"}`,
    `- Persona delivery package rows: ${report.audienceDeliveryPackageRowCount} (${report.audienceDeliveryPackageRowSummary})`,
    `- First-time composer readiness: ${report.beginnerAudienceReadinessReady ? "yes" : "no"}`,
    `- Professional producer readiness: ${report.professionalProducerAudienceReadinessReady ? "yes" : "no"}`,
    `- Private values recorded: ${report.privateValuesRecorded ? "yes" : "no"}`,
    `- External distribution claimed: ${report.claimedExternalDistribution ? "yes" : "no"}`,
    "",
    "## Required Keys",
    "",
    `- Current required keys: ${report.currentRequiredKeyCount} (${formatKeyList(report.currentRequiredKeys)})`,
    `- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})`,
    "",
    "## Current 10-Plan Window Rows",
    "",
    "| plan | file | path | value recorded |",
    "|---|---|---|---|",
    formatCompletedPlanRows(report.currentTenPlanWindowRows),
    "",
    "## Audience Readiness",
    "",
    "| audience | role | ready | mode | bars | delivery | style | package ready | artifacts | value recorded |",
    "|---|---|---:|---|---:|---|---|---:|---:|---:|",
    formatAudienceRows(report.audienceReadinessRows),
    "",
    "## Persona Delivery Packages",
    "",
    "| persona | workflow | ready | mode | bars | delivery | artifacts | package | value recorded |",
    "|---|---|---:|---|---:|---|---:|---|---:|",
    formatDeliveryPackageRows(report.audienceDeliveryPackageRows),
    "",
    "## Placeholder Edit Locations",
    "",
    "| location | key | placeholder | value recorded |",
    "|---|---|---|---|",
    formatLocationRows(report.currentPlaceholderEditLocations),
    "",
    "## Current Edit Guidance",
    "",
    "| location | key | assignment shape | guidance | value recorded |",
    "|---|---|---|---|---|",
    formatEditRows(report.currentEnvEditRows),
    "",
    "## Current Action Checklist Rows",
    "",
    "| order | step | value recorded |",
    "|---|---|---|",
    formatActionChecklistRows(report.currentActionChecklistRows),
    "",
    "## Evidence Consistency",
    "",
    "| check | ready | evidence |",
    "|---|---|---|",
    formatConsistencyRows(report.consistencyRows),
    "",
    "## Proof Checklist Rows",
    "",
    "| order | criterion | proof command | hard gate | value recorded |",
    "|---|---|---|---|---|",
    report.currentProofChecklistRows
      .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.criterion)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.hardGateCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
      .join("\n"),
    "",
    "## Command Verification Rows",
    "",
    "| order | command | role | value recorded |",
    "|---|---|---|---|",
    formatCommandRows(report.currentCommandVerificationRows),
    "",
    "## Refresh Commands",
    "",
    ...(report.refreshCommandSequence.length > 0 ? report.refreshCommandSequence.map((command, index) => `${index + 1}. \`${command}\``) : ["1. Existing evidence only; no refresh commands were run by this smoke."]),
    "",
    "## Next Expected Operator Sequence",
    "",
    ...report.nextExpectedOperatorSequence.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## Source Artifacts",
    "",
    "| label | present | path | value recorded |",
    "|---|---|---|---|",
    report.sourceArtifacts.map((item) => `| ${escapeCell(item.label)} | ${item.present ? "yes" : "no"} | ${escapeCell(item.path)} | ${item.valueRecorded ? "yes" : "no"} |`).join("\n"),
    "",
    "## Not Claimed",
    "",
    "- No Developer ID signing, notarization, Gatekeeper approval, auto-update readiness, manual QA approval, app-store submission, release upload, network probe, or external distribution completion is claimed by this receipt."
  ];

  return `${lines.join("\n")}\n`;
}

if (!fromExisting) {
  await runRefreshCommands();
}

const releaseDoctor = await readRequiredJson(releaseDoctorJsonPath, "Release doctor");
const externalProofBundle = await readRequiredJson(externalProofBundleJsonPath, "External proof bundle");
const externalGate = await readRequiredJson(externalGateJsonPath, "External distribution gate");
const releaseProgress = await readRequiredJson(releaseProgressJsonPath, "Release progress report");
const report = buildReport({ releaseDoctor, externalProofBundle, externalGate, releaseProgress });
validateReport(report, { releaseDoctor, externalProofBundle, externalGate, releaseProgress });

await mkdir(packageRoot, { recursive: true });
const markdown = buildMarkdown(report);
check(!/https?:\/\//i.test(markdown), "release current blocker Markdown should not include URL values");
check(!/GROOVEFORGE_RELEASE_DOWNLOAD_URL=https?:\/\//i.test(markdown), "release current blocker Markdown should not include release URL assignments with values");
check(!/GROOVEFORGE_RELEASE_NOTES_URL=https?:\/\//i.test(markdown), "release current blocker Markdown should not include release notes URL assignments with values");
check(!/GROOVEFORGE_SUPPORT_URL=https?:\/\//i.test(markdown), "release current blocker Markdown should not include support URL assignments with values");

if (failures.length > 0) {
  fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
}

await writeFile(currentBlockerMarkdownPath, markdown);
await writeFile(currentBlockerJsonPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(`GrooveForge release current blocker${fromExisting ? " smoke" : ""} passed.`);
console.log(`- Markdown: ${relative(currentBlockerMarkdownPath)}`);
console.log(`- JSON: ${relative(currentBlockerJsonPath)}`);
console.log(`- Source mode: ${report.sourceMode}`);
console.log(`- Refresh commands: ${report.refreshCommandCount}`);
console.log(`- Current target: ${report.currentTarget}`);
console.log(`- Current next command: ${report.currentNextCommand}`);
console.log(`- Current first blocker: ${report.currentFirstBlocker}`);
console.log(`- Current env edit target: ${report.currentEnvEditTarget}`);
console.log(`- Current required keys: ${report.currentRequiredKeyCount} (${formatKeyList(report.currentRequiredKeys)})`);
console.log(`- Current placeholder keys: ${report.currentPlaceholderKeyCount} (${formatKeyList(report.currentPlaceholderKeys)})`);
console.log(`- Current placeholder edit locations: ${report.currentPlaceholderEditLocationCount} (${report.currentPlaceholderEditLocationSummary})`);
console.log(`- Current env edit rows: ${report.currentEnvEditRowsCount} (${report.currentEnvEditRowsSummary})`);
console.log(`- Current proof checklist rows: ${report.currentProofChecklistRowCount} (${report.currentProofChecklistRowSummary})`);
console.log(`- Current action checklist rows: ${report.currentActionChecklistCount} (${report.currentActionChecklistSummary})`);
console.log(`- Current rerun command: ${report.currentRerunCommand}`);
console.log(`- Current command sequence: ${report.currentCommandSequenceCount} (${report.currentCommandSequenceSummary})`);
console.log(`- Current command verification rows: ${report.currentCommandVerificationRowCount} (${report.currentCommandVerificationRowSummary})`);
console.log(`- Consistency ready: ${report.consistencyReady ? "yes" : "no"}`);
console.log(`- Overall completion: ${Number(report.userFacingCompletionPercent).toFixed(6)}%`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- Current 10-plan rows: ${report.currentTenPlanWindowRowCount} (${report.currentTenPlanWindowRowSummary})`);
console.log(`- Audience readiness ready: ${report.audienceReadinessReady ? "yes" : "no"}`);
console.log(`- Audience readiness rows: ${report.audienceReadinessRowCount} (${report.audienceReadinessRowSummary})`);
console.log(`- Persona delivery packages ready: ${report.audienceDeliveryPackagesReady ? "yes" : "no"}`);
console.log(`- Persona delivery package rows: ${report.audienceDeliveryPackageRowCount} (${report.audienceDeliveryPackageRowSummary})`);
console.log(`- First-time composer readiness: ${report.beginnerAudienceReadinessReady ? "yes" : "no"}`);
console.log(`- Professional producer readiness: ${report.professionalProducerAudienceReadinessReady ? "yes" : "no"}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted by this report");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
