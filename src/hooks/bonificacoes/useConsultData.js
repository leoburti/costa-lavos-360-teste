import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useFilters } from '@/contexts/FilterContext';
import { startOfMonth } from 'date-fns';

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
    
    const { toast } = useToast();
    const { refreshKey } = useFilters();

    const fetchData = useCallback(async () => {
        setLoading(true);
        console.log("useConsultData: fetchData iniciada.");
        try {
            const [requestsRes, settingsRes] = await Promise.all([
                supabase.from('bonification_requests').select('*').order('request_date', { ascending: false }),
                supabase.from('bonification_settings').select('monthly_limit_percentage, previous_month_net_sales').eq('id', 1).single()
            ]);

            if (requestsRes.error) throw requestsRes.error;
            if (settingsRes.error && settingsRes.error.code !== 'PGRST116') throw settingsRes.error;
            
            const requests = requestsRes.data || [];
            setAllBonifications(requests);
            
            const thisMonthStart = startOfMonth(new Date());
            const bonifiedThisMonth = requests
                .filter(r => new Date(r.approval_date) >= thisMonthStart && ['Aprovado', 'Aprovado Automaticamente'].includes(r.status))
                .reduce((acc, r) => acc + r.total_amount, 0);

            const pendingThisMonth = requests
                .filter(r => new Date(r.request_date) >= thisMonthStart && ['Aguardando Aprovação', 'Pendente'].includes(r.status))
                .reduce((acc, r) => acc + r.total_amount, 0);
            
            const pendingRequests = requests.filter(r => r.status === 'Aguardando Aprovação');
            const pendingRequestsCount = pendingRequests.length;
            const pendingRequestsValue = pendingRequests.reduce((acc, r) => acc + r.total_amount, 0);

            const globalLimitPercentage = settingsRes.data?.monthly_limit_percentage || 2;
            const previousMonthNetSales = settingsRes.data?.previous_month_net_sales || 0;
            const globalLimit = (previousMonthNetSales * globalLimitPercentage) / 100;

            setKpis({
                globalLimit,
                previousMonthNetSales,
                bonifiedThisMonth,
                pendingThisMonth,
                pendingRequestsCount,
                pendingRequestsValue,
                totalRecords: requests.length,
            });
            console.log("useConsultData: fetchData concluída com sucesso.");

        } catch (error) {
            console.error('Erro ao carregar dados de consulta:', error);
            toast({
                title: "Erro ao carregar dados",
                description: error.message || "Não foi possível atualizar as informações.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        console.log("useConsultData: useEffect executado. Chamando fetchData.");
        fetchData();
        
        const channel = supabase.channel('public:bonification_requests')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bonification_requests' }, payload => {
            console.log('Realtime: atualização de bonificação recebida. Recarregando dados...', payload);
            fetchData();
          })
          .subscribe();

        return () => {
            console.log("useConsultData: Desinscrevendo do canal realtime.");
            supabase.removeChannel(channel);
        };
    }, [fetchData, refreshKey]);

    return {
        loading,
        kpis,
        allBonifications,
        fetchData
    };
};

export default useConsultData;