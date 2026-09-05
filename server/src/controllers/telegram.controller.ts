import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TelegramService } from '../services/telegram.service.js';
import { telegramBotInstance } from '../services/telegram-bot.service.js';

export const simulateBotSchema = z.object({
  telegramUserId: z.string().min(1, 'telegramUserId is required'),
  chatId: z.string().min(1, 'chatId is required'),
  username: z.string().optional(),
  text: z.string().min(1, 'text is required')
});

export const manualLinkSchema = z.object({
  code: z.string().min(1, 'Verification code is required'),
  telegramUserId: z.string().min(1, 'Telegram user ID is required'),
  chatId: z.string().optional(),
  username: z.string().optional()
});

export class TelegramController {
  constructor(private telegramService = new TelegramService()) {}

  generateCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const code = this.telegramService.generateLinkCode(userId);
      res.status(200).json({
        message: 'Link code generated',
        code,
        instructions: `Send "/link ${code}" to the Command Center Telegram Bot to verify your account.`
      });
    } catch (error) {
      next(error);
    }
  };

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const account = this.telegramService.getAccountByUserId(userId);
      res.status(200).json({ account });
    } catch (error) {
      next(error);
    }
  };

  unlink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const success = this.telegramService.unlink(userId);
      res.status(200).json({ message: 'Telegram account unlinked', success });
    } catch (error) {
      next(error);
    }
  };

  manualLink = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = this.telegramService.verifyAndLink(req.body);
      if (!result.success) {
        res.status(400).json({ error: 'Link Failed', message: result.message });
        return;
      }
      res.status(200).json({ message: result.message, user: result.user });
    } catch (error: any) {
      res.status(400).json({ error: 'Link Failed', message: error.message });
    }
  };

  simulateBotWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response = this.telegramService.handleBotCommand(req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  sendDailyUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await this.telegramService.sendDailyUpdateToUser(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  dispatchDailyUpdates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.telegramService.dispatchAllDailyUpdates();
      res.status(200).json({
        message: `Dispatched daily updates to ${result.sentCount} out of ${result.totalEligible} eligible users.`,
        ...result
      });
    } catch (error) {
      next(error);
    }
  };

  configureToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;
      if (!token || !token.trim()) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }
      process.env.TELEGRAM_BOT_TOKEN = token.trim();
      telegramBotInstance.stop();
      const connected = await telegramBotInstance.start();
      if (!connected) {
        res.status(400).json({ error: 'Failed to connect. Please verify the Bot Token from @BotFather.' });
        return;
      }
      res.status(200).json({ message: 'Telegram Bot connected successfully! Real-time message listener is active.' });
    } catch (error) {
      next(error);
    }
  };
}
