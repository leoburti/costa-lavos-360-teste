import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const usePerfis = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchPerfis = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apoio_perfis')
        .select('*, usuarios_unified:users_unified(count)')
        .order('nome');

      if (error) throw error;
      
      const mappedData = data.map(p => ({
        ...p,
        usuarios: p.usuarios_unified
      }));

      return mappedData;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar perfis', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchPerfilById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_perfis').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar perfil', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createPerfil = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_perfis').insert([dados]).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Perfil criado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar perfil', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updatePerfil = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_perfis').update(dados).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar perfil', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deletePerfil = useCallback(async (id) => {
    setLoading(true);
    try {
      const { count, error: countError } = await supabase.from('users_unified').select('*', { count: 'exact' }).eq('perfil_id', id);
      if (countError) throw countError;
      if (count > 0) {
        toast({ variant: 'destructive', title: 'Ação não permitida', description: 'Não é possível excluir um perfil que está em uso por um ou mais usuários.' });
        return false;
      }

      const { error } = await supabase.from('apoio_perfis').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Perfil deletado com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar perfil', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const toggleStatusPerfil = useCallback(async (id, currentStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_perfis').update({ ativo: !currentStatus }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Status do perfil alterado.' });
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
    fetchPerfis,
    fetchPerfilById,
    createPerfil,
    updatePerfil,
    deletePerfil,
    toggleStatusPerfil,
  };
};