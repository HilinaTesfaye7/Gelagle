import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProjectService } from '../services/project.service.js';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  start_date: z.string().optional(),
  target_date: z.string().optional(),
  project_manager_id: z.string().optional(),
  product_owner_id: z.string().optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  start_date: z.string().nullable().optional(),
  target_date: z.string().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
  project_manager_id: z.string().nullable().optional(),
  product_owner_id: z.string().nullable().optional()
});

export class ProjectController {
  constructor(private projectService = new ProjectService()) {}

  listUserProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const projects = this.projectService.listUserProjects(userId);
      res.status(200).json({ projects });
    } catch (error) {
      next(error);
    }
  };

  createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const creatorId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const project = this.projectService.createProject(req.body, creatorId, ipAddress, userAgent);
      res.status(201).json({ message: 'Project created successfully', project });
    } catch (error: any) {
      res.status(400).json({ error: 'Creation Failed', message: error.message });
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const currentUserId = req.user!.id;

      const project = this.projectService.getProject(projectId, currentUserId);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.status(200).json({ project });
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const actorId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const updated = this.projectService.updateProject(projectId, req.body, actorId, ipAddress, userAgent);
      res.status(200).json({ message: 'Project updated successfully', project: updated });
    } catch (error: any) {
      res.status(400).json({ error: 'Update Failed', message: error.message });
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const actorId = req.user!.id;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const success = this.projectService.deleteProject(projectId, actorId, ipAddress, userAgent);
      if (!success) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
