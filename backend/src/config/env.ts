import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_VERSION: process.env.API_VERSION || 'v1',

  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',

  UPLOAD_DIR: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  MAX_FILE_SIZE: 200 * 1024 * 1024, // 200MB

  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  ADDRESS_TTL_HOURS: parseInt(process.env.ADDRESS_TTL_HOURS || '24', 10),
  MAX_ADDRESS_LIFETIME_DAYS: parseInt(process.env.MAX_ADDRESS_LIFETIME_DAYS || '7', 10),
  CLEANUP_INTERVAL_HOURS: parseInt(process.env.CLEANUP_INTERVAL_HOURS || '1', 10),
};
