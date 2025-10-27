import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { useAuth } from '@/hooks/useAuth';

interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: React.ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load project from URL or localStorage when user changes
  useEffect(() => {
    if (user) {
      // Try to load project from localStorage
      const savedProject = localStorage.getItem('currentProject');
      if (savedProject) {
        try {
          setCurrentProject(JSON.parse(savedProject));
        } catch (error) {
          console.error('Error parsing saved project:', error);
          localStorage.removeItem('currentProject');
        }
      }
    } else {
      setCurrentProject(null);
      localStorage.removeItem('currentProject');
    }
  }, [user]);

  // Save project to localStorage when it changes
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('currentProject', JSON.stringify(currentProject));
    } else {
      localStorage.removeItem('currentProject');
    }
  }, [currentProject]);

  const value: ProjectContextType = {
    currentProject,
    setCurrentProject,
    loading,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
