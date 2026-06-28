#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const pkgIdentifier = `${bundleId}.pkg`;
const installLocation = "/Applications";
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const packagedApp = path.join(packageRoot, `${appName}.app`);
const pkgPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}.pkg`);
const pkgExpandedRoot = path.join(packageRoot, "pkg-smoke-expanded");
const reportJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-pkg-smoke.json`);
const reportMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-pkg-smoke.md`);
const commandTimeoutMs = 120000;
const failures = [];

const privateEnvKeys = [
  "GROOVEFORGE_DISTRIBUTION_CHANNEL",
  "GROOVEFORGE_RELEASE_DOWNLOAD_URL",
  "GROOVEFORGE_RELEASE_NOTES_URL",
  "GROOVEFORGE_SUPPORT_URL",
  "GROOVEFORGE_UPDATE_FEED_URL",
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

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop PKG smoke failed:");
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

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      ...options
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`${command} timed out after ${commandTimeoutMs}ms\n${stdout}\n${stderr}`));
    }, commandTimeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      reject(error);
    });
    child.on("exit", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      if (code !== 0 && options.allowFailure !== true) {
        reject(new Error(`${command} ${args.join(" ")} failed with code ${code ?? "null"} signal ${signal ?? "null"}\n${stdout}\n${stderr}`));
        return;
      }
      resolve({ code, signal, stdout, stderr });
    });
  });
}

async function sha256(filePath) {
  return await new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function payloadIncludes(payloadFiles, suffix) {
  return payloadFiles.some((entry) => entry.endsWith(suffix));
}

function privateEnvironmentValues() {
  return privateEnvKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function formatPayloadRows(rows) {
  return rows.map((row) => `| ${escapeCell(row.label)} | ${row.present ? "yes" : "no"} | ${escapeCell(row.suffix)} |`).join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} PKG Smoke

## Status

- PKG smoke ready: ${report.pkgSmokeReady ? "yes" : "no"}
- PKG path: ${report.pkg.path}
- PKG bytes: ${report.pkg.bytes}
- PKG SHA-256: ${report.pkg.sha256}
- Package identifier: ${report.pkg.identifier}
- Install location: ${report.pkg.installLocation}
- Payload file count: ${report.payloadFileCount}
- Package signed: no
- Real Applications install attempted: no
- Developer ID Installer claimed: no
- Notarization claimed: no
- Gatekeeper approval claimed: no
- External distribution claimed: no
- Private values recorded: no

## Required Payload

| payload | present | suffix |
|---|---:|---|
${formatPayloadRows(report.requiredPayload)}

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, private beats, and real user audio are not recorded.

## Not Claimed

This smoke creates and inspects a local unsigned PKG only. It does not install into the real Applications directory, sign the PKG with Developer ID Installer, notarize, staple, pass Gatekeeper, upload releases, publish update feeds, submit to an app store, probe remote channels, or claim external distribution completion.
`;
}

async function readCodeSignatureDetails(appPath) {
  const display = await runCommand("codesign", ["--display", "--verbose=4", appPath]);
  return `${display.stdout}\n${display.stderr}`;
}

