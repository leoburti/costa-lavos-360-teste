import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-9xl font-extrabold text-primary tracking-tighter">404</h1>
      <p className="text-2xl font-medium text-foreground mt-4">Página não encontrada</p>
      <p className="text-muted-foreground mt-2">
        Desculpe, a página que você está procurando não existe.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Voltar para o Dashboard</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;