import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { corsOptions } from './config/cors';
import { globalLimiter } from './middleware/rate-limiter';
import { errorHandler } from './middleware/error-handler';
import { getRedisClient, closeRedisClient } from './config/redis';
import { cleanupService } from './services/cleanup.service';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate limiting
app.use(globalLimiter);

// API routes
app.use(`/api/${env.API_VERSION}`, routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await getRedisClient();
    console.log('✓ Redis connected');

    // Start cleanup service
    cleanupService.start();
    console.log('✓ Cleanup service started');

    // Start Express server
    app.listen(env.PORT, () => {
      console.log(`✓ Server running on port ${env.PORT}`);
      console.log(`✓ Environment: ${env.NODE_ENV}`);
      console.log(`✓ API: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  cleanupService.stop();
  await closeRedisClient();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();
