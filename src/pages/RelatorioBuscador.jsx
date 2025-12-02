import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Star } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

const TODOS_RELATORIOS = [
  { id: 1, title: 'Vendas Diário', category: 'Vendas', path: '/relatorio-vendas-diario', icon: '📊' },
  { id: 2, title: 'Vendas Mensal', category: 'Vendas', path: '/relatorio-vendas-mensal', icon: '📊' },
  { id: 3, title: 'Vendas Anual', category: 'Vendas', path: '/relatorio-vendas-anual', icon: '📊' },
  { id: 4, title: 'Vendas por Vendedor', category: 'Vendas', path: '/relatorio-vendas-por-vendedor', icon: '👤' },
  { id: 5, title: 'Vendas por Região', category: 'Vendas', path: '/relatorio-vendas-por-regiao', icon: '🗺️' },
  { id: 6, title: 'Desempenho Vendedor', category: 'Desempenho', path: '/relatorio-desempenho-vendedor', icon: '📈' },
  { id: 7, title: 'Desempenho Ranking', category: 'Desempenho', path: '/relatorio-desempenho-ranking', icon: '🏆' },
  { id: 8, title: 'Financeiro Receita', category: 'Financeiro', path: '/relatorio-financeiro-receita', icon: '💰' },
  { id: 9, title: 'Financeiro Lucratividade', category: 'Financeiro', path: '/relatorio-financeiro-lucratividade', icon: '💵' },
  { id: 10, title: 'Cliente Carteira', category: 'Clientes', path: '/relatorio-cliente-carteira', icon: '👥' },
  { id: 11, title: 'Cliente Churn', category: 'Clientes', path: '/relatorio-cliente-churn', icon: '⚠️' },
  { id: 12, title: 'Operacional Estoque', category: 'Operacional', path: '/relatorio-operacional-estoque', icon: '📦' },
  { id: 13, title: 'Operacional Pedidos', category: 'Operacional', path: '/relatorio-operacional-pedidos', icon: '🛒' },
];

export default function RelatorioBuscador() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [favoritos, setFavoritos] = useState([1, 6]); // Mock favorites

  const relatoriosFiltrados = useMemo(() => {
    return TODOS_RELATORIOS.filter(r =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const toggleFavorito = (id) => {
    setFavoritos(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <RelatoriLayout title="Buscador de Relatórios">
      <div className="space-y-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar relatórios por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 text-lg shadow-sm"
          />
        </div>

        {searchTerm && (
          <p className="text-sm text-gray-500 text-center">
            Encontrados {relatoriosFiltrados.length} resultados para "{searchTerm}"
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatoriosFiltrados.map((relatorio) => (
            <Card
              key={relatorio.id}
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 duration-200"
              onClick={() => window.location.href = relatorio.path}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl bg-gray-50 p-2 rounded-md">{relatorio.icon}</span>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-800">{relatorio.title}</CardTitle>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mt-1">{relatorio.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorito(relatorio.id);
                    }}
                    className="text-gray-300 hover:text-yellow-400 transition-colors"
                  >
                    <Star
                      className="h-5 w-5"
                      fill={favoritos.includes(relatorio.id) ? 'currentColor' : 'none'}
                      color={favoritos.includes(relatorio.id) ? '#fbbf24' : 'currentColor'}
                    />
                  </button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {relatoriosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum relatório encontrado</h3>
            <p className="text-gray-500">Tente buscar por outros termos ou categorias.</p>
          </div>
        )}
      </div>
    </RelatoriLayout>
  );
}