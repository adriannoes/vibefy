import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Zap,
  Users
} from 'lucide-react';
import { Hypothesis, Experiment, HypothesisValidationMetrics, ExperimentMetrics } from '@/types/hypothesis';

interface HypothesisInsightsProps {
  hypotheses: Hypothesis[];
  experiments: Experiment[];
  metrics: { hypotheses: HypothesisValidationMetrics; experiments: ExperimentMetrics };
}

interface Insight {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'trend';
  metric?: string;
  trend?: 'up' | 'down' | 'stable';
  actionable?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export const HypothesisInsights: React.FC<HypothesisInsightsProps> = ({
  hypotheses,
  experiments,
  metrics,
}) => {
  const insights = useMemo((): Insight[] => {
    const result: Insight[] = [];

    // Validation rate insights
    if (metrics.hypotheses.validation_rate > 70) {
      result.push({
        title: 'Strong Validation Performance',
        description: `${metrics.hypotheses.validation_rate.toFixed(1)}% of your hypotheses are being validated. Keep up the rigorous testing!`,
        type: 'success',
        metric: `${metrics.hypotheses.validation_rate.toFixed(1)}% validated`,
        icon: CheckCircle,
      });
    } else if (metrics.hypotheses.validation_rate < 50) {
      result.push({
        title: 'Improve Validation Rate',
        description: `Only ${metrics.hypotheses.validation_rate.toFixed(1)}% of hypotheses are validated. Consider running more experiments.`,
        type: 'warning',
        metric: `${metrics.hypotheses.validation_rate.toFixed(1)}% validated`,
        actionable: true,
        icon: AlertTriangle,
      });
    }

    // Experiment success insights
    if (metrics.experiments.success_rate > 80) {
      result.push({
        title: 'High Experiment Success',
        description: `${metrics.experiments.success_rate.toFixed(1)}% of experiments are meeting success criteria. Your testing methodology is effective!`,
        type: 'success',
        metric: `${metrics.experiments.success_rate.toFixed(1)}% success rate`,
        icon: Target,
      });
    }

    // Average validation time
    if (metrics.hypotheses.average_validation_time > 0) {
      const weeks = Math.round(metrics.hypotheses.average_validation_time / 7);
      result.push({
        title: 'Average Validation Time',
        description: `Hypotheses take an average of ${weeks} week${weeks > 1 ? 's' : ''} to validate. Consider optimizing your experiment cycle time.`,
        type: 'info',
        metric: `${weeks} week${weeks > 1 ? 's' : ''} average`,
        icon: Clock,
      });
    }

    // Experiment backlog
    const plannedExperiments = experiments.filter(e => e.status === 'planned').length;
    if (plannedExperiments > 5) {
      result.push({
        title: 'Growing Experiment Backlog',
        description: `${plannedExperiments} experiments are waiting to be started. Consider prioritizing and scheduling them.`,
        type: 'info',
        metric: `${plannedExperiments} planned`,
        actionable: true,
        icon: BarChart3,
      });
    }

    // Type distribution insights
    const typeDistribution = hypotheses.reduce((acc, h) => {
      acc[h.type] = (acc[h.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonType = Object.entries(typeDistribution)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostCommonType) {
      const [type, count] = mostCommonType;
      const percentage = ((count / hypotheses.length) * 100).toFixed(1);
      result.push({
        title: 'Primary Focus Area',
        description: `${percentage}% of your hypotheses focus on ${type.replace('_', ' ')}. Consider diversifying your testing approach.`,
        type: 'info',
        metric: `${percentage}% ${type.replace('_', ' ')}`,
        icon: Target,
      });
    }

    // Risk vs Confidence analysis
    const highRiskHighConfidence = hypotheses.filter(h =>
      h.risk_level >= 7 && h.confidence_level >= 7
    ).length;

    if (highRiskHighConfidence > 0) {
      result.push({
        title: 'High-Risk, High-Confidence Hypotheses',
        description: `${highRiskHighConfidence} hypotheses have both high risk and high confidence. These are prime candidates for experimentation.`,
        type: 'info',
        metric: `${highRiskHighConfidence} opportunities`,
        actionable: true,
        icon: Zap,
      });
    }

    // Learning velocity
    const recentValidated = hypotheses.filter(h => {
      if (!h.validated_at) return false;
      const validatedDate = new Date(h.validated_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return validatedDate > thirtyDaysAgo;
    }).length;

    if (recentValidated > 0) {
      result.push({
        title: 'Recent Learning Momentum',
        description: `${recentValidated} hypotheses validated in the last 30 days. Your learning velocity is strong!`,
        type: 'success',
        metric: `${recentValidated} in 30 days`,
        trend: 'up',
        icon: TrendingUp,
      });
    }

    return result.slice(0, 8); // Limit to 8 insights
  }, [hypotheses, experiments, metrics]);

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'warning': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950';
      case 'trend': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.hypotheses.total_hypotheses}</p>
                <p className="text-sm text-muted-foreground">Total Hypotheses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.hypotheses.validated_hypotheses}</p>
                <p className="text-sm text-muted-foreground">Validated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.experiments.total_experiments}</p>
                <p className="text-sm text-muted-foreground">Experiments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.hypotheses.validation_rate.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <Card key={index} className={`transition-all hover:shadow-md ${getInsightColor(insight.type)}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <insight.icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    {insight.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {insight.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {insight.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {insight.metric && (
                      <Badge variant="secondary" className="text-xs">
                        {insight.metric}
                      </Badge>
                    )}
                    {insight.actionable && (
                      <Badge variant="outline" className="text-xs">
                        Actionable
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Type Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Hypothesis Types Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'solution_validation', label: 'Solution Validation', color: 'bg-blue-500' },
              { type: 'problem_validation', label: 'Problem Validation', color: 'bg-orange-500' },
              { type: 'market_validation', label: 'Market Validation', color: 'bg-green-500' },
              { type: 'technical_validation', label: 'Technical Validation', color: 'bg-purple-500' },
            ].map((item) => {
              const count = hypotheses.filter(h => h.type === item.type).length;
              const percentage = hypotheses.length > 0 ? (count / hypotheses.length) * 100 : 0;
              return (
                <div key={item.type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span>{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Hypothesis Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { status: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
              { status: 'proposed', label: 'Proposed', color: 'bg-blue-100 text-blue-800' },
              { status: 'in_experiment', label: 'In Experiment', color: 'bg-purple-100 text-purple-800' },
              { status: 'validated', label: 'Validated', color: 'bg-green-100 text-green-800' },
              { status: 'invalidated', label: 'Invalidated', color: 'bg-red-100 text-red-800' },
              { status: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
            ].map((item) => {
              const count = hypotheses.filter(h => h.status === item.status).length;
              return (
                <div key={item.status} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <Badge className={`${item.color} text-xs mt-1`}>
                    {item.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
