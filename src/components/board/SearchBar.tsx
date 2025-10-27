import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { useBoardFilters } from '@/hooks/useBoardFilters';
import { useDebouncedSearch } from '@/hooks/useDebounce';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = 'Search issues...'
}) => {
  const { filters, updateFilter } = useBoardFilters();
  const { searchTerm, debouncedSearchTerm, updateSearch, clearSearch, isSearching } = useDebouncedSearch(filters.search, 300);

  // Update filter when debounced search changes
  useEffect(() => {
    updateFilter('search', debouncedSearchTerm);
  }, [debouncedSearchTerm, updateFilter]);

  const handleClear = () => {
    clearSearch();
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={searchTerm}
        onChange={(e) => updateSearch(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {isSearching && (
        <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
      )}
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default SearchBar;
