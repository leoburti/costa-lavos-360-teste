import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useFilters } from './FilterContext';
import { apiClient } from '@/lib/apiClient'; // NEW IMPORT
import { isValid, format } from 'date-fns';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { filters } = useFilters();
  const location = useLocation();
  
  const [data, setData] = useState({ kpi: {}, dailySales: [], clients: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const isAuthOrErrorPage = useCallback(() => {
    const authPages = ['/login', '/forgot-password', '/unauthorized', '/not-found'];
    return authPages.some(page => location.pathname.startsWith(page));
  }, [location.pathname]);

  const formatDateSafe = (date) => {
    if (!date) return null;
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return isValid(dateObj) ? format(dateObj, 'yyyy-MM-dd') : null;
    } catch (e) {
      return null;
    }
  };
  
  const loadDashboardData = useCallback(async () => {
    if (isAuthOrErrorPage()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentStart = filters.dateRange?.[0] || filters.dateRange?.from;
      const currentEnd = filters.dateRange?.[1] || filters.dateRange?.to;

      if (!currentStart || !currentEnd) {
        setLoading(false);
        return;
      }
      
      const params = {
        p_start_date: formatDateSafe(currentStart),
        p_end_date: formatDateSafe(currentEnd),
        p_previous_start_date: formatDateSafe(filters.previousDateRange?.from),
        p_previous_end_date: formatDateSafe(filters.previousDateRange?.to),
        p_clients: filters.clients || null,
        p_customer_groups: filters.customerGroups || null,
        p_exclude_employees: filters.excludeEmployees ?? true,
        p_regions: filters.regions || null,
        p_search_term: filters.searchTerm || null,
        p_sellers: filters.sellers || null,
        p_show_defined_groups_only: filters.showDefinedGroupsOnly ?? false,
        p_supervisors: filters.supervisors || null,
      };
      
      // Use robust apiClient
      const { data: result, error: rpcError } = await apiClient.callRpc('get_dashboard_and_daily_sales_kpis', params);
      
      if (rpcError) {
        setError(rpcError);
      } else {
        setData({
          kpi: result?.kpi || {},
          dailySales: result?.dailySales || [],
        });
      }
    } catch (error) {
      console.error('[DataContext] Critical error:', error);
      setError({ code: 'UNKNOWN', message: error.message });
    } finally {
      setLoading(false);
    }
  }, [filters, isAuthOrErrorPage]);
  
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  
  const value = {
    ...data,
    dashboardData: data,
    loading,
    error,
    refresh: loadDashboardData,
    // Expose Drilldown Helper
    getDrilldownData: async (params) => {
       const { data } = await apiClient.callRpc('get_drilldown_data', params);
       return data || [];
    }
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};