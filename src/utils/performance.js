/**
 * Utility to aggressively prefetch critical application routes and components.
 * Uses dynamic imports to trigger the network request for chunks.
 */
export const prefetchCriticalRoutes = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Use requestIdleCallback if available, otherwise setTimeout
  // We use a shorter timeout to start prefetching sooner but still yielding to main thread
  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));

  schedule(() => {
    const routes = [
      // 1. High Priority - Core Dashboards
      () => import('@/pages/DashboardPage'),
      () => import('@/pages/Visao360Cliente'),
      () => import('@/pages/crm/Pipeline'),
      
      // 2. Medium Priority - Analytics
      () => import('@/pages/AnaliticoVendasDiarias'),
      () => import('@/pages/AnaliseChurn'),
      () => import('@/pages/CurvaABC'),
      
      // 3. Operational - Support & Delivery
      () => import('@/pages/apoio/chamados/ChamadosTodosPage'),
      () => import('@/pages/delivery-management/Dashboard'),
      
      // 4. Components - Heavy UI Elements often used
      () => import('@/components/ChartCard'),
      () => import('@/components/MetricCard'),
      () => import('@/components/RankingTable'),
      () => import('@/components/ui/table')
    ];

    // Process in chunks to avoid blocking the main thread
    const processChunk = (index) => {
      if (index >= routes.length) return;
      
      // Load 3 routes at a time
      const chunk = routes.slice(index, index + 3);
      chunk.forEach(importFn => {
        try {
          importFn();
        } catch (e) {
          // Silent fail for prefetch
        }
      });

      // Schedule next chunk
      setTimeout(() => processChunk(index + 3), 200);
    };

    processChunk(0);
  });
};