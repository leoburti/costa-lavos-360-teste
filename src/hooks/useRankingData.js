import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useFilters } from '@/contexts/FilterContext';
import { format, subMonths, subDays, getDate } from 'date-fns';

export function useRankingData(dimension) {
  const { filters } = useFilters();

  // Default dates
  const today = new Date();
  const defaultStart = format(subDays(today, 30), 'yyyy-MM-dd');
  const defaultEnd = format(today, 'yyyy-MM-dd');

  const startDate = filters?.dateRange?.from 
    ? format(filters.dateRange.from, 'yyyy-MM-dd') 
    : defaultStart;
    
  const endDate = filters?.dateRange?.to 
    ? format(filters.dateRange.to, 'yyyy-MM-dd') 
    : defaultEnd;

  // Calculate comparison dates (Same days previous month)
  // Example: if selected is Jan 1 - Jan 15, comparison is Dec 1 - Dec 15
  const startObj = filters?.dateRange?.from ? new Date(filters.dateRange.from) : subDays(today, 30);
  const endObj = filters?.dateRange?.to ? new Date(filters.dateRange.to) : today;
  
  const compStart = subMonths(startObj, 1);
  const compEnd = subMonths(endObj, 1); // Simple subtract month, keeps day of month usually

  const compareStartDate = format(compStart, 'yyyy-MM-dd');
  const compareEndDate = format(compEnd, 'yyyy-MM-dd');

  const fetchRanking = async () => {
    // Map tab names to backend dimensions expected by the RPC
    const dimensionMap = {
      'supervisors': 'supervisor',
      'sellers': 'seller',
      'regions': 'region',
      'groups': 'group',
      'clients': 'client',
      'products': 'product'
    };

    const apiDimension = dimensionMap[dimension] || 'supervisor';

    try {
      const { data, error } = await supabase.rpc('get_performance_ranking', {
        p_dimension: apiDimension,
        p_start_date: startDate,
        p_end_date: endDate,
        p_compare_start_date: compareStartDate,
        p_compare_end_date: compareEndDate,
        p_exclude_employees: filters?.excludeEmployees ?? true,
        p_supervisors: filters?.supervisors?.length > 0 ? filters.supervisors : null,
        p_sellers: filters?.sellers?.length > 0 ? filters.sellers : null,
        p_customer_groups: filters?.customerGroups?.length > 0 ? filters.customerGroups : null,
        p_regions: filters?.regions?.length > 0 ? filters.regions : null,
        p_clients: filters?.clients?.length > 0 ? filters.clients : null,
        p_search_term: filters?.searchTerm || null,
        p_show_defined_groups_only: filters?.showDefinedGroupsOnly ?? false,
        p_limit: 50
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ranking for ${dimension}:`, error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['ranking-data', dimension, startDate, endDate, compareStartDate, compareEndDate, JSON.stringify(filters)],
    queryFn: fetchRanking,
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true
  });
}