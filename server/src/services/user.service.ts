import { UserRepository, toSafeUser } from '../repositories/user.repository.js';
import { MemberRepository } from '../repositories/member.repository.js';
import { AuditService } from './audit.service.js';
import { ActivityService } from './activity.service.js';
import { SafeUser, ProjectMembershipInfo, AvailabilityStatus } from '../types/user.types.js';
import { hashPassword } from '../utils/crypto.utils.js';

export class UserService {
  constructor(
    private userRepo = new UserRepository(),
    private memberRepo = new MemberRepository(),
    private auditService = new AuditService(),
    private activityService = new ActivityService()
  ) {}

  getUserById(id: string): SafeUser | null {
    const user = this.userRepo.findById(id);
    return user ? toSafeUser(user) : null;
  }

  getAllUsers(): SafeUser[] {
    return this.userRepo.findAll().map(toSafeUser);
  }

  getUserMemberships(userId: string): ProjectMembershipInfo[] {
    return this.memberRepo.findMembershipsByUserId(userId);
  }

  updateProfile(
    userId: string,
    updates: {
      name?: string;
      avatar?: string;
      timezone?: string;
      availability_status?: AvailabilityStatus;
      skills?: string[];
      notification_preferences?: Record<string, any>;
      daily_checkin_enabled?: boolean;
    },
    actorId: string,
    ipAddress?: string,
    userAgent?: string
  ): SafeUser {
    const existing = this.userRepo.findById(userId);
    if (!existing) {
      throw new Error('User not found');
    }

    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.timezone !== undefined) payload.timezone = updates.timezone;
    if (updates.availability_status !== undefined) payload.availability_status = updates.availability_status;
    if (updates.skills !== undefined) payload.skills = JSON.stringify(updates.skills);
    if (updates.notification_preferences !== undefined) {
      payload.notification_preferences = JSON.stringify(updates.notification_preferences);
    }
    if (updates.daily_checkin_enabled !== undefined) {
      payload.daily_checkin_enabled = updates.daily_checkin_enabled ? 1 : 0;
    }

    const updated = this.userRepo.update(userId, payload);
    if (!updated) {
      throw new Error('Failed to update user profile');
    }

    this.auditService.record({
      userId: actorId,
      action: 'USER_UPDATED',
      entityType: 'USER',
      entityId: userId,
      previousValue: toSafeUser(existing),
      newValue: toSafeUser(updated),
      ipAddress,
      userAgent
    });

    this.activityService.record({
      userId: actorId,
      action: 'USER_UPDATED',
      details: { targetUserId: userId, targetUserName: updated.name }
    });

    return toSafeUser(updated);
  }

  changePassword(userId: string, newPassword: string, actorId: string): void {
    const existing = this.userRepo.findById(userId);
    if (!existing) throw new Error('User not found');

    const { hash, salt } = hashPassword(newPassword);
    this.userRepo.update(userId, {
      password_hash: hash,
      password_salt: salt
    });

    this.auditService.record({
      userId: actorId,
      action: 'PASSWORD_CHANGED',
      entityType: 'USER',
      entityId: userId
    });
  }
}
