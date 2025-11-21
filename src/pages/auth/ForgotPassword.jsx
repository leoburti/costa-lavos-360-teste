import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
});

const ForgotPassword = () => {
  const { sendPasswordResetEmail, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    const { error } = await sendPasswordResetEmail(data.email);
    if (!error) {
      navigate('/auth-confirmation?type=password_reset');
    }
  };

  return (
    <>
      <Helmet>
        <title>Recuperar Senha - Dashboard Costa Lavos</title>
      </Helmet>
      <AuthLayout
        title="Esqueceu sua senha?"
        description="Sem problemas. Insira seu e-mail e enviaremos um link para redefinir sua senha."
      >
        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar Link de Recuperação'}
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
      </AuthLayout>
    </>
  );
};

export default ForgotPassword;