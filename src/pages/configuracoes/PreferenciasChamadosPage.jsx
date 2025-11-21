import React from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoInput from '@/components/ConfiguracaoInput';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';

const PreferenciasChamadosPage = () => {
  return (
    <>
      <Helmet><title>Chamados (APoio) - Configurações</title></Helmet>
      <div className="space-y-8">
        <ConfiguracaoGrupo
          titulo="Atribuição Automática"
          descricao="Configure regras para atribuição automática de chamados."
        >
          <ConfiguracaoSwitch label="Ativar atribuição automática por geolocalização" />
          <ConfiguracaoSwitch label="Ativar atribuição automática por tipo de chamado" checked />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Prioridades e SLAs"
          descricao="Defina os tempos de resposta e solução para cada prioridade."
        >
          <ConfiguracaoInput label="SLA de Resposta para Prioridade Alta (horas)" tipo="number" valor="2" />
          <ConfiguracaoInput label="SLA de Solução para Prioridade Alta (dias)" tipo="number" valor="1" />
          <ConfiguracaoInput label="SLA de Resposta para Prioridade Normal (horas)" tipo="number" valor="8" />
          <ConfiguracaoInput label="SLA de Solução para Prioridade Normal (dias)" tipo="number" valor="3" />
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default PreferenciasChamadosPage;