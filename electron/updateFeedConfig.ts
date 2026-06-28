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
  const { feedUrl, releaseChannel, ...redacted } = config;
  void feedUrl;
  void releaseChannel;
  return {
    ...redacted,
    channelValueRecorded: false,
    feedValueRecorded: false
  };
}
