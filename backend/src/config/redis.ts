import { createClient } from 'redis';
import { env } from './env';

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

const isReadOnlyError = (err: Error): boolean => {
  return err.message.includes('READONLY');
};

export const getRedisClient = async (): Promise<RedisClient> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    socket: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis max reconnection attempts reached');
          return new Error('Redis max reconnection attempts reached');
        }
        return Math.min(retries * 200, 1000);
      },
    },
    password: env.REDIS_PASSWORD || undefined,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
    // 当检测到 READONLY 错误时，断开连接强制重连到主节点
    if (isReadOnlyError(err)) {
      console.warn('Detected read-only replica, forcing reconnection...');
      redisClient?.disconnect();
    }
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
  });

  redisClient.on('ready', () => {
    console.log('Redis Client Ready');
  });

  redisClient.on('reconnecting', () => {
    console.log('Redis Client Reconnecting...');
  });

  redisClient.on('close', () => {
    console.log('Redis Client Closed');
  });

  await redisClient.connect();
  return redisClient;
};

export const closeRedisClient = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
};
