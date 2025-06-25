import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Type definitions
export interface UserData {
  userId: string;
  username: string;
  email: string;
  role: string;
  storeId: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

// Auth-related query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
}

// Custom hook for auth-related mutations
export function useAuthMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      await axios.post('/api/auth/login', credentials, { withCredentials: true });
      // After login, fetch user data
      const { data } = await axios.get('/api/auth/verify', { withCredentials: true });
      return data as UserData;
    },
    onSuccess: (userData) => {
      // Update cached user data
      queryClient.setQueryData(authKeys.user(), userData);
      // Invalidate any queries that might depend on auth state
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(authKeys.user(), null);
      // Invalidate all queries that depend on auth
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      // Redirect to login page
      router.push('/login');
    },
  });

  // Refresh token mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/auth/refresh', {}, { withCredentials: true });
      // After refresh, fetch updated user data
      const { data } = await axios.get('/api/auth/verify', { withCredentials: true });
      return data as UserData;
    },
    onSuccess: (userData) => {
      // Update cached user data
      queryClient.setQueryData(authKeys.user(), userData);
    },
  });

  // Query to verify token and get user data
  const useVerifyToken = () => useQuery({
    queryKey: authKeys.user(),
    queryFn: async ({ queryKey }) => {
      try {
        const { data } = await axios.get('/api/auth/verify', { withCredentials: true });
        return data as UserData;
      } catch (error) {
        // If verification fails, redirect to login
        router.push('/login');
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on 401/403
    // Add logging for cache hits
    select: (data) => {
      return data;
    },
    // Log when data is loaded from cache
    placeholderData: (previousData) => {
      return previousData;
    },
  });

  return {
    loginMutation,
    logoutMutation,
    refreshMutation,
    useVerifyToken,
  };
} 