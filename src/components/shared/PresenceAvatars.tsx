import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePresence } from '@/hooks/usePresence';

interface PresenceAvatarsProps {
  projectId: string;
  issueId?: string;
  maxVisible?: number;
}

export const PresenceAvatars = ({ 
  projectId, 
  issueId, 
  maxVisible = 3 
}: PresenceAvatarsProps) => {
  const { onlineUsers, viewingUsers } = usePresence({ projectId, issueId });
  
  const users = issueId ? viewingUsers : onlineUsers;
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = Math.max(0, users.length - maxVisible);

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <TooltipProvider key={user.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {user.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-green-500 border border-background rounded-full" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {user.full_name || 'Unknown User'}
                  {issueId ? ' (viewing this issue)' : ' (online)'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      
      {remainingCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-6 w-6 bg-muted border-2 border-background rounded-full">
                <span className="text-xs font-medium text-muted-foreground">
                  +{remainingCount}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {remainingCount} more {issueId ? 'viewing' : 'online'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
