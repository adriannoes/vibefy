// Main components
export { DashboardManager } from './DashboardManager';
export { CustomDashboard } from './CustomDashboard';
export { WidgetEditor } from './WidgetEditor';
export { DashboardExporter } from './DashboardExporter';

// Widget components
export { MetricWidget } from './widgets/MetricWidget';
export { ChartWidget } from './widgets/ChartWidget';
export { TableWidget } from './widgets/TableWidget';
export { InsightsWidget } from './widgets/InsightsWidget';
export { ThemesWidget } from './widgets/ThemesWidget';

// Hooks
export {
  useDashboards,
  useDashboard,
  useDashboardTemplates,
  useCreateDashboard,
  useUpdateDashboard,
  useDeleteDashboard,
  useDuplicateDashboard,
  useDashboardData,
} from '@/hooks/useDashboard';

// Types
export type {
  Dashboard,
  DashboardWidget,
  DashboardTemplate,
  DashboardFilter,
  DashboardExportOptions,
  WidgetType,
  ChartType,
  MetricType,
  TimeRange,
} from '@/types/dashboard';

// Utilities
export { exportDashboard } from '@/lib/dashboardExport';
