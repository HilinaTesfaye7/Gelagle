import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserService } from '../services/user.service.js';

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  timezone: z.string().optional(),
  availability_status: z.enum(['AVAILABLE', 'BUSY', 'AWAY', 'OFFLINE']).optional(),
  skills: z.array(z.string()).optional(),
  notification_preferences: z.record(z.any()).optional(),
  daily_checkin_enabled: z.boolean().optional()
});

export class UserController {
  constructor(private userService = new UserService()) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId || req.user?.id;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const user = this.userService.getUserById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const memberships = this.userService.getUserMemberships(userId);
      res.status(200).json({ user, memberships });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetUserId = req.params.userId || req.user?.id;
      const actorId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      // Regular users can only update their own profile
      if (targetUserId !== actorId) {
        res.status(403).json({ error: 'Forbidden', message: 'You can only update your own profile' });
        return;
      }

      const updated = this.userService.updateProfile(targetUserId, req.body, actorId, ipAddress, userAgent);
      res.status(200).json({ message: 'Profile updated successfully', user: updated });
    } catch (error: any) {
      res.status(400).json({ error: 'Update Failed', message: error.message });
    }
  };

  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = this.userService.getAllUsers();
      res.status(200).json({ users });
    } catch (error) {
      next(error);
    }
  };

  getMemberships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId || req.user?.id;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const memberships = this.userService.getUserMemberships(userId);
      res.status(200).json({ memberships });
    } catch (error) {
      next(error);
    }
  };
}
