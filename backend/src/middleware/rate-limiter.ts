import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const addressCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: 'Too many address creation attempts, please try again later',
  },
});

export const fileUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => req.params.address || req.ip || 'unknown',
  message: {
    success: false,
    error: 'Too many file uploads for this address, please try again later',
  },
});

export const fileDownloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  keyGenerator: (req) => req.params.address || req.ip || 'unknown',
  message: {
    success: false,
    error: 'Too many download requests, please try again later',
  },
});
