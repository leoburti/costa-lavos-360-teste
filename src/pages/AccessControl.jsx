
import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
// FIX: Correct import path for RelatoriLayout
import { RelatoriLayout } from '@/pages/relatorios/components/RelatoriLayout';

const ROLE_PERMISSIONS = {
  admin: {
    label: 'Administrador',
    color: 'bg-red-100 text-red-700 hover:bg-red-200',
    permissions: [
      { name: 'Visualizar todos os relatórios', granted: true },
      { name: 'Editar configurações', granted: true },
      { name: 'Gerenciar usuários', granted: true },
      { name: 'Acessar dados financeiros', granted: true },
      { name: 'Exportar relatórios', granted: true },
      { name: 'Agendar relatórios', granted: true },
      { name: 'Visualizar histórico de acessos', granted: true },
      { name: 'Gerenciar permissões', granted: true },
    ],
  },
  manager: {
    label: 'Gerente',
    color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    permissions: [
      { name: 'Visualizar relatórios de vendas', granted: true },
      { name: 'Visualizar relatórios de desempenho', granted: true },
      { name: 'Visualizar relatórios financeiros', granted: true },
      { name: 'Exportar relatórios', granted: true },
      { name: 'Editar configurações pessoais', granted: true },
      { name: 'Agendar relatórios', granted: true },
      { name: 'Visualizar dados de clientes', granted: true },
      { name: 'Gerenciar usuários', granted: false },
    ],
  },
  supervisor: {
    label: 'Supervisor',
    color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    permissions: [
      { name: 'Visualizar relatórios de vendas', granted: true },
      { name: 'Visualizar relatórios de desempenho', granted: true },
      { name: 'Exportar relatórios', granted: true },
      { name: 'Editar configurações pessoais', granted: true },
      { name: 'Visualizar dados de clientes', granted: true },
      { name: 'Agendar relatórios', granted: false },
      { name: 'Visualizar dados financeiros', granted: false },
      { name: 'Gerenciar usuários', granted: false },
    ],
  },
  seller: {
    label: 'Vendedor',
    color: 'bg-green-100 text-green-700 hover:bg-green-200',
    permissions: [
      { name: 'Visualizar meus relatórios', granted: true },
      { name: 'Exportar meus relatórios', granted: true },
      { name: 'Editar configurações pessoais', granted: true },
      { name: 'Visualizar relatórios de vendas', granted: false },
      { name: 'Visualizar relatórios de desempenho', granted: false },
      { name: 'Visualizar dados financeiros', granted: false },
      { name: 'Agendar relatórios', granted: false },
      { name: 'Gerenciar usuários', granted: false },
    ],
  },
};

export default function AccessControl() {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'seller';
  const roleInfo = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.seller;

  return (
    <RelatoriLayout title="Controle de Acesso">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Perfil e Permissões</h2>
            <p className="text-gray-600">Visualize suas permissões atuais no sistema.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seu Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 font-medium">Nome</p>
                <p className="text-lg font-semibold">{user?.name || 'Usuário'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Email</p>
                <p className="text-lg font-semibold">{user?.email || 'email@exemplo.com'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Função Atribuída</p>
                <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matriz de Permissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleInfo.permissions.map((permission, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    permission.granted ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  {permission.granted ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${permission.granted ? 'text-green-900' : 'text-gray-500'}`}>
                    {permission.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RelatoriLayout>
  );
}
