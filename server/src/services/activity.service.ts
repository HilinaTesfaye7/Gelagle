import { ActivityRepository } from '../repositories/activity.repository.js';
import { Activity, ActivityWithUser } from '../types/activity.types.js';
import { generateId } from '../utils/crypto.utils.js';

export class ActivityService {
  constructor(private activityRepo = new ActivityRepository()) {}

  record(params: {
    projectId?: string | null;
    userId?: string | null;
    action: string;
    details?: Record<string, any>;
  }): Activity {
    const activity: Activity = {
      id: generateId(),
      project_id: params.projectId || null,
      user_id: params.userId || null,
      action: params.action,
      details: params.details ? JSON.stringify(params.details) : '{}',
      created_at: new Date().toISOString()
    };

    return this.activityRepo.create(activity);
  }

  getProjectActivities(projectId: string, limit = 50): ActivityWithUser[] {
    return this.activityRepo.findByProjectId(projectId, limit);
  }

  getUserActivities(userId: string, limit = 50): ActivityWithUser[] {
    return this.activityRepo.findByUserId(userId, limit);
  }

  getGlobalActivities(limit = 100): ActivityWithUser[] {
    return this.activityRepo.findAll(limit);
  }
}
