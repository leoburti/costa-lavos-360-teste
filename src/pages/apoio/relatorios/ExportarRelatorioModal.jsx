import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const ExportarRelatorioModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();

  const handleExport = () => {
    toast({ title: "Funcionalidade em desenvolvimento", description: "Exportação de relatórios ainda não implementada." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Relatório</DialogTitle>
          <DialogDescription>Selecione o formato e o conteúdo para exportação.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Formato</Label>
            <Select defaultValue="pdf">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Conteúdo a ser incluído</Label>
            <div className="space-y-2 pl-2">
              <div className="flex items-center space-x-2"><Checkbox id="inc-resumo" defaultChecked /><Label htmlFor="inc-resumo">Resumo</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="inc-graficos" defaultChecked /><Label htmlFor="inc-graficos">Gráficos</Label></div>
              <div className="flex items-center space-x-2"><Checkbox id="inc-tabelas" defaultChecked /><Label htmlFor="inc-tabelas">Tabelas Detalhadas</Label></div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleExport}>Exportar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportarRelatorioModal;