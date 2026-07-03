#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { macGuiLaunchAbortDetails, macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const resultPrefix = "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE_RESULT ";
const timeoutMs = 210000;
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
  "audience-session-readout",
  "audience-session-action-beginner",
  "audience-session-action-producer",
  "dual-audience-readiness",
  "dual-audience-readiness-beginner",
  "dual-audience-readiness-producer",
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
  check(evidence?.palette?.opened === true, "live desktop Quick Actions palette should open during launch smoke");
  check(
    evidence?.palette?.searchPresent === true,
    "live desktop Quick Actions palette should accept Audience Session and Dual Audience Readiness search input"
  );
  check(
    evidence?.palette?.resultPresent === true,
    "live desktop Quick Actions palette should leave Audience Session and Dual Audience Readiness execution results"
  );
  check(evidence?.palette?.guided?.actionPresent === true, "live desktop Quick Actions palette should show Enter Guided from first-time composer search");
  check(
    evidence?.palette?.guided?.spotlightAction === "audience-session-enter-beginner",
    "live desktop Quick Actions Guided spotlight should target audience-session-enter-beginner"
  );
  check(
    evidence?.palette?.guided?.spotlightTitle === "Enter Guided: First-time composer",
    "live desktop Quick Actions Guided spotlight should name Enter Guided"
  );
  check(
    String(evidence?.palette?.guided?.searchMetricValue ?? "").includes("Enter Guided: First-time composer"),
    "live desktop Quick Actions Guided search metric should target Enter Guided"
  );
  const guidedResultTitle = String(evidence?.palette?.guided?.resultTitle ?? "");
  const guidedResultStatus = String(evidence?.palette?.guided?.resultStatus ?? "");
  const guidedResultMetric = String(evidence?.palette?.guided?.resultMetricValue ?? "");
  check(
    (guidedResultStatus === "Entered" || guidedResultStatus.includes("Guided")) &&
      (guidedResultTitle === "Enter Guided: First-time composer" || guidedResultTitle === "First-time composer route selected"),
    "live desktop Quick Actions Guided command should execute with Entered result"
  );
  check(
    (guidedResultMetric.includes("Enter Guided for first-time composer") && guidedResultMetric.includes("target Guided")) ||
      guidedResultMetric.includes("Guided first-beat workflow"),
    "live desktop Quick Actions Guided result should include first-time composer route and Guided target"
  );
  check(
    String(evidence?.palette?.guided?.resultNextCheck ?? "").includes("First Beat Path"),
    "live desktop Quick Actions Guided result should guide the next First Beat Path check"
  );
  check(
    evidence?.palette?.producer?.actionPresent === true,
    "live desktop Quick Actions palette should show Enter Studio from professional producer search"
  );
  check(
    evidence?.palette?.producer?.spotlightAction === "audience-session-enter-producer",
    "live desktop Quick Actions producer spotlight should target audience-session-enter-producer"
  );
  check(
    evidence?.palette?.producer?.spotlightTitle === "Enter Studio: Professional producer",
    "live desktop Quick Actions producer spotlight should name Enter Studio"
  );
  check(
    String(evidence?.palette?.producer?.searchMetricValue ?? "").includes("Enter Studio: Professional producer"),
    "live desktop Quick Actions producer search metric should target Enter Studio"
  );
  const producerResultTitle = String(evidence?.palette?.producer?.resultTitle ?? "");
  const producerResultStatus = String(evidence?.palette?.producer?.resultStatus ?? "");
  const producerResultMetric = String(evidence?.palette?.producer?.resultMetricValue ?? "");
  check(
    (producerResultStatus === "Entered" || producerResultStatus.includes("Studio")) &&
      (producerResultTitle === "Enter Studio: Professional producer" || producerResultTitle === "Professional producer route selected"),
    "live desktop Quick Actions producer command should execute with Entered result"
  );
  check(
    (producerResultMetric.includes("Enter Studio for professional producer") && producerResultMetric.includes("target Studio")) ||
      producerResultMetric.includes("Studio producer scan workflow"),
    "live desktop Quick Actions producer result should include professional producer route and Studio target"
  );
  check(
    String(evidence?.palette?.producer?.resultNextCheck ?? "").includes("Review Queue") &&
      String(evidence?.palette?.producer?.resultNextCheck ?? "").includes("Export Preflight"),
    "live desktop Quick Actions producer result should guide the next Review Queue / Export Preflight check"
  );
  check(
    evidence?.palette?.dualReadout?.actionPresent === true,
    "live desktop Quick Actions palette should show Dual Audience Readiness Route Readout"
  );
  check(
    evidence?.palette?.dualReadout?.spotlightAction === "dual-audience-readiness-route-readout-action",
    "live desktop Quick Actions Dual Audience spotlight should target dual-audience-readiness-route-readout-action"
  );
  check(
    String(evidence?.palette?.dualReadout?.spotlightTitle ?? "").includes("Review Dual Audience Readiness"),
    "live desktop Quick Actions Dual Audience spotlight should name Dual Audience Readiness"
  );
  check(
    String(evidence?.palette?.dualReadout?.resultMetricValue ?? "").includes("Dual Audience Readiness Route Readout"),
    "live desktop Quick Actions Dual Audience readout result should include the route readout"
  );
  check(
    evidence?.palette?.dualBeginner?.actionPresent === true &&
      String(evidence?.palette?.dualBeginner?.resultMetricValue ?? "").includes("First-time composer lane"),
    "live desktop Quick Actions Dual Audience beginner lane should execute with first-time composer lane evidence"
  );
  check(
    String(evidence?.palette?.dualBeginner?.resultNextCheck ?? "").includes("First Beat Path"),
    "live desktop Quick Actions Dual Audience beginner lane should guide the next First Beat Path check"
  );
  check(
    evidence?.palette?.dualProducer?.actionPresent === true &&
      String(evidence?.palette?.dualProducer?.resultMetricValue ?? "").includes("Professional producer lane"),
    "live desktop Quick Actions Dual Audience producer lane should execute with professional producer lane evidence"
  );
  check(
    String(evidence?.palette?.dualProducer?.resultNextCheck ?? "").includes("Export Preflight") ||
      String(evidence?.palette?.dualProducer?.resultNextCheck ?? "").includes("Production Snapshot"),
    "live desktop Quick Actions Dual Audience producer lane should guide the next producer delivery check"
  );

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
      macGuiLaunchAbortDetails("npm run desktop:launch-smoke", { code, signal, output: combinedOutput })
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
  console.log("- Audience session rows: First-time composer, Professional producer");
  console.log("- Audience session Quick Actions: renderer palette search and run evidence passed for Enter Guided and Enter Studio");
  console.log(
    "- Dual Audience Readiness Quick Actions: route readout, first-time composer lane, and professional producer lane search/run evidence passed"
  );
  console.log(
    "- Beginner path: Audience Session Readout, Dual Audience Readiness, Enter Guided, Guide Quick Start, First Beat Path, Beat Spine, Composer Guide, Workflow Navigator"
  );
  console.log(
    "- Producer path: Audience Session Readout, Dual Audience Readiness, Enter Studio, Studio mode, Review Queue, Production Snapshot, Mix Coach, Sound/Mix Snapshot, Quick Actions, Command Reference"
  );
  console.log("- Workstation path: transport, compose, sound, arrange, mix, master, export controls, Handoff Pack");
});
