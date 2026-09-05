import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../services/api.js';
import { ActivityWithUser, AuditLogWithUser } from '../types/client.types.js';
import { useAuth } from '../context/AuthContext.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const ActivityPage: React.FC = () => {
  const { permissions } = useAuth();
  const [activeTab, setActiveTab] = useState<'activity' | 'audit'>('activity');
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const canViewAudit = permissions.includes('AUDIT_VIEW');

  useEffect(() => {
    Promise.all([
      api.activities.listGlobal(),
      canViewAudit ? api.audit.list().catch(() => ({ logs: [] })) : Promise.resolve({ logs: [] })
    ]).then(([actRes, audRes]) => {
      setActivities(actRes.activities);
      setAuditLogs(audRes.logs);
      setLoading(false);
    });
  }, [canViewAudit]);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Operational Activity & Audit Trail</h1>
        <p style={{ fontSize: '0.88rem' }}>
          Real-time delivery events and tamper-evident system audit records
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn btn-sm ${activeTab === 'activity' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('activity')}
        >
          <Activity size={14} />
          <span>Project Activities ({activities.length})</span>
        </button>

        {canViewAudit && (
          <button
            className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('audit')}
          >
            <ShieldCheck size={14} />
            <span>Compliance Audit Logs ({auditLogs.length})</span>
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>Loading events...</div>
      ) : activeTab === 'activity' ? (
        activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No Activity Events"
            description="Operational events will appear here as team members make updates."
          />
        ) : (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activities.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.55rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--primary-light)'
                    }}
                  >
                    {a.action}
                  </span>
                  <div>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{a.userName || 'System'}</span>
                    <span style={{ color: 'var(--text-muted)' }}> performed action on </span>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{a.projectName || 'Command Center'}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                  <Clock size={12} />
                  <span>{new Date(a.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        auditLogs.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No Audit Logs"
            description="Audit events record critical state changes across projects and memberships."
          />
        ) : (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700, fontSize: '0.7rem' }}>
                      {log.action}
                    </span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>
                      {log.entity_type} [{log.entity_id}]
                    </span>
                    <span style={{ color: 'var(--text-dim)' }}>by {log.userName || 'System'}</span>
                  </div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>

                {(log.previous_value || log.new_value) && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.6rem', borderRadius: '4px', overflowX: 'auto', fontFamily: 'var(--font-mono)' }}>
                    {log.previous_value && <div>- PREV: {log.previous_value}</div>}
                    {log.new_value && <div style={{ color: '#6ee7b7' }}>+ NEW: {log.new_value}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
