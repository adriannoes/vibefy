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

  // Debug: verificar se Supabase está configurado
  console.log('🔧 AuthContext: Supabase config check:', {
    url: import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 AuthContext: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('🔍 AuthContext: Initial session result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          error
        });

        if (session?.user) {
          console.log('✅ AuthContext: Found existing session, setting authUser');
          setAuthUser(session.user as AuthUser);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('ℹ️ AuthContext: No existing session found');
        }
      } catch (error) {
        console.error('❌ AuthContext: Error in getInitialSession:', error);
      } finally {
        console.log('🔄 AuthContext: getInitialSession completed, setting loading to false');
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
        console.log('🔄 AuthContext: Auth state change:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email
        });

        if (session?.user) {
          console.log('✅ AuthContext: Setting authUser:', session.user.id);
          setAuthUser(session.user as AuthUser);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('❌ AuthContext: Clearing auth state');
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
    console.log('🔄 AuthContext: Creating user profile for', userId);

    try {
      // Primeiro, tentar buscar informações do usuário autenticado
      let userEmail = '';
      let userName = 'User';

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (!userError && user) {
          userEmail = user.email || '';
          userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
          console.log('✅ AuthContext: Got user info from auth:', { email: userEmail, name: userName });
        }
      } catch (authError) {
        console.warn('⚠️ AuthContext: Could not get user from auth, using defaults');
      }

      const newProfile = {
        id: userId,
        email: userEmail,
        full_name: userName,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('📤 AuthContext: Inserting profile:', newProfile);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('❌ AuthContext: Insert error:', error);

        // Se erro de duplicata, tentar buscar o perfil existente
        if (error.code === '23505') {
          console.log('ℹ️ AuthContext: Profile exists, fetching...');
          try {
            const { data: existingData, error: fetchError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', userId)
              .single();

            if (!fetchError && existingData) {
              console.log('✅ AuthContext: Found existing profile');
              setUser(existingData);
              return;
            }
          } catch (fetchErr) {
            console.error('❌ AuthContext: Failed to fetch existing profile:', fetchErr);
          }
        }

        // Fallback para perfil local
        console.warn('⚠️ AuthContext: Using local profile');
        setUser(newProfile);
      } else {
        console.log('✅ AuthContext: Profile created successfully');
        setUser(data);
      }
    } catch (error) {
      console.error('❌ AuthContext: Exception in createUserProfile:', error);
      // Sempre usar perfil local em caso de erro
      setUser({
        id: userId,
        email: '',
        full_name: 'User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  const fetchUserProfile = async (userId: string) => {
    console.log('🔍 AuthContext: Processing user profile for', userId);

    // Não esperar pelo authUser - usar dados básicos
    const fallbackProfile = {
      id: userId,
      email: '', // Será preenchido quando disponível
      full_name: 'User', // Nome padrão
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Sempre definir um perfil básico imediatamente
    setUser(fallbackProfile);
    console.log('✅ AuthContext: Basic profile set immediately');

    try {
      console.log('🔄 AuthContext: Attempting to fetch/create full profile...');

      // Timeout de 3 segundos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
      });

      const createPromise = createUserProfile(userId);
      await Promise.race([createPromise, timeoutPromise]);
      console.log('✅ AuthContext: Profile processing completed');
    } catch (error) {
      console.log('ℹ️ AuthContext: Using basic profile (full profile fetch failed)');
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
