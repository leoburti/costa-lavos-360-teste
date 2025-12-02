import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/tests/test-utils';
import SidebarMenu from '@/components/SidebarMenu';
import DashboardGerencial from '@/pages/analytics/DashboardGerencial';

describe('Performance Benchmarks', () => {
  it('SidebarMenu should render within acceptable threshold', () => {
    const start = performance.now();
    
    renderWithProviders(<SidebarMenu isCollapsed={false} setIsCollapsed={() => {}} />);
    
    const end = performance.now();
    const duration = end - start;
    
    // JSDOM rendering is faster than browser paint, but good for relative CPU cost checks
    // Threshold: 50ms is generous for JSDOM, ensuring no massive loops
    expect(duration).toBeLessThan(100); 
    console.log(`SidebarMenu render time: ${duration.toFixed(2)}ms`);
  });

  it('DashboardGerencial should render initial state within threshold', () => {
    const start = performance.now();
    
    renderWithProviders(<DashboardGerencial />);
    
    const end = performance.now();
    const duration = end - start;
    
    expect(duration).toBeLessThan(200); // Dashboard is heavier
    console.log(`DashboardGerencial render time: ${duration.toFixed(2)}ms`);
  });
});