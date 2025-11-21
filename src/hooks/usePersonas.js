import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const usePersonas = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPersonas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apoio_personas')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar personas:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar personas.' });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getPersonaById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apoio_personas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar persona:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar detalhes da persona.' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const savePersona = useCallback(async (persona) => {
    setLoading(true);
    try {
      const { id, ...dataToSave } = persona;
      let result;
      
      if (id) {
        result = await supabase
          .from('apoio_personas')
          .update(dataToSave)
          .eq('id', id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('apoio_personas')
          .insert(dataToSave)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      toast({ title: 'Sucesso', description: `Persona ${id ? 'atualizada' : 'criada'} com sucesso.` });
      return result.data;
    } catch (error) {
      console.error('Erro ao salvar persona:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao salvar persona.' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deletePersona = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('apoio_personas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Persona excluída com sucesso.' });
      return true;
    } catch (error) {
      console.error('Erro ao excluir persona:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao excluir persona. Verifique se há usuários vinculados.' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchPersonas,
    getPersonaById,
    savePersona,
    deletePersona
  };
};