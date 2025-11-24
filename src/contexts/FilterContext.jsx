
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useDataScope } from '@/hooks/useDataScope';

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
    
    // Defensively destructure useDataScope to prevent crashes if commercialFilter is undefined
    const { isRestricted, commercialFilter = {} } = useDataScope();
    
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

    // Enforce data scope constraints on filters
    useEffect(() => {
        if (isRestricted) {
            setFiltersState(prev => {
                let hasChanges = false;
                const newFilters = { ...prev };
                
                if (commercialFilter.supervisor) {
                    const currentSupervisor = prev.supervisors && prev.supervisors.length > 0 ? prev.supervisors[0] : null;
                    if (currentSupervisor !== commercialFilter.supervisor) {
                        newFilters.supervisors = [commercialFilter.supervisor];
                        hasChanges = true;
                    }
                }
                
                if (commercialFilter.seller) {
                    const currentSeller = prev.sellers && prev.sellers.length > 0 ? prev.sellers[0] : null;
                    if (currentSeller !== commercialFilter.seller) {
                        newFilters.sellers = [commercialFilter.seller];
                        hasChanges = true;
                    }
                }
                
                // Only update state if actual changes occurred to prevent render loops
                return hasChanges ? newFilters : prev;
            });
        }
    }, [isRestricted, commercialFilter]);

    const updateFilters = useCallback((newFilters) => {
        setFiltersState(prev => {
            // Prevent restricted users from clearing their mandatory filters
            if (isRestricted) {
                if (commercialFilter.supervisor && newFilters.supervisors !== undefined) {
                    // Ensure the restricted supervisor remains selected
                    newFilters.supervisors = [commercialFilter.supervisor];
                }
                if (commercialFilter.seller && newFilters.sellers !== undefined) {
                    // Ensure the restricted seller remains selected
                    newFilters.sellers = [commercialFilter.seller];
                }
            }
            return { ...prev, ...newFilters };
        });
    }, [isRestricted, commercialFilter]);

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
        rawFilters: filters, 
        rawDateRange: dateRange,
        setDateRange,
        updateFilters,
        // Expose scope info to UI components if needed
        isRestricted, 
        commercialFilter
    }), [loading, filterOptions, availablePeriods, computedFilters, filters, updateFilters, dateRange, isRestricted, commercialFilter]);

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
