import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { TelegramSimulator } from '../components/telegram/TelegramSimulator.js';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [availability, setAvailability] = useState(user?.availability_status || 'AVAILABLE');
  const [dailyCheckin, setDailyCheckin] = useState(!!user?.daily_checkin_enabled);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.users.updateProfile(user.id, {
        name,
        timezone,
        availability_status: availability as any,
        daily_checkin_enabled: dailyCheckin
      });
      await refreshUser();
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <h1>Account & Integration Settings</h1>
        <p style={{ fontSize: '0.88rem' }}>Manage your identity preferences, timezone, and Telegram notifications</p>
      </div>

      {/* User Preferences Card */}
      <div className="glass-card" style={{ maxWidth: '720px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.65rem', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>
            <User size={20} />
          </div>
          <div>
            <h3>Profile & Availability</h3>
            <p style={{ fontSize: '0.78rem' }}>Your operational availability and delivery timezone</p>
          </div>
        </div>

        {savedMsg && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', color: '#34d399', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span>Profile settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                className="form-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Availability Status</label>
              <select
                className="form-select"
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BUSY">BUSY</option>
                <option value="AWAY">AWAY</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0 1.5rem' }}>
            <input
              type="checkbox"
              id="dailyCheckin"
              checked={dailyCheckin}
              onChange={(e) => setDailyCheckin(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="dailyCheckin" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
              Enable automated daily standup check-in notifications
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
            <Save size={14} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>

      {/* Telegram Identity Section */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2>Telegram Identity & Notification Bot</h2>
          <p style={{ fontSize: '0.85rem' }}>One-time verification code mapping to the centralized user account</p>
        </div>
        <TelegramSimulator />
      </div>
    </div>
  );
};
