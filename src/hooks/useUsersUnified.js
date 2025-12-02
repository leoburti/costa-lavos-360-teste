import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useUsersUnified = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users_unified')
        .select(`
          *,
          persona:apoio_personas(nome),
          equipe:apoio_equipes(nome),
          supervisor:users_unified!supervisor_id(nome)
        `)
        .order('nome', { ascending: true });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar usuários', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUser = useCallback(async (userId, updatedData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users_unified')
        .update(updatedData)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar usuário', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchUsers,
    updateUser,
  };
};