import { useCallback } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useDataScope = () => {
  const { user, userRole } = useAuth();

  const applyScope = useCallback((query, ownerColumn = 'user_id') => {
    if (!user || !userRole) {
      // Should not happen for authenticated users, but as a safeguard.
      return query.limit(0); 
    }
    
    // Admins and Level 1 can see everything.
    if (userRole?.role === 'Nivel 1' || userRole?.role === 'Admin') {
      return query;
    }

    // Supervisors can see their own data and their team's data
    if (userRole?.role === 'Supervisor' && userRole?.seller_name) {
        const teamMembers = [userRole.seller_name]; // In a real scenario, this would be a list of sellers under the supervisor.
        return query.or(`${ownerColumn}.eq.${user.id},${ownerColumn}.in.(${teamMembers.join(',')})`);
    }

    // Default to only seeing own data.
    return query.eq(ownerColumn, user.id);

  }, [user, userRole]);

  return { applyScope };
};