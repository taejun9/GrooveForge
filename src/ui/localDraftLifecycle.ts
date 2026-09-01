/**
 * 로컬 복구 초안의 자동 저장과 삭제 완료 시점을 판정하는 작은 동시성 규칙 모음이다.
 * 프로젝트 교체 직후 한 번의 쓰기를 건너뛰고, 비동기 삭제는 요청 번호와 시작 시점 객체가 모두 최신일 때만 반영한다.
 * 오래된 비동기 완료가 새 프로젝트의 복구본을 지우지 못하게 하는 것이 핵심 안전 경계다.
 */
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
  // 객체 동일성까지 비교해 같은 내용처럼 보이는 새 세션을 이전 삭제 요청이 덮어쓰지 못하게 한다.
  return (
    requestId === latestRequestId &&
    recoveryAtStart === currentRecovery &&
    projectAtStart === currentProject
  );
}
