
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useFilterContext } from '@/contexts/FilterContext';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

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
        setLoading(true);
        
        try {
            // 1. Get Bonification Requests from the app
            const { data: requests, error: requestsError } = await supabase
                .from('bonification_requests')
                .select('*')
                .order('request_date', { ascending: false });

            if (requestsError) throw requestsError;
            setAllBonifications(requests || []);

            // 2. Get Faturado History from Protheus (ERP) data
            const { data: protheus, error: protheusError } = await supabase
                .from('bd-cl')
                .select('ID, "Num. Docto.", "N Fantasia", "Nome", "Total", "DT Emissao", "Nome Vendedor"')
                .in('"Cfo"', ['5910', '6910'])
                .gte('"DT Emissao"', startOfMonth(new Date()).toISOString())
                .order('"DT Emissao"', { ascending: false });

            if (protheusError) throw protheusError;

            const protheusData = (protheus || []).map(b => ({
                id: b.ID,
                document_number: b['Num. Docto.'],
                client_name: b['N Fantasia'] || b['Nome'],
                total_amount: b.Total,
                request_date: b['DT Emissao'],
                status: 'Faturado',
                seller_name: b['Nome Vendedor'],
                motivos: ['Comercial'], // Default
                percentual: 0, // Not calculated for performance
                source: 'Protheus'
            }));
            setProtheusHistory(protheusData);

            // 3. Calculate KPIs
            const now = new Date();
            const startOfCurrentMonth = startOfMonth(now);
            const previousMonth = subMonths(now, 1);
            const startOfPreviousMonth = startOfMonth(previousMonth);
            const endOfPreviousMonth = endOfMonth(previousMonth);

            const { data: settingsData, error: settingsError } = await supabase
                .from('bonification_settings')
                .select('monthly_limit_percentage')
                .eq('id', 1)
                .single();
            if (settingsError && settingsError.code !== 'PGRST116') { // Ignore 'no rows found'
                throw settingsError;
            }
            const limitPercentage = settingsData?.monthly_limit_percentage || 2;

            const { data: previousMonthNetSalesData, error: salesError } = await supabase
                .from('bd-cl')
                .select('Total')
                .gte('"DT Emissao"', startOfPreviousMonth.toISOString())
                .lte('"DT Emissao"', endOfPreviousMonth.toISOString())
                .not('Cfo', 'in', '(5910, 6910, 5908, 6551, 6908, 5551)');

            if (salesError) throw salesError;

            const previousMonthNetSales = (previousMonthNetSalesData || []).reduce((acc, sale) => acc + sale.Total, 0);
            const globalLimit = (previousMonthNetSales * limitPercentage) / 100;

            const bonifiedThisMonth = (requests || []).filter(r => new Date(r.request_date) >= startOfCurrentMonth && (r.status === 'Aprovado' || r.status === 'Aprovado Automaticamente')).reduce((acc, r) => acc + r.total_amount, 0);
            const pendingThisMonth = (requests || []).filter(r => new Date(r.request_date) >= startOfCurrentMonth && r.status === 'Aguardando Aprovação').reduce((acc, r) => acc + r.total_amount, 0);
            const pendingRequests = (requests || []).filter(r => r.status === 'Aguardando Aprovação');
            const pendingRequestsCount = pendingRequests.length;
            const pendingRequestsValue = pendingRequests.reduce((acc, r) => acc + r.total_amount, 0);

            setKpis({
                globalLimit,
                previousMonthNetSales,
                bonifiedThisMonth,
                pendingThisMonth,
                pendingRequestsCount,
                pendingRequestsValue,
                totalRecords: (requests?.length || 0) + (protheusData?.length || 0),
            });

        } catch (error) {
            console.error('Error fetching consult data:', error);
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
