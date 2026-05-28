import Redis from 'ioredis';

let redisClient: Redis | null = null;

export async function connectRedis(): Promise<Redis> {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
  redisClient = new Redis(url);

  redisClient.on('connect', () => console.log('🔴  Redis connected'));
  redisClient.on('error',   (err) => console.error('❌  Redis error:', err));

  return redisClient;
}

export function getRedis(): Redis {
  if (!redisClient) throw new Error('Redis client not initialized. Call connectRedis() first.');
  return redisClient;
}
