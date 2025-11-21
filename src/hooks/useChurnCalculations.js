import { useMemo } from 'react';

    export const useChurnCalculations = (churnData) => {
      const calculations = useMemo(() => {
        const kpis = churnData?.kpis || {};

        const phase1Count = kpis.phase1Count || 0;
        const phase2Count = kpis.phase2Count || 0;
        const phase3Count = kpis.phase3Count || 0;
        const phase4Count = kpis.phase4Count || 0;

        const phase1Loss = kpis.phase1Loss || 0;
        const phase2Loss = kpis.phase2Loss || 0;
        const phase3Loss = kpis.phase3Loss || 0;
        const phase4Loss = kpis.phase4Loss || 0;

        const totalChurned = phase4Count;
        const totalAtRisk = phase2Count + phase3Count;
        const totalActive = phase1Count;
        const totalClients = totalActive + totalAtRisk + totalChurned;

        const churnRate = totalClients > 0 ? (totalChurned / totalClients) * 100 : 0;
        
        const totalPotentialLoss = phase2Loss + phase3Loss + phase4Loss;

        const pieData = [
          { name: 'Ativos', value: phase1Count, color: 'hsl(var(--chart-1))' },
          { name: 'Risco', value: phase2Count, color: 'hsl(var(--chart-2))' },
          { name: 'Risco Elevado', value: phase3Count, color: 'hsl(var(--chart-3))' },
          { name: 'Crítico (Churn)', value: phase4Count, color: 'hsl(var(--chart-4))' }
        ];

        return {
          kpis: {
            phase1Count,
            phase2Count,
            phase3Count,
            phase4Count,
            phase1Loss,
            phase2Loss,
            phase3Loss,
            phase4Loss,
          },
          totalChurned,
          totalAtRisk,
          totalActive,
          totalClients,
          churnRate,
          totalPotentialLoss,
          pieData,
        };
      }, [churnData]);

      return calculations;
    };