import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export function BonificacoesForm({ bonificacao, onSave }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input defaultValue={bonificacao?.bonificacao_name} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Input defaultValue={bonificacao?.type} />
          </div>
          <div className="space-y-2">
            <Label>Percentual (%)</Label>
            <Input type="number" defaultValue={bonificacao?.percentage} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Input defaultValue={bonificacao?.status} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onSave}>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  );
}