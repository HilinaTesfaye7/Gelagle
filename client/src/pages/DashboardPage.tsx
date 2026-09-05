import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useProject } from '../context/ProjectContext.js';
import { api } from '../services/api.js';
import { ActivityWithUser } from '../types/client.types.js';
import { PMDashboard } from '../components/dashboard/PMDashboard.js';
import { QADashboard } from '../components/dashboard/QADashboard.js';
import { DevDashboard } from '../components/dashboard/DevDashboard.js';
import { GenericDashboard } from '../components/dashboard/GenericDashboard.js';
import { CreateProjectModal } from '../components/projects/CreateProjectModal.js';

interface DashboardPageProps {
  onNavigateToProject: (projectId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToProject }) => {
  const { user, memberships, refreshUser } = useAuth();
  const { projects, refreshProjects, setActiveProjectId } = useProject();
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    api.activities.listGlobal().then((res) => {
      setActivities(res.activities);
    });
  }, []);

  if (!user) return null;

  // Determine dominant role across assigned projects
  const roles = memberships.map((m) => m.role);
  const isPM = roles.includes('PROJECT_MANAGER');
  const isQA = roles.includes('QA_LEAD') || roles.includes('QA_ENGINEER');
  const isDev = roles.includes('BACKEND_DEVELOPER') || roles.includes('FRONTEND_DEVELOPER');

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    onNavigateToProject(projectId);
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Operational Command Center
          </div>
          <h1 style={{ marginTop: '2px' }}>Role-Aware Delivery Dashboard</h1>
        </div>
      </div>

      {isPM ? (
        <PMDashboard
          projects={projects}
          activities={activities}
          onOpenCreateProject={() => setShowCreateModal(true)}
          onSelectProject={handleSelectProject}
        />
      ) : isQA ? (
        <QADashboard
          projects={projects}
          activities={activities}
          onSelectProject={handleSelectProject}
        />
      ) : isDev ? (
        <DevDashboard
          user={user}
          projects={projects}
          activities={activities}
          onSelectProject={handleSelectProject}
          onRefreshUser={refreshUser}
        />
      ) : (
        <GenericDashboard
          user={user}
          projects={projects}
          activities={activities}
          onSelectProject={handleSelectProject}
        />
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          refreshProjects();
          api.activities.listGlobal().then((res) => setActivities(res.activities));
        }}
      />
    </div>
  );
};
