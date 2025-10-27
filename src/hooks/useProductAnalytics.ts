import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  ProductAnalyticsData,
  BusinessValueMetrics,
  RoadmapHealthMetrics,
  OKRTrendsData,
  ProductKPIs,
  ReportFilters,
  BusinessValueTrendPoint,
  BusinessValueByFeature,
  BusinessValueBySegment,
  RoadmapHealthByQuarter,
  RoadmapHealthByFeature,
  OKRHealthMetrics,
} from '@/types/analytics';
import type { Issue } from '@/types/issue';
import type { Sprint } from '@/types/sprint';
import type { OKR } from '@/types/okr';
import { supabase } from '@/integrations/supabase/client';

// Query functions for real data with fallback to mock
const fetchIssuesForAnalytics = async (filters: ReportFilters) => {
  console.log('🔍 useProductAnalytics: Fetching issues for analytics', filters);

  // Try to fetch from Supabase first
  try {
    let query = supabase
      .from('issues')
      .select(`
        *,
        assignee:assignee_id(id, email, full_name),
        reporter:reporter_id(id, email, full_name)
      `);

    // Apply project filter
    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId);
    }

    // Apply date range filter
    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error && data) {
      console.log('✅ useProductAnalytics: Fetched from Supabase:', data.length);
      return data;
    }
  } catch (supabaseErr) {
    console.log('⚠️ useProductAnalytics: Supabase not available, using mock data');
  }

  // Fallback to mock data with filters
  const mockIssues: Issue[] = [
    {
      id: '1',
      title: 'Implement user authentication',
      description: 'Add secure user login and registration',
      status: 'completed',
      priority: 'high',
      issue_type: 'feature',
      story_points: 8,
      business_value: 9,
      customer_segment: 'enterprise',
      created_at: '2024-01-15',
      updated_at: '2024-01-20',
      project_id: filters.projectId || 'proj-1',
      assignee_id: 'user-1',
      reporter_id: 'user-2',
    },
    {
      id: '2',
      title: 'Add dark mode support',
      description: 'Implement dark theme for better user experience',
      status: 'completed',
      priority: 'medium',
      issue_type: 'enhancement',
      story_points: 5,
      business_value: 7,
      customer_segment: 'consumer',
      created_at: '2024-01-10',
      updated_at: '2024-01-18',
      project_id: filters.projectId || 'proj-1',
      assignee_id: 'user-2',
      reporter_id: 'user-1',
    },
    {
      id: '3',
      title: 'Performance optimization',
      description: 'Optimize database queries and API responses',
      status: 'in_progress',
      priority: 'high',
      issue_type: 'bug',
      story_points: 13,
      business_value: 8,
      customer_segment: 'enterprise',
      created_at: '2024-01-25',
      updated_at: '2024-01-30',
      project_id: filters.projectId || 'proj-1',
      assignee_id: 'user-3',
      reporter_id: 'user-1',
    },
  ];

  let filteredIssues = mockIssues.filter(issue => issue.project_id === (filters.projectId || 'proj-1'));

  if (filters.dateRange) {
    filteredIssues = filteredIssues.filter(issue => {
      const issueDate = new Date(issue.created_at);
      const startDate = new Date(filters.dateRange!.start);
      const endDate = new Date(filters.dateRange!.end);
      return issueDate >= startDate && issueDate <= endDate;
    });
  }

  console.log('🔄 useProductAnalytics: Using mock data:', filteredIssues.length);
  return filteredIssues;
};

const fetchSprintsForAnalytics = async (filters: ReportFilters) => {
  console.log('🔍 useProductAnalytics: Fetching sprints for analytics', filters);

  // Try to fetch from Supabase first
  try {
    let query = supabase
      .from('sprints')
      .select('*');

    // Apply project filter
    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId);
    }

    // Apply date range filter
    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error && data) {
      console.log('✅ useProductAnalytics: Fetched sprints from Supabase:', data.length);
      return data;
    }
  } catch (supabaseErr) {
    console.log('⚠️ useProductAnalytics: Supabase not available, using mock data');
  }

  // Fallback to mock data
  const mockSprints: Sprint[] = [
    {
      id: 'sprint-1',
      name: 'Sprint 1',
      description: 'Q1 2024 Sprint 1',
      status: 'completed',
      start_date: '2024-01-01',
      end_date: '2024-01-15',
      project_id: filters.projectId || 'proj-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-15',
    },
    {
      id: 'sprint-2',
      name: 'Sprint 2',
      description: 'Q1 2024 Sprint 2',
      status: 'active',
      start_date: '2024-01-16',
      end_date: '2024-01-30',
      project_id: filters.projectId || 'proj-1',
      created_at: '2024-01-16',
      updated_at: '2024-01-16',
    },
  ];

  let filteredSprints = mockSprints.filter(sprint => sprint.project_id === (filters.projectId || 'proj-1'));

  if (filters.dateRange) {
    filteredSprints = filteredSprints.filter(sprint => {
      const sprintDate = new Date(sprint.created_at);
      const startDate = new Date(filters.dateRange!.start);
      const endDate = new Date(filters.dateRange!.end);
      return sprintDate >= startDate && sprintDate <= endDate;
    });
  }

  console.log('🔄 useProductAnalytics: Using mock sprints:', filteredSprints.length);
  return filteredSprints;
};

