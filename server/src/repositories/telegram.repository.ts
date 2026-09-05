import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../db/database.js';
import { TelegramAccount } from '../types/telegram.types.js';

export class TelegramRepository {
  private get db(): DatabaseSync {
    return getDatabase();
  }

  findByUserId(userId: string): TelegramAccount | null {
    const stmt = this.db.prepare('SELECT * FROM telegram_accounts WHERE user_id = ?');
    const row = stmt.get(userId) as TelegramAccount | undefined;
    return row || null;
  }

  findByTelegramUserId(telegramUserId: string): TelegramAccount | null {
    const stmt = this.db.prepare('SELECT * FROM telegram_accounts WHERE telegram_user_id = ?');
    const row = stmt.get(telegramUserId) as TelegramAccount | undefined;
    return row || null;
  }

  findByVerificationCode(code: string): TelegramAccount | null {
    const stmt = this.db.prepare('SELECT * FROM telegram_accounts WHERE verification_code = ?');
    const row = stmt.get(code) as TelegramAccount | undefined;
    return row || null;
  }

  createOrUpdate(account: TelegramAccount): TelegramAccount {
    const existing = this.findByUserId(account.user_id);
    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE telegram_accounts SET
          telegram_user_id = ?,
          telegram_chat_id = ?,
          username = ?,
          verified = ?,
          verification_code = ?,
          updated_at = ?
        WHERE id = ?
      `);
      stmt.run(
        account.telegram_user_id,
        account.telegram_chat_id,
        account.username,
        account.verified,
        account.verification_code,
        new Date().toISOString(),
        existing.id
      );
      return { ...existing, ...account, id: existing.id };
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO telegram_accounts (
          id, user_id, telegram_user_id, telegram_chat_id, username,
          verified, verification_code, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        account.id,
        account.user_id,
        account.telegram_user_id,
        account.telegram_chat_id,
        account.username,
        account.verified,
        account.verification_code,
        account.created_at,
        account.updated_at
      );
      return account;
    }
  }

  verify(id: string, telegramUserId: string, chatId?: string, username?: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE telegram_accounts SET
        telegram_user_id = ?,
        telegram_chat_id = ?,
        username = ?,
        verified = 1,
        verification_code = NULL,
        updated_at = ?
      WHERE id = ?
    `);
    const result = stmt.run(telegramUserId, chatId || null, username || null, new Date().toISOString(), id);
    return Number(result.changes) > 0;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM telegram_accounts WHERE id = ?');
    const result = stmt.run(id);
    return Number(result.changes) > 0;
  }
}
