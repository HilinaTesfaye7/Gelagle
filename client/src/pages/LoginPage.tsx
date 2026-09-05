import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Badge } from '../components/common/Badge.js';

export const LoginPage: React.FC = () => {
  const { login, quickLoginAs } = useAuth();
  const [identifier, setIdentifier] = useState('pm@commandcenter.io');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoUsers = [
    { email: 'pm@commandcenter.io', name: 'Alex Chen', role: 'PROJECT_MANAGER', desc: 'Portfolio & Delivery' },
    { email: 'po@commandcenter.io', name: 'Sarah Connor', role: 'PRODUCT_OWNER', desc: 'Requirements & Vision' },
    { email: 'qalead@commandcenter.io', name: 'Dave Miller', role: 'QA_LEAD', desc: 'QA & Test Strategy' },
    { email: 'qaeng@commandcenter.io', name: 'Emma Watson', role: 'QA_ENGINEER', desc: 'Automation & E2E' },
    { email: 'backend@commandcenter.io', name: 'Marcus Vance', role: 'BACKEND_DEVELOPER', desc: 'Core APIs & DB' },
    { email: 'frontend@commandcenter.io', name: 'Sophia Lin', role: 'FRONTEND_DEVELOPER', desc: 'UI & State Architecture' },
    { email: 'designer@commandcenter.io', name: 'Liam Davis', role: 'DESIGNER', desc: 'Design Systems & UX' },
    { email: 'other@commandcenter.io', name: 'Zoe Taylor', role: 'OTHER', desc: 'DevOps & SRE' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'radial-gradient(ellipse at 50% 10%, rgba(99, 102, 241, 0.15), transparent 70%), #060911'
      }}
    >
      <div style={{ width: '100%', maxWidth: '960px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
        {/* Left Hero */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-full)', color: 'var(--primary-light)', fontSize: '0.78rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            <Sparkles size={14} />
            <span>PHASE 1 CORE PLATFORM & RBAC</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
            Enterprise Delivery <br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Command Center
            </span>
          </h1>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            A unified, role-aware operational control plane for Project Managers, Product Owners, QA Leads, Developers, and Designers. Featuring granular RBAC and zero cross-project leakage.
          </p>

          {/* Quick Demo Access Pills */}
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={14} color="var(--primary-light)" />
              <span>Instant 1-Click Role Login (Phase 1 Seed):</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {demoUsers.map((du) => (
                <button
                  key={du.email}
                  type="button"
                  onClick={() => quickLoginAs(du.email)}
                  style={{
                    padding: '0.6rem 0.75rem',
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{du.name}</span>
                    <Badge role={du.role} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{du.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="glass-card" style={{ padding: '2.25rem', border: '1px solid var(--border-glass)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem' }}>Sign In to Command Center</h2>
            <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              Enter your corporate credentials to access authorized projects.
            </p>
          </div>

          {error && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#fca5a5', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email or Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.25rem' }}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.25rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
            >
              <span>{loading ? 'Authenticating...' : 'Enter Command Center'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Default test password: <code style={{ color: 'var(--primary-light)' }}>Password123!</code>
          </div>
        </div>
      </div>
    </div>
  );
};
