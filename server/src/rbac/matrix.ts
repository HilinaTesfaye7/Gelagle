import { Role, RoleType } from './roles.js';
import { Permission, PermissionType } from './permissions.js';

export const ROLE_PERMISSIONS: Record<RoleType, PermissionType[]> = {
  [Role.PROJECT_MANAGER]: [
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.MEMBER_VIEW,
    Permission.MEMBER_INVITE,
    Permission.MEMBER_UPDATE,
    Permission.MEMBER_REMOVE,
    Permission.TEAM_VIEW,
    Permission.TEAM_CREATE,
    Permission.TEAM_UPDATE,
    Permission.TEAM_DELETE,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.TASK_ASSIGN,
    Permission.BUG_VIEW,
    Permission.BUG_CREATE,
    Permission.BUG_UPDATE,
    Permission.REPORT_VIEW,
    Permission.REPORT_CREATE,
    Permission.AI_USE,
    Permission.AI_ADMIN,
    Permission.AUDIT_VIEW,
    Permission.ACTIVITY_VIEW
  ],
  [Role.PRODUCT_OWNER]: [
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.MEMBER_VIEW,
    Permission.TEAM_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_CREATE,
    Permission.TASK_UPDATE,
    Permission.BUG_VIEW,
    Permission.BUG_CREATE,
    Permission.REPORT_VIEW,
    Permission.REPORT_CREATE,
    Permission.AI_USE,
    Permission.AUDIT_VIEW,
    Permission.ACTIVITY_VIEW
  ],
  [Role.QA_LEAD]: [
    Permission.PROJECT_VIEW,
    Permission.MEMBER_VIEW,
    Permission.TEAM_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.BUG_VIEW,
    Permission.BUG_CREATE,
    Permission.BUG_UPDATE,
    Permission.REPORT_VIEW,
    Permission.REPORT_CREATE,
    Permission.AI_USE,
    Permission.ACTIVITY_VIEW
  ],
  [Role.QA_ENGINEER]: [
    Permission.PROJECT_VIEW,
    Permission.MEMBER_VIEW,
    Permission.TEAM_VIEW,
    Permission.TASK_VIEW,
    Permission.BUG_VIEW,
    Permission.BUG_CREATE,
    Permission.BUG_UPDATE,
    Permission.REPORT_VIEW,
    Permission.AI_USE,
    Permission.ACTIVITY_VIEW
  ],
  [Role.BACKEND_DEVELOPER]: [
    Permission.PROJECT_VIEW,
    Permission.MEMBER_VIEW,
    Permission.TEAM_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.BUG_VIEW,
    Permission.BUG_CREATE,
    Permission.BUG_UPDATE,
    Permission.REPORT_VIEW,
    Permission.AI_USE,
    Permission.ACTIVITY_VIEW
  ],
  [Role.FRONTEND_DEVELOPER]: [
    Permission.PROJECT_VIEW,
    Permission.MEMBER_VIEW,
    Permission.TEAM_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.BUG_VIEW,
    Permission.BUG_CREATE,
    Permission.BUG_UPDATE,
    Permission.REPORT_VIEW,
    Permission.AI_USE,
    Permission.ACTIVITY_VIEW
  ],
  [Role.DESIGNER]: [
    Permission.PROJECT_VIEW,
    Permission.MEMBER_VIEW,
    Permission.TEAM_VIEW,
    Permission.TASK_VIEW,
    Permission.TASK_UPDATE,
    Permission.BUG_VIEW,
    Permission.BUG_CREATE,
    Permission.AI_USE,
    Permission.ACTIVITY_VIEW
  ],
  [Role.OTHER]: [
    Permission.PROJECT_VIEW,
    Permission.MEMBER_VIEW,
    Permission.TEAM_VIEW,
    Permission.TASK_VIEW,
    Permission.BUG_VIEW,
    Permission.AI_USE,
    Permission.ACTIVITY_VIEW
  ]
};

export function hasPermission(role: RoleType, permission: PermissionType): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function getRolePermissions(role: RoleType): PermissionType[] {
  return ROLE_PERMISSIONS[role] || [];
}
