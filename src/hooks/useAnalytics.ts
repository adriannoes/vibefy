import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  ProjectKPIs, 
  IssueTrendData, 
  StatusDistributionData, 
  AssigneeWorkloadData, 
  SprintVelocityData,
  ReportFilters 
} from '@/types/analytics';

export const useAnalytics = (filters: ReportFilters) => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<ProjectKPIs | null>(null);
  const [issueTrends, setIssueTrends] = useState<IssueTrendData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistributionData[]>([]);
  const [assigneeWorkload, setAssigneeWorkload] = useState<AssigneeWorkloadData[]>([]);
  const [sprintVelocity, setSprintVelocity] = useState<SprintVelocityData[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - will be replaced with real Supabase queries
  const generateMockData = () => {
    // Mock KPIs
    const mockKPIs: ProjectKPIs = {
      totalIssues: 45,
      completedIssues: 28,
      inProgressIssues: 12,
      backlogIssues: 5,
      averageResolutionTime: 3.2,
      velocity: 42,
      burndownRate: 85
    };

    // Mock issue trends (last 30 days)
    const mockTrends: IssueTrendData[] = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        created: Math.floor(Math.random() * 8) + 1,
        completed: Math.floor(Math.random() * 6) + 1,
        inProgress: Math.floor(Math.random() * 5) + 2
      };
    });

    // Mock status distribution
    const mockStatusDistribution: StatusDistributionData[] = [
      { status: 'Done', count: 28, percentage: 62.2, color: '#10b981' },
      { status: 'In Progress', count: 12, percentage: 26.7, color: '#3b82f6' },
      { status: 'To Do', count: 3, percentage: 6.7, color: '#6b7280' },
      { status: 'In Review', count: 2, percentage: 4.4, color: '#f59e0b' }
    ];

    // Mock assignee workload
    const mockAssigneeWorkload: AssigneeWorkloadData[] = [
      {
        assigneeId: 'user1',
        assigneeName: 'João Silva',
        totalIssues: 15,
        completedIssues: 12,
        inProgressIssues: 3,
        storyPoints: 45,
        avatarUrl: 'https://github.com/joao.png'
      },
      {
        assigneeId: 'user2',
        assigneeName: 'Maria Santos',
        totalIssues: 12,
        completedIssues: 8,
        inProgressIssues: 4,
        storyPoints: 38,
        avatarUrl: 'https://github.com/maria.png'
      },
      {
        assigneeId: 'user3',
        assigneeName: 'Pedro Costa',
        totalIssues: 10,
        completedIssues: 6,
        inProgressIssues: 4,
        storyPoints: 32,
        avatarUrl: 'https://github.com/pedro.png'
      }
    ];

    // Mock sprint velocity
    const mockSprintVelocity: SprintVelocityData[] = [
      {
        sprintId: 'sprint1',
        sprintName: 'Sprint 1',
        committedPoints: 40,
        completedPoints: 38,
        velocity: 38,
        startDate: '2024-01-01',
        endDate: '2024-01-14'
      },
      {
        sprintId: 'sprint2',
        sprintName: 'Sprint 2',
        committedPoints: 45,
        completedPoints: 42,
        velocity: 42,
        startDate: '2024-01-15',
        endDate: '2024-01-28'
      },
      {
        sprintId: 'sprint3',
        sprintName: 'Sprint 3',
        committedPoints: 50,
        completedPoints: 35,
        velocity: 35,
        startDate: '2024-01-29',
        endDate: '2024-02-11'
      }
    ];

    return {
      kpis: mockKPIs,
      trends: mockTrends,
      statusDistribution: mockStatusDistribution,
      assigneeWorkload: mockAssigneeWorkload,
      sprintVelocity: mockSprintVelocity
    };
  };

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Try to fetch real data from Supabase first
      try {
        console.log('🔍 useAnalytics: Attempting to fetch from Supabase...');

        const { data: issues, error: issuesError } = await supabase
          .from('issues')
          .select(`
            *,
            assignee:assignee_id(id, email, full_name),
            reporter:reporter_id(id, email, full_name)
          `)
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString())
          .eq('project_id', filters.projectId || '1');

        if (!issuesError && issues) {
          console.log('✅ useAnalytics: Fetched real data from Supabase:', issues.length);

          // Process real data to generate analytics
          const processedData = processAnalyticsData(issues);
          setKpis(processedData.kpis);
          setIssueTrends(processedData.trends);
          setStatusDistribution(processedData.statusDistribution);
          setAssigneeWorkload(processedData.assigneeWorkload);
          setSprintVelocity(processedData.sprintVelocity);
          return;
        }
      } catch (supabaseErr) {
        console.log('⚠️ useAnalytics: Supabase not available, using mock data');
      }

      // Fallback to mock data
      console.log('🔄 useAnalytics: Using mock data');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

      const mockData = generateMockData();
      setKpis(mockData.kpis);
      setIssueTrends(mockData.trends);
      setStatusDistribution(mockData.statusDistribution);
      setAssigneeWorkload(mockData.assigneeWorkload);
      setSprintVelocity(mockData.sprintVelocity);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  // Helper function to process real data into analytics format
  const processAnalyticsData = (issues: any[]) => {
    // Process issues to generate KPIs
    const totalIssues = issues.length;
    const completedIssues = issues.filter(i => i.status === 'completed').length;
    const inProgressIssues = issues.filter(i => i.status === 'in_progress').length;
    const backlogIssues = issues.filter(i => i.status === 'backlog').length;

    const kpis: ProjectKPIs = {
      totalIssues,
      completedIssues,
      inProgressIssues,
      backlogIssues,
      averageResolutionTime: 3.2, // TODO: Calculate from real data
      velocity: Math.floor(completedIssues * 1.5), // TODO: Calculate properly
      burndownRate: Math.round((completedIssues / totalIssues) * 100) || 0
    };

    // Generate trends (simplified - group by date)
    const trendsMap = new Map<string, { created: number; completed: number; inProgress: number }>();

    issues.forEach(issue => {
      const date = issue.created_at.split('T')[0];
      if (!trendsMap.has(date)) {
        trendsMap.set(date, { created: 0, completed: 0, inProgress: 0 });
      }

      const dayData = trendsMap.get(date)!;
      if (issue.status === 'completed') dayData.completed++;
      else if (issue.status === 'in_progress') dayData.inProgress++;
      dayData.created++;
    });

    const trends: IssueTrendData[] = Array.from(trendsMap.entries()).map(([date, data]) => ({
      date,
      created: data.created,
      completed: data.completed,
      inProgress: data.inProgress
    }));

    // Status distribution
    const statusCounts = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution: StatusDistributionData[] = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      count,
      percentage: Math.round((count / totalIssues) * 100),
      color: status === 'completed' ? '#10b981' :
             status === 'in_progress' ? '#3b82f6' :
             status === 'backlog' ? '#6b7280' : '#f59e0b'
    }));

    // Assignee workload
    const assigneeMap = new Map<string, { name: string; total: number; completed: number; inProgress: number; points: number }>();

    issues.forEach(issue => {
      const assigneeId = issue.assignee_id || 'unassigned';
      const assigneeName = issue.assignee?.full_name || issue.assignee?.email || 'Unassigned';

      if (!assigneeMap.has(assigneeId)) {
        assigneeMap.set(assigneeId, { name: assigneeName, total: 0, completed: 0, inProgress: 0, points: 0 });
      }

      const assignee = assigneeMap.get(assigneeId)!;
      assignee.total++;
      assignee.points += issue.story_points || 0;

      if (issue.status === 'completed') assignee.completed++;
      else if (issue.status === 'in_progress') assignee.inProgress++;
    });

    const assigneeWorkload: AssigneeWorkloadData[] = Array.from(assigneeMap.entries()).map(([id, data]) => ({
      assigneeId: id,
      assigneeName: data.name,
      totalIssues: data.total,
      completedIssues: data.completed,
      inProgressIssues: data.inProgress,
      storyPoints: data.points,
      avatarUrl: null // TODO: Get from user profile
    }));

    // Mock sprint velocity (simplified)
    const sprintVelocity: SprintVelocityData[] = [
      {
        sprintId: 'sprint1',
        sprintName: 'Sprint 1',
        committedPoints: 40,
        completedPoints: kpis.completedIssues * 2,
        velocity: kpis.velocity,
        startDate: filters.dateRange.start.toISOString().split('T')[0],
        endDate: filters.dateRange.end.toISOString().split('T')[0]
      }
    ];

    return {
      kpis,
      trends,
      statusDistribution,
      assigneeWorkload,
      sprintVelocity
    };
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user, filters, fetchAnalytics]);

  return {
    kpis,
    issueTrends,
    statusDistribution,
    assigneeWorkload,
    sprintVelocity,
    loading,
    refetch: fetchAnalytics
  };
};
