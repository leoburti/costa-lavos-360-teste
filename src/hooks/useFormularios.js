import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useFormularios = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchFormularios = useCallback(async (tipoChamado) => {
    setLoading(true);
    try {
      let query = supabase.from('apoio_formularios_execucao').select('*');
      if (tipoChamado) {
        query = query.eq('tipo_chamado', tipoChamado);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar formulários', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchFormularioById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_formularios_execucao').select('*, campos:apoio_formularios_campos(*)').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar formulário', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createFormulario = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { campos, ...formularioData } = dados;
      const { data: newForm, error: formError } = await supabase.from('apoio_formularios_execucao').insert([formularioData]).select().single();
      if (formError) throw formError;

      if (campos && campos.length > 0) {
        const camposData = campos.map(c => ({ ...c, formulario_id: newForm.id }));
        const { error: camposError } = await supabase.from('apoio_formularios_campos').insert(camposData);
        if (camposError) throw camposError;
      }
      
      toast({ title: 'Sucesso', description: 'Formulário criado com sucesso.' });
      return newForm;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar formulário', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateFormulario = useCallback(async (id, dados) => {
    setLoading(true);
    // Implementação complexa de update com campos dinâmicos omitida por brevidade
    toast({ title: 'Em desenvolvimento', description: 'Atualização de formulários ainda não implementada.' });
    setLoading(false);
    return null;
  }, [toast]);

  const deleteFormulario = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_formularios_execucao').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Formulário deletado com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar formulário', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const salvarRespostasFormulario = useCallback(async (chamadoId, formularioId, respostas) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('salvar_respostas_formulario', {
        p_chamado_id: chamadoId,
        p_formulario_id: formularioId,
        p_respostas: respostas,
      });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Respostas salvas com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar respostas', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchFormularios,
    fetchFormularioById,
    createFormulario,
    updateFormulario,
    deleteFormulario,
    salvarRespostasFormulario,
  };
};