import React from 'react';
import {
  FolderGit2,
  Users,
  ArrowRight,
  Clock
} from 'lucide-react';
import { ProjectWithDetails, ActivityWithUser, SafeUser } from '../../types/client.types.js';
import { Badge } from '../common/Badge.js';
import { ProgressBar } from '../common/ProgressBar.js';

interface GenericDashboardProps {
  user: SafeUser;
  projects: ProjectWithDetails[];
  activities: ActivityWithUser[];
  onSelectProject: (id: string) => void;
}

export const GenericDashboard: React.FC<GenericDashboardProps> = ({
  user,
  projects,
  activities,
  onSelectProject
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>Welcome back, {user.name}</h2>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
            Timezone: {user.timezone} · Active Status: <strong>{user.availability_status}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Badge availability={user.availability_status} />
        </div>
      </div>

      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2>Your Assigned Projects</h2>
          <p style={{ fontSize: '0.85rem' }}>Direct project assignments across delivery workflows</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {projects.map((p) => (
            <div
              key={p.id}
              className="glass-card interactive"
              onClick={() => onSelectProject(p.id)}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: '#fff' }}>{p.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                    <Clock size={12} />
                    <span>Target: {p.target_date || 'TBD'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                  <Badge status={p.status} />
                  {p.currentUserRole && <Badge role={p.currentUserRole} />}
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {p.description || 'No description provided.'}
              </p>

              <ProgressBar progress={p.progress} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={14} />
                  <span>{p.memberCount || 0} Members</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                  <span>Open Details</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
