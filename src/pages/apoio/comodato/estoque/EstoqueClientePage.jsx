import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, ArrowRightLeft, Trash2, History } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import HistoricoEquipamentoModal from './HistoricoEquipamentoModal';

const dummyEquipamentos = [
  { id: 'eq1', modelo: 'Forno Turbo F-2000', numero_serie: 'SN-123', status: 'em_uso', data_instalacao: '2023-01-15', local: 'Cozinha Principal' },
  { id: 'eq2', modelo: 'Masseira Rápida M-50', numero_serie: 'SN-456', status: 'defeito', data_instalacao: '2023-02-20', local: 'Área de Preparo' },
];

const EstoqueClientePage = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const handleAction = (action) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `🚧 A ação "${action}" ainda não foi implementada.`,
    });
  };

  return (
    <>
      <Helmet><title>Estoque do Cliente - Comodato</title></Helmet>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Padaria Pão Quente Ltda</CardTitle>
            <CardDescription>CNPJ: 11.222.333/0001-44</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div><strong>Status Contrato:</strong> <Badge variant="success">Ativo</Badge></div>
            <div><strong>Contato:</strong> João da Silva</div>
            <div><strong>Telefone:</strong> (11) 98765-4321</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Base Instalada</CardTitle>
            <CardDescription>Equipamentos em comodato neste cliente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Nº de Série</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Instalação</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyEquipamentos.map((eq) => (
                  <TableRow key={eq.id}>
                    <TableCell className="font-medium">{eq.modelo}</TableCell>
                    <TableCell>{eq.numero_serie}</TableCell>
                    <TableCell><Badge variant={eq.status === 'em_uso' ? 'success' : 'destructive'}>{eq.status}</Badge></TableCell>
                    <TableCell>{eq.data_instalacao}</TableCell>
                    <TableCell>{eq.local}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <HistoricoEquipamentoModal equipamentoId={eq.id} />
                          <DropdownMenuItem onClick={() => handleAction('Trocar')}><ArrowRightLeft className="mr-2 h-4 w-4" /> Trocar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('Retirar')} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Retirar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ações de Comodato</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => handleAction('Solicitar Upgrade')}><PlusCircle className="mr-2 h-4 w-4" /> Solicitar Upgrade (Entrega)</Button>
            <Button variant="outline" onClick={() => handleAction('Solicitar Troca')}><ArrowRightLeft className="mr-2 h-4 w-4" /> Solicitar Troca</Button>
            <Button variant="destructive" onClick={() => handleAction('Solicitar Retirada')}><Trash2 className="mr-2 h-4 w-4" /> Solicitar Retirada</Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EstoqueClientePage;