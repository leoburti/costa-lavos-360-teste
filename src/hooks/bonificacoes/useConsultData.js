
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useFilterContext } from '@/contexts/FilterContext';

const useConsultData = () => {
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({
        globalLimit: 0,
        previousMonthNetSales: 0,
        bonifiedThisMonth: 0,
        pendingThisMonth: 0,
        pendingRequestsCount: 0,
        pendingRequestsValue: 0,
        totalRecords: 0,
    });
    const [allBonifications, setAllBonifications] = useState([]);
    const [protheusHistory, setProtheusHistory] = useState([]);
    
    const { toast } = useToast();
    const { refreshKey } = useFilterContext();

    const fetchData = useCallback(async () => {
        const abortController = new AbortController();
        setLoading(true);
        
        try {
            const { data, error } = await supabase.rpc('get_bonification_data');

            if (error) throw error;
            
            if (data) {
                setAllBonifications(data.requests || []);
                setProtheusHistory(data.protheus_history || []);
                setKpis({
                    globalLimit: data.kpis?.globalLimit || 0,
                    previousMonthNetSales: data.kpis?.previousMonthNetSales || 0,
                    bonifiedThisMonth: data.kpis?.bonifiedThisMonth || 0,
                    pendingThisMonth: data.kpis?.pendingThisMonth || 0,
                    pendingRequestsCount: data.kpis?.pendingRequestsCount || 0,
                    pendingRequestsValue: data.kpis?.pendingRequestsValue || 0,
                    totalRecords: (data.requests?.length || 0) + (data.protheus_history?.length || 0),
                });
            }

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching consult data:', error);
                toast({
                    title: "Erro ao carregar dados",
                    description: error.message || "Não foi possível atualizar as informações.",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }

        return () => abortController.abort();
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData, refreshKey]);

    return {
        loading,
        kpis,
        allBonifications,
        protheusHistory,
        fetchData
    };
};

export default useConsultData;
