/**
 * 비용이 큰 정확 오디오 분석 결과를 어느 작업 페이지에서 UI 상태에 커밋할지 정의한다.
 * Compose/Arrange에서는 백그라운드 결과를 보류하고, 실제 미터가 필요한 Mix/Deliver에서만 최신 결과를 노출한다.
 * 재시도 역시 결과를 볼 수 있는 페이지로 라우팅해 숨은 상태 업데이트와 오해 가능한 준비 표시를 막는다.
 */
export type ProjectAudioAnalysisWorkspaceZone = "compose" | "arrange" | "mix" | "deliver";

/** 정확한 진단 미터는 검토/전달 탭에서만 전경 데이터로 취급한다. */
export function projectAudioAnalysisCommitEnabledForZone(zone: ProjectAudioAnalysisWorkspaceZone): boolean {
  return zone === "mix" || zone === "deliver";
}

/** 재시도는 정확한 Worker 응답을 실제로 커밋할 수 있는 탭으로 이동해야 한다. */
export function projectAudioAnalysisRetryZone(
  zone: ProjectAudioAnalysisWorkspaceZone
): Extract<ProjectAudioAnalysisWorkspaceZone, "mix" | "deliver"> {
  return zone === "deliver" ? "deliver" : "mix";
}
