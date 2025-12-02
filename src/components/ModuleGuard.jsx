import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { hasPermission, getUserRole, getUserPermissions } from '@/utils/permissions';
import Unauthorized from '@/components/Unauthorized';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * Componente de proteção de módulo baseado em permissões.
 * 
 * @param {Object} props
 * @param {string|string[]} props.moduleId - ID do módulo ou permissão necessária
 * @param {React.ReactNode} props.fallback - Componente customizado para acesso negado
 */
const ModuleGuard = ({ 
    children, 
    moduleId, 
    fallback = <Unauthorized /> 
}) => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user && moduleId) {
            const authorized = hasPermission(user, moduleId);
            if (!authorized) {
                console.warn(`[ModuleGuard] Acesso negado.`, {
                    userEmail: user.email,
                    userRole: getUserRole(user),
                    moduleId: moduleId,
                    userPermissions: getUserPermissions(user)
                });
            }
        }
    }, [user, loading, moduleId]);

    // 1. Aguarda carregamento
    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center min-h-[400px]">
                <LoadingSpinner message="Verificando permissões..." />
            </div>
        );
    }

    // 2. Verifica autenticação
    if (!user) {
        return fallback;
    }

    // 3. Se não tem ID de módulo, assume rota pública/protegida apenas por login
    if (!moduleId) {
        return children;
    }

    // 4. Verifica permissão usando a lógica centralizada (que inclui bypass de Admin)
    const authorized = hasPermission(user, moduleId);

    if (!authorized) {
        return fallback;
    }

    return children;
};

export default ModuleGuard;