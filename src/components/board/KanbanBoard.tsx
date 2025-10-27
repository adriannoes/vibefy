import React, { useMemo } from 'react';
import { DndContext } from '@dnd-kit/core';
import { Issue, IssueStatus } from '@/types/issue';
import KanbanColumn from '../KanbanColumn';
import { useIssueDragDrop } from '@/hooks/useIssueDragDrop';

interface KanbanBoardProps {
  issues: Issue[];
  onUpdateIssue: (issueId: string, updates: Partial<Issue>) => Promise<void>;
  onIssueClick: (issue: Issue) => void;
  loading?: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = React.memo(({
  issues,
  onUpdateIssue,
  onIssueClick,
  loading = false,
}) => {
  const { activeId, getDndContextProps } = useIssueDragDrop({
    issues,
    onUpdateIssue,
  });

  const columns = useMemo((): { status: IssueStatus; label: string; count: number }[] => [
    {
      status: 'backlog',
      label: 'Backlog',
      count: issues.filter(issue => issue.status === 'backlog').length
    },
    {
      status: 'todo',
      label: 'To Do',
      count: issues.filter(issue => issue.status === 'todo').length
    },
    {
      status: 'in_progress',
      label: 'In Progress',
      count: issues.filter(issue => issue.status === 'in_progress').length
    },
    {
      status: 'in_review',
      label: 'In Review',
      count: issues.filter(issue => issue.status === 'in_review').length
    },
    {
      status: 'done',
      label: 'Done',
      count: issues.filter(issue => issue.status === 'done').length
    },
  ], [issues]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => (
          <div key={column.status} className="space-y-4">
            <div className="h-6 bg-muted animate-pulse rounded" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext {...getDndContextProps()}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            label={column.label}
            count={column.count}
            issues={issues.filter(issue => issue.status === column.status)}
            onIssueClick={onIssueClick}
            activeId={activeId}
          />
        ))}
      </div>
    </DndContext>
  );
});

KanbanBoard.displayName = 'KanbanBoard';

export default KanbanBoard;
