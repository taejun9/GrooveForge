#!/usr/bin/env node

/**
 * 역할: Electron main/preload/renderer 진입 파일과 패키지 설정이 production 데스크톱 실행 계약에 맞는지 정적으로 검사한다.
 * 흐름: 빌드 산출물과 package metadata를 읽고 import·보안 옵션·smoke hook·필수 문자열을 상호 대조한다.
 * 안전 경계: 하나라도 누락되면 실패 목록을 반환하며 앱 실행·서명·네트워크 연결 없이 읽기 전용으로 동작한다.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { isMacAppKitAbort, isMacDyldFrameworkAbort, macGuiLaunchAbortDetails, macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const failures = [];
const expectedNativeMenuCommands = [
  "open-project",
  "save-project",
  "save-project-and-close",
  "undo",
  "redo",
  "quick-actions",
  "command-reference",
  "toggle-playback",
  "delete-selected-event"
];
const expectedRendererMenuHandlers = {
  "open-project": "void handleOpenProject();",
  "save-project": "void handleSaveProject();",
  "save-project-and-close": "void handleSaveProjectAndClose();",
  undo: "undoProject();",
  redo: "redoProject();",
  "quick-actions": "openQuickActions();",
  "command-reference": "openCommandReference();",
  "toggle-playback": "togglePlayback();",
  "delete-selected-event": "deleteSelectedEvent();"
};

function check(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function readText(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!existsSync(filePath)) {
    failures.push(`${relativePath} is missing`);
    return "";
  }
  return readFileSync(filePath, "utf8");
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    failures.push(`${relativePath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function checkIncludes(text, needle, label) {
  check(text.includes(needle), `${label} should include ${needle}`);
}

function textBetween(text, startNeedle, endNeedle, label) {
  const start = text.indexOf(startNeedle);
  if (start < 0) {
    failures.push(`${label} should include ${startNeedle}`);
    return "";
  }

  const end = text.indexOf(endNeedle, start);
  if (end < 0) {
    failures.push(`${label} should include ${endNeedle} after ${startNeedle}`);
    return text.slice(start);
  }

  return text.slice(start, end);
}

function checkBuiltArtifacts() {
  check(existsSync(path.join(root, "dist/index.html")), "dist/index.html is missing; run npm run build before desktop smoke");
  check(
    existsSync(path.join(root, "dist-electron/main.js")),
    "dist-electron/main.js is missing; run npm run build before desktop smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron/updateFeedConfig.js")),
    "dist-electron/updateFeedConfig.js is missing; run npm run build before desktop smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron/nativeDialogOptions.js")),
    "dist-electron/nativeDialogOptions.js is missing; run npm run build before desktop smoke"
  );
  check(
    existsSync(path.join(root, "dist-electron/preload.cjs")),
    "dist-electron/preload.cjs is missing; run npm run build before desktop smoke"
  );

  const assetDir = path.join(root, "dist/assets");
  if (!existsSync(assetDir)) {
    failures.push("dist/assets is missing; renderer assets were not built");
    return;
  }

  const assets = readdirSync(assetDir);
  check(assets.some((asset) => asset.endsWith(".js")), "dist/assets should contain renderer JavaScript chunks");
  check(assets.some((asset) => asset.endsWith(".css")), "dist/assets should contain renderer CSS");
  check(
    assets.some((asset) => asset.includes("workstation-app-quick-actions")),
    "dist/assets should contain the workstation Quick Actions chunk"
  );
}

function checkPackageScripts() {
  const packageJson = readJson("package.json");
  if (!packageJson) {
    return;
  }

  check(packageJson.main === "dist-electron/main.js", "package.json main should point at dist-electron/main.js");
  checkIncludes(packageJson.description ?? "", "desktop beat workstation", "package.json description");
  checkIncludes(packageJson.scripts?.build ?? "", "tsc -p tsconfig.electron.json", "package.json build script");
  checkIncludes(packageJson.scripts?.desktop ?? "", "run_desktop_app.mjs", "package.json desktop script");
  checkIncludes(packageJson.scripts?.["desktop:app"] ?? "", "npm run build", "package.json desktop:app script");
  checkIncludes(
    packageJson.scripts?.["desktop:app"] ?? "",
    "run_desktop_package_smoke.mjs --package-only",
    "package.json desktop:app script"
  );
  checkIncludes(packageJson.scripts?.["desktop:dmg"] ?? "", "npm run desktop:app", "package.json desktop:dmg script");
  checkIncludes(packageJson.scripts?.["desktop:dmg"] ?? "", "npm run desktop:dmg-smoke", "package.json desktop:dmg script");
  checkIncludes(
    packageJson.scripts?.["desktop:multigenre-qa"] ?? "",
    "run_desktop_multigenre_actual_app_qa.mjs",
    "package.json desktop:multigenre-qa script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:manual-qa"] ?? "",
    "run_desktop_manual_qa.mjs",
    "package.json desktop:manual-qa script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:movement-qa"] ?? "",
    "run_desktop_manual_qa.mjs --auto-movement-qa",
    "package.json desktop:movement-qa script"
  );
  checkIncludes(packageJson.scripts?.["desktop:smoke"] ?? "", "run_desktop_entry_smoke.mjs", "package.json desktop:smoke script");
  checkIncludes(
    packageJson.scripts?.["desktop:crash-report-regression-smoke"] ?? "",
    "run_desktop_crash_report_regression_smoke.mjs",
    "package.json desktop:crash-report-regression-smoke script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:project-io-smoke"] ?? "",
    "run_desktop_project_io_smoke.mjs",
    "package.json desktop:project-io-smoke script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:close-flow-smoke"] ?? "",
    "run_desktop_close_flow_smoke.mjs",
    "package.json desktop:close-flow-smoke script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:packaged-project-io-smoke"] ?? "",
    "run_desktop_packaged_project_io_smoke.mjs",
    "package.json desktop:packaged-project-io-smoke script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:installed-project-io-smoke"] ?? "",
    "run_desktop_installed_project_io_smoke.mjs",
    "package.json desktop:installed-project-io-smoke script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:pkg-payload-smoke"] ?? "",
    "run_desktop_pkg_payload_smoke.mjs",
    "package.json desktop:pkg-payload-smoke script"
  );
  checkIncludes(
    packageJson.scripts?.["desktop:pkg-payload-project-io-smoke"] ?? "",
    "run_desktop_pkg_payload_project_io_smoke.mjs",
    "package.json desktop:pkg-payload-project-io-smoke script"
  );
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run build", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:crash-report-regression-smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:project-io-smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:close-flow-smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:packaged-project-io-smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:pkg-payload-smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:pkg-payload-project-io-smoke", "package.json verify script");
  checkIncludes(packageJson.scripts?.verify ?? "", "npm run desktop:installed-project-io-smoke", "package.json verify script");
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run build") < (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:smoke"),
    "package.json verify should run desktop:smoke after npm run build"
  );
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:smoke") <
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:crash-report-regression-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:crash-report-regression-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:launch-smoke"),
    "package.json verify should run desktop:crash-report-regression-smoke after entry smoke and before live launch smoke"
  );
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:launch-smoke") <
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:project-io-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:project-io-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:close-flow-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:close-flow-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:package-smoke"),
    "package.json verify should run desktop:project-io-smoke and desktop:close-flow-smoke after launch smoke and before package smoke"
  );
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:package-smoke") <
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:packaged-project-io-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:packaged-project-io-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:adhoc-sign-smoke"),
    "package.json verify should run desktop:packaged-project-io-smoke after package smoke and before the dedicated hardened-runtime ad-hoc signing smoke"
  );
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:pkg-smoke") <
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:pkg-payload-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:pkg-payload-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:pkg-payload-project-io-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:pkg-payload-project-io-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:install-smoke"),
    "package.json verify should run desktop:pkg-payload-smoke and desktop:pkg-payload-project-io-smoke after pkg smoke and before install smoke"
  );
  check(
    (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:install-smoke") <
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:installed-project-io-smoke") &&
      (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:installed-project-io-smoke") <
        (packageJson.scripts?.verify ?? "").indexOf("npm run desktop:gatekeeper-readiness-smoke"),
    "package.json verify should run desktop:installed-project-io-smoke after install smoke and before Gatekeeper readiness"
  );
}

function checkDesktopGuiLaunchGuardContract() {
  const electronMainSource = readText("electron/main.ts");
  const guardSource = readText("harness/scripts/desktop_gui_launch_guard.mjs");
  const bundleDependencyGuardSource = readText("harness/scripts/desktop_bundle_dependency_guard.mjs");
  const desktopAppSource = readText("harness/scripts/run_desktop_app.mjs");
  const manualQaSource = readText("harness/scripts/run_desktop_manual_qa.mjs");
  const launchSmokeSource = readText("harness/scripts/run_desktop_launch_smoke.mjs");
  const projectIoSmokeSource = readText("harness/scripts/run_desktop_project_io_smoke.mjs");
  const closeFlowSmokeSource = readText("harness/scripts/run_desktop_close_flow_smoke.mjs");
  const packageSmokeSource = readText("harness/scripts/run_desktop_package_smoke.mjs");
  const packagedProjectIoSmokeSource = readText("harness/scripts/run_desktop_packaged_project_io_smoke.mjs");
  const adhocSignSmokeSource = readText("harness/scripts/run_desktop_adhoc_sign_smoke.mjs");
  const dmgSmokeSource = readText("harness/scripts/run_desktop_dmg_smoke.mjs");
  const pkgPayloadSmokeSource = readText("harness/scripts/run_desktop_pkg_payload_smoke.mjs");
  const pkgPayloadProjectIoSmokeSource = readText("harness/scripts/run_desktop_pkg_payload_project_io_smoke.mjs");
  const installSmokeSource = readText("harness/scripts/run_desktop_install_smoke.mjs");
  const installedProjectIoSmokeSource = readText("harness/scripts/run_desktop_installed_project_io_smoke.mjs");

  const projectIoWatchdogMs = Number(/const projectIoSmokeTimeoutMs = (\d+);/.exec(electronMainSource)?.[1] ?? Number.NaN);
  const projectIoParentTimeouts = [
    projectIoSmokeSource,
    packagedProjectIoSmokeSource,
    pkgPayloadProjectIoSmokeSource,
    installedProjectIoSmokeSource
  ].map((source) => Number(/const timeoutMs = (\d+);/.exec(source)?.[1] ?? Number.NaN));
  checkIncludes(electronMainSource, "grooveforge-project-io-smoke-${process.pid}", "electron/main.ts project IO session partition");
  checkIncludes(electronMainSource, "runProjectIoSmokeRendererStep", "electron/main.ts project IO staged renderer checks");
  check(
    Number.isFinite(projectIoWatchdogMs) &&
      projectIoParentTimeouts.every((timeout) => Number.isFinite(timeout) && timeout > projectIoWatchdogMs),
    "project IO parent harness timeouts should exceed the in-app project IO watchdog"
  );

  checkIncludes(guardSource, "CODEX_SANDBOX", "desktop GUI launch guard");
  checkIncludes(guardSource, "isMacAppKitAbort", "desktop GUI launch guard");
  checkIncludes(guardSource, "macGuiLaunchAbortDetails", "desktop GUI launch guard");
  checkIncludes(guardSource, "Electron GUI launch blocked before macOS AppKit registration.", "desktop GUI launch guard");
  checkIncludes(guardSource, "macOS Crash Reporter logs", "desktop GUI launch guard");
  checkIncludes(guardSource, "GROOVEFORGE_ALLOW_RESTRICTED_GUI_ELECTRON", "desktop GUI launch guard");
  checkIncludes(guardSource, "com\\.openai\\.codex", "desktop GUI launch guard");
  checkIncludes(guardSource, "Namespace SIGNAL,\\s*Code 6", "desktop GUI launch guard");
  checkIncludes(guardSource, "code === 6", "desktop GUI launch guard");
  checkIncludes(bundleDependencyGuardSource, "parseOtoolRpaths", "desktop bundle dependency guard");
  checkIncludes(bundleDependencyGuardSource, "dyldCandidateRows", "desktop bundle dependency guard");
  checkIncludes(bundleDependencyGuardSource, "appExecutableLoadCommandsReady", "desktop bundle dependency guard");
  checkIncludes(bundleDependencyGuardSource, "signatureCompatibilityEvidence", "desktop bundle dependency guard");
  checkIncludes(bundleDependencyGuardSource, "allRequiredDependenciesSignatureCompatible", "desktop bundle dependency guard");
  checkIncludes(bundleDependencyGuardSource, "allRequiredDependenciesDyldLoadable", "desktop bundle dependency guard");
  checkIncludes(desktopAppSource, "isMacAppKitAbort({ code, signal })", "harness/scripts/run_desktop_app.mjs");
  checkIncludes(desktopAppSource, "macGuiLaunchAbortDetails(\"npm run desktop\"", "harness/scripts/run_desktop_app.mjs");
  checkIncludes(desktopAppSource, "macGuiLaunchBlockDetails(\"npm run desktop\")", "harness/scripts/run_desktop_app.mjs");
  checkIncludes(manualQaSource, 'GROOVEFORGE_DESKTOP_MANUAL_QA: "1"', "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "workstation.starterProject", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "sourceAndTargetDiffer", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "visible-stable-manual-qa", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, 'args.has("--auto-song-qa")', "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, 'GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_SONG: "1"', "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, 'args.has("--auto-movement-qa")', "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, 'GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_MOVEMENT: "1"', "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "parseMovementSpec", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "readExternalRegularFile", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "collectExternalSourcePostflight", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "persistMovementExternalSourcePostflight", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "externalSourceSha256", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "sourceUnchanged", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "changed external source hash", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "writeOwnedFixtureOrVerify", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "Movement QA Save target already exists", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, 'args.has("--safety-self-test")', "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, 'const manualQaSentinelName = ".grooveforge-manual-qa-owned.json"', "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "manualQaAllowedBase", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "assertExistingComponentsDoNotSymlink", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "assertSafeWorkspaceTarget", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "existing empty non-owned workspace", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "intermediate symbolic-link escape", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "final symbolic-link target", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "tampered ownership sentinel", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "stale/tampered build provenance", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, 'const provenanceBuildRoots = ["dist", "dist-electron"]', "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "buildProvenanceFileManifest", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "production bundle file inventory changed", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "modified renderer chunk", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "added production bundle file", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "deleted production bundle file", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "production bundle symbolic-link entry", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(electronMainSource, "buildManualQaProvenanceFileManifestSync", "electron/main.ts");
  checkIncludes(electronMainSource, "Manual QA production bundle inventory changed after launcher provenance capture.", "electron/main.ts");
  checkIncludes(manualQaSource, "GROOVEFORGE_DESKTOP_MANUAL_QA_MANIFEST_SHA256", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(manualQaSource, "GROOVEFORGE_DESKTOP_MANUAL_QA_OWNERSHIP_TOKEN", "harness/scripts/run_desktop_manual_qa.mjs");
  checkIncludes(launchSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:launch-smoke\")", "harness/scripts/run_desktop_launch_smoke.mjs");
  checkIncludes(launchSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:launch-smoke\"", "harness/scripts/run_desktop_launch_smoke.mjs");
  checkIncludes(projectIoSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:project-io-smoke\")", "harness/scripts/run_desktop_project_io_smoke.mjs");
  checkIncludes(projectIoSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:project-io-smoke\"", "harness/scripts/run_desktop_project_io_smoke.mjs");
  checkIncludes(closeFlowSmokeSource, "macGuiLaunchBlockDetails(command)", "harness/scripts/run_desktop_close_flow_smoke.mjs");
  checkIncludes(closeFlowSmokeSource, "macGuiLaunchAbortDetails(command", "harness/scripts/run_desktop_close_flow_smoke.mjs");
  checkIncludes(closeFlowSmokeSource, "GROOVEFORGE_DESKTOP_CLOSE_FLOW_SMOKE", "harness/scripts/run_desktop_close_flow_smoke.mjs");
  checkIncludes(closeFlowSmokeSource, "secondGuardedCloseCompleted", "harness/scripts/run_desktop_close_flow_smoke.mjs");
  checkIncludes(packageSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:package-smoke\")", "harness/scripts/run_desktop_package_smoke.mjs");
  checkIncludes(packageSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:package-smoke\"", "harness/scripts/run_desktop_package_smoke.mjs");
  checkIncludes(packageSmokeSource, "allRequiredDependenciesSignatureCompatible", "harness/scripts/run_desktop_package_smoke.mjs");
  checkIncludes(packageSmokeSource, "allRequiredDependenciesDyldLoadable", "harness/scripts/run_desktop_package_smoke.mjs");
  checkIncludes(packageSmokeSource, 'electron: "43.5.0"', "harness/scripts/run_desktop_package_smoke.mjs exact Electron runtime");
  checkIncludes(packageSmokeSource, 'node: "24.19.0"', "harness/scripts/run_desktop_package_smoke.mjs exact Node runtime");
  checkIncludes(packageSmokeSource, 'ELECTRON_RUN_AS_NODE: "1"', "harness/scripts/run_desktop_package_smoke.mjs executable runtime inspection");
  checkIncludes(packageSmokeSource, 'readPlistString(appPlist, "LSMinimumSystemVersion")', "harness/scripts/run_desktop_package_smoke.mjs minimum macOS inspection");
  checkIncludes(packageSmokeSource, 'includes("--package-only")', "harness/scripts/run_desktop_package_smoke.mjs");
  checkIncludes(
    packageSmokeSource,
    "await rm(packagedApp, { force: true, recursive: true });",
    "harness/scripts/run_desktop_package_smoke.mjs"
  );
  check(
    !packageSmokeSource.includes("await rm(outputRoot, { force: true, recursive: true });"),
    "harness/scripts/run_desktop_package_smoke.mjs should preserve sibling build/desktop evidence"
  );
  checkIncludes(
    packagedProjectIoSmokeSource,
    "macGuiLaunchBlockDetails(\"npm run desktop:packaged-project-io-smoke\")",
    "harness/scripts/run_desktop_packaged_project_io_smoke.mjs"
  );
  checkIncludes(
    packagedProjectIoSmokeSource,
    "macGuiLaunchAbortDetails(\"npm run desktop:packaged-project-io-smoke\"",
    "harness/scripts/run_desktop_packaged_project_io_smoke.mjs"
  );
  checkIncludes(
    packagedProjectIoSmokeSource,
    "allRequiredDependenciesSignatureCompatible",
    "harness/scripts/run_desktop_packaged_project_io_smoke.mjs"
  );
  checkIncludes(adhocSignSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:adhoc-sign-smoke\")", "harness/scripts/run_desktop_adhoc_sign_smoke.mjs");
  checkIncludes(adhocSignSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:adhoc-sign-smoke\"", "harness/scripts/run_desktop_adhoc_sign_smoke.mjs");
  checkIncludes(adhocSignSmokeSource, "allRequiredDependenciesSignatureCompatible", "harness/scripts/run_desktop_adhoc_sign_smoke.mjs");
  checkIncludes(dmgSmokeSource, "electronFrameworkDependencyReport", "harness/scripts/run_desktop_dmg_smoke.mjs");
  checkIncludes(dmgSmokeSource, "allRequiredDependenciesSignatureCompatible", "harness/scripts/run_desktop_dmg_smoke.mjs");
  checkIncludes(pkgPayloadSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:pkg-payload-smoke\")", "harness/scripts/run_desktop_pkg_payload_smoke.mjs");
  checkIncludes(pkgPayloadSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:pkg-payload-smoke\"", "harness/scripts/run_desktop_pkg_payload_smoke.mjs");
  checkIncludes(pkgPayloadSmokeSource, "allRequiredDependenciesSignatureCompatible", "harness/scripts/run_desktop_pkg_payload_smoke.mjs");
  checkIncludes(pkgPayloadSmokeSource, "allRequiredDependenciesDyldLoadable", "harness/scripts/run_desktop_pkg_payload_smoke.mjs");
  checkIncludes(
    pkgPayloadProjectIoSmokeSource,
    "macGuiLaunchBlockDetails(\"npm run desktop:pkg-payload-project-io-smoke\")",
    "harness/scripts/run_desktop_pkg_payload_project_io_smoke.mjs"
  );
  checkIncludes(
    pkgPayloadProjectIoSmokeSource,
    "macGuiLaunchAbortDetails(\"npm run desktop:pkg-payload-project-io-smoke\"",
    "harness/scripts/run_desktop_pkg_payload_project_io_smoke.mjs"
  );
  checkIncludes(installSmokeSource, "macGuiLaunchBlockDetails(\"npm run desktop:install-smoke\")", "harness/scripts/run_desktop_install_smoke.mjs");
  checkIncludes(installSmokeSource, "macGuiLaunchAbortDetails(\"npm run desktop:install-smoke\"", "harness/scripts/run_desktop_install_smoke.mjs");
  checkIncludes(installSmokeSource, "allRequiredDependenciesSignatureCompatible", "harness/scripts/run_desktop_install_smoke.mjs");
  checkIncludes(installSmokeSource, "allRequiredDependenciesDyldLoadable", "harness/scripts/run_desktop_install_smoke.mjs");
  checkIncludes(
    installedProjectIoSmokeSource,
    "macGuiLaunchBlockDetails(\"npm run desktop:installed-project-io-smoke\")",
    "harness/scripts/run_desktop_installed_project_io_smoke.mjs"
  );
  checkIncludes(
    installedProjectIoSmokeSource,
    "macGuiLaunchAbortDetails(\"npm run desktop:installed-project-io-smoke\"",
    "harness/scripts/run_desktop_installed_project_io_smoke.mjs"
  );
  checkIncludes(
    installedProjectIoSmokeSource,
    "allRequiredDependenciesSignatureCompatible",
    "harness/scripts/run_desktop_installed_project_io_smoke.mjs"
  );

  const blocked = macGuiLaunchBlockDetails("npm run desktop:launch-smoke", { CODEX_SANDBOX: "seatbelt" }, "darwin");
  check(Boolean(blocked), "desktop GUI launch guard should block Electron under macOS CODEX_SANDBOX");
  checkIncludes(blocked ?? "", "CODEX_SANDBOX=seatbelt", "desktop GUI launch guard blocked details");
  checkIncludes(blocked ?? "", "Electron SIGABRT / exit code 6 / Abort trap: 6", "desktop GUI launch guard blocked details");
  check(
    isMacAppKitAbort({ signal: "SIGABRT" }) === true,
    "desktop GUI launch abort classifier should recognize macOS SIGABRT launch reports"
  );
  check(
    isMacAppKitAbort({ signal: null, output: "Thread 0 Crashed:: _RegisterApplication com.openai.codex" }) === true,
    "desktop GUI launch abort classifier should recognize AppKit crash report text"
  );
  const attachedCrashReportShape = [
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
  check(
    isMacAppKitAbort({ code: 6, signal: null, output: attachedCrashReportShape }) === true,
    "desktop GUI launch abort classifier should recognize attached exit-code-6 Crash Reporter shape"
  );
  check(
    isMacAppKitAbort({ code: 0, signal: null, output: "AppKit loaded normally" }) === false,
    "desktop GUI launch abort classifier should not treat non-abort AppKit output as a crash"
  );
  const attachedSquirrelDyldReportShape = [
    "Process: GrooveForge [15208]",
    "Identifier: app.grooveforge.desktop",
    "Exception Type: EXC_CRASH (SIGABRT)",
    "Termination Reason: Namespace DYLD, Code 1, Library missing",
    "Library not loaded: @rpath/Squirrel.framework/Squirrel",
    "Referenced from: /Users/USER/*/GrooveForge.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Electron Framework",
    "Reason: tried: '/Users/USER/GrooveForge.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Libraries/Squirrel.framework/Squirrel' (no such file), '/Users/USER/GrooveForge.app/Contents/Frameworks/Squirrel.framework/Squirrel' (code signature invalid)",
    "fatalDyldError: 1"
  ].join("\n");
  check(
    isMacDyldFrameworkAbort({ output: attachedSquirrelDyldReportShape }) === true,
    "desktop GUI launch abort classifier should recognize attached Squirrel dyld framework report shape"
  );
  check(
    isMacDyldFrameworkAbort({ output: "Library not loaded: @rpath/Other.framework/Other" }) === false,
    "desktop GUI launch abort classifier should not treat unrelated dyld output as an Electron runtime framework crash"
  );
  const abortDetails = macGuiLaunchAbortDetails("npm run desktop:launch-smoke", {
    code: 6,
    signal: null,
    output: attachedCrashReportShape
  });
  checkIncludes(abortDetails, "Diagnostic: Electron aborted before GrooveForge emitted launch evidence.", "desktop GUI launch abort details");
  checkIncludes(abortDetails, "Crash signature: Electron SIGABRT / exit code 6 / Abort trap: 6", "desktop GUI launch abort details");
  checkIncludes(abortDetails, "approved unsandboxed GUI/AppKit process access", "desktop GUI launch abort details");
  const signalAbortDetails = macGuiLaunchAbortDetails("npm run desktop:launch-smoke", {
    signal: "SIGABRT",
    output: "Application Specific Information: abort() called"
  });
  checkIncludes(signalAbortDetails, "Crash signature: Electron SIGABRT / exit code 6 / Abort trap: 6", "desktop GUI launch signal abort details");
  const squirrelDyldDetails = macGuiLaunchAbortDetails("npm run desktop:package-smoke", {
    code: 1,
    signal: null,
    output: attachedSquirrelDyldReportShape
  });
  checkIncludes(squirrelDyldDetails, "Diagnostic: Electron failed during macOS dyld framework loading", "desktop GUI launch dyld abort details");
  checkIncludes(squirrelDyldDetails, "@rpath/Squirrel.framework/Squirrel", "desktop GUI launch dyld abort details");
  checkIncludes(squirrelDyldDetails, "strict code signatures", "desktop GUI launch dyld abort details");
  check(
    macGuiLaunchBlockDetails("npm run desktop:launch-smoke", {}, "darwin") === null,
    "desktop GUI launch guard should allow normal macOS GUI launches"
  );
  check(
    macGuiLaunchBlockDetails("npm run desktop:launch-smoke", { CODEX_SANDBOX: "seatbelt" }, "linux") === null,
    "desktop GUI launch guard should not block non-macOS launches"
  );
  check(
    macGuiLaunchBlockDetails(
      "npm run desktop:launch-smoke",
      { CODEX_SANDBOX: "seatbelt", GROOVEFORGE_ALLOW_RESTRICTED_GUI_ELECTRON: "1" },
      "darwin"
    ) === null,
    "desktop GUI launch guard should allow explicit restricted-launch reproduction override"
  );
}

