import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X, Tag } from 'lucide-react';
import { FeedbackStatus, FeedbackPriority, FeedbackSentiment } from '@/types/feedback';

interface FeedbackFiltersProps {
  status: FeedbackStatus | 'all';
  priority: FeedbackPriority | 'all';
  sentiment: FeedbackSentiment | 'all';
  tags: string[];
  onStatusChange: (status: FeedbackStatus | 'all') => void;
  onPriorityChange: (priority: FeedbackPriority | 'all') => void;
  onSentimentChange: (sentiment: FeedbackSentiment | 'all') => void;
  onTagsChange: (tags: string[]) => void;
}

const statusOptions: { value: FeedbackStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In Review' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions: { value: FeedbackPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const sentimentOptions: { value: FeedbackSentiment | 'all'; label: string }[] = [
  { value: 'all', label: 'All Sentiments' },
  { value: 'very_negative', label: 'Very Negative' },
  { value: 'negative', label: 'Negative' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'positive', label: 'Positive' },
  { value: 'very_positive', label: 'Very Positive' },
];

// Mock available tags - in real app, this would come from the database
const availableTags = [
  'ui', 'ux', 'performance', 'bug', 'feature', 'dashboard', 'mobile',
  'export', 'import', 'api', 'security', 'usability', 'dark-mode',
  'notifications', 'reports', 'integrations', 'onboarding'
];

export const FeedbackFilters: React.FC<FeedbackFiltersProps> = ({
  status,
  priority,
  sentiment,
  tags,
  onStatusChange,
  onPriorityChange,
  onSentimentChange,
  onTagsChange,
}) => {
  const activeFiltersCount = [
    status !== 'all' ? 1 : 0,
    priority !== 'all' ? 1 : 0,
    sentiment !== 'all' ? 1 : 0,
    tags.length > 0 ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  const handleTagToggle = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter(t => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  const clearAllFilters = () => {
    onStatusChange('all');
    onPriorityChange('all');
    onSentimentChange('all');
    onTagsChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status Filter */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sentiment Filter */}
      <Select value={sentiment} onValueChange={onSentimentChange}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sentimentOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tags Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
            {tags.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {tags.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter by Tags</h4>
              {tags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTagsChange([])}
                  className="h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={tags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  />
                  <label
                    htmlFor={`tag-${tag}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tag}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 ml-2 pl-2 border-l">
          <span className="text-sm text-muted-foreground">
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
