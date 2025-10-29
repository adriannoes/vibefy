import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  Dashboard,
  DashboardWidget,
  DashboardTemplate,
  DashboardFilter,
  DashboardExportOptions,
  WidgetType,
  TimeRange
} from '@/types/dashboard';
import type { CustomerFeedback } from '@/types/feedback';

// Mock data for development
const mockDashboards: Dashboard[] = [
  {
    id: 'dashboard-1',
    name: 'Product Feedback Overview',
    description: 'Comprehensive view of all product feedback and metrics',
    layout: 'grid',
    widgets: [
      {
        id: 'widget-1',
        type: 'metric',
        title: 'Total Feedback',
        position: { x: 0, y: 0, width: 3, height: 2 },
        config: { metricType: 'count', showTrend: true },
        dataSource: 'feedback',
        filters: [],
        isVisible: true,
      },
      {
        id: 'widget-2',
        type: 'chart',
        title: 'Sentiment Distribution',
        position: { x: 3, y: 0, width: 6, height: 4 },
        config: { chartType: 'pie', groupBy: 'sentiment' },
        dataSource: 'feedback',
        filters: [],
        isVisible: true,
      },
      {
        id: 'widget-3',
        type: 'insights',
        title: 'AI Insights',
        position: { x: 0, y: 2, width: 9, height: 3 },
        config: { maxItems: 5, showDetails: true },
        dataSource: 'feedback',
        filters: [],
        isVisible: true,
      }
    ],
    filters: [],
    timeRange: '30d',
    isPublic: false,
    isDefault: true,
    createdBy: 'user1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

const mockTemplates: DashboardTemplate[] = [
  {
    id: 'template-1',
    name: 'Customer Success Dashboard',
    description: 'Focus on customer satisfaction and support metrics',
    category: 'customer-success',
    widgets: [
      {
        type: 'metric',
        title: 'Customer Satisfaction',
        position: { x: 0, y: 0, width: 4, height: 2 },
        config: { metricType: 'percentage', metricField: 'positive_sentiment' },
        dataSource: 'feedback',
        filters: [],
        isVisible: true,
      },
      {
        type: 'chart',
        title: 'Support Response Time',
        position: { x: 4, y: 0, width: 8, height: 4 },
        config: { chartType: 'line', xAxis: 'date', yAxis: 'response_time' },
        dataSource: 'issues',
        filters: [],
        isVisible: true,
      }
    ],
    layout: 'grid',
    isPublic: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
  }
];

// Hook for fetching dashboards
export const useDashboards = (userId?: string) => {
  return useQuery({
    queryKey: ['dashboards', userId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('dashboards')
          .select('*')
          .order('updated_at', { ascending: false });

        if (userId) {
          query = query.or(`created_by.eq.${userId},is_public.eq.true`);
        } else {
          query = query.eq('is_public', true);
        }

        const { data, error } = await query;

        if (!error && data) {
          return data as Dashboard[];
        }
      } catch (error) {
        console.log('⚠️ useDashboards: Supabase not available, using mock data');
      }

      // Fallback to mock data
      return mockDashboards;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching a single dashboard
export const useDashboard = (dashboardId: string) => {
  return useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('dashboards')
          .select('*')
          .eq('id', dashboardId)
          .single();

        if (!error && data) {
          return data as Dashboard;
        }
      } catch (error) {
        console.log('⚠️ useDashboard: Supabase not available, using mock data');
      }

      // Fallback to mock data
      return mockDashboards.find(d => d.id === dashboardId);
    },
    enabled: !!dashboardId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for fetching dashboard templates
export const useDashboardTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['dashboard-templates', category],
    queryFn: async () => {
      try {
        let query = supabase
          .from('dashboard_templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (!error && data) {
          return data as DashboardTemplate[];
        }
      } catch (error) {
        console.log('⚠️ useDashboardTemplates: Supabase not available, using mock data');
      }

      // Fallback to mock data
      return category
        ? mockTemplates.filter(t => t.category === category)
        : mockTemplates;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for creating dashboards
export const useCreateDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const { data, error } = await supabase
          .from('dashboards')
          .insert(dashboard)
          .select()
          .single();

        if (error) throw error;
        return data as Dashboard;
      } catch (error) {
        console.log('⚠️ useCreateDashboard: Supabase not available, simulating creation');
        return {
          ...dashboard,
          id: `dashboard-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Dashboard;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
};

// Hook for updating dashboards
export const useUpdateDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Dashboard> }) => {
      try {
        const { data, error } = await supabase
          .from('dashboards')
          .update({ ...updates, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data as Dashboard;
      } catch (error) {
        console.log('⚠️ useUpdateDashboard: Supabase not available, simulating update');
        return { id, ...updates } as Dashboard;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Hook for deleting dashboards
export const useDeleteDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dashboardId: string) => {
      try {
        const { error } = await supabase
          .from('dashboards')
          .delete()
          .eq('id', dashboardId);

        if (error) throw error;
      } catch (error) {
        console.log('⚠️ useDeleteDashboard: Supabase not available, simulating deletion');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
};

// Hook for duplicating dashboards
export const useDuplicateDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dashboardId: string) => {
      const original = await queryClient.fetchQuery({
        queryKey: ['dashboard', dashboardId],
      });

      if (!original) throw new Error('Dashboard not found');

      const duplicated: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'> = {
        ...original,
        name: `${original.name} (Copy)`,
        isDefault: false,
        isPublic: false,
      };

      try {
        const { data, error } = await supabase
          .from('dashboards')
          .insert(duplicated)
          .select()
          .single();

        if (error) throw error;
        return data as Dashboard;
      } catch (error) {
        console.log('⚠️ useDuplicateDashboard: Supabase not available, simulating duplication');
        return {
          ...duplicated,
          id: `dashboard-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Dashboard;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
};

// Hook for dashboard data processing
export const useDashboardData = (
  widgets: DashboardWidget[],
  feedback: CustomerFeedback[],
  timeRange: TimeRange
) => {
  return useMemo(() => {
    const processedData: Record<string, any> = {};

    widgets.forEach(widget => {
      if (!widget.isVisible) return;

      switch (widget.type) {
        case 'metric':
          processedData[widget.id] = processMetricWidget(widget, feedback);
          break;
        case 'chart':
          processedData[widget.id] = processChartWidget(widget, feedback);
          break;
        case 'table':
          processedData[widget.id] = processTableWidget(widget, feedback);
          break;
        case 'insights':
          processedData[widget.id] = processInsightsWidget(widget, feedback);
          break;
        case 'themes':
          processedData[widget.id] = processThemesWidget(widget, feedback);
          break;
        default:
          processedData[widget.id] = null;
      }
    });

    return processedData;
  }, [widgets, feedback, timeRange]);
};

// Helper functions for data processing
const processMetricWidget = (widget: DashboardWidget, feedback: CustomerFeedback[]) => {
  const config = widget.config;
  let value = 0;

  switch (config.metricType) {
    case 'count':
      value = feedback.length;
      break;
    case 'percentage':
      if (config.metricField === 'positive_sentiment') {
        const positive = feedback.filter(f =>
          f.sentiment === 'positive' || f.sentiment === 'very_positive'
        ).length;
        value = feedback.length > 0 ? (positive / feedback.length) * 100 : 0;
      }
      break;
    default:
      value = feedback.length;
  }

  return {
    value,
    formatted: config.metricType === 'percentage' ? `${value.toFixed(1)}%` : value.toString(),
    trend: config.showTrend ? calculateTrend(feedback) : null,
  };
};

const processChartWidget = (widget: DashboardWidget, feedback: CustomerFeedback[]) => {
  const config = widget.config;

  // Group data based on configuration
  const grouped = feedback.reduce((acc, item) => {
    const key = item[config.groupBy as keyof CustomerFeedback] as string;
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {} as Record<string, number>);

  return {
    labels: Object.keys(grouped),
    datasets: [{
      data: Object.values(grouped),
      backgroundColor: config.colors || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'],
    }],
  };
};

const processTableWidget = (widget: DashboardWidget, feedback: CustomerFeedback[]) => {
  const config = widget.config;
  const columns = config.columns || ['title', 'status', 'priority', 'created_at'];

  return {
    columns,
    data: feedback.map(item => {
      const row: Record<string, any> = {};
      columns.forEach(col => {
        row[col] = item[col as keyof CustomerFeedback];
      });
      return row;
    }),
  };
};

const processInsightsWidget = (widget: DashboardWidget, feedback: CustomerFeedback[]) => {
  // Reuse existing insights logic
  const totalFeedback = feedback.length;
  const positiveFeedback = feedback.filter(f =>
    f.sentiment === 'positive' || f.sentiment === 'very_positive'
  ).length;

  const positivePercentage = (positiveFeedback / totalFeedback) * 100;

  return {
    insights: [
      {
        title: 'Customer Satisfaction',
        value: `${positivePercentage.toFixed(1)}%`,
        type: positivePercentage > 70 ? 'positive' : 'warning',
      },
      {
        title: 'Total Feedback',
        value: totalFeedback.toString(),
        type: 'info',
      },
    ],
  };
};

const processThemesWidget = (widget: DashboardWidget, feedback: CustomerFeedback[]) => {
  // Group by themes (simplified)
  const themes = feedback.reduce((acc, item) => {
    const theme = item.tags[0] || 'General';
    if (!acc[theme]) acc[theme] = 0;
    acc[theme]++;
    return acc;
  }, {} as Record<string, number>);

  return {
    themes: Object.entries(themes).map(([name, count]) => ({
      name,
      count,
      percentage: (count / feedback.length) * 100,
    })),
  };
};

const calculateTrend = (feedback: CustomerFeedback[]) => {
  // Simplified trend calculation
  const recent = feedback.filter(f =>
    new Date(f.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const older = feedback.filter(f =>
    new Date(f.created_at) <= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
    new Date(f.created_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  ).length;

  if (recent > older) return 'up';
  if (recent < older) return 'down';
  return 'stable';
};
