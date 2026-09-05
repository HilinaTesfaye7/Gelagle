import path from 'path';
import fs from 'fs';
import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createRouter } from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { config } from './config/index.js';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes (mounted at /api and root to support direct or rewritten serverless execution)
  const apiRouter = createRouter();
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  // Static Frontend files if built
  const distPath = fs.existsSync(path.resolve(process.cwd(), 'dist'))
    ? path.resolve(process.cwd(), 'dist')
    : path.resolve(process.cwd(), 'client/dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
