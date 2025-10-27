import { useState, useEffect } from 'react';
import { Sprint, SprintStatus } from '@/types/sprint';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

// Mock data for development - will be replaced with real Supabase queries when connected
const mockSprints: Sprint[] = [
  {
    id: '1',
    project_id: '1',
    name: 'Sprint 1',
    goal: 'Complete authentication and project setup',
    start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    project_id: '1',
    name: 'Sprint 2',
    goal: 'Implement Kanban board with drag & drop',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    project_id: '1',
    name: 'Sprint 3',
    goal: 'Add real-time collaboration features',
    status: 'planned',
    created_at: new Date().toISOString(),
  },
];

export const useSprints = (projectId: string) => {
  const { user } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from Supabase first, fallback to mock data
        try {
          console.log('🔍 useSprints: Attempting to fetch from Supabase...');

          const { data, error: supabaseError } = await supabase
            .from('sprints')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

          if (!supabaseError && data) {
            console.log('✅ useSprints: Fetched from Supabase:', data.length);

            // Sort: active > planned > completed
            const sortedSprints = data.sort((a, b) => {
              const statusOrder = { active: 0, planned: 1, completed: 2 };
              return statusOrder[a.status] - statusOrder[b.status];
            });

            setSprints(sortedSprints);
            return;
          }
        } catch (supabaseErr) {
          console.log('⚠️ useSprints: Supabase not available, using mock data');
        }

        // Fallback to mock data
        console.log('🔄 useSprints: Using mock data');
        const filteredSprints = mockSprints.filter(sprint => sprint.project_id === projectId);

        // Sort: active > planned > completed
        filteredSprints.sort((a, b) => {
          const statusOrder = { active: 0, planned: 1, completed: 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        });

        setSprints(filteredSprints);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sprints');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchSprints();
    }
  }, [projectId]);

  const createSprint = async (sprintData: Omit<Sprint, 'id' | 'created_at'>) => {
    try {
      // Try to create in Supabase first
      try {
        console.log('🔄 useSprints: Attempting to create in Supabase...');

        const { data, error } = await supabase
          .from('sprints')
          .insert(sprintData)
          .select()
          .single();

        if (!error && data) {
          console.log('✅ useSprints: Created in Supabase:', data.name);
          setSprints(prev => [data, ...prev]);
          return data;
        }
      } catch (supabaseErr) {
        console.log('⚠️ useSprints: Supabase create failed, using mock data');
      }

      // Fallback to mock data
      const newSprint: Sprint = {
        ...sprintData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };

      setSprints(prev => [newSprint, ...prev]);
      return newSprint;
    } catch (err) {
      throw new Error('Failed to create sprint');
    }
  };

  const updateSprint = async (sprintId: string, updates: Partial<Sprint>) => {
    try {
      // Try to update in Supabase first
      try {
        console.log('🔄 useSprints: Attempting to update in Supabase...');

        const { data, error } = await supabase
          .from('sprints')
          .update(updates)
          .eq('id', sprintId)
          .select()
          .single();

        if (!error && data) {
          console.log('✅ useSprints: Updated in Supabase:', data.name);
          setSprints(prev => prev.map(sprint =>
            sprint.id === sprintId ? data : sprint
          ));
          return data;
        }
      } catch (supabaseErr) {
        console.log('⚠️ useSprints: Supabase update failed, using mock data');
      }

      // Fallback to mock data
      setSprints(prev => prev.map(sprint =>
        sprint.id === sprintId
          ? { ...sprint, ...updates }
          : sprint
      ));
    } catch (err) {
      throw new Error('Failed to update sprint');
    }
  };

  const deleteSprint = async (sprintId: string) => {
    try {
      // Try to delete from Supabase first
      try {
        console.log('🔄 useSprints: Attempting to delete from Supabase...');

        const { error } = await supabase
          .from('sprints')
          .delete()
          .eq('id', sprintId);

        if (!error) {
          console.log('✅ useSprints: Deleted from Supabase');
          setSprints(prev => prev.filter(sprint => sprint.id !== sprintId));
          return;
        }
      } catch (supabaseErr) {
        console.log('⚠️ useSprints: Supabase delete failed, using mock data');
      }

      // Fallback to mock data
      setSprints(prev => prev.filter(sprint => sprint.id !== sprintId));
    } catch (err) {
      throw new Error('Failed to delete sprint');
    }
  };

  const startSprint = async (sprintId: string) => {
    try {
      // Try to start in Supabase first
      try {
        console.log('🔄 useSprints: Attempting to start in Supabase...');

        // First, complete any active sprints
        await supabase
          .from('sprints')
          .update({ status: 'completed' })
          .eq('project_id', projectId)
          .eq('status', 'active');

        // Then start the selected sprint
        const { data, error } = await supabase
          .from('sprints')
          .update({
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks default
          })
          .eq('id', sprintId)
          .select()
          .single();

        if (!error && data) {
          console.log('✅ useSprints: Started in Supabase:', data.name);
          setSprints(prev => prev.map(sprint =>
            sprint.id === sprintId ? data : sprint
          ));
          return data;
        }
      } catch (supabaseErr) {
        console.log('⚠️ useSprints: Supabase start failed, using mock data');
      }

      // Fallback to mock data
      // Deactivate any active sprints
      setSprints(prev => prev.map(sprint =>
        sprint.status === 'active'
          ? { ...sprint, status: 'completed' as SprintStatus }
          : sprint
      ));

      // Start the selected sprint
      await updateSprint(sprintId, {
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks default
      });
    } catch (err) {
      throw new Error('Failed to start sprint');
    }
  };

  const completeSprint = async (sprintId: string) => {
    try {
      // Try to complete in Supabase first
      try {
        console.log('🔄 useSprints: Attempting to complete in Supabase...');

        const { data, error } = await supabase
          .from('sprints')
          .update({
            status: 'completed',
            end_date: new Date().toISOString(),
          })
          .eq('id', sprintId)
          .select()
          .single();

        if (!error && data) {
          console.log('✅ useSprints: Completed in Supabase:', data.name);
          setSprints(prev => prev.map(sprint =>
            sprint.id === sprintId ? data : sprint
          ));
          return data;
        }
      } catch (supabaseErr) {
        console.log('⚠️ useSprints: Supabase complete failed, using mock data');
      }

      // Fallback to mock data
      await updateSprint(sprintId, {
        status: 'completed',
        end_date: new Date().toISOString(),
      });
    } catch (err) {
      throw new Error('Failed to complete sprint');
    }
  };

  const getActiveSprint = () => {
    return sprints.find(sprint => sprint.status === 'active');
  };

  const refetchSprints = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would refetch from Supabase
      // For now, we'll just simulate a refetch
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    } catch (err) {
      setError('Failed to refetch sprints');
      setLoading(false);
    }
  };

  return {
    sprints,
    loading,
    error,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    getActiveSprint,
    refetchSprints,
  };
};
