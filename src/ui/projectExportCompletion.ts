/**
 * 비동기 내보내기 완료가 현재 화면의 프로젝트와 여전히 같은지 검증하고 영수증을 스냅샷에 결박한다.
 * 요청 순서와 프로젝트 객체 동일성이 모두 맞을 때만 완료 상태를 노출한다.
 * 이전 프로젝트의 산출물을 현재 프로젝트의 최신 전달본으로 표시하지 않는 것이 핵심 실패 경계다.
 */
export function shouldCommitProjectExportResult<Project>(
  requestId: number,
  latestRequestId: number,
  exportedProject: Project,
  currentProject: Project
): boolean {
  return requestId === latestRequestId && exportedProject === currentProject;
}

export type ProjectBoundExportReceipt<Project, Receipt> = {
  project: Project;
  receipt: Receipt;
};

/**
 * 내보내기 영수증은 하나의 불변 프로젝트 스냅샷만 설명한다. 메타데이터만 바뀌어도 새 프로젝트
 * 객체가 생기므로 이전 영수증을 숨겨, 오래된 패키지를 현재 전송 준비본이라고 표시하지 않는다.
 */
export function bindProjectExportReceipt<Project, Receipt>(
  project: Project,
  receipt: Receipt
): ProjectBoundExportReceipt<Project, Receipt> {
  return { project, receipt };
}

export function currentProjectExportReceipt<Project, Receipt>(
  boundReceipt: ProjectBoundExportReceipt<Project, Receipt> | null,
  currentProject: Project
): Receipt | null {
  return boundReceipt?.project === currentProject ? boundReceipt.receipt : null;
}
