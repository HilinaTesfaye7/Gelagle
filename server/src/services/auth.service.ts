import { UserRepository, toSafeUser } from '../repositories/user.repository.js';
import { SessionRepository } from '../repositories/session.repository.js';
import { AuditService } from './audit.service.js';
import { SafeUser } from '../types/user.types.js';
import { verifyPassword, generateToken, generateId, signSessionToken, verifySessionToken } from '../utils/crypto.utils.js';
import { config } from '../config/index.js';

const revokedTokens = new Set<string>();

export class AuthService {
  constructor(
    private userRepo = new UserRepository(),
    private sessionRepo = new SessionRepository(),
    private auditService = new AuditService()
  ) {}

  login(params: {
    identifier: string; // email or username
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }): { user: SafeUser; token: string; expiresAt: string } {
    const { identifier, password, ipAddress, userAgent } = params;

    const user = identifier.includes('@')
      ? this.userRepo.findByEmail(identifier)
      : this.userRepo.findByUsername(identifier);

    if (!user) {
      throw new Error('Invalid email/username or password');
    }

    if (!user.active) {
      throw new Error('Account is deactivated. Please contact an administrator.');
    }

    const isValid = verifyPassword(password, user.password_hash, user.password_salt);
    if (!isValid) {
      throw new Error('Invalid email/username or password');
    }

    // Clean up expired sessions
    try {
      this.sessionRepo.deleteExpired();
    } catch {}

    // Create new signed session token (works seamlessly across all serverless workers)
    const token = signSessionToken(user.id, config.sessionSecret, config.sessionExpiryHours);
    const expiresAt = new Date(Date.now() + config.sessionExpiryHours * 60 * 60 * 1000).toISOString();

    try {
      this.sessionRepo.create({
        id: generateId(),
        user_id: user.id,
        token,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      });
    } catch {}

    // Audit log
    this.auditService.record({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      ipAddress,
      userAgent
    });

    return {
      user: toSafeUser(user),
      token,
      expiresAt
    };
  }

  validateSession(token: string): SafeUser | null {
    if (!token || revokedTokens.has(token)) return null;

    // 1. Stateless signature verification (instant & works across isolated serverless instances)
    const verified = verifySessionToken(token, config.sessionSecret);
    if (verified) {
      const user = this.userRepo.findById(verified.userId);
      if (!user || !user.active) return null;
      return toSafeUser(user);
    }

    // 2. Fallback to DB session store
    try {
      const session = this.sessionRepo.findByToken(token);
      if (!session) return null;

      if (new Date(session.expires_at).getTime() < Date.now()) {
        this.sessionRepo.deleteByToken(token);
        return null;
      }

      const user = this.userRepo.findById(session.user_id);
      if (!user || !user.active) return null;

      return toSafeUser(user);
    } catch {
      return null;
    }
  }

  logout(token: string, userId?: string, ipAddress?: string, userAgent?: string): void {
    if (token) {
      revokedTokens.add(token);
      try {
        this.sessionRepo.deleteByToken(token);
      } catch {}
    }
    if (userId) {
      this.auditService.record({
        userId,
        action: 'USER_LOGOUT',
        entityType: 'USER',
        entityId: userId,
        ipAddress,
        userAgent
      });
    }
  }
}
