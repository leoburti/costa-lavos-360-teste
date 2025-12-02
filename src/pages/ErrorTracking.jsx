import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Trash2 } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

const ERROS_INICIAIS = [
  {
    id: 1,
    tipo: 'TypeError',
    mensagem: 'Cannot read property of undefined',
    arquivo: 'RelatoriTable.jsx:45',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    ocorrencias: 3,
  },
  {
    id: 2,
    tipo: 'NetworkError',
    mensagem: 'Failed to fetch data',
    arquivo: 'useAnalyticalData.js:23',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    ocorrencias: 1,
  },
  {
    id: 3,
    tipo: 'ValidationError',
    mensagem: 'Invalid date format',
    arquivo: 'RelatoriFilters.jsx:67',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    ocorrencias: 2,
  },
];

export default function ErrorTracking() {
  const [erros, setErros] = useState(ERROS_INICIAIS);

  const removerErro = (id) => {
    setErros(prev => prev.filter(e => e.id !== id));
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'TypeError':
        return 'bg-red-100 text-red-700';
      case 'NetworkError':
        return 'bg-orange-100 text-orange-700';
      case 'ValidationError':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <RelatoriLayout title="Rastreamento de Erros">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total de Erros</p>
              <p className="text-3xl font-bold">{erros.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Ocorrências</p>
              <p className="text-3xl font-bold">{erros.reduce((sum, e) => sum + e.ocorrencias, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Taxa de Erro</p>
              <p className="text-3xl font-bold text-green-600">0.02%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Erros Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {erros.map((erro) => (
                <div key={erro.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${getTipoColor(erro.tipo)}`}>
                          {erro.tipo}
                        </span>
                        <span className="text-xs text-gray-600">{erro.ocorrencias}x</span>
                      </div>
                      <p className="font-semibold">{erro.mensagem}</p>
                      <p className="text-sm text-gray-600 mt-1">{erro.arquivo}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {erro.timestamp.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <button
                      onClick={() => removerErro(erro.id)}
                      className="text-gray-400 hover:text-red-600 p-2"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RelatoriLayout>
  );
}