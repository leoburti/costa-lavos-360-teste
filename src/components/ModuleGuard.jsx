
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const ModuleGuard = ({ moduleId, children }) => {
    const { userContext, loading, session } = useAuth();
    const location = useLocation();

    // 1. Loading State: Wait for auth to resolve
    if (loading) {
        return <div className="h-full w-full flex items-center justify-center"><LoadingSpinner message="Verificando permissões..." /></div>;
    }

    // 2. Auth Check: If no session or context, redirect to login
    if (!session || !userContext) {
        console.warn(`[ModuleGuard] No session/context found. Redirecting to login from: ${location.pathname}`);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Admin Override: Admin roles grant universal access
    const userRole = userContext.role || '';
    const isUniversalAdmin = ['admin', 'nivel 1', 'nível 1', 'nivel 5', 'nível 5', 'super admin'].includes(userRole.toLowerCase());

    if (isUniversalAdmin) {
        return children;
    }

    // 4. No Module ID: If route doesn't require specific module, allow access
    if (!moduleId) {
        return children;
    }

    // 5. Strict Permission Check
    // Check if the exact module key exists and is set to true in modulePermissions
    const hasAccess = userContext.modulePermissions?.[moduleId] === true;

    // 6. Debugging & Access Control
    if (!hasAccess) {
        console.warn(`[ModuleGuard] Access DENIED to ${location.pathname}`);
        console.warn(`- User: ${userContext.fullName} (Role: ${userRole})`);
        console.warn(`- Required Module: ${moduleId}`);
        console.warn(`- Has Permission? ${hasAccess}`);
        console.debug('- Available Permissions:', userContext.modulePermissions);
        
        // Redirect to Unauthorized page instead of generic dashboard to avoid infinite loops
        return <Navigate to="/unauthorized" state={{ 
            requiredModule: moduleId, 
            userRole: userRole,
            userEmail: userContext.email,
            from: location.pathname
        }} replace />;
    }

    return children;
};

export default ModuleGuard;
