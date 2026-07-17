#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { macGuiLaunchAbortDetails, macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const smokeRoot = path.join(root, "build", "desktop", `${appName}-${packageJson.version}-${platformArch}-close-flow-smoke`);
const targetPath = path.join(smokeRoot, "close-flow-smoke-beat.grooveforge.json");
const reportJsonPath = path.join(smokeRoot, `${appName}-${packageJson.version}-${platformArch}-close-flow-smoke.json`);
const reportMarkdownPath = path.join(smokeRoot, `${appName}-${packageJson.version}-${platformArch}-close-flow-smoke.md`);
const resultPrefix = "GROOVEFORGE_DESKTOP_CLOSE_FLOW_SMOKE_RESULT ";
const expectedTitle = "Close Flow Smoke Beat";
const expectedEvents = [
  "live-edit-ready",
  "first-close-requested",
  "first-close-prevented",
  "smoke-save-choice",
  "native-save-started",
  "native-save-completed",
  "renderer-close-request",
  "window-closed"
];
const timeoutMs = 270000;
const failures = [];
const workstation = await import("../../src/domain/workstation.ts");

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop guarded close-flow smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function resolveElectronBinary() {
  try {
    const resolvedElectron = require("electron");
    if (typeof resolvedElectron === "string" && existsSync(resolvedElectron)) {
      return resolvedElectron;
    }
  } catch {
    // Fall through to the local bin fallback below.
  }

  const localBin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "electron.cmd" : "electron");
  return existsSync(localBin) ? localBin : null;
}

function checkBuiltArtifacts() {
  check(existsSync(path.join(root, "dist/index.html")), "dist/index.html is missing; run npm run build before close-flow smoke");
  check(
    existsSync(path.join(root, "dist-electron/main.js")),
    "dist-electron/main.js is missing; run npm run build before close-flow smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron/preload.cjs")),
    "dist-electron/preload.cjs is missing; run npm run build before close-flow smoke"
  );
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
    fail(`Could not parse close-flow smoke result JSON: ${error instanceof Error ? error.message : String(error)}`, line);
  }
}

async function runElectronCloseFlowSmoke() {
  const electronBin = resolveElectronBinary();
  if (!electronBin) {
    fail("Electron binary is missing; run npm install first.");
  }

  const command = "npm run desktop:close-flow-smoke";
  const blockDetails = macGuiLaunchBlockDetails(command);
  if (blockDetails) {
    fail("Refusing to start Electron in a restricted macOS GUI context.", blockDetails);
  }

  const env = {
    ...process.env,
    GROOVEFORGE_DESKTOP_CLOSE_FLOW_SMOKE: "1",
    GROOVEFORGE_DESKTOP_CLOSE_FLOW_SMOKE_PATH: targetPath,
    NO_COLOR: "1"
  };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.VITE_DEV_SERVER_URL;

  const child = spawn(electronBin, ["."], {
    cwd: root,
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
      fail("Timed out waiting for Electron guarded close-flow smoke to exit.", `${stdout}\n${stderr}`);
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
      fail(`Could not start Electron: ${error.message}`);
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
          `Electron exited without a close-flow smoke result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
          macGuiLaunchAbortDetails(command, { code, signal, output: combinedOutput })
        );
      }
      if (code !== 0 || result.ok !== true) {
        fail(
          `Electron close-flow smoke returned a failing result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
          typeof result === "object" ? JSON.stringify(result, null, 2) : combinedOutput
        );
      }
      resolve(result);
    });
  });
}

