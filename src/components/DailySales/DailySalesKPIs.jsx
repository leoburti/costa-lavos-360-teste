import React from 'react';
import MetricCard from '@/components/MetricCard';
import { DollarSign, Gift, Wrench, Calendar, TrendingUp } from 'lucide-react';

const DailySalesKPIs = ({ kpiData }) => {
  const kpis = {
    totalSales: kpiData?.totalRevenue || 0,
    netSales: kpiData?.netSales || kpiData?.totalRevenue || 0, // Fallback to totalRevenue
    totalBonification: kpiData?.totalBonification || 0,
    totalEquipment: kpiData?.totalEquipment || 0,
    activeDays: kpiData?.activeDays || 0,
  };

  const formatCurrency = (value) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="Vendas Totais"
        value={formatCurrency(kpis.totalSales)}
        icon={DollarSign}
        subtitle="Soma de todas as vendas"
      />
      <MetricCard
        title="Vendas Líquidas"
        value={formatCurrency(kpis.netSales)}
        icon={TrendingUp}
        subtitle="Vendas sem bonificação/equip."
      />
      <MetricCard
        title="Total Bonificado"
        value={formatCurrency(kpis.totalBonification)}
        icon={Gift}
        subtitle="Valor total em bonificações"
      />
      <MetricCard
        title="Total Equipamentos"
        value={formatCurrency(kpis.totalEquipment)}
        icon={Wrench}
        subtitle="Valor total em equipamentos"
      />
      <MetricCard
        title="Dias Ativos"
        value={kpis.activeDays.toString()}
        icon={Calendar}
        subtitle="Dias com registro de vendas"
      />
    </div>
  );
};

export default DailySalesKPIs;