export type WidgetType =
  | 'metric'
  | 'chart'
  | 'table'
  | 'insights'
  | 'themes'
  | 'timeline'
  | 'distribution';

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter';

export type MetricType =
  | 'count'
  | 'percentage'
  | 'average'
  | 'sum'
  | 'trend';

export type TimeRange =
  | '7d'
  | '30d'
  | '90d'
  | '1y'
  | 'custom';

export type DashboardLayout = 'grid' | 'masonry' | 'flex';

export interface DashboardFilter {
  id: string;
  type: 'date' | 'status' | 'priority' | 'source' | 'sentiment' | 'theme' | 'customer';
  label: string;
  value: any;
  operator: 'equals' | 'contains' | 'range' | 'in';
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
  dataSource: string; // 'feedback' | 'issues' | 'analytics' | etc.
  filters: DashboardFilter[];
  refreshInterval?: number; // in minutes
  isVisible: boolean;
}

export interface WidgetConfig {
  // Metric widget config
  metricType?: MetricType;
  metricField?: string;
  showTrend?: boolean;
  trendPeriod?: string;

  // Chart widget config
  chartType?: ChartType;
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  aggregate?: 'count' | 'sum' | 'avg' | 'min' | 'max';
  colors?: string[];

  // Table widget config
  columns?: string[];
  sortable?: boolean;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;

  // Insights/Themes widget config
  maxItems?: number;
  showDetails?: boolean;

  // Timeline widget config
  dateField?: string;
  eventField?: string;
  colorField?: string;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'product' | 'customer-success' | 'engineering' | 'marketing' | 'sales';
  widgets: Omit<DashboardWidget, 'id'>[];
  layout: DashboardLayout;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  timeRange: TimeRange;
  customDateRange?: {
    start: string;
    end: string;
  };
  isPublic: boolean;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface DashboardExportOptions {
  format: 'pdf' | 'png' | 'csv' | 'xlsx';
  includeFilters: boolean;
  includeMetadata: boolean;
  dateRange: TimeRange;
  customRange?: {
    start: string;
    end: string;
  };
  widgets?: string[]; // widget IDs to include
  orientation?: 'portrait' | 'landscape';
  paperSize?: 'a4' | 'letter' | 'a3';
}

export interface DashboardShareOptions {
  isPublic: boolean;
  allowedUsers?: string[];
  allowEdit?: boolean;
  expiresAt?: string;
  password?: string;
}

export interface DashboardStats {
  totalViews: number;
  totalShares: number;
  averageLoadTime: number;
  lastUpdated: string;
  widgetCount: number;
  dataPoints: number;
}
