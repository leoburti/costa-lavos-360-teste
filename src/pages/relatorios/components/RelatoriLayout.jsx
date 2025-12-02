import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { RelatoriFilters } from './RelatoriFilters';
import { RelatoriExport } from './RelatoriExport';

export function RelatoriLayout({ 
  title, 
  children, 
  onExport, 
  onRefresh,
  loading 
}) {
  return (
    <div className="space-y-6 p-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <RelatoriExport onExport={onExport} />
        </div>
      </div>

      {/* ===== FILTROS ===== */}
      <RelatoriFilters />

      {/* ===== CONTEÚDO ===== */}
      <Card>
        <CardContent className="pt-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}