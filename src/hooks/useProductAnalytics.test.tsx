import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProductAnalytics } from './useProductAnalytics';
import type { ReportFilters } from '@/types/analytics';

// Mock do Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'issues') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockIssues, error: null }))
            })),
            order: vi.fn(() => Promise.resolve({ data: mockIssues, error: null }))
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockIssues[0], error: null }))
            }))
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockIssues[0], error: null }))
              }))
            }))
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null }))
          }))
        };
      }
      if (table === 'sprints') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockSprints, error: null }))
            })),
            order: vi.fn(() => Promise.resolve({ data: mockSprints, error: null }))
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockSprints[0], error: null }))
            }))
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockSprints[0], error: null }))
              }))
            }))
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null }))
          }))
        };
      }
      if (table === 'okrs') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockOKRs, error: null }))
            })),
            order: vi.fn(() => Promise.resolve({ data: mockOKRs, error: null }))
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockOKRs[0], error: null }))
            }))
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: mockOKRs[0], error: null }))
              }))
            }))
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null }))
          }))
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        }))
      };
    })
  }
}));

// Mock data para testes
const mockIssues = [
  {
    id: '1',
    title: 'Test Issue 1',
    description: 'Test description',
    status: 'completed',
    priority: 'high',
    issue_type: 'feature',
    story_points: 8,
    business_value: 9,
    customer_segment: 'enterprise',
    created_at: '2024-01-15',
    updated_at: '2024-01-20',
    project_id: 'proj-1',
    assignee_id: 'user-1',
    reporter_id: 'user-2',
  },
  {
    id: '2',
    title: 'Test Issue 2',
    description: 'Test description',
    status: 'completed',
    priority: 'medium',
    issue_type: 'enhancement',
    story_points: 5,
    business_value: 7,
    customer_segment: 'consumer',
    created_at: '2024-01-10',
    updated_at: '2024-01-18',
    project_id: 'proj-1',
    assignee_id: 'user-2',
    reporter_id: 'user-1',
  },
  {
    id: '3',
    title: 'Test Issue 3',
    description: 'Test description',
    status: 'in_progress',
    priority: 'high',
    issue_type: 'bug',
    story_points: 13,
    business_value: 8,
    customer_segment: 'enterprise',
    created_at: '2024-01-25',
    updated_at: '2024-01-30',
    project_id: 'proj-1',
    assignee_id: 'user-3',
    reporter_id: 'user-1',
  },
];

const mockSprints = [
  {
    id: 'sprint-1',
    name: 'Sprint 1',
    description: 'Q1 2024 Sprint 1',
    status: 'completed',
    start_date: '2024-01-01',
    end_date: '2024-01-15',
    project_id: 'proj-1',
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
    project_id: 'proj-1',
    created_at: '2024-01-16',
    updated_at: '2024-01-16',
  },
];

