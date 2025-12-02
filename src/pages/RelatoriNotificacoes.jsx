import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, X, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

const NOTIFICACOES_INICIAIS = [
  {
    id: 1,
    title: 'Novo Relatório Disponível',
    message: 'Relatório de Vendas Mensal foi atualizado com os dados de fechamento.',
    type: 'info',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 2,
    title: 'Meta Atingida',
    message: 'Parabéns! Você atingiu 95% da meta de vendas deste mês.',
    type: 'success',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: 'Alerta de Estoque',
    message: 'Atenção: 5 produtos estão com estoque abaixo do mínimo.',
    type: 'warning',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
];

export default function RelatoriNotificacoes() {
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES_INICIAIS);

  const removerNotificacao = (id) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-600' };
      case 'warning':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle, iconColor: 'text-yellow-600' };
      case 'error':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: X, iconColor: 'text-red-600' };
      default:
        return { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-600' };
    }
  };

  return (
    <RelatoriLayout title="Central de Notificações">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Suas Notificações</h2>
              <p className="text-sm text-gray-500">Mantenha-se informado sobre atualizações importantes.</p>
            </div>
          </div>
          {notificacoes.length > 0 && (
            <button 
              onClick={() => setNotificacoes([])}
              className="text-sm text-gray-500 hover:text-gray-900 underline"
            >
              Limpar todas
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notificacoes.length > 0 ? (
            notificacoes.map((notif) => {
              const style = getTypeStyles(notif.type);
              const Icon = style.icon;
              return (
                <Card key={notif.id} className={`border-l-4 border-l-current ${style.border} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${style.bg}`}>
                        <Icon className={`h-5 w-5 ${style.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      </div>
                      <button
                        onClick={() => removerNotificacao(notif.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Tudo limpo por aqui!</h3>
              <p className="text-gray-500">Você não tem novas notificações no momento.</p>
            </div>
          )}
        </div>
      </div>
    </RelatoriLayout>
  );
}