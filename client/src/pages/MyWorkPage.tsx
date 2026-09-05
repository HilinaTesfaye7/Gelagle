import React from 'react';
import { Briefcase, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useProject } from '../context/ProjectContext.js';
import { Badge } from '../components/common/Badge.js';
import { EmptyState } from '../components/common/EmptyState.js';

interface MyWorkPageProps {
  onSelectProject: (projectId: string) => void;
}

export const MyWorkPage: React.FC<MyWorkPageProps> = ({ onSelectProject }) => {
  const { user, memberships } = useAuth();
  const { setActiveProjectId } = useProject();

  if (!user) return null;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>My Work & Project Commitments</h1>
        <p style={{ fontSize: '0.88rem' }}>
          Personal delivery scope across all authorized project memberships
        </p>
      </div>

      {memberships.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Project Assignments"
          description="You are not currently assigned to any active project scopes."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {memberships.map((m) => (
            <div
              key={m.id}
              className="glass-card interactive"
              onClick={() => {
                setActiveProjectId(m.project_id);
                onSelectProject(m.project_id);
              }}
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{m.projectName}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Joined: {new Date(m.joined_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge role={m.role} />
              </div>

              <div style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                  Assigned Responsibilities
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  {m.responsibilities || 'Core delivery and operational support'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399' }}>
                  <CheckCircle size={14} />
                  <span>Authorized Member</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                  <span>Open Command Center</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
