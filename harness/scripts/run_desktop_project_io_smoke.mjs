#!/usr/bin/env node

import { createHash } from "node:crypto";
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
const smokeRoot = path.join(root, "build", "desktop", `${appName}-${packageJson.version}-${platformArch}-project-io-smoke`);
const sourcePath = path.join(smokeRoot, "native-project-io-source.grooveforge.json");
const targetPath = path.join(smokeRoot, "native-project-io-smoke-beat.grooveforge.json");
const reportJsonPath = path.join(smokeRoot, `${appName}-${packageJson.version}-${platformArch}-project-io-smoke.json`);
const reportMarkdownPath = path.join(smokeRoot, `${appName}-${packageJson.version}-${platformArch}-project-io-smoke.md`);
const resultPrefix = "GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE_RESULT ";
const timeoutMs = 210000;
const failures = [];
const audienceStarterExpectations = {
  beginner: {
    audience: "first-time composer",
    bpm: 86,
    deliveryTarget: "starter_sketch",
    key: "A minor",
    minEditableEvents: 40,
    mode: "guided",
    projectTitle: "First Guided Beat",
    styleId: "lofi"
  },
  producer: {
    audience: "professional producer",
    bpm: 124,
    deliveryTarget: "beat_store",
    key: "C minor",
    minEditableEvents: 60,
    mode: "studio",
    projectTitle: "Producer Fast Pass",
    styleId: "house"
  }
};

const workstation = await import("../../src/domain/workstation.ts");

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge desktop project IO smoke failed:");
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
  const boundaryAllowedText = text.replace(/without imported audio/gi, "direct beat-writing");
  check(
    !/AudioClipEvent|\bsampler\b|sample import|audio clip|sample chopping|imported audio/i.test(boundaryAllowedText),
    `${label} should stay sample-free and not mention optional sampling scope`
  );
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
  check(existsSync(path.join(root, "dist/index.html")), "dist/index.html is missing; run npm run build before desktop project IO smoke");
  check(
    existsSync(path.join(root, "dist-electron/main.js")),
    "dist-electron/main.js is missing; run npm run build before desktop project IO smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron/preload.cjs")),
    "dist-electron/preload.cjs is missing; run npm run build before desktop project IO smoke"
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
    fail(`Could not parse project IO smoke result JSON: ${error instanceof Error ? error.message : String(error)}`, line);
  }
}

function buildProject() {
  const blueprintProject = workstation.applyBeatBlueprint(workstation.starterProject, "club_bounce");
  const targetProject = workstation.applyDeliveryTarget(blueprintProject, "beat_store");
  return {
    ...targetProject,
    title: "Native Project IO Smoke Beat",
    mode: "studio",
    arrangement: workstation.createPatternChain("eight_bar"),
    sessionBrief: {
      artist: "Desktop producer",
      vibe: "native project IO proof",
      reference: "built-in instruments",
      notes: "Saved and reopened through the Electron desktop bridge."
    },
    snapshots: []
  };
}

function editableEventCount(project) {
  return Object.values(project.patterns).reduce((total, pattern) => {
    const drumHits = Object.values(pattern.drumPattern).reduce(
      (sum, laneSteps) => sum + laneSteps.filter(Boolean).length,
      0
    );
    return total + drumHits + pattern.bassNotes.length + pattern.melodyNotes.length + pattern.chordEvents.length;
  }, 0);
}

function buildAudienceStarterRoundtripSpecs() {
  return Object.entries(audienceStarterExpectations).map(([starterId, expectation]) => {
    const project = workstation.createAudienceStarterProject(starterId);
    return {
      audience: expectation.audience,
      expectation,
      label: workstation.audienceStarterProjectLabel(starterId),
      project,
      sourcePath: path.join(smokeRoot, `audience-starter-${starterId}-source.grooveforge.json`),
      starterId,
      targetPath: path.join(smokeRoot, workstation.projectFileName(project))
    };
  });
}

async function roundtripProject({ project, sourcePath: roundtripSourcePath, targetPath: roundtripTargetPath }) {
  const sourceContents = workstation.serializeProjectFile(project);
  await writeFile(roundtripSourcePath, sourceContents, "utf8");

  const result = await runElectronProjectIoSmoke(roundtripSourcePath, roundtripTargetPath);
  const savedContents = await readFile(roundtripTargetPath, "utf8");
  const reopenedProject = workstation.parseProjectFile(savedContents);
  const reparsedProject = workstation.parseProjectFile(workstation.serializeProjectFile(reopenedProject));

  return {
    editableEventCount: editableEventCount(reopenedProject),
    reparsedProject,
    reopenedProject,
    result,
    savedContents,
    sourceContents
  };
}

