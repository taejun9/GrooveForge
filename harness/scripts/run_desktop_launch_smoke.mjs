#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const resultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
const timeoutMs = 120000;
const failures = [];
const expectedLiveTestIds = [
  "workflow-target-transport",
  "workflow-target-compose",
  "workflow-target-sound",
  "workflow-target-arrange",
  "workflow-target-mix",
  "workflow-target-master",
  "guide-quick-start",
  "guide-quick-start-headline",
  "mode-guided",
  "mode-studio",
  "quick-actions-open",
  "command-reference-open",
  "style-select",
  "pattern-tab-A",
  "export-stems",
  "export-midi",
  "export-handoff-sheet",
  "pattern-chain-current",
  "master-ceiling"
];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop launch smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
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
    fail(`Could not parse launch smoke result JSON: ${error instanceof Error ? error.message : String(error)}`, line);
  }
}

function isMacAppKitAbort({ signal, output }) {
  return (
    signal === "SIGABRT" ||
    /(?:_RegisterApplication|RegisterApplication|NSApplication|HIServices|AppKit|EXC_CRASH|Abort trap:\s*6)/i.test(output)
  );
}

function prematureExitDetails({ signal, output }) {
  const trimmedOutput = output.trim();
  const rawOutput = trimmedOutput.length > 0 ? trimmedOutput : "none";

  if (!isMacAppKitAbort({ signal, output })) {
    return rawOutput;
  }

  return [
    "Diagnostic: Electron aborted before GrooveForge emitted launch smoke evidence.",
    "Observed macOS/AppKit registration abort signal before the main/renderer/preload smoke path could report.",
    "Likely cause: restricted, sandboxed, or non-GUI launch context blocking NSApplication registration.",
    "Action: rerun `npm run desktop:launch-smoke` or `npm run verify` from a normal macOS GUI session or with approved unsandboxed process access.",
    "",
    "Raw Electron output:",
    rawOutput
  ].join("\n");
}

function checkBuiltArtifacts() {
  check(existsSync(path.join(root, "dist/index.html")), "dist/index.html is missing; run npm run build before desktop launch smoke");
  check(
    existsSync(path.join(root, "dist-electron/main.js")),
    "dist-electron/main.js is missing; run npm run build before desktop launch smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron/preload.cjs")),
    "dist-electron/preload.cjs is missing; run npm run build before desktop launch smoke"
  );
}

function checkResult(result) {
  check(result && typeof result === "object", "launch smoke should return a structured result object");
  check(result?.ok === true, "launch smoke result should be ok");

  const evidence = result?.evidence;
  check(evidence && typeof evidence === "object", "launch smoke result should include evidence");
  check(evidence?.title === "GrooveForge", "live desktop document title should be GrooveForge");
  check(String(evidence?.location ?? "").startsWith("file:"), "live desktop renderer should load production file assets");
  check(evidence?.appKind === "desktop", "live desktop preload bridge should expose appKind desktop");
  check(evidence?.hasPreloadBridge === true, "live desktop preload bridge should exist");
  check(evidence?.hasSaveProject === true, "live desktop preload bridge should expose saveProject");
  check(evidence?.hasOpenProject === true, "live desktop preload bridge should expose openProject");
  check(evidence?.rootChildCount > 0, "live desktop renderer should mount React under #root");
  check(evidence?.bodyTextLength > 20000, "live desktop renderer should expose a substantial workstation surface");
  check(Array.isArray(evidence?.missingText) && evidence.missingText.length === 0, "live desktop renderer should contain all expected beginner/pro text");
  check(evidence?.samplingTextPresent === false, "live desktop first-run surface should not expose sampling-first language");

  const missingTestIds = expectedLiveTestIds.filter((testId) => evidence?.testIds?.[testId] !== true);
  check(missingTestIds.length === 0, `live desktop renderer is missing test ids: ${missingTestIds.join(", ")}`);

  const visual = evidence?.visual;
  check(visual && typeof visual === "object", "live desktop launch smoke should include screenshot visual evidence");
  check(visual?.width >= 1180 && visual?.height >= 760, "live desktop screenshot should respect minimum viewport dimensions");
  check(visual?.pngBytes > 50000, "live desktop screenshot PNG should be substantial");
  check(visual?.bitmapBytes >= visual?.width * visual?.height * 4, "live desktop screenshot should include full RGBA bitmap bytes");
  check(visual?.sampledPixels >= 1000, "live desktop screenshot should sample enough pixels");
  check(visual?.opaqueSamples / visual?.sampledPixels >= 0.95, "live desktop screenshot should be mostly opaque");
  check(visual?.uniqueSampledColors >= 24, "live desktop screenshot should have visible color diversity");
  check(visual?.nonBackgroundSamples / visual?.sampledPixels >= 0.04, "live desktop screenshot should contain non-background UI pixels");
  check(visual?.maxColorDelta >= 48, "live desktop screenshot should have visible contrast");
  check(visual?.brightSamples >= 20 && visual?.darkSamples >= 20, "live desktop screenshot should contain both bright and dark UI samples");
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

checkBuiltArtifacts();
if (failures.length > 0) {
  fail("Built artifact preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

const electronBin = resolveElectronBinary();
if (!electronBin) {
  fail("Electron binary is missing; run npm install first.");
}

const blockDetails = macGuiLaunchBlockDetails("npm run desktop:launch-smoke");
if (blockDetails) {
  fail("Refusing to start Electron in a restricted macOS GUI context.", blockDetails);
}

const env = {
  ...process.env,
  GROOVEFORGE_DESKTOP_LAUNCH_SMOKE: "1",
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

const timeout = setTimeout(() => {
  if (settled) {
    return;
  }
  settled = true;
  child.kill("SIGTERM");
  fail("Timed out waiting for Electron launch smoke to exit.", `${stdout}\n${stderr}`);
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
      `Electron exited without a launch smoke result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
      prematureExitDetails({ signal, output: combinedOutput })
    );
  }

  if (code !== 0 || result.ok !== true) {
    const details = typeof result === "object" ? JSON.stringify(result, null, 2) : combinedOutput;
    fail(`Electron launch smoke returned a failing result (code ${code ?? "null"}, signal ${signal ?? "null"}).`, details);
  }

  checkResult(result);
  if (failures.length > 0) {
    fail("Launch smoke evidence validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  console.log("GrooveForge desktop launch smoke passed.");
  console.log("- Scope: live production Electron app process, hidden BrowserWindow, preload bridge, mounted React renderer, and first-run workstation DOM");
  console.log(
    `- Renderer: ${result.evidence.title}, ${result.evidence.viewport.width}x${result.evidence.viewport.height}, ${result.evidence.bodyTextLength} text characters, ${Object.keys(
      result.evidence.testIds
    ).length} required test ids`
  );
  console.log(
    `- Visual: ${result.evidence.visual.width}x${result.evidence.visual.height}, ${result.evidence.visual.pngBytes} PNG bytes, ${result.evidence.visual.uniqueSampledColors} sampled colors, ${result.evidence.visual.nonBackgroundSamples}/${result.evidence.visual.sampledPixels} non-background samples`
  );
  console.log("- Beginner path: Guide Quick Start, First Beat Path, Beat Spine, Composer Guide, Workflow Navigator");
  console.log("- Producer path: Studio mode, Review Queue, Production Snapshot, Mix Coach, Sound/Mix Snapshot, Quick Actions, Command Reference");
  console.log("- Workstation path: transport, compose, sound, arrange, mix, master, export controls, Handoff Pack");
});
