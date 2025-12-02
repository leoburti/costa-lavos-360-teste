import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * AccessibleDialog
 * Wrapper que garante acessibilidade em todos os dialogs
 * 
 * WCAG 2.1 Compliance:
 * - Sempre inclui DialogDescription
 * - Sempre inclui DialogTitle
 * - Sempre inclui DialogHeader
 * - Suporta aria-describedby implicitamente
 * 
 * @param {Object} props
 * @param {string} props.title - Título do dialog (obrigatório)
 * @param {string} props.description - Descrição do dialog (obrigatório)
 * @param {React.ReactNode} props.children - Conteúdo do dialog
 * @param {React.ReactNode} [props.trigger] - Elemento que abre o dialog
 * @param {boolean} [props.open] - Estado controlado (opcional)
 * @param {(open: boolean) => void} [props.onOpenChange] - Callback quando abre/fecha (opcional)
 * @param {string} [props.className] - Classes CSS adicionais (opcional)
 */
export function AccessibleDialog({
  title,
  description,
  children,
  trigger,
  open,
  onOpenChange,
  className,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default AccessibleDialog;