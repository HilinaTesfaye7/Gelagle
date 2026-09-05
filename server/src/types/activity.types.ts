export const ActivityAction = {
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  MEMBER_ADDED: 'MEMBER_ADDED',
  MEMBER_UPDATED: 'MEMBER_UPDATED',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  TEAM_CREATED: 'TEAM_CREATED',
  USER_UPDATED: 'USER_UPDATED'
} as const;

export type ActivityActionType = (typeof ActivityAction)[keyof typeof ActivityAction];

export interface Activity {
  id: string;
  project_id: string | null;
  user_id: string | null;
  action: ActivityActionType | string;
  details: string; // JSON
  created_at: string;
}

export interface ActivityWithUser extends Activity {
  userName?: string | null;
  userAvatar?: string | null;
  projectName?: string | null;
  detailsParsed?: Record<string, any>;
}
