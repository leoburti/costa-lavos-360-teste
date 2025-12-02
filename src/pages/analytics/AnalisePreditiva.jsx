
import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFilters } from '@/contexts/FilterContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { formatDateForAPI, formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/customSupabaseClient';
import ChartContainer from '@/components/analytics/ChartContainer';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, History, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ErrorState, EmptyState } from '@/components/common';

export default function AnalisePreditiva() {
  const { filters } = useFilters();
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const params = useMemo(() => ({
    p_start_date: formatDateForAPI(filters.dateRange.from),
    p_end_date: formatDateForAPI(filters.dateRange.to),
    p_exclude_employees: filters.excludeEmployees,
    p_supervisors: filters.supervisors?.length > 0 ? filters.supervisors : null,
    p_sellers: filters.sellers?.length > 0 ? filters.sellers : null,
    p_regions: filters.regions?.length > 0 ? filters.regions : null,
  }), [filters]);

  const { data, loading, error, retry } = useAnalyticalData(
    'get_sales_forecast_data',
    params,
    { enabled: !!params.p_start_date }
  );

  const handleGenerateInsight = async () => {
    if (!data || data.length === 0) return;
    setAiLoading(true);
    try {
      const { data: insight, error } = await supabase.functions.invoke('predictive-analysis', {
        body: JSON.stringify({ 
            data: data.slice(-90), // Enviar últimos 90 dias para análise completa (30/60/90)
            analysis_type: 'Sales Forecast & Trend Analysis',
            context: 'Varejo e Distribuição de Produtos de Limpeza e Higiene'
        })
      });

      if (error) throw error;
      setAiInsight(insight);
    } catch (err) {
      console.error('AI Generation Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  if (error) return <ErrorState error={error} onRetry={retry} />;

  const hasData = data && Array.isArray(data) && data.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <Helmet>
        <title>Previsão de Vendas | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col gap-2 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          Análise Preditiva Avançada
        </h1>
        <p className="text-slate-500">
          Projeção linear, análise de volatilidade e insights históricos com IA.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculando previsões..." />
      ) : !hasData ? (
        <EmptyState description="Sem dados históricos suficientes para gerar previsão." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ChartContainer title="Tendência e Previsão (Regressão Linear)" height={450}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tick={{fontSize: 11}} 
                            tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})} 
                        />
                        <YAxis tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} />
                        <Tooltip 
                            contentStyle={{ borderRadius: 8 }}
                            formatter={(val) => formatCurrency(val)}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="actual_sales" name="Vendas Reais" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.2} />
                        <Line type="monotone" dataKey="forecast_sales" name="Tendência Linear" stroke="#f59e0b" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                    </ComposedChart>
                </ResponsiveContainer>
            </ChartContainer>

            {aiInsight && aiInsight.accuracy_metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Confiança IA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-700">{aiInsight.confidence_score}%</div>
                      <p className="text-xs text-muted-foreground">Estabilidade dos dados</p>
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Precisão (MAPE)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-700">{aiInsight.accuracy_metrics.mape || 'N/A'}</div>
                      <p className="text-xs text-muted-foreground">Erro percentual médio</p>
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Erro Médio (MAE)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-700">{aiInsight.accuracy_metrics.mae || 'N/A'}</div>
                      <p className="text-xs text-muted-foreground">Desvio absoluto médio</p>
                    </CardContent>
                 </Card>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-50 border-slate-200 h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Insights Gemini 2.5
                    </CardTitle>
                    <CardDescription>Análise de 30, 60 e 90 dias</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    {!aiInsight ? (
                        <div className="text-center py-10 flex-1 flex flex-col items-center justify-center">
                            <p className="text-sm text-slate-500 mb-4 px-6">
                                Utilize a Inteligência Artificial para analisar tendências de curto, médio e longo prazo, identificar riscos e calcular a acurácia do modelo.
                            </p>
                            <Button onClick={handleGenerateInsight} disabled={aiLoading} className="bg-purple-600 hover:bg-purple-700">
                                {aiLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Brain className="mr-2 h-4 w-4" />}
                                {aiLoading ? 'Processando dados...' : 'Gerar Análise Completa'}
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-6">
                                {/* Status Geral */}
                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
                                    <span className="font-semibold text-slate-700">Tendência Geral:</span>
                                    <Badge variant={aiInsight.trend === 'crescimento' ? 'success' : aiInsight.trend === 'queda' ? 'destructive' : 'outline'} className="px-3 py-1">
                                        {aiInsight.trend?.toUpperCase() || 'INDEFINIDO'}
                                    </Badge>
                                </div>

                                {/* Abas Históricas */}
                                {aiInsight.historical_analysis && (
                                  <Tabs defaultValue="30d" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                      <TabsTrigger value="30d">30 Dias</TabsTrigger>
                                      <TabsTrigger value="60d">60 Dias</TabsTrigger>
                                      <TabsTrigger value="90d">90 Dias</TabsTrigger>
                                    </TabsList>
                                    {['30d', '60d', '90d'].map((period) => (
                                      <TabsContent key={period} value={period}>
                                        <div className="bg-white p-4 rounded-md border mt-2 space-y-2">
                                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span className="font-bold">Volatilidade: {aiInsight.historical_analysis[`last_${period}`]?.volatility || 'N/A'}</span>
                                            <span>Tendência: {aiInsight.historical_analysis[`last_${period}`]?.trend || 'N/A'}</span>
                                          </div>
                                          <p className="text-sm text-slate-700">
                                            {aiInsight.historical_analysis[`last_${period}`]?.insight || "Sem dados suficientes para este período."}
                                          </p>
                                        </div>
                                      </TabsContent>
                                    ))}
                                  </Tabs>
                                )}

                                <Separator />

                                {/* Recomendações */}
                                <div>
                                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Recomendações Acionáveis
                                  </h4>
                                  <ul className="space-y-2">
                                    {aiInsight.recommendations?.map((rec, idx) => (
                                      <li key={idx} className="text-sm text-slate-600 bg-green-50 p-2 rounded border-l-2 border-green-500">
                                        {rec}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Riscos */}
                                <div>
                                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    Fatores de Risco
                                  </h4>
                                  <ul className="space-y-2">
                                    {aiInsight.risk_factors?.map((risk, idx) => (
                                      <li key={idx} className="text-sm text-slate-600 bg-amber-50 p-2 rounded border-l-2 border-amber-500">
                                        {risk}
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="pt-4">
                                  <Button variant="outline" size="sm" className="w-full" onClick={() => setAiInsight(null)}>
                                    <History className="mr-2 h-4 w-4" /> Nova Análise
                                  </Button>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
