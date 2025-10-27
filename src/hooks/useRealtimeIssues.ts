import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Issue } from '@/types/issue';

interface UseRealtimeIssuesProps {
  projectId: string;
  onIssueUpdate: (issue: Issue) => void;
  onIssueCreate: (issue: Issue) => void;
  onIssueDelete: (issueId: string) => void;
}

export const useRealtimeIssues = ({
  projectId,
  onIssueUpdate,
  onIssueCreate,
  onIssueDelete
}: UseRealtimeIssuesProps) => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();

  useEffect(() => {
    if (!user || !projectId) return;

    const channel = supabase
      .channel(`issues:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'issues',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          const newIssue = payload.new as Issue;
          onIssueCreate(newIssue);

          // Notify assignee if different from creator
          if (newIssue.assignee_id && newIssue.assignee_id !== newIssue.reporter_id) {
            await createNotification(
              newIssue.assignee_id,
              'issue_assigned',
              'New Issue Assigned',
              `You have been assigned to issue ${newIssue.title}`,
              { issue_id: newIssue.id, project_id: projectId }
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'issues',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          const updatedIssue = payload.new as Issue;
          const oldIssue = payload.old as Issue;
          
          onIssueUpdate(updatedIssue);

          // Notify on status change
          if (oldIssue.status !== updatedIssue.status) {
            const statusMessages = {
              'todo': 'moved to To Do',
              'in_progress': 'started working on',
              'in_review': 'moved to In Review',
              'done': 'completed'
            };

            const message = statusMessages[updatedIssue.status as keyof typeof statusMessages];
            if (message && updatedIssue.assignee_id) {
              await createNotification(
                updatedIssue.assignee_id,
                'issue_updated',
                'Issue Status Changed',
                `Issue ${updatedIssue.title} was ${message}`,
                { issue_id: updatedIssue.id, project_id: projectId }
              );
            }
          }

          // Notify on assignee change
          if (oldIssue.assignee_id !== updatedIssue.assignee_id && updatedIssue.assignee_id) {
            await createNotification(
              updatedIssue.assignee_id,
              'issue_assigned',
              'Issue Assigned to You',
              `You have been assigned to issue ${updatedIssue.title}`,
              { issue_id: updatedIssue.id, project_id: projectId }
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'issues',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          const deletedIssue = payload.old as Issue;
          onIssueDelete(deletedIssue.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, projectId, onIssueUpdate, onIssueCreate, onIssueDelete, createNotification]);
};
