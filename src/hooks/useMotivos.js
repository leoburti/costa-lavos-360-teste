import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useMotivos = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchMotivos = useCallback(async (tipoChamado) => {
    setLoading(true);
    try {
      let query = supabase.from('apoio_chamados_motivos').select('*');
      if (tipoChamado) {
        query = query.eq('tipo_chamado', tipoChamado);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar motivos', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMotivoById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_chamados_motivos').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar motivo', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createMotivo = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_chamados_motivos').insert([dados]).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Motivo criado com sucesso.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar motivo', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateMotivo = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_chamados_motivos').update(dados).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Motivo atualizado com sucesso.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar motivo', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteMotivo = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_chamados_motivos').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Motivo deletado com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar motivo', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const toggleStatusMotivo = useCallback(async (id, currentStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_chamados_motivos').update({ ativo: !currentStatus }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Status do motivo alterado.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao alterar status', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchMotivos,
    fetchMotivoById,
    createMotivo,
    updateMotivo,
    deleteMotivo,
    toggleStatusMotivo,
  };
};