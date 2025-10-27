import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { Issue, IssueStatus } from '@/types/issue';

interface UseIssueDragDropProps {
  issues: Issue[];
  onUpdateIssue: (issueId: string, updates: Partial<Issue>) => Promise<void>;
}

export const useIssueDragDrop = ({ issues, onUpdateIssue }: UseIssueDragDropProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Handle drag over events for visual feedback
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find the issue being dragged
    const draggedIssue = issues.find(issue => issue.id === activeId);
    if (!draggedIssue) {
      setActiveId(null);
      return;
    }

    // Determine the new status based on the drop target
    let newStatus: IssueStatus;
    
    if (overId === 'backlog') {
      newStatus = 'backlog';
    } else if (overId === 'todo') {
      newStatus = 'todo';
    } else if (overId === 'in_progress') {
      newStatus = 'in_progress';
    } else if (overId === 'in_review') {
      newStatus = 'in_review';
    } else if (overId === 'done') {
      newStatus = 'done';
    } else {
      // If dropped on another issue, determine status from the target issue
      const targetIssue = issues.find(issue => issue.id === overId);
      if (targetIssue) {
        newStatus = targetIssue.status;
      } else {
        setActiveId(null);
        return;
      }
    }

    // Only update if the status actually changed
    if (draggedIssue.status !== newStatus) {
      try {
        await onUpdateIssue(activeId, { status: newStatus });
      } catch (error) {
        console.error('Failed to update issue status:', error);
      }
    }

    setActiveId(null);
  };

  const getDndContextProps = () => ({
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
  });

  return {
    activeId,
    getDndContextProps,
  };
};
