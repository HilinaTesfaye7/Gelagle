import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service.js';
import { MemberService } from '../services/member.service.js';
import { getRolePermissions } from '../rbac/matrix.js';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required')
});

export class AuthController {
  constructor(
    private authService = new AuthService(),
    private memberService = new MemberService()
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const result = this.authService.login({
        identifier,
        password,
        ipAddress,
        userAgent
      });

      // Set HTTP-only session cookie
      res.cookie('session_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      const memberships = this.memberService['memberRepo'].findMembershipsByUserId(result.user.id);

      res.status(200).json({
        message: 'Login successful',
        user: result.user,
        token: result.token,
        expiresAt: result.expiresAt,
        memberships
      });
    } catch (error: any) {
      res.status(401).json({
        error: 'Authentication Failed',
        message: error.message || 'Invalid credentials'
      });
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.token || req.cookies?.session_token;
      const userId = req.user?.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      if (token) {
        this.authService.logout(token, userId, ipAddress, userAgent);
      }

      res.clearCookie('session_token');
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized', message: 'Not logged in' });
        return;
      }

      const memberships = this.memberService['memberRepo'].findMembershipsByUserId(req.user.id);

      // Collect distinct permissions granted through their assigned project roles
      const allPermissions = new Set<string>();
      memberships.forEach((m) => {
        getRolePermissions(m.role).forEach((p) => allPermissions.add(p));
      });

      res.status(200).json({
        user: req.user,
        memberships,
        grantedPermissions: Array.from(allPermissions)
      });
    } catch (error) {
      next(error);
    }
  };
}
