import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, CheckCircle, Clock, Users } from 'lucide-react';

const KPICard = ({ title, value, subtext, icon: Icon, colorClass, bgClass }) => (
  <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-200">
    <CardContent className="p-5 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-full ${bgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </CardContent>
  </Card>
);

export default function ApoioKPIs({ data }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard 
        title="Total de Chamados" 
        value={data.total_chamados} 
        subtext="No período selecionado"
        icon={Ticket}
        colorClass="text-blue-600"
        bgClass="bg-blue-100"
      />
      <KPICard 
        title="Taxa de Conclusão" 
        value={`${Number(data.taxa_conclusao).toFixed(1)}%`} 
        subtext={`${data.chamados_concluidos} concluídos`}
        icon={CheckCircle}
        colorClass="text-green-600"
        bgClass="bg-green-100"
      />
      <KPICard 
        title="Tempo Médio (TMA)" 
        value={`${Number(data.tempo_medio_minutos).toFixed(0)} min`} 
        subtext="Por chamado concluído"
        icon={Clock}
        colorClass="text-orange-600"
        bgClass="bg-orange-100"
      />
      <KPICard 
        title="Técnicos Ativos" 
        value={data.tecnicos_ativos} 
        subtext="Com chamados no período"
        icon={Users}
        colorClass="text-purple-600"
        bgClass="bg-purple-100"
      />
    </div>
  );
}