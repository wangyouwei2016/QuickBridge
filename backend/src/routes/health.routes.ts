import { Router, Request, Response } from 'express';
import { env } from '../config/env';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

router.get('/info', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      version: env.API_VERSION,
      maxFileSize: env.MAX_FILE_SIZE,
      maxTextSize: 1024 * 1024, // 1MB
      addressTTL: `${env.ADDRESS_TTL_HOURS} hours`,
    },
  });
});

export default router;
