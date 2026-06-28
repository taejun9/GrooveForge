#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const packagedApp = path.join(packageRoot, `${appName}.app`);
const dmgPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}.dmg`);
const pkgPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}.pkg`);
const manifestPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-release-manifest.json`);
const requiredRuntimeEntitlements = [
  "com.apple.security.cs.allow-jit",
  "com.apple.security.cs.allow-unsigned-executable-memory",
  "com.apple.security.cs.disable-library-validation"
];
const failures = [];
const commandTimeoutMs = 60000;

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop release manifest smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
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

async function fileEvidence(filePath, label) {
  check(existsSync(filePath), `${label} should exist`);
  if (!existsSync(filePath)) {
    return null;
  }

  const fileStats = await stat(filePath);
  check(fileStats.size > 0, `${label} should not be empty`);
  return {
    path: relative(filePath),
    sha256: await sha256(filePath),
    bytes: fileStats.size
  };
}

function countFilesAndBytes(dirPath) {
  let files = 0;
  let bytes = 0;
  const entries = readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isSymbolicLink()) {
      files += 1;
      continue;
    }
    if (entry.isDirectory()) {
      const child = countFilesAndBytes(entryPath);
      files += child.files;
      bytes += child.bytes;
      continue;
    }
    if (entry.isFile()) {
      files += 1;
      bytes += statSync(entryPath).size;
    }
  }

  return { bytes, files };
}

function readPlistString(plist, key) {
  const match = plist.match(new RegExp(`<key>${key}</key>\\s*<string>([^<]+)</string>`));
  return match?.[1] ?? null;
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, NO_COLOR: "1" },
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
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} failed with code ${code ?? "null"} signal ${signal ?? "null"}\n${stdout}\n${stderr}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function readCodeSignatureDetails(appPath) {
  try {
    const display = await runCommand("codesign", ["--display", "--verbose=4", appPath]);
    return `${display.stdout}\n${display.stderr}`;
  } catch (error) {
    fail(
      "Could not read app code signature details; run npm run desktop:adhoc-sign-smoke before release manifest smoke.",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function readCodeSignatureEntitlements(appPath) {
  try {
    const display = await runCommand("codesign", ["--display", "--entitlements", ":-", appPath]);
    return `${display.stdout}\n${display.stderr}`;
  } catch (error) {
    fail(
      "Could not read app code signature entitlements; run npm run desktop:adhoc-sign-smoke before release manifest smoke.",
      error instanceof Error ? error.message : String(error)
    );
  }
}

function signatureEvidence(details) {
  const flagsLine = details
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("CodeDirectory") && line.includes("flags="));

  return {
    identifier: details.match(/Identifier=([^\n]+)/)?.[1] ?? null,
    flagsLine: flagsLine ?? null,
    hasRuntimeFlag: /\bflags=[^\n]*\bruntime\b/.test(flagsLine ?? ""),
    isAdHoc: details.includes("Signature=adhoc") || /\bflags=[^\n]*\badhoc\b/.test(flagsLine ?? ""),
    hasDeveloperIdAuthority: details.includes("Authority=Developer ID")
  };
}

async function createManifest() {
  if (process.platform !== "darwin") {
    return {
      appName,
      version: packageJson.version,
      platform: process.platform,
      arch: process.arch,
      skipped: true,
      reason: "macOS release artifact manifest smoke is not available on this platform"
    };
  }

  check(existsSync(packagedApp), "packaged GrooveForge.app should exist before release manifest smoke");
  check(existsSync(dmgPath), "local GrooveForge DMG should exist before release manifest smoke");
  check(existsSync(pkgPath), "local GrooveForge PKG should exist before release manifest smoke");
  if (failures.length > 0) {
    fail("Release artifact preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  const infoPlistPath = path.join(packagedApp, "Contents", "Info.plist");
  const executablePath = path.join(packagedApp, "Contents", "MacOS", appName);
  const iconPath = path.join(packagedApp, "Contents", "Resources", "GrooveForge.icns");
  const packagedPackageJsonPath = path.join(packagedApp, "Contents", "Resources", "app", "package.json");
  const rendererIndexPath = path.join(packagedApp, "Contents", "Resources", "app", "dist", "index.html");
  const mainPath = path.join(packagedApp, "Contents", "Resources", "app", "dist-electron", "main.js");
  const preloadPath = path.join(packagedApp, "Contents", "Resources", "app", "dist-electron", "preload.cjs");
  const infoPlist = await readFile(infoPlistPath, "utf8");
  const appStats = countFilesAndBytes(packagedApp);
  const codeSignatureDetails = await readCodeSignatureDetails(packagedApp);
  const codeSignatureEntitlements = await readCodeSignatureEntitlements(packagedApp);
  const signature = signatureEvidence(codeSignatureDetails);
  const isAdHocSigned = signature.isAdHoc;
  const runtimeEntitlements = Object.fromEntries(
    requiredRuntimeEntitlements.map((entitlement) => [entitlement, codeSignatureEntitlements.includes(entitlement)])
  );

  return {
    appName,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    distributionScope: "local ad-hoc signed macOS artifacts",
    signing: {
      adHocCodeSigningClaimed: isAdHocSigned,
      developerIdCodeSigningClaimed: false,
      notarizationClaimed: false,
      autoUpdateClaimed: false,
      externalDistributionChannelQaClaimed: false,
      signatureKind: isAdHocSigned ? "ad-hoc" : "unverified",
      identifier: signature.identifier,
      hardenedRuntimeFlagPresent: signature.hasRuntimeFlag,
      flagsLine: signature.flagsLine,
      developerIdAuthorityPresent: signature.hasDeveloperIdAuthority,
      runtimeEntitlements
    },
    appBundle: {
      path: relative(packagedApp),
      bundleIdentifier: readPlistString(infoPlist, "CFBundleIdentifier"),
      bundleName: readPlistString(infoPlist, "CFBundleName"),
      bundleDisplayName: readPlistString(infoPlist, "CFBundleDisplayName"),
      bundleExecutable: readPlistString(infoPlist, "CFBundleExecutable"),
      iconFile: readPlistString(infoPlist, "CFBundleIconFile"),
      category: readPlistString(infoPlist, "LSApplicationCategoryType"),
      files: appStats.files,
      bytes: appStats.bytes,
      payloads: {
        infoPlist: await fileEvidence(infoPlistPath, "packaged Info.plist"),
        executable: await fileEvidence(executablePath, "packaged executable"),
        icon: await fileEvidence(iconPath, "packaged GrooveForge.icns"),
        packageJson: await fileEvidence(packagedPackageJsonPath, "packaged package.json"),
        rendererIndex: await fileEvidence(rendererIndexPath, "packaged renderer index"),
        electronMain: await fileEvidence(mainPath, "packaged Electron main"),
        electronPreload: await fileEvidence(preloadPath, "packaged Electron preload")
      }
    },
    dmg: await fileEvidence(dmgPath, "local GrooveForge DMG"),
    pkg: await fileEvidence(pkgPath, "local GrooveForge PKG")
  };
}

function validateManifest(manifest) {
  if (manifest.skipped) {
    return;
  }

  check(manifest.appName === appName, "release manifest should identify GrooveForge");
  check(manifest.version === packageJson.version, "release manifest should match package version");
  check(manifest.platform === process.platform, "release manifest should record current platform");
  check(manifest.arch === process.arch, "release manifest should record current arch");
  check(manifest.distributionScope === "local ad-hoc signed macOS artifacts", "release manifest should record local ad-hoc signed distribution scope");
  check(manifest.signing.adHocCodeSigningClaimed === true, "release manifest should claim only local ad-hoc code signing");
  check(manifest.signing.developerIdCodeSigningClaimed === false, "release manifest should not claim Developer ID code signing");
  check(manifest.signing.notarizationClaimed === false, "release manifest should not claim notarization");
  check(manifest.signing.autoUpdateClaimed === false, "release manifest should not claim auto-update");
  check(manifest.signing.externalDistributionChannelQaClaimed === false, "release manifest should not claim external distribution-channel QA");
  check(manifest.signing.signatureKind === "ad-hoc", "release manifest should record ad-hoc signature kind");
  check(manifest.signing.identifier === bundleId, `release manifest signing identifier should use ${bundleId}`);
  check(manifest.signing.hardenedRuntimeFlagPresent === true, "release manifest should record the local hardened runtime signing flag");
  check(manifest.signing.developerIdAuthorityPresent === false, "release manifest should not record Developer ID authority");
  for (const entitlement of requiredRuntimeEntitlements) {
    check(manifest.signing.runtimeEntitlements?.[entitlement] === true, `release manifest should record ${entitlement}`);
  }
  check(manifest.appBundle.bundleIdentifier === bundleId, `release manifest should use ${bundleId}`);
  check(manifest.appBundle.bundleName === appName, "release manifest should use GrooveForge bundle name");
  check(manifest.appBundle.bundleExecutable === appName, "release manifest should use GrooveForge executable");
  check(manifest.appBundle.iconFile === "GrooveForge.icns", "release manifest should use GrooveForge.icns");
  check(manifest.appBundle.category === "public.app-category.music", "release manifest should use music app category");
  check(manifest.appBundle.files >= 250, `release manifest should count a substantial app payload, got ${manifest.appBundle.files} files`);
  check(manifest.appBundle.bytes > 100000000, `release manifest should count substantial app bytes, got ${manifest.appBundle.bytes}`);
  check(manifest.dmg?.path.endsWith(`.dmg`), "release manifest should include a DMG path");
  check(manifest.dmg?.bytes > 10000000, `release manifest should include substantial DMG bytes, got ${manifest.dmg?.bytes}`);
  check(manifest.pkg?.path.endsWith(`.pkg`), "release manifest should include a PKG path");
  check(manifest.pkg?.bytes > 10000000, `release manifest should include substantial PKG bytes, got ${manifest.pkg?.bytes}`);

  for (const [label, payload] of Object.entries(manifest.appBundle.payloads)) {
    check(payload && typeof payload === "object", `release manifest should include ${label} payload evidence`);
    check(/^[a-f0-9]{64}$/.test(payload?.sha256 ?? ""), `${label} should have a SHA-256 checksum`);
    check(payload?.bytes > 0, `${label} should have byte size evidence`);
  }
  check(/^[a-f0-9]{64}$/.test(manifest.dmg?.sha256 ?? ""), "DMG should have a SHA-256 checksum");
  check(/^[a-f0-9]{64}$/.test(manifest.pkg?.sha256 ?? ""), "PKG should have a SHA-256 checksum");
  check(!existsSync(path.join(packagedApp, "Contents", "Resources", "electron.icns")), "release manifest smoke should reject electron.icns in the packaged app");
}

const manifest = await createManifest();
await mkdir(packageRoot, { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
validateManifest(manifest);

if (failures.length > 0) {
  fail("Release manifest validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

if (manifest.skipped) {
  console.log("GrooveForge desktop release manifest smoke skipped.");
  console.log(`- Scope: ${manifest.reason}`);
  process.exit(0);
}

console.log("GrooveForge desktop release manifest smoke passed.");
console.log("- Scope: local release artifact manifest, SHA-256 checksums, bundle metadata, ad-hoc signing, hardened runtime flag evidence, and runtime entitlement evidence");
console.log(`- Manifest: ${relative(manifestPath)}`);
console.log(`- DMG: ${manifest.dmg.path}, ${manifest.dmg.bytes} bytes, sha256 ${manifest.dmg.sha256.slice(0, 12)}...`);
console.log(`- PKG: ${manifest.pkg.path}, ${manifest.pkg.bytes} bytes, sha256 ${manifest.pkg.sha256.slice(0, 12)}...`);
console.log(`- App payload: ${manifest.appBundle.files} files, ${manifest.appBundle.bytes} bytes, ${manifest.appBundle.bundleIdentifier}`);
console.log(`- Hardened runtime flag: ${manifest.signing.hardenedRuntimeFlagPresent ? "yes" : "no"}`);
console.log(`- Runtime entitlements: ${Object.entries(manifest.signing.runtimeEntitlements).filter(([, enabled]) => enabled).length}/${requiredRuntimeEntitlements.length}`);
console.log("- Not claimed: Developer ID signing, notarization, auto-update, app-store submission, or external distribution-channel QA");
