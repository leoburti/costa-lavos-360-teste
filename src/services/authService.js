import { supabase } from '@/lib/customSupabaseClient';

// Limpa a sessão do Supabase do localStorage
const clearAuthSession = () => {
    console.log('[AuthService] Limpando sessão de autenticação do localStorage.');
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.includes('-auth-token')) {
            localStorage.removeItem(key);
        }
    });
};

// Função para lidar com erros de autenticação
export const handleAuthError = (error) => {
    console.error('[AuthService] Erro de autenticação detectado:', error.message);
    if (
        error.message.includes('Invalid Refresh Token') ||
        error.message.includes('Refresh Token Not Found') ||
        error.message.includes('invalid JWT')
    ) {
        clearAuthSession();
        window.location.href = '/login';
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
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('[AuthService] Erro durante o logout:', error.message);
    }
    clearAuthSession();
    window.location.href = '/login';
};