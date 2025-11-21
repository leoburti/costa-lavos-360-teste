import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useEquipamentosComodato = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchEquipamentosCliente = useCallback(async (clienteId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_estoque_cliente', { p_cliente_id: clienteId });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar equipamentos', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchEquipamentoById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_equipamentos_comodato').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar equipamento', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createEquipamento = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_equipamentos_comodato').insert([dados]).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Equipamento criado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar equipamento', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateEquipamento = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_equipamentos_comodato').update(dados).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Equipamento atualizado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar equipamento', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteEquipamento = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_equipamentos_comodato').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Equipamento deletado com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar equipamento', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchHistoricoEquipamento = useCallback(async (equipamentoId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_historico_equipamento', { p_equipamento_id: equipamentoId });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar histórico', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchEquipamentosCliente,
    fetchEquipamentoById,
    createEquipamento,
    updateEquipamento,
    deleteEquipamento,
    fetchHistoricoEquipamento,
  };
};