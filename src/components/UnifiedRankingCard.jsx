import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : 'R$ 0';

const PerformanceItem = ({ name, value, icon: Icon, color, subtitle }) => (
  <div className="flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="text-white h-5 w-5" />
    </div>
    <div>
      <p className="text-sm font-semibold text-foreground truncate">{name}</p>
      <p className="text-lg font-bold">{formatCurrency(value)}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
);

const UnifiedRankingCard = ({ title, description, topPerformer, bottomPerformer, chartId }) => {
  return (
    <Card className="flex flex-col" id={chartId}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-around space-y-6">
        {topPerformer ? (
          <PerformanceItem
            name={topPerformer.name}
            value={topPerformer.total_revenue}
            icon={TrendingUp}
            color="bg-emerald-500"
            subtitle="Melhor Performance"
          />
        ) : (
          <p className="text-muted-foreground text-sm text-center">Não há dados para o melhor performer.</p>
        )}
        
        <div className="border-t border-dashed"></div>

        {bottomPerformer ? (
          <PerformanceItem
            name={bottomPerformer.name}
            value={bottomPerformer.total_revenue}
            icon={TrendingDown}
            color="bg-red-500"
            subtitle="Pior Performance"
          />
        ) : (
          <p className="text-muted-foreground text-sm text-center">Não há dados para o pior performer.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedRankingCard;