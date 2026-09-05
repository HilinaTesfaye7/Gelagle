import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err.message || err);

  const statusCode = err.statusCode || (err.message?.includes('not found') ? 404 : 500);

  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    ...(config.nodeEnv === 'development' ? { stack: err.stack } : {})
  });
}
