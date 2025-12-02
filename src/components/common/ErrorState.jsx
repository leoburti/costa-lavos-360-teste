import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const ErrorState = ({ error, onRetry, title = "Erro ao carregar dados" }) => {
  return (
    <Alert variant="destructive" className="my-4 animate-in slide-in-from-top-2 duration-300">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="ml-2">{title}</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col gap-3">
        <p className="text-sm opacity-90">
          {error?.message || "Ocorreu um erro inesperado. Por favor, tente novamente."}
        </p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="w-fit bg-background/10 hover:bg-background/20 border-white/20 text-inherit"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Tentar Novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorState;