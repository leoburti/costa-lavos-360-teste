
import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Zap, DollarSign, Clock } from 'lucide-react';
import RelatoriLayout from '@/pages/relatorios/components/RelatoriLayout'; // Corrected import path

export default function RelatorioDashboard() {
  const { user } = useAuth();
  // Fetch some data to make the dashboard alive, e.g., daily sales for a quick sparkline or total
  const { data: vendas } = useAnalyticalData('get_relatorio_vendas_diario', {
    p_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    p_end_date: new Date().toISOString().split('T')[0],
  });

  const relatorios = useMemo(() => {
    const baseRelatorios = [
      {
        id: 1,
        title: 'Vendas',
        icon: TrendingUp,
        count: 8,
        color: 'bg-blue-100 text-blue-700',
        path: '/relatorio-vendas-diario',
      },
      {
        id: 2,
        title: 'Desempenho',
        icon: BarChart3,
        count: 7,
        color: 'bg-green-100 text-green-700',
        path: '/relatorio-desempenho-vendedor',
      },
      {
        id: 3,
        title: 'Financeiro',
        icon: DollarSign,
        count: 6,
        color: 'bg-purple-100 text-purple-700',
        path: '/relatorio-financeiro-receita',
      },
      {
        id: 4,
        title: 'Clientes',
        icon: Users,
        count: 6,
        color: 'bg-orange-100 text-orange-700',
        path: '/relatorio-cliente-carteira',
      },
      {
        id: 5,
        title: 'Operacional',
        icon: Zap,
        count: 6,
        color: 'bg-red-100 text-red-700',
        path: '/relatorio-operacional-estoque',
      },
    ];

    const userRole = user?.role?.toLowerCase() || 'seller';

    // Filtrar relatórios por role
    if (userRole === 'vendedor' || userRole === 'seller') {
      return baseRelatorios.filter(r => r.title === 'Vendas');
    }
    if (userRole === 'supervisor') {
      return baseRelatorios.filter(r => ['Vendas', 'Desempenho'].includes(r.title));
    }
    if (userRole === 'gerente' || userRole === 'manager') {
      return baseRelatorios.filter(r => ['Vendas', 'Desempenho', 'Financeiro'].includes(r.title));
    }
    return baseRelatorios; // Admin sees all
  }, [user?.role]);

  return (
    <RelatoriLayout title="Dashboard de Relatórios">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Bem-vindo, {user?.name || 'Usuário'}!</h2>
          <p className="text-gray-600">Acesse seus relatórios analíticos abaixo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatorios.map((relatorio) => {
            const Icon = relatorio.icon;
            return (
              <Card
                key={relatorio.id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-transparent hover:border-l-primary"
                onClick={() => window.location.href = relatorio.path}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${relatorio.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {relatorio.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{relatorio.count}</p>
                  <p className="text-sm text-gray-600">relatórios disponíveis</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm border-b pb-2">
                <span className="text-gray-600">Relatório de Vendas Diário</span>
                <span className="text-gray-400">Hoje, 09:30</span>
              </div>
              <div className="flex items-center justify-between text-sm border-b pb-2">
                <span className="text-gray-600">Performance da Equipe</span>
                <span className="text-gray-400">Ontem, 14:15</span>
              </div>
              <p className="text-xs text-gray-500 pt-2">Seu histórico de visualização de relatórios.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RelatoriLayout>
  );
}
