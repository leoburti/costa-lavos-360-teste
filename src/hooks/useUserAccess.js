import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/customSupabaseClient';

const fetchUserAccessScope = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase.rpc('get_user_access_scope');
  if (error) {
    console.error('Error fetching user access scope:', error);
    throw new Error(error.message);
  }
  return data;
};

export const useUserAccess = (userId) => {
  return useQuery({
    queryKey: ['userAccessScope', userId],
    queryFn: () => fetchUserAccessScope(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};