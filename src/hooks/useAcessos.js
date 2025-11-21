import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useAcessos = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchAcessosUsuario = useCallback(async (usuarioId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_permissoes_usuario', { p_usuario_id: usuarioId });
      if (error) throw error;
      return data || {};
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar acessos',
        description: error.message,
      });
      return {};
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateAcessosPerfil = useCallback(async (perfilId, permissoesIds) => {
    setLoading(true);
    try {
      // Deleta permissões existentes
      const { error: deleteError } = await supabase
        .from('apoio_perfil_permissoes')
        .delete()
        .eq('perfil_id', perfilId);
      if (deleteError) throw deleteError;

      // Insere novas permissões
      if (permissoesIds.length > 0) {
        const newPerms = permissoesIds.map(pid => ({ perfil_id: perfilId, permissao_id: pid }));
        const { error: insertError } = await supabase
          .from('apoio_perfil_permissoes')
          .insert(newPerms);
        if (insertError) throw insertError;
      }
      
      toast({
        title: 'Sucesso',
        description: 'Permissões do perfil atualizadas.',
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar permissões do perfil',
        description: error.message,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchAcessosUsuario,
    updateAcessosPerfil,
  };
};