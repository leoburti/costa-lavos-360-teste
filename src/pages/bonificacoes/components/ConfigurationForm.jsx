import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export function ConfigurationForm({ config, onSave }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Percentual Base (%)</Label>
            <Input type="number" defaultValue={config?.base_percentage} />
          </div>
          <div className="space-y-2">
            <Label>Percentual Máximo (%)</Label>
            <Input type="number" defaultValue={config?.max_percentage} />
          </div>
          <div className="space-y-2">
            <Label>Período de Cálculo</Label>
            <Input defaultValue={config?.calculation_period} />
          </div>
          <div className="space-y-2">
            <Label>Data de Pagamento</Label>
            <Input defaultValue={config?.payment_date} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onSave}>Salvar Configuração</Button>
        </div>
      </CardContent>
    </Card>
  );
}