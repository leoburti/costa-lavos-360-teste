import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useRankingData } from '@/hooks/useRankingData';
import { AlertCircle, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RankingTabContent = ({ dimension, label }) => {
  const { data, isLoading, isError } = useRankingData(dimension);

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-[60%]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
        <p>Não foi possível carregar os dados de {label}.</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm border-2 border-dashed rounded-lg mt-4">
        <p>Nenhum dado disponível para esta categoria no período.</p>
      </div>
    );
  }

  // Determina se deve usar KG ou UN
  const isProduct = dimension === 'products';
  const volumeUnit = isProduct ? 'kg' : 'un';

  return (
    <div className="mt-4">
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[50px] text-center text-xs font-bold uppercase text-slate-500">Pos</TableHead>
              <TableHead className="text-xs font-bold uppercase text-slate-500">Nome</TableHead>
              <TableHead className="text-right text-xs font-bold uppercase text-slate-500">Pedidos</TableHead>
              <TableHead className="text-right text-xs font-bold uppercase text-slate-500">Volume ({volumeUnit})</TableHead>
              <TableHead className="text-right text-xs font-bold uppercase text-slate-500">Faturamento</TableHead>
              <TableHead className="w-[120px] text-center text-xs font-bold uppercase text-slate-500">Tendência</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const trend = item.trend_status || 'Estável';
              let trendIcon = <Minus className="h-3 w-3" />;
              let trendColor = "bg-slate-100 text-slate-600 border-slate-200";

              if (trend === 'Em crescimento') {
                trendIcon = <TrendingUp className="h-3 w-3" />;
                trendColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
              } else if (trend === 'Em queda') {
                trendIcon = <TrendingDown className="h-3 w-3" />;
                trendColor = "bg-rose-100 text-rose-700 border-rose-200";
              }

              return (
                <TableRow key={index} className="hover:bg-slate-50/50 transition-colors group">
                  <TableCell className="text-center font-medium text-muted-foreground">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-xs ${index < 3 ? 'bg-amber-100 text-amber-700 font-bold' : 'bg-slate-100'}`}>
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[200px] sm:max-w-[300px]" title={item.name}>{item.name || 'Não Identificado'}</span>
                      {index === 0 && (
                        <span className="text-[10px] text-amber-600 flex items-center gap-1 font-bold mt-0.5">
                          <Trophy className="h-3 w-3" /> Líder do período
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-slate-600">{formatNumber(item.total_orders)}</TableCell>
                  <TableCell className="text-right text-slate-600 font-medium">
                    {formatNumber(item.total_quantity)} <span className="text-xs text-muted-foreground font-normal">{volumeUnit}</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">
                    {formatCurrency(item.total_revenue)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`font-medium border ${trendColor} gap-1 pl-1 pr-2 py-0.5 h-6`}>
                      {trendIcon}
                      {trend}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const RankingPerformance = () => {
  const [activeTab, setActiveTab] = useState("supervisors");

  return (
    <Card className="col-span-1 shadow-sm border-slate-200 bg-white">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800">Ranking de Performance</CardTitle>
            <CardDescription>Classificação detalhada por volume e faturamento.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="supervisors" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <TabsList className="inline-flex w-full md:w-auto min-w-max h-9 bg-slate-100 p-1">
              <TabsTrigger value="supervisors" className="text-xs px-3">Supervisores</TabsTrigger>
              <TabsTrigger value="sellers" className="text-xs px-3">Vendedores</TabsTrigger>
              <TabsTrigger value="regions" className="text-xs px-3">Regiões</TabsTrigger>
              <TabsTrigger value="groups" className="text-xs px-3">Grupos</TabsTrigger>
              <TabsTrigger value="clients" className="text-xs px-3">Clientes</TabsTrigger>
              <TabsTrigger value="products" className="text-xs px-3">Produtos</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="supervisors">
            <RankingTabContent dimension="supervisors" label="Supervisores" />
          </TabsContent>
          <TabsContent value="sellers">
            <RankingTabContent dimension="sellers" label="Vendedores" />
          </TabsContent>
          <TabsContent value="regions">
            <RankingTabContent dimension="regions" label="Regiões" />
          </TabsContent>
          <TabsContent value="groups">
            <RankingTabContent dimension="groups" label="Grupos de Clientes" />
          </TabsContent>
          <TabsContent value="clients">
            <RankingTabContent dimension="clients" label="Clientes" />
          </TabsContent>
          <TabsContent value="products">
            <RankingTabContent dimension="products" label="Produtos" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RankingPerformance;