import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AssigneeWorkloadData } from '@/types/analytics';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AssigneeDistributionChartProps {
  data: AssigneeWorkloadData[];
  loading?: boolean;
}

export const AssigneeDistributionChart = ({ data, loading }: AssigneeDistributionChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(assignee => ({
    name: assignee.assigneeName.split(' ')[0], // First name only
    total: assignee.totalIssues,
    completed: assignee.completedIssues,
    inProgress: assignee.inProgressIssues,
    storyPoints: assignee.storyPoints,
    avatar: assignee.avatarUrl
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { name: string; total: number; completed: number; inProgress: number; storyPoints: number; avatar: string } }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={data.avatar} />
              <AvatarFallback className="text-xs">
                {data.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{label}</span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span>Total Issues:</span>
              <span className="font-medium">{data.total}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Completed:</span>
              <span className="font-medium text-green-600">{data.completed}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>In Progress:</span>
              <span className="font-medium text-blue-600">{data.inProgress}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Story Points:</span>
              <span className="font-medium text-purple-600">{data.storyPoints}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Workload</CardTitle>
        <p className="text-sm text-muted-foreground">
          Issues and story points by team member
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="completed" 
                stackId="issues"
                fill="#10b981" 
                name="Completed"
                radius={[0, 0, 4, 4]}
              />
              <Bar 
                dataKey="inProgress" 
                stackId="issues"
                fill="#3b82f6" 
                name="In Progress"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
