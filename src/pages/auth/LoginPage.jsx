import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { signIn } from '@/utils/auth';  // ✅ IMPORT FIX
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      console.log('[LoginPage] Tentando fazer login com:', data.email);
      await signIn(data.email, data.password); // ✅ Correct function call
      console.log('[LoginPage] Login bem-sucedido, redirecionando...');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('[LoginPage] Erro ao fazer login:', error);
      setError('root', {
        message: error.message || 'Credenciais inválidas ou erro no servidor.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Costa Lavos 360</title>
        <meta name="description" content="Acesse sua conta." />
      </Helmet>
      <div className="min-h-screen w-full bg-muted/40 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <img alt="Costa Lavos Logo" className="mx-auto h-16 w-auto mb-4" src="https://horizons-cdn.hostinger.com/af07f265-a066-448a-97b1-ed36097a0659/d98b9d622b00f6c8b5946b730fbc2780.png" />
            </div>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Bem-vindo de volta!</CardTitle>
                    <CardDescription>Acesse sua conta para continuar.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                {...register('email')}
                                className={errors.email ? 'border-destructive' : ''}
                                disabled={isLoading}
                                autoComplete="email"
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register('password')}
                                className={errors.password ? 'border-destructive' : ''}
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        {errors.root && (
                            <div className="p-3 rounded bg-destructive/10 text-destructive text-sm font-medium text-center">
                                {errors.root.message}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Entrar'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
      </div>
    </>
  );
};

export default LoginPage;