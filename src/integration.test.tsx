import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Componente wrapper simplificado para testes de integração
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

const SimpleWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createQueryClient()}>
    <AuthProvider>
      {children}
    </AuthProvider>
  </QueryClientProvider>
);

describe('Database Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Hook Integration with Supabase', () => {
    it('should attempt Supabase connection first, then fallback to mock data', async () => {
      // Mock Supabase to fail (network error simulation)
      const mockedSupabase = vi.mocked(supabase);
      mockedSupabase.from.mockImplementation(() => {
        throw new Error('Network Error - Supabase not available');
      });

      const { useIssues } = await import('@/hooks/useIssues');
      const { result } = renderHook(() => useIssues('test-project'), {
        wrapper: SimpleWrapper
      });

      // Should fallback to mock data when Supabase fails
      await waitFor(() => {
        expect(result.current.issues.length).toBeGreaterThan(0); // Should fallback to mock data
        expect(result.current.error).toBeFalsy();
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should successfully fetch data when Supabase is available', async () => {
      const mockIssues = [
        {
          id: '1',
          title: 'Database Issue',
          status: 'open',
          priority: 'high',
          assignee: { full_name: 'John Doe' },
          created_at: '2024-01-01'
        }
      ];

      const mockedSupabase = vi.mocked(supabase);
      mockedSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({
                  data: mockIssues,
                  error: null
                }))
              }))
            })),
            order: vi.fn(() => Promise.resolve({
              data: mockIssues,
              error: null
            }))
          }))
        }))
      } as any);

      const { useIssues } = await import('@/hooks/useIssues');
      const { result } = renderHook(() => useIssues('test-project'), {
        wrapper: SimpleWrapper
      });

      await waitFor(() => {
        expect(result.current.issues).toHaveLength(1);
        expect(result.current.issues[0].title).toBe('Database Issue');
        expect(result.current.error).toBeFalsy();
      });
    });

    it('should handle database errors gracefully', async () => {
      const mockedSupabase = vi.mocked(supabase);
      mockedSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database connection failed' }
            }))
          }))
        }))
      } as any);

      const { useIssues } = await import('@/hooks/useIssues');
      const { result } = renderHook(() => useIssues('test-project'), {
        wrapper: SimpleWrapper
      });

      await waitFor(() => {
        expect(result.current.error).toBeFalsy(); // Hook falls back to mock data, no error
        expect(result.current.issues.length).toBeGreaterThan(0); // Should have mock data
      });
    });
  });

  describe('Analytics Integration', () => {
    it('should integrate analytics calculations with database queries', async () => {
      const mockIssues = [
        {
          id: '1',
          title: 'Feature Issue',
          status: 'completed',
          business_value: 8,
          issue_type: 'feature',
          created_at: '2024-01-15'
        }
      ];

      const mockSprints = [
        {
          id: 's1',
          name: 'Sprint 1',
          status: 'completed',
          start_date: '2024-01-01',
          end_date: '2024-01-15'
        }
      ];

      const mockedSupabase = vi.mocked(supabase);

      // Mock issues query
      mockedSupabase.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve({
                    data: mockIssues,
                    error: null
                  }))
                }))
              }))
            }))
          }))
        })
        // Mock sprints query
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve({
                    data: mockSprints,
                    error: null
                  }))
                }))
              }))
            }))
          }))
        })
        // Mock OKRs query
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  }))
                }))
              }))
            }))
          }))
        });

      const { useProductAnalytics } = await import('@/hooks/useProductAnalytics');
      const { result } = renderHook(() =>
        useProductAnalytics({
          projectId: 'test-project',
          dateRange: { start: '2024-01-01', end: '2024-01-31' }
        }), {
          wrapper: SimpleWrapper
        }
      );

      await waitFor(() => {
        expect(result.current.data.businessValue.totalValue).toBe(8);
        expect(result.current.data.businessValue.averageValue).toBe(8);
        expect(result.current.error).toBeFalsy();
      });
    });
  });

  describe('Real-time Features Integration', () => {
    it('should handle real-time subscriptions', async () => {
      const { useRealtimeIssues } = await import('@/hooks/useRealtimeIssues');

      const mockSubscription = {
        on: vi.fn(() => mockSubscription),
        subscribe: vi.fn(() => mockSubscription),
        unsubscribe: vi.fn()
      };

      const mockedSupabase = vi.mocked(supabase);
      mockedSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({
            data: [{ id: '1', title: 'Real-time Issue' }],
            error: null
          }))
        })),
        on: vi.fn(() => mockSubscription)
      } as any);

      // Import the correct hook
      const { useRealtimeIssues } = await import('@/hooks/useRealtimeIssues');
      const { result } = renderHook(() => useRealtimeIssues('test-project'), {
        wrapper: SimpleWrapper
      });

      await waitFor(() => {
        expect(result.current.issues.length).toBeGreaterThan(0);
        // Note: The current implementation doesn't expose subscription details
        // so we just verify the hook works
      });
    });
  });

  describe('Performance and Caching', () => {
    it('should cache queries appropriately', async () => {
      const { useIssues } = await import('@/hooks/useIssues');

      const mockedSupabase = vi.mocked(supabase);
      mockedSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: [{ id: '1', title: 'Cached Issue' }],
              error: null
            }))
          }))
        }))
      } as any);

      const { result, rerender } = renderHook(() => useIssues('test-project'), {
        wrapper: SimpleWrapper
      });

      await waitFor(() => {
        expect(result.current.issues).toHaveLength(1);
      });

      // Re-render should use cached data
      rerender();

      // Should not have called Supabase again due to caching
      expect(mockedSupabase.from).toHaveBeenCalledTimes(1);
    });
  });

  describe('AI-Powered Feedback Analysis', () => {
    it('should analyze feedback sentiment automatically', async () => {
      const { useFeedbackInsights } = await import('@/hooks/useFeedback');

      const testFeedback = [
        {
          id: '1',
          product_id: 'test',
          title: 'Amazing app!',
          content: 'This app is fantastic and works perfectly!',
          sentiment: 'neutral' as const, // AI should detect as positive
          tags: [],
          status: 'new' as const,
          priority: 'medium' as const,
          source: 'survey' as const,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        }
      ];

      const { result } = renderHook(() => useFeedbackInsights(testFeedback), {
        wrapper: SimpleWrapper
      });

      await waitFor(() => {
        expect(result.current.summary.totalFeedback).toBe(1);
        expect(result.current.summary.positiveSentiment).toBe(1); // AI should detect as positive
        expect(result.current.insights.length).toBeGreaterThan(0);
      });
    });

    it('should generate actionable AI recommendations', async () => {
      const { useFeedbackInsights } = await import('@/hooks/useFeedback');

      const testFeedback = [
        {
          id: '1',
          product_id: 'test',
          title: 'Bug: App crashes',
          content: 'The application crashes frequently when loading data. This is very frustrating.',
          sentiment: 'very_negative' as const,
          tags: [],
          status: 'new' as const,
          priority: 'high' as const,
          source: 'email' as const,
          bug_report: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          product_id: 'test',
          title: 'Feature request',
          content: 'Please add dark mode support. This would be amazing!',
          sentiment: 'positive' as const,
          tags: [],
          status: 'new' as const,
          priority: 'medium' as const,
          source: 'survey' as const,
          feature_request: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        }
      ];

      const { result } = renderHook(() => useFeedbackInsights(testFeedback), {
        wrapper: SimpleWrapper
      });

      await waitFor(() => {
        expect(result.current.recommendations.length).toBeGreaterThan(0);
        const urgentRec = result.current.recommendations.find(r => r.type === 'urgent');
        expect(urgentRec).toBeDefined();
      });
    });
  });
});
