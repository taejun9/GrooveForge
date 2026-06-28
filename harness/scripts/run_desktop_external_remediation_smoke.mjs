#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionPrivateInputKeys, loadDistributionLocalEnv } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const summaryRoot = path.join(root, "build", "desktop");
const completionAuditPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-completion-audit.json`);
const distributionEnvTemplatePath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-env-template.json`);
const privateInputsPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-private-inputs.json`);
const distributionChannelQaPath = path.join(summaryRoot, `${appName}-${platformArch}-distribution-channel-qa.json`);
const manualQaChecklistPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-distribution-manual-qa.json`);
const autoUpdateReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-auto-update-readiness.json`);
const developerIdReadinessPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-readiness.json`);
const developerIdSigningPath = path.join(summaryRoot, `${appName}-${platformArch}-developer-id-signing.json`);
const notarizationPath = path.join(summaryRoot, `${appName}-${platformArch}-notarization.json`);
const notarizedGatekeeperPath = path.join(summaryRoot, `${appName}-${platformArch}-notarized-gatekeeper.json`);
const externalGatePath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-distribution-gate.json`);
const remediationMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-remediation.md`);
const remediationJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-external-remediation.json`);
const distributionMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const manualQaKeys = ["GROOVEFORGE_DISTRIBUTION_QA_APPROVED", "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256"];
const updateFeedUrlKeys = ["GROOVEFORGE_UPDATE_FEED_URL", "ELECTRON_UPDATE_FEED_URL", "UPDATE_FEED_URL"];
const updateChannelKeys = ["GROOVEFORGE_UPDATE_CHANNEL", "ELECTRON_UPDATE_CHANNEL", "UPDATE_CHANNEL"];
const signingKeys = ["GROOVEFORGE_DEVELOPER_ID_IDENTITY"];
const notarizationKeys = [
  "GROOVEFORGE_NOTARY_SUBMIT",
  "APPLE_ID",
  "APPLE_TEAM_ID",
  "APPLE_APP_SPECIFIC_PASSWORD",
  "ASC_KEY_ID",
  "ASC_ISSUER_ID",
  "ASC_KEY_PATH",
  "APPLE_NOTARY_PROFILE",
  "NOTARYTOOL_KEYCHAIN_PROFILE"
];
const sensitivePrivateKeys = [
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_UPDATE_FEED_URL",
  "ELECTRON_UPDATE_FEED_URL",
  "UPDATE_FEED_URL",
  "GROOVEFORGE_DEVELOPER_ID_IDENTITY",
  "APPLE_ID",
  "APPLE_TEAM_ID",
  "APPLE_APP_SPECIFIC_PASSWORD",
  "ASC_KEY_ID",
  "ASC_ISSUER_ID",
  "ASC_KEY_PATH",
  "APPLE_NOTARY_PROFILE",
  "NOTARYTOOL_KEYCHAIN_PROFILE"
];
const distributionLocalEnv = await loadDistributionLocalEnv({ root, allowedKeys: distributionPrivateInputKeys });
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge external remediation smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function unique(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim().length > 0))];
}

function inputGroupReady(privateInputs, label) {
  return privateInputs?.inputGroups?.find((group) => group.label === label)?.ready === true;
}

function evidencePath(filePath) {
  return {
    path: relative(filePath),
    present: existsSync(filePath)
  };
}

function blockerWhen(condition, message) {
  return condition ? [] : [message];
}

function matchesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function actionGroup(options) {
  return {
    id: options.id,
    label: options.label,
    ready: Boolean(options.ready),
    requiredKeys: options.requiredKeys ?? [],
    evidence: options.evidence ?? [],
    prerequisiteCommands: options.prerequisiteCommands ?? [],
    operatorActions: options.operatorActions ?? [],
    rerunCommands: options.rerunCommands ?? [],
    blockers: unique(options.ready ? [] : options.blockers ?? []),
    valueRecorded: false
  };
}

function formatRequirementRows(groups) {
  return groups
    .map(
      (group) =>
        `| ${group.label} | ${group.ready ? "yes" : "no"} | ${group.requiredKeys.length > 0 ? group.requiredKeys.join(", ") : "none"} | ${group.evidence
          .map((item) => item.path)
          .join(", ")} |`
    )
    .join("\n");
}

function formatActionGroups(groups) {
  return groups
    .map((group, index) => {
      const operatorActions = group.operatorActions.map((action) => `   - ${action}`).join("\n");
      const prerequisiteCommands = group.prerequisiteCommands.map((command) => `   - \`${command}\``).join("\n");
      const rerunCommands = group.rerunCommands.map((command) => `   - \`${command}\``).join("\n");
      const blockers = group.blockers.map((blocker) => `   - ${blocker}`).join("\n");
      return `${index + 1}. ${group.label} (${group.ready ? "ready" : "blocked"})
   Required keys: ${group.requiredKeys.length > 0 ? group.requiredKeys.join(", ") : "none"}
   Evidence: ${group.evidence.map((item) => `${item.path} ${item.present ? "(present)" : "(missing)"}`).join(", ")}
   Prerequisite commands:
${prerequisiteCommands || "   - none"}
   Operator actions:
${operatorActions || "   - none"}
   Rerun commands:
${rerunCommands || "   - none"}
   Blockers:
${blockers || "   - none"}`;
    })
    .join("\n\n");
}

