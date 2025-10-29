import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DashboardWidget } from '@/types/dashboard';
import { useDataChangeAnimation } from '@/hooks/useWidgetAnimation';
import { cn } from '@/lib/utils';

interface ChartWidgetProps {
  widget: DashboardWidget;
  data: any;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ widget, data }) => {
  const config = widget.config;
  const animation = useDataChangeAnimation(data, {
    animationType: 'slideIn',
    duration: 600,
  });

  const renderBarChart = useMemo(() => {
    if (!data?.labels || !data?.datasets) return null;

    const maxValue = Math.max(...data.datasets[0].data);
    const colors = data.datasets[0].backgroundColor || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

    return (
      <div className="space-y-4">
        <div className="flex items-end gap-2 h-32">
          {data.labels.map((label: string, index: number) => {
            const value = data.datasets[0].data[index];
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const color = colors[index % colors.length];

            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-muted rounded-t flex items-end justify-center min-h-[20px] relative">
                  <div
                    className="w-8 rounded-t transition-all duration-300"
                    style={{
                      height: `${Math.max(height, 5)}%`,
                      backgroundColor: color,
                    }}
                  />
                  <span className="absolute -top-6 text-xs font-medium">
                    {value}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-full">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [data]);

  const renderPieChart = useMemo(() => {
    if (!data?.labels || !data?.datasets) return null;

    const total = data.datasets[0].data.reduce((sum: number, value: number) => sum + value, 0);
    const colors = data.datasets[0].backgroundColor || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

    let cumulativePercentage = 0;

    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              {data.labels.map((label: string, index: number) => {
                const value = data.datasets[0].data[index];
                const percentage = (value / total) * 100;
                const startAngle = (cumulativePercentage / 100) * 360;
                const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                cumulativePercentage += percentage;

                const startAngleRad = (startAngle * Math.PI) / 180;
                const endAngleRad = (endAngle * Math.PI) / 180;

                const x1 = 16 + 14 * Math.cos(startAngleRad);
                const y1 = 16 + 14 * Math.sin(startAngleRad);
                const x2 = 16 + 14 * Math.cos(endAngleRad);
                const y2 = 16 + 14 * Math.sin(endAngleRad);

                const largeArcFlag = percentage > 50 ? 1 : 0;

                const pathData = [
                  `M 16 16`,
                  `L ${x1} ${y1}`,
                  `A 14 14 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');

                return (
                  <path
                    key={label}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {data.labels.map((label: string, index: number) => {
            const value = data.datasets[0].data[index];
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const color = colors[index % colors.length];

            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm truncate">{label}</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [data]);

  const renderLineChart = useMemo(() => {
    if (!data?.labels || !data?.datasets) return null;

    const values = data.datasets[0].data;
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    const points = values.map((value: number, index: number) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - minValue) / range) * 80; // 80% height with margins
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="space-y-4">
        <div className="h-32 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f1f5f9" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />

            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Points */}
            {values.map((value: number, index: number) => {
              const x = (index / (values.length - 1)) * 100;
              const y = 100 - ((value - minValue) / range) * 80;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="#3B82F6"
                  stroke="white"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          {data.labels.map((label: string, index: number) => (
            <span key={label} className="truncate max-w-16">
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }, [data]);

  if (!data) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Dados não disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className={cn("p-4", animation.getContainerClasses())}>
        {config.chartType === 'bar' && renderBarChart}
        {config.chartType === 'pie' && renderPieChart}
        {config.chartType === 'line' && renderLineChart}
        {(!config.chartType || config.chartType === 'area') && (
          <div className="text-center text-muted-foreground">
            Tipo de gráfico não suportado
          </div>
        )}
      </CardContent>
    </Card>
  );
};
