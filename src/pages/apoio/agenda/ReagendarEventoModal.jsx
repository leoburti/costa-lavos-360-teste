import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

const ReagendarEventoModal = ({ eventId, onReschedule }) => {
  const { toast } = useToast();

  const handleReschedule = () => {
    // Lógica de reagendamento aqui
    toast({ title: 'Evento reagendado com sucesso!', description: '🚧 Funcionalidade em desenvolvimento.' });
    if (onReschedule) onReschedule();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Reagendar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reagendar Evento</DialogTitle>
          <DialogDescription>Selecione uma nova data e hora para o evento.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nova_data">Nova Data</Label>
              <Input id="nova_data" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nova_hora_inicio">Nova Hora Início</Label>
              <Input id="nova_hora_inicio" type="time" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nova_hora_fim">Nova Hora Fim</Label>
            <Input id="nova_hora_fim" type="time" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" placeholder="Motivo do reagendamento ou novas instruções..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button onClick={handleReschedule}>Reagendar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReagendarEventoModal;