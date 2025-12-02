
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

import { CombinedAuthProvider } from '@/contexts/SupabaseAuthContext';
import { FilterProvider } from '@/contexts/FilterContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PageActionProvider } from '@/contexts/PageActionContext';
import { DataProvider } from '@/contexts/DataContext';

import AuthGuard from '@/components/AuthGuard';
import AppLayout from '@/layouts/AppLayout'; 
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/error-boundary/ErrorBoundary';
import OfflineIndicator from '@/components/OfflineIndicator';
import ForensicFloatingButton from '@/components/ForensicFloatingButton';
import PageSkeleton from '@/components/PageSkeleton';
import { TooltipProvider } from "@/components/ui/tooltip";

import { ROUTES } from '@/constants/routes';

// Lazy Pages - Core
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));

// Debug Page (Dev Only)
const DebugPage = lazy(() => import('@/pages/Debug'));

// Dynamic Modular Router (Generic)
const ModuleRouter = lazy(() => import('@/components/ModuleRouter'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, 
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <TooltipProvider>
              <CombinedAuthProvider>
                <NotificationProvider>
                  <FilterProvider>
                    <PageActionProvider>
                      <DataProvider>
                        <OfflineIndicator />
                        {/* ForensicFloatingButton mantido para debug/suporte, mas discreto */}
                        <ForensicFloatingButton />
                        
                        <Routes>
                          <Route path={ROUTES.LOGIN} element={<Suspense fallback={null}><LoginPage /></Suspense>} />
                          <Route path="/forgot-password" element={<Suspense fallback={null}><ForgotPasswordPage /></Suspense>} />
                          <Route path="/reset-password" element={<Suspense fallback={null}><ResetPasswordPage /></Suspense>} />
                          <Route path="/unauthorized" element={<Suspense fallback={null}><UnauthorizedPage /></Suspense>} />

                          {/* Debug Route - Dev Only */}
                          {process.env.NODE_ENV === 'development' && (
                            <Route path="/debug" element={<Suspense fallback={null}><DebugPage /></Suspense>} />
                          )}

                          <Route path="/" element={
                            <AuthGuard>
                              <AppLayout />
                            </AuthGuard>
                          }>
                            <Route index element={<Navigate to="/analytics/dashboard-gerencial" replace />} />
                            
                            {/* NEW MODULAR ARCHITECTURE ROUTING */}
                            <Route 
                              path="/:module/:page" 
                              element={
                                <Suspense fallback={<div className="p-8"><PageSkeleton /></div>}>
                                  <ModuleRouter />
                                </Suspense>
                              } 
                            />

                            {/* LEGACY ROUTE ALIASES */}
                            <Route path="/dashboard" element={<Navigate to="/analytics/dashboard-gerencial" replace />} />
                            <Route path="/gerencial" element={<Navigate to="/analytics/dashboard-gerencial" replace />} />
                            <Route path="/settings" element={<Navigate to="/configuracoes/geral" replace />} />
                            
                            <Route path="*" element={<NotFoundPage />} />
                          </Route>
                        </Routes>
                        <Toaster />
                      </DataProvider>
                    </PageActionProvider>
                  </FilterProvider>
                </NotificationProvider>
              </CombinedAuthProvider>
            </TooltipProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  );
}
