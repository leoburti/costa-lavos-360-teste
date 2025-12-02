import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function CrmKanban({ items }) {
  // Simplified stages for now - this would ideally come from config
  const stages = ['Prospecto', 'Qualificação', 'Proposta', 'Negociação', 'Fechado'];
  
  const groupedByStage = stages.reduce((acc, stage) => {
    acc[stage] = items.filter(item => item.stage === stage);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => (
        <div key={stage} className="bg-slate-50 rounded-lg p-4 min-w-[200px]">
          <h3 className="font-semibold mb-4 capitalize">{stage}</h3>
          <div className="space-y-2">
            {groupedByStage[stage]?.map((item) => (
              <Card key={item.oportunidade_id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-4 p-3">
                  <p className="font-medium text-sm line-clamp-2">{item.oportunidade_name}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{item.cliente_name}</p>
                  <p className="text-sm font-bold text-blue-600 mt-2">R$ {Number(item.value).toLocaleString('pt-BR')}</p>
                </CardContent>
              </Card>
            ))}
            {(!groupedByStage[stage] || groupedByStage[stage].length === 0) && (
              <p className="text-xs text-gray-400 text-center py-4">Vazio</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}