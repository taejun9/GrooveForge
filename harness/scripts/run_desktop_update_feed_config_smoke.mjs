#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const summaryRoot = path.join(root, "build", "desktop");
const summaryPath = path.join(summaryRoot, `${appName}-${platformArch}-update-feed-config.json`);
const updateFeedModule = await import(pathToFileURL(path.join(root, "electron", "updateFeedConfig.ts")).href);
const { redactUpdateFeedConfig, resolveUpdateFeedConfig, updateChannelKeys, updateFeedUrlKeys } = updateFeedModule;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge update feed config smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function sanitizeCase(name, env) {
  const resolved = resolveUpdateFeedConfig(env);
  const redacted = redactUpdateFeedConfig(resolved);
  return {
    name,
    redacted,
    blockerCount: redacted.blockers.length,
    ready: redacted.ready
  };
}

const cases = [
  sanitizeCase("missing feed and channel", {}),
  sanitizeCase("valid GrooveForge feed and channel", {
    GROOVEFORGE_UPDATE_FEED_URL: "https://updates.grooveforge.example/releases/mac",
    GROOVEFORGE_UPDATE_CHANNEL: "stable"
  }),
  sanitizeCase("fallback env keys", {
    ELECTRON_UPDATE_FEED_URL: "https://updates.grooveforge.example/releases/beta",
    ELECTRON_UPDATE_CHANNEL: "beta"
  }),
  sanitizeCase("non-HTTPS feed", {
    GROOVEFORGE_UPDATE_FEED_URL: "http://updates.grooveforge.example/releases/mac",
    GROOVEFORGE_UPDATE_CHANNEL: "stable"
  }),
  sanitizeCase("credential-bearing feed", {
    GROOVEFORGE_UPDATE_FEED_URL: "https://token:secret@updates.grooveforge.example/releases/mac",
    GROOVEFORGE_UPDATE_CHANNEL: "stable"
  }),
  sanitizeCase("fragment feed", {
    GROOVEFORGE_UPDATE_FEED_URL: "https://updates.grooveforge.example/releases/mac#token",
    GROOVEFORGE_UPDATE_CHANNEL: "stable"
  }),
  sanitizeCase("invalid channel", {
    GROOVEFORGE_UPDATE_FEED_URL: "https://updates.grooveforge.example/releases/mac",
    GROOVEFORGE_UPDATE_CHANNEL: "stable/prod"
  })
];

const caseByName = new Map(cases.map((testCase) => [testCase.name, testCase]));
const summary = {
  appName,
  bundleId,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  networkProbeAttempted: false,
  releaseGateClaimedAutoUpdate: false,
  releaseGateClaimedExternalDistribution: false,
  inspectedEnvironmentKeys: {
    feed: updateFeedUrlKeys,
    channel: updateChannelKeys
  },
  feedValueRecorded: false,
  channelValueRecorded: false,
  cases
};

check(Array.isArray(updateFeedUrlKeys), "update feed URL key list should be exported");
check(Array.isArray(updateChannelKeys), "update channel key list should be exported");
check(updateFeedUrlKeys.includes("GROOVEFORGE_UPDATE_FEED_URL"), "GrooveForge feed URL key should be supported");
check(updateChannelKeys.includes("GROOVEFORGE_UPDATE_CHANNEL"), "GrooveForge channel key should be supported");
check(caseByName.get("missing feed and channel")?.ready === false, "missing feed/channel should not be ready");
check(
  caseByName.get("missing feed and channel")?.redacted.blockers.includes("No update feed URL environment key is configured."),
  "missing feed should report a feed blocker"
);
check(
  caseByName.get("missing feed and channel")?.redacted.blockers.includes("No update release channel environment key is configured."),
  "missing channel should report a channel blocker"
);
check(caseByName.get("valid GrooveForge feed and channel")?.ready === true, "valid GrooveForge feed/channel should be ready");
check(caseByName.get("fallback env keys")?.ready === true, "fallback feed/channel env keys should be ready");
check(caseByName.get("non-HTTPS feed")?.ready === false, "non-HTTPS feed should not be ready");
check(
  caseByName.get("credential-bearing feed")?.redacted.blockers.includes("Update feed URL must not include credentials."),
  "credential-bearing feed should be rejected"
);
check(
  caseByName.get("fragment feed")?.redacted.blockers.includes("Update feed URL must not include a fragment."),
  "fragment feed should be rejected"
);
check(caseByName.get("invalid channel")?.ready === false, "invalid release channel should not be ready");

for (const testCase of cases) {
  check(testCase.redacted.feedValueRecorded === false, `${testCase.name} should not record feed values`);
  check(testCase.redacted.channelValueRecorded === false, `${testCase.name} should not record channel values`);
  check(!("feedUrl" in testCase.redacted), `${testCase.name} redacted output should omit feedUrl`);
  check(!("releaseChannel" in testCase.redacted), `${testCase.name} redacted output should omit releaseChannel`);
}

const serialized = JSON.stringify(summary, null, 2);
check(!serialized.includes("https://updates.grooveforge.example"), "summary should not contain feed URL values");
check(!serialized.includes("token:secret"), "summary should not contain credential values");
check(!serialized.includes("stable/prod"), "summary should not contain invalid channel values");
check(summary.networkProbeAttempted === false, "update feed config smoke should not probe network feeds");
check(summary.releaseGateClaimedAutoUpdate === false, "update feed config smoke should not claim auto-update support");
check(
  summary.releaseGateClaimedExternalDistribution === false,
  "update feed config smoke should not claim external distribution completion"
);

if (failures.length > 0) {
  fail("Update feed config validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await mkdir(summaryRoot, { recursive: true });
await writeFile(summaryPath, `${serialized}\n`, "utf8");

console.log("GrooveForge update feed config smoke passed.");
console.log(`- Summary: ${relative(summaryPath)}`);
console.log("- Valid feed/channel cases: ready");
console.log("- Unsafe feed/channel cases: blocked before network contact");
console.log("- Network: no update feed probe attempted");
console.log("- Not recorded: feed URL values, channel values, credentials, or tokens");
console.log("- Not claimed: auto-update, Developer ID signing, notarization, Gatekeeper approval, app-store submission, or external distribution-channel QA");
