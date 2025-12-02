import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * Componente de container seguro para exibição de dados analíticos.
 * Trata estados de loading, erro e vazio de forma padronizada.
 */
export function AnalyticsContainer({ 
  loading, 
  error, 
  data, 
  onRetry, 
  emptyMessage = "Nenhum dado disponível para os filtros selecionados.",
  children 
}) {
  
  // 1. Estado de Carregamento
  if (loading && (!data || data.length === 0)) {
    return (
      <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
        <LoadingSpinner message="Processando análise..." />
      </div>
    );
  }

  // 2. Estado de Erro Seguro
  if (error) {
    // Extrai mensagem segura mesmo que venha um objeto complexo
    const message = typeof error === 'string' ? error : (error.message || 'Erro desconhecido ao carregar dados.');
    const hint = error.hint || error.details;

    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Falha na Análise</AlertTitle>
        <AlertDescription className="mt-2 flex flex-col gap-2">
          <p>{message}</p>
          {hint && <p className="text-xs opacity-80 font-mono bg-black/10 p-1 rounded">{hint}</p>}
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry} 
              className="w-fit mt-2 border-red-200 hover:bg-red-100 hover:text-red-900"
            >
              <RefreshCw className="mr-2 h-3 w-3" /> Tentar Novamente
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // 3. Estado Vazio
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="rounded-full bg-muted/50 p-3">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Sem Resultados</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
          {emptyMessage}
        </p>
        {onRetry && (
           <Button variant="ghost" size="sm" onClick={onRetry}>
             Recarregar
           </Button>
        )}
      </div>
    );
  }

  // 4. Conteúdo Principal
  return (
    <div className="relative w-full h-full animate-in fade-in duration-500">
      {children}
      {/* Loading overlay para updates em background (paginação/filtros) */}
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
          <LoadingSpinner className="scale-75" />
        </div>
      )}
    </div>
  );
}