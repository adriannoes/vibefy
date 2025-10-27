import { useDroppable } from '@dnd-kit/core';
import { Issue, IssueStatus } from '@/types/issue';
import IssueCard from './board/IssueCard';

interface KanbanColumnProps {
  status: IssueStatus;
  label: string;
  count: number;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  activeId?: string | null;
}

const KanbanColumn = ({
  status,
  label,
  count,
  issues,
  onIssueClick,
  activeId,
}: KanbanColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            {label}
          </h2>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {count}
          </span>
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`flex-1 space-y-3 rounded-lg bg-muted/30 p-3 min-h-[400px] transition-colors ${
          isOver ? 'bg-primary/10 border-2 border-dashed border-primary' : ''
        }`}
      >
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={() => onIssueClick(issue)}
            isDragging={activeId === issue.id}
          />
        ))}
        
        {issues.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No issues
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
