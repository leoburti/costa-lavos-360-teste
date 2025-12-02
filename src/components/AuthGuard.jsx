import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useMaintenance } from '@/hooks/useMaintenance';
import { canBypassMaintenance } from '@/utils/maintenance';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import MaintenancePage from '@/components/maintenance/MaintenancePage';
import Unauthorized from '@/components/Unauthorized';
import { hasPermission } from '@/utils/permissions';

const AuthGuard = ({ children, requiredPermission = null }) => {
  const { session, user: contextUser, loading: authLoading } = useAuth();
  const { maintenanceStatus, loading: maintenanceLoading } = useMaintenance();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);

  // Garantir que temos o objeto usuário
  const currentUser = contextUser || session?.user;
  const loading = authLoading || maintenanceLoading;

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setShowTimeout(true), 8000); // 8s timeout
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // 1. Loading State
  if (loading) {
    if (showTimeout) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-2">A conexão está demorando...</h2>
            <p className="text-slate-600 mb-6">Verifique sua internet ou tente recarregar.</p>
            <Button onClick={() => window.location.reload()} className="bg-primary text-white">
              <RefreshCw className="mr-2 h-4 w-4" /> Recarregar
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

  // 2. Auth Check
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Maintenance Check
  // Se o modo manutenção está ativo e o usuário NÃO pode ignorar (não é admin), mostra a tela de bloqueio.
  // Se for admin, passa direto (Bypass implícito - SEM BANNER no topo).
  if (maintenanceStatus.isActive) {
    const canBypass = canBypassMaintenance(currentUser);
    
    if (!canBypass) {
      return <MaintenancePage endTime={maintenanceStatus.endTime} message={maintenanceStatus.message} />;
    }
  }

  // 4. Permission Check
  if (requiredPermission) {
    if (!hasPermission(currentUser, requiredPermission)) {
      return <Unauthorized />;
    }
  }

  return children;
};

export default AuthGuard;