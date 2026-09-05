import { MemberRepository } from '../repositories/member.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AuditService } from './audit.service.js';
import { ActivityService } from './activity.service.js';
import { ProjectMember, ProjectMemberWithUser } from '../types/project.types.js';
import { RoleType } from '../rbac/roles.js';
import { generateId } from '../utils/crypto.utils.js';

export class MemberService {
  constructor(
    private memberRepo = new MemberRepository(),
    private userRepo = new UserRepository(),
    private auditService = new AuditService(),
    private activityService = new ActivityService()
  ) {}

  getProjectMembers(projectId: string): ProjectMemberWithUser[] {
    return this.memberRepo.findMembersByProjectId(projectId);
  }

  getUserRoleInProject(projectId: string, userId: string): RoleType | null {
    const member = this.memberRepo.findByProjectAndUser(projectId, userId);
    return member ? member.role : null;
  }

  addMember(
    projectId: string,
    params: {
      userId: string;
      role: RoleType;
      responsibilities?: string;
    },
    actorId: string,
    ipAddress?: string,
    userAgent?: string
  ): ProjectMember {
    const targetUser = this.userRepo.findById(params.userId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    const member: ProjectMember = {
      id: generateId(),
      project_id: projectId,
      user_id: params.userId,
      role: params.role,
      responsibilities: params.responsibilities || null,
      joined_at: new Date().toISOString(),
      active: 1
    };

    const saved = this.memberRepo.create(member);

    // Audit log
    this.auditService.record({
      userId: actorId,
      action: 'MEMBER_ADDED',
      entityType: 'PROJECT_MEMBER',
      entityId: saved.id,
      newValue: { projectId, userId: params.userId, role: params.role },
      ipAddress,
      userAgent
    });

    // Activity log
    this.activityService.record({
      projectId,
      userId: actorId,
      action: 'MEMBER_ADDED',
      details: {
        memberUserId: params.userId,
        memberName: targetUser.name,
        role: params.role
      }
    });

    return saved;
  }

  updateMember(
    projectId: string,
    targetUserId: string,
    params: {
      role?: RoleType;
      responsibilities?: string;
    },
    actorId: string,
    ipAddress?: string,
    userAgent?: string
  ): ProjectMember {
    const existing = this.memberRepo.findByProjectAndUser(projectId, targetUserId);
    if (!existing) {
      throw new Error('Project member not found');
    }

    const updated = this.memberRepo.update(existing.id, {
      role: params.role || existing.role,
      responsibilities: params.responsibilities !== undefined ? params.responsibilities : existing.responsibilities
    });

    if (!updated) {
      throw new Error('Failed to update member');
    }

    const targetUser = this.userRepo.findById(targetUserId);

    this.auditService.record({
      userId: actorId,
      action: 'MEMBER_UPDATED',
      entityType: 'PROJECT_MEMBER',
      entityId: existing.id,
      previousValue: existing,
      newValue: updated,
      ipAddress,
      userAgent
    });

    this.activityService.record({
      projectId,
      userId: actorId,
      action: 'MEMBER_UPDATED',
      details: {
        memberUserId: targetUserId,
        memberName: targetUser?.name || 'User',
        newRole: updated.role
      }
    });

    return updated;
  }

  removeMember(
    projectId: string,
    targetUserId: string,
    actorId: string,
    ipAddress?: string,
    userAgent?: string
  ): boolean {
    const existing = this.memberRepo.findByProjectAndUser(projectId, targetUserId);
    if (!existing) return false;

    const targetUser = this.userRepo.findById(targetUserId);
    const success = this.memberRepo.remove(projectId, targetUserId);

    if (success) {
      this.auditService.record({
        userId: actorId,
        action: 'MEMBER_REMOVED',
        entityType: 'PROJECT_MEMBER',
        entityId: existing.id,
        previousValue: existing,
        ipAddress,
        userAgent
      });

      this.activityService.record({
        projectId,
        userId: actorId,
        action: 'MEMBER_REMOVED',
        details: {
          memberUserId: targetUserId,
          memberName: targetUser?.name || 'User'
        }
      });
    }

    return success;
  }
}
