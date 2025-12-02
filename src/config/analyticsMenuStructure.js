// Configuração centralizada do Menu e Estrutura do Analytics
export const analyticsMenuStructure = {
  id: 'analytics',
  label: 'Analytics',
  icon: 'BarChart3',
  color: '#DC2626', // Vermelho Costa Lavos
  groups: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      pages: [
        { 
          id: 'dashboard-gerencial', 
          label: 'Dashboard Gerencial', 
          path: 'dashboard-gerencial', 
          icon: 'LayoutDashboard',
          rpc: 'get_dashboard_and_daily_sales_kpis',
          mockData: {
            kpis: [
              { title: 'Vendas Totais', value: 1250450, trend: 'up', trendValue: '12%' },
              { title: 'Pedidos', value: 450, trend: 'down', trendValue: '-5%' }
            ],
            salesData: []
          }
        },
        { 
          id: 'visao-360-cliente', 
          label: 'Visão 360° Cliente', 
          path: 'visao-360-cliente', 
          icon: 'Search',
          rpc: 'get_client_360_data'
        },
        { id: 'analitico-supervisor', label: 'Analítico Supervisor', path: 'analitico-supervisor', icon: 'TrendingUp' },
        { id: 'analitico-vendedor', label: 'Analítico Vendedor', path: 'analitico-vendedor', icon: 'User' },
        { id: 'analitico-regiao', label: 'Analítico Região', path: 'analitico-regiao', icon: 'Map' },
        { id: 'analitico-grupo-clientes', label: 'Analítico Grupos', path: 'analitico-grupo-clientes', icon: 'Users2' },
        { id: 'analitico-produto', label: 'Analítico Produtos', path: 'analitico-produto', icon: 'Package' },
        { id: 'analitico-vendas-diarias', label: 'Vendas Diárias', path: 'analitico-vendas-diarias', icon: 'Calendar' },
      ]
    },
    {
      id: 'analises',
      label: 'Análises',
      pages: [
        { id: 'analise-churn', label: 'Análise Churn', path: 'analise-churn', icon: 'AlertCircle' },
        { id: 'analise-rfm', label: 'Análise RFM', path: 'analise-rfm', icon: 'PieChart' },
        { id: 'analise-abc-produtos', label: 'Curva ABC Produtos', path: 'analise-abc-produtos', icon: 'BarChart3' },
        { id: 'analise-abc-clientes', label: 'Curva ABC Clientes', path: 'analise-abc-clientes', icon: 'Users' },
        { id: 'analise-sazonalidade', label: 'Sazonalidade', path: 'analise-sazonalidade', icon: 'Calendar' },
        { id: 'analise-margem-lucro', label: 'Margem & Lucro', path: 'analise-margem-lucro', icon: 'DollarSign' },
        { id: 'analise-ticket-medio', label: 'Ticket Médio', path: 'analise-ticket-medio', icon: 'TrendingUp' },
        { id: 'analise-preditiva', label: 'Análise Preditiva', path: 'analise-preditiva', icon: 'Zap' },
      ]
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      subgroups: [
        {
          label: 'Financeiro',
          pages: [
            { id: 'relatorio-financeiro-receita', label: 'Receita', path: 'relatorio-financeiro-receita', icon: 'DollarSign' },
            { id: 'relatorio-financeiro-margem', label: 'Margem', path: 'relatorio-financeiro-margem', icon: 'BarChart3' },
            { id: 'relatorio-financeiro-lucratividade', label: 'Lucratividade', path: 'relatorio-financeiro-lucratividade', icon: 'TrendingUp' },
          ]
        },
        {
          label: 'Desempenho',
          pages: [
            { id: 'relatorio-desempenho-meta', label: 'Metas', path: 'relatorio-desempenho-meta', icon: 'Target' },
            { id: 'relatorio-desempenho-ranking', label: 'Ranking', path: 'relatorio-desempenho-ranking', icon: 'Award' },
          ]
        },
        {
          label: 'Operacional',
          pages: [
            { id: 'relatorio-operacional-sla', label: 'SLA', path: 'relatorio-operacional-sla', icon: 'Activity' },
          ]
        }
      ]
    }
  ]
};