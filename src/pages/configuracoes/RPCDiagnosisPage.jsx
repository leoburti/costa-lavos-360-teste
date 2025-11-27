import React from 'react';
import { RPC_MIGRATION_MAP } from '@/config/rpc_migration_map';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, AlertTriangle, CheckCircle2, FileCode, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const RPCDiagnosisPage = () => {
  const totalFiles = RPC_MIGRATION_MAP.reduce((acc, group) => acc + group.files.length, 0);
  const totalGroups = RPC_MIGRATION_MAP.length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Database className="h-8 w-8 text-primary" />
          Diagnóstico de Migração RPC
        </h1>
        <p className="text-muted-foreground">
          Mapeamento dos arquivos que necessitam de migração de Mock Data para RPC Functions reais.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Arquivos Mapeados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
            <p className="text-xs text-muted-foreground">Componentes identificados com Mock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Módulos Afetados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups}</div>
            <p className="text-xs text-muted-foreground">Áreas funcionais do sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                Ação Necessária
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Migração pendente para dados reais</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          Os arquivos listados abaixo estão operando com dados estáticos (MOCK) ou legados. 
          Para cada arquivo, a RPC Function recomendada já foi identificada no banco de dados.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {RPC_MIGRATION_MAP.map((group, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileCode className="h-5 w-5 text-slate-500" />
                {group.module}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-auto max-h-[500px]">
                <div className="divide-y">
                  {group.files.map((file, fIndex) => (
                    <div key={fIndex} className="p-4 hover:bg-slate-50 transition-colors grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      {/* File Info */}
                      <div className="md:col-span-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{file.component}</span>
                          <Badge variant="secondary" className="text-[10px] font-normal bg-slate-100 text-slate-600">
                            {file.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono truncate" title={file.path}>
                          {file.path}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="md:col-span-1 flex justify-center md:justify-start">
                        <ArrowRight className="h-4 w-4 text-slate-300" />
                      </div>

                      {/* RPC Info */}
                      <div className="md:col-span-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
                            RPC
                          </Badge>
                          <span className="font-mono text-sm font-medium text-blue-900">
                            {file.rpc}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Params: {file.params}
                        </p>
                      </div>

                      {/* Description */}
                      <div className="md:col-span-3 text-xs text-slate-500 border-l pl-4 hidden md:block">
                        {file.description}
                      </div>

                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RPCDiagnosisPage;