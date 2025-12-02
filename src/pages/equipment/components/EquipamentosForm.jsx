import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export function EquipamentosForm({ equipment, onSave }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome do Equipamento</Label>
            <Input defaultValue={equipment?.name} />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Input defaultValue={equipment?.model} />
          </div>
          <div className="space-y-2">
            <Label>Número de Série</Label>
            <Input defaultValue={equipment?.serial} />
          </div>
          <div className="space-y-2">
            <Label>Localização</Label>
            <Input defaultValue={equipment?.location} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onSave}>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  );
}