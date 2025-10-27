import { useState, useCallback } from 'react';
import { IssueStatus, IssuePriority, IssueType } from '@/types/issue';

interface BoardFilters {
  status: IssueStatus[];
  assignee: string | null;
  priority: IssuePriority[];
  type: IssueType[];
  search: string;
}

const defaultFilters: BoardFilters = {
  status: [],
  assignee: null,
  priority: [],
  type: [],
  search: '',
};

export const useBoardFilters = () => {
  const [filters, setFilters] = useState<BoardFilters>(defaultFilters);

  const updateFilter = useCallback(<K extends keyof BoardFilters>(
    key: K,
    value: BoardFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    return value !== null;
  });

  const getFilterCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.assignee) count++;
    if (filters.priority.length > 0) count++;
    if (filters.type.length > 0) count++;
    if (filters.search) count++;
    return count;
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    getFilterCount,
  };
};
