import { useAuth } from '@/contexts/SupabaseAuthContext';
import { 
    hasPermission as checkPermission, 
    getUserPermissions as getRawPermissions, 
    isAdmin as checkIsAdmin, 
    isManager as checkIsManager,
    PERMISSIONS
} from '@/utils/permissions';

/**
 * Hook para verificar permissões do usuário no contexto atual
 */
export function usePermissions() {
    const { user } = useAuth();
    
    return {
        /**
         * Verifica se o usuário atual tem uma permissão
         * @param {string|string[]} permission 
         * @param {string} mode 'any' | 'all'
         */
        hasPermission: (permission, mode = 'any') => 
            checkPermission(user, permission, mode),
        
        /**
         * Retorna todas as permissões do usuário atual
         */
        getPermissions: () => 
            getRawPermissions(user),
        
        /**
         * Atalho para verificar se é admin
         */
        isAdmin: () => 
            checkIsAdmin(user),
        
        /**
         * Atalho para verificar se é gestor
         */
        isManager: () => 
            checkIsManager(user),

        /**
         * Constantes de permissões
         */
        PERMISSIONS
    };
}

export default usePermissions;