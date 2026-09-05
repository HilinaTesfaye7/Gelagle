import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TeamService } from '../services/team.service.js';

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  description: z.string().optional()
});

export const addTeamMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required')
});

export class TeamController {
  constructor(private teamService = new TeamService()) {}

  listTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const teams = this.teamService.getTeamsByProject(projectId);
      res.status(200).json({ teams });
    } catch (error) {
      next(error);
    }
  };

  createTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const actorId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const team = this.teamService.createTeam(projectId, req.body, actorId, ipAddress, userAgent);
      res.status(201).json({ message: 'Team created successfully', team });
    } catch (error: any) {
      res.status(400).json({ error: 'Create Team Failed', message: error.message });
    }
  };

  addTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teamId = req.params.teamId;
      const targetUserId = req.body.userId;
      const actorId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const success = this.teamService.addMemberToTeam(teamId, targetUserId, actorId, ipAddress, userAgent);
      res.status(200).json({ message: 'Team member added successfully', success });
    } catch (error: any) {
      res.status(400).json({ error: 'Add Team Member Failed', message: error.message });
    }
  };

  removeTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teamId = req.params.teamId;
      const targetUserId = req.params.userId;
      const actorId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const success = this.teamService.removeMemberFromTeam(teamId, targetUserId, actorId, ipAddress, userAgent);
      res.status(200).json({ message: 'Team member removed successfully', success });
    } catch (error: any) {
      res.status(400).json({ error: 'Remove Team Member Failed', message: error.message });
    }
  };

  deleteTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teamId = req.params.teamId;
      const actorId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const success = this.teamService.deleteTeam(teamId, actorId, ipAddress, userAgent);
      if (!success) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }
      res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
