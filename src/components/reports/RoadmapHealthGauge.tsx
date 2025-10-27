import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { RoadmapHealthMetrics } from '@/types/analytics';

interface RoadmapHealthGaugeProps {
  roadmapHealth: RoadmapHealthMetrics;
  isLoading?: boolean;
}

export function RoadmapHealthGauge({ roadmapHealth, isLoading }: RoadmapHealthGaugeProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted rounded"></div>
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'at-risk':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'delayed':
        return <Clock className="h-4 w-4 text-destructive" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-success';
      case 'at-risk':
        return 'text-warning';
      case 'delayed':
        return 'text-destructive';
      case 'cancelled':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Roadmap Health Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor delivery performance and identify potential risks
        </p>
      </div>

      {/* Overall Health Score */}
      <Card variant="elevated" className="gradient-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-6 w-6" />
            <span>Overall Roadmap Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-4xl font-bold">{roadmapHealth.overallScore}</div>
              <div className="text-sm opacity-90">Health Score (0-100)</div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-sm opacity-90">On-time Delivery</div>
              <div className="text-lg font-semibold">{Math.round(roadmapHealth.onTimeDelivery)}%</div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-sm opacity-90">Scope Stability</div>
              <div className="text-lg font-semibold">{Math.round(roadmapHealth.scopeStability)}%</div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-sm opacity-90">Risk Level</div>
              <div className="text-lg font-semibold">{Math.round(roadmapHealth.riskLevel)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On-time Delivery
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(roadmapHealth.onTimeDelivery)}%</div>
            <Progress 
              value={roadmapHealth.onTimeDelivery} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Features delivered on schedule
            </p>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scope Stability
            </CardTitle>
            <Target className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(roadmapHealth.scopeStability)}%</div>
            <Progress 
              value={roadmapHealth.scopeStability} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Requirements unchanged
            </p>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Risk Level
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(roadmapHealth.riskLevel)}%</div>
            <Progress 
              value={roadmapHealth.riskLevel} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lower is better
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health by Quarter */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Health by Quarter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roadmapHealth.healthByQuarter.map((quarter) => (
                <div key={quarter.quarter} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{quarter.quarter}</div>
                    <Badge variant={getHealthBadgeVariant(quarter.score)}>
                      {quarter.score}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-success">{quarter.delivered}</div>
                      <div className="text-muted-foreground">Delivered</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-info">{quarter.planned}</div>
                      <div className="text-muted-foreground">Planned</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-warning">{quarter.delayed}</div>
                      <div className="text-muted-foreground">Delayed</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-destructive">{quarter.cancelled}</div>
                      <div className="text-muted-foreground">Cancelled</div>
                    </div>
                  </div>
                  <Progress value={quarter.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health by Feature */}
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-success" />
              <span>Health by Feature</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roadmapHealth.healthByFeature.map((feature) => (
                <div key={feature.featureId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(feature.status)}
                      <span className="font-medium">{feature.featureName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getHealthBadgeVariant(feature.score)}>
                        {feature.score}%
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(feature.status)}>
                        {feature.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={feature.progress} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {Math.round(feature.progress)}%
                    </span>
                  </div>
                </div>
              ))}
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
                <div className="font-medium">High Risk Features</div>
                <div className="text-sm text-muted-foreground">
                  {roadmapHealth.healthByFeature.filter(f => f.status === 'at-risk').length} features need attention
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <Clock className="h-5 w-5 text-destructive" />
              <div>
                <div className="font-medium">Delayed Deliveries</div>
                <div className="text-sm text-muted-foreground">
                  {roadmapHealth.healthByFeature.filter(f => f.status === 'delayed').length} features behind schedule
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <div className="font-medium">On Track</div>
                <div className="text-sm text-muted-foreground">
                  {roadmapHealth.healthByFeature.filter(f => f.status === 'on-track').length} features progressing well
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
