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
 * Export receipts describe one immutable project snapshot. Even metadata-only
 * edits create a new project object and must hide the previous receipt so the
 * current UI never claims that an older package is ready to send.
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
