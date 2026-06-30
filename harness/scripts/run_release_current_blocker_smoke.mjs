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
const externalNextActionsJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-next-actions.json`);
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
    return "| none | none | no | none | none | none | none | no | no | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.audience)} | ${escapeCell(row.readinessRole)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.workflowMode)} | ${row.workflowBars ?? 0} | ${escapeCell(row.workflowDeliveryTarget)} | ${escapeCell(row.workflowStyle)} | ${row.deliveryPackageReady ? "yes" : "no"} | ${row.deliveryPackageReopenReady ? "yes" : "no"} | ${row.deliveryArtifactCount ?? 0} | ${row.verifiedDeliveryArtifactCount ?? 0} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatAudienceAcceptanceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | no | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.audience)} | ${escapeCell(row.acceptanceArea)} | ${escapeCell(row.criterion)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.evidenceSource)} | ${escapeCell(row.evidenceSummary)} | ${escapeCell(row.workflowLabel)} | ${row.artifactCount ?? 0} | ${row.verifiedArtifactCount ?? 0} | ${row.valueRecorded === false ? "no" : "yes"} |`)
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

function formatDeliveryPackageReopenRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | no | no | no | no | no | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.persona)} | ${escapeCell(row.workflowLabel)} | ${row.ready ? "yes" : "no"} | ${row.artifactCount ?? 0} | ${row.verifiedArtifactCount ?? 0} | ${row.projectReopened ? "yes" : "no"} | ${row.hashesReady ? "yes" : "no"} | ${row.wavHeadersReady ? "yes" : "no"} | ${row.midiHeaderReady ? "yes" : "no"} | ${row.handoffReady ? "yes" : "no"} | ${escapeCell(row.packageRoot)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatReleaseChannelUnblockRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | no | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.key)} | ${row.present ? "yes" : "no"} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.evidence)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatPrivateEditSafetyRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.check)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.command)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCurrentInputShapeRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.key)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.evidenceSource)} | \`${escapeCell(row.rerunCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatLocalEnvDiagnosticRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.diagnostic)} | ${escapeCell(row.status)} | ${escapeCell(row.evidence)} | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatHardGateRequirementRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | none | 0 | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.evidence)} | ${row.blockerCount ?? 0} | ${escapeCell(row.blockerSummary)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatPriorityActionRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | none | 0 | 0 | 0 | 0 | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.id)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.label)} | \`${escapeCell(row.nextCommand)}\` | ${escapeCell(row.rerunCommandSummary)} | ${row.placeholderKeyCount ?? 0} | ${row.evidenceRowCount ?? 0} | ${row.readyCriteriaCount ?? 0} | ${row.actionChecklistCount ?? 0} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCurrentActionTransitionRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | no | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.stage)} | ${escapeCell(row.actionId)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.label)} | ${escapeCell(row.blocker)} | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.rerunCommandSummary)} | ${escapeCell(row.sourceField)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatNextActionReadyCriteriaRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.criterion)} | ${escapeCell(row.sourceField)} | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.blocker)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatNextActionChecklistRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.step)} | \`${escapeCell(row.proofCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatNextActionEvidenceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.label)} | ${escapeCell(row.path)} | ${row.present ? "yes" : "no"} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatNextActionBlockerRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.blocker)} | ${escapeCell(row.sourceField)} | \`${escapeCell(row.proofCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatNextActionVerificationRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${row.currentReady ? "yes" : "no"} | ${escapeCell(row.criterion)} | ${escapeCell(row.currentEvidence)} | ${escapeCell(row.expectedSignal)} | \`${escapeCell(row.proofCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatNextActionPrerequisiteCommandRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | \`${escapeCell(row.command)}\` | ${escapeCell(row.sourceField)} | \`${escapeCell(row.proofCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatNextActionOperatorActionRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.action)} | ${escapeCell(row.sourceField)} | \`${escapeCell(row.proofCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatNextActionEnvEditRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.location)} | ${escapeCell(row.key)} | \`${escapeCell(row.assignment)}\` | ${escapeCell(row.guidance)} | \`${escapeCell(row.proofCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatExternalCompletionChecklistRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | none | none | none | 0 | 0 | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.id)} | ${escapeCell(row.label)} | ${escapeCell(row.firstBlocker)} | \`${escapeCell(row.proofCommand)}\` | ${escapeCell(row.rerunCommandSummary)} | ${escapeCell(row.evidenceSummary)} | ${row.readyCriteriaCount ?? 0} | ${row.actionChecklistCount ?? 0} | \`${escapeCell(row.hardGateCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCurrentActionAcceptanceRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.criterion)} | ${escapeCell(row.evidence)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCurrentActionAcceptanceBlockerRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.criterion)} | ${escapeCell(row.blocker)} | ${escapeCell(row.sourceField)} | ${escapeCell(row.operatorAction)} | \`${escapeCell(row.rerunCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCurrentActionAcceptanceRemediationRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.criterion)} | ${escapeCell(row.operatorFix)} | ${escapeCell(row.evidenceToCheck)} | ${escapeCell(row.expectedReadySignal)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCurrentReleaseChannelKeyRemediationRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.key)} | ${row.placeholder ? "yes" : "no"} | ${escapeCell(row.location)} | ${escapeCell(row.expectedShape)} | ${escapeCell(row.acceptanceCriteriaImpacted)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCurrentCommandAcceptanceLadderRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | \`${escapeCell(row.command)}\` | ${escapeCell(row.role)} | ${escapeCell(row.acceptanceSignal)} | ${escapeCell(row.sourceArtifacts)} | ${escapeCell(row.evidenceLabels)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | \`${escapeCell(row.hardGateCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCurrentCommandSourceArtifactRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | no | 0 | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.artifactPath)} | ${row.present ? "yes" : "no"} | ${row.commandCount ?? 0} | ${escapeCell(row.consumingCommands)} | ${escapeCell(row.evidenceLabels)} | ${escapeCell(row.acceptanceSignals)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCurrentActionPostEditVerificationRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | none | none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${row.currentReady ? "yes" : "no"} | ${escapeCell(row.criterion)} | ${escapeCell(row.currentEvidence)} | ${escapeCell(row.expectedSignal)} | ${escapeCell(row.sourceField)} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function formatCurrentActionHandoffRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | none | none | none | 0 | 0 | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${row.order ?? "?"} | ${escapeCell(row.item)} | ${escapeCell(row.sourceField)} | ${escapeCell(row.evidence)} | ${row.blockerCount ?? 0} | ${row.acceptanceBlockerCount ?? 0} | \`${escapeCell(row.proofCommand)}\` | \`${escapeCell(row.rerunCommand)}\` | \`${escapeCell(row.hardGateCommand)}\` | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function priorityActionRows(externalNextActions) {
  return valueFreeObjectRows(externalNextActions.priorityActions).map((action, index) => {
    const rerunCommands = stringArrayValue(action.rerunCommands);
    return {
      order: index + 1,
      id: textValue(action.id),
      label: textValue(action.label),
      ready: action.ready === true,
      nextCommand: textValue(action.nextCommand),
      rerunCommands,
      rerunCommandSummary: rerunCommands.length > 0 ? rerunCommands.join(", ") : "none",
      firstBlocker: textValue(action.firstBlocker),
      placeholderKeyCount: stringArrayValue(action.placeholderKeys).length,
      evidenceRowCount: Array.isArray(action.evidence) ? action.evidence.length : 0,
      readyCriteriaCount: stringArrayValue(action.readyCriteria).length,
      actionChecklistCount: stringArrayValue(action.actionChecklist).length,
      valueRecorded: false
    };
  });
}

function currentActionTransitionRows({ priorityRows, currentNextCommand, hardGateCommand }) {
  const currentAction = priorityRows[0] ?? null;
  const nextAction = priorityRows[1] ?? null;
  return [
    {
      order: 1,
      stage: "current action",
      actionId: textValue(currentAction?.id, "none"),
      label: textValue(currentAction?.label, "none"),
      ready: currentAction?.ready === true,
      blocker: textValue(currentAction?.firstBlocker, "none"),
      proofCommand: textValue(currentAction?.nextCommand, currentNextCommand),
      rerunCommandSummary: textValue(currentAction?.rerunCommandSummary, "none"),
      sourceField: "priorityActionRows[0]",
      valueRecorded: false
    },
    {
      order: 2,
      stage: "next pending after current clears",
      actionId: textValue(nextAction?.id, "none"),
      label: textValue(nextAction?.label, "none"),
      ready: nextAction?.ready === true,
      blocker: textValue(nextAction?.firstBlocker, "none"),
      proofCommand: textValue(nextAction?.nextCommand, "none"),
      rerunCommandSummary: textValue(nextAction?.rerunCommandSummary, "none"),
      sourceField: "priorityActionRows[1]",
      valueRecorded: false
    },
    {
      order: 3,
      stage: "final hard gate",
      actionId: "final-hard-gate",
      label: "Run hard external distribution gate",
      ready: false,
      blocker: "Run only after all value-free external proof requirements are ready.",
      proofCommand: hardGateCommand,
      rerunCommandSummary: hardGateCommand,
      sourceField: "hardGateCommand",
      valueRecorded: false
    }
  ];
}

function nextActionReadyCriteriaSourceField(criterion) {
  const lower = textValue(criterion).toLowerCase();
  if (lower.includes("update feed config")) {
    return "externalNextActions.priorityActions[1].readyCriteria/updateFeedConfig";
  }
  if (lower.includes("auto-update readiness")) {
    return "externalNextActions.priorityActions[1].readyCriteria/autoUpdateReadiness";
  }
  if (lower.includes("signed") && lower.includes("notarized")) {
    return "externalNextActions.priorityActions[1].readyCriteria/updateMetadataArtifacts";
  }
  return "externalNextActions.priorityActions[1].readyCriteria";
}

function nextActionReadyCriteriaRows(nextAction) {
  const proofCommand = textValue(nextAction?.nextCommand);
  const blocker = textValue(nextAction?.firstBlocker);
  return stringArrayValue(nextAction?.readyCriteria).map((criterion, index) => ({
    order: index + 1,
    criterion,
    sourceField: nextActionReadyCriteriaSourceField(criterion),
    proofCommand,
    blocker,
    valueRecorded: false
  }));
}

function nextActionChecklistRows(nextAction) {
  const proofCommand = textValue(nextAction?.nextCommand);
  return stringArrayValue(nextAction?.actionChecklist).map((step, index) => ({
    order: index + 1,
    step,
    proofCommand,
    valueRecorded: false
  }));
}

function nextActionEvidenceRows(nextAction) {
  return valueFreeObjectRows(nextAction?.evidence).map((row) => ({
    label: textValue(row.label),
    path: textValue(row.path),
    present: row.present === true,
    valueRecorded: false
  }));
}

function nextActionBlockerRows(nextAction) {
  const proofCommand = textValue(nextAction?.nextCommand);
  return stringArrayValue(nextAction?.blockers).map((blocker, index) => ({
    order: index + 1,
    blocker,
    sourceField: "externalNextActions.priorityActions[1].blockers",
    proofCommand,
    valueRecorded: false
  }));
}

function nextActionExpectedSignal(criterion) {
  const lower = textValue(criterion).toLowerCase();
  if (lower.includes("update feed config")) {
    return "one safe feed URL key ready; one valid update channel key ready; value recorded no";
  }
  if (lower.includes("auto-update readiness")) {
    return "auto-update readiness ready yes; provider/feed/channel metadata ready; value recorded no";
  }
  if (lower.includes("signed") && lower.includes("notarized")) {
    return "signed/notarized update metadata artifacts ready after Developer ID, notarization, and Gatekeeper evidence; value recorded no";
  }
  return "next action ready signal present; value recorded no";
}

function nextActionCurrentEvidenceForCriterion(criterion, blockers) {
  const lower = textValue(criterion).toLowerCase();
  if (lower.includes("update feed config")) {
    return blockers.find((blocker) => /provider, feed url, and channel metadata/i.test(blocker)) ?? "none";
  }
  if (lower.includes("auto-update readiness")) {
    return blockers.find((blocker) => /auto-update readiness is not complete/i.test(blocker)) ?? "none";
  }
  if (lower.includes("signed") && lower.includes("notarized")) {
    return blockers.find((blocker) => /signed\/notarized update metadata artifacts/i.test(blocker)) ?? "none";
  }
  return blockers.length > 0 ? blockers.join("; ") : "none";
}

function nextActionVerificationRows(nextAction) {
  const proofCommand = textValue(nextAction?.nextCommand);
  const blockers = stringArrayValue(nextAction?.blockers);
  const currentReady = nextAction?.ready === true && blockers.length === 0;
  return stringArrayValue(nextAction?.readyCriteria).map((criterion, index) => ({
    order: index + 1,
    criterion,
    currentReady,
    currentEvidence: nextActionCurrentEvidenceForCriterion(criterion, blockers),
    expectedSignal: nextActionExpectedSignal(criterion),
    sourceField: "externalNextActions.priorityActions[1].readyCriteria/blockers",
    proofCommand,
    valueRecorded: false
  }));
}

function nextActionPrerequisiteCommandRows(nextAction) {
  const proofCommand = textValue(nextAction?.nextCommand);
  return stringArrayValue(nextAction?.prerequisiteCommands).map((command, index) => ({
    order: index + 1,
    command,
    sourceField: "externalNextActions.priorityActions[1].prerequisiteCommands",
    proofCommand,
    valueRecorded: false
  }));
}

function nextActionOperatorActionRows(nextAction) {
  const proofCommand = textValue(nextAction?.nextCommand);
  return stringArrayValue(nextAction?.operatorActions).map((action, index) => ({
    order: index + 1,
    action,
    sourceField: "externalNextActions.priorityActions[1].operatorActions",
    proofCommand,
    valueRecorded: false
  }));
}

function nextActionEnvEditRows(nextAction) {
  const proofCommand = textValue(nextAction?.nextCommand);
  return valueFreeObjectRows(nextAction?.envEditRows).map((row, index) => ({
    order: index + 1,
    key: textValue(row.key),
    location: textValue(row.location, row.file && row.line ? `${row.file}:${row.line}` : row.editTarget ?? "none"),
    assignment: textValue(row.assignment),
    guidance: textValue(row.guidance),
    placeholder: row.placeholder === true,
    sourceField: "externalNextActions.priorityActions[1].envEditRows",
    proofCommand,
    valueRecorded: false
  }));
}

function currentActionAcceptanceBlockerRows({
  acceptanceRows,
  currentEnvEditTarget,
  currentPlaceholderEditLocationSummary,
  currentNextCommand,
  currentRerunCommand
}) {
  return valueFreeObjectRows(acceptanceRows)
    .filter((row) => row.ready !== true)
    .map((row, index) => {
      const criterion = textValue(row.criterion);
      const lower = criterion.toLowerCase();
      let sourceField = "currentActionAcceptanceRows";
      let operatorAction = `Rerun ${currentRerunCommand} after resolving this criterion.`;

      if (lower.includes("without placeholder values")) {
        sourceField = "externalProofBundle.currentPlaceholderKeys/currentPlaceholderEditLocations";
        operatorAction = `Replace current release-channel placeholder keys in ${currentEnvEditTarget}: ${currentPlaceholderEditLocationSummary}.`;
      } else if (lower.includes("private-inputs") || lower.includes("private inputs")) {
        sourceField = "releaseDoctor.privateInputsReady/channelMetadataReady/privateValuesRecorded";
        operatorAction = `Run ${currentNextCommand} after replacing the current release-channel metadata placeholders.`;
      } else if (lower.includes("distribution-channel qa")) {
        sourceField = "releaseDoctor.distributionChannelQaReady/channelMetadataReady/privateValuesRecorded";
        operatorAction = "Run npm run desktop:distribution-channel-qa-smoke after release doctor reports channel metadata ready.";
      }

      return {
        order: index + 1,
        criterion,
        blocker: textValue(row.evidence),
        sourceField,
        operatorAction,
        proofCommand: currentNextCommand,
        rerunCommand: currentRerunCommand,
        valueRecorded: false
      };
    });
}

function currentActionAcceptanceRemediationRows({
  acceptanceRows,
  blockerRows,
  postEditVerificationRows,
  currentInputShapeChecklistRows,
  currentLocalEnvDiagnosticRows,
  currentNextCommand,
  currentRerunCommand,
  hardGateCommand
}) {
  const blockerByCriterion = new Map(valueFreeObjectRows(blockerRows).map((row) => [textValue(row.criterion), row]));
  const verificationByCriterion = new Map(valueFreeObjectRows(postEditVerificationRows).map((row) => [textValue(row.criterion), row]));
  const shapeSummary = valueFreeObjectRows(currentInputShapeChecklistRows)
    .map((row) => `${textValue(row.key)}: ${textValue(row.expectedShape)}`)
    .join("; ");
  const diagnosticSummary = valueFreeObjectRows(currentLocalEnvDiagnosticRows)
    .map((row) => `${textValue(row.diagnostic)} ${textValue(row.status)}`)
    .join("; ");

  return valueFreeObjectRows(acceptanceRows)
    .filter((row) => row.ready !== true)
    .map((row, index) => {
      const criterion = textValue(row.criterion);
      const blocker = blockerByCriterion.get(criterion) ?? {};
      const verification = verificationByCriterion.get(criterion) ?? {};
      const lower = criterion.toLowerCase();
      let operatorFix = textValue(blocker.operatorAction, `Rerun ${currentRerunCommand} after resolving this criterion.`);
      let evidenceToCheck = textValue(blocker.sourceField, "currentActionAcceptanceRows");

      if (lower.includes("without placeholder values")) {
        evidenceToCheck = `${textValue(blocker.sourceField, "currentPlaceholderKeys")}; input shape checklist: ${shapeSummary || "shape evidence pending"}`;
      } else if (lower.includes("private-inputs") || lower.includes("private inputs")) {
        evidenceToCheck = `${textValue(blocker.sourceField, "privateInputsReady")}; local env diagnostics: ${diagnosticSummary || "diagnostic evidence pending"}`;
      } else if (lower.includes("distribution-channel qa")) {
        operatorFix = "Run npm run desktop:distribution-channel-qa-smoke after release doctor reports channel metadata ready.";
        evidenceToCheck = textValue(blocker.sourceField, "distributionChannelQaReady/channelMetadataReady");
      }

      return {
        order: index + 1,
        criterion,
        currentReady: row.ready === true,
        operatorFix,
        evidenceToCheck,
        expectedReadySignal: textValue(verification.expectedSignal, "criterion ready yes without recording private values"),
        sourceField: textValue(blocker.sourceField, "currentActionAcceptanceRows"),
        proofCommand: currentNextCommand,
        rerunCommand: currentRerunCommand,
        hardGateCommand,
        valueRecorded: false
      };
    });
}

function currentReleaseChannelKeyRemediationRows({
  currentRequiredKeys,
  currentPlaceholderEditLocations,
  currentInputShapeChecklistRows,
  acceptanceRows,
  currentNextCommand,
  currentRerunCommand,
  hardGateCommand
}) {
  const locationByKey = new Map(valueFreeObjectRows(currentPlaceholderEditLocations).map((row) => [textValue(row.key), row]));
  const shapeByKey = new Map(valueFreeObjectRows(currentInputShapeChecklistRows).map((row) => [textValue(row.key), row]));
  const acceptanceCriteria = valueFreeObjectRows(acceptanceRows)
    .filter((row) => row.ready !== true)
    .map((row) => textValue(row.criterion))
    .join("; ");
  const acceptanceSourceFields = [
    "currentActionAcceptanceRows",
    "currentActionAcceptanceBlockerRows",
    "currentActionAcceptanceRemediationRows"
  ].join("; ");

  return stringArrayValue(currentRequiredKeys).map((key, index) => {
    const locationRow = locationByKey.get(key) ?? {};
    const shapeRow = shapeByKey.get(key) ?? {};
    return {
      order: index + 1,
      key,
      location: textValue(locationRow.location, textValue(locationRow.file) !== "none" && Number.isInteger(locationRow.line) ? `${locationRow.file}:${locationRow.line}` : "none"),
      placeholder: locationRow.placeholder === true,
      expectedShape: textValue(shapeRow.expectedShape, "shape evidence pending"),
      evidenceSource: `${textValue(locationRow.location, "missing location")}; ${textValue(shapeRow.evidenceSource, "missing shape evidence")}`,
      acceptanceCriteriaImpacted: acceptanceCriteria || "none",
      acceptanceSourceFields,
      proofCommand: currentNextCommand,
      rerunCommand: currentRerunCommand,
      hardGateCommand,
      valueRecorded: false
    };
  });
}

function postEditExpectedSignal(postEditVerificationRows, pattern, fallback) {
  return textValue(
    valueFreeObjectRows(postEditVerificationRows).find((row) => pattern.test(textValue(row.criterion)))?.expectedSignal,
    fallback
  );
}

function currentCommandAcceptanceSignal(command, role, postEditVerificationRows) {
  const lower = textValue(command).toLowerCase();
  const placeholderSignal = postEditExpectedSignal(
    postEditVerificationRows,
    /without placeholder values/i,
    "current required keys present and current placeholder key count is 0"
  );
  const privateInputsSignal = postEditExpectedSignal(
    postEditVerificationRows,
    /private-inputs|private inputs/i,
    "private inputs ready yes; channel metadata ready yes; private values recorded no"
  );
  const channelQaSignal = postEditExpectedSignal(
    postEditVerificationRows,
    /distribution-channel qa/i,
    "distribution-channel QA ready yes; channel metadata ready yes; private values recorded no"
  );
  const acceptanceReadySignal = "current action acceptance ready yes; current priority action advances without recording private values";

  if (lower.includes("distribution-env-template")) {
    return `ignored local env template and loader ready; ${placeholderSignal}; value recorded no`;
  }
  if (lower.includes("distribution-private-inputs")) {
    return `${placeholderSignal}; ${privateInputsSignal}`;
  }
  if (lower.includes("release:doctor")) {
    return `${privateInputsSignal}; ${channelQaSignal}`;
  }
  if (lower.includes("release:current-blocker")) {
    return `${acceptanceReadySignal}; ${placeholderSignal}; ${privateInputsSignal}; ${channelQaSignal}`;
  }
  if (lower.includes("distribution-channel-qa")) {
    return channelQaSignal;
  }
  return role === "proof" ? `${acceptanceReadySignal}; value recorded no` : "value-free command evidence refreshed without private values";
}

function currentCommandAcceptanceLadderRows({
  currentCommandVerificationRows,
  postEditVerificationRows,
  currentNextCommand,
  currentRerunCommand,
  hardGateCommand
}) {
  return valueFreeObjectRows(currentCommandVerificationRows).map((row, index) => {
    const command = textValue(row.command);
    const evidencePaths = stringArrayValue(row.evidencePaths);
    const evidenceLabels = stringArrayValue(row.evidenceLabels);
    return {
      order: index + 1,
      command,
      role: textValue(row.role),
      acceptanceSignal: currentCommandAcceptanceSignal(command, textValue(row.role), postEditVerificationRows),
      sourceArtifacts: evidencePaths.length > 0 ? evidencePaths.join("; ") : textValue(row.evidenceSummary),
      evidenceLabels: evidenceLabels.length > 0 ? evidenceLabels.join("; ") : textValue(row.evidenceSummary),
      sourceField: "externalProofBundle.currentCommandVerificationRows/currentActionPostEditVerificationRows",
      proofCommand: currentNextCommand,
      rerunCommand: currentRerunCommand,
      hardGateCommand,
      valueRecorded: false
    };
  });
}

function currentCommandSourceArtifactRows({
  currentCommandVerificationRows,
  commandAcceptanceLadderRows,
  currentNextCommand,
  currentRerunCommand,
  hardGateCommand
}) {
  const acceptanceSignalByCommand = new Map(
    valueFreeObjectRows(commandAcceptanceLadderRows).map((row) => [textValue(row.command), textValue(row.acceptanceSignal)])
  );
  const artifactsByPath = new Map();

  for (const row of valueFreeObjectRows(currentCommandVerificationRows)) {
    const command = textValue(row.command);
    const role = textValue(row.role);
    const evidencePaths = stringArrayValue(row.evidencePaths);
    const evidenceLabels = stringArrayValue(row.evidenceLabels);

    for (const [index, artifactPath] of evidencePaths.entries()) {
      const artifact = artifactsByPath.get(artifactPath) ?? {
        artifactPath,
        present: existsSync(path.join(root, artifactPath)),
        consumingCommands: [],
        consumingRoles: [],
        evidenceLabels: [],
        acceptanceSignals: [],
        sourceField: "externalProofBundle.currentCommandVerificationRows/currentCommandAcceptanceLadderRows",
        proofCommand: currentNextCommand,
        rerunCommand: currentRerunCommand,
        hardGateCommand,
        valueRecorded: false
      };

      artifact.consumingCommands.push(command);
      artifact.consumingRoles.push(role);
      artifact.evidenceLabels.push(textValue(evidenceLabels[index], textValue(row.evidenceSummary)));
      artifact.acceptanceSignals.push(
        textValue(acceptanceSignalByCommand.get(command), "value-free command evidence refreshed without private values")
      );
      artifactsByPath.set(artifactPath, artifact);
    }
  }

  return Array.from(artifactsByPath.values()).map((artifact, index) => {
    const consumingCommands = Array.from(new Set(artifact.consumingCommands));
    return {
      order: index + 1,
      artifactPath: artifact.artifactPath,
      present: artifact.present === true,
      commandCount: consumingCommands.length,
      consumingCommands: consumingCommands.join("; "),
      consumingRoles: Array.from(new Set(artifact.consumingRoles)).join("; "),
      evidenceLabels: Array.from(new Set(artifact.evidenceLabels)).join("; "),
      acceptanceSignals: Array.from(new Set(artifact.acceptanceSignals)).join("; "),
      sourceField: artifact.sourceField,
      proofCommand: artifact.proofCommand,
      rerunCommand: artifact.rerunCommand,
      hardGateCommand: artifact.hardGateCommand,
      valueRecorded: false
    };
  });
}

function currentActionPostEditVerificationRows({ acceptanceRows, currentNextCommand, currentRerunCommand, hardGateCommand }) {
  return valueFreeObjectRows(acceptanceRows).map((row, index) => {
    const criterion = textValue(row.criterion);
    const lower = criterion.toLowerCase();
    let sourceField = "currentActionAcceptanceRows";
    let expectedSignal = "criterion ready yes without recording private values";

    if (lower.includes("without placeholder values")) {
      sourceField = "externalProofBundle.currentPlaceholderKeyCount/currentPlaceholderKeys";
      expectedSignal = "current required keys present and current placeholder key count is 0";
    } else if (lower.includes("private-inputs") || lower.includes("private inputs")) {
      sourceField = "releaseDoctor.privateInputsReady/channelMetadataReady/privateValuesRecorded";
      expectedSignal = "private inputs ready yes; channel metadata ready yes; private values recorded no";
    } else if (lower.includes("distribution-channel qa")) {
      sourceField = "releaseDoctor.distributionChannelQaReady/channelMetadataReady/privateValuesRecorded";
      expectedSignal = "distribution-channel QA ready yes; channel metadata ready yes; private values recorded no";
    }

    return {
      order: index + 1,
      criterion,
      currentReady: row.ready === true,
      currentEvidence: textValue(row.evidence),
      expectedSignal,
      sourceField,
      proofCommand: currentNextCommand,
      rerunCommand: currentRerunCommand,
      hardGateCommand,
      valueRecorded: false
    };
  });
}

function currentActionHandoffRows({
  sourceArtifacts,
  currentEnvEditTarget,
  currentPlaceholderEditLocationSummary,
  currentPlaceholderKeyCount,
  currentActionAcceptanceBlockerSummary,
  currentActionAcceptanceBlockerCount,
  currentNextCommand,
  currentRerunCommand,
  currentCommandSequenceSummary,
  hardGateCommand,
  hardGateRequirementBlockedCount,
  hardGateBlockedRequirementSummary
}) {
  const sourceArtifactSummary = valueFreeObjectRows(sourceArtifacts)
    .map((artifact) => textValue(artifact.label))
    .filter((label) => label !== "none")
    .join(", ");
  return [
    {
      order: 1,
      item: "Source artifacts",
      sourceField: "sourceArtifacts",
      evidence: sourceArtifactSummary || "none",
      blockerCount: hardGateRequirementBlockedCount,
      acceptanceBlockerCount: currentActionAcceptanceBlockerCount,
      proofCommand: currentNextCommand,
      rerunCommand: currentRerunCommand,
      hardGateCommand,
      valueRecorded: false
    },
    {
      order: 2,
      item: "Current edit target",
      sourceField: "externalProofBundle.currentEnvEditTarget/currentPlaceholderEditLocations",
      evidence: `${currentEnvEditTarget}; ${currentPlaceholderEditLocationSummary}`,
      blockerCount: currentPlaceholderKeyCount,
      acceptanceBlockerCount: currentActionAcceptanceBlockerCount,
      proofCommand: currentNextCommand,
      rerunCommand: currentRerunCommand,
      hardGateCommand,
      valueRecorded: false
    },
    {
      order: 3,
      item: "Acceptance blockers",
      sourceField: "currentActionAcceptanceBlockerRows",
      evidence: currentActionAcceptanceBlockerSummary,
      blockerCount: currentActionAcceptanceBlockerCount,
      acceptanceBlockerCount: currentActionAcceptanceBlockerCount,
      proofCommand: currentNextCommand,
      rerunCommand: currentRerunCommand,
      hardGateCommand,
      valueRecorded: false
    },
    {
      order: 4,
      item: "Rerun order",
      sourceField: "externalProofBundle.currentCommandVerificationRows/nextExpectedOperatorSequence",
      evidence: currentCommandSequenceSummary,
      blockerCount: currentActionAcceptanceBlockerCount,
      acceptanceBlockerCount: currentActionAcceptanceBlockerCount,
      proofCommand: currentNextCommand,
      rerunCommand: currentRerunCommand,
      hardGateCommand,
      valueRecorded: false
    },
    {
      order: 5,
      item: "Hard gate",
      sourceField: "externalGate.requirements",
      evidence: hardGateBlockedRequirementSummary,
      blockerCount: hardGateRequirementBlockedCount,
      acceptanceBlockerCount: currentActionAcceptanceBlockerCount,
      proofCommand: currentNextCommand,
      rerunCommand: currentRerunCommand,
      hardGateCommand,
      valueRecorded: false
    }
  ];
}

function privateEditSafetyRows({
  currentEnvEditTarget,
  currentPlaceholderKeyCount,
  currentRequiredKeyCount,
  currentPlaceholderEditLocationSummary,
  currentRerunCommand,
  currentCommandSequence,
  hardGateCommand
}) {
  const commandSequence = stringArrayValue(currentCommandSequence);
  return [
    {
      order: 1,
      check: "Private edits stay in ignored local env target",
      ready: currentEnvEditTarget === ".env.distribution.local" && currentPlaceholderKeyCount === currentRequiredKeyCount,
      evidence: `${currentEnvEditTarget}; ${currentPlaceholderKeyCount}/${currentRequiredKeyCount} current release-channel placeholders; ${currentPlaceholderEditLocationSummary}`,
      command: currentRerunCommand,
      valueRecorded: false
    },
    {
      order: 2,
      check: "Receipt output stays value-free",
      ready: true,
      evidence: "key names, counts, file-line locations, and assignment shapes only; private values recorded no",
      command: currentRerunCommand,
      valueRecorded: false
    },
    {
      order: 3,
      check: "Post-edit rerun order is explicit",
      ready: commandSequence.includes("npm run release:doctor") && commandSequence.includes(currentRerunCommand),
      evidence: formatCommandSummary(commandSequence),
      command: currentRerunCommand,
      valueRecorded: false
    },
    {
      order: 4,
      check: "Hard external gate remains separate",
      ready: hardGateCommand === "npm run release:external-check",
      evidence: "hard gate is not claimed by current-blocker receipt",
      command: hardGateCommand,
      valueRecorded: false
    },
    {
      order: 5,
      check: "No remote side effects by this receipt",
      ready: true,
      evidence: "network probe no; release upload no; signing no; Apple notary submission no",
      command: currentRerunCommand,
      valueRecorded: false
    }
  ];
}

function expectedInputShapeForKey(key) {
  if (key === "GROOVEFORGE_DISTRIBUTION_CHANNEL") {
    return "allowed channel token: direct-download, private-beta, or managed-release";
  }
  return "safe HTTPS URL shape: https protocol, hostname present, no credentials, no fragment";
}

function currentInputShapeRows({ currentRequiredKeys, releaseChannelUnblockMetadataRows, currentNextCommand, currentRerunCommand }) {
  const unblockRowsByKey = new Map(
    valueFreeObjectRows(releaseChannelUnblockMetadataRows).map((row) => [textValue(row.key), row])
  );
  return stringArrayValue(currentRequiredKeys).map((key, index) => {
    const unblockRow = unblockRowsByKey.get(key);
    return {
      order: index + 1,
      key,
      ready: unblockRow?.ready === true && unblockRow.valueRecorded === false,
      expectedShape: expectedInputShapeForKey(key),
      evidenceSource: textValue(unblockRow?.evidence, key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" ? "allowed channel token" : "safe HTTPS URL shape"),
      proofCommand: currentNextCommand,
      rerunCommand: currentRerunCommand,
      valueRecorded: false
    };
  });
}

function localEnvInputObject(value) {
  return value && typeof value === "object" ? value : {};
}

function currentLocalEnvDiagnosticRows({ localEnvInput, currentEnvEditTarget, currentPlaceholderKeyCount }) {
  const input = localEnvInputObject(localEnvInput);
  const filesChecked = stringArrayValue(input.filesChecked);
  const presentFiles = stringArrayValue(input.presentFiles);
  const placeholderKeys = stringArrayValue(input.placeholderKeys);
  const unknownKeys = stringArrayValue(input.unknownKeys);
  const malformedLines = stringArrayValue(input.malformedLines);
  const skippedExistingKeys = stringArrayValue(input.skippedExistingKeys);
  const loadedKeys = stringArrayValue(input.loadedKeys);
  return [
    {
      order: 1,
      diagnostic: "Local env source files checked",
      status: filesChecked.length > 0 ? "checked" : "missing",
      evidence: `checked: ${formatKeyList(filesChecked)}; present: ${formatKeyList(presentFiles)}`,
      sourceField: "externalProofBundle.localEnvInput.filesChecked/presentFiles",
      valueRecorded: false
    },
    {
      order: 2,
      diagnostic: "Current edit target present",
      status: presentFiles.includes(currentEnvEditTarget) ? "present" : "missing",
      evidence: currentEnvEditTarget,
      sourceField: "externalProofBundle.localEnvInput.presentFiles/currentEnvEditTarget",
      valueRecorded: false
    },
    {
      order: 3,
      diagnostic: "Current placeholder scope",
      status: currentPlaceholderKeyCount === 0 ? "clear" : "blocked",
      evidence: `${currentPlaceholderKeyCount} current release-channel placeholders; ${placeholderKeys.length} total local env placeholders`,
      sourceField: "externalProofBundle.currentPlaceholderKeys/localEnvInput.placeholderKeys",
      valueRecorded: false
    },
    {
      order: 4,
      diagnostic: "Unknown key scan",
      status: unknownKeys.length === 0 ? "clean" : "needs-edit",
      evidence: `${unknownKeys.length} unknown key names reported`,
      sourceField: "externalProofBundle.localEnvInput.unknownKeys",
      valueRecorded: false
    },
    {
      order: 5,
      diagnostic: "Malformed line scan",
      status: malformedLines.length === 0 ? "clean" : "needs-edit",
      evidence: `${malformedLines.length} malformed line locations reported`,
      sourceField: "externalProofBundle.localEnvInput.malformedLines",
      valueRecorded: false
    },
    {
      order: 6,
      diagnostic: "Existing environment overrides",
      status: skippedExistingKeys.length === 0 ? "none" : "skipped",
      evidence: `${skippedExistingKeys.length} existing environment key names skipped`,
      sourceField: "externalProofBundle.localEnvInput.skippedExistingKeys",
      valueRecorded: false
    },
    {
      order: 7,
      diagnostic: "Loaded key redaction",
      status: "redacted",
      evidence: `${loadedKeys.length} non-placeholder key names loaded; values recorded no`,
      sourceField: "externalProofBundle.localEnvInput.loadedKeys/valueRecorded",
      valueRecorded: false
    },
    {
      order: 8,
      diagnostic: "Local env value recording",
      status: input.valueRecorded === false ? "clean" : "blocked",
      evidence: `local env values recorded ${input.valueRecorded === false ? "no" : "yes"}`,
      sourceField: "externalProofBundle.localEnvInput.valueRecorded",
      valueRecorded: false
    }
  ];
}

function currentActionAcceptanceRows({
  externalNextActions,
  releaseDoctor,
  externalProofBundle,
  currentNextCommand,
  currentRerunCommand,
  hardGateCommand
}) {
  return stringArrayValue(externalNextActions.currentReadyCriteria).map((criterion, index) => {
    const lower = criterion.toLowerCase();
    let ready = false;
    let evidence = "Current evidence does not yet prove this criterion.";

    if (lower.includes("without placeholder values")) {
      const placeholderCount = integerValue(externalProofBundle.currentPlaceholderKeyCount);
      const requiredCount = integerValue(externalProofBundle.currentRequiredKeyCount);
      ready = requiredCount > 0 && placeholderCount === 0;
      evidence = ready
        ? `${requiredCount} current required keys are present without placeholder values`
        : `${placeholderCount} current placeholder keys remain`;
    } else if (lower.includes("private-inputs") || lower.includes("private inputs")) {
      ready =
        releaseDoctor.privateInputsReady === true &&
        releaseDoctor.channelMetadataReady === true &&
        releaseDoctor.privateValuesRecorded === false;
      evidence = `private inputs ready ${releaseDoctor.privateInputsReady === true ? "yes" : "no"}; channel metadata ready ${releaseDoctor.channelMetadataReady === true ? "yes" : "no"}; private values recorded ${releaseDoctor.privateValuesRecorded === true ? "yes" : "no"}`;
    } else if (lower.includes("distribution-channel qa")) {
      ready =
        releaseDoctor.distributionChannelQaReady === true &&
        releaseDoctor.channelMetadataReady === true &&
        releaseDoctor.privateValuesRecorded === false;
      evidence = `distribution-channel QA ready ${releaseDoctor.distributionChannelQaReady === true ? "yes" : "no"}; channel metadata ready ${releaseDoctor.channelMetadataReady === true ? "yes" : "no"}; private values recorded ${releaseDoctor.privateValuesRecorded === true ? "yes" : "no"}`;
    }

    return {
      order: index + 1,
      criterion,
      ready,
      evidence,
      proofCommand: currentNextCommand,
      rerunCommand: currentRerunCommand,
      hardGateCommand,
      valueRecorded: false
    };
  });
}

function externalCompletionChecklistRows(externalNextActions, hardGateCommand) {
  return valueFreeObjectRows(externalNextActions.priorityActions).map((action, index) => {
    const evidenceRows = valueFreeObjectRows(action.evidence);
    const evidenceLabels = evidenceRows
      .map((row) => textValue(row.label))
      .filter((label) => label !== "none");
    const readyCriteria = stringArrayValue(action.readyCriteria);
    const actionChecklist = stringArrayValue(action.actionChecklist);
    const rerunCommands = stringArrayValue(action.rerunCommands);
    return {
      order: index + 1,
      id: textValue(action.id),
      label: textValue(action.label),
      firstBlocker: textValue(action.firstBlocker),
      proofCommand: textValue(action.nextCommand),
      rerunCommands,
      rerunCommandSummary: rerunCommands.length > 0 ? rerunCommands.join(", ") : "none",
      evidenceLabels,
      evidenceSummary: evidenceLabels.length > 0 ? evidenceLabels.join(", ") : "none",
      readyCriteria,
      readyCriteriaCount: readyCriteria.length,
      readyCriteriaSummary: readyCriteria.length > 0 ? `${readyCriteria.length} value-free ready criteria` : "none",
      actionChecklistCount: actionChecklist.length,
      actionChecklistSummary: actionChecklist.length > 0 ? `${actionChecklist.length} value-free checklist steps` : "none",
      hardGateCommand,
      valueRecorded: false
    };
  });
}

function hardGateRequirementRows(externalGate) {
  return valueFreeObjectRows(externalGate.requirements).map((row) => {
    const blockers = stringArrayValue(row.blockers);
    return {
      label: textValue(row.label),
      ready: row.ready === true,
      evidence: textValue(row.evidence),
      blockerCount: blockers.length,
      blockerSummary: blockers.length > 0 ? blockers.join("; ") : "none",
      blockers,
      valueRecorded: false
    };
  });
}

function buildReport({ releaseDoctor, externalNextActions, externalProofBundle, externalGate, releaseProgress }) {
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
  const nextActionRows = priorityActionRows(externalNextActions);
  const currentPriorityAction = nextActionRows[0] ?? null;
  const nextPriorityAction = nextActionRows[1] ?? null;
  const rawPriorityActions = valueFreeObjectRows(externalNextActions.priorityActions);
  const rawNextPriorityAction = rawPriorityActions[1] ?? null;
  const nextActionReadyCriteriaPreviewRows = nextActionReadyCriteriaRows(rawNextPriorityAction);
  const nextActionChecklistPreviewRows = nextActionChecklistRows(rawNextPriorityAction);
  const nextActionEvidencePreviewRows = nextActionEvidenceRows(rawNextPriorityAction);
  const nextActionBlockerPreviewRows = nextActionBlockerRows(rawNextPriorityAction);
  const nextActionVerificationPreviewRows = nextActionVerificationRows(rawNextPriorityAction);
  const nextActionPrerequisiteCommandPreviewRows = nextActionPrerequisiteCommandRows(rawNextPriorityAction);
  const nextActionOperatorActionPreviewRows = nextActionOperatorActionRows(rawNextPriorityAction);
  const nextActionEnvEditPreviewRows = nextActionEnvEditRows(rawNextPriorityAction);
  const nextActionRawReadyCriteria = stringArrayValue(rawNextPriorityAction?.readyCriteria);
  const nextActionRawChecklist = stringArrayValue(rawNextPriorityAction?.actionChecklist);
  const nextActionRawBlockers = stringArrayValue(rawNextPriorityAction?.blockers);
  const nextActionRawPrerequisiteCommands = stringArrayValue(rawNextPriorityAction?.prerequisiteCommands);
  const nextActionRawOperatorActions = stringArrayValue(rawNextPriorityAction?.operatorActions);
  const nextActionRawEnvEditRows = valueFreeObjectRows(rawNextPriorityAction?.envEditRows);
  const nextActionPreviewRerunCommands = stringArrayValue(rawNextPriorityAction?.rerunCommands);
  const nextActionPreviewRequiredKeys = stringArrayValue(rawNextPriorityAction?.requiredKeys);
  const nextActionPreviewPlaceholderKeys = stringArrayValue(rawNextPriorityAction?.placeholderKeys);
  const nextActionPreviewProofCommand = textValue(rawNextPriorityAction?.nextCommand);
  const nextActionPreviewReady =
    rawNextPriorityAction !== null &&
    textValue(rawNextPriorityAction.id) === textValue(nextPriorityAction?.id) &&
    textValue(rawNextPriorityAction.label) === textValue(nextPriorityAction?.label) &&
    nextActionPreviewProofCommand === textValue(nextPriorityAction?.nextCommand) &&
    nextActionReadyCriteriaPreviewRows.length === nextActionRawReadyCriteria.length &&
    nextActionChecklistPreviewRows.length === nextActionRawChecklist.length &&
    nextActionBlockerPreviewRows.length === nextActionRawBlockers.length &&
    nextActionVerificationPreviewRows.length === nextActionRawReadyCriteria.length &&
    nextActionPrerequisiteCommandPreviewRows.length === nextActionRawPrerequisiteCommands.length &&
    nextActionOperatorActionPreviewRows.length === nextActionRawOperatorActions.length &&
    nextActionEnvEditPreviewRows.length === nextActionRawEnvEditRows.length &&
    nextActionReadyCriteriaPreviewRows.length > 0 &&
    nextActionChecklistPreviewRows.length > 0 &&
    nextActionBlockerPreviewRows.length > 0 &&
    nextActionVerificationPreviewRows.length > 0 &&
    nextActionPrerequisiteCommandPreviewRows.length > 0 &&
    nextActionOperatorActionPreviewRows.length > 0 &&
    nextActionEnvEditPreviewRows.length > 0 &&
    nextActionReadyCriteriaPreviewRows.every((row) => row.valueRecorded === false && row.proofCommand === nextActionPreviewProofCommand) &&
    nextActionChecklistPreviewRows.every((row) => row.valueRecorded === false && row.proofCommand === nextActionPreviewProofCommand) &&
    nextActionEvidencePreviewRows.every((row) => row.valueRecorded === false) &&
    nextActionBlockerPreviewRows.every((row) => row.valueRecorded === false && row.proofCommand === nextActionPreviewProofCommand) &&
    nextActionVerificationPreviewRows.every((row) => row.valueRecorded === false && row.proofCommand === nextActionPreviewProofCommand) &&
    nextActionPrerequisiteCommandPreviewRows.every((row) => row.valueRecorded === false && row.proofCommand === nextActionPreviewProofCommand) &&
    nextActionOperatorActionPreviewRows.every((row) => row.valueRecorded === false && row.proofCommand === nextActionPreviewProofCommand) &&
    nextActionEnvEditPreviewRows.every((row) => row.valueRecorded === false && row.proofCommand === nextActionPreviewProofCommand);
  const hardGateCommand = textValue(externalProofBundle.hardExternalGateCommand, "npm run release:external-check");
  const transitionRows = currentActionTransitionRows({
    priorityRows: nextActionRows,
    currentNextCommand: textValue(externalProofBundle.currentNextCommand),
    hardGateCommand
  });
  const completionChecklistRows = externalCompletionChecklistRows(externalNextActions, hardGateCommand);
  const currentCompletionChecklistRow = completionChecklistRows[0] ?? null;
  const gateRequirementRows = hardGateRequirementRows(externalGate);
  const hardGateBlockedRequirementRows = gateRequirementRows.filter((row) => !row.ready);
  const hardGateRequirementReadyCount = gateRequirementRows.filter((row) => row.ready).length;
  const hardGateRequirementBlockedCount = hardGateBlockedRequirementRows.length;
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
  const currentRerunCommand = textValue(externalProofBundle.currentRerunCommand, currentNextCommand);
  const acceptanceRows = currentActionAcceptanceRows({
    externalNextActions,
    releaseDoctor,
    externalProofBundle,
    currentNextCommand,
    currentRerunCommand,
    hardGateCommand
  });
  const currentActionAcceptanceReadyCount = acceptanceRows.filter((row) => row.ready).length;
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
  const currentPlaceholderEditLocationSummary = textValue(
    externalProofBundle.currentPlaceholderEditLocationSummary,
    formatLocationSummary(proofPlaceholderLocations)
  );
  const acceptanceBlockerRows = currentActionAcceptanceBlockerRows({
    acceptanceRows,
    currentEnvEditTarget: textValue(externalProofBundle.currentEnvEditTarget, ".env.distribution.local"),
    currentPlaceholderEditLocationSummary,
    currentNextCommand,
    currentRerunCommand
  });
  const postEditVerificationRows = currentActionPostEditVerificationRows({
    acceptanceRows,
    currentNextCommand,
    currentRerunCommand,
    hardGateCommand
  });
  const sourceArtifacts = [
    { label: "Release doctor", path: relative(releaseDoctorJsonPath), present: true, valueRecorded: false },
    { label: "External next actions", path: relative(externalNextActionsJsonPath), present: true, valueRecorded: false },
    { label: "External proof bundle", path: relative(externalProofBundleJsonPath), present: true, valueRecorded: false },
    { label: "External distribution gate", path: relative(externalGateJsonPath), present: true, valueRecorded: false },
    { label: "Release progress report", path: relative(releaseProgressJsonPath), present: true, valueRecorded: false },
    { label: "Release-channel unblock smoke", path: textValue(releaseProgress.sourceReleaseChannelUnblockPath, "none"), present: releaseProgress.sourceReleaseChannelUnblockReady === true, valueRecorded: false }
  ];
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
  const handoffRows = currentActionHandoffRows({
    sourceArtifacts,
    currentEnvEditTarget: textValue(externalProofBundle.currentEnvEditTarget, ".env.distribution.local"),
    currentPlaceholderEditLocationSummary,
    currentPlaceholderKeyCount: proofPlaceholderKeys.length,
    currentActionAcceptanceBlockerSummary: acceptanceBlockerRows.length > 0 ? `${acceptanceBlockerRows.length} current action acceptance blockers` : "none",
    currentActionAcceptanceBlockerCount: acceptanceBlockerRows.length,
    currentNextCommand,
    currentRerunCommand,
    currentCommandSequenceSummary,
    hardGateCommand,
    hardGateRequirementBlockedCount,
    hardGateBlockedRequirementSummary:
      hardGateBlockedRequirementRows.length > 0
        ? `${hardGateBlockedRequirementRows.length} blocked hard-gate requirements`
        : "none"
  });
  const privateSafetyRows = privateEditSafetyRows({
    currentEnvEditTarget: textValue(externalProofBundle.currentEnvEditTarget, ".env.distribution.local"),
    currentPlaceholderKeyCount: proofPlaceholderKeys.length,
    currentRequiredKeyCount: proofRequiredKeys.length,
    currentPlaceholderEditLocationSummary,
    currentRerunCommand,
    currentCommandSequence,
    hardGateCommand
  });
  const inputShapeRows = currentInputShapeRows({
    currentRequiredKeys: proofRequiredKeys,
    releaseChannelUnblockMetadataRows: releaseProgress.releaseChannelUnblockMetadataRows,
    currentNextCommand,
    currentRerunCommand
  });
  const localEnvDiagnosticRows = currentLocalEnvDiagnosticRows({
    localEnvInput: externalProofBundle.localEnvInput,
    currentEnvEditTarget: textValue(externalProofBundle.currentEnvEditTarget, ".env.distribution.local"),
    currentPlaceholderKeyCount: proofPlaceholderKeys.length
  });
  const acceptanceRemediationRows = currentActionAcceptanceRemediationRows({
    acceptanceRows,
    blockerRows: acceptanceBlockerRows,
    postEditVerificationRows,
    currentInputShapeChecklistRows: inputShapeRows,
    currentLocalEnvDiagnosticRows: localEnvDiagnosticRows,
    currentNextCommand,
    currentRerunCommand,
    hardGateCommand
  });
  const keyRemediationRows = currentReleaseChannelKeyRemediationRows({
    currentRequiredKeys: proofRequiredKeys,
    currentPlaceholderEditLocations: proofPlaceholderLocations,
    currentInputShapeChecklistRows: inputShapeRows,
    acceptanceRows,
    currentNextCommand,
    currentRerunCommand,
    hardGateCommand
  });
  const commandAcceptanceLadderRows = currentCommandAcceptanceLadderRows({
    currentCommandVerificationRows: commandVerificationRows,
    postEditVerificationRows,
    currentNextCommand,
    currentRerunCommand,
    hardGateCommand
  });
  const commandSourceArtifactRows = currentCommandSourceArtifactRows({
    currentCommandVerificationRows: commandVerificationRows,
    commandAcceptanceLadderRows,
    currentNextCommand,
    currentRerunCommand,
    hardGateCommand
  });
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
    },
    {
      check: "Release-channel unblock rehearsal ready",
      ready:
        releaseProgress.releaseChannelUnblockSmokeReady === true &&
        releaseProgress.releaseChannelUnblockPlaceholderBlockerCleared === true &&
        releaseProgress.releaseChannelUnblockValueRecorded === false,
      evidence: `${integerValue(releaseProgress.releaseChannelUnblockMetadataRowCount)} value-free unblock rows`
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
    hardGateCommand,
    hardGateReady: externalGate.externalDistributionGateReady === true,
    hardGateWouldFail: externalGate.hardGateWouldFail === true,
    hardGateRequirementCount: gateRequirementRows.length,
    hardGateRequirementReadyCount,
    hardGateRequirementBlockedCount,
    hardGateRequirementSummary:
      gateRequirementRows.length > 0
        ? `${hardGateRequirementReadyCount}/${gateRequirementRows.length} hard-gate requirements ready`
        : "none",
    hardGateBlockedRequirementSummary:
      hardGateBlockedRequirementRows.length > 0
        ? `${hardGateBlockedRequirementRows.length} blocked hard-gate requirements`
        : "none",
    hardGateRequirementRows: gateRequirementRows,
    hardGateBlockedRequirementRows,
    hardGateBlockerCount: stringArrayValue(externalGate.externalDistributionGateBlockers).length,
    hardGateBlockerSummary:
      stringArrayValue(externalGate.externalDistributionGateBlockers).length > 0
        ? `${stringArrayValue(externalGate.externalDistributionGateBlockers).length} value-free hard-gate blockers`
        : "none",
    sourceExternalNextActionsReady: true,
    sourceExternalNextActionsPath: relative(externalNextActionsJsonPath),
    priorityActionCount: nextActionRows.length,
    priorityActionSummary: nextActionRows.length > 0 ? `${nextActionRows.length} pending value-free priority actions` : "none",
    priorityActionRows: nextActionRows,
    currentPriorityActionId: textValue(externalNextActions.currentActionId, currentPriorityAction?.id ?? "none"),
    currentPriorityActionLabel: textValue(externalNextActions.currentActionLabel, currentPriorityAction?.label ?? "none"),
    currentPriorityActionNextCommand: textValue(currentPriorityAction?.nextCommand, "none"),
    currentPriorityActionFirstBlocker: textValue(currentPriorityAction?.firstBlocker, "none"),
    nextPriorityActionId: textValue(nextPriorityAction?.id, "none"),
    nextPriorityActionLabel: textValue(nextPriorityAction?.label, "none"),
    nextPriorityActionNextCommand: textValue(nextPriorityAction?.nextCommand, "none"),
    nextPriorityActionFirstBlocker: textValue(nextPriorityAction?.firstBlocker, "none"),
    nextActionPreviewReady,
    nextActionPreviewId: textValue(rawNextPriorityAction?.id, "none"),
    nextActionPreviewLabel: textValue(rawNextPriorityAction?.label, "none"),
    nextActionPreviewFirstBlocker: textValue(rawNextPriorityAction?.firstBlocker, "none"),
    nextActionPreviewProofCommand,
    nextActionPreviewRerunCommands,
    nextActionPreviewRerunCommandSummary:
      nextActionPreviewRerunCommands.length > 0 ? nextActionPreviewRerunCommands.join(", ") : "none",
    nextActionPreviewRequiredKeyCount: nextActionPreviewRequiredKeys.length,
    nextActionPreviewRequiredKeys,
    nextActionPreviewPlaceholderKeyCount: nextActionPreviewPlaceholderKeys.length,
    nextActionPreviewPlaceholderKeys,
    nextActionPreviewReadyCriteriaRowCount: nextActionReadyCriteriaPreviewRows.length,
    nextActionPreviewReadyCriteriaSummary:
      nextActionReadyCriteriaPreviewRows.length > 0
        ? `${nextActionReadyCriteriaPreviewRows.length} value-free next action ready criteria rows`
        : "none",
    nextActionPreviewReadyCriteriaRows: nextActionReadyCriteriaPreviewRows,
    nextActionPreviewChecklistRowCount: nextActionChecklistPreviewRows.length,
    nextActionPreviewChecklistSummary:
      nextActionChecklistPreviewRows.length > 0
        ? `${nextActionChecklistPreviewRows.length} value-free next action checklist rows`
        : "none",
    nextActionPreviewChecklistRows: nextActionChecklistPreviewRows,
    nextActionPreviewEvidenceRowCount: nextActionEvidencePreviewRows.length,
    nextActionPreviewEvidenceSummary:
      nextActionEvidencePreviewRows.length > 0
        ? `${nextActionEvidencePreviewRows.length} value-free next action evidence rows`
        : "none",
    nextActionPreviewEvidenceRows: nextActionEvidencePreviewRows,
    nextActionPreviewBlockerRowCount: nextActionBlockerPreviewRows.length,
    nextActionPreviewBlockerSummary:
      nextActionBlockerPreviewRows.length > 0
        ? `${nextActionBlockerPreviewRows.length} value-free next action blocker rows`
        : "none",
    nextActionPreviewBlockerRows: nextActionBlockerPreviewRows,
    nextActionPreviewVerificationRowCount: nextActionVerificationPreviewRows.length,
    nextActionPreviewVerificationSummary:
      nextActionVerificationPreviewRows.length > 0
        ? `${nextActionVerificationPreviewRows.length} value-free next action verification rows`
        : "none",
    nextActionPreviewVerificationRows: nextActionVerificationPreviewRows,
    nextActionPreviewPrerequisiteCommandRowCount: nextActionPrerequisiteCommandPreviewRows.length,
    nextActionPreviewPrerequisiteCommandSummary:
      nextActionPrerequisiteCommandPreviewRows.length > 0
        ? `${nextActionPrerequisiteCommandPreviewRows.length} value-free next action prerequisite command rows`
        : "none",
    nextActionPreviewPrerequisiteCommandRows: nextActionPrerequisiteCommandPreviewRows,
    nextActionPreviewOperatorActionRowCount: nextActionOperatorActionPreviewRows.length,
    nextActionPreviewOperatorActionSummary:
      nextActionOperatorActionPreviewRows.length > 0
        ? `${nextActionOperatorActionPreviewRows.length} value-free next action operator action rows`
        : "none",
    nextActionPreviewOperatorActionRows: nextActionOperatorActionPreviewRows,
    nextActionPreviewEnvEditRowCount: nextActionEnvEditPreviewRows.length,
    nextActionPreviewEnvEditSummary:
      nextActionEnvEditPreviewRows.length > 0
        ? `${nextActionEnvEditPreviewRows.length} value-free next action env edit rows`
        : "none",
    nextActionPreviewEnvEditRows: nextActionEnvEditPreviewRows,
    currentActionTransitionReady:
      transitionRows.length === 3 &&
      transitionRows.every((row) => row.valueRecorded === false) &&
      transitionRows[0]?.actionId === textValue(externalNextActions.currentActionId) &&
      transitionRows[0]?.proofCommand === textValue(externalProofBundle.currentNextCommand) &&
      transitionRows[2]?.proofCommand === hardGateCommand,
    currentActionTransitionRowCount: transitionRows.length,
    currentActionTransitionSummary: transitionRows.length > 0 ? `${transitionRows.length} value-free current action transition rows` : "none",
    currentActionTransitionRows: transitionRows,
    priorityActionCurrentMatchesCurrentBlocker:
      currentPriorityAction !== null &&
      textValue(externalNextActions.currentActionId) === currentPriorityAction.id &&
      textValue(currentPriorityAction.nextCommand) === currentNextCommand &&
      textValue(currentPriorityAction.firstBlocker) === textValue(externalProofBundle.currentFirstBlocker),
    externalCompletionChecklistCount: completionChecklistRows.length,
    externalCompletionChecklistSummary:
      completionChecklistRows.length > 0 ? `${completionChecklistRows.length} value-free external completion checklist rows` : "none",
    externalCompletionChecklistRows: completionChecklistRows,
    currentExternalCompletionChecklistRowId: textValue(currentCompletionChecklistRow?.id, "none"),
    currentExternalCompletionChecklistRowLabel: textValue(currentCompletionChecklistRow?.label, "none"),
    currentExternalCompletionChecklistProofCommand: textValue(currentCompletionChecklistRow?.proofCommand, "none"),
    externalCompletionChecklistCurrentMatchesPriorityAction:
      currentCompletionChecklistRow !== null &&
      textValue(currentCompletionChecklistRow.id) === textValue(externalNextActions.currentActionId) &&
      textValue(currentCompletionChecklistRow.proofCommand) === currentNextCommand &&
      textValue(currentCompletionChecklistRow.firstBlocker) === textValue(externalProofBundle.currentFirstBlocker),
    currentActionAcceptanceReady: acceptanceRows.length > 0 && acceptanceRows.every((row) => row.ready),
    currentActionAcceptanceRowCount: acceptanceRows.length,
    currentActionAcceptanceReadyCount,
    currentActionAcceptanceSummary:
      acceptanceRows.length > 0
        ? `${currentActionAcceptanceReadyCount}/${acceptanceRows.length} current action acceptance criteria ready`
        : "none",
    currentActionAcceptanceRows: acceptanceRows,
    currentActionAcceptanceMatchesCurrentAction:
      acceptanceRows.length === integerValue(externalNextActions.currentReadyCriteriaCount) &&
      acceptanceRows.every((row) => row.proofCommand === currentNextCommand && row.rerunCommand === currentRerunCommand),
    currentActionAcceptanceBlockerCount: acceptanceBlockerRows.length,
    currentActionAcceptanceBlockerSummary:
      acceptanceBlockerRows.length > 0
        ? `${acceptanceBlockerRows.length} current action acceptance blockers`
        : "none",
    currentActionAcceptanceBlockerRows: acceptanceBlockerRows,
    currentActionAcceptanceBlockersMatchAcceptance:
      acceptanceBlockerRows.length === acceptanceRows.filter((row) => row.ready !== true).length,
    currentActionAcceptanceRemediationReady:
      acceptanceRemediationRows.length === acceptanceRows.filter((row) => row.ready !== true).length &&
      acceptanceRemediationRows.every((row) => row.valueRecorded === false && row.proofCommand === currentNextCommand && row.rerunCommand === currentRerunCommand && row.hardGateCommand === hardGateCommand),
    currentActionAcceptanceRemediationRowCount: acceptanceRemediationRows.length,
    currentActionAcceptanceRemediationSummary:
      acceptanceRemediationRows.length > 0
        ? `${acceptanceRemediationRows.length} value-free current action acceptance remediation rows`
        : "none",
    currentActionAcceptanceRemediationRows: acceptanceRemediationRows,
    currentReleaseChannelKeyRemediationReady:
      keyRemediationRows.length === releaseChannelMetadataKeys.length &&
      sameStringArray(keyRemediationRows.map((row) => row.key), releaseChannelMetadataKeys) &&
      keyRemediationRows.every((row) => row.valueRecorded === false && row.proofCommand === currentNextCommand && row.rerunCommand === currentRerunCommand && row.hardGateCommand === hardGateCommand),
    currentReleaseChannelKeyRemediationRowCount: keyRemediationRows.length,
    currentReleaseChannelKeyRemediationSummary:
      keyRemediationRows.length > 0
        ? `${keyRemediationRows.length} value-free release-channel key remediation rows`
        : "none",
    currentReleaseChannelKeyRemediationRows: keyRemediationRows,
    currentCommandAcceptanceLadderReady:
      commandAcceptanceLadderRows.length === commandVerificationRows.length &&
      commandAcceptanceLadderRows.every((row) => row.valueRecorded === false && row.proofCommand === currentNextCommand && row.rerunCommand === currentRerunCommand && row.hardGateCommand === hardGateCommand),
    currentCommandAcceptanceLadderRowCount: commandAcceptanceLadderRows.length,
    currentCommandAcceptanceLadderSummary:
      commandAcceptanceLadderRows.length > 0
        ? `${commandAcceptanceLadderRows.length} value-free command acceptance ladder rows`
        : "none",
    currentCommandAcceptanceLadderRows: commandAcceptanceLadderRows,
    currentCommandSourceArtifactMatrixReady:
      commandSourceArtifactRows.length > 0 &&
      commandSourceArtifactRows.every(
        (row) =>
          row.valueRecorded === false &&
          row.present === true &&
          row.proofCommand === currentNextCommand &&
          row.rerunCommand === currentRerunCommand &&
          row.hardGateCommand === hardGateCommand
      ),
    currentCommandSourceArtifactMatrixRowCount: commandSourceArtifactRows.length,
    currentCommandSourceArtifactMatrixSummary:
      commandSourceArtifactRows.length > 0
        ? `${commandSourceArtifactRows.length} value-free command source artifact rows`
        : "none",
    currentCommandSourceArtifactMatrixRows: commandSourceArtifactRows,
    currentActionPostEditVerificationReady:
      postEditVerificationRows.length === acceptanceRows.length &&
      postEditVerificationRows.every((row) => row.valueRecorded === false) &&
      postEditVerificationRows.every((row) => row.proofCommand === currentNextCommand && row.rerunCommand === currentRerunCommand && row.hardGateCommand === hardGateCommand),
    currentActionPostEditVerificationRowCount: postEditVerificationRows.length,
    currentActionPostEditVerificationCurrentReadyCount: postEditVerificationRows.filter((row) => row.currentReady).length,
    currentActionPostEditVerificationSummary:
      postEditVerificationRows.length > 0 ? `${postEditVerificationRows.length} value-free post-edit verification rows` : "none",
    currentActionPostEditVerificationCurrentSummary:
      postEditVerificationRows.length > 0
        ? `${postEditVerificationRows.filter((row) => row.currentReady).length}/${postEditVerificationRows.length} post-edit signals currently ready`
        : "none",
    currentActionPostEditVerificationRows: postEditVerificationRows,
    currentActionPostEditVerificationMatchesAcceptance: postEditVerificationRows.length === acceptanceRows.length,
    currentActionHandoffReady:
      handoffRows.length === 5 &&
      handoffRows.every((row) => row.valueRecorded === false) &&
      handoffRows.every((row) => row.proofCommand === currentNextCommand && row.rerunCommand === currentRerunCommand && row.hardGateCommand === hardGateCommand),
    currentActionHandoffRowCount: handoffRows.length,
    currentActionHandoffSummary: handoffRows.length > 0 ? `${handoffRows.length} value-free current action handoff rows` : "none",
    currentActionHandoffRows: handoffRows,
    currentActionHandoffSourceArtifactCount: sourceArtifacts.length,
    currentActionHandoffSourceArtifactSummary: sourceArtifacts.map((artifact) => artifact.label).join(", "),
    currentPrivateEditSafetyReady: privateSafetyRows.every((row) => row.ready && row.valueRecorded === false),
    currentPrivateEditSafetyRowCount: privateSafetyRows.length,
    currentPrivateEditSafetySummary:
      privateSafetyRows.length > 0
        ? `${privateSafetyRows.length} value-free private edit safety rows`
        : "none",
    currentPrivateEditSafetyRows: privateSafetyRows,
    currentInputShapeChecklistReady:
      inputShapeRows.length === proofRequiredKeys.length &&
      inputShapeRows.length === releaseChannelMetadataKeys.length &&
      inputShapeRows.every((row) => row.ready && row.valueRecorded === false && row.proofCommand === currentNextCommand && row.rerunCommand === currentRerunCommand),
    currentInputShapeChecklistRowCount: inputShapeRows.length,
    currentInputShapeChecklistSummary:
      inputShapeRows.length > 0
        ? `${inputShapeRows.length} value-free current input shape rows`
        : "none",
    currentInputShapeChecklistRows: inputShapeRows,
    currentLocalEnvDiagnosticsReady:
      localEnvDiagnosticRows.length === 8 &&
      localEnvDiagnosticRows.every((row) => row.valueRecorded === false) &&
      localEnvInputObject(externalProofBundle.localEnvInput).valueRecorded === false,
    currentLocalEnvDiagnosticRowCount: localEnvDiagnosticRows.length,
    currentLocalEnvDiagnosticSummary:
      localEnvDiagnosticRows.length > 0
        ? `${localEnvDiagnosticRows.length} value-free local env diagnostic rows`
        : "none",
    currentLocalEnvDiagnosticRows: localEnvDiagnosticRows,
    currentEnvEditTarget: textValue(externalProofBundle.currentEnvEditTarget, ".env.distribution.local"),
    currentRequiredKeyCount: integerValue(externalProofBundle.currentRequiredKeyCount),
    currentRequiredKeys: proofRequiredKeys,
    currentPlaceholderKeyCount: integerValue(externalProofBundle.currentPlaceholderKeyCount),
    currentPlaceholderKeys: proofPlaceholderKeys,
    currentPlaceholderEditLocationCount: integerValue(externalProofBundle.currentPlaceholderEditLocationCount),
    currentPlaceholderEditLocationSummary,
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
    currentRerunCommand,
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
    tenPlanProgressReportDue: releaseProgress.tenPlanProgressReportDue === true,
    tenPlanProgressReportCadence: textValue(releaseProgress.tenPlanProgressReportCadence),
    nextTenPlanProgressReportAt: integerValue(releaseProgress.nextTenPlanProgressReportAt),
    audienceReadinessReady: releaseProgress.audienceReadinessReady === true,
    audienceReadinessRowCount: integerValue(releaseProgress.audienceReadinessRowCount),
    audienceReadinessRowSummary: textValue(releaseProgress.audienceReadinessRowSummary, "none"),
    audienceReadinessRows: valueFreeObjectRows(releaseProgress.audienceReadinessRows),
    audienceAcceptanceReady: releaseProgress.audienceAcceptanceReady === true,
    audienceAcceptanceRowCount: integerValue(releaseProgress.audienceAcceptanceRowCount),
    audienceAcceptanceRowSummary: textValue(releaseProgress.audienceAcceptanceRowSummary, "none"),
    audienceAcceptanceRows: valueFreeObjectRows(releaseProgress.audienceAcceptanceRows),
    audienceDeliveryPackagesReady: releaseProgress.audienceDeliveryPackagesReady === true,
    audienceDeliveryPackageRowCount: integerValue(releaseProgress.audienceDeliveryPackageRowCount),
    audienceDeliveryPackageRowSummary: textValue(releaseProgress.audienceDeliveryPackageRowSummary, "none"),
    audienceDeliveryPackageRows: valueFreeObjectRows(releaseProgress.audienceDeliveryPackageRows),
    audienceDeliveryPackagesReopenReady: releaseProgress.audienceDeliveryPackagesReopenReady === true,
    audienceDeliveryPackageReopenRowCount: integerValue(releaseProgress.audienceDeliveryPackageReopenRowCount),
    audienceDeliveryPackageReopenRowSummary: textValue(releaseProgress.audienceDeliveryPackageReopenRowSummary, "none"),
    audienceDeliveryPackageReopenRows: valueFreeObjectRows(releaseProgress.audienceDeliveryPackageReopenRows),
    beginnerAudienceReadinessReady: releaseProgress.beginnerAudienceReadinessReady === true,
    professionalProducerAudienceReadinessReady: releaseProgress.professionalProducerAudienceReadinessReady === true,
    sourceReleaseChannelUnblockReady: releaseProgress.sourceReleaseChannelUnblockReady === true,
    sourceReleaseChannelUnblockPath: textValue(releaseProgress.sourceReleaseChannelUnblockPath, "none"),
    releaseChannelUnblockSmokeReady: releaseProgress.releaseChannelUnblockSmokeReady === true,
    releaseChannelUnblockSyntheticFixturePath: textValue(releaseProgress.releaseChannelUnblockSyntheticFixturePath, "none"),
    releaseChannelUnblockLoaderEnabled: releaseProgress.releaseChannelUnblockLoaderEnabled === true,
    releaseChannelUnblockLoadedKeyCount: integerValue(releaseProgress.releaseChannelUnblockLoadedKeyCount),
    releaseChannelUnblockLoadedKeys: stringArrayValue(releaseProgress.releaseChannelUnblockLoadedKeys),
    releaseChannelUnblockPlaceholderKeyCount: integerValue(releaseProgress.releaseChannelUnblockPlaceholderKeyCount),
    releaseChannelUnblockPlaceholderKeys: stringArrayValue(releaseProgress.releaseChannelUnblockPlaceholderKeys),
    releaseChannelUnblockMetadataReady: releaseProgress.releaseChannelUnblockMetadataReady === true,
    releaseChannelUnblockMetadataRowCount: integerValue(releaseProgress.releaseChannelUnblockMetadataRowCount),
    releaseChannelUnblockMetadataRowSummary: textValue(releaseProgress.releaseChannelUnblockMetadataRowSummary, "none"),
    releaseChannelUnblockMetadataRows: valueFreeObjectRows(releaseProgress.releaseChannelUnblockMetadataRows),
    releaseChannelUnblockPlaceholderBlockerCleared: releaseProgress.releaseChannelUnblockPlaceholderBlockerCleared === true,
    releaseChannelUnblockNextProofCommandAfterRealEdits: textValue(releaseProgress.releaseChannelUnblockNextProofCommandAfterRealEdits, "npm run release:doctor"),
    releaseChannelUnblockCurrentBlockerRefreshCommand: textValue(releaseProgress.releaseChannelUnblockCurrentBlockerRefreshCommand, "npm run release:current-blocker"),
    releaseChannelUnblockPrivateValuesRecorded: releaseProgress.releaseChannelUnblockPrivateValuesRecorded === true,
    releaseChannelUnblockNetworkProbeAttempted: releaseProgress.releaseChannelUnblockNetworkProbeAttempted === true,
    releaseChannelUnblockReleaseUploadAttempted: releaseProgress.releaseChannelUnblockReleaseUploadAttempted === true,
    releaseChannelUnblockAppleNotarySubmissionAttempted: releaseProgress.releaseChannelUnblockAppleNotarySubmissionAttempted === true,
    releaseChannelUnblockSigningAttempted: releaseProgress.releaseChannelUnblockSigningAttempted === true,
    releaseChannelUnblockClaimedExternalDistribution: releaseProgress.releaseChannelUnblockClaimedExternalDistribution === true,
    releaseChannelUnblockValueRecorded: releaseProgress.releaseChannelUnblockValueRecorded === true ? true : false,
    nextExpectedOperatorSequence,
    sourceArtifacts,
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

function validateReport(report, { releaseDoctor, externalNextActions, externalProofBundle, externalGate, releaseProgress }) {
  const rawPriorityActions = valueFreeObjectRows(externalNextActions.priorityActions);
  const rawNextPriorityAction = rawPriorityActions[1] ?? {};
  const rawNextReadyCriteria = stringArrayValue(rawNextPriorityAction.readyCriteria);
  const rawNextChecklist = stringArrayValue(rawNextPriorityAction.actionChecklist);
  const rawNextRequiredKeys = stringArrayValue(rawNextPriorityAction.requiredKeys);
  const rawNextPlaceholderKeys = stringArrayValue(rawNextPriorityAction.placeholderKeys);
  const rawNextEvidenceRows = valueFreeObjectRows(rawNextPriorityAction.evidence);
  const rawNextBlockers = stringArrayValue(rawNextPriorityAction.blockers);
  const rawNextPrerequisiteCommands = stringArrayValue(rawNextPriorityAction.prerequisiteCommands);
  const rawNextOperatorActions = stringArrayValue(rawNextPriorityAction.operatorActions);
  const rawNextEnvEditRows = valueFreeObjectRows(rawNextPriorityAction.envEditRows);
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
  check(report.hardGateReady === externalGate.externalDistributionGateReady, "release current blocker should mirror hard-gate readiness");
  check(report.hardGateWouldFail === externalGate.hardGateWouldFail, "release current blocker should mirror hard-gate would-fail posture");
  check(report.hardGateRequirementCount === report.hardGateRequirementRows.length, "release current blocker hard-gate requirement count should match rows");
  check(report.hardGateRequirementCount === valueFreeObjectRows(externalGate.requirements).length, "release current blocker should mirror external gate requirement rows");
  check(report.hardGateRequirementReadyCount === report.hardGateRequirementRows.filter((row) => row.ready).length, "release current blocker hard-gate ready count should match rows");
  check(report.hardGateRequirementBlockedCount === report.hardGateBlockedRequirementRows.length, "release current blocker hard-gate blocked count should match blocked rows");
  check(report.hardGateRequirementBlockedCount === report.hardGateRequirementRows.filter((row) => !row.ready).length, "release current blocker hard-gate blocked count should match requirement rows");
  check(report.hardGateRequirementRows.every((row) => row.valueRecorded === false), "release current blocker hard-gate requirement rows should not record values");
  check(report.hardGateBlockedRequirementRows.every((row) => row.valueRecorded === false), "release current blocker hard-gate blocked rows should not record values");
  check(report.hardGateBlockedRequirementRows.some((row) => row.label === "Private inputs ready"), "release current blocker hard-gate ladder should include private-input blocker");
  check(report.hardGateBlockedRequirementRows.some((row) => row.label === "Distribution-channel QA ready"), "release current blocker hard-gate ladder should include distribution-channel QA blocker");
  check(report.hardGateBlockedRequirementRows.some((row) => row.label === "Auto-update ready"), "release current blocker hard-gate ladder should include auto-update blocker");
  check(report.hardGateBlockedRequirementRows.some((row) => row.label === "Developer ID signed isolated app ready"), "release current blocker hard-gate ladder should include Developer ID signing blocker");
  check(report.hardGateBlockedRequirementRows.some((row) => row.label === "Notarization accepted and stapled"), "release current blocker hard-gate ladder should include notarization blocker");
  check(report.hardGateBlockedRequirementRows.some((row) => row.label === "Notarized Gatekeeper accepted"), "release current blocker hard-gate ladder should include notarized Gatekeeper blocker");
  check(report.hardGateBlockerCount === stringArrayValue(externalGate.externalDistributionGateBlockers).length, "release current blocker should mirror hard-gate blocker count");
  check(typeof report.hardGateRequirementSummary === "string" && report.hardGateRequirementSummary.length > 0, "release current blocker should include hard-gate requirement summary");
  check(typeof report.hardGateBlockedRequirementSummary === "string" && report.hardGateBlockedRequirementSummary.length > 0, "release current blocker should include hard-gate blocked requirement summary");
  check(report.sourceExternalNextActionsReady === true, "release current blocker should include ready external next-actions source evidence");
  check(report.sourceExternalNextActionsPath === relative(externalNextActionsJsonPath), "release current blocker should identify external next-actions source path");
  check(report.priorityActionCount === report.priorityActionRows.length, "release current blocker priority action count should match rows");
  check(report.priorityActionCount === integerValue(externalNextActions.priorityActionCount), "release current blocker should mirror external next-actions priority action count");
  check(report.priorityActionRows.every((row) => row.valueRecorded === false), "release current blocker priority action rows should not record values");
  check(report.priorityActionRows.every((row) => row.ready === false), "release current blocker priority action rows should be pending actions");
  check(report.priorityActionRows.every((row) => row.nextCommand !== "none"), "release current blocker priority action rows should include next commands");
  check(report.priorityActionRows.every((row) => row.actionChecklistCount > 0), "release current blocker priority action rows should include checklist counts");
  check(report.priorityActionRows.some((row) => row.id === "release-channel-metadata"), "release current blocker priority action ladder should include release-channel metadata");
  check(report.priorityActionRows.some((row) => row.id === "auto-update-feed"), "release current blocker priority action ladder should include auto-update feed");
  check(report.priorityActionRows.some((row) => row.id === "developer-id-signing"), "release current blocker priority action ladder should include Developer ID signing");
  check(report.priorityActionRows.some((row) => row.id === "notarization-stapling"), "release current blocker priority action ladder should include notarization and stapling");
  check(report.priorityActionRows.some((row) => row.id === "notarized-gatekeeper"), "release current blocker priority action ladder should include notarized Gatekeeper");
  check(report.priorityActionRows.some((row) => row.id === "manual-channel-qa"), "release current blocker priority action ladder should include manual channel QA");
  check(report.priorityActionRows.some((row) => row.id === "final-hard-gate"), "release current blocker priority action ladder should include final hard gate");
  check(report.currentPriorityActionId === externalNextActions.currentActionId, "release current blocker should mirror external next-actions current action id");
  check(report.currentPriorityActionNextCommand === report.currentNextCommand, "release current blocker current priority action next command should match current next command");
  check(report.currentPriorityActionFirstBlocker === report.currentFirstBlocker, "release current blocker current priority action first blocker should match current first blocker");
  check(report.nextPriorityActionId !== "none", "release current blocker should identify the next priority action after current action");
  check(report.nextPriorityActionNextCommand !== "none", "release current blocker next priority action should include a next command");
  check(report.nextActionPreviewReady === true, "release current blocker next action preview should be ready");
  check(report.nextActionPreviewId === report.nextPriorityActionId, "release current blocker next action preview id should match next priority action");
  check(report.nextActionPreviewLabel === report.nextPriorityActionLabel, "release current blocker next action preview label should match next priority action");
  check(report.nextActionPreviewProofCommand === report.nextPriorityActionNextCommand, "release current blocker next action preview proof command should match next priority action command");
  check(report.nextActionPreviewFirstBlocker === report.nextPriorityActionFirstBlocker, "release current blocker next action preview first blocker should match next priority action blocker");
  check(report.nextActionPreviewReadyCriteriaRowCount === report.nextActionPreviewReadyCriteriaRows.length, "release current blocker next action preview ready criteria row count should match rows");
  check(report.nextActionPreviewReadyCriteriaRowCount === rawNextReadyCriteria.length, "release current blocker next action preview should mirror second priority action ready criteria count");
  check(report.nextActionPreviewReadyCriteriaRowCount > 0, "release current blocker next action preview should include ready criteria rows");
  check(typeof report.nextActionPreviewReadyCriteriaSummary === "string" && report.nextActionPreviewReadyCriteriaSummary.length > 0, "release current blocker should include next action preview ready criteria summary");
  check(report.nextActionPreviewReadyCriteriaRows.every((row) => row.valueRecorded === false), "release current blocker next action preview ready criteria rows should not record values");
  check(report.nextActionPreviewReadyCriteriaRows.every((row) => row.proofCommand === report.nextPriorityActionNextCommand), "release current blocker next action preview ready criteria proof commands should match next priority action command");
  check(report.nextActionPreviewReadyCriteriaRows.every((row) => typeof row.sourceField === "string" && row.sourceField.includes("externalNextActions.priorityActions[1]")), "release current blocker next action preview ready criteria should cite the second priority action source field");
  check(report.nextActionPreviewReadyCriteriaRows.some((row) => /update feed config/i.test(row.criterion)), "release current blocker next action preview should include update feed config criterion");
  check(report.nextActionPreviewReadyCriteriaRows.some((row) => /auto-update readiness/i.test(row.criterion)), "release current blocker next action preview should include auto-update readiness criterion");
  check(report.nextActionPreviewReadyCriteriaRows.some((row) => /signed/i.test(row.criterion) && /notarized/i.test(row.criterion)), "release current blocker next action preview should include signed and notarized update metadata criterion");
  check(report.nextActionPreviewChecklistRowCount === report.nextActionPreviewChecklistRows.length, "release current blocker next action preview checklist row count should match rows");
  check(report.nextActionPreviewChecklistRowCount === rawNextChecklist.length, "release current blocker next action preview should mirror second priority action checklist count");
  check(report.nextActionPreviewChecklistRowCount > 0, "release current blocker next action preview should include checklist rows");
  check(typeof report.nextActionPreviewChecklistSummary === "string" && report.nextActionPreviewChecklistSummary.length > 0, "release current blocker should include next action preview checklist summary");
  check(report.nextActionPreviewChecklistRows.every((row) => row.valueRecorded === false), "release current blocker next action preview checklist rows should not record values");
  check(report.nextActionPreviewChecklistRows.every((row) => row.proofCommand === report.nextPriorityActionNextCommand), "release current blocker next action preview checklist proof commands should match next priority action command");
  check(report.nextActionPreviewRequiredKeyCount === rawNextRequiredKeys.length, "release current blocker next action preview required key count should match second priority action");
  check(report.nextActionPreviewPlaceholderKeyCount === rawNextPlaceholderKeys.length, "release current blocker next action preview placeholder key count should match second priority action");
  check(report.nextActionPreviewPlaceholderKeys.length === report.nextActionPreviewPlaceholderKeyCount, "release current blocker next action preview placeholder keys should match placeholder key count");
  check(report.nextActionPreviewEvidenceRowCount === report.nextActionPreviewEvidenceRows.length, "release current blocker next action preview evidence row count should match rows");
  check(report.nextActionPreviewEvidenceRowCount === rawNextEvidenceRows.length, "release current blocker next action preview should mirror second priority action evidence count");
  check(report.nextActionPreviewEvidenceRows.every((row) => row.valueRecorded === false), "release current blocker next action preview evidence rows should not record values");
  check(report.nextActionPreviewBlockerRowCount === report.nextActionPreviewBlockerRows.length, "release current blocker next action preview blocker row count should match rows");
  check(report.nextActionPreviewBlockerRowCount === rawNextBlockers.length, "release current blocker next action preview should mirror second priority action blocker count");
  check(report.nextActionPreviewBlockerRowCount > 0, "release current blocker next action preview should include blocker rows");
  check(typeof report.nextActionPreviewBlockerSummary === "string" && report.nextActionPreviewBlockerSummary.length > 0, "release current blocker should include next action preview blocker summary");
  check(report.nextActionPreviewBlockerRows.every((row) => row.valueRecorded === false), "release current blocker next action preview blocker rows should not record values");
  check(report.nextActionPreviewBlockerRows.every((row) => row.proofCommand === report.nextPriorityActionNextCommand), "release current blocker next action preview blocker proof commands should match next priority action command");
  check(report.nextActionPreviewBlockerRows.every((row) => typeof row.sourceField === "string" && row.sourceField.includes("externalNextActions.priorityActions[1]")), "release current blocker next action preview blocker rows should cite the second priority action source field");
  check(report.nextActionPreviewBlockerRows.some((row) => /auto-update readiness is not complete/i.test(row.blocker)), "release current blocker next action preview blockers should include auto-update readiness blocker");
  check(report.nextActionPreviewBlockerRows.some((row) => /no update provider, feed url, and channel metadata/i.test(row.blocker)), "release current blocker next action preview blockers should include provider/feed/channel blocker");
  check(report.nextActionPreviewBlockerRows.some((row) => /signed\/notarized update metadata artifacts/i.test(row.blocker)), "release current blocker next action preview blockers should include signed and notarized update metadata blocker");
  check(report.nextActionPreviewVerificationRowCount === report.nextActionPreviewVerificationRows.length, "release current blocker next action preview verification row count should match rows");
  check(report.nextActionPreviewVerificationRowCount === rawNextReadyCriteria.length, "release current blocker next action preview verification rows should mirror second priority action ready criteria count");
  check(report.nextActionPreviewVerificationRowCount > 0, "release current blocker next action preview should include verification rows");
  check(typeof report.nextActionPreviewVerificationSummary === "string" && report.nextActionPreviewVerificationSummary.length > 0, "release current blocker should include next action preview verification summary");
  check(report.nextActionPreviewVerificationRows.every((row) => row.valueRecorded === false), "release current blocker next action preview verification rows should not record values");
  check(report.nextActionPreviewVerificationRows.every((row) => row.proofCommand === report.nextPriorityActionNextCommand), "release current blocker next action preview verification proof commands should match next priority action command");
  check(report.nextActionPreviewVerificationRows.every((row) => row.currentReady === false), "release current blocker next action preview verification rows should remain not ready while the next action is blocked");
  check(report.nextActionPreviewVerificationRows.every((row) => typeof row.currentEvidence === "string" && row.currentEvidence.length > 0), "release current blocker next action preview verification rows should include current evidence");
  check(report.nextActionPreviewVerificationRows.every((row) => typeof row.expectedSignal === "string" && row.expectedSignal.includes("value recorded no")), "release current blocker next action preview verification rows should include value-free expected signals");
  check(report.nextActionPreviewVerificationRows.some((row) => /safe feed URL key ready/i.test(row.expectedSignal)), "release current blocker next action preview verification should include update feed expected signal");
  check(report.nextActionPreviewVerificationRows.some((row) => /auto-update readiness ready yes/i.test(row.expectedSignal)), "release current blocker next action preview verification should include auto-update readiness expected signal");
  check(report.nextActionPreviewVerificationRows.some((row) => /signed\/notarized update metadata artifacts ready/i.test(row.expectedSignal)), "release current blocker next action preview verification should include signed and notarized update metadata expected signal");
  check(report.nextActionPreviewVerificationRows.some((row) => /provider, feed url, and channel metadata/i.test(row.currentEvidence)), "release current blocker next action preview verification should cite provider/feed/channel blocker evidence");
  check(report.nextActionPreviewPrerequisiteCommandRowCount === report.nextActionPreviewPrerequisiteCommandRows.length, "release current blocker next action preview prerequisite command row count should match rows");
  check(report.nextActionPreviewPrerequisiteCommandRowCount === rawNextPrerequisiteCommands.length, "release current blocker next action preview should mirror second priority action prerequisite command count");
  check(report.nextActionPreviewPrerequisiteCommandRowCount > 0, "release current blocker next action preview should include prerequisite command rows");
  check(typeof report.nextActionPreviewPrerequisiteCommandSummary === "string" && report.nextActionPreviewPrerequisiteCommandSummary.length > 0, "release current blocker should include next action preview prerequisite command summary");
  check(report.nextActionPreviewPrerequisiteCommandRows.every((row) => row.valueRecorded === false), "release current blocker next action preview prerequisite command rows should not record values");
  check(report.nextActionPreviewPrerequisiteCommandRows.every((row) => row.proofCommand === report.nextPriorityActionNextCommand), "release current blocker next action preview prerequisite command proof commands should match next priority action command");
  check(report.nextActionPreviewPrerequisiteCommandRows.every((row) => typeof row.sourceField === "string" && row.sourceField.includes("externalNextActions.priorityActions[1]")), "release current blocker next action preview prerequisite command rows should cite the second priority action source field");
  check(report.nextActionPreviewPrerequisiteCommandRows.some((row) => row.command === "npm run desktop:update-feed-config-smoke"), "release current blocker next action preview prerequisite commands should include update feed config smoke");
  check(report.nextActionPreviewPrerequisiteCommandRows.some((row) => row.command === "npm run desktop:update-metadata-policy-smoke"), "release current blocker next action preview prerequisite commands should include update metadata policy smoke");
  check(report.nextActionPreviewPrerequisiteCommandRows.some((row) => row.command === "npm run desktop:update-metadata-artifacts-smoke"), "release current blocker next action preview prerequisite commands should include update metadata artifacts smoke");
  check(report.nextActionPreviewPrerequisiteCommandRows.some((row) => row.command === "npm run desktop:auto-update-readiness-smoke"), "release current blocker next action preview prerequisite commands should include auto-update readiness smoke");
  check(report.nextActionPreviewOperatorActionRowCount === report.nextActionPreviewOperatorActionRows.length, "release current blocker next action preview operator action row count should match rows");
  check(report.nextActionPreviewOperatorActionRowCount === rawNextOperatorActions.length, "release current blocker next action preview should mirror second priority action operator action count");
  check(report.nextActionPreviewOperatorActionRowCount > 0, "release current blocker next action preview should include operator action rows");
  check(typeof report.nextActionPreviewOperatorActionSummary === "string" && report.nextActionPreviewOperatorActionSummary.length > 0, "release current blocker should include next action preview operator action summary");
  check(report.nextActionPreviewOperatorActionRows.every((row) => row.valueRecorded === false), "release current blocker next action preview operator action rows should not record values");
  check(report.nextActionPreviewOperatorActionRows.every((row) => row.proofCommand === report.nextPriorityActionNextCommand), "release current blocker next action preview operator action proof commands should match next priority action command");
  check(report.nextActionPreviewOperatorActionRows.some((row) => /ignored update feed and channel keys/i.test(row.action)), "release current blocker next action preview operator actions should include ignored update feed/channel configuration");
  check(report.nextActionPreviewOperatorActionRows.some((row) => /regenerate update metadata/i.test(row.action)), "release current blocker next action preview operator actions should include update metadata regeneration");
  check(report.nextActionPreviewEnvEditRowCount === report.nextActionPreviewEnvEditRows.length, "release current blocker next action preview env edit row count should match rows");
  check(report.nextActionPreviewEnvEditRowCount === rawNextEnvEditRows.length, "release current blocker next action preview should mirror second priority action env edit row count");
  check(report.nextActionPreviewEnvEditRowCount > 0, "release current blocker next action preview should include env edit rows");
  check(typeof report.nextActionPreviewEnvEditSummary === "string" && report.nextActionPreviewEnvEditSummary.length > 0, "release current blocker should include next action preview env edit summary");
  check(report.nextActionPreviewEnvEditRows.every((row) => row.valueRecorded === false), "release current blocker next action preview env edit rows should not record values");
  check(report.nextActionPreviewEnvEditRows.every((row) => row.proofCommand === report.nextPriorityActionNextCommand), "release current blocker next action preview env edit proof commands should match next priority action command");
  check(report.nextActionPreviewEnvEditRows.every((row) => typeof row.sourceField === "string" && row.sourceField.includes("externalNextActions.priorityActions[1]")), "release current blocker next action preview env edit rows should cite the second priority action source field");
  check(report.nextActionPreviewEnvEditRows.some((row) => row.location === ".env.distribution.local:24" && row.key === "GROOVEFORGE_UPDATE_FEED_URL"), "release current blocker next action preview env edit rows should include primary update feed URL location");
  check(report.nextActionPreviewEnvEditRows.some((row) => row.location === ".env.distribution.local:29" && row.key === "UPDATE_CHANNEL"), "release current blocker next action preview env edit rows should include fallback update channel location");
  check(report.nextActionPreviewEnvEditRows.every((row) => row.assignment.includes("<") && row.assignment.includes(">")), "release current blocker next action preview env edit rows should use value-free assignment shapes");
  check(report.currentActionTransitionReady === true, "release current blocker current action transition preview should be ready");
  check(report.currentActionTransitionRowCount === report.currentActionTransitionRows.length, "release current blocker current action transition row count should match rows");
  check(report.currentActionTransitionRowCount === 3, "release current blocker current action transition preview should include current, next, and hard-gate rows");
  check(typeof report.currentActionTransitionSummary === "string" && report.currentActionTransitionSummary.length > 0, "release current blocker should include current action transition summary");
  check(report.currentActionTransitionRows.every((row) => row.valueRecorded === false), "release current blocker current action transition rows should not record values");
  check(report.currentActionTransitionRows[0]?.actionId === report.currentPriorityActionId, "release current blocker transition current row should match current priority action");
  check(report.currentActionTransitionRows[0]?.proofCommand === report.currentNextCommand, "release current blocker transition current proof command should match current next command");
  check(report.currentActionTransitionRows[1]?.actionId === report.nextPriorityActionId, "release current blocker transition next row should match next priority action");
  check(report.currentActionTransitionRows[1]?.proofCommand === report.nextPriorityActionNextCommand, "release current blocker transition next proof command should match next priority action command");
  check(report.currentActionTransitionRows[2]?.proofCommand === report.hardGateCommand, "release current blocker transition hard-gate row should point at hard gate command");
  check(report.priorityActionCurrentMatchesCurrentBlocker === true, "release current blocker should prove priority action current blocker alignment");
  check(report.externalCompletionChecklistCount === report.externalCompletionChecklistRows.length, "release current blocker external completion checklist count should match rows");
  check(report.externalCompletionChecklistCount === report.priorityActionCount, "release current blocker external completion checklist should mirror priority action count");
  check(report.externalCompletionChecklistCount === integerValue(externalNextActions.priorityActionCount), "release current blocker external completion checklist should mirror external next-actions count");
  check(typeof report.externalCompletionChecklistSummary === "string" && report.externalCompletionChecklistSummary.length > 0, "release current blocker should include external completion checklist summary");
  check(report.externalCompletionChecklistRows.every((row) => row.valueRecorded === false), "release current blocker external completion checklist rows should not record values");
  check(report.externalCompletionChecklistRows.every((row) => row.proofCommand !== "none"), "release current blocker external completion checklist rows should include proof commands");
  check(report.externalCompletionChecklistRows.every((row) => row.hardGateCommand === report.hardGateCommand), "release current blocker external completion checklist rows should point at the hard gate command");
  check(report.externalCompletionChecklistRows.every((row) => row.readyCriteriaCount > 0), "release current blocker external completion checklist rows should include ready criteria counts");
  check(report.externalCompletionChecklistRows.every((row) => row.actionChecklistCount > 0), "release current blocker external completion checklist rows should include checklist step counts");
  check(report.externalCompletionChecklistRows.every((row) => row.evidenceSummary.length > 0), "release current blocker external completion checklist rows should include evidence summaries");
  check(report.externalCompletionChecklistRows.some((row) => row.id === "release-channel-metadata"), "release current blocker external completion checklist should include release-channel metadata");
  check(report.externalCompletionChecklistRows.some((row) => row.id === "auto-update-feed"), "release current blocker external completion checklist should include auto-update feed");
  check(report.externalCompletionChecklistRows.some((row) => row.id === "developer-id-signing"), "release current blocker external completion checklist should include Developer ID signing");
  check(report.externalCompletionChecklistRows.some((row) => row.id === "notarization-stapling"), "release current blocker external completion checklist should include notarization and stapling");
  check(report.externalCompletionChecklistRows.some((row) => row.id === "notarized-gatekeeper"), "release current blocker external completion checklist should include notarized Gatekeeper");
  check(report.externalCompletionChecklistRows.some((row) => row.id === "manual-channel-qa"), "release current blocker external completion checklist should include manual channel QA");
  check(report.externalCompletionChecklistRows.some((row) => row.id === "final-hard-gate"), "release current blocker external completion checklist should include final hard gate");
  check(report.currentExternalCompletionChecklistRowId === report.currentPriorityActionId, "release current blocker current external completion checklist row should match current priority action");
  check(report.currentExternalCompletionChecklistProofCommand === report.currentNextCommand, "release current blocker current external completion checklist proof command should match current next command");
  check(report.externalCompletionChecklistCurrentMatchesPriorityAction === true, "release current blocker should prove external completion checklist current-row alignment");
  check(report.currentActionAcceptanceRowCount === report.currentActionAcceptanceRows.length, "release current blocker current action acceptance row count should match rows");
  check(report.currentActionAcceptanceRowCount === integerValue(externalNextActions.currentReadyCriteriaCount), "release current blocker current action acceptance rows should mirror current ready criteria count");
  check(report.currentActionAcceptanceReadyCount === report.currentActionAcceptanceRows.filter((row) => row.ready).length, "release current blocker current action acceptance ready count should match rows");
  check(typeof report.currentActionAcceptanceSummary === "string" && report.currentActionAcceptanceSummary.length > 0, "release current blocker should include current action acceptance summary");
  check(report.currentActionAcceptanceRows.every((row) => row.valueRecorded === false), "release current blocker current action acceptance rows should not record values");
  check(report.currentActionAcceptanceRows.every((row) => row.proofCommand === report.currentNextCommand), "release current blocker current action acceptance proof commands should match current next command");
  check(report.currentActionAcceptanceRows.every((row) => row.rerunCommand === report.currentRerunCommand), "release current blocker current action acceptance rerun commands should match current rerun command");
  check(report.currentActionAcceptanceRows.every((row) => row.hardGateCommand === report.hardGateCommand), "release current blocker current action acceptance rows should keep hard gate command references");
  check(report.currentActionAcceptanceRows.some((row) => row.criterion.includes("without placeholder values")), "release current blocker current action acceptance should include placeholder-free criterion");
  check(report.currentActionAcceptanceRows.some((row) => row.criterion.includes("private-inputs")), "release current blocker current action acceptance should include private-inputs criterion");
  check(report.currentActionAcceptanceRows.some((row) => row.criterion.includes("Distribution-channel QA")), "release current blocker current action acceptance should include distribution-channel QA criterion");
  check(report.currentActionAcceptanceRows.every((row) => typeof row.evidence === "string" && row.evidence.length > 0), "release current blocker current action acceptance should include evidence summaries");
  check(report.currentActionAcceptanceMatchesCurrentAction === true, "release current blocker should prove current action acceptance alignment");
  check(report.currentActionAcceptanceBlockerCount === report.currentActionAcceptanceBlockerRows.length, "release current blocker current action acceptance blocker count should match rows");
  check(report.currentActionAcceptanceBlockerCount === report.currentActionAcceptanceRows.filter((row) => row.ready !== true).length, "release current blocker current action acceptance blocker rows should mirror failing acceptance criteria");
  check(typeof report.currentActionAcceptanceBlockerSummary === "string" && report.currentActionAcceptanceBlockerSummary.length > 0, "release current blocker should include current action acceptance blocker summary");
  check(report.currentActionAcceptanceBlockerRows.every((row) => row.valueRecorded === false), "release current blocker current action acceptance blocker rows should not record values");
  check(report.currentActionAcceptanceBlockerRows.every((row) => typeof row.sourceField === "string" && row.sourceField.length > 0), "release current blocker current action acceptance blocker rows should include source fields");
  check(report.currentActionAcceptanceBlockerRows.every((row) => typeof row.operatorAction === "string" && row.operatorAction.length > 0), "release current blocker current action acceptance blocker rows should include operator actions");
  check(report.currentActionAcceptanceBlockerRows.every((row) => row.proofCommand === report.currentNextCommand), "release current blocker current action acceptance blocker proof commands should match current next command");
  check(report.currentActionAcceptanceBlockerRows.every((row) => row.rerunCommand === report.currentRerunCommand), "release current blocker current action acceptance blocker rerun commands should match current rerun command");
  if (report.currentPlaceholderKeyCount > 0) {
    check(report.currentActionAcceptanceBlockerRows.some((row) => row.sourceField.includes("currentPlaceholderKeys")), "release current blocker current action acceptance blockers should include placeholder source fields while placeholders remain");
  }
  if (releaseDoctor.privateInputsReady !== true || releaseDoctor.channelMetadataReady !== true) {
    check(report.currentActionAcceptanceBlockerRows.some((row) => row.sourceField.includes("privateInputsReady")), "release current blocker current action acceptance blockers should include private-input source fields while private inputs are blocked");
  }
  if (releaseDoctor.distributionChannelQaReady !== true) {
    check(report.currentActionAcceptanceBlockerRows.some((row) => row.sourceField.includes("distributionChannelQaReady")), "release current blocker current action acceptance blockers should include distribution-channel QA source fields while channel QA is blocked");
  }
  check(report.currentActionAcceptanceBlockersMatchAcceptance === true, "release current blocker should prove current action acceptance blockers match failing acceptance criteria");
  check(report.currentActionAcceptanceRemediationReady === true, "release current blocker current action acceptance remediation should be ready");
  check(report.currentActionAcceptanceRemediationRowCount === report.currentActionAcceptanceRemediationRows.length, "release current blocker current action acceptance remediation row count should match rows");
  check(report.currentActionAcceptanceRemediationRowCount === report.currentActionAcceptanceBlockerCount, "release current blocker current action acceptance remediation rows should mirror acceptance blockers");
  check(typeof report.currentActionAcceptanceRemediationSummary === "string" && report.currentActionAcceptanceRemediationSummary.length > 0, "release current blocker should include current action acceptance remediation summary");
  check(report.currentActionAcceptanceRemediationRows.every((row) => row.valueRecorded === false), "release current blocker current action acceptance remediation rows should not record values");
  check(report.currentActionAcceptanceRemediationRows.every((row) => row.proofCommand === report.currentNextCommand), "release current blocker current action acceptance remediation proof commands should match current next command");
  check(report.currentActionAcceptanceRemediationRows.every((row) => row.rerunCommand === report.currentRerunCommand), "release current blocker current action acceptance remediation rerun commands should match current rerun command");
  check(report.currentActionAcceptanceRemediationRows.every((row) => row.hardGateCommand === report.hardGateCommand), "release current blocker current action acceptance remediation hard-gate commands should match hard gate command");
  check(report.currentActionAcceptanceRemediationRows.every((row) => typeof row.operatorFix === "string" && row.operatorFix.length > 0), "release current blocker current action acceptance remediation rows should include operator fixes");
  check(report.currentActionAcceptanceRemediationRows.every((row) => typeof row.evidenceToCheck === "string" && row.evidenceToCheck.length > 0), "release current blocker current action acceptance remediation rows should include evidence to check");
  check(report.currentActionAcceptanceRemediationRows.every((row) => typeof row.expectedReadySignal === "string" && row.expectedReadySignal.length > 0), "release current blocker current action acceptance remediation rows should include expected ready signals");
  check(report.currentActionAcceptanceRemediationRows.some((row) => /input shape checklist/i.test(row.evidenceToCheck)), "release current blocker current action acceptance remediation should reference input shape checklist");
  check(report.currentActionAcceptanceRemediationRows.some((row) => /local env diagnostics/i.test(row.evidenceToCheck)), "release current blocker current action acceptance remediation should reference local env diagnostics");
  check(report.currentActionAcceptanceRemediationRows.some((row) => /distribution-channel-qa/i.test(row.operatorFix)), "release current blocker current action acceptance remediation should include distribution-channel QA rerun");
  check(report.currentReleaseChannelKeyRemediationReady === true, "release current blocker release-channel key remediation matrix should be ready");
  check(report.currentReleaseChannelKeyRemediationRowCount === report.currentReleaseChannelKeyRemediationRows.length, "release current blocker release-channel key remediation row count should match rows");
  check(report.currentReleaseChannelKeyRemediationRowCount === releaseChannelMetadataKeys.length, "release current blocker release-channel key remediation should include four rows");
  check(sameStringArray(report.currentReleaseChannelKeyRemediationRows.map((row) => row.key), releaseChannelMetadataKeys), "release current blocker release-channel key remediation should cover release-channel metadata keys");
  check(typeof report.currentReleaseChannelKeyRemediationSummary === "string" && report.currentReleaseChannelKeyRemediationSummary.length > 0, "release current blocker should include release-channel key remediation summary");
  check(report.currentReleaseChannelKeyRemediationRows.every((row) => row.valueRecorded === false), "release current blocker release-channel key remediation rows should not record values");
  check(report.currentReleaseChannelKeyRemediationRows.every((row) => row.proofCommand === report.currentNextCommand), "release current blocker release-channel key remediation proof commands should match current next command");
  check(report.currentReleaseChannelKeyRemediationRows.every((row) => row.rerunCommand === report.currentRerunCommand), "release current blocker release-channel key remediation rerun commands should match current rerun command");
  check(report.currentReleaseChannelKeyRemediationRows.every((row) => row.hardGateCommand === report.hardGateCommand), "release current blocker release-channel key remediation hard-gate commands should match hard gate command");
  check(report.currentReleaseChannelKeyRemediationRows.every((row) => typeof row.location === "string" && row.location.includes(".env.distribution.local:")), "release current blocker release-channel key remediation rows should include local env edit locations");
  check(report.currentReleaseChannelKeyRemediationRows.every((row) => typeof row.expectedShape === "string" && /allowed channel token|safe HTTPS URL shape/i.test(row.expectedShape)), "release current blocker release-channel key remediation rows should include expected shapes");
  check(report.currentReleaseChannelKeyRemediationRows.every((row) => /without placeholder values/i.test(row.acceptanceCriteriaImpacted)), "release current blocker release-channel key remediation rows should include placeholder-free acceptance impact");
  check(report.currentReleaseChannelKeyRemediationRows.every((row) => /private-inputs/i.test(row.acceptanceCriteriaImpacted)), "release current blocker release-channel key remediation rows should include private-inputs acceptance impact");
  check(report.currentReleaseChannelKeyRemediationRows.every((row) => /Distribution-channel QA/i.test(row.acceptanceCriteriaImpacted)), "release current blocker release-channel key remediation rows should include distribution-channel QA acceptance impact");
  if (report.currentPlaceholderKeyCount > 0) {
    check(report.currentReleaseChannelKeyRemediationRows.every((row) => row.placeholder === true), "release current blocker release-channel key remediation rows should mark current placeholders while blocked");
  }
  check(report.currentCommandAcceptanceLadderReady === true, "release current blocker current command acceptance ladder should be ready");
  check(report.currentCommandAcceptanceLadderRowCount === report.currentCommandAcceptanceLadderRows.length, "release current blocker current command acceptance ladder row count should match rows");
  check(report.currentCommandAcceptanceLadderRowCount === report.currentCommandVerificationRowCount, "release current blocker current command acceptance ladder should mirror command verification rows");
  check(sameStringArray(report.currentCommandAcceptanceLadderRows.map((row) => row.command), report.currentCommandSequence), "release current blocker current command acceptance ladder should cover current command sequence");
  check(typeof report.currentCommandAcceptanceLadderSummary === "string" && report.currentCommandAcceptanceLadderSummary.length > 0, "release current blocker should include current command acceptance ladder summary");
  check(report.currentCommandAcceptanceLadderRows.every((row) => row.valueRecorded === false), "release current blocker current command acceptance ladder rows should not record values");
  check(report.currentCommandAcceptanceLadderRows.every((row) => row.proofCommand === report.currentNextCommand), "release current blocker current command acceptance ladder proof commands should match current next command");
  check(report.currentCommandAcceptanceLadderRows.every((row) => row.rerunCommand === report.currentRerunCommand), "release current blocker current command acceptance ladder rerun commands should match current rerun command");
  check(report.currentCommandAcceptanceLadderRows.every((row) => row.hardGateCommand === report.hardGateCommand), "release current blocker current command acceptance ladder hard-gate commands should match hard gate command");
  check(report.currentCommandAcceptanceLadderRows.every((row) => typeof row.sourceArtifacts === "string" && row.sourceArtifacts.includes("build/desktop/")), "release current blocker current command acceptance ladder should include source artifact paths");
  check(report.currentCommandAcceptanceLadderRows.some((row) => /ignored local env template/i.test(row.acceptanceSignal)), "release current blocker current command acceptance ladder should include ignored local env template signal");
  check(report.currentCommandAcceptanceLadderRows.some((row) => /private inputs ready yes/i.test(row.acceptanceSignal)), "release current blocker current command acceptance ladder should include private-input ready signal");
  check(report.currentCommandAcceptanceLadderRows.some((row) => /distribution-channel QA ready yes/i.test(row.acceptanceSignal)), "release current blocker current command acceptance ladder should include distribution-channel QA ready signal");
  check(report.currentCommandAcceptanceLadderRows.some((row) => /current action acceptance ready yes/i.test(row.acceptanceSignal)), "release current blocker current command acceptance ladder should include current action acceptance ready signal");
  check(report.currentCommandAcceptanceLadderRows.some((row) => row.command === "npm run release:doctor" && row.role === "proof"), "release current blocker current command acceptance ladder should include release doctor proof row");
  check(report.currentCommandAcceptanceLadderRows.some((row) => row.command === "npm run release:current-blocker" && row.role === "rerun"), "release current blocker current command acceptance ladder should include current-blocker rerun row");
  check(report.currentCommandSourceArtifactMatrixReady === true, "release current blocker current command source artifact matrix should be ready");
  check(report.currentCommandSourceArtifactMatrixRowCount === report.currentCommandSourceArtifactMatrixRows.length, "release current blocker current command source artifact matrix row count should match rows");
  check(report.currentCommandSourceArtifactMatrixRowCount > 0, "release current blocker current command source artifact matrix should include source artifact rows");
  check(typeof report.currentCommandSourceArtifactMatrixSummary === "string" && report.currentCommandSourceArtifactMatrixSummary.length > 0, "release current blocker should include current command source artifact matrix summary");
  check(report.currentCommandSourceArtifactMatrixRows.every((row) => row.valueRecorded === false), "release current blocker current command source artifact matrix rows should not record values");
  check(report.currentCommandSourceArtifactMatrixRows.every((row) => row.present === true), "release current blocker current command source artifact matrix rows should point at present artifacts");
  check(report.currentCommandSourceArtifactMatrixRows.every((row) => row.proofCommand === report.currentNextCommand), "release current blocker current command source artifact matrix proof commands should match current next command");
  check(report.currentCommandSourceArtifactMatrixRows.every((row) => row.rerunCommand === report.currentRerunCommand), "release current blocker current command source artifact matrix rerun commands should match current rerun command");
  check(report.currentCommandSourceArtifactMatrixRows.every((row) => row.hardGateCommand === report.hardGateCommand), "release current blocker current command source artifact matrix hard-gate commands should match hard gate command");
  check(report.currentCommandSourceArtifactMatrixRows.every((row) => typeof row.artifactPath === "string" && row.artifactPath.includes("build/desktop/")), "release current blocker current command source artifact matrix should include artifact paths");
  check(report.currentCommandSourceArtifactMatrixRows.every((row) => typeof row.consumingCommands === "string" && row.consumingCommands.includes("npm run")), "release current blocker current command source artifact matrix should include consuming commands");
  check(report.currentCommandSourceArtifactMatrixRows.some((row) => /distribution-private-inputs\.json/i.test(row.artifactPath)), "release current blocker current command source artifact matrix should include private-input artifact");
  check(report.currentCommandSourceArtifactMatrixRows.some((row) => /distribution-channel-qa\.json/i.test(row.artifactPath)), "release current blocker current command source artifact matrix should include distribution-channel QA artifact");
  check(report.currentCommandSourceArtifactMatrixRows.some((row) => /private inputs ready yes/i.test(row.acceptanceSignals)), "release current blocker current command source artifact matrix should include private-input acceptance signal");
  check(report.currentCommandSourceArtifactMatrixRows.some((row) => /distribution-channel QA ready yes/i.test(row.acceptanceSignals)), "release current blocker current command source artifact matrix should include distribution-channel QA signal");
  check(report.currentActionPostEditVerificationReady === true, "release current blocker current action post-edit verification should be ready");
  check(report.currentActionPostEditVerificationRowCount === report.currentActionPostEditVerificationRows.length, "release current blocker current action post-edit verification row count should match rows");
  check(report.currentActionPostEditVerificationRowCount === report.currentActionAcceptanceRowCount, "release current blocker current action post-edit verification rows should mirror acceptance rows");
  check(report.currentActionPostEditVerificationCurrentReadyCount === report.currentActionPostEditVerificationRows.filter((row) => row.currentReady).length, "release current blocker current action post-edit verification current-ready count should match rows");
  check(typeof report.currentActionPostEditVerificationSummary === "string" && report.currentActionPostEditVerificationSummary.length > 0, "release current blocker should include current action post-edit verification summary");
  check(typeof report.currentActionPostEditVerificationCurrentSummary === "string" && report.currentActionPostEditVerificationCurrentSummary.length > 0, "release current blocker should include current action post-edit verification current summary");
  check(report.currentActionPostEditVerificationRows.every((row) => row.valueRecorded === false), "release current blocker current action post-edit verification rows should not record values");
  check(report.currentActionPostEditVerificationRows.every((row) => row.proofCommand === report.currentNextCommand), "release current blocker current action post-edit verification proof commands should match current next command");
  check(report.currentActionPostEditVerificationRows.every((row) => row.rerunCommand === report.currentRerunCommand), "release current blocker current action post-edit verification rerun commands should match current rerun command");
  check(report.currentActionPostEditVerificationRows.every((row) => row.hardGateCommand === report.hardGateCommand), "release current blocker current action post-edit verification hard-gate commands should match hard gate command");
  check(report.currentActionPostEditVerificationRows.every((row) => typeof row.expectedSignal === "string" && row.expectedSignal.length > 0), "release current blocker current action post-edit verification rows should include expected signals");
  check(report.currentActionPostEditVerificationRows.some((row) => row.sourceField.includes("currentPlaceholderKeyCount")), "release current blocker current action post-edit verification should include placeholder-count source field");
  check(report.currentActionPostEditVerificationRows.some((row) => row.sourceField.includes("privateInputsReady")), "release current blocker current action post-edit verification should include private-input source field");
  check(report.currentActionPostEditVerificationRows.some((row) => row.sourceField.includes("distributionChannelQaReady")), "release current blocker current action post-edit verification should include distribution-channel QA source field");
  check(report.currentActionPostEditVerificationMatchesAcceptance === true, "release current blocker current action post-edit verification should match acceptance rows");
  check(report.currentActionHandoffReady === true, "release current blocker current action handoff should be ready");
  check(report.currentActionHandoffRowCount === report.currentActionHandoffRows.length, "release current blocker current action handoff row count should match rows");
  check(report.currentActionHandoffRowCount === 5, "release current blocker current action handoff should include five handoff rows");
  check(typeof report.currentActionHandoffSummary === "string" && report.currentActionHandoffSummary.length > 0, "release current blocker should include current action handoff summary");
  check(report.currentActionHandoffRows.every((row) => row.valueRecorded === false), "release current blocker current action handoff rows should not record values");
  check(report.currentActionHandoffRows.every((row) => row.proofCommand === report.currentNextCommand), "release current blocker current action handoff proof commands should match current next command");
  check(report.currentActionHandoffRows.every((row) => row.rerunCommand === report.currentRerunCommand), "release current blocker current action handoff rerun commands should match current rerun command");
  check(report.currentActionHandoffRows.every((row) => row.hardGateCommand === report.hardGateCommand), "release current blocker current action handoff hard-gate commands should match hard gate command");
  check(report.currentActionHandoffRows.some((row) => row.sourceField === "sourceArtifacts"), "release current blocker current action handoff should include source artifacts");
  check(report.currentActionHandoffRows.some((row) => row.sourceField.includes("currentEnvEditTarget")), "release current blocker current action handoff should include current edit target");
  check(report.currentActionHandoffRows.some((row) => row.sourceField === "currentActionAcceptanceBlockerRows"), "release current blocker current action handoff should include acceptance blockers");
  check(report.currentActionHandoffRows.some((row) => row.sourceField.includes("currentCommandVerificationRows")), "release current blocker current action handoff should include rerun order");
  check(report.currentActionHandoffRows.some((row) => row.sourceField === "externalGate.requirements"), "release current blocker current action handoff should include hard-gate requirements");
  check(report.currentActionHandoffRows.some((row) => row.acceptanceBlockerCount === report.currentActionAcceptanceBlockerCount), "release current blocker current action handoff should mirror acceptance blocker count");
  check(report.currentActionHandoffSourceArtifactCount === report.sourceArtifacts.length, "release current blocker current action handoff source artifact count should match source artifacts");
  check(report.currentActionHandoffSourceArtifactSummary.includes("Release doctor"), "release current blocker current action handoff should summarize source artifacts");
  check(report.currentPrivateEditSafetyReady === true, "release current blocker private edit safety checklist should be ready");
  check(report.currentPrivateEditSafetyRowCount === report.currentPrivateEditSafetyRows.length, "release current blocker private edit safety row count should match rows");
  check(report.currentPrivateEditSafetyRowCount === 5, "release current blocker private edit safety should include five rows");
  check(typeof report.currentPrivateEditSafetySummary === "string" && report.currentPrivateEditSafetySummary.length > 0, "release current blocker should include private edit safety summary");
  check(report.currentPrivateEditSafetyRows.every((row) => row.valueRecorded === false), "release current blocker private edit safety rows should not record values");
  check(report.currentPrivateEditSafetyRows.every((row) => row.ready === true), "release current blocker private edit safety rows should be ready");
  check(report.currentPrivateEditSafetyRows.some((row) => /ignored local env target/i.test(row.check) && row.evidence.includes(".env.distribution.local")), "release current blocker private edit safety should include ignored env target evidence");
  check(report.currentPrivateEditSafetyRows.some((row) => /value-free/i.test(row.check) && /private values recorded no/i.test(row.evidence)), "release current blocker private edit safety should include value-free receipt evidence");
  check(report.currentPrivateEditSafetyRows.some((row) => /rerun order/i.test(row.check) && row.command === report.currentRerunCommand), "release current blocker private edit safety should include rerun order evidence");
  check(report.currentPrivateEditSafetyRows.some((row) => /Hard external gate/i.test(row.check) && row.command === report.hardGateCommand), "release current blocker private edit safety should keep hard gate separate");
  check(report.currentPrivateEditSafetyRows.some((row) => /No remote side effects/i.test(row.check) && /network probe no/i.test(row.evidence)), "release current blocker private edit safety should include no remote side effects evidence");
  check(report.currentInputShapeChecklistReady === true, "release current blocker input shape checklist should be ready");
  check(report.currentInputShapeChecklistRowCount === report.currentInputShapeChecklistRows.length, "release current blocker input shape checklist row count should match rows");
  check(report.currentInputShapeChecklistRowCount === releaseChannelMetadataKeys.length, "release current blocker input shape checklist should include four rows");
  check(typeof report.currentInputShapeChecklistSummary === "string" && report.currentInputShapeChecklistSummary.length > 0, "release current blocker should include input shape checklist summary");
  check(report.currentInputShapeChecklistRows.every((row) => row.valueRecorded === false), "release current blocker input shape checklist rows should not record values");
  check(report.currentInputShapeChecklistRows.every((row) => row.ready === true), "release current blocker input shape checklist rows should be ready");
  check(sameStringArray(report.currentInputShapeChecklistRows.map((row) => row.key), releaseChannelMetadataKeys), "release current blocker input shape checklist should cover release-channel metadata keys");
  check(report.currentInputShapeChecklistRows.every((row) => row.proofCommand === report.currentNextCommand), "release current blocker input shape checklist proof commands should match current next command");
  check(report.currentInputShapeChecklistRows.every((row) => row.rerunCommand === report.currentRerunCommand), "release current blocker input shape checklist rerun commands should match current rerun command");
  check(report.currentInputShapeChecklistRows.some((row) => row.key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" && /allowed channel token/i.test(row.expectedShape)), "release current blocker input shape checklist should include allowed channel token shape");
  check(report.currentInputShapeChecklistRows.filter((row) => /safe HTTPS URL shape/i.test(row.expectedShape)).length === 3, "release current blocker input shape checklist should include three safe HTTPS URL shapes");
  check(report.currentInputShapeChecklistRows.every((row) => /allowed channel token|safe HTTPS URL shape/i.test(row.evidenceSource)), "release current blocker input shape checklist should mirror unblock shape evidence");
  check(report.currentLocalEnvDiagnosticsReady === true, "release current blocker local env diagnostics should be ready");
  check(report.currentLocalEnvDiagnosticRowCount === report.currentLocalEnvDiagnosticRows.length, "release current blocker local env diagnostic row count should match rows");
  check(report.currentLocalEnvDiagnosticRowCount === 8, "release current blocker local env diagnostics should include eight rows");
  check(typeof report.currentLocalEnvDiagnosticSummary === "string" && report.currentLocalEnvDiagnosticSummary.length > 0, "release current blocker should include local env diagnostic summary");
  check(report.currentLocalEnvDiagnosticRows.every((row) => row.valueRecorded === false), "release current blocker local env diagnostic rows should not record values");
  check(report.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Local env source files checked" && row.status === "checked"), "release current blocker local env diagnostics should include checked files");
  check(report.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Current edit target present" && row.evidence === report.currentEnvEditTarget), "release current blocker local env diagnostics should include current edit target presence");
  check(report.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Current placeholder scope" && row.evidence.includes("current release-channel placeholders")), "release current blocker local env diagnostics should include current placeholder scope");
  check(report.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Unknown key scan" && row.evidence.includes("unknown key names reported")), "release current blocker local env diagnostics should include unknown key scan");
  check(report.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Malformed line scan" && row.evidence.includes("malformed line locations reported")), "release current blocker local env diagnostics should include malformed line scan");
  check(report.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Existing environment overrides" && row.evidence.includes("existing environment key names skipped")), "release current blocker local env diagnostics should include skipped existing env scan");
  check(report.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Loaded key redaction" && row.evidence.includes("values recorded no")), "release current blocker local env diagnostics should include loaded key redaction");
  check(report.currentLocalEnvDiagnosticRows.some((row) => row.diagnostic === "Local env value recording" && row.evidence.includes("values recorded no")), "release current blocker local env diagnostics should include local env value recording posture");
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
  check(report.tenPlanProgressReportDue === releaseProgress.tenPlanProgressReportDue, "release current blocker should mirror release progress 10-plan report due posture");
  check(report.tenPlanProgressReportDue === (report.currentTenPlanWindowRowCount === 10), "release current blocker 10-plan report due posture should match completed window count");
  check(report.tenPlanProgressReportCadence === releaseProgress.tenPlanProgressReportCadence, "release current blocker should mirror release progress 10-plan report cadence");
  check(report.nextTenPlanProgressReportAt === releaseProgress.nextTenPlanProgressReportAt, "release current blocker should mirror release progress next 10-plan report number");
  check(report.currentTenPlanWindowRows.every((row) => row.valueRecorded === false), "release current blocker 10-plan rows should not record values");
  check(report.audienceReadinessReady === true, "release current blocker should include ready audience readiness");
  check(report.audienceReadinessRowCount === report.audienceReadinessRows.length, "release current blocker audience row count should match rows");
  check(report.audienceReadinessRowCount === releaseProgress.audienceReadinessRowCount, "release current blocker should mirror release progress audience row count");
  check(report.audienceReadinessRows.every((row) => row.valueRecorded === false), "release current blocker audience readiness rows should not record values");
  check(report.audienceReadinessRows.every((row) => row.ready === true), "release current blocker audience readiness rows should be ready");
  check(report.audienceReadinessRows.every((row) => row.deliveryPackageReady === true), "release current blocker audience readiness rows should include ready delivery packages");
  check(report.audienceReadinessRows.every((row) => row.deliveryPackageReopenReady === true), "release current blocker audience readiness rows should include reopened delivery packages");
  check(report.audienceReadinessRows.every((row) => row.deliveryArtifactCount === 8), "release current blocker audience readiness rows should include eight delivery artifacts");
  check(report.audienceReadinessRows.every((row) => row.verifiedDeliveryArtifactCount === 8), "release current blocker audience readiness rows should include eight verified delivery artifacts");
  check(report.audienceAcceptanceReady === true, "release current blocker should include ready audience acceptance");
  check(report.audienceAcceptanceReady === releaseProgress.audienceAcceptanceReady, "release current blocker should mirror audience acceptance readiness");
  check(report.audienceAcceptanceRowCount === releaseProgress.audienceAcceptanceRowCount, "release current blocker should mirror audience acceptance row count");
  check(report.audienceAcceptanceRows.length === report.audienceAcceptanceRowCount, "release current blocker audience acceptance row count should match rows");
  check(report.audienceAcceptanceRows.every((row) => row.valueRecorded === false), "release current blocker audience acceptance rows should not record values");
  check(report.audienceAcceptanceRows.every((row) => row.ready === true), "release current blocker audience acceptance rows should be ready");
  check(report.audienceAcceptanceRows.every((row) => row.localFirst === true), "release current blocker audience acceptance rows should keep local-first posture");
  check(report.audienceAcceptanceRows.every((row) => row.samplingSecondary === true), "release current blocker audience acceptance rows should keep sampling secondary");
  check(report.audienceAcceptanceRows.filter((row) => row.audience === "first-time composer").length === 5, "release current blocker should include five first-time composer acceptance rows");
  check(report.audienceAcceptanceRows.filter((row) => row.audience === "professional producer").length === 5, "release current blocker should include five professional producer acceptance rows");
  check(report.audienceAcceptanceRows.some((row) => row.acceptanceArea === "Rendered path"), "release current blocker audience acceptance should include rendered path evidence");
  check(report.audienceAcceptanceRows.some((row) => row.acceptanceArea === "Workflow"), "release current blocker audience acceptance should include workflow evidence");
  check(report.audienceAcceptanceRows.some((row) => row.acceptanceArea === "Package"), "release current blocker audience acceptance should include package evidence");
  check(report.audienceAcceptanceRows.some((row) => row.acceptanceArea === "Package reopen"), "release current blocker audience acceptance should include package reopen evidence");
  check(report.audienceAcceptanceRows.some((row) => row.acceptanceArea === "Export and Handoff"), "release current blocker audience acceptance should include export and Handoff evidence");
  check(report.audienceDeliveryPackagesReady === releaseProgress.audienceDeliveryPackagesReady, "release current blocker should mirror persona delivery package readiness");
  check(report.audienceDeliveryPackageRowCount === releaseProgress.audienceDeliveryPackageRowCount, "release current blocker should mirror persona delivery package row count");
  check(report.audienceDeliveryPackageRows.every((row) => row.valueRecorded === false), "release current blocker persona delivery package rows should not record values");
  check(report.audienceDeliveryPackageRows.every((row) => row.ready === true && row.artifactCount === 8), "release current blocker persona delivery package rows should be ready with all artifacts");
  check(report.audienceDeliveryPackagesReopenReady === releaseProgress.audienceDeliveryPackagesReopenReady, "release current blocker should mirror persona delivery package reopen readiness");
  check(report.audienceDeliveryPackageReopenRowCount === releaseProgress.audienceDeliveryPackageReopenRowCount, "release current blocker should mirror persona delivery package reopen row count");
  check(report.audienceDeliveryPackageReopenRows.every((row) => row.valueRecorded === false), "release current blocker persona delivery package reopen rows should not record values");
  check(report.audienceDeliveryPackageReopenRows.every((row) => row.ready === true && row.verifiedArtifactCount === 8), "release current blocker persona delivery package reopen rows should be ready with all artifacts verified");
  check(
    report.audienceDeliveryPackageReopenRows.every(
      (row) => row.projectReopened === true && row.hashesReady === true && row.wavHeadersReady === true && row.midiHeaderReady === true && row.handoffReady === true
    ),
    "release current blocker persona delivery package reopen rows should verify project, hashes, WAV, MIDI, and Handoff"
  );
  check(report.beginnerAudienceReadinessReady === releaseProgress.beginnerAudienceReadinessReady, "release current blocker should mirror first-time composer readiness");
  check(report.professionalProducerAudienceReadinessReady === releaseProgress.professionalProducerAudienceReadinessReady, "release current blocker should mirror professional producer readiness");
  check(report.sourceReleaseChannelUnblockReady === true, "release current blocker should mirror release-channel unblock source readiness");
  check(report.sourceReleaseChannelUnblockPath === releaseProgress.sourceReleaseChannelUnblockPath, "release current blocker should mirror release-channel unblock source path");
  check(report.releaseChannelUnblockSmokeReady === true, "release current blocker should mirror ready release-channel unblock smoke evidence");
  check(report.releaseChannelUnblockLoaderEnabled === true, "release current blocker should mirror release-channel unblock loader readiness");
  check(report.releaseChannelUnblockLoadedKeyCount === 4, "release current blocker should mirror four loaded release-channel unblock keys");
  check(report.releaseChannelUnblockLoadedKeys.length === report.releaseChannelUnblockLoadedKeyCount, "release current blocker unblock loaded key count should match names");
  check(report.releaseChannelUnblockPlaceholderKeyCount === 0, "release current blocker should mirror zero release-channel unblock placeholder keys");
  check(report.releaseChannelUnblockPlaceholderKeys.length === 0, "release current blocker unblock placeholder key names should be empty");
  check(report.releaseChannelUnblockMetadataReady === true, "release current blocker should mirror release-channel unblock metadata readiness");
  check(report.releaseChannelUnblockMetadataRowCount === report.releaseChannelUnblockMetadataRows.length, "release current blocker unblock row count should match rows");
  check(report.releaseChannelUnblockMetadataRowCount === 4, "release current blocker should mirror four release-channel unblock metadata rows");
  check(report.releaseChannelUnblockMetadataRows.every((row) => row.valueRecorded === false), "release current blocker unblock metadata rows should not record values");
  check(report.releaseChannelUnblockMetadataRows.every((row) => row.present === true && row.ready === true), "release current blocker unblock metadata rows should be present and ready");
  check(report.releaseChannelUnblockPlaceholderBlockerCleared === true, "release current blocker should prove release-channel placeholder blocker can clear in rehearsal");
  check(report.releaseChannelUnblockNextProofCommandAfterRealEdits === "npm run release:doctor", "release current blocker should mirror unblock next proof command");
  check(report.releaseChannelUnblockCurrentBlockerRefreshCommand === "npm run release:current-blocker", "release current blocker should mirror unblock current blocker refresh command");
  check(report.releaseChannelUnblockPrivateValuesRecorded === false, "release current blocker unblock evidence should not record private values");
  check(report.releaseChannelUnblockNetworkProbeAttempted === false, "release current blocker unblock evidence should not probe network");
  check(report.releaseChannelUnblockReleaseUploadAttempted === false, "release current blocker unblock evidence should not upload releases");
  check(report.releaseChannelUnblockAppleNotarySubmissionAttempted === false, "release current blocker unblock evidence should not submit to Apple");
  check(report.releaseChannelUnblockSigningAttempted === false, "release current blocker unblock evidence should not sign artifacts");
  check(report.releaseChannelUnblockClaimedExternalDistribution === false, "release current blocker unblock evidence should not claim external distribution");
  check(report.releaseChannelUnblockValueRecorded === false, "release current blocker should not record release-channel unblock values");
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
    `- Hard gate ready: ${report.hardGateReady ? "yes" : "no"}`,
    `- Hard gate would fail: ${report.hardGateWouldFail ? "yes" : "no"}`,
    `- Hard gate requirements: ${report.hardGateRequirementCount} (${report.hardGateRequirementSummary})`,
    `- Hard gate blocked requirements: ${report.hardGateRequirementBlockedCount} (${report.hardGateBlockedRequirementSummary})`,
    `- Hard gate blockers: ${report.hardGateBlockerCount} (${report.hardGateBlockerSummary})`,
    `- Priority actions pending: ${report.priorityActionCount} (${report.priorityActionSummary})`,
    `- Current priority action: ${report.currentPriorityActionId} (${report.currentPriorityActionLabel})`,
    `- Current priority action next command: \`${report.currentPriorityActionNextCommand}\``,
    `- Current priority action aligned: ${report.priorityActionCurrentMatchesCurrentBlocker ? "yes" : "no"}`,
    `- Next priority action after current clears: ${report.nextPriorityActionId} (${report.nextPriorityActionLabel})`,
    `- Current action transition ready: ${report.currentActionTransitionReady ? "yes" : "no"}`,
    `- Current action transition rows: ${report.currentActionTransitionRowCount} (${report.currentActionTransitionSummary})`,
    `- Next action preview ready: ${report.nextActionPreviewReady ? "yes" : "no"}`,
    `- Next action preview ready criteria rows: ${report.nextActionPreviewReadyCriteriaRowCount} (${report.nextActionPreviewReadyCriteriaSummary})`,
    `- Next action preview checklist rows: ${report.nextActionPreviewChecklistRowCount} (${report.nextActionPreviewChecklistSummary})`,
    `- Next action preview blocker rows: ${report.nextActionPreviewBlockerRowCount} (${report.nextActionPreviewBlockerSummary})`,
    `- Next action preview verification rows: ${report.nextActionPreviewVerificationRowCount} (${report.nextActionPreviewVerificationSummary})`,
    `- Next action preview prerequisite command rows: ${report.nextActionPreviewPrerequisiteCommandRowCount} (${report.nextActionPreviewPrerequisiteCommandSummary})`,
    `- Next action preview operator action rows: ${report.nextActionPreviewOperatorActionRowCount} (${report.nextActionPreviewOperatorActionSummary})`,
    `- Next action preview env edit rows: ${report.nextActionPreviewEnvEditRowCount} (${report.nextActionPreviewEnvEditSummary})`,
    `- External completion checklist rows: ${report.externalCompletionChecklistCount} (${report.externalCompletionChecklistSummary})`,
    `- Current external completion checklist row: ${report.currentExternalCompletionChecklistRowId} (${report.currentExternalCompletionChecklistRowLabel})`,
    `- Current external completion checklist proof command: \`${report.currentExternalCompletionChecklistProofCommand}\``,
    `- External completion checklist current row aligned: ${report.externalCompletionChecklistCurrentMatchesPriorityAction ? "yes" : "no"}`,
    `- Current action acceptance ready: ${report.currentActionAcceptanceReady ? "yes" : "no"}`,
    `- Current action acceptance rows: ${report.currentActionAcceptanceRowCount} (${report.currentActionAcceptanceSummary})`,
    `- Current action acceptance blockers: ${report.currentActionAcceptanceBlockerCount} (${report.currentActionAcceptanceBlockerSummary})`,
    `- Current action acceptance aligned: ${report.currentActionAcceptanceMatchesCurrentAction ? "yes" : "no"}`,
    `- Current action acceptance remediation ready: ${report.currentActionAcceptanceRemediationReady ? "yes" : "no"}`,
    `- Current action acceptance remediation rows: ${report.currentActionAcceptanceRemediationRowCount} (${report.currentActionAcceptanceRemediationSummary})`,
    `- Release-channel key remediation ready: ${report.currentReleaseChannelKeyRemediationReady ? "yes" : "no"}`,
    `- Release-channel key remediation rows: ${report.currentReleaseChannelKeyRemediationRowCount} (${report.currentReleaseChannelKeyRemediationSummary})`,
    `- Current command acceptance ladder ready: ${report.currentCommandAcceptanceLadderReady ? "yes" : "no"}`,
    `- Current command acceptance ladder rows: ${report.currentCommandAcceptanceLadderRowCount} (${report.currentCommandAcceptanceLadderSummary})`,
    `- Current command source artifact matrix ready: ${report.currentCommandSourceArtifactMatrixReady ? "yes" : "no"}`,
    `- Current command source artifact matrix rows: ${report.currentCommandSourceArtifactMatrixRowCount} (${report.currentCommandSourceArtifactMatrixSummary})`,
    `- Current action post-edit verification ready: ${report.currentActionPostEditVerificationReady ? "yes" : "no"}`,
    `- Current action post-edit verification rows: ${report.currentActionPostEditVerificationRowCount} (${report.currentActionPostEditVerificationSummary})`,
    `- Current action post-edit signals currently ready: ${report.currentActionPostEditVerificationCurrentSummary}`,
    `- Current action handoff ready: ${report.currentActionHandoffReady ? "yes" : "no"}`,
    `- Current action handoff rows: ${report.currentActionHandoffRowCount} (${report.currentActionHandoffSummary})`,
    `- Private edit safety ready: ${report.currentPrivateEditSafetyReady ? "yes" : "no"}`,
    `- Private edit safety rows: ${report.currentPrivateEditSafetyRowCount} (${report.currentPrivateEditSafetySummary})`,
    `- Current input shape checklist ready: ${report.currentInputShapeChecklistReady ? "yes" : "no"}`,
    `- Current input shape checklist rows: ${report.currentInputShapeChecklistRowCount} (${report.currentInputShapeChecklistSummary})`,
    `- Local env diagnostics ready: ${report.currentLocalEnvDiagnosticsReady ? "yes" : "no"}`,
    `- Local env diagnostic rows: ${report.currentLocalEnvDiagnosticRowCount} (${report.currentLocalEnvDiagnosticSummary})`,
    `- Overall completion: ${Number(report.userFacingCompletionPercent).toFixed(6)}%`,
    `- Remaining completion: ${Number(report.userFacingRemainingPercent).toFixed(6)}%`,
    `- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`,
    `- Current 10-plan rows: ${report.currentTenPlanWindowRowCount} (${report.currentTenPlanWindowRowSummary})`,
    `- 10-plan report due: ${report.tenPlanProgressReportDue ? "yes" : "no"}`,
    `- 10-plan report cadence: ${report.tenPlanProgressReportCadence}`,
    `- Next 10-plan report at: plan-${String(report.nextTenPlanProgressReportAt).padStart(3, "0")}`,
    `- Audience readiness ready: ${report.audienceReadinessReady ? "yes" : "no"}`,
    `- Audience readiness rows: ${report.audienceReadinessRowCount} (${report.audienceReadinessRowSummary})`,
    `- Audience acceptance ready: ${report.audienceAcceptanceReady ? "yes" : "no"}`,
    `- Audience acceptance rows: ${report.audienceAcceptanceRowCount} (${report.audienceAcceptanceRowSummary})`,
    `- Persona delivery packages ready: ${report.audienceDeliveryPackagesReady ? "yes" : "no"}`,
    `- Persona delivery package rows: ${report.audienceDeliveryPackageRowCount} (${report.audienceDeliveryPackageRowSummary})`,
    `- Persona delivery packages reopen ready: ${report.audienceDeliveryPackagesReopenReady ? "yes" : "no"}`,
    `- Persona delivery package reopen rows: ${report.audienceDeliveryPackageReopenRowCount} (${report.audienceDeliveryPackageReopenRowSummary})`,
    `- First-time composer readiness: ${report.beginnerAudienceReadinessReady ? "yes" : "no"}`,
    `- Professional producer readiness: ${report.professionalProducerAudienceReadinessReady ? "yes" : "no"}`,
    `- Release-channel unblock ready: ${report.releaseChannelUnblockSmokeReady ? "yes" : "no"}`,
    `- Release-channel placeholder blocker cleared in rehearsal: ${report.releaseChannelUnblockPlaceholderBlockerCleared ? "yes" : "no"}`,
    `- Release-channel unblock rows: ${report.releaseChannelUnblockMetadataRowCount} (${report.releaseChannelUnblockMetadataRowSummary})`,
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
    "| audience | role | ready | mode | bars | delivery | style | package ready | package reopen ready | artifacts | verified artifacts | value recorded |",
    "|---|---|---:|---|---:|---|---|---:|---:|---:|---:|---:|",
    formatAudienceRows(report.audienceReadinessRows),
    "",
    "## Audience Acceptance Matrix",
    "",
    "| audience | area | criterion | ready | evidence source | evidence summary | workflow | artifacts | verified artifacts | value recorded |",
    "|---|---|---|---:|---|---|---|---:|---:|---:|",
    formatAudienceAcceptanceRows(report.audienceAcceptanceRows),
    "",
    "## Persona Delivery Packages",
    "",
    "| persona | workflow | ready | mode | bars | delivery | artifacts | package | value recorded |",
    "|---|---|---:|---|---:|---|---:|---|---:|",
    formatDeliveryPackageRows(report.audienceDeliveryPackageRows),
    "",
    "## Persona Delivery Package Reopen",
    "",
    "| persona | workflow | ready | artifacts | verified artifacts | project | hashes | WAV | MIDI | Handoff | package | value recorded |",
    "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|",
    formatDeliveryPackageReopenRows(report.audienceDeliveryPackageReopenRows),
    "",
    "## Release-Channel Unblock Rehearsal",
    "",
    `- Source ready: ${report.sourceReleaseChannelUnblockReady ? "yes" : "no"}`,
    `- Source path: ${report.sourceReleaseChannelUnblockPath}`,
    `- Smoke ready: ${report.releaseChannelUnblockSmokeReady ? "yes" : "no"}`,
    `- Synthetic fixture path: ${report.releaseChannelUnblockSyntheticFixturePath}`,
    `- Loader enabled: ${report.releaseChannelUnblockLoaderEnabled ? "yes" : "no"}`,
    `- Loaded keys: ${report.releaseChannelUnblockLoadedKeyCount} (${formatKeyList(report.releaseChannelUnblockLoadedKeys)})`,
    `- Placeholder keys in rehearsal: ${report.releaseChannelUnblockPlaceholderKeyCount} (${formatKeyList(report.releaseChannelUnblockPlaceholderKeys)})`,
    `- Metadata ready: ${report.releaseChannelUnblockMetadataReady ? "yes" : "no"}`,
    `- Placeholder blocker cleared in rehearsal: ${report.releaseChannelUnblockPlaceholderBlockerCleared ? "yes" : "no"}`,
    `- Next proof command after real edits: \`${report.releaseChannelUnblockNextProofCommandAfterRealEdits}\``,
    `- Current blocker refresh command: \`${report.releaseChannelUnblockCurrentBlockerRefreshCommand}\``,
    `- Value recorded: ${report.releaseChannelUnblockValueRecorded ? "yes" : "no"}`,
    "",
    "| key | present | ready | evidence | value recorded |",
    "|---|---:|---:|---|---:|",
    formatReleaseChannelUnblockRows(report.releaseChannelUnblockMetadataRows),
    "",
    "## Hard Gate Requirement Ladder",
    "",
    "| requirement | ready | evidence | blocker count | blocker summary | value recorded |",
    "|---|---:|---|---:|---|---:|",
    formatHardGateRequirementRows(report.hardGateRequirementRows),
    "",
    "## Blocked Hard Gate Requirements",
    "",
    "| requirement | ready | evidence | blocker count | blocker summary | value recorded |",
    "|---|---:|---|---:|---|---:|",
    formatHardGateRequirementRows(report.hardGateBlockedRequirementRows),
    "",
    "## Priority Action Ladder",
    "",
    `- Source ready: ${report.sourceExternalNextActionsReady ? "yes" : "no"}`,
    `- Source path: ${report.sourceExternalNextActionsPath}`,
    `- Current priority action: ${report.currentPriorityActionId} (${report.currentPriorityActionLabel})`,
    `- Current priority action next command: \`${report.currentPriorityActionNextCommand}\``,
    `- Current priority action first blocker: ${report.currentPriorityActionFirstBlocker}`,
    `- Current priority action aligned: ${report.priorityActionCurrentMatchesCurrentBlocker ? "yes" : "no"}`,
    "",
    "| order | id | ready | label | next command | rerun commands | placeholder keys | evidence rows | ready criteria | checklist steps | value recorded |",
    "|---:|---|---:|---|---|---|---:|---:|---:|---:|---:|",
    formatPriorityActionRows(report.priorityActionRows),
    "",
    "## Current Action Transition Preview",
    "",
    `- Transition ready: ${report.currentActionTransitionReady ? "yes" : "no"}`,
    `- Transition rows: ${report.currentActionTransitionRowCount} (${report.currentActionTransitionSummary})`,
    `- Next priority action: ${report.nextPriorityActionId} (${report.nextPriorityActionLabel})`,
    `- Next priority command: \`${report.nextPriorityActionNextCommand}\``,
    "",
    "| order | stage | action id | ready | label | blocker | proof command | rerun commands | source field | value recorded |",
    "|---:|---|---|---:|---|---|---|---|---|---:|",
    formatCurrentActionTransitionRows(report.currentActionTransitionRows),
    "",
    "## Next Action Preview",
    "",
    `- Preview ready: ${report.nextActionPreviewReady ? "yes" : "no"}`,
    `- Next action: ${report.nextActionPreviewId} (${report.nextActionPreviewLabel})`,
    `- Proof command: \`${report.nextActionPreviewProofCommand}\``,
    `- Rerun commands: ${report.nextActionPreviewRerunCommandSummary}`,
    `- First blocker: ${report.nextActionPreviewFirstBlocker}`,
    `- Required keys: ${report.nextActionPreviewRequiredKeyCount} (${formatKeyList(report.nextActionPreviewRequiredKeys)})`,
    `- Placeholder keys: ${report.nextActionPreviewPlaceholderKeyCount} (${formatKeyList(report.nextActionPreviewPlaceholderKeys)})`,
    `- Ready criteria rows: ${report.nextActionPreviewReadyCriteriaRowCount} (${report.nextActionPreviewReadyCriteriaSummary})`,
    `- Checklist rows: ${report.nextActionPreviewChecklistRowCount} (${report.nextActionPreviewChecklistSummary})`,
    `- Evidence rows: ${report.nextActionPreviewEvidenceRowCount} (${report.nextActionPreviewEvidenceSummary})`,
    `- Blocker rows: ${report.nextActionPreviewBlockerRowCount} (${report.nextActionPreviewBlockerSummary})`,
    `- Verification rows: ${report.nextActionPreviewVerificationRowCount} (${report.nextActionPreviewVerificationSummary})`,
    `- Prerequisite command rows: ${report.nextActionPreviewPrerequisiteCommandRowCount} (${report.nextActionPreviewPrerequisiteCommandSummary})`,
    `- Operator action rows: ${report.nextActionPreviewOperatorActionRowCount} (${report.nextActionPreviewOperatorActionSummary})`,
    `- Env edit rows: ${report.nextActionPreviewEnvEditRowCount} (${report.nextActionPreviewEnvEditSummary})`,
    "",
    "| order | criterion | source field | proof command | blocker | value recorded |",
    "|---:|---|---|---|---|---:|",
    formatNextActionReadyCriteriaRows(report.nextActionPreviewReadyCriteriaRows),
    "",
    "| order | step | proof command | value recorded |",
    "|---:|---|---|---:|",
    formatNextActionChecklistRows(report.nextActionPreviewChecklistRows),
    "",
    "| label | path | present | value recorded |",
    "|---|---|---:|---:|",
    formatNextActionEvidenceRows(report.nextActionPreviewEvidenceRows),
    "",
    "| order | blocker | source field | proof command | value recorded |",
    "|---:|---|---|---|---:|",
    formatNextActionBlockerRows(report.nextActionPreviewBlockerRows),
    "",
    "| order | currently ready | criterion | current evidence | expected signal | proof command | value recorded |",
    "|---:|---:|---|---|---|---|---:|",
    formatNextActionVerificationRows(report.nextActionPreviewVerificationRows),
    "",
    "| order | command | source field | proof command | value recorded |",
    "|---:|---|---|---|---:|",
    formatNextActionPrerequisiteCommandRows(report.nextActionPreviewPrerequisiteCommandRows),
    "",
    "| order | action | source field | proof command | value recorded |",
    "|---:|---|---|---|---:|",
    formatNextActionOperatorActionRows(report.nextActionPreviewOperatorActionRows),
    "",
    "| order | location | key | assignment shape | guidance | proof command | value recorded |",
    "|---:|---|---|---|---|---|---:|",
    formatNextActionEnvEditRows(report.nextActionPreviewEnvEditRows),
    "",
    "## External Completion Checklist",
    "",
    `- Checklist rows: ${report.externalCompletionChecklistCount} (${report.externalCompletionChecklistSummary})`,
    `- Current checklist row: ${report.currentExternalCompletionChecklistRowId} (${report.currentExternalCompletionChecklistRowLabel})`,
    `- Current checklist proof command: \`${report.currentExternalCompletionChecklistProofCommand}\``,
    `- Current checklist aligned: ${report.externalCompletionChecklistCurrentMatchesPriorityAction ? "yes" : "no"}`,
    "",
    "| order | id | label | first blocker | proof command | rerun commands | evidence | ready criteria | checklist steps | hard gate | value recorded |",
    "|---:|---|---|---|---|---|---|---:|---:|---|---:|",
    formatExternalCompletionChecklistRows(report.externalCompletionChecklistRows),
    "",
    "## Current Action Acceptance",
    "",
    `- Acceptance ready: ${report.currentActionAcceptanceReady ? "yes" : "no"}`,
    `- Acceptance rows: ${report.currentActionAcceptanceRowCount} (${report.currentActionAcceptanceSummary})`,
    `- Ready rows: ${report.currentActionAcceptanceReadyCount}/${report.currentActionAcceptanceRowCount}`,
    `- Current action aligned: ${report.currentActionAcceptanceMatchesCurrentAction ? "yes" : "no"}`,
    "",
    "| order | ready | criterion | evidence | proof command | rerun command | value recorded |",
    "|---:|---:|---|---|---|---|---:|",
    formatCurrentActionAcceptanceRows(report.currentActionAcceptanceRows),
    "",
    "## Current Action Acceptance Blockers",
    "",
    `- Blocker rows: ${report.currentActionAcceptanceBlockerCount} (${report.currentActionAcceptanceBlockerSummary})`,
    `- Blockers match acceptance: ${report.currentActionAcceptanceBlockersMatchAcceptance ? "yes" : "no"}`,
    "",
    "| order | criterion | blocker | source field | operator action | rerun command | value recorded |",
    "|---:|---|---|---|---|---|---:|",
    formatCurrentActionAcceptanceBlockerRows(report.currentActionAcceptanceBlockerRows),
    "",
    "## Current Action Acceptance Remediation",
    "",
    `- Remediation ready: ${report.currentActionAcceptanceRemediationReady ? "yes" : "no"}`,
    `- Remediation rows: ${report.currentActionAcceptanceRemediationRowCount} (${report.currentActionAcceptanceRemediationSummary})`,
    "",
    "| order | criterion | operator fix | evidence to check | expected ready signal | proof command | rerun command | value recorded |",
    "|---:|---|---|---|---|---|---|---:|",
    formatCurrentActionAcceptanceRemediationRows(report.currentActionAcceptanceRemediationRows),
    "",
    "## Current Release-Channel Key Remediation Matrix",
    "",
    `- Key remediation ready: ${report.currentReleaseChannelKeyRemediationReady ? "yes" : "no"}`,
    `- Key remediation rows: ${report.currentReleaseChannelKeyRemediationRowCount} (${report.currentReleaseChannelKeyRemediationSummary})`,
    "",
    "| order | key | placeholder | location | expected shape | acceptance criteria impacted | proof command | rerun command | value recorded |",
    "|---:|---|---:|---|---|---|---|---|---:|",
    formatCurrentReleaseChannelKeyRemediationRows(report.currentReleaseChannelKeyRemediationRows),
    "",
    "## Current Command Acceptance Ladder",
    "",
    `- Command acceptance ladder ready: ${report.currentCommandAcceptanceLadderReady ? "yes" : "no"}`,
    `- Command acceptance ladder rows: ${report.currentCommandAcceptanceLadderRowCount} (${report.currentCommandAcceptanceLadderSummary})`,
    "",
    "| order | command | role | acceptance signal | source artifacts | evidence labels | proof command | rerun command | hard gate | value recorded |",
    "|---:|---|---|---|---|---|---|---|---|---:|",
    formatCurrentCommandAcceptanceLadderRows(report.currentCommandAcceptanceLadderRows),
    "",
    "## Current Command Source Artifact Matrix",
    "",
    `- Source artifact matrix ready: ${report.currentCommandSourceArtifactMatrixReady ? "yes" : "no"}`,
    `- Source artifact matrix rows: ${report.currentCommandSourceArtifactMatrixRowCount} (${report.currentCommandSourceArtifactMatrixSummary})`,
    "",
    "| order | artifact path | present | commands | consuming commands | evidence labels | acceptance signals | proof command | rerun command | value recorded |",
    "|---:|---|---:|---:|---|---|---|---|---|---:|",
    formatCurrentCommandSourceArtifactRows(report.currentCommandSourceArtifactMatrixRows),
    "",
    "## Current Action Post-Edit Verification",
    "",
    `- Verification ready: ${report.currentActionPostEditVerificationReady ? "yes" : "no"}`,
    `- Verification rows: ${report.currentActionPostEditVerificationRowCount} (${report.currentActionPostEditVerificationSummary})`,
    `- Signals currently ready: ${report.currentActionPostEditVerificationCurrentSummary}`,
    `- Matches acceptance: ${report.currentActionPostEditVerificationMatchesAcceptance ? "yes" : "no"}`,
    "",
    "| order | currently ready | criterion | current evidence | expected post-edit signal | source field | proof command | rerun command | value recorded |",
    "|---:|---:|---|---|---|---|---|---|---:|",
    formatCurrentActionPostEditVerificationRows(report.currentActionPostEditVerificationRows),
    "",
    "## Current Action Handoff Package",
    "",
    `- Handoff ready: ${report.currentActionHandoffReady ? "yes" : "no"}`,
    `- Handoff rows: ${report.currentActionHandoffRowCount} (${report.currentActionHandoffSummary})`,
    `- Source artifacts: ${report.currentActionHandoffSourceArtifactCount} (${report.currentActionHandoffSourceArtifactSummary})`,
    "",
    "| order | item | source field | evidence | blocker count | acceptance blockers | proof command | rerun command | hard gate | value recorded |",
    "|---:|---|---|---|---:|---:|---|---|---|---:|",
    formatCurrentActionHandoffRows(report.currentActionHandoffRows),
    "",
    "## Private Edit Safety Checklist",
    "",
    `- Safety ready: ${report.currentPrivateEditSafetyReady ? "yes" : "no"}`,
    `- Safety rows: ${report.currentPrivateEditSafetyRowCount} (${report.currentPrivateEditSafetySummary})`,
    "",
    "| order | ready | check | evidence | command | value recorded |",
    "|---:|---:|---|---|---|---:|",
    formatPrivateEditSafetyRows(report.currentPrivateEditSafetyRows),
    "",
    "## Current Input Shape Checklist",
    "",
    `- Shape checklist ready: ${report.currentInputShapeChecklistReady ? "yes" : "no"}`,
    `- Shape checklist rows: ${report.currentInputShapeChecklistRowCount} (${report.currentInputShapeChecklistSummary})`,
    "",
    "| order | key | ready | expected shape | evidence source | rerun command | value recorded |",
    "|---:|---|---:|---|---|---|---:|",
    formatCurrentInputShapeRows(report.currentInputShapeChecklistRows),
    "",
    "## Local Env Loader Diagnostics",
    "",
    `- Diagnostics ready: ${report.currentLocalEnvDiagnosticsReady ? "yes" : "no"}`,
    `- Diagnostic rows: ${report.currentLocalEnvDiagnosticRowCount} (${report.currentLocalEnvDiagnosticSummary})`,
    "",
    "| order | diagnostic | status | evidence | source field | value recorded |",
    "|---:|---|---|---|---|---:|",
    formatLocalEnvDiagnosticRows(report.currentLocalEnvDiagnosticRows),
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
const externalNextActions = await readRequiredJson(externalNextActionsJsonPath, "External next actions");
const externalProofBundle = await readRequiredJson(externalProofBundleJsonPath, "External proof bundle");
const externalGate = await readRequiredJson(externalGateJsonPath, "External distribution gate");
const releaseProgress = await readRequiredJson(releaseProgressJsonPath, "Release progress report");
const report = buildReport({ releaseDoctor, externalNextActions, externalProofBundle, externalGate, releaseProgress });
validateReport(report, { releaseDoctor, externalNextActions, externalProofBundle, externalGate, releaseProgress });

