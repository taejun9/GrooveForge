#!/usr/bin/env node
/**
 * 실제 샘플 패널을 지연 파일 읽기와 상태 보존 hook 실행기로 검사한다.
 * Activity 숨김은 effect만 정리하고 state/ref는 유지한다는 수명주기에서 가져오기 버튼이 복구되는지 검증한다.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

export async function runSamplingActivityLifecycleSmoke() {
  const source = readFileSync(new URL("../../src/ui/SamplingPanel.tsx", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 } }).outputText;
  const slots = [], pending = [], changed = [], statuses = [];
  let cursor = 0, active = false;
  const hooks = {
    useState(initial) { const index = cursor++; if (!slots[index]) slots[index] = { value: initial }; return [slots[index].value, (value) => { slots[index].value = typeof value === "function" ? value(slots[index].value) : value; }]; },
    useRef(initial) { const index = cursor++; if (!slots[index]) slots[index] = { current: initial }; return slots[index]; },
    useEffect(callback, dependencies) {
      const index = cursor++;
      if (!slots[index]) slots[index] = {};
      const slot = slots[index];
      slot.needsRun = !slot.dependencies || dependencies.some((value, position) => value !== slot.dependencies[position]);
      slot.dependencies = dependencies; slot.effect = callback;
    }
  };
  const fixture = { format: "pcm16-mono", sourceName: "Delayed.wav", sampleRate: 22050, frames: 4410, trimStart: 0, trimEnd: 0.2, gainDb: 0, pcm: "fixture" };
  const imports = {
    react: hooks,
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    "../audio/sampleImport": { readWavSample: () => new Promise((resolve, reject) => pending.push({ resolve, reject })) },
    "../audio/scheduler": { playEditorAudition: () => ({ stop() {} }) },
    "../domain/workstation": { serializeProjectFile: (project) => JSON.stringify(project) },
    "../domain/sampling": { drumSampleRate: 22050, sampleLanes: ["kick", "clap", "hat", "perc"], sampleForLane: (project, lane) => project.drumSamples?.[lane], sampleBankFrames: () => 0, replaceDrumSample: (samples, lane, sample) => ({ ...samples, [lane]: sample }) },
    "./localization": { useLocalization: () => ({ locale: "en" }) }
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, { exports: module.exports, module, require: (name) => { assert(name in imports, `Unexpected component import: ${name}`); return imports[name]; } });
  const props = { project: { title: "Retained project" }, onChange: (update) => changed.push(update), onStatus: (message) => statuses.push(message) };
  const render = () => {
    cursor = 0;
    const tree = module.exports.SamplingPanel(props);
    if (active) for (const slot of slots) if (slot.effect && slot.needsRun) { slot.cleanup?.(); slot.cleanup = slot.effect(); slot.needsRun = false; }
    return tree;
  };
  const activate = () => { assert.equal(active, false); active = true; for (const slot of slots) if (slot.effect) { slot.cleanup = slot.effect(); slot.needsRun = false; } };
  const hide = () => { assert.equal(active, true); active = false; for (const slot of slots) if (slot.effect) { slot.cleanup?.(); slot.cleanup = undefined; } };
  const find = (tree, id) => {
    if (!tree || typeof tree !== "object") return null;
    if (tree.props?.["data-testid"] === id) return tree;
    for (const child of [tree.props?.children].flat(Infinity)) { const result = find(child, id); if (result) return result; }
    return null;
  };
  const input = () => find(render(), "sample-file-input");
  const start = () => input().props.onChange({ target: { files: [{ name: "Delayed.wav" }], value: "file" } });
  render(); activate(); assert.equal(input().props.disabled, false);
  start(); assert.equal(input().props.disabled, true);
  hide(); pending[0].resolve(fixture); await new Promise((resolve) => setImmediate(resolve));
  assert.equal(changed.length, 0, "Hidden import must not mutate the project");
  render(); activate();
  assert.equal(input().props.disabled, false, "Reactivated Activity must clear the canceled import busy state");
  start(); assert.equal(input().props.disabled, true);
  pending[1].resolve(fixture); await new Promise((resolve) => setImmediate(resolve));
  assert.equal(input().props.disabled, false); assert.equal(changed.length, 1, "New import after reactivation must succeed");
  assert.equal(changed[0](props.project).drumSamples.perc.sourceName, "Delayed.wav");
  hide(); render(); activate();
  start(); hide(); render(); activate(); start();
  pending[2].resolve(fixture); await new Promise((resolve) => setImmediate(resolve));
  assert.equal(input().props.disabled, true, "An older completion must not unlock a newer active import");
  assert.equal(changed.length, 1);
  pending[3].resolve(fixture); await new Promise((resolve) => setImmediate(resolve));
  assert.equal(input().props.disabled, false); assert.equal(changed.length, 2);
  const statusText = (tree) => {
    if (!tree || typeof tree !== "object") return undefined;
    if (tree.props?.role === "status") return tree.props.children;
    for (const child of [tree.props?.children].flat(Infinity)) { const result = statusText(child); if (result !== undefined) return result; }
    return undefined;
  };
  assert.match(statusText(render()), /Imported/);
  props.project = { ...props.project, title: "Restored project" };
  render();
  assert.equal(statusText(render()), "", "Project replacement or Undo must clear obsolete local feedback");
  hide();
  return { activityReactivation: "passed", canceledImportIgnored: true, subsequentImportWorks: true, staleCompletionKeepsNewImportBusy: true, externalProjectChangeClearsFeedback: true };
}
if (process.argv[1]?.endsWith("run_sampling_activity_smoke.mjs")) console.log(JSON.stringify(await runSamplingActivityLifecycleSmoke(), null, 2));
