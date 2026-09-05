import { Request, Response, NextFunction } from 'express';
import { PermissionType } from '../rbac/permissions.js';
import { RoleType } from '../rbac/roles.js';
import { hasPermission, getRolePermissions } from '../rbac/matrix.js';
import { MemberService } from '../services/member.service.js';
import { ProjectService } from '../services/project.service.js';

declare global {
  namespace Express {
    interface Request {
      projectRole?: RoleType;
      projectId?: string;
    }
  }
}

const memberService = new MemberService();
const projectService = new ProjectService();

/**
 * Middleware ensuring the authenticated user belongs to the project in req.params.projectId.
 * Resolves and attaches the user's projectRole to req.projectRole.
 * Strict project isolation: Non-members are rejected with 403 Forbidden.
 */
export function requireProjectAccess(req: Request, res: Response, next: NextFunction): void {
  const projectId = req.params.projectId || req.body.projectId;
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    return;
  }

  if (!projectId) {
    res.status(400).json({ error: 'Bad Request', message: 'Missing projectId in request' });
    return;
  }

  // Check if project exists
  const project = projectService.getProject(projectId, user.id);
  if (!project) {
    res.status(404).json({ error: 'Not Found', message: 'Project not found' });
    return;
  }

  // Check membership
  const role = memberService.getUserRoleInProject(projectId, user.id);

  if (!role) {
    // Project isolation check: User does not belong to this project!
    res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied. You are not an authorized member of this project.'
    });
    return;
  }

  req.projectId = projectId;
  req.projectRole = role;
  next();
}

/**
 * Middleware ensuring the user's role within the target project has the required permission.
 */
export function requireProjectPermission(permission: PermissionType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // First ensure project access has resolved req.projectRole
    if (!req.projectRole) {
      requireProjectAccess(req, res, () => {
        checkPermission();
      });
    } else {
      checkPermission();
    }

    function checkPermission() {
      const role = req.projectRole;
      if (!role || !hasPermission(role, permission)) {
        res.status(403).json({
          error: 'Forbidden',
          message: `Insufficient permissions. Your role '${role || 'None'}' lacks '${permission}' permission for this project.`,
          requiredPermission: permission,
          currentRole: role
        });
        return;
      }
      next();
    }
  };
}

/**
 * Middleware checking if the user has a permission in any of their assigned project roles
 * or as a global Project Manager / Product Owner.
 */
export function requireAnyRolePermission(permission: PermissionType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const memberships = memberService.getProjectMembers(req.params.projectId || '');
    // If no project context, check if user has PM or PO in any membership
    const userMemberships = memberService['memberRepo'].findMembershipsByUserId(user.id);
    const hasAny = userMemberships.some((m) => hasPermission(m.role, permission));

    if (!hasAny) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Action requires permission '${permission}', which is not granted to your assigned roles.`
      });
      return;
    }

    next();
  };
}
