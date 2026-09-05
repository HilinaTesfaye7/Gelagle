import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../db/database.js';
import { AuditLog, AuditLogWithUser } from '../types/audit.types.js';

export class AuditRepository {
  private get db(): DatabaseSync {
    return getDatabase();
  }

  create(log: AuditLog): AuditLog {
    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (
        id, user_id, action, entity_type, entity_id,
        previous_value, new_value, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      log.id,
      log.user_id,
      log.action,
      log.entity_type,
      log.entity_id,
      log.previous_value,
      log.new_value,
      log.ip_address,
      log.user_agent,
      log.created_at
    );

    return log;
  }

  findAll(limit = 100): AuditLogWithUser[] {
    const stmt = this.db.prepare(`
      SELECT 
        a.*,
        u.name AS userName,
        u.email AS userEmail
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit) as unknown as AuditLogWithUser[];
  }

  findByEntity(entityType: string, entityId: string, limit = 50): AuditLogWithUser[] {
    const stmt = this.db.prepare(`
      SELECT 
        a.*,
        u.name AS userName,
        u.email AS userEmail
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.entity_type = ? AND a.entity_id = ?
      ORDER BY a.created_at DESC
      LIMIT ?
    `);
    return stmt.all(entityType, entityId, limit) as unknown as AuditLogWithUser[];
  }

  findByUser(userId: string, limit = 50): AuditLogWithUser[] {
    const stmt = this.db.prepare(`
      SELECT 
        a.*,
        u.name AS userName,
        u.email AS userEmail
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit) as unknown as AuditLogWithUser[];
  }
}
