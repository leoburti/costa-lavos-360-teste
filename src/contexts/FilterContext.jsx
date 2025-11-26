
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfMonth, subDays } from 'date-fns';
import { useDataScope } from '@/hooks/useDataScope';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const FilterContext = createContext(undefined);

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
    const { isRestricted, commercialFilter = {} } = useDataScope();
    
    // STATE: Loading options
    const [loading, setLoading] = useState(true);
    
    // STATE: Filters and Date Range (with persistence)
    const [storedFilters, setStoredFilters] = useLocalStorage('filter_selections', INITIAL_FILTERS);
    const [storedDateRange, setStoredDateRange] = useLocalStorage('filter_date_range', null);

    // Runtime state for filters to avoid immediate storage thrashing
    const [filters, setFiltersState] = useState(storedFilters);
    
    // Hydrate Date Range safely
    const [dateRange, setDateRangeState] = useState(() => {
        if (storedDateRange?.from && storedDateRange?.to) {
            return { from: new Date(storedDateRange.from), to: new Date(storedDateRange.to) };
        }
        return getInitialDateRange();
    });

    const [previousDateRange, setPreviousDateRange] = useState({ from: undefined, to: undefined });

    // Options for dropdowns
    const [filterOptions, setFilterOptions] = useState({
        supervisors: [], sellers: [], customerGroups: [], regions: [], clients: [], products: []
    });

    // Refresh signal for dashboard
    const [refreshKey, setRefreshKey] = useState(0);

    // --- ACTIONS ---

    const refreshData = useCallback(() => {
        console.log("🔄 Solicitando atualização manual de dados...");
        setRefreshKey(prev => prev + 1);
        toast({ title: "Atualizando...", description: "Recarregando dados do servidor." });
    }, [toast]);

    const setDateRange = useCallback((newRange) => {
        if (!newRange) return;
        setDateRangeState(newRange);
        // Persist asynchronously to avoid render loops
        setStoredDateRange({ from: newRange.from?.toISOString(), to: newRange.to?.toISOString() });
    }, [setStoredDateRange]);

    // Optimized updateFilters: Updates state only if values ACTUALLY change
    // This prevents infinite loops when components unconditionally call updateFilters in effects
    const updateFilters = useCallback((newFilters) => {
        setFiltersState(prev => {
            let hasChanges = false;
            for (const key in newFilters) {
                // Simple equality check. For arrays/objects, reference equality is checked initially.
                // If deep comparison is needed, we might need lodash.isEqual, but usually strict equality is enough for avoiding simple loops.
                if (prev[key] !== newFilters[key]) {
                    hasChanges = true;
                    break;
                }
            }
            
            // Special check for arrays if references differ but content might be same (basic length check optimization)
            if (hasChanges && newFilters.clients && prev.clients) {
                 if (Array.isArray(newFilters.clients) && Array.isArray(prev.clients)) {
                     if (newFilters.clients.length === prev.clients.length && 
                         newFilters.clients.every((val, index) => val === prev.clients[index])) {
                         hasChanges = false; // Revert change flag if array content is identical
                     }
                 }
            }

            return hasChanges ? { ...prev, ...newFilters } : prev;
        });
    }, []);

    // Persist filters when they change
    useEffect(() => {
        setStoredFilters(filters);
    }, [filters, setStoredFilters]);

    const resetFilters = useCallback(() => {
        setFiltersState(INITIAL_FILTERS);
        // setStoredFilters handled by useEffect
        setDateRange(getInitialDateRange());
    }, [setDateRange]);

    // --- EFFECTS ---

    // 1. Calculate Previous Period (Compare Period)
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            const diffTime = dateRange.to.getTime() - dateRange.from.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            const prevEndDate = subDays(dateRange.from, 1);
            const prevStartDate = subDays(prevEndDate, diffDays);
            
            setPreviousDateRange({ from: prevStartDate, to: prevEndDate });
        }
    }, [dateRange]); // Only depends on dateRange reference

    // 2. Load Filter Options (Once)
    useEffect(() => {
        let mounted = true;
        const fetchOptions = async () => {
            try {
                const { data, error } = await supabase.rpc('get_all_filter_options');
                if (!mounted) return;
                
                if (error) throw error;
                
                setFilterOptions({
                    supervisors: data.supervisors || [],
                    sellers: data.sellers || [],
                    customerGroups: data.customerGroups || [],
                    regions: data.regions || [],
                    clients: data.clients || [],
                    products: data.products || [],
                });
            } catch (error) {
                console.error('Error fetching options:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchOptions();
        return () => { mounted = false; };
    }, []);

    // 3. Apply Security Scope Restrictions
    // CRITICAL FIX: Use JSON.stringify for commercialFilter dependency to avoid infinite loops if object reference changes
    useEffect(() => {
        if (isRestricted) {
            setFiltersState(prev => {
                const newFilters = { ...prev };
                let changed = false;
                
                if (commercialFilter.supervisor && (!prev.supervisors || prev.supervisors[0] !== commercialFilter.supervisor)) {
                    newFilters.supervisors = [commercialFilter.supervisor];
                    changed = true;
                }
                if (commercialFilter.seller && (!prev.sellers || prev.sellers[0] !== commercialFilter.seller)) {
                    newFilters.sellers = [commercialFilter.seller];
                    changed = true;
                }
                return changed ? newFilters : prev;
            });
        }
    }, [isRestricted, JSON.stringify(commercialFilter)]);

    // --- COMPUTED VALUES ---

    const computedFilters = useMemo(() => ({
        ...filters,
        // Flatten client objects if they are objects, or keep as is
        clients: Array.isArray(filters.clients) ? filters.clients.map(c => typeof c === 'object' ? c.value : c) : null,
        startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
        endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
        previousStartDate: previousDateRange?.from ? format(previousDateRange.from, 'yyyy-MM-dd') : null,
        previousEndDate: previousDateRange?.to ? format(previousDateRange.to, 'yyyy-MM-dd') : null,
    }), [filters, dateRange, previousDateRange]);

    const value = useMemo(() => ({
        loading,
        filterOptions,
        filters: computedFilters,
        dateRange,
        setDateRange,
        updateFilters,
        resetFilters,
        refreshKey,
        refreshData,
        isRestricted // Expose for UI logic
    }), [loading, filterOptions, computedFilters, dateRange, setDateRange, updateFilters, resetFilters, refreshKey, refreshData, isRestricted]);

    return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
};
