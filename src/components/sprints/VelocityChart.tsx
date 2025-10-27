import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface VelocityChartProps {
  projectId: string;
  className?: string;
}

// Mock data - will be replaced with real data from Supabase
const mockVelocityData = [
  { sprint: 'Sprint 1', committed: 55, completed: 50 },
  { sprint: 'Sprint 2', committed: 60, completed: 58 },
  { sprint: 'Sprint 3', committed: 65, completed: 62 },
  { sprint: 'Sprint 4', committed: 70, completed: 68 },
  { sprint: 'Sprint 5', committed: 75, completed: 73 },
];

const VelocityChart: React.FC<VelocityChartProps> = ({ projectId, className }) => {
  const averageVelocity = Math.round(
    mockVelocityData.reduce((sum, data) => sum + data.completed, 0) / mockVelocityData.length
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Velocity Chart</CardTitle>
        </div>
        <CardDescription>
          Story points committed vs completed per sprint
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockVelocityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="sprint" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="committed" 
              fill="hsl(var(--muted))" 
              name="Committed"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="completed" 
              fill="hsl(var(--primary))" 
              name="Completed"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <span className="font-medium">Average velocity:</span> {averageVelocity} story points per sprint
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VelocityChart;
