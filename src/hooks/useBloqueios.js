import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useBloqueios = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchBloqueios = useCallback(async (profissionalId) => {
    setLoading(true);
    try {
      let query = supabase.from('apoio_agenda_bloqueios').select('*');
      if (profissionalId) {
        query = query.eq('profissional_id', profissionalId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar bloqueios', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchBloqueioById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_agenda_bloqueios').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar bloqueio', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createBloqueio = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_agenda_bloqueios').insert([dados]).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Bloqueio criado com sucesso.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar bloqueio', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateBloqueio = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_agenda_bloqueios').update(dados).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Bloqueio atualizado com sucesso.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar bloqueio', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteBloqueio = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_agenda_bloqueios').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Bloqueio deletado com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar bloqueio', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const verificarBloqueio = useCallback(async (profissionalId, data) => {
    setLoading(true);
    try {
      const { data: conflito, error } = await supabase.rpc('verificar_conflito_agenda', {
        p_profissional_id: profissionalId,
        p_data: data,
        p_hora_inicio: '00:00:00', // Checar o dia inteiro para bloqueios
        p_hora_fim: '23:59:59',
      });
      if (error) throw error;
      return conflito; // True se houver bloqueio, false caso contrário
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao verificar bloqueio', description: error.message });
      return true; // Assumir conflito em caso de erro
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchBloqueios,
    fetchBloqueioById,
    createBloqueio,
    updateBloqueio,
    deleteBloqueio,
    verificarBloqueio,
  };
};