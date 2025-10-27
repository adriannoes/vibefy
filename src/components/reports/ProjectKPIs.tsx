import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectKPIs as ProjectKPIsType } from '@/types/analytics';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Target,
  BarChart3,
  Timer
} from 'lucide-react';

interface ProjectKPIsProps {
  data: ProjectKPIsType | null;
  loading?: boolean;
}

export const ProjectKPIs = ({ data, loading }: ProjectKPIsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No data available</p>
      </div>
    );
  }

  const completionRate = data.totalIssues > 0 
    ? Math.round((data.completedIssues / data.totalIssues) * 100) 
    : 0;

  const kpiCards = [
    {
      title: 'Total Issues',
      value: data.totalIssues,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      description: 'All issues in project'
    },
    {
      title: 'Completed',
      value: data.completedIssues,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      description: `${completionRate}% completion rate`
    },
    {
      title: 'In Progress',
      value: data.inProgressIssues,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      description: 'Currently active'
    },
    {
      title: 'Backlog',
      value: data.backlogIssues,
      icon: AlertCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950',
      description: 'Pending work'
    }
  ];

  const metricsCards = [
    {
      title: 'Avg Resolution Time',
      value: `${data.averageResolutionTime} days`,
      icon: Timer,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      description: 'Time to complete issues'
    },
    {
      title: 'Velocity',
      value: `${data.velocity} pts`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      description: 'Story points per sprint'
    },
    {
      title: 'Burndown Rate',
      value: `${data.burndownRate}%`,
      icon: Target,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      description: 'Sprint completion rate'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main KPIs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {kpi.title}
                    </p>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {kpi.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
                {kpi.title === 'Completed' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{completionRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metricsCards.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {metric.title}
                    </p>
                    <p className="text-xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