function checkElectronMainContract() {
  const appSource = readText("src/ui/App.tsx");
  const source = readText("electron/main.ts");
  const nativeDialogOptionsSource = readText("electron/nativeDialogOptions.ts");
  const nativeDialogOptionsBuilt = readText("dist-electron/nativeDialogOptions.js");
  const updateFeedConfigSource = readText("electron/updateFeedConfig.ts");
  const updateFeedConfigBuilt = readText("dist-electron/updateFeedConfig.js");
  const built = readText("dist-electron/main.js");
  const label = "electron/main.ts";
  const functionalTabsCollector = textBetween(
    source,
    "async function collectLaunchSmokeFunctionalTabsEvidence(",
    "async function collectLaunchSmokeClosedDetailsEvidence",
    label
  );
  const closedDetailsCollector = textBetween(
    source,
    "async function collectLaunchSmokeClosedDetailsEvidence(",
    "function collectLaunchSmokeClosedDetailsEvidenceWithTimeout(",
    label
  );
  const launchSmokeLazyPreparation = textBetween(
    source,
    "async function prepareLaunchSmokeLazySurfaces(",
    "async function collectLaunchSmokeEvidence(",
    label
  );
  const launchSmokeAudioAnalysisPreparation = textBetween(
    source,
    'type LaunchSmokeAudioAnalysisState =',
    'type LaunchSmokeLazySurfaceState =',
    label
  );
  const launchSmokeMinimumWindowCollector = textBetween(
    source,
    "async function collectLaunchSmokeMinimumWindowEvidence(",
    "type LaunchSmokeLazySurfaceState =",
    label
  );
  const launchSmokeInstaller = textBetween(source, "function installLaunchSmoke(", "function installProjectIoSmoke(", label);
  const launchSmokeBridgeDirectCollector = textBetween(
    source,
    "async function collectLaunchSmokeBridgeDirectEvidence(",
    "function collectLaunchSmokeBridgeDirectEvidenceWithTimeout(",
    label
  );
  const launchSmokePaletteCollector = textBetween(
    source,
    "async function collectLaunchSmokePaletteEvidence(",
    "function collectLaunchSmokePaletteEvidenceWithTimeout(",
    label
  );
  const launchSmokePaletteTimeout = textBetween(
    source,
    "function collectLaunchSmokePaletteEvidenceWithTimeout(",
    "async function waitForLaunchSmokeStarterZoneSurface(",
    label
  );
  const saveProjectHandler = textBetween(
    source,
    'ipcMain.handle("grooveforge:save-project"',
    'ipcMain.handle("grooveforge:open-project"',
    label
  );
  const openProjectHandler = textBetween(
    source,
    'ipcMain.handle("grooveforge:open-project"',
    'ipcMain.handle("grooveforge:save-project-recovery"',
    label
  );
  const launchSmokeAudienceStarterNativeCollector = textBetween(
    source,
    "async function refreshLaunchSmokeAudienceStarterAudio(",
    "async function collectLaunchSmokePaletteEvidence(",
    label
  );
  const launchSmokeBaseDomPreparation = textBetween(
    source,
    "async function prepareLaunchSmokeBaseDomReadyPosture(",
    "type LaunchSmokeVisibleModeToolEvidence =",
    label
  );
  const launchSmokeModeToolCollector = textBetween(
    source,
    "async function collectLaunchSmokeVisibleModeToolEvidence(",
    "async function collectLaunchSmokeNativeChordCardEvidence(",
    label
  );
  const launchSmokeNativeChordCollector = textBetween(
    source,
    "async function collectLaunchSmokeNativeChordCardEvidence(",
    "async function readLaunchSmokePaletteSurfaceState(",
    label
  );
  const launchSmokeStarterSurfaceHelpers = textBetween(
    source,
    "type LaunchSmokeStarterMixDisclosurePosture = {",
    "async function collectLaunchSmokeStarterLandingEvidence(",
    label
  );
  const launchSmokeStarterCollector = textBetween(
    source,
    "async function collectLaunchSmokeStarterLandingEvidence(",
    "function collectLaunchSmokeStarterLandingEvidenceWithTimeout(",
    label
  );
  const launchSmokeModalFocusCollector = textBetween(
    source,
    "async function collectLaunchSmokeModalFocusEvidence(",
    "function collectLaunchSmokeModalFocusEvidenceWithTimeout(",
    label
  );
  const projectIoCollector = textBetween(
    source,
    "async function collectProjectIoSmokeEvidence(",
    "function projectIoSmokeFailures(",
    label
  );
  const projectIoNativeOpen = textBetween(
    source,
    "async function clickProjectIoSmokeNativeOpen(",
    "async function collectProjectIoSmokeEvidence(",
    label
  );
  const beforeUnloadHandler = textBetween(
    appSource,
    "const handleBeforeUnload = (event: BeforeUnloadEvent): void => {",
    'window.addEventListener("beforeunload", handleBeforeUnload);',
    "src/ui/App.tsx"
  );
  const closeFlowNativeTitleEditor = textBetween(
    source,
    "async function prepareCloseFlowSmokeNativeTitleEdit(",
    "function installCloseFlowSmoke(",
    label
  );
  const closeFlowInstaller = textBetween(
    source,
    "function installCloseFlowSmoke(",
    "const manualQaDownloadExtensions =",
    label
  );

  checkIncludes(source, "const isDev = process.env.VITE_DEV_SERVER_URL !== undefined", label);
  checkIncludes(source, 'preload: path.join(__dirname, "preload.cjs")', label);
  checkIncludes(source, "nodeIntegration: false", label);
  checkIncludes(source, "contextIsolation: true", label);
  checkIncludes(source, "sandbox: true", label);
  checkIncludes(source, "backgroundThrottling: !(isLaunchSmoke || isProjectIoSmoke || isCloseFlowSmoke || isManualQa)", label);
  checkIncludes(source, "paintWhenInitiallyHidden: true", label);
  checkIncludes(source, 'const isManualQa = process.env.GROOVEFORGE_DESKTOP_MANUAL_QA === "1"', label);
  checkIncludes(source, 'GROOVEFORGE_DESKTOP_MANUAL_QA_OPEN_PATH', label);
  checkIncludes(source, 'GROOVEFORGE_DESKTOP_MANUAL_QA_SAVE_PATH', label);
  checkIncludes(source, 'app.setPath("userData", manualQaConfiguration.electronUserDataDirectory)', label);
  checkIncludes(source, "assertManualQaWorkspaceTargetSync", label);
  checkIncludes(source, "validateManualQaProvenance", label);
  checkIncludes(source, "provenanceValidatedAtLaunch: true", label);
  checkIncludes(source, "Manual QA source tree changed after launcher provenance capture.", label);
  checkIncludes(source, "Manual QA built artifact changed after launcher provenance capture", label);
  checkIncludes(source, "Manual QA workspace ownership sentinel did not match the launcher token.", label);
  checkIncludes(source, "writeManualQaFile", label);
  checkIncludes(source, "manualQaUserDataPosture", label);
  checkIncludes(source, "userDataIsolated", label);
  check(!source.includes("userDataTouched"), `${label} should not claim hardcoded userDataTouched evidence`);
  checkIncludes(source, 'grooveforge-manual-qa-${isManualQaAutoMovement ? "auto-movement" : isManualQaAutoSong ? "auto-song" : isManualQaAutoExit ? "auto" : "visible"}-${process.pid}', label);
  checkIncludes(source, "installManualQaDownloadRouting(win)", label);
  checkIncludes(source, "installManualQaAutoSong(win)", label);
  checkIncludes(source, "installManualQaAutoMovement(win)", label);
  checkIncludes(source, 'process.argv.includes("--auto-song-qa")', label);
  checkIncludes(source, 'process.argv.includes("--auto-movement-qa")', label);
  checkIncludes(source, "selectManualQaNativeOption", label);
  checkIncludes(source, 'ensureManualQaDetailsOpen(win, "guidance-center", "guidance-center-toggle")', label);
  checkIncludes(source, "readManualQaLiveProjectContract", label);
  checkIncludes(source, "Movement reopened-project live contract mismatch", label);
  checkIncludes(appSource, "data-manual-qa-arrangement-json", "src/ui/App.tsx");
  checkIncludes(appSource, "data-manual-qa-automation-json", "src/ui/App.tsx");
  checkIncludes(source, "parseManualQaPcmWav", label);
  checkIncludes(source, "Movement WAV duration mismatch", label);
  checkIncludes(source, 'phase: "auto-movement"', label);
  checkIncludes(source, 'path.join(workspaceRoot, "exports")', label);
  checkIncludes(source, "Open and Save paths must differ", label);
  checkIncludes(source, 'void win.loadFile(path.join(__dirname, "../dist/index.html"))', label);
  checkIncludes(source, "win.webContents.setWindowOpenHandler", label);
  checkIncludes(source, 'return { action: "deny" }', label);
  checkIncludes(source, "registerProjectFileHandlers();", label);
  checkIncludes(
    beforeUnloadHandler,
    'flushActiveMetadataDraft("commit");',
    "src/ui/App.tsx beforeunload focused metadata draft flush"
  );
  check(
    beforeUnloadHandler.indexOf('flushActiveMetadataDraft("commit");') <
      beforeUnloadHandler.indexOf("resolveProjectCloseGuard("),
    "src/ui/App.tsx beforeunload should flush the focused metadata draft before resolving the close guard"
  );
  checkIncludes(
    closeFlowNativeTitleEditor,
    'type: "mouseDown"',
    `${label} close-flow native title pointer focus`
  );
  checkIncludes(
    closeFlowNativeTitleEditor,
    'keyCode: "A", modifiers: commandModifier',
    `${label} close-flow native title select-all`
  );
  checkIncludes(
    closeFlowNativeTitleEditor,
    'keyCode: "End", modifiers: ["shift"]',
    `${label} close-flow native title select-all fallback`
  );
  checkIncludes(
    closeFlowNativeTitleEditor,
    "selection.start !== 0 || selection.end !== selection.length",
    `${label} close-flow exact native title selection guard`
  );
  checkIncludes(
    closeFlowNativeTitleEditor,
    "await win.webContents.insertText(expectedTitle);",
    `${label} close-flow native title text input`
  );
  checkIncludes(
    closeFlowNativeTitleEditor,
    "document.activeElement === input",
    `${label} close-flow focused metadata draft evidence`
  );
  checkIncludes(
    closeFlowNativeTitleEditor,
    "document.elementFromPoint",
    `${label} close-flow visible title hit-test evidence`
  );
  checkIncludes(
    closeFlowNativeTitleEditor,
    'input.dataset.closeFlowNativeInput = event.isTrusted ? "true" : "false";',
    `${label} close-flow trusted native input evidence`
  );
  checkIncludes(
    closeFlowNativeTitleEditor,
    'input.dataset.closeFlowBlurred = "true";',
    `${label} close-flow pre-blur draft evidence`
  );
  check(
    !closeFlowNativeTitleEditor.includes("Object.getOwnPropertyDescriptor") &&
      !closeFlowNativeTitleEditor.includes('dispatchEvent(new Event("input"'),
    `${label} close-flow title edit should not use a synthetic value setter or input event`
  );
  checkIncludes(
    closeFlowInstaller,
    "void prepareCloseFlowSmokeNativeTitleEdit(win)",
    `${label} close-flow native title edit installation`
  );
  checkIncludes(
    launchSmokeLazyPreparation,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle")',
    `${label} lazy launch-smoke native Guide preparation`
  );
  checkIncludes(
    launchSmokeLazyPreparation,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "audience-session-proof-toggle")',
    `${label} lazy launch-smoke native Audience proof interaction`
  );
  checkIncludes(
    launchSmokeLazyPreparation,
    "state.proofOpen && state.proofContentVisible && state.proofRowsVisible === 10",
    `${label} lazy launch-smoke Audience proof open settle`
  );
  checkIncludes(
    launchSmokeLazyPreparation,
    "!state.proofOpen && state.proofContentHidden && state.proofRowsVisible === 0",
    `${label} lazy launch-smoke Audience proof close settle`
  );
  checkIncludes(
    launchSmokeLazyPreparation,
    "Guide should start collapsed before lazy-surface preparation.",
    `${label} lazy launch-smoke preparation`
  );
  checkIncludes(
    launchSmokeLazyPreparation,
    "const audioAnalysisPrewarm = await prewarmLaunchSmokeExactAudioAnalysis(win);",
    `${label} lazy launch-smoke visible exact audio prewarm`
  );
  checkIncludes(
    launchSmokeLazyPreparation,
    "window.__grooveforgeLaunchProjectOwnership ??=",
    `${label} pre-prewarm project ownership capture`
  );
  check(
    launchSmokeLazyPreparation.indexOf("window.__grooveforgeLaunchProjectOwnership ??=") <
      launchSmokeLazyPreparation.indexOf("const audioAnalysisPrewarm = await prewarmLaunchSmokeExactAudioAnalysis(win);"),
    "electron/main.ts should preserve the honest initial project ownership copy before native Mix/Compose prewarm changes workflow status"
  );
  checkIncludes(
    launchSmokeAudioAnalysisPreparation,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "audio-analysis-retry")',
    `${label} lazy launch-smoke native meter retry`
  );
  checkIncludes(
    launchSmokeAudioAnalysisPreparation,
    'state !== "ready"',
    `${label} lazy launch-smoke exact meter wait`
  );
  checkIncludes(
    launchSmokeAudioAnalysisPreparation,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-mix")',
    `${label} lazy launch-smoke native Mix prewarm route`
  );
  checkIncludes(
    launchSmokeAudioAnalysisPreparation,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-compose")',
    `${label} lazy launch-smoke native Compose restoration route`
  );
  checkIncludes(
    launchSmokeAudioAnalysisPreparation,
    'mix = await waitForLaunchSmokeAudioAnalysisTabPosture(win, "mix")',
    `${label} lazy launch-smoke selected visible Mix posture`
  );
  checkIncludes(
    launchSmokeAudioAnalysisPreparation,
    'restored = await waitForLaunchSmokeAudioAnalysisTabPosture(win, "compose")',
    `${label} lazy launch-smoke selected visible focused Compose restoration`
  );
  checkIncludes(
    launchSmokeLazyPreparation,
    "audioAnalysisPrewarm,",
    `${label} lazy launch-smoke audio prewarm evidence receipt`
  );
  check(!launchSmokeLazyPreparation.includes("guide.open ="), "electron/main.ts launch-smoke preparation should use the real Guide toggle");
  checkIncludes(
    launchSmokeInstaller,
    "audienceSessionLayoutEvidence = await prepareLaunchSmokeLazySurfaces(win);",
    `${label} launch-smoke installer`
  );
  check(
    launchSmokeInstaller.indexOf("audienceSessionLayoutEvidence = await prepareLaunchSmokeLazySurfaces(win);") <
      launchSmokeInstaller.indexOf("poll(Date.now() + launchSmokeTimeoutMs - 35000);"),
    "electron/main.ts launch smoke should prepare lazy surfaces before collecting the unchanged full-DOM contract"
  );
  checkIncludes(
    launchSmokeInstaller,
    "...audienceSessionLayoutEvidence",
    `${label} launch-smoke visible Audience evidence merge`
  );
  checkIncludes(
    launchSmokeMinimumWindowCollector,
    'const compactMedia = window.matchMedia("(max-width: 1220px)")',
    `${label} Studio resize media-query settle`
  );
  checkIncludes(
    launchSmokeMinimumWindowCollector,
    "performance.now() < resizeDeadline",
    `${label} bounded Studio resize settle`
  );
  checkIncludes(
    launchSmokeMinimumWindowCollector,
    "compactMedia.matches &&",
    `${label} Studio resize media-query match prerequisite`
  );
  checkIncludes(source, "ipcMain.on(closeWindowChannel", label);
  checkIncludes(source, "BrowserWindow.fromWebContents(event.sender)?.close();", label);
  checkIncludes(source, 'const isCloseFlowSmoke = process.env.GROOVEFORGE_DESKTOP_CLOSE_FLOW_SMOKE === "1"', label);
  checkIncludes(source, "installCloseFlowSmoke(win);", label);
  checkIncludes(source, 'closeFlowSmokeState.events.push("first-close-prevented")', label);
  checkIncludes(source, 'closeFlowSmokeState.events.push("renderer-close-request")', label);
  checkIncludes(source, "const smokeFilePath = projectIoSmokePath() ?? closeFlowSmokePath() ?? manualQaSavePath();", label);
  checkIncludes(source, "secondGuardedCloseCompleted: true", label);
  checkIncludes(source, '!isCloseFlowSmoke && BrowserWindow.getAllWindows().length === 0', label);
  checkIncludes(source, 'process.platform !== "darwin" || isManualQa', label);
  checkIncludes(source, "Menu.setApplicationMenu(createNativeCommandMenu())", label);
  checkIncludes(source, 'const localeChannel = "grooveforge:set-locale"', label);
  checkIncludes(source, "nativeMenuLabels", label);
  checkIncludes(source, 'ipcMain.on(localeChannel', label);
  checkIncludes(source, 'locale !== "en" && locale !== "ko"', label);
  checkIncludes(source, "createWindow();", label);
  checkIncludes(source, "autoUpdater", label);
  checkIncludes(source, "resolveUpdateFeedConfig", label);
  checkIncludes(source, 'checkUpdates: "Check for Updates..."', label);
  checkIncludes(source, 'checkUpdates: "업데이트 확인..."', label);
  checkIncludes(source, 'from "./nativeDialogOptions.js"', label);
  checkIncludes(
    saveProjectHandler,
    "createNativeSaveProjectDialogOptions(\n      nativeMenuLocale,\n      workspace.projects,\n      payload.defaultName\n    )",
    `${label} native Save dialog callsite`
  );
  checkIncludes(saveProjectHandler, "dialog.showSaveDialog(browserWindow, options)", `${label} native Save dialog callsite`);
  checkIncludes(saveProjectHandler, "dialog.showSaveDialog(options)", `${label} native Save dialog callsite`);
  checkIncludes(
    openProjectHandler,
    "createNativeOpenProjectDialogOptions(nativeMenuLocale, workspace.projects)",
    `${label} native Open dialog callsite`
  );
  checkIncludes(openProjectHandler, "dialog.showOpenDialog(browserWindow, options)", `${label} native Open dialog callsite`);
  checkIncludes(openProjectHandler, "dialog.showOpenDialog(options)", `${label} native Open dialog callsite`);
  checkIncludes(
    source,
    "dialog.showMessageBoxSync(win, createNativeUnsavedCloseDialogOptions(nativeMenuLocale))",
    `${label} native unsaved-close dialog callsite`
  );
  for (const factoryName of [
    "createNativeSaveProjectDialogOptions",
    "createNativeOpenProjectDialogOptions",
    "createNativeUnsavedCloseDialogOptions"
  ]) {
    checkIncludes(nativeDialogOptionsSource, `export function ${factoryName}`, "electron/nativeDialogOptions.ts");
    checkIncludes(nativeDialogOptionsBuilt, `function ${factoryName}`, "dist-electron/nativeDialogOptions.js");
  }
  checkIncludes(nativeDialogOptionsSource, 'saveProjectTitle: "GrooveForge 프로젝트 저장"', "electron/nativeDialogOptions.ts");
  checkIncludes(nativeDialogOptionsSource, 'openProjectTitle: "GrooveForge 프로젝트 열기"', "electron/nativeDialogOptions.ts");
  checkIncludes(nativeDialogOptionsSource, 'unsavedTitle: "저장되지 않은 GrooveForge 작업"', "electron/nativeDialogOptions.ts");
  checkIncludes(source, "GROOVEFORGE_UPDATE_FEED_URL", label);
  checkIncludes(source, "GROOVEFORGE_UPDATE_CHANNEL", label);
  checkIncludes(source, "autoUpdater.setFeedURL", label);
  checkIncludes(source, "autoUpdater.checkForUpdates()", label);
  checkIncludes(source, 'autoUpdater.on("update-downloaded"', label);
  checkIncludes(source, "autoUpdater.quitAndInstall()", label);
  checkIncludes(source, "No update feed was contacted.", label);
  checkIncludes(updateFeedConfigSource, "updateFeedUrlKeys", "electron/updateFeedConfig.ts");
  checkIncludes(updateFeedConfigSource, "redactUpdateFeedConfig", "electron/updateFeedConfig.ts");
  checkIncludes(updateFeedConfigSource, "Update feed URL must use HTTPS for release checks.", "electron/updateFeedConfig.ts");
  checkIncludes(updateFeedConfigSource, "Update feed URL must not include credentials.", "electron/updateFeedConfig.ts");
  checkIncludes(updateFeedConfigSource, "Update release channel must use 1-32 lowercase letters", "electron/updateFeedConfig.ts");
  checkIncludes(updateFeedConfigBuilt, "updateFeedUrlKeys", "dist-electron/updateFeedConfig.js");
  checkIncludes(updateFeedConfigBuilt, "redactUpdateFeedConfig", "dist-electron/updateFeedConfig.js");
  checkIncludes(source, 'localWorkstation: "GrooveForge Local Workstation"', label);
  checkIncludes(nativeDialogOptionsSource, "filters: localizedProjectFilters(locale)", "electron/nativeDialogOptions.ts");
  checkIncludes(nativeDialogOptionsSource, 'properties: ["openFile"]', "electron/nativeDialogOptions.ts");
  check(
    !functionalTabsCollector.includes("rmSync(evidenceDirectory"),
    "electron/main.ts functional-tab evidence collector should never recursively delete a configured evidence directory"
  );
  checkIncludes(functionalTabsCollector, "await mkdir(evidenceDirectory, { recursive: true", `${label} functional-tab evidence collector`);
  checkIncludes(functionalTabsCollector, 'activateNativeMenuCommandForSmoke(win, "delete-selected-event")', `${label} functional-tab native menu guard`);
  checkIncludes(functionalTabsCollector, 'activateNativeMenuCommandForSmoke(win, "quick-actions")', `${label} functional-tab Quick Actions reveal`);
  checkIncludes(functionalTabsCollector, '"quick-action-finish-checklist-route-readout-action"', `${label} functional-tab Finish Checklist route`);
  checkIncludes(functionalTabsCollector, '"quick-action-arrangement-mute-map-readout-action"', `${label} functional-tab Mute Map cold route`);
  checkIncludes(functionalTabsCollector, '"arrangement-mute-map-priority-run"', `${label} functional-tab Mute Map native priority action`);
  checkIncludes(functionalTabsCollector, "priorityResultLaneMatched", `${label} functional-tab Mute Map result transition evidence`);
  checkIncludes(functionalTabsCollector, "historyDepthPreserved", `${label} functional-tab Mute Map history isolation`);
  checkIncludes(functionalTabsCollector, "projectDataFingerprint", `${label} functional-tab full project isolation`);
  checkIncludes(functionalTabsCollector, 'await sendLaunchSmokeFunctionalTabNativeKey(win, "K", commandModifier)', `${label} functional-tab native Quick Actions shortcut`);
  checkIncludes(functionalTabsCollector, 'await win.webContents.insertText("beat passport route")', `${label} functional-tab Guide route native search`);
  checkIncludes(functionalTabsCollector, '"quick-action-beat-passport-route-readout-action"', `${label} functional-tab Guide route target`);
  checkIncludes(functionalTabsCollector, "guidanceBeatPassportQuickActionEvidence", `${label} functional-tab Guide route evidence`);
  checkIncludes(
    launchSmokeBridgeDirectCollector,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle")',
    `${label} Audience Route Bridge visible Guide preparation`
  );
  checkIncludes(launchSmokeBridgeDirectCollector, "state.actionTargetsVisible", `${label} Audience Route Bridge visible actions`);
  checkIncludes(launchSmokeBridgeDirectCollector, "state.hookReady", `${label} Audience Route Bridge React hook readiness`);
  checkIncludes(
    launchSmokeBridgeDirectCollector,
    "collectLaunchSmokeBridgeDirectHookEvidence(win)",
    `${label} Audience Route Bridge React evidence collection`
  );
  checkIncludes(
    launchSmokeBridgeDirectCollector,
    "restoring-collapsed-guide-with-native-pointer",
    `${label} Audience Route Bridge Guide posture restoration`
  );
  check(
    !source.includes("clickLaunchSmokeBridgeDirectTarget"),
    "electron/main.ts should never programmatically click hidden Audience Route Bridge controls"
  );
  checkIncludes(
    launchSmokePaletteCollector,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-compose")',
    `${label} Quick Actions palette visible Compose preparation`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "guidance-center-toggle")',
    `${label} Quick Actions palette visible Guide preparation`
  );
  checkIncludes(launchSmokePaletteCollector, "state.captureIdeasVisible", `${label} Quick Actions palette Capture visibility`);
  checkIncludes(
    launchSmokePaletteCollector,
    "state.audienceStarterActionsVisible",
    `${label} Quick Actions palette Audience Starter visibility`
  );
  checkIncludes(launchSmokePaletteCollector, "state.hookReady", `${label} Quick Actions palette hook readiness`);
  checkIncludes(
    launchSmokePaletteCollector,
    "collectLaunchSmokeVisibleModeToolEvidence(win)",
    `${label} Quick Actions visible mode-aware tool evidence`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    "const modeRestoredState = await readLaunchSmokePaletteSurfaceState(win);",
    `${label} Quick Actions post-mode Guide posture read`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    "if (!modeRestoredState.guideOpen)",
    `${label} Quick Actions post-mode Guide native restoration guard`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    "collectLaunchSmokeNativeChordCardEvidence(win)",
    `${label} Quick Actions native chord-card keyboard evidence`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    'collectLaunchSmokeNativeAudienceStarterEvidence(win, "beginner")',
    `${label} Quick Actions native beginner starter evidence`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    "await setLaunchSmokeLaunchpadOpen(win, true);",
    `${label} Quick Actions native launchpad reopen`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    'throw new Error("First-run launchpad should be open before native Audience Starter lifecycle evidence.")',
    `${label} Quick Actions observed initial launchpad-open contract`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    'waitForLaunchSmokeLaunchpadOpen(win, true, "open before changed beginner starter selection")',
    `${label} Quick Actions changed starter open launchpad precondition`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    "const collapsedAfterStarter = nativeStarterBeginner.launchpadCollapsedAfterSelection;",
    `${label} Quick Actions changed-starter launchpad collapse evidence`
  );
  checkIncludes(
    source,
    "await waitForLaunchSmokeLaunchpadOpen(win, false, `collapsed after ${starterId} starter selection`);",
    `${label} Quick Actions immediate native starter launchpad settle`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "audience-starter-action-producer")',
    `${label} Quick Actions identical native producer starter selection`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    'waitForLaunchSmokeLaunchpadOpen(win, false, "collapsed after identical Producer starter selection")',
    `${label} Quick Actions identical-starter launchpad collapse evidence`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    "...changedStarterLaunchpad",
    `${label} Quick Actions native launchpad evidence merge`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    'collector({ skipStarterRoutes: true })',
    `${label} Quick Actions duplicate starter-route skip`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    '"quick-actions-hook-without-starters"',
    `${label} Quick Actions hook substage timing`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    '"native-producer-starter"',
    `${label} Quick Actions native producer substage timing`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    '"native-beginner-starter"',
    `${label} Quick Actions native beginner substage timing`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    '"native-launchpad-changed-and-manual"',
    `${label} Quick Actions changed launchpad substage timing`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    '"native-launchpad-identical-starter"',
    `${label} Quick Actions identical launchpad substage timing`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    'window.__grooveforgeLaunchSmokePaletteStep = "returning-evidence"',
    `${label} Quick Actions returning-evidence progress marker`
  );
  checkIncludes(source, "const launchSmokePaletteUiSettleTimeoutMs = 10_000;", `${label} palette UI settle budget`);
  checkIncludes(source, "const launchSmokePaletteBoundedChildBudgetMs = 700_000;", `${label} palette bounded child budget`);
  checkIncludes(source, "const launchSmokePaletteTimeoutMs = 900_000;", `${label} palette parent timeout`);
  checkIncludes(
    launchSmokePaletteTimeout,
    "launchSmokePaletteTimeoutMs <= launchSmokePaletteBoundedChildBudgetMs",
    `${label} palette timeout hierarchy guard`
  );
  checkIncludes(
    launchSmokePaletteTimeout,
    "}, launchSmokePaletteTimeoutMs);",
    `${label} palette bounded parent timeout use`
  );
  checkIncludes(launchSmokePaletteTimeout, 'let currentStage = "starting";', `${label} palette main-process stage receipt`);
  checkIncludes(launchSmokePaletteTimeout, "currentStage = stage;", `${label} palette main-process stage updates`);
  check(!launchSmokePaletteTimeout.includes("executeJavaScript"), `${label} palette timeout should reject without renderer IPC`);
  checkIncludes(
    launchSmokeAudienceStarterNativeCollector,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, `audience-starter-action-${starterId}`)',
    `${label} visible native Audience Starter activation`
  );
  checkIncludes(
    launchSmokeAudienceStarterNativeCollector,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-mix")',
    `${label} Audience Starter native Mix analysis route`
  );
  checkIncludes(
    launchSmokeAudienceStarterNativeCollector,
    "await waitForLaunchSmokeExactAudioAnalysis(win);",
    `${label} Audience Starter exact audio wait`
  );
  checkIncludes(
    launchSmokeAudienceStarterNativeCollector,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-compose")',
    `${label} Audience Starter native Compose restoration`
  );
  checkIncludes(
    launchSmokeAudienceStarterNativeCollector,
    "clickLaunchSmokeAudienceStarterFollowup",
    `${label} Audience Starter native visible follow-up routes`
  );
  checkIncludes(
    launchSmokeBaseDomPreparation,
    'clickLaunchSmokeFunctionalTabNativeTarget(win, "workflow-jump-mix")',
    `${label} base DOM native Mix exact-ready prerequisite`
  );
  checkIncludes(
    launchSmokeBaseDomPreparation,
    'state.analysis === "ready"',
    `${label} base DOM exact-ready prerequisite`
  );
  checkIncludes(
    launchSmokeBaseDomPreparation,
    '!state.guideOpen &&',
    `${label} base DOM collapsed Guide prerequisite`
  );
  checkIncludes(
    launchSmokeBaseDomPreparation,
    ".then(() => collectLaunchSmokeEvidence(win))",
    `${label} base DOM collection after ready-posture preparation`
  );
  checkIncludes(
    launchSmokeModeToolCollector,
    "await activateLaunchSmokeModeToolZone(win,",
    `${label} native mode-aware zone activation`
  );
  checkIncludes(
    launchSmokeModeToolCollector,
    "waitForLaunchSmokeModeToolZoneState(",
    `${label} visible mode-aware disclosure settle`
  );
  checkIncludes(
    launchSmokeNativeChordCollector,
    'sendLaunchSmokeFunctionalTabNativeKey(win, "Enter")',
    `${label} native chord-card Enter selection`
  );
  checkIncludes(
    launchSmokeNativeChordCollector,
    'sendLaunchSmokeFunctionalTabNativeKey(win, "Space")',
    `${label} native chord-card Space restoration`
  );
  checkIncludes(
    launchSmokeNativeChordCollector,
    "rect.width > 0 && rect.height > 0",
    `${label} native chord-card positive editor rect settle`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    "the original ${initialState.activeZone} tab posture",
    `${label} Quick Actions palette tab restoration`
  );
  checkIncludes(
    launchSmokePaletteCollector,
    'the original ${initialState.guideOpen ? "open" : "collapsed"} Guide posture',
    `${label} Quick Actions palette Guide restoration`
  );
  checkIncludes(
    launchSmokeStarterCollector,
    'activateLaunchSmokeStarterZoneSurface(\n      win,\n      "arrange"',
    `${label} Audience Starter native Arrange activation`
  );
  checkIncludes(
    launchSmokeStarterCollector,
    'activateLaunchSmokeStarterZoneSurface(\n      win,\n      "mix"',
    `${label} Audience Starter native Mix activation`
  );
  checkIncludes(
    launchSmokeStarterCollector,
    "win.setSize(1680, 960);",
    `${label} Audience Starter native responsive Mix resize`
  );
  checkIncludes(
    launchSmokeStarterCollector,
    "await openLaunchSmokeStarterMixDisclosures(win);",
    `${label} Audience Starter visible Mix disclosure preparation`
  );
  checkIncludes(
    launchSmokeStarterCollector,
    "await waitForLaunchSmokeStarterResponsiveMixSurface(win);",
    `${label} Audience Starter responsive Mix predicate settle`
  );
  checkIncludes(
    launchSmokeStarterCollector,
    "await restoreLaunchSmokeStarterMixDisclosurePosture(win, originalMixDisclosurePosture);",
    `${label} Audience Starter Mix disclosure posture restoration`
  );
  checkIncludes(
    launchSmokeStarterCollector,
    "{ width: originalViewportWidth }",
    `${label} Audience Starter native viewport restoration`
  );
  checkIncludes(
    launchSmokeStarterCollector,
    'activateLaunchSmokeStarterZoneSurface(\n      win,\n      "compose"',
    `${label} Audience Starter native Compose activation`
  );
  checkIncludes(
    launchSmokeStarterSurfaceHelpers,
    '"review-queue-focus-readout"',
    `${label} Audience Starter visible Review Queue settle`
  );
  checkIncludes(
    launchSmokeStarterCollector,
    "const mixerPageMeasurements =",
    `${label} Audience Starter separate visible Mixer-page measurement`
  );
  checkIncludes(
    launchSmokeStarterCollector,
    `'[data-testid="workflow-target-master"]', '[data-testid="master-review-toggle"]'`,
    `${label} Audience Starter separate visible Master-page activation`
  );
  checkIncludes(
    launchSmokeStarterSurfaceHelpers,
    "state.reviewQueueReadableFieldCount === 11",
    `${label} Audience Starter eleven readable Review Queue fields settle`
  );
  checkIncludes(
    launchSmokeStarterSurfaceHelpers,
    "state.reviewQueueStackedRowCount === 0",
    `${label} Audience Starter full-width Review Queue rows settle`
  );
  checkIncludes(
    launchSmokeStarterCollector,
    "reviewQueueReadableFieldCount: reviewQueueReadableFields.length",
    `${label} Audience Starter Review Queue readable evidence`
  );
  checkIncludes(
    launchSmokeModalFocusCollector,
    "const dockPlayOriginal = await readDockPlayPosture();",
    `${label} workspace dock original playback posture`
  );
  checkIncludes(
    launchSmokeModalFocusCollector,
    "if (dockOriginalPlaybackRunning)",
    `${label} workspace dock running-playback native normalization`
  );
  checkIncludes(
    launchSmokeModalFocusCollector,
    "await sendDockPlayClick();",
    `${label} workspace dock visible native Play clicks`
  );
  checkIncludes(
    launchSmokeModalFocusCollector,
    "document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)",
    `${label} workspace dock Play hit target evidence`
  );
  checkIncludes(
    launchSmokeModalFocusCollector,
    'posture.hitTargetTestId !== "workspace-command-dock-play"',
    `${label} workspace dock Play native hit guard`
  );
  checkIncludes(
    launchSmokeModalFocusCollector,
    "dockOriginalPlaybackRestored",
    `${label} workspace dock original playback restoration`
  );
  checkIncludes(
    launchSmokeModalFocusCollector,
    "dockRestoredPlaybackPosture.activeZone === dockPlayOriginal.activeZone",
    `${label} workspace dock original zone restoration`
  );
  checkIncludes(
    launchSmokeModalFocusCollector,
    "dockRestoredPlaybackPosture.playbackScope === dockPlayOriginal.playbackScope",
    `${label} workspace dock original playback scope restoration`
  );
  checkIncludes(launchSmokeModalFocusCollector, 'sendClick("settings-language-en")', `${label} Settings English native click`);
  checkIncludes(launchSmokeModalFocusCollector, 'sendClick("settings-language-ko")', `${label} Settings Korean native click`);
  checkIncludes(launchSmokeModalFocusCollector, "historyDepthPosture", `${label} Settings locale-neutral history-depth isolation`);
  checkIncludes(source, "allowLaunchSmokeRendererReload", `${label} scoped Settings reload guard`);
  checkIncludes(
    source,
    "isLaunchSmoke && allowLaunchSmokeRendererReload",
    `${label} scoped Settings beforeunload bypass`
  );
  checkIncludes(source, "Menu.getApplicationMenu()?.getMenuItemById", `${label} native menu smoke activation`);
  checkIncludes(source, "menuItem.click({}, win, win.webContents)", `${label} native menu smoke activation`);
  checkIncludes(source, "480000", `${label} functional-tab screen timeout`);
  checkIncludes(
    closedDetailsCollector,
    "current.targetOpen && current.targetContentCount > 0 && current.targetControlCount > 0",
    `${label} native disclosure open settle`
  );
  checkIncludes(
    closedDetailsCollector,
    "!current.targetOpen && current.targetContentCount === 0 && current.targetControlCount === 0",
    `${label} native disclosure close settle`
  );
  checkIncludes(closedDetailsCollector, "guideOpen.targetControlCount >= 150", `${label} Guide disclosure threshold`);
  checkIncludes(closedDetailsCollector, "patternOpen.targetControlCount >= 40", `${label} Pattern Lab disclosure threshold`);
  checkIncludes(closedDetailsCollector, "mixerOpen.targetControlCount >= 10", `${label} mixer disclosure threshold`);
  checkIncludes(projectIoCollector, 'clickProjectIoSmokeNativeOpen(win)', `${label} project IO collector`);
  check(!projectIoCollector.includes("button?.click()"), "electron/main.ts project IO collector should not DOM-click the visible Open button");
  checkIncludes(projectIoCollector, "sourceUiFingerprint", `${label} project IO collector`);
  checkIncludes(projectIoCollector, "renderedUiFingerprint", `${label} project IO collector`);
  checkIncludes(projectIoNativeOpen, "document.elementFromPoint", `${label} native project Open activation`);
  checkIncludes(projectIoNativeOpen, 'type: "mouseDown"', `${label} native project Open activation`);
  checkIncludes(projectIoNativeOpen, 'type: "mouseUp"', `${label} native project Open activation`);
  checkIncludes(source, "project Open UI should render the source title, BPM, key, style, mode, and selected Pattern fingerprint", label);
  for (const command of expectedNativeMenuCommands) {
    checkIncludes(source, `"${command}"`, label);
  }
  checkIncludes(built, "../dist/index.html", "dist-electron/main.js");
  checkIncludes(built, "preload.cjs", "dist-electron/main.js");
  checkIncludes(built, "grooveforge:close-window", "dist-electron/main.js");
}

function checkPreloadContract() {
  const source = readText("electron/preload.cts");
  const built = readText("dist-electron/preload.cjs");
  const label = "electron/preload.cts";

  checkIncludes(source, 'contextBridge.exposeInMainWorld("grooveforge"', label);
  checkIncludes(source, 'appKind: "desktop"', label);
  checkIncludes(source, 'manualQa: process.env.GROOVEFORGE_DESKTOP_MANUAL_QA === "1"', label);
  checkIncludes(source, 'ipcRenderer.invoke("grooveforge:save-project"', label);
  checkIncludes(source, 'ipcRenderer.send("grooveforge:close-window")', label);
  checkIncludes(source, 'setLocale: (locale: "en" | "ko")', label);
  checkIncludes(source, 'if (locale === "en" || locale === "ko")', label);
  checkIncludes(source, 'ipcRenderer.send("grooveforge:set-locale", locale)', label);
  checkIncludes(source, 'ipcRenderer.invoke("grooveforge:open-project")', label);
  checkIncludes(source, 'ipcRenderer.on("grooveforge:menu-command"', label);
  checkIncludes(source, "isNativeMenuCommand(command)", label);
  checkIncludes(source, 'ipcRenderer.removeListener("grooveforge:menu-command", listener)', label);

  for (const command of expectedNativeMenuCommands) {
    checkIncludes(source, `"${command}"`, label);
  }

  checkIncludes(built, "grooveforge", "dist-electron/preload.cjs");
  checkIncludes(built, "desktop", "dist-electron/preload.cjs");
  checkIncludes(built, "GROOVEFORGE_DESKTOP_MANUAL_QA", "dist-electron/preload.cjs");
  checkIncludes(built, "grooveforge:save-project", "dist-electron/preload.cjs");
  checkIncludes(built, "grooveforge:close-window", "dist-electron/preload.cjs");
  checkIncludes(built, "grooveforge:set-locale", "dist-electron/preload.cjs");
  checkIncludes(built, "grooveforge:open-project", "dist-electron/preload.cjs");
  checkIncludes(built, "grooveforge:menu-command", "dist-electron/preload.cjs");

  const sent = [];
  const menuListeners = [];
  const removedMenuListeners = [];
  let exposedApi = null;
  const preloadModule = { exports: {} };
  try {
    runInNewContext(
      built,
      {
        exports: preloadModule.exports,
        module: preloadModule,
        process: { env: {}, platform: "darwin" },
        require(specifier) {
          if (specifier !== "electron") {
            throw new Error(`Unexpected preload dependency: ${specifier}`);
          }
          return {
            contextBridge: {
              exposeInMainWorld(name, api) {
                if (name === "grooveforge") {
                  exposedApi = api;
                }
              }
            },
            ipcRenderer: {
              invoke() {
                return Promise.resolve({});
              },
              on(channel, listener) {
                menuListeners.push({ channel, listener });
              },
              removeListener(channel, listener) {
                removedMenuListeners.push({ channel, listener });
              },
              send(channel, payload) {
                sent.push({ channel, payload });
              }
            }
          };
        }
      },
      { filename: "dist-electron/preload.cjs" }
    );
  } catch (error) {
    failures.push(
      `dist-electron/preload.cjs should execute against a bounded Electron mock: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  if (exposedApi) {
    exposedApi.setLocale("ko");
    exposedApi.setLocale("en");
    exposedApi.setLocale("fr");
    exposedApi.setLocale(null);
    const localeSends = sent.filter(({ channel }) => channel === "grooveforge:set-locale");
    check(
      JSON.stringify(localeSends) ===
        JSON.stringify([
          { channel: "grooveforge:set-locale", payload: "ko" },
          { channel: "grooveforge:set-locale", payload: "en" }
        ]),
      "built preload should send only runtime-valid English and Korean locale values"
    );
    const menuCommands = [];
    const removeMenuListener = exposedApi.onMenuCommand((command) => menuCommands.push(command));
    const menuListener = menuListeners.find(({ channel }) => channel === "grooveforge:menu-command")?.listener;
    menuListener?.({}, "undo");
    menuListener?.({}, "not-a-command");
    removeMenuListener();
    check(
      menuCommands.join(",") === "undo" &&
        removedMenuListeners.some(
          ({ channel, listener }) => channel === "grooveforge:menu-command" && listener === menuListener
        ),
      "built preload should deliver only allowed native menu commands and unregister the exact listener"
    );
  } else {
    failures.push("dist-electron/preload.cjs should expose the GrooveForge API at runtime");
  }
}

function checkRendererNativeMenuContract() {
  const declarations = readText("src/vite-env.d.ts");
  const appSource = readText("src/ui/App.tsx");
  const typeLabel = "src/vite-env.d.ts";
  const appLabel = "src/ui/App.tsx";
  const nativeMenuHandler = textBetween(
    appSource,
    "function handleNativeMenuCommand(command: NativeMenuCommand): void {",
    "function updateProject",
    appLabel
  );

  checkIncludes(declarations, "type NativeMenuCommand =", typeLabel);
  checkIncludes(declarations, "manualQa?: boolean;", typeLabel);
  checkIncludes(declarations, 'setLocale?: (locale: "en" | "ko") => void;', typeLabel);
  checkIncludes(declarations, "onMenuCommand?: (callback: (command: NativeMenuCommand) => void) => () => void;", typeLabel);
  checkIncludes(appSource, "window.grooveforge?.onMenuCommand?.(handleNativeMenuCommand)", appLabel);

  for (const command of expectedNativeMenuCommands) {
    checkIncludes(declarations, `| "${command}"`, typeLabel);
    checkIncludes(nativeMenuHandler, `case "${command}":`, `${appLabel} handleNativeMenuCommand`);
    checkIncludes(nativeMenuHandler, expectedRendererMenuHandlers[command], `${appLabel} handleNativeMenuCommand`);
  }
}

function checkRendererEntryContract() {
  const index = readText("dist/index.html");
  checkIncludes(index, '<div id="root"></div>', "dist/index.html");
  check(index.includes("./assets/"), "dist/index.html should reference built renderer assets with file-load-safe relative paths");
  check(!index.includes('src="/assets/') && !index.includes('href="/assets/'), "dist/index.html should not use root-relative asset paths");
}

checkBuiltArtifacts();
checkPackageScripts();
checkDesktopGuiLaunchGuardContract();
checkElectronMainContract();
checkPreloadContract();
checkRendererNativeMenuContract();
checkRendererEntryContract();

if (failures.length > 0) {
  console.error("GrooveForge desktop entry smoke failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("GrooveForge desktop entry smoke passed.");
console.log("- Scope: Electron production entry, preload bridge, renderer menu handler, renderer artifact contract, and restricted GUI launch guard");
console.log("- Entry: dist-electron/main.js -> dist/index.html");
console.log("- Bridge: context-isolated GrooveForge desktop API with validated native menu commands");
