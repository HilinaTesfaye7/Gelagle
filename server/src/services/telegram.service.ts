import crypto from 'node:crypto';
import { TelegramRepository } from '../repositories/telegram.repository.js';
import { UserRepository, toSafeUser } from '../repositories/user.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { AuditService } from './audit.service.js';
import { TelegramAccount, TelegramBotMessage, TelegramBotResponse } from '../types/telegram.types.js';
import { generateId } from '../utils/crypto.utils.js';
import { config } from '../config/index.js';

export class TelegramService {
  constructor(
    private telegramRepo = new TelegramRepository(),
    private userRepo = new UserRepository(),
    private projectRepo = new ProjectRepository(),
    private auditService = new AuditService()
  ) {}

  getAccountByUserId(userId: string): TelegramAccount | null {
    return this.telegramRepo.findByUserId(userId);
  }

  generateLinkCode(userId: string): string {
    const code = 'TG-' + crypto.randomInt(100000, 999999).toString();
    const now = new Date().toISOString();

    const existing = this.telegramRepo.findByUserId(userId);
    if (existing) {
      this.telegramRepo.createOrUpdate({
        ...existing,
        verification_code: code,
        verified: existing.verified,
        updated_at: now
      });
    } else {
      this.telegramRepo.createOrUpdate({
        id: generateId(),
        user_id: userId,
        telegram_user_id: `pending_${userId}`,
        telegram_chat_id: null,
        username: null,
        verified: 0,
        verification_code: code,
        created_at: now,
        updated_at: now
      });
    }

    return code;
  }

  verifyAndLink(params: {
    code: string;
    telegramUserId: string;
    chatId?: string;
    username?: string;
  }): { success: boolean; message: string; user?: any } {
    const account = this.telegramRepo.findByVerificationCode(params.code.trim().toUpperCase());
    if (!account) {
      return { success: false, message: 'Invalid or expired verification code.' };
    }

    // Check if telegramUserId is already claimed by another user
    const existingTg = this.telegramRepo.findByTelegramUserId(params.telegramUserId);
    if (existingTg && existingTg.id !== account.id && existingTg.verified) {
      return { success: false, message: 'This Telegram account is already linked to another user.' };
    }

    this.telegramRepo.verify(account.id, params.telegramUserId, params.chatId, params.username);

    // Sync to user record
    const user = this.userRepo.findById(account.user_id);
    if (user) {
      this.userRepo.update(user.id, {
        telegram_user_id: params.telegramUserId,
        telegram_chat_id: params.chatId || null,
        telegram_username: params.username || null
      });

      this.auditService.record({
        userId: user.id,
        action: 'TELEGRAM_LINKED',
        entityType: 'TELEGRAM_ACCOUNT',
        entityId: account.id,
        newValue: { telegramUserId: params.telegramUserId, username: params.username }
      });

      return {
        success: true,
        message: `Successfully linked Telegram account @${params.username || params.telegramUserId} to ${user.name}.`,
        user: toSafeUser(user)
      };
    }

    return { success: false, message: 'User not found.' };
  }

  unlink(userId: string): boolean {
    const account = this.telegramRepo.findByUserId(userId);
    if (!account) return false;

    this.telegramRepo.delete(account.id);
    this.userRepo.update(userId, {
      telegram_user_id: null,
      telegram_chat_id: null,
      telegram_username: null
    });

    this.auditService.record({
      userId,
      action: 'TELEGRAM_UNLINKED',
      entityType: 'TELEGRAM_ACCOUNT',
      entityId: account.id
    });

    return true;
  }

  handleBotCommand(message: TelegramBotMessage): TelegramBotResponse {
    const text = (message.text || '').trim();
    const parts = text.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts[1];

    // Find linked account
    const account = this.telegramRepo.findByTelegramUserId(message.telegramUserId);
    const isLinked = account && account.verified;
    const user = isLinked ? this.userRepo.findById(account.user_id) : null;

    if (command === '/start') {
      if (user) {
        return {
          reply: `👋 Welcome back, ${user.name}!\n\nYour Telegram identity is linked to **${user.email}**.\n\nCommands:\n• /profile - View your profile & status\n• /projects - View your assigned projects\n• /help - Help guide`,
          identifiedUser: { id: user.id, name: user.name, username: user.username }
        };
      }
      return {
        reply: `👋 Welcome to the AI-Powered Delivery Command Center Bot!\n\nTo link your Telegram account:\n1. Open your Web Command Center > Settings\n2. Click "Generate Telegram Link Code"\n3. Send here: \`/link <code>\` (e.g. \`/link TG-123456\`)`
      };
    }

    if (command === '/link') {
      if (!arg) {
        return { reply: '❌ Please provide a verification code. Usage: `/link TG-XXXXXX`' };
      }
      const linkResult = this.verifyAndLink({
        code: arg,
        telegramUserId: message.telegramUserId,
        chatId: message.chatId,
        username: message.username
      });
      return {
        reply: linkResult.success ? `✅ ${linkResult.message}` : `❌ ${linkResult.message}`,
        actionTaken: linkResult.success ? 'LINK_SUCCESS' : 'LINK_FAILED',
        identifiedUser: linkResult.user ? { id: linkResult.user.id, name: linkResult.user.name, username: linkResult.user.username } : undefined
      };
    }

    if (command === '/profile') {
      if (!user) {
        return { reply: '🔒 Unrecognized account. Please link your account first using `/link <code>`.' };
      }
      return {
        reply: `👤 **Command Center Profile**\n\nName: ${user.name}\nEmail: ${user.email}\nUsername: @${user.username}\nStatus: ${user.availability_status}\nDaily Check-in: ${user.daily_checkin_enabled ? 'Enabled' : 'Disabled'}`,
        identifiedUser: { id: user.id, name: user.name, username: user.username }
      };
    }

    if (command === '/projects') {
      if (!user) {
        return { reply: '🔒 Unrecognized account. Please link your account first using `/link <code>`.' };
      }
      const projects = this.projectRepo.findProjectsForUser(user.id);
      if (projects.length === 0) {
        return {
          reply: `📂 You are not currently assigned to any active projects.`,
          identifiedUser: { id: user.id, name: user.name, username: user.username }
        };
      }
      const projectList = projects
        .map((p) => `• **${p.name}** (${p.status}) - Role: *${p.currentUserRole}* [Progress: ${p.progress}%]`)
        .join('\n');
      return {
        reply: `📂 **Your Assigned Projects (${projects.length})**:\n\n${projectList}`,
        identifiedUser: { id: user.id, name: user.name, username: user.username }
      };
    }

    if (command === '/help') {
      return {
        reply: `ℹ️ **Command Center Telegram Bot Commands**:\n\n• /start - Welcome & Account Status\n• /link <CODE> - Link your Telegram ID using code from Settings\n• /daily - Receive your personalized daily delivery brief\n• /projects - List your assigned projects and roles\n• /profile - View your profile details & status\n• /help - Show this guide`
      };
    }

    if (command === '/daily' || command === '/update') {
      if (!user) {
        return { reply: '🔒 Unrecognized account. Please link your account first using `/link <code>`.' };
      }
      const updateMessage = this.formatDailyUpdate(user);
      return {
        reply: updateMessage,
        actionTaken: 'DAILY_UPDATE_SENT',
        identifiedUser: { id: user.id, name: user.name, username: user.username }
      };
    }

    return {
      reply: `❓ Unknown command "${command}". Type /help for available commands.`
    };
  }

  formatDailyUpdate(user: any): string {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const projects = this.projectRepo.findProjectsForUser(user.id);

    let projectSummary = 'You have no assigned active projects.';
    if (projects.length > 0) {
      projectSummary = projects
        .map(
          (p) =>
            `• **${p.name}**\n  Status: \`${p.status}\` | Velocity: \`${p.progress}%\`\n  Your Role: *${p.currentUserRole || 'Member'}*\n  Target Date: ${p.target_date || 'TBD'}`
        )
        .join('\n\n');
    }

    return (
      `🌅 **Daily Delivery Command Center Brief**\n` +
      `📅 ${today}\n\n` +
      `👤 **Hello, ${user.name}**\n` +
      `⚡ Status: \`${user.availability_status}\`\n\n` +
      `📂 **Your Assigned Project Scopes (${projects.length})**:\n\n` +
      `${projectSummary}\n\n` +
      `💡 Type /projects for quick details or visit the web command center.`
    );
  }

  async sendTelegramMessage(chatId: string, text: string, replyMarkup?: any): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN || config.telegramBotToken;
    if (!token || token.includes('dummy')) {
      console.log(`[TELEGRAM] Mock Dispatch to Chat ID ${chatId}:\n${text}`);
      return true;
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const body: any = {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      };
      if (replyMarkup) {
        body.reply_markup = replyMarkup;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return res.ok;
    } catch (err) {
      console.error('[TELEGRAM] Failed to send telegram message:', err);
      return false;
    }
  }

  async editTelegramMessage(chatId: string, messageId: number, text: string, replyMarkup?: any): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN || config.telegramBotToken;
    if (!token || token.includes('dummy')) return true;

    try {
      const url = `https://api.telegram.org/bot${token}/editMessageText`;
      const body: any = {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'Markdown'
      };
      if (replyMarkup) {
        body.reply_markup = replyMarkup;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return res.ok;
    } catch (err) {
      console.error('[TELEGRAM] Failed to edit telegram message:', err);
      return false;
    }
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string, showAlert = false): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN || config.telegramBotToken;
    if (!token || token.includes('dummy')) return true;

    try {
      const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: showAlert
        })
      });
      return true;
    } catch {
      return false;
    }
  }


  async sendDailyUpdateToUser(userId: string): Promise<{ success: boolean; message: string; preview: string }> {
    const user = this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');

    const account = this.telegramRepo.findByUserId(userId);
    const text = this.formatDailyUpdate(user);

    if (!account || !account.verified || !account.telegram_chat_id) {
      return {
        success: false,
        message: 'User does not have a linked Telegram chat.',
        preview: text
      };
    }

    const sent = await this.sendTelegramMessage(account.telegram_chat_id, text);
    return {
      success: sent,
      message: sent ? 'Daily update successfully sent to Telegram.' : 'Failed to deliver message via Telegram API.',
      preview: text
    };
  }

  async dispatchAllDailyUpdates(): Promise<{ sentCount: number; totalEligible: number }> {
    const users = this.userRepo.findAll();
    let sentCount = 0;
    let totalEligible = 0;

    for (const u of users) {
      if (u.active && u.daily_checkin_enabled) {
        const account = this.telegramRepo.findByUserId(u.id);
        if (account && account.verified && account.telegram_chat_id) {
          totalEligible++;
          const text = this.formatDailyUpdate(u);
          const ok = await this.sendTelegramMessage(account.telegram_chat_id, text);
          if (ok) sentCount++;
        }
      }
    }

    return { sentCount, totalEligible };
  }
}

