import { useState, useEffect } from 'react';
import { AppRole, UserRole } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserRole = (projectId?: string) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUserRole(null);
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (projectId) {
          query = query.eq('project_id', projectId);
        } else {
          query = query.is('project_id', null);
        }

        const { data, error: fetchError } = await query.single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No role found - default to viewer
            setUserRole('viewer');
          } else {
            setError(fetchError.message);
            setUserRole(null);
          }
        } else {
          setUserRole(data?.role || 'viewer');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user, projectId]);

  return {
    userRole,
    loading,
    error,
  };
};
