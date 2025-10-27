import React from 'react';
import { Badge } from '@/components/ui/badge';
import { IssueStatus } from '@/types/issue';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = (status: IssueStatus) => {
    switch (status) {
      case 'backlog':
        return {
          label: 'Backlog',
          variant: 'secondary' as const,
        };
      case 'todo':
        return {
          label: 'To Do',
          variant: 'outline' as const,
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          variant: 'info' as const,
        };
      case 'in_review':
        return {
          label: 'In Review',
          variant: 'warning' as const,
        };
      case 'done':
        return {
          label: 'Done',
          variant: 'success' as const,
        };
      default:
        return {
          label: status,
          variant: 'secondary' as const,
        };
    }
  };

  const { label, variant } = getStatusConfig(status);

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
