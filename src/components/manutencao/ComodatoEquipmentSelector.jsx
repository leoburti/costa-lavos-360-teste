import React, { useEffect } from 'react';
import { useClientEquipments } from '@/hooks/useClientEquipments';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Database, Wrench, CalendarDays, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ComodatoEquipmentSelector = ({ clientId, selectedEquipments, onSelectionChange }) => {
  const { equipments, isLoading, isError } = useClientEquipments(clientId);

  useEffect(() => {
    console.log('--- ComodatoEquipmentSelector Debug ---');
    console.log('Client ID:', clientId);
    console.log('Raw Equipments Data:', equipments);
    console.log('Is Loading:', isLoading);
    console.log('Is Error:', isError);
  }, [clientId, equipments, isLoading, isError]);

  // Filter only Comodato items (RPC now ensures 'comodato' is set for ERP items)
  const comodatoEquipments = equipments.filter(eq => {
    const isComodato = eq.tipo_propriedade === 'comodato' || !eq.tipo_propriedade;
    if (!isComodato) console.log('Filtered out equipment (not comodato):', eq);
    return isComodato;
  });

  const handleToggle = (equipment) => {
    const isSelected = selectedEquipments.some(e => e.id === equipment.id);
    let newSelection;
    if (isSelected) {
      newSelection = selectedEquipments.filter(e => e.id !== equipment.id);
    } else {
      newSelection = [...selectedEquipments, { ...equipment, source: 'comodato' }];
    }
    onSelectionChange(newSelection);
  };

  if (!clientId) {
    return (
      <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50/30">
        <p className="text-sm text-muted-foreground">Selecione um cliente primeiro para visualizar os equipamentos em comodato.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground animate-pulse">Carregando inventário...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500 border border-red-100 rounded-md bg-red-50">
        <p className="text-sm flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Erro ao carregar equipamentos. Tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white border rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-600" />
          Equipamentos em Comodato ({comodatoEquipments.length})
        </h4>
        <Badge variant="secondary" className="font-normal">
          {selectedEquipments.length} selecionado(s)
        </Badge>
      </div>

      <ScrollArea className="h-[250px] pr-4">
        <div className="space-y-2">
          {comodatoEquipments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm font-medium">Nenhum equipamento em comodato encontrado.</p>
              <p className="text-xs text-gray-400 mt-1">Verifique se o cliente possui código vinculado no ERP.</p>
            </div>
          ) : (
            comodatoEquipments.map((equip, idx) => {
              const isSelected = selectedEquipments.some(e => e.id === equip.id);
              return (
                <div 
                  key={equip.id || `equip-${idx}`} 
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' 
                      : 'border-gray-100 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggle(equip)}
                >
                  <Checkbox 
                    id={`comodato-${equip.id}`} 
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(equip)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none w-full">
                    <label
                      htmlFor={`comodato-${equip.id}`}
                      className="text-sm font-semibold text-gray-900 cursor-pointer"
                    >
                      {equip.nome || "Equipamento Sem Nome"}
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {equip.modelo && (
                        <span className="bg-white border px-1.5 py-0.5 rounded">Mod: {equip.modelo}</span>
                      )}
                      {equip.serie && (
                        <span className="bg-white border px-1.5 py-0.5 rounded">S/N: {equip.serie}</span>
                      )}
                      {equip.localizacao && (
                        <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                          <Wrench className="h-3 w-3" /> {equip.localizacao}
                        </span>
                      )}
                      {equip.source === 'erp' && (
                        <Badge variant="outline" className="text-[10px] h-5 border-blue-200 text-blue-700 bg-blue-50">
                          ERP
                        </Badge>
                      )}
                    </div>
                    {equip.data_instalacao && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                            <CalendarDays className="h-3 w-3" />
                            Instalado em: {formatDate(equip.data_instalacao)}
                        </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ComodatoEquipmentSelector;