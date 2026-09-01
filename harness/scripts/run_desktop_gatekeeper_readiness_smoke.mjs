#!/usr/bin/env node

/**
 * 역할: macOS Gatekeeper 배포 준비에 필요한 서명·공증 ticket·assessment 증거가 일치하는지 검사한다.
 * 흐름: 로컬 앱/DMG와 fixture 결과를 대상으로 codesign·spctl 계열 진단을 수집하고 기대 계약을 대조한다.
 * 안전 경계: 검증 실패나 도구 부재는 준비 실패로 처리하며 시스템 Gatekeeper 설정이나 사용자 정책은 변경하지 않는다.
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const bundleId = "app.grooveforge.desktop";
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const dmgPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}.dmg`);
const installedApp = path.join(packageRoot, "install-smoke", "Applications", `${appName}.app`);
const readinessRoot = path.join(root, "build", "desktop");
const readinessPath = path.join(readinessRoot, `${appName}-${platformArch}-gatekeeper-readiness.json`);
const commandTimeoutMs = 60000;
const failures = [];

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function fail(message, details = "") {
  console.error("GrooveForge Gatekeeper readiness smoke failed:");
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

async function createReadinessSummary() {
  const base = {
    appName,
    bundleId,
    generatedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    networkSubmissionAttempted: false,
    releaseGateClaimedGatekeeperApproval: false,
    releaseGateClaimedExternalDistribution: false
  };

  if (process.platform !== "darwin") {
    return {
      ...base,
      skipped: true,
      reason: "Gatekeeper readiness smoke is only meaningful on macOS",
      gatekeeperAccepted: false,
      blockers: ["Run on macOS with local DMG and installed app artifacts available."]
    };
  }

  check(existsSync(dmgPath), "local GrooveForge DMG should exist; run npm run desktop:dmg-smoke first");
  check(existsSync(installedApp), "installed GrooveForge.app should exist; run npm run desktop:install-smoke first");
  if (existsSync(dmgPath)) {
    const dmgStats = await stat(dmgPath);
    check(dmgStats.size > 10000000, `local GrooveForge DMG should be substantial, got ${dmgStats.size} bytes`);
  }
  if (failures.length > 0) {
    fail("Gatekeeper readiness preflight failed.", failures.map((failure) => `- ${failure}`).join("\n"));
  }

  const spctl = await runCommand("which", ["spctl"]);
  const appAssessmentRaw = spctl.ok
    ? await runCommand("spctl", ["--assess", "--type", "execute", "--verbose=4", installedApp])
    : { ok: false, stdout: "", stderr: "", code: null, signal: null, error: "spctl CLI is unavailable" };
  const dmgAssessmentRaw = spctl.ok
    ? await runCommand("spctl", ["--assess", "--type", "open", "--verbose=4", dmgPath])
    : { ok: false, stdout: "", stderr: "", code: null, signal: null, error: "spctl CLI is unavailable" };
  const appAssessment = summarizeAssessment("installed app execute assessment", installedApp, appAssessmentRaw);
  const dmgAssessment = summarizeAssessment("DMG open assessment", dmgPath, dmgAssessmentRaw);
  const blockers = [];

  if (!spctl.ok) {
    blockers.push("macOS spctl CLI is unavailable.");
  }
  if (!appAssessment.accepted) {
    blockers.push("Installed app is not accepted by Gatekeeper assessment.");
  }
  if (!dmgAssessment.accepted) {
    blockers.push("DMG is not accepted by Gatekeeper assessment.");
  }

  return {
    ...base,
    skipped: false,
    tools: {
      spctlAvailable: spctl.ok
    },
    assessments: {
      installedApp: appAssessment,
      dmg: dmgAssessment
    },
    gatekeeperAccepted: appAssessment.accepted && dmgAssessment.accepted,
    blockers
  };
}

const readiness = await createReadinessSummary();
await mkdir(readinessRoot, { recursive: true });
await writeFile(readinessPath, `${JSON.stringify(readiness, null, 2)}\n`, "utf8");

check(readiness.appName === appName, "Gatekeeper readiness summary should identify GrooveForge");
check(readiness.bundleId === bundleId, `Gatekeeper readiness summary should identify ${bundleId}`);
check(readiness.networkSubmissionAttempted === false, "Gatekeeper readiness smoke should not submit to Apple services");
check(readiness.releaseGateClaimedGatekeeperApproval === false, "Gatekeeper readiness smoke should not claim Gatekeeper approval");
check(readiness.releaseGateClaimedExternalDistribution === false, "Gatekeeper readiness smoke should not claim external distribution completion");
check(Array.isArray(readiness.blockers), "Gatekeeper readiness summary should include a blockers array");
check(readiness.gatekeeperAccepted === false || readiness.blockers.length === 0, "accepted Gatekeeper summary should not include blockers");

if (failures.length > 0) {
  fail("Gatekeeper readiness validation failed.", failures.map((failure) => `- ${failure}`).join("\n"));
}

console.log("GrooveForge Gatekeeper readiness smoke passed.");
console.log(`- Summary: ${relative(readinessPath)}`);
console.log(`- Installed app accepted: ${readiness.assessments?.installedApp?.accepted === true ? "yes" : "no"}`);
console.log(`- DMG accepted: ${readiness.assessments?.dmg?.accepted === true ? "yes" : "no"}`);
console.log(`- Gatekeeper ready: ${readiness.gatekeeperAccepted ? "yes" : "no"}`);
if (readiness.blockers.length > 0) {
  console.log(`- Blockers: ${readiness.blockers.join(" | ")}`);
}
console.log("- Network: no Apple notary submission attempted");
console.log("- Not claimed: Gatekeeper approval, Developer ID signing, notarization, auto-update, app-store submission, or external distribution-channel QA");
