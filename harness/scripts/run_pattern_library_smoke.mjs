#!/usr/bin/env node
/**
 * 개인 패턴 보관함의 저장·재시작·불러오기와 손상·용량·동시 변경 실패 경계를 검증한다.
 * 메모리 저장소와 실제 도메인 이벤트를 사용하며 사용자 보관함이나 설치 앱에 접근하지 않는다.
 */
import assert from "node:assert/strict";
import {
  createSavedPattern, deleteSavedPattern, maxPatternLibraryCharacters, maxPatternLibraryEntries,
  normalizePatternLibraryName, parsePatternLibrary, recallSavedPattern, renameSavedPattern,
  serializePatternLibrary
} from "../../src/domain/patternLibrary.ts";
import { createEmptyPatternData, retargetPatternKey, starterProject } from "../../src/domain/workstation.ts";
import { patternLibraryStorageKey, readPatternLibrary, writePatternLibrary } from "../../src/ui/patternLibraryStorage.ts";

const source = structuredClone(starterProject);
source.patterns.A.bassNotes[0].pitch = "A2";
const sourceBefore = structuredClone(source);
const saved = createSavedPattern(source, "  나만의\n그루브  ", "pattern-1", "2026-09-18T00:00:00.000Z");
assert.equal(saved.name, "나만의 그루브");
assert.deepEqual(source, sourceBefore);
assert.notEqual(saved.pattern, source.patterns.A);
source.patterns.A.bassNotes[0].pitch = "B2";
assert.equal(saved.pattern.bassNotes[0].pitch, "A2", "saved data must not follow later project edits");
assert.equal(normalizePatternLibraryName("🎵".repeat(100)).length, 128, "name bound counts Unicode code points");
assert.throws(() => createSavedPattern(source, " \n ", "pattern-2"), /metadata/u);

const values = new Map();
const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
const initial = readPatternLibrary(storage);
assert.equal(initial.status, "ready");
const written = writePatternLibrary(storage, [saved], initial.raw);
assert.equal(written.ok, true);
const restarted = readPatternLibrary(storage);
assert.deepEqual(restarted.entries, [saved], "fresh session reads persistent patterns");
assert.equal(restarted.status, "ready");

const target = structuredClone(starterProject);
target.title = "다른 프로젝트";
target.selectedPattern = "C";
target.key = "C minor";
target.bpm = 90;
target.patterns.C = createEmptyPatternData();
target.drumSamples = { kick: { sourceName: "kept destination sample" } };
const targetBefore = structuredClone(target);
const recalled = recallSavedPattern(target, restarted.entries[0], false);
assert.deepEqual(recalled.patterns.C, saved.pattern);
assert.notEqual(recalled.patterns.C, saved.pattern);
assert.equal(recalled.patterns.A, target.patterns.A);
assert.equal(recalled.patterns.B, target.patterns.B);
assert.equal(recalled.bpm, 90);
assert.equal(recalled.key, "C minor");
assert.equal(recalled.drumSamples, target.drumSamples);
assert.equal(recalled.mixer, target.mixer);
assert.equal(recalled.arrangement, target.arrangement);
assert.equal(recalled.sound, target.sound);
assert.deepEqual(target, targetBefore, "recall remains undoable through unchanged previous project");
assert.deepEqual(recallSavedPattern(target, saved, true).patterns.C, retargetPatternKey(saved.pattern, saved.sourceKey, target.key));

const renamed = renameSavedPattern(restarted.entries, saved.id, "새 이름");
assert.equal(renamed[0].name, "새 이름");
assert.equal(restarted.entries[0].name, "나만의 그루브");
assert.equal(writePatternLibrary(storage, renamed, restarted.raw).ok, true);
assert.equal(readPatternLibrary(storage).entries[0].name, "새 이름");
assert.equal(writePatternLibrary(storage, [saved], restarted.raw).reason, "changed", "stale windows cannot overwrite newer storage");
const beforeDelete = readPatternLibrary(storage);
assert.equal(writePatternLibrary(storage, deleteSavedPattern(beforeDelete.entries, saved.id), beforeDelete.raw).ok, true);
assert.deepEqual(readPatternLibrary(storage).entries, []);

for (const corrupt of ["{", "", '{"app":"GrooveForge Patterns","fileVersion":99,"patterns":[]}', "x".repeat(maxPatternLibraryCharacters + 1)]) {
  values.set(patternLibraryStorageKey, corrupt);
  assert.equal(readPatternLibrary(storage).status, "invalid");
  assert.equal(values.get(patternLibraryStorageKey), corrupt, "read must preserve unreadable storage");
}
assert.equal(readPatternLibrary(null).status, "unavailable");
assert.equal(readPatternLibrary({ getItem() { throw new Error("denied"); }, setItem() {} }).status, "unavailable");
const durableBeforeQuota = serializePatternLibrary([saved]);
const fullStorage = { getItem: () => durableBeforeQuota, setItem() { throw new Error("QuotaExceededError"); } };
assert.equal(writePatternLibrary(fullStorage, [], durableBeforeQuota).reason, "unavailable");
assert.deepEqual(readPatternLibrary(fullStorage).entries, [saved], "quota failure must retain previous patterns");
const reset = writePatternLibrary(storage, [], values.get(patternLibraryStorageKey));
assert.equal(reset.ok, true, "explicit reset can replace unreadable data");

const envelope = (patterns) => JSON.stringify({ app: "GrooveForge Patterns", fileVersion: 1, patterns });
assert.throws(() => parsePatternLibrary(envelope([saved, saved])), /duplicate/u);
assert.throws(() => parsePatternLibrary(envelope(Array.from({ length: maxPatternLibraryEntries + 1 }, (_, index) => ({ ...saved, id: `id-${index}` })))), /library/u);
assert.throws(() => parsePatternLibrary(envelope([{ ...saved, id: "../bad" }])));
assert.throws(() => parsePatternLibrary(envelope([{ ...saved, savedAt: "not a date" }])));
const badNote = structuredClone(saved);
badNote.pattern.bassNotes[0].pitch = "not a note";
assert.throws(() => parsePatternLibrary(envelope([badNote])), /project/u);
const badGrid = structuredClone(saved);
badGrid.pattern.drumPattern.kick = [];
assert.throws(() => parsePatternLibrary(envelope([badGrid])), /project/u);
const repairable = structuredClone(saved);
repairable.pattern.bassNotes[0].velocity = 90;
repairable.sourceBpm = 900;
const repaired = parsePatternLibrary(envelope([repairable]))[0];
assert.equal(repaired.pattern.bassNotes[0].velocity, 1);
assert.equal(repaired.sourceBpm, 220);
assert.equal(repairable.pattern.bassNotes[0].velocity, 90);
assert.equal(writePatternLibrary(storage, [badNote], reset.state.raw).reason, "invalid");
assert.deepEqual(readPatternLibrary(storage).entries, [], "invalid writes cannot erase previous library");

console.log("Pattern library smoke passed: persistent capture, selected-slot recall, key adaptation, nonmutation, rename/delete, bounds, corruption, quota and stale-write protection.");
