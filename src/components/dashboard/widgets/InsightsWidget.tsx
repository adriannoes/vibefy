import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardWidget } from '@/types/dashboard';

interface InsightsWidgetProps {
  widget: DashboardWidget;
  data: any;
}

export const InsightsWidget: React.FC<InsightsWidgetProps> = ({ widget, data }) => {
  if (!data?.insights || data.insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum insight disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {data.insights.slice(0, widget.config.maxItems || 5).map((insight: any, index: number) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-tight">
                    {insight.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold">{insight.value}</span>
                    {insight.trend && (
                      <div className="flex items-center gap-1">
                        {insight.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : insight.trend === 'down' ? (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {insight.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.insights.length > (widget.config.maxItems || 5) && (
          <div className="text-center mt-3">
            <Badge variant="outline" className="text-xs">
              +{data.insights.length - (widget.config.maxItems || 5)} mais insights
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