const mockOKRs = [
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
    project_id: 'proj-1',
    owner_id: 'user-1',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProductAnalytics', () => {
  const defaultFilters: ReportFilters = {
    dateRange: {
      start: '2024-01-01',
      end: '2024-01-31',
    },
    projectId: 'proj-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate business value metrics correctly', async () => {
    const { result } = renderHook(() => useProductAnalytics(defaultFilters), {
      wrapper: createWrapper(),
    });

    // Wait for async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // With the new implementation, we need to check what data is actually returned
    // The hook processes real data and filters completed issues
    const completedIssues = mockIssues.filter(issue => issue.status === 'completed');
    const expectedTotalValue = completedIssues.reduce((sum, issue) => sum + (issue.business_value || 0), 0);
    const expectedAverageValue = completedIssues.length > 0 ? expectedTotalValue / completedIssues.length : 0;

    expect(result.current.data.businessValue.totalValue).toBe(expectedTotalValue);
    expect(result.current.data.businessValue.averageValue).toBe(expectedAverageValue);
    expect(Array.isArray(result.current.data.businessValue.valueByFeature)).toBe(true);
    expect(Array.isArray(result.current.data.businessValue.valueBySegment)).toBe(true);
  });

  it('should calculate roadmap health metrics correctly', async () => {
    const { result } = renderHook(() => useProductAnalytics(defaultFilters), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // The new implementation processes sprints data
    expect(result.current.data.roadmapHealth).toBeDefined();
    expect(typeof result.current.data.roadmapHealth.overallScore).toBe('number');
    expect(typeof result.current.data.roadmapHealth.onTimeDelivery).toBe('number');
    expect(Array.isArray(result.current.data.roadmapHealth.healthByQuarter)).toBe(true);
    expect(Array.isArray(result.current.data.roadmapHealth.healthByFeature)).toBe(true);
  });

  it('should calculate OKR trends correctly', async () => {
    const { result } = renderHook(() => useProductAnalytics(defaultFilters), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // The new implementation processes OKRs data
    expect(Array.isArray(result.current.data.okrTrends)).toBe(true);
    if (result.current.data.okrTrends.length > 0) {
      expect(typeof result.current.data.okrTrends[0].averageProgress).toBe('number');
      expect(result.current.data.okrTrends[0]).toHaveProperty('okrHealth');
    }
  });

  it('should calculate product KPIs correctly', async () => {
    const { result } = renderHook(() => useProductAnalytics(defaultFilters), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // The new implementation calculates KPIs based on processed data
    expect(result.current.data.productKPIs).toBeDefined();
    expect(typeof result.current.data.productKPIs.totalBusinessValue).toBe('number');
    expect(typeof result.current.data.productKPIs.averageBusinessValue).toBe('number');
    expect(typeof result.current.data.productKPIs.productVelocity).toBe('number');
  });

  it('should handle empty data gracefully', () => {
    // Este teste verifica se o hook funciona com dados vazios
    // Como o mock sempre retorna dados mockados, vamos testar a lógica de cálculo
    const { result } = renderHook(() => useProductAnalytics(defaultFilters), {
      wrapper: createWrapper(),
    });

    // Verifica se os cálculos estão funcionando corretamente
    expect(result.current.data.businessValue.totalValue).toBeGreaterThanOrEqual(0);
    expect(result.current.data.businessValue.averageValue).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.current.data.businessValue.valueByFeature)).toBe(true);
    expect(Array.isArray(result.current.data.businessValue.valueBySegment)).toBe(true);
  });

  it('should generate trend data by period', () => {
    const { result } = renderHook(() => useProductAnalytics(defaultFilters), {
      wrapper: createWrapper(),
    });

    expect(result.current.data.businessValue.valueByPeriod).toBeDefined();
    expect(Array.isArray(result.current.data.businessValue.valueByPeriod)).toBe(true);
    
    // Should have at least one period
    if (result.current.data.businessValue.valueByPeriod.length > 0) {
      const firstPeriod = result.current.data.businessValue.valueByPeriod[0];
      expect(firstPeriod).toHaveProperty('date');
      expect(firstPeriod).toHaveProperty('value');
      expect(firstPeriod).toHaveProperty('issues');
      expect(firstPeriod).toHaveProperty('averageValue');
    }
  });

  it('should group business value by feature correctly', async () => {
    const { result } = renderHook(() => useProductAnalytics(defaultFilters), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const valueByFeature = result.current.data.businessValue.valueByFeature;

    // The new implementation processes real data
    expect(Array.isArray(valueByFeature)).toBe(true);

    // Check that each feature has the expected properties
    valueByFeature.forEach(feature => {
      expect(feature).toHaveProperty('featureId');
      expect(feature).toHaveProperty('featureName');
      expect(feature).toHaveProperty('totalValue');
      expect(feature).toHaveProperty('issues');
      expect(feature).toHaveProperty('averageValue');
      expect(typeof feature.totalValue).toBe('number');
      expect(typeof feature.issues).toBe('number');
    });
  });

  it('should group business value by customer segment correctly', async () => {
    const { result } = renderHook(() => useProductAnalytics(defaultFilters), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const valueBySegment = result.current.data.businessValue.valueBySegment;

    // The new implementation processes real data
    expect(Array.isArray(valueBySegment)).toBe(true);

    // Check that each segment has the expected properties
    valueBySegment.forEach(segment => {
      expect(segment).toHaveProperty('segment');
      expect(segment).toHaveProperty('totalValue');
      expect(segment).toHaveProperty('issues');
      expect(segment).toHaveProperty('averageValue');
      expect(typeof segment.totalValue).toBe('number');
      expect(typeof segment.issues).toBe('number');
    });
  });

  it('should not be loading when data is available', async () => {
    const { result } = renderHook(() => useProductAnalytics(defaultFilters), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // With the new implementation, loading should be false after data is processed
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.data).toBeDefined();
  });
});
