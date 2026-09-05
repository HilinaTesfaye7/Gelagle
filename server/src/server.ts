import { createApp } from './app.js';
import { config } from './config/index.js';
import { runMigrations } from './db/migrate.js';
import { telegramBotInstance } from './services/telegram-bot.service.js';

// Run migrations on startup
runMigrations();

const app = createApp();

app.listen(config.port, () => {
  console.log(`🚀 Delivery Command Center API running at http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);

  // Start real Telegram bot if token is configured
  telegramBotInstance.start().catch((err) => {
    console.error('Failed to start Telegram bot:', err);
  });
});
