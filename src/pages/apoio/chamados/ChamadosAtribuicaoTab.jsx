import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, UserCheck, Search, Users, AlertCircle, Calendar, AlertTriangle } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

export function ChamadosAtribuicaoTab() {
  const { user, userContext } = useAuth();
  const { toast } = useToast();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  
  // Form states for modal
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const [newPrioridade, setNewPrioridade] = useState("manter");
  const [newDataLimite, setNewDataLimite] = useState("");
  
  const [assigning, setAssigning] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("todos");
  const [typeFilter, setTypeFilter] = useState("todos");

  // Permissões
  const canAssign = useMemo(() => {
    const role = userContext?.role || '';
    const isSupervisor = userContext?.is_supervisor;
    // Verifica se é Admin, Nivel 1 ou Supervisor
    return ['Admin', 'Nivel 1'].includes(role) || isSupervisor;
  }, [userContext]);

  const fetchUnassignedTickets = async () => {
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
          data_criacao,
          data_limite,
          cliente:apoio_clientes_comodato(nome_fantasia, razao_social)
        `)
        .is('profissional_sugerido_id', null) // Apenas não atribuídos
        .in('status', ['aberto', 'em_andamento']) // Removed 'pendente' as it's not a valid enum value
        .order('data_criacao', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Erro ao buscar chamados:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar chamados não atribuídos."
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      // Busca usuários ativos do módulo de apoio
      const { data, error } = await supabase
        .from('apoio_usuarios')
        .select('id, nome, email')
        .eq('status', 'ativo')
        .order('nome');

      if (error) throw error;
      setTechnicians(data || []);
    } catch (error) {
      console.error("Erro ao buscar técnicos:", error);
    }
  };

  useEffect(() => {
    if (canAssign) {
      fetchUnassignedTickets();
      fetchTechnicians();
    }
  }, [canAssign]);

  // Update modal inputs when selection changes (Single selection vs Bulk)
  useEffect(() => {
    if (selectedTicketIds.length === 1) {
      // Single selection: pre-fill with ticket data
      const ticket = tickets.find(t => t.id === selectedTicketIds[0]);
      if (ticket) {
        setNewPrioridade(ticket.prioridade || "media");
        setNewDataLimite(ticket.data_limite || "");
      }
    } else {
      // Bulk selection: reset to default (no change)
      setNewPrioridade("manter");
      setNewDataLimite("");
    }
  }, [selectedTicketIds, tickets, isAssignDialogOpen]);

  // Filtragem local
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = 
        (ticket.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.cliente?.nome_fantasia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.motivo || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'todos' || ticket.prioridade === priorityFilter;
      const matchesType = typeFilter === 'todos' || ticket.tipo_chamado === typeFilter;

      return matchesSearch && matchesPriority && matchesType;
    });
  }, [tickets, searchTerm, priorityFilter, typeFilter]);

  // Seleção
  const toggleSelection = (ticketId) => {
    setSelectedTicketIds(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTicketIds.length === filteredTickets.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(filteredTickets.map(t => t.id));
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedTechnicianId) return;
    
    // Validation: Date in past
    if (newDataLimite && isPast(parseISO(newDataLimite)) && !newDataLimite.includes(new Date().toISOString().split('T')[0])) {
        // Warning simple, continue logic but logged
        console.warn("Data limite no passado selecionada");
    }

    setAssigning(true);
    try {
      const technician = technicians.find(t => t.id === selectedTechnicianId);
      let successCount = 0;
      let failCount = 0;

      // Processamento em lote (serial para garantir ordem e tratamento de erros individual)
      for (const ticketId of selectedTicketIds) {
        try {
          // 1. Update attributes (Priority/SLA) if changed
          const updates = {};
          if (newPrioridade && newPrioridade !== 'manter') {
              updates.prioridade = newPrioridade;
          }
          if (newDataLimite) {
              updates.data_limite = newDataLimite;
          }

          if (Object.keys(updates).length > 0) {
              const { error: updateError } = await supabase
                  .from('apoio_chamados')
                  .update(updates)
                  .eq('id', ticketId);
              
              if (updateError) throw updateError;

              // Log changes in history
              if (updates.prioridade) {
                  await supabase.from('apoio_chamados_historico').insert({
                      chamado_id: ticketId,
                      status_anterior: 'alteracao_dados', 
                      status_novo: 'alteracao_dados',
                      usuario_id: userContext?.apoioId || user?.id,
                      motivo_alteracao: `Prioridade alterada para ${updates.prioridade} durante atribuição.`
                  });
              }
              if (updates.data_limite) {
                  await supabase.from('apoio_chamados_historico').insert({
                      chamado_id: ticketId,
                      status_anterior: 'alteracao_dados', 
                      status_novo: 'alteracao_dados',
                      usuario_id: userContext?.apoioId || user?.id,
                      motivo_alteracao: `Data Limite (SLA) definida para ${updates.data_limite} durante atribuição.`
                  });
              }
          }

          // 2. Call RPC de atribuição (Atualiza status, ID e histórico)
          const { error: rpcError } = await supabase.rpc('atribuir_profissional_chamado', {
            p_chamado_id: ticketId,
            p_profissional_id: selectedTechnicianId,
            p_usuario_id: userContext?.apoioId || user?.id // Tenta usar ID do perfil apoio, fallback auth id
          });

          if (rpcError) throw rpcError;

          // 3. Envia notificação
          await supabase.rpc('criar_notificacao_novo_chamado', {
            p_profissional_id: selectedTechnicianId,
            p_chamado_id: ticketId
          });

          successCount++;
        } catch (err) {
          console.error(`Falha ao atribuir chamado ${ticketId}:`, err);
          failCount++;
        }
      }

      toast({
        title: "Processamento Concluído",
        description: `${successCount} chamados atribuídos para ${technician?.nome}. ${failCount > 0 ? `${failCount} falharam.` : ''}`,
        variant: failCount > 0 ? "warning" : "default"
      });

      // Reset
      setIsAssignDialogOpen(false);
      setSelectedTicketIds([]);
      setSelectedTechnicianId("");
      setNewPrioridade("manter");
      setNewDataLimite("");
      fetchUnassignedTickets(); // Refresh list

    } catch (error) {
      console.error("Erro geral na atribuição:", error);
      toast({
        variant: "destructive",
        title: "Erro Crítico",
        description: "Ocorreu um erro ao processar a atribuição em massa."
      });
    } finally {
      setAssigning(false);
    }
  };

  if (!canAssign) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Acesso Restrito</h2>
        <p className="text-gray-500 mt-2">Você não tem permissão para acessar a atribuição de chamados. Contate um administrador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-[#6B2C2C]" />
                Atribuição de Chamados
              </CardTitle>
              <CardDescription>
                Gerencie a fila de espera e distribua chamados para a equipe técnica.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedTicketIds.length > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md animate-in slide-in-from-right-4">
                  <span className="text-sm font-medium text-amber-800">
                    {selectedTicketIds.length} selecionado(s)
                  </span>
                  <Button 
                    size="sm" 
                    onClick={() => setIsAssignDialogOpen(true)}
                    className="bg-[#6B2C2C] hover:bg-[#6B2C2C]/90 text-white h-8"
                  >
                    <UserCheck className="mr-2 h-3 w-3" /> Atribuir
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative md:col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar cliente, motivo ou ID..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Prioridades</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Tipos</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="preventiva">Preventiva</SelectItem>
                <SelectItem value="entrega">Entrega</SelectItem>
                <SelectItem value="retirada">Retirada</SelectItem>
                <SelectItem value="troca">Troca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={filteredTickets.length > 0 && selectedTicketIds.length === filteredTickets.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>SLA (Limite)</TableHead>
                  <TableHead>Aberto em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="mr-2 h-6 w-6 animate-spin inline text-[#6B2C2C]" />
                      <span className="text-muted-foreground">Carregando chamados...</span>
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Nenhum chamado pendente de atribuição encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedTicketIds.includes(ticket.id)}
                          onCheckedChange={() => toggleSelection(ticket.id)}
                          aria-label={`Selecionar chamado ${ticket.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium text-gray-500">
                        {ticket.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {ticket.cliente?.nome_fantasia || ticket.cliente?.razao_social || 'Cliente Desconhecido'}
                      </TableCell>
                      <TableCell className="capitalize text-gray-600">{ticket.tipo_chamado}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          ticket.prioridade === 'critica' ? 'border-red-500 text-red-600 bg-red-50' :
                          ticket.prioridade === 'alta' ? 'border-orange-500 text-orange-600 bg-orange-50' :
                          ticket.prioridade === 'media' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
                          'text-gray-600'
                        }>
                          {ticket.prioridade}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-gray-600" title={ticket.motivo}>
                        {ticket.motivo}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {ticket.data_limite ? (
                          <span className={cn(isPast(parseISO(ticket.data_limite)) ? "text-red-600 font-medium" : "")}>
                            {format(parseISO(ticket.data_limite), 'dd/MM/yyyy')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Não definido</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {ticket.data_criacao ? format(new Date(ticket.data_criacao), 'dd/MM HH:mm') : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Atribuição */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Atribuir Chamados</DialogTitle>
            <DialogDescription>
              {selectedTicketIds.length === 1 
                ? "Atribua o técnico e revise os detalhes do chamado selecionado."
                : `Defina o responsável para os ${selectedTicketIds.length} chamados selecionados.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Seleção de Técnico */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="technician" className="text-sm font-medium">Técnico Responsável <span className="text-red-500">*</span></Label>
                <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                  <SelectTrigger id="technician" className="h-10">
                    <SelectValue placeholder="Selecione um técnico..." />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Edição de Prioridade */}
              <div className="space-y-2">
                <Label htmlFor="prioridade" className="text-sm font-medium">Prioridade</Label>
                <Select value={newPrioridade} onValueChange={setNewPrioridade}>
                  <SelectTrigger id="prioridade" className="h-10">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTicketIds.length > 1 && (
                      <SelectItem value="manter" className="font-medium italic">
                        -- Manter Original --
                      </SelectItem>
                    )}
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Edição de Data Limite */}
              <div className="space-y-2">
                <Label htmlFor="dataLimite" className="text-sm font-medium">Data Limite (SLA)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="dataLimite" 
                    type="date" 
                    value={newDataLimite}
                    onChange={(e) => setNewDataLimite(e.target.value)}
                    className="pl-9 h-10"
                  />
                </div>
              </div>
            </div>
            
            {/* Alerts / Infos */}
            {newDataLimite && isPast(parseISO(newDataLimite)) && !newDataLimite.includes(new Date().toISOString().split('T')[0]) && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm font-semibold">Atenção: SLA Vencido</AlertTitle>
                <AlertDescription className="text-xs">
                  A data limite selecionada já passou. Isso pode impactar os indicadores de performance.
                </AlertDescription>
              </Alert>
            )}

            <Alert className="bg-blue-50 border-blue-200 py-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 text-xs flex items-center gap-1">
                O técnico selecionado receberá uma notificação com as atualizações.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} disabled={assigning}>
              Cancelar
            </Button>
            <Button 
              onClick={handleBulkAssign} 
              disabled={!selectedTechnicianId || assigning}
              className="bg-[#6B2C2C] hover:bg-[#6B2C2C]/90 text-white"
            >
              {assigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Atribuição'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}