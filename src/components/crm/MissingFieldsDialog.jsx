import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const MissingFieldsDialog = ({ isOpen, onOpenChange, missingFields }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="text-destructive" />
            <span>Campos Obrigatórios Pendentes</span>
          </DialogTitle>
          <DialogDescription>
            Para avançar para a próxima etapa, todos os campos da qualificação devem ser preenchidos.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-semibold mb-2">Itens faltando:</p>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {missingFields.map(field => <li key={field}>{field}</li>)}
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Entendido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MissingFieldsDialog;