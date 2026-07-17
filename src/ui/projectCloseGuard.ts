export type ProjectCloseGuardDecision = {
  requiresConfirmation: boolean;
  shouldRefreshLocalDraft: boolean;
};

export function resolveProjectCloseGuard(
  hasUnsavedChanges: boolean,
  hasLocalRecovery: boolean
): ProjectCloseGuardDecision {
  return {
    requiresConfirmation: hasUnsavedChanges || hasLocalRecovery,
    shouldRefreshLocalDraft: hasUnsavedChanges
  };
}
