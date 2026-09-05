import { RoleType } from '../rbac/roles.js';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password_hash: string;
  password_salt: string;
  avatar: string | null;
  timezone: string;
  active: number; // 0 or 1
  availability_status: AvailabilityStatus;
  skills: string; // JSON array of string
  notification_preferences: string; // JSON object
  daily_checkin_enabled: number; // 0 or 1
  telegram_user_id: string | null;
  telegram_chat_id: string | null;
  telegram_username: string | null;
  created_at: string;
  updated_at: string;
}

export type SafeUser = Omit<User, 'password_hash' | 'password_salt'> & {
  skillsList: string[];
  notificationPreferencesObj: Record<string, any>;
};

export interface ProjectMembershipInfo {
  id: string;
  project_id: string;
  projectName: string;
  projectStatus: string;
  role: RoleType;
  responsibilities: string | null;
  joined_at: string;
  active: number;
}
