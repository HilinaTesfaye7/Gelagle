export const Permission = {
  // Project Permissions
  PROJECT_VIEW: 'PROJECT_VIEW',
  PROJECT_CREATE: 'PROJECT_CREATE',
  PROJECT_UPDATE: 'PROJECT_UPDATE',
  PROJECT_DELETE: 'PROJECT_DELETE',

  // Member Permissions
  MEMBER_VIEW: 'MEMBER_VIEW',
  MEMBER_INVITE: 'MEMBER_INVITE',
  MEMBER_UPDATE: 'MEMBER_UPDATE',
  MEMBER_REMOVE: 'MEMBER_REMOVE',

  // Team Permissions
  TEAM_VIEW: 'TEAM_VIEW',
  TEAM_CREATE: 'TEAM_CREATE',
  TEAM_UPDATE: 'TEAM_UPDATE',
  TEAM_DELETE: 'TEAM_DELETE',

  // Task Permissions
  TASK_VIEW: 'TASK_VIEW',
  TASK_CREATE: 'TASK_CREATE',
  TASK_UPDATE: 'TASK_UPDATE',
  TASK_ASSIGN: 'TASK_ASSIGN',

  // Bug Permissions
  BUG_VIEW: 'BUG_VIEW',
  BUG_CREATE: 'BUG_CREATE',
  BUG_UPDATE: 'BUG_UPDATE',

  // Report Permissions
  REPORT_VIEW: 'REPORT_VIEW',
  REPORT_CREATE: 'REPORT_CREATE',

  // AI Permissions
  AI_USE: 'AI_USE',
  AI_ADMIN: 'AI_ADMIN',

  // System & Audit Permissions
  AUDIT_VIEW: 'AUDIT_VIEW',
  ACTIVITY_VIEW: 'ACTIVITY_VIEW'
} as const;

export type PermissionType = (typeof Permission)[keyof typeof Permission];

export const ALL_PERMISSIONS: PermissionType[] = Object.values(Permission);
