
import React, { useState, useEffect, useCallback } from 'react';
import ModulePageTemplate from '@/components/ModulePageTemplate';
import RouteManager from '@/components/delivery/RouteManager';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export default function Rotas() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rotas')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar rotas',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return (
    <ModulePageTemplate title="Gestão de Rotas">
      <RouteManager 
        routes={routes} 
        onRoutesUpdate={fetchRoutes} 
        loading={loading} 
      />
    </ModulePageTemplate>
  );
}
