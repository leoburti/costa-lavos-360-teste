
/**
 * Verifica se um usuário tem uma permissão específica
 * 
 * IMPORTANTE: Admin (role === 'admin' | 'Nivel 1' | 'Nivel 5') têm acesso a TUDO
 * 
 * @param {Object} user - Objeto do usuário
 * @param {string|string[]} requiredPermission - Permissão(ões) necessária(s)
 * @param {string} mode - 'any' (padrão) ou 'all'
 * @returns {boolean}
 */
export function hasPermission(user, requiredPermission, mode = 'any') {
    // ===== VALIDAÇÃO =====
    if (!user) {
        return false;
    }
    
    // Se não exige permissão específica, permite (público ou protegido apenas por login)
    if (!requiredPermission) {
        return true;
    }

    // Normalizar Roles para comparação (case insensitive e sem espaços extras)
    const userRole = getUserRole(user)?.toLowerCase().trim() || '';
    const userLevel = getUserLevel(user);

    // ===== BYPASS GLOBAL PARA ADMINS E NÍVEL 5 =====
    // Roles que têm acesso irrestrito a tudo
    const SUPER_ROLES = ['admin', 'nivel 1', 'nível 1', 'nivel 5', 'nível 5', 'super_admin', 'super admin'];
    
    if (SUPER_ROLES.includes(userRole) || userLevel >= 5) {
        return true;
    }
    
    // ===== OBTER PERMISSÕES DO USUÁRIO =====
    const userPermissions = getUserPermissions(user);
    const lowerCasePermissions = userPermissions.map(p => p.toLowerCase());
    
    // ===== CONVERTER REQUERIDO PARA ARRAY =====
    const requiredPermissions = Array.isArray(requiredPermission)
        ? requiredPermission
        : [requiredPermission];
    
    const lowerCaseRequired = requiredPermissions.map(p => p.toLowerCase());

    // ===== VERIFICAR PERMISSÕES =====
    if (mode === 'all') {
        return lowerCaseRequired.every(perm => 
            lowerCasePermissions.includes(perm)
        );
    } else {
        // Mode 'any'
        return lowerCaseRequired.some(perm => 
            lowerCasePermissions.includes(perm)
        );
    }
}

/**
 * Obtém o role do usuário de várias fontes possíveis
 */
export function getUserRole(user) {
    if (!user) return null;
    
    // 1. user.role (Prioridade: Contexto enriquecido do banco de dados)
    if (user.role && typeof user.role === 'string') return user.role;
    
    // 2. Metadados do App (Supabase)
    if (user.app_metadata?.role) return user.app_metadata.role;
    
    // 3. Metadados do Usuário (Supabase)
    if (user.user_metadata?.role) return user.user_metadata.role;
    
    return null;
}

/**
 * Obtém o level numérico do usuário
 */
export function getUserLevel(user) {
    if (!user) return 0;
    
    // 1. Propriedade direta
    if (typeof user.level === 'number') return user.level;
    if (typeof user.nivel === 'number') return user.nivel;
    if (typeof user.nivel_acesso === 'number') return user.nivel_acesso;

    // 2. Parse de role se for "Nivel X"
    const role = getUserRole(user);
    if (role) {
        const normalizedRole = role.toLowerCase().trim();
        if (normalizedRole.startsWith('nivel ') || normalizedRole.startsWith('nível ')) {
            const levelPart = normalizedRole.split(' ')[1];
            const parsed = parseInt(levelPart, 10);
            if (!isNaN(parsed)) return parsed;
        }
    }

    // 3. Metadados
    if (typeof user.app_metadata?.level === 'number') return user.app_metadata.level;
    
    return 0;
}

/**
 * Obtém todas as permissões de um usuário normalizadas em um array de strings
 * Combina module_permissions (objeto), permissions (array) e metadados.
 */
export function getUserPermissions(user) {
    if (!user) return [];
    
    const perms = new Set();

    // 1. Role como permissão
    const role = getUserRole(user);
    if (role && role !== 'authenticated') {
        perms.add(role);
    }

    // 2. Array de permissões explícito
    if (Array.isArray(user.permissions)) {
        user.permissions.forEach(p => perms.add(p));
    }

    // 3. Objeto module_permissions (formato: { "crm": true, "financeiro": false })
    if (user.module_permissions && typeof user.module_permissions === 'object') {
        Object.entries(user.module_permissions).forEach(([key, value]) => {
            if (value === true) perms.add(key);
        });
    }

    // 4. Metadados do Supabase
    if (Array.isArray(user.app_metadata?.permissions)) {
        user.app_metadata.permissions.forEach(p => perms.add(p));
    }

    return Array.from(perms);
}

// Funções auxiliares de verificação rápida
export function isAdmin(user) {
    return hasPermission(user, ['admin', 'nivel 1', 'nível 1', 'nivel 5', 'nível 5', 'super_admin']);
}

export function isManager(user) {
    return hasPermission(user, ['admin', 'manager', 'gerente', 'supervisor', 'nivel 2']);
}

/**
 * Constantes de módulos para uso no sistema
 */
export const PERMISSIONS = {
    DASHBOARD: 'dashboard_comercial',
    CRM: 'crm',
    ANALYTICS: 'analytics',
    BONIFICACOES: 'bonificacoes',
    DELIVERY: 'delivery',
    MANUTENCAO: 'manutencao_equip',
    CONFIGURACOES: 'configuracoes',
    ADMIN_USERS: 'settings_users',
    FINANCIAL: 'financial_view',
    TASKS: 'tarefas',
    COMMERCIAL_ANALYSIS: 'commercial-analysis',
    MANAGERIAL_ANALYSIS: 'managerial-analysis',
    APOIO: 'apoio'
};
