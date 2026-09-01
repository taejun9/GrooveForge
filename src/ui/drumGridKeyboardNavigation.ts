/**
 * 드럼 스텝 그리드의 2차원 키보드 탐색 규칙을 DOM과 분리해 계산한다.
 * 선택된 lane/step과 키를 받아 경계 안의 다음 셀을 돌려주며, 화면 포커스 이동과 데이터 변경은 호출자가 수행한다.
 * 순수 함수로 유지해 키보드 접근성 동작을 브라우저 없이도 검증할 수 있게 한다.
 */
import { steps, type DrumLane } from "../domain/workstation";
import type { SelectedDrumStep } from "./workstationUiModel";

export const drumGridLaneOrder: DrumLane[] = ["kick", "clap", "hat", "perc"];

export const drumGridNavigationKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"] as const;
export const drumGridActivationKeys = ["Enter", " "] as const;

export type DrumGridNavigationKey = (typeof drumGridNavigationKeys)[number];
export type DrumGridActivationKey = (typeof drumGridActivationKeys)[number];

export function isDrumGridActivationKey(key: string): key is DrumGridActivationKey {
  return drumGridActivationKeys.includes(key as DrumGridActivationKey);
}

export function isDrumGridNavigationKey(key: string): key is DrumGridNavigationKey {
  return drumGridNavigationKeys.includes(key as DrumGridNavigationKey);
}

export function drumGridEntryStep(selectedStep: SelectedDrumStep | null): SelectedDrumStep {
  return selectedStep ?? { lane: drumGridLaneOrder[0], step: 0 };
}

export function drumGridNavigationTarget(
  current: SelectedDrumStep,
  key: DrumGridNavigationKey
): SelectedDrumStep {
  // 방향키는 그리드 가장자리에서 멈추고 Home/End는 현재 악기 행 안에서만 이동한다.
  const laneIndex = Math.max(0, drumGridLaneOrder.indexOf(current.lane));
  const lastLaneIndex = drumGridLaneOrder.length - 1;
  const lastStep = steps.length - 1;

  switch (key) {
    case "ArrowLeft":
      return { lane: current.lane, step: Math.max(0, current.step - 1) };
    case "ArrowRight":
      return { lane: current.lane, step: Math.min(lastStep, current.step + 1) };
    case "ArrowUp":
      return { lane: drumGridLaneOrder[Math.max(0, laneIndex - 1)], step: current.step };
    case "ArrowDown":
      return { lane: drumGridLaneOrder[Math.min(lastLaneIndex, laneIndex + 1)], step: current.step };
    case "Home":
      return { lane: current.lane, step: 0 };
    case "End":
      return { lane: current.lane, step: lastStep };
  }
}
