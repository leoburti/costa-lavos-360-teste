import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(1, { message: 'A senha não pode estar em branco.' }),
});

const LoginPage = () => {
  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const onSubmit = async (data) => {
    await signIn(data.email, data.password);
  };

  const isLoading = authLoading || isSubmitting;

  return (
    <>
      <Helmet>
        <title>Login - Costa Lavos 360</title>
        <meta name="description" content="Acesse sua conta para visualizar os dashboards." />
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
                                <Link to="/forgot-password" className={`text-sm text-primary hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
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