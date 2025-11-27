import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Hook to fetch the current user's data scope (role, team, etc.)
 * This is used to determine what data the user is allowed to see.
 * 
 * Note: This hook ignores any arguments passed to it to prevent
 * accidental parameter injection into the RPC call which causes PGRST202 errors.
 */
export function useDataScope() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user_scope', user?.id],
    queryFn: async () => {
      // Explicitly call without arguments to avoid PGRST202 error
      // even if the hook is called with arguments by a consumer
      const { data, error } = await supabase.rpc('get_current_user_scope');
      
      if (error) {
        console.error('Error fetching user scope:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
    retry: 2
  });
}