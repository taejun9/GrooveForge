/**
 * 여러 저장 요청이 겹쳤을 때 어떤 완료만 현재 UI에 반영하고 닫기까지 이어 갈지 판정한다.
 * 최신 요청이라도 저장된 객체가 이미 과거 스냅샷이면 성공 기록만 남기고 창은 닫지 않는다.
 * 오래된 저장 완료가 새 편집을 저장된 것으로 오인하게 하지 않는 것이 핵심 경계다.
 */
export type ProjectSaveCompletion = "stale" | "saved-current" | "saved-snapshot";
export type ProjectSaveAttempt = ProjectSaveCompletion | "canceled" | "failed";

export function resolveProjectSaveCompletion(
  requestId: number,
  latestRequestId: number,
  savedProjectIsCurrent: boolean
): ProjectSaveCompletion {
  if (requestId !== latestRequestId) {
    return "stale";
  }
  return savedProjectIsCurrent ? "saved-current" : "saved-snapshot";
}

export function shouldCloseAfterProjectSave(attempt: ProjectSaveAttempt): boolean {
  return attempt === "saved-current";
}
