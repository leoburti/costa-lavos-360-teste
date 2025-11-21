import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useDadosClientes = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchDadosClienteCache = useCallback(async (clienteId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_dados_cliente_cache', { p_cliente_id: clienteId });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dados do cliente', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const sincronizarDadosCliente = useCallback(async (clienteId, integracaoId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('sincronizar_dados_cliente', { p_cliente_id: clienteId, p_integracao_id: integracaoId });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Dados do cliente sincronizados.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao sincronizar dados', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getHistoricoSincronizacoes = useCallback(async (clienteId) => {
    setLoading(true);
    toast({ title: 'Em desenvolvimento', description: '🚧 Histórico de sincronizações ainda não implementado.' });
    setLoading(false);
    return [];
  }, [toast]);

  return {
    loading,
    fetchDadosClienteCache,
    sincronizarDadosCliente,
    getHistoricoSincronizacoes,
  };
};