import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export function usePasswordReset() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    success: false,
  });

  /**
   * Solicitar reset de senha
   */
  const requestReset = useCallback(async (email) => {
    setState({ loading: true, error: null, success: false });

    try {
      if (!email || !email.includes('@')) {
        throw new Error('Email inválido');
      }

      const { data, error } = await supabase.rpc(
        'send_password_reset_email',
        { p_email: email }
      );

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao enviar email');
      }

      setState({
        loading: false,
        error: null,
        success: true,
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Erro desconhecido';
      setState({
        loading: false,
        error: errorMessage,
        success: false,
      });

      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Resetar senha usando o token (via Edge Function)
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    setState({ loading: true, error: null, success: false });

    try {
      if (!token || !newPassword) {
        throw new Error('Token e senha são obrigatórios');
      }

      if (newPassword.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
      }

      // Invoca a Edge Function para processar o reset de forma segura
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { token, password: newPassword }
      });

      if (error) {
        console.error("Function invocation error:", error);
        throw new Error("Erro de conexão com o servidor");
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Token inválido ou erro ao processar');
      }

      setState({
        loading: false,
        error: null,
        success: true,
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Erro desconhecido';
      setState({
        loading: false,
        error: errorMessage,
        success: false,
      });

      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    ...state,
    requestReset,
    resetPassword,
  };
}