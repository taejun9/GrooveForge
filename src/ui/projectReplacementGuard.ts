export type ProjectReplacementGuard = {
  requiresConfirmation: boolean;
  warning: string | null;
};

export function resolveProjectReplacementGuard(
  hasUnsavedChanges: boolean,
  hasRecoveryDraft: boolean
): ProjectReplacementGuard {
  if (!hasUnsavedChanges && !hasRecoveryDraft) {
    return { requiresConfirmation: false, warning: null };
  }

  const loss = hasUnsavedChanges
    ? hasRecoveryDraft
      ? "your unsaved changes and the current local recovery draft"
      : "your unsaved changes"
    : "the current local recovery draft";
  return {
    requiresConfirmation: true,
    warning: `Open this project and discard ${loss}?`
  };
}
