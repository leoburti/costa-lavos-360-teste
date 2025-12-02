import { useAuth } from '@/contexts/SupabaseAuthContext';

const ROLE_PERMISSIONS = {
  admin: ['all'],
  manager: ['vendas', 'desempenho', 'financeiro', 'clientes'],
  supervisor: ['vendas', 'desempenho'],
  seller: ['vendas'],
};

export function useAccessControl() {
  const { user } = useAuth();

  const hasPermission = (resource) => {
    if (!user) return false;
    const userRole = user.role || 'seller'; // Default to seller if no role
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    
    if (permissions.includes('all')) return true;
    return permissions.includes(resource);
  };

  const canAccess = (path) => {
    if (!user) return false;
    
    // Normalize path to check permissions
    if (path.includes('vendas')) return hasPermission('vendas');
    if (path.includes('desempenho')) return hasPermission('desempenho');
    if (path.includes('financeiro')) return hasPermission('financeiro');
    if (path.includes('cliente')) return hasPermission('clientes');
    if (path.includes('operacional')) return hasPermission('operacional');
    if (path.includes('agendamento')) return hasPermission('all') || hasPermission('manager');
    if (path.includes('access-control')) return hasPermission('all');
    
    return true; // Allow access to generic pages like dashboard
  };

  return { hasPermission, canAccess };
}