import React from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';
import ConfiguracaoInput from '@/components/ConfiguracaoInput';

const PreferenciasComodatoPage = () => {
  return (
    <>
      <Helmet><title>Comodato (APoio) - Configurações</title></Helmet>
      <div className="space-y-8">
        <ConfiguracaoGrupo
          titulo="Contratos"
          descricao="Defina as configurações padrão para novos contratos de comodato."
        >
          <ConfiguracaoInput label="Duração Padrão do Contrato (meses)" tipo="number" valor="12" />
          <ConfiguracaoSwitch label="Exigir assinatura digital na criação do contrato" checked />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Alertas de Equipamentos"
          descricao="Configure alertas para o gerenciamento de equipamentos em comodato."
        >
          <ConfiguracaoSwitch label="Alertar sobre equipamentos sem movimentação há mais de 90 dias" checked />
          <ConfiguracaoSwitch label="Alertar quando o estoque de um modelo estiver baixo" />
          <ConfiguracaoInput label="Nível baixo de estoque (unidades)" tipo="number" valor="5" />
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default PreferenciasComodatoPage;