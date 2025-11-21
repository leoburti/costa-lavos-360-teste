import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Database, Download, RefreshCw, UploadCloud } from 'lucide-react';

const BackupExportacaoPage = () => {
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    const interval = setInterval(() => {
        setBackupProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setIsBackingUp(false);
                return 100;
            }
            return prev + 10;
        });
    }, 300);
  };

  return (
    <>
      <Helmet><title>Backup - Configurações</title></Helmet>
      <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Backup e Dados</h2>
            <p className="text-muted-foreground">Gerencie cópias de segurança e exportação de dados.</p>
        </div>

        <ConfiguracaoGrupo titulo="Backup Automático" descricao="Configurações de rotina de backup.">
            <ConfiguracaoSwitch
                label="Backup Diário Automático"
                descricao="Realizar backup de todos os dados às 03:00 AM."
                checked={true}
                onCheckedChange={() => {}}
            />
            <div className="mt-4 p-4 border rounded-lg bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-primary" />
                    <div>
                        <p className="font-medium">Último Backup Bem-sucedido</p>
                        <p className="text-xs text-muted-foreground">Hoje às 03:00 AM • 450 MB</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleBackup} disabled={isBackingUp}>
                    {isBackingUp ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                    Fazer Backup Agora
                </Button>
            </div>
            {isBackingUp && (
                <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Processando...</span>
                        <span>{backupProgress}%</span>
                    </div>
                    <Progress value={backupProgress} className="h-2" />
                </div>
            )}
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo titulo="Exportação de Dados" descricao="Baixe seus dados em formatos portáteis.">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <FileIcon type="CSV" />
                    <h4 className="font-medium mt-2">Exportar Clientes</h4>
                    <p className="text-xs text-muted-foreground mb-3">Todos os dados de clientes.</p>
                    <Button variant="secondary" size="sm" className="w-full"><Download className="h-3 w-3 mr-2" /> Baixar CSV</Button>
                </div>
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <FileIcon type="JSON" />
                    <h4 className="font-medium mt-2">Exportar Vendas</h4>
                    <p className="text-xs text-muted-foreground mb-3">Histórico completo de vendas.</p>
                    <Button variant="secondary" size="sm" className="w-full"><Download className="h-3 w-3 mr-2" /> Baixar JSON</Button>
                </div>
                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <FileIcon type="XML" />
                    <h4 className="font-medium mt-2">Exportar Relatórios</h4>
                    <p className="text-xs text-muted-foreground mb-3">Relatórios gerados no mês.</p>
                    <Button variant="secondary" size="sm" className="w-full"><Download className="h-3 w-3 mr-2" /> Baixar XML</Button>
                </div>
            </div>
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

const FileIcon = ({ type }) => (
    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
        {type}
    </div>
)

export default BackupExportacaoPage;