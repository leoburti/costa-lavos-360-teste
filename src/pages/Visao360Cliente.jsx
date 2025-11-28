import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import ClientList from '@/components/Client360/ClientList';
import Client360Dashboard from '@/components/Client360/ClientDashboard';
import ClientGroupDashboard from '@/components/Client360/ClientGroupDashboard';
import { Loader2, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useFilters } from '@/contexts/FilterContext';
import { usePageActions } from '@/contexts/PageActionContext';
import FilterBar from '@/components/FilterBar';
import { format, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { supabase } from '@/lib/customSupabaseClient';

const Visao360Cliente = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [groupClients, setGroupClients] = useState([]);
  const [loadingGroupClients, setLoadingGroupClients] = useState(false);
  const { toast } = useToast();
  const { filters } = useFilters();
  const { setPageActions } = usePageActions();
  const [clientData, setClientData] = useState(null);
  const [loadingClient, setLoadingClient] = useState(false);
  const [clientError, setClientError] = useState(null);

  useEffect(() => {
    setPageActions(<FilterBar showPeriodSelector={true} showFilters={false} />);
    return () => setPageActions(null);
  }, [setPageActions]);

  const dateRange = useMemo(() => {
    const today = new Date();
    let from = filters.dateRange?.from ? new Date(filters.dateRange.from) : startOfMonth(today);
    let to = filters.dateRange?.to ? new Date(filters.dateRange.to) : endOfMonth(today);
    
    if (!isValid(from)) from = startOfMonth(today);
    if (!isValid(to)) to = endOfMonth(today);

    return { from, to };
  }, [filters.dateRange]);

  const startDateStr = format(dateRange.from, 'yyyy-MM-dd');
  const endDateStr = format(dateRange.to, 'yyyy-MM-dd');

  // Manual fetch for individual client data
  useEffect(() => {
    const fetchClientData = async () => {
      if (!selectedItem || selectedItem.type !== 'client') {
        setClientData(null);
        return;
      }
      
      setLoadingClient(true);
      setClientError(null);
      setClientData(null);

      const parts = selectedItem.id.split('-');
      if (parts.length < 2) {
        setClientError("Formato de ID do cliente inválido.");
        setLoadingClient(false);
        return;
      }

      const params = {
        p_start_date: startDateStr,
        p_end_date: endDateStr,
        p_target_client_code: parts[0],
        p_target_store: parts[1],
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: null,
        p_search_term: filters.searchTerm,
        p_products: filters.products,
        p_show_defined_groups_only: false,
      };

      try {
        const { data, error } = await supabase.rpc('get_client_360_data_v2', params);
        if (error) throw error;
        setClientData(data?.[0] || null);
      } catch (err) {
        setClientError(err.message);
        toast({
            variant: "destructive",
            title: "Erro ao carregar dados do cliente",
            description: err.message,
        });
      } finally {
        setLoadingClient(false);
      }
    };
    
    fetchClientData();
  }, [selectedItem, startDateStr, endDateStr, filters, toast]);


  // Fetch clients for a selected group
  const fetchGroupClients = useCallback(async (groupName) => {
    setLoadingGroupClients(true);
    setGroupClients([]);
    try {
        const { data, error } = await supabase.rpc('get_clients_by_group_name', {
            p_group_name: groupName,
            p_start_date: startDateStr,
            p_end_date: endDateStr,
        });

        if (error) throw error;
        setGroupClients(data || []);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Erro ao buscar clientes do grupo",
            description: error.message,
        });
    } finally {
        setLoadingGroupClients(false);
    }
  }, [startDateStr, endDateStr, toast]);

  const handleItemSelect = useCallback((item) => {
    setSelectedItem(item);
    if (item.type === 'group') {
      fetchGroupClients(item.nome);
    }
  }, [fetchGroupClients]);

  const handleBackToSelection = useCallback(() => {
    setSelectedItem(null);
    setGroupClients([]);
  }, []);

  const renderDashboard = () => {
    if (!selectedItem) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/10">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <ShoppingBag className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Visão 360°</h2>
          <p className="text-muted-foreground max-w-md">
            Selecione um cliente ou grupo na lista à esquerda para ver a análise detalhada.
          </p>
        </div>
      );
    }

    if (loadingClient || loadingGroupClients) {
       return (
        <div className="flex flex-col items-center justify-center h-full bg-background/50">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground animate-pulse font-medium">Carregando dados de {selectedItem.nome_fantasia || selectedItem.nome}...</p>
        </div>
      );
    }

    if (clientError) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="bg-destructive/10 p-4 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <p className="font-medium text-lg">Erro ao carregar dados do cliente</p>
            <p className="text-muted-foreground text-sm max-w-sm">{clientError}</p>
        </div>
      );
    }
    
    if (selectedItem.type === 'client' && clientData) {
      return <Client360Dashboard key={selectedItem.id} data={clientData} />;
    }

    if (selectedItem.type === 'group') {
       return (
          <ClientGroupDashboard 
            key={selectedItem.id}
            groupName={selectedItem.nome} 
            clients={groupClients}
            onBack={handleBackToSelection}
            filters={filters}
            onGenerateReport={() => toast({ title: "Função em desenvolvimento"})}
          />
       );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="bg-muted p-4 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Não foi possível exibir os dados para o item selecionado.</p>
        </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Visão 360° - Costa Lavos</title>
        <meta name="description" content="Análise detalhada de cliente e grupos 360 graus" />
      </Helmet>

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
        <div className="w-1/3 min-w-[320px] max-w-[450px] h-full border-r border-border bg-card flex flex-col">
          <ClientList 
            onSelect={handleItemSelect} 
            selectedItem={selectedItem} 
            dateRange={dateRange} 
          />
        </div>

        <div className="flex-1 h-full overflow-hidden relative bg-muted/10">
          {renderDashboard()}
        </div>
      </div>
    </>
  );
};

export default Visao360Cliente;