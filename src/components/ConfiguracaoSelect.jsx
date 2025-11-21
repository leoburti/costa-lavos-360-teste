import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ConfiguracaoSelect = ({ label, descricao, opcoes, valor, onValueChange, disabled, placeholder }) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={valor} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {opcoes.map(opcao => (
            <SelectItem key={opcao.value} value={opcao.value}>{opcao.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {descricao && <p className="text-xs text-muted-foreground">{descricao}</p>}
    </div>
  );
};

export default ConfiguracaoSelect;