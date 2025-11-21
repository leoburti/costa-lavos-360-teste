import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash2, CheckCircle, XCircle, CalendarClock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const EventoDetalhesModal = ({ event, isOpen, onClose, onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('delete_evento_completo', { p_evento_id: event.id });
      if (error) throw error;
      
      toast({ title: "Evento excluído", description: "O evento foi removido com sucesso." });
      onUpdate?.();
      onClose();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o evento." });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_agenda_eventos').update({ status: newStatus }).eq('id', event.id);
      if (error) throw error;
      
      toast({ title: "Status atualizado", description: `O evento foi marcado como ${newStatus}.` });
      onUpdate?.();
      onClose();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o status." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {event.titulo}
            <Badge variant={event.status === 'concluido' ? 'success' : 'outline'}>{event.status}</Badge>
          </DialogTitle>
          <DialogDescription>Detalhes do evento agendado.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label className="text-muted-foreground text-xs">Data</Label>
                <p className="font-medium">{format(new Date(event.data_evento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            </div>
            <div>
                <Label className="text-muted-foreground text-xs">Horário</Label>
                <p className="font-medium">{event.hora_inicio.slice(0,5)} - {event.hora_fim.slice(0,5)}</p>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">Tipo</Label>
            <p className="capitalize">{event.tipo_evento?.replace('_', ' ')}</p>
          </div>

          {event.local && (
            <div>
              <Label className="text-muted-foreground text-xs">Local</Label>
              <p>{event.local}</p>
            </div>
          )}

          {event.descricao && (
            <div className="bg-muted/30 p-3 rounded-md">
              <Label className="text-muted-foreground text-xs mb-1 block">Descrição</Label>
              <p className="text-sm whitespace-pre-wrap">{event.descricao}</p>
            </div>
          )}

          {event.is_recorrente && (
             <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                <CalendarClock className="h-4 w-4" />
                <span>Evento recorrente</span>
             </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex-1 flex gap-2">
                {event.status !== 'concluido' && (
                    <Button variant="outline" size="sm" className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusChange('concluido')} disabled={loading}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Concluir
                    </Button>
                )}
                {event.status !== 'cancelado' && (
                    <Button variant="outline" size="sm" className="flex-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => handleStatusChange('cancelado')} disabled={loading}>
                        <XCircle className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                )}
            </div>
            
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={loading}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Evento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento da sua agenda.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventoDetalhesModal;