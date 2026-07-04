import IORedis from "ioredis";

const PRESENCE_PREFIX = "discord-card:presence:";
const TRACKED_USERS_KEY = "discord-card:tracked-users";
const WORKER_STATUS_KEY = "discord-card:worker-status";

export type OfficialDiscordPresence = {
  discord_status?: "online" | "idle" | "dnd" | "offline";
  discord_user?: Record<string, unknown>;
  activities?: Array<Record<string, unknown>>;
  client_status?: Record<string, string>;
  guild_id?: string;
  updated_at?: string;
};

declare global {
  var discordPresenceRedis: IORedis | undefined;
}

function getRedis() {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;

  if (!global.discordPresenceRedis) {
    global.discordPresenceRedis = new IORedis(url, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2_500,
    });
    global.discordPresenceRedis.on("error", () => {
      // API callers handle Redis unavailability through the Lanyard fallback.
    });
  }

  return global.discordPresenceRedis;
}

async function ensureConnected(redis: IORedis) {
  if (redis.status === "wait") await redis.connect();
  return redis;
}

export function isOfficialDiscordPresenceConfigured() {
  return Boolean(process.env.REDIS_URL && process.env.DISCORD_BOT_TOKEN);
}

export function getDiscordPresenceInviteUrl() {
  return process.env.NEXT_PUBLIC_DISCORD_PRESENCE_INVITE_URL?.trim() || null;
}

export async function trackDiscordPresenceUser(userId: string) {
  const redis = getRedis();
  if (!redis) return false;

  try {
    await ensureConnected(redis);
    await redis.sadd(TRACKED_USERS_KEY, userId);
    return true;
  } catch {
    return false;
  }
}

export async function getOfficialDiscordPresence(userId: string) {
  const redis = getRedis();
  if (!redis) return null;

  try {
    await ensureConnected(redis);
    const raw = await redis.get(`${PRESENCE_PREFIX}${userId}`);
    if (!raw) return null;
    return JSON.parse(raw) as OfficialDiscordPresence;
  } catch {
    return null;
  }
}

export async function getDiscordPresenceWorkerStatus() {
  const redis = getRedis();
  if (!redis) return null;

  try {
    await ensureConnected(redis);
    const raw = await redis.get(WORKER_STATUS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      ready?: boolean;
      botUserId?: string;
      guildCount?: number;
      updatedAt?: string;
    };
  } catch {
    return null;
  }
}

export const DISCORD_PRESENCE_KEYS = {
  presencePrefix: PRESENCE_PREFIX,
  trackedUsers: TRACKED_USERS_KEY,
  workerStatus: WORKER_STATUS_KEY,
};
