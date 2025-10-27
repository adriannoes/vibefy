import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  X, 
  User, 
  AlertTriangle, 
  Bug, 
  FileText, 
  Zap,
  ChevronDown
} from 'lucide-react';
import { IssueStatus, IssuePriority, IssueType } from '@/types/issue';
import { useBoardFilters } from '@/hooks/useBoardFilters';

interface FilterBarProps {
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ className }) => {
  const { 
    filters, 
    updateFilter, 
    clearFilters, 
    hasActiveFilters, 
    getFilterCount 
  } = useBoardFilters();

  const statusOptions: { value: IssueStatus; label: string }[] = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'done', label: 'Done' },
  ];

  const priorityOptions: { value: IssuePriority; label: string }[] = [
    { value: 'lowest', label: 'Lowest' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'highest', label: 'Highest' },
  ];

  const typeOptions: { value: IssueType; label: string; icon: React.ReactNode }[] = [
    { value: 'story', label: 'Story', icon: <FileText className="h-4 w-4" /> },
    { value: 'task', label: 'Task', icon: <Zap className="h-4 w-4" /> },
    { value: 'bug', label: 'Bug', icon: <Bug className="h-4 w-4" /> },
    { value: 'epic', label: 'Epic', icon: <AlertTriangle className="h-4 w-4" /> },
  ];

  const toggleArrayFilter = <T,>(
    currentValues: T[],
    value: T,
    updateFn: (values: T[]) => void
  ) => {
    if (currentValues.includes(value)) {
      updateFn(currentValues.filter(v => v !== value));
    } else {
      updateFn([...currentValues, value]);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters</span>
        {hasActiveFilters && (
          <Badge variant="secondary" className="text-xs">
            {getFilterCount()}
          </Badge>
        )}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Status Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            Status
            {filters.status.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.status.length}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filter by Status</Label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={filters.status.includes(option.value)}
                    onCheckedChange={() => 
                      toggleArrayFilter(filters.status, option.value, (values) => 
                        updateFilter('status', values)
                      )
                    }
                  />
                  <Label 
                    htmlFor={`status-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Priority Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            Priority
            {filters.priority.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.priority.length}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filter by Priority</Label>
            <div className="space-y-2">
              {priorityOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${option.value}`}
                    checked={filters.priority.includes(option.value)}
                    onCheckedChange={() => 
                      toggleArrayFilter(filters.priority, option.value, (values) => 
                        updateFilter('priority', values)
                      )
                    }
                  />
                  <Label 
                    htmlFor={`priority-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Type Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            Type
            {filters.type.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.type.length}
              </Badge>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filter by Type</Label>
            <div className="space-y-2">
              {typeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${option.value}`}
                    checked={filters.type.includes(option.value)}
                    onCheckedChange={() => 
                      toggleArrayFilter(filters.type, option.value, (values) => 
                        updateFilter('type', values)
                      )
                    }
                  />
                  <Label 
                    htmlFor={`type-${option.value}`}
                    className="text-sm cursor-pointer flex items-center gap-2"
                  >
                    {option.icon}
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Assignee Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <User className="h-4 w-4" />
            Assignee
            {filters.assignee && (
              <Badge variant="secondary" className="text-xs">
                1
              </Badge>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filter by Assignee</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="assignee-none"
                  checked={filters.assignee === null}
                  onCheckedChange={(checked) => 
                    updateFilter('assignee', checked ? null : undefined)
                  }
                />
                <Label htmlFor="assignee-none" className="text-sm cursor-pointer">
                  Unassigned
                </Label>
              </div>
              {/* TODO: Add actual users from props or context */}
              <div className="text-xs text-muted-foreground">
                User list will be loaded from project members
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear all
        </Button>
      )}
    </div>
  );
};

export default FilterBar;
