import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Archive, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificacaoDetalhesModal = ({ notificacao, isOpen, onClose, onMarcarLida, onArquivar }) => {
  const navigate = useNavigate();

  if (!notificacao) return null;

  const handleAction = () => {
    if (notificacao.chamado_id) {
      navigate(`/apoio/chamados/${notificacao.chamado_id}`);
    } else if (notificacao.evento_id) {
      navigate(`/apoio/agenda/eventos`); // Or specific event view
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="capitalize">{notificacao.tipo?.replace('_', ' ')}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notificacao.data_criacao), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          <DialogTitle>{notificacao.titulo}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notificacao.mensagem}</p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {!notificacao.lida && (
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => onMarcarLida(notificacao.id)}>
                <Check className="mr-2 h-4 w-4" /> Marcar como lida
              </Button>
            )}
            {!notificacao.arquivada && (
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => onArquivar(notificacao.id)}>
                <Archive className="mr-2 h-4 w-4" /> Arquivar
              </Button>
            )}
          </div>
          {(notificacao.chamado_id || notificacao.evento_id) && (
            <Button size="sm" onClick={handleAction} className="w-full sm:w-auto">
              <ExternalLink className="mr-2 h-4 w-4" /> Ver Detalhes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificacaoDetalhesModal;