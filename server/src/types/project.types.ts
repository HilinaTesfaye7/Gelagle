import { RoleType } from '../rbac/roles.js';
import { DailyUpdate } from './daily-update.types.js';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export const PROJECT_STATUSES: ProjectStatus[] = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

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

export interface ProjectWithDetails extends Project {
  projectManagerName?: string | null;
  productOwnerName?: string | null;
  memberCount?: number;
  currentUserRole?: RoleType | null;
  latestDailyUpdate?: DailyUpdate | null;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: RoleType;
  responsibilities: string | null;
  joined_at: string;
  active: number;
}

export interface ProjectMemberWithUser extends ProjectMember {
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  userAvailability: string;
}
