import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tag, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DashboardWidget } from '@/types/dashboard';

interface ThemesWidgetProps {
  widget: DashboardWidget;
  data: any;
}

export const ThemesWidget: React.FC<ThemesWidgetProps> = ({ widget, data }) => {
  if (!data?.themes || data.themes.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum tema identificado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Sort themes by count descending
  const sortedThemes = [...data.themes].sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {sortedThemes.slice(0, widget.config.maxItems || 8).map((theme: any, index: number) => (
            <div key={theme.name || index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{theme.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {theme.trend && getTrendIcon(theme.trend)}
                  <Badge variant="secondary" className="text-xs">
                    {theme.count}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{theme.percentage?.toFixed(1)}% dos feedbacks</span>
                  <span>{theme.count} ocorrências</span>
                </div>
                <Progress value={theme.percentage || 0} className="h-2" />
              </div>
            </div>
          ))}
        </div>

        {sortedThemes.length > (widget.config.maxItems || 8) && (
          <div className="text-center mt-4">
            <Badge variant="outline" className="text-xs">
              +{sortedThemes.length - (widget.config.maxItems || 8)} mais temas
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
