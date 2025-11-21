import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, Download, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';

export default function PersonalizadoPage() {
  const { toast } = useToast();

  const relatorios = [
    { id: 1, nome: 'Relatório de Chamados por Cliente', tipo: 'Chamados', criado: '2025-10-28', atualizado: '2025-11-01', status: 'Ativo' },
    { id: 2, nome: 'Análise de Manutenção Preventiva', tipo: 'Manutenção', criado: '2025-10-25', atualizado: '2025-10-31', status: 'Ativo' },
    { id: 3, nome: 'Relatório de Comodatos Ativos', tipo: 'Comodato', criado: '2025-10-20', atualizado: '2025-10-30', status: 'Ativo' },
    { id: 4, nome: 'Análise de Desempenho da Equipe', tipo: 'Equipe', criado: '2025-10-15', atualizado: '2025-10-29', status: 'Inativo' },
    { id: 5, nome: 'Relatório de Geolocalização', tipo: 'Geolocalização', criado: '2025-10-10', atualizado: '2025-10-28', status: 'Ativo' }
  ];

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'Chamados': return 'bg-red-100 text-red-800 border-red-200';
      case 'Manutenção': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Comodato': return 'bg-green-100 text-green-800 border-green-200';
      case 'Equipe': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Geolocalização': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Inativo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Arquivado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleNotImplemented = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "🚧 Este recurso ainda não foi implementado. Você pode solicitá-lo em um próximo prompt! 🚀",
    });
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Relatórios Personalizados - APoio</title>
        <meta name="description" content="Crie e gerencie seus relatórios personalizados." />
      </Helmet>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Personalizados</h1>
          <p className="text-gray-500 mt-2">Crie e gerencie seus relatórios personalizados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleNotImplemented}>
            <Filter className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" onClick={handleNotImplemented}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleNotImplemented}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="text-sm text-gray-600">Total de Relatórios</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">5</div>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="text-sm text-gray-600">Relatórios Ativos</div>
          <div className="text-3xl font-bold text-green-600 mt-2">4</div>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="text-sm text-gray-600">Últimos 30 Dias</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">3</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Seus Relatórios Personalizados</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Nome do Relatório</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Criado em</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Atualizado em</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Ações</th>
                </tr>
                </thead>
                <tbody>
                {relatorios.map(rel => (
                    <tr key={rel.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{rel.nome}</td>
                    <td className="py-3 px-4">
                        <Badge variant="outline" className={getTipoColor(rel.tipo)}>
                        {rel.tipo}
                        </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{rel.criado}</td>
                    <td className="py-3 px-4 text-gray-600">{rel.atualizado}</td>
                    <td className="py-3 px-4">
                        <Badge variant="outline" className={getStatusColor(rel.status)}>
                        {rel.status}
                        </Badge>
                    </td>
                    <td className="py-3 px-4">
                        <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleNotImplemented}>Visualizar</Button>
                        <Button variant="ghost" size="icon" onClick={handleNotImplemented}>
                            <Settings className="w-4 h-4" />
                        </Button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Criar Novo Relatório Personalizado</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="report-name">Nome do Relatório</Label>
                    <Input id="report-name" placeholder="Ex: Relatório de Chamados" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="report-type">Tipo de Relatório</Label>
                    <Select>
                        <SelectTrigger id="report-type">
                            <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="chamados">Chamados</SelectItem>
                            <SelectItem value="manutencao">Manutenção</SelectItem>
                            <SelectItem value="comodato">Comodato</SelectItem>
                            <SelectItem value="equipe">Equipe</SelectItem>
                            <SelectItem value="geolocalizacao">Geolocalização</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="start-date">Data Inicial</Label>
                    <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end-date">Data Final</Label>
                    <Input id="end-date" type="date" />
                </div>
            </div>
            <div className="mt-6 flex gap-2">
            <Button onClick={handleNotImplemented}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Relatório
            </Button>
            <Button variant="outline">Cancelar</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}