/**
 * 코드 카드가 마우스뿐 아니라 키보드로도 동일하게 활성화되도록 하는 접근성 어댑터다.
 * 카드 자신이 포커스를 받은 경우의 Enter/Space만 소비하며, 내부 버튼에서 올라온 이벤트는 건드리지 않는다.
 * 이 경계를 지켜야 중첩 컨트롤이 한 번의 키 입력으로 두 번 실행되는 회귀를 막을 수 있다.
 */
export interface ChordCardKeyboardActivationEvent {
  key: string;
  target: unknown;
  currentTarget: unknown;
  preventDefault: () => void;
  stopPropagation: () => void;
}

export function handleChordCardKeyboardActivation(
  event: ChordCardKeyboardActivationEvent,
  onActivate: () => void
): boolean {
  // 내부 컨트롤의 키 이벤트는 해당 컨트롤에 맡기고, 카드 표면을 직접 누른 경우만 활성화한다.
  if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  onActivate();
  return true;
}
