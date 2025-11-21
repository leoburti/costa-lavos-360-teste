import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, User, ShoppingCart, Wrench, Calendar, MapPin, HardHat } from 'lucide-react';
import { exportToPDF } from '@/utils/geoExportUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Sub-components for tabs
const InfoTab = ({ client, commercial }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Dados Cadastrais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Razão Social</p>
            <p className="text-base">{client.nome}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nome Fantasia</p>
            <p className="text-base">{client.nome_fantasia || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Código/Loja</p>
            <p className="text-base">{client.codigo} - {client.loja}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">CNPJ</p>
            <p className="text-base">{client.cnpj || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-medium text-muted-foreground">Endereço</p>
            <p className="text-base">{client.endereco}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Telefone</p>
            <p className="text-base">{client.telefone || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{client.email || '-'}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Indicadores Comerciais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {commercial ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Classificação ABC</p>
                <p className="text-2xl font-bold text-blue-900">{commercial.kpis?.abc || '-'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Status Churn</p>
                <p className="text-2xl font-bold text-green-900">{commercial.kpis?.churn || '-'}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Segmento RFM</p>
                <p className="text-2xl font-bold text-purple-900">{commercial.kpis?.rfm || '-'}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Tendência</p>
                <p className="text-2xl font-bold text-orange-900">{commercial.kpis?.trend || '-'}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Vendedor</span>
                <span className="font-medium">{commercial.seller_name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Supervisor</span>
                <span className="font-medium">{commercial.supervisor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Região</span>
                <span className="font-medium">{commercial.region_name}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Dados comerciais não disponíveis</div>
        )}
      </CardContent>
    </Card>
  </div>
);

const SalesTab = ({ commercial }) => {
  if (!commercial) return <div className="p-8 text-center text-muted-foreground">Sem dados de vendas.</div>;

  const salesData = commercial.sales_last_3_months?.map(s => ({
    name: format(new Date(s.month + '-01'), 'MMM/yy', { locale: ptBR }),
    valor: s.revenue
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Vendas (12 meses)</p>
            <p className="text-2xl font-bold">R$ {commercial.total_revenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Bonificado</p>
            <p className="text-2xl font-bold">R$ {commercial.total_bonification?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Pedidos</p>
            <p className="text-2xl font-bold">{commercial.total_orders}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução de Vendas</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
              <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

const SupportTab = ({ support }) => {
  if (!support?.found || support.chamados.length === 0) return <div className="p-8 text-center text-muted-foreground">Nenhum chamado encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Chamados</p>
            <p className="text-2xl font-bold">{support.chamados.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Em Aberto</p>
            <p className="text-2xl font-bold text-orange-600">{support.chamados.filter(c => c.status !== 'concluido' && c.status !== 'cancelado').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
            <p className="text-2xl font-bold text-green-600">{support.chamados.filter(c => c.status === 'concluido').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Chamados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {support.chamados.map((chamado) => (
              <div key={chamado.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{chamado.tipo}</span>
                    <Badge variant={chamado.status === 'concluido' ? 'default' : 'secondary'}>
                      {chamado.status}
                    </Badge>
                    <Badge variant="outline">{chamado.prioridade}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{chamado.motivo}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Criado em {format(new Date(chamado.data_criacao), 'dd/MM/yyyy HH:mm')} • Técnico: {chamado.tecnico || 'N/A'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EquipmentTab = ({ inventory, support }) => {
  const comodatoEquipments = support?.equipamentos || [];
  const hasData = inventory.length > 0 || comodatoEquipments.length > 0;

  if (!hasData) return <div className="p-8 text-center text-muted-foreground">Nenhum equipamento encontrado.</div>;

  return (
    <div className="space-y-6">
      {inventory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventário (Vendas)</CardTitle>
            <CardDescription>Equipamentos registrados no histórico de vendas (bd_cl_inv)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inventory.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.Equipamento}</p>
                    <p className="text-xs text-muted-foreground">Data Venda: {item.Data_Venda ? format(new Date(item.Data_Venda), 'dd/MM/yyyy') : '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.QTD}</p>
                    <p className="text-xs text-muted-foreground">Qtd</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {comodatoEquipments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Equipamentos em Comodato (Apoio)</CardTitle>
            <CardDescription>Equipamentos controlados pelo módulo de Apoio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comodatoEquipments.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.modelo}</p>
                    <p className="text-xs text-muted-foreground">Série: {item.serie}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.status === 'instalado' ? 'default' : 'secondary'}>{item.status}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Instalado: {item.data_instalacao ? format(new Date(item.data_instalacao), 'dd/MM/yyyy') : '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AgendaTab = ({ support }) => {
  if (!support?.found || support.agenda.length === 0) return <div className="p-8 text-center text-muted-foreground">Nenhum agendamento encontrado.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {support.agenda.map((evento) => (
            <div key={evento.id} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-semibold">{evento.titulo}</h4>
                  <span className="text-sm text-muted-foreground">{format(new Date(evento.data), 'dd/MM/yyyy')}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {evento.inicio} - {evento.fim} • Técnico: {evento.tecnico}
                </p>
                <Badge variant="outline" className="mt-2">{evento.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const GeoTab = ({ support }) => {
  if (!support?.found || support.geolocalizacao.length === 0) return <div className="p-8 text-center text-muted-foreground">Nenhum registro de geolocalização.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas Visitas (Check-ins)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {support.geolocalizacao.map((geo) => (
            <div key={geo.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className={`w-5 h-5 ${geo.dentro_raio ? 'text-green-500' : 'text-red-500'}`} />
                <div>
                  <p className="font-medium">{geo.tipo === 'checkin' ? 'Entrada' : 'Saída'}</p>
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
      </CardContent>
    </Card>
  );
};

export default function Client360Dashboard({ data }) {
  const { basicInfo, commercial, support, inventory } = data;

  const handleExport = () => {
    exportToPDF(`Visao360_${basicInfo.nome_fantasia || basicInfo.nome}`, ['Seção', 'Detalhes'], [
      ['Cliente', basicInfo.nome],
      ['CNPJ', basicInfo.cnpj || '-'],
      ['Vendas (12m)', commercial ? `R$ ${commercial.total_revenue}` : '-'],
      ['Chamados', support?.found ? support.chamados.length : 0]
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{basicInfo.nome_fantasia || basicInfo.nome}</h2>
          <p className="text-gray-500">{basicInfo.codigo} - {basicInfo.loja} • {basicInfo.endereco}</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Exportar Ficha
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap bg-transparent p-0 gap-2">
          <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white"><User className="w-4 h-4 mr-2"/> Informações</TabsTrigger>
          <TabsTrigger value="vendas" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white"><ShoppingCart className="w-4 h-4 mr-2"/> Vendas</TabsTrigger>
          <TabsTrigger value="apoio" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white"><Wrench className="w-4 h-4 mr-2"/> Apoio</TabsTrigger>
          <TabsTrigger value="equipamentos" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white"><HardHat className="w-4 h-4 mr-2"/> Equipamentos</TabsTrigger>
          <TabsTrigger value="agenda" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white"><Calendar className="w-4 h-4 mr-2"/> Agenda</TabsTrigger>
          <TabsTrigger value="geo" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white"><MapPin className="w-4 h-4 mr-2"/> Geolocalização</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="info">
            <InfoTab client={basicInfo} commercial={commercial} />
          </TabsContent>
          <TabsContent value="vendas">
            <SalesTab commercial={commercial} />
          </TabsContent>
          <TabsContent value="apoio">
            <SupportTab support={support} />
          </TabsContent>
          <TabsContent value="equipamentos">
            <EquipmentTab inventory={inventory} support={support} />
          </TabsContent>
          <TabsContent value="agenda">
            <AgendaTab support={support} />
          </TabsContent>
          <TabsContent value="geo">
            <GeoTab support={support} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}