export interface TelegramAccount {
  id: string;
  user_id: string;
  telegram_user_id: string;
  telegram_chat_id: string | null;
  username: string | null;
  verified: number; // 0 or 1
  verification_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface TelegramBotMessage {
  telegramUserId: string;
  chatId: string;
  username?: string;
  text: string;
}

export interface TelegramBotResponse {
  reply: string;
  actionTaken?: string;
  identifiedUser?: {
    id: string;
    name: string;
    username: string;
  };
}
