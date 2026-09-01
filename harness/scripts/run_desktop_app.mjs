#!/usr/bin/env node

/**
 * 역할: 개발자가 `npm run desktop`으로 GrooveForge Electron 앱을 안전하게 시작하도록 진입점과 환경을 준비한다.
 * 흐름: 빌드·Electron 경로를 해석하고 macOS GUI 실행 가능성을 확인한 뒤 자식 프로세스의 종료 코드와 신호를 전달한다.
 * 안전 경계: 샌드박스 AppKit 위험은 기본 차단하고, 앱 실행 외의 패키징·서명·네트워크 작업은 수행하지 않는다.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isMacAppKitAbort, macGuiLaunchAbortDetails, macGuiLaunchBlockDetails } from "./desktop_gui_launch_guard.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);

function fail(message, details = "") {
  console.error("GrooveForge desktop launch failed:");
  console.error(`- ${message}`);
  if (details.trim().length > 0) {
    console.error(details.trim());
  }
  process.exit(1);
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

const blockDetails = macGuiLaunchBlockDetails("npm run desktop");
if (blockDetails) {
  fail("Refusing to start Electron in a restricted macOS GUI context.", blockDetails);
}

const electronBin = resolveElectronBinary();
if (!electronBin) {
  fail("Electron binary is missing; run npx install-electron --no after npm install.");
}

const env = {
  ...process.env,
  NO_COLOR: "1"
};
// 설치 도구가 남긴 Electron-as-Node 모드는 renderer를 전혀 띄우지 않으므로 데스크톱 진입점에서 제거한다.
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronBin, ["."], {
  cwd: root,
  env,
  stdio: "inherit"
});

child.on("error", (error) => {
  fail(`Could not start Electron: ${error.message}`);
});

child.on("exit", (code, signal) => {
  // 자식이 신호로 종료되면 AppKit 특화 진단을 먼저 제공하고, 그 밖의 신호는 부모에도 전달해
  // 터미널과 상위 프로세스가 실제 종료 원인을 잃지 않게 한다.
  if (signal) {
    if (isMacAppKitAbort({ code, signal })) {
      fail("Electron aborted during macOS AppKit registration.", macGuiLaunchAbortDetails("npm run desktop", { code, signal }));
    }
    process.kill(process.pid, signal);
    return;
  }
  if (isMacAppKitAbort({ code, signal })) {
    fail("Electron aborted during macOS AppKit registration.", macGuiLaunchAbortDetails("npm run desktop", { code, signal }));
  }
  process.exit(code ?? 0);
});
