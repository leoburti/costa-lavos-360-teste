import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  AlertTriangle, 
  FileSearch,
  Network,
  Server,
  Lock,
  History,
  Fingerprint,
  Search,
  CheckCircle2
} from 'lucide-react';

const ForensicDiagnosisPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Diagnóstico Forense do Sistema
        </h1>
        <p className="text-muted-foreground">
          Ferramentas avançadas para análise de integridade, segurança e performance da infraestrutura.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Button 
          size="lg" 
          className="w-full h-24 text-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg"
          onClick={() => navigate('/debug/analise-profunda')}
        >
          <Database className="mr-3 h-8 w-8" />
          <div className="flex flex-col items-start">
            <span>Análise Profunda do Banco de Dados</span>
            <span className="text-sm font-normal opacity-80">Verificar integridade da tabela bd-cl</span>
          </div>
        </Button>

        <Button 
          size="lg" 
          className="w-full h-24 text-lg bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 shadow-lg"
          onClick={() => navigate('/debug/verificacao-dados')}
        >
          <CheckCircle2 className="mr-3 h-8 w-8" />
          <div className="flex flex-col items-start">
            <span>Verificação de Dados em Massa</span>
            <span className="text-sm font-normal opacity-80">Testar todos os dashboards e páginas analíticas</span>
          </div>
        </Button>
      </div>

      <Alert variant="warning" className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Acesso Restrito</AlertTitle>
        <AlertDescription className="text-amber-700">
          Estas ferramentas executam consultas pesadas diretamente na base de dados. Use com cautela em horários de pico.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Integridade de Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-slate-500" />
              Integridade de Dados
            </CardTitle>
            <CardDescription>Verificação de consistência referencial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/configuracoes/diagnostico')}>
              <Activity className="mr-2 h-4 w-4" />
              Diagnóstico Rápido
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/configuracoes/rpc-diagnostico')}>
              <Network className="mr-2 h-4 w-4" />
              Mapeamento RPC
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/configuracoes/diagnostico-profundo')}>
              <FileSearch className="mr-2 h-4 w-4" />
              Validação de Estrutura
            </Button>
          </CardContent>
        </Card>

        {/* Auditoria e Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-slate-500" />
              Auditoria e Logs
            </CardTitle>
            <CardDescription>Rastreamento de atividades e erros</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/configuracoes/logs')}>
              <FileSearch className="mr-2 h-4 w-4" />
              Logs do Sistema
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Fingerprint className="mr-2 h-4 w-4" />
              Trilha de Auditoria (Em breve)
            </Button>
          </CardContent>
        </Card>

        {/* Segurança e Acesso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-slate-500" />
              Segurança
            </CardTitle>
            <CardDescription>Análise de permissões e vulnerabilidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/configuracoes/gestao-equipe')}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Revisão de Permissões
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Server className="mr-2 h-4 w-4" />
              Status dos Serviços (Em breve)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForensicDiagnosisPage;