import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Map, Truck, User, Calendar, Anchor, ArrowRight, Loader2, AlertTriangle, List, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const mockDeliveries = [
  { id: 'mock-1', endereco: 'Rua das Flores, 123 - Centro', prioridade: 'Alta', cliente_nome: 'Floricultura Florescer' },
  { id: 'mock-2', endereco: 'Avenida Principal, 456 - Bairro Norte', prioridade: 'Média', cliente_nome: 'Supermercado Central' },
  { id: 'mock-3', endereco: 'Travessa dos Pássaros, 789 - Vila Sul', prioridade: 'Baixa', cliente_nome: 'Padaria Pão Quente' },
];

const mockDrivers = [
  { id: 'driver-1', nome: 'Carlos Silva', veiculo: 'Caminhão VUC', capacidade_carga: 3000 },
  { id: 'driver-2', nome: 'Mariana Costa', veiculo: 'Fiorino', capacidade_carga: 650 },
];

const SortableDeliveryItem = ({ delivery, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: delivery.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-4 mb-2 bg-background rounded-lg border flex items-center justify-between touch-none">
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
        <div>
          <p className="font-semibold text-sm">{delivery.cliente_nome}</p>
          <p className="text-xs text-muted-foreground">{delivery.endereco}</p>
        </div>
      </div>
      <Badge variant={delivery.prioridade === 'Alta' ? 'destructive' : 'secondary'}>{delivery.prioridade}</Badge>
    </div>
  );
};

const RouteOptimization = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();

  const { data: drivers, loading: loadingDrivers } = useAnalyticalData(
    'get_all_drivers_for_delivery_management', 
    {},
    { defaultValue: [] }
  );

  const deliveryParams = useMemo(() => ({
    p_delivery_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
    p_driver_id: selectedDriver
  }), [selectedDate, selectedDriver]);

  const { data: initialDeliveries, loading: loadingDeliveries, error: deliveriesError } = useAnalyticalData(
    'get_deliveries_for_optimization',
    deliveryParams,
    { 
      enabled: !!selectedDriver && !!selectedDate,
      defaultValue: []
    }
  );

  useEffect(() => {
    if (deliveriesError) {
        setDeliveries(mockDeliveries);
        toast({
            variant: "destructive",
            title: "Erro de Conexão",
            description: "Não foi possível buscar os dados de entrega. Usando dados de exemplo.",
        });
    } else if (initialDeliveries) {
      setDeliveries(initialDeliveries);
    }
    setOptimizedRoute([]);
  }, [initialDeliveries, deliveriesError, toast]);

  const handleOptimize = useCallback(() => {
    toast({
      title: '🚧 Otimização de Rotas',
      description: 'Esta funcionalidade está em desenvolvimento e usará uma API externa para calcular a rota ideal.',
    });
    setIsOptimizing(true);
    // Simula uma chamada de API de otimização
    setTimeout(() => {
      // Lógica de otimização simples (mock): reordena por prioridade
      const sorted = [...deliveries].sort((a, b) => {
        const priority = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
        return (priority[b.prioridade] || 0) - (priority[a.prioridade] || 0);
      });
      setOptimizedRoute(sorted);
      setIsOptimizing(false);
    }, 1500);
  }, [deliveries, toast]);
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = deliveries.findIndex((d) => d.id === active.id);
      const newIndex = deliveries.findIndex((d) => d.id === over.id);
      const newOrder = Array.from(deliveries);
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      setDeliveries(newOrder);
      setOptimizedRoute(newOrder);
    }
  };

  const currentDriver = useMemo(() => {
      const allDrivers = [...drivers, ...mockDrivers];
      return allDrivers.find(d => d.id === selectedDriver);
  }, [drivers, selectedDriver]);

  const renderContent = () => {
    if (loadingDeliveries && !deliveriesError) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }
    
    if (deliveriesError) {
       return (
        <>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro ao Carregar Entregas</AlertTitle>
              <AlertDescription>
                Não foi possível buscar os dados do servidor. Usando dados de exemplo.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
                 {mockDeliveries.map((delivery, index) => (
                    <div key={delivery.id} className="p-4 mb-2 bg-background rounded-lg border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
                            <div>
                                <p className="font-semibold text-sm">{delivery.cliente_nome}</p>
                                <p className="text-xs text-muted-foreground">{delivery.endereco}</p>
                            </div>
                        </div>
                        <Badge variant={delivery.prioridade === 'Alta' ? 'destructive' : 'secondary'}>{delivery.prioridade}</Badge>
                    </div>
                ))}
            </div>
        </>
       )
    }

    const sourceList = optimizedRoute.length > 0 ? optimizedRoute : deliveries;
    
    if(sourceList.length === 0 && selectedDriver) {
      return (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Nenhuma entrega encontrada</h3>
          <p className="mt-1 text-muted-foreground">Não há entregas pendentes para este motorista nesta data.</p>
        </div>
      )
    }

    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sourceList.map(d => d.id)} strategy={verticalListSortingStrategy}>
          {sourceList.map((delivery, index) => (
            <SortableDeliveryItem key={delivery.id} delivery={delivery} index={index} />
          ))}
        </SortableContext>
      </DndContext>
    );
  };

  const availableDrivers = useMemo(() => {
    return loadingDrivers ? mockDrivers : drivers;
  }, [drivers, loadingDrivers]);

  return (
    <>
      <Helmet>
        <title>Otimização de Rotas | Costa Lavos</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Otimização de Rotas</h1>
          <p className="text-muted-foreground">Planeje e otimize as rotas de entrega dos seus motoristas.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seleção de Rota</CardTitle>
            <CardDescription>Escolha a data e o motorista para planejar as entregas.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Data</label>
              <DatePicker date={selectedDate} setDate={setSelectedDate} />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Motorista</label>
              {loadingDrivers ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select onValueChange={setSelectedDriver} value={selectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {(availableDrivers.length > 0 ? availableDrivers : mockDrivers).map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {currentDriver && (
              <>
                 <InfoCard icon={Truck} title="Veículo" value={currentDriver.veiculo} />
                 <InfoCard icon={Anchor} title="Capacidade" value={`${currentDriver.capacidade_carga} kg`} />
              </>
            )}
          </CardContent>
        </Card>
        
        {selectedDriver && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Entregas Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                {renderContent()}
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Rota Otimizada</CardTitle>
                    <CardDescription>Arraste as entregas para reordenar manualmente.</CardDescription>
                  </div>
                  <Button onClick={handleOptimize} disabled={isOptimizing || deliveries.length === 0}>
                    {isOptimizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Otimizar Rota
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[400px] bg-muted rounded-lg flex items-center justify-center">
                    <Map className="h-32 w-32 text-muted-foreground/30" />
                    <p className="absolute text-muted-foreground">Visualização do mapa em breve</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const InfoCard = ({ icon: Icon, title, value }) => (
    <div className="bg-muted p-4 rounded-lg flex items-center gap-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
        <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-sm font-semibold">{value}</p>
        </div>
    </div>
);

const Badge = ({ variant, children }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full";
    const variants = {
        destructive: "bg-red-100 text-red-800",
        secondary: "bg-gray-100 text-gray-800"
    };
    return <span className={`${baseClasses} ${variants[variant]}`}>{children}</span>;
}

export default RouteOptimization;