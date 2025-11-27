import { useMemo } from 'react';

export const useChurnCalculations = (churnData) => {
  return useMemo(() => {
    if (!churnData || !churnData.kpis) {
      return {
        kpis: {},
        totalChurned: 0,
        totalAtRisk: 0,
        churnRate: 0,
        totalPotentialLoss: 0,
        pieData: []
      };
    }

    const kpis = churnData.kpis;
    const totalClients = (kpis.phase1Count || 0) + (kpis.phase2Count || 0) + (kpis.phase3Count || 0) + (kpis.phase4Count || 0);
    const totalChurned = kpis.phase4Count || 0;
    const totalAtRisk = (kpis.phase2Count || 0) + (kpis.phase3Count || 0);
    const churnRate = totalClients > 0 ? (totalChurned / totalClients) * 100 : 0;
    const totalPotentialLoss = (kpis.phase2Loss || 0) + (kpis.phase3Loss || 0) + (kpis.phase4Loss || 0);

    const pieData = [
      { name: 'Ativos', value: kpis.phase1Count || 0, fill: '#22c55e' }, // Green
      { name: 'Risco', value: kpis.phase2Count || 0, fill: '#eab308' },  // Yellow
      { name: 'Risco Elevado', value: kpis.phase3Count || 0, fill: '#f97316' }, // Orange
      { name: 'Crítico (Churn)', value: kpis.phase4Count || 0, fill: '#ef4444' } // Red
    ];

    return {
      kpis,
      totalChurned,
      totalAtRisk,
      churnRate,
      totalPotentialLoss,
      pieData
    };
  }, [churnData]);
};