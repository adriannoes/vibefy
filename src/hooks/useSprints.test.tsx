import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { useSprints } from './useSprints';

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

describe('useSprints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load sprints for a project', async () => {
    const { result } = renderHook(() => useSprints('1'), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.sprints).toHaveLength(3);
    expect(result.current.error).toBe(null);
  });

  it('should sort sprints correctly (active > planned > completed)', async () => {
    const { result } = renderHook(() => useSprints('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    const sprints = result.current.sprints;
    expect(sprints).toHaveLength(3);

    // Should be sorted: active, planned, completed
    expect(sprints[0].status).toBe('active');
    expect(sprints[1].status).toBe('planned');
    expect(sprints[2].status).toBe('completed');
  });

  it('should get active sprint correctly', async () => {
    const { result } = renderHook(() => useSprints('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    const activeSprint = result.current.getActiveSprint();
    expect(activeSprint).toBeDefined();
    expect(activeSprint?.status).toBe('active');
    expect(activeSprint?.name).toBe('Sprint 2');
  });

  it('should create new sprint', async () => {
    const { result } = renderHook(() => useSprints('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    const initialCount = result.current.sprints.length;

    await act(async () => {
      await result.current.createSprint({
        project_id: '1',
        name: 'New Sprint',
        goal: 'Test sprint goal',
        status: 'planned'
      });
    });

    expect(result.current.sprints).toHaveLength(initialCount + 1);
    const newSprint = result.current.sprints.find(sprint => sprint.name === 'New Sprint');
    expect(newSprint).toBeDefined();
    expect(newSprint?.goal).toBe('Test sprint goal');
    expect(newSprint?.status).toBe('planned');
  });

  it('should update existing sprint', async () => {
    const { result } = renderHook(() => useSprints('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    const sprintId = result.current.sprints[0].id;

    await act(async () => {
      await result.current.updateSprint(sprintId, {
        name: 'Updated Sprint Name',
        goal: 'Updated goal'
      });
    });

    const updatedSprint = result.current.sprints.find(sprint => sprint.id === sprintId);
    expect(updatedSprint?.name).toBe('Updated Sprint Name');
    expect(updatedSprint?.goal).toBe('Updated goal');
  });

  it('should delete sprint', async () => {
    const { result } = renderHook(() => useSprints('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    const initialCount = result.current.sprints.length;
    const sprintId = result.current.sprints[0].id;

    await act(async () => {
      await result.current.deleteSprint(sprintId);
    });

    expect(result.current.sprints).toHaveLength(initialCount - 1);
    expect(result.current.sprints.find(sprint => sprint.id === sprintId)).toBeUndefined();
  });

  it('should start sprint and deactivate others', async () => {
    const { result } = renderHook(() => useSprints('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    const plannedSprint = result.current.sprints.find(sprint => sprint.status === 'planned');
    expect(plannedSprint).toBeDefined();

    await act(async () => {
      await result.current.startSprint(plannedSprint!.id);
    });

    // Check that the started sprint is now active
    const startedSprint = result.current.sprints.find(sprint => sprint.id === plannedSprint!.id);
    expect(startedSprint?.status).toBe('active');
    expect(startedSprint?.start_date).toBeDefined();
    expect(startedSprint?.end_date).toBeDefined();

    // Check that any previous active sprint was completed
    const completedSprints = result.current.sprints.filter(sprint => sprint.status === 'completed');
    expect(completedSprints.length).toBeGreaterThan(0);
  });

  it('should complete sprint', async () => {
    const { result } = renderHook(() => useSprints('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    const activeSprint = result.current.sprints.find(sprint => sprint.status === 'active');
    expect(activeSprint).toBeDefined();

    await act(async () => {
      await result.current.completeSprint(activeSprint!.id);
    });

    const completedSprint = result.current.sprints.find(sprint => sprint.id === activeSprint!.id);
    expect(completedSprint?.status).toBe('completed');
    expect(completedSprint?.end_date).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useSprints('invalid-project'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.sprints).toHaveLength(0);

    consoleSpy.mockRestore();
  });

  it('should return null for active sprint when none exists', async () => {
    const { result } = renderHook(() => useSprints('1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });

    // Complete all active sprints first
    const activeSprint = result.current.getActiveSprint();
    if (activeSprint) {
      await act(async () => {
        await result.current.completeSprint(activeSprint.id);
      });
    }

    // Now should return null
    const noActiveSprint = result.current.getActiveSprint();
    expect(noActiveSprint).toBeUndefined();
  });
});
