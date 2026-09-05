import { DailyUpdateRepository } from '../repositories/daily-update.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { ActivityRepository } from '../repositories/activity.repository.js';
import { AuditService } from './audit.service.js';
import { DailyUpdate, CreateDailyUpdateDTO } from '../types/daily-update.types.js';
import { generateId } from '../utils/crypto.utils.js';

export class DailyUpdateService {
  constructor(
    private dailyUpdateRepo = new DailyUpdateRepository(),
    private projectRepo = new ProjectRepository(),
    private activityRepo = new ActivityRepository(),
    private auditService = new AuditService()
  ) {}

  createDailyUpdate(dto: CreateDailyUpdateDTO): DailyUpdate {
    const project = this.projectRepo.findById(dto.projectId);
    if (!project) {
      throw new Error(`Project with ID ${dto.projectId} not found.`);
    }

    const now = new Date().toISOString();
    const update: DailyUpdate = {
      id: generateId(),
      project_id: dto.projectId,
      user_id: dto.userId,
      user_name: dto.userName,
      role: dto.role,
      q1_question: dto.q1Question,
      q1_answer: dto.q1Answer,
      q2_question: dto.q2Question,
      q2_answer: dto.q2Answer,
      q3_question: dto.q3Question,
      q3_answer: dto.q3Answer,
      source: dto.source || 'TELEGRAM',
      created_at: now
    };

    const created = this.dailyUpdateRepo.create(update);

    // Record activity log on project
    this.activityRepo.create({
      id: generateId(),
      project_id: dto.projectId,
      user_id: dto.userId,
      action: 'DAILY_CHECKIN_SUBMITTED',
      details: `${dto.userName} (${dto.role}) submitted daily standup via ${dto.source || 'TELEGRAM'}. Highlights: ${dto.q1Answer.slice(0, 100)}`,
      created_at: now
    });

    // Record audit log
    this.auditService.record({
      userId: dto.userId,
      action: 'DAILY_STANDUP_CREATED',
      entityType: 'DAILY_UPDATE',
      entityId: created.id,
      newValue: {
        projectId: dto.projectId,
        role: dto.role,
        source: dto.source || 'TELEGRAM'
      }
    });

    return created;
  }

  getUpdatesForProject(projectId: string, limit = 50): DailyUpdate[] {
    return this.dailyUpdateRepo.findByProject(projectId, limit);
  }

  getLatestForProject(projectId: string): DailyUpdate | null {
    return this.dailyUpdateRepo.findLatestByProject(projectId);
  }

  getRecentUpdates(limit = 20): DailyUpdate[] {
    return this.dailyUpdateRepo.findRecent(limit);
  }
}
