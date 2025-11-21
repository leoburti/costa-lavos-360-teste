import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const Client360AnalysisTab = ({ data }) => {
  if (!data || !data.twelve_month_analysis || data.twelve_month_analysis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl">
        <AlertTriangle className="h-10 w-10 text-yellow-500 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Dados Insuficientes</h3>
        <p className="text-muted-foreground">
          Não há histórico suficiente (12 meses) para gerar a análise completa deste cliente.
        </p>
      </div>
    );
  }

  // Sort data chronologically for charts
  const chartData = [...data.twelve_month_analysis].sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas vs Bonificações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Histórico de Vendas e Bonificações (12 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${month}/${year.slice(2)}`;
                    }}
                  />
                  <YAxis tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => {
                       const [year, month] = label.split('-');
                       return `${month}/${year}`;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="products_value" name="Vendas Líquidas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bonification_value" name="Bonificações" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Movimentação de Equipamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Movimentação de Equipamentos (12 Meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${month}/${year.slice(2)}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => {
                       const [year, month] = label.split('-');
                       return `${month}/${year}`;
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="equipment_movement" name="Valor Equipamentos" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Detalhamento Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Mês</th>
                  <th className="px-4 py-3 text-right">Vendas (Qtd)</th>
                  <th className="px-4 py-3 text-right">Vendas (R$)</th>
                  <th className="px-4 py-3 text-right">Bonificações (R$)</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Equipamentos (R$)</th>
                </tr>
              </thead>
              <tbody>
                {[...chartData].reverse().map((row, index) => (
                  <tr key={row.month} className="border-b border-border hover:bg-muted/5 last:border-0">
                    <td className="px-4 py-3 font-medium">{row.month}</td>
                    <td className="px-4 py-3 text-right">{row.products_quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-blue-600">{formatCurrency(row.products_value)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(row.bonification_value)}</td>
                    <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(row.equipment_movement)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Client360AnalysisTab;