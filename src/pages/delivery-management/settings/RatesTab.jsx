
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, DollarSign } from 'lucide-react';

const RatesTab = ({ data, onChange }) => {
  const rates = Array.isArray(data.rates) ? data.rates : [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ region: '', minKm: 0, maxKm: 0, basePrice: 0, pricePerKm: 0 });

  const handleOpenModal = (rate = null) => {
    if (rate) {
      setFormData(rate);
      setEditingId(rate.id);
    } else {
      setFormData({ region: '', minKm: 0, maxKm: 0, basePrice: 0, pricePerKm: 0 });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    let newRates;
    if (editingId) {
      newRates = rates.map(r => r.id === editingId ? { ...formData, id: editingId } : r);
    } else {
      newRates = [...rates, { ...formData, id: Date.now() }]; // Simple ID generation
    }
    onChange({ ...data, rates: newRates });
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    onChange({ ...data, rates: rates.filter(r => r.id !== id) });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tarifas de Entrega</CardTitle>
          <CardDescription>Configure os custos baseados em região e distância.</CardDescription>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-[#6B2C2C] hover:bg-[#5a2323] text-white">
          <Plus className="mr-2 h-4 w-4" /> Nova Tarifa
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Região / Zona</TableHead>
              <TableHead>Distância Mín (km)</TableHead>
              <TableHead>Distância Máx (km)</TableHead>
              <TableHead>Preço Base</TableHead>
              <TableHead>Preço / km Adicional</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhuma tarifa configurada.
                </TableCell>
              </TableRow>
            ) : (
              rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium">{rate.region}</TableCell>
                  <TableCell>{rate.minKm} km</TableCell>
                  <TableCell>{rate.maxKm} km</TableCell>
                  <TableCell>R$ {Number(rate.basePrice).toFixed(2)}</TableCell>
                  <TableCell>R$ {Number(rate.pricePerKm).toFixed(2)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(rate)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(rate.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Tarifa' : 'Nova Tarifa'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Região</Label>
                <Input className="col-span-3" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Dist. Mín (km)</Label>
                <Input type="number" className="col-span-3" value={formData.minKm} onChange={e => setFormData({...formData, minKm: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Dist. Máx (km)</Label>
                <Input type="number" className="col-span-3" value={formData.maxKm} onChange={e => setFormData({...formData, maxKm: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Preço Base</Label>
                <div className="col-span-3 relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8" type="number" step="0.01" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">R$ / km Extra</Label>
                <div className="col-span-3 relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8" type="number" step="0.01" value={formData.pricePerKm} onChange={e => setFormData({...formData, pricePerKm: Number(e.target.value)})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button className="bg-[#6B2C2C] text-white hover:bg-[#5a2323]" onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default RatesTab;
