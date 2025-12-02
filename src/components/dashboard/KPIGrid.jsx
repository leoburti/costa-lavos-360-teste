import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, TrendingUp, Package, Users, Target, Calculator, 
  Award, Activity, Gift, ShoppingBag, Percent, BarChart3 
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { extractValue, safeNumber } from '@/utils/dataValidator';

const KPISingleCard = ({ title, value, icon: Icon, colorClass, trend, trendValue, subText, isLoading }) => (
  <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative group">
    <CardContent className="p-4 flex flex-col justify-between h-full relative z-10">
      {isLoading ? (
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div className={cn("p-2 rounded-lg transition-colors duration-300 group-hover:scale-110", colorClass)}>
              <Icon className="h-5 w-5" />
            </div>
            {trend && (
              <div className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1", 
                trend === 'up' ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
              )}>
                {trend === 'up' ? '↗' : '↘'} {extractValue(trendValue)}
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{extractValue(title)}</p>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 tracking-tight leading-tight truncate" title={typeof value === 'string' ? value : ''}>
                {extractValue(value)}
            </h3>
            {subText && <p className="text-[10px] text-slate-400 mt-1 truncate">{extractValue(subText)}</p>}
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

const KPIGrid = ({ kpis, loading }) => {
  // Fallback defaults
  const safeKpis = {
    totalRevenue: safeNumber(kpis?.totalRevenue),
    yoyGrowth: safeNumber(kpis?.yoyGrowth),
    averageTicket: safeNumber(kpis?.averageTicket),
    salesCount: safeNumber(kpis?.salesCount),
    conversionRate: safeNumber(kpis?.conversionRate),
    estimatedMargin: safeNumber(kpis?.estimatedMargin),
    roiBonification: safeNumber(kpis?.roiBonification),
    efficiencyGlobal: safeNumber(kpis?.efficiencyGlobal),
    activeClients: safeNumber(kpis?.activeClients),
    totalEquipmentQty: safeNumber(kpis?.totalEquipmentQty),
    totalBonification: safeNumber(kpis?.totalBonification),
    projectedRevenue: safeNumber(kpis?.projectedRevenue)
  };

  const items = [
    {
      title: "Vendas Totais",
      value: formatCurrency(safeKpis.totalRevenue),
      icon: DollarSign,
      colorClass: "bg-blue-100 text-blue-600",
      subText: 'Receita líquida'
    },
    {
      title: "Crescimento YoY",
      value: formatPercentage(safeKpis.yoyGrowth),
      icon: TrendingUp,
      colorClass: safeKpis.yoyGrowth >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600",
      trend: safeKpis.yoyGrowth >= 0 ? 'up' : 'down',
      trendValue: `${Math.abs(safeKpis.yoyGrowth).toFixed(1)}%`,
      subText: 'vs. ano anterior'
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(safeKpis.averageTicket),
      icon: Calculator,
      colorClass: "bg-amber-100 text-amber-600",
      subText: 'por pedido'
    },
    {
      title: "Pedidos",
      value: formatNumber(safeKpis.salesCount),
      icon: Package,
      colorClass: "bg-indigo-100 text-indigo-600",
      subText: 'volume total'
    },
    {
      title: "Conversão (Positivação)",
      value: formatPercentage(safeKpis.conversionRate),
      icon: Target,
      colorClass: "bg-purple-100 text-purple-600",
      subText: '% clientes ativos'
    },
    {
      title: "Margem Estimada",
      value: formatCurrency(safeKpis.estimatedMargin),
      icon: BarChart3,
      colorClass: "bg-teal-100 text-teal-600",
      subText: '~35% da receita'
    },
    {
      title: "ROI Bonif.",
      value: `${safeKpis.roiBonification.toFixed(1)}x`,
      icon: Percent,
      colorClass: "bg-orange-100 text-orange-600",
      subText: 'retorno sobre bonif.'
    },
    {
      title: "Eficiência Global",
      value: formatPercentage(safeKpis.efficiencyGlobal),
      icon: Activity,
      colorClass: safeKpis.efficiencyGlobal >= 100 ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600",
      subText: 'vs. meta estimada'
    },
    {
      title: "Clientes Ativos",
      value: formatNumber(safeKpis.activeClients),
      icon: Users,
      colorClass: "bg-blue-100 text-blue-600",
      subText: 'com compra no período'
    },
    {
      title: "Equipamento Entregue",
      value: formatNumber(safeKpis.totalEquipmentQty),
      icon: ShoppingBag,
      colorClass: "bg-cyan-100 text-cyan-600",
      subText: 'unidades'
    },
    {
      title: "Bonificação",
      value: formatCurrency(safeKpis.totalBonification),
      icon: Gift,
      colorClass: "bg-pink-100 text-pink-600",
      subText: 'valor concedido'
    },
    {
      title: "Projeção",
      value: formatCurrency(safeKpis.projectedRevenue),
      icon: Award,
      colorClass: "bg-slate-100 text-slate-600",
      subText: 'fechamento estimado'
    }
  ];

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">
            <Activity className="h-4 w-4" /> INDICADORES DE PERFORMANCE (KPIS)
        </div>
        {/* 2 rows x 6 columns on large screens */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((item, idx) => (
              <KPISingleCard key={idx} {...item} isLoading={loading} />
          ))}
        </div>
    </div>
  );
};

export default KPIGrid;