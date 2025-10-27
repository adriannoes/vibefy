import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RoadmapItem } from '@/types/roadmap';
import { 
  Calendar, 
  Users, 
  Target, 
  Clock, 
  MoreHorizontal,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RoadmapCardProps {
  item: RoadmapItem;
  onEdit?: (item: RoadmapItem) => void;
  onDelete?: (itemId: string) => void;
  onMove?: (itemId: string, category: 'now' | 'next' | 'later') => void;
  showActions?: boolean;
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({
  item,
  onEdit,
  onDelete,
  onMove,
  showActions = true,
}) => {
  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <HelpCircle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEffortColor = (effort?: string) => {
    switch (effort) {
      case 'xs':
        return 'bg-green-100 text-green-800';
      case 's':
        return 'bg-blue-100 text-blue-800';
      case 'm':
        return 'bg-yellow-100 text-yellow-800';
      case 'l':
        return 'bg-orange-100 text-orange-800';
      case 'xl':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'now':
        return 'bg-blue-500';
      case 'next':
        return 'bg-purple-500';
      case 'later':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {item.title}
            </CardTitle>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(item)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onMove?.(item.id, 'now')}
                  disabled={item.category === 'now'}
                >
                  Move to Now
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onMove?.(item.id, 'next')}
                  disabled={item.category === 'next'}
                >
                  Move to Next
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onMove?.(item.id, 'later')}
                  disabled={item.category === 'later'}
                >
                  Move to Later
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(item.id)}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Category indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getCategoryColor(item.category)}`} />
            <span className="text-xs font-medium capitalize">{item.category}</span>
          </div>

          {/* Timeline */}
          {item.start_date && item.end_date && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Quarter */}
          {item.quarter && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{item.quarter}</span>
            </div>
          )}

          {/* Metrics row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Business Value */}
              {item.business_value && (
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">{item.business_value}/10</span>
                </div>
              )}

              {/* Confidence */}
              <div className="flex items-center gap-1">
                {getConfidenceIcon(item.confidence)}
                <span className="text-xs capitalize">{item.confidence}</span>
              </div>
            </div>

            {/* Effort */}
            {item.effort_estimate && (
              <Badge 
                variant="secondary" 
                className={`text-xs ${getEffortColor(item.effort_estimate)}`}
              >
                {item.effort_estimate.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Dependencies */}
          {item.dependencies && item.dependencies.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{item.dependencies.length} dependencies</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoadmapCard;
