
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

/**
 * Layout padrão para páginas de relatório.
 * Inclui título, descrição e um botão de atualização.
 */
export default function RelatoriLayout({ title, description, children, isLoading = false, onRefresh }) {
  const handleRefreshClick = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      toast({
        title: "🚧 Funcionalidade em desenvolvimento",
        description: "Este botão de atualização ainda não foi implementado para esta página.",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <Helmet>
        <title>{title} | Relatórios | Costa Lavos 360</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefreshClick} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
