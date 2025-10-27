import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ValueEffortMatrix as ValueEffortMatrixType, PrioritizationScore } from '@/types/prioritization';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft
} from 'lucide-react';

interface ValueEffortMatrixProps {
  items: PrioritizationScore[];
  onItemMove?: (itemId: string, matrix: ValueEffortMatrixType) => void;
  onItemClick?: (item: PrioritizationScore) => void;
}

interface DraggableItemProps {
  item: PrioritizationScore;
  onClick?: (item: PrioritizationScore) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: item.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-2 bg-card border rounded-lg cursor-grab hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={() => onClick?.(item)}
    >
      <div className="text-sm font-medium">{item.item_id}</div>
      <div className="text-xs text-muted-foreground">
        {item.rice_score?.score || item.custom_score || 0} points
      </div>
    </div>
  );
};

interface DropZoneProps {
  quadrant: 'quick_wins' | 'major_projects' | 'fill_ins' | 'questionable';
  items: PrioritizationScore[];
  onItemClick?: (item: PrioritizationScore) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ quadrant, items, onItemClick }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: quadrant,
  });

  const getQuadrantConfig = (quadrant: string) => {
    switch (quadrant) {
      case 'quick_wins':
        return {
          title: 'Quick Wins',
          description: 'High value, low effort',
          icon: <ArrowUpRight className="h-5 w-5" />,
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
        };
      case 'major_projects':
        return {
          title: 'Major Projects',
          description: 'High value, high effort',
          icon: <ArrowUpLeft className="h-5 w-5" />,
          color: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
        };
      case 'fill_ins':
        return {
          title: 'Fill-ins',
          description: 'Low value, low effort',
          icon: <ArrowDownRight className="h-5 w-5" />,
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
        };
      case 'questionable':
        return {
          title: 'Questionable',
          description: 'Low value, high effort',
          icon: <ArrowDownLeft className="h-5 w-5" />,
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
        };
      default:
        return {
          title: 'Unknown',
          description: '',
          icon: <Target className="h-5 w-5" />,
          color: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
        };
    }
  };

  const config = getQuadrantConfig(quadrant);

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-colors ${
        isOver ? 'border-primary bg-primary/5' : config.color
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {config.icon}
        <h3 className={`font-medium ${config.textColor}`}>{config.title}</h3>
        <Badge variant="secondary" className="text-xs">
          {items.length}
        </Badge>
      </div>
      <p className={`text-xs ${config.textColor} mb-4`}>{config.description}</p>
      
      <div className="space-y-2">
        {items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
};

const ValueEffortMatrix: React.FC<ValueEffortMatrixProps> = ({
  items,
  onItemMove,
  onItemClick,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const quickWins = items.filter(item => item.value_effort?.quadrant === 'quick_wins');
  const majorProjects = items.filter(item => item.value_effort?.quadrant === 'major_projects');
  const fillIns = items.filter(item => item.value_effort?.quadrant === 'fill_ins');
  const questionable = items.filter(item => item.value_effort?.quadrant === 'questionable');

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !onItemMove) return;

    const item = items.find(i => i.id === active.id);
    if (!item) return;

    // Determine new quadrant based on drop zone
    const newQuadrant = over.id as 'quick_wins' | 'major_projects' | 'fill_ins' | 'questionable';
    
    // Create new value/effort matrix based on quadrant
    let newMatrix: ValueEffortMatrixType;
    switch (newQuadrant) {
      case 'quick_wins':
        newMatrix = { value: 'high', effort: 's', quadrant: 'quick_wins' };
        break;
      case 'major_projects':
        newMatrix = { value: 'high', effort: 'l', quadrant: 'major_projects' };
        break;
      case 'fill_ins':
        newMatrix = { value: 'low', effort: 's', quadrant: 'fill_ins' };
        break;
      case 'questionable':
        newMatrix = { value: 'low', effort: 'l', quadrant: 'questionable' };
        break;
      default:
        return;
    }

    onItemMove(item.id, newMatrix);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Value vs Effort Matrix
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag items to prioritize based on business value and implementation effort
        </p>
      </CardHeader>
      <CardContent>
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 gap-4">
            {/* High Value, High Effort */}
            <DropZone
              quadrant="major_projects"
              items={majorProjects}
              onItemClick={onItemClick}
            />
            
            {/* High Value, Low Effort */}
            <DropZone
              quadrant="quick_wins"
              items={quickWins}
              onItemClick={onItemClick}
            />
            
            {/* Low Value, High Effort */}
            <DropZone
              quadrant="questionable"
              items={questionable}
              onItemClick={onItemClick}
            />
            
            {/* Low Value, Low Effort */}
            <DropZone
              quadrant="fill_ins"
              items={fillIns}
              onItemClick={onItemClick}
            />
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-90">
                <DraggableItem
                  item={items.find(item => item.id === activeId)!}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Legend */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-3">Matrix Legend</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Quick Wins: High value, low effort</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Major Projects: High value, high effort</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Fill-ins: Low value, low effort</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Questionable: Low value, high effort</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValueEffortMatrix;
