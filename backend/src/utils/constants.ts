export const CONSTANTS = {
  ADDRESS: {
    RANDOM_LENGTH: 8,
    MIN_CUSTOM_LENGTH: 5,
    MAX_LENGTH: 20,
    COLLISION_RETRY_MAX: 5,
  },
  DATA: {
    MAX_TEXT_SIZE: 1024 * 1024, // 1MB
    MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
    TEXT_PREVIEW_LENGTH: 100,
  },
  TTL: {
    ADDRESS_HOURS: 24,
    MAX_LIFETIME_DAYS: 7,
  },
  REDIS_KEYS: {
    ADDRESS: (addr: string) => `addr:${addr}`,
    TEXT: (addr: string) => `text:${addr}`,
    FILES: (addr: string) => `files:${addr}`,
    FILE_META: (addr: string, fileId: string) => `file:${addr}:${fileId}`,
  },
};
