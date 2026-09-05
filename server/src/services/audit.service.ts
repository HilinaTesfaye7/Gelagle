import { AuditRepository } from '../repositories/audit.repository.js';
import { AuditLog, AuditLogWithUser } from '../types/audit.types.js';
import { generateId } from '../utils/crypto.utils.js';

export class AuditService {
  constructor(private auditRepo = new AuditRepository()) {}

  record(params: {
    userId?: string | null;
    action: string;
    entityType: string;
    entityId: string;
    previousValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }): AuditLog {
    const log: AuditLog = {
      id: generateId(),
      user_id: params.userId || null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      previous_value: params.previousValue ? JSON.stringify(params.previousValue) : null,
      new_value: params.newValue ? JSON.stringify(params.newValue) : null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      created_at: new Date().toISOString()
    };

    return this.auditRepo.create(log);
  }

  getRecentLogs(limit = 100): AuditLogWithUser[] {
    return this.auditRepo.findAll(limit);
  }

  getEntityLogs(entityType: string, entityId: string, limit = 50): AuditLogWithUser[] {
    return this.auditRepo.findByEntity(entityType, entityId, limit);
  }

  getUserLogs(userId: string, limit = 50): AuditLogWithUser[] {
    return this.auditRepo.findByUser(userId, limit);
  }
}
