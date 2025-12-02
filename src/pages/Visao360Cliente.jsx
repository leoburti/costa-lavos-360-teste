import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import Client360Selector from '@/components/Client360/Client360Selector';
import { Search, Users } from 'lucide-react';

export default function Visao360Cliente() {
  const navigate = useNavigate();

  const handleSelect = (client) => {
    if (client && client.id) {
      navigate(`/visao-360-cliente/${client.id}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 animate-in fade-in zoom-in duration-500">
      <Helmet><title>Busca 360° | Costa Lavos</title></Helmet>
      
      <div className="text-center mb-8">
        <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-4">
          <Users className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Visão 360° do Cliente</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Acesse o histórico completo, vendas, equipamentos e chamados de qualquer cliente.
        </p>
      </div>

      <Card className="w-full max-w-2xl border-slate-200 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-slate-700">Buscar Cliente</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Client360Selector onSelect={handleSelect} />
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center mt-4">
              Busque por Razão Social, Nome Fantasia, Código ou CNPJ.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}