/**
 * 프로젝트를 바꿔도 남는 개인 패턴의 저장·불러오기·이름 변경·삭제 화면을 제공한다.
 * 영속 저장 성공 후에만 보관함 상태를 갱신하고 패턴 불러오기는 부모의 Undo 가능한 편집 경로로 전달한다.
 * 이벤트만 보관한다는 범위와 선택 슬롯 교체를 표시하며 삭제·손상 보관함 초기화는 화면에서 재확인한다.
 */
import { useState } from "react";
import type { ReactElement } from "react";
import type { ProjectState } from "../domain/workstation";
import {
  createSavedPattern,
  deleteSavedPattern,
  maxPatternLibraryEntries,
  maxPatternLibraryNameCharacters,
  normalizePatternLibraryName,
  recallSavedPattern,
  renameSavedPattern
} from "../domain/patternLibrary";
import type { SavedPattern } from "../domain/patternLibrary";
import { useLocalization } from "./localization";
import { browserPatternLibraryStorage, readPatternLibrary, writePatternLibrary } from "./patternLibraryStorage";

export type PatternLibraryPanelProps = {
  project: ProjectState;
  onChange: (project: ProjectState) => void;
  onStatus?: (message: string) => void;
};

export function PatternLibraryPanel({ project, onChange, onStatus }: PatternLibraryPanelProps): ReactElement {
  const { locale } = useLocalization();
  const ko = locale === "ko";
  const [library, setLibrary] = useState(() => readPatternLibrary(browserPatternLibraryStorage()));
  const [saveName, setSaveName] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [rename, setRename] = useState("");
  const [adaptKey, setAdaptKey] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [feedback, setFeedback] = useState("");
  const selected = library.entries.find((entry) => entry.id === selectedId) ?? library.entries[0];
  const ready = library.status === "ready";

  function report(message: string): void {
    setFeedback(message);
    onStatus?.(message);
  }

  function persist(entries: readonly SavedPattern[]): boolean {
    const result = writePatternLibrary(browserPatternLibraryStorage(), entries, library.raw);
    if (result.ok) {
      setLibrary(result.state);
      return true;
    }
    report(result.reason === "changed"
      ? (ko ? "다른 창에서 보관함이 바뀌었습니다. 새로고침한 뒤 다시 시도하세요." : "The library changed in another window. Refresh and try again.")
      : result.reason === "invalid"
        ? (ko ? "패턴 형식이나 보관함 용량을 확인하세요. 이전 보관함은 유지됩니다." : "Check the pattern data or library size. Your previous library is preserved.")
        : (ko ? "기기 저장소에 저장하지 못했습니다. 저장 공간과 접근 권한을 확인하세요." : "Could not save to device storage. Check available space and storage access."));
    return false;
  }

  function save(): void {
    if (!ready || !normalizePatternLibraryName(saveName) || library.entries.length >= maxPatternLibraryEntries) {
      return;
    }
    try {
      const entry = createSavedPattern(project, saveName, crypto.randomUUID());
      if (persist([entry, ...library.entries])) {
        setSelectedId(entry.id);
        setSaveName("");
        setRename("");
        setConfirmDelete(false);
        report(ko ? `“${entry.name}” 패턴을 이 기기에 저장했습니다.` : `Saved “${entry.name}” on this device.`);
      }
    } catch {
      report(ko ? "패턴을 저장하지 못했습니다. 현재 프로젝트는 유지됩니다." : "Could not save the pattern. The current project is unchanged.");
    }
  }

  function recall(): void {
    if (!selected) {
      return;
    }
    onChange(recallSavedPattern(project, selected, adaptKey));
    report(ko
      ? `“${selected.name}” 패턴을 ${project.selectedPattern} 슬롯에 불러왔습니다. 실행 취소로 되돌릴 수 있습니다.`
      : `Loaded “${selected.name}” into Pattern ${project.selectedPattern}. You can Undo this change.`);
  }

  return (
    <section className="panel pattern-library-panel" data-testid="pattern-library-panel" aria-label={ko ? "내 패턴 보관함" : "My pattern library"}>
      <div className="panel-heading">
        <div><span className="eyebrow">{ko ? "이 기기에 저장" : "SAVED ON THIS DEVICE"}</span><h2>{ko ? "내 패턴" : "My Patterns"}</h2></div>
        <span data-testid="pattern-library-count">{library.entries.length} / {maxPatternLibraryEntries}</span>
      </div>
      <p className="feature-description">{ko
        ? "드럼·노트·코드 이벤트를 다른 프로젝트에서도 다시 사용하세요. 악기 소리, 샘플, 템포와 믹서는 현재 프로젝트의 설정을 사용합니다."
        : "Reuse your drum, note and chord events in other projects. Instrument sounds, samples, tempo and mix come from the current project."}</p>
      <div className="pattern-library-save feature-control-row">
        <label htmlFor="pattern-library-save-name">{ko ? `패턴 ${project.selectedPattern} 저장 이름` : `Name for Pattern ${project.selectedPattern}`}</label>
        <input id="pattern-library-save-name" data-testid="pattern-library-save-name" value={saveName} maxLength={maxPatternLibraryNameCharacters * 2}
          placeholder={ko ? "예: 묵직한 드럼 그루브" : "e.g. Heavy drum groove"}
          onChange={(event) => setSaveName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); save(); } }} />
        <button type="button" data-testid="pattern-library-save" disabled={!ready || !normalizePatternLibraryName(saveName) || library.entries.length >= maxPatternLibraryEntries} onClick={save}>
          {ko ? "현재 패턴 저장" : "Save current pattern"}
        </button>
      </div>
      {library.entries.length >= maxPatternLibraryEntries && <p>{ko ? "보관함이 가득 찼습니다. 필요 없는 패턴을 삭제한 뒤 저장하세요." : "The library is full. Delete an unused pattern before saving another."}</p>}
      {selected ? (
        <div className="pattern-library-recall">
          <label htmlFor="pattern-library-selection">{ko ? "저장한 패턴" : "Saved patterns"}</label>
          <select id="pattern-library-selection" data-testid="pattern-library-selection" value={selected.id} onChange={(event) => { setSelectedId(event.target.value); setRename(""); setConfirmDelete(false); }}>
            {library.entries.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
          </select>
          <p className="feature-description" data-testid="pattern-library-metadata">{ko ? "저장 당시" : "Saved at"} {selected.sourceBpm} BPM · {selected.sourceKey} · {new Date(selected.savedAt).toLocaleDateString(locale)} · {ko ? "1마디" : "1 bar"}</p>
          <label className="feature-checkbox"><input type="checkbox" data-testid="pattern-library-adapt-key" checked={adaptKey} onChange={(event) => setAdaptKey(event.target.checked)} />{ko ? `현재 키(${project.key})에 음정 맞추기` : `Adapt notes to current key (${project.key})`}</label>
          <button type="button" data-testid="pattern-library-recall" onClick={recall}>{ko ? `패턴 ${project.selectedPattern}에 불러오기` : `Load into Pattern ${project.selectedPattern}`}</button>
          <p className="feature-description">{ko ? `현재 ${project.selectedPattern} 슬롯의 이벤트를 교체합니다. 실행 취소할 수 있습니다.` : `Replaces events in slot ${project.selectedPattern}. This can be undone.`}</p>
          <div className="pattern-library-manage feature-control-row">
            <label htmlFor="pattern-library-rename-name">{ko ? "새 이름" : "New name"}</label>
            <input id="pattern-library-rename-name" data-testid="pattern-library-rename-name" value={rename} maxLength={maxPatternLibraryNameCharacters * 2} placeholder={selected.name} onChange={(event) => setRename(event.target.value)} />
            <button type="button" data-testid="pattern-library-rename" disabled={!normalizePatternLibraryName(rename)} onClick={() => {
              if (persist(renameSavedPattern(library.entries, selected.id, rename))) { setRename(""); report(ko ? "패턴 이름을 변경했습니다." : "Pattern renamed."); }
            }}>{ko ? "이름 변경" : "Rename"}</button>
            <button type="button" data-testid="pattern-library-delete" onClick={() => setConfirmDelete(true)}>{ko ? "삭제" : "Delete"}</button>
          </div>
          {confirmDelete && <div className="feature-confirmation" role="group" aria-label={ko ? "패턴 삭제 확인" : "Confirm pattern deletion"}>
            <p>{ko ? `“${selected.name}” 패턴을 보관함에서 삭제할까요? 현재 프로젝트에는 영향을 주지 않습니다.` : `Delete “${selected.name}” from the library? Your current project is unaffected.`}</p>
            <button type="button" data-testid="pattern-library-confirm-delete" onClick={() => {
              if (persist(deleteSavedPattern(library.entries, selected.id))) { setConfirmDelete(false); setSelectedId(""); setRename(""); report(ko ? "저장한 패턴을 삭제했습니다." : "Saved pattern deleted."); }
            }}>{ko ? "패턴 삭제" : "Delete pattern"}</button>
            <button type="button" onClick={() => setConfirmDelete(false)}>{ko ? "취소" : "Cancel"}</button>
          </div>}
        </div>
      ) : ready && <p className="feature-description" data-testid="pattern-library-empty">{ko ? "아직 저장한 패턴이 없습니다. 마음에 드는 패턴에 이름을 붙여 저장하세요." : "No saved patterns yet. Give your current pattern a name to keep it."}</p>}
      {library.status !== "ready" && <div role="alert" className="feature-error">
        <p>{library.status === "invalid"
          ? (ko ? "저장된 보관함을 읽을 수 없습니다. 기존 데이터는 그대로 보존되어 있습니다." : "The saved library could not be read. Existing data has been preserved.")
          : (ko ? "기기 저장소를 사용할 수 없어 패턴 저장이 비활성화되었습니다." : "Device storage is unavailable, so pattern saving is disabled.")}</p>
        {library.status === "invalid" && !confirmReset && <button type="button" onClick={() => setConfirmReset(true)}>{ko ? "손상된 보관함 초기화…" : "Reset unreadable library…"}</button>}
        {confirmReset && <div className="feature-confirmation"><p>{ko ? "읽을 수 없는 보관함 전체를 삭제하고 빈 보관함으로 시작합니다." : "This deletes the unreadable library and starts an empty library."}</p>
          <button type="button" onClick={() => { if (persist([])) { setConfirmReset(false); report(ko ? "빈 보관함으로 초기화했습니다." : "Started an empty library."); } }}>{ko ? "보관함 초기화 확인" : "Confirm library reset"}</button>
          <button type="button" onClick={() => setConfirmReset(false)}>{ko ? "취소" : "Cancel"}</button>
        </div>}
      </div>}
      <div className="feature-control-row"><button type="button" data-testid="pattern-library-refresh" onClick={() => {
        setLibrary(readPatternLibrary(browserPatternLibraryStorage())); setSelectedId(""); setRename(""); setConfirmDelete(false); setConfirmReset(false); setFeedback("");
      }}>{ko ? "보관함 새로고침" : "Refresh library"}</button></div>
      <p className="feature-status" role="status" data-testid="pattern-library-status">{feedback}</p>
    </section>
  );
}
