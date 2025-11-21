import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useChamados = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchChamados = useCallback(async (filtros) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_chamados_filtrados', {
        p_status: filtros?.status || null,
        p_tipo: filtros?.tipo || null,
        p_cliente_id: filtros?.cliente_id || null,
        p_prioridade: filtros?.prioridade || null,
        p_data_inicio: filtros?.data_inicio || null,
        p_data_fim: filtros?.data_fim || null,
        p_search_text: filtros?.search || null,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar chamados', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchChamadoById = useCallback(async (id) => {
    setLoading(true);
    try {
      // Validate UUID format to prevent 22P02 errors
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
         console.warn('Invalid UUID passed to fetchChamadoById:', id);
         return null;
      }

      const { data, error } = await supabase.rpc('get_chamado_detalhes', { p_chamado_id: id });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar detalhes do chamado', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createChamado = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase.from('apoio_chamados').insert([{ ...dados, criado_por: user.id }]).select().single();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Chamado criado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar chamado', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateChamado = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_chamados').update(dados).eq('id', id).select().single();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Chamado atualizado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar chamado', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addComentario = useCallback(async (chamadoId, comentario) => {
    setLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('apoio_chamados_comentarios').insert([{ chamado_id: chamadoId, comentario, usuario_id: user.id }]).select('*, usuario:apoio_usuarios(nome)').single();
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Comentário adicionado.' });
        return data;
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao adicionar comentário', description: error.message });
        return null;
    } finally {
        setLoading(false);
    }
  }, [toast]);

  const uploadAnexo = useCallback(async (chamadoId, file) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `chamados/${chamadoId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('apoio-anexos').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlResult } = supabase.storage.from('apoio-anexos').getPublicUrl(filePath);

      const { data: dbData, error: dbError } = await supabase.from('apoio_chamados_anexos').insert([{
        chamado_id: chamadoId,
        usuario_id: user.id,
        nome_arquivo: file.name,
        url_arquivo: urlResult.publicUrl,
        tipo_arquivo: file.type,
        tamanho_arquivo_bytes: file.size,
      }]).select('*, usuario:apoio_usuarios(nome)').single();

      if (dbError) throw dbError;
      
      toast({ title: 'Sucesso', description: 'Anexo enviado.' });
      return dbData;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro no Upload', description: error.message });
      return null;
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const deleteAnexo = useCallback(async (anexo) => {
      setLoading(true);
      try {
          const url = new URL(anexo.url_arquivo);
          const filePath = decodeURIComponent(url.pathname.substring(url.pathname.indexOf('chamados/')));

          const { error: storageError } = await supabase.storage.from('apoio-anexos').remove([filePath]);
          if(storageError) throw storageError;

          const { error: dbError } = await supabase.from('apoio_chamados_anexos').delete().eq('id', anexo.id);
          if (dbError) throw dbError;

          toast({ title: 'Sucesso', description: 'Anexo removido.' });
          return true;
      } catch (error) {
          toast({ variant: 'destructive', title: 'Erro ao remover anexo', description: error.message });
          return false;
      } finally {
          setLoading(false);
      }
  }, [toast]);
  
  const deleteChamado = useCallback(async (chamadoId) => {
    setLoading(true);
    try {
        const { data, error } = await supabase.rpc('delete_chamado', { p_chamado_id: chamadoId });
        if (error) throw error;
        if (!data.success) throw new Error(data.message);
        
        toast({ title: 'Sucesso', description: 'Chamado excluído com sucesso.' });
        return true;
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao excluir chamado', description: error.message });
        return false;
    } finally {
        setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    uploading,
    fetchChamados,
    fetchChamadoById,
    createChamado,
    updateChamado,
    addComentario,
    uploadAnexo,
    deleteAnexo,
    deleteChamado,
  };
};