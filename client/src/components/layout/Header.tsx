import React, { useState } from 'react';
import {
  FolderGit2,
  Send,
  LogOut,
  UserCheck,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useProject } from '../../context/ProjectContext.js';
import { Badge } from '../common/Badge.js';

interface HeaderProps {
  onOpenTelegramModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTelegramModal }) => {
  const { user, memberships, logout, quickLoginAs } = useAuth();
  const { projects, activeProject, setActiveProjectId } = useProject();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const demoUsers = [
    { email: 'pm@commandcenter.io', name: 'Alex Chen', role: 'PROJECT_MANAGER' },
    { email: 'po@commandcenter.io', name: 'Sarah Connor', role: 'PRODUCT_OWNER' },
    { email: 'qalead@commandcenter.io', name: 'Dave Miller', role: 'QA_LEAD' },
    { email: 'qaeng@commandcenter.io', name: 'Emma Watson', role: 'QA_ENGINEER' },
    { email: 'backend@commandcenter.io', name: 'Marcus Vance', role: 'BACKEND_DEVELOPER' },
    { email: 'frontend@commandcenter.io', name: 'Sophia Lin', role: 'FRONTEND_DEVELOPER' },
    { email: 'designer@commandcenter.io', name: 'Liam Davis', role: 'DESIGNER' },
    { email: 'other@commandcenter.io', name: 'Zoe Taylor', role: 'OTHER' }
  ];

  // Resolve user role in the currently selected project
  const currentProjectMembership = activeProject
    ? memberships.find((m) => m.project_id === activeProject.id)
    : null;
  const currentProjectRole = currentProjectMembership?.role || null;

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'rgba(12, 18, 30, 0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        zIndex: 50
      }}
    >
      {/* Active Project Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <FolderGit2 size={16} color="var(--primary-light)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Project:
          </span>
        </div>

        {projects.length > 0 ? (
          <div style={{ position: 'relative' }}>
            <select
              value={activeProject?.id || ''}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="form-select"
              style={{
                padding: '0.35rem 2rem 0.35rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#fff',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                cursor: 'pointer'
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} style={{ background: '#0d1527', color: '#fff' }}>
                  {p.name} ({p.status})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            No assigned projects
          </span>
        )}

        {currentProjectRole && (
          <Badge role={currentProjectRole} />
        )}
      </div>

      {/* Right Controls: Impersonation Switcher, Telegram Status, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Quick Role Impersonator (For Demoing Role-Awareness) */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            style={{ fontSize: '0.78rem', gap: '0.4rem' }}
          >
            <UserCheck size={14} color="var(--accent-cyan)" />
            <span>Switch Role (Demo)</span>
            <ChevronDown size={14} />
          </button>

          {showRoleSwitcher && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                width: '280px',
                background: '#0e1628',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                zIndex: 100,
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
            >
              <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>
                Test As Any Team Member
              </div>
              {demoUsers.map((du) => {
                const isCurrent = user?.email === du.email;
                return (
                  <button
                    key={du.email}
                    onClick={async () => {
                      setShowRoleSwitcher(false);
                      await quickLoginAs(du.email);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.65rem',
                      background: isCurrent ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: isCurrent ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{du.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{du.email}</div>
                    </div>
                    <Badge role={du.role} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Telegram Link Status Badge */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onOpenTelegramModal}
          style={{
            fontSize: '0.78rem',
            gap: '0.4rem',
            borderColor: user?.telegram_user_id ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'
          }}
        >
          <Send size={14} color={user?.telegram_user_id ? '#10b981' : '#64748b'} />
          <span>{user?.telegram_user_id ? `@${user.telegram_username || 'Telegram Linked'}` : 'Link Telegram'}</span>
        </button>

        {/* Logout */}
        <button
          className="btn btn-secondary btn-sm btn-icon"
          onClick={logout}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
