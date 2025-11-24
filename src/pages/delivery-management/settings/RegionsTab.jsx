
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Map, Plus, Trash2, Edit2 } from 'lucide-react';

const RegionsTab = ({ data, onChange }) => {
  const regions = Array.isArray(data.regions) ? data.regions : [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', radius: 10, active: true });

  const handleOpenModal = (region = null) => {
    if (region) {
      setFormData(region);
      setEditingId(region.id);
    } else {
      setFormData({ name: '', radius: 10, active: true });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    let newRegions;
    if (editingId) {
      newRegions = regions.map(r => r.id === editingId ? { ...formData, id: editingId } : r);
    } else {
      newRegions = [...regions, { ...formData, id: Date.now() }];
    }
    onChange({ ...data, regions: newRegions });
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    onChange({ ...data, regions: regions.filter(r => r.id !== id) });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Regiões de Cobertura</CardTitle>
          <CardDescription>Gerencie as áreas onde as entregas são realizadas.</CardDescription>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-[#6B2C2C] hover:bg-[#5a2323] text-white">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Região
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Placeholder Map */}
        <div className="w-full h-64 bg-slate-100 rounded-md border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
          <Map className="h-12 w-12 mb-2 opacity-50" />
          <p>Mapa de Cobertura Interativo (Placeholder)</p>
          <p className="text-xs">As regiões seriam desenhadas aqui</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Região</TableHead>
              <TableHead>Raio (km)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhuma região cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              regions.map((region) => (
                <TableRow key={region.id}>
                  <TableCell className="font-medium">{region.name}</TableCell>
                  <TableCell>{region.radius} km</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${region.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                      {region.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(region)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(region.id)}>
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
              <DialogTitle>{editingId ? 'Editar Região' : 'Nova Região'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nome</Label>
                <Input className="col-span-3" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Raio (km)</Label>
                <Input type="number" className="col-span-3" value={formData.radius} onChange={e => setFormData({...formData, radius: Number(e.target.value)})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Ativo</Label>
                <div className="col-span-3">
                  <Switch checked={formData.active} onCheckedChange={val => setFormData({...formData, active: val})} />
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

export default RegionsTab;
