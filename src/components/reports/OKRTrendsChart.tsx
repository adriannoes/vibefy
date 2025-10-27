import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Target, TrendingUp, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import type { OKRTrendsData, OKRHealthMetrics } from '@/types/analytics';

interface OKRTrendsChartProps {
  okrTrends: OKRTrendsData[];
  isLoading?: boolean;
}

export function OKRTrendsChart({ okrTrends, isLoading }: OKRTrendsChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
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
      </div>
    );
  }

  const latestTrend = okrTrends[okrTrends.length - 1];
  const okrHealth = latestTrend?.okrHealth;

  const formatTooltipValue = (value: number, name: string) => {
    switch (name) {
      case 'objectivesCompleted':
        return [value.toString(), 'Objectives Completed'];
      case 'objectivesTotal':
        return [value.toString(), 'Total Objectives'];
      case 'keyResultsCompleted':
        return [value.toString(), 'Key Results Completed'];
      case 'keyResultsTotal':
        return [value.toString(), 'Total Key Results'];
      case 'averageProgress':
        return [`${Math.round(value)}%`, 'Average Progress'];
      default:
        return [value.toString(), name];
    }
  };

  const formatTooltipLabel = (label: string) => {
    return label;
  };

  // Data for pie chart
  const objectiveStatusData = okrHealth ? [
    { name: 'On Track', value: okrHealth.objectivesOnTrack, color: 'hsl(var(--success))' },
    { name: 'At Risk', value: okrHealth.objectivesAtRisk, color: 'hsl(var(--warning))' },
    { name: 'Delayed', value: okrHealth.objectivesDelayed, color: 'hsl(var(--destructive))' },
  ] : [];

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getHealthBadgeVariant = (score: number): 'success' | 'warning' | 'destructive' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">OKR Trends & Health</h2>
        <p className="text-muted-foreground">
          Track objectives and key results progress over time
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall OKR Score
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthColor(okrHealth?.overallScore || 0)}`}>
              {okrHealth?.overallScore || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall health score
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Objectives Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {latestTrend?.objectivesCompleted || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              of {latestTrend?.objectivesTotal || 0} total
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Key Results Completed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {latestTrend?.keyResultsCompleted || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              of {latestTrend?.keyResultsTotal || 0} total
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Confidence
            </CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {Math.round(okrHealth?.averageConfidence || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Team confidence level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OKR Progress Trend */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>OKR Progress Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={okrTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="period" 
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
                    dataKey="averageProgress" 
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

        {/* Objectives vs Key Results */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-success" />
              <span>Objectives vs Key Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={okrTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="period" 
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
                  <Bar dataKey="objectivesCompleted" fill="hsl(var(--success))" name="objectivesCompleted" />
                  <Bar dataKey="keyResultsCompleted" fill="hsl(var(--info))" name="keyResultsCompleted" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objective Status Distribution */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Objective Status Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={objectiveStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {objectiveStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {objectiveStatusData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Metrics */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Health Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Health Score</span>
                  <Badge variant={getHealthBadgeVariant(okrHealth?.overallScore || 0)}>
                    {okrHealth?.overallScore || 0}%
                  </Badge>
                </div>
                <Progress value={okrHealth?.overallScore || 0} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Objectives On Track</span>
                  <span className="text-success font-medium">{okrHealth?.objectivesOnTrack || 0}</span>
                </div>
                <Progress value={okrHealth ? (okrHealth.objectivesOnTrack / (okrHealth.objectivesOnTrack + okrHealth.objectivesAtRisk + okrHealth.objectivesDelayed)) * 100 : 0} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Key Results Completion</span>
                  <span className="text-info font-medium">
                    {okrHealth ? Math.round((okrHealth.keyResultsCompleted / okrHealth.keyResultsTotal) * 100) : 0}%
                  </span>
                </div>
                <Progress value={okrHealth ? (okrHealth.keyResultsCompleted / okrHealth.keyResultsTotal) * 100 : 0} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Confidence</span>
                  <span className="text-warning font-medium">{Math.round(okrHealth?.averageConfidence || 0)}%</span>
                </div>
                <Progress value={okrHealth?.averageConfidence || 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Indicators */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>Risk Indicators</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <div className="font-medium">At Risk Objectives</div>
                <div className="text-sm text-muted-foreground">
                  {okrHealth?.objectivesAtRisk || 0} objectives need attention
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <Clock className="h-5 w-5 text-destructive" />
              <div>
                <div className="font-medium">Delayed Objectives</div>
                <div className="text-sm text-muted-foreground">
                  {okrHealth?.objectivesDelayed || 0} objectives behind schedule
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <div className="font-medium">On Track</div>
                <div className="text-sm text-muted-foreground">
                  {okrHealth?.objectivesOnTrack || 0} objectives progressing well
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
