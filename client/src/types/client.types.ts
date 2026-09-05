export type RoleType =
  | 'PROJECT_MANAGER'
  | 'PRODUCT_OWNER'
  | 'QA_LEAD'
  | 'QA_ENGINEER'
  | 'BACKEND_DEVELOPER'
  | 'FRONTEND_DEVELOPER'
  | 'DESIGNER'
  | 'OTHER';

export type AvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string | null;
  timezone: string;
  active: number;
  availability_status: AvailabilityStatus;
  skills: string;
  skillsList: string[];
  notification_preferences: string;
  notificationPreferencesObj: Record<string, any>;
  daily_checkin_enabled: number;
  telegram_user_id: string | null;
  telegram_chat_id: string | null;
  telegram_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMembershipInfo {
  id: string;
  project_id: string;
  projectName: string;
  projectStatus: ProjectStatus;
  role: RoleType;
  responsibilities: string | null;
  joined_at: string;
  active: number;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  target_date: string | null;
  progress: number;
  project_manager_id: string | null;
  product_owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyUpdate {
  id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  role: string;
  q1_question: string;
  q1_answer: string;
  q2_question: string;
  q2_answer: string;
  q3_question: string;
  q3_answer: string;
  source: 'TELEGRAM' | 'WEB';
  created_at: string;
}

export interface ProjectWithDetails extends Project {
  projectManagerName?: string | null;
  productOwnerName?: string | null;
  memberCount?: number;
  currentUserRole?: RoleType | null;
  latestDailyUpdate?: DailyUpdate | null;
}

export interface ProjectMemberWithUser {
  id: string;
  project_id: string;
  user_id: string;
  role: RoleType;
  responsibilities: string | null;
  joined_at: string;
  active: number;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  userAvailability: string;
}

export interface TeamWithMembers {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
  members: Array<{
    userId: string;
    name: string;
    email: string;
    avatar: string | null;
    joinedAt: string;
  }>;
}

export interface ActivityWithUser {
  id: string;
  project_id: string | null;
  user_id: string | null;
  action: string;
  details: string;
  detailsParsed?: Record<string, any>;
  created_at: string;
  userName?: string | null;
  userAvatar?: string | null;
  projectName?: string | null;
}

export interface AuditLogWithUser {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_value: string | null;
  new_value: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  userName?: string | null;
  userEmail?: string | null;
}

export interface TelegramAccount {
  id: string;
  user_id: string;
  telegram_user_id: string;
  telegram_chat_id: string | null;
  username: string | null;
  verified: number;
  verification_code: string | null;
  created_at: string;
  updated_at: string;
}
