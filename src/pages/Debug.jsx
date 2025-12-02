import React from 'react';
import { modulesStructure } from '@/config/modulesStructure';
import { validateModulesStructure } from '@/lib/configValidator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

export default function DebugPage() {
  const validation = validateModulesStructure(modulesStructure);
  
  const stats = {
    modules: modulesStructure.length,
    groups: modulesStructure.reduce((acc, m) => acc + (m.groups?.length || 0), 0),
    pages: modulesStructure.reduce((acc, m) => {
      const groupPages = (m.groups || []).reduce((gAcc, g) => gAcc + (g.pages?.length || 0), 0);
      return acc + groupPages + (m.pages?.length || 0);
    }, 0)
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Debug de Configuração</h1>
        {validation.valid ? (
          <Badge className="bg-emerald-600 text-white text-lg px-4 py-1">Configuração Válida</Badge>
        ) : (
          <Badge variant="destructive" className="text-lg px-4 py-1">Configuração Inválida</Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Módulos</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.modules}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Grupos</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.groups}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Páginas</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.pages}</div></CardContent>
        </Card>
      </div>

      {/* Errors & Warnings */}
      <div className="grid gap-4">
        {validation.errors.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <XCircle className="h-5 w-5" /> Erros Críticos ({validation.errors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-red-700 space-y-1">
                {validation.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {validation.warnings.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Avisos ({validation.warnings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-amber-700 space-y-1">
                {validation.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </CardContent>
          </Card>
        )}

        {validation.valid && validation.warnings.length === 0 && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="text-emerald-700 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Tudo certo!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-emerald-700">
              Nenhum problema encontrado na estrutura de modulesStructure.js.
            </CardContent>
          </Card>
        )}
      </div>

      {/* JSON Structure Viewer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" /> Estrutura Atual (JSON)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full rounded-md border bg-slate-950 p-4">
            <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
              {JSON.stringify(modulesStructure, null, 2)}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}