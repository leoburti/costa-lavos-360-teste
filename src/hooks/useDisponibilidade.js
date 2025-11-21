import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useDisponibilidade = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchDisponibilidadeProfissional = useCallback(async (profissionalId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_agenda_disponibilidade').select('*').eq('profissional_id', profissionalId);
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar disponibilidade', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchDisponibilidadeData = useCallback(async (profissionalId, data) => {
    setLoading(true);
    try {
      const { data: disponibilidade, error } = await supabase.rpc('get_disponibilidade_profissional', {
        p_profissional_id: profissionalId,
        p_data: data,
      });
      if (error) throw error;
      return disponibilidade;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar disponibilidade para data', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createDisponibilidade = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_agenda_disponibilidade').insert([dados]).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Disponibilidade criada com sucesso.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar disponibilidade', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateDisponibilidade = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_agenda_disponibilidade').update(dados).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Disponibilidade atualizada com sucesso.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar disponibilidade', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteDisponibilidade = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_agenda_disponibilidade').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Disponibilidade deletada com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar disponibilidade', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const verificarConflito = useCallback(async (profissionalId, data, horaInicio, horaFim) => {
    setLoading(true);
    try {
      const { data: conflito, error } = await supabase.rpc('verificar_conflito_agenda', {
        p_profissional_id: profissionalId,
        p_data: data,
        p_hora_inicio: horaInicio,
        p_hora_fim: horaFim,
      });
      if (error) throw error;
      return conflito; // True se houver conflito, false caso contrário
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao verificar conflito de agenda', description: error.message });
      return true; // Assumir conflito em caso de erro
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getProfissionaisDisponiveis = useCallback(async (data, horaInicio, horaFim, tipoChamado) => {
    setLoading(true);
    try {
      const { data: profissionais, error } = await supabase.rpc('get_profissionais_disponiveis', {
        p_data: data,
        p_hora_inicio: horaInicio,
        p_hora_fim: horaFim,
        p_tipo_chamado: tipoChamado,
      });
      if (error) throw error;
      return profissionais;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar profissionais disponíveis', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchDisponibilidadeProfissional,
    fetchDisponibilidadeData,
    createDisponibilidade,
    updateDisponibilidade,
    deleteDisponibilidade,
    verificarConflito,
    getProfissionaisDisponiveis,
  };
};