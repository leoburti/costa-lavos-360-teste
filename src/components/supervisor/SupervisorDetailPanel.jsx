
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
import { TrendingUp } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

const SupervisorDetailPanel = ({ supervisorName, dateRange }) => {
  const params = {
    p_start_date: format(dateRange.from, 'yyyy-MM-dd'),
    p_end_date: format(dateRange.to, 'yyyy-MM-dd'),
    p_supervisor_name: supervisorName,
    p_exclude_employees: true
  };

  // Updated RPC call that now works correctly after database fix
  const { data, loading, error } = useAnalyticalData('get_supervisor_one_on_one_data', params);

  if (loading) return <div className="p-8"><Skeleton className="h-[600px] w-full rounded-xl" /></div>;
  if (error || !data) return <div className="p-8 text-center text-red-500">Erro ao carregar detalhes: {error}</div>;

  const { 
    performance_summary: summary, 
    commercial_team_analysis: team, 
    churn_analysis: churn,
    highlights 
  } = data;

  // Calculate Goal Achievement (Mock goal based on growth target)
  const prevRevenue = summary?.previous_total_revenue || 0;
  const currentRevenue = summary?.total_revenue || 0;
  
  // Mock target: simple +10% over previous period
  const targetRevenue = prevRevenue > 0 ? prevRevenue * 1.10 : currentRevenue * 1.10; 
  const achievement = targetRevenue > 0 ? (currentRevenue / targetRevenue) * 100 : 0;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      
      {/* Header Details */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{supervisorName}</h2>
          <div className="flex gap-2 mt-1">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {team?.length || 0} Vendedores
            </Badge>
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
              {summary?.active_clients || 0} Clientes Ativos
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase">Realizado</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(currentRevenue)}</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase">Meta (Est.)</p>
            <p className="text-lg font-bold text-slate-500">{formatCurrency(targetRevenue)}</p>
          </div>
          <div className="text-right">
             <Badge className={achievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}>
               {formatPercentage(achievement)}
             </Badge>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Team Performance */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Performance da Equipe</CardTitle>
            <CardDescription>Ranking de vendas por vendedor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={team} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="seller_name" type="category" width={100} tick={{fontSize: 11}} interval={0} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(val) => formatCurrency(val)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="total_revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 2. Portfolio Health (Churn) */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Saúde da Carteira (Risco)</CardTitle>
            <CardDescription>Distribuição por inatividade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-[200px] w-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={churn}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="client_count"
                    >
                      {churn?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.phase === 'Ativo' ? COLORS[0] : 
                          entry.phase === 'Risco' ? COLORS[1] : 
                          entry.phase === 'Elevado' ? COLORS[2] : COLORS[3]
                        } />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-2xl font-bold text-slate-700">{summary?.active_clients}</span>
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-3 w-full">
                {churn?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full`} style={{ 
                        backgroundColor: item.phase === 'Ativo' ? COLORS[0] : 
                                       item.phase === 'Risco' ? COLORS[1] : 
                                       item.phase === 'Elevado' ? COLORS[2] : COLORS[3] 
                      }} />
                      <span className="text-sm font-medium text-slate-700">{item.phase}</span>
                    </div>
                    <span className="font-bold text-sm">{item.client_count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Top Products */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top Produtos</CardTitle>
            <CardDescription>Mix mais vendido pelo supervisor</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0 divide-y divide-slate-100">
              {highlights?.by_product?.slice(0, 5).map((prod, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]" title={prod.name}>
                      {prod.name}
                    </span>
                  </div>
                  <span className="font-bold text-sm text-slate-900">{formatCurrency(prod.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. Regional Distribution */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Distribuição Regional</CardTitle>
            <CardDescription>Faturamento por região de atuação</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0 divide-y divide-slate-100">
              {highlights?.by_region?.slice(0, 5).map((reg, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-1.5 rounded text-blue-600">
                      <TrendingUp size={14} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {reg.name || 'Região não definida'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-sm text-slate-900">{formatCurrency(reg.value)}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatPercentage((reg.value / currentRevenue) * 100)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default SupervisorDetailPanel;
