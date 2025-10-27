import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Mail,
  Tag,
  ExternalLink
} from 'lucide-react';
import { CustomerFeedback, FeedbackStatus, FeedbackPriority } from '@/types/feedback';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface FeedbackCardProps {
  feedback: CustomerFeedback;
  onUpdate: (id: string, updates: Partial<CustomerFeedback>) => void;
  onDelete: (id: string) => void;
  onVote: (id: string, voteType: 'up' | 'down') => void;
}

const statusConfig = {
  new: { label: 'New', icon: MessageSquare, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  in_review: { label: 'In Review', icon: Clock, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  acknowledged: { label: 'Acknowledged', icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  in_progress: { label: 'In Progress', icon: AlertTriangle, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  resolved: { label: 'Resolved', icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  closed: { label: 'Closed', icon: CheckCircle, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
};

const sentimentConfig = {
  very_negative: { emoji: '😡', color: 'text-red-500' },
  negative: { emoji: '😞', color: 'text-orange-500' },
  neutral: { emoji: '😐', color: 'text-gray-500' },
  positive: { emoji: '🙂', color: 'text-blue-500' },
  very_positive: { emoji: '😊', color: 'text-green-500' },
};

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  onUpdate,
  onDelete,
  onVote,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const StatusIcon = statusConfig[feedback.status].icon;
  const sentiment = sentimentConfig[feedback.sentiment];

  const handleStatusChange = (status: FeedbackStatus) => {
    onUpdate(feedback.id, { status });
  };

  const handlePriorityChange = (priority: FeedbackPriority) => {
    onUpdate(feedback.id, { priority });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      feedback.status === 'new' && "ring-2 ring-blue-200 dark:ring-blue-800",
      feedback.priority === 'critical' && "border-l-4 border-l-red-500"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Customer Avatar */}
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={feedback.customer_name} />
              <AvatarFallback>{getInitials(feedback.customer_name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Title and Sentiment */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{feedback.title}</h3>
                <span className={cn("text-lg", sentiment.color)} title={feedback.sentiment}>
                  {sentiment.emoji}
                </span>
              </div>

              {/* Customer Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                {feedback.customer_name && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{feedback.customer_name}</span>
                  </div>
                )}
                {feedback.customer_email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{feedback.customer_email}</span>
                  </div>
                )}
                {feedback.customer_segment && (
                  <Badge variant="outline" className="text-xs">
                    {feedback.customer_segment}
                  </Badge>
                )}
                <span>{formatDate(feedback.created_at)}</span>
              </div>

              {/* Status and Priority */}
              <div className="flex items-center gap-2">
                <Badge className={statusConfig[feedback.status].color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[feedback.status].label}
                </Badge>
                <Badge variant="outline" className={priorityConfig[feedback.priority].color}>
                  {priorityConfig[feedback.priority].label}
                </Badge>
                {feedback.source && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {feedback.source}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Vote buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(feedback.id, 'up')}
                className="h-8 w-8 p-0"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[2rem] text-center">
                {feedback.votes}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(feedback.id, 'down')}
                className="h-8 w-8 p-0"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? 'Collapse' : 'Expand'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange('acknowledged')}>
                  Mark as Acknowledged
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('resolved')}>
                  Mark as Resolved
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handlePriorityChange('low')}>
                  Set Priority: Low
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('medium')}>
                  Set Priority: Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('high')}>
                  Set Priority: High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePriorityChange('critical')}>
                  Set Priority: Critical
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(feedback.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Feedback
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Content */}
        <div className="mb-3">
          <p className={cn(
            "text-sm leading-relaxed",
            !isExpanded && "line-clamp-3"
          )}>
            {feedback.content}
          </p>
          {feedback.content.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </Button>
          )}
        </div>

        {/* Tags */}
        {feedback.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {feedback.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Types */}
        <div className="flex items-center gap-2">
          {feedback.feature_request && (
            <Badge variant="outline" className="text-xs">
              Feature Request
            </Badge>
          )}
          {feedback.bug_report && (
            <Badge variant="outline" className="text-xs">
              Bug Report
            </Badge>
          )}
          {feedback.general_feedback && (
            <Badge variant="outline" className="text-xs">
              General Feedback
            </Badge>
          )}
        </div>

        {/* Linked Items */}
        {(feedback.linked_features?.length || feedback.linked_issues?.length) && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {feedback.linked_features && feedback.linked_features.length > 0 && (
                <div className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  <span>{feedback.linked_features.length} linked feature{feedback.linked_features.length > 1 ? 's' : ''}</span>
                </div>
              )}
              {feedback.linked_issues && feedback.linked_issues.length > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>{feedback.linked_issues.length} linked issue{feedback.linked_issues.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
