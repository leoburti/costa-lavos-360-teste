import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useClient360 = (filters, initialSelectedItem) => {
    const [selectedItem, setSelectedItem] = useState(initialSelectedItem);
    const [clientData, setClientData] = useState(null);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    const fetchClientData = useCallback(async (client) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: rpcError } = await supabase.rpc('get_client_360_data_v2', {
                p_start_date: filters.dateRange.from,
                p_end_date: filters.dateRange.to,
                p_target_client_code: client.id.split('-')[0],
                p_target_store: client.id.split('-')[1],
                // Pass other filters
                p_exclude_employees: filters.excludeEmployees,
                p_supervisors: filters.supervisors,
                p_sellers: filters.sellers,
                p_customer_groups: filters.customerGroups,
                p_regions: filters.regions,
                p_clients: null,
                p_search_term: filters.searchTerm,
                p_products: filters.products,
                p_show_defined_groups_only: false,
            });

            if (rpcError) throw rpcError;
            setClientData(data ? data[0] : null);
        } catch (err) {
            setError(err.message);
            toast({ variant: 'destructive', title: 'Erro ao carregar cliente', description: err.message });
        } finally {
            setLoading(false);
        }
    }, [filters, toast]);

    const fetchGroupData = useCallback(async (group) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: rpcError } = await supabase.rpc('get_group_360_analysis', {
                p_group_name: group.nome,
            });

            if (rpcError) throw rpcError;
            setGroupData(data);
        } catch (err) {
            setError(err.message);
            toast({ variant: 'destructive', title: 'Erro ao carregar grupo', description: err.message });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const handleSelect = useCallback((item) => {
        setSelectedItem(item);
        if (item.type === 'client') {
            setGroupData(null);
            fetchClientData(item);
        } else if (item.type === 'group') {
            setClientData(null);
            fetchGroupData(item);
        }
    }, [fetchClientData, fetchGroupData]);

    const handleBack = useCallback(() => {
        setSelectedItem(null);
        setClientData(null);
        setGroupData(null);
    }, []);

    // Initial fetch if an item is pre-selected
    useEffect(() => {
        if (selectedItem) {
            handleSelect(selectedItem);
        }
    }, []);

    return {
        selectedItem,
        clientData,
        groupData,
        loading,
        error,
        handleSelect,
        handleBack,
    };
};