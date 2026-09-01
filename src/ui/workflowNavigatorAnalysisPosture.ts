/**
 * Mix/Deliver 작업 내비게이터에 표시할 오디오 분석 대기·오류 문구를 계산한다.
 * 분석 완료 시에는 별도 오버레이를 만들지 않고, 진행 중이나 실패일 때만 페이지 목적에 맞는 안내를 반환한다.
 * 정확하지 않은 미터를 준비 완료처럼 표현하지 않는 것이 사용자 신뢰 경계다.
 */
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
