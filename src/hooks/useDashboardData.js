import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useFilters } from '@/contexts/FilterContext';
import { format, subYears, subDays } from 'date-fns';

export function useDashboardData() {
  const { filters } = useFilters();

  // Safe date fallback
  const today = new Date();
  const defaultStart = format(subDays(today, 30), 'yyyy-MM-dd');
  const defaultEnd = format(today, 'yyyy-MM-dd');

  const startDate = filters?.dateRange?.from 
    ? format(filters.dateRange.from, 'yyyy-MM-dd') 
    : defaultStart;
    
  const endDate = filters?.dateRange?.to 
    ? format(filters.dateRange.to, 'yyyy-MM-dd') 
    : defaultEnd;

  // Calculate Previous Period (Year-over-Year for "vs. ano anterior" label accuracy)
  const startObj = filters?.dateRange?.from ? new Date(filters.dateRange.from) : subDays(today, 30);
  const endObj = filters?.dateRange?.to ? new Date(filters.dateRange.to) : today;
  
  const prevStartDate = format(subYears(startObj, 1), 'yyyy-MM-dd');
  const prevEndDate = format(subYears(endObj, 1), 'yyyy-MM-dd');

  const fetchDashboardData = async () => {
    try {
      const rpcParams = {
        p_start_date: startDate,
        p_end_date: endDate,
        p_previous_start_date: prevStartDate,
        p_previous_end_date: prevEndDate,
        p_exclude_employees: filters?.excludeEmployees ?? true,
        p_supervisors: filters?.supervisors?.length > 0 ? filters.supervisors : null,
        p_sellers: filters?.sellers?.length > 0 ? filters.sellers : null,
        p_customer_groups: filters?.customerGroups?.length > 0 ? filters.customerGroups : null,
        p_regions: filters?.regions?.length > 0 ? filters.regions : null,
        p_clients: filters?.clients?.length > 0 ? filters.clients : null,
        p_search_term: filters?.searchTerm || null,
        p_show_defined_groups_only: filters?.showDefinedGroupsOnly ?? false,
        p_products: filters?.products?.length > 0 ? filters.products : null
      };

      const { data, error } = await supabase.rpc('get_dashboard_and_daily_sales_kpis', rpcParams);

      if (error) {
        console.error("Supabase RPC Error in get_dashboard_and_daily_sales_kpis:", error);
        throw error;
      }
      
      // Ensure structure
      return {
        kpi: data?.kpi || {},
        dailySales: data?.dailySales || []
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['dashboard-kpis', startDate, endDate, prevStartDate, JSON.stringify(filters)],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  });
}