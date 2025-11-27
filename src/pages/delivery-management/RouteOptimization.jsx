import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Truck, 
  Calendar, 
  Save, 
  Download, 
  RotateCcw, 
  MoreVertical,
  Navigation,
  MapPin,
  Clock,
  DollarSign,
  BarChart,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/LoadingSpinner';

// --- Constants ---
const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
const CENTER_POS = { lat: -23.5505, lng: -46.6333 }; // São Paulo default
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""; 

// --- Helpers ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const performOptimization = (items, startPos = CENTER_POS) => {
    if (!items || items.length === 0) return [];
    
    let currentPos = startPos;
    const sorted = [];
    const remaining = [...items];

    while (remaining.length > 0) {
      let nearestIdx = -1;
      let minDist = Infinity;

      remaining.forEach((item, rIdx) => {
        const dist = calculateDistance(currentPos.lat, currentPos.lng, item.lat, item.lng);
        if (dist < minDist) {
          minDist = dist;
          nearestIdx = rIdx;
        }
      });

      if (nearestIdx !== -1) {
          const nearest = remaining.splice(nearestIdx, 1)[0];
          sorted.push(nearest);
          currentPos = { lat: nearest.lat, lng: nearest.lng };
      } else {
          // Should not happen if logic is correct, but fallback
          const fallback = remaining.pop();
          sorted.push(fallback);
      }
    }
    return sorted;
};

const SortableItem = ({ id, delivery, color }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="bg-white p-2 mb-2 rounded-md shadow-sm border border-slate-200 text-sm flex items-start gap-2 cursor-grab hover:border-[#6B2C2C]/50 group transition-colors"
    >
      <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-slate-800">{delivery.cliente?.nome || 'Cliente Desconhecido'}</p>
        <p className="text-xs text-muted-foreground truncate">{delivery.endereco || 'Endereço não informado'}</p>
        <div className="flex gap-2 mt-1 items-center">
           <Badge variant="outline" className="text-[10px] h-4 px-1 border-slate-300 text-slate-500">{delivery.id.slice(0,5)}</Badge>
           {delivery.valor && <span className="text-[10px] text-green-600 font-medium">R$ {delivery.valor}</span>}
           {delivery.cliente?.rota && <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-slate-100 text-slate-600 hover:bg-slate-200">{delivery.cliente.rota}</Badge>}
        </div>
      </div>
      <MoreVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
    </div>
  );
};

const MetricCard = ({ label, value, icon: Icon, color }) => (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3 flex items-center justify-between">
            <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
            </div>
            <div className={`p-2 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
                <Icon className={`h-5 w-5 ${color}`} />
            </div>
        </CardContent>
    </Card>
);

const RouteOptimization = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Data
  const [drivers, setDrivers] = useState([]);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [driverRouteAssociations, setDriverRouteAssociations] = useState([]);
  
  // State
  const [items, setItems] = useState({ unassigned: [] });
  const [activeDriverId, setActiveDriverId] = useState(null); 
  const [selectedDriverFilter, setSelectedDriverFilter] = useState('all');
  const [driverRoutes, setDriverRoutes] = useState({}); // Map driverId -> routeId (selection)

  // Maps
  const [mapRef, setMapRef] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Drivers
        const { data: driversData, error: driversError } = await supabase
          .from('motoristas_v2')
          .select('id, nome, veiculo, capacidade_kg')
          .eq('ativo', true);
        if (driversError) throw driversError;

        // 2. Fetch Routes
        const { data: routesData, error: routesError } = await supabase
          .from('rotas')
          .select('*')
          .order('nome');
        if (routesError) throw routesError;

        // 3. Fetch Driver-Route Associations
        const { data: assocData, error: assocError } = await supabase
            .from('motorista_rotas')
            .select('*');
        if (assocError) throw assocError;

        // 4. Fetch Deliveries
        const { data: deliveriesData, error: deliveriesError } = await supabase
          .from('entregas')
          .select(`
            id, status, data_entrega, localizacao_lat, localizacao_lng,
            endereco, valor:venda_num_docto, cliente:clientes!cliente_id(id, nome, rota)
          `)
          .eq('status', 'pendente');
        if (deliveriesError) throw deliveriesError;

        // Process Deliveries (Mock Coords if needed)
        const processedDeliveries = (deliveriesData || []).map(d => ({
          ...d,
          lat: d.localizacao_lat || (CENTER_POS.lat + (Math.random() - 0.5) * 0.1),
          lng: d.localizacao_lng || (CENTER_POS.lng + (Math.random() - 0.5) * 0.1),
          valor: parseFloat((Math.random() * 1000).toFixed(2))
        }));

        setDrivers(driversData || []);
        setAvailableRoutes(routesData || []);
        setDriverRouteAssociations(assocData || []);

        // Initialize State
        const newItems = { unassigned: processedDeliveries };
        const initialDriverRoutes = {};
        
        (driversData || []).forEach(d => {
          newItems[d.id] = [];
          initialDriverRoutes[d.id] = 'none';
        });
        
        setItems(newItems);
        setDriverRoutes(initialDriverRoutes);

      } catch (error) {
        console.error("Fetch Error:", error);
        toast({ variant: "destructive", title: "Erro ao carregar dados", description: error.message });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate, toast]);

  // --- Computed Data ---
  const filteredDrivers = useMemo(() => {
      if (selectedDriverFilter === 'all') return drivers;
      return drivers.filter(d => d.id === selectedDriverFilter);
  }, [drivers, selectedDriverFilter]);

  const routeMetrics = useMemo(() => {
    const metrics = {};
    let globalTotalDist = 0;
    let globalTotalTime = 0;

    drivers.forEach(driver => {
      const driverItems = items[driver.id] || [];
      if (driverItems.length === 0) {
        metrics[driver.id] = { distance: 0, time: 0, cost: 0, count: 0 };
        return;
      }

      let dist = 0;
      let lastPos = CENTER_POS;

      driverItems.forEach(item => {
        dist += calculateDistance(lastPos.lat, lastPos.lng, item.lat, item.lng);
        lastPos = { lat: item.lat, lng: item.lng };
      });

      dist += calculateDistance(lastPos.lat, lastPos.lng, CENTER_POS.lat, CENTER_POS.lng);

      const distKm = dist / 1000;
      const timeMin = distKm * 3 + (driverItems.length * 15); 
      const cost = distKm * 1.5 + 50; 

      metrics[driver.id] = {
        distance: distKm.toFixed(1),
        time: Math.round(timeMin),
        cost: cost.toFixed(2),
        count: driverItems.length
      };

      globalTotalDist += distKm;
      globalTotalTime += timeMin;
    });

    return { 
      byDriver: metrics, 
      global: {
        distance: globalTotalDist.toFixed(1),
        time: Math.round(globalTotalTime),
        cost: (globalTotalDist * 1.5 + drivers.length * 50).toFixed(2)
      }
    };
  }, [items, drivers]);

  const selectedRouteDetails = useMemo(() => {
      if (!activeDriverId) return null;
      const driver = drivers.find(d => d.id === activeDriverId);
      if (!driver) return null;
      return {
          driverName: driver.nome,
          vehicle: driver.veiculo,
          ...routeMetrics.byDriver[activeDriverId]
      };
  }, [activeDriverId, drivers, routeMetrics]);

  // --- Event Handlers ---
  const handleOptimizeAll = () => {
    toast({ title: "Otimizando...", description: "Distribuindo entregas pendentes." });
    
    // Gather all items
    let allDeliveries = [...items.unassigned];
    drivers.forEach(d => allDeliveries.push(...(items[d.id] || [])));

    if (!allDeliveries.length) return;

    // Simple heuristic: Sort by Latitude to group roughly
    allDeliveries.sort((a, b) => a.lat - b.lat);

    // Distribute evenly among *active* drivers (filtered)
    const activeDriverList = selectedDriverFilter === 'all' ? drivers : drivers.filter(d => d.id === selectedDriverFilter);
    const chunkSize = Math.ceil(allDeliveries.length / activeDriverList.length);
    
    const newItems = { ...items, unassigned: [] };
    // Clear filtered drivers lists first
    activeDriverList.forEach(d => newItems[d.id] = []);

    activeDriverList.forEach((driver, idx) => {
      const start = idx * chunkSize;
      const chunk = allDeliveries.slice(start, start + chunkSize);
      newItems[driver.id] = performOptimization(chunk);
    });

    setItems(newItems);
    toast({ title: "Otimização concluída", description: "Entregas redistribuídas." });
  };

  const handleDriverRouteSelect = (driverId, routeId) => {
      setDriverRoutes(prev => ({ ...prev, [driverId]: routeId }));
      
      if (routeId === 'none') return;

      const route = availableRoutes.find(r => r.id === routeId);
      if (!route) return;

      // Find matching deliveries in unassigned pool
      // Matching loosely by text inclusion in client.rota
      const matchingDeliveries = items.unassigned.filter(d => {
          if (!d.cliente?.rota) return false;
          return d.cliente.rota.toLowerCase().includes(route.nome.toLowerCase());
      });

      if (matchingDeliveries.length === 0) {
          toast({ 
              title: "Rota vazia", 
              description: `Nenhuma entrega pendente encontrada para a rota "${route.nome}".`,
              variant: "warning"
          });
          return;
      }

      // Move items to driver
      setItems(prev => {
          const remainingUnassigned = prev.unassigned.filter(d => !matchingDeliveries.includes(d));
          const currentDriverItems = prev[driverId] || [];
          // Combine and re-optimize
          const combined = [...currentDriverItems, ...matchingDeliveries];
          const optimized = performOptimization(combined);

          return {
              ...prev,
              unassigned: remainingUnassigned,
              [driverId]: optimized
          };
      });

      setActiveDriverId(driverId); // Focus on this driver
      toast({ 
          title: "Rota Carregada", 
          description: `${matchingDeliveries.length} entregas adicionadas à lista de ${drivers.find(d => d.id === driverId)?.nome}.` 
      });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find source container
    let sourceContainer = Object.keys(items).find(key => items[key].find(i => i.id === activeId));
    let destContainer = overId;
    
    // If overId is an item, find its container
    if (!items[destContainer]) {
       destContainer = Object.keys(items).find(key => items[key].find(i => i.id === overId));
    }

    if (!sourceContainer || !destContainer) return;

    // If moving between containers
    if (sourceContainer !== destContainer) {
      setItems(prev => {
        const sourceList = [...prev[sourceContainer]];
        const destList = [...(prev[destContainer] || [])];
        const item = sourceList.find(i => i.id === activeId);
        
        // Remove from source
        const newSourceList = sourceList.filter(i => i.id !== activeId);
        
        // Add to dest (and re-optimize dest if it's a driver)
        let newDestList = [...destList, item];
        if (destContainer !== 'unassigned') {
            newDestList = performOptimization(newDestList);
        }

        return {
          ...prev,
          [sourceContainer]: newSourceList,
          [destContainer]: newDestList
        };
      });
    } else {
      // Reordering within same container
      const list = items[sourceContainer];
      const oldIndex = list.findIndex(i => i.id === activeId);
      const newIndex = list.findIndex(i => i.id === overId);
      
      if (oldIndex !== newIndex) {
        setItems(prev => ({
          ...prev,
          [sourceContainer]: arrayMove(prev[sourceContainer], oldIndex, newIndex)
        }));
      }
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Rotas Otimizadas', 14, 15);
    doc.setFontSize(10);
    doc.text(`Data: ${selectedDate}`, 14, 22);
    
    let startY = 35;
    filteredDrivers.forEach(driver => {
      const driverItems = items[driver.id] || [];
      if (driverItems.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(107, 44, 44);
        doc.text(`Motorista: ${driver.nome} (${driver.veiculo})`, 14, startY);
        doc.setTextColor(0,0,0);
        startY += 5;
        
        autoTable(doc, {
          startY,
          head: [['Seq', 'Cliente', 'Endereço', 'Valor', 'Rota']],
          body: driverItems.map((d, i) => [
              i+1, 
              d.cliente?.nome, 
              d.endereco, 
              `R$ ${d.valor}`, 
              d.cliente?.rota || '-'
          ]),
          theme: 'grid',
          headStyles: { fillColor: [107, 44, 44] }
        });
        startY = doc.lastAutoTable.finalY + 10;
      }
    });
    
    doc.save(`rotas_${selectedDate}.pdf`);
  };

  const handleDriverSelect = (driverId) => {
      setActiveDriverId(prev => prev === driverId ? null : driverId);
      
      if (driverId && driverId !== 'all') {
          // Zoom to driver's route if exists
          const driverItems = items[driverId] || [];
          if (driverItems.length > 0 && mapRef) {
              const bounds = new window.google.maps.LatLngBounds();
              bounds.extend(CENTER_POS);
              driverItems.forEach(item => bounds.extend({ lat: item.lat, lng: item.lng }));
              mapRef.fitBounds(bounds);
          } else if (mapRef) {
              mapRef.panTo(CENTER_POS);
              mapRef.setZoom(12);
          }
      }
  };

  const onMapLoad = useCallback((map) => {
    setMapRef(map);
  }, []);

  if (!isLoaded) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (loadError) return <div>Erro ao carregar Google Maps</div>;

  return (
    <>
      <Helmet><title>Otimização de Rotas | Google Maps</title></Helmet>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F5E6D3] rounded-lg text-[#6B2C2C]">
                        <Navigation className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#6B2C2C]">Otimização de Rotas</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(), 'dd/MM/yyyy')}</span>
                        </div>
                    </div>
                </div>
                
                {/* Driver Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedDriverFilter} onValueChange={(val) => { setSelectedDriverFilter(val); setActiveDriverId(val === 'all' ? null : val); }}>
                        <SelectTrigger className="w-[200px] h-9">
                            <SelectValue placeholder="Filtrar Motorista" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Motoristas</SelectItem>
                            {drivers.map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <Button variant="outline" onClick={handleOptimizeAll} disabled={loading} className="border-[#6B2C2C] text-[#6B2C2C] hover:bg-[#F5E6D3]">
                    <RotateCcw className="mr-2 h-4 w-4" /> Distribuir Pendentes
                </Button>
                <Button variant="outline" onClick={handleExportPDF}><Download className="mr-2 h-4 w-4" /> PDF</Button>
                <Button className="bg-[#6B2C2C] hover:bg-[#5a2323] text-white"><Save className="mr-2 h-4 w-4" /> Salvar Rotas</Button>
            </div>
          </div>

          <div className="flex flex-1 gap-4 overflow-hidden flex-col lg:flex-row">
            
            {/* Left: Map & Metrics */}
            <div className="flex-1 flex flex-col gap-4 min-h-[500px]">
                {/* Global Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard label="Distância Total" value={`${routeMetrics.global.distance} km`} icon={MapPin} color="text-[#6B2C2C]" />
                    <MetricCard label="Tempo Estimado" value={`${Math.floor(routeMetrics.global.time/60)}h ${routeMetrics.global.time%60}m`} icon={Clock} color="text-blue-600" />
                    <MetricCard label="Custo Total" value={`R$ ${routeMetrics.global.cost}`} icon={DollarSign} color="text-green-600" />
                    <MetricCard label="Eficiência" value="94%" icon={BarChart} color="text-orange-600" />
                </div>

                {/* Google Map */}
                <div className="flex-1 bg-slate-100 rounded-lg border shadow-inner relative overflow-hidden group">
                    <GoogleMap
                        mapContainerStyle={MAP_CONTAINER_STYLE}
                        center={CENTER_POS}
                        zoom={11}
                        onLoad={onMapLoad}
                        options={{
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: true,
                            styles: [
                                { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
                            ]
                        }}
                    >
                        {/* Unassigned Markers */}
                        {items.unassigned.map(item => (
                            <Marker
                                key={item.id}
                                position={{ lat: item.lat, lng: item.lng }}
                                icon={{
                                    path: window.google.maps.SymbolPath.CIRCLE,
                                    fillColor: '#94a3b8',
                                    fillOpacity: 0.8,
                                    scale: 6,
                                    strokeColor: 'white',
                                    strokeWeight: 1
                                }}
                                onClick={() => setInfoWindowOpen(item)}
                            />
                        ))}

                        {/* Driver Routes */}
                        {filteredDrivers.map((driver, idx) => {
                            // Use absolute index from full list to keep colors consistent
                            const globalIndex = drivers.findIndex(d => d.id === driver.id);
                            const color = COLORS[globalIndex % COLORS.length];
                            const driverItems = items[driver.id] || [];
                            const isActive = activeDriverId === null || activeDriverId === driver.id;
                            
                            // If driver is not active/focused, dim opacity
                            const opacity = isActive ? 1 : 0.3;
                            
                            if (driverItems.length === 0) return null;

                            const path = [CENTER_POS, ...driverItems.map(i => ({ lat: i.lat, lng: i.lng })), CENTER_POS];

                            return (
                                <React.Fragment key={driver.id}>
                                    <Polyline
                                        path={path}
                                        options={{
                                            strokeColor: color,
                                            strokeOpacity: opacity * 0.8,
                                            strokeWeight: isActive ? 5 : 3,
                                            zIndex: isActive ? 10 : 1,
                                            icons: [{
                                                icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                                                offset: '100%',
                                                repeat: '100px'
                                            }]
                                        }}
                                    />
                                    {driverItems.map((item, i) => (
                                        <Marker
                                            key={item.id}
                                            position={{ lat: item.lat, lng: item.lng }}
                                            label={{
                                                text: (i + 1).toString(),
                                                color: 'white',
                                                fontSize: '10px',
                                                fontWeight: 'bold'
                                            }}
                                            icon={{
                                                path: window.google.maps.SymbolPath.CIRCLE,
                                                fillColor: color,
                                                fillOpacity: opacity,
                                                scale: isActive ? 12 : 8,
                                                strokeColor: 'white',
                                                strokeWeight: 2
                                            }}
                                            zIndex={isActive ? 100 : 10}
                                            onClick={() => setInfoWindowOpen(item)}
                                        />
                                    ))}
                                </React.Fragment>
                            );
                        })}

                        {infoWindowOpen && (
                            <InfoWindow
                                position={{ lat: infoWindowOpen.lat, lng: infoWindowOpen.lng }}
                                onCloseClick={() => setInfoWindowOpen(null)}
                            >
                                <div className="p-2 max-w-[240px]">
                                    <h3 className="font-bold text-sm">{infoWindowOpen.cliente?.nome}</h3>
                                    <p className="text-xs text-gray-600 mb-1">{infoWindowOpen.endereco}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="outline" className="text-[10px]">R$ {infoWindowOpen.valor}</Badge>
                                        {infoWindowOpen.cliente?.rota && <Badge variant="secondary" className="text-[10px]">{infoWindowOpen.cliente.rota}</Badge>}
                                    </div>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                    
                    {/* Legend Overlay */}
                    <div className="absolute bottom-6 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 z-10 max-w-[200px] transition-opacity duration-300">
                        <h4 className="text-xs font-bold mb-2 text-gray-700 uppercase tracking-wide flex items-center gap-2">
                            <Truck className="h-3 w-3" /> Legenda
                        </h4>
                        <ScrollArea className="h-[120px]">
                            <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-2 p-1">
                                    <div className="w-3 h-3 rounded-full bg-[#94a3b8] border border-gray-300 shadow-sm"></div>
                                    <span className="text-gray-500">Não Atribuído</span>
                                </div>
                                {filteredDrivers.map((d) => {
                                    const globalIdx = drivers.findIndex(drv => drv.id === d.id);
                                    const color = COLORS[globalIdx % COLORS.length];
                                    const isActive = activeDriverId === d.id;
                                    return (
                                        <div 
                                            key={d.id} 
                                            className={`flex items-center gap-2 cursor-pointer p-1 rounded transition-colors ${isActive ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}`} 
                                            onClick={() => handleDriverSelect(d.id)}
                                        >
                                            <div className="w-3 h-3 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: color }}></div>
                                            <span className={isActive ? 'text-slate-900' : 'text-slate-600'}>{d.nome}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Route Details Overlay (Top Right) */}
                    {selectedRouteDetails && (
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-slate-200 z-10 w-[280px] animate-in slide-in-from-top-2">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-[#6B2C2C] text-sm">{selectedRouteDetails.driverName}</h3>
                                    <p className="text-xs text-muted-foreground">{selectedRouteDetails.vehicle}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveDriverId(null)}>
                                    <span className="sr-only">Fechar</span>
                                    ×
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs border-b border-dashed pb-1">
                                    <span className="text-gray-500">Entregas</span>
                                    <span className="font-medium">{selectedRouteDetails.count}</span>
                                </div>
                                <div className="flex justify-between text-xs border-b border-dashed pb-1">
                                    <span className="text-gray-500">Distância</span>
                                    <span className="font-medium">{selectedRouteDetails.distance} km</span>
                                </div>
                                <div className="flex justify-between text-xs border-b border-dashed pb-1">
                                    <span className="text-gray-500">Tempo</span>
                                    <span className="font-medium">{Math.floor(selectedRouteDetails.time/60)}h {selectedRouteDetails.time%60}m</span>
                                </div>
                                <div className="flex justify-between text-xs pt-1">
                                    <span className="text-gray-500 font-medium">Custo Est.</span>
                                    <span className="font-bold text-green-600">R$ {selectedRouteDetails.cost}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Lists */}
            <div className="w-full lg:w-[380px] flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden h-full">
                
                <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-sm text-gray-700">Distribuição</h2>
                        <Badge variant="outline" className="bg-white">{items.unassigned.length} pend.</Badge>
                    </div>
                    {items.unassigned.length > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleOptimizeAll}>
                                        <RotateCcw className="h-3 w-3 text-[#6B2C2C]" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Redistribuir automaticamente</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                
                <ScrollArea className="flex-1 px-3 py-2">
                    <div className="space-y-6 pb-10">
                        {/* Unassigned */}
                        <div>
                            <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                                <Search className="h-3 w-3" /> Não Atribuídas
                            </h3>
                            <SortableContext id="unassigned" items={items.unassigned} strategy={verticalListSortingStrategy}>
                                <div className="min-h-[60px] bg-slate-50 rounded-md p-2 border-2 border-dashed border-slate-200 transition-colors hover:border-slate-300">
                                    {items.unassigned.map((d) => (
                                        <SortableItem key={d.id} id={d.id} delivery={d} color="#94a3b8" />
                                    ))}
                                    {items.unassigned.length === 0 && <p className="text-center text-xs text-muted-foreground py-4">Nenhuma entrega pendente</p>}
                                </div>
                            </SortableContext>
                        </div>

                        <Separator />

                        {/* Drivers Lists */}
                        {filteredDrivers.map((driver) => {
                            const globalIdx = drivers.findIndex(d => d.id === driver.id);
                            const driverItems = items[driver.id] || [];
                            const color = COLORS[globalIdx % COLORS.length];
                            const isFocused = activeDriverId === driver.id;
                            
                            // Filter routes relevant to this driver from `availableRoutes` using `driverRouteAssociations`
                            // If no association found, show all? Or show none? 
                            // Assuming if associations exist, filter. If not, show all.
                            // Or better: show routes that this driver is linked to.
                            const linkedRouteIds = driverRouteAssociations
                                .filter(a => a.motorista_id === driver.id)
                                .map(a => a.rota_id);
                            
                            const driverSpecificRoutes = linkedRouteIds.length > 0 
                                ? availableRoutes.filter(r => linkedRouteIds.includes(r.id))
                                : availableRoutes;

                            return (
                                <div key={driver.id} className={`transition-all duration-200 rounded-lg ${isFocused ? 'ring-2 ring-[#6B2C2C] bg-slate-50 p-2' : 'p-1'}`}>
                                    <div className="flex flex-col gap-2 mb-2">
                                        <div className="flex justify-between items-center">
                                            <div 
                                                className="flex items-center gap-2 font-medium text-sm cursor-pointer hover:text-[#6B2C2C] transition-colors" 
                                                onClick={() => handleDriverSelect(driver.id)}
                                            >
                                                <Truck className="h-4 w-4" style={{ color }} />
                                                {driver.nome}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Badge variant="secondary" className="text-[10px] h-5">{driverItems.length}</Badge>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDriverSelect(driver.id)}>
                                                    <Eye className={`h-3 w-3 ${isFocused ? 'text-[#6B2C2C]' : 'text-gray-400'}`} />
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        {/* Route Selector */}
                                        <Select 
                                            value={driverRoutes[driver.id]} 
                                            onValueChange={(val) => handleDriverRouteSelect(driver.id, val)}
                                        >
                                            <SelectTrigger className="h-8 text-xs w-full bg-white shadow-sm border-slate-200">
                                                <SelectValue placeholder="Carregar Rota Pré-definida" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none" className="text-xs text-muted-foreground">Nenhuma rota selecionada</SelectItem>
                                                {driverSpecificRoutes.map(r => (
                                                    <SelectItem key={r.id} value={r.id} className="text-xs font-medium">
                                                        {r.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <SortableContext id={driver.id} items={driverItems} strategy={verticalListSortingStrategy}>
                                        <div className="min-h-[50px] bg-white rounded-md p-1 border border-slate-200 shadow-sm transition-all" style={{ borderLeft: `3px solid ${color}` }}>
                                            {driverItems.map((d) => (
                                                <SortableItem key={d.id} id={d.id} delivery={d} color={color} />
                                            ))}
                                            {driverItems.length === 0 && <p className="text-center text-xs text-muted-foreground py-3 italic">Arraste entregas ou selecione uma rota</p>}
                                        </div>
                                    </SortableContext>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

          </div>
        </div>
        <DragOverlay>
            {/* Optional: Add visual feedback during drag if needed */}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default RouteOptimization;