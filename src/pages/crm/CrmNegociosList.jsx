import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCRMMock } from '@/hooks/useCRMMock';
import { Plus, Search, Eye, Briefcase } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const CrmNegociosList = () => {
  const navigate = useNavigate();
  const { deals, loading } = useCRMMock();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeals = useMemo(() => {
    return deals.filter(d => 
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [deals, searchTerm]);

  const getStageBadge = (stage) => {
    const map = {
        'fechado': 'success',
        'negociacao': 'warning',
        'proposta': 'secondary',
        'qualificacao': 'secondary',
        'prospeccao': 'outline'
    };
    return map[stage] || 'outline';
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Negócios CRM | Costa Lavos</title></Helmet>
      
      <PageHeader 
        title="Lista de Negócios" 
        description="Acompanhamento de oportunidades e vendas em andamento."
        breadcrumbs={[{ label: 'CRM', path: '/crm/dashboard' }, { label: 'Negócios' }]}
        actions={
          <Button onClick={() => console.log('New Deal')}>
            <Plus className="mr-2 h-4 w-4" /> Novo Negócio
          </Button>
        }
      />

      <Card className="border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar negócio ou empresa..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Negócio</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Estágio</TableHead>
                <TableHead>Probabilidade</TableHead>
                <TableHead>Fechamento Previsto</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredDeals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Nenhum negócio encontrado.</TableCell>
                </TableRow>
              ) : (
                filteredDeals.map((deal) => (
                  <TableRow key={deal.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        {deal.title}
                    </TableCell>
                    <TableCell>{deal.company}</TableCell>
                    <TableCell className="font-mono text-slate-700 font-semibold">{formatCurrency(deal.value)}</TableCell>
                    <TableCell>
                      <Badge variant={getStageBadge(deal.stage)} className="capitalize">
                        {deal.stage}
                      </Badge>
                    </TableCell>
                    <TableCell>{deal.probability}%</TableCell>
                    <TableCell>{formatDate(deal.closingDate)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/crm/negocios/${deal.id}`)}>
                        <Eye className="h-4 w-4 text-slate-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrmNegociosList;