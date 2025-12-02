import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

const TESTES = [
  { id: 1, nome: 'Autenticação', status: 'passed', tempo: '2.3s' },
  { id: 2, nome: 'Autorização', status: 'passed', tempo: '1.8s' },
  { id: 3, nome: 'Carregamento de Dados', status: 'passed', tempo: '3.1s' },
  { id: 4, nome: 'Filtros', status: 'passed', tempo: '1.5s' },
  { id: 5, nome: 'Exportação', status: 'passed', tempo: '2.7s' },
  { id: 6, nome: 'Gráficos', status: 'passed', tempo: '2.1s' },
  { id: 7, nome: 'Tabelas', status: 'passed', tempo: '1.9s' },
  { id: 8, nome: 'Paginação', status: 'passed', tempo: '1.2s' },
  { id: 9, nome: 'Busca', status: 'passed', tempo: '1.4s' },
  { id: 10, nome: 'Notificações', status: 'passed', tempo: '0.8s' },
];

export default function TestingDashboard() {
  const [rodandoTestes, setRodandoTestes] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const passados = TESTES.filter(t => t.status === 'passed').length;
  const falhados = TESTES.filter(t => t.status === 'failed').length;
  const percentual = (passados / TESTES.length) * 100;

  return (
    <RelatoriLayout title="Dashboard de Testes">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total de Testes</p>
              <p className="text-3xl font-bold">{TESTES.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Passados</p>
              <p className="text-3xl font-bold text-green-600">{passados}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Falhados</p>
              <p className="text-3xl font-bold text-red-600">{falhados}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Taxa de Sucesso</p>
              <p className="text-3xl font-bold text-blue-600">{percentual.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados dos Testes</span>
              <Button onClick={() => setRodandoTestes(!rodandoTestes)}>
                {rodandoTestes ? 'Parando...' : 'Rodar Testes'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {TESTES.map((teste) => (
                <div key={teste.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(teste.status)}
                    <span className="font-medium">{teste.nome}</span>
                  </div>
                  <span className="text-sm text-gray-600">{teste.tempo}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RelatoriLayout>
  );
}