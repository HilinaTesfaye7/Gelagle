import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../db/database.js';
import { Activity, ActivityWithUser } from '../types/activity.types.js';

export class ActivityRepository {
  private get db(): DatabaseSync {
    return getDatabase();
  }

  create(activity: Activity): Activity {
    const stmt = this.db.prepare(`
      INSERT INTO activities (id, project_id, user_id, action, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      activity.id,
      activity.project_id,
      activity.user_id,
      activity.action,
      activity.details,
      activity.created_at
    );

    return activity;
  }

  findByProjectId(projectId: string, limit = 50): ActivityWithUser[] {
    const stmt = this.db.prepare(`
      SELECT 
        act.*,
        u.name AS userName,
        u.avatar AS userAvatar,
        p.name AS projectName
      FROM activities act
      LEFT JOIN users u ON act.user_id = u.id
      LEFT JOIN projects p ON act.project_id = p.id
      WHERE act.project_id = ?
      ORDER BY act.created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(projectId, limit) as unknown as ActivityWithUser[];
    return rows.map((r) => {
      let detailsParsed = {};
      try {
        detailsParsed = JSON.parse(r.details || '{}');
      } catch {
        detailsParsed = {};
      }
      return { ...r, detailsParsed };
    });
  }

  findByUserId(userId: string, limit = 50): ActivityWithUser[] {
    const stmt = this.db.prepare(`
      SELECT 
        act.*,
        u.name AS userName,
        u.avatar AS userAvatar,
        p.name AS projectName
      FROM activities act
      LEFT JOIN users u ON act.user_id = u.id
      LEFT JOIN projects p ON act.project_id = p.id
      WHERE act.user_id = ?
      ORDER BY act.created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(userId, limit) as unknown as ActivityWithUser[];
    return rows.map((r) => {
      let detailsParsed = {};
      try {
        detailsParsed = JSON.parse(r.details || '{}');
      } catch {
        detailsParsed = {};
      }
      return { ...r, detailsParsed };
    });
  }

  findAll(limit = 100): ActivityWithUser[] {
    const stmt = this.db.prepare(`
      SELECT 
        act.*,
        u.name AS userName,
        u.avatar AS userAvatar,
        p.name AS projectName
      FROM activities act
      LEFT JOIN users u ON act.user_id = u.id
      LEFT JOIN projects p ON act.project_id = p.id
      ORDER BY act.created_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(limit) as unknown as ActivityWithUser[];
    return rows.map((r) => {
      let detailsParsed = {};
      try {
        detailsParsed = JSON.parse(r.details || '{}');
      } catch {
        detailsParsed = {};
      }
      return { ...r, detailsParsed };
    });
  }
}
