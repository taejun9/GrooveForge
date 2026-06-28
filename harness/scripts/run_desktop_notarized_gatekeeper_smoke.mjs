#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const notarizationSummaryPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-notarization.json`);
const summaryPath = path.join(root, "build", "desktop", `${appName}-${platformArch}-notarized-gatekeeper.json`);
const smokeRoot = path.join(packageRoot, "notarized-gatekeeper-smoke");
const mountPoint = path.join(smokeRoot, "mount");
const mountedApp = path.join(mountPoint, `${appName}.app`);
const commandTimeoutMs = 60000;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge notarized Gatekeeper smoke failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function runCommand(command, args) {
  return new Promise((resolve) => {
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
      resolve({
        ok: false,
        stdout,
        stderr,
        code: null,
        signal: "SIGTERM",
        error: `${command} timed out after ${commandTimeoutMs}ms`
      });
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
      resolve({
        ok: false,
        stdout,
        stderr,
        code: null,
        signal: null,
        error: error.message
      });
    });
    child.on("exit", (code, signal) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      resolve({
        ok: code === 0,
        stdout,
        stderr,
        code,
        signal,
        error: null
      });
    });
  });
}

async function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(await readFile(filePath, "utf8"));
}

function summarizeAssessment(label, targetPath, assessment) {
  const output = `${assessment.stdout}\n${assessment.stderr}`.trim();
  const sourceMatch = output.match(/source=([^\n]+)/);
  return {
    label,
    path: relative(targetPath),
    accepted: assessment.ok,
    code: assessment.code,
    signal: assessment.signal,
    source: sourceMatch?.[1]?.trim() ?? null,
    output,
    error: assessment.error
  };
}

function summarizeCommand(label, command, targetPath) {
  const output = `${command.stdout ?? ""}\n${command.stderr ?? ""}`.trim();
  return {
    label,
    path: targetPath ? relative(targetPath) : null,
    ok: command.ok,
    code: command.code ?? null,
    signal: command.signal ?? null,
    output,
    error: command.error ?? null
  };
}

async function createGatekeeperSummary() {
  const base = {
    appName,
    bundleId,
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    notarizationSummaryPath: relative(notarizationSummaryPath),
    networkSubmissionAttempted: false,
    releaseGateClaimedDeveloperIdSigning: false,
    releaseGateClaimedNotarization: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedExternalDistribution: false
  };

  if (process.platform !== "darwin") {
    return {
      ...base,
      skipped: true,
      reason: "Notarized Gatekeeper smoke is only meaningful on macOS",
      notarizationSummaryPresent: false,
      notarizedInputReady: false,
      notarizedGatekeeperAccepted: false,
      blockers: ["Run on macOS after notarization smoke produces a stapled isolated DMG."]
    };
  }

  const spctl = await runCommand("which", ["spctl"]);
  const hdiutil = await runCommand("which", ["hdiutil"]);
  const notarizationSummary = await readJsonIfExists(notarizationSummaryPath);
  const notarizedDmgPath = notarizationSummary?.notarizationDmgPath
    ? path.join(root, notarizationSummary.notarizationDmgPath)
    : null;
  const blockers = [];

  if (!spctl.ok) {
    blockers.push("macOS spctl CLI is unavailable.");
  }
  if (!hdiutil.ok) {
    blockers.push("macOS hdiutil CLI is unavailable for isolated notarized DMG mounting.");
  }
  if (!notarizationSummary) {
    blockers.push("Notarization summary is missing; run npm run desktop:notarization-smoke first.");
  } else if (
    notarizationSummary.notarizationReady !== true ||
    notarizationSummary.notarizationAccepted !== true ||
    notarizationSummary.stapled !== true ||
    notarizationSummary.stapleValidationPassed !== true
  ) {
    blockers.push("No notarized and stapled isolated DMG is available for Gatekeeper assessment.");
  }
  if (notarizedDmgPath && !existsSync(notarizedDmgPath)) {
    blockers.push("Notarized isolated DMG path from the notarization summary does not exist.");
  }

  const notarizedInputReady =
    notarizationSummary?.notarizationReady === true &&
    notarizationSummary?.notarizationAccepted === true &&
    notarizationSummary?.stapled === true &&
    notarizationSummary?.stapleValidationPassed === true &&
    Boolean(notarizedDmgPath) &&
    existsSync(notarizedDmgPath);

  const summary = {
    ...base,
    skipped: false,
    tools: {
      spctlAvailable: spctl.ok,
      hdiutilAvailable: hdiutil.ok
    },
    notarizationSummaryPresent: Boolean(notarizationSummary),
    notarizationReady: notarizationSummary?.notarizationReady === true,
    notarizationAccepted: notarizationSummary?.notarizationAccepted === true,
    stapled: notarizationSummary?.stapled === true,
    stapleValidationPassed: notarizationSummary?.stapleValidationPassed === true,
    notarizedInputReady,
    notarizedDmgPath: notarizedDmgPath ? relative(notarizedDmgPath) : null,
    notarizedDmgBytes: null,
    imageInfoOk: false,
    attachOk: false,
    detachOk: false,
    mountedAppPath: relative(mountedApp),
    assessments: {
      notarizedDmg: null,
      mountedApp: null
    },
    notarizedGatekeeperAccepted: false,
    blockers
  };

  if (!notarizedInputReady || !spctl.ok || !hdiutil.ok || !notarizedDmgPath) {
    return summary;
  }

  const dmgStats = await stat(notarizedDmgPath);
  summary.notarizedDmgBytes = dmgStats.size;
  if (dmgStats.size <= 10000000) {
    summary.blockers.push(`Notarized isolated DMG should be substantial, got ${dmgStats.size} bytes.`);
  }

  const imageInfo = await runCommand("hdiutil", ["imageinfo", notarizedDmgPath]);
  summary.imageInfoOk = imageInfo.ok;
  if (!imageInfo.ok) {
    summary.blockers.push("Notarized isolated DMG did not pass hdiutil imageinfo.");
  }

  const dmgAssessmentRaw = await runCommand("spctl", ["--assess", "--type", "open", "--verbose=4", notarizedDmgPath]);
  summary.assessments.notarizedDmg = summarizeAssessment("notarized DMG open assessment", notarizedDmgPath, dmgAssessmentRaw);
  if (!summary.assessments.notarizedDmg.accepted) {
    summary.blockers.push("Notarized DMG is not accepted by Gatekeeper assessment.");
  }

  await runCommand("hdiutil", ["detach", mountPoint, "-force"]);
  await rm(smokeRoot, { recursive: true, force: true });
  await mkdir(mountPoint, { recursive: true });
  let mounted = false;
  try {
    const attach = await runCommand("hdiutil", [
      "attach",
      "-nobrowse",
      "-readonly",
      "-mountpoint",
      mountPoint,
      notarizedDmgPath
    ]);
    summary.attachOk = attach.ok;
    mounted = attach.ok;
    if (!attach.ok) {
      summary.blockers.push("Could not mount the notarized isolated DMG read-only for app Gatekeeper assessment.");
    } else if (!existsSync(mountedApp)) {
      summary.blockers.push("Mounted notarized isolated DMG does not contain GrooveForge.app.");
    } else {
      const appAssessmentRaw = await runCommand("spctl", ["--assess", "--type", "execute", "--verbose=4", mountedApp]);
      summary.assessments.mountedApp = summarizeAssessment("mounted notarized app execute assessment", mountedApp, appAssessmentRaw);
      if (!summary.assessments.mountedApp.accepted) {
        summary.blockers.push("Mounted notarized app is not accepted by Gatekeeper assessment.");
      }
    }
  } finally {
    if (mounted) {
      const detach = await runCommand("hdiutil", ["detach", mountPoint, "-force"]);
      summary.detachOk = detach.ok;
      if (!detach.ok) {
        summary.blockers.push("Could not detach the notarized Gatekeeper smoke mount point.");
        summary.detach = summarizeCommand("notarized DMG detach", detach, mountPoint);
      }
    }
  }

  summary.notarizedGatekeeperAccepted =
    summary.assessments.notarizedDmg?.accepted === true &&
    summary.assessments.mountedApp?.accepted === true &&
    summary.detachOk === true;

  return summary;
}

