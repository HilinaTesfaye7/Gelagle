import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { api } from '../../services/api.js';
import { SafeUser } from '../../types/client.types.js';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onMemberAdded: () => void;
  existingMemberUserIds: string[];
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onMemberAdded,
  existingMemberUserIds
}) => {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState('BACKEND_DEVELOPER');
  const [responsibilities, setResponsibilities] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.users.list().then((res) => {
        // Filter out existing project members
        const available = res.users.filter((u) => !existingMemberUserIds.includes(u.id));
        setUsers(available);
        if (available.length > 0) {
          setSelectedUserId(available[0].id);
        }
      });
    }
  }, [isOpen, existingMemberUserIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a user to invite');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.members.add(projectId, {
        userId: selectedUserId,
        role,
        responsibilities
      });
      setResponsibilities('');
      onMemberAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member to Project"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || users.length === 0}
          >
            {loading ? 'Inviting...' : 'Assign to Project'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ padding: '0.65rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1rem' }}>
            All platform users are already assigned to this project.
          </div>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Select User *</label>
              <select
                className="form-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Project Role *</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="PROJECT_MANAGER">PROJECT_MANAGER</option>
                <option value="PRODUCT_OWNER">PRODUCT_OWNER</option>
                <option value="QA_LEAD">QA_LEAD</option>
                <option value="QA_ENGINEER">QA_ENGINEER</option>
                <option value="BACKEND_DEVELOPER">BACKEND_DEVELOPER</option>
                <option value="FRONTEND_DEVELOPER">FRONTEND_DEVELOPER</option>
                <option value="DESIGNER">DESIGNER</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Responsibilities</label>
              <input
                type="text"
                className="form-input"
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="e.g. Lead Database Migration & Redis caching"
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};
