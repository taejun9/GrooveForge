#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { distributionLocalEnvDefaults, distributionPrivateInputKeys } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const successSmoke = process.argv.includes("--success-smoke");
const reportStem = successSmoke ? "release-private-value-leak-audit-success-smoke" : "release-private-value-leak-audit";
const reportNameHints = [
  "release-private-value-leak-audit.md",
  "release-private-value-leak-audit.json",
  "release-private-value-leak-audit-success-smoke.md",
  "release-private-value-leak-audit-success-smoke.json"
];
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-${reportStem}.json`);
const syntheticRoot = path.join(packageRoot, "release-private-value-leak-audit-success-smoke");
const syntheticEnvRoot = path.join(syntheticRoot, "env");
const syntheticEvidenceRoot = path.join(syntheticRoot, "evidence");
const maxTextArtifactBytes = 2_000_000;
const scannableExtensions = new Set([".json", ".md", ".txt", ".scaffold", ".log", ".yml", ".yaml"]);
const publicChannelTokens = new Set([
  "alpha",
  "beta",
  "canary",
  "dev",
  "direct-download",
  "latest",
  "managed-release",
  "private-beta",
  "prod",
  "production",
  "stable"
]);
const placeholderPattern = /^(|<[^>]+>|CHANGE_ME|REPLACE_ME|TODO|TBD|example|example-.+|your-.+|https:\/\/example\.com.*)$/i;
const releaseChannelKeys = new Set([
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
]);
const updateFeedKeys = new Set([
  "GROOVEFORGE_UPDATE_FEED_URL",
  "ELECTRON_UPDATE_FEED_URL",
  "UPDATE_FEED_URL",
  "GROOVEFORGE_UPDATE_CHANNEL",
  "ELECTRON_UPDATE_CHANNEL",
  "UPDATE_CHANNEL"
]);
const controlKeys = new Set([
  "GROOVEFORGE_DISTRIBUTION_QA_APPROVED",
  "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256",
  "GROOVEFORGE_NOTARY_SUBMIT"
]);
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release private value leak audit failed:");
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
  return value ? "yes" : "no";
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  const withoutExport = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
  const separatorIndex = withoutExport.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }
  const key = withoutExport.slice(0, separatorIndex).trim();
  let value = withoutExport.slice(separatorIndex + 1).trim();
  if (!/^[A-Z0-9_]+$/.test(key)) {
    return null;
  }
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return { key, value };
}

function isPlaceholderValue(value) {
  return placeholderPattern.test(String(value ?? "").trim());
}

function keyKind(key) {
  if (releaseChannelKeys.has(key)) {
    return "release-channel";
  }
  if (updateFeedKeys.has(key)) {
    return "update-feed";
  }
  if (controlKeys.has(key)) {
    return "control";
  }
  return "identity-or-credential";
}

function shouldAuditPrivateValue(key, value) {
  const normalized = String(value ?? "").trim();
  if (isPlaceholderValue(normalized)) {
    return { audit: false, reason: "placeholder" };
  }
  if (key === "GROOVEFORGE_DISTRIBUTION_QA_CHECKLIST_SHA256") {
    return { audit: false, reason: "public-checklist-digest" };
  }
  if ((key === "GROOVEFORGE_DISTRIBUTION_QA_APPROVED" || key === "GROOVEFORGE_NOTARY_SUBMIT") && /^[01]$/.test(normalized)) {
    return { audit: false, reason: "boolean-control" };
  }
  if (normalized.length < 6) {
    return { audit: false, reason: "too-short-for-leak-scan" };
  }
  if ((key.includes("CHANNEL") || key === "GROOVEFORGE_DISTRIBUTION_CHANNEL") && publicChannelTokens.has(normalized)) {
    return { audit: false, reason: "public-channel-token" };
  }
  return { audit: true, reason: "private-value-candidate" };
}

function displayPath(baseRoot, filePath) {
  const relativePath = path.relative(baseRoot, filePath);
  if (!relativePath.startsWith("..") && !path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.basename(filePath);
}

function configuredEnvPaths(envRoot) {
  const paths = [path.join(envRoot, distributionLocalEnvDefaults.defaultEnvFileName)];
  const customPath = process.env[distributionLocalEnvDefaults.configuredFileKey]?.trim();
  if (customPath) {
    paths.push(path.isAbsolute(customPath) ? customPath : path.resolve(root, customPath));
  }
  return [...new Set(paths)];
}

async function writeSyntheticInputs() {
  await mkdir(syntheticEnvRoot, { recursive: true });
  await mkdir(syntheticEvidenceRoot, { recursive: true });
  const syntheticEnv = [
    "GROOVEFORGE_DISTRIBUTION_CHANNEL=operator-channel-123",
    "GROOVEFORGE_RELEASE_DOWNLOAD_URL=https://private-release.invalid/download/GF_SECRET_DOWNLOAD_123",
    "GROOVEFORGE_RELEASE_NOTES_URL=https://private-release.invalid/notes/GF_SECRET_NOTES_123",
    "GROOVEFORGE_SUPPORT_URL=https://private-support.invalid/help/GF_SECRET_SUPPORT_123",
    "GROOVEFORGE_UPDATE_FEED_URL=https://private-updates.invalid/feed/GF_SECRET_FEED_123",
    "GROOVEFORGE_UPDATE_CHANNEL=operator-update-channel-123",
    "GROOVEFORGE_DEVELOPER_ID_IDENTITY=Developer ID Application Private Operator",
    "APPLE_ID=private-operator@example.invalid",
    "APPLE_TEAM_ID=TEAMPRIVATE123",
    "APPLE_APP_SPECIFIC_PASSWORD=app-specific-secret-123",
    "ASC_KEY_ID=ASCSECRET123",
    "ASC_ISSUER_ID=ASC-ISSUER-SECRET-123",
    "ASC_KEY_PATH=/Users/operator/private/AuthKey_SECRET.p8",
    "APPLE_NOTARY_PROFILE=private-notary-profile-123",
    "NOTARYTOOL_KEYCHAIN_PROFILE=private-keychain-profile-123"
  ].join("\n");
  await writeFile(path.join(syntheticEnvRoot, distributionLocalEnvDefaults.defaultEnvFileName), `${syntheticEnv}\n`, "utf8");
  await writeFile(
    path.join(syntheticEvidenceRoot, "synthetic-release-evidence.json"),
    `${JSON.stringify(
      {
        report: "synthetic release evidence",
        inspectedKeys: distributionPrivateInputKeys,
        privateValuesRecorded: false,
        networkProbeAttempted: false,
        releaseGateClaimedExternalDistribution: false
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  await writeFile(
    path.join(syntheticEvidenceRoot, "synthetic-release-evidence.md"),
    [
      "# Synthetic Release Evidence",
      "",
      "Private values recorded: no",
      "",
      "| key | value recorded |",
      "|---|---:|",
      ...distributionPrivateInputKeys.map((key) => `| ${key} | no |`)
    ].join("\n") + "\n",
    "utf8"
  );
}

async function collectEnvCandidates(envRoot) {
  const files = configuredEnvPaths(envRoot);
  const presentFiles = [];
  const privateCandidates = [];
  const excludedRows = [];
  const unknownKeys = [];
  const malformedLines = [];

  for (const filePath of files) {
    if (!existsSync(filePath)) {
      continue;
    }
    presentFiles.push(displayPath(root, filePath));
    const lines = (await readFile(filePath, "utf8")).split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        if (line.trim() && !line.trim().startsWith("#")) {
          malformedLines.push({
            file: displayPath(root, filePath),
            line: index + 1,
            valueRecorded: false
          });
        }
        continue;
      }
      const { key, value } = parsed;
      if (!distributionPrivateInputKeys.includes(key)) {
        unknownKeys.push({
          key,
          file: displayPath(root, filePath),
          line: index + 1,
          valueRecorded: false
        });
        continue;
      }
      const decision = shouldAuditPrivateValue(key, value);
      const publicRow = {
        key,
        kind: keyKind(key),
        file: displayPath(root, filePath),
        line: index + 1,
        reason: decision.reason,
        valueRecorded: false
      };
      if (decision.audit) {
        privateCandidates.push({
          ...publicRow,
          value
        });
      } else {
        excludedRows.push(publicRow);
      }
    }
  }

  return {
    filesChecked: files.map((filePath) => displayPath(root, filePath)),
    presentFiles,
    privateCandidates,
    excludedRows,
    unknownKeys,
    malformedLines
  };
}

