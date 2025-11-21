import React from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ConfiguracoesAvancadasAPoioPage = () => {
  const { toast } = useToast();

  const handleAction = (action) => {
    toast({
      title: "Ação Executada (Simulação)",
      description: `A ação "${action}" foi executada com sucesso.`,
    });
  };

  return (
    <>
      <Helmet><title>Avançadas (APoio) - Configurações</title></Helmet>
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription>
            As configurações nesta página afetam todo o sistema APoio. Altere com cuidado.
          </AlertDescription>
        </Alert>

        <ConfiguracaoGrupo
          titulo="Modo de Manutenção"
          descricao="Ative o modo de manutenção para realizar atualizações no sistema. Apenas administradores poderão acessar."
        >
          <ConfiguracaoSwitch label="Ativar Modo de Manutenção" />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Logs do Sistema"
          descricao="Gerencie o nível de detalhe dos logs para depuração."
        >
          <ConfiguracaoSwitch label="Ativar logs detalhados (debug mode)" />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Ações Perigosas"
          descricao="Estas ações são irreversíveis e devem ser usadas com extrema cautela."
        >
          <div className="space-y-4">
            <Button variant="destructive" onClick={() => handleAction('Limpar cache de todos os relatórios')}>Limpar Cache de Relatórios</Button>
            <p className="text-sm text-muted-foreground">Força a regeneração de todos os relatórios na próxima vez que forem acessados.</p>
          </div>
           <div className="space-y-4 mt-4">
            <Button variant="destructive" onClick={() => handleAction('Resetar configurações do APoio para o padrão')}>Resetar Configurações do APoio</Button>
            <p className="text-sm text-muted-foreground">Restaura todas as configurações do módulo APoio para os valores padrão de fábrica.</p>
          </div>
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default ConfiguracoesAvancadasAPoioPage;