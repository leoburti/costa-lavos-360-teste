
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { format, subDays, isAfter, parseISO } from 'date-fns';

export const useSupervisorCompositeData = (supervisorName, dateRange) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!supervisorName || !dateRange?.from || !dateRange?.to) return;

    setLoading(true);
    setError(null);

    try {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');

      // 1. Resolve Supervisor Name to UUID (Fixing PGRST116 with maybeSingle)
      const { data: supervisorUser, error: userError } = await supabase
        .from('apoio_usuarios')
        .select('id, nome')
        .eq('nome', supervisorName)
        .maybeSingle(); // Changed from .single() to .maybeSingle() to handle 0 or 1 row safely

      if (userError) {
        console.warn('Error resolving supervisor user:', userError);
      }

      const supervisorId = supervisorUser?.id;

      // 2. Fetch Sales Analytical Data (RPC) - Robust Sales/Portfolio Data
      const salesPromise = supabase.rpc('get_supervisor_analytical_data', {
        p_start_date: startDate,
        p_end_date: endDate,
        p_supervisor_name: supervisorName,
        p_exclude_employees: true
      });

      // 3. Fetch CRM Data (Direct Queries)
      let crmDealsPromise = Promise.resolve({ data: [] });
      let crmContactsPromise = Promise.resolve({ data: [] });
      let crmInteractionsPromise = Promise.resolve({ data: [] });

      if (supervisorId) {
        // Get contacts managed by this supervisor's team
        // Assumption: crm_contacts has a supervisor_id column or we rely on seller relation
        const { data: contactsData } = await supabase
            .from('crm_contacts')
            .select('id, status, source, supervisor_id')
            .eq('supervisor_id', supervisorId);
            
        const contactIds = contactsData?.map(c => c.id) || [];
        
        if (contactIds.length > 0) {
             // Fetch Deals
             crmDealsPromise = supabase
                .from('crm_deals')
                .select(`
                    id, title, value, status, probability, created_at, expected_close_date, lost_reason, stage_id,
                    crm_stages (name, order),
                    owner:users_view(id, raw_user_meta_data)
                `)
                .in('contact_id', contactIds)
                .or(`created_at.gte.${startDate},expected_close_date.gte.${startDate}`) // Fetch relevant deals
                .order('value', { ascending: false });

             // Fetch Interactions
             crmInteractionsPromise = supabase
                .from('crm_interactions')
                .select('id, type, interaction_date, user_id')
                .in('contact_id', contactIds)
                .gte('interaction_date', startDate)
                .lte('interaction_date', endDate);
        }

        crmContactsPromise = Promise.resolve({ data: contactsData || [] });
      }

      const [salesResult, dealsResult, contactsResult, interactionsResult] = await Promise.all([
        salesPromise,
        crmDealsPromise,
        crmContactsPromise,
        crmInteractionsPromise
      ]);

      if (salesResult.error) throw salesResult.error;

      // Process Data
      const salesData = salesResult.data || {};
      const deals = dealsResult.data || [];
      const contacts = contactsResult.data || [];
      const interactions = interactionsResult.data || [];

      // --- CRM Calculations ---
      const totalDeals = deals.length;
      
      // Normalize Statuses
      const isOpen = (d) => ['open', 'aberto', 'qualificação', 'proposta', 'negociação'].includes(d.status?.toLowerCase() || d.crm_stages?.name?.toLowerCase());
      const isWon = (d) => ['won', 'ganho', 'fechado ganho'].includes(d.status?.toLowerCase() || d.crm_stages?.name?.toLowerCase());
      const isLost = (d) => ['lost', 'perdido', 'fechado perdido'].includes(d.status?.toLowerCase() || d.crm_stages?.name?.toLowerCase());

      const openDeals = deals.filter(isOpen);
      const wonDeals = deals.filter(isWon);
      const lostDeals = deals.filter(isLost);

      const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      
      const conversionRate = (wonDeals.length + lostDeals.length) > 0 
        ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100 
        : 0;

      // Forecast: Weighted Probability
      const forecast = openDeals.reduce((sum, d) => sum + ((d.value || 0) * ((d.probability || 0) / 100)), 0);

      // Critical Deals: High value open deals or closing soon
      const criticalDeals = openDeals.filter(d => {
        const isHighValue = (d.value || 0) > 5000; // Example threshold
        const isClosingSoon = d.expected_close_date && isAfter(parseISO(d.expected_close_date), new Date()) && isAfter(parseISO(d.expected_close_date), subDays(new Date(), 30));
        return isHighValue || isClosingSoon;
      }).slice(0, 5);

      // Lost Reasons Analysis
      const lostReasons = lostDeals.reduce((acc, d) => {
        const reason = d.lost_reason || 'Não especificado';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {});

      // Interactions by Type
      const interactionsByType = interactions.reduce((acc, i) => {
        const type = i.type || 'Outros';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      setData({
        supervisor: { name: supervisorName, id: supervisorId },
        sales: salesData, // Contains kpis, seller_performance, client_performance, churn_analysis, rfm_analysis from RPC
        crm: {
          deals,
          contacts,
          interactions,
          criticalDeals,
          analysis: {
            totalDeals,
            openDealsCount: openDeals.length,
            wonDealsCount: wonDeals.length,
            lostDealsCount: lostDeals.length,
            pipelineValue,
            wonValue,
            forecast,
            conversionRate,
            lostReasons,
            interactionsByType,
            avgTicket: wonDeals.length > 0 ? wonValue / wonDeals.length : 0
          }
        }
      });

    } catch (err) {
      console.error('Error fetching supervisor composite data:', err);
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível consolidar os dados do supervisor.'
      });
    } finally {
      setLoading(false);
    }
  }, [supervisorName, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
