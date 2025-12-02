import React from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingState = ({ message = 'Carregando dados...', type = 'skeleton' }) => {
  if (type === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-sm animate-pulse">{message}</p>
      </div>
    );
  }

  // Default Skeleton Layout
  return (
    <div className="space-y-4 w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
};

export default LoadingState;