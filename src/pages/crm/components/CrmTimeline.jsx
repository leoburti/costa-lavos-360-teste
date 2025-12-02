import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function CrmTimeline({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.atividade_id} className="flex gap-4">
          <div className="flex flex-col items-center pt-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            {index < items.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
          </div>
          <Card className="flex-1">
            <CardContent className="pt-4 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-2 font-medium">{item.cliente_name}</p>
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(item.activity_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}