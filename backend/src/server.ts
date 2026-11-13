import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();

  // Middlewares
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root health & meta
  app.get('/', (req, res) => {
    res.json({
      name: 'MATHSPRINT API',
      tagline: 'Learn • Compete • Improve',
      version: '1.0.0',
      health: '/api/health',
    });
  });

  // Mount modular API routes
  app.use('/api', routes);

  // Centralized error handling
  app.use(errorHandler);

  return app;
};

export const startServer = (port = env.PORT) => {
  const app = createApp();
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`⚡ [MATHSPRINT Backend] Running on http://localhost:${port}`);
    console.log(`📡 [MATHSPRINT Backend] Health check: http://localhost:${port}/api/health`);
  });
  return { app, server };
};

// Start automatically if run directly
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  startServer();
}

export default createApp();