function checkElectronRoundtripResult(result, sourceContents, roundtripTargetPath, label) {
  check(result && typeof result === "object", `${label} project IO smoke should return a structured result`);
  check(result?.ok === true, `${label} project IO smoke result should be ok`);
  check(result?.evidence?.title === "GrooveForge", `${label} project IO smoke should run the production desktop renderer`);
  check(String(result?.evidence?.location ?? "").startsWith("file:"), `${label} project IO smoke should load built file assets`);
  check(result?.evidence?.appKind === "desktop", `${label} project IO smoke preload bridge should expose desktop appKind`);
  check(result?.evidence?.hasPreloadBridge === true, `${label} project IO smoke should expose the preload bridge`);
  check(result?.evidence?.hasSaveProject === true, `${label} project IO smoke should expose saveProject`);
  check(result?.evidence?.hasOpenProject === true, `${label} project IO smoke should expose openProject`);
  check(result?.evidence?.saveResult?.canceled === false, `${label} native saveProject should not be canceled`);
  check(result?.evidence?.saveResult?.filePath === roundtripTargetPath, `${label} native saveProject should return the smoke target path`);
  check(result?.evidence?.openResult?.canceled === false, `${label} native openProject should not be canceled`);
  check(result?.evidence?.openResult?.filePath === roundtripTargetPath, `${label} native openProject should return the smoke target path`);
  check(result?.evidence?.openResult?.contentsMatched === true, `${label} native openProject should return exact saved contents`);
  check(result?.evidence?.openResult?.contentsLength === sourceContents.length, `${label} native openProject should return the saved content length`);
}

function buildAudienceStarterRoundtripReport(spec, roundtrip) {
  const target = workstation.activeDeliveryTarget(roundtrip.reopenedProject);
  return {
    audience: spec.audience,
    bpm: roundtrip.reopenedProject.bpm,
    deliveryTarget: target.name,
    deliveryTargetId: target.id,
    editableEventCount: roundtrip.editableEventCount,
    key: roundtrip.reopenedProject.key,
    label: spec.label,
    mode: roundtrip.reopenedProject.mode,
    projectTitle: roundtrip.reopenedProject.title,
    roundtripReady: true,
    savedBytes: Buffer.byteLength(roundtrip.savedContents, "utf8"),
    savedSha256: sha256(roundtrip.savedContents),
    sourceBytes: Buffer.byteLength(roundtrip.sourceContents, "utf8"),
    sourcePath: relative(spec.sourcePath),
    sourceSha256: sha256(roundtrip.sourceContents),
    starterId: spec.starterId,
    styleId: roundtrip.reopenedProject.styleId,
    targetPath: relative(spec.targetPath),
    totalBars: workstation.arrangementTotalBars(roundtrip.reopenedProject)
  };
}

function buildReport(project, result, sourceContents, savedContents, audienceStarterRoundtrips) {
  const target = workstation.activeDeliveryTarget(project);
  return {
    appName,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    sourcePath: relative(sourcePath),
    targetPath: relative(targetPath),
    reportJsonPath: relative(reportJsonPath),
    reportMarkdownPath: relative(reportMarkdownPath),
    productScope: "sample-free native desktop project save/open from editable GrooveForge events",
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
    nativeSaveReady: true,
    nativeOpenReady: true,
    projectRoundtripReady: true,
    audienceStarterRoundtripReady: audienceStarterRoundtrips.every((roundtrip) => roundtrip.roundtripReady),
    audienceStarterRoundtripCount: audienceStarterRoundtrips.length,
    audienceStarterRoundtrips,
    nativeProjectIoReady: true,
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
  return `# ${appName} ${report.version} ${report.platform}-${report.arch} Native Project IO Smoke

## Status

- Native project IO ready: ${report.nativeProjectIoReady ? "yes" : "no"}
- Product scope: ${report.productScope}
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

## Native Bridge Checks

- Native save ready: ${report.nativeSaveReady ? "yes" : "no"}
- Native open ready: ${report.nativeOpenReady ? "yes" : "no"}
- Project roundtrip ready: ${report.projectRoundtripReady ? "yes" : "no"}
- Preload bridge present: ${report.electronEvidence.hasPreloadBridge ? "yes" : "no"}
- Save bridge present: ${report.electronEvidence.hasSaveProject ? "yes" : "no"}
- Open bridge present: ${report.electronEvidence.hasOpenProject ? "yes" : "no"}
- Contents matched: ${report.electronEvidence.openResult.contentsMatched ? "yes" : "no"}

## Audience Starter Roundtrips

| audience | project | mode | style | bpm/key | bars | delivery target | editable events | contents matched |
|---|---|---|---|---|---:|---|---:|---|
${report.audienceStarterRoundtrips
  .map(
    (roundtrip) =>
      `| ${roundtrip.audience} | ${roundtrip.projectTitle} | ${roundtrip.mode} | ${roundtrip.styleId} | ${roundtrip.bpm} / ${roundtrip.key} | ${roundtrip.totalBars} | ${roundtrip.deliveryTarget} | ${roundtrip.editableEventCount} | ${roundtrip.roundtripReady ? "yes" : "no"} |`
  )
  .join("\n")}

## Not Recorded

Private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, and local env values are not recorded.

## Not Claimed

This native project IO smoke does not claim Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, release upload, app-store submission, remote channel probing, or external distribution completion.
`;
}

async function runElectronProjectIoSmoke(roundtripSourcePath, roundtripTargetPath) {
  const electronBin = resolveElectronBinary();
  if (!electronBin) {
    fail("Electron binary is missing; run npm install first.");
  }

  const blockDetails = macGuiLaunchBlockDetails("npm run desktop:project-io-smoke");
  if (blockDetails) {
    fail("Refusing to start Electron in a restricted macOS GUI context.", blockDetails);
  }

  const env = {
    ...process.env,
    GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE: "1",
    GROOVEFORGE_DESKTOP_PROJECT_IO_SOURCE_PATH: roundtripSourcePath,
    GROOVEFORGE_DESKTOP_PROJECT_IO_SMOKE_PATH: roundtripTargetPath,
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
      fail("Timed out waiting for Electron project IO smoke to exit.", `${stdout}\n${stderr}`);
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
          `Electron exited without a project IO smoke result (code ${code ?? "null"}, signal ${signal ?? "null"}).`,
          macGuiLaunchAbortDetails("npm run desktop:project-io-smoke", { code, signal, output: combinedOutput })
        );
      }
      if (code !== 0 || result.ok !== true) {
        const details = typeof result === "object" ? JSON.stringify(result, null, 2) : combinedOutput;
        fail(`Electron project IO smoke returned a failing result (code ${code ?? "null"}, signal ${signal ?? "null"}).`, details);
      }
      resolve(result);
    });
  });
}

