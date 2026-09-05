import { ProjectRepository } from '../repositories/project.repository.js';
import { MemberRepository } from '../repositories/member.repository.js';
import { AuditService } from './audit.service.js';
import { ActivityService } from './activity.service.js';
import { Project, ProjectWithDetails, ProjectStatus } from '../types/project.types.js';
import { Role } from '../rbac/roles.js';
import { generateId } from '../utils/crypto.utils.js';

export class ProjectService {
  constructor(
    private projectRepo = new ProjectRepository(),
    private memberRepo = new MemberRepository(),
    private auditService = new AuditService(),
    private activityService = new ActivityService()
  ) {}

  createProject(
    params: {
      name: string;
      description?: string;
      status?: ProjectStatus;
      start_date?: string;
      target_date?: string;
      project_manager_id?: string;
      product_owner_id?: string;
    },
    creatorId: string,
    ipAddress?: string,
    userAgent?: string
  ): Project {
    const now = new Date().toISOString();
    const projectId = generateId();

    const project: Project = {
      id: projectId,
      name: params.name.trim(),
      description: params.description?.trim() || null,
      status: params.status || 'PLANNING',
      start_date: params.start_date || null,
      target_date: params.target_date || null,
      progress: 0,
      project_manager_id: params.project_manager_id || creatorId,
      product_owner_id: params.product_owner_id || null,
      created_at: now,
      updated_at: now
    };

    const created = this.projectRepo.create(project);

    // Automatically add creator as PROJECT_MANAGER in project_members
    this.memberRepo.create({
      id: generateId(),
      project_id: projectId,
      user_id: creatorId,
      role: Role.PROJECT_MANAGER,
      responsibilities: 'Project Lead & Delivery Command',
      joined_at: now,
      active: 1
    });

    // If a different product owner was designated, add them as PRODUCT_OWNER
    if (params.product_owner_id && params.product_owner_id !== creatorId) {
      this.memberRepo.create({
        id: generateId(),
        project_id: projectId,
        user_id: params.product_owner_id,
        role: Role.PRODUCT_OWNER,
        responsibilities: 'Product Strategy & Requirements',
        joined_at: now,
        active: 1
      });
    }

    // Audit log
    this.auditService.record({
      userId: creatorId,
      action: 'PROJECT_CREATED',
      entityType: 'PROJECT',
      entityId: projectId,
      newValue: created,
      ipAddress,
      userAgent
    });

    // Activity log
    this.activityService.record({
      projectId,
      userId: creatorId,
      action: 'PROJECT_CREATED',
      details: { projectName: created.name, status: created.status }
    });

    return created;
  }

  updateProject(
    projectId: string,
    updates: Partial<Project>,
    actorId: string,
    ipAddress?: string,
    userAgent?: string
  ): Project {
    const existing = this.projectRepo.findById(projectId);
    if (!existing) {
      throw new Error('Project not found');
    }

    const updated = this.projectRepo.update(projectId, updates);
    if (!updated) {
      throw new Error('Failed to update project');
    }

    this.auditService.record({
      userId: actorId,
      action: 'PROJECT_UPDATED',
      entityType: 'PROJECT',
      entityId: projectId,
      previousValue: existing,
      newValue: updated,
      ipAddress,
      userAgent
    });

    this.activityService.record({
      projectId,
      userId: actorId,
      action: 'PROJECT_UPDATED',
      details: {
        projectName: updated.name,
        changes: Object.keys(updates)
      }
    });

    return updated;
  }

  getProject(projectId: string, currentUserId: string): ProjectWithDetails | null {
    return this.projectRepo.findByIdWithDetails(projectId, currentUserId);
  }

  listUserProjects(userId: string): ProjectWithDetails[] {
    return this.projectRepo.findProjectsForUser(userId);
  }

  listAllProjects(): Project[] {
    return this.projectRepo.findAll();
  }

  deleteProject(projectId: string, actorId: string, ipAddress?: string, userAgent?: string): boolean {
    const existing = this.projectRepo.findById(projectId);
    if (!existing) return false;

    const success = this.projectRepo.delete(projectId);
    if (success) {
      this.auditService.record({
        userId: actorId,
        action: 'PROJECT_DELETED',
        entityType: 'PROJECT',
        entityId: projectId,
        previousValue: existing,
        ipAddress,
        userAgent
      });
    }
    return success;
  }
}
