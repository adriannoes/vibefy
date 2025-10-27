import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthUser } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setAuthUser(session.user as AuthUser);
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('❌ AuthContext: Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    // Timeout de segurança para evitar loading eterno
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ AuthContext: Loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 10000); // 10 segundos

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAuthUser(session.user as AuthUser);
          await fetchUserProfile(session.user.id);
        } else {
          setAuthUser(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 AuthContext: Fetching user profile for', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ AuthContext: Error fetching user profile:', error);
        console.error('❌ AuthContext: Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        // Se não conseguir buscar o perfil, ainda permite o acesso
        setUser(null);
        return;
      }

      console.log('✅ AuthContext: User profile fetched successfully:', data);
      setUser(data);
    } catch (error) {
      console.error('❌ AuthContext: Exception fetching user profile:', error);
      setUser(null);
    }
    // Removido setLoading(false) daqui - apenas o useEffect principal controla o loading
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AuthContext: Starting sign in for', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ AuthContext: Sign in error:', error);
      throw error;
    }

    console.log('✅ AuthContext: Sign in successful, user:', data.user?.id);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset-password`,
    });

    if (error) {
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      throw error;
    }

    setUser({ ...user, ...updates });
  };

  const value: AuthContextType = {
    user,
    authUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
