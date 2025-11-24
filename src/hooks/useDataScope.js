
import { useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export const useDataScope = () => {
    const { userContext } = useAuth();

    const isAdmin = userContext?.isAdmin || false;
    const isSupervisor = userContext?.isSupervisor || false;
    const isSeller = userContext?.isSeller || false;
    
    // Restricted if logged in but NOT admin.
    const isRestricted = !!userContext && !isAdmin; 

    // Calculate commercial filters for legacy dashboards (FilterContext)
    const commercialFilter = useMemo(() => {
        const filters = {};
        
        // Guard clause: if no user context or is admin, return empty filters
        if (!userContext || isAdmin) return filters;

        // If user is a supervisor, they should only see their team's data (filtered by Supervisor Name)
        if (isSupervisor && userContext.supervisorName) {
            filters.supervisor = userContext.supervisorName;
        }

        // If user is a seller, they should only see their own data (filtered by Seller Name)
        if (isSeller && userContext.sellerName) {
            filters.seller = userContext.sellerName;
        }

        return filters;
    }, [isAdmin, isSupervisor, isSeller, userContext]);

    /**
     * Applies Row-Level Security (RLS) like filtering to a Supabase query builder chain.
     * 
     * @param {Object} query - The Supabase query builder instance
     * @param {string} column - The column to filter by (default: 'owner_id')
     * @returns {Object} - The modified query builder
     */
    const applyScope = useCallback((query, column = 'owner_id') => {
        // 1. If no user context (loading or anon), return query as is
        if (!userContext) return query;

        // 2. Admin: No filtering
        if (isAdmin) {
            return query;
        }

        // 3. Supervisor: Show own records AND records from their team
        if (isSupervisor) {
            const teamIds = userContext.teamMembers || [];
            // Always include self in the viewable list
            const scopeIds = [userContext.id, ...teamIds];
            // Use .in() to match any ID in the list
            return query.in(column, scopeIds);
        }

        // 4. Seller (Level 2): Show ONLY own records
        if (isSeller) {
            return query.eq(column, userContext.id);
        }

        // 5. Fallback: If role is unknown/other, safest is to show only own records
        if (userContext.id) {
            return query.eq(column, userContext.id);
        }

        return query;
    }, [isAdmin, isSupervisor, isSeller, userContext]);

    return {
        applyScope,
        isAdmin,
        isSupervisor,
        isSeller,
        isRestricted,
        commercialFilter // Vital for FilterContext to prevent crash
    };
};