const fetchOKRsForAnalytics = async (filters: ReportFilters) => {
  console.log('🔍 useProductAnalytics: Fetching OKRs for analytics', filters);

  // Try to fetch from Supabase first
  try {
    let query = supabase
      .from('okrs')
      .select(`
        *,
        key_results(*)
      `);

    // Apply project filter
    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId);
    }

    // Apply date range filter
    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (!error && data) {
      console.log('✅ useProductAnalytics: Fetched OKRs from Supabase:', data.length);
      return data;
    }
  } catch (supabaseErr) {
    console.log('⚠️ useProductAnalytics: Supabase not available, using mock data');
  }

  // Fallback to mock data
  const mockOKRs: OKR[] = [
    {
      id: 'okr-1',
      title: 'Improve User Experience',
      description: 'Enhance overall user satisfaction',
      quarter: 'Q1 2024',
      status: 'active',
      progress: 75,
      confidence: 80,
      created_at: '2024-01-01',
      updated_at: '2024-01-25',
      project_id: filters.projectId || 'proj-1',
      owner_id: 'user-1',
    },
  ];

  let filteredOKRs = mockOKRs.filter(okr => okr.project_id === (filters.projectId || 'proj-1'));

  if (filters.dateRange) {
    filteredOKRs = filteredOKRs.filter(okr => {
      const okrDate = new Date(okr.created_at);
      const startDate = new Date(filters.dateRange!.start);
      const endDate = new Date(filters.dateRange!.end);
      return okrDate >= startDate && okrDate <= endDate;
    });
  }

  console.log('🔄 useProductAnalytics: Using mock OKRs:', filteredOKRs.length);
  return filteredOKRs;
};

