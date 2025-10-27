import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { HypothesisStatus, HypothesisType } from '@/types/hypothesis';

interface HypothesisFiltersProps {
  status: HypothesisStatus | 'all';
  type: HypothesisType | 'all';
  searchTerm: string;
  onStatusChange: (status: HypothesisStatus | 'all') => void;
  onTypeChange: (type: HypothesisType | 'all') => void;
  onSearchChange: (search: string) => void;
}

const statusOptions: { value: HypothesisStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'proposed', label: 'Proposed' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_experiment', label: 'In Experiment' },
  { value: 'validated', label: 'Validated' },
  { value: 'invalidated', label: 'Invalidated' },
  { value: 'cancelled', label: 'Cancelled' },
];

const typeOptions: { value: HypothesisType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'problem_validation', label: 'Problem Validation' },
  { value: 'solution_validation', label: 'Solution Validation' },
  { value: 'market_validation', label: 'Market Validation' },
  { value: 'technical_validation', label: 'Technical Validation' },
];

export const HypothesisFilters: React.FC<HypothesisFiltersProps> = ({
  status,
  type,
  searchTerm,
  onStatusChange,
  onTypeChange,
  onSearchChange,
}) => {
  const activeFiltersCount = [
    status !== 'all' ? 1 : 0,
    type !== 'all' ? 1 : 0,
    searchTerm.trim() ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  const clearAllFilters = () => {
    onStatusChange('all');
    onTypeChange('all');
    onSearchChange('');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search hypotheses..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-40">
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

      {/* Type Filter */}
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {typeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
          </Badge>
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
