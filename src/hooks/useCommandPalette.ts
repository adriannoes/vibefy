import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Issue } from '@/types/issue';
import { Project } from '@/types/project';

interface CommandPaletteItem {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  action: () => void;
  category: 'navigation' | 'issue' | 'project' | 'action';
}

export const useCommandPalette = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<CommandPaletteItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch search results
  const searchItems = useCallback(async (searchQuery: string) => {
    if (!user || !searchQuery.trim()) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const [issuesResult, projectsResult] = await Promise.all([
        supabase
          .from('issues')
          .select('id, title, issue_number, status, project_id, projects!inner(name, key)')
          .ilike('title', `%${searchQuery}%`)
          .limit(10),
        supabase
          .from('projects')
          .select('id, name, key, description')
          .ilike('name', `%${searchQuery}%`)
          .limit(5)
      ]);

      const commandItems: CommandPaletteItem[] = [];

      // Add issues
      if (issuesResult.data) {
        issuesResult.data.forEach((issue: { id: string; title: string; issue_number: number; status: string; project_id: string; projects: { name: string; key: string } }) => {
          commandItems.push({
            id: `issue-${issue.id}`,
            title: `${issue.projects.key}-${issue.issue_number}: ${issue.title}`,
            description: `Issue in ${issue.projects.name}`,
            icon: '📋',
            category: 'issue',
            action: () => {
              navigate(`/project/${issue.projects.key}/board`);
              setIsOpen(false);
            }
          });
        });
      }

      // Add projects
      if (projectsResult.data) {
        projectsResult.data.forEach((project: Project) => {
          commandItems.push({
            id: `project-${project.id}`,
            title: project.name,
            description: project.description || `Project ${project.key}`,
            icon: '📁',
            category: 'project',
            action: () => {
              navigate(`/project/${project.key}/board`);
              setIsOpen(false);
            }
          });
        });
      }

      // Add navigation items
      commandItems.push(
        {
          id: 'nav-board',
          title: 'Go to Board',
          description: 'View Kanban board',
          icon: '📊',
          category: 'navigation',
          action: () => {
            navigate('/board');
            setIsOpen(false);
          }
        },
        {
          id: 'nav-projects',
          title: 'Go to Projects',
          description: 'View all projects',
          icon: '📁',
          category: 'navigation',
          action: () => {
            navigate('/projects');
            setIsOpen(false);
          }
        },
        {
          id: 'nav-sprints',
          title: 'Go to Sprints',
          description: 'View sprint management',
          icon: '🏃',
          category: 'navigation',
          action: () => {
            navigate('/project/VBF/sprints');
            setIsOpen(false);
          }
        }
      );

      // Add action items
      commandItems.push(
        {
          id: 'action-create-issue',
          title: 'Create New Issue',
          description: 'Create a new issue',
          icon: '➕',
          category: 'action',
          action: () => {
            // This would trigger the create issue dialog
            setIsOpen(false);
          }
        }
      );

      setItems(commandItems);
    } catch (error) {
      console.error('Error searching items:', error);
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchItems(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchItems]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : items.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (items[selectedIndex]) {
            items[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setQuery('');
        setSelectedIndex(0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    items,
    selectedIndex,
    setSelectedIndex,
    loading
  };
};
