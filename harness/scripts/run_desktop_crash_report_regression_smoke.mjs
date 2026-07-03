#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  isMacAppKitAbort,
  isMacDyldFrameworkAbort,
  macGuiLaunchAbortDetails,
  macGuiLaunchBlockDetails
} from "./desktop_gui_launch_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const appName = "GrooveForge";
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const platformArch = `${process.platform}-${process.arch}`;
const packageRoot = path.join(root, "build", "desktop", `${appName}-${platformArch}`);
const markdownPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-desktop-crash-report-regression-smoke.md`);
const jsonPath = path.join(packageRoot, `${appName}-${packageJson.version}-${platformArch}-desktop-crash-report-regression-smoke.json`);
const failures = [];

const squirrelDyldReportShape = [
  "Process: GrooveForge [15208]",
  "Identifier: app.grooveforge.desktop",
  "Exception Type: EXC_CRASH (SIGABRT)",
  "Termination Reason: Namespace DYLD, Code 1, Library missing",
  "Library not loaded: @rpath/Squirrel.framework/Squirrel",
  "Referenced from: /Users/USER/*/GrooveForge.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Electron Framework",
  "Reason: tried: '/Users/USER/GrooveForge.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Libraries/Squirrel.framework/Squirrel' (no such file), '/Users/USER/GrooveForge.app/Contents/Frameworks/Squirrel.framework/Squirrel' (code signature invalid)",
  "fatalDyldError: 1"
].join("\n");

const squirrelDyldCodeSignatureReportShape = [
  "Process: GrooveForge [15208]",
  "Path: /Users/USER/*/GrooveForge.app/Contents/MacOS/GrooveForge",
  "Identifier: app.grooveforge.desktop",
  "Exception Type: EXC_CRASH (SIGABRT)",
  "Termination Reason: Namespace DYLD, Code 1, Library missing",
  "Library not loaded: @rpath/Squirrel.framework/Squirrel",
  "Referenced from: /Users/USER/*/GrooveForge.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Electron Framework",
  "Reason: tried: '/Users/USER/*/GrooveForge.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Libraries/Squirrel.framework/Squirrel' (no such file), '/Users/USER/*/GrooveForge.app/Contents/Frameworks/Squirrel.framework/Squirrel' (code signature in sanitized nested framework blocked dyld loading)",
  "Responsible Process: Codex",
  "fatalDyldError: 1"
].join("\n");

const squirrelDyldStaleWorktreeCodeSignatureReportShape = [
  "Process: GrooveForge [15208]",
  "Path: /Users/USER/*/GrooveForge.app/Contents/MacOS/GrooveForge",
  "Identifier: app.grooveforge.desktop",
  "Exception Type: EXC_CRASH (SIGABRT)",
  "Termination Reason: Namespace DYLD, Code 1, Library missing",
  "Library not loaded: @rpath/Squirrel.framework/Squirrel",
  "Referenced from: /Users/USER/*/GrooveForge.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Electron Framework",
  "Reason: tried: '/Users/USER/workspace/GITHUB/GrooveForge/.worktree/plan-1278-audience-session-result-smoke/build/desktop/GrooveForge-darwin-arm64/GrooveForge.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Libraries/Squirrel.framework/Squirrel' (no such file), '/Users/USER/workspace/GITHUB/GrooveForge/.worktree/plan-1278-audience-session-result-smoke/build/desktop/GrooveForge-darwin-arm64/GrooveForge.app/Contents/Frameworks/Squirrel.framework/Squirrel' (code signature in sanitized stale worktree framework blocked dyld loading)",
  "Responsible Process: Codex",
  "fatalDyldError: 1"
].join("\n");

const appKitAbortReportShape = [
  "Process: Electron [3070]",
  "Identifier: com.github.Electron",
  "Exception Type: EXC_CRASH (SIGABRT)",
  "Termination Reason: Namespace SIGNAL, Code 6, Abort trap: 6",
  "Application Specific Information:",
  "abort() called",
  "Thread 0 Crashed:: Dispatch queue: com.apple.main-thread",
  "___RegisterApplication_block_invoke",
  "_RegisterApplication",
  "GetCurrentProcess",
  "-[NSApplication init]",
  "Responsible Process: Codex",
  "Coalition: com.openai.codex"
].join("\n");

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function escapeCell(value) {
  return String(value ?? "none").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function includesAll(text, needles) {
  return needles.every((needle) => text.includes(needle));
}

async function readSource(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${relativePath} is missing`);
    return "";
  }
  return readFile(filePath, "utf8");
}

function formatRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return "| none | no | none | none | no |";
  }
  return rows
    .map(
      (row) =>
        `| ${escapeCell(row.id)} | ${row.ready ? "yes" : "no"} | ${escapeCell(row.source)} | ${escapeCell(row.evidence)} | ${row.valueRecorded === false ? "no" : "yes"} |`
    )
    .join("\n");
}

const guiGuardSource = await readSource("harness/scripts/desktop_gui_launch_guard.mjs");
const dependencyGuardSource = await readSource("harness/scripts/desktop_bundle_dependency_guard.mjs");
const packageSmokeSource = await readSource("harness/scripts/run_desktop_package_smoke.mjs");
const launchSmokeSource = await readSource("harness/scripts/run_desktop_launch_smoke.mjs");
const pkgPayloadSmokeSource = await readSource("harness/scripts/run_desktop_pkg_payload_smoke.mjs");
const installSmokeSource = await readSource("harness/scripts/run_desktop_install_smoke.mjs");
const packageJsonText = await readSource("package.json");

const dyldClassified = isMacDyldFrameworkAbort({ output: squirrelDyldReportShape });
const appKitClassified = isMacAppKitAbort({ code: 6, signal: null, output: appKitAbortReportShape });
const dyldDiagnostic = macGuiLaunchAbortDetails("npm run desktop:package-smoke", {
  code: 1,
  signal: null,
  output: squirrelDyldReportShape
});
const dyldCodeSignatureClassified = isMacDyldFrameworkAbort({ output: squirrelDyldCodeSignatureReportShape });
const dyldCodeSignatureDiagnostic = macGuiLaunchAbortDetails("npm run desktop:package-smoke", {
  code: 1,
  signal: null,
  output: squirrelDyldCodeSignatureReportShape
});
const dyldStaleWorktreeCodeSignatureClassified = isMacDyldFrameworkAbort({
  output: squirrelDyldStaleWorktreeCodeSignatureReportShape
});
const dyldStaleWorktreeCodeSignatureDiagnostic = macGuiLaunchAbortDetails("npm run desktop:package-smoke", {
  code: 1,
  signal: null,
  output: squirrelDyldStaleWorktreeCodeSignatureReportShape
});
const appKitDiagnostic = macGuiLaunchAbortDetails("npm run desktop:launch-smoke", {
  code: 6,
  signal: null,
  output: appKitAbortReportShape
});
const restrictedGuiPreflight = macGuiLaunchBlockDetails("npm run desktop:launch-smoke", { CODEX_SANDBOX: "seatbelt" }, "darwin");

