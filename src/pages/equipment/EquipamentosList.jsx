import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  History
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const StatusBadge = ({ status }) => {
  const styles = {
    ativo: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    manutencao: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    inativo: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    baixado: 'bg-red-100 text-red-700 hover:bg-red-200',
  };
  
  const labels = {
    ativo: 'Ativo',
    manutencao: 'Em Manutenção',
    inativo: 'Inativo',
    baixado: 'Baixado'
  };

  return (
    <Badge className={styles[status?.toLowerCase()] || styles.inativo}>
      {labels[status?.toLowerCase()] || status}
    </Badge>
  );
};

const EquipamentosList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,serial.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEquipments(data || []);
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar a lista de equipamentos."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipments();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
      try {
        const { error } = await supabase.from('equipment').delete().eq('id', id);
        if (error) throw error;
        
        setEquipments(prev => prev.filter(e => e.id !== id));
        toast({
          title: "Equipamento excluído",
          description: "O registro foi removido com sucesso.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: error.message
        });
      }
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Equipamentos | Costa Lavos</title>
      </Helmet>

      <PageHeader 
        title="Equipamentos" 
        description="Gerenciamento do inventário de ativos e equipamentos."
        breadcrumbs={[{ label: 'Dashboard', path: '/' }, { label: 'Equipamentos' }]}
        actions={
          <Link to="/equipment/novo">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Equipamento
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por nome, modelo ou série..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="manutencao">Em Manutenção</option>
            <option value="inativo">Inativo</option>
            <option value="baixado">Baixado</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold w-[250px]">Equipamento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Modelo / Série</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : equipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Nenhum equipamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              equipments.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{item.nome}</span>
                      <span className="text-xs text-slate-500">{item.fabricante || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.tipo || 'Geral'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{item.modelo}</span>
                      <span className="text-xs text-slate-500 font-mono">{item.serial}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{item.local || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/equipment/${item.id}`)}>
                          <Eye className="mr-2 h-4 w-4" /> Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/equipment/${item.id}/editar`)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/equipment/${item.id}/historico`)}>
                          <History className="mr-2 h-4 w-4" /> Histórico
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(item.id)}>
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
      </div>
    </div>
  );
};

export default EquipamentosList;