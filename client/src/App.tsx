import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ProjectProvider, useProject } from './context/ProjectContext.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ProjectsPage } from './pages/ProjectsPage.js';
import { ProjectDetailPage } from './pages/ProjectDetailPage.js';
import { MyWorkPage } from './pages/MyWorkPage.js';
import { TeamPage } from './pages/TeamPage.js';
import { ActivityPage } from './pages/ActivityPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { ComingSoonPage } from './pages/ComingSoonPage.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { Modal } from './components/common/Modal.js';
import { TelegramSimulator } from './components/telegram/TelegramSimulator.js';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const { activeProjectId } = useProject();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-deep)',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            COMMAND CENTER
          </div>
          <div style={{ fontSize: '0.85rem' }}>Initializing Platform & Security Engine...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const navigateToProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentTab('project-detail');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigateToProject={navigateToProject} />;
      case 'projects':
        return <ProjectsPage onSelectProject={navigateToProject} />;
      case 'project-detail':
        return (
          <ProjectDetailPage
            projectId={selectedProjectId || activeProjectId || ''}
            onBack={() => setCurrentTab('projects')}
          />
        );
      case 'my-work':
        return <MyWorkPage onSelectProject={navigateToProject} />;
      case 'team':
        return <TeamPage />;
      case 'activity':
        return <ActivityPage />;
      case 'settings':
        return <SettingsPage />;

      // Phase 2 Sections
      case 'tasks':
        return (
          <ComingSoonPage
            title="Task & Sprint Management"
            phase="Phase 2"
            description="High-velocity delivery sprint boards, backlog grooming, automated task assignments, and pull-request linking."
            highlights={[
              'Interactive Kanban and Sprint views with real-time status transitions',
              'AI automated task estimation and workload balancing',
              'Subtasks, story points, and commit hash synchronization'
            ]}
            onReturnHome={() => setCurrentTab('dashboard')}
          />
        );
      case 'bugs':
        return (
          <ComingSoonPage
            title="Bug & Incident Tracking"
            phase="Phase 2"
            description="Deep QA triage, severity categorization, regression tracking, and release blockage shields."
            highlights={[
              'Severity matrix: P0 Blocker to P3 Minor with automated escalation',
              'Integration with CI/CD pipelines to fail builds on open blockers',
              'Screenshot and console log attachments for instant reproduction'
            ]}
            onReturnHome={() => setCurrentTab('dashboard')}
          />
        );
      case 'requirements':
        return (
          <ComingSoonPage
            title="Requirements & PRD Engine"
            phase="Phase 2"
            description="Product specifications, acceptance criteria, and traceable requirement trees linked to tasks and test cases."
            highlights={[
              'Collaborative markdown PRD editor with version history',
              'Traceability matrix: Requirements -> Tasks -> Tests -> Releases'
            ]}
            onReturnHome={() => setCurrentTab('dashboard')}
          />
        );
      case 'design':
        return (
          <ComingSoonPage
            title="Design & Design System Hub"
            phase="Phase 2"
            description="Figma synchronization, component specifications, asset libraries, and UX review workflows."
            highlights={[
              'Real-time Figma embed and component token sync',
              'Design handoff checklists for frontend developers'
            ]}
            onReturnHome={() => setCurrentTab('dashboard')}
          />
        );
      case 'development':
        return (
          <ComingSoonPage
            title="Development & Code Gateway"
            phase="Phase 2"
            description="Repository monitoring, branch protection rules, pull request reviews, and CI build status."
            highlights={[
              'Live PR status tracking across GitHub / GitLab',
              'Build health and deployment status directly in project view'
            ]}
            onReturnHome={() => setCurrentTab('dashboard')}
          />
        );
      case 'testing':
        return (
          <ComingSoonPage
            title="Testing & Quality Command"
            phase="Phase 2"
            description="Automated test suite execution, manual test run logging, and release sign-off governance."
            highlights={[
              'Test suite results aggregation (Playwright, Jest, Cypress)',
              'QA Lead sign-off gates prior to production releases'
            ]}
            onReturnHome={() => setCurrentTab('dashboard')}
          />
        );
      case 'meetings':
        return (
          <ComingSoonPage
            title="Meetings & Decisions Log"
            phase="Phase 2"
            description="Sprint ceremonies, architectural decision records (ADRs), and automated meeting action item extraction."
            highlights={[
              'Structured ADR repository with status tracking',
              'Automated action item dispatching to project task boards'
            ]}
            onReturnHome={() => setCurrentTab('dashboard')}
          />
        );
      case 'reports':
        return (
          <ComingSoonPage
            title="Executive Delivery Reports"
            phase="Phase 2"
            description="Burn-down analytics, sprint velocity forecasting, SLA metrics, and delivery audit summaries."
            highlights={[
              'Automated PDF and markdown executive summaries',
              'Predictive delivery risk modeling based on team throughput'
            ]}
            onReturnHome={() => setCurrentTab('dashboard')}
          />
        );
      case 'releases':
        return (
          <ComingSoonPage
            title="Release & Deployment Orchestration"
            phase="Phase 2"
            description="Release calendar, change logs, feature flags, and multi-environment rollback controls."
            highlights={[
              'Multi-stage release gates with required PM and QA approval',
              'Automated changelog generation from merged deliverables'
            ]}
            onReturnHome={() => setCurrentTab('dashboard')}
          />
        );
      case 'ai-assistant':
        return (
          <ComingSoonPage
            title="AI Delivery Intelligence Copilot"
            phase="Phase 2"
            description="Context-aware natural language assistant capable of querying blockers, generating tasks, and summarizing status."
            highlights={[
              'Natural language queries across projects, members, and commits',
              'Autonomous blocker detection and standup summary synthesis'
            ]}
            onReturnHome={() => setCurrentTab('dashboard')}
          />
        );

      default:
        return <DashboardPage onNavigateToProject={navigateToProject} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'project-detail') setSelectedProjectId(null);
        }}
      />
      <div className="main-content">
        <Header onOpenTelegramModal={() => setShowTelegramModal(true)} />
        <main style={{ flex: 1 }}>{renderContent()}</main>
      </div>

      <Modal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        title="Telegram Bot & Identity Gateway"
        maxWidth="920px"
      >
        <TelegramSimulator />
      </Modal>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <MainApp />
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;
