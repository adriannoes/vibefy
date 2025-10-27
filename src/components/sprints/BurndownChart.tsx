import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown } from 'lucide-react';

interface BurndownChartProps {
  sprintId: string;
  className?: string;
}

// Mock data - will be replaced with real data from Supabase
const mockBurndownData = [
  { day: 'Day 1', ideal: 100, actual: 100 },
  { day: 'Day 2', ideal: 92, actual: 95 },
  { day: 'Day 3', ideal: 85, actual: 90 },
  { day: 'Day 4', ideal: 78, actual: 82 },
  { day: 'Day 5', ideal: 71, actual: 78 },
  { day: 'Day 6', ideal: 64, actual: 70 },
  { day: 'Day 7', ideal: 57, actual: 65 },
  { day: 'Day 8', ideal: 50, actual: 55 },
  { day: 'Day 9', ideal: 42, actual: 48 },
  { day: 'Day 10', ideal: 35, actual: 40 },
  { day: 'Day 11', ideal: 28, actual: 32 },
  { day: 'Day 12', ideal: 21, actual: 25 },
  { day: 'Day 13', ideal: 14, actual: 15 },
  { day: 'Day 14', ideal: 7, actual: 8 },
  { day: 'Day 15', ideal: 0, actual: 0 },
];

const BurndownChart: React.FC<BurndownChartProps> = ({ sprintId, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          <CardTitle>Burndown Chart</CardTitle>
        </div>
        <CardDescription>
          Story points remaining over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockBurndownData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
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
            <Line 
              type="monotone" 
              dataKey="ideal" 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="5 5"
              name="Ideal"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Actual"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <span className="font-medium">On track:</span> The actual burndown is following the ideal trend.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BurndownChart;
