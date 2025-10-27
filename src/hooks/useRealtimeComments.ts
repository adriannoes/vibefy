import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

interface Comment {
  id: string;
  issue_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface UseRealtimeCommentsProps {
  issueId: string;
  onCommentCreate: (comment: Comment) => void;
  onCommentUpdate: (comment: Comment) => void;
  onCommentDelete: (commentId: string) => void;
}

export const useRealtimeComments = ({
  issueId,
  onCommentCreate,
  onCommentUpdate,
  onCommentDelete
}: UseRealtimeCommentsProps) => {
  const { user } = useAuth();
  const { createNotification } = useNotifications();

  useEffect(() => {
    if (!user || !issueId) return;

    const channel = supabase
      .channel(`comments:${issueId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `issue_id=eq.${issueId}`
        },
        async (payload) => {
          const newComment = payload.new as Comment;
          onCommentCreate(newComment);

          // Get issue details for notification
          const { data: issue } = await supabase
            .from('issues')
            .select('title, assignee_id, reporter_id')
            .eq('id', issueId)
            .single();

          if (issue) {
            // Notify assignee if different from comment author
            if (issue.assignee_id && issue.assignee_id !== newComment.author_id) {
              await createNotification(
                issue.assignee_id,
                'issue_commented',
                'New Comment on Issue',
                `Someone commented on issue ${issue.title}`,
                { issue_id: issueId, comment_id: newComment.id }
              );
            }

            // Notify reporter if different from comment author and assignee
            if (issue.reporter_id && 
                issue.reporter_id !== newComment.author_id && 
                issue.reporter_id !== issue.assignee_id) {
              await createNotification(
                issue.reporter_id,
                'issue_commented',
                'New Comment on Your Issue',
                `Someone commented on your issue ${issue.title}`,
                { issue_id: issueId, comment_id: newComment.id }
              );
            }

            // Check for mentions (@username)
            const mentionRegex = /@(\w+)/g;
            const mentions = newComment.content.match(mentionRegex);
            
            if (mentions) {
              // In a real implementation, you'd look up users by username
              // For now, we'll just log the mentions
              console.log('Mentions found:', mentions);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `issue_id=eq.${issueId}`
        },
        (payload) => {
          const updatedComment = payload.new as Comment;
          onCommentUpdate(updatedComment);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `issue_id=eq.${issueId}`
        },
        (payload) => {
          const deletedComment = payload.old as Comment;
          onCommentDelete(deletedComment.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, issueId, onCommentCreate, onCommentUpdate, onCommentDelete, createNotification]);
};
