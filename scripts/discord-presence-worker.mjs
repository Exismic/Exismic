import IORedis from "ioredis";

const token = process.env.DISCORD_BOT_TOKEN?.trim();
const redisUrl = process.env.REDIS_URL?.trim();

if (!token || !redisUrl) {
  console.error(
    "[Discord Presence] DISCORD_BOT_TOKEN and REDIS_URL are required.",
  );
  process.exit(1);
}

const redis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";
const INTENTS = (1 << 0) | (1 << 1) | (1 << 8);
const PRESENCE_PREFIX = "discord-card:presence:";
const TRACKED_USERS_KEY = "discord-card:tracked-users";
const WORKER_STATUS_KEY = "discord-card:worker-status";
const PRESENCE_TTL_SECONDS = 6 * 60 * 60;
const WORKER_TTL_SECONDS = 90;

let socket;
let heartbeatTimer;
let workerStatusTimer;
let trackedUsersTimer;
let sequence = null;
let resumeGatewayUrl = null;
let sessionId = null;
let reconnectDelay = 1_000;
const guilds = new Set();

function send(payload) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

async function setWorkerStatus(ready) {
  await redis.set(
    WORKER_STATUS_KEY,
    JSON.stringify({
      ready,
      botUserId: process.env.DISCORD_BOT_USER_ID || null,
      guildCount: guilds.size,
      updatedAt: new Date().toISOString(),
    }),
    "EX",
    WORKER_TTL_SECONDS,
  );
}

function normalizePresence(presence, guildId) {
  const user = presence.user || {};
  return {
    discord_status: presence.status || "offline",
    discord_user: {
      id: user.id,
      username: user.username,
      global_name: user.global_name,
      display_name: user.global_name || user.username,
      avatar: user.avatar,
      avatar_decoration_data: user.avatar_decoration_data || null,
      public_flags: user.public_flags,
    },
    activities: Array.isArray(presence.activities) ? presence.activities : [],
    client_status: presence.client_status || {},
    guild_id: guildId || presence.guild_id || null,
    updated_at: new Date().toISOString(),
  };
}

async function storePresence(presence, guildId) {
  const userId = presence?.user?.id;
  if (!userId) return;

  const tracked = await redis.sismember(TRACKED_USERS_KEY, userId);
  if (!tracked) return;

  await redis.set(
    `${PRESENCE_PREFIX}${userId}`,
    JSON.stringify(normalizePresence(presence, guildId)),
    "EX",
    PRESENCE_TTL_SECONDS,
  );
}

async function refreshTrackedUsers() {
  const trackedUserIds = (await redis.smembers(TRACKED_USERS_KEY)).slice(0, 100);
  if (!trackedUserIds.length || socket?.readyState !== WebSocket.OPEN) return;

  for (const guildId of guilds) {
    send({
      op: 8,
      d: {
        guild_id: guildId,
        user_ids: trackedUserIds,
        query: "",
        limit: 0,
        presences: true,
        nonce: `lumora-${Date.now()}-${guildId}`,
      },
    });
  }
}

