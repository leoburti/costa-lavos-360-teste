import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useUsuarios = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users_unified')
        .select(`
          id,
          auth_id,
          nome,
          email,
          departamento,
          persona_id,
          nivel_acesso,
          status,
          modulos_acesso,
          equipe_id,
          supervisor_id,
          vinculo_comercial,
          tipo_vinculo,
          pode_solicitar_bonificacao,
          eh_aprovador,
          tipos_aprovacao,
          persona:apoio_personas(id, nome, permissoes, tipo_uso), 
          equipe:apoio_equipes!equipe_id(id, nome)
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
  
  const fetchUsuarioById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users_unified')
        .select('*, persona:apoio_personas(nome), equipe:apoio_equipes(id, nome)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar usuário', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createUsuario = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data: existingUser, error: existingUserError } = await supabase
        .from('users_unified')
        .select('id')
        .eq('email', dados.email)
        .single();
      
      if (existingUser) {
        throw new Error('Este email já está em uso.');
      }
      
      const { data, error } = await supabase.from('users_unified').insert([dados]).select();
      if (error) throw error;
      
      toast({ title: 'Sucesso', description: 'Usuário criado com sucesso.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar usuário', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUsuario = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('users_unified').update(dados).eq('id', id).select().single();
      if (error) {
          console.error("Supabase update error in useUsuarios:", error);
          throw error;
      }
      
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar usuário', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteUsuario = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('users_unified').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Usuário deletado com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar usuário', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const toggleStatusUsuario = useCallback(async (id, currentStatus) => {
    setLoading(true);
    try {
      const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
      const { error } = await supabase.from('users_unified').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Status do usuário alterado.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao alterar status', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getUsuariosAprovadores = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users_unified')
        .select('*')
        .eq('eh_aprovador', true);
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar aprovadores', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchUsuarios,
    fetchUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    toggleStatusUsuario,
    getUsuariosAprovadores,
  };
};