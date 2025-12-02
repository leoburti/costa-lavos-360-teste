import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

const LOGS_INICIAIS = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    nivel: 'INFO',
    mensagem: 'Usuário fez login',
    usuario: 'user@example.com',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    nivel: 'INFO',
    mensagem: 'Relatório de Vendas acessado',
    usuario: 'user@example.com',
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    nivel: 'WARNING',
    mensagem: 'Tentativa de acesso negada',
    usuario: 'unauthorized@example.com',
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    nivel: 'INFO',
    mensagem: 'Dados exportados',
    usuario: 'user@example.com',
  },
];

export default function SystemLogs() {
  const [logs] = useState(LOGS_INICIAIS);
  const [searchTerm, setSearchTerm] = useState('');

  const logsFiltrados = logs.filter(log =>
    log.mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'INFO':
        return 'bg-blue-100 text-blue-700';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-700';
      case 'ERROR':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <RelatoriLayout title="Logs do Sistema">
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logsFiltrados.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-3 border rounded-lg">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getNivelColor(log.nivel)}`}>
                    {log.nivel}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">{log.mensagem}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{log.usuario}</span>
                      <span>{log.timestamp.toLocaleString('pt-BR')}</span>
                    </div>
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