/**
 * 프로젝트 창을 닫을 때 저장되지 않은 변경과 로컬 복구 초안의 조합을 해석한다.
 * 호출자는 이 순수 판정으로 확인 대화상자 표시, 초안 갱신, 저장 또는 복구 검토 흐름을 선택한다.
 * 복구본만 남은 상태를 일반 저장으로 오인하지 않는 것이 데이터 보존 경계다.
 */
export type ProjectCloseGuardDecision = {
  requiresConfirmation: boolean;
  shouldRefreshLocalDraft: boolean;
};

export type SaveBeforeCloseDecision = "save-current" | "review-recovery";

export function resolveProjectCloseGuard(
  hasUnsavedChanges: boolean,
  hasLocalRecovery: boolean
): ProjectCloseGuardDecision {
  return {
    requiresConfirmation: hasUnsavedChanges || hasLocalRecovery,
    shouldRefreshLocalDraft: hasUnsavedChanges
  };
}

export function resolveSaveBeforeCloseDecision(
  hasUnsavedChanges: boolean,
  hasLocalRecovery: boolean
): SaveBeforeCloseDecision {
  return !hasUnsavedChanges && hasLocalRecovery ? "review-recovery" : "save-current";
}
