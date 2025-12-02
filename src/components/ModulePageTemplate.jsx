import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

/**
 * Template padrão para páginas que ainda estão em construção ou são wrappers simples.
 */
export default function ModulePageTemplate({ title, children, actions }) {
  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <Helmet>
        <title>{title} | Costa Lavos 360</title>
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">Módulo Costa Lavos Enterprise</p>
        </div>
        <div className="flex gap-2">
          {actions}
          <Button variant="ghost" size="icon">
            <RefreshCw className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[400px]">
        {children || (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-50">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900">Funcionalidade em Desenvolvimento</h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              Esta tela está sendo migrada para a nova arquitetura modular.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}