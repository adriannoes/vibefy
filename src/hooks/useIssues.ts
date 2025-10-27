import { useState, useEffect, useCallback } from 'react';
import { Issue, IssueStatus, IssuePriority, IssueType } from '@/types/issue';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

// Mock data for development - will be replaced with real Supabase queries when connected
const mockIssues: Issue[] = [
  {
    id: '1',
    project_id: '1',
    issue_number: 1,
    title: 'Set up project structure',
    description: 'Initialize the project with all necessary configurations',
    issue_type: 'task',
    status: 'completed',
    priority: 'high',
    story_points: 5,
    business_value: 8,
    customer_segment: 'enterprise',
    reporter_id: 'user1',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    project_id: '1',
    issue_number: 2,
    title: 'Design kanban board UI',
    description: 'Create mockups for the main board interface',
    issue_type: 'story',
    status: 'in_progress',
    priority: 'high',
    story_points: 8,
    business_value: 9,
    customer_segment: 'enterprise',
    assignee_id: 'user2',
    reporter_id: 'user1',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    project_id: '1',
    issue_number: 3,
    title: 'Implement drag and drop',
    description: 'Add drag and drop functionality to task cards',
    issue_type: 'task',
    status: 'todo',
    priority: 'medium',
    story_points: 13,
    business_value: 7,
    customer_segment: 'consumer',
    reporter_id: 'user1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    project_id: '1',
    issue_number: 4,
    title: 'Add task filtering',
    description: 'Implement filters for tasks by priority and assignee',
    issue_type: 'task',
    status: 'backlog',
    priority: 'low',
    story_points: 3,
    business_value: 5,
    customer_segment: 'enterprise',
    reporter_id: 'user1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const useIssues = (projectId: string, filters?: {
  status?: IssueStatus[];
  assignee?: string;
  priority?: IssuePriority[];
  type?: IssueType[];
  search?: string;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invalidação inteligente de queries relacionadas
  const invalidateRelatedQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['issues'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['productAnalytics'] });
  }, [queryClient]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from Supabase first, fallback to mock data
        try {
          console.log('🔍 useIssues: Attempting to fetch from Supabase...');

          let query = supabase
            .from('issues')
            .select(`
              *,
              assignee:assignee_id(id, email, full_name),
              reporter:reporter_id(id, email, full_name)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

          // Apply filters
          if (filters) {
            if (filters.status && filters.status.length > 0) {
              query = query.in('status', filters.status);
            }

            if (filters.assignee) {
              query = query.eq('assignee_id', filters.assignee);
            }

            if (filters.priority && filters.priority.length > 0) {
              query = query.in('priority', filters.priority);
            }

            if (filters.type && filters.type.length > 0) {
              query = query.in('issue_type', filters.type);
            }

            if (filters.search) {
              const searchTerm = `%${filters.search}%`;
              query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
            }
          }

          const { data, error: supabaseError } = await query;

          if (!supabaseError && data) {
            console.log('✅ useIssues: Fetched from Supabase:', data.length);
            setIssues(data);
            return;
          }
        } catch (supabaseErr) {
          console.log('⚠️ useIssues: Supabase not available, using mock data');
        }

        // Fallback to mock data with filters
        console.log('🔄 useIssues: Using mock data with filters:', filters);
        let filteredIssues = mockIssues.filter(issue => issue.project_id === projectId);

        if (filters) {
          if (filters.status && filters.status.length > 0) {
            filteredIssues = filteredIssues.filter(issue =>
              filters.status!.includes(issue.status)
            );
          }

          if (filters.assignee) {
            filteredIssues = filteredIssues.filter(issue =>
              issue.assignee_id === filters.assignee
            );
          }

          if (filters.priority && filters.priority.length > 0) {
            filteredIssues = filteredIssues.filter(issue =>
              filters.priority!.includes(issue.priority)
            );
          }

          if (filters.type && filters.type.length > 0) {
            filteredIssues = filteredIssues.filter(issue =>
              filters.type!.includes(issue.issue_type)
            );
          }

          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredIssues = filteredIssues.filter(issue =>
              issue.title.toLowerCase().includes(searchLower) ||
              issue.description?.toLowerCase().includes(searchLower)
            );
          }
        }

        setIssues(filteredIssues);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch issues');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchIssues();
    }
  }, [projectId, filters]);

  const createIssue = useCallback(async (issueData: Omit<Issue, 'id' | 'issue_number' | 'created_at' | 'updated_at'>) => {
    try {
      // Try to create in Supabase first
      try {
        console.log('🔄 useIssues: Attempting to create in Supabase...');

        // Get next issue number for this project
        const { data: existingIssues, error: countError } = await supabase
          .from('issues')
          .select('issue_number')
          .eq('project_id', projectId)
          .order('issue_number', { ascending: false })
          .limit(1);

        if (countError) throw countError;

        const nextIssueNumber = existingIssues && existingIssues.length > 0
          ? existingIssues[0].issue_number + 1
          : 1;

        const { data, error } = await supabase
          .from('issues')
          .insert({
            ...issueData,
            issue_number: nextIssueNumber,
            reporter_id: user?.id || issueData.reporter_id,
          })
          .select(`
            *,
            assignee:assignee_id(id, email, full_name),
            reporter:reporter_id(id, email, full_name)
          `)
          .single();

        if (!error && data) {
          console.log('✅ useIssues: Created in Supabase:', data.title);
          setIssues(prev => [data, ...prev]);
          return data;
        }
      } catch (supabaseErr) {
        console.log('⚠️ useIssues: Supabase create failed, using mock data');
      }

      // Fallback to mock data
      const newIssue: Issue = {
        ...issueData,
        id: Date.now().toString(),
        issue_number: mockIssues.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setIssues(prev => [newIssue, ...prev]);
      return newIssue;
    } catch (err) {
      throw new Error('Failed to create issue');
    }
  }, [projectId, user]);

  const updateIssue = useCallback(async (issueId: string, updates: Partial<Issue>) => {
    try {
      // Try to update in Supabase first
      try {
        console.log('🔄 useIssues: Attempting to update in Supabase...');

        const { data, error } = await supabase
          .from('issues')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', issueId)
          .select(`
            *,
            assignee:assignee_id(id, email, full_name),
            reporter:reporter_id(id, email, full_name)
          `)
          .single();

        if (!error && data) {
          console.log('✅ useIssues: Updated in Supabase:', data.title);
          setIssues(prev => prev.map(issue =>
            issue.id === issueId ? data : issue
          ));
          return data;
        }
      } catch (supabaseErr) {
        console.log('⚠️ useIssues: Supabase update failed, using mock data');
      }

      // Fallback to mock data
      setIssues(prev => prev.map(issue =>
        issue.id === issueId
          ? { ...issue, ...updates, updated_at: new Date().toISOString() }
          : issue
      ));
    } catch (err) {
      throw new Error('Failed to update issue');
    }
  }, []);

  const deleteIssue = useCallback(async (issueId: string) => {
    try {
      // Try to delete from Supabase first
      try {
        console.log('🔄 useIssues: Attempting to delete from Supabase...');

        const { error } = await supabase
          .from('issues')
          .delete()
          .eq('id', issueId);

        if (!error) {
          console.log('✅ useIssues: Deleted from Supabase');
          setIssues(prev => prev.filter(issue => issue.id !== issueId));
          return;
        }
      } catch (supabaseErr) {
        console.log('⚠️ useIssues: Supabase delete failed, using mock data');
      }

      // Fallback to mock data
      setIssues(prev => prev.filter(issue => issue.id !== issueId));
    } catch (err) {
      throw new Error('Failed to delete issue');
    }
  }, []);

  const refetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      // In a real implementation, this would refetch from Supabase
      // For now, we'll just simulate a refetch
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    } catch (err) {
      setError('Failed to refetch issues');
      setLoading(false);
    }
  }, []);

  return {
    issues,
    loading,
    error,
    createIssue,
    updateIssue,
    deleteIssue,
    refetchIssues,
  };
};
