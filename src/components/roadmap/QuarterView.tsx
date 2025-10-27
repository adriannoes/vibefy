import React from 'react';
import { RoadmapItem, RoadmapQuarter } from '@/types/roadmap';
import RoadmapCard from './RoadmapCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Plus } from 'lucide-react';

interface QuarterViewProps {
  quarters: RoadmapQuarter[];
  items: RoadmapItem[];
  onEditItem: (item: RoadmapItem) => void;
  onDeleteItem: (itemId: string) => void;
  onCreateItem: (quarter: string) => void;
}

const QuarterView: React.FC<QuarterViewProps> = ({
  quarters,
  items,
  onEditItem,
  onDeleteItem,
  onCreateItem,
}) => {
  const getQuarterItems = (quarter: string) => {
    return items.filter(item => item.quarter === quarter);
  };

  const getQuarterProgress = (quarter: string) => {
    const quarterItems = getQuarterItems(quarter);
    if (quarterItems.length === 0) return 0;
    
    const completedItems = quarterItems.filter(item => 
      item.confidence === 'high' && item.business_value && item.business_value >= 7
    );
    
    return Math.round((completedItems.length / quarterItems.length) * 100);
  };

  const getQuarterValue = (quarter: string) => {
    const quarterItems = getQuarterItems(quarter);
    return quarterItems.reduce((sum, item) => sum + (item.business_value || 0), 0);
  };

  return (
    <div className="space-y-8">
      {quarters.map((quarter) => {
        const quarterItems = getQuarterItems(quarter.quarter);
        const progress = getQuarterProgress(quarter.quarter);
        const totalValue = getQuarterValue(quarter.quarter);

        return (
          <Card key={quarter.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    {quarter.quarter}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(quarter.start_date).toLocaleDateString()} - {new Date(quarter.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {totalValue}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Business Value
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {progress}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Progress
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Goals */}
              {quarter.goals && quarter.goals.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Goals
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {quarter.goals.map((goal, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="p-6">
              {quarterItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quarterItems.map((item) => (
                    <RoadmapCard
                      key={item.id}
                      item={item}
                      onEdit={onEditItem}
                      onDelete={onDeleteItem}
                      showActions={true}
                    />
                  ))}
                  
                  {/* Add new item button */}
                  <button
                    onClick={() => onCreateItem(quarter.quarter)}
                    className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground min-h-[200px]"
                  >
                    <Plus className="h-8 w-8" />
                    <span className="text-sm font-medium">Add item to {quarter.quarter}</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No items in {quarter.quarter}</h3>
                  <p className="text-muted-foreground mb-4">
                    Start planning your {quarter.quarter} roadmap
                  </p>
                  <Button onClick={() => onCreateItem(quarter.quarter)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add first item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuarterView;
