
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfMonth } from 'date-fns';
import { useDataScope } from '@/hooks/useDataScope';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const FilterContext = createContext(undefined);

// Defined outside component to ensure stability
const INITIAL_FILTERS = {
    supervisors: null,
    sellers: null,
    customerGroups: null,
    regions: null,
    clients: null,
    searchTerm: '',
    excludeEmployees: true,
    showDefinedGroupsOnly: true,
};

const getInitialDateRange = () => {
    const today = new Date();
    return {
        from: startOfMonth(today),
        to: today
    };
};

export const FilterProvider = ({ children }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    
    const { isRestricted, commercialFilter = {} } = useDataScope();
    
    // PERSISTENCE: Use localStorage hooks for maintaining state across reloads
    const [storedDateRange, setStoredDateRange] = useLocalStorage('filter_date_range', null);
    const [storedFilters, setStoredFilters] = useLocalStorage('filter_selections', INITIAL_FILTERS);

    // Hydrate Date Range from storage or default
    const [dateRange, setDateRangeState] = useState(() => {
        if (storedDateRange && storedDateRange.from && storedDateRange.to) {
            return {
                from: new Date(storedDateRange.from),
                to: new Date(storedDateRange.to)
            };
        }
        return getInitialDateRange();
    });

    const [previousDateRange, setPreviousDateRange] = useState({ from: undefined, to: undefined });

    // Sync runtime filters with stored filters
    const [filters, setFiltersState] = useState(storedFilters);

    const [filterOptions, setFilterOptions] = useState({
        supervisors: [],
        sellers: [],
        customerGroups: [],
        regions: [],
        clients: [],
        products: []
    });
    const [availablePeriods, setAvailablePeriods] = useState({});

    // Update previous date range calculation
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            const diffTime = dateRange.to.getTime() - dateRange.from.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            const prevEndDate = new Date(dateRange.from);
            prevEndDate.setDate(prevEndDate.getDate() - 1);
            
            const prevStartDate = new Date(prevEndDate);
            prevStartDate.setDate(prevStartDate.getDate() - (diffDays)); // Adjusted logic
            
            setPreviousDateRange({
                from: prevStartDate,
                to: prevEndDate
            });

            // Persist new date range to local storage if it changed
            const newStored = {
                from: dateRange.from.toISOString(),
                to: dateRange.to.toISOString()
            };

            // Guard clause to prevent loops: check if update is necessary
            if (storedDateRange?.from !== newStored.from || storedDateRange?.to !== newStored.to) {
                setStoredDateRange(newStored);
            }
        }
        // We omit storedDateRange from deps to rely on internal check or stable setter
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange, setStoredDateRange]); 

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
                
                return hasChanges ? newFilters : prev;
            });
        }
    }, [isRestricted, commercialFilter]);

    // Save filters to persistence whenever they change
    useEffect(() => {
        setStoredFilters(filters);
    }, [filters, setStoredFilters]);

    const updateFilters = useCallback((newFilters) => {
        setFiltersState(prev => {
            if (isRestricted) {
                if (commercialFilter.supervisor && newFilters.supervisors !== undefined) {
                    newFilters.supervisors = [commercialFilter.supervisor];
                }
                if (commercialFilter.seller && newFilters.sellers !== undefined) {
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
        // Only fetch if options are empty to prevent aggressive refetching
        if (filterOptions.supervisors.length === 0) {
            fetchFilterOptions();
        } else {
            setLoading(false);
        }
    }, [fetchFilterOptions, filterOptions.supervisors.length]);
    
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
