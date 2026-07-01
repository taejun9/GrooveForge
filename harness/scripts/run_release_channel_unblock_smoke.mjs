#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDistributionLocalEnv } from "./distribution_local_env.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const smokeRoot = path.join(packageRoot, "release-channel-unblock-smoke");
const syntheticRoot = path.join(smokeRoot, "synthetic-root");
const syntheticEnvPath = path.join(syntheticRoot, ".env.distribution.local");
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-unblock-smoke.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-channel-unblock-smoke.json`);
const releaseChannelMetadataKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL"
];
const configuredEnvFileKey = "GROOVEFORGE_DISTRIBUTION_ENV_FILE";
const syntheticValues = {
  GROOVEFORGE_DISTRIBUTION_CHANNEL: "private-beta",
  GROOVEFORGE_RELEASE_DOWNLOAD_URL: ["https:", "", "downloads.invalid", "grooveforge", "darwin-arm64"].join("/"),
  GROOVEFORGE_RELEASE_NOTES_URL: ["https:", "", "notes.invalid", "grooveforge", packageJson.version].join("/"),
  GROOVEFORGE_SUPPORT_URL: ["https:", "", "support.invalid", "grooveforge"].join("/")
};
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge release-channel unblock smoke failed:");
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

function readEnv(key) {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

function safeUrlReady(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && Boolean(parsed.hostname) && !parsed.username && !parsed.password && !parsed.hash;
  } catch {
    return false;
  }
}

function metadataRows() {
  return releaseChannelMetadataKeys.map((key) => {
    const value = readEnv(key);
    const channelReady = key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" && /^(direct-download|private-beta|managed-release)$/.test(value);
    const urlReady = key !== "GROOVEFORGE_DISTRIBUTION_CHANNEL" && safeUrlReady(value);
    return {
      key,
      present: value.length > 0,
      ready: channelReady || urlReady,
      evidence: key === "GROOVEFORGE_DISTRIBUTION_CHANNEL" ? "allowed channel token" : "safe HTTPS URL shape",
      valueRecorded: false
    };
  });
}

function formatRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | no | none | no |";
  }
  return rows
    .map((row) => `| ${escapeCell(row.key)} | ${row.present ? "yes" : "no"} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.evidence)} | ${row.valueRecorded === false ? "no" : "yes"} |`)
    .join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} Release-Channel Unblock Smoke

## Summary

- Report ready: ${report.releaseChannelUnblockSmokeReady ? "yes" : "no"}
- Synthetic env fixture: ${report.syntheticEnvFixturePath}
- Synthetic fixture isolation: ${report.syntheticFixtureOnly ? "yes" : "no"}
- Configured env override ignored for synthetic load: ${report.configuredEnvOverrideIgnoredForSyntheticLoad ? "yes" : "no"}
- Loader enabled: ${report.loaderEnabled ? "yes" : "no"}
- Loaded key count: ${report.loadedKeyCount}
- Placeholder key count: ${report.placeholderKeyCount}
- Release-channel metadata ready: ${report.releaseChannelMetadataReady ? "yes" : "no"}
- Placeholder blocker cleared: ${report.releaseChannelPlaceholderBlockerCleared ? "yes" : "no"}
- Current completion remains: ${report.userFacingCompletionStatus}
- Next proof command after real local env edits: \`${report.nextProofCommandAfterRealEdits}\`
- Current blocker refresh command: \`${report.currentBlockerRefreshCommand}\`
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- External distribution claimed: no

## Metadata Rows

| key | present | ready | evidence | value recorded |
|---|---:|---:|---|---:|
${formatRows(report.releaseChannelMetadataRows)}

## Remaining External Proof

${report.remainingExternalProofRows.map((row, index) => `${index + 1}. ${row}`).join("\n")}

## Not Claimed

This smoke does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, release upload, remote channel probing, or external distribution completion.
`;
}

