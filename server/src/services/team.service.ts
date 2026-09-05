import { TeamRepository } from '../repositories/team.repository.js';
import { MemberRepository } from '../repositories/member.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AuditService } from './audit.service.js';
import { ActivityService } from './activity.service.js';
import { Team, TeamWithMembers } from '../types/team.types.js';
import { generateId } from '../utils/crypto.utils.js';

export class TeamService {
  constructor(
    private teamRepo = new TeamRepository(),
    private memberRepo = new MemberRepository(),
    private userRepo = new UserRepository(),
    private auditService = new AuditService(),
    private activityService = new ActivityService()
  ) {}

  getTeamsByProject(projectId: string): TeamWithMembers[] {
    return this.teamRepo.findByProjectId(projectId);
  }

  createTeam(
    projectId: string,
    params: { name: string; description?: string },
    actorId: string,
    ipAddress?: string,
    userAgent?: string
  ): Team {
    const team: Team = {
      id: generateId(),
      project_id: projectId,
      name: params.name.trim(),
      description: params.description?.trim() || null,
      created_at: new Date().toISOString()
    };

    const created = this.teamRepo.create(team);

    this.auditService.record({
      userId: actorId,
      action: 'TEAM_CREATED',
      entityType: 'TEAM',
      entityId: created.id,
      newValue: created,
      ipAddress,
      userAgent
    });

    this.activityService.record({
      projectId,
      userId: actorId,
      action: 'TEAM_CREATED',
      details: { teamName: created.name }
    });

    return created;
  }

  addMemberToTeam(
    teamId: string,
    targetUserId: string,
    actorId: string,
    ipAddress?: string,
    userAgent?: string
  ): boolean {
    const team = this.teamRepo.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Verify user is a member of the project first
    const projectMember = this.memberRepo.findByProjectAndUser(team.project_id, targetUserId);
    if (!projectMember) {
      throw new Error('User must be a member of the project before joining a team');
    }

    const success = this.teamRepo.addMember(teamId, targetUserId);
    if (success) {
      const targetUser = this.userRepo.findById(targetUserId);

      this.auditService.record({
        userId: actorId,
        action: 'TEAM_MEMBER_ADDED',
        entityType: 'TEAM',
        entityId: teamId,
        newValue: { targetUserId },
        ipAddress,
        userAgent
      });

      this.activityService.record({
        projectId: team.project_id,
        userId: actorId,
        action: 'TEAM_MEMBER_ADDED',
        details: { teamName: team.name, memberName: targetUser?.name || 'User' }
      });
    }

    return success;
  }

  removeMemberFromTeam(
    teamId: string,
    targetUserId: string,
    actorId: string,
    ipAddress?: string,
    userAgent?: string
  ): boolean {
    const team = this.teamRepo.findById(teamId);
    if (!team) throw new Error('Team not found');

    const success = this.teamRepo.removeMember(teamId, targetUserId);
    if (success) {
      this.auditService.record({
        userId: actorId,
        action: 'TEAM_MEMBER_REMOVED',
        entityType: 'TEAM',
        entityId: teamId,
        previousValue: { targetUserId },
        ipAddress,
        userAgent
      });
    }
    return success;
  }

  deleteTeam(teamId: string, actorId: string, ipAddress?: string, userAgent?: string): boolean {
    const team = this.teamRepo.findById(teamId);
    if (!team) return false;

    const success = this.teamRepo.delete(teamId);
    if (success) {
      this.auditService.record({
        userId: actorId,
        action: 'TEAM_DELETED',
        entityType: 'TEAM',
        entityId: teamId,
        previousValue: team,
        ipAddress,
        userAgent
      });
    }
    return success;
  }
}
