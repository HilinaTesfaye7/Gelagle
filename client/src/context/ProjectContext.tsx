import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { ProjectWithDetails } from '../types/client.types.js';
import { useAuth } from './AuthContext.js';

interface ProjectContextType {
  projects: ProjectWithDetails[];
  activeProject: ProjectWithDetails | null;
  activeProjectId: string | null;
  loading: boolean;
  refreshProjects: () => Promise<void>;
  setActiveProjectId: (id: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProjects = async () => {
    if (!user) {
      setProjects([]);
      setActiveProjectId(null);
      return;
    }

    try {
      setLoading(true);
      const res = await api.projects.list();
      setProjects(res.projects);

      // Default active project to first project if current not set or no longer valid
      if (res.projects.length > 0) {
        if (!activeProjectId || !res.projects.some((p) => p.id === activeProjectId)) {
          setActiveProjectId(res.projects[0].id);
        }
      } else {
        setActiveProjectId(null);
      }
    } catch {
      setProjects([]);
      setActiveProjectId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, [user]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        loading,
        refreshProjects,
        setActiveProjectId
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within a ProjectProvider');
  return ctx;
};
