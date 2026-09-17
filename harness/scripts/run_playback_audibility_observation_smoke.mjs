#!/usr/bin/env node
/**
 * 역할: 음악의 쉼과 실제 무음·시작 실패를 구분하는 가청 관측 QA의 시간 경계를 검증한다.
 * 흐름: 가짜 시계로 초반음·지연음·전체무음·시작 제한·창 종료를 실행하고 실제 main의 편곡 판정 경로도 확인한다.
 * 안전 경계: GUI·오디오 장치·사용자 파일을 열지 않으며 기존 3500/3000ms 창과 진행 실패 조건을 유지한다.
 */
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { observePlaybackAudibility } from "../../electron/playbackAudibilityObservation.ts";

async function runScenario({ audible = () => false, started = () => true, closed = () => false, durationMs = 1000, intervalMs = 100, startTimeoutMs = 500, overshoot = () => 0 } = {}) {
  let clock = 0;
  const waits = [];
  const observation = await observePlaybackAudibility({
    durationMs, intervalMs, startTimeoutMs,
    now: () => clock,
    wait: async (milliseconds) => { waits.push(milliseconds); clock += milliseconds + overshoot(clock, milliseconds); },
    isPlaybackStarted: () => started(clock),
    isClosed: () => closed(clock),
    isAudible: () => { assert.equal(closed(clock), false, "closed windows must not be queried"); return audible(clock); }
  });
  return { observation, clock, waits };
}

const early = await runScenario({ audible: (time) => time <= 200 });
assert.equal(early.observation.status, "complete");
assert.equal(early.observation.audibleObserved, true);
assert.equal(early.observation.samples.at(-1).audible, false, "the final rest must not erase earlier sound");
assert.equal(early.observation.audibleSampleCount, 3);
assert.equal(early.observation.firstAudibleAtMs, 0);
assert.equal(early.observation.lastAudibleAtMs, 200);
assert.equal(early.observation.sampleCount, 11);
assert.equal(early.clock, 1000);

const delayed = await runScenario({ audible: (time) => time >= 600 && time < 800 });
assert.equal(delayed.observation.firstAudibleAtMs, 600);
assert.equal(delayed.observation.audibleSampleCount, 2);
const silent = await runScenario();
assert.equal(silent.observation.status, "complete");
assert.equal(silent.observation.audibleObserved, false);
assert.equal(silent.observation.firstAudibleAtMs, null);
const startup = await runScenario({ started: (time) => time >= 300, audible: (time) => time >= 500 });
assert.equal(startup.observation.startWaitMs, 300);
assert.equal(startup.observation.firstAudibleAtMs, 200);
assert.equal(startup.clock, 1300);

const neverStarted = await runScenario({ started: () => false, audible: () => { throw new Error("must not observe prior-session sound"); } });
assert.equal(neverStarted.observation.status, "start-timeout");
assert.equal(neverStarted.observation.sampleCount, 0);
assert.equal(neverStarted.clock, 500);
assert.equal((await runScenario({ started: (time) => time >= 500 })).observation.status, "start-timeout");
const lateStart = await runScenario({ started: (time) => time >= 600, overshoot: () => 500 });
assert.equal(lateStart.observation.status, "start-timeout");
assert.equal(lateStart.observation.sampleCount, 0);

for (const options of [{ closed: () => true }, { started: () => false, closed: (time) => time >= 100 }, { closed: (time) => time >= 450 }]) {
  const result = await runScenario(options);
  assert.equal(result.observation.status, "window-closed");
  assert.ok(result.observation.samples.every((sample) => sample.elapsedMs < 450));
}
const lateSound = await runScenario({ durationMs: 550, intervalMs: 200, audible: (time) => time > 550, overshoot: (time) => time >= 400 ? 100 : 0 });
assert.equal(lateSound.observation.audibleObserved, false);
assert.deepEqual(lateSound.waits, [200, 200, 150]);
assert.deepEqual(lateSound.observation.samples.map((sample) => sample.elapsedMs), [0, 200, 400]);
for (const durationMs of [3000, 3500]) {
  const result = await runScenario({ durationMs });
  assert.equal(result.clock, durationMs);
  assert.equal(result.observation.observedMs, durationMs);
  assert.equal(result.observation.sampleCount, durationMs / 100 + 1);
}
await assert.rejects(runScenario({ durationMs: Infinity }), /finite positive/u);
await assert.rejects(runScenario({ intervalMs: 0 }), /finite positive/u);