checkBuiltArtifacts();
if (failures.length > 0) {
  fail("Built artifact preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await rm(smokeRoot, { recursive: true, force: true });
await mkdir(smokeRoot, { recursive: true });

const project = buildProject();
const primaryRoundtrip = await roundtripProject({ project, sourcePath, targetPath });
const { result, sourceContents, savedContents, reopenedProject, reparsedProject } = primaryRoundtrip;

checkElectronRoundtripResult(result, sourceContents, targetPath, "native");
check(savedContents === sourceContents, "saved project file should match source contents byte-for-byte");
check(reopenedProject.title === project.title, "native saved project should parse with the same title");
check(reopenedProject.styleId === project.styleId, "native saved project should parse with the same style");
check(reopenedProject.bpm === project.bpm, "native saved project should parse with the same BPM");
check(reopenedProject.key === project.key, "native saved project should parse with the same key");
check(reopenedProject.mode === project.mode, "native saved project should parse with the same mode");
check(workstation.arrangementTotalBars(reopenedProject) === 8, "native saved project should preserve the 8-bar target");
check(workstation.activeDeliveryTarget(reopenedProject).id === "beat_store", "native saved project should preserve the delivery target");
check(reparsedProject.title === reopenedProject.title, "native saved project should survive a second serialize/parse roundtrip");
check(workstation.projectFileName(reopenedProject) === path.basename(targetPath), "native saved project filename should match the project title slug");
checkNoSamplingText(savedContents, "native saved project file");

const audienceStarterRoundtrips = [];
for (const spec of buildAudienceStarterRoundtripSpecs()) {
  const roundtrip = await roundtripProject(spec);
  const target = workstation.activeDeliveryTarget(roundtrip.reopenedProject);
  const label = `Audience Starter ${spec.starterId}`;

  checkElectronRoundtripResult(roundtrip.result, roundtrip.sourceContents, spec.targetPath, label);
  check(roundtrip.savedContents === roundtrip.sourceContents, `${label} saved project file should match source contents byte-for-byte`);
  check(roundtrip.reopenedProject.title === spec.expectation.projectTitle, `${label} should preserve title`);
  check(roundtrip.reopenedProject.mode === spec.expectation.mode, `${label} should preserve ${spec.expectation.mode} mode`);
  check(roundtrip.reopenedProject.styleId === spec.expectation.styleId, `${label} should preserve ${spec.expectation.styleId} style`);
  check(roundtrip.reopenedProject.bpm === spec.expectation.bpm, `${label} should preserve BPM`);
  check(roundtrip.reopenedProject.key === spec.expectation.key, `${label} should preserve key`);
  check(target.id === spec.expectation.deliveryTarget, `${label} should preserve delivery target`);
  check(roundtrip.editableEventCount >= spec.expectation.minEditableEvents, `${label} should preserve editable event density`);
  check(
    editableEventCount(roundtrip.reparsedProject) === roundtrip.editableEventCount,
    `${label} should survive a second serialize/parse event-count roundtrip`
  );
  check(workstation.projectFileName(roundtrip.reopenedProject) === path.basename(spec.targetPath), `${label} filename should match the project title slug`);
  checkNoSamplingText(roundtrip.savedContents, `${label} project file`);

  audienceStarterRoundtrips.push(buildAudienceStarterRoundtripReport(spec, roundtrip));
}

const report = buildReport(reopenedProject, result, sourceContents, savedContents, audienceStarterRoundtrips);
const reportMarkdown = buildMarkdown(report);
check(report.nativeProjectIoReady === true, "native project IO report should be ready");
check(report.audienceStarterRoundtripReady === true, "native project IO report should include ready Audience Starter roundtrips");
check(report.audienceStarterRoundtripCount === 2, "native project IO report should include both Audience Starter roundtrips");
check(reportMarkdown.includes("Audience Starter Roundtrips"), "native project IO Markdown should include Audience Starter roundtrips");
check(reportMarkdown.includes("first-time composer"), "native project IO Markdown should include first-time composer starter roundtrip");
check(reportMarkdown.includes("professional producer"), "native project IO Markdown should include professional producer starter roundtrip");
check(report.localEnvValueRecorded === false, "native project IO report should not record local env values");
check(report.privateValuesRecorded === false, "native project IO report should not record private values");
check(report.privateBeatRecorded === false, "native project IO report should not record private beats");
check(report.realUserAudioRecorded === false, "native project IO report should not record real user audio");
check(report.networkProbeAttempted === false, "native project IO report should not probe remote channels");
check(report.releaseUploadAttempted === false, "native project IO report should not upload release artifacts");
check(report.releaseGateClaimedExternalDistribution === false, "native project IO report should not claim external distribution completion");
check(!/https?:\/\//i.test(reportMarkdown), "native project IO report should not include URL values");

if (failures.length > 0) {
  fail("Desktop project IO validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

await writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(reportMarkdownPath, reportMarkdown, "utf8");

console.log("GrooveForge desktop project IO smoke passed.");
console.log(`- Source: ${relative(sourcePath)}`);
console.log(`- Saved: ${relative(targetPath)}`);
console.log(`- Report JSON: ${relative(reportJsonPath)}`);
console.log(`- Report Markdown: ${relative(reportMarkdownPath)}`);
console.log(`- Project: ${reopenedProject.title}, ${reopenedProject.bpm} BPM ${reopenedProject.key}, ${workstation.arrangementTotalBars(reopenedProject)} bars`);
console.log(`- Native bridge: saveProject/openProject roundtrip matched ${report.savedBytes} bytes, sha256 ${report.savedSha256.slice(0, 16)}...`);
console.log(
  `- Audience Starter roundtrips: ${report.audienceStarterRoundtripCount}/2 ready (${report.audienceStarterRoundtrips
    .map((roundtrip) => `${roundtrip.audience}: ${roundtrip.mode}, ${roundtrip.styleId}, ${roundtrip.totalBars} bars, ${roundtrip.editableEventCount} events`)
    .join("; ")})`
);
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not recorded: private values, private beats, real user audio, release URLs, support URLs, feed URLs, credentials, tokens, identity labels, channel values, or local env values");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
