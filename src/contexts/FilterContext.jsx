import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const FilterContext = createContext(undefined);

const getInitialDateRange = () => {
    const today = new Date();
    return {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date()
    };
};

export const FilterProvider = ({ children }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    
    const [dateRange, setDateRangeState] = useState(getInitialDateRange());
    const [previousDateRange, setPreviousDateRange] = useState({ from: undefined, to: undefined });

    const [filters, setFiltersState] = useState({
        supervisors: null,
        sellers: null,
        customerGroups: null,
        regions: null,
        clients: null,
        searchTerm: '',
        excludeEmployees: true,
        showDefinedGroupsOnly: true,
    });

    const [filterOptions, setFilterOptions] = useState({
        supervisors: [],
        sellers: [],
        customerGroups: [],
        regions: [],
        clients: [],
    });
    const [availablePeriods, setAvailablePeriods] = useState({});

    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            const diffTime = dateRange.to.getTime() - dateRange.from.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            const prevEndDate = new Date(dateRange.from);
            prevEndDate.setDate(prevEndDate.getDate() - 1);
            
            const prevStartDate = new Date(prevEndDate);
            prevStartDate.setDate(prevStartDate.getDate() - (diffDays - 1));
            
            setPreviousDateRange({
                from: prevStartDate,
                to: prevEndDate
            });
        }
    }, [dateRange]);

    const updateFilters = useCallback((newFilters) => {
        setFiltersState(prev => ({ ...prev, ...newFilters }));
    }, []);

    const fetchFilterOptions = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_all_filter_options');
            if (error) throw new Error(`Failed to fetch filter options: ${error.message}`);
            
            setFilterOptions({
                supervisors: data.supervisors || [],
                sellers: data.sellers || [],
                customerGroups: data.customerGroups || [],
                regions: data.regions || [],
                clients: data.clients || [],
                products: data.products || [],
            });

        } catch (error) {
            console.error('Error fetching initial filter options:', error);
            toast({
                variant: 'destructive',
                title: 'Erro ao carregar opções de filtro',
                description: 'Não foi possível carregar os dados para os filtros.',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchFilterOptions();
    }, [fetchFilterOptions]);
    
    const computedFilters = useMemo(() => ({
        ...filters,
        clients: Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null,
        startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
        endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
        previousStartDate: previousDateRange?.from ? format(previousDateRange.from, 'yyyy-MM-dd') : null,
        previousEndDate: previousDateRange?.to ? format(previousDateRange.to, 'yyyy-MM-dd') : null,
    }), [filters, dateRange, previousDateRange]);

    const setDateRange = (newRange) => {
        setDateRangeState(newRange);
    };

    const value = useMemo(() => ({
        loading,
        filterOptions,
        availablePeriods,
        filters: computedFilters,
        rawFilters: filters, // Expose raw filters for components that need the object structure
        rawDateRange: dateRange, // Expose raw date object for DateRangePicker
        setDateRange,
        updateFilters,
    }), [loading, filterOptions, availablePeriods, computedFilters, filters, updateFilters, dateRange]);

    return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
};

export const useFilterOptions = useFilters;