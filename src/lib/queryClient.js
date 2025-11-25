
import { QueryClient } from '@tanstack/react-query';

// Global Query Client Configuration
// Implements caching strategies requested by user
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 2 minutes (no auto-refetch during this time)
      staleTime: 1000 * 60 * 2, 
      
      // Keep data in cache for 30 minutes
      gcTime: 1000 * 60 * 30, 
      
      // Refetch on window focus to ensure data synchronization when returning from background
      refetchOnWindowFocus: true, 
      
      // Do not refetch on mount if data is cached and fresh
      refetchOnMount: false,
      
      // Retry failed requests once
      retry: 1,
      
      // Enable offline support: queries will be paused when offline and resumed when online
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Optimistic updates network mode
      networkMode: 'offlineFirst',
    },
  },
});
