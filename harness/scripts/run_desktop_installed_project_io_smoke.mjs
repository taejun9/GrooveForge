#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const installedApp = path.join(packageRoot, "install-smoke", "Applications", `${appName}.app`);
const installedAppRoot = path.join(installedApp, "Contents", "Resources", "app");
const installedExecutable = path.join(installedApp, "Contents", "MacOS", appName);
const smokeRoot = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-installed-project-io-smoke`);
const sourcePath = path.join(smokeRoot, "installed-project-io-source.grooveforge.json");
const targetPath = path.join(smokeRoot, "installed-project-io-smoke-beat.grooveforge.json");
const reportJsonPath = path.join(smokeRoot, `${appName}-${packageJson.version}-${platformArch}-installed-project-io-smoke.json`);
const reportMarkdownPath = path.join(smokeRoot, `${appName}-${packageJson.version}-${platformArch}-installed-project-io-smoke.md`);
const resultPrefix = "GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE_RESULT ";
const timeoutMs = 120000;
const failures = [];

const workstation = await import("../../src/domain/workstation.ts");

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge installed project IO smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex");
}

function checkNoSamplingText(text, label) {
  check(!/AudioClipEvent|\bsampler\b|sample import|audio clip|sample chopping|imported audio/i.test(text), `${label} should stay sample-free and not mention optional sampling scope`);
}

async function checkInstalledArtifacts() {
  if (process.platform !== "darwin") {
    console.log("GrooveForge installed project IO smoke skipped.");
    console.log(`- Scope: installed macOS app project IO smoke is not available on ${process.platform}`);
    process.exit(0);
  }

  check(existsSync(installedApp), "simulated installed GrooveForge.app is missing; run npm run desktop:install-smoke before installed project IO smoke");
  check(existsSync(installedExecutable), "simulated installed GrooveForge executable is missing; run npm run desktop:install-smoke before installed project IO smoke");
  await access(installedExecutable, constants.X_OK).catch(() => failures.push("simulated installed GrooveForge executable should be executable"));
  check(existsSync(path.join(installedAppRoot, "dist", "index.html")), "installed app should include dist/index.html");
  check(existsSync(path.join(installedAppRoot, "dist-electron", "main.js")), "installed app should include dist-electron/main.js");
  check(existsSync(path.join(installedAppRoot, "dist-electron", "preload.cjs")), "installed app should include dist-electron/preload.cjs");
  check(existsSync(path.join(installedApp, "Contents", "Info.plist")), "installed app should include Info.plist");
  check(existsSync(path.join(installedApp, "Contents", "Resources", "GrooveForge.icns")), "installed app should include GrooveForge.icns");
  check(!existsSync(path.join(installedApp, "Contents", "Resources", "electron.icns")), "installed app should not include Electron default icon");
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
    fail(`Could not parse installed project IO smoke result JSON: ${error instanceof Error ? error.message : String(error)}`, line);
  }
}

function buildProject() {
  const blueprintProject = workstation.applyBeatBlueprint(workstation.starterProject, "seoul_pocket");
  const targetProject = workstation.applyDeliveryTarget(blueprintProject, "beat_store");
  return {
    ...targetProject,
    title: "Installed Project IO Smoke Beat",
    mode: "studio",
    arrangement: workstation.createPatternChain("eight_bar"),
    sessionBrief: {
      artist: "Installed desktop producer",
      vibe: "installed app project IO proof",
      reference: "built-in instruments",
      notes: "Saved and reopened through the simulated installed GrooveForge app copy."
    },
    snapshots: []
  };
}

function buildReport(project, result, sourceContents, savedContents) {
  const target = workstation.activeDeliveryTarget(project);
  return {
    appName,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    installedAppPath: relative(installedApp),
    installedExecutablePath: relative(installedExecutable),
    sourcePath: relative(sourcePath),
    targetPath: relative(targetPath),
    reportJsonPath: relative(reportJsonPath),
    reportMarkdownPath: relative(reportMarkdownPath),
    productScope: "sample-free simulated installed desktop project save/open from editable GrooveForge events",
    project: {
      title: project.title,
      mode: project.mode,
      styleId: project.styleId,
      bpm: project.bpm,
      key: project.key,
      arrangementBars: workstation.arrangementTotalBars(project),
      deliveryTarget: target.name,
      masterPreset: project.masterPreset
    },
    electronEvidence: result.evidence,
    sourceBytes: Buffer.byteLength(sourceContents, "utf8"),
    savedBytes: Buffer.byteLength(savedContents, "utf8"),
    sourceSha256: sha256(sourceContents),
    savedSha256: sha256(savedContents),
    installedNativeSaveReady: true,
    installedNativeOpenReady: true,
    installedProjectRoundtripReady: true,
    installedProjectIoReady: true,
    localEnvValueRecorded: false,
    privateValuesRecorded: false,
    privateBeatRecorded: false,
    realUserAudioRecorded: false,
    networkProbeAttempted: false,
    releaseUploadAttempted: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedAutoUpdate: false,
    releaseGateClaimedManualQaApproval: false,
    releaseGateClaimedExternalDistribution: false
  };
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Installed Project IO Smoke

## Status

- Installed project IO ready: ${report.installedProjectIoReady ? "yes" : "no"}
- Product scope: ${report.productScope}
- Installed app: \`${report.installedAppPath}\`
- Installed executable: \`${report.installedExecutablePath}\`
- Source path: \`${report.sourcePath}\`
- Saved path: \`${report.targetPath}\`
- Project: ${report.project.title}
- Style: ${report.project.styleId}
- BPM/key: ${report.project.bpm} / ${report.project.key}
- Arrangement: ${report.project.arrangementBars} bars
- Delivery target: ${report.project.deliveryTarget}
- Source bytes: ${report.sourceBytes}
- Saved bytes: ${report.savedBytes}
- Source SHA-256: \`${report.sourceSha256.slice(0, 16)}...\`
- Saved SHA-256: \`${report.savedSha256.slice(0, 16)}...\`

## Installed Native Bridge Checks

- Installed native save ready: ${report.installedNativeSaveReady ? "yes" : "no"}
- Installed native open ready: ${report.installedNativeOpenReady ? "yes" : "no"}
- Installed project roundtrip ready: ${report.installedProjectRoundtripReady ? "yes" : "no"}
- Preload bridge present: ${report.electronEvidence.hasPreloadBridge ? "yes" : "no"}
- Save bridge present: ${report.electronEvidence.hasSaveProject ? "yes" : "no"}
- Open bridge present: ${report.electronEvidence.hasOpenProject ? "yes" : "no"}
- Contents matched: ${report.electronEvidence.openResult.contentsMatched ? "yes" : "no"}

## Not Recorded

Private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, and local env values are not recorded.

## Not Claimed

This installed project IO smoke does not claim a real /Applications install, Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function runInstalledProjectIoSmoke() {
  const env = {
    ...process.env,
    GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE: "1",
    GROOVEFORGE_DESKTOP_PROJECT_IO_SOURCE_PATH: sourcePath,
    GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE_PATH: targetPath,
    NO_COLOR: "1"
  };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.VITE_DEV_SERVER_URL;

  const child = spawn(installedExecutable, [], {
    cwd: installedAppRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stdout = "";
  let stderr = "";
  let settled = false;

  return await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      child.kill("SIGTERM");
      fail("Timed out waiting for installed Electron project IO smoke to exit.", `${stdout}\n${stderr}`);
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
      fail(`Could not start installed Electron app: ${error.message}`);
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
        fail(`Installed app exited without a project IO smoke result (code ${code ?? "null"}, signal ${signal ?? "null"}).`, combinedOutput);
      }
      if (code !== 0 || result.ok !== true) {
        const details = typeof result === "object" ? JSON.stringify(result, null, 2) : combinedOutput;
        fail(`Installed app project IO smoke returned a failing result (code ${code ?? "null"}, signal ${signal ?? "null"}).`, details);
      }
      resolve(result);
    });
  });
}

await checkInstalledArtifacts();
if (failures.length > 0) {
  fail("Installed artifact preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await rm(smokeRoot, { recursive: true, force: true });
await mkdir(smokeRoot, { recursive: true });

const project = buildProject();
const sourceContents = workstation.serializeProjectFile(project);
await writeFile(sourcePath, sourceContents, "utf8");

const result = await runInstalledProjectIoSmoke();
const savedContents = await readFile(targetPath, "utf8");
const reopenedProject = workstation.parseProjectFile(savedContents);
const reparsedProject = workstation.parseProjectFile(workstation.serializeProjectFile(reopenedProject));

check(result && typeof result === "object", "installed project IO smoke should return a structured result");
check(result?.ok === true, "installed project IO smoke result should be ok");
check(result?.evidence?.title === appName, "installed project IO smoke should run the production desktop renderer");
check(String(result?.evidence?.location ?? "").startsWith("file:"), "installed project IO smoke should load bundled file assets");
check(result?.evidence?.appKind === "desktop", "installed project IO smoke preload bridge should expose desktop appKind");
check(result?.evidence?.hasPreloadBridge === true, "installed project IO smoke should expose the preload bridge");
check(result?.evidence?.hasSaveProject === true, "installed project IO smoke should expose saveProject");
check(result?.evidence?.hasOpenProject === true, "installed project IO smoke should expose openProject");
check(result?.evidence?.saveResult?.canceled === false, "installed native saveProject should not be canceled");
check(result?.evidence?.saveResult?.filePath === targetPath, "installed native saveProject should return the smoke target path");
check(result?.evidence?.openResult?.canceled === false, "installed native openProject should not be canceled");
check(result?.evidence?.openResult?.filePath === targetPath, "installed native openProject should return the smoke target path");
check(result?.evidence?.openResult?.contentsMatched === true, "installed native openProject should return exact saved contents");
check(result?.evidence?.openResult?.contentsLength === sourceContents.length, "installed native openProject should return the saved content length");
check(savedContents === sourceContents, "installed saved project file should match source contents byte-for-byte");
check(reopenedProject.title === project.title, "installed saved project should parse with the same title");
check(reopenedProject.styleId === project.styleId, "installed saved project should parse with the same style");
check(reopenedProject.bpm === project.bpm, "installed saved project should parse with the same BPM");
check(reopenedProject.key === project.key, "installed saved project should parse with the same key");
check(reopenedProject.mode === project.mode, "installed saved project should parse with the same mode");
check(workstation.arrangementTotalBars(reopenedProject) === 8, "installed saved project should preserve the 8-bar target");
check(workstation.activeDeliveryTarget(reopenedProject).id === "beat_store", "installed saved project should preserve the delivery target");
check(reparsedProject.title === reopenedProject.title, "installed saved project should survive a second serialize/parse roundtrip");
check(workstation.projectFileName(reopenedProject) === path.basename(targetPath), "installed saved project filename should match the project title slug");
checkNoSamplingText(savedContents, "installed saved project file");

const report = buildReport(reopenedProject, result, sourceContents, savedContents);
const reportMarkdown = buildMarkdown(report);
check(report.installedProjectIoReady === true, "installed project IO report should be ready");
check(report.localEnvValueRecorded === false, "installed project IO report should not record local env values");
check(report.privateValuesRecorded === false, "installed project IO report should not record private values");
check(report.privateBeatRecorded === false, "installed project IO report should not record private beats");
check(report.realUserAudioRecorded === false, "installed project IO report should not record real user audio");
check(report.networkProbeAttempted === false, "installed project IO report should not probe remote channels");
check(report.releaseUploadAttempted === false, "installed project IO report should not upload release artifacts");
check(report.releaseGateClaimedExternalDistribution === false, "installed project IO report should not claim external distribution completion");
check(!/https?:\/\//i.test(reportMarkdown), "installed project IO report should not include URL values");

if (failures.length > 0) {
  fail("Installed project IO validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(reportMarkdownPath, reportMarkdown, "utf8");

console.log("GrooveForge installed project IO smoke passed.");
console.log(`- App: ${relative(installedApp)}`);
console.log(`- Source: ${relative(sourcePath)}`);
console.log(`- Saved: ${relative(targetPath)}`);
console.log(`- Report JSON: ${relative(reportJsonPath)}`);
console.log(`- Report Markdown: ${relative(reportMarkdownPath)}`);
console.log(`- Project: ${reopenedProject.title}, ${reopenedProject.bpm} BPM ${reopenedProject.key}, ${workstation.arrangementTotalBars(reopenedProject)} bars`);
console.log(`- Installed bridge: saveProject/openProject roundtrip matched ${report.savedBytes} bytes, sha256 ${report.savedSha256.slice(0, 16)}...`);
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, or local env values");
console.log("- Not claimed: real /Applications install, Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
