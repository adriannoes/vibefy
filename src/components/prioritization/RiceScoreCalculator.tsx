import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RICEScore } from '@/types/prioritization';
import { Calculator, Target, Users, Zap, Clock } from 'lucide-react';

interface RiceScoreCalculatorProps {
  initialScore?: RICEScore;
  onScoreChange?: (score: RICEScore) => void;
  onSave?: (score: RICEScore) => void;
  disabled?: boolean;
}

const RiceScoreCalculator: React.FC<RiceScoreCalculatorProps> = ({
  initialScore,
  onScoreChange,
  onSave,
  disabled = false,
}) => {
  const [reach, setReach] = useState(initialScore?.reach || 5);
  const [impact, setImpact] = useState(initialScore?.impact || 2);
  const [confidence, setConfidence] = useState(initialScore?.confidence || 50);
  const [effort, setEffort] = useState(initialScore?.effort || 5);

  const calculateScore = (): RICEScore => {
    const score = (reach * impact * confidence) / effort;
    return {
      reach,
      impact,
      confidence,
      effort,
      score: Math.round(score * 100) / 100,
    };
  };

  const currentScore = calculateScore();

  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(currentScore);
    }
  }, [reach, impact, confidence, effort, onScoreChange, currentScore]);

  const getScoreColor = (score: number) => {
    if (score >= 50) return 'text-green-600';
    if (score >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 50) return 'High Priority';
    if (score >= 25) return 'Medium Priority';
    return 'Low Priority';
  };

  const getReachLabel = (value: number) => {
    if (value <= 2) return 'Very Few (1-10)';
    if (value <= 4) return 'Few (10-100)';
    if (value <= 6) return 'Some (100-1K)';
    if (value <= 8) return 'Many (1K-10K)';
    return 'Very Many (10K+)';
  };

  const getImpactLabel = (value: number) => {
    if (value === 1) return 'Minimal';
    if (value === 2) return 'Moderate';
    return 'Massive';
  };

  const getConfidenceLabel = (value: number) => {
    if (value <= 25) return 'Low';
    if (value <= 50) return 'Medium';
    if (value <= 75) return 'High';
    return 'Very High';
  };

  const getEffortLabel = (value: number) => {
    if (value <= 2) return 'Very Low (1-2 weeks)';
    if (value <= 4) return 'Low (2-4 weeks)';
    if (value <= 6) return 'Medium (1-2 months)';
    if (value <= 8) return 'High (2-4 months)';
    return 'Very High (4+ months)';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          RICE Score Calculator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Calculate priority using Reach, Impact, Confidence, and Effort
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className={`text-4xl font-bold ${getScoreColor(currentScore.score)}`}>
            {currentScore.score}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {getScoreLabel(currentScore.score)}
          </div>
        </div>

        {/* Reach */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Reach (1-10)
            </Label>
            <Badge variant="outline">{reach}</Badge>
          </div>
          <Slider
            value={[reach]}
            onValueChange={([value]) => setReach(value)}
            min={1}
            max={10}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {getReachLabel(reach)}
          </p>
        </div>

        {/* Impact */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Impact (1-3)
            </Label>
            <Badge variant="outline">{impact}</Badge>
          </div>
          <Slider
            value={[impact]}
            onValueChange={([value]) => setImpact(value)}
            min={1}
            max={3}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {getImpactLabel(impact)}
          </p>
        </div>

        {/* Confidence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Confidence (0-100%)
            </Label>
            <Badge variant="outline">{confidence}%</Badge>
          </div>
          <Slider
            value={[confidence]}
            onValueChange={([value]) => setConfidence(value)}
            min={0}
            max={100}
            step={5}
            disabled={disabled}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {getConfidenceLabel(confidence)}
          </p>
        </div>

        {/* Effort */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Effort (1-10)
            </Label>
            <Badge variant="outline">{effort}</Badge>
          </div>
          <Slider
            value={[effort]}
            onValueChange={([value]) => setEffort(value)}
            min={1}
            max={10}
            step={1}
            disabled={disabled}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {getEffortLabel(effort)}
          </p>
        </div>

        {/* Formula Display */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm font-mono text-center">
            RICE = (Reach × Impact × Confidence) ÷ Effort
          </p>
          <p className="text-sm font-mono text-center mt-1">
            = ({reach} × {impact} × {confidence}%) ÷ {effort} = {currentScore.score}
          </p>
        </div>

        {/* Save Button */}
        {onSave && (
          <Button 
            onClick={() => onSave(currentScore)} 
            className="w-full"
            disabled={disabled}
          >
            Save RICE Score
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RiceScoreCalculator;
