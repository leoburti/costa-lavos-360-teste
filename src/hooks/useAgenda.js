import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useAgenda = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchAgendaProfissional = useCallback(async (profissionalId, dataInicio, dataFim) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_agenda_profissional', {
        p_profissional_id: profissionalId,
        p_data_inicio: dataInicio,
        p_data_fim: dataFim,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar agenda do profissional', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchAgendaSemana = useCallback(async (profissionalId, dataInicio) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_agenda_semana', {
        p_profissional_id: profissionalId,
        p_data_inicio: dataInicio,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar agenda semanal', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchAgendaMes = useCallback(async (profissionalId, mes, ano) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_agenda_mes', {
        p_profissional_id: profissionalId,
        p_mes: mes,
        p_ano: ano,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar agenda mensal', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createEvento = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.rpc('agendar_evento', {
        p_profissional_id: dados.profissional_id,
        p_chamado_id: dados.chamado_id,
        p_data: dados.data_evento,
        p_hora_inicio: dados.hora_inicio,
        p_hora_fim: dados.hora_fim,
        p_usuario_id: user.id,
        p_titulo: dados.titulo,
        p_descricao: dados.descricao,
        p_local: dados.local,
        p_tipo_evento: dados.tipo_evento,
      });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Evento agendado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao agendar evento', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateEvento = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_agenda_eventos').update(dados).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Evento atualizado com sucesso.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar evento', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteEvento = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_agenda_eventos').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Evento deletado com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar evento', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const reagendarEvento = useCallback(async (eventoId, novaData, novaHoraInicio, novaHoraFim) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.rpc('reagendar_evento', {
        p_evento_id: eventoId,
        p_nova_data: novaData,
        p_nova_hora_inicio: novaHoraInicio,
        p_nova_hora_fim: novaHoraFim,
        p_usuario_id: user.id,
      });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Evento reagendado com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao reagendar evento', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const marcarComoConcluido = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_agenda_eventos').update({ status: 'concluido' }).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Evento marcado como concluído.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao marcar como concluído', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const cancelarEvento = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_agenda_eventos').update({ status: 'cancelado' }).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Evento cancelado.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao cancelar evento', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchAgendaProfissional,
    fetchAgendaSemana,
    fetchAgendaMes,
    createEvento,
    updateEvento,
    deleteEvento,
    reagendarEvento,
    marcarComoConcluido,
    cancelarEvento,
  };
};