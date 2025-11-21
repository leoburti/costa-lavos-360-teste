import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useAprovadores = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchAprovadores = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apoio_aprovadores')
        .select('*, usuario:apoio_usuarios(nome, email)');
      if (error) throw error;
      return data;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar aprovadores',
        description: error.message,
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchAprovadorById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apoio_aprovadores')
        .select('*, usuario:apoio_usuarios(nome, email)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar aprovador',
        description: error.message,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createAprovador = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apoio_aprovadores')
        .insert([dados])
        .select();
      if (error) throw error;
      toast({
        title: 'Sucesso',
        description: 'Aprovador designado com sucesso.',
      });
      return data;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao designar aprovador',
        description: error.message,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateAprovador = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apoio_aprovadores')
        .update(dados)
        .eq('id', id)
        .select();
      if (error) throw error;
      toast({
        title: 'Sucesso',
        description: 'Aprovador atualizado com sucesso.',
      });
      return data;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar aprovador',
        description: error.message,
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteAprovador = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('apoio_aprovadores')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({
        title: 'Sucesso',
        description: 'Aprovador removido com sucesso.',
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover aprovador',
        description: error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchAprovadores,
    fetchAprovadorById,
    createAprovador,
    updateAprovador,
    deleteAprovador,
  };
};