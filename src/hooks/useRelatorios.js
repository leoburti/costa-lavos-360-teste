import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useRelatorios = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getRelatorioComodato = useCallback(async (dataInicio, dataFim, clienteId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_relatorio_comodato', { p_data_inicio: dataInicio, p_data_fim: dataFim, p_cliente_id: clienteId });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar relatório de comodato', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getRelatorioOperacional = useCallback(async (dataInicio, dataFim, profissionalId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_relatorio_operacional', { p_data_inicio: dataInicio, p_data_fim: dataFim, p_profissional_id: profissionalId });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar relatório operacional', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const getDashboardGestor = useCallback(async (dataInicio, dataFim) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_dashboard_gestor', { p_data_inicio: dataInicio, p_data_fim: dataFim });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dados do dashboard', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const exportarRelatorio = useCallback(async (tipo, formato, dados) => {
    setLoading(true);
    toast({ title: 'Em desenvolvimento', description: `A exportação para ${formato} ainda não foi implementada.` });
    setLoading(false);
  }, [toast]);

  return { loading, getRelatorioComodato, getRelatorioOperacional, getDashboardGestor, exportarRelatorio };
};