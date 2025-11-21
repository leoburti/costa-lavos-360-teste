import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useModelosEquipamentos = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchModelos = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_modelos_equipamentos').select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar modelos', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchModeloById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_modelos_equipamentos').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar modelo', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createModelo = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_modelos_equipamentos').insert([dados]).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Modelo criado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar modelo', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateModelo = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_modelos_equipamentos').update(dados).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Modelo atualizado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar modelo', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteModelo = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_modelos_equipamentos').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Modelo deletado com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar modelo', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchModelos,
    fetchModeloById,
    createModelo,
    updateModelo,
    deleteModelo,
  };
};