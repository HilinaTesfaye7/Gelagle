import React from 'react';
import {
  FolderGit2,
  CheckCircle2,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
  Clock
} from 'lucide-react';
import { ProjectWithDetails, ActivityWithUser } from '../../types/client.types.js';
import { Badge } from '../common/Badge.js';
import { ProgressBar } from '../common/ProgressBar.js';

interface PMDashboardProps {
  projects: ProjectWithDetails[];
  activities: ActivityWithUser[];
  onOpenCreateProject: () => void;
  onSelectProject: (id: string) => void;
}

export const PMDashboard: React.FC<PMDashboardProps> = ({
  projects,
  activities,
  onOpenCreateProject,
  onSelectProject
}) => {
  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;
  const planningCount = projects.filter((p) => p.status === 'PLANNING').length;
  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>
            <FolderGit2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Managed Projects</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{projects.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', marginTop: '2px' }}>
              {activeCount} Active · {planningCount} Planning
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Delivery Velocity</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{avgProgress}%</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Across portfolio milestones
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivery Health</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>Optimal</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              No critical release blockers
            </div>
          </div>
        </div>
      </div>

      {/* Projects Portfolio Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2>Project Portfolio Command</h2>
            <p style={{ fontSize: '0.85rem' }}>Manage lifecycle, assign leaders, and track delivery progress</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onOpenCreateProject}>
            <Plus size={16} />
            <span>Create Project</span>
          </button>
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
                <Badge status={p.status} />
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.description || 'No description provided.'}
              </p>

              <ProgressBar progress={p.progress} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={14} />
                  <span>{p.memberCount || 0} Members</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                  <span>Open Command Center</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>Live Platform Activity</h3>
        {activities.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.85rem' }}>
            No recent activity recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--primary-light)'
                    }}
                  >
                    {act.action}
                  </span>
                  <span style={{ color: 'var(--text-main)' }}>
                    <strong>{act.userName || 'System'}</strong> on {act.projectName || 'Command Center'}
                  </span>
                </div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
