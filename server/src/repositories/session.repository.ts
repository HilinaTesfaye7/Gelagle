import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../db/database.js';
import { Session } from '../types/session.types.js';

export class SessionRepository {
  private get db(): DatabaseSync {
    return getDatabase();
  }

  create(session: Session): Session {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(session.id, session.user_id, session.token, session.expires_at, session.created_at);
    return session;
  }

  findByToken(token: string): Session | null {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE token = ?');
    const row = stmt.get(token) as Session | undefined;
    return row || null;
  }

  deleteByToken(token: string): void {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE token = ?');
    stmt.run(token);
  }

  deleteExpired(): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare('DELETE FROM sessions WHERE expires_at < ?');
    stmt.run(now);
  }
}
