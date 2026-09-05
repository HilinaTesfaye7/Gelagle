import React, { useState } from 'react';
import {
  Code2,
  CheckCircle2,
  Layers,
  ArrowRight,
  Clock,
  Cpu,
  Smile
} from 'lucide-react';
import { ProjectWithDetails, ActivityWithUser, SafeUser } from '../../types/client.types.js';
import { Badge } from '../common/Badge.js';
import { ProgressBar } from '../common/ProgressBar.js';
import { api } from '../../services/api.js';

interface DevDashboardProps {
  user: SafeUser;
  projects: ProjectWithDetails[];
  activities: ActivityWithUser[];
  onSelectProject: (id: string) => void;
  onRefreshUser: () => void;
}

export const DevDashboard: React.FC<DevDashboardProps> = ({
  user,
  projects,
  activities,
  onSelectProject,
  onRefreshUser
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: any) => {
    try {
      setUpdatingStatus(true);
      await api.users.updateProfile(user.id, { availability_status: newStatus });
      onRefreshUser();
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Dev Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>
            <Code2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Repos & Projects</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{projects.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
              Active codebase scope
            </div>
          </div>
        </div>

        {/* Availability & Check-in Widget */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Availability Status</div>
            <span className={`status-dot dot-${user.availability_status}`} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['AVAILABLE', 'BUSY', 'AWAY'] as const).map((st) => (
              <button
                key={st}
                disabled={updatingStatus}
                onClick={() => handleStatusChange(st)}
                className={`btn btn-sm ${user.availability_status === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
              >
                {st}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Smile size={12} />
            <span>Daily check-in: {user.daily_checkin_enabled ? 'Active' : 'Muted'}</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Engineered Skills</div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {user.skillsList && user.skillsList.slice(0, 3).map((sk) => (
                <span key={sk} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', color: 'var(--accent-cyan)' }}>
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Projects List for Dev */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2>Assigned Delivery Pipelines</h2>
          <p style={{ fontSize: '0.85rem' }}>Direct project assignments, architectural scopes, and delivery progress</p>
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
                  <Cpu size={14} />
                  <span>PM: {p.projectManagerName || 'Unassigned'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                  <span>Open Pipeline</span>
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
