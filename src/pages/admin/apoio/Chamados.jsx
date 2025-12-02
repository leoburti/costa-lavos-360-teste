
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  User, 
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminChamadosPage() {
  const [loading, setLoading] = useState(true);
  const [chamados, setChamados] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    status: 'todos',
    search: '',
    prioridade: 'todas'
  });

  const fetchChamados = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('apoio_chamados')
        .select(`
          *,
          apoio_clientes_comodato (
            nome_fantasia,
            cnpj
          ),
          users_unified!profissional_sugerido_id (
            nome
          )
        `, { count: 'exact' });

      // Aplicar filtros
      if (filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.prioridade !== 'todas') {
        query = query.eq('prioridade', filters.prioridade);
      }

      if (filters.search) {
        // Busca textual simples no motivo ou nome do cliente (via join seria mais complexo, focando no motivo aqui)
        query = query.ilike('motivo', `%${filters.search}%`);
      }

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('data_criacao', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setChamados(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChamados();
  }, [page, pageSize, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Resetar para primeira página ao filtrar
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aberto': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'em_andamento': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'concluido': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'alta': return 'text-red-600 bg-red-50 border-red-100';
      case 'media': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'baixa': return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Gestão de Chamados | Costa Lavos 360</title>
      </Helmet>

      <PageHeader
        title="Gestão de Chamados"
        description="Visualize e gerencie todos os chamados de suporte técnico e comercial."
        breadcrumbs={[
          { label: 'Admin', path: '/admin' },
          { label: 'Apoio', path: '/admin/apoio' },
          { label: 'Chamados' }
        ]}
      />

      <Card>
        <CardContent className="p-6">
          {/* Barra de Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por motivo..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.prioridade} 
                onValueChange={(value) => handleFilterChange('prioridade', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <SelectValue placeholder="Prioridade" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Prioridades</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Atribuído a</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span>Carregando chamados...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : chamados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Nenhum chamado encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  chamados.map((chamado) => (
                    <TableRow key={chamado.id}>
                      <TableCell className="font-mono text-xs">
                        {chamado.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {chamado.apoio_clientes_comodato?.nome_fantasia || 'Cliente Desconhecido'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {chamado.apoio_clientes_comodato?.cnpj}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm line-clamp-1" title={chamado.motivo}>
                          {chamado.motivo}
                        </span>
                        <Badge variant="outline" className="mt-1 text-[10px] h-5 px-1.5">
                          {chamado.tipo_chamado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs capitalize ${getPrioridadeColor(chamado.prioridade)}`}
                        >
                          {chamado.prioridade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {chamado.users_unified?.nome || 'Não atribuído'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize border ${getStatusColor(chamado.status)}`} variant="secondary">
                          {chamado.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(chamado.data_criacao), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => console.log('Ver detalhes', chamado.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {chamados.length} de {totalCount} resultados
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => prev + 1)}
                disabled={(page * pageSize) >= totalCount || loading}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
