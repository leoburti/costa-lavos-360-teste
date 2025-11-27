import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Search, Filter, Plus, Eye, MessageSquare, CheckCircle, XCircle, 
  MoreVertical, DollarSign, User, Truck 
} from 'lucide-react';
import { format } from 'date-fns';

import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Constants & Helpers ---
const STATUS_COLORS = {
  'aberto': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200',
  'em_analise': 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200',
  'resolvido': 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200',
  'rejeitado': 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200',
};

const PRIORITY_COLORS = {
  'baixa': 'bg-slate-100 text-slate-700 border-slate-200',
  'media': 'bg-orange-50 text-orange-700 border-orange-200',
  'alta': 'bg-orange-100 text-orange-800 border-orange-300',
  'urgente': 'bg-red-100 text-red-800 border-red-300 animate-pulse',
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// --- Components ---

const StatusBadge = ({ status }) => {
  const normalized = status?.toLowerCase().replace(' ', '_') || 'aberto';
  const label = status?.replace('_', ' ').toUpperCase() || 'ABERTO';
  return (
    <Badge variant="outline" className={`${STATUS_COLORS[normalized] || STATUS_COLORS['aberto']}`}>
      {label}
    </Badge>
  );
};

const PriorityBadge = ({ priority }) => {
  const normalized = priority?.toLowerCase() || 'media';
  return (
    <Badge variant="outline" className={`${PRIORITY_COLORS[normalized] || PRIORITY_COLORS['media']}`}>
      {priority?.toUpperCase()}
    </Badge>
  );
};

const DisputesManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [priorityFilter, setPriorityFilter] = useState('todos');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewModalData, setViewModalData] = useState(null);
  const [resolveModalData, setResolveModalData] = useState(null);
  const [rejectModalData, setRejectModalData] = useState(null);
  const [commentModalData, setCommentModalData] = useState(null);

  // Data for forms
  const [clients, setClients] = useState([]);
  
  const fetchDisputes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('contestacoes')
        .select(`
          *,
          cliente:clientes(id, nome, cnpj),
          entrega:entregas(id, data_entrega)
        `, { count: 'exact' });

      // Filters
      if (statusFilter !== 'todos') query = query.eq('status', statusFilter);
      if (priorityFilter !== 'todos') query = query.eq('priority', priorityFilter);
      if (dateRange.start) query = query.gte('created_at', `${dateRange.start}T00:00:00`);
      if (dateRange.end) query = query.lte('created_at', `${dateRange.end}T23:59:59`);
      
      if (searchTerm) {
        // Simple search logic
        if (searchTerm.includes('-')) { // UUID-like check
           query = query.or(`id.eq.${searchTerm},client_id.eq.${searchTerm}`);
        } else {
           query = query.ilike('description', `%${searchTerm}%`); 
        }
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;
      setDisputes(data || []);
      setTotalItems(count || 0);

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro ao carregar', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    const { data } = await supabase.from('clientes').select('id, nome').limit(100);
    setClients(data || []);
  };

  useEffect(() => {
    fetchDisputes();
    fetchClients();
  }, [page, pageSize, statusFilter, priorityFilter, dateRange]); // Refetch on filter change

  // --- Actions ---

  const handleCreateDispute = async (data) => {
    try {
      const { error } = await supabase.from('contestacoes').insert([{
        ...data,
        status: 'aberto',
        created_at: new Date()
      }]);
      
      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Contestação criada com sucesso.' });
      setIsCreateModalOpen(false);
      fetchDisputes();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  };

  const handleResolveDispute = async (id, notes, refund) => {
    try {
      const { error } = await supabase.from('contestacoes').update({
        status: 'resolvido',
        resolution_notes: notes,
        refund_amount: refund,
        updated_at: new Date()
      }).eq('id', id);

      if (error) throw error;

      await addHistoryLog(id, 'resolucao', { notes, refund });
      
      toast({ title: 'Resolvido', description: 'Contestação marcada como resolvida.' });
      setResolveModalData(null);
      fetchDisputes();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  };

  const handleRejectDispute = async (id, reason) => {
    try {
      const { error } = await supabase.from('contestacoes').update({
        status: 'rejeitado',
        resolution_notes: reason,
        updated_at: new Date()
      }).eq('id', id);

      if (error) throw error;

      await addHistoryLog(id, 'rejeicao', { reason });

      toast({ title: 'Rejeitado', description: 'Contestação rejeitada.' });
      setRejectModalData(null);
      fetchDisputes();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  };

  const handleAddComment = async (id, comment) => {
    try {
        await addHistoryLog(id, 'comentario', { message: comment });
        toast({ title: 'Comentário adicionado' });
        setCommentModalData(null);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message });
    }
  };

  const addHistoryLog = async (contestacaoId, action, details) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('contestacao_historico').insert([{
      contestacao_id: contestacaoId,
      user_id: user?.id,
      action,
      details
    }]);
  };

  return (
    <>
      <Helmet>
        <title>Gestão de Contestações | Admin</title>
      </Helmet>
      
      <div className="space-y-6 p-2 md:p-6 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#6B2C2C] tracking-tight">Gerenciamento de Contestações</h1>
            <p className="text-muted-foreground text-sm">Gerencie e resolva problemas reportados por clientes e motoristas.</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#6B2C2C] hover:bg-[#501f1f] text-white">
            <Plus className="mr-2 h-4 w-4" /> Nova Contestação
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por ID ou Descrição..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas Prioridades</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>

              <Input 
                type="date" 
                value={dateRange.start} 
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} 
                className="w-full"
              />
              <div className="flex gap-2">
                <Input 
                    type="date" 
                    value={dateRange.end} 
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} 
                    className="w-full"
                />
                <Button variant="outline" size="icon" onClick={fetchDisputes} title="Atualizar">
                    <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo / Descrição</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <LoadingSpinner />
                  </TableCell>
                </TableRow>
              ) : disputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhuma contestação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                disputes.map((dispute) => (
                  <TableRow key={dispute.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-xs">{dispute.id.slice(0,8)}...</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{dispute.cliente?.nome || 'Cliente não identificado'}</span>
                        <span className="text-xs text-muted-foreground">{dispute.cliente?.cnpj || 'CPF/CNPJ N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col max-w-[250px]">
                            <span className="font-medium text-xs uppercase text-[#6B2C2C]">{dispute.type || 'Geral'}</span>
                            <span className="text-sm truncate" title={dispute.description}>{dispute.description}</span>
                        </div>
                    </TableCell>
                    <TableCell><PriorityBadge priority={dispute.priority} /></TableCell>
                    <TableCell><StatusBadge status={dispute.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(dispute.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setViewModalData(dispute)}>
                            <Eye className="mr-2 h-4 w-4" /> Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setCommentModalData(dispute)}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Comentar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setResolveModalData(dispute)} disabled={['resolvido', 'rejeitado'].includes(dispute.status)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Resolver
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRejectModalData(dispute)} disabled={['resolvido', 'rejeitado'].includes(dispute.status)}>
                            <XCircle className="mr-2 h-4 w-4 text-red-600" /> Rejeitar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t bg-slate-50">
            <div className="text-sm text-muted-foreground">
              Total: {totalItems} contestações
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Por página:</span>
              <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                <SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1 ml-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Ant.</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p+1)} disabled={disputes.length < pageSize}>Próx.</Button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- Modals --- */}

      {/* Create Modal */}
      <CreateDisputeModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
        onSubmit={handleCreateDispute}
        clients={clients}
      />

      {/* View Details Modal */}
      {viewModalData && (
        <ViewDisputeModal 
          dispute={viewModalData} 
          open={!!viewModalData} 
          onOpenChange={(v) => !v && setViewModalData(null)} 
        />
      )}

      {/* Resolve Modal */}
      {resolveModalData && (
        <ResolveDisputeModal 
          dispute={resolveModalData}
          open={!!resolveModalData}
          onOpenChange={(v) => !v && setResolveModalData(null)}
          onConfirm={handleResolveDispute}
        />
      )}

      {/* Reject Modal */}
      {rejectModalData && (
        <RejectDisputeModal 
          dispute={rejectModalData}
          open={!!rejectModalData}
          onOpenChange={(v) => !v && setRejectModalData(null)}
          onConfirm={handleRejectDispute}
        />
      )}

      {/* Comment Modal */}
      {commentModalData && (
        <CommentModal 
          dispute={commentModalData}
          open={!!commentModalData}
          onOpenChange={(v) => !v && setCommentModalData(null)}
          onConfirm={handleAddComment}
        />
      )}
    </>
  );
};

