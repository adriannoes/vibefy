import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DashboardWidget } from '@/types/dashboard';
import { useDataChangeAnimation } from '@/hooks/useWidgetAnimation';
import { cn } from '@/lib/utils';

interface MetricWidgetProps {
  widget: DashboardWidget;
  data: any;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({ widget, data }) => {
  const animation = useDataChangeAnimation(data, {
    animationType: 'fadeIn',
    duration: 500,
  });
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!data) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Dados não disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className={cn("p-4", animation.getContainerClasses())}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{data.formatted}</div>
            <div className="text-sm text-muted-foreground">
              {widget.config.metricField || 'Total'}
            </div>
          </div>

          {data.trend && widget.config.showTrend && (
            <div className="flex items-center gap-1">
              {getTrendIcon(data.trend)}
              <span className={cn("text-sm font-medium", getTrendColor(data.trend))}>
                {data.trend === 'up' ? '+' : data.trend === 'down' ? '-' : ''}
                {Math.abs(data.trendValue || 0).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {widget.description && (
          <p className="text-xs text-muted-foreground mt-2">
            {widget.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