async function createPkg() {
  check(existsSync(packagedApp), "packaged GrooveForge.app should exist; run npm run desktop:package-smoke first");
  check(existsSync(path.join(packagedApp, "Contents", "Resources", "GrooveForge.icns")), "packaged app should include GrooveForge.icns before PKG creation");
  check(!existsSync(path.join(packagedApp, "Contents", "Resources", "electron.icns")), "packaged app should not include electron.icns before PKG creation");
  if (failures.length > 0) {
    fail("PKG preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  const signatureDetails = await readCodeSignatureDetails(packagedApp);
  check(signatureDetails.includes(`Identifier=${bundleId}`), `packaged app signature should preserve ${bundleId}`);
  check(signatureDetails.includes("Signature=adhoc"), "packaged app should have the local ad-hoc signature before unsigned PKG creation");
  check(!signatureDetails.includes("Authority=Developer ID"), "packaged app should not claim Developer ID authority before unsigned PKG creation");
  if (failures.length > 0) {
    fail("PKG signature preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  await rm(pkgPath, { force: true });
  await rm(pkgExpandedRoot, { force: true, recursive: true });
  await mkdir(packageRoot, { recursive: true });

  await runCommand("pkgbuild", [
    "--component",
    packagedApp,
    "--install-location",
    installLocation,
    "--identifier",
    pkgIdentifier,
    "--version",
    packageJson.version,
    pkgPath
  ]);
}

async function inspectPkg() {
  check(existsSync(pkgPath), "local GrooveForge PKG should exist");
  if (!existsSync(pkgPath)) {
    fail("PKG file was not created.");
  }

  const pkgStats = await stat(pkgPath);
  check(pkgStats.size > 10000000, `local GrooveForge PKG should be substantial, got ${pkgStats.size} bytes`);

  await runCommand("pkgutil", ["--expand", pkgPath, pkgExpandedRoot]);
  const packageInfoPath = path.join(pkgExpandedRoot, "PackageInfo");
  const packageInfo = existsSync(packageInfoPath) ? await readFile(packageInfoPath, "utf8") : "";
  check(packageInfo.includes(`identifier="${pkgIdentifier}"`), `expanded PackageInfo should include ${pkgIdentifier}`);
  check(packageInfo.includes(`version="${packageJson.version}"`), `expanded PackageInfo should include version ${packageJson.version}`);
  check(packageInfo.includes(`install-location="${installLocation}"`), `expanded PackageInfo should include install location ${installLocation}`);

  const payloadResult = await runCommand("pkgutil", ["--payload-files", pkgPath]);
  const payloadFiles = payloadResult.stdout
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const requiredPayload = [
    { label: "App Info.plist", suffix: `${appName}.app/Contents/Info.plist` },
    { label: "App executable", suffix: `${appName}.app/Contents/MacOS/${appName}` },
    { label: "GrooveForge icon", suffix: `${appName}.app/Contents/Resources/GrooveForge.icns` },
    { label: "Renderer HTML", suffix: `${appName}.app/Contents/Resources/app/dist/index.html` },
    { label: "Electron main", suffix: `${appName}.app/Contents/Resources/app/dist-electron/main.js` },
    { label: "Electron preload", suffix: `${appName}.app/Contents/Resources/app/dist-electron/preload.cjs` }
  ].map((item) => ({ ...item, present: payloadIncludes(payloadFiles, item.suffix) }));
  check(requiredPayload.every((item) => item.present), "PKG payload should include required GrooveForge app files");
  check(!payloadFiles.some((entry) => entry.endsWith(`${appName}.app/Contents/Resources/electron.icns`)), "PKG payload should not include electron.icns");

  const signatureCheck = await runCommand("pkgutil", ["--check-signature", pkgPath], { allowFailure: true });
  const signatureOutput = `${signatureCheck.stdout}\n${signatureCheck.stderr}`;
  check(!signatureOutput.includes("Developer ID Installer"), "local PKG should not claim Developer ID Installer signing");
  check(!signatureOutput.includes("Developer ID Application"), "local PKG should not claim Developer ID Application signing");

  const report = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    pkgSmokeReady: failures.length === 0,
    pkg: {
      path: relative(pkgPath),
      sha256: await sha256(pkgPath),
      bytes: pkgStats.size,
      identifier: pkgIdentifier,
      installLocation,
      signed: false
    },
    sourceApp: {
      path: relative(packagedApp),
      bundleId,
      signedAdHoc: true,
      developerIdSigned: false
    },
    requiredPayload,
    payloadFileCount: payloadFiles.length,
    packageInfoPath: relative(packageInfoPath),
    pkgExpandedRoot: relative(pkgExpandedRoot),
    realApplicationsInstallAttempted: false,
    pkgSignedWithDeveloperIdInstaller: false,
    developerIdInstallerClaimed: false,
    notarizationClaimed: false,
    staplingClaimed: false,
    gatekeeperApprovalClaimed: false,
    autoUpdateClaimed: false,
    releaseUploadAttempted: false,
    appStoreSubmissionAttempted: false,
    networkProbeAttempted: false,
    releaseGateClaimedExternalDistribution: false,
    privateValuesRecorded: false,
    releaseUrlValueRecorded: false,
    supportUrlValueRecorded: false,
    feedValueRecorded: false,
    credentialValueRecorded: false,
    tokenValueRecorded: false,
    channelValueRecorded: false,
    developerIdIdentityValueRecorded: false,
    localEnvValueRecorded: false
  };
  const markdown = buildMarkdown(report);
  const serializedReport = `${JSON.stringify(report, null, 2)}\n`;

  check(report.pkgSmokeReady === true, "PKG smoke report should be ready");
  check(report.pkg.signed === false, "PKG smoke should record unsigned package posture");
  check(report.realApplicationsInstallAttempted === false, "PKG smoke should not install into real Applications");
  check(report.pkgSignedWithDeveloperIdInstaller === false, "PKG smoke should not claim Developer ID Installer signing");
  check(report.releaseGateClaimedExternalDistribution === false, "PKG smoke should not claim external distribution completion");
  check(report.privateValuesRecorded === false, "PKG smoke should not record private values");
  check(!/https?:\/\//i.test(markdown), "PKG smoke Markdown should not include public or private URL values");
  check(!/https?:\/\//i.test(serializedReport), "PKG smoke JSON should not include public or private URL values");

  const combinedOutput = `${markdown}\n${serializedReport}`;
  for (const privateValue of privateEnvironmentValues()) {
    check(!combinedOutput.includes(privateValue), "PKG smoke should not include private environment values");
  }

  await writeFile(reportJsonPath, serializedReport, "utf8");
  await writeFile(reportMarkdownPath, markdown, "utf8");
  await rm(pkgExpandedRoot, { force: true, recursive: true });

  return report;
}

if (process.platform !== "darwin") {
  console.log("GrooveForge desktop PKG smoke skipped.");
  console.log(`- Scope: macOS PKG smoke is not available on ${process.platform}`);
  process.exit(0);
}

await createPkg();
const report = await inspectPkg();

if (failures.length > 0) {
  fail("Desktop PKG validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge desktop PKG smoke passed.");
console.log("- Scope: local unsigned macOS PKG creation, metadata inspection, payload listing, and value-free report");
console.log(`- PKG: ${report.pkg.path} (${report.pkg.bytes} bytes)`);
console.log(`- SHA-256: ${report.pkg.sha256}`);
console.log(`- Install location metadata: ${report.pkg.installLocation}`);
console.log(`- Payload files: ${report.payloadFileCount}`);
console.log("- Payload scope: required payload file listing for Info.plist, executable, GrooveForge icon, renderer HTML, Electron main, and preload");
console.log(`- Markdown: ${relative(reportMarkdownPath)}`);
console.log(`- JSON: ${relative(reportJsonPath)}`);
console.log("- Not claimed: real Applications install, Developer ID Installer signing, notarization, Gatekeeper approval, app-store submission, upload, or external distribution completion");
