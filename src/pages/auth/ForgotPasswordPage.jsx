import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { loading, error, success, requestReset } = usePasswordReset();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await requestReset(email);
    
    // Sucesso é tratado pelo estado 'success' renderizando o componente alternativo
  };

  if (success) {
    return (
      <>
        <Helmet>
          <title>Email Enviado - Costa Lavos 360</title>
        </Helmet>
        <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4">
          <Card className="w-full max-w-md text-center p-6">
            <CardContent className="space-y-6 pt-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Email Enviado</h2>
                <p className="text-muted-foreground">
                  Verifique seu email para instruções de recuperação de senha. O link expira em 1 hora.
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                Voltar para o Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Recuperar Senha - Costa Lavos 360</title>
      </Helmet>
      <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <div className="p-6 text-center border-b">
            <h2 className="text-2xl font-bold">Recuperar Senha</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Digite seu email para receber o link de redefinição
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              {error && (
                <div className="p-3 rounded bg-destructive/10 text-destructive text-sm font-medium text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Email'
                )}
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para o Login
                </Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
};

export default ForgotPasswordPage;