await mkdir(packageRoot, { recursive: true });
const markdown = buildMarkdown(report);
check(!/https?:\/\//i.test(markdown), "release current blocker Markdown should not include URL values");
check(!/GROOVEFORGE_RELEASE_DOWNLOAD_URL=https?:\/\//i.test(markdown), "release current blocker Markdown should not include release URL assignments with values");
check(!/GROOVEFORGE_RELEASE_NOTES_URL=https?:\/\//i.test(markdown), "release current blocker Markdown should not include release notes URL assignments with values");
check(!/GROOVEFORGE_SUPPORT_URL=https?:\/\//i.test(markdown), "release current blocker Markdown should not include support URL assignments with values");
check(markdown.includes("Audience Acceptance Matrix"), "release current blocker Markdown should include audience acceptance matrix");
check(markdown.includes("10-plan report due:"), "release current blocker Markdown should include 10-plan report due posture");
check(markdown.includes("10-plan report cadence:"), "release current blocker Markdown should include 10-plan report cadence");
check(markdown.includes("Next 10-plan report at:"), "release current blocker Markdown should include next 10-plan report number");
check(markdown.includes("Release-Channel Unblock Rehearsal"), "release current blocker Markdown should include release-channel unblock rehearsal");
check(markdown.includes("Release-channel placeholder blocker cleared in rehearsal:"), "release current blocker Markdown should include release-channel unblock cleared status");
check(markdown.includes("Hard Gate Requirement Ladder"), "release current blocker Markdown should include hard-gate requirement ladder");
check(markdown.includes("Blocked Hard Gate Requirements"), "release current blocker Markdown should include blocked hard-gate requirements");
check(markdown.includes("Priority Action Ladder"), "release current blocker Markdown should include priority action ladder");
check(markdown.includes("Current priority action aligned:"), "release current blocker Markdown should include priority action alignment");
check(markdown.includes("Current Action Transition Preview"), "release current blocker Markdown should include current action transition preview");
check(markdown.includes("Current action transition ready:"), "release current blocker Markdown should include current action transition readiness");
check(markdown.includes("Next Action Preview"), "release current blocker Markdown should include next action preview");
check(markdown.includes("Next action preview ready:"), "release current blocker Markdown should include next action preview readiness");
check(markdown.includes("Next action preview ready criteria rows:"), "release current blocker Markdown should include next action preview ready criteria count");
check(markdown.includes("Next action preview checklist rows:"), "release current blocker Markdown should include next action preview checklist count");
check(markdown.includes("Next action preview blocker rows:"), "release current blocker Markdown should include next action preview blocker count");
check(markdown.includes("Next action preview verification rows:"), "release current blocker Markdown should include next action preview verification count");
check(markdown.includes("Next action preview prerequisite command rows:"), "release current blocker Markdown should include next action preview prerequisite command count");
check(markdown.includes("Next action preview operator action rows:"), "release current blocker Markdown should include next action preview operator action count");
check(markdown.includes("Next action preview env edit rows:"), "release current blocker Markdown should include next action preview env edit count");
check(markdown.includes("External Completion Checklist"), "release current blocker Markdown should include external completion checklist");
check(markdown.includes("External completion checklist current row aligned:"), "release current blocker Markdown should include external completion checklist alignment");
check(markdown.includes("Current Action Acceptance"), "release current blocker Markdown should include current action acceptance");
check(markdown.includes("Current action acceptance aligned:"), "release current blocker Markdown should include current action acceptance alignment");
check(markdown.includes("Current Action Acceptance Blockers"), "release current blocker Markdown should include current action acceptance blockers");
check(markdown.includes("Blockers match acceptance:"), "release current blocker Markdown should include current action acceptance blocker alignment");
check(markdown.includes("Current Action Acceptance Remediation"), "release current blocker Markdown should include current action acceptance remediation");
check(markdown.includes("Current action acceptance remediation ready:"), "release current blocker Markdown should include current action acceptance remediation readiness");
check(markdown.includes("Current Release-Channel Key Remediation Matrix"), "release current blocker Markdown should include release-channel key remediation matrix");
check(markdown.includes("Release-channel key remediation ready:"), "release current blocker Markdown should include release-channel key remediation readiness");
check(markdown.includes("Current Command Acceptance Ladder"), "release current blocker Markdown should include current command acceptance ladder");
check(markdown.includes("Current command acceptance ladder ready:"), "release current blocker Markdown should include current command acceptance ladder readiness");
check(markdown.includes("Current Command Source Artifact Matrix"), "release current blocker Markdown should include current command source artifact matrix");
check(markdown.includes("Current command source artifact matrix ready:"), "release current blocker Markdown should include current command source artifact matrix readiness");
check(markdown.includes("Current Action Post-Edit Verification"), "release current blocker Markdown should include current action post-edit verification");
check(markdown.includes("Current action post-edit verification ready:"), "release current blocker Markdown should include current action post-edit verification readiness");
check(markdown.includes("Current Action Handoff Package"), "release current blocker Markdown should include current action handoff package");
check(markdown.includes("Current action handoff ready:"), "release current blocker Markdown should include current action handoff readiness");
check(markdown.includes("Private Edit Safety Checklist"), "release current blocker Markdown should include private edit safety checklist");
check(markdown.includes("Private edit safety ready:"), "release current blocker Markdown should include private edit safety readiness");
check(markdown.includes("Current Input Shape Checklist"), "release current blocker Markdown should include input shape checklist");
check(markdown.includes("Current input shape checklist ready:"), "release current blocker Markdown should include input shape checklist readiness");
check(markdown.includes("Local Env Loader Diagnostics"), "release current blocker Markdown should include local env loader diagnostics");
check(markdown.includes("Local env diagnostics ready:"), "release current blocker Markdown should include local env diagnostics readiness");

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
console.log(`- Hard gate ready: ${report.hardGateReady ? "yes" : "no"}`);
console.log(`- Hard gate requirements: ${report.hardGateRequirementCount} (${report.hardGateRequirementSummary})`);
console.log(`- Hard gate blocked requirements: ${report.hardGateRequirementBlockedCount} (${report.hardGateBlockedRequirementSummary})`);
console.log(`- Priority actions pending: ${report.priorityActionCount} (${report.priorityActionSummary})`);
console.log(`- Current priority action: ${report.currentPriorityActionId} (${report.currentPriorityActionLabel})`);
console.log(`- Next priority action after current clears: ${report.nextPriorityActionId} (${report.nextPriorityActionLabel})`);
console.log(`- Current action transition rows: ${report.currentActionTransitionRowCount} (${report.currentActionTransitionSummary})`);
console.log(`- Next action preview ready: ${report.nextActionPreviewReady ? "yes" : "no"}`);
console.log(`- Next action preview ready criteria rows: ${report.nextActionPreviewReadyCriteriaRowCount} (${report.nextActionPreviewReadyCriteriaSummary})`);
console.log(`- Next action preview checklist rows: ${report.nextActionPreviewChecklistRowCount} (${report.nextActionPreviewChecklistSummary})`);
console.log(`- Next action preview blocker rows: ${report.nextActionPreviewBlockerRowCount} (${report.nextActionPreviewBlockerSummary})`);
console.log(`- Next action preview verification rows: ${report.nextActionPreviewVerificationRowCount} (${report.nextActionPreviewVerificationSummary})`);
console.log(`- Next action preview prerequisite command rows: ${report.nextActionPreviewPrerequisiteCommandRowCount} (${report.nextActionPreviewPrerequisiteCommandSummary})`);
console.log(`- Next action preview operator action rows: ${report.nextActionPreviewOperatorActionRowCount} (${report.nextActionPreviewOperatorActionSummary})`);
console.log(`- Next action preview env edit rows: ${report.nextActionPreviewEnvEditRowCount} (${report.nextActionPreviewEnvEditSummary})`);
console.log(`- External completion checklist rows: ${report.externalCompletionChecklistCount} (${report.externalCompletionChecklistSummary})`);
console.log(`- Current external completion checklist row: ${report.currentExternalCompletionChecklistRowId} (${report.currentExternalCompletionChecklistRowLabel})`);
console.log(`- Current action acceptance ready: ${report.currentActionAcceptanceReady ? "yes" : "no"}`);
console.log(`- Current action acceptance rows: ${report.currentActionAcceptanceRowCount} (${report.currentActionAcceptanceSummary})`);
console.log(`- Current action acceptance blockers: ${report.currentActionAcceptanceBlockerCount} (${report.currentActionAcceptanceBlockerSummary})`);
console.log(`- Current action acceptance remediation ready: ${report.currentActionAcceptanceRemediationReady ? "yes" : "no"}`);
console.log(`- Current action acceptance remediation rows: ${report.currentActionAcceptanceRemediationRowCount} (${report.currentActionAcceptanceRemediationSummary})`);
console.log(`- Release-channel key remediation ready: ${report.currentReleaseChannelKeyRemediationReady ? "yes" : "no"}`);
console.log(`- Release-channel key remediation rows: ${report.currentReleaseChannelKeyRemediationRowCount} (${report.currentReleaseChannelKeyRemediationSummary})`);
console.log(`- Current command acceptance ladder ready: ${report.currentCommandAcceptanceLadderReady ? "yes" : "no"}`);
console.log(`- Current command acceptance ladder rows: ${report.currentCommandAcceptanceLadderRowCount} (${report.currentCommandAcceptanceLadderSummary})`);
console.log(`- Current command source artifact matrix ready: ${report.currentCommandSourceArtifactMatrixReady ? "yes" : "no"}`);
console.log(`- Current command source artifact matrix rows: ${report.currentCommandSourceArtifactMatrixRowCount} (${report.currentCommandSourceArtifactMatrixSummary})`);
console.log(`- Current action post-edit verification ready: ${report.currentActionPostEditVerificationReady ? "yes" : "no"}`);
console.log(`- Current action post-edit verification rows: ${report.currentActionPostEditVerificationRowCount} (${report.currentActionPostEditVerificationSummary})`);
console.log(`- Current action handoff ready: ${report.currentActionHandoffReady ? "yes" : "no"}`);
console.log(`- Current action handoff rows: ${report.currentActionHandoffRowCount} (${report.currentActionHandoffSummary})`);
console.log(`- Private edit safety ready: ${report.currentPrivateEditSafetyReady ? "yes" : "no"}`);
console.log(`- Private edit safety rows: ${report.currentPrivateEditSafetyRowCount} (${report.currentPrivateEditSafetySummary})`);
console.log(`- Current input shape checklist ready: ${report.currentInputShapeChecklistReady ? "yes" : "no"}`);
console.log(`- Current input shape checklist rows: ${report.currentInputShapeChecklistRowCount} (${report.currentInputShapeChecklistSummary})`);
console.log(`- Local env diagnostics ready: ${report.currentLocalEnvDiagnosticsReady ? "yes" : "no"}`);
console.log(`- Local env diagnostic rows: ${report.currentLocalEnvDiagnosticRowCount} (${report.currentLocalEnvDiagnosticSummary})`);
console.log(`- Overall completion: ${Number(report.userFacingCompletionPercent).toFixed(6)}%`);
console.log(`- Current 10-plan progress: ${report.currentTenPlanProgressLabel}`);
console.log(`- Current 10-plan rows: ${report.currentTenPlanWindowRowCount} (${report.currentTenPlanWindowRowSummary})`);
console.log(`- 10-plan report due: ${report.tenPlanProgressReportDue ? "yes" : "no"}`);
console.log(`- 10-plan report cadence: ${report.tenPlanProgressReportCadence}`);
console.log(`- Next 10-plan report at: plan-${String(report.nextTenPlanProgressReportAt).padStart(3, "0")}`);
console.log(`- Audience readiness ready: ${report.audienceReadinessReady ? "yes" : "no"}`);
console.log(`- Audience readiness rows: ${report.audienceReadinessRowCount} (${report.audienceReadinessRowSummary})`);
console.log(`- Audience acceptance ready: ${report.audienceAcceptanceReady ? "yes" : "no"}`);
console.log(`- Audience acceptance rows: ${report.audienceAcceptanceRowCount} (${report.audienceAcceptanceRowSummary})`);
console.log(`- Persona delivery packages ready: ${report.audienceDeliveryPackagesReady ? "yes" : "no"}`);
console.log(`- Persona delivery package rows: ${report.audienceDeliveryPackageRowCount} (${report.audienceDeliveryPackageRowSummary})`);
console.log(`- Persona delivery packages reopen ready: ${report.audienceDeliveryPackagesReopenReady ? "yes" : "no"}`);
console.log(`- Persona delivery package reopen rows: ${report.audienceDeliveryPackageReopenRowCount} (${report.audienceDeliveryPackageReopenRowSummary})`);
console.log(`- First-time composer readiness: ${report.beginnerAudienceReadinessReady ? "yes" : "no"}`);
console.log(`- Professional producer readiness: ${report.professionalProducerAudienceReadinessReady ? "yes" : "no"}`);
console.log(`- Release-channel unblock ready: ${report.releaseChannelUnblockSmokeReady ? "yes" : "no"}`);
console.log(`- Release-channel placeholder blocker cleared in rehearsal: ${report.releaseChannelUnblockPlaceholderBlockerCleared ? "yes" : "no"}`);
console.log(`- Release-channel unblock rows: ${report.releaseChannelUnblockMetadataRowCount} (${report.releaseChannelUnblockMetadataRowSummary})`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted by this report");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
