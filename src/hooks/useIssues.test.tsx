import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { useIssues } from './useIssues';

// Mock do AuthContext
const mockAuthContext = {
  user: {
    id: 'user1',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'admin',
    avatar_url: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
};

vi.mock('./useAuth', () => ({
  useAuth: () => mockAuthContext
}));

// Mock do Supabase client com implementação mais realista
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn()
    },
    from: vi.fn((table: string) => {
      // Helper function to filter issues based on parameters
      const filterIssues = (issues: typeof mockIssues, filters?: any) => {
        let filtered = issues.filter(issue => issue.project_id === '1');

        if (filters?.status?.length > 0) {
          filtered = filtered.filter(issue => filters.status.includes(issue.status));
        }
        if (filters?.priority?.length > 0) {
          filtered = filtered.filter(issue => filters.priority.includes(issue.priority));
        }
        if (filters?.assignee) {
          filtered = filtered.filter(issue => issue.assignee_id === filters.assignee);
        }
        if (filters?.type?.length > 0) {
          filtered = filtered.filter(issue => filters.type.includes(issue.issue_type));
        }
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(issue =>
            issue.title.toLowerCase().includes(searchLower) ||
            issue.description?.toLowerCase().includes(searchLower)
          );
        }

        return filtered;
      };

      if (table === 'issues') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field: string) => {
              if (field === 'project_id') {
                return {
                  order: vi.fn(() => ({
                    in: vi.fn((field: string, values: string[]) => ({
                      or: vi.fn(() => Promise.resolve({ data: mockIssues, error: null }))
                    })),
                    or: vi.fn(() => Promise.resolve({ data: mockIssues, error: null }))
                  })),
                  in: vi.fn((field: string, values: string[]) => ({
                    or: vi.fn(() => Promise.resolve({ data: mockIssues, error: null }))
                  })),
                  or: vi.fn(() => Promise.resolve({ data: mockIssues, error: null }))
                };
              }
              return {
                order: vi.fn(() => Promise.resolve({ data: mockIssues, error: null }))
              };
            }),
            in: vi.fn((field: string, values: string[]) => ({
              or: vi.fn(() => Promise.resolve({ data: mockIssues, error: null }))
            })),
            or: vi.fn(() => Promise.resolve({ data: mockIssues, error: null })),
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
    }),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    })),
    removeChannel: vi.fn()
  }
}));

// Mock data para os testes
const mockSprints = [
  {
    id: 'sprint-1',
    name: 'Sprint 1',
    description: 'Q1 2024 Sprint 1',
    status: 'completed',
    start_date: '2024-01-01',
    end_date: '2024-01-15',
    project_id: '1',
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
    project_id: '1',
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
    project_id: '1',
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
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('useIssues', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load issues for a project', async () => {
    const { result } = renderHook(() => useIssues('1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.issues).toHaveLength(4);
    expect(result.current.error).toBe(null);
  });

  it('should filter issues by status', async () => {
    const { result } = renderHook(() => useIssues('1', { status: ['done', 'in_progress'] }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    const issues = result.current.issues;
    expect(issues).toHaveLength(2);
    expect(issues.every(issue => ['done', 'in_progress'].includes(issue.status))).toBe(true);
  });

  it('should filter issues by priority', async () => {
    const { result } = renderHook(() => useIssues('1', { priority: ['high'] }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    const issues = result.current.issues;
    expect(issues).toHaveLength(2);
    expect(issues.every(issue => issue.priority === 'high')).toBe(true);
  });

  it('should filter issues by assignee', async () => {
    const { result } = renderHook(() => useIssues('1', { assignee: 'user2' }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    const issues = result.current.issues;
    expect(issues).toHaveLength(1);
    expect(issues[0].assignee_id).toBe('user2');
  });

  it('should filter issues by type', async () => {
    const { result } = renderHook(() => useIssues('1', { type: ['task'] }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    const issues = result.current.issues;
    expect(issues).toHaveLength(3);
    expect(issues.every(issue => issue.issue_type === 'task')).toBe(true);
  });

  it('should search issues by title and description', async () => {
    const { result } = renderHook(() => useIssues('1', { search: 'drag' }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    const issues = result.current.issues;
    expect(issues).toHaveLength(1);
    expect(issues[0].title).toBe('Implement drag and drop');
  });

  it('should combine multiple filters', async () => {
    const { result } = renderHook(() => useIssues('1', {
      status: ['in_progress', 'todo'],
      priority: ['medium', 'high']
    }), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    const issues = result.current.issues;
    expect(issues).toHaveLength(2);
    // Should include both issues that match the criteria
    const titles = issues.map(issue => issue.title);
    expect(titles).toContain('Design kanban board UI'); // status: in_progress, priority: high
    expect(titles).toContain('Implement drag and drop'); // status: todo, priority: medium
  });

  it('should create new issue', async () => {
    const { result } = renderHook(() => useIssues('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    const initialCount = result.current.issues.length;

    await act(async () => {
      await result.current.createIssue({
        project_id: '1',
        title: 'New Test Issue',
        description: 'Test description',
        issue_type: 'task',
        status: 'todo',
        priority: 'medium',
        story_points: 5,
        reporter_id: 'user1'
      });
    });

    expect(result.current.issues).toHaveLength(initialCount + 1);
    const newIssue = result.current.issues.find(issue => issue.title === 'New Test Issue');
    expect(newIssue).toBeDefined();
    expect(newIssue?.issue_number).toBe(5);
  });

  it('should update existing issue', async () => {
    const { result } = renderHook(() => useIssues('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    const issueId = result.current.issues[0].id;

    await act(async () => {
      await result.current.updateIssue(issueId, {
        title: 'Updated Title',
        status: 'in_progress'
      });
    });

    const updatedIssue = result.current.issues.find(issue => issue.id === issueId);
    expect(updatedIssue?.title).toBe('Updated Title');
    expect(updatedIssue?.status).toBe('in_progress');
  });

  it('should delete issue', async () => {
    const { result } = renderHook(() => useIssues('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    const initialCount = result.current.issues.length;
    const issueId = result.current.issues[0].id;

    await act(async () => {
      await result.current.deleteIssue(issueId);
    });

    expect(result.current.issues).toHaveLength(initialCount - 1);
    expect(result.current.issues.find(issue => issue.id === issueId)).toBeUndefined();
  });

  it('should handle refetch', async () => {
    const { result } = renderHook(() => useIssues('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.refetchIssues();
    });

    expect(result.current.loading).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useIssues('invalid-project'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.issues).toHaveLength(0);

    consoleSpy.mockRestore();
  });
});
