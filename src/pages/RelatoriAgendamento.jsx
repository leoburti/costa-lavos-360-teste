import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Mail, Plus, Trash2 } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

export default function RelatoriAgendamento() {
  const [agendamentos, setAgendamentos] = useState([
    {
      id: 1,
      relatorio: 'Vendas Diário',
      frequencia: 'Diário',
      horario: '08:00',
      email: 'user@example.com',
      ativo: true,
    },
    {
      id: 2,
      relatorio: 'Desempenho Vendedor',
      frequencia: 'Semanal',
      horario: '09:00',
      email: 'user@example.com',
      ativo: true,
    },
  ]);

  const [novoAgendamento, setNovoAgendamento] = useState({
    relatorio: '',
    frequencia: 'Diário',
    horario: '08:00',
    email: '',
  });

  const adicionarAgendamento = () => {
    if (novoAgendamento.relatorio && novoAgendamento.email) {
      setAgendamentos([
        ...agendamentos,
        {
          id: agendamentos.length + 1,
          ...novoAgendamento,
          ativo: true,
        },
      ]);
      setNovoAgendamento({
        relatorio: '',
        frequencia: 'Diário',
        horario: '08:00',
        email: '',
      });
    }
  };

  const removerAgendamento = (id) => {
    setAgendamentos(prev => prev.filter(a => a.id !== id));
  };

  return (
    <RelatoriLayout title="Agendamento de Relatórios">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Relatório</label>
                  <Input
                    placeholder="Ex: Vendas Mensal"
                    value={novoAgendamento.relatorio}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, relatorio: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Frequência</label>
                    <select
                      value={novoAgendamento.frequencia}
                      onChange={(e) => setNovoAgendamento({ ...novoAgendamento, frequencia: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      <option>Diário</option>
                      <option>Semanal</option>
                      <option>Mensal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Horário</label>
                    <Input
                      type="time"
                      value={novoAgendamento.horario}
                      onChange={(e) => setNovoAgendamento({ ...novoAgendamento, horario: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Email de Destino</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={novoAgendamento.email}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, email: e.target.value })}
                  />
                </div>
                <Button onClick={adicionarAgendamento} className="w-full mt-2">
                  Agendar Envio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agendamentos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agendamentos.map((agendamento) => (
                  <div key={agendamento.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <h3 className="font-semibold text-gray-900">{agendamento.relatorio}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {agendamento.frequencia}
                        </span>
                        <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {agendamento.horario}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Mail className="h-3.5 w-3.5" />
                          {agendamento.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerAgendamento(agendamento.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                ))}
                
                {agendamentos.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Nenhum agendamento configurado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RelatoriLayout>
  );
}