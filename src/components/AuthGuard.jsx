
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const AuthGuard = ({ children, allowedRoles, moduleId, crmRequired = false }) => {
  const { user, userContext, loading } = useAuth();
  const location = useLocation();

  // Because userContext is cached, this 'loading' check will be skipped on subsequent loads/refreshes
  // preventing the white screen flash.
  if (loading && !userContext) {
    return <LoadingSpinner message="Verificando autenticação e permissões..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userContext) {
    // Should ideally not happen due to cache, but as a fallback
    return <LoadingSpinner message="Carregando permissões do usuário..." />;
  }

  const hasRequiredRole = allowedRoles ? allowedRoles.includes(userContext.role) : true;
  const canAccessCrmModule = crmRequired ? userContext.canAccessCrm : true;
  const hasModulePermission = moduleId ? userContext.modulePermissions?.[moduleId] : true;
  
  if (!hasRequiredRole || !canAccessCrmModule || !hasModulePermission) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthGuard;
