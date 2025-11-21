import React from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';
import ConfiguracaoInput from '@/components/ConfiguracaoInput';

const PreferenciasDashboardPage = () => {
  return (
    <>
      <Helmet><title>Dashboard (APoio) - Configurações</title></Helmet>
      <div className="space-y-8">
        <ConfiguracaoGrupo
          titulo="Visualização Padrão"
          descricao="Escolha qual dashboard será exibido ao acessar a tela de relatórios."
        >
          <ConfiguracaoInput label="Dashboard Padrão" tipo="select" valor="geral" opcoes={[{ valor: 'geral', label: 'Dashboard Geral' }, { valor: 'operacional', label: 'Dashboard Operacional' }]} />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Atualização Automática"
          descricao="Defina com que frequência os dados do dashboard devem ser atualizados."
        >
          <ConfiguracaoSwitch label="Ativar atualização automática dos widgets" checked />
          <ConfiguracaoInput label="Intervalo de atualização (minutos)" tipo="number" valor="15" />
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default PreferenciasDashboardPage;