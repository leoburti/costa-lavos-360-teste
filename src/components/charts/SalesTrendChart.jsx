
import React, { useMemo } from 'react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs z-50">
        <p className="font-bold text-slate-800 mb-2">{formatDate(label)}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 capitalize">{entry.name}:</span>
            <span className="font-mono font-medium text-slate-900">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const calculateMovingAverage = (data, windowSize) => {
  if (!data || data.length === 0) return [];
  
  return data.map((item, index, array) => {
    const start = Math.max(0, index - windowSize + 1);
    const subset = array.slice(start, index + 1);
    const sum = subset.reduce((acc, curr) => acc + (curr.total || 0), 0);
    return {
      ...item,
      [`ma${windowSize}`]: sum / subset.length
    };
  });
};

const SalesTrendChart = ({ data, loading, title = "Tendência de Vendas" }) => {
  const chartData = useMemo(() => {
    if (!data) return [];
    let withMA7 = calculateMovingAverage(data, 7);
    let withMA30 = calculateMovingAverage(withMA7, 30);
    return withMA30;
  }, [data]);

  if (loading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center text-muted-foreground border-dashed">
        <div className="text-center">
          <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-20" />
          <p>Sem dados de tendência para o período</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-slate-800">{title}</CardTitle>
        <CardDescription>
          Vendas diárias com médias móveis de 7 e 30 dias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <defs>
                <linearGradient id="colorSalesGeneric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => formatDate(val, 'dd/MM')} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tickFormatter={(val) => new Intl.NumberFormat('pt-BR', { notation: "compact", compactDisplay: "short" }).format(val)} 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              
              <Bar 
                dataKey="total" 
                name="Venda Diária" 
                fill="url(#colorSalesGeneric)" 
                radius={[4, 4, 0, 0]} 
                barSize={8}
              />
              <Line 
                type="monotone" 
                dataKey="ma7" 
                name="Média 7d" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={false} 
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="ma30" 
                name="Média 30d" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesTrendChart;
