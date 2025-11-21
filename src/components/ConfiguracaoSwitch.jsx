import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const ConfiguracaoSwitch = ({ label, descricao, checked, onCheckedChange, disabled }) => {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label className="text-base font-medium">{label}</Label>
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
};

export default ConfiguracaoSwitch;