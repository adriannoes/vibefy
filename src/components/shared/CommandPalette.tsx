import { useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { Search, ArrowUp, ArrowDown, Command } from 'lucide-react';

export const CommandPalette = () => {
  const {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    items,
    selectedIndex,
    setSelectedIndex,
    loading
  } = useCommandPalette();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'navigation':
        return '🧭';
      case 'issue':
        return '📋';
      case 'project':
        return '📁';
      case 'action':
        return '⚡';
      default:
        return '🔍';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'issue':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'project':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'action':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, projects, or type a command..."
            className="border-0 shadow-none focus-visible:ring-0 text-base"
          />
          <div className="flex items-center gap-1 ml-3 text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
            <span>navigate</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-2">↵</kbd>
            <span>select</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs ml-2">esc</kbd>
            <span>close</span>
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mb-2" />
              <p className="text-sm">No results found</p>
              <p className="text-xs mt-1">Try searching for issues, projects, or commands</p>
            </div>
          ) : (
            <div className="py-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  onClick={item.action}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex-shrink-0 text-lg">
                    {item.icon || getCategoryIcon(item.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {item.title}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCategoryColor(item.category)}`}
                      >
                        {item.category}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {index === selectedIndex && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowUp className="h-3 w-3" />
                      <ArrowDown className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘K</kbd>
              <span>to open</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {items.length} result{items.length !== 1 ? 's' : ''}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
