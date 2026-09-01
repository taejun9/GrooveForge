/**
 * 배포 환경변수에서 자동 업데이트 피드와 릴리스 채널을 읽고 안전하게 사용할 수 있는지 판정한다.
 * 우선순위가 정해진 키 중 첫 값을 선택한 뒤 HTTPS·호스트·자격증명·채널 형식을 검증해 blocker 목록을 만든다.
 * 진단 기록에는 실제 URL/채널 값을 제거한 구조만 제공해 배포 경로나 비밀이 로그에 남지 않게 한다.
 */
export const updateFeedUrlKeys = ["GROOVEFORGE_UPDATE_FEED_URL", "ELECTRON_UPDATE_FEED_URL", "UPDATE_FEED_URL"] as const;
export const updateChannelKeys = ["GROOVEFORGE_UPDATE_CHANNEL", "ELECTRON_UPDATE_CHANNEL", "UPDATE_CHANNEL"] as const;

export type UpdateFeedUrlKey = (typeof updateFeedUrlKeys)[number];
export type UpdateChannelKey = (typeof updateChannelKeys)[number];
export type UpdateFeedEnvKey = UpdateFeedUrlKey | UpdateChannelKey;

export type UpdateFeedConfig = {
  blockers: string[];
  channelKey: UpdateChannelKey | null;
  feedKey: UpdateFeedUrlKey | null;
  feedUrl: string;
  feedUrlPresent: boolean;
  feedUrlValid: boolean;
  presentEnvironmentKeys: UpdateFeedEnvKey[];
  ready: boolean;
  releaseChannel: string;
  releaseChannelPresent: boolean;
  releaseChannelValid: boolean;
};

export type RedactedUpdateFeedConfig = Omit<UpdateFeedConfig, "feedUrl" | "releaseChannel"> & {
  channelValueRecorded: false;
  feedValueRecorded: false;
};

type EnvLike = Partial<Record<UpdateFeedEnvKey, string | undefined>>;

function readFirstEnv(keys: readonly UpdateFeedEnvKey[], env: EnvLike): { key: UpdateFeedEnvKey | null; value: string } {
  for (const key of keys) {
    const value = env[key];
    if (value && value.trim().length > 0) {
      return { key, value: value.trim() };
    }
  }

  return { key: null, value: "" };
}

function validateFeedUrl(value: string): string[] {
  if (!value) {
    return ["No update feed URL environment key is configured."];
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return ["Update feed URL must be an absolute HTTPS URL."];
  }

  const blockers: string[] = [];
  // 자동 업데이트는 네트워크 신뢰 경계이므로 평문·내장 자격증명·fragment가 있는 주소를 준비 완료로 보지 않는다.
  if (parsed.protocol !== "https:") {
    blockers.push("Update feed URL must use HTTPS for release checks.");
  }
  if (!parsed.hostname) {
    blockers.push("Update feed URL must include a hostname.");
  }
  if (parsed.username || parsed.password) {
    blockers.push("Update feed URL must not include credentials.");
  }
  if (parsed.hash) {
    blockers.push("Update feed URL must not include a fragment.");
  }

  return blockers;
}

function validateReleaseChannel(value: string): string[] {
  if (!value) {
    return ["No update release channel environment key is configured."];
  }

  if (!/^[a-z0-9][a-z0-9._-]{0,31}$/.test(value)) {
    return ["Update release channel must use 1-32 lowercase letters, numbers, dots, underscores, or hyphens."];
  }

  return [];
}

export function resolveUpdateFeedConfig(env: EnvLike = process.env): UpdateFeedConfig {
  const feed = readFirstEnv(updateFeedUrlKeys, env);
  const channel = readFirstEnv(updateChannelKeys, env);
  const feedBlockers = validateFeedUrl(feed.value);
  const channelBlockers = validateReleaseChannel(channel.value);
  const blockers = [...feedBlockers, ...channelBlockers];
  const feedKey = feed.key as UpdateFeedUrlKey | null;
  const channelKey = channel.key as UpdateChannelKey | null;
  const presentEnvironmentKeys = [...updateFeedUrlKeys, ...updateChannelKeys].filter((key) => Boolean(env[key]));

  return {
    blockers,
    channelKey,
    feedKey,
    feedUrl: feed.value,
    feedUrlPresent: feed.value.length > 0,
    feedUrlValid: feedBlockers.length === 0,
    presentEnvironmentKeys,
    ready: blockers.length === 0,
    releaseChannel: channel.value,
    releaseChannelPresent: channel.value.length > 0,
    releaseChannelValid: channelBlockers.length === 0
  };
}

export function redactUpdateFeedConfig(config: UpdateFeedConfig): RedactedUpdateFeedConfig {
  // 구조 분해로 민감한 원문을 확실히 버리고 존재/유효성 같은 운영 진단 정보만 남긴다.
  const { feedUrl, releaseChannel, ...redacted } = config;
  void feedUrl;
  void releaseChannel;
  return {
    ...redacted,
    channelValueRecorded: false,
    feedValueRecorded: false
  };
}
