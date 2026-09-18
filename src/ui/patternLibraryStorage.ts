/**
 * 개인 패턴 보관함을 기기 저장소에 읽고 쓰며 손상·권한·용량 실패를 명시적으로 반환한다.
 * 저장 전 원문을 비교해 다른 창의 변경을 덮어쓰지 않고, 실패하면 이전 데이터와 UI 상태를 유지한다.
 * 읽기만으로 손상 자료를 지우지 않으며 초기화는 별도의 사용자 동작에서만 수행한다.
 */
import type { SavedPattern } from "../domain/patternLibrary";
import { parsePatternLibrary, serializePatternLibrary } from "../domain/patternLibrary";

export const patternLibraryStorageKey = "grooveforge.pattern-library.v1";
export type PatternLibraryStorage = Pick<Storage, "getItem" | "setItem">;
export type PatternLibraryState = {
  entries: SavedPattern[];
  raw: string | null;
  status: "ready" | "invalid" | "unavailable";
};
export type PatternLibraryWriteResult =
  | { ok: true; state: PatternLibraryState }
  | { ok: false; reason: "unavailable" | "changed" | "invalid" };

export function browserPatternLibraryStorage(): PatternLibraryStorage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readPatternLibrary(storage: PatternLibraryStorage | null): PatternLibraryState {
  if (!storage) {
    return { entries: [], raw: null, status: "unavailable" };
  }
  let raw: string | null;
  try {
    raw = storage.getItem(patternLibraryStorageKey);
  } catch {
    return { entries: [], raw: null, status: "unavailable" };
  }
  if (raw === null) {
    return { entries: [], raw, status: "ready" };
  }
  try {
    return { entries: parsePatternLibrary(raw), raw, status: "ready" };
  } catch {
    return { entries: [], raw, status: "invalid" };
  }
}

export function writePatternLibrary(
  storage: PatternLibraryStorage | null,
  entries: readonly SavedPattern[],
  expectedRaw: string | null
): PatternLibraryWriteResult {
  if (!storage) {
    return { ok: false, reason: "unavailable" };
  }
  let raw: string;
  let normalized: SavedPattern[];
  try {
    raw = serializePatternLibrary(entries);
    normalized = parsePatternLibrary(raw);
  } catch {
    return { ok: false, reason: "invalid" };
  }
  try {
    if (storage.getItem(patternLibraryStorageKey) !== expectedRaw) {
      return { ok: false, reason: "changed" };
    }
    storage.setItem(patternLibraryStorageKey, raw);
    return { ok: true, state: { entries: normalized, raw, status: "ready" } };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
