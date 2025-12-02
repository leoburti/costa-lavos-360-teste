import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

export function CrmConfigForm({ config, onSave }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Estágios do Pipeline</h3>
          <div className="space-y-2">
            {config?.stages?.map((stage, index) => (
              <div key={index} className="flex gap-2">
                <Input defaultValue={stage} />
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Estágio
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Campos Personalizados</h3>
          <p className="text-sm text-gray-500">Configuração de campos adicionais para clientes e oportunidades.</p>
          {/* Placeholder for custom fields UI */}
          <div className="p-4 border border-dashed rounded-lg text-center text-gray-400">
            Editor de campos em desenvolvimento
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onSave}>Salvar Configuração</Button>
        </div>
      </CardContent>
    </Card>
  );
}