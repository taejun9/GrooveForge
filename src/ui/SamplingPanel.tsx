/**
 * 직접 작곡 화면에 선택적으로 여는 로컬 원샷 패널이다.
 * 파일 읽기 전 크기를 제한하고 읽는 동안 프로젝트가 바뀌면 오래된 가져오기를 취소한다.
 */
import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { playEditorAudition } from "../audio/scheduler";
import type { PlaybackController } from "../audio/scheduler";
import { readWavSample } from "../audio/sampleImport";
import { drumSampleRate, replaceDrumSample, sampleBankFrames, sampleForLane, sampleLanes } from "../domain/sampling";
import type { DrumSample } from "../domain/sampling";
import { serializeProjectFile } from "../domain/workstation";
import type { DrumLane, ProjectState } from "../domain/workstation";
import { useLocalization } from "./localization";

export type SamplingPanelProps = {
  project: ProjectState;
  onChange: (update: (current: ProjectState) => ProjectState) => void;
  onStatus: (message: string) => void;
};
export function SamplingPanel({ project, onChange, onStatus }: SamplingPanelProps): ReactElement {
  const { locale } = useLocalization();
  const ko = locale === "ko";
  const [lane, setLane] = useState<DrumLane>("perc");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const projectRef = useRef(project);
  projectRef.current = project;
  const requestRef = useRef(0);
  const auditionRef = useRef<PlaybackController | null>(null);
  const sample = sampleForLane(project, lane);
  const labels: Record<DrumLane, string> = ko ? { kick: "킥", clap: "클랩", hat: "하이햇", perc: "퍼커션" } : { kick: "Kick", clap: "Clap", hat: "Hi-hat", perc: "Percussion" };
  useEffect(() => {
    // Activity는 숨길 때 effect만 정리하고 state는 보존한다. 다시 열면 취소된 읽기의 busy를 초기화한다.
    setBusy(false);
    setFeedback("");
    return () => {
      requestRef.current += 1;
      auditionRef.current?.stop();
      auditionRef.current = null;
    };
  }, []);
  useEffect(() => {
    // Undo·프로젝트 교체 후에도 이전 작업 완료 문구가 남아 현재 샘플 배치와 충돌하지 않게 한다.
    setFeedback("");
  }, [project]);
  const status = (message: string): void => { setFeedback(message); onStatus(message); };
  const updateSample = (nextSample: DrumSample | undefined): void => {
    const current = projectRef.current;
    const next = { ...current, drumSamples: replaceDrumSample(current.drumSamples, lane, nextSample) };
    serializeProjectFile(next);
    onChange((latest) => latest === current ? next : latest);
  };
  const importFile = async (file: File): Promise<void> => {
    const request = ++requestRef.current;
    const captured = projectRef.current;
    const targetLane = lane;
    setBusy(true);
    try {
      const imported = await readWavSample(file);
      if (request !== requestRef.current) return;
      if (projectRef.current !== captured) { status(ko ? "프로젝트가 바뀌었습니다. 파일을 다시 선택해 주세요." : "Project changed. Select the file again."); return; }
      const next = { ...captured, drumSamples: replaceDrumSample(captured.drumSamples, targetLane, imported) };
      // 실제 저장 상한까지 검사한 뒤에만 편집 기록으로 보내 저장 불가능한 상태를 만들지 않는다.
      serializeProjectFile(next);
      onChange((latest) => latest === captured ? next : latest);
      status(ko ? `${labels[targetLane]}에 ${imported.sourceName} 가져옴` : `Imported ${imported.sourceName} to ${labels[targetLane]}`);
    } catch (error) {
      if (request === requestRef.current) status(error instanceof Error ? error.message : "Unable to import WAV.");
    } finally { if (request === requestRef.current) setBusy(false); }
  };
  const patchSample = (patch: Partial<Pick<DrumSample, "trimStart" | "trimEnd" | "gainDb">>): void => {
    if (!sample) return;
    try { updateSample({ ...sample, ...patch }); }
    catch (error) { status(error instanceof Error ? error.message : "Unable to update sample."); }
  };
  return <section className="sampling-panel" data-testid="sampling-panel" aria-label={ko ? "원샷 샘플링" : "One-shot sampling"}>
    <h3>{ko ? "원샷 샘플링" : "One-shot sampling"}</h3>
    <p>{ko ? "짧은 WAV를 드럼 레인에 연결하세요. 스텝 재생과 WAV 내보내기에 적용되며 프로젝트와 함께 저장됩니다." : "Import a short WAV to replace one drum sound. Steps, playback and WAV export use it; audio is saved inside your project."}</p>
    <p>{ko ? "직접 만든 소리 또는 사용 권한이 있는 WAV를 선택하세요. 원본 파일명만 프로젝트에 기록합니다." : "Choose audio you created or have permission to use. Only the source filename is recorded."}</p>
    <p className="sampling-limits">{ko ? "WAV 0.01–2초 · 파일당 2 MB 이하 · 전체 원샷 합계 2초 · 22.05 kHz 모노로 변환" : "WAV 0.01–2 sec · max 2 MB/file · 2 sec total across lanes · converted to 22.05 kHz mono"}</p>
    <div className="sampling-controls">
      <label>{ko ? "드럼 레인" : "Drum lane"}<select value={lane} data-testid="sample-lane" onChange={(event) => setLane(event.target.value as DrumLane)} disabled={busy}>{sampleLanes.map((value) => <option key={value} value={value}>{labels[value]}{project.drumSamples?.[value] ? " •" : ""}</option>)}</select></label>
      <label>{busy ? (ko ? "가져오는 중…" : "Importing…") : (ko ? "WAV 가져오기" : "Import WAV")}<input type="file" accept=".wav,audio/wav,audio/x-wav" data-testid="sample-file-input" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void importFile(file); }} /></label>
    </div>
    <p data-testid="sample-bank-usage">{ko ? "사용량" : "Bank usage"}: {(sampleBankFrames(project.drumSamples) / drumSampleRate).toFixed(2)} / 2.00 s</p>
    {sample ? <div className="sampling-assignment" data-testid="sample-assignment">
      <strong>{sample.sourceName}</strong><span> · {(sample.frames / drumSampleRate).toFixed(2)} s</span>
      <div className="sampling-controls">
        <label>{ko ? "시작 (초)" : "Start (sec)"}<input type="range" min="0" max={Math.max(0, sample.trimEnd - 0.01)} step="0.01" value={sample.trimStart} data-testid="sample-trim-start" onChange={(event) => patchSample({ trimStart: Number(event.target.value) })} /><output>{sample.trimStart.toFixed(2)}</output></label>
        <label>{ko ? "끝 (초)" : "End (sec)"}<input type="range" min={sample.trimStart + 0.01} max={sample.frames / drumSampleRate} step="0.01" value={sample.trimEnd} data-testid="sample-trim-end" onChange={(event) => patchSample({ trimEnd: Number(event.target.value) })} /><output>{sample.trimEnd.toFixed(2)}</output></label>
        <label>{ko ? "샘플 음량" : "Sample gain"}<input type="range" min="-24" max="6" step="1" value={sample.gainDb} data-testid="sample-gain" onChange={(event) => patchSample({ gainDb: Number(event.target.value) })} /><output>{sample.gainDb} dB</output></label>
      </div>
      <div className="sampling-actions">
        <button type="button" data-testid="sample-audition" onClick={() => { try { auditionRef.current?.stop(); auditionRef.current = playEditorAudition(projectRef.current, { kind: "drum", lane, step: 0 }); status(ko ? "원샷 미리듣기" : "Auditioning one-shot"); } catch { status(ko ? "오디오를 시작할 수 없습니다." : "Audio could not start."); } }}>{ko ? "미리듣기" : "Audition"}</button>
        <button type="button" data-testid="sample-remove" onClick={() => { auditionRef.current?.stop(); try { updateSample(undefined); status(ko ? "샘플 제거됨. 기본 드럼 소리를 사용합니다." : "Sample removed. Using the built-in drum sound."); } catch (error) { status(error instanceof Error ? error.message : "Unable to remove sample."); } }}>{ko ? "샘플 제거" : "Remove sample"}</button>
      </div>
    </div> : <p data-testid="sample-empty">{ko ? "이 레인은 기본 합성 드럼 소리를 사용합니다." : "This lane uses the built-in synthesized drum sound."}</p>}
    <p role="status" aria-live="polite">{feedback}</p>
  </section>;
}
