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
