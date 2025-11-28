import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useMaintenance } from '@/hooks/useMaintenance';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import MaintenancePage from '@/components/maintenance/MaintenancePage';
import MaintenanceBanner from '@/components/maintenance/MaintenanceBanner';

const AuthGuard = ({ children }) => {
  const { user, loading: authLoading, session, userRole, hasPermission } = useAuth();
  const { maintenanceStatus, loading: maintenanceLoading } = useMaintenance();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);

  const loading = authLoading || maintenanceLoading;

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setShowTimeout(true), 10000); // 10s timeout
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    if (showTimeout) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Carregando...</h2>
            <p className="text-slate-600 mb-6">Estamos tendo dificuldade para conectar ao servidor.</p>
            <Button onClick={() => window.location.reload()} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
              <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <LoadingSpinner message="Verificando acesso..." />
      </div>
    );
  }

  if (!session || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Maintenance Mode Check
  if (maintenanceStatus.isActive) {
    // Admins bypass maintenance mode
    // Check strictly for admin roles
    const isAdmin = userRole === 'Nivel 1' || userRole === 'Admin' || userRole === 'Nível 1' || userRole === 'Nivel 5' || userRole === 'Nível 5';
    
    if (!isAdmin) {
      return <MaintenancePage endTime={maintenanceStatus.endTime} message={maintenanceStatus.message} />;
    }

    // If admin, show banner and allow access
    return (
      <>
        <MaintenanceBanner />
        {children}
      </>
    );
  }

  return children;
};

export default AuthGuard;