async function handleDispatch(eventName, data) {
  if (eventName === "READY") {
    sessionId = data.session_id;
    resumeGatewayUrl = data.resume_gateway_url;
    reconnectDelay = 1_000;
    if (data.user?.id) process.env.DISCORD_BOT_USER_ID = data.user.id;
    await setWorkerStatus(true);
    console.log(
      `[Discord Presence] Ready as ${data.user?.username || data.user?.id}.`,
    );
    return;
  }

  if (eventName === "GUILD_CREATE") {
    guilds.add(data.id);
    const presences = Array.isArray(data.presences) ? data.presences : [];
    await Promise.allSettled(
      presences.map((presence) => storePresence(presence, data.id)),
    );
    await setWorkerStatus(true);
    await refreshTrackedUsers();
    return;
  }

  if (eventName === "GUILD_DELETE") {
    guilds.delete(data.id);
    await setWorkerStatus(true);
    return;
  }

  if (eventName === "PRESENCE_UPDATE") {
    await storePresence(data, data.guild_id);
    return;
  }

  if (eventName === "GUILD_MEMBERS_CHUNK") {
    const presences = new Map(
      (Array.isArray(data.presences) ? data.presences : [])
        .filter((presence) => presence?.user?.id)
        .map((presence) => [presence.user.id, presence]),
    );

    const members = Array.isArray(data.members) ? data.members : [];
    await Promise.allSettled(
      members.map((member) => {
        const user = member?.user;
        if (!user?.id) return Promise.resolve();
        const presence = presences.get(user.id);
        return storePresence(
          presence
            ? { ...presence, user: { ...user, ...presence.user } }
            : {
                user,
                status: "offline",
                activities: [],
                client_status: {},
              },
          data.guild_id,
        );
      }),
    );
  }
}

function startHeartbeat(interval) {
  clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => {
    send({ op: 1, d: sequence });
  }, interval);
}

function identify() {
  send({
    op: 2,
    d: {
      token,
      intents: INTENTS,
      properties: {
        os: process.platform,
        browser: "lumora-discord-presence",
        device: "lumora-discord-presence",
      },
      compress: false,
      large_threshold: 50,
    },
  });
}

function resume() {
  send({
    op: 6,
    d: {
      token,
      session_id: sessionId,
      seq: sequence,
    },
  });
}

function scheduleReconnect() {
  clearInterval(heartbeatTimer);
  clearInterval(workerStatusTimer);
  clearInterval(trackedUsersTimer);
  setTimeout(connect, reconnectDelay);
  reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
}

function connect() {
  socket = new WebSocket(resumeGatewayUrl || GATEWAY_URL);

  socket.addEventListener("open", () => {
    console.log("[Discord Presence] Gateway connected.");
  });

  socket.addEventListener("message", async (event) => {
    const payload = JSON.parse(String(event.data));
    if (payload.s !== null && payload.s !== undefined) sequence = payload.s;

    if (payload.op === 10) {
      startHeartbeat(payload.d.heartbeat_interval);
      if (sessionId) resume();
      else identify();
      return;
    }

    if (payload.op === 7) {
      socket.close(4_000, "Reconnect requested");
      return;
    }

    if (payload.op === 9) {
      if (!payload.d) {
        sessionId = null;
        sequence = null;
        resumeGatewayUrl = null;
      }
      socket.close(4_000, "Invalid session");
      return;
    }

    if (payload.op === 0 && payload.t) {
      await handleDispatch(payload.t, payload.d);
    }
  });

  socket.addEventListener("close", () => {
    void setWorkerStatus(false).catch(() => {});
    scheduleReconnect();
  });

  socket.addEventListener("error", (error) => {
    console.error("[Discord Presence] Gateway error:", error.message || error);
  });

  workerStatusTimer = setInterval(() => {
    void setWorkerStatus(socket?.readyState === WebSocket.OPEN).catch(() => {});
  }, 30_000);
  trackedUsersTimer = setInterval(() => {
    void refreshTrackedUsers().catch((error) => {
      console.error("[Discord Presence] User refresh failed:", error);
    });
  }, 15_000);
}

process.on("SIGINT", async () => {
  clearInterval(heartbeatTimer);
  clearInterval(workerStatusTimer);
  clearInterval(trackedUsersTimer);
  await setWorkerStatus(false).catch(() => {});
  socket?.close(1_000, "Worker shutting down");
  await redis.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  clearInterval(heartbeatTimer);
  clearInterval(workerStatusTimer);
  clearInterval(trackedUsersTimer);
  await setWorkerStatus(false).catch(() => {});
  socket?.close(1_000, "Worker shutting down");
  await redis.quit();
  process.exit(0);
});

connect();
