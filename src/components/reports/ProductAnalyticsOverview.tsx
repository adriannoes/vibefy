import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Clock, Users, Star } from 'lucide-react';
import type { ProductKPIs } from '@/types/analytics';

interface ProductAnalyticsOverviewProps {
  kpis: ProductKPIs;
  isLoading?: boolean;
}

export function ProductAnalyticsOverview({ kpis, isLoading }: ProductAnalyticsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Business Value',
      value: kpis.totalBusinessValue,
      format: 'number',
      icon: TrendingUp,
      trend: '+12%',
      trendDirection: 'up' as const,
      description: 'Cumulative value delivered',
    },
    {
      title: 'Average Business Value',
      value: kpis.averageBusinessValue,
      format: 'number',
      icon: Star,
      trend: '+8%',
      trendDirection: 'up' as const,
      description: 'Per feature/issue',
    },
    {
      title: 'Roadmap Health Score',
      value: kpis.roadmapHealthScore,
      format: 'percentage',
      icon: Target,
      trend: '+5%',
      trendDirection: 'up' as const,
      description: 'Overall delivery health',
    },
    {
      title: 'OKR Completion Rate',
      value: kpis.okrCompletionRate,
      format: 'percentage',
      icon: Target,
      trend: '+15%',
      trendDirection: 'up' as const,
      description: 'Objectives achieved',
    },
    {
      title: 'Feature Delivery Rate',
      value: kpis.featureDeliveryRate,
      format: 'percentage',
      icon: TrendingUp,
      trend: '+3%',
      trendDirection: 'up' as const,
      description: 'On-time delivery',
    },
    {
      title: 'Customer Satisfaction',
      value: kpis.customerSatisfactionScore,
      format: 'rating',
      icon: Star,
      trend: '+0.2',
      trendDirection: 'up' as const,
      description: 'Out of 5.0',
    },
    {
      title: 'Time to Market',
      value: kpis.timeToMarket,
      format: 'days',
      icon: Clock,
      trend: '-2 days',
      trendDirection: 'down' as const,
      description: 'Average delivery time',
    },
    {
      title: 'Product Velocity',
      value: kpis.productVelocity,
      format: 'number',
      icon: TrendingUp,
      trend: '+18%',
      trendDirection: 'up' as const,
      description: 'Value per sprint',
    },
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'rating':
        return value.toFixed(1);
      case 'days':
        return `${Math.round(value)} days`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const getTrendColor = (direction: 'up' | 'down') => {
    return direction === 'up' ? 'text-success' : 'text-destructive';
  };

  const getTrendIcon = (direction: 'up' | 'down') => {
    return direction === 'up' ? TrendingUp : TrendingDown;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Product Analytics Overview</h2>
        <p className="text-muted-foreground">
          Key performance indicators for product success and delivery health
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = getTrendIcon(kpi.trendDirection);
          
          return (
            <Card key={kpi.title} variant="default" className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatValue(kpi.value, kpi.format)}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <div className={`flex items-center space-x-1 ${getTrendColor(kpi.trendDirection)}`}>
                    <TrendIcon className="h-3 w-3" />
                    <span>{kpi.trend}</span>
                  </div>
                  <span>vs last period</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span>Business Value Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">This Quarter</span>
                <Badge variant="success">{kpis.totalBusinessValue}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Per Sprint</span>
                <Badge variant="default">{Math.round(kpis.productVelocity)}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average per Feature</span>
                <Badge variant="secondary">{Math.round(kpis.averageBusinessValue)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-info" />
              <span>Delivery Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Roadmap Score</span>
                <Badge variant={kpis.roadmapHealthScore >= 80 ? 'success' : kpis.roadmapHealthScore >= 60 ? 'warning' : 'destructive'}>
                  {Math.round(kpis.roadmapHealthScore)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Delivery Rate</span>
                <Badge variant={kpis.featureDeliveryRate >= 80 ? 'success' : kpis.featureDeliveryRate >= 60 ? 'warning' : 'destructive'}>
                  {Math.round(kpis.featureDeliveryRate)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Time to Market</span>
                <Badge variant={kpis.timeToMarket <= 14 ? 'success' : kpis.timeToMarket <= 21 ? 'warning' : 'destructive'}>
                  {Math.round(kpis.timeToMarket)} days
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-warning" />
              <span>Customer Success</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Satisfaction</span>
                <Badge variant={kpis.customerSatisfactionScore >= 4.0 ? 'success' : kpis.customerSatisfactionScore >= 3.0 ? 'warning' : 'destructive'}>
                  {kpis.customerSatisfactionScore.toFixed(1)}/5.0
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">OKR Completion</span>
                <Badge variant={kpis.okrCompletionRate >= 80 ? 'success' : kpis.okrCompletionRate >= 60 ? 'warning' : 'destructive'}>
                  {Math.round(kpis.okrCompletionRate)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Product Velocity</span>
                <Badge variant="info">{Math.round(kpis.productVelocity)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
