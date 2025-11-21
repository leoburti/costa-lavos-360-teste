import React from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';
import ConfiguracaoInput from '@/components/ConfiguracaoInput';

const DadosClientesPage = () => {
  return (
    <>
      <Helmet><title>Dados de Clientes (APoio) - Configurações</title></Helmet>
      <div className="space-y-8">
        <ConfiguracaoGrupo
          titulo="Sincronização de Dados"
          descricao="Configure como os dados dos clientes são sincronizados com sistemas externos."
        >
          <ConfiguracaoSwitch label="Ativar sincronização automática diária" checked />
          <ConfiguracaoInput label="Horário da sincronização" tipo="time" valor="02:00" />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Cache de Dados"
          descricao="Defina por quanto tempo os dados dos clientes devem ser mantidos em cache para melhorar a performance."
        >
          <ConfiguracaoInput label="Tempo de vida do cache (horas)" tipo="number" valor="24" />
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default DadosClientesPage;