import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useFilterContext } from '@/contexts/FilterContext';

const useConsultData = () => {
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({
        totalRequests: 0,
        totalAmount: 0,
        approvedCount: 0,
        pendingCount: 0
    });
    const [allBonifications, setAllBonifications] = useState([]);
    const [protheusHistory, setProtheusHistory] = useState([]);
    
    const { toast } = useToast();
    const { refreshKey } = useFilterContext();

    // MEMOIZED FETCH DATA FUNCTION - CRITICAL TO PREVENT INFINITE LOOPS
    const fetchData = useCallback(async () => {
        const abortController = new AbortController();
        setLoading(true);
        
        try {
            // 1. Fetch Bonification Requests (App Database)
            const { data: requests, error } = await supabase
                .from('bonification_requests')
                .select('*')
                .order('created_at', { ascending: false })
                .abortSignal(abortController.signal);

            if (error) throw error;

            if (requests) {
                setAllBonifications(requests);

                // Calculate KPIs based on fetched requests
                const totalReq = requests.length;
                const totalAmt = requests.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
                const approved = requests.filter(r => r.status === 'Aprovado' || r.status === 'Aprovado Automaticamente').length;
                const pending = requests.filter(r => r.status === 'Aguardando Aprovação').length;

                setKpis({
                    totalRequests: totalReq,
                    totalAmount: totalAmt,
                    approvedCount: approved,
                    pendingCount: pending
                });
            }

            // 2. Fetch Protheus History (External/ERP Data)
            // Assuming this table exists or is a view
            const { data: protheusData, error: protheusError } = await supabase
                .from('bd-cl') // Using standard sales table as proxy for history if specific table unavailable
                .select('*')
                .in('Cfo', ['5910', '6910']) // Bonification CFOs
                .order('DT Emissao', { ascending: false })
                .limit(100) // Limit to avoid heavy load
                .abortSignal(abortController.signal);

            if (!protheusError && protheusData) {
                // Transform data to match request structure roughly
                const transformed = protheusData.map(item => ({
                    id: item.ID || Math.random().toString(),
                    client_name: item['N Fantasia'] || item['Nome'],
                    total_amount: item['Total'],
                    request_date: item['DT Emissao'],
                    status: 'Faturado',
                    document_number: item['Num. Docto.']
                }));
                setProtheusHistory(transformed);
            }

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching consult data:', error);
                toast({
                    title: "Erro ao carregar dados",
                    description: "Não foi possível atualizar as informações.",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }

        return () => abortController.abort();
    }, [toast]); // Dependency on toast is fine as it's stable from shadcn hook

    // Trigger fetch on mount and when refreshKey changes
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