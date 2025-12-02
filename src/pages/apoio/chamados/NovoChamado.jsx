import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const NovoChamado = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulation
    toast({ title: "Chamado criado", description: "O chamado foi registrado com sucesso.", variant: "success" });
    navigate('/apoio/chamados');
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Novo Chamado | Costa Lavos</title></Helmet>

      <PageHeader 
        title="Abrir Novo Chamado" 
        breadcrumbs={[{ label: 'Chamados', path: '/apoio/chamados' }, { label: 'Novo' }]}
      />

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Detalhes da Solicitação</CardTitle>
                    <CardDescription>Preencha as informações abaixo para abrir um novo ticket de suporte.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="titulo">Título do Chamado</Label>
                        <Input id="titulo" placeholder="Resumo breve do problema..." required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Cliente</Label>
                            <Select required>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Supermercado ABC</SelectItem>
                                    <SelectItem value="2">Padaria Central</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select required>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hardware">Equipamento/Hardware</SelectItem>
                                    <SelectItem value="software">Sistema/Software</SelectItem>
                                    <SelectItem value="acesso">Acesso/Login</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Select defaultValue="media">
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="baixa">Baixa</SelectItem>
                                <SelectItem value="media">Média</SelectItem>
                                <SelectItem value="alta">Alta</SelectItem>
                                <SelectItem value="critica">Crítica</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição Detalhada</Label>
                        <Textarea id="descricao" placeholder="Descreva o problema, passos para reproduzir, etc." className="min-h-[150px]" required />
                    </div>
                </CardContent>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 rounded-b-xl">
                    <Button type="button" variant="outline" onClick={() => navigate('/apoio/chamados')}>
                        <X className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4" /> Criar Chamado
                    </Button>
                </div>
            </Card>
        </form>
      </div>
    </div>
  );
};

export default NovoChamado;