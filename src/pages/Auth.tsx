import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/auth/AuthForm';

const Auth: React.FC = () => {
  const { user, loading, authUser } = useAuth();
  const location = useLocation();

  console.log('🔄 Auth page render:', { user: !!user, authUser: !!authUser, loading });

  if (loading) {
    console.log('⏳ Auth page: Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    console.log('✅ Auth page: User authenticated, redirecting...', user);
    // Redirect to intended page or dashboard
    const from = location.state?.from?.pathname || '/projects';
    return <Navigate to={from} replace />;
  }

  console.log('📝 Auth page: Showing login form');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Welcome to Vibefy
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account or create a new one
          </p>
        </div>

        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
