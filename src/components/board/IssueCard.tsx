import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Issue, IssuePriority } from '@/types/issue';
import StatusBadge from '@/components/shared/StatusBadge';
import { AlertCircle, ArrowUp, Minus, Clock, User } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
  isDragging?: boolean;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick, isDragging = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging: isDndDragging } = useDraggable({
    id: issue.id,
  });

  const getPriorityIcon = (priority: IssuePriority) => {
    switch (priority) {
      case 'highest':
      case 'high':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <ArrowUp className="h-4 w-4 text-orange-500" />;
      case 'low':
      case 'lowest':
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case 'highest':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      case 'lowest':
        return 'outline';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group
        ${isDragging || isDndDragging ? 'opacity-50 scale-95' : ''}
        ${isDragging ? 'shadow-lg' : ''}
      `}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {issue.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground font-mono">
                #{issue.issue_number}
              </span>
              <Badge variant="outline" className="text-xs">
                {issue.issue_type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {getPriorityIcon(issue.priority)}
          </div>
        </div>
        
        {issue.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {issue.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={getPriorityColor(issue.priority)} className="text-xs">
              {issue.priority}
            </Badge>
            {issue.story_points && (
              <Badge variant="outline" className="text-xs">
                {issue.story_points} pts
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {issue.assignee_id && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <Avatar className="h-5 w-5">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {getInitials('Assignee')}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDate(issue.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default IssueCard;
