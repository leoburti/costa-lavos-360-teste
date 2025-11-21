import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import { RefreshCw, DatabaseZap } from 'lucide-react';
import { Label } from '@/components/ui/label'; // Added Label import

const DadosClientesPage = () => {
  const { toast } = useToast();

  const handleAction = (action) => {
    toast({ title: "Funcionalidade em desenvolvimento", description: `🚧 A ação "${action}" ainda não foi implementada.` });
  };

  return (
    <>
      <Helmet>
        <title>Dados de Clientes - Geolocalização</title>
        <meta name="description" content="Visualize dados de clientes sincronizados de outras plataformas." />
      </Helmet>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados de Clientes (Cache)</CardTitle>
            <CardDescription>Visualize dados de clientes sincronizados de plataformas como ERP e CRM.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select><SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger><SelectContent><SelectItem value="1">Padaria Pão Quente</SelectItem></SelectContent></Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleAction('Sincronizar Agora')}><RefreshCw className="mr-2 h-4 w-4" /> Sincronizar Agora</Button>
              <Button variant="outline" onClick={() => handleAction('Atualizar Cache')}><DatabaseZap className="mr-2 h-4 w-4" /> Atualizar Cache</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Faturamento Anual (ERP)</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">R$ 125.430,00</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Status do Contrato (CRM)</CardTitle></CardHeader>
            <CardContent><Badge variant="success">Ativo</Badge></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Último Contato (CRM)</CardTitle></CardHeader>
            <CardContent><p className="text-lg font-semibold">15/10/2025</p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Histórico de Sincronizações</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Integração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tempo de Resposta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>19/11/2025 10:00</TableCell>
                  <TableCell>ERP Protheus</TableCell>
                  <TableCell><Badge variant="success">Sucesso</Badge></TableCell>
                  <TableCell>1200ms</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DadosClientesPage;