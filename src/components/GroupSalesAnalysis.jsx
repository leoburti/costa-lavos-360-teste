import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, AlertTriangle, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00';
const formatNumber = (value) => value != null ? value.toLocaleString('pt-BR') : '0';

const AnalysisTable = ({ data }) => {
    const formatMonth = (monthString) => {
        if (!monthString || !monthString.includes('-')) return 'Data Inválida';
        const [year, month] = monthString.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
    };

    return (
        <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10 min-w-[80px] font-bold">Mês</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Qtd. Total</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Receita Total</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Preço Médio Unit.</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Bonificação</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Equipamentos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="sticky left-0 bg-card z-10 font-medium capitalize">{formatMonth(row.month)}</TableCell>
                      <TableCell className="text-center">{formatNumber(row.total_quantity)}</TableCell>
                      <TableCell className="text-center">{formatCurrency(row.total_revenue)}</TableCell>
                      <TableCell className="text-center">{formatCurrency(row.avg_unit_price)}</TableCell>
                      <TableCell className="text-center">{formatCurrency(row.total_bonification)}</TableCell>
                      <TableCell className="text-center">{formatCurrency(row.total_equipment)}</TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
    );
};

const GroupSalesAnalysis = () => {
  const { filters } = useData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState([]);

  const fetchGroupData = useCallback(async () => {
    const selectedClients = filters.clients ? filters.clients.map(c => c.name) : null;
    const { data, error } = await supabase.rpc('get_group_sales_analysis', {
        p_level: 'customer_group',
        p_parent_key: null,
        p_supervisors: filters.supervisors,
        p_sellers: filters.sellers,
        p_customer_groups: filters.customerGroups,
        p_regions: filters.regions,
        p_clients: selectedClients,
        p_search_term: filters.searchTerm,
        p_exclude_employees: filters.excludeEmployees
    });

    if (error) {
      console.error(`Error fetching customer_group data:`, error);
      throw error;
    }
    return data;
  }, [filters]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const groups = await fetchGroupData();
        setAnalysisData(groups);
      } catch (e) {
        setError('Falha ao carregar a análise de vendas por grupo.');
        toast({
          variant: "destructive",
          title: "Erro de Carregamento",
          description: e.message
        });
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [fetchGroupData, toast]);

  const getTotalRevenue = (monthlyData) => monthlyData?.reduce((sum, month) => sum + month.total_revenue, 0) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Carregando análise de vendas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-destructive/10 rounded-lg m-4 min-h-[300px]">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="mt-4 text-destructive font-semibold">{error}</p>
      </div>
    );
  }
  
  if (!analysisData || analysisData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg m-4 min-h-[300px]">
            <p className="text-muted-foreground">Nenhum dado encontrado para os filtros selecionados.</p>
        </div>
      );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-0"
    >
      <Accordion type="multiple" className="space-y-2">
        {analysisData.map(group => (
            <AccordionItem value={group.key} key={group.key}>
                <AccordionTrigger className="hover:no-underline bg-card p-3 rounded-md hover:bg-muted/50 data-[state=open]:bg-muted/50">
                    <div className="flex-1 flex items-center justify-between text-left">
                        <div className="flex items-center gap-3">
                           <Users className="h-5 w-5 text-primary" />
                           <span className="font-bold text-primary truncate mr-4">{group.name}</span>
                        </div>
                        <Badge variant="default" className="font-bold">{formatCurrency(getTotalRevenue(group.monthly_data))}</Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="p-0 pt-2 pl-4 border-l-2 ml-5 border-dashed">
                    <div className="mb-4 bg-muted/20 border rounded-lg p-2 mt-2">
                        <h4 className="font-bold text-center text-sm mb-2 text-muted-foreground">CONSOLIDADO DO GRUPO</h4>
                        <AnalysisTable data={group.monthly_data} />
                    </div>
                </AccordionContent>
            </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
};

export default GroupSalesAnalysis;