function formatBlockers(blockers) {
  return blockers.length > 0 ? blockers.map((blocker) => `- ${blocker}`).join("\n") : "- None.";
}

function sensitiveEnvironmentValues() {
  return sensitivePrivateKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function buildGroups(input) {
  const {
    completionAudit,
    distributionEnvTemplate,
    privateInputs,
    distributionQa,
    manualQaChecklist,
    autoUpdate,
    developerIdReadiness,
    developerIdSigning,
    notarization,
    notarizedGatekeeper,
    externalGate
  } = input;
  const metadataReady =
    inputGroupReady(privateInputs, "Distribution channel") &&
    inputGroupReady(privateInputs, "Release download URL") &&
    inputGroupReady(privateInputs, "Release notes URL") &&
    inputGroupReady(privateInputs, "Support URL");
  const updateReady = autoUpdate?.autoUpdateReady === true;
  const developerIdReady = developerIdSigning?.developerIdSigned === true;
  const notarizationReady =
    notarization?.notarizationReady === true &&
    notarization?.notarizationAccepted === true &&
    notarization?.stapled === true &&
    notarization?.stapleValidationPassed === true;
  const gatekeeperReady = notarizedGatekeeper?.notarizedGatekeeperAccepted === true;
  const manualQaReady =
    inputGroupReady(privateInputs, "Manual distribution QA approval") &&
    distributionQa?.channel?.manualQaApproved === true &&
    distributionQa?.channel?.manualQaChecklistDigestMatches === true;
  const redactedEvidenceReady =
    completionAudit?.completionAuditReady === true &&
    distributionEnvTemplate?.distributionEnvTemplateReady === true &&
    privateInputs?.privateValuesRecorded === false &&
    externalGate?.privateValuesRecorded === false;

  return [
    actionGroup({
      id: "redacted-local-evidence",
      label: "Redacted local evidence chain",
      ready: redactedEvidenceReady,
      requiredKeys: [],
      evidence: [evidencePath(completionAuditPath), evidencePath(distributionEnvTemplatePath), evidencePath(privateInputsPath), evidencePath(externalGatePath)],
      prerequisiteCommands: ["npm run release:check", "npm run desktop:external-distribution-gate-smoke"],
      operatorActions: ["Regenerate the local release evidence chain before filling private distribution values."],
      rerunCommands: ["npm run desktop:completion-audit-smoke", "npm run desktop:external-distribution-gate-smoke"],
      blockers: [
        ...blockerWhen(completionAudit?.completionAuditReady === true, "Completion audit is missing or not ready."),
        ...blockerWhen(distributionEnvTemplate?.distributionEnvTemplateReady === true, "Distribution env template is missing or not ready."),
        ...blockerWhen(privateInputs?.privateValuesRecorded === false, "Private-input evidence is missing or reports value recording."),
        ...blockerWhen(externalGate?.privateValuesRecorded === false, "External distribution gate dry-run artifact is missing or reports value recording.")
      ]
    }),
    actionGroup({
      id: "release-channel-metadata",
      label: "Release channel metadata",
      ready: metadataReady,
      requiredKeys: distributionMetadataKeys,
      evidence: [evidencePath(privateInputsPath), evidencePath(distributionChannelQaPath)],
      prerequisiteCommands: ["npm run desktop:distribution-env-template-smoke", "npm run desktop:distribution-private-inputs-smoke"],
      operatorActions: [
        "Fill the ignored distribution env file with the selected channel plus safe release, release-notes, and support URL keys.",
        "Keep those URL and channel values out of committed files and generated reports."
      ],
      rerunCommands: ["npm run desktop:distribution-private-inputs-smoke", "npm run desktop:distribution-channel-qa-smoke"],
      blockers: [
        ...blockerWhen(metadataReady, "Distribution channel, release download URL, release notes URL, and support URL keys are not all ready."),
        ...(privateInputs?.privateInputBlockers ?? []).filter((blocker) =>
          matchesAny(blocker, [
            /GROOVEFORGE_DISTRIBUTION_CHANNEL/,
            /GROOVEFORGE_RELEASE_DOWNLOAD_URL/,
            /GROOVEFORGE_RELEASE_NOTES_URL/,
            /GROOVEFORGE_SUPPORT_URL/,
            /^Distribution channel/i,
            /^Release download URL/i,
            /^Release notes URL/i,
            /^Support URL/i
          ])
        )
      ]
    }),
    actionGroup({
      id: "auto-update-feed",
      label: "Auto-update feed and signed metadata",
      ready: updateReady,
      requiredKeys: [...updateFeedUrlKeys, ...updateChannelKeys],
      evidence: [evidencePath(autoUpdateReadinessPath)],
      prerequisiteCommands: [
        "npm run desktop:update-feed-config-smoke",
        "npm run desktop:update-metadata-policy-smoke",
        "npm run desktop:update-metadata-artifacts-smoke",
        "npm run desktop:auto-update-readiness-smoke"
      ],
      operatorActions: [
        "Configure the ignored update feed and channel keys.",
        "Regenerate update metadata after Developer ID signing, notarization, and Gatekeeper evidence are ready."
      ],
      rerunCommands: ["npm run desktop:auto-update-readiness-smoke"],
      blockers: [...blockerWhen(updateReady, "Auto-update readiness is not complete."), ...(autoUpdate?.blockers ?? [])]
    }),
    actionGroup({
      id: "developer-id-signing",
      label: "Developer ID signing",
      ready: developerIdReady,
      requiredKeys: signingKeys,
      evidence: [evidencePath(developerIdReadinessPath), evidencePath(developerIdSigningPath)],
      prerequisiteCommands: ["npm run desktop:developer-id-readiness-smoke", "npm run desktop:developer-id-signing-smoke"],
      operatorActions: [
        "Install or unlock the intended Developer ID Application identity.",
        "Set the ignored Developer ID identity selector key, then sign only the isolated release copy."
      ],
      rerunCommands: ["npm run desktop:developer-id-signing-smoke"],
      blockers: [
        ...blockerWhen(developerIdReady, "Developer ID signed isolated app evidence is missing."),
        ...(developerIdReadiness?.blockers ?? []),
        ...(developerIdSigning?.blockers ?? [])
      ]
    }),
    actionGroup({
      id: "notarization-stapling",
      label: "Notarization and stapling",
      ready: notarizationReady,
      requiredKeys: notarizationKeys,
      evidence: [evidencePath(notarizationPath)],
      prerequisiteCommands: ["npm run desktop:developer-id-signing-smoke", "npm run desktop:notarization-smoke"],
      operatorActions: [
        "Provide one bounded notary credential signal in the ignored env file.",
        "Set the notary submit key only after the signed isolated app is ready."
      ],
      rerunCommands: ["npm run desktop:notarization-smoke"],
      blockers: [
        ...blockerWhen(notarizationReady, "Notarization, stapling, or staple validation evidence is incomplete."),
        ...(notarization?.blockers ?? [])
      ]
    }),
    actionGroup({
      id: "notarized-gatekeeper",
      label: "Notarized Gatekeeper assessment",
      ready: gatekeeperReady,
      requiredKeys: [],
      evidence: [evidencePath(notarizedGatekeeperPath)],
      prerequisiteCommands: ["npm run desktop:notarization-smoke", "npm run desktop:notarized-gatekeeper-smoke"],
      operatorActions: ["Assess the stapled isolated DMG and mounted app after notarization succeeds."],
      rerunCommands: ["npm run desktop:notarized-gatekeeper-smoke"],
      blockers: [
        ...blockerWhen(gatekeeperReady, "Notarized Gatekeeper acceptance evidence is missing."),
        ...(notarizedGatekeeper?.blockers ?? [])
      ]
    }),
    actionGroup({
      id: "manual-channel-qa",
      label: "Manual distribution QA approval digest",
      ready: manualQaReady,
      requiredKeys: manualQaKeys,
      evidence: [evidencePath(manualQaChecklistPath), evidencePath(distributionChannelQaPath), evidencePath(privateInputsPath)],
      prerequisiteCommands: ["npm run desktop:distribution-manual-qa-smoke", "npm run desktop:distribution-channel-qa-smoke"],
      operatorActions: [
        "Complete the value-free manual QA checklist for the selected signed and notarized artifact.",
        "Copy the current checklist SHA-256 from the manual QA artifact into the ignored approval digest key, then set the approval key."
      ],
      rerunCommands: [
        "npm run desktop:distribution-manual-qa-smoke",
        "npm run desktop:distribution-channel-qa-smoke",
        "npm run desktop:distribution-private-inputs-smoke"
      ],
      blockers: [
        ...blockerWhen(manualQaChecklist?.manualQaChecklistReady === true, "Manual distribution QA checklist is missing or not ready."),
        ...blockerWhen(manualQaReady, "Manual approval is not accepted because the approval signal or checklist digest match is missing."),
        ...(distributionQa?.blockers ?? []).filter((blocker) => /manual|checklist|approval|GROOVEFORGE_DISTRIBUTION_QA/i.test(blocker)),
        ...(privateInputs?.privateInputBlockers ?? []).filter((blocker) => /manual|checklist|APPROVED|approval|GROOVEFORGE_DISTRIBUTION_QA/i.test(blocker))
      ]
    }),
    actionGroup({
      id: "final-hard-gate",
      label: "Final hard external distribution gate",
      ready: externalGate?.externalDistributionGateReady === true,
      requiredKeys: distributionPrivateInputKeys,
      evidence: [evidencePath(externalGatePath)],
      prerequisiteCommands: ["npm run release:check"],
      operatorActions: ["Run the hard external distribution gate only after every remediation group is ready."],
      rerunCommands: ["npm run release:external-check"],
      blockers: [
        ...blockerWhen(externalGate?.externalDistributionGateReady === true, "External distribution hard gate would still fail."),
        ...(externalGate?.externalDistributionGateBlockers ?? [])
      ]
    })
  ];
}

function buildMarkdown(summary) {
  return `# ${appName} ${summary.version} ${summary.platform}-${summary.arch} External Distribution Remediation

## Status

- External remediation ready: ${summary.externalRemediationReady ? "yes" : "no"}
- Pending remediation groups: ${summary.pendingRemediationCount}
- External distribution gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}
- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Notary submission attempted by this remediation smoke: no
- Signing attempted by this remediation smoke: no

## Remediation Requirements

| remediation group | ready | required keys | evidence |
|---|---:|---|---|
${formatRequirementRows(summary.remediationGroups)}

## Ordered Operator Actions

${formatActionGroups(summary.remediationGroups)}

## Consolidated Blockers

${formatBlockers(summary.remediationBlockers)}

## Final Rerun

1. npm run release:check
2. npm run desktop:external-remediation-smoke
3. npm run release:external-check

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, private beats, and real user audio are not recorded.

## Not Claimed

This remediation artifact does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, release upload, app-store submission, remote channel probing, manual QA approval, or external distribution completion.
`;
}

async function createRemediationSummary() {
  const completionAudit = await readJsonIfExists(completionAuditPath);
  const distributionEnvTemplate = await readJsonIfExists(distributionEnvTemplatePath);
  const privateInputs = await readJsonIfExists(privateInputsPath);
  const distributionQa = await readJsonIfExists(distributionChannelQaPath);
  const manualQaChecklist = await readJsonIfExists(manualQaChecklistPath);
  const autoUpdate = await readJsonIfExists(autoUpdateReadinessPath);
  const developerIdReadiness = await readJsonIfExists(developerIdReadinessPath);
  const developerIdSigning = await readJsonIfExists(developerIdSigningPath);
  const notarization = await readJsonIfExists(notarizationPath);
  const notarizedGatekeeper = await readJsonIfExists(notarizedGatekeeperPath);
  const externalGate = await readJsonIfExists(externalGatePath);
  const remediationGroups = buildGroups({
    completionAudit,
    distributionEnvTemplate,
    privateInputs,
    distributionQa,
    manualQaChecklist,
    autoUpdate,
    developerIdReadiness,
    developerIdSigning,
    notarization,
    notarizedGatekeeper,
    externalGate
  });
  const remediationBlockers = unique(remediationGroups.flatMap((group) => group.blockers));

  return {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    remediationMarkdownPath: relative(remediationMarkdownPath),
    remediationJsonPath: relative(remediationJsonPath),
    productScope: "all-genre direct beat workstation; direct composition first; sampling optional and secondary",
    remediationScope: "value-free external distribution operator actions for private metadata, auto-update, signing, notarization, Gatekeeper, manual QA approval, and the final hard gate",
    localEnvInput: distributionLocalEnv,
    localEnvValueRecorded: false,
    privateValuesRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    notarySubmissionAttemptedByThisSmoke: false,
    signingAttemptedByThisSmoke: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedManualQaApproval: false,
    releaseGateClaimedExternalDistribution: false,
    externalDistributionGateReady: externalGate?.externalDistributionGateReady === true,
    externalRemediationReady: remediationGroups.every((group) => group.ready),
    pendingRemediationCount: remediationGroups.filter((group) => !group.ready).length,
    remediationGroups,
    remediationBlockers,
    finalCommands: ["npm run release:check", "npm run desktop:external-remediation-smoke", "npm run release:external-check"]
  };
}

const summary = await createRemediationSummary();
const markdown = buildMarkdown(summary);

await mkdir(packageRoot, { recursive: true });
await writeFile(remediationJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(remediationMarkdownPath, markdown, "utf8");

check(summary.appName === appName, "external remediation should identify GrooveForge");
check(summary.bundleId === bundleId, `external remediation should identify ${bundleId}`);
check(summary.version === packageJson.version, "external remediation should match package version");
check(summary.productScope.includes("all-genre direct beat workstation"), "external remediation should describe direct beat workstation scope");
check(summary.productScope.includes("sampling optional"), "external remediation should keep sampling optional");
check(Array.isArray(summary.remediationGroups) && summary.remediationGroups.length >= 8, "external remediation should include ordered remediation groups");
check(summary.remediationGroups.every((group) => group.valueRecorded === false), "external remediation groups should not record values");
check(Array.isArray(summary.remediationBlockers), "external remediation should include consolidated blockers");
check(summary.externalRemediationReady === false || summary.remediationBlockers.length === 0, "ready external remediation should not include blockers");
check(summary.localEnvInput?.valueRecorded === false, "external remediation local env loader should not record values");
check(summary.localEnvValueRecorded === false, "external remediation should not record local env values");
check(summary.privateValuesRecorded === false, "external remediation should not record private values");
check(summary.releaseUrlValueRecorded === false, "external remediation should not record release URL values");
check(summary.supportUrlValueRecorded === false, "external remediation should not record support URL values");
check(summary.feedValueRecorded === false, "external remediation should not record feed values");
check(summary.credentialValueRecorded === false, "external remediation should not record credential values");
check(summary.tokenValueRecorded === false, "external remediation should not record token values");
check(summary.channelValueRecorded === false, "external remediation should not record channel values");
check(summary.developerIdIdentityValueRecorded === false, "external remediation should not record Developer ID identity values");
check(summary.networkProbeAttempted === false, "external remediation should not probe remote channels");
check(summary.releaseUploadAttempted === false, "external remediation should not upload release artifacts");
check(summary.notarySubmissionAttemptedByThisSmoke === false, "external remediation should not submit to Apple notary services");
check(summary.signingAttemptedByThisSmoke === false, "external remediation should not sign artifacts");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "external remediation should not claim Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "external remediation should not claim notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "external remediation should not claim Gatekeeper approval");
check(summary.releaseGateClaimedAutoUpdate === false, "external remediation should not claim auto-update");
check(summary.releaseGateClaimedManualQaApproval === false, "external remediation should not claim manual QA approval");
check(summary.releaseGateClaimedExternalDistribution === false, "external remediation should not claim external distribution completion");
check(markdown.includes("External Distribution Remediation"), "external remediation Markdown should include title");
check(markdown.includes("Ordered Operator Actions"), "external remediation Markdown should include ordered actions");
check(markdown.includes("Private values recorded: no"), "external remediation Markdown should state value redaction");
check(markdown.includes("This remediation artifact does not claim"), "external remediation Markdown should state non-claiming posture");
check(!/https?:\/\//i.test(markdown), "external remediation should not include public or private URL values");

const combinedOutput = `${markdown}\n${JSON.stringify(summary)}`;
for (const privateValue of sensitiveEnvironmentValues()) {
  check(!combinedOutput.includes(privateValue), "external remediation should not include sensitive private environment values");
}

if (failures.length > 0) {
  fail("External remediation validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge external remediation smoke passed.");
console.log(`- Markdown: ${relative(remediationMarkdownPath)}`);
console.log(`- JSON: ${relative(remediationJsonPath)}`);
console.log(`- External remediation ready: ${summary.externalRemediationReady ? "yes" : "no"}`);
console.log(`- Pending remediation groups: ${summary.pendingRemediationCount}`);
console.log(`- External distribution gate ready: ${summary.externalDistributionGateReady ? "yes" : "no"}`);
console.log(`- Local env file loaded: ${summary.localEnvInput.enabled ? "yes" : "no"}`);
console.log("- Private values recorded: no");
if (summary.remediationBlockers.length > 0) {
  console.log(`- Remediation blockers: ${summary.remediationBlockers.join(" | ")}`);
}
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, private beats, or real user audio");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
