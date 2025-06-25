'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthMutations, UserData, authKeys } from '@/hooks/use-auth-mutations';
import { useQueryClient } from '@tanstack/react-query';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { loginMutation, logoutMutation, refreshMutation, useVerifyToken } = useAuthMutations();
  const { data: user, isSuccess, isLoading, isFetching, error } = useVerifyToken();
  const [isBrowser, setIsBrowser] = useState(false);
  
  const isAuthenticated = isSuccess && !!user;

  // Set isBrowser to true once component mounts
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Monitor authentication state and handle automatic logout
  useEffect(() => {
    if (isBrowser && !isLoading && !isAuthenticated && window.location.pathname !== '/login') {
      console.log('[AuthProvider] Authentication failed or expired, redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isBrowser, router]);

  // Log cache status
  // useEffect(() => {
  //   if (user) {
  //     console.log('[AuthProvider] User data available:', { 
  //       fromCache: !isFetching && isSuccess,
  //       isLoading,
  //       isFetching 
  //     });
      
  //     // Check if data is from cache
  //     if (!isFetching && isSuccess) {
  //       console.log('[AuthProvider] Using cached authentication data');
  //     }
  //   }
  // }, [user, isSuccess, isLoading, isFetching]);

  useEffect(() => {
    // Only run on client-side after hydration
    if (isBrowser && isAuthenticated && window.location.pathname === '/login') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router, isBrowser]);

  const login = async (email: string, password: string) => {
    console.log('[AuthProvider] Login attempt');
    await loginMutation.mutateAsync({ email, password });
    console.log('[AuthProvider] Login successful, redirecting to dashboard');
    router.push('/dashboard');
  };

  const logout = async () => {
    console.log('[AuthProvider] Logout attempt');
    await logoutMutation.mutateAsync();
    console.log('[AuthProvider] Logout successful');
  };

  const refresh = async () => {
    console.log('[AuthProvider] Token refresh attempt');
    await refreshMutation.mutateAsync();
    console.log('[AuthProvider] Token refresh successful');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user: user || null, 
      login, 
      logout, 
      refresh 
    }}>
      {children}
      {(isLoading || isFetching) && <LoadingOverlay />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}