// 실제 main의 콜백을 실행하여 관측 helper 통과만으로 정지된 transport를 성공 처리하는 회귀를 막는다.
const mainSource = await readFile(new URL("../../electron/main.ts", import.meta.url), "utf8");
const sourceAst = ts.createSourceFile("main.ts", mainSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const movementFunction = sourceAst.statements.find((statement) => ts.isFunctionDeclaration(statement) && statement.name?.text === "installManualQaAutoMovement");
assert.ok(movementFunction);
let arrangementCallback;
const visit = (node) => {
  if (ts.isCallExpression(node) && node.expression.getText(sourceAst) === "runStep" && node.arguments[0]?.getText(sourceAst) === '"audition-arrangement"') {
    arrangementCallback = node.arguments[1].getText(sourceAst);
  }
  ts.forEachChild(node, visit);
};
visit(movementFunction);
assert.ok(arrangementCallback);

async function runMainArrangement({ audible = () => true, advances = true, closed = () => false } = {}) {
  let clock = 0;
  const report = { playback: {} };
  const context = {
    report,
    win: { isDestroyed: () => closed(clock), webContents: { isDestroyed: () => closed(clock), isCurrentlyAudible: () => audible(clock) } },
    clickAndWait: async () => {},
    observePlaybackAudibility: (options) => observePlaybackAudibility({ ...options, now: () => clock, wait: async (ms) => { clock += ms; } }),
    readLaunchSmokeOverviewPlaybackDomState: async () => ({ transportPlaying: advances, progressValue: advances ? 2 : 0 })
  };
  const run = runInNewContext(ts.transpile(`const run = ${arrangementCallback}; run;`, { target: ts.ScriptTarget.ES2022 }), context);
  await run();
  return report.playback;
}
const actualEarly = await runMainArrangement({ audible: (time) => time < 300 });
assert.equal(actualEarly.arrangementAudible, true);
assert.equal(actualEarly.arrangementAdvanced, true);
assert.equal(actualEarly.arrangementObservation.durationMs, 3500);
await assert.rejects(runMainArrangement({ audible: () => false }), /did not advance with audible output/u);
await assert.rejects(runMainArrangement({ advances: false }), /did not advance with audible output/u);
await assert.rejects(runMainArrangement({ closed: (time) => time >= 200 }), /window-closed/u);

// 실제 WAV 관측 구간도 네이티브 media 이벤트 대기와 finally 정리를 보장한다.
const movementSource = movementFunction.getText(sourceAst);
const previewStart = movementSource.indexOf("const previewRequestedAt = performance.now();");
const previewEnd = movementSource.indexOf("const downloadStartIndex = manualQaDownloads.length;", previewStart);
assert.ok(previewStart >= 0 && previewEnd > previewStart);
const previewSource = movementSource.slice(previewStart, previewEnd);
async function runMainPreview({ emitsMediaStart = true, audible = () => true } = {}) {
  let clock = 0;
  let emitted = false;
  const webContents = new EventEmitter();
  webContents.isDestroyed = () => false;
  webContents.isCurrentlyAudible = () => audible(clock);
  const report = { playback: {} };
  const context = {
    report,
    performance: { now: () => clock },
    win: { isDestroyed: () => false, webContents },
    clickAndWait: async () => {},
    observePlaybackAudibility: (options) => observePlaybackAudibility({
      ...options,
      now: () => clock,
      wait: async (ms) => {
        clock += ms;
        if (emitsMediaStart && !emitted && clock >= 300) { emitted = true; webContents.emit("media-started-playing"); }
      }
    })
  };
  const run = runInNewContext(ts.transpile(`const run = async () => { ${previewSource} }; run;`, { target: ts.ScriptTarget.ES2022 }), context);
  try { await run(); }
  finally { assert.equal(webContents.listenerCount("media-started-playing"), 0); }
  return report.playback;
}
const actualPreview = await runMainPreview({ audible: (time) => time >= 300 && time <= 600 });
assert.equal(actualPreview.wavPreviewAudible, true);
assert.equal(actualPreview.wavPreviewObservation.durationMs, 3000);
assert.equal(actualPreview.wavPreviewObservation.mediaStartedAfterMs, 300);
await assert.rejects(runMainPreview({ emitsMediaStart: false }), /start-timeout/u);
await assert.rejects(runMainPreview({ audible: () => false }), /did not produce audible output/u);
console.log("GrooveForge playback audibility observation smoke passed: fixed windows, early/delayed sound, silence, startup/close/deadline boundaries, native media start, listener cleanup, and transport progress rejection.");
