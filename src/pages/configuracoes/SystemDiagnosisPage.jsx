import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Database, 
  Server, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Search,
  Construction
} from 'lucide-react';
import MaintenanceControlModal from '@/components/maintenance/MaintenanceControlModal';
import { useMaintenance } from '@/hooks/useMaintenance';

const SystemDiagnosisPage = () => {
  const navigate = useNavigate();
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const { maintenanceStatus } = useMaintenance();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <MaintenanceControlModal 
        isOpen={isMaintenanceModalOpen} 
        onClose={() => setIsMaintenanceModalOpen(false)} 
      />

      <div>
        <h3 className="text-lg font-medium">Diagnóstico e Saúde do Sistema</h3>
        <p className="text-sm text-muted-foreground">
          Ferramentas para monitoramento, análise e correção de problemas no sistema.
        </p>
      </div>

      {/* Maintenance Mode Control Card */}
      <Card className={`border-l-4 shadow-sm transition-all ${maintenanceStatus.isActive ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-slate-300'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Construction className={`h-6 w-6 ${maintenanceStatus.isActive ? 'text-amber-600' : 'text-slate-600'}`} />
              Modo de Manutenção
            </CardTitle>
            {maintenanceStatus.isActive ? (
              <Badge variant="destructive" className="bg-amber-600 hover:bg-amber-700 animate-pulse">ATIVO</Badge>
            ) : (
              <Badge variant="outline" className="text-slate-500">INATIVO</Badge>
            )}
          </div>
          <CardDescription className="text-base mt-2">
            Controle o acesso ao sistema durante janelas de atualização. Quando ativo, apenas administradores conseguem acessar a plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {maintenanceStatus.isActive && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-100 p-3 rounded-md mb-4 border border-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                <strong>Atenção:</strong> O sistema está bloqueado para usuários comuns até {maintenanceStatus.endTime ? new Date(maintenanceStatus.endTime).toLocaleString() : 'indefinido'}.
              </span>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Utilize esta ferramenta antes de realizar grandes migrações de dados ou atualizações críticas de infraestrutura.
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => setIsMaintenanceModalOpen(true)} 
            variant={maintenanceStatus.isActive ? "outline" : "default"}
            className="gap-2"
          >
            {maintenanceStatus.isActive ? "Gerenciar / Desativar" : "Ativar Manutenção"}
          </Button>
        </CardFooter>
      </Card>

      {/* Main Quick Access Card for Forensic Tool */}
      <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 via-background to-background shadow-sm hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
              <ShieldAlert className="h-6 w-6" />
              Diagnóstico Forense de Dados
            </CardTitle>
            <Badge variant="destructive" className="uppercase text-[10px]">Nova Ferramenta</Badge>
          </div>
          <CardDescription className="text-base mt-2">
            Ferramenta avançada para inspeção profunda do banco de dados Supabase. 
            Utilize esta opção se os dashboards estiverem vazios ou se houver suspeita de falhas na integração de dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Database className="h-4 w-4" /> Verifica tabelas vazias
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Search className="h-4 w-4" /> Analisa dados zerados
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Server className="h-4 w-4" /> Testa funções RPC
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => navigate('/configuracoes/diagnostico-forense')} 
            variant="destructive" 
            className="w-full sm:w-auto gap-2"
            size="lg"
          >
            Acessar Ferramenta Forense <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-blue-500" />
              Auto-Diagnóstico
            </CardTitle>
            <CardDescription>
              Verificação rápida automática de conexões e serviços básicos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/configuracoes/auto-diagnostico')}
            >
              Executar Check-up
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-5 w-5 text-green-500" />
              Integridade RPC
            </CardTitle>
            <CardDescription>
              Teste específico das Stored Procedures do banco de dados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/configuracoes/rpc-diagnostico')}
            >
              Testar RPCs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-5 w-5 text-orange-500" />
              Logs do Sistema
            </CardTitle>
            <CardDescription>
              Visualize logs de erros e atividades recentes da aplicação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/configuracoes/logs')}
            >
              Ver Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status dos Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Banco de Dados (Supabase)
              </span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Online</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                API Edge Functions
              </span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Online</Badge>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Storage (Arquivos)
              </span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                Integração IA (OpenAI)
              </span>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Intermitente</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemDiagnosisPage;