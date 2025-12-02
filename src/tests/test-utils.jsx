import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { vi } from 'vitest'; // Added import
import { CombinedAuthProvider } from '@/contexts/SupabaseAuthContext';
import { FilterProvider } from '@/contexts/FilterContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PageActionProvider } from '@/contexts/PageActionContext';
import { DataProvider } from '@/contexts/DataContext';

// Mock Auth Context to simulate logged-in user
vi.mock('@/contexts/SupabaseAuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: () => ({
      user: { id: '123', email: 'test@costalavos.com' },
      session: { access_token: 'mock-token' },
      signIn: vi.fn(),
      signOut: vi.fn(),
    }),
    CombinedAuthProvider: ({ children }) => <div>{children}</div>
  };
});

// Mock Supabase Client
vi.mock('@/lib/customSupabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
    }),
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    rpc: () => Promise.resolve({ data: [], error: null }),
  }
}));

// Create a client for testing
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
      cacheTime: 0,
    },
  },
});

export function renderWithProviders(ui, { route = '/', ...options } = {}) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <NotificationProvider>
              <FilterProvider>
                <PageActionProvider>
                  <DataProvider>
                    {children}
                  </DataProvider>
                </PageActionProvider>
              </FilterProvider>
            </NotificationProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </MemoryRouter>
    );
  }

  return {
    user: null, // Add userEvent here if needed
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}