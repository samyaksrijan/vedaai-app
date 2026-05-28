import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

// BullMQ requires maxRetriesPerRequest to be null on the Redis connection instance
const queueConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const assignmentQueue = new Queue('assignment-generation', {
  connection: queueConnection as any,
});
