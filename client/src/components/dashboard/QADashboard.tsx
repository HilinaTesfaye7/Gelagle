import React from 'react';
import {
  TestTube2,
  Bug,
  ShieldCheck,
  ArrowRight,
  Clock,
  Users
} from 'lucide-react';
import { ProjectWithDetails, ActivityWithUser } from '../../types/client.types.js';
import { Badge } from '../common/Badge.js';
import { ProgressBar } from '../common/ProgressBar.js';

interface QADashboardProps {
  projects: ProjectWithDetails[];
  activities: ActivityWithUser[];
  onSelectProject: (id: string) => void;
}

export const QADashboard: React.FC<QADashboardProps> = ({
  projects,
  activities,
  onSelectProject
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* QA Stat Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <TestTube2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned QA Projects</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{projects.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
              Quality assurance active
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Regression Readiness</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>Verified</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Phase 1 test pipelines green
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
            <Bug size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Defect Tracking</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>Phase 2</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Automated bug triage coming soon
            </div>
          </div>
        </div>
      </div>

      {/* Assigned QA Projects */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2>Quality Assurance Assignments</h2>
          <p style={{ fontSize: '0.85rem' }}>Your active testing scopes, team allocations, and milestone delivery</p>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  <span>View Project Specs</span>
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
