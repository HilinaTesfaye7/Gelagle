import React, { useState } from 'react';
import { Plus, Search, FolderGit2, Users, Clock, ArrowRight, LayoutGrid, List, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';
import { Badge } from '../components/common/Badge.js';
import { ProgressBar } from '../components/common/ProgressBar.js';
import { CreateProjectModal } from '../components/projects/CreateProjectModal.js';
import { EmptyState } from '../components/common/EmptyState.js';

interface ProjectsPageProps {
  onSelectProject: (id: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectProject }) => {
  const { projects, refreshProjects, setActiveProjectId } = useProject();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchesFilter = filter === 'ALL' || p.status === filter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1>Authorized Projects</h1>
          <p style={{ fontSize: '0.88rem' }}>
            Projects you have explicit authorization and role membership in
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter, Search & View Toggle Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {['ALL', 'ACTIVE', 'PLANNING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`btn btn-sm ${filter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem' }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.25rem', fontSize: '0.82rem' }}
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)'
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <button
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => setViewMode('table')}
              title="Table View with Daily Standup Answers"
            >
              <List size={14} />
              <span>Table</span>
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={14} />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No Projects Found"
          description={
            search
              ? `No projects match "${search}".`
              : 'You do not belong to any projects matching this filter.'
          }
          action={{
            label: 'Create Project',
            icon: Plus,
            onClick: () => setShowCreateModal(true)
          }}
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW WITH DAILY STANDUP QUESTIONS & ANSWERS */
        <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Your Role</th>
                <th style={{ minWidth: '140px' }}>Velocity</th>
                <th>Members</th>
                <th style={{ minWidth: '320px' }}>Latest Daily Standup / Update</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => {
                const latest = p.latestDailyUpdate;
                return (
                  <tr
                    key={p.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setActiveProjectId(p.id);
                      onSelectProject(p.id);
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        Target: {p.target_date || 'TBD'}
                      </div>
                    </td>
                    <td>
                      <Badge status={p.status} />
                    </td>
                    <td>
                      {p.currentUserRole ? <Badge role={p.currentUserRole} /> : <span style={{ color: 'var(--text-dim)' }}>-</span>}
                    </td>
                    <td>
                      <ProgressBar progress={p.progress} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        <Users size={13} />
                        <span>{p.memberCount || 0}</span>
                      </div>
                    </td>
                    <td>
                      {latest ? (
                        <div
                          style={{
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.8rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{latest.user_name}</span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>({latest.role})</span>
                            </div>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: latest.source === 'TELEGRAM' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: latest.source === 'TELEGRAM' ? 'var(--accent-cyan)' : 'var(--accent-emerald)',
                                fontWeight: 600
                              }}
                            >
                              {latest.source === 'TELEGRAM' ? '🤖 Telegram' : '💻 Web'}
                            </span>
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.35 }}>
                            <strong style={{ color: '#fff' }}>Q1:</strong> {latest.q1_answer}
                          </div>
                          {latest.q3_answer && latest.q3_answer.toLowerCase() !== 'none' && latest.q3_answer.toLowerCase() !== 'no' && (
                            <div style={{ color: '#f87171', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span>⚠️ Blocker:</span>
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                                {latest.q3_answer}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-dim)', fontSize: '0.76rem', fontStyle: 'italic' }}>
                          No standup recorded today
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProjectId(p.id);
                          onSelectProject(p.id);
                        }}
                      >
                        <span>Open</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW WITH STANDUP BADGES */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filteredProjects.map((p) => {
            const latest = p.latestDailyUpdate;
            return (
              <div
                key={p.id}
                className="glass-card interactive"
                onClick={() => {
                  setActiveProjectId(p.id);
                  onSelectProject(p.id);
                }}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{p.name}</h3>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '4px'
                      }}
                    >
                      <Clock size={12} />
                      <span>Target: {p.target_date || 'TBD'}</span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.35rem'
                    }}
                  >
                    <Badge status={p.status} />
                    {p.currentUserRole && <Badge role={p.currentUserRole} />}
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    minHeight: '36px'
                  }}
                >
                  {p.description || 'No description provided.'}
                </p>

                <ProgressBar progress={p.progress} />

                {/* Latest Daily Standup Strip */}
                {latest ? (
                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '3px'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                        {latest.source === 'TELEGRAM' ? '🤖' : '💻'} {latest.user_name} ({latest.role})
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                        {new Date(latest.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <strong style={{ color: '#fff' }}>Q1:</strong> {latest.q1_answer}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    No daily standup recorded today
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem',
                    color: 'var(--text-dim)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={14} />
                    <span>{p.memberCount || 0} Members</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      color: 'var(--primary-light)',
                      fontWeight: 600
                    }}
                  >
                    <span>Open Command Center</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={refreshProjects}
      />
    </div>
  );
};
