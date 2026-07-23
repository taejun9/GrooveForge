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
