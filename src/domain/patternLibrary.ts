/**
 * 개인 패턴 보관함의 이벤트·이름·출처 메타데이터와 제한된 JSON 형식을 정의한다.
 * 프로젝트 파서를 재사용해 음악 이벤트를 검증하고, 불러올 때 선택한 슬롯만 새 객체로 교체한다.
 * 악기 소리·샘플·믹서·편곡은 보관하지 않으며 DOM·저장소·네트워크 부작용을 만들지 않는다.
 */
import type { PatternData, ProjectState } from "./workstation";
import {
  activePattern,
  clonePatternData,
  createEmptyPatternData,
  normalizeProjectBpm,
  normalizeProjectKey,
  parseProjectFile,
  retargetPatternKey,
  starterProject
} from "./workstation";

export const patternLibraryVersion = 1;
export const maxPatternLibraryEntries = 32;
export const maxPatternLibraryCharacters = 750_000;
export const maxPatternLibraryNameCharacters = 64;

export type SavedPattern = {
  id: string;
  name: string;
  savedAt: string;
  sourceBpm: number;
  sourceKey: string;
  pattern: PatternData;
};

export function normalizePatternLibraryName(value: string): string {
  return Array.from(value.replace(/[\u0000-\u001f\u007f-\u009f]/gu, " ").replace(/\s+/gu, " ").trim())
    .slice(0, maxPatternLibraryNameCharacters).join("");
}

function normalizedPattern(value: unknown): PatternData {
  // 현재 프로젝트의 무거운 스냅샷이나 샘플을 복사하지 않고 기존 이벤트 검증 경계만 재사용한다.
  const carrier = {
    ...starterProject,
    snapshots: [],
    patterns: { A: value, B: createEmptyPatternData(), C: createEmptyPatternData() }
  };
  return clonePatternData(parseProjectFile(JSON.stringify(carrier)).patterns.A);
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeSavedPattern(value: unknown): SavedPattern {
  if (!record(value)
    || typeof value.id !== "string" || !/^[A-Za-z0-9_-]{1,64}$/u.test(value.id)
    || typeof value.name !== "string" || !normalizePatternLibraryName(value.name)
    || typeof value.savedAt !== "string" || value.savedAt.length > 40 || !Number.isFinite(Date.parse(value.savedAt))
    || typeof value.sourceBpm !== "number" || !Number.isFinite(value.sourceBpm)
    || typeof value.sourceKey !== "string") {
    throw new Error("Invalid saved pattern metadata.");
  }
  return {
    id: value.id,
    name: normalizePatternLibraryName(value.name),
    savedAt: new Date(value.savedAt).toISOString(),
    sourceBpm: normalizeProjectBpm(value.sourceBpm),
    sourceKey: normalizeProjectKey(value.sourceKey),
    pattern: normalizedPattern(value.pattern)
  };
}

export function createSavedPattern(
  project: ProjectState,
  name: string,
  id: string,
  savedAt = new Date().toISOString()
): SavedPattern {
  return normalizeSavedPattern({
    id, name, savedAt,
    sourceBpm: project.bpm,
    sourceKey: project.key,
    pattern: activePattern(project)
  });
}

export function parsePatternLibrary(contents: string): SavedPattern[] {
  if (contents.length > maxPatternLibraryCharacters) {
    throw new Error("Pattern library exceeds the storage safety limit.");
  }
  const value: unknown = JSON.parse(contents);
  if (!record(value) || value.app !== "GrooveForge Patterns" || value.fileVersion !== patternLibraryVersion
    || !Array.isArray(value.patterns) || value.patterns.length > maxPatternLibraryEntries) {
    throw new Error("Invalid or unsupported pattern library.");
  }
  const patterns = value.patterns.map(normalizeSavedPattern);
  if (new Set(patterns.map((entry) => entry.id)).size !== patterns.length) {
    throw new Error("Pattern library contains duplicate identifiers.");
  }
  return patterns;
}

export function serializePatternLibrary(patterns: readonly SavedPattern[]): string {
  const contents = JSON.stringify({ app: "GrooveForge Patterns", fileVersion: patternLibraryVersion, patterns });
  // 읽기와 쓰기가 같은 제한을 적용하므로 저장에 성공한 보관함은 다음 실행에도 열 수 있다.
  const normalized = parsePatternLibrary(contents);
  return JSON.stringify({ app: "GrooveForge Patterns", fileVersion: patternLibraryVersion, patterns: normalized });
}

export function recallSavedPattern(project: ProjectState, saved: SavedPattern, adaptKey = true): ProjectState {
  const valid = normalizeSavedPattern(saved);
  const pattern = adaptKey
    ? retargetPatternKey(valid.pattern, valid.sourceKey, normalizeProjectKey(project.key))
    : clonePatternData(valid.pattern);
  return { ...project, patterns: { ...project.patterns, [project.selectedPattern]: pattern } };
}

export function renameSavedPattern(patterns: readonly SavedPattern[], id: string, name: string): SavedPattern[] {
  const normalized = normalizePatternLibraryName(name);
  if (!normalized) {
    throw new Error("A pattern name is required.");
  }
  return patterns.map((entry) => entry.id === id ? { ...entry, name: normalized } : entry);
}

export function deleteSavedPattern(patterns: readonly SavedPattern[], id: string): SavedPattern[] {
  return patterns.filter((entry) => entry.id !== id);
}
