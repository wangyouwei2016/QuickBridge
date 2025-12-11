import { fileService } from './file.service';
import { env } from '../config/env';

export class CleanupService {
  private intervalId: NodeJS.Timeout | null = null;

  start(): void {
    const intervalMs = env.CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000;

    console.log(`Starting cleanup service (interval: ${env.CLEANUP_INTERVAL_HOURS}h)`);

    this.intervalId = setInterval(async () => {
      try {
        await fileService.cleanupExpiredFiles();
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    }, intervalMs);

    // Run immediately on start
    fileService.cleanupExpiredFiles().catch(console.error);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Cleanup service stopped');
    }
  }
}

export const cleanupService = new CleanupService();
