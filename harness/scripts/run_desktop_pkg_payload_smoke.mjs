#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { constants, createReadStream, existsSync, readdirSync, readFileSync } from "node:fs";
import { access, lstat, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { macGuiLaunchAbortDetails, macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";
import { electronFrameworkDependencyReport, formatFrameworkDependencyRows } from "./desktop_bundle_dependency_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const pkgIdentifier = `${bundleId}.pkg`;
const installLocation = "/Applications";
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const pkgPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}.pkg`);
const pkgExpandedRoot = path.join(packageRoot, "pkg-payload-smoke-expanded");
const payloadRoot = path.join(packageRoot, "pkg-payload-smoke", "payload");
const reportJsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-pkg-payload-smoke.json`);
const reportMarkdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-pkg-payload-smoke.md`);
const resultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
// Keep the parent harness alive beyond the app's 1,800-second launch-smoke timeout.
const timeoutMs = 1820000;
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
  console.error("GrooveForge desktop PKG payload smoke failed:");
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
      reject(new Error(`${command} timed out after ${timeoutMs}ms\n${stdout}\n${stderr}`));
    }, timeoutMs);

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

async function directoryByteSize(filePath) {
  const stats = await lstat(filePath);
  if (!stats.isDirectory()) {
    return stats.size;
  }

  let total = stats.size;
  for (const entry of readdirSync(filePath)) {
    total += await directoryByteSize(path.join(filePath, entry));
  }
  return total;
}

function privateEnvironmentValues() {
  return privateEnvKeys.map((key) => process.env[key]?.trim()).filter((value) => value && value.length >= 8);
}

function parseSmokeResult(output) {
  const line = output
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(resultPrefix));

  if (!line) {
    return null;
  }

  try {
    return JSON.parse(line.slice(resultPrefix.length));
  } catch (error) {
    fail(`Could not parse extracted app launch smoke result JSON: ${error instanceof Error ? error.message : String(error)}`, line);
  }
}

async function readCodeSignatureDetails(appPath) {
  const display = await runCommand("codesign", ["--display", "--verbose=4", appPath]);
  return `${display.stdout}\n${display.stderr}`;
}

function findExtractedApp(searchRoot) {
  if (!existsSync(searchRoot)) {
    return null;
  }

  const entries = readdirSync(searchRoot, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const entryPath = path.join(searchRoot, entry.name);
    if (entry.isDirectory() && entry.name === `${appName}.app`) {
      return entryPath;
    }
  }

  for (const entry of entries) {
    const entryPath = path.join(searchRoot, entry.name);
    if (entry.isDirectory()) {
      const found = findExtractedApp(entryPath);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

function formatCheckRows(rows) {
  return rows.map((row) => `| ${escapeCell(row.label)} | ${row.present ? "yes" : "no"} | ${escapeCell(row.path)} |`).join("\n");
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} PKG Payload Smoke

## Status

- PKG payload smoke ready: ${report.pkgPayloadSmokeReady ? "yes" : "no"}
- PKG path: ${report.pkg.path}
- PKG bytes: ${report.pkg.bytes}
- PKG SHA-256: ${report.pkg.sha256}
- Package identifier: ${report.pkg.identifier}
- Install location metadata: ${report.pkg.installLocation}
- Payload root: ${report.payload.root}
- Extracted app: ${report.payload.extractedAppPath}
- Extracted app bytes: ${report.payload.extractedAppBytes}
- Launch title: ${report.launch.title}
- Launch visual: ${report.launch.visual.width}x${report.launch.visual.height}, ${report.launch.visual.pngBytes} PNG bytes, ${report.launch.visual.uniqueSampledColors} sampled colors
- Package signed: no
- Real Applications install attempted: no
- macOS Installer run attempted: no
- Developer ID Installer claimed: no
- Developer ID Application claimed: no
- Notarization claimed: no
- Gatekeeper approval claimed: no
- External distribution claimed: no
- Private values recorded: no

## Extracted App Checks

| check | present | path |
|---|---:|---|
${formatCheckRows(report.requiredPayload)}

## Dyld Framework Dependency Checks

| install name | referenced | present | code-signed | signature-compatible | dyld-loadable | candidate count | resolved path |
|---|---:|---:|---:|---:|---:|---:|---|
${formatFrameworkDependencyRows(report.frameworkDependencies.requiredDependencyRows)}

## Not Recorded

Release URLs, support URLs, feed URLs, credentials, tokens, Developer ID identity labels, channel values, private beats, and real user audio are not recorded.

## Not Claimed

This smoke expands a local unsigned PKG payload, extracts the bundled app under ignored build output, and launches that extracted app only through smoke mode. It does not run the macOS Installer, install into the real Applications directory, sign the PKG with Developer ID Installer, sign the app with Developer ID Application, notarize, staple, pass Gatekeeper, upload releases, publish update feeds, submit to an app store, probe remote channels, or claim external distribution completion.
`;
}

