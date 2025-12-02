import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { FileQuestion, Home, ArrowLeft, MessageSquare as MessageSquareWarning } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const NotFoundPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.warn(`[404] Rota não encontrada: ${location.pathname}`);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Helmet>
        <title>Página Não Encontrada (404) | Costa Lavos</title>
      </Helmet>
      
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardContent className="pt-10 pb-8 px-8 text-center flex flex-col items-center">
          <div className="bg-orange-50 p-4 rounded-full mb-6 animate-in zoom-in duration-300">
            <FileQuestion className="h-12 w-12 text-orange-500" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">404</h1>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Página não encontrada</h2>
          
          <p className="text-slate-500 mb-8 leading-relaxed">
            A rota <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono text-sm">{location.pathname}</code> não existe ou foi movida.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="default" 
              className="w-full gap-2" 
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4" />
              Ir para o Início
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-slate-400 hover:text-slate-600 gap-2"
              onClick={() => console.log("Reportar problema na rota:", location.pathname)}
            >
              <MessageSquareWarning className="h-3 w-3" />
              Reportar link quebrado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;