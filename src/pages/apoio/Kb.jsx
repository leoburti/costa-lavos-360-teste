import React from 'react';
import ModulePageTemplate from '@/components/ModulePageTemplate';
import BaseConhecimentoList from '@/pages/apoio/base-conhecimento/BaseConhecimentoList';

export default function Kb() {
  return (
    <ModulePageTemplate title="Base de Conhecimento">
      <BaseConhecimentoList />
    </ModulePageTemplate>
  );
}