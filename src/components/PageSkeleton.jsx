import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton Loader padrão para páginas de dashboard/analíticos
 * Simula: Header, FilterBar, Cards de KPI e Gráficos principais
 */
const PageSkeleton = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filter Bar */}
      <div className="w-full h-16 rounded-lg bg-white border border-slate-200 p-2 flex items-center gap-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
        <div className="flex-1" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={`kpi-${i}`} className="border-slate-200 shadow-sm">
            <CardContent className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm h-[400px]">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="h-[300px] flex items-end justify-around gap-2 p-6 pt-0">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={`bar-${i}`} className="w-full rounded-t-sm" style={{ height: `${Math.random() * 100}%` }} />
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm h-[400px]">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PageSkeleton;