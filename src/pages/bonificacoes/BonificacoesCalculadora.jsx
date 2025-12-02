import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { Calculator, RotateCcw, Save, History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const BonificacoesCalculadora = () => {
  const [values, setValues] = useState({
    vendedor: '',
    periodo: '',
    vendas: '',
    meta: '',
    taxa: '2.0'
  });

  const [result, setResult] = useState({
    bruto: 0,
    impostos: 0,
    liquido: 0,
    atingimento: 0
  });

  const [history, setHistory] = useState([]);

  // Real-time calculation
  useEffect(() => {
    const vendas = parseFloat(values.vendas) || 0;
    const meta = parseFloat(values.meta) || 0;
    const taxa = parseFloat(values.taxa) || 0;

    const atingimento = meta > 0 ? (vendas / meta) * 100 : 0;
    
    // Regra simples mockada: Se atingiu 100% da meta, ganha a taxa sobre as vendas.
    // Se não, ganha proporcional ou zero (aqui assumindo proporcional > 80%)
    let baseCalculo = 0;
    if (atingimento >= 100) {
        baseCalculo = vendas * (taxa / 100);
    } else if (atingimento >= 80) {
        baseCalculo = vendas * ((taxa / 100) * 0.5); // 50% da bonificação se atingiu 80%
    }

    const bruto = baseCalculo;
    const impostos = bruto * 0.15; // Mock 15% tax
    const liquido = bruto - impostos;

    setResult({
        bruto,
        impostos,
        liquido,
        atingimento
    });
  }, [values.vendas, values.meta, values.taxa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!values.vendedor || result.bruto === 0) return;
    
    const newEntry = {
        id: Date.now(),
        ...values,
        ...result,
        timestamp: new Date()
    };
    setHistory(prev => [newEntry, ...prev]);
  };

  const handleReset = () => {
    setValues({
        vendedor: '',
        periodo: '',
        vendas: '',
        meta: '',
        taxa: '2.0'
    });
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Calculadora de Bonificação | Costa Lavos</title>
      </Helmet>

      <PageHeader 
        title="Calculadora de Bonificação" 
        description="Simule valores de bonificação em tempo real com base em metas e vendas."
        breadcrumbs={[{ label: 'Bonificações', path: '/bonificacoes' }, { label: 'Calculadora' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calculator Form */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Parâmetros de Cálculo
                </CardTitle>
                <CardDescription>Insira os dados do vendedor para simular.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="vendedor">Nome do Vendedor</Label>
                        <Input id="vendedor" name="vendedor" placeholder="Ex: João Silva" value={values.vendedor} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="periodo">Período</Label>
                        <Input id="periodo" name="periodo" type="month" value={values.periodo} onChange={handleChange} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="vendas">Total Vendas (R$)</Label>
                        <Input id="vendas" name="vendas" type="number" placeholder="0.00" value={values.vendas} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meta">Meta do Período (R$)</Label>
                        <Input id="meta" name="meta" type="number" placeholder="0.00" value={values.meta} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taxa">Taxa Bonificação (%)</Label>
                        <Input id="taxa" name="taxa" type="number" step="0.1" value={values.taxa} onChange={handleChange} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-between">
                <Button variant="ghost" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" /> Limpar</Button>
                <Button onClick={handleSave} disabled={!values.vendedor || result.bruto === 0}>
                    <Save className="mr-2 h-4 w-4" /> Salvar Simulação
                </Button>
            </CardFooter>
        </Card>

        {/* Result Card */}
        <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
            <CardHeader>
                <CardTitle className="text-white">Resultado Estimado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-1">
                    <p className="text-sm text-slate-400">Atingimento da Meta</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${result.atingimento >= 100 ? 'text-emerald-400' : result.atingimento >= 80 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {result.atingimento.toFixed(1)}%
                        </span>
                    </div>
                </div>
                <Separator className="bg-slate-700" />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-slate-400">Valor Bruto</p>
                        <p className="text-lg font-semibold">{formatCurrency(result.bruto)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400">Impostos (Est. 15%)</p>
                        <p className="text-lg font-semibold text-rose-300">-{formatCurrency(result.impostos)}</p>
                    </div>
                </div>
                <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400">Valor Líquido a Receber</p>
                    <p className="text-4xl font-bold text-emerald-400 mt-1">{formatCurrency(result.liquido)}</p>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><History className="h-4 w-4" /> Histórico de Simulações (Sessão Atual)</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                        {history.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                                <div>
                                    <p className="font-semibold text-sm">{item.vendedor}</p>
                                    <p className="text-xs text-muted-foreground">Vendas: {formatCurrency(item.vendas)} | Meta: {formatCurrency(item.meta)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-600 text-sm">{formatCurrency(item.liquido)}</p>
                                    <p className="text-xs text-muted-foreground">{item.timestamp.toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BonificacoesCalculadora;