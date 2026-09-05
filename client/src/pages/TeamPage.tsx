import React, { useState, useEffect } from 'react';
import { Users, Search, Globe, Send } from 'lucide-react';
import { api } from '../services/api.js';
import { SafeUser } from '../types/client.types.js';
import { Badge } from '../components/common/Badge.js';

export const TeamPage: React.FC = () => {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.users.list().then((res) => {
      setUsers(res.users);
      setLoading(false);
    });
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.skillsList && u.skillsList.some((s) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Platform Team Directory</h1>
          <p style={{ fontSize: '0.88rem' }}>Cross-functional engineering and delivery personnel</p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.25rem', fontSize: '0.82rem' }}
            placeholder="Search by name, skill, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>Loading directory...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredUsers.map((u) => (
            <div key={u.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <img
                  src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={u.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>@{u.username} · {u.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <Globe size={13} />
                  <span>{u.timezone}</span>
                </div>
                <Badge availability={u.availability_status} />
              </div>

              {/* Skills Tags */}
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Core Skills
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {u.skillsList && u.skillsList.length > 0 ? (
                    u.skillsList.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--accent-cyan)'
                        }}
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>None listed</span>
                  )}
                </div>
              </div>

              {/* Telegram Status */}
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: u.telegram_user_id ? '#34d399' : 'var(--text-dim)' }}>
                  <Send size={12} />
                  <span>{u.telegram_user_id ? `@${u.telegram_username || 'Linked'}` : 'No Telegram'}</span>
                </div>
                <span style={{ color: 'var(--text-dim)' }}>
                  Check-in: {u.daily_checkin_enabled ? 'Enabled' : 'Off'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
