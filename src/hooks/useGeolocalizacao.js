import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentPosition, getAddressFromCoordinates } from '@/utils/geolocation';

export const useGeolocalizacao = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trackingInterval, setTrackingInterval] = useState(null);

  const registrarCheckin = useCallback(async (chamadoId, fotoProva, observacoes) => {
    setLoading(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude, accuracy } = position.coords;
      const endereco = await getAddressFromCoordinates(latitude, longitude);
      
      const { data, error } = await supabase.rpc('registrar_checkin', {
        p_chamado_id: chamadoId,
        p_profissional_id: (await supabase.auth.getUser()).data.user.id,
        p_latitude: latitude,
        p_longitude: longitude,
        p_precisao: accuracy,
        p_endereco: endereco,
        p_foto_prova: fotoProva,
        p_observacoes: observacoes
      });

      if (error) throw error;
      toast({ title: 'Check-in registrado com sucesso!', description: data.validation.mensagem });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro no Check-in', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const registrarCheckout = useCallback(async (chamadoId, fotoProva, observacoes) => {
    setLoading(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude, accuracy } = position.coords;
      const endereco = await getAddressFromCoordinates(latitude, longitude);

      const { data, error } = await supabase.rpc('registrar_checkout', {
        p_chamado_id: chamadoId,
        p_profissional_id: (await supabase.auth.getUser()).data.user.id,
        p_latitude: latitude,
        p_longitude: longitude,
        p_precisao: accuracy,
        p_endereco: endereco,
        p_foto_prova: fotoProva,
        p_observacoes: observacoes
      });

      if (error) throw error;
      toast({ title: 'Check-out registrado com sucesso!', description: data.validation.mensagem });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro no Check-out', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getHistoricoGeolocalizacao = useCallback(async (chamadoId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_historico_geolocalizacao', { p_chamado_id: chamadoId });
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar histórico', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const startTrackingRota = useCallback((profissionalId) => {
    const pontos = [];
    const intervalId = setInterval(async () => {
      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        pontos.push({ latitude, longitude, timestamp: new Date().toISOString() });
        console.log('Ponto de rota capturado:', { latitude, longitude });
      } catch (error) {
        console.error('Erro ao capturar ponto de rota:', error.message);
      }
    }, 60000); // a cada 1 minuto

    setTrackingInterval({ intervalId, pontos, profissionalId });
    toast({ title: 'Rastreamento de rota iniciado.' });
  }, [toast]);

  const stopTrackingRota = useCallback(async () => {
    if (trackingInterval) {
      clearInterval(trackingInterval.intervalId);
      
      if (trackingInterval.pontos.length > 1) {
        try {
          await supabase.rpc('registrar_rota_profissional', {
            p_profissional_id: trackingInterval.profissionalId,
            p_data_rota: new Date().toISOString().split('T')[0],
            p_pontos_rota: trackingInterval.pontos
          });
          toast({ title: 'Rota registrada com sucesso!' });
        } catch (error) {
          toast({ variant: 'destructive', title: 'Erro ao registrar rota', description: error.message });
        }
      }
      setTrackingInterval(null);
    }
  }, [trackingInterval, toast]);

  return {
    loading,
    registrarCheckin,
    registrarCheckout,
    getHistoricoGeolocalizacao,
    startTrackingRota,
    stopTrackingRota,
  };
};