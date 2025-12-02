import { supabase } from '@/lib/customSupabaseClient';

// Limpa a sessão do Supabase do localStorage
const clearAuthSession = () => {
    console.log('[AuthService] Limpando sessão de autenticação do localStorage.');
    try {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') && key.includes('auth-token')) {
                localStorage.removeItem(key);
            }
        });
    } catch (e) {
        console.error("Erro ao limpar localStorage:", e);
    }
};

// Função para lidar com erros de autenticação
export const handleAuthError = (error) => {
    if (!error) return;
    
    console.error('[AuthService] Erro de autenticação detectado:', error.message);
    
    const isCriticalAuthError = 
        error.message.includes('Invalid Refresh Token') ||
        error.message.includes('Refresh Token Not Found') ||
        error.message.includes('invalid JWT') ||
        error.message.includes('JWT expired');

    if (isCriticalAuthError) {
        clearAuthSession();
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }
};

// Função de Login
export const signIn = async (email, password) => {
    console.log(`[AuthService] Tentando login para o e-mail: ${email}`);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if(error) {
        console.error("[AuthService] Erro no login:", error.message);
    }
    return { error };
};

// Logout explícito
export const logout = async () => {
    console.log('[AuthService] Realizando logout...');
    try {
        await supabase.auth.signOut();
    } catch (e) {
        console.error('[AuthService] Exceção durante logout:', e);
    } finally {
        clearAuthSession();
        window.location.href = '/login';
    }
};