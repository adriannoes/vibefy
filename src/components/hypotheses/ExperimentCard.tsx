import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  TestTube,
  MoreVertical,
  Edit,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { Experiment, Hypothesis } from '@/types/hypothesis';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ExperimentCardProps {
  experiment: Experiment;
  hypothesis: Hypothesis;
}

const statusConfig = {
  planned: { label: 'Planned', icon: Clock, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
  running: { label: 'Running', icon: Play, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  failed: { label: 'Failed', icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
};

const typeConfig = {
  a_b_test: { label: 'A/B Test', icon: BarChart3 },
  feature_flag: { label: 'Feature Flag', icon: Zap },
  survey: { label: 'Survey', icon: Users },
  user_interview: { label: 'User Interview', icon: Users },
  usability_test: { label: 'Usability Test', icon: Target },
  prototype: { label: 'Prototype', icon: TestTube },
  mvp: { label: 'MVP Test', icon: Zap },
  other: { label: 'Other', icon: TestTube },
};

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  hypothesis,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const StatusIcon = statusConfig[experiment.status].icon;
  const TypeIcon = typeConfig[experiment.type].icon;

  // Calculate progress if running
  const getProgress = () => {
    if (!experiment.start_date || !experiment.end_date) return 0;

    const start = new Date(experiment.start_date).getTime();
    const end = new Date(experiment.end_date).getTime();
    const now = new Date().getTime();

    if (now >= end) return 100;
    if (now <= start) return 0;

    return ((now - start) / (end - start)) * 100;
  };

  const progress = experiment.status === 'running' ? getProgress() : 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getDuration = () => {
    if (!experiment.start_date || !experiment.actual_end_date) return 'N/A';

    const start = new Date(experiment.start_date);
    const end = new Date(experiment.actual_end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const getResultColor = (value: number, threshold: string) => {
    // Simple parsing of threshold like "15% improvement"
    const thresholdValue = parseFloat(threshold.replace('%', ''));
    return value >= thresholdValue ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      experiment.status === 'running' && "ring-2 ring-blue-200 dark:ring-blue-800"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              <StatusIcon className="h-6 w-6 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title and Status */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{experiment.title}</h3>
                <Badge className={statusConfig[experiment.status].color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[experiment.status].label}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <TypeIcon className="h-3 w-3" />
                  {typeConfig[experiment.type].label}
                </Badge>
              </div>

              {/* Hypothesis link */}
              <div className="text-sm text-muted-foreground mb-2">
                Testing: <span className="font-medium text-foreground">{hypothesis.title}</span>
              </div>

              {/* Description */}
              <p className={cn(
                "text-sm text-muted-foreground",
                !isExpanded && "line-clamp-2"
              )}>
                {experiment.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? 'Collapse' : 'Expand'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit Experiment
              </DropdownMenuItem>
              {experiment.status === 'planned' && (
                <DropdownMenuItem>
                  <Play className="h-4 w-4 mr-2" />
                  Start Experiment
                </DropdownMenuItem>
              )}
              {experiment.status === 'running' && (
                <DropdownMenuItem>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Experiment
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                View Results
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress bar for running experiments */}
        {experiment.status === 'running' && experiment.start_date && experiment.end_date && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Started {formatDate(experiment.start_date)}</span>
              <span>Ends {formatDate(experiment.end_date)}</span>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {experiment.sample_size && (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {experiment.sample_size.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Sample Size</div>
            </div>
          )}
          {experiment.duration_days && (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {experiment.duration_days}
              </div>
              <div className="text-xs text-muted-foreground">Days</div>
            </div>
          )}
          {experiment.actual_end_date && experiment.start_date && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {getDuration()}
              </div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
          )}
          {experiment.results && (
            <div className="text-center">
              <div className={cn(
                "text-2xl font-bold",
                getResultColor(experiment.results.primary_metric_value * 100, experiment.success_threshold)
              )}>
                {experiment.results.primary_metric_value > 1
                  ? experiment.results.primary_metric_value.toFixed(2)
                  : `${(experiment.results.primary_metric_value * 100).toFixed(1)}%`
                }
              </div>
              <div className="text-xs text-muted-foreground">Primary Metric</div>
            </div>
          )}
        </div>

        {/* Experiment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="font-medium text-muted-foreground mb-1">Primary Metric</div>
            <div className="text-sm">{experiment.primary_metric}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground mb-1">Success Threshold</div>
            <div className="text-sm">{experiment.success_threshold}</div>
          </div>
        </div>

        {/* Secondary Metrics */}
        {experiment.secondary_metrics.length > 0 && (
          <div className="mb-4">
            <div className="font-medium text-muted-foreground mb-2">Secondary Metrics</div>
            <div className="flex flex-wrap gap-1">
              {experiment.secondary_metrics.map((metric, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {metric}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Results (for completed experiments) */}
        {experiment.status === 'completed' && experiment.results && isExpanded && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="font-medium text-muted-foreground mb-2">Results</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Primary Metric</div>
                <div className={cn(
                  "font-medium",
                  getResultColor(experiment.results.primary_metric_value * 100, experiment.success_threshold)
                )}>
                  {experiment.results.primary_metric_value > 1
                    ? experiment.results.primary_metric_value.toFixed(2)
                    : `${(experiment.results.primary_metric_value * 100).toFixed(1)}%`
                  }
                </div>
              </div>
              {experiment.results.p_value && (
                <div>
                  <div className="text-muted-foreground">Statistical Significance</div>
                  <div className="font-medium">
                    p = {experiment.results.p_value < 0.001 ? '< 0.001' : experiment.results.p_value.toFixed(3)}
                  </div>
                </div>
              )}
              {experiment.results.confidence_interval && (
                <div className="md:col-span-2">
                  <div className="text-muted-foreground">Confidence Interval (95%)</div>
                  <div className="font-medium">
                    {experiment.results.confidence_interval.lower.toFixed(2)} - {experiment.results.confidence_interval.upper.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conclusion and Learnings (for completed experiments) */}
        {experiment.status === 'completed' && (experiment.conclusion || experiment.learnings?.length) && isExpanded && (
          <div className="space-y-3">
            {experiment.conclusion && (
              <div>
                <div className="font-medium text-muted-foreground mb-1">Conclusion</div>
                <div className="text-sm p-2 bg-card rounded border-l-4 border-l-green-500">
                  {experiment.conclusion}
                </div>
              </div>
            )}
            {experiment.learnings && experiment.learnings.length > 0 && (
              <div>
                <div className="font-medium text-muted-foreground mb-2">Key Learnings</div>
                <ul className="space-y-1">
                  {experiment.learnings.map((learning, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{learning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {experiment.next_steps && experiment.next_steps.length > 0 && (
              <div>
                <div className="font-medium text-muted-foreground mb-2">Next Steps</div>
                <ul className="space-y-1">
                  {experiment.next_steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
