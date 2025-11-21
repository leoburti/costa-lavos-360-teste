import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useDashboardPersonalizado = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getDashboards = useCallback(async (usuarioId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apoio_dashboards_personalizados')
        .select('*')
        .eq('usuario_id', usuarioId);
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dashboards', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const getDashboardById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_dashboards_personalizados').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dashboard', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const createDashboard = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_dashboards_personalizados').insert([dados]).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Dashboard criado com sucesso.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar dashboard', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  const updateDashboard = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_dashboards_personalizados').update(dados).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Dashboard atualizado.' });
      return data[0];
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar dashboard', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteDashboard = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_dashboards_personalizados').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Dashboard deletado.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar dashboard', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { loading, getDashboards, getDashboardById, createDashboard, updateDashboard, deleteDashboard };
};