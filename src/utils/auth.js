import { supabase } from '@/lib/customSupabaseClient';

/**
 * Realiza login com email e senha
 * 
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Dados do usuário autenticado
 * @throws {Error} Erro de autenticação
 */
export async function signIn(email, password) {
    console.log('[signIn] Iniciando login para:', email);
    
    // ===== VALIDAÇÃO =====
    if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
    }
    
    if (!email.includes('@')) {
        throw new Error('Email inválido');
    }
    
    if (password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    
    try {
        // ===== AUTENTICAÇÃO COM SUPABASE =====
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) {
            console.error('[signIn] Erro de autenticação:', error);
            throw new Error(error.message || 'Erro ao fazer login');
        }
        
        if (!data.user) {
            throw new Error('Usuário não encontrado');
        }
        
        console.log('[signIn] Login bem-sucedido para:', email);
        return data.user;
    } catch (error) {
        console.error('[signIn] Erro:', error);
        throw error;
    }
}

/**
 * Realiza logout do usuário
 * 
 * @returns {Promise<void>}
 * @throws {Error} Erro ao fazer logout
 */
export async function signOut() {
    console.log('[signOut] Realizando logout');
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('[signOut] Erro ao fazer logout:', error);
            throw new Error(error.message || 'Erro ao fazer logout');
        }
        
        console.log('[signOut] Logout bem-sucedido');
    } catch (error) {
        console.error('[signOut] Erro:', error);
        throw error;
    }
}

/**
 * Realiza registro de novo usuário
 * 
 * @param {string} email - Email do novo usuário
 * @param {string} password - Senha do novo usuário
 * @param {Object} metadata - Metadados adicionais (opcional)
 * @returns {Promise<Object>} Dados do novo usuário
 */
export async function signUp(email, password, metadata = {}) {
    console.log('[signUp] Iniciando registro para:', email);
    
    if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
        
        if (error) {
            console.error('[signUp] Erro de registro:', error);
            throw new Error(error.message || 'Erro ao registrar');
        }
        
        return data.user;
    } catch (error) {
        console.error('[signUp] Erro:', error);
        throw error;
    }
}

/**
 * Realiza reset de senha
 * 
 * @param {string} email - Email do usuário
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {
    console.log('[resetPassword] Iniciando reset de senha para:', email);
    
    if (!email || !email.includes('@')) {
        throw new Error('Email inválido');
    }
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });
        
        if (error) {
            throw new Error(error.message || 'Erro ao resetar senha');
        }
        
        console.log('[resetPassword] Email de reset enviado para:', email);
    } catch (error) {
        console.error('[resetPassword] Erro:', error);
        throw error;
    }
}

/**
 * Obtém o usuário autenticado atual
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) return null;
        return user;
    } catch (error) {
        console.error('[getCurrentUser] Erro:', error);
        return null;
    }
}