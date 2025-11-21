import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, Wrench, DollarSign, PackagePlus, ArrowRight, Store, Calendar, ShoppingCart, Hash } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAIInsight } from '@/hooks/useAIInsight';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';

const AnaliticoEquipamento = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [equipmentData, setEquipmentData] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const { toast } = useToast();

  const aiData = useMemo(() => {
    if (!equipmentData || equipmentData.length === 0) return null;
    const summary = {
      totalEquipmentCost: equipmentData.reduce((acc, item) => acc + item.total_revenue, 0),
      totalClients: new Set(equipmentData.flatMap(item => item.details.map(c => c.client_name))).size,
      topEquipments: equipmentData.slice(0, 3).map(e => ({ name: e.equipment_name, revenue: e.total_revenue, client_count: e.client_count })),
    };
    return summary;
  }, [equipmentData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('equipment_roi_analysis', aiData);

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.startDate || !filters.endDate) return;
      setLoading(true);
      setSelectedEquipment(null);
      const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
      const { data, error } = await supabase.rpc('get_detailed_equipment_analysis', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
        p_show_defined_groups_only: false,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar dados de equipamentos',
          description: error.message,
        });
        setEquipmentData([]);
      } else {
        setEquipmentData(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [filters, toast]);

  useEffect(() => {
    if(aiData) {
      generateInsights();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiData]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const totalEquipmentCost = equipmentData.reduce((acc, item) => acc + item.total_revenue, 0);
  const totalClients = new Set(equipmentData.flatMap(item => item.details.map(c => c.client_name))).size;
  const mostValuableEquipment = equipmentData.length > 0 ? equipmentData[0] : { equipment_name: 'N/A', total_revenue: 0 };

  const handleEquipmentClick = (equipment) => {
    setSelectedEquipment(equipment);
  };

  const aggregatedDetails = selectedEquipment ? selectedEquipment.details.reduce((acc, detail) => {
    const date = formatDate(detail.sale_date);
    if (!acc[date]) {
      acc[date] = { date, total: 0, clients: {} };
    }
    acc[date].total += detail.value;
    
    if (!acc[date].clients[detail.client_name]) {
      acc[date].clients[detail.client_name] = { name: detail.client_name, total: 0, orders: {} };
    }
    acc[date].clients[detail.client_name].total += detail.value;

    if (!acc[date].clients[detail.client_name].orders[detail.order_id]) {
      acc[date].clients[detail.client_name].orders[detail.order_id] = { id: detail.order_id, total: 0, items: [] };
    }
    acc[date].clients[detail.client_name].orders[detail.order_id].total += detail.value;
    acc[date].clients[detail.client_name].orders[detail.order_id].items.push({
        quantity: detail.quantity,
        value: detail.value
    });


    return acc;
  }, {}) : {};

  const dailyAggregatedData = Object.values(aggregatedDetails).map(day => ({
    ...day,
    clients: Object.values(day.clients).map(client => ({
      ...client,
      orders: Object.values(client.orders)
    })).sort((a, b) => b.total - a.total)
  })).sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));

  return (
    <>
      <Helmet>
        <title>Análise de Equipamentos - Costa Lavos</title>
        <meta name="description" content="Análise do ROI de equipamentos, comparando a receita de produtos com o custo do equipamento." />
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Análise Detalhada de Equipamentos</h1>
          <p className="text-muted-foreground mt-1">Valor total e clientes atendidos por tipo de equipamento.</p>
        </div>

        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard title="Custo Total Equip." value={formatCurrency(totalEquipmentCost)} icon={Wrench} />
          <MetricCard title="Total Clientes Atendidos" value={String(totalClients)} icon={PackagePlus} />
          <MetricCard title="Equip. Mais Valioso" value={mostValuableEquipment.equipment_name} subtitle={formatCurrency(mostValuableEquipment.total_revenue)} icon={DollarSign} />
        </div>

        {selectedEquipment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8"
          >
            <MetricCard 
              title={`Quantidade de ${selectedEquipment.equipment_name}`} 
              value={String(selectedEquipment.equipment_count || 0)} 
              icon={Hash} 
            />
            <MetricCard 
              title={`Valor Total de Venda (${selectedEquipment.equipment_name})`} 
              value={formatCurrency(selectedEquipment.total_revenue)} 
              icon={DollarSign} 
            />
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Valor Total por Equipamento">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-2">
                {equipmentData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleEquipmentClick(item)}
                    className="p-3 rounded-lg border bg-card hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm truncate pr-4">{item.equipment_name}</p>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="flex items-center gap-1.5">
                          <Hash className="h-3 w-3" />
                          <span>{item.equipment_count || 0}</span>
                        </Badge>
                        <Badge variant={selectedEquipment?.equipment_name === item.equipment_name ? "default" : "secondary"}>
                          {formatCurrency(item.total_revenue)}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </ChartCard>
          <ChartCard title={selectedEquipment ? `Detalhes de: ${selectedEquipment.equipment_name}` : "Selecione um Equipamento"}>
            {selectedEquipment ? (
              <ScrollArea className="h-[400px]">
                <Accordion type="multiple" className="w-full p-2">
                  {dailyAggregatedData.map((day, dayIndex) => (
                    <AccordionItem value={`day-${dayIndex}`} key={dayIndex}>
                      <AccordionTrigger className="hover:no-underline p-2 rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-2 w-full justify-between">
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> <span className="font-semibold">{day.date}</span></div>
                          <Badge variant="outline">{formatCurrency(day.total)}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-6 pt-2">
                        <Accordion type="multiple" className="w-full">
                          {day.clients.map((client, clientIndex) => (
                            <AccordionItem value={`client-${clientIndex}`} key={clientIndex}>
                              <AccordionTrigger className="hover:no-underline p-2 rounded-lg hover:bg-muted/50 text-sm">
                                <div className="flex items-center gap-2 w-full justify-between">
                                  <div className="flex items-center gap-2"><Store className="h-4 w-4 text-muted-foreground" /> <span className="font-medium truncate">{client.name}</span></div>
                                  <Badge variant="secondary">{formatCurrency(client.total)}</Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pl-6 pt-2">
                                {client.orders.map((order, orderIndex) => (
                                  <div key={orderIndex} className="flex items-center gap-2 p-1.5 text-xs">
                                    <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                                    <span>Pedido {order.id}:</span>
                                    <span className="font-semibold ml-auto">{order.items[0].quantity}x {formatCurrency(order.total)}</span>
                                  </div>
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <ArrowRight className="h-10 w-10 mb-4" />
                <p className="font-semibold">Selecione um equipamento à esquerda</p>
                <p className="text-sm">para ver os detalhes de clientes e pedidos.</p>
              </div>
            )}
          </ChartCard>
        </div>

      </div>
    </>
  );
};

export default AnaliticoEquipamento;