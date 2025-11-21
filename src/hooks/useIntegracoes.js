import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useIntegracoes = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchIntegracoes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_integracoes_apis').select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar integrações', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchIntegracaoById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_integracoes_apis').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar integração', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createIntegracao = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_integracoes_apis').insert([dados]).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Integração criada com sucesso.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar integração', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateIntegracao = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_integracoes_apis').update(dados).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Integração atualizada com sucesso.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar integração', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteIntegracao = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_integracoes_apis').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Integração deletada com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar integração', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const testarConexao = useCallback(async (integracaoId) => {
    setLoading(true);
    toast({ title: 'Em desenvolvimento', description: '🚧 Teste de conexão ainda não implementado.' });
    setLoading(false);
    return { success: true, message: 'Conexão simulada com sucesso!' };
  }, [toast]);

  return {
    loading,
    fetchIntegracoes,
    fetchIntegracaoById,
    createIntegracao,
    updateIntegracao,
    deleteIntegracao,
    testarConexao,
  };
};