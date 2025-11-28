import React from 'react';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingUp, Users, AlertTriangle, Target, Briefcase } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#64748b'];

const VendedorDetailPanel = ({ sellerName, dateRange }) => {
  const params = {
    p_start_date: format(dateRange.from, 'yyyy-MM-dd'),
    p_end_date: format(dateRange.to, 'yyyy-MM-dd'),
    p_seller_name: sellerName,
    p_exclude_employees: true
  };

  const { data, loading, error } = useAnalyticalData('get_seller_analytical_data', params);

  if (loading) return <div className="p-8"><Skeleton className="h-[600px] w-full rounded-xl" /></div>;
  if (error || !data) return <div className="p-8 text-center text-red-500">Erro ao carregar detalhes: {error}</div>;

  const { 
    kpis,
    client_performance: clients,
    churn_analysis: churn,
    rfm_analysis: rfm
  } = data;

  // Sort clients by revenue for the chart
  const topClients = clients?.slice(0, 10) || [];
  
  // Prepare Churn Data
  const churnData = churn?.map(item => ({
    name: item.phase,
    value: parseInt(item.client_count)
  })) || [];

  // Prepare RFM Data
  const rfmData = rfm?.map(item => ({
    name: item.segment,
    value: parseInt(item.client_count)
  })) || [];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      
      {/* Header Details */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {sellerName}
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-medium">
              Vendedor
            </Badge>
          </h2>
          <div className="flex gap-3 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1"><UsersIcon size={14} /> {kpis?.total_clients || 0} Clientes na carteira</span>
            <span className="flex items-center gap-1"><TrendingUp size={14} /> +{kpis?.clients_gained || 0} Novos</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venda Total</p>
            <p className="text-xl font-black text-slate-900">{formatCurrency(kpis?.total_revenue)}</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ticket Médio</p>
            <p className="text-lg font-bold text-slate-500">{formatCurrency(kpis?.average_ticket)}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Top Clients Performance */}
        <Card className="border-slate-200 shadow-sm col-span-1 h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={18} />
              Top Clientes
            </CardTitle>
            <CardDescription>Maiores compradores no período</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClients} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }} barCategoryGap={4}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={110} 
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    interval={0} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="total_revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18}>
                    {topClients?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? '#3b82f6' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Portfolio Health (Churn) */}
        <Card className="border-slate-200 shadow-sm col-span-1 h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={18} />
              Saúde da Carteira
            </CardTitle>
            <CardDescription>Distribuição por inatividade</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="flex flex-col sm:flex-row items-center gap-8 w-full">
              <div className="h-[220px] w-[220px] relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={churnData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {churnData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.name === 'Ativo' ? COLORS[0] : 
                          entry.name === 'Risco' ? COLORS[1] : 
                          entry.name === 'Elevado' ? COLORS[2] : COLORS[3]
                        } />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-3xl font-black text-slate-800">{kpis?.total_clients}</span>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-3 w-full max-w-xs">
                {churnData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full shadow-sm`} style={{ 
                        backgroundColor: item.name === 'Ativo' ? COLORS[0] : 
                                       item.name === 'Risco' ? COLORS[1] : 
                                       item.name === 'Elevado' ? COLORS[2] : COLORS[3] 
                      }} />
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-bold text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-100 shadow-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. RFM Segmentation */}
        <Card className="border-slate-200 shadow-sm col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Target className="text-violet-500" size={18} />
              Segmentação RFM
            </CardTitle>
            <CardDescription>Perfil de compra dos clientes</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0 divide-y divide-slate-50">
              {rfmData.slice(0, 5).map((seg, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 hover:bg-slate-50/80 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {seg.name}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{seg.value} clientes</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

const UsersIcon = ({size, className}) => <Users size={size} className={className} />;

export default VendedorDetailPanel;