import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Objective, KeyResult, OKRHealth } from '@/types/okr';
import KeyResultProgress from './KeyResultProgress';
import { 
  ChevronDown, 
  ChevronRight, 
  Target, 
  Users, 
  User, 
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface OKRTreeProps {
  objectives: Objective[];
  keyResults: KeyResult[];
  onObjectiveClick?: (objective: Objective) => void;
  onKeyResultClick?: (keyResult: KeyResult) => void;
  onCreateKeyResult?: (objectiveId: string) => void;
  getOKRHealth?: (objectiveId: string) => OKRHealth;
  showActions?: boolean;
}

interface OKRNodeProps {
  objective: Objective;
  keyResults: KeyResult[];
  onObjectiveClick?: (objective: Objective) => void;
  onKeyResultClick?: (keyResult: KeyResult) => void;
  onCreateKeyResult?: (objectiveId: string) => void;
  getOKRHealth?: (objectiveId: string) => OKRHealth;
  showActions?: boolean;
  level?: number;
}

const OKRNode: React.FC<OKRNodeProps> = ({
  objective,
  keyResults,
  onObjectiveClick,
  onKeyResultClick,
  onCreateKeyResult,
  getOKRHealth,
  showActions = true,
  level = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const health = getOKRHealth?.(objective.id);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'company':
        return <Building className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      case 'individual':
        return <User className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getHealthIcon = (status?: string) => {
    switch (status) {
      case 'on_track':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'at_risk':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'off_track':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getHealthColor = (status?: string) => {
    switch (status) {
      case 'on_track':
        return 'text-green-600';
      case 'at_risk':
        return 'text-yellow-600';
      case 'off_track':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const marginLeft = level * 20;

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="space-y-2">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center gap-2 mt-1">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    {getLevelIcon(objective.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {objective.title}
                    </CardTitle>
                    {objective.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {objective.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {objective.level}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getStatusColor(objective.status)}`}
                      >
                        {objective.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {objective.quarter} {objective.year}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {health && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs">
                        {getHealthIcon(health.status)}
                        <span className={getHealthColor(health.status)}>
                          {health.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      {objective.progress}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {objective.confidence}% confidence
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{objective.progress}%</span>
                </div>
                <Progress value={objective.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-3 mt-3">
          {/* Key Results */}
          {keyResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Key Results ({keyResults.length})
                </h4>
                {showActions && onCreateKeyResult && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCreateKeyResult(objective.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add KR
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {keyResults.map((keyResult) => (
                  <KeyResultProgress
                    key={keyResult.id}
                    keyResult={keyResult}
                    onKeyResultClick={onKeyResultClick}
                    showActions={showActions}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State for Key Results */}
          {keyResults.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed rounded-lg">
              <Target className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">No key results yet</p>
              {showActions && onCreateKeyResult && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateKeyResult(objective.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add first key result
                </Button>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const OKRTree: React.FC<OKRTreeProps> = ({
  objectives,
  keyResults,
  onObjectiveClick,
  onKeyResultClick,
  onCreateKeyResult,
  getOKRHealth,
  showActions = true,
}) => {
  // Group key results by objective
  const keyResultsByObjective = keyResults.reduce((acc, kr) => {
    if (!acc[kr.objective_id]) {
      acc[kr.objective_id] = [];
    }
    acc[kr.objective_id].push(kr);
    return acc;
  }, {} as Record<string, KeyResult[]>);

  // Sort objectives by level and then by progress
  const sortedObjectives = [...objectives].sort((a, b) => {
    const levelOrder = { company: 0, team: 1, individual: 2 };
    const levelDiff = levelOrder[a.level] - levelOrder[b.level];
    if (levelDiff !== 0) return levelDiff;
    return b.progress - a.progress;
  });

  return (
    <div className="space-y-4">
      {sortedObjectives.map((objective) => (
        <OKRNode
          key={objective.id}
          objective={objective}
          keyResults={keyResultsByObjective[objective.id] || []}
          onObjectiveClick={onObjectiveClick}
          onKeyResultClick={onKeyResultClick}
          onCreateKeyResult={onCreateKeyResult}
          getOKRHealth={getOKRHealth}
          showActions={showActions}
          level={0}
        />
      ))}
      
      {objectives.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No OKRs yet</h3>
          <p className="text-muted-foreground">
            Create your first objective to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default OKRTree;
