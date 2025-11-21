import React from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, CheckCircle } from 'lucide-react';

const FaturamentoPage = () => {
  return (
    <>
      <Helmet><title>Faturamento - Configurações</title></Helmet>
      <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Faturamento e Planos</h2>
            <p className="text-muted-foreground">Gerencie sua assinatura e histórico de pagamentos.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 border rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-semibold text-lg">Plano Enterprise</h3>
                        <p className="text-sm text-muted-foreground">Renova em 01/12/2025</p>
                    </div>
                    <Badge className="bg-primary">Ativo</Badge>
                </div>
                <div className="text-3xl font-bold mb-6">R$ 499,00<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-600" /> Usuários ilimitados</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-600" /> Armazenamento 1TB</div>
                    <div className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-600" /> Suporte Prioritário</div>
                </div>
                <div className="flex gap-3">
                    <Button>Gerenciar Plano</Button>
                    <Button variant="outline">Cancelar</Button>
                </div>
            </div>

            <div className="p-6 border rounded-lg bg-card">
                <h3 className="font-semibold text-lg mb-4">Método de Pagamento</h3>
                <div className="flex items-center gap-4 mb-6 p-4 border rounded bg-background">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Mastercard terminando em 4242</p>
                        <p className="text-xs text-muted-foreground">Expira em 12/28</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full">Adicionar Novo Cartão</Button>
            </div>
        </div>

        <ConfiguracaoGrupo titulo="Histórico de Faturas" descricao="Baixe suas faturas anteriores.">
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="p-4">Data</th>
                            <th className="p-4">Valor</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {[1, 2, 3].map((i) => (
                            <tr key={i} className="hover:bg-muted/5">
                                <td className="p-4">01/{11-i}/2025</td>
                                <td className="p-4">R$ 499,00</td>
                                <td className="p-4"><Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Pago</Badge></td>
                                <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm"><Download className="h-4 w-4 mr-2" /> PDF</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default FaturamentoPage;