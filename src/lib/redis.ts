import IORedis from "ioredis";

let redisInstance: IORedis | null = null;
let isRedisDisabled = false;
let hasLoggedUnavailable = false;

export function getRedisClient(): IORedis | null {
  if (isRedisDisabled || !process.env.REDIS_URL) {
    return null;
  }

  if (!redisInstance) {
    try {
      const client = new IORedis(process.env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        enableAutoPipelining: true,
        retryStrategy(times) {
          // If Redis is not available locally, stop retrying immediately to prevent terminal log spam
          if (times >= 1) {
            isRedisDisabled = true;
            return null;
          }
          return null;
        },
      });

      client.on("error", (err: any) => {
        if (!hasLoggedUnavailable) {
          hasLoggedUnavailable = true;
          if (err?.code === "ECONNREFUSED") {
            console.info(
              "[REDIS] Local Redis server not detected (127.0.0.1:6379). Falling back to direct database / memory cache."
            );
          } else {
            console.warn("[REDIS] Cache client error:", err?.message || String(err));
          }
        }
        isRedisDisabled = true;
        try {
          client.disconnect();
        } catch {
          // Ignore disconnect error
        }
        redisInstance = null;
      });

      redisInstance = client;
    } catch {
      isRedisDisabled = true;
      redisInstance = null;
    }
  }

  return isRedisDisabled ? null : redisInstance;
}