async function walkFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(filePath));
      continue;
    }
    if (entry.isFile()) {
      files.push(filePath);
    }
  }
  return files;
}

function isScannableArtifact(filePath) {
  const base = path.basename(filePath);
  if (base === distributionLocalEnvDefaults.defaultEnvFileName || base.endsWith(".env")) {
    return false;
  }
  return scannableExtensions.has(path.extname(filePath));
}

function scanTextForCandidates(text, candidates) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  for (const candidate of candidates) {
    for (const [index, line] of lines.entries()) {
      if (line.includes(candidate.value)) {
        findings.push({
          key: candidate.key,
          kind: candidate.kind,
          line: index + 1,
          valueRecorded: false
        });
      }
    }
  }
  return findings;
}

async function scanArtifacts(scanRoot, privateCandidates) {
  const files = await walkFiles(scanRoot);
  const artifactRows = [];
  const leakFindingRows = [];
  for (const filePath of files.filter(isScannableArtifact)) {
    const fileStat = await stat(filePath);
    const row = {
      path: displayPath(root, filePath),
      sizeBytes: fileStat.size,
      scanned: fileStat.size <= maxTextArtifactBytes,
      skippedReason: fileStat.size > maxTextArtifactBytes ? "too-large" : "none",
      valueRecorded: false
    };
    artifactRows.push(row);
    if (!row.scanned || privateCandidates.length === 0) {
      continue;
    }
    const text = await readFile(filePath, "utf8");
    const findings = scanTextForCandidates(text, privateCandidates).map((finding) => ({
      ...finding,
      path: displayPath(root, filePath)
    }));
    leakFindingRows.push(...findings);
  }
  return { artifactRows, leakFindingRows };
}

