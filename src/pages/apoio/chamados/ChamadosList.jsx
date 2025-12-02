import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/apoio/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter, Eye, Edit } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const ChamadosList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('apoio_chamados')
        .select(`
          id,
          tipo_chamado,
          prioridade,
          status,
          motivo,
          data_atualizacao,
          cliente:apoio_clientes_comodato(nome_fantasia)
        `)
        .order('data_atualizacao', { ascending: false });

      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter);
      }

      if (search) {
        // Note: Supabase doesn't support simple OR across joined tables in one go easily without RPC or complex filters.
        // We'll filter by motivo or ID here for simplicity, or rely on client-side for complex text.
        // For production, an RPC `search_tickets` is recommended.
        query = query.ilike('motivo', `%${search}%`); 
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map to flatten structure
      const formatted = data.map(t => ({
        id: t.id,
        ticketNumber: t.id.substring(0, 8).toUpperCase(),
        title: t.motivo,
        client: t.cliente?.nome_fantasia || 'Cliente Desconhecido',
        category: t.tipo_chamado,
        priority: t.prioridade,
        status: t.status,
        updatedAt: t.data_atualizacao
      }));

      setTickets(formatted);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar lista de chamados."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Chamados de Suporte | Costa Lavos</title></Helmet>
      
      <PageHeader 
        title="Chamados de Suporte" 
        description="Central de gerenciamento de tickets e solicitações de clientes."
        breadcrumbs={[{ label: 'Apoio', path: '/apoio' }, { label: 'Chamados' }]}
        actions={
            <Button onClick={() => navigate('/apoio/chamados/novo')}>
                <Plus className="mr-2 h-4 w-4" /> Novo Chamado
            </Button>
        }
      />

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Buscar por motivo..." 
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="aberto">Aberto</SelectItem>
                            <SelectItem value="atribuido">Atribuído</SelectItem>
                            <SelectItem value="em_andamento">Em Andamento</SelectItem>
                            <SelectItem value="resolvido">Resolvido</SelectItem>
                            <SelectItem value="fechado">Fechado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Título / Cliente</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Prioridade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Atualizado em</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Nenhum chamado encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => (
                                <TableRow key={ticket.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-mono text-xs font-medium">{ticket.ticketNumber}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{ticket.title}</span>
                                            <span className="text-xs text-slate-500">{ticket.client}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{ticket.category?.replace('_', ' ')}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={ticket.priority} />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={ticket.status} />
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">{formatDate(ticket.updatedAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/apoio/chamados/${ticket.id}`)}>
                                                <Eye className="h-4 w-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => navigate(`/apoio/chamados/${ticket.id}/editar`)}>
                                                <Edit className="h-4 w-4 text-slate-500" />
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

export default ChamadosList;