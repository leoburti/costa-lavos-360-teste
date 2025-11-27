
import React, { useMemo } from 'react';
import MetricCard from '@/components/MetricCard';
import { DollarSign, Gift, Wrench, Calendar, TrendingUp } from 'lucide-react';

const DailySalesKPIs = ({ data = [] }) => {
  const kpis = useMemo(() => {
    let totalSales = 0;
    let totalBonification = 0;
    let totalEquipment = 0;
    let activeDays = 0;

    if (Array.isArray(data)) {
        data.forEach(day => {
            if (day && day.items && day.items.length > 0) {
                let dayHasSales = false;
                day.items.forEach(item => {
                    const itemTotal = (item.totalValue || 0);
                    const itemBonif = (item.bonification || 0);
                    const itemEquip = (item.equipment || 0);
                    
                    if (itemTotal > 0 || itemBonif > 0 || itemEquip > 0) {
                        dayHasSales = true;
                    }

                    totalSales += itemTotal;
                    totalBonification += itemBonif;
                    totalEquipment += itemEquip;
                });
                if (dayHasSales) activeDays++;
            }
        });
    }

    const netSales = totalSales - totalBonification - totalEquipment;

    return {
        totalSales,
        netSales,
        totalBonification,
        totalEquipment,
        activeDays
    };
  }, [data]);

  const formatCurrency = (value) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="Vendas Totais"
        value={formatCurrency(kpis.totalSales)}
        icon={DollarSign}
        subtitle="Faturamento Bruto"
      />
      <MetricCard
        title="Vendas Líquidas"
        value={formatCurrency(kpis.netSales)}
        icon={TrendingUp}
        subtitle="Excl. Bonif. e Equip."
      />
      <MetricCard
        title="Total Bonificado"
        value={formatCurrency(kpis.totalBonification)}
        icon={Gift}
        subtitle="Valor em Bonificações"
      />
      <MetricCard
        title="Total Equipamentos"
        value={formatCurrency(kpis.totalEquipment)}
        icon={Wrench}
        subtitle="Movimentação de Equip."
      />
      <MetricCard
        title="Dias Ativos"
        value={kpis.activeDays.toString()}
        icon={Calendar}
        subtitle="Dias com Vendas"
      />
    </div>
  );
};

export default DailySalesKPIs;
