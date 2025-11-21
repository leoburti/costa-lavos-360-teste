import React from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';
import ConfiguracaoInput from '@/components/ConfiguracaoInput';

const PreferenciasRelatoriosPage = () => {
  return (
    <>
      <Helmet><title>Relatórios (APoio) - Configurações</title></Helmet>
      <div className="space-y-8">
        <ConfiguracaoGrupo
          titulo="Exportação Padrão"
          descricao="Defina o formato padrão para exportação de relatórios."
        >
          <ConfiguracaoInput label="Formato Padrão" tipo="select" valor="xlsx" opcoes={[{ valor: 'xlsx', label: 'Excel (XLSX)' }, { valor: 'csv', label: 'CSV' }, { valor: 'pdf', label: 'PDF' }]} />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Envio Automático"
          descricao="Configure o envio automático de relatórios para seu e-mail."
        >
          <ConfiguracaoSwitch label="Ativar envio semanal do relatório de desempenho" />
          <ConfiguracaoSwitch label="Ativar envio mensal do relatório de comodato" checked />
          <ConfiguracaoInput label="E-mails para envio (separados por vírgula)" tipo="text" valor="gerencia@costalavos.com" />
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default PreferenciasRelatoriosPage;