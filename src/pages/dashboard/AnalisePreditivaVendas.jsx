import React from 'react';
import { Helmet } from 'react-helmet-async';
import FilterBar from '@/components/FilterBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnaliseChurn from '@/pages/AnaliseChurn';
import AnaliseDesempenhoFidelidade from '@/pages/dashboard/AnaliseDesempenhoFidelidade';
import { TrendingUp, Activity, UserMinus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI, formatCurrency } from '@/lib/utils';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SalesTrendTab = () => {
    const { filters } = useFilters();
    const params = {
        p_start_date: formatDateForAPI(filters.dateRange?.[0]),
        p_end_date: formatDateForAPI(filters.dateRange?.[1]),
        p_regions: filters.regions?.map(String),
    };
    // Using the corrected RPC
    const { data, loading } = useAnalyticalData('get_sales_forecast_data', params, { enabled: !!params.p_start_date });

    if (loading) return <div className="p-10 text-center">Carregando projeções...</div>;

    return (
        <Card>
            <CardHeader><CardTitle>Tendência e Projeção (Média Móvel)</CardTitle></CardHeader>
            <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="actual_sales" stroke="#2563eb" name="Vendas Reais" strokeWidth={2} />
                        <Line type="monotone" dataKey="forecast_sales" stroke="#ef4444" name="Previsão (Tendência)" strokeDasharray="5 5" />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default function AnalisePreditivaVendas() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Análise Preditiva | Costa Lavos</title></Helmet>
      <FilterBar />
      
      <Tabs defaultValue="trend" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
            <TabsTrigger value="trend" className="gap-2"><TrendingUp size={16} /> Tendência</TabsTrigger>
            <TabsTrigger value="churn" className="gap-2"><UserMinus size={16} /> Churn</TabsTrigger>
            <TabsTrigger value="rfm" className="gap-2"><Activity size={16} /> Fidelidade (RFM)</TabsTrigger>
        </TabsList>

        <TabsContent value="trend"><SalesTrendTab /></TabsContent>
        <TabsContent value="churn"><AnaliseChurn /></TabsContent>
        <TabsContent value="rfm"><AnaliseDesempenhoFidelidade /></TabsContent>
      </Tabs>
    </div>
  );
}