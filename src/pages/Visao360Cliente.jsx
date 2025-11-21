import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ClientList from '@/components/Client360/ClientList';
import Client360Dashboard from '@/components/Client360/ClientDashboard';
import { Loader2, ShoppingBag, Users } from 'lucide-react';
import { client360Service } from '@/services/client360Service';
import { useToast } from '@/components/ui/use-toast';
import { useFilters } from '@/contexts/FilterContext';
import { usePageActions } from '@/contexts/PageActionContext';
import FilterBar from '@/components/FilterBar';

const Visao360Cliente = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { rawDateRange } = useFilters();
  const { setPageActions } = usePageActions();

  // Set header filters
  useEffect(() => {
    setPageActions(<FilterBar showPeriodSelector={true} showFilters={false} />);
    return () => setPageActions(null);
  }, [setPageActions]);

  const handleItemSelect = async (item) => {
    // Clear previous data immediately to prevent showing old data while loading
    setItemData(null);
    setSelectedItem(item);
    
    if (item.type === 'client') {
      setLoading(true);
      
      try {
        const data = await client360Service.getClientFullData(item);
        setItemData(data);
      } catch (error) {
        console.error("Error loading client data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as informações completas do cliente."
        });
        // Reset selection on error so user can try again or select another
        setSelectedItem(null); 
      } finally {
        setLoading(false);
      }
    } else if (item.type === 'group') {
       toast({
        title: "🚧 Funcionalidade em desenvolvimento",
        description: "A visão detalhada para grupos de clientes será implementada em breve.",
      });
      // Group data is not yet implemented, so we just keep itemData null
    }
  };

  const renderDashboard = () => {
    if (!selectedItem) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/10">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <ShoppingBag className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Nenhum item selecionado</h2>
          <p className="text-muted-foreground max-w-md">
            Selecione um cliente ou grupo na lista à esquerda para ver uma análise detalhada.
          </p>
        </div>
      );
    }
    
    if (loading) {
       return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground animate-pulse font-medium">Carregando dados de {selectedItem.nome_fantasia || selectedItem.nome}...</p>
        </div>
      );
    }

    if (selectedItem.type === 'client' && itemData) {
      // Force re-render of dashboard when data changes by using key
      return <Client360Dashboard key={selectedItem.id} data={itemData} />;
    }

    if (selectedItem.type === 'group') {
       return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/10">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Visão de Grupo: {selectedItem.nome}</h2>
          <p className="text-muted-foreground max-w-md">
            A visão detalhada para grupos de clientes está em desenvolvimento. Você poderá ver dados agregados, KPIs e tendências para este grupo em breve.
          </p>
        </div>
      );
    }
    
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Visão 360° - Faturamento - Costa Lavos</title>
        <meta name="description" content="Análise de faturamento por cliente e grupo" />
      </Helmet>

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
        <div className="w-1/3 min-w-[320px] max-w-[450px] h-full border-r border-border">
          <ClientList 
            onSelect={handleItemSelect} 
            selectedItem={selectedItem} 
            dateRange={rawDateRange} 
          />
        </div>

        <div className="flex-1 h-full overflow-hidden relative">
          {renderDashboard()}
        </div>
      </div>
    </>
  );
};

export default Visao360Cliente;