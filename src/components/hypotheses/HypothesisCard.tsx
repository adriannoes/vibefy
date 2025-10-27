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
  Lightbulb,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Target,
  Zap,
  Users,
  BarChart3
} from 'lucide-react';
import { Hypothesis, HypothesisStatus, Experiment } from '@/types/hypothesis';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface HypothesisCardProps {
  hypothesis: Hypothesis;
  onUpdate: (id: string, updates: Partial<Hypothesis>) => void;
  onDelete: (id: string) => void;
  onCreateExperiment: (hypothesisId: string, experiment: Omit<Experiment, 'id' | 'hypothesis_id' | 'created_at' | 'updated_at'>) => void;
}

const statusConfig = {
  draft: { label: 'Draft', icon: Lightbulb, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', bgColor: 'bg-gray-50' },
  proposed: { label: 'Proposed', icon: Clock, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', bgColor: 'bg-blue-50' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', bgColor: 'bg-green-50' },
  in_experiment: { label: 'In Experiment', icon: BarChart3, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', bgColor: 'bg-purple-50' },
  validated: { label: 'Validated', icon: CheckCircle, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', bgColor: 'bg-green-50' },
  invalidated: { label: 'Invalidated', icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', bgColor: 'bg-red-50' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', bgColor: 'bg-gray-50' },
};

const typeConfig = {
  problem_validation: { label: 'Problem Validation', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  solution_validation: { label: 'Solution Validation', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  market_validation: { label: 'Market Validation', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  technical_validation: { label: 'Technical Validation', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
};

export const HypothesisCard: React.FC<HypothesisCardProps> = ({
  hypothesis,
  onUpdate,
  onDelete,
  onCreateExperiment,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const StatusIcon = statusConfig[hypothesis.status].icon;
  const runningExperiments = hypothesis.experiments.filter(e => e.status === 'running');
  const completedExperiments = hypothesis.experiments.filter(e => e.status === 'completed');

  const handleStatusChange = (status: HypothesisStatus) => {
    const updates: Partial<Hypothesis> = { status };
    if (status === 'validated' || status === 'invalidated') {
      updates.validated_at = new Date().toISOString();
    }
    onUpdate(hypothesis.id, updates);
  };

  const getConfidenceColor = (level: number) => {
    if (level >= 8) return 'text-green-600';
    if (level >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (level: number) => {
    if (level <= 3) return 'text-green-600';
    if (level <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      statusConfig[hypothesis.status].bgColor,
      hypothesis.priority === 'critical' && "ring-2 ring-red-200 dark:ring-red-800"
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
                <h3 className="font-semibold text-lg truncate">{hypothesis.title}</h3>
                <Badge className={statusConfig[hypothesis.status].color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig[hypothesis.status].label}
                </Badge>
                <Badge variant="outline" className={priorityConfig[hypothesis.priority].color}>
                  {priorityConfig[hypothesis.priority].label}
                </Badge>
              </div>

              {/* Type and Meta */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <Badge variant="secondary" className={typeConfig[hypothesis.type].color}>
                  {typeConfig[hypothesis.type].label}
                </Badge>
                <span>Created {formatDate(hypothesis.created_at)}</span>
                {hypothesis.validated_at && (
                  <span>Validated {formatDate(hypothesis.validated_at)}</span>
                )}
              </div>

              {/* Description */}
              <p className={cn(
                "text-sm text-muted-foreground",
                !isExpanded && "line-clamp-2"
              )}>
                {hypothesis.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Experiments count */}
            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>{hypothesis.experiments.length}</span>
              </div>
              {runningExperiments.length > 0 && (
                <div className="text-xs text-blue-600">
                  {runningExperiments.length} running
                </div>
              )}
            </div>

            {/* Menu */}
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
                <DropdownMenuItem onClick={() =>
                  onCreateExperiment(hypothesis.id, {
                    title: `Experiment for ${hypothesis.title}`,
                    description: `Testing hypothesis: ${hypothesis.problem_statement}`,
                    type: 'a_b_test',
                    status: 'planned',
                    methodology: 'To be defined',
                    primary_metric: 'User engagement',
                    secondary_metrics: ['Retention', 'Satisfaction'],
                    success_threshold: 'Statistical significance with p < 0.05',
                    created_by: 'current-user',
                  })
                }>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experiment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange('proposed')}>
                  Mark as Proposed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('approved')}>
                  Mark as Approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('in_experiment')}>
                  Mark as In Experiment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('validated')}>
                  Mark as Validated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('invalidated')}>
                  Mark as Invalidated
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(hypothesis.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Hypothesis
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Hypothesis Statement */}
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="font-medium text-muted-foreground mb-1">Problem</div>
              <div className="text-foreground">{hypothesis.problem_statement}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground mb-1">Solution</div>
              <div className="text-foreground">{hypothesis.solution_statement}</div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className={cn("text-2xl font-bold", getConfidenceColor(hypothesis.confidence_level))}>
              {hypothesis.confidence_level}/10
            </div>
            <div className="text-xs text-muted-foreground">Confidence</div>
          </div>
          <div className="text-center">
            <div className={cn("text-2xl font-bold", getRiskColor(hypothesis.risk_level))}>
              {hypothesis.risk_level}/10
            </div>
            <div className="text-xs text-muted-foreground">Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {hypothesis.effort_estimate}
            </div>
            <div className="text-xs text-muted-foreground">Effort (pts)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {hypothesis.experiments.length}
            </div>
            <div className="text-xs text-muted-foreground">Experiments</div>
          </div>
        </div>

        {/* Success Criteria */}
        {isExpanded && (
          <div className="mb-4">
            <div className="font-medium text-muted-foreground mb-2">Success Criteria</div>
            <ul className="space-y-1">
              {hypothesis.success_criteria.map((criteria, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{criteria}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Experiments Summary */}
        {hypothesis.experiments.length > 0 && (
          <div className="mb-4 p-3 bg-card rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-muted-foreground">Experiments</div>
              <div className="flex gap-2 text-xs">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {completedExperiments.length} completed
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {runningExperiments.length} running
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              {hypothesis.experiments.slice(0, 3).map((experiment) => (
                <div key={experiment.id} className="flex items-center justify-between text-sm">
                  <span className="truncate flex-1">{experiment.title}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {experiment.status}
                  </Badge>
                </div>
              ))}
              {hypothesis.experiments.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{hypothesis.experiments.length - 3} more experiments
                </div>
              )}
            </div>
          </div>
        )}

        {/* Linked Items */}
        {(hypothesis.linked_features?.length || hypothesis.linked_roadmap_items?.length || hypothesis.linked_okrs?.length) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {hypothesis.linked_features && hypothesis.linked_features.length > 0 && (
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>{hypothesis.linked_features.length} linked features</span>
              </div>
            )}
            {hypothesis.linked_roadmap_items && hypothesis.linked_roadmap_items.length > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{hypothesis.linked_roadmap_items.length} roadmap items</span>
              </div>
            )}
            {hypothesis.linked_okrs && hypothesis.linked_okrs.length > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>{hypothesis.linked_okrs.length} OKRs</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