const summary = await createGatekeeperSummary();
await mkdir(path.dirname(summaryPath), { recursive: true });
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

check(summary.appName === appName, "notarized Gatekeeper summary should identify GrooveForge");
check(summary.bundleId === bundleId, `notarized Gatekeeper summary should identify ${bundleId}`);
check(summary.networkSubmissionAttempted === false, "notarized Gatekeeper smoke should not submit to Apple services");
check(summary.releaseGateClaimedDeveloperIdSigning === false, "notarized Gatekeeper smoke should not claim primary release artifact Developer ID signing");
check(summary.releaseGateClaimedNotarization === false, "notarized Gatekeeper smoke should not claim primary release artifact notarization");
check(summary.releaseGateClaimedGatekeeperApproval === false, "notarized Gatekeeper smoke should not claim Gatekeeper approval");
check(summary.releaseGateClaimedExternalDistribution === false, "notarized Gatekeeper smoke should not claim external distribution completion");
check(Array.isArray(summary.blockers), "notarized Gatekeeper summary should include a blockers array");
check(
  summary.notarizedGatekeeperAccepted === false || summary.blockers.length === 0,
  "accepted notarized Gatekeeper summary should not include blockers"
);

if (failures.length > 0) {
  fail("Notarized Gatekeeper validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge notarized Gatekeeper smoke passed.");
console.log(`- Summary: ${relative(summaryPath)}`);
console.log(`- Notarized input ready: ${summary.notarizedInputReady === true ? "yes" : "no"}`);
console.log(`- Notarized DMG accepted: ${summary.assessments?.notarizedDmg?.accepted === true ? "yes" : "no"}`);
console.log(`- Mounted app accepted: ${summary.assessments?.mountedApp?.accepted === true ? "yes" : "no"}`);
console.log(`- Notarized Gatekeeper ready: ${summary.notarizedGatekeeperAccepted ? "yes" : "no"}`);
if (summary.blockers.length > 0) {
  console.log(`- Blockers: ${summary.blockers.join(" | ")}`);
}
console.log("- Network: no Apple notary submission attempted");
console.log("- Not claimed: primary release artifact Developer ID signing, notarization, Gatekeeper approval, auto-update, app-store submission, or external distribution-channel QA");
