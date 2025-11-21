import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function HistoricoPage() {
  const historico = [
    { id: 1, funcionario: 'João Silva', data: '2025-11-18', distancia: '25.5 km', chamados: 3, duracao: '8h 15m' },
    { id: 2, funcionario: 'Maria Santos', data: '2025-11-18', distancia: '31.2 km', chamados: 4, duracao: '8h 30m' },
    { id: 3, funcionario: 'Pedro Costa', data: '2025-11-18', distancia: '19.8 km', chamados: 2, duracao: '7h 45m' },
  ];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Histórico de Rotas - Geolocalização</title>
        <meta name="description" content="Consulte o histórico de rotas e atividades dos funcionários." />
      </Helmet>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Rotas</h1>
          <p className="text-gray-500 mt-2">Consulte o histórico de rotas e atividades dos funcionários.</p>
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
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardDescription>Filtre por profissional e período para ver o histórico detalhado.</CardDescription>
            <div className="flex flex-col md:flex-row gap-4 pt-4">
                <Select>
                    <SelectTrigger className="w-full md:w-[250px]">
                        <SelectValue placeholder="Selecione um profissional" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Profissionais</SelectItem>
                        <SelectItem value="1">João Silva</SelectItem>
                    </SelectContent>
                </Select>
                <Input type="date" className="w-full md:w-[180px]" />
                <Input type="date" className="w-full md:w-[180px]" />
                <Button>Buscar</Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcionário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Distância Percorrida</TableHead>
                <TableHead>Chamados Atendidos</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.funcionario}</TableCell>
                  <TableCell>{item.data}</TableCell>
                  <TableCell>{item.distancia}</TableCell>
                  <TableCell>{item.chamados}</TableCell>
                  <TableCell>{item.duracao}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Ver Rota</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}