import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyResult } from '@/types/okr';
import { Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface KeyResultProgressProps {
  keyResult: KeyResult;
  onUpdate?: (keyResultId: string, updates: Partial<KeyResult>) => void;
  showActions?: boolean;
}

const KeyResultProgress: React.FC<KeyResultProgressProps> = ({
  keyResult,
  onUpdate,
  showActions = true,
}) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressIcon = (progress: number) => {
    if (progress >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (progress >= 70) return <TrendingUp className="h-4 w-4 text-blue-600" />;
    if (progress >= 50) return <Target className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
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

  const formatValue = (value: number, type: string, unit?: string) => {
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'number':
        return unit ? `${value} ${unit}` : value.toString();
      case 'boolean':
        return value === 1 ? 'Yes' : 'No';
      default:
        return value.toString();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {keyResult.title}
            </CardTitle>
            {keyResult.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {keyResult.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge 
              variant="secondary" 
              className={`text-xs ${getStatusColor(keyResult.status)}`}
            >
              {keyResult.status}
            </Badge>
            {getProgressIcon(keyResult.progress)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className={`font-medium ${getProgressColor(keyResult.progress)}`}>
                {keyResult.progress}%
              </span>
            </div>
            <Progress value={keyResult.progress} className="h-2" />
          </div>

          {/* Current vs Target Values */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-primary">
                {formatValue(keyResult.current_value, keyResult.type, keyResult.unit)}
              </div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-muted-foreground">
                {formatValue(keyResult.target_value, keyResult.type, keyResult.unit)}
              </div>
              <div className="text-xs text-muted-foreground">Target</div>
            </div>
          </div>

          {/* Confidence Level */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className={`font-medium ${getConfidenceColor(keyResult.confidence)}`}>
              {keyResult.confidence}%
            </span>
          </div>
          <Progress value={keyResult.confidence} className="h-1" />

          {/* Progress Calculation */}
          <div className="text-xs text-muted-foreground text-center p-2 bg-muted/20 rounded">
            {keyResult.type === 'percentage' ? (
              <>
                {keyResult.current_value}% of {keyResult.target_value}% target
                {keyResult.target_value > 0 && (
                  <span className="block mt-1">
                    ({Math.round((keyResult.current_value / keyResult.target_value) * 100)}% of target achieved)
                  </span>
                )}
              </>
            ) : (
              <>
                {keyResult.current_value} of {keyResult.target_value} {keyResult.unit || 'units'}
                {keyResult.target_value > 0 && (
                  <span className="block mt-1">
                    ({Math.round((keyResult.current_value / keyResult.target_value) * 100)}% of target achieved)
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KeyResultProgress;
