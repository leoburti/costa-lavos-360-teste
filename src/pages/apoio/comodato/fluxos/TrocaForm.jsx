import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import { getModelosEquipamentos, createTrocaComodatoLote, getClienteDetalhesComodato } from '@/services/apoioSyncService';
import { Loader2, Plus, Trash2, RefreshCw, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClientSearch } from '@/components/ClientSearch';

const TrocaForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modelos, setModelos] = useState([]);
  
  // Form State
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteDetalhes, setClienteDetalhes] = useState(null);
  const [equipamentosCliente, setEquipamentosCliente] = useState([]);
  
  const [selectedEquipamentoAtual, setSelectedEquipamentoAtual] = useState('');
  const [selectedNovoModelo, setSelectedNovoModelo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // List of items to add
  const [itensTroca, setItensTroca] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modelosData = await getModelosEquipamentos();
        setModelos(modelosData);
      } catch (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleClientSelect = async (client) => {
      setSelectedCliente(client);
      setClienteDetalhes(null);
      setEquipamentosCliente([]);
      try {
          const details = await getClienteDetalhesComodato(client.cliente_id, client.loja);
          setClienteDetalhes(details);
          setEquipamentosCliente(details.equipamentos || []);
      } catch (error) {
          toast({ title: "Erro", description: "Não foi possível carregar detalhes do cliente.", variant: "destructive" });
      }
  };

  const handleAddItem = () => {
    if (!selectedEquipamentoAtual || !selectedNovoModelo) return;

    if (itensTroca.some(i => i.equipamento_id === selectedEquipamentoAtual)) {
        toast({ title: "Aviso", description: "Este equipamento já está na lista de troca.", variant: "warning" });
        return;
    }

    const equipObj = equipamentosCliente.find(e => e.numero_serie === selectedEquipamentoAtual || e.id === selectedEquipamentoAtual);
    const modeloObj = modelos.find(m => m.id === selectedNovoModelo);

    const newItem = {
      equipamento_id: selectedEquipamentoAtual, // Using serial/id as ID
      equipamento_serial: equipObj?.numero_serie || 'N/A',
      equipamento_modelo_atual: equipObj?.equipamento || 'N/A',
      novo_modelo_id: selectedNovoModelo,
      novo_modelo_nome: modeloObj?.nome_modelo || 'Desconhecido'
    };

    setItensTroca([...itensTroca, newItem]);
    
    setSelectedEquipamentoAtual('');
    setSelectedNovoModelo('');
  };

  const handleRemoveItem = (index) => {
    const newItems = [...itensTroca];
    newItems.splice(index, 1);
    setItensTroca(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCliente || itensTroca.length === 0) {
        toast({ title: "Erro", description: "Selecione um cliente e adicione pelo menos uma troca.", variant: "destructive" });
        return;
    }

    setSubmitting(true);
    try {
      const result = await createTrocaComodatoLote(
        "00000000-0000-0000-0000-000000000000", // Placeholder UUID
        itensTroca.map(i => ({ equipamento_id: i.equipamento_id, novo_modelo_id: i.novo_modelo_id })),
        motivo,
        `Cliente: ${selectedCliente.cliente_id}/${selectedCliente.loja} - ${selectedCliente.nome_fantasia}. \n${observacoes}`
      );

      if (result.success) {
        toast({ title: "Solicitação Enviada!", description: "O chamado de troca foi criado com sucesso.", variant: "success" });
        navigate('/apoio/comodato');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Helmet><title>Solicitar Troca - Apoio</title></Helmet>
      <form onSubmit={handleSubmit}>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-6 w-6" />
                Solicitar Troca de Equipamento(s)
            </CardTitle>
            <CardDescription>Substituição de equipamentos defeituosos ou upgrade.</CardDescription>
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
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Adicionar Troca</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5 space-y-2">
                        <Label>Equipamento Atual (Retirar)</Label>
                        <Select value={selectedEquipamentoAtual} onValueChange={setSelectedEquipamentoAtual} disabled={!selectedCliente}>
                            <SelectTrigger>
                                <SelectValue placeholder={equipamentosCliente.length === 0 ? "Nenhum equipamento encontrado" : "Selecione do estoque..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {equipamentosCliente.map((eq, idx) => (
                                    <SelectItem key={idx} value={eq.numero_serie || eq.id || `eq-${idx}`}>
                                        {eq.equipamento} - {eq.numero_serie}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-5 space-y-2">
                        <Label>Novo Modelo (Entregar)</Label>
                        <Select value={selectedNovoModelo} onValueChange={setSelectedNovoModelo}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o novo modelo..." />
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
                    <div className="md:col-span-2">
                        <Button type="button" onClick={handleAddItem} className="w-full" disabled={!selectedEquipamentoAtual || !selectedNovoModelo}>
                            <Plus className="h-4 w-4 mr-2" /> Add
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Itens da Troca</Label>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">{itensTroca.length} troca(s)</span>
                </div>
                {itensTroca.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Equipamento Atual</TableHead>
                                    <TableHead>Novo Modelo</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itensTroca.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="font-medium">{item.equipamento_modelo_atual}</div>
                                            <div className="text-xs text-muted-foreground">S/N: {item.equipamento_serial}</div>
                                        </TableCell>
                                        <TableCell>{item.novo_modelo_nome}</TableCell>
                                        <TableCell>
                                            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleRemoveItem(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">Nenhuma troca adicionada ainda.</div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="motivo">Motivo da Troca</Label>
                <Select value={motivo} onValueChange={setMotivo}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="defeito">Defeito Técnico</SelectItem>
                    <SelectItem value="upgrade">Upgrade de Modelo</SelectItem>
                    <SelectItem value="fim_vida_util">Fim da Vida Útil</SelectItem>
                    <SelectItem value="estetico">Dano Estético</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" placeholder="Detalhes adicionais..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/apoio/comodato')}>Cancelar</Button>
            <Button type="submit" disabled={submitting || itensTroca.length === 0}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enviar Solicitação
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default TrocaForm;