const reportRows = [
  {
    id: "squirrel-dyld-report",
    ready:
      dyldClassified &&
      dyldDiagnostic.includes("Diagnostic: Electron failed during macOS dyld framework loading") &&
      dyldDiagnostic.includes("@rpath/Squirrel.framework/Squirrel") &&
      dyldDiagnostic.includes("strict code signatures"),
    source: "sanitized attached GrooveForge report shape",
    evidence: "Namespace DYLD / Library missing / @rpath/Squirrel.framework/Squirrel / no such file or code signature",
    valueRecorded: false
  },
  {
    id: "squirrel-dyld-code-signature-report",
    ready:
      dyldCodeSignatureClassified &&
      dyldCodeSignatureDiagnostic.includes("Diagnostic: Electron failed during macOS dyld framework loading") &&
      dyldCodeSignatureDiagnostic.includes("@rpath/Squirrel.framework/Squirrel") &&
      dyldCodeSignatureDiagnostic.includes("strict code signatures"),
    source: "sanitized attached GrooveForge code-signature dyld report shape",
    evidence: "Namespace DYLD / Library missing / @rpath/Squirrel.framework/Squirrel / code signature in nested framework",
    valueRecorded: false
  },
  {
    id: "squirrel-dyld-stale-worktree-code-signature-report",
    ready:
      dyldStaleWorktreeCodeSignatureClassified &&
      dyldStaleWorktreeCodeSignatureDiagnostic.includes("Diagnostic: Electron failed during macOS dyld framework loading") &&
      dyldStaleWorktreeCodeSignatureDiagnostic.includes("@rpath/Squirrel.framework/Squirrel") &&
      dyldStaleWorktreeCodeSignatureDiagnostic.includes("fresh `npm run build`") &&
      dyldStaleWorktreeCodeSignatureDiagnostic.includes("strict code signatures"),
    source: "sanitized attached GrooveForge stale worktree dyld report shape",
    evidence: "Namespace DYLD / @rpath/Squirrel.framework/Squirrel / plan worktree artifact / nested framework code signature",
    valueRecorded: false
  },
  {
    id: "electron-appkit-report",
    ready:
      appKitClassified &&
      appKitDiagnostic.includes("Crash signature: Electron SIGABRT / exit code 6 / Abort trap: 6") &&
      appKitDiagnostic.includes("approved unsandboxed GUI/AppKit process access"),
    source: "sanitized attached Electron report shape",
    evidence: "Namespace SIGNAL / Code 6 / Abort trap / AppKit registration",
    valueRecorded: false
  },
  {
    id: "restricted-gui-preflight",
    ready:
      Boolean(restrictedGuiPreflight) &&
      restrictedGuiPreflight.includes("Electron GUI launch blocked before macOS AppKit registration.") &&
      restrictedGuiPreflight.includes("GROOVEFORGE_ALLOW_RESTRICTED_GUI_ELECTRON"),
    source: "desktop_gui_launch_guard.mjs",
    evidence: "CODEX_SANDBOX preflight blocks known non-GUI AppKit abort path",
    valueRecorded: false
  }
];

const guardRows = [
  {
    id: "dyld-classifier",
    ready: includesAll(guiGuardSource, [
      "isMacDyldFrameworkAbort",
      "Namespace DYLD",
      "@rpath/Squirrel.framework/Squirrel",
      "strict code signatures"
    ]),
    source: "harness/scripts/desktop_gui_launch_guard.mjs",
    evidence: "Squirrel/ReactiveObjC/Mantle dyld framework abort classifier and diagnostic",
    valueRecorded: false
  },
  {
    id: "appkit-classifier",
    ready: includesAll(guiGuardSource, [
      "isMacAppKitAbort",
      "Namespace SIGNAL,\\s*Code 6",
      "code === 6",
      "approved unsandboxed GUI/AppKit process access"
    ]),
    source: "harness/scripts/desktop_gui_launch_guard.mjs",
    evidence: "AppKit SIGABRT/exit-code-6 crash report classifier and rerun action",
    valueRecorded: false
  },
  {
    id: "bundle-dependency-guard",
    ready: includesAll(dependencyGuardSource, [
      "@rpath/Squirrel.framework/Squirrel",
      "parseOtoolRpaths",
      "dyldCandidateRows",
      "allRequiredDependenciesDyldLoadable",
      "allRequiredDependenciesSignatureCompatible",
      "signatureCompatibilityEvidence"
    ]),
    source: "harness/scripts/desktop_bundle_dependency_guard.mjs",
    evidence: "Electron runtime framework rpath, presence, signature, compatibility, and loadability guard",
    valueRecorded: false
  }
];

const launchBearingRows = [
  {
    id: "package-smoke",
    ready: includesAll(packageSmokeSource, [
      "electronFrameworkDependencyReport",
      "allRequiredDependenciesDyldLoadable",
      "allRequiredDependenciesSignatureCompatible",
      "macGuiLaunchAbortDetails(\"npm run desktop:package-smoke\""
    ]),
    source: "harness/scripts/run_desktop_package_smoke.mjs",
    evidence: "portable app package checks runtime framework loadability before launch-bearing evidence",
    valueRecorded: false
  },
  {
    id: "pkg-payload-smoke",
    ready: includesAll(pkgPayloadSmokeSource, [
      "electronFrameworkDependencyReport",
      "allRequiredDependenciesDyldLoadable",
      "allRequiredDependenciesSignatureCompatible",
      "macGuiLaunchAbortDetails(\"npm run desktop:pkg-payload-smoke\""
    ]),
    source: "harness/scripts/run_desktop_pkg_payload_smoke.mjs",
    evidence: "extracted PKG payload checks runtime framework loadability before launch-bearing evidence",
    valueRecorded: false
  },
  {
    id: "install-smoke",
    ready: includesAll(installSmokeSource, [
      "electronFrameworkDependencyReport",
      "allRequiredDependenciesDyldLoadable",
      "allRequiredDependenciesSignatureCompatible",
      "macGuiLaunchAbortDetails(\"npm run desktop:install-smoke\""
    ]),
    source: "harness/scripts/run_desktop_install_smoke.mjs",
    evidence: "simulated installed app checks runtime framework loadability before launch-bearing evidence",
    valueRecorded: false
  },
  {
    id: "launch-smoke",
    ready: includesAll(launchSmokeSource, [
      "macGuiLaunchBlockDetails(\"npm run desktop:launch-smoke\")",
      "macGuiLaunchAbortDetails(\"npm run desktop:launch-smoke\"",
      "GROOVEFORGE_DESKTOP_LAUNCH_SMOKE"
    ]),
    source: "harness/scripts/run_desktop_launch_smoke.mjs",
    evidence: "live production launch smoke uses GUI preflight and abort diagnostics",
    valueRecorded: false
  }
];

const commandRows = [
  {
    id: "package-script",
    ready: packageJson.scripts?.["desktop:crash-report-regression-smoke"] === "node harness/scripts/run_desktop_crash_report_regression_smoke.mjs",
    source: "package.json",
    evidence: "desktop crash report regression smoke command is registered",
    valueRecorded: false
  },
  {
    id: "verify-chain",
    ready:
      typeof packageJson.scripts?.verify === "string" &&
      packageJson.scripts.verify.includes("npm run desktop:crash-report-regression-smoke") &&
      packageJson.scripts.verify.indexOf("npm run desktop:smoke") <
        packageJson.scripts.verify.indexOf("npm run desktop:crash-report-regression-smoke") &&
      packageJson.scripts.verify.indexOf("npm run desktop:crash-report-regression-smoke") <
        packageJson.scripts.verify.indexOf("npm run desktop:launch-smoke"),
    source: "package.json",
    evidence: "verify runs crash-report regression after entry smoke and before live launch",
    valueRecorded: false
  },
  {
    id: "static-script-source",
    ready: packageJsonText.includes("run_desktop_crash_report_regression_smoke.mjs"),
    source: "package.json",
    evidence: "script path is present in package metadata",
    valueRecorded: false
  }
];

const allRows = [...reportRows, ...guardRows, ...launchBearingRows, ...commandRows];
const summary = {
  smokeReady: allRows.every((row) => row.ready === true && row.valueRecorded === false),
  command: "npm run desktop:crash-report-regression-smoke",
  markdownPath: relative(markdownPath),
  jsonPath: relative(jsonPath),
  reportRows,
  guardRows,
  launchBearingRows,
  commandRows,
  rowCount: allRows.length,
  readyRowCount: allRows.filter((row) => row.ready === true).length,
  dyldReportClassified: dyldClassified,
  dyldCodeSignatureReportClassified: dyldCodeSignatureClassified,
  dyldStaleWorktreeCodeSignatureReportClassified: dyldStaleWorktreeCodeSignatureClassified,
  appKitReportClassified: appKitClassified,
  restrictedGuiPreflightReady: Boolean(restrictedGuiPreflight),
  squirrelDyldInstallName: "@rpath/Squirrel.framework/Squirrel",
  privateValuesRecorded: false,
  fullCrashReportRecorded: false,
  userPathRecorded: false,
  networkProbeAttempted: false,
  releaseUploadAttempted: false,
  signingAttempted: false,
  appleNotarySubmissionAttempted: false,
  developerIdSigningClaimed: false,
  notarizationClaimed: false,
  gatekeeperApprovalClaimed: false,
  autoUpdateClaimed: false,
  manualQaApprovalClaimed: false,
  externalDistributionClaimed: false,
  valueRecorded: false
};

