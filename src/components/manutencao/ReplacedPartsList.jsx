import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ReplacedPartsList = ({ parts, setParts }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPart, setCurrentPart] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [formData, setFormData] = useState({ nome_peca: '', quantidade: 1, numero_serie: '', custo_unitario: '', observacao: '' });
  const { toast } = useToast();

  const handleOpenForm = (part = null, index = null) => {
    setCurrentPart(part);
    setCurrentIndex(index);
    setFormData(part ? { ...part } : { nome_peca: '', quantidade: 1, numero_serie: '', custo_unitario: '', observacao: '' });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentPart(null);
    setCurrentIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_peca || !formData.quantidade) {
      toast({ variant: 'destructive', title: 'Nome da peça e quantidade são obrigatórios.' });
      return;
    }

    const newPart = { ...formData, quantidade: Number(formData.quantidade), custo_unitario: formData.custo_unitario ? Number(formData.custo_unitario) : null };

    if (currentIndex !== null) {
      const updatedParts = [...parts];
      updatedParts[currentIndex] = newPart;
      setParts(updatedParts);
    } else {
      setParts([...parts, newPart]);
    }
    handleCloseForm();
  };

  const handleDelete = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const totalCost = parts.reduce((acc, part) => acc + (part.custo_unitario || 0) * part.quantidade, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Peças Substituídas</h3>
        <Button variant="outline" size="sm" onClick={() => handleOpenForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Peça
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Peça</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Custo Unit.</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Nenhuma peça adicionada.</TableCell>
              </TableRow>
            ) : (
              parts.map((part, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{part.nome_peca}</TableCell>
                  <TableCell>{part.quantidade}</TableCell>
                  <TableCell>{formatCurrency(part.custo_unitario)}</TableCell>
                  <TableCell>{formatCurrency((part.custo_unitario || 0) * part.quantidade)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(part, index)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalCost > 0 && <p className="text-right font-medium">Custo Total das Peças: {formatCurrency(totalCost)}</p>}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentPart ? 'Editar Peça' : 'Adicionar Peça'}</DialogTitle>
            <DialogDescription>Preencha os detalhes da peça substituída.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome_peca">Nome da Peça *</Label>
              <Input id="nome_peca" value={formData.nome_peca} onChange={(e) => setFormData({ ...formData, nome_peca: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input id="quantidade" type="number" min="1" value={formData.quantidade} onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo_unitario">Custo Unitário (R$)</Label>
                <Input id="custo_unitario" type="number" step="0.01" value={formData.custo_unitario} onChange={(e) => setFormData({ ...formData, custo_unitario: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero_serie">Número de Série</Label>
              <Input id="numero_serie" value={formData.numero_serie} onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea id="observacao" value={formData.observacao} onChange={(e) => setFormData({ ...formData, observacao: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReplacedPartsList;