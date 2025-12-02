import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { useEquipmentMock } from '@/hooks/useEquipmentMock';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Eye, Wrench } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ManutencoesList = () => {
  const { maintenances, loading } = useEquipmentMock();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const filteredData = useMemo(() => {
    return maintenances.filter(m => {
      const matchesSearch = 
        m.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
        m.technician.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [maintenances, search, statusFilter]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'concluida': return 'bg-emerald-100 text-emerald-700';
      case 'pendente': return 'bg-amber-100 text-amber-700';
      case 'agendada': return 'bg-blue-100 text-blue-700';
      case 'cancelada': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Manutenções | Costa Lavos</title>
      </Helmet>

      <PageHeader 
        title="Manutenções" 
        description="Histórico e agendamento de manutenções preventivas e corretivas."
        breadcrumbs={[{ label: 'Equipamentos', path: '/equipamentos' }, { label: 'Manutenções' }]}
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Manutenção
          </Button>
        }
      />

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Buscar por equipamento ou técnico..." 
                    className="pl-8" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="agendada">Agendada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
            </Select>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
            <TableHeader className="bg-slate-50">
                <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : filteredData.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                            Nenhuma manutenção encontrada.
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="font-medium">{formatDate(item.date)}</TableCell>
                            <TableCell>{item.equipmentName}</TableCell>
                            <TableCell className="capitalize">{item.type}</TableCell>
                            <TableCell>{item.technician}</TableCell>
                            <TableCell className="text-right font-mono text-slate-600">{formatCurrency(item.cost)}</TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(item.status)}>
                                    {item.status.toUpperCase()}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Eye className="h-4 w-4 text-slate-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ManutencoesList;