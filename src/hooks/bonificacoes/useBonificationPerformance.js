import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useFilters } from '@/contexts/FilterContext';

const fetchPerformanceData = async ({ queryKey }) => {
    const [_key, filters] = queryKey;
    const { dateRange, ...restFilters } = filters;

    if (!dateRange?.from || !dateRange?.to) {
        return null;
    }

    const params = {
        p_start_date: dateRange.from.toISOString(),
        p_end_date: dateRange.to.toISOString(),
        p_exclude_employees: restFilters.excludeEmployees,
        p_supervisors: restFilters.supervisors,
        p_sellers: restFilters.sellers,
        p_customer_groups: restFilters.customerGroups,
        p_regions: restFilters.regions,
        p_clients: restFilters.clients,
        p_search_term: restFilters.searchTerm,
    };

    const { data, error } = await supabase.rpc('get_bonification_performance', params);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

export const useBonificationPerformance = (groupBy = 'supervisor') => {
    const { filters } = useFilters();
    
    const queryKey = useMemo(() => ['bonificationPerformance', { ...filters, groupBy }], [filters, groupBy]);

    return useQuery({
        queryKey,
        queryFn: fetchPerformanceData,
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!(filters.dateRange?.from && filters.dateRange?.to),
    });
};