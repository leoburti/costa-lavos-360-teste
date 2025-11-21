import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFilters } from '@/contexts/FilterContext';
import { startOfMonth, endOfMonth, startOfToday, subMonths } from 'date-fns';

const useConsultData = () => {
    const { toast } = useToast();
    const { user, supabase, isSupabaseConfigured } = useAuth();
    const { filters } = useFilters();

    const [allBonifications, setAllBonifications] = useState([]);
    const [protheusHistory, setProtheusHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({
        globalLimit: 0,
        previousMonthNetSales: 0,
        bonifiedThisMonth: 0,
        faturadoThisMonth: 0,
        pendingThisMonth: 0,
        pendingRequestsCount: 0,
        pendingRequestsValue: 0,
        totalRecords: 0
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        if (!user || !isSupabaseConfigured) {
            if (!isSupabaseConfigured) {
                toast({ variant: 'destructive', title: 'Erro de Configuração', description: 'A conexão com o banco de dados não está configurada.' });
            }
            setLoading(false);
            return;
        }

        try {
            const today = startOfToday();
            const currentMonthStart = startOfMonth(today);
            const currentMonthEnd = endOfMonth(today);
            
            const actualPreviousMonthStart = startOfMonth(subMonths(new Date(), 1));
            const actualPreviousMonthEnd = endOfMonth(subMonths(new Date(), 1));

            const earliestDateNeeded = new Date(Math.min(
                new Date(filters.startDate).setMonth(new Date(filters.startDate).getMonth() - 1),
                actualPreviousMonthStart.getTime()
            ));
            
            const latestDateNeeded = new Date(Math.max(
                new Date(filters.endDate).getTime(),
                currentMonthEnd.getTime()
            ));

            const { data: rawSalesData, error: salesDataError } = await supabase
                .from('bd-cl')
                .select('"Nome Vendedor", "DT Emissao", "Total", "Cfo", "N Fantasia", "Nome", "Cliente", "Loja", "Num. Docto."')
                .gte('"DT Emissao"', earliestDateNeeded.toISOString())
                .lte('"DT Emissao"', latestDateNeeded.toISOString());

            if (salesDataError) throw salesDataError;
            
            const netSalesData = rawSalesData.filter(sale => !['5910', '6910', '5908', '6551', '6908', '5551'].includes(String(sale.Cfo)));

            const sellerMonthlySales = netSalesData.reduce((acc, sale) => {
                const seller = sale['Nome Vendedor'];
                if (!seller || seller === 'Não Definido') return acc; 
                const saleDate = new Date(sale['DT Emissao']);
                const monthKey = `${saleDate.getFullYear()}-${saleDate.getMonth()}`;
                
                if (!acc[seller]) acc[seller] = {};
                if (!acc[seller][monthKey]) acc[seller][monthKey] = 0;
                acc[seller][monthKey] += sale.Total;
                return acc;
            }, {});

            const { data: settingsData, error: settingsError } = await supabase.from('bonification_settings').select('monthly_limit_percentage').single();
            if (settingsError) console.error("Error fetching bonification_settings:", settingsError);
            const monthlyLimitPercentage = settingsData?.monthly_limit_percentage || 0;

            const previousMonthNetSales = rawSalesData
                .filter(sale => 
                    new Date(sale['DT Emissao']) >= actualPreviousMonthStart && 
                    new Date(sale['DT Emissao']) <= actualPreviousMonthEnd &&
                    !['5910', '6910', '5908', '6551', '6908', '5551'].includes(String(sale.Cfo))
                )
                .reduce((acc, sale) => acc + sale.Total, 0) || 0;
            const globalLimit = (previousMonthNetSales * monthlyLimitPercentage) / 100;

            const { data: systemRequestsData, error: requestsError } = await supabase
                .from('bonification_requests').select('*')
                .gte('request_date', filters.startDate)
                .lte('request_date', filters.endDate)
                .order('request_date', { ascending: false });

            if (requestsError) throw requestsError;
            
            const userIds = [...new Set(systemRequestsData.map(r => r.user_id).filter(Boolean))];
            let userMap = new Map();
            if (userIds.length > 0) {
                const { data: usersData, error: usersError } = await supabase.from('users_view').select('id, raw_user_meta_data').in('id', userIds);
                if (usersError) console.error("Error fetching users_view:", usersError);
                if (usersData) usersData.forEach(u => userMap.set(u.id, u.raw_user_meta_data?.full_name || 'Desconhecido'));
            }

            let bonifiedThisMonth = 0, faturadoThisMonth = 0, pendingThisMonth = 0;

            const processedSystemRequests = systemRequestsData.map(r => {
                const reqDate = new Date(r.request_date);
                if (reqDate >= currentMonthStart && reqDate <= currentMonthEnd) {
                    if (['Aprovado', 'Aprovado Automaticamente', 'Aprovada - Faturamento', 'Finalizado', 'Faturado'].includes(r.status)) {
                        bonifiedThisMonth += r.total_amount;
                    }
                    if (['Finalizado', 'Faturado'].includes(r.status)) {
                       faturadoThisMonth += r.total_amount;
                    }
                    if (r.status === 'Aguardando Aprovação') {
                        pendingThisMonth += r.total_amount;
                    }
                }
                
                const reqSellerName = r.seller_name;
                const reqMonthKey = `${reqDate.getFullYear()}-${reqDate.getMonth()}`;
                const totalSellerSalesForReqMonth = sellerMonthlySales[reqSellerName]?.[reqMonthKey] || 0;
                const percentual = totalSellerSalesForReqMonth > 0 ? (r.total_amount / totalSellerSalesForReqMonth) * 100 : 0;
                
                return { 
                    ...r, 
                    user_full_name: r.seller_name || userMap.get(r.user_id) || 'Desconhecido', 
                    source: 'Sistema', 
                    items: r.products_json || [],
                    loja: r.client_id ? r.client_id.split('-')[1] || '' : '', 
                    mes: reqDate.getMonth() + 1, 
                    ano: reqDate.getFullYear(),
                    percentual: percentual
                };
            });
            setAllBonifications(processedSystemRequests);

            const pendingRequests = processedSystemRequests.filter(req => ['Aguardando Aprovação'].includes(req.status));
            const pendingRequestsValue = pendingRequests.reduce((acc, req) => acc + req.total_amount, 0);

            const erpBonificationsDataFiltered = rawSalesData.filter(item => 
                ['5910', '6910'].includes(String(item.Cfo)) &&
                new Date(item['DT Emissao']) >= new Date(filters.startDate) &&
                new Date(item['DT Emissao']) <= new Date(filters.endDate)
            );

            const consolidatedErpBonifications = Object.values(erpBonificationsDataFiltered.reduce((acc, item) => {
                const docNum = item['Num. Docto.'];
                if (!acc[docNum]) {
                    const dt = new Date(item['DT Emissao']);
                    acc[docNum] = { 
                        id: `protheus-${docNum}`, 
                        client_name: item['N Fantasia'] || item['Nome'] || 'N/A', 
                        loja: item['Loja'], 
                        total_amount: 0, 
                        request_date: item['DT Emissao'], 
                        mes: dt.getMonth() + 1, 
                        ano: dt.getFullYear(), 
                        status: 'Faturado',
                        user_full_name: item['Nome Vendedor'] || 'N/A',
                        source: 'Protheus',
                        document_number: docNum
                    };
                }
                acc[docNum].total_amount += item.Total;
                return acc;
            }, {}));

            const finalErpHistory = consolidatedErpBonifications.map(req => {
                const reqDate = new Date(req.request_date);
                const sellerName = req.user_full_name;
                const previousMonthDate = subMonths(reqDate, 1);
                const previousMonthKey = `${previousMonthDate.getFullYear()}-${previousMonthDate.getMonth()}`;
                const totalSellerSalesPreviousMonth = sellerMonthlySales[sellerName]?.[previousMonthKey] || 0;
                const percentual = totalSellerSalesPreviousMonth > 0 ? (req.total_amount / totalSellerSalesPreviousMonth) * 100 : 0;
                return { ...req, percentual };
            });

            setProtheusHistory(finalErpHistory);
            
            setKpis({
                globalLimit,
                previousMonthNetSales,
                bonifiedThisMonth,
                faturadoThisMonth,
                pendingThisMonth,
                pendingRequestsCount: pendingRequests.length,
                pendingRequestsValue,
                totalRecords: processedSystemRequests.length + consolidatedErpBonifications.length
            });

        } catch (error) {
            console.error("Error in fetchData:", error);
            toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: `Falha na comunicação com o servidor. Tente novamente. (${error.message})` });
        } finally {
            setLoading(false);
        }
    }, [toast, user, filters.startDate, filters.endDate, supabase, isSupabaseConfigured]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const pendingForApproval = useMemo(() => allBonifications.filter(req => ['Aguardando Aprovação'].includes(req.status)), [allBonifications]);

    return { loading, kpis, allBonifications, protheusHistory, pendingForApproval, fetchData };
};

export default useConsultData;