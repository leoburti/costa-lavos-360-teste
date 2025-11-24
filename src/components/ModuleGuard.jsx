
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const ModuleGuard = ({ moduleId, children }) => {
    const { userContext, loading } = useAuth();
    const location = useLocation();

    if (loading && !userContext) {
        return <div className="h-full w-full flex items-center justify-center"><LoadingSpinner message="Verificando permissões..." /></div>;
    }

    if (!userContext) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 1. Admin Override: Only STRICT Admin roles grant universal access
    // 'Vendedor' (Level 2) or 'Supervisor' (Level 2/3) MUST NOT bypass this.
    const isUniversalAdmin = ['Admin', 'Nivel 1', 'Nível 1'].includes(userContext.role);

    if (isUniversalAdmin) {
        return children;
    }

    // 2. No Module ID: If the route doesn't require a specific module, allow access
    if (!moduleId) {
        return children;
    }

    // 3. Strict Permission Check: Check if the exact module key exists and is true
    // userContext.modulePermissions comes from the merged JSONB in Postgres (Persona + User overrides)
    const hasAccess = userContext.modulePermissions?.[moduleId] === true;

    // 4. Debugging for development (visible in console)
    if (!hasAccess) {
        console.warn(`[ModuleGuard] Access DENIED.`);
        console.warn(`- User: ${userContext.fullName} (${userContext.role})`);
        console.warn(`- Target Module: ${moduleId}`);
        console.warn(`- Has Permission? ${hasAccess}`);
        console.debug('- Available Permissions:', userContext.modulePermissions);
        
        return <Navigate to="/unauthorized" state={{ 
            requiredModule: moduleId, 
            userRole: userContext.role,
            userEmail: userContext.email
        }} replace />;
    }

    return children;
};

export default ModuleGuard;
