
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import { createRetiradaComodato, getClienteDetalhesComodato } from '@/services/apoioSyncService';
import { Loader2, Plus, Trash2, LogOut, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ClientSearch from '@/components/ClientSearch';

const RetiradaForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteDetalhes, setClienteDetalhes] = useState(null);
  const [equipamentosCliente, setEquipamentosCliente] = useState([]);
  
  const [selectedEquipamento, setSelectedEquipamento] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  
  // List of items to remove
  const [itensRetirada, setItensRetirada] = useState([]);

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
    if (!selectedEquipamento) return;

    if (itensRetirada.some(i => i.id === selectedEquipamento)) {
        toast({ title: "Aviso", description: "Este equipamento já está na lista de retirada.", variant: "warning" });
        return;
    }

    const equipObj = equipamentosCliente.find(e => e.numero_serie === selectedEquipamento || e.id === selectedEquipamento);
    
    // Normalize object for list
    const itemToAdd = {
        id: selectedEquipamento,
        modelo_nome: equipObj?.equipamento || 'Desconhecido',
        numero_serie: equipObj?.numero_serie || 'N/A'
    };
    
    setItensRetirada([...itensRetirada, itemToAdd]);
    setSelectedEquipamento('');
  };

  const handleRemoveItem = (index) => {
    const newItems = [...itensRetirada];
    newItems.splice(index, 1);
    setItensRetirada(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCliente || itensRetirada.length === 0) {
        toast({ title: "Erro", description: "Selecione um cliente e adicione pelo menos um equipamento.", variant: "destructive" });
        return;
    }

    setSubmitting(true);
    try {
      const result = await createRetiradaComodato(
        "00000000-0000-0000-0000-000000000000", // Placeholder UUID
        itensRetirada.map(i => i.id), // Passing serials/IDs
        motivo,
        `Cliente: ${selectedCliente.cliente_id}/${selectedCliente.loja} - ${selectedCliente.nome_fantasia}. \n${observacoes}`
      );

      if (result.success) {
        toast({ title: "Solicitação Enviada!", description: "O chamado de retirada foi criado com sucesso.", variant: "success" });
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
      <Helmet><title>Solicitar Retirada - Apoio</title></Helmet>
      <form onSubmit={handleSubmit}>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
                <LogOut className="h-6 w-6" />
                Solicitar Retirada de Equipamento(s)
            </CardTitle>
            <CardDescription>Solicitação para recolhimento de equipamentos do cliente.</CardDescription>
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
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Adicionar Equipamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-10 space-y-2">
                        <Label>Equipamento a Retirar</Label>
                        <Select value={selectedEquipamento} onValueChange={setSelectedEquipamento} disabled={!selectedCliente}>
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
                    <div className="md:col-span-2">
                        <Button type="button" onClick={handleAddItem} className="w-full" disabled={!selectedEquipamento}>
                            <Plus className="h-4 w-4 mr-2" /> Add
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Itens da Retirada</Label>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">{itensRetirada.length} equipamento(s)</span>
                </div>
                {itensRetirada.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Modelo</TableHead>
                                    <TableHead>Número de Série</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {itensRetirada.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.modelo_nome}</TableCell>
                                        <TableCell>{item.numero_serie}</TableCell>
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
                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">Nenhum equipamento adicionado ainda.</div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="motivo">Motivo da Retirada</Label>
                <Select value={motivo} onValueChange={setMotivo}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="troca_cnpj">Troca de CNPJ</SelectItem>
                    <SelectItem value="falha_defeito">Falha/Defeito Irreparável</SelectItem>
                    <SelectItem value="nao_utilizacao">Não utilização</SelectItem>
                    <SelectItem value="encerramento_parceria">Encerramento de Parceria</SelectItem>
                    <SelectItem value="faturamento_nao_atingido">Faturamento não atingido</SelectItem>
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
            <Button type="submit" variant="destructive" disabled={submitting || itensRetirada.length === 0}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enviar Solicitação
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default RetiradaForm;
