import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Search, Plus, Filter, MoreHorizontal, Edit, Eye, MapPin, Truck, XCircle, ChevronDown, ChevronUp,
  Loader2
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFormStatePersistence } from '@/hooks/useFormStatePersistence';
import { PersistenceStatus } from '@/components/PersistenceStatus';

// --- Constants ---
const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];
const STATUS_OPTIONS = ['pendente', 'em_rota', 'entregue', 'cancelado', 'concluido'];

const STATUS_COLORS = {
  'entregue': 'bg-green-100 text-green-800 border-green-200',
  'concluido': 'bg-green-100 text-green-800 border-green-200',
  'pendente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'em_rota': 'bg-blue-100 text-blue-800 border-blue-200',
  'cancelado': 'bg-red-100 text-red-800 border-red-200',
};

// --- Modals ---

const CreateEditDeliveryModal = ({ isOpen, onClose, onSave, delivery, drivers, clients }) => {
  const deliveryId = delivery?.id || 'new';
  
  // Use persistence only for new or specifically identified edits to avoid collisions if multiple open
  // If delivery is provided, it's an edit. We initialize with delivery data.
  // However, useFormStatePersistence hydrates from storage if present.
  // Strategy: If delivery exists (edit mode), we only use persistence if the ID matches stored draft.
  // Otherwise, initialize from props. 
  
  const initialValues = {
    cliente_id: delivery?.cliente_id || '',
    motorista_id: delivery?.motorista_id || '',
    data_entrega: delivery?.data_entrega ? format(parseISO(delivery.data_entrega), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    endereco: delivery?.endereco || '', 
    status: delivery?.status || 'pendente',
    observacoes: delivery?.observacoes || ''
  };

  const { formData, handleBulkChange, handleChange, status, lastSaved, clearDraft } = useFormStatePersistence(
      `delivery_form_${deliveryId}`,
      initialValues
  );

  // Sync if delivery prop changes significantly (e.g. opening a different delivery)
  useEffect(() => {
      if (delivery && delivery.id !== formData.id && status === 'idle') {
          handleBulkChange(initialValues);
      }
  }, [delivery]);

  const handleSubmit = () => {
    onSave(formData);
    clearDraft();
  };

  const handleClose = () => {
      // Optional: clear draft on close if it's a new item to avoid stale data next time
      // or keep it as "draft" feature. Keeping it is better.
      onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between items-center pr-6">
            <DialogTitle>{delivery ? 'Editar Entrega' : 'Nova Entrega'}</DialogTitle>
            <PersistenceStatus status={status} lastSaved={lastSaved} />
          </div>
          <DialogDescription>Preencha os detalhes da entrega abaixo.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="client" className="text-right">Cliente</Label>
            <Select 
              value={formData.cliente_id} 
              onValueChange={(val) => handleChange('cliente_id', val)}
              disabled={!!delivery} 
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driver" className="text-right">Entregador</Label>
            <Select value={formData.motorista_id} onValueChange={(val) => handleChange('motorista_id', val)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o entregador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Não atribuído</SelectItem>
                {drivers.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">Endereço</Label>
            <Input 
              id="address" 
              value={formData.endereco} 
              onChange={(e) => handleChange('endereco', e.target.value)} 
              className="col-span-3" 
              placeholder="Endereço de entrega (opcional)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Data</Label>
            <Input 
              id="date" 
              type="date" 
              value={formData.data_entrega} 
              onChange={(e) => handleChange('data_entrega', e.target.value)} 
              className="col-span-3" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="obs" className="text-right">Obs.</Label>
            <Textarea 
              id="obs" 
              value={formData.observacoes} 
              onChange={(e) => handleChange('observacoes', e.target.value)} 
              className="col-span-3" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-[#6B2C2C] hover:bg-[#5a2323] text-white">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ... (Rest of components: AssignDriverModal, TrackingModal, CancelAlert - same as before)
const AssignDriverModal = ({ isOpen, onClose, onAssign, delivery, drivers }) => {
  const [selectedDriver, setSelectedDriver] = useState('');

  useEffect(() => {
    if (delivery) {
      setSelectedDriver(delivery.motorista_id || '');
    }
  }, [delivery]);

  const handleAssign = () => {
    onAssign(delivery.id, selectedDriver);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atribuir Entregador</DialogTitle>
          <DialogDescription>
            Selecione o motorista responsável pela entrega #{delivery?.id?.substring(0,8)}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="assign-driver" className="mb-2 block">Entregador</Label>
          <Select value={selectedDriver} onValueChange={setSelectedDriver}>
            <SelectTrigger id="assign-driver">
              <SelectValue placeholder="Selecione um motorista" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAssign} className="bg-[#6B2C2C] hover:bg-[#5a2323] text-white">Confirmar Atribuição</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TrackingModal = ({ isOpen, onClose, delivery }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Rastreamento da Entrega</DialogTitle>
          <DialogDescription>
            Status atual e localização da entrega #{delivery?.id?.substring(0,8)}.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[300px] w-full bg-slate-100 rounded-md flex items-center justify-center border border-slate-200 relative overflow-hidden">
           {/* Placeholder for map */}
           {delivery?.localizacao_lat && delivery?.localizacao_lng ? (
             <iframe
                title="Tracking Map"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${delivery.localizacao_lat},${delivery.localizacao_lng}&z=15&output=embed`}
                allowFullScreen
             ></iframe>
           ) : (
             <div className="text-center text-muted-foreground">
               <MapPin className="h-10 w-10 mx-auto mb-2 opacity-20" />
               <p>Localização não disponível</p>
             </div>
           )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
            <div>
                <span className="font-semibold">Status:</span> <span className="capitalize">{delivery?.status?.replace('_', ' ')}</span>
            </div>
            <div>
                <span className="font-semibold">Atualizado em:</span> {delivery?.updated_at ? format(parseISO(delivery.updated_at), 'dd/MM HH:mm') : '-'}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CancelAlert = ({ isOpen, onClose, onConfirm }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle className="text-red-600 flex items-center gap-2">
            <XCircle className="h-5 w-5" /> Cancelar Entrega
        </DialogTitle>
        <DialogDescription>
          Tem certeza que deseja cancelar esta entrega? Esta ação não pode ser desfeita.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Voltar</Button>
        <Button variant="destructive" onClick={onConfirm}>Sim, Cancelar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const DeliveriesManagement = () => {
  const { toast } = useToast();
  
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [clients, setClients] = useState([]);

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    driverId: 'all',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'data_entrega', direction: 'desc' });

  const [modals, setModals] = useState({
    createEdit: { open: false, data: null },
    assign: { open: false, data: null },
    track: { open: false, data: null },
    cancel: { open: false, data: null },
  });

  useEffect(() => {
    const fetchResources = async () => {
        try {
            const [driversRes, clientsRes] = await Promise.all([
                supabase.from('motoristas').select('id, nome').eq('ativo', true),
                supabase.from('clientes').select('id, nome, ativo') 
            ]);
            if (driversRes.error) throw driversRes.error;
            setDrivers(driversRes.data || []);
            if (clientsRes.data) setClients(clientsRes.data);
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('entregas')
                .select(`
                    *,
                    motorista:motoristas!motorista_id(id, nome),
                    cliente:clientes!cliente_id(id, nome, email, telefone)
                `)
                .gte('data_entrega', new Date(filters.startDate).toISOString())
                .lte('data_entrega', new Date(filters.endDate).toISOString());

            const { data, error } = await query;
            if (error) throw error;
            setDeliveries(data || []);
        } catch (error) {
            console.error("Error fetching deliveries:", error);
            toast({ variant: "destructive", title: "Erro ao carregar entregas", description: error.message });
        } finally {
            setLoading(false);
        }
    };
    fetchDeliveries();
  }, [filters.startDate, filters.endDate, toast]);

  const getClientData = (item) => {
      return {
          nome: item.cliente?.nome || item.cliente_nome || 'Cliente Desconhecido',
          endereco: item.endereco || item.check_in_address || 'Endereço não informado',
          email: item.cliente?.email,
          telefone: item.cliente?.telefone
      };
  };

  const processedData = useMemo(() => {
    let result = [...deliveries];
    if (filters.searchTerm) {
        const lowerTerm = filters.searchTerm.toLowerCase();
        result = result.filter(item => {
            const clientData = getClientData(item);
            return item.id?.toLowerCase().includes(lowerTerm) ||
                   clientData.nome.toLowerCase().includes(lowerTerm) ||
                   item.venda_num_docto?.toLowerCase().includes(lowerTerm);
        });
    }
    if (filters.status !== 'all') {
        result = result.filter(item => item.status === filters.status);
    }
    if (filters.driverId !== 'all') {
        result = result.filter(item => item.motorista_id === filters.driverId);
    }
    if (sortConfig.key) {
        result.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (sortConfig.key === 'cliente_nome') {
                aVal = getClientData(a).nome;
                bVal = getClientData(b).nome;
            }
            if (sortConfig.key === 'motorista_nome') {
                aVal = a.motorista?.nome || '';
                bVal = b.motorista?.nome || '';
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return result;
  }, [deliveries, filters, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSaveDelivery = async (data) => {
    try {
        if (modals.createEdit.data) {
            const { error } = await supabase
                .from('entregas')
                .update(data)
                .eq('id', modals.createEdit.data.id);
            if (error) throw error;
            toast({ title: "Entrega atualizada com sucesso" });
        } else {
            const { error } = await supabase
                .from('entregas')
                .insert([{ ...data, created_at: new Date().toISOString() }]);
            if (error) throw error;
            toast({ title: "Entrega criada com sucesso" });
        }
        
        const { data: refreshedData } = await supabase
            .from('entregas')
            .select(`*, motorista:motoristas(id, nome), cliente:clientes(id, nome, email, telefone)`)
            .gte('data_entrega', new Date(filters.startDate).toISOString())
            .lte('data_entrega', new Date(filters.endDate).toISOString());
            
        if (refreshedData) setDeliveries(refreshedData);

        setModals(prev => ({ ...prev, createEdit: { open: false, data: null } }));
    } catch (error) {
        toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
    }
  };

  const handleAssignDriver = async (deliveryId, driverId) => {
    try {
        const { error } = await supabase
            .from('entregas')
            .update({ motorista_id: driverId === 'unassigned' ? null : driverId, status: driverId ? 'atribuido' : 'pendente' })
            .eq('id', deliveryId);
        
        if (error) throw error;
        
        setDeliveries(prev => prev.map(d => {
            if (d.id === deliveryId) {
                const driver = drivers.find(dr => dr.id === driverId);
                return { 
                    ...d, 
                    motorista_id: driverId === 'unassigned' ? null : driverId, 
                    motorista: driver ? { id: driver.id, nome: driver.nome } : null 
                };
            }
            return d;
        }));

        toast({ title: "Entregador atribuído" });
        setModals(prev => ({ ...prev, assign: { open: false, data: null } }));
    } catch (error) {
        toast({ variant: "destructive", title: "Erro ao atribuir", description: error.message });
    }
  };

  const handleCancelDelivery = async () => {
    const delivery = modals.cancel.data;
    if (!delivery) return;

    try {
        const { error } = await supabase
            .from('entregas')
            .update({ status: 'cancelado' })
            .eq('id', delivery.id);
        
        if (error) throw error;

        setDeliveries(prev => prev.map(d => d.id === delivery.id ? { ...d, status: 'cancelado' } : d));
        toast({ title: "Entrega cancelada" });
        setModals(prev => ({ ...prev, cancel: { open: false, data: null } }));
    } catch (error) {
        toast({ variant: "destructive", title: "Erro ao cancelar", description: error.message });
    }
  };

  return (
    <>
      <Helmet>
        <title>Gestão de Entregas | Costa Lavos</title>
      </Helmet>

      <div className="space-y-6 p-2 md:p-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#6B2C2C]">Gestão de Entregas</h1>
            <p className="text-muted-foreground text-sm">Controle operacional completo da frota e pedidos.</p>
          </div>
          <Button 
            onClick={() => setModals(prev => ({ ...prev, createEdit: { open: true, data: null } }))}
            className="bg-[#6B2C2C] hover:bg-[#5a2323] text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Entrega
          </Button>
        </div>

        <Card className="bg-slate-50/50 border-none">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="col-span-1 md:col-span-2">
                <Label className="text-xs font-medium mb-1.5 block">Busca</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="ID, Cliente ou NF..." 
                    value={filters.searchTerm} 
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))} 
                    className="pl-8 h-9 bg-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Status</Label>
                <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
                  <SelectTrigger className="h-9 bg-white"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block">Entregador</Label>
                <Select value={filters.driverId} onValueChange={(val) => setFilters(prev => ({ ...prev, driverId: val }))}>
                  <SelectTrigger className="h-9 bg-white"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                 <div className="flex-1">
                    <Label className="text-xs font-medium mb-1.5 block">Data Início</Label>
                    <Input type="date" value={filters.startDate} onChange={(e) => setFilters(prev => ({...prev, startDate: e.target.value}))} className="h-9 bg-white" />
                 </div>
                 <div className="flex-1">
                    <Label className="text-xs font-medium mb-1.5 block">Data Fim</Label>
                    <Input type="date" value={filters.endDate} onChange={(e) => setFilters(prev => ({...prev, endDate: e.target.value}))} className="h-9 bg-white" />
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardContent className="p-0">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-[#F5E6D3]/20">
                            <TableRow>
                                <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort('id')}>
                                    ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />)}
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('cliente_nome')}>
                                    Cliente {sortConfig.key === 'cliente_nome' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />)}
                                </TableHead>
                                <TableHead className="hidden md:table-cell">Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Entregador</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell>
                                </TableRow>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((row) => {
                                    const clientData = getClientData(row);
                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-mono text-xs">{row.id.slice(0,8)}...</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{clientData.nome}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={clientData.endereco}>
                                                        {clientData.endereco}
                                                    </span>
                                                    {clientData.telefone && <span className="text-[10px] text-muted-foreground">{clientData.telefone}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-xs">
                                                {format(parseISO(row.data_entrega), 'dd/MM/yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn("uppercase text-[10px]", STATUS_COLORS[row.status] || "bg-slate-100")}>
                                                    {row.status?.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {row.motorista ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">{row.motorista.nome}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Não atribuído</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setModals(prev => ({ ...prev, track: { open: true, data: row } }))}>
                                                            <MapPin className="mr-2 h-4 w-4" /> Rastrear
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setModals(prev => ({ ...prev, createEdit: { open: true, data: row } }))}>
                                                            <Edit className="mr-2 h-4 w-4" /> Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setModals(prev => ({ ...prev, assign: { open: true, data: row } }))}>
                                                            <Truck className="mr-2 h-4 w-4" /> Atribuir Entregador
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            onClick={() => setModals(prev => ({ ...prev, cancel: { open: true, data: row } }))}
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" /> Cancelar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Nenhuma entrega encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <div className="p-4 border-t flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages || 1} ({processedData.length} registros)
                </div>
                <div className="flex items-center gap-4">
                    <Select value={itemsPerPage.toString()} onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}>
                        <SelectTrigger className="w-[70px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ITEMS_PER_PAGE_OPTIONS.map(opt => (
                                <SelectItem key={opt} value={opt.toString()}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                            Anterior
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                            Próxima
                        </Button>
                    </div>
                </div>
            </div>
        </Card>

        {modals.createEdit.open && (
            <CreateEditDeliveryModal 
                isOpen={modals.createEdit.open}
                onClose={() => setModals(prev => ({ ...prev, createEdit: { open: false, data: null } }))}
                onSave={handleSaveDelivery}
                delivery={modals.createEdit.data}
                drivers={drivers}
                clients={clients}
            />
        )}

        {modals.assign.open && (
            <AssignDriverModal 
                isOpen={modals.assign.open}
                onClose={() => setModals(prev => ({ ...prev, assign: { open: false, data: null } }))}
                onAssign={handleAssignDriver}
                delivery={modals.assign.data}
                drivers={drivers}
            />
        )}

        {modals.track.open && (
            <TrackingModal 
                isOpen={modals.track.open}
                onClose={() => setModals(prev => ({ ...prev, track: { open: false, data: null } }))}
                delivery={modals.track.data}
            />
        )}

        {modals.cancel.open && (
            <CancelAlert 
                isOpen={modals.cancel.open}
                onClose={() => setModals(prev => ({ ...prev, cancel: { open: false, data: null } }))}
                onConfirm={handleCancelDelivery}
            />
        )}

      </div>
    </>
  );
};

export default DeliveriesManagement;