
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Gift, Wrench, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const KPICard = ({ title, value, icon: Icon, subtitle, className, iconClassName, loading }) => (
  <Card className={cn("overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow", className)}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      {Icon && (
        <div className={cn("p-2 rounded-full bg-slate-100", iconClassName)}>
          <Icon className="h-4 w-4" />
        </div>
      )}
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-8 w-32 mb-1" />
      ) : (
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      )}
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">
          {subtitle}
        </p>
      )}
    </CardContent>
  </Card>
);

const DailySalesKPIs = ({ kpiData, dailySales, isLoading }) => {
  // Safe access to metrics
  const grossRevenue = kpiData?.grossRevenue ?? 0;
  const netSales = kpiData?.netSales ?? 0;
  const totalBonification = kpiData?.totalBonification ?? 0;
  const totalEquipment = kpiData?.totalEquipment ?? 0;
  
  const activeDays = React.useMemo(() => {
      if (!dailySales || !Array.isArray(dailySales)) return 0;
      return dailySales.filter(d => d.gross > 0).length;
  }, [dailySales]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard
        title="Vendas Totais"
        value={formatCurrency(grossRevenue)}
        icon={DollarSign}
        subtitle="Faturamento Bruto"
        iconClassName="text-blue-600 bg-blue-100"
        loading={isLoading}
      />
      <KPICard
        title="Vendas Líquidas"
        value={formatCurrency(netSales)}
        icon={TrendingUp}
        subtitle="Excl. Bonif. e Equip."
        iconClassName="text-emerald-600 bg-emerald-100"
        loading={isLoading}
      />
      <KPICard
        title="Total Bonificado"
        value={formatCurrency(totalBonification)}
        icon={Gift}
        subtitle="Valor em Bonificações"
        iconClassName="text-purple-600 bg-purple-100"
        loading={isLoading}
      />
      <KPICard
        title="Total Equipamentos"
        value={formatCurrency(totalEquipment)}
        icon={Wrench}
        subtitle="Movimentação de Equip."
        iconClassName="text-orange-600 bg-orange-100"
        loading={isLoading}
      />
      <KPICard
        title="Dias Ativos"
        value={activeDays.toString()}
        icon={Calendar}
        subtitle="Dias com Vendas"
        iconClassName="text-slate-600 bg-slate-100"
        loading={isLoading}
      />
    </div>
  );
};

export default DailySalesKPIs;