check(summary.smokeReady, "desktop crash report regression smoke should have all rows ready and value-free");
check(summary.dyldReportClassified === true, "desktop crash report regression should classify the Squirrel dyld report");
check(
  summary.dyldCodeSignatureReportClassified === true,
  "desktop crash report regression should classify the attached Squirrel dyld code-signature report"
);
check(
  summary.dyldStaleWorktreeCodeSignatureReportClassified === true,
  "desktop crash report regression should classify the attached stale worktree Squirrel dyld code-signature report"
);
check(summary.appKitReportClassified === true, "desktop crash report regression should classify the AppKit abort report");
check(summary.restrictedGuiPreflightReady === true, "desktop crash report regression should prove restricted GUI preflight readiness");
check(allRows.every((row) => row.valueRecorded === false), "desktop crash report regression rows should not record values");
check(!squirrelDyldReportShape.includes("taejungkim"), "desktop crash report regression should not record real user paths");
check(!squirrelDyldCodeSignatureReportShape.includes("taejungkim"), "desktop crash report regression should not record real user paths");
check(!squirrelDyldStaleWorktreeCodeSignatureReportShape.includes("taejungkim"), "desktop crash report regression should not record real user paths");
check(!appKitAbortReportShape.includes("taejungkim"), "desktop crash report regression should not record real user paths");
check(summary.privateValuesRecorded === false, "desktop crash report regression should not record private values");
check(summary.fullCrashReportRecorded === false, "desktop crash report regression should not record full crash reports");
check(summary.externalDistributionClaimed === false, "desktop crash report regression should not claim external distribution");

if (failures.length > 0) {
  console.error("GrooveForge desktop crash report regression smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const markdown = `# GrooveForge Desktop Crash Report Regression Smoke

- Smoke ready: ${summary.smokeReady ? "yes" : "no"}
- Squirrel dyld report classified: ${summary.dyldReportClassified ? "yes" : "no"}
- Squirrel dyld code-signature report classified: ${summary.dyldCodeSignatureReportClassified ? "yes" : "no"}
- Squirrel dyld stale-worktree code-signature report classified: ${summary.dyldStaleWorktreeCodeSignatureReportClassified ? "yes" : "no"}
- AppKit abort report classified: ${summary.appKitReportClassified ? "yes" : "no"}
- Restricted GUI preflight ready: ${summary.restrictedGuiPreflightReady ? "yes" : "no"}
- Squirrel dyld install name: \`${summary.squirrelDyldInstallName}\`
- Full crash report recorded: no
- User path recorded: no
- Private values recorded: no
- Network probe attempted: no
- Release upload attempted: no
- Signing attempted: no
- Apple notary submission attempted: no
- External distribution claimed: no

## Report Shapes

| id | ready | source | evidence | value recorded |
|---|---:|---|---|---:|
${formatRows(summary.reportRows)}

## Guard Coverage

| id | ready | source | evidence | value recorded |
|---|---:|---|---|---:|
${formatRows(summary.guardRows)}

## Launch-Bearing Coverage

| id | ready | source | evidence | value recorded |
|---|---:|---|---|---:|
${formatRows(summary.launchBearingRows)}

## Command Coverage

| id | ready | source | evidence | value recorded |
|---|---:|---|---|---:|
${formatRows(summary.commandRows)}
`;

await mkdir(packageRoot, { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(markdownPath, markdown, "utf8");

console.log("GrooveForge desktop crash report regression smoke passed.");
console.log(`- Markdown: ${relative(markdownPath)}`);
console.log(`- JSON: ${relative(jsonPath)}`);
console.log(`- Squirrel dyld report classified: ${summary.dyldReportClassified ? "yes" : "no"}`);
console.log(`- Squirrel dyld code-signature report classified: ${summary.dyldCodeSignatureReportClassified ? "yes" : "no"}`);
console.log(`- Squirrel dyld stale-worktree code-signature report classified: ${summary.dyldStaleWorktreeCodeSignatureReportClassified ? "yes" : "no"}`);
console.log(`- AppKit abort report classified: ${summary.appKitReportClassified ? "yes" : "no"}`);
console.log(`- Restricted GUI preflight ready: ${summary.restrictedGuiPreflightReady ? "yes" : "no"}`);
console.log(`- Guard rows ready: ${summary.guardRows.filter((row) => row.ready).length}/${summary.guardRows.length}`);
console.log(`- Launch-bearing rows ready: ${summary.launchBearingRows.filter((row) => row.ready).length}/${summary.launchBearingRows.length}`);
console.log("- Private values recorded: no");
console.log("- Network: no distribution channel probe, release upload, Apple notary submission, or signing attempted");
console.log("- Not claimed: Developer ID signing, notarization, Gatekeeper approval, auto-update, manual QA approval, app-store submission, or external distribution completion");
