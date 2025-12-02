import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { useDeliveryMock } from '@/hooks/useDeliveryMock';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, Truck } from 'lucide-react';

const RastreamentoPage = () => {
  const { drivers, loading } = useDeliveryMock();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <Helmet><title>Rastreamento em Tempo Real</title></Helmet>
      
      <div className="p-6 pb-0 flex-none">
        <PageHeader 
            title="Rastreamento de Frota" 
            description="Monitore a localização dos motoristas em tempo real."
            breadcrumbs={[{ label: 'Delivery', path: '/entregas' }, { label: 'Rastreamento' }]}
        />
      </div>

      <div className="flex-1 p-6 pt-4 flex gap-6 min-h-0">
        {/* Sidebar Drivers List */}
        <div className="w-80 flex-none overflow-y-auto pr-2">
            {loading ? <p>Carregando...</p> : drivers.map(driver => (
                <Card key={driver.id} className="mb-3 hover:border-primary cursor-pointer transition-colors">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-sm">{driver.name}</div>
                            <Badge variant={driver.status === 'em_rota' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                                {driver.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                            <Truck className="h-3 w-3" /> {driver.vehicle} ({driver.plate})
                        </div>
                        <div className="mt-2 text-xs text-slate-400 font-mono">
                            {driver.currentLocation.lat.toFixed(4)}, {driver.currentLocation.lng.toFixed(4)}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Map Area */}
        <Card className="flex-1 bg-slate-100 border-slate-200 flex items-center justify-center relative overflow-hidden">
            <div className="text-center text-slate-400 z-10">
                <Map className="h-20 w-20 mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-medium mb-2">Mapa em Tempo Real</h3>
                <p>A integração com o mapa será exibida aqui.</p>
            </div>
            {/* Mock Map Dots */}
            {!loading && drivers.map((d, i) => (
                <div 
                    key={d.id} 
                    className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg transform transition-all duration-1000"
                    style={{ 
                        top: `${30 + (i * 10) + (Math.random() * 5)}%`, 
                        left: `${20 + (i * 15) + (Math.random() * 5)}%` 
                    }}
                    title={d.name}
                />
            ))}
        </Card>
      </div>
    </div>
  );
};

export default RastreamentoPage;