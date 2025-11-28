
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import { getModelosEquipamentos, createEntregaComodatoLote, getClienteDetalhesComodato } from '@/services/apoioSyncService';
import { Loader2, Plus, Trash2, Package, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ClientSearch from '@/components/ClientSearch';
import { useFormStatePersistence } from '@/hooks/useFormStatePersistence';
import { PersistenceStatus } from '@/components/PersistenceStatus';

const EntregaForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modelos, setModelos] = useState([]);
  
  // Persistence
  const { formData, handleChange, handleBulkChange, status, lastSaved, clearDraft } = useFormStatePersistence(
      'entrega_form_new',
      {
          selectedCliente: null,
          clienteDetalhes: null,
          selectedModelo: '',
          quantidade: 1,
          urgencia: 'normal',
          justificativa: '',
          observacoes: '',
          itensEntrega: []
      }
  );

  const { selectedCliente, clienteDetalhes, selectedModelo, quantidade, urgencia, justificativa, observacoes, itensEntrega } = formData;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modelosData = await getModelosEquipamentos();
        setModelos(modelosData);
      } catch (error) {
        toast({
          title: 'Erro ao carregar modelos',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleClientSelect = async (client) => {
      handleChange('selectedCliente', client);
      handleChange('clienteDetalhes', null);
      try {
          const details = await getClienteDetalhesComodato(client.cliente_id, client.loja);
          handleChange('clienteDetalhes', details);
      } catch (error) {
          toast({ title: "Erro", description: "Não foi possível carregar detalhes do cliente.", variant: "destructive" });
      }
  };

  const handleAddItem = () => {
    if (!selectedModelo || quantidade <= 0) return;

    const modeloObj = modelos.find(m => m.id === selectedModelo);
    const newItem = {
      modelo_id: selectedModelo,
      modelo_nome: modeloObj?.nome_modelo || 'Desconhecido',
      quantidade: parseInt(quantidade, 10)
    };

    handleChange('itensEntrega', [...itensEntrega, newItem]);
    handleChange('selectedModelo', '');
    handleChange('quantidade', 1);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...itensEntrega];
    newItems.splice(index, 1);
    handleChange('itensEntrega', newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCliente || itensEntrega.length === 0) {
        toast({ title: "Erro", description: "Selecione um cliente e adicione pelo menos um item.", variant: "destructive" });
        return;
    }

    setSubmitting(true);
    try {
      const result = await createEntregaComodatoLote(
        selectedCliente.id, 
        itensEntrega.map(i => ({ modelo_id: i.modelo_id, quantidade: i.quantidade })),
        urgencia,
        justificativa,
        `Cliente: ${selectedCliente.cliente_id}/${selectedCliente.loja} - ${selectedCliente.nome_fantasia}. \n${observacoes}`
      );

      if (result.success) {
        toast({
          title: "Solicitação Enviada!",
          description: "O chamado de entrega foi criado com sucesso.",
          variant: "success"
        });
        clearDraft();
        navigate('/apoio/comodato');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-4 text-lg">Carregando formulário...</span>
        </div>
    );
  }

  return (
    <>
      <Helmet><title>Solicitar Entrega - Apoio</title></Helmet>
      <form onSubmit={handleSubmit}>
        <Card className="max-w-3xl mx-auto relative">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        Solicitar Entrega de Equipamento(s)
                    </CardTitle>
                    <CardDescription>Preencha os dados para solicitar o envio de novos equipamentos (Comodato).</CardDescription>
                </div>
                <PersistenceStatus status={status} lastSaved={lastSaved} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label>Cliente</Label>
              <ClientSearch onSelect={handleClientSelect} selectedValue={selectedCliente} />
              {clienteDetalhes && (
                  <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                      <p className="font-semibold">{clienteDetalhes.razao_social}</p>
                      <p className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" /> {clienteDetalhes.endereco}</p>
                  </div>
              )}
            </div>

            <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Adicionar Equipamentos</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-7 space-y-2">
                        <Label>Modelo</Label>
                        <Select value={selectedModelo} onValueChange={(val) => handleChange('selectedModelo', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o modelo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {modelos.map(modelo => (
                                    <SelectItem key={modelo.id} value={modelo.id}>
                                        {modelo.nome_modelo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-3 space-y-2">
                        <Label>Quantidade</Label>
                        <Input 
                            type="number" 
                            min="1" 
                            value={quantidade} 
                            onChange={(e) => handleChange('quantidade', e.target.value)} 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Button 
                            type="button" 
                            onClick={handleAddItem} 
                            className="w-full"
                            disabled={!selectedModelo || quantidade < 1}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Itens da Solicitação</Label>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        {itensEntrega.length} equipamento(s)
                    </span>
                </div>
                
                {itensEntrega.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Modelo</TableHead>
                                    <TableHead className="w-24 text-center">Qtd</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itensEntrega.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.modelo_nome}</TableCell>
                                        <TableCell className="text-center">{item.quantidade}</TableCell>
                                        <TableCell>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-destructive hover:text-destructive/90"
                                                onClick={() => handleRemoveItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                        Nenhum equipamento adicionado ainda.
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="urgencia">Urgência</Label>
                    <Select value={urgencia} onValueChange={(val) => handleChange('urgencia', val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="justificativa">Justificativa</Label>
                    <Select value={justificativa} onValueChange={(val) => handleChange('justificativa', val)}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="novo_ponto">Novo Ponto de Venda</SelectItem>
                        <SelectItem value="aumento_demanda">Aumento de Demanda</SelectItem>
                        <SelectItem value="substituicao_proprio">Substituição de Equip. Próprio</SelectItem>
                        <SelectItem value="estrategia_comercial">Estratégia Comercial</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea 
                id="observacoes" 
                placeholder="Detalhes adicionais sobre a entrega..." 
                value={observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
              />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/apoio/comodato')}>Cancelar</Button>
            <Button type="submit" disabled={submitting || itensEntrega.length === 0}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Solicitação
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default EntregaForm;
