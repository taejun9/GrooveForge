/**
 * 실제 재생 시작과 가청 출력을 유한한 시간 동안 관측하는 Electron QA 전용 순수 상태 흐름이다.
 * 시작 대기와 재생 관측을 분리하고 고정 간격의 원본 표본을 남겨 음악의 쉼을 전체 무음으로 오판하지 않는다.
 * 창 종료·시작 시간 초과는 완료로 인정하지 않으며 시계와 대기 함수를 주입해 실제 재생 없이 경계를 검증한다.
 */
export type PlaybackAudibilityObservation = {
  status: "complete" | "start-timeout" | "window-closed";
  durationMs: number;
  intervalMs: number;
  startWaitMs: number;
  observedMs: number;
  sampleCount: number;
  audibleSampleCount: number;
  audibleObserved: boolean;
  firstAudibleAtMs: number | null;
  lastAudibleAtMs: number | null;
  samples: Array<{ elapsedMs: number; audible: boolean }>;
};

type ObservationOptions = {
  durationMs: number;
  intervalMs?: number;
  startTimeoutMs?: number;
  isPlaybackStarted: () => boolean;
  isClosed: () => boolean;
  isAudible: () => boolean;
  now?: () => number;
  wait?: (milliseconds: number) => Promise<void>;
};

export async function observePlaybackAudibility(options: ObservationOptions): Promise<PlaybackAudibilityObservation> {
  const intervalMs = options.intervalMs ?? 100;
  const startTimeoutMs = options.startTimeoutMs ?? 5000;
  if (![options.durationMs, intervalMs, startTimeoutMs].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error("Playback observation requires finite positive time bounds.");
  }
  const now = options.now ?? (() => performance.now());
  const wait = options.wait ?? ((milliseconds) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds)));
  const requestedAt = now();
  let startedAt: number | null = null;
  const samples: PlaybackAudibilityObservation["samples"] = [];
  const result = (status: PlaybackAudibilityObservation["status"]): PlaybackAudibilityObservation => {
    const audibleSamples = samples.filter((sample) => sample.audible);
    return {
      status,
      durationMs: options.durationMs,
      intervalMs,
      startWaitMs: (startedAt ?? now()) - requestedAt,
      observedMs: startedAt === null ? 0 : now() - startedAt,
      sampleCount: samples.length,
      audibleSampleCount: audibleSamples.length,
      audibleObserved: audibleSamples.length > 0,
      firstAudibleAtMs: audibleSamples[0]?.elapsedMs ?? null,
      lastAudibleAtMs: audibleSamples.at(-1)?.elapsedMs ?? null,
      samples
    };
  };

  while (startedAt === null) {
    if (options.isClosed()) return result("window-closed");
    const remaining = startTimeoutMs - (now() - requestedAt);
    if (remaining <= 0) return result("start-timeout");
    if (options.isPlaybackStarted()) {
      startedAt = now();
      break;
    }
    await wait(Math.min(intervalMs, remaining));
  }

  while (true) {
    if (options.isClosed()) return result("window-closed");
    const elapsedMs = now() - startedAt;
    // 타이머가 늦게 깨어나도 시간 상한 밖의 뒤늦은 소리를 통과 근거로 추가하지 않는다.
    if (elapsedMs > options.durationMs) return result("complete");
    samples.push({ elapsedMs, audible: options.isAudible() });
    const remaining = options.durationMs - elapsedMs;
    if (remaining <= 0) return result("complete");
    await wait(Math.min(intervalMs, remaining));
  }
}
