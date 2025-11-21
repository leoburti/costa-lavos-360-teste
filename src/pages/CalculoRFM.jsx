import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Loader2, User, DollarSign, Repeat, Calendar } from 'lucide-react';
import ChartCard from '@/components/ChartCard';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import AIInsight from '@/components/AIInsight';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIInsight } from '@/hooks/useAIInsight';

const RFMTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/90 backdrop-blur-sm p-4 border rounded-lg shadow-lg text-sm">
        <p className="font-bold text-base mb-2">{data.name}</p>
        <p><span className="font-semibold">Clientes:</span> {data.clientCount}</p>
        <p><span className="font-semibold">Receita Total:</span> {data.totalMonetary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        <p><span className="font-semibold">Recência Média:</span> {data.avgRecency.toFixed(0)} dias</p>
        <p><span className="font-semibold">Frequência Média:</span> {data.avgFrequency.toFixed(1)} compras</p>
      </div>
    );
  }
  return null;
};

const RFMCustomContent = (props) => {
  const { depth, x, y, width, height, index, name, onClick, clientCount, color } = props;
  if (depth === 0) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: 'hsl(var(--card))',
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
        className="cursor-pointer transition-all hover:opacity-80"
        onClick={() => onClick(props)}
        rx={4}
      />
      {width > 100 && height > 50 && (
        <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={16} className="font-bold pointer-events-none tracking-tight">
          {name}
        </text>
      )}
      {width > 120 && height > 70 && (
         <text x={x + width / 2} y={y + height / 2 + 28} textAnchor="middle" fill="#fff" fontSize={12} fillOpacity={0.9} className="pointer-events-none">
            {clientCount} clientes
          </text>
      )}
    </g>
  );
}

const ClientListModal = ({ segment, open, onOpenChange }) => {
  if (!segment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md" style={{ backgroundColor: segment.color }} />
            Clientes do Segmento: {segment.name}
          </DialogTitle>
          <DialogDescription>
            {segment.clientCount} clientes neste segmento.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4">
          <div className="pr-6 space-y-3">
            {segment.clients.map((client, index) => (
              <motion.div
                key={client.clientName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 bg-muted/50 rounded-lg border"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-foreground truncate pr-4">{client.clientName}</p>
                  <p className="text-xs text-muted-foreground">{client.seller}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-background rounded-md">
                    <Calendar className="mx-auto h-4 w-4 mb-1 text-primary" />
                    <p className="font-bold">{client.recency} dias</p>
                    <p className="text-muted-foreground">Recência</p>
                  </div>
                  <div className="p-2 bg-background rounded-md">
                    <Repeat className="mx-auto h-4 w-4 mb-1 text-primary" />
                    <p className="font-bold">{client.frequency}</p>
                    <p className="text-muted-foreground">Frequência</p>
                  </div>
                  <div className="p-2 bg-background rounded-md">
                    <DollarSign className="mx-auto h-4 w-4 mb-1 text-primary" />
                    <p className="font-bold">{client.monetary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-muted-foreground">Valor</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const CalculoRFM = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [rfmData, setRfmData] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const { toast } = useToast();

  const aiData = useMemo(() => {
    if (!rfmData || rfmData.length === 0) return null;
    const summary = rfmData.map(s => ({
      segment: s.name,
      clientCount: s.clientCount,
      totalMonetary: s.totalMonetary,
      upsellPotential: s.clients.reduce((acc, c) => acc + c.upsellPotential, 0)
    }));
    return { summary };
  }, [rfmData]);

  const { insight, loading: loadingAI, generateInsights } = useAIInsight('rfm_analysis', aiData);

  useEffect(() => {
    const fetchRfmData = async () => {
      if (!filters.startDate || !filters.endDate) return;
      setLoading(true);
      const selectedClients = Array.isArray(filters.clients) ? filters.clients.map(c => c.value) : null;
      const { data, error } = await supabase.rpc('get_rfm_analysis', {
        p_start_date: filters.startDate,
        p_end_date: filters.endDate,
        p_exclude_employees: filters.excludeEmployees,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao buscar dados de RFM",
          description: error.message,
        });
        setRfmData([]);
      } else {
        const groupedData = data.reduce((acc, client) => {
          const segment = client.segment;
          if (!acc[segment]) {
            acc[segment] = {
              name: segment,
              clients: [],
              clientCount: 0,
              totalMonetary: 0,
              totalRecency: 0,
              totalFrequency: 0,
            };
          }
          acc[segment].clients.push(client);
          acc[segment].clientCount += 1;
          acc[segment].totalMonetary += client.monetary;
          acc[segment].totalRecency += client.recency;
          acc[segment].totalFrequency += client.frequency;
          return acc;
        }, {});

        const result = Object.values(groupedData).map(segment => ({
            ...segment,
            avgRecency: segment.totalRecency / segment.clientCount,
            avgFrequency: segment.totalFrequency / segment.clientCount,
        }));
        
        setRfmData(result);
      }
      setLoading(false);
    };

    fetchRfmData();
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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Standardized and vibrant color palette for RFM segments
  const segmentColors = {
    'Campeões': '#10B981', // Emerald 500
    'Clientes Fiéis': '#3B82F6', // Blue 500
    'Potenciais Fiéis': '#06B6D4', // Cyan 500
    'Novos Clientes': '#8B5CF6', // Violet 500
    'Promissores': '#F59E0B', // Amber 500
    'Precisam de Atenção': '#F97316', // Orange 500
    'Em Risco': '#EF4444', // Red 500
    'Hibernando': '#6B7280', // Gray 500
  };

  const treemapData = rfmData.map(item => ({
    name: item.name,
    size: item.clientCount,
    color: segmentColors[item.name] || '#94A3B8',
    ...item
  }));

  return (
    <>
      <Helmet>
        <title>Cálculo RFM - Costa Lavos</title>
        <meta name="description" content="Análise de clientes baseada no modelo RFM (Recência, Frequência, Valor)" />
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Cálculo RFM</h1>
          <p className="text-muted-foreground mt-1">Segmentação de clientes por Recência, Frequência e Valor.</p>
        </div>
        
        <AIInsight insight={insight} loading={loadingAI} onRegenerate={generateInsights} />

        <ChartCard title="Segmentação de Clientes RFM (por contagem de clientes)" height={500}>
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              ratio={4/3}
              stroke="hsl(var(--card))"
              content={<RFMCustomContent onClick={(data) => setSelectedSegment(data)} />}
            >
             <Tooltip content={<RFMTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Legenda dos Segmentos RFM" childClassName="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rfmData.sort((a,b) => b.totalMonetary - a.totalMonetary).map(item => (
              <div key={item.name} className="flex items-start space-x-3">
                <div className="w-3 h-3 mt-1.5 rounded-sm flex-shrink-0" style={{ backgroundColor: segmentColors[item.name] || '#94A3B8' }}></div>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.clientCount} clientes</p>
                  <p className="text-sm font-bold text-foreground">{item.totalMonetary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
      <ClientListModal segment={selectedSegment} open={!!selectedSegment} onOpenChange={() => setSelectedSegment(null)} />
    </>
  );
};

export default CalculoRFM;