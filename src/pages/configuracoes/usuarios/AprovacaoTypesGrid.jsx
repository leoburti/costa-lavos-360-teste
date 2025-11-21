import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const approvalTypes = [
  { id: 'entrega', label: 'Aprovação de Entrega' },
  { id: 'troca', label: 'Aprovação de Troca' },
  { id: 'retirada', label: 'Aprovação de Retirada' },
  { id: 'chamados', label: 'Aprovação de Chamados' },
];

const AprovacaoTypesGrid = ({ selectedTypes, onTypeChange }) => {
  return (
    <Card>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvalTypes.map((type) => (
          <div key={type.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
            <Checkbox
              id={`aprovacao-${type.id}`}
              checked={selectedTypes?.[type.id] || false}
              onCheckedChange={(checked) => onTypeChange(type.id, checked)}
            />
            <Label htmlFor={`aprovacao-${type.id}`} className="font-normal cursor-pointer">
              {type.label}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AprovacaoTypesGrid;