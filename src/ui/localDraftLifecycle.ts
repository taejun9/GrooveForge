export type LocalDraftWriteGate = {
  shouldWrite: boolean;
  skipNextWrite: boolean;
};

export function resolveLocalDraftWriteGate(writeArmed: boolean, skipNextWrite: boolean): LocalDraftWriteGate {
  if (skipNextWrite) {
    return { shouldWrite: false, skipNextWrite: false };
  }
  return { shouldWrite: writeArmed, skipNextWrite: false };
}

export function shouldCommitLocalDraftClear(
  requestId: number,
  latestRequestId: number,
  recoveryAtStart: unknown,
  currentRecovery: unknown,
  projectAtStart: unknown,
  currentProject: unknown
): boolean {
  return (
    requestId === latestRequestId &&
    recoveryAtStart === currentRecovery &&
    projectAtStart === currentProject
  );
}
