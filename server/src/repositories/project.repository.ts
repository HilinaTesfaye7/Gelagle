import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../db/database.js';
import { Project, ProjectWithDetails } from '../types/project.types.js';
import { RoleType } from '../rbac/roles.js';

export class ProjectRepository {
  private get db(): DatabaseSync {
    return getDatabase();
  }

  findById(id: string): Project | null {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
    const row = stmt.get(id) as Project | undefined;
    return row || null;
  }

  findByIdWithDetails(id: string, currentUserId?: string): ProjectWithDetails | null {
    const stmt = this.db.prepare(`
      SELECT 
        p.*,
        pm.name AS projectManagerName,
        po.name AS productOwnerName,
        (SELECT COUNT(*) FROM project_members mem WHERE mem.project_id = p.id AND mem.active = 1) AS memberCount,
        (SELECT mem.role FROM project_members mem WHERE mem.project_id = p.id AND mem.user_id = ? AND mem.active = 1) AS currentUserRole
      FROM projects p
      LEFT JOIN users pm ON p.project_manager_id = pm.id
      LEFT JOIN users po ON p.product_owner_id = po.id
      WHERE p.id = ?
    `);
    const row = stmt.get(currentUserId || '', id) as (Project & {
      projectManagerName: string | null;
      productOwnerName: string | null;
      memberCount: number;
      currentUserRole: RoleType | null;
    }) | undefined;

    if (!row) return null;

    return {
      ...row,
      latestDailyUpdate: this.getLatestDailyUpdate(row.id)
    };
  }

  findAll(): Project[] {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    return stmt.all() as unknown as Project[];
  }

  findProjectsForUser(userId: string): ProjectWithDetails[] {
    const stmt = this.db.prepare(`
      SELECT 
        p.*,
        pm.name AS projectManagerName,
        po.name AS productOwnerName,
        (SELECT COUNT(*) FROM project_members mem WHERE mem.project_id = p.id AND mem.active = 1) AS memberCount,
        mem.role AS currentUserRole
      FROM projects p
      JOIN project_members mem ON p.id = mem.project_id
      LEFT JOIN users pm ON p.project_manager_id = pm.id
      LEFT JOIN users po ON p.product_owner_id = po.id
      WHERE mem.user_id = ? AND mem.active = 1
      ORDER BY p.created_at DESC
    `);
    const list = stmt.all(userId) as unknown as ProjectWithDetails[];
    return list.map((p) => ({
      ...p,
      latestDailyUpdate: this.getLatestDailyUpdate(p.id)
    }));
  }

  private getLatestDailyUpdate(projectId: string): any {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM daily_updates WHERE project_id = ? ORDER BY created_at DESC LIMIT 1
      `);
      return stmt.get(projectId) || null;
    } catch {
      return null;
    }
  }

  create(project: Project): Project {
    const stmt = this.db.prepare(`
      INSERT INTO projects (
        id, name, description, status, start_date, target_date,
        progress, project_manager_id, product_owner_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      project.id,
      project.name,
      project.description,
      project.status,
      project.start_date,
      project.target_date,
      project.progress,
      project.project_manager_id,
      project.product_owner_id,
      project.created_at,
      project.updated_at
    );

    return project;
  }

  update(id: string, updates: Partial<Project>): Project | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const merged = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const stmt = this.db.prepare(`
      UPDATE projects SET
        name = ?,
        description = ?,
        status = ?,
        start_date = ?,
        target_date = ?,
        progress = ?,
        project_manager_id = ?,
        product_owner_id = ?,
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      merged.name,
      merged.description,
      merged.status,
      merged.start_date,
      merged.target_date,
      merged.progress,
      merged.project_manager_id,
      merged.product_owner_id,
      merged.updated_at,
      id
    );

    return merged;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
    const result = stmt.run(id);
    return Number(result.changes) > 0;
  }
}
