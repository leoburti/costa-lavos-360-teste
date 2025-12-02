import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useDeliveryMock } from '@/hooks/useDeliveryMock';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Eye, Edit, MapPin } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const EntregasList = () => {
  const navigate = useNavigate();
  const { deliveries, loading } = useDeliveryMock();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
        const matchesSearch = 
            d.client.toLowerCase().includes(search.toLowerCase()) ||
            d.trackingId.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'todos' || d.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
  }, [deliveries, search, statusFilter]);

  const getStatusBadge = (status) => {
      const map = {
          'entregue': 'success',
          'em_rota': 'secondary',
          'pendente': 'outline',
          'cancelado': 'destructive',
          'falha': 'destructive'
      };
      return <Badge variant={map[status] || 'outline'} className="capitalize">{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Lista de Entregas | Delivery</title></Helmet>
      
      <PageHeader 
        title="Gestão de Entregas" 
        description="Acompanhe e gerencie todas as entregas em tempo real."
        breadcrumbs={[{ label: 'Delivery', path: '/entregas' }, { label: 'Entregas' }]}
        actions={
            <Button onClick={() => navigate('/entregas/nova')}>
                <Plus className="mr-2 h-4 w-4" /> Nova Entrega
            </Button>
        }
      />

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Buscar por cliente ou ID..." 
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="em_rota">Em Rota</SelectItem>
                            <SelectItem value="entregue">Entregue</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>ID Rastreio</TableHead>
                            <TableHead>Cliente / Endereço</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Motorista</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><div className="space-y-1"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-32" /></div></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredDeliveries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Nenhuma entrega encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDeliveries.map((delivery) => (
                                <TableRow key={delivery.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-mono text-xs font-medium">{delivery.trackingId}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{delivery.client}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[200px]" title={delivery.address}>{delivery.address}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{formatDate(delivery.date)}</TableCell>
                                    <TableCell className="text-sm text-slate-600">{delivery.driverName || 'N/A'}</TableCell>
                                    <TableCell className="text-sm font-medium">{formatCurrency(delivery.value)}</TableCell>
                                    <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/entregas/rastreamento`)} title="Rastrear">
                                                <MapPin className="h-4 w-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/entregas/${delivery.id}/editar`)} title="Editar">
                                                <Edit className="h-4 w-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/entregas/${delivery.id}`)} title="Detalhes">
                                                <Eye className="h-4 w-4 text-slate-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EntregasList;