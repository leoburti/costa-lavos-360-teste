
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  DollarSign,
  Calendar as CalendarIcon,
  Briefcase,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/lib/utils';

export default function OportunidadesPage() {
  const { toast } = useToast();
  const [deals, setDeals] = useState([]);
  const [stages, setStages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  
  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    contact_id: '',
    stage_id: '',
    value: '',
    probability: '',
    expected_close_date: '',
    status: 'open'
  });

  const isEditing = !!formData.id;

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [dealsResponse, stagesResponse, contactsResponse] = await Promise.all([
        supabase
          .from('crm_deals')
          .select(`
            *,
            crm_contacts (id, fantasy_name, corporate_name),
            crm_stages (id, name)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('crm_stages')
          .select('*')
          .order('order', { ascending: true }),
        supabase
          .from('crm_contacts')
          .select('id, fantasy_name, corporate_name')
          .order('fantasy_name', { ascending: true })
          .limit(100) // Limit for performance, ideally use async search for select
      ]);

      if (dealsResponse.error) throw dealsResponse.error;
      if (stagesResponse.error) throw stagesResponse.error;
      if (contactsResponse.error) throw contactsResponse.error;

      setDeals(dealsResponse.data || []);
      setStages(stagesResponse.data || []);
      setContacts(contactsResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as oportunidades. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        contact_id: formData.contact_id,
        stage_id: formData.stage_id,
        value: formData.value ? parseFloat(formData.value) : 0,
        probability: formData.probability ? parseFloat(formData.probability) : 0,
        expected_close_date: formData.expected_close_date || null,
        status: formData.status,
        owner_id: (await supabase.auth.getUser()).data.user?.id 
      };

      let error;
      if (isEditing) {
        const { error: updateError } = await supabase
          .from('crm_deals')
          .update(payload)
          .eq('id', formData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('crm_deals')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: isEditing ? "Oportunidade atualizada" : "Oportunidade criada",
        description: `A oportunidade "${formData.title}" foi salva com sucesso.`,
      });

      setIsDialogOpen(false);
      fetchInitialData(); // Refresh list
      resetForm();

    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a oportunidade.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('crm_deals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Oportunidade excluída",
        description: "O registro foi removido permanentemente.",
      });
      
      setDeals(prev => prev.filter(deal => deal.id !== id));
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir o registro.",
      });
    } finally {
      setDealToDelete(null);
    }
  };

  // Helper functions
  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      contact_id: '',
      stage_id: '',
      value: '',
      probability: '',
      expected_close_date: '',
      status: 'open'
    });
  };

  const openEditDialog = (deal) => {
    setFormData({
      id: deal.id,
      title: deal.title,
      contact_id: deal.contact_id,
      stage_id: deal.stage_id,
      value: deal.value,
      probability: deal.probability,
      expected_close_date: deal.expected_close_date,
      status: deal.status
    });
    setIsDialogOpen(true);
  };

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Memoized Filtered & Sorted Data
  const filteredDeals = useMemo(() => {
    let filtered = [...deals];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.title?.toLowerCase().includes(lowerTerm) ||
        deal.crm_contacts?.fantasy_name?.toLowerCase().includes(lowerTerm) ||
        deal.crm_contacts?.corporate_name?.toLowerCase().includes(lowerTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(deal => deal.status === statusFilter);
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [deals, searchTerm, statusFilter, sortConfig]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'won': return 'success';
      case 'lost': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'won': return 'Ganho';
      case 'lost': return 'Perdido';
      case 'open': return 'Aberto';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 p-6 pb-16 animate-in fade-in duration-500">
      <Helmet>
        <title>Oportunidades | CRM Costa Lavos</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Oportunidades</h1>
          <p className="text-slate-500 mt-1">Gerencie seu pipeline de vendas e acompanhe negociações.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Nova Oportunidade
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar por título ou cliente..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="open">Em Aberto</SelectItem>
                  <SelectItem value="won">Ganho</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[30%] cursor-pointer hover:bg-slate-100" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">Oportunidade <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort('value')}>
                  <div className="flex items-center gap-1">Valor <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="cursor-pointer hover:bg-slate-100" onClick={() => handleSort('expected_close_date')}>
                  <div className="flex items-center gap-1">Previsão <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" /> Carregando oportunidades...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    Nenhuma oportunidade encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeals.map((deal) => (
                  <TableRow key={deal.id} className="group hover:bg-slate-50/50">
                    <TableCell>
                      <div className="font-medium text-slate-900">{deal.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Briefcase className="h-3 w-3" />
                        {deal.crm_contacts?.fantasy_name || deal.crm_contacts?.corporate_name || 'Sem Cliente'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-700">{formatCurrency(deal.value)}</div>
                      <div className="text-xs text-slate-500">Prob: {deal.probability}%</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-normal">
                        {deal.crm_stages?.name || 'Não definido'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(deal.status)}>
                        {getStatusLabel(deal.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {deal.expected_close_date ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                          {format(new Date(deal.expected_close_date), 'dd/MM/yyyy')}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(deal)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600" 
                            onSelect={(e) => { e.preventDefault(); setDealToDelete(deal); }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Oportunidade' : 'Nova Oportunidade'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da oportunidade de venda abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Ex: Contrato Anual de Fornecimento"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">Cliente</Label>
                <div className="col-span-3">
                  <Select 
                    value={formData.contact_id} 
                    onValueChange={(value) => setFormData({ ...formData, contact_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.fantasy_name || contact.corporate_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stage" className="text-right">Estágio</Label>
                <div className="col-span-3">
                  <Select 
                    value={formData.stage_id} 
                    onValueChange={(value) => setFormData({ ...formData, stage_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estágio do funil" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">Valor (R$)</Label>
                <div className="col-span-3 relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="pl-9"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <Label className="mb-2 block">Probabilidade (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    placeholder="Ex: 50"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label className="mb-2 block">Previsão Fechamento</Label>
                  <Input
                    type="date"
                    value={formData.expected_close_date ? formData.expected_close_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <div className="col-span-3">
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status da Oportunidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Em Aberto</SelectItem>
                      <SelectItem value="won">Ganho (Fechado)</SelectItem>
                      <SelectItem value="lost">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar Alterações' : 'Criar Oportunidade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!dealToDelete} onOpenChange={(open) => !open && setDealToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a oportunidade <span className="font-bold">"{dealToDelete?.title}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(dealToDelete?.id)} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
