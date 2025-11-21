import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, TestTube2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Helmet } from 'react-helmet-async';

const dummyIntegracoes = [
  { id: 'i1', nome: 'ERP Protheus', tipo: 'erp', ativo: true },
  { id: 'i2', nome: 'Google Maps API', tipo: 'google_maps', ativo: true },
  { id: 'i3', nome: 'CRM Salesforce', tipo: 'crm', ativo: false },
];

const IntegracoesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAction = (action, id) => {
    if (action === 'Editar') {
      navigate(`/apoio/geolocalizacao/integracoes/${id}/editar`);
    } else {
      toast({ title: "Funcionalidade em desenvolvimento", description: `🚧 A ação "${action}" para a integração ${id} ainda não foi implementada.` });
    }
  };

  return (
    <>
      <Helmet>
        <title>Integrações - Geolocalização</title>
        <meta name="description" content="Gerencie as integrações com APIs externas." />
      </Helmet>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Integrações de API</CardTitle>
              <CardDescription>Gerencie as conexões com sistemas externos.</CardDescription>
            </div>
            <Button onClick={() => navigate('/apoio/geolocalizacao/integracoes/novo')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Integração
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Select><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
            <Select><SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filtrar por Status" /></SelectTrigger><SelectContent><SelectItem value="ativo">Ativo</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyIntegracoes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell><Badge variant="secondary">{item.tipo}</Badge></TableCell>
                  <TableCell><Badge variant={item.ativo ? 'success' : 'destructive'}>{item.ativo ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAction('Editar', item.id)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('Testar Conexão', item.id)}><TestTube2 className="mr-2 h-4 w-4" /> Testar Conexão</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleAction('Excluir', item.id)}>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default IntegracoesPage;