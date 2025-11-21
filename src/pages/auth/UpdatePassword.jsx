import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const updatePasswordSchema = z.object({
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'],
});

const UpdatePassword = () => {
  const { updateUserPassword, loading, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updatePasswordSchema),
  });

  useEffect(() => {
    if (!session) {
      const hash = window.location.hash;
      if (!hash.includes('access_token')) {
        toast({
          variant: 'destructive',
          title: 'Link Inválido',
          description: 'O link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo.',
        });
        navigate('/forgot-password');
      }
    }
  }, [session, navigate, toast]);

  const onSubmit = async (data) => {
    const { error } = await updateUserPassword(data.password);
    if (!error) {
      navigate('/login');
    }
  };

  return (
    <>
      <Helmet>
        <title>Atualizar Senha - Dashboard Costa Lavos</title>
      </Helmet>
      <AuthLayout
        title="Crie sua nova senha"
        description="Escolha uma senha forte e segura."
      >
        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirme a Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Nova Senha'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </AuthLayout>
    </>
  );
};

export default UpdatePassword;