import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm border border-border p-3 rounded-lg shadow-lg">
        <p className="label font-bold text-foreground">{`${label}`}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm">
            {`${p.name}: ${formatCurrency(p.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};


const SalesChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data) return [];
        return data.map(item => ({
            date: format(new Date(item.date), 'dd/MM', { locale: ptBR }),
            Vendas: item.total || 0,
            Bonificação: item.bonification || 0,
            Equipamentos: item.equipment || 0,
        }));
    }, [data]);

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 20,
                    left: 40,
                    bottom: 20,
                }}
            >
                <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBonificacao" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEquipamentos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{paddingBottom: 20}} />
                <Area type="monotone" dataKey="Vendas" stroke="#ef4444" fillOpacity={1} fill="url(#colorVendas)" strokeWidth={2} />
                <Area type="monotone" dataKey="Bonificação" stroke="#f97316" fillOpacity={1} fill="url(#colorBonificacao)" strokeWidth={2} />
                <Area type="monotone" dataKey="Equipamentos" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEquipamentos)" strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default SalesChart;