import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useDeliveryMock } from '@/hooks/useDeliveryMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, X, Loader2 } from 'lucide-react';

const EntregaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getDeliveryById, drivers } = useDeliveryMock();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    address: '',
    date: '',
    driverId: '',
    items: '', // Simple text for demo, usually dynamic list
    obs: ''
  });

  useEffect(() => {
    if (id) {
        setLoading(true);
        getDeliveryById(id).then(data => {
            if (data) {
                setFormData({
                    client: data.client,
                    address: data.address,
                    date: data.date.split('T')[0],
                    driverId: data.driverId,
                    items: data.items.map(i => `${i.qty}x ${i.name}`).join(', '),
                    obs: data.history[0]?.obs || ''
                });
            }
            setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: id ? "Entrega atualizada" : "Entrega criada", variant: "success" });
    navigate('/entregas');
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>{id ? 'Editar' : 'Nova'} Entrega | Delivery</title></Helmet>

      <PageHeader 
        title={id ? 'Editar Entrega' : 'Nova Entrega'}
        breadcrumbs={[{ label: 'Delivery', path: '/entregas' }, { label: id ? 'Editar' : 'Nova' }]}
      />

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Dados da Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div> : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="client">Cliente</Label>
                                    <Input id="client" required value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} placeholder="Nome do cliente ou empresa" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Data Prevista</Label>
                                    <Input id="date" type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Endereço de Entrega</Label>
                                <Input id="address" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Rua, número, bairro, cidade..." />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="driver">Motorista Responsável</Label>
                                <Select value={formData.driverId} onValueChange={(val) => setFormData({...formData, driverId: val})}>
                                    <SelectTrigger><SelectValue placeholder="Selecione um motorista" /></SelectTrigger>
                                    <SelectContent>
                                        {drivers.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name} ({d.vehicle})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="items">Itens (Resumo)</Label>
                                <Textarea id="items" value={formData.items} onChange={e => setFormData({...formData, items: e.target.value})} placeholder="Liste os itens ou códigos..." rows={3} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="obs">Observações</Label>
                                <Textarea id="obs" value={formData.obs} onChange={e => setFormData({...formData, obs: e.target.value})} placeholder="Instruções especiais..." />
                            </div>
                        </>
                    )}
                </CardContent>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 rounded-b-xl">
                    <Button type="button" variant="outline" onClick={() => navigate('/entregas')}>
                        <X className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" /> {id ? 'Salvar Alterações' : 'Criar Entrega'}
                    </Button>
                </div>
            </Card>
        </form>
      </div>
    </div>
  );
};

export default EntregaForm;