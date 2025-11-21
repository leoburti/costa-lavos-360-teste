import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useRotas = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchRotaProfissional = useCallback(async (profissionalId, data) => {
    setLoading(true);
    try {
      const { data: rota, error } = await supabase
        .from('apoio_geolocalizacao_rotas')
        .select('*')
        .eq('profissional_id', profissionalId)
        .eq('data_rota', data)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows found"
      return rota;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar rota', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const registrarRotaProfissional = useCallback(async (profissionalId, data, pontosRota) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('registrar_rota_profissional', {
        p_profissional_id: profissionalId,
        p_data_rota: data,
        p_pontos_rota: pontosRota,
      });
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Rota registrada com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao registrar rota', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchRotaProfissional,
    registrarRotaProfissional,
  };
};