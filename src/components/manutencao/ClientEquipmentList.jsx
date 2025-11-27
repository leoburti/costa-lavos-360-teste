import React from 'react';
import { useClientEquipments } from '@/hooks/useClientEquipments';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Database, Monitor, CalendarDays, Wrench } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ClientEquipmentList = ({ clientId }) => {
  const { equipments, isLoading } = useClientEquipments(clientId);

  if (!clientId) return null;

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground border rounded-lg bg-gray-50">
        Carregando inventário do cliente...
      </div>
    );
  }

  if (equipments.length === 0) {
    return (
      <div className="p-6 text-center border rounded-lg bg-gray-50/50">
        <Database className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-500">Este cliente não possui equipamentos registrados no sistema novo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-white border rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Monitor className="h-4 w-4 text-blue-600" />
          Inventário Registrado ({equipments.length})
        </h4>
      </div>
      
      <ScrollArea className="h-[200px] pr-4">
        <div className="space-y-2">
          {equipments.map((eq) => (
            <div 
              key={eq.id} 
              className="p-3 border rounded-md hover:bg-gray-50 transition-colors flex justify-between items-start group"
            >
              <div className="space-y-1">
                <div className="font-medium text-sm text-gray-900">{eq.nome}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded">Mod: {eq.modelo || 'N/A'}</span>
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded">S/N: {eq.serie || 'N/A'}</span>
                </div>
                {eq.localizacao && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Wrench className="h-3 w-3" /> Local: {eq.localizacao}
                  </div>
                )}
              </div>
              <div className="text-right space-y-1">
                <Badge variant={eq.status === 'ativo' ? 'success' : 'secondary'} className="text-[10px]">
                  {eq.status}
                </Badge>
                {eq.data_instalacao && (
                  <div className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(eq.data_instalacao)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ClientEquipmentList;