export interface ProjectKPIs {
  totalIssues: number;
  completedIssues: number;
  inProgressIssues: number;
  backlogIssues: number;
  averageResolutionTime: number; // in days
  velocity: number; // story points per sprint
  burndownRate: number; // percentage
}

export interface IssueTrendData {
  date: string;
  created: number;
  completed: number;
  inProgress: number;
}

export interface StatusDistributionData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AssigneeWorkloadData {
  assigneeId: string;
  assigneeName: string;
  totalIssues: number;
  completedIssues: number;
  inProgressIssues: number;
  storyPoints: number;
  avatarUrl?: string;
}

export interface SprintVelocityData {
  sprintId: string;
  sprintName: string;
  committedPoints: number;
  completedPoints: number;
  velocity: number;
  startDate: string;
  endDate: string;
}

export interface ProjectKPIs {
  totalIssues: number;
  completedIssues: number;
  inProgressIssues: number;
  backlogIssues: number;
  averageResolutionTime: number; // in days
  velocity: number; // story points per sprint
  burndownRate: number; // percentage
}

export interface IssueTrendData {
  date: string;
  created: number;
  completed: number;
  inProgress: number;
}

export interface StatusDistributionData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface AssigneeWorkloadData {
  assigneeId: string;
  assigneeName: string;
  totalIssues: number;
  completedIssues: number;
  inProgressIssues: number;
  storyPoints: number;
  avatarUrl?: string;
}

export interface SprintVelocityData {
  sprintId: string;
  sprintName: string;
  committedPoints: number;
  completedPoints: number;
  velocity: number;
  startDate: string;
  endDate: string;
}

// Product-specific analytics types
export interface BusinessValueMetrics {
  totalValue: number;
  averageValue: number;
  valueByPeriod: BusinessValueTrendPoint[];
  valueByFeature: BusinessValueByFeature[];
  valueByCustomerSegment: BusinessValueBySegment[];
}

export interface BusinessValueTrendPoint {
  date: string;
  value: number;
  issues: number;
  averageValue: number;
}

export interface BusinessValueByFeature {
  featureId: string;
  featureName: string;
  totalValue: number;
  issues: number;
  averageValue: number;
}

export interface BusinessValueBySegment {
  segment: string;
  totalValue: number;
  issues: number;
  averageValue: number;
}

export interface RoadmapHealthMetrics {
  overallScore: number; // 0-100
  onTimeDelivery: number; // percentage
  scopeStability: number; // percentage
  riskLevel: number; // 0-100 (lower is better)
  healthByQuarter: RoadmapHealthByQuarter[];
  healthByFeature: RoadmapHealthByFeature[];
}

export interface RoadmapHealthByQuarter {
  quarter: string;
  score: number;
  delivered: number;
  planned: number;
  delayed: number;
  cancelled: number;
}

export interface RoadmapHealthByFeature {
  featureId: string;
  featureName: string;
  score: number;
  status: 'on-track' | 'at-risk' | 'delayed' | 'cancelled';
  progress: number; // percentage
}

export interface OKRTrendsData {
  period: string;
  objectivesCompleted: number;
  objectivesTotal: number;
  keyResultsCompleted: number;
  keyResultsTotal: number;
  averageProgress: number; // percentage
  okrHealth: OKRHealthMetrics;
}

export interface OKRHealthMetrics {
  overallScore: number; // 0-100
  objectivesOnTrack: number;
  objectivesAtRisk: number;
  objectivesDelayed: number;
  keyResultsCompleted: number;
  keyResultsTotal: number;
  averageConfidence: number; // 0-100
}

export interface ProductAnalyticsData {
  businessValue: BusinessValueMetrics;
  roadmapHealth: RoadmapHealthMetrics;
  okrTrends: OKRTrendsData[];
  productKPIs: ProductKPIs;
}

export interface ProductKPIs {
  totalBusinessValue: number;
  averageBusinessValue: number;
  roadmapHealthScore: number;
  okrCompletionRate: number;
  featureDeliveryRate: number;
  customerSatisfactionScore: number;
  timeToMarket: number; // average days
  productVelocity: number; // business value per sprint
}

export interface ReportFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  projectId?: string;
  assigneeId?: string;
  issueType?: string;
  priority?: string;
  productId?: string;
  featureId?: string;
  customerSegment?: string;
}

export type DateRangePreset = 
  | 'last_7_days'
  | 'last_30_days'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'custom';

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  includeCharts: boolean;
  dateRange: ReportFilters['dateRange'];
}
