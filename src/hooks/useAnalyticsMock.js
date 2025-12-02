import { useMemo } from 'react';

export const useAnalyticsMock = () => {
  // Dashboard Gerencial Mocks
  const dashboardGerencial = useMemo(() => ({
    kpis: [
      { title: 'Vendas Totais', value: 1250450, trend: 'up', trendValue: '12%', format: 'currency' },
      { title: 'Crescimento YoY', value: 15.4, trend: 'up', trendValue: '2.1%', format: 'percentage' },
      { title: 'Ticket Médio', value: 4500, trend: 'neutral', trendValue: '0%', format: 'currency' },
      { title: 'Pedidos', value: 278, trend: 'up', trendValue: '5%', format: 'number' },
      { title: 'Conversão', value: 68.5, trend: 'down', trendValue: '1.2%', format: 'percentage' },
      { title: 'Margem Est.', value: 437657, trend: 'up', trendValue: '8%', format: 'currency' },
      { title: 'ROI Bonif.', value: 18.2, trend: 'up', trendValue: '0.5%', format: 'number' },
      { title: 'Eficiência', value: 98.5, trend: 'up', trendValue: '1%', format: 'percentage' },
      { title: 'Clientes Ativos', value: 145, trend: 'up', trendValue: '3', format: 'number' },
      { title: 'Equip. Entregue', value: 12, trend: 'neutral', trendValue: '0', format: 'number' },
      { title: 'Bonificação', value: 68500, trend: 'down', trendValue: '5%', format: 'currency' },
      { title: 'Projeção', value: 1450000, trend: 'up', trendValue: '10%', format: 'currency' },
    ],
    salesData: [
      { name: 'Jan', receita: 98000, bonificacao: 5000 },
      { name: 'Fev', receita: 110000, bonificacao: 6000 },
      { name: 'Mar', receita: 105000, bonificacao: 5500 },
      { name: 'Abr', receita: 120000, bonificacao: 7000 },
      { name: 'Mai', receita: 135000, bonificacao: 8000 },
      { name: 'Jun', receita: 128000, bonificacao: 6500 },
    ],
    rankingData: [
      { rank: 1, name: 'Carlos Silva', sales: 150000, growth: 12 },
      { rank: 2, name: 'Ana Souza', sales: 142000, growth: 8 },
      { rank: 3, name: 'Pedro Santos', sales: 135000, growth: 15 },
      { rank: 4, name: 'Maria Oliveira', sales: 120000, growth: 5 },
      { rank: 5, name: 'João Ferreira', sales: 110000, growth: -2 },
    ]
  }), []);

  // Funil Vendas Mock
  const funilVendas = useMemo(() => [
    { name: 'Leads', value: 1000 },
    { name: 'Qualificados', value: 600 },
    { name: 'Proposta', value: 300 },
    { name: 'Negociação', value: 150 },
    { name: 'Fechado', value: 80 },
  ], []);

  // Radar Oportunidades Mock
  const radarOportunidades = useMemo(() => [
    { subject: 'Novos Negócios', A: 120, B: 110, fullMark: 150 },
    { subject: 'Upsell', A: 98, B: 130, fullMark: 150 },
    { subject: 'Retenção', A: 86, B: 130, fullMark: 150 },
    { subject: 'Mix Produtos', A: 99, B: 100, fullMark: 150 },
    { subject: 'Margem', A: 85, B: 90, fullMark: 150 },
    { subject: 'Satisfação', A: 65, B: 85, fullMark: 150 },
  ], []);

  // Previsão Vendas Mock
  const previsaoVendas = useMemo(() => [
    { name: 'Semana 1', real: 4000, previsto: 4200 },
    { name: 'Semana 2', real: 3000, previsto: 3800 },
    { name: 'Semana 3', real: 5000, previsto: 4500 },
    { name: 'Semana 4', real: null, previsto: 4800 },
    { name: 'Semana 5', real: null, previsto: 5000 },
  ], []);

  // Comparativo Vendedores
  const comparativoVendedores = useMemo(() => ({
    data: [
        { subject: 'Vendas', A: 80, B: 90 },
        { subject: 'Mix', A: 70, B: 60 },
        { subject: 'Ticket', A: 90, B: 75 },
        { subject: 'Visitas', A: 60, B: 80 },
        { subject: 'Conversão', A: 75, B: 70 },
    ],
    table: [
        { nome: 'Vendedor A', vendas: 150000, crescimento: 12, ticket: 4500, conversao: 68 },
        { nome: 'Vendedor B', vendas: 142000, crescimento: 8, ticket: 4200, conversao: 65 },
    ]
  }), []);

  return {
    dashboardGerencial,
    funilVendas,
    radarOportunidades,
    previsaoVendas,
    comparativoVendedores
  };
};