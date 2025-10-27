import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onEndReached?: () => void;
  endThreshold?: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onEndReached,
  endThreshold = 50,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastEndReachedRef = useRef(0);

  const totalHeight = items.length * itemHeight;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      items.push({
        index: i,
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          height: itemHeight,
          width: '100%',
        },
      });
    }
    return items;
  }, [visibleRange, itemHeight]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);

    // Check if we need to load more items
    if (onEndReached) {
      const scrollHeight = event.currentTarget.scrollHeight;
      const clientHeight = event.currentTarget.clientHeight;
      const distanceFromBottom = scrollHeight - newScrollTop - clientHeight;

      if (distanceFromBottom < endThreshold) {
        const now = Date.now();
        // Debounce end reached calls
        if (now - lastEndReachedRef.current > 200) {
          lastEndReachedRef.current = now;
          onEndReached();
        }
      }
    }
  }, [onEndReached, endThreshold]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, style }) => (
          <div key={index} style={style}>
            {renderItem(items[index], index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for managing virtualized list state
export function useVirtualizedList<T>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const addItems = useCallback((newItems: T[]) => {
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const prependItems = useCallback((newItems: T[]) => {
    setItems(prev => [...newItems, ...prev]);
  }, []);

  const replaceItems = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const loadMore = useCallback(async (loader: () => Promise<T[]>) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await loader();
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        addItems(newItems);
      }
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, addItems]);

  const reset = useCallback(() => {
    setItems([]);
    setLoading(false);
    setHasMore(true);
  }, []);

  return {
    items,
    loading,
    hasMore,
    addItems,
    prependItems,
    replaceItems,
    clearItems,
    loadMore,
    reset,
  };
}
