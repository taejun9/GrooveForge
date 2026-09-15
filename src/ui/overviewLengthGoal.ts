/**
 * 역할: Overview에서 현재 편곡의 예상 WAV 길이를 사용자가 고른 90~180초 작업 목표와 비교한다.
 * 흐름: 오디오 렌더러의 템포별 export tail을 포함해 현재 길이와 BPM별 마디 경계를 계산한다.
 * 안전 경계: 프로젝트나 렌더 상태를 바꾸지 않는 읽기 전용 계산이며 64마디 상한을 함께 알린다.
 */
import { exportTailDurationSeconds, wavSampleRate } from "../audio/render";
import {
  arrangementTotalBars,
  maxProjectArrangementBars,
  projectStepDurationSeconds,
  stepsPerBar,
  type ProjectState
} from "../domain/workstation";

export const overviewLengthGoalMinimumSeconds = 90;
export const overviewLengthGoalMaximumSeconds = 180;

export type OverviewLengthGoal = {
  currentBars: number;
  estimatedExportSeconds: number;
  maximumBars: number;
  minimumBars: number;
  neededBarChange: number;
  possibleAtCurrentBpm: boolean;
  status: "short" | "in-range" | "long";
};

export type OverviewLengthEstimateDisplay = { clock: string; seconds: string };

export function formatOverviewLengthEstimate(
  estimatedExportSeconds: number,
  status: OverviewLengthGoal["status"]
): OverviewLengthEstimateDisplay {
  // 화면의 두 숫자를 같은 0.01초 정수에서 만들고, 미달/초과는 목표 경계 쪽으로 반올림하지 않는다.
  const boundedSeconds = Math.max(0, estimatedExportSeconds);
  const centiseconds = status === "short"
    ? Math.floor(boundedSeconds * 100)
    : status === "long"
      ? Math.ceil(boundedSeconds * 100)
      : Math.round(boundedSeconds * 100);
  const minutes = Math.floor(centiseconds / 6000);
  const secondPart = Math.floor((centiseconds % 6000) / 100);
  const centisecondPart = centiseconds % 100;
  return {
    clock: `${minutes}:${secondPart.toString().padStart(2, "0")}.${centisecondPart.toString().padStart(2, "0")}`,
    seconds: (centiseconds / 100).toFixed(2)
  };
}

export function createOverviewLengthGoal(project: ProjectState): OverviewLengthGoal {
  const currentBars = arrangementTotalBars(project);
  const secondsPerBar = stepsPerBar * projectStepDurationSeconds(project);
  const exportTailSeconds = exportTailDurationSeconds(project);
  // 렌더러와 같은 ceil(frame) 경계를 써 89.999초 같은 파일을 표시만 90초로 판정하지 않는다.
  const wavSecondsForBars = (bars: number): number =>
    Math.ceil((bars * secondsPerBar + exportTailSeconds) * wavSampleRate) / wavSampleRate;
  const estimatedExportSeconds = wavSecondsForBars(currentBars);
  let minimumBars = Math.max(1, Math.ceil((overviewLengthGoalMinimumSeconds - exportTailSeconds) / secondsPerBar));
  while (minimumBars > 1 && wavSecondsForBars(minimumBars - 1) >= overviewLengthGoalMinimumSeconds) minimumBars -= 1;
  while (wavSecondsForBars(minimumBars) < overviewLengthGoalMinimumSeconds) minimumBars += 1;
  let maximumBars = Math.min(
    maxProjectArrangementBars,
    Math.max(0, Math.floor((overviewLengthGoalMaximumSeconds - exportTailSeconds) / secondsPerBar))
  );
  while (maximumBars < maxProjectArrangementBars && wavSecondsForBars(maximumBars + 1) <= overviewLengthGoalMaximumSeconds) maximumBars += 1;
  while (maximumBars > 0 && wavSecondsForBars(maximumBars) > overviewLengthGoalMaximumSeconds) maximumBars -= 1;
  const status = estimatedExportSeconds < overviewLengthGoalMinimumSeconds
    ? "short"
    : estimatedExportSeconds > overviewLengthGoalMaximumSeconds
      ? "long"
      : "in-range";

  return {
    currentBars,
    estimatedExportSeconds,
    maximumBars,
    minimumBars,
    neededBarChange: status === "short"
      ? Math.max(0, minimumBars - currentBars)
      : status === "long"
        ? Math.max(0, currentBars - maximumBars)
        : 0,
    possibleAtCurrentBpm: minimumBars <= maxProjectArrangementBars && minimumBars <= maximumBars,
    status
  };
}
