export type ProjectAudioAnalysisWorkspaceZone = "compose" | "arrange" | "mix" | "deliver";

/** Exact diagnostic meters are foreground data only in review/delivery tabs. */
export function projectAudioAnalysisCommitEnabledForZone(zone: ProjectAudioAnalysisWorkspaceZone): boolean {
  return zone === "mix" || zone === "deliver";
}

/** Retry must land in a zone where an exact worker response can be committed. */
export function projectAudioAnalysisRetryZone(
  zone: ProjectAudioAnalysisWorkspaceZone
): Extract<ProjectAudioAnalysisWorkspaceZone, "mix" | "deliver"> {
  return zone === "deliver" ? "deliver" : "mix";
}
