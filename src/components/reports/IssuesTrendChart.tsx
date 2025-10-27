import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IssueTrendData } from '@/types/analytics';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IssuesTrendChartProps {
  data: IssueTrendData[];
  loading?: boolean;
}

export const IssuesTrendChart = ({ data, loading }: IssuesTrendChartProps) => {
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM', { locale: ptBR });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues Trend</CardTitle>
        <p className="text-sm text-muted-foreground">
          Created vs completed issues over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => format(parseISO(value), 'dd/MM/yyyy', { locale: ptBR })}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="created" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Created"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Completed"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="inProgress" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="In Progress"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
