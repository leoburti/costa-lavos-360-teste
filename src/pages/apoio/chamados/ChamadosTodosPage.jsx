import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Search, X, Loader2, MoreHorizontal } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useChamados } from '@/hooks/useChamados';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const ChamadosTodosPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { fetchChamados, loading, deleteChamado, loading: deleteLoading } = useChamados();
  const [chamados, setChamados] = useState([]);
  
  // Initialize filters from URL search params
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'todos', 
    tipo: 'todos', 
    prioridade: 'todos', 
    data_inicio: null, 
    data_fim: null, 
    search: ''
  });
  const [chamadoToDelete, setChamadoToDelete] = useState(null);

  const getStatusVariant = (status) => {
    const variants = {
      aberto: 'destructive',
      atribuido: 'warning',
      em_andamento: 'warning',
      resolvido: 'success',
      fechado: 'outline',
      cancelado: 'outline'
    };
    return variants[status] || 'secondary';
  };

  const getPrioridadeVariant = (prioridade) => {
    const variants = {
      critica: 'destructive',
      alta: 'warning',
      media: 'default',
      baixa: 'outline'
    };
    return variants[prioridade] || 'secondary';
  };
  
  const fetchData = useCallback(async (currentFilters) => {
    // Convert 'todos' back to null for the API call
    const apiFilters = {
      ...currentFilters,
      status: currentFilters.status === 'todos' ? null : currentFilters.status,
      tipo: currentFilters.tipo === 'todos' ? null : currentFilters.tipo,
      prioridade: currentFilters.prioridade === 'todos' ? null : currentFilters.prioridade,
    };
    const data = await fetchChamados(apiFilters);
    setChamados(data);
  }, [fetchChamados]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchData(filters);
    }, 500);
    return () => clearTimeout(debounce);
  }, [filters, fetchData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Update URL for status filter to support bookmarking/refreshing
    if (key === 'status') {
        if (value === 'todos') {
            searchParams.delete('status');
        } else {
            searchParams.set('status', value);
        }
        setSearchParams(searchParams);
    }
  };

  const clearFilters = () => {
    setFilters({ status: 'todos', tipo: 'todos', prioridade: 'todos', data_inicio: null, data_fim: null, search: '' });
    setSearchParams({});
  };
  
  const handleConfirmDelete = async () => {
    if (!chamadoToDelete) return;
    const success = await deleteChamado(chamadoToDelete.id);
    if (success) {
        setChamados(prev => prev.filter(c => c.id !== chamadoToDelete.id));
        setChamadoToDelete(null);
    }
  };
  
  const handleExport = () => {
    if (chamados.length === 0) {
      toast({ variant: 'destructive', title: 'Exportação Falhou', description: 'Não há dados para exportar.' });
      return;
    }
    const headers = ['ID', 'Cliente', 'Tipo', 'Motivo', 'Status', 'Prioridade', 'Data Criação', 'Data Limite', 'Atribuído a'];
    const rows = chamados.map(c => [
      c.id,
      c.cliente_nome || '',
      c.tipo_chamado || '',
      c.motivo || '',
      c.status || '',
      c.prioridade || '',
      c.data_criacao ? format(new Date(c.data_criacao), 'yyyy-MM-dd HH:mm:ss') : '',
      c.data_limite ? format(new Date(c.data_limite), 'yyyy-MM-dd') : '',
      c.profissional_nome || 'N/A'
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chamados_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Exportação Concluída', description: 'O arquivo CSV foi baixado.' });
  };

  const statusTabs = [
    { label: 'Todos', value: 'todos' },
    { label: 'Abertos', value: 'aberto' },
    { label: 'Em Andamento', value: 'em_andamento' },
    { label: 'Resolvidos', value: 'resolvido' },
    { label: 'Fechados', value: 'fechado' },
  ];

  return (
    <>
      <Helmet><title>Painel de Chamados - Apoio</title></Helmet>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Painel de Chamados</h1>
          <p className="text-muted-foreground mt-2">Gerencie e acompanhe todos os chamados do sistema.</p>
        </div>
        <Button onClick={() => navigate('/apoio/chamados/novo')} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Novo Chamado
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {statusTabs.map(tab => (
          <Badge 
            key={tab.value}
            variant={filters.status === tab.value ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/80 px-4 py-1 text-sm"
            onClick={() => handleFilterChange('status', tab.value)}
          >
            {tab.label}
          </Badge>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Refine a busca por chamados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por ID, cliente ou motivo..." className="pl-10" value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
            </div>
            <Select value={filters.status} onValueChange={v => handleFilterChange('status', v)}><SelectTrigger className="w-full lg:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent><SelectItem value="todos">Todos Status</SelectItem><SelectItem value="aberto">Aberto</SelectItem><SelectItem value="atribuido">Atribuído</SelectItem><SelectItem value="em_andamento">Em Andamento</SelectItem><SelectItem value="resolvido">Resolvido</SelectItem><SelectItem value="fechado">Fechado</SelectItem><SelectItem value="cancelado">Cancelado</SelectItem></SelectContent>
            </Select>
            <Select value={filters.tipo} onValueChange={v => handleFilterChange('tipo', v)}><SelectTrigger className="w-full lg:w-[180px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent><SelectItem value="todos">Todos Tipos</SelectItem><SelectItem value="troca">Troca</SelectItem><SelectItem value="retirada">Retirada</SelectItem><SelectItem value="entrega">Entrega</SelectItem><SelectItem value="manutencao">Manutenção</SelectItem><SelectItem value="suporte">Suporte</SelectItem><SelectItem value="visita">Visita Técnica</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent>
            </Select>
            <Select value={filters.prioridade} onValueChange={v => handleFilterChange('prioridade', v)}><SelectTrigger className="w-full lg:w-[180px]"><SelectValue placeholder="Prioridade" /></SelectTrigger>
              <SelectContent><SelectItem value="todos">Todas Prioridades</SelectItem><SelectItem value="baixa">Baixa</SelectItem><SelectItem value="media">Média</SelectItem><SelectItem value="alta">Alta</SelectItem><SelectItem value="critica">Crítica</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex flex-col md:flex-row gap-2 items-center">
              <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">{filters.data_inicio ? format(filters.data_inicio, "dd/MM/yy") : <span>Data Início</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.data_inicio} onSelect={d => handleFilterChange('data_inicio', d)} /></PopoverContent></Popover>
              <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">{filters.data_fim ? format(filters.data_fim, "dd/MM/yy") : <span>Data Fim</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={filters.data_fim} onSelect={d => handleFilterChange('data_fim', d)} /></PopoverContent></Popover>
              <Button variant="ghost" onClick={clearFilters} className="text-destructive hover:bg-destructive/10"><X className="w-4 h-4 mr-2" />Limpar</Button>
              <Button variant="outline" onClick={handleExport} className="ml-auto"><Download className="w-4 h-4 mr-2" />Exportar CSV</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader><CardTitle>Resultados</CardTitle></CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Cliente</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead>Prioridade</TableHead><TableHead>Criação</TableHead><TableHead>Atribuído a</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan="8" className="text-center p-8"><LoadingSpinner /></TableCell></TableRow>
                  ) : chamados.length === 0 ? (
                    <TableRow><TableCell colSpan="8" className="text-center p-8 text-muted-foreground">Nenhum chamado encontrado.</TableCell></TableRow>
                  ) : (
                    chamados.map(chamado => (
                      <TableRow key={chamado.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-primary hover:underline cursor-pointer" onClick={() => navigate(`/apoio/chamados/${chamado.id}`)}>{chamado.id.substring(0, 8)}</TableCell>
                        <TableCell>{chamado.cliente_nome}</TableCell>
                        <TableCell className="capitalize">{chamado.tipo_chamado}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(chamado.status)} className="capitalize">{chamado.status?.replace('_', ' ')}</Badge></TableCell>
                        <TableCell><Badge variant={getPrioridadeVariant(chamado.prioridade)} className="capitalize">{chamado.prioridade}</Badge></TableCell>
                        <TableCell>{format(new Date(chamado.data_criacao), 'dd/MM/yyyy HH:mm')}</TableCell>
                        <TableCell>{chamado.profissional_nome || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => navigate(`/apoio/chamados/${chamado.id}`)}>Detalhes</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate(`/apoio/chamados/${chamado.id}/editar`)}>Editar</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => setChamadoToDelete(chamado)}>Excluir</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      <AlertDialog open={!!chamadoToDelete} onOpenChange={() => setChamadoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o chamado #{chamadoToDelete?.id.substring(0,8)}? Esta ação não pode ser desfeita e removerá todos os comentários, anexos e histórico associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleteLoading} className="bg-destructive hover:bg-destructive/90">
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ChamadosTodosPage;