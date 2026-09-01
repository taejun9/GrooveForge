/**
 * 프로젝트의 전체 믹스·스템 오프라인 미터 분석을 캐시하고 UI 요청과 결과의 동일성을 판정한다.
 * PCM에 영향을 주는 필드만 identity에 포함해 메타데이터 편집으로 불필요한 렌더를 반복하지 않으며,
 * 실제 계산은 워커에서도 호출할 수 있도록 DOM과 다운로드 부작용 없이 유지한다.
 */
import {
  arrangementTotalBars,
  projectMasterCeilingDb,
  projectStepDurationSeconds
} from "../domain/workstation";
import type { ProjectState } from "../domain/workstation";
import {
  analyzeProjectExports,
  exportTailDurationSeconds,
  stemTrackIds,
  wavBitDepth,
  wavChannels,
  wavSampleRate
} from "./render";
import type { ExportAnalysis, StemExportAnalyses } from "./render";

export type ProjectAudioAnalysis = {
  mix: ExportAnalysis;
  stems: StemExportAnalyses;
};

const projectAudioAnalysisCommitHoldTestIds = new Set([
  "project-title-input",
  "session-brief-artist",
  "session-brief-vibe",
  "session-brief-reference",
  "session-brief-notes"
]);

export function shouldHoldProjectAudioAnalysisCommit(activeTestId: string | null): boolean {
  return activeTestId !== null && projectAudioAnalysisCommitHoldTestIds.has(activeTestId);
}

export function shouldAcceptProjectAudioAnalysisResponse(
  responseId: number,
  currentRequestId: number,
  responseIdentity: string,
  currentIdentity: string
): boolean {
  // 요청 번호와 PCM identity를 함께 확인해야 오래 걸린 이전 워커 응답이 최신 화면을 덮어쓰지 않는다.
  return responseId === currentRequestId && responseIdentity === currentIdentity;
}

let cachedProjectAudioAnalysis: { identity: string; analysis: ProjectAudioAnalysis } | null = null;

/**
 * 렌더 PCM 또는 미터값을 바꿀 수 있는 프로젝트 필드만 직렬화한다.
 * 선택 Pattern, 제목, 모드, 전달 목표, 세션 메모, 스냅샷, 메트로놈 같은 UI·메타데이터는 의도적으로 제외해
 * 해당 편집 때 기존 분석을 재사용한다. 실제 렌더 Pattern 선택은 편곡 블록이 소유한다.
 */
export function projectAudioAnalysisIdentity(project: ProjectState): string {
  return JSON.stringify({
    arrangement: project.arrangement,
    automation: project.automation,
    bpm: project.bpm,
    key: project.key,
    masterCeilingDb: project.masterCeilingDb,
    mixer: project.mixer,
    patterns: project.patterns,
    sound: project.sound,
    styleId: project.styleId,
    swing: project.swing
  });
}

export function analyzeProjectAudio(project: ProjectState): ProjectAudioAnalysis {
  const identity = projectAudioAnalysisIdentity(project);
  if (cachedProjectAudioAnalysis?.identity === identity) {
    // 동일 PCM 상태에서는 큰 Float32Array를 다시 만들지 않고 불변 스칼라 분석 결과를 재사용한다.
    return cachedProjectAudioAnalysis.analysis;
  }
  const analysis = analyzeProjectExports(project);
  cachedProjectAudioAnalysis = { identity, analysis };
  return analysis;
}

function pendingAnalysis(project: ProjectState): ExportAnalysis {
  // 워커가 끝나기 전에도 예상 길이와 형식은 계산 가능하지만, 음량 수치는 측정값처럼 보이지 않도록 Silent 상태로 둔다.
  const durationSeconds =
    arrangementTotalBars(project) * 16 * projectStepDurationSeconds(project) +
    exportTailDurationSeconds(project);
  return {
    sampleRate: wavSampleRate,
    channels: wavChannels,
    bitDepth: wavBitDepth,
    durationSeconds,
    peakDb: Number.NEGATIVE_INFINITY,
    rmsDb: Number.NEGATIVE_INFINITY,
    headroomDb: 99,
    ceilingDb: projectMasterCeilingDb(project),
    limitedSamples: 0,
    limitedPercent: 0,
    status: "Silent"
  };
}

export function pendingProjectAudioAnalysis(project: ProjectState): ProjectAudioAnalysis {
  const mix = pendingAnalysis(project);
  return {
    mix,
    stems: Object.fromEntries(stemTrackIds.map((track) => [track, { ...mix }])) as StemExportAnalyses
  };
}
