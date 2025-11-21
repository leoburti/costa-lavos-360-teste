import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, Download, CalendarDays } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function EventosPage() {
  const eventos = [
    { id: 1, titulo: 'Reunião de Planejamento Semanal', data: '2025-11-24', tipo: 'Reunião Interna', status: 'Confirmado' },
    { id: 2, titulo: 'Treinamento Novos Produtos', data: '2025-11-26', tipo: 'Treinamento', status: 'Confirmado' },
    { id: 3, titulo: 'Confraternização de Fim de Ano', data: '2025-12-19', tipo: 'Corporativo', status: 'Pendente' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Eventos - APoio</title>
        <meta name="description" content="Gerencie todos os eventos internos e corporativos." />
      </Helmet>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="text-gray-500 mt-2">Gerencie todos os eventos internos e corporativos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Título</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium text-primary">{item.titulo}</td>
                  <td className="py-3 px-4">{item.data}</td>
                  <td className="py-3 px-4">{item.tipo}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="ghost" size="sm">Ver</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}