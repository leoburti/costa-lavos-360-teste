
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useToast } from '@/components/ui/use-toast';
import { Construction, AlertTriangle, CheckCircle2 } from 'lucide-react';

const MaintenanceControlModal = ({ isOpen, onClose }) => {
  const { maintenanceStatus, toggleMaintenance } = useMaintenance();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [isActive, setIsActive] = useState(maintenanceStatus?.isActive || false);
  const [endTime, setEndTime] = useState(maintenanceStatus?.endTime ? new Date(maintenanceStatus.endTime).toISOString().slice(0, 16) : '');
  const [message, setMessage] = useState(maintenanceStatus?.message || '');

  // Sync state when modal opens or status changes
  React.useEffect(() => {
    if (isOpen) {
      setIsActive(maintenanceStatus?.isActive || false);
      setEndTime(maintenanceStatus?.endTime ? new Date(maintenanceStatus.endTime).toISOString().slice(0, 16) : '');
      setMessage(maintenanceStatus?.message || '');
    }
  }, [isOpen, maintenanceStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalEndTime = isActive && endTime ? new Date(endTime).toISOString() : null;
      const finalMessage = isActive ? message : null;

      const result = await toggleMaintenance(isActive, finalEndTime, finalMessage);

      if (result.success) {
        toast({
          title: isActive ? "Modo Manutenção Ativado" : "Modo Manutenção Desativado",
          description: isActive 
            ? `O sistema está bloqueado para usuários até ${new Date(endTime).toLocaleString()}.` 
            : "O sistema está acessível novamente.",
          variant: isActive ? "destructive" : "default",
        });
        onClose();
      } else {
        throw new Error("Falha ao atualizar status");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o modo de manutenção.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Construction className="h-6 w-6 text-amber-500" />
            Controle de Manutenção
          </DialogTitle>
          <DialogDescription>
            Ative o modo de manutenção para bloquear o acesso de usuários não administradores durante atualizações.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="space-y-0.5">
              <Label className="text-base">Status do Sistema</Label>
              <p className="text-sm text-muted-foreground">
                {isActive ? "Sistema em Manutenção (Bloqueado)" : "Sistema Operacional (Online)"}
              </p>
            </div>
            <Switch 
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {isActive && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label htmlFor="endTime">Previsão de Retorno</Label>
                <Input 
                  id="endTime"
                  type="datetime-local" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required={isActive}
                />
                <p className="text-xs text-muted-foreground">Data e hora estimada para finalização.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem para Usuários</Label>
                <Textarea 
                  id="message"
                  placeholder="Ex: Estamos realizando uma atualização programada..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-3 items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">
                  Enquanto ativo, apenas administradores (Nível 1) poderão acessar o sistema. Todos os outros usuários verão a tela de manutenção.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant={isActive ? "destructive" : "default"}
              disabled={loading}
              className="gap-2"
            >
              {loading ? "Salvando..." : (isActive ? "Confirmar Bloqueio" : "Liberar Sistema")}
              {isActive ? <Construction className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceControlModal;
