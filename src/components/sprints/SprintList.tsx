import React from 'react';
import { Sprint } from '@/types/sprint';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Play, CheckCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SprintListProps {
  sprints: Sprint[];
  onStartSprint: (sprintId: string) => void;
  onCompleteSprint: (sprintId: string) => void;
  onEditSprint: (sprint: Sprint) => void;
  onDeleteSprint: (sprintId: string) => void;
  onViewSprint: (sprint: Sprint) => void;
}

const SprintList: React.FC<SprintListProps> = ({
  sprints,
  onStartSprint,
  onCompleteSprint,
  onEditSprint,
  onDeleteSprint,
  onViewSprint,
}) => {
  const getStatusBadge = (status: Sprint['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'planned':
        return <Badge variant="outline">Planned</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
    }
  };

  const getDaysRemaining = (sprint: Sprint) => {
    if (!sprint.end_date || sprint.status !== 'active') return null;
    const days = differenceInDays(new Date(sprint.end_date), new Date());
    return days;
  };

  const getSprintDuration = (sprint: Sprint) => {
    if (!sprint.start_date || !sprint.end_date) return null;
    const days = differenceInDays(new Date(sprint.end_date), new Date(sprint.start_date));
    return days;
  };

  return (
    <div className="space-y-4">
      {sprints.map((sprint) => {
        const daysRemaining = getDaysRemaining(sprint);
        const duration = getSprintDuration(sprint);

        return (
          <Card 
            key={sprint.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewSprint(sprint)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{sprint.name}</CardTitle>
                    {getStatusBadge(sprint.status)}
                  </div>
                  {sprint.goal && (
                    <CardDescription className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {sprint.goal}
                    </CardDescription>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEditSprint(sprint);
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {sprint.status === 'planned' && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onStartSprint(sprint.id);
                      }}>
                        <Play className="mr-2 h-4 w-4" />
                        Start Sprint
                      </DropdownMenuItem>
                    )}
                    {sprint.status === 'active' && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onCompleteSprint(sprint.id);
                      }}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Sprint
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSprint(sprint.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  {sprint.start_date && sprint.end_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(sprint.start_date), 'MMM d')} - {format(new Date(sprint.end_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {duration && (
                    <Badge variant="outline" className="text-xs">
                      {duration} days
                    </Badge>
                  )}
                </div>
                
                {daysRemaining !== null && sprint.status === 'active' && (
                  <div className="flex items-center gap-2">
                    {daysRemaining > 0 ? (
                      <Badge variant="info" className="text-xs">
                        {daysRemaining} days remaining
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-xs">
                        Overdue by {Math.abs(daysRemaining)} days
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {sprints.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No sprints yet</h3>
            <p>Create your first sprint to start planning your work</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintList;