// --- Sub-components (Modals) ---

const CreateDisputeModal = ({ open, onOpenChange, onSubmit, clients }) => {
  const [formData, setFormData] = useState({
    client_id: '', type: 'entrega_atrasada', priority: 'media', description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ client_id: '', type: 'entrega_atrasada', priority: 'media', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Contestação</DialogTitle>
          <DialogDescription>Registre uma nova contestação ou reclamação.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select onValueChange={(val) => setFormData({...formData, client_id: val})} required>
              <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrega_atrasada">Entrega Atrasada</SelectItem>
                  <SelectItem value="produto_danificado">Produto Danificado</SelectItem>
                  <SelectItem value="falta_item">Falta de Item</SelectItem>
                  <SelectItem value="cobranca_indevida">Cobrança Indevida</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição Detalhada</Label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              placeholder="Descreva o problema..." 
              rows={4}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="bg-[#6B2C2C] text-white hover:bg-[#501f1f]">Criar Contestação</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ViewDisputeModal = ({ dispute, open, onOpenChange }) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (open && dispute?.id) {
      setLoadingHistory(true);
      supabase.from('contestacao_historico')
        .select('*, usuario:users!user_id(full_name)')
        .eq('contestacao_id', dispute.id)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          setHistory(data || []);
          setLoadingHistory(false);
        });
    }
  }, [open, dispute]);

  if (!dispute) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Contestação #{dispute.id.slice(0,6)}
            <StatusBadge status={dispute.status} />
          </DialogTitle>
          <DialogDescription>Detalhes completos e histórico.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-6 py-4">
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Cliente</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 font-bold"><User className="h-4 w-4" /> {dispute.cliente?.nome}</div>
                  <div className="text-xs text-muted-foreground mt-1">CNPJ: {dispute.cliente?.cnpj}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Entrega Ref.</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 font-medium"><Truck className="h-4 w-4" /> {dispute.delivery_id ? '#' + dispute.delivery_id.slice(0,8) : 'N/A'}</div>
                  {dispute.entrega?.data_entrega && <div className="text-xs text-muted-foreground mt-1">Data: {format(new Date(dispute.entrega.data_entrega), 'dd/MM/yyyy')}</div>}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h3 className="text-sm font-bold mb-2 uppercase text-muted-foreground">Descrição do Problema</h3>
              <p className="text-sm text-slate-800 whitespace-pre-wrap">{dispute.description}</p>
            </div>

            {/* Resolution Info */}
            {(dispute.resolution_notes || dispute.refund_amount > 0) && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-sm font-bold mb-2 text-green-800 flex items-center gap-2"><CheckCircle className="h-4 w-4"/> Resolução</h3>
                {dispute.resolution_notes && <p className="text-sm text-slate-700 mb-2">{dispute.resolution_notes}</p>}
                {dispute.refund_amount > 0 && <Badge variant="outline" className="bg-white text-green-700 border-green-200">Reembolso: R$ {dispute.refund_amount}</Badge>}
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-bold mb-4 border-b pb-2">Histórico de Atividades</h3>
              {loadingHistory ? <LoadingSpinner /> : (
                <div className="space-y-4 pl-2 border-l-2 border-slate-100 ml-2">
                  {history.map((item) => (
                    <div key={item.id} className="relative pl-6 pb-2">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>
                      <div className="flex justify-between items-start text-xs mb-1">
                        <span className="font-bold text-slate-700">{item.usuario?.full_name || 'Usuário'}</span>
                        <span className="text-muted-foreground">{format(new Date(item.created_at), 'dd/MM/yy HH:mm')}</span>
                      </div>
                      <div className="text-sm text-slate-600 bg-white p-2 rounded border shadow-sm">
                        {item.action === 'comentario' && <p>{item.details?.message}</p>}
                        {item.action === 'resolucao' && <p className="text-green-700 font-medium">Resolveu a contestação.</p>}
                        {item.action === 'rejeicao' && <p className="text-red-700 font-medium">Rejeitou a contestação.</p>}
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && <p className="text-xs text-muted-foreground pl-6">Nenhuma atividade registrada.</p>}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const ResolveDisputeModal = ({ dispute, open, onOpenChange, onConfirm }) => {
  const [notes, setNotes] = useState('');
  const [refund, setRefund] = useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolver Contestação</DialogTitle>
          <DialogDescription>Finalize a contestação aceitando-a. Você pode registrar um reembolso se necessário.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Notas de Resolução</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Explique como foi resolvido..." required />
          </div>
          <div className="space-y-2">
            <Label>Valor de Reembolso (Opcional)</Label>
            <div className="relative">
              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="number" value={refund} onChange={e => setRefund(e.target.value)} className="pl-8" placeholder="0.00" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onConfirm(dispute.id, notes, refund)} className="bg-green-600 hover:bg-green-700 text-white">Confirmar Resolução</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const RejectDisputeModal = ({ dispute, open, onOpenChange, onConfirm }) => {
  const [reason, setReason] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-700">Rejeitar Contestação</DialogTitle>
          <DialogDescription>Indique o motivo pelo qual esta contestação está sendo rejeitada.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Motivo da Rejeição</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Justifique a rejeição..." required />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onConfirm(dispute.id, reason)} variant="destructive">Confirmar Rejeição</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const CommentModal = ({ dispute, open, onOpenChange, onConfirm }) => {
  const [comment, setComment] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Comentário</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Escreva seu comentário interno ou resposta..." rows={4} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onConfirm(dispute.id, comment)} disabled={!comment.trim()}>Enviar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisputesManagement;