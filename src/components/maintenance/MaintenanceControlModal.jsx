import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Construction, Power, PowerOff, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MaintenanceControlModal = ({ isOpen, onOpenChange }) => {
  const { maintenanceStatus, loading, toggleMaintenance, refreshStatus } = useMaintenance();
  const { toast } = useToast();

  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
    }
  }, [isOpen, refreshStatus]);

  useEffect(() => {
    if (!loading && maintenanceStatus) {
      setIsActive(maintenanceStatus.isActive);
      setMessage(maintenanceStatus.message || 'Estamos realizando melhorias. O sistema voltará em breve.');
      if (maintenanceStatus.endTime) {
        try {
          const d = new Date(maintenanceStatus.endTime);
          setEndDate(format(d, 'yyyy-MM-dd'));
          setEndTime(format(d, 'HH:mm'));
        } catch (e) {
          console.error("Invalid date from server for maintenance end time:", maintenanceStatus.endTime)
          setEndDate('');
          setEndTime('');
        }
      } else {
        setEndDate('');
        setEndTime('');
      }
    }
  }, [maintenanceStatus, loading]);

  const handleSave = async () => {
    let combinedDateTime = null;
    if (endDate && endTime) {
      try {
        combinedDateTime = new Date(`${endDate}T${endTime}:00`).toISOString();
      } catch (e) {
        toast({
            title: 'Data inválida',
            description: 'A data ou hora de retorno fornecida não é válida.',
            variant: 'destructive',
        });
        return;
      }
    }

    const { success, error } = await toggleMaintenance(isActive, combinedDateTime, message);

    if (success) {
      toast({
        title: 'Modo de Manutenção Atualizado',
        description: `O sistema está agora ${isActive ? 'EM' : 'FORA DE'} manutenção.`,
        variant: isActive ? 'destructive' : 'success',
      });
      onOpenChange(false);
    } else {
      toast({
        title: 'Erro ao Salvar',
        description: error?.message || 'Não foi possível alterar o modo de manutenção.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5" /> Controle de Manutenção
          </DialogTitle>
          <DialogDescription>
            Ative ou desative o modo de manutenção para todos os usuários, exceto administradores.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <Card className={isActive ? 'border-destructive bg-destructive/10' : 'border-emerald-500 bg-emerald-500/10'}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance-mode" className="text-lg font-semibold">
                  Modo Manutenção
                </Label>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${isActive ? 'text-destructive' : 'text-emerald-500'}`}>
                    {isActive ? 'ATIVADO' : 'DESATIVADO'}
                  </span>
                  <Switch
                    id="maintenance-mode"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="data-[state=checked]:bg-destructive data-[state=unchecked]:bg-emerald-500"
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem de Manutenção</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Estamos implementando novas funcionalidades..."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="end-date">Data de Retorno</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">Hora de Retorno</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className={isActive ? 'bg-destructive hover:bg-destructive/90' : 'bg-emerald-600 hover:bg-emerald-600/90'}>
            {loading ? 'Salvando...' : (
              <>
                {isActive ? <Power className="mr-2 h-4 w-4" /> : <PowerOff className="mr-2 h-4 w-4" />}
                {isActive ? 'Ativar Manutenção' : 'Desativar Manutenção'}
                <Save className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceControlModal;