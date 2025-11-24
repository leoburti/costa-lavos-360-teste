
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Box, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Download, 
  Plus, 
  Truck, 
  MapPin,
  Search
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { format, startOfMonth, endOfMonth, parseISO, getDay, getHours } from 'date-fns';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LoadingSpinner from '@/components/LoadingSpinner';

// --- Constants & Helpers ---
const COLORS = {
  primary: '#6B2C2C',
  secondary: '#F5E6D3',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  neutral: '#94a3b8'
};

const STATUS_COLORS = {
  'entregue': COLORS.success,
  'concluido': COLORS.success,
  'pendente': COLORS.warning,
  'em_rota': COLORS.info,
  'cancelado': COLORS.danger,
  'devolvido': COLORS.danger
};

// --- Components ---

const KPICard = ({ title, value, icon: Icon, trend, description, colorClass }) => (
  <Card className="border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: colorClass }}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
      <Icon className="h-5 w-5" style={{ color: colorClass }} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold" style={{ color: colorClass }}>{value}</div>
      {(trend || description) && (
        <p className="text-xs text-muted-foreground mt-1">
          {trend && <span className={trend > 0 ? "text-green-600" : "text-red-600"}>{trend > 0 ? '+' : ''}{trend}% </span>}
          {description}
        </p>
      )}
    </CardContent>
  </Card>
);

const TemporalHeatmap = ({ data }) => {
  const gridData = useMemo(() => {
    const grid = Array(7).fill(0).map(() => Array(11).fill(0)); // Days x Hours (8am to 6pm)
    
    data.forEach(item => {
      if (!item.data_entrega) return;
      const date = parseISO(item.data_entrega);
      const day = getDay(date); // 0 = Sunday
      const hour = getHours(date);
      
      if (hour >= 8 && hour <= 18) {
        grid[day][hour - 8] += 1;
      }
    });
    return grid;
  }, [data]);

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hours = Array.from({length: 11}, (_, i) => i + 8); // 8 to 18
  const maxVal = Math.max(...gridData.flat());

  return (
    <div className="flex flex-col h-full">
      <div className="flex mb-2">
        <div className="w-10 shrink-0"></div>
        {hours.map(h => (
          <div key={h} className="flex-1 text-center text-xs text-muted-foreground">{h}h</div>
        ))}
      </div>
      {gridData.map((row, dayIndex) => (
        <div key={dayIndex} className="flex items-center mb-1">
          <div className="w-10 text-xs font-medium text-muted-foreground shrink-0">{days[dayIndex]}</div>
          {row.map((val, hourIndex) => {
            const opacity = maxVal > 0 ? (val / maxVal) : 0;
            const bgColor = `rgba(107, 44, 44, ${Math.max(opacity, 0.05)})`; 
            return (
              <div 
                key={hourIndex} 
                className="flex-1 h-8 mx-0.5 rounded-sm flex items-center justify-center text-[10px] text-white transition-all hover:scale-110 cursor-default"
                style={{ backgroundColor: val > 0 ? bgColor : '#f1f5f9', color: opacity > 0.5 ? 'white' : 'transparent' }}
                title={`${val} entregas`}
              >
                {val > 0 && val}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// --- Main Page Component ---

const DeliveryManagementDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  // Filters
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');
  const [searchQuery, setSearchTerm] = useState('');

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Drivers
        const { data: driversData, error: driversError } = await supabase
          .from('motoristas')
          .select('id, nome')
          .eq('ativo', true);
        
        if (driversError) throw driversError;
        setDrivers(driversData || []);

        // Fetch Deliveries with Robust JOIN
        let query = supabase
          .from('entregas')
          .select(`
            *,
            cliente:clientes!cliente_id(id, nome, email, telefone),
            motorista:motoristas!motorista_id(id, nome)
          `)
          .gte('data_entrega', dateRange.start.toISOString())
          .lte('data_entrega', dateRange.end.toISOString())
          .order('data_entrega', { ascending: false });

        const { data: deliveriesData, error: deliveriesError } = await query;

        if (deliveriesError) throw deliveriesError;
        setDeliveries(deliveriesData || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dashboard."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, toast]);

  // Helper to safe get client name
  const getClientName = (d) => d.cliente?.nome || d.cliente_nome || 'Cliente não identificado';

  // Derived State (KPIs & Charts)
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const clientName = getClientName(d).toLowerCase();
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesDriver = driverFilter === 'all' || d.motorista_id === driverFilter;
      const matchesSearch = searchQuery === '' || 
        (clientName.includes(searchQuery.toLowerCase()) || 
         d.id?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesDriver && matchesSearch;
    });
  }, [deliveries, statusFilter, driverFilter, searchQuery]);

  const kpis = useMemo(() => {
    const total = filteredDeliveries.length;
    const delivered = filteredDeliveries.filter(d => ['entregue', 'concluido'].includes(d.status)).length;
    const pending = filteredDeliveries.filter(d => ['pendente', 'em_rota'].includes(d.status)).length;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const late = filteredDeliveries.filter(d => {
      const dDate = parseISO(d.data_entrega);
      return ['pendente', 'em_rota'].includes(d.status) && dDate < today;
    }).length;

    const successRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0;

    return { total, delivered, pending, late, successRate };
  }, [filteredDeliveries]);

  const statusChartData = useMemo(() => {
    const counts = {};
    filteredDeliveries.forEach(d => {
      const s = d.status || 'desconhecido';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredDeliveries]);

  const dailyChartData = useMemo(() => {
    const groups = {};
    filteredDeliveries.forEach(d => {
      const day = format(parseISO(d.data_entrega), 'dd/MM');
      if (!groups[day]) groups[day] = { name: day, total: 0, delivered: 0 };
      groups[day].total += 1;
      if (['entregue', 'concluido'].includes(d.status)) groups[day].delivered += 1;
    });
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredDeliveries]);

  const regionChartData = useMemo(() => {
    const groups = {};
    filteredDeliveries.forEach(d => {
      // Try to infer region from client address or use rota
      const region = d.rota || (d.cliente?.rota) || 'Rota Padrão'; 
      groups[region] = (groups[region] || 0) + 1;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [filteredDeliveries]);

  // Handlers
  const handleExportCSV = () => {
    const headers = ['ID', 'Data', 'Cliente', 'Motorista', 'Status', 'Caixas Entregues'];
    const csvContent = [
      headers.join(','),
      ...filteredDeliveries.map(d => [
        d.id,
        format(parseISO(d.data_entrega), 'dd/MM/yyyy'),
        `"${getClientName(d)}"`,
        `"${d.motorista?.nome || 'N/A'}"`,
        d.status,
        d.caixas_entregues || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `entregas_export_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Entregas', 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 22);

    const tableData = filteredDeliveries.map(d => [
      format(parseISO(d.data_entrega), 'dd/MM'),
      getClientName(d).substring(0, 20),
      d.motorista?.nome || 'N/A',
      d.status,
      d.caixas_entregues || '0'
    ]);

    autoTable(doc, {
      head: [['Data', 'Cliente', 'Motorista', 'Status', 'Qtd']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [107, 44, 44] } // #6B2C2C
    });

    doc.save('relatorio_entregas.pdf');
  };

  const handleSimulateAddOrder = () => {
    toast({ title: "Simulação", description: "Abrindo modal de novo pedido..." });
  };

  if (loading) return <LoadingSpinner message="Carregando dashboard de entregas..." />;

  return (
    <>
      <Helmet>
        <title>Dashboard Entregas | Costa Lavos</title>
      </Helmet>

      <div className="space-y-6 p-2 md:p-0">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#6B2C2C]">Gestão de Entregas</h1>
            <p className="text-muted-foreground text-sm">Acompanhe o desempenho logístico em tempo real.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button variant="outline" className="text-[#6B2C2C] border-[#6B2C2C]" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" className="text-[#6B2C2C] border-[#6B2C2C]" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button className="bg-[#6B2C2C] hover:bg-[#7D3E3E] text-white" onClick={handleSimulateAddOrder}>
              <Plus className="mr-2 h-4 w-4" /> Novo Pedido
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <KPICard title="Total Entregas" value={kpis.total} icon={Box} colorClass={COLORS.primary} description="No período selecionado" />
          <KPICard title="Entregues" value={kpis.delivered} icon={CheckCircle} colorClass={COLORS.success} description="Concluídas com sucesso" />
          <KPICard title="Pendentes" value={kpis.pending} icon={Clock} colorClass={COLORS.warning} description="Aguardando ou em rota" />
          <KPICard title="Atrasadas" value={kpis.late} icon={AlertTriangle} colorClass={COLORS.danger} description="Fora do prazo previsto" />
          <KPICard title="Taxa Sucesso" value={`${kpis.successRate}%`} icon={TrendingUp} colorClass={COLORS.info} description="Entregas efetivadas" />
        </div>

        {/* Filters */}
        <Card className="bg-[#F5E6D3]/30 border-none">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#6B2C2C]">Período</label>
                <div className="flex gap-2">
                   <Input 
                      type="date" 
                      value={format(dateRange.start, 'yyyy-MM-dd')}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: parseISO(e.target.value) }))}
                      className="h-9 bg-white"
                   />
                   <Input 
                      type="date" 
                      value={format(dateRange.end, 'yyyy-MM-dd')}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: parseISO(e.target.value) }))}
                      className="h-9 bg-white"
                   />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#6B2C2C]">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="em_rota">Em Rota</SelectItem>
                    <SelectItem value="entregue">Entregues</SelectItem>
                    <SelectItem value="cancelado">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#6B2C2C]">Motorista</label>
                <Select value={driverFilter} onValueChange={setDriverFilter}>
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {drivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#6B2C2C]">Busca</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Cliente ou ID..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-8 h-9 bg-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row 1 */}
        <div className="grid gap-4 md:grid-cols-7">
          {/* Daily Trend */}
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle className="text-[#6B2C2C]">Evolução Diária</CardTitle>
              <CardDescription>Volume de entregas nos últimos dias</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="total" name="Total" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorTotal)" />
                  <Area type="monotone" dataKey="delivered" name="Entregues" stroke={COLORS.success} fillOpacity={1} fill="url(#colorDelivered)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-[#6B2C2C]">Status das Entregas</CardTitle>
              <CardDescription>Distribuição por situação atual</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS.neutral} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#6B2C2C]">Mapa de Calor (Horário)</CardTitle>
              <CardDescription>Intensidade de entregas por dia e hora</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <TemporalHeatmap data={filteredDeliveries} />
            </CardContent>
          </Card>

          {/* Region Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#6B2C2C]">Entregas por Região</CardTitle>
              <CardDescription>Top 5 rotas/regiões com mais volume</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionChartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                  <RechartsTooltip />
                  <Bar dataKey="value" name="Entregas" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Deliveries Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[#6B2C2C]">Entregas Recentes</CardTitle>
              <CardDescription>Últimas movimentações registradas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toast({ title: "Navegação", description: "Ir para lista completa" })}>
              Ver Todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-[#F5E6D3]/20">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.slice(0, 5).map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium text-xs">{delivery.id?.substring(0,8)}...</TableCell>
                      <TableCell>{format(parseISO(delivery.data_entrega), 'dd/MM HH:mm')}</TableCell>
                      <TableCell>{getClientName(delivery)}</TableCell>
                      <TableCell>{delivery.motorista?.nome || 'Não atribuído'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase text-[10px]" style={{ 
                          borderColor: STATUS_COLORS[delivery.status], 
                          color: STATUS_COLORS[delivery.status] 
                        }}>
                          {delivery.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MapPin className="h-4 w-4 text-muted-foreground hover:text-[#6B2C2C]" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Truck className="h-4 w-4 text-muted-foreground hover:text-[#6B2C2C]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDeliveries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma entrega encontrada para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DeliveryManagementDashboard;
