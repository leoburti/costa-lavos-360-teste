import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useAlertas = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getAlertas = useCallback(async (filtros) => {
    setLoading(true);
    try {
      let query = supabase.from('apoio_alertas_monitoramento').select('*');
      if (filtros?.tipo_alerta) query = query.eq('tipo_alerta', filtros.tipo_alerta);
      if (filtros?.severidade) query = query.eq('severidade', filtros.severidade);
      if (filtros?.resolvido !== undefined) query = query.eq('resolvido', filtros.resolvido);
      
      const { data, error } = await query.order('data_criacao', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar alertas', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getAlertasAtivos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_alertas_ativos');
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar alertas ativos', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const criarAlerta = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('criar_alerta', {
        p_tipo_alerta: dados.tipo_alerta,
        p_severidade: dados.severidade,
        p_titulo: dados.titulo,
        p_descricao: dados.descricao,
        p_dados_relacionados: dados.dados_relacionados
      });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Alerta criado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar alerta', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const resolverAlerta = useCallback(async (alertaId) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('resolver_alerta', { p_alerta_id: alertaId });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Alerta resolvido com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao resolver alerta', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const deleteAlerta = useCallback(async (alertaId) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_alertas_monitoramento').delete().eq('id', alertaId);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Alerta deletado com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar alerta', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { loading, getAlertas, getAlertasAtivos, criarAlerta, resolverAlerta, deleteAlerta };
};