function sanitizedCandidateRows(privateCandidates) {
  return privateCandidates.map(({ value, ...row }) => {
    void value;
    return {
      key: row.key,
      kind: row.kind,
      file: row.file,
      line: row.line,
      reason: row.reason,
      valueRecorded: false
    };
  });
}

function formatCandidateRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.key)} | ${escapeCell(row.kind)} | ${escapeCell(row.file)} | ${escapeCell(row.line)} | ${escapeCell(row.reason)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatArtifactRows(rows) {
  if (rows.length === 0) {
    return "| none | no | 0 | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.path)} | ${readyLabel(row.scanned)} | ${row.sizeBytes} | ${escapeCell(row.skippedReason)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function formatLeakRows(rows) {
  if (rows.length === 0) {
    return "| none | none | none | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.key)} | ${escapeCell(row.kind)} | ${escapeCell(row.path)} | ${escapeCell(row.line)} | ${readyLabel(row.valueRecorded)} |`)
    .join("\n");
}

function buildMarkdown(report) {
  return `# GrooveForge Release Private Value Leak Audit

- Audit ready: ${readyLabel(report.releasePrivateValueLeakAuditReady)}
- Report command: \`${report.reportCommand}\`
- Synthetic success smoke: ${readyLabel(report.syntheticSuccessSmoke)}
- Env files present: ${report.envFilesPresentCount}
- Private value candidates scanned: ${report.privateValueCandidateCount}
- Excluded env rows: ${report.excludedEnvRowCount}
- Scanned artifacts: ${report.scannedArtifactCount}/${report.scannableArtifactCount}
- Leak findings: ${report.leakFindingCount}
- Detection probe ready: ${readyLabel(report.detectionProbeReady)}
- Private values recorded: no
- Network: no distribution channel probe, update feed probe, release upload, Apple notary submission, or signing attempted
- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion

## Private Value Candidate Rows

| key | kind | file | line | reason | value recorded |
|---|---|---|---:|---|---:|
${formatCandidateRows(report.privateValueCandidateRows)}

## Excluded Env Rows

| key | kind | file | line | reason | value recorded |
|---|---|---|---:|---|---:|
${formatCandidateRows(report.excludedEnvRows)}

## Scanned Artifacts

| path | scanned | size bytes | skipped reason | value recorded |
|---|---:|---:|---|---:|
${formatArtifactRows(report.scannedArtifactRows)}

## Leak Findings

| key | kind | path | line | value recorded |
|---|---|---|---:|---:|
${formatLeakRows(report.leakFindingRows)}
`;
}

if (successSmoke) {
  await writeSyntheticInputs();
}

const envRoot = successSmoke
  ? syntheticEnvRoot
  : path.resolve(root, process.env.GROOVEFORGE_PRIVATE_VALUE_AUDIT_ENV_ROOT || ".");
const scanRoot = successSmoke
  ? syntheticEvidenceRoot
  : path.resolve(root, process.env.GROOVEFORGE_PRIVATE_VALUE_AUDIT_SCAN_ROOT || path.relative(root, packageRoot));
const envEvidence = await collectEnvCandidates(envRoot);
const { artifactRows, leakFindingRows } = await scanArtifacts(scanRoot, envEvidence.privateCandidates);
const detectionProbeReady =
  envEvidence.privateCandidates.length === 0
    ? true
    : scanTextForCandidates(`probe:${envEvidence.privateCandidates[0].value}`, envEvidence.privateCandidates).some(
        (finding) => finding.key === envEvidence.privateCandidates[0].key
      );
const privateValueCandidateRows = sanitizedCandidateRows(envEvidence.privateCandidates);
const scannableArtifactRows = artifactRows.filter((row) => row.scanned === true);
const scanRootPresent = existsSync(scanRoot);
const releasePrivateValueLeakAuditReady =
  scanRootPresent &&
  artifactRows.length > 0 &&
  leakFindingRows.length === 0 &&
  detectionProbeReady &&
  privateValueCandidateRows.every((row) => row.valueRecorded === false) &&
  envEvidence.excludedRows.every((row) => row.valueRecorded === false) &&
  artifactRows.every((row) => row.valueRecorded === false) &&
  leakFindingRows.every((row) => row.valueRecorded === false);

const report = {
  appName,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  reportCommand: successSmoke ? "npm run release:private-value-leak-audit-smoke" : "npm run release:private-value-leak-audit",
  syntheticSuccessSmoke: successSmoke,
  releasePrivateValueLeakAuditReady,
  auditMode: successSmoke ? "synthetic-redaction-success-smoke" : "real-release-evidence-audit",
  reportNameHints,
  envRoot: displayPath(root, envRoot),
  scanRoot: displayPath(root, scanRoot),
  scanRootPresent,
  envFilesChecked: envEvidence.filesChecked,
  envFilesPresent: envEvidence.presentFiles,
  envFilesPresentCount: envEvidence.presentFiles.length,
  privateValueCandidateRows,
  privateValueCandidateCount: privateValueCandidateRows.length,
  excludedEnvRows: envEvidence.excludedRows,
  excludedEnvRowCount: envEvidence.excludedRows.length,
  unknownEnvRows: envEvidence.unknownKeys,
  unknownEnvRowCount: envEvidence.unknownKeys.length,
  malformedEnvRows: envEvidence.malformedLines,
  malformedEnvRowCount: envEvidence.malformedLines.length,
  scannedArtifactRows: artifactRows,
  scannableArtifactCount: artifactRows.length,
  scannedArtifactCount: scannableArtifactRows.length,
  skippedArtifactCount: artifactRows.length - scannableArtifactRows.length,
  leakFindingRows,
  leakFindingCount: leakFindingRows.length,
  detectionProbeReady,
  privateValuesRecorded: false,
  networkProbeAttempted: false,
  updateFeedProbeAttempted: false,
  releaseUploadAttempted: false,
  notarySubmissionAttempted: false,
  signingAttempted: false,
  releaseGateClaimedDeveloperIdSigning: false,
  releaseGateClaimedNotarization: false,
  releaseGateClaimedGatekeeperApproval: false,
  releaseGateClaimedAutoUpdate: false,
  releaseGateClaimedExternalDistribution: false
};

const markdown = buildMarkdown(report);
const serialized = JSON.stringify(report, null, 2);

check(report.scanRootPresent === true, "private value leak audit scan root should exist");
check(report.scannableArtifactCount > 0, "private value leak audit should scan at least one evidence artifact");
check(report.scannedArtifactCount > 0, "private value leak audit should scan at least one text artifact");
check(report.leakFindingCount === 0, "private value leak audit should not find private values in generated evidence");
check(report.detectionProbeReady === true, "private value leak audit should prove candidate detection works");
check(report.privateValueCandidateRows.every((row) => row.valueRecorded === false), "private value candidate rows should not record values");
check(report.excludedEnvRows.every((row) => row.valueRecorded === false), "excluded env rows should not record values");
check(report.scannedArtifactRows.every((row) => row.valueRecorded === false), "scanned artifact rows should not record values");
check(report.leakFindingRows.every((row) => row.valueRecorded === false), "leak finding rows should not record values");
check(report.privateValuesRecorded === false, "private value leak audit should not record private values");
check(report.networkProbeAttempted === false, "private value leak audit should not probe distribution channels");
check(report.updateFeedProbeAttempted === false, "private value leak audit should not probe update feeds");
check(report.releaseUploadAttempted === false, "private value leak audit should not upload releases");
check(report.notarySubmissionAttempted === false, "private value leak audit should not submit to Apple");
check(report.signingAttempted === false, "private value leak audit should not sign artifacts");
check(report.releaseGateClaimedExternalDistribution === false, "private value leak audit should not claim external distribution");
check(markdown.includes("Private values recorded: no"), "private value leak audit Markdown should state value redaction");
check(markdown.includes("Leak Findings"), "private value leak audit Markdown should include leak findings");

for (const candidate of envEvidence.privateCandidates) {
  check(!serialized.includes(candidate.value), `private value leak audit JSON should not include the value for ${candidate.key}`);
  check(!markdown.includes(candidate.value), `private value leak audit Markdown should not include the value for ${candidate.key}`);
}

if (successSmoke) {
  check(report.syntheticSuccessSmoke === true, "private value leak audit success smoke should mark synthetic mode");
  check(report.privateValueCandidateCount >= 10, "private value leak audit success smoke should collect synthetic private values");
  check(report.leakFindingCount === 0, "private value leak audit success smoke should find zero leaks");
}

if (failures.length > 0) {
  fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
}

await mkdir(packageRoot, { recursive: true });
await writeFile(jsonPath, `${serialized}\n`, "utf8");
await writeFile(markdownPath, markdown, "utf8");

console.log("GrooveForge release private value leak audit passed.");
console.log(`- Markdown: ${relative(markdownPath)}`);
console.log(`- JSON: ${relative(jsonPath)}`);
console.log(`- Synthetic success smoke: ${successSmoke ? "yes" : "no"}`);
console.log(`- Env files present: ${report.envFilesPresentCount}`);
console.log(`- Private value candidates scanned: ${report.privateValueCandidateCount}`);
console.log(`- Scanned artifacts: ${report.scannedArtifactCount}/${report.scannableArtifactCount}`);
console.log(`- Leak findings: ${report.leakFindingCount}`);
console.log(`- Detection probe ready: ${report.detectionProbeReady ? "yes" : "no"}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, update feed probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
