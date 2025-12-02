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
            const clientCode = client.id.split('-')[0];
            const clientStore = client.id.split('-')[1];
            const fantasyName = client.nome_fantasia || client.nome;

            // 1. Fetch Core & Commercial Data (Existing RPC)
            const { data: commercialData } = await supabase.rpc('get_client_commercial_info', {
                p_client_code: clientCode,
                p_store: clientStore,
                p_fantasy_name: fantasyName
            });

            // 2. Fetch Inventory (Existing Logic)
            const { data: inventoryData } = await supabase.rpc('get_inventory_by_fantasy', {
                p_fantasy_name: fantasyName
            });

            // 3. Fetch Registration Data (New RPC for Costa Lavos Tab)
            const { data: registrationData } = await supabase.rpc('get_client_registration_data', {
                p_code: clientCode,
                p_store: clientStore
            });

            // 4. Fetch Transactions History (New RPC for Sales/Bonification/Equipment Tabs)
            const { data: itemHistory } = await supabase.rpc('get_client_item_history', {
                p_client_code: clientCode,
                p_store: clientStore,
                p_months: 12
            });

            const fullData = {
                basicInfo: client,
                commercial: commercialData,
                inventory: inventoryData || [],
                registration: registrationData || {},
                itemHistory: itemHistory || []
            };

            setClientData(fullData);

        } catch (err) {
            console.error(err);
            setError(err.message);
            toast({ variant: 'destructive', title: 'Erro ao carregar cliente', description: err.message });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const fetchGroupData = useCallback(async (group) => {
        setLoading(true);
        setError(null);
        try {
            // Assuming group fetching logic remains similar
            // If specific group logic is needed, update here
            const { data } = await supabase.rpc('get_group_360_analysis', {
                p_clients: JSON.stringify([]) // Placeholder, needs real group implementation if expanded
            });
            setGroupData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

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