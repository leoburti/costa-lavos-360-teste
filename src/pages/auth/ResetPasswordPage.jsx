/**
 * PÁGINA: RESET PASSWORD
 * Versão corrigida com validação de expiração de token
 * 
 * ANTES: Sem validação de expiração
 * DEPOIS: Valida se token está expirado
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';
import { Lock } from 'lucide-react';

/**
 * ResetPasswordPage Component
 * 
 * SEGURANÇA:
 * - Valida se token está expirado
 * - Redireciona se token inválido
 * - Mostra mensagem de erro clara
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);

  // ===== VALIDAR TOKEN AO CARREGAR =====
  useEffect(() => {
    const validateToken = async () => {
      try {
        setValidatingToken(true);
        setError(null);

        // ===== OBTER SESSÃO (VALIDA TOKEN NA URL AUTOMATICAMENTE) =====
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // ===== TOKEN INVÁLIDO OU EXPIRADO =====
          setTokenValid(false);
          setError(new Error('Token expirado ou inválido. Solicite um novo link de reset.'));

          toast({
            title: 'Token expirado',
            description: 'Solicite um novo link de reset de senha',
            variant: 'destructive',
          });

          // ===== REDIRECIONAR APÓS 3 SEGUNDOS =====
          setTimeout(() => {
            navigate('/forgot-password');
          }, 3000);

          return;
        }

        // ===== TOKEN VÁLIDO =====
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
        setError(err);

        toast({
          title: 'Erro ao validar token',
          description: err.message,
          variant: 'destructive',
        });

        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [navigate, toast]);

  // ===== HANDLER: SUBMETER NOVO PASSWORD =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===== VALIDAÇÕES =====
    if (!newPassword || !confirmPassword) {
      setError(new Error('Preencha todos os campos'));
      return;
    }

    if (newPassword.length < 8) {
      setError(new Error('Senha deve ter pelo menos 8 caracteres'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(new Error('Senhas não combinam'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ===== ATUALIZAR SENHA =====
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError);
        return;
      }

      // ===== SUCESSO =====
      toast({
        title: 'Sucesso',
        description: 'Senha atualizada com sucesso',
        variant: 'default',
        className: 'bg-green-500 text-white',
      });

      // ===== REDIRECIONAR PARA LOGIN =====
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDERIZAR: Validando token =====
  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Validando token...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-4">Aguarde um momento</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== RENDERIZAR: Token inválido =====
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Token Expirado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              O link de reset de senha expirou. Solicite um novo link.
            </p>
            <Button
              onClick={() => navigate('/forgot-password')}
              className="w-full"
            >
              Solicitar Novo Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== RENDERIZAR: Formulário de reset =====
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Redefinir Senha</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ===== ERRO ===== */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error.message}
              </div>
            )}

            {/* ===== NOVA SENHA ===== */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                disabled={loading}
              />
            </div>

            {/* ===== CONFIRMAR SENHA ===== */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a senha"
                disabled={loading}
              />
            </div>

            {/* ===== BOTÃO SUBMIT ===== */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>

            {/* ===== LINK PARA LOGIN ===== */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Voltar para Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPasswordPage;