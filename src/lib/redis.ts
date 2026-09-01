import IORedis from "ioredis";

let redisInstance: IORedis | null = null;

export function getRedisClient(): IORedis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisInstance) {
    try {
      redisInstance = new IORedis(process.env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        enableAutoPipelining: true,
      });

      redisInstance.on("error", (err) => {
        console.warn("[REDIS] Redis client connection error:", err.message);
      });
    } catch {
      redisInstance = null;
    }
  }

  return redisInstance;
}
