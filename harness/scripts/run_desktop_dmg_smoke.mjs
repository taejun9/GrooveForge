#!/usr/bin/env node

import { spawn } from "node:child_process";
import { constants, existsSync, readdirSync, readFileSync } from "node:fs";
import { access, cp, lstat, mkdir, readFile, rm, stat, symlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const packageRoot = path.join(root, "build", "desktop", `${appName}-${process.platform}-${process.arch}`);
const packagedApp = path.join(packageRoot, `${appName}.app`);
const dmgStage = path.join(packageRoot, "dmg-stage");
const dmgMount = path.join(packageRoot, "dmg-mount");
const dmgPath = path.join(packageRoot, `${appName}-${packageJson.version}-${process.platform}-${process.arch}.dmg`);
const commandTimeoutMs = 120000;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop DMG smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
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
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(" ")} failed with code ${code ?? "null"} signal ${signal ?? "null"}\n${stdout}\n${stderr}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function detachMountIfNeeded() {
  if (!existsSync(dmgMount)) {
    return;
  }

  await runCommand("hdiutil", ["detach", dmgMount, "-force"]).catch(() => undefined);
}

async function createDmg() {
  check(existsSync(packagedApp), "packaged GrooveForge.app should exist; run npm run desktop:package-smoke first");
  check(existsSync(path.join(packagedApp, "Contents", "Resources", "GrooveForge.icns")), "packaged app should include GrooveForge.icns before DMG creation");
  check(!existsSync(path.join(packagedApp, "Contents", "Resources", "electron.icns")), "packaged app should not include electron.icns before DMG creation");
  if (failures.length > 0) {
    fail("Packaged app preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  await detachMountIfNeeded();
  await rm(dmgStage, { force: true, recursive: true });
  await rm(dmgMount, { force: true, recursive: true });
  await rm(dmgPath, { force: true });
  await mkdir(dmgStage, { recursive: true });
  await mkdir(dmgMount, { recursive: true });
  await cp(packagedApp, path.join(dmgStage, `${appName}.app`), { recursive: true, verbatimSymlinks: true });
  await symlink("/Applications", path.join(dmgStage, "Applications"), "dir");

  await runCommand("hdiutil", [
    "create",
    "-volname",
    appName,
    "-srcfolder",
    dmgStage,
    "-ov",
    "-format",
    "UDZO",
    dmgPath
  ]);
}

async function checkDmgFile() {
  check(existsSync(dmgPath), "local unsigned GrooveForge DMG should exist");
  const dmgStats = await stat(dmgPath);
  check(dmgStats.size > 10000000, `local unsigned GrooveForge DMG should be substantial, got ${dmgStats.size} bytes`);

  const imageInfo = await runCommand("hdiutil", ["imageinfo", dmgPath]);
  check(imageInfo.stdout.includes("Format: UDZO"), "DMG imageinfo should report UDZO format");
  check(path.basename(dmgPath).startsWith(`${appName}-${packageJson.version}`), "local unsigned GrooveForge DMG file name should include app name and version");
  return dmgStats.size;
}

async function checkMountedDmg() {
  await detachMountIfNeeded();
  await runCommand("hdiutil", ["attach", dmgPath, "-readonly", "-nobrowse", "-mountpoint", dmgMount]);

  try {
    const entries = readdirSync(dmgMount).filter((entry) => !entry.startsWith(".")).sort();
    check(entries.includes(`${appName}.app`), "mounted DMG should contain GrooveForge.app");
    check(entries.includes("Applications"), "mounted DMG should contain an Applications shortcut");
    check(
      entries.every((entry) => entry === `${appName}.app` || entry === "Applications"),
      `mounted DMG should not contain unrelated payloads: ${entries.join(", ")}`
    );

    const appPath = path.join(dmgMount, `${appName}.app`);
    const appStats = await lstat(appPath);
    check(appStats.isDirectory(), "mounted GrooveForge.app should be an app directory");
    await access(path.join(appPath, "Contents", "MacOS", appName), constants.X_OK).catch(() =>
      failures.push("mounted GrooveForge executable should be executable")
    );
    const appShortcut = await lstat(path.join(dmgMount, "Applications"));
    check(appShortcut.isSymbolicLink(), "mounted Applications entry should be a symlink");

    const plist = await readFile(path.join(appPath, "Contents", "Info.plist"), "utf8");
    check(plist.includes(`<string>${appName}</string>`), "mounted app Info.plist should brand the app as GrooveForge");
    check(plist.includes(`<string>${bundleId}</string>`), `mounted app Info.plist should use ${bundleId}`);
    check(plist.includes("<string>GrooveForge.icns</string>"), "mounted app Info.plist should use GrooveForge.icns");
    check(!existsSync(path.join(appPath, "Contents", "Resources", "electron.icns")), "mounted app should not contain electron.icns");
    check(existsSync(path.join(appPath, "Contents", "Resources", "app", "dist", "index.html")), "mounted app should include packaged dist/index.html");
    check(existsSync(path.join(appPath, "Contents", "Resources", "app", "dist-electron", "main.js")), "mounted app should include packaged dist-electron/main.js");
  } finally {
    await detachMountIfNeeded();
  }
}

if (process.platform !== "darwin") {
  console.log("GrooveForge desktop DMG smoke skipped.");
  console.log(`- Scope: macOS unsigned DMG smoke is not available on ${process.platform}`);
  process.exit(0);
}

await createDmg();
const dmgBytes = await checkDmgFile();
await checkMountedDmg();
await rm(dmgStage, { force: true, recursive: true });
await rm(dmgMount, { force: true, recursive: true });

if (failures.length > 0) {
  fail("Desktop DMG validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge desktop DMG smoke passed.");
console.log("- Scope: local unsigned macOS DMG creation, image metadata, mounted contents, and branded app payload");
console.log(`- DMG: ${path.relative(root, dmgPath)} (${dmgBytes} bytes)`);
console.log(`- Contents: ${appName}.app plus Applications shortcut`);
console.log("- Not claimed: code signing, notarization, auto-update, app-store submission, or external distribution-channel QA");
