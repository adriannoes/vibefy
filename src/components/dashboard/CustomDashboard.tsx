import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Settings,
  Share,
  Download,
  Calendar as CalendarIcon,
  Filter,
  Grid,
  Layout,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Zap,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Dashboard, DashboardWidget, TimeRange, DashboardFilter } from '@/types/dashboard';
import { useDashboardData } from '@/hooks/useDashboard';
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';
import { MetricWidget } from './widgets/MetricWidget';
import { ChartWidget } from './widgets/ChartWidget';
import { TableWidget } from './widgets/TableWidget';
import { InsightsWidget } from './widgets/InsightsWidget';
import { ThemesWidget } from './widgets/ThemesWidget';
import { ConnectionIndicator } from './ConnectionIndicator';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { cn } from '@/lib/utils';

interface CustomDashboardProps {
  dashboard: Dashboard;
  feedback: any[];
  onUpdateDashboard?: (updates: Partial<Dashboard>) => void;
  onAddWidget?: () => void;
  onEditWidget?: (widgetId: string) => void;
  onDeleteWidget?: (widgetId: string) => void;
  className?: string;
}

export const CustomDashboard: React.FC<CustomDashboardProps> = ({
  dashboard,
  feedback,
  onUpdateDashboard,
  onAddWidget,
  onEditWidget,
  onDeleteWidget,
  className,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(dashboard.timeRange);
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | null>(
    dashboard.customDateRange ? {
      start: new Date(dashboard.customDateRange.start),
      end: new Date(dashboard.customDateRange.end),
    } : null
  );
  const [activeFilters, setActiveFilters] = useState<DashboardFilter[]>(dashboard.filters || []);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Real-time functionality
  const {
    status: realtimeStatus,
    notifications,
    refreshData: refreshRealtimeData,
    removeNotification,
    clearNotifications,
    hasPendingUpdates
  } = useRealtimeDashboard({
    enabled: true,
    refreshInterval: 300, // 5 minutes fallback refresh
    notifyOnChanges: true,
  });

  const filteredFeedback = useMemo(() => {
    let filtered = [...feedback];

    // Apply time range filter
    if (selectedTimeRange !== 'custom' && selectedTimeRange !== '1y') {
      const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(f => new Date(f.created_at) >= cutoffDate);
    } else if (selectedTimeRange === 'custom' && customDateRange) {
      filtered = filtered.filter(f =>
        new Date(f.created_at) >= customDateRange.start &&
        new Date(f.created_at) <= customDateRange.end
      );
    }

    // Apply dashboard filters
    activeFilters.forEach(filter => {
      filtered = filtered.filter(item => {
        const value = item[filter.type as keyof typeof item];
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'in':
            return Array.isArray(filter.value) ? filter.value.includes(value) : false;
          case 'range':
            return Array.isArray(filter.value) &&
                   value >= filter.value[0] &&
                   value <= filter.value[1];
          default:
            return true;
        }
      });
    });

    return filtered;
  }, [feedback, selectedTimeRange, customDateRange, activeFilters]);

  const dashboardData = useDashboardData(dashboard.widgets, filteredFeedback, selectedTimeRange);

  const handleTimeRangeChange = useCallback((timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
    onUpdateDashboard?.({
      timeRange,
      customDateRange: timeRange === 'custom' && customDateRange ? {
        start: customDateRange.start.toISOString(),
        end: customDateRange.end.toISOString(),
      } : undefined
    });
  }, [customDateRange, onUpdateDashboard]);

  const handleCustomDateChange = useCallback((range: { start: Date; end: Date } | null) => {
    setCustomDateRange(range);
    if (range) {
      onUpdateDashboard?.({
        timeRange: 'custom',
        customDateRange: {
          start: range.start.toISOString(),
          end: range.end.toISOString(),
        }
      });
    }
  }, [onUpdateDashboard]);

  const renderWidget = useCallback((widget: DashboardWidget) => {
    const data = dashboardData[widget.id];

    switch (widget.type) {
      case 'metric':
        return <MetricWidget key={widget.id} widget={widget} data={data} />;
      case 'chart':
        return <ChartWidget key={widget.id} widget={widget} data={data} />;
      case 'table':
        return <TableWidget key={widget.id} widget={widget} data={data} />;
      case 'insights':
        return <InsightsWidget key={widget.id} widget={widget} data={data} />;
      case 'themes':
        return <ThemesWidget key={widget.id} widget={widget} data={data} />;
      default:
        return (
          <Card key={widget.id} className="h-full">
            <CardContent className="p-4">
              <p className="text-muted-foreground">Widget type not supported</p>
            </CardContent>
          </Card>
        );
    }
  }, [dashboardData]);

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'metric': return <TrendingUp className="h-4 w-4" />;
      case 'chart': return <BarChart3 className="h-4 w-4" />;
      case 'table': return <Grid className="h-4 w-4" />;
      case 'insights': return <Zap className="h-4 w-4" />;
      case 'themes': return <Target className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: '1y', label: 'Último ano' },
    { value: 'custom', label: 'Personalizado' },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dashboard.name}</h1>
          {dashboard.description && (
            <p className="text-muted-foreground mt-1">{dashboard.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <ConnectionIndicator
            status={realtimeStatus}
            onRefresh={refreshRealtimeData}
            isRefreshing={false}
          />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notifications.length > 9 ? '9+' : notifications.length}
                </Badge>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 z-50">
                <NotificationCenter
                  notifications={notifications}
                  onRemoveNotification={removeNotification}
                  onClearAll={clearNotifications}
                />
              </div>
            )}
          </div>

          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditMode ? 'Modo Visualização' : 'Editar Dashboard'}
          </Button>

          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>

          {onAddWidget && (
            <Button size="sm" onClick={onAddWidget}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Widget
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRangeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTimeRange === 'custom' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        {customDateRange
                          ? `${format(customDateRange.start, 'dd/MM/yyyy')} - ${format(customDateRange.end, 'dd/MM/yyyy')}`
                          : 'Selecionar período'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={customDateRange || undefined}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            handleCustomDateChange({ start: range.from, end: range.to });
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  {activeFilters.map(filter => (
                    <Badge key={filter.id} variant="secondary">
                      {filter.label}: {filter.value}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {filteredFeedback.length} itens
              </Badge>
              <Badge variant="outline">
                {dashboard.widgets.filter(w => w.isVisible).length} widgets
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Widgets Grid */}
      <div className={cn(
        "grid gap-6",
        dashboard.layout === 'grid' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        dashboard.layout === 'masonry' && "columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6",
        dashboard.layout === 'flex' && "flex flex-wrap gap-6"
      )}>
        {dashboard.widgets
          .filter(widget => widget.isVisible)
          .sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x)
          .map(widget => (
            <div
              key={widget.id}
              className={cn(
                "relative group",
                dashboard.layout === 'grid' && `col-span-${Math.min(widget.position.width, 4)}`,
                isEditMode && "ring-2 ring-dashed ring-muted-foreground/50 rounded-lg"
              )}
              style={dashboard.layout !== 'grid' ? {
                width: `${(widget.position.width / 12) * 100}%`,
                minWidth: '300px',
              } : undefined}
            >
              {isEditMode && (
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    {onEditWidget && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onEditWidget(widget.id)}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    )}
                    {onDeleteWidget && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteWidget(widget.id)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                {getWidgetIcon(widget.type)}
                <h3 className="font-medium">{widget.title}</h3>
                {hasPendingUpdates && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    <span className="text-xs text-orange-600 font-medium">Atualizando...</span>
                  </div>
                )}
              </div>

              {renderWidget(widget)}
            </div>
          ))}
      </div>

      {/* Empty State */}
      {dashboard.widgets.filter(w => w.isVisible).length === 0 && (
        <Card className="text-center p-12">
          <div className="flex flex-col items-center gap-4">
            <Layout className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Dashboard vazio</h3>
              <p className="text-muted-foreground">
                Adicione widgets para começar a visualizar seus dados
              </p>
            </div>
            {onAddWidget && (
              <Button onClick={onAddWidget}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Widget
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
