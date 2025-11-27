import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

const DashboardLoading = ({ loading, error, onRetry, className }) => {
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[60vh] w-full animate-in fade-in duration-500 ${className}`}>
        <LoadingSpinner message="Carregando dados..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[60vh] w-full gap-6 animate-in fade-in zoom-in-95 duration-300 ${className}`}>
        <div className="flex flex-col items-center gap-2 text-center max-w-md">
            <div className="bg-red-50 p-4 rounded-full mb-2">
                <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Dados indisponíveis no momento</h3>
            <p className="text-muted-foreground">
                O carregamento demorou mais do que o esperado. Por favor, tente novamente.
            </p>
        </div>
        <Button onClick={onRetry} size="lg" className="gap-2 shadow-md">
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return null;
};

export default DashboardLoading;