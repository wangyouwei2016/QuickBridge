import { env } from './env';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

const isReadOnlyError = (err: Error): boolean => {
  return err.message.includes('READONLY');
};

// 延迟重连，避免立即重连造成死循环
const scheduleReconnect = () => {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch {
        // 忽略关闭错误
      }
      redisClient = null;
    }
    try {
      await getRedisClient();
      console.log('Redis reconnected successfully');
    } catch (err) {
      console.error('Redis reconnection failed:', err);
    }
  }, 5000);
};

export type RedisClient = RedisClientType;

export const getRedisClient = async (): Promise<RedisClientType> => {
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
    // 单节点模式，明确禁用从节点读取
    database: 0,
  });

  redisClient.on('error', err => {
    console.error('Redis Client Error:', err);
    // 当检测到 READONLY 错误时，断开连接强制重连到主节点
    if (isReadOnlyError(err)) {
      console.warn('Detected read-only replica, forcing reconnection...');
      scheduleReconnect();
    }
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
  });

  redisClient.on('ready', () => {
    console.log('Redis Client Ready');
  });

  redisClient.on('close', () => {
    console.log('Redis Client Closed');
  });

  redisClient.on('reconnecting', () => {
    console.log('Redis Client Reconnecting...');
  });

  await redisClient.connect();
  return redisClient;
};

export const closeRedisClient = async (): Promise<void> => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
};
