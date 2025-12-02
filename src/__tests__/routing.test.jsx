import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/tests/test-utils';
import App from '@/App';
import { modulesStructure } from '@/config/modulesStructure';

// Flatten routes for testing
const getAllRoutes = () => {
  const routes = [];
  modulesStructure.forEach(module => {
    module.groups?.forEach(group => {
      group.pages?.forEach(page => {
        const pageSlug = page.path || page.id;
        // Construct path logic matching SidebarMenu
        const fullPath = pageSlug.startsWith('/') ? pageSlug : `/${module.id}/${pageSlug}`;
        routes.push({ path: fullPath, label: page.label, id: page.id });
      });
    });
  });
  return routes;
};

// Mock Lazy Components to load instantly for testing
// This is tricky with dynamic imports in ModuleRouter. 
// We'll trust the Suspense fallback helps us wait.

describe('Routing System', () => {
  const routes = getAllRoutes();

  // Test first 5 routes to save time in this suite, or all if fast
  const routesToTest = routes.slice(0, 5); 

  it.each(routesToTest)('should render route $path without crashing', async ({ path, label }) => {
    renderWithProviders(<App />, { route: path });

    // Check if layout is present
    await waitFor(() => {
      expect(screen.getByText('Costa Lavos')).toBeInTheDocument(); // Header/Sidebar presence
    });

    // Check if page specific content might be loading or rendered
    // Since we are using real lazy imports, we might see "Carregando..." or the actual page
    // We mainly want to ensure no "Uncaught Error" boundary is hit
    const hasContent = 
      screen.queryByText(label) || 
      screen.queryByText(/carregando/i) ||
      screen.queryByText(/dashboard/i);
      
    expect(hasContent).toBeTruthy();
  });

  it('should show 404 for invalid routes', async () => {
    renderWithProviders(<App />, { route: '/invalid/route/xyz' });
    
    await waitFor(() => {
      // Assuming we have a NotFound page or text
      expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument();
    });
  });
});