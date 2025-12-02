import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useDeliveryMock } from '@/hooks/useDeliveryMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Truck, Calendar, Package, User, Clock, FileText, Map as MapIcon } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

const EntregaDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDeliveryById } = useDeliveryMock();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeliveryById(id).then(data => {
        setDelivery(data);
        setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-6"><Skeleton className="h-96 w-full" /></div>;
  if (!delivery) return <div className="p-6">Entrega não encontrada.</div>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Detalhes da Entrega {delivery.trackingId}</title></Helmet>

      <PageHeader 
        title={`Entrega ${delivery.trackingId}`} 
        description={`Cliente: ${delivery.client}`}
        breadcrumbs={[{ label: 'Delivery', path: '/entregas' }, { label: 'Detalhes' }]}
        actions={
            <Button variant="outline" onClick={() => navigate(`/entregas/${id}/editar`)}>Editar Entrega</Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{delivery.client}</h2>
                            <p className="text-slate-500 flex items-center gap-2 mt-1"><MapPin className="h-4 w-4" /> {delivery.address}</p>
                        </div>
                        <Badge className="text-base capitalize" variant="secondary">{delivery.status.replace('_', ' ')}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t pt-6">
                        <div>
                            <span className="text-xs uppercase text-slate-500 font-bold block mb-1">Data Prevista</span>
                            <span className="flex items-center gap-2 font-medium"><Calendar className="h-4 w-4 text-slate-400" /> {formatDate(delivery.date)}</span>
                        </div>
                        <div>
                            <span className="text-xs uppercase text-slate-500 font-bold block mb-1">Motorista</span>
                            <span className="flex items-center gap-2 font-medium"><User className="h-4 w-4 text-slate-400" /> {delivery.driverName}</span>
                        </div>
                        <div>
                            <span className="text-xs uppercase text-slate-500 font-bold block mb-1">Valor</span>
                            <span className="font-medium text-emerald-600">{formatCurrency(delivery.value)}</span>
                        </div>
                        <div>
                            <span className="text-xs uppercase text-slate-500 font-bold block mb-1">Qtd. Itens</span>
                            <span className="flex items-center gap-2 font-medium"><Package className="h-4 w-4 text-slate-400" /> {delivery.items.reduce((acc, i) => acc + i.qty, 0)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="items" className="w-full">
                <TabsList className="w-full justify-start bg-transparent p-0 border-b rounded-none h-auto mb-4">
                    <TabsTrigger value="items" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2">Itens do Pedido</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2">Histórico</TabsTrigger>
                    <TabsTrigger value="docs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-2">Documentos</TabsTrigger>
                </TabsList>

                <TabsContent value="items">
                    <Card><CardContent className="p-0">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr><th className="p-3">Produto</th><th className="p-3 text-right">Qtd.</th></tr>
                            </thead>
                            <tbody>
                                {delivery.items.map((item, idx) => (
                                    <tr key={idx} className="border-b last:border-0">
                                        <td className="p-3">{item.name}</td>
                                        <td className="p-3 text-right font-mono">{item.qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent></Card>
                </TabsContent>

                <TabsContent value="history">
                    <div className="space-y-4 pl-2 border-l-2 border-slate-200 ml-2">
                        {delivery.history.map((evt, idx) => (
                            <div key={idx} className="relative pl-6">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary" />
                                <p className="text-sm font-bold capitalize">{evt.status.replace(/_/g, ' ')}</p>
                                <p className="text-xs text-slate-500">{formatDate(evt.date, 'dd/MM/yyyy HH:mm')}</p>
                                {evt.obs && <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded">{evt.obs}</p>}
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="docs">
                    <Card><CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 opacity-20" />
                        <p>Nenhum documento anexado (Comprovante, NF).</p>
                    </CardContent></Card>
                </TabsContent>
            </Tabs>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm">
                <CardHeader><CardTitle className="text-base">Localização Aproximada</CardTitle></CardHeader>
                <CardContent className="p-0 h-64 bg-slate-100 relative flex items-center justify-center rounded-b-xl">
                    <MapIcon className="h-12 w-12 text-slate-300" />
                    <span className="absolute bottom-4 text-xs text-slate-500 bg-white/80 px-2 py-1 rounded">
                        Lat: {delivery.coordinates.lat.toFixed(4)}, Lng: {delivery.coordinates.lng.toFixed(4)}
                    </span>
                </CardContent>
            </Card>
            
            <Button className="w-full" size="lg" onClick={() => navigate('/entregas/rastreamento')}>
                <Truck className="mr-2 h-5 w-5" /> Rastrear em Tempo Real
            </Button>
        </div>
      </div>
    </div>
  );
};

export default EntregaDetalhes;