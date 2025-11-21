import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MailCheck, KeyRound } from 'lucide-react';

const AuthConfirmation = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  const content = {
    signup: {
      icon: <MailCheck className="h-16 w-16 text-primary" />,
      title: 'Verifique seu E-mail',
      description: 'Enviamos um link de confirmação para o seu endereço de e-mail. Por favor, clique no link para ativar sua conta.',
    },
    password_reset: {
      icon: <KeyRound className="h-16 w-16 text-primary" />,
      title: 'Link de Recuperação Enviado',
      description: 'Enviamos um link para o seu e-mail. Siga as instruções para criar uma nova senha.',
    },
  };

  const selectedContent = content[type] || content.signup;

  return (
    <>
      <Helmet>
        <title>{selectedContent.title} - Dashboard Costa Lavos</title>
      </Helmet>
      <AuthLayout
        title={selectedContent.title}
        description={selectedContent.description}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-10 pb-10">
            <div className="p-4 bg-primary/10 rounded-full">
              {selectedContent.icon}
            </div>
            <p className="text-center text-muted-foreground">
              Se você não receber o e-mail em alguns minutos, verifique sua pasta de spam.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Voltar para o Login</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    </>
  );
};

export default AuthConfirmation;