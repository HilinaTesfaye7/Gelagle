import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../db/database.js';
import { DailyUpdate } from '../types/daily-update.types.js';

export class DailyUpdateRepository {
  private get db(): DatabaseSync {
    return getDatabase();
  }

  create(update: DailyUpdate): DailyUpdate {
    const stmt = this.db.prepare(`
      INSERT INTO daily_updates (
        id, project_id, user_id, user_name, role,
        q1_question, q1_answer, q2_question, q2_answer,
        q3_question, q3_answer, source, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      update.id,
      update.project_id,
      update.user_id,
      update.user_name,
      update.role,
      update.q1_question,
      update.q1_answer,
      update.q2_question,
      update.q2_answer,
      update.q3_question,
      update.q3_answer,
      update.source,
      update.created_at
    );

    return update;
  }

  findByProject(projectId: string, limit = 50): DailyUpdate[] {
    const stmt = this.db.prepare(`
      SELECT * FROM daily_updates
      WHERE project_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(projectId, limit) as unknown as DailyUpdate[];
  }

  findLatestByProject(projectId: string): DailyUpdate | null {
    const stmt = this.db.prepare(`
      SELECT * FROM daily_updates
      WHERE project_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const row = stmt.get(projectId) as DailyUpdate | undefined;
    return row || null;
  }

  findByUser(userId: string, limit = 50): DailyUpdate[] {
    const stmt = this.db.prepare(`
      SELECT * FROM daily_updates
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit) as unknown as DailyUpdate[];
  }

  findRecent(limit = 20): DailyUpdate[] {
    const stmt = this.db.prepare(`
      SELECT * FROM daily_updates
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit) as unknown as DailyUpdate[];
  }
}