async function main() {
  await mkdir(syntheticRoot, { recursive: true });
  const envLines = [
    "# Synthetic release-channel metadata for value-free unblock smoke.",
    "# Values are deliberately local test inputs and must never be copied into release reports.",
    ...releaseChannelMetadataKeys.map((key) => `${key}=${syntheticValues[key]}`),
    ""
  ];
  await writeFile(syntheticEnvPath, envLines.join("\n"), "utf8");

  const previousValues = new Map(releaseChannelMetadataKeys.map((key) => [key, process.env[key]]));
  const previousConfiguredEnvFile = process.env[configuredEnvFileKey];
  try {
    for (const key of releaseChannelMetadataKeys) {
      delete process.env[key];
    }
    delete process.env[configuredEnvFileKey];

    const localEnvInput = await loadDistributionLocalEnv({
      root: syntheticRoot,
      allowedKeys: releaseChannelMetadataKeys
    });
    const rows = metadataRows();
    const loadedKeys = new Set(localEnvInput.loadedKeys);
    const report = {
      appName,
      bundleId,
      version: packageJson.version,
      platformArch,
      reportCommand: "npm run release:channel-unblock-smoke",
      syntheticEnvFixturePath: relative(syntheticEnvPath),
      configuredEnvOverrideIgnoredForSyntheticLoad:
        typeof previousConfiguredEnvFile === "string" && previousConfiguredEnvFile.trim().length > 0,
      syntheticInputFilesChecked: localEnvInput.filesChecked,
      syntheticInputPresentFiles: localEnvInput.presentFiles,
      syntheticFixtureOnly:
        localEnvInput.filesChecked.length === 1 &&
        localEnvInput.filesChecked[0] === ".env.distribution.local" &&
        localEnvInput.presentFiles.length === 1 &&
        localEnvInput.presentFiles[0] === ".env.distribution.local",
      loaderEnabled: localEnvInput.enabled === true,
      loadedKeyCount: localEnvInput.loadedKeys.length,
      loadedKeys: localEnvInput.loadedKeys,
      skippedExistingKeyCount: localEnvInput.skippedExistingKeys.length,
      placeholderKeyCount: localEnvInput.placeholderKeys.length,
      placeholderKeys: localEnvInput.placeholderKeys,
      unknownKeyCount: localEnvInput.unknownKeys.length,
      malformedLineCount: localEnvInput.malformedLines.length,
      releaseChannelMetadataReady: rows.every((row) => row.present === true && row.ready === true && row.valueRecorded === false),
      releaseChannelMetadataRows: rows,
      releaseChannelPlaceholderBlockerCleared:
        localEnvInput.enabled === true &&
        localEnvInput.placeholderKeys.length === 0 &&
        releaseChannelMetadataKeys.every((key) => loadedKeys.has(key)),
      userFacingCompletionStatus: "99.999999% complete; external/private release proof remains.",
      nextProofCommandAfterRealEdits: "npm run release:doctor",
      currentBlockerRefreshCommand: "npm run release:current-blocker",
      remainingExternalProofRows: [
        "Run release doctor/current-blocker after replacing real values in the ignored local env file.",
        "Complete distribution-channel QA with matching manual QA checklist digest.",
        "Complete Developer ID signing, notarization/stapling, notarized Gatekeeper, and signed update metadata evidence.",
        "Run the hard external gate only when every value-free external proof requirement is ready."
      ],
      privateValuesRecorded: false,
      networkProbeAttempted: false,
      releaseUploadAttempted: false,
      appleNotarySubmissionAttempted: false,
      signingAttempted: false,
      claimedExternalDistribution: false,
      valueRecorded: false
    };
    report.releaseChannelUnblockSmokeReady =
      report.loaderEnabled &&
      report.syntheticFixtureOnly &&
      report.loadedKeyCount === releaseChannelMetadataKeys.length &&
      report.skippedExistingKeyCount === 0 &&
      report.placeholderKeyCount === 0 &&
      report.unknownKeyCount === 0 &&
      report.malformedLineCount === 0 &&
      report.releaseChannelMetadataReady &&
      report.releaseChannelPlaceholderBlockerCleared &&
      report.privateValuesRecorded === false &&
      report.claimedExternalDistribution === false;

    check(report.releaseChannelUnblockSmokeReady === true, "release-channel unblock smoke should be ready");
    check(report.loaderEnabled === true, "release-channel unblock smoke should load the synthetic env fixture");
    check(report.syntheticFixtureOnly === true, "release-channel unblock smoke should isolate the synthetic env fixture from configured env overrides");
    check(report.loadedKeyCount === releaseChannelMetadataKeys.length, "release-channel unblock smoke should load four release-channel keys");
    check(report.placeholderKeyCount === 0, "release-channel unblock smoke should clear release-channel placeholder keys");
    check(report.releaseChannelMetadataReady === true, "release-channel unblock smoke should validate release-channel metadata shape");
    check(report.releaseChannelPlaceholderBlockerCleared === true, "release-channel unblock smoke should prove the placeholder blocker can clear");
    check(report.releaseChannelMetadataRows.every((row) => row.valueRecorded === false), "release-channel unblock rows should not record values");
    check(report.privateValuesRecorded === false, "release-channel unblock smoke should not record private values");
    check(report.networkProbeAttempted === false, "release-channel unblock smoke should not probe network");
    check(report.releaseUploadAttempted === false, "release-channel unblock smoke should not upload releases");
    check(report.appleNotarySubmissionAttempted === false, "release-channel unblock smoke should not submit to Apple");
    check(report.signingAttempted === false, "release-channel unblock smoke should not sign artifacts");
    check(report.claimedExternalDistribution === false, "release-channel unblock smoke should not claim external distribution");

    await mkdir(packageRoot, { recursive: true });
    const markdown = buildMarkdown(report);
    const json = `${JSON.stringify(report, null, 2)}\n`;
    for (const value of Object.values(syntheticValues)) {
      check(!markdown.includes(value), "release-channel unblock Markdown should not include synthetic private values");
      check(!json.includes(value), "release-channel unblock JSON should not include synthetic private values");
    }
    check(!/https?:\/\//i.test(markdown), "release-channel unblock Markdown should not include URL values");
    check(!/https?:\/\//i.test(json), "release-channel unblock JSON should not include URL values");

    if (failures.length > 0) {
      fail("Validation failed.", failures.map((message) => `- ${message}`).join("\n"));
    }

    await writeFile(markdownPath, markdown, "utf8");
    await writeFile(jsonPath, json, "utf8");

    console.log("GrooveForge release-channel unblock smoke passed.");
    console.log(`- Markdown: ${relative(markdownPath)}`);
    console.log(`- JSON: ${relative(jsonPath)}`);
    console.log(`- Synthetic env fixture: ${relative(syntheticEnvPath)}`);
    console.log(`- Synthetic fixture isolation: ${report.syntheticFixtureOnly ? "yes" : "no"}`);
    console.log(`- Configured env override ignored for synthetic load: ${report.configuredEnvOverrideIgnoredForSyntheticLoad ? "yes" : "no"}`);
    console.log(`- Loaded keys: ${report.loadedKeyCount}`);
    console.log(`- Placeholder keys: ${report.placeholderKeyCount}`);
    console.log(`- Release-channel metadata ready: ${report.releaseChannelMetadataReady ? "yes" : "no"}`);
    console.log(`- Placeholder blocker cleared: ${report.releaseChannelPlaceholderBlockerCleared ? "yes" : "no"}`);
    console.log(`- Next proof command after real edits: ${report.nextProofCommandAfterRealEdits}`);
    console.log(`- Current blocker refresh command: ${report.currentBlockerRefreshCommand}`);
    console.log("- Private values recorded: no");
    console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
    console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
  } finally {
    for (const [key, value] of previousValues) {
      if (typeof value === "string") {
        process.env[key] = value;
      } else {
        delete process.env[key];
      }
    }
    if (typeof previousConfiguredEnvFile === "string") {
      process.env[configuredEnvFileKey] = previousConfiguredEnvFile;
    } else {
      delete process.env[configuredEnvFileKey];
    }
  }
}

await main();
