import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../db/database.js';
import { User, SafeUser } from '../types/user.types.js';

export function toSafeUser(user: User): SafeUser {
  const { password_hash, password_salt, ...rest } = user;
  let skillsList: string[] = [];
  try {
    skillsList = JSON.parse(user.skills || '[]');
  } catch {
    skillsList = [];
  }

  let notificationPreferencesObj: Record<string, any> = {};
  try {
    notificationPreferencesObj = JSON.parse(user.notification_preferences || '{}');
  } catch {
    notificationPreferencesObj = {};
  }

  return {
    ...rest,
    skillsList,
    notificationPreferencesObj
  };
}

export class UserRepository {
  private get db(): DatabaseSync {
    return getDatabase();
  }

  findById(id: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id) as User | undefined;
    return row || null;
  }

  findByEmail(email: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)');
    const row = stmt.get(email.trim()) as User | undefined;
    return row || null;
  }

  findByUsername(username: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)');
    const row = stmt.get(username.trim()) as User | undefined;
    return row || null;
  }

  findByTelegramUserId(telegramUserId: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE telegram_user_id = ?');
    const row = stmt.get(telegramUserId) as User | undefined;
    return row || null;
  }

  findAll(): User[] {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY name ASC');
    return stmt.all() as unknown as User[];
  }

  create(user: User): User {
    const stmt = this.db.prepare(`
      INSERT INTO users (
        id, name, email, username, password_hash, password_salt,
        avatar, timezone, active, availability_status, skills,
        notification_preferences, daily_checkin_enabled,
        telegram_user_id, telegram_chat_id, telegram_username,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?
      )
    `);

    stmt.run(
      user.id,
      user.name,
      user.email,
      user.username,
      user.password_hash,
      user.password_salt,
      user.avatar,
      user.timezone,
      user.active,
      user.availability_status,
      user.skills,
      user.notification_preferences,
      user.daily_checkin_enabled,
      user.telegram_user_id,
      user.telegram_chat_id,
      user.telegram_username,
      user.created_at,
      user.updated_at
    );

    return user;
  }

  update(id: string, updates: Partial<User>): User | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const merged = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const stmt = this.db.prepare(`
      UPDATE users SET
        name = ?,
        avatar = ?,
        timezone = ?,
        active = ?,
        availability_status = ?,
        skills = ?,
        notification_preferences = ?,
        daily_checkin_enabled = ?,
        telegram_user_id = ?,
        telegram_chat_id = ?,
        telegram_username = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      merged.name,
      merged.avatar,
      merged.timezone,
      merged.active,
      merged.availability_status,
      merged.skills,
      merged.notification_preferences,
      merged.daily_checkin_enabled,
      merged.telegram_user_id,
      merged.telegram_chat_id,
      merged.telegram_username,
      merged.updated_at,
      id
    );

    return merged;
  }
}
