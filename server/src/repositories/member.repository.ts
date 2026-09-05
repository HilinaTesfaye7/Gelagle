import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../db/database.js';
import { ProjectMember, ProjectMemberWithUser } from '../types/project.types.js';
import { ProjectMembershipInfo } from '../types/user.types.js';

export class MemberRepository {
  private get db(): DatabaseSync {
    return getDatabase();
  }

  findByProjectAndUser(projectId: string, userId: string): ProjectMember | null {
    const stmt = this.db.prepare(`
      SELECT * FROM project_members 
      WHERE project_id = ? AND user_id = ? AND active = 1
    `);
    const row = stmt.get(projectId, userId) as ProjectMember | undefined;
    return row || null;
  }

  findById(id: string): ProjectMember | null {
    const stmt = this.db.prepare('SELECT * FROM project_members WHERE id = ?');
    const row = stmt.get(id) as ProjectMember | undefined;
    return row || null;
  }

  findMembersByProjectId(projectId: string): ProjectMemberWithUser[] {
    const stmt = this.db.prepare(`
      SELECT 
        pm.id,
        pm.project_id,
        pm.user_id,
        pm.role,
        pm.responsibilities,
        pm.joined_at,
        pm.active,
        u.name AS userName,
        u.email AS userEmail,
        u.avatar AS userAvatar,
        u.availability_status AS userAvailability
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ? AND pm.active = 1
      ORDER BY pm.role ASC, u.name ASC
    `);
    return stmt.all(projectId) as unknown as ProjectMemberWithUser[];
  }

  findMembershipsByUserId(userId: string): ProjectMembershipInfo[] {
    const stmt = this.db.prepare(`
      SELECT 
        pm.id,
        pm.project_id,
        p.name AS projectName,
        p.status AS projectStatus,
        pm.role,
        pm.responsibilities,
        pm.joined_at,
        pm.active
      FROM project_members pm
      JOIN projects p ON pm.project_id = p.id
      WHERE pm.user_id = ? AND pm.active = 1
      ORDER BY p.name ASC
    `);
    return stmt.all(userId) as unknown as ProjectMembershipInfo[];
  }

  create(member: ProjectMember): ProjectMember {
    const stmt = this.db.prepare(`
      INSERT INTO project_members (
        id, project_id, user_id, role, responsibilities, joined_at, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_id, user_id) DO UPDATE SET
        role = excluded.role,
        responsibilities = excluded.responsibilities,
        active = 1
    `);
    stmt.run(
      member.id,
      member.project_id,
      member.user_id,
      member.role,
      member.responsibilities,
      member.joined_at,
      member.active
    );
    return member;
  }

  update(id: string, updates: Partial<ProjectMember>): ProjectMember | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates };
    const stmt = this.db.prepare(`
      UPDATE project_members SET
        role = ?,
        responsibilities = ?,
        active = ?
      WHERE id = ?
    `);
    stmt.run(merged.role, merged.responsibilities, merged.active, id);
    return merged;
  }

  remove(projectId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM project_members 
      WHERE project_id = ? AND user_id = ?
    `);
    const result = stmt.run(projectId, userId);
    return Number(result.changes) > 0;
  }
}
