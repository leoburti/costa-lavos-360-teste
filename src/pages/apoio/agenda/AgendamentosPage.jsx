import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, Download, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function AgendamentosPage() {
  const agendamentos = [
    { id: 1, titulo: 'Instalação de Equipamento', cliente: 'Padaria Pão Quente', data: '2025-11-20', hora: '10:00', responsavel: 'Carlos Silva', status: 'Agendado' },
    { id: 2, titulo: 'Manutenção Corretiva', cliente: 'Mercado Preço Bom', data: '2025-11-21', hora: '14:00', responsavel: 'Ana Pereira', status: 'Agendado' },
    { id: 3, titulo: 'Visita Técnica', cliente: 'Supermercados Gigante', data: '2025-11-22', hora: '09:00', responsavel: 'Carlos Silva', status: 'Concluído' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Agendado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Concluído': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Agendamentos - APoio</title>
        <meta name="description" content="Gerencie todos os agendamentos de serviços e visitas." />
      </Helmet>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-gray-500 mt-2">Gerencie todos os agendamentos de serviços e visitas.</p>
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
            Novo Agendamento
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Título</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Cliente</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Data/Hora</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Responsável</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {agendamentos.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium text-primary">{item.titulo}</td>
                  <td className="py-3 px-4">{item.cliente}</td>
                  <td className="py-3 px-4">{item.data} às {item.hora}</td>
                  <td className="py-3 px-4">{item.responsavel}</td>
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