import { isDevelopment } from '@/lib/utils';

/**
 * URL base da aplicação.
 * Em desenvolvimento, aponta para o servidor local.
 * Em produção, deve ser a URL do seu site.
 */
const appBaseUrl = isDevelopment
  ? 'http://localhost:3000' // URL de desenvolvimento
  : 'https://seu-dominio.com'; // TODO: Substituir pela URL de produção

/**
 * URL de redirecionamento para o callback de autenticação do Supabase.
 */
const authRedirectUrl = `${appBaseUrl}/auth/confirm`;

/**
 * Configurações centralizadas do Supabase.
 */
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  auth: {
    redirectTo: authRedirectUrl,
  },
};