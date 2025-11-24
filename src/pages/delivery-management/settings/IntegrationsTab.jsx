
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Link, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const IntegrationsTab = ({ data, onChange }) => {
  const integrations = Array.isArray(data.integrations) ? data.integrations : [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showKey, setShowKey] = useState({});
  const [formData, setFormData] = useState({ name: '', apiKey: '', webhookUrl: '', active: true });

  const handleSave = () => {
    const newIntegrations = [...integrations, { ...formData, id: Date.now() }];
    onChange({ ...data, integrations: newIntegrations });
    setIsModalOpen(false);
    setFormData({ name: '', apiKey: '', webhookUrl: '', active: true });
  };

  const handleDelete = (id) => {
    onChange({ ...data, integrations: integrations.filter(i => i.id !== id) });
  };

  const toggleShowKey = (id) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Integrações e APIs</CardTitle>
          <CardDescription>Gerencie conexões externas e webhooks.</CardDescription>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#6B2C2C] hover:bg-[#5a2323] text-white">
          <Plus className="mr-2 h-4 w-4" /> Nova Integração
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plataforma / Nome</TableHead>
              <TableHead>Webhook URL</TableHead>
              <TableHead>Chave de Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {integrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma integração ativa.
                </TableCell>
              </TableRow>
            ) : (
              integrations.map((int) => (
                <TableRow key={int.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Link className="h-3 w-3 text-blue-500" /> {int.name}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground" title={int.webhookUrl}>
                    {int.webhookUrl || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">
                        {showKey[int.id] ? int.apiKey : '••••••••••••••••'}
                      </code>
                      <button onClick={() => toggleShowKey(int.id)} className="text-slate-400 hover:text-slate-600">
                        {showKey[int.id] ? <EyeOff className="h-3 w-3"/> : <Eye className="h-3 w-3"/>}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch checked={int.active} disabled />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(int.id)}>
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
              <DialogTitle>Adicionar Integração</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Nome</Label>
                <Input className="col-span-3" placeholder="Ex: Shopify, WooCommerce" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">API Key</Label>
                <Input className="col-span-3" type="password" value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Webhook</Label>
                <Input className="col-span-3" placeholder="https://api.seusite.com/callback" value={formData.webhookUrl} onChange={e => setFormData({...formData, webhookUrl: e.target.value})} />
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
              <Button className="bg-[#6B2C2C] text-white hover:bg-[#5a2323]" onClick={handleSave}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default IntegrationsTab;
