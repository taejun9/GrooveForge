#!/usr/bin/env node
/**
 * 설치 번들의 실제 렌더러를 격리된 영속 QA 세션에서 실행해 간단 모드·개인 패턴·원샷을 검증한다.
 * 기존 수동 QA의 소유권·빌드 해시·파일 경계를 재사용하고 CDP의 마우스·키보드·파일 선택으로 화면을 조작한다.
 * 사용자 데이터나 외부 서비스에 접근하지 않으며 보고서·스크린샷·WAV는 ignored build/desktop에만 남긴다.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveInstalledQaApp } from "./installed_app_qa.mjs";
import { createMixWavBlob } from "../../src/audio/render.ts";
import { parseProjectFile } from "../../src/domain/workstation.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const installedPath = process.env.GROOVEFORGE_DESKTOP_QA_INSTALLED_APP;
assert(installedPath, "Set GROOVEFORGE_DESKTOP_QA_INSTALLED_APP to the verified installed .app.");
const installed = await resolveInstalledQaApp(installedPath, root);
const workspace = path.join(root, "build", "desktop", `plan-1538-personal-tools-${Date.now()}-${process.pid}`);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const baseEnv = { ...process.env, GROOVEFORGE_DESKTOP_WORKSPACE_ROOT: workspace, GROOVEFORGE_DESKTOP_MANUAL_QA_PERSISTENT_STORAGE: "1" };
delete baseEnv.ELECTRON_RUN_AS_NODE;
delete baseEnv.VITE_DEV_SERVER_URL;
for (const name of ["GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_EXIT", "GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_SONG", "GROOVEFORGE_DESKTOP_MANUAL_QA_AUTO_MOVEMENT", "GROOVEFORGE_DESKTOP_MANUAL_QA_MOVEMENT_SPEC_PATH"]) delete baseEnv[name];
console.log("Personal tools QA: preparing isolated installed-app workspace.");
await new Promise((resolve, reject) => {
  const preparation = spawn(process.execPath, ["--experimental-strip-types", "--import", "./harness/scripts/register_ts_loader.mjs", "harness/scripts/run_desktop_manual_qa.mjs", "--prepare-only"], { cwd: root, env: baseEnv, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  preparation.stdout.on("data", (chunk) => { output += chunk; });
  preparation.stderr.on("data", (chunk) => { output += chunk; });
  preparation.on("error", reject);
  preparation.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Manual QA preparation failed: ${output}`)));
});
const evidenceDirectory = path.join(workspace, "evidence");
const manifestPath = path.join(evidenceDirectory, "manual-qa-launcher.json");
const manifestText = await readFile(manifestPath, "utf8");
const manifest = JSON.parse(manifestText);
const sentinel = JSON.parse(await readFile(path.join(workspace, ".grooveforge-manual-qa-owned.json"), "utf8"));
assert.equal(manifest.safety.nonpersistentElectronPartition, false);
assert.equal(manifest.safety.userDataIsolated, true);
const env = { ...baseEnv, GROOVEFORGE_DESKTOP_MANUAL_QA: "1", GROOVEFORGE_DESKTOP_MANUAL_QA_SOURCE_ROOT: root,
  GROOVEFORGE_DESKTOP_MANUAL_QA_OPEN_PATH: manifest.openFixture.path, GROOVEFORGE_DESKTOP_MANUAL_QA_SAVE_PATH: manifest.outputs.savePath,
  GROOVEFORGE_DESKTOP_MANUAL_QA_MANIFEST_PATH: manifestPath, GROOVEFORGE_DESKTOP_MANUAL_QA_MANIFEST_SHA256: sha256(manifestText),
  GROOVEFORGE_DESKTOP_MANUAL_QA_OWNERSHIP_TOKEN: sentinel.ownershipToken, NO_COLOR: "1" };
const report = { schemaVersion: 1, installedApp: installed.evidence, startedAt: new Date().toISOString(),
  workspace, isolatedPersistentStorage: true, nativeMouseKeyboard: true, checks: {}, screenshots: [], passed: false };
let child;
let cdp;
let processLog = "";

async function until(check, label, timeout = 20_000) {
  const deadline = Date.now() + timeout;
  let lastError;
  while (Date.now() < deadline) {
    try { const result = await check(); if (result) return result; } catch (error) { lastError = error; }
    await pause(100);
  }
  throw new Error(`Timed out: ${label}${lastError ? ` (${lastError.message})` : ""}`);
}

async function openCdp(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let nextId = 1;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 45_000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    const request = pending.get(message.id);
    if (request) { clearTimeout(request.timer); pending.delete(message.id); message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result); }
    if (message.method === "Page.javascriptDialogOpening") void send("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
  });
  socket.addEventListener("close", () => { for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error("CDP closed")); } pending.clear(); });
  return { send, close: () => socket.close() };
}

async function evaluate(expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
const selector = (id) => `[data-testid="${id}"]`;
async function clickSelector(target) {
  await evaluate(`document.querySelector(${JSON.stringify(target)})?.scrollIntoView({behavior:'instant',block:'center',inline:'center'})`);
  await pause(160);
  const point = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(target)}); if (!el || el.disabled) throw new Error('Missing/disabled target: ' + ${JSON.stringify(target)}); const r = el.getBoundingClientRect(); if (!r.width || !r.height) throw new Error('Hidden target'); const x=r.x+r.width/2,y=r.y+r.height/2; const hit=document.elementFromPoint(x,y); if (hit !== el && !el.contains(hit)) throw new Error('Occluded target ' + ${JSON.stringify(target)} + ' by ' + hit?.outerHTML.slice(0,250)); return {x,y}; })()`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", ...point });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...point });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...point });
  await pause(100);
}
const click = (id) => clickSelector(selector(id));
async function key(keyValue, modifiers = 0) {
  const keyCodes = { ArrowRight: 39, ArrowLeft: 37, a: 65 };
  const code = keyValue === "a" ? "KeyA" : keyValue;
  const detail = { key: keyValue, code, modifiers, windowsVirtualKeyCode: keyCodes[keyValue], nativeVirtualKeyCode: keyCodes[keyValue] };
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", ...detail });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", ...detail });
}
async function type(id, value) {
  await click(id);
  await key("a", process.platform === "darwin" ? 4 : 2);
  await cdp.send("Input.insertText", { text: value });
  await pause(100);
}
async function drawer(id) {
  if (!await evaluate(`document.querySelector(${JSON.stringify(selector(id))})?.open`)) await clickSelector(`${selector(id)} > summary`);
}
async function dismissLaunchpad() {
  if (await evaluate("(() => { const el = document.querySelector('[data-testid=first-run-launchpad]'); return el?.open && el.getBoundingClientRect().height > 0; })()")) {
    await click("first-run-launchpad-toggle");
  }
}
async function compose() { await click("workflow-jump-compose"); }
async function screenshot(name) {
  const result = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const file = path.join(evidenceDirectory, `${name}.png`);
  await writeFile(file, Buffer.from(result.data, "base64"));
  report.screenshots.push(file);
}
async function save() {
  const before = await readFile(manifest.outputs.savePath, "utf8").catch(() => "");
  await click("header-utility-trigger");
  await click("project-save");
  const text = await until(async () => { const text = await readFile(manifest.outputs.savePath, "utf8"); return text !== before ? text : null; }, "native project save");
  await pause(200);
  return parseProjectFile(text);
}
async function setFile(target, file) {
  const document = await cdp.send("DOM.getDocument");
  const found = await cdp.send("DOM.querySelector", { nodeId: document.root.nodeId, selector: target });
  assert(found.nodeId, `File input missing: ${target}`);
  await cdp.send("DOM.setFileInputFiles", { nodeId: found.nodeId, files: [file] });
}
async function start() {
  const port = await new Promise((resolve, reject) => { const server = net.createServer(); server.once("error", reject); server.listen(0, "127.0.0.1", () => { const port = server.address().port; server.close(() => resolve(port)); }); });
  child = spawn(installed.executable, [`--remote-debugging-port=${port}`, "--remote-debugging-address=127.0.0.1"], { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
  child.stdout.on("data", (value) => { processLog += value; });
  child.stderr.on("data", (value) => { processLog += value; });
  const target = await until(async () => {
    if (child.exitCode !== null) throw new Error(`App exited ${child.exitCode}: ${processLog.slice(-2000)}`);
    const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    return pages.find((entry) => entry.type === "page" && entry.url.startsWith("file:") && entry.url.includes("dist/index.html"));
  }, "installed renderer debugging endpoint", 45_000);
  cdp = await openCdp(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Page.bringToFront");
  await until(() => evaluate(`!!document.querySelector('[data-testid="workspace-density-simple"]')`), "production UI");
  assert.equal(await evaluate("window.grooveforge?.manualQa"), true);
  await dismissLaunchpad();
}
async function stop() {
  if (!child || child.exitCode !== null) return;
  const exiting = new Promise((resolve) => child.once("exit", resolve));
  // 실패 시 미저장 네이티브 대화상자가 열려도 격리한 이 QA 자식만 종료한다.
  const timer = setTimeout(() => child.kill("SIGTERM"), 5000);
  const forceTimer = setTimeout(() => child.kill("SIGKILL"), 9000);
  void cdp?.send("Browser.close").catch(() => {});
  await exiting;
  clearTimeout(timer);
  clearTimeout(forceTimer);
  cdp?.close();
  cdp = null;
}

try {
  await start();
  console.log("Personal tools QA: simple/full screen, nonmutation and reload.");
  const initialProject = await save();
  await click("workspace-density-simple");
  assert.equal(await evaluate("document.querySelector('main').dataset.workspaceDensity"), "simple");
  assert.deepEqual(await save(), initialProject, "screen density must not mutate music");
  await click("workspace-density-full");
  assert.equal(await evaluate("document.querySelector('main').dataset.workspaceDensity"), "full");
  assert.deepEqual(await save(), initialProject);
  await click("workspace-density-simple");
  await cdp.send("Page.reload");
  await until(() => evaluate("document.querySelector('main')?.dataset.workspaceDensity === 'simple'"), "simple mode reload persistence");
  await dismissLaunchpad();
  await compose();
  const simpleNavigation = await evaluate(`(() => {
    const visible = (el) => !!el && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0 && getComputedStyle(el).visibility !== 'hidden';
    return { toggleVisible: visible(document.querySelector('[data-testid="workspace-density-full"]')),
      labels: ['compose','arrange','mix','deliver'].map((id) => { const label = document.querySelector('[data-testid="workflow-jump-' + id + '"] .workflow-tab-label'); return { id, text: label?.textContent?.trim(), visible: visible(label) }; }) };
  })()`);
  assert.equal(simpleNavigation.toggleVisible, true);
  assert.equal(simpleNavigation.labels.every((label) => label.visible && label.text), true, "simple mode retains named navigation tabs");
  await screenshot("simple-compose");
  report.checks.simpleMode = { switchesBothWays: true, projectUnchanged: true, reloadPersists: true, navigation: simpleNavigation };

  console.log("Personal tools QA: pattern capture, edit, recall, Undo and rename.");
  await drawer("pattern-library-drawer");
  await type("pattern-library-save-name", "QA 개인 그루브");
  await click("pattern-library-save");
  await until(() => evaluate("document.querySelector('[data-testid=pattern-library-count]')?.textContent.startsWith('1 /')"), "pattern save");
  const initialStep = await evaluate("document.querySelector('[data-testid=drum-step-kick-0]').getAttribute('aria-pressed')");
  await click("drum-step-kick-0");
  // 활성 스텝의 첫 클릭은 기존 인스펙터 선택 동작이다. 선택한 같은 스텝을 다시 눌러 비활성화한다.
  if (await evaluate("document.querySelector('[data-testid=drum-step-kick-0]').getAttribute('aria-pressed')") === initialStep) await click("drum-step-kick-0");
  const editedStep = await evaluate("document.querySelector('[data-testid=drum-step-kick-0]').getAttribute('aria-pressed')");
  assert.notEqual(editedStep, initialStep);
  await click("pattern-library-recall");
  assert.equal(await evaluate("document.querySelector('[data-testid=drum-step-kick-0]').getAttribute('aria-pressed')"), initialStep);
  await click("undo-button");
  assert.equal(await evaluate("document.querySelector('[data-testid=drum-step-kick-0]').getAttribute('aria-pressed')"), editedStep);
  await type("pattern-library-rename-name", "QA 재사용 그루브");
  await click("pattern-library-rename");
  assert.match(await evaluate("document.querySelector('[data-testid=pattern-library-selection]').textContent"), /QA 재사용 그루브/u);
  await screenshot("pattern-library");
  report.checks.patternLibrary = { save: true, recall: true, undo: true, rename: true };

  console.log("Personal tools QA: WAV import, trim, gain, remove/Undo and native export.");
  const fixture = path.join(workspace, "fixtures", "qa-original-one-shot.wav");
  const frames = 6615;
  const wav = Buffer.alloc(44 + frames * 2);
  wav.write("RIFF"); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVEfmt ", 8); wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(44100, 24); wav.writeUInt32LE(88200, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write("data", 36); wav.writeUInt32LE(frames * 2, 40);
  for (let i = 0; i < frames; i += 1) wav.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 720 / 44100) * Math.exp(-i / 1300) * 24000), 44 + i * 2);
  await writeFile(fixture, wav);
  await drawer("sampling-drawer");
  await setFile(selector("sample-file-input"), fixture);
  await until(() => evaluate("document.querySelector('[data-testid=sample-assignment]')?.textContent.includes('qa-original-one-shot.wav')"), "WAV import");
  // 포커스만 이동하고 네이티브 화살표 입력으로 범위 값을 바꿔 React의 실제 편집 경로를 지난다.
  await evaluate("document.querySelector('[data-testid=sample-trim-start]').focus()");
  await key("ArrowRight"); await key("ArrowRight");
  await evaluate("document.querySelector('[data-testid=sample-gain]').focus()");
  for (let i = 0; i < 6; i += 1) await key("ArrowLeft");
  await click("sample-audition");
  if (await evaluate("document.querySelector('[data-testid=drum-step-perc-0]').getAttribute('aria-pressed')") !== "true") await click("drum-step-perc-0");
  const sampledProject = await save();
  assert.equal(sampledProject.drumSamples.perc.sourceName, "qa-original-one-shot.wav");
  assert.equal(sampledProject.drumSamples.perc.trimStart, 0.02);
  assert.equal(sampledProject.drumSamples.perc.gainDb, -6);
  const reopenFile = path.join(evidenceDirectory, "sampled-project.grooveforge.json");
  await writeFile(reopenFile, await readFile(manifest.outputs.savePath));
  await click("sample-remove");
  assert.equal(await evaluate("!!document.querySelector('[data-testid=sample-empty]')"), true);
  await click("undo-button");
  assert.equal(await evaluate("!!document.querySelector('[data-testid=sample-assignment]')"), true);
  await save();
  await screenshot("sampling");
  console.log("Personal tools QA: waiting for exact sample-aware meters before WAV export.");
  await click("workflow-jump-deliver");
  await until(() => evaluate("document.querySelector('main')?.dataset.audioAnalysisState === 'ready'"), "exact audio analysis", 60_000);
  console.log("Personal tools QA: exact meters ready; requesting native WAV download.");
  const beforeExports = new Set(await readdir(manifest.outputs.exportsDirectory));
  await click("header-export-trigger"); await click("export-wav");
  const exportFile = await until(async () => (await readdir(manifest.outputs.exportsDirectory)).find((name) => name.endsWith(".wav") && !beforeExports.has(name)), "sampled native WAV export", 60_000);
  const expected = Buffer.from(await createMixWavBlob(sampledProject).arrayBuffer());
  const exportPath = path.join(manifest.outputs.exportsDirectory, exportFile);
  const exported = await until(async () => { const bytes = await readFile(exportPath); return bytes.length === expected.length ? bytes : null; }, "complete sampled WAV");
  assert.equal(sha256(exported), sha256(expected), "installed UI export must equal the saved sampled project render");
  const withoutSamples = { ...sampledProject }; delete withoutSamples.drumSamples;
  assert.notEqual(sha256(exported), sha256(Buffer.from(await createMixWavBlob(withoutSamples).arrayBuffer())));
  report.checks.sampling = { import: true, trim: true, gain: true, removeUndo: true,
    savedEmbeddedSample: true, exportMatchesSavedProject: true, differsFromBuiltin: true,
    wavPath: exportPath, wavSha256: sha256(exported), wavBytes: exported.length };

  console.log("Personal tools QA: process restart, persistent library and saved sample reopen.");
  await stop();
  await start();
  assert.equal(await evaluate("document.querySelector('main').dataset.workspaceDensity"), "simple");
  await compose(); await drawer("pattern-library-drawer");
  assert.match(await evaluate("document.querySelector('[data-testid=pattern-library-selection]').textContent"), /QA 재사용 그루브/u);
  report.checks.simpleMode.processRestartPersists = true;
  report.checks.patternLibrary.processRestartPersists = true;
  await setFile("input.file-input[accept*=json]", reopenFile);
  await until(() => evaluate("document.querySelector('[data-testid=project-status]')?.textContent.includes('sampled-project')"), "saved project reopen");
  await compose(); await drawer("sampling-drawer");
  await until(() => evaluate("document.querySelector('[data-testid=sample-assignment]')?.textContent.includes('qa-original-one-shot.wav')"), "embedded sample after process restart");
  assert.equal(await evaluate("document.querySelector('[data-testid=sample-gain]').value"), "-6");
  assert.equal(await evaluate("document.querySelector('[data-testid=sample-trim-start]').value"), "0.02");
  report.checks.sampling.reopenAfterRestart = true;
  await drawer("pattern-library-drawer");
  await click("pattern-library-recall");
  assert.equal(await evaluate("document.querySelector('[data-testid=drum-step-kick-0]').getAttribute('aria-pressed')"), initialStep);
  assert.equal(await evaluate("!!document.querySelector('[data-testid=sample-assignment]')"), true, "event-only pattern recall preserves the reopened sample");
  await click("pattern-library-delete"); await click("pattern-library-confirm-delete");
  assert.equal(await evaluate("!!document.querySelector('[data-testid=pattern-library-empty]')"), true);
  await click("pattern-library-refresh");
  assert.equal(await evaluate("!!document.querySelector('[data-testid=pattern-library-empty]')"), true);
  report.checks.patternLibrary.crossProjectRecall = true;
  report.checks.patternLibrary.deletePersists = true;
  await save();
  await screenshot("reopened-tools");
  const passive = JSON.parse(await readFile(path.join(evidenceDirectory, "manual-ui-observations.json"), "utf8"));
  assert.equal(passive.userDataIsolated, true);
  report.userDataPath = passive.userDataPath;
  report.passed = true;
} catch (error) {
  report.error = error.stack ?? String(error);
  if (cdp) await screenshot("failure").catch(() => {});
  process.exitCode = 1;
} finally {
  await stop().catch(() => { child?.kill("SIGTERM"); });
  report.completedAt = new Date().toISOString();
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(path.join(evidenceDirectory, "personal-tools-process.log"), processLog);
  const reportPath = path.join(evidenceDirectory, "personal-tools-qa.json");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Personal tools actual-app QA ${report.passed ? "passed" : "failed"}: ${reportPath}`);
  if (!report.passed) console.error(report.error);
}
