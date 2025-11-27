
import React, { useEffect, useState, useMemo } from 'react';
import { useFilters } from '@/contexts/FilterContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const EquipamentosEmCampo = () => {
  const { filters } = useFilters();
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Correct date access and formatting
  const dateRange = filters.dateRange || { from: startOfMonth(new Date()), to: endOfMonth(new Date()) };
  const startDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Debug Logs
  useEffect(() => {
    console.log('[EquipamentosEmCampo] Filters:', filters);
    console.log('[EquipamentosEmCampo] Dates:', { startDateStr, endDateStr });
  }, [filters, startDateStr, endDateStr]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Para equipamentos em campo, consultamos o inventário (bd_cl_inv)
        // Note: Inventário geralmente é um snapshot atual, mas podemos filtrar por data de venda/instalação se necessário.
        // Aqui vamos filtrar por Data_Venda para respeitar o período, assumindo que é a data de instalação.
        
        let query = supabase
          .from('bd_cl_inv')
          .select('*')
          .gte('Data_Venda', startDateStr)
          .lte('Data_Venda', endDateStr);

        if (filters.supervisors?.length > 0) query = query.in('Nome_Supervisor', filters.supervisors);
        if (filters.sellers?.length > 0) query = query.in('Nome_Vendedor', filters.sellers);
        if (filters.regions?.length > 0) query = query.in('REGIAO', filters.regions);
        if (filters.customerGroups?.length > 0) query = query.in('REDE', filters.customerGroups);
        
        const { data, error: supabaseError } = await query;

        if (supabaseError) throw supabaseError;
        setRawData(data || []);

      } catch (err) {
        console.error("Erro Inventário:", err);
        setError("Erro ao carregar inventário de equipamentos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, startDateStr, endDateStr]);

  const stats = useMemo(() => {
    if (!rawData.length) return { total: 0, active: 0, maintenance: 0, byType: {} };
    
    const byType = {};
    let total = 0;
    let active = 0;
    let maintenance = 0;

    rawData.forEach(item => {
      total++;
      const status = item.AA3_STATUS || 'Ativo';
      if (status === 'Ativo' || status === 'Instalado') active++;
      else maintenance++;

      const type = item.Equipamento || 'Outros';
      byType[type] = (byType[type] || 0) + 1;
    });

    return { total, active, maintenance, byType };
  }, [rawData]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Equipamentos em Campo</h1>
        <p className="text-muted-foreground mt-1">Visão do inventário instalado no período selecionado.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-slate-100 text-slate-600"><Package className="h-6 w-6" /></div>
            <div><p className="text-sm font-medium text-muted-foreground">Total Instalado</p><h3 className="text-2xl font-bold">{stats.total}</h3></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-6 w-6" /></div>
            <div><p className="text-sm font-medium text-muted-foreground">Ativos/Operacionais</p><h3 className="text-2xl font-bold">{stats.active}</h3></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600"><AlertCircle className="h-6 w-6" /></div>
            <div><p className="text-sm font-medium text-muted-foreground">Outros Status</p><h3 className="text-2xl font-bold">{stats.maintenance}</h3></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center"><LoadingSpinner /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Série / Chapa</TableHead>
                  <TableHead>Data Instalação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Localização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawData.slice(0, 100).map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.Fantasia}</span>
                        <span className="text-xs text-muted-foreground">{item.Loja_texto}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.Equipamento}</TableCell>
                    <TableCell>{item.AA3_CHAPA || 'N/D'}</TableCell>
                    <TableCell>{item.Data_Venda ? new Date(item.Data_Venda).toLocaleDateString('pt-BR') : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={item.AA3_STATUS === 'Ativo' ? 'default' : 'secondary'}>
                        {item.AA3_STATUS || 'Instalado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {item.REGIAO || 'N/D'}
                    </TableCell>
                  </TableRow>
                ))}
                {rawData.length === 0 && <TableRow><TableCell colSpan={6} className="text-center h-24 text-muted-foreground">Nenhum equipamento encontrado no período.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipamentosEmCampo;
