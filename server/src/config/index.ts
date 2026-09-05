import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  dbPath: process.env.DB_PATH || path.resolve(process.cwd(), 'data/command_center.db'),
  sessionSecret: process.env.SESSION_SECRET || 'dev_secret_enterprise_command_center_2026',
  sessionExpiryHours: parseInt(process.env.SESSION_EXPIRY_HOURS || '24', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || 'dummy_token'
};
