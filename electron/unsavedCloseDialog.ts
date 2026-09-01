/**
 * 네이티브 미저장 작업 대화상자의 버튼 인덱스를 의미 있는 닫기 동작으로 변환한다.
 * 저장·파일 없이 닫기만 명시적으로 허용하고 알 수 없는 값과 취소는 계속 편집으로 처리해 창을 닫지 않는다.
 * 플랫폼별 대화상자 반환값이 예상 밖이어도 데이터 손실 방향으로 진행하지 않는 보수적 실패 규칙이다.
 */
export const saveAndCloseChoiceId = 0;
export const closeWithoutProjectFileChoiceId = 1;
export const keepEditingChoiceId = 2;

export type UnsavedCloseAction = "save-and-close" | "close-without-project-file" | "keep-editing";

export function resolveUnsavedCloseAction(choiceId: number): UnsavedCloseAction {
  if (choiceId === saveAndCloseChoiceId) {
    return "save-and-close";
  }
  if (choiceId === closeWithoutProjectFileChoiceId) {
    return "close-without-project-file";
  }
  return "keep-editing";
}
