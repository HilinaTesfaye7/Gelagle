import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { api } from '../../services/api.js';

interface SubmitStandupModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  userRole: string;
  onSubmitted: () => void;
}

export const SubmitStandupModal: React.FC<SubmitStandupModalProps> = ({
  isOpen,
  onClose,
  projectId,
  userRole,
  onSubmitted
}) => {
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q1.trim() || !q2.trim() || !q3.trim()) {
      setError('Please answer all 3 daily check-in questions.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.dailyUpdates.create(projectId, {
        q1Question: 'What did you accomplish today?',
        q1Answer: q1.trim(),
        q2Question: 'What are you planning to work on next?',
        q2Answer: q2.trim(),
        q3Question: 'Are there any blockers or risks slowing you down?',
        q3Answer: q3.trim(),
        source: 'WEB'
      });
      onSubmitted();
      onClose();
      setQ1('');
      setQ2('');
      setQ3('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit daily update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3>Submit Daily Standup</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Record your daily progress directly to the project command center
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#f87171', fontSize: '0.82rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="form-label" style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
              1️⃣ What key tasks or milestones did you accomplish today?
            </label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g., Completed API auth endpoints, fixed JWT refresh token race condition..."
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, color: 'var(--primary-light)' }}>
              2️⃣ What are your main priorities planned for tomorrow / next?
            </label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g., Implementing Telegram webhook handler and writing e2e tests..."
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, color: '#f87171' }}>
              3️⃣ Are there any blockers, technical debt, or dependencies?
            </label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g., None, all unblocked OR waiting on API credentials..."
              value={q3}
              onChange={(e) => setQ3(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Send size={14} />
              <span>{submitting ? 'Publishing...' : 'Publish to Project Table'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
