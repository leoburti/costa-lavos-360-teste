import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, HardHat, DollarSign, Users, ShoppingCart, BarChart2, TrendingUp, ChevronRight, Building } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
const formatPercentage = (value) => value != null ? `${value.toFixed(2)}%` : 'N/A';
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';

const CollapsibleContent = ({ children, isOpen }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial="collapsed"
        animate="open"
        exit="collapsed"
        variants={{
          open: { opacity: 1, height: 'auto', marginTop: '16px' },
          collapsed: { opacity: 0, height: 0, marginTop: '0px' },
        }}
        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

const HistoryItem = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.orders && item.orders.length > 0;

  return (
    <div className={`pl-${level * 4}`}>
      <div 
        className={`flex items-center justify-between p-2 rounded-md ${hasChildren ? 'cursor-pointer hover:bg-muted' : ''}`}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {hasChildren && (
            <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          )}
          <span className="font-semibold">{item.date ? formatDate(item.date) : `Pedido ${item.order_id}`}</span>
        </div>
        {item.order_total && <Badge variant="secondary">{formatCurrency(item.order_total)}</Badge>}
      </div>
      {hasChildren && (
        <CollapsibleContent isOpen={isOpen}>
          <div className="space-y-2 pl-4 border-l-2 ml-3">
            {item.orders.map((order) => (
              <div key={order.order_id} className="p-2 border rounded-md bg-background">
                 <p className="font-semibold text-sm">Pedido: {order.order_id} - Total: {formatCurrency(order.order_total)}</p>
                 <div className="text-xs mt-2 space-y-1">
                  {order.items.map(product => (
                    <div key={product.name} className="flex justify-between">
                      <p>{product.name} ({product.quantity}x)</p>
                      <p className="font-medium">{formatCurrency(product.total)}</p>
                    </div>
                  ))}
                 </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      )}
    </div>
  );
};

const ClientItem = ({ client, initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="flex flex-row items-center justify-between p-4 cursor-pointer hover:bg-muted/50" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-muted rounded-md">
            {client.grouping_level === 'customer_group' ? <Building className="h-5 w-5 text-primary" /> : <Users className="h-5 w-5 text-primary" />}
          </div>
          <div className="flex-1 overflow-hidden">
            <CardTitle className="text-base font-semibold truncate">{client.name}</CardTitle>
            <div className="text-xs text-muted-foreground flex items-center gap-4 mt-1 flex-wrap">
              <span>Equip.: <span className="font-bold">{client.equipment_count}</span></span>
              <span>V. Equip.: <span className="font-bold">{formatCurrency(client.equipment_value)}</span></span>
              <span>V. Prod.: <span className="font-bold">{formatCurrency(client.total_sales)}</span></span>
              <span>ROI: <span className="font-bold text-teal-500">{formatPercentage(client.roi)}</span></span>
            </div>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </CardHeader>
      <CollapsibleContent isOpen={isOpen}>
        <CardContent className="p-4 border-t">
          {client.history && client.history.length > 0 ? (
             <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-1">
                  {client.history.map((dateItem) => (
                    <HistoryItem key={dateItem.date} item={dateItem} />
                  ))}
                </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-center text-muted-foreground p-4">Sem histórico de equipamentos para este cliente.</p>
          )}
        </CardContent>
      </CollapsibleContent>
    </Card>
  );
};

const AnaliticoEquipamentosCliente = () => {
  const { filters } = useFilters();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ kpis: {}, clients: [] });
  const [analysisType, setAnalysisType] = useState('client'); // 'client' or 'customer_group'

  useEffect(() => {
    const fetchData = async () => {
      if (!filters.startDate || !filters.endDate) return;
      setLoading(true);
      const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
      
      const { data: result, error } = await supabase.rpc('get_equipment_by_client', {
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
        p_grouping_level: analysisType,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: error.message,
        });
        setData({ kpis: {}, clients: [] });
      } else {
        setData(result);
      }
      setLoading(false);
    };

    fetchData();
  }, [filters, analysisType, toast]);
  
  const { kpis, clients } = data;

  const topClientsBySales = useMemo(() => {
    return [...(clients || [])].sort((a, b) => b.total_sales - a.total_sales).slice(0, 5);
  }, [clients]);

  const topClientsByEquipment = useMemo(() => {
    return [...(clients || [])].sort((a, b) => b.equipment_value - a.equipment_value).slice(0, 5);
  }, [clients]);

  return (
    <>
      <Helmet>
        <title>Análise de Equipamentos por Cliente - Costa Lavos</title>
        <meta name="description" content="Análise detalhada de equipamentos em comodato por cliente." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HardHat className="h-8 w-8 text-primary" />
            Análise de Equipamentos
          </h1>
          <Tabs value={analysisType} onValueChange={setAnalysisType} className="w-full max-w-[300px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client">Por Cliente</TabsTrigger>
              <TabsTrigger value="customer_group">Por Grupo</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MetricCard title={analysisType === 'client' ? "Clientes c/ Equip." : "Grupos c/ Equip."} value={kpis?.totalclientswithequipment || 0} icon={Users} />
              <MetricCard title="Custo Total Equip." value={formatCurrency(kpis?.totalequipmentvalue)} icon={DollarSign} />
              <MetricCard title="Vendas Totais" value={formatCurrency(kpis?.totalsaleswithequipment)} icon={ShoppingCart} />
              <MetricCard title="Ticket Médio" value={formatCurrency(kpis?.averageticketwithequipment)} icon={BarChart2} />
              <MetricCard title="ROI Médio" value={formatPercentage(kpis?.average_roi)} icon={TrendingUp} isPositive={kpis?.average_roi > 0} />
            </motion.div>

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <ChartCard title={`Top 5 ${analysisType === 'client' ? 'Clientes' : 'Grupos'} por Vendas de Produtos`}>
                {topClientsBySales.length > 0 ? (
                  topClientsBySales.map(client => (
                    <div key={client.name} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <p className="font-medium text-sm truncate pr-4">{client.name}</p>
                      <p className="font-semibold text-sm text-emerald-500">{formatCurrency(client.total_sales)}</p>
                    </div>
                  ))
                ) : <p className="text-center text-sm text-muted-foreground p-4">Sem dados para exibir.</p>}
              </ChartCard>
              <ChartCard title={`Top 5 ${analysisType === 'client' ? 'Clientes' : 'Grupos'} por Valor de Equipamento`}>
                {topClientsByEquipment.length > 0 ? (
                  topClientsByEquipment.map(client => (
                    <div key={client.name} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <p className="font-medium text-sm truncate pr-4">{client.name}</p>
                      <p className="font-semibold text-sm text-sky-500">{formatCurrency(client.equipment_value)}</p>
                    </div>
                  ))
                ) : <p className="text-center text-sm text-muted-foreground p-4">Sem dados para exibir.</p>}
              </ChartCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes por {analysisType === 'client' ? 'Cliente' : 'Grupo de Clientes'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {clients && clients.length > 0 ? (
                    <div className="space-y-4">
                      {clients.map((client) => (
                        <ClientItem key={client.name} client={client} initialOpen={false} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Nenhum cliente com equipamento encontrado para os filtros selecionados.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </>
  );
};

export default AnaliticoEquipamentosCliente;