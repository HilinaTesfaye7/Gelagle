export const Role = {
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  PRODUCT_OWNER: 'PRODUCT_OWNER',
  QA_LEAD: 'QA_LEAD',
  QA_ENGINEER: 'QA_ENGINEER',
  BACKEND_DEVELOPER: 'BACKEND_DEVELOPER',
  FRONTEND_DEVELOPER: 'FRONTEND_DEVELOPER',
  DESIGNER: 'DESIGNER',
  OTHER: 'OTHER'
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export const ALL_ROLES: RoleType[] = Object.values(Role);
