import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const severidadeCores = {
  baixa: 'bg-blue-500',
  media: 'bg-yellow-500',
  alta: 'bg-orange-500',
  critica: 'bg-red-500',
};

const AlertaDetalhesModal = ({ alerta, open, onOpenChange, onResolver }) => {
  const { toast } = useToast();

  if (!alerta) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes do Alerta
            <Badge className={severidadeCores[alerta.severidade]}>{alerta.severidade}</Badge>
          </DialogTitle>
          <DialogDescription>{alerta.titulo}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <p className="text-sm font-semibold">Descrição</p>
            <p className="text-muted-foreground">{alerta.descricao}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Data de Criação</p>
            <p className="text-muted-foreground">{new Date(alerta.data_criacao).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Dados Relacionados</p>
            <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
              {JSON.stringify(alerta.dados_relacionados, null, 2)}
            </pre>
          </div>
        </div>
        <DialogFooter>
          {!alerta.resolvido && (
            <Button onClick={() => onResolver(alerta.id)}>Marcar como Resolvido</Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertaDetalhesModal;