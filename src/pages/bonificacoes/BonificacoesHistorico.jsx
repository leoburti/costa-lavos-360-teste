import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBonificationMock } from '@/hooks/useBonificationMock';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Download, Search, Filter, FileText } from 'lucide-react';
import PageSkeleton from '@/components/PageSkeleton';

const BonificacoesHistorico = () => {
  const { loading, historyData } = useBonificationMock();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const filteredData = useMemo(() => {
    return historyData.filter(item => {
      const matchesSearch = item.seller.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [historyData, searchTerm, statusFilter]);

  const getStatusVariant = (status) => {
    switch(status) {
        case 'pago': return 'success'; // Using custom variant defined in badge.jsx or default
        case 'pendente': return 'warning';
        case 'cancelado': return 'destructive';
        default: return 'secondary';
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Histórico de Bonificações | Costa Lavos</title>
      </Helmet>

      <PageHeader 
        title="Histórico de Pagamentos" 
        description="Registro completo de todas as bonificações processadas."
        breadcrumbs={[{ label: 'Bonificações', path: '/bonificacoes' }, { label: 'Histórico' }]}
        actions={
            <div className="flex gap-2">
                <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
            </div>
        }
      />

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Buscar por vendedor..." 
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                            <SelectItem value="pago">Pago</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Vendedor</TableHead>
                            <TableHead>Período Ref.</TableHead>
                            <TableHead className="text-right">Valor Bruto</TableHead>
                            <TableHead className="text-right">Impostos</TableHead>
                            <TableHead className="text-right">Valor Líquido</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Nenhum registro encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50">
                                    <TableCell>{formatDate(item.date)}</TableCell>
                                    <TableCell className="font-medium">{item.seller}</TableCell>
                                    <TableCell>{item.period}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.grossValue)}</TableCell>
                                    <TableCell className="text-right text-rose-600">-{formatCurrency(item.taxValue)}</TableCell>
                                    <TableCell className="text-right font-bold text-emerald-600">{formatCurrency(item.netValue)}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(item.status)} className="capitalize">
                                            {item.status}
                                        </Badge>
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

export default BonificacoesHistorico;