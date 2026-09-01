/**
 * 파일 열기나 스타터 프로젝트 적용으로 현재 작업을 교체하기 전에 손실 가능성을 계산한다.
 * 미저장 변경과 복구 초안을 구분해 사용자에게 정확한 경고 문구를 제공하며 실제 대화상자 표시는 호출자가 맡는다.
 * 둘 중 하나라도 남아 있으면 무확인 교체를 허용하지 않는 것이 데이터 안전 경계다.
 */
export type ProjectReplacementGuard = {
  requiresConfirmation: boolean;
  warning: string | null;
};

function replacementLoss(hasUnsavedChanges: boolean, hasRecoveryDraft: boolean): string | null {
  if (!hasUnsavedChanges && !hasRecoveryDraft) {
    return null;
  }

  return hasUnsavedChanges
    ? hasRecoveryDraft
      ? "your unsaved changes and the current local recovery draft"
      : "your unsaved changes"
    : "the current local recovery draft";
}

export function resolveProjectReplacementGuard(
  hasUnsavedChanges: boolean,
  hasRecoveryDraft: boolean
): ProjectReplacementGuard {
  const loss = replacementLoss(hasUnsavedChanges, hasRecoveryDraft);
  if (!loss) {
    return { requiresConfirmation: false, warning: null };
  }

  return {
    requiresConfirmation: true,
    warning: `Open this project and discard ${loss}?`
  };
}

export function resolveStarterProjectReplacementGuard(
  hasUnsavedChanges: boolean,
  hasRecoveryDraft: boolean,
  starterLabel: string
): ProjectReplacementGuard {
  const loss = replacementLoss(hasUnsavedChanges, hasRecoveryDraft);
  if (!loss) {
    return { requiresConfirmation: false, warning: null };
  }

  return {
    requiresConfirmation: true,
    warning: `Start ${starterLabel} and replace the current project? This can replace ${loss}. Choose Cancel to keep the current beat.`
  };
}
