import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Sprint } from '@/types/sprint';

interface SprintMetricsProps {
  sprint: Sprint;
  totalPoints: number;
  completedPoints: number;
  inProgressPoints: number;
  className?: string;
}

const SprintMetrics: React.FC<SprintMetricsProps> = ({
  sprint,
  totalPoints,
  completedPoints,
  inProgressPoints,
  className,
}) => {
  const remainingPoints = totalPoints - completedPoints - inProgressPoints;
  const completionPercentage = totalPoints > 0 
    ? Math.round((completedPoints / totalPoints) * 100) 
    : 0;

  const metrics = [
    {
      icon: Target,
      label: 'Total Points',
      value: totalPoints,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: completedPoints,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Clock,
      label: 'In Progress',
      value: inProgressPoints,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Completion',
      value: `${completionPercentage}%`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.label === 'Completion' && totalPoints > 0 && (
              <div className="mt-2 w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SprintMetrics;
