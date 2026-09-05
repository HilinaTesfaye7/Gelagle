import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { MemberService } from '../services/member.service.js';
import { ALL_ROLES, RoleType } from '../rbac/roles.js';

export const addMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(ALL_ROLES as [RoleType, ...RoleType[]]),
  responsibilities: z.string().optional()
});

export const updateMemberSchema = z.object({
  role: z.enum(ALL_ROLES as [RoleType, ...RoleType[]]).optional(),
  responsibilities: z.string().optional()
});

export class MemberController {
  constructor(private memberService = new MemberService()) {}

  listMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const members = this.memberService.getProjectMembers(projectId);
      res.status(200).json({ members });
    } catch (error) {
      next(error);
    }
  };

  addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const actorId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const member = this.memberService.addMember(projectId, req.body, actorId, ipAddress, userAgent);
      res.status(201).json({ message: 'Member added successfully', member });
    } catch (error: any) {
      res.status(400).json({ error: 'Add Member Failed', message: error.message });
    }
  };

  updateMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const targetUserId = req.params.userId;
      const actorId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const updated = this.memberService.updateMember(
        projectId,
        targetUserId,
        req.body,
        actorId,
        ipAddress,
        userAgent
      );
      res.status(200).json({ message: 'Member updated successfully', member: updated });
    } catch (error: any) {
      res.status(400).json({ error: 'Update Member Failed', message: error.message });
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const targetUserId = req.params.userId;
      const actorId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const success = this.memberService.removeMember(projectId, targetUserId, actorId, ipAddress, userAgent);
      if (!success) {
        res.status(404).json({ error: 'Member not found in project' });
        return;
      }

      res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
      next(error);
    }
  };
}
