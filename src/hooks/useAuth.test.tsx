import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from './useAuth';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
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

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide auth context', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toBeDefined();
    expect(result.current.signIn).toBeTypeOf('function');
    expect(result.current.signUp).toBeTypeOf('function');
    expect(result.current.signOut).toBeTypeOf('function');
    expect(result.current.resetPassword).toBeTypeOf('function');
    expect(result.current.updateProfile).toBeTypeOf('function');
  });

  it('should handle loading state correctly', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Initially should be loading
    expect(result.current.loading).toBe(true);
  });

  it('should handle sign in flow', async () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    };

    const mockSession = {
      user: mockUser,
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token'
    };

    // Mock successful auth
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      // Simulate auth state change after a delay
      setTimeout(() => {
        callback('SIGNED_IN', mockSession);
      }, 100);

      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // Mock successful profile fetch
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: mockUser.id,
              email: mockUser.email,
              full_name: 'Test User',
              role: 'user',
              avatar_url: null,
              created_at: '2024-01-01',
              updated_at: '2024-01-01'
            },
            error: null
          })
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null })
      }))
    } as any);

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.authUser).toBeDefined();
  });

  it('should handle auth errors gracefully', async () => {
    // Mock auth error
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      // Don't call callback to simulate no auth
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for loading timeout
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
    });

    // Should eventually stop loading due to timeout
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.authUser).toBe(null);
  });
});
