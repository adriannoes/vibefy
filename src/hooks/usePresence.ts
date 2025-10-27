import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PresenceUser {
  id: string;
  full_name?: string;
  avatar_url?: string;
  last_seen: string;
  is_online: boolean;
}

interface UsePresenceProps {
  projectId: string;
  issueId?: string;
}

export const usePresence = ({ projectId, issueId }: UsePresenceProps) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [viewingUsers, setViewingUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!user || !projectId) return;

    const channelName = issueId ? `presence:${projectId}:${issueId}` : `presence:${projectId}`;
    
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    })
    .on('presence', { event: 'sync' }, () => {
      const newState = channel.presenceState();
      const users = Object.values(newState).flat() as PresenceUser[];
      
      if (issueId) {
        setViewingUsers(users);
      } else {
        setOnlineUsers(users);
      }
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      const newUser = newPresences[0];
      if (newUser && newUser.id !== user.id) {
        if (issueId) {
          setViewingUsers(prev => [...prev, newUser]);
        } else {
          setOnlineUsers(prev => [...prev, newUser]);
        }
      }
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      const leftUser = leftPresences[0];
      if (leftUser) {
        if (issueId) {
          setViewingUsers(prev => prev.filter(u => u.id !== leftUser.id));
        } else {
          setOnlineUsers(prev => prev.filter(u => u.id !== leftUser.id));
        }
      }
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          id: user.id,
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
          last_seen: new Date().toISOString(),
          is_online: true,
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, projectId, issueId]);

  return {
    onlineUsers,
    viewingUsers,
  };
};
