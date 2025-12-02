import React from 'react';
import RankingPerformance from '@/components/dashboard/RankingPerformance';

// This component acts as the container for the Analytical Tab
// Cleaned up to remove unwanted charts as requested
const DashboardAnalytico = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-h-screen p-6 bg-slate-50/50">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visão Analítica</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Detalhamento de performance e rankings comparativos.
          </p>
        </div>
      </div>
      
      {/* Single robust ranking component */}
      <div className="grid grid-cols-1">
        <RankingPerformance />
      </div>
    </div>
  );
};

export default DashboardAnalytico;