import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';
import type { BusinessValueMetrics } from '@/types/analytics';

interface BusinessValueTrendChartProps {
  businessValue: BusinessValueMetrics;
  isLoading?: boolean;
}

export function BusinessValueTrendChart({ businessValue, isLoading }: BusinessValueTrendChartProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'value':
        return [`$${value.toLocaleString()}`, 'Business Value'];
      case 'issues':
        return [value.toString(), 'Issues'];
      case 'averageValue':
        return [`$${value.toFixed(1)}`, 'Avg Value'];
      default:
        return [value.toString(), name];
    }
  };

  const formatTooltipLabel = (label: string) => {
    return new Date(label).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Business Value Analytics</h2>
        <p className="text-muted-foreground">
          Track business value delivery over time and across different dimensions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Business Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${businessValue.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Cumulative value delivered
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${businessValue.averageValue.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Per feature/issue
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Delivery Periods
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessValue.valueByPeriod.length}</div>
            <p className="text-xs text-muted-foreground">
              Weeks tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Value Trend */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Business Value Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={businessValue.valueByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={formatTooltipLabel}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Issues vs Value */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-success" />
              <span>Issues vs Business Value</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={businessValue.valueByPeriod}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    className="text-xs"
                  />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip 
                    formatter={formatTooltipValue}
                    labelFormatter={formatTooltipLabel}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar yAxisId="left" dataKey="issues" fill="hsl(var(--secondary))" name="issues" />
                  <Bar yAxisId="right" dataKey="value" fill="hsl(var(--primary))" name="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature and Segment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Feature */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Business Value by Feature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businessValue.valueByFeature.map((feature) => (
                <div key={feature.featureId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <div className="font-medium">{feature.featureName}</div>
                    <div className="text-sm text-muted-foreground">
                      {feature.issues} issues • Avg: ${feature.averageValue.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${feature.totalValue.toLocaleString()}</div>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round((feature.totalValue / businessValue.totalValue) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Customer Segment */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Business Value by Customer Segment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {businessValue.valueBySegment.map((segment) => (
                <div key={segment.segment} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <div className="font-medium capitalize">{segment.segment}</div>
                    <div className="text-sm text-muted-foreground">
                      {segment.issues} issues • Avg: ${segment.averageValue.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${segment.totalValue.toLocaleString()}</div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round((segment.totalValue / businessValue.totalValue) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
