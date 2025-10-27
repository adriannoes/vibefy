import React from 'react';
import { RoadmapItem } from '@/types/roadmap';
import RoadmapCard from './RoadmapCard';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface RoadmapTimelineProps {
  items: RoadmapItem[];
  onMoveItem: (itemId: string, category: 'now' | 'next' | 'later') => void;
  onEditItem: (item: RoadmapItem) => void;
  onDeleteItem: (itemId: string) => void;
  onCreateItem: (category: 'now' | 'next' | 'later') => void;
}

interface SortableRoadmapCardProps {
  item: RoadmapItem;
  onEdit: (item: RoadmapItem) => void;
  onDelete: (itemId: string) => void;
}

const SortableRoadmapCard: React.FC<SortableRoadmapCardProps> = ({ item, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-50' : ''}
    >
      <RoadmapCard
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        showActions={true}
      />
    </div>
  );
};

const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  items,
  onMoveItem,
  onEditItem,
  onDeleteItem,
  onCreateItem,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const nowItems = items.filter(item => item.category === 'now');
  const nextItems = items.filter(item => item.category === 'next');
  const laterItems = items.filter(item => item.category === 'later');

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItem = items.find(item => item.id === active.id);
    if (!activeItem) return;

    // Determine target category based on drop zone
    let targetCategory: 'now' | 'next' | 'later' = activeItem.category;
    
    if (over.id === 'now-zone') {
      targetCategory = 'now';
    } else if (over.id === 'next-zone') {
      targetCategory = 'next';
    } else if (over.id === 'later-zone') {
      targetCategory = 'later';
    }

    if (targetCategory !== activeItem.category) {
      onMoveItem(activeItem.id, targetCategory);
    }
  };

  const CategoryColumn: React.FC<{
    title: string;
    category: 'now' | 'next' | 'later';
    items: RoadmapItem[];
    color: string;
  }> = ({ title, category, items, color }) => (
    <div className="flex-1 min-w-0">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              {title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {items.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div
            id={`${category}-zone`}
            className="min-h-[400px] space-y-3"
          >
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableRoadmapCard
                  key={item.id}
                  item={item}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                />
              ))}
            </SortableContext>
            
            {/* Add new item button */}
            <button
              onClick={() => onCreateItem(category)}
              className="w-full p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Add item</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryColumn
          title="Now"
          category="now"
          items={nowItems}
          color="bg-blue-500"
        />
        <CategoryColumn
          title="Next"
          category="next"
          items={nextItems}
          color="bg-purple-500"
        />
        <CategoryColumn
          title="Later"
          category="later"
          items={laterItems}
          color="bg-gray-500"
        />
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="opacity-90">
            <RoadmapCard
              item={items.find(item => item.id === activeId)!}
              showActions={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default RoadmapTimeline;
