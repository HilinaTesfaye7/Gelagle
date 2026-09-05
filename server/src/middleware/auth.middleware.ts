import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { SafeUser } from '../types/user.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
      token?: string;
    }
  }
}

const authService = new AuthService();

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.session_token) {
    token = req.cookies.session_token;
  }

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please log in.'
    });
    return;
  }

  const user = authService.validateSession(token);
  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Session is invalid or has expired. Please log in again.'
    });
    return;
  }

  req.user = user;
  req.token = token;
  next();
}
