/**
 * Utilitários para gestão do Modo de Manutenção e Permissões Relacionadas
 */

/**
 * Verifica se um usuário pode fazer bypass da manutenção
 * 
 * @param {Object} user - Objeto do usuário
 * @returns {boolean} true se usuário pode fazer bypass
 */
export function canBypassMaintenance(user) {
    if (!user) {
        return false;
    }
    
    // ===== VERIFICAR ROLE =====
    const userRole = getUserRole(user);
    // Normalizar para comparação
    const normalizedRole = String(userRole).toLowerCase();
    
    if (['admin', 'super_admin', 'nivel 5', 'nivel 1'].includes(normalizedRole)) {
        return true;
    }
    
    // ===== VERIFICAR LEVEL =====
    const userLevel = getUserLevel(user);
    if (userLevel >= 5) {
        return true;
    }
    
    // ===== VERIFICAR PERMISSÕES =====
    const userPermissions = getUserPermissions(user);
    if (userPermissions.includes('bypass_maintenance')) {
        return true;
    }
    
    return false;
}

/**
 * Obtém o role do usuário de várias fontes possíveis
 * 
 * @param {Object} user - Objeto do usuário
 * @returns {string|null} Role do usuário
 */
export function getUserRole(user) {
    if (!user) return null;
    
    // 1. Prioridade: user.role (do contexto enriquecido)
    if (user.role && typeof user.role === 'string') {
        return user.role;
    }
    
    // 2. Fallback: App Metadata (Supabase)
    if (user.app_metadata?.role && typeof user.app_metadata.role === 'string') {
        return user.app_metadata.role;
    }
    
    // 3. Fallback: User Metadata
    if (user.user_metadata?.role && typeof user.user_metadata.role === 'string') {
        return user.user_metadata.role;
    }
    
    return 'user'; // Default role
}

/**
 * Obtém o level do usuário
 * 
 * @param {Object} user - Objeto do usuário
 * @returns {number} Level do usuário (padrão: 0)
 */
export function getUserLevel(user) {
    if (!user) return 0;
    
    if (typeof user.level === 'number') return user.level;
    if (typeof user.app_metadata?.level === 'number') return user.app_metadata.level;
    if (typeof user.user_metadata?.level === 'number') return user.user_metadata.level;
    
    return 0;
}

/**
 * Obtém as permissões do usuário
 * 
 * @param {Object} user - Objeto do usuário
 * @returns {string[]} Array de permissões
 */
export function getUserPermissions(user) {
    if (!user) return [];
    
    if (Array.isArray(user.permissions)) return user.permissions;
    if (Array.isArray(user.app_metadata?.permissions)) return user.app_metadata.permissions;
    
    return [];
}

/**
 * Obtém informações de manutenção
 * 
 * @returns {Object} Informações de manutenção
 */
export function getMaintenanceInfo() {
    // Em produção, isso poderia vir de uma API ou config remota
    // Por enquanto, hardcoded ou via variáveis de ambiente se existissem
    return {
        isEnabled: true, // Ativo para teste
        returnDate: '08:00 do dia 01/12',
        message: 'Estamos realizando melhorias importantes no sistema. O acesso está temporariamente restrito para garantir a integridade dos dados.'
    };
}

/**
 * Calcula tempo restante até retorno da manutenção
 * 
 * @param {string} returnDate - Data de retorno (formato: "HH:MM do dia DD/MM")
 * @returns {Object} Tempo restante { days, hours, minutes, seconds, total }
 */
export function calculateTimeRemaining(returnDate) {
    // ===== VALIDAÇÃO =====
    if (!returnDate || typeof returnDate !== 'string') {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    // ===== PARSE DA DATA =====
    // Tenta formato ISO primeiro (se vier do DB)
    let targetDate;
    
    if (returnDate.includes('T') || returnDate.includes('-')) {
        const parsed = new Date(returnDate);
        if (!isNaN(parsed.getTime())) {
            targetDate = parsed;
        }
    }
    
    // Se não for ISO, tenta formato customizado "HH:MM do dia DD/MM"
    if (!targetDate) {
        const match = returnDate.match(/(\d{2}):(\d{2}) do dia (\d{2})\/(\d{2})/);
        
        if (match) {
            const [, hours, minutes, day, month] = match;
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            
            targetDate = new Date(
                currentYear,
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hours),
                parseInt(minutes),
                0
            );
            
            // Se data já passou no ano atual, assume próximo ano
            if (targetDate < currentDate) {
                targetDate.setFullYear(currentYear + 1);
            }
        }
    }

    if (!targetDate) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    // ===== CALCULAR DIFERENÇA =====
    const currentDate = new Date();
    const diff = targetDate - currentDate;
    
    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        total: diff,
    };
}

/**
 * Formata tempo restante para exibição
 * 
 * @param {Object} time - Objeto com dias, horas, minutos, segundos
 * @returns {string} Tempo formatado
 */
export function formatTimeRemaining(time) {
    const parts = [];
    
    if (time.days > 0) parts.push(`${time.days}d`);
    if (time.hours > 0) parts.push(`${time.hours}h`);
    if (time.minutes > 0) parts.push(`${time.minutes}m`);
    parts.push(`${time.seconds}s`);
    
    return parts.join(' ');
}