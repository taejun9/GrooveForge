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
