import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  Calendar,
  Layers,
  Activity,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  FolderGit2,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api.js';
import {
  ProjectWithDetails,
  ProjectMemberWithUser,
  TeamWithMembers,
  ActivityWithUser,
  DailyUpdate
} from '../types/client.types.js';
import { Badge } from '../components/common/Badge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { InviteMemberModal } from '../components/projects/InviteMemberModal.js';
import { CreateTeamModal } from '../components/projects/CreateTeamModal.js';
import { SubmitStandupModal } from '../components/standup/SubmitStandupModal.js';
import { EmptyState } from '../components/common/EmptyState.js';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [members, setMembers] = useState<ProjectMemberWithUser[]>([]);
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'standups' | 'members' | 'teams' | 'activity'>('standups');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showStandupModal, setShowStandupModal] = useState(false);

  // Updating progress inline
  const [editingProgress, setEditingProgress] = useState(false);
  const [newProgress, setNewProgress] = useState(0);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [projRes, memRes, teamRes, actRes, updateRes] = await Promise.all([
        api.projects.get(projectId),
        api.members.list(projectId),
        api.teams.list(projectId),
        api.activities.listProject(projectId),
        api.dailyUpdates.listForProject(projectId)
      ]);

      setProject(projRes.project);
      setMembers(memRes.members);
      setTeams(teamRes.teams);
      setActivities(actRes.activities);
      setDailyUpdates(updateRes.updates || []);
      setNewProgress(projRes.project.progress);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const handleUpdateProgress = async () => {
    if (!project) return;
    try {
      await api.projects.update(project.id, { progress: Number(newProgress) });
      setEditingProgress(false);
      loadProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to update progress');
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this project?`)) return;
    try {
      await api.members.remove(projectId, userId);
      loadProjectData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading Project Command Center...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-container">
        <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </button>
        <EmptyState
          icon={FolderGit2}
          title="Project Access Restricted"
          description={error || 'You do not have authorization to view this project.'}
          action={{
            label: 'Return to Authorized Projects',
            onClick: onBack
          }}
        />
      </div>
    );
  }

  const isPM = project.currentUserRole === 'PROJECT_MANAGER';
  const canManageMembers = isPM;
  const canUpdateProject = isPM || project.currentUserRole === 'PRODUCT_OWNER';

  return (
    <div className="page-container">
      {/* Top Back Nav */}
      <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={14} />
        <span>Back to Projects</span>
      </button>

      {/* Project Overview Card */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1>{project.name}</h1>
              <Badge status={project.status} />
              {project.currentUserRole && <Badge role={project.currentUserRole} />}
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: '800px' }}>
              {project.description || 'No description provided.'}
            </p>
          </div>

          {canUpdateProject && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEditingProgress(!editingProgress)}
              >
                <Edit2 size={14} />
                <span>{editingProgress ? 'Cancel Edit' : 'Update Velocity'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Progress Section */}
        {editingProgress ? (
          <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Set Progress (%):</span>
            <input
              type="number"
              min={0}
              max={100}
              className="form-input"
              style={{ width: '100px' }}
              value={newProgress}
              onChange={(e) => setNewProgress(Number(e.target.value))}
            />
            <button className="btn btn-primary btn-sm" onClick={handleUpdateProgress}>
              Save Progress
            </button>
          </div>
        ) : (
          <ProgressBar progress={project.progress} />
        )}

        {/* Metadata Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Project Manager:</span>
            <div style={{ fontWeight: 600, color: '#fff', marginTop: '2px' }}>
              {project.projectManagerName || 'Unassigned'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Product Owner:</span>
            <div style={{ fontWeight: 600, color: '#fff', marginTop: '2px' }}>
              {project.productOwnerName || 'Unassigned'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Start Date:</span>
            <div style={{ fontWeight: 600, color: '#fff', marginTop: '2px' }}>
              {project.start_date || 'Not specified'}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Target Delivery:</span>
            <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginTop: '2px' }}>
              {project.target_date || 'Not specified'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          className={`btn btn-sm ${activeTab === 'standups' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('standups')}
        >
          <MessageSquare size={14} />
          <span>Daily Standups ({dailyUpdates.length})</span>
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'members' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={14} />
          <span>Members ({members.length})</span>
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'teams' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('teams')}
        >
          <Layers size={14} />
          <span>Teams ({teams.length})</span>
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'activity' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('activity')}
        >
          <Activity size={14} />
          <span>Activity Feed ({activities.length})</span>
        </button>
      </div>

      {/* Tab 0: Daily Standups */}
      {activeTab === 'standups' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3>Daily Team Standups & Check-ins</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                Live responses submitted via Telegram Bot (@glagleBot) and Web Command Center
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowStandupModal(true)}>
              <Plus size={14} />
              <span>Submit Daily Standup</span>
            </button>
          </div>

          {dailyUpdates.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No Daily Standups Recorded"
              description="No standup updates have been submitted for this project yet. Start @glagleBot on Telegram or click below to submit your update."
              action={{
                label: 'Submit Daily Standup',
                icon: Plus,
                onClick: () => setShowStandupModal(true)
              }}
            />
          ) : (
            <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ minWidth: '180px' }}>Team Member</th>
                    <th style={{ minWidth: '130px' }}>Source & Time</th>
                    <th style={{ minWidth: '220px' }}>1️⃣ Accomplishments</th>
                    <th style={{ minWidth: '220px' }}>2️⃣ Next Priorities</th>
                    <th style={{ minWidth: '220px' }}>3️⃣ Blockers & Risks</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyUpdates.map((u) => {
                    const hasBlocker =
                      u.q3_answer &&
                      u.q3_answer.toLowerCase() !== 'none' &&
                      u.q3_answer.toLowerCase() !== 'no' &&
                      u.q3_answer.trim() !== '';
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                color: '#fff'
                              }}
                            >
                              {u.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{u.user_name}</div>
                              <Badge role={u.role as any} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background:
                                  u.source === 'TELEGRAM'
                                    ? 'rgba(56, 189, 248, 0.15)'
                                    : 'rgba(16, 185, 129, 0.15)',
                                color:
                                  u.source === 'TELEGRAM' ? 'var(--accent-cyan)' : 'var(--accent-emerald)',
                                fontWeight: 600,
                                width: 'fit-content'
                              }}
                            >
                              {u.source === 'TELEGRAM' ? '🤖 Telegram' : '💻 Web'}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                              {new Date(u.created_at).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                            {u.q1_answer}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                            {u.q2_answer}
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              fontSize: '0.82rem',
                              lineHeight: 1.4,
                              color: hasBlocker ? '#f87171' : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.35rem'
                            }}
                          >
                            {hasBlocker && <AlertTriangle size={14} style={{ minWidth: '14px', marginTop: '2px' }} />}
                            <span>{u.q3_answer}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Members */}
      {activeTab === 'members' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3>Project Membership Directory</h3>
              <p style={{ fontSize: '0.8rem' }}>Role-authorized team members linked to this delivery scope</p>
            </div>
            {canManageMembers && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowInviteModal(true)}>
                <Plus size={14} />
                <span>Invite Member</span>
              </button>
            )}
          </div>

          {members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Members Assigned"
              description="No team members have been added to this project yet."
              action={canManageMembers ? { label: 'Invite Member', icon: Plus, onClick: () => setShowInviteModal(true) } : undefined}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {members.map((m) => (
                <div key={m.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={m.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={m.userName}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{m.userName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{m.userEmail}</div>
                      </div>
                    </div>
                    <Badge role={m.role} />
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Responsibilities:</strong> {m.responsibilities || 'General delivery contribution'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-dim)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span className={`status-dot dot-${m.userAvailability}`} />
                      <span>{m.userAvailability}</span>
                    </div>

                    {canManageMembers && m.role !== 'PROJECT_MANAGER' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemoveMember(m.user_id, m.userName)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Teams */}
      {activeTab === 'teams' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3>Functional Teams & Squads</h3>
              <p style={{ fontSize: '0.8rem' }}>Teams established within this project</p>
            </div>
            {isPM && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowTeamModal(true)}>
                <Plus size={14} />
                <span>Create Team</span>
              </button>
            )}
          </div>

          {teams.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No Teams Established"
              description="Functional teams can be created to organize project squads."
              action={isPM ? { label: 'Create Team', icon: Plus, onClick: () => setShowTeamModal(true) } : undefined}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {teams.map((t) => (
                <div key={t.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h4>{t.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {t.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                      Team Members ({t.members.length}):
                    </div>
                    {t.members.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        No members assigned to this squad yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {t.members.map((tm) => (
                          <div
                            key={tm.userId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.35rem 0.6rem',
                              background: 'rgba(255, 255, 255, 0.02)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.78rem'
                            }}
                          >
                            <img
                              src={tm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={tm.name}
                              style={{ width: '22px', height: '22px', borderRadius: '50%' }}
                            />
                            <span style={{ color: '#fff' }}>{tm.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Activity */}
      {activeTab === 'activity' && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Project Activity Feed</h3>
          {activities.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No Activity Logged"
              description="Activity events will be recorded as actions are taken within this project."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
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
                    <span>
                      <strong>{act.userName || 'User'}</strong> performed {act.action.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        projectId={projectId}
        onMemberAdded={loadProjectData}
        existingMemberUserIds={members.map((m) => m.user_id)}
      />

      <CreateTeamModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        projectId={projectId}
        onTeamCreated={loadProjectData}
      />

      <SubmitStandupModal
        isOpen={showStandupModal}
        onClose={() => setShowStandupModal(false)}
        projectId={projectId}
        userRole={project.currentUserRole || 'MEMBER'}
        onSubmitted={loadProjectData}
      />
    </div>
  );
};
