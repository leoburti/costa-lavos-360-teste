
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import ClientList from '@/components/Client360/ClientList';
import Client360Dashboard from '@/components/Client360/ClientDashboard';
import { Loader2, ShoppingBag, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useFilters } from '@/contexts/FilterContext';
import { usePageActions } from '@/contexts/PageActionContext';
import FilterBar from '@/components/FilterBar';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { format, startOfMonth, endOfMonth, isValid } from 'date-fns';

const Visao360Cliente = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const { toast } = useToast();
  const { filters } = useFilters();
  const { setPageActions } = usePageActions();

  // Configure page actions
  useEffect(() => {
    setPageActions(<FilterBar showPeriodSelector={true} showFilters={false} />);
    return () => setPageActions(null);
  }, [setPageActions]);

  // Safe date calculation
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

  // Params for Dashboard Data
  const params = useMemo(() => {
    if (!selectedItem || selectedItem.type !== 'client') return null;
    
    const parts = selectedItem.id.split('-');
    if (parts.length < 2) return null;
    
    const clientCode = parts[0];
    const store = parts[1];
    
    return {
        p_start_date: startDateStr,
        p_end_date: endDateStr,
        p_exclude_employees: filters.excludeEmployees ?? false,
        p_supervisors: null,
        p_sellers: null,
        p_customer_groups: null,
        p_regions: null,
        p_clients: null, 
        p_search_term: null,
        p_products: null,
        p_show_defined_groups_only: false,
        p_target_client_code: clientCode,
        p_target_store: store
    };
  }, [selectedItem, startDateStr, endDateStr, filters]);

  // Memoize options
  const options = useMemo(() => ({ 
    enabled: !!params,
    defaultValue: []
  }), [params]);

  const { data: clientData, loading } = useAnalyticalData(
    'get_client_360_data_v2',
    params,
    options
  );

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    if (item.type === 'group') {
       toast({
        title: "Visão de Grupo",
        description: "A visão consolidada para grupos está em desenvolvimento.",
      });
    }
  };

  const itemData = clientData && clientData.length > 0 ? clientData[0] : null;

  const renderDashboard = () => {
    if (!selectedItem) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/10">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <ShoppingBag className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Visão 360°</h2>
          <p className="text-muted-foreground max-w-md">
            Selecione um cliente na lista à esquerda para ver a análise detalhada completa.
          </p>
        </div>
      );
    }
    
    if (loading) {
       return (
        <div className="flex flex-col items-center justify-center h-full bg-background/50">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground animate-pulse font-medium">Carregando dados de {selectedItem.nome_fantasia || selectedItem.nome}...</p>
        </div>
      );
    }

    if (selectedItem.type === 'client' && itemData) {
      return <Client360Dashboard key={selectedItem.id} data={itemData} />;
    }

    if (selectedItem.type === 'group') {
       return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/10">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Grupo: {selectedItem.nome}</h2>
          <p className="text-muted-foreground max-w-md">
            Funcionalidade para grupos em breve.
          </p>
        </div>
      );
    }
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="bg-muted p-4 rounded-full mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Preparando visualização...</p>
        </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Visão 360° - Costa Lavos</title>
        <meta name="description" content="Análise detalhada de cliente 360 graus" />
      </Helmet>

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
        <div className="w-1/3 min-w-[320px] max-w-[450px] h-full border-r border-border bg-card flex flex-col">
          <ClientList 
            onSelect={handleItemSelect} 
            selectedItem={selectedItem} 
            dateRange={dateRange} 
          />
        </div>

        <div className="flex-1 h-full overflow-hidden relative bg-background">
          {renderDashboard()}
        </div>
      </div>
    </>
  );
};

export default Visao360Cliente;
