import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useBonificationMock } from '@/hooks/useBonificationMock';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageSkeleton from '@/components/PageSkeleton';

const BonificacoesRegras = () => {
  const { loading, rulesData, toggleRuleStatus, deleteRule, saveRule } = useBonificationMock();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Percentual',
    percentage: '',
    condition: ''
  });

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
        name: rule.name,
        description: rule.description,
        type: rule.type,
        percentage: rule.percentage,
        condition: rule.condition
    });
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingRule(null);
    setFormData({
        name: '',
        description: '',
        type: 'Percentual',
        percentage: '',
        condition: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    saveRule({ ...formData, id: editingRule?.id });
    setIsModalOpen(false);
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Regras de Bonificação | Costa Lavos</title>
      </Helmet>

      <PageHeader 
        title="Configuração de Regras" 
        description="Gerencie as regras e critérios para cálculo automático de bonificações."
        breadcrumbs={[{ label: 'Bonificações', path: '/bonificacoes' }, { label: 'Regras' }]}
        actions={
            <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" /> Nova Regra
            </Button>
        }
      />

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
            <Table>
                <TableHeader className="bg-slate-50">
                    <TableRow>
                        <TableHead>Nome da Regra</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Percentual / Valor</TableHead>
                        <TableHead>Condição</TableHead>
                        <TableHead className="text-center">Ativo</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rulesData.map((rule) => (
                        <TableRow key={rule.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <Settings className="h-4 w-4 text-slate-400" />
                                {rule.name}
                            </TableCell>
                            <TableCell className="text-slate-500">{rule.description}</TableCell>
                            <TableCell>{rule.type}</TableCell>
                            <TableCell>{rule.percentage}%</TableCell>
                            <TableCell className="font-mono text-xs">{rule.condition}</TableCell>
                            <TableCell className="text-center">
                                <Switch 
                                    checked={rule.active} 
                                    onCheckedChange={() => toggleRuleStatus(rule.id)} 
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(rule)}>
                                        <Edit2 className="h-4 w-4 text-blue-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingRule ? 'Editar Regra' : 'Nova Regra'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Nome da Regra</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Percentual">Percentual</SelectItem>
                                <SelectItem value="Fixo">Valor Fixo</SelectItem>
                                <SelectItem value="Escalonado">Escalonado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Valor / %</Label>
                        <Input type="number" value={formData.percentage} onChange={(e) => setFormData({...formData, percentage: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Condição (Lógica)</Label>
                    <Input value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} placeholder="Ex: > R$ 10.000,00" />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSubmit}>Salvar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BonificacoesRegras;