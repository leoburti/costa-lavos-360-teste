import React, { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, User, Users, ShoppingCart, Wrench, Calendar, MapPin, 
  HardHat, FileText, FolderOpen, Phone, Clock, AlertCircle,
  TrendingUp, DollarSign, Gift, Package, CheckCircle, Activity,
  ExternalLink, Mail, Building, CreditCard, FileCheck,
  BarChart2, PieChart, History, AlertTriangle
} from 'lucide-react';
import { exportToPDF } from '@/utils/geoExportUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, Cell } from 'recharts';
import MetricCard from '@/components/MetricCard';
import { formatCurrency } from '@/lib/utils';

// --- Helper Functions ---
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'concluido': return 'success';
    case 'em andamento': return 'warning';
    case 'aberto': return 'destructive';
    case 'cancelado': return 'secondary';
    default: return 'outline';
  }
};

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'alta': return 'destructive';
    case 'media': return 'warning';
    case 'baixa': return 'success';
    default: return 'outline';
  }
};

// --- Sub-components ---

const InfoTab = ({ client, commercial, crm }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Dados Cadastrais */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5"/> Dados Cadastrais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase font-semibold">Razão Social</p>
              <p className="font-medium text-base">{client.nome}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase font-semibold">Nome Fantasia</p>
              <p className="font-medium text-base">{client.nome_fantasia || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase font-semibold">CNPJ</p>
              <p className="font-medium">{client.cnpj || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase font-semibold">Código / Loja</p>
              <p className="font-medium">{client.codigo} - {client.loja}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-muted-foreground text-xs uppercase font-semibold">Endereço</p>
              <p className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {client.endereco}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase font-semibold">Cidade / UF</p>
              <p className="font-medium">{client.cidade || '-'} / {client.estado || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs uppercase font-semibold">Contato Principal</p>
              <div className="flex flex-col gap-1">
                {client.telefone && <span className="flex items-center gap-2"><Phone className="w-3 h-3"/> {client.telefone}</span>}
                {client.email && <span className="flex items-center gap-2"><Mail className="w-3 h-3"/> {client.email}</span>}
              </div>
            </div>
          </div>

          {commercial && (
            <>
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4"/> Informações Comerciais</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Condição de Pagamento</p>
                    <p className="font-medium">{commercial.kpis?.payment_condition || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Primeira Compra</p>
                    <p className="font-medium">{commercial.kpis?.first_purchase_date ? format(new Date(commercial.kpis.first_purchase_date), 'dd/MM/yyyy') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Última Compra</p>
                    <p className="font-medium">{commercial.kpis?.last_purchase_date ? format(new Date(commercial.kpis.last_purchase_date), 'dd/MM/yyyy') : '-'}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Indicadores Rápidos */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Classificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{commercial?.kpis?.abc || '-'}</div>
                <div className="text-xs text-muted-foreground uppercase">Curva ABC</div>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{commercial?.kpis?.rfm || '-'}</div>
                <div className="text-xs text-muted-foreground uppercase">RFM</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">Churn Risk</span>
                <Badge variant={commercial?.kpis?.churn === 'Crítico' ? 'destructive' : commercial?.kpis?.churn === 'Risco' ? 'warning' : 'success'}>
                  {commercial?.kpis?.churn || '-'}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">Tendência</span>
                <Badge variant="outline">{commercial?.kpis?.trend || '-'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Equipe de Atendimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full"><User className="w-4 h-4 text-primary"/></div>
              <div>
                <p className="text-xs text-muted-foreground">Vendedor</p>
                <p className="font-medium text-sm">{commercial?.seller_name || 'Não definido'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full"><Users className="w-4 h-4 text-primary"/></div>
              <div>
                <p className="text-xs text-muted-foreground">Supervisor</p>
                <p className="font-medium text-sm">{commercial?.supervisor_name || 'Não definido'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    
    {/* Timeline Consolidada */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5"/> Timeline de Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-muted ml-3 space-y-6 pb-2">
          {commercial?.sales_last_3_months?.slice(0, 3).map((sale, idx) => (
            <div key={`sale-${idx}`} className="ml-6 relative">
              <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <p className="text-sm font-medium">Venda Realizada</p>
                  <p className="text-xs text-muted-foreground">Receita: {formatCurrency(sale.revenue)}</p>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(sale.month + '-01'), 'MMM yyyy', { locale: ptBR })}</span>
              </div>
            </div>
          ))}
          {crm?.deals?.slice(0, 2).map((deal, idx) => (
             <div key={`deal-${idx}`} className="ml-6 relative">
              <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-background bg-purple-500" />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <p className="text-sm font-medium">Oportunidade CRM: {deal.title}</p>
                  <p className="text-xs text-muted-foreground">Status: {deal.status}</p>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(deal.created_at), 'dd/MM/yyyy')}</span>
              </div>
            </div>
          ))}
          <div className="ml-6 relative">
            <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-background bg-blue-500" />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div>
                <p className="text-sm font-medium">Cadastro Sincronizado</p>
                <p className="text-xs text-muted-foreground">Dados atualizados do ERP</p>
              </div>
              <span className="text-xs text-muted-foreground">Hoje</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const SalesTab = ({ commercial }) => {
  // Aggregate top products - Moved hook to top level
  const topProducts = useMemo(() => {
    if (!commercial?.products) return [];
    const productMap = {};
    commercial.products.forEach(day => {
      day.items?.forEach(item => {
        if (!productMap[item.name]) {
          productMap[item.name] = { name: item.name, revenue: 0, quantity: 0 };
        }
        productMap[item.name].revenue += item.revenue;
        productMap[item.name].quantity += (item.quantity || 0);
      });
    });
    return Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [commercial]);

  if (!commercial) return <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">Sem dados de vendas disponíveis.</div>;

  const salesData = commercial.twelve_month_analysis?.map(s => ({
    name: format(new Date(s.month + '-01'), 'MMM/yy', { locale: ptBR }),
    valor: s.products_value,
    bonificacao: s.bonification_value
  })).reverse() || [];

  const bonificationHistory = commercial.bonified_items?.flatMap(day => 
    day.items.map(item => ({ ...item, date: day.date }))
  ).slice(0, 20) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Vendas (12m)" value={formatCurrency(commercial.total_revenue)} icon={DollarSign} />
        <MetricCard title="Total Bonificado" value={formatCurrency(commercial.total_bonification)} icon={Gift} />
        <MetricCard title="Pedidos" value={commercial.total_orders} icon={ShoppingCart} />
        <MetricCard title="Ticket Médio" value={formatCurrency(commercial.total_revenue / (commercial.total_orders || 1))} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Vendas e Bonificações</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `R$${val/1000}k`} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="valor" name="Vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="bonificacao" name="Bonificação" fill="#8b5cf6" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Produtos (12 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              <div className="space-y-4">
                {topProducts.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-medium truncate" title={prod.name}>{prod.name}</p>
                      <p className="text-xs text-muted-foreground">{prod.quantity} unidades</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(prod.revenue)}</p>
                    </div>
                  </div>
                ))}
                {topProducts.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum produto encontrado.</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {bonificationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico Recente de Bonificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="p-3 font-medium text-muted-foreground">Data</th>
                    <th className="p-3 font-medium text-muted-foreground">Produto</th>
                    <th className="p-3 font-medium text-muted-foreground text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {bonificationHistory.map((item, idx) => (
                    <tr key={idx} className="border-t hover:bg-muted/50">
                      <td className="p-3">{format(new Date(item.date), 'dd/MM/yyyy')}</td>
                      <td className="p-3">{item.name}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SupportTab = ({ support }) => {
  if (!support?.found || support.chamados.length === 0) return <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">Nenhum chamado encontrado.</div>;

  const stats = {
    total: support.chamados.length,
    open: support.chamados.filter(c => c.status !== 'concluido' && c.status !== 'cancelado').length,
    closed: support.chamados.filter(c => c.status === 'concluido').length,
    avgTime: "2.5 dias" // Mocked for now, would need calculation from history
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Chamados" value={stats.total} icon={Wrench} />
        <MetricCard title="Em Aberto" value={stats.open} icon={AlertCircle} changeType={stats.open > 0 ? "down" : "neutral"} />
        <MetricCard title="Concluídos" value={stats.closed} icon={CheckCircle} changeType="up" />
        <MetricCard title="Tempo Médio" value={stats.avgTime} icon={Clock} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Chamados</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {support.chamados.map((chamado) => (
                <div key={chamado.id} className="flex flex-col p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(chamado.status)} className="capitalize">
                        {chamado.status}
                      </Badge>
                      <span className="font-semibold text-base">{chamado.tipo}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(chamado.data_criacao), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  
                  <p className="text-sm text-foreground mb-3">{chamado.motivo}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><User className="w-3 h-3"/> {chamado.tecnico || 'Não atribuído'}</span>
                      <Badge variant={getPriorityColor(chamado.prioridade)} className="text-[10px] h-5 px-1.5">{chamado.prioridade}</Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">Ver Detalhes</Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

const EquipmentTab = ({ inventory, support }) => {
  const comodatoEquipments = support?.equipamentos || [];
  const hasData = inventory.length > 0 || comodatoEquipments.length > 0;

  if (!hasData) return <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">Nenhum equipamento encontrado.</div>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="comodato" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comodato">Ativos em Comodato ({comodatoEquipments.length})</TabsTrigger>
          <TabsTrigger value="vendas">Histórico de Vendas ({inventory.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comodato" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HardHat className="w-5 h-5"/> Equipamentos Controlados</CardTitle>
              <CardDescription>Equipamentos atualmente instalados ou em posse do cliente via contrato.</CardDescription>
            </CardHeader>
            <CardContent>
              {comodatoEquipments.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {comodatoEquipments.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md">
                            <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-base">{item.modelo}</p>
                            <p className="text-sm text-muted-foreground">Série: <span className="font-mono text-foreground">{item.serie}</span></p>
                            <p className="text-xs text-muted-foreground mt-1">Instalado em: {item.data_instalacao ? format(new Date(item.data_instalacao), 'dd/MM/yyyy') : 'Data desconhecida'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={item.status === 'instalado' ? 'success' : 'secondary'} className="mb-1 capitalize">{item.status}</Badge>
                          <p className="text-xs text-muted-foreground">Patrimônio: {item.patrimonio || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Nenhum equipamento em comodato registrado.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Equipamentos Vendidos</CardTitle>
              <CardDescription>Histórico de equipamentos faturados para este cliente.</CardDescription>
            </CardHeader>
            <CardContent>
              {inventory.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="text-left">
                          <th className="p-3 font-medium text-muted-foreground">Equipamento</th>
                          <th className="p-3 font-medium text-muted-foreground">Série</th>
                          <th className="p-3 font-medium text-muted-foreground">Data Venda</th>
                          <th className="p-3 font-medium text-muted-foreground text-right">Qtd</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((item, idx) => (
                          <tr key={idx} className="border-t hover:bg-muted/50">
                            <td className="p-3 font-medium">{item.Equipamento}</td>
                            <td className="p-3 font-mono text-xs">{item.AA3_CHAPA || '-'}</td>
                            <td className="p-3">{item.Data_Venda ? format(new Date(item.Data_Venda), 'dd/MM/yyyy') : '-'}</td>
                            <td className="p-3 text-right">{item.QTD}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Nenhum histórico de venda de equipamentos.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AgendaTab = ({ support }) => {
  if (!support?.found || support.agenda.length === 0) return <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">Nenhum agendamento encontrado.</div>;

  const sortedAgenda = [...support.agenda].sort((a, b) => new Date(b.data) - new Date(a.data));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {sortedAgenda.map((evento) => (
              <div key={evento.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center justify-center bg-muted p-2 rounded min-w-[60px]">
                  <span className="text-xs font-bold uppercase text-muted-foreground">{format(new Date(evento.data), 'MMM', { locale: ptBR })}</span>
                  <span className="text-xl font-bold">{format(new Date(evento.data), 'dd')}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold truncate pr-2">{evento.titulo}</h4>
                    <Badge variant="outline" className="capitalize">{evento.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{evento.descricao || 'Sem descrição'}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {evento.inicio} - {evento.fim}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3"/> {evento.tecnico}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const GeoTab = ({ support, client }) => {
  if (!support?.found || support.geolocalizacao.length === 0) return <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">Nenhum registro de geolocalização.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Localização do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Placeholder for map - in real app use Google Maps or Leaflet */}
                <MapPin className="w-12 h-12 text-primary mb-2" />
                <div className="absolute bottom-4 left-4 right-4 bg-background/90 p-3 rounded border shadow-sm">
                    <p className="text-sm font-medium">{client.endereco}</p>
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.endereco)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                        Abrir no Google Maps <ExternalLink className="w-3 h-3"/>
                    </a>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Visitas (Check-ins)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {support.geolocalizacao.map((geo) => (
                  <div key={geo.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${geo.dentro_raio ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{geo.tipo === 'checkin' ? 'Entrada' : 'Saída'}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(geo.data), 'dd/MM/yyyy HH:mm')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{geo.tecnico}</p>
                      <p className="text-xs text-muted-foreground">{Number(geo.distancia).toFixed(0)}m do local</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ContactsTab = ({ client, crm }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Contatos Registrados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ERP Contact */}
          <div className="flex items-start gap-4 p-4 border rounded-lg bg-card">
            <div className="bg-primary/10 p-3 rounded-full">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Contato ERP (Principal)</p>
              <p className="text-sm text-muted-foreground mt-1">{client.telefone || 'Telefone não informado'}</p>
              <p className="text-sm text-muted-foreground">{client.email || 'Email não informado'}</p>
              <Badge variant="outline" className="mt-2">Origem: Sistema Comercial</Badge>
            </div>
          </div>

          {/* CRM Contacts */}
          {crm?.contacts?.map((contact) => (
             <div key={contact.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">{contact.representative_name || contact.fantasy_name}</p>
                  <p className="text-xs text-muted-foreground">{contact.representative_role || 'Cargo não informado'}</p>
                  <p className="text-sm text-muted-foreground mt-1">{contact.representative_phone || contact.phone}</p>
                  <p className="text-sm text-muted-foreground">{contact.representative_email || contact.email}</p>
                  <Badge variant="secondary" className="mt-2">Origem: CRM</Badge>
                </div>
             </div>
          ))}
        </div>
        {(!client.telefone && !client.email && (!crm?.contacts || crm.contacts.length === 0)) && (
            <div className="text-center py-8 text-muted-foreground">Nenhum contato adicional encontrado.</div>
        )}
      </CardContent>
    </Card>
  </div>
);

const DocumentsTab = ({ documents }) => (
  <Card>
    <CardHeader>
      <CardTitle>Documentos e Anexos</CardTitle>
      <CardDescription>Arquivos vinculados a chamados e contratos.</CardDescription>
    </CardHeader>
    <CardContent>
      {documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
                <div key={doc.id} className="group relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                    <FileText className="w-10 h-10 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium text-center truncate w-full px-2">{doc.nome_arquivo}</p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(doc.data_upload), 'dd/MM/yyyy')}</p>
                    <a 
                        href={doc.url_arquivo} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute inset-0"
                        aria-label={`Abrir ${doc.nome_arquivo}`}
                    />
                </div>
            ))}
        </div>
      ) : (
        <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            <FolderOpen className="w-10 h-10 mx-auto mb-4 opacity-20" />
            <p>Nenhum documento anexado.</p>
        </div>
      )}
    </CardContent>
  </Card>
);

// --- Main Component ---

export default function Client360Dashboard({ data }) {
  const { basicInfo, commercial, support, inventory, crm, documents } = data;

  const handleExport = () => {
    exportToPDF(`Visao360_${basicInfo.nome_fantasia || basicInfo.nome}`, ['Seção', 'Detalhes'], [
      ['Cliente', basicInfo.nome],
      ['CNPJ', basicInfo.cnpj || '-'],
      ['Vendas (12m)', commercial ? formatCurrency(commercial.total_revenue) : '-'],
      ['Chamados', support?.found ? support.chamados.length : 0],
      ['Equipamentos', (inventory.length + (support?.equipamentos?.length || 0)).toString()]
    ]);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b border-border flex justify-between items-start bg-card">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{basicInfo.nome_fantasia || basicInfo.nome}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Badge variant="outline" className="font-mono">{basicInfo.codigo} - {basicInfo.loja}</Badge>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {basicInfo.endereco}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Exportar
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="info" className="h-full flex flex-col">
          <div className="px-6 pt-4 border-b border-border bg-card/50">
            <TabsList className="w-full justify-start h-auto flex-wrap bg-transparent p-0 gap-1 mb-1">
              <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-border rounded-t-md rounded-b-none px-4 py-2"><User className="w-4 h-4 mr-2"/> Informações</TabsTrigger>
              <TabsTrigger value="vendas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-border rounded-t-md rounded-b-none px-4 py-2"><ShoppingCart className="w-4 h-4 mr-2"/> Vendas</TabsTrigger>
              <TabsTrigger value="apoio" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-border rounded-t-md rounded-b-none px-4 py-2"><Wrench className="w-4 h-4 mr-2"/> Apoio</TabsTrigger>
              <TabsTrigger value="comodato" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-border rounded-t-md rounded-b-none px-4 py-2"><HardHat className="w-4 h-4 mr-2"/> Equipamentos</TabsTrigger>
              <TabsTrigger value="agenda" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-border rounded-t-md rounded-b-none px-4 py-2"><Calendar className="w-4 h-4 mr-2"/> Agenda</TabsTrigger>
              <TabsTrigger value="geo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-border rounded-t-md rounded-b-none px-4 py-2"><MapPin className="w-4 h-4 mr-2"/> Geolocalização</TabsTrigger>
              <TabsTrigger value="contatos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-border rounded-t-md rounded-b-none px-4 py-2"><Phone className="w-4 h-4 mr-2"/> Contatos</TabsTrigger>
              <TabsTrigger value="documentos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-transparent data-[state=active]:border-border rounded-t-md rounded-b-none px-4 py-2"><FolderOpen className="w-4 h-4 mr-2"/> Documentos</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 bg-muted/10">
            <div className="p-6">
              <TabsContent value="info" className="mt-0">
                <InfoTab client={basicInfo} commercial={commercial} crm={crm} />
              </TabsContent>
              <TabsContent value="vendas" className="mt-0">
                <SalesTab commercial={commercial} />
              </TabsContent>
              <TabsContent value="apoio" className="mt-0">
                <SupportTab support={support} />
              </TabsContent>
              <TabsContent value="comodato" className="mt-0">
                <EquipmentTab inventory={inventory} support={support} />
              </TabsContent>
              <TabsContent value="agenda" className="mt-0">
                <AgendaTab support={support} />
              </TabsContent>
              <TabsContent value="geo" className="mt-0">
                <GeoTab support={support} client={basicInfo} />
              </TabsContent>
              <TabsContent value="contatos" className="mt-0">
                <ContactsTab client={basicInfo} crm={crm} />
              </TabsContent>
              <TabsContent value="documentos" className="mt-0">
                <DocumentsTab documents={documents} />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};