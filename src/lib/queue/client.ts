import { Queue } from 'bullmq';
import IORedis from 'ioredis';

let queueInstance: Queue | null = null;

export function getToolQueue(): Queue | null {
  if (!process.env.REDIS_URL || process.env.REDIS_URL.includes("localhost")) {
    return null;
  }

  if (!queueInstance) {
    try {
      const redisConnection = new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        connectTimeout: 2000,
        retryStrategy: () => null,
      });

      redisConnection.on('error', () => {
        // Silent fallback in dev
      });

      queueInstance = new Queue('tool-processing', {
        connection: redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
        },
      });
    } catch {
      queueInstance = null;
    }
  }

  return queueInstance;
}

// Lazy Proxy for backward-compatibility so module evaluation never connects to port 6379
export const toolQueue = new Proxy({} as Queue, {
  get(_target, prop) {
    const queue = getToolQueue();
    if (!queue) return undefined;
    return (queue as any)[prop];
  },
});

