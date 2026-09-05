import { Request, Response } from 'express';
import { DailyUpdateService } from '../services/daily-update.service.js';
import { z } from 'zod';

const dailyUpdateService = new DailyUpdateService();

export const createDailyUpdateSchema = z.object({
  q1Question: z.string().min(1),
  q1Answer: z.string().min(1),
  q2Question: z.string().min(1),
  q2Answer: z.string().min(1),
  q3Question: z.string().min(1),
  q3Answer: z.string().min(1),
  source: z.enum(['TELEGRAM', 'WEB']).optional().default('WEB')
});

export const dailyUpdateController = {
  getProjectDailyUpdates(req: Request, res: Response) {
    const { projectId } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const updates = dailyUpdateService.getUpdatesForProject(projectId, limit);
    res.json({ success: true, updates });
  },

  createProjectDailyUpdate(req: Request, res: Response) {
    const { projectId } = req.params;
    const user = (req as any).user;
    const userRole = (req as any).projectRole || user.role || 'MEMBER';
    const body = createDailyUpdateSchema.parse(req.body);

    const update = dailyUpdateService.createDailyUpdate({
      projectId,
      userId: user.id,
      userName: user.name,
      role: userRole,
      q1Question: body.q1Question,
      q1Answer: body.q1Answer,
      q2Question: body.q2Question,
      q2Answer: body.q2Answer,
      q3Question: body.q3Question,
      q3Answer: body.q3Answer,
      source: body.source
    });

    res.status(201).json({ success: true, update });
  },

  getRecentDailyUpdates(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const updates = dailyUpdateService.getRecentUpdates(limit);
    res.json({ success: true, updates });
  }
};
