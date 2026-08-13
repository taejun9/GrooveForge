export type WorkflowNavigatorAnalysisStatus = "pending" | "ready" | "error";

export type WorkflowNavigatorAnalysisPosture = {
  detail: string;
  value: string;
};

export function workflowNavigatorAnalysisPosture(
  zone: "mix" | "deliver",
  status: WorkflowNavigatorAnalysisStatus
): WorkflowNavigatorAnalysisPosture | null {
  if (status === "ready") {
    return null;
  }

  if (status === "pending") {
    return zone === "mix"
      ? { value: "Analyzing", detail: "Waiting for meters / mix signal checks deferred" }
      : { value: "Waiting for meters", detail: "Analysis in progress / export readiness deferred" };
  }

  return zone === "mix"
    ? { value: "Meters unavailable", detail: "Retry meters before reviewing mix signal" }
    : { value: "Meters unavailable", detail: "Retry meters before reviewing export readiness" };
}
