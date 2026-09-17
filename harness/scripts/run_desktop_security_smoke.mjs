#!/usr/bin/env node
/**
 * 역할: Electron 탐색·외부 링크·네이티브 IPC와 프로젝트 파일 읽기 경계의 실제 구현을 회귀 검증한다.
 * 흐름: URL 정책과 main 함수들을 격리된 가짜 Electron 어댑터에서 실행하고 임시 파일 교체·성장 경쟁을 재현한다.
 * 안전 경계: GUI·네트워크·사용자 파일을 열지 않으며 실제 파일 시험은 OS 임시 디렉터리에서만 수행하고 모두 정리한다.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { appendFile, mkdtemp, open, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { externalBrowserUrl, isTrustedRendererUrl } from "../../electron/rendererSecurity.ts";
import { readBoundedProjectFile } from "../../electron/projectWorkspace.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const entryUrl = pathToFileURL(path.join(root, "dist/index.html")).href;
const devUrl = "http://127.0.0.1:5173/";
for (const allowed of [entryUrl, `${entryUrl}#compose`]) {
  assert.equal(isTrustedRendererUrl(allowed, entryUrl), true);
}
for (const denied of ["about:blank", "file:///etc/passwd", `${entryUrl}?other=1`, `${entryUrl}.bak`, "https://example.invalid/", "malformed"] ) {
  assert.equal(isTrustedRendererUrl(denied, entryUrl), false, denied);
}
assert.equal(isTrustedRendererUrl(`${devUrl}#mix`, devUrl), true);
for (const denied of ["http://127.0.0.1:5174/", "http://127.0.0.1:5173.evil.invalid/", "http://127.0.0.1:5173/other", "https://127.0.0.1:5173/"]) {
  assert.equal(isTrustedRendererUrl(denied, devUrl), false, denied);
}
assert.equal(isTrustedRendererUrl("about:blank", "about:blank"), false);
for (const denied of ["file:///Applications/Test.app", "javascript:alert(1)", "data:text/html,test", "ms-settings:privacy", "mailto:test@example.invalid", "https://user:password@example.invalid", "https://example.invalid/\n", "not a URL"]) {
  assert.equal(externalBrowserUrl(denied), null, denied);
}
assert.equal(externalBrowserUrl("https://github.com/taejun9/GrooveForge"), "https://github.com/taejun9/GrooveForge");
assert.equal(externalBrowserUrl("http://example.invalid/"), "http://example.invalid/");

// 원본 함수 AST를 실행해 정책만 맞고 실제 IPC/탐색 연결은 빠지는 회귀도 검출한다.
const mainSource = await readFile(path.join(root, "electron/main.ts"), "utf8");
const ast = ts.createSourceFile("main.ts", mainSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const functionNames = ["isTrustedProjectIpcSender", "assertTrustedProjectIpcSender", "registerProjectFileHandlers", "createWindow"];
const implementation = functionNames.map((name) => {
  const node = ast.statements.find((statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === name);
  assert.ok(node, `main must retain executable ${name}`);
  return node.getText(ast);
}).join("\n");
const ipcHandlers = new Map();
const ipcListeners = new Map();
const windowListeners = new Map();
const openedExternalUrls = [];
let createdWindow;
let windowOpenHandler;
let workspaceTouches = 0;
let closedWindows = 0;
let menuUpdates = 0;
class FakeBrowserWindow {
  constructor(options) {
    this.options = options;
    this.webContents = {
      mainFrame: { url: entryUrl },
      isDestroyed: () => false,
      setWindowOpenHandler: (handler) => { windowOpenHandler = handler; },
      on: (name, handler) => { windowListeners.set(name, handler); }
    };
    createdWindow = this;
  }
  static fromWebContents(sender) { return sender === createdWindow?.webContents ? createdWindow : null; }
  once() {}
  loadFile(file) { assert.equal(pathToFileURL(file).href, entryUrl); return Promise.resolve(); }
  close() { closedWindows += 1; }
}
const context = {
  BrowserWindow: FakeBrowserWindow,
  ipcMain: {
    handle: (name, handler) => ipcHandlers.set(name, handler),
    on: (name, handler) => ipcListeners.set(name, handler)
  },
  rendererEntryUrl: entryUrl,
  isTrustedRendererUrl,
  externalBrowserUrl,
  path,
  __dirname: path.join(root, "dist-electron"),
  process,
  console,
  isLaunchSmoke: false,
  isProjectIoSmoke: false,
  isCloseFlowSmoke: false,
  isManualQa: false,
  isDev: false,
  closeWindowChannel: "grooveforge:close-window",
  localeChannel: "grooveforge:set-locale",
  desktopProjectWorkspace: () => ({}),
  ensureDesktopProjectWorkspace: async () => { workspaceTouches += 1; },
  installManualQaDownloadRouting: () => {},
  installManualQaPassiveEvidence: () => {},
  installManualQaAutoSong: () => {},
  installManualQaAutoMovement: () => {},
  shell: { openExternal: async (url) => { openedExternalUrls.push(url); } },
  Menu: { setApplicationMenu: () => { menuUpdates += 1; } },
  createNativeCommandMenu: () => ({}),
  nativeMenuLocale: "en"
};
runInNewContext(ts.transpile(implementation, { target: ts.ScriptTarget.ES2022 }) + "\ncreateWindow(); registerProjectFileHandlers();", context);
const mainEvent = { sender: createdWindow.webContents, senderFrame: createdWindow.webContents.mainFrame };
assert.equal(context.isTrustedProjectIpcSender(mainEvent), true);
const rejectedEvents = [
  { sender: mainEvent.sender, senderFrame: { url: entryUrl } },
  { sender: mainEvent.sender, senderFrame: null },
  { sender: { mainFrame: mainEvent.senderFrame, isDestroyed: () => false }, senderFrame: mainEvent.senderFrame },
  { sender: { isDestroyed: () => true }, senderFrame: null }
];
for (const event of rejectedEvents) {
  assert.equal(context.isTrustedProjectIpcSender(event), false);
  for (const [name, handler] of ipcHandlers) {
    await assert.rejects(Promise.resolve().then(() => handler(event, {})), /trusted main renderer/u, name);
  }
  ipcListeners.get("grooveforge:close-window")(event);
  ipcListeners.get("grooveforge:set-locale")(event, "ko");
}
assert.equal(ipcHandlers.size, 5);
mainEvent.senderFrame.url = "https://example.invalid/";
assert.equal(context.isTrustedProjectIpcSender(mainEvent), false);
for (const [name, handler] of ipcHandlers) {
  await assert.rejects(Promise.resolve().then(() => handler(mainEvent, {})), /trusted main renderer/u, name);
}
mainEvent.senderFrame.url = entryUrl;
assert.equal(workspaceTouches, 0, "untrusted IPC must not reach workspace operations");
assert.equal(closedWindows, 0);
assert.equal(menuUpdates, 0);
ipcListeners.get("grooveforge:close-window")(mainEvent);
ipcListeners.get("grooveforge:set-locale")(mainEvent, "ko");
assert.equal(closedWindows, 1);
assert.equal(menuUpdates, 1);
for (const name of ["will-navigate", "will-redirect"]) {
  let prevented = 0;
  const event = { preventDefault: () => { prevented += 1; } };
  windowListeners.get(name)(event, `${entryUrl}#compose`);
  assert.equal(prevented, 0);
  windowListeners.get(name)(event, "https://example.invalid/");
  windowListeners.get(name)(event, "file:///etc/passwd");
  assert.equal(prevented, 2);
}
let webviewPrevented = false;
windowListeners.get("will-attach-webview")({ preventDefault: () => { webviewPrevented = true; } });
assert.equal(webviewPrevented, true);
for (const url of ["file:///Applications/Test.app", "ms-settings:privacy", "https://example.invalid/"]) {
  assert.equal(windowOpenHandler({ url }).action, "deny");
}
assert.deepEqual(openedExternalUrls, ["https://example.invalid/"]);

const temporaryRoot = await mkdtemp(path.join(tmpdir(), "grooveforge-native-read-"));
try {
  const fixture = path.join(temporaryRoot, "project.json");
  const contents = '{"title":"서울 비트"}';
  await writeFile(fixture, contents);
  assert.equal(await readBoundedProjectFile(fixture, Buffer.byteLength(contents), contents.length), contents);
  await assert.rejects(readBoundedProjectFile(fixture, Buffer.byteLength(contents) - 1, 100), /byte native read safety limit/u);
  await assert.rejects(readBoundedProjectFile(fixture, 128, contents.length - 1), /character safety limit/u);
  await assert.rejects(readBoundedProjectFile(temporaryRoot, 128, 128), /regular file/u);
  if (process.platform !== "win32") {
    const fifo = path.join(temporaryRoot, "named-pipe.json");
    execFileSync("mkfifo", [fifo]);
    await assert.rejects(readBoundedProjectFile(fifo, 128, 128), /regular file/u);
  }
  const handle = await open(fixture, "r");
  const prototype = Object.getPrototypeOf(handle);
  await handle.close();
  const originalStat = prototype.stat;
  try {
    // 검사된 크기와 실제 읽기 사이에 파일을 키워 이전 stat+readFile 경쟁 조건을 결정적으로 재현한다.
    prototype.stat = async function (...args) {
      const snapshot = await originalStat.apply(this, args);
      await appendFile(fixture, "x".repeat(256));
      return snapshot;
    };
    await assert.rejects(readBoundedProjectFile(fixture, 128, 128), /byte native read safety limit/u);
    await writeFile(fixture, contents);
    prototype.stat = async function (...args) {
      const snapshot = await originalStat.apply(this, args);
      await rename(fixture, `${fixture}.previous`);
      await writeFile(fixture, "x".repeat(256));
      return snapshot;
    };
    assert.equal(await readBoundedProjectFile(fixture, 128, 128), contents, "path replacement must not change the opened project");
  } finally {
    prototype.stat = originalStat;
  }
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
console.log("GrooveForge desktop security smoke passed: trusted renderer IPC, navigation, browser links, and bounded file race reads.");