export function useProductAnalytics(filters: ReportFilters) {
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['analytics-issues', filters],
    queryFn: () => fetchIssuesForAnalytics(filters),
    staleTime: 60000, // 1 minute
    retry: 3,
  });

  const { data: sprints = [], isLoading: sprintsLoading } = useQuery({
    queryKey: ['analytics-sprints', filters],
    queryFn: () => fetchSprintsForAnalytics(filters),
    staleTime: 60000, // 1 minute
    retry: 3,
  });

  const { data: okrs = [], isLoading: okrsLoading } = useQuery({
    queryKey: ['analytics-okrs', filters],
    queryFn: () => fetchOKRsForAnalytics(filters),
    staleTime: 60000, // 1 minute
    retry: 3,
  });

  const businessValueMetrics = useMemo((): BusinessValueMetrics => {
    const completedIssues = issues.filter(issue => issue.status === 'completed');
    
    const totalValue = completedIssues.reduce((sum, issue) => sum + (issue.business_value || 0), 0);
    const averageValue = completedIssues.length > 0 ? totalValue / completedIssues.length : 0;

    // Generate trend data by week
    const valueByPeriod: BusinessValueTrendPoint[] = [];
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
      const weekIssues = completedIssues.filter(issue => {
        const issueDate = new Date(issue.updated_at);
        return issueDate >= d && issueDate < new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000);
      });
      
      const weekValue = weekIssues.reduce((sum, issue) => sum + (issue.business_value || 0), 0);
      
      valueByPeriod.push({
        date: d.toISOString().split('T')[0],
        value: weekValue,
        issues: weekIssues.length,
        averageValue: weekIssues.length > 0 ? weekValue / weekIssues.length : 0,
      });
    }

    // Group by feature (using issue_type as proxy)
    const valueByFeature: BusinessValueByFeature[] = [];
    const featureGroups = completedIssues.reduce((groups, issue) => {
      const feature = issue.issue_type || 'unknown';
      if (!groups[feature]) groups[feature] = [];
      groups[feature].push(issue);
      return groups;
    }, {} as Record<string, Issue[]>);

    Object.entries(featureGroups).forEach(([feature, featureIssues]) => {
      const totalValue = featureIssues.reduce((sum, issue) => sum + (issue.business_value || 0), 0);
      valueByFeature.push({
        featureId: feature,
        featureName: feature.charAt(0).toUpperCase() + feature.slice(1),
        totalValue,
        issues: featureIssues.length,
        averageValue: featureIssues.length > 0 ? totalValue / featureIssues.length : 0,
      });
    });

    // Group by customer segment
    const valueBySegment: BusinessValueBySegment[] = [];
    const segmentGroups = completedIssues.reduce((groups, issue) => {
      const segment = issue.customer_segment || 'unknown';
      if (!groups[segment]) groups[segment] = [];
      groups[segment].push(issue);
      return groups;
    }, {} as Record<string, Issue[]>);

    Object.entries(segmentGroups).forEach(([segment, segmentIssues]) => {
      const totalValue = segmentIssues.reduce((sum, issue) => sum + (issue.business_value || 0), 0);
      valueBySegment.push({
        segment,
        totalValue,
        issues: segmentIssues.length,
        averageValue: segmentIssues.length > 0 ? totalValue / segmentIssues.length : 0,
      });
    });

    return {
      totalValue,
      averageValue,
      valueByPeriod,
      valueByFeature,
      valueBySegment,
    };
  }, [issues, filters.dateRange]);

  const roadmapHealthMetrics = useMemo((): RoadmapHealthMetrics => {
    const completedSprints = sprints.filter(sprint => sprint.status === 'completed');
    const totalSprints = sprints.length;
    
    // Calculate on-time delivery (simplified)
    const onTimeDelivery = totalSprints > 0 ? (completedSprints.length / totalSprints) * 100 : 0;
    
    // Calculate scope stability (simplified - based on issue changes)
    const scopeStability = 85; // Mock value
    
    // Calculate risk level (simplified)
    const riskLevel = 25; // Mock value
    
    // Overall score calculation
    const overallScore = Math.round((onTimeDelivery * 0.4) + (scopeStability * 0.3) + ((100 - riskLevel) * 0.3));

    // Health by quarter
    const healthByQuarter: RoadmapHealthByQuarter[] = [
      {
        quarter: 'Q1 2024',
        score: overallScore,
        delivered: completedSprints.length,
        planned: totalSprints,
        delayed: 0,
        cancelled: 0,
      },
    ];

    // Health by feature
    const healthByFeature: RoadmapHealthByFeature[] = [
      {
        featureId: 'auth',
        featureName: 'Authentication',
        score: 90,
        status: 'on-track',
        progress: 100,
      },
      {
        featureId: 'dark-mode',
        featureName: 'Dark Mode',
        score: 85,
        status: 'on-track',
        progress: 100,
      },
      {
        featureId: 'performance',
        featureName: 'Performance',
        score: 60,
        status: 'at-risk',
        progress: 50,
      },
    ];

    return {
      overallScore,
      onTimeDelivery,
      scopeStability,
      riskLevel,
      healthByQuarter,
      healthByFeature,
    };
  }, [sprints]);

  const okrTrends = useMemo((): OKRTrendsData[] => {
    const activeOKRs = okrs.filter(okr => okr.status === 'active');
    const completedOKRs = okrs.filter(okr => okr.status === 'completed');
    
    const objectivesCompleted = completedOKRs.length;
    const objectivesTotal = okrs.length;
    const keyResultsCompleted = Math.floor(objectivesCompleted * 2.5); // Mock calculation
    const keyResultsTotal = Math.floor(objectivesTotal * 3); // Mock calculation
    const averageProgress = okrs.length > 0 ? okrs.reduce((sum, okr) => sum + okr.progress, 0) / okrs.length : 0;

    const okrHealth: OKRHealthMetrics = {
      overallScore: Math.round(averageProgress),
      objectivesOnTrack: Math.floor(activeOKRs.length * 0.7),
      objectivesAtRisk: Math.floor(activeOKRs.length * 0.2),
      objectivesDelayed: Math.floor(activeOKRs.length * 0.1),
      keyResultsCompleted,
      keyResultsTotal,
      averageConfidence: okrs.length > 0 ? okrs.reduce((sum, okr) => sum + okr.confidence, 0) / okrs.length : 0,
    };

    return [
      {
        period: 'Q1 2024',
        objectivesCompleted,
        objectivesTotal,
        keyResultsCompleted,
        keyResultsTotal,
        averageProgress,
        okrHealth,
      },
    ];
  }, [okrs]);

  const productKPIs = useMemo((): ProductKPIs => {
    return {
      totalBusinessValue: businessValueMetrics.totalValue,
      averageBusinessValue: businessValueMetrics.averageValue,
      roadmapHealthScore: roadmapHealthMetrics.overallScore,
      okrCompletionRate: okrTrends.length > 0 ? (okrTrends[0].objectivesCompleted / okrTrends[0].objectivesTotal) * 100 : 0,
      featureDeliveryRate: 85, // Mock value
      customerSatisfactionScore: 4.2, // Mock value
      timeToMarket: 14, // Mock value - average days
      productVelocity: businessValueMetrics.totalValue / Math.max(sprints.length, 1), // business value per sprint
    };
  }, [businessValueMetrics, roadmapHealthMetrics, okrTrends, sprints.length]);

  const productAnalyticsData = useMemo((): ProductAnalyticsData => {
    return {
      businessValue: businessValueMetrics,
      roadmapHealth: roadmapHealthMetrics,
      okrTrends,
      productKPIs,
    };
  }, [businessValueMetrics, roadmapHealthMetrics, okrTrends, productKPIs]);

  const isLoading = issuesLoading || sprintsLoading || okrsLoading;

  return {
    data: productAnalyticsData,
    isLoading,
    error: null,
  };
}
