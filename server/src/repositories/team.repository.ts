import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from '../db/database.js';
import { Team, TeamWithMembers } from '../types/team.types.js';
import { generateId } from '../utils/crypto.utils.js';

export class TeamRepository {
  private get db(): DatabaseSync {
    return getDatabase();
  }

  findById(id: string): Team | null {
    const stmt = this.db.prepare('SELECT * FROM teams WHERE id = ?');
    const row = stmt.get(id) as Team | undefined;
    return row || null;
  }

  findByProjectId(projectId: string): TeamWithMembers[] {
    const stmt = this.db.prepare('SELECT * FROM teams WHERE project_id = ? ORDER BY name ASC');
    const teams = stmt.all(projectId) as unknown as Team[];

    const memberStmt = this.db.prepare(`
      SELECT 
        u.id AS userId,
        u.name,
        u.email,
        u.avatar,
        tm.joined_at AS joinedAt
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ?
      ORDER BY u.name ASC
    `);

    return teams.map((team) => {
      const members = memberStmt.all(team.id) as unknown as Array<{
        userId: string;
        name: string;
        email: string;
        avatar: string | null;
        joinedAt: string;
      }>;

      return {
        ...team,
        members
      };
    });
  }

  create(team: Team): Team {
    const stmt = this.db.prepare(`
      INSERT INTO teams (id, project_id, name, description, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(team.id, team.project_id, team.name, team.description, team.created_at);
    return team;
  }

  addMember(teamId: string, userId: string): boolean {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO team_members (id, team_id, user_id, joined_at)
      VALUES (?, ?, ?, ?)
    `);
    const id = generateId();
    const joinedAt = new Date().toISOString();
    const result = stmt.run(id, teamId, userId, joinedAt);
    return Number(result.changes) > 0;
  }

  removeMember(teamId: string, userId: string): boolean {
    const stmt = this.db.prepare('DELETE FROM team_members WHERE team_id = ? AND user_id = ?');
    const result = stmt.run(teamId, userId);
    return Number(result.changes) > 0;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM teams WHERE id = ?');
    const result = stmt.run(id);
    return Number(result.changes) > 0;
  }
}