function buildMarkdown(report) {
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Guarded Close Flow Smoke

## Status

- Guarded Save-before-close ready: ${report.guardedCloseFlowReady ? "yes" : "no"}
- Product scope: ${report.productScope}
- Saved path: \`${report.targetPath}\`
- Exact live edit saved: ${report.savedExactLiveEdit ? "yes" : "no"}
- First close prevented: ${report.firstClosePrevented ? "yes" : "no"}
- Second guarded close completed: ${report.secondGuardedCloseCompleted ? "yes" : "no"}

## Production Roundtrip

${report.events.map((event, index) => `${index + 1}. ${event}`).join("\n")}

The operating-system warning choice is fixed to Save only inside smoke mode. The renderer edit, beforeunload guard, main-process will-prevent-unload event, validated renderer command, context-isolated preload bridge, native file writer, exact-current Save result, and second ordinary window close use the production path.

## Not Recorded

Private values, private beats, real user audio, release URLs, credentials, tokens, identity labels, channel values, and local env values are not recorded.

## Not Claimed

This smoke does not claim physical operating-system warning-button automation, Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

checkBuiltArtifacts();
if (failures.length > 0) {
  fail("Built artifact preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await rm(smokeRoot, { recursive: true, force: true });
await mkdir(smokeRoot, { recursive: true });
const result = await runElectronCloseFlowSmoke();
const savedContents = await readFile(targetPath, "utf8");
const project = workstation.parseProjectFile(savedContents);
const evidence = result.evidence ?? {};

check(evidence.productionRenderer === true, "close-flow smoke should run the production renderer");
check(evidence.liveEdit?.inputPresent === true, "close-flow smoke should find the production project title input");
check(evidence.liveEdit?.initialTitle !== expectedTitle, "close-flow smoke should start from a different title");
check(evidence.liveEdit?.title === expectedTitle, "close-flow smoke should apply the live title edit");
check(evidence.liveEdit?.dirtyStatus === "Unsaved changes", "live title edit should mark the project unsaved");
check(evidence.firstClosePrevented === true, "renderer beforeunload should prevent the first close");
check(evidence.smokeChoiceSubstituted === true, "smoke should substitute only the native Save choice");
check(evidence.nativeSaveCount === 1, "native project writer should run exactly once");
check(
  evidence.nativeSaveDefaultName === "close-flow-smoke-beat.grooveforge.json",
  "renderer Save should derive the project file name from the exact live edit"
);
check(evidence.closeRequestCount === 1, "renderer should request exactly one second close");
check(evidence.savedExactLiveEdit === true, "native saved project should contain the exact live edit");
check(evidence.secondGuardedCloseCompleted === true, "second ordinary close should complete through the same guard");
check(evidence.targetPath === targetPath, "native project writer should use the ignored close-flow target path");
check(JSON.stringify(evidence.events) === JSON.stringify(expectedEvents), "close-flow events should preserve the required order");
check(project.title === expectedTitle, "saved project parser roundtrip should preserve the live title edit");
check(workstation.arrangementTotalBars(project) === 8, "saved close-flow project should preserve the sample-free 8-bar starter");
check(!/AudioClipEvent|sample import|sample browser|chop pads|sampler track|audio clip/i.test(savedContents), "saved close-flow project should remain sample-free");

const report = {
  appName,
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  platform: process.platform,
  arch: process.arch,
  targetPath: relative(targetPath),
  productScope: "sample-free live renderer edit through guarded native Save-before-close",
  projectTitle: project.title,
  arrangementBars: workstation.arrangementTotalBars(project),
  events: evidence.events,
  firstClosePrevented: evidence.firstClosePrevented === true,
  savedExactLiveEdit: evidence.savedExactLiveEdit === true,
  secondGuardedCloseCompleted: evidence.secondGuardedCloseCompleted === true,
  guardedCloseFlowReady: failures.length === 0,
  physicalNativeButtonAutomated: false,
  localEnvValueRecorded: false,
  privateValuesRecorded: false,
  privateBeatRecorded: false,
  realUserAudioRecorded: false,
  networkProbeAttempted: false,
  releaseUploadAttempted: false,
  releaseGateClaimedExternalDistribution: false
};
const reportMarkdown = buildMarkdown(report);

check(report.guardedCloseFlowReady === true, "guarded close-flow report should be ready");
check(report.physicalNativeButtonAutomated === false, "report should not claim physical native warning-button automation");
check(report.localEnvValueRecorded === false, "report should not record local env values");
check(report.privateValuesRecorded === false, "report should not record private values");
check(report.privateBeatRecorded === false, "report should not record private beats");
check(report.realUserAudioRecorded === false, "report should not record real user audio");
check(report.networkProbeAttempted === false, "report should not probe remote channels");
check(report.releaseUploadAttempted === false, "report should not upload release artifacts");
check(report.releaseGateClaimedExternalDistribution === false, "report should not claim external distribution completion");
check(!/https?:\/\//i.test(reportMarkdown), "report should not include URL values");

if (failures.length > 0) {
  fail("Desktop guarded close-flow validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(reportMarkdownPath, reportMarkdown, "utf8");

console.log("GrooveForge desktop guarded close-flow smoke passed.");
console.log(`- Saved: ${relative(targetPath)}`);
console.log(`- Report JSON: ${relative(reportJsonPath)}`);
console.log(`- Report Markdown: ${relative(reportMarkdownPath)}`);
console.log(`- Roundtrip: ${expectedEvents.join(" -> ")}`);
console.log("- Exact live edit: saved and parser-validated through the native project writer");
console.log("- Native choice boundary: deterministic Save selection only in smoke mode; physical OS button automation not claimed");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
