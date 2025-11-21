import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, Users, ShoppingCart, BarChart2, Building, Clock, HardHat, Percent, Truck, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import AIInsight from '@/components/AIInsight';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIInsight } from '@/hooks/useAIInsight';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Group360AnalysisTab from '@/components/Client360/Group360AnalysisTab';
import EquipmentROIAnalysisTab from '@/components/Client360/EquipmentROIAnalysisTab';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/contexts/SupabaseAuthContext';

const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00';
const formatPercentage = (value) => value != null ? `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : '0,00%';
const formatNumber = (value) => value != null ? value.toLocaleString('pt-BR') : '0';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/80 backdrop-blur-sm p-3 border border-border rounded-lg shadow-lg min-w-[200px]">
        <p className="label font-bold text-foreground truncate">{label}</p>
        <p className="intro text-primary">{`Receita: ${formatCurrency(payload[0].value)}`}</p>
      </div>
    );
  }
  return null;
};

const ClientGroupDashboard = ({ groupName, clients, onBack, filters, onGenerateReport }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [analysis360Data, setAnalysis360Data] = useState(null);
  const [loading360, setLoading360] = useState(true);
  const [error360, setError360] = useState(null);
  const { toast } = useToast();
  const { userContext } = useAuth();

  const safeClients = Array.isArray(clients) ? clients : [];

  const fetch360Analysis = useCallback(async (abortController) => {
    setLoading360(true);
    setError360(null);
    try {
      const clientIdentifiers = safeClients.map(c => ({ client_code: c.client_code, store: c.store }));
      
      const { data: responseData, error: functionError } = await supabase.rpc('get_group_360_analysis', {
        p_clients: clientIdentifiers,
      });

      if (abortController.signal.aborted) return;
      
      if (functionError) throw functionError;
      
      setAnalysis360Data(responseData);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Error fetching group 360 analysis data:", err);
        setError360("Não foi possível carregar a análise completa do grupo.");
        toast({
          variant: "destructive",
          title: "Erro na Análise Completa",
          description: err.message || "Ocorreu um erro inesperado.",
        });
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading360(false);
      }
    }
  }, [safeClients, toast]);

  useEffect(() => {
    if (safeClients.length > 0) {
        const abortController = new AbortController();
        fetch360Analysis(abortController);
        return () => abortController.abort();
    } else {
        setLoading360(false);
    }
  }, [safeClients, fetch360Analysis]);

  const overviewData = useMemo(() => {
    if (!safeClients || safeClients.length === 0) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
      };
    }

    const totalRevenue = safeClients.reduce((sum, client) => sum + (client.total_revenue || 0), 0);
    const totalOrders = safeClients.reduce((sum, client) => sum + (client.total_orders || 0), 0);

    return {
      totalRevenue,
      totalOrders
    };
  }, [safeClients]);

  const sortedClients = useMemo(() => [...safeClients].sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0)), [safeClients]);
  
  const aiData = useMemo(() => {
    if (!analysis360Data) return null;
    const topClientsForAI = sortedClients.slice(0, 10);
    return {
        groupName: groupName,
        totalRevenue: overviewData.totalRevenue,
        clientCount: safeClients.length,
        topClients: topClientsForAI.map(c => ({ name: c.name, revenue: c.total_revenue })),
        kpis: analysis360Data.kpis
    };
  }, [groupName, sortedClients, overviewData.totalRevenue, safeClients.length, analysis360Data]);

  const { insight, loading: loadingAI, retry: retryAI } = useAIInsight('client_group_analysis', aiData, filters);

  const analysisForRoiTab = useMemo(() => ({
    kpis: {
        total_revenue: overviewData.totalRevenue,
        total_equipment_value: analysis360Data?.kpis?.total_equipment_value || 0,
    },
    equipment_inventory_summary: analysis360Data?.equipment_inventory_summary || []
  }), [overviewData.totalRevenue, analysis360Data]);

  if (loading360) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="p-8 bg-muted/50 rounded-full mb-6">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight">Carregando Análise do Grupo...</h3>
        <p className="text-muted-foreground mt-2 max-w-md">Aguarde enquanto os dados do grupo são consolidados.</p>
      </div>
    );
  }

  if (error360) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 rounded-lg m-4 min-h-[400px]">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="mt-4 text-destructive font-semibold">{error360}</p>
        <Button onClick={() => fetch360Analysis(new AbortController())} className="mt-4">Tentar Novamente</Button>
      </div>
    );
  }
  
  const { totalRevenue, totalOrders } = overviewData;
  const totalEquipmentValue = analysis360Data?.kpis?.total_equipment_value || 0;
  const equipmentInField = analysis360Data?.kpis?.equipment_in_field || 0;
  const equipmentInventorySummary = analysis360Data?.equipment_inventory_summary || [];

  const contributionMargin = totalRevenue * 0.15;
  const groupROI = totalEquipmentValue > 0 ? (contributionMargin / totalEquipmentValue) * 100 : 0;
  const averageTicket = safeClients.length > 0 ? totalRevenue / safeClients.length : 0;

  return (
    <ScrollArea className="h-full">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 lg:p-8 space-y-6"
      >
        <motion.div variants={itemVariants}>
            <div className="flex justify-between items-start">
              <Button variant="ghost" onClick={onBack} className="text-primary hover:text-primary/80 -ml-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Seleção
              </Button>
              <Button onClick={onGenerateReport}>
                <Printer className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </div>
          <div className="flex items-center gap-4 mt-4">
             <div className="p-4 bg-muted rounded-lg">
                <Building className="h-8 w-8 text-primary"/>
            </div>
            <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground tracking-tighter">{groupName}</h1>
                <p className="text-muted-foreground">Análise consolidada do grupo de clientes</p>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <BarChart2 className="mr-2 h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="analysis_360">
              <Clock className="mr-2 h-4 w-4" />
              Análise 360°
            </TabsTrigger>
            <TabsTrigger value="roi_analysis">
              <HardHat className="mr-2 h-4 w-4" />
              Ativos e ROI
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <motion.div 
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 mt-6"
            >
              <motion.div variants={itemVariants}>
                <AIInsight insight={insight} loading={loadingAI} onRegenerate={retryAI} />
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Receita Total do Grupo" value={formatCurrency(totalRevenue)} icon={DollarSign} />
                <MetricCard title="Clientes Ativos" value={String(safeClients.length)} icon={Users} />
                <MetricCard title="Total de Pedidos" value={String(totalOrders)} icon={ShoppingCart} />
                <MetricCard title="Receita Média por Cliente" value={formatCurrency(averageTicket)} icon={BarChart2} />
                <MetricCard title="ROI (Margem 15%)" value={formatPercentage(groupROI)} icon={Percent} />
                <MetricCard title="Valor dos Ativos" value={formatCurrency(totalEquipmentValue)} icon={HardHat} />
                <MetricCard title="Equipamentos em Campo" value={formatNumber(equipmentInField)} icon={Truck} />
              </motion.div>

              <motion.div variants={itemVariants}>
                  <ChartCard title="Ranking de Clientes do Grupo (Receita no período)" height={Math.max(400, safeClients.length * 40)}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sortedClients} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis type="number" tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} fontSize={12} axisLine={false} tickLine={false}/>
                        <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} interval={0} axisLine={false} tickLine={false} style={{ textOverflow: 'ellipsis' }}/>
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
                        <Bar dataKey="total_revenue" name="Receita" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
              </motion.div>

              {equipmentInventorySummary && equipmentInventorySummary.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <HardHat className="mr-2 h-5 w-5 text-primary" />
                        Inventário de Equipamentos (Grupo Consolidado)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Equipamento</TableHead>
                            <TableHead className="text-right">Quantidade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {equipmentInventorySummary.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">{formatNumber(item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
          <TabsContent value="analysis_360">
             <Group360AnalysisTab 
                clients={safeClients} 
                groupAnalysisData={analysis360Data}
                loading={loading360}
                error={error360}
              />
          </TabsContent>
           <TabsContent value="roi_analysis">
             <EquipmentROIAnalysisTab groupAnalysisData={analysisForRoiTab} isGroupView={true} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </ScrollArea>
  );
};

export default ClientGroupDashboard;