import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service.js';

export class AuditController {
  constructor(private auditService = new AuditService()) {}

  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 100;
      const entityType = req.query.entityType as string | undefined;
      const entityId = req.query.entityId as string | undefined;

      let logs;
      if (entityType && entityId) {
        logs = this.auditService.getEntityLogs(entityType, entityId, limit);
      } else {
        logs = this.auditService.getRecentLogs(limit);
      }

      res.status(200).json({ logs });
    } catch (error) {
      next(error);
    }
  };
}
