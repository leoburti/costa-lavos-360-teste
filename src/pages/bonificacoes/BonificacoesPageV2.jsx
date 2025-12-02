import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, PlusCircle, Trash2, Send, Gift, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, formatDate } from '@/lib/utils';
import BonificationStatusBadge from '@/components/bonificacoes/BonificationStatusBadge';

const bonificationReasons = [
  'Comercial', 'Equipamento', 'Institucional', 'Logística', 'Marketing'
];

const BonificacoesPageV2 = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // State for the form
  const [motivo, setMotivo] = useState('');
  const [cliente, setCliente] = useState('');
  const [produtoNome, setProdutoNome] = useState('');
  const [produtoQtd, setProdutoQtd] = useState(1);
  const [produtoValor, setProdutoValor] = useState(0);
  const [addedProducts, setAddedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the table
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(true);

  const fetchSolicitacoes = useCallback(async () => {
    setLoadingSolicitacoes(true);
    try {
      const { data, error } = await supabase
        .from('bonification_requests')
        .select('id, client_name, status, request_date')
        .order('request_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSolicitacoes(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar solicitações', description: error.message });
    } finally {
      setLoadingSolicitacoes(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  const handleAddProduct = () => {
    if (!produtoNome || produtoQtd <= 0 || produtoValor <= 0) {
      toast({ variant: 'destructive', title: 'Campos do produto inválidos', description: 'Preencha nome, quantidade e valor do produto.' });
      return;
    }
    const newProduct = {
      id: Date.now(), // simple unique id for the list
      name: produtoNome,
      quantity: Number(produtoQtd),
      price: Number(produtoValor),
    };
    setAddedProducts(prev => [...prev, newProduct]);
    // Reset product fields
    setProdutoNome('');
    setProdutoQtd(1);
    setProdutoValor(0);
  };

  const handleRemoveProduct = (productId) => {
    setAddedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const resetForm = () => {
    setMotivo('');
    setCliente('');
    setAddedProducts([]);
    setProdutoNome('');
    setProdutoQtd(1);
    setProdutoValor(0);
  };

  const handleSubmit = async () => {
    if (!motivo || !cliente || addedProducts.length === 0) {
      toast({ variant: 'destructive', title: 'Formulário incompleto', description: 'Preencha motivo, cliente e adicione ao menos um produto.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const totalAmount = addedProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
      const productsJson = addedProducts.map(p => ({ name: p.name, quantity: p.quantity, price: p.price }));

      const { error } = await supabase.from('bonification_requests').insert({
        user_id: user.id,
        client_name: cliente,
        client_id: cliente, // Using name as ID as per simplified requirement
        motivos: [motivo],
        products_json: productsJson,
        total_amount: totalAmount,
        status: 'Aguardando Aprovação',
      });

      if (error) throw error;

      toast({ title: 'Sucesso!', description: 'Solicitação de bonificação enviada.' });
      resetForm();
      fetchSolicitacoes(); // Refresh the table
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao enviar solicitação', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBonificacao = useMemo(() => {
    return addedProducts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  }, [addedProducts]);

  return (
    <>
      <Helmet>
        <title>Bonificações V2 | Costa Lavos 360°</title>
      </Helmet>
      <div className="p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-pink-600" />
                Nova Solicitação
              </CardTitle>
              <CardDescription>Preencha os dados para criar um novo pedido de bonificação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo</Label>
                <Select value={motivo} onValueChange={setMotivo}>
                  <SelectTrigger id="motivo">
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {bonificationReasons.map(reason => (
                      <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input id="cliente" placeholder="Digite o nome do cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
              </div>

              <div className="border-t pt-6 space-y-4">
                <h4 className="font-medium">Adicionar Produtos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="produtoNome">Produto</Label>
                    <Input id="produtoNome" placeholder="Nome do produto" value={produtoNome} onChange={(e) => setProdutoNome(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="produtoQtd">Quantidade</Label>
                    <Input id="produtoQtd" type="number" min="1" value={produtoQtd} onChange={(e) => setProdutoQtd(e.target.value)} />
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="produtoValor">Valor Unitário</Label>
                    <Input id="produtoValor" type="number" min="0" step="0.01" placeholder="R$ 0,00" value={produtoValor} onChange={(e) => setProdutoValor(e.target.value)} />
                </div>
                <Button onClick={handleAddProduct} variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </div>

              {addedProducts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Produtos Adicionados</h4>
                  <ScrollArea className="h-40 border rounded-md">
                    <ul className="divide-y">
                      {addedProducts.map(p => (
                        <li key={p.id} className="p-3 flex justify-between items-center text-sm">
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-muted-foreground">{p.quantity} x {formatCurrency(p.price)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{formatCurrency(p.quantity * p.price)}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveProduct(p.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                  <div className="text-right font-bold text-lg">
                    Total: {formatCurrency(totalBonificacao)}
                  </div>
                </div>
              )}

              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Enviar Solicitação
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-blue-600" />
                Solicitações Recentes
              </CardTitle>
              <CardDescription>Lista das últimas 100 solicitações de bonificação.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[75vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingSolicitacoes ? (
                      <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                    ) : solicitacoes.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhuma solicitação encontrada.</TableCell></TableRow>
                    ) : (
                      solicitacoes.map(req => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium truncate" title={req.id}>{req.id.substring(0, 8)}...</TableCell>
                          <TableCell>{req.client_name}</TableCell>
                          <TableCell><BonificationStatusBadge status={req.status} /></TableCell>
                          <TableCell className="text-right">{formatDate(req.request_date, 'dd/MM/yyyy HH:mm')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default BonificacoesPageV2;