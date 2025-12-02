import React from 'react';
import ModulePageTemplate from '@/components/ModulePageTemplate';
import UsersPermissionsPage from '@/pages/configuracoes/usuarios/UsersPermissionsPage';

export default function Permissoes() {
  return (
    <ModulePageTemplate title="Permissões de Acesso">
      <UsersPermissionsPage />
    </ModulePageTemplate>
  );
}