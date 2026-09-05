import { Router } from 'express';
import { AuthController, loginSchema } from '../controllers/auth.controller.js';
import { UserController, updateProfileSchema } from '../controllers/user.controller.js';
import {
  ProjectController,
  createProjectSchema,
  updateProjectSchema
} from '../controllers/project.controller.js';
import {
  MemberController,
  addMemberSchema,
  updateMemberSchema
} from '../controllers/member.controller.js';
import {
  TeamController,
  createTeamSchema,
  addTeamMemberSchema
} from '../controllers/team.controller.js';
import { ActivityController } from '../controllers/activity.controller.js';
import { AuditController } from '../controllers/audit.controller.js';
import {
  TelegramController,
  simulateBotSchema,
  manualLinkSchema
} from '../controllers/telegram.controller.js';
import { dailyUpdateController } from '../controllers/daily-update.controller.js';

import { authenticate } from '../middleware/auth.middleware.js';
import {
  requireProjectAccess,
  requireProjectPermission,
  requireAnyRolePermission
} from '../middleware/rbac.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { Permission } from '../rbac/permissions.js';

export function createRouter(): Router {
  const router = Router();

  const authController = new AuthController();
  const userController = new UserController();
  const projectController = new ProjectController();
  const memberController = new MemberController();
  const teamController = new TeamController();
  const activityController = new ActivityController();
  const auditController = new AuditController();
  const telegramController = new TelegramController();

  // -------------------------------------------------------------
  // Authentication Routes
  // -------------------------------------------------------------
  router.post('/auth/login', validateBody(loginSchema), authController.login);
  router.post('/auth/logout', authenticate, authController.logout);
  router.get('/auth/me', authenticate, authController.me);

  // -------------------------------------------------------------
  // Users Routes
  // -------------------------------------------------------------
  router.get('/users', authenticate, userController.listUsers);
  router.get('/users/:userId', authenticate, userController.getProfile);
  router.patch('/users/:userId', authenticate, validateBody(updateProfileSchema), userController.updateProfile);
  router.get('/users/:userId/memberships', authenticate, userController.getMemberships);

  // -------------------------------------------------------------
  // Project Routes
  // -------------------------------------------------------------
  router.get('/projects', authenticate, projectController.listUserProjects);
  router.post(
    '/projects',
    authenticate,
    requireAnyRolePermission(Permission.PROJECT_CREATE),
    validateBody(createProjectSchema),
    projectController.createProject
  );
  router.get('/projects/:projectId', authenticate, requireProjectAccess, projectController.getProjectById);
  router.patch(
    '/projects/:projectId',
    authenticate,
    requireProjectPermission(Permission.PROJECT_UPDATE),
    validateBody(updateProjectSchema),
    projectController.updateProject
  );
  router.delete(
    '/projects/:projectId',
    authenticate,
    requireProjectPermission(Permission.PROJECT_DELETE),
    projectController.deleteProject
  );

  // -------------------------------------------------------------
  // Project Members Routes
  // -------------------------------------------------------------
  router.get(
    '/projects/:projectId/members',
    authenticate,
    requireProjectPermission(Permission.MEMBER_VIEW),
    memberController.listMembers
  );
  router.post(
    '/projects/:projectId/members',
    authenticate,
    requireProjectPermission(Permission.MEMBER_INVITE),
    validateBody(addMemberSchema),
    memberController.addMember
  );
  router.patch(
    '/projects/:projectId/members/:userId',
    authenticate,
    requireProjectPermission(Permission.MEMBER_UPDATE),
    validateBody(updateMemberSchema),
    memberController.updateMember
  );
  router.delete(
    '/projects/:projectId/members/:userId',
    authenticate,
    requireProjectPermission(Permission.MEMBER_REMOVE),
    memberController.removeMember
  );

  // -------------------------------------------------------------
  // Project Teams Routes
  // -------------------------------------------------------------
  router.get(
    '/projects/:projectId/teams',
    authenticate,
    requireProjectPermission(Permission.TEAM_VIEW),
    teamController.listTeams
  );
  router.post(
    '/projects/:projectId/teams',
    authenticate,
    requireProjectPermission(Permission.TEAM_CREATE),
    validateBody(createTeamSchema),
    teamController.createTeam
  );
  router.post(
    '/projects/:projectId/teams/:teamId/members',
    authenticate,
    requireProjectPermission(Permission.TEAM_UPDATE),
    validateBody(addTeamMemberSchema),
    teamController.addTeamMember
  );
  router.delete(
    '/projects/:projectId/teams/:teamId/members/:userId',
    authenticate,
    requireProjectPermission(Permission.TEAM_UPDATE),
    teamController.removeTeamMember
  );
  router.delete(
    '/projects/:projectId/teams/:teamId',
    authenticate,
    requireProjectPermission(Permission.TEAM_DELETE),
    teamController.deleteTeam
  );

  // -------------------------------------------------------------
  // Activities Routes
  // -------------------------------------------------------------
  router.get(
    '/projects/:projectId/activities',
    authenticate,
    requireProjectPermission(Permission.ACTIVITY_VIEW),
    activityController.getProjectActivities
  );
  router.get('/activities', authenticate, activityController.getGlobalActivities);
  router.get('/activities/user/:userId', authenticate, activityController.getUserActivities);

  // -------------------------------------------------------------
  // Audit Logs Routes
  // -------------------------------------------------------------
  router.get(
    '/audit',
    authenticate,
    requireAnyRolePermission(Permission.AUDIT_VIEW),
    auditController.getAuditLogs
  );

  // -------------------------------------------------------------
  // Telegram Identity & Bot Simulation Routes
  // -------------------------------------------------------------
  router.get('/telegram/status', authenticate, telegramController.getStatus);
  router.post('/telegram/generate-code', authenticate, telegramController.generateCode);
  router.post('/telegram/unlink', authenticate, telegramController.unlink);
  router.post('/telegram/link', authenticate, validateBody(manualLinkSchema), telegramController.manualLink);
  router.post('/telegram/webhook', validateBody(simulateBotSchema), telegramController.simulateBotWebhook);
  router.post('/telegram/send-daily-update', authenticate, telegramController.sendDailyUpdate);
  router.post('/telegram/dispatch-daily-updates', authenticate, telegramController.dispatchDailyUpdates);
  router.post('/telegram/configure-token', authenticate, telegramController.configureToken);

  // -------------------------------------------------------------
  // Daily Standup Updates Routes
  // -------------------------------------------------------------
  router.get(
    '/projects/:projectId/daily-updates',
    authenticate,
    requireProjectAccess,
    dailyUpdateController.getProjectDailyUpdates
  );
  router.post(
    '/projects/:projectId/daily-updates',
    authenticate,
    requireProjectAccess,
    dailyUpdateController.createProjectDailyUpdate
  );
  router.get(
    '/daily-updates/recent',
    authenticate,
    dailyUpdateController.getRecentDailyUpdates
  );

  return router;
}
