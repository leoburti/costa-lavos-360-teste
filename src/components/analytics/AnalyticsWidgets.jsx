import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * AnalyticsKPI
 * Widget para exibição de indicadores chave de performance.
 */
export const AnalyticsKPI = ({ title, value, trend, trendValue, icon: Icon, format = 'number', loading, color }) => {
  if (loading) return <Skeleton className="h-32 w-full rounded-xl" />;

  const numValue = Number(value) || 0;
  let formattedValue = numValue;
  
  if (format === 'currency') formattedValue = formatCurrency(numValue);
  else if (format === 'percentage') formattedValue = formatPercentage(numValue);
  else formattedValue = formatNumber(numValue);

  const isPositive = trend === 'up';
  const isNegative = trend === 'down';
  const isNeutral = !isPositive && !isNegative;
  
  const trendColor = isPositive ? 'text-emerald-600 bg-emerald-50' : isNeutral ? 'text-slate-600 bg-slate-50' : 'text-rose-600 bg-rose-50';
  const TrendIcon = isPositive ? ArrowUp : isNeutral ? Minus : ArrowDown;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-lg", color ? `text-${color}-600 bg-${color}-50` : "text-primary bg-primary/10")}>
            {Icon ? <Icon className="h-5 w-5" /> : <Info className="h-5 w-5" />}
          </div>
          {trendValue && (
            <div className={cn("flex items-center px-2 py-1 rounded-full text-xs font-bold", trendColor)}>
              <TrendIcon className="h-3 w-3 mr-1" />
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formattedValue}</h3>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * AnalyticsChart
 * Widget genérico para gráficos (Área ou Barra).
 */
export const AnalyticsChart = ({ title, description, data, type = 'area', dataKeys = ['value'], colors = ['#2563EB'], loading, height = 350 }) => {
  if (loading) return <Skeleton className={`w-full rounded-xl`} style={{ height }} />;

  return (
    <Card className="h-full shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-800">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height: height - 80, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'area' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {colors.map((color, index) => (
                    <linearGradient key={index} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Legend />
                {dataKeys.map((key, index) => (
                  <Area 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    stroke={colors[index % colors.length]} 
                    fillOpacity={1} 
                    fill={`url(#color${index})`} 
                  />
                ))}
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Legend />
                {dataKeys.map((key, index) => (
                  <Bar 
                    key={key}
                    dataKey={key} 
                    fill={colors[index % colors.length]} 
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * AnalyticsTable
 * Widget para exibição tabular simples de dados.
 */
export const AnalyticsTable = ({ title, data, columns, loading }) => {
  if (loading) return <Skeleton className="h-[350px] w-full rounded-xl" />;

  return (
    <Card className="h-full shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[300px]">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0">
              <TableRow>
                {columns.map((col, i) => (
                  <TableHead key={i} className={cn(col.className, "text-slate-700 font-semibold")}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50/50">
                    {columns.map((col, cIdx) => (
                      <TableCell key={cIdx} className={col.cellClassName || col.className}>
                        {col.render ? col.render(row) : row[col.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground h-24">
                    Sem dados disponíveis
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};