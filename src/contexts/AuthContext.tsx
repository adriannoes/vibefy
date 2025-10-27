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
    }, 2000); // 2 segundos

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

  const createUserProfile = async (userId: string) => {
    try {
      console.log('🔄 AuthContext: Creating user profile for', userId);

      if (!authUser) {
        console.warn('⚠️ AuthContext: No authUser available, cannot create profile');
        return;
      }

      const newProfile = {
        id: userId,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        avatar_url: authUser.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('❌ AuthContext: Error creating user profile:', error);

        // Verificar se é erro de duplicata (usuário já existe)
        if (error.code === '23505') { // unique_violation
          console.log('ℹ️ AuthContext: Profile already exists, trying to fetch it...');
          // Tentar buscar o perfil existente
          const { data: existingData, error: fetchError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (!fetchError && existingData) {
            console.log('✅ AuthContext: Found existing profile:', existingData);
            setUser(existingData);
            return;
          }
        }

        // Para outros erros, usar perfil local
        console.warn('⚠️ AuthContext: Using local profile due to database error');
        setUser(newProfile);
        return;
      }

      console.log('✅ AuthContext: User profile created successfully:', data);
      setUser(data);
    } catch (error) {
      console.error('❌ AuthContext: Exception creating user profile:', error);
      // Em caso de erro, cria um perfil local
      if (authUser) {
        setUser({
          id: userId,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          avatar_url: authUser.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  };

  const fetchUserProfile = async (userId: string) => {
    console.log('🔍 AuthContext: Processing user profile for', userId);

    try {
      console.log('⚡ AuthContext: Checking if user profile exists...');

      // Buscar o perfil completo diretamente
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Se o erro for "not found" (PGRST116), criar o perfil
        if (error.code === 'PGRST116') {
          console.log('🔄 AuthContext: User profile not found, creating new one...');
          await createUserProfile(userId);
        } else {
          console.error('❌ AuthContext: Error fetching user profile:', error);
          // Em caso de erro de permissão ou outro erro, tentar criar perfil mesmo assim
          await createUserProfile(userId);
        }
      } else {
        console.log('✅ AuthContext: User profile found:', data);
        setUser(data);
      }
    } catch (error) {
      console.error('❌ AuthContext: Exception in fetchUserProfile:', error);
      // Em caso de exceção, tentar criar perfil
      await createUserProfile(userId);
    }
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
