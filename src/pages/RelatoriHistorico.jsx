import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Eye, Download, Calendar } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

const HISTORICO_INICIAL = [
  {
    id: 1,
    relatorio: 'Vendas Diário',
    acessado: new Date(Date.now() - 15 * 60 * 1000),
    duracao: '5 min',
    acao: 'Visualizado',
    tipo: 'view'
  },
  {
    id: 2,
    relatorio: 'Desempenho Vendedor',
    acessado: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duracao: '-',
    acao: 'Exportado (PDF)',
    tipo: 'export'
  },
  {
    id: 3,
    relatorio: 'Financeiro Receita',
    acessado: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    duracao: '3 min',
    acao: 'Visualizado',
    tipo: 'view'
  },
  {
    id: 4,
    relatorio: 'Cliente Carteira',
    acessado: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    duracao: '-',
    acao: 'Agendado (Email)',
    tipo: 'schedule'
  },
];

export default function RelatoriHistorico() {
  const [historico] = useState(HISTORICO_INICIAL);

  const getIcon = (tipo) => {
    switch(tipo) {
      case 'export': return <Download className="h-4 w-4 text-green-500" />;
      case 'schedule': return <Calendar className="h-4 w-4 text-purple-500" />;
      default: return <Eye className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <RelatoriLayout title="Histórico de Atividades">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{historico.filter(h => h.tipo === 'view').length}</div>
              <p className="text-xs text-gray-500 uppercase font-semibold mt-1">Visualizações</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{historico.filter(h => h.tipo === 'export').length}</div>
              <p className="text-xs text-gray-500 uppercase font-semibold mt-1">Exportações</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{historico.length}</div>
              <p className="text-xs text-gray-500 uppercase font-semibold mt-1">Total de Ações</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Registro de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Relatório</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Duração</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-full">
                            {getIcon(item.tipo)}
                          </div>
                          <span className="font-medium text-gray-900">{item.relatorio}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {item.acessado.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{item.duracao}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                          ${item.tipo === 'view' ? 'bg-blue-100 text-blue-700' : 
                            item.tipo === 'export' ? 'bg-green-100 text-green-700' : 
                            'bg-purple-100 text-purple-700'}`}>
                          {item.acao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </RelatoriLayout>
  );
}