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
      origin: [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use('/api', createRouter());

  // Static Frontend files if built
  const clientDist = path.resolve(process.cwd(), 'client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
