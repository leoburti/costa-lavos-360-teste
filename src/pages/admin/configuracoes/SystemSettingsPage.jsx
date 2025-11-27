import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Database, RefreshCw } from 'lucide-react';

const SystemSettingsPage = () => {
  const { toast } = useToast();
  const [loadingCache, setLoadingCache] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(null);

  const checkCacheStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_kpis_cache')
        .select('status, updated_at, error_message')
        .eq('key', 'global_default')
        .single();
        
      if (data) {
        setCacheStatus(data);
      }
    } catch (e) {
      console.error("Cache check failed", e);
    }
  }, []);

  useEffect(() => {
    checkCacheStatus();
    const interval = setInterval(checkCacheStatus, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [checkCacheStatus]);

  const handleRefreshCache = async () => {
    setLoadingCache(true);
    try {
      const { error } = await supabase.rpc('refresh_dashboard_cache');
      if (error) throw error;
      
      toast({
        title: "Atualização Iniciada",
        description: "O cache do dashboard está sendo atualizado em segundo plano.",
      });
      
      // Immediate check
      checkCacheStatus();
    } catch (error) {
      console.error('Error refreshing cache:', error);
      toast({
        title: "Erro",
        description: "Falha ao iniciar atualização do cache.",
        variant: "destructive"
      });
    } finally {
      setLoadingCache(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h2>
        <p className="text-muted-foreground">Opções técnicas e manutenção do sistema.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-brand-primary" />
            Cache e Performance
          </CardTitle>
          <CardDescription>Gerencie o cache de dados do dashboard para otimizar o carregamento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Status do Cache Dashboard</span>
              {cacheStatus?.status === 'ready' && <span className="text-green-600 text-sm font-bold">Pronto</span>}
              {cacheStatus?.status === 'updating' && <span className="text-amber-600 text-sm font-bold animate-pulse">Atualizando...</span>}
              {cacheStatus?.status === 'error' && <span className="text-red-600 text-sm font-bold">Erro</span>}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Última atualização: {cacheStatus?.updated_at ? new Date(cacheStatus.updated_at).toLocaleString() : 'Nunca'}
            </p>
            {cacheStatus?.error_message && (
                <p className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100 mb-4">
                    Erro: {cacheStatus.error_message}
                </p>
            )}
            
            <Button 
              onClick={handleRefreshCache} 
              disabled={loadingCache || cacheStatus?.status === 'updating'}
              className="w-full sm:w-auto"
            >
              {loadingCache ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Forçar Atualização do Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettingsPage;