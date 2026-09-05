import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service.js';

export class ActivityController {
  constructor(private activityService = new ActivityService()) {}

  getProjectActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const activities = this.activityService.getProjectActivities(projectId, limit);
      res.status(200).json({ activities });
    } catch (error) {
      next(error);
    }
  };

  getUserActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId || req.user!.id;
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const activities = this.activityService.getUserActivities(userId, limit);
      res.status(200).json({ activities });
    } catch (error) {
      next(error);
    }
  };

  getGlobalActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const activities = this.activityService.getGlobalActivities(limit);
      res.status(200).json({ activities });
    } catch (error) {
      next(error);
    }
  };
}