async function ensurePkgExists() {
  check(existsSync(pkgPath), "local GrooveForge PKG should exist; run npm run desktop:pkg-smoke first");
  if (!existsSync(pkgPath)) {
    fail("PKG payload smoke preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  const pkgStats = await stat(pkgPath);
  check(pkgStats.size > 10000000, `local GrooveForge PKG should be substantial, got ${pkgStats.size} bytes`);
  if (failures.length > 0) {
    fail("PKG payload smoke preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  return pkgStats;
}

async function expandPkgPayload() {
  await rm(pkgExpandedRoot, { force: true, recursive: true });
  await rm(path.dirname(payloadRoot), { force: true, recursive: true });
  await mkdir(payloadRoot, { recursive: true });

  await runCommand("pkgutil", ["--expand", pkgPath, pkgExpandedRoot]);
  const packageInfoPath = path.join(pkgExpandedRoot, "PackageInfo");
  const packageInfo = existsSync(packageInfoPath) ? await readFile(packageInfoPath, "utf8") : "";
  check(packageInfo.includes(`identifier="${pkgIdentifier}"`), `expanded PackageInfo should include ${pkgIdentifier}`);
  check(packageInfo.includes(`version="${packageJson.version}"`), `expanded PackageInfo should include version ${packageJson.version}`);
  check(packageInfo.includes(`install-location="${installLocation}"`), `expanded PackageInfo should include install location ${installLocation}`);

  const payloadArchive = path.join(pkgExpandedRoot, "Payload");
  check(existsSync(payloadArchive), "expanded PKG should include Payload archive");
  if (failures.length > 0) {
    fail("Expanded PKG validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  await runCommand("ditto", ["-x", "-z", payloadArchive, payloadRoot]);
  const extractedApp = findExtractedApp(payloadRoot);
  check(Boolean(extractedApp), "extracted PKG payload should contain GrooveForge.app");
  if (!extractedApp) {
    fail("Could not find extracted GrooveForge.app.", `Payload root: ${relative(payloadRoot)}`);
  }

  return { packageInfoPath, packageInfo, payloadArchive, extractedApp };
}

async function checkExtractedApp(extractedApp) {
  const extractedExecutable = path.join(extractedApp, "Contents", "MacOS", appName);
  const extractedAppRoot = path.join(extractedApp, "Contents", "Resources", "app");
  const appStats = await lstat(extractedApp).catch(() => null);
  check(appStats?.isDirectory(), "extracted GrooveForge.app should be an app directory");
  await access(extractedExecutable, constants.X_OK).catch(() => failures.push("extracted GrooveForge executable should be executable"));

  const requiredPayload = [
    { label: "App Info.plist", path: path.join(extractedApp, "Contents", "Info.plist") },
    { label: "App executable", path: extractedExecutable },
    { label: "GrooveForge icon", path: path.join(extractedApp, "Contents", "Resources", "GrooveForge.icns") },
    { label: "Renderer HTML", path: path.join(extractedAppRoot, "dist", "index.html") },
    { label: "Electron main", path: path.join(extractedAppRoot, "dist-electron", "main.js") },
    { label: "Electron preload", path: path.join(extractedAppRoot, "dist-electron", "preload.cjs") },
    { label: "Squirrel framework binary", path: path.join(extractedApp, "Contents", "Frameworks", "Squirrel.framework", "Squirrel") }
  ].map((item) => ({ ...item, present: existsSync(item.path), path: relative(item.path) }));
  check(requiredPayload.every((item) => item.present), "extracted app should include required GrooveForge app files");
  check(!existsSync(path.join(extractedApp, "Contents", "Resources", "electron.icns")), "extracted app should not contain electron.icns");

  const plist = existsSync(path.join(extractedApp, "Contents", "Info.plist"))
    ? await readFile(path.join(extractedApp, "Contents", "Info.plist"), "utf8")
    : "";
  check(plist.includes(`<string>${appName}</string>`), "extracted app Info.plist should brand the app as GrooveForge");
  check(plist.includes(`<string>${bundleId}</string>`), `extracted app Info.plist should use ${bundleId}`);
  check(plist.includes("<string>GrooveForge.icns</string>"), "extracted app Info.plist should use GrooveForge.icns");

  const signatureDetails = await readCodeSignatureDetails(extractedApp);
  check(signatureDetails.includes(`Identifier=${bundleId}`), `extracted app ad-hoc signature should preserve ${bundleId}`);
  check(signatureDetails.includes("Signature=adhoc"), "extracted app should retain ad-hoc signature");
  check(!signatureDetails.includes("Authority=Developer ID"), "extracted app should not claim Developer ID authority");

  const frameworkDependencies = await electronFrameworkDependencyReport(extractedApp, { root, timeoutMs });
  check(frameworkDependencies.otoolReady, "extracted app Electron Framework dependency scan should run");
  check(frameworkDependencies.otoolLoadCommandsReady, "extracted app Electron Framework rpath scan should run");
  check(frameworkDependencies.appExecutableLoadCommandsReady, "extracted app executable rpath scan should run");
  check(frameworkDependencies.rpathScansReady, "extracted app Electron dyld rpath scans should run");
  check(
    frameworkDependencies.allRequiredDependenciesReferenced,
    "extracted app Electron Framework should reference Squirrel, ReactiveObjC, and Mantle through @rpath"
  );
  check(
    frameworkDependencies.allRequiredDependenciesPresent,
    "extracted app should include every @rpath Electron runtime framework dependency, including Squirrel.framework/Squirrel"
  );
  check(
    frameworkDependencies.allRequiredDependenciesCodeSigned,
    "extracted app Electron runtime framework dependencies should pass codesign --verify --strict before launch"
  );
  check(
    frameworkDependencies.allRequiredDependenciesSignatureCompatible,
    "extracted app Electron runtime framework dependencies should be signature-compatible with the app bundle before launch"
  );
  check(
    frameworkDependencies.allRequiredDependenciesDyldLoadable,
    "extracted app Electron runtime framework dependencies should be dyld-loadable through @rpath before launch"
  );

  return { extractedExecutable, extractedAppRoot, requiredPayload, frameworkDependencies };
}

async function launchExtractedApp(extractedExecutable, extractedAppRoot) {
  const blockDetails = macGuiLaunchBlockDetails("npm run desktop:pkg-payload-smoke");
  if (blockDetails) {
    fail("Refusing to start extracted Electron in a restricted macOS GUI context.", blockDetails);
  }

  const env = {
    ...process.env,
    GROOVEFORGE_DESKTOP_LAUNCH_SMOKE: "1",
    NO_COLOR: "1"
  };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.VITE_DEV_SERVER_URL;

  return await new Promise((resolve) => {
    const child = spawn(extractedExecutable, [], {
      cwd: extractedAppRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"]
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
      fail("Timed out waiting for extracted Electron app launch smoke to exit.", `${stdout}\n${stderr}`);
    }, timeoutMs);

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
      fail(`Could not start extracted Electron app: ${error.message}`);
    });
    child.on("exit", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      const combinedOutput = `${stdout}\n${stderr}`;
      const result = parseSmokeResult(combinedOutput);
      if (!result) {
        fail(
          `Extracted app exited without a launch smoke result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
          macGuiLaunchAbortDetails("npm run desktop:pkg-payload-smoke", { code, signal, output: combinedOutput })
        );
      }
      if (code !== 0 || result.ok !== true) {
        fail(
          `extracted app launch smoke returned a failing result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
          JSON.stringify(result, null, 2)
        );
      }
      resolve(result);
    });
  });
}

function checkLaunchResult(result) {
  check(result?.evidence?.title === appName, "extracted app document title should be GrooveForge");
  check(result?.evidence?.appKind === "desktop", "extracted app preload bridge should expose appKind desktop");
  check(result?.evidence?.hasSaveProject === true, "extracted app preload bridge should expose saveProject");
  check(result?.evidence?.hasOpenProject === true, "extracted app preload bridge should expose openProject");
  check(result?.evidence?.rootChildCount > 0, "extracted app should mount React under #root");
  check(result?.evidence?.samplingTextPresent === false, "extracted app first-run surface should not expose sampling-first language");
  check(result?.evidence?.visual?.pngBytes > 50000, "extracted app screenshot PNG should be substantial");
  check(result?.evidence?.visual?.uniqueSampledColors >= 24, "extracted app screenshot should have visible color diversity");
}

async function writeReport({ pkgStats, packageInfoPath, payloadArchive, extractedApp, extractedExecutable, requiredPayload, frameworkDependencies, launchResult }) {
  const extractedAppBytes = await directoryByteSize(extractedApp);
  const report = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    pkgPayloadSmokeReady: failures.length === 0,
    pkg: {
      path: relative(pkgPath),
      sha256: await sha256(pkgPath),
      bytes: pkgStats.size,
      identifier: pkgIdentifier,
      installLocation,
      signed: false
    },
    payload: {
      root: relative(payloadRoot),
      archive: relative(payloadArchive),
      extractedAppPath: relative(extractedApp),
      extractedExecutablePath: relative(extractedExecutable),
      extractedAppBytes,
      packageInfoPath: relative(packageInfoPath),
      extractedUnderIgnoredBuildOutput: true
    },
    requiredPayload,
    frameworkDependencies,
    launch: {
      title: launchResult.evidence.title,
      appKind: launchResult.evidence.appKind,
      hasSaveProject: launchResult.evidence.hasSaveProject,
      hasOpenProject: launchResult.evidence.hasOpenProject,
      rootChildCount: launchResult.evidence.rootChildCount,
      samplingTextPresent: launchResult.evidence.samplingTextPresent,
      visual: launchResult.evidence.visual
    },
    realApplicationsInstallAttempted: false,
    pkgInstallerRunAttempted: false,
    pkgSignedWithDeveloperIdInstaller: false,
    developerIdInstallerClaimed: false,
    developerIdApplicationClaimed: false,
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

  check(report.pkgPayloadSmokeReady === true, "PKG payload smoke report should be ready");
  check(report.frameworkDependencies.allRequiredDependenciesPresent === true, "PKG payload smoke should prove Electron framework dependencies are present");
  check(report.frameworkDependencies.allRequiredDependenciesCodeSigned === true, "PKG payload smoke should prove Electron framework dependencies pass strict code-sign verification");
  check(
    report.frameworkDependencies.allRequiredDependenciesSignatureCompatible === true,
    "PKG payload smoke should prove Electron framework dependencies are signature-compatible with the app bundle"
  );
  check(report.frameworkDependencies.allRequiredDependenciesDyldLoadable === true, "PKG payload smoke should prove Electron framework dependencies are dyld-loadable through @rpath");
  check(report.pkg.signed === false, "PKG payload smoke should record unsigned package posture");
  check(report.realApplicationsInstallAttempted === false, "PKG payload smoke should not install into real Applications");
  check(report.pkgInstallerRunAttempted === false, "PKG payload smoke should not run macOS Installer");
  check(report.pkgSignedWithDeveloperIdInstaller === false, "PKG payload smoke should not claim Developer ID Installer signing");
  check(report.developerIdApplicationClaimed === false, "PKG payload smoke should not claim Developer ID Application signing");
  check(report.releaseGateClaimedExternalDistribution === false, "PKG payload smoke should not claim external distribution completion");
  check(report.privateValuesRecorded === false, "PKG payload smoke should not record private values");
  check(!/https?:\/\//i.test(markdown), "PKG payload smoke Markdown should not include public or private URL values");
  check(!/https?:\/\//i.test(serializedReport), "PKG payload smoke JSON should not include public or private URL values");

  const combinedOutput = `${markdown}\n${serializedReport}`;
  for (const privateValue of privateEnvironmentValues()) {
    check(!combinedOutput.includes(privateValue), "PKG payload smoke should not include private environment values");
  }

  if (failures.length > 0) {
    fail("PKG payload report validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  await writeFile(reportJsonPath, serializedReport, "utf8");
  await writeFile(reportMarkdownPath, markdown, "utf8");

  return report;
}

if (process.platform !== "darwin") {
  console.log("GrooveForge desktop PKG payload smoke skipped.");
  console.log(`- Scope: macOS PKG payload extraction smoke is not available on ${process.platform}`);
  process.exit(0);
}

const pkgStats = await ensurePkgExists();
const { packageInfoPath, payloadArchive, extractedApp } = await expandPkgPayload();
const { extractedExecutable, extractedAppRoot, requiredPayload, frameworkDependencies } = await checkExtractedApp(extractedApp);
if (failures.length > 0) {
  fail("Extracted app validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const launchResult = await launchExtractedApp(extractedExecutable, extractedAppRoot);
checkLaunchResult(launchResult);
if (failures.length > 0) {
  fail("Extracted app launch evidence validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const report = await writeReport({ pkgStats, packageInfoPath, payloadArchive, extractedApp, extractedExecutable, requiredPayload, frameworkDependencies, launchResult });

console.log("GrooveForge desktop PKG payload smoke passed.");
console.log("- Scope: local unsigned macOS PKG payload extraction, extracted app validation, and extracted app launch smoke");
console.log(`- PKG: ${report.pkg.path} (${report.pkg.bytes} bytes)`);
console.log(`- SHA-256: ${report.pkg.sha256}`);
console.log(`- Extracted app: ${report.payload.extractedAppPath}`);
console.log(
  `- Framework dependencies: ${report.frameworkDependencies.presentDependencyCount}/${report.frameworkDependencies.requiredDependencyCount} present, ${report.frameworkDependencies.signatureVerifiedDependencyCount}/${report.frameworkDependencies.requiredDependencyCount} code-signed, ${report.frameworkDependencies.signatureCompatibleDependencyCount}/${report.frameworkDependencies.requiredDependencyCount} signature-compatible`
);
console.log(
  `- Dyld framework loadability: ${report.frameworkDependencies.dyldLoadableDependencyCount}/${report.frameworkDependencies.requiredDependencyCount} loadable via ${report.frameworkDependencies.rpathCount} dyld rpaths`
);
console.log(`- Visual: ${report.launch.visual.width}x${report.launch.visual.height}, ${report.launch.visual.pngBytes} PNG bytes, ${report.launch.visual.uniqueSampledColors} sampled colors`);
console.log(`- Markdown: ${relative(reportMarkdownPath)}`);
console.log(`- JSON: ${relative(reportJsonPath)}`);
console.log("- Not claimed: real Applications install, macOS Installer run, Developer ID Installer signing, Developer ID Application signing, notarization, Gatekeeper approval, app-store submission, upload, or external distribution completion");
