import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Briefcase,
  CheckSquare,
  Bug,
  FileText,
  Palette,
  Code2,
  TestTube2,
  Calendar,
  Users,
  BarChart3,
  Rocket,
  Bot,
  Activity,
  Settings,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isPhase2?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'my-work', label: 'My Work', icon: Briefcase },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
    // Phase 2 items
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, isPhase2: true },
    { id: 'bugs', label: 'Bugs', icon: Bug, isPhase2: true },
    { id: 'requirements', label: 'Requirements', icon: FileText, isPhase2: true },
    { id: 'design', label: 'Design', icon: Palette, isPhase2: true },
    { id: 'development', label: 'Development', icon: Code2, isPhase2: true },
    { id: 'testing', label: 'Testing', icon: TestTube2, isPhase2: true },
    { id: 'meetings', label: 'Meetings', icon: Calendar, isPhase2: true },
    { id: 'reports', label: 'Reports', icon: BarChart3, isPhase2: true },
    { id: 'releases', label: 'Releases', icon: Rocket, isPhase2: true },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, isPhase2: true }
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#090e1a',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        userSelect: 'none'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1rem', letterSpacing: '-0.01em', fontWeight: 800 }}>
            COMMAND <span style={{ color: 'var(--accent-cyan)' }}>CENTER</span>
          </h2>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            AI Delivery Platform
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem'
        }}
      >
        <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em' }}>
          Core Platform
        </div>

        {navItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={18} className={isActive ? 'text-primary-light' : ''} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div style={{ padding: '1rem 0.75rem 0.25rem', fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em' }}>
          Delivery Suite
        </div>

        {navItems.slice(6).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-dim)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.82rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
              <span
                style={{
                  fontSize: '0.62rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-dim)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                Phase 2
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      {user && (
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(12, 18, 30, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
          />
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className={`status-dot dot-${user.availability_status}`} style={{ width: '6px', height: '6px' }} />
              <span>{user.availability_status}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
