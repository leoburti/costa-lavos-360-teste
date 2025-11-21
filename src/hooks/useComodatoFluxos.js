import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useComodatoFluxos = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const criarEntrega = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('criar_entrega_comodato', {
        p_cliente_id: dados.cliente_id,
        p_quantidade: dados.quantidade,
        p_modelo_id: dados.modelo_id,
        p_urgencia: dados.urgencia,
        p_justificativa: dados.justificativa,
        p_observacoes: dados.observacoes,
      });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Solicitação de entrega criada e chamado aberto.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar entrega', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const criarTroca = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('criar_troca_comodato', {
        p_cliente_id: dados.cliente_id,
        p_equipamento_id: dados.equipamento_id,
        p_novo_modelo_id: dados.novo_modelo_id,
        p_motivo: dados.motivo,
        p_observacoes: dados.observacoes,
      });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Solicitação de troca criada e chamado aberto.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar troca', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const criarRetirada = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('criar_retirada_comodato', {
        p_cliente_id: dados.cliente_id,
        p_equipamentos_ids: dados.equipamentos_ids,
        p_motivo: dados.motivo,
        p_observacoes: dados.observacoes,
      });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Solicitação de retirada criada e chamado aberto.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar retirada', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    criarEntrega,
    criarTroca,
    criarRetirada,
  };
};