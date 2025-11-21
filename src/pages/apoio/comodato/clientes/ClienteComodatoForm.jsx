import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';
import { getClienteDetalhesByUuid } from '@/services/apoioSyncService';
import { Loader2, Package, Database, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const ClienteComodatoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(isEditing);
  const [isRealData, setIsRealData] = useState(false);
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    endereco: '',
    contato_principal: '',
    telefone_contato: '',
    email_contato: '',
    status_contrato: 'ativo',
    apto_comodato: false,
    equipamentos: []
  });

  useEffect(() => {
    if (isEditing) {
        const fetchDetails = async () => {
            try {
                const data = await getClienteDetalhesByUuid(id);
                if (data) {
                    setFormData({
                        razao_social: data.razao_social || '',
                        nome_fantasia: data.nome_fantasia || '',
                        cnpj: data.cnpj || '',
                        endereco: data.endereco || '',
                        contato_principal: '', 
                        telefone_contato: '',
                        email_contato: '',
                        status_contrato: 'ativo',
                        apto_comodato: true,
                        equipamentos: data.equipamentos || []
                    });
                    setIsRealData(data.found_real_data);
                    
                    if (data.found_real_data) {
                        toast({ title: "Dados Reais Carregados", description: "Informações sincronizadas do ERP.", variant: "success" });
                    } else {
                        toast({ title: "Dados Locais", description: "Cliente não encontrado no ERP, exibindo dados locais.", variant: "warning" });
                    }
                }
            } catch (error) {
                console.error(error);
                toast({ title: "Erro", description: "Falha ao carregar detalhes do cliente.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }
  }, [id, isEditing, toast]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, status_contrato: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `Cliente ${isEditing ? 'atualizado' : 'criado'} com sucesso!`,
      description: "As alterações foram salvas.",
    });
    navigate('/apoio/comodato/clientes');
  };

  if (loading) {
      return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Editar Cliente' : 'Novo Cliente'} de Comodato</title>
      </Helmet>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente de Comodato'}</CardTitle>
                    <CardDescription>Dados sincronizados do ERP e informações de comodato.</CardDescription>
                </div>
                {isEditing && (
                    <Badge variant={isRealData ? "success" : "warning"} className="flex items-center gap-1">
                        {isRealData ? <Database className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                        {isRealData ? "Dados ERP (Real)" : "Dados Genéricos (Local)"}
                    </Badge>
                )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input id="razao_social" value={formData.razao_social} onChange={handleChange} placeholder="Nome da empresa LTDA" required />
                </div>
                <div className="space-y-2">
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input id="nome_fantasia" value={formData.nome_fantasia} onChange={handleChange} placeholder="Nome popular da empresa" />
                </div>
                <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0001-00" />
                </div>
                <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" value={formData.endereco} onChange={handleChange} placeholder="Rua, número, bairro, cidade, estado" />
                </div>
                <div className="space-y-2">
                <Label htmlFor="contato_principal">Contato Principal</Label>
                <Input id="contato_principal" value={formData.contato_principal} onChange={handleChange} placeholder="Nome do responsável" />
                </div>
                <div className="space-y-2">
                <Label htmlFor="telefone_contato">Telefone</Label>
                <Input id="telefone_contato" value={formData.telefone_contato} onChange={handleChange} type="tel" placeholder="(00) 90000-0000" />
                </div>
                <div className="space-y-2">
                <Label htmlFor="email_contato">Email</Label>
                <Input id="email_contato" value={formData.email_contato} onChange={handleChange} type="email" placeholder="contato@empresa.com" />
                </div>
                <div className="space-y-2">
                <Label htmlFor="status_contrato">Status do Contrato</Label>
                <Select value={formData.status_contrato} onValueChange={handleSelectChange}>
                    <SelectTrigger id="status_contrato"><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="apto_comodato" checked={formData.apto_comodato} onCheckedChange={(checked) => setFormData(prev => ({...prev, apto_comodato: checked}))} />
              <Label htmlFor="apto_comodato">Apto para receber comodato</Label>
            </div>

            {formData.equipamentos.length > 0 ? (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5" /> Equipamentos em Comodato (ERP)
                    </h3>
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Equipamento</TableHead>
                                    <TableHead>Série</TableHead>
                                    <TableHead>Data Venda</TableHead>
                                    <TableHead className="text-right">Qtd</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.equipamentos.map((eq, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{eq.equipamento}</TableCell>
                                        <TableCell>{eq.numero_serie || 'N/A'}</TableCell>
                                        <TableCell>{eq.data_venda ? new Date(eq.data_venda).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell className="text-right">{eq.quantidade}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ) : (
                <div className="mt-6 p-4 border border-dashed rounded-md text-center text-muted-foreground">
                    Nenhum equipamento encontrado no ERP para este cliente.
                </div>
            )}

          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/apoio/comodato/clientes')}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
};

export default ClienteComodatoForm;