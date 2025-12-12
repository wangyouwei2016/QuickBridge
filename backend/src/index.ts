import { corsOptions } from './config/cors';
import { env } from './config/env';
import { getRedisClient, closeRedisClient } from './config/redis';
import { errorHandler } from './middleware/error-handler';
import routes from './routes';
import { cleanupService } from './services/cleanup.service';
import cors from 'cors';
import express, { json, urlencoded, static as expressStatic } from 'express';
import helmet from 'helmet';
import path from 'path';

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // 允许内联脚本用于 Web 前端
  }),
);
app.use(cors(corsOptions));

// Body parsing
app.use(json({ limit: '2mb' }));
app.use(urlencoded({ extended: true, limit: '2mb' }));

// Rate limiting (disabled)
// app.use(globalLimiter);

// Serve static files from public directory
app.use(expressStatic(path.join(__dirname, '../public')));

// API routes
app.use(`/api/${env.API_VERSION}`, routes);

// Error handling
app.use(errorHandler);

// Serve index.html for root and any non-API routes
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Serve index.html for all other routes
  res.sendFile(path.join(__dirname, '../public/index.html'));
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
