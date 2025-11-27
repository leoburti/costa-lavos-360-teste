import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn(`[404] User attempted to access non-existent route: ${location.pathname}`);
  }, [location]);

  return (
    <>
      <Helmet>
        <title>Página Não Encontrada (404) - Costa Lavos</title>
      </Helmet>
      <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in duration-500">
        <h1 className="text-9xl font-extrabold text-primary tracking-tighter drop-shadow-sm">404</h1>
        <p className="text-2xl font-medium text-foreground mt-4">Página não encontrada</p>
        <p className="text-muted-foreground mt-2 max-w-md">
          Desculpe, a página <strong>{location.pathname}</strong> que você está procurando não existe ou foi movida.
        </p>
        <Button asChild className="mt-8 shadow-lg hover:shadow-xl transition-all">
          <Link to="/">Voltar para o Dashboard</Link>
        </Button>
      </div>
    </>
  );
};

export default NotFoundPage;