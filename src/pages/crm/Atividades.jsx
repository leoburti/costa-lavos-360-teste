
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpDown,
  LayoutList,
  List as ListIcon,
  Loader2,
  Briefcase,
  User
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, isFuture, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { cn } from '@/lib/utils';

export default function AtividadesPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, overdue, upcoming

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    description: '',
    contact_id: '',
    deal_id: '',
    due_date: '',
    priority: 'medium',
    status: 'pending'
  });

  const isEditing = !!formData.id;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [tasksRes, contactsRes, dealsRes] = await Promise.all([
        supabase
          .from('crm_tasks')
          .select(`
            *,
            crm_contacts (id, fantasy_name, corporate_name),
            crm_deals (id, title)
          `)
          .order('due_date', { ascending: true }),
        supabase
          .from('crm_contacts')
          .select('id, fantasy_name, corporate_name')
          .order('fantasy_name', { ascending: true })
          .limit(100),
        supabase
          .from('crm_deals')
          .select('id, title')
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (contactsRes.error) throw contactsRes.error;
      if (dealsRes.error) throw dealsRes.error;

      setTasks(tasksRes.data || []);
      setContacts(contactsRes.data || []);
      setDeals(dealsRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar",
        description: "Não foi possível carregar as atividades.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado');

      const payload = {
        title: formData.title,
        description: formData.description,
        contact_id: formData.contact_id || null,
        deal_id: formData.deal_id || null,
        due_date: formData.due_date || null,
        priority: formData.priority,
        status: formData.status,
        user_id: user.id
      };

      let error;
      if (isEditing) {
        const { error: updateError } = await supabase
          .from('crm_tasks')
          .update(payload)
          .eq('id', formData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('crm_tasks')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: isEditing ? "Atividade atualizada" : "Atividade criada",
        description: `A tarefa "${formData.title}" foi salva com sucesso.`,
      });

      setIsDialogOpen(false);
      fetchInitialData();
      resetForm();

    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a atividade.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      const { error } = await supabase
        .from('crm_tasks')
        .delete()
        .eq('id', taskToDelete.id);

      if (error) throw error;

      toast({
        title: "Atividade excluída",
        description: "O registro foi removido permanentemente.",
      });
      
      setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir a atividade.",
      });
    } finally {
      setTaskToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      description: '',
      contact_id: '',
      deal_id: '',
      due_date: '',
      priority: 'medium',
      status: 'pending'
    });
  };

  const openEditDialog = (task) => {
    setFormData({
      id: task.id,
      title: task.title,
      description: task.description || '',
      contact_id: task.contact_id || '',
      deal_id: task.deal_id || '',
      due_date: task.due_date ? task.due_date.slice(0, 16) : '', // Format for datetime-local
      priority: task.priority || 'medium',
      status: task.status || 'pending'
    });
    setIsDialogOpen(true);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.crm_contacts?.fantasy_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.crm_contacts?.corporate_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      let matchesDate = true;
      if (dateFilter !== 'all' && task.due_date) {
        const date = parseISO(task.due_date);
        if (dateFilter === 'today') matchesDate = isToday(date);
        else if (dateFilter === 'overdue') matchesDate = isPast(date) && !isToday(date);
        else if (dateFilter === 'upcoming') matchesDate = isFuture(date) || isToday(date);
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, dateFilter]);

  // Helper for Priority Badge
  const getPriorityBadge = (priority) => {
    const styles = {
      high: "bg-red-100 text-red-700 border-red-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      low: "bg-blue-100 text-blue-700 border-blue-200"
    };
    const labels = { high: 'Alta', medium: 'Média', low: 'Baixa' };
    return (
      <Badge variant="outline" className={cn("font-normal capitalize", styles[priority] || styles.medium)}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  // Helper for Status Badge
  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-slate-100 text-slate-700 border-slate-200",
      'in_progress': "bg-sky-100 text-blue-700 border-sky-200",
      cancelled: "bg-gray-100 text-gray-500 border-gray-200"
    };
    const labels = { completed: 'Concluída', pending: 'Pendente', 'in_progress': 'Em Andamento', cancelled: 'Cancelada' };
    return (
      <Badge variant="outline" className={cn("font-normal", styles[status] || styles.pending)}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6 pb-16 animate-in fade-in duration-500">
      <Helmet>
        <title>Atividades | CRM Costa Lavos</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Atividades</h1>
          <p className="text-slate-500 mt-1">Gerencie tarefas, reuniões e acompanhamentos.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Nova Atividade
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Buscar atividades..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <AlertCircle className="mr-2 h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px]">
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                  <SelectValue placeholder="Data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Qualquer Data</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="overdue">Atrasadas</SelectItem>
                  <SelectItem value="upcoming">Próximas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content View */}
      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <ListIcon className="h-4 w-4" /> Lista
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <LayoutList className="h-4 w-4" /> Timeline
            </TabsTrigger>
          </TabsList>
          <div className="text-sm text-slate-500">
            {filteredTasks.length} atividade(s) encontrada(s)
          </div>
        </div>

        <TabsContent value="table">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[300px]">Título</TableHead>
                    <TableHead>Relacionado a</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                          <Loader2 className="h-5 w-5 animate-spin" /> Carregando...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                        Nenhuma atividade encontrada com os filtros atuais.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id} className="group hover:bg-slate-50/50">
                        <TableCell>
                          <div className="font-medium text-slate-900">{task.title}</div>
                          {task.description && (
                            <div className="text-xs text-slate-500 truncate max-w-[250px]">{task.description}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {task.crm_contacts && (
                              <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                <User className="h-3.5 w-3.5 text-slate-400" />
                                {task.crm_contacts.fantasy_name || task.crm_contacts.corporate_name}
                              </div>
                            )}
                            {task.crm_deals && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Briefcase className="h-3 w-3 text-slate-400" />
                                {task.crm_deals.title}
                              </div>
                            )}
                            {!task.crm_contacts && !task.crm_deals && (
                              <span className="text-xs text-slate-400 italic">Sem vínculo</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {task.due_date ? (
                            <div className={cn(
                              "flex items-center gap-1.5 text-sm",
                              isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date)) && task.status !== 'completed' 
                                ? "text-red-600 font-medium" 
                                : "text-slate-600"
                            )}>
                              <CalendarIcon className="h-3.5 w-3.5" />
                              {format(parseISO(task.due_date), "dd/MM/yyyy HH:mm")}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditDialog(task)}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onSelect={() => setTaskToDelete(task)}
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
        </TabsContent>

        <TabsContent value="timeline">
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {loading ? (
               <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
            ) : filteredTasks.length === 0 ? (
               <div className="text-center p-8 text-slate-500 bg-white rounded-lg border border-slate-200">Nenhuma atividade para exibir na timeline.</div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Icon Indicator */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isPast(parseISO(task.due_date || new Date().toISOString())) ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  
                  {/* Content Card */}
                  <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-1">
                      <time className="font-mono text-xs text-slate-500 mb-1 block">
                        {task.due_date ? format(parseISO(task.due_date), "dd 'de' MMM, HH:mm", { locale: ptBR }) : 'Sem data'}
                      </time>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <div className="font-bold text-slate-800 text-lg">{task.title}</div>
                    <div className="text-slate-600 text-sm mb-3">
                      {task.description || 'Sem descrição.'}
                    </div>
                    
                    {(task.crm_contacts || task.crm_deals) && (
                      <div className="pt-3 border-t border-slate-100 flex flex-col gap-1 text-xs text-slate-500">
                        {task.crm_contacts && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.crm_contacts.fantasy_name || task.crm_contacts.corporate_name}
                          </div>
                        )}
                        {task.crm_deals && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {task.crm_deals.title}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end gap-2">
                       <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEditDialog(task)}>
                         Editar
                       </Button>
                    </div>
                  </Card>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes da tarefa ou compromisso.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="col-span-3"
                  placeholder="Ex: Reunião de apresentação"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Detalhes adicionais..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Vincular Contato</Label>
                <div className="col-span-3">
                  <Select 
                    value={formData.contact_id} 
                    onValueChange={(value) => setFormData({ ...formData, contact_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um contato (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_contact">-- Nenhum --</SelectItem>
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
                <Label className="text-right">Vincular Oportunidade</Label>
                <div className="col-span-3">
                  <Select 
                    value={formData.deal_id} 
                    onValueChange={(value) => setFormData({ ...formData, deal_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma oportunidade (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_deal">-- Nenhuma --</SelectItem>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <Label className="mb-2 block">Data/Hora</Label>
                  <Input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label className="mb-2 block">Prioridade</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <div className="col-span-3">
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status da atividade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
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
                {isEditing ? 'Salvar Alterações' : 'Criar Atividade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a atividade "